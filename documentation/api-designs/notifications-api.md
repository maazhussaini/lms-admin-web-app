# Notifications API Design

## Introduction

The Notifications API provides comprehensive functionality for managing multi-channel communication within the Learning Management System (LMS). This API enables real-time messaging across in-app notifications, email, push notifications, and SMS channels. The system supports multi-tenant isolation, template-based messaging, delivery tracking, and comprehensive analytics with robust security and audit capabilities.

The API handles notification creation, template management, delivery tracking, email queuing, push notification device registration, and delivery analytics. All operations are performed within the context of a specific tenant, ensuring data security and compliance with educational privacy requirements.

## Data Model Overview

### Core Entities

The Notifications domain consists of the following main entities defined in `@shared/types/notification.types.ts`:

- **notifications**: Main notification entity with comprehensive messaging and targeting information
- **notification_deliveries**: Individual delivery records tracking message delivery across channels
- **notification_templates**: Reusable message templates with variable substitution support
- **email_queues**: Email delivery queue with provider integration and retry management
- **push_notification_devices**: Device registration for mobile and web push notifications
- **course_session_announcements**: Course-specific announcements within sessions

### Key Enums

From `@/types/enums.types.ts`:

- **NotificationType**: `SYSTEM_ALERT`, `COURSE_UPDATE`, `ASSIGNMENT_DUE`, `GRADE_POSTED`, `ANNOUNCEMENT`, `REMINDER`
- **NotificationPriority**: `LOW`, `NORMAL`, `HIGH`, `URGENT`, `CRITICAL`
- **DeliveryStatus**: `PENDING`, `SENT`, `DELIVERED`, `READ`, `FAILED`, `BOUNCED`, `CANCELLED`
- **DeliveryChannel**: `IN_APP`, `EMAIL`, `PUSH`, `SMS`, `WEBHOOK`
- **TemplateType**: `EMAIL`, `PUSH`, `SMS`, `IN_APP`
- **RecipientType**: `STUDENT`, `TEACHER`, `TENANT_ADMIN`, `SUPER_ADMIN`, `SYSTEM_USER`
- **EmailSendStatus**: `PENDING`, `SENDING`, `SENT`, `DELIVERED`, `BOUNCED`, `FAILED`, `CANCELLED`

### Base Interfaces

All entities extend `MultiTenantAuditFields` from `@shared/types/base.types.ts`, providing:
- Tenant isolation (`tenant_id`)
- Comprehensive audit trail (`created_at`, `created_by`, `updated_at`, `updated_by`)
- Soft deletion capabilities (`is_active`, `is_deleted`, `deleted_at`, `deleted_by`)
- IP tracking for security (`created_ip`, `updated_ip`)

## API Endpoints

### Notification Management

#### Create Notification
- **Method**: `POST`
- **Path**: `/api/v1/admin/notifications`
- **Authorization**: SUPER_ADMIN, TENANT_ADMIN, Teacher
- **Description**: Create a new notification with targeting and scheduling options
- **Request Body**:
```json
{
  "title": "Assignment Due Reminder",
  "message": "Your final project assignment is due in 3 days. Please submit by March 15th.",
  "notification_type": "ASSIGNMENT_DUE",
  "priority": "HIGH",
  "sender_id": 123,
  "scheduled_at": "2024-03-12T09:00:00Z",
  "expires_at": "2024-03-15T23:59:59Z",
  "target_audience": "{\"courses\": [456], \"student_status\": [\"ACTIVE\"]}",
  "is_read_receipt_required": true,
  "metadata": {
    "assignment_id": 789,
    "course_id": 456,
    "due_date": "2024-03-15T23:59:59Z"
  }
}
```
- **Response**: `201 Created`
```json
{
  "success": true,
  "data": {
    "notification_id": 1,
    "title": "Assignment Due Reminder",
    "message": "Your final project assignment is due in 3 days. Please submit by March 15th.",
    "notification_type": "ASSIGNMENT_DUE",
    "priority": "HIGH",
    "sender_id": 123,
    "scheduled_at": "2024-03-12T09:00:00Z",
    "expires_at": "2024-03-15T23:59:59Z",
    "target_audience": "{\"courses\": [456], \"student_status\": [\"ACTIVE\"]}",
    "is_read_receipt_required": true,
    "metadata": {
      "assignment_id": 789,
      "course_id": 456,
      "due_date": "2024-03-15T23:59:59Z"
    },
    "tenant_id": 123,
    "created_at": "2024-01-01T00:00:00Z",
    "is_active": true,
    "is_deleted": false
  },
  "message": "Notification created successfully"
}
```

