import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface BasicTenantFormData {
  name: string;
  email: string;
  phone: string;
  status: string;
}

@Component({
  selector: 'app-basic-tenant-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './basic-tenant-form.html',
  styleUrl: './basic-tenant-form.scss'
})
export class BasicTenantForm {
  @Input() formData: BasicTenantFormData = {
    name: '',
    email: '',
    phone: '',
    status: ''
  };

  @Output() formDataChange = new EventEmitter<BasicTenantFormData>();
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
}
