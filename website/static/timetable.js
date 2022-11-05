import { findPath, selectPlace } from '../static/index.js'

console.log(timeTable)

const startSemester = new Date("2022/08/29")
var pickedDay = new Date();
var curLesson = Math.floor(pickedDay.getHours() - 6)
var curWeek = Math.ceil((pickedDay - startSemester)/(24*3600*1000) / 7 )
var curDay = pickedDay.getDay()

if (timeTable.length > 0) {
    var startPlace = (curLesson >= 1 && curLesson <= 12) ? timeTable[curWeek-1][curDay][curLesson-1].place : "";
    var endPlace = (curLesson >= 1 && curLesson <= 12) ? timeTable[curWeek-1][curDay][curLesson].place : "";

    selectPlace(startPlace)
    selectPlace(endPlace)

    findPath(startPlace ? startPlace : "Cong vao DHQG", endPlace ? endPlace : "Cong vao DHQG")
    updateTimeTable();
}

function updateTimeTable() {
    curWeek = Math.ceil((pickedDay - startSemester)/(24*3600*1000) / 7 )
    curDay = pickedDay.getDay()

    document.getElementById("weekNum").textContent = "Tuần " + curWeek;

    for (let i = 1; i <= 12; i++) {
        document.querySelector("#lesson"+i+">td").textContent = timeTable[curWeek-1][curDay][i-1].subjectName;
        if (i == curLesson+1) 
            document.querySelector("#lesson"+i).style = "background: lightblue;";
        else 
            document.querySelector("#lesson"+i).style = "background: white;";
    }
};

// For each row when clicked, find a path from the last position (in timetable) to this position
function addRowHandlers() {
    var table = document.getElementById("time-table");
    var rows = table.getElementsByTagName("tr");
    for (let i = 0; i < rows.length; i++) {
        var currentRow = table.rows[i];
        var createClickHandler = function(row) {
            return function() {
                curLesson = row.getElementsByTagName("th")[0].textContent - 1;

                var startPlace = (curLesson > 0) ? timeTable[curWeek-1][curDay][curLesson-1].place : "";
                var endPlace = timeTable[curWeek-1][curDay][curLesson].place;

                selectPlace(endPlace)

                findPath(startPlace ? startPlace : "Cong vao DHQG", endPlace ? endPlace : "Cong vao DHQG")
                updateTimeTable();
            };
        };
        currentRow.onclick = createClickHandler(currentRow);
    }
}

addRowHandlers();

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