#### Get Notification by ID
- **Method**: `GET`
- **Path**: `/api/v1/admin/notifications/{notificationId}`
- **Authorization**: SUPER_ADMIN, TENANT_ADMIN, Teacher (own notifications)
- **Description**: Retrieve a specific notification with delivery statistics
- **Response**: `200 OK`
```json
{
  "success": true,
  "data": {
    "notification_id": 1,
    "title": "Assignment Due Reminder",
    "message": "Your final project assignment is due in 3 days. Please submit by March 15th.",
    "notification_type": "ASSIGNMENT_DUE",
    "priority": "HIGH",
    "sender_id": 123,
    "scheduled_at": "2024-03-12T09:00:00Z",
    "expires_at": "2024-03-15T23:59:59Z",
    "target_audience": "{\"courses\": [456], \"student_status\": [\"ACTIVE\"]}",
    "is_read_receipt_required": true,
    "metadata": {
      "assignment_id": 789,
      "course_id": 456,
      "due_date": "2024-03-15T23:59:59Z"
    },
    "delivery_stats": {
      "total_recipients": 25,
      "delivered": 23,
      "read": 18,
      "failed": 2
    }
  }
}
```

#### List Notifications
- **Method**: `GET`
- **Path**: `/api/v1/admin/notifications`
- **Authorization**: SUPER_ADMIN, TENANT_ADMIN, Teacher
- **Description**: Retrieve notifications with comprehensive filtering (tenant-scoped for non-SUPER_ADMIN)
- **Query Parameters**:
  - `page?: number` - Page number (default: 1)
  - `limit?: number` - Items per page (default: 10, max: 100)
  - `search?: string` - Search in title, message
  - `type?: NotificationType` - Filter by notification type
  - `priority?: NotificationPriority` - Filter by priority
  - `senderId?: number` - Filter by sender
  - `sortBy?: string` - Sort by field (notification_id, title, priority, scheduled_at, created_at, updated_at)
  - `sortOrder?: string` - Sort order (asc, desc)
- **Response**: `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "notification_id": 1,
      "title": "Assignment Due Reminder",
      "notification_type": "ASSIGNMENT_DUE",
      "priority": "HIGH",
      "scheduled_at": "2024-03-12T09:00:00Z",
      "expires_at": "2024-03-15T23:59:59Z",
      "delivery_summary": {
        "total_recipients": 25,
        "delivered": 23,
        "read": 18
      },
      "created_at": "2024-01-01T00:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 1,
    "totalPages": 1,
    "hasNext": false,
    "hasPrev": false
  }
}
```

#### Update Notification
- **Method**: `PATCH`
- **Path**: `/api/v1/admin/notifications/{notificationId}`
- **Authorization**: SUPER_ADMIN, TENANT_ADMIN, Teacher (own notifications)
- **Description**: Update notification with proper authorization and validation
- **Request Body**:
```json
{
  "title": "Updated Assignment Due Reminder",
  "scheduled_at": "2024-03-12T10:00:00Z",
  "priority": "URGENT"
}
```
- **Response**: `200 OK`

#### Cancel Notification
- **Method**: `DELETE`
- **Path**: `/api/v1/admin/notifications/{notificationId}`
- **Authorization**: SUPER_ADMIN, TENANT_ADMIN, Teacher (own notifications)
- **Description**: Cancel a scheduled notification (soft delete)
- **Response**: `204 No Content`

### Notification Template Management

#### Create Notification Template
- **Method**: `POST`
- **Path**: `/api/v1/admin/notification-templates`
- **Authorization**: SUPER_ADMIN, TENANT_ADMIN
- **Description**: Create a reusable notification template
- **Request Body**:
```json
{
  "template_name": "Assignment Due Warning",
  "template_type": "EMAIL",
  "subject_template": "Assignment Due: {{assignment_name}}",
  "body_template": "Dear {{student_name}}, your assignment {{assignment_name}} is due on {{due_date}}. Please submit before the deadline.",
  "variables": ["student_name", "assignment_name", "due_date", "course_name"],
  "is_system_template": false
}
```
- **Response**: `201 Created`

#### List Templates
- **Method**: `GET`
- **Path**: `/api/v1/admin/notification-templates`
- **Authorization**: SUPER_ADMIN, TENANT_ADMIN
- **Description**: Retrieve notification templates with filtering
- **Query Parameters**:
  - `page?: number` - Page number (default: 1)
  - `limit?: number` - Items per page (default: 20, max: 100)
  - `type?: TemplateType` - Filter by template type
  - `systemTemplates?: boolean` - Filter system vs custom templates
- **Response**: `200 OK`

