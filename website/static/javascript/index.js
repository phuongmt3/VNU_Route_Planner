import { calendar } from './calendar.js'

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