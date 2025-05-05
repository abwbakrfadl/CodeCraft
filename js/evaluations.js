/**
 * Evaluations Module
 * Handles employee evaluation functionality including creation, editing, and status updates
 */

let currentEvaluationId = null;
let evaluationPageSize = 10;
let currentEvaluationPage = 1;

// Initialize evaluations page
function initEvaluations() {
    loadEvaluationsTable();
    setupEvaluationFilters();
    setupNewEvaluationButton();
}

// Load evaluations table with data
function loadEvaluationsTable() {
    // Get and filter evaluations based on current user role
    let evaluations = getAllEmployeeEvaluations();
    
    if (isDepartmentManager() && !isAdmin() && !isHRManager()) {
        // Department managers can only see evaluations for their department employees
        const currentEmployee = getCurrentEmployee();
        if (currentEmployee) {
            const departmentId = currentEmployee.DepartmentID;
            const departmentEmployees = getEmployeesByDepartment(departmentId);
            const departmentEmployeeIds = departmentEmployees.map(emp => emp.EmployeeID);
            
            evaluations = evaluations.filter(eval => 
                departmentEmployeeIds.includes(eval.EmployeeID) || 
                eval.EvaluatorID === currentEmployee.EmployeeID
            );
        }
    }
    
    // Apply filters if they exist
    const periodFilter = document.getElementById('period-filter');
    const statusFilter = document.getElementById('status-filter');
    const searchInput = document.getElementById('evaluation-search');
    
    if (periodFilter && periodFilter.value) {
        const periodId = parseInt(periodFilter.value);
        evaluations = evaluations.filter(eval => eval.PeriodID === periodId);
    }
    
    if (statusFilter && statusFilter.value) {
        const statusId = parseInt(statusFilter.value);
        evaluations = evaluations.filter(eval => eval.StatusID === statusId);
    }
    
    if (searchInput && searchInput.value.trim()) {
        const searchTerm = searchInput.value.trim().toLowerCase();
        evaluations = evaluations.filter(eval => {
            const employee = getEmployeeById(eval.EmployeeID);
            const evaluator = getEmployeeById(eval.EvaluatorID);
            
            return (employee && employee.FullName.toLowerCase().includes(searchTerm)) ||
                   (evaluator && evaluator.FullName.toLowerCase().includes(searchTerm));
        });
    }
    
    // Sort evaluations by submission date (newest first)
    evaluations.sort((a, b) => {
        if (!a.SubmissionDate && !b.SubmissionDate) return 0;
        if (!a.SubmissionDate) return 1;
        if (!b.SubmissionDate) return -1;
        return new Date(b.SubmissionDate) - new Date(a.SubmissionDate);
    });
    
    // Pagination
    const totalEvaluations = evaluations.length;
    const totalPages = Math.ceil(totalEvaluations / evaluationPageSize);
    
    // Get current page of evaluations
    const startIndex = (currentEvaluationPage - 1) * evaluationPageSize;
    const paginatedEvaluations = evaluations.slice(startIndex, startIndex + evaluationPageSize);
    
    // Render table
    const tableBody = document.getElementById('evaluations-table-body');
    tableBody.innerHTML = '';
    
    if (paginatedEvaluations.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="7" class="text-center">لا توجد تقييمات مطابقة</td>
            </tr>
        `;
    } else {
        paginatedEvaluations.forEach(evaluation => {
            const employee = getEmployeeById(evaluation.EmployeeID);
            const evaluator = getEmployeeById(evaluation.EvaluatorID);
            const period = getEvaluationPeriodById(evaluation.PeriodID);
            
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${employee ? employee.FullName : '-'}</td>
                <td>${evaluator ? evaluator.FullName : '-'}</td>
                <td>${period ? period.PeriodName : '-'}</td>
                <td>${formatScore(evaluation.TotalScore)}</td>
                <td>${formatStatus(evaluation.StatusID)}</td>
                <td>${evaluation.SubmissionDate ? formatDate(evaluation.SubmissionDate) : '-'}</td>
                <td class="action-column">
                    <button class="btn btn-sm btn-primary btn-action view-btn" data-id="${evaluation.EvaluationID}" title="عرض التفاصيل">
                        <i class="fas fa-eye"></i>
                    </button>
                    
                    ${canEditEvaluation(evaluation) ? `
                    <button class="btn btn-sm btn-info btn-action edit-btn" data-id="${evaluation.EvaluationID}" title="تعديل">
                        <i class="fas fa-edit"></i>
                    </button>
                    ` : ''}
                    
                    ${canDeleteEvaluation(evaluation) ? `
                    <button class="btn btn-sm btn-danger btn-action delete-btn" data-id="${evaluation.EvaluationID}" title="حذف">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                    ` : ''}
                </td>
            `;
            
            tableBody.appendChild(row);
        });
    }
    
    // Add pagination controls
    const paginationContainer = document.getElementById('evaluations-pagination');
    if (paginationContainer) {
        paginationContainer.innerHTML = '';
        
        if (totalPages > 1) {
            const pagination = createPagination(totalEvaluations, evaluationPageSize, currentEvaluationPage, (page) => {
                currentEvaluationPage = page;
                loadEvaluationsTable();
            });
            
            paginationContainer.appendChild(pagination);
        }
    }
    
    // Add event listeners to buttons
    addEvaluationTableEventListeners();
}

