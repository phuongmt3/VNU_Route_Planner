from queue import PriorityQueue

from flask import Blueprint, render_template, request
from .models import mycursor, db

views = Blueprint('views', __name__)


def getDistanceBetween2Points(id1, id2):
    if id1 == id2:
        return [0, []]
    if id1 > id2:
        return getDistanceBetween2Points(id2, id1)
    mycursor.execute("select `minDistance` from `dijistra` where `id1`=(%s) and `id2`=(%s)", (id1, id2))
    ans = mycursor.fetchone()
    if not ans:
        mycursor.execute("select Count(*) from `points`")
        data = mycursor.fetchone()
        pq = PriorityQueue()
        finished = [False] * (data[0] + 1)
        kc = [(0, 0, 0)]  # (curMinKc, thisID, trackingID)
        for i in range(data[0]):
            kc.append((1000000, i + 1, -1))
        kc[id1] = (0, id1, kc[id1][1])
        pq.put(kc[id1])
        while not pq.empty():
            cur = pq.get()
            if finished[cur[1]]:
                continue
            finished[cur[1]] = True
            if cur[1] != id1:
                fi = min(id1, cur[1])
                se = max(id1, cur[1])
                mycursor.execute("select * from `dijistra` where `id1`=%s and `id2`=%s", (fi, se))
                data = mycursor.fetchone()
                if not data:
                    mycursor.execute("insert into `dijistra` value (%s, %s, %s, %s)",
                                     (fi, se, cur[0], cur[2]))
                    db.commit()
                elif data[2] > cur[0]:
                    mycursor.execute("update `dijistra` set `minDistance`=%s, `trackingID`=%s "
                                     "where `id1`=%s and `id2`=%s", (cur[0], cur[2], fi, se))
                    db.commit()

            if cur[1] == id2:
                trackingList = []
                aim = id2
                while aim != 0:
                    mycursor.execute("select * from `dijistra` where id1=%s and id2=%s", (min(id1, aim), max(id1, aim)))
                    data = mycursor.fetchone()
                    trackingList.append(data[3])
                    aim = data[3]
                return [cur[0], trackingList]
            mycursor.execute("select * from `dijistra` where `id1`=%s or `id2`=%s", (cur[1], cur[1]))
            data = mycursor.fetchall()
            for i in data:
                remainID = i[0]
                if i[0] == cur[1]:
                    remainID = i[1]
                if finished[remainID]:
                    continue
                if kc[remainID][0] > kc[cur[1]][0] + i[2]:
                    kc[remainID] = (kc[cur[1]][0] + i[2], remainID, cur[1])
                    pq.put(kc[remainID])
        return -1
    # calculated
    trackingList = []
    aim = id2
    while aim != 0:
        mycursor.execute("select * from `dijistra` where id1=%s and id2=%s", (min(id1, aim), max(id1, aim)))
        data = mycursor.fetchone()
        trackingList.append(data[3])
        aim = data[3]
    return [ans[0], trackingList]


@views.route('/', methods=['GET', 'POST'])
def home():
    showedPlaceList = []
    placeNames = [""]
    mycursor.execute("select * from `points`")
    data = mycursor.fetchall()
    for d in data:
        if d[2] == 1 or d[2] == 0:
            showedPlaceList.append(d[0])
        #placeNames.append(d[1])
        placeNames.append(d[0])

    if request.method == 'POST':
        idStartPlace = request.form['startPlace']
        idEndPlace = request.form['endPlace']
        if not idStartPlace or not idEndPlace:
            return render_template('index.html', placeNames=placeNames, showedPlaceList=showedPlaceList)
        idStartPlace = int(idStartPlace)
        idEndPlace = int(idEndPlace)
        getDistance = getDistanceBetween2Points(idStartPlace, idEndPlace)
        distance = getDistance[0]
        trackingList = getDistance[1]
        if idEndPlace > idStartPlace:
            trackingList.reverse()
        return render_template('index.html', placeNames=placeNames, showedPlaceList=showedPlaceList,
                               idStartPlace=idStartPlace, idEndPlace=idEndPlace, distance=distance, trackingList=trackingList)

    if request.method == 'GET':
        return render_template('index.html', placeNames=placeNames, showedPlaceList=showedPlaceList)

    return render_template('index.html')
