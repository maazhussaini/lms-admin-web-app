# Phone Number Widget Component

Yeh ek reusable phone number input widget hai jo international phone numbers ko handle karta hai with validation.

## Features

- ✅ **Two-way Data Binding**: `[(value)]` ke through simple binding
- ✅ **Reactive Forms Support**: FormControl compatible
- ✅ **Input Validation**: Sirf numbers allowed (alphabets aur special characters nahi)
- ✅ **No Leading Zero**: Starting mein 0 nahi type kar sakte
- ✅ **International Support**: 200+ countries with flags
- ✅ **Search Countries**: Dropdown mein search functionality
- ✅ **Phone Validation**: Google libphonenumber library se validation
- ✅ **Customizable**: Multiple options available

## Installation

Already installed! Dependencies:
- `ngx-intl-tel-input-gg`
- `intl-tel-input@17.0.3`
- `google-libphonenumber`

## Basic Usage

### 1. Simple Two-Way Binding

```typescript
import { PhoneNumber, PhoneNumberOutput } from './components/widgets/phone-number/phone-number';

@Component({
  selector: 'app-my-form',
  standalone: true,
  imports: [PhoneNumber],
  template: `
    <app-phone-number
      label="Phone Number"
      [required]="true"
      [(value)]="phoneValue"
      (valueChange)="onPhoneChange($event)"
    ></app-phone-number>
  `
})
export class MyFormComponent {
  phoneValue = null;

  onPhoneChange(output: PhoneNumberOutput): void {
    console.log('Phone Data:', output);
    // Output: { dialCode: '92', countryCode: 'pk', phoneNumber: '3001234567', isValid: true }
  }
}
```

### 2. Reactive Forms

```typescript
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { PhoneNumber } from './components/widgets/phone-number/phone-number';

@Component({
  selector: 'app-my-form',
  standalone: true,
  imports: [ReactiveFormsModule, PhoneNumber],
  template: `
    <form [formGroup]="myForm" (ngSubmit)="onSubmit()">
      <app-phone-number
        label="Contact Number"
        [required]="true"
        formControlName="phone"
      ></app-phone-number>
      
      <button type="submit" [disabled]="myForm.invalid">
        Submit
      </button>
    </form>
  `
})
export class MyFormComponent {
  myForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.myForm = this.fb.group({
      phone: [null, Validators.required]
    });
  }

  onSubmit(): void {
    if (this.myForm.valid) {
      console.log('Form Data:', this.myForm.value);
    }
  }
}
```

### 3. Loop mein Multiple Phone Numbers (Important!)

Jab aap loop mein multiple phone number inputs use karte hain, to har input ko **unique ID** deni zaroori hai:

```typescript
import { CommonModule } from '@angular/common';
import { PhoneNumber, PhoneNumberOutput } from './components/widgets/phone-number/phone-number';

@Component({
  selector: 'app-contacts-form',
  standalone: true,
  imports: [CommonModule, PhoneNumber],
  template: `
    <div *ngFor="let contact of contacts; let i = index">
      <h4>{{ contact.name }}</h4>
      <app-phone-number
        [label]="contact.label"
        [inputId]="'phone-' + i"
        [required]="true"
        [(value)]="contact.phone"
        (valueChange)="onPhoneChange(i, $event)"
      ></app-phone-number>
    </div>
  `
})
export class ContactsFormComponent {
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
    }
  ];

  onPhoneChange(index: number, output: PhoneNumberOutput): void {
    console.log(`Contact ${index}:`, output);
    this.contacts[index].phone = output;
  }
}
```

**Important Notes for Loop:**
- ✅ Har phone input ko unique `inputId` dein (e.g., `'phone-' + i`)
- ✅ Agar `inputId` nahi di to automatic unique ID generate hogi
- ✅ Label bhi dynamic rakh sakte hain
- ✅ Har contact apna separate validation state maintain karega

### 4. Pre-filled Value

```typescript
phoneValue = {
  dialCode: '1',
  countryCode: 'us',
  phoneNumber: '2025551234'
};
```

```html
<app-phone-number
  label="Phone"
  [(value)]="phoneValue"
></app-phone-number>
```

## Input/Output Format

### Input (PhoneNumberInput)
```typescript
{
  dialCode: '92',      // Country dial code (without +)
  countryCode: 'pk',   // ISO country code (lowercase)
  phoneNumber: '3001234567'  // Phone number without dial code
}
```

### Output (PhoneNumberOutput)
```typescript
{
  dialCode: '92',
  countryCode: 'pk', 
  phoneNumber: '3001234567',
  isValid: true       // Validation status
}
```

## Component Properties

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `label` | string | 'Phone Number' | Label text |
| `placeholder` | string | '' | Input placeholder |
| `required` | boolean | false | Mark field as required |
| `disabled` | boolean | false | Disable input |
| `cssClass` | string | 'form-control' | CSS class for input |
| `preferredCountries` | CountryISO[] | [US, PK, UK] | Countries shown at top |
| `enableAutoCountrySelect` | boolean | true | Auto-detect country |
| `enablePlaceholder` | boolean | true | Show placeholder |
| `searchCountryFlag` | boolean | true | Enable country search |
| `selectFirstCountry` | boolean | false | Auto-select first country |
| `selectedCountryISO` | CountryISO | Pakistan | Default country |
| `maxLength` | number | 15 | Max phone digits |
| `phoneValidation` | boolean | true | Enable validation |

## Events

| Event | Type | Description |
|-------|------|-------------|
| `valueChange` | EventEmitter<PhoneNumberOutput> | Emits jab phone number change ho |

## Validation Rules

1. ✅ **Only Numbers**: Sirf 0-9 digits allow hain
2. ✅ **No Leading Zero**: Phone number 0 se start nahi ho sakta
3. ✅ **No Special Characters**: Alphabets ya special characters nahi
4. ✅ **International Validation**: Google libphonenumber library se validate hota hai
5. ✅ **Paste Handling**: Paste karne par bhi clean aur validate hota hai

## Examples

### Custom Country List
```html
<app-phone-number
  [preferredCountries]="[CountryISO.Pakistan, CountryISO.India, CountryISO.Bangladesh]"
  [selectedCountryISO]="CountryISO.Pakistan"
></app-phone-number>
```

### Disable Auto-Select
```html
<app-phone-number
  [enableAutoCountrySelect]="false"
  [selectFirstCountry]="false"
></app-phone-number>
```

### Custom Max Length
```html
<app-phone-number
  [maxLength]="10"
  label="Mobile Number"
></app-phone-number>
```

## Demo Component

Demo dekhne ke liye:

```typescript
import { PhoneNumberDemoComponent } from './components/widgets/phone-number/phone-number-demo.component';

// Add to your routing or component imports
```

## Troubleshooting

### CSS Not Loading?
Angular.json mein yeh line check karein:
```json
"styles": [
  "node_modules/intl-tel-input/build/css/intlTelInput.css"
]
```

### Validation Not Working?
- `phoneValidation` property true hai check karein
- Phone number 0 se start nahi ho raha check karein
- Country properly select hai check karein

### Form Not Submitting?
- `myForm.valid` check karein
- Required fields fill hain check karein
- Console mein errors check karein

## Browser Support

- ✅ Chrome (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Edge (latest)

## Dependencies

- Angular 17+
- ngx-intl-tel-input-gg
- google-libphonenumber
- intl-tel-input

## License

MIT
