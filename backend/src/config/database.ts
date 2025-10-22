/**
 * @file config/database.ts
 * @description Prisma client configuration and initialization with multi-tenant support.
 * Implements extended client pattern with middleware for soft deletes and tenant isolation.
 */

import { PrismaClient, Prisma } from '@prisma/client';
import logger from './logger';
import env from './environment';

/**
 * Type for query event from Prisma
 */
type QueryEvent = {
  timestamp: Date;
  query: string;
  params: string;
  duration: number;
  target: string;
};

/**
 * Database configuration defaults
 */
const DB_CONFIG = {
  SLOW_QUERY_THRESHOLD_MS: 1000,    // Default threshold for slow query warnings: 1000ms
  TX_MAX_WAIT_MS: 5000,             // Default max wait time for transaction to start: 5000ms
  TX_TIMEOUT_MS: 10000,             // Default max time for transaction to complete: 10000ms
  ENABLE_METRICS: false,            // Default setting for DB metrics collection
};

/**
 * Type for extended Prisma client with additional methods
 */
export type ExtendedPrismaClient = PrismaClient & {
  /**
   * Execute a function within a transaction
   * @param fn Function to execute within transaction
   * @returns Result of the function
   */
  $executeWithTransaction: <T>(fn: (tx: Prisma.TransactionClient) => Promise<T>) => Promise<T>;
  
  /**
   * Execute a batch of operations in a transaction with proper error handling
   * @param operations Array of functions to execute with the transaction client
   * @returns Array of results from operations
   */
  $executeBatch: <T>(operations: ((tx: Prisma.TransactionClient) => Promise<T>)[]) => Promise<T[]>;
};

// Configure Prisma client options with correct log types
const prismaClientOptions: Prisma.PrismaClientOptions = env.IS_DEVELOPMENT
  ? {
      log: [
        { emit: 'event', level: 'query' } as Prisma.LogDefinition,
        { emit: 'stdout', level: 'error' } as Prisma.LogDefinition,
        { emit: 'stdout', level: 'info' } as Prisma.LogDefinition,
        { emit: 'stdout', level: 'warn' } as Prisma.LogDefinition,
      ],
      errorFormat: 'pretty',
    }
  : {
      log: [
        { emit: 'stdout', level: 'error' } as Prisma.LogDefinition,
        { emit: 'stdout', level: 'warn' } as Prisma.LogDefinition,
      ],
    };

// Create base Prisma client instance
const basePrisma = new PrismaClient(prismaClientOptions);

// Create extended Prisma client with additional functionality
const prisma = basePrisma.$extends({
  name: 'LmsExtendedClient',
  query: {
    $allOperations({ operation, model, args, query }) {
      const startTime = Date.now();
      
      return query(args).then((result) => {
        if (env.IS_DEVELOPMENT) {
          const duration = Date.now() - startTime;
          if (duration > DB_CONFIG.SLOW_QUERY_THRESHOLD_MS) {
            logger.warn(`Slow query detected (${duration}ms): ${operation} on ${model}`, { 
              operation, model, duration, args 
            });
          }
        }
        return result;
      });
    },
  },
}) as unknown as ExtendedPrismaClient;

// Add transaction helper methods to extended client
prisma.$executeWithTransaction = async <T>(fn: (tx: Prisma.TransactionClient) => Promise<T>): Promise<T> => {
  try {
    return await prisma.$transaction(async (tx) => {
      return await fn(tx);
    }, { 
      maxWait: DB_CONFIG.TX_MAX_WAIT_MS, 
      timeout: DB_CONFIG.TX_TIMEOUT_MS
    });
  } catch (error) {
    logger.error('Transaction failed', error);
    throw error;
  }
};

prisma.$executeBatch = async <T>(operations: ((tx: Prisma.TransactionClient) => Promise<T>)[]): Promise<T[]> => {
  return await prisma.$executeWithTransaction(async (tx) => {
    const results: T[] = [];
    for (const operation of operations) {
      results.push(await operation(tx));
    }
    return results;
  });
};

// Set up query logging and performance metrics for development
if (env.IS_DEVELOPMENT) {
  basePrisma.$on('query' as never, ((event: QueryEvent) => {
    logger.debug(`Prisma Query: ${event.query}`);
    logger.debug(`Prisma Params: ${JSON.stringify(event.params)}`);
    logger.debug(`Prisma Duration: ${event.duration}ms`);
    
    // Track performance metrics in development
    if (DB_CONFIG.ENABLE_METRICS) {
      // Could add integration with monitoring tools here
    }
  }) as unknown as any);
}

/**
 * Soft delete middleware configuration
 */
