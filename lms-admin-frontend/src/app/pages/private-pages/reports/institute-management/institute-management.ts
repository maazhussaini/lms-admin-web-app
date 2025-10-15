import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Paginator } from '../../../../components/widgets/paginator/paginator';
import { OffCanvasWrapper } from '../../../../components/widgets/off-canvas-wrapper/off-canvas-wrapper';
import { HttpRequests } from '../../../../services/http-requests.service';

export interface Institute {
  institute_id: number;
  tenant_id: number;
  institute_name: string;
  tenant_name?: string;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
  logo_url?: string;
  student_count?: number;
}

export interface Filters {
  search: string;
  status: string;
}

@Component({
  selector: 'app-institute-management',
  standalone: true,
  imports: [CommonModule, FormsModule, Paginator, OffCanvasWrapper],
  templateUrl: './institute-management.html',
  styleUrl: './institute-management.scss'
})
export class InstituteManagement implements OnInit, OnDestroy {
  
  currentUser: any = null;
  permissions: string[] = [];

  // Search and filtering
  searchTerm: string = '';
  showFilterPopup: boolean = false;
  filters: Filters = {
    search: '',
    status: ''
  };

  // Institute data
  allInstitutes: Institute[] = [];
  filteredInstitutes: Institute[] = [];
  paginatedInstitutes: Institute[] = [];

  // Selection
  selectedInstitutes: number[] = [];

  // Pagination
  currentPage: number = 1;
  itemsPerPage: number = 10;
  totalInstitutes: number = 0;
  totalPages: number = 0;

  // UI state
  showAddInstituteOffcanvas = false;
  isEditMode = false;
  isViewMode = false;
  editingInstituteId: number | null = null;
  activeMenuId: number | null = null;
  isLoadingInstitutes: boolean = false;
  instituteLoadError: string | null = null;

  // Selected institute for view/edit
  selectedInstitute: Institute | null = null;
  isLoadingInstituteDetails: boolean = false;

  // Form data
  instituteName: string = '';

  private readonly documentClickListener = (event: Event): void => {
    const target = event.target as HTMLElement;
    const filterContainer = document.querySelector('.filter-container');
    const menuContainer = target.closest('.crud-menu-container');

    if (filterContainer && !filterContainer.contains(target)) {
      this.showFilterPopup = false;
    }

    if (!menuContainer) {
      this.activeMenuId = null;
    }
  };

  constructor(private httpRequests: HttpRequests) {}

  ngOnInit(): void {
    this.loadCurrentUser();
    this.loadInstitutes();
    document.addEventListener('click', this.documentClickListener);
  }

  ngOnDestroy(): void {
    document.removeEventListener('click', this.documentClickListener);
  }

  // ==================== Data Loading ====================

  loadCurrentUser(): void {
    const userStr = localStorage.getItem('currentUser');
    if (userStr) {
      this.currentUser = JSON.parse(userStr);
      this.permissions = this.currentUser?.permissions || [];
    }
  }

  async loadInstitutes(): Promise<void> {
    this.isLoadingInstitutes = true;
    this.instituteLoadError = null;

    try {
      const response = await this.httpRequests.getAllInstitutes({
        page: this.currentPage,
        limit: this.itemsPerPage,
        ...this.filters
      });

      if (response.success) {
        this.allInstitutes = response.data?.items || [];
        this.totalInstitutes = response.data?.pagination?.total || 0;
        this.totalPages = Math.ceil(this.totalInstitutes / this.itemsPerPage);
        this.filterAndPaginateInstitutes();
      } else {
        this.instituteLoadError = response.message || 'Failed to load institutes';
        console.error('Institute load error:', response);
      }
    } catch (error: any) {
      this.instituteLoadError = error.message || 'An unexpected error occurred';
      console.error('Error loading institutes:', error);
    } finally {
      this.isLoadingInstitutes = false;
    }
  }

