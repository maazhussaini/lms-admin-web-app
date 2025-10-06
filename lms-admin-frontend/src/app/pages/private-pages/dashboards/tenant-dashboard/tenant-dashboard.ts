import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Paginator } from '../../../../components/widgets/paginator/paginator';
import { OffCanvasWrapper } from '../../../../components/widgets/off-canvas-wrapper/off-canvas-wrapper';
import { BasicTenantForm, BasicTenantFormData } from '../../../../components/forms/basic-tenant-form/basic-tenant-form';

export interface Tenant {
  id: number;
  name: string;
  email: string;
  phone: string;
  clientsCount: number;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  logoInitial: string;
  logoClass: string;
}

export interface NewTenant {
  name: string;
  email: string;
  phone: string;
  clientsCount: number;
}

export interface Filters {
  tenant: string;
  status: string;
  startDate: string;
  endDate: string;
}

@Component({
  selector: 'app-tenant-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, Paginator, OffCanvasWrapper, BasicTenantForm],
  templateUrl: './tenant-dashboard.html',
  styleUrls: ['./tenant-dashboard.scss']
})
export class TenantDashboard implements OnInit, OnDestroy {
  
  currentUser: any = null;
  permissions: string[] = [];

  // Search and filtering
  searchTerm: string = '';
  showFilterPopup: boolean = false;
  filters: Filters = {
    tenant: '',
    status: '',
    startDate: '',
    endDate: ''
  };

  // Tenant data
  allTenants: Tenant[] = [];
  filteredTenants: Tenant[] = [];
  paginatedTenants: Tenant[] = [];

  // Selection
  selectedTenants: number[] = [];

  // Pagination
  currentPage: number = 1;
  itemsPerPage: number = 10;
  totalTenants: number = 0;
  totalPages: number = 0;

  // UI state
  showAddTenantOffcanvas: boolean = false;
  activeMenuId: number | null = null;

  // New tenant form
  newTenantData: BasicTenantFormData = {
    name: '',
    email: '',
    phone: '',
    status: ''
  };

  canSaveTenant: boolean = false;

  private readonly documentClickListener = (event: Event): void => {
    const target = event.target as HTMLElement;
    const filterContainer = document.querySelector('.filter-container');
    const menuContainer = target.closest('.crud-menu-container');

    if (filterContainer && !filterContainer.contains(target)) {
      this.showFilterPopup = false;
    }

    if (!menuContainer && this.activeMenuId !== null) {
      this.closeMenu();
    }
  };

  constructor() {}

  ngOnInit(): void {
    // Will be injected later when services are properly available
    this.currentUser = { 
      full_name: 'Tenant Admin', 
      role: { role_name: 'Tenant Admin' }, 
      email: 'admin@tenant.com', 
      user_type: 'TENANT_ADMIN' 
    };
    this.permissions = ['/tenants:view', '/teachers:manage'];
    
    this.loadTenants();
    
    // Add click outside listeners
    document.addEventListener('click', this.documentClickListener);
  }

  ngOnDestroy(): void {
    // Remove click outside listeners
    document.removeEventListener('click', this.documentClickListener);
  }

