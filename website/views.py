from flask import Blueprint, render_template, request, flash
from datetime import datetime

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


@views.route('/viewbydate', methods=['GET', 'POST'])
def viewbydate():
    totWeeks, rows, cols = (15, 12, 6)
    arr = [[[' ' for j in range(cols)] for i in range(rows)] for k in range(totWeeks)]
    d1 = datetime.strptime("2022/08/29", "%Y/%m/%d")
    d2 = datetime.now()
    curWeek = int((d2 - d1).days / 7) 
    curDay = (d2 - d1).days % 7
    timestamp = ""
    if (curDay == 8):
        timestamp += "Chủ nhật"
    else:
        timestamp += "Thứ " + str(curDay + 2)
    timestamp += " Tuần " + str(curWeek + 1)
    if request.method == "POST":
        msv = request.form['msv']
        mycursor.execute("SELECT * FROM sinhvien WHERE MSV = (%s)", (msv,))
        data = mycursor.fetchone()
        if not data:
            return render_template('index.html', hello="Not found student!"
                                    , arr=arr, curWeek=curWeek, curDay=curDay, timestamp = timestamp)
        name = data[1]
        mycursor.execute("SELECT * FROM dangky WHERE MSV = (%s)", (msv,))
        dataFromDangky = mycursor.fetchall()
        subjectList = []
        for itemDangky in dataFromDangky:
            HP = itemDangky[1]
            LHP = itemDangky[2]
            LMH = HP + ' ' + LHP 
            group = itemDangky[3]
            note = itemDangky[4]
            mycursor.execute("SELECT * FROM monhoc WHERE Mã_HP = (%s)", (HP,))
            dataFromMonhoc = mycursor.fetchone()
            LMHName = dataFromMonhoc[1]
            TC = dataFromMonhoc[2]
            mycursor.execute("SELECT * FROM lopmonhoc WHERE Mã_HP = (%s) AND Mã_LHP = (%s) AND (Nhóm = 'CL' OR Nhóm = (%s))"
                             , (HP, LHP, group))
            dataFromLopmonhoc = mycursor.fetchall()
            for itemLopmonhoc in dataFromLopmonhoc:
                mycursor.execute("SELECT * FROM giangvien WHERE ID_Giangvien = (%s) OR ID_Giangvien = (%s)"
                             , (itemLopmonhoc[-1], itemLopmonhoc[-2]))
                dataFromGiangvien = mycursor.fetchall()
                lecturers = ""
                group = itemLopmonhoc[2]
                week = itemLopmonhoc[3]
                day = itemLopmonhoc[4]
                time = itemLopmonhoc[5]
                place = itemLopmonhoc[6] + '-' + itemLopmonhoc[7]
                totStudents = itemLopmonhoc[8]
                for itemGiangvien in dataFromGiangvien:
                    lecturers += itemGiangvien[1]
                    lecturers += "\n"
                subjectList.append(ClassInfor(LMH, LMHName, group, TC, note, week, day
                                    , time, place, totStudents, lecturers))
        for item in subjectList:
            day = item.day - 2
            start, end = (int(s) for s in item.time.split('-'))
            subjectID = item.LMH
            place = item.place
            if (place[0] == '-'):
                place = place[1:]
            if '-' in item.week:
                weekStart, weekEnd = (int(s) for s in item.week.split('-'))
                for week in range(weekStart - 1, weekEnd):
                    for i in range(start - 1, end):
                        arr[week][i][day] = subjectID + " - " + place
            elif ',' in item.week:
                studyWeeks = (int(s) for s in item.week.split(','))
                for week in studyWeeks:
                    for i in range(start - 1, end):
                        arr[week][i][day] = subjectID + " - " + place
            else:
                for week in range(15):
                    for i in range(start - 1, end):
                        arr[week][i][day] = subjectID + " - " + place
        return render_template('index.html', hello="Hello " + name + " " + msv, timestamp=timestamp
                            , msv=msv, name=name, arr=arr, curWeek=curWeek, curDay=curDay)

    return render_template('index.html', arr=arr, curWeek=curWeek, curDay=curDay, timestamp = timestamp)


