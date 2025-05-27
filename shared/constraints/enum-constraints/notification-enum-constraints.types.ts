/**
 * @file notification-enum-constraints.types.ts
 * @description Notification entity enum constraints for messaging and communication.
 */

import { EnumConstraint } from '../base-constraint.types';

/**
 * Notification entity enum constraints
 */
export const NOTIFICATION_ENUM_CONSTRAINTS: Record<string, EnumConstraint> = {
  // Notification type enum
  NOTIFICATION_TYPE_ENUM: {
    table: 'notifications',
    constraintName: 'chk_notification_type_valid',
    column: 'notification_type',
    enumName: 'NotificationType',
    enumValues: {
      ANNOUNCEMENT: 1,
      ASSIGNMENT_DUE: 2,
      QUIZ_AVAILABLE: 3,
      GRADE_POSTED: 4,
      COURSE_UPDATE: 5,
      SYSTEM_ALERT: 6,
      ENROLLMENT_CONFIRMATION: 7,
      DEADLINE_REMINDER: 8
    },
    description: 'Notification type enumeration constraint'
  },

  // Notification priority enum
  NOTIFICATION_PRIORITY_ENUM: {
    table: 'notifications',
    constraintName: 'chk_notification_priority_valid',
    column: 'priority',
    enumName: 'NotificationPriority',
    enumValues: { LOW: 1, NORMAL: 2, HIGH: 3, URGENT: 4 },
    description: 'Notification priority enumeration constraint'
  },

  // Delivery status enum
  DELIVERY_STATUS_ENUM: {
    table: 'notification_deliveries',
    constraintName: 'chk_delivery_status_valid',
    column: 'delivery_status',
    enumName: 'DeliveryStatus',
    enumValues: { PENDING: 1, DELIVERED: 2, FAILED: 3, READ: 4, DISMISSED: 5 },
    description: 'Notification delivery status enumeration constraint'
  },

  // Delivery channel enum - fix column reference for multi-table constraint
  DELIVERY_CHANNEL_ENUM: {
    table: 'notification_deliveries,user_notification_preferences',
    constraintName: 'chk_delivery_channel_valid',
    column: 'delivery_channel',
    enumName: 'DeliveryChannel',
    enumValues: { IN_APP: 1, EMAIL: 2, PUSH: 3, SMS: 4 },
    description: 'Notification delivery channel enumeration constraint'
  },

  // Template type enum
  TEMPLATE_TYPE_ENUM: {
    table: 'notification_templates',
    constraintName: 'chk_template_type_valid',
    column: 'template_type',
    enumName: 'TemplateType',
    enumValues: { EMAIL_HTML: 1, EMAIL_TEXT: 2, PUSH: 3, IN_APP: 4 },
    description: 'Notification template type enumeration constraint'
  },

  // Recipient type enum - fix column reference for multi-table constraint
  RECIPIENT_TYPE_ENUM: {
    table: 'notification_deliveries,user_notification_preferences,push_notification_devices',
    constraintName: 'chk_recipient_type_valid',
    column: 'recipient_type,user_type,user_type',
    enumName: 'RecipientType',
    enumValues: { STUDENT: 1, TEACHER: 2, SYSTEM_USER: 3, ALL_STUDENTS: 4, ALL_TEACHERS: 5, COURSE_ENROLLMENTS: 6 },
    description: 'Notification recipient type enumeration constraint'
  },

  // Email send status enum
  EMAIL_SEND_STATUS_ENUM: {
    table: 'email_queues',
    constraintName: 'chk_email_send_status_valid',
    column: 'send_status',
    enumName: 'EmailSendStatus',
    enumValues: { PENDING: 1, SENT: 2, FAILED: 3, BOUNCED: 4, DELIVERED: 5 },
    description: 'Email send status enumeration constraint'
  },

  // Device type enum - add missing constraint
  DEVICE_TYPE_ENUM: {
    table: 'push_notification_devices',
    constraintName: 'chk_device_type_valid',
    column: 'device_type',
    enumName: 'DeviceType',
    enumValues: { IOS: 1, ANDROID: 2, WEB: 3 },
    description: 'Push notification device type enumeration constraint'
  },
};
