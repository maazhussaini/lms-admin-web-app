/**
 * @file config/database.ts
 * @description Prisma client configuration and initialization with multi-tenant support.
 */

import { PrismaClient, Prisma } from '@prisma/client';
import logger from './logger.js';
import env from './environment.js';

// Create Prisma client with logging options based on environment
// Configure Prisma client options with correct log types
const prismaClientOptions: Prisma.PrismaClientOptions = env.IS_DEVELOPMENT
  ? {
      log: [
        { emit: 'event', level: 'query' } as Prisma.LogDefinition,
        { emit: 'stdout', level: 'error' } as Prisma.LogDefinition,
        { emit: 'stdout', level: 'info' } as Prisma.LogDefinition,
        { emit: 'stdout', level: 'warn' } as Prisma.LogDefinition,
      ],
    }
  : {
      log: [
        { emit: 'stdout', level: 'error' } as Prisma.LogDefinition,
        { emit: 'stdout', level: 'warn' } as Prisma.LogDefinition,
      ],
    };

// Create Prisma client instance
const prisma = new PrismaClient(prismaClientOptions);

// Set up query logging for development
if (env.IS_DEVELOPMENT) {
  // @ts-ignore: using 'query' event without narrowing Prisma log definitions
  prisma.$on('query', (e: any) => {
    logger.debug(`Prisma Query: ${e.query}`);
    logger.debug(`Prisma Params: ${JSON.stringify(e.params)}`);
    logger.debug(`Prisma Duration: ${e.duration}ms`);
  });
}

/**
 * Prisma middleware for soft deletes
 * This middleware automatically filters out soft-deleted records
 * and converts delete operations into updates with is_deleted=true
 */
prisma.$use(async (params: Prisma.MiddlewareParams, next) => {
  // Skip soft delete handling for models that don't have is_deleted field
  const modelsWithoutSoftDelete = ['SystemLog', 'Migration', 'AuditLog'];
  if (params.model && modelsWithoutSoftDelete.includes(params.model)) {
    return next(params);
  }

  // For find operations, automatically filter out soft-deleted records
  if (params.action === 'findUnique' || params.action === 'findFirst') {
    if (params.args && params.args.where) {
      // Add is_deleted filter if it doesn't exist
      if (params.args.where.is_deleted === undefined) {
        params.args.where.is_deleted = false;
      }
    }
  }
  
  if (params.action === 'findMany') {
    // Add is_deleted filter if it doesn't exist
    if (!params.args) {
      params.args = { where: { is_deleted: false } };
    } else if (!params.args.where) {
      params.args.where = { is_deleted: false };
    } else if (params.args.where.is_deleted === undefined) {
      params.args.where.is_deleted = false;
    }
  }
  
  // Convert delete operations to soft deletes
  if (params.action === 'delete') {
    // Change to an update with soft delete values
    // @ts-ignore: override action for soft delete
    (params as any).action = 'update';
    if (!params.args.data) {
      params.args.data = { 
        is_deleted: true,
        deleted_at: new Date(),
      };
    } else {
      params.args.data.is_deleted = true;
      params.args.data.deleted_at = new Date();
    }
  }
  
  // Handle bulk delete operations
  if (params.action === 'deleteMany') {
    // Change to an updateMany with soft delete values
    // @ts-ignore: override action for soft delete
    (params as any).action = 'updateMany';
    if (!params.args.data) {
      params.args.data = { 
        is_deleted: true,
        deleted_at: new Date(),
      };
    } else {
      params.args.data.is_deleted = true;
      params.args.data.deleted_at = new Date();
    }
  }
  
  return next(params);
});

/**
 * Tenant isolation configuration
 * Controls how the middleware applies tenant filtering
 */
// Tenant isolation settings
let enableTenantIsolation = false;
let currentTenantId: number | null = null;

/**
 * Enable tenant isolation middleware with the specified tenant ID
 * @param tenantId The tenant ID to use for data isolation
 */
export const enableTenantIsolationMiddleware = (tenantId: number): void => {
  enableTenantIsolation = true;
  currentTenantId = tenantId;
  logger.debug(`Tenant isolation enabled for tenant_id: ${tenantId}`);
};

/**
 * Disable tenant isolation middleware
 * Used for system-level operations that should operate across all tenants
 */
export const disableTenantIsolationMiddleware = (): void => {
  enableTenantIsolation = false;
  currentTenantId = null;
  logger.debug('Tenant isolation disabled');
};

/**
 * Tenant isolation middleware
 * Automatically adds tenant_id filters to database operations
 */
prisma.$use(async (params: Prisma.MiddlewareParams, next) => {
  // Skip tenant isolation if disabled or for system-level models
  if (
    !enableTenantIsolation || 
    !currentTenantId || 
    !params.model ||
    ['SystemUser', 'Client', 'SystemLog', 'Migration', 'AuditLog', 'Country', 'State', 'City'].includes(params.model)
  ) {
    return next(params);
  }
  
  // Add tenant_id filter to query operations
  if (['findMany', 'findFirst', 'findUnique', 'count', 'aggregate'].includes(params.action)) {
    if (!params.args) {
      params.args = { where: { tenant_id: currentTenantId } };
    } else if (!params.args.where) {
      params.args.where = { tenant_id: currentTenantId };
    } else if (params.args.where.tenant_id === undefined) {
      params.args.where.tenant_id = currentTenantId;
    }
  }
  
  // Add tenant_id to create operations
  if (params.action === 'create') {
    if (!params.args) {
      params.args = { data: { tenant_id: currentTenantId } };
    } else if (!params.args.data) {
      params.args.data = { tenant_id: currentTenantId };
    } else if (params.args.data.tenant_id === undefined) {
      params.args.data.tenant_id = currentTenantId;
    }
  }
  
  // Add tenant_id filter to update/delete operations
  if (['update', 'delete', 'updateMany', 'deleteMany'].includes(params.action)) {
    if (!params.args) {
      params.args = { where: { tenant_id: currentTenantId } };
    } else if (!params.args.where) {
      params.args.where = { tenant_id: currentTenantId };
    } else if (params.args.where.tenant_id === undefined) {
      params.args.where.tenant_id = currentTenantId;
    }
  }
  
  return next(params);
});

// Initialize database connection
prisma.$connect()
  .then(() => {
    logger.info('Successfully connected to the database');
  })
  .catch((error: unknown) => {
    logger.error('Failed to connect to the database', error);
    process.exit(1);
  });

// Handle process termination gracefully
const handleProcessTermination = async (): Promise<void> => {
  logger.info('Closing database connections...');
  await prisma.$disconnect();
  logger.info('Database connections closed');
  process.exit(0);
};

// Register termination handlers
process.on('SIGINT', handleProcessTermination);
process.on('SIGTERM', handleProcessTermination);

export default prisma;
