import { TAuthResponse, TRefreshTokenResponse } from '@shared/types/api.types';
import { IAuthService, AuthError, AuthStatus, ITokenManager } from '@/types/auth.types';
import { IApiClient } from '@/api/interfaces';
import { 
  storeAccessToken, 
  storeRefreshToken, 
  getAccessToken, 
  isTokenValid, 
  clearTokens,
  initTokenRefreshInterceptor
} from '@/utils/tokenManagement';

// Local storage keys
const AUTH_DATA_KEY = 'student_auth_data';

/**
 * Retry configuration for auth operations
 */
interface RetryConfig {
  maxRetries: number;
  baseDelay: number;
  maxDelay: number;
  backoffMultiplier: number;
}

const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  baseDelay: 1000, // 1 second
  maxDelay: 10000, // 10 seconds
  backoffMultiplier: 2
};

/**
 * Utility function to implement exponential backoff with jitter
 */
const calculateBackoffDelay = (
  attempt: number, 
  config: RetryConfig = DEFAULT_RETRY_CONFIG
): number => {
  const exponentialDelay = config.baseDelay * Math.pow(config.backoffMultiplier, attempt - 1);
  const clampedDelay = Math.min(exponentialDelay, config.maxDelay);
  
  // Add jitter to prevent thundering herd
  const jitter = Math.random() * 0.1 * clampedDelay;
  return clampedDelay + jitter;
};

/**
 * Generic retry wrapper with exponential backoff
 */
