# Phone Number Widget - Production Usage Guide

## Quick Start (Real Form Example)

Yeh guide dikhata hai ke **actual production forms** mein phone number widget kaise use karni hai.

---

## Example 1: Simple Form (Most Common)

```typescript
// institute-form.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PhoneNumber, PhoneNumberOutput } from '@app/components/widgets/phone-number/phone-number';

@Component({
  selector: 'app-institute-form',
  standalone: true,
  imports: [CommonModule, FormsModule, PhoneNumber],
  template: `
    <form (ngSubmit)="onSubmit()">
      <div class="form-group">
        <label>Institute Name <span class="required">*</span></label>
        <input type="text" [(ngModel)]="instituteName" name="instituteName">
      </div>

      <!-- Phone Number Widget -->
      <div class="form-group">
        <app-phone-number
          label="Contact Number"
          [required]="true"
          [(value)]="phoneNumber"
          (valueChange)="onPhoneChange($event)"
        ></app-phone-number>
      </div>

      <button type="submit" [disabled]="!isFormValid()">
        Save
      </button>
    </form>
  `
})
export class InstituteFormComponent {
  instituteName: string = '';
  phoneNumber: PhoneNumberOutput | null = null;

  onPhoneChange(phone: PhoneNumberOutput): void {
    console.log('Phone updated:', phone);
    // Phone automatically updates due to two-way binding
  }

  isFormValid(): boolean {
    return this.instituteName.trim() !== '' && 
           this.phoneNumber?.isValid === true;
  }

  onSubmit(): void {
    if (this.isFormValid()) {
      const formData = {
        instituteName: this.instituteName,
        phone: this.phoneNumber
      };
      console.log('Submitting:', formData);
      // API call here
    }
  }
}
```

---

## Example 2: With Existing Data (Edit Mode)

```typescript
// edit-institute.component.ts
import { Component, OnInit } from '@angular/core';
import { PhoneNumber, PhoneNumberInput, PhoneNumberOutput } from '@app/components/widgets/phone-number/phone-number';

@Component({
  selector: 'app-edit-institute',
  standalone: true,
  imports: [PhoneNumber],
  template: `
    <app-phone-number
      label="Contact Number"
      [required]="true"
      [(value)]="phoneNumber"
    ></app-phone-number>
  `
})
export class EditInstituteComponent implements OnInit {
  phoneNumber: PhoneNumberInput | null = null;

  ngOnInit(): void {
    // Load existing data from API
    this.loadInstituteData();
  }

  loadInstituteData(): void {
    // Simulate API response
    const apiResponse = {
      instituteName: 'ABC Institute',
      contactPhone: {
        dialCode: '92',
        countryCode: 'pk',
        phoneNumber: '3001234567'
      }
    };

    // Set the phone number
    this.phoneNumber = apiResponse.contactPhone;
  }

  saveChanges(): void {
    if (this.phoneNumber) {
      console.log('Saving:', this.phoneNumber);
      // API call to update
    }
  }
}
```

---

## Example 3: Multiple Contact Numbers (Loop)

```typescript
// contacts-form.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PhoneNumber, PhoneNumberOutput } from '@app/components/widgets/phone-number/phone-number';

interface ContactPerson {
  name: string;
  designation: string;
  phone: PhoneNumberOutput | null;
  isPrimary: boolean;
}

@Component({
  selector: 'app-contacts-form',
  standalone: true,
  imports: [CommonModule, PhoneNumber],
  template: `
    <div class="contacts-section">
      <h3>Contact Persons</h3>

      <div *ngFor="let contact of contacts; let i = index" class="contact-card">
        <div class="row">
          <div class="col-md-6">
            <label>Name</label>
            <input type="text" [(ngModel)]="contact.name">
          </div>
          <div class="col-md-6">
            <label>Designation</label>
            <input type="text" [(ngModel)]="contact.designation">
          </div>
        </div>

        <app-phone-number
          [label]="'Phone Number ' + (i + 1)"
          [inputId]="'contact-phone-' + i"
          [required]="contact.isPrimary"
          [(value)]="contact.phone"
        ></app-phone-number>

        <button *ngIf="!contact.isPrimary" (click)="removeContact(i)">
          Remove
        </button>
      </div>

      <button (click)="addContact()">+ Add Contact</button>
    </div>
  `
})
export class ContactsFormComponent {
  contacts: ContactPerson[] = [
    {
      name: '',
      designation: 'Primary Contact',
      phone: null,
      isPrimary: true
    }
  ];

  addContact(): void {
    this.contacts.push({
      name: '',
      designation: '',
      phone: null,
      isPrimary: false
    });
  }

  removeContact(index: number): void {
    if (!this.contacts[index].isPrimary) {
      this.contacts.splice(index, 1);
    }
  }

  getAllValidContacts(): ContactPerson[] {
    return this.contacts.filter(c => c.phone?.isValid === true);
  }
}
```

