// ID: 11
var Agility_Training = L.icon({
    iconUrl: '../static/icon/Icon_Agility_Training.svg',
    iconSize:     [30, 30], // size of the icon
    iconAnchor:   [15, 15], // point of the icon which will correspond to marker's location
    popupAnchor:  [0, -15] // point from which the popup should open relative to the iconAnchor
});

// ID: 2
var T_waypoint = L.icon({
    iconUrl: 'https://preview.redd.it/2yv5x9hto5f61.png?width=341&format=png&auto=webp&s=eccf34f646917d5a7c0196de5c2fc2e7ef3e2427',
    iconSize:     [34, 34], // size of the icon
    iconAnchor:   [17, 34], // point of the icon which will correspond to marker's location
    popupAnchor:  [0, -34] // point from which the popup should open relative to the iconAnchor
});

// ID: 3
var Restaurant = L.icon({
    iconUrl: '../static/icon/UI_Restaurant.png',
    iconSize:     [26, 29], // size of the icon
    iconAnchor:   [13, 14], // point of the icon which will correspond to marker's location
    popupAnchor:  [0, -14] // point from which the popup should open relative to the iconAnchor
});

// ID: 4
var Special_Souvenir = L.icon({
    iconUrl: '../static/icon/Icon_Special_Souvenir.svg',
    iconSize:     [20, 20], // size of the icon
    iconAnchor:   [13, 10], // point of the icon which will correspond to marker's location
    popupAnchor:  [0, -10] // point from which the popup should open relative to the iconAnchor
});


export function renderMarkers(map, markerList, placeList, foodGroup, souvenirGroup) {
    // markerList: name, posY, posX, main
    // placeList: name, description, details, ...

    markerList.forEach(marker => {
        var thisMarker = L.marker([marker[1], marker[2]]);
        var smallPopup;

        // Gates (always on)
        if (marker[3] == 2) {
            thisMarker.setIcon(T_waypoint);
            thisMarker.addTo(map);
        // Field (always on)
        } else if (marker[3] == 11) {
            thisMarker.setIcon(Agility_Training);
            thisMarker.addTo(map);
        } else if (marker[3] == 3) {
            thisMarker.setIcon(Restaurant);
            foodGroup.addLayer(thisMarker);
        } else if (marker[3] == 4) {
            thisMarker.setIcon(Special_Souvenir);
            souvenirGroup.addLayer(thisMarker);
        }

        if (marker[3] == 2) {
            smallPopup = L.popup({ offset: [0, -20] })
                .setLatLng([marker[1], marker[2]])
                .setContent(marker[0]);
        } else {
            smallPopup = L.popup({ offset: [0, -0] })
                .setLatLng([marker[1], marker[2]])
                .setContent(marker[0]);
        }
        
        let foundIndex = placeList.findIndex(x => x[0] == marker[0]);
        if (foundIndex == -1) return;

        thisMarker.bindPopup(L.popup({autoClose: false})
                .setLatLng([marker[1], marker[2]])
                .setContent(`
                    <div class="modal-dialog" role="document" >
                        <div class="modal-content overflow-auto" style="max-height: 200px">
                            <div class="modal-header">
                                <h5 class="modal-title">` + placeList[foundIndex][1] + `</h5>
                                <button type="button" id="` + placeList[foundIndex][0] + `" class="postPlace btn btn-outline-success ms-2">Visit</button>
                            </div>
                            <div class="modal-body">
                                <p>` + placeList[foundIndex][2] + `</p>
                                <a href="` + placeList[foundIndex][3] + `">
                                <img id="image" class="img-fluid" src="../static/images/` + placeList[foundIndex][0] + `_01.jpg" onerror="this.onerror=null; this.remove();" alt="">
                                <img id="image" class="img-fluid" src="../static/images/` + placeList[foundIndex][0] + `_02.jpg" onerror="this.onerror=null; this.remove();" alt="">
                                </a>
                            </div>
                            <div class="modal-footer">
                            </div>
                        </div>
                    </div>
                    `));
    
        thisMarker.on('mouseover', function () {
            smallPopup.openOn(map);
        });
        thisMarker.on('mouseout', function () {
            smallPopup.close();
        });
        thisMarker.on('click', function () {
            thisMarker.openPopup();
        });
    });
}