import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

interface SignUpRequest {
  full_name: string;
  email_address: string;
  password: string;
  confirm_password: string;
  terms_accepted: boolean;
}

@Component({
  selector: 'app-sign-up',
  standalone: false,
  templateUrl: './sign-up.html',
  styleUrl: './sign-up.scss'
})
export class SignUp implements OnInit {
  
  credentials: SignUpRequest = {
    full_name: '',
    email_address: '',
    password: '',
    confirm_password: '',
    terms_accepted: false
  };
  
  loading = false;
  message = '';
  messageType: 'success' | 'error' = 'error';
  showPassword = false;
  showConfirmPassword = false;
  passwordStrength = '';
  passwordMatch = true;
  isDarkTheme = false;

  constructor(
    private router: Router
  ) {}

  ngOnInit(): void {
    // Initialize theme state
    this.initializeTheme();
  }

  async onSignUp(): Promise<void> {
    // Validation
    if (!this.validateForm()) {
      return;
    }

    this.loading = true;
    this.message = '';

    try {
      // TODO: Replace with actual registration service
      console.log('Sign up attempt:', this.credentials);
      
      // Simulate API call
      await this.simulateSignUp();
      
      this.showMessage('Account created successfully! Please check your email to verify your account.', 'success');
      
      // Redirect to sign-in after successful registration
      setTimeout(() => {
        this.router.navigate(['/auth/sign-in']);
      }, 2000);
      
    } catch (error: any) {
      this.showMessage('Failed to create account. Please try again.', 'error');
      console.error('Sign up error:', error);
    } finally {
      this.loading = false;
    }
  }

  private validateForm(): boolean {
    if (!this.credentials.full_name.trim()) {
      this.showMessage('Please enter your full name', 'error');
      return false;
    }

    if (!this.credentials.email_address.trim()) {
      this.showMessage('Please enter your email address', 'error');
      return false;
    }

    if (!this.isValidEmail(this.credentials.email_address)) {
      this.showMessage('Please enter a valid email address', 'error');
      return false;
    }

    if (!this.credentials.password) {
      this.showMessage('Please enter a password', 'error');
      return false;
    }

    if (this.credentials.password.length < 8) {
      this.showMessage('Password must be at least 8 characters long', 'error');
      return false;
    }

    if (this.credentials.password !== this.credentials.confirm_password) {
      this.showMessage('Passwords do not match', 'error');
      return false;
    }

    if (!this.credentials.terms_accepted) {
      this.showMessage('Please accept the terms and conditions', 'error');
      return false;
    }

    return true;
  }

  private isValidEmail(email: string): boolean {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(email);
  }

  private async simulateSignUp(): Promise<void> {
    // Simulate API delay
    return new Promise((resolve) => {
      setTimeout(resolve, 1500);
    });
  }

  onPasswordChange(): void {
    this.updatePasswordStrength();
    this.checkPasswordMatch();
  }

  onConfirmPasswordChange(): void {
    this.checkPasswordMatch();
  }

  private updatePasswordStrength(): void {
    const password = this.credentials.password;
    
    if (!password) {
      this.passwordStrength = '';
      return;
    }

    let strength = 0;
    
    // Length check
    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;
    
    // Character type checks
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;

    if (strength <= 2) {
      this.passwordStrength = 'weak';
    } else if (strength <= 4) {
      this.passwordStrength = 'medium';
    } else {
      this.passwordStrength = 'strong';
    }
  }

  private checkPasswordMatch(): void {
    if (!this.credentials.confirm_password) {
      this.passwordMatch = true;
      return;
    }
    
    this.passwordMatch = this.credentials.password === this.credentials.confirm_password;
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPassword(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  initializeTheme(): void {
    // Check for saved theme preference in localStorage only
    // Default to light theme unless user has manually changed it
    const savedTheme = localStorage.getItem('theme') || 'light';
    
    // Set theme state
    this.isDarkTheme = savedTheme === 'dark';
    
    // Apply theme to document
    document.documentElement.setAttribute('data-theme', savedTheme);
  }

  toggleTheme(): void {
    // Toggle theme state
    this.isDarkTheme = !this.isDarkTheme;
    
    // Determine new theme
    const newTheme = this.isDarkTheme ? 'dark' : 'light';
    
    // Apply theme to document
    document.documentElement.setAttribute('data-theme', newTheme);
    
    // Save theme preference
    localStorage.setItem('theme', newTheme);
    
    // Optional: Dispatch theme change event for other components
    window.dispatchEvent(new CustomEvent('themeChanged', { detail: newTheme }));
  }

  navigateToSignIn(): void {
    this.router.navigate(['/auth/sign-in']);
  }

  private showMessage(message: string, type: 'success' | 'error'): void {
    this.message = message;
    this.messageType = type;
    
    // Auto-hide message after 5 seconds
    setTimeout(() => {
      if (type === 'error') {
        this.message = '';
      }
    }, 5000);
  }
}
