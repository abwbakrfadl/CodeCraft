/**
 * Employees Module
 * Handles employee management functionality
 */

let currentEmployeeId = null;

// Initialize employees page
function initEmployees() {
    loadEmployeesTable();
    setupEmployeeForm();
    setupEmployeeSearch();
    loadDepartmentDropdown();
    loadManagerDropdown();
    loadUserDropdown();
}

// Load employees table with data
function loadEmployeesTable() {
    const employees = getAllEmployees();
    const tableBody = document.getElementById('employees-table-body');
    tableBody.innerHTML = '';
    
    if (employees.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="7" class="text-center">لا يوجد موظفون مسجلون</td>
            </tr>
        `;
        return;
    }
    
    employees.forEach(employee => {
        const department = getDepartmentById(employee.DepartmentID);
        const manager = getEmployeeById(employee.ManagerID);
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${employee.EmployeeNumber}</td>
            <td>${employee.FullName}</td>
            <td>${department ? department.DepartmentName : '-'}</td>
            <td>${employee.Position || '-'}</td>
            <td>${manager ? manager.FullName : '-'}</td>
            <td>${employee.IsActive === 1 ? '<span class="badge bg-success">نشط</span>' : '<span class="badge bg-danger">غير نشط</span>'}</td>
            <td class="action-column">
                <button class="btn btn-sm btn-primary btn-action view-btn" data-id="${employee.EmployeeID}" title="عرض التفاصيل">
                    <i class="fas fa-eye"></i>
                </button>
                <button class="btn btn-sm btn-info btn-action edit-btn" data-id="${employee.EmployeeID}" title="تعديل">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-danger btn-action delete-btn" data-id="${employee.EmployeeID}" title="حذف">
                    <i class="fas fa-trash-alt"></i>
                </button>
            </td>
        `;
        
        tableBody.appendChild(row);
    });
    
    // Add event listeners to buttons
    addEmployeeTableEventListeners();
}

// Add event listeners to employee table buttons
function addEmployeeTableEventListeners() {
    // View employee buttons
    document.querySelectorAll('.view-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            const employeeId = parseInt(e.currentTarget.dataset.id);
            viewEmployee(employeeId);
        });
    });
    
    // Edit employee buttons
    document.querySelectorAll('.edit-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            const employeeId = parseInt(e.currentTarget.dataset.id);
            editEmployee(employeeId);
        });
    });
    
    // Delete employee buttons
    document.querySelectorAll('.delete-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            const employeeId = parseInt(e.currentTarget.dataset.id);
            confirmDeleteEmployee(employeeId);
        });
    });
}

// Setup employee form
function setupEmployeeForm() {
    const form = document.getElementById('employee-form');
    
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        if (!validateRequiredFields('employee-form')) {
            showNotification('خطأ', 'يرجى ملء جميع الحقول المطلوبة', 'error');
            return;
        }
        
        saveEmployee();
    });
    
    // Cancel button
    document.getElementById('cancel-btn').addEventListener('click', () => {
        resetEmployeeForm();
    });
}

// Setup employee search
function setupEmployeeSearch() {
    const searchInput = document.getElementById('employee-search');
    const departmentFilter = document.getElementById('department-filter');
    
    // Search input event
    searchInput.addEventListener('keyup', filterEmployees);
    
    // Department filter event
    departmentFilter.addEventListener('change', filterEmployees);
    
    // Load department filter options
    const departments = getAllDepartments();
    departmentFilter.innerHTML = '<option value="">جميع الأقسام</option>';
    
    departments.forEach(department => {
        const option = document.createElement('option');
        option.value = department.DepartmentID;
        option.textContent = department.DepartmentName;
        departmentFilter.appendChild(option);
    });
}

// Filter employees based on search and department filter
function filterEmployees() {
    const searchTerm = document.getElementById('employee-search').value.trim();
    const departmentId = document.getElementById('department-filter').value;
    
    let employees = getAllEmployees();
    
    // Filter by department if selected
    if (departmentId) {
        employees = employees.filter(emp => emp.DepartmentID === parseInt(departmentId));
    }
    
    // Filter by search term if provided
    if (searchTerm) {
        employees = filterDataBySearchTerm(
            employees, 
            searchTerm, 
            ['EmployeeNumber', 'FirstName', 'LastName', 'Position', 'Email', 'Phone']
        );
    }
    
    renderFilteredEmployees(employees);
}

