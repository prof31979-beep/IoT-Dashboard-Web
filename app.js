function fetchMockTelemetryData() {
    const mockData = {
        temperature: { ts: Date.now(), value: (Math.random() * 40).toFixed(1) },
        humidity: { ts: Date.now(), value: (Math.random() * 100).toFixed(0) },
        alarms: Math.random() > 0.7 ? [
            { message: "High Temperature Alert", timestamp: Date.now() }
        ] : []
    };

    const temp = parseFloat(mockData.temperature.value);
    const hum = parseInt(mockData.humidity.value);
    const timestamp = new Date(mockData.temperature.ts).toLocaleTimeString();

    tempGauge.refresh(temp);

    if (humidityChart.data.labels.length > 10) {
        humidityChart.data.labels.shift();
        humidityChart.data.datasets[0].data.shift();
    }

    humidityChart.data.labels.push(timestamp);
    humidityChart.data.datasets[0].data.push(hum);
    humidityChart.update();

    updateAlarms(mockData.alarms);
}

function updateAlarms(alarmsData) {
    const alarmsContainer = document.getElementById('alarms-list');
    alarmsContainer.innerHTML = '';

    if (!alarmsData || alarmsData.length === 0) {
        alarmsContainer.innerHTML = '<p class="text-green-600">All systems normal ✅</p>';
        return;
    }

    alarmsData.forEach(alarm => {
        const alarmEl = document.createElement('div');
        alarmEl.className = 'bg-red-100 p-3 rounded-lg mb-2 text-red-800';
        alarmEl.textContent = `⚠️ ${alarm.message} at ${new Date(alarm.timestamp).toLocaleTimeString()}`;
        alarmsContainer.appendChild(alarmEl);
    });
}

window.addEventListener('load', () => {
    initializeDashboard();
    fetchMockTelemetryData();
    setInterval(fetchMockTelemetryData, 5000);
});
