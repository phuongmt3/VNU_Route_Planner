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
    if request.method == "POST":
        msv = request.form['msv']
        mycursor.execute("SELECT * FROM sinhvien WHERE MSV = (%s)", (msv,))
        data = mycursor.fetchone()
        if not data:
            return render_template('index.html', hello="Not found student!")
        name = data[1]
        birthdate = data[2]
        class_name = data[3]
        gender = data[4]
        birthplace = data[5]
        mycursor.execute("SELECT * FROM dangky WHERE MSV = (%s)", (msv,))
        data = mycursor.fetchall()
        subjectList = []
        d1 = datetime.strptime("2022/08/29", "%Y/%m/%d")
        d2 = datetime.now()
        curWeek = int((d2 - d1).days / 7)
        curDay = (d2 - d1).days % 7 
        for row in data:
            HP = row[1]
            LHP = row[2]
            group = row[3]
            note = row[4]
            mycursor.execute("SELECT * FROM monhoc WHERE Mã_HP = (%s)", (HP, ))
            data2 = mycursor.fetchone()
            LMHName = data2[1]
            TC = data2[2]
            mycursor.execute("SELECT * FROM lopmonhoc WHERE Mã_HP = (%s) AND Mã_LHP = (%s) AND (Nhóm = 'CL' OR Nhóm = (%s))"
                             , (HP, LHP, group))
            data3 = mycursor.fetchall()
            for line in data3:
                mycursor.execute("SELECT * FROM giangvien WHERE ID_Giangvien = (%s) OR ID_Giangvien = (%s)"
                             , (line[-1], line[-2]))
                data4 = mycursor.fetchall()
                lecturers = ""
                for li in data4:
                    lecturers += li[1]
                    lecturers += "\n"
                subjectList.append(ClassInfor(HP + ' ' + LHP, LMHName, line[2], TC, note, line[3], line[4],
                                              line[5], line[6] + '-' + line[7], line[8], lecturers))
        for line in subjectList:
            day = line.day - 2
            start, end = (int(s) for s in line.time.split('-'))
            subject = line.LMH
            subjectName = line.LMHName
            place = line.place
            if '-' in line.week:
                weekStart, weekEnd = (int(s) for s in line.week.split('-'))
                for week in range(weekStart - 1, weekEnd):
                    for i in range(start - 1, end):
                        arr[week][i][day] = subject + "\n" + subjectName + "\n" + place
            elif ',' in line.week:
                studyWeeks = (int(s) for s in line.week.split(','))
                for week in studyWeeks:
                    for i in range(start - 1, end):
                        arr[week][i][day] = subject + "\n" + subjectName + "\n" + place
            else:
                for week in range(15):
                    for i in range(start - 1, end):
                        arr[week][i][day] = subject + "\n" + subjectName + "\n" + place
        return render_template('index.html', hello="Hello " + name + " " + msv, timestamp="Tuần " + str(curWeek + 1) + " Thứ " + str(curDay),
                               msv=msv, name=name, birthdate=birthdate, class_name=class_name, gender=gender,
                               birthplace=birthplace, subjectList=subjectList, arr=arr, curWeek=curWeek, curDay=curDay)

    return render_template('index.html', arr=arr, curDay=1, curWeek=1)
