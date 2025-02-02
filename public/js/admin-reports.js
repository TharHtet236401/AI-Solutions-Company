document.addEventListener('DOMContentLoaded', function() {
    // Initialize Charts
    initInquiriesChart();
    initCountriesChart();
    initIndustryChart();

    // Date Range Picker Initialization
    const startDate = document.getElementById('startDate');
    const endDate = document.getElementById('endDate');
    
    // Set default date range (last 30 days)
    const today = new Date();
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(today.getDate() - 30);
    
    startDate.valueAsDate = thirtyDaysAgo;
    endDate.valueAsDate = today;
});

function initInquiriesChart() {
    const ctx = document.getElementById('inquiriesChart').getContext('2d');
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
            datasets: [{
                label: 'Inquiries',
                data: [65, 59, 80, 81],
                borderColor: '#3498db',
                tension: 0.4,
                fill: true,
                backgroundColor: 'rgba(52, 152, 219, 0.1)'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

function initCountriesChart() {
    const ctx = document.getElementById('countriesChart').getContext('2d');
    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['USA', 'UK', 'Canada', 'Australia', 'Others'],
            datasets: [{
                data: [30, 25, 20, 15, 10],
                backgroundColor: [
                    '#3498db',
                    '#2ecc71',
                    '#f1c40f',
                    '#e74c3c',
                    '#95a5a6'
                ]
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'right'
                }
            }
        }
    });
}

function initIndustryChart() {
    const ctx = document.getElementById('industryChart').getContext('2d');
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Technology', 'Healthcare', 'Finance', 'Education', 'Others'],
            datasets: [{
                data: [45, 35, 30, 25, 20],
                backgroundColor: '#3498db'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

// Export Report Function
function exportReport() {
    // Implementation for report export
    console.log('Exporting report...');
}

// Generate Report Function
function generateReport() {
    const startDate = document.getElementById('startDate').value;
    const endDate = document.getElementById('endDate').value;
    
    // Implementation for report generation
    console.log(`Generating report from ${startDate} to ${endDate}`);
}

// Chart Period Toggle
document.querySelectorAll('.chart-btn').forEach(btn => {
    btn.addEventListener('click', function() {
        document.querySelectorAll('.chart-btn').forEach(b => b.classList.remove('active'));
        this.classList.add('active');
        // Update chart data based on selected period
    });
}); 