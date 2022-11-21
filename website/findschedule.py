from .models import mycursor


class ClassInfo:
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
            subjectList.append(ClassInfo(LMH, LMHName, group, TC, note, week, day, time, place, totStudents, lecturers))
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
                    timeTable[week][day][i] = {"subjectName": subjectName, "place": place, "group": group, "subjectCode": subjectCode, "credits": credits, "lecturer": lecturer}
        elif ',' in item.week:
            studyWeeks = (int(s) for s in item.week.split(','))
            for week in studyWeeks:
                for i in range(start - 1, end):
                    timeTable[week][day][i] = {"subjectName": subjectName, "place": place, "group": group, "subjectCode": subjectCode, "credits": credits, "lecturer": lecturer}
        else:
            for week in range(15):
                for i in range(start - 1, end):
                    timeTable[week][day][i] = {"subjectName": subjectName, "place": place, "group": group, "subjectCode": subjectCode, "credits": credits, "lecturer": lecturer}
    return timeTable


def getMSVList(msv, name, birth, courseClass, subjectCode, subjectName, subjectGroup, credit, note):
    executeText = " SELECT DISTINCT sv.MSV FROM vnu_route_planner_db_test.sinhvien sv\
                    INNER JOIN vnu_route_planner_db_test.dangky dk\
                    ON sv.MSV = dk.MSV\
                    INNER JOIN vnu_route_planner_db_test.lopmonhoc lmh\
                    ON dk.Mã_HP = lmh.Mã_HP AND dk.Mã_LHP = lmh.Mã_LHP AND dk.Nhóm = lmh.Nhóm\
                    INNER JOIN vnu_route_planner_db_test.monhoc mh\
                    ON dk.Mã_HP = mh.Mã_HP\
                    INNER JOIN vnu_route_planner_db_test.ghichu gc\
                    ON dk.ID_ghi_chú = gc.ID_ghi_chú\
                    WHERE "

    if msv != '0':
        executeText += "sv.MSV LIKE '" + msv + "%' AND "
    if name != '0':
        executeText += "sv.Tên LIKE '%" + name + "%' AND "
    if birth[0] != '0':
        birth = birth.split('-')
        executeText += "YEAR(sv.Ngày_sinh) = " + birth[0] + " AND "
        if (len(birth) > 2):
            executeText += "MONTH(sv.Ngày_sinh) = " + birth[1] + " AND "
            executeText += "DAY(sv.Ngày_sinh) = " + birth[2] + " AND "
        
    if courseClass != '0':
        executeText += "sv.Lớp_khóa_học LIKE '%" + courseClass + "%' AND "
    if subjectCode != '0':
        subjectCode = subjectCode.split(' ')
        executeText += "dk.Mã_HP = '" + subjectCode[0] + "' AND "
        if len(subjectCode) > 1:
             executeText += "dk.Mã_LHP = '" + subjectCode[1] + "' AND "

    if subjectName != '0':
        executeText += "mh.Tên_môn_học LIKE '%" + subjectName + "%' AND "
    if subjectGroup != '0':
        executeText += "dk.Nhóm = '" + subjectGroup + "' AND "
    if credit != '0':
        executeText += "mh.Số_TC = " + subjectGroup + " AND "
    if note != '0':
        executeText += "gc.Nội_dung = '" + note + "' AND "

    executeText += "TRUE"

    mycursor.execute(executeText)
    msvList = mycursor.fetchall()

    return msvList


def getSubjectListFull(msvList):
    msvList = [x[0] for x in msvList]
    totStudent = len(msvList)
    subjectList = []

    for msv in msvList: # Duyệt các sinh viên
        mycursor.execute("SELECT * FROM dangky WHERE MSV = (%s)", (msv,))
        dataFromDangky = mycursor.fetchall()
        for itemDangky in dataFromDangky:   # Duyệt các môn học
            HP = itemDangky[1]
            LHP = itemDangky[2]
            group = itemDangky[3]

            mycursor.execute("SELECT * FROM lopmonhoc WHERE Mã_HP = (%s) AND Mã_LHP = (%s) AND (Nhóm = 'CL' OR Nhóm = (%s))"
                            , (HP, LHP, group))
            dataFromLopmonhoc = mycursor.fetchall()

            for itemLopmonhoc in dataFromLopmonhoc: # Duyệt các giờ học lặp theo tuần
                group = itemLopmonhoc[2]
                week = itemLopmonhoc[3]
                day = itemLopmonhoc[4]
                time = itemLopmonhoc[5]
                subjectList.append(ClassInfo("0", 1/totStudent, "0", "0", "0", week, day, time, "0", "0", "0"))
    return subjectList


def getTimeTableFull(subjectList):
    totWeek, totDayOfWeek, totLesson = (15, 7, 12)
    timeTable = [[["" for j in range(totLesson)] for i in range(totDayOfWeek)] for k in range(totWeek)]

    for item in subjectList:
        day = item.day - 1
        start, end = (int(s) for s in item.time.split('-'))
        subjectName = item.LMHName
        if '-' in item.week:
            weekStart, weekEnd = (int(s) for s in item.week.split('-'))
            for week in range(weekStart - 1, weekEnd):
                for i in range(start - 1, end):
                    if timeTable[week][day][i] == '':
                        timeTable[week][day][i] = subjectName
                    else:
                        timeTable[week][day][i] += subjectName
        elif ',' in item.week:
            studyWeeks = (int(s) for s in item.week.split(','))
            for week in studyWeeks:
                for i in range(start - 1, end):
                    if timeTable[week][day][i] == '':
                        timeTable[week][day][i] = subjectName
                    else:
                        timeTable[week][day][i] += subjectName
        else:
            for week in range(15):
                for i in range(start - 1, end):
                    if timeTable[week][day][i] == '':
                        timeTable[week][day][i] = subjectName
                    else:
                        timeTable[week][day][i] += subjectName
    return timeTable