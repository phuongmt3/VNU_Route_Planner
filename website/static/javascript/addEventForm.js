import { calendar } from './calendar.js'
import { addEventDB, lastID } from './clientSideDB.js'

$(document).on("click", ".addEvent", function() {
    var title = document.querySelector("#title").value;
    var day = calendar.getDate();
    var place = document.querySelector("#place").value;
    var startTime = document.querySelector("#startTime").value.split(":");
    var endTime = document.querySelector("#endTime").value.split(":");
    if (!title || !place || startTime.length < 2) {
        alert("Please enter event's title, start time and place!");
        return;
    }

    var start = new Date(day.getFullYear(), day.getMonth(), day.getDate(), startTime[0], startTime[1]);
    var end = checkValidEndTime(endTime, startTime[0], startTime[1]) ? new Date(day.getFullYear(), day.getMonth(), day.getDate(), endTime[0], endTime[1])
                                    : new Date(start.getTime() + 30*60*1000);

    addEventDB(title, start.toISOString(), end.toISOString(), place);
    calendar.addEvent({
        id: lastID,
        title: title,
        start: start.toISOString(),
        end: end.toISOString(),
        extendedProps: {
            place: place
        },
        color: 'red'
    });

    document.getElementById("myForm").style.display = "none";
});

function checkValidEndTime(endTime, startH, startM) {
    if (endTime.length < 2)
        return false;
    return endTime[0] > startH || (endTime[0] == startM && endTime[1] > startM);
}
