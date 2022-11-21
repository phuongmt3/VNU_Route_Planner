import { renderMarkers } from './marker.js';
import { onMapClick } from './addPlace.js';
import { renderBuilding, selectPlace, clearPlaceSelect, selectAllBuilding } from './building.js';
import { road, clearRoad, renderRoad } from './road.js';


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
    "Path": road,
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
                road.addTo(map);
                buildingNameGroup.addTo(map);
                foodGroup.addTo(map);
                souvenirGroup.addTo(map);
                parkingGroup.addTo(map);

                $('.leaflet-container').css('cursor', 'crosshair');
            }
        }]
}).addTo(map);

var layerControl = L.control.layers(baseMaps, overlayMaps).addTo(map);

L.control.slideMenu(`
    <div class="slide-menu-header">VNU Route Planner</div>

    <div class="slide-menu-content">
        <ul class="nav nav-tabs" role="tablist">
            <li class="nav-item" role="presentation">
                <a class="nav-link active" data-bs-toggle="tab" href="#how_to_use" aria-selected="true" role="tab">How to use</a>
            </li>
            <li class="nav-item" role="presentation">
                <a class="nav-link" data-bs-toggle="tab" href="#about" aria-selected="true" role="tab">About</a>
            </li>
            <li class="nav-item dropdown">
                <a class="nav-link dropdown-toggle" data-bs-toggle="dropdown" href="#" role="button" aria-haspopup="true" aria-expanded="false">Other tools</a>
                <div class="dropdown-menu" style="">
                    <a class="dropdown-item" href="http://127.0.0.1:5000/calendar_overlap">Calendar Overlap</a>
                </div>
            </li>
        </ul>
        <div id="myTabContent" class="tab-content">
            <div class="tab-pane fade active show" id="how_to_use" role="tabpanel">
                <p> - Nhập mã sinh viên vào ô tìm kiếm rồi ấn enter để load dữ liệu của sinh viên.</p>
                <p> - ...</p>
            </div>
            <div class="tab-pane fade" id="about" role="tabpanel">
                <p>VNU Route Planner - Công cụ quản lý thời gian hiệu quả hàng đầu dành riêng cho sinh viên UET!</p>
                <p>Sản phẩm được phát triển bởi nhóm Avidity - UET.</p>
                <p>Tất cả hình ảnh minh họa thuộc quyền sở hữu của SGUET.</p>
            </div>
        </div>
    </div>

    <div class="slide-menu-bottom">
        <span> Source code: <a href="https://github.com/phuongmt3/VNU_Route_Planner"><span style="font-weight: bold">Github</span></span></a></span>
    </div>
    
`).addTo(map);

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
                
            clearRoad();
            renderRoad(map, response[0], response[1]);
            selectPlace(placeName);

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

inputBox.getContainer().addEventListener('mouseover', function () {
    map.dragging.disable();
});

inputBox.getContainer().addEventListener('mouseout', function () {
    map.dragging.enable();
});

export function findPath(name1, name2) {

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
            
            clearRoad();
            renderRoad(map, response[0], response[1]);
            console.log("Database' size = " + response[2]);
        });
}

export function clearMap() {
    clearRoad();
    clearPlaceSelect();
}

export function displayMessage(message) {
    notification.clear();

    let thisMessage = message.split(/ (.*)/s);

    if (thisMessage[0] == "Success") 
        notification.success('Success', thisMessage[1]);
    else if (thisMessage[0] == "Info")
        notification.info('Info', thisMessage[1]);
    else 
        notification.warning('Warning', thisMessage[1]);
}

$("#Reset_Dijkstra_table").click(() => {
    fetch('/resetDijkstra/');
});