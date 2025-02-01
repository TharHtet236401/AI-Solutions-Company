document.addEventListener('DOMContentLoaded', function() {
    // Hamburger Menu
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');
    const body = document.body;

    if (!hamburger || !navLinks) {
        console.error('Navigation elements not found');
        return;
    }

    // Create overlay element if it doesn't exist
    let overlay = document.querySelector('.nav-overlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.classList.add('nav-overlay');
        document.body.appendChild(overlay);
    }

    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        navLinks.classList.toggle('active');
        overlay.classList.toggle('active');
        body.style.overflow = body.style.overflow === 'hidden' ? '' : 'hidden';
    });

    // Close menu when clicking overlay
    overlay.addEventListener('click', () => {
        hamburger.classList.remove('active');
        navLinks.classList.remove('active');
        overlay.classList.remove('active');
        body.style.overflow = '';
    });

    // Close menu when clicking a link
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', () => {
            hamburger.classList.remove('active');
            navLinks.classList.remove('active');
            overlay.classList.remove('active');
            body.style.overflow = '';
        });
    });
}); 