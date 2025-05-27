/**
 * @file core-indexes.types.ts
 * @description Performance indexes for core system entities (tenant, client, geographic, audit, permissions).
 */

import { IndexConstraint } from '../base-constraint.types';

/**
 * Core system performance indexes
 */
export const CORE_PERFORMANCE_INDEXES: Record<string, IndexConstraint> = {
  // Universal tenant-based indexes - excluding system_users
  TENANT_BASED_QUERIES: {
    table: 'clients,tenant_phone_numbers,tenant_email_addresses,client_tenants,user_screens,role_screens',
    constraintName: 'idx_tenant_active_records',
    indexName: 'idx_tenant_active_records',
    columns: ['tenant_id', 'is_active', 'is_deleted'],
    indexType: 'BTREE',
    isUnique: false,
    description: 'Optimize tenant-based active record queries'
  },

  // System user specific indexes
  SYSTEM_USER_TENANT_LOOKUP: {
    table: 'system_users',
    constraintName: 'idx_system_user_tenant_lookup',
    indexName: 'idx_system_user_tenant_lookup',
    columns: ['tenant_id', 'is_active', 'is_deleted'],
    indexType: 'BTREE',
    isUnique: false,
    isPartial: true,
    condition: 'tenant_id IS NOT NULL',
    description: 'Optimize tenant-based system user queries'
  },

  SYSTEM_USER_SUPERADMIN_LOOKUP: {
    table: 'system_users',
    constraintName: 'idx_system_user_superadmin_lookup',
    indexName: 'idx_system_user_superadmin_lookup',
    columns: ['role_id', 'is_active', 'is_deleted'],
    indexType: 'BTREE',
    isUnique: false,
    isPartial: true,
    condition: 'tenant_id IS NULL',
    description: 'Optimize SuperAdmin user queries'
  },

  SYSTEM_USER_USERNAME_GLOBAL: {
    table: 'system_users',
    constraintName: 'idx_system_user_username_global',
    indexName: 'idx_system_user_username_global',
    columns: ['username'],
    indexType: 'BTREE',
    isUnique: true,
    isPartial: true,
    condition: 'tenant_id IS NULL',
    description: 'Optimize SuperAdmin username uniqueness'
  },

  SYSTEM_USER_USERNAME_TENANT: {
    table: 'system_users',
    constraintName: 'idx_system_user_username_tenant',
    indexName: 'idx_system_user_username_tenant',
    columns: ['username', 'tenant_id'],
    indexType: 'BTREE',
    isUnique: true,
    isPartial: true,
    condition: 'tenant_id IS NOT NULL',
    description: 'Optimize tenant user username uniqueness'
  },

  // Audit trail indexes
  AUDIT_CREATED_BY: {
    table: '*',
    constraintName: 'idx_audit_created_by_date',
    indexName: 'idx_audit_created_by_date',
    columns: ['created_by', 'created_at'],
    indexType: 'BTREE',
    isUnique: false,
    description: 'Optimize audit trail queries by creator'
  },

  // Soft delete indexes
  ACTIVE_RECORDS_ONLY: {
    table: '*',
    constraintName: 'idx_active_records',
    indexName: 'idx_active_records',
    columns: ['is_active', 'is_deleted'],
    indexType: 'BTREE',
    isUnique: false,
    isPartial: true,
    condition: 'is_active = true AND is_deleted = false',
    description: 'Optimize queries for active records only'
  },

  // Tenant-specific indexes
  TENANT_NAME_SEARCH: {
    table: 'tenants',
    constraintName: 'idx_tenant_name_search',
    indexName: 'idx_tenant_name_search',
    columns: ['tenant_name'],
    indexType: 'BTREE',
    isUnique: true,
    description: 'Optimize tenant name searches and uniqueness'
  },

  TENANT_ACTIVE_LOOKUP: {
    table: 'tenants',
    constraintName: 'idx_tenant_active_lookup',
    indexName: 'idx_tenant_active_lookup',
    columns: ['is_active', 'is_deleted'],
    indexType: 'BTREE',
    isUnique: false,
    description: 'Optimize active tenant lookups'
  },

  // Client indexes
  CLIENT_EMAIL_TENANT_LOOKUP: {
    table: 'clients',
    constraintName: 'idx_client_email_tenant',
    indexName: 'idx_client_email_tenant',
    columns: ['email_address', 'tenant_id'],
    indexType: 'BTREE',
    isUnique: true,
    description: 'Optimize client email lookups within tenant'
  },

  CLIENT_TENANT_ACTIVE: {
    table: 'clients',
    constraintName: 'idx_client_tenant_active',
    indexName: 'idx_client_tenant_active',
    columns: ['tenant_id', 'is_active', 'is_deleted'],
    indexType: 'BTREE',
    isUnique: false,
    description: 'Optimize active client queries by tenant'
  },

  CLIENT_NAME_SEARCH: {
    table: 'clients',
    constraintName: 'idx_client_name_search',
    indexName: 'idx_client_name_search',
    columns: ['full_name', 'tenant_id'],
    indexType: 'BTREE',
    isUnique: false,
    description: 'Optimize client name searches within tenant'
  },

  // Tenant contact indexes
  TENANT_PHONE_PRIMARY_LOOKUP: {
    table: 'tenant_phone_numbers',
    constraintName: 'idx_tenant_phone_primary',
    indexName: 'idx_tenant_phone_primary',
    columns: ['tenant_id', 'is_primary'],
    indexType: 'BTREE',
    isUnique: false,
    description: 'Optimize primary phone number lookups'
  },

  TENANT_EMAIL_PRIMARY_LOOKUP: {
    table: 'tenant_email_addresses',
    constraintName: 'idx_tenant_email_primary',
    indexName: 'idx_tenant_email_primary',
    columns: ['tenant_id', 'is_primary'],
    indexType: 'BTREE',
    isUnique: false,
    description: 'Optimize primary email address lookups'
  },

  // Client-tenant association indexes
  CLIENT_TENANT_ASSOCIATION_LOOKUP: {
    table: 'client_tenants',
    constraintName: 'idx_client_tenant_association',
    indexName: 'idx_client_tenant_association',
    columns: ['client_id', 'tenant_id'],
    indexType: 'BTREE',
    isUnique: true,
    description: 'Optimize client-tenant association lookups'
  },

  CLIENT_TENANTS_BY_CLIENT: {
    table: 'client_tenants',
    constraintName: 'idx_client_tenants_by_client',
    indexName: 'idx_client_tenants_by_client',
    columns: ['client_id', 'is_active'],
    indexType: 'BTREE',
    isUnique: false,
    description: 'Optimize tenant lookups by client'
  },

  TENANT_CLIENTS_BY_TENANT: {
    table: 'client_tenants',
    constraintName: 'idx_tenant_clients_by_tenant',
    indexName: 'idx_tenant_clients_by_tenant',
    columns: ['tenant_id', 'is_active'],
    indexType: 'BTREE',
    isUnique: false,
    description: 'Optimize client lookups by tenant'
  },

  // Geographic indexes
  COUNTRY_NAME_LOOKUP: {
    table: 'countries',
    constraintName: 'idx_country_name',
    indexName: 'idx_country_name',
    columns: ['name'],
    indexType: 'BTREE',
    isUnique: false,
    description: 'Optimize country name searches'
  },

  STATE_COUNTRY_LOOKUP: {
    table: 'states',
    constraintName: 'idx_state_country',
    indexName: 'idx_state_country',
    columns: ['country_id', 'name'],
    indexType: 'BTREE',
    isUnique: false,
    description: 'Optimize state by country queries'
  },

  CITY_STATE_LOOKUP: {
    table: 'cities',
    constraintName: 'idx_city_state',
    indexName: 'idx_city_state',
    columns: ['state_id', 'name'],
    indexType: 'BTREE',
    isUnique: false,
    description: 'Optimize city by state queries'
  },

  // Permission indexes
  USER_SCREEN_PERMISSIONS: {
    table: 'user_screens',
    constraintName: 'idx_user_screen_permissions',
    indexName: 'idx_user_screen_permissions',
    columns: ['system_user_id', 'screen_id'],
    indexType: 'BTREE',
    isUnique: true,
    description: 'Optimize user permission lookups'
  },

  ROLE_SCREEN_PERMISSIONS: {
    table: 'role_screens',
    constraintName: 'idx_role_screen_permissions',
    indexName: 'idx_role_screen_permissions',
    columns: ['role_id', 'screen_id'],
    indexType: 'BTREE',
    isUnique: true,
    description: 'Optimize role permission lookups'
  },

  SCREEN_HIERARCHY: {
    table: 'screens',
    constraintName: 'idx_screen_hierarchy',
    indexName: 'idx_screen_hierarchy',
    columns: ['parent_screen_id', 'is_active'],
    indexType: 'BTREE',
    isUnique: false,
    description: 'Optimize screen hierarchy queries'
  },
};
