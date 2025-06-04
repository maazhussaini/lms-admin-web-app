import { ForeignKeyConstraint } from '../base-constraint.types';

/**
 * Foreign key constraints for notification entities
 */
export const NOTIFICATION_FOREIGN_KEY_CONSTRAINTS: Record<string, ForeignKeyConstraint> = {
  // Add multi-tenant constraint for notifications
  NOTIFICATION_TENANT_CONSTRAINT: {
    table: 'notifications',
    constraintName: 'fk_notification_tenant',
    column: 'tenant_id',
    referencedTable: 'tenants',
    referencedColumn: 'tenant_id',
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE',
    isNullable: false,
    description: 'Notification belongs to tenant'
  },

  // Add multi-tenant constraint for notification templates
  NOTIFICATION_TEMPLATE_TENANT_CONSTRAINT: {
    table: 'notification_templates',
    constraintName: 'fk_notification_template_tenant',
    column: 'tenant_id',
    referencedTable: 'tenants',
    referencedColumn: 'tenant_id',
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE',
    isNullable: false,
    description: 'Notification template belongs to tenant'
  },

  // Add multi-tenant constraints for other notification entities
  NOTIFICATION_DELIVERY_TENANT_CONSTRAINT: {
    table: 'notification_deliveries',
    constraintName: 'fk_notification_delivery_tenant',
    column: 'tenant_id',
    referencedTable: 'tenants',
    referencedColumn: 'tenant_id',
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE',
    isNullable: false,
    description: 'Notification delivery belongs to tenant'
  },

  EMAIL_QUEUE_TENANT_CONSTRAINT: {
    table: 'email_queues',
    constraintName: 'fk_email_queue_tenant',
    column: 'tenant_id',
    referencedTable: 'tenants',
    referencedColumn: 'tenant_id',
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE',
    isNullable: false,
    description: 'Email queue belongs to tenant'
  },

  PUSH_NOTIFICATION_DEVICE_TENANT_CONSTRAINT: {
    table: 'push_notification_devices',
    constraintName: 'fk_push_notification_device_tenant',
    column: 'tenant_id',
    referencedTable: 'tenants',
    referencedColumn: 'tenant_id',
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE',
    isNullable: false,
    description: 'Push notification device belongs to tenant'
  },

  // Notification constraints
  NOTIFICATION_SENDER_CONSTRAINT: {
    table: 'notifications',
    constraintName: 'fk_notification_sender',
    column: 'sender_id',
    referencedTable: 'system_users',
    referencedColumn: 'system_user_id',
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE',
    isNullable: true,
    description: 'Notification sent by user (optional)'
  },

  NOTIFICATION_DELIVERY_NOTIFICATION_CONSTRAINT: {
    table: 'notification_deliveries',
    constraintName: 'fk_notification_delivery_notification',
    column: 'notification_id',
    referencedTable: 'notifications',
    referencedColumn: 'notification_id',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
    isNullable: false,
    description: 'Delivery belongs to notification (cascade delete)'
  },

  NOTIFICATION_DELIVERY_RECIPIENT_CONSTRAINT: {
    table: 'notification_deliveries',
    constraintName: 'fk_notification_delivery_recipient',
    column: 'recipient_id',
    referencedTable: 'system_users',
    referencedColumn: 'system_user_id',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
    isNullable: false,
    description: 'Delivery to specific recipient'
  },

  EMAIL_QUEUE_NOTIFICATION_CONSTRAINT: {
    table: 'email_queues',
    constraintName: 'fk_email_queue_notification',
    column: 'notification_id',
    referencedTable: 'notifications',
    referencedColumn: 'notification_id',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
    isNullable: false,
    description: 'Email queue entry belongs to notification (cascade delete)'
  },

  PUSH_NOTIFICATION_DEVICE_USER_CONSTRAINT: {
    table: 'push_notification_devices',
    constraintName: 'fk_push_notification_device_user',
    column: 'user_id',
    referencedTable: 'system_users',
    referencedColumn: 'system_user_id',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
    isNullable: false,
    description: 'Push device belongs to user (cascade delete)'
  },
};
