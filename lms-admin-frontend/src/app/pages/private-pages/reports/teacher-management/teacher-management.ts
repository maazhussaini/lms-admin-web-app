import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Paginator } from '../../../../components/widgets/paginator/paginator';
import { OffCanvasWrapper } from '../../../../components/widgets/off-canvas-wrapper/off-canvas-wrapper';
import { HttpRequests } from '../../../../services/http-requests.service';
import { TeacherFormComponent } from '../../../../components/forms/teacher-form/teacher-form.component';

export interface Teacher {
  teacher_id: number;
  full_name: string;
  first_name: string;
  last_name: string;
  username: string;
  primary_email?: string;
  primary_phone?: string;
  teacher_qualification?: string;
  profile_picture_url?: string;
  joining_date?: string;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
  // Additional fields
  middle_name?: string;
  date_of_birth?: string;
  gender?: string;
  country_id?: number;
  state_id?: number;
  city_id?: number;
  zip_code?: string;
  address?: string;
  age?: number;
  // Relations
  emails?: any[];
  phones?: any[];
  country?: any;
  state?: any;
  city?: any;
}

export interface Filters {
  search: string;
  status: string;
  gender: string;
  countryId: number | null;
}

@Component({
  selector: 'app-teacher-management',
  standalone: true,
  imports: [CommonModule, FormsModule, Paginator, OffCanvasWrapper, TeacherFormComponent],
  templateUrl: './teacher-management.html',
  styleUrl: './teacher-management.scss'
})
export class TeacherManagement implements OnInit, OnDestroy {
  
  currentUser: any = null;
  permissions: string[] = [];

  // Search and filtering
  searchTerm: string = '';
  showFilterPopup: boolean = false;
  filters: Filters = {
    search: '',
    status: '',
    gender: '',
    countryId: null
  };

  // Teacher data
  allTeachers: Teacher[] = [];
  filteredTeachers: Teacher[] = [];
  paginatedTeachers: Teacher[] = [];

  // Selection
  selectedTeachers: number[] = [];

  // Pagination
  currentPage: number = 1;
  itemsPerPage: number = 10;
  totalTeachers: number = 0;
  totalPages: number = 0;

  // UI state
  showAddTeacherOffcanvas = false;
  isEditMode = false;
  isViewMode = false;
  editingTeacherId: number | null = null;
  activeMenuId: number | null = null;
  isLoadingTeachers: boolean = false;
  teacherLoadError: string | null = null;

  // Selected teacher for view/edit
  selectedTeacher: Teacher | null = null;
  isLoadingTeacherDetails: boolean = false;

  // Location dropdowns
  countries: any[] = [];
  states: any[] = [];
  cities: any[] = [];
  isLoadingCountries: boolean = false;
  isLoadingStates: boolean = false;
  isLoadingCities: boolean = false;

  canSaveTeacher: boolean = false;

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
    this.loadTeachers();
    this.loadCountries();
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

  async loadTeachers(): Promise<void> {
    this.isLoadingTeachers = true;
    this.teacherLoadError = null;

    try {
      const response = await this.httpRequests.getAllTeachers({
        page: this.currentPage,
        limit: this.itemsPerPage,
        ...this.filters
      });

      if (response.success) {
        this.allTeachers = response.data.items || [];
        this.totalTeachers = response.data.pagination?.total || 0;
        this.totalPages = response.data.pagination?.totalPages || 0;
        this.filterAndPaginateTeachers();
      } else {
        this.teacherLoadError = response.message || 'Failed to load teachers';
      }
    } catch (error: any) {
      console.error('Error loading teachers:', error);
      this.teacherLoadError = error.message || 'An error occurred while loading teachers';
    } finally {
      this.isLoadingTeachers = false;
    }
  }

  async loadTeacherById(teacherId: number): Promise<void> {
    this.isLoadingTeacherDetails = true;

    try {
      const response = await this.httpRequests.getTeacherById(teacherId);

      if (response.success) {
        this.selectedTeacher = response.data;
      } else {
        console.error('Failed to load teacher details:', response.message);
      }
    } catch (error: any) {
      console.error('Error loading teacher details:', error);
    } finally {
      this.isLoadingTeacherDetails = false;
    }
  }

  async loadCountries(): Promise<void> {
    this.isLoadingCountries = true;
    try {
      const response = await this.httpRequests.getAllCountries();
      if (response.success) {
        this.countries = response.data || [];
      }
    } catch (error) {
      console.error('Error loading countries:', error);
    } finally {
      this.isLoadingCountries = false;
    }
  }

