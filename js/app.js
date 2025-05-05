/**
 * Main Application Controller
 * Handles routing and application initialization
 */

// Global application state
const app = {
    currentUser: null,
    isAuthenticated: false,
    currentRoute: '',
    pageCache: {}, // Cache for storing page HTML content
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

// Preloaded page templates
const PAGE_TEMPLATES = {
    'dashboard': `<div class="container-fluid">
    <div class="row mb-4">
        <div class="col-12">
            <h2 class="mb-4">
                <i class="fas fa-tachometer-alt me-2"></i> لوحة التحكم
            </h2>
        </div>
    </div>
    
    <!-- Statistics Cards -->
    <div class="row mb-4">
        <div class="col-md-6 col-xl-3 mb-3">
            <div class="card stat-card">
                <div class="card-body">
                    <div class="stat-icon bg-primary">
                        <i class="fas fa-building"></i>
                    </div>
                    <div class="stat-info">
                        <h3 class="stat-value" id="stat-departments">0</h3>
                        <p class="stat-label">الأقسام</p>
                    </div>
                </div>
            </div>
        </div>
        <div class="col-md-6 col-xl-3 mb-3">
            <div class="card stat-card">
                <div class="card-body">
                    <div class="stat-icon bg-success">
                        <i class="fas fa-users"></i>
                    </div>
                    <div class="stat-info">
                        <h3 class="stat-value" id="stat-employees">0</h3>
                        <p class="stat-label">الموظفين</p>
                    </div>
                </div>
            </div>
        </div>
        <div class="col-md-6 col-xl-3 mb-3">
            <div class="card stat-card">
                <div class="card-body">
                    <div class="stat-icon bg-warning">
                        <i class="fas fa-clipboard-check"></i>
                    </div>
                    <div class="stat-info">
                        <h3 class="stat-value" id="stat-completed-evaluations">0</h3>
                        <p class="stat-label">التقييمات المكتملة</p>
                    </div>
                </div>
            </div>
        </div>
        <div class="col-md-6 col-xl-3 mb-3">
            <div class="card stat-card">
                <div class="card-body">
                    <div class="stat-icon bg-danger">
                        <i class="fas fa-hourglass-half"></i>
                    </div>
                    <div class="stat-info">
                        <h3 class="stat-value" id="stat-pending-evaluations">0</h3>
                        <p class="stat-label">التقييمات قيد الإنجاز</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
    
    <!-- Current Evaluation Period -->
    <div class="row mb-4">
        <div class="col-12">
            <div class="card">
                <div class="card-body">
                    <h5 class="card-title">
                        <i class="fas fa-calendar-alt me-2"></i> فترة التقييم الحالية
                    </h5>
                    <div id="no-active-period" class="alert alert-warning d-none">
                        <i class="fas fa-exclamation-triangle me-2"></i> لا توجد فترة تقييم نشطة حالياً.
                    </div>
                    <div id="active-period-info">
                        <div class="row">
                            <div class="col-md-6">
                                <p class="mb-2">
                                    <strong>الفترة:</strong> 
                                    <span id="active-period-name"></span>
                                </p>
                            </div>
                            <div class="col-md-6">
                                <p class="mb-2">
                                    <strong>التاريخ:</strong> 
                                    <span id="active-period-dates"></span>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    
    <!-- Department Statistics (Only visible for department managers) -->
    <div id="department-stats-card" class="row mb-4 d-none">
        <div class="col-12">
            <div class="card">
                <div class="card-body">
                    <h5 class="card-title">
                        <i class="fas fa-chart-pie me-2"></i> إحصائيات القسم
                    </h5>
                    <div class="row">
                        <div class="col-md-3">
                            <div class="mb-3">
                                <p class="mb-1">عدد الموظفين</p>
                                <h3 id="dept-employees-count">0</h3>
                            </div>
                        </div>
                        <div class="col-md-3">
                            <div class="mb-3">
                                <p class="mb-1">التقييمات المكتملة</p>
                                <h3 id="dept-completed-count">0</h3>
                            </div>
                        </div>
                        <div class="col-md-3">
                            <div class="mb-3">
                                <p class="mb-1">التقييمات المعلقة</p>
                                <h3 id="dept-pending-count">0</h3>
                            </div>
                        </div>
                        <div class="col-md-3">
                            <div class="mb-3">
                                <p class="mb-1">نسبة الإكتمال</p>
                                <h3 id="dept-completion-percentage">0%</h3>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    
    <!-- Charts -->
    <div class="row mb-4">
        <div class="col-md-6 mb-4">
            <div class="card h-100">
                <div class="card-body">
                    <h5 class="card-title">
                        <i class="fas fa-users me-2"></i> الموظفين حسب القسم
                    </h5>
                    <div class="chart-container">
                        <canvas id="employeesByDepartmentChart"></canvas>
                    </div>
                </div>
            </div>
        </div>
        <div class="col-md-6 mb-4">
            <div class="card h-100">
                <div class="card-body">
                    <h5 class="card-title">
                        <i class="fas fa-chart-pie me-2"></i> حالة التقييمات
                    </h5>
                    <div class="chart-container">
                        <canvas id="evaluationStatusChart"></canvas>
                    </div>
                </div>
            </div>
        </div>
    </div>
    
    <!-- Recent Evaluations -->
    <div class="row">
        <div class="col-12">
            <div class="card">
                <div class="card-body">
                    <h5 class="card-title">
                        <i class="fas fa-history me-2"></i> آخر التقييمات
                    </h5>
                    <div class="table-responsive">
                        <table class="table table-striped">
                            <thead>
                                <tr>
                                    <th>الموظف</th>
                                    <th>المقيم</th>
                                    <th>الفترة</th>
                                    <th>الحالة</th>
                                    <th>الدرجة</th>
                                </tr>
                            </thead>
                            <tbody id="recent-evaluations-body">
                                <tr>
                                    <td colspan="5" class="text-center">جاري تحميل البيانات...</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>`,
    
    'departments': `<div class="container-fluid">
    <div class="row mb-4">
        <div class="col-12 d-flex justify-content-between align-items-center">
            <h2>
                <i class="fas fa-building me-2"></i> الأقسام
            </h2>
            <button id="add-department-btn" class="btn btn-primary">
                <i class="fas fa-plus me-2"></i> إضافة قسم جديد
            </button>
        </div>
    </div>
    
    <div class="row">
        <div class="col-12">
            <div class="card">
                <div class="card-body">
                    <div class="d-flex justify-content-between align-items-center mb-3">
                        <div class="form-group mb-0">
                            <div class="input-group">
                                <span class="input-group-text"><i class="fas fa-search"></i></span>
                                <input type="text" id="departments-search" class="form-control" placeholder="البحث في الأقسام...">
                            </div>
                        </div>
                    </div>
                    
                    <div class="table-responsive">
                        <table class="table table-striped table-hover">
                            <thead>
                                <tr>
                                    <th>الرقم</th>
                                    <th>اسم القسم</th>
                                    <th>المدير</th>
                                    <th>عدد الموظفين</th>
                                    <th>الوصف</th>
                                    <th>الإجراءات</th>
                                </tr>
                            </thead>
                            <tbody id="departments-table-body">
                                <tr>
                                    <td colspan="6" class="text-center">جاري تحميل البيانات...</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    
                    <!-- Pagination -->
                    <div id="departments-pagination" class="mt-3"></div>
                </div>
            </div>
        </div>
    </div>
    
    <!-- Department Modal -->
    <div class="modal fade" id="department-modal" tabindex="-1" aria-hidden="true">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="department-modal-title">إضافة قسم جديد</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <form id="department-form">
                        <input type="hidden" id="department-id">
                        
                        <div class="mb-3">
                            <label for="department-name" class="form-label">اسم القسم <span class="text-danger">*</span></label>
                            <input type="text" class="form-control" id="department-name" required>
                        </div>
                        
                        <div class="mb-3">
                            <label for="department-manager" class="form-label">مدير القسم</label>
                            <select class="form-select" id="department-manager">
                                <option value="">-- اختر مدير القسم --</option>
                            </select>
                        </div>
                        
                        <div class="mb-3">
                            <label for="department-description" class="form-label">وصف القسم</label>
                            <textarea class="form-control" id="department-description" rows="3"></textarea>
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">إلغاء</button>
                    <button type="button" class="btn btn-primary" id="save-department-btn">حفظ</button>
                </div>
            </div>
        </div>
    </div>
    
    <!-- Delete Confirmation Modal -->
    <div class="modal fade" id="delete-department-modal" tabindex="-1" aria-hidden="true">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">تأكيد الحذف</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <p>هل أنت متأكد من حذف هذا القسم؟</p>
                    <p class="text-danger">تنبيه: سيتم حذف القسم وكل البيانات المرتبطة به.</p>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">إلغاء</button>
                    <button type="button" class="btn btn-danger" id="confirm-delete-department-btn">نعم، حذف</button>
                </div>
            </div>
        </div>
    </div>
</div>`,

    'employees': `<div class="container-fluid">
    <div class="row mb-4">
        <div class="col-12 d-flex justify-content-between align-items-center">
            <h2>
                <i class="fas fa-users me-2"></i> الموظفين
            </h2>
            <button id="add-employee-btn" class="btn btn-primary">
                <i class="fas fa-user-plus me-2"></i> إضافة موظف جديد
            </button>
        </div>
    </div>
    
    <div class="row">
        <div class="col-12">
            <div class="card">
                <div class="card-body">
                    <div class="d-flex flex-wrap justify-content-between align-items-center mb-3">
                        <div class="form-group mb-2 me-2">
                            <div class="input-group">
                                <span class="input-group-text"><i class="fas fa-search"></i></span>
                                <input type="text" id="employees-search" class="form-control" placeholder="البحث...">
                            </div>
                        </div>
                        
                        <div class="d-flex flex-wrap">
                            <div class="form-group mb-2 me-2">
                                <select id="department-filter" class="form-select">
                                    <option value="">جميع الأقسام</option>
                                </select>
                            </div>
                            
                            <div class="form-group mb-2">
                                <button id="export-employees-btn" class="btn btn-outline-secondary">
                                    <i class="fas fa-file-export me-2"></i> تصدير
                                </button>
                            </div>
                        </div>
                    </div>
                    
                    <div class="table-responsive">
                        <table class="table table-striped table-hover">
                            <thead>
                                <tr>
                                    <th>الرقم الوظيفي</th>
                                    <th>الاسم</th>
                                    <th>البريد الإلكتروني</th>
                                    <th>القسم</th>
                                    <th>المسمى الوظيفي</th>
                                    <th>المدير المباشر</th>
                                    <th>تاريخ التعيين</th>
                                    <th>الإجراءات</th>
                                </tr>
                            </thead>
                            <tbody id="employees-table-body">
                                <tr>
                                    <td colspan="8" class="text-center">جاري تحميل البيانات...</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    
                    <!-- Pagination -->
                    <div id="employees-pagination" class="mt-3"></div>
                </div>
            </div>
        </div>
    </div>
    
    <!-- Employee Modal -->
    <div class="modal fade" id="employee-modal" tabindex="-1" aria-hidden="true">
        <div class="modal-dialog modal-lg">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="employee-modal-title">إضافة موظف جديد</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <form id="employee-form">
                        <input type="hidden" id="employee-id">
                        
                        <div class="row">
                            <div class="col-md-6">
                                <div class="mb-3">
                                    <label for="employee-number" class="form-label">الرقم الوظيفي <span class="text-danger">*</span></label>
                                    <input type="text" class="form-control" id="employee-number" required>
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="mb-3">
                                    <label for="employee-user" class="form-label">حساب المستخدم <span class="text-danger">*</span></label>
                                    <select class="form-select" id="employee-user" required>
                                        <option value="">-- اختر حساب المستخدم --</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        
                        <div class="row">
                            <div class="col-md-6">
                                <div class="mb-3">
                                    <label for="employee-department" class="form-label">القسم <span class="text-danger">*</span></label>
                                    <select class="form-select" id="employee-department" required>
                                        <option value="">-- اختر القسم --</option>
                                    </select>
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="mb-3">
                                    <label for="employee-position" class="form-label">المسمى الوظيفي <span class="text-danger">*</span></label>
                                    <input type="text" class="form-control" id="employee-position" required>
                                </div>
                            </div>
                        </div>
                        
                        <div class="row">
                            <div class="col-md-6">
                                <div class="mb-3">
                                    <label for="employee-manager" class="form-label">المدير المباشر</label>
                                    <select class="form-select" id="employee-manager">
                                        <option value="">-- اختر المدير المباشر --</option>
                                    </select>
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="mb-3">
                                    <label for="employee-hire-date" class="form-label">تاريخ التعيين <span class="text-danger">*</span></label>
                                    <input type="date" class="form-control" id="employee-hire-date" required>
                                </div>
                            </div>
                        </div>
                        
                        <div class="mb-3">
                            <label for="employee-notes" class="form-label">ملاحظات</label>
                            <textarea class="form-control" id="employee-notes" rows="3"></textarea>
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">إلغاء</button>
                    <button type="button" class="btn btn-primary" id="save-employee-btn">حفظ</button>
                </div>
            </div>
        </div>
    </div>
    
    <!-- View Employee Modal -->
    <div class="modal fade" id="view-employee-modal" tabindex="-1" aria-hidden="true">
        <div class="modal-dialog modal-lg">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">بيانات الموظف</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <div class="row">
                        <div class="col-md-6">
                            <p><strong>الرقم الوظيفي:</strong> <span id="view-employee-number"></span></p>
                            <p><strong>الاسم:</strong> <span id="view-employee-name"></span></p>
                            <p><strong>البريد الإلكتروني:</strong> <span id="view-employee-email"></span></p>
                            <p><strong>المسمى الوظيفي:</strong> <span id="view-employee-position"></span></p>
                        </div>
                        <div class="col-md-6">
                            <p><strong>القسم:</strong> <span id="view-employee-department"></span></p>
                            <p><strong>المدير المباشر:</strong> <span id="view-employee-manager"></span></p>
                            <p><strong>تاريخ التعيين:</strong> <span id="view-employee-hire-date"></span></p>
                        </div>
                    </div>
                    
                    <div class="mt-4">
                        <h6>ملاحظات</h6>
                        <p id="view-employee-notes">-</p>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">إغلاق</button>
                </div>
            </div>
        </div>
    </div>
    
    <!-- Delete Confirmation Modal -->
    <div class="modal fade" id="delete-employee-modal" tabindex="-1" aria-hidden="true">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">تأكيد الحذف</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <p>هل أنت متأكد من حذف هذا الموظف؟</p>
                    <p class="text-danger">تنبيه: سيتم حذف بيانات الموظف وكل التقييمات المرتبطة به.</p>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">إلغاء</button>
                    <button type="button" class="btn btn-danger" id="confirm-delete-employee-btn">نعم، حذف</button>
                </div>
            </div>
        </div>
    </div>
</div>`,

    'evaluations': `<div class="container-fluid">
    <!-- ... محتوى صفحة التقييمات ... -->
    <div class="row mb-4">
        <div class="col-12 d-flex justify-content-between align-items-center">
            <h2>
                <i class="fas fa-clipboard-check me-2"></i> التقييمات
            </h2>
            <button id="add-evaluation-btn" class="btn btn-primary">
                <i class="fas fa-plus me-2"></i> إضافة تقييم جديد
            </button>
        </div>
    </div>
    
    <div class="row">
        <div class="col-12">
            <div class="card">
                <div class="card-body">
                    <div class="d-flex flex-wrap justify-content-between align-items-center mb-3">
                        <div class="form-group mb-2 me-2">
                            <div class="input-group">
                                <span class="input-group-text"><i class="fas fa-search"></i></span>
                                <input type="text" id="evaluations-search" class="form-control" placeholder="البحث...">
                            </div>
                        </div>
                        
                        <div class="d-flex flex-wrap">
                            <div class="form-group mb-2 me-2">
                                <select id="period-filter" class="form-select">
                                    <option value="">جميع الفترات</option>
                                </select>
                            </div>
                            
                            <div class="form-group mb-2 me-2">
                                <select id="status-filter" class="form-select">
                                    <option value="">جميع الحالات</option>
                                </select>
                            </div>
                            
                            <div class="form-group mb-2 me-2">
                                <select id="department-filter" class="form-select">
                                    <option value="">جميع الأقسام</option>
                                </select>
                            </div>
                            
                            <div class="form-group mb-2">
                                <button id="export-evaluations-btn" class="btn btn-outline-secondary">
                                    <i class="fas fa-file-export me-2"></i> تصدير
                                </button>
                            </div>
                        </div>
                    </div>
                    
                    <div class="table-responsive">
                        <table class="table table-striped table-hover">
                            <thead>
                                <tr>
                                    <th>رقم التقييم</th>
                                    <th>الموظف</th>
                                    <th>المقيم</th>
                                    <th>الفترة</th>
                                    <th>تاريخ البدء</th>
                                    <th>تاريخ الانتهاء</th>
                                    <th>الحالة</th>
                                    <th>الدرجة</th>
                                    <th>الإجراءات</th>
                                </tr>
                            </thead>
                            <tbody id="evaluations-table-body">
                                <tr>
                                    <td colspan="9" class="text-center">جاري تحميل البيانات...</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    
                    <!-- Pagination -->
                    <div id="evaluations-pagination" class="mt-3"></div>
                </div>
            </div>
        </div>
    </div>
</div>`,

    'criteria': `<div class="container-fluid">
    <!-- ... محتوى صفحة معايير التقييم ... -->
    <div class="row mb-4">
        <div class="col-12 d-flex justify-content-between align-items-center">
            <h2>
                <i class="fas fa-list-check me-2"></i> معايير التقييم
            </h2>
            <button id="add-criteria-btn" class="btn btn-primary">
                <i class="fas fa-plus me-2"></i> إضافة معيار جديد
            </button>
        </div>
    </div>
    
    <div class="row">
        <div class="col-12">
            <div class="card">
                <div class="card-body">
                    <div class="table-responsive">
                        <table class="table table-striped table-hover">
                            <thead>
                                <tr>
                                    <th width="5%">#</th>
                                    <th width="20%">المعيار</th>
                                    <th width="35%">الوصف</th>
                                    <th width="10%">الوزن</th>
                                    <th width="15%">نشط</th>
                                    <th width="15%">الإجراءات</th>
                                </tr>
                            </thead>
                            <tbody id="criteria-table-body">
                                <tr>
                                    <td colspan="6" class="text-center">جاري تحميل البيانات...</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>`,

    'periods': `<div class="container-fluid">
    <!-- ... محتوى صفحة فترات التقييم ... -->
    <div class="row mb-4">
        <div class="col-12 d-flex justify-content-between align-items-center">
            <h2>
                <i class="fas fa-calendar-alt me-2"></i> فترات التقييم
            </h2>
            <button id="add-period-btn" class="btn btn-primary">
                <i class="fas fa-plus me-2"></i> إضافة فترة جديدة
            </button>
        </div>
    </div>
    
    <div class="row">
        <div class="col-12">
            <div class="card">
                <div class="card-body">
                    <div class="table-responsive">
                        <table class="table table-striped table-hover">
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>اسم الفترة</th>
                                    <th>تاريخ البداية</th>
                                    <th>تاريخ النهاية</th>
                                    <th>الحالة</th>
                                    <th>الوصف</th>
                                    <th>الإجراءات</th>
                                </tr>
                            </thead>
                            <tbody id="periods-table-body">
                                <tr>
                                    <td colspan="7" class="text-center">جاري تحميل البيانات...</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>`,

    'reports': `<div class="container-fluid">
    <!-- ... محتوى صفحة التقارير ... -->
    <div class="row mb-4">
        <div class="col-12">
            <h2>
                <i class="fas fa-chart-bar me-2"></i> التقارير
            </h2>
        </div>
    </div>
    
    <div class="row mb-4">
        <div class="col-12">
            <div class="card">
                <div class="card-body">
                    <h5 class="card-title">تصفية التقارير</h5>
                    
                    <div class="row">
                        <div class="col-md-4 mb-3">
                            <label for="report-period" class="form-label">فترة التقييم</label>
                            <select id="report-period" class="form-select">
                                <option value="">كل الفترات</option>
                            </select>
                        </div>
                        
                        <div class="col-md-4 mb-3">
                            <label for="report-department" class="form-label">القسم</label>
                            <select id="report-department" class="form-select">
                                <option value="">كل الأقسام</option>
                            </select>
                        </div>
                        
                        <div class="col-md-4 mb-3 d-flex align-items-end">
                            <button id="generate-report-btn" class="btn btn-primary w-100">
                                <i class="fas fa-sync-alt me-2"></i> إنشاء التقرير
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    
    <div class="row">
        <div class="col-12">
            <div id="report-container">
                <div class="alert alert-info">
                    <i class="fas fa-info-circle me-2"></i> يرجى اختيار المعايير وإنشاء التقرير.
                </div>
            </div>
        </div>
    </div>
</div>`,

    'users': `<div class="container-fluid">
    <!-- ... محتوى صفحة المستخدمين ... -->
    <div class="row mb-4">
        <div class="col-12 d-flex justify-content-between align-items-center">
            <h2>
                <i class="fas fa-user-gear me-2"></i> المستخدمين
            </h2>
            <button id="add-user-btn" class="btn btn-primary">
                <i class="fas fa-user-plus me-2"></i> إضافة مستخدم جديد
            </button>
        </div>
    </div>
    
    <div class="row">
        <div class="col-12">
            <div class="card">
                <div class="card-body">
                    <div class="d-flex justify-content-between align-items-center mb-3">
                        <div class="form-group mb-0">
                            <div class="input-group">
                                <span class="input-group-text"><i class="fas fa-search"></i></span>
                                <input type="text" id="users-search" class="form-control" placeholder="البحث في المستخدمين...">
                            </div>
                        </div>
                    </div>
                    
                    <div class="table-responsive">
                        <table class="table table-striped table-hover">
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>اسم المستخدم</th>
                                    <th>الاسم الكامل</th>
                                    <th>البريد الإلكتروني</th>
                                    <th>الأدوار</th>
                                    <th>الحالة</th>
                                    <th>الإجراءات</th>
                                </tr>
                            </thead>
                            <tbody id="users-table-body">
                                <tr>
                                    <td colspan="7" class="text-center">جاري تحميل البيانات...</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    
                    <!-- Pagination -->
                    <div id="users-pagination" class="mt-3"></div>
                </div>
            </div>
        </div>
    </div>
</div>`,

    'profile': `<div class="container-fluid">
    <div class="row mb-4">
        <div class="col-12">
            <h2>
                <i class="fas fa-id-card me-2"></i> الملف الشخصي
            </h2>
        </div>
    </div>
    
    <div class="row">
        <div class="col-md-12">
            <div class="card">
                <div class="card-body">
                    <h5 class="card-title mb-4">معلومات المستخدم</h5>
                    
                    <div class="row">
                        <div class="col-md-6">
                            <p class="mb-3">
                                <strong>اسم المستخدم:</strong>
                                <span id="profile-username"></span>
                            </p>
                            <p class="mb-3">
                                <strong>البريد الإلكتروني:</strong>
                                <span id="profile-email"></span>
                            </p>
                            <p class="mb-3">
                                <strong>الاسم الكامل:</strong>
                                <span id="profile-fullname"></span>
                            </p>
                            <p class="mb-3">
                                <strong>الأدوار:</strong>
                                <span id="profile-roles"></span>
                            </p>
                        </div>
                        
                        <div class="col-md-6" id="profile-employee-info">
                            <p class="mb-3">
                                <strong>الرقم الوظيفي:</strong>
                                <span id="profile-employee-number"></span>
                            </p>
                            <p class="mb-3">
                                <strong>القسم:</strong>
                                <span id="profile-department"></span>
                            </p>
                            <p class="mb-3">
                                <strong>المسمى الوظيفي:</strong>
                                <span id="profile-position"></span>
                            </p>
                            <p class="mb-3">
                                <strong>تاريخ التعيين:</strong>
                                <span id="profile-hire-date"></span>
                            </p>
                            <p class="mb-3">
                                <strong>المدير المباشر:</strong>
                                <span id="profile-manager"></span>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>`,

    'changePassword': `<div class="container-fluid">
    <div class="row mb-4">
        <div class="col-12">
            <h2>
                <i class="fas fa-key me-2"></i> تغيير كلمة المرور
            </h2>
        </div>
    </div>
    
    <div class="row">
        <div class="col-md-6 mx-auto">
            <div class="card">
                <div class="card-body">
                    <form id="change-password-form">
                        <div class="mb-4">
                            <label for="current-password" class="form-label">كلمة المرور الحالية</label>
                            <div class="input-group">
                                <span class="input-group-text"><i class="fas fa-lock"></i></span>
                                <input type="password" class="form-control" id="current-password" required>
                            </div>
                        </div>
                        
                        <div class="mb-4">
                            <label for="new-password" class="form-label">كلمة المرور الجديدة</label>
                            <div class="input-group">
                                <span class="input-group-text"><i class="fas fa-key"></i></span>
                                <input type="password" class="form-control" id="new-password" required>
                            </div>
                            <div class="form-text">يجب أن تكون كلمة المرور 8 أحرف على الأقل وتحتوي على أحرف وأرقام ورموز.</div>
                        </div>
                        
                        <div class="mb-4">
                            <label for="confirm-password" class="form-label">تأكيد كلمة المرور الجديدة</label>
                            <div class="input-group">
                                <span class="input-group-text"><i class="fas fa-key"></i></span>
                                <input type="password" class="form-control" id="confirm-password" required>
                            </div>
                        </div>
                        
                        <div class="d-grid">
                            <button type="submit" class="btn btn-primary">
                                <i class="fas fa-save me-2"></i> حفظ التغييرات
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>
</div>`
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
        
        // Login page is already embedded in index.html
        initLoginPage();
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
        
        // Use preloaded templates for all pages
        if (PAGE_TEMPLATES[pageName]) {
            // Use the embedded template
            contentContainer.innerHTML = PAGE_TEMPLATES[pageName];
            
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
        } else {
            // Fallback for any missing templates
            contentContainer.innerHTML = `<div class="container"><h2>مرحباً في صفحة ${pageName}</h2><p class="mt-3">الصفحة غير متوفرة.</p></div>`;
            console.warn(`No template found for page: ${pageName}`);
        }
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
