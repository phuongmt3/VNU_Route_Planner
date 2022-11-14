import { selectPlace, clearPlaceSelect } from './building.js'
import { findPath } from './map.js'

var clickedEvent = null;
var rightClickedEle = null;
var snapDur = 45*60*1000;
var justClickDel = false;
var calendarEl = document.getElementById('calendar');
export var calendar = new FullCalendar.Calendar(calendarEl, {
    themeSystem: 'bootstrap5',
    initialView: 'timeGridDay',
    aspectRatio: 3,
    eventClick: function(e) { selectEvent(e.event) },
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
        let placeText = document.createElement("div");
        placeText.classList.add("description-text");
        placeText.style = "font-size: 12px";
        placeText.textContent = info.event.extendedProps.place;

        let hiddenText = document.createElement("div");
        hiddenText.classList.add("hidden");
        hiddenText.textContent = info.event.extendedProps.description;
        
        info.el.querySelector(".fc-event-title-container").append(placeText);
        info.el.querySelector(".fc-event-title-container").append(hiddenText);

        info.el.addEventListener('contextmenu', e => onRightClickEvent(e, info));
    }
});

function onRightClickEvent(e, info) {
    e.preventDefault();
    var delButton = info.el.parentElement.querySelector(".delBtn")
    if (!delButton) {
        let button = document.createElement("button");
        button.classList.add("btn");
        button.classList.add("btn-warning");
        button.classList.add("delBtn");
        button.classList.add("float-end");
        button.textContent = "X";
        button.onclick = () => {
            justClickDel = true;
            if (confirm('Delete this event?'))
                info.event.remove();
        };

        if (rightClickedEle) {
            rightClickedEle.style.width = "100%";
            rightClickedEle.parentElement.querySelector(".delBtn").style.display = "none";
        }

        rightClickedEle = info.el;
        info.el.parentElement.append(button);
        info.el.style.width = "85%";
    }
    else if (delButton.style.display == "none") {
        if (rightClickedEle) {
            rightClickedEle.style.width = "100%";
            rightClickedEle.parentElement.querySelector(".delBtn").style.display = "none";
        }
        delButton.style.display = "block";
        info.el.style.width = "85%";
        rightClickedEle = info.el;
    }
    else {
        delButton.style.display = "none";
        info.el.style.width = "100%";
        rightClickedEle = null;
    }
}

function onAddEvent(start, end) {
    if (justClickDel) {
        justClickDel = false;
        return;
    }
    var startH = start.getHours() < 10 ? '0' + start.getHours() : start.getHours();
    var endH = end.getHours() < 10 ? '0' + end.getHours() : end.getHours();
    var startM = start.getMinutes() < 10 ? '0' + start.getMinutes() : start.getMinutes();
    var endM = end.getMinutes() < 10 ? '0' + end.getMinutes() : end.getMinutes();

    $("#title").val("");
    $("#startTime").val(startH + ":" + startM);
    $("#endTime").val(endH + ":" + endM);
    $("#place").val("");
    $("#myForm").css("display", "block");
}

calendar.on('dateClick', function(info) {
    var t1 = new Date(info.date);
    var t2 = new Date(info.date.getTime() + 15*60*1000);
    var nearEvents = getEventFromTime(t1, t2);
    var prev = nearEvents[0] && t1 - nearEvents[0].end < snapDur;
    var next = nearEvents[1] && nearEvents[1].start - t2 < snapDur;

    if (prev && next)
        findRoute(nearEvents[0].extendedProps.place, nearEvents[1].extendedProps.place);
    else if (prev)
        findRoute(nearEvents[0].extendedProps.place, "Cổng chính ĐHQGHN");
    else if (next)
        findRoute("Cổng chính ĐHQGHN", nearEvents[1].extendedProps.place);

    onAddEvent(t1, new Date(t1.getTime() + 30*60*1000));
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
                  description: subject.subjectCode + ", " + subject.credits + ", " + subject.lecturer,
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

function selectEvent(event) {
    if (rightClickedEle) {
        rightClickedEle.style.width = "100%";
        rightClickedEle.parentElement.querySelector(".delBtn").style.display = "none";
        rightClickedEle = null;
    }

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

export function initCalendar() {
    calendar.removeAllEvents();
    
    if (timeTable.length > 0) {
        initEvents();
        var curEvent = getEventFromTime();
        if (curEvent != null) {
            selectEvent(curEvent);
            clickedEvent = curEvent;
            curEvent = curEvent[0];
        }
        else {
            var t1 = new Date();
            var t2 = new Date(t1.getTime() + snapDur);
            var nearEvents = getEventFromTime(t1, t2);
            var prev = nearEvents[0] && t1 - nearEvents[0].end < snapDur;
            var next = nearEvents[1] && nearEvents[1].start - t2 < snapDur;

            if (prev && next)
                findRoute(nearEvents[0].extendedProps.place, nearEvents[1].extendedProps.place);
            else if (prev)
                findRoute(nearEvents[0].extendedProps.place, "Cổng chính ĐHQGHN");
            else if (next)
                findRoute("Cổng chính ĐHQGHN", nearEvents[1].extendedProps.place);
        }
    }

    calendar.render();
}

initCalendar();
