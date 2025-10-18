
    let adminCurrentPage = 1;
    let adminTotalPages = 1;

    document.addEventListener('DOMContentLoaded', function() {
        loadAdminData();

        document.getElementById('adminSearch').addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                adminCurrentPage = 1;
                loadAdminData();
            }
        });
    });

    async function loadAdminData() {
        const searchValue = document.getElementById('adminSearch').value;
        const params = new URLSearchParams({
            page: adminCurrentPage,
            per_page: 25,
            search: searchValue
        });

        try {
            const response = await fetch(`/api/data?${params}`);
            const data = await response.json();

            displayAdminData(data.records);
            updateAdminPagination(data.current_page, data.pages);
        } catch (error) {
            console.error('Error loading data:', error);
            showAlert('Error loading data', 'error');
        }
    }

    function displayAdminData(records) {
        const tbody = document.getElementById('adminTableBody');
        
        if (records.length === 0) {
            tbody.innerHTML = '<tr><td colspan="9" class="loading">No records found</td></tr>';
            return;
        }

        tbody.innerHTML = records.map(record => `
            <tr>
                <td><strong>${record.sn || ''}</strong></td>
                <td>${record.wk || ''}</td>
                <td>${record.date || ''}</td>
                <td>${record.model || ''}</td>
                <td>${record.grade || ''}</td>
                <td>${record.root_cause || ''}</td>
                <td>${record.category || ''}</td>
                <td>${record.risky_station || ''}</td>
                <td>
                    <div class="action-buttons">
                        <button class="btn btn-secondary" onclick='editRecord(${JSON.stringify(record)})'>Edit</button>
                        <button class="btn btn-danger" onclick="deleteRecord(${record.id}, '${record.sn}')">Delete</button>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    function updateAdminPagination(current, total) {
        adminCurrentPage = current;
        adminTotalPages = total;
        
        document.getElementById('adminCurrentPage').textContent = current;
        document.getElementById('adminTotalPages').textContent = total;
        
        document.getElementById('adminPrevBtn').disabled = current === 1;
        document.getElementById('adminNextBtn').disabled = current === total || total === 0;
    }

    function changeAdminPage(delta) {
        adminCurrentPage += delta;
        loadAdminData();
    }

    function openAddModal() {
        document.getElementById('modalTitle').textContent = 'Add New Record';
        document.getElementById('recordForm').reset();
        document.getElementById('recordId').value = '';
        document.getElementById('recordModal').classList.add('active');
    }

    function editRecord(record) {
        document.getElementById('modalTitle').textContent = 'Edit Record';
        document.getElementById('recordId').value = record.id;
        
        // Populate form fields
        document.getElementById('wk').value = record.wk || '';
        document.getElementById('month').value = record.month || '';
        document.getElementById('dd').value = record.dd || '';
        document.getElementById('year').value = record.year || '';
        document.getElementById('date').value = record.date || '';
        document.getElementById('sn').value = record.sn || '';
        document.getElementById('model').value = record.model || '';
        document.getElementById('test_failure_items').value = record.test_failure_items || '';
        document.getElementById('weight_gap').value = record.weight_gap || '';
        document.getElementById('grade').value = record.grade || '';
        document.getElementById('line').value = record.line || '';
        document.getElementById('root_cause').value = record.root_cause || '';
        document.getElementById('category').value = record.category || '';
        document.getElementById('risky_station').value = record.risky_station || '';
        document.getElementById('area').value = record.area || '';
        document.getElementById('sampling_case').value = record.sampling_case || '';
        document.getElementById('station_al').value = record.station_al || '';
        document.getElementById('radar_number').value = record.radar_number || '';
        
        document.getElementById('recordModal').classList.add('active');
    }

    function closeModal() {
        document.getElementById('recordModal').classList.remove('active');
    }

    async function saveRecord(event) {
        event.preventDefault();
        
        const recordId = document.getElementById('recordId').value;
        const data = {
            wk: document.getElementById('wk').value,
            month: document.getElementById('month').value,
            dd: document.getElementById('dd').value,
            year: document.getElementById('year').value,
            date: document.getElementById('date').value,
            sn: document.getElementById('sn').value,
            model: document.getElementById('model').value,
            test_failure_items: document.getElementById('test_failure_items').value,
            weight_gap: document.getElementById('weight_gap').value,
            grade: document.getElementById('grade').value,
            line: document.getElementById('line').value,
            root_cause: document.getElementById('root_cause').value,
            category: document.getElementById('category').value,
            risky_station: document.getElementById('risky_station').value,
            area: document.getElementById('area').value,
            sampling_case: document.getElementById('sampling_case').value,
            station_al: document.getElementById('station_al').value,
            radar_number: document.getElementById('radar_number').value
        };

        try {
            const url = recordId ? `/api/admin/record/${recordId}` : '/api/admin/record';
            const method = recordId ? 'PUT' : 'POST';
            
            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            if (response.ok) {
                showAlert(recordId ? 'Record updated successfully' : 'Record added successfully', 'success');
                closeModal();
                loadAdminData();
            } else {
                showAlert('Error saving record', 'error');
            }
        } catch (error) {
            console.error('Error saving record:', error);
            showAlert('Error saving record', 'error');
        }
    }

    async function deleteRecord(id, sn) {
        if (!confirm(`Are you sure you want to delete record with SN: ${sn}?`)) {
            return;
        }

        try {
            const response = await fetch(`/api/admin/record/${id}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                showAlert('Record deleted successfully', 'success');
                loadAdminData();
            } else {
                showAlert('Error deleting record', 'error');
            }
        } catch (error) {
            console.error('Error deleting record:', error);
            showAlert('Error deleting record', 'error');
        }
    }

    function showAlert(message, type) {
        const alertBox = document.getElementById('alertBox');
        const alert = document.createElement('div');
        alert.className = `alert alert-${type === 'success' ? 'success' : 'error'}`;
        alert.textContent = message;
        alert.style.marginBottom = '0.5rem';
        
        alertBox.appendChild(alert);
        
        setTimeout(() => {
            alert.remove();
        }, 3000);
    }
