import {geojsonFeature as buildings} from '../static/buildings.js'
import {geojsonFeature as roads} from '../static/roads.js'

// Boundary Canvas:

// var geom = {
//     "type": "MultiPolygon", "coordinates": [[[[105.7812545, 21.0409001], [105.7817336, 21.0408875], [105.781739, 21.0409629], [105.783365, 21.0409076], [105.7833621, 21.0408215], [105.7833341, 21.0399802], [105.7833084, 21.0392067], [105.7828711, 21.0392179], [105.7828676, 21.0391067], [105.7826902, 21.039111], [105.7826675, 21.0385919], [105.7836409, 21.038555], [105.7836311, 21.0378809], [105.7830562, 21.0378918], [105.7830574, 21.0376439], [105.7828284, 21.0376461], [105.7828282, 21.0375709], [105.7828249, 21.037441], [105.7827066, 21.0374437], [105.7825035, 21.037183], [105.7824181, 21.0371859], [105.7824136, 21.0370728], [105.7824157, 21.0369412], [105.7825348, 21.0369377], [105.7825329, 21.0368812], [105.7829769, 21.0368682], [105.7829738, 21.0367756], [105.7823884, 21.0367927], [105.7822806, 21.0367958], [105.7817635, 21.0368219], [105.781136, 21.0374073], [105.7812545, 21.0409001]]]]
// };
// var mb = L.TileLayer.boundaryCanvas('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
//     maxZoom: 19,
//     boundary: geom,
//     attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
// });

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
    iconSize:     [30, 30],
    iconAnchor:   [15, 15], 
    popupAnchor:  [0, -15]
});

var Icon_Book = L.icon({
    iconUrl: 'static/icon/Icon_Store.png',
    iconSize:     [30, 30], 
    iconAnchor:   [15, 15], 
    popupAnchor:  [0, -15] 
});

var food1 = L.marker([21.038229, 105.782236], {icon: Icon_Inventory_Food}).bindPopup("I'm a food marker 1!");
var food2 = L.marker([21.038477, 105.783226], {icon: Icon_Inventory_Food}).bindPopup("I'm a food marker 2!");
var food3 = L.marker([21.037934, 105.782222], {icon: Icon_Inventory_Food}).bindPopup("I'm a food marker 3!");
var food4 = L.marker([21.040682, 105.783016], {icon: Icon_Inventory_Food}).bindPopup("I'm a food marker 4!");
var food5 = L.marker([21.038478, 105.782426], {icon: Icon_Inventory_Food}).bindPopup("I'm a food marker 5!");
var food6 = L.marker([21.04057, 105.782233], {icon: Icon_Inventory_Food}).bindPopup("I'm a food marker 6!");
var foodMarkers = L.layerGroup([food1, food2, food3, food4, food5, food6]);

var bookStore = L.marker([21.036843, 105.782241], {icon: Icon_Book}).bindPopup("I'm a book store!");
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

// Buildings selecting events 
for (let i = 0; i < bdListSelect.length; i++) {
    L.geoJSON(buildings, {
        filter: function(feature) {
            return feature.properties.name.toLowerCase() == bdListSelect[i][0].toLowerCase();
        }, 
        onEachFeature: function(feature, layer) {
            var position = calculateCenter(feature.geometry.coordinates[0][0]);

            // Building's name
            L.tooltip(position, {content: feature.properties.name, permanent: true, direction: 'center', className: "my-labels"})
                .addTo(map);

            // Building's info
            layer.bindPopup(bdListSelect[i][1]);
            layer.on('click', function(e) {
                if (bdListSelect[i][2] == 0) {
                    map.setView(e.latlng);

                    bdListSelect[i][2] = 1;
                    layer.openPopup(position);
                } else {
                    bdListSelect[i][2] = 0;
                    layer.closePopup(position);
                }
            });

            // Red mark
            layer.on('mouseover', function (e) {
                if (!bdListSelect[i][2]) mark(layer);
            });
            layer.on('mouseout', function (e) {
                if (!bdListSelect[i][2]) unMark(layer);
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

// Hide building's name when change layer to OpenStreetMap
map.on('baselayerchange', function(e) {
    console.log(e.name);
    if (e.name == "OpenStreetMap") {
        $(".leaflet-tooltip").css("display","none")
    } else { 
        $(".leaflet-tooltip").css("display","block")
    }
});

// Testing
L.geoJSON(roads, {
    style: {
        "color": "#FF0000",
        "weight": 2,
        "opacity": 1,
        "fillOpacity": 0.25
    }
}).addTo(map);

// buildings.features.forEach(feature => {
//     feature.geometry.coordinates[0][0].forEach(coordinate => {
//         var marker = L.marker(L.latLng(coordinate[1], coordinate[0])).addTo(map);
//         marker.bindPopup("[" + coordinate[1] + ", " + coordinate[0] + "]").openPopup();

//         console.log(coordinate);
//     });
// });

// roads.features.forEach(feature => {
//     feature.geometry.coordinates.forEach(coordinate => {
//         var marker = L.marker(L.latLng(coordinate[1], coordinate[0])).addTo(map);
//         marker.bindPopup("[" + coordinate[1] + ", " + coordinate[0] + "]").openPopup();
//     });
// });

// var latlngs = [
//     [ 21.0376489, 105.7837679 ], [ 21.0378964, 105.7837739 ], [ 21.0382533, 105.7837838 ]
// ];

// var polyline = L.polyline(latlngs, {color: 'blue'}).addTo(map);

    