document.addEventListener('DOMContentLoaded', async function() {
    try {
        // Fetch both inquiries and staff visualization data
        const [inquiriesResponse, staffResponse] = await Promise.all([
            fetch('/api/inquiries/visualization-data'),
            fetch('/api/users/visualization-data')
        ]);

        const inquiriesData = await inquiriesResponse.json();
        const staffData = await staffResponse.json();
        
        if (!inquiriesData.con || !staffData.con) {
            throw new Error('Failed to fetch visualization data');
        }

        const visualizationData = inquiriesData.result;
        const staffVisualizationData = staffData.result;

        // Staff Role Distribution Chart
        if (staffVisualizationData.roleDistribution) {
            const roleLabels = staffVisualizationData.roleDistribution.map(item => item._id);
            const roleData = staffVisualizationData.roleDistribution.map(item => item.count);

            const roleCtx = document.getElementById('staffRoleChart').getContext('2d');
            new Chart(roleCtx, {
                type: 'doughnut',
                data: {
                    labels: roleLabels,
                    datasets: [{
                        data: roleData,
                        backgroundColor: [
                            'rgba(63, 81, 181, 0.8)',   // Super Admin - Blue
                            'rgba(76, 175, 80, 0.8)',   // Customer Support - Green
                            'rgba(255, 152, 0, 0.8)',   // Sales - Orange
                            'rgba(233, 30, 99, 0.8)',   // Marketing - Pink
                            'rgba(156, 39, 176, 0.8)',  // Content - Purple
                            'rgba(0, 188, 212, 0.8)',   // Accounting - Cyan
                            'rgba(121, 85, 72, 0.8)',   // Executive - Brown
                        ],
                        borderColor: '#ffffff',
                        borderWidth: 2,
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
                        tooltip: {
                            backgroundColor: 'rgba(255, 255, 255, 0.9)',
                            titleColor: '#333',
                            bodyColor: '#666',
                            borderColor: 'rgba(0, 0, 0, 0.1)',
                            borderWidth: 1,
                            padding: 12,
                            callbacks: {
                                label: function(context) {
                                    const total = roleData.reduce((a, b) => a + b, 0);
                                    const percentage = ((context.raw / total) * 100).toFixed(1);
                                    return `${context.label}: ${context.raw} (${percentage}%)`;
                                }
                            }
                        }
                    },
                    animation: {
                        animateScale: true,
                        animateRotate: true
                    }
                }
            });
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
            
        // Ensure we have all years from 2022 to current year
        const currentYear = new Date().getFullYear();
        const years = {};
        
        // Initialize all years from 2022 to current with 0
        for (let year = 2022; year <= currentYear; year++) {
            years[year] = 0;
        }
        
        // Fill in actual data
        yearDistribution.forEach(item => {
            const year = item._id?.toString() || 'Unknown';
            if (years.hasOwnProperty(year)) {
                years[year] = item.count || 0;
            }
        });

        const yearLabels = Object.keys(years);
        const yearData = Object.values(years);

        console.log('Year data:', { labels: yearLabels, data: yearData });

        if (yearLabels.length > 0) {
            const yearCtx = document.getElementById('yearDistributionChart').getContext('2d');
            new Chart(yearCtx, {
                type: 'bar',
                data: {
                    labels: yearLabels,
                    datasets: [{
                        label: 'Number of Inquiries',
                        data: yearData,
                        backgroundColor: 'rgba(63, 81, 181, 0.8)',
                        borderColor: 'rgba(63, 81, 181, 1)',
                        borderWidth: 1,
                        borderRadius: 8,
                        hoverBackgroundColor: 'rgba(63, 81, 181, 0.9)',
                        barThickness: 40,
                        maxBarThickness: 50
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    indexAxis: 'x',
                    plugins: {
                        legend: {
                            display: false
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
                            callbacks: {
                                label: function(context) {
                                    return `Total Inquiries: ${context.raw}`;
                                }
                            }
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            grid: {
                                color: 'rgba(0, 0, 0, 0.05)',
                                drawBorder: false
                            },
                            ticks: {
                                font: {
                                    size: 12,
                                    family: "'Segoe UI', sans-serif"
                                },
                                color: '#666',
                                callback: function(value) {
                                    return Math.floor(value); // Show only whole numbers
                                }
                            }
                        },
                        x: {
                            grid: {
                                display: false
                            },
                            ticks: {
                                font: {
                                    size: 12,
                                    family: "'Segoe UI', sans-serif",
                                    weight: '500'
                                },
                                color: '#333'
                            }
                        }
                    },
                    animation: {
                        duration: 2000,
                        easing: 'easeInOutQuart'
                    }
                }
            });
        }

        // Geographical Distribution Chart
        const geographicalDistribution = Array.isArray(visualizationData.geographicalDistribution) ? 
            visualizationData.geographicalDistribution : [];
        const geoLabels = geographicalDistribution.map(item => item._id || 'Unknown');
        const geoData = geographicalDistribution.map(item => item.count || 0);

        if (geoLabels.length > 0) {
            const geoCtx = document.getElementById('geographicChart').getContext('2d');
            new Chart(geoCtx, {
                type: 'bar',
                data: {
                    labels: geoLabels,
                    datasets: [{
                        label: 'Number of Inquiries',
                        data: geoData,
                        backgroundColor: 'rgba(0, 150, 136, 0.8)',
                        borderColor: 'rgba(0, 150, 136, 1)',
                        borderWidth: 1,
                        borderRadius: 4,
                        hoverBackgroundColor: 'rgba(0, 150, 136, 0.9)',
                        barThickness: 25,
                        maxBarThickness: 35
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    indexAxis: 'y',  // This makes it a horizontal bar chart
                    plugins: {
                        legend: {
                            display: false
                        },
                        title: {
                            display: true,
                            text: 'Top 10 Countries by Inquiries',
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
                            callbacks: {
                                label: function(context) {
                                    return `Total Inquiries: ${context.raw}`;
                                }
                            }
                        }
                    },
                    scales: {
                        y: {
                            grid: {
                                display: false
                            },
                            ticks: {
                                font: {
                                    size: 12,
                                    family: "'Segoe UI', sans-serif"
                                },
                                color: '#333'
                            }
                        },
                        x: {
                            beginAtZero: true,
                            grid: {
                                color: 'rgba(0, 0, 0, 0.05)',
                                drawBorder: false
                            },
                            ticks: {
                                font: {
                                    size: 12,
                                    family: "'Segoe UI', sans-serif"
                                },
                                color: '#666',
                                callback: function(value) {
                                    return Math.floor(value); // Show only whole numbers
                                }
                            }
                        }
                    },
                    animation: {
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