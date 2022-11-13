import { renderMarkers } from './marker.js';
import { onMapClick } from './addPlace.js';
import { renderBuilding, selectPlace, clearPlaceSelect, selectAllBuilding } from './building.js';
import { renderRoad } from './road.js';

var osm = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    id: "osm",
    maxZoom: 19,
    attribution: '© OpenStreetMap'
});

var mb = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
    id: "mb",
    maxZoom: 19,
    attribution: 'Tiles &copy; Esri &mdash'
});

export var map = L.map('map', {
    center: [21.038965, 105.782375],
    zoom: 17,
    zoomSnap: 0.25,
    wheelPxPerZoomLevel: 120,
    zoomControl: false,
    layers: [mb]
});

var baseMaps = {
    "OpenStreetMap": osm,
    "ESRI satellite": mb,
};

const buildingNameGroup = L.layerGroup()
const foodGroup = L.layerGroup()
const souvenirGroup = L.layerGroup()
const parkingGroup = L.layerGroup()

const lineGroup = L.featureGroup([], { snakingPause: 0 })
const distancePopup = L.popup()

renderBuilding(map, placeList, buildingNameGroup);
renderMarkers(map, markerList, placeList, foodGroup, souvenirGroup, parkingGroup);

var overlayMaps = {
    "Path": lineGroup,
    "Building's name": buildingNameGroup,
    "Food": foodGroup,
    "Souvenir": souvenirGroup,
    "Parking": parkingGroup,
};

var developMode = L.easyButton({
    position: 'topright',
    states: [{
            stateName: 'toggle_develop_mode',       
            icon:      '<span class="material-symbols-outlined widget-code" style="opacity: 0.5;">build</span>',            
            title:     'toggle develop mode',     
            onClick: function(btn, map) {     
                onMapClick(map);    // Add new place

                selectAllBuilding();
                lineGroup.addTo(map);
                buildingNameGroup.addTo(map);
                foodGroup.addTo(map);
                souvenirGroup.addTo(map);
                parkingGroup.addTo(map);

                $('.leaflet-container').css('cursor', 'crosshair');
            }
        }]
}).addTo(map);

var layerControl = L.control.layers(baseMaps, overlayMaps).addTo(map);

L.control.slideMenu('<h2>VNU Route Planner</h2>').addTo(map);

var inputBox = L.control.inputBox({ position: 'topleft' }).addTo(map);
// var locationBox = L.control.locationBox({ position: 'topleft' }).addTo(map);

// Add place and update path, distance when click "visit"
$(document).on('click','.postPlace',function() {
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

            distancePopup.setContent("Khoảng cách ~ " + response[1] + " mét");
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

lineGroup.on('mouseover', function (e) {
    distancePopup.setLatLng(e.latlng).openOn(map);
});

lineGroup.on('mouseout', function () {
    distancePopup.close();
});

inputBox.getContainer().addEventListener('mouseover', function () {
    map.dragging.disable();
});

inputBox.getContainer().addEventListener('mouseout', function () {
    map.dragging.enable();
});

export async function findPath(name1, name2) {
    lineGroup.clearLayers();

    var data = {
        "name1": name1,
        "name2": name2,
    };

    let response = await fetch("/find_path/", { method: "POST", headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
    response = await response.json();

    if (response.length == 0) {
        return 0;
    }

    renderRoad(map, response[0], lineGroup);
    distancePopup.setContent("Khoảng cách ~ " + response[1] + " mét");
    console.log("Database' size = " + response[2]);
}