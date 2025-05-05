/**
 * Main Application Controller
 * Handles routing and application initialization
 */

// Global application state
const app = {
    currentUser: null,
    isAuthenticated: false,
    currentRoute: '',
    routes: {
        '': 'login',
        '/': 'login',
        '/login': 'login',
        '/dashboard': 'dashboard',
        '/departments': 'departments',
        '/employees': 'employees',
        '/evaluations': 'evaluations',
        '/criteria': 'criteria',
        '/periods': 'periods',
        '/reports': 'reports',
        '/users': 'users',
        '/profile': 'profile',
        '/change-password': 'changePassword'
    },
    // Role-based access control
    routeAccess: {
        'login': ['all'],
        'dashboard': ['Administrator', 'HR Manager', 'Department Manager', 'Employee'],
        'departments': ['Administrator', 'HR Manager'],
        'employees': ['Administrator', 'HR Manager'],
        'evaluations': ['Administrator', 'HR Manager', 'Department Manager'],
        'criteria': ['Administrator', 'HR Manager'],
        'periods': ['Administrator', 'HR Manager'],
        'reports': ['Administrator', 'HR Manager', 'Department Manager'],
        'users': ['Administrator'],
        'profile': ['Administrator', 'HR Manager', 'Department Manager', 'Employee'],
        'changePassword': ['Administrator', 'HR Manager', 'Department Manager', 'Employee']
    }
};

// Initialize application
document.addEventListener('DOMContentLoaded', () => {
    // Initialize data store first
    initializeDataStore().then(() => {
        // Setup event listeners
        setupEventListeners();
        
        // Navigate to current route based on hash
        navigateToRoute();
        
        // Hide loading screen
        document.getElementById('loading').classList.add('d-none');
    });
});

// Setup global event listeners
function setupEventListeners() {
    // Handle hash change for routing
    window.addEventListener('hashchange', navigateToRoute);
    
    // Logout button event listener
    document.getElementById('logout-btn').addEventListener('click', (e) => {
        e.preventDefault();
        logout();
    });
}

// Navigation function
function navigateToRoute() {
    const hash = window.location.hash.substring(1) || '/';
    app.currentRoute = hash;
    
    const routeName = app.routes[hash] || '404';
    
    // Check authentication
    if (!app.isAuthenticated && routeName !== 'login') {
        window.location.hash = '/login';
        return;
    }
    
    // If authenticated and trying to access login page, redirect to dashboard
    if (app.isAuthenticated && routeName === 'login') {
        window.location.hash = '/dashboard';
        return;
    }
    
    // Check permissions for the route if user is authenticated
    if (app.isAuthenticated && !hasAccessToRoute(routeName)) {
        showNotification('خطأ في الصلاحيات', 'ليس لديك صلاحية للوصول إلى هذه الصفحة', 'error');
        window.location.hash = '/dashboard';
        return;
    }
    
    // Render the appropriate page
    loadPage(routeName);
}

// Load page content
function loadPage(pageName) {
    const contentContainer = document.getElementById('content-container');
    
    if (pageName === 'login') {
        document.getElementById('login-container').classList.remove('d-none');
        document.getElementById('main-container').classList.add('d-none');
        
        // Load login page
        fetch('pages/login.html')
            .then(response => response.text())
            .then(html => {
                document.getElementById('login-container').innerHTML = html;
                initLoginPage();
            })
            .catch(error => {
                console.error('Error loading login page:', error);
                showNotification('خطأ', 'فشل في تحميل صفحة تسجيل الدخول', 'error');
            });
    } else {
        document.getElementById('login-container').classList.add('d-none');
        document.getElementById('main-container').classList.remove('d-none');
        
        // Set active nav link
        setActiveNavLink(pageName);
        
        // Load page content
        if (pageName === '404') {
            contentContainer.innerHTML = `
                <div class="alert alert-danger">
                    <h4>خطأ 404</h4>
                    <p>الصفحة المطلوبة غير موجودة</p>
                    <a href="#/dashboard" class="btn btn-primary">الرجوع للرئيسية</a>
                </div>
            `;
            return;
        }
        
        fetch(`pages/${pageName}.html`)
            .then(response => response.text())
            .then(html => {
                contentContainer.innerHTML = html;
                
                // Initialize specific page functionality
                switch(pageName) {
                    case 'dashboard':
                        initDashboard();
                        break;
                    case 'departments':
                        initDepartments();
                        break;
                    case 'employees':
                        initEmployees();
                        break;
                    case 'evaluations':
                        initEvaluations();
                        break;
                    case 'criteria':
                        initCriteria();
                        break;
                    case 'periods':
                        initPeriods();
                        break;
                    case 'reports':
                        initReports();
                        break;
                    case 'users':
                        initUsers();
                        break;
                    case 'profile':
                        initProfile();
                        break;
                    case 'changePassword':
                        initChangePassword();
                        break;
                }
            })
            .catch(error => {
                console.error(`Error loading ${pageName} page:`, error);
                showNotification('خطأ', `فشل في تحميل الصفحة`, 'error');
            });
    }
}

// Set active navigation link
function setActiveNavLink(pageName) {
    // Remove active class from all links
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
    });
    
    // Add active class to current page link
    const activeLink = document.querySelector(`.nav-link[href="#/${pageName}"]`);
    if (activeLink) {
        activeLink.classList.add('active');
    }
}

// Check if user has access to route
function hasAccessToRoute(routeName) {
    const routeRoles = app.routeAccess[routeName];
    
    if (!routeRoles) return false;
    if (routeRoles.includes('all')) return true;
    
    const userRoles = getUserRoles(app.currentUser.UserID);
    return userRoles.some(role => routeRoles.includes(role.RoleName));
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