#### Update Template
- **Method**: `PATCH`
- **Path**: `/api/v1/admin/notification-templates/{templateId}`
- **Authorization**: SUPER_ADMIN, TENANT_ADMIN
- **Description**: Update notification template
- **Response**: `200 OK`

#### Delete Template
- **Method**: `DELETE`
- **Path**: `/api/v1/admin/notification-templates/{templateId}`
- **Authorization**: SUPER_ADMIN, TENANT_ADMIN
- **Description**: Soft delete a notification template
- **Response**: `204 No Content`

### User Notification Access

#### Get User Notifications
- **Method**: `GET`
- **Path**: `/api/v1/user/notifications`
- **Authorization**: Student, Teacher, TENANT_ADMIN JWT Token
- **Description**: Retrieve notifications for the authenticated user
- **Query Parameters**:
  - `page?: number` - Page number (default: 1)
  - `limit?: number` - Items per page (default: 20, max: 100)
  - `unreadOnly?: boolean` - Filter unread notifications only
  - `type?: NotificationType` - Filter by notification type
- **Response**: `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "notification_id": 1,
      "title": "Assignment Due Reminder",
      "message": "Your final project assignment is due in 3 days.",
      "notification_type": "ASSIGNMENT_DUE",
      "priority": "HIGH",
      "scheduled_at": "2024-03-12T09:00:00Z",
      "expires_at": "2024-03-15T23:59:59Z",
      "delivery_info": {
        "delivered_at": "2024-03-12T09:00:15Z",
        "read_at": null,
        "delivery_channel": "IN_APP"
      },
      "metadata": {
        "assignment_id": 789,
        "course_id": 456
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 5,
    "totalPages": 1,
    "hasNext": false,
    "hasPrev": false
  },
  "summary": {
    "total_unread": 3,
    "total_notifications": 5
  }
}
```

#### Mark Notification as Read
- **Method**: `PATCH`
- **Path**: `/api/v1/user/notifications/{notificationId}/read`
- **Authorization**: Student, Teacher, TENANT_ADMIN JWT Token
- **Description**: Mark a notification as read for the authenticated user
- **Response**: `200 OK`
```json
{
  "success": true,
  "data": {
    "notification_delivery_id": 123,
    "read_at": "2024-03-12T10:30:00Z"
  },
  "message": "Notification marked as read"
}
```

#### Dismiss Notification
- **Method**: `PATCH`
- **Path**: `/api/v1/user/notifications/{notificationId}/dismiss`
- **Authorization**: Student, Teacher, TENANT_ADMIN JWT Token
- **Description**: Dismiss a notification for the authenticated user
- **Response**: `200 OK`

### Push Notification Device Management

#### Register Device
- **Method**: `POST`
- **Path**: `/api/v1/user/push-devices`
- **Authorization**: Student, Teacher, TENANT_ADMIN JWT Token
- **Description**: Register a device for push notifications
- **Request Body**:
```json
{
  "device_token": "abc123def456ghi789",
  "device_type": "IOS",
  "app_version": "1.2.3",
  "os_version": "17.0",
  "is_production": true
}
```
- **Response**: `201 Created`
```json
{
  "success": true,
  "data": {
    "push_device_id": 456,
    "user_id": 123,
    "user_type": "STUDENT",
    "device_token": "abc123def456ghi789",
    "device_type": "IOS",
    "app_version": "1.2.3",
    "os_version": "17.0",
    "is_production": true,
    "last_used_at": "2024-01-01T00:00:00Z",
    "expires_at": "2025-01-01T00:00:00Z",
    "tenant_id": 123,
    "created_at": "2024-01-01T00:00:00Z"
  },
  "message": "Device registered successfully"
}
```

#### List User Devices
- **Method**: `GET`
- **Path**: `/api/v1/user/push-devices`
- **Authorization**: Student, Teacher, TENANT_ADMIN JWT Token
- **Description**: List registered devices for the authenticated user
- **Response**: `200 OK`

#### Update Device
- **Method**: `PATCH`
- **Path**: `/api/v1/user/push-devices/{deviceId}`
- **Authorization**: Student, Teacher, TENANT_ADMIN JWT Token
- **Description**: Update device information
- **Response**: `200 OK`

#### Unregister Device
- **Method**: `DELETE`
- **Path**: `/api/v1/user/push-devices/{deviceId}`
- **Authorization**: Student, Teacher, TENANT_ADMIN JWT Token
- **Description**: Unregister a push notification device
- **Response**: `204 No Content`

### Email Queue Management