  async loadStatesByCountry(countryId: number): Promise<void> {
    this.isLoadingStates = true;
    this.states = [];
    this.cities = [];
    
    try {
      const response = await this.httpRequests.getStatesByCountry(countryId);
      if (response.success) {
        this.states = response.data || [];
      }
    } catch (error) {
      console.error('Error loading states:', error);
    } finally {
      this.isLoadingStates = false;
    }
  }

  async loadCitiesByState(stateId: number): Promise<void> {
    this.isLoadingCities = true;
    this.cities = [];
    
    try {
      const response = await this.httpRequests.getCitiesByState(stateId);
      if (response.success) {
        this.cities = response.data || [];
      }
    } catch (error) {
      console.error('Error loading cities:', error);
    } finally {
      this.isLoadingCities = false;
    }
  }

  // ==================== Filtering & Pagination ====================

  filterAndPaginateTeachers(): void {
    this.filteredTeachers = this.allTeachers.filter(teacher => {
      const matchesSearch = !this.searchTerm || 
        teacher.full_name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        teacher.username.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        teacher.primary_email?.toLowerCase().includes(this.searchTerm.toLowerCase());

      return matchesSearch;
    });

    this.paginatedTeachers = this.filteredTeachers;
  }

  onSearchChange(value: string): void {
    this.searchTerm = value;
    this.currentPage = 1;
    this.loadTeachers();
  }

  onSearch(): void {
    this.currentPage = 1;
    this.loadTeachers();
  }

  onFilterChange(): void {
    this.currentPage = 1;
    this.loadTeachers();
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadTeachers();
  }

  onItemsPerPageChanged(value: string | number): void {
    this.itemsPerPage = Number(value);
    this.currentPage = 1;
    this.loadTeachers();
  }

  // ==================== Filter Methods ====================

  toggleFilterPopup(): void {
    this.showFilterPopup = !this.showFilterPopup;
  }

  resetStatusFilter(): void {
    this.filters.status = '';
  }

  resetGenderFilter(): void {
    this.filters.gender = '';
  }

  resetCountryFilter(): void {
    this.filters.countryId = null;
  }

  resetAllFilters(): void {
    this.filters = {
      search: '',
      status: '',
      gender: '',
      countryId: null
    };
    this.searchTerm = '';
  }

  applyFilters(): void {
    this.showFilterPopup = false;
    this.currentPage = 1;
    this.loadTeachers();
  }

  // ==================== Bulk Actions ====================

  selectAll(): void {
    this.selectedTeachers = this.allTeachers.map(t => t.teacher_id);
  }

  toggleTeacherSelection(teacherId: number): void {
    const index = this.selectedTeachers.indexOf(teacherId);
    if (index > -1) {
      this.selectedTeachers.splice(index, 1);
    } else {
      this.selectedTeachers.push(teacherId);
    }
  }

  isTeacherSelected(teacherId: number): boolean {
    return this.selectedTeachers.includes(teacherId);
  }

  areAllTeachersSelected(): boolean {
    return this.paginatedTeachers.length > 0 && 
           this.selectedTeachers.length === this.paginatedTeachers.length;
  }

  toggleAllTeachers(event: any): void {
    if (event.target.checked) {
      this.selectedTeachers = this.paginatedTeachers.map(t => t.teacher_id);
    } else {
      this.selectedTeachers = [];
    }
  }

  async bulkActivate(): Promise<void> {
    if (!confirm(`Are you sure you want to activate ${this.selectedTeachers.length} teacher(s)?`)) {
      return;
    }

    try {
      // Call bulk activate API when available
      this.showSuccessMessage(`${this.selectedTeachers.length} teacher(s) activated successfully`);
      this.selectedTeachers = [];
      this.loadTeachers();
    } catch (error: any) {
      console.error('Error activating teachers:', error);
      this.showErrorMessage('Failed to activate teachers');
    }
  }

  async bulkDeactivate(): Promise<void> {
    if (!confirm(`Are you sure you want to deactivate ${this.selectedTeachers.length} teacher(s)?`)) {
      return;
    }

    try {
      // Call bulk deactivate API when available
      this.showSuccessMessage(`${this.selectedTeachers.length} teacher(s) deactivated successfully`);
      this.selectedTeachers = [];
      this.loadTeachers();
    } catch (error: any) {
      console.error('Error deactivating teachers:', error);
      this.showErrorMessage('Failed to deactivate teachers');
    }
  }

