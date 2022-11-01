from queue import PriorityQueue
from .models import mycursor, db


def initGlobal():
    global placesByTime, distance, posX, posY
    placesByTime = []
    distance = 0
    posX = [0]
    posY = [0]


def initRoad(showedPlaceList, placeNames):
    global posX, posY
    mycursor.execute("select * from `points`")
    data = mycursor.fetchall()
    for d in data:
        if d[2] > 0:
            showedPlaceList.append(d[0])
        placeNames.append(d[1])
        posX.append(d[3])
        posY.append(d[4])


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