#### Get Email Queue Status
- **Method**: `GET`
- **Path**: `/api/v1/admin/email-queue`
- **Authorization**: SUPER_ADMIN, TENANT_ADMIN
- **Description**: Monitor email delivery queue status
- **Query Parameters**:
  - `page?: number` - Page number (default: 1)
  - `limit?: number` - Items per page (default: 20, max: 100)
  - `status?: EmailSendStatus` - Filter by send status
  - `priority?: number` - Filter by priority level
- **Response**: `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "email_queue_id": 789,
      "notification_id": 123,
      "recipient_email": "student@example.com",
      "recipient_name": "John Doe",
      "subject": "Assignment Due: Final Project",
      "send_status": "SENT",
      "send_attempts": 1,
      "sent_at": "2024-03-12T09:01:00Z",
      "priority": 7,
      "scheduled_for": "2024-03-12T09:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 50,
    "totalPages": 3,
    "hasNext": true,
    "hasPrev": false
  },
  "summary": {
    "pending": 5,
    "sending": 2,
    "sent": 40,
    "failed": 3
  }
}
```

#### Retry Failed Email
- **Method**: `PATCH`
- **Path**: `/api/v1/admin/email-queue/{emailId}/retry`
- **Authorization**: SUPER_ADMIN, TENANT_ADMIN
- **Description**: Retry a failed email delivery
- **Response**: `200 OK`

### Course Session Announcements

#### Create Course Announcement
- **Method**: `POST`
- **Path**: `/api/v1/teacher/course-sessions/{sessionId}/announcements`
- **Authorization**: SUPER_ADMIN, TENANT_ADMIN, Teacher (own sessions)
- **Description**: Create an announcement for a course session
- **Request Body**:
```json
{
  "title": "Class Postponed",
  "content": "Tomorrow's class has been postponed to Friday due to technical issues.",
  "announcement_type": 1,
  "is_pinned": true,
  "is_published": true,
  "expiry_date": "2024-03-20T23:59:59Z",
  "attachment_url": "https://example.com/document.pdf",
  "attachment_type": "PDF"
}
```
- **Response**: `201 Created`

#### List Session Announcements
- **Method**: `GET`
- **Path**: `/api/v1/teacher/course-sessions/{sessionId}/announcements`
- **Authorization**: SUPER_ADMIN, TENANT_ADMIN, Teacher (own sessions)
- **Description**: List announcements for a course session
- **Query Parameters**:
  - `page?: number` - Page number (default: 1)
  - `limit?: number` - Items per page (default: 20, max: 100)
  - `isPinned?: boolean` - Filter pinned announcements
  - `activeOnly?: boolean` - Filter non-expired announcements
- **Response**: `200 OK`

#### Update Announcement
- **Method**: `PATCH`
- **Path**: `/api/v1/teacher/course-sessions/{sessionId}/announcements/{announcementId}`
- **Authorization**: SUPER_ADMIN, TENANT_ADMIN, Teacher (own sessions)
- **Description**: Update course session announcement
- **Response**: `200 OK`

#### Delete Announcement
- **Method**: `DELETE`
- **Path**: `/api/v1/teacher/course-sessions/{sessionId}/announcements/{announcementId}`
- **Authorization**: SUPER_ADMIN, TENANT_ADMIN, Teacher (own sessions)
- **Description**: Soft delete a course session announcement
- **Response**: `204 No Content`

### Student Announcement Access

#### Get Session Announcements (Student)
- **Method**: `GET`
- **Path**: `/api/v1/student/course-sessions/{sessionId}/announcements`
- **Authorization**: Student JWT Token
- **Description**: Get announcements for enrolled course session
- **Query Parameters**:
  - `activeOnly?: boolean` - Filter non-expired announcements (default: true)
  - `pinnedFirst?: boolean` - Show pinned announcements first (default: true)
- **Response**: `200 OK`

### Notification Analytics

#### Get Notification Analytics
- **Method**: `GET`
- **Path**: `/api/v1/admin/notifications/{notificationId}/analytics`
- **Authorization**: SUPER_ADMIN, TENANT_ADMIN, Teacher (own notifications)
- **Description**: Get detailed analytics for a notification
- **Response**: `200 OK`
```json
{
  "success": true,
  "data": {
    "notification_overview": {
      "total_recipients": 150,
      "delivery_rate": 94.7,
      "read_rate": 72.0,
      "failure_rate": 5.3
    },
    "delivery_channels": {
      "in_app": {"sent": 150, "delivered": 148, "read": 110},
      "email": {"sent": 150, "delivered": 140, "read": 105},
      "push": {"sent": 75, "delivered": 70, "read": 45}
    },
    "engagement_timeline": [
      {"hour": "09:00", "delivered": 50, "read": 35},
      {"hour": "10:00", "delivered": 75, "read": 60}
    ],
    "recipient_breakdown": {
      "students": 120,
      "teachers": 25,
      "admins": 5
    }
  }
}
```

