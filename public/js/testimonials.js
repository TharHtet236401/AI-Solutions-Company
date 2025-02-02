document.addEventListener('DOMContentLoaded', function() {
    const tabs = document.querySelectorAll('.testimonial-tabs .tab');
    const contents = document.querySelectorAll('.testimonial-content');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const company = tab.dataset.company;
            
            // Remove active class from all tabs and contents
            tabs.forEach(t => t.classList.remove('active'));
            contents.forEach(c => c.classList.remove('active'));
            
            // Add active class to clicked tab and corresponding content
            tab.classList.add('active');
            document.querySelector(`.testimonial-content[data-company="${company}"]`).classList.add('active');
        });
    });
}); 