interface SoftDeleteConfig {
  /**
   * Models that don't use soft delete pattern
   */
  excludedModels: string[];
  
  /**
   * Field names for soft delete
   */
  fields: {
    isDeleted: string;
    deletedAt: string;
  };
}

/**
 * Configuration for soft delete middleware
 */
const SOFT_DELETE_CONFIG: SoftDeleteConfig = {
  excludedModels: ['SystemLog', 'Migration', 'AuditLog'],
  fields: {
    isDeleted: 'is_deleted',
    deletedAt: 'deleted_at',
  }
};

/**
 * Prisma middleware for soft deletes
 * This middleware automatically filters out soft-deleted records
 * and converts delete operations into updates with is_deleted=true
 */
basePrisma.$use(async (params: Prisma.MiddlewareParams, next) => {
  try {
    // Skip soft delete handling for models that don't have is_deleted field
    if (!params.model || SOFT_DELETE_CONFIG.excludedModels.includes(params.model)) {
      return next(params);
    }

    // List of read operations that need soft delete filtering
    const readOperations = [
      'findUnique', 
      'findFirst', 
      'findMany', 
      'count', 
      'aggregate', 
      'groupBy',
      'findFirstOrThrow',
      'findUniqueOrThrow'
    ];

    // For all read operations, automatically filter out soft-deleted records
    if (readOperations.includes(params.action)) {
      // Initialize args if not present
      if (!params.args) {
        params.args = {};
      }
      
      // Initialize where clause if not present
      if (!params.args.where) {
        params.args.where = {};
      }
      
      // Add is_deleted filter if it doesn't exist
      // This allows explicit override by setting is_deleted to true
      if (params.args.where[SOFT_DELETE_CONFIG.fields.isDeleted] === undefined) {
        params.args.where[SOFT_DELETE_CONFIG.fields.isDeleted] = false;
      }
    }
    
    // Convert delete operations to soft deletes
    if (params.action === 'delete') {
      // Change to an update with soft delete values
      params.action = 'update';
      if (!params.args.data) {
        params.args.data = { 
          [SOFT_DELETE_CONFIG.fields.isDeleted]: true,
          [SOFT_DELETE_CONFIG.fields.deletedAt]: new Date(),
        };
      } else {
        params.args.data[SOFT_DELETE_CONFIG.fields.isDeleted] = true;
        params.args.data[SOFT_DELETE_CONFIG.fields.deletedAt] = new Date();
      }
    }
    
    // Handle bulk delete operations
    if (params.action === 'deleteMany') {
      // Change to an updateMany with soft delete values
      params.action = 'updateMany';
      if (!params.args.data) {
        params.args.data = { 
          [SOFT_DELETE_CONFIG.fields.isDeleted]: true,
          [SOFT_DELETE_CONFIG.fields.deletedAt]: new Date(),
        };
      } else {
        params.args.data[SOFT_DELETE_CONFIG.fields.isDeleted] = true;
        params.args.data[SOFT_DELETE_CONFIG.fields.deletedAt] = new Date();
      }
    }
    
    return next(params);
  } catch (error) {
    logger.error('Error in soft delete middleware:', error);
    return next(params);
  }
});

/**
 * Tenant isolation configuration
 */
interface TenantIsolationConfig {
  /**
   * Field name for tenant ID
   */
  tenantIdField: string;
  
  /**
   * Models exempt from tenant isolation
   */
  globalModels: string[];
}

/**
 * Configuration for tenant isolation middleware
 */
const TENANT_ISOLATION_CONFIG: TenantIsolationConfig = {
  tenantIdField: 'tenant_id',
  globalModels: [
    'SystemUser', 
    'Client', 
    'SystemLog', 
    'Migration', 
    'AuditLog', 
    'Country', 
    'State', 
    'City'
  ],
};

/**
 * Tenant isolation state
 */
const tenantContext = {
  isEnabled: false,
  currentTenantId: null as number | null,
};

/**
 * Enable tenant isolation middleware with the specified tenant ID
 * @param tenantId The tenant ID to use for data isolation
 */
export const enableTenantIsolationMiddleware = (tenantId: number): void => {
  tenantContext.isEnabled = true;
  tenantContext.currentTenantId = tenantId;
  logger.debug(`Tenant isolation enabled for tenant_id: ${tenantId}`);
};

/**
 * Disable tenant isolation middleware
 * Used for system-level operations that should operate across all tenants
 */
export const disableTenantIsolationMiddleware = (): void => {
  tenantContext.isEnabled = false;
  tenantContext.currentTenantId = null;
  logger.debug('Tenant isolation disabled');
};

