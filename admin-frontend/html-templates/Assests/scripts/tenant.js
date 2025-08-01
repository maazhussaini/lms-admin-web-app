// ===== TENANT DASHBOARD JAVASCRIPT =====

class TenantDashboard {
    constructor() {
        this.selectedRows = new Set();
        this.allRowsSelected = false;
        this.currentPage = 1;
        this.rowsPerPage = 10;
        this.totalRows = 100;
        
        this.initializeEventListeners();
        this.populateTable();
        this.updatePagination();
    }

    initializeEventListeners() {
        // Off-canvas controls
        this.setupOffcanvasControls();
        
        // Table controls
        this.setupTableControls();
        
        // Filter controls
        this.setupFilterControls();
        
        // Search functionality
        this.setupSearch();
        
        // Pagination
        this.setupPagination();
        
        // Context menu
        this.setupContextMenu();
        
        // Form controls
        this.setupFormControls();
    }

    setupOffcanvasControls() {
        // Add Tenant Off-canvas
        const addTenantBtn = document.getElementById('addTenantBtn');
        const addTenantOffcanvas = document.getElementById('addTenantOffcanvas');
        const addTenantOffcanvasClose = document.getElementById('addTenantOffcanvasClose');

        addTenantBtn?.addEventListener('click', () => {
            addTenantOffcanvas.classList.add('active');
        });

        addTenantOffcanvasClose?.addEventListener('click', () => {
            addTenantOffcanvas.classList.remove('active');
        });

        // Filter Popup
        const filterBtn = document.getElementById('filterBtn');
        const filterPopup = document.getElementById('filterPopup');

        filterBtn?.addEventListener('click', (e) => {
            e.stopPropagation();
            
            // Close any other open popups
            document.querySelectorAll('.context-menu.active, .filter-popup.active').forEach(popup => {
                if (popup !== filterPopup) {
                    popup.classList.remove('active');
                }
            });
            
            // Position the popup relative to the filter button
            const rect = filterBtn.getBoundingClientRect();
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
            
            // For mobile, use fixed positioning
            if (window.innerWidth <= 480) {
                filterPopup.style.position = 'fixed';
                filterPopup.style.top = (rect.bottom + 8) + 'px';
                filterPopup.style.right = '16px';
                filterPopup.style.left = 'auto';
            } else {
                // For desktop, use absolute positioning
                filterPopup.style.position = 'absolute';
                filterPopup.style.top = (rect.bottom + scrollTop + 8) + 'px';
                filterPopup.style.right = (window.innerWidth - rect.right) + 'px';
                filterPopup.style.left = 'auto';
            }
            
            // Toggle the popup
            filterPopup.classList.toggle('active');
        });

        // Close filter popup when clicking outside
        document.addEventListener('click', (e) => {
            if (!filterPopup?.contains(e.target) && !filterBtn?.contains(e.target)) {
                filterPopup?.classList.remove('active');
            }
        });

        // Close off-canvas on overlay click
        addTenantOffcanvas?.addEventListener('click', (e) => {
            if (e.target === addTenantOffcanvas) {
                addTenantOffcanvas.classList.remove('active');
            }
        });

        // Close off-canvas/popup on Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                if (addTenantOffcanvas?.classList.contains('active')) {
                    addTenantOffcanvas.classList.remove('active');
                }
                if (filterPopup?.classList.contains('active')) {
                    filterPopup.classList.remove('active');
                }
            }
        });
    }

    setupTableControls() {
        // Select all checkbox
        const selectAllCheckbox = document.getElementById('selectAll');
        selectAllCheckbox?.addEventListener('change', (e) => {
            this.handleSelectAll(e.target.checked);
        });

        // Individual row checkboxes
        document.addEventListener('change', (e) => {
            if (e.target.classList.contains('row-checkbox')) {
                this.handleRowSelection(e.target);
            }
        });
    }

    setupFilterControls() {
        const applyFilters = document.getElementById('applyFilters');
        const resetAllFilters = document.getElementById('resetAllFilters');

        applyFilters?.addEventListener('click', () => {
            this.applyFilters();
        });

        resetAllFilters?.addEventListener('click', () => {
            this.resetFilters();
        });

        // Individual filter resets
        document.querySelectorAll('.filter-option-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const filterGroup = e.target.closest('.filter-group');
                const select = filterGroup.querySelector('.filter-select, .filter-date-input');
                if (select) select.value = '';
            });
        });
    }

    setupSearch() {
        const searchInput = document.querySelector('.search-input');
        let searchTimeout;

        searchInput?.addEventListener('input', (e) => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                this.performSearch(e.target.value);
            }, 300);
        });
    }

    setupPagination() {
        // Handle page button clicks
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('page-btn') && !e.target.disabled) {
                const page = parseInt(e.target.dataset.page);
                if (!isNaN(page)) {
                    this.goToPage(page);
                }
            }
            
            // Handle navigation buttons
            if (e.target.closest('#prevBtn')) {
                if (this.currentPage > 1) {
                    this.goToPage(this.currentPage - 1);
                }
            }
            
            if (e.target.closest('#nextBtn')) {
                const totalPages = Math.ceil(this.totalRows / this.rowsPerPage);
                if (this.currentPage < totalPages) {
                    this.goToPage(this.currentPage + 1);
                }
            }
        });
    }

    setupContextMenu() {
        let contextMenu = document.getElementById('actionMenu');
        let currentRow = null;

        // Show context menu on action button click
        document.addEventListener('click', (e) => {
            // Check if clicked element is action button or icon inside it
            const actionBtn = e.target.closest('.action-btn');
            if (actionBtn) {
                e.preventDefault();
                e.stopPropagation();
                
                currentRow = actionBtn.closest('tr');
                const rect = actionBtn.getBoundingClientRect();
                const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
                const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
                
                // Position context menu 10px below the clicked action button
                // Calculate proper position relative to document
                const left = rect.left + scrollLeft - 60; // Adjust 100px to the left for better positioning
                const top = rect.bottom + scrollTop + 5; // 10px below the button
                
                contextMenu.style.position = 'absolute';
                contextMenu.style.left = `${left}px`;
                contextMenu.style.top = `${top}px`;
                contextMenu.classList.add('active');
            }
        });

        // Handle context menu actions
        document.querySelectorAll('.context-menu-item').forEach(item => {
            item.addEventListener('click', (e) => {
                const action = e.currentTarget.dataset.action;
                if (currentRow) {
                    this.handleRowAction(action, currentRow);
                }
                contextMenu.classList.remove('active');
            });
        });

        // Hide context menu on outside click
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.context-menu') && !e.target.closest('.action-btn')) {
                contextMenu.classList.remove('active');
            }
        });
    }

    setupFormControls() {
        // File upload areas
        document.querySelectorAll('.file-upload-area').forEach(area => {
            area.addEventListener('click', () => {
                // Create hidden file input
                const fileInput = document.createElement('input');
                fileInput.type = 'file';
                fileInput.accept = '.jpg,.jpeg,.png';
                fileInput.onchange = (e) => {
                    this.handleFileUpload(e.target.files[0], area);
                };
                fileInput.click();
            });

            // Drag and drop functionality
            area.addEventListener('dragover', (e) => {
                e.preventDefault();
                area.style.borderColor = '#8B5CF6';
                area.style.background = '#F8FAFC';
            });

            area.addEventListener('dragleave', () => {
                area.style.borderColor = '#D1D5DB';
                area.style.background = 'white';
            });

            area.addEventListener('drop', (e) => {
                e.preventDefault();
                const files = e.dataTransfer.files;
                if (files.length > 0) {
                    this.handleFileUpload(files[0], area);
                }
                area.style.borderColor = '#D1D5DB';
                area.style.background = 'white';
            });
        });

        // Color inputs
        document.querySelectorAll('.color-preview').forEach(preview => {
            preview.addEventListener('click', () => {
                const colorInput = preview.nextElementSibling;
                const hiddenColorPicker = document.createElement('input');
                hiddenColorPicker.type = 'color';
                hiddenColorPicker.value = colorInput.value;
                hiddenColorPicker.onchange = (e) => {
                    const newColor = e.target.value;
                    colorInput.value = newColor;
                    preview.style.backgroundColor = newColor;
                };
                hiddenColorPicker.click();
            });
        });
    }

    populateTable() {
        const tableBody = document.getElementById('tenantTableBody');
        if (!tableBody) return;

        const tenants = this.generateSampleData();
        tableBody.innerHTML = '';

        tenants.forEach((tenant, index) => {
            const row = this.createTableRow(tenant, index);
            tableBody.appendChild(row);
        });
    }

    generateSampleData() {
        const statuses = ['active', 'pending', 'progress'];
        const statusLabels = ['Active', 'Pending', 'In Progress'];
        const logoColors = ['green', 'blue', 'orange', 'purple'];
        
        return Array.from({ length: this.rowsPerPage }, (_, i) => ({
            id: i + 1,
            logo: String.fromCharCode(65 + (i % 4)), // A, B, C, D
            logoColor: logoColors[i % 4],
            name: `tenant ${(i % 4) + 1}`,
            clients: String(Math.floor(Math.random() * 20) + 1).padStart(2, '0'),
            phone: '+92 333 123-1079',
            email: 'holly@gmail.com',
            createdAt: '20-06-2020',
            updatedAt: '20-06-2020',
            status: statuses[i % 3],
            statusLabel: statusLabels[i % 3]
        }));
    }

    createTableRow(tenant, index) {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>
                <input type="checkbox" class="table-checkbox row-checkbox" data-id="${tenant.id}">
            </td>
            <td>
                <div class="tenant-logo ${tenant.logoColor}">
                    ${tenant.logo}
                </div>
            </td>
            <td>${tenant.name}</td>
            <td>${tenant.clients}</td>
            <td>${tenant.phone}</td>
            <td>${tenant.email}</td>
            <td>${tenant.createdAt}</td>
            <td>${tenant.updatedAt}</td>
            <td>
                <span class="status-badge ${tenant.status}">${tenant.statusLabel}</span>
            </td>
            <td>
                <button class="action-btn">
                    <i class="ic-11"></i>
                </button>
            </td>
        `;
        return row;
    }

    handleSelectAll(checked) {
        const rowCheckboxes = document.querySelectorAll('.row-checkbox');
        rowCheckboxes.forEach(checkbox => {
            checkbox.checked = checked;
            if (checked) {
                this.selectedRows.add(parseInt(checkbox.dataset.id));
            } else {
                this.selectedRows.delete(parseInt(checkbox.dataset.id));
            }
        });
        
        this.updateBulkActions();
    }

    handleRowSelection(checkbox) {
        const id = parseInt(checkbox.dataset.id);
        if (checkbox.checked) {
            this.selectedRows.add(id);
        } else {
            this.selectedRows.delete(id);
        }

        // Update select all checkbox
        const selectAllCheckbox = document.getElementById('selectAll');
        const rowCheckboxes = document.querySelectorAll('.row-checkbox');
        const checkedBoxes = document.querySelectorAll('.row-checkbox:checked');
        
        selectAllCheckbox.checked = checkedBoxes.length === rowCheckboxes.length;
        selectAllCheckbox.indeterminate = checkedBoxes.length > 0 && checkedBoxes.length < rowCheckboxes.length;

        this.updateBulkActions();
    }

    updateBulkActions() {
        const bulkActions = document.getElementById('bulkActions');
        const selectedCount = document.getElementById('selectedCount');
        
        if (this.selectedRows.size > 0) {
            bulkActions.style.display = 'flex';
            selectedCount.textContent = this.selectedRows.size;
        } else {
            bulkActions.style.display = 'none';
        }
    }

    handleRowAction(action, row) {
        const tenantName = row.cells[2].textContent;
        
        switch (action) {
            case 'view':
                console.log(`Viewing tenant: ${tenantName}`);
                break;
            case 'edit':
                console.log(`Editing tenant: ${tenantName}`);
                break;
            case 'delete':
                if (confirm(`Are you sure you want to delete ${tenantName}?`)) {
                    row.remove();
                    console.log(`Deleted tenant: ${tenantName}`);
                }
                break;
        }
    }

    performSearch(query) {
        console.log(`Searching for: ${query}`);
        // Implement search logic here
        this.populateTable(); // For demo, just repopulate
    }

    applyFilters() {
        const filterModal = document.getElementById('filterModal');
        console.log('Applying filters...');
        // Implement filter logic here
        filterModal.classList.remove('active');
        this.populateTable(); // For demo, just repopulate
    }

    resetFilters() {
        document.querySelectorAll('.filter-select, .filter-date-input').forEach(input => {
            input.value = '';
        });
        console.log('Filters reset');
    }

    goToPage(page) {
        this.currentPage = page;
        console.log(`Going to page: ${page}`);
        
        // Update pagination buttons
        document.querySelectorAll('.page-btn').forEach(btn => {
            btn.classList.remove('active');
            if (parseInt(btn.dataset.page) === page) {
                btn.classList.add('active');
            }
        });
        
        // Update navigation buttons
        const prevBtn = document.getElementById('prevBtn');
        const nextBtn = document.getElementById('nextBtn');
        const totalPages = Math.ceil(this.totalRows / this.rowsPerPage);
        
        if (prevBtn) {
            prevBtn.disabled = page <= 1;
        }
        
        if (nextBtn) {
            nextBtn.disabled = page >= totalPages;
        }
        
        this.populateTable();
        this.updatePagination();
    }

    updatePagination() {
        const totalPages = Math.ceil(this.totalRows / this.rowsPerPage);
        
        // Update pagination info
        const paginationInfo = document.querySelector('.pagination-info');
        if (paginationInfo) {
            const start = (this.currentPage - 1) * this.rowsPerPage + 1;
            const end = Math.min(this.currentPage * this.rowsPerPage, this.totalRows);
            paginationInfo.textContent = `Showing ${this.rowsPerPage} Out Of ${this.totalRows} Entries`;
        }
        
        // Update navigation buttons state
        const prevBtn = document.getElementById('prevBtn');
        const nextBtn = document.getElementById('nextBtn');
        
        if (prevBtn) {
            prevBtn.disabled = this.currentPage <= 1;
        }
        
        if (nextBtn) {
            nextBtn.disabled = this.currentPage >= totalPages;
        }
    }

    handleFileUpload(file, uploadArea) {
        if (file && file.type.startsWith('image/')) {
            if (file.size <= 2 * 1024 * 1024) { // 2MB limit
                console.log(`File uploaded: ${file.name}`);
                const uploadText = uploadArea.querySelector('.upload-text');
                uploadText.innerHTML = `<span style="color: #10B981;">✓ ${file.name}</span>`;
            } else {
                alert('File size must be less than 2MB');
            }
        } else {
            alert('Please select a valid image file (JPG or PNG)');
        }
    }
}

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new TenantDashboard();
});

// Additional utility functions
function formatDate(date) {
    return new Date(date).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
}

function generateId() {
    return Math.random().toString(36).substr(2, 9);
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}
