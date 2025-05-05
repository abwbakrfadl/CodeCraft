/**
 * Users Module
 * Handles user management functionality
 */

let currentUserId = null;

// Initialize users page
function initUsers() {
    loadUsersTable();
    setupUserForm();
    setupUserSearch();
    loadUserRolesCheckboxes();
}

// Load users table with data
function loadUsersTable() {
    const users = getAllUsers();
    const tableBody = document.getElementById('users-table-body');
    tableBody.innerHTML = '';
    
    if (users.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="5" class="text-center">لا يوجد مستخدمون مسجلون</td>
            </tr>
        `;
        return;
    }
    
    users.forEach(user => {
        // Get user roles
        const userRoles = getUserRoles(user.UserID);
        const rolesText = userRoles.map(role => role.RoleName).join(', ');
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${user.Username}</td>
            <td>${user.FullName}</td>
            <td>${user.Email}</td>
            <td>${rolesText}</td>
            <td>${user.IsActive === 1 ? '<span class="badge bg-success">نشط</span>' : '<span class="badge bg-danger">غير نشط</span>'}</td>
            <td class="action-column">
                <button class="btn btn-sm btn-info btn-action edit-btn" data-id="${user.UserID}" title="تعديل">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-danger btn-action delete-btn" data-id="${user.UserID}" title="حذف">
                    <i class="fas fa-trash-alt"></i>
                </button>
                ${user.IsActive === 0 ? `
                <button class="btn btn-sm btn-success btn-action activate-btn" data-id="${user.UserID}" title="تنشيط">
                    <i class="fas fa-check"></i>
                </button>
                ` : ''}
            </td>
        `;
        
        tableBody.appendChild(row);
    });
    
    // Add event listeners to buttons
    addUserTableEventListeners();
}

// Add event listeners to user table buttons
function addUserTableEventListeners() {
    // Edit user buttons
    document.querySelectorAll('.edit-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            const userId = parseInt(e.currentTarget.dataset.id);
            editUser(userId);
        });
    });
    
    // Delete user buttons
    document.querySelectorAll('.delete-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            const userId = parseInt(e.currentTarget.dataset.id);
            confirmDeleteUser(userId);
        });
    });
    
    // Activate user buttons
    document.querySelectorAll('.activate-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            const userId = parseInt(e.currentTarget.dataset.id);
            activateUser(userId);
        });
    });
}

// Setup user form
function setupUserForm() {
    const form = document.getElementById('user-form');
    
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        if (!validateRequiredFields('user-form')) {
            showNotification('خطأ', 'يرجى ملء جميع الحقول المطلوبة', 'error');
            return;
        }
        
        saveUser();
    });
    
    // Cancel button
    document.getElementById('cancel-btn').addEventListener('click', () => {
        resetUserForm();
    });
    
    // Password change section toggle
    const changePasswordCheckbox = document.getElementById('change-password-checkbox');
    const passwordFields = document.getElementById('password-fields');
    
    if (changePasswordCheckbox && passwordFields) {
        changePasswordCheckbox.addEventListener('change', () => {
            if (changePasswordCheckbox.checked) {
                passwordFields.classList.remove('d-none');
                document.getElementById('user-password').required = true;
                document.getElementById('user-confirm-password').required = true;
            } else {
                passwordFields.classList.add('d-none');
                document.getElementById('user-password').required = false;
                document.getElementById('user-confirm-password').required = false;
            }
        });
    }
}

// Load user roles checkboxes
function loadUserRolesCheckboxes() {
    const rolesContainer = document.getElementById('user-roles-container');
    if (!rolesContainer) return;
    
    const roles = getAllUserRoles();
    rolesContainer.innerHTML = '';
    
    roles.forEach(role => {
        const checkboxDiv = document.createElement('div');
        checkboxDiv.className = 'form-check mb-2';
        
        checkboxDiv.innerHTML = `
            <input class="form-check-input role-checkbox" type="checkbox" value="${role.RoleID}" id="role-${role.RoleID}">
            <label class="form-check-label" for="role-${role.RoleID}">
                ${role.RoleName} ${role.Description ? `<small class="text-muted">(${role.Description})</small>` : ''}
            </label>
        `;
        
        rolesContainer.appendChild(checkboxDiv);
    });
}

