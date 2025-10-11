import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Paginator } from '../../../../components/widgets/paginator/paginator';
import { OffCanvasWrapper } from '../../../../components/widgets/off-canvas-wrapper/off-canvas-wrapper';
import { BasicTenantForm, BasicTenantFormData } from '../../../../components/forms/basic-tenant-form/basic-tenant-form';
import { HttpRequests } from '../../../../services/http-requests.service';

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
  isLoadingTenants: boolean = false;
  tenantLoadError: string | null = null;

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

  constructor(private httpRequests: HttpRequests) {}

  async ngOnInit(): Promise<void> {
    // Will be injected later when services are properly available
    this.currentUser = { 
      full_name: 'Tenant Admin', 
      role: { role_name: 'Tenant Admin' }, 
      email: 'admin@tenant.com', 
      user_type: 'TENANT_ADMIN' 
    };
    this.permissions = ['/tenants:view', '/teachers:manage'];
    
    await this.loadTenants();
    
    // Add click outside listeners
    document.addEventListener('click', this.documentClickListener);
  }

  ngOnDestroy(): void {
    // Remove click outside listeners
    document.removeEventListener('click', this.documentClickListener);
  }

  private async loadTenants(): Promise<void> {
    this.isLoadingTenants = true;
    this.tenantLoadError = null;

    try {
      const response = await this.httpRequests.getAllTenants();
      if (this.isResponseSuccessful(response)) {
        const rawTenants = this.extractTenantItems(response);
        this.allTenants = rawTenants.map((tenant, index) => this.transformTenant(tenant, index));
      } else {
        console.warn('Tenant list response was not successful', response?.message);
        this.allTenants = [];
        this.tenantLoadError = response?.message || 'Failed to load tenant list.';
      }
    } catch (error) {
      console.error('Failed to load tenants', error);
      this.allTenants = [];
      this.tenantLoadError = error instanceof Error ? error.message : 'Failed to load tenant list.';
    } finally {
      this.isLoadingTenants = false;
      this.applyFilters();
    }
  }

  private isResponseSuccessful(response: any): boolean {
    if (!response) {
      return false;
    }

    if (typeof response.is_success === 'boolean') {
      return response.is_success;
    }

    if (typeof response.success === 'boolean') {
      return response.success;
    }

    return false;
  }

  private extractTenantItems(response: any): any[] {
    if (!response) {
      return [];
    }

    const data = response.data;

    if (Array.isArray(data)) {
      return data;
    }

    if (data && Array.isArray(data.items)) {
      return data.items;
    }

    if (Array.isArray((response as any).items)) {
      return (response as any).items;
    }

    return [];
  }

  private transformTenant(rawTenant: any, index: number): Tenant {
    const tenantId = rawTenant?.tenant_id ?? rawTenant?.id ?? index + 1;
    const tenantName = rawTenant?.tenant_name ?? rawTenant?.name ?? `Tenant ${tenantId}`;
    const createdAt = rawTenant?.created_at ? new Date(rawTenant.created_at) : new Date();
    const updatedAt = rawTenant?.updated_at ? new Date(rawTenant.updated_at) : createdAt;
    const status = this.formatStatus(rawTenant?.tenant_status ?? rawTenant?.status);
    const email = this.getPrimaryEmail(rawTenant) ?? '—';
    const phone = this.getPrimaryPhone(rawTenant) ?? '—';

    return {
      id: tenantId,
      name: tenantName,
      email,
      phone,
      clientsCount: rawTenant?.clients_count ?? rawTenant?.client_count ?? rawTenant?.clientsCount ?? 0,
      status,
      createdAt,
      updatedAt,
      logoInitial: this.getLogoInitial(tenantName),
      logoClass: this.getLogoClass(index)
    };
  }

  private getPrimaryEmail(rawTenant: any): string | null {
    const responseEmail = rawTenant?.primary_email_address;
    const primaryEmail = responseEmail ?? this.findPrimaryContact(rawTenant?.tenant_email_addresses);

    if (primaryEmail?.email_address) {
      return primaryEmail.email_address;
    }

    if (typeof rawTenant?.primary_email === 'string') {
      return rawTenant.primary_email;
    }

    if (typeof rawTenant?.email_address === 'string') {
      return rawTenant.email_address;
    }

    if (typeof rawTenant?.email === 'string') {
      return rawTenant.email;
    }

    return null;
  }

  private getPrimaryPhone(rawTenant: any): string | null {
    const responsePhone = rawTenant?.primary_phone_number;
    const primaryPhone = responsePhone ?? this.findPrimaryContact(rawTenant?.tenant_phone_numbers);

    const dialCode = primaryPhone?.dial_code ?? rawTenant?.dial_code ?? null;
    const phoneNumber =
      primaryPhone?.phone_number ??
      rawTenant?.primary_phone ??
      rawTenant?.phone_number ??
      rawTenant?.phone ?? null;

    if (!phoneNumber) {
      return null;
    }

    return this.formatPhoneNumber(phoneNumber, dialCode);
  }

  private findPrimaryContact(collection: any): any | null {
    if (!Array.isArray(collection) || collection.length === 0) {
      return null;
    }

    const primary = collection.find((item) => item?.is_primary);
    return primary ?? collection[0];
  }

  private formatPhoneNumber(phoneNumber: string, dialCode: string | null): string {
    if (!dialCode) {
      return phoneNumber;
    }

    const normalizedDialCode = dialCode.startsWith('+') ? dialCode : `+${dialCode}`;
    return `${normalizedDialCode} ${phoneNumber}`;
  }

  private getLogoInitial(name: string): string {
    if (!name) {
      return '?';
    }

    const trimmed = name.trim();
    if (!trimmed) {
      return '?';
    }

    return trimmed.charAt(0).toUpperCase();
  }

  private getLogoClass(index: number): string {
    const classes = ['green', 'blue', 'orange', 'purple'];
    return classes[index % classes.length];
  }

  private formatStatus(status?: string): string {
    if (!status) {
      return 'Unknown';
    }

    const normalized = status.replace(/_/g, ' ').toLowerCase();
    return normalized.replace(/(^|\s)\w/g, (match) => match.toUpperCase());
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
        tenant.email.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        tenant.phone.toLowerCase().includes(this.searchTerm.toLowerCase())
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
