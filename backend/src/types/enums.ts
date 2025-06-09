/**
 * Analytics and Reporting Enums
 * @description Defines enums for analytics reports, metrics, time granularity, widgets, and export formats
 */

/**
 * Enum for report types
 */
export enum ReportType {
  COURSE_PERFORMANCE = 'COURSE_PERFORMANCE',
  USER_ENGAGEMENT = 'USER_ENGAGEMENT',
  SYSTEM_USAGE = 'SYSTEM_USAGE',
  ASSESSMENT_SUMMARY = 'ASSESSMENT_SUMMARY',
  VIDEO_ANALYTICS = 'VIDEO_ANALYTICS',
  CUSTOM = 'CUSTOM',
}

/**
 * Enum for report status
 */
export enum ReportStatus {
  DRAFT = 'DRAFT',
  SCHEDULED = 'SCHEDULED',
  GENERATING = 'GENERATING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
}

/**
 * Enum for metric types
 */
export enum MetricType {
  COUNT = 'COUNT',
  PERCENTAGE = 'PERCENTAGE',
  AVERAGE = 'AVERAGE',
  SUM = 'SUM',
  RATIO = 'RATIO',
  TREND = 'TREND',
}

/**
 * Enum for time granularity
 */
export enum TimeGranularity {
  HOURLY = 'HOURLY',
  DAILY = 'DAILY',
  WEEKLY = 'WEEKLY',
  MONTHLY = 'MONTHLY',
  QUARTERLY = 'QUARTERLY',
  YEARLY = 'YEARLY',
}

/**
 * Enum for widget types
 */
export enum WidgetType {
  CHART = 'CHART',
  TABLE = 'TABLE',
  METRIC_CARD = 'METRIC_CARD',
  PROGRESS_BAR = 'PROGRESS_BAR',
  MAP = 'MAP',
  TIMELINE = 'TIMELINE',
}

/**
 * Enum for export formats
 */
export enum ExportFormat {
  PDF = 'PDF',
  EXCEL = 'EXCEL',
  CSV = 'CSV',
  JSON = 'JSON',
}

/**
 * Assignment Management Enums
 * @description Defines enums for assignment types, statuses, submissions, uploads, and reference mappings
 */

/**
 * Assignment type enumeration
 * @description Types of assignments available
 */
export enum AssignmentType {
  FILE_UPLOAD = 'FILE_UPLOAD'
}

/**
 * Assignment status enumeration
 * @description Defines the lifecycle status of an assignment
 */
export enum AssignmentStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  GRADING_IN_PROGRESS = 'GRADING_IN_PROGRESS',
  GRADED = 'GRADED',
  ARCHIVED = 'ARCHIVED',
}

/**
 * Submission status enumeration
 * @description Status of a student's assignment submission
 */
export enum SubmissionStatus {
  NOT_SUBMITTED = 'NOT_SUBMITTED',
  SUBMITTED = 'SUBMITTED',
  LATE_SUBMISSION = 'LATE_SUBMISSION',
  GRADED = 'GRADED',
  RESUBMITTED = 'RESUBMITTED',
}

/**
 * Upload status enumeration
 * @description Status of file upload for assignment submissions
 */
export enum UploadStatus {
  PENDING = 'PENDING',
  UPLOADING = 'UPLOADING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
}

/**
 * Reference table enumeration for assignment mappings
 * @description Entities that can have assignments mapped to them
 */
export enum AssignmentReferenceTable {
  COURSE = 'COURSE',
  COURSE_MODULE = 'COURSE_MODULE',
  COURSE_TOPIC = 'COURSE_TOPIC',
}

/**
 * Bunny.net Video Management Enums
 * @description Defines enums for video processing, quality settings, DRM providers, webhooks, CDN regions, and encoding presets
 */

/**
 * Bunny.net video processing and upload status
 */
export enum BunnyVideoStatus {
  UPLOADING = 'UPLOADING',
  PROCESSING = 'PROCESSING',
  FINISHED = 'FINISHED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
}

/**
 * Bunny.net video quality/resolution options
 */
export enum BunnyVideoQuality {
  AUTO = 'AUTO',
  P240 = 'P240',
  P360 = 'P360',
  P480 = 'P480',
  P720 = 'P720',
  P1080 = 'P1080',
  P1440 = 'P1440',
  P2160 = 'P2160',
}

/**
 * DRM provider types supported by Bunny.net
 */
export enum BunnyDrmProvider {
  WIDEVINE = 'WIDEVINE',
  PLAYREADY = 'PLAYREADY',
  FAIRPLAY = 'FAIRPLAY',
}

/**
 * Bunny.net webhook event types
 */
export enum BunnyWebhookEvent {
  VIDEO_UPLOADED = 'VIDEO_UPLOADED',
  VIDEO_ENCODED = 'VIDEO_ENCODED',
  VIDEO_FAILED = 'VIDEO_FAILED',
  VIDEO_DELETED = 'VIDEO_DELETED',
  PURGE_COMPLETED = 'PURGE_COMPLETED',
}

/**
 * Bunny.net CDN regions/zones
 */