// Setup user search
function setupUserSearch() {
    const searchInput = document.getElementById('user-search');
    const statusFilter = document.getElementById('status-filter');
    
    searchInput.addEventListener('keyup', filterUsers);
    statusFilter.addEventListener('change', filterUsers);
}

// Filter users based on search and status filter
function filterUsers() {
    const searchTerm = document.getElementById('user-search').value.trim();
    const statusFilter = document.getElementById('status-filter').value;
    
    let users = getAllUsers();
    
    // Filter by status if selected
    if (statusFilter !== '') {
        const isActive = parseInt(statusFilter) === 1;
        users = users.filter(user => user.IsActive === (isActive ? 1 : 0));
    }
    
    // Filter by search term if provided
    if (searchTerm) {
        users = filterDataBySearchTerm(
            users, 
            searchTerm, 
            ['Username', 'FullName', 'Email']
        );
    }
    
    renderFilteredUsers(users);
}

// Render filtered users
function renderFilteredUsers(users) {
    const tableBody = document.getElementById('users-table-body');
    tableBody.innerHTML = '';
    
    if (users.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="5" class="text-center">لا توجد نتائج مطابقة للبحث</td>
            </tr>
        `;
        return;
    }
    
    users.forEach(user => {
        // Get user roles
        const userRoles = getUserRoles(user.UserID);
        const rolesText = userRoles.map(role => role.RoleName).join(', ');
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${user.Username}</td>
            <td>${user.FullName}</td>
            <td>${user.Email}</td>
            <td>${rolesText}</td>
            <td>${user.IsActive === 1 ? '<span class="badge bg-success">نشط</span>' : '<span class="badge bg-danger">غير نشط</span>'}</td>
            <td class="action-column">
                <button class="btn btn-sm btn-info btn-action edit-btn" data-id="${user.UserID}" title="تعديل">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-danger btn-action delete-btn" data-id="${user.UserID}" title="حذف">
                    <i class="fas fa-trash-alt"></i>
                </button>
                ${user.IsActive === 0 ? `
                <button class="btn btn-sm btn-success btn-action activate-btn" data-id="${user.UserID}" title="تنشيط">
                    <i class="fas fa-check"></i>
                </button>
                ` : ''}
            </td>
        `;
        
        tableBody.appendChild(row);
    });
    
    // Add event listeners to buttons
    addUserTableEventListeners();
}

// Save user (add or update)
function saveUser() {
    const username = document.getElementById('user-username').value.trim();
    const fullName = document.getElementById('user-fullname').value.trim();
    const email = document.getElementById('user-email').value.trim();
    const isActive = document.getElementById('user-is-active').checked ? 1 : 0;
    
    // Get selected roles
    const selectedRoles = [];
    document.querySelectorAll('.role-checkbox:checked').forEach(checkbox => {
        selectedRoles.push(parseInt(checkbox.value));
    });
    
    // Validate at least one role is selected
    if (selectedRoles.length === 0) {
        showNotification('خطأ', 'يرجى اختيار دور واحد على الأقل', 'error');
        return;
    }
    
    // Check for duplicate username and email
    const users = getAllUsers();
    const isUsernameTaken = users.some(user => 
        user.Username === username && 
        (!currentUserId || user.UserID !== currentUserId)
    );
    
    const isEmailTaken = users.some(user => 
        user.Email === email && 
        (!currentUserId || user.UserID !== currentUserId)
    );
    
    if (isUsernameTaken) {
        showNotification('خطأ', 'اسم المستخدم مستخدم بالفعل', 'error');
        return;
    }
    
    if (isEmailTaken) {
        showNotification('خطأ', 'البريد الإلكتروني مستخدم بالفعل', 'error');
        return;
    }
    
    // Handle password
    let password = null;
    
    if (!currentUserId) {
        // New user - password is required
        password = document.getElementById('user-password').value;
        const confirmPassword = document.getElementById('user-confirm-password').value;
        
        if (password !== confirmPassword) {
            showNotification('خطأ', 'كلمة المرور وتأكيدها غير متطابقين', 'error');
            return;
        }
    } else {
        // Existing user - password is optional
        const changePassword = document.getElementById('change-password-checkbox').checked;
        
        if (changePassword) {
            password = document.getElementById('user-password').value;
            const confirmPassword = document.getElementById('user-confirm-password').value;
            
            if (password !== confirmPassword) {
                showNotification('خطأ', 'كلمة المرور وتأكيدها غير متطابقين', 'error');
                return;
            }
        }
    }
    
    // Prepare user data
    const userData = {
        Username: username,
        FullName: fullName,
        Email: email,
        IsActive: isActive
    };
    
    if (password !== null) {
        userData.Password = password;
    }
    
    if (currentUserId) {
        // Update existing user
        if (updateUser(currentUserId, userData)) {
            // Update user roles
            updateUserRoles(currentUserId, selectedRoles);
            showNotification('تم بنجاح', 'تم تحديث المستخدم بنجاح', 'success');
        } else {
            showNotification('خطأ', 'فشل في تحديث المستخدم', 'error');
        }
    } else {
        // Add new user
        const newUserId = addUser(userData);
        if (newUserId) {
            // Add user roles
            updateUserRoles(newUserId, selectedRoles);
            showNotification('تم بنجاح', 'تم إضافة المستخدم بنجاح', 'success');
        } else {
            showNotification('خطأ', 'فشل في إضافة المستخدم', 'error');
        }
    }
    
    resetUserForm();
    loadUsersTable();
}

