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

const buildingLayers = new Map();

var lineGroup = L.layerGroup([], { snakingPause: 0 })
renderRoad(posList);

// Render buildings and add selecting events
for (let i = 0; i < bdListSelect.length; i++) {
    L.geoJSON(buildings, {
        filter: function (feature) {
            return feature.properties.name.toLowerCase() == bdListSelect[i][0].toLowerCase();
        },
        onEachFeature: function (feature, layer) {
            buildingLayers.set(feature.properties.name, layer);

            var centerPosition = calculateCenter(feature.geometry.coordinates[0][0]);

            // Building's info
            L.tooltip(centerPosition, { content: feature.properties.name, permanent: true, direction: 'center', className: "my-labels" })
                .addTo(map);

            var smallPopup = L.popup()
                .setLatLng(centerPosition)
                .setContent(bdListSelect[i][1]);

            // Full info and visit method
            layer.bindPopup(L.popup({autoClose: false})
                .setLatLng(centerPosition)
                .setContent(`
                    <div class="modal-dialog" role="document" >
                        <div class="modal-content overflow-auto" style="height: 200px">
                            <div class="modal-header">
                                <h5 class="modal-title">` + bdListSelect[i][1] + `</h5>
                                <button type="button" id="` + i + `" class="postPlace btn btn-outline-success">Visit</button>
                            </div>
                            <div class="modal-body">
                                <p>` + `Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.` + `</p>
                                <img src="../static/images/test.jpg" alt="building image" class="img-fluid">
                            </div>
                            <div class="modal-footer">
                            </div>
                        </div>
                    </div>
                    `))

            layer.getPopup().on('remove', function() {
                if (bdListSelect[i][2]) {
                    mark(layer);
                } else {
                    unMark(layer);
                }
            });

            // When hovering a building
            layer.on('mouseover', function () {
                if (!bdListSelect[i][2]) mark(layer);
                smallPopup.openOn(map);
            });
            layer.on('mouseout', function () {
                if (!bdListSelect[i][2]) unMark(layer);
                smallPopup.close();
            });

            // When click on a building
            layer.on('click', function () {
                // Displace unvisit if building's visiting
                if (bdListSelect[i][2]) {
                    $(document).ready(function(){
                        $(".postPlace").replaceWith(`<button type="button" id="` + i + `" class="postPlace btn btn-outline-danger">Unvisit</button>`);
                    })
                }

                layer.openPopup();
            });
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

// Add place and update path, distance when click "visit"
$(document).on('click','.postPlace',function() {
    let bdIndex = this.id

    fetch(`/post_place/${bdListSelect[bdIndex][0]}`, {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
    })
        .then(function (response) {
            return response.json();
        }).then(function (response) {
            // Selecting default buildings
            if (response.length == 0) {
                return 0;
            }

            bdListSelect[bdIndex][2] = !bdListSelect[bdIndex][2];
            map.closePopup();

            renderRoad(response[0]);
            // document.getElementById("distance").textContent = response[1];
            console.log("Database' size = " + response[2]);
        });
});

function renderRoad(posList) {
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

// Testing

// roadData.features.forEach(feature => {
//     feature.geometry.coordinates.forEach(coordinate => {
//         var marker = L.marker(L.latLng(coordinate[1], coordinate[0])).addTo(map);
//         marker.bindPopup("[" + coordinate[1] + ", " + coordinate[0] + "]").openPopup();
//     });
// });

$('.leaflet-container').css('cursor', 'crosshair');


// Select named building and unselect others
export function selectPlace(name) {
    if (name.includes("-")) name = name.split("-")[1];
    // Todo: Marker for other places

    bdListSelect.forEach(bd => {
        bd[2] = (bd[0] == name) ? true : false;
    })
    buildingLayers.forEach(layer => {
        unMark(layer)
    })

    let layer = buildingLayers.get(name);
    if (layer) mark(layer);
}

export function findPath(name1, name2) {
    name1 = name1.includes("-") ? name1.split("-")[1] : name1;
    name2 = name2.includes("-") ? name2.split("-")[1] : name2;

    lineGroup.clearLayers();

    var data = {
        "name1": name1,
        "name2": name2,
    };

    fetch(`/find_path/`, {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    })
        .then(function (response) {
            return response.json();
        }).then(function (response) {
            if (response.length == 0) {
                return 0;
            }

            map.closePopup();
            renderRoad(response[0]);
            // document.getElementById("distance").textContent = response[1];
            console.log("Database' size = " + response[2]);
        });
}