---

## Example 4: Off-Canvas Form (Like Institute Management)

```typescript
// institute-management.component.ts
import { Component } from '@angular/core';
import { PhoneNumber, PhoneNumberOutput } from '@app/components/widgets/phone-number/phone-number';
import { OffCanvasWrapper } from '@app/components/widgets/off-canvas-wrapper/off-canvas-wrapper';

@Component({
  selector: 'app-institute-management',
  standalone: true,
  imports: [PhoneNumber, OffCanvasWrapper],
  templateUrl: './institute-management.html'
})
export class InstituteManagementComponent {
  // Form state
  isOffCanvasVisible = false;
  isEditMode = false;
  isViewMode = false;

  // Form data
  instituteName: string = '';
  institutePhone: PhoneNumberOutput | null = null;
  selectedInstituteId: number | null = null;

  openCreateForm(): void {
    this.isOffCanvasVisible = true;
    this.isEditMode = false;
    this.isViewMode = false;
    this.resetForm();
  }

  openEditForm(instituteId: number): void {
    this.isOffCanvasVisible = true;
    this.isEditMode = true;
    this.isViewMode = false;
    this.selectedInstituteId = instituteId;
    this.loadInstituteData(instituteId);
  }

  openViewForm(instituteId: number): void {
    this.isOffCanvasVisible = true;
    this.isViewMode = true;
    this.isEditMode = false;
    this.selectedInstituteId = instituteId;
    this.loadInstituteData(instituteId);
  }

  loadInstituteData(id: number): void {
    // Simulate API call
    const institute = {
      institute_id: id,
      institute_name: 'ABC Institute',
      contact_phone: {
        dialCode: '92',
        countryCode: 'pk',
        phoneNumber: '3001234567'
      }
    };

    this.instituteName = institute.institute_name;
    this.institutePhone = institute.contact_phone;
  }

  resetForm(): void {
    this.instituteName = '';
    this.institutePhone = null;
    this.selectedInstituteId = null;
  }

  onPhoneChange(phone: PhoneNumberOutput): void {
    console.log('Phone changed:', phone);
    this.institutePhone = phone;
  }

  saveInstitute(): void {
    if (!this.isFormValid()) {
      alert('Please fill all required fields with valid data');
      return;
    }

    const payload = {
      institute_name: this.instituteName,
      contact_phone: this.institutePhone
    };

    if (this.isEditMode && this.selectedInstituteId) {
      // Update API call
      console.log('Updating institute:', payload);
    } else {
      // Create API call
      console.log('Creating institute:', payload);
    }

    this.closeOffCanvas();
  }

  isFormValid(): boolean {
    return this.instituteName.trim() !== '' && 
           this.institutePhone?.isValid === true;
  }

  closeOffCanvas(): void {
    this.isOffCanvasVisible = false;
    this.resetForm();
  }
}
```

