from .models import mycursor


def getBuildingList(idStartPlace, idEndPlace):
    mycursor.execute("SELECT * FROM toanha")
    bdListFull = mycursor.fetchall()

    bdListSelect = []
    bdNames = []

    mycursor.execute(
        "select `name` from `points` where `id`=%s", (idStartPlace, ))
    bdNames.append(mycursor.fetchone()[0])

    mycursor.execute(
        "select `name` from `points` where `id`=%s", (idEndPlace, ))
    bdNames.append(mycursor.fetchone()[0])

    for x in bdListFull:
        if x[0] in bdNames:
            bdListSelect += [x + (True,)]
        else:
            bdListSelect += [x + (False,)]

    return bdListSelect
