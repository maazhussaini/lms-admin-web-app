import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { HttpRequests } from './http-requests.service';
import { TokenStorage } from './token-storage';
import { LoginRequest, LoginResponse, User, RefreshTokenRequest, ForgotPasswordRequest, ResetPasswordRequest } from '../models';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  private isLoggedInSubject = new BehaviorSubject<boolean>(false);

  // Public observables
  public currentUser$: Observable<User | null> = this.currentUserSubject.asObservable();
  public isLoggedIn$: Observable<boolean> = this.isLoggedInSubject.asObservable();

  constructor(
    private httpRequests: HttpRequests,
    private tokenStorage: TokenStorage,
    private router: Router
  ) {
    // Initialize auth state from stored data
    this.initializeAuthState();
  }

  private initializeAuthState(): void {
    const userData = this.tokenStorage.getUserData();
    const isLoggedIn = this.tokenStorage.isLoggedIn();
    
    if (userData && isLoggedIn) {
      this.currentUserSubject.next(userData);
      this.isLoggedInSubject.next(true);
    }
  }

  /**
   * Universal login method for Admin, Super Admin and Teachers
   */
  async login(credentials: LoginRequest): Promise<{ success: boolean; message?: string; user?: User }> {
    try {
      const response = await this.httpRequests.login(credentials);
      
      if (response.is_success && response.data) {
        const loginData = response.data as any; // Since response structure might vary
        
        // Handle the actual login response structure
        if (loginData.success && loginData.data) {
          const { user, tokens, permissions } = loginData.data;
          
          // Save all authentication data
          this.tokenStorage.saveLoginSession(user, tokens, permissions);
          
          // Update observables
          this.currentUserSubject.next(user);
          this.isLoggedInSubject.next(true);
          
          return {
            success: true,
            message: loginData.message || 'Login successful',
            user: user
          };
        }
      }
      
      return {
        success: false,
        message: response.message || 'Login failed'
      };
    } catch (error: any) {
      console.error('Login error:', error);
      return {
        success: false,
        message: error.message || 'An error occurred during login'
      };
    }
  }

  /**
   * Logout user and clear all stored data
   */
  async logout(): Promise<void> {
    try {
      // Call backend logout endpoint
      await this.httpRequests.logout();
    } catch (error) {
      console.error('Logout API error:', error);
      // Continue with local logout even if API fails
    } finally {
      // Clear all local data
      this.tokenStorage.clearAllData();
      
      // Update observables
      this.currentUserSubject.next(null);
      this.isLoggedInSubject.next(false);
      
      // Redirect to login
      this.router.navigate(['/auth/login']);
    }
  }

  /**
   * Refresh access token
   */
  async refreshToken(): Promise<boolean> {
    try {
      const refreshToken = this.tokenStorage.getRefreshToken();
      
      if (!refreshToken) {
        this.logout();
        return false;
      }

      const response = await this.httpRequests.refreshToken({ refresh_token: refreshToken });
      
      if (response.is_success && response.data) {
        const refreshData = response.data as any;
        
        if (refreshData.success && refreshData.data?.tokens) {
          this.tokenStorage.saveTokens(refreshData.data.tokens);
          return true;
        }
      }
      
      this.logout();
      return false;
    } catch (error) {
      console.error('Token refresh error:', error);
      this.logout();
      return false;
    }
  }

  /**
   * Send forgot password email
   */
  async forgotPassword(email: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await this.httpRequests.forgotPassword({ email });
      
      return {
        success: response.is_success || false,
        message: response.message || 'Password reset email sent'
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Failed to send password reset email'
      };
    }
  }

  /**
   * Reset password using token
   */
  async resetPassword(token: string, newPassword: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await this.httpRequests.resetPassword({ token, new_password: newPassword });
      
      return {
        success: response.is_success || false,
        message: response.message || 'Password reset successful'
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Password reset failed'
      };
    }
  }

  /**
   * Get current user data
   */
  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  /**
   * Check if user is logged in
   */
  isLoggedIn(): boolean {
    return this.isLoggedInSubject.value;
  }

  /**
   * Get current user role
   */
  getCurrentUserRole(): string | null {
    return this.tokenStorage.getCurrentUserRole();
  }

  /**
   * Get current tenant ID
   */
  getCurrentTenantId(): number | null {
    return this.tokenStorage.getCurrentTenantId();
  }

  /**
   * Check if user has specific permission
   */
  hasPermission(permission: string): boolean {
    return this.tokenStorage.hasPermission(permission);
  }

  /**
   * Check if user is Super Admin
   */
  isSuperAdmin(): boolean {
    return this.getCurrentUserRole() === 'SUPER_ADMIN';
  }

  /**
   * Check if user is Tenant Admin
   */
  isTenantAdmin(): boolean {
    return this.getCurrentUserRole() === 'TENANT_ADMIN';
  }

  /**
   * Check if user is Teacher
   */
  isTeacher(): boolean {
    return this.getCurrentUserRole() === 'TEACHER';
  }

  /**
   * Get access token for manual API calls
   */
  getAccessToken(): string | null {
    return this.tokenStorage.getAccessToken();
  }

  /**
   * Get user permissions
   */
  getPermissions(): string[] {
    return this.tokenStorage.getPermissions();
  }
}
