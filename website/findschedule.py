from datetime import date, datetime

from .models import mycursor

startSemester = date(2022, 8, 29)
totWeek, totDayOfWeek, totLesson = (16, 8, 13)


class ClassInfo:
    def __init__(self, arr):
        self.LMHCode = arr[0]
        self.LMHName = arr[1]
        self.group = arr[2]
        self.TC = arr[3]
        self.note = arr[4]
        self.week = arr[5]
        self.day = arr[6]
        self.time = arr[7]
        self.place = arr[8]
        self.svCnt = arr[9]
        self.lecturer = arr[10]


def getSubjectList(msv):
    mycursor.execute("select concat(signup.Mã_HP,' ',signup.Mã_LHP) as LMHCode, Tên_môn_học, lopmonhoc.Nhóm, Số_TC,\
                    Nội_dung, Tuần, Thứ, Tiết, if(Số_phòng='',Giảng_đường,concat(Số_phòng,'-',Giảng_đường)) as Place,\
                    Số_SV, group_concat(Ten) as Lecturer,\
                    concat_ws(',',signup.Mã_HP,signup.Mã_LHP,lopmonhoc.Nhóm,lopmonhoc.Tuần,lopmonhoc.Thứ,lopmonhoc.Tiết) as ClassID\
                    from (select * from dangky where MSV=%s) signup\
                    join monhoc on signup.Mã_HP=monhoc.Mã_HP\
                    join lopmonhoc on signup.Mã_HP=lopmonhoc.Mã_HP and signup.Mã_LHP=lopmonhoc.Mã_LHP \
                    and (signup.Nhóm=lopmonhoc.Nhóm or lopmonhoc.Nhóm='CL')\
                    join ghichu on signup.ID_ghi_chú=ghichu.ID_ghi_chú\
                    join dayhoc on signup.Mã_HP=dayhoc.Mã_HP and signup.Mã_LHP=dayhoc.Mã_LHP and signup.Nhóm=dayhoc.Nhóm\
                    join giangvien on dayhoc.ID_Giangvien=giangvien.ID_Giangvien\
                    group by ClassID", (msv,))
    data = mycursor.fetchall()
    subjectList = []
    for d in data:
        subjectList.append(ClassInfo(d))
    return subjectList


def getTimeTable(msv):
    subjectList = getSubjectList(msv)
    timeTable = [[[{"subjectName": "", "place": ""} for j in range(totLesson)] for i in range(totDayOfWeek)] for k in
                 range(totWeek)]

    for item in subjectList:
        day = int(item.day) - 1
        start, end = (int(s) for s in item.time.split('-'))
        weekParts = [s for s in item.week.split('-')]
        prevPart = 0

        if item.week == "":
            for week in range(15):
                for i in range(start - 1, end):
                    timeTable[week][day][i] = {"subjectName": item.LMHName, "place": item.place,
                                               "group": item.group, "subjectCode": item.LMHCode,
                                               "credits": item.TC, "lecturer": item.lecturer}

        else:
            for i in range(len(weekParts)):
                studyWeeks = [int(s) for s in weekParts[i].split(';')]
                if prevPart > 0:
                    for week in range(prevPart - 1, studyWeeks[0] - 1):
                        for h in range(start - 1, end):
                            timeTable[week][day][h] = {"subjectName": item.LMHName, "place": item.place,
                                                       "group": item.group, "subjectCode": item.LMHCode,
                                                       "credits": item.TC, "lecturer": item.lecturer}
                prevPart = studyWeeks[-1]
                for week in studyWeeks:
                    for h in range(start - 1, end):
                        timeTable[week - 1][day][h] = {"subjectName": item.LMHName, "place": item.place,
                                                       "group": item.group, "subjectCode": item.LMHCode,
                                                       "credits": item.TC, "lecturer": item.lecturer}
    return timeTable


def classListFromDate(date):
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


