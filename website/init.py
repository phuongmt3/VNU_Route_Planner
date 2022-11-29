from .models import mycursor, db

points = [0]
distance = [0]
sinhvien = {}
dijkstra = [0]


def initGlobal():
    global distance

    mycursor.execute("select * from `points`")
    data = mycursor.fetchall()

    for d in data:
        points.append((d[1], d[2], float(d[3]), float(d[4])))

    for i in range(len(points)):
        row1 = [0]
        row2 = [0]
        for j in range(len(points)):
            row1.append(0)
            row2.append(0)
        distance.append(row1)
        dijkstra.append(row2)

    mycursor.execute("select * from `distance`")
    data = mycursor.fetchall()
    for d in data:
        distance[int(d[0])][int(d[1])] = float(d[2])
        distance[int(d[1])][int(d[0])] = float(d[2])

    mycursor.execute("select * from `dijkstra`")
    data = mycursor.fetchall()
    for d in data:
        dijkstra[int(d[0])][int(d[1])] = (float(d[2]), int(d[3]))

    mycursor.execute("select `MSV`, `Tên` from `sinhvien`")
    data = mycursor.fetchall()
    for d in data:
        sinhvien[d[0]] = d[1]


def initRoad(showedPlaceList=[], placeNames=[""]):
    for i in range(1, len(points)):
        if points[i][1] > 0:
            showedPlaceList.append(i)
        placeNames.append(points[i][0])

