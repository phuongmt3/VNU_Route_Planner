import { geojsonFeature as buildings } from '../static/geoData/buildingData.js'

// Map layer

var osm = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    id: "osm",
    maxZoom: 19,
    attribution: '© OpenStreetMap'
});

var mb = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
    id: "mb",
    maxZoom: 19,
    attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
});

var map = L.map('map', {
    center: [21.038965, 105.782375],
    zoom: 17,
    zoomSnap: 0.25,
    wheelPxPerZoomLevel: 120,
    maxBounds: L.latLngBounds([21.04242, 105.774801], [21.03538, 105.789896]),
    layers: [mb]
});

var baseMaps = {
    "OpenStreetMap": osm,
    "ESRI satellite": mb
};

L.control.layers(baseMaps).addTo(map);

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// Icons stuff

// var T_waypoint = L.icon({
//     iconUrl: 'https://preview.redd.it/2yv5x9hto5f61.png?width=341&format=png&auto=webp&s=eccf34f646917d5a7c0196de5c2fc2e7ef3e2427',
//     // shadowUrl: '',
//     iconSize:     [34, 34], // size of the icon
//     // shadowSize:   [50, 64], // size of the shadow
//     iconAnchor:   [17, 34], // point of the icon which will correspond to marker's location
//     // shadowAnchor: [4, 62],  // the same for the shadow
//     popupAnchor:  [0, -34] // point from which the popup should open relative to the iconAnchor
// });

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// Todo: add a site on click
var popup = L.popup();

function onMapClick(e) {
    popup
        .setLatLng(e.latlng)
        .setContent("You clicked the map at " + e.latlng.toString())
        .openOn(map);
}

map.on('click', onMapClick);

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// Render 

var lineGroup = L.layerGroup([], { snakingPause: 0 })
renderRoad(posList);

// Render buildings and add selecting events 
for (let i = 0; i < bdListSelect.length; i++) {
    L.geoJSON(buildings, {
        filter: function (feature) {
            return feature.properties.name.toLowerCase() == bdListSelect[i][0].toLowerCase();
        },
        onEachFeature: function (feature, layer) {
            var centerPosition = calculateCenter(feature.geometry.coordinates[0][0]);

            // Building's info
            L.tooltip(centerPosition, { content: feature.properties.name, permanent: true, direction: 'center', className: "my-labels" })
                .addTo(map);
            layer.bindPopup(bdListSelect[i][1]);

            // When hovering a building
            layer.on('mouseover', function () {
                if (!bdListSelect[i][2]) mark(layer);
                layer.openPopup(centerPosition);
            });
            layer.on('mouseout', function () {
                if (!bdListSelect[i][2]) unMark(layer);
                layer.closePopup(centerPosition);
            });

            // When click on a building
            layer.on('click', function () {
                bdListSelect[i][2] = !bdListSelect[i][2];

                // Add place and update path, distance
                fetch(`/post_place/${feature.properties.name}`, {
                    method: "POST",
                    headers: { 'Content-Type': 'application/json' },
                })
                    .then(function (response) {
                        return response.json();
                    }).then(function (response) {
                        // Select default buildings
                        if (response.length == 0) {
                            bdListSelect[i][2] = !bdListSelect[i][2];
                            return 0;
                        }

                        renderRoad(response[0]);
                        document.getElementById("distance").textContent = response[1];
                        console.log("Database' size = " + response[2]);
                    });
            });

            if (bdListSelect[i][2]) {
                mark(layer);
            } else {
                unMark(layer);
            }
        },
        // Default style (unMark)
        style: {
            "color": "#FF0000",
            "weight": 2,
            "opacity": 0,
            "fillOpacity": 0
        }
    }).addTo(map);
}

// Hide building's name
map.on('baselayerchange', function (e) {
    if (e.name == "OpenStreetMap") {
        $(".leaflet-tooltip").css("display", "none")
    } else {
        $(".leaflet-tooltip").css("display", "block")

        map.on('zoomend', function () {
            if (map.getZoom() < 16) {
                $(".leaflet-tooltip").css("display", "none")
            } else {
                $(".leaflet-tooltip").css("display", "block")
            }
        })
    }
});

function mark(layer) {
    layer.setStyle({
        "opacity": 1,
        "fillOpacity": 0.25
    });
}

function unMark(layer) {
    layer.setStyle({
        "opacity": 0,
        "fillOpacity": 0
    });
}

function calculateCenter(coordinate) {
    let lat = 0;
    let long = 0;
    for (let i = 0; i < coordinate.length; i++) {
        lat += coordinate[i][0];
        long += coordinate[i][1];
    }
    lat /= coordinate.length;
    long /= coordinate.length;

    return [long, lat];
}

function renderRoad(posList) {
    lineGroup.clearLayers()

    for (let i = 0; i < posList.length - 1; i++) {
        var latlngs = [
            [posList[i][0], posList[i][1]], [posList[i + 1][0], posList[i + 1][1]]
        ];
        lineGroup.addLayer(L.polyline(latlngs, { color: 'red' }))
    }
    lineGroup.addTo(map).snakeIn();
}

// Testing

// roadData.features.forEach(feature => {
//     feature.geometry.coordinates.forEach(coordinate => {
//         var marker = L.marker(L.latLng(coordinate[1], coordinate[0])).addTo(map);
//         marker.bindPopup("[" + coordinate[1] + ", " + coordinate[0] + "]").openPopup();
//     });
// });

$('.leaflet-container').css('cursor', 'crosshair');

