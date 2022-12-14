import math
from queue import PriorityQueue
import heapq
import json
import decimal
from .init import *


class DecimalEncoder(json.JSONEncoder):
    def default(self, o):
        if isinstance(o, decimal.Decimal):
            return float(o)
        return super(DecimalEncoder, self).default(o)


class Road:
    def __init__(self):
        self.placesByTime = [1, 1]
        self.distance = 0
        self.posList = []

    # Update placesByTime, calculate distance, posList
    def calculate(self, startID, endID):
        if len(self.placesByTime) <= 2:
            self.placesByTime = [startID, endID]
            self.distance = runDijkstra(startID, endID)
        else:
            visitList = self.placesByTime[1:-1]

            self.placesByTime = [startID, endID]
            self.distance = runDijkstra(startID, endID)

            for visit in visitList:
                self.addPlace(visit)

        trackingList = self.getTrackingList()
        self.posList = [[points[i][2], points[i][3]] for i in trackingList]

    # Get Id of places from start to end
    def getTrackingList(self):
        trackingList = [self.placesByTime[-1]]
        for i in range(len(self.placesByTime) - 1, 0, -1):
            aim = self.placesByTime[i]
            while aim != self.placesByTime[i - 1]:
                trackingList.append(dijkstra[self.placesByTime[i - 1]][aim][1])
                aim = dijkstra[self.placesByTime[i - 1]][aim][1]
        trackingList.reverse()
        return trackingList

    # Add place to placesByTime and update distance, posList
    def addPlace(self, addedId):
        distanceAns = self.distance - runDijkstra(self.placesByTime[0], self.placesByTime[1]) \
                      + runDijkstra(self.placesByTime[0], addedId) \
                      + runDijkstra(addedId, self.placesByTime[1])
        posToAdd = 1
        for i in range(1, len(self.placesByTime) - 1):
            newDistance = self.distance - runDijkstra(self.placesByTime[i], self.placesByTime[i + 1]) \
                          + runDijkstra(self.placesByTime[i], addedId) \
                          + runDijkstra(addedId, self.placesByTime[i + 1])
            if newDistance < distanceAns:
                distanceAns = newDistance
                posToAdd = i + 1

        self.distance = distanceAns
        self.placesByTime.insert(posToAdd, addedId)

        trackingList = self.getTrackingList()
        self.posList = [[points[i][2], points[i][3]] for i in trackingList]

    # Remove place from placesByTime and update distance, posList
    def removePlace(self, removeId):
        index = self.placesByTime.index(removeId)
        if index == 0 or index == len(self.placesByTime) - 1:
            return
        self.distance = self.distance + runDijkstra(self.placesByTime[index - 1], self.placesByTime[index + 1]) \
                        - runDijkstra(self.placesByTime[index - 1], removeId) \
                        - runDijkstra(removeId, self.placesByTime[index + 1])

        self.placesByTime.remove(removeId)

        trackingList = self.getTrackingList()
        self.posList = [[points[i][2], points[i][3]] for i in trackingList]

    def reset(self):
        self.placesByTime = []


def resetDijkstraTable():
    mycursor.execute("delete from `dijkstra`")
    db.commit()
    mycursor.execute("select * from `distance`")
    data = mycursor.fetchall()

    executeStr = "insert ignore into `dijkstra` values "
    for row in range(0, len(data)):
        executeStr += tupleToString((data[row][0], data[row][1], data[row][2], data[row][0])) + ','
        executeStr += tupleToString((data[row][1], data[row][0], data[row][2], data[row][1]))
        if row < len(data) - 1:
            executeStr += ','

    mycursor.execute(executeStr)
    db.commit()
    print("resetDijkstraTable")


def runDijkstra(id1, id2):
    if id1 == id2:
        return 0

    ans = dijkstra[id1][id2]
    if ans != 0:
        return ans[0]

    pq = PriorityQueue()
    addDBList = []
    finished = [False] * (len(points) + 1)
    isMin = [False] * (len(points) + 1)  # to not rerun the old roads when min distance is reached in previous steps
    kc = [(0, 0, 0)]  # (curMinKc, thisID, trackingID)

    for i in range(len(points)):
        kc.append((1000000, i + 1, -1))
    kc[id1] = (0, id1, 0)
    finished[id1] = True
    isMin[id1] = True

    # put all adjacent places of startID into pq
    for nextID in range(1, len(points)):
        if dijkstra[id1][nextID] == 0:
            continue
        kc[nextID] = (dijkstra[id1][nextID][0], nextID, dijkstra[id1][nextID][1])
        pq.put(kc[nextID])
        isMin[nextID] = True

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
            minkc += distance[aim][oldaim]
            if points[cur[1]][1] > 0 and dijkstra[cur[1]][aim] == 0:
                addDBList.append((cur[1], aim, minkc, oldaim))
                dijkstra[cur[1]][aim] = (minkc, oldaim)
            if points[aim][1] > 0 and dijkstra[aim][cur[1]] == 0:
                addDBList.append((aim, cur[1], minkc, cur[2]))
                dijkstra[aim][cur[1]] = (minkc, cur[2])
            oldaim = aim
            aim = kc[aim][2]

        if cur[1] == id2:
            if len(addDBList) > 0:
                executeStr = "insert into `dijkstra` values " + tupleToString(addDBList[0])
                for i in range(1, len(addDBList)):
                    executeStr += ',' + tupleToString(addDBList[i])
                mycursor.execute(executeStr)
                db.commit()
            return cur[0]

        # add nextID to pq
        for nextID in range(0, len(distance[cur[1]])):
            if distance[cur[1]][nextID] > 0:
                if finished[nextID] or isMin[nextID]:
                    continue

                # check if nextID is a main place or not
                if points[nextID][2] == 1 and nextID != id1 and nextID != id2:
                    continue

                if kc[nextID][0] > kc[cur[1]][0] + distance[cur[1]][nextID]:
                    kc[nextID] = (kc[cur[1]][0] + distance[cur[1]][nextID], nextID, cur[1])
                    pq.put(kc[nextID])

    return -1