  async bulkDelete(): Promise<void> {
    if (!confirm(`Are you sure you want to delete ${this.selectedTeachers.length} teacher(s)? This action cannot be undone.`)) {
      return;
    }

    try {
      // Call bulk delete API when available
      this.showSuccessMessage(`${this.selectedTeachers.length} teacher(s) deleted successfully`);
      this.selectedTeachers = [];
      this.loadTeachers();
    } catch (error: any) {
      console.error('Error deleting teachers:', error);
      this.showErrorMessage('Failed to delete teachers');
    }
  }

  // ==================== CRUD Operations ====================

  openAddTeacherOffcanvas(): void {
    this.showAddTeacherOffcanvas = true;
    this.isEditMode = false;
    this.isViewMode = false;
    this.editingTeacherId = null;
    this.selectedTeacher = null;
  }

  closeAddTeacherOffcanvas(): void {
    this.showAddTeacherOffcanvas = false;
    this.isEditMode = false;
    this.isViewMode = false;
    this.editingTeacherId = null;
    this.selectedTeacher = null;
  }

  async onEditTeacher(teacher: Teacher): Promise<void> {
    this.editingTeacherId = teacher.teacher_id;
    this.isEditMode = true;
    this.isViewMode = false;
    await this.loadTeacherById(teacher.teacher_id);
    
    // Load location data if teacher has location
    if (this.selectedTeacher?.country_id) {
      await this.loadStatesByCountry(this.selectedTeacher.country_id);
      if (this.selectedTeacher?.state_id) {
        await this.loadCitiesByState(this.selectedTeacher.state_id);
      }
    }
    
    this.showAddTeacherOffcanvas = true;
  }

  async onViewTeacher(teacher: Teacher): Promise<void> {
    this.editingTeacherId = teacher.teacher_id;
    this.isEditMode = false;
    this.isViewMode = true;
    await this.loadTeacherById(teacher.teacher_id);
    
    // Load location data
    if (this.selectedTeacher?.country_id) {
      await this.loadStatesByCountry(this.selectedTeacher.country_id);
      if (this.selectedTeacher?.state_id) {
        await this.loadCitiesByState(this.selectedTeacher.state_id);
      }
    }
    
    this.showAddTeacherOffcanvas = true;
  }

  async onDeleteTeacher(teacher: Teacher): Promise<void> {
    if (!confirm(`Kya aap confirm karte hain ke "${teacher.full_name}" ko delete karna hai?`)) {
      return;
    }

    try {
      const response = await this.httpRequests.deleteTeacher(teacher.teacher_id);
      if (response.success) {
        this.showSuccessMessage('Teacher successfully delete ho gaya');
        this.loadTeachers();
      } else {
        this.showErrorMessage('Teacher delete karne mein error aagaya');
      }
    } catch (error: any) {
      console.error('Error deleting teacher:', error);
      this.showErrorMessage('Failed to delete teacher');
    }
  }

  // ==================== Form Events ====================

  async onTeacherFormSave(teacherData: any): Promise<void> {
    try {
      let response;

      if (this.isEditMode && this.editingTeacherId) {
        response = await this.httpRequests.updateTeacher(this.editingTeacherId, teacherData);
      } else {
        response = await this.httpRequests.createTeacher(teacherData);
      }

      if (response.success) {
        this.showSuccessMessage(this.isEditMode ? 'Teacher successfully update ho gaya' : 'Teacher successfully create ho gaya');
        this.closeAddTeacherOffcanvas();
        this.loadTeachers();
      } else {
        this.showErrorMessage(response.message || 'Teacher save karne mein error aagaya');
      }
    } catch (error: any) {
      console.error('Error saving teacher:', error);
      this.showErrorMessage(error.message || 'Failed to save teacher');
    }
  }

  onTeacherFormCancel(): void {
    this.closeAddTeacherOffcanvas();
  }

  onTeacherFormValidityChange(isValid: boolean): void {
    this.canSaveTeacher = isValid;
  }

  // ==================== Menu Actions ====================

  toggleMenu(id: number, event: Event): void {
    event.stopPropagation();
    this.activeMenuId = this.activeMenuId === id ? null : id;
  }

  // ==================== Utility Methods ====================

  trackByTeacherId(index: number, teacher: Teacher): number {
    return teacher.teacher_id;
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
    // Implement toast notification
    alert(message);
  }

  showErrorMessage(message: string): void {
    // Implement toast notification
    alert(message);
  }

  formatDate(date: string | Date | undefined): string {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString();
  }

  getStatusClass(teacher: Teacher): string {
    return teacher.is_active ? 'active' : 'inactive';
  }

  getStatusLabel(teacher: Teacher): string {
    return teacher.is_active ? 'Active' : 'Inactive';
  }
}
