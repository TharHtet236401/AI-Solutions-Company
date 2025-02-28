document.addEventListener('DOMContentLoaded', async function() {
    try {
        // Fetch visualization data from the API
        const response = await fetch('/api/inquiries/visualization-data');
        const data = await response.json();
        
        if (!data.con) {
            throw new Error('Failed to fetch visualization data');
        }

        const visualizationData = data.result;
        console.log('Visualization data:', visualizationData);

        // Validate data existence
        if (!visualizationData || !visualizationData.statusDistribution || !visualizationData.yearDistribution) {
            throw new Error('Invalid data structure received from server');
        }

        // Status Distribution Chart
        const statusDistribution = Array.isArray(visualizationData.statusDistribution) ? 
            visualizationData.statusDistribution : [];
        const statusLabels = statusDistribution.map(item => item._id || 'Unknown');
        const statusData = statusDistribution.map(item => item.count || 0);
        
        if (statusLabels.length > 0) {
            const statusCtx = document.getElementById('statusDistributionChart').getContext('2d');
            new Chart(statusCtx, {
                type: 'pie',
                data: {
                    labels: statusLabels,
                    datasets: [{
                        data: statusData,
                        backgroundColor: [
                            'rgba(33, 150, 243, 0.9)',   // blue for pending
                            'rgba(76, 175, 80, 0.9)',    // green for completed
                            'rgba(255, 152, 0, 0.9)',    // orange for in-progress
                            'rgba(244, 67, 54, 0.9)',    // red for rejected
                            'rgba(156, 39, 176, 0.9)'    // purple for other statuses
                        ],
                        borderColor: '#ffffff',
                        borderWidth: 2,
                        hoverBorderWidth: 0,
                        hoverOffset: 10
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'right',
                            labels: {
                                padding: 20,
                                font: {
                                    size: 13,
                                    family: "'Segoe UI', sans-serif"
                                },
                                usePointStyle: true,
                                pointStyle: 'circle'
                            }
                        },
                        title: {
                            display: true,
                            text: 'Inquiry Status Distribution',
                            font: {
                                size: 16,
                                family: "'Segoe UI', sans-serif",
                                weight: '600'
                            },
                            padding: {
                                top: 10,
                                bottom: 30
                            }
                        },
                        tooltip: {
                            backgroundColor: 'rgba(255, 255, 255, 0.9)',
                            titleColor: '#333',
                            titleFont: {
                                size: 14,
                                weight: '600'
                            },
                            bodyColor: '#666',
                            bodyFont: {
                                size: 13
                            },
                            borderColor: 'rgba(0, 0, 0, 0.1)',
                            borderWidth: 1,
                            padding: 12,
                            boxPadding: 6,
                            usePointStyle: true
                        }
                    },
                    animation: {
                        animateScale: true,
                        animateRotate: true,
                        duration: 2000,
                        easing: 'easeInOutQuart'
                    }
                }
            });
        }

        // Year Distribution Chart
        const yearDistribution = Array.isArray(visualizationData.yearDistribution) ? 
            visualizationData.yearDistribution : [];
        const yearLabels = yearDistribution.map(item => item._id?.toString() || 'Unknown');
        const yearData = yearDistribution.map(item => item.count || 0);

        console.log('Year data:', { labels: yearLabels, data: yearData });

        if (yearLabels.length > 0) {
            const yearCtx = document.getElementById('yearDistributionChart').getContext('2d');
            new Chart(yearCtx, {
                type: 'pie',
                data: {
                    labels: yearLabels,
                    datasets: [{
                        data: yearData,
                        backgroundColor: [
                            'rgba(63, 81, 181, 0.9)',   // indigo
                            'rgba(0, 188, 212, 0.9)',   // cyan
                            'rgba(0, 150, 136, 0.9)',   // teal
                            'rgba(139, 195, 74, 0.9)',  // light green
                            'rgba(255, 193, 7, 0.9)'    // amber
                        ],
                        borderColor: '#ffffff',
                        borderWidth: 2,
                        hoverBorderWidth: 0,
                        hoverOffset: 10
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'right',
                            labels: {
                                padding: 20,
                                font: {
                                    size: 13,
                                    family: "'Segoe UI', sans-serif"
                                },
                                usePointStyle: true,
                                pointStyle: 'circle'
                            }
                        },
                        title: {
                            display: true,
                            text: 'Inquiries by Year',
                            font: {
                                size: 16,
                                family: "'Segoe UI', sans-serif",
                                weight: '600'
                            },
                            padding: {
                                top: 10,
                                bottom: 30
                            }
                        },
                        tooltip: {
                            backgroundColor: 'rgba(255, 255, 255, 0.9)',
                            titleColor: '#333',
                            titleFont: {
                                size: 14,
                                weight: '600'
                            },
                            bodyColor: '#666',
                            bodyFont: {
                                size: 13
                            },
                            borderColor: 'rgba(0, 0, 0, 0.1)',
                            borderWidth: 1,
                            padding: 12,
                            boxPadding: 6,
                            usePointStyle: true
                        }
                    },
                    animation: {
                        animateScale: true,
                        animateRotate: true,
                        duration: 2000,
                        easing: 'easeInOutQuart'
                    }
                }
            });
        }

    } catch (error) {
        console.error('Error loading visualization data:', error);
        const errorMessage = error.message || 'Failed to load visualization data';
        console.log('Detailed error:', error);
        
        // Display error message to user
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = `${errorMessage}. Please try refreshing the page.`;
        document.querySelector('.visualization-grid').prepend(errorDiv);
    }
}); 