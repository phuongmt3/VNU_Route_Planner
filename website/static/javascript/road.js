export let redLine = L.polyline([], { color: 'red', offset: 2 });
export let blueLine = L.polyline([], { color: 'dodgerblue', offset: 6 });
export let greenLine = L.polyline([], { color: 'lime', offset: 10 });


export function renderRoad(map, posList, color) {
    for (let i = 0; i < posList.length; i++) {
        if (color == 'red')
            redLine.addLatLng([parseFloat(posList[i][0]), parseFloat(posList[i][1])]);
        else if (color == 'dodgerblue')
            blueLine.addLatLng([parseFloat(posList[i][0]), parseFloat(posList[i][1])]);
        else
            greenLine.addLatLng([parseFloat(posList[i][0]), parseFloat(posList[i][1])]);
    }

    if (color == 'red') {
        redLine.addTo(map).snakeIn();
    } else if (color == 'dodgerblue') {
        blueLine.addTo(map).snakeIn();
    } else {
        greenLine.addTo(map).snakeIn();
    }
}

export function clearLine() {
    redLine._snaking = false;
    redLine.remove();
    redLine = L.polyline([], { color: 'red', offset: 2 });

    blueLine._snaking = false;
    blueLine.remove();
    blueLine = L.polyline([], { color: 'dodgerblue', offset: 6 });

    greenLine._snaking = false;
    greenLine.remove();
    greenLine = L.polyline([], { color: 'lime', offset: 10 });
}
    