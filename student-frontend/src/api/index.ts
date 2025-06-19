/**
 * @file api/index.ts
 * @description API initialization and dependency wiring without circular dependencies
 */

import { apiClient } from './client';
import { apiClientWithMeta } from './client-with-meta';
import { createTokenManager, configureTokenStorage } from '@/utils/tokenManagement';
import { ApiAuthProvider } from './auth-provider';
import { AuthService } from '@/services/authService';
import { setAuthProvider, setApiLogger, setInterceptorManager } from './client-utils';
import { interceptorManager } from './interceptors';
import { apiLogger } from './logger';
import { apiEvents, API_EVENTS } from './interfaces';

let isInitialized = false;
let authService: AuthService;

/**
 * Initialize the API system with proper dependency injection
 */
export const initializeApi = (): void => {
  if (isInitialized) {
    return;
  }

  try {
    // Create token manager
    const tokenManager = createTokenManager();

    // Create auth provider
    const authProvider = new ApiAuthProvider(
      tokenManager,
      '/auth/student/refresh',
      () => {
        // Handle auth failure - emit event instead of direct dependency
        apiEvents.emit(API_EVENTS.AUTH_ERROR, {
          message: 'Authentication failed, clearing auth state',
          timestamp: new Date().toISOString()
        });
      }
    );

    // Inject dependencies into client utils
    setAuthProvider(authProvider);
    setApiLogger(apiLogger);
    setInterceptorManager(interceptorManager);

    // Create auth service
    authService = new AuthService(apiClient, tokenManager);

    // Set up event listeners for loose coupling
    apiEvents.on(API_EVENTS.AUTH_ERROR, (eventData) => {
      console.warn('Auth error event:', eventData);
      // Handle auth errors without tight coupling
    });

    isInitialized = true;
    console.log('API system initialized successfully');
  } catch (error) {
    console.error('Failed to initialize API system:', error);
    throw error;
  }
};

/**
 * Get auth service instance
 */
export const getAuthService = (): AuthService => {
  if (!isInitialized) {
    throw new Error('API system not initialized. Call initializeApi() first.');
  }
  return authService;
};

/**
 * Check if API system is initialized
 */
export const isApiInitialized = (): boolean => {
  return isInitialized;
};

// Re-export commonly used APIs
export { apiClient, apiClientWithMeta };
export * from './response-utils';
export { configureTokenStorage };
export { apiEvents, API_EVENTS } from './interfaces';
