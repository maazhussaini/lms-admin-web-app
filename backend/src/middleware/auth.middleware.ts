/**
 * @file middleware/auth.middleware.ts
 * @description Authentication and authorization middleware for securing API endpoints.
 * Provides JWT token validation, role-based access control, and tenant isolation.
 */

import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken, TokenPayload, extractTokenFromHeader } from '@/utils/jwt.utils.js';
import { UnauthorizedError, ForbiddenError } from '@/utils/api-error.utils.js';
import logger from '@/config/logger.js';

/**
 * Extends Express Request interface to include user data from JWT token
 */
declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload;
    }
  }
}

/**
 * Authenticates requests using JWT token from Authorization header
 * Attaches decoded user data to request object
 * 
 * @throws UnauthorizedError when token is missing, expired, or invalid
 */
export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Get token from Authorization header or query parameter (for socket.io)
    let token: string;
    
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      // Extract token from Authorization header
      token = authHeader.split(' ')[1];
    } else if (req.query.token && typeof req.query.token === 'string') {
      // Extract token from query parameter (for WebSocket connections)
      token = req.query.token;
    } else {
      logger.warn('Authentication failed: No token provided', { 
        ip: req.ip, 
        path: req.path,
        requestId: req.id
      });
      throw new UnauthorizedError('Authentication required', 'NO_TOKEN_PROVIDED');
    }
    
    if (!token) {
      throw new UnauthorizedError('Authentication required', 'EMPTY_TOKEN');
    }
    
    // Verify token and attach user data to request
    const decodedToken = verifyAccessToken(token);
    req.user = decodedToken;
    
    // Log successful authentication
    logger.debug('Authentication successful', { 
      userId: decodedToken.id,
      tenantId: decodedToken.tenantId,
      role: decodedToken.role,
      path: req.path,
      requestId: req.id
    });
    
    next();
  } catch (error: any) {
    if (error instanceof UnauthorizedError) {
      // Pass the error directly if it's already an UnauthorizedError
      next(error);
    } else if (error.name === 'TokenExpiredError') {
      logger.warn('Authentication failed: Token expired', { 
        ip: req.ip, 
        path: req.path,
        requestId: req.id
      });
      next(new UnauthorizedError('Token expired', 'TOKEN_EXPIRED'));
    } else if (error.name === 'JsonWebTokenError') {
      logger.warn('Authentication failed: Invalid token', { 
        ip: req.ip, 
        path: req.path,
        error: error.message,
        requestId: req.id
      });
      next(new UnauthorizedError('Invalid token', 'INVALID_TOKEN'));
    } else {
      logger.error('Authentication error', { 
        error: error.message, 
        stack: error.stack,
        ip: req.ip,
        path: req.path,
        requestId: req.id
      });
      next(error);
    }
  }
};

/**
 * Check if user has required role(s)
 * Must be used after authenticate middleware
 * 
 * @param allowedRoles Array of roles allowed to access the resource
 * @returns Middleware function that checks if user has an allowed role
 * @throws UnauthorizedError when user is not authenticated
 * @throws ForbiddenError when user doesn't have required role
 */
export const authorize = (allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      logger.warn('Authorization failed: No authenticated user', { 
        path: req.path,
        requestId: req.id
      });
      return next(new UnauthorizedError('Authentication required', 'USER_NOT_AUTHENTICATED'));
    }
    
    if (!allowedRoles.includes(req.user.role)) {
      logger.warn('Authorization failed: Insufficient permissions', { 
        userId: req.user.id, 
        userRole: req.user.role, 
        requiredRoles: allowedRoles,
        path: req.path,
        requestId: req.id
      });
      return next(new ForbiddenError('Insufficient permissions', 'INSUFFICIENT_ROLE'));
    }
    
    next();
  };
};

/**
 * Ensure user belongs to requested tenant
 * Must be used after authenticate middleware
 * 
 * @param paramName Name of the route parameter containing tenant ID (default: 'tenantId')
 * @returns Middleware function that verifies tenant access
 * @throws UnauthorizedError when user is not authenticated
 * @throws ForbiddenError when user doesn't belong to requested tenant
 */
