import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
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
  rawStatus?: string; // Raw status value for API (e.g., 'SUSPENDED')
  createdAt: Date;
  updatedAt: Date;
  logoInitial: string;
  logoClass: string;
  // Additional fields for complete data
  logoUrlLight?: string;
  logoUrlDark?: string;
  faviconUrl?: string;
  theme?: any;
  tenantDomain?: string;
}

export interface TenantPhoneNumber {
  id: number;
  tenantId: number;
  dialCode: string;
  phoneNumber: string;
  isoCountryCode?: string;
  isPrimary: boolean;
  contactType: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface TenantEmailAddress {
  id: number;
  tenantId: number;
  emailAddress: string;
  isPrimary: boolean;
  contactType: string;
  createdAt: Date;
  updatedAt: Date;
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
  selector: 'app-tenant-management',
  standalone: true,
  imports: [CommonModule, FormsModule, Paginator, OffCanvasWrapper, BasicTenantForm],
  templateUrl: './tenant-management.html',
  styleUrls: ['./tenant-management.scss']
})
export class TenantManagement implements OnInit, OnDestroy {
  
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
    showAddTenantOffcanvas = false;
  isEditMode = false;
  isViewMode = false;
  editingTenantId: number | null = null;
  showViewTenantModal: boolean = false;
  showEditTenantOffcanvas: boolean = false;
  activeMenuId: number | null = null;
  isLoadingTenants: boolean = false;
  tenantLoadError: string | null = null;

  // View tenant state
  selectedTenant: Tenant | null = null;
  tenantPhoneNumbers: TenantPhoneNumber[] = [];
  tenantEmailAddresses: TenantEmailAddress[] = [];
  isLoadingTenantDetails: boolean = false;
  isLoadingContacts: boolean = false;

  // Contact management
  showAddPhoneForm: boolean = false;
  showAddEmailForm: boolean = false;
  newPhoneNumber: any = {
    dialCode: '+92',
    phoneNumber: '',
    isoCountryCode: 'PK',
    isPrimary: false,
    contactType: 'PRIMARY'
  };
  newEmailAddress: any = {
    emailAddress: '',
    isPrimary: false,
    contactType: 'PRIMARY'
  };

  // New tenant form
  newTenantData: BasicTenantFormData = {
    name: '',
    domain: '',
    status: 'ACTIVE',
    phoneNumbers: [],
    emailAddresses: []
  };

  canSaveTenant: boolean = false;

  // ViewChild for tenant form
  @ViewChild(BasicTenantForm) tenantFormComponent!: BasicTenantForm;

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

    // Check for explicit success property
    if (typeof response.success === 'boolean') {
      return response.success;
    }

