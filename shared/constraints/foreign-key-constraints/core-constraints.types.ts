import { ForeignKeyConstraint } from '../base-constraint.types';

/**
 * Core foreign key constraints for tenant, client, and system entities
 */
export const CORE_FOREIGN_KEY_CONSTRAINTS: Record<string, ForeignKeyConstraint> = {
  // Multi-tenant constraints (applied to tables with tenant_id) - now includes tenants for self-reference
  MULTI_TENANT_CONSTRAINT: {
    table: 'tenants,clients,tenant_phone_numbers,tenant_email_addresses,client_tenants,user_screens,role_screens',
    constraintName: 'fk_multi_tenant_constraint',
    column: 'tenant_id',
    referencedTable: 'tenants',
    referencedColumn: 'tenant_id',
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE',
    isNullable: false,
    description: 'Multi-tenant isolation constraint for tenant-specific entities (including tenant self-reference for audit)'
  },

  // System users tenant constraint (nullable for SuperAdmin)
  SYSTEM_USER_TENANT_CONSTRAINT: {
    table: 'system_users',
    constraintName: 'fk_system_user_tenant',
    column: 'tenant_id',
    referencedTable: 'tenants',
    referencedColumn: 'tenant_id',
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE',
    isNullable: true,
    description: 'System user belongs to tenant (NULL for SuperAdmin users)'
  },
  
  // Universal audit constraints
  CREATED_BY_CONSTRAINT: {
    table: '*',
    constraintName: 'fk_created_by_constraint',
    column: 'created_by',
    referencedTable: 'system_users',
    referencedColumn: 'system_user_id',
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE',
    isNullable: false,
    description: 'Audit trail - user who created the record'
  },
  
  UPDATED_BY_CONSTRAINT: {
    table: '*',
    constraintName: 'fk_updated_by_constraint',
    column: 'updated_by',
    referencedTable: 'system_users',
    referencedColumn: 'system_user_id',
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE',
    isNullable: true,
    description: 'Audit trail - user who last updated the record'
  },

  // Specific tenant contact constraints with different delete behavior
  TENANT_PHONE_TENANT_CONSTRAINT: {
    table: 'tenant_phone_numbers',
    constraintName: 'fk_tenant_phone_tenant',
    column: 'tenant_id',
    referencedTable: 'tenants',
    referencedColumn: 'tenant_id',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
    isNullable: false,
    description: 'Tenant phone number belongs to tenant (cascade delete for cleanup)'
  },

  TENANT_EMAIL_TENANT_CONSTRAINT: {
    table: 'tenant_email_addresses',
    constraintName: 'fk_tenant_email_tenant',
    column: 'tenant_id',
    referencedTable: 'tenants',
    referencedColumn: 'tenant_id',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
    isNullable: false,
    description: 'Tenant email address belongs to tenant (cascade delete for cleanup)'
  },

  // Client-Tenant relationships
  CLIENT_TENANT_FK_CONSTRAINT: {
    table: 'clients',
    constraintName: 'fk_client_tenant',
    column: 'tenant_id',
    referencedTable: 'tenants',
    referencedColumn: 'tenant_id',
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE',
    isNullable: false,
    description: 'Client belongs to tenant (restrict delete to prevent orphaned clients)'
  },

  CLIENT_TENANT_ASSOCIATION_CLIENT_CONSTRAINT: {
    table: 'client_tenants',
    constraintName: 'fk_client_tenant_association_client',
    column: 'client_id',
    referencedTable: 'clients',
    referencedColumn: 'client_id',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
    isNullable: false,
    description: 'Client-tenant association references client'
  },

  CLIENT_TENANT_ASSOCIATION_TENANT_CONSTRAINT: {
    table: 'client_tenants',
    constraintName: 'fk_client_tenant_association_tenant',
    column: 'tenant_id',
    referencedTable: 'tenants',
    referencedColumn: 'tenant_id',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
    isNullable: false,
    description: 'Client-tenant association references tenant'
  },

  // Role and permission constraints
  ROLE_CONSTRAINT: {
    table: '*',
    constraintName: 'fk_role_constraint',
    column: 'role_id',
    referencedTable: 'roles',
    referencedColumn: 'role_id',
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE',
    isNullable: false,
    description: 'User role reference'
  },

  SCREEN_CONSTRAINT: {
    table: '*',
    constraintName: 'fk_screen_constraint',
    column: 'screen_id',
    referencedTable: 'screens',
    referencedColumn: 'screen_id',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
    isNullable: false,
    description: 'System screen/module reference'
  },

  SYSTEM_USER_ROLE_CONSTRAINT: {
    table: 'system_users',
    constraintName: 'fk_system_user_role',
    column: 'role_id',
    referencedTable: 'roles',
    referencedColumn: 'role_id',
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE',
    isNullable: false,
    description: 'System user must have a valid role'
  },

  USER_SCREEN_SYSTEM_USER_CONSTRAINT: {
    table: 'user_screens',
    constraintName: 'fk_user_screen_system_user',
    column: 'system_user_id',
    referencedTable: 'system_users',
    referencedColumn: 'system_user_id',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
    isNullable: false,
    description: 'User screen permission belongs to system user'
  },

  USER_SCREEN_SCREEN_CONSTRAINT: {
    table: 'user_screens',
    constraintName: 'fk_user_screen_screen',
    column: 'screen_id',
    referencedTable: 'screens',
    referencedColumn: 'screen_id',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
    isNullable: false,
    description: 'User screen permission references screen'
  },

  ROLE_SCREEN_ROLE_CONSTRAINT: {
    table: 'role_screens',
    constraintName: 'fk_role_screen_role',
    column: 'role_id',
    referencedTable: 'roles',
    referencedColumn: 'role_id',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
    isNullable: false,
    description: 'Role screen permission belongs to role'
  },

  ROLE_SCREEN_SCREEN_CONSTRAINT: {
    table: 'role_screens',
    constraintName: 'fk_role_screen_screen',
    column: 'screen_id',
    referencedTable: 'screens',
    referencedColumn: 'screen_id',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
    isNullable: false,
    description: 'Role screen permission references screen'
  },

  SCREEN_PARENT_CONSTRAINT: {
    table: 'screens',
    constraintName: 'fk_screen_parent',
    column: 'parent_screen_id',
    referencedTable: 'screens',
    referencedColumn: 'screen_id',
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE',
    isNullable: true,
    description: 'Screen parent reference for hierarchical structure'
  },

  // Geographic constraints
  COUNTRY_CONSTRAINT: {
    table: '*',
    constraintName: 'fk_country_constraint',
    column: 'country_id',
    referencedTable: 'countries',
    referencedColumn: 'country_id',
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE',
    isNullable: false,
    description: 'Geographic reference - country'
  },

  STATE_CONSTRAINT: {
    table: '*',
    constraintName: 'fk_state_constraint',
    column: 'state_id',
    referencedTable: 'states',
    referencedColumn: 'state_id',
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE',
    isNullable: false,
    description: 'Geographic reference - state/province'
  },

  CITY_CONSTRAINT: {
    table: '*',
    constraintName: 'fk_city_constraint',
    column: 'city_id',
    referencedTable: 'cities',
    referencedColumn: 'city_id',
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE',
    isNullable: false,
    description: 'Geographic reference - city'
  },

  STATE_COUNTRY_CONSTRAINT: {
    table: 'states',
    constraintName: 'fk_state_country',
    column: 'country_id',
    referencedTable: 'countries',
    referencedColumn: 'country_id',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
    isNullable: false,
    description: 'State belongs to country'
  },

  CITY_STATE_CONSTRAINT: {
    table: 'cities',
    constraintName: 'fk_city_state',
    column: 'state_id',
    referencedTable: 'states',
    referencedColumn: 'state_id',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
    isNullable: false,
    description: 'City belongs to state'
  },
};
