/**
 * Periods Module
 * Handles evaluation periods management
 */

let currentPeriodId = null;

// Initialize periods page
function initPeriods() {
    loadPeriodsTable();
    setupPeriodForm();
    setupPeriodSearch();
}

// Load periods table with data
function loadPeriodsTable() {
    const periods = getAllEvaluationPeriods();
    const tableBody = document.getElementById('periods-table-body');
    tableBody.innerHTML = '';
    
    if (periods.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="6" class="text-center">لا توجد فترات تقييم مسجلة</td>
            </tr>
        `;
        return;
    }
    
    // Sort periods by year (desc) and then by start date (desc)
    periods.sort((a, b) => {
        if (a.Year !== b.Year) {
            return b.Year - a.Year; // Descending by year
        }
        return new Date(b.StartDate) - new Date(a.StartDate); // Descending by start date
    });
    
    periods.forEach(period => {
        // Get evaluation count for this period
        const evaluationCount = getAllEmployeeEvaluations().filter(eval => eval.PeriodID === period.PeriodID).length;
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${period.PeriodName}</td>
            <td>${formatDate(period.StartDate)}</td>
            <td>${formatDate(period.EndDate)}</td>
            <td>${period.Year}</td>
            <td>${period.IsActive === 1 ? '<span class="badge bg-success">نشط</span>' : '<span class="badge bg-secondary">غير نشط</span>'}</td>
            <td>${evaluationCount}</td>
            <td class="action-column">
                <button class="btn btn-sm btn-info btn-action edit-btn" data-id="${period.PeriodID}" title="تعديل">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-danger btn-action delete-btn" data-id="${period.PeriodID}" title="حذف">
                    <i class="fas fa-trash-alt"></i>
                </button>
                ${period.IsActive === 0 ? `
                <button class="btn btn-sm btn-success btn-action activate-btn" data-id="${period.PeriodID}" title="تنشيط">
                    <i class="fas fa-check"></i>
                </button>
                ` : ''}
            </td>
        `;
        
        tableBody.appendChild(row);
    });
    
    // Add event listeners to buttons
    addPeriodTableEventListeners();
}

// Add event listeners to period table buttons
function addPeriodTableEventListeners() {
    // Edit period buttons
    document.querySelectorAll('.edit-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            const periodId = parseInt(e.currentTarget.dataset.id);
            editPeriod(periodId);
        });
    });
    
    // Delete period buttons
    document.querySelectorAll('.delete-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            const periodId = parseInt(e.currentTarget.dataset.id);
            confirmDeletePeriod(periodId);
        });
    });
    
    // Activate period buttons
    document.querySelectorAll('.activate-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            const periodId = parseInt(e.currentTarget.dataset.id);
            confirmActivatePeriod(periodId);
        });
    });
}

// Setup period form
function setupPeriodForm() {
    const form = document.getElementById('period-form');
    
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        if (!validateRequiredFields('period-form')) {
            showNotification('خطأ', 'يرجى ملء جميع الحقول المطلوبة', 'error');
            return;
        }
        
        savePeriod();
    });
    
    // Cancel button
    document.getElementById('cancel-btn').addEventListener('click', () => {
        resetPeriodForm();
    });
    
    // Year field default value (current year)
    document.getElementById('period-year').value = new Date().getFullYear();
}

// Setup period search
function setupPeriodSearch() {
    const searchInput = document.getElementById('period-search');
    const yearFilter = document.getElementById('year-filter');
    
    // Year filter options (current year and previous 5 years)
    const currentYear = new Date().getFullYear();
    yearFilter.innerHTML = '<option value="">جميع السنوات</option>';
    
    for (let year = currentYear; year >= currentYear - 5; year--) {
        const option = document.createElement('option');
        option.value = year;
        option.textContent = year;
        yearFilter.appendChild(option);
    }
    
    // Event listeners
    searchInput.addEventListener('keyup', filterPeriods);
    yearFilter.addEventListener('change', filterPeriods);
}

