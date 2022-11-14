// Input MSV box
L.Control.inputBox = L.Control.extend({
    onAdd: function() {
        var text = L.DomUtil.create('div');
        text.id = "inputBox";
        text.innerHTML = `
            <form class="row" action="javascript:void(0);" id="my-form">
                <div class="col-11 form-group">
                    <input type="text" id="student_search" class="form-control" name="student_search" placeholder="MSV, Name, ..." style="height: 38px;">
                </div>
                <div class="col-1" style="padding-left: 0;">
                    <button type="submit" name="submit_button" class="btn btn-primary" id="student_search_btn" value="Search" style="height: 38px;">
                        <span class="material-symbols-outlined">search</span>
                    </button>
                </div>
                <div class="col-11" id="match-list" style="height: 38px;"> 
                <!-- <div class="col-auto">
                    <button type="submit" name="submit_button" class="btn btn-primary" value="Reset Dijkstra database">Reset
                    Dijkstra database</button>
                </div> -->
            </form>
            `;
        
        return text;
    },

    onRemove: function() {
        // Nothing to do here
    }
});
L.control.inputBox = function(opts) { return new L.Control.inputBox(opts);}

// Show start and end place
L.Control.locationBox = L.Control.extend({
    onAdd: function() {
        var text = L.DomUtil.create('div');
        text.id = "info_text";
        text.innerHTML = `
            <span class="material-symbols-outlined">assistant_direction</span>
            <input list="places" name="startPlace" id="startPlace">
            <span class="material-symbols-outlined">arrow_right</span>
            <input list="places" name="endPlace" id="endPlace">
            `;
        
        return text;
    },

    onRemove: function() {
        // Nothing to do here
    }
});
L.control.locationBox = function(opts) { return new L.Control.locationBox(opts);}