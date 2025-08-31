import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-verify-otp',
  standalone: false,
  templateUrl: './verify-otp.html',
  styleUrl: './verify-otp.scss'
})
export class VerifyOtp implements OnInit, OnDestroy {
  otpDigits: string[] = ['', '', '', '', '', ''];
  loading = false;
  resendLoading = false;
  message = '';
  messageType: 'success' | 'danger' = 'success';
  timeRemaining = 300; // 5 minutes in seconds
  timerInterval: any;
  email = ''; // This should be passed from the previous component
  showLogoIcon = false; // For fallback logo display
  
  constructor(
    private router: Router
  ) {}

  ngOnInit() {
    this.startTimer();
    // You might want to get email from route params or service
    // this.email = this.route.snapshot.queryParams['email'] || '';
  }

  ngOnDestroy() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
  }

  startTimer() {
    this.timerInterval = setInterval(() => {
      if (this.timeRemaining > 0) {
        this.timeRemaining--;
      } else {
        clearInterval(this.timerInterval);
      }
    }, 1000);
  }

  formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')} : ${secs.toString().padStart(2, '0')}`;
  }

  onOtpInput(event: any, index: number) {
    const value = event.target.value;
    
    // Only allow numeric input
    if (!/^[0-9]$/.test(value) && value !== '') {
      event.target.value = '';
      this.otpDigits[index] = '';
      return;
    }

    this.otpDigits[index] = value;

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = event.target.parentElement.children[index + 1];
      if (nextInput) {
        nextInput.focus();
      }
    }
  }

  onKeyDown(event: any, index: number) {
    // Handle backspace - move to previous input
    if (event.key === 'Backspace' && !this.otpDigits[index] && index > 0) {
      const prevInput = event.target.parentElement.children[index - 1];
      if (prevInput) {
        prevInput.focus();
      }
    }

    // Handle arrow keys
    if (event.key === 'ArrowLeft' && index > 0) {
      const prevInput = event.target.parentElement.children[index - 1];
      if (prevInput) {
        prevInput.focus();
      }
    }

    if (event.key === 'ArrowRight' && index < 5) {
      const nextInput = event.target.parentElement.children[index + 1];
      if (nextInput) {
        nextInput.focus();
      }
    }
  }

  isOtpComplete(): boolean {
    return this.otpDigits.every(digit => digit !== '');
  }

  getOtpValue(): string {
    return this.otpDigits.join('');
  }

  async onVerifyOtp() {
    if (!this.isOtpComplete()) {
      this.showMessage('Please enter all 6 digits', 'danger');
      return;
    }

    this.loading = true;
    const otpValue = this.getOtpValue();

    try {
      // TODO: Implement OTP verification API call
      // const response = await this.authService.verifyOtp({
      //   email: this.email,
      //   otp: otpValue
      // });

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Simulate successful verification
      this.showMessage('OTP verified successfully!', 'success');
      
      // Navigate to next page (e.g., reset password or dashboard)
      setTimeout(() => {
        this.router.navigate(['/auth/reset-password']); // or wherever you want to navigate
      }, 1500);

    } catch (error) {
      console.error('OTP verification failed:', error);
      this.showMessage('Invalid OTP. Please try again.', 'danger');
    } finally {
      this.loading = false;
    }
  }

  async onResendCode(event: Event) {
    event.preventDefault();
    
    if (this.timeRemaining > 0 || this.resendLoading) {
      return;
    }

    this.resendLoading = true;

    try {
      // TODO: Implement resend OTP API call
      // await this.authService.resendOtp({ email: this.email });

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));

      this.showMessage('New code sent to your email!', 'success');
      
      // Reset timer
      this.timeRemaining = 300;
      this.startTimer();
      
      // Clear OTP inputs
      this.otpDigits = ['', '', '', '', '', ''];

    } catch (error) {
      console.error('Resend OTP failed:', error);
      this.showMessage('Failed to resend code. Please try again.', 'danger');
    } finally {
      this.resendLoading = false;
    }
  }

  goBackToLogin(event: Event) {
    event.preventDefault();
    this.router.navigate(['/auth/sign-in']);
  }

  onImageError(event: Event) {
    const imgElement = event.target as HTMLImageElement;
    if (imgElement) {
      imgElement.style.display = 'none';
      this.showLogoIcon = true;
    }
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