export enum BunnyCdnRegion {
  GLOBAL = 'GLOBAL',
  US_EAST = 'US_EAST',
  US_WEST = 'US_WEST',
  EUROPE = 'EUROPE',
  ASIA = 'ASIA',
  OCEANIA = 'OCEANIA',
}

/**
 * Video encoding preset options
 */
export enum BunnyEncodingPreset {
  FAST = 'FAST',
  BALANCED = 'BALANCED',
  QUALITY = 'QUALITY',
  CUSTOM = 'CUSTOM',
}

/**
 * Course Session Enums
 * @description Defines enums for course sessions, and session enrollment statuses
 */

/**
 * Course session status enumeration
 * @description Defines the lifecycle status of a course session
 */
export enum CourseSessionStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  EXPIRED = 'EXPIRED',
}

/**
 * Session enrollment status enumeration
 * @description Defines the enrollment status for course session enrollments
 */
export enum SessionEnrollmentStatus {
  PENDING = 'PENDING',
  ENROLLED = 'ENROLLED',
  DROPPED = 'DROPPED',
  COMPLETED = 'COMPLETED',
  EXPELLED = 'EXPELLED',
}

/**
 * Video and Course Management Enums
 * @description Defines enums for video upload lifecycle and course status management
 */

/**
 * Video upload status enumeration
 * @description Represents the lifecycle of a video upload
 */
export enum VideoUploadStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
}

/**
 * Course status enumeration
 * @description Represents the lifecycle status of a course
 */
export enum CourseStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  ARCHIVED = 'ARCHIVED',
  SUSPENDED = 'SUSPENDED',
}

/**
 * Notification and Communication Enums
 * @description Defines enums for notification types, priorities, delivery status, channels, templates, recipients, and email status
 */

/**
 * Notification type enumeration
 * @description Types of notifications available in the system
 */
export enum NotificationType {
  ANNOUNCEMENT = 'ANNOUNCEMENT',
  ASSIGNMENT_DUE = 'ASSIGNMENT_DUE',
  QUIZ_AVAILABLE = 'QUIZ_AVAILABLE',
  GRADE_POSTED = 'GRADE_POSTED',
  COURSE_UPDATE = 'COURSE_UPDATE',
  SYSTEM_ALERT = 'SYSTEM_ALERT',
  ENROLLMENT_CONFIRMATION = 'ENROLLMENT_CONFIRMATION',
  DEADLINE_REMINDER = 'DEADLINE_REMINDER',
}

/**
 * Notification priority enumeration
 * @description Priority levels for notifications
 */
export enum NotificationPriority {
  LOW = 'LOW',
  NORMAL = 'NORMAL',
  HIGH = 'HIGH',
  URGENT = 'URGENT',
}

/**
 * Delivery status enumeration
 * @description Status of notification delivery
 */
export enum DeliveryStatus {
  PENDING = 'PENDING',
  DELIVERED = 'DELIVERED',
  FAILED = 'FAILED',
  READ = 'READ',
  DISMISSED = 'DISMISSED',
}

/**
 * Delivery channel enumeration
 * @description Available delivery channels for notifications
 */
export enum DeliveryChannel {
  IN_APP = 'IN_APP',
  EMAIL = 'EMAIL',
  PUSH = 'PUSH',
  SMS = 'SMS',
}

/**
 * Template type enumeration
 * @description Types of notification templates
 */
export enum TemplateType {
  EMAIL_HTML = 'EMAIL_HTML',
  EMAIL_TEXT = 'EMAIL_TEXT',
  PUSH = 'PUSH',
  IN_APP = 'IN_APP',
}

/**
 * Recipient type enumeration
 * @description Types of notification recipients
 */
export enum RecipientType {
  STUDENT = 'STUDENT',
  TEACHER = 'TEACHER',
  SYSTEM_USER = 'SYSTEM_USER',
  ALL_STUDENTS = 'ALL_STUDENTS',
  ALL_TEACHERS = 'ALL_TEACHERS',
  COURSE_ENROLLMENTS = 'COURSE_ENROLLMENTS',
}

/**
 * Email send status enumeration
 * @description Status of email sending attempts
 */
export enum EmailSendStatus {
  PENDING = 'PENDING',
  SENT = 'SENT',
  FAILED = 'FAILED',
  BOUNCED = 'BOUNCED',
  DELIVERED = 'DELIVERED',
}

/**
 * Quiz and Assessment Enums
 * @description Defines enums for quiz status, question types, attempt status, and reference mappings
 */

/**
 * Quiz status enumeration
 * @description Defines the lifecycle status of a quiz
 */
export enum QuizStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  GRADING_IN_PROGRESS = 'GRADING_IN_PROGRESS',
  GRADED = 'GRADED',
  ARCHIVED = 'ARCHIVED',
}

/**
 * Quiz question type enumeration
 * @description Types of quiz questions available
 */
