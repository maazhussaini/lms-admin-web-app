# Notifications API Design

## 1. Introduction
The Notifications API is a comprehensive messaging system for the LMS, enabling real-time communication across multiple channels including in-app notifications, email, push notifications, and SMS. It supports multi-tenant isolation, template-based messaging, and delivery tracking with comprehensive analytics.

## 2. Data Model Overview
Based on `@shared/types/notification.types.ts` and related constraint files:

### 2.1 Core Entities

- **notifications** (`Notification`):  
  Fields: `notification_id`, `title`, `message`, `notification_type`, `priority`, `sender_id`, `scheduled_at`, `expires_at`, `metadata`, `is_read_receipt_required`, `target_audience` + multi-tenant audit fields.

- **notification_deliveries** (`NotificationDelivery`):  
  Fields: `notification_delivery_id`, `notification_id`, `recipient_id`, `recipient_type`, `delivery_channel`, `delivery_status`, `delivered_at`, `read_at`, `dismissed_at`, `failure_reason`, `retry_count`, `delivery_metadata` + multi-tenant audit fields.

- **notification_templates** (`NotificationTemplate`):  
  Fields: `notification_template_id`, `template_name`, `template_type`, `subject_template`, `body_template`, `variables`, `is_system_template` + multi-tenant audit fields.

- **email_queues** (`EmailQueue`):  
  Fields: `email_queue_id`, `notification_id`, `recipient_email`, `recipient_name`, `subject`, `body_html`, `body_text`, `send_status`, `send_attempts`, `last_attempt_at`, `sent_at`, `failure_reason`, `priority`, `scheduled_for`, `email_provider_id` + multi-tenant audit fields.

- **push_notification_devices** (`PushNotificationDevice`):  
  Fields: `push_device_id`, `user_id`, `user_type`, `device_token`, `device_type`, `app_version`, `os_version`, `is_production`, `last_used_at`, `expires_at` + multi-tenant audit fields.

### 2.2 Entity Relationships
- **notifications** → belongs to **tenants** via `tenant_id` FK
- **notifications** → sent by **system_users** via `sender_id` FK (optional)
- **notification_deliveries** → belongs to **notifications** via `notification_id` FK (cascade delete)
- **notification_deliveries** → targets **system_users** via `recipient_id` FK
- **notification_templates** → belongs to **tenants** via `tenant_id` FK
- **email_queues** → belongs to **notifications** via `notification_id` FK (cascade delete)
- **push_notification_devices** → belongs to **system_users** via `user_id` FK (cascade delete)

### 2.3 Key Enums
- **NotificationType**: ANNOUNCEMENT (1), ASSIGNMENT_DUE (2), QUIZ_AVAILABLE (3), GRADE_POSTED (4), COURSE_UPDATE (5), SYSTEM_ALERT (6), ENROLLMENT_CONFIRMATION (7), DEADLINE_REMINDER (8)
- **NotificationPriority**: LOW (1), NORMAL (2), HIGH (3), URGENT (4)
- **DeliveryStatus**: PENDING (1), DELIVERED (2), FAILED (3), READ (4), DISMISSED (5)
- **DeliveryChannel**: IN_APP (1), EMAIL (2), PUSH (3), SMS (4)
- **TemplateType**: EMAIL_HTML (1), EMAIL_TEXT (2), PUSH (3), IN_APP (4)
- **RecipientType**: STUDENT (1), TEACHER (2), SYSTEM_USER (3), ALL_STUDENTS (4), ALL_TEACHERS (5), COURSE_ENROLLMENTS (6)
- **EmailSendStatus**: PENDING (1), SENT (2), FAILED (3), BOUNCED (4), DELIVERED (5)

### 2.4 Data Constraints

#### Unique Constraints
- `notification_delivery_id + recipient_id + recipient_type + delivery_channel` must be unique per notification
- `device_token` must be globally unique across all push devices
- `template_name + tenant_id` must be unique within tenant
- `notification_id + recipient_email` must be unique in email queue

#### Check Constraints
- Title length: 3-255 characters (trimmed)
- Message length: 5-5000 characters (trimmed)
- Notification type: valid enum range (1-8)
- Priority: valid enum range (1-4)
- Delivery status: valid enum range (1-5)
- Delivery channel: valid enum range (1-4)
- Recipient type: valid enum range (1-6)
- Template type: valid enum range (1-4)
- Email send status: valid enum range (1-5)
- Device token length: 32-512 characters
- Retry count: 0-10
- Email attempts: 0-10
- Quiet hours format: HH:MM when provided
- Valid email format for recipient emails

