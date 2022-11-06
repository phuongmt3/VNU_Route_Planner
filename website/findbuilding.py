from .models import mycursor


def getBuildingList():
    mycursor.execute("SELECT * FROM toanha")
    data = mycursor.fetchall()

    buildingList = [x + (False,) for x in data]

    return buildingList
