export let redLine = L.polyline([], { color: 'red', offset: 1 });
export let blueLine = L.polyline([], { color: 'deepskyblue', offset: 3 });
export let greenLine = L.polyline([], { color: 'lime', offset: 5 });
const distancePopup = [L.popup(), L.popup(), L.popup()]

export function renderRoad(map, posList, popupContent, color) {
    for (let i = 0; i < posList.length; i++) {
        if (color == 'red')
            redLine.addLatLng([parseFloat(posList[i][0]), parseFloat(posList[i][1])]);
        else if (color == 'deepskyblue')
            blueLine.addLatLng([parseFloat(posList[i][0]), parseFloat(posList[i][1])]);
        else
            greenLine.addLatLng([parseFloat(posList[i][0]), parseFloat(posList[i][1])]);
    }

    if (color == 'red') {
        redLine.addTo(map).snakeIn();
        distancePopup[0].setContent("Khoảng cách ~ " + popupContent + " mét");
    } else if (color == 'deepskyblue') {
        blueLine.addTo(map).snakeIn();
        distancePopup[1].setContent("Khoảng cách ~ " + popupContent + " mét");
    } else {
        greenLine.addTo(map).snakeIn();
        distancePopup[2].setContent("Khoảng cách ~ " + popupContent + " mét");
    }

    redLine.on('mouseover', function (e) {
        distancePopup[0].setLatLng(e.latlng).openOn(map);
    });
    redLine.on('mouseout', function () {
        distancePopup[0].close();
    });
    
    blueLine.on('mouseover', function (e) {
        distancePopup[1].setLatLng(e.latlng).openOn(map);
    });
    blueLine.on('mouseout', function () {
        distancePopup[1].close();
    });
    
    greenLine.on('mouseover', function (e) {
        distancePopup[2].setLatLng(e.latlng).openOn(map);
    });
    greenLine.on('mouseout', function () {
        distancePopup[2].close();
    });
}

export function clearLine() {
    redLine._snaking = false;
    redLine.remove();
    redLine = L.polyline([], { color: 'red', offset: 1 });

    blueLine._snaking = false;
    blueLine.remove();
    blueLine = L.polyline([], { color: 'deepskyblue', offset: 3 });

    greenLine._snaking = false;
    greenLine.remove();
    greenLine = L.polyline([], { color: 'lime', offset: 5 });
}
    