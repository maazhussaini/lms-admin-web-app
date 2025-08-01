/**
 * Token management utility for handling JWT authentication tokens
 * Provides secure storage, retrieval, and validation of access and refresh tokens
 * Now supports multiple storage strategies for enhanced security
 */

import { jwtDecode } from 'jwt-decode';
import { 
  ITokenManager, 
  DecodedToken, 
  SecurityLevel, 
  TokenStorageConfig 
} from '@/types/auth.types';

// Storage keys
const ACCESS_TOKEN_KEY = 'student_access_token';
const REFRESH_TOKEN_KEY = 'student_refresh_token';
const TOKEN_EXPIRY_KEY = 'student_token_expiry';
const STORAGE_CONFIG_KEY = 'student_storage_config';

/**
 * Default storage configuration
 */
const DEFAULT_CONFIG: TokenStorageConfig = {
  strategy: 'sessionStorage', // More secure than localStorage
  securityLevel: 'medium',
  encryptTokens: true,
  autoCleanup: true,
  maxAge: 24 * 60 * 60 * 1000, // 24 hours
};

/**
 * In-memory storage for high security mode
 */
class MemoryStorage {
  private static instance: MemoryStorage;
  private storage: Map<string, string> = new Map();
  private expiry: Map<string, number> = new Map();

  private constructor() {
    // Clear memory storage on page unload for security
    window.addEventListener('beforeunload', () => {
      this.clear();
    });
  }

  static getInstance(): MemoryStorage {
    if (!MemoryStorage.instance) {
      MemoryStorage.instance = new MemoryStorage();
    }
    return MemoryStorage.instance;
  }

  setItem(key: string, value: string, ttl?: number): void {
    this.storage.set(key, value);
    if (ttl) {
      this.expiry.set(key, Date.now() + ttl);
    }
  }

  getItem(key: string): string | null {
    const expiry = this.expiry.get(key);
    if (expiry && Date.now() > expiry) {
      this.removeItem(key);
      return null;
    }
    return this.storage.get(key) || null;
  }

  removeItem(key: string): void {
    this.storage.delete(key);
    this.expiry.delete(key);
  }

  clear(): void {
    this.storage.clear();
    this.expiry.clear();
  }
}

/**
 * Simple encryption utility using Web Crypto API
 */
class TokenEncryption {
  private static readonly ALGORITHM = 'AES-GCM';
  private static encryptionKey: CryptoKey | null = null;

  /**
   * Generate or retrieve encryption key
   */
  private static async getEncryptionKey(): Promise<CryptoKey> {
    if (!this.encryptionKey) {
      // In a real implementation, you might derive this from user credentials
      // For now, we'll generate a session-based key
      const keyData = new TextEncoder().encode(
        `${navigator.userAgent}_${Date.now()}_${Math.random()}`
      ).slice(0, 32);
      
      this.encryptionKey = await crypto.subtle.importKey(
        'raw',
        keyData,
        { name: this.ALGORITHM },
        false,
        ['encrypt', 'decrypt']
      );
    }
    return this.encryptionKey;
  }

  /**
   * Encrypt a token string
   */
  static async encrypt(token: string): Promise<string> {
    try {
      const key = await this.getEncryptionKey();
      const iv = crypto.getRandomValues(new Uint8Array(12));
      const encodedToken = new TextEncoder().encode(token);

      const encrypted = await crypto.subtle.encrypt(
        { name: this.ALGORITHM, iv },
        key,
        encodedToken
      );

      // Combine IV and encrypted data
      const combined = new Uint8Array(iv.length + encrypted.byteLength);
      combined.set(iv);
      combined.set(new Uint8Array(encrypted), iv.length);

      return btoa(String.fromCharCode(...combined));
    } catch (error) {
      console.warn('Token encryption failed, storing as plain text:', error);
      return token;
    }
  }

  /**
   * Decrypt a token string
   */
  static async decrypt(encryptedToken: string): Promise<string> {
    try {
      const key = await this.getEncryptionKey();
      const combined = new Uint8Array(
        atob(encryptedToken).split('').map(char => char.charCodeAt(0))
      );

      const iv = combined.slice(0, 12);
      const encrypted = combined.slice(12);

      const decrypted = await crypto.subtle.decrypt(
        { name: this.ALGORITHM, iv },
        key,
        encrypted
      );

      return new TextDecoder().decode(decrypted);
    } catch (error) {
      console.warn('Token decryption failed, returning as-is:', error);
      return encryptedToken;
    }
  }
}

/**
 * Storage manager that handles different storage strategies
 */
class StorageManager {
  private config: TokenStorageConfig;
  private memoryStorage: MemoryStorage;

  constructor(config: TokenStorageConfig = DEFAULT_CONFIG) {
    this.config = config;
    this.memoryStorage = MemoryStorage.getInstance();
    this.setupAutoCleanup();
  }