#### Foreign Key Constraints
- All entities → **tenants** (RESTRICT on delete)
- **notification_deliveries** → **notifications** (CASCADE on delete)
- **email_queues** → **notifications** (CASCADE on delete)
- **push_notification_devices** → **system_users** (CASCADE on delete)

## 3. API Endpoints

### 3.1 Admin Endpoints (`/api/admin/notifications`)
Secured via JWT and RBAC (Admin role required).

#### Notifications Management
- **POST** `/notifications`
- **GET** `/notifications`
- **GET** `/notifications/{id}`
- **PATCH** `/notifications/{id}`
- **DELETE** `/notifications/{id}`
- **POST** `/notifications/{id}/send`
- **GET** `/notifications/{id}/deliveries`
- **GET** `/notifications/{id}/analytics`

#### Templates Management
- **POST** `/templates`
- **GET** `/templates`
- **GET** `/templates/{id}`
- **PATCH** `/templates/{id}`
- **DELETE** `/templates/{id}`
- **POST** `/templates/{id}/preview`

#### System Management
- **GET** `/deliveries`
- **GET** `/deliveries/failed`
- **POST** `/deliveries/{id}/retry`
- **GET** `/email-queue`
- **POST** `/email-queue/{id}/retry`
- **GET** `/push-devices`
- **DELETE** `/push-devices/{id}`

### 3.2 User Endpoints (`/api/user/notifications`)
Available to authenticated users (Students, Teachers, System Users).

#### User Notifications
- **GET** `/` - Get user's notifications
- **GET** `/unread` - Get unread notifications
- **GET** `/{id}` - Get specific notification
- **PATCH** `/{id}/read` - Mark as read
- **PATCH** `/{id}/dismiss` - Dismiss notification
- **POST** `/mark-all-read` - Mark all as read

#### Push Device Management
- **POST** `/devices` - Register push device
- **GET** `/devices` - Get user's devices
- **PATCH** `/devices/{id}` - Update device
- **DELETE** `/devices/{id}` - Remove device

### 3.3 Public Endpoints (`/api/public/notifications`)
Limited public access for specific functionality.

#### Email Management
- **POST** `/email/unsubscribe` - Unsubscribe from emails
- **GET** `/email/preferences/{token}` - Get email preferences via token
- **PATCH** `/email/preferences/{token}` - Update email preferences via token

## 4. Data Transfer Objects (DTOs)

### 4.1 Create DTOs
```typescript
interface CreateNotificationDto {
  title: string;
  message: string;
  notification_type: NotificationType;
  priority?: NotificationPriority; // Defaults to NORMAL
  scheduled_at?: Date | string;
  expires_at?: Date | string;
  metadata?: Record<string, any>;
  is_read_receipt_required?: boolean; // Defaults to false
  target_audience?: string; // JSON criteria
}

interface CreateNotificationTemplateDto {
  template_name: string;
  template_type: TemplateType;
  subject_template?: string;
  body_template: string;
  variables?: string[];
  is_system_template?: boolean; // Defaults to false
}

interface CreatePushDeviceDto {
  device_token: string;
  device_type: 'IOS' | 'ANDROID' | 'WEB';
  app_version?: string;
  os_version?: string;
  is_production?: boolean; // Defaults to true
}
```

### 4.2 Response DTOs
```typescript
interface NotificationResponse extends Notification {
  sender?: { system_user_id: number; full_name: string };
  delivery_stats?: {
    total_recipients: number;
    delivered: number;
    read: number;
    failed: number;
  };
}

interface NotificationDeliveryResponse extends NotificationDelivery {
  notification?: {
    notification_id: number;
    title: string;
    message: string;
    priority: NotificationPriority;
  };
}

interface UserNotificationListResponse {
  notifications: NotificationDeliveryResponse[];
  unread_count: number;
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
}
```

## 5. Prisma Schema Considerations

