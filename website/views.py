from flask import Blueprint, render_template, request
from .findroad import *
from .findschedule import *


views = Blueprint('views', __name__)
road = Road()


@views.route('/get_student_schedule/<msv>', methods=['GET'])
def getStudentSchedule(msv):
    timeTable = []
    notification = ''
    msv = int(msv)

    if sinhvien[msv] != '':
        timeTable = getTimeTable(msv)
        notification = "Success Welcome " + sinhvien[msv]
    else:
        notification = "Warning Not found " + str(msv)

    return json.dumps([timeTable, notification])


@views.route('/list_student.json', methods=['GET'])
def getListStudent():
    data = []
    for msv in sinhvien:
        data.append([msv, sinhvien[msv]])

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
    startID = 1
    endID = 1
    for i in range(1, len(points)):
        if points[i][0] == name1:
            startID = i
        if points[i][0] == name2:
            endID = i

    road.reset()
    road.calculate(startID, endID)

    return json.dumps([road.posList, round(road.distance, 3)], cls=DecimalEncoder)


@views.route('/post_place/<name>', methods=['POST'])
def postPlace(name):
    # Get id from name
    thisPlaceId = 0
    for i in range(1, len(points)):
        if points[i][0] == name:
            thisPlaceId = i
            break

    if thisPlaceId == 0 or thisPlaceId is road.placesByTime[0] or thisPlaceId is road.placesByTime[-1]:
        return []

    # Switch gate start/ end
    if points[thisPlaceId][1] == 2:
        startPointID = points[road.placesByTime[0]][1]
        endPointID = points[road.placesByTime[-1]][1]

        if startPointID == 2:
            road.calculate(thisPlaceId, road.placesByTime[-1])
        if endPointID == 2:
            road.calculate(road.placesByTime[0], thisPlaceId)

    if thisPlaceId not in road.placesByTime:
        road.addPlace(thisPlaceId)
    else:
        road.removePlace(thisPlaceId)

    return json.dumps([road.posList, round(road.distance, 3)], cls=DecimalEncoder)


@views.route('/', methods=['GET', 'POST'])
def home():
    initGlobal()

    showedPlaceList = []
    placeNames = [""]
    initRoad(showedPlaceList, placeNames)

    markerList = []
    for p in points:
        if p == 0:
            continue
        markerList.append((p[0], p[2], p[3], p[1]))

    mycursor.execute("SELECT * FROM diadiem")
    data = mycursor.fetchall()
    placeList = [x + (False,) for x in data]

    return render_template('index.html', placeNames=placeNames, showedPlaceList=showedPlaceList,
                           placeList=json.dumps(placeList), markerList=json.dumps(markerList, cls=DecimalEncoder))


@views.route('/timelineChart', methods=['GET'])
def chart():
    today = date.today()
    classList = classListFromDate(today)
    return render_template('timelineChart.html', lop=json.dumps(classList[0]), gd=classList[1], week=classList[2])


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
