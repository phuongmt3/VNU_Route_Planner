import { renderMarkers } from './marker.js';
import { onMapClick } from './addPlace.js';
import { renderBuilding, selectPlace, clearPlaceSelect } from './building.js';
import { renderRoad } from './road.js';

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
    zoomControl: false,
    layers: [mb]
});

var baseMaps = {
    "OpenStreetMap": osm,
    "ESRI satellite": mb
};

const buildingNameGroup = L.layerGroup([]).addTo(map)
const lineGroup = L.layerGroup([], { snakingPause: 0 })
const foodGroup = L.layerGroup([])
const souvenirGroup = L.layerGroup([])

onMapClick(map); // Add new place
renderBuilding(map, placeList, buildingNameGroup);
renderMarkers(map, markerList, placeList, foodGroup, souvenirGroup);

var overlayMaps = {
    "Building's name": buildingNameGroup,
    "Path": lineGroup,
    "Food": foodGroup,
    "Souvenir": souvenirGroup
};

var layerControl = L.control.layers(baseMaps, overlayMaps).addTo(map);

// Add place and update path, distance when click "visit"
$(document).on('click','.postPlace',function() {
    map.closePopup();

    let placeName = this.id
    fetch(`/post_place/${placeName}`, {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
    })
        .then(function (response) {
            return response.json();
        }).then(function (response) {
            if (response.length == 0) 
                return;

            renderRoad(map, response[0], lineGroup);
            selectPlace(placeName);

            console.log("Distance = " + response[1]);
            console.log("Database' size = " + response[2]);
        });
});

// Change start/ end point when input text-box change
$(document).on('change', '#startPlace, #endPlace', function() {
    var startPlace = document.querySelector("#startPlace").value;
    var endPlace = document.querySelector("#endPlace").value;

    clearPlaceSelect();
    selectPlace(endPlace);
    findPath(startPlace, endPlace);
});

// Auto hide building's name
map.on('baselayerchange', function (e) {
    if (e.name == "OpenStreetMap") {
        $(".leaflet-tooltip").css("display", "none")
    } else {
        $(".leaflet-tooltip").css("display", "block")
    }
});

map.on('zoomend', function () {
    if (map.getZoom() < 16) {
        $(".leaflet-tooltip").css("display", "none")
    } else {
        $(".leaflet-tooltip").css("display", "block")
    }
})

export function findPath(name1, name2) {
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
            renderRoad(map, response[0], lineGroup);
            
            console.log("Distance = " + response[1]);
            console.log("Database' size = " + response[2]);
        });
}

$(document).keypress(
    function(event){
      if (event.which == '13') {
        $('#map').focus()
        event.preventDefault();
      }
});

$('.leaflet-container').css('cursor', 'crosshair');