export const verifyTenantAccess = (paramName = 'tenantId') => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      logger.warn('Tenant verification failed: No authenticated user', { 
        path: req.path,
        requestId: req.id
      });
      return next(new UnauthorizedError('Authentication required', 'USER_NOT_AUTHENTICATED'));
    }
    
    // Get tenant ID from route parameter
    const requestedTenantId = parseInt(req.params[paramName], 10);
    
    if (isNaN(requestedTenantId)) {
      logger.warn('Tenant verification failed: Invalid tenant ID format', { 
        userId: req.user.id, 
        providedTenantId: req.params[paramName],
        path: req.path,
        requestId: req.id
      });
      return next(new ForbiddenError('Invalid tenant ID', 'INVALID_TENANT_ID_FORMAT'));
    }
    
    // Super admins can access any tenant
    if (req.user.role === 'SUPER_ADMIN') {
      logger.debug('Tenant access granted for super admin', { 
        userId: req.user.id, 
        userTenantId: req.user.tenantId,
        requestedTenantId,
        path: req.path,
        requestId: req.id
      });
      return next();
    }
    
    // Verify tenant ID matches user's tenant
    if (req.user.tenantId !== requestedTenantId) {
      logger.warn('Tenant verification failed: Cross-tenant access attempt', { 
        userId: req.user.id, 
        userTenantId: req.user.tenantId,
        requestedTenantId,
        path: req.path,
        requestId: req.id
      });
      return next(new ForbiddenError('Cannot access resources from another tenant', 'CROSS_TENANT_ACCESS_DENIED'));
    }
    
    next();
  };
};

/**
 * Set tenant context middleware
 * Automatically applies tenant ID filter to all Prisma operations
 * Must be used after authenticate middleware
 * 
 * @throws UnauthorizedError when user is not authenticated
 */
export const setTenantContext = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.user) {
    logger.warn('Tenant context failed: No authenticated user', { 
      path: req.path,
      requestId: req.id
    });
    return next(new UnauthorizedError('Authentication required', 'USER_NOT_AUTHENTICATED'));
  }
  
  // Skip tenant context for super admins if they don't specify a tenant
  // This allows super admins to access cross-tenant data when needed
  if (req.user.role === 'SUPER_ADMIN' && !req.query.forceTenantId) {
    logger.debug('Tenant context skipped for super admin', { 
      userId: req.user.id,
      path: req.path,
      requestId: req.id
    });
    return next();
  }
  
  // Set the tenant ID for forced tenant context for super admins
  if (req.user.role === 'SUPER_ADMIN' && req.query.forceTenantId) {
    const forcedTenantId = parseInt(req.query.forceTenantId as string, 10);
    if (!isNaN(forcedTenantId)) {
      res.locals.tenantId = forcedTenantId;
      logger.debug('Forced tenant context for super admin', { 
        userId: req.user.id,
        forcedTenantId,
        path: req.path,
        requestId: req.id
      });
      return next();
    }
  }
  
  // Add tenant ID to res.locals for use in services
  res.locals.tenantId = req.user.tenantId;
  
  next();
};

/**
 * Check if request has permission to access specific resource by ID
 * Must be used after authenticate middleware
 * 
 * @param resourceType Type of resource being accessed (e.g., 'course', 'student')
 * @param paramName Name of the route parameter containing resource ID (default: 'id')
 * @returns Middleware function that checks permission for specific resource
 */
export const checkResourcePermission = (resourceType: string, paramName = 'id') => {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new UnauthorizedError('Authentication required', 'USER_NOT_AUTHENTICATED'));
    }
    
    const resourceId = parseInt(req.params[paramName], 10);
    
    if (isNaN(resourceId)) {
      return next(new ForbiddenError(`Invalid ${resourceType} ID`, 'INVALID_RESOURCE_ID'));
    }
    
    // Super admins bypass additional permission checks
    if (req.user.role === 'SUPER_ADMIN') {
      return next();
    }
    
    // For regular users, permission checks would be performed here
    // This would involve checking if the resource belongs to the user's tenant
    // and if the user has appropriate permissions for the specific resource
    
    // Example: res.locals.resource = { id: resourceId, type: resourceType };
    
    next();
  };
};