  /**
   * Set up automatic cleanup based on configuration
   */
  private setupAutoCleanup(): void {
    if (this.config.autoCleanup) {
      // Clean up expired tokens periodically
      setInterval(() => {
        this.cleanupExpiredTokens();
      }, 60000); // Check every minute

      // Clean up on page visibility change (when user switches tabs)
      document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
          this.cleanupExpiredTokens();
        }
      });
    }
  }

  /**
   * Clean up expired tokens
   */
  private cleanupExpiredTokens(): void {
    // Use synchronous getItem for cleanup to avoid async issues
    const storage = this.getStorage();
    const expiry = storage.getItem(TOKEN_EXPIRY_KEY);
    if (expiry && parseInt(expiry, 10) < Date.now()) {
      this.removeItem(ACCESS_TOKEN_KEY);
      this.removeItem(TOKEN_EXPIRY_KEY);
    }
  }

  /**
   * Get the appropriate storage interface
   */
  private getStorage(): Storage | MemoryStorage {
    switch (this.config.strategy) {
      case 'sessionStorage':
        return sessionStorage;
      case 'memory':
        return this.memoryStorage;
      case 'localStorage':
      default:
        return localStorage;
    }
  }

  /**
   * Store an item with optional encryption
   */
  async setItem(key: string, value: string, ttl?: number): Promise<void> {
    let processedValue = value;
    
    if (this.config.encryptTokens && (key.includes('token') || key.includes('refresh'))) {
      processedValue = await TokenEncryption.encrypt(value);
    }

    const storage = this.getStorage();
    if (storage instanceof MemoryStorage) {
      storage.setItem(key, processedValue, ttl);
    } else {
      storage.setItem(key, processedValue);
    }
  }

  /**
   * Retrieve an item with optional decryption
   */
  async getItem(key: string): Promise<string | null> {
    const storage = this.getStorage();
    const value = storage.getItem(key);
    
    if (!value) return null;

    if (this.config.encryptTokens && (key.includes('token') || key.includes('refresh'))) {
      return await TokenEncryption.decrypt(value);
    }

    return value;
  }

  /**
   * Retrieve an item synchronously (for cleanup operations)
   */
  getItemSync(key: string): string | null {
    const storage = this.getStorage();
    return storage.getItem(key);
  }

  /**
   * Remove an item
   */
  removeItem(key: string): void {
    const storage = this.getStorage();
    storage.removeItem(key);
  }

  /**
   * Clear all items
   */
  clear(): void {
    const storage = this.getStorage();
    if (storage instanceof MemoryStorage) {
      storage.clear();
    } else {
      // Only clear our keys, not all storage
      storage.removeItem(ACCESS_TOKEN_KEY);
      storage.removeItem(REFRESH_TOKEN_KEY);
      storage.removeItem(TOKEN_EXPIRY_KEY);
      storage.removeItem(STORAGE_CONFIG_KEY);
    }
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig: Partial<TokenStorageConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * Get current configuration
   */
  getConfig(): TokenStorageConfig {
    return { ...this.config };
  }
}

/**
 * Token manager implementation
 */
class TokenManager implements ITokenManager {
  private storageManager: StorageManager;

  constructor(config: TokenStorageConfig = DEFAULT_CONFIG) {
    this.storageManager = new StorageManager(config);
  }

  async storeAccessToken(token: string, expiresIn: number): Promise<void> {
    await this.storageManager.setItem(ACCESS_TOKEN_KEY, token);
    
    // Calculate and store token expiry timestamp
    const expiryTime = Date.now() + expiresIn * 1000;
    await this.storageManager.setItem(TOKEN_EXPIRY_KEY, expiryTime.toString());
  }

  async storeRefreshToken(token: string): Promise<void> {
    await this.storageManager.setItem(REFRESH_TOKEN_KEY, token);
  }

  async getAccessToken(): Promise<string | null> {
    return await this.storageManager.getItem(ACCESS_TOKEN_KEY);
  }

  async getRefreshToken(): Promise<string | null> {
    return await this.storageManager.getItem(REFRESH_TOKEN_KEY);
  }

  async isTokenValid(): Promise<boolean> {
    const token = await this.getAccessToken();
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
  }

  async isTokenExpiringSoon(thresholdSeconds = 300): Promise<boolean> {
    const token = await this.getAccessToken();
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
  }

