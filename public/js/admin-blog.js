let currentPage = 1;
const limit = 8;
let totalPages = 1;
let currentSort = '-createdAt';
let currentCategory = '';
let currentSearch = '';

document.addEventListener('DOMContentLoaded', async function() {
    await fetchAndRenderBlogs();
    
    // Add event listeners for filters
    document.getElementById('searchInput').addEventListener('input', debounce(async (e) => {
        currentSearch = e.target.value;
        currentPage = 1;
        await fetchAndRenderBlogs();
    }, 300));

    document.getElementById('categoryFilter').addEventListener('change', async (e) => {
        currentCategory = e.target.value;
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
        const response = await fetch(`/api/blogs?page=${currentPage}&limit=${limit}&sort=${currentSort}&category=${currentCategory}&search=${currentSearch}`);
        const data = await response.json();
        
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
    
    // Reset form and set title
    form.reset();
    modalTitle.textContent = 'Create New Blog';
    
    // Reset image preview
    const previewContainer = document.getElementById('imagePreview');
    if (previewContainer) {
        previewContainer.innerHTML = '<div class="preview-placeholder">Image Preview</div>';
    }
    
    modal.classList.add('active');
}

function closeBlogModal() {
    const modal = document.getElementById('blogModal');
    modal.classList.remove('active');
}

async function handleBlogSubmit(event) {
    event.preventDefault();
    
    const form = event.target;
    const formData = new FormData(form);
    const submitButton = form.querySelector('button[type="submit"]');
    const originalText = submitButton.innerHTML;
    
    try {
        submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';
        submitButton.disabled = true;

        const response = await fetch('/api/blogs', {
            method: 'POST',
            body: formData
        });

        const data = await response.json();

        if (data.con) {
            window.showSuccess('Blog post created successfully');
            closeBlogModal();
            await fetchAndRenderBlogs();
        } else {
            window.showError(data.msg || 'Failed to create blog post');
        }
    } catch (error) {
        console.error('Error:', error);
        window.showError('Failed to create blog post');
    } finally {
        submitButton.innerHTML = originalText;
        submitButton.disabled = false;
    }
}

async function deleteBlog(id) {
    if (confirm('Are you sure you want to delete this blog post?')) {
        try {
            const response = await fetch(`/api/blogs/${id}`, {
                method: 'DELETE'
            });

            const data = await response.json();
            if (data.con) {
                await fetchAndRenderBlogs();
                window.showSuccess('Blog post deleted successfully');
            } else {
                window.showError(data.msg || 'Failed to delete blog post');
            }
        } catch (error) {
            console.error('Error:', error);
            window.showError('Failed to delete blog post');
        }
    }
}

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
    document.getElementById('searchInput').value = '';
    document.getElementById('categoryFilter').value = '';
    document.getElementById('sortOrder').value = '-createdAt';

    // Reset states
    currentPage = 1;
    currentSort = '-createdAt';
    currentCategory = '';
    currentSearch = '';

    // Fetch blogs with reset filters
    await fetchAndRenderBlogs();

    // Remove spinning animation
    setTimeout(() => {
        refreshBtn.classList.remove('spinning');
    }, 500);
}

async function editBlog(id) {
    try {
        const response = await fetch(`/api/blogs/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });

        const data = await response.json();
        if (data.con) {
            window.showSuccess('Blog post updated successfully');
            closeBlogModal();
            await fetchAndRenderBlogs();
        } else {
            window.showError(data.msg || 'Failed to update blog post');
        }
    } catch (error) {
        console.error('Error:', error);
        window.showError('Failed to update blog post');
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