// Setup evaluation filters
function setupEvaluationFilters() {
    // Period filter
    const periodFilter = document.getElementById('period-filter');
    periodFilter.innerHTML = '<option value="">جميع الفترات</option>';
    
    const periods = getAllEvaluationPeriods();
    periods.forEach(period => {
        const option = document.createElement('option');
        option.value = period.PeriodID;
        option.textContent = period.PeriodName;
        
        // Set active period as default selection
        if (period.IsActive === 1) {
            option.selected = true;
        }
        
        periodFilter.appendChild(option);
    });
    
    // Status filter
    const statusFilter = document.getElementById('status-filter');
    statusFilter.innerHTML = '<option value="">جميع الحالات</option>';
    
    const statuses = getAllEvaluationStatuses();
    statuses.forEach(status => {
        const option = document.createElement('option');
        option.value = status.StatusID;
        option.textContent = status.StatusName;
        statusFilter.appendChild(option);
    });
    
    // Event listeners
    periodFilter.addEventListener('change', () => {
        currentEvaluationPage = 1;
        loadEvaluationsTable();
    });
    
    statusFilter.addEventListener('change', () => {
        currentEvaluationPage = 1;
        loadEvaluationsTable();
    });
    
    const searchInput = document.getElementById('evaluation-search');
    searchInput.addEventListener('keyup', () => {
        currentEvaluationPage = 1;
        loadEvaluationsTable();
    });
}

// Add event listeners to evaluation table buttons
function addEvaluationTableEventListeners() {
    // View evaluation buttons
    document.querySelectorAll('.view-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            const evaluationId = parseInt(e.currentTarget.dataset.id);
            viewEvaluation(evaluationId);
        });
    });
    
    // Edit evaluation buttons
    document.querySelectorAll('.edit-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            const evaluationId = parseInt(e.currentTarget.dataset.id);
            editEvaluation(evaluationId);
        });
    });
    
    // Delete evaluation buttons
    document.querySelectorAll('.delete-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            const evaluationId = parseInt(e.currentTarget.dataset.id);
            confirmDeleteEvaluation(evaluationId);
        });
    });
}

// Setup new evaluation button
function setupNewEvaluationButton() {
    const newEvaluationBtn = document.getElementById('new-evaluation-btn');
    if (newEvaluationBtn) {
        newEvaluationBtn.addEventListener('click', () => {
            openNewEvaluationModal();
        });
    }
}

