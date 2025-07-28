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
    if (!token) return null;
    
    // If token is about to expire, try to refresh it
    if (await this.tokenManager.isTokenExpiringSoon(300)) { // 5 minutes
      const refreshed = await this.refreshAuthToken();
      if (refreshed) {
        return await this.tokenManager.getAccessToken();
      }
      return null;
    }
    
    return token;
  }

  async refreshAuthToken(): Promise<boolean> {
    const refreshToken = await this.tokenManager.getRefreshToken();
    
    if (!refreshToken) {
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
        throw new Error(`HTTP error ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success && data.data) {
        const authData = data.data as TAuthResponse;
        // Store both access and refresh tokens
        await this.tokenManager.storeAccessToken(authData.tokens.access_token, authData.tokens.expires_in);
        await this.tokenManager.storeRefreshToken(authData.tokens.refresh_token);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Failed to refresh token:', error);
      await this.clearAuth();
      return false;
    }
  }

  async onAuthError(error: any): Promise<boolean> {
    if (error.statusCode === 401 && error.errorCode === 'TOKEN_EXPIRED') {
      try {
        return await this.refreshAuthToken();
      } catch {
        return false;
      }
    }
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
