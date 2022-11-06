from flask import Blueprint, render_template, request
from .models import mycursor
import json

from .findroad import *
from .findbuilding import getBuildingList
from .findschedule import getSubjectList, getTimeTable


views = Blueprint('views', __name__)
road = Road()


@views.route('/find_path/', methods=['POST'])
def findPath():
    name1, name2 = request.json['name1'], request.json['name2']

    # Get id from name
    mycursor.execute("select `id` from `points` where `name` = %s", (name1,))
    data = mycursor.fetchone()
    startID = int(str(data[0]))

    mycursor.execute("select `id` from `points` where `name` = %s", (name2,))
    data = mycursor.fetchone()
    endID = int(str(data[0]))

    road.calculate(startID, endID)

    mycursor.execute("select Count(*) from `dijkstra`")
    dbSize = mycursor.fetchone()[0]

    return json.dumps([road.posList, round(road.distance, 3), dbSize], cls=DecimalEncoder)


@views.route('/post_place/<name>', methods=['POST'])
def postPlace(name):
    # Get id from name
    mycursor.execute("select `id`, `main` from `points` where `name` = %s", (name,))
    data = mycursor.fetchone()
    thisPlaceId = int(str(data[0]))

    # Add visit site
    if thisPlaceId is road.placesByTime[0] or thisPlaceId is road.placesByTime[-1]:
        return json.dumps([])

    if (data[1] == 2):
        mycursor.execute("select `main` from `points` where `id` = %s", (road.placesByTime[0],))
        if mycursor.fetchone()[0] == 2:
            road.calculate(thisPlaceId, road.placesByTime[-1])

        mycursor.execute("select `main` from `points` where `id` = %s", (road.placesByTime[-1],))
        if mycursor.fetchone()[0] == 2:
            road.calculate(road.placesByTime[0], thisPlaceId)

    # Add or remove id from placesByTime, update distance
    if thisPlaceId not in road.placesByTime:
        road.addPlace(thisPlaceId)
    else:
        road.removePlace(thisPlaceId)

    mycursor.execute("select Count(*) from `dijkstra`")
    dbSize = mycursor.fetchone()[0]

    return json.dumps([road.posList, round(road.distance, 3), dbSize], cls=DecimalEncoder)

    
@views.route('/', methods=['GET', 'POST'])
def home():
    initGlobal()

    showedPlaceList = []
    placeNames = [""]
    initRoad(showedPlaceList, placeNames)

    idStartPlace = idEndPlace = 1
    posList = []
    timeTable = []

    mycursor.execute("SELECT name, posY, posX FROM points WHERE main = 2")
    markerList = mycursor.fetchall()

    if request.method == 'POST':
        if request.form['submit_button'] == 'Search':
            msv = request.form['msv']
            mycursor.execute("SELECT * FROM sinhvien WHERE MSV = (%s)", (msv,))
            data = mycursor.fetchone()
            if data:
                # Render user's name
                print(data[1])
                subjectList = getSubjectList(msv)
                timeTable = getTimeTable(subjectList)

        # elif request.form['submit_button'] == 'Find path' and request.form['startPlace'] and request.form['endPlace']:
        #     idStartPlace = int(request.form['startPlace'])
        #     idEndPlace = int(request.form['endPlace'])

        #     findroad.placesByTime = [idStartPlace, idEndPlace]
        #     findroad.distance = dijkstra(idStartPlace, idEndPlace)

        #     # Find posList
        #     trackingList = [idEndPlace]
        #     trackingList.extend(getTrackingList())
        #     trackingList.reverse()
        #     posList = [[findroad.posX[i], findroad.posY[i]] for i in trackingList]

        elif request.form['submit_button'] == 'Reset Dijkstra database':
            resetDijkstraTable()
            print('Reset Dijkstra database successfully!')

        elif request.form['submit_button'] == 'Add Location' and request.form['pos1'] and request.form['pos2']:
            newpos = [float(request.form['pos1']), float(request.form['pos2'])]
            if not havePointInDB(newpos):
                nearestRoad(newpos)

    bdListSelect = getBuildingList(idStartPlace, idEndPlace)

    return render_template('index.html', placeNames=placeNames, showedPlaceList=showedPlaceList,
                           distance=round(road.distance, 3),
                           posList=json.dumps(posList, cls=DecimalEncoder), bdListSelect=json.dumps(bdListSelect),
                           timeTable=json.dumps(timeTable), markerList=json.dumps(markerList, cls=DecimalEncoder))

