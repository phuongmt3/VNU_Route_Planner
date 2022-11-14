import { calendar } from './calendar.js'

$(document).on("click", ".addEvent", function() {
    var title = $("#title").val();
    var day = calendar.getDate();
    var place = $("#place").val();
    var startTime = $("#startTime").val().split(":");
    var endTime = $("#endTime").val().split(":");
    if (!title || !place) {
        alert("Please enter event's title and place!");
        return;
    }

    var start = new Date(day.getFullYear(), day.getMonth(), day.getDate(), startTime[0], startTime[1]);
    var end = checkValidEndTime(endTime, startTime[0], startTime[1]) ? new Date(day.getFullYear(), day.getMonth(), day.getDate(), endTime[0], endTime[1])
                                    : new Date(start.getTime() + 30*60*1000);

    calendar.addEvent({
        title: title,
        start: start.toISOString(),
        end: end.toISOString(),
        extendedProps: {
            place: place
        },
        color: 'red'
    });

    $("#myForm").css("display", "none");
});

function checkValidEndTime(endTime, startH, startM) {
    if (endTime.length < 2)
        return false;
    return endTime[0] > startH || (endTime[0] == startM && endTime[1] > startM);
}

$("#closeFormBtn").click(e => $("#myForm").css("display", "none"));