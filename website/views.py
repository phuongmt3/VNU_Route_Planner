from flask import Blueprint, render_template, request

from .findroad import *
from .findschedule import getSubjectList, getTimeTable

views = Blueprint('views', __name__)
road = Road()


@views.route('/get_student_schedule/<msv>', methods=['GET'])
def getStudentSchedule(msv):
    timeTable = []
    notification = ''

    mycursor.execute("SELECT * FROM sinhvien WHERE MSV = (%s)", (msv,))
    data = mycursor.fetchone()
    if data:
        subjectList = getSubjectList(msv)
        timeTable = getTimeTable(subjectList)
        notification = "Success Welcome " + data[1]
    else:
        notification = "Warning Not found " + msv

    return json.dumps([timeTable, notification])


@views.route('/list_student.json', methods=['GET'])
def getListStudent():
    mycursor.execute("select MSV, Tên from sinhvien")
    data = mycursor.fetchall()

    return json.dumps(data, default=str)


@views.route('/add_place/', methods=['POST'])
def addPlace():
    posX, posY = request.json['posX'], request.json['posY']

    newpos = [float(posX), float(posY)]
    if not havePointInDB(newpos):
        initGlobal()
        nearestRoad(newpos)

    return []


@views.route('/find_path/', methods=['POST'])
def findPath():
    name1, name2 = request.json['name1'], request.json['name2']

    # Get id from name
    mycursor.execute("select `id` from `points` where `main` > 0 and `name` = %s", (name1,))
    data = mycursor.fetchone()
    if not data:
        return []
    startID = int(str(data[0]))

    mycursor.execute("select `id` from `points` where `main` > 0 and `name` = %s", (name2,))
    data = mycursor.fetchone()
    if not data:
        return []
    endID = int(str(data[0]))

    road.reset()
    road.calculate(startID, endID)

    mycursor.execute("select Count(*) from `dijkstra`")
    dbSize = mycursor.fetchone()[0]

    return json.dumps([road.posList, round(road.distance, 3), dbSize], cls=DecimalEncoder)


@views.route('/post_place/<name>', methods=['POST'])
def postPlace(name):
    # Get id from name
    mycursor.execute("select `id`, `main` from `points` where `main` > 0 and `name` = %s", (name,))
    data = mycursor.fetchone()
    thisPlaceId = int(str(data[0]))

    if thisPlaceId is road.placesByTime[0] or thisPlaceId is road.placesByTime[-1]:
        return []

    # Switch gate start/ end
    if data[1] == 2:
        mycursor.execute("select `main` from `points` where `id` = %s", (road.placesByTime[0],))
        if mycursor.fetchone()[0] == 2:
            road.calculate(thisPlaceId, road.placesByTime[-1])

        mycursor.execute("select `main` from `points` where `id` = %s", (road.placesByTime[-1],))
        if mycursor.fetchone()[0] == 2:
            road.calculate(road.placesByTime[0], thisPlaceId)

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

    timeTable = []
    msv = 0

    mycursor.execute("SELECT name, posY, posX, main FROM points WHERE main > 1")
    markerList = mycursor.fetchall()

    mycursor.execute("SELECT * FROM diadiem")
    data = mycursor.fetchall()
    placeList = [x + (False,) for x in data]

    if request.method == 'POST':
        if request.form['submit_button'] == 'Reset Dijkstra database':
            resetDijkstraTable()
            print('Reset Dijkstra database successfully!')

    return render_template('index.html', placeNames=placeNames, showedPlaceList=showedPlaceList,
                           placeList=json.dumps(placeList),
                           markerList=json.dumps(markerList, cls=DecimalEncoder))


@views.route('/resetDijkstra/', methods=['GET'])
def resetDijkstra():
    resetDijkstraTable()
    return []
