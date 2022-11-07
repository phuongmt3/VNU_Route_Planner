import { selectPlace, clearPlaceSelect } from './building.js'
import { findPath } from './map.js'

console.log(timeTable)

const startSemester = new Date("2022/08/29")
var pickedDay = new Date();
var curLesson = Math.floor(pickedDay.getHours() - 6)
var curWeek = Math.ceil((pickedDay - startSemester)/(24*3600*1000) / 7 )
var curDayOfWeek = pickedDay.getDay()

// For each row when clicked, find a path from the last position (in timetable) to this position
var table = document.getElementById("time-table");
var rows = table.getElementsByTagName("tr");
for (let i = 0; i < rows.length; i++) {
    table.rows[i].onclick = function() {
        curLesson = this.getElementsByTagName("th")[0].textContent - 1;
        updateTimeTable();
        updatePath();
    };
}

if (timeTable.length > 0) {
    updateTimeTable();
    updatePath();
}

function updateTimeTable() {
    curWeek = Math.ceil((pickedDay - startSemester)/(24*3600*1000) / 7 )
    curDayOfWeek = pickedDay.getDay()

    document.getElementById("weekNum").textContent = "Tuần " + curWeek;

    for (let i = 1; i <= 12; i++) {
        document.querySelector("#lesson"+i+">td").textContent = timeTable[curWeek-1][curDayOfWeek][i-1].subjectName;
        if (i == curLesson+1) 
            document.querySelector("#lesson"+i).style = "background: lightblue;";
        else 
            document.querySelector("#lesson"+i).style = "background: white;";
    }
};

// Base on timetable and the chosen time (curLesson)
function updatePath() {
    var startPlace = (curLesson >= 0 && curLesson < 12) ? timeTable[curWeek-1][curDayOfWeek][curLesson-1].place : "";
    var endPlace = (curLesson >= 0 && curLesson < 12) ? timeTable[curWeek-1][curDayOfWeek][curLesson].place : "";

    startPlace = startPlace ? startPlace : "Cổng chính ĐHQGHN";
    endPlace = endPlace ? endPlace : "Cổng chính ĐHQGHN";

    startPlace = startPlace.includes("-") ? startPlace.split("-")[1] : startPlace;
    endPlace = endPlace.includes("-") ? endPlace.split("-")[1] : endPlace;

    clearPlaceSelect()
    selectPlace(endPlace);
    findPath(startPlace, endPlace);

    $("#startPlace").val(startPlace ? startPlace : "Cổng chính ĐHQGHN")
    $("#endPlace").val(endPlace ? endPlace : "Cổng chính ĐHQGHN")
}

$(document).on('click','#btn-backward',function() {
    pickedDay.setDate(pickedDay.getDate() - 1);
    updateTimeTable();
});

$(document).on('click','#btn-forward',function() {
    pickedDay.setDate(pickedDay.getDate() + 1);
    updateTimeTable();
});

$(document).on('click','#btn-today',function() {
    pickedDay = new Date();
    curLesson = Math.floor(pickedDay.getHours() - 6)
    updateTimeTable();
});

