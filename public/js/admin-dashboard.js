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
}); 