/**
 * Data Management Module
 * Handles data storage, retrieval, and manipulation using localStorage
 */

// Initialize data store with starter data (if empty)
async function initializeDataStore() {
    // Only initialize if data doesn't exist
    if (!localStorage.getItem('initialized')) {
        console.log('Initializing data store with default data...');
        
        // Set up user roles
        const userRoles = [
            { RoleID: 1, RoleName: 'Administrator', Description: 'مسؤول النظام مع كامل الصلاحيات' },
            { RoleID: 2, RoleName: 'HR Manager', Description: 'مدير الموارد البشرية' },
            { RoleID: 3, RoleName: 'Department Manager', Description: 'مدير القسم' },
            { RoleID: 4, RoleName: 'Employee', Description: 'موظف عادي' }
        ];
        localStorage.setItem('userRoles', JSON.stringify(userRoles));
        
        // Set up evaluation statuses
        const evaluationStatuses = [
            { StatusID: 1, StatusName: 'Draft', Description: 'تقييم في حالة المسودة' },
            { StatusID: 2, StatusName: 'Submitted', Description: 'تم تقديم التقييم' },
            { StatusID: 3, StatusName: 'In Review', Description: 'قيد المراجعة' },
            { StatusID: 4, StatusName: 'Completed', Description: 'تم الانتهاء من التقييم' },
            { StatusID: 5, StatusName: 'Rejected', Description: 'تم رفض التقييم' }
        ];
        localStorage.setItem('evaluationStatuses', JSON.stringify(evaluationStatuses));
        
        // Set up users
        const users = [
            { UserID: 1, Username: 'admin', Password: 'P@ssw0rd123', Email: 'admin@company.com', FullName: 'مسؤول النظام', IsActive: 1, CreatedAt: new Date().toISOString(), UpdatedAt: new Date().toISOString() },
            { UserID: 2, Username: 'hr_manager', Password: 'P@ssw0rd123', Email: 'hr@company.com', FullName: 'مدير الموارد البشرية', IsActive: 1, CreatedAt: new Date().toISOString(), UpdatedAt: new Date().toISOString() },
            { UserID: 3, Username: 'it_manager', Password: 'P@ssw0rd123', Email: 'it.manager@company.com', FullName: 'مدير قسم تقنية المعلومات', IsActive: 1, CreatedAt: new Date().toISOString(), UpdatedAt: new Date().toISOString() },
            { UserID: 4, Username: 'finance_manager', Password: 'P@ssw0rd123', Email: 'finance.manager@company.com', FullName: 'مدير قسم المالية', IsActive: 1, CreatedAt: new Date().toISOString(), UpdatedAt: new Date().toISOString() },
            { UserID: 5, Username: 'hr_staff', Password: 'P@ssw0rd123', Email: 'hr.staff@company.com', FullName: 'موظف موارد بشرية', IsActive: 1, CreatedAt: new Date().toISOString(), UpdatedAt: new Date().toISOString() },
            { UserID: 6, Username: 'dev1', Password: 'P@ssw0rd123', Email: 'dev1@company.com', FullName: 'مطور برمجيات 1', IsActive: 1, CreatedAt: new Date().toISOString(), UpdatedAt: new Date().toISOString() },
            { UserID: 7, Username: 'dev2', Password: 'P@ssw0rd123', Email: 'dev2@company.com', FullName: 'مطور برمجيات 2', IsActive: 1, CreatedAt: new Date().toISOString(), UpdatedAt: new Date().toISOString() },
            { UserID: 8, Username: 'accountant1', Password: 'P@ssw0rd123', Email: 'accountant1@company.com', FullName: 'محاسب 1', IsActive: 1, CreatedAt: new Date().toISOString(), UpdatedAt: new Date().toISOString() },
            { UserID: 9, Username: 'accountant2', Password: 'P@ssw0rd123', Email: 'accountant2@company.com', FullName: 'محاسب 2', IsActive: 1, CreatedAt: new Date().toISOString(), UpdatedAt: new Date().toISOString() }
        ];
        localStorage.setItem('users', JSON.stringify(users));
        
        // Set up user role mappings
        const userRoleMappings = [
            { UserID: 1, RoleID: 1 }, // مسؤول النظام
            { UserID: 2, RoleID: 2 }, // مدير الموارد البشرية
            { UserID: 3, RoleID: 3 }, // مدير قسم تقنية المعلومات
            { UserID: 4, RoleID: 3 }, // مدير قسم المالية
            { UserID: 5, RoleID: 4 }, // موظف موارد بشرية
            { UserID: 6, RoleID: 4 }, // مطور برمجيات 1
            { UserID: 7, RoleID: 4 }, // مطور برمجيات 2
            { UserID: 8, RoleID: 4 }, // محاسب 1
            { UserID: 9, RoleID: 4 }  // محاسب 2
        ];
        localStorage.setItem('userRoleMappings', JSON.stringify(userRoleMappings));
        
        // Set up departments
        const departments = [
            { DepartmentID: 1, DepartmentName: 'الإدارة العليا', DepartmentCode: 'MGMT', Description: 'قسم الإدارة العليا والتنفيذية', CreatedAt: new Date().toISOString(), UpdatedAt: new Date().toISOString() },
            { DepartmentID: 2, DepartmentName: 'الموارد البشرية', DepartmentCode: 'HR', Description: 'قسم إدارة الموارد البشرية', CreatedAt: new Date().toISOString(), UpdatedAt: new Date().toISOString() },
            { DepartmentID: 3, DepartmentName: 'تقنية المعلومات', DepartmentCode: 'IT', Description: 'قسم البرمجة وتطوير الأنظمة', CreatedAt: new Date().toISOString(), UpdatedAt: new Date().toISOString() },
            { DepartmentID: 4, DepartmentName: 'المالية والمحاسبة', DepartmentCode: 'FIN', Description: 'قسم الشؤون المالية والمحاسبة', CreatedAt: new Date().toISOString(), UpdatedAt: new Date().toISOString() },
            { DepartmentID: 5, DepartmentName: 'المبيعات والتسويق', DepartmentCode: 'SALES', Description: 'قسم المبيعات وخدمة العملاء', CreatedAt: new Date().toISOString(), UpdatedAt: new Date().toISOString() }
        ];
        localStorage.setItem('departments', JSON.stringify(departments));
        
        // Set up employees
        const employees = [
            { EmployeeID: 1, EmployeeNumber: 'EMP001', FirstName: 'أحمد', LastName: 'الأحمد', DepartmentID: 1, Position: 'المدير التنفيذي', HireDate: '2015-01-15', BirthDate: '1975-05-10', Email: 'ceo@company.com', Phone: '0500000001', ManagerID: null, UserID: 1, IsActive: 1, CreatedAt: new Date().toISOString(), UpdatedAt: new Date().toISOString() },
            { EmployeeID: 2, EmployeeNumber: 'EMP002', FirstName: 'سارة', LastName: 'العبدالله', DepartmentID: 2, Position: 'مدير الموارد البشرية', HireDate: '2016-03-20', BirthDate: '1980-08-15', Email: 'hr@company.com', Phone: '0500000002', ManagerID: 1, UserID: 2, IsActive: 1, CreatedAt: new Date().toISOString(), UpdatedAt: new Date().toISOString() },
            { EmployeeID: 3, EmployeeNumber: 'EMP003', FirstName: 'محمد', LastName: 'السالم', DepartmentID: 2, Position: 'أخصائي توظيف', HireDate: '2018-06-10', BirthDate: '1985-11-22', Email: 'hr.staff@company.com', Phone: '0500000003', ManagerID: 2, UserID: 5, IsActive: 1, CreatedAt: new Date().toISOString(), UpdatedAt: new Date().toISOString() },
            { EmployeeID: 4, EmployeeNumber: 'EMP004', FirstName: 'خالد', LastName: 'الخالد', DepartmentID: 3, Position: 'مدير تقنية المعلومات', HireDate: '2017-02-05', BirthDate: '1982-07-30', Email: 'it.manager@company.com', Phone: '0500000004', ManagerID: 1, UserID: 3, IsActive: 1, CreatedAt: new Date().toISOString(), UpdatedAt: new Date().toISOString() },
            { EmployeeID: 5, EmployeeNumber: 'EMP005', FirstName: 'فاطمة', LastName: 'الفهد', DepartmentID: 3, Position: 'مطور برمجيات أول', HireDate: '2019-04-18', BirthDate: '1988-12-05', Email: 'dev1@company.com', Phone: '0500000005', ManagerID: 4, UserID: 6, IsActive: 1, CreatedAt: new Date().toISOString(), UpdatedAt: new Date().toISOString() },
            { EmployeeID: 6, EmployeeNumber: 'EMP006', FirstName: 'عمر', LastName: 'العمر', DepartmentID: 3, Position: 'مطور برمجيات', HireDate: '2020-01-15', BirthDate: '1990-03-20', Email: 'dev2@company.com', Phone: '0500000006', ManagerID: 4, UserID: 7, IsActive: 1, CreatedAt: new Date().toISOString(), UpdatedAt: new Date().toISOString() },
            { EmployeeID: 7, EmployeeNumber: 'EMP007', FirstName: 'نورة', LastName: 'الناصر', DepartmentID: 4, Position: 'مدير مالي', HireDate: '2017-07-01', BirthDate: '1983-09-15', Email: 'finance.manager@company.com', Phone: '0500000007', ManagerID: 1, UserID: 4, IsActive: 1, CreatedAt: new Date().toISOString(), UpdatedAt: new Date().toISOString() },
            { EmployeeID: 8, EmployeeNumber: 'EMP008', FirstName: 'سعد', LastName: 'السعيد', DepartmentID: 4, Position: 'محاسب أول', HireDate: '2019-02-10', BirthDate: '1987-05-25', Email: 'accountant1@company.com', Phone: '0500000008', ManagerID: 7, UserID: 8, IsActive: 1, CreatedAt: new Date().toISOString(), UpdatedAt: new Date().toISOString() },
            { EmployeeID: 9, EmployeeNumber: 'EMP009', FirstName: 'لينا', LastName: 'اللحيدان', DepartmentID: 4, Position: 'محاسب', HireDate: '2020-06-01', BirthDate: '1992-11-10', Email: 'accountant2@company.com', Phone: '0500000009', ManagerID: 7, UserID: 9, IsActive: 1, CreatedAt: new Date().toISOString(), UpdatedAt: new Date().toISOString() }
        ];
        localStorage.setItem('employees', JSON.stringify(employees));
        
        // Set up evaluation criteria
        const evaluationCriteria = [
            { CriteriaID: 1, CriteriaName: 'جودة العمل', Description: 'دقة وجودة العمل المنجز', Weight: 2.0, MaxScore: 10, IsActive: 1, CreatedAt: new Date().toISOString(), UpdatedAt: new Date().toISOString() },
            { CriteriaID: 2, CriteriaName: 'كمية العمل', Description: 'حجم العمل المنجز مقارنة بالمتوقع', Weight: 1.5, MaxScore: 10, IsActive: 1, CreatedAt: new Date().toISOString(), UpdatedAt: new Date().toISOString() },
            { CriteriaID: 3, CriteriaName: 'الالتزام بالمواعيد', Description: 'الالتزام بمواعيد تسليم المهام والحضور', Weight: 1.0, MaxScore: 10, IsActive: 1, CreatedAt: new Date().toISOString(), UpdatedAt: new Date().toISOString() },
            { CriteriaID: 4, CriteriaName: 'روح الفريق', Description: 'القدرة على العمل ضمن الفريق والتعاون مع الزملاء', Weight: 1.0, MaxScore: 10, IsActive: 1, CreatedAt: new Date().toISOString(), UpdatedAt: new Date().toISOString() },
            { CriteriaID: 5, CriteriaName: 'المبادرة والإبداع', Description: 'القدرة على طرح الأفكار الإبداعية والمبادرة', Weight: 1.5, MaxScore: 10, IsActive: 1, CreatedAt: new Date().toISOString(), UpdatedAt: new Date().toISOString() },
            { CriteriaID: 6, CriteriaName: 'مهارات التواصل', Description: 'القدرة على التواصل الفعال مع الزملاء والعملاء', Weight: 1.0, MaxScore: 10, IsActive: 1, CreatedAt: new Date().toISOString(), UpdatedAt: new Date().toISOString() },
            { CriteriaID: 7, CriteriaName: 'حل المشكلات', Description: 'القدرة على حل المشكلات واتخاذ القرارات المناسبة', Weight: 1.5, MaxScore: 10, IsActive: 1, CreatedAt: new Date().toISOString(), UpdatedAt: new Date().toISOString() },
            { CriteriaID: 8, CriteriaName: 'المهارات التقنية', Description: 'إتقان المهارات التقنية المطلوبة في العمل', Weight: 1.5, MaxScore: 10, IsActive: 1, CreatedAt: new Date().toISOString(), UpdatedAt: new Date().toISOString() }
        ];
        localStorage.setItem('evaluationCriteria', JSON.stringify(evaluationCriteria));
        
        // Set up evaluation periods
        const currentYear = new Date().getFullYear();
        const evaluationPeriods = [
            { PeriodID: 1, PeriodName: `تقييم النصف الأول ${currentYear}`, StartDate: `${currentYear}-01-01`, EndDate: `${currentYear}-06-30`, Year: currentYear, IsActive: 0, CreatedAt: new Date().toISOString(), UpdatedAt: new Date().toISOString() },
            { PeriodID: 2, PeriodName: `تقييم النصف الثاني ${currentYear}`, StartDate: `${currentYear}-07-01`, EndDate: `${currentYear}-12-31`, Year: currentYear, IsActive: 1, CreatedAt: new Date().toISOString(), UpdatedAt: new Date().toISOString() }
        ];
        localStorage.setItem('evaluationPeriods', JSON.stringify(evaluationPeriods));
        
        // Initialize empty evaluation data
        localStorage.setItem('employeeEvaluations', JSON.stringify([]));
        localStorage.setItem('evaluationDetails', JSON.stringify([]));
        
        // Set initialized flag
        localStorage.setItem('initialized', 'true');
    }
    
    return Promise.resolve();
}

