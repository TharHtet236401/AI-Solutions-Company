document.addEventListener('DOMContentLoaded', async function() {
    // Fetch inquiries when the page loads
    try {
        const response = await fetch('/api/inquiries');
        const data = await response.json();
        
        if (data.con) {
            renderInquiries(data.result);
        } else {
            showError('Failed to load inquiries');
        }
    } catch (error) {
        console.error('Error fetching inquiries:', error);
        showError('Error loading inquiries');
    }
});

function renderInquiries(inquiries) {
    const tableBody = document.querySelector('.inquiries-table tbody');
    if (!tableBody) return;

    tableBody.innerHTML = inquiries.map(inquiry => `
        <tr>
            <td>
                <div class="inquiry-name">
                    <span class="name">${inquiry.name}</span>
                    <span class="email">${inquiry.email}</span>
                </div>
            </td>
            <td>
                <div class="company-info">
                    <span class="company">${inquiry.companyName}</span>
                    <span class="country">${inquiry.country}</span>
                </div>
            </td>
            <td>
                <span class="phone">${inquiry.phoneNumber}</span>
            </td>
            <td>
                <span class="status-badge ${inquiry.status.toLowerCase()}">
                    ${inquiry.status}
                </span>
            </td>
            <td>
                <div class="date-info">
                    <span class="date">${formatDate(inquiry.createdAt)}</span>
                    <span class="time">${formatTime(inquiry.createdAt)}</span>
                </div>
            </td>
            <td>
                <div class="action-buttons">
                    <button class="view-btn" onclick="viewInquiry('${inquiry._id}')">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="edit-btn" onclick="openStatusModal('${inquiry._id}')">
                        <i class="fas fa-edit"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

async function viewInquiry(id) {
    try {
        const response = await fetch(`/api/inquiries/${id}`);
        const data = await response.json();
        
        if (data.con) {
            const inquiry = data.result;
            showInquiryModal(inquiry);
        } else {
            showError('Failed to load inquiry details');
        }
    } catch (error) {
        console.error('Error loading inquiry details:', error);
        showError('Error loading inquiry details');
    }
}

function showInquiryModal(inquiry) {
    const modal = document.createElement('div');
    modal.className = 'modal inquiry-modal active';
    
    modal.innerHTML = `
        <div class="modal-content inquiry-detail">
            <div class="modal-header">
                <h2>Inquiry Details</h2>
                <button class="close-btn" onclick="closeInquiryModal(this)">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="inquiry-content">
                <div class="inquiry-section">
                    <h3><i class="fas fa-user"></i>Contact Information</h3>
                    <div class="info-grid">
                        <div class="info-item">
                            <label>Full Name</label>
                            <span>${inquiry.name}</span>
                        </div>
                        <div class="info-item">
                            <label>Email Address</label>
                            <span>${inquiry.email}</span>
                        </div>
                        <div class="info-item">
                            <label>Phone Number</label>
                            <span>${inquiry.phoneNumber}</span>
                        </div>
                    </div>
                </div>
                
                <div class="inquiry-section">
                    <h3><i class="fas fa-building"></i>Company Details</h3>
                    <div class="info-grid">
                        <div class="info-item">
                            <label>Company Name</label>
                            <span>${inquiry.companyName}</span>
                        </div>
                        <div class="info-item">
                            <label>Location</label>
                            <span>${inquiry.country}</span>
                        </div>
                        <div class="info-item">
                            <label>Position</label>
                            <span>${inquiry.jobTitle}</span>
                        </div>
                    </div>
                </div>
                
                <div class="inquiry-section">
                    <h3><i class="fas fa-briefcase"></i>Job Details</h3>
                    <div class="job-details">
                        <p>${inquiry.jobDetails}</p>
                    </div>
                </div>
                
                <div class="inquiry-section">
                    <h3><i class="fas fa-info-circle"></i>Status Information</h3>
                    <div class="info-grid">
                        <div class="info-item">
                            <label>Current Status</label>
                            <span class="status-badge ${inquiry.status.toLowerCase()}">
                                ${inquiry.status}
                            </span>
                        </div>
                        <div class="info-item">
                            <label>Submission Date</label>
                            <span>${formatDate(inquiry.createdAt)} at ${formatTime(inquiry.createdAt)}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

function closeInquiryModal(button) {
    const modal = button.closest('.modal');
    modal.classList.remove('active');
    setTimeout(() => modal.remove(), 300);
}

function openStatusModal(id) {
    const modal = document.getElementById('statusModal');
    modal.dataset.inquiryId = id;
    modal.style.display = 'flex';
}

function closeModal() {
    const modal = document.getElementById('statusModal');
    modal.style.display = 'none';
}

async function updateStatus() {
    const modal = document.getElementById('statusModal');
    const inquiryId = modal.dataset.inquiryId;
    const newStatus = document.getElementById('statusUpdate').value;

    try {
        const response = await fetch(`/api/inquiries/${inquiryId}/status`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ status: newStatus })
        });

        const data = await response.json();
        if (data.con) {
            // Refresh the inquiries list
            location.reload();
        } else {
            showError('Failed to update status');
        }
    } catch (error) {
        console.error('Error updating status:', error);
        showError('Error updating status');
    } finally {
        closeModal();
    }
}

function showError(message) {
    // Create and show error message to user
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    
    const container = document.querySelector('.dashboard-content');
    container.insertBefore(errorDiv, container.firstChild);
    
    // Remove after 3 seconds
    setTimeout(() => errorDiv.remove(), 3000);
}

// Add these helper functions for date formatting
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

function formatTime(dateString) {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
    });
} 