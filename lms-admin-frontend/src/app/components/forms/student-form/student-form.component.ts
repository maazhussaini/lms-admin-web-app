import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormBuilder, Validators, FormArray, AbstractControl } from '@angular/forms';

/**
 * Multi-step Student Form Component
 * Steps: 1) Personal Information, 2) Account Setup, 3) Location Information
 */
@Component({
  selector: 'app-student-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './student-form.component.html',
  styleUrl: './student-form.component.scss'
})
export class StudentFormComponent implements OnInit, OnChanges {
  @Input() student: any = null;
  @Input() isEditMode: boolean = false;
  @Input() isViewMode: boolean = false;
  @Input() countries: any[] = [];
  @Input() states: any[] = [];
  @Input() cities: any[] = [];
  @Input() tenants: any[] = []; // For SUPER_ADMIN tenant selection
  @Input() showTenantDropdown: boolean = false; // Show tenant dropdown for SUPER_ADMIN
  
  @Output() formSubmit = new EventEmitter<any>();
  @Output() formCancel = new EventEmitter<void>();
  @Output() countryChange = new EventEmitter<number>();
  @Output() stateChange = new EventEmitter<number>();

  studentForm!: FormGroup;
  currentStep: number = 1;
  totalSteps: number = 3;

  // Step identifiers
  readonly STEP_PERSONAL = 1;
  readonly STEP_ACCOUNT = 2;
  readonly STEP_LOCATION = 3;

  constructor(private fb: FormBuilder) {
    console.log('🏗️ [FORM] Constructor called');
  }

  ngOnInit(): void {
    console.log('🚀 [FORM] ngOnInit called');
    console.log('🚀 [FORM] showTenantDropdown:', this.showTenantDropdown);
    console.log('🚀 [FORM] tenants:', this.tenants?.length || 0);
    this.initializeForm();
  }

  ngOnChanges(changes: SimpleChanges): void {
    console.log('🔄 [FORM] ngOnChanges triggered. Changes:', Object.keys(changes));
    
    if (changes['student'] && !changes['student'].firstChange) {
      this.populateForm();
    }
    if (changes['isViewMode']) {
      this.toggleFormState();
    }
    if (changes['tenants']) {
      console.log('🔄 [FORM] Tenants changed!');
      console.log('   - Previous value:', changes['tenants'].previousValue);
      console.log('   - Current value:', changes['tenants'].currentValue);
      console.log('   - Tenants length:', this.tenants?.length || 0);
      console.log('   - Tenants data:', this.tenants);
      console.log('   - Is array?', Array.isArray(this.tenants));
      console.log('   - First tenant:', this.tenants?.[0]);
    }
    if (changes['showTenantDropdown']) {
      console.log('🔄 [FORM] Show tenant dropdown changed:', this.showTenantDropdown);
      if (this.studentForm) {
        // Update validators when showTenantDropdown changes
        if (this.showTenantDropdown) {
          this.studentForm.get('tenant_id')?.setValidators([Validators.required]);
          console.log('✅ Tenant field set as REQUIRED for SUPER_ADMIN');
        } else {
          this.studentForm.get('tenant_id')?.clearValidators();
          console.log('ℹ️ Tenant field NOT required (non-SUPER_ADMIN)');
        }
        this.studentForm.get('tenant_id')?.updateValueAndValidity();
      }
    }
  }

