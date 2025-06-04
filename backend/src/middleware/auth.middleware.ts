/**
 * @file middleware/auth.middleware.ts
 * @description Authentication and authorization middleware.
 */

import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken, TokenPayload } from '@/utils/jwt.utils.js';
import { UnauthorizedError, ForbiddenError } from '@/utils/api-error.utils.js';

/**
 * Extends Express Request interface to include user data
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
 */
export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedError('Authentication required');
    }
    
    // Extract token
    const token = authHeader.split(' ')[1];
    
    if (!token) {
      throw new UnauthorizedError('Authentication required');
    }
    
    // Verify token and attach user data to request
    const decodedToken = verifyAccessToken(token);
    req.user = decodedToken;
    
    next();
  } catch (error: any) {
    if (error.name === 'TokenExpiredError') {
      next(new UnauthorizedError('Token expired'));
    } else if (error.name === 'JsonWebTokenError') {
      next(new UnauthorizedError('Invalid token'));
    } else {
      next(error);
    }
  }
};

/**
 * Check if user has required role(s)
 * Must be used after authenticate middleware
 * @param allowedRoles Array of roles allowed to access the resource
 */
export const authorize = (allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new UnauthorizedError('Authentication required'));
    }
    
    if (!allowedRoles.includes(req.user.role)) {
      return next(new ForbiddenError('Insufficient permissions'));
    }
    
    next();
  };
};

/**
 * Ensure user belongs to requested tenant
 * Must be used after authenticate middleware
 * @param paramName Name of the route parameter containing tenant ID (default: 'tenantId')
 */
export const verifyTenantAccess = (paramName = 'tenantId') => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new UnauthorizedError('Authentication required'));
    }
    
    // Get tenant ID from route parameter
    const requestedTenantId = parseInt(req.params[paramName], 10);
    
    if (isNaN(requestedTenantId)) {
      return next(new ForbiddenError('Invalid tenant ID'));
    }
    
    // Super admins can access any tenant
    if (req.user.role === 'SUPER_ADMIN') {
      return next();
    }
    
    // Verify tenant ID matches user's tenant
    if (req.user.tenantId !== requestedTenantId) {
      return next(new ForbiddenError('Cannot access resources from another tenant'));
    }
    
    next();
  };
};

/**
 * Set tenant context middleware
 * Automatically applies tenant ID filter to all Prisma operations
 * Must be used after authenticate middleware
 */
export const setTenantContext = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.user) {
    return next(new UnauthorizedError('Authentication required'));
  }
  
  // Skip tenant context for super admins
  if (req.user.role === 'SUPER_ADMIN') {
    return next();
  }
  
  // Add tenant ID to res.locals for use in services
  res.locals.tenantId = req.user.tenantId;
  
  next();
};
