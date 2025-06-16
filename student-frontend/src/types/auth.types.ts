/**
 * @file auth.types.ts
 * @description Authentication-related types and interfaces
 */

import { TApiErrorResponse } from '@shared/types/api.types';

/**
 * Token information interface
 */
export interface TokenInfo {
  token: string;
  expiresAt: number;
  type: 'access' | 'refresh';
}

/**
 * Authentication status interface
 */
export interface AuthStatus {
  isAuthenticated: boolean;
  user?: {
    id: number;
    email: string;
    full_name: string;
    tenant_id: number;
    user_type: string;
    role: {
      role_name: string;
      role_type?: string;
    };
  };
  permissions?: string[];
}

/**
 * Token manager interface to abstract token operations
 */
export interface ITokenManager {
  storeAccessToken(token: string, expiresIn: number): Promise<void>;
  storeRefreshToken(token: string): Promise<void>;
  getAccessToken(): Promise<string | null>;
  getRefreshToken(): Promise<string | null>;
  isTokenValid(): Promise<boolean>;
  isTokenExpiringSoon(thresholdSeconds?: number): Promise<boolean>;
  refreshToken(refreshFn?: () => Promise<{ success: boolean; error?: string }>): Promise<{ success: boolean; error?: string }>;

  clearTokens(): Promise<void>;
  decodeToken(): Promise<DecodedToken | null>;
  getUserIdFromToken(): Promise<number | null>;
  getTenantIdFromToken(): Promise<number | null>;
  getTokenRemainingTime(): Promise<number>;
  getTokenPermissions(): Promise<string[]>;
}

/**
 * Decoded token structure
 */
export interface DecodedToken {
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
 * Authentication service interface
 */
export interface IAuthService {
  login(email: string, password: string, tenantContext?: string): Promise<any>;
  logout(): Promise<void>;
  requestPasswordReset(email: string): Promise<void>;
  resetPassword(token: string, newPassword: string): Promise<void>;
  getAuthStatus(): Promise<AuthStatus>;
  validateToken(token: string): Promise<boolean>;
}

/**
 * API client auth provider interface
 */
export interface IApiAuthProvider {
  getAuthToken(): Promise<string | null>;
  refreshAuthToken(): Promise<boolean>;
  onAuthError(error: any): Promise<boolean>;
  clearAuth(): Promise<void>;
}

/**
 * Auth error types
 */
export class AuthError extends Error {
  public code: string;
  public retryable: boolean;

  constructor(message: string, code: string, retryable: boolean = false) {
    super(message);
    this.name = 'AuthError';
    this.code = code;
    this.retryable = retryable;
  }
}

/**
 * Timeout error for API requests
 */
export class TimeoutError extends Error {
  constructor(timeout: number) {
    super(`Request timed out after ${timeout}ms`);
    this.name = 'TimeoutError';
  }
}

/**
 * API Error class for handling API response errors
 */
export class ApiError extends Error {
  statusCode: number;
  errorCode?: string;
  details?: Record<string, string[]>;
  correlationId?: string;

  constructor(response: TApiErrorResponse) {
    super(response.message);
    this.name = 'ApiError';
    this.statusCode = response.statusCode;
    this.errorCode = response.errorCode;
    this.details = response.details;
    this.correlationId = response.correlationId;
  }
}

/**
 * Auth configuration
 */
export interface AuthConfig {
  apiBaseUrl: string;
  tokenRefreshThreshold: number;
  maxRetries: number;
  retryDelay: number;
}

/**
 * Storage strategy types
 */
export type StorageStrategy = 'localStorage' | 'sessionStorage' | 'memory';

/**
 * Security level configuration
 */
export type SecurityLevel = 'low' | 'medium' | 'high';

/**
 * Token storage configuration
 */
export interface TokenStorageConfig {
  strategy: StorageStrategy;
  securityLevel: SecurityLevel;
  encryptTokens: boolean;
  autoCleanup: boolean;
  maxAge?: number; // in milliseconds
}
