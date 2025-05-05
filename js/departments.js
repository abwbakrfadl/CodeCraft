/**
 * Departments Module
 * Handles department management functionality
 */

let currentDepartmentId = null;

// Initialize departments page
function initDepartments() {
    loadDepartmentsTable();
    setupDepartmentForm();
    setupDepartmentSearch();
}

// Load departments table with data
function loadDepartmentsTable() {
    const departments = getAllDepartments();
    const tableBody = document.getElementById('departments-table-body');
    tableBody.innerHTML = '';
    
    if (departments.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="5" class="text-center">لا توجد أقسام مسجلة</td>
            </tr>
        `;
        return;
    }
    
    departments.forEach(department => {
        // Get employee count for each department
        const employeeCount = getEmployeesByDepartment(department.DepartmentID).length;
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${department.DepartmentName}</td>
            <td>${department.DepartmentCode || '-'}</td>
            <td>${department.Description || '-'}</td>
            <td>${employeeCount}</td>
            <td class="action-column">
                <button class="btn btn-sm btn-primary btn-action view-employees-btn" data-id="${department.DepartmentID}" title="عرض الموظفين">
                    <i class="fas fa-users"></i>
                </button>
                <button class="btn btn-sm btn-info btn-action edit-btn" data-id="${department.DepartmentID}" title="تعديل">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-danger btn-action delete-btn" data-id="${department.DepartmentID}" title="حذف">
                    <i class="fas fa-trash-alt"></i>
                </button>
            </td>
        `;
        
        tableBody.appendChild(row);
    });
    
    // Add event listeners to buttons
    addDepartmentTableEventListeners();
}

// Add event listeners to department table buttons
function addDepartmentTableEventListeners() {
    // Edit department buttons
    document.querySelectorAll('.edit-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            const departmentId = parseInt(e.currentTarget.dataset.id);
            editDepartment(departmentId);
        });
    });
    
    // Delete department buttons
    document.querySelectorAll('.delete-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            const departmentId = parseInt(e.currentTarget.dataset.id);
            confirmDeleteDepartment(departmentId);
        });
    });
    
    // View employees buttons
    document.querySelectorAll('.view-employees-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            const departmentId = parseInt(e.currentTarget.dataset.id);
            viewDepartmentEmployees(departmentId);
        });
    });
}

// Setup department form
function setupDepartmentForm() {
    const form = document.getElementById('department-form');
    
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        if (!validateRequiredFields('department-form')) {
            showNotification('خطأ', 'يرجى ملء جميع الحقول المطلوبة', 'error');
            return;
        }
        
        saveDepartment();
    });
    
    // Cancel button
    document.getElementById('cancel-btn').addEventListener('click', () => {
        resetDepartmentForm();
    });
}

// Setup department search
function setupDepartmentSearch() {
    const searchInput = document.getElementById('department-search');
    
    searchInput.addEventListener('keyup', () => {
        const searchTerm = searchInput.value.trim();
        const departments = getAllDepartments();
        
        if (!searchTerm) {
            loadDepartmentsTable();
            return;
        }
        
        const filteredDepartments = filterDataBySearchTerm(
            departments, 
            searchTerm, 
            ['DepartmentName', 'DepartmentCode', 'Description']
        );
        
        renderFilteredDepartments(filteredDepartments);
    });
}

// Render filtered departments
function renderFilteredDepartments(departments) {
    const tableBody = document.getElementById('departments-table-body');
    tableBody.innerHTML = '';
    
    if (departments.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="5" class="text-center">لا توجد نتائج مطابقة للبحث</td>
            </tr>
        `;
        return;
    }
    
    departments.forEach(department => {
        const employeeCount = getEmployeesByDepartment(department.DepartmentID).length;
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${department.DepartmentName}</td>
            <td>${department.DepartmentCode || '-'}</td>
            <td>${department.Description || '-'}</td>
            <td>${employeeCount}</td>
            <td class="action-column">
                <button class="btn btn-sm btn-primary btn-action view-employees-btn" data-id="${department.DepartmentID}" title="عرض الموظفين">
                    <i class="fas fa-users"></i>
                </button>
                <button class="btn btn-sm btn-info btn-action edit-btn" data-id="${department.DepartmentID}" title="تعديل">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-danger btn-action delete-btn" data-id="${department.DepartmentID}" title="حذف">
                    <i class="fas fa-trash-alt"></i>
                </button>
            </td>
        `;
        
        tableBody.appendChild(row);
    });
    
    // Add event listeners to buttons
    addDepartmentTableEventListeners();
}

