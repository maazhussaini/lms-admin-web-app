/**
 * @file core-enum-constraints.types.ts
 * @description Core system enum constraints for tenant, client, and contact entities.
 */

import { EnumConstraint } from '../base-constraint.types';

/**
 * Core system enum constraints following PostgreSQL naming conventions
 */
export const CORE_ENUM_CONSTRAINTS: Record<string, EnumConstraint> = {
  // Tenant status enum
  TENANT_STATUS_ENUM: {
    table: 'tenants',
    constraintName: 'chk_tenant_status_valid',
    column: 'tenant_status',
    enumName: 'TenantStatus',
    enumValues: { 
      ACTIVE: 1, 
      SUSPENDED: 2, 
      TRIAL: 3, 
      EXPIRED: 4, 
      CANCELLED: 5 
    },
    description: 'Validates tenant operational status values'
  },

  // Client status enum
  CLIENT_STATUS_ENUM: {
    table: 'clients',
    constraintName: 'chk_client_status_valid',
    column: 'client_status',
    enumName: 'ClientStatus',
    enumValues: { 
      ACTIVE: 1, 
      INACTIVE: 2, 
      SUSPENDED: 3, 
      TERMINATED: 4 
    },
    description: 'Validates client operational status values'
  },

  // System user status enum
  SYSTEM_USER_STATUS_ENUM: {
    table: 'system_users',
    constraintName: 'chk_system_user_status_valid',
    column: 'system_user_status',
    enumName: 'SystemUserStatus',
    enumValues: { 
      ACTIVE: 1, 
      INACTIVE: 2, 
      SUSPENDED: 3, 
      LOCKED: 4 
    },
    description: 'Validates system user operational status values'
  },

  // System user role enum
  SYSTEM_USER_ROLE_ENUM: {
    table: 'system_users',
    constraintName: 'chk_system_user_role_valid',
    column: 'role_id',
    enumName: 'SystemUserRole',
    enumValues: { 
      SUPERADMIN: 1, 
      TENANT_ADMIN: 2 
    },
    description: 'Validates system user role values'
  },

  // Contact type enums
  CONTACT_TYPE_ENUM: {
    table: 'tenant_phone_numbers,tenant_email_addresses',
    constraintName: 'chk_contact_type_valid',
    column: 'contact_type',
    enumName: 'ContactType',
    enumValues: { 
      PRIMARY: 1, 
      SECONDARY: 2, 
      EMERGENCY: 3, 
      BILLING: 4 
    },
    description: 'Validates contact type classification for tenant contacts'
  },
};
