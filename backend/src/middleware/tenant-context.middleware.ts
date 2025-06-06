/**
 * @file middleware/tenant-context-improved.middleware.ts
 * @description Improved version of tenant-context middleware with better TypeScript safety
 */

import { Request, Response, NextFunction } from 'express';
import { ForbiddenError, UnauthorizedError } from '@/utils/api-error.utils.js';
import logger from '@/config/logger.js';

/**
 * Constants for better type safety and maintainability
 */
const SUPER_ADMIN_ROLE = 'SUPER_ADMIN' as const;

/**
 * Type guard to check if req.user exists and has required properties
 */
const isValidUser = (user: unknown): user is { id: number; tenantId: number; role: string } => {
  if (user === null || user === undefined || typeof user !== 'object') {
    return false;
  }
  
  const userObj = user as Record<string, unknown>;
  return (
    'id' in userObj &&
    'tenantId' in userObj &&
    'role' in userObj &&
    typeof userObj['id'] === 'number' &&
    typeof userObj['tenantId'] === 'number' &&
    typeof userObj['role'] === 'string'
  );
};

/**
 * Type-safe tenant ID extraction with proper validation
 */
export const extractTenantId = (req: Request): number | undefined => {
  try {
    // Try URL params
    if (req.params['tenantId']) {
      const parsedId = parseInt(req.params['tenantId'], 10);
      if (isNaN(parsedId) || parsedId <= 0) {
        throw new Error(`Invalid tenant ID format in URL param: ${req.params['tenantId']}`);
      }
      return parsedId;
    }
    
    // Try query params
    const queryTenantId = req.query['tenantId'];
    if (queryTenantId && typeof queryTenantId === 'string') {
      const parsedId = parseInt(queryTenantId, 10);
      if (isNaN(parsedId) || parsedId <= 0) {
        throw new Error(`Invalid tenant ID format in query param: ${queryTenantId}`);
      }
      return parsedId;
    }
    
    // Try user object (from auth middleware)
    if (isValidUser(req.user)) {
      return req.user.tenantId;
    }
    
    return undefined;  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    logger.warn(`Tenant ID extraction failed: ${errorMessage}`);
    return undefined;
  }
};

/**
 * Type-safe tenant-scoped condition creator
 */
export const createTenantScopedCondition = <T extends Record<string, unknown>>(
  tenantId: number,
  additionalConditions: T = {} as T
): T & { tenantId: number } => {
  if (!Number.isInteger(tenantId) || tenantId <= 0) {
    throw new Error('Invalid tenant ID provided for scoped condition');
  }
  
  return {
    ...additionalConditions,
    tenantId,
  };
};

/**
 * Improved middleware with better type safety
 */
export const requireTenantId = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    // Validate user exists and has proper structure
    if (!isValidUser(req.user)) {
      logger.warn('Invalid or missing user in request for tenant requirement');
      return next(new UnauthorizedError('Authentication required'));
    }    // Super admins are exempt from tenant ID requirement
    if (req.user.role === SUPER_ADMIN_ROLE) {
      logger.debug('SUPER_ADMIN exempt from tenant ID requirement');
      return next();
    }
    
    const tenantId = extractTenantId(req);
    
    if (!tenantId) {
      logger.warn(`Tenant ID missing in request: ${req.method} ${req.originalUrl}`);
      return next(new ForbiddenError('Tenant ID is required for this operation'));
    }
    
    // Verify tenant ID matches user's tenant
    if (req.user.tenantId !== tenantId) {
      logger.warn(`Tenant ID mismatch: User tenant=${req.user.tenantId}, Requested tenant=${tenantId}`);
      return next(new ForbiddenError('Cannot access resources from another tenant'));
    }
    
    // Type-safe assignment to res.locals
    res.locals.tenantId = tenantId;
    
    next();  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown tenant context error';
    logger.error(`Tenant context error: ${errorMessage}`);
    next(error);
  }
};

/**
 * Type-safe higher-order function for tenant context
 */
export const withTenantContext = <TArgs extends readonly unknown[], TReturn>(
  serviceMethod: (tenantId: number, ...args: TArgs) => Promise<TReturn>
) => {
  return async (tenantId: number, ...args: TArgs): Promise<TReturn> => {
    if (!Number.isInteger(tenantId) || tenantId <= 0) {
      throw new UnauthorizedError('Valid tenant context required');
    }
    return serviceMethod(tenantId, ...args);
  };
};