#### Get System Analytics
- **Method**: `GET`
- **Path**: `/api/v1/admin/notifications/analytics/overview`
- **Authorization**: SUPER_ADMIN, TENANT_ADMIN
- **Description**: Get system-wide notification analytics
- **Query Parameters**:
  - `dateFrom?: string` - Start date (ISO format)
  - `dateTo?: string` - End date (ISO format)
  - `groupBy?: string` - Group by day/week/month
- **Response**: `200 OK`

## Authorization Rules

### SUPER_ADMIN Permissions
- Can create, read, update, and delete any notification across all tenants
- Can manage templates, email queue, and system-wide analytics
- Can access all notification data across tenants
- Global scope operations

### TENANT_ADMIN Permissions
- Can only manage notifications within their own tenant
- Can create, read, update, and delete notifications in their tenant
- Can manage templates and view email queue for their tenant
- Tenant-scoped operations only

### Teacher Permissions
- Can create notifications for their own courses and students
- Can manage course session announcements for assigned sessions
- Can view delivery status for their own notifications
- Cannot access system-wide analytics or other teachers' notifications

### Student Permissions
- Can read notifications targeted to them
- Can mark notifications as read or dismissed
- Can manage their own push notification devices
- Can view course session announcements for enrolled sessions
- Cannot create notifications or access analytics

## Validation Rules

### Notification Validation
- **title**: Required, 2-255 characters, string type
- **message**: Required, 10-2000 characters, string type
- **notification_type**: Must be valid NotificationType enum value
- **priority**: Must be valid NotificationPriority enum value
- **scheduled_at**: Optional, valid ISO date format, cannot be in the past
- **expires_at**: Optional, valid ISO date, must be after scheduled_at
- **target_audience**: Optional, valid JSON format for targeting rules

### Template Validation
- **template_name**: Required, 2-255 characters, unique within tenant
- **template_type**: Must be valid TemplateType enum value
- **subject_template**: Required for email templates, 2-255 characters
- **body_template**: Required, 10-5000 characters, string type
- **variables**: Optional, array of variable names for substitution

### Device Registration Validation
- **device_token**: Required, 50-500 characters, unique per user per device type
- **device_type**: Must be valid DeviceType enum value
- **app_version**: Optional, valid semantic version format
- **os_version**: Optional, version string format

## Prisma Schema Implementation

### Notification Model
```prisma
model Notification {
  notification_id            Int                   @id @default(autoincrement())
  tenant_id                  Int
  title                      String                @db.VarChar(255)
  message                    String                @db.Text
  notification_type          NotificationType
  priority                   NotificationPriority  @default(NORMAL)
  sender_id                  Int?
  category_id                Int?
  scheduled_at               DateTime?
  expires_at                 DateTime?
  metadata                   Json?
  is_read_receipt_required   Boolean               @default(false)
  target_audience            String?               @db.Text

  // Enhanced audit fields
  is_active                  Boolean               @default(true)
  is_deleted                 Boolean               @default(false)
  created_at                 DateTime              @default(now())
  updated_at                 DateTime              @updatedAt
  created_by                 Int
  updated_by                 Int?
  deleted_at                 DateTime?
  deleted_by                 Int?
  created_ip                 String?               @db.VarChar(45)
  updated_ip                 String?               @db.VarChar(45)

  // Relationships
  tenant                     Tenant                @relation(fields: [tenant_id], references: [tenant_id], onDelete: Restrict)
  notification_deliveries    NotificationDelivery[]
  email_queues               EmailQueue[]
  
  // Audit trail relationships with SystemUser
  created_by_user            SystemUser            @relation("NotificationCreatedBy", fields: [created_by], references: [system_user_id], onDelete: Restrict)
  updated_by_user            SystemUser?           @relation("NotificationUpdatedBy", fields: [updated_by], references: [system_user_id], onDelete: SetNull)
  deleted_by_user            SystemUser?           @relation("NotificationDeletedBy", fields: [deleted_by], references: [system_user_id], onDelete: SetNull)

  @@map("notifications")
}
```

