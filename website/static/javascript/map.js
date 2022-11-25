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
        <div class="accordion" id="accordionExample">
        <div class="accordion-item">
            <h2 class="accordion-header" id="headingOne">
            <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapseOne" aria-expanded="false" aria-controls="collapseOne">
                How to use
            </button>
            </h2>
            <div id="collapseOne" class="accordion-collapse collapse" aria-labelledby="headingOne" data-bs-parent="#accordionExample" style="">
            <div class="accordion-body">
                <p> - Nhập mã sinh viên/ tên sinh viên vào ô tìm kiếm rồi ấn enter để load dữ liệu.</p>
                <p> - Khi đến sự kiện, trên bản đồ sẽ hiển thị đường đi ngắn nhất theo dự đoán.</p>
                <p> - Có thể xem đường đi các sự kiện chưa hoặc đã diễn ra bằng cách click vào sự kiện trên calendar.</p>
                <p> - Để thêm sự kiện, click vào khoảng trống trên calendar. Để xóa, chuột phải rồi click icon X trên sự kiện.</p>
                <p> - Để thêm địa điểm muốn ghé qua trên đường đi, chọn địa điểm trên map rồi click vào Visit, ngược lại, click Unvisit.</p>
            </div>
            </div>
        </div>

        <div class="accordion-item">
            <h2 class="accordion-header" id="headingTwo">
            <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapseTwo" aria-expanded="false" aria-controls="collapseTwo">
                About
            </button>
            </h2>
            <div id="collapseTwo" class="accordion-collapse collapse" aria-labelledby="headingTwo" data-bs-parent="#accordionExample" style="">
            <div class="accordion-body">
                <p>VNU Route Planner - Công cụ quản lý thời gian hiệu quả hàng đầu dành riêng cho sinh viên UET!</p>
                <p>Sản phẩm được phát triển bởi nhóm Avidity - UET.</p>
                <p>Tất cả hình ảnh minh họa thuộc quyền sở hữu của SGUET.</p>
            </div>
            </div>
        </div>

        <div class="accordion-item">
            <h2 class="accordion-header" id="headingThree">
            <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapseThree" aria-expanded="false" aria-controls="collapseThree">
                Other tools
            </button>
            </h2>
            <div id="collapseThree" class="accordion-collapse collapse" aria-labelledby="headingThree" data-bs-parent="#accordionExample" style="">
            <div class="accordion-body list-group">
                <a href="http://127.0.01:5000/calendar_overlap" class="list-group-item list-group-item-action flex-column align-items-start active">
                    <div class="d-flex w-100 justify-content-between">
                        <h5 class="mb-1">Calendar Overlap</h5>
                    </div>
                    <small>Kết hợp thời gian biểu của 1 nhóm người nhất định để tìm thời gian thích hợp nhất (VD: tìm thời gian học bù tốt nhất).</small>
                </a>
                <br>
                <a href="http://127.0.01:5000/timelineChart" class="list-group-item list-group-item-action flex-column align-items-start active">
                    <div class="d-flex w-100 justify-content-between">
                        <h5 class="mb-1">Class Timeline</h5>
                    </div>
                    <small>Theo dõi lịch học của toàn trường theo từng giờ và phòng học để tìm phòng học trống.</small>
                </a>
            </div>
            </div>
        </div>
        </div>
    </div>

    <div class="slide-menu-bottom">
        <span> Source code: <a href="https://github.com/phuongmt3/VNU_Route_Planner"><span style="font-weight: bold">Github</span></span></a></span>
    </div>
`).addTo(map);

var inputBox = L.control.inputBox({ position: 'topleft' }).addTo(map);

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
    fetch(`/find_path/${name1}/${name2}`)
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