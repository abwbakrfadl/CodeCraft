/**
 * Utility Functions
 * Provides common utility functions used throughout the application
 */

// Format date to locale string
function formatDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('ar-SA');
}

// Format date and time to locale string
function formatDateTime(dateTimeString) {
    if (!dateTimeString) return '';
    const date = new Date(dateTimeString);
    return date.toLocaleDateString('ar-SA') + ' ' + date.toLocaleTimeString('ar-SA');
}

// Format score with color coding based on value
function formatScore(score) {
    if (score === null || score === undefined) return '-';
    
    const numScore = parseFloat(score);
    let scoreClass = '';
    
    if (numScore >= 9) {
        scoreClass = 'score-excellent';
    } else if (numScore >= 7) {
        scoreClass = 'score-good';
    } else if (numScore >= 5) {
        scoreClass = 'score-average';
    } else {
        scoreClass = 'score-poor';
    }
    
    return `<span class="${scoreClass}">${numScore.toFixed(1)}</span>`;
}

// Format evaluation status with badge
function formatStatus(statusId) {
    const status = getEvaluationStatusById(statusId);
    if (!status) return '';
    
    let badgeClass = '';
    
    switch (status.StatusName) {
        case 'Draft':
            badgeClass = 'bg-secondary';
            break;
        case 'Submitted':
            badgeClass = 'bg-primary';
            break;
        case 'In Review':
            badgeClass = 'bg-warning';
            break;
        case 'Completed':
            badgeClass = 'bg-success';
            break;
        case 'Rejected':
            badgeClass = 'bg-danger';
            break;
        default:
            badgeClass = 'bg-secondary';
    }
    
    return `<span class="badge ${badgeClass}">${status.StatusName}</span>`;
}

// Show notification toast
function showNotification(title, message, type = 'info') {
    const toast = document.getElementById('toast-notification');
    const toastTitle = document.getElementById('toast-title');
    const toastMessage = document.getElementById('toast-message');
    const toastIcon = document.getElementById('toast-icon');
    
    // Set title and message
    toastTitle.textContent = title;
    toastMessage.textContent = message;
    
    // Set icon and color based on type
    switch (type) {
        case 'success':
            toastIcon.className = 'fas fa-check-circle me-2 text-success';
            break;
        case 'error':
            toastIcon.className = 'fas fa-exclamation-circle me-2 text-danger';
            break;
        case 'warning':
            toastIcon.className = 'fas fa-exclamation-triangle me-2 text-warning';
            break;
        case 'info':
        default:
            toastIcon.className = 'fas fa-info-circle me-2 text-primary';
            break;
    }
    
    // Show toast
    const bsToast = new bootstrap.Toast(toast);
    bsToast.show();
}

// Download data as CSV file
function exportToCSV(data, filename) {
    if (!data || !data.length) {
        showNotification('تصدير البيانات', 'لا توجد بيانات للتصدير', 'warning');
        return;
    }
    
    // Get headers from first object
    const headers = Object.keys(data[0]);
    
    // Create CSV content
    let csvContent = headers.join(',') + '\n';
    
    data.forEach(item => {
        const row = headers.map(header => {
            // Handle special characters and ensure strings are quoted
            const cellValue = item[header] !== null && item[header] !== undefined ? item[header].toString() : '';
            return `"${cellValue.replace(/"/g, '""')}"`;
        });
        
        csvContent += row.join(',') + '\n';
    });
    
    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, filename);
    
    showNotification('تصدير البيانات', 'تم تصدير البيانات بنجاح', 'success');
}

// Create pagination controls
function createPagination(totalItems, itemsPerPage, currentPage, onPageChange) {
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    
    if (totalPages <= 1) return '';
    
    let html = `
    <nav aria-label="Page navigation">
        <ul class="pagination justify-content-center">
    `;
    
    // Previous button
    html += `
        <li class="page-item ${currentPage === 1 ? 'disabled' : ''}">
            <a class="page-link" href="#" data-page="${currentPage - 1}" aria-label="Previous">
                <span aria-hidden="true">&laquo;</span>
            </a>
        </li>
    `;
    
    // Page numbers
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage + 1 < maxVisiblePages) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
        html += `
            <li class="page-item ${i === currentPage ? 'active' : ''}">
                <a class="page-link" href="#" data-page="${i}">${i}</a>
            </li>
        `;
    }
    
    // Next button
    html += `
        <li class="page-item ${currentPage === totalPages ? 'disabled' : ''}">
            <a class="page-link" href="#" data-page="${currentPage + 1}" aria-label="Next">
                <span aria-hidden="true">&raquo;</span>
            </a>
        </li>
    `;
    
    html += `
        </ul>
    </nav>
    `;
    
    // Create element and attach event listeners
    const template = document.createElement('template');
    template.innerHTML = html.trim();
    const paginationElement = template.content.firstChild;
    
    const pageLinks = paginationElement.querySelectorAll('.page-link');
    pageLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const page = parseInt(link.dataset.page);
            if (page >= 1 && page <= totalPages) {
                onPageChange(page);
            }
        });
    });
    
    return paginationElement;
}

// Filter data by search term
function filterDataBySearchTerm(data, term, fields) {
    if (!term) return data;
    
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

// Reset form fields
function resetForm(formId) {
    const form = document.getElementById(formId);
    form.reset();
    
    // Remove validation classes
    form.querySelectorAll('.is-invalid').forEach(field => {
        field.classList.remove('is-invalid');
    });
}

// Create confirmation modal
function createConfirmationModal(title, message, confirmCallback, cancelCallback = null) {
    // Check if modal already exists and remove it
    const existingModal = document.getElementById('confirmationModal');
    if (existingModal) {
        existingModal.remove();
    }
    
    // Create modal element
    const modalHtml = `
        <div class="modal fade" id="confirmationModal" tabindex="-1" aria-labelledby="confirmationModalLabel" aria-hidden="true">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="confirmationModalLabel">${title}</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="إغلاق"></button>
                    </div>
                    <div class="modal-body">
                        ${message}
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">إلغاء</button>
                        <button type="button" class="btn btn-primary" id="confirmBtn">تأكيد</button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Append modal to body
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    
    // Get modal element and initialize Bootstrap modal
    const modalElement = document.getElementById('confirmationModal');
    const modal = new bootstrap.Modal(modalElement);
    
    // Set up event listeners
    document.getElementById('confirmBtn').addEventListener('click', () => {
        modal.hide();
        if (confirmCallback) confirmCallback();
    });
    
    if (cancelCallback) {
        modalElement.addEventListener('hidden.bs.modal', cancelCallback);
    }
    
    // Show modal
    modal.show();
}
