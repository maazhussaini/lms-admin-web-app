import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

/**
 * Multi-step Teacher Form Component
 * Steps: 1) Personal Information, 2) Account Setup, 3) Location Information, 4) Course Information
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
  @Input() tenants: any[] = [];
  @Input() courses: any[] = [];
  @Input() isLoadingCountries = false;
  @Input() isLoadingStates = false;
  @Input() isLoadingCities = false;
  @Input() isLoadingCourses = false;
  @Input() showTenantDropdown: boolean = false; // Show tenant dropdown for SUPER_ADMIN

  @Output() save = new EventEmitter<any>();
  @Output() cancel = new EventEmitter<void>();
  @Output() validityChange = new EventEmitter<boolean>();
  @Output() countryChange = new EventEmitter<number>();
  @Output() stateChange = new EventEmitter<number>();

  // Step identifiers
  readonly STEP_PERSONAL = 1;
  readonly STEP_ACCOUNT = 2;
  readonly STEP_LOCATION = 3;
  readonly STEP_COURSE = 4;

  currentStep: number = 1;
  totalSteps: number = 4;

  // Email addresses array
  emailAddresses: Array<{
    email_address: string;
    is_primary: boolean;
  }> = [];

  // Phone numbers array
  phoneNumbers: Array<{
    phone_number: string;
    is_primary: boolean;
  }> = [];

  // Selected course IDs
  selectedCourseIds: number[] = [];

  formData: any = {
    tenant_id: null,
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
      tenant_id: this.teacherData.tenant_id || null,
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
    };

    // Load email addresses
    if (this.teacherData.teacher_email_addresses && this.teacherData.teacher_email_addresses.length > 0) {
      this.emailAddresses = this.teacherData.teacher_email_addresses.map((email: any) => ({
        email_address: email.email_address,
        is_primary: email.is_primary || false
      }));
    } else if (this.formData.email_address) {
      // If no separate emails, use primary email
      this.emailAddresses = [{
        email_address: this.formData.email_address,
        is_primary: true
      }];
    }

    // Load phone numbers
    if (this.teacherData.teacher_phone_numbers && this.teacherData.teacher_phone_numbers.length > 0) {
      this.phoneNumbers = this.teacherData.teacher_phone_numbers.map((phone: any) => ({
        phone_number: phone.phone_number,
        is_primary: phone.is_primary || false
      }));
    }

    // Load selected courses
    if (this.teacherData.teacher_courses && this.teacherData.teacher_courses.length > 0) {
      this.selectedCourseIds = this.teacherData.teacher_courses.map((tc: any) => tc.course_id);
    }

    this.checkFormValidity();
  }

  // ==================== Step Navigation ====================

  /**
   * Navigate to a specific step
   * Direct clicks on step indicators allow free navigation
   */
  goToStep(step: number): void {
    // Allow direct navigation to any step when clicking on step indicator
    this.currentStep = step;
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
      case this.STEP_COURSE:
        return this.isCourseInfoValid();
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
      case this.STEP_COURSE:
        return this.isCourseInfoValid();
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
    // Must have at least one email and one phone
    const hasEmails = this.emailAddresses.length > 0 && 
                     this.emailAddresses.every(e => e.email_address.trim() !== '');
    const hasPhones = this.phoneNumbers.length > 0 && 
                     this.phoneNumbers.every(p => p.phone_number.trim() !== '');
    const hasUsername = !!this.formData.username;
    const hasPassword = this.isEditMode || !!this.formData.password;
    
    return hasUsername && hasPassword && hasEmails && hasPhones;
  }

  /**
   * Validate Location Information step
   */
  isLocationInfoValid(): boolean {
    // Location is optional, so always return true
    return true;
  }

  /**
   * Validate Course Information step
   */
  isCourseInfoValid(): boolean {
    // Courses are optional, so always return true
    return true;
  }

  /**
   * Check overall form validity
   */
  isFormValid(): boolean {
    return this.isPersonalInfoValid() && 
           this.isAccountSetupValid() && 
           this.isLocationInfoValid() &&
           this.isCourseInfoValid();
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

  /**
   * Handle name field changes and auto-generate full name
   */
  onNameFieldChange(): void {
    // Auto-generate full name from first, middle, and last name
    const nameParts = [
      this.formData.first_name?.trim(),
      this.formData.middle_name?.trim(),
      this.formData.last_name?.trim()
    ].filter(part => part && part.length > 0);
    
    this.formData.full_name = nameParts.join(' ');
    this.checkFormValidity();
  }

  onFormFieldChange(): void {
    this.checkFormValidity();
  }

  checkFormValidity(): void {
    const isValid = this.isFormValid();
    this.validityChange.emit(isValid);
  }

  // ==================== Email Management ====================

  /**
   * Add new email address
   */
  addEmailAddress(): void {
    this.emailAddresses.push({
      email_address: '',
      is_primary: this.emailAddresses.length === 0 // First email is primary by default
    });
    this.checkFormValidity();
  }

  /**
   * Remove email address at index
   */
  removeEmailAddress(index: number): void {
    const removedEmail = this.emailAddresses[index];
    this.emailAddresses.splice(index, 1);

    // If removed email was primary and there are still emails, make first one primary
    if (removedEmail.is_primary && this.emailAddresses.length > 0) {
      this.emailAddresses[0].is_primary = true;
    }

    this.checkFormValidity();
  }

  /**
   * Handle primary email change
   */
  onEmailPrimaryChange(index: number): void {
    // Unset all other emails as primary
    this.emailAddresses.forEach((email, i) => {
      email.is_primary = i === index;
    });
  }

  // ==================== Phone Management ====================

  /**
   * Add new phone number
   */
  addPhoneNumber(): void {
    this.phoneNumbers.push({
      phone_number: '',
      is_primary: this.phoneNumbers.length === 0 // First phone is primary by default
    });
    this.checkFormValidity();
  }

  /**
   * Remove phone number at index
   */
  removePhoneNumber(index: number): void {
    const removedPhone = this.phoneNumbers[index];
    this.phoneNumbers.splice(index, 1);

    // If removed phone was primary and there are still phones, make first one primary
    if (removedPhone.is_primary && this.phoneNumbers.length > 0) {
      this.phoneNumbers[0].is_primary = true;
    }

    this.checkFormValidity();
  }

  /**
   * Handle primary phone change
   */
  onPhonePrimaryChange(index: number): void {
    // Unset all other phones as primary
    this.phoneNumbers.forEach((phone, i) => {
      phone.is_primary = i === index;
    });
  }

  // ==================== Course Management ====================

  /**
   * Check if a course is selected
   */
  isCourseSelected(courseId: number): boolean {
    return this.selectedCourseIds.includes(courseId);
  }

  /**
   * Get course by ID
   */
  getCourseById(courseId: number): any {
    return this.courses.find(course => course.course_id === courseId);
  }

  /**
   * Handle course selection from dropdown
   */
  onCourseSelect(courseIdStr: string): void {
    if (!courseIdStr) return;
    
    const courseId = parseInt(courseIdStr, 10);
    if (!this.selectedCourseIds.includes(courseId)) {
      this.selectedCourseIds.push(courseId);
      this.checkFormValidity();
    }
  }

  /**
   * Remove course from assigned list
   */
  removeCourse(courseId: number): void {
    const index = this.selectedCourseIds.indexOf(courseId);
    if (index > -1) {
      this.selectedCourseIds.splice(index, 1);
      this.checkFormValidity();
    }
  }

  /**
   * Handle course selection change (for checkbox - kept for backward compatibility)
   */
  onCourseSelectionChange(courseId: number, isChecked: boolean): void {
    if (isChecked) {
      if (!this.selectedCourseIds.includes(courseId)) {
        this.selectedCourseIds.push(courseId);
      }
    } else {
      const index = this.selectedCourseIds.indexOf(courseId);
      if (index > -1) {
        this.selectedCourseIds.splice(index, 1);
      }
    }
    this.checkFormValidity();
  }

  /**
   * Public method to submit form - called from parent component
   */
  public submitForm(): void {
    if (this.isViewMode) return;

    const dataToSave: any = { ...this.formData };

    // Add email addresses
    dataToSave.emailAddresses = this.emailAddresses.filter(e => e.email_address.trim() !== '');

    // Also set email_address field for backward compatibility (backend still requires it)
    if (dataToSave.emailAddresses.length > 0) {
      dataToSave.email_address = dataToSave.emailAddresses[0].email_address;
    }

    // Add phone numbers with dial_code extracted from phone_number
    dataToSave.phoneNumbers = this.phoneNumbers
      .filter(p => p.phone_number.trim() !== '')
      .map(p => {
        // Extract dial code and phone number
        // Example: "+92-3433052211" or "3433052211"
        const phoneStr = p.phone_number.trim();
        let dial_code = '+92'; // Default Pakistan
        let phone_number = phoneStr;

        // Check if phone starts with +
        if (phoneStr.startsWith('+')) {
          const parts = phoneStr.split('-');
          if (parts.length >= 2) {
            dial_code = parts[0];
            phone_number = parts.slice(1).join('');
          } else {
            // Try to extract first 2-4 digits as dial code
            const match = phoneStr.match(/^\+(\d{1,4})(.*)/);
            if (match) {
              dial_code = '+' + match[1];
              phone_number = match[2];
            }
          }
        } else if (phoneStr.includes('-')) {
          const parts = phoneStr.split('-');
          dial_code = parts[0].startsWith('+') ? parts[0] : '+' + parts[0];
          phone_number = parts.slice(1).join('');
        }

        return {
          dial_code: dial_code,
          phone_number: phone_number.replace(/\D/g, ''), // Remove non-digits
          is_primary: p.is_primary
        };
      });

    // Add selected course IDs
    dataToSave.courseIds = this.selectedCourseIds;

    // Convert string fields to proper types
    if (dataToSave.tenant_id) {
      dataToSave.tenant_id = parseInt(dataToSave.tenant_id, 10);
    }
    if (dataToSave.country_id) {
      dataToSave.country_id = parseInt(dataToSave.country_id, 10);
    }
    if (dataToSave.state_id) {
      dataToSave.state_id = parseInt(dataToSave.state_id, 10);
    }
    if (dataToSave.city_id) {
      dataToSave.city_id = parseInt(dataToSave.city_id, 10);
    }
    if (dataToSave.age) {
      dataToSave.age = parseInt(dataToSave.age, 10);
    }

    // Clean up empty/null fields (except email_address which is required by backend)
    Object.keys(dataToSave).forEach(key => {
      // Skip email_address field - it's required by backend
      if (key === 'email_address') return;
      
      // Remove if empty string, null, undefined, or empty array
      if (
        dataToSave[key] === '' || 
        dataToSave[key] === null || 
        dataToSave[key] === undefined ||
        (Array.isArray(dataToSave[key]) && dataToSave[key].length === 0)
      ) {
        delete dataToSave[key];
      }
    });

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