// Generic CRUD operations for all entities

// Get all items from a collection
function getAll(collectionName) {
    const data = localStorage.getItem(collectionName);
    return data ? JSON.parse(data) : [];
}

// Get item by ID from a collection
function getById(collectionName, idField, id) {
    const collection = getAll(collectionName);
    return collection.find(item => item[idField] === id) || null;
}

// Add item to a collection
function addItem(collectionName, item) {
    const collection = getAll(collectionName);
    
    // Generate new ID
    const newId = collection.length > 0 
        ? Math.max(...collection.map(i => i[idFieldMap[collectionName]])) + 1 
        : 1;
    
    // Set ID, created, and updated timestamps
    item[idFieldMap[collectionName]] = newId;
    item.CreatedAt = new Date().toISOString();
    item.UpdatedAt = new Date().toISOString();
    
    // Add to collection
    collection.push(item);
    localStorage.setItem(collectionName, JSON.stringify(collection));
    
    return newId;
}

// Update item in a collection
function updateItem(collectionName, idField, id, updates) {
    const collection = getAll(collectionName);
    const index = collection.findIndex(item => item[idField] === id);
    
    if (index !== -1) {
        // Update item
        const updatedItem = { ...collection[index], ...updates, UpdatedAt: new Date().toISOString() };
        collection[index] = updatedItem;
        localStorage.setItem(collectionName, JSON.stringify(collection));
        return true;
    }
    
    return false;
}

