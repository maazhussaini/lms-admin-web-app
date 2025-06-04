/**
 * @file notification-unique-constraints.types.ts
 * @description Unique constraints for notification entities.
 */

import { UniqueConstraint } from '../base-constraint.types';

/**
 * Notification unique constraints
 */
export const NOTIFICATION_UNIQUE_CONSTRAINTS: Record<string, UniqueConstraint> = {
  // Notification unique constraints
  NOTIFICATION_DELIVERY_UNIQUE: {
    table: 'notification_deliveries',
    constraintName: 'uq_notification_delivery_channel',
    columns: ['notification_id', 'recipient_id', 'recipient_type', 'delivery_channel'],
    description: 'Unique delivery per recipient per channel per notification'
  },

  PUSH_DEVICE_TOKEN_UNIQUE: {
    table: 'push_notification_devices',
    constraintName: 'uq_push_device_token',
    columns: ['device_token'],
    description: 'Device token must be globally unique'
  },

  PUSH_DEVICE_USER_TOKEN_UNIQUE: {
    table: 'push_notification_devices',
    constraintName: 'uq_push_device_user_token',
    columns: ['user_id', 'user_type', 'device_token'],
    description: 'Device token must be unique per user'
  },

  // Enhanced notification unique constraints
  NOTIFICATION_TEMPLATE_NAME_TENANT_UNIQUE: {
    table: 'notification_templates',
    constraintName: 'uq_notification_templates_name_tenant',
    columns: ['template_name', 'tenant_id'],
    description: 'Template name must be unique within tenant'
  },

  EMAIL_QUEUE_NOTIFICATION_RECIPIENT_UNIQUE: {
    table: 'email_queues',
    constraintName: 'uq_email_queue_notification_recipient',
    columns: ['notification_id', 'recipient_email'],
    description: 'Unique email queue entry per notification per recipient'
  },
};
