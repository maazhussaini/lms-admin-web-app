/**
 * Token management utility for handling JWT authentication tokens
 * Provides secure storage, retrieval, and validation of access and refresh tokens
 */

import { jwtDecode } from 'jwt-decode';
import { apiClient } from '@/api/client';
import { TRefreshTokenResponse } from '@shared/types/api.types';

// Storage keys
const ACCESS_TOKEN_KEY = 'student_access_token';
const REFRESH_TOKEN_KEY = 'student_refresh_token';
const TOKEN_EXPIRY_KEY = 'student_token_expiry';

// Token structure interface for type safety
interface DecodedToken {
  exp: number;
  iat: number;
  id: number;
  email: string;
  tenantId: number;
  role: string;
  user_type: string;
  permissions?: string[];
  type: 'access' | 'refresh';
  [key: string]: any;
}

/**
 * Store access token in local storage
 * @param token Access token string
 * @param expiresIn Expiration time in seconds
 */
export const storeAccessToken = (token: string, expiresIn: number): void => {
  localStorage.setItem(ACCESS_TOKEN_KEY, token);
  
  // Calculate and store token expiry timestamp
  const expiryTime = Date.now() + expiresIn * 1000;
  localStorage.setItem(TOKEN_EXPIRY_KEY, expiryTime.toString());
};

/**
 * Store refresh token in local storage
 * @param token Refresh token string
 */
export const storeRefreshToken = (token: string): void => {
  localStorage.setItem(REFRESH_TOKEN_KEY, token);
};

/**
 * Get access token from local storage
 * @returns Access token string or null if not found
 */
export const getAccessToken = (): string | null => {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
};

/**
 * Get refresh token from local storage
 * @returns Refresh token string or null if not found
 */
export const getRefreshToken = (): string | null => {
  return localStorage.getItem(REFRESH_TOKEN_KEY);
};

/**
 * Get token expiration timestamp
 * @returns Expiration timestamp or null if not found
 */
export const getTokenExpiry = (): number | null => {
  const expiry = localStorage.getItem(TOKEN_EXPIRY_KEY);
  return expiry ? parseInt(expiry, 10) : null;
};

/**
 * Check if access token is valid and not expired
 * @returns Boolean indicating if token is valid
 */
export const isTokenValid = (): boolean => {
  const token = getAccessToken();
  if (!token) return false;
  
  try {
    const decoded = jwtDecode<DecodedToken>(token);
    const currentTime = Date.now() / 1000;
    
    // Check if token has expired
    if (decoded.exp < currentTime) {
      return false;
    }
    
    // Verify this is an access token, not a refresh token
    if (decoded.type !== 'access') {
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error decoding token:', error);
    return false;
  }
};

/**
 * Check if token is about to expire within the given threshold
 * @param thresholdSeconds Time in seconds to consider token as about to expire
 * @returns Boolean indicating if token needs refresh
 */
export const isTokenExpiringSoon = (thresholdSeconds = 300): boolean => {
  const token = getAccessToken();
  if (!token) return false;
  
  try {
    const decoded = jwtDecode<DecodedToken>(token);
    const currentTime = Date.now() / 1000;
    const timeUntilExpiry = decoded.exp - currentTime;
    
    return timeUntilExpiry > 0 && timeUntilExpiry <= thresholdSeconds;
  } catch (error) {
    console.error('Error checking token expiry:', error);
    return false;
  }
};

/**
 * Decode access token without verification
 * @warning This does not verify the token signature, only decodes the payload
 * @returns Decoded token payload or null if invalid
 */
export const decodeToken = (): DecodedToken | null => {
  const token = getAccessToken();
  if (!token) return null;
  
  try {
    return jwtDecode<DecodedToken>(token);
  } catch (error) {
    console.error('Error decoding token:', error);
    return null;
  }
};

/**
 * Refresh the access token using refresh token
 * @returns Object containing success status and optional error message
 */
export const refreshToken = async (): Promise<{ success: boolean; error?: string }> => {
  const refreshToken = getRefreshToken();
  
  if (!refreshToken) {
    return { success: false, error: 'No refresh token available' };
  }
  
  try {
    // Call the API to refresh the token
    const response = await apiClient.post<TRefreshTokenResponse>(
      '/student/auth/refresh',
      { refreshToken },
      { withAuth: false }
    );
    
    // Store the new access token
    storeAccessToken(response.access_token, response.expires_in);
    
    return { success: true };
  } catch (error) {
    console.error('Failed to refresh token:', error);
    
    // Clear tokens on refresh failure
    clearTokens();
    
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error refreshing token'
    };
  }
};

/**
 * Clear all authentication tokens from storage
 */
export const clearTokens = (): void => {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(TOKEN_EXPIRY_KEY);
};

/**
 * Initialize token refresh interceptor
 * Sets up periodic checks for token expiry and auto-refresh
 * @param refreshCallback Optional callback to execute after successful refresh
 */
export const initTokenRefreshInterceptor = (
  refreshCallback?: () => void
): { stopInterceptor: () => void } => {
  // Check token every minute
  const intervalId = window.setInterval(async () => {
    if (isTokenExpiringSoon()) {
      console.log('Token is expiring soon, refreshing...');
      const result = await refreshToken();
      
      if (result.success && refreshCallback) {
        refreshCallback();
      }
    }
  }, 60000); // Check every minute

  // Return function to stop the interceptor
  return {
    stopInterceptor: () => {
      window.clearInterval(intervalId);
    }
  };
};

/**
 * Get permissions from the current token
 * @returns Array of permission strings or empty array if none
 */
export const getTokenPermissions = (): string[] => {
  const decoded = decodeToken();
  return decoded?.permissions || [];
};

/**
 * Extract user ID from token
 * @returns User ID from token or null if not found
 */
export const getUserIdFromToken = (): number | null => {
  const decoded = decodeToken();
  return decoded?.id || null;
};

/**
 * Extract tenant ID from token
 * @returns Tenant ID from token or null if not found
 */
export const getTenantIdFromToken = (): number | null => {
  const decoded = decodeToken();
  return decoded?.tenantId || null;
};

/**
 * Get token remaining time in seconds
 * @returns Seconds until token expires or 0 if expired/invalid
 */
export const getTokenRemainingTime = (): number => {
  const token = getAccessToken();
  if (!token) return 0;
  
  try {
    const decoded = jwtDecode<DecodedToken>(token);
    const currentTime = Date.now() / 1000;
    const remaining = decoded.exp - currentTime;
    
    return remaining > 0 ? Math.floor(remaining) : 0;
  } catch (error) {
    return 0;
  }
};
