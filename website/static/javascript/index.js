import { calendar } from './calendar.js'
import { initCalendar } from './calendar.js';

// Drag bar /////////////////////////////////////////////////////////////////////////////////////
var left = document.getElementById('map-container');
var right = document.getElementById('calendar-container');
var bar = document.getElementById('dragbar');

const drag = (e) => {
  document.selection ? document.selection.empty() : window.getSelection().removeAllRanges();
  left.style.width = (e.pageX - bar.offsetWidth / 2) + 'px';
  
  if (right.offsetWidth <= 300) {
    calendar.changeView('timeGridDay');
  }
  if (left.offsetWidth <= 300) {
    calendar.changeView('timeGridWeek');
  }
}

bar.addEventListener('mousedown', () => {
  document.addEventListener('mousemove', drag);
});

bar.addEventListener('mouseup', () => {
  document.removeEventListener('mousemove', drag);
});

left.addEventListener('mouseup', () => {
  document.removeEventListener('mousemove', drag);
});

right.addEventListener('mouseup', () => {
  document.removeEventListener('mousemove', drag);
});

// Search student /////////////////////////////////////////////////////////////////////////////////////
const studentSearchEl = document.getElementById("student_search");
const matchList = document.getElementById("match-list");
let currentFocus;

const searchStudent = async searchText => {
  currentFocus = -1;

  const res = await fetch("http://127.0.0.1:5000/list_student.json");
  const listStudent = await res.json();

  let matches = listStudent.filter(student => {
    const regex = new RegExp(`^${searchText}`, 'gi');
    return String(student[0]).match(regex) || student[1].match(regex);
  });

  if (searchText.length === 0) {
    matches = [];
    matchList.innerHTML = '';
  }

  outputHtml(matches);
}

const outputHtml = matches => {
  if (matches.length > 0) {
    const html = matches.map(match => `
      <div class="card card-body match-search" id="${match[0]}" style="height: 38px; padding: 6px 12px; font-size: 1rem;">
        <p>
          ${match[0]}
          <span class="text-primary">${match[1]}</span>
        </p>
      </div>
    `).join('');

    matchList.innerHTML = html;
  }
}

studentSearchEl.addEventListener('input', () => searchStudent(studentSearchEl.value))

// Select student by click
$(document).on('click','.match-search',function() {
  studentSearchEl.value = this.id;
  matchList.innerHTML = '';
  $(this).blur();
  updateSchedule();
});

$(document).on('click','#student_search_btn',function() {
  matchList.innerHTML = '';
  $(this).blur();
  updateSchedule();
});

// Select student by key
studentSearchEl.addEventListener("keydown", function(e) {
  var x = document.getElementById("match-list");
  if (x) x = x.getElementsByTagName("div");
  if (e.key == "ArrowDown") {
    currentFocus++;
    addActive(x);
  } else if (e.key == "ArrowUp") {
    currentFocus--;
    addActive(x);
  } else if (e.key == "Enter") {
    // e.preventDefault();
    if (currentFocus > -1 && x) {
      studentSearchEl.value = x[currentFocus].id;
      matchList.innerHTML = '';
      $(this).blur();
      updateSchedule();
    }
  }
});

function addActive(x) {
  if (!x) return;

  if (currentFocus >= x.length) currentFocus = 0;
  if (currentFocus < 0) currentFocus = (x.length - 1);

  for (var i = 0; i < x.length; i++) {
    x[i].style.backgroundColor = "#fff";
  }
  x[currentFocus].style.backgroundColor = "#e9e9e9";
}

// Select different student and render
function updateSchedule() {
  let msv = document.getElementById("student_search").value;
  fetch(`/get_student_schedule/${msv}`)
      .then(function (response) {
          return response.json();
      }).then(function (response) {
          if (response.length == 0) {
            return 0;
          }

          timeTable = response;
          initCalendar();
      });
}