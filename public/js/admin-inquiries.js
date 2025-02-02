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

function viewInquiry(id) {
    window.location.href = `/admin/inquiry/${id}`;
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