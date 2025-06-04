/**
 * @file notification-indexes.types.ts
 * @description Performance indexes for notification entities.
 */

import { IndexConstraint } from '../base-constraint.types';

/**
 * Notification performance indexes
 */
export const NOTIFICATION_PERFORMANCE_INDEXES: Record<string, IndexConstraint> = {
  // Notification indexes
  NOTIFICATION_TYPE_PRIORITY_LOOKUP: {
    table: 'notifications',
    constraintName: 'idx_notification_type_priority',
    indexName: 'idx_notification_type_priority',
    columns: ['notification_type', 'priority', 'tenant_id'],
    indexType: 'BTREE',
    isUnique: false,
    description: 'Optimize notification filtering by type and priority'
  },

  NOTIFICATION_SCHEDULED_LOOKUP: {
    table: 'notifications',
    constraintName: 'idx_notifications_scheduled',
    indexName: 'idx_notifications_scheduled',
    columns: ['scheduled_at', 'tenant_id'],
    indexType: 'BTREE',
    isUnique: false,
    description: 'Optimize scheduled notification queries'
  },

  NOTIFICATION_EXPIRY_LOOKUP: {
    table: 'notifications',
    constraintName: 'idx_notifications_expiry',
    indexName: 'idx_notifications_expiry',
    columns: ['expires_at', 'is_active'],
    indexType: 'BTREE',
    isUnique: false,
    isPartial: true,
    condition: 'expires_at IS NOT NULL',
    description: 'Optimize notification expiry cleanup'
  },

  NOTIFICATION_SENDER_LOOKUP: {
    table: 'notifications',
    constraintName: 'idx_notification_sender',
    indexName: 'idx_notification_sender',
    columns: ['sender_id', 'created_at', 'tenant_id'],
    indexType: 'BTREE',
    isUnique: false,
    description: 'Optimize notifications by sender queries'
  },

  // Notification delivery indexes
  NOTIFICATION_DELIVERY_RECIPIENT: {
    table: 'notification_deliveries',
    constraintName: 'idx_notification_delivery_recipient',
    indexName: 'idx_notification_delivery_recipient',
    columns: ['recipient_id', 'recipient_type', 'delivery_status'],
    indexType: 'BTREE',
    isUnique: false,
    description: 'Optimize notification delivery queries by recipient'
  },

  NOTIFICATION_DELIVERY_STATUS_LOOKUP: {
    table: 'notification_deliveries',
    constraintName: 'idx_notification_delivery_status',
    indexName: 'idx_notification_delivery_status',
    columns: ['delivery_status', 'delivery_channel', 'tenant_id'],
    indexType: 'BTREE',
    isUnique: false,
    description: 'Optimize delivery status queries'
  },

  NOTIFICATION_DELIVERY_UNREAD_LOOKUP: {
    table: 'notification_deliveries',
    constraintName: 'idx_notification_delivery_unread',
    indexName: 'idx_notification_delivery_unread',
    columns: ['recipient_id', 'recipient_type', 'read_at'],
    indexType: 'BTREE',
    isUnique: false,
    isPartial: true,
    condition: 'read_at IS NULL AND delivery_status = 2',
    description: 'Optimize unread notification queries'
  },

  NOTIFICATION_DELIVERY_ANALYTICS: {
    table: 'notification_deliveries',
    constraintName: 'idx_notification_delivery_analytics',
    indexName: 'idx_notification_delivery_analytics',
    columns: ['notification_id', 'delivery_status', 'delivered_at'],
    indexType: 'BTREE',
    isUnique: false,
    description: 'Optimize notification analytics queries'
  },

  // Email queue indexes
  EMAIL_QUEUE_STATUS: {
    table: 'email_queues',
    constraintName: 'idx_email_queue_status_attempts',
    indexName: 'idx_email_queue_status_attempts',
    columns: ['send_status', 'send_attempts', 'tenant_id'],
    indexType: 'BTREE',
    isUnique: false,
    description: 'Optimize email queue processing queries'
  },

  EMAIL_QUEUE_SCHEDULED: {
    table: 'email_queues',
    constraintName: 'idx_email_queue_scheduled',
    indexName: 'idx_email_queue_scheduled',
    columns: ['scheduled_for', 'send_status', 'priority'],
    indexType: 'BTREE',
    isUnique: false,
    description: 'Optimize scheduled email processing'
  },

  EMAIL_QUEUE_RETRY: {
    table: 'email_queues',
    constraintName: 'idx_email_queue_retry',
    indexName: 'idx_email_queue_retry',
    columns: ['send_status', 'last_attempt_at', 'send_attempts'],
    indexType: 'BTREE',
    isUnique: false,
    isPartial: true,
    condition: 'send_status = 3 AND send_attempts < 5',
    description: 'Optimize failed email retry queries'
  },

  // Push notification device indexes
  PUSH_DEVICE_ACTIVE: {
    table: 'push_notification_devices',
    constraintName: 'idx_push_devices_active',
    indexName: 'idx_push_devices_active',
    columns: ['user_id', 'user_type', 'is_active', 'tenant_id'],
    indexType: 'BTREE',
    isUnique: false,
    description: 'Optimize active device lookup for push notifications'
  },

  PUSH_DEVICE_TOKEN_LOOKUP: {
    table: 'push_notification_devices',
    constraintName: 'idx_push_device_token',
    indexName: 'idx_push_device_token',
    columns: ['device_token'],
    indexType: 'BTREE',
    isUnique: true,
    description: 'Optimize device token uniqueness and lookups'
  },

  PUSH_DEVICE_EXPIRY: {
    table: 'push_notification_devices',
    constraintName: 'idx_push_device_expiry',
    indexName: 'idx_push_device_expiry',
    columns: ['expires_at', 'is_active'],
    indexType: 'BTREE',
    isUnique: false,
    isPartial: true,
    condition: 'expires_at IS NOT NULL',
    description: 'Optimize device token expiry cleanup'
  },

  // Template indexes
  NOTIFICATION_TEMPLATE_TYPE_LOOKUP: {
    table: 'notification_templates',
    constraintName: 'idx_notification_template_type',
    indexName: 'idx_notification_template_type',
    columns: ['template_type', 'is_system_template', 'tenant_id'],
    indexType: 'BTREE',
    isUnique: false,
    description: 'Optimize template queries by type'
  },

  NOTIFICATION_TEMPLATE_NAME_SEARCH: {
    table: 'notification_templates',
    constraintName: 'idx_notification_template_name',
    indexName: 'idx_notification_template_name',
    columns: ['template_name', 'tenant_id'],
    indexType: 'BTREE',
    isUnique: false,
    description: 'Optimize template name searches'
  },
};