// Delete item from a collection
function deleteItem(collectionName, idField, id) {
    const collection = getAll(collectionName);
    const newCollection = collection.filter(item => item[idField] !== id);
    
    if (newCollection.length < collection.length) {
        localStorage.setItem(collectionName, JSON.stringify(newCollection));
        return true;
    }
    
    return false;
}

// ID field map for different collections
const idFieldMap = {
    'users': 'UserID',
    'userRoles': 'RoleID',
    'departments': 'DepartmentID',
    'employees': 'EmployeeID',
    'evaluationCriteria': 'CriteriaID',
    'evaluationPeriods': 'PeriodID',
    'employeeEvaluations': 'EvaluationID',
    'evaluationDetails': 'DetailID',
    'evaluationStatuses': 'StatusID'
};

// Entity-specific functions

// Users
function getAllUsers() {
    return getAll('users');
}

function getUserById(userId) {
    return getById('users', 'UserID', userId);
}

function getUserByUsername(username) {
    const users = getAllUsers();
    return users.find(user => user.Username === username) || null;
}

function addUser(user) {
    return addItem('users', user);
}

function updateUser(userId, updates) {
    return updateItem('users', 'UserID', userId, updates);
}

function deleteUser(userId) {
    return deleteItem('users', 'UserID', userId);
}