// Open modal to create a new evaluation
function openNewEvaluationModal() {
    // Get active period
    const activePeriod = getActiveEvaluationPeriod();
    if (!activePeriod) {
        showNotification('خطأ', 'لا توجد فترة تقييم نشطة حالياً', 'error');
        return;
    }
    
    // Get current employee
    const currentEmployee = getCurrentEmployee();
    if (!currentEmployee) {
        showNotification('خطأ', 'لا يمكن العثور على بيانات الموظف الحالي', 'error');
        return;
    }
    
    // Get employees that the current user can evaluate
    const evaluatableEmployees = getEvaluatableEmployees(currentEmployee);
    
    if (evaluatableEmployees.length === 0) {
        showNotification('تحذير', 'لا يوجد موظفون متاحون للتقييم', 'warning');
        return;
    }
    
    // Create modal HTML
    const modalHTML = `
        <div class="modal fade" id="newEvaluationModal" tabindex="-1" aria-labelledby="newEvaluationModalLabel" aria-hidden="true">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="newEvaluationModalLabel">إنشاء تقييم جديد</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="إغلاق"></button>
                    </div>
                    <div class="modal-body">
                        <form id="new-evaluation-form">
                            <div class="mb-3">
                                <label for="employee-select" class="form-label required-field">الموظف</label>
                                <select class="form-select" id="employee-select" required>
                                    <option value="">اختر الموظف</option>
                                    ${evaluatableEmployees.map(emp => `
                                        <option value="${emp.EmployeeID}">${emp.FullName} (${emp.Position || 'بدون منصب'})</option>
                                    `).join('')}
                                </select>
                            </div>
                            <div class="mb-3">
                                <label for="period-select" class="form-label required-field">فترة التقييم</label>
                                <select class="form-select" id="period-select" required>
                                    <option value="${activePeriod.PeriodID}" selected>${activePeriod.PeriodName}</option>
                                </select>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">إلغاء</button>
                        <button type="button" class="btn btn-primary" id="create-evaluation-btn">إنشاء التقييم</button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Append modal to body
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    // Show modal
    const modal = new bootstrap.Modal(document.getElementById('newEvaluationModal'));
    modal.show();
    
    // Add event listener to create button
    document.getElementById('create-evaluation-btn').addEventListener('click', () => {
        const employeeId = parseInt(document.getElementById('employee-select').value);
        const periodId = parseInt(document.getElementById('period-select').value);
        
        if (!employeeId) {
            showNotification('خطأ', 'يرجى اختيار الموظف', 'error');
            return;
        }
        
        // Check if an evaluation already exists for this employee in this period
        const existingEvals = getEvaluationsByEmployeeAndPeriod(employeeId, periodId);
        
        if (existingEvals.length > 0) {
            showNotification('تحذير', 'يوجد تقييم بالفعل لهذا الموظف في هذه الفترة', 'warning');
            return;
        }
        
        // Create new evaluation
        const evaluationData = {
            EmployeeID: employeeId,
            PeriodID: periodId,
            EvaluatorID: currentEmployee.EmployeeID,
            StatusID: 1, // Draft status
            Comments: '',
            TotalScore: null,
            SubmissionDate: null,
            CompletionDate: null
        };
        
        const newEvaluationId = addEmployeeEvaluation(evaluationData);
        
        if (newEvaluationId) {
            modal.hide();
            
            // Add default evaluation details for all active criteria
            const activeCriteria = getActiveEvaluationCriteria();
            
            activeCriteria.forEach(criteria => {
                const detailData = {
                    EvaluationID: newEvaluationId,
                    CriteriaID: criteria.CriteriaID,
                    Score: 0,
                    Comments: ''
                };
                
                addEvaluationDetail(detailData);
            });
            
            showNotification('تم بنجاح', 'تم إنشاء التقييم بنجاح', 'success');
            
            // Navigate to edit the new evaluation
            editEvaluation(newEvaluationId);
        } else {
            showNotification('خطأ', 'فشل في إنشاء التقييم', 'error');
        }
    });
    
    // Remove modal from DOM after hiding
    document.getElementById('newEvaluationModal').addEventListener('hidden.bs.modal', function () {
        this.remove();
    });
}

// Get employees that the current user can evaluate
function getEvaluatableEmployees(currentEmployee) {
    if (!currentEmployee) return [];
    
    const allEmployees = getAllEmployees().filter(emp => emp.IsActive === 1);
    
    // If admin or HR manager, can evaluate anyone
    if (isAdmin() || isHRManager()) {
        return allEmployees;
    }
    
    // Department managers can evaluate employees in their department
    if (isDepartmentManager()) {
        return allEmployees.filter(emp => 
            emp.DepartmentID === currentEmployee.DepartmentID && 
            emp.EmployeeID !== currentEmployee.EmployeeID
        );
    }
    
    // Regular employees can't evaluate anyone
    return [];
}

// View evaluation details
function viewEvaluation(evaluationId) {
    const evaluation = getEmployeeEvaluationById(evaluationId);
    if (!evaluation) {
        showNotification('خطأ', 'التقييم غير موجود', 'error');
        return;
    }
    
    const employee = getEmployeeById(evaluation.EmployeeID);
    const evaluator = getEmployeeById(evaluation.EvaluatorID);
    const period = getEvaluationPeriodById(evaluation.PeriodID);
    const status = getEvaluationStatusById(evaluation.StatusID);
    
    // Get evaluation details
    const details = getEvaluationDetailsByEvaluationId(evaluationId);
    
    // Create modal HTML
    const modalHTML = `
        <div class="modal fade" id="viewEvaluationModal" tabindex="-1" aria-labelledby="viewEvaluationModalLabel" aria-hidden="true">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="viewEvaluationModalLabel">تفاصيل التقييم</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="إغلاق"></button>
                    </div>
                    <div class="modal-body">
                        <div class="row mb-4">
                            <div class="col-md-6">
                                <p><strong>الموظف:</strong> ${employee ? employee.FullName : '-'}</p>
                                <p><strong>المقيّم:</strong> ${evaluator ? evaluator.FullName : '-'}</p>
                                <p><strong>فترة التقييم:</strong> ${period ? period.PeriodName : '-'}</p>
                            </div>
                            <div class="col-md-6">
                                <p><strong>الحالة:</strong> ${formatStatus(evaluation.StatusID)}</p>
                                <p><strong>تاريخ التقديم:</strong> ${evaluation.SubmissionDate ? formatDate(evaluation.SubmissionDate) : '-'}</p>
                                <p><strong>تاريخ الاكتمال:</strong> ${evaluation.CompletionDate ? formatDate(evaluation.CompletionDate) : '-'}</p>
                            </div>
                        </div>
                        
                        <h6 class="mb-3">معايير التقييم</h6>
                        <div class="table-responsive">
                            <table class="table table-bordered">
                                <thead>
                                    <tr>
                                        <th>المعيار</th>
                                        <th>الوزن</th>
                                        <th>الدرجة</th>
                                        <th>التعليقات</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${details.map(detail => {
                                        const criteria = getEvaluationCriteriaById(detail.CriteriaID);
                                        return criteria ? `
                                            <tr>
                                                <td>${criteria.CriteriaName}</td>
                                                <td>${criteria.Weight}</td>
                                                <td>${formatScore(detail.Score)}</td>
                                                <td>${detail.Comments || '-'}</td>
                                            </tr>
                                        ` : '';
                                    }).join('')}
                                </tbody>
                                <tfoot>
                                    <tr class="table-active">
                                        <th colspan="2">الدرجة النهائية</th>
                                        <th colspan="2">${formatScore(evaluation.TotalScore)}</th>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                        
                        ${evaluation.Comments ? `
                            <h6 class="mt-3 mb-2">التعليقات العامة</h6>
                            <div class="p-3 bg-light rounded">
                                ${evaluation.Comments}
                            </div>
                        ` : ''}
                        
                        ${canChangeEvaluationStatus(evaluation) ? `
                            <div class="mt-4 p-3 border rounded">
                                <h6>تغيير حالة التقييم</h6>
                                <div class="row g-2 align-items-center">
                                    <div class="col-md-8">
                                        <select class="form-select" id="status-change-select">
                                            ${getAllEvaluationStatuses().map(s => 
                                                `<option value="${s.StatusID}" ${s.StatusID === evaluation.StatusID ? 'selected' : ''}>${s.StatusName}</option>`
                                            ).join('')}
                                        </select>
                                    </div>
                                    <div class="col-md-4">
                                        <button class="btn btn-primary w-100" id="update-status-btn">تحديث الحالة</button>
                                    </div>
                                </div>
                            </div>
                        ` : ''}
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">إغلاق</button>
                        ${canEditEvaluation(evaluation) ? `
                            <button type="button" class="btn btn-info" id="edit-evaluation-btn">تعديل</button>
                        ` : ''}
                        <button type="button" class="btn btn-primary" id="print-evaluation-btn">طباعة</button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Append modal to body
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    // Show modal
    const modal = new bootstrap.Modal(document.getElementById('viewEvaluationModal'));
    modal.show();
    
    // Add event listeners
    if (canEditEvaluation(evaluation)) {
        document.getElementById('edit-evaluation-btn').addEventListener('click', () => {
            modal.hide();
            editEvaluation(evaluationId);
        });
    }
    
    if (canChangeEvaluationStatus(evaluation)) {
        document.getElementById('update-status-btn').addEventListener('click', () => {
            const newStatusId = parseInt(document.getElementById('status-change-select').value);
            updateEvaluationStatus(evaluationId, newStatusId);
            modal.hide();
        });
    }
    
    document.getElementById('print-evaluation-btn').addEventListener('click', () => {
        printEvaluation(evaluationId);
    });
    
    // Remove modal from DOM after hiding
    document.getElementById('viewEvaluationModal').addEventListener('hidden.bs.modal', function () {
        this.remove();
    });
}