// Update user roles
function updateUserRoles(userId, selectedRoleIds) {
    // Get current user role mappings
    const userRoleMappings = getAllUserRoleMappings();
    const currentRoleMappings = userRoleMappings.filter(mapping => mapping.UserID === userId);
    const currentRoleIds = currentRoleMappings.map(mapping => mapping.RoleID);
    
    // Add new roles
    selectedRoleIds.forEach(roleId => {
        if (!currentRoleIds.includes(roleId)) {
            addUserRoleMapping(userId, roleId);
        }
    });
    
    // Remove unselected roles
    currentRoleIds.forEach(roleId => {
        if (!selectedRoleIds.includes(roleId)) {
            removeUserRoleMapping(userId, roleId);
        }
    });
}

// Edit user
function editUser(userId) {
    const user = getUserById(userId);
    if (!user) {
        showNotification('خطأ', 'المستخدم غير موجود', 'error');
        return;
    }
    
    // Set form values
    document.getElementById('user-username').value = user.Username;
    document.getElementById('user-fullname').value = user.FullName;
    document.getElementById('user-email').value = user.Email;
    document.getElementById('user-is-active').checked = user.IsActive === 1;
    
    // Reset password fields
    document.getElementById('change-password-checkbox').checked = false;
    document.getElementById('password-fields').classList.add('d-none');
    document.getElementById('user-password').required = false;
    document.getElementById('user-confirm-password').required = false;
    document.getElementById('user-password').value = '';
    document.getElementById('user-confirm-password').value = '';
    
    // Show password change section
    document.getElementById('password-change-section').classList.remove('d-none');
    
    // Set selected roles
    const userRoles = getUserRoles(userId);
    const userRoleIds = userRoles.map(role => role.RoleID);
    
    document.querySelectorAll('.role-checkbox').forEach(checkbox => {
        checkbox.checked = userRoleIds.includes(parseInt(checkbox.value));
    });
    
    // Update form title and save button text
    document.getElementById('user-form-title').textContent = 'تعديل مستخدم';
    document.getElementById('save-btn').textContent = 'تحديث';
    
    // Set current user ID
    currentUserId = userId;
    
    // Scroll to form
    document.getElementById('user-form-card').scrollIntoView({ behavior: 'smooth' });
}

// Reset user form
function resetUserForm() {
    resetForm('user-form');
    
    // Reset form title and save button text
    document.getElementById('user-form-title').textContent = 'إضافة مستخدم جديد';
    document.getElementById('save-btn').textContent = 'حفظ';
    
    // Set default values
    document.getElementById('user-is-active').checked = true;
    
    // Reset password fields
    document.getElementById('password-change-section').classList.add('d-none');
    document.getElementById('password-fields').classList.remove('d-none');
    document.getElementById('user-password').required = true;
    document.getElementById('user-confirm-password').required = true;
    
    // Clear role checkboxes
    document.querySelectorAll('.role-checkbox').forEach(checkbox => {
        checkbox.checked = false;
    });
    
    // Reset current user ID
    currentUserId = null;
}

