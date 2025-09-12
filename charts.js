let tempGauge;
let humidityChart;

function initializeDashboard() {
    tempGauge = new JustGage({
        id: 'temp-gauge',
        value: 0,
        min: -10,
        max: 50,
        title: "Temperature",
        label: "°C",
        levelColors: ["#00ff00", "#ffcc00", "#ff3300"]
    });

    const ctx = document.getElementById('humidityChart').getContext('2d');
    humidityChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Humidity (%)',
                data: [],
                borderColor: 'rgba(75, 192, 192, 1)',
                fill: true
            }]
        },
        options: {
            responsive: true,
            scales: {
                x: { title: { display: true, text: 'Time' } },
                y: { min: 0, max: 100, title: { display: true, text: 'Humidity (%)' } }
            }
        }
    });
}
