const accessToken = 'Jup1c1SXSNiO6I0iuygg'; // ThingsBoard access token (leave empty for simulation)

const modeToggle = document.getElementById('modeToggle');
const modeLabel = document.getElementById('modeLabel');
const statusIndicator = document.getElementById('statusIndicator');
const intervalSelect = document.getElementById('intervalSelect');
const clearAlarmsBtn = document.getElementById('clearAlarms');

const temperatureNumeric = document.getElementById('temperatureNumeric');
const vibrationValueEl = document.getElementById('vibrationValue');
const gpsText = document.getElementById('gpsText');
const alarmsList = document.getElementById('alarmsList');

let isLive = false;
let refreshMs = parseInt(intervalSelect.value, 10);
let loopTimer = null;

// CLOCK
function startClock() {
  const clk = document.getElementById('clock');
  setInterval(() => {
    clk.innerText = new Date().toLocaleTimeString();
  }, 1000);
}
startClock();

// Center-text plugin
const centerTextPlugin = {
  id: 'centerText',
  beforeDraw(chart) {
    if (chart.config.type !== 'doughnut') return;
    const ctx = chart.ctx;
    ctx.save();
    const w = chart.width;
    const h = chart.height;
    ctx.font = `${Math.round(h / 8)}px sans-serif`;
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const value = chart.data.datasets[0].data[0];
    ctx.fillText(`${value.toFixed(1)} °C`, w / 2, h / 1.6);
    ctx.restore();
  }
};
Chart.register(centerTextPlugin);

// Temperature gauge
const tempCtx = document.getElementById('temperatureGauge').getContext('2d');
const temperatureGauge = new Chart(tempCtx, {
  type: 'doughnut',
  data: {
    labels: ['temp', 'rest'],
    datasets: [{ data: [0, 50], backgroundColor: ['#34D399', '#0f172a'], borderWidth: 0 }]
  },
  options: {
    rotation: -90,
    circumference: 180,
    cutout: '72%',
    responsive: true,
    plugins: { legend: { display: false }, tooltip: { enabled: false } },
    animation: { duration: 700 }
  }
});

// Humidity chart
const humCtx = document.getElementById('humidityChart').getContext('2d');
const humidityChart = new Chart(humCtx, {
  type: 'line',
  data: { labels: [], datasets: [{ label: 'Humidity %', data: [], borderColor: '#60A5FA', tension: 0.25 }] },
  options: {
    responsive: true,
    scales: { y: { min: 0, max: 100 }, x: { display: true } },
    plugins: { legend: { display: false } }
  }
});

// MAP
let map, mapMarker;
function initMap() {
  const defaultPos = { lat: 28.6139, lng: 77.2090 };
  map = new google.maps.Map(document.getElementById('map'), { center: defaultPos, zoom: 12 });
  mapMarker = new google.maps.Marker({ position: defaultPos, map });
  gpsText.innerText = `Lat: ${defaultPos.lat.toFixed(6)}, Lon: ${defaultPos.lng.toFixed(6)}`;
}
window.initMap = initMap;

function updateMap(lat, lon) {
  if (map && mapMarker) {
    const pos = { lat, lng: lon };
    gpsText.innerText = `Lat: ${lat.toFixed(6)}, Lon: ${lon.toFixed(6)}`;
    map.setCenter(pos);
    mapMarker.setPosition(pos);
  }
}

// UI Mode handling
function setMode(live) {
  isLive = live && !!accessToken;
  modeLabel.innerText = isLive ? 'Live' : 'Simulate';
  const cls = isLive ? 'status-live' : 'status-sim';
  statusIndicator.classList.toggle('status-live', isLive);
  statusIndicator.classList.toggle('status-sim', !isLive);

  if (live && !accessToken) {
    alert('No ThingsBoard access token provided — using simulation.');
    modeToggle.checked = false;
    isLive = false;
    modeLabel.innerText = 'Simulate';
  }
}

modeToggle.addEventListener('change', (e) => setMode(e.target.checked));
intervalSelect.addEventListener('change', () => {
  refreshMs = parseInt(intervalSelect.value, 10);
  restartLoop();
});
clearAlarmsBtn.addEventListener('click', () => { alarmsList.innerHTML = ''; });