const withRetry = async <T>(
  operation: () => Promise<T>,
  config: RetryConfig = DEFAULT_RETRY_CONFIG,
  isRetryable: (error: any) => boolean = () => true
): Promise<T> => {
  let lastError: Error;
  
  for (let attempt = 1; attempt <= config.maxRetries + 1; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      
      // Don't retry on the last attempt or if error is not retryable
      if (attempt > config.maxRetries || !isRetryable(error)) {
        throw lastError;
      }
      
      const delay = calculateBackoffDelay(attempt, config);
      console.warn(`Auth operation failed (attempt ${attempt}/${config.maxRetries}), retrying in ${delay}ms:`, lastError.message);
      
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError!;
};

/**
 * Check if an error is retryable based on its characteristics
 */
const isRetryableError = (error: any): boolean => {
  // Network errors are retryable
  if (error instanceof TypeError && error.message.includes('fetch')) {
    return true;
  }
  
  // Timeout errors are retryable
  if (error.name === 'TimeoutError') {
    return true;
  }
  
  // 5xx server errors are retryable
  if (error.statusCode >= 500) {
    return true;
  }
  
  // Rate limiting is retryable
  if (error.statusCode === 429) {
    return true;
  }
  
  // Auth-specific retryable errors
  if (error.code === 'TOKEN_REFRESH_FAILED' || error.code === 'NETWORK_ERROR') {
    return true;
  }
  
  // 4xx client errors (except 401, 403) are generally not retryable
  return false;
};

/**
 * Authentication service implementation
 */
export class AuthService implements IAuthService {
  private apiClient: IApiClient;
  private tokenManager: ITokenManager;

  constructor(apiClient: IApiClient, tokenManager: ITokenManager) {
    this.apiClient = apiClient;
    this.tokenManager = tokenManager;
  }

  /**
   * Enhanced login with retry logic and better error handling
   */
  async login(email: string, password: string, tenantContext?: string): Promise<TAuthResponse> {
    return withRetry(
      async () => {
        try {
          const authResponse = await this.apiClient.post<TAuthResponse>(
            '/auth/student/login', 
            { email_address: email, password, tenant_context: tenantContext },
            { withAuth: false }
          );
          
          // Store authentication data
          await this.storeAuthData(authResponse);
          
          return authResponse;
        } catch (error: any) {
          // Transform API errors into auth-specific errors
          if (error.statusCode === 401) {
            throw new AuthError('Invalid credentials', 'INVALID_CREDENTIALS', false);
          } else if (error.statusCode === 403) {
            throw new AuthError('Account is disabled or not verified', 'ACCOUNT_DISABLED', false);
          } else if (error.statusCode === 404) {
            throw new AuthError('Account not found', 'ACCOUNT_NOT_FOUND', false);
          } else if (error.statusCode === 429) {
            throw new AuthError('Too many login attempts. Please try again later.', 'RATE_LIMITED', true);
          } else if (error.statusCode >= 500) {
            throw new AuthError('Server error during login', 'SERVER_ERROR', true);
          } else if (error.name === 'TimeoutError') {
            throw new AuthError('Login request timed out', 'TIMEOUT', true);
          } else {
            throw new AuthError(error.message || 'Login failed', 'UNKNOWN_ERROR', true);
          }
        }
      },
      DEFAULT_RETRY_CONFIG,
      isRetryableError
    );
  }

  /**
   * Enhanced logout with retry logic for critical cleanup
   */
  async logout(): Promise<void> {
    const performLogout = async () => {
      const token = await this.tokenManager.getAccessToken();
      if (token) {
        try {
          await this.apiClient.post('/auth/student/logout', {});
        } catch (error: any) {
          // Log the error but don't prevent local cleanup
          console.error('Server logout failed:', error);
          
          // Only throw if it's a retryable error and we want to retry
          if (isRetryableError(error)) {
            throw new AuthError('Failed to logout from server', 'LOGOUT_SERVER_ERROR', true);
          }
        }
      }
    };
    
    try {
      // Try to logout from server with retry logic
      await withRetry(
        performLogout,
        { ...DEFAULT_RETRY_CONFIG, maxRetries: 2 }, // Fewer retries for logout
        isRetryableError
      );
    } catch (error) {
      console.warn('Server logout failed after retries, proceeding with local cleanup:', error);
    } finally {
      // Always clear local auth data regardless of server response
      await this.clearAuthData();
    }
  }

  /**
   * Enhanced password reset request with retry logic
   */
  async requestPasswordReset(email: string): Promise<void> {
    return withRetry(
      async () => {
        try {
          await this.apiClient.post(
            '/auth/student/forgot-password', 
            { email_address: email },
            { withAuth: false }
          );
        } catch (error: any) {
          if (error.statusCode === 404) {
            throw new AuthError('Email address not found', 'EMAIL_NOT_FOUND', false);
          } else if (error.statusCode === 429) {
            throw new AuthError('Too many reset requests. Please try again later.', 'RATE_LIMITED', true);
          } else if (error.statusCode >= 500) {
            throw new AuthError('Server error during password reset request', 'SERVER_ERROR', true);
          } else {
            throw new AuthError(error.message || 'Password reset request failed', 'UNKNOWN_ERROR', true);
          }
        }
      },
      DEFAULT_RETRY_CONFIG,
      isRetryableError
    );
  }

  /**
   * Enhanced password reset with retry logic
   */
  async resetPassword(token: string, newPassword: string): Promise<void> {
    return withRetry(
      async () => {
        try {
          await this.apiClient.post(
            '/auth/student/reset-password',
            { token, newPassword },
            { withAuth: false }
          );
        } catch (error: any) {
          if (error.statusCode === 400 || error.statusCode === 401) {
            throw new AuthError('Invalid or expired reset token', 'INVALID_RESET_TOKEN', false);
          } else if (error.statusCode === 422) {
            throw new AuthError('Password does not meet requirements', 'INVALID_PASSWORD', false);
          } else if (error.statusCode >= 500) {
            throw new AuthError('Server error during password reset', 'SERVER_ERROR', true);
          } else {
            throw new AuthError(error.message || 'Password reset failed', 'UNKNOWN_ERROR', true);
          }
        }
      },
      DEFAULT_RETRY_CONFIG,
      isRetryableError
    );
  }

  /**
   * Get current authentication status
   */
  async getAuthStatus(): Promise<AuthStatus> {
    try {
      const isAuthenticated = await this.checkIsAuthenticated();
      if (!isAuthenticated) {
        return { isAuthenticated: false };
      }

      const authData = await this.getStoredAuthData();
      if (!authData) {
        return { isAuthenticated: false };
      }

      return {
        isAuthenticated: true,
        user: authData.user,
        permissions: authData.permissions
      };
    } catch (error) {
      console.error('Error getting auth status:', error);
      return { isAuthenticated: false };
    }
  }

  /**
   * Enhanced token validation with retry logic
   */
  async validateToken(token: string): Promise<boolean> {
    try {
      await withRetry(
        async () => {
          await this.apiClient.post('/auth/student/validate-token', { token }, { withAuth: false });
        },
        { ...DEFAULT_RETRY_CONFIG, maxRetries: 1 }, // Limited retries for validation
        isRetryableError
      );
      return true;
    } catch (error) {
      console.error('Token validation failed:', error);
      return false;
    }
  }

  /**
   * Enhanced token refresh with comprehensive retry logic and circuit breaker pattern
   */
  private async refreshAuthToken(): Promise<boolean> {
    // Circuit breaker state
    const circuitBreakerKey = 'auth_refresh_circuit_breaker';
    const failureThreshold = 5;
    const resetTimeout = 300000; // 5 minutes
    
    // Check circuit breaker state
    const circuitState = JSON.parse(localStorage.getItem(circuitBreakerKey) || '{"failures": 0, "lastFailure": 0, "isOpen": false}');
    
    // If circuit is open, check if we should try again
    if (circuitState.isOpen) {
      const timeSinceLastFailure = Date.now() - circuitState.lastFailure;
      if (timeSinceLastFailure < resetTimeout) {
        console.warn('Token refresh circuit breaker is open, skipping refresh attempt');
        return false;
      } else {
        // Reset circuit breaker
        circuitState.isOpen = false;
        circuitState.failures = 0;
        localStorage.setItem(circuitBreakerKey, JSON.stringify(circuitState));
      }
    }
    
    try {
      const refreshToken = await this.tokenManager.getRefreshToken();
      if (!refreshToken) {
        return false;
      }

      const response = await this.apiClient.post<TRefreshTokenResponse>(
        '/auth/student/refresh',
        { refreshToken },
        { withAuth: false }
      );

      await this.tokenManager.storeAccessToken(response.access_token, response.expires_in);
      
      // Reset circuit breaker on success
      if (circuitState.failures > 0) {
        circuitState.failures = 0;
        circuitState.isOpen = false;
        localStorage.setItem(circuitBreakerKey, JSON.stringify(circuitState));
      }
      
      return true;
    } catch (error) {
      console.error('Token refresh failed after retries:', error);
      
      // Update circuit breaker state
      circuitState.failures++;
      circuitState.lastFailure = Date.now();
      
      if (circuitState.failures >= failureThreshold) {
        circuitState.isOpen = true;
        console.warn('Token refresh circuit breaker opened due to repeated failures');
      }
      
      localStorage.setItem(circuitBreakerKey, JSON.stringify(circuitState));
      
      // If refresh token is invalid, clear all auth data
      if (error instanceof AuthError && error.code === 'INVALID_REFRESH_TOKEN') {
        await this.clearAuthData();
      }
      
      return false;
    }
  }

  /**
   * Enhanced authentication check with fallback mechanisms
   */
  private async checkIsAuthenticated(): Promise<boolean> {
    try {
      // First check if the token is valid
      if (!(await this.tokenManager.isTokenValid())) {
        // If not valid, try to refresh it
        const refreshed = await this.refreshAuthToken();
        if (!refreshed) {
          // If refresh failed, clear auth data and return false
          await this.clearAuthData();
          return false;
        }
      }
      
      return true;
    } catch (error) {
      console.error('Authentication check failed:', error);
      // Clear potentially corrupted auth data
      await this.clearAuthData();
      return false;
    }
  }

  /**
   * Get stored authentication data with error recovery
   */
  private async getStoredAuthData(): Promise<{
    user: TAuthResponse['user'];
    permissions: string[];
  } | null> {
    try {
      const authDataJson = localStorage.getItem(AUTH_DATA_KEY);
      if (!authDataJson) return null;
      
      return JSON.parse(authDataJson);
    } catch (error) {
      console.error('Error parsing stored auth data:', error);
      // Clear corrupted data
      localStorage.removeItem(AUTH_DATA_KEY);
      return null;
    }
  }

  /**
   * Enhanced auth data storage with error handling
   */
  private async storeAuthData(authResponse: TAuthResponse): Promise<void> {
    try {
      // Store tokens using the token manager
      await this.tokenManager.storeAccessToken(authResponse.tokens.access_token, authResponse.tokens.expires_in);
      await this.tokenManager.storeRefreshToken(authResponse.tokens.refresh_token);
      
      // Store user data and permissions separately
      const storableAuthData = {
        user: authResponse.user,
        permissions: authResponse.permissions
      };
      localStorage.setItem(AUTH_DATA_KEY, JSON.stringify(storableAuthData));
    } catch (error) {
      console.error('Error storing auth data:', error);
      throw new AuthError('Failed to store authentication data', 'STORAGE_ERROR', false);
    }
  }

  /**
   * Enhanced auth data clearing with comprehensive cleanup
   */
  private async clearAuthData(): Promise<void> {
    try {
      await this.tokenManager.clearTokens();
      localStorage.removeItem(AUTH_DATA_KEY);
      
      // Clear circuit breaker state
      localStorage.removeItem('auth_refresh_circuit_breaker');
      
      // Clear any other auth-related data
      ['student_auth_data', 'student_token_expiry', 'student_storage_config'].forEach(key => {
        localStorage.removeItem(key);
      });
    } catch (error) {
      console.error('Error clearing auth data:', error);
      // Force clear by removing items individually
      try {
        localStorage.removeItem(AUTH_DATA_KEY);
        localStorage.removeItem('auth_refresh_circuit_breaker');
      } catch (clearError) {
        console.error('Failed to force clear auth data:', clearError);
      }
    }
  }
}

// Standalone utility functions for backward compatibility
// These should be deprecated in favor of using AuthService instances

/**
 * Enhanced authentication check with fallback mechanisms
 */
export const checkIsAuthenticated = async (): Promise<boolean> => {
  try {
    // First check if the token is valid
    if (!(await isTokenValid())) {
      // Clear auth data and return false since we can't refresh without service instance
      await clearAuthData();
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Authentication check failed:', error);
    // Clear potentially corrupted auth data
    await clearAuthData();
    return false;
  }
};

/**
 * Get stored authentication data with error recovery
 */
export const getStoredAuthData = async (): Promise<{
  user: TAuthResponse['user'];
  permissions: string[];
} | null> => {
  try {
    const authDataJson = localStorage.getItem(AUTH_DATA_KEY);
    if (!authDataJson) return null;
    
    return JSON.parse(authDataJson);
  } catch (error) {
    console.error('Error parsing stored auth data:', error);
    // Clear corrupted data
    localStorage.removeItem(AUTH_DATA_KEY);
    return null;
  }
};

/**
 * Enhanced auth data storage with error handling
 */
export const storeAuthData = async (authResponse: TAuthResponse): Promise<void> => {
  try {
    // Store tokens using the token management utility
    await storeAccessToken(authResponse.tokens.access_token, authResponse.tokens.expires_in);
    await storeRefreshToken(authResponse.tokens.refresh_token);
    
    // Store user data and permissions separately
    const storableAuthData = {
      user: authResponse.user,
      permissions: authResponse.permissions
    };
    localStorage.setItem(AUTH_DATA_KEY, JSON.stringify(storableAuthData));
  } catch (error) {
    console.error('Error storing auth data:', error);
    throw new AuthError('Failed to store authentication data', 'STORAGE_ERROR', false);
  }
};

/**
 * Enhanced auth data clearing with comprehensive cleanup
 */
export const clearAuthData = async (): Promise<void> => {
  try {
    await clearTokens();
    localStorage.removeItem(AUTH_DATA_KEY);
    
    // Clear circuit breaker state
    localStorage.removeItem('auth_refresh_circuit_breaker');
    
    // Clear any other auth-related data
    ['student_auth_data', 'student_token_expiry', 'student_storage_config'].forEach(key => {
      localStorage.removeItem(key);
    });
  } catch (error) {
    console.error('Error clearing auth data:', error);
    // Force clear by removing items individually
    try {
      localStorage.removeItem(AUTH_DATA_KEY);
      localStorage.removeItem('auth_refresh_circuit_breaker');
    } catch (clearError) {
      console.error('Failed to force clear auth data:', clearError);
    }
  }
};

/**
 * Recovery function to attempt to restore authentication state
 */
export const recoverAuthState = async (): Promise<boolean> => {
  try {
    // Check if we have any stored tokens
    const hasTokens = await getAccessToken() !== null;
    if (!hasTokens) {
      return false;
    }
    
    // Validate current authentication state
    const isAuthenticated = await checkIsAuthenticated();
    if (isAuthenticated) {
      // Re-initialize token refresh monitoring
      initTokenRefreshInterceptor();
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Auth state recovery failed:', error);
    await clearAuthData();
    return false;
  }
};
