from flask import Blueprint, render_template, request
from .findroad import *
from .findschedule import *


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


# Add new place to db
@views.route('/add_place/', methods=['POST'])
def addPlace():
    posX, posY = request.json['posX'], request.json['posY']

    newpos = [float(posX), float(posY)]
    if not havePointInDB(newpos):
        initGlobal()
        nearestRoad(newpos)

    return []


@views.route('/find_path/<name1>/<name2>', methods=['GET'])
def findPath(name1, name2):
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

    mycursor.execute("SELECT name, posY, posX, main FROM points WHERE main > 1")
    markerList = mycursor.fetchall()

    mycursor.execute("SELECT * FROM diadiem")
    data = mycursor.fetchall()
    placeList = [x + (False,) for x in data]

    return render_template('index.html', placeNames=placeNames, showedPlaceList=showedPlaceList,
                           placeList=json.dumps(placeList), markerList=json.dumps(markerList, cls=DecimalEncoder))


@views.route('/chart', methods=['GET'])
def chart():
    today = date.today()
    classList = classListFromDate(today)
    return render_template('chart.html', lop=json.dumps(classList[0]), gd=classList[1], week=classList[2])


@views.route('/chart/findSchedule', methods=['POST', 'GET'])
def chartSchedule():
    day = request.json['date'].split('-')
    day = date(int(day[0]), int(day[1]), int(day[2]))
    classList = classListFromDate(day)
    return json.dumps(classList)


@views.route('/get_group_schedule/', methods=['POST'])
def getGroupSchedule():
    msvList = []

    for data in request.json:
        thisMSVList = getMSVList(data['msv'], data['name'], data['birth'], data['courseClass'], data['subjectCode'],
                                 data['subjectName'], data['subjectGroup'], data['credit'], data['note'])
        msvList.extend(x for x in thisMSVList if x not in msvList)

    timeTable = getTimeTableFull(msvList)

    notification = str(len(msvList)) + " students found!"
    return json.dumps([timeTable, notification])


@views.route('/calendar_overlap', methods=['GET', 'POST'])
def calendarOverlap():
    return render_template('calendar_overlap.html')


@views.route('/resetDijkstra/', methods=['GET'])
def resetDijkstra():
    resetDijkstraTable()
    return []
