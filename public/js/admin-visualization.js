document.addEventListener('DOMContentLoaded', function() {
    // Inquiries Trend Chart
    const trendCtx = document.getElementById('inquiriesTrendChart').getContext('2d');
    new Chart(trendCtx, {
        type: 'line',
        data: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
            datasets: [{
                label: 'Inquiries',
                data: [65, 78, 90, 85, 95, 110],
                borderColor: '#2962ff',
                tension: 0.4,
                fill: true,
                backgroundColor: 'rgba(41, 98, 255, 0.1)'
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

    // Status Distribution Chart
    const statusCtx = document.getElementById('statusDistributionChart').getContext('2d');
    new Chart(statusCtx, {
        type: 'doughnut',
        data: {
            labels: ['New', 'In Progress', 'Completed', 'Pending'],
            datasets: [{
                data: [30, 25, 35, 10],
                backgroundColor: [
                    '#2196f3',
                    '#ff9800',
                    '#4caf50',
                    '#f44336'
                ]
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false
        }
    });

    // Geographic Distribution Chart
    const geoCtx = document.getElementById('geographicChart').getContext('2d');
    new Chart(geoCtx, {
        type: 'bar',
        data: {
            labels: ['USA', 'UK', 'Germany', 'France', 'Japan'],
            datasets: [{
                label: 'Inquiries by Country',
                data: [45, 35, 25, 20, 15],
                backgroundColor: '#3f51b5'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            }
        }
    });

    // Industry Distribution Chart
    const industryCtx = document.getElementById('industryChart').getContext('2d');
    new Chart(industryCtx, {
        type: 'pie',
        data: {
            labels: ['Healthcare', 'Finance', 'Technology', 'Manufacturing', 'Retail'],
            datasets: [{
                data: [30, 25, 20, 15, 10],
                backgroundColor: [
                    '#4caf50',
                    '#2196f3',
                    '#9c27b0',
                    '#ff9800',
                    '#f44336'
                ]
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false
        }
    });
}); 