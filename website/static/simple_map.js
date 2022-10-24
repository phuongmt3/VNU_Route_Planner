var map = L.map('map', {
    crs: L.CRS.Simple,
    minZoom: -2,
    zoomSnap: 0.25,
    wheelPxPerZoomLevel: 120,
    maxBounds: L.latLngBounds([[0,0], [2048, 1317]]),
});

var popup = L.popup();

function onMapClick(e) {
    popup
        .setLatLng(e.latlng)
        .setContent("You clicked the map at " + e.latlng.toString())
        .openOn(map);
}

map.on('click', onMapClick);

var sol = L.latLng([ 708.774143, 1070.881007 ]);
L.marker(sol).addTo(map);

var bounds = [[0,0], [2048, 1317]];
var image = L.imageOverlay('static/image/map.png', bounds).addTo(map);

map.fitBounds(bounds);