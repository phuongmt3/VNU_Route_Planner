from flask import Blueprint, render_template, request

from .findroad import *
from .findschedule import getSubjectList, getTimeTable

views = Blueprint('views', __name__)
road = [Road(), Road(), Road()]
roadNumb = 0


@views.route('/get_student_schedule/<msvList>', methods=['GET'])
def getStudentSchedule(msvList):
    global roadNumb

    timeTableData = []
    message = []

    msvList = msvList.split(',')
    roadNumb = len(msvList)

    for msv in msvList:
        mycursor.execute("SELECT * FROM sinhvien WHERE MSV = (%s)", (msv,))
        data = mycursor.fetchone()
        if data:
            subjectList = getSubjectList(msv)
            timeTable = getTimeTable(subjectList)

            timeTableData.append({"msv": msv, "timeTable": timeTable})
            message.append("Welcome " + data[1])

    return json.dumps({"timeTableData": timeTableData, "message": message})


# Autocomplete
@views.route('/list_student.json', methods=['GET'])
def getListStudent():
    mycursor.execute("select * from sinhvien")
    data = mycursor.fetchall()

    return json.dumps(data, default=str)


# Add a new place to db
@views.route('/add_place/', methods=['POST'])
def addPlace():
    posX, posY = request.json['posX'], request.json['posY']

    newpos = [float(posX), float(posY)]
    if not havePointInDB(newpos):
        initGlobal()
        nearestRoad(newpos)

    return []


@views.route('/reset_roads/', methods=['POST'])
def resetRoads():
    for index in range(roadNumb):
        road[index].reset() 

    return []


@views.route('/find_path/<index>', methods=['POST'])
def findPath(index):
    # index = road number
    index = int(index)
    name1, name2 = request.json['name1'], request.json['name2']

    mycursor.execute("select `id` from `points` where `main` > 0 and `name` = %s", (name1,))
    data = mycursor.fetchone()
    startID = int(str(data[0]))

    mycursor.execute("select `id` from `points` where `main` > 0 and `name` = %s", (name2,))
    data = mycursor.fetchone()
    endID = int(str(data[0]))

    road[index].calculate(startID, endID)

    mycursor.execute("select Count(*) from `dijkstra`")
    dbSize = mycursor.fetchone()[0]

    return json.dumps([road[index].posList, round(road[index].distance, 3), dbSize], cls=DecimalEncoder)


# Post visit place for all members
@views.route('/post_place/<name>', methods=['POST'])
def postPlace(name):
    result = []

    mycursor.execute("select `id`, `main` from `points` where `main` > 0 and `name` = %s", (name,))
    data = mycursor.fetchone()
    thisPlaceId = int(str(data[0]))

    # mycursor.execute("select Count(*) from `dijkstra`")
    # dbSize = mycursor.fetchone()[0]

    for index in range(roadNumb):
        if (thisPlaceId is road[index].placesByTime[0] or thisPlaceId is road[index].placesByTime[-1]):
            result.append([road[index].posList, round(road[index].distance, 3)])
            continue

        # Switch gate start/ end
        if data[1] == 2:
            mycursor.execute("select `main` from `points` where `id` = %s", (road[index].placesByTime[0],))
            if mycursor.fetchone()[0] == 2:
                road[index].calculate(thisPlaceId, road[index].placesByTime[-1])

            mycursor.execute("select `main` from `points` where `id` = %s", (road[index].placesByTime[-1],))
            if mycursor.fetchone()[0] == 2:
                road[index].calculate(road[index].placesByTime[0], thisPlaceId)

        # If not already, visit
        if thisPlaceId not in road[index].placesByTime:
            road[index].addPlace(thisPlaceId)
        # else:
        #     road[index].removePlace(thisPlaceId)

        result.append([road[index].posList, round(road[index].distance, 3)])

    return json.dumps(result, cls=DecimalEncoder)


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

    if request.method == 'POST':
        if request.form['submit_button'] == 'Reset Dijkstra database':
            resetDijkstraTable()
            print('Reset Dijkstra database successfully!')

    return render_template('index.html', placeNames=placeNames, showedPlaceList=showedPlaceList,
                           placeList=json.dumps(placeList),
                           markerList=json.dumps(markerList, cls=DecimalEncoder))