### 5.1 Prisma Schema Mapping
```prisma
model Notification {
  notification_id            Int                       @id @default(autoincrement())
  title                      String                    @db.VarChar(255)
  message                    String                    @db.Text
  notification_type          Int
  priority                   Int                       @default(2)
  sender_id                  Int?
  scheduled_at               DateTime?
  expires_at                 DateTime?
  metadata                   Json?
  is_read_receipt_required   Boolean                   @default(false)
  target_audience            String?                   @db.Text
  
  // Multi-tenant audit fields
  tenant_id                  Int
  is_active                  Boolean                   @default(true)
  is_deleted                 Boolean                   @default(false)
  created_at                 DateTime                  @default(now())
  updated_at                 DateTime                  @updatedAt
  created_by                 Int
  updated_by                 Int?
  created_ip                 String?
  updated_ip                 String?
  
  // Relations
  tenant                     Tenant                    @relation(fields: [tenant_id], references: [tenant_id])
  sender                     SystemUser?               @relation(fields: [sender_id], references: [system_user_id])
  created_by_user            SystemUser                @relation("NotificationCreatedBy", fields: [created_by], references: [system_user_id])
  updated_by_user            SystemUser?               @relation("NotificationUpdatedBy", fields: [updated_by], references: [system_user_id])
  
  notification_deliveries    NotificationDelivery[]
  email_queues              EmailQueue[]
  
  @@map("notifications")
}

model NotificationDelivery {
  notification_delivery_id   Int                       @id @default(autoincrement())
  notification_id            Int
  recipient_id               Int
  recipient_type             Int
  delivery_channel           Int
  delivery_status            Int                       @default(1)
  delivered_at               DateTime?
  read_at                    DateTime?
  dismissed_at               DateTime?
  failure_reason             String?
  retry_count                Int                       @default(0)
  delivery_metadata          Json?
  
  // Multi-tenant audit fields
  tenant_id                  Int
  is_active                  Boolean                   @default(true)
  is_deleted                 Boolean                   @default(false)
  created_at                 DateTime                  @default(now())
  updated_at                 DateTime                  @updatedAt
  created_by                 Int
  updated_by                 Int?
  created_ip                 String?
  updated_ip                 String?
  
  // Relations
  tenant                     Tenant                    @relation(fields: [tenant_id], references: [tenant_id])
  notification              Notification              @relation(fields: [notification_id], references: [notification_id], onDelete: Cascade)
  created_by_user           SystemUser                @relation("DeliveryCreatedBy", fields: [created_by], references: [system_user_id])
  updated_by_user           SystemUser?               @relation("DeliveryUpdatedBy", fields: [updated_by], references: [system_user_id])
  
  @@unique([notification_id, recipient_id, recipient_type, delivery_channel], name: "uq_notification_delivery_channel")
  @@map("notification_deliveries")
}

model EmailQueue {
  email_queue_id             Int                       @id @default(autoincrement())
  notification_id            Int
  recipient_email            String
  recipient_name             String?
  subject                    String
  body_html                  String?                   @db.Text
  body_text                  String?                   @db.Text
  send_status                Int                       @default(1)
  send_attempts              Int                       @default(0)
  last_attempt_at            DateTime?
  sent_at                    DateTime?
  failure_reason             String?
  priority                   Int                       @default(5)
  scheduled_for              DateTime?
  email_provider_id          String?
  
  // Multi-tenant audit fields
  tenant_id                  Int
  is_active                  Boolean                   @default(true)
  is_deleted                 Boolean                   @default(false)
  created_at                 DateTime                  @default(now())
  updated_at                 DateTime                  @updatedAt
  created_by                 Int
  updated_by                 Int?
  created_ip                 String?
  updated_ip                 String?
  
  // Relations
  tenant                     Tenant                    @relation(fields: [tenant_id], references: [tenant_id])
  notification              Notification              @relation(fields: [notification_id], references: [notification_id], onDelete: Cascade)
  created_by_user           SystemUser                @relation("EmailQueueCreatedBy", fields: [created_by], references: [system_user_id])
  updated_by_user           SystemUser?               @relation("EmailQueueUpdatedBy", fields: [updated_by], references: [system_user_id])
  
  @@unique([notification_id, recipient_email], name: "uq_email_queue_notification_recipient")
  @@map("email_queues")
}
```

### 5.2 Indexes for Performance
- `idx_notification_type_priority` on `notifications.notification_type, priority, tenant_id`
- `idx_notifications_scheduled` on `notifications.scheduled_at, tenant_id`
- `idx_notifications_expiry` on `notifications.expires_at, is_active` (partial: WHERE expires_at IS NOT NULL)
- `idx_notification_delivery_recipient` on `notification_deliveries.recipient_id, recipient_type, delivery_status`
- `idx_notification_delivery_unread` on `notification_deliveries.recipient_id, recipient_type, read_at` (partial: WHERE read_at IS NULL AND delivery_status = 2)
- `idx_email_queue_status_attempts` on `email_queues.send_status, send_attempts, tenant_id`
- `idx_push_devices_active` on `push_notification_devices.user_id, user_type, is_active, tenant_id`
- `idx_push_device_token` on `push_notification_devices.device_token` (unique)

## 6. Error Handling

### 6.1 Error Response Format
```typescript
interface TApiErrorResponse {
  statusCode: number;
  message: string;
  errorCode: string;
  details?: Record<string, any>;
  correlationId: string;
  timestamp: string;
}
```

