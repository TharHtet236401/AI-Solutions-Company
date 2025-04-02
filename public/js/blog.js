document.addEventListener('DOMContentLoaded', async function() {
    // Get current page from URL or default to 1
    const urlParams = new URLSearchParams(window.location.search);
    const currentPage = parseInt(urlParams.get('page')) || 1;
    
    try {
        const response = await fetch(`/api/blogs/?page=${currentPage}`);
        const data = await response.json();
        
        if (data.con) {
            const { blogs, currentPage, totalPages } = data.result;
            
            // Update blog grid
            const blogGrid = document.querySelector('.blog-grid');
            if (blogs.length === 0) {
                blogGrid.innerHTML = `
                    <div class="no-blogs-message">
                        <h3>No blogs available at the moment.</h3>
                        <p>Check back soon for new content!</p>
                    </div>`;
                return;
            }

            // Set featured blog (latest blog)
            const featuredBlog = blogs[0];
            updateFeaturedBlog(featuredBlog);

            // Update regular blog cards (skip the featured one)
            const blogCards = blogs.slice(1).map(blog => createBlogCard(blog)).join('');
            blogGrid.innerHTML = blogCards;

            // Update pagination
            updatePagination(currentPage, totalPages);
        }
    } catch (error) {
        console.error('Error fetching blogs:', error);
    }
});

function createBlogCard(blog) {
    return `
        <article class="blog-card">
            <div class="blog-image">
                <img src="${blog.photo}" alt="${blog.title}">
            </div>
            <div class="blog-content">
                <div class="blog-meta">
                    <span class="blog-date">
                        <i class="far fa-calendar"></i>
                        ${new Date(blog.createdAt).toLocaleDateString()}
                    </span>
                </div>
                <h3 class="blog-title">${blog.title}</h3>
                <p class="blog-excerpt">${blog.content.substring(0, 150)}...</p>
                <a href="/blog/${blog._id}" class="read-more">
                    Continue Reading <i class="fas fa-arrow-right"></i>
                </a>
            </div>
        </article>
    `;
}

function updateFeaturedBlog(blog) {
    const featuredBlog = document.querySelector('.featured-blog');
    featuredBlog.innerHTML = `
        <div class="featured-image">
            <img src="${blog.photo}" alt="${blog.title}">
            <span class="featured-tag">Featured</span>
        </div>
        <div class="blog-content">
            <div class="blog-meta">
                <span class="blog-date">
                    <i class="far fa-calendar"></i>
                    ${new Date(blog.createdAt).toLocaleDateString()}
                </span>
                <span class="blog-category">
                    <i class="fas fa-tag"></i>
                    ${blog.category}
                </span>
            </div>
            <h2 class="blog-title">${blog.title}</h2>
            <p class="blog-excerpt">${blog.content.substring(0, 200)}...</p>
            <a href="/blog/${blog._id}" class="read-more">
                Read Article <i class="fas fa-arrow-right"></i>
            </a>
        </div>
    `;
}

// Update pagination with active state and event listeners
function updatePagination(currentPage, totalPages) {
    const pagination = document.querySelector('.pagination');
    if (!pagination || totalPages <= 1) return;

    let paginationHTML = '';

    // Previous button
    if (currentPage > 1) {
        paginationHTML += `
            <a href="?page=${currentPage - 1}" class="page-link">
                <i class="fas fa-chevron-left"></i> Previous
            </a>
        `;
    }

    // Page numbers
    for (let i = 1; i <= totalPages; i++) {
        // Show first page, last page, current page, and pages around current page
        if (
            i === 1 || 
            i === totalPages || 
            (i >= currentPage - 2 && i <= currentPage + 2)
        ) {
            paginationHTML += `
                <a href="?page=${i}" 
                   class="page-link ${i === currentPage ? 'active' : ''}"
                   ${i === currentPage ? 'aria-current="page"' : ''}>
                    ${i}
                </a>
            `;
        } else if (
            i === currentPage - 3 || 
            i === currentPage + 3
        ) {
            paginationHTML += '<span class="page-link">...</span>';
        }
    }

    // Next button
    if (currentPage < totalPages) {
        paginationHTML += `
            <a href="?page=${currentPage + 1}" class="page-link">
                Next <i class="fas fa-chevron-right"></i>
            </a>
        `;
    }

    pagination.innerHTML = paginationHTML;

    // Add click event listeners to prevent default and handle via AJAX
    pagination.querySelectorAll('a.page-link').forEach(link => {
        link.addEventListener('click', async (e) => {
            e.preventDefault();
            const page = new URLSearchParams(new URL(link.href).search).get('page');
            // Update URL without reload
            window.history.pushState({}, '', `?page=${page}`);
            // Fetch new page
            const response = await fetch(`/api/blogs/?page=${page}`);
            const data = await response.json();
            if (data.con) {
                const { blogs, currentPage, totalPages } = data.result;
                // Update blog grid
                const blogCards = blogs.slice(1).map(blog => createBlogCard(blog)).join('');
                document.querySelector('.blog-grid').innerHTML = blogCards;
                // Update pagination
                updatePagination(currentPage, totalPages);
                // Scroll to top smoothly
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        });
    });
} 