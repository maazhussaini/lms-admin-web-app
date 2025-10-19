import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface TenantPhoneInput {
  dialCode: string;
  phoneNumber: string;
  isoCountryCode: string;
  contactType: string;
  isPrimary: boolean;
}

export interface TenantEmailInput {
  emailAddress: string;
  contactType: string;
  isPrimary: boolean;
}

export interface BasicTenantFormData {
  name: string;
  domain?: string;
  status: string;
  logoLightFile?: File | null;
  logoDarkFile?: File | null;
  faviconFile?: File | null;
  logoLightPreview?: string;
  logoDarkPreview?: string;
  faviconPreview?: string;
  phoneNumbers?: TenantPhoneInput[];
  emailAddresses?: TenantEmailInput[];
}

@Component({
  selector: 'app-basic-tenant-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './basic-tenant-form.html',
  styleUrl: './basic-tenant-form.scss'
})
export class BasicTenantForm implements OnInit {
  @Input() formData: BasicTenantFormData = {
    name: '',
    domain: '',
    status: 'ACTIVE',
    phoneNumbers: [],
    emailAddresses: []
  };

  @Input() isViewMode: boolean = false;
  @Input() isEditMode: boolean = false;

  @Output() formDataChange = new EventEmitter<BasicTenantFormData>();
  @Output() validityChange = new EventEmitter<boolean>();

  statusOptions = [
    { label: 'Active', value: 'ACTIVE' },
    { label: 'Suspended', value: 'SUSPENDED' },
    { label: 'Trial', value: 'TRIAL' },
    { label: 'Expired', value: 'EXPIRED' },
    { label: 'Cancelled', value: 'CANCELLED' }
  ];

  contactTypeOptions = [
    { label: 'Primary', value: 'PRIMARY' },
    { label: 'Secondary', value: 'SECONDARY' },
    { label: 'Emergency', value: 'EMERGENCY' },
    { label: 'Billing', value: 'BILLING' }
  ];

  ngOnInit() {
    // Initialize arrays if not present
    if (!this.formData.phoneNumbers) {
      this.formData.phoneNumbers = [];
    }
    if (!this.formData.emailAddresses) {
      this.formData.emailAddresses = [];
    }
  }

  onFormChange() {
    this.formDataChange.emit(this.formData);
    this.validityChange.emit(this.isFormValid());
  }

  isFormValid(): boolean {
    if (this.isViewMode) return true;
    return !!(this.formData.name && this.formData.status);
  }

  // File upload handlers
  onLogoLightChange(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.formData.logoLightFile = input.files[0];
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        this.formData.logoLightPreview = e.target?.result as string;
        this.onFormChange();
      };
      reader.readAsDataURL(input.files[0]);
    }
  }

  onLogoDarkChange(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.formData.logoDarkFile = input.files[0];
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        this.formData.logoDarkPreview = e.target?.result as string;
        this.onFormChange();
      };
      reader.readAsDataURL(input.files[0]);
    }
  }

  onFaviconChange(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.formData.faviconFile = input.files[0];
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        this.formData.faviconPreview = e.target?.result as string;
        this.onFormChange();
      };
      reader.readAsDataURL(input.files[0]);
    }
  }

  removeLogoLight() {
    this.formData.logoLightFile = null;
    this.formData.logoLightPreview = undefined;
    this.onFormChange();
  }

  removeLogoDark() {
    this.formData.logoDarkFile = null;
    this.formData.logoDarkPreview = undefined;
    this.onFormChange();
  }

  removeFavicon() {
    this.formData.faviconFile = null;
    this.formData.faviconPreview = undefined;
    this.onFormChange();
  }

  // Phone number management
  addPhoneNumber() {
    if (!this.formData.phoneNumbers) {
      this.formData.phoneNumbers = [];
    }
    // Add at the beginning (top) instead of end
    this.formData.phoneNumbers.unshift({
      dialCode: '+92',
      phoneNumber: '',
      isoCountryCode: 'PK',
      contactType: 'PRIMARY',
      isPrimary: this.formData.phoneNumbers.length === 0
    });
    this.onFormChange();
  }

  removePhoneNumber(index: number) {
    console.log('Removing phone number at index:', index);
    if (this.formData.phoneNumbers && this.formData.phoneNumbers.length > index) {
      this.formData.phoneNumbers.splice(index, 1);
      // Set first as primary if removed was primary
      if (this.formData.phoneNumbers.length > 0 && 
          !this.formData.phoneNumbers.some(p => p.isPrimary)) {
        this.formData.phoneNumbers[0].isPrimary = true;
      }
      console.log('Phone numbers after removal:', this.formData.phoneNumbers.length);
      this.onFormChange();
    }
  }

  togglePhonePrimary(index: number) {
    if (this.formData.phoneNumbers) {
      // Unset all others
      this.formData.phoneNumbers.forEach((p, i) => {
        p.isPrimary = i === index;
      });
      this.onFormChange();
    }
  }

  // Email address management
  addEmailAddress() {
    if (!this.formData.emailAddresses) {
      this.formData.emailAddresses = [];
    }
    // Add at the beginning (top) instead of end
    this.formData.emailAddresses.unshift({
      emailAddress: '',
      contactType: 'PRIMARY',
      isPrimary: this.formData.emailAddresses.length === 0
    });
    this.onFormChange();
  }

  removeEmailAddress(index: number) {
    console.log('Removing email address at index:', index);
    if (this.formData.emailAddresses && this.formData.emailAddresses.length > index) {
      this.formData.emailAddresses.splice(index, 1);
      // Set first as primary if removed was primary
      if (this.formData.emailAddresses.length > 0 && 
          !this.formData.emailAddresses.some(e => e.isPrimary)) {
        this.formData.emailAddresses[0].isPrimary = true;
      }
      console.log('Email addresses after removal:', this.formData.emailAddresses.length);
      this.onFormChange();
    }
  }

  toggleEmailPrimary(index: number) {
    if (this.formData.emailAddresses) {
      // Unset all others
      this.formData.emailAddresses.forEach((e, i) => {
        e.isPrimary = i === index;
      });
      this.onFormChange();
    }
  }

  /**
   * Mark all fields as touched to show validation errors
   */
  markAllFieldsAsTouched(): void {
    // In template-driven form, we'll just trigger validation by marking inputs
    // The validation will show when fields are invalid
  }

  trackByIndex(index: number): number {
    return index;
  }
}
