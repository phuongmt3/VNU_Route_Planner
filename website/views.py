from flask import Blueprint, render_template, request
from .models import mycursor

views = Blueprint('views', __name__)


def getDistanceBetween2Points(id1, id2):
    if id1 == id2:
        return 0
    if id1 > id2:
        return getDistanceBetween2Points(id2, id1)
    mycursor.execute("select * from `dijistra` where `id1`=(%s) and `id2`=(%s)", (id1, id2))
    data = mycursor.fetchone()
    if not data:
        return -1
    return data[2]


@views.route('/', methods=['GET', 'POST'])
def home():
    showedPlaceList = []
    placeNames = [""]
    mycursor.execute("select * from `points`")
    data = mycursor.fetchall()
    for d in data:
        if d[2] == 1 or d[2] == 0:
            showedPlaceList.append(d[0])
        #placeNames.append(d[1])
        placeNames.append(d[0])

    if request.method == 'POST':
        idStartPlace = request.form['startPlace']
        idEndPlace = request.form['endPlace']
        if not idStartPlace or not idEndPlace:
            return render_template('index.html', placeNames=placeNames, showedPlaceList=showedPlaceList)
        idStartPlace = int(idStartPlace)
        idEndPlace = int(idEndPlace)
        startPlace = placeNames[idStartPlace]
        endPlace = placeNames[idEndPlace]
        distance = getDistanceBetween2Points(idStartPlace, idEndPlace)
        return render_template('index.html', placeNames=placeNames, showedPlaceList=showedPlaceList,
                               startPlace=startPlace, endPlace=endPlace, distance=distance)

    if request.method == 'GET':
        return render_template('index.html', placeNames=placeNames, showedPlaceList=showedPlaceList)

    return render_template('index.html')