/**
 * Get current tenant ID from context
 * @returns Current tenant ID or null if isolation is disabled
 */
export const getCurrentTenantId = (): number | null => {
  return tenantContext.currentTenantId;
};

/**
 * Check if tenant isolation is currently enabled
 * @returns True if tenant isolation is enabled
 */
export const isTenantIsolationEnabled = (): boolean => {
  return tenantContext.isEnabled;
};

/**
 * Tenant isolation middleware
 * Automatically adds tenant_id filters to database operations
 */
basePrisma.$use(async (params: Prisma.MiddlewareParams, next) => {
  try {
    // Skip tenant isolation if disabled or for system-level models
    if (
      !tenantContext.isEnabled || 
      !tenantContext.currentTenantId || 
      !params.model ||
      TENANT_ISOLATION_CONFIG.globalModels.includes(params.model)
    ) {
      return next(params);
    }
    
    const tenantIdField = TENANT_ISOLATION_CONFIG.tenantIdField;
    const tenantId = tenantContext.currentTenantId;
    
    // Add tenant_id filter to query operations
    if (['findMany', 'findFirst', 'findUnique', 'count', 'aggregate'].includes(params.action)) {
      if (!params.args) {
        params.args = { where: { [tenantIdField]: tenantId } };
      } else if (!params.args.where) {
        params.args.where = { [tenantIdField]: tenantId };
      } else if (params.args.where[tenantIdField] === undefined) {
        params.args.where[tenantIdField] = tenantId;
      }
    }
    
    // Add tenant_id to create operations
    if (params.action === 'create') {
      if (!params.args) {
        params.args = { data: { [tenantIdField]: tenantId } };
      } else if (!params.args.data) {
        params.args.data = { [tenantIdField]: tenantId };
      } else if (params.args.data[tenantIdField] === undefined) {
        params.args.data[tenantIdField] = tenantId;
      }
    }
    
    // Add tenant_id filter to update/delete operations
    if (['update', 'delete', 'updateMany', 'deleteMany'].includes(params.action)) {
      if (!params.args) {
        params.args = { where: { [tenantIdField]: tenantId } };
      } else if (!params.args.where) {
        params.args.where = { [tenantIdField]: tenantId };
      } else if (params.args.where[tenantIdField] === undefined) {
        params.args.where[tenantIdField] = tenantId;
      }
    }
    
    return next(params);
  } catch (error) {
    logger.error('Error in tenant isolation middleware:', error);
    return next(params);
  }
});

/**
 * Initialize database connection with retry logic
 * @param maxRetries Maximum number of connection attempts
 * @param retryDelay Delay between retries in ms
 */
export const initializeDatabaseConnection = async (
  maxRetries = 5,
  retryDelay = 5000
): Promise<void> => {
  let retries = 0;
  let connected = false;

  while (!connected && retries < maxRetries) {
    try {
      await prisma.$connect();
      connected = true;
      logger.info('Successfully connected to the database');
    } catch (error) {
      retries++;
      logger.error(`Failed to connect to the database (attempt ${retries}/${maxRetries})`, error);
      
      if (retries >= maxRetries) {
        logger.error('Maximum connection retry attempts reached. Exiting...');
        process.exit(1);
      }
      
      logger.info(`Retrying in ${retryDelay / 1000} seconds...`);
      await new Promise(resolve => setTimeout(resolve, retryDelay));
    }
  }
};

/**
 * Handle graceful shutdown of database connections
 */
export const handleDatabaseShutdown = async (): Promise<void> => {
  try {
    logger.info('Closing database connections...');
    await prisma.$disconnect();
    logger.info('Database connections closed successfully');
  } catch (error) {
    logger.error('Error while closing database connections:', error);
  }
};

// Initialize connection for immediate use (auto-connect)
// Can be disabled by setting DB_AUTO_CONNECT=false in environment
if (env.DB_AUTO_CONNECT) {
  initializeDatabaseConnection()
    .catch((error) => {
      logger.error('Failed to auto-connect to database:', error);
    });
}

// Register termination handlers for graceful shutdown
process.on('SIGINT', async () => {
  logger.info('SIGINT received. Starting graceful shutdown...');
  await handleDatabaseShutdown();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  logger.info('SIGTERM received. Starting graceful shutdown...');
  await handleDatabaseShutdown();
  process.exit(0);
});

// Monitor uncaught exceptions to ensure DB connections are properly closed
process.on('uncaughtException', async (error) => {
  logger.error('Uncaught exception:', error);
  await handleDatabaseShutdown();
  process.exit(1);
});

export default prisma as ExtendedPrismaClient;
