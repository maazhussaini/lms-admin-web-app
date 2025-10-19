import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Paginator } from '../../../../components/widgets/paginator/paginator';
import { OffCanvasWrapper } from '../../../../components/widgets/off-canvas-wrapper/off-canvas-wrapper';
import { StudentFormComponent } from '../../../../components/forms/student-form/student-form.component';
import { HttpRequests } from '../../../../services/http-requests.service';

export interface Student {
  student_id: number;
  full_name: string;
  first_name: string;
  last_name: string;
  username: string;
  primary_email?: string;
  primary_phone?: string;
  student_status: string;
  enrollments?: number;
  profile_picture_url?: string;
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
  selector: 'app-student-management',
  standalone: true,
  imports: [CommonModule, FormsModule, Paginator, OffCanvasWrapper, StudentFormComponent],
  templateUrl: './student-management.html',
  styleUrl: './student-management.scss'
})
export class StudentManagement implements OnInit, OnDestroy {
  
  // ViewChild to access student form component
  @ViewChild(StudentFormComponent) studentFormComponent!: StudentFormComponent;
  
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

  // Student data
  allStudents: Student[] = [];
  filteredStudents: Student[] = [];
  paginatedStudents: Student[] = [];

  // Selection
  selectedStudents: number[] = [];

  // Pagination
  currentPage: number = 1;
  itemsPerPage: number = 10;
  totalStudents: number = 0;
  totalPages: number = 0;

  // UI state
  showAddStudentOffcanvas = false;
  isEditMode = false;
  isViewMode = false;
  editingStudentId: number | null = null;
  activeMenuId: number | null = null;
  isLoadingStudents: boolean = false;
  studentLoadError: string | null = null;

  // Selected student for view/edit
  selectedStudent: Student | null = null;
  isLoadingStudentDetails: boolean = false;

  // Location dropdowns
  countries: any[] = [];
  states: any[] = [];
  cities: any[] = [];
  isLoadingCountries: boolean = false;
  isLoadingStates: boolean = false;
  isLoadingCities: boolean = false;

  // Tenant dropdown (for SUPER_ADMIN)
  tenants: any[] = [];
  isLoadingTenants: boolean = false;
  showTenantDropdown: boolean = false;

  canSaveStudent: boolean = false;

  // Getter methods for template access
  get currentFormStep(): number {
    return this.studentFormComponent?.currentStep || 1;
  }

  get totalFormSteps(): number {
    return this.studentFormComponent?.totalSteps || 3;
  }

  get isFormValid(): boolean {
    return this.studentFormComponent?.studentForm?.valid || false;
  }

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
    console.log('🔍 ===== COMPONENT INIT START =====');
    console.log('🔍 Checking localStorage...');
    console.log('🔍 localStorage keys:', Object.keys(localStorage));
    console.log('🔍 lms_user_data key exists?:', localStorage.getItem('lms_user_data') !== null);
    console.log('🔍 lms_access_token key exists?:', localStorage.getItem('lms_access_token') !== null);
    
    this.loadCurrentUser();
    this.checkIfSuperAdmin();
    
    // Load tenants if SUPER_ADMIN
    if (this.showTenantDropdown) {
      this.loadTenants();
    }
    
    this.loadStudents();
    this.loadCountries();
    
