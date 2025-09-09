import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface TenantFormData {
  name: string;
  email: string;
  phone: string;
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
  imports: [CommonModule, FormsModule],
  templateUrl: './tenant-form.html',
  styleUrl: './tenant-form.scss'
})
export class TenantForm {
  @Input() formData: TenantFormData = {
    name: '',
    email: '',
    phone: '',
    status: '',
    lightModePrimaryColor: '#9AE0F7',
    lightModeSecondaryColor: '#505050',
    darkModePrimaryColor: '#9AE0F7',
    darkModeSecondaryColor: '#505050'
  };

  @Output() formDataChange = new EventEmitter<TenantFormData>();
  @Output() validityChange = new EventEmitter<boolean>();

  statusOptions = [
    { label: 'Active', value: 'active' },
    { label: 'Inactive', value: 'inactive' },
    { label: 'Pending', value: 'pending' },
    { label: 'Suspended', value: 'suspended' }
  ];

  onFormChange() {
    this.formDataChange.emit(this.formData);
    this.validityChange.emit(this.isFormValid());
  }

  isFormValid(): boolean {
    return !!(this.formData.name && this.formData.email && this.formData.phone && this.formData.status);
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
