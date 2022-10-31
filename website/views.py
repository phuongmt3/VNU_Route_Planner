from queue import PriorityQueue

from flask import Blueprint, render_template, request, flash

from website.vnubuilding import getBuildingList
from .models import mycursor, db
import json

import decimal

class DecimalEncoder(json.JSONEncoder):
    def default(self, o):
        if isinstance(o, decimal.Decimal):
            return str(o)
        return super(DecimalEncoder, self).default(o)

views = Blueprint('views', __name__)


def resetDijkstraTable():
    mycursor.execute("delete from `dijkstra`")
    db.commit()
    mycursor.execute("select * from `distance`")
    data = mycursor.fetchall()
    for row in data:
        print(row)
        mycursor.execute("insert into `dijkstra` value (%s,%s,%s,%s)",
                         (row[0], row[1], row[2], row[0]))
        mycursor.execute("insert into `dijkstra` value (%s,%s,%s,%s)",
                         (row[1], row[0], row[2], row[1]))
    db.commit()


def getDistance(p1, p2):
    mycursor.execute(
        "select `distance` from `distance` where `id1`=%s and `id2`=%s", (min(p1, p2), max(p1, p2)))
    data = mycursor.fetchone()
    if not data:
        mycursor.execute(
            "select `distance` from `distance` where `id1`=%s and `id2`=%s", (max(p1, p2), min(p1, p2)))
        data = mycursor.fetchone()
    return data[0]


def getDistanceBetween2Points(id1, id2):
    if id1 == id2:
        return [0, []]
    mycursor.execute(
        "select `minDistance` from `dijkstra` where `id1`=(%s) and `id2`=(%s)", (id1, id2))
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

            mycursor.execute(
                "select * from `distance` where `id1`=%s or `id2`=%s", (cur[1], cur[1]))
            data = mycursor.fetchall()
            for i in data:
                remainID = i[0]
                if i[0] == cur[1]:
                    remainID = i[1]
                if finished[remainID] or isMin[remainID]:
                    continue
                mycursor.execute(
                    "select * from `points` where `id`=%s", (remainID,))
                po = mycursor.fetchone()
                if po[2] == 1 and remainID != id1 and remainID != id2:
                    continue
                if kc[remainID][0] > kc[cur[1]][0] + i[2]:
                    kc[remainID] = (kc[cur[1]][0] + i[2], remainID, cur[1])
                    pq.put(kc[remainID])
        return -1
    # calculated
    trackingList = []
    aim = id2
    while aim != id1:
        mycursor.execute(
            "select * from `dijkstra` where id1=%s and id2=%s", (id1, aim))
        data = mycursor.fetchone()
        trackingList.append(data[3])
        aim = data[3]
    return [ans[0], trackingList]

trackingList = []
showedPlaceList = []
addedList = []
placeNames = [""]
idStartPlace = None
idEndPlace = None
posX = [0]
posY = [0]
mycursor.execute("select * from `points`")
data = mycursor.fetchall()
for d in data:
    if d[2] > 0:
        showedPlaceList.append(d[0])
    placeNames.append(d[1])
    posX.append(d[3])
    posY.append(d[4])


@views.route('/addplace/<name>', methods=['GET'])
def add_place(name):
    global idStartPlace, idEndPlace

    # Get id from name
    mycursor.execute("select `id` from `points` where `name` = %s", (name, ))
    thisId = int(str(mycursor.fetchone()[0]))

    # Add or remove from addedList
    # Todo: sort AddedList to minimize distance
    if thisId not in addedList:
        addedList.append(thisId)
    else:
        addedList.remove(thisId)

    print("AddedList: ")
    print(addedList)

    # Find trackingList
    # Todo: calculate and print distance
    trackingList = []

    if len(addedList) == 0:
        getDistance = getDistanceBetween2Points(idStartPlace, idEndPlace)
        # distance = getDistance[0]
        trackingList.append(idEndPlace)
        trackingList.extend(getDistance[1])

    else:
        getDistance = getDistanceBetween2Points(addedList[len(addedList)-1], idEndPlace)
        # distance = getDistance[0]
        trackingList.append(idEndPlace)
        trackingList.extend(getDistance[1])
        trackingList.pop()

        for i in range(len(addedList)-1, 0, -1):
            getDistance = getDistanceBetween2Points(addedList[i-1], addedList[i])
            # distance = getDistance[0]
            trackingList.append(addedList[i])
            trackingList.extend(getDistance[1])
            trackingList.pop()

        getDistance = getDistanceBetween2Points(idStartPlace, addedList[0])
        # distance = getDistance[0]
        trackingList.append(addedList[0])
        trackingList.extend(getDistance[1])

    trackingList.reverse()  

    # Find points from trackingList
    pos = []
    for i in trackingList:
        pos.append([posX[i], posY[i]])

    return json.dumps(pos, cls=DecimalEncoder)


