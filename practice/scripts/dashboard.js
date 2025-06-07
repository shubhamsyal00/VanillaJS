const mockData = {
    "2025": {
        revenue: [0, 30, 230, 50, 30, 105, 130, 230, 200, 230, 240, 250],
        expenses: [30, 50, 20, 70, 90, 60, 80, 160, 120, 60, 70, 100],
        profit: [90, 400, 160, 300, 100, 500, 120, 400, 110, 360, 160, 220],
        sessions: [20, 30, 20, 10, 150, 500, 20, 0, 60, 40, 70, 30, 110, 240, 300, 350, 400, 50, 50, 120, 100, 80, 60, 20],
        pageviews: '70.4K',
        users: '32.2K',
        signups: '812',
        subscriptions: '3.1K',
        totalRevenue: '$250.2K'
    },
    "2024": {
        revenue: [0, 20, 15, 230, 90, 95, 125, 150, 180, 30, 220, 230],
        expenses: [25, 40, 18, 65, 85, 55, 70, 140, 110, 50, 60, 95],
        profit: [100, 500, 160, 500, 100, 500, 160, 500, 160, 500, 160, 500],
        sessions: [10, 50, 120, 80, 140, 300, 50, 0, 80, 40, 70, 30, 110, 240, 300, 450, 400, 50, 50, 120, 100, 80, 60, 20],
        pageviews: '58.1K',
        users: '27.5K',
        signups: '740',
        subscriptions: '2.7K',
        totalRevenue: '$230.4K'
    },
    "2023": {
        revenue: [0, 120, 5, 190, 65, 80, 100, 120, 140, 170, 190, 200],
        expenses: [20, 35, 25, 55, 75, 50, 60, 110, 90, 40, 55, 85],
        profit: [120, 500, 360, 220, 100, 330, 160, 500, 160, 500, 160, 500],
        sessions: [20, 50, 120, 80, 312, 545, 67, 0, 123, 40, 33, 55, 110, 240, 300, 123, 400, 50, 678, 120, 100, 80, 60, 20],
        pageviews: '47.9K',
        users: '22.3K',
        signups: '663',
        subscriptions: '1.9K',
        totalRevenue: '$200.0K'
    }
};

