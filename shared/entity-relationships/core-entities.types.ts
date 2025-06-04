/**
 * @file core-entities.types.ts
 * @description Core entity relationship mappings for tenant, client, and user entities.
 */

import { EntityRelationship } from '../constraints';

export const CORE_ENTITY_RELATIONSHIPS: EntityRelationship[] = [
  {
    entity: 'tenants',
    foreignKeys: [
      { column: 'tenant_id', referencedEntity: 'tenants', referencedColumn: 'tenant_id', required: true, description: 'Self-reference for audit trail consistency' },
      { column: 'created_by', referencedEntity: 'system_users', referencedColumn: 'system_user_id', required: true, description: 'Audit: created by user' },
      { column: 'updated_by', referencedEntity: 'system_users', referencedColumn: 'system_user_id', required: false, description: 'Audit: updated by user' },
      { column: 'deleted_by', referencedEntity: 'system_users', referencedColumn: 'system_user_id', required: false, description: 'Audit: deleted by user' }
    ]
  },
  {
    entity: 'system_users',
    foreignKeys: [
      { column: 'tenant_id', referencedEntity: 'tenants', referencedColumn: 'tenant_id', required: false, description: 'System user belongs to tenant (NULL for SuperAdmin)' },
      { column: 'role_id', referencedEntity: 'roles', referencedColumn: 'role_id', required: true, description: 'System user has role' },
      { column: 'created_by', referencedEntity: 'system_users', referencedColumn: 'system_user_id', required: true, description: 'Audit: created by user' },
      { column: 'updated_by', referencedEntity: 'system_users', referencedColumn: 'system_user_id', required: false, description: 'Audit: updated by user' },
      { column: 'deleted_by', referencedEntity: 'system_users', referencedColumn: 'system_user_id', required: false, description: 'Audit: deleted by user' }
    ]
  },
  {
    entity: 'clients',
    foreignKeys: [
      { column: 'tenant_id', referencedEntity: 'tenants', referencedColumn: 'tenant_id', required: true, description: 'Client belongs to tenant' },
      { column: 'created_by', referencedEntity: 'system_users', referencedColumn: 'system_user_id', required: true, description: 'Audit: created by user' },
      { column: 'updated_by', referencedEntity: 'system_users', referencedColumn: 'system_user_id', required: false, description: 'Audit: updated by user' },
      { column: 'deleted_by', referencedEntity: 'system_users', referencedColumn: 'system_user_id', required: false, description: 'Audit: deleted by user' }
    ]
  },
  {
    entity: 'tenant_phone_numbers',
    foreignKeys: [
      { column: 'tenant_id', referencedEntity: 'tenants', referencedColumn: 'tenant_id', required: true, cascadeDelete: true, description: 'Phone belongs to tenant' },
      { column: 'created_by', referencedEntity: 'system_users', referencedColumn: 'system_user_id', required: true, description: 'Audit: created by user' },
      { column: 'updated_by', referencedEntity: 'system_users', referencedColumn: 'system_user_id', required: false, description: 'Audit: updated by user' },
      { column: 'deleted_by', referencedEntity: 'system_users', referencedColumn: 'system_user_id', required: false, description: 'Audit: deleted by user' }
    ]
  },
  {
    entity: 'tenant_email_addresses',
    foreignKeys: [
      { column: 'tenant_id', referencedEntity: 'tenants', referencedColumn: 'tenant_id', required: true, cascadeDelete: true, description: 'Email belongs to tenant' },
      { column: 'created_by', referencedEntity: 'system_users', referencedColumn: 'system_user_id', required: true, description: 'Audit: created by user' },
      { column: 'updated_by', referencedEntity: 'system_users', referencedColumn: 'system_user_id', required: false, description: 'Audit: updated by user' },
      { column: 'deleted_by', referencedEntity: 'system_users', referencedColumn: 'system_user_id', required: false, description: 'Audit: deleted by user' }
    ]
  },
  {
    entity: 'client_tenants',
    foreignKeys: [
      { column: 'client_id', referencedEntity: 'clients', referencedColumn: 'client_id', required: true, cascadeDelete: true, description: 'Association to client' },
      { column: 'tenant_id', referencedEntity: 'tenants', referencedColumn: 'tenant_id', required: true, cascadeDelete: true, description: 'Association to tenant (inherited from audit fields)' },
      { column: 'created_by', referencedEntity: 'system_users', referencedColumn: 'system_user_id', required: true, description: 'Audit: created by user' },
      { column: 'updated_by', referencedEntity: 'system_users', referencedColumn: 'system_user_id', required: false, description: 'Audit: updated by user' },
      { column: 'deleted_by', referencedEntity: 'system_users', referencedColumn: 'system_user_id', required: false, description: 'Audit: deleted by user' }
    ]
  },
  {
    entity: 'roles',
    foreignKeys: [
      { column: 'created_by', referencedEntity: 'system_users', referencedColumn: 'system_user_id', required: true, description: 'Audit: created by user' },
      { column: 'updated_by', referencedEntity: 'system_users', referencedColumn: 'system_user_id', required: false, description: 'Audit: updated by user' },
      { column: 'deleted_by', referencedEntity: 'system_users', referencedColumn: 'system_user_id', required: false, description: 'Audit: deleted by user' }
    ]
  },
  {
    entity: 'screens',
    foreignKeys: [
      { column: 'parent_screen_id', referencedEntity: 'screens', referencedColumn: 'screen_id', required: false, description: 'Hierarchical screen structure' },
      { column: 'created_by', referencedEntity: 'system_users', referencedColumn: 'system_user_id', required: true, description: 'Audit: created by user' },
      { column: 'updated_by', referencedEntity: 'system_users', referencedColumn: 'system_user_id', required: false, description: 'Audit: updated by user' },
      { column: 'deleted_by', referencedEntity: 'system_users', referencedColumn: 'system_user_id', required: false, description: 'Audit: deleted by user' }
    ]
  },
  {
    entity: 'user_screens',
    foreignKeys: [
      { column: 'tenant_id', referencedEntity: 'tenants', referencedColumn: 'tenant_id', required: true, description: 'Permission within tenant' },
      { column: 'screen_id', referencedEntity: 'screens', referencedColumn: 'screen_id', required: true, cascadeDelete: true, description: 'Permission for screen' },
      { column: 'system_user_id', referencedEntity: 'system_users', referencedColumn: 'system_user_id', required: true, cascadeDelete: true, description: 'Permission for user' },
      { column: 'created_by', referencedEntity: 'system_users', referencedColumn: 'system_user_id', required: true, description: 'Audit: created by user' },
      { column: 'updated_by', referencedEntity: 'system_users', referencedColumn: 'system_user_id', required: false, description: 'Audit: updated by user' },
      { column: 'deleted_by', referencedEntity: 'system_users', referencedColumn: 'system_user_id', required: false, description: 'Audit: deleted by user' }
    ]
  },
  {
    entity: 'role_screens',
    foreignKeys: [
      { column: 'tenant_id', referencedEntity: 'tenants', referencedColumn: 'tenant_id', required: true, description: 'Permission within tenant' },
      { column: 'role_id', referencedEntity: 'roles', referencedColumn: 'role_id', required: true, cascadeDelete: true, description: 'Permission for role' },
      { column: 'screen_id', referencedEntity: 'screens', referencedColumn: 'screen_id', required: true, cascadeDelete: true, description: 'Permission for screen' },
      { column: 'created_by', referencedEntity: 'system_users', referencedColumn: 'system_user_id', required: true, description: 'Audit: created by user' },
      { column: 'updated_by', referencedEntity: 'system_users', referencedColumn: 'system_user_id', required: false, description: 'Audit: updated by user' },
      { column: 'deleted_by', referencedEntity: 'system_users', referencedColumn: 'system_user_id', required: false, description: 'Audit: deleted by user' }
    ]
  },
  {
    entity: 'countries',
    foreignKeys: [
      { column: 'created_by', referencedEntity: 'system_users', referencedColumn: 'system_user_id', required: true, description: 'Audit: created by user' },
      { column: 'updated_by', referencedEntity: 'system_users', referencedColumn: 'system_user_id', required: false, description: 'Audit: updated by user' },
      { column: 'deleted_by', referencedEntity: 'system_users', referencedColumn: 'system_user_id', required: false, description: 'Audit: deleted by user' }
    ]
  },
  {
    entity: 'states',
    foreignKeys: [
      { column: 'country_id', referencedEntity: 'countries', referencedColumn: 'country_id', required: true, description: 'State belongs to country' },
      { column: 'created_by', referencedEntity: 'system_users', referencedColumn: 'system_user_id', required: true, description: 'Audit: created by user' },
      { column: 'updated_by', referencedEntity: 'system_users', referencedColumn: 'system_user_id', required: false, description: 'Audit: updated by user' },
      { column: 'deleted_by', referencedEntity: 'system_users', referencedColumn: 'system_user_id', required: false, description: 'Audit: deleted by user' }
    ]
  },
  {
    entity: 'cities',
    foreignKeys: [
      { column: 'state_id', referencedEntity: 'states', referencedColumn: 'state_id', required: true, description: 'City belongs to state' },
      { column: 'created_by', referencedEntity: 'system_users', referencedColumn: 'system_user_id', required: true, description: 'Audit: created by user' },
      { column: 'updated_by', referencedEntity: 'system_users', referencedColumn: 'system_user_id', required: false, description: 'Audit: updated by user' },
      { column: 'deleted_by', referencedEntity: 'system_users', referencedColumn: 'system_user_id', required: false, description: 'Audit: deleted by user' }
    ]
  },
];