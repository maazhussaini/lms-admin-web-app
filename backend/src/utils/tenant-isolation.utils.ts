/**
 * @file Tenant Isolation Utilities
 * @description Common utilities for implementing tenant isolation in services
 */

import { TokenPayload } from '@/utils/jwt.utils';
import { UserType } from '@/types/enums.types';

/**
 * Options for tenant isolation in database queries
 */
export interface TenantIsolationOptions {
  /**
   * Field name for tenant ID in the database
   */
  tenantField?: string;
  
  /**
   * Whether to apply tenant isolation for super admins
   */
  applyToSuperAdmin?: boolean;
  
  /**
   * Custom tenant ID to use (for super admin operations)
   */
  forceTenantId?: number | null;
}

/**
 * Default tenant isolation options
 */
const DEFAULT_TENANT_OPTIONS: Required<TenantIsolationOptions> = {
  tenantField: 'tenant_id',
  applyToSuperAdmin: false,
  forceTenantId: null
};

/**
 * Check if a user can access data across all tenants
 * 
 * @param requestingUser User making the request
 * @param options Tenant isolation options
 * @returns True if user can access all tenants
 */
export function canAccessAllTenants(
  requestingUser: TokenPayload,
  options: TenantIsolationOptions = {}
): boolean {
  const opts = { ...DEFAULT_TENANT_OPTIONS, ...options };
  
  if (opts.applyToSuperAdmin) {
    return false; // Force tenant isolation even for super admins
  }
  
  return requestingUser.user_type === UserType.SUPER_ADMIN;
}

/**
 * Get tenant constraint for database queries
 * 
 * @param requestingUser User making the request
 * @param options Tenant isolation options
 * @returns Prisma where clause for tenant isolation
 */
export function getTenantConstraint(
  requestingUser: TokenPayload,
  options: TenantIsolationOptions = {}
): Record<string, any> {
  const opts = { ...DEFAULT_TENANT_OPTIONS, ...options };
  const constraint: Record<string, any> = {};
  
  // If force tenant ID is specified, use it
  if (opts.forceTenantId !== null) {
    constraint[opts.tenantField] = opts.forceTenantId;
    return constraint;
  }
  
  // Apply tenant isolation based on user type
  if (!canAccessAllTenants(requestingUser, options)) {
    constraint[opts.tenantField] = requestingUser.tenantId;
  }
  
  return constraint;
}

/**
 * Build base filters with tenant isolation and soft delete protection
 * 
 * @param requestingUser User making the request
 * @param options Tenant isolation options
 * @returns Base Prisma where clause
 */
export function buildBaseFilters(
  requestingUser: TokenPayload,
  options: TenantIsolationOptions = {}
): Record<string, any> {
  const baseFilters: Record<string, any> = {
    is_deleted: false,
    ...getTenantConstraint(requestingUser, options)
  };
  
  return baseFilters;
}

/**
 * Build filters for entity access by ID with tenant isolation
 * 
 * @param entityId ID of the entity to access
 * @param requestingUser User making the request
 * @param options Tenant isolation options
 * @returns Prisma where clause for entity access
 */
export function buildEntityAccessFilters(
  entityId: number,
  requestingUser: TokenPayload,
  primaryKeyField: string = 'id',
  options: TenantIsolationOptions = {}
): Record<string, any> {
  return {
    [primaryKeyField]: entityId,
    ...buildBaseFilters(requestingUser, options)
  };
}

/**
 * Validate tenant access for an entity
 * Used after fetching an entity to ensure the requesting user can access it
 * 
 * @param entity The entity to validate access for
 * @param requestingUser User making the request
 * @param options Tenant isolation options
 * @throws ForbiddenError if access is denied
 */
export function validateTenantAccess(
  entity: any,
  requestingUser: TokenPayload,
  options: TenantIsolationOptions = {}
): void {
  const opts = { ...DEFAULT_TENANT_OPTIONS, ...options };
  
  // Super admins can access all entities (unless forced isolation)
  if (canAccessAllTenants(requestingUser, options)) {
    return;
  }
  
  // Check if entity belongs to user's tenant
  const entityTenantId = entity[opts.tenantField];
  if (entityTenantId !== requestingUser.tenantId) {
    throw new Error(`Access denied: Entity belongs to a different tenant`);
  }
}

/**
 * Create audit fields for entity creation
 * 
 * @param requestingUser User creating the entity
 * @param clientIp IP address of the request
 * @returns Audit fields for creation
 */
export function createAuditFields(
  requestingUser: TokenPayload,
  clientIp?: string
): Record<string, any> {
  return {
    created_by: requestingUser.id,
    created_ip: clientIp || null,
    created_at: new Date(),
    is_active: true,
    is_deleted: false
  };
}

/**
 * Create audit fields for entity updates
 * 
 * @param requestingUser User updating the entity
 * @param clientIp IP address of the request
 * @returns Audit fields for updates
 */
export function updateAuditFields(
  requestingUser: TokenPayload,
  clientIp?: string
): Record<string, any> {
  return {
    updated_by: requestingUser.id,
    updated_ip: clientIp || null,
    updated_at: new Date()
  };
}

/**
 * Create audit fields for entity soft deletion
 * 
 * @param requestingUser User deleting the entity
 * @param clientIp IP address of the request
 * @returns Audit fields for soft deletion
 */
export function deleteAuditFields(
  requestingUser: TokenPayload,
  clientIp?: string
): Record<string, any> {
  return {
    is_deleted: true,
    is_active: false,
    deleted_by: requestingUser.id,
    deleted_at: new Date(),
    ...updateAuditFields(requestingUser, clientIp)
  };
}