// Edit evaluation
function editEvaluation(evaluationId) {
    const evaluation = getEmployeeEvaluationById(evaluationId);
    if (!evaluation) {
        showNotification('خطأ', 'التقييم غير موجود', 'error');
        return;
    }
    
    // Check if user can edit this evaluation
    if (!canEditEvaluation(evaluation)) {
        showNotification('خطأ', 'لا يمكنك تعديل هذا التقييم', 'error');
        return;
    }
    
    const employee = getEmployeeById(evaluation.EmployeeID);
    const evaluator = getEmployeeById(evaluation.EvaluatorID);
    const period = getEvaluationPeriodById(evaluation.PeriodID);
    
    // Get evaluation details
    const details = getEvaluationDetailsByEvaluationId(evaluationId);
    
    // Create evaluation form HTML
    const evaluationForm = `
        <div class="card mb-4">
            <div class="card-header d-flex justify-content-between align-items-center">
                <h5 class="mb-0">تعديل التقييم</h5>
                <button type="button" class="btn btn-sm btn-secondary" id="cancel-edit-btn">العودة</button>
            </div>
            <div class="card-body">
                <form id="evaluation-form">
                    <div class="row mb-4">
                        <div class="col-md-4">
                            <p><strong>الموظف:</strong> ${employee ? employee.FullName : '-'}</p>
                        </div>
                        <div class="col-md-4">
                            <p><strong>المقيّم:</strong> ${evaluator ? evaluator.FullName : '-'}</p>
                        </div>
                        <div class="col-md-4">
                            <p><strong>فترة التقييم:</strong> ${period ? period.PeriodName : '-'}</p>
                        </div>
                    </div>
                    
                    <h6 class="mb-3">معايير التقييم</h6>
                    <div class="criteria-container">
                        ${details.map(detail => {
                            const criteria = getEvaluationCriteriaById(detail.CriteriaID);
                            return criteria ? `
                                <div class="criteria-item" data-criteria-id="${criteria.CriteriaID}" data-detail-id="${detail.DetailID}">
                                    <div class="row">
                                        <div class="col-md-6">
                                            <h6>${criteria.CriteriaName}</h6>
                                            <p class="text-muted small">${criteria.Description || ''}</p>
                                        </div>
                                        <div class="col-md-6">
                                            <div class="row align-items-center">
                                                <div class="col-md-8">
                                                    <label for="score-${detail.DetailID}" class="form-label">الدرجة (0-${criteria.MaxScore})</label>
                                                    <div class="input-group score-input-group">
                                                        <input type="number" class="form-control score-input" id="score-${detail.DetailID}" 
                                                            min="0" max="${criteria.MaxScore}" step="0.5" value="${detail.Score || 0}" required>
                                                        <span class="input-group-text">/ ${criteria.MaxScore}</span>
                                                    </div>
                                                </div>
                                                <div class="col-md-4">
                                                    <label class="form-label">الوزن</label>
                                                    <div class="form-control-plaintext">${criteria.Weight}</div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="mt-2">
                                        <label for="comment-${detail.DetailID}" class="form-label">التعليقات</label>
                                        <textarea class="form-control" id="comment-${detail.DetailID}" rows="2">${detail.Comments || ''}</textarea>
                                    </div>
                                </div>
                            ` : '';
                        }).join('')}
                    </div>
                    
                    <div class="mt-4">
                        <label for="general-comments" class="form-label">التعليقات العامة</label>
                        <textarea class="form-control" id="general-comments" rows="3">${evaluation.Comments || ''}</textarea>
                    </div>
                    
                    <div class="d-flex justify-content-end gap-2 mt-4">
                        <button type="button" class="btn btn-secondary" id="save-draft-btn">حفظ كمسودة</button>
                        <button type="submit" class="btn btn-primary">تقديم التقييم</button>
                    </div>
                </form>
            </div>
        </div>
    `;
    
    // Set form HTML to content container
    document.getElementById('content-container').innerHTML = evaluationForm;
    
    // Add event listeners
    document.getElementById('cancel-edit-btn').addEventListener('click', () => {
        // Navigate back to evaluations list
        initEvaluations();
    });
    
    document.getElementById('save-draft-btn').addEventListener('click', () => {
        saveEvaluation(evaluationId, false);
    });
    
    document.getElementById('evaluation-form').addEventListener('submit', (e) => {
        e.preventDefault();
        saveEvaluation(evaluationId, true);
    });
}

