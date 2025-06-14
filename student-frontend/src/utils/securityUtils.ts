/**
 * @file securityUtils.ts
 * @description Security utility functions for authentication and authorization
 */

import { UserType } from '@shared/types/api.types';
import { 
  SecurityContext, 
  UserTypeGuards, 
  SecurityValidators,
  UnauthorizedError,
  ForbiddenError,
  InsufficientPermissionsError
} from '@/types/security.types';
import { getRouteSecurityConfig } from '@/config/routeConfig';

/**
 * Security manager class for centralized security operations
 */
export class SecurityManager {
  private static instance: SecurityManager;
  private securityContext: SecurityContext | null = null;

  private constructor() {}

  static getInstance(): SecurityManager {
    if (!SecurityManager.instance) {
      SecurityManager.instance = new SecurityManager();
    }
    return SecurityManager.instance;
  }

  /**
   * Set the current security context
   */
  setSecurityContext(context: SecurityContext): void {
    this.securityContext = context;
  }

  /**
   * Get the current security context
   */
  getSecurityContext(): SecurityContext | null {
    return this.securityContext;
  }

  /**
   * Clear the security context (on logout)
   */
  clearSecurityContext(): void {
    this.securityContext = null;
  }

  /**
   * Validate route access based on current user context
   */
  validateRouteAccess(path: string, userPermissions: string[] = []): boolean {
    if (!this.securityContext) {
      throw new UnauthorizedError('No valid security context');
    }

    const routeConfig = getRouteSecurityConfig(path);
    
    // If no specific config found, default to requiring authentication
    if (!routeConfig) {
      return UserTypeGuards.isAuthenticatedUser(this.securityContext.userType);
    }

    // Check if route is public
    if (routeConfig.isPublic) {
      return true;
    }

    // Check authentication requirement
    if (routeConfig.requiresAuth && !UserTypeGuards.isAuthenticatedUser(this.securityContext.userType)) {
      throw new UnauthorizedError('Authentication required');
    }

    // Check user type authorization
    if (routeConfig.allowedUserTypes.length > 0) {
      if (!SecurityValidators.isUserTypeAllowed(this.securityContext.userType, routeConfig.allowedUserTypes)) {
        throw new ForbiddenError(`Access denied for user type: ${this.securityContext.userType}`);
      }
    }

    // Check required permissions
    if (routeConfig.requiredPermissions && routeConfig.requiredPermissions.length > 0) {
      if (!SecurityValidators.hasPermission(userPermissions, routeConfig.requiredPermissions)) {
        throw new InsufficientPermissionsError(routeConfig.requiredPermissions);
      }
    }

    return true;
  }

  /**
   * Check if current user can access a specific resource
   */
  canAccessResource(resourceOwnerId: number, resourceTenantId?: number): boolean {
    if (!this.securityContext) {
      return false;
    }

    // Users can access their own resources
    if (this.securityContext.userId === resourceOwnerId) {
      return true;
    }

    // Tenant isolation check
    if (resourceTenantId && !SecurityValidators.validateTenantAccess(this.securityContext.tenantId, resourceTenantId)) {
      return false;
    }

    // Admin users have broader access within their tenant
    return UserTypeGuards.hasAdminPrivileges(this.securityContext.userType);
  }

  /**
   * Validate session and update last activity
   */
  validateAndUpdateSession(): boolean {
    if (!this.securityContext) {
      return false;
    }

    const isValid = SecurityValidators.isSessionValid(this.securityContext.lastActivity);
    
    if (isValid) {
      // Update last activity
      this.securityContext.lastActivity = new Date();
    }

    return isValid;
  }

  /**
   * Check if user is a student
   */
  isCurrentUserStudent(): boolean {
    return this.securityContext ? UserTypeGuards.isStudent(this.securityContext.userType) : false;
  }

  /**
   * Get current user ID
   */
  getCurrentUserId(): number | null {
    return this.securityContext?.userId || null;
  }

  /**
   * Get current tenant ID
   */
  getCurrentTenantId(): number | null {
    return this.securityContext?.tenantId || null;
  }
}

