import { MultiTenantAuditFields } from './base.types';
import { DeviceType } from './student.types';

/**
 * Notification type enumeration
 * @description Types of notifications available in the system
 */
export const NotificationType = {
  ANNOUNCEMENT: 'ANNOUNCEMENT',
  ASSIGNMENT_DUE: 'ASSIGNMENT_DUE',
  QUIZ_AVAILABLE: 'QUIZ_AVAILABLE',
  GRADE_POSTED: 'GRADE_POSTED',
  COURSE_UPDATE: 'COURSE_UPDATE',
  SYSTEM_ALERT: 'SYSTEM_ALERT',
  ENROLLMENT_CONFIRMATION: 'ENROLLMENT_CONFIRMATION',
  DEADLINE_REMINDER: 'DEADLINE_REMINDER',
} as const;

export type NotificationType = typeof NotificationType[keyof typeof NotificationType];

/**
 * Notification priority enumeration
 * @description Priority levels for notifications
 */
export const NotificationPriority = {
  LOW: 'LOW',
  NORMAL: 'NORMAL',
  HIGH: 'HIGH',
  URGENT: 'URGENT',
} as const;

export type NotificationPriority = typeof NotificationPriority[keyof typeof NotificationPriority];

/**
 * Delivery status enumeration
 * @description Status of notification delivery
 */
export const DeliveryStatus = {
  PENDING: 'PENDING',
  DELIVERED: 'DELIVERED',
  FAILED: 'FAILED',
  READ: 'READ',
  DISMISSED: 'DISMISSED',
} as const;

export type DeliveryStatus = typeof DeliveryStatus[keyof typeof DeliveryStatus];

/**
 * Delivery channel enumeration
 * @description Available delivery channels for notifications
 */
export const DeliveryChannel = {
  IN_APP: 'IN_APP',
  EMAIL: 'EMAIL',
  PUSH: 'PUSH',
  SMS: 'SMS',
} as const;

export type DeliveryChannel = typeof DeliveryChannel[keyof typeof DeliveryChannel];

/**
 * Template type enumeration
 * @description Types of notification templates
 */
export const TemplateType = {
  EMAIL_HTML: 'EMAIL_HTML',
  EMAIL_TEXT: 'EMAIL_TEXT',
  PUSH: 'PUSH',
  IN_APP: 'IN_APP',
} as const;

export type TemplateType = typeof TemplateType[keyof typeof TemplateType];

/**
 * Recipient type enumeration
 * @description Types of notification recipients
 */
export const RecipientType = {
  STUDENT: 'STUDENT',
  TEACHER: 'TEACHER',
  SYSTEM_USER: 'SYSTEM_USER',
  ALL_STUDENTS: 'ALL_STUDENTS',
  ALL_TEACHERS: 'ALL_TEACHERS',
  COURSE_ENROLLMENTS: 'COURSE_ENROLLMENTS',
} as const;

export type RecipientType = typeof RecipientType[keyof typeof RecipientType];

/**
 * Email send status enumeration
 * @description Status of email sending attempts
 */
export const EmailSendStatus = {
  PENDING: 'PENDING',
  SENT: 'SENT',
  FAILED: 'FAILED',
  BOUNCED: 'BOUNCED',
  DELIVERED: 'DELIVERED',
} as const;

export type EmailSendStatus = typeof EmailSendStatus[keyof typeof EmailSendStatus];

/**
 * Represents a notification with multi-tenant isolation
 * @description Main notification entity
 */
export interface Notification extends MultiTenantAuditFields {
  notification_id: number;
  title: string;
  message: string;
  notification_type: NotificationType;
  priority: NotificationPriority;
  sender_id?: number | null; // Foreign key to SystemUser
  scheduled_at?: Date | string | null;
  expires_at?: Date | string | null;
  metadata?: Record<string, any> | null; // JSON data for dynamic content
  is_read_receipt_required: boolean;
  target_audience?: string | null; // JSON array of target criteria
}

/**
 * Represents notification deliveries with multi-tenant isolation
 * @description Individual delivery records for each recipient
 */
export interface NotificationDelivery extends MultiTenantAuditFields {
  notification_delivery_id: number;
  notification_id: number; // Foreign key to Notification
  recipient_id: number; // ID of the recipient (student_id, teacher_id, etc.)
  recipient_type: RecipientType;
  delivery_channel: DeliveryChannel;
  delivery_status: DeliveryStatus;
  delivered_at?: Date | string | null;
  read_at?: Date | string | null;
  dismissed_at?: Date | string | null;
  failure_reason?: string | null;
  retry_count: number;
  delivery_metadata?: Record<string, any> | null; // Channel-specific metadata
}

/**
 * Represents notification templates with multi-tenant isolation
 * @description Reusable templates for notifications
 */
