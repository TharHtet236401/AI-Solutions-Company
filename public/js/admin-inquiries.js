let currentPage = 1;
const limit = 20;
let totalPages = 1;
let currentSort = '-createdAt';
let currentStatus = '';
let currentCountry = '';
let countrySort = '';
let currentDateFilter = '';

document.addEventListener('DOMContentLoaded', async function() {
    await fetchAndRenderInquiries();
    
    document.getElementById('prevPage').addEventListener('click', async () => {
        if (currentPage > 1) {
            currentPage--;
            await fetchAndRenderInquiries();
        }
    });

    document.getElementById('nextPage').addEventListener('click', async () => {
        if (currentPage < totalPages) {
            currentPage++;
            await fetchAndRenderInquiries();
        }
    });

    document.getElementById('sortOrder').addEventListener('change', async (e) => {
        currentSort = e.target.value;
        currentPage = 1;
        await fetchAndRenderInquiries();
    });

    document.getElementById('statusFilter').addEventListener('change', async (e) => {
        currentStatus = e.target.value;
        currentPage = 1;
        await fetchAndRenderInquiries();
    });

    document.getElementById('countryFilter').addEventListener('change', async (e) => {
        const value = e.target.value;
        if (value === 'asc' || value === 'desc') {
            countrySort = value;
            currentCountry = '';
        } else {
            currentCountry = value;
            countrySort = '';
        }
        currentPage = 1;
        await fetchAndRenderInquiries();
    });

    document.getElementById('dateFilter').addEventListener('change', async (e) => {
        currentDateFilter = e.target.value;
        currentPage = 1;
        await fetchAndRenderInquiries();
    });
});

async function fetchAndRenderInquiries() {
    try {
        let url = `/api/inquiries?page=${currentPage}&limit=${limit}&sort=${currentSort}`;
        
        if (currentStatus) {
            url += `&status=${currentStatus}`;
        }

        if (currentCountry) {
            url += `&country=${currentCountry}`;
        }
        
        if (countrySort) {
            url += `&countrySort=${countrySort}`;
        }

        if (currentDateFilter) {
            url += `&dateFilter=${currentDateFilter}`;
        }

        const response = await fetch(url);
        const data = await response.json();
        
        if (data.con && data.result && Array.isArray(data.result.inquiries)) {
            totalPages = data.result.totalPages;
            renderInquiries(data.result.inquiries);
            
            updatePagination();
            updatePageInfo(data.result.total);
            updateStatusCounts(data.result.statusCounts);
            
            updateCountryFilter(data.result.countries);
        } else {
            showError('Failed to load inquiries: Invalid data format');
            console.error('Invalid data format:', data);
        }
    } catch (error) {
        console.error('Error fetching inquiries:', error);
        showError('Error loading inquiries');
    }
}

function updatePagination() {
    const pageNumbers = document.getElementById('pageNumbers');
    const prevBtn = document.getElementById('prevPage');
    const nextBtn = document.getElementById('nextPage');
    
    prevBtn.disabled = currentPage === 1;
    nextBtn.disabled = currentPage === totalPages;
    
    let paginationHTML = '';
    
    paginationHTML += `<button class="page-number ${currentPage === 1 ? 'active' : ''}" 
        onclick="goToPage(1)">1</button>`;
    
    if (totalPages > 1) {
        if (currentPage > 3) {
            paginationHTML += '<span class="ellipsis">...</span>';
        }
        
        for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
            paginationHTML += `<button class="page-number ${currentPage === i ? 'active' : ''}" 
                onclick="goToPage(${i})">${i}</button>`;
        }
        
        if (currentPage < totalPages - 2) {
            paginationHTML += '<span class="ellipsis">...</span>';
        }
        
        if (totalPages > 1) {
            paginationHTML += `<button class="page-number ${currentPage === totalPages ? 'active' : ''}" 
                onclick="goToPage(${totalPages})">${totalPages}</button>`;
        }
    }
    
    pageNumbers.innerHTML = paginationHTML;
}

