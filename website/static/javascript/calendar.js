import { selectPlace, clearPlaceSelect } from './building.js'
import { findPath } from './map.js'

var clickedEvent = null;
var snapDur = 45*60*1000;
var calendarEl = document.getElementById('calendar');
export var calendar = new FullCalendar.Calendar(calendarEl, {
    themeSystem: 'bootstrap5',
    initialView: 'timeGridDay',
    aspectRatio: 3,
    footerToolbar: {
      center: 'addEventButton delEventButton'
    },
    customButtons: {
      addEventButton: {
        icon: 'calendar-plus',
        click: onAddEventButtonClick
      },
      delEventButton: {
        icon: 'calendar-x',
        click: function() {
            if (clickedEvent && confirm('Delete this event?'))
                clickedEvent.remove();
        }
      }
    },
    eventClick: function(e) { selectTimeSlot(e.event) },
    nowIndicator: true,
    editable: true,
    selectable: true,
    allDaySlot: false,
    weekNumbers: true,
    weekNumberFormat: { week: 'narrow' },
    weekNumberCalculation: calWeekNumber,
    defaultTimedEventDuration: '00:30',
    snapDuration: '00:15',
    firstDay: 1,
    eventDidMount: function(info) {
        let descriptionText = document.createElement("div");
        descriptionText.style = "font-size: 12px";
        descriptionText.textContent = info.event.extendedProps.place;
        
        info.el.querySelector(".fc-event-title-container").append(descriptionText);
    }
});

function onAddEventButtonClick(e) {
    var btn = document.getElementById("myForm");
    if (btn.style.display == "none") {
        document.querySelector("#title").value = "";
        document.querySelector("#startTime").value = "";
        document.querySelector("#endTime").value = "";
        document.querySelector("#place").value = "";
        btn.style.display = "block";
    }
    else btn.style.display = "none";
}

calendar.on('dateClick', function(info) {
    var t1 = new Date(info.date);
    var t2 = new Date(info.date.getTime() + snapDur);
    var nearEvents = getEventFromTime(t1, t2);

    if (nearEvents[0] && t1 - nearEvents[0].end < snapDur) {
        var startPlace = nearEvents[0].extendedProps.place;
        var endPlace = "Cổng chính ĐHQGHN";
        findRoute(startPlace, endPlace);
    }
    else if (nearEvents[1] && nearEvents[1].start - t2 < snapDur) {
        var startPlace = "Cổng chính ĐHQGHN";
        var endPlace = nearEvents[1].extendedProps.place;
        findRoute(startPlace, endPlace);
    }
});

const startSemester = new Date("2022/08/29 00:00");

function initEvents() {
    var timer = new Date(startSemester);
    for (var week = 0; week < 15; week++) {
        for (var day = 0; day < 7; day++) {
            var curday = timer.getDay();
            for (var tiet = 0; tiet < 12; tiet++) {
                var subject = timeTable[week][curday][tiet];

                if (subject.subjectName == "")
                    continue;
                
                var tietEnd = tiet + 1;
                while (tietEnd < 12 && timeTable[week][curday][tietEnd].subjectName == subject.subjectName)
                    tietEnd++;

                var startTime = new Date(timer);
                var endTime = new Date(timer);
                startTime.setHours(tiet + 7);
                endTime.setHours(tietEnd + 7);

                calendar.addEvent({
                  title: subject.group + " - " + subject.subjectName,
                  description: "description",
                  start: startTime.toISOString(),
                  end: endTime.toISOString(),
                  extendedProps: {
                    place: subject.place
                  },
                  color: 'red'
                });

                tiet = tietEnd - 1;
            }

            timer.setDate(timer.getDate() + 1);
        }
    }
}

function calWeekNumber() {
    var week = Math.ceil((calendar.getDate() - startSemester + 24*3600*1000)/(24*3600*1000) / 7 );
    if (week < 0 || week > 15)
        return 0;
    return week;
}

function selectTimeSlot(event) {
    if (clickedEvent != null)
        clickedEvent.setProp("color", 'red');
    event.setProp("color", 'lightblue');
    clickedEvent = event;

    var prevEvent = getEventFromTime(new Date(event.start), new Date(event.end))[0];

    var startPlace = "Cổng chính ĐHQGHN";
    if (prevEvent != null && new Date(event.start) - new Date(prevEvent.end) <= 1000*60*45)
        startPlace = prevEvent.extendedProps.place;
    var endPlace = event.extendedProps.place;

    findRoute(startPlace, endPlace);
}

function findRoute(startPlace, endPlace) {
    startPlace = startPlace.includes("-") ? startPlace.split("-")[1] : startPlace;
    endPlace = endPlace.includes("-") ? endPlace.split("-")[1] : endPlace;

    clearPlaceSelect()
    selectPlace(endPlace);
    findPath(startPlace, endPlace);
    $("#startPlace").val(startPlace);
    $("#endPlace").val(endPlace);
}

function acceptedEvent(event, startTime, endTime) {
    if (startTime != 0)
        return new Date(event.start) < startTime && new Date(event.end) < endTime;
    return new Date(event.start) <= new Date() && new Date(event.end) >= new Date();
}

// get 2 events nearest < cur event & get cur event
function getEventFromTime(startTime=0, endTime=0) {
    var events = calendar.getEvents().sort((a, b) => {
        if (a.start == b.start)
            return a.end - b.end;
        return a.start - b.start;
    });
    var above = null, below = null;
    for (var i = events.length - 1; i >= 0; i--) {
        if (acceptedEvent(events[i], startTime, endTime))
            return [events[i], above];
        above = events[i];
    }
    return null;
}

if (timeTable.length > 0) {
    initEvents();
    var curEvent = getEventFromTime();
    if (curEvent != null) {
        selectTimeSlot(curEvent);
        clickedEvent = curEvent;
        curEvent = curEvent[0];
    }
}

calendar.render();