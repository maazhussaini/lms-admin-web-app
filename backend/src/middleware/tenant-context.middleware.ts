/**
 * @file middleware/tenant-context.middleware.ts
 * @description Middleware for establishing tenant context for Prisma operations in a multi-tenant architecture.
 * Enforces tenant isolation by ensuring all database operations are scoped to the appropriate tenant.
 * @author [Your Name]
 * @version 1.0.0
 * @module middleware/tenant-context
 */

import { Request, Response, NextFunction } from 'express';
import { ForbiddenError, UnauthorizedError, TenantError } from '@/utils/api-error.utils.js';
import { TenantStatus } from '@shared/types/tenant.types';
import logger from '@/config/logger.js';

/**
 * Create a tenant-scoped where condition for Prisma queries to enforce data isolation
 * @param tenantId The tenant ID to scope queries to
 * @param additionalConditions Additional where conditions to combine with tenant scoping
 * @returns Combined where condition object for Prisma with tenant isolation
 * @example
 * // In a service:
 * const courses = await prisma.course.findMany({
 *   where: createTenantScopedCondition(tenantId, { status: 'PUBLISHED' })
 * });
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
 * @throws {Error} If tenant ID is invalid format but present
 */
export const extractTenantId = (req: Request): number | undefined => {
  try {
    // Try URL params
    if (req.params.tenantId) {
      const parsedId = parseInt(req.params.tenantId, 10);
      if (isNaN(parsedId)) {
        throw new Error(`Invalid tenant ID format in URL param: ${req.params.tenantId}`);
      }
      return parsedId;
    }
    
    // Try query params
    if (req.query.tenantId) {
      const parsedId = parseInt(req.query.tenantId as string, 10);
      if (isNaN(parsedId)) {
        throw new Error(`Invalid tenant ID format in query param: ${req.query.tenantId}`);
      }
      return parsedId;
    }
    
    // Try user object (from auth middleware)
    if (req.user?.tenantId) {
      return req.user.tenantId;
    }
    
    return undefined;
  } catch (error) {
    logger.warn(`Tenant ID extraction failed: ${(error as Error).message}`);
    return undefined;
  }
};

/**
 * Middleware to enforce tenant ID in all requests
 * Automatically extracts tenant ID and sets it in res.locals
 * Must be used after authenticate middleware
 * @throws {ForbiddenError} When tenant ID is missing or mismatched with user's tenant
 */
export const requireTenantId = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    // Super admins are exempt from tenant ID requirement
    if (req.user?.role === 'SUPER_ADMIN') {
      logger.debug('SUPER_ADMIN exempt from tenant ID requirement');
      return next();
    }
    
    const tenantId = extractTenantId(req);
    
    if (!tenantId) {
      logger.warn(`Tenant ID missing in request: ${req.method} ${req.originalUrl}`);
      return next(new ForbiddenError('Tenant ID is required for this operation'));
    }
    
    // Verify tenant ID matches user's tenant
    if (req.user && req.user.tenantId !== tenantId) {
      logger.warn(`Tenant ID mismatch: User tenant=${req.user.tenantId}, Requested tenant=${tenantId}`);
      return next(new ForbiddenError('Cannot access resources from another tenant'));
    }
    
    // Store tenant ID in res.locals for use in controllers/services
    res.locals.tenantId = tenantId;
    
    next();
  } catch (error) {
    logger.error(`Tenant context error: ${(error as Error).message}`);
    next(error);
  }
};

/**
 * Middleware to set tenant ID for all database operations
 * If a tenant ID is available in res.locals or req.user
 * @throws {UnauthorizedError} When tenant context is required but missing
 */
export const setTenantContext = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    // Skip for super admins if they don't have a specific tenant context
    if (req.user?.role === 'SUPER_ADMIN' && !res.locals.tenantId) {
      logger.debug('SUPER_ADMIN operating without tenant context');
      return next();
    }
    
    // Use tenant ID from res.locals if available, otherwise from user
    const tenantId = res.locals.tenantId || req.user?.tenantId;
    
    if (!tenantId) {
      logger.warn(`Tenant context missing: ${req.method} ${req.originalUrl}`);
      return next(new UnauthorizedError('Tenant context required for this operation'));
    }
    
    // Store tenant ID in res.locals for use in controllers/services
    res.locals.tenantId = tenantId;
    
    // Add tenantId to request logs for audit trail
    logger.debug(`Operation in tenant context: ${tenantId}`);
    
    next();
  } catch (error) {
    logger.error(`Tenant context error: ${(error as Error).message}`);
    next(error);
  }
};

/**
 * Higher-order function to create tenant-aware service methods
 * Enforces tenant isolation at the service layer
 * 
 * @param serviceMethod The service method to wrap with tenant context
 * @returns A function that injects tenant ID into the service method
 * @example
 * // In a controller:
 * const result = await withTenantContext(courseService.findCourses)(res.locals.tenantId, { status: 'PUBLISHED' });
 */
export const withTenantContext = <T, R>(
  serviceMethod: (tenantId: number, ...args: T[]) => Promise<R>
) => {
  return async (tenantId: number, ...args: T[]): Promise<R> => {
    if (!tenantId || typeof tenantId !== 'number') {
      throw new UnauthorizedError('Valid tenant context required');
    }
    return serviceMethod(tenantId, ...args);
  };
};

/** * Verify that the tenant is active before proceeding
 * Can be used as middleware or directly in services
 * 
 * @param tenantId The tenant ID to verify
 * @param tenantService The service for tenant operations (injected to avoid circular dependencies)
 * @throws {TenantError} If tenant is not active or verification fails
 */
export const verifyActiveTenant = async (
  tenantId: number,
  tenantService: { getTenantStatus: (id: number) => Promise<TenantStatus> }
): Promise<void> => {
  try {
    const status = await tenantService.getTenantStatus(tenantId);
      if (status !== TenantStatus.ACTIVE && status !== TenantStatus.TRIAL) {
      logger.warn(`Attempt to access inactive tenant: ${tenantId}, status: ${status}`);
      throw new TenantError('Tenant account is not active', 403, 'TENANT_INACTIVE');
    }  } catch (error) {
    // Rethrow if it's already a TenantError or ForbiddenError
    if (error instanceof TenantError || error instanceof ForbiddenError) {
      throw error;
    }
    
    // Otherwise, log and wrap in a TenantError
    logger.error(`Tenant verification error: ${(error as Error).message}`);
    throw new TenantError('Unable to verify tenant status', 500, 'TENANT_VERIFICATION_ERROR');
  }
};
