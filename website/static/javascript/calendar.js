import { selectPlace } from './building.js'
import { findPath, clearMap } from './map.js'


const startSemester = new Date("2022/08/29 00:00");
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
    eventClick: function(info) { 
        setTimeout(() => {
            let timeGrid = document.querySelectorAll(`.fc-timegrid-slot.fc-timegrid-slot-label`);
            selectEventsInTimeRange(timeGrid[info.event.start.getHours() * 2 + Math.floor(info.event.start.getMinutes() / 30)])
        }, 400);
    },
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
    // Events description
    eventDidMount: function(info) {
        let placeText = document.createElement("div");
        placeText.classList.add("description-text");
        placeText.style = "font-size: 12px";
        placeText.textContent = info.event.extendedProps.place;

        let hiddenText = document.createElement("div");
        hiddenText.classList.add("hidden");
        hiddenText.textContent = info.event.extendedProps.description;
        
        info.el.querySelector(".fc-event-title-container").append(placeText);
        info.el.querySelector(".fc-event-title-container").append(hiddenText);
    },
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

// calendar.on('dateClick', function(info) {
//     var t1 = new Date(info.date);
//     var t2 = new Date(info.date.getTime() + snapDur);
//     var nearEvents = getEventFromTime(t1, t2);

//     if (nearEvents[0] && t1 - nearEvents[0].end < snapDur) {
//         var startPlace = nearEvents[0].extendedProps.place;
//         var endPlace = "Cổng chính ĐHQGHN";
//         findRoute(startPlace, endPlace);
//     }
//     else if (nearEvents[1] && nearEvents[1].start - t2 < snapDur) {
//         var startPlace = "Cổng chính ĐHQGHN";
//         var endPlace = nearEvents[1].extendedProps.place;
//         findRoute(startPlace, endPlace);
//     }
// });

function initEvents(msv, color) {
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
                  description: subject.subjectCode + ", " + subject.credits + ", " + subject.lecturer,
                  start: startTime.toISOString(),
                  end: endTime.toISOString(),
                  extendedProps: {
                    place: subject.place
                  },
                  color: color,
                  owner: msv
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

async function selectTimeSlot(event) {
    clickedEvent = event;
    var prevEvent = getEventFromTime(new Date(event.start), new Date(event.end), clickedEvent.extendedProps.owner)[0];

    var startPlace = "Cổng chính ĐHQGHN";
    if (prevEvent != null && new Date(event.start) - new Date(prevEvent.end) <= snapDur)
        startPlace = prevEvent.extendedProps.place;
    var endPlace = event.extendedProps.place;

    await findRoute(startPlace, endPlace, clickedEvent.backgroundColor);
}

async function findRoute(startPlace, endPlace, color) {
    startPlace = startPlace.includes("-") ? startPlace.split("-")[1] : startPlace;
    endPlace = endPlace.includes("-") ? endPlace.split("-")[1] : endPlace;

    // Color when render to map
    color = (color == 'rgb(245, 81, 30, 0.96)') ? 'red' : 
            (color == 'rgb(3, 155, 230, 0.96)') ? 'deepskyblue' : 'lime';

    selectPlace(endPlace, color);
    await findPath(startPlace, endPlace, color);
    
    // $("#startPlace").val(startPlace);
    // $("#endPlace").val(endPlace);
}

// Same owner or no owner -> accept
function acceptedEvent(event, startTime, endTime, owner) {
    if (startTime != 0)
        return new Date(event.start) < startTime && new Date(event.end) < endTime && (owner == event.extendedProps.owner || owner == 0);
    return new Date(event.start) <= new Date() && new Date(event.end) >= new Date() && (owner == event.extendedProps.owner || owner == 0);
}

// get 2 events nearest < cur event & cur event
function getEventFromTime(startTime=0, endTime=0, owner=0) {
    var events = calendar.getEvents().sort((a, b) => {
        if (a.start == b.start)
            return a.end - b.end;
        return a.start - b.start;
    });
    var above = null, below = null;
    for (var i = events.length - 1; i >= 0; i--) {
        if (acceptedEvent(events[i], startTime, endTime, owner))
            return [events[i], above];
        above = events[i];
    }
    return null;
}

// Todo: check bugs
export function initCalendar(msv, color) {
    if (timeTable.length > 0) {
        initEvents(msv, color);
        var curEvent = getEventFromTime();
        if (curEvent != null) {
            selectTimeSlot(curEvent);
            clickedEvent = curEvent;
            curEvent = curEvent[0];
        }
    }

    calendar.render();
}

initCalendar();

let timeGridLabelList = document.querySelectorAll('.fc-timegrid-slot.fc-timegrid-slot-label');
timeGridLabelList.forEach(timeGridLabel => {
    timeGridLabel.addEventListener('click', () => {
        if (calendar.view.type == 'timeGridDay')
            selectEventsInTimeRange(timeGridLabel);
    })
})

async function selectEventsInTimeRange(timeGridLabel) {
    unselectTimeRange();

    let hours = timeGridLabel.getAttribute('data-time').split(':');
    let selectTime = new Date(calendar.getDate().setHours(hours[0], hours[1], 0));

    clearMap();
    // If event start in 30 minutes from selectTime, call selectTimeSlot
    for (const thisEvent of calendar.getEvents()) {
        if (thisEvent.start >= selectTime && thisEvent.start <= new Date(selectTime.getTime() + 30*60*1000)) {
            await selectTimeSlot(thisEvent);
        }
    }

    timeGridLabel.style.backgroundColor = 'rgba(188, 232, 241, 0.3)';
    timeGridLabel.nextSibling.style.backgroundColor = 'rgba(188, 232, 241, 0.3)';
}

export function unselectTimeRange() {
    timeGridLabelList.forEach(timeGridLabel => {
        timeGridLabel.style.backgroundColor = '#fff';
        timeGridLabel.nextSibling.style.backgroundColor = '#fff';
    })
}
