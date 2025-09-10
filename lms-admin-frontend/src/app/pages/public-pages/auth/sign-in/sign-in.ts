import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../../services/auth.service';
import { LoginRequest, User } from '../../../../models';

@Component({
  selector: 'app-sign-in',
  standalone: false,
  templateUrl: './sign-in.html',
  styleUrl: './sign-in.scss'
})
export class SignIn implements OnInit {
  
  credentials: LoginRequest = {
    email_address: '',
    password: ''
  };
  
  loading = false;
  message = '';
  messageType: 'success' | 'error' = 'error';
  currentUser: User | null = null;
  permissions: string[] = [];
  showPassword = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Subscribe to current user changes
    this.authService.currentUser$.subscribe((user: User | null) => {
      this.currentUser = user;
      if (user) {
        this.permissions = this.authService.getPermissions();
      }
    });
    
    // If already logged in, redirect to dashboard
    if (this.authService.isLoggedIn()) {
      this.redirectBasedOnRole();
    }
  }

  async onLogin(): Promise<void> {
    if (!this.credentials.email_address || !this.credentials.password) {
      this.showMessage('Please enter both email and password', 'error');
      return;
    }

    this.loading = true;
    this.message = '';

    try {
      const result = await this.authService.login(this.credentials);
      
      if (result.success) {
        this.showMessage('Login successful! Welcome back.', 'success');
        
        // Redirect based on user role
        setTimeout(() => {
          this.redirectBasedOnRole();
        }, 1000);
      } else {
        this.showMessage(result.message || 'Login failed', 'error');
      }
    } catch (error: any) {
      this.showMessage('An error occurred during login', 'error');
      console.error('Login error:', error);
    } finally {
      this.loading = false;
    }
  }

  async onForgotPassword(): Promise<void> {
    if (!this.credentials.email_address) {
      this.showMessage('Please enter your email first', 'error');
      return;
    }

    try {
      const result = await this.authService.forgotPassword(this.credentials.email_address);
      this.showMessage(result.message, result.success ? 'success' : 'error');
    } catch (error: any) {
      this.showMessage('Failed to send password reset email', 'error');
    }
  }

  private redirectBasedOnRole(): void {
    const userRole = this.authService.getCurrentUserRole();
    console.log('User logged in with role:', userRole);
    
    switch (userRole) {
      case 'SUPER_ADMIN':
        this.router.navigate(['/dashboard/admin']);
        break;
      case 'TENANT_ADMIN':
        this.router.navigate(['/dashboard/tenant']);
        break;
      case 'TEACHER':
        this.router.navigate(['/dashboard/teacher']);
        break;
      default:
        this.router.navigate(['/dashboard']);
    }
  }

  private showMessage(message: string, type: 'success' | 'error'): void {
    this.message = message;
    this.messageType = type;
    
    // Auto-hide message after 5 seconds
    setTimeout(() => {
      this.message = '';
    }, 5000);
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  toggleTheme(): void {
    const currentTheme = document.body.getAttribute('data-theme') || 'light';
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    document.body.setAttribute('data-theme', newTheme);
  }
}
