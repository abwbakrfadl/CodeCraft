/**
 * Utility functions for the application
 */

// Format date from ISO string to locale date
function formatDate(dateString) {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('ar-SA');
}

// Format date and time from ISO string to locale date and time
function formatDateTime(dateTimeString) {
    if (!dateTimeString) return '-';
    return new Date(dateTimeString).toLocaleString('ar-SA');
}

// Format score with 2 decimal places and Arabic numerals
function formatScore(score) {
    if (score === null || score === undefined) return '-';
    return parseFloat(score).toLocaleString('ar-SA', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// Format evaluation status with color-coded badge
function formatStatus(statusId) {
    const statusMap = {
        1: { name: 'مسودة', class: 'bg-secondary' },
        2: { name: 'تم التقديم', class: 'bg-primary' },
        3: { name: 'قيد المراجعة', class: 'bg-warning text-dark' },
        4: { name: 'مكتمل', class: 'bg-success' },
        5: { name: 'مرفوض', class: 'bg-danger' }
    };
    
    const status = statusMap[statusId] || { name: 'غير معروف', class: 'bg-secondary' };
    return `<span class="badge ${status.class} status-badge">${status.name}</span>`;
}

// Show toast notification
function showNotification(title, message, type = 'info') {
    const toast = document.getElementById('toast-notification');
    const toastTitle = document.getElementById('toast-title');
    const toastMessage = document.getElementById('toast-message');
    const toastIcon = document.getElementById('toast-icon');
    
    toastTitle.textContent = title;
    toastMessage.textContent = message;
    
    // Set icon and color based on type
    toastIcon.className = 'fas me-2';
    
    switch(type) {
        case 'success':
            toastIcon.classList.add('fa-check-circle', 'text-success');
            break;
        case 'error':
            toastIcon.classList.add('fa-times-circle', 'text-danger');
            break;
        case 'warning':
            toastIcon.classList.add('fa-exclamation-triangle', 'text-warning');
            break;
        default:
            toastIcon.classList.add('fa-info-circle', 'text-primary');
    }
    
    // Show toast
    const bsToast = new bootstrap.Toast(toast);
    bsToast.show();
}

// Export table data to CSV
function exportToCSV(data, filename) {
    // Convert data to CSV format
    let csv = [];
    
    // Add headers
    if (data.length > 0) {
        const headers = Object.keys(data[0]);
        csv.push(headers.join(','));
    }
    
    // Add rows
    data.forEach(row => {
        const values = Object.values(row).map(value => {
            if (value === null || value === undefined) return '';
            return `"${value.toString().replace(/"/g, '""')}"`;
        });
        csv.push(values.join(','));
    });
    
    // Create blob and download
    const csvContent = csv.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, filename);
}

// Create pagination controls
function createPagination(totalItems, itemsPerPage, currentPage, onPageChange) {
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    
    if (totalPages <= 1) return '';
    
    let paginationHTML = `
        <nav aria-label="Page navigation">
            <ul class="pagination justify-content-center">
                <li class="page-item ${currentPage === 1 ? 'disabled' : ''}">
                    <a class="page-link" href="#" aria-label="Previous" data-page="${currentPage - 1}">
                        <span aria-hidden="true">&laquo;</span>
                    </a>
                </li>
    `;
    
    // Generate page links
    for (let i = 1; i <= totalPages; i++) {
        paginationHTML += `
            <li class="page-item ${i === currentPage ? 'active' : ''}">
                <a class="page-link" href="#" data-page="${i}">${i}</a>
            </li>
        `;
    }
    
    paginationHTML += `
                <li class="page-item ${currentPage === totalPages ? 'disabled' : ''}">
                    <a class="page-link" href="#" aria-label="Next" data-page="${currentPage + 1}">
                        <span aria-hidden="true">&raquo;</span>
                    </a>
                </li>
            </ul>
        </nav>
    `;
    
    const paginationElement = document.createElement('div');
    paginationElement.innerHTML = paginationHTML;
    
    // Add event listeners to pagination links
    paginationElement.querySelectorAll('.page-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const page = parseInt(e.target.closest('.page-link').dataset.page);
            
            if (page >= 1 && page <= totalPages && page !== currentPage) {
                onPageChange(page);
            }
        });
    });
    
    return paginationElement;
}

// Filter data by search term
function filterDataBySearchTerm(data, term, fields) {
    if (!term || term.trim() === '') return data;
    
    term = term.toLowerCase();
    
    return data.filter(item => {
        return fields.some(field => {
            const value = item[field];
            if (value === null || value === undefined) return false;
            return value.toString().toLowerCase().includes(term);
        });
    });
}

// Validate required form fields
function validateRequiredFields(formId) {
    const form = document.getElementById(formId);
    const requiredFields = form.querySelectorAll('[required]');
    let isValid = true;
    
    requiredFields.forEach(field => {
        if (!field.value.trim()) {
            field.classList.add('is-invalid');
            isValid = false;
        } else {
            field.classList.remove('is-invalid');
        }
    });
    
    return isValid;
}

// Reset form and validation states
function resetForm(formId) {
    const form = document.getElementById(formId);
    form.reset();
    
    form.querySelectorAll('.is-invalid').forEach(field => {
        field.classList.remove('is-invalid');
    });
}

// Create confirmation modal
function createConfirmationModal(title, message, confirmCallback, cancelCallback = null) {
    // Create modal elements
    const modalId = 'confirmationModal';
    const modalElement = document.createElement('div');
    modalElement.className = 'modal fade';
    modalElement.id = modalId;
    modalElement.tabIndex = -1;
    modalElement.setAttribute('aria-labelledby', `${modalId}Label`);
    modalElement.setAttribute('aria-hidden', 'true');
    
    modalElement.innerHTML = `
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="${modalId}Label">${title}</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="إغلاق"></button>
                </div>
                <div class="modal-body">
                    ${message}
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">إلغاء</button>
                    <button type="button" class="btn btn-danger" id="${modalId}ConfirmBtn">تأكيد</button>
                </div>
            </div>
        </div>
    `;
    
    // Add modal to the document
    document.body.appendChild(modalElement);
    
    // Create Bootstrap modal instance
    const modal = new bootstrap.Modal(modalElement);
    
    // Add event listeners
    const confirmBtn = document.getElementById(`${modalId}ConfirmBtn`);
    confirmBtn.addEventListener('click', () => {
        confirmCallback();
        modal.hide();
    });
    
    modalElement.addEventListener('hidden.bs.modal', () => {
        if (cancelCallback) cancelCallback();
        document.body.removeChild(modalElement);
    });
    
    // Show the modal
    modal.show();
}
