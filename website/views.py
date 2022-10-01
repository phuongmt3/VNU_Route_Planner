import re
from flask import Blueprint, render_template, request
from .models import mycursor
import json

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


@views.route('/map', methods=['GET', 'POST'])
def my_map():
    if request.method == "POST" and request.form['bdName']:
        bdNameList = request.form['bdName'].replace(" ", "").split(',')
        bdInfoList = []
        for bdName in bdNameList:
            mycursor.execute(
                "SELECT * FROM giangduong WHERE Mã_tòa_nhà = (%s)", (bdName,))
            data = mycursor.fetchone()
            if data:
                bdInfoList.append(data[1])
            else:
                bdInfoList.append('')
    else:
        mycursor.execute("SELECT * FROM giangduong")
        data = mycursor.fetchall()
        bdNameList = [i[0] for i in data]
        bdInfoList = [i[1] for i in data]

    return render_template('map_test.html', bdNameList=json.dumps(bdNameList), bdInfoList=json.dumps(bdInfoList))


@views.route('/', methods=['GET', 'POST'])
def home():
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
        for row in data:
            LMH = row[1]
            orgLMH = LMH[:7]
            group = row[2]
            note = row[3]
            mycursor.execute(
                "SELECT * FROM monhoc WHERE Mã_LHP = (%s)", (orgLMH,))
            data2 = mycursor.fetchone()
            LMHName = data2[1]
            TC = data2[2]
            mycursor.execute(
                "SELECT * FROM lopmonhoc WHERE Mã_LHP = (%s) AND (Nhóm = 'CL' OR Nhóm = (%s))", (LMH, group))
            data3 = mycursor.fetchall()
            for line in data3:
                subjectList.append(ClassInfor(LMH, LMHName, line[1], TC, note,
                                              line[2], line[3], line[4], line[5], line[6], line[7]))
        return render_template('index.html', hello="Hello " + name, msv=msv, name=name,
                               birthdate=birthdate, class_name=class_name, gender=gender,
                               birthplace=birthplace, subjectList=subjectList)

    return render_template('index.html')