function updatePageInfo(total) {
    const existingPageInfo = document.querySelector('.page-info');
    if (existingPageInfo) {
        existingPageInfo.remove();
    }

    const start = (currentPage - 1) * limit + 1;
    const end = Math.min(currentPage * limit, total);
    
    const pageInfo = document.createElement('div');
    pageInfo.className = 'page-info';
    pageInfo.innerHTML = `Showing ${start}-${end} of ${total} inquiries`;
    
    const paginationDiv = document.querySelector('.pagination');
    paginationDiv.insertAdjacentElement('beforebegin', pageInfo);
}

async function goToPage(page) {
    currentPage = page;
    await fetchAndRenderInquiries();
}

function renderInquiries(inquiries) {
    if (window.innerWidth <= 768) {
        const container = document.querySelector('.inquiries-table-container');
        container.innerHTML = '';
        renderMobileCards(inquiries);
    } else {
        const tableBody = document.querySelector('.inquiries-table tbody');
        tableBody.innerHTML = '';
        renderTable(inquiries);
    }
}

function renderMobileCards(inquiries) {
    if (!Array.isArray(inquiries)) {
        console.error('Invalid inquiries data:', inquiries);
        return;
    }

    const container = document.querySelector('.inquiries-table-container');
    const mobileView = document.createElement('div');
    mobileView.className = 'mobile-inquiries';
    
    mobileView.innerHTML = inquiries.map(inquiry => `
        <div class="inquiry-card" onclick="viewInquiry('${inquiry._id}')">
            <div class="inquiry-card-header">
                <span class="inquiry-card-name">${inquiry.name || 'N/A'}</span>
                <span class="status-badge ${(inquiry.status || 'pending').toLowerCase()}">
                    ${inquiry.status || 'Pending'}
                </span>
            </div>
            <div class="inquiry-card-company">
                ${inquiry.companyName || 'N/A'} • ${inquiry.country || 'N/A'}
            </div>
            <div class="inquiry-card-date">
                ${formatDate(inquiry.createdAt)}
            </div>
        </div>
    `).join('');
    
    container.innerHTML = '';
    container.appendChild(mobileView);
}