### NotificationDelivery Model
```prisma
model NotificationDelivery {
  notification_delivery_id   Int                   @id @default(autoincrement())
  tenant_id                  Int
  notification_id            Int
  recipient_id               Int
  recipient_type             RecipientType
  delivery_channel           DeliveryChannel
  delivery_status            DeliveryStatus        @default(PENDING)
  delivered_at               DateTime?
  read_at                    DateTime?
  dismissed_at               DateTime?
  failure_reason             String?               @db.Text
  retry_count                Int                   @default(0)
  delivery_metadata          Json?

  // Enhanced audit fields
  is_active                  Boolean               @default(true)
  is_deleted                 Boolean               @default(false)
  created_at                 DateTime              @default(now())
  updated_at                 DateTime              @updatedAt
  created_by                 Int
  updated_by                 Int?
  deleted_at                 DateTime?
  deleted_by                 Int?
  created_ip                 String?               @db.VarChar(45)
  updated_ip                 String?               @db.VarChar(45)

  // Relationships
  tenant                     Tenant                @relation(fields: [tenant_id], references: [tenant_id], onDelete: Restrict)
  notification               Notification          @relation(fields: [notification_id], references: [notification_id], onDelete: Cascade)
  
  // Audit trail relationships with SystemUser
  created_by_user            SystemUser            @relation("NotificationDeliveryCreatedBy", fields: [created_by], references: [system_user_id], onDelete: Restrict)
  updated_by_user            SystemUser?           @relation("NotificationDeliveryUpdatedBy", fields: [updated_by], references: [system_user_id], onDelete: SetNull)
  deleted_by_user            SystemUser?           @relation("NotificationDeliveryDeletedBy", fields: [deleted_by], references: [system_user_id], onDelete: SetNull)

  @@map("notification_deliveries")
}
```

### EmailQueue Model
```prisma
model EmailQueue {
  email_queue_id             Int                   @id @default(autoincrement())
  notification_id            Int
  recipient_email            String
  recipient_name             String?
  subject                    String
  body_html                  String?               @db.Text
  body_text                  String?               @db.Text
  send_status                Int                   @default(1)
  send_attempts              Int                   @default(0)
  last_attempt_at            DateTime?
  sent_at                    DateTime?
  failure_reason             String?
  priority                   Int                   @default(5)
  scheduled_for              DateTime?
  email_provider_id          String?
  
  // Multi-tenant audit fields
  tenant_id                  Int
  is_active                  Boolean               @default(true)
  is_deleted                 Boolean               @default(false)
  created_at                 DateTime              @default(now())
  updated_at                 DateTime              @updatedAt
  created_by                 Int
  updated_by                 Int?
  created_ip                 String?
  updated_ip                 String?
  
  // Relations
  tenant                     Tenant                @relation(fields: [tenant_id], references: [tenant_id])
  notification              Notification          @relation(fields: [notification_id], references: [notification_id], onDelete: Cascade)
  created_by_user            SystemUser            @relation("EmailQueueCreatedBy", fields: [created_by], references: [system_user_id])
  updated_by_user            SystemUser?           @relation("EmailQueueUpdatedBy", fields: [updated_by], references: [system_user_id])
  
  @@unique([notification_id, recipient_email], name: "uq_email_queue_notification_recipient")
  @@map("email_queues")
}
```

### PushNotificationDevice Model
```prisma
model PushNotificationDevice {
  push_device_id             Int                   @id @default(autoincrement())
  user_id                    Int
  user_type                  String
  device_token                String                @db.VarChar(512)
  device_type                String
  app_version                 String?
  os_version                 String?
  is_production              Boolean               @default(true)
  last_used_at               DateTime?
  expires_at                 DateTime?

  // Multi-tenant audit fields
  tenant_id                  Int
  is_active                  Boolean               @default(true)
  is_deleted                 Boolean               @default(false)
  created_at                 DateTime              @default(now())
  updated_at                 DateTime              @updatedAt
  created_by                 Int
  updated_by                 Int?
  created_ip                 String?
  updated_ip                 String?
  
  // Relations
  tenant                     Tenant                @relation(fields: [tenant_id], references: [tenant_id])
  user                       SystemUser            @relation(fields: [user_id], references: [system_user_id])
  
  @@unique([device_token, user_id, device_type], name: "uq_device_token_user")
  @@map("push_notification_devices")
}
```

