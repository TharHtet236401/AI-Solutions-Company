document.addEventListener('DOMContentLoaded', function() {
    const sections = document.querySelectorAll('.fade-in-section');
    
    const options = {
        root: null, // use viewport
        threshold: 0.1, // trigger when 10% of element is visible
        rootMargin: '-50px' // trigger 50px before element enters viewport
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target); // only animate once
            }
        });
    }, options);

    sections.forEach(section => {
        observer.observe(section);
    });
}); 