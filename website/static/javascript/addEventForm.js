import { calendar } from './calendar.js'

$(document).on("click", ".addEvent", function() {
    var title = document.querySelector("#title").value;
    var day = calendar.getDate();
    var place = document.querySelector("#place").value;
    var startHour = document.querySelector("#startHour").value;
    var startMinute = document.querySelector("#startMinute").value;
    var endHour = document.querySelector("#endHour").value;
    var endMinute = document.querySelector("#endMinute").value;
    if (!title || !place || !startHour || !startMinute) {
        alert("Please enter event's title, start time and place!");
        return;
    }
    if (!checkValidHour(startHour) || !checkValidMin(startMinute)) {
        alert("Please select a valid start time!\n(Minutes should be divided by 15)");
        return;
    }

    var startTime = new Date(day.getFullYear(), day.getMonth(), day.getDate(), startHour, startMinute);
    var endTime = checkValidHour(endHour) && checkValidMin(endMinute) ? new Date(day.getFullYear(), day.getMonth(), day.getDate(), endHour, endMinute)
                                    : new Date("1990/01/01");

    calendar.addEvent({
        title: title,
        start: startTime.toISOString(),
        end: endTime.toISOString(),
        extendedProps: {
            place: place
        },
        color: 'red'
    });

    document.getElementById("myForm").style.display = "none";
    document.querySelector("#title").value = "";
    document.querySelector("#startHour").value = "";
    document.querySelector("#startMinute").value = "";
    document.querySelector("#endHour").value = "";
    document.querySelector("#endMinute").value = "";
    document.querySelector("#place").value = "";
});

function checkValidHour(hour) { return hour >= 0 && hour < 24; }
function checkValidMin(min) { return min >= 0 && min < 60 && min % 15 == 0; }