  /**
   * Refresh token using external refresh function
   * This breaks the circular dependency by accepting a refresh function
   */
  async refreshToken(refreshFn?: () => Promise<{ success: boolean; error?: string }>): Promise<{ success: boolean; error?: string }> {
    if (!refreshFn) {
      return { success: false, error: 'No refresh function provided' };
    }

    try {
      return await refreshFn();
    } catch (error) {
      console.error('Failed to refresh token:', error);
      await this.clearTokens();
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error refreshing token'
      };
    }
  }

  async clearTokens(): Promise<void> {
    this.storageManager.clear();
  }

  /**
   * Decode access token without verification
   * @warning This does not verify the token signature, only decodes the payload
   * @returns Decoded token payload or null if invalid
   */
  async decodeToken(): Promise<DecodedToken | null> {
    const token = await this.getAccessToken();
    if (!token) return null;
    
    try {
      return jwtDecode<DecodedToken>(token);
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  }

  /**
   * Get permissions from the current token
   * @returns Array of permission strings or empty array if none
   */
  async getTokenPermissions(): Promise<string[]> {
    const decoded = await this.decodeToken();
    return decoded?.permissions || [];
  }

  /**
   * Extract user ID from token
   * @returns User ID from token or null if not found
   */
  async getUserIdFromToken(): Promise<number | null> {
    const decoded = await this.decodeToken();
    return decoded?.id || null;
  }

  /**
   * Extract tenant ID from token
   * @returns Tenant ID from token or null if not found
   */
  async getTenantIdFromToken(): Promise<number | null> {
    const decoded = await this.decodeToken();
    return decoded?.tenantId || null;
  }

  /**
   * Get token remaining time in seconds
   * @returns Seconds until token expires or 0 if expired/invalid
   */
  async getTokenRemainingTime(): Promise<number> {
    const token = await this.getAccessToken();
    if (!token) return 0;
    
    try {
      const decoded = jwtDecode<DecodedToken>(token);
      const currentTime = Date.now() / 1000;
      const remaining = decoded.exp - currentTime;
      
      return remaining > 0 ? Math.floor(remaining) : 0;
    } catch {
      return 0;
    }
  }
}

// Global storage manager instance
let storageManager = new StorageManager();

/**
 * Configure token storage strategy
 */
export const configureTokenStorage = (config: Partial<TokenStorageConfig>): void => {
  storageManager.updateConfig(config);
  
  // Store configuration for persistence
  try {
    localStorage.setItem(STORAGE_CONFIG_KEY, JSON.stringify(storageManager.getConfig()));
  } catch (error) {
    console.warn('Failed to persist storage configuration:', error);
  }
};

/**
 * Initialize token storage with saved configuration
 */
export const initializeTokenStorage = (): void => {
  try {
    const savedConfig = localStorage.getItem(STORAGE_CONFIG_KEY);
    if (savedConfig) {
      const config = JSON.parse(savedConfig) as TokenStorageConfig;
      storageManager = new StorageManager(config);
    }
  } catch (error) {
    console.warn('Failed to load storage configuration, using defaults:', error);
  }
};

// Create default token manager instance
const defaultTokenManager = new TokenManager();

/**
 * Export factory function instead of direct instance
 */
export const createTokenManager = (config?: TokenStorageConfig): ITokenManager => {
  return new TokenManager(config);
};

// Export functions that use the default instance
export const storeAccessToken = (token: string, expiresIn: number) => 
  defaultTokenManager.storeAccessToken(token, expiresIn);

export const storeRefreshToken = (token: string) => 
  defaultTokenManager.storeRefreshToken(token);

export const getAccessToken = () => 
  defaultTokenManager.getAccessToken();

export const getRefreshToken = () => 
  defaultTokenManager.getRefreshToken();

export const isTokenValid = () => 
  defaultTokenManager.isTokenValid();

export const isTokenExpiringSoon = (thresholdSeconds?: number) => 
  defaultTokenManager.isTokenExpiringSoon(thresholdSeconds);

export const clearTokens = () => 
  defaultTokenManager.clearTokens();

export const decodeToken = () => 
  defaultTokenManager.decodeToken();

export const getTokenPermissions = () => 
  defaultTokenManager.getTokenPermissions();

export const getUserIdFromToken = () => 
  defaultTokenManager.getUserIdFromToken();

export const getTenantIdFromToken = () => 
  defaultTokenManager.getTenantIdFromToken();

export const getTokenRemainingTime = () => 
  defaultTokenManager.getTokenRemainingTime();

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
    if (await isTokenExpiringSoon()) {
      console.log('Token is expiring soon, refreshing...');
      // Note: This would need to be connected to the actual refresh function
      // from the auth service when the system is properly wired up
      if (refreshCallback) {
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
 * Security utilities
 */
export const securityUtils = {
  /**
   * Check if current storage is secure
   */
  isStorageSecure: (): boolean => {
    const config = storageManager.getConfig();
    return config.strategy === 'memory' || config.encryptTokens;
  },

  /**
   * Get current security level
   */
  getSecurityLevel: (): SecurityLevel => {
    return storageManager.getConfig().securityLevel;
  },

  /**
   * Upgrade to high security mode
   */
  upgradeToHighSecurity: (): void => {
    configureTokenStorage({
      strategy: 'memory',
      securityLevel: 'high',
      encryptTokens: true,
      autoCleanup: true
    });
  },

  /**
   * Check if running in secure context
   */
  isSecureContext: (): boolean => {
    return window.isSecureContext;
  }
};

// Initialize storage on module load
initializeTokenStorage();
