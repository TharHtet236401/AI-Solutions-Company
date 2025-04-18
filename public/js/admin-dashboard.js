document.addEventListener('DOMContentLoaded', function() {
    const menuToggle = document.querySelector('.menu-toggle');
    const adminContainer = document.querySelector('.admin-container');
    const sidebar = document.querySelector('.sidebar');
    
    // Create overlay element
    const overlay = document.createElement('div');
    overlay.className = 'sidebar-overlay';
    adminContainer.appendChild(overlay);

    // Toggle sidebar
    function toggleSidebar() {
        adminContainer.classList.toggle('sidebar-open');
        document.body.style.overflow = adminContainer.classList.contains('sidebar-open') ? 'hidden' : '';
    }

    // Event listeners
    menuToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleSidebar();
    });

    overlay.addEventListener('click', () => {
        toggleSidebar();
    });

    // Close sidebar when clicking outside
    document.addEventListener('click', (e) => {
        if (adminContainer.classList.contains('sidebar-open') &&
            !sidebar.contains(e.target) &&
            !menuToggle.contains(e.target)) {
            toggleSidebar();
        }
    });

    // Close sidebar when screen is resized to desktop size
    window.addEventListener('resize', () => {
        if (window.innerWidth > 768 && adminContainer.classList.contains('sidebar-open')) {
            toggleSidebar();
        }
    });

    // Prevent clicks inside sidebar from closing it
    sidebar.addEventListener('click', (e) => {
        e.stopPropagation();
    });

    loadOverviewData();
});

async function loadOverviewData() {
    try {
        const response = await fetch('/api/inquiries/overview');
        const data = await response.json();
        
        if (data.con) {
            const stats = data.result;
            
            // Update statistics
            document.getElementById('todayInquiries').textContent = stats.countTodayInquiries;
            document.getElementById('weekInquiries').textContent = stats.countThisWeekInquiries;
            document.getElementById('monthInquiries').textContent = stats.countThisMonthInquiries;
            document.getElementById('pendingInquiries').textContent = stats.countPendingInquiries;

            // Update status counts
            if (stats.statusDistribution) {
                stats.statusDistribution.forEach(status => {
                    const countElement = document.getElementById(`${status._id}-count`);
                    if (countElement) {
                        countElement.textContent = status.count || 0;
                    }
                });
            }

            // Update year distribution
            const yearStats = document.getElementById('yearStats');
            if (yearStats && stats.yearDistribution) {
                yearStats.innerHTML = stats.yearDistribution.map(year => `
                    <div class="year-item">
                        <span class="year-label">${year._id}</span>
                        <span class="year-count">${year.count}</span>
                    </div>
                `).join('');
            }

            // Update top countries
            const topCountriesList = document.getElementById('topCountries');
            if (topCountriesList && stats.topCountries) {
                topCountriesList.innerHTML = stats.topCountries.map(country => `
                    <div class="country-item">
                        <span>${country._id}</span>
                        <span class="country-count">${country.count}</span>
                    </div>
                `).join('');
            }

            // Update recent inquiries table
            const tableBody = document.getElementById('recentInquiriesList');
            tableBody.innerHTML = ''; // Clear existing content

            stats.last10Inquiries.forEach(inquiry => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td data-label="Contact Info">
                        <div class="inquiry-contact">
                            <div class="contact-name">${inquiry.name}</div>
                            <div class="contact-email">${inquiry.email}</div>
                        </div>
                    </td>
                    <td data-label="Company & Job">
                        <div class="company-info">
                            <div>${inquiry.companyName}</div>
                            <div class="job-title">${inquiry.jobTitle}</div>
                        </div>
                    </td>
                    <td data-label="Status">
                        <span class="status-badge ${inquiry.status || 'pending'}">
                            ${inquiry.status || 'pending'}
                        </span>
                    </td>
                `;
                tableBody.appendChild(row);
            });

            // Add chart data
            const ctx = document.getElementById('inquiriesChart').getContext('2d');
            new Chart(ctx, {
                type: 'line',
                data: {
                    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                    datasets: [{
                        label: 'Inquiries This Week',
                        data: stats.weeklyTrend,
                        borderColor: 'rgb(75, 192, 192)',
                        tension: 0.1
                    }]
                }
            });
        }
    } catch (error) {
        console.error('Error loading overview data:', error);
    }
}

// Add these utility functions to admin-dashboard.js so they can be used across all admin pages

function showToast(message, type = 'success') {
    // Remove existing toasts with the same message
    const existingToasts = document.querySelectorAll('.toast');
    existingToasts.forEach(toast => {
        if (toast.querySelector('.message').textContent === message) {
            toast.remove();
        }
    });

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
        <span class="message">${message}</span>
        <span class="close-toast">
            <i class="fas fa-times"></i>
        </span>
    `;

    document.body.appendChild(toast);

    // Add click handler to close button
    const closeBtn = toast.querySelector('.close-toast');
    closeBtn.addEventListener('click', () => {
        toast.style.animation = 'slideOut 0.3s ease-out forwards';
        setTimeout(() => toast.remove(), 300);
    });

    // Auto remove after 5 seconds
    setTimeout(() => {
        if (document.body.contains(toast)) {
            toast.style.animation = 'slideOut 0.3s ease-out forwards';
            setTimeout(() => toast.remove(), 300);
        }
    }, 5000);
}

function showSuccess(message) {
    showToast(message, 'success');
}

function showError(message) {
    showToast(message, 'error');
} 