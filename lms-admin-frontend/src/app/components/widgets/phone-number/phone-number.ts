import { Component, Input, Output, EventEmitter, OnInit, forwardRef, ViewChild, ElementRef, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormsModule, ReactiveFormsModule, NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';
import { NgxIntlTelInputModule } from 'ngx-intl-tel-input-gg';
import { CountryISO, PhoneNumberFormat, SearchCountryField } from 'ngx-intl-tel-input-gg';

export interface PhoneNumberInput {
  dialCode: string;
  countryCode: string;
  phoneNumber: string;
}

export interface PhoneNumberOutput extends PhoneNumberInput {
  isValid: boolean;
}

@Component({
  selector: 'app-phone-number',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NgxIntlTelInputModule
  ],
  templateUrl: './phone-number.html',
  styleUrl: './phone-number.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => PhoneNumber),
      multi: true
    }
  ]
})
export class PhoneNumber implements OnInit, AfterViewInit, OnDestroy, ControlValueAccessor {
  @Input() label: string = 'Phone Number';
  @Input() placeholder: string = '';
  @Input() required: boolean = false;
  @Input() disabled: boolean = false;
  @Input() cssClass: string = 'form-control';
  @Input() preferredCountries: CountryISO[] = [CountryISO.UnitedStates, CountryISO.Pakistan, CountryISO.UnitedKingdom];
  @Input() enableAutoCountrySelect: boolean = true;
  @Input() enablePlaceholder: boolean = true;
  @Input() searchCountryFlag: boolean = true;
  @Input() selectFirstCountry: boolean = false;
  @Input() selectedCountryISO: CountryISO = CountryISO.Pakistan;
  @Input() maxLength: number = 15;
  @Input() phoneValidation: boolean = true;
  @Input() inputId: string = ''; // Unique ID for input element

  @Input() value: PhoneNumberInput | null = null;
  @Output() valueChange = new EventEmitter<PhoneNumberOutput>();

  @ViewChild('phoneWidget', { read: ElementRef }) phoneWidget!: ElementRef;

  phoneFormControl = new FormControl('');
  
  // Unique ID generator
  uniqueId: string = '';
  
  // Enums for template
  CountryISO = CountryISO;
  SearchCountryField = SearchCountryField;
  PhoneNumberFormat = PhoneNumberFormat;

  private onChange: any = () => {};
  private onTouch: any = () => {};
  private globalClickHandler?: (event: MouseEvent) => void;

  ngOnInit(): void {
    // Generate unique ID if not provided
    if (!this.inputId) {
      this.uniqueId = `phone-input-${Math.random().toString(36).substr(2, 9)}-${Date.now()}`;
    } else {
      this.uniqueId = this.inputId;
    }

    // Initialize form control with input value if provided
    if (this.value) {
      this.setPhoneNumber(this.value);
    }

    // Subscribe to form control changes
    this.phoneFormControl.valueChanges.subscribe((phoneData: any) => {
      this.handlePhoneChange(phoneData);
    });
  }

  ngAfterViewInit(): void {
    console.log('PhoneNumber component mounted');

    this.globalClickHandler = (event: MouseEvent) => {
      console.log('global click handler fired', event.target);
      const toggles = Array.from(document.querySelectorAll<HTMLElement>('.iti__selected-flag.dropdown-toggle'));
      const openToggles = toggles.filter(toggle => {
        const container = toggle.closest('.iti__flag-container');
        const menu = container?.querySelector('.dropdown-menu');
        return toggle.getAttribute('aria-expanded') === 'true' ||
          toggle.classList.contains('open') ||
          container?.classList.contains('open') ||
          container?.classList.contains('show') ||
          menu?.classList.contains('show');
      });

      if (!openToggles.length) {
        return;
      }

      openToggles.forEach(element => element.click());
      console.log('hide list', openToggles.length);
    };

  document.addEventListener('click', this.globalClickHandler, true);
  }

  ngOnDestroy(): void {
    if (this.globalClickHandler) {
  document.removeEventListener('click', this.globalClickHandler, true);
    }
  }

