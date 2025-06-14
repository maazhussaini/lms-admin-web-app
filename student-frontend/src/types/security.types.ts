/**
 * @file security.types.ts
 * @description Security-related type definitions and user type guards
 */

import { UserType } from '@shared/types';

/**
 * Security context interface for user session
 */
export interface SecurityContext {
  userType: UserType;
  userId: number;
  tenantId: number;
  sessionId: string;
  lastActivity: Date;
  ipAddress?: string;
  userAgent?: string;
}

/**
 * Permission levels for granular access control
 */
export const PermissionLevel = {
  READ: 'READ',
  WRITE: 'WRITE',
  DELETE: 'DELETE',
  ADMIN: 'ADMIN'
} as const;

export type PermissionLevel = typeof PermissionLevel[keyof typeof PermissionLevel];

/**
 * Resource types for permission checking
 */
export const ResourceType = {
  PROFILE: 'PROFILE',
  COURSES: 'COURSES',
  ASSIGNMENTS: 'ASSIGNMENTS',
  GRADES: 'GRADES',
  NOTIFICATIONS: 'NOTIFICATIONS'
} as const;

export type ResourceType = typeof ResourceType[keyof typeof ResourceType];

/**
 * Permission structure
 */
export interface Permission {
  resource: ResourceType;
  level: PermissionLevel;
  constraints?: Record<string, any>;
}

/**
 * Route access configuration
 */
export interface RouteAccess {
  allowedUserTypes: UserType[];
  requiredPermissions?: string[];
  requiresAuth: boolean;
  isPublic?: boolean;
}

/**
 * User type guard functions for runtime type checking
 */
export const UserTypeGuards = {
  isStudent: (userType: UserType): boolean => userType === UserType.STUDENT,
  isTeacher: (userType: UserType): boolean => userType === UserType.TEACHER,
  isTenantAdmin: (userType: UserType): boolean => userType === UserType.TENANT_ADMIN,
  isSuperAdmin: (userType: UserType): boolean => userType === UserType.SUPER_ADMIN,
  
  isAuthenticatedUser: (userType: UserType | null | undefined): userType is UserType => {
    return userType !== null && userType !== undefined && Object.values(UserType).includes(userType);
  },
  
  hasAdminPrivileges: (userType: UserType): boolean => {
    return userType === UserType.TENANT_ADMIN || userType === UserType.SUPER_ADMIN;
  },
  
  canAccessStudentRoutes: (userType: UserType): boolean => {
    return userType === UserType.STUDENT;
  }
};

/**
 * Security validation utilities
 */
export const SecurityValidators = {
  /**
   * Validate if user has required permissions for a resource
   */
  hasPermission: (
    userPermissions: string[],
    requiredPermissions: string[]
  ): boolean => {
    return requiredPermissions.every(permission => 
      userPermissions.includes(permission)
    );
  },

  /**
   * Check if user type is allowed for a route
   */
  isUserTypeAllowed: (
    userType: UserType,
    allowedTypes: UserType[]
  ): boolean => {
    return allowedTypes.includes(userType);
  },

  /**
   * Validate tenant isolation (students can only access their tenant data)
   */
  validateTenantAccess: (
    userTenantId: number,
    resourceTenantId: number
  ): boolean => {
    return userTenantId === resourceTenantId;
  },

  /**
   * Check if session is valid and not expired
   */
  isSessionValid: (lastActivity: Date, maxInactivity: number = 30 * 60 * 1000): boolean => {
    const now = new Date().getTime();
    const lastActivityTime = lastActivity.getTime();
    return (now - lastActivityTime) < maxInactivity;
  }
};

/**
 * Security errors
 */
export class SecurityError extends Error {
  code: string;
  statusCode: number;

  constructor(
    message: string,
    code: string,
    statusCode: number = 403
  ) {
    super(message);
    this.name = 'SecurityError';
    this.code = code;
    this.statusCode = statusCode;
  }
}

export class UnauthorizedError extends SecurityError {
  constructor(message: string = 'Unauthorized access') {
    super(message, 'UNAUTHORIZED', 401);
  }
}

export class ForbiddenError extends SecurityError {
  constructor(message: string = 'Forbidden access') {
    super(message, 'FORBIDDEN', 403);
  }
}

export class InsufficientPermissionsError extends SecurityError {
  constructor(requiredPermissions: string[]) {
    super(
      `Insufficient permissions. Required: ${requiredPermissions.join(', ')}`,
      'INSUFFICIENT_PERMISSIONS',
      403
    );
  }
}

/**
 * Type guard to check if an error is a SecurityError
 */
export const isSecurityError = (error: unknown): error is SecurityError => {
  return error instanceof SecurityError;
};

/**
 * Default security configuration
 */
export const DEFAULT_SECURITY_CONFIG = {
  SESSION_TIMEOUT: 30 * 60 * 1000, // 30 minutes
  MAX_LOGIN_ATTEMPTS: 5,
  PASSWORD_MIN_LENGTH: 8,
} as const;