### CourseSessionAnnouncement Model
```prisma
model CourseSessionAnnouncement {
  announcement_id            Int                   @id @default(autoincrement())
  session_id                 Int
  title                      String                @db.VarChar(255)
  content                    String                @db.Text
  announcement_type          Int
  is_pinned                  Boolean               @default(false)
  is_published               Boolean               @default(true)
  expiry_date                DateTime?
  attachment_url             String?               @db.VarChar(2048)
  attachment_type            String?               @db.VarChar(255)

  // Multi-tenant audit fields
  tenant_id                  Int
  is_active                  Boolean               @default(true)
  is_deleted                 Boolean               @default(false)
  created_at                 DateTime              @default(now())
  updated_at                 DateTime              @updatedAt
  created_by                 Int
  updated_by                 Int?
  created_ip                 String?
  updated_ip                 String?
  
  // Relations
  tenant                     Tenant                @relation(fields: [tenant_id], references: [tenant_id])
  session                    CourseSession         @relation(fields: [session_id], references: [course_session_id], onDelete: Cascade)
  
  // Audit trail relationships with SystemUser
  created_by_user            SystemUser            @relation("AnnouncementCreatedBy", fields: [created_by], references: [system_user_id], onDelete: Restrict)
  updated_by_user            SystemUser?           @relation("AnnouncementUpdatedBy", fields: [updated_by], references: [system_user_id], onDelete: SetNull)
  deleted_by_user            SystemUser?           @relation("AnnouncementDeletedBy", fields: [deleted_by], references: [system_user_id], onDelete: SetNull)

  @@map("course_session_announcements")
}
```

## Error Handling

### Standard Error Response Structure
Following `TApiErrorResponse` from `@shared/types/api.types.ts`:

```json
{
  "success": false,
  "statusCode": 400,
  "message": "Validation error",
  "errorCode": "VALIDATION_ERROR",
  "details": {
    "field": "scheduled_at",
    "reason": "Scheduled time cannot be in the past"
  }
}
```

### Common Error Scenarios

#### Authorization Errors
- **403 FORBIDDEN**: "You can only manage your own notifications"
- **403 FORBIDDEN**: "Students cannot create notifications"
- **403 FORBIDDEN**: "Cannot access notifications from another tenant"

#### Validation Errors
- **409 CONFLICT**: "Template with this name already exists in tenant" (errorCode: "DUPLICATE_TEMPLATE_NAME")
- **409 CONFLICT**: "Device token already registered for this user" (errorCode: "DUPLICATE_DEVICE_TOKEN")
- **400 BAD_REQUEST**: "Invalid target audience JSON format"
- **400 BAD_REQUEST**: "Expiry date must be after scheduled date"

#### Not Found Errors
- **404 NOT_FOUND**: "Notification with ID {notificationId} not found" (errorCode: "NOTIFICATION_NOT_FOUND")
- **404 NOT_FOUND**: "Template not found" (errorCode: "TEMPLATE_NOT_FOUND")
- **404 NOT_FOUND**: "Push device not found" (errorCode: "DEVICE_NOT_FOUND")

#### Business Logic Errors
- **422 UNPROCESSABLE_ENTITY**: "Cannot modify notification after delivery"
- **422 UNPROCESSABLE_ENTITY**: "Cannot register more than 5 devices per user"
- **422 UNPROCESSABLE_ENTITY**: "Template variables do not match notification content"

## Security Considerations

### Authentication & Authorization
- **JWT-based Authentication**: Required for all endpoints
- **Role-Based Access Control**: SUPER_ADMIN vs TENANT_ADMIN vs Teacher vs Student permissions
- **Tenant Isolation**: Strict enforcement except for SUPER_ADMIN operations
- **Notification Ownership**: Users can only manage their own notifications

### Data Protection
- **Message Content Security**: Sanitization and validation of notification content
- **Device Token Security**: Secure storage and validation of push notification tokens
- **Target Audience Privacy**: Controlled access to user targeting information
- **Template Security**: Input validation and XSS prevention in templates

### Input Validation and Sanitization
- **Comprehensive Validation**: All fields validated using express-validator
- **SQL Injection Prevention**: Parameterized queries through Prisma ORM
- **XSS Protection**: HTML encoding for all text outputs
- **JSON Validation**: Strict validation for metadata and target audience JSON

### Rate Limiting and Abuse Prevention
- **API Rate Limiting**: 1000 requests per hour per tenant
- **Notification Creation**: 100 notifications per hour per user
- **Device Registration**: 10 device registrations per hour per user
- **Template Operations**: 50 template operations per hour per admin

### Audit and Monitoring
- **Comprehensive Audit Trail**: All operations logged with user, IP, and timestamp
- **Delivery Tracking**: Complete tracking of notification delivery across channels
- **Failed Delivery Monitoring**: Real-time alerting for delivery failures
- **Engagement Analytics**: Detailed tracking of user interaction with notifications

### Business Rules Enforcement
- **Notification Scheduling**: Validation of scheduled delivery times
- **Template Variable Matching**: Ensuring template variables match content
- **Device Limits**: Maximum device registrations per user
- **Content Moderation**: Automated and manual content review processes

