import { selectPlace, clearPlaceSelect } from './building.js'
import { findPath } from './map.js'

var clickedEvent = null;
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
    defaultTimedEventDuration: '00:30'
});

function onAddEventButtonClick(e) {
    var btn = document.getElementById("myForm");
    if (btn.style.display == "none")
        btn.style.display = "block";
    else btn.style.display = "none";
}

calendar.on('dateClick', function(info) {
  console.log('clicked on ' + info.dateStr);
});

const startSemester = new Date("2022/08/29 00:00");

function initEvents() {
    var timer = startSemester;
    for (var week = 0; week < 15; week++) {
        for (var day = 0; day < 7; day++) {
            var curday = timer.getDay();
            for (var tiet = 0; tiet < 12; tiet++) {
                if (timeTable[week][curday][tiet].subjectName == "")
                    continue;

                var tietEnd = tiet + 1;
                while (tietEnd < 12 && timeTable[week][curday][tietEnd].subjectName ==
                                        timeTable[week][curday][tiet].subjectName)
                    tietEnd++;

                var startTime = new Date(timer);
                var endTime = new Date(timer);
                startTime.setHours(tiet + 7);
                endTime.setHours(tietEnd + 7);

                calendar.addEvent({
                  title: timeTable[week][curday][tiet].subjectName,
                  start: startTime.toISOString(),
                  end: endTime.toISOString(),
                  extendedProps: {
                    place: timeTable[week][curday][tiet].place
                  },
                  color: 'red'
                });

                tiet = tietEnd - 1;
            }

            timer.setDate(timer.getDate() + 1);
        }
    }
}

function selectTimeSlot(event) {
    if (clickedEvent != null)
        clickedEvent.setProp("color", 'red');
    event.setProp("color", 'lightblue');
    clickedEvent = event;

    var prevEvent = getEventFromTime(new Date(event.start), new Date(event.end));

    var startPlace = "Cổng chính ĐHQGHN"
    if (prevEvent != null && new Date(event.start) - new Date(prevEvent.end) <= 1000*60*60)
        startPlace = prevEvent.extendedProps.place;
    var endPlace = event.extendedProps.place;

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

// get event nearest < cur event & get cur event
function getEventFromTime(startTime=0, endTime=0) {
    var events = calendar.getEvents();
    for (var i = events.length - 1; i >= 0; i--) {
        if (acceptedEvent(events[i], startTime, endTime))
            return events[i];
    }
    return null;
}

if (timeTable.length > 0) {
    initEvents();
    var curEvent = getEventFromTime();
    if (curEvent != null) {
        selectTimeSlot(curEvent);
        clickedEvent = curEvent;
    }
}

calendar.render();