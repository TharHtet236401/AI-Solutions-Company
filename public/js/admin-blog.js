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
            renderBlogs(data.result.blogs);
            totalPages = data.result.totalPages;
            updatePagination();
        }
    } catch (error) {
        console.error('Error fetching blogs:', error);
        showError('Failed to load blogs');
    }
}

function renderBlogs(blogs) {
    const blogsGrid = document.getElementById('blogsGrid');
    blogsGrid.innerHTML = blogs.map(blog => `
        <div class="blog-card">
            <div class="blog-image">
                <img src="${blog.image || '/images/placeholder.jpg'}" alt="${blog.title}">
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
    document.getElementById('modalTitle').textContent = 'Create New Blog';
    document.getElementById('blogForm').reset();
    modal.classList.add('active');
}

function closeBlogModal() {
    const modal = document.getElementById('blogModal');
    modal.classList.remove('active');
}

async function handleBlogSubmit(event) {
    event.preventDefault();
    // Handle blog submission
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

function showError(message) {
    // Implement error message display
}

function updatePagination() {
    // Implement pagination update
} 