let lineChartInstance
let barChartInstance
let sessionChartInstance
function renderChart(data) {
    const barCtx = document.getElementById('lineChart').getContext('2d');
    if (lineChartInstance) lineChartInstance.destroy(); // Clear old instance

    lineChartInstance = new Chart(barCtx, {
        type: 'line',
        data: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
            datasets: [
                {
                    label: 'Revenue',
                    data: data.revenue,
                    borderColor: '#CB3CFF',
                    backgroundColor: ctx => {
                        const chart = ctx.chart;
                        const { ctx: context, chartArea } = chart;
                        if (!chartArea) return;

                        const gradient = context.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
                        gradient.addColorStop(0, 'rgba(87, 93, 255, .4)');
                        gradient.addColorStop(1, 'rgba(87, 93, 255, 0)');
                        return gradient;
                    },
                    borderWidth: 1,
                    tension: 0.5,
                    fill: true,
                    pointRadius: ctx => ctx.dataIndex === data.revenue.length - 1 ? 3 : 6,
                    pointHoverRadius: ctx => ctx.dataIndex === data.revenue.length - 1 ? 7 : 7,
                    pointBackgroundColor: ctx => ctx.dataIndex === data.revenue.length - 1 ? '#CB3CFF' : 'transparent',
                    pointBorderColor: ctx => ctx.dataIndex === data.revenue.length - 1 ? '#CB3CFF' : 'transparent',
                    pointHoverBackgroundColor: '#0B1739',
                    pointHoverBorderColor: '#CB3CFF'
                },
                {
                    label: 'Expenses',
                    data: data.expenses,
                    borderColor: '#00C2FF',
                    backgroundColor: ctx => {
                        const chart = ctx.chart;
                        const { ctx: context, chartArea } = chart;
                        if (!chartArea) return;

                        const gradient = context.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
                        gradient.addColorStop(0, 'rgba(87, 195, 255, 1)');
                        gradient.addColorStop(1, 'rgba(87, 195, 255, 0)');
                        return gradient;
                    },
                    borderWidth: 1,
                    tension: 0.5,
                    fill: true,
                    pointRadius: ctx => ctx.dataIndex === data.expenses.length - 1 ? 3 : 6,
                    pointHoverRadius: ctx => ctx.dataIndex === data.expenses.length - 1 ? 7 : 7,
                    pointBackgroundColor: ctx => ctx.dataIndex === data.expenses.length - 1 ? '#00C2FF' : 'transparent',
                    pointBorderColor: ctx => ctx.dataIndex === data.expenses.length - 1 ? '#00C2FF' : 'transparent',
                    pointHoverBackgroundColor: '#0B1739',
                    pointHoverBorderColor: '#00C2FF'
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: { display: false },
                tooltip: {
                    enabled: false,
                    external: function (context) {
                        const tooltipModel = context.tooltip;
                        const tooltip = document.getElementById('chart-tooltip');
                        const valueEl = document.getElementById('tooltip-value');
                        const dateEl = document.getElementById('tooltip-date');
                        const changeEl = document.getElementById('tooltip-change');

                        if (tooltipModel.opacity === 0) {
                            tooltip.style.opacity = 0;
                            tooltip.style.display = 'none';
                            return;
                        }

                        tooltip.style.display = 'block';

                        const revenue = tooltipModel.dataPoints[0].raw;
                        const month = tooltipModel.dataPoints[0].label;
                        const index = tooltipModel.dataPoints[0].dataIndex;

                        valueEl.textContent = `$${revenue}k`;
                        dateEl.textContent = `June ${index + 1}, 2023`;
                        changeEl.textContent = `+12.5%`;

                        const canvasRect = context.chart.canvas.getBoundingClientRect();
                        tooltip.style.left = canvasRect.left + window.pageXOffset + tooltipModel.caretX - 60 + 'px';
                        tooltip.style.top = canvasRect.top + window.pageYOffset + tooltipModel.caretY-75 + 'px';
                        tooltip.style.opacity = 1;
                    }
                }
            },
            scales: {
                x: {
                    ticks: {
                        color: '#cbd5e1',
                        font: { size: 12 }
                    },
                    grid: { display: false }
                },
                y: {
                    ticks: {
                        color: '#cbd5e1',
                        font: { size: 12 },
                        callback: function (value) {
                            return value + 'K';
                        }
                    },
                    grid: {
                         display: false
                    }
                }
            }
        }
    });
}
function renderBarChart(data) {
    const barCtx = document.getElementById('barChart').getContext('2d');
    if (barChartInstance) barChartInstance.destroy(); // Clear old instance
    barChartInstance = new Chart(barCtx, {
        type: 'bar',
        data: {
            labels: ['12 AM', '2 AM', '4 AM', '6 AM', '8 AM', '10 AM', '12 PM', '2 PM', '4 PM', '6 PM', '8 PM', '10 PM'],
            datasets: [
                {
                    label: 'Profit',
                    data: data.profit,
                    backgroundColor: '#CB3CFF',
                    borderRadius: 4,
                    barPercentage: 0.5
                },
                {
                    label: 'Expense',
                    data: data.expenses,
                    backgroundColor: '#00C2FF',
                    borderRadius: 4,
                    barPercentage: 0.5
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: { display: false }
            },
            scales: {
                x: {
                    ticks: {
                        color: '#cbd5e1',
                        maxRotation: 0,
                        minRotation: 0
                    },
                    grid: {
                        display: false
                    }
                },
                y: {
                    display: false
                }
            }
        }
    });
}

function renderSessionsChart(data) {
    const sessionCtx = document.getElementById('sessionsChart').getContext('2d');
    if (sessionChartInstance) sessionChartInstance.destroy(); // Clear old instance

    sessionChartInstance = new Chart(sessionCtx, {
        type: 'line',
        data: {
            labels: ['12 AM', '2 AM', '4 AM', '6 AM', '8 AM', '10 AM', '12 PM', '2 PM', '4 PM', '6 PM', '8 PM', '10 PM'],
            datasets: [{
                label: 'Sessions',
                data: data.sessions,
                borderColor: '#CB3CFF',
                borderWidth: 2,
                tension: 0, // no curve
                fill: false,
                pointRadius: 0 // no dots
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: { display: false }
            },
            scales: {
                x: {
                    ticks: {
                        color: '#cbd5e1',
                        autoSkip: true,
                        maxTicksLimit: 6
                    },
                    grid: { display: false }
                },
                y: {
                    ticks: { color: '#cbd5e1' },
                    grid: { display: false }
                }
            }
        }
    });
}

function updateDashboard(year) {
    const data = mockData[year];
    document.getElementById('pageviews').textContent = data.pageviews;
    document.getElementById('monthlyUsers').textContent = data.users;
    document.getElementById('signups').textContent = data.signups;
    document.getElementById('subscriptions').textContent = data.subscriptions;
    document.getElementById('totalRevenue').textContent = data.totalRevenue;
    renderChart(data);
    renderBarChart(data);
    renderSessionsChart(data);
}

window.onload = () => {
    updateDashboard('2025');
};
const trigger = document.getElementById("selectTrigger");
const optionsList = document.getElementById("optionsList");
const selected = document.getElementById("selectedYear");

trigger.addEventListener("click", () => {
    optionsList.style.display = optionsList.style.display === "flex" ? "none" : "flex";
});

document.querySelectorAll(".option").forEach(option => {
    option.addEventListener("click", () => {
        document.querySelectorAll(".option").forEach(o => o.classList.remove("selected"));
        option.classList.add("selected");
        selected.textContent = option.textContent;
        optionsList.style.display = "none";

        // Optional: handle logic for your chart
        updateDashboard(option.getAttribute("data-value"));
    });
});

// Optional: close dropdown if clicking outside
document.addEventListener("click", function (e) {
    if (!document.querySelector(".custom-select-wrapper").contains(e.target)) {
        optionsList.style.display = "none";
    }
});
