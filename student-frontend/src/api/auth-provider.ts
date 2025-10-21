/**
 * @file api/auth-provider.ts
 * @description Authentication provider for API client - breaks circular dependencies
 */

import { IApiAuthProvider } from '@/api/interfaces';
import { ITokenManager } from '@/types/auth.types';
import { TAuthResponse } from '@shared/types/api.types';

/**
 * API Authentication Provider
 * Handles auth concerns for API client without circular dependencies
 */
export class ApiAuthProvider implements IApiAuthProvider {
  private tokenManager: ITokenManager;
  private refreshEndpoint: string;
  private onAuthFailure?: () => void;

  constructor(
    tokenManager: ITokenManager,
    refreshEndpoint: string = '/auth/student/refresh',
    onAuthFailure?: () => void
  ) {
    this.tokenManager = tokenManager;
    this.refreshEndpoint = refreshEndpoint;
    this.onAuthFailure = onAuthFailure;
  }

  async getAuthToken(): Promise<string | null> {
    const token = await this.tokenManager.getAccessToken();
    if (!token) {
      console.debug('No access token available');
      return null;
    }
    
    // Check if token is valid
    const isValid = await this.tokenManager.isTokenValid();
    if (!isValid) {
      console.log('Access token is invalid or expired, attempting refresh...');
      const refreshed = await this.refreshAuthToken();
      if (refreshed) {
        console.log('Token refreshed successfully');
        return await this.tokenManager.getAccessToken();
      } else {
        console.error('Token refresh failed - authentication required');
        return null;
      }
    }
    
    // If token is about to expire, try to refresh it proactively
    if (await this.tokenManager.isTokenExpiringSoon(300)) { // 5 minutes
      console.log('Token expiring soon, refreshing proactively...');
      const refreshed = await this.refreshAuthToken();
      if (refreshed) {
        console.log('Proactive token refresh successful');
        return await this.tokenManager.getAccessToken();
      }
      // If refresh fails but token is still valid, return the current token
      console.warn('Proactive refresh failed, but current token is still valid');
    }
    
    return token;
  }

  async refreshAuthToken(): Promise<boolean> {
    const refreshToken = await this.tokenManager.getRefreshToken();
    
    if (!refreshToken) {
      console.warn('No refresh token available - authentication required');
      await this.clearAuth();
      return false;
    }
    
    try {
      // Use fetch directly to avoid circular dependency with API client
      const response = await fetch(`${this.getApiBaseUrl()}${this.refreshEndpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken }),
      });

      if (!response.ok) {
        // Check if this is an authentication error
        if (response.status === 401 || response.status === 403) {
          console.error('Refresh token is invalid or expired - clearing authentication');
          await this.clearAuth();
          return false;
        }
        throw new Error(`HTTP error ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success && data.data) {
        const authData = data.data as TAuthResponse;
        
        // Store both access and refresh tokens
        await this.tokenManager.storeAccessToken(authData.tokens.access_token, authData.tokens.expires_in);
        await this.tokenManager.storeRefreshToken(authData.tokens.refresh_token);
        
        // Also update user data in local storage
        const storableAuthData = {
          user: authData.user,
          permissions: authData.permissions
        };
        localStorage.setItem('student_auth_data', JSON.stringify(storableAuthData));
        
        console.log('Token refreshed successfully');
        return true;
      }
      
      console.error('Token refresh response missing required data');
      await this.clearAuth();
      return false;
    } catch (error) {
      console.error('Failed to refresh token:', error);
      await this.clearAuth();
      return false;
    }
  }

  async onAuthError(error: any): Promise<boolean> {
    console.warn('Authentication error detected:', error);
    
    // For 401 errors, try to refresh the token
    if (error.statusCode === 401) {
      console.log('Attempting token refresh due to 401 error...');
      try {
        const refreshSuccess = await this.refreshAuthToken();
        if (refreshSuccess) {
          console.log('Token refresh successful after auth error');
          return true;
        } else {
          console.error('Token refresh failed after auth error');
          return false;
        }
      } catch (refreshError) {
        console.error('Exception during token refresh:', refreshError);
        return false;
      }
    }
    
    // For other auth errors (403, etc.), don't attempt refresh
    console.warn('Non-recoverable auth error:', error.statusCode);
    return false;
  }

  async clearAuth(): Promise<void> {
    await this.tokenManager.clearTokens();
    if (this.onAuthFailure) {
      this.onAuthFailure();
    }
  }

  private getApiBaseUrl(): string {
    return import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1';
  }
}