export enum QuizQuestionType {
  MULTIPLE_CHOICE_SINGLE_ANSWER = 'MULTIPLE_CHOICE_SINGLE_ANSWER',
  MULTIPLE_CHOICE_MULTIPLE_ANSWERS = 'MULTIPLE_CHOICE_MULTIPLE_ANSWERS',
  TRUE_FALSE = 'TRUE_FALSE',
  SHORT_ANSWER_ESSAY = 'SHORT_ANSWER_ESSAY',
}

/**
 * Quiz attempt status enumeration
 * @description Status of a student's quiz attempt
 */
export enum QuizAttemptStatus {
  NOT_STARTED = 'NOT_STARTED',
  IN_PROGRESS = 'IN_PROGRESS',
  SUBMITTED = 'SUBMITTED',
  GRADED = 'GRADED',
}

/**
 * Reference table enumeration for quiz mappings
 * @description Entities that can have quizzes mapped to them
 */
export enum QuizReferenceTable {
  COURSE = 'COURSE',
  COURSE_MODULE = 'COURSE_MODULE',
  COURSE_TOPIC = 'COURSE_TOPIC',
}

/**
 * Student and User Management Enums
 * @description Defines enums for gender, student status, device types, and enrollment status
 */

/**
 * Gender enumeration
 * @description Represents the gender of a student
 */
export enum Gender {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
}

/**
 * Student status enumeration
 * @description Represents the lifecycle status of a student
 */
export enum StudentStatus {
  ACTIVE = 'ACTIVE',
  ALUMNI = 'ALUMNI',
  DROPOUT = 'DROPOUT',
  ACCOUNT_FREEZED = 'ACCOUNT_FREEZED',
  BLACKLISTED = 'BLACKLISTED',
  SUSPENDED = 'SUSPENDED',
  DEACTIVATED = 'DEACTIVATED',
}

/**
 * Device type enumeration
 * @description Represents the type of device used by a student
 */
export enum DeviceType {
  IOS = 'IOS',
  ANDROID = 'ANDROID',
  WEB = 'WEB',
  DESKTOP = 'DESKTOP',
}

/**
 * Enrollment status enumeration
 * @description Represents the lifecycle status of a student's enrollment in a course
 */
export enum EnrollmentStatus {
  PENDING = 'PENDING',
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
  DROPPED = 'DROPPED',
  SUSPENDED = 'SUSPENDED',
  EXPELLED = 'EXPELLED',
  TRANSFERRED = 'TRANSFERRED',
  DEFERRED = 'DEFERRED',
}

/**
 * System Administration Enums
 * @description Defines enums for system user roles and operational status management
 */

/**
 * System user role enumeration
 * @description Defines system-level roles with proper hierarchy
 */
export enum SystemUserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  TENANT_ADMIN = 'TENANT_ADMIN',
}

/**
 * System user status enumeration
 * @description Operational status of system users
 */
export enum SystemUserStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED',
  LOCKED = 'LOCKED',
}

/**
 * Tenant and Client Management Enums
 * @description Defines enums for tenant status, client status, and contact type categorization
 */

/**
 * Tenant status enumeration
 * @description Defines the operational status of a tenant in the system
 */
export enum TenantStatus {
  ACTIVE = 'ACTIVE',
  SUSPENDED = 'SUSPENDED',
  TRIAL = 'TRIAL',
  EXPIRED = 'EXPIRED',
  CANCELLED = 'CANCELLED',
}

/**
 * Client status enumeration
 * @description Defines the operational status of a client
 */
export enum ClientStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED',
  TERMINATED = 'TERMINATED',
}

/**
 * Contact type enumeration
 * @description Categorizes different types of contact information
 */
export enum ContactType {
  PRIMARY = 'PRIMARY',
  SECONDARY = 'SECONDARY',
  EMERGENCY = 'EMERGENCY',
  BILLING = 'BILLING',
}

/**
 * Socket Communication Enums
 * @description Defines enums for socket event names used in real-time communication across all socket handlers
 */

/**
 * Socket event names enumeration
 * @description All socket event names used for real-time communication in the application
 */
export enum SocketEventName {
  // Admin events
  TENANT_BROADCAST = 'tenant:broadcast',
  SYSTEM_ALERT = 'system:alert',
  
  // Course events
  COURSE_UPDATE = 'course:update',
  
  // Notification events
  NOTIFICATION_NEW = 'notification:new',
  NOTIFICATION_READ = 'notification:read',
  NOTIFICATION_DISMISSED = 'notification:dismissed',
  NOTIFICATION_COUNT = 'notification:count',
  NOTIFICATION_LIST = 'notification:list',
  
  // Progress tracking events
  CONTENT_PROGRESS_UPDATE = 'content:progress:update',
  VIDEO_PROGRESS_UPDATE = 'video:progress:update',
}

/**
 * User Type Enums
 * @description Defines user types for authentication and authorization purposes
 *
 */

/**
 * User type enumeration for authentication
 * @description Distinguishes between different categories of users in the system
 */
export enum UserType {
  STUDENT = 'STUDENT',
  TEACHER = 'TEACHER', 
  ADMIN = 'ADMIN',
  SUPER_ADMIN = 'SUPER_ADMIN'
}