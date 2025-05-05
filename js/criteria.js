/**
 * Criteria Module
 * Handles evaluation criteria management
 */

let currentCriteriaId = null;

// Initialize criteria page
function initCriteria() {
    loadCriteriaTable();
    setupCriteriaForm();
    setupCriteriaSearch();
}

// Load criteria table with data
function loadCriteriaTable() {
    const criteria = getAllEvaluationCriteria();
    const tableBody = document.getElementById('criteria-table-body');
    tableBody.innerHTML = '';
    
    if (criteria.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="6" class="text-center">لا توجد معايير تقييم مسجلة</td>
            </tr>
        `;
        return;
    }
    
    criteria.forEach(criterion => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${criterion.CriteriaName}</td>
            <td>${criterion.Description || '-'}</td>
            <td>${criterion.Weight}</td>
            <td>${criterion.MaxScore}</td>
            <td>${criterion.IsActive === 1 ? '<span class="badge bg-success">نشط</span>' : '<span class="badge bg-danger">غير نشط</span>'}</td>
            <td class="action-column">
                <button class="btn btn-sm btn-info btn-action edit-btn" data-id="${criterion.CriteriaID}" title="تعديل">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-danger btn-action delete-btn" data-id="${criterion.CriteriaID}" title="حذف">
                    <i class="fas fa-trash-alt"></i>
                </button>
            </td>
        `;
        
        tableBody.appendChild(row);
    });
    
    // Add event listeners to buttons
    addCriteriaTableEventListeners();
}

// Add event listeners to criteria table buttons
function addCriteriaTableEventListeners() {
    // Edit criteria buttons
    document.querySelectorAll('.edit-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            const criteriaId = parseInt(e.currentTarget.dataset.id);
            editCriteria(criteriaId);
        });
    });
    
    // Delete criteria buttons
    document.querySelectorAll('.delete-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            const criteriaId = parseInt(e.currentTarget.dataset.id);
            confirmDeleteCriteria(criteriaId);
        });
    });
}

// Setup criteria form
function setupCriteriaForm() {
    const form = document.getElementById('criteria-form');
    
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        if (!validateRequiredFields('criteria-form')) {
            showNotification('خطأ', 'يرجى ملء جميع الحقول المطلوبة', 'error');
            return;
        }
        
        saveCriteria();
    });
    
    // Cancel button
    document.getElementById('cancel-btn').addEventListener('click', () => {
        resetCriteriaForm();
    });
}

// Setup criteria search
function setupCriteriaSearch() {
    const searchInput = document.getElementById('criteria-search');
    const statusFilter = document.getElementById('status-filter');
    
    searchInput.addEventListener('keyup', filterCriteria);
    statusFilter.addEventListener('change', filterCriteria);
}

// Filter criteria based on search and status filter
function filterCriteria() {
    const searchTerm = document.getElementById('criteria-search').value.trim();
    const statusFilter = document.getElementById('status-filter').value;
    
    let criteria = getAllEvaluationCriteria();
    
    // Filter by status if selected
    if (statusFilter !== '') {
        const isActive = parseInt(statusFilter) === 1;
        criteria = criteria.filter(c => c.IsActive === (isActive ? 1 : 0));
    }
    
    // Filter by search term if provided
    if (searchTerm) {
        criteria = filterDataBySearchTerm(
            criteria, 
            searchTerm, 
            ['CriteriaName', 'Description']
        );
    }
    
    renderFilteredCriteria(criteria);
}

// Render filtered criteria
function renderFilteredCriteria(criteria) {
    const tableBody = document.getElementById('criteria-table-body');
    tableBody.innerHTML = '';
    
    if (criteria.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="6" class="text-center">لا توجد نتائج مطابقة للبحث</td>
            </tr>
        `;
        return;
    }
    
    criteria.forEach(criterion => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${criterion.CriteriaName}</td>
            <td>${criterion.Description || '-'}</td>
            <td>${criterion.Weight}</td>
            <td>${criterion.MaxScore}</td>
            <td>${criterion.IsActive === 1 ? '<span class="badge bg-success">نشط</span>' : '<span class="badge bg-danger">غير نشط</span>'}</td>
            <td class="action-column">
                <button class="btn btn-sm btn-info btn-action edit-btn" data-id="${criterion.CriteriaID}" title="تعديل">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-danger btn-action delete-btn" data-id="${criterion.CriteriaID}" title="حذف">
                    <i class="fas fa-trash-alt"></i>
                </button>
            </td>
        `;
        
        tableBody.appendChild(row);
    });
    
    // Add event listeners to buttons
    addCriteriaTableEventListeners();
}