    // Check for successful status codes (200-299, including 204 No Content)
    if (response.statusCode >= 200 && response.statusCode < 300) {
      return true;
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
    const rawStatus = rawTenant?.tenant_status ?? rawTenant?.status;
    const status = this.formatStatus(rawStatus);
    const email = this.getPrimaryEmail(rawTenant) ?? '—';
    const phone = this.getPrimaryPhone(rawTenant) ?? '—';

    return {
      id: tenantId,
      name: tenantName,
      email,
      phone,
      clientsCount: rawTenant?.clients_count ?? rawTenant?.client_count ?? rawTenant?.clientsCount ?? 0,
      status,
      rawStatus, // Store raw status for API calls
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
  async bulkActivate(): Promise<void> {
    if (this.selectedTenants.length === 0) {
      alert('Kripya activate karne ke liye tenants select karein.');
      return;
    }
    
    const confirmed = confirm(`Kya aap ${this.selectedTenants.length} tenant(s) ko activate karna chahte hain?`);
    
    if (confirmed) {
      try {
        const response = await this.httpRequests.bulkActivateTenants(this.selectedTenants);
        
        if (this.isResponseSuccessful(response)) {
          console.log('Tenants activated successfully');
          this.selectedTenants = [];
          await this.loadTenants(); // Reload the list
        } else {
          alert('Tenants activate karne mein error aayi.');
        }
      } catch (error) {
        console.error('Error activating tenants:', error);
        alert('Tenants activate karne mein error aayi.');
      }
    }
  }

  async bulkDeactivate(): Promise<void> {
    if (this.selectedTenants.length === 0) {
      alert('Kripya deactivate karne ke liye tenants select karein.');
      return;
    }
    
    const confirmed = confirm(`Kya aap ${this.selectedTenants.length} tenant(s) ko deactivate karna chahte hain?`);
    
    if (confirmed) {
      try {
        const response = await this.httpRequests.bulkDeactivateTenants(this.selectedTenants);
        
        if (this.isResponseSuccessful(response)) {
          console.log('Tenants deactivated successfully');
          this.selectedTenants = [];
          await this.loadTenants(); // Reload the list
        } else {
          alert('Tenants deactivate karne mein error aayi.');
        }
      } catch (error) {
        console.error('Error deactivating tenants:', error);
        alert('Tenants deactivate karne mein error aayi.');
      }
    }
  }

  async bulkDelete(): Promise<void> {
    if (this.selectedTenants.length === 0) {
      alert('Kripya delete karne ke liye tenants select karein.');
      return;
    }
    
    const confirmed = confirm(`Kya aap ${this.selectedTenants.length} tenant(s) ko delete karna chahte hain? Ye action undo nahi ho sakta.`);
    
    if (confirmed) {
      try {
        const response = await this.httpRequests.bulkDeleteTenants(this.selectedTenants);
        
        if (this.isResponseSuccessful(response)) {
          console.log('Tenants deleted successfully');
          this.selectedTenants = [];
          await this.loadTenants(); // Reload the list
        } else {
          alert('Tenants delete karne mein error aayi.');
        }
      } catch (error) {
        console.error('Error deleting tenants:', error);
        alert('Tenants delete karne mein error aayi.');
      }
    }
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
    this.viewTenantInOffcanvas(tenantId);
  }

  async viewTenantInOffcanvas(tenantId: number): Promise<void> {
    try {
      // Get tenant details
      const tenantResponse = await this.httpRequests.getTenantById(tenantId);
      if (this.isResponseSuccessful(tenantResponse)) {
        const rawTenant = tenantResponse.data;
        
        // Load phone numbers and email addresses
        await this.loadTenantContacts(tenantId);
        
        // Set form data for viewing
        this.newTenantData = {
          name: rawTenant.tenant_name || '',
          domain: rawTenant.tenant_domain || '',
          status: rawTenant.tenant_status || 'ACTIVE',
          phoneNumbers: this.tenantPhoneNumbers.map(phone => ({
            dialCode: phone.dialCode,
            phoneNumber: phone.phoneNumber,
            countryCode: phone.isoCountryCode || '',
            isoCountryCode: phone.isoCountryCode || '',
            isPrimary: phone.isPrimary,
            contactType: phone.contactType || 'PRIMARY'
          })),
          emailAddresses: this.tenantEmailAddresses.map(email => ({
            emailAddress: email.emailAddress,
            isPrimary: email.isPrimary,
            contactType: email.contactType || 'PRIMARY'
          }))
        };
        
        // Open in view mode
        this.isViewMode = true;
        this.isEditMode = false;
        this.editingTenantId = tenantId;
        this.showAddTenantOffcanvas = true;
      } else {
        console.error('Failed to load tenant details:', tenantResponse?.message);
        alert('Failed to load tenant details. Please try again.');
      }
    } catch (error) {
      console.error('Error loading tenant details:', error);
      alert('Error loading tenant details. Please try again.');
    }
  }

  async viewTenantDetails(tenantId: number): Promise<void> {
    this.isLoadingTenantDetails = true;
    this.showViewTenantModal = true;
    
    try {
      // Get tenant details
      const tenantResponse = await this.httpRequests.getTenantById(tenantId);
      if (this.isResponseSuccessful(tenantResponse)) {
        const rawTenant = tenantResponse.data;
        this.selectedTenant = this.transformTenant(rawTenant, 0);
        
        // Load phone numbers and email addresses
        await this.loadTenantContacts(tenantId);
      } else {
        console.error('Failed to load tenant details:', tenantResponse?.message);
        alert('Failed to load tenant details. Please try again.');
        this.showViewTenantModal = false;
      }
    } catch (error) {
      console.error('Error loading tenant details:', error);
      alert('Error loading tenant details. Please try again.');
      this.showViewTenantModal = false;
    } finally {
      this.isLoadingTenantDetails = false;
    }
  }

  async loadTenantContacts(tenantId: number): Promise<void> {
    this.isLoadingContacts = true;
    
    try {
      // Load phone numbers
      try {
        const phoneResponse = await this.httpRequests.getTenantPhoneNumbers(tenantId);
        if (this.isResponseSuccessful(phoneResponse)) {
          this.tenantPhoneNumbers = this.extractContactItems(phoneResponse, 'phone');
        } else {
          console.warn('No phone numbers found or error loading phone numbers');
          this.tenantPhoneNumbers = [];
        }
      } catch (phoneError) {
        console.error('Error loading phone numbers:', phoneError);
        this.tenantPhoneNumbers = [];
      }
      
      // Load email addresses
      try {
        const emailResponse = await this.httpRequests.getTenantEmailAddresses(tenantId);
        if (this.isResponseSuccessful(emailResponse)) {
          this.tenantEmailAddresses = this.extractContactItems(emailResponse, 'email');
        } else {
          console.warn('No email addresses found or error loading email addresses');
          this.tenantEmailAddresses = [];
        }
      } catch (emailError) {
        console.error('Error loading email addresses:', emailError);
        this.tenantEmailAddresses = [];
      }
    } catch (error) {
      console.error('Error loading tenant contacts:', error);
      this.tenantPhoneNumbers = [];
      this.tenantEmailAddresses = [];
    } finally {
      this.isLoadingContacts = false;
    }
  }

  private extractContactItems(response: any, type: 'phone' | 'email'): any[] {
    if (!response) return [];
    
    const data = response.data;
    let items: any[] = [];
    
    if (Array.isArray(data)) {
      items = data;
    } else if (data && Array.isArray(data.items)) {
      items = data.items;
    } else if (Array.isArray(response.items)) {
      items = response.items;
    }
    
    // Transform items
    return items.map(item => {
      if (type === 'phone') {
        return {
          id: item.tenant_phone_number_id || item.id,
          tenantId: item.tenant_id,
          dialCode: item.dial_code,
          phoneNumber: item.phone_number,
          isoCountryCode: item.iso_country_code,
          isPrimary: item.is_primary,
          contactType: item.contact_type,
          createdAt: new Date(item.created_at),
          updatedAt: new Date(item.updated_at)
        };
      } else {
        return {
          id: item.tenant_email_address_id || item.id,
          tenantId: item.tenant_id,
          emailAddress: item.email_address,
          isPrimary: item.is_primary,
          contactType: item.contact_type,
          createdAt: new Date(item.created_at),
          updatedAt: new Date(item.updated_at)
        };
      }
    });
  }

  closeViewTenantModal(): void {
    this.showViewTenantModal = false;
    this.selectedTenant = null;
    this.tenantPhoneNumbers = [];
    this.tenantEmailAddresses = [];
    this.showAddPhoneForm = false;
    this.showAddEmailForm = false;
  }

  // Contact Management Methods
  toggleAddPhoneForm(): void {
    this.showAddPhoneForm = !this.showAddPhoneForm;
    if (this.showAddPhoneForm) {
      this.showAddEmailForm = false;
      this.resetPhoneForm();
    }
  }

  toggleAddEmailForm(): void {
    this.showAddEmailForm = !this.showAddEmailForm;
    if (this.showAddEmailForm) {
      this.showAddPhoneForm = false;
      this.resetEmailForm();
    }
  }

  async savePhoneNumber(): Promise<void> {
    if (!this.selectedTenant) return;
    
    try {
      const phoneData = {
        dial_code: this.newPhoneNumber.dialCode,
        phone_number: this.newPhoneNumber.phoneNumber,
        iso_country_code: this.newPhoneNumber.isoCountryCode || null,
        is_primary: this.newPhoneNumber.isPrimary,
        contact_type: this.newPhoneNumber.contactType
      };
      
      const response = await this.httpRequests.createTenantPhoneNumber(this.selectedTenant.id, phoneData);
      
      if (this.isResponseSuccessful(response)) {
        await this.loadTenantContacts(this.selectedTenant.id);
        await this.loadTenants(); // Refresh main tenant list
        this.showAddPhoneForm = false;
        this.resetPhoneForm();
      } else {
        alert('Failed to add phone number: ' + (response?.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error adding phone number:', error);
      alert('Error adding phone number. Please try again.');
    }
  }

  async saveEmailAddress(): Promise<void> {
    if (!this.selectedTenant) return;
    
    try {
      const emailData = {
        email_address: this.newEmailAddress.emailAddress,
        is_primary: this.newEmailAddress.isPrimary,
        contact_type: this.newEmailAddress.contactType
      };
      
      const response = await this.httpRequests.createTenantEmailAddress(this.selectedTenant.id, emailData);
      
      if (this.isResponseSuccessful(response)) {
        await this.loadTenantContacts(this.selectedTenant.id);
        await this.loadTenants(); // Refresh main tenant list
        this.showAddEmailForm = false;
        this.resetEmailForm();
      } else {
        alert('Failed to add email address: ' + (response?.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error adding email address:', error);
      alert('Error adding email address. Please try again.');
    }
  }

  async deletePhoneNumber(phoneId: number): Promise<void> {
    if (!this.selectedTenant) return;
    
    if (confirm('Are you sure you want to delete this phone number?')) {
      try {
        const response = await this.httpRequests.deleteTenantPhoneNumber(this.selectedTenant.id, phoneId);
        
        if (this.isResponseSuccessful(response)) {
          await this.loadTenantContacts(this.selectedTenant.id);
          await this.loadTenants(); // Refresh main tenant list
        } else {
          alert('Failed to delete phone number: ' + (response?.message || 'Unknown error'));
        }
      } catch (error) {
        console.error('Error deleting phone number:', error);
        alert('Error deleting phone number. Please try again.');
      }
    }
  }

  async deleteEmailAddress(emailId: number): Promise<void> {
    if (!this.selectedTenant) return;
    
    if (confirm('Are you sure you want to delete this email address?')) {
      try {
        const response = await this.httpRequests.deleteTenantEmailAddress(this.selectedTenant.id, emailId);
        
        if (this.isResponseSuccessful(response)) {
          await this.loadTenantContacts(this.selectedTenant.id);
          await this.loadTenants(); // Refresh main tenant list
        } else {
          alert('Failed to delete email address: ' + (response?.message || 'Unknown error'));
        }
      } catch (error) {
        console.error('Error deleting email address:', error);
        alert('Error deleting email address. Please try again.');
      }
    }
  }

  async togglePrimaryPhone(phoneId: number): Promise<void> {
    if (!this.selectedTenant) return;
    
    try {
      const response = await this.httpRequests.updateTenantPhoneNumber(
        this.selectedTenant.id, 
        phoneId, 
        { is_primary: true }
      );
      
      if (this.isResponseSuccessful(response)) {
        await this.loadTenantContacts(this.selectedTenant.id);
        await this.loadTenants(); // Refresh main tenant list
      }
    } catch (error) {
      console.error('Error updating primary phone:', error);
    }
  }

  async togglePrimaryEmail(emailId: number): Promise<void> {
    if (!this.selectedTenant) return;
    
    try {
      const response = await this.httpRequests.updateTenantEmailAddress(
        this.selectedTenant.id, 
        emailId, 
        { is_primary: true }
      );
      
      if (this.isResponseSuccessful(response)) {
        await this.loadTenantContacts(this.selectedTenant.id);
        await this.loadTenants(); // Refresh main tenant list
      }
    } catch (error) {
      console.error('Error updating primary email:', error);
    }
  }

  private resetPhoneForm(): void {
    this.newPhoneNumber = {
      dialCode: '+92',
      phoneNumber: '',
      isoCountryCode: 'PK',
      isPrimary: false,
      contactType: 'PRIMARY'
    };
  }

  private resetEmailForm(): void {
    this.newEmailAddress = {
      emailAddress: '',
      isPrimary: false,
      contactType: 'PRIMARY'
    };
  }

  async onEditTenant(tenantId: number): Promise<void> {
    this.closeMenu();
    const tenant = this.allTenants.find(t => t.id === tenantId);
    if (tenant) {
      this.isEditMode = true;
      this.isViewMode = false;
      this.editingTenantId = tenantId;
      
      // Pre-fill the form with tenant data
      this.newTenantData = {
        name: tenant.name,
        domain: tenant.tenantDomain || '',
        status: tenant.rawStatus || tenant.status, // Use raw status for API
        phoneNumbers: [],
        emailAddresses: []
      };
      
      // Load contacts and populate form
      await this.loadTenantContacts(tenantId);
      
      // Transform phone numbers to form format
      this.newTenantData.phoneNumbers = this.tenantPhoneNumbers.map(phone => ({
        dialCode: phone.dialCode || '+1',
        phoneNumber: phone.phoneNumber,
        countryCode: phone.isoCountryCode || 'US',
        isoCountryCode: phone.isoCountryCode || 'US',
        contactType: phone.contactType || 'PRIMARY',
        isPrimary: phone.isPrimary
      }));
      
      // Transform email addresses to form format
      this.newTenantData.emailAddresses = this.tenantEmailAddresses.map(email => ({
        emailAddress: email.emailAddress,
        contactType: email.contactType || 'PRIMARY',
        isPrimary: email.isPrimary
      }));
      
      this.showAddTenantOffcanvas = true;
    }
  }

  async onDeleteTenant(tenantId: number): Promise<void> {
    this.closeMenu();
    
    const tenant = this.allTenants.find(t => t.id === tenantId);
    const tenantName = tenant ? tenant.name : 'this tenant';
    
    const confirmed = confirm(`Kya aap "${tenantName}" ko delete karna chahte hain? Ye action undo nahi ho sakta.`);
    
    if (confirmed) {
      try {
        const response = await this.httpRequests.deleteTenant(tenantId);
        
        console.log('Delete tenant response:', response);
        
        if (this.isResponseSuccessful(response)) {
          console.log('Tenant deleted successfully');
          alert('Tenant successfully delete ho gaya!');
          await this.loadTenants(); // Reload the list to reflect changes
        } else {
          const errorMsg = response?.message || 'Unknown error';
          console.error('Failed to delete tenant:', errorMsg);
          alert(`Tenant delete karne mein error: ${errorMsg}`);
        }
      } catch (error) {
        console.error('Error deleting tenant:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        alert(`Tenant delete karne mein error aayi: ${errorMessage}`);
      }
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
    this.resetNewTenantForm(); // Reset form first
    this.isEditMode = false;
    this.isViewMode = false;
    this.editingTenantId = null;
    this.showAddTenantOffcanvas = true;
  }

  closeAddTenantOffcanvas(): void {
    this.showAddTenantOffcanvas = false;
    this.isEditMode = false;
    this.isViewMode = false;
    this.editingTenantId = null;
    this.resetNewTenantForm();
  }

  /**
   * Save tenant with validation
   */
  async saveTenantWithValidation(): Promise<void> {
    // Trigger validation on form
    if (this.tenantFormComponent) {
      this.tenantFormComponent.markAllFieldsAsTouched();
    }

    // Check if form is valid
    if (!this.canSaveTenant) {
      return;
    }

    await this.saveTenant();
  }

  async saveTenant(): Promise<void> {
    if (!this.canSaveTenant) {
      return;
    }

    try {
      if (this.isEditMode && this.editingTenantId) {
        // Update existing tenant with phone numbers, email addresses, and files
        const updateData: any = {
          name: this.newTenantData.name,
          domain: this.newTenantData.domain,
          status: this.newTenantData.status
        };

        // Add files if present
        if (this.newTenantData.logoLightFile) {
          updateData.logoLightFile = this.newTenantData.logoLightFile;
        }
        if (this.newTenantData.logoDarkFile) {
          updateData.logoDarkFile = this.newTenantData.logoDarkFile;
        }
        if (this.newTenantData.faviconFile) {
          updateData.faviconFile = this.newTenantData.faviconFile;
        }

        // Add phone numbers and email addresses
        if (this.newTenantData.phoneNumbers && this.newTenantData.phoneNumbers.length > 0) {
          updateData.phoneNumbers = this.newTenantData.phoneNumbers.map(phone => ({
            dial_code: phone.dialCode,
            phone_number: phone.phoneNumber,
            iso_country_code: phone.isoCountryCode || undefined,
            is_primary: phone.isPrimary,
            contact_type: phone.contactType
          }));
        }

        if (this.newTenantData.emailAddresses && this.newTenantData.emailAddresses.length > 0) {
          updateData.emailAddresses = this.newTenantData.emailAddresses.map(email => ({
            email_address: email.emailAddress,
            is_primary: email.isPrimary,
            contact_type: email.contactType
          }));
        }

        const response = await this.httpRequests.updateTenant(this.editingTenantId, updateData);
        
        if (this.isResponseSuccessful(response)) {
          console.log('Tenant updated successfully');
          await this.loadTenants(); // Reload the list
        }
      } else {
        // Create new tenant with files
        const createData: any = {
          name: this.newTenantData.name,
          domain: this.newTenantData.domain,
          status: this.newTenantData.status || 'ACTIVE'
        };

        // Add files if present
        if (this.newTenantData.logoLightFile) {
          console.log('Adding logoLightFile:', this.newTenantData.logoLightFile);
          createData.logoLightFile = this.newTenantData.logoLightFile;
        }
        if (this.newTenantData.logoDarkFile) {
          console.log('Adding logoDarkFile:', this.newTenantData.logoDarkFile);
          createData.logoDarkFile = this.newTenantData.logoDarkFile;
        }
        if (this.newTenantData.faviconFile) {
          console.log('Adding faviconFile:', this.newTenantData.faviconFile);
          createData.faviconFile = this.newTenantData.faviconFile;
        }

        console.log('Create tenant data:', createData);

        // Add phone numbers and email addresses
        if (this.newTenantData.phoneNumbers && this.newTenantData.phoneNumbers.length > 0) {
          createData.phoneNumbers = this.newTenantData.phoneNumbers.map(phone => ({
            dial_code: phone.dialCode,
            phone_number: phone.phoneNumber,
            iso_country_code: phone.isoCountryCode || undefined,
            is_primary: phone.isPrimary,
            contact_type: phone.contactType
          }));
        }

        if (this.newTenantData.emailAddresses && this.newTenantData.emailAddresses.length > 0) {
          createData.emailAddresses = this.newTenantData.emailAddresses.map(email => ({
            email_address: email.emailAddress,
            is_primary: email.isPrimary,
            contact_type: email.contactType
          }));
        }

        const response = await this.httpRequests.createTenant(createData);
        
        if (this.isResponseSuccessful(response)) {
          console.log('Tenant created successfully');
          await this.loadTenants(); // Reload the list
        }
      }
      
      this.closeAddTenantOffcanvas();
    } catch (error) {
      console.error('Error saving tenant:', error);
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
      domain: '',
      status: 'ACTIVE',
      phoneNumbers: [],
      emailAddresses: [],
      logoLightFile: undefined,
      logoDarkFile: undefined,
      faviconFile: undefined,
      logoLightPreview: undefined,
      logoDarkPreview: undefined,
      faviconPreview: undefined
    };
    this.canSaveTenant = false;
    this.isEditMode = false;
    this.editingTenantId = null;
  }

  // Track by function for ngFor
  trackByTenantId(index: number, tenant: Tenant): number {
    return tenant.id;
  }

  logout(): void {
    // TODO: implement logout functionality
  }
}
