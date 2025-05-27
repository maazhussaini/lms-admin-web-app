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

  // Add multi-tenant constraint for notification categories
  NOTIFICATION_CATEGORY_TENANT_CONSTRAINT: {
    table: 'notification_categories',
    constraintName: 'fk_notification_category_tenant',
    column: 'tenant_id',
    referencedTable: 'tenants',
    referencedColumn: 'tenant_id',
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE',
    isNullable: false,
    description: 'Notification category belongs to tenant'
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

  USER_NOTIFICATION_PREFERENCE_TENANT_CONSTRAINT: {
    table: 'user_notification_preferences',
    constraintName: 'fk_user_notification_preference_tenant',
    column: 'tenant_id',
    referencedTable: 'tenants',
    referencedColumn: 'tenant_id',
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE',
    isNullable: false,
    description: 'User notification preference belongs to tenant'
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

  USER_NOTIFICATION_PREFERENCE_USER_CONSTRAINT: {
    table: 'user_notification_preferences',
    constraintName: 'fk_user_notification_preference_user',
    column: 'user_id',
    referencedTable: 'system_users',
    referencedColumn: 'system_user_id',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
    isNullable: false,
    description: 'Notification preference belongs to user (cascade delete)'
  },

  USER_NOTIFICATION_PREFERENCE_CATEGORY_CONSTRAINT: {
    table: 'user_notification_preferences',
    constraintName: 'fk_user_notification_preference_category',
    column: 'category_id',
    referencedTable: 'notification_categories',
    referencedColumn: 'category_id',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
    isNullable: true,
    description: 'Notification preference for specific category (optional)'
  },

  NOTIFICATION_TEMPLATE_CATEGORY_CONSTRAINT: {
    table: 'notification_templates',
    constraintName: 'fk_notification_template_category',
    column: 'category_id',
    referencedTable: 'notification_categories',
    referencedColumn: 'category_id',
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE',
    isNullable: true,
    description: 'Template belongs to category (optional)'
  },

  NOTIFICATION_CATEGORY_PARENT_CONSTRAINT: {
    table: 'notification_categories',
    constraintName: 'fk_notification_category_parent',
    column: 'parent_category_id',
    referencedTable: 'notification_categories',
    referencedColumn: 'category_id',
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE',
    isNullable: true,
    description: 'Category may have parent category (hierarchical)'
  },

  NOTIFICATION_CATEGORY_CONSTRAINT: {
    table: 'notifications',
    constraintName: 'fk_notification_category',
    column: 'category_id',
    referencedTable: 'notification_categories',
    referencedColumn: 'category_id',
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE',
    isNullable: true,
    description: 'Notification belongs to category (optional)'
  },
};
