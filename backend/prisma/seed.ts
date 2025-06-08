/**
 * @file prisma/seed.ts
 * @description Seed script for initial system setup
 * Creates SUPER_ADMIN role and user if they don't exist
 */

import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../src/utils/password.utils.js';
import { disableTenantIsolationMiddleware } from '../src/config/database.js';
import logger from '../src/config/logger.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Create Prisma client instance
const prisma = new PrismaClient();

/**
 * Main seed function that orchestrates the seeding process
 */
async function main() {
  logger.info('Starting database seeding process...');
  
  // Disable tenant isolation for system-level operations
  disableTenantIsolationMiddleware();
  
  try {
    // Bootstrap process to handle circular dependency between role and user
    
    // 1. Create SUPER_ADMIN role without user reference (to break circular dependency)
    const superAdminRole = await createSuperAdminRole();
    logger.info(`SUPER_ADMIN role configured: ${superAdminRole.role_name} (ID: ${superAdminRole.role_id})`);
    
    // 2. Create SUPER_ADMIN user with role reference
    const superAdmin = await createSuperAdminUser(superAdminRole.role_id);
    logger.info(`SUPER_ADMIN user configured: ${superAdmin.email_address}`);
    
    // 3. Update references after both entities exist
    await updateSelfReferences(superAdmin.system_user_id, superAdminRole.role_id);
    logger.info('Self-references updated successfully');
    
    logger.info('Database seeding completed successfully');
  } catch (error) {
    logger.error('Error during database seeding:', error);
    throw error;
  }
}

/**
 * Creates the SUPER_ADMIN role if it doesn't exist
 */
async function createSuperAdminRole() {
  const existingRole = await prisma.role.findFirst({
    where: { 
      role_name: 'SUPER_ADMIN', 
      is_system_role: true 
    }
  });
  
  if (existingRole) {
    logger.info('SUPER_ADMIN role already exists');
    return existingRole;
  }
  
  logger.info('Creating SUPER_ADMIN role...');
  return prisma.role.create({
    data: {
      role_name: 'SUPER_ADMIN',
      role_description: 'Global system administrator with full access to all features',
      is_system_role: true,
      is_active: true,
      // Don't set created_by initially to avoid circular dependency
      created_by: null, // Set to null initially, will update later
      updated_by: null,
      created_at: new Date(),
      updated_at: new Date(),
      is_deleted: false
    }
  });
}

/**
 * Creates a SUPER_ADMIN user if it doesn't exist
 */
async function createSuperAdminUser(roleId: number) {
  // Get admin credentials from environment vars or use defaults
  const adminEmail = process.env.SUPER_ADMIN_EMAIL || 'admin@lms.example.com';
  const adminFullName = process.env.SUPER_ADMIN_NAME || 'System Administrator';
  const adminUsername = process.env.SUPER_ADMIN_USERNAME || 'admin';
  const adminPassword = process.env.SUPER_ADMIN_PASSWORD || 'Admin@123456';
  
  // Check if user already exists
  const existingUser = await prisma.systemUser.findFirst({
    where: {
      email_address: adminEmail,
      role_id: roleId
    }
  });
  
  if (existingUser) {
    logger.info('SUPER_ADMIN user already exists');
    return existingUser;
  }
  
  // Hash the password
  const passwordHash = await hashPassword(adminPassword);
  
  logger.info('Creating SUPER_ADMIN user...');
  return prisma.systemUser.create({
    data: {
      tenant_id: null, // SUPER_ADMIN is not associated with any tenant
      role_id: roleId,
      username: adminUsername,
      full_name: adminFullName,
      email_address: adminEmail,
      password_hash: passwordHash,
      system_user_status: 'ACTIVE',
      is_active: true,
      created_by: null, // Set to null initially, will update later
      updated_by: null,
      created_at: new Date(),
      updated_at: new Date(),
      is_deleted: false
    }
  });
}

/**
 * Updates self-references to maintain data integrity
 */
async function updateSelfReferences(userId: number, roleId: number) {
  try {
    // Update user record to reference itself as creator
    await prisma.systemUser.update({
      where: { system_user_id: userId },
      data: { created_by: userId }
    });
    logger.info(`Updated user ${userId} to reference itself as creator`);
    
    // Update role record to reference the admin user as creator
    await prisma.role.update({
      where: { role_id: roleId },
      data: { created_by: userId }
    });
    logger.info(`Updated role ${roleId} to reference user ${userId} as creator`);
  } catch (error) {
    logger.error('Error updating self-references:', error);
    throw error;
  }
}

// Execute seed function
main()
  .catch((error) => {
    logger.error('Fatal error during seeding:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    logger.info('Database connection closed');
  });
