from flask import Blueprint, render_template, request
from datetime import datetime
from .models import mycursor

views = Blueprint('views', __name__)


class ClassInfor:
    def __init__(self, LMH, LMHName, group, TC, note, week, day, time, place, svCnt, lecturer):
        self.LMH = LMH
        self.LMHName = LMHName
        self.group = group
        self.TC = TC
        self.note = note
        self.week = week
        self.day = day
        self.time = time
        self.place = place
        self.svCnt = svCnt
        self.lecturer = lecturer


@views.route('/', methods=['GET', 'POST'])
def home():
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
