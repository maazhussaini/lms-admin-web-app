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
}

export interface Filters {
  search: string;
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
    search: ''
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
        filters: {
          search: this.filters.search
        }
      });

      if (response.success) {
        this.allInstitutes = response.data?.items || [];
        this.totalInstitutes = response.data?.pagination?.total || 0;
        this.totalPages = Math.ceil(this.totalInstitutes / this.itemsPerPage);
        this.filteredInstitutes = [...this.allInstitutes];
        this.paginatedInstitutes = [...this.allInstitutes];
      } else {
        this.instituteLoadError = response.message || 'Failed to load institutes';
        console.error('Institute load error:', response);
      }
    } catch (error) {
      this.instituteLoadError = 'An unexpected error occurred';
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

  // ==================== CRUD Operations ====================

  openAddOffcanvas(): void {
    this.isEditMode = false;
    this.isViewMode = false;
    this.editingInstituteId = null;
    this.selectedInstitute = null;
    this.instituteName = '';
    this.showAddInstituteOffcanvas = true;
  }

  async openEditOffcanvas(instituteId: number, event: Event): Promise<void> {
    event.stopPropagation();
    this.activeMenuId = null;
    this.isEditMode = true;
    this.isViewMode = false;
    this.editingInstituteId = instituteId;
    this.showAddInstituteOffcanvas = true;
    await this.loadInstituteDetails(instituteId);
  }

  async openViewOffcanvas(instituteId: number, event: Event): Promise<void> {
    event.stopPropagation();
    this.activeMenuId = null;
    this.isViewMode = true;
    this.isEditMode = false;
    this.editingInstituteId = instituteId;
    this.showAddInstituteOffcanvas = true;
    await this.loadInstituteDetails(instituteId);
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
        this.showAddInstituteOffcanvas = false;
        await this.loadInstitutes();
      } else {
        alert(response.message || 'Failed to save institute');
      }
    } catch (error: any) {
      console.error('Error saving institute:', error);
      alert(error?.message || 'An unexpected error occurred');
    }
  }

  async handleDelete(instituteId: number, event: Event): Promise<void> {
    event.stopPropagation();
    this.activeMenuId = null;
    
    if (confirm('Are you sure you want to delete this institute?')) {
      try {
        const response = await this.httpRequests.deleteInstitute(instituteId);
        
        if (response.success) {
          await this.loadInstitutes();
        } else {
          alert(response.message || 'Failed to delete institute');
        }
      } catch (error) {
        console.error('Error deleting institute:', error);
        alert('An unexpected error occurred');
      }
    }
  }

  closeOffcanvas(): void {
    this.showAddInstituteOffcanvas = false;
    this.isEditMode = false;
    this.isViewMode = false;
    this.editingInstituteId = null;
    this.selectedInstitute = null;
    this.instituteName = '';
  }

  // ==================== Search & Filters ====================

  async onSearch(): Promise<void> {
    this.filters.search = this.searchTerm;
    this.currentPage = 1;
    await this.loadInstitutes();
  }

  toggleFilterPopup(event: Event): void {
    event.stopPropagation();
    this.showFilterPopup = !this.showFilterPopup;
  }

  async applyFilters(): Promise<void> {
    this.currentPage = 1;
    await this.loadInstitutes();
    this.showFilterPopup = false;
  }

  async resetAllFilters(): Promise<void> {
    this.filters.search = '';
    this.searchTerm = '';
    this.currentPage = 1;
    await this.loadInstitutes();
    this.showFilterPopup = false;
  }

  // ==================== Pagination ====================

  async onPageChange(page: number): Promise<void> {
    this.currentPage = page;
    await this.loadInstitutes();
  }

  async onItemsPerPageChanged(newItemsPerPage: number): Promise<void> {
    this.itemsPerPage = newItemsPerPage;
    this.currentPage = 1;
    await this.loadInstitutes();
  }

  // ==================== Selection & Bulk Actions ====================

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

  selectAll(): void {
    if (this.selectedInstitutes.length === this.paginatedInstitutes.length) {
      this.selectedInstitutes = [];
    } else {
      this.selectedInstitutes = this.paginatedInstitutes.map(i => i.institute_id);
    }
  }

  async bulkDelete(): Promise<void> {
    if (this.selectedInstitutes.length === 0) return;
    
    if (confirm(`Are you sure you want to delete ${this.selectedInstitutes.length} institute(s)?`)) {
      try {
        const promises = this.selectedInstitutes.map(id => 
          this.httpRequests.deleteInstitute(id)
        );
        
        await Promise.all(promises);
        this.selectedInstitutes = [];
        await this.loadInstitutes();
      } catch (error) {
        console.error('Error in bulk delete:', error);
        alert('Some institutes could not be deleted');
      }
    }
  }

  // ==================== Menu Actions ====================

  toggleMenu(event: Event, instituteId: number): void {
    event.stopPropagation();
    this.activeMenuId = this.activeMenuId === instituteId ? null : instituteId;
  }

  isMenuActive(instituteId: number): boolean {
    return this.activeMenuId === instituteId;
  }
}

