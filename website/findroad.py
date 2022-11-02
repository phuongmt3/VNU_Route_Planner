import math
from queue import PriorityQueue
import heapq
from .models import mycursor, db
import json
import decimal


class DecimalEncoder(json.JSONEncoder):
    def default(self, o):
        if isinstance(o, decimal.Decimal):
            return float(o)
        return super(DecimalEncoder, self).default(o)


def initGlobal():
    global placesByTime, distance, posX, posY
    placesByTime = []
    distance = 0
    posX = [0.0]
    posY = [0.0]


def initRoad(showedPlaceList, placeNames):
    global posX, posY
    mycursor.execute("select * from `points`")
    data = mycursor.fetchall()
    for d in data:
        if d[2] > 0:
            showedPlaceList.append(d[0])
        placeNames.append(d[1])
        posX.append(float(json.dumps(d[3], cls=DecimalEncoder)))
        posY.append(float(json.dumps(d[4], cls=DecimalEncoder)))


def resetDijkstraTable():
    mycursor.execute("delete from `dijkstra`")
    db.commit()
    mycursor.execute("select * from `distance`")
    data = mycursor.fetchall()
    for row in data:
        mycursor.execute("insert into `dijkstra` value (%s,%s,%s,%s)", (row[0], row[1], row[2], row[0]))
        mycursor.execute("insert into `dijkstra` value (%s,%s,%s,%s)", (row[1], row[0], row[2], row[1]))
    db.commit()


def getDistance(p1, p2):
    # between 2 direct places on map
    mycursor.execute("select `distance` from `distance` where `id1`=%s and `id2`=%s", (p1, p2))
    data = mycursor.fetchone()
    if not data:
        mycursor.execute("select `distance` from `distance` where `id1`=%s and `id2`=%s", (p2, p1))
        data = mycursor.fetchone()
    return data[0]


def getDistanceBetween2Points(id1, id2):
    if id1 == id2:
        return 0
    mycursor.execute("select `minDistance` from `dijkstra` where `id1`=(%s) and `id2`=(%s)", (id1, id2))
    ans = mycursor.fetchone()

    if not ans:
        mycursor.execute("select Count(*) from `points`")
        data = mycursor.fetchone()
        pq = PriorityQueue()
        finished = [False] * (data[0] + 1)
        isMin = [False] * (data[0] + 1)  # to not rerun the old roads when min distance is reached in previous steps
        kc = [(0, 0, 0)]  # (curMinKc, thisID, trackingID)

        for i in range(data[0]):
            kc.append((1000000, i + 1, -1))
        kc[id1] = (0, id1, 0)
        finished[id1] = True
        isMin[id1] = True

        # put all adjacent places of startID into pq
        mycursor.execute("select * from `dijkstra` where `id1`=%s", (id1,))
        data = mycursor.fetchall()
        for k in data:
            kc[k[1]] = (k[2], k[1], k[3])
            pq.put(kc[k[1]])
            isMin[k[1]] = True

        while not pq.empty():
            cur = pq.get()
            if finished[cur[1]]:
                continue
            finished[cur[1]] = True

            # save calculated min roads into dijkstra table
            oldaim = cur[1]
            aim = cur[2]
            minkc = 0
            while aim != 0:
                minkc += getDistance(aim, oldaim)
                mycursor.execute("insert ignore into `dijkstra` value (%s, %s, %s, %s)",
                                 (cur[1], aim, minkc, oldaim))
                mycursor.execute("insert ignore into `dijkstra` value (%s, %s, %s, %s)",
                                 (aim, cur[1], minkc, cur[2]))
                oldaim = aim
                aim = kc[aim][2]
            db.commit()

            if cur[1] == id2:
                return cur[0]

            # add nextID to pq
            mycursor.execute("select * from `distance` where `id1`=%s or `id2`=%s", (cur[1], cur[1]))
            data = mycursor.fetchall()
            for i in data:
                nextID = i[0]
                if i[0] == cur[1]:
                    nextID = i[1]
                if finished[nextID] or isMin[nextID]:
                    continue

                # check if nextID is a main place or not
                mycursor.execute("select * from `points` where `id`=%s", (nextID,))

                po = mycursor.fetchone()
                if po[2] == 1 and nextID != id1 and nextID != id2:
                    continue

                if kc[nextID][0] > kc[cur[1]][0] + i[2]:
                    kc[nextID] = (kc[cur[1]][0] + i[2], nextID, cur[1])
                    pq.put(kc[nextID])
        return -1

    # if answer is already existed
    return ans[0]