  loadTenants(): void {
    // Mock data - replace with actual service call
    this.allTenants = [
      {
        id: 1,
        name: 'tenant.1',
        email: 'holly@gmail.com',
        phone: '+92 333 123-1079',
        clientsCount: 12,
        status: 'Active',
        createdAt: new Date('2020-06-20'),
        updatedAt: new Date('2020-06-20'),
        logoInitial: 'A',
        logoClass: 'green'
      },
      {
        id: 2,
        name: 'tenant.2',
        email: 'holly@gmail.com',
        phone: '+92 333 123-1079',
        clientsCount: 16,
        status: 'Pending',
        createdAt: new Date('2020-06-20'),
        updatedAt: new Date('2020-06-20'),
        logoInitial: 'B',
        logoClass: 'blue'
      },
      {
        id: 3,
        name: 'tenant.3',
        email: 'holly@gmail.com',
        phone: '+92 333 123-1079',
        clientsCount: 19,
        status: 'In Progress',
        createdAt: new Date('2020-06-20'),
        updatedAt: new Date('2020-06-20'),
        logoInitial: 'C',
        logoClass: 'orange'
      },
      {
        id: 4,
        name: 'tenant.4',
        email: 'holly@gmail.com',
        phone: '+92 333 123-1079',
        clientsCount: 10,
        status: 'Active',
        createdAt: new Date('2020-06-20'),
        updatedAt: new Date('2020-06-20'),
        logoInitial: 'D',
        logoClass: 'purple'
      },
      // Add more sample data to test pagination
      {
        id: 5,
        name: 'tenant.5',
        email: 'holly@gmail.com',
        phone: '+92 333 123-1079',
        clientsCount: 8,
        status: 'Active',
        createdAt: new Date('2020-06-20'),
        updatedAt: new Date('2020-06-20'),
        logoInitial: 'E',
        logoClass: 'green'
      },
      {
        id: 6,
        name: 'tenant.6',
        email: 'holly@gmail.com',
        phone: '+92 333 123-1079',
        clientsCount: 22,
        status: 'Pending',
        createdAt: new Date('2020-06-20'),
        updatedAt: new Date('2020-06-20'),
        logoInitial: 'F',
        logoClass: 'blue'
      },
      {
        id: 7,
        name: 'tenant.7',
        email: 'holly@gmail.com',
        phone: '+92 333 123-1079',
        clientsCount: 15,
        status: 'In Progress',
        createdAt: new Date('2020-06-20'),
        updatedAt: new Date('2020-06-20'),
        logoInitial: 'G',
        logoClass: 'orange'
      },
      {
        id: 8,
        name: 'tenant.8',
        email: 'holly@gmail.com',
        phone: '+92 333 123-1079',
        clientsCount: 11,
        status: 'Active',
        createdAt: new Date('2020-06-20'),
        updatedAt: new Date('2020-06-20'),
        logoInitial: 'H',
        logoClass: 'purple'
      },
      {
        id: 9,
        name: 'tenant.9',
        email: 'holly@gmail.com',
        phone: '+92 333 123-1079',
        clientsCount: 18,
        status: 'Active',
        createdAt: new Date('2020-06-20'),
        updatedAt: new Date('2020-06-20'),
        logoInitial: 'I',
        logoClass: 'green'
      },
      {
        id: 10,
        name: 'tenant.10',
        email: 'holly@gmail.com',
        phone: '+92 333 123-1079',
        clientsCount: 25,
        status: 'Pending',
        createdAt: new Date('2020-06-20'),
        updatedAt: new Date('2020-06-20'),
        logoInitial: 'J',
        logoClass: 'blue'
      },
      // Add more entries to reach 100+ for better pagination testing
      ...Array.from({ length: 90 }, (_, index) => ({
        id: 11 + index,
        name: `tenant.${11 + index}`,
        email: 'holly@gmail.com',
        phone: '+92 333 123-1079',
        clientsCount: Math.floor(Math.random() * 30) + 5,
        status: ['Active', 'Pending', 'In Progress'][Math.floor(Math.random() * 3)],
        createdAt: new Date('2020-06-20'),
        updatedAt: new Date('2020-06-20'),
        logoInitial: String.fromCharCode(75 + (index % 26)), // K, L, M, etc.
        logoClass: ['green', 'blue', 'orange', 'purple'][index % 4]
      }))
    ];
    
    this.applyFilters();
  }

  // Search functionality
  onSearch(): void {
    this.applyFilters();
  }

  onSearchChange(searchTerm: string): void {
    this.searchTerm = searchTerm;
    this.applyFilters();
  }

  onItemsPerPageChanged(itemsPerPage: number): void {
    this.itemsPerPage = itemsPerPage;
    this.onItemsPerPageChange();
  }

  onFiltersApplied(filters: any): void {
    this.filters = { ...this.filters, ...filters };
    this.applyFilters();
  }

  onFiltersReset(): void {
    this.resetAllFilters();
  }

  // Filter functionality
  toggleFilterPopup(): void {
    this.showFilterPopup = !this.showFilterPopup;
  }

  applyFilters(): void {
    let filtered = [...this.allTenants];

    // Apply search filter
    if (this.searchTerm) {
      filtered = filtered.filter(tenant => 
        tenant.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        tenant.email.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    if (this.filters.status) {
      filtered = filtered.filter(tenant => tenant.status === this.filters.status);
    }

    // Apply date filters
    if (this.filters.startDate) {
      const startDate = new Date(this.filters.startDate);
      filtered = filtered.filter(tenant => tenant.createdAt >= startDate);
    }

    if (this.filters.endDate) {
      const endDate = new Date(this.filters.endDate);
      filtered = filtered.filter(tenant => tenant.createdAt <= endDate);
    }

    this.filteredTenants = filtered;
    this.totalTenants = filtered.length;
    this.totalPages = Math.ceil(this.totalTenants / this.itemsPerPage);
    this.currentPage = 1;
    this.updatePaginatedTenants();
    this.showFilterPopup = false;
  }

  resetAllFilters(): void {
    this.filters = {
      tenant: '',
      status: '',
      startDate: '',
      endDate: ''
    };
    this.searchTerm = '';
    this.applyFilters();
  }

  // Individual filter reset methods
  resetStatusFilter(): void {
    this.filters.status = '';
  }

  resetStartDateFilter(): void {
    this.filters.startDate = '';
  }

  resetEndDateFilter(): void {
    this.filters.endDate = '';
  }

  // Pagination functionality
  onItemsPerPageChange(): void {
    this.totalPages = Math.ceil(this.totalTenants / this.itemsPerPage);
    this.currentPage = 1;
    this.updatePaginatedTenants();
  }

  updatePaginatedTenants(): void {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.paginatedTenants = this.filteredTenants.slice(startIndex, endIndex);
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updatePaginatedTenants();
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.updatePaginatedTenants();
    }
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updatePaginatedTenants();
    }
  }

