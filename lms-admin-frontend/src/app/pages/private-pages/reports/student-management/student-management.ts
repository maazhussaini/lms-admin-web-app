import { Component, OnInit, OnDestroy } from '@angular/core';
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

  canSaveStudent: boolean = false;

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
    this.loadStudents();
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
    const colors = ['bg-purple', 'bg-blue', 'bg-green', 'bg-orange', 'bg-pink'];
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