@views.route('/', methods=['GET', 'POST'])
def home():
    global idStartPlace, idEndPlace, trackingList

    if request.method == 'POST':
        addedList.clear()

        if request.form['submit_button'] == 'Search':

            idStartPlace = int(request.form['startPlace'])
            idEndPlace = int(request.form['endPlace'])

            if not idStartPlace or not idEndPlace:
                return render_template('index.html', placeNames=placeNames, showedPlaceList=showedPlaceList, clicked=False)
            
            getDistance = getDistanceBetween2Points(idStartPlace, idEndPlace)
            distance = getDistance[0]
            trackingList = getDistance[1]
            trackingList.insert(0, idEndPlace)
            trackingList.reverse()  

            mycursor.execute("select Count(*) from `dijkstra`")
            dbsize = mycursor.fetchone()[0]

            bdListSelect = getBuildingList(idStartPlace, idEndPlace)

            return render_template('index.html', placeNames=placeNames, showedPlaceList=showedPlaceList, dbsize=dbsize,
                                   idStartPlace=idStartPlace, idEndPlace=idEndPlace, distance=distance,
                                   trackingList=trackingList, posX=posX, posY=posY, clicked=True, bdListSelect=json.dumps(bdListSelect))

        elif request.form['submit_button'] == 'Reset Dijkstra database':
            resetDijkstraTable()
            flash('Reset Dijkstra database successfully!')
            return render_template('index.html', placeNames=placeNames, showedPlaceList=showedPlaceList, clicked=False)

    return render_template('index.html', placeNames=placeNames, showedPlaceList=showedPlaceList, clicked=False)


# @views.route('/', methods=['GET', 'POST'])
# def oldHome():
#     if request.method == "POST":
#         msv = request.form['msv']
#         mycursor.execute("SELECT * FROM sinhvien WHERE MSV = (%s)", (msv,))
#         data = mycursor.fetchone()
#         if not data:
#             return render_template('index.html', hello="Not found student!")
#         name = data[1]
#         birthdate = data[2]
#         class_name = data[3]
#         gender = data[4]
#         birthplace = data[5]
#         mycursor.execute("SELECT * FROM dangky WHERE MSV = (%s)", (msv,))
#         data = mycursor.fetchall()
#         subjectList = []
#         for row in data:
#             LMH = row[1]
#             orgLMH = LMH[:7]
#             group = row[2]
#             note = row[3]
#             mycursor.execute(
#                 "SELECT * FROM monhoc WHERE Mã_LHP = (%s)", (orgLMH,))
#             data2 = mycursor.fetchone()
#             LMHName = data2[1]
#             TC = data2[2]
#             mycursor.execute(
#                 "SELECT * FROM lopmonhoc WHERE Mã_LHP = (%s) AND (Nhóm = 'CL' OR Nhóm = (%s))", (LMH, group))
#             data3 = mycursor.fetchall()
#             for line in data3:
#                 subjectList.append(ClassInfor(LMH, LMHName, line[1], TC, note,
#                                               line[2], line[3], line[4], line[5], line[6], line[7]))
#         return render_template('index.html', hello="Hello " + name, msv=msv, name=name,
#                                birthdate=birthdate, class_name=class_name, gender=gender,
#                                birthplace=birthplace, subjectList=subjectList)
