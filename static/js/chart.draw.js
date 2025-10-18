    let currentPage = 1;
    let totalPages = 1;
    let searchTimeout;
    let donutChart = null;
    let barChart = null;
    let currentDonutFilter = 'wk';
    let currentBarFilter = 'wk';
    let allRecords = [];

    const filters = {
        wk: [],
        model: [],
        line: [],
        root_cause: [],
        category: [],
        risky_station: []
    };

    // Color palette for charts
    const chartColors = [
        '#667eea', '#764ba2', '#f093fb', '#4facfe', '#43e97b',
        '#fa709a', '#fee140', '#30cfd0', '#a8edea', '#fed6e3',
        '#74b9ff', '#a29bfe', '#6c5ce7', '#00b894', '#fdcb6e',
        '#e17055', '#74b9ff', '#81ecec', '#55efc4', '#fab1a0'
    ];

    // Initialize
    document.addEventListener('DOMContentLoaded', function() {
        loadFilters();
        loadData();
        setupChartSelectors();

        // Search with debounce
        document.getElementById('searchInput').addEventListener('input', function() {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                currentPage = 1;
                loadData();
            }, 500);
        });

        // Close dropdowns when clicking outside
        document.addEventListener('click', function(e) {
            if (!e.target.closest('.multiselect')) {
                document.querySelectorAll('.multiselect-dropdown').forEach(dd => {
                    dd.classList.remove('active');
                });
            }
        });
    });

    function setupChartSelectors() {
        // Donut chart selectors
        document.querySelectorAll('.chart-card:nth-child(1) .chart-selector-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                document.querySelectorAll('.chart-card:nth-child(1) .chart-selector-btn').forEach(b => b.classList.remove('active'));
                this.classList.add('active');
                currentDonutFilter = this.dataset.chart;
                updateCharts();
            });
        });

        // Bar chart selectors
        document.querySelectorAll('.chart-card:nth-child(2) .chart-selector-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                document.querySelectorAll('.chart-card:nth-child(2) .chart-selector-btn').forEach(b => b.classList.remove('active'));
                this.classList.add('active');
                currentBarFilter = this.dataset.chart;
                updateCharts();
            });
        });
    }

    function toggleDropdown(trigger) {
        const dropdown = trigger.nextElementSibling;
        const wasActive = dropdown.classList.contains('active');
        
        // Close all dropdowns
        document.querySelectorAll('.multiselect-dropdown').forEach(dd => {
            dd.classList.remove('active');
        });
        
        // Toggle current
        if (!wasActive) {
            dropdown.classList.add('active');
        }
    }

    async function loadFilters() {
        try {
            const response = await fetch('/api/filters');
            const data = await response.json();

            populateFilter('wk', data.weeks);
            populateFilter('model', data.models);
            populateFilter('line', data.lines);
            populateFilter('root_cause', data.root_causes);
            populateFilter('category', data.categories);
            populateFilter('risky_station', data.risky_stations);
        } catch (error) {
            console.error('Error loading filters:', error);
        }
    }

    function populateFilter(filterName, options) {
        const multiselect = document.querySelector(`[data-filter="${filterName}"]`);
        const dropdown = multiselect.querySelector('.multiselect-dropdown');
        
        dropdown.innerHTML = '';
        
        options.sort().forEach(option => {
            const div = document.createElement('div');
            div.className = 'multiselect-option';
            div.innerHTML = `
                <input type="checkbox" value="${option}" onchange="updateFilter('${filterName}', this)">
                <label>${option}</label>
            `;
            dropdown.appendChild(div);
        });
    }

    function updateFilter(filterName, checkbox) {
        if (checkbox.checked) {
            filters[filterName].push(checkbox.value);
        } else {
            filters[filterName] = filters[filterName].filter(v => v !== checkbox.value);
        }

        const multiselect = document.querySelector(`[data-filter="${filterName}"]`);
        const selectedText = multiselect.querySelector('.selected-text');
        const count = filters[filterName].length;
        selectedText.textContent = count === 0 ? 'All' : `${count} selected`;

        currentPage = 1;
        loadData();
    }

    async function loadData() {
        const searchValue = document.getElementById('searchInput').value;
        const params = new URLSearchParams({
            page: currentPage,
            per_page: 25,
            search: searchValue
        });

        Object.keys(filters).forEach(key => {
            filters[key].forEach(value => {
                params.append(`${key}[]`, value);
            });
        });

        try {
            const response = await fetch(`/api/data?${params}`);
            const data = await response.json();

            displayData(data.records);
            updatePagination(data.current_page, data.pages, data.total);

            // Load all filtered data for charts
            await loadAllFilteredData();
        } catch (error) {
            console.error('Error loading data:', error);
            document.getElementById('tableBody').innerHTML = 
                '<tr><td colspan="17" class="loading">Error loading data</td></tr>';
        }
    }

    async function loadAllFilteredData() {
        const searchValue = document.getElementById('searchInput').value;
        const params = new URLSearchParams({
            page: 1,
            per_page: 10000,
            search: searchValue
        });

        Object.keys(filters).forEach(key => {
            filters[key].forEach(value => {
                params.append(`${key}[]`, value);
            });
        });

        try {
            const response = await fetch(`/api/data?${params}`);
            const data = await response.json();
            allRecords = data.records;
            updateCharts();
        } catch (error) {
            console.error('Error loading filtered data for charts:', error);
        }
    }

    function displayData(records) {
        const tbody = document.getElementById('tableBody');
        
        if (records.length === 0) {
            tbody.innerHTML = '<tr><td colspan="17" class="loading">No records found</td></tr>';
            return;
        }

        tbody.innerHTML = records.map(record => `
            <tr>
                <td>${record.wk || ''}</td>
                <td>${record.month || ''}</td>
                <td>${record.dd || ''}</td>
                <td>${record.year || ''}</td>
                <td>${record.date || ''}</td>
                <td><strong>${record.sn || ''}</strong></td>
                <td>${record.model || ''}</td>
                <td>${record.test_failure_items || ''}</td>
                <td>${record.weight_gap || ''}</td>
                <td>${record.grade || ''}</td>
                <td>${record.line || ''}</td>
                <td>${record.root_cause || ''}</td>
                <td>${record.category || ''}</td>
                <td>${record.risky_station || ''}</td>
                <td>${record.area || ''}</td>
                <td>${record.sampling_case || ''}</td>
                <td>${record.radar_number || ''}</td>
            </tr>
        `).join('');
    }

    function updatePagination(current, total, recordCount) {
        currentPage = current;
        totalPages = total;
        
        document.getElementById('currentPage').textContent = current;
        document.getElementById('totalPages').textContent = total;
        
        document.getElementById('prevBtn').disabled = current === 1;
        document.getElementById('nextBtn').disabled = current === total || total === 0;
    }

    function changePage(delta) {
        currentPage += delta;
        loadData();
    }

    function updateCharts() {
        updateDonutChart();
        updateBarChart();
    }

    function updateDonutChart() {
        const data = aggregateData(currentDonutFilter);
        
        if (Object.keys(data).length === 0) {
            document.querySelector('.chart-card:nth-child(1) .chart-container').innerHTML = 
                '<div class="no-data-message">No data available for selected filters</div>';
            return;
        }

        const ctx = document.getElementById('donutChart').getContext('2d');
        
        if (donutChart) {
            donutChart.destroy();
        }

        donutChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: Object.keys(data),
                datasets: [{
                    data: Object.values(data),
                    backgroundColor: chartColors.slice(0, Object.keys(data).length),
                    borderColor: '#fff',
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'right',
                        labels: {
                            padding: 15,
                            font: { size: 12 }
                        }
                    }
                }
            }
        });
    }

    function updateBarChart() {
        const data = aggregateData(currentBarFilter);
        
        if (Object.keys(data).length === 0) {
            document.querySelector('.chart-card:nth-child(2) .chart-container').innerHTML = 
                '<div class="no-data-message">No data available for selected filters</div>';
            return;
        }

        const ctx = document.getElementById('barChart').getContext('2d');
        
        if (barChart) {
            barChart.destroy();
        }

        barChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: Object.keys(data),
                datasets: [{
                    label: 'Record Count',
                    data: Object.values(data),
                    backgroundColor: '#667eea',
                    borderColor: '#5568d3',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                indexAxis: 'y',
                plugins: {
                    legend: {
                        display: true
                    }
                },
                scales: {
                    x: {
                        beginAtZero: true,
                        ticks: {
                            stepSize: 1
                        }
                    }
                }
            }
        });
    }

    function aggregateData(filterType) {
        const aggregated = {};
        
        allRecords.forEach(record => {
            const key = record[filterType] || 'Unknown';
            aggregated[key] = (aggregated[key] || 0) + 1;
        });

        return Object.fromEntries(
            Object.entries(aggregated).sort((a, b) => b[1] - a[1])
        );
    }

    function exportData() {
        const searchValue = document.getElementById('searchInput').value;
        const params = new URLSearchParams({
            search: searchValue
        });

        Object.keys(filters).forEach(key => {
            filters[key].forEach(value => {
                params.append(`${key}[]`, value);
            });
        });

        window.location.href = `/api/export?${params}`;
    }