## Implementation Patterns

### Service Layer Pattern
```typescript
// Example from notification.service.ts
async createNotification(
  data: CreateNotificationDto,
  requestingUser: TokenPayload,
  ip?: string
): Promise<Notification> {
  return tryCatch(async () => {
    // Validate requesting user context
    if (!requestingUser || !requestingUser.user_type) {
      throw new BadRequestError('Invalid requesting user context');
    }
    
    // Authorization checks
    // Target audience validation
    // Template processing
    // Database operations
  }, { context: { requestingUser } });
}
```

### Error Wrapping
```typescript
// Using tryCatch utility for consistent error handling
return tryCatch(async () => {
  // Operation logic
}, {
  context: {
    notificationId,
    requestingUser: { 
      id: requestingUser.id, 
      role: requestingUser.user_type, 
      tenantId: requestingUser.tenantId 
    }
  }
});
```

### Validation Middleware
```typescript
// Using express-validator with custom validation chains
body('scheduled_at')
  .optional()
  .isISO8601().withMessage('Scheduled time must be valid ISO date')
  .custom((value) => {
    const scheduledTime = new Date(value);
    const now = new Date();
    if (scheduledTime <= now) {
      throw new Error('Scheduled time cannot be in the past');
    }
    return true;
  })
```

## Import Strategy

All imports use configured path aliases:

```typescript
// Shared types
import { 
  Notification,
  NotificationDelivery,
  NotificationTemplate,
  EmailQueue,
  PushNotificationDevice,
  CourseSessionAnnouncement,
  NotificationType,
  NotificationPriority,
  DeliveryStatus,
  DeliveryChannel,
  TemplateType,
  RecipientType,
  EmailSendStatus
} from '@shared/types/notification.types';

// Internal modules
import { CreateNotificationDto, UpdateNotificationDto } from '@/dtos/notification/notification.dto';
import { NotificationService } from '@/services/notification.service';
import { TokenPayload } from '@/utils/jwt.utils';
import { authenticate, authorize } from '@/middleware/auth.middleware';
import { tryCatch } from '@/utils/error-wrapper.utils';

// API types
import { 
  TApiSuccessResponse, 
  TApiErrorResponse 
} from '@shared/types/api.types';
```

## Entity Relationships

Based on the notification entities relationships, the notifications domain has the following key foreign key constraints:

- **notifications.tenant_id** → **tenants.tenant_id** (Required for all notifications)
- **notifications.sender_id** → **system_users.system_user_id** (Optional sender reference)
- **notification_deliveries.notification_id** → **notifications.notification_id** (Cascade delete)
- **notification_deliveries.tenant_id** → **tenants.tenant_id** (Required tenant association)
- **notification_templates.tenant_id** → **tenants.tenant_id** (Required tenant association)
- **email_queues.notification_id** → **notifications.notification_id** (Cascade delete)
- **email_queues.tenant_id** → **tenants.tenant_id** (Required tenant association)
- **push_notification_devices.tenant_id** → **tenants.tenant_id** (Required tenant association)
- **course_session_announcements.tenant_id** → **tenants.tenant_id** (Required tenant association)
- **course_session_announcements.course_session_id** → **course_sessions.course_session_id** (Cascade delete)
- **course_session_announcements.teacher_id** → **teachers.teacher_id** (Restrict delete)

All entities include comprehensive audit trail relationships where system users can create, update, and delete records with proper foreign key constraints and cascade behaviors.

## Data Constraints and Business Rules

### Unique Constraints
- **template_name + tenant_id**: Template names must be unique per tenant
- **device_token + user_id + device_type**: Device tokens must be unique per user per device type
- **recipient_id + notification_id + delivery_channel**: Delivery records must be unique per recipient per notification per channel

### Check Constraints
- **title**: 2-255 characters, non-empty after trimming
- **message**: 10-2000 characters, non-empty after trimming
- **scheduled_at**: Cannot be in the past when provided
- **expires_at**: Must be after scheduled_at when both provided
- **priority**: Must be valid NotificationPriority enum value
- **retry_count**: Non-negative integer

### Notification Lifecycle Rules
- **Scheduling**: Notifications can be scheduled for future delivery
- **Expiration**: Notifications automatically expire based on expires_at
- **Delivery Tracking**: Complete lifecycle tracking across all channels
- **Read Receipts**: Optional read receipt tracking per notification

### Template System Rules
- **Variable Substitution**: Template variables validated against content
- **Template Types**: Different templates for different delivery channels
- **System Templates**: Protected system templates cannot be modified
- **Content Validation**: Template content validated for security and format