// User Roles
function getAllUserRoles() {
    return getAll('userRoles');
}

function getUserRoleById(roleId) {
    return getById('userRoles', 'RoleID', roleId);
}

// User Role Mappings
function getAllUserRoleMappings() {
    return getAll('userRoleMappings');
}

function addUserRoleMapping(userId, roleId) {
    const mappings = getAllUserRoleMappings();
    
    // Check if mapping already exists
    if (mappings.some(m => m.UserID === userId && m.RoleID === roleId)) {
        return false;
    }
    
    // Add new mapping
    mappings.push({ UserID: userId, RoleID: roleId });
    localStorage.setItem('userRoleMappings', JSON.stringify(mappings));
    return true;
}

function removeUserRoleMapping(userId, roleId) {
    const mappings = getAllUserRoleMappings();
    const newMappings = mappings.filter(m => !(m.UserID === userId && m.RoleID === roleId));
    
    if (newMappings.length < mappings.length) {
        localStorage.setItem('userRoleMappings', JSON.stringify(newMappings));
        return true;
    }
    
    return false;
}

// Departments
function getAllDepartments() {
    return getAll('departments');
}

function getDepartmentById(departmentId) {
    return getById('departments', 'DepartmentID', departmentId);
}

function addDepartment(department) {
    return addItem('departments', department);
}

