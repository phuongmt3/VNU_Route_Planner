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
    "ESRI satellite": mb,
};

L.Control.textbox = L.Control.extend({
    onAdd: function() {
        var text = L.DomUtil.create('div');
        text.id = "info_text";
        text.innerHTML = `
            <span class="material-symbols-outlined">assistant_direction</span>
            
            <span class="input-wrap"><span class="width-machine" style="opacity: 0;">Cổng chính ĐHQGHN</span>
                <input class="input" list="startPlaces" name="startPlace" id="startPlace">
            </span>
            
            <span class="col-auto material-symbols-outlined">arrow_right</span>
            
            <span class="input-wrap"><span class="width-machine" style="opacity: 0;">Cổng chính ĐHQGHN</span>
                <input class="input" list="endPlaces" name="endPlace" id="endPlace">
            </span>
            `;
        
        return text;
    },

    onRemove: function() {
        // Nothing to do here
    }
});
L.control.textbox = function(opts) { return new L.Control.textbox(opts);}
L.control.textbox({ position: 'topleft' }).addTo(map);

const buildingNameGroup = L.layerGroup()
const foodGroup = L.layerGroup()
const souvenirGroup = L.layerGroup()
const parkingGroup = L.layerGroup()

const lineGroup = L.featureGroup([], { snakingPause: 0 })
const distancePopup = L.popup()

lineGroup.on('mouseover', function (e) {
    distancePopup.setLatLng(e.latlng).openOn(map);
});
lineGroup.on('mouseout', function () {
    distancePopup.close();
});

renderBuilding(map, placeList, buildingNameGroup);
renderMarkers(map, markerList, placeList, foodGroup, souvenirGroup, parkingGroup);

var overlayMaps = {
    "Path": lineGroup,
    "Building's name": buildingNameGroup,
    "Food": foodGroup,
    "Souvenir": souvenirGroup,
    "Parking": parkingGroup,
};

var layerControl = L.control.layers(baseMaps, overlayMaps).addTo(map);

var developMode = L.easyButton({
    position: 'topright',
    states: [{
            stateName: 'toggle_develop_mode',       
            icon:      '<span class="material-symbols-outlined widget-code">build</span>',            
            title:     'toggle develop mode',     
            onClick: function(btn, map) {     
                onMapClick(map);    // Add new place

                selectAllBuilding();
                lineGroup.addTo(map);
                buildingNameGroup.addTo(map);
                foodGroup.addTo(map);
                souvenirGroup.addTo(map);
                parkingGroup.addTo(map);
            }
        }]
}).addTo(map);

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

            renderRoad(map, response[0], lineGroup);
            distancePopup.setContent("Khoảng cách ~ " + response[1] + " mét");
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

// Dealing with Input width
let el = document.querySelector(".input-wrap .input");
let widthMachine = document.querySelector(".input-wrap .width-machine");
el.addEventListener("keyup", () => {
  widthMachine.innerHTML = el.value;
});

$('.leaflet-container').css('cursor', 'crosshair');

