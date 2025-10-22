import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PhoneNumber, PhoneNumberOutput, PhoneNumberInput } from '../../widgets/phone-number/phone-number';
import { CountryISO } from 'ngx-intl-tel-input-gg';

export interface TenantFormData {
  name: string;
  email: string;
  phone: string;
  phoneDialCode?: string;
  phoneCountryCode?: string;
  phoneNumber?: string;
  status: string;
  lightModeLogo?: File;
  lightModePrimaryColor: string;
  lightModeSecondaryColor: string;
  darkModeLogo?: File;
  darkModePrimaryColor: string;
  darkModeSecondaryColor: string;
}

@Component({
  selector: 'app-tenant-form',
  standalone: true,
  imports: [CommonModule, FormsModule, PhoneNumber],
  templateUrl: './tenant-form.html',
  styleUrl: './tenant-form.scss'
})
export class TenantForm implements OnInit {
  @Input() formData: TenantFormData = {
    name: '',
    email: '',
    phone: '',
    phoneDialCode: '+92',
    phoneCountryCode: 'PK',
    phoneNumber: '',
    status: '',
    lightModePrimaryColor: '#9AE0F7',
    lightModeSecondaryColor: '#505050',
    darkModePrimaryColor: '#9AE0F7',
    darkModeSecondaryColor: '#505050'
  };

  @Output() formDataChange = new EventEmitter<TenantFormData>();
  @Output() validityChange = new EventEmitter<boolean>();

  // Expose CountryISO enum to template
  CountryISO = CountryISO;

  // Phone number object for two-way binding with widget
  phoneNumberData: PhoneNumberInput | null = null;

  statusOptions = [
    { label: 'Active', value: 'active' },
    { label: 'Inactive', value: 'inactive' },
    { label: 'Pending', value: 'pending' },
    { label: 'Suspended', value: 'suspended' }
  ];

  ngOnInit(): void {
    // Initialize phone number data from formData if available
    if (this.formData.phoneNumber || this.formData.phone) {
      this.phoneNumberData = {
        dialCode: this.formData.phoneDialCode || '+92',
        countryCode: this.formData.phoneCountryCode || 'PK',
        phoneNumber: this.formData.phoneNumber || this.formData.phone.replace(/^\+\d+/, '') || ''
      };
    }
  }

  onFormChange() {
    this.formDataChange.emit(this.formData);
    this.validityChange.emit(this.isFormValid());
  }

  onPhoneChange(phoneData: PhoneNumberOutput) {
    console.log('Phone changed:', phoneData);
    
    // Update formData with phone details
    this.formData.phoneDialCode = phoneData.dialCode;
    this.formData.phoneCountryCode = phoneData.countryCode;
    this.formData.phoneNumber = phoneData.phoneNumber;
    
    // Combine for backward compatibility (full phone with dial code)
    this.formData.phone = phoneData.dialCode + phoneData.phoneNumber;
    
    // Update the two-way bound object
    this.phoneNumberData = {
      dialCode: phoneData.dialCode,
      countryCode: phoneData.countryCode,
      phoneNumber: phoneData.phoneNumber
    };
    
    // Store validation state
    (this.formData as any).phoneIsValid = phoneData.isValid;
    
    this.onFormChange();
  }

  isFormValid(): boolean {
    const hasBasicInfo = !!(this.formData.name && this.formData.email && this.formData.status);
    const hasValidPhone = !!(this.formData.phone && (this.formData as any).phoneIsValid);
    return hasBasicInfo && hasValidPhone;
  }

  onLightLogoUpload(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.formData.lightModeLogo = file;
      this.onFormChange();
    }
  }

  onDarkLogoUpload(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.formData.darkModeLogo = file;
      this.onFormChange();
    }
  }

  triggerLightLogoUpload() {
    const input = document.getElementById('lightLogoInput') as HTMLInputElement;
    input?.click();
  }

  triggerDarkLogoUpload() {
    const input = document.getElementById('darkLogoInput') as HTMLInputElement;
    input?.click();
  }
}