// Save criteria (add or update)
function saveCriteria() {
    const criteriaName = document.getElementById('criteria-name').value.trim();
    const description = document.getElementById('criteria-description').value.trim();
    const weight = parseFloat(document.getElementById('criteria-weight').value);
    const maxScore = parseInt(document.getElementById('criteria-max-score').value);
    const isActive = document.getElementById('criteria-is-active').checked ? 1 : 0;
    
    // Validate weight and max score
    if (isNaN(weight) || weight <= 0) {
        showNotification('خطأ', 'يجب أن يكون الوزن أكبر من 0', 'error');
        return;
    }
    
    if (isNaN(maxScore) || maxScore <= 0) {
        showNotification('خطأ', 'يجب أن تكون الدرجة القصوى أكبر من 0', 'error');
        return;
    }
    
    const criteriaData = {
        CriteriaName: criteriaName,
        Description: description,
        Weight: weight,
        MaxScore: maxScore,
        IsActive: isActive
    };
    
    if (currentCriteriaId) {
        // Update existing criteria
        if (updateEvaluationCriteria(currentCriteriaId, criteriaData)) {
            showNotification('تم بنجاح', 'تم تحديث معيار التقييم بنجاح', 'success');
        } else {
            showNotification('خطأ', 'فشل في تحديث معيار التقييم', 'error');
        }
    } else {
        // Add new criteria
        const newId = addEvaluationCriteria(criteriaData);
        if (newId) {
            showNotification('تم بنجاح', 'تم إضافة معيار التقييم بنجاح', 'success');
        } else {
            showNotification('خطأ', 'فشل في إضافة معيار التقييم', 'error');
        }
    }
    
    resetCriteriaForm();
    loadCriteriaTable();
}

// Edit criteria
function editCriteria(criteriaId) {
    const criteria = getEvaluationCriteriaById(criteriaId);
    if (!criteria) {
        showNotification('خطأ', 'معيار التقييم غير موجود', 'error');
        return;
    }
    
    // Set form values
    document.getElementById('criteria-name').value = criteria.CriteriaName;
    document.getElementById('criteria-description').value = criteria.Description || '';
    document.getElementById('criteria-weight').value = criteria.Weight;
    document.getElementById('criteria-max-score').value = criteria.MaxScore;
    document.getElementById('criteria-is-active').checked = criteria.IsActive === 1;
    
    // Update form title and save button text
    document.getElementById('criteria-form-title').textContent = 'تعديل معيار تقييم';
    document.getElementById('save-btn').textContent = 'تحديث';
    
    // Set current criteria ID
    currentCriteriaId = criteriaId;
    
    // Scroll to form
    document.getElementById('criteria-form-card').scrollIntoView({ behavior: 'smooth' });
}

// Reset criteria form
function resetCriteriaForm() {
    resetForm('criteria-form');
    
    // Reset form title and save button text
    document.getElementById('criteria-form-title').textContent = 'إضافة معيار تقييم جديد';
    document.getElementById('save-btn').textContent = 'حفظ';
    
    // Set default values
    document.getElementById('criteria-weight').value = '1.0';
    document.getElementById('criteria-max-score').value = '10';
    document.getElementById('criteria-is-active').checked = true;
    
    // Reset current criteria ID
    currentCriteriaId = null;
}

// Confirm delete criteria
function confirmDeleteCriteria(criteriaId) {
    const criteria = getEvaluationCriteriaById(criteriaId);
    if (!criteria) {
        showNotification('خطأ', 'معيار التقييم غير موجود', 'error');
        return;
    }
    
    // Check if this criteria is used in any evaluation
    const allDetails = getAllEvaluationDetails();
    const isInUse = allDetails.some(detail => detail.CriteriaID === criteriaId);
    
    if (isInUse) {
        showNotification('تحذير', 'لا يمكن حذف هذا المعيار لأنه مستخدم في تقييمات', 'warning');
        return;
    }
    
    createConfirmationModal(
        'تأكيد الحذف',
        `هل أنت متأكد من حذف معيار التقييم "${criteria.CriteriaName}"؟`,
        () => {
            if (deleteEvaluationCriteria(criteriaId)) {
                showNotification('تم بنجاح', 'تم حذف معيار التقييم بنجاح', 'success');
                loadCriteriaTable();
            } else {
                showNotification('خطأ', 'فشل في حذف معيار التقييم', 'error');
            }
        }
    );
}