// Save evaluation changes
function saveEvaluation(evaluationId, isSubmitting) {
    const evaluation = getEmployeeEvaluationById(evaluationId);
    if (!evaluation) {
        showNotification('خطأ', 'التقييم غير موجود', 'error');
        return;
    }
    
    // Get all criteria inputs
    const criteriaItems = document.querySelectorAll('.criteria-item');
    let allValid = true;
    
    // Validate scores
    criteriaItems.forEach(item => {
        const detailId = parseInt(item.dataset.detailId);
        const criteriaId = parseInt(item.dataset.criteriaId);
        const criteria = getEvaluationCriteriaById(criteriaId);
        
        const scoreInput = document.getElementById(`score-${detailId}`);
        const score = parseFloat(scoreInput.value);
        
        if (isNaN(score) || score < 0 || score > criteria.MaxScore) {
            scoreInput.classList.add('is-invalid');
            allValid = false;
        } else {
            scoreInput.classList.remove('is-invalid');
        }
    });
    
    if (!allValid) {
        showNotification('خطأ', 'يرجى تصحيح الأخطاء في الدرجات', 'error');
        return;
    }
    
    // Update evaluation details
    criteriaItems.forEach(item => {
        const detailId = parseInt(item.dataset.detailId);
        const scoreInput = document.getElementById(`score-${detailId}`);
        const commentInput = document.getElementById(`comment-${detailId}`);
        
        const updates = {
            Score: parseFloat(scoreInput.value),
            Comments: commentInput.value.trim(),
            UpdatedAt: new Date().toISOString()
        };
        
        updateEvaluationDetail(detailId, updates);
    });
    
    // Update general comments
    const generalComments = document.getElementById('general-comments').value.trim();
    
    // Prepare updates for evaluation
    const updates = {
        Comments: generalComments,
        UpdatedAt: new Date().toISOString()
    };
    
    // If submitting, update status and submission date
    if (isSubmitting) {
        updates.StatusID = 2; // Submitted status
        updates.SubmissionDate = new Date().toISOString();
    }
    
    // Update evaluation
    updateEmployeeEvaluation(evaluationId, updates);
    
    // Calculate and update total score
    updateEvaluationTotalScore(evaluationId);
    
    // Show notification
    if (isSubmitting) {
        showNotification('تم بنجاح', 'تم تقديم التقييم بنجاح', 'success');
    } else {
        showNotification('تم بنجاح', 'تم حفظ التقييم كمسودة', 'success');
    }
    
    // Navigate back to evaluations list
    initEvaluations();
}