// Filter periods based on search and year filter
function filterPeriods() {
    const searchTerm = document.getElementById('period-search').value.trim();
    const yearFilter = document.getElementById('year-filter').value;
    
    let periods = getAllEvaluationPeriods();
    
    // Filter by year if selected
    if (yearFilter) {
        const year = parseInt(yearFilter);
        periods = periods.filter(p => p.Year === year);
    }
    
    // Filter by search term if provided
    if (searchTerm) {
        periods = filterDataBySearchTerm(
            periods, 
            searchTerm, 
            ['PeriodName']
        );
    }
    
    // Sort periods
    periods.sort((a, b) => {
        if (a.Year !== b.Year) {
            return b.Year - a.Year; // Descending by year
        }
        return new Date(b.StartDate) - new Date(a.StartDate); // Descending by start date
    });
    
    renderFilteredPeriods(periods);
}

// Render filtered periods
function renderFilteredPeriods(periods) {
    const tableBody = document.getElementById('periods-table-body');
    tableBody.innerHTML = '';
    
    if (periods.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="6" class="text-center">لا توجد نتائج مطابقة للبحث</td>
            </tr>
        `;
        return;
    }
    
    periods.forEach(period => {
        // Get evaluation count for this period
        const evaluationCount = getAllEmployeeEvaluations().filter(eval => eval.PeriodID === period.PeriodID).length;
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${period.PeriodName}</td>
            <td>${formatDate(period.StartDate)}</td>
            <td>${formatDate(period.EndDate)}</td>
            <td>${period.Year}</td>
            <td>${period.IsActive === 1 ? '<span class="badge bg-success">نشط</span>' : '<span class="badge bg-secondary">غير نشط</span>'}</td>
            <td>${evaluationCount}</td>
            <td class="action-column">
                <button class="btn btn-sm btn-info btn-action edit-btn" data-id="${period.PeriodID}" title="تعديل">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-danger btn-action delete-btn" data-id="${period.PeriodID}" title="حذف">
                    <i class="fas fa-trash-alt"></i>
                </button>
                ${period.IsActive === 0 ? `
                <button class="btn btn-sm btn-success btn-action activate-btn" data-id="${period.PeriodID}" title="تنشيط">
                    <i class="fas fa-check"></i>
                </button>
                ` : ''}
            </td>
        `;
        
        tableBody.appendChild(row);
    });
    
    // Add event listeners to buttons
    addPeriodTableEventListeners();
}

// Save period (add or update)
function savePeriod() {
    const periodName = document.getElementById('period-name').value.trim();
    const startDate = document.getElementById('period-start-date').value;
    const endDate = document.getElementById('period-end-date').value;
    const year = parseInt(document.getElementById('period-year').value);
    const isActive = document.getElementById('period-is-active').checked ? 1 : 0;
    
    // Validate dates
    if (new Date(startDate) > new Date(endDate)) {
        showNotification('خطأ', 'تاريخ البداية يجب أن يكون قبل تاريخ النهاية', 'error');
        return;
    }
    
    // If setting this period as active, deactivate other periods
    if (isActive === 1) {
        const activePeriod = getActiveEvaluationPeriod();
        if (activePeriod && (!currentPeriodId || activePeriod.PeriodID !== currentPeriodId)) {
            const confirmMsg = `هناك فترة تقييم نشطة حالياً "${activePeriod.PeriodName}". 
                               هل تريد تنشيط الفترة الجديدة بدلاً منها؟`;
            
            createConfirmationModal(
                'تأكيد تغيير الفترة النشطة',
                confirmMsg,
                () => {
                    // Deactivate current active period
                    updateEvaluationPeriod(activePeriod.PeriodID, { IsActive: 0 });
                    
                    // Continue with saving
                    completePeriosSave(periodName, startDate, endDate, year, isActive);
                },
                () => {
                    // User cancelled, uncheck the active checkbox
                    document.getElementById('period-is-active').checked = false;
                }
            );
            return;
        }
    }
    
    // No conflicts, continue with saving
    completePeriosSave(periodName, startDate, endDate, year, isActive);
}

// Complete the period save process
function completePeriosSave(periodName, startDate, endDate, year, isActive) {
    const periodData = {
        PeriodName: periodName,
        StartDate: startDate,
        EndDate: endDate,
        Year: year,
        IsActive: isActive
    };
    
    if (currentPeriodId) {
        // Update existing period
        if (updateEvaluationPeriod(currentPeriodId, periodData)) {
            showNotification('تم بنجاح', 'تم تحديث فترة التقييم بنجاح', 'success');
        } else {
            showNotification('خطأ', 'فشل في تحديث فترة التقييم', 'error');
        }
    } else {
        // Add new period
        const newId = addEvaluationPeriod(periodData);
        if (newId) {
            showNotification('تم بنجاح', 'تم إضافة فترة التقييم بنجاح', 'success');
        } else {
            showNotification('خطأ', 'فشل في إضافة فترة التقييم', 'error');
        }
    }
    
    resetPeriodForm();
    loadPeriodsTable();
}

