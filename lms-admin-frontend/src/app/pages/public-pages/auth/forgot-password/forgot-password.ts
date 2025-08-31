import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../../services/auth.service';

@Component({
  selector: 'app-forgot-password',
  standalone: false,
  templateUrl: './forgot-password.html',
  styleUrl: './forgot-password.scss'
})
export class ForgotPassword {
  
  resetEmail = '';
  loading = false;
  message = '';
  messageType: 'success' | 'error' = 'error';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  async onSendResetEmail(): Promise<void> {
    if (!this.resetEmail) {
      this.showMessage('Please enter your email address', 'error');
      return;
    }

    this.loading = true;
    this.message = '';

    try {
      const result = await this.authService.forgotPassword(this.resetEmail);
      this.showMessage(result.message, result.success ? 'success' : 'error');
      
      if (result.success) {
        // Optionally redirect to a success page or stay on the same page
        setTimeout(() => {
          // You can redirect to login or stay here
          // this.router.navigate(['/auth/sign-in']);
        }, 3000);
      }
    } catch (error: any) {
      this.showMessage('Failed to send password reset email. Please try again.', 'error');
      console.error('Reset password error:', error);
    } finally {
      this.loading = false;
    }
  }

  goBackToLogin(): void {
    this.router.navigate(['/auth/sign-in']);
  }

  private showMessage(message: string, type: 'success' | 'error'): void {
    this.message = message;
    this.messageType = type;
    
    // Auto-hide message after 5 seconds
    setTimeout(() => {
      this.message = '';
    }, 5000);
  }
}