// Update evaluation status
function updateEvaluationStatus(evaluationId, newStatusId) {
    const evaluation = getEmployeeEvaluationById(evaluationId);
    if (!evaluation) {
        showNotification('خطأ', 'التقييم غير موجود', 'error');
        return;
    }
    
    // Prepare updates
    const updates = {
        StatusID: newStatusId,
        UpdatedAt: new Date().toISOString()
    };
    
    // If status is "Completed", set completion date
    if (newStatusId === 4) { // Completed status
        updates.CompletionDate = new Date().toISOString();
    }
    
    // Update evaluation
    if (updateEmployeeEvaluation(evaluationId, updates)) {
        showNotification('تم بنجاح', 'تم تحديث حالة التقييم بنجاح', 'success');
        loadEvaluationsTable();
    } else {
        showNotification('خطأ', 'فشل في تحديث حالة التقييم', 'error');
    }
}

// Confirm delete evaluation
function confirmDeleteEvaluation(evaluationId) {
    const evaluation = getEmployeeEvaluationById(evaluationId);
    if (!evaluation) {
        showNotification('خطأ', 'التقييم غير موجود', 'error');
        return;
    }
    
    // Check if user can delete this evaluation
    if (!canDeleteEvaluation(evaluation)) {
        showNotification('خطأ', 'لا يمكنك حذف هذا التقييم', 'error');
        return;
    }
    
    const employee = getEmployeeById(evaluation.EmployeeID);
    const period = getEvaluationPeriodById(evaluation.PeriodID);
    
    createConfirmationModal(
        'تأكيد الحذف',
        `هل أنت متأكد من حذف تقييم الموظف "${employee ? employee.FullName : ''}" لفترة "${period ? period.PeriodName : ''}"؟`,
        () => {
            if (deleteEmployeeEvaluation(evaluationId)) {
                showNotification('تم بنجاح', 'تم حذف التقييم بنجاح', 'success');
                loadEvaluationsTable();
            } else {
                showNotification('خطأ', 'فشل في حذف التقييم', 'error');
            }
        }
    );
}

