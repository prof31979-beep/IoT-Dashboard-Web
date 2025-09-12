const tempEl = document.getElementById('temp-value');
const alarmsEl = document.getElementById('alarms-list');

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
            tension: 0.3,
            fill: true
        }]
    },
    options: {
        responsive: true,
        plugins: {
            legend: { labels: { color: '#ffffff' } }
        },
        scales: {
            x: { 
                ticks: { color: '#ffffff' }, 
                title: { display: true, text: 'Time', color: '#ffffff' } 
            },
            y: { 
                min: 0, max: 100,
                ticks: { color: '#ffffff' }, 
                title: { display: true, text: 'Humidity (%)', color: '#ffffff' }
            }
        }
    }
});

function generateMockData() {
    const temp = (Math.random() * 40).toFixed(1);
    const humidity = (Math.random() * 100).toFixed(0);
    const time = new Date().toLocaleTimeString();

    tempEl.textContent = `${temp} °C`;

    if (humidityChart.data.labels.length > 10) {
        humidityChart.data.labels.shift();
        humidityChart.data.datasets[0].data.shift();
    }

    humidityChart.data.labels.push(time);
    humidityChart.data.datasets[0].data.push(humidity);
    humidityChart.update();

    const showAlarm = Math.random() > 0.7;

    if (showAlarm) {
        const alarmDiv = document.createElement('div');
        alarmDiv.className = 'bg-red-600 text-white p-3 rounded shadow fade-in';
        alarmDiv.textContent = `🔥 High Temp Alert at ${time}`;
        alarmsEl.prepend(alarmDiv);
    }

    if (alarmsEl.children.length === 0) {
        alarmsEl.innerHTML = '<p class="text-green-400">All systems normal ✅</p>';
    }
}

window.addEventListener('load', () => {
    generateMockData();
    setInterval(generateMockData, 5000);
});
