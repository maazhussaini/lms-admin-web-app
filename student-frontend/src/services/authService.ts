import { TAuthResponse } from '@shared/types/api.types';
import { apiClient } from '@/api/client';
import {
  storeAccessToken,
  storeRefreshToken,
  getAccessToken,
  isTokenValid,
  isTokenExpiringSoon,
  refreshToken,
  clearTokens,
  initTokenRefreshInterceptor
} from '@/utils/tokenManagement';

// Local storage keys
const AUTH_DATA_KEY = 'student_auth_data';

/**
 * Login student with email and password
 */
export const loginStudent = async (
  email: string, 
  password: string, 
  tenantContext?: string
): Promise<TAuthResponse> => {
  const authResponse = await apiClient.post<TAuthResponse>(
    '/auth/student/login', 
    { email_address: email, password, tenant_context: tenantContext },
    { withAuth: false }
  );
  
  // Store authentication data
  await storeAuthData(authResponse);
  
  // Initialize token refresh monitoring
  initTokenRefreshInterceptor();
  
  return authResponse;
};

/**
 * Logout student and invalidate tokens
 */
export const logoutStudent = async (): Promise<void> => {
  try {
    // Call logout API if we have a token
    const token = getAccessToken();
    if (token) {
      await apiClient.post('/auth/student/logout', {});
    }
  } catch (error) {
    console.error('Logout error:', error);
    // Continue with local logout even if API call fails
  } finally {
    // Clear all auth data from storage
    clearAuthData();
  }
};

/**
 * Request password reset link
 */
export const requestPasswordReset = async (email: string): Promise<void> => {
  await apiClient.post(
    '/auth/student/forgot-password', 
    { email_address: email },
    { withAuth: false }
  );
};

/**
 * Reset password with token
 */
export const resetPassword = async (token: string, newPassword: string): Promise<void> => {
  await apiClient.post(
    '/auth/student/reset-password',
    { token, newPassword },
    { withAuth: false }
  );
};

/**
 * Refresh authentication token
 */
export const refreshAuthToken = async (): Promise<boolean> => {
  const result = await refreshToken();
  return result.success;
};

/**
 * Store authentication data in local storage
 */
export const storeAuthData = async (authResponse: TAuthResponse): Promise<void> => {
  // Store tokens using the token management utility
  storeAccessToken(authResponse.tokens.access_token, authResponse.tokens.expires_in);
  storeRefreshToken(authResponse.tokens.refresh_token);
  
  // Store user data and permissions separately
  const storableAuthData = {
    user: authResponse.user,
    permissions: authResponse.permissions
  };
  localStorage.setItem(AUTH_DATA_KEY, JSON.stringify(storableAuthData));
};

/**
 * Get stored authentication token
 */
export const getStoredAuthToken = async (): Promise<string | null> => {
  const token = getAccessToken();
  if (!token) return null;
  
  // If token is about to expire, refresh it
  if (isTokenExpiringSoon(300)) { // 5 minutes
    const refreshed = await refreshAuthToken();
    if (refreshed) {
      return getAccessToken();
    }
    return null;
  }
  
  return token;
};

/**
 * Get stored authentication data
 */
export const getStoredAuthData = async (): Promise<{
  user: TAuthResponse['user'];
  permissions: string[];
} | null> => {
  const authDataJson = localStorage.getItem(AUTH_DATA_KEY);
  if (!authDataJson) return null;
  
  try {
    return JSON.parse(authDataJson);
  } catch (error) {
    console.error('Error parsing stored auth data:', error);
    return null;
  }
};

/**
 * Clear all authentication data from storage
 */
export const clearAuthData = (): void => {
  clearTokens();
  localStorage.removeItem(AUTH_DATA_KEY);
};

/**
 * Check if user is authenticated with valid token
 */
export const checkIsAuthenticated = async (): Promise<boolean> => {
  // First check if the token is valid
  if (!isTokenValid()) {
    // If not valid, try to refresh it
    const refreshed = await refreshAuthToken();
    return refreshed;
  }
  
  // Token is valid
  return true;
};

/**
 * Validate an access token without using it
 */
export const validateToken = async (token: string): Promise<boolean> => {
  try {
    await apiClient.post('/student/auth/validate-token', { token }, { withAuth: false });
    return true;
  } catch (error) {
    return false;
  }
};
