from queue import PriorityQueue

from flask import Blueprint, render_template, request, flash
from .models import mycursor, db

views = Blueprint('views', __name__)


def resetDijkstraTable():
    mycursor.execute("delete from `dijistra`")
    db.commit()
    mycursor.execute("select * from `distance`")
    data = mycursor.fetchall()
    for row in data:
        mycursor.execute("insert into `dijkstra` value (%s,%s,%s,%s)", (row[0], row[1], row[2], row[0]))
        mycursor.execute("insert into `dijkstra` value (%s,%s,%s,%s)", (row[1], row[0], row[2], row[1]))
    db.commit()
def getDistance(p1, p2):
    mycursor.execute("select `distance` from `distance` where `id1`=%s and `id2`=%s", (min(p1, p2), max(p1, p2)))
    return mycursor.fetchone()[0]

def getDistanceBetween2Points(id1, id2):
    if id1 == id2:
        return [0, []]
    mycursor.execute("select `minDistance` from `dijkstra` where `id1`=(%s) and `id2`=(%s)", (id1, id2))
    ans = mycursor.fetchone()
    if not ans:
        mycursor.execute("select Count(*) from `points`")
        data = mycursor.fetchone()
        pq = PriorityQueue()
        finished = [False] * (data[0] + 1)
        isMin = [False] * (data[0] + 1)
        kc = [(0, 0, 0)]  # (curMinKc, thisID, trackingID)
        for i in range(data[0]):
            kc.append((1000000, i + 1, -1))
        kc[id1] = (0, id1, 0)
        finished[id1] = True
        isMin[id1] = True
        mycursor.execute("select * from `dijkstra` where `id1`=%s", (id1, ))
        data = mycursor.fetchall()
        for k in data:
            kc[k[1]] = (k[2], k[1], k[3])
            pq.put(kc[k[1]])
            isMin[k[1]] = True

        while not pq.empty():
            cur = pq.get()
            if finished[cur[1]]:
                continue
            finished[cur[1]] = True
            oldaim = cur[1]
            aim = cur[2]
            minkc = 0
            while aim != 0:
                minkc += getDistance(aim, oldaim)
                mycursor.execute("insert ignore into `dijkstra` value (%s, %s, %s, %s)",
                                 (cur[1], aim, minkc, oldaim))
                mycursor.execute("insert ignore into `dijkstra` value (%s, %s, %s, %s)",
                                 (aim, cur[1], minkc, cur[2]))
                oldaim = aim
                aim = kc[aim][2]
            db.commit()

            if cur[1] == id2:
                trackingList = []
                aim = id2
                while aim != id1:
                    aim = kc[aim][2]
                    trackingList.append(aim)
                return [cur[0], trackingList]

            mycursor.execute("select * from `distance` where `id1`=%s or `id2`=%s", (cur[1], cur[1]))
            data = mycursor.fetchall()
            for i in data:
                remainID = i[0]
                if i[0] == cur[1]:
                    remainID = i[1]
                if finished[remainID] or isMin[remainID]:
                    continue
                if kc[remainID][0] > kc[cur[1]][0] + i[2]:
                    kc[remainID] = (kc[cur[1]][0] + i[2], remainID, cur[1])
                    pq.put(kc[remainID])
        return -1
    # calculated
    trackingList = []
    aim = id2
    while aim != id1:
        mycursor.execute("select * from `dijkstra` where id1=%s and id2=%s", (id1, aim))
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
        if request.form['submit_button'] == 'Search':
            idStartPlace = request.form['startPlace']
            idEndPlace = request.form['endPlace']
            if not idStartPlace or not idEndPlace:
                return render_template('index.html', placeNames=placeNames, showedPlaceList=showedPlaceList)
            idStartPlace = int(idStartPlace)
            idEndPlace = int(idEndPlace)
            getDistance = getDistanceBetween2Points(idStartPlace, idEndPlace)
            distance = getDistance[0]
            trackingList = getDistance[1]

            mycursor.execute("select Count(*) from `dijkstra`")
            dbsize = mycursor.fetchone()[0]
            return render_template('index.html', placeNames=placeNames, showedPlaceList=showedPlaceList, dbsize=dbsize,
                                   idStartPlace=idStartPlace, idEndPlace=idEndPlace, distance=distance, trackingList=trackingList)

        elif request.form['submit_button'] == 'Reset Dijkstra database':
            resetDijkstraTable()
            flash('Reset Dijkstra database successfully!')
            return render_template('index.html', placeNames=placeNames, showedPlaceList=showedPlaceList)

    if request.method == 'GET':
        return render_template('index.html', placeNames=placeNames, showedPlaceList=showedPlaceList)

    return render_template('index.html')
