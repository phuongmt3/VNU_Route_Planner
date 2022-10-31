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

var Icon_Inventory_Food = L.icon({
    iconUrl: 'static/icon/Icon_Food.png',
    iconSize: [30, 30],
    iconAnchor: [15, 15],
    popupAnchor: [0, -15]
});

var Icon_Book = L.icon({
    iconUrl: 'static/icon/Icon_Store.png',
    iconSize: [30, 30],
    iconAnchor: [15, 15],
    popupAnchor: [0, -15]
});

var food1 = L.marker([21.038229, 105.782236], { icon: Icon_Inventory_Food }).bindPopup("I'm a food marker 1!");
var food2 = L.marker([21.038477, 105.783226], { icon: Icon_Inventory_Food }).bindPopup("I'm a food marker 2!");
var food3 = L.marker([21.037934, 105.782222], { icon: Icon_Inventory_Food }).bindPopup("I'm a food marker 3!");
var food4 = L.marker([21.040682, 105.783016], { icon: Icon_Inventory_Food }).bindPopup("I'm a food marker 4!");
var food5 = L.marker([21.038478, 105.782426], { icon: Icon_Inventory_Food }).bindPopup("I'm a food marker 5!");
var food6 = L.marker([21.04057, 105.782233], { icon: Icon_Inventory_Food }).bindPopup("I'm a food marker 6!");
var foodMarkers = L.layerGroup([food1, food2, food3, food4, food5, food6]);

var bookStore = L.marker([21.036843, 105.782241], { icon: Icon_Book }).bindPopup("I'm a book store!");
var bookStores = L.layerGroup([bookStore]);

var overlayMaps = {
    "Food": foodMarkers,
    "Book Store": bookStores
};

var layerControl = L.control.layers(baseMaps, overlayMaps).addTo(map);

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

// Render roads from posx, posy
var lineGroup = L.layerGroup([], { snakingPause: 0 })

for (let i = 0; i < posx.length - 1; i++) {
    var latlngs = [
        [posx[i], posy[i]], [posx[i + 1], posy[i + 1]]
    ];
    lineGroup.addLayer(L.polyline(latlngs, { color: 'red' }))
}
lineGroup.addTo(map).snakeIn();

// Render buildings and building selecting events 
for (let i = 0; i < bdListSelect.length; i++) {
    L.geoJSON(buildings, {
        filter: function (feature) {
            return feature.properties.name.toLowerCase() == bdListSelect[i][0].toLowerCase();
        },
        onEachFeature: function (feature, layer) {
            var position = calculateCenter(feature.geometry.coordinates[0][0]);

            // Building's info
            L.tooltip(position, { content: feature.properties.name, permanent: true, direction: 'center', className: "my-labels" })
                .addTo(map);
            layer.bindPopup(bdListSelect[i][1]);

            layer.on('click', function (e) {
                if (bdListSelect[i][2] == 0) {
                    map.setView(e.latlng);
                    bdListSelect[i][2] = 1;
                } else {
                    bdListSelect[i][2] = 0;
                }

                lineGroup.clearLayers()

                // Send and receive data backend
                fetch(`/addplace/${feature.properties.name}`)
                    .then(function (response) {
                        return response.json();
                    }).then(function (pos) {
                        // Render roads from pos
                        for (let i = 0; i < pos.length - 1; i++) {
                            var latlngs = [
                                [pos[i][0], pos[i][1]], [pos[i + 1][0], pos[i + 1][1]]
                            ];
                            var line = L.polyline(latlngs, { color: 'red' });
                            lineGroup.addLayer(line);
                        }
                        lineGroup.addTo(map).snakeIn();
                    });
            });

            // Red mark
            layer.on('mouseover', function (e) {
                if (!bdListSelect[i][2]) mark(layer);
                layer.openPopup(position);
            });
            layer.on('mouseout', function (e) {
                if (!bdListSelect[i][2]) unMark(layer);
                layer.closePopup(position);
            });
            if (bdListSelect[i][2]) {
                mark(layer);
            }
        },
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

// Testing

// roadData.features.forEach(feature => {
//     feature.geometry.coordinates.forEach(coordinate => {
//         var marker = L.marker(L.latLng(coordinate[1], coordinate[0])).addTo(map);
//         marker.bindPopup("[" + coordinate[1] + ", " + coordinate[0] + "]").openPopup();
//     });
// });

$('.leaflet-container').css('cursor', 'crosshair');