  async loadInstituteDetails(instituteId: number): Promise<void> {
    this.isLoadingInstituteDetails = true;
    
    try {
      const response = await this.httpRequests.getInstituteById(instituteId);
      
      if (response.success) {
        this.selectedInstitute = response.data;
        if (this.isEditMode && this.selectedInstitute) {
          this.instituteName = this.selectedInstitute.institute_name;
        }
      } else {
        console.error('Failed to load institute details:', response);
      }
    } catch (error) {
      console.error('Error loading institute details:', error);
    } finally {
      this.isLoadingInstituteDetails = false;
    }
  }

  // ==================== Filtering & Pagination ====================

  filterAndPaginateInstitutes(): void {
    this.filteredInstitutes = this.allInstitutes.filter(institute => {
      const matchesSearch = !this.searchTerm || 
        institute.institute_name.toLowerCase().includes(this.searchTerm.toLowerCase());

      return matchesSearch;
    });

    this.paginatedInstitutes = this.filteredInstitutes;
  }

  onSearchChange(value: string): void {
    this.searchTerm = value;
    this.currentPage = 1;
    this.loadInstitutes();
  }

  onFilterChange(): void {
    this.currentPage = 1;
    this.loadInstitutes();
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadInstitutes();
  }

  onItemsPerPageChanged(value: string | number): void {
    this.itemsPerPage = Number(value);
    this.currentPage = 1;
    this.loadInstitutes();
  }

  // ==================== Filter Methods ====================

  toggleFilterPopup(): void {
    this.showFilterPopup = !this.showFilterPopup;
  }

  resetStatusFilter(): void {
    this.filters.status = '';
  }

  resetAllFilters(): void {
    this.filters = {
      search: '',
      status: ''
    };
    this.searchTerm = '';
  }

  applyFilters(): void {
    this.showFilterPopup = false;
    this.currentPage = 1;
    this.loadInstitutes();
  }

  // ==================== Bulk Actions ====================

  selectAll(): void {
    this.selectedInstitutes = this.allInstitutes.map(i => i.institute_id);
  }

  async bulkActivate(): Promise<void> {
    if (!confirm(`Are you sure you want to activate ${this.selectedInstitutes.length} institute(s)?`)) {
      return;
    }

    try {
      // Call bulk activate API when available
      this.showSuccessMessage(`${this.selectedInstitutes.length} institute(s) activated successfully`);
      this.selectedInstitutes = [];
      this.loadInstitutes();
    } catch (error: any) {
      console.error('Error activating institutes:', error);
      this.showErrorMessage('Failed to activate institutes');
    }
  }

  async bulkDeactivate(): Promise<void> {
    if (!confirm(`Are you sure you want to deactivate ${this.selectedInstitutes.length} institute(s)?`)) {
      return;
    }

    try {
      // Call bulk deactivate API when available
      this.showSuccessMessage(`${this.selectedInstitutes.length} institute(s) deactivated successfully`);
      this.selectedInstitutes = [];
      this.loadInstitutes();
    } catch (error: any) {
      console.error('Error deactivating institutes:', error);
      this.showErrorMessage('Failed to deactivate institutes');
    }
  }

  async bulkDelete(): Promise<void> {
    if (!confirm(`Are you sure you want to delete ${this.selectedInstitutes.length} institute(s)? This action cannot be undone.`)) {
      return;
    }

    try {
      // Call bulk delete API when available
      this.showSuccessMessage(`${this.selectedInstitutes.length} institute(s) deleted successfully`);
      this.selectedInstitutes = [];
      this.loadInstitutes();
    } catch (error: any) {
      console.error('Error deleting institutes:', error);
      this.showErrorMessage('Failed to delete institutes');
    }
  }

  // ==================== CRUD Operations ====================

  openAddInstituteOffcanvas(): void {
    this.isEditMode = false;
    this.isViewMode = false;
    this.editingInstituteId = null;
    this.selectedInstitute = null;
    this.instituteName = '';
    this.showAddInstituteOffcanvas = true;
  }

  async onEditInstitute(institute: Institute): Promise<void> {
    // Close the menu first
    this.activeMenuId = null;
    
    this.editingInstituteId = institute.institute_id;
    this.isEditMode = true;
    this.isViewMode = false;
    await this.loadInstituteDetails(institute.institute_id);
    
    this.showAddInstituteOffcanvas = true;
  }