export interface NotificationTemplate extends MultiTenantAuditFields {
  notification_template_id: number;
  template_name: string;
  template_type: TemplateType;
  subject_template?: string | null; // For email templates
  body_template: string;
  variables?: string[] | null; // Available template variables
  is_system_template: boolean; // Whether this is a system-wide template
}

/**
 * Represents email queue with multi-tenant isolation
 * @description Queue for managing email delivery
 */
export interface EmailQueue extends MultiTenantAuditFields {
  email_queue_id: number;
  notification_id: number; // Foreign key to Notification
  recipient_email: string;
  recipient_name?: string | null;
  subject: string;
  body_html?: string | null;
  body_text?: string | null;
  send_status: EmailSendStatus;
  send_attempts: number;
  last_attempt_at?: Date | string | null;
  sent_at?: Date | string | null;
  failure_reason?: string | null;
  priority: number; // 1-10, higher = more priority
  scheduled_for?: Date | string | null;
  email_provider_id?: string | null; // External provider message ID
}

/**
 * Represents push notification devices with multi-tenant isolation
 * @description Device registration for push notifications
 */
export interface PushNotificationDevice extends MultiTenantAuditFields {
  push_device_id: number;
  user_id: number; // ID of the user (student_id, teacher_id, system_user_id)
  user_type: RecipientType;
  device_token: string;
  device_type: DeviceType;
  app_version?: string | null;
  os_version?: string | null;
  is_production: boolean; // Whether this is a production or sandbox token
  last_used_at?: Date | string | null;
  expires_at?: Date | string | null;
}

// Type guards for runtime type checking
export const isNotificationType = (value: any): value is NotificationType => 
  Object.values(NotificationType).includes(value);

export const isNotificationPriority = (value: any): value is NotificationPriority => 
  Object.values(NotificationPriority).includes(value);

export const isDeliveryStatus = (value: any): value is DeliveryStatus => 
  Object.values(DeliveryStatus).includes(value);

export const isDeliveryChannel = (value: any): value is DeliveryChannel => 
  Object.values(DeliveryChannel).includes(value);

export const isTemplateType = (value: any): value is TemplateType => 
  Object.values(TemplateType).includes(value);

export const isRecipientType = (value: any): value is RecipientType => 
  Object.values(RecipientType).includes(value);

export const isEmailSendStatus = (value: any): value is EmailSendStatus => 
  Object.values(EmailSendStatus).includes(value);

/**
 * Socket.IO Event Types for the LMS notification system
 * @description Defines shared types for socket.io events to ensure consistent
 * communication between server and clients
 */

/**
 * Base socket payload interface
 * @description Common properties for all socket events
 */
export interface SocketBasePayload {
  timestamp: string | Date;
  correlationId?: string;
  tenantId: number;
}

/**
 * New notification payload
 * @description Data structure for real-time notification delivery
 */
export interface NotificationPayload extends SocketBasePayload {
  notificationId: number;
  title: string;
  message: string;
  type: NotificationType;
  priority: NotificationPriority;
  metadata?: Record<string, any>;
  senderId?: number;
  recipientId: number;
}

/**
 * Notification status update payload
 * @description For marking notifications as read or dismissed
 */
export interface NotificationStatusPayload extends SocketBasePayload {
  notificationId: number;
  status: DeliveryStatus;
  userId: number;
}

/**
 * Notification count payload
 * @description Unread notification counts for user
 */
export interface NotificationCountPayload extends SocketBasePayload {
  userId: number;
  unreadCount: number;
  urgentCount: number;
}

/**
 * Course update notification payload
 * @description For course content or schedule changes
 */
export interface CourseUpdatePayload extends SocketBasePayload {
  courseId: number;
  updateType: 'CONTENT' | 'SCHEDULE' | 'INSTRUCTOR' | 'STATUS';
  title: string;
  message: string;
  updatedBy: number;
}

/**
 * User presence payload
 * @description For tracking user online status
 */
export interface UserPresencePayload extends SocketBasePayload {
  userId: number;
  status: 'online' | 'offline' | 'away' | 'busy';
  lastActivity?: string | Date;
}

/**
 * Content progress update payload
 * @description For tracking student progress through course content
 */
export interface ContentProgressPayload extends SocketBasePayload {
  userId: number;
  courseId: number;
  moduleId?: number;
  topicId?: number;
  contentId?: number;
  progressPercentage: number;
  completedAt?: string | Date;
  timeSpentSeconds?: number;
}

/**
 * Video progress update payload
 * @description For tracking video viewing progress
 */
export interface VideoProgressPayload extends ContentProgressPayload {
  videoId: string;
  currentTimeSeconds: number;
  durationSeconds: number;
  isCompleted: boolean;
}