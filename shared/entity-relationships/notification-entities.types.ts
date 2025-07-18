/**
 * @file notification-entities.types.ts
 * @description notification entity relationship mappings for notifications, templates, and their related entities.
 */

import { EntityRelationship } from '../constraints';

export const NOTIFICATION_ENTITY_RELATIONSHIPS: EntityRelationship[] = [
  {
    entity: 'notifications',
    foreignKeys: [
      { column: 'tenant_id', referencedEntity: 'tenants', referencedColumn: 'tenant_id', required: true, description: 'Notification belongs to tenant' }
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
      { column: 'tenant_id', referencedEntity: 'tenants', referencedColumn: 'tenant_id', required: true, description: 'Template belongs to tenant' }
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
      { column: 'tenant_id', referencedEntity: 'tenants', referencedColumn: 'tenant_id', required: true, description: 'Device belongs to tenant' }
    ]
  },
];