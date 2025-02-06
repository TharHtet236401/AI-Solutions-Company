let currentPage = 1;
const limit = 12;
let totalPages = 1;
let currentSort = '-createdAt';
let currentCategory = '';
let currentSearch = '';

document.addEventListener('DOMContentLoaded', async function() {
    await fetchAndRenderGallery();
    
    // Add event listeners for filters
    document.getElementById('searchInput').addEventListener('input', debounce(async (e) => {
        currentSearch = e.target.value;
        currentPage = 1;
        await fetchAndRenderGallery();
    }, 300));

    document.getElementById('categoryFilter').addEventListener('change', async (e) => {
        currentCategory = e.target.value;
        currentPage = 1;
        await fetchAndRenderGallery();
    });

    document.getElementById('sortOrder').addEventListener('change', async (e) => {
        currentSort = e.target.value;
        currentPage = 1;
        await fetchAndRenderGallery();
    });
});

async function fetchAndRenderGallery() {
    try {
        const response = await fetch(`/api/gallery?page=${currentPage}&limit=${limit}&sort=${currentSort}&category=${currentCategory}&search=${currentSearch}`);
        const data = await response.json();
        
        if (data.con) {
            renderGallery(data.result.items);
            totalPages = data.result.totalPages;
            updatePagination();
        }
    } catch (error) {
        console.error('Error fetching gallery:', error);
        showError('Failed to load gallery');
    }
}

function renderGallery(items) {
    const galleryGrid = document.getElementById('galleryGrid');
    galleryGrid.innerHTML = items.map(item => `
        <div class="gallery-item">
            <div class="gallery-image">
                <img src="${item.image || '/images/placeholder.jpg'}" alt="${item.title}">
            </div>
            <div class="gallery-content">
                <span class="gallery-category">${item.category}</span>
                <h3 class="gallery-title">${item.title}</h3>
                <p class="gallery-description">${item.description || ''}</p>
                <div class="gallery-actions">
                    <button class="gallery-action-btn edit-btn" onclick="editGalleryItem('${item._id}')">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="gallery-action-btn delete-btn" onclick="deleteGalleryItem('${item._id}')">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

function updatePagination() {
    const paginationContainer = document.querySelector('.pagination');
    if (!paginationContainer || totalPages <= 1) return;

    let paginationHTML = '';

    // Previous button
    paginationHTML += `
        <button class="pagination-btn ${currentPage === 1 ? 'disabled' : ''}" 
                onclick="changePage(${currentPage - 1})" 
                ${currentPage === 1 ? 'disabled' : ''}>
            <i class="fas fa-chevron-left"></i>
        </button>
    `;

    // Page numbers
    let startPage = Math.max(1, currentPage - 2);
    let endPage = Math.min(totalPages, currentPage + 2);

    if (startPage > 1) {
        paginationHTML += `
            <button class="pagination-number" onclick="changePage(1)">1</button>
            ${startPage > 2 ? '<span class="pagination-ellipsis">...</span>' : ''}
        `;
    }

    for (let i = startPage; i <= endPage; i++) {
        paginationHTML += `
            <button class="pagination-number ${i === currentPage ? 'active' : ''}" 
                    onclick="changePage(${i})">
                ${i}
            </button>
        `;
    }

    if (endPage < totalPages) {
        paginationHTML += `
            ${endPage < totalPages - 1 ? '<span class="pagination-ellipsis">...</span>' : ''}
            <button class="pagination-number" onclick="changePage(${totalPages})">
                ${totalPages}
            </button>
        `;
    }

    // Next button
    paginationHTML += `
        <button class="pagination-btn ${currentPage === totalPages ? 'disabled' : ''}" 
                onclick="changePage(${currentPage + 1})"
                ${currentPage === totalPages ? 'disabled' : ''}>
            <i class="fas fa-chevron-right"></i>
        </button>
    `;

    paginationContainer.innerHTML = paginationHTML;
}

async function handleGallerySubmit(event) {
    event.preventDefault();
    const form = document.getElementById('galleryForm');
    const formData = new FormData(form);

    try {
        const response = await fetch('/api/gallery', {
            method: 'POST',
            body: formData
        });

        const data = await response.json();
        if (data.con) {
            closeGalleryModal();
            await fetchAndRenderGallery();
            showSuccess('Image added successfully');
        } else {
            showError(data.msg || 'Failed to add image');
        }
    } catch (error) {
        console.error('Error:', error);
        showError('Failed to add image');
    }
}

function openCreateGalleryModal() {
    const modal = document.getElementById('galleryModal');
    const form = document.getElementById('galleryForm');
    form.reset();
    modal.style.display = 'block';
}

function closeGalleryModal() {
    const modal = document.getElementById('galleryModal');
    modal.style.display = 'none';
}

async function deleteGalleryItem(id) {
    if (confirm('Are you sure you want to delete this image?')) {
        try {
            const response = await fetch(`/api/gallery/${id}`, {
                method: 'DELETE'
            });

            const data = await response.json();
            if (data.con) {
                await fetchAndRenderGallery();
                showSuccess('Image deleted successfully');
            } else {
                showError(data.msg || 'Failed to delete image');
            }
        } catch (error) {
            console.error('Error:', error);
            showError('Failed to delete image');
        }
    }
}

function showSuccess(message) {
    // Implement success message display
    console.log('Success:', message);
}

function showError(message) {
    // Implement error message display
    console.error('Error:', message);
}

// Utility function for debouncing
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
} 