// Check if current user can edit an evaluation
function canEditEvaluation(evaluation) {
    if (!evaluation) return false;
    
    // Admins can edit all evaluations
    if (isAdmin()) return true;
    
    // HR managers can edit evaluations that are not completed
    if (isHRManager() && evaluation.StatusID !== 4) return true;
    
    // Get current employee
    const currentEmployee = getCurrentEmployee();
    if (!currentEmployee) return false;
    
    // Evaluators can edit their own evaluations if they're in Draft status
    return evaluation.EvaluatorID === currentEmployee.EmployeeID && evaluation.StatusID === 1;
}

// Check if current user can delete an evaluation
function canDeleteEvaluation(evaluation) {
    if (!evaluation) return false;
    
    // Admins can delete all evaluations
    if (isAdmin()) return true;
    
    // HR managers can delete evaluations that are not completed
    if (isHRManager() && evaluation.StatusID !== 4) return true;
    
    // Get current employee
    const currentEmployee = getCurrentEmployee();
    if (!currentEmployee) return false;
    
    // Evaluators can delete their own evaluations if they're in Draft status
    return evaluation.EvaluatorID === currentEmployee.EmployeeID && evaluation.StatusID === 1;
}

// Check if current user can change an evaluation's status
function canChangeEvaluationStatus(evaluation) {
    if (!evaluation) return false;
    
    // Admins and HR managers can change status
    if (isAdmin() || isHRManager()) return true;
    
    // Department managers can change status of evaluations in their department
    if (isDepartmentManager()) {
        const currentEmployee = getCurrentEmployee();
        if (!currentEmployee) return false;
        
        const employee = getEmployeeById(evaluation.EmployeeID);
        return employee && employee.DepartmentID === currentEmployee.DepartmentID;
    }
    
    return false;
}

