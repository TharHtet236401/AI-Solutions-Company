let currentPage = 1;
const itemsPerPage = 10;
let users = [];
let editingUserId = null;

// Initialize the page
document.addEventListener('DOMContentLoaded', () => {
    loadUsers();
    setupEventListeners();
});

function setupEventListeners() {
    // Search input
    document.getElementById('searchInput').addEventListener('input', debounce(handleSearch, 300));
    
    // Filters
    document.getElementById('roleFilter').addEventListener('change', handleFilters);
    document.getElementById('statusFilter').addEventListener('change', handleFilters);
    document.getElementById('sortOrder').addEventListener('change', handleFilters);
}

// Fetch users from the server
async function loadUsers(params = {}) {
    try {
        const queryParams = new URLSearchParams({
            page: currentPage,
            ...params
        });
        
        const response = await fetch(`/api/users?${queryParams}`);
        const data = await response.json();

        if (data.con) {
            users = data.result.users;
            renderUsers(data.result.users);
            renderPagination(data.result.totalPages);
        } else {
            showToast('error', data.msg || 'Error loading users');
        }
    } catch (error) {
        console.error('Error loading users:', error);
        showToast('error', 'Failed to load users');
    }
}

// Render users table
function renderUsers(users) {
    const tbody = document.getElementById('usersTableBody');
    tbody.innerHTML = '';

    users.forEach(user => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>
                <div class="user-info">
                    <span>${user.username}</span>
                </div>
            </td>
            <td><span class="role-badge ${user.role}">${user.role}</span></td>
            <td>${formatDate(user.createdAt)}</td>
            <td>
                <div class="action-buttons">
                    <button class="action-btn edit-btn" onclick="editUser('${user._id}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="action-btn delete-btn" onclick="deleteUser('${user._id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// Render pagination
function renderPagination(totalPages) {
    const pagination = document.getElementById('usersPagination');
    pagination.innerHTML = '';

    // Previous button
    const prevBtn = document.createElement('button');
    prevBtn.className = `pagination-btn ${currentPage === 1 ? 'disabled' : ''}`;
    prevBtn.innerHTML = '<i class="fas fa-chevron-left"></i>';
    prevBtn.onclick = () => currentPage > 1 && changePage(currentPage - 1);
    pagination.appendChild(prevBtn);

    // Page numbers
    for (let i = 1; i <= totalPages; i++) {
        const pageBtn = document.createElement('button');
        pageBtn.className = `pagination-btn ${currentPage === i ? 'active' : ''}`;
        pageBtn.textContent = i;
        pageBtn.onclick = () => changePage(i);
        pagination.appendChild(pageBtn);
    }

    // Next button
    const nextBtn = document.createElement('button');
    nextBtn.className = `pagination-btn ${currentPage === totalPages ? 'disabled' : ''}`;
    nextBtn.innerHTML = '<i class="fas fa-chevron-right"></i>';
    nextBtn.onclick = () => currentPage < totalPages && changePage(currentPage + 1);
    pagination.appendChild(nextBtn);
}

// Handle page change
function changePage(page) {
    currentPage = page;
    loadUsers();
}

// Modal functions
function openCreateUserModal() {
    editingUserId = null;
    document.getElementById('modalTitle').textContent = 'Add New User';
    document.getElementById('userForm').reset();
    document.getElementById('password').required = true;
    toggleModal(true);
}

function editUser(userId) {
    editingUserId = userId;
    const user = users.find(u => u._id === userId);
    if (!user) return;

    document.getElementById('modalTitle').textContent = 'Edit User';
    document.getElementById('username').value = user.username;
    document.getElementById('email').value = user.email;
    document.getElementById('role').value = user.role;
    document.getElementById('status').value = user.status;
    document.getElementById('password').required = false;
    
    toggleModal(true);
}

function closeUserModal() {
    toggleModal(false);
    editingUserId = null;
    document.getElementById('userForm').reset();
}

function toggleModal(show) {
    const modal = document.getElementById('userModal');
    modal.classList.toggle('show', show);
}

// Form submission
async function handleUserSubmit(event) {
    event.preventDefault();
    const form = event.target;
    const formData = new FormData(form);
    const userData = Object.fromEntries(formData.entries());

    try {
        const url = editingUserId 
            ? `/api/admin/users/${editingUserId}`
            : '/api/admin/users';
            
        const method = editingUserId ? 'PUT' : 'POST';

        // Remove empty password for edit
        if (editingUserId && !userData.password) {
            delete userData.password;
        }

        const response = await fetch(url, {
            method,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(userData)
        });

        const data = await response.json();

        if (response.ok) {
            showToast('success', `User successfully ${editingUserId ? 'updated' : 'created'}`);
            closeUserModal();
            loadUsers();
        } else {
            showToast('error', data.message || 'Error saving user');
        }
    } catch (error) {
        console.error('Error saving user:', error);
        showToast('error', 'Failed to save user');
    }
}

// Delete user
async function deleteUser(userId) {
    if (!confirm('Are you sure you want to delete this user?')) return;

    try {
        const response = await fetch(`/api/admin/users/${userId}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            showToast('success', 'User successfully deleted');
            loadUsers();
        } else {
            const data = await response.json();
            showToast('error', data.message || 'Error deleting user');
        }
    } catch (error) {
        console.error('Error deleting user:', error);
        showToast('error', 'Failed to delete user');
    }
}

// Search and filter handlers
function handleSearch(event) {
    const searchTerm = event.target.value;
    loadUsers({ search: searchTerm });
}

function handleFilters() {
    const filters = {
        role: document.getElementById('roleFilter').value,
        status: document.getElementById('statusFilter').value,
        sort: document.getElementById('sortOrder').value
    };
    loadUsers(filters);
}

// Reset filters
function resetFilters() {
    document.getElementById('searchInput').value = '';
    document.getElementById('roleFilter').value = '';
    document.getElementById('statusFilter').value = '';
    document.getElementById('sortOrder').value = '-createdAt';
    loadUsers();
}

// Utility functions
function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

function showToast(type, message) {
    // Implement your toast notification system here
    console.log(`${type}: ${message}`);
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