function updateDepartment(departmentId, updates) {
    return updateItem('departments', 'DepartmentID', departmentId, updates);
}

function deleteDepartment(departmentId) {
    return deleteItem('departments', 'DepartmentID', departmentId);
}

// Employees
function getAllEmployees() {
    return getAll('employees');
}

function getEmployeeById(employeeId) {
    return getById('employees', 'EmployeeID', employeeId);
}

function getEmployeeByUserID(userId) {
    const employees = getAllEmployees();
    return employees.find(employee => employee.UserID === userId) || null;
}

function getEmployeesByDepartment(departmentId) {
    const employees = getAllEmployees();
    return employees.filter(employee => employee.DepartmentID === departmentId);
}

function addEmployee(employee) {
    return addItem('employees', employee);
}

function updateEmployee(employeeId, updates) {
    return updateItem('employees', 'EmployeeID', employeeId, updates);
}

function deleteEmployee(employeeId) {
    return deleteItem('employees', 'EmployeeID', employeeId);
}

// Evaluation Criteria
function getAllEvaluationCriteria() {
    return getAll('evaluationCriteria');
}

function getEvaluationCriteriaById(criteriaId) {
    return getById('evaluationCriteria', 'CriteriaID', criteriaId);
}

function getActiveEvaluationCriteria() {
    const criteria = getAllEvaluationCriteria();
    return criteria.filter(c => c.IsActive === 1);
}

function addEvaluationCriteria(criteria) {
    return addItem('evaluationCriteria', criteria);
}

function updateEvaluationCriteria(criteriaId, updates) {
    return updateItem('evaluationCriteria', 'CriteriaID', criteriaId, updates);
}

function deleteEvaluationCriteria(criteriaId) {
    return deleteItem('evaluationCriteria', 'CriteriaID', criteriaId);
}

