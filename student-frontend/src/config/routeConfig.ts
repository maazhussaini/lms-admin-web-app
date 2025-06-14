/**
 * @file routeConfig.ts
 * @description Centralized route configuration with security definitions
 */

import { UserType } from '@shared/types/api.types';
import { RouteAccess } from '@/types/security.types';

/**
 * Route security configuration
 */
export const ROUTE_SECURITY_CONFIG: Record<string, RouteAccess> = {
  // Public routes (no authentication required)
  '/login': {
    allowedUserTypes: [],
    requiresAuth: false,
    isPublic: true
  },
  '/forgot-password': {
    allowedUserTypes: [],
    requiresAuth: false,
    isPublic: true
  },
  '/reset-password': {
    allowedUserTypes: [],
    requiresAuth: false,
    isPublic: true
  },

  // Student-only protected routes
  '/dashboard': {
    allowedUserTypes: [UserType.STUDENT],
    requiresAuth: true,
    requiredPermissions: ['dashboard:view']
  },
  '/profile': {
    allowedUserTypes: [UserType.STUDENT],
    requiresAuth: true,
    requiredPermissions: ['profile:view']
  },
  '/profile/edit': {
    allowedUserTypes: [UserType.STUDENT],
    requiresAuth: true,
    requiredPermissions: ['profile:edit']
  },
  
  // Course-related routes
  '/courses': {
    allowedUserTypes: [UserType.STUDENT],
    requiresAuth: true,
    requiredPermissions: ['courses:view']
  },
  '/courses/:id': {
    allowedUserTypes: [UserType.STUDENT],
    requiresAuth: true,
    requiredPermissions: ['courses:view']
  },
  '/courses/:id/modules': {
    allowedUserTypes: [UserType.STUDENT],
    requiresAuth: true,
    requiredPermissions: ['courses:view', 'modules:view']
  },
  '/courses/:id/assignments': {
    allowedUserTypes: [UserType.STUDENT],
    requiresAuth: true,
    requiredPermissions: ['courses:view', 'assignments:view']
  },
  '/courses/:id/quizzes': {
    allowedUserTypes: [UserType.STUDENT],
    requiresAuth: true,
    requiredPermissions: ['courses:view', 'quizzes:view']
  },

  // Assignment routes
  '/assignments': {
    allowedUserTypes: [UserType.STUDENT],
    requiresAuth: true,
    requiredPermissions: ['assignments:view']
  },
  '/assignments/:id': {
    allowedUserTypes: [UserType.STUDENT],
    requiresAuth: true,
    requiredPermissions: ['assignments:view']
  },
  '/assignments/:id/submit': {
    allowedUserTypes: [UserType.STUDENT],
    requiresAuth: true,
    requiredPermissions: ['assignments:submit']
  },

  // Quiz routes
  '/quizzes': {
    allowedUserTypes: [UserType.STUDENT],
    requiresAuth: true,
    requiredPermissions: ['quizzes:view']
  },
  '/quizzes/:id': {
    allowedUserTypes: [UserType.STUDENT],
    requiresAuth: true,
    requiredPermissions: ['quizzes:view']
  },
  '/quizzes/:id/attempt': {
    allowedUserTypes: [UserType.STUDENT],
    requiresAuth: true,
    requiredPermissions: ['quizzes:attempt']
  },

  // Grade routes
  '/grades': {
    allowedUserTypes: [UserType.STUDENT],
    requiresAuth: true,
    requiredPermissions: ['grades:view']
  },

  // Notification routes
  '/notifications': {
    allowedUserTypes: [UserType.STUDENT],
    requiresAuth: true,
    requiredPermissions: ['notifications:view']
  },

  // Error pages (accessible to all authenticated users)
  '/unauthorized': {
    allowedUserTypes: [UserType.STUDENT, UserType.TEACHER, UserType.TENANT_ADMIN, UserType.SUPER_ADMIN],
    requiresAuth: false
  },
  '/404': {
    allowedUserTypes: [UserType.STUDENT, UserType.TEACHER, UserType.TENANT_ADMIN, UserType.SUPER_ADMIN],
    requiresAuth: false
  }
};

/**
 * Default permissions for student users
 */
export const DEFAULT_STUDENT_PERMISSIONS = [
  'dashboard:view',
  'profile:view',
  'profile:edit',
  'courses:view',
  'modules:view',
  'assignments:view',
  'assignments:submit',
  'quizzes:view',
  'quizzes:attempt',
  'grades:view',
  'notifications:view'
];

/**
 * Get route security configuration
 */
export const getRouteSecurityConfig = (path: string): RouteAccess | null => {
  // Direct match first
  if (ROUTE_SECURITY_CONFIG[path]) {
    return ROUTE_SECURITY_CONFIG[path];
  }

  // Pattern matching for dynamic routes
  for (const [pattern, config] of Object.entries(ROUTE_SECURITY_CONFIG)) {
    if (pattern.includes(':')) {
      const regex = new RegExp('^' + pattern.replace(/:[^/]+/g, '[^/]+') + '$');
      if (regex.test(path)) {
        return config;
      }
    }
  }

  return null;
};

/**
 * Check if route requires authentication
 */
export const routeRequiresAuth = (path: string): boolean => {
  const config = getRouteSecurityConfig(path);
  return config ? config.requiresAuth : true; // Default to requiring auth
};

/**
 * Check if route is public
 */
export const isPublicRoute = (path: string): boolean => {
  const config = getRouteSecurityConfig(path);
  return config ? config.isPublic === true : false;
};

/**
 * Get allowed user types for route
 */
export const getAllowedUserTypes = (path: string): UserType[] => {
  const config = getRouteSecurityConfig(path);
  return config ? config.allowedUserTypes : [];
};

/**
 * Get required permissions for route
 */
export const getRequiredPermissions = (path: string): string[] => {
  const config = getRouteSecurityConfig(path);
  return config ? config.requiredPermissions || [] : [];
};
