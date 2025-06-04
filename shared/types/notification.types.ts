import { MultiTenantAuditFields } from './base.types';

/**
 * Notification type enumeration
 * @description Types of notifications available in the system
 */
export enum NotificationType {
  ANNOUNCEMENT = 1,
  ASSIGNMENT_DUE = 2,
  QUIZ_AVAILABLE = 3,
  GRADE_POSTED = 4,
  COURSE_UPDATE = 5,
  SYSTEM_ALERT = 6,
  ENROLLMENT_CONFIRMATION = 7,
  DEADLINE_REMINDER = 8,
}

/**
 * Notification priority enumeration
 * @description Priority levels for notifications
 */
export enum NotificationPriority {
  LOW = 1,
  NORMAL = 2,
  HIGH = 3,
  URGENT = 4,
}

/**
 * Delivery status enumeration
 * @description Status of notification delivery
 */
export enum DeliveryStatus {
  PENDING = 1,
  DELIVERED = 2,
  FAILED = 3,
  READ = 4,
  DISMISSED = 5,
}

/**
 * Delivery channel enumeration
 * @description Available delivery channels for notifications
 */
export enum DeliveryChannel {
  IN_APP = 1,
  EMAIL = 2,
  PUSH = 3,
  SMS = 4,
}

/**
 * Template type enumeration
 * @description Types of notification templates
 */
export enum TemplateType {
  EMAIL_HTML = 1,
  EMAIL_TEXT = 2,
  PUSH = 3,
  IN_APP = 4,
}

/**
 * Recipient type enumeration
 * @description Types of notification recipients
 */
export enum RecipientType {
  STUDENT = 1,
  TEACHER = 2,
  SYSTEM_USER = 3,
  ALL_STUDENTS = 4,
  ALL_TEACHERS = 5,
  COURSE_ENROLLMENTS = 6,
}

/**
 * Email send status enumeration
 * @description Status of email sending attempts
 */
export enum EmailSendStatus {
  PENDING = 1,
  SENT = 2,
  FAILED = 3,
  BOUNCED = 4,
  DELIVERED = 5,
}

/**
 * Device type enumeration
 * @description Types of devices for push notifications
 */
export enum DeviceType {
  IOS = 1,
  ANDROID = 2,
  WEB = 3,
}

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

export const isDeviceType = (value: any): value is DeviceType => 
  Object.values(DeviceType).includes(value);