  async onViewInstitute(institute: Institute): Promise<void> {
    // Close the menu first
    this.activeMenuId = null;
    
    this.isViewMode = true;
    this.isEditMode = false;
    this.editingInstituteId = institute.institute_id;
    await this.loadInstituteDetails(institute.institute_id);
    
    this.showAddInstituteOffcanvas = true;
  }

  async onDeleteInstitute(institute: Institute): Promise<void> {
    this.activeMenuId = null;
    
    if (!confirm(`Are you sure you want to delete "${institute.institute_name}"?`)) {
      return;
    }

    try {
      const response = await this.httpRequests.deleteInstitute(institute.institute_id);
      
      if (response.success) {
        this.showSuccessMessage('Institute deleted successfully');
        await this.loadInstitutes();
      } else {
        this.showErrorMessage(response.message || 'Failed to delete institute');
      }
    } catch (error: any) {
      console.error('Error deleting institute:', error);
      this.showErrorMessage(error.message || 'An error occurred while deleting institute');
    }
  }

  async handleSave(): Promise<void> {
    if (!this.instituteName.trim()) {
      alert('Institute name is required');
      return;
    }

    try {
      let response;
      if (this.isEditMode && this.editingInstituteId) {
        response = await this.httpRequests.updateInstitute(this.editingInstituteId, {
          institute_name: this.instituteName
        });
      } else {
        response = await this.httpRequests.createInstitute({
          institute_name: this.instituteName
        });
      }

      if (response.success) {
        this.showSuccessMessage(this.isEditMode ? 'Institute updated successfully' : 'Institute created successfully');
        this.closeAddInstituteOffcanvas();
        await this.loadInstitutes();
      } else {
        this.showErrorMessage(response.message || 'Failed to save institute');
      }
    } catch (error: any) {
      console.error('Error saving institute:', error);
      this.showErrorMessage(error?.message || 'An unexpected error occurred');
    }
  }

  closeAddInstituteOffcanvas(): void {
    this.showAddInstituteOffcanvas = false;
    this.isEditMode = false;
    this.isViewMode = false;
    this.editingInstituteId = null;
    this.selectedInstitute = null;
    this.instituteName = '';
  }

  // ==================== Selection Methods ====================

  toggleInstituteSelection(instituteId: number): void {
    const index = this.selectedInstitutes.indexOf(instituteId);
    if (index > -1) {
      this.selectedInstitutes.splice(index, 1);
    } else {
      this.selectedInstitutes.push(instituteId);
    }
  }

  isInstituteSelected(instituteId: number): boolean {
    return this.selectedInstitutes.includes(instituteId);
  }

  areAllInstitutesSelected(): boolean {
    return this.paginatedInstitutes.length > 0 && 
           this.selectedInstitutes.length === this.paginatedInstitutes.length;
  }

  toggleAllInstitutes(event: any): void {
    if (event.target.checked) {
      this.selectedInstitutes = this.paginatedInstitutes.map(i => i.institute_id);
    } else {
      this.selectedInstitutes = [];
    }
  }

  // ==================== Menu Methods ====================

  toggleMenu(instituteId: number, event: Event): void {
    event.stopPropagation();
    this.activeMenuId = this.activeMenuId === instituteId ? null : instituteId;
  }

  // ==================== Helper Methods ====================

  trackByInstituteId(index: number, institute: Institute): number {
    return institute.institute_id;
  }

  getInitials(name: string): string {
    if (!name) return '';
    const words = name.trim().split(' ');
    if (words.length === 1) {
      return words[0].substring(0, 2).toUpperCase();
    }
    return (words[0][0] + words[words.length - 1][0]).toUpperCase();
  }

  getAvatarClass(index: number): string {
    const classes = ['bg-green', 'bg-blue', 'bg-orange', 'bg-purple', 'bg-pink', 'bg-teal', 'bg-indigo', 'bg-cyan'];
    return classes[index % classes.length];
  }

  showSuccessMessage(message: string): void {
    // Implement toast notification or alert
    alert(message);
  }

  showErrorMessage(message: string): void {
    // Implement toast notification or alert
    alert(message);
  }
}

