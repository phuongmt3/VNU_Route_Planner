import { calendar } from './calendar.js'
import { initCalendar } from './calendar.js';
import { map, displayMessage, clearMap } from './map.js';

// Drag bar /////////////////////////////////////////////////////////////////////////////////////
var left = document.getElementById('map-container');
var right = document.getElementById('calendar-container');
var bar = document.getElementById('dragbar');

const drag = (e) => {
  left.style.transition = '0s';

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

const minimize = (e) =>{
  left.style.transition = '0.5s';

  if (left.offsetWidth > 300) {
    left.style.width = '300px';
    setTimeout(() => {
      calendar.changeView('timeGridWeek');
    }, 500);
  } else {
    left.style.width = screen.width - 300 + 'px';
    setTimeout(() => {
      calendar.changeView('timeGridDay');
    }, 500);
  }
}

bar.addEventListener('dblclick', minimize);

calendar.on('eventClick', function(e) {
  left.style.transition = '0.5s';

  if (right.offsetWidth > 300) 
    left.style.width = '100%';

  if (calendar.view.type != 'timeGridDay') 
    setTimeout(() => {
      calendar.changeView('timeGridDay', e.event.start);
    }, 200);
});

// Search student /////////////////////////////////////////////////////////////////////////////////////
const studentSearchEl = document.getElementById("student_search");
const matchList = document.getElementById("match-list");
let currentFocus;

function split(str, sep, limit) {
    str = str.split(sep);
    if (str.length > limit) {
        var ret = str.splice(0, limit);
        ret.push(str.join(sep));
        return ret[ret.length - 1];
    }
    return "";
}

const searchStudent = async searchText => {
  currentFocus = -1;

  const res = await fetch("/list_student.json");
  const listStudent = await res.json();

  let matches = listStudent.filter(student => {
    const regex = new RegExp(`^${searchText}`, 'gi');
    for (let i = 0; i < 5; i++) {
      if (split(student[1], ' ', i).match(regex))
        return true;
    }
    return String(student[0]).match(regex);
  });

  if (searchText.length === 0) {
    matches = [];
    matchList.innerHTML = '';
  }

  // Only take 10 matches
  outputHtml(matches.slice(0, 10));
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

  map.dragging.enable();
  clearMap();
  updateSchedule();
});

$(document).on('click','#student_search_btn',function() {
  matchList.innerHTML = '';

  clearMap();
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
    if (currentFocus > -1 && x) {
      studentSearchEl.value = x[currentFocus].id;
      matchList.innerHTML = '';
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
  var msv = document.getElementById("student_search").value;
  fetch(`/get_student_schedule/${msv}`)
      .then(function (response) {
          return response.json();
      }).then(function (response) {
          if (response[0].length == 0) {
            return 0;
          }

          timeTable = response[0];
          initCalendar(msv);

          displayMessage(response[1]);
      });
}