export function renderRoad(map, posList, lineGroup) {
    lineGroup.clearLayers()

    for (let i = 0; i < posList.length - 1; i++) {
        var latlngs = [
            [parseFloat(posList[i][0]), parseFloat(posList[i][1])], [parseFloat(posList[i + 1][0]), parseFloat(posList[i + 1][1])]
        ];
        var line = L.polyline(latlngs, { color: 'red' });

        // Check if latlngs is overlapping lines in lineGroup
        for (const layer of Object.values(lineGroup._layers).reverse()) {
            if (latlngs.toString() === [Object.values(layer._latlngs[1]), Object.values(layer._latlngs[0])].toString()) {
                line.setStyle({ weight: 6 })
                break;
            }
        }

        lineGroup.addLayer(line);
    }

    lineGroup.addTo(map).snakeIn();
}
    