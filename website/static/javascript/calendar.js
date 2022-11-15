import { selectPlace, clearPlaceSelect } from './building.js'
import { findPath } from './map.js'
import { db, getLastEvent, createNewTable, addEventDB, printAll, deleteEventDB, updateEventDB } from './clientSideDB.js'
import { msv } from './index.js'

var t0, t2;
var clickedEvent = null;
var rightClickedEle = null;
const startSemester = new Date("2022/08/29 00:00");
var snapDur = 45*60*1000;
var justClickDel = false;
export var dayClicked;
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
    },
    eventChange: (info) => {
        var e = info.event;
        console.log(e.id, e.title, e.start.toISOString(), e.end.toISOString())
        updateEventDB(e.id, e.start.toISOString(), e.end.toISOString(), msv);
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
            if (confirm('Delete this event?')) {
                deleteEventDB(info.event.id, msv);
                info.event.remove();
            }
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
    dayClicked = t1;
});

function initEvents() {
    var promm = new Promise((resolve, reject) => {
        if (db.objectStoreNames.contains(msv))
            resolve();
        else {
            var tableProm = createNewTable(msv);
            tableProm.then(e => {
                resolve();
            }).catch(e => console.log(e.result));
        }
    });

    promm.then(() => {
        var prom = getLastEvent(msv);
        prom.then(data => {
                var lastEventInDB = data ? data.value : null;
                if (lastEventInDB && new Date(lastEventInDB.start) >= startSemester)
                    return;

                var timer = new Date(startSemester);
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

                            addEventDB(timeTable[week][curday][tiet].subjectName,
                                        startTime.toISOString(),
                                        endTime.toISOString(),
                                        timeTable[week][curday][tiet].place, msv);

                            tiet = tietEnd - 1;
                        }

                        timer.setDate(timer.getDate() + 1);
                    }
                }
            })
            .catch(err => console.log(err))
            .finally(() => {
                //printAll();

                const objectStore = db.transaction(msv).objectStore(msv);
                var myCursor = objectStore.getAll();
                myCursor.onsuccess = e => {
                    var events = e.target.result;
                    for (var i = 0; i < events.length; i++) {
                        calendar.addEvent({
                            id: events[i].id,
                          title:events[i].title,
                          start: events[i].start,
                          end: events[i].end,
                          extendedProps: {
                            place: events[i].place
                          },
                          color: 'red'
                        });
                    }
                };
                myCursor.onerror = e => console.log('open cursor failed initCalendar');
            });
    })
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
            if (nearEvents) {
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
    }

    calendar.render();
}

initCalendar();
