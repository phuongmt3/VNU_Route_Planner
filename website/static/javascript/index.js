import { calendar } from './calendar.js'
import { initCalendar, unselectAllHour } from './calendar.js';
import { clearMap } from './map.js';

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
    unselectAllHour();
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
      unselectAllHour();
    }, 500);
  } else {
    left.style.width = '100%';
    setTimeout(() => {
      calendar.changeView('timeGridDay');
    }, 200);
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

const searchStudent = async searchText => {
  currentFocus = -1;

  const res = await fetch("http://127.0.0.1:5000/list_student.json");
  const listStudent = await res.json();

  // Todo: Use Regexp more efficient
  let matches = listStudent.filter(student => {
    let array = searchText.replaceAll(' ', '').split(',');
    let element = array[array.length-1];

    const regex = new RegExp(`^${element}`, 'gi');
    for (let text of student[1].split(' ')) {
      if (text.match(regex)) return true;
    }
    return String(student[0]).match(regex);
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
// Todo: fix problem with map
$(document).on('click','.match-search',function() {
  let array = studentSearchEl.value.replaceAll(' ', '').split(',');
  array[array.length-1] = this.id;
  studentSearchEl.value = array.join(', ');

  matchList.innerHTML = '';
  updateSchedule();
});

$(document).on('click','#student_search_btn',function() {
  matchList.innerHTML = '';
  $(this).blur();
  updateSchedule();
});

// Select student by enter
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
      let array = studentSearchEl.value.replaceAll(' ', '').split(',');
      array[array.length-1] = x[currentFocus].id;
      studentSearchEl.value = array.join(', ');

      matchList.innerHTML = '';
      // $(this).blur();
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
  calendar.removeAllEvents();
  clearMap();

  let msvList = document.getElementById("student_search").value;
  fetch(`/get_student_schedule/${msvList}`)
      .then(function (response) {
          return response.json();
      }).then(function (response) {
          if (response.length == 0) {
            return 0;
          }

          // Remove twice just in case 
          calendar.removeAllEvents();
          
          // Max 3 persons
          const color = ['rgb(245, 81, 30, 0.96)', 'rgb(3, 155, 230, 0.96)', 'rgb(125, 179, 67, 0.96)'];
          for (let i = 0; i < response.length; i++) {
            timeTable = response[i].timeTable;
            initCalendar(response[i].msv, color[i]);
          }
      });
}