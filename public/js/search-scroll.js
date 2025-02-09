// Add this to your main.js or create a new file
document.addEventListener('DOMContentLoaded', function() {
    // Check if we have a hash in the URL
    if (window.location.hash) {
        const element = document.querySelector(window.location.hash);
        if (element) {
            // Wait a bit for any dynamic content to load
            setTimeout(() => {
                element.scrollIntoView({ behavior: 'smooth' });
                // Optionally highlight the section
                element.classList.add('highlight-section');
                setTimeout(() => element.classList.remove('highlight-section'), 3000);
            }, 500);
        }
    }
}); 