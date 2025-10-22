import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PhoneNumber, PhoneNumberOutput } from './phone-number';

/**
 * Example: Multiple phone numbers in a loop
 * 
 * Yeh example dikhata hai kaise aap loop mein multiple phone number inputs use kar sakte hain.
 * Har input ki unique identity automatically ya manually set ho sakti hai.
 */
@Component({
  selector: 'app-phone-loop-example',
  standalone: true,
  imports: [CommonModule, PhoneNumber],
  template: `
    <div class="container p-4">
      <h3>Multiple Phone Numbers Example</h3>
      
      <!-- Example 1: Simple Loop with Array -->
      <div class="card mb-4">
        <div class="card-header">
          <h5>Contact List</h5>
        </div>
        <div class="card-body">
          <div *ngFor="let contact of contacts; let i = index" class="mb-3 p-3 border rounded">
            <h6>{{ contact.title }}</h6>
            <app-phone-number
              [label]="contact.label"
              [inputId]="'contact-phone-' + i"
              [required]="contact.required"
              [(value)]="contact.phoneData"
              (valueChange)="onContactPhoneChange(i, $event)"
            ></app-phone-number>
            
            <!-- Show validation status -->
            <div *ngIf="contact.phoneData" class="mt-2">
              <span [class]="contact.phoneData.isValid ? 'badge bg-success' : 'badge bg-danger'">
                {{ contact.phoneData.isValid ? 'Valid' : 'Invalid' }}
              </span>
              <small class="ms-2 text-muted" *ngIf="contact.phoneData.isValid">
                +{{ contact.phoneData.dialCode }} {{ contact.phoneData.phoneNumber }}
              </small>
            </div>
          </div>

          <!-- Add new contact button -->
          <button class="btn btn-primary" (click)="addContact()">
            <i class="bi bi-plus"></i> Add Contact
          </button>
        </div>
      </div>

      <!-- Display all contacts data -->
      <div class="card">
        <div class="card-header">
          <h5>All Contacts Data</h5>
        </div>
        <div class="card-body">
          <pre>{{ contacts | json }}</pre>
          
          <div class="mt-3">
            <strong>Valid Contacts:</strong> {{ getValidContactsCount() }} / {{ contacts.length }}
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .badge {
      font-size: 0.8rem;
    }
    pre {
      background: #f5f5f5;
      padding: 15px;
      border-radius: 4px;
      max-height: 400px;
      overflow-y: auto;
    }
  `]
})
export class PhoneLoopExampleComponent {
  contacts = [
    {
      title: 'Primary Contact Person',
      label: 'Primary Phone Number',
      required: true,
      phoneData: null as PhoneNumberOutput | null
    },
    {
      title: 'Secondary Contact Person',
      label: 'Secondary Phone Number',
      required: false,
      phoneData: null as PhoneNumberOutput | null
    },
    {
      title: 'Emergency Contact',
      label: 'Emergency Phone Number',
      required: true,
      phoneData: null as PhoneNumberOutput | null
    }
  ];

  /**
   * Handle phone number change for specific contact
   */
  onContactPhoneChange(index: number, output: PhoneNumberOutput): void {
    console.log(`Contact ${index} phone changed:`, output);
    this.contacts[index].phoneData = output;
    
    // You can also trigger other actions here
    if (output.isValid) {
      console.log(`✅ Valid phone number for contact ${index}`);
    } else {
      console.log(`❌ Invalid phone number for contact ${index}`);
    }
  }

  /**
   * Add a new contact to the list
   */
  addContact(): void {
    const newIndex = this.contacts.length + 1;
    this.contacts.push({
      title: `Contact Person ${newIndex}`,
      label: `Phone Number ${newIndex}`,
      required: false,
      phoneData: null
    });
  }

  /**
   * Remove a contact from the list
   */
  removeContact(index: number): void {
    this.contacts.splice(index, 1);
  }

  /**
   * Get count of valid phone numbers
   */
  getValidContactsCount(): number {
    return this.contacts.filter(c => c.phoneData?.isValid).length;
  }

  /**
   * Get all valid phone numbers
   */
  getValidPhoneNumbers(): PhoneNumberOutput[] {
    return this.contacts
      .map(c => c.phoneData)
      .filter((phone): phone is PhoneNumberOutput => phone !== null && phone.isValid);
  }

  /**
   * Check if all required contacts have valid phone numbers
   */
  isFormValid(): boolean {
    return this.contacts
      .filter(c => c.required)
      .every(c => c.phoneData?.isValid === true);
  }

  /**
   * Example: Submit form with all phone numbers
   */
  submitForm(): void {
    if (this.isFormValid()) {
      const formData = {
        contacts: this.contacts.map(c => ({
          title: c.title,
          phone: c.phoneData
        }))
      };
      
      console.log('Form submitted:', formData);
      alert('Form submitted successfully! Check console.');
    } else {
      alert('Please fill all required phone numbers with valid data.');
    }
  }
}