function pushAlarm(text) {
  const el = document.createElement('div');
  el.className = 'flex items-center justify-between bg-red-700 p-2 rounded';
  el.innerHTML = `<div class="text-sm">${text}</div><button class="ml-3 px-2 py-1 bg-gray-800 rounded">Dismiss</button>`;
  el.querySelector('button').onclick = () => el.remove();
  alarmsList.prepend(el);
  while (alarmsList.childElementCount > 8) alarmsList.removeChild(alarmsList.lastChild);
}

async function fetchThingsboardTelemetry() {
  const keys = 'temperature,humidity,latitude,longitude,vibration,alarm';
  const url = `https://thingsboard.cloud/api/v1/${accessToken}/telemetry/values/timeseries?keys=${keys}`;
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    const getVal = (k) => (json[k] && json[k].length > 0) ? json[k][0].value : null;
    return {
      temperature: parseFloat(getVal('temperature')),
      humidity: parseFloat(getVal('humidity')),
      latitude: parseFloat(getVal('latitude')),
      longitude: parseFloat(getVal('longitude')),
      vibration: parseFloat(getVal('vibration')),
      alarm: getVal('alarm')
    };
  } catch (err) {
    console.warn('ThingsBoard fetch failed:', err);
    throw err;
  }
}

function simulateTelemetry() {
  const temperature = +(Math.random() * 45).toFixed(1);
  const humidity = +(Math.random() * 100).toFixed(1);
  const latitude = +(28.6139 + (Math.random()-0.5)*0.1).toFixed(6);
  const longitude = +(77.2090 + (Math.random()-0.5)*0.1).toFixed(6);
  const vibration = +(Math.random() * 10).toFixed(2);
  const alarm = Math.random() > 0.9 ? 'High Temperature Detected!' : null;
  return { temperature, humidity, latitude, longitude, vibration, alarm };
}

function applyTelemetry(data) {
  const temp = (typeof data.temperature === 'number' && !isNaN(data.temperature)) ? Math.min(Math.max(data.temperature, 0), 50) : 0;
  const color = temp > 30 ? '#EF4444' : (temp > 15 ? '#FBBF24' : '#34D399');
  temperatureGauge.data.datasets[0].backgroundColor = [color, '#071025'];
  temperatureGauge.data.datasets[0].data[0] = temp;
  temperatureGauge.data.datasets[0].data[1] = Math.max(0, 50 - temp);
  temperatureGauge.update();
  temperatureNumeric.innerText = `${temp.toFixed(1)} °C`;

  const now = new Date().toLocaleTimeString();
  humidityChart.data.labels.push(now);
  humidityChart.data.datasets[0].data.push(typeof data.humidity === 'number' ? data.humidity : 0);
  if (humidityChart.data.labels.length > 30) {
    humidityChart.data.labels.shift();
    humidityChart.data.datasets[0].data.shift();
  }
  humidityChart.update();

  vibrationValueEl.innerText = (typeof data.vibration === 'number') ? data.vibration.toFixed(2) : '--';

  if (typeof data.latitude === 'number' && typeof data.longitude === 'number') {
    updateMap(data.latitude, data.longitude);
  }

  if (data.alarm) pushAlarm(data.alarm);
}

async function updateCycle() {
  if (isLive && accessToken) {
    try {
      const tbData = await fetchThingsboardTelemetry();
      const hasMeaningful = Object.values(tbData).some(v => v !== null);
      if (!hasMeaningful) {
        applyTelemetry(simulateTelemetry());
      } else {
        applyTelemetry(tbData);
      }
    } catch (err) {
      applyTelemetry(simulateTelemetry());
    }
  } else {
    applyTelemetry(simulateTelemetry());
  }
}

function restartLoop() {
  if (loopTimer) clearInterval(loopTimer);
  loopTimer = setInterval(updateCycle, refreshMs);
}

function start() {
  setModeFromToggle();
  restartLoop();
  updateCycle();
}

function setModeFromToggle() {
  const checked = modeToggle.checked;
  setMode(checked);
}

document.addEventListener('DOMContentLoaded', () => {
  modeToggle.disabled = false;
  start();
});

