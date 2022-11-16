export let road = L.polyline([], { offset: 2, color: 'red' });


export function renderRoad(map, posList) {
    road._snaking = false;

    for (let i = 0; i < posList.length; i++) {
        road.addLatLng([parseFloat(posList[i][0]), parseFloat(posList[i][1])]);
    }

    road.addTo(map).snakeIn();
}
    
export function clearRoad() {
    road.remove();
    road = L.polyline([], { offset: 2, color: 'red' });
}