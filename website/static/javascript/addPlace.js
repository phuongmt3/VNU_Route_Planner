export function onMapClick(map) {
    var popup = L.popup();

    function onMapClick(e) {
        popup
            .setLatLng(e.latlng)
            .setContent(`<button type="button" class="newPlace btn btn-outline-success">` + e.latlng.toString() + `</button>`)
            .openOn(map);
    }

    map.on('click', onMapClick);

    $(document).on('click','.newPlace',function() {
        map.closePopup();

        let posX = parseFloat(this.textContent.split('(')[1]);
        let posY = parseFloat(this.textContent.split(' ')[1]);

        var data = {
            "posX": posX,
            "posY": posY,
        };

        fetch(`/add_place/`, {
            method: "POST",
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
    });
}