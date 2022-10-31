from queue import PriorityQueue

from flask import Blueprint, render_template, request, flash
from .models import mycursor, db
import json

views = Blueprint('views', __name__)


def resetDijkstraTable():
    mycursor.execute("delete from `dijkstra`")
    db.commit()
    mycursor.execute("select * from `distance`")
    data = mycursor.fetchall()
    for row in data:
        mycursor.execute("insert into `dijkstra` value (%s,%s,%s,%s)", (row[0], row[1], row[2], row[0]))
        mycursor.execute("insert into `dijkstra` value (%s,%s,%s,%s)", (row[1], row[0], row[2], row[1]))
    db.commit()
def getDistance(p1, p2):
    mycursor.execute("select `distance` from `distance` where `id1`=%s and `id2`=%s", (p1, p2))
    data = mycursor.fetchone()
    if not data:
        mycursor.execute("select `distance` from `distance` where `id1`=%s and `id2`=%s", (p2, p1))
        data = mycursor.fetchone()
    return data[0]

def getDistanceBetween2Points(id1, id2):
    # return [minDistance, trackingList]
    if id1 == id2:
        return [0, []]

    mycursor.execute("select `minDistance` from `dijkstra` where `id1`=(%s) and `id2`=(%s)", (id1, id2))
    ans = mycursor.fetchone()

    if not ans:
        # if not yet have answer
        mycursor.execute("select Count(*) from `points`")
        data = mycursor.fetchone()
        pq = PriorityQueue()
        finished = [False] * (data[0] + 1)
        isMin = [False] * (data[0] + 1)  # to not rerun the old roads when min distance is reached in previous steps
        kc = [(0, 0, 0)]  # (curMinKc, thisID, trackingID)

        for i in range(data[0]):
            kc.append((1000000, i + 1, -1))
        kc[id1] = (0, id1, 0)
        finished[id1] = True
        isMin[id1] = True

        # put all adjacent places of startID into pq
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

            # save calculated min roads into dijkstra table
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
                # meet endPlace
                trackingList = []
                aim = id2
                while aim != id1:
                    aim = kc[aim][2]
                    trackingList.append(aim)
                return [cur[0], trackingList]

            # add nextID to pq
            mycursor.execute("select * from `distance` where `id1`=%s or `id2`=%s", (cur[1], cur[1]))
            data = mycursor.fetchall()
            for i in data:
                nextID = i[0]
                if i[0] == cur[1]:
                    nextID = i[1]
                if finished[nextID] or isMin[nextID]:
                    continue

                # check if nextID is a main place or not
                mycursor.execute("select * from `points` where `id`=%s", (nextID,))
                po = mycursor.fetchone()
                if po[2] == 1 and nextID != id1 and nextID != id2:
                    continue

                if kc[nextID][0] > kc[cur[1]][0] + i[2]:
                    kc[nextID] = (kc[cur[1]][0] + i[2], nextID, cur[1])
                    pq.put(kc[nextID])
        return -1

    # if answer is already existed
    trackingList = []
    aim = id2
    while aim != id1:
        mycursor.execute("select * from `dijkstra` where id1=%s and id2=%s", (id1, aim))
        data = mycursor.fetchone()
        trackingList.append(data[3])
        aim = data[3]
    return [ans[0], trackingList]


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


@views.route('/', methods=['GET', 'POST'])
def findroad():
    # Building list
    mycursor.execute("SELECT * FROM toanha")
    bdListFull = mycursor.fetchall()

    bdListSelect = []
    ###############

    if request.method == 'POST':
        if request.form['submit_button'] == 'Search':
            global idStartPlace, idEndPlace
            idStartPlace = request.form['startPlace']
            idEndPlace = request.form['endPlace']
            if not idStartPlace or not idEndPlace:
                for x in bdListFull:
                    bdListSelect += [x + (0,)]
                return render_template('index.html', placeNames=placeNames, showedPlaceList=showedPlaceList,
                                       clicked=False, bdListSelect=json.dumps(bdListSelect))
            idStartPlace = int(idStartPlace)
            idEndPlace = int(idEndPlace)

            distanceAns = getDistanceBetween2Points(idStartPlace, idEndPlace)
            distance = distanceAns[0]
            trackingList = distanceAns[1]
            # trackingList.pop()
            trackingList.insert(0, idEndPlace)

            mycursor.execute("select Count(*) from `dijkstra`")
            dbSize = mycursor.fetchone()[0]

            # Building's name
            bdNames = []

            mycursor.execute("select `name` from `points` where `id`=%s", (idStartPlace, ))
            bdNames.append(mycursor.fetchone()[0])

            mycursor.execute("select `name` from `points` where `id`=%s", (idEndPlace, ))
            bdNames.append(mycursor.fetchone()[0])

            for x in bdListFull:
                if x[0] in bdNames:
                    bdListSelect += [x + (1,)]
                else:
                    bdListSelect += [x + (0,)]
            ##################

            return render_template('index.html', placeNames=placeNames, showedPlaceList=showedPlaceList, dbsize=dbSize,
                                   idStartPlace=idStartPlace, idEndPlace=idEndPlace, distance=distance,
                                   trackingList=trackingList, posX=posX, posY=posY, clicked=True, addedList=addedList,
                                   bdListSelect=json.dumps(bdListSelect))

        elif request.form['submit_button'] == 'Reset Dijkstra database':
            resetDijkstraTable()
            flash('Reset Dijkstra database successfully!')

        elif request.form['submit_button'] == 'Add Place':
            for x in bdListFull:
                bdListSelect += [x + (0,)]

            addPlaceId = request.form['addPlace']
            if not addPlaceId or not idStartPlace or not idEndPlace:
                return render_template('index.html', placeNames=placeNames, showedPlaceList=showedPlaceList,
                                       clicked=False, bdListSelect=json.dumps(bdListSelect))
            addPlaceId = int(addPlaceId)
            addedList.append(addPlaceId)
            # function calculate way
            return render_template('index.html', placeNames=placeNames, showedPlaceList=showedPlaceList, clicked=False,
                                   addedList=addedList, idStartPlace=idStartPlace, idEndPlace=idEndPlace,
                                   bdListSelect=json.dumps(bdListSelect))

    for x in bdListFull:
        bdListSelect += [x + (0,)]

    if request.method == 'GET':
        bdListSelect = [x + (0,) for x in bdListFull]
        return render_template('index.html', placeNames=placeNames, showedPlaceList=showedPlaceList, clicked=False,
                               bdListSelect=json.dumps(bdListSelect))

    return render_template('index.html', placeNames=placeNames, showedPlaceList=showedPlaceList, clicked=False,
                           bdListSelect=json.dumps(bdListSelect))


# @views.route('/map', methods=['GET', 'POST'])
# def my_map():
#     mycursor.execute("SELECT * FROM toanha")
#     bdListFull = mycursor.fetchall()

#     bdListSelect = []
#     if request.method == "POST":
#         bdNames = request.form['bdName'].upper()
#         for x in bdListFull:
#             if x[0] in bdNames:
#                 bdListSelect += [x + (1,)]
#             else:
#                 bdListSelect += [x + (0,)]
#     else:
#         bdListSelect = [x + (0,) for x in bdListFull]

#     return render_template('map_test.html', bdListSelect=json.dumps(bdListSelect))

# @views.route('/', methods=['GET', 'POST'])
# def home():
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