/**
 * Permission checker utility
 */
export class PermissionChecker {
  /**
   * Check if user has specific permission
   */
  static hasPermission(userPermissions: string[], permission: string): boolean {
    return userPermissions.includes(permission);
  }

  /**
   * Check if user has any of the specified permissions
   */
  static hasAnyPermission(userPermissions: string[], permissions: string[]): boolean {
    return permissions.some(permission => userPermissions.includes(permission));
  }

  /**
   * Check if user has all specified permissions
   */
  static hasAllPermissions(userPermissions: string[], permissions: string[]): boolean {
    return permissions.every(permission => userPermissions.includes(permission));
  }

  /**
   * Filter permissions based on user type
   */
  static filterPermissionsByUserType(permissions: string[], userType: UserType): string[] {
    // Students should only have student-specific permissions
    if (UserTypeGuards.isStudent(userType)) {
      return permissions.filter(permission => 
        permission.includes('dashboard:') ||
        permission.includes('profile:') ||
        permission.includes('courses:') ||
        permission.includes('assignments:') ||
        permission.includes('quizzes:') ||
        permission.includes('grades:') ||
        permission.includes('notifications:')
      );
    }

    return permissions;
  }
}

/**
 * Route protection utilities
 */
export class RouteProtection {
  /**
   * Check if user can access route
   */
  static canAccessRoute(path: string, _userType: UserType, permissions: string[]): boolean {
    try {
      const security = SecurityManager.getInstance();
      return security.validateRouteAccess(path, permissions);
    } catch (error) {
      console.warn('Route access denied:', error instanceof Error ? error.message : String(error));
      return false;
    }
  }

  /**
   * Get redirect path for unauthorized access
   */
  static getUnauthorizedRedirectPath(userType: UserType | null): string {
    if (!userType || !UserTypeGuards.isAuthenticatedUser(userType)) {
      return '/login';
    }

    // Students trying to access non-student routes
    if (UserTypeGuards.isStudent(userType)) {
      return '/dashboard';
    }

    return '/unauthorized';
  }

  /**
   * Sanitize route path for logging
   */
  static sanitizePathForLogging(path: string): string {
    // Remove sensitive parameters and personal identifiers
    return path
      .replace(/\/\d+/g, '/:id')
      .replace(/[?&]token=[^&]*/g, '')
      .replace(/[?&]email=[^&]*/g, '');
  }
}

/**
 * Session security utilities
 */
export class SessionSecurity {
  private static readonly MAX_INACTIVITY = 30 * 60 * 1000; // 30 minutes
  private static readonly SESSION_CHECK_INTERVAL = 60 * 1000; // 1 minute

  /**
   * Start session monitoring
   */
  static startSessionMonitoring(onSessionExpired: () => void): () => void {
    const intervalId = setInterval(() => {
      const security = SecurityManager.getInstance();
      
      if (!security.validateAndUpdateSession()) {
        onSessionExpired();
      }
    }, this.SESSION_CHECK_INTERVAL);

    return () => clearInterval(intervalId);
  }

  /**
   * Update session activity
   */
  static updateActivity(): void {
    const security = SecurityManager.getInstance();
    const context = security.getSecurityContext();
    
    if (context) {
      context.lastActivity = new Date();
      security.setSecurityContext(context);
    }
  }

  /**
   * Check if session is about to expire
   */
  static isSessionExpiringSoon(warningThreshold: number = 5 * 60 * 1000): boolean {
    const security = SecurityManager.getInstance();
    const context = security.getSecurityContext();
    
    if (!context) return false;

    const now = new Date().getTime();
    const lastActivity = context.lastActivity.getTime();
    const timeUntilExpiry = this.MAX_INACTIVITY - (now - lastActivity);
    
    return timeUntilExpiry <= warningThreshold;
  }
}

// Export singleton instance
export const securityManager = SecurityManager.getInstance();

// Export utilities for external use
export { UserTypeGuards, SecurityValidators } from '@/types/security.types';