// Render filtered employees
function renderFilteredEmployees(employees) {
    const tableBody = document.getElementById('employees-table-body');
    tableBody.innerHTML = '';
    
    if (employees.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="7" class="text-center">لا توجد نتائج مطابقة للبحث</td>
            </tr>
        `;
        return;
    }
    
    employees.forEach(employee => {
        const department = getDepartmentById(employee.DepartmentID);
        const manager = getEmployeeById(employee.ManagerID);
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${employee.EmployeeNumber}</td>
            <td>${employee.FullName}</td>
            <td>${department ? department.DepartmentName : '-'}</td>
            <td>${employee.Position || '-'}</td>
            <td>${manager ? manager.FullName : '-'}</td>
            <td>${employee.IsActive === 1 ? '<span class="badge bg-success">نشط</span>' : '<span class="badge bg-danger">غير نشط</span>'}</td>
            <td class="action-column">
                <button class="btn btn-sm btn-primary btn-action view-btn" data-id="${employee.EmployeeID}" title="عرض التفاصيل">
                    <i class="fas fa-eye"></i>
                </button>
                <button class="btn btn-sm btn-info btn-action edit-btn" data-id="${employee.EmployeeID}" title="تعديل">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-danger btn-action delete-btn" data-id="${employee.EmployeeID}" title="حذف">
                    <i class="fas fa-trash-alt"></i>
                </button>
            </td>
        `;
        
        tableBody.appendChild(row);
    });
    
    // Add event listeners to buttons
    addEmployeeTableEventListeners();
}

// Load department dropdown options
function loadDepartmentDropdown() {
    const departmentSelect = document.getElementById('employee-department');
    departmentSelect.innerHTML = '<option value="">اختر القسم</option>';
    
    const departments = getAllDepartments();
    departments.forEach(department => {
        const option = document.createElement('option');
        option.value = department.DepartmentID;
        option.textContent = department.DepartmentName;
        departmentSelect.appendChild(option);
    });
}

// Load manager dropdown options
function loadManagerDropdown() {
    const managerSelect = document.getElementById('employee-manager');
    managerSelect.innerHTML = '<option value="">بدون مدير مباشر</option>';
    
    const employees = getAllEmployees().filter(emp => emp.IsActive === 1);
    employees.forEach(employee => {
        // Skip current employee (can't be their own manager)
        if (currentEmployeeId && employee.EmployeeID === currentEmployeeId) {
            return;
        }
        
        const option = document.createElement('option');
        option.value = employee.EmployeeID;
        option.textContent = `${employee.FullName} (${employee.Position || 'بدون منصب'})`;
        managerSelect.appendChild(option);
    });
}

// Load user dropdown options
function loadUserDropdown() {
    const userSelect = document.getElementById('employee-user');
    userSelect.innerHTML = '<option value="">اختر حساب المستخدم</option>';
    
    const users = getAllUsers().filter(user => user.IsActive === 1);
    const employees = getAllEmployees();
    const assignedUserIds = employees.map(emp => emp.UserID).filter(id => id !== null);
    
    users.forEach(user => {
        // Skip users that are already assigned to other employees
        // (except for the current employee being edited)
        const isAssignedToOther = assignedUserIds.includes(user.UserID) && 
            (!currentEmployeeId || 
             !employees.find(emp => emp.EmployeeID === currentEmployeeId && emp.UserID === user.UserID));
        
        if (!isAssignedToOther) {
            const option = document.createElement('option');
            option.value = user.UserID;
            option.textContent = `${user.Username} (${user.FullName})`;
            userSelect.appendChild(option);
        }
    });
}

