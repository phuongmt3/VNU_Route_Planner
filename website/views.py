from flask import Blueprint, render_template, request
from .models import mycursor

views = Blueprint('views', __name__)


class ClassInfor:
    def __init__(self, LMH, LMHName, group, TC, note):
        self.LMH = LMH
        self.LMHName = LMHName
        self.group = group
        self.TC = TC
        self.note = note


@views.route('/', methods=['GET', 'POST'])
def home():
    # xu ly TH data empty
    if request.method == "POST":
        msv = request.form['msv']
        if not msv:
            return render_template('index.html')
        mycursor.execute("SELECT * FROM sinhvien WHERE MSV = (%s)", (msv,))
        data = mycursor.fetchone()
        name = data[1]
        birthdate = data[2]
        class_name = data[3]
        if birthdate is None:
            birthdate = ""
        mycursor.execute("SELECT * FROM dangky WHERE MSV = (%s)", (msv,))
        data = mycursor.fetchall()
        subjectList = []
        for row in data:
            LMH = row[1]
            orgLMH = LMH[:7]
            group = row[2]
            note = row[3]
            mycursor.execute("SELECT * FROM monhoc WHERE Mã_LHP = (%s)", (orgLMH,))
            data2 = mycursor.fetchone()
            LMHName = data2[1]
            TC = data2[2]
            subjectList.append(ClassInfor(LMH, LMHName, TC, group, note))
        return render_template('index.html', hello="Hello " + name, msv=msv, name=name,
                               birthdate=birthdate, class_name=class_name,
                               subjectList=subjectList)

    return render_template('index.html')
