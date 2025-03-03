let currentPage = 1;
const itemsPerPage = 10;
let users = [];
let editingUserId = null;
let userToDelete = null;

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
    document.getElementById('sortOrder').addEventListener('change', handleFilters);
}

// Fetch users from the server
async function loadUsers(params = {}) {
    try {
        // Clean up the filter values
        const roleFilter = params.role || '';
        const searchTerm = params.search || '';
        
        const queryParams = new URLSearchParams({
            page: currentPage
        });
        
        // Add search parameter if provided
        if (searchTerm.trim()) {
            queryParams.append('search', searchTerm);
        }

        // Add role filter if provided
        if (roleFilter.trim()) {
            queryParams.append('role', roleFilter);
        }
        
        // Add sort parameter if provided
        if (params.sort) {
            queryParams.append('sort', params.sort);
        }

        console.log('Request URL:', `/api/users?${queryParams}`);
        console.log('Current Filters:', params);

        const response = await fetch(`/api/users?${queryParams}`, {
            headers: {
                'Content-Type': 'application/json'
            }
        });

        const data = await response.json();
        console.log('Response data:', data);

        if (data.con) {
            users = data.result.users;
            renderUsers(data.result.users);
            renderPagination(data.result.totalPages);
        } else {
            showToast('error', data.msg || 'Error loading staff list');
        }
    } catch (error) {
        console.error('Error loading staff list:', error);
        showToast('error', 'Failed to load staff list');
    }
}

// Render users table
function renderUsers(users) {
    const tbody = document.getElementById('usersTableBody');
    tbody.innerHTML = '';

    users.forEach(user => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td class="col-username">
                <div class="user-info">
                    <span>${user.username}</span>
                </div>
            </td>
            <td class="col-role"><span class="role-badge ${user.role}">${user.role}</span></td>
            <td class="col-created">${formatDate(user.createdAt)}</td>
            <td class="col-actions">
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
    document.getElementById('modalTitle').textContent = 'Add New Staff';
    document.getElementById('userForm').reset();
    document.getElementById('password').required = true;
    toggleModal(true);
}

function editUser(userId) {
    editingUserId = userId;
    const user = users.find(u => u._id === userId);
    if (!user) return;

    // Update modal title
    document.getElementById('modalTitle').textContent = 'Edit Staff';
    
    // Fill in the form fields
    document.getElementById('username').value = user.username;
    document.getElementById('role').value = user.role;
    
    // Make password fields optional for editing
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirmPassword');
    passwordInput.required = false;
    confirmPasswordInput.required = false;
    
    // Show the modal
    const modal = document.getElementById('userModal');
    modal.classList.add('show');
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
        // Validate password match if password is provided
        if (userData.password || userData.confirmPassword) {
            if (userData.password !== userData.confirmPassword) {
                showToast('error', 'Passwords do not match');
                return;
            }
        }

        // Remove confirmPassword as it's not needed in the API
        delete userData.confirmPassword;

        // Remove password if it's empty (for editing)
        if (!userData.password) {
            delete userData.password;
        }

        const url = editingUserId 
            ? `/api/users/${editingUserId}`
            : '/api/users';
        
        const method = editingUserId ? 'PUT' : 'POST';

        const response = await fetch(url, {
            method,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(userData)
        });

        const data = await response.json();

        if (data.con) {
            showToast('success', `Staff member successfully ${editingUserId ? 'updated' : 'created'}`);
            closeUserModal();
            loadUsers();
        } else {
            showToast('error', data.msg || 'Error saving staff member');
        }
    } catch (error) {
        console.error('Error saving staff member:', error);
        showToast('error', 'Failed to save staff member');
    }
}

// Delete user
function deleteUser(userId) {
    userToDelete = userId;
    const deleteModal = document.getElementById('deleteModal');
    deleteModal.classList.add('show');
}

function closeDeleteModal() {
    const deleteModal = document.getElementById('deleteModal');
    deleteModal.classList.remove('show');
    userToDelete = null;
}

async function confirmDelete() {
    if (!userToDelete) return;

    try {
        const response = await fetch(`/api/users/${userToDelete}`, {
            method: 'DELETE'
        });

        const data = await response.json();
        
        if (data.con) {
            showToast('success', 'Staff member successfully deleted');
            loadUsers();
        } else {
            showToast('error', data.msg || 'Error deleting staff member');
        }
    } catch (error) {
        console.error('Error deleting staff member:', error);
        showToast('error', 'Failed to delete staff member');
    } finally {
        closeDeleteModal();
    }
}

// Search and filter handlers
function handleSearch(event) {
    currentPage = 1; // Reset to first page when searching
    const searchTerm = event.target.value;
    loadUsers({ 
        search: searchTerm,
        role: document.getElementById('roleFilter').value,
        sort: document.getElementById('sortOrder').value
    });
}

function handleFilters() {
    currentPage = 1; // Reset to first page when filtering
    const filters = {
        role: document.getElementById('roleFilter').value,
        sort: document.getElementById('sortOrder').value,
        search: document.getElementById('searchInput').value
    };
    
    loadUsers(filters);
}

// Reset filters
function resetFilters() {
    currentPage = 1; // Reset to first page
    document.getElementById('searchInput').value = '';
    document.getElementById('roleFilter').value = '';
    document.getElementById('sortOrder').value = '-createdAt';
    loadUsers({
        search: '',
        role: '',
        sort: '-createdAt'
    });
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
    const container = document.getElementById('toastContainer');
    
    // Create toast element
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    // Add icon based on type
    const icon = type === 'success' ? 'check-circle' : 'exclamation-circle';
    
    toast.innerHTML = `
        <i class="fas fa-${icon}"></i>
        <span class="toast-message">${message}</span>
        <button class="toast-close" onclick="this.parentElement.remove()">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    // Add to container
    container.appendChild(toast);
    
    // Remove after 3 seconds
    setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s ease-out forwards';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
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

// Add event listener to close modal when clicking outside
document.addEventListener('DOMContentLoaded', () => {
    const deleteModal = document.getElementById('deleteModal');
    deleteModal.addEventListener('click', (e) => {
        if (e.target === deleteModal) {
            closeDeleteModal();
        }
    });
    // ... existing event listeners ...
});

// Password toggle function
function togglePassword(inputId) {
    const input = document.getElementById(inputId);
    const icon = input.parentElement.querySelector('.toggle-password i');
    
    if (input.type === 'password') {
        input.type = 'text';
        icon.classList.remove('fa-eye');
        icon.classList.add('fa-eye-slash');
    } else {
        input.type = 'password';
        icon.classList.remove('fa-eye-slash');
        icon.classList.add('fa-eye');
    }
} 