// Save employee (add or update)
function saveEmployee() {
    const employeeNumber = document.getElementById('employee-number').value.trim();
    const firstName = document.getElementById('employee-first-name').value.trim();
    const lastName = document.getElementById('employee-last-name').value.trim();
    const departmentId = document.getElementById('employee-department').value;
    const position = document.getElementById('employee-position').value.trim();
    const hireDate = document.getElementById('employee-hire-date').value;
    const birthDate = document.getElementById('employee-birth-date').value;
    const email = document.getElementById('employee-email').value.trim();
    const phone = document.getElementById('employee-phone').value.trim();
    const managerId = document.getElementById('employee-manager').value;
    const userId = document.getElementById('employee-user').value;
    const isActive = document.getElementById('employee-is-active').checked ? 1 : 0;
    
    // Validate employee number uniqueness
    const employees = getAllEmployees();
    const isNumberTaken = employees.some(emp => 
        emp.EmployeeNumber === employeeNumber && 
        (!currentEmployeeId || emp.EmployeeID !== currentEmployeeId)
    );
    
    if (isNumberTaken) {
        showNotification('خطأ', 'رقم الموظف مستخدم بالفعل', 'error');
        return;
    }
    
    const employeeData = {
        EmployeeNumber: employeeNumber,
        FirstName: firstName,
        LastName: lastName,
        DepartmentID: departmentId ? parseInt(departmentId) : null,
        Position: position,
        HireDate: hireDate,
        BirthDate: birthDate,
        Email: email,
        Phone: phone,
        ManagerID: managerId ? parseInt(managerId) : null,
        UserID: userId ? parseInt(userId) : null,
        IsActive: isActive
    };
    
    if (currentEmployeeId) {
        // Update existing employee
        if (updateEmployee(currentEmployeeId, employeeData)) {
            showNotification('تم بنجاح', 'تم تحديث بيانات الموظف بنجاح', 'success');
        } else {
            showNotification('خطأ', 'فشل في تحديث بيانات الموظف', 'error');
        }
    } else {
        // Add new employee
        const newId = addEmployee(employeeData);
        if (newId) {
            showNotification('تم بنجاح', 'تم إضافة الموظف بنجاح', 'success');
        } else {
            showNotification('خطأ', 'فشل في إضافة الموظف', 'error');
        }
    }
    
    resetEmployeeForm();
    loadEmployeesTable();
}

// Edit employee
function editEmployee(employeeId) {
    const employee = getEmployeeById(employeeId);
    if (!employee) {
        showNotification('خطأ', 'الموظف غير موجود', 'error');
        return;
    }
    
    // Set current employee ID
    currentEmployeeId = employeeId;
    
    // Reload dropdowns (especially for manager and user filters)
    loadManagerDropdown();
    loadUserDropdown();
    
    // Set form values
    document.getElementById('employee-number').value = employee.EmployeeNumber;
    document.getElementById('employee-first-name').value = employee.FirstName;
    document.getElementById('employee-last-name').value = employee.LastName;
    document.getElementById('employee-department').value = employee.DepartmentID || '';
    document.getElementById('employee-position').value = employee.Position || '';
    document.getElementById('employee-hire-date').value = employee.HireDate || '';
    document.getElementById('employee-birth-date').value = employee.BirthDate || '';
    document.getElementById('employee-email').value = employee.Email || '';
    document.getElementById('employee-phone').value = employee.Phone || '';
    document.getElementById('employee-manager').value = employee.ManagerID || '';
    document.getElementById('employee-user').value = employee.UserID || '';
    document.getElementById('employee-is-active').checked = employee.IsActive === 1;
    
    // Update form title and save button text
    document.getElementById('employee-form-title').textContent = 'تعديل بيانات موظف';
    document.getElementById('save-btn').textContent = 'تحديث';
    
    // Scroll to form
    document.getElementById('employee-form-card').scrollIntoView({ behavior: 'smooth' });
}

// Reset employee form
function resetEmployeeForm() {
    resetForm('employee-form');
    
    // Reset form title and save button text
    document.getElementById('employee-form-title').textContent = 'إضافة موظف جديد';
    document.getElementById('save-btn').textContent = 'حفظ';
    
    // Reset current employee ID
    currentEmployeeId = null;
    
    // Reload dropdowns
    loadManagerDropdown();
    loadUserDropdown();
    
    // Set default values
    document.getElementById('employee-is-active').checked = true;
}

