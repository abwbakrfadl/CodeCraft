/**
 * Reports Module
 * Handles evaluation reporting and data visualization
 */

// Initialize reports page
function initReports() {
    setupReportFilters();
    loadReportData();
    setupExportButtons();
}

// Setup report filters
function setupReportFilters() {
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
    
    // Department filter
    const departmentFilter = document.getElementById('department-filter');
    departmentFilter.innerHTML = '<option value="">جميع الأقسام</option>';
    
    const departments = getAllDepartments();
    
    // For department managers, only show their department
    if (isDepartmentManager() && !isAdmin() && !isHRManager()) {
        const currentEmployee = getCurrentEmployee();
        if (currentEmployee && currentEmployee.DepartmentID) {
            const managerDepartment = getDepartmentById(currentEmployee.DepartmentID);
            if (managerDepartment) {
                const option = document.createElement('option');
                option.value = managerDepartment.DepartmentID;
                option.textContent = managerDepartment.DepartmentName;
                option.selected = true;
                departmentFilter.appendChild(option);
            }
        }
    } else {
        // Admin and HR can see all departments
        departments.forEach(department => {
            const option = document.createElement('option');
            option.value = department.DepartmentID;
            option.textContent = department.DepartmentName;
            departmentFilter.appendChild(option);
        });
    }
    
    // Event listeners
    periodFilter.addEventListener('change', loadReportData);
    departmentFilter.addEventListener('change', loadReportData);
}

// Load report data based on filters
function loadReportData() {
    const periodId = document.getElementById('period-filter').value;
    const departmentId = document.getElementById('department-filter').value;
    
    // Get all evaluations
    let evaluations = getAllEmployeeEvaluations();
    
    // Filter by period if selected
    if (periodId) {
        evaluations = evaluations.filter(eval => eval.PeriodID === parseInt(periodId));
    }
    
    // Filter by department if selected
    if (departmentId) {
        const departmentEmployees = getEmployeesByDepartment(parseInt(departmentId));
        const employeeIds = departmentEmployees.map(emp => emp.EmployeeID);
        evaluations = evaluations.filter(eval => employeeIds.includes(eval.EmployeeID));
    }
    
    // If department manager and not filtering, show only their department
    if (isDepartmentManager() && !isAdmin() && !isHRManager() && !departmentId) {
        const currentEmployee = getCurrentEmployee();
        if (currentEmployee && currentEmployee.DepartmentID) {
            const departmentEmployees = getEmployeesByDepartment(currentEmployee.DepartmentID);
            const employeeIds = departmentEmployees.map(emp => emp.EmployeeID);
            evaluations = evaluations.filter(eval => employeeIds.includes(eval.EmployeeID));
        }
    }
    
    // Filter to only include completed or in-review evaluations
    evaluations = evaluations.filter(eval => [3, 4].includes(eval.StatusID));
    
    updateReportSummary(evaluations);
    renderDepartmentAveragesChart(evaluations);
    renderScoreDistributionChart(evaluations);
    loadDetailedEvaluationsTable(evaluations);
}

// Update report summary cards
function updateReportSummary(evaluations) {
    const totalEvaluations = evaluations.length;
    document.getElementById('total-evaluations-count').textContent = totalEvaluations;
    
    // Calculate average score
    let totalScore = 0;
    let scoreCount = 0;
    
    evaluations.forEach(eval => {
        if (eval.TotalScore) {
            totalScore += parseFloat(eval.TotalScore);
            scoreCount++;
        }
    });
    
    const avgScore = scoreCount > 0 ? (totalScore / scoreCount).toFixed(1) : '0.0';
    document.getElementById('average-score-value').textContent = avgScore;
    
    // Count evaluations by status
    const completedCount = evaluations.filter(eval => eval.StatusID === 4).length;
    const inReviewCount = evaluations.filter(eval => eval.StatusID === 3).length;
    
    document.getElementById('completed-evaluations-count').textContent = completedCount;
    document.getElementById('in-review-evaluations-count').textContent = inReviewCount;
    
    // Set completion rate
    const completionRate = totalEvaluations > 0 ? ((completedCount / totalEvaluations) * 100).toFixed(1) : '0.0';
    document.getElementById('completion-rate-value').textContent = `${completionRate}%`;
}

