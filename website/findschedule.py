from .models import mycursor

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

def getSubjectList(msv):
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
    return subjectList


def getTimeTable(subjectList):
    totWeeks, rows, cols = (15, 12, 6)
    timeTable = [[[' ' for j in range(cols)] for i in range(rows)] for k in range(totWeeks)]

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
                    timeTable[week][i][day] = subjectID + " - " + place
        elif ',' in item.week:
            studyWeeks = (int(s) for s in item.week.split(','))
            for week in studyWeeks:
                for i in range(start - 1, end):
                    timeTable[week][i][day] = subjectID + " - " + place
        else:
            for week in range(15):
                for i in range(start - 1, end):
                    timeTable[week][i][day] = subjectID + " - " + place
    return timeTable
