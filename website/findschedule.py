from datetime import date, datetime

from .models import mycursor

startSemester = date(2022, 8, 29)


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
    totWeek, totDayOfWeek, totLesson = (15, 7, 12)
    timeTable = [[[{"subjectName": "", "place": ""} for j in range(totLesson)] for i in range(totDayOfWeek)] for k in
                 range(totWeek)]

    for item in subjectList:
        day = item.day - 1
        start, end = (int(s) for s in item.time.split('-'))
        subjectName = item.LMHName
        place = item.place
        group = item.group
        subjectCode = item.LMH
        credits = item.TC
        lecturer = item.lecturer
        if place[0] == '-':
            place = place[1:]
        if '-' in item.week:
            weekStart, weekEnd = (int(s) for s in item.week.split('-'))
            for week in range(weekStart - 1, weekEnd):
                for i in range(start - 1, end):
                    timeTable[week][day][i] = {"subjectName": subjectName, "place": place, "group": group,
                                               "subjectCode": subjectCode, "credits": credits, "lecturer": lecturer}
        elif ',' in item.week:
            studyWeeks = (int(s) for s in item.week.split(','))
            for week in studyWeeks:
                for i in range(start - 1, end):
                    timeTable[week][day][i] = {"subjectName": subjectName, "place": place, "group": group,
                                               "subjectCode": subjectCode, "credits": credits, "lecturer": lecturer}
        else:
            for week in range(15):
                for i in range(start - 1, end):
                    timeTable[week][day][i] = {"subjectName": subjectName, "place": place, "group": group,
                                               "subjectCode": subjectCode, "credits": credits, "lecturer": lecturer}
    return timeTable


def classListOfDate(date):
    dif = (date - startSemester).days
    week = int(dif / 7) + 1
    if week < 1 or week > 16:
        return [], [], 0
    weekRegex = '%' + str(week) + '%'
    thu = str(dif % 7 + 2) if dif % 7 + 2 < 8 else '1'

    mycursor.execute("select * from room")
    rooms = mycursor.fetchall()
    giangduong = []
    res = []
    prevGD = None
    for r in rooms:
        if r[0] != prevGD:
            giangduong.append(r[0])
            res.append([])
            prevGD = r[0]
        res[-1].append([r[0], r[1], '', '', '', 0, 0, '', ''])

    mycursor.execute("select Giảng_đường,if(Số_phòng='', Giảng_đường, Số_phòng) as Số_phòng,Số_SV,ClassType, monhoc.Tên_môn_học,\
        substring_index(Tiết,'-',1)+6 as TimeStart, substring_index(Tiết,'-',-1)+7 as TimeEnd,\
        concat(class.Mã_HP,'_',class.Mã_LHP,' ',class.Nhóm) as Class_ID,\
        group_concat(if (Ten is null, '', Ten)) as Giangvien\
        from\
        (SELECT *, substring_index(substring_index(Tuần,'-',1),';',-1) as Week1,\
        substring_index(substring_index(Tuần,'-',-1),';',1) as Week2,\
        if(Nhóm='CL', 'Lý Thuyết', 'Thực Hành') as ClassType\
        FROM lopmonhoc\
        having (Week1 = ' ' or Week1 like %s or (%s between Week1 and Week2)) \
        and Thứ=%s) class \
        join monhoc on class.Mã_HP=monhoc.Mã_HP\
        left join dayhoc on class.Mã_HP=dayhoc.Mã_HP and class.Mã_LHP=dayhoc.Mã_LHP and class.Nhóm=dayhoc.Nhóm\
        left join giangvien on dayhoc.ID_Giangvien=giangvien.ID_Giangvien\
        group by Class_ID;", (weekRegex, week, thu))
    classes = mycursor.fetchall()

    for lop in classes:
        for i in range(len(giangduong)):
            if lop[0] == giangduong[i]:
                res[i].append(lop)
                break

    return res, giangduong, week