// Render department averages chart
function renderDepartmentAveragesChart(evaluations) {
    // Group evaluations by department
    const departments = getAllDepartments();
    const departmentScores = {};
    
    departments.forEach(dept => {
        departmentScores[dept.DepartmentID] = {
            name: dept.DepartmentName,
            scores: [],
            average: 0
        };
    });
    
    evaluations.forEach(eval => {
        if (eval.TotalScore) {
            const employee = getEmployeeById(eval.EmployeeID);
            if (employee && employee.DepartmentID) {
                departmentScores[employee.DepartmentID].scores.push(parseFloat(eval.TotalScore));
            }
        }
    });
    
    // Calculate averages
    for (const deptId in departmentScores) {
        const scores = departmentScores[deptId].scores;
        const average = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
        departmentScores[deptId].average = parseFloat(average.toFixed(1));
    }
    
    // Filter out departments with no scores
    const departmentsWithScores = Object.values(departmentScores).filter(dept => dept.scores.length > 0);
    
    // Sort by average score (highest first)
    departmentsWithScores.sort((a, b) => b.average - a.average);
    
    // Prepare chart data
    const labels = departmentsWithScores.map(dept => dept.name);
    const data = departmentsWithScores.map(dept => dept.average);
    const counts = departmentsWithScores.map(dept => dept.scores.length);
    
    // Get canvas context
    const ctx = document.getElementById('departmentAveragesChart').getContext('2d');
    
    // Check if a chart already exists and destroy it
    if (window.departmentChart) {
        window.departmentChart.destroy();
    }
    
    // Create chart
    window.departmentChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'متوسط الدرجات',
                data: data,
                backgroundColor: 'rgba(54, 162, 235, 0.7)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    max: 10,
                    title: {
                        display: true,
                        text: 'متوسط الدرجات'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'القسم'
                    }
                }
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        afterLabel: function(context) {
                            return `عدد التقييمات: ${counts[context.dataIndex]}`;
                        }
                    }
                },
                legend: {
                    display: false
                },
                title: {
                    display: true,
                    text: 'متوسط درجات التقييم حسب القسم',
                    font: {
                        size: 16
                    }
                }
            }
        }
    });
    
    // If no data, show message
    if (departmentsWithScores.length === 0) {
        document.getElementById('chart-no-data-message-1').classList.remove('d-none');
    } else {
        document.getElementById('chart-no-data-message-1').classList.add('d-none');
    }
}

// Render score distribution chart
function renderScoreDistributionChart(evaluations) {
    // Filter evaluations with scores
    const evaluationsWithScores = evaluations.filter(eval => eval.TotalScore !== null);
    
    // Define score ranges
    const scoreRanges = [
        { range: '0-2', count: 0, color: 'rgba(220, 53, 69, 0.7)' },
        { range: '2-4', count: 0, color: 'rgba(255, 193, 7, 0.7)' },
        { range: '4-6', count: 0, color: 'rgba(255, 193, 7, 0.7)' },
        { range: '6-8', count: 0, color: 'rgba(40, 167, 69, 0.7)' },
        { range: '8-10', count: 0, color: 'rgba(40, 167, 69, 0.7)' }
    ];
    
    // Count evaluations in each range
    evaluationsWithScores.forEach(eval => {
        const score = parseFloat(eval.TotalScore);
        
        if (score >= 0 && score < 2) {
            scoreRanges[0].count++;
        } else if (score >= 2 && score < 4) {
            scoreRanges[1].count++;
        } else if (score >= 4 && score < 6) {
            scoreRanges[2].count++;
        } else if (score >= 6 && score < 8) {
            scoreRanges[3].count++;
        } else if (score >= 8 && score <= 10) {
            scoreRanges[4].count++;
        }
    });
    
    // Prepare chart data
    const labels = scoreRanges.map(range => range.range);
    const data = scoreRanges.map(range => range.count);
    const colors = scoreRanges.map(range => range.color);
    
    // Get canvas context
    const ctx = document.getElementById('scoreDistributionChart').getContext('2d');
    
    // Check if a chart already exists and destroy it
    if (window.scoreChart) {
        window.scoreChart.destroy();
    }
    
    // Create chart
    window.scoreChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: colors,
                borderColor: colors.map(color => color.replace('0.7', '1')),
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const value = context.raw;
                            const total = data.reduce((a, b) => a + b, 0);
                            const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : '0';
                            return `${value} تقييم (${percentage}%)`;
                        }
                    }
                },
                legend: {
                    position: 'right'
                },
                title: {
                    display: true,
                    text: 'توزيع درجات التقييم',
                    font: {
                        size: 16
                    }
                }
            }
        }
    });
    
    // If no data, show message
    if (evaluationsWithScores.length === 0) {
        document.getElementById('chart-no-data-message-2').classList.remove('d-none');
    } else {
        document.getElementById('chart-no-data-message-2').classList.add('d-none');
    }
}

