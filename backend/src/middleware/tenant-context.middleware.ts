/**
 * @file middleware/tenant-context.middleware.ts
 * @description Middleware for establishing tenant context for Prisma operations.
 */

import { Request, Response, NextFunction } from 'express';
import { ForbiddenError, UnauthorizedError } from '@/utils/api-error.utils.js';

/**
 * Create a tenant-scoped where condition for Prisma queries
 * @param tenantId The tenant ID to scope queries to
 * @param additionalConditions Additional where conditions to combine with tenant scoping
 * @returns Combined where condition for Prisma
 */
export const createTenantScopedCondition = (
  tenantId: number,
  additionalConditions: Record<string, any> = {}
): Record<string, any> => {
  return {
    ...additionalConditions,
    tenantId,
  };
};

/**
 * Extract tenant ID from request, supporting various methods
 * Prioritizes: URL params > query params > user object
 * @param req Express request object
 * @returns Tenant ID or undefined if not found
 */
export const extractTenantId = (req: Request): number | undefined => {
  // Try URL params
  if (req.params.tenantId && !isNaN(parseInt(req.params.tenantId, 10))) {
    return parseInt(req.params.tenantId, 10);
  }
  
  // Try query params
  if (req.query.tenantId && !isNaN(parseInt(req.query.tenantId as string, 10))) {
    return parseInt(req.query.tenantId as string, 10);
  }
  
  // Try user object (from auth middleware)
  if (req.user?.tenantId) {
    return req.user.tenantId;
  }
  
  return undefined;
};

/**
 * Middleware to enforce tenant ID in all requests
 * Automatically extracts tenant ID and sets it in res.locals
 * Must be used after authenticate middleware
 */
export const requireTenantId = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Super admins are exempt from tenant ID requirement
  if (req.user?.role === 'SUPER_ADMIN') {
    return next();
  }
  
  const tenantId = extractTenantId(req);
  
  if (!tenantId) {
    return next(new ForbiddenError('Tenant ID is required'));
  }
  
  // Verify tenant ID matches user's tenant
  if (req.user && req.user.tenantId !== tenantId) {
    return next(new ForbiddenError('Cannot access resources from another tenant'));
  }
  
  // Store tenant ID in res.locals for use in controllers/services
  res.locals.tenantId = tenantId;
  
  next();
};

/**
 * Middleware to set tenant ID for all database operations
 * If a tenant ID is available in res.locals or req.user
 */
export const setTenantContext = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Skip for super admins if they don't have a specific tenant context
  if (req.user?.role === 'SUPER_ADMIN' && !res.locals.tenantId) {
    return next();
  }
  
  // Use tenant ID from res.locals if available, otherwise from user
  const tenantId = res.locals.tenantId || req.user?.tenantId;
  
  if (!tenantId) {
    return next(new UnauthorizedError('Tenant context required'));
  }
  
  // Store tenant ID in res.locals for use in controllers/services
  res.locals.tenantId = tenantId;
  
  next();
};
