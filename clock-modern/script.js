// script.js — generate rings and animate the clock with 5-stage rotation
const DATES_CONTAINER = document.getElementById('dates');
const MONTHS_CONTAINER = document.getElementById('months');
const WEEKDAYS_CONTAINER = document.getElementById('weekdays');
const CLOCK_CENTER = document.querySelector('.clock-center');
const DIGITAL = document.getElementById('digital');

const months = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];
const weekdays = ['SUN','MON','TUE','WED','THU','FRI','SAT'];

// Stage management
const STAGES = [
  { name: 'Date', element: DATES_CONTAINER },
  { name: 'Month', element: MONTHS_CONTAINER },
  { name: 'Weekday', element: WEEKDAYS_CONTAINER },
  { name: 'Analog Clock', element: CLOCK_CENTER },
  { name: 'Digital Time', element: DIGITAL }
];

let currentStage = 0;
let autoRotateTimer = null;

const stageIndicator = document.getElementById('stage-indicator');
const currentStageSpan = document.getElementById('current-stage');
const prevBtn = document.getElementById('prev-stage');
const nextBtn = document.getElementById('next-stage');

function createRing(container, labels){
  container.innerHTML = '';
  const count = labels.length;
  for(let i=0;i<count;i++){
    const el = document.createElement('div');
    el.className = 'item';
    const angle = 360 * i / count;
    el.style.setProperty('--rot', angle + 'deg');
    el.style.transform = `rotate(${angle}deg) translate(-50%,-50%)`;
    const span = document.createElement('span');
    span.className = 'label';
    span.textContent = labels[i];
    el.appendChild(span);
    container.appendChild(el);
  }
}

function createDates(container){
  const labels = [];
  // show 1..31 (we'll hide extras when month shorter)
  for(let d=1;d<=31;d++) labels.push(String(d).padStart(2,'0'));
  createRing(container, labels);
}

createDates(DATES_CONTAINER);
createRing(MONTHS_CONTAINER, months);
createRing(WEEKDAYS_CONTAINER, weekdays);

function updateHighlights(){
  const now = new Date();
  const d = now.getDate();
  const m = now.getMonth();
  const w = now.getDay();

  // highlight date
  [...DATES_CONTAINER.children].forEach((el, i)=>{
    if(i+1 === d){ el.classList.add('active'); }
    else el.classList.remove('active');
    // hide invalid dates for the month
    const monthDays = new Date(now.getFullYear(), m+1, 0).getDate();
    el.style.display = (i+1 <= monthDays) ? 'block' : 'none';
  });

  // highlight month
  [...MONTHS_CONTAINER.children].forEach((el,i)=>{
    el.classList.toggle('active', i===m);
  });

  // highlight weekday
  [...WEEKDAYS_CONTAINER.children].forEach((el,i)=>{
    el.classList.toggle('active', i===w);
  });
}

function updateClockHands(){
  const now = new Date();
  const seconds = now.getSeconds();
  const minutes = now.getMinutes();
  const hours = now.getHours() % 12;

  const secondsDeg = seconds * 6;
  const minutesDeg = minutes * 6 + seconds * 0.1;
  const hoursDeg = hours * 30 + minutes * 0.5;

  document.getElementById('second').style.transform = `translate(-50%,-100%) rotate(${secondsDeg}deg)`;
  document.getElementById('minute').style.transform = `translate(-50%,-100%) rotate(${minutesDeg}deg)`;
  document.getElementById('hour').style.transform = `translate(-50%,-100%) rotate(${hoursDeg}deg)`;
}

function updateDigital(){
  if(!DIGITAL) return;
  const now = new Date();
  const hh = String(now.getHours()).padStart(2,'0');
  const mm = String(now.getMinutes()).padStart(2,'0');
  const ss = String(now.getSeconds()).padStart(2,'0');
  DIGITAL.textContent = `${hh}:${mm}:${ss}`;
}

function showStage(stageIndex) {
  // Hide all stages
  STAGES.forEach((stage, index) => {
    stage.element.classList.remove('visible');
  });
  
  // Show current stage
  STAGES[stageIndex].element.classList.add('visible');
  
  // Update indicator
  stageIndicator.textContent = STAGES[stageIndex].name;
  currentStageSpan.textContent = stageIndex + 1;
  
  // Reset auto-rotate timer
  clearTimeout(autoRotateTimer);
  autoRotateTimer = setTimeout(() => {
    currentStage = (currentStage + 1) % STAGES.length;
    showStage(currentStage);
  }, 5000);
}

function nextStage() {
  currentStage = (currentStage + 1) % STAGES.length;
  showStage(currentStage);
}

function prevStage() {
  currentStage = (currentStage - 1 + STAGES.length) % STAGES.length;
  showStage(currentStage);
}

// Event listeners for buttons
nextBtn.addEventListener('click', nextStage);
prevBtn.addEventListener('click', prevStage);

function tick(){
  updateHighlights();
  updateClockHands();
  updateDigital();
}

// start
tick();
showStage(0);
setInterval(tick, 1000);

