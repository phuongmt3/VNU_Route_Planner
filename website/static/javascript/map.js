import { renderMarkers } from './marker.js';
import { onMapClick } from './addPlace.js';
import { renderBuilding, selectPlace, clearPlaceSelect, selectAllBuilding } from './building.js';
import { clearLine, renderRoad } from './road.js';


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

renderBuilding(map, placeList, buildingNameGroup);
renderMarkers(map, markerList, placeList, foodGroup, souvenirGroup, parkingGroup);

var overlayMaps = {
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
                buildingNameGroup.addTo(map);
                foodGroup.addTo(map);
                souvenirGroup.addTo(map);
                parkingGroup.addTo(map);

                $('.leaflet-container').css('cursor', 'crosshair');
            }
        }]
}).addTo(map);

var layerControl = L.control.layers(baseMaps, overlayMaps).addTo(map);

// Todo: add more info
L.control.slideMenu('<h2>VNU Route Planner</h2>').addTo(map);

var inputBox = L.control.inputBox({ position: 'topleft' }).addTo(map);
// var locationBox = L.control.locationBox({ position: 'topleft' }).addTo(map);

export var notification = L.control
    .notifications({
        timeout: 3000,
        position: 'topleft',
        closable: true,
        dismissable: true,
    })
    .addTo(map);

// Add place and update path, distance when click "visit"
$(document).on('click','.postPlace', async function() {
    let placeName = this.id;

    let res = await fetch(`/post_place/${placeName}`, { method: "POST", headers: { 'Content-Type': 'application/json' } });
    res = await res.json();

    clearLine();

    selectPlace(placeName, 'red');
            
    let color = ['red', 'deepskyblue', 'lime'];
    for (let i = 0; i < res.roads.length; i++) {
        if (res.roads[i][0].length < 2) continue;
        renderRoad(map, res.roads[i][0], res.roads[i][1], color[i]);
    }

    displayMessages(res.message)
});

// Change start/ end point when input text-box change
// $(document).on('change', '#startPlace, #endPlace', function() {
//     var startPlace = document.querySelector("#startPlace").value;
//     var endPlace = document.querySelector("#endPlace").value;

//     clearPlaceSelect();
//     selectPlace(endPlace);
//     findPath(startPlace, endPlace);
// });

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

inputBox.getContainer().addEventListener('mouseover', function () {
    map.dragging.disable();
});

inputBox.getContainer().addEventListener('mouseout', function () {
    map.dragging.enable();
});

export async function findPath(name1, name2, color) {
    var data = {
        "name1": name1,
        "name2": name2,
    };

    let index = (color == 'red') ? 0 : (color == 'deepskyblue') ? 1 : 2;
    let response = await fetch(`/find_path/${index}`, { method: "POST", headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
    response = await response.json();

    if (response.length == 0) {
        return 0;
    }

    renderRoad(map, response[0], response[1], color);
}

export async function clearMap() {
    clearLine();
    clearPlaceSelect();
    await fetch(`/reset_roads/`, { method: "POST", headers: { 'Content-Type': 'application/json' } });
}

export function displayMessages(message) {
    notification.clear();

    for (let i = 0; i < message.length; i++) {
        let thisMessage = message[i].split(/ (.*)/s);
    
        if (thisMessage[0] == "Success") 
            notification.success('Success', thisMessage[1]);
        else if (thisMessage[0] == "Info")
            notification.info('Info', thisMessage[1]);
        else 
            notification.warning('Warning', thisMessage[1]);
    }
}