def getTrackingList():
    global placesByTime
    trackingList = []
    for i in range(len(placesByTime) - 1, 0, -1):
        aim = placesByTime[i]
        while aim != placesByTime[i - 1]:
            mycursor.execute("select * from `dijkstra` where id1=%s and id2=%s", (placesByTime[i - 1], aim))
            data = mycursor.fetchone()
            trackingList.append(data[3])
            aim = data[3]
    return trackingList


# Add place to placesByTime and update distance
def addPlace(addedId):
    global distance, placesByTime

    distanceAns = distance - getDistanceBetween2Points(placesByTime[0], placesByTime[1]) \
                  + getDistanceBetween2Points(placesByTime[0], addedId) \
                  + getDistanceBetween2Points(addedId, placesByTime[1])
    posToAdd = 1
    for i in range(1, len(placesByTime) - 1):
        newDistance = distance - getDistanceBetween2Points(placesByTime[i], placesByTime[i + 1]) \
                      + getDistanceBetween2Points(placesByTime[i], addedId) \
                      + getDistanceBetween2Points(addedId, placesByTime[i + 1])
        if newDistance < distanceAns:
            distanceAns = newDistance
            posToAdd = i + 1

    distance = distanceAns
    placesByTime.insert(posToAdd, addedId)


# Remove place from placesByTime and update distance
def removePlace(removeId):
    global distance, placesByTime

    index = placesByTime.index(removeId)
    if index == 0 or index == len(placesByTime) - 1:
        return
    distance = distance + getDistanceBetween2Points(placesByTime[index - 1], placesByTime[index + 1]) \
               - getDistanceBetween2Points(placesByTime[index - 1], removeId) \
               - getDistanceBetween2Points(removeId, placesByTime[index + 1])

    placesByTime.remove(removeId)


# Find route nearest point
def nearestRoad(newpos):
    disToPoint = []
    mycursor.execute("SELECT `id` FROM `points`")
    points = mycursor.fetchall()
    for p in points:
        kc = (newpos[0] - posX[p[0]]) * (newpos[0] - posX[p[0]]) + (newpos[1] - posY[p[0]]) * (newpos[1] - posY[p[0]])
        heapq.heappush(disToPoint, (kc, p[0]))

    neareastPoints = []
    roadlimit = 5
    minDis = 100000
    road = []
    roadVuong = []
    while len(disToPoint):
        t = heapq.heappop(disToPoint)
        for p in neareastPoints:
            if roadlimit == 0:
                return road, roadVuong

            mycursor.execute("SELECT * FROM `distance` WHERE `id1`=%s AND `id2`=%s", (p[1], t[1]))
            existRoad1 = mycursor.fetchone()
            mycursor.execute("SELECT * FROM `distance` WHERE `id1`=%s AND `id2`=%s", (t[1], p[1]))
            existRoad2 = mycursor.fetchone()

            if existRoad1 or existRoad2:
                roadlimit -= 1
                pa = [posX[p[1]], posY[p[1]]]
                pb = [posX[t[1]], posY[t[1]]]
                curdis = distancePoint_Road(pa, pb, newpos)
                shadowP = shadowPoint(pa, pb, newpos)
                if curdis < minDis and between2Points(pa, pb, shadowP):
                    minDis = curdis
                    road = [pa, pb]
                    roadVuong = [newpos, shadowP]
                continue

        neareastPoints.append(t)


def distancePoint_Road(pa, pb, pc):
    a = pa[1] - pb[1]
    b = pb[0] - pa[0]
    c = pa[0] * pb[1] - pb[0] * pa[1]
    return math.fabs(a * pc[0] + b * pc[1] + c) / math.sqrt(a * a + b * b)


def shadowPoint(pa, pb, pc):
    t = ((pa[1] - pc[1]) * (pa[1] - pb[1]) - (pa[0] - pc[0]) * (pb[0] - pa[0])) \
        / ((pb[0] - pa[0]) * (pb[0] - pa[0]) + (pb[1] - pa[1]) * (pb[1] - pa[1]))
    x = pa[0] + (pb[0] - pa[0]) * t
    y = pa[1] + (pb[1] - pa[1]) * t
    return [x, y]


def between2Points(pa, pb, checkp):
    test1 = (checkp[0] - pa[0]) * (checkp[0] - pb[0])
    test2 = (checkp[1] - pa[1]) * (checkp[1] - pb[1])
    return test1 <= 0 and test2 <= 0
