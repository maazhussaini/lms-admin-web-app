/**
 * @file notification-entities.types.ts
 * @description notification entity relationship mappings for notifications, templates, and their related entities.
 */

import { EntityRelationship } from '../constraints';

export const NOTIFICATION_ENTITY_RELATIONSHIPS: EntityRelationship[] = [
  {
    entity: 'notifications',
    foreignKeys: [
      { column: 'tenant_id', referencedEntity: 'tenants', referencedColumn: 'tenant_id', required: true, description: 'Notification belongs to tenant' },
      { column: 'sender_id', referencedEntity: 'system_users', referencedColumn: 'system_user_id', required: false, description: 'Notification sent by user' },
      { column: 'category_id', referencedEntity: 'notification_categories', referencedColumn: 'category_id', required: false, description: 'Notification belongs to category' }
    ]
  },
  {
    entity: 'notification_deliveries',
    foreignKeys: [
      { column: 'tenant_id', referencedEntity: 'tenants', referencedColumn: 'tenant_id', required: true, description: 'Delivery belongs to tenant' },
      { column: 'notification_id', referencedEntity: 'notifications', referencedColumn: 'notification_id', required: true, cascadeDelete: true, description: 'Delivery for notification' }
    ]
  },
  {
    entity: 'notification_templates',
    foreignKeys: [
      { column: 'tenant_id', referencedEntity: 'tenants', referencedColumn: 'tenant_id', required: true, description: 'Template belongs to tenant' },
      { column: 'category_id', referencedEntity: 'notification_categories', referencedColumn: 'category_id', required: false, description: 'Template belongs to category' }
    ]
  },
  {
    entity: 'user_notification_preferences',
    foreignKeys: [
      { column: 'tenant_id', referencedEntity: 'tenants', referencedColumn: 'tenant_id', required: true, description: 'Preference belongs to tenant' },
      { column: 'user_id', referencedEntity: 'system_users', referencedColumn: 'system_user_id', required: true, description: 'Preference belongs to user' },
      { column: 'category_id', referencedEntity: 'notification_categories', referencedColumn: 'category_id', required: false, description: 'Preference for specific category' }
    ]
  },
  {
    entity: 'notification_categories',
    foreignKeys: [
      { column: 'tenant_id', referencedEntity: 'tenants', referencedColumn: 'tenant_id', required: true, description: 'Category belongs to tenant' },
      { column: 'parent_category_id', referencedEntity: 'notification_categories', referencedColumn: 'category_id', required: false, description: 'Hierarchical category structure' }
    ]
  },
  {
    entity: 'email_queues',
    foreignKeys: [
      { column: 'tenant_id', referencedEntity: 'tenants', referencedColumn: 'tenant_id', required: true, description: 'Email belongs to tenant' },
      { column: 'notification_id', referencedEntity: 'notifications', referencedColumn: 'notification_id', required: true, cascadeDelete: true, description: 'Email for notification' }
    ]
  },
  {
    entity: 'push_notification_devices',
    foreignKeys: [
      { column: 'tenant_id', referencedEntity: 'tenants', referencedColumn: 'tenant_id', required: true, description: 'Device belongs to tenant' },
      { column: 'user_id', referencedEntity: 'system_users', referencedColumn: 'system_user_id', required: true, cascadeDelete: true, description: 'Device belongs to user' }
    ]
  },
];