// Confirm delete employee
function confirmDeleteEmployee(employeeId) {
    const employee = getEmployeeById(employeeId);
    if (!employee) {
        showNotification('خطأ', 'الموظف غير موجود', 'error');
        return;
    }
    
    // Check if this employee is a manager for other employees
    const managedEmployees = getAllEmployees().filter(emp => emp.ManagerID === employeeId);
    if (managedEmployees.length > 0) {
        showNotification('تحذير', 'لا يمكن حذف الموظف لأنه مدير لموظفين آخرين', 'warning');
        return;
    }
    
    // Check if this employee has evaluations
    const evaluations = getAllEmployeeEvaluations().filter(
        eval => eval.EmployeeID === employeeId || eval.EvaluatorID === employeeId
    );
    
    if (evaluations.length > 0) {
        showNotification('تحذير', 'لا يمكن حذف الموظف لأنه مرتبط بتقييمات', 'warning');
        return;
    }
    
    createConfirmationModal(
        'تأكيد الحذف',
        `هل أنت متأكد من حذف الموظف "${employee.FullName}"؟`,
        () => deleteEmployeeRecord(employeeId)
    );
}

// Delete employee
function deleteEmployeeRecord(employeeId) {
    if (deleteEmployee(employeeId)) {
        showNotification('تم بنجاح', 'تم حذف الموظف بنجاح', 'success');
        loadEmployeesTable();
    } else {
        showNotification('خطأ', 'فشل في حذف الموظف', 'error');
    }
}

// View employee details
function viewEmployee(employeeId) {
    const employee = getEmployeeById(employeeId);
    if (!employee) {
        showNotification('خطأ', 'الموظف غير موجود', 'error');
        return;
    }
    
    const department = getDepartmentById(employee.DepartmentID);
    const manager = getEmployeeById(employee.ManagerID);
    const user = getUserById(employee.UserID);
    
    // Create modal content
    const modalContent = `
        <div class="row">
            <div class="col-md-6">
                <p><strong>رقم الموظف:</strong> ${employee.EmployeeNumber}</p>
                <p><strong>الاسم الكامل:</strong> ${employee.FullName}</p>
                <p><strong>القسم:</strong> ${department ? department.DepartmentName : '-'}</p>
                <p><strong>المنصب:</strong> ${employee.Position || '-'}</p>
                <p><strong>المدير المباشر:</strong> ${manager ? manager.FullName : '-'}</p>
            </div>
            <div class="col-md-6">
                <p><strong>تاريخ التعيين:</strong> ${formatDate(employee.HireDate)}</p>
                <p><strong>تاريخ الميلاد:</strong> ${formatDate(employee.BirthDate)}</p>
                <p><strong>البريد الإلكتروني:</strong> ${employee.Email || '-'}</p>
                <p><strong>رقم الهاتف:</strong> ${employee.Phone || '-'}</p>
                <p><strong>حساب المستخدم:</strong> ${user ? user.Username : '-'}</p>
                <p><strong>الحالة:</strong> ${employee.IsActive === 1 ? '<span class="badge bg-success">نشط</span>' : '<span class="badge bg-danger">غير نشط</span>'}</p>
            </div>
        </div>
    `;
    
    // Create and show modal
    const modalHtml = `
        <div class="modal fade" id="employeeDetailsModal" tabindex="-1" aria-labelledby="employeeDetailsModalLabel" aria-hidden="true">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="employeeDetailsModalLabel">تفاصيل الموظف: ${employee.FullName}</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="إغلاق"></button>
                    </div>
                    <div class="modal-body">
                        ${modalContent}
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">إغلاق</button>
                        <button type="button" class="btn btn-info" id="edit-employee-btn">تعديل</button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Append modal to body
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    
    // Show modal
    const modal = new bootstrap.Modal(document.getElementById('employeeDetailsModal'));
    modal.show();
    
    // Add event listener to edit button
    document.getElementById('edit-employee-btn').addEventListener('click', () => {
        modal.hide();
        editEmployee(employeeId);
    });
    
    // Remove modal from DOM after hiding
    document.getElementById('employeeDetailsModal').addEventListener('hidden.bs.modal', function () {
        this.remove();
    });
}