@views.route('/viewbyweek', methods=['GET', 'POST'])
def viewbyweek():
    totWeeks, rows, cols = (15, 12, 6)
    arr = [[[' ' for j in range(cols)] for i in range(rows)] for k in range(totWeeks)]
    d1 = datetime.strptime("2022/08/29", "%Y/%m/%d")
    d2 = datetime.now()
    curWeek = int((d2 - d1).days / 7) 
    curDay = (d2 - d1).days % 7
    timestamp = ""
    if (curDay == 8):
        timestamp += "Chủ nhật"
    else:
        timestamp += "Thứ " + str(curDay + 2)
    timestamp += " Tuần " + str(curWeek + 1)
    if request.method == "POST":
        msv = request.form['msv']
        mycursor.execute("SELECT * FROM sinhvien WHERE MSV = (%s)", (msv,))
        data = mycursor.fetchone()
        if not data:
            return render_template('viewbyweek.html', hello="Not found student!"
                                    , arr=arr, curWeek=curWeek, timestamp = timestamp)
        name = data[1]
        birthdate = data[2]
        classname = data[3]
        gender = data[4]
        birthplace = data[5]
        mycursor.execute("SELECT * FROM dangky WHERE MSV = (%s)", (msv,))
        dataFromDangky = mycursor.fetchall()
        subjectList = []

        for itemDangky in dataFromDangky:
            HP = itemDangky[1]
            LHP = itemDangky[2]
            LMH = HP + ' ' + LHP 
            group = itemDangky[3]
            note = itemDangky[4]
            mycursor.execute("SELECT * FROM monhoc WHERE Mã_HP = (%s)", (HP,))
            dataFromMonhoc = mycursor.fetchone()
            LMHName = dataFromMonhoc[1]
            TC = dataFromMonhoc[2]
            mycursor.execute("SELECT * FROM lopmonhoc WHERE Mã_HP = (%s) AND Mã_LHP = (%s) AND (Nhóm = 'CL' OR Nhóm = (%s))"
                             , (HP, LHP, group))
            dataFromLopmonhoc = mycursor.fetchall()
            for itemLopmonhoc in dataFromLopmonhoc:
                mycursor.execute("SELECT * FROM giangvien WHERE ID_Giangvien = (%s) OR ID_Giangvien = (%s)"
                             , (itemLopmonhoc[-1], itemLopmonhoc[-2]))
                dataFromGiangvien = mycursor.fetchall()
                lecturers = ""
                group = itemLopmonhoc[2]
                week = itemLopmonhoc[3]
                day = itemLopmonhoc[4]
                time = itemLopmonhoc[5]
                place = itemLopmonhoc[6] + '-' + itemLopmonhoc[7]
                totStudents = itemLopmonhoc[8]
                for itemGiangvien in dataFromGiangvien:
                    lecturers += itemGiangvien[1]
                    lecturers += "\n"

                subjectList.append(ClassInfor(LMH, LMHName, group, TC, note, week, day
                                    , time, place, totStudents, lecturers))
        for item in subjectList:
            day = item.day - 2
            start, end = (int(s) for s in item.time.split('-'))
            subjectID = item.LMH
            place = item.place
            if (place[0] == '-'):
                place = place[1:]
            if '-' in item.week:
                weekStart, weekEnd = (int(s) for s in item.week.split('-'))
                for week in range(weekStart - 1, weekEnd):
                    for i in range(start - 1, end):
                        arr[week][i][day] = subjectID + " - " + place
            elif ',' in item.week:
                studyWeeks = (int(s) for s in item.week.split(','))
                for week in studyWeeks:
                    for i in range(start - 1, end):
                        arr[week][i][day] = subjectID + " - " + place
            else:
                for week in range(15):
                    for i in range(start - 1, end):

                        arr[week][i][day] = subjectID + " - " + place
        return render_template('viewbyweek.html', hello="Hello " + name + " " + msv, timestamp=timestamp, msv=msv, name=name
                                , birthplace=birthplace, birthdate=birthdate, gender=gender, classname=classname
                                , subjectList=subjectList, arr=arr, curWeek=curWeek)

    return render_template('viewbyweek.html', arr=arr, curWeek=curWeek, timestamp = timestamp)
    
    
    
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
            if not havePointInDB(newpos):
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