// Load detailed evaluations table
function loadDetailedEvaluationsTable(evaluations) {
    const tableBody = document.getElementById('evaluations-table-body');
    tableBody.innerHTML = '';
    
    if (evaluations.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="7" class="text-center">لا توجد بيانات متاحة</td>
            </tr>
        `;
        return;
    }
    
    // Sort evaluations by score (highest first)
    evaluations.sort((a, b) => {
        if (!a.TotalScore && !b.TotalScore) return 0;
        if (!a.TotalScore) return 1;
        if (!b.TotalScore) return -1;
        return parseFloat(b.TotalScore) - parseFloat(a.TotalScore);
    });
    
    evaluations.forEach(evaluation => {
        const employee = getEmployeeById(evaluation.EmployeeID);
        const evaluator = getEmployeeById(evaluation.EvaluatorID);
        const department = employee ? getDepartmentById(employee.DepartmentID) : null;
        const period = getEvaluationPeriodById(evaluation.PeriodID);
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${employee ? employee.FullName : '-'}</td>
            <td>${department ? department.DepartmentName : '-'}</td>
            <td>${evaluator ? evaluator.FullName : '-'}</td>
            <td>${period ? period.PeriodName : '-'}</td>
            <td>${formatScore(evaluation.TotalScore)}</td>
            <td>${formatStatus(evaluation.StatusID)}</td>
            <td>
                <button class="btn btn-sm btn-primary view-evaluation-btn" data-id="${evaluation.EvaluationID}" title="عرض التفاصيل">
                    <i class="fas fa-eye"></i> عرض
                </button>
            </td>
        `;
        
        tableBody.appendChild(row);
    });
    
    // Add event listeners to view buttons
    document.querySelectorAll('.view-evaluation-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            const evaluationId = parseInt(e.currentTarget.dataset.id);
            viewEvaluation(evaluationId);
        });
    });
}

// Setup export buttons
function setupExportButtons() {
    // Export to CSV button
    document.getElementById('export-csv-btn').addEventListener('click', () => {
        exportEvaluationsToCSV();
    });
    
    // Print report button
    document.getElementById('print-report-btn').addEventListener('click', () => {
        window.print();
    });
}

