function setIndexWithCurrentIndex(raw, indexNo) {
  let res = [];
  for (let i = indexNo; i < raw.length; i++) {
    res.push(raw[i]);
  }
  for (let i = 0; i < indexNo; i++) {
    res.push(raw[i]);
  }
  return res;
}
function sanitizeId(text) {
  return String(text)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function createRing(container, labels, idPrefix = "") {
  if (!container) return;
  container.innerHTML = "";

  const entries = Array.isArray(labels)
    ? labels
    : Object.keys(labels).map((k) => labels[k]);
  const x = entries.length;
  if (x === 0) return;
  for (let i = 0; i < x; i++) {
    const raw = entries[i];
    const label = Array.isArray(raw) ? raw[0] : raw;
    const el = document.createElement("div");
    el.className = "item";
    const angle = -90 + (360 * i) / x;
    el.style.setProperty("--rot", angle + "deg");
    el.style.transform = `rotate(${angle}deg) translateX(var(--r)) translateY(-50%)`;
    const span = document.createElement("span");
    span.className = "label";
    span.textContent = label;
    el.appendChild(span);
    const safe = sanitizeId(String(label));
    if (safe) el.id = idPrefix + safe;
    container.appendChild(el);
  }
}

function createRingwithFixData(container, labels, idPrefix = "") {
  if (!container) return;
  container.innerHTML = "";

  // support labels passed as object (e.g. {0:[1,2],...}) or as array
  let entries;
  if (Array.isArray(labels)) entries = labels;
  else if (labels && typeof labels === "object")
    entries = Object.keys(labels).map((k) => labels[k]);
  else return;

  const x = entries.length;
  if (x === 0) return;

  for (let i = 0; i < x; i++) {
    const raw = entries[i];
    const label = Array.isArray(raw) ? raw[0] : raw;
    const el = document.createElement("div");
    el.className = "item";
    const angle = -90 + (360 * i) / x;
    el.style.setProperty("--rot", angle + "deg");
    el.style.transform = `rotate(${angle}deg) translateX(var(--r)) translateY(-50%)`;
    const span = document.createElement("span");
    span.className = "label";
    span.textContent = label;
    el.appendChild(span);
    const safe = sanitizeId(String(label));
    if (safe) el.id = idPrefix + safe;
    container.appendChild(el);
  }
}

function setParams(data) {
  console.log("setParams call with data:", data);
  // Fix: correct id for dates container is "dates" (not "date") in the HTML
  const DATES_CONTAINER = document.getElementById("dates");
  const MONTHS_CONTAINER = document.getElementById("months");
  const WEEKDAYS_CONTAINER = document.getElementById("weekdays");
  const CLOCK_CONTAINER = document.getElementById("clock");
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const mon = setIndexWithCurrentIndex(months, data[1]);
  const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const week = setIndexWithCurrentIndex(weekdays, data[2]);
  const dates = [];
  for (let i = 0; i < 31; i++) {
    if (i < 9) {
      dates.push([`0${i + 1}`, i]);
    } else {
      dates.push([`${i + 1}`, i]);
    }
  }

  // Initialize the date object as empty
  const date = setIndexWithCurrentIndex(dates, data[0]);

  const hours = [];
  for (let i = 0; i < 12; i++) {
    hours.push(i === 0 ? 12 : i);
  }

  const hour = {};
  for (let i = 0; i < 12; i++) {
    hour[i] = [i + 1, 2];
  }
  console.log("hours", hours, "\nhour", hour);

  // create all rings
  createRing(DATES_CONTAINER, date, "date-");
  createRing(MONTHS_CONTAINER, mon, "month-");
  createRing(WEEKDAYS_CONTAINER, week, "weekday-");
  // Place hour markers in a separate child container so we don't remove the analog hands
  let hourNumbers = CLOCK_CONTAINER.querySelector(".hour-numbers");
  if (!hourNumbers) {
    hourNumbers = document.createElement("div");
    hourNumbers.className = "hour-numbers ring";
    const analog = CLOCK_CONTAINER.querySelector(".analog");
    if (analog) CLOCK_CONTAINER.insertBefore(hourNumbers, analog);
    else CLOCK_CONTAINER.appendChild(hourNumbers);
  }
  createRingwithFixData(hourNumbers, hours, "hour-");
}

function updateHighlights() {
  highlightItem("date");
  highlightItem("month");
  highlightItem("weekday");
}
function highlightItem(idPrefix) {
  const items = document
    .getElementById(idPrefix + "s")
    .querySelectorAll(".item");
  items.forEach((item, i) => {
    if (i === 0) {
      item.classList.add("active");
      item.classList.remove("inactive");
    } else {
      item.classList.add("inactive");
      item.classList.remove("active");
    }
  });
}
function updateClockHands(time) {
  const elMinute = document.getElementById("minute");
  const elHour = document.getElementById("hour");
  const elh = document.getElementById("time-h");
  const elm = document.getElementById("time-m");
  const els = document.getElementById("time-s");
  if (elh) elh.textContent = String(time[0]).padStart(2, "0");
  if (elm) elm.textContent = String(time[1]).padStart(2, "0");
  if (els) els.textContent = String(time[2]).padStart(2, "0");
  // background: radial-gradient(circle at 30% 25%, rgba(0, 0, 205, 0.5) 0%, rgba(0, 1, 0, 0.5) 60%, rgba(241, 0, 0, 0.5) 100%);
  minangle = time[1] * 6 + (time[2] * 6) / 60;
  houangle = (time[0] % 12) * 30 + minangle / 12;
  if (elMinute)
    elMinute.style.transform = `translate(-50%, -100%) rotate(${minangle}deg)`;
  if (elHour)
    elHour.style.transform = `translate(-50%, -100%) rotate(${houangle}deg)`;
}

function tick() {
  const now = new Date();
  const data = [now.getDate() - 1, now.getMonth(), now.getDay()];
  // const time = [12, 0, 0];
  const time = [
    now.getHours(),
    // 0,
    now.getMinutes(),
    // 0,
    now.getSeconds(),
    // 0
  ];
  // Recreate rings first (so items exist), then update hands and apply active/inactive classes
  setParams(data);
  updateClockHands(time);
  updateHighlights();
}
setInterval(tick, 999);
