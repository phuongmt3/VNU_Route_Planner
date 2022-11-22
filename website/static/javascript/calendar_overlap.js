const startSemester = new Date("2022/08/29 00:00");
var calendarEl = document.getElementById('calendar');

var calendar = new FullCalendar.Calendar(calendarEl, {
    themeSystem: 'bootstrap5',
    initialView: 'timeGridWeek',
    aspectRatio: 2.1,
    height: '730px',
    eventClick: function(e) { selectEvent(e.event) },
    nowIndicator: true,
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
                  title: (percent * 100).toFixed(2) + "% busy",
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
    let data = [];

    for (let i = 0; i < inputBoxNumb; i++) {
        if (document.getElementById("msv_" + i) == null) continue;
        
        let searchValue = {};

        searchValue['msv'] = document.getElementById("msv_" + i).value;
        searchValue['name'] = document.getElementById("name_" + i).value;
        searchValue['birth'] = document.getElementById("birth_" + i).value.replaceAll('/', '-');
        searchValue['courseClass'] = document.getElementById("course_class_" + i).value;
        searchValue['subjectCode'] = document.getElementById("subject_code_" + i).value;
        searchValue['subjectName'] = document.getElementById("subject_name_" + i).value;
        searchValue['subjectGroup'] = document.getElementById("subject_group_" + i).value;
        searchValue['credit'] = document.getElementById("credit_" + i).value;
        searchValue['note'] = document.getElementById("note_" + i).value;

        data.push(searchValue);
    }

    fetch(`/get_group_schedule/`, {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    })
        .then(function (response) {
            return response.json();
        }).then(function (response) {
            if (response[0].length == 0) {
              return 0;
            }
  
            timeTable = response[0];
            initCalendar();
  
            document.getElementById('notification').textContent = response[1];
            window.scrollTo(0, document.body.scrollHeight);
        });
}

document.getElementById("group_search_btn").addEventListener("click", updateCalendar)

function addInputBox() {
    const inputContainerEl = document.querySelector(".input-container");
    const numberOfInput = inputBoxNumb++;

    const addedInput = document.createElement("div");
    addedInput.innerHTML = `
        <div class="added-input_` + numberOfInput + `" style="display: flex;">
            <button class="btn" id="remove_input_box" style="border-radius: 50%; color: #888"><i class="fa fa-regular fa-minus"></i></button>

            <div class="input-group">
                <input type="text" aria-label="Mã SV" class="form-control" id="msv_` + numberOfInput + `" placeholder="Mã SV">
                <input type="text" aria-label="Họ và tên" class="form-control" id="name_` + numberOfInput + `" placeholder="Họ và tên">
                <input type="text" aria-label="Ngày sinh" class="form-control" id="birth_` + numberOfInput + `" placeholder="Ngày sinh">
                <input type="text" aria-label="Lớp khóa học" class="form-control" id="course_class_` + numberOfInput + `" placeholder="Lớp khóa học">
                <input type="text" aria-label="Mã LHP" class="form-control" id="subject_code_` + numberOfInput + `" placeholder="Mã LHP">
                <input type="text" aria-label="Tên môn học" class="form-control" id="subject_name_` + numberOfInput + `" placeholder="Tên môn học">
                <input type="text" aria-label="Nhóm" class="form-control" id="subject_group_` + numberOfInput + `" placeholder="Nhóm">
                <input type="text" aria-label="Số TC" class="form-control" id="credit_` + numberOfInput + `" placeholder="Số TC">
                <input type="text" aria-label="Ghi chú" class="form-control" id="note_` + numberOfInput + `" placeholder="Ghi chú">
            </div>

            <button class="btn btn-outline-success" type="button" id="group_search_btn" style="visibility: hidden;">Search</button>
        </div>
    `;

    addedInput.querySelector("#remove_input_box").addEventListener("click", removeInputBox);

    inputContainerEl.prepend(addedInput)
}

function removeInputBox() {
    this.parentElement.innerHTML = '';
}

document.getElementById("add_input_box").addEventListener("click", addInputBox)