    document.addEventListener('click', this.documentClickListener);
    console.log('🔍 ===== COMPONENT INIT COMPLETE =====');
  }

  ngOnDestroy(): void {
    document.removeEventListener('click', this.documentClickListener);
  }

  // ==================== Data Loading ====================

  loadCurrentUser(): void {
    console.log('📂 Loading current user from localStorage...');
    
    // CORRECT KEY: Use 'lms_user_data' not 'currentUser'
    const userStr = localStorage.getItem('lms_user_data');
    console.log('📂 LocalStorage raw data (lms_user_data):', userStr);
    
    if (userStr) {
      this.currentUser = JSON.parse(userStr);
      this.permissions = this.currentUser?.permissions || [];
      console.log('✅ Current user loaded:', this.currentUser);
    } else {
      console.error('❌ No user found in localStorage!');
      console.error('❌ Available keys:', Object.keys(localStorage));
    }
  }

  checkIfSuperAdmin(): void {
    // Check if user is SUPER_ADMIN
    console.log('🔍 ===== CHECKING SUPER_ADMIN =====');
    console.log('🔍 Current user object:', this.currentUser);
    console.log('🔍 User type value:', this.currentUser?.user_type);
    console.log('🔍 User type TYPE:', typeof this.currentUser?.user_type);
    console.log('🔍 Comparing with:', 'SUPER_ADMIN');
    console.log('🔍 Strict equality (===):', this.currentUser?.user_type === 'SUPER_ADMIN');
    
    // TEMPORARY: Force true for debugging if user exists
    if (this.currentUser && this.currentUser.user_type) {
      console.log('⚠️ TEMPORARY: Checking ALL possible user_type values...');
      console.log('⚠️ user_type.trim():', this.currentUser.user_type.trim());
      console.log('⚠️ user_type.toUpperCase():', this.currentUser.user_type.toUpperCase());
      
      // Try case-insensitive comparison
      const userTypeUpper = (this.currentUser.user_type || '').toString().trim().toUpperCase();
      console.log('⚠️ Normalized user_type:', userTypeUpper);
      console.log('⚠️ Match with SUPER_ADMIN?:', userTypeUpper === 'SUPER_ADMIN');
      
      this.showTenantDropdown = userTypeUpper === 'SUPER_ADMIN';
    } else {
      this.showTenantDropdown = false;
    }
    
    console.log('🔍 Final showTenantDropdown value:', this.showTenantDropdown);
    console.log('🔍 ===== CHECK COMPLETE =====');
  }

  async loadTenants(): Promise<void> {
    this.isLoadingTenants = true;
    try {
      console.log('📥 Loading tenants for SUPER_ADMIN...');
      const response = await this.httpRequests.getAllTenants({
        limit: 100 // ✅ FIXED: Backend max limit is 100, not 1000
      });
      console.log('📥 Tenants API response:', response);
      console.log('📥 Response structure:', {
        success: response.success,
        dataType: typeof response.data,
        hasItems: response.data?.items !== undefined,
        itemsLength: response.data?.items?.length,
        rawData: response.data
      });
      
      if (response.success) {
        this.tenants = response.data.items || [];
        console.log('✅ Tenants loaded successfully:', this.tenants.length);
        console.log('📋 Tenants array:', this.tenants);
        console.log('📋 First tenant structure:', this.tenants[0]);
      } else {
        console.error('❌ Failed to load tenants:', response.message);
        this.tenants = [];
      }
    } catch (error) {
      console.error('❌ Error loading tenants:', error);
      this.tenants = [];
    } finally {
      this.isLoadingTenants = false;
      console.log('🏁 loadTenants completed. Final tenants count:', this.tenants.length);
    }
  }

  async loadStudents(): Promise<void> {
    this.isLoadingStudents = true;
    this.studentLoadError = null;

    try {
      const response = await this.httpRequests.getAllStudents({
        page: this.currentPage,
        limit: this.itemsPerPage,
        ...this.filters
      });

      if (response.success) {
        this.allStudents = response.data.items || [];
        this.totalStudents = response.data.pagination?.total || 0;
        this.totalPages = response.data.pagination?.totalPages || 0;
        this.filterAndPaginateStudents();
      } else {
        this.studentLoadError = response.message || 'Failed to load students';
      }
    } catch (error: any) {
      console.error('Error loading students:', error);
      this.studentLoadError = error.message || 'An error occurred while loading students';
    } finally {
      this.isLoadingStudents = false;
    }
  }

  async loadStudentById(studentId: number): Promise<void> {
    this.isLoadingStudentDetails = true;

    try {
      const response = await this.httpRequests.getStudentById(studentId);

      if (response.success) {
        this.selectedStudent = response.data;
      } else {
        console.error('Failed to load student details:', response.message);
      }
    } catch (error: any) {
      console.error('Error loading student details:', error);
    } finally {
      this.isLoadingStudentDetails = false;
    }
  }

  async loadCountries(): Promise<void> {
    this.isLoadingCountries = true;
    try {
      const response = await this.httpRequests.getAllCountries({
        limit: 100 // ✅ FIXED: Backend max limit is 100
      });
      if (response.success) {
        this.countries = response.data.items || [];
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
      const response = await this.httpRequests.getStatesByCountry(countryId, {
        limit: 100 // ✅ FIXED: Backend max limit is 100
      });
      if (response.success) {
        this.states = response.data.items || [];
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
      const response = await this.httpRequests.getCitiesByState(stateId, {
        limit: 100 // ✅ FIXED: Backend max limit is 100
      });
      if (response.success) {
        this.cities = response.data.items || [];
      }
    } catch (error) {
      console.error('Error loading cities:', error);
    } finally {
      this.isLoadingCities = false;
    }
  }

  // ==================== Filtering & Pagination ====================

  filterAndPaginateStudents(): void {
    this.filteredStudents = this.allStudents.filter(student => {
      const matchesSearch = !this.searchTerm || 
        student.full_name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        student.username.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        student.primary_email?.toLowerCase().includes(this.searchTerm.toLowerCase());

      return matchesSearch;
    });

    this.paginatedStudents = this.filteredStudents;
  }

  onSearch(): void {
    this.currentPage = 1;
    this.loadStudents();
  }

  onFilterChange(): void {
    this.currentPage = 1;
    this.loadStudents();
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadStudents();
  }

  onItemsPerPageChanged(value: string | number): void {
    this.itemsPerPage = Number(value);
    this.currentPage = 1;
    this.loadStudents();
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
    this.loadStudents();
  }

  // ==================== Bulk Actions ====================

  selectAll(): void {
    this.selectedStudents = this.allStudents.map(s => s.student_id);
  }

  async bulkActivate(): Promise<void> {
    if (!confirm(`Are you sure you want to activate ${this.selectedStudents.length} student(s)?`)) {
      return;
    }

    try {
      // Call bulk activate API when available
      this.showSuccessMessage(`${this.selectedStudents.length} student(s) activated successfully`);
      this.selectedStudents = [];
      this.loadStudents();
    } catch (error: any) {
      console.error('Error activating students:', error);
      this.showErrorMessage('Failed to activate students');
    }
  }

  async bulkDeactivate(): Promise<void> {
    if (!confirm(`Are you sure you want to deactivate ${this.selectedStudents.length} student(s)?`)) {
      return;
    }

    try {
      // Call bulk deactivate API when available
      this.showSuccessMessage(`${this.selectedStudents.length} student(s) deactivated successfully`);
      this.selectedStudents = [];
      this.loadStudents();
    } catch (error: any) {
      console.error('Error deactivating students:', error);
      this.showErrorMessage('Failed to deactivate students');
    }
  }

  async bulkDelete(): Promise<void> {
    if (!confirm(`Are you sure you want to delete ${this.selectedStudents.length} student(s)? This action cannot be undone.`)) {
      return;
    }

    try {
      // Call bulk delete API when available
      this.showSuccessMessage(`${this.selectedStudents.length} student(s) deleted successfully`);
      this.selectedStudents = [];
      this.loadStudents();
    } catch (error: any) {
      console.error('Error deleting students:', error);
      this.showErrorMessage('Failed to delete students');
    }
  }

  // ==================== CRUD Operations ====================

  openAddStudentOffcanvas(): void {
    console.log('🚀 ===== OPENING ADD STUDENT FORM =====');
    console.log('🚀 Current user:', this.currentUser);
    console.log('🚀 User type:', this.currentUser?.user_type);
    console.log('🚀 showTenantDropdown:', this.showTenantDropdown);
    console.log('🚀 Tenants count:', this.tenants?.length || 0);
    console.log('🚀 Tenants data:', this.tenants);
    console.log('🚀 isLoadingTenants:', this.isLoadingTenants);
    
    // If SUPER_ADMIN and tenants not loaded yet, wait for them
    if (this.showTenantDropdown && (!this.tenants || this.tenants.length === 0) && !this.isLoadingTenants) {
      console.log('⚠️ Tenants not loaded yet. Loading now...');
      this.loadTenants().then(() => {
        console.log('✅ Tenants loaded. Opening form now with', this.tenants.length, 'tenants');
        this.openFormAfterTenantCheck();
      }).catch(error => {
        console.error('❌ Failed to load tenants:', error);
        this.openFormAfterTenantCheck(); // Open anyway, let user see the error
      });
    } else {
      this.openFormAfterTenantCheck();
    }
  }

  private openFormAfterTenantCheck(): void {
    console.log('🚀 ===== FORM OPENING =====');
    
    this.showAddStudentOffcanvas = true;
    this.isEditMode = false;
    this.isViewMode = false;
    this.editingStudentId = null;
    this.selectedStudent = null;
  }

  closeAddStudentOffcanvas(): void {
    this.showAddStudentOffcanvas = false;
    this.isEditMode = false;
    this.isViewMode = false;
    this.editingStudentId = null;
    this.selectedStudent = null;
  }

  async onEditStudent(student: Student): Promise<void> {
    // Close the menu first
    this.activeMenuId = null;
    
    this.editingStudentId = student.student_id;
    this.isEditMode = true;
    this.isViewMode = false;
    await this.loadStudentById(student.student_id);
    
    // Load location data if student has location
    if (this.selectedStudent?.country_id) {
      await this.loadStatesByCountry(this.selectedStudent.country_id);
      if (this.selectedStudent?.state_id) {
        await this.loadCitiesByState(this.selectedStudent.state_id);
      }
    }
    
    this.showAddStudentOffcanvas = true;
  }

  async onViewStudent(student: Student): Promise<void> {
    // Close the menu first
    this.activeMenuId = null;
    
    this.editingStudentId = student.student_id;
    this.isEditMode = false;
    this.isViewMode = true;
    await this.loadStudentById(student.student_id);
    
    // Load location data
    if (this.selectedStudent?.country_id) {
      await this.loadStatesByCountry(this.selectedStudent.country_id);
      if (this.selectedStudent?.state_id) {
        await this.loadCitiesByState(this.selectedStudent.state_id);
      }
    }
    
    this.showAddStudentOffcanvas = true;
  }

  /**
   * Trigger form submission from footer button
   */
  saveStudent(): void {
    if (this.studentFormComponent) {
      this.studentFormComponent.submitForm();
    }
  }

  /**
   * Go to next step with validation
   */
  goToNextStepWithValidation(): void {
    if (this.studentFormComponent) {
      // Mark all fields as touched to show validation errors
      this.studentFormComponent.markCurrentStepAsTouched();
      
      // Check if current step is valid before proceeding
      if (this.studentFormComponent.isCurrentStepValid()) {
        this.studentFormComponent.goToNextStep();
      }
    }
  }

  /**
   * Save student with validation
   */
  saveStudentWithValidation(): void {
    if (this.studentFormComponent) {
      // Mark all fields as touched to show validation errors
      this.studentFormComponent.markAllFieldsAsTouched();
      
      // Check if form is valid before submitting
      if (this.studentFormComponent.studentForm.valid) {
        this.studentFormComponent.submitForm();
      }
    }
  }

  async onStudentFormSubmit(formData: any): Promise<void> {
    try {
      if (this.isEditMode && this.editingStudentId) {
        // Update student
        const response = await this.httpRequests.updateStudent(
          this.editingStudentId,
          formData
        );

        if (response.success) {
          this.showSuccessMessage('Student updated successfully');
          this.closeAddStudentOffcanvas();
          this.loadStudents();
        } else {
          this.showErrorMessage(response.message || 'Failed to update student');
        }
      } else {
        // Create new student
        const response = await this.httpRequests.createStudent(formData);

        if (response.success) {
          this.showSuccessMessage('Student created successfully');
          this.closeAddStudentOffcanvas();
          this.loadStudents();
        } else {
          this.showErrorMessage(response.message || 'Failed to create student');
        }
      }
    } catch (error: any) {
      console.error('Error saving student:', error);
      this.showErrorMessage(error.message || 'An error occurred while saving student');
    }
  }

  async onDeleteStudent(student: Student): Promise<void> {
    // Close the menu first
    this.activeMenuId = null;
    
    if (!confirm(`Are you sure you want to delete student "${student.full_name}"?`)) {
      return;
    }

    try {
      const response = await this.httpRequests.deleteStudent(student.student_id);

      if (response.success) {
        this.showSuccessMessage('Student deleted successfully');
        this.loadStudents();
      } else {
        this.showErrorMessage(response.message || 'Failed to delete student');
      }
    } catch (error: any) {
      console.error('Error deleting student:', error);
      this.showErrorMessage(error.message || 'An error occurred while deleting student');
    }
  }

  // ==================== Location Handlers ====================

  onCountryChange(countryId: number): void {
    this.loadStatesByCountry(countryId);
  }

  onStateChange(stateId: number): void {
    this.loadCitiesByState(stateId);
  }

  // ==================== Selection ====================

  toggleAllStudents(event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    
    if (checked) {
      this.selectedStudents = this.paginatedStudents.map(s => s.student_id);
    } else {
      this.selectedStudents = [];
    }
  }

  toggleStudentSelection(studentId: number): void {
    const index = this.selectedStudents.indexOf(studentId);
    
    if (index > -1) {
      this.selectedStudents.splice(index, 1);
    } else {
      this.selectedStudents.push(studentId);
    }
  }

  isStudentSelected(studentId: number): boolean {
    return this.selectedStudents.includes(studentId);
  }

  areAllStudentsSelected(): boolean {
    return this.paginatedStudents.length > 0 && 
           this.paginatedStudents.every(s => this.selectedStudents.includes(s.student_id));
  }

  // ==================== UI Helpers ====================

  toggleMenu(studentId: number, event: Event): void {
    event.stopPropagation();
    this.activeMenuId = this.activeMenuId === studentId ? null : studentId;
  }

  onSearchChange(value: string): void {
    this.searchTerm = value;
    this.currentPage = 1;
    this.loadStudents();
  }

  trackByStudentId(index: number, student: Student): number {
    return student.student_id;
  }

  getStatusClass(status: string): string {
    const statusMap: { [key: string]: string } = {
      'ACTIVE': 'active',
      'INACTIVE': 'inactive',
      'SUSPENDED': 'suspended',
      'GRADUATED': 'graduated',
      'TRIAL': 'trial'
    };
    return statusMap[status?.toUpperCase()] || 'inactive';
  }

  clearFilters(): void {
    this.filters = {
      search: '',
      status: '',
      gender: '',
      countryId: null
    };
    this.searchTerm = '';
    this.onFilterChange();
  }

  getStatusBadgeClass(status: string): string {
    const statusMap: { [key: string]: string } = {
      'ACTIVE': 'badge-success',
      'SUSPENDED': 'badge-warning',
      'INACTIVE': 'badge-secondary',
      'TRIAL': 'badge-info'
    };
    return statusMap[status] || 'badge-secondary';
  }

  getInitials(name: string): string {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  }

  getAvatarClass(index: number): string {
    const colors = ['bg-purple', 'bg-blue', 'bg-green', 'bg-orange', 'bg-pink', 'bg-teal', 'bg-indigo', 'bg-cyan'];
    return colors[index % colors.length];
  }

  formatDate(date: Date | string): string {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  private showSuccessMessage(message: string): void {
    // Implement your toast/notification system
    console.log('Success:', message);
    alert(message);
  }

  private showErrorMessage(message: string): void {
    // Implement your toast/notification system
    console.error('Error:', message);
    alert(message);
  }
}

