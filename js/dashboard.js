/**
 * Dashboard Module
 * Handles dashboard statistics and visualizations
 */

// Initialize dashboard page
function initDashboard() {
    updateDashboardStats();
    renderEmployeesByDepartmentChart();
    renderEvaluationStatusChart();
    renderRecentEvaluations();
}

// Update dashboard statistics cards
function updateDashboardStats() {
    const employees = getAllEmployees().filter(emp => emp.IsActive === 1);
    const departments = getAllDepartments();
    const activePeriod = getActiveEvaluationPeriod();
    const evaluations = getAllEmployeeEvaluations();
    
    // Count completed evaluations
    const completedEvaluations = evaluations.filter(eval => eval.StatusID === 4); // Status 4 = Completed
    
    // Calculate average score for completed evaluations
    let totalScore = 0;
    let scoreCount = 0;
    
    completedEvaluations.forEach(eval => {
        if (eval.TotalScore) {
            totalScore += parseFloat(eval.TotalScore);
            scoreCount++;
        }
    });
    
    const avgScore = scoreCount > 0 ? (totalScore / scoreCount).toFixed(1) : 0;
    
    // Update stats in UI
    document.getElementById('total-employees').textContent = employees.length;
    document.getElementById('total-departments').textContent = departments.length;
    document.getElementById('total-evaluations').textContent = evaluations.length;
    document.getElementById('average-score').textContent = avgScore;
    
    // Update current evaluation period
    const periodInfo = document.getElementById('current-period-info');
    if (activePeriod) {
        periodInfo.textContent = `${activePeriod.PeriodName} (${formatDate(activePeriod.StartDate)} - ${formatDate(activePeriod.EndDate)})`;
    } else {
        periodInfo.textContent = 'لا توجد فترة تقييم نشطة حالياً';
    }
}

// Render employees by department chart
function renderEmployeesByDepartmentChart() {
    const employees = getAllEmployees().filter(emp => emp.IsActive === 1);
    const departments = getAllDepartments();
    
    // Count employees in each department
    const departmentCounts = departments.map(dept => {
        const count = employees.filter(emp => emp.DepartmentID === dept.DepartmentID).length;
        return {
            department: dept.DepartmentName,
            count: count
        };
    });
    
    // Prepare chart data
    const labels = departmentCounts.map(item => item.department);
    const data = departmentCounts.map(item => item.count);
    const colors = [
        'rgba(54, 162, 235, 0.8)',
        'rgba(255, 99, 132, 0.8)',
        'rgba(255, 206, 86, 0.8)',
        'rgba(75, 192, 192, 0.8)',
        'rgba(153, 102, 255, 0.8)',
        'rgba(255, 159, 64, 0.8)'
    ];
    
    // Get canvas context
    const ctx = document.getElementById('employeesByDepartmentChart').getContext('2d');
    
    // Create chart
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'عدد الموظفين',
                data: data,
                backgroundColor: colors,
                borderColor: colors.map(color => color.replace('0.8', '1')),
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    precision: 0
                }
            },
            plugins: {
                legend: {
                    display: false
                },
                title: {
                    display: true,
                    text: 'توزيع الموظفين حسب الأقسام',
                    font: {
                        size: 16
                    }
                }
            }
        }
    });
}

// Render evaluation status chart
function renderEvaluationStatusChart() {
    const evaluations = getAllEmployeeEvaluations();
    const statuses = getAllEvaluationStatuses();
    
    // Count evaluations by status
    const statusCounts = statuses.map(status => {
        const count = evaluations.filter(eval => eval.StatusID === status.StatusID).length;
        return {
            status: status.StatusName,
            count: count
        };
    });
    
    // Prepare chart data
    const labels = statusCounts.map(item => item.status);
    const data = statusCounts.map(item => item.count);
    const colors = [
        'rgba(108, 117, 125, 0.8)', // Draft (Gray)
        'rgba(0, 123, 255, 0.8)',   // Submitted (Blue)
        'rgba(255, 193, 7, 0.8)',   // In Review (Yellow)
        'rgba(40, 167, 69, 0.8)',   // Completed (Green)
        'rgba(220, 53, 69, 0.8)'    // Rejected (Red)
    ];
    
    // Get canvas context
    const ctx = document.getElementById('evaluationStatusChart').getContext('2d');
    
    // Create chart
    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: colors,
                borderColor: colors.map(color => color.replace('0.8', '1')),
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'right'
                },
                title: {
                    display: true,
                    text: 'توزيع التقييمات حسب الحالة',
                    font: {
                        size: 16
                    }
                }
            }
        }
    });
}

// Render recent evaluations table
function renderRecentEvaluations() {
    const evaluations = getAllEmployeeEvaluations();
    
    // Sort by submission date (most recent first) and take the first 5
    const recentEvaluations = evaluations
        .filter(eval => eval.SubmissionDate) // Only show submitted evaluations
        .sort((a, b) => new Date(b.SubmissionDate) - new Date(a.SubmissionDate))
        .slice(0, 5);
    
    const tableBody = document.getElementById('recent-evaluations-table-body');
    tableBody.innerHTML = '';
    
    if (recentEvaluations.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="5" class="text-center">لا توجد تقييمات حديثة</td>
            </tr>
        `;
        return;
    }
    
    recentEvaluations.forEach(evaluation => {
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
        `;
        
        tableBody.appendChild(row);
    });
}

// Get department statistics for a specific department
function getDepartmentStatistics(departmentId) {
    const employees = getEmployeesByDepartment(departmentId).filter(emp => emp.IsActive === 1);
    const evaluations = getEvaluationsByDepartment(departmentId);
    
    // Calculate average score
    let totalScore = 0;
    let scoreCount = 0;
    
    evaluations.forEach(eval => {
        if (eval.TotalScore) {
            totalScore += parseFloat(eval.TotalScore);
            scoreCount++;
        }
    });
    
    const avgScore = scoreCount > 0 ? (totalScore / scoreCount).toFixed(1) : 0;
    
    // Count evaluations by status
    const statuses = getAllEvaluationStatuses();
    const statusCounts = {};
    
    statuses.forEach(status => {
        statusCounts[status.StatusName] = evaluations.filter(eval => eval.StatusID === status.StatusID).length;
    });
    
    return {
        employeeCount: employees.length,
        evaluationCount: evaluations.length,
        averageScore: avgScore,
        statusCounts: statusCounts
    };
}
