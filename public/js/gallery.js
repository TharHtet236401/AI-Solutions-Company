document.addEventListener('DOMContentLoaded', function() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    const loadMoreBtn = document.querySelector('.load-more-btn');
    let currentPage = 1;
    let currentCategory = 'all';
    
    async function loadFilteredGallery(category = 'all', page = 1, append = false) {
        try {
            // Show loading state
            loadMoreBtn.classList.add('loading');
            
            const response = await fetch(`/api/gallery?page=${page}&limit=4&category=${category}`);
            const data = await response.json();
            
            if (data.con && data.result.items.length > 0) {
                const galleryGrid = document.querySelector('.gallery-grid');
                
                // Clear existing content if not appending
                if (!append) {
                    galleryGrid.innerHTML = '';
                }
                
                const items = data.result.items;
                items.forEach(item => {
                    const imageUrl = item.image || '/images/placeholder.jpg';
                    const html = `
                        <div class="gallery-item" data-category="${item.category}">
                            <img src="${imageUrl}" alt="${item.title}">
                            <div class="gallery-overlay">
                                <div class="gallery-info">
                                    <h3>${item.title}</h3>
                                    ${item.description ? `<p>${item.description}</p>` : ''}
                                </div>
                            </div>
                        </div>
                    `;
                    galleryGrid.innerHTML += html;
                });

                // Show/hide load more button based on whether there are more items
                loadMoreBtn.style.display = data.result.hasMore ? 'block' : 'none';
            } else {
                // No items found
                const galleryGrid = document.querySelector('.gallery-grid');
                if (!append) {
                    galleryGrid.innerHTML = '<div class="no-items">No images found in this category</div>';
                }
                loadMoreBtn.style.display = 'none';
            }
        } catch (error) {
            console.error('Error loading gallery:', error);
        } finally {
            // Remove loading state
            loadMoreBtn.classList.remove('loading');
        }
    }

    // Handle filter button clicks
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Reset page number when changing category
            currentPage = 1;
            currentCategory = this.dataset.filter;
            
            // Remove active class from all buttons
            filterButtons.forEach(btn => btn.classList.remove('active'));
            // Add active class to clicked button
            this.classList.add('active');
            // Load filtered gallery
            loadFilteredGallery(currentCategory, currentPage);
        });
    });

    // Handle load more button click
    loadMoreBtn.addEventListener('click', function() {
        currentPage++;
        loadFilteredGallery(currentCategory, currentPage, true);
    });

    // Initial load
    loadFilteredGallery('all', 1);

    // Scroll animation
    const fadeElements = document.querySelectorAll('.fade-in-section');
    
    const scrollObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
            }
        });
    }, { threshold: 0.1 });

    fadeElements.forEach(element => {
        scrollObserver.observe(element);
    });
}); 