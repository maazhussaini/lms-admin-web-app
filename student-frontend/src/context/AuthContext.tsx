import React, { createContext, useContext, useState, useEffect } from 'react';
import { TAuthResponse, UserType } from '@shared/types/api.types';
import { 
  getStoredAuthData, 
  checkIsAuthenticated,
  clearAuthData
} from '@/services/authService';
import { apiEvents, API_EVENTS } from '@/api/interfaces';

/**
 * Authentication context state interface
 */
interface AuthContextState {
  user: TAuthResponse['user'] | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  permissions: string[];
  login: (email: string, password: string, tenantContext?: string) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
}

/**
 * Default context state
 */
const defaultAuthContext: AuthContextState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
  permissions: [],
  login: async () => {},
  logout: async () => {},
  clearError: () => {}
};

/**
 * Create the authentication context
 */
const AuthContext = createContext<AuthContextState>(defaultAuthContext);

/**
 * Hook for using the auth context
 */
export const useAuth = () => useContext(AuthContext);

/**
 * Authentication provider component
 */
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<TAuthResponse['user'] | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [permissions, setPermissions] = useState<string[]>([]);

  /**
   * Initialize authentication state from local storage
   */
  useEffect(() => {
    const initAuth = async () => {
      try {
        setIsLoading(true);
        
        // Check if user is already authenticated
        const isValid = await checkIsAuthenticated();
        
        if (isValid) {
          // Get stored auth data
          const authData = await getStoredAuthData();
          
          if (authData) {
            setUser(authData.user);
            setPermissions(authData.permissions || []);
            setIsAuthenticated(true);
          } else {
            // If auth data is missing, clear everything
            await clearAuthData();
            setIsAuthenticated(false);
          }
        } else {
          setIsAuthenticated(false);
        }
      } catch (err) {
        console.error('Auth initialization error:', err);
        setIsAuthenticated(false);
        await clearAuthData();
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();

    // Listen for auth events to stay in sync
    const handleAuthError = async () => {
      console.warn('Authentication error detected - clearing auth state and redirecting to login');
      
      // Clear all authentication state
      setIsAuthenticated(false);
      setUser(null);
      setPermissions([]);
      setError('Your session has expired. Please log in again.');
      
      // Clear stored auth data
      await clearAuthData();
      
      // Redirect to login page after a short delay to let the user see the message
      setTimeout(() => {
        window.location.href = '/login';
      }, 1500);
    };

    apiEvents.on(API_EVENTS.AUTH_ERROR, handleAuthError);

    return () => {
      apiEvents.off(API_EVENTS.AUTH_ERROR, handleAuthError);
    };
  }, []);

  /**
   * Login function - uses dynamic import to avoid circular dependency
   */
  const login = async (email: string, password: string, tenantContext?: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Dynamic import to avoid circular dependency
      const { getAuthService } = await import('@/api');
      const authService = getAuthService();
      const authResponse = await authService.login(email, password, tenantContext);
      
      // Verify this is a student account
      if (authResponse.user.user_type !== UserType.STUDENT) {
        throw new Error('This login is only for student accounts');
      }
      
      setUser(authResponse.user);
      setPermissions(authResponse.permissions || []);
      setIsAuthenticated(true);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Login failed';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Logout function - uses dynamic import to avoid circular dependency
   */
  const logout = async () => {
    try {
      setIsLoading(true);
      // Dynamic import to avoid circular dependency
      const { getAuthService } = await import('@/api');
      const authService = getAuthService();
      await authService.logout();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      // Always clear the state regardless of API success
      setUser(null);
      setPermissions([]);
      setIsAuthenticated(false);
      setIsLoading(false);
    }
  };

  /**
   * Clear error function
   */
  const clearError = () => {
    setError(null);
  };

  /**
   * Context value
   */
  const contextValue: AuthContextState = {
    user,
    isAuthenticated,
    isLoading,
    error,
    permissions,
    login,
    logout,
    clearError
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