  /**
   * Initialize the reactive form
   */
  initializeForm(): void {
    console.log('🔧 [FORM] Initializing form...');
    console.log('🔧 [FORM] showTenantDropdown at init:', this.showTenantDropdown);
    console.log('🔧 [FORM] tenants at init:', this.tenants?.length || 0);
    
    this.studentForm = this.fb.group({
      // Tenant selection (only for SUPER_ADMIN)
      tenant_id: [null],
      
      // Step 1: Personal Information
      first_name: [
        '', 
        [
          Validators.required,
          Validators.minLength(1),
          Validators.maxLength(100)
        ]
      ],
      last_name: [
        '', 
        [
          Validators.required,
          Validators.minLength(1),
          Validators.maxLength(100)
        ]
      ],
      middle_name: [
        '', 
        [
          Validators.maxLength(100)
        ]
      ],
      full_name: [''], // Auto-computed
      date_of_birth: [''], // Optional
      gender: [''], // Optional

      // Step 2: Account Setup
      username: [
        '', 
        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(50),
          Validators.pattern(/^[a-zA-Z0-9._-]+$/) // Match backend regex
        ]
      ],
      password: [
        '', 
        this.isEditMode ? [] : [
          Validators.required,
          Validators.minLength(8),
          Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/) // Match backend
        ]
      ],
      emailAddresses: this.fb.array([]),
      phoneNumbers: this.fb.array([]),

      // Step 3: Location Information
      country_id: [null, [Validators.required]],
      state_id: [null], // Optional - not all countries have states
      city_id: [null], // Optional - not all states have cities
      zip_code: [
        '', 
        [
          Validators.minLength(3),
          Validators.maxLength(20)
        ]
      ],
      address: [
        '', 
        [
          Validators.maxLength(500)
        ]
      ]
    });

    // Set tenant_id as required for SUPER_ADMIN
    if (this.showTenantDropdown) {
      this.studentForm.get('tenant_id')?.setValidators([Validators.required]);
      this.studentForm.get('tenant_id')?.updateValueAndValidity();
      console.log('✅ Tenant field set as REQUIRED for SUPER_ADMIN');
    } else {
      this.studentForm.get('tenant_id')?.clearValidators();
      this.studentForm.get('tenant_id')?.updateValueAndValidity();
      console.log('ℹ️ Tenant field NOT required (non-SUPER_ADMIN)');
    }

    // Add at least one email and phone by default
    this.addEmailAddress();
    this.addPhoneNumber();

    // Auto-update full_name
    this.studentForm.get('first_name')?.valueChanges.subscribe(() => this.updateFullName());
    this.studentForm.get('last_name')?.valueChanges.subscribe(() => this.updateFullName());
    this.studentForm.get('middle_name')?.valueChanges.subscribe(() => this.updateFullName());

    this.toggleFormState();
    this.populateForm();
  }

  /**
   * Update full_name based on first, middle, last names
   */
  updateFullName(): void {
    const first = this.studentForm.get('first_name')?.value || '';
    const middle = this.studentForm.get('middle_name')?.value || '';
    const last = this.studentForm.get('last_name')?.value || '';
    const fullName = [first, middle, last].filter(n => n.trim()).join(' ');
    this.studentForm.get('full_name')?.setValue(fullName, { emitEvent: false });
  }

  /**
   * Populate form with student data (edit/view mode)
   */
  populateForm(): void {
    if (this.student) {
      this.studentForm.patchValue({
        first_name: this.student.first_name || '',
        last_name: this.student.last_name || '',
        middle_name: this.student.middle_name || '',
        full_name: this.student.full_name || '',
        date_of_birth: this.student.date_of_birth ? this.formatDate(this.student.date_of_birth) : '',
        gender: this.student.gender || '',
        username: this.student.username || '',
        country_id: this.student.country_id || null,
        state_id: this.student.state_id || null,
        city_id: this.student.city_id || null,
        zip_code: this.student.zip_code || '',
        address: this.student.address || ''
      });

      // Clear default entries
      this.clearEmailAddresses();
      this.clearPhoneNumbers();

      // Populate emails
      if (this.student.emails && this.student.emails.length > 0) {
        this.student.emails.forEach((email: any) => {
          this.addEmailAddress(email);
        });
      } else {
        this.addEmailAddress(); // Add empty one
      }

      // Populate phones
      if (this.student.phones && this.student.phones.length > 0) {
        this.student.phones.forEach((phone: any) => {
          this.addPhoneNumber(phone);
        });
      } else {
        this.addPhoneNumber(); // Add empty one
      }

      // If edit mode and no password required, mark as optional
      if (this.isEditMode) {
        this.studentForm.get('password')?.clearValidators();
        this.studentForm.get('password')?.updateValueAndValidity();
      }
    }
  }

  /**
   * Format date for input[type="date"]
   */
  formatDate(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  }

  /**
   * Toggle form enabled/disabled state
   */
  toggleFormState(): void {
    // Check if form exists before toggling (needed because ngOnChanges fires before ngOnInit)
    if (!this.studentForm) {
      return;
    }
    
    if (this.isViewMode) {
      this.studentForm.disable();
    } else {
      this.studentForm.enable();
    }
  }

  // ==================== Email Address Management ====================

  get emailAddresses(): FormArray {
    return this.studentForm.get('emailAddresses') as FormArray;
  }

  addEmailAddress(email?: any): void {
    const emailGroup = this.fb.group({
      email_address: [
        email?.email_address || '', 
        [
          Validators.required,
          Validators.email,
          Validators.maxLength(255) // Match backend
        ]
      ],
      is_primary: [email?.is_primary || false]
    });
    
    // Add to top (unshift behavior)
    this.emailAddresses.insert(0, emailGroup);

    // Ensure only one primary
    if (email?.is_primary) {
      this.ensureOnlyOnePrimaryEmail(0);
    }
  }

  removeEmailAddress(index: number): void {
    if (this.emailAddresses.length > 1) {
      this.emailAddresses.removeAt(index);
    }
  }

  clearEmailAddresses(): void {
    while (this.emailAddresses.length) {
      this.emailAddresses.removeAt(0);
    }
  }

  togglePrimaryEmail(index: number): void {
    this.ensureOnlyOnePrimaryEmail(index);
  }

  ensureOnlyOnePrimaryEmail(primaryIndex: number): void {
    this.emailAddresses.controls.forEach((control, i) => {
      if (i !== primaryIndex) {
        control.get('is_primary')?.setValue(false, { emitEvent: false });
      } else {
        control.get('is_primary')?.setValue(true, { emitEvent: false });
      }
    });
  }

  // ==================== Phone Number Management ====================

  get phoneNumbers(): FormArray {
    return this.studentForm.get('phoneNumbers') as FormArray;
  }

  addPhoneNumber(phone?: any): void {
    const phoneGroup = this.fb.group({
      dial_code: [
        phone?.dial_code || '+1', 
        [
          Validators.required,
          Validators.minLength(1),
          Validators.maxLength(20),
          Validators.pattern(/^[+0-9]*$/) // Match backend: digits and + only
        ]
      ],
      phone_number: [
        phone?.phone_number || '', 
        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(20),
          Validators.pattern(/^[0-9\s\-()]*$/) // Match backend: digits, spaces, -, ()
        ]
      ],
      iso_country_code: [
        phone?.iso_country_code || 'US',
        [
          Validators.minLength(2),
          Validators.maxLength(2),
          Validators.pattern(/^[A-Z]{2}$/) // Uppercase 2 letters
        ]
      ],
      is_primary: [phone?.is_primary || false]
    });

    // Add to top (unshift behavior)
    this.phoneNumbers.insert(0, phoneGroup);

    // Ensure only one primary
    if (phone?.is_primary) {
      this.ensureOnlyOnePrimaryPhone(0);
    }
  }

  removePhoneNumber(index: number): void {
    if (this.phoneNumbers.length > 1) {
      this.phoneNumbers.removeAt(index);
    }
  }

  clearPhoneNumbers(): void {
    while (this.phoneNumbers.length) {
      this.phoneNumbers.removeAt(0);
    }
  }

  togglePrimaryPhone(index: number): void {
    this.ensureOnlyOnePrimaryPhone(index);
  }

  ensureOnlyOnePrimaryPhone(primaryIndex: number): void {
    this.phoneNumbers.controls.forEach((control, i) => {
      if (i !== primaryIndex) {
        control.get('is_primary')?.setValue(false, { emitEvent: false });
      } else {
        control.get('is_primary')?.setValue(true, { emitEvent: false });
      }
    });
  }

  // ==================== Step Navigation ====================

  goToNextStep(): void {
    if (this.currentStep < this.totalSteps) {
      if (this.isCurrentStepValid()) {
        this.currentStep++;
      }
    }
  }

  goToPreviousStep(): void {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }

  goToStep(step: number): void {
    if (step >= 1 && step <= this.totalSteps) {
      this.currentStep = step;
    }
  }

  isCurrentStepValid(): boolean {
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

  isPersonalInfoValid(): boolean {
    const fields = ['first_name', 'last_name'];
    const basicFieldsValid = fields.every(field => this.studentForm.get(field)?.valid);
    
    // If tenant dropdown is shown (SUPER_ADMIN), tenant_id must be valid
    if (this.showTenantDropdown) {
      const tenantIdValid = this.studentForm.get('tenant_id')?.valid ?? false;
      return basicFieldsValid && tenantIdValid;
    }
    
    return basicFieldsValid;
  }

  isAccountSetupValid(): boolean {
    const usernameValid = this.studentForm.get('username')?.valid ?? false;
    const passwordValid = this.isEditMode || (this.studentForm.get('password')?.valid ?? false);
    const emailsValid = this.emailAddresses.length > 0 && this.emailAddresses.controls.every(c => c.valid);
    const phonesValid = this.phoneNumbers.length > 0 && this.phoneNumbers.controls.every(c => c.valid);
    
    // If tenant dropdown is shown (SUPER_ADMIN), tenant_id must be valid
    // Note: Validation already handled in Step 1, but we check here too for consistency
    let tenantIdValid = true;
    if (this.showTenantDropdown) {
      tenantIdValid = this.studentForm.get('tenant_id')?.valid ?? false;
    }
    
    return usernameValid && passwordValid && emailsValid && phonesValid && tenantIdValid;
  }

  isLocationInfoValid(): boolean {
    const fields = ['country_id', 'state_id', 'city_id'];
    return fields.every(field => this.studentForm.get(field)?.valid);
  }

  // ==================== Form Submission ====================

  onSubmit(): void {
    if (this.studentForm.valid) {
      const formData = this.studentForm.getRawValue();
      
      // Convert tenant_id to number if present (dropdown value is string)
      if (formData.tenant_id) {
        formData.tenant_id = parseInt(formData.tenant_id, 10);
      }
      
      // Convert location IDs to numbers (dropdown values are strings)
      if (formData.country_id) {
        formData.country_id = parseInt(formData.country_id, 10);
      }
      if (formData.state_id) {
        formData.state_id = parseInt(formData.state_id, 10);
      }
      if (formData.city_id) {
        formData.city_id = parseInt(formData.city_id, 10);
      }
      
      // Remove tenant_id from form data if not SUPER_ADMIN (it will be set from header)
      if (!this.showTenantDropdown) {
        delete formData.tenant_id;
      }
      
      // Remove state_id if not selected (for countries without states)
      if (!formData.state_id) {
        delete formData.state_id;
      }
      
      // Remove city_id if not selected (for states without cities or countries without states)
      if (!formData.city_id) {
        delete formData.city_id;
      }
      
      this.formSubmit.emit(formData);
    } else {
      this.markFormGroupTouched(this.studentForm);
    }
  }

  /**
   * Public method to trigger form submission from parent component
   */
  public submitForm(): void {
    this.onSubmit();
  }

  /**
   * Mark all fields in the form as touched to show validation errors
   */
  public markAllFieldsAsTouched(): void {
    this.markFormGroupTouched(this.studentForm);
  }

  /**
   * Mark current step fields as touched
   */
  public markCurrentStepAsTouched(): void {
    if (this.currentStep === this.STEP_PERSONAL) {
      // Personal Info step
      ['first_name', 'last_name', 'tenant_id'].forEach(field => {
        this.studentForm.get(field)?.markAsTouched();
      });
    } else if (this.currentStep === this.STEP_ACCOUNT) {
      // Account Setup step
      ['username', 'password', 'date_of_birth', 'gender'].forEach(field => {
        this.studentForm.get(field)?.markAsTouched();
      });
      const emailsArray = this.studentForm.get('emails') as FormArray;
      const phonesArray = this.studentForm.get('phones') as FormArray;
      this.markFormGroupTouched(emailsArray);
      this.markFormGroupTouched(phonesArray);
    } else if (this.currentStep === this.STEP_LOCATION) {
      // Location Info step
      ['country_id', 'state_id', 'city_id', 'address_line_1', 'zip_code'].forEach(field => {
        this.studentForm.get(field)?.markAsTouched();
      });
    }
  }

  onCancel(): void {
    this.formCancel.emit();
  }

  markFormGroupTouched(formGroup: FormGroup | FormArray): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();

      if (control instanceof FormGroup || control instanceof FormArray) {
        this.markFormGroupTouched(control);
      }
    });
  }

  // ==================== Location Handlers ====================

  onCountryChange(event: Event): void {
    const countryId = parseInt((event.target as HTMLSelectElement).value, 10);
    this.studentForm.patchValue({
      state_id: null,
      city_id: null
    });
    this.countryChange.emit(countryId);
  }

  onStateChange(event: Event): void {
    const stateId = parseInt((event.target as HTMLSelectElement).value, 10);
    this.studentForm.patchValue({
      city_id: null
    });
    this.stateChange.emit(stateId);
  }

  // ==================== Utility ====================

  getErrorMessage(controlName: string): string {
    const control = this.studentForm.get(controlName);
    if (!control || !control.errors) return '';

    // Required validation
    if (control.hasError('required')) {
      // Special message for tenant_id
      if (controlName === 'tenant_id') {
        return 'Please select a tenant';
      }
      return `${this.getFieldLabel(controlName)} is required`;
    }

    // Email validation
    if (control.hasError('email')) {
      return 'Please enter a valid email address';
    }

    // Min length validation
    if (control.hasError('minlength')) {
      const minLength = control.getError('minlength').requiredLength;
      return `Minimum ${minLength} characters required`;
    }

    // Max length validation
    if (control.hasError('maxlength')) {
      const maxLength = control.getError('maxlength').requiredLength;
      return `Maximum ${maxLength} characters allowed`;
    }

    // Pattern validation with specific messages
    if (control.hasError('pattern')) {
      switch (controlName) {
        case 'username':
          return 'Username can only contain letters, numbers, dots, underscores, and hyphens';
        case 'password':
          return 'Password must contain uppercase, lowercase, number, and special character';
        default:
          return 'Invalid format';
      }
    }

    return '';
  }

  getEmailErrorMessage(index: number): string {
    const emailControl = this.emailAddresses.at(index)?.get('email_address');
    if (!emailControl || !emailControl.errors) return '';

    if (emailControl.hasError('required')) {
      return 'Email address is required';
    }
    if (emailControl.hasError('email')) {
      return 'Please enter a valid email address';
    }
    if (emailControl.hasError('maxlength')) {
      return 'Email cannot exceed 255 characters';
    }
    return '';
  }

  getPhoneErrorMessage(index: number, field: string): string {
    const phoneControl = this.phoneNumbers.at(index)?.get(field);
    if (!phoneControl || !phoneControl.errors) return '';

    if (phoneControl.hasError('required')) {
      return `${this.getFieldLabel(field)} is required`;
    }
    if (phoneControl.hasError('pattern')) {
      if (field === 'dial_code') {
        return 'Dial code can only contain digits and + symbol';
      }
      if (field === 'phone_number') {
        return 'Phone number can only contain digits, spaces, hyphens, and parentheses';
      }
      if (field === 'iso_country_code') {
        return 'Country code must be 2 uppercase letters';
      }
    }
    if (phoneControl.hasError('minlength')) {
      return `Minimum ${phoneControl.getError('minlength').requiredLength} characters required`;
    }
    if (phoneControl.hasError('maxlength')) {
      return `Maximum ${phoneControl.getError('maxlength').requiredLength} characters allowed`;
    }
    return '';
  }

  getFieldLabel(controlName: string): string {
    const labels: { [key: string]: string } = {
      'tenant_id': 'Tenant',
      'first_name': 'First Name',
      'last_name': 'Last Name',
      'username': 'Username',
      'password': 'Password',
      'country_id': 'Country',
      'state_id': 'State/Province',
      'city_id': 'City'
    };
    return labels[controlName] || controlName;
  }

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
}
