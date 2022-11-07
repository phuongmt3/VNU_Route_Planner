import { geojsonFeature as buildings } from './buildingData.js'

const buildingMap = new Map();

export function renderBuilding(map, placeList, buildingNameGroup) {
    L.geoJSON(buildings, {
        onEachFeature: function (feature, layer) {
            const centerPosition = calculateCenter(feature.geometry.coordinates[0][0]);
            buildingNameGroup.addLayer(L.tooltip(centerPosition, { content: feature.properties.name, permanent: true, direction: 'center', className: "my-labels" })
                    .addTo(map));
            const smallPopup = L.popup()
                    .setLatLng(centerPosition);
    
            buildingMap.set(feature.properties.name, { "layer": layer, "centerPosition": centerPosition, "smallPopup": smallPopup });
        },
        style: {
            "color": "#FF0000",
            "weight": 2,
            "opacity": 0,
            "fillOpacity": 0
        }
    }).addTo(map);

    setBuildingEvent(placeList, map);
}

function setBuildingEvent(placeList, map) {
    for (let buildingInfo of placeList) {
        // BuildingInfo: name, description, details, ...
        // BuildingData: layer, centerPosition, ...

        let buildingData = buildingMap.get(buildingInfo[0]);
        if (!buildingData) continue;

        // When hovering a building -> description
        buildingData.smallPopup
                .setContent(buildingInfo[1]);
        buildingData.layer.on('mouseover', function () {
            if (!buildingInfo[4]) mark(buildingData.layer);
            buildingData.smallPopup.openOn(map);
        });
        buildingData.layer.on('mouseout', function () {
            if (!buildingInfo[4]) unMark(buildingData.layer);
            buildingData.smallPopup.close();
        });

        // When clicking a building -> detail, visit/unvisit
        buildingData.layer.bindPopup(L.popup({autoClose: false})
                .setLatLng(buildingData.centerPosition)
                .setContent(`
                    <div class="modal-dialog" role="document" >
                        <div class="modal-content overflow-auto" style="max-height: 200px">
                            <div class="modal-header">
                                <h5 class="modal-title">` + buildingInfo[1] + `</h5>
                                <button type="button" id="` + buildingInfo[0] + `" class="postPlace btn btn-outline-success ms-2">Visit</button>
                            </div>
                            <div class="modal-body">
                                <p>` + buildingInfo[2] + `</p>
                                <a href="` + buildingInfo[3] + `">
                                <img id="image" class="img-fluid" src="../static/images/` + buildingInfo[0] + `_01.jpg" onerror="this.onerror=null; this.remove();" alt="">
                                <img id="image" class="img-fluid" src="../static/images/` + buildingInfo[0] + `_02.jpg" onerror="this.onerror=null; this.remove();" alt="">
                                </a>
                            </div>
                            <div class="modal-footer">
                            </div>
                        </div>
                    </div>
                    `));
        buildingData.layer.on('click', function () {
            if (buildingInfo[4]) {
                $(document).ready(function(){
                    $(".postPlace").replaceWith(`<button type="button" id="` + buildingInfo[0] + `" class="postPlace btn btn-outline-danger">Unvisit</button>`);
                })
            }

            buildingData.layer.openPopup();
        });
    }
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

// Unmark all buildings
export function clearPlaceSelect() {
    placeList.forEach(bd => {
        bd[4] = false;
    });
    buildingMap.forEach(building => {
        unMark(building.layer)
    });
}

// Select a named building 
export function selectPlace(name) {
    if (name.includes("-")) name = name.split("-")[1];

    for (const buildingInfo of placeList) {
        if (buildingInfo[0] != name) continue;
        buildingInfo[4] = !buildingInfo[4];

        let buildingData = buildingMap.get(name);
        if (!buildingData) return;

        if (buildingInfo[4]) {
            mark(buildingData.layer);
        } else {
            unMark(buildingData.layer);
        }
        break;
    }
}

export function mark(layer) {
    layer.setStyle({
        "opacity": 1,
        "fillOpacity": 0.25
    });
}

export function unMark(layer) {
    layer.setStyle({
        "opacity": 0,
        "fillOpacity": 0
    });
}