def getMSVList(msv, name, birth, courseClass, subjectCode, subjectName, subjectGroup, credit, note):
    if msv == name == birth == courseClass == subjectCode == subjectName == subjectGroup == credit == note == '':
        mycursor.execute("SELECT MSV FROM vnu_route_planner_db_new.sinhvien")
        msvList = mycursor.fetchall()
        return msvList

    executeText = " SELECT DISTINCT sv.MSV FROM vnu_route_planner_db_new.sinhvien sv\
                    INNER JOIN vnu_route_planner_db_new.dangky dk\
                    ON sv.MSV = dk.MSV\
                    INNER JOIN vnu_route_planner_db_new.lopmonhoc lmh\
                    ON dk.Mã_HP = lmh.Mã_HP AND dk.Mã_LHP = lmh.Mã_LHP AND dk.Nhóm = lmh.Nhóm\
                    INNER JOIN vnu_route_planner_db_new.monhoc mh\
                    ON dk.Mã_HP = mh.Mã_HP\
                    INNER JOIN vnu_route_planner_db_new.ghichu gc\
                    ON dk.ID_ghi_chú = gc.ID_ghi_chú\
                    WHERE "

    if msv != '':
        executeText += "sv.MSV LIKE '" + msv + "%' AND "
    if name != '':
        executeText += "sv.Tên LIKE '%" + name + "%' AND "
    if birth != '':
        birth = birth.split('-')
        executeText += "YEAR(sv.Ngày_sinh) = " + birth[0] + " AND "
        if len(birth) > 2:
            executeText += "MONTH(sv.Ngày_sinh) = " + birth[1] + " AND "
            executeText += "DAY(sv.Ngày_sinh) = " + birth[2] + " AND "

    if courseClass != '':
        executeText += "sv.Lớp_khóa_học LIKE '%" + courseClass + "%' AND "
    if subjectCode != '':
        subjectCode = subjectCode.split(' ')
        executeText += "dk.Mã_HP = '" + subjectCode[0] + "' AND "
        if len(subjectCode) > 1:
            executeText += "dk.Mã_LHP = '" + subjectCode[1] + "' AND "

    if subjectName != '':
        executeText += "mh.Tên_môn_học LIKE '%" + subjectName + "%' AND "
    if subjectGroup != '':
        executeText += "dk.Nhóm = '" + subjectGroup + "' AND "
    if credit != '':
        executeText += "mh.Số_TC = " + subjectGroup + " AND "
    if note != '':
        executeText += "gc.Nội_dung = '" + note + "' AND "

    executeText += "TRUE"

    mycursor.execute(executeText)
    msvList = mycursor.fetchall()

    return msvList


def getTimeTableFull(msvList):
    msvList = [x[0] for x in msvList]
    totStudent = len(msvList)

    timeTable = [[[0 for j in range(totLesson)] for i in range(totDayOfWeek)] for k in range(totWeek)]

    for msv in msvList:  # Duyệt các sinh viên
        mycursor.execute("SELECT Mã_HP, Mã_LHP, Nhóm FROM dangky WHERE MSV = (%s)", (msv,))
        dataFromDangky = mycursor.fetchall()
        for itemDangky in dataFromDangky:  # Duyệt các môn học
            HP = itemDangky[0]
            LHP = itemDangky[1]
            group = itemDangky[2]

            mycursor.execute(
                "SELECT Nhóm, Tuần, Thứ, Tiết FROM lopmonhoc WHERE Mã_HP = (%s) AND Mã_LHP = (%s) AND (Nhóm = 'CL' OR Nhóm = (%s))"
                , (HP, LHP, group))
            dataFromLopmonhoc = mycursor.fetchall()

            for itemLopmonhoc in dataFromLopmonhoc:  # Duyệt các giờ học lặp theo tuần
                group = itemLopmonhoc[0]
                week = itemLopmonhoc[1]
                day = itemLopmonhoc[2]
                time = itemLopmonhoc[3]
                parseLessonTime(timeTable, 1 / totStudent, week, day, time)
    return timeTable


def parseLessonTime(timeTable, percent, week, day, time):
    day = day - 1
    start, end = (int(s) for s in time.split('-'))
    weekParts = [s for s in week.split('-')]
    prevPart = 0

    if week == "":
        for week in range(15):
            for i in range(start - 1, end):
                timeTable[week][day][i] += percent

    else:
        for i in range(len(weekParts)):
            studyWeeks = [int(s) for s in weekParts[i].split(';')]
            if prevPart > 0:
                for week in range(prevPart - 1, studyWeeks[0] - 1):
                    for h in range(start - 1, end):
                        timeTable[week][day][h] += percent
            prevPart = studyWeeks[-1]
            for week in studyWeeks:
                for h in range(start - 1, end):
                    timeTable[week][day][h] += percent
