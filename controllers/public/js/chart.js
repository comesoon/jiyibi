let currentChart = null;

function destroyChart() {
    if (currentChart) {
        currentChart.destroy();
        currentChart = null;
    }
}

// Function to create a trend chart (Line Chart)
export function createTrendChart(ctx, data) {
    destroyChart();
    currentChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: data.labels,
            datasets: [{
                label: '收入',
                data: data.incomeData,
                borderColor: '#4CAF50',
                backgroundColor: 'rgba(76, 175, 80, 0.1)',
                fill: true,
            }, {
                label: '支出',
                data: data.expenseData,
                borderColor: '#f44336',
                backgroundColor: 'rgba(244, 67, 54, 0.1)',
                fill: true,
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

// Function to create a category pie chart
export function createPieChart(ctx, data) {
    destroyChart();
    currentChart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: data.labels,
            datasets: [{
                label: '支出分类',
                data: data.values,
                backgroundColor: [
                    '#f44336', '#E91E63', '#9C27B0', '#673AB7', '#3F51B5',
                    '#2196F3', '#03A9F4', '#00BCD4', '#009688', '#4CAF50',
                    '#8BC34A', '#CDDC39', '#FFEB3B', '#FFC107', '#FF9800'
                ],
                categoryIds: data.categoryIds, // Store category IDs here
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            onClick: (event, elements) => {
                if (elements.length > 0) {
                    const chartElement = elements[0];
                    const index = chartElement.index;
                    const categoryId = currentChart.data.datasets[0].categoryIds[index];
                    if (categoryId) {
                        window.location.hash = `#/transactions?categoryId=${categoryId}`;
                    }
                }
            }
        }
    });
}

// Function to create a comparison bar chart
export function createBarChart(ctx, data) {
    destroyChart();
    currentChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: data.labels,
            datasets: [{
                label: '收入',
                data: data.incomeData,
                backgroundColor: '#4CAF50',
            }, {
                label: '支出',
                data: data.expenseData,
                backgroundColor: '#f44336',
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}
