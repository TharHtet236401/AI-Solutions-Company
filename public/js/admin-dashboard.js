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

            // Update recent inquiries table
            const tableBody = document.getElementById('recentInquiriesList');
            tableBody.innerHTML = ''; // Clear existing content

            stats.last10Inquiries.forEach(inquiry => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>
                        <div class="inquiry-contact">
                            <div class="contact-name">${inquiry.name}</div>
                            <div class="contact-email">${inquiry.email}</div>
                        </div>
                    </td>
                    <td>
                        <div class="company-info">
                            <div>${inquiry.companyName}</div>
                            <div class="job-title">${inquiry.jobTitle}</div>
                        </div>
                    </td>
                    <td>${inquiry.country}</td>
                    <td>
                        <span class="status-badge ${inquiry.status}">${inquiry.status}</span>
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