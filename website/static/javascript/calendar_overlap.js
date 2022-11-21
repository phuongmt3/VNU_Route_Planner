const startSemester = new Date("2022/08/29 00:00");
var calendarEl = document.getElementById('calendar');

var calendar = new FullCalendar.Calendar(calendarEl, {
    themeSystem: 'bootstrap5',
    initialView: 'timeGridWeek',
    aspectRatio: 2.1,
    eventClick: function(e) { selectEvent(e.event) },
    nowIndicator: true,
    // editable: true,
    // selectable: true,
    allDaySlot: false,
    weekNumbers: true,
    weekNumberFormat: { week: 'narrow' },
    weekNumberCalculation: calWeekNumber,
    defaultTimedEventDuration: '00:30',
    snapDuration: '00:15',
    firstDay: 1,
    businessHours: {
        daysOfWeek: [ 1, 2, 3, 4, 5, 6 ], // Monday - Saturday
        startTime: '07:00',
        endTime: '19:00',
    },
});

function calWeekNumber() {
    var week = Math.ceil((calendar.getDate() - startSemester + 24*3600*1000)/(24*3600*1000) / 7 );
    if (week < 0 || week > 15)
        return 0;
    return week;
}

function initEvents() {
    var timer = new Date(startSemester);
    for (var week = 0; week < 15; week++) {
        for (var day = 0; day < 7; day++) {
            var curday = timer.getDay();
            for (var tiet = 0; tiet < 12; tiet++) {
                var percent = timeTable[week][curday][tiet];

                if (percent == "")
                    continue;
                
                var tietEnd = tiet + 1;
                while (tietEnd < 12 && timeTable[week][curday][tietEnd] == percent)
                    tietEnd++;

                var startTime = new Date(timer);
                var endTime = new Date(timer);
                startTime.setHours(tiet + 7);
                endTime.setHours(tietEnd + 7);

                calendar.addEvent({
                  title: (percent * 100).toFixed(2) + "%",
                  start: startTime.toISOString(),
                  end: endTime.toISOString(),
                  color: `rgba(255,0,0,${percent})`
                });

                tiet = tietEnd - 1;
            }

            timer.setDate(timer.getDate() + 1);
        }
    }
}

function initCalendar() {
    calendar.removeAllEvents();
    
    if (timeTable.length > 0)
        initEvents();
    calendar.render();
}

initCalendar();

function updateCalendar() {
    const msv = document.getElementById("msv").value;
    const name = document.getElementById("name").value;
    const birth = document.getElementById("birth").value.replaceAll('/', '-');
    const courseClass = document.getElementById("course_class").value;
    const subjectCode = document.getElementById("subject_code").value;
    const subjectName = document.getElementById("subject_name").value;
    const subjectGroup = document.getElementById("subject_group").value;
    const credit = document.getElementById("credit").value;
    const note = document.getElementById("note").value;

    fetch(`/get_group_schedule/${msv ? msv : 0}_${name ? name : 0}_${birth ? birth : 0}_${courseClass ? courseClass : 0}_${subjectCode ? subjectCode : 0}_${subjectName ? subjectName : 0}_${subjectGroup ? subjectGroup : 0}_${credit ? credit : 0}_${note ? note : 0}`)
        .then(function (response) {
            return response.json();
        }).then(function (response) {
            if (response[0].length == 0) {
              return 0;
            }
  
            timeTable = response[0];
            initCalendar(msv);
  
            document.getElementById('notification').textContent = response[1];
            window.scrollTo(0, document.body.scrollHeight);
        });
}

document.getElementById("group_search_btn").addEventListener("click", updateCalendar)