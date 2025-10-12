import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

/**
 * Teacher Form Component - Handles create, edit and view modes for teacher data
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
    if (this.teacherData && this.isEditMode) {
      this.loadTeacherData();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['teacherData'] && this.teacherData && this.isEditMode) {
      this.loadTeacherData();
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
    const isValid = 
      !!this.formData.full_name &&
      !!this.formData.first_name &&
      !!this.formData.last_name &&
      !!this.formData.username &&
      (this.isEditMode || !!this.formData.password) &&
      !!this.formData.email_address;

    this.validityChange.emit(isValid);
  }

  onSave(): void {
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

  onCancel(): void {
    this.cancel.emit();
  }
}
