import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-reset-password',
  standalone: false,
  templateUrl: './reset-password.html',
  styleUrl: './reset-password.scss'
})
export class ResetPassword {
  password = '';
  confirmPassword = '';
  showPassword = false;
  showConfirmPassword = false;
  loading = false;
  message = '';
  messageType: 'success' | 'danger' = 'success';
  showLogoIcon = false;
  
  // Theme management
  isDarkTheme = false;
  
  // Password strength properties
  passwordStrengthPercentage = 0;
  passwordStrengthText = '';
  passwordStrengthClass = '';
  
  // Password match properties
  passwordMatchText = '';
  passwordMatchClass = '';
  
  constructor(private router: Router) {
    // Initialize theme from localStorage or system preference
    this.initializeTheme();
  }

  private initializeTheme() {
    // Check localStorage first
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      this.isDarkTheme = savedTheme === 'dark';
    } else {
      // Use system preference
      this.isDarkTheme = window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    
    this.applyTheme();
  }

  toggleTheme() {
    this.isDarkTheme = !this.isDarkTheme;
    this.applyTheme();
    
    // Save theme preference
    localStorage.setItem('theme', this.isDarkTheme ? 'dark' : 'light');
  }

  private applyTheme() {
    const root = document.documentElement;
    if (this.isDarkTheme) {
      root.setAttribute('data-theme', 'dark');
      root.classList.add('dark');
    } else {
      root.setAttribute('data-theme', 'light');
      root.classList.remove('dark');
    }
  }

  onImageError(event: Event) {
    const imgElement = event.target as HTMLImageElement;
    if (imgElement) {
      imgElement.style.display = 'none';
      this.showLogoIcon = true;
    }
  }

  togglePasswordVisibility(field: 'password' | 'confirmPassword') {
    if (field === 'password') {
      this.showPassword = !this.showPassword;
      const passwordInput = document.getElementById('reset-password') as HTMLInputElement;
      if (passwordInput) {
        passwordInput.type = this.showPassword ? 'text' : 'password';
      }
    } else {
      this.showConfirmPassword = !this.showConfirmPassword;
      const confirmPasswordInput = document.getElementById('confirm-password') as HTMLInputElement;
      if (confirmPasswordInput) {
        confirmPasswordInput.type = this.showConfirmPassword ? 'text' : 'password';
      }
    }
  }

  onPasswordChange() {
    this.calculatePasswordStrength();
    this.checkPasswordMatch();
  }

  onConfirmPasswordChange() {
    this.checkPasswordMatch();
  }

  calculatePasswordStrength() {
    const password = this.password;
    let score = 0;
    let feedback = '';

    if (password.length === 0) {
      this.passwordStrengthPercentage = 0;
      this.passwordStrengthText = '';
      this.passwordStrengthClass = '';
      return;
    }

    // Length check
    if (password.length >= 8) score += 25;
    
    // Uppercase check
    if (/[A-Z]/.test(password)) score += 25;
    
    // Lowercase check
    if (/[a-z]/.test(password)) score += 25;
    
    // Number or special character check
    if (/[0-9]/.test(password) || /[^A-Za-z0-9]/.test(password)) score += 25;

    this.passwordStrengthPercentage = score;

    if (score < 50) {
      feedback = 'Weak';
      this.passwordStrengthClass = 'weak';
    } else if (score < 75) {
      feedback = 'Good';
      this.passwordStrengthClass = 'good';
    } else {
      feedback = 'Strong';
      this.passwordStrengthClass = 'strong';
    }

    this.passwordStrengthText = feedback;
  }

  checkPasswordMatch() {
    if (!this.confirmPassword) {
      this.passwordMatchText = '';
      this.passwordMatchClass = '';
      return;
    }

    if (this.password === this.confirmPassword) {
      this.passwordMatchText = '✓ Passwords match';
      this.passwordMatchClass = 'match';
    } else {
      this.passwordMatchText = '✗ Passwords do not match';
      this.passwordMatchClass = 'no-match';
    }
  }

  isFormValid(): boolean {
    return (
      this.password.length >= 8 &&
      this.confirmPassword.length > 0 &&
      this.password === this.confirmPassword
    );
  }

  async onResetPassword() {
    if (!this.isFormValid()) {
      this.showMessage('Please ensure passwords match and meet requirements', 'danger');
      return;
    }

    this.loading = true;

    try {
      // TODO: Implement password reset API call
      // const response = await this.authService.resetPassword({
      //   token: this.resetToken, // Should be passed from route params
      //   password: this.password
      // });

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));

      this.showMessage('Password reset successfully!', 'success');
      
      // Navigate to login page after successful reset
      setTimeout(() => {
        this.router.navigate(['/auth/sign-in']);
      }, 1500);

    } catch (error) {
      console.error('Password reset failed:', error);
      this.showMessage('Failed to reset password. Please try again.', 'danger');
    } finally {
      this.loading = false;
    }
  }

  goBackToLogin(event: Event) {
    event.preventDefault();
    this.router.navigate(['/auth/sign-in']);
  }

  private showMessage(message: string, type: 'success' | 'danger') {
    this.message = message;
    this.messageType = type;
    
    // Clear message after 5 seconds
    setTimeout(() => {
      this.message = '';
    }, 5000);
  }
}