function renderTable(inquiries) {
    if (!Array.isArray(inquiries)) {
        console.error('Invalid inquiries data:', inquiries);
        return;
    }

    const tableBody = document.querySelector('.inquiries-table tbody');
    if (!tableBody) {
        console.error('Table body element not found');
        return;
    }

    tableBody.innerHTML = inquiries.map(inquiry => `
        <tr>
            <td>
                <div class="inquiry-name">
                    <span class="name">${inquiry.name || 'N/A'}</span>
                    <span class="email">${inquiry.email || 'N/A'}</span>
                </div>
            </td>
            <td>
                <div class="company-info">
                    <span class="company">${inquiry.companyName || 'N/A'}</span>
                    <span class="country" data-country="${inquiry.country || ''}">
                        ${inquiry.country || 'N/A'}
                    </span>
                </div>
            </td>
            <td>
                <span class="phone">${inquiry.phoneNumber || 'N/A'}</span>
            </td>
            <td>
                <span class="status-badge ${(inquiry.status || 'pending').toLowerCase()}">
                    ${inquiry.status || 'Pending'}
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
            <div class="header-container">
                <div class="modal-header">
                    <h2>Inquiry Details</h2>
                    <button class="close-btn" onclick="closeInquiryModal(this)">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
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
                
                <div class="inquiry-section">
                    <h3><i class="fas fa-reply"></i>Reply to Inquiry</h3>
                    <div class="email-composer">
                        <div class="email-header">
                            <div class="email-field">
                                <label>To:</label>
                                <span>${inquiry.email}</span>
                            </div>
                            <div class="email-field">
                                <label>Subject:</label>
                                <input type="text" id="emailSubject" 
                                    value="Re: Inquiry from ${inquiry.companyName}" 
                                    class="email-subject-input">
                            </div>
                        </div>
                        <div class="email-body">
                            <textarea id="emailBody" 
                                placeholder="Type your response here..."
                                class="email-content"></textarea>
                        </div>
                        <div class="email-actions">
                            <button class="template-btn" onclick="loadEmailTemplate()">
                                <i class="fas fa-file-alt"></i> Load Template
                            </button>
                            <button class="send-btn" onclick="sendEmail('${inquiry._id}')">
                                <i class="fas fa-paper-plane"></i> Send Reply
                            </button>
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
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    
    const container = document.querySelector('.dashboard-content');
    container.insertBefore(errorDiv, container.firstChild);
    
    setTimeout(() => errorDiv.remove(), 3000);
}

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

async function sendEmail(inquiryId) {
    const subject = document.getElementById('emailSubject').value;
    const content = document.getElementById('emailBody').value;
    
    if (!content.trim()) {
        showError('Please enter an email message');
        return;
    }
    
    try {
        const response = await fetch(`/api/inquiries/${inquiryId}/reply`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                subject,
                content
            })
        });
        
        const data = await response.json();
        if (data.con) {
            showSuccess('Email sent successfully');
            await updateInquiryStatus(inquiryId, 'followed-up');
        } else {
            showError(data.msg || 'Failed to send email');
        }
    } catch (error) {
        console.error('Error sending email:', error);
        showError('Error sending email');
    }
}

function loadEmailTemplate() {
    const templates = {
        default: `Dear [Name],

Thank you for your inquiry about our services. We appreciate your interest in [Company Name].

We will review your requirements and get back to you with a detailed response shortly.

Best regards,
[Your Name]
AI Solutions Team`
    };
    
    const emailBody = document.getElementById('emailBody');
    emailBody.value = templates.default;
}

function showSuccess(message) {
    const successDiv = document.createElement('div');
    successDiv.className = 'success-message';
    successDiv.textContent = message;
    
    const container = document.querySelector('.dashboard-content');
    container.insertBefore(successDiv, container.firstChild);
    
    setTimeout(() => successDiv.remove(), 3000);
}

window.addEventListener('resize', () => {
    const inquiriesData = document.querySelector('.mobile-inquiries, .inquiries-table tbody');
    if (inquiriesData) {
        fetchAndRenderInquiries();
    }
});

function updateStatusCounts(statusCounts) {
    const statusFilter = document.getElementById('statusFilter');
    Array.from(statusFilter.options).forEach(option => {
        const status = option.value;
        if (status && statusCounts.hasOwnProperty(status)) {
            const count = statusCounts[status] || 0;
            option.textContent = `${status.charAt(0).toUpperCase() + status.slice(1)} (${count})`;
        }
    });
}

function updateCountryFilter(countries = []) {
    const countryFilter = document.getElementById('countryFilter');
    const currentValue = countryFilter.value;
    
    const defaultOptions = Array.from(countryFilter.options).slice(0, 3);
    countryFilter.innerHTML = '';
    
    defaultOptions.forEach(option => countryFilter.appendChild(option));
    
    if (Array.isArray(countries)) {
        countries.sort().forEach(country => {
            if (country) {
                const option = new Option(country, country);
                countryFilter.appendChild(option);
            }
        });
    }
    
    if (currentValue) {
        countryFilter.value = currentValue;
    }
}

async function resetFilters() {
    const refreshBtn = document.querySelector('.refresh-btn');
    refreshBtn.classList.add('spinning');

    document.getElementById('dateFilter').value = '';
    document.getElementById('sortOrder').value = '-createdAt';
    document.getElementById('statusFilter').value = '';
    document.getElementById('countryFilter').value = '';

    currentPage = 1;
    currentSort = '-createdAt';
    currentStatus = '';
    currentCountry = '';
    countrySort = '';
    currentDateFilter = '';

    await fetchAndRenderInquiries();

    setTimeout(() => {
        refreshBtn.classList.remove('spinning');
    }, 500);
} 