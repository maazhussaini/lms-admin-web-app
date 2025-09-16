import { Injectable } from '@angular/core';
import { User, Tokens } from '../models';

@Injectable({
  providedIn: 'root'
})
export class TokenStorage {
  
  private readonly ACCESS_TOKEN_KEY = 'lms_access_token';
  private readonly REFRESH_TOKEN_KEY = 'lms_refresh_token';
  private readonly USER_DATA_KEY = 'lms_user_data';
  private readonly PERMISSIONS_KEY = 'lms_permissions';

  constructor() { }

  // Token management
  saveTokens(tokens: Tokens): void {
    localStorage.setItem(this.ACCESS_TOKEN_KEY, tokens.access_token);
    localStorage.setItem(this.REFRESH_TOKEN_KEY, tokens.refresh_token);
  }

  getAccessToken(): string | null {
    return localStorage.getItem(this.ACCESS_TOKEN_KEY);
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(this.REFRESH_TOKEN_KEY);
  }

  clearTokens(): void {
    localStorage.removeItem(this.ACCESS_TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
  }

  // User data management
  saveUserData(user: User): void {
    localStorage.setItem(this.USER_DATA_KEY, JSON.stringify(user));
  }

  getUserData(): User | null {
    const userData = localStorage.getItem(this.USER_DATA_KEY);
    return userData ? JSON.parse(userData) : null;
  }

  clearUserData(): void {
    localStorage.removeItem(this.USER_DATA_KEY);
  }

  // Permissions management
  savePermissions(permissions: string[]): void {
    localStorage.setItem(this.PERMISSIONS_KEY, JSON.stringify(permissions));
  }

  getPermissions(): string[] {
    const permissions = localStorage.getItem(this.PERMISSIONS_KEY);
    return permissions ? JSON.parse(permissions) : [];
  }

  clearPermissions(): void {
    localStorage.removeItem(this.PERMISSIONS_KEY);
  }

  // Complete session management
  saveLoginSession(user: User, tokens: Tokens, permissions: string[]): void {
    this.saveUserData(user);
    this.saveTokens(tokens);
    this.savePermissions(permissions);
  }

  clearAllData(): void {
    this.clearTokens();
    this.clearUserData();
    this.clearPermissions();
  }

  // Check if user is logged in
  isLoggedIn(): boolean {
    const accessToken = this.getAccessToken();
    const userData = this.getUserData();
    return !!(accessToken && userData);
  }

  // Get current user role
  getCurrentUserRole(): string | null {
    const userData = this.getUserData();
    return userData ? userData.user_type : null;
  }

  // Get current tenant ID
  getCurrentTenantId(): number | null {
    const userData = this.getUserData();
    return userData ? userData.tenant_id || null : null;
  }

  // Check if user has specific permission
  hasPermission(permission: string): boolean {
    const permissions = this.getPermissions();
    return permissions.includes(permission);
  }
}
