/**
 * Authentication Module
 * Handles user login, logout, and session management
 */

// Initialize login page
function initLoginPage() {
    const loginForm = document.getElementById('login-form');
    
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value;
        
        // Validate login
        if (validateLogin(username, password)) {
            const user = getUserByUsername(username);
            
            // Set global user info
            app.currentUser = user;
            app.isAuthenticated = true;
            
            // Update UI
            document.getElementById('current-user-name').textContent = user.FullName;
            
            // Show/hide menu items based on user role
            updateMenuVisibility();
            
            // Redirect to dashboard
            window.location.hash = '/dashboard';
            
            showNotification('مرحباً', `تم تسجيل الدخول بنجاح، مرحباً ${user.FullName}`, 'success');
        } else {
            showNotification('خطأ في تسجيل الدخول', 'اسم المستخدم أو كلمة المرور غير صحيحة', 'error');
        }
    });
}

// Validate user login
function validateLogin(username, password) {
    const users = getAllUsers();
    const user = users.find(u => u.Username === username && u.Password === password && u.IsActive === 1);
    return !!user;
}

// Logout current user
function logout() {
    app.currentUser = null;
    app.isAuthenticated = false;
    window.location.hash = '/login';
    showNotification('تسجيل الخروج', 'تم تسجيل الخروج بنجاح', 'info');
}

// Get user roles by userId
function getUserRoles(userId) {
    const userRoleMappings = getAllUserRoleMappings();
    const userRoleIds = userRoleMappings
        .filter(mapping => mapping.UserID === userId)
        .map(mapping => mapping.RoleID);
    
    const allRoles = getAllUserRoles();
    return allRoles.filter(role => userRoleIds.includes(role.RoleID));
}

// Check if user has specific role
function hasRole(userId, roleName) {
    const userRoles = getUserRoles(userId);
    return userRoles.some(role => role.RoleName === roleName);
}

// Check if current user is admin
function isAdmin() {
    return hasRole(app.currentUser.UserID, 'Administrator');
}

// Check if current user is HR manager
function isHRManager() {
    return hasRole(app.currentUser.UserID, 'HR Manager');
}

// Check if current user is department manager
function isDepartmentManager() {
    return hasRole(app.currentUser.UserID, 'Department Manager');
}

// Update menu visibility based on user role
function updateMenuVisibility() {
    const isAdminUser = isAdmin();
    const isHRUser = isHRManager();
    const isManagerUser = isDepartmentManager();
    
    // Admin & HR only menus
    document.querySelectorAll('.admin-hr-only').forEach(element => {
        if (isAdminUser || isHRUser) {
            element.classList.remove('d-none');
        } else {
            element.classList.add('d-none');
        }
    });
    
    // Admin only menus
    document.querySelectorAll('.admin-only').forEach(element => {
        if (isAdminUser) {
            element.classList.remove('d-none');
        } else {
            element.classList.add('d-none');
        }
    });
    
    // Admin, HR, and Manager menus
    document.querySelectorAll('.admin-hr-manager-only').forEach(element => {
        if (isAdminUser || isHRUser || isManagerUser) {
            element.classList.remove('d-none');
        } else {
            element.classList.add('d-none');
        }
    });
}

// Get employee record for current user
function getCurrentEmployee() {
    if (!app.currentUser) return null;
    return getEmployeeByUserID(app.currentUser.UserID);
}

// Update user password
function updateUserPassword(userId, newPassword) {
    const users = getAllUsers();
    const userIndex = users.findIndex(u => u.UserID === userId);
    
    if (userIndex !== -1) {
        users[userIndex].Password = newPassword;
        users[userIndex].UpdatedAt = new Date().toISOString();
        
        // Update local storage
        localStorage.setItem('users', JSON.stringify(users));
        
        // If this is the current user, update app state
        if (app.currentUser && app.currentUser.UserID === userId) {
            app.currentUser = users[userIndex];
        }
        
        return true;
    }
    
    return false;
}