// Evaluation Periods
function getAllEvaluationPeriods() {
    return getAll('evaluationPeriods');
}

function getEvaluationPeriodById(periodId) {
    return getById('evaluationPeriods', 'PeriodID', periodId);
}

function getActiveEvaluationPeriod() {
    const periods = getAllEvaluationPeriods();
    return periods.find(p => p.IsActive === 1) || null;
}

function addEvaluationPeriod(period) {
    return addItem('evaluationPeriods', period);
}

function updateEvaluationPeriod(periodId, updates) {
    return updateItem('evaluationPeriods', 'PeriodID', periodId, updates);
}

function deleteEvaluationPeriod(periodId) {
    return deleteItem('evaluationPeriods', 'PeriodID', periodId);
}

// Evaluation Statuses
function getAllEvaluationStatuses() {
    return getAll('evaluationStatuses');
}

function getEvaluationStatusById(statusId) {
    return getById('evaluationStatuses', 'StatusID', statusId);
}

// Employee Evaluations
function getAllEmployeeEvaluations() {
    return getAll('employeeEvaluations');
}

function getEmployeeEvaluationById(evaluationId) {
    return getById('employeeEvaluations', 'EvaluationID', evaluationId);
}

function getEvaluationsByEmployeeAndPeriod(employeeId, periodId) {
    const evaluations = getAllEmployeeEvaluations();
    return evaluations.filter(eval => eval.EmployeeID === employeeId && eval.PeriodID === periodId);
}

function getEvaluationsByEvaluator(evaluatorId) {
    const evaluations = getAllEmployeeEvaluations();
    return evaluations.filter(eval => eval.EvaluatorID === evaluatorId);
}

function getEvaluationsByDepartment(departmentId) {
    const evaluations = getAllEmployeeEvaluations();
    const employees = getEmployeesByDepartment(departmentId);
    const employeeIds = employees.map(emp => emp.EmployeeID);
    
    return evaluations.filter(eval => employeeIds.includes(eval.EmployeeID));
}

function addEmployeeEvaluation(evaluation) {
    return addItem('employeeEvaluations', evaluation);
}

function updateEmployeeEvaluation(evaluationId, updates) {
    return updateItem('employeeEvaluations', 'EvaluationID', evaluationId, updates);
}

function deleteEmployeeEvaluation(evaluationId) {
    return deleteItem('employeeEvaluations', 'EvaluationID', evaluationId);
}

// Evaluation Details
function getAllEvaluationDetails() {
    return getAll('evaluationDetails');
}

function getEvaluationDetailById(detailId) {
    return getById('evaluationDetails', 'DetailID', detailId);
}

function getEvaluationDetailsByEvaluationId(evaluationId) {
    const details = getAllEvaluationDetails();
    return details.filter(detail => detail.EvaluationID === evaluationId);
}

function addEvaluationDetail(detail) {
    return addItem('evaluationDetails', detail);
}

function updateEvaluationDetail(detailId, updates) {
    return updateItem('evaluationDetails', 'DetailID', detailId, updates);
}

function deleteEvaluationDetail(detailId) {
    return deleteItem('evaluationDetails', 'DetailID', detailId);
}

// Calculation functions
function calculateEvaluationScore(evaluationId) {
    const details = getEvaluationDetailsByEvaluationId(evaluationId);
    const criteria = getAllEvaluationCriteria();
    
    let totalWeightedScore = 0;
    let totalWeight = 0;
    
    details.forEach(detail => {
        const criterion = criteria.find(c => c.CriteriaID === detail.CriteriaID);
        if (criterion) {
            totalWeightedScore += detail.Score * criterion.Weight;
            totalWeight += criterion.Weight;
        }
    });
    
    // Calculate weighted average
    return totalWeight > 0 ? totalWeightedScore / totalWeight : 0;
}

function updateEvaluationTotalScore(evaluationId) {
    const score = calculateEvaluationScore(evaluationId);
    return updateEmployeeEvaluation(evaluationId, { TotalScore: score });
}
