import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PhoneNumber, PhoneNumberOutput } from '../phone-number/phone-number';

@Component({
  selector: 'app-phone-number-demo',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    PhoneNumber
  ],
  template: `
    <div class="container mt-5">
      <div class="row">
        <div class="col-md-6">
          <h2>Phone Number Widget Demo</h2>
          
          <!-- Example 1: Simple Two-Way Binding -->
          <div class="card mb-4">
            <div class="card-header">
              <h5>Example 1: Simple Two-Way Binding</h5>
            </div>
            <div class="card-body">
              <app-phone-number
                label="Contact Number"
                [required]="true"
                [(value)]="simplePhoneValue"
                (valueChange)="onSimplePhoneChange($event)"
              ></app-phone-number>
              
              <div class="mt-3">
                <h6>Output:</h6>
                <pre>{{ simplePhoneOutput | json }}</pre>
              </div>
            </div>
          </div>

          <!-- Example 2: Reactive Form Integration -->
          <div class="card mb-4">
            <div class="card-header">
              <h5>Example 2: Reactive Form Integration</h5>
            </div>
            <div class="card-body">
              <form [formGroup]="myForm" (ngSubmit)="onSubmit()">
                <app-phone-number
                  label="Business Phone"
                  [required]="true"
                  formControlName="businessPhone"
                  (valueChange)="onFormPhoneChange($event)"
                ></app-phone-number>

                <button 
                  type="submit" 
                  class="btn btn-primary mt-3"
                  [disabled]="myForm.invalid"
                >
                  Submit Form
                </button>
              </form>

              <div class="mt-3">
                <h6>Form Value:</h6>
                <pre>{{ myForm.value | json }}</pre>
                <h6>Form Valid:</h6>
                <pre>{{ myForm.valid }}</pre>
              </div>
            </div>
          </div>

          <!-- Example 3: Loop with Multiple Instances -->
          <div class="card mb-4">
            <div class="card-header">
              <h5>Example 3: Loop with Multiple Phone Numbers</h5>
            </div>
            <div class="card-body">
              <div *ngFor="let contact of contacts; let i = index" class="mb-3 p-3 border rounded">
                <h6>{{ contact.name }}</h6>
                <app-phone-number
                  [label]="contact.label"
                  [required]="true"
                  [inputId]="'phone-' + i"
                  [(value)]="contact.phone"
                  (valueChange)="onLoopPhoneChange(i, $event)"
                ></app-phone-number>
              </div>

              <div class="mt-3">
                <h6>All Contacts Output:</h6>
                <pre>{{ contacts | json }}</pre>
              </div>
            </div>
          </div>

          <!-- Example 4: Custom Configuration -->
          <div class="card mb-4">
            <div class="card-header">
              <h5>Example 4: Custom Configuration</h5>
            </div>
            <div class="card-body">
              <app-phone-number
                label="Emergency Contact"
                [required]="false"
                [enableAutoCountrySelect]="false"
                [searchCountryFlag]="true"
                [maxLength]="12"
                [(value)]="customPhoneValue"
                (valueChange)="onCustomPhoneChange($event)"
              ></app-phone-number>
              
              <div class="mt-3">
                <h6>Output:</h6>
                <pre>{{ customPhoneOutput | json }}</pre>
              </div>
            </div>
          </div>
        </div>

        <div class="col-md-6">
          <div class="card">
            <div class="card-header">
              <h5>Usage Instructions</h5>
            </div>
            <div class="card-body">
              <h6>Features:</h6>
              <ul>
                <li>✅ Two-way data binding</li>
                <li>✅ Only numeric input (no alphabets/special chars)</li>
                <li>✅ No leading zero allowed</li>
                <li>✅ International phone validation</li>
                <li>✅ Country selection with flags</li>
                <li>✅ Search countries</li>
                <li>✅ Reactive form compatible</li>
                <li>✅ Unique IDs in loops (automatic)</li>
              </ul>

              <h6>Loop Usage:</h6>
              <pre>&lt;div *ngFor="let item of items; let i = index"&gt;
  &lt;app-phone-number
    [label]="'Phone ' + (i + 1)"
    [inputId]="'phone-' + i"
    [(value)]="item.phone"
  &gt;&lt;/app-phone-number&gt;
&lt;/div&gt;</pre>

              <h6>Input Format:</h6>
              <pre>{{'{'}}<br>  dialCode: 1,<br>  countryCode: 'us',<br>  phoneNumber: '345052233'<br>{{'}'}}</pre>

              <h6>Output Format:</h6>
              <pre>{{'{'}}<br>  dialCode: 1,<br>  countryCode: 'us',<br>  phoneNumber: '345052233',<br>  isValid: true<br>{{'}'}}</pre>

              <h6>Component Properties:</h6>
              <ul class="small">
                <li><code>label</code>: Label text</li>
                <li><code>inputId</code>: Unique ID (auto-generated if not provided)</li>
                <li><code>placeholder</code>: Input placeholder</li>
                <li><code>required</code>: Mark as required</li>
                <li><code>disabled</code>: Disable input</li>
                <li><code>preferredCountries</code>: Countries at top</li>
                <li><code>selectedCountryISO</code>: Default country</li>
                <li><code>maxLength</code>: Max phone digits</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .card {
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    pre {
      background: #f5f5f5;
      padding: 10px;
      border-radius: 4px;
      font-size: 12px;
    }
  `]
})
export class PhoneNumberDemoComponent {
  // Simple binding example
  simplePhoneValue = null;
  simplePhoneOutput: PhoneNumberOutput | null = null;

  // Custom configuration example
  customPhoneValue = null;
  customPhoneOutput: PhoneNumberOutput | null = null;

  // Loop example with multiple contacts
  contacts = [
    {
      name: 'Primary Contact',
      label: 'Mobile Number',
      phone: null as PhoneNumberOutput | null
    },
    {
      name: 'Secondary Contact',
      label: 'Office Number',
      phone: null as PhoneNumberOutput | null
    },
    {
      name: 'Emergency Contact',
      label: 'Emergency Number',
      phone: null as PhoneNumberOutput | null
    }
  ];

  // Reactive form example
  myForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.myForm = this.fb.group({
      businessPhone: [null, Validators.required]
    });
  }

  onSimplePhoneChange(output: PhoneNumberOutput): void {
    console.log('Simple Phone Changed:', output);
    this.simplePhoneOutput = output;
  }

  onCustomPhoneChange(output: PhoneNumberOutput): void {
    console.log('Custom Phone Changed:', output);
    this.customPhoneOutput = output;
  }

  onFormPhoneChange(output: PhoneNumberOutput): void {
    console.log('Form Phone Changed:', output);
  }

  onLoopPhoneChange(index: number, output: PhoneNumberOutput): void {
    console.log(`Contact ${index} Phone Changed:`, output);
    // Update the specific contact's phone
    this.contacts[index].phone = output;
  }

  onSubmit(): void {
    if (this.myForm.valid) {
      console.log('Form Submitted:', this.myForm.value);
      alert('Form submitted successfully! Check console for data.');
    }
  }
}