// Print evaluation
function printEvaluation(evaluationId) {
    const evaluation = getEmployeeEvaluationById(evaluationId);
    if (!evaluation) {
        showNotification('خطأ', 'التقييم غير موجود', 'error');
        return;
    }
    
    const employee = getEmployeeById(evaluation.EmployeeID);
    const evaluator = getEmployeeById(evaluation.EvaluatorID);
    const period = getEvaluationPeriodById(evaluation.PeriodID);
    const status = getEvaluationStatusById(evaluation.StatusID);
    const details = getEvaluationDetailsByEvaluationId(evaluationId);
    
    // Create print window
    const printWindow = window.open('', '_blank');
    
    printWindow.document.write(`
        <!DOCTYPE html>
        <html lang="ar" dir="rtl">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>تقييم الموظف - ${employee ? employee.FullName : ''}</title>
            <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.2.3/dist/css/bootstrap.rtl.min.css">
            <style>
                body {
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                    padding: 20px;
                }
                .header {
                    text-align: center;
                    margin-bottom: 30px;
                    border-bottom: 2px solid #ddd;
                    padding-bottom: 20px;
                }
                .score-excellent { color: #2e7d32; }
                .score-good { color: #0277bd; }
                .score-average { color: #ff8f00; }
                .score-poor { color: #c62828; }
                table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
                th, td { border: 1px solid #ddd; padding: 8px; }
                th { background-color: #f5f5f5; }
                .badge {
                    display: inline-block;
                    padding: 0.25em 0.4em;
                    font-size: 75%;
                    font-weight: 700;
                    line-height: 1;
                    text-align: center;
                    white-space: nowrap;
                    vertical-align: baseline;
                    border-radius: 0.25rem;
                }
                .footer {
                    margin-top: 50px;
                    border-top: 1px solid #ddd;
                    padding-top: 20px;
                }
                .signature {
                    margin-top: 15px;
                    width: 200px;
                    border-top: 1px solid #000;
                    display: inline-block;
                    text-align: center;
                }
            </style>
        </head>
        <body>
            <div class="header">
                <h2>نموذج تقييم الموظف</h2>
                <p>تاريخ التقرير: ${formatDate(new Date())}</p>
            </div>
            
            <div class="row mb-4">
                <div class="col-md-6">
                    <p><strong>الموظف:</strong> ${employee ? employee.FullName : '-'}</p>
                    <p><strong>القسم:</strong> ${employee && employee.DepartmentID ? getDepartmentById(employee.DepartmentID).DepartmentName : '-'}</p>
                    <p><strong>المنصب:</strong> ${employee ? employee.Position || '-' : '-'}</p>
                </div>
                <div class="col-md-6">
                    <p><strong>المقيّم:</strong> ${evaluator ? evaluator.FullName : '-'}</p>
                    <p><strong>فترة التقييم:</strong> ${period ? period.PeriodName : '-'}</p>
                    <p><strong>الحالة:</strong> ${status ? status.StatusName : '-'}</p>
                </div>
            </div>
            
            <h5 class="mb-3">معايير التقييم</h5>
            <table>
                <thead>
                    <tr>
                        <th>المعيار</th>
                        <th>الوزن</th>
                        <th>الحد الأقصى</th>
                        <th>الدرجة</th>
                        <th>التعليقات</th>
                    </tr>
                </thead>
                <tbody>
                    ${details.map(detail => {
                        const criteria = getEvaluationCriteriaById(detail.CriteriaID);
                        if (!criteria) return '';
                        
                        // Format score with color
                        const score = parseFloat(detail.Score);
                        let scoreClass = '';
                        if (score >= 0.9 * criteria.MaxScore) {
                            scoreClass = 'score-excellent';
                        } else if (score >= 0.7 * criteria.MaxScore) {
                            scoreClass = 'score-good';
                        } else if (score >= 0.5 * criteria.MaxScore) {
                            scoreClass = 'score-average';
                        } else {
                            scoreClass = 'score-poor';
                        }
                        
                        return `
                            <tr>
                                <td>${criteria.CriteriaName}</td>
                                <td>${criteria.Weight}</td>
                                <td>${criteria.MaxScore}</td>
                                <td class="${scoreClass}">${score.toFixed(1)}</td>
                                <td>${detail.Comments || '-'}</td>
                            </tr>
                        `;
                    }).join('')}
                </tbody>
                <tfoot>
                    <tr>
                        <th colspan="3">الدرجة النهائية</th>
                        <th colspan="2">${evaluation.TotalScore ? evaluation.TotalScore : '-'}</th>
                    </tr>
                </tfoot>
            </table>
            
            ${evaluation.Comments ? `
                <h5 class="mb-2">التعليقات العامة</h5>
                <div class="p-3" style="border: 1px solid #ddd; border-radius: 5px; background-color: #f9f9f9;">
                    ${evaluation.Comments}
                </div>
            ` : ''}
            
            <div class="footer">
                <div class="row">
                    <div class="col-md-6">
                        <p><strong>تاريخ التقديم:</strong> ${evaluation.SubmissionDate ? formatDate(evaluation.SubmissionDate) : '-'}</p>
                        <p><strong>تاريخ الاكتمال:</strong> ${evaluation.CompletionDate ? formatDate(evaluation.CompletionDate) : '-'}</p>
                    </div>
                    <div class="col-md-6 text-start">
                        <p>توقيع المقيّم:</p>
                        <div class="signature">
                            ${evaluator ? evaluator.FullName : ''}
                        </div>
                    </div>
                </div>
            </div>
        </body>
        </html>
    `);
    
    printWindow.document.close();
    
    // Wait for resources to load
    setTimeout(() => {
        printWindow.print();
    }, 500);
}
