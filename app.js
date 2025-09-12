// Real-time clock
function updateClock() {
    const clockEl = document.getElementById('clock');
    const now = new Date();
    clockEl.textContent = now.toLocaleString();
}
setInterval(updateClock, 1000);
updateClock();

// Humidity Chart Initialization
const ctx = document.getElementById('humidityChart').getContext('2d');
const humidityChart = new Chart(ctx, {
    type: 'line',
    data: {
        labels: [],
        datasets: [{
            label: 'Humidity (%)',
            data: [],
            borderColor: '#3b82f6',
            backgroundColor: 'rgba(59, 130, 246, 0.2)',
            tension: 0.4,
        }]
    },
    options: {
        responsive: true,
        scales: {
            y: { min: 0, max: 100 }
        }
    }
});

// Gauge creation function
function createGauge(value) {
    const gaugeEl = document.getElementById('gauge');
    gaugeEl.innerHTML = ''; // Clear previous gauge

    const svgNS = "http://www.w3.org/2000/svg";
    const size = 200;
    const center = size / 2;
    const radius = center - 20;
    const startAngle = -Math.PI * 0.75;
    const endAngle = Math.PI * 0.75;

    const percent = value / 40;
    const needleAngle = startAngle + percent * (endAngle - startAngle);

    const svg = document.createElementNS(svgNS, 'svg');
    svg.setAttribute('width', size);
    svg.setAttribute('height', size);

    // Background arc
    const arcPath = document.createElementNS(svgNS, 'path');
    const startX = center + radius * Math.cos(startAngle);
    const startY = center + radius * Math.sin(startAngle);
    const endX = center + radius * Math.cos(endAngle);
    const endY = center + radius * Math.sin(endAngle);

    arcPath.setAttribute('d',
        `M ${startX} ${startY} A ${radius} ${radius} 0 1 1 ${endX} ${endY}`);
    arcPath.setAttribute('stroke', '#555');
    arcPath.setAttribute('stroke-width', '20');
    arcPath.setAttribute('fill', 'none');
    svg.appendChild(arcPath);

    // Needle
    const needle = document.createElementNS(svgNS, 'line');
    needle.setAttribute('x1', center);
    needle.setAttribute('y1', center);
    needle.setAttribute('x2', center + (radius - 20) * Math.cos(needleAngle));
    needle.setAttribute('y2', center + (radius - 20) * Math.sin(needleAngle));
    needle.setAttribute('stroke', '#3b82f6');
    needle.setAttribute('stroke-width', '4');
    svg.appendChild(needle);

    // Center circle
    const centerCircle = document.createElementNS(svgNS, 'circle');
    centerCircle.setAttribute('cx', center);
    centerCircle.setAttribute('cy', center);
    centerCircle.setAttribute('r', 5);
    centerCircle.setAttribute('fill', '#3b82f6');
    svg.appendChild(centerCircle);

    gaugeEl.appendChild(svg);

    // Update text
    document.getElementById('temp-value').textContent = `${value.toFixed(1)} °C`;
}

// Mock Data Generator
function generateMockData() {
    const temp = Math.random() * 40;
    const humidity = Math.random() * 100;

    // Update gauge
    createGauge(temp);

    // Update chart
    const now = new Date().toLocaleTimeString();
    humidityChart.data.labels.push(now);
    humidityChart.data.datasets[0].data.push(humidity);

    if (humidityChart.data.labels.length > 20) {
        humidityChart.data.labels.shift();
        humidityChart.data.datasets[0].data.shift();
    }

    humidityChart.update();

    // Random alarms
    const alarmsList = document.getElementById('alarms-list');
    if (Math.random() > 0.7) {
        const alarm = document.createElement('div');
        alarm.className = 'bg-red-600 text-white p-3 rounded shadow flex justify-between items-center fade-in';
        alarm.innerHTML = `
            <span>⚠️ High Humidity Detected: ${humidity.toFixed(1)}%</span>
            <button class="text-white font-bold" onclick="this.parentElement.remove()">✖</button>
        `;
        alarmsList.prepend(alarm);

        // Keep max 5 alarms
        if (alarmsList.childNodes.length > 5) {
            alarmsList.removeChild(alarmsList.lastChild);
        }
    }
}

generateMockData();
setInterval(generateMockData, 5000);