// Edit period
function editPeriod(periodId) {
    const period = getEvaluationPeriodById(periodId);
    if (!period) {
        showNotification('خطأ', 'فترة التقييم غير موجودة', 'error');
        return;
    }
    
    // Set form values
    document.getElementById('period-name').value = period.PeriodName;
    document.getElementById('period-start-date').value = period.StartDate ? period.StartDate.split('T')[0] : '';
    document.getElementById('period-end-date').value = period.EndDate ? period.EndDate.split('T')[0] : '';
    document.getElementById('period-year').value = period.Year;
    document.getElementById('period-is-active').checked = period.IsActive === 1;
    
    // Update form title and save button text
    document.getElementById('period-form-title').textContent = 'تعديل فترة تقييم';
    document.getElementById('save-btn').textContent = 'تحديث';
    
    // Set current period ID
    currentPeriodId = periodId;
    
    // Scroll to form
    document.getElementById('period-form-card').scrollIntoView({ behavior: 'smooth' });
}

// Reset period form
function resetPeriodForm() {
    resetForm('period-form');
    
    // Reset form title and save button text
    document.getElementById('period-form-title').textContent = 'إضافة فترة تقييم جديدة';
    document.getElementById('save-btn').textContent = 'حفظ';
    
    // Set default values
    document.getElementById('period-year').value = new Date().getFullYear();
    document.getElementById('period-is-active').checked = false;
    
    // Reset current period ID
    currentPeriodId = null;
}

// Confirm delete period
function confirmDeletePeriod(periodId) {
    const period = getEvaluationPeriodById(periodId);
    if (!period) {
        showNotification('خطأ', 'فترة التقييم غير موجودة', 'error');
        return;
    }
    
    // Check if this period is used in any evaluation
    const evaluations = getAllEmployeeEvaluations().filter(eval => eval.PeriodID === periodId);
    
    if (evaluations.length > 0) {
        showNotification('تحذير', 'لا يمكن حذف هذه الفترة لأنها مستخدمة في تقييمات', 'warning');
        return;
    }
    
    // Check if this is the active period
    if (period.IsActive === 1) {
        showNotification('تحذير', 'لا يمكن حذف الفترة النشطة، قم بتنشيط فترة أخرى أولاً', 'warning');
        return;
    }
    
    createConfirmationModal(
        'تأكيد الحذف',
        `هل أنت متأكد من حذف فترة التقييم "${period.PeriodName}"؟`,
        () => {
            if (deleteEvaluationPeriod(periodId)) {
                showNotification('تم بنجاح', 'تم حذف فترة التقييم بنجاح', 'success');
                loadPeriodsTable();
            } else {
                showNotification('خطأ', 'فشل في حذف فترة التقييم', 'error');
            }
        }
    );
}

// Confirm activate period
function confirmActivatePeriod(periodId) {
    const period = getEvaluationPeriodById(periodId);
    if (!period) {
        showNotification('خطأ', 'فترة التقييم غير موجودة', 'error');
        return;
    }
    
    // Get current active period
    const activePeriod = getActiveEvaluationPeriod();
    
    let confirmMsg = `هل تريد تنشيط فترة التقييم "${period.PeriodName}"؟`;
    
    if (activePeriod) {
        confirmMsg = `هناك فترة تقييم نشطة حالياً "${activePeriod.PeriodName}". هل تريد تنشيط الفترة الجديدة بدلاً منها؟`;
    }
    
    createConfirmationModal(
        'تأكيد تنشيط الفترة',
        confirmMsg,
        () => {
            // Deactivate current active period if exists
            if (activePeriod) {
                updateEvaluationPeriod(activePeriod.PeriodID, { IsActive: 0 });
            }
            
            // Activate selected period
            if (updateEvaluationPeriod(periodId, { IsActive: 1 })) {
                showNotification('تم بنجاح', 'تم تنشيط فترة التقييم بنجاح', 'success');
                loadPeriodsTable();
            } else {
                showNotification('خطأ', 'فشل في تنشيط فترة التقييم', 'error');
            }
        }
    );
}
