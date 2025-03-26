let currentPage = 1;
const limit = 12;
let totalPages = 1;
let currentSort = '-createdAt';
let currentCategory = '';
let galleryToDelete = null;

document.addEventListener('DOMContentLoaded', async function() {
    await fetchAndRenderGallery();
    
    // Add event listeners for filters
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
        const response = await fetch(`/api/gallery?page=${currentPage}&limit=${limit}&sort=${currentSort}&category=${currentCategory}`);
        const data = await response.json();
        
        if (data.con) {
            renderGallery(data.result.items);
            totalPages = data.result.totalPages;
            currentPage = data.result.currentPage;
            updatePagination();
        }
    } catch (error) {
        console.error('Error fetching gallery:', error);
        window.showError('Failed to load gallery');
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
                    <button class="gallery-action-btn delete-btn" onclick="deleteGallery('${item._id}')">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

async function changePage(page) {
    if (page < 1 || page > totalPages || page === currentPage) return;
    currentPage = page;
    await fetchAndRenderGallery();
    window.scrollTo({ top: 0, behavior: 'smooth' });
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

async function editGalleryItem(id) {
    try {
        const response = await fetch(`/api/gallery/${id}`);
        const data = await response.json();
        
        if (data.con) {
            const gallery = data.result;
            const modal = document.getElementById('galleryModal');
            const form = document.getElementById('galleryForm');
            const modalTitle = document.getElementById('modalTitle');
            
            // Update modal title and form fields
            modalTitle.textContent = 'Edit Gallery Item';
            form.elements['title'].value = gallery.title;
            form.elements['category'].value = gallery.category;
            form.elements['description'].value = gallery.description || '';
            
            // Update image preview
            const previewContainer = document.getElementById('imagePreview');
            previewContainer.innerHTML = `
                <img src="${gallery.image}" alt="Current image" class="preview-image">
                <p class="preview-note">Upload new image to change</p>
            `;
            
            // Set form mode to edit
            form.dataset.mode = 'edit';
            form.dataset.galleryId = id;
            
            // Make image upload optional for edit
            document.getElementById('imageFile').removeAttribute('required');
            
            modal.style.display = 'block';
            document.body.style.overflow = 'hidden';
        } else {
            window.showError('Failed to fetch gallery item details');
        }
    } catch (error) {
        console.error('Error:', error);
        window.showError('Failed to fetch gallery item details');
    }
}

function openCreateGalleryModal() {
    const modal = document.getElementById('galleryModal');
    const form = document.getElementById('galleryForm');
    const modalTitle = document.getElementById('modalTitle');
    
    // Reset form and set title
    form.reset();
    form.dataset.mode = 'create';
    delete form.dataset.galleryId;
    modalTitle.textContent = 'Add New Image';
    
    // Show image preview placeholder
    const previewContainer = document.getElementById('imagePreview');
    if (previewContainer) {
        previewContainer.innerHTML = '<div class="preview-placeholder">Image Preview</div>';
    }
    
    // Make image required for create
    document.getElementById('imageFile').setAttribute('required', 'required');
    
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
}

async function handleGallerySubmit(event) {
    event.preventDefault();
    
    const form = event.target;
    const isEdit = form.dataset.mode === 'edit';
    const galleryId = form.dataset.galleryId;
    const formData = new FormData(form);
    const submitButton = form.querySelector('button[type="submit"]');
    const originalText = submitButton.innerHTML;
    
    try {
        submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';
        submitButton.disabled = true;

        const url = isEdit ? `/api/gallery/${galleryId}` : '/api/gallery';
        const method = isEdit ? 'PUT' : 'POST';

        const response = await fetch(url, {
            method: method,
            body: formData
        });

        const data = await response.json();

        if (data.con) {
            window.showSuccess(`Gallery item ${isEdit ? 'updated' : 'added'} successfully`);
            closeGalleryModal();
            await fetchAndRenderGallery();
        } else {
            window.showError(data.msg || `Failed to ${isEdit ? 'update' : 'add'} gallery item`);
        }
    } catch (error) {
        console.error('Error:', error);
        window.showError(`Failed to ${isEdit ? 'update' : 'add'} gallery item`);
    } finally {
        submitButton.innerHTML = originalText;
        submitButton.disabled = false;
    }
}

function closeGalleryModal() {
    const modal = document.getElementById('galleryModal');
    modal.style.display = 'none';
    document.body.style.overflow = '';
    
    // Reset form
    const form = document.getElementById('galleryForm');
    form.reset();
    form.dataset.mode = 'create';
    delete form.dataset.galleryId;
}

function deleteGallery(id) {
    galleryToDelete = id;
    const deleteModal = document.getElementById('deleteModal');
    deleteModal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeDeleteModal() {
    const deleteModal = document.getElementById('deleteModal');
    deleteModal.classList.remove('active');
    document.body.style.overflow = '';
    galleryToDelete = null;
}

async function confirmDelete() {
    if (!galleryToDelete) return;
    
    try {
        const response = await fetch(`/api/gallery/${galleryToDelete}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        const data = await response.json();
        if (data.con) {
            showSuccess('Gallery item deleted successfully');
            await fetchAndRenderGallery();
        } else {
            showError(data.msg || 'Failed to delete gallery item');
        }
    } catch (error) {
        console.error('Error:', error);
        showError('Failed to delete gallery item');
    } finally {
        closeDeleteModal();
    }
}

// Add event listener to close modals when clicking outside
document.addEventListener('DOMContentLoaded', function() {
    const deleteModal = document.getElementById('deleteModal');
    const galleryModal = document.getElementById('galleryModal');

    deleteModal.addEventListener('click', function(e) {
        if (e.target === deleteModal) {
            closeDeleteModal();
        }
    });

    galleryModal.addEventListener('click', function(e) {
        if (e.target === galleryModal) {
            closeGalleryModal();
        }
    });
});

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

// Add image preview functionality
function setupImagePreview() {
    const imageInput = document.getElementById('imageFile');
    const previewContainer = document.getElementById('imagePreview');

    imageInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                previewContainer.innerHTML = `
                    <img src="${e.target.result}" alt="Preview" class="preview-image">
                `;
            };
            reader.readAsDataURL(file);
        }
    });
}

// Initialize image preview when document loads
document.addEventListener('DOMContentLoaded', function() {
    setupImagePreview();
}); 