### 6.2 Common Error Scenarios
- **400 Bad Request**: Invalid input data, constraint violations, invalid enum values, malformed JSON
- **401 Unauthorized**: Invalid or missing JWT token
- **403 Forbidden**: Insufficient permissions, cross-tenant access attempts
- **404 Not Found**: Notification, template, or device not found
- **409 Conflict**: Unique constraint violations (duplicate device tokens, template names)
- **422 Unprocessable Entity**: Business rule violations, invalid template variables, delivery failures
- **429 Too Many Requests**: Rate limiting exceeded
- **500 Internal Server Error**: Email service failures, push notification service errors

### 6.3 Validation Rules
- `title`: Required, 3-255 characters (trimmed)
- `message`: Required, 5-5000 characters (trimmed)
- `notification_type`: Must be valid NotificationType enum (1-8)
- `priority`: Must be valid NotificationPriority enum (1-4)
- `delivery_channel`: Must be valid DeliveryChannel enum (1-4)
- `recipient_type`: Must be valid RecipientType enum (1-6)
- `template_type`: Must be valid TemplateType enum (1-4)
- `device_token`: Required, 32-512 characters for push devices
- `quiet_hours`: Must be in HH:MM format when provided
- `email_address`: Must be valid email format
- `scheduled_at`: Must be future date when provided
- `expires_at`: Must be after creation/scheduled time when provided

## 7. Security Considerations

### 7.1 Authentication & Authorization
- JWT authentication required for all non-public endpoints
- Role-based access control:
  - **Admin**: Full access to all notification management
  - **Teacher**: Can send course-related notifications to enrolled students
  - **Student**: Can view own notifications and manage preferences
  - **System User**: Can manage own notifications and preferences
- Multi-tenant isolation enforced at API and database levels

### 7.2 Data Protection
- HTTPS enforced for all API communications
- Input validation and sanitization to prevent XSS and injection attacks
- Template rendering with safe variable substitution
- Email content sanitization to prevent phishing
- Push token encryption at rest
- Rate limiting:
  - Admin endpoints: 1000 requests/hour per user
  - User endpoints: 500 requests/hour per user
  - Public endpoints: 100 requests/hour per IP

### 7.3 Privacy & Compliance
- User consent tracking for notification preferences
- Email unsubscribe mechanisms with one-click compliance
- Data retention policies for notification history
- GDPR compliance for EU users
- Audit trail logging for all notification activities
- Sensitive data masking in logs

### 7.4 Delivery Security
- Email DKIM/SPF validation
- Push notification certificate management
- SMS delivery via verified providers
- Failed delivery tracking and alerts
- Suspicious activity detection and blocking

## 8. Performance Considerations

### 8.1 Caching Strategy
- User preferences cached for 1 hour
- Template content cached for 30 minutes
- Device tokens cached for 15 minutes
- Redis-based caching with cluster support

### 8.2 Query Optimization
- Efficient indexes on frequently queried fields
- Pagination for all list endpoints (default: 20 items per page)
- Bulk operations for mass notification sending
- Database query optimization for delivery analytics
- Read replicas for reporting queries

### 8.3 Scalability
- Asynchronous processing for notification delivery
- Queue-based email and push notification sending
- Horizontal scaling support for high-volume tenants
- CDN integration for template assets
- Background job processing for cleanup tasks

### 8.4 Monitoring & Analytics
- Real-time delivery status monitoring
- Email bounce and spam rate tracking
- Push notification success/failure rates
- User engagement analytics
- Performance metrics and alerting
- A/B testing support for notification content

## 9. Naming Conventions

### 9.1 API Endpoints
- RESTful design with consistent patterns
- Versioning: `/api/v1/admin/notifications`
- Resource collections use plural nouns
- Nested resources for related entities
- Query parameters in snake_case

### 9.2 Database & Types
- Table names in snake_case (e.g., `notification_deliveries`)
- Column names in snake_case (e.g., `notification_type`)
- TypeScript interfaces in PascalCase (e.g., `NotificationDelivery`)
- Enum names in PascalCase with descriptive values
- JSON properties in snake_case for API consistency

### 9.3 Import Strategy
All type imports use `@shared/types/` path strategy:
```typescript
import { 
  Notification, 
  NotificationDelivery, 
  NotificationTemplate,
  EmailQueue,
  PushNotificationDevice,
  NotificationType,
  NotificationPriority,
  DeliveryStatus,
  DeliveryChannel,
  TemplateType,
  RecipientType,
  EmailSendStatus
} from '@shared/types/notification.types';
import { 
  MultiTenantAuditFields 
} from '@shared/types/base.types';
import { 
  TApiSuccessResponse, 
  TApiErrorResponse 
} from '@shared/types/api.types';
import { 
  SystemUser 
} from '@shared/types/user.types';
```