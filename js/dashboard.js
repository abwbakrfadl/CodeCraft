/**
 * Dashboard Module
 * Handles dashboard functionality and statistics
 */

// Initialize dashboard page
function initDashboard() {
    // Update dashboard statistics
    updateDashboardStats();
    
    // Render charts
    renderEmployeesByDepartmentChart();
    renderEvaluationStatusChart();
    
    // Show recent evaluations
    renderRecentEvaluations();
    
    // If the user is a department manager, show only their department statistics
    if (isDepartmentManager() && !isAdmin() && !isHRManager()) {
        const currentEmployee = getCurrentEmployee();
        if (currentEmployee) {
            getDepartmentStatistics(currentEmployee.DepartmentID);
        }
    }
}

// Update dashboard statistics
function updateDashboardStats() {
    const departments = getAllDepartments();
    const employees = getAllEmployees();
    const activePeriod = getActiveEvaluationPeriod();
    const evaluations = getAllEmployeeEvaluations();
    
    // Filter active employees
    const activeEmployees = employees.filter(e => e.IsActive === 1);
    
    // Count evaluations for active period
    let activeEvaluations = [];
    if (activePeriod) {
        activeEvaluations = evaluations.filter(e => e.PeriodID === activePeriod.PeriodID);
    }
    
    // Count completed evaluations
    const completedEvaluations = activeEvaluations.filter(e => e.StatusID === 4);
    
    // Count pending evaluations
    const pendingEvaluations = activeEvaluations.filter(e => e.StatusID !== 4 && e.StatusID !== 5);
    
    // Update statistics in the UI
    document.getElementById('stat-departments').textContent = departments.length;
    document.getElementById('stat-employees').textContent = activeEmployees.length;
    document.getElementById('stat-completed-evaluations').textContent = completedEvaluations.length;
    document.getElementById('stat-pending-evaluations').textContent = pendingEvaluations.length;
    
    // Update current period info
    if (activePeriod) {
        document.getElementById('active-period-name').textContent = activePeriod.PeriodName;
        document.getElementById('active-period-dates').textContent = `${formatDate(activePeriod.StartDate)} - ${formatDate(activePeriod.EndDate)}`;
        document.getElementById('no-active-period').classList.add('d-none');
        document.getElementById('active-period-info').classList.remove('d-none');
    } else {
        document.getElementById('no-active-period').classList.remove('d-none');
        document.getElementById('active-period-info').classList.add('d-none');
    }
}

// Render chart showing employees by department
function renderEmployeesByDepartmentChart() {
    const departments = getAllDepartments();
    const employees = getAllEmployees().filter(e => e.IsActive === 1);
    
    // Count employees by department
    const departmentCounts = {};
    departments.forEach(dept => {
        departmentCounts[dept.DepartmentID] = 0;
    });
    
    employees.forEach(emp => {
        if (departmentCounts[emp.DepartmentID] !== undefined) {
            departmentCounts[emp.DepartmentID]++;
        }
    });
    
    // Prepare chart data
    const deptNames = [];
    const deptCounts = [];
    const backgroundColors = [
        'rgba(75, 192, 192, 0.2)',
        'rgba(54, 162, 235, 0.2)',
        'rgba(255, 206, 86, 0.2)',
        'rgba(255, 99, 132, 0.2)',
        'rgba(153, 102, 255, 0.2)'
    ];
    const borderColors = [
        'rgba(75, 192, 192, 1)',
        'rgba(54, 162, 235, 1)',
        'rgba(255, 206, 86, 1)',
        'rgba(255, 99, 132, 1)',
        'rgba(153, 102, 255, 1)'
    ];
    
    departments.forEach((dept, index) => {
        deptNames.push(dept.DepartmentName);
        deptCounts.push(departmentCounts[dept.DepartmentID]);
    });
    
    // Create chart
    const ctx = document.getElementById('employeesByDepartmentChart').getContext('2d');
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: deptNames,
            datasets: [{
                label: 'عدد الموظفين',
                data: deptCounts,
                backgroundColor: backgroundColors,
                borderColor: borderColors,
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1
                    }
                }
            }
        }
    });
}

// Render chart showing evaluation statuses
function renderEvaluationStatusChart() {
    const activePeriod = getActiveEvaluationPeriod();
    if (!activePeriod) return;
    
    const evaluations = getAllEmployeeEvaluations().filter(e => e.PeriodID === activePeriod.PeriodID);
    const statuses = getAllEvaluationStatuses();
    
    // Count evaluations by status
    const statusCounts = {};
    statuses.forEach(status => {
        statusCounts[status.StatusID] = 0;
    });
    
    evaluations.forEach(eval => {
        if (statusCounts[eval.StatusID] !== undefined) {
            statusCounts[eval.StatusID]++;
        }
    });
    
    // Prepare chart data
    const statusNames = [];
    const statusValues = [];
    const backgroundColors = [
        'rgba(108, 117, 125, 0.2)',  // Draft - Gray
        'rgba(13, 110, 253, 0.2)',   // Submitted - Blue
        'rgba(255, 193, 7, 0.2)',    // In Review - Yellow
        'rgba(25, 135, 84, 0.2)',    // Completed - Green
        'rgba(220, 53, 69, 0.2)'     // Rejected - Red
    ];
    const borderColors = [
        'rgba(108, 117, 125, 1)',
        'rgba(13, 110, 253, 1)',
        'rgba(255, 193, 7, 1)',
        'rgba(25, 135, 84, 1)',
        'rgba(220, 53, 69, 1)'
    ];
    
    statuses.forEach((status, index) => {
        statusNames.push(status.Description);
        statusValues.push(statusCounts[status.StatusID]);
    });
    
    // Create chart
    const ctx = document.getElementById('evaluationStatusChart').getContext('2d');
    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: statusNames,
            datasets: [{
                data: statusValues,
                backgroundColor: backgroundColors,
                borderColor: borderColors,
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'right'
                }
            }
        }
    });
}

// Render recent evaluations table
function renderRecentEvaluations() {
    const evaluations = getAllEmployeeEvaluations();
    const employees = getAllEmployees();
    const periods = getAllEvaluationPeriods();
    
    // Sort evaluations by date (newest first)
    const sortedEvaluations = [...evaluations].sort((a, b) => {
        return new Date(b.UpdatedAt) - new Date(a.UpdatedAt);
    });
    
    // Take only the 5 most recent evaluations
    const recentEvaluations = sortedEvaluations.slice(0, 5);
    
    // Generate table rows
    let tableHtml = '';
    
    if (recentEvaluations.length === 0) {
        tableHtml = `<tr><td colspan="5" class="text-center">لا توجد تقييمات حديثة</td></tr>`;
    } else {
        recentEvaluations.forEach(eval => {
            const employee = employees.find(e => e.EmployeeID === eval.EmployeeID);
            const evaluator = employees.find(e => e.EmployeeID === eval.EvaluatorID);
            const period = periods.find(p => p.PeriodID === eval.PeriodID);
            
            const employeeName = employee ? employee.FullName : 'غير معروف';
            const evaluatorName = evaluator ? evaluator.FullName : 'غير معروف';
            const periodName = period ? period.PeriodName : 'غير معروف';
            const status = formatStatus(eval.StatusID);
            const score = eval.TotalScore ? formatScore(eval.TotalScore) : '-';
            
            tableHtml += `
                <tr>
                    <td>${employeeName}</td>
                    <td>${evaluatorName}</td>
                    <td>${periodName}</td>
                    <td>${status}</td>
                    <td>${score}</td>
                </tr>
            `;
        });
    }
    
    // Update table
    document.getElementById('recent-evaluations-body').innerHTML = tableHtml;
}

// Get department-specific statistics
function getDepartmentStatistics(departmentId) {
    const employees = getAllEmployees().filter(e => e.DepartmentID === departmentId && e.IsActive === 1);
    const activePeriod = getActiveEvaluationPeriod();
    
    let departmentEvaluations = [];
    if (activePeriod) {
        const allEvaluations = getAllEmployeeEvaluations().filter(e => e.PeriodID === activePeriod.PeriodID);
        departmentEvaluations = allEvaluations.filter(eval => {
            const employee = employees.find(e => e.EmployeeID === eval.EmployeeID);
            return employee !== undefined;
        });
    }
    
    // Count completed evaluations
    const completedEvaluations = departmentEvaluations.filter(e => e.StatusID === 4);
    
    // Count pending evaluations
    const pendingEvaluations = departmentEvaluations.filter(e => e.StatusID !== 4 && e.StatusID !== 5);
    
    // Calculate completion percentage
    const totalRequired = employees.length;
    const completionPercentage = totalRequired > 0 ? 
        Math.round((completedEvaluations.length / totalRequired) * 100) : 0;
    
    // Update department statistics card
    document.getElementById('dept-employees-count').textContent = employees.length;
    document.getElementById('dept-completed-count').textContent = completedEvaluations.length;
    document.getElementById('dept-pending-count').textContent = pendingEvaluations.length;
    document.getElementById('dept-completion-percentage').textContent = `${completionPercentage}%`;
    
    // Show department statistics card
    document.getElementById('department-stats-card').classList.remove('d-none');
}
