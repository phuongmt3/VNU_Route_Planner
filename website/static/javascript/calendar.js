import { selectPlace, clearPlaceSelect } from './building.js'
import { findPath } from './map.js'
import { db, getLastEvent, createNewTable, addEventDB, printAll, deleteEventDB } from './clientSideDB.js'

var clickedEvent = null;
var snapDur = 15*60*1000;
const startSemester = new Date("2022/08/29 00:00");
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
            if (clickedEvent && confirm('Delete this event?')) {
                deleteEventDB(clickedEvent.id);
                clickedEvent.remove();
            }
        }
      }
    },
    eventClick: function(e) { selectTimeSlot(e.event) },
    nowIndicator: true,
    editable: true,
    selectable: true,
    allDaySlot: false,
    weekNumbers: true,
    initialDate: '2022-11-10',
    weekNumberFormat: { week: 'narrow' },
    weekNumberCalculation: calWeekNumber,
    defaultTimedEventDuration: '00:30',
    snapDuration: '00:15'
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

function initEventsInDB() {
    console.log('initEventsInDB');
    var promm = new Promise((resolve, reject) => {
        console.log('contained or not: ' + db.objectStoreNames.contains(msv))
        if (db.objectStoreNames.contains(msv)) {
            console.log('contained ' + msv)
            resolve();
            }
        else {
            var tableProm = createNewTable(msv);
            tableProm.then(e => {
                console.log(e.result);
                resolve();
            }).catch(e => console.log(e.result));
        }
    });

    promm.then(() => {
        var prom = getLastEvent();
        prom.then(data => {
                var lastEventInDB = data ? data.value : null;
                console.log(lastEventInDB);
                if (lastEventInDB && new Date(lastEventInDB.start) >= startSemester)
                    return;

                console.log('start add events')
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
                                        timeTable[week][curday][tiet].place);

                            tiet = tietEnd - 1;
                        }

                        timer.setDate(timer.getDate() + 1);
                    }
                }
            })
            .catch(err => console.log(err))
            .finally(() => {
                console.log("finally block")
                printAll();

                const objectStore = db.transaction(msv).objectStore(msv);
                var myCursor = objectStore.openCursor();
                myCursor.onsuccess = e => {
                    const cursor = e.target.result;
                    if (cursor) {
                        calendar.addEvent({
                            id: cursor.value.id,
                          title: cursor.value.title,
                          start: cursor.value.start,
                          end: cursor.value.end,
                          extendedProps: {
                            place: cursor.value.place
                          },
                          color: 'red'
                        });

                        cursor.continue();
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
    initEventsInDB();
    var curEvent = getEventFromTime();
    if (curEvent != null) {
        selectTimeSlot(curEvent);
        clickedEvent = curEvent;
        curEvent = curEvent[0];
    }
}

calendar.render();