  getVisiblePages(): number[] {
    const pages = [];
    const start = Math.max(1, this.currentPage - 2);
    const end = Math.min(this.totalPages, this.currentPage + 2);
    
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    
    return pages;
  }

  getShowingInfo(): string {
    const start = (this.currentPage - 1) * this.itemsPerPage + 1;
    const end = Math.min(this.currentPage * this.itemsPerPage, this.totalTenants);
    return `${start}-${end}`;
  }

  // Selection functionality
  isSelected(tenantId: number): boolean {
    return this.selectedTenants.includes(tenantId);
  }

  toggleSelection(tenantId: number): void {
    const index = this.selectedTenants.indexOf(tenantId);
    if (index > -1) {
      this.selectedTenants.splice(index, 1);
    } else {
      this.selectedTenants.push(tenantId);
    }
  }

  isAllSelected(): boolean {
    return this.paginatedTenants.length > 0 && 
           this.paginatedTenants.every(tenant => this.selectedTenants.includes(tenant.id));
  }

  toggleAllSelection(): void {
    if (this.isAllSelected()) {
      // Deselect all on current page
      this.paginatedTenants.forEach(tenant => {
        const index = this.selectedTenants.indexOf(tenant.id);
        if (index > -1) {
          this.selectedTenants.splice(index, 1);
        }
      });
    } else {
      // Select all on current page
      this.paginatedTenants.forEach(tenant => {
        if (!this.selectedTenants.includes(tenant.id)) {
          this.selectedTenants.push(tenant.id);
        }
      });
    }
  }

  selectAll(): void {
    this.selectedTenants = this.filteredTenants.map(tenant => tenant.id);
  }

  // Bulk actions
  bulkActivate(): void {
    // TODO: implement bulk activate logic
  }

  bulkDeactivate(): void {
    // TODO: implement bulk deactivate logic
  }

  // Pagination methods
  onPageChange(page: number): void {
    this.currentPage = page;
    this.updatePaginatedTenants();
  }

  // CRUD Menu methods
  toggleMenu(tenantId: number, event: Event): void {
    // Prevent propagation to document
    event.stopPropagation();
    
    // Toggle the menu ID
    if (this.activeMenuId === tenantId) {
      this.activeMenuId = null;
    } else {
      this.activeMenuId = tenantId;
    }
  }

  closeMenu(): void {
    this.activeMenuId = null;
  }

  // Removed positionDropdown method - not needed with the simplified approach

  onViewTenant(tenantId: number): void {
    this.closeMenu();
    // TODO: implement view tenant logic
  }

  onEditTenant(tenantId: number): void {
    this.closeMenu();
    // TODO: implement edit tenant logic
  }

  onDeleteTenant(tenantId: number): void {
    this.closeMenu();
    if (confirm('Are you sure you want to delete this tenant?')) {
      this.allTenants = this.allTenants.filter(t => t.id !== tenantId);
      this.applyFilters();
    }
  }

  onDuplicateTenant(tenantId: number): void {
    this.closeMenu();
    // TODO: implement duplicate tenant logic
  }

  onArchiveTenant(tenantId: number): void {
    this.closeMenu();
    // TODO: implement archive tenant logic
  }

  // Add tenant functionality
  openAddTenantOffcanvas(): void {
    this.showAddTenantOffcanvas = true;
  }

  closeAddTenantOffcanvas(): void {
    this.showAddTenantOffcanvas = false;
    this.resetNewTenantForm();
  }

  saveTenant(): void {
    if (this.canSaveTenant) {
      // TODO: implement save tenant logic
      this.closeAddTenantOffcanvas();
    }
  }

  onTenantFormDataChange(data: BasicTenantFormData): void {
    this.newTenantData = data;
  }

  onTenantFormValidityChange(isValid: boolean): void {
    this.canSaveTenant = isValid;
  }

  resetNewTenantForm(): void {
    this.newTenantData = {
      name: '',
      email: '',
      phone: '',
      status: ''
    };
    this.canSaveTenant = false;
  }

  // Track by function for ngFor
  trackByTenantId(index: number, tenant: Tenant): number {
    return tenant.id;
  }

  logout(): void {
    // TODO: implement logout functionality
  }
}