// Export evaluations to CSV
function exportEvaluationsToCSV() {
    const periodId = document.getElementById('period-filter').value;
    const departmentId = document.getElementById('department-filter').value;
    
    // Get all evaluations
    let evaluations = getAllEmployeeEvaluations();
    
    // Filter by period if selected
    if (periodId) {
        evaluations = evaluations.filter(eval => eval.PeriodID === parseInt(periodId));
    }
    
    // Filter by department if selected
    if (departmentId) {
        const departmentEmployees = getEmployeesByDepartment(parseInt(departmentId));
        const employeeIds = departmentEmployees.map(emp => emp.EmployeeID);
        evaluations = evaluations.filter(eval => employeeIds.includes(eval.EmployeeID));
    }
    
    // If department manager and not filtering, show only their department
    if (isDepartmentManager() && !isAdmin() && !isHRManager() && !departmentId) {
        const currentEmployee = getCurrentEmployee();
        if (currentEmployee && currentEmployee.DepartmentID) {
            const departmentEmployees = getEmployeesByDepartment(currentEmployee.DepartmentID);
            const employeeIds = departmentEmployees.map(emp => emp.EmployeeID);
            evaluations = evaluations.filter(eval => employeeIds.includes(eval.EmployeeID));
        }
    }
    
    // Filter to only include completed or in-review evaluations
    evaluations = evaluations.filter(eval => [3, 4].includes(eval.StatusID));
    
    // Prepare export data
    const exportData = evaluations.map(evaluation => {
        const employee = getEmployeeById(evaluation.EmployeeID);
        const evaluator = getEmployeeById(evaluation.EvaluatorID);
        const department = employee ? getDepartmentById(employee.DepartmentID) : null;
        const period = getEvaluationPeriodById(evaluation.PeriodID);
        const status = getEvaluationStatusById(evaluation.StatusID);
        
        return {
            'اسم الموظف': employee ? employee.FullName : '-',
            'القسم': department ? department.DepartmentName : '-',
            'المقيّم': evaluator ? evaluator.FullName : '-',
            'فترة التقييم': period ? period.PeriodName : '-',
            'الدرجة النهائية': evaluation.TotalScore ? evaluation.TotalScore : '-',
            'الحالة': status ? status.StatusName : '-',
            'تاريخ التقديم': evaluation.SubmissionDate ? formatDate(evaluation.SubmissionDate) : '-',
            'تاريخ الاكتمال': evaluation.CompletionDate ? formatDate(evaluation.CompletionDate) : '-'
        };
    });
    
    // Export to CSV
    if (exportData.length > 0) {
        const periodName = periodId ? getEvaluationPeriodById(parseInt(periodId)).PeriodName : 'جميع الفترات';
        const departmentName = departmentId ? getDepartmentById(parseInt(departmentId)).DepartmentName : 'جميع الأقسام';
        const filename = `تقرير_التقييمات_${periodName}_${departmentName}_${formatDate(new Date())}.csv`;
        
        exportToCSV(exportData, filename);
    } else {
        showNotification('تنبيه', 'لا توجد بيانات للتصدير', 'warning');
    }
}

// Get evaluation criteria breakdown for a specific department
function getCriteriaBreakdownByDepartment(departmentId, periodId) {
    // Get employees in the department
    const employees = getEmployeesByDepartment(departmentId);
    const employeeIds = employees.map(emp => emp.EmployeeID);
    
    // Get evaluations for these employees
    let evaluations = getAllEmployeeEvaluations();
    
    // Filter by period if provided
    if (periodId) {
        evaluations = evaluations.filter(eval => eval.PeriodID === periodId);
    }
    
    // Filter by employees
    evaluations = evaluations.filter(eval => employeeIds.includes(eval.EmployeeID));
    
    // Filter to only include completed evaluations
    evaluations = evaluations.filter(eval => eval.StatusID === 4);
    
    // Get all criteria
    const criteria = getAllEvaluationCriteria();
    
    // Prepare result
    const criteriaBreakdown = criteria.map(criterion => {
        let totalScore = 0;
        let count = 0;
        
        // Get all evaluation details for this criteria
        const allDetails = getAllEvaluationDetails();
        const evaluationIds = evaluations.map(eval => eval.EvaluationID);
        
        allDetails.forEach(detail => {
            if (evaluationIds.includes(detail.EvaluationID) && detail.CriteriaID === criterion.CriteriaID) {
                totalScore += parseFloat(detail.Score);
                count++;
            }
        });
        
        return {
            criteriaId: criterion.CriteriaID,
            criteriaName: criterion.CriteriaName,
            averageScore: count > 0 ? (totalScore / count).toFixed(1) : 0,
            evaluationCount: count
        };
    });
    
    return criteriaBreakdown.filter(item => item.evaluationCount > 0);
}
