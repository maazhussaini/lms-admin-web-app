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

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.initializeForm();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['student'] && !changes['student'].firstChange) {
      this.populateForm();
    }
    if (changes['isViewMode']) {
      this.toggleFormState();
    }
  }

  /**
   * Initialize the reactive form
   */
  initializeForm(): void {
    this.studentForm = this.fb.group({
      // Step 1: Personal Information
      first_name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      last_name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      middle_name: [''],
      full_name: [''], // Auto-computed
      date_of_birth: [''],
      gender: [''],

      // Step 2: Account Setup
      username: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]],
      password: ['', this.isEditMode ? [] : [Validators.required, Validators.minLength(8)]],
      emailAddresses: this.fb.array([]),
      phoneNumbers: this.fb.array([]),

      // Step 3: Location Information
      country_id: [null, Validators.required],
      state_id: [null, Validators.required],
      city_id: [null, Validators.required],
      zip_code: [''],
      address: ['']
    });

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
      email_address: [email?.email_address || '', [Validators.required, Validators.email]],
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
      dial_code: [phone?.dial_code || '+1', Validators.required],
      phone_number: [phone?.phone_number || '', [Validators.required, Validators.pattern(/^[0-9]{7,15}$/)]],
      iso_country_code: [phone?.iso_country_code || 'US'],
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
    return fields.every(field => this.studentForm.get(field)?.valid);
  }

  isAccountSetupValid(): boolean {
    const usernameValid = this.studentForm.get('username')?.valid ?? false;
    const passwordValid = this.isEditMode || (this.studentForm.get('password')?.valid ?? false);
    const emailsValid = this.emailAddresses.length > 0 && this.emailAddresses.controls.every(c => c.valid);
    const phonesValid = this.phoneNumbers.length > 0 && this.phoneNumbers.controls.every(c => c.valid);
    return usernameValid && passwordValid && emailsValid && phonesValid;
  }

  isLocationInfoValid(): boolean {
    const fields = ['country_id', 'state_id', 'city_id'];
    return fields.every(field => this.studentForm.get(field)?.valid);
  }

  // ==================== Form Submission ====================

  onSubmit(): void {
    if (this.studentForm.valid) {
      const formData = this.studentForm.getRawValue();
      this.formSubmit.emit(formData);
    } else {
      this.markFormGroupTouched(this.studentForm);
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
    if (control?.hasError('required')) {
      return `${this.getFieldLabel(controlName)} is required`;
    }
    if (control?.hasError('email')) {
      return 'Invalid email format';
    }
    if (control?.hasError('minlength')) {
      return `Minimum length is ${control.getError('minlength').requiredLength}`;
    }
    if (control?.hasError('pattern')) {
      return 'Invalid format';
    }
    return '';
  }

  getFieldLabel(controlName: string): string {
    const labels: { [key: string]: string } = {
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
