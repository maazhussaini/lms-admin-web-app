/**
 * Notification type enumeration
 * @description Types of notifications available in the system
 */
export enum NotificationType {
  ANNOUNCEMENT,
  ASSIGNMENT_DUE,
  QUIZ_AVAILABLE,
  GRADE_POSTED,
  COURSE_UPDATE,
  SYSTEM_ALERT,
  ENROLLMENT_CONFIRMATION,
  DEADLINE_REMINDER,
}

/**
 * Notification priority enumeration
 * @description Priority levels for notifications
 */
export enum NotificationPriority {
  LOW,
  NORMAL,
  HIGH,
  URGENT,
}

/**
 * Delivery status enumeration
 * @description Status of notification delivery
 */
export enum DeliveryStatus {
  PENDING,
  DELIVERED,
  FAILED,
  READ,
  DISMISSED,
}

/**
 * Delivery channel enumeration
 * @description Available delivery channels for notifications
 */
export enum DeliveryChannel {
  IN_APP,
  EMAIL,
  PUSH,
  SMS,
}

/**
 * Template type enumeration
 * @description Types of notification templates
 */
export enum TemplateType {
  EMAIL_HTML,
  EMAIL_TEXT,
  PUSH,
  IN_APP,
}

/**
 * Recipient type enumeration
 * @description Types of notification recipients
 */
export enum RecipientType {
  STUDENT,
  TEACHER,
  SYSTEM_USER,
  ALL_STUDENTS,
  ALL_TEACHERS,
  COURSE_ENROLLMENTS,
}

/**
 * Email send status enumeration
 * @description Status of email sending attempts
 */
export enum EmailSendStatus {
  PENDING,
  SENT,
  FAILED,
  BOUNCED,
  DELIVERED,
}