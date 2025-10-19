import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

/**
 * Multi-step Teacher Form Component
 * Steps: 1) Personal Information, 2) Account Setup, 3) Location Information
 */
@Component({
  selector: 'app-teacher-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './teacher-form.component.html',
  styleUrl: './teacher-form.component.scss'
})
export class TeacherFormComponent implements OnInit, OnChanges {
  @Input() isEditMode = false;
  @Input() isViewMode = false;
  @Input() teacherData: any = null;
  @Input() countries: any[] = [];
  @Input() states: any[] = [];
  @Input() cities: any[] = [];
  @Input() isLoadingCountries = false;
  @Input() isLoadingStates = false;
  @Input() isLoadingCities = false;

  @Output() save = new EventEmitter<any>();
  @Output() cancel = new EventEmitter<void>();
  @Output() validityChange = new EventEmitter<boolean>();
  @Output() countryChange = new EventEmitter<number>();
  @Output() stateChange = new EventEmitter<number>();

  // Step identifiers
  readonly STEP_PERSONAL = 1;
  readonly STEP_ACCOUNT = 2;
  readonly STEP_LOCATION = 3;

  currentStep: number = 1;
  totalSteps: number = 3;

  formData: any = {
    full_name: '',
    first_name: '',
    middle_name: '',
    last_name: '',
    username: '',
    password: '',
    email_address: '',
    country_id: null,
    state_id: null,
    city_id: null,
    address: '',
    zip_code: '',
    date_of_birth: '',
    age: null,
    gender: '',
    profile_picture_url: '',
    teacher_qualification: '',
    joining_date: '',
    phoneNumbers: [],
    emailAddresses: []
  };

  ngOnInit(): void {
    // Always start at step 1
    this.currentStep = this.STEP_PERSONAL;
    
    if (this.teacherData && (this.isEditMode || this.isViewMode)) {
      this.loadTeacherData();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['teacherData'] && this.teacherData && (this.isEditMode || this.isViewMode)) {
      this.loadTeacherData();
    }
    
    // Reset to step 1 when mode changes
    if (changes['isEditMode'] || changes['isViewMode']) {
      this.currentStep = this.STEP_PERSONAL;
    }
  }

  loadTeacherData(): void {
    if (!this.teacherData) return;

    this.formData = {
      full_name: this.teacherData.full_name || '',
      first_name: this.teacherData.first_name || '',
      middle_name: this.teacherData.middle_name || '',
      last_name: this.teacherData.last_name || '',
      username: this.teacherData.username || '',
      password: '', // Don't load password
      email_address: this.teacherData.primary_email || '',
      country_id: this.teacherData.country_id,
      state_id: this.teacherData.state_id,
      city_id: this.teacherData.city_id,
      address: this.teacherData.address || '',
      zip_code: this.teacherData.zip_code || '',
      date_of_birth: this.teacherData.date_of_birth || '',
      age: this.teacherData.age,
      gender: this.teacherData.gender || '',
      profile_picture_url: this.teacherData.profile_picture_url || '',
      teacher_qualification: this.teacherData.teacher_qualification || '',
      joining_date: this.teacherData.joining_date || '',
      phoneNumbers: this.teacherData.phones || [],
      emailAddresses: this.teacherData.emails || []
    };

    this.checkFormValidity();
  }

  // ==================== Step Navigation ====================

  /**
   * Navigate to a specific step
   */
  goToStep(step: number): void {
    if (this.isViewMode) {
      this.currentStep = step;
      return;
    }

    // In edit/add mode, validate before allowing navigation
    if (step < this.currentStep) {
      // Allow going back without validation
      this.currentStep = step;
    } else if (step > this.currentStep) {
      // Going forward requires validation
      if (this.canProceedFromCurrentStep()) {
        this.currentStep = step;
      }
    }
  }

  /**
   * Go to next step
   */
  nextStep(): void {
    if (this.currentStep < this.totalSteps && this.canProceedFromCurrentStep()) {
      this.currentStep++;
    }
  }

  /**
   * Go to previous step
   */
  previousStep(): void {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }

  /**
   * Check if current step is valid and can proceed
   */
  canProceedFromCurrentStep(): boolean {
    switch (this.currentStep) {
      case this.STEP_PERSONAL:
        return this.isPersonalInfoValid();
      case this.STEP_ACCOUNT:
        return this.isAccountSetupValid();
      case this.STEP_LOCATION:
        return this.isLocationInfoValid();
      default:
        return false;
    }
  }

  /**
   * Check if step is completed
   */
  isStepCompleted(step: number): boolean {
    if (step > this.currentStep) return false;

    switch (step) {
      case this.STEP_PERSONAL:
        return this.isPersonalInfoValid();
      case this.STEP_ACCOUNT:
        return this.isAccountSetupValid();
      case this.STEP_LOCATION:
        return this.isLocationInfoValid();
      default:
        return false;
    }
  }

  // ==================== Step Validation ====================

  /**
   * Validate Personal Information step
   */
  isPersonalInfoValid(): boolean {
    return !!(
      this.formData.full_name &&
      this.formData.first_name &&
      this.formData.last_name
    );
  }

  /**
   * Validate Account Setup step
   */
  isAccountSetupValid(): boolean {
    const hasUsername = !!this.formData.username;
    const hasPassword = this.isEditMode || !!this.formData.password;
    const hasEmail = !!this.formData.email_address;
    
    return hasUsername && hasPassword && hasEmail;
  }

  /**
   * Validate Location Information step
   */
  isLocationInfoValid(): boolean {
    // Location is optional, so always return true
    return true;
  }

  /**
   * Check overall form validity
   */
  isFormValid(): boolean {
    return this.isPersonalInfoValid() && 
           this.isAccountSetupValid() && 
           this.isLocationInfoValid();
  }

  // ==================== Form Handlers ====================

  onCountryChange(): void {
    if (this.formData.country_id) {
      this.countryChange.emit(this.formData.country_id);
      this.formData.state_id = null;
      this.formData.city_id = null;
    }
  }

  onStateChange(): void {
    if (this.formData.state_id) {
      this.stateChange.emit(this.formData.state_id);
      this.formData.city_id = null;
    }
  }

  onFullNameChange(): void {
    // Auto-populate first and last name from full name
    const names = this.formData.full_name.trim().split(' ');
    if (names.length > 0) {
      this.formData.first_name = names[0];
      if (names.length > 1) {
        this.formData.last_name = names[names.length - 1];
        if (names.length > 2) {
          this.formData.middle_name = names.slice(1, -1).join(' ');
        }
      }
    }
    this.checkFormValidity();
  }

  onFormFieldChange(): void {
    this.checkFormValidity();
  }

  checkFormValidity(): void {
    const isValid = this.isFormValid();
    this.validityChange.emit(isValid);
  }

  /**
   * Public method to submit form - called from parent component
   */
  public submitForm(): void {
    if (this.isViewMode) return;

    const dataToSave = { ...this.formData };

    // Remove empty fields for PATCH requests
    if (this.isEditMode) {
      Object.keys(dataToSave).forEach(key => {
        if (dataToSave[key] === '' || dataToSave[key] === null || dataToSave[key] === undefined) {
          delete dataToSave[key];
        }
      });
    }

    this.save.emit(dataToSave);
  }

  /**
   * Mark all fields as touched to show validation errors
   */
  markAllFieldsAsTouched(): void {
    // Template-driven form validation will show when fields are invalid
  }

  onCancel(): void {
    this.cancel.emit();
  }
}
