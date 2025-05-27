/**
 * @file core-unique-constraints.types.ts
 * @description Unique constraints for core system entities (tenant, client, geographic, permissions).
 */

import { UniqueConstraint } from '../base-constraint.types';

/**
 * Core system unique constraints
 */
export const CORE_UNIQUE_CONSTRAINTS: Record<string, UniqueConstraint> = {
  // Tenant unique constraints
  TENANT_NAME_UNIQUE: {
    table: 'tenants',
    constraintName: 'uq_tenants_tenant_name',
    columns: ['tenant_name'],
    description: 'Tenant name must be globally unique'
  },

  // Client unique constraints
  CLIENT_EMAIL_TENANT_UNIQUE: {
    table: 'clients',
    constraintName: 'uq_clients_email_tenant',
    columns: ['email_address', 'tenant_id'],
    description: 'Client email must be unique within tenant'
  },

  // Tenant contact unique constraints - fixed for proper primary contact handling
  TENANT_PRIMARY_EMAIL_UNIQUE: {
    table: 'tenant_email_addresses',
    constraintName: 'uq_tenant_primary_email',
    columns: ['tenant_id'],
    condition: 'is_primary = true',
    description: 'Only one primary email per tenant (partial unique constraint)'
  },

  TENANT_EMAIL_ADDRESS_UNIQUE: {
    table: 'tenant_email_addresses',
    constraintName: 'uq_tenant_email_address',
    columns: ['tenant_id', 'email_address'],
    description: 'Email address must be unique within tenant'
  },

  TENANT_PRIMARY_PHONE_UNIQUE: {
    table: 'tenant_phone_numbers',
    constraintName: 'uq_tenant_primary_phone',
    columns: ['tenant_id'],
    condition: 'is_primary = true',
    description: 'Only one primary phone per tenant (partial unique constraint)'
  },

  TENANT_PHONE_NUMBER_UNIQUE: {
    table: 'tenant_phone_numbers',
    constraintName: 'uq_tenant_phone_number',
    columns: ['tenant_id', 'dial_code', 'phone_number'],
    description: 'Phone number must be unique within tenant'
  },

  // Client-tenant association unique constraint
  CLIENT_TENANT_ASSOCIATION_UNIQUE: {
    table: 'client_tenants',
    constraintName: 'uq_client_tenant_association',
    columns: ['client_id', 'tenant_id'],
    description: 'Client-tenant association must be unique'
  },

  // Role and screen unique constraints
  ROLE_NAME_UNIQUE: {
    table: 'roles',
    constraintName: 'uq_role_name',
    columns: ['role_name'],
    description: 'Role name must be globally unique'
  },

  SCREEN_NAME_UNIQUE: {
    table: 'screens',
    constraintName: 'uq_screen_name',
    columns: ['screen_name'],
    description: 'Screen name must be globally unique'
  },

  SCREEN_ROUTE_PATH_UNIQUE: {
    table: 'screens',
    constraintName: 'uq_screen_route_path',
    columns: ['route_path'],
    description: 'Screen route path must be unique when provided'
  },

  // Permission unique constraints
  USER_SCREEN_PERMISSION_UNIQUE: {
    table: 'user_screens',
    constraintName: 'uq_user_screen_permission',
    columns: ['system_user_id', 'screen_id'],
    description: 'User can have only one permission record per screen'
  },

  ROLE_SCREEN_PERMISSION_UNIQUE: {
    table: 'role_screens',
    constraintName: 'uq_role_screen_permission',
    columns: ['role_id', 'screen_id'],
    description: 'Role can have only one permission record per screen'
  },

  // Geographic unique constraints
  COUNTRY_NAME_UNIQUE: {
    table: 'countries',
    constraintName: 'uq_country_name',
    columns: ['name'],
    description: 'Country name must be unique'
  },

  COUNTRY_ISO_CODE_2_UNIQUE: {
    table: 'countries',
    constraintName: 'uq_country_iso_code_2',
    columns: ['iso_code_2'],
    description: 'Country ISO code 2 must be unique when provided'
  },

  COUNTRY_ISO_CODE_3_UNIQUE: {
    table: 'countries',
    constraintName: 'uq_country_iso_code_3',
    columns: ['iso_code_3'],
    description: 'Country ISO code 3 must be unique when provided'
  },

  STATE_NAME_COUNTRY_UNIQUE: {
    table: 'states',
    constraintName: 'uq_state_name_country',
    columns: ['name', 'country_id'],
    description: 'State name must be unique within country'
  },

  STATE_CODE_COUNTRY_UNIQUE: {
    table: 'states',
    constraintName: 'uq_state_code_country',
    columns: ['state_code', 'country_id'],
    description: 'State code must be unique within country when provided'
  },

  CITY_NAME_STATE_UNIQUE: {
    table: 'cities',
    constraintName: 'uq_city_name_state',
    columns: ['name', 'state_id'],
    description: 'City name must be unique within state'
  },

  // System user email constraints - separate for SuperAdmin and tenant users
  SYSTEM_USER_EMAIL_TENANT_UNIQUE: {
    table: 'system_users',
    constraintName: 'uq_uq_system_user_email',
    columns: ['email_address', 'tenant_id'],
    condition: 'tenant_id IS NOT NULL',
    description: 'System user email must be unique within tenant (partial unique constraint)'
  },

  SYSTEM_USER_EMAIL_GLOBAL_UNIQUE: {
    table: 'system_users',
    constraintName: 'uq_uq_system_user_email',
    columns: ['email_address'],
    condition: 'tenant_id IS NULL',
    description: 'SuperAdmin email must be globally unique (partial unique constraint)'
  },

  // System user username constraints - separate for SuperAdmin and tenant users
  SYSTEM_USER_USERNAME_TENANT_UNIQUE: {
    table: 'system_users',
    constraintName: 'uq_uq_system_user_username',
    columns: ['username', 'tenant_id'],
    condition: 'tenant_id IS NOT NULL',
    description: 'System user username must be unique within tenant (partial unique constraint)'
  },

  SYSTEM_USER_USERNAME_GLOBAL_UNIQUE: {
    table: 'system_users',
    constraintName: 'uq_uq_system_user_username',
    columns: ['username'],
    condition: 'tenant_id IS NULL',
    description: 'SuperAdmin username must be globally unique (partial unique constraint)'
  },
};
