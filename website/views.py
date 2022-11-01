from flask import Blueprint, render_template, request, flash

from . import findroad
from .findroad import *
from .vnubuilding import getBuildingList
from .models import mycursor
import json
import decimal


class DecimalEncoder(json.JSONEncoder):
    def default(self, o):
        if isinstance(o, decimal.Decimal):
            return str(o)
        return super(DecimalEncoder, self).default(o)


views = Blueprint('views', __name__)


@views.route('/post_place/<name>', methods=['POST'])
def postPlace(name):
    posX = request.json['posX']
    posY = request.json['posY']

    # Get id from name
    mycursor.execute("select `id` from `points` where `name` = %s", (name,))
    thisPlaceId = int(str(mycursor.fetchone()[0]))

    if not thisPlaceId or len(findroad.placesByTime) < 2:
        return None

    # Add or remove id from placesByTime, update distance
    if thisPlaceId not in findroad.placesByTime:
        addPlace(thisPlaceId)
    elif thisPlaceId not in (findroad.placesByTime[0], findroad.placesByTime[len(findroad.placesByTime) - 1]):
        removePlace(thisPlaceId)

    # Update trackingList
    trackingList = [findroad.placesByTime[len(findroad.placesByTime) - 1]]
    trackingList.extend(getTrackingList())
    trackingList.reverse()

    # Find point list from trackingList
    pos = []
    for i in trackingList:
        pos.append([posX[i], posY[i]])

    print("placesByTime: ")
    print(findroad.placesByTime)

    print("trackingList")
    print(trackingList)

    print("distance")
    print(findroad.distance)

    return json.dumps(pos, cls=DecimalEncoder)


@views.route('/', methods=['GET', 'POST'])
def home():
    showedPlaceList = []
    placeNames = [""]
    posX = [0]
    posY = [0]
    initRoad(showedPlaceList, placeNames, posX, posY)
    initGlobal()

    if request.method == 'POST':
        if request.form['submit_button'] == 'Search':
            idStartPlace = int(request.form['startPlace'])
            idEndPlace = int(request.form['endPlace'])

            if not idStartPlace or not idEndPlace:
                return render_template('index.html', placeNames=placeNames, showedPlaceList=showedPlaceList,
                                       clicked=False)

            findroad.placesByTime = [idStartPlace, idEndPlace]
            findroad.distance = getDistanceBetween2Points(idStartPlace, idEndPlace)

            trackingList = [idEndPlace]
            trackingList.extend(getTrackingList())
            trackingList.reverse()

            mycursor.execute("select Count(*) from `dijkstra`")
            dbSize = mycursor.fetchone()[0]

            bdListSelect = getBuildingList(idStartPlace, idEndPlace)

            return render_template('index.html', placeNames=placeNames, showedPlaceList=showedPlaceList, dbSize=dbSize,
                                   idStartPlace=idStartPlace, idEndPlace=idEndPlace, distance=findroad.distance,
                                   trackingList=trackingList, posX=posX, posY=posY, clicked=True,
                                   bdListSelect=json.dumps(bdListSelect))

        elif request.form['submit_button'] == 'Reset Dijkstra database':
            resetDijkstraTable()
            flash('Reset Dijkstra database successfully!')

    bdListSelect = getBuildingList(1, 1)
    return render_template('index.html', placeNames=placeNames, showedPlaceList=showedPlaceList, clicked=False,
                           bdListSelect=json.dumps(bdListSelect))

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