  /**
   * Handle phone number change event
   */
  handlePhoneChange(phoneData: any): void {
    if (!phoneData) {
      const emptyOutput: PhoneNumberOutput = {
        dialCode: '',
        countryCode: '',
        phoneNumber: '',
        isValid: false
      };
      this.valueChange.emit(emptyOutput);
      this.onChange(null);
      return;
    }

    // Extract phone number and validate
    const output: PhoneNumberOutput = {
      dialCode: phoneData.dialCode || '',
      countryCode: phoneData.countryCode || '',
      phoneNumber: phoneData.number ? phoneData.number.replace(/\D/g, '') : '',
      isValid: this.validatePhoneNumber(phoneData)
    };

    // Emit the output
    this.valueChange.emit(output);
    this.onChange(output);
  }

  /**
   * Validate phone number
   */
  private validatePhoneNumber(phoneData: any): boolean {
    if (!phoneData || !phoneData.number) {
      return false;
    }

    // Remove all non-digit characters
    const cleanNumber = phoneData.number.replace(/\D/g, '');
    
    // Check if number is empty
    if (!cleanNumber) {
      return false;
    }

    // Check if number starts with 0 (not allowed)
    if (cleanNumber.startsWith('0')) {
      return false;
    }

    // Check if number contains only digits
    if (!/^\d+$/.test(cleanNumber)) {
      return false;
    }

    // Use the library's built-in validation
    return phoneData.isValidNumber || false;
  }

  /**
   * Set phone number programmatically
   */
  private setPhoneNumber(phoneInput: PhoneNumberInput): void {
    if (phoneInput && phoneInput.phoneNumber) {
      const fullNumber = `+${phoneInput.dialCode}${phoneInput.phoneNumber}`;
      this.phoneFormControl.setValue(fullNumber);
    }
  }

  /**
   * Restrict input to numbers only and prevent leading zero
   * BUT allow text input in search box
   */
  onKeyPress(event: KeyboardEvent): void {
    const input = event.target as HTMLInputElement;
    
    // 🔥 CRITICAL: Allow text input in search box (country search)
    // Search box has class 'iti__search-input' or id containing 'search'
    if (input.classList.contains('iti__search-input') || 
        input.id?.includes('search') ||
        input.getAttribute('role') === 'search') {
      return; // Allow all characters in search box
    }
    
    const charCode = event.which ? event.which : event.keyCode;
    
    // Allow only numbers (0-9) in phone input
    if (charCode < 48 || charCode > 57) {
      event.preventDefault();
      return;
    }

    // Get current input value
    const currentValue = input.value.replace(/\D/g, '');
    
    // If input is empty and user tries to enter 0, prevent it (no leading zero)
    if (currentValue.length === 0 && charCode === 48) {
      event.preventDefault();
      return;
    }
  }

  /**
   * Handle paste event to clean pasted content
   * BUT allow text paste in search box
   */
  onPaste(event: ClipboardEvent): void {
    const input = event.target as HTMLInputElement;
    
    // 🔥 CRITICAL: Allow text paste in search box (country search)
    if (input.classList.contains('iti__search-input') || 
        input.id?.includes('search') ||
        input.getAttribute('role') === 'search') {
      return; // Allow normal paste in search box
    }
    
    event.preventDefault();
    const pastedText = event.clipboardData?.getData('text') || '';
    
    // Remove all non-digit characters
    let cleanedText = pastedText.replace(/\D/g, '');
    
    // Remove leading zeros
    cleanedText = cleanedText.replace(/^0+/, '');
    
    // Get current input
    const start = input.selectionStart || 0;
    const end = input.selectionEnd || 0;
    const currentValue = input.value;
    
    const newValue = currentValue.substring(0, start) + cleanedText + currentValue.substring(end);
    input.value = newValue;
    
    // Trigger change detection
    const changeEvent = new Event('input', { bubbles: true });
    input.dispatchEvent(changeEvent);
  }

  // ControlValueAccessor implementation
  writeValue(value: PhoneNumberInput | null): void {
    if (value) {
      this.value = value;
      this.setPhoneNumber(value);
    } else {
      this.phoneFormControl.setValue('');
    }
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouch = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
    if (isDisabled) {
      this.phoneFormControl.disable();
    } else {
      this.phoneFormControl.enable();
    }
  }
}
