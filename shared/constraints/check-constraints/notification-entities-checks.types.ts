/**
 * @file notification-entities-checks.types.ts
 * @description Check constraint definitions for notification entities following PostgreSQL best practices.
 */

import { CheckConstraint } from '../base-constraint.types';

/**
 * Check constraints for notification entities with consistent naming conventions
 */
export const NOTIFICATION_ENTITIES_CHECK_CONSTRAINTS: Record<string, CheckConstraint> = {
  // Notification validations
  NOTIFICATION_TITLE_LENGTH_CHECK: {
    table: 'notifications',
    constraintName: 'chk_notification_title_length',
    condition: 'LENGTH(TRIM(title)) >= 3 AND LENGTH(TRIM(title)) <= 255',
    description: 'Notification title must be between 3-255 characters (trimmed)'
  },

  NOTIFICATION_MESSAGE_LENGTH_CHECK: {
    table: 'notifications',
    constraintName: 'chk_notification_message_length',
    condition: 'LENGTH(TRIM(message)) >= 5 AND LENGTH(TRIM(message)) <= 5000',
    description: 'Notification message must be between 5-5000 characters (trimmed)'
  },

  NOTIFICATION_TYPE_ENUM_CHECK: {
    table: 'notifications',
    constraintName: 'chk_notification_type_range',
    condition: 'notification_type BETWEEN 1 AND 8',
    description: 'Notification type must be within valid enum range (1-8)'
  },

  NOTIFICATION_PRIORITY_ENUM_CHECK: {
    table: 'notifications',
    constraintName: 'chk_notification_priority_range',
    condition: 'priority BETWEEN 1 AND 4',
    description: 'Notification priority must be within valid enum range (1-4)'
  },

  NOTIFICATION_SCHEDULE_DATE_CHECK: {
    table: 'notifications',
    constraintName: 'chk_notification_schedule_date',
    condition: 'scheduled_at IS NULL OR scheduled_at > created_at',
    description: 'Scheduled time must be after creation time'
  },

  NOTIFICATION_EXPIRY_DATE_CHECK: {
    table: 'notifications',
    constraintName: 'chk_notification_expiry_date',
    condition: 'expires_at IS NULL OR expires_at > created_at',
    description: 'Expiry time must be after creation time'
  },

  NOTIFICATION_SCHEDULE_EXPIRY_CHECK: {
    table: 'notifications',
    constraintName: 'chk_notification_schedule_expiry',
    condition: 'scheduled_at IS NULL OR expires_at IS NULL OR expires_at > scheduled_at',
    description: 'Expiry time must be after scheduled time'
  },

  // Notification delivery validations
  DELIVERY_STATUS_ENUM_CHECK: {
    table: 'notification_deliveries',
    constraintName: 'chk_delivery_status_range',
    condition: 'delivery_status BETWEEN 1 AND 5',
    description: 'Delivery status must be within valid enum range (1-5)'
  },

  DELIVERY_CHANNEL_ENUM_CHECK: {
    table: 'notification_deliveries',
    constraintName: 'chk_delivery_channel_range',
    condition: 'delivery_channel BETWEEN 1 AND 4',
    description: 'Delivery channel must be within valid enum range (1-4)'
  },

  // Recipient type enum
  RECIPIENT_TYPE_ENUM_CHECK: {
    table: 'notification_deliveries,push_notification_devices',
    constraintName: 'chk_recipient_type_range',
    condition: 'recipient_type BETWEEN 1 AND 6 OR user_type BETWEEN 1 AND 6',
    description: 'Recipient/User type must be within valid enum range (1-6)'
  },

  DELIVERY_RETRY_COUNT_CHECK: {
    table: 'notification_deliveries',
    constraintName: 'chk_delivery_retry_count',
    condition: 'retry_count >= 0 AND retry_count <= 10',
    description: 'Retry count must be between 0-10'
  },

  DELIVERY_DATE_LOGIC_CHECK: {
    table: 'notification_deliveries',
    constraintName: 'chk_delivery_date_logic',
    condition: 'delivered_at IS NULL OR delivered_at >= created_at',
    description: 'Delivery time must be after creation time'
  },

  READ_DATE_LOGIC_CHECK: {
    table: 'notification_deliveries',
    constraintName: 'chk_read_date_logic',
    condition: 'read_at IS NULL OR (delivered_at IS NOT NULL AND read_at >= delivered_at)',
    description: 'Read time must be after delivery time'
  },

  DISMISSED_DATE_LOGIC_CHECK: {
    table: 'notification_deliveries',
    constraintName: 'chk_dismissed_date_logic',
    condition: 'dismissed_at IS NULL OR dismissed_at >= created_at',
    description: 'Dismissed time must be after creation time'
  },

  DELIVERY_STATUS_DATE_CONSISTENCY_CHECK: {
    table: 'notification_deliveries',
    constraintName: 'chk_delivery_status_date_consistency',
    condition: '(delivery_status = 2 AND delivered_at IS NOT NULL) OR (delivery_status != 2)',
    description: 'Delivered status must have delivery timestamp'
  },

  READ_STATUS_DATE_CONSISTENCY_CHECK: {
    table: 'notification_deliveries',
    constraintName: 'chk_read_status_date_consistency',
    condition: '(delivery_status = 4 AND read_at IS NOT NULL) OR (delivery_status != 4)',
    description: 'Read status must have read timestamp'
  },

  // Template validations
  TEMPLATE_NAME_LENGTH_CHECK: {
    table: 'notification_templates',
    constraintName: 'chk_template_name_length',
    condition: 'LENGTH(TRIM(template_name)) >= 3 AND LENGTH(TRIM(template_name)) <= 100',
    description: 'Template name must be between 3-100 characters (trimmed)'
  },

  TEMPLATE_TYPE_ENUM_CHECK: {
    table: 'notification_templates',
    constraintName: 'chk_template_type_range',
    condition: 'template_type BETWEEN 1 AND 4',
    description: 'Template type must be within valid enum range (1-4)'
  },

  TEMPLATE_BODY_LENGTH_CHECK: {
    table: 'notification_templates',
    constraintName: 'chk_template_body_length',
    condition: 'LENGTH(TRIM(body_template)) >= 5 AND LENGTH(TRIM(body_template)) <= 10000',
    description: 'Template body must be between 5-10000 characters (trimmed)'
  },

  EMAIL_SUBJECT_TEMPLATE_CHECK: {
    table: 'notification_templates',
    constraintName: 'chk_email_subject_template',
    condition: '(template_type IN (1, 2) AND subject_template IS NOT NULL) OR (template_type NOT IN (1, 2))',
    description: 'Email templates must have subject template'
  },

  // Email queue validations
  EMAIL_SEND_STATUS_ENUM_CHECK: {
    table: 'email_queues',
    constraintName: 'chk_email_send_status_range',
    condition: 'send_status BETWEEN 1 AND 5',
    description: 'Email send status must be within valid enum range (1-5)'
  },

  EMAIL_ATTEMPTS_COUNT_CHECK: {
    table: 'email_queues',
    constraintName: 'chk_email_attempts_count',
    condition: 'send_attempts >= 0 AND send_attempts <= 10',
    description: 'Email send attempts must be between 0-10'
  },

  EMAIL_PRIORITY_RANGE_CHECK: {
    table: 'email_queues',
    constraintName: 'chk_email_priority_range',
    condition: 'priority >= 1 AND priority <= 10',
    description: 'Email priority must be between 1-10'
  },

  EMAIL_RECIPIENT_FORMAT_CHECK: {
    table: 'email_queues',
    constraintName: 'chk_email_recipient_format',
    condition: "recipient_email ~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$'",
    description: 'Recipient email must be in valid email format'
  },

  EMAIL_SUBJECT_LENGTH_CHECK: {
    table: 'email_queues',
    constraintName: 'chk_email_subject_length',
    condition: 'LENGTH(TRIM(subject)) >= 1 AND LENGTH(TRIM(subject)) <= 255',
    description: 'Email subject must be between 1-255 characters (trimmed)'
  },

  EMAIL_BODY_CONTENT_CHECK: {
    table: 'email_queues',
    constraintName: 'chk_email_body_content',
    condition: 'body_html IS NOT NULL OR body_text IS NOT NULL',
    description: 'Email must have either HTML or text body content'
  },

  EMAIL_SENT_STATUS_DATE_CHECK: {
    table: 'email_queues',
    constraintName: 'chk_email_sent_status_date',
    condition: '(send_status = 2 AND sent_at IS NOT NULL) OR (send_status != 2)',
    description: 'Sent status must have sent timestamp'
  },

  // Push device validations
  DEVICE_TOKEN_LENGTH_CHECK: {
    table: 'push_notification_devices',
    constraintName: 'chk_device_token_length',
    condition: 'LENGTH(TRIM(device_token)) >= 32 AND LENGTH(TRIM(device_token)) <= 512',
    description: 'Device token must be between 32-512 characters (trimmed)'
  },

  DEVICE_TYPE_ENUM_CHECK: {
    table: 'push_notification_devices',
    constraintName: 'chk_device_type_valid',
    condition: "device_type IN ('IOS', 'ANDROID', 'WEB')",
    description: 'Device type must be IOS, ANDROID, or WEB'
  },

  DEVICE_EXPIRY_DATE_CHECK: {
    table: 'push_notification_devices',
    constraintName: 'chk_device_expiry_date',
    condition: 'expires_at IS NULL OR expires_at > created_at',
    description: 'Device expiry must be after creation time'
  },

  DEVICE_LAST_USED_DATE_CHECK: {
    table: 'push_notification_devices',
    constraintName: 'chk_device_last_used_date',
    condition: 'last_used_at IS NULL OR last_used_at >= created_at',
    description: 'Device last used time must be after creation time'
  },
};