def tupleToString(t):
    ans = '(' + str(t[0])
    for i in range(1, len(t)):
        ans += ',' + str(t[i])
    ans += ')'
    return ans


def havePointInDB(p):
    mycursor.execute("SELECT * FROM `points` WHERE `posY`=%s AND `posX`=%s", (p[0], p[1]))
    point = mycursor.fetchone()
    if not point:
        return False
    return True


# Find route nearest point
def nearestRoad(newpos):
    disToPoint = []
    mycursor.execute("SELECT * FROM `points`")
    points = mycursor.fetchall()
    for p in points:
        if p[2] != 1:
            kc = (newpos[0] - points[p[0]][2]) * (newpos[0] - points[p[0]][2]) + (newpos[1] - points[p[0]][3]) * (
                    newpos[1] - points[p[0]][3])
            heapq.heappush(disToPoint, (kc, p[0]))

    neareastPoints = []
    roadlimit = 20
    minDis = 100000
    ida = 0
    idb = 0
    roadVuong = []  # road vuong goc voi nearest road

    while len(disToPoint):
        t = heapq.heappop(disToPoint)
        for p in neareastPoints:
            if roadlimit == 0:
                addNewPointsIntoDB(ida, idb, roadVuong[0], roadVuong[1])
                return

            mycursor.execute("SELECT * FROM `distance` WHERE `id1`=%s AND `id2`=%s", (p[1], t[1]))
            existRoad1 = mycursor.fetchone()
            mycursor.execute("SELECT * FROM `distance` WHERE `id1`=%s AND `id2`=%s", (t[1], p[1]))
            existRoad2 = mycursor.fetchone()

            if existRoad1 or existRoad2:
                roadlimit -= 1
                pa = [points[p[1]][2], points[p[1]][3]]
                pb = [points[t[1]][2], points[t[1]][3]]
                curdis = coorDistanceP_Road(pa, pb, newpos)
                shadowP = shadowPoint(pa, pb, newpos)
                if curdis < minDis and pointBetween2Points(pa, pb, shadowP):
                    minDis = curdis
                    ida = p[1]
                    idb = t[1]
                    roadVuong = [newpos, shadowP]
                continue

        neareastPoints.append(t)


def addNewPointsIntoDB(ida, idb, pc, ph):
    disAB = distance[ida][idb]
    kcDonVi = disAB / coorDistanceP_P([points[ida][2], points[ida][3]], [points[idb][2], points[idb][3]])

    mycursor.execute("SELECT MAX(`id`) FROM `points`")
    newid = mycursor.fetchone()[0] + 1
    mycursor.execute("INSERT INTO `points` VALUE (%s, %s, %s, %s, %s)", (newid, "New Place", 1, pc[0], pc[1]))
    mycursor.execute("INSERT INTO `points` VALUE (%s, %s, %s, %s, %s)", (newid + 1, "", 0, ph[0], ph[1]))
    db.commit()

    disAH = kcDonVi * coorDistanceP_P([points[ida][2], points[ida][3]], ph)
    disCH = kcDonVi * coorDistanceP_P(pc, ph)

    mycursor.execute("INSERT INTO `distance` VALUE (%s, %s, %s)", (ida, newid + 1, disAH))
    mycursor.execute("INSERT INTO `distance` VALUE (%s, %s, %s)", (idb, newid + 1, disAB - disAH))
    mycursor.execute("INSERT INTO `distance` VALUE (%s, %s, %s)", (newid, newid + 1, disCH))
    db.commit()

    resetDijkstraTable()


def coorDistanceP_Road(pa, pb, pc):
    a = pa[1] - pb[1]
    b = pb[0] - pa[0]
    c = pa[0] * pb[1] - pb[0] * pa[1]
    return math.fabs(a * pc[0] + b * pc[1] + c) / math.sqrt(a * a + b * b)


def coorDistanceP_P(pa, pb):
    return math.sqrt((pa[0] - pb[0]) * (pa[0] - pb[0]) + (pa[1] - pb[1]) * (pa[1] - pb[1]))


def shadowPoint(pa, pb, pc):
    t = ((pa[1] - pc[1]) * (pa[1] - pb[1]) - (pa[0] - pc[0]) * (pb[0] - pa[0])) \
        / ((pb[0] - pa[0]) * (pb[0] - pa[0]) + (pb[1] - pa[1]) * (pb[1] - pa[1]))
    x = pa[0] + (pb[0] - pa[0]) * t
    y = pa[1] + (pb[1] - pa[1]) * t
    return [x, y]


def pointBetween2Points(pa, pb, checkp):
    test1 = (checkp[0] - pa[0]) * (checkp[0] - pb[0])
    test2 = (checkp[1] - pa[1]) * (checkp[1] - pb[1])
    return test1 <= 0 and test2 <= 0
