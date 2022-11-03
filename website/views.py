from flask import Blueprint, render_template, request, flash

from . import findroad
from .findroad import *
from .vnubuilding import getBuildingList
from .models import mycursor
import json


views = Blueprint('views', __name__)


@views.route('/post_place/<name>', methods=['POST'])
def postPlace(name):
    # Get id from name
    mycursor.execute("select `id` from `points` where `name` = %s", (name,))
    thisPlaceId = int(str(mycursor.fetchone()[0]))

    if thisPlaceId is findroad.placesByTime[0] or thisPlaceId is findroad.placesByTime[len(findroad.placesByTime) - 1]:
        return json.dumps([])

    # Add or remove id from placesByTime, update distance
    if thisPlaceId not in findroad.placesByTime:
        addPlace(thisPlaceId)
    else:
        removePlace(thisPlaceId)

    # Find posList
    trackingList = [findroad.placesByTime[len(findroad.placesByTime) - 1]]
    trackingList.extend(getTrackingList())
    trackingList.reverse()
    posList = [[findroad.posX[i], findroad.posY[i]] for i in trackingList]

    mycursor.execute("select Count(*) from `dijkstra`")
    dbSize = mycursor.fetchone()[0]

    return json.dumps([posList, round(findroad.distance, 3), dbSize], cls=DecimalEncoder)


@views.route('/', methods=['GET', 'POST'])
def home():
    initGlobal()

    showedPlaceList = []
    placeNames = [""]
    initRoad(showedPlaceList, placeNames)

    idStartPlace = idEndPlace = 1
    posList = []

    if request.method == 'POST':
        if request.form['submit_button'] == 'Search' and request.form['startPlace'] and request.form['endPlace']:
            idStartPlace = int(request.form['startPlace'])
            idEndPlace = int(request.form['endPlace'])

            findroad.placesByTime = [idStartPlace, idEndPlace]
            findroad.distance = dijkstra(idStartPlace, idEndPlace)

            # Find posList
            trackingList = [idEndPlace]
            trackingList.extend(getTrackingList())
            trackingList.reverse()
            posList = [[findroad.posX[i], findroad.posY[i]] for i in trackingList]

        elif request.form['submit_button'] == 'Reset Dijkstra database':
            resetDijkstraTable()
            flash('Reset Dijkstra database successfully!')

        elif request.form['submit_button'] == 'Add Location' and request.form['pos1'] and request.form['pos2']:
            newpos = [float(request.form['pos1']), float(request.form['pos2'])]
            nearestRoad(newpos)

    bdListSelect = getBuildingList(idStartPlace, idEndPlace)

    return render_template('index.html', placeNames=placeNames, showedPlaceList=showedPlaceList,
                           distance=round(findroad.distance, 3),
                           posList=json.dumps(posList, cls=DecimalEncoder), bdListSelect=json.dumps(bdListSelect))

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