```html
<!-- institute-management.html -->
<div class="institute-dashboard">
  
  <!-- Your existing list/table here -->
  
  <!-- Off-Canvas Form -->
  <app-off-canvas-wrapper
    [(visible)]="isOffCanvasVisible"
    [title]="isViewMode ? 'View Institute' : (isEditMode ? 'Edit Institute' : 'Add New Institute')"
    (onClose)="closeOffCanvas()">
    
    <div class="institute-form">
      <!-- Institute Name -->
      <div class="form-group">
        <label>Institute Name <span class="required">*</span></label>
        <input 
          type="text" 
          [(ngModel)]="instituteName"
          [disabled]="isViewMode">
      </div>

      <!-- Phone Number Widget -->
      <div class="form-group">
        <app-phone-number
          label="Contact Number"
          [required]="true"
          [disabled]="isViewMode"
          [(value)]="institutePhone"
          (valueChange)="onPhoneChange($event)"
        ></app-phone-number>
      </div>

      <!-- Action Buttons -->
      <div class="form-actions" *ngIf="!isViewMode">
        <button type="button" (click)="closeOffCanvas()">Cancel</button>
        <button type="button" (click)="saveInstitute()" [disabled]="!isFormValid()">
          {{ isEditMode ? 'Update' : 'Create' }}
        </button>
      </div>
    </div>
  </app-off-canvas-wrapper>
</div>
```

---

## Import Statement (Important!)

TypeScript file mein yeh imports add karein:

```typescript
import { PhoneNumber, PhoneNumberOutput, PhoneNumberInput } from '@app/components/widgets/phone-number/phone-number';

// OR relative path
import { PhoneNumber, PhoneNumberOutput } from '../../../../components/widgets/phone-number/phone-number';
```

---

## Common Data Flow

### 1. Create Mode (New Record)
```typescript
phoneNumber: PhoneNumberOutput | null = null;

// User types phone number
// Widget emits: { dialCode: '92', countryCode: 'pk', phoneNumber: '3001234567', isValid: true }

// On submit
if (phoneNumber?.isValid) {
  api.createInstitute({
    name: 'ABC',
    phone: phoneNumber
  });
}
```

### 2. Edit Mode (Existing Record)
```typescript
// Load from API
loadData() {
  api.getInstitute(id).subscribe(data => {
    this.phoneNumber = {
      dialCode: data.phone_dial_code,
      countryCode: data.phone_country_code,
      phoneNumber: data.phone_number
    };
  });
}

// Update
updateData() {
  api.updateInstitute(id, {
    phone: this.phoneNumber
  });
}
```

### 3. View Mode (Read-Only)
```html
<app-phone-number
  [disabled]="true"
  [(value)]="phoneNumber"
></app-phone-number>
```

---

## API Integration Pattern

### Backend Expected Format
```typescript
// POST /api/institutes
{
  "institute_name": "ABC Institute",
  "contact_phone": {
    "dial_code": "92",
    "country_code": "pk",
    "phone_number": "3001234567"
  }
}
```

### Frontend Service
```typescript
// institute.service.ts
import { PhoneNumberOutput } from '@app/components/widgets/phone-number/phone-number';

interface CreateInstituteDto {
  institute_name: string;
  contact_phone: PhoneNumberOutput;
}

createInstitute(data: CreateInstituteDto) {
  return this.http.post('/api/institutes', data);
}
```

---

## Validation Best Practices

```typescript
// Check if phone is valid before submitting
isPhoneValid(): boolean {
  return this.phoneNumber?.isValid === true;
}

// Show error message
getPhoneError(): string {
  if (!this.phoneNumber) {
    return 'Phone number is required';
  }
  if (!this.phoneNumber.isValid) {
    return 'Please enter a valid phone number';
  }
  return '';
}

// Disable submit button
canSubmit(): boolean {
  return this.instituteName.trim() !== '' && 
         this.phoneNumber?.isValid === true &&
         // ... other validations
}
```

---

## Summary

✅ **Simple Form**: Direct `[(value)]` binding
✅ **Edit Mode**: Pre-fill with `PhoneNumberInput` format
✅ **View Mode**: Use `[disabled]="true"`
✅ **Loop**: Add unique `[inputId]="'phone-' + i"`
✅ **Validation**: Check `phone?.isValid` before submit
✅ **API**: Send entire `PhoneNumberOutput` object

Aap ka existing institute management form mein easily integrate ho jayega! 🚀