// Save department (add or update)
function saveDepartment() {
    const departmentName = document.getElementById('department-name').value.trim();
    const departmentCode = document.getElementById('department-code').value.trim();
    const description = document.getElementById('department-description').value.trim();
    
    const departmentData = {
        DepartmentName: departmentName,
        DepartmentCode: departmentCode,
        Description: description
    };
    
    if (currentDepartmentId) {
        // Update existing department
        if (updateDepartment(currentDepartmentId, departmentData)) {
            showNotification('تم بنجاح', 'تم تحديث القسم بنجاح', 'success');
        } else {
            showNotification('خطأ', 'فشل في تحديث القسم', 'error');
        }
    } else {
        // Add new department
        const newId = addDepartment(departmentData);
        if (newId) {
            showNotification('تم بنجاح', 'تم إضافة القسم بنجاح', 'success');
        } else {
            showNotification('خطأ', 'فشل في إضافة القسم', 'error');
        }
    }
    
    resetDepartmentForm();
    loadDepartmentsTable();
}

// Edit department
function editDepartment(departmentId) {
    const department = getDepartmentById(departmentId);
    if (!department) {
        showNotification('خطأ', 'القسم غير موجود', 'error');
        return;
    }
    
    // Set form values
    document.getElementById('department-name').value = department.DepartmentName;
    document.getElementById('department-code').value = department.DepartmentCode || '';
    document.getElementById('department-description').value = department.Description || '';
    
    // Update form title and save button text
    document.getElementById('department-form-title').textContent = 'تعديل قسم';
    document.getElementById('save-btn').textContent = 'تحديث';
    
    // Set current department ID
    currentDepartmentId = departmentId;
    
    // Scroll to form
    document.getElementById('department-form-card').scrollIntoView({ behavior: 'smooth' });
}

// Reset department form
function resetDepartmentForm() {
    resetForm('department-form');
    
    // Reset form title and save button text
    document.getElementById('department-form-title').textContent = 'إضافة قسم جديد';
    document.getElementById('save-btn').textContent = 'حفظ';
    
    // Reset current department ID
    currentDepartmentId = null;
}

// Confirm delete department
function confirmDeleteDepartment(departmentId) {
    const department = getDepartmentById(departmentId);
    if (!department) {
        showNotification('خطأ', 'القسم غير موجود', 'error');
        return;
    }
    
    // Check if there are employees in this department
    const employees = getEmployeesByDepartment(departmentId);
    if (employees.length > 0) {
        showNotification('تحذير', 'لا يمكن حذف القسم لأنه يحتوي على موظفين', 'warning');
        return;
    }
    
    createConfirmationModal(
        'تأكيد الحذف',
        `هل أنت متأكد من حذف القسم "${department.DepartmentName}"؟`,
        () => deleteDepartment(departmentId)
    );
}

// Delete department
function deleteDepartment(departmentId) {
    if (deleteDepartment(departmentId)) {
        showNotification('تم بنجاح', 'تم حذف القسم بنجاح', 'success');
        loadDepartmentsTable();
    } else {
        showNotification('خطأ', 'فشل في حذف القسم', 'error');
    }
}

// View department employees
function viewDepartmentEmployees(departmentId) {
    const department = getDepartmentById(departmentId);
    if (!department) {
        showNotification('خطأ', 'القسم غير موجود', 'error');
        return;
    }
    
    const employees = getEmployeesByDepartment(departmentId);
    const modalTitle = `موظفو قسم ${department.DepartmentName}`;
    
    let modalContent = '';
    
    if (employees.length === 0) {
        modalContent = '<div class="alert alert-info">لا يوجد موظفون في هذا القسم</div>';
    } else {
        modalContent = `
            <div class="table-responsive">
                <table class="table table-striped table-hover">
                    <thead>
                        <tr>
                            <th>رقم الموظف</th>
                            <th>الاسم</th>
                            <th>المنصب</th>
                            <th>تاريخ التعيين</th>
                            <th>الحالة</th>
                        </tr>
                    </thead>
                    <tbody>
        `;
        
        employees.forEach(employee => {
            modalContent += `
                <tr>
                    <td>${employee.EmployeeNumber}</td>
                    <td>${employee.FullName}</td>
                    <td>${employee.Position || '-'}</td>
                    <td>${formatDate(employee.HireDate)}</td>
                    <td>${employee.IsActive === 1 ? '<span class="badge bg-success">نشط</span>' : '<span class="badge bg-danger">غير نشط</span>'}</td>
                </tr>
            `;
        });
        
        modalContent += `
                    </tbody>
                </table>
            </div>
        `;
    }
    
    // Create and show modal
    const modalHtml = `
        <div class="modal fade" id="departmentEmployeesModal" tabindex="-1" aria-labelledby="departmentEmployeesModalLabel" aria-hidden="true">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="departmentEmployeesModalLabel">${modalTitle}</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="إغلاق"></button>
                    </div>
                    <div class="modal-body">
                        ${modalContent}
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">إغلاق</button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Append modal to body
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    
    // Show modal
    const modal = new bootstrap.Modal(document.getElementById('departmentEmployeesModal'));
    modal.show();
    
    // Remove modal from DOM after hiding
    document.getElementById('departmentEmployeesModal').addEventListener('hidden.bs.modal', function () {
        this.remove();
    });
}
