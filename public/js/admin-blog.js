let currentPage = 1;
const limit = 8;
let totalPages = 1;
let currentSort = '-createdAt';
let currentCategory = '';
let blogToDelete = null;

document.addEventListener('DOMContentLoaded', async function() {
    await fetchAndRenderBlogs();
    
    // Add event listeners for filters
    document.getElementById('categoryFilter').addEventListener('change', async (e) => {
        currentCategory = e.target.value;
        console.log('Category changed to:', currentCategory);
        currentPage = 1;
        await fetchAndRenderBlogs();
    });

    document.getElementById('sortOrder').addEventListener('change', async (e) => {
        currentSort = e.target.value;
        currentPage = 1;
        await fetchAndRenderBlogs();
    });

    // Pagination event listeners
    document.getElementById('prevPage').addEventListener('click', async () => {
        if (currentPage > 1) {
            currentPage--;
            await fetchAndRenderBlogs();
        }
    });

    document.getElementById('nextPage').addEventListener('click', async () => {
        if (currentPage < totalPages) {
            currentPage++;
            await fetchAndRenderBlogs();
        }
    });
});

async function fetchAndRenderBlogs() {
    try {
        console.log('Fetching blogs with filters:', {
            page: currentPage,
            limit,
            sort: currentSort,
            category: currentCategory
        });
        const response = await fetch(`/api/blogs?page=${currentPage}&limit=${limit}&sort=${currentSort}&category=${currentCategory}`);
        const data = await response.json();
        console.log('Response:', data);
        
        if (data.con) {
            const { items: blogs, currentPage: page, totalPages: pages } = data.result;
            renderBlogs(blogs);
            totalPages = pages;
            currentPage = page;
            updatePagination();
        } else {
            window.showError(data.msg || 'Failed to load blogs');
        }
    } catch (error) {
        console.error('Error fetching blogs:', error);
        window.showError('Failed to load blogs');
    }
}

function renderBlogs(blogs) {
    const blogsGrid = document.getElementById('blogsGrid');
    blogsGrid.innerHTML = blogs.map(blog => `
        <div class="blog-card">
            <div class="blog-image">
                <img src="${blog.photo || '/images/placeholder.jpg'}" alt="${blog.title}">
            </div>
            <div class="blog-content">
                <span class="blog-category">${blog.category}</span>
                <h3 class="blog-title">${blog.title}</h3>
                <div class="blog-meta">
                    <span>${formatDate(blog.createdAt)}</span>
                    <span>${blog.author?.username || 'Anonymous'}</span>
                </div>
                <div class="blog-actions">
                    <button class="blog-action-btn edit-btn" onclick="editBlog('${blog._id}')">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="blog-action-btn delete-btn" onclick="deleteBlog('${blog._id}')">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

// Add other necessary functions for blog management
function openCreateBlogModal() {
    const modal = document.getElementById('blogModal');
    const form = document.getElementById('blogForm');
    const modalTitle = document.getElementById('modalTitle');
    
    form.reset();
    form.dataset.mode = 'create';
    delete form.dataset.blogId;
    modalTitle.textContent = 'Create New Blog';
    
    const previewContainer = document.getElementById('imagePreview');
    previewContainer.innerHTML = '<div class="preview-placeholder">Image Preview</div>';
    
    document.getElementById('blogImage').setAttribute('required', 'required');
    
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeBlogModal() {
    const modal = document.getElementById('blogModal');
    const form = document.getElementById('blogForm');
    
    form.reset();
    form.dataset.mode = 'create';
    delete form.dataset.blogId;
    
    modal.classList.remove('active');
    document.body.style.overflow = '';
}

async function handleBlogSubmit(event) {
    event.preventDefault();
    
    const form = event.target;
    const isEdit = form.dataset.mode === 'edit';
    const blogId = form.dataset.blogId;
    
    const formData = new FormData(form);
    
    try {
        const url = isEdit ? `/api/blogs/${blogId}` : '/api/blogs';
        const method = isEdit ? 'PUT' : 'POST';
        
        const response = await fetch(url, {
            method: method,
            body: formData
        });
        
        const data = await response.json();
        
        if (data.con) {
            showSuccess(`Blog ${isEdit ? 'updated' : 'created'} successfully`);
            closeBlogModal();
            await fetchAndRenderBlogs();
        } else {
            showError(data.msg || `Failed to ${isEdit ? 'update' : 'create'} blog`);
        }
    } catch (error) {
        console.error('Error:', error);
        showError(`Failed to ${isEdit ? 'update' : 'create'} blog`);
    }
}

function deleteBlog(id) {
    blogToDelete = id;
    const deleteModal = document.getElementById('deleteModal');
    deleteModal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeDeleteModal() {
    const deleteModal = document.getElementById('deleteModal');
    deleteModal.classList.remove('active');
    document.body.style.overflow = '';
    blogToDelete = null;
}

async function confirmDelete() {
    if (!blogToDelete) return;
    
    try {
        const response = await fetch(`/api/blogs/${blogToDelete}`, {
            method: 'DELETE'
        });

        const data = await response.json();
        if (data.con) {
            showSuccess('Blog post deleted successfully');
            await fetchAndRenderBlogs();
        } else {
            showError(data.msg || 'Failed to delete blog post');
        }
    } catch (error) {
        console.error('Error:', error);
        showError('Failed to delete blog post');
    } finally {
        closeDeleteModal();
    }
}

// Add event listener to close modal when clicking outside
document.addEventListener('DOMContentLoaded', function() {
    const deleteModal = document.getElementById('deleteModal');
    deleteModal.addEventListener('click', function(e) {
        if (e.target === deleteModal) {
            closeDeleteModal();
        }
    });
});

function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

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

// Add this function to handle page changes
async function changePage(page) {
    if (page < 1 || page > totalPages || page === currentPage) return;
    currentPage = page;
    await fetchAndRenderBlogs();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

async function resetFilters() {
    const refreshBtn = document.querySelector('.refresh-btn');
    refreshBtn.classList.add('spinning');

    // Reset all filters
    document.getElementById('categoryFilter').value = '';
    document.getElementById('sortOrder').value = '-createdAt';

    // Reset states
    currentPage = 1;
    currentSort = '-createdAt';
    currentCategory = '';

    // Fetch blogs with reset filters
    await fetchAndRenderBlogs();

    // Remove spinning animation
    setTimeout(() => {
        refreshBtn.classList.remove('spinning');
    }, 500);
}

async function editBlog(blogId) {
    try {
        const response = await fetch(`/api/blogs/${blogId}`);
        const data = await response.json();
        
        if (data.con) {
            const blog = data.result;
            const modal = document.getElementById('blogModal');
            const form = document.getElementById('blogForm');
            const modalTitle = document.getElementById('modalTitle');
            
            modalTitle.textContent = 'Edit Blog';
            form.elements['title'].value = blog.title;
            form.elements['category'].value = blog.category;
            form.elements['content'].value = blog.content;
            
            const previewContainer = document.getElementById('imagePreview');
            previewContainer.innerHTML = `
                <img src="${blog.photo}" alt="Current image" class="preview-image">
                <p class="preview-note">Upload new image to change</p>
            `;
            
            form.dataset.mode = 'edit';
            form.dataset.blogId = blogId;
            document.getElementById('blogImage').removeAttribute('required');
            
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    } catch (error) {
        console.error('Error:', error);
        showError('Failed to fetch blog details');
    }
}

// Add image preview functionality
function setupImagePreview() {
    const imageInput = document.getElementById('blogImage');
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