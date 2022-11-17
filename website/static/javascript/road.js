export let road = L.polyline([], { offset: 2, color: 'red' });
const distancePopup = L.popup()
const avgWalkSpeed = 62.5;

export function renderRoad(map, posList, distance) {
    road._snaking = false;

    for (let i = 0; i < posList.length; i++) {
        road.addLatLng([parseFloat(posList[i][0]), parseFloat(posList[i][1])]);
    }

    distancePopup.setContent("~ " + distance + " m, " + Math.round(distance/avgWalkSpeed) + " min");

    road.on('mouseover', function (e) {
        distancePopup.setLatLng(e.latlng).openOn(map);
    });
    
    road.on('mouseout', function () {
        distancePopup.close();
    });

    road.addTo(map).snakeIn();
}
    
export function clearRoad() {
    road.remove();
    road = L.polyline([], { offset: 2, color: 'red' });
}