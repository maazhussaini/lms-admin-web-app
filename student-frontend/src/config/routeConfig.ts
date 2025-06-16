/**
 * @file routeConfig.ts
 * @description Route-based security configuration for the LMS student frontend
 */

import { UserType } from '@shared/types/api.types';
import { RouteAccess } from '@/types/security.types';

/**
 * Route security configuration mapping
 */
const ROUTE_SECURITY_CONFIG: Record<string, RouteAccess> = {
  // Public routes (no authentication required)
  '/': {
    allowedUserTypes: [],
    requiresAuth: false,
    isPublic: true,
  },
  '/login': {
    allowedUserTypes: [],
    requiresAuth: false,
    isPublic: true,
  },
  '/forgot-password': {
    allowedUserTypes: [],
    requiresAuth: false,
    isPublic: true,
  },
  '/reset-password': {
    allowedUserTypes: [],
    requiresAuth: false,
    isPublic: true,
  },
  '/help': {
    allowedUserTypes: [],
    requiresAuth: false,
    isPublic: true,
  },
  '/privacy': {
    allowedUserTypes: [],
    requiresAuth: false,
    isPublic: true,
  },
  '/terms': {
    allowedUserTypes: [],
    requiresAuth: false,
    isPublic: true,
  },

  // Student-only routes
  '/dashboard': {
    allowedUserTypes: [UserType.STUDENT],
    requiresAuth: true,
    requiredPermissions: ['dashboard:view'],
  },
  '/profile': {
    allowedUserTypes: [UserType.STUDENT],
    requiresAuth: true,
    requiredPermissions: ['profile:view'],
  },
  '/profile/edit': {
    allowedUserTypes: [UserType.STUDENT],
    requiresAuth: true,
    requiredPermissions: ['profile:edit'],
  },
  '/courses': {
    allowedUserTypes: [UserType.STUDENT],
    requiresAuth: true,
    requiredPermissions: ['courses:view'],
  },
  '/courses/:id': {
    allowedUserTypes: [UserType.STUDENT],
    requiresAuth: true,
    requiredPermissions: ['courses:view'],
  },
  '/courses/:id/lectures/:lectureId': {
    allowedUserTypes: [UserType.STUDENT],
    requiresAuth: true,
    requiredPermissions: ['courses:view', 'lectures:view'],
  },
  '/assignments': {
    allowedUserTypes: [UserType.STUDENT],
    requiresAuth: true,
    requiredPermissions: ['assignments:view'],
  },
  '/assignments/:id': {
    allowedUserTypes: [UserType.STUDENT],
    requiresAuth: true,
    requiredPermissions: ['assignments:view'],
  },
  '/quizzes': {
    allowedUserTypes: [UserType.STUDENT],
    requiresAuth: true,
    requiredPermissions: ['quizzes:view'],
  },
  '/quizzes/:id': {
    allowedUserTypes: [UserType.STUDENT],
    requiresAuth: true,
    requiredPermissions: ['quizzes:take'],
  },
  '/grades': {
    allowedUserTypes: [UserType.STUDENT],
    requiresAuth: true,
    requiredPermissions: ['grades:view'],
  },
  '/notifications': {
    allowedUserTypes: [UserType.STUDENT],
    requiresAuth: true,
    requiredPermissions: ['notifications:view'],
  },
  '/settings': {
    allowedUserTypes: [UserType.STUDENT],
    requiresAuth: true,
    requiredPermissions: ['profile:view'],
  },

  // Error and utility routes
  '/unauthorized': {
    allowedUserTypes: [],
    requiresAuth: false,
    isPublic: true,
  },
  '/not-found': {
    allowedUserTypes: [],
    requiresAuth: false,
    isPublic: true,
  },
  '/server-error': {
    allowedUserTypes: [],
    requiresAuth: false,
    isPublic: true,
  },
};

/**
 * Default route configuration for routes not explicitly defined
 */
const DEFAULT_ROUTE_CONFIG: RouteAccess = {
  allowedUserTypes: [UserType.STUDENT],
  requiresAuth: true,
  requiredPermissions: [],
};

/**
 * Get security configuration for a specific route
 * @param path - The route path to check
 * @returns Route access configuration
 */
export const getRouteSecurityConfig = (path: string): RouteAccess => {
  // Exact match first
  if (ROUTE_SECURITY_CONFIG[path]) {
    return ROUTE_SECURITY_CONFIG[path];
  }

  // Check for parameterized routes
  const normalizedPath = normalizePath(path);
  for (const [configPath, config] of Object.entries(ROUTE_SECURITY_CONFIG)) {
    if (matchesParameterizedRoute(normalizedPath, configPath)) {
      return config;
    }
  }

  // Return default configuration
  return DEFAULT_ROUTE_CONFIG;
};

/**
 * Normalize path by removing query parameters and hash
 * @param path - Original path
 * @returns Normalized path
 */
const normalizePath = (path: string): string => {
  return path.split('?')[0]?.split('#')[0] || path;
};

/**
 * Check if a path matches a parameterized route pattern
 * @param actualPath - The actual route path
 * @param configPath - The configured route pattern (with :param syntax)
 * @returns Whether the paths match
 */
const matchesParameterizedRoute = (actualPath: string, configPath: string): boolean => {
  // Convert route pattern to regex
  const regexPattern = configPath
    .replace(/:[^/]+/g, '[^/]+') // Replace :param with [^/]+
    .replace(/\//g, '\\/'); // Escape forward slashes

  const regex = new RegExp(`^${regexPattern}$`);
  return regex.test(actualPath);
};

/**
 * Get all available route patterns
 * @returns Array of configured route patterns
 */
export const getAvailableRoutes = (): string[] => {
  return Object.keys(ROUTE_SECURITY_CONFIG);
};

/**
 * Check if a route is public (no authentication required)
 * @param path - The route path to check
 * @returns Whether the route is public
 */
export const isPublicRoute = (path: string): boolean => {
  const config = getRouteSecurityConfig(path);
  return config.isPublic === true;
};

/**
 * Get required permissions for a route
 * @param path - The route path to check
 * @returns Array of required permission strings
 */
export const getRoutePermissions = (path: string): string[] => {
  const config = getRouteSecurityConfig(path);
  return config.requiredPermissions || [];
};

/**
 * Get allowed user types for a route
 * @param path - The route path to check
 * @returns Array of allowed user types
 */
export const getAllowedUserTypes = (path: string): UserType[] => {
  const config = getRouteSecurityConfig(path);
  return config.allowedUserTypes;
};

/**
 * Student-specific route patterns for validation
 */
export const STUDENT_ROUTE_PATTERNS = [
  '/dashboard',
  '/profile',
  '/courses',
  '/assignments',
  '/quizzes',
  '/grades',
  '/notifications',
  '/settings',
];

/**
 * Check if a route is intended for students
 * @param path - The route path to check
 * @returns Whether the route is for students
 */
export const isStudentRoute = (path: string): boolean => {
  const normalizedPath = normalizePath(path);
  return STUDENT_ROUTE_PATTERNS.some(pattern => 
    normalizedPath.startsWith(pattern)
  );
};

/**
 * Check if a route requires authentication
 * @param path - The route path to check
 * @returns Whether the route requires authentication
 */
export const routeRequiresAuth = (path: string): boolean => {
  const config = getRouteSecurityConfig(path);
  return config.requiresAuth;
};