// Confirm delete user
function confirmDeleteUser(userId) {
    const user = getUserById(userId);
    if (!user) {
        showNotification('خطأ', 'المستخدم غير موجود', 'error');
        return;
    }
    
    // Check if user is the current user
    if (app.currentUser && app.currentUser.UserID === userId) {
        showNotification('تحذير', 'لا يمكنك حذف حسابك الحالي', 'warning');
        return;
    }
    
    // Check if user is linked to an employee
    const employee = getEmployeeByUserID(userId);
    if (employee) {
        showNotification('تحذير', 'لا يمكن حذف المستخدم لأنه مرتبط بموظف', 'warning');
        return;
    }
    
    createConfirmationModal(
        'تأكيد الحذف',
        `هل أنت متأكد من حذف المستخدم "${user.Username}"؟`,
        () => {
            if (deleteUser(userId)) {
                showNotification('تم بنجاح', 'تم حذف المستخدم بنجاح', 'success');
                loadUsersTable();
            } else {
                showNotification('خطأ', 'فشل في حذف المستخدم', 'error');
            }
        }
    );
}

// Activate user
function activateUser(userId) {
    const user = getUserById(userId);
    if (!user) {
        showNotification('خطأ', 'المستخدم غير موجود', 'error');
        return;
    }
    
    if (updateUser(userId, { IsActive: 1 })) {
        showNotification('تم بنجاح', 'تم تنشيط المستخدم بنجاح', 'success');
        loadUsersTable();
    } else {
        showNotification('خطأ', 'فشل في تنشيط المستخدم', 'error');
    }
}

// Initialize profile page
function initProfile() {
    const user = app.currentUser;
    const employee = getEmployeeByUserID(user.UserID);
    
    document.getElementById('profile-username').textContent = user.Username;
    document.getElementById('profile-email').textContent = user.Email;
    document.getElementById('profile-fullname').textContent = user.FullName;
    
    if (employee) {
        document.getElementById('profile-employee-info').classList.remove('d-none');
        document.getElementById('profile-employee-number').textContent = employee.EmployeeNumber;
        document.getElementById('profile-position').textContent = employee.Position || '-';
        
        const department = getDepartmentById(employee.DepartmentID);
        document.getElementById('profile-department').textContent = department ? department.DepartmentName : '-';
        
        if (employee.HireDate) {
            document.getElementById('profile-hire-date').textContent = formatDate(employee.HireDate);
        } else {
            document.getElementById('profile-hire-date').textContent = '-';
        }
        
        // Show manager if exists
        if (employee.ManagerID) {
            const manager = getEmployeeById(employee.ManagerID);
            if (manager) {
                document.getElementById('profile-manager').textContent = manager.FullName;
            } else {
                document.getElementById('profile-manager').textContent = '-';
            }
        } else {
            document.getElementById('profile-manager').textContent = '-';
        }
    } else {
        document.getElementById('profile-employee-info').classList.add('d-none');
    }
    
    // Show user roles
    const userRoles = getUserRoles(user.UserID);
    const rolesContainer = document.getElementById('profile-roles');
    rolesContainer.innerHTML = '';
    
    userRoles.forEach(role => {
        const badge = document.createElement('span');
        badge.className = 'badge bg-info me-1';
        badge.textContent = role.RoleName;
        rolesContainer.appendChild(badge);
    });
}

// Initialize change password functionality
function initChangePassword() {
    const changePasswordForm = document.getElementById('change-password-form');
    
    changePasswordForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const currentPassword = document.getElementById('current-password').value;
        const newPassword = document.getElementById('new-password').value;
        const confirmPassword = document.getElementById('confirm-password').value;
        
        // Validate password
        if (newPassword !== confirmPassword) {
            showNotification('خطأ', 'كلمة المرور الجديدة وتأكيدها غير متطابقين', 'error');
            return;
        }
        
        // Validate current password
        if (app.currentUser.Password !== currentPassword) {
            showNotification('خطأ', 'كلمة المرور الحالية غير صحيحة', 'error');
            return;
        }
        
        // Update password
        updateUserPassword(app.currentUser.UserID, newPassword);
        showNotification('تم بنجاح', 'تم تغيير كلمة المرور بنجاح', 'success');
        
        // Clear form
        changePasswordForm.reset();
    });
}
