var T_waypoint = L.icon({
    iconUrl: 'https://preview.redd.it/2yv5x9hto5f61.png?width=341&format=png&auto=webp&s=eccf34f646917d5a7c0196de5c2fc2e7ef3e2427',
    // shadowUrl: '',
    iconSize:     [34, 34], // size of the icon
    // shadowSize:   [50, 64], // size of the shadow
    iconAnchor:   [17, 34], // point of the icon which will correspond to marker's location
    // shadowAnchor: [4, 62],  // the same for the shadow
    popupAnchor:  [0, -34] // point from which the popup should open relative to the iconAnchor
});

export function renderMarkers(markerList, map) {
    markerList.forEach(marker => {
        var thisMarker = L.marker([marker[1], marker[2]], {icon: T_waypoint}).addTo(map);
    
        var smallPopup = L.popup({ offset: [0, -20] })
                .setLatLng([marker[1], marker[2]])
                .setContent(marker[0]);
    
        thisMarker.bindPopup(L.popup({autoClose: false})
                .setLatLng([marker[1], marker[2]])
                .setContent(`
                    <div class="modal-dialog" role="document" >
                        <div class="modal-content overflow-auto" style="height: 200px">
                            <div class="modal-header">
                                <h5 class="modal-title">` + marker[0] + `</h5>
                                <button type="button" id="` + marker[0] + `" class="postPlace btn btn-outline-success">Visit</button>
                            </div>
                            <div class="modal-body">
                                <p>` + `Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.` + `</p>
                                <img src="../static/images/test.jpg" alt="building image" class="img-fluid">
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