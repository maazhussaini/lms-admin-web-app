# Course Session Management API Design

## Introduction

The Course Session Management API provides comprehensive functionality for managing time-bound learning containers within the LMS platform. Course sessions represent organized learning environments where a single teacher delivers a specific course to multiple students within defined time boundaries. This API implements multi-tenant isolation, role-based access control, and supports the complete lifecycle of session management including enrollment, announcements, settings, and progress tracking.

The API handles session creation, enrollment management, announcement distribution, settings configuration, and progress monitoring. All operations are performed within the context of a specific tenant, ensuring data security and compliance with educational privacy requirements.

## Data Model Overview

### Core Entities

The Course Session domain consists of the following main entities defined in `@shared/types/course-session.types.ts`:

- **course_sessions**: Time-bound learning container with one teacher, one course, multiple students
- **course_session_enrollments**: Student enrollment records in specific sessions with completion tracking
- **course_session_announcements**: Teacher announcements for session communication
- **course_session_settings**: Configuration settings for session behavior and policies

### Key Enums

From `@/types/enums.types.ts`:

- **CourseSessionStatus**: `DRAFT`, `PUBLISHED`, `EXPIRED`
- **SessionEnrollmentStatus**: `PENDING`, `ENROLLED`, `DROPPED`, `COMPLETED`, `EXPELLED`

### Base Interfaces

All entities extend `MultiTenantAuditFields` from `@shared/types/base.types.ts`, providing:
- Tenant isolation (`tenant_id`)
- Comprehensive audit trail (`created_at`, `created_by`, `updated_at`, `updated_by`)
- Soft deletion capabilities (`is_active`, `is_deleted`, `deleted_at`, `deleted_by`)
- IP tracking for security (`created_ip`, `updated_ip`)

## API Endpoints

### Teacher/Admin Session Management

#### Create Course Session
- **Method**: `POST`
- **Path**: `/api/v1/teacher/sessions`
- **Authorization**: SUPER_ADMIN, TENANT_ADMIN, Teacher
- **Description**: Create a new course session for a specific course
- **Request Body**:
```json
{
  "session_name": "Spring 2024 - Advanced Mathematics",
  "session_description": "Advanced calculus and linear algebra course",
  "teacher_id": 456,
  "course_id": 123,
  "course_session_status": "DRAFT",
  "start_date": "2024-03-01T09:00:00Z",
  "end_date": "2024-06-30T17:00:00Z",
  "max_students": 30,
  "enrollment_deadline": "2024-02-25T23:59:59Z",
  "session_timezone": "America/New_York",
  "auto_expire_enabled": true
}
```
- **Response**: `201 Created`
```json
{
  "success": true,
  "data": {
    "course_session_id": 456,
    "session_name": "Spring 2024 - Advanced Mathematics",
    "session_description": "Advanced calculus and linear algebra course",
    "teacher_id": 456,
    "course_id": 123,
    "course_session_status": "DRAFT",
    "start_date": "2024-03-01T09:00:00Z",
    "end_date": "2024-06-30T17:00:00Z",
    "max_students": 30,
    "enrollment_deadline": "2024-02-25T23:59:59Z",
    "session_timezone": "America/New_York",
    "session_code": "MATH2024A1",
    "auto_expire_enabled": true,
    "tenant_id": 123,
    "created_at": "2024-01-15T10:30:00Z",
    "is_active": true,
    "is_deleted": false
  },
  "message": "Course session created successfully"
}
```

#### Get Course Session by ID
- **Method**: `GET`
- **Path**: `/api/v1/teacher/sessions/{sessionId}`
- **Authorization**: SUPER_ADMIN, TENANT_ADMIN, Teacher (own sessions)
- **Description**: Retrieve a specific course session with proper authorization checks
- **Response**: `200 OK`
```json
{
  "success": true,
  "data": {
    "course_session_id": 456,
    "session_name": "Spring 2024 - Advanced Mathematics",
    "session_description": "Advanced calculus and linear algebra course",
    "teacher_id": 456,
    "course_id": 123,
    "course_session_status": "PUBLISHED",
    "start_date": "2024-03-01T09:00:00Z",
    "end_date": "2024-06-30T17:00:00Z",
    "max_students": 30,
    "enrollment_deadline": "2024-02-25T23:59:59Z",
    "session_code": "MATH2024A1",
    "auto_expire_enabled": true
  }
}
```

#### List Teacher Sessions
- **Method**: `GET`
- **Path**: `/api/v1/teacher/sessions`
- **Authorization**: SUPER_ADMIN, TENANT_ADMIN, Teacher
- **Description**: Retrieve course sessions assigned to the current teacher (teacher-scoped for Teacher role)
- **Query Parameters**:
  - `page?: number` - Page number (default: 1)
  - `limit?: number` - Items per page (default: 10, max: 100)
  - `status?: CourseSessionStatus` - Filter by session status
  - `courseId?: number` - Filter by specific course
  - `startDate?: string` - Filter sessions starting after date
  - `endDate?: string` - Filter sessions ending before date
  - `sortBy?: string` - Sort by field (course_session_id, session_name, start_date, end_date, created_at, updated_at)
  - `sortOrder?: string` - Sort order (asc, desc)
- **Response**: `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "course_session_id": 456,
      "session_name": "Spring 2024 - Advanced Mathematics",
      "course_session_status": "PUBLISHED",
      "start_date": "2024-03-01T09:00:00Z",
      "end_date": "2024-06-30T17:00:00Z",
      "session_code": "MATH2024A1",
      "enrolled_count": 25,
      "max_students": 30
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

#### Update Course Session
- **Method**: `PATCH`
- **Path**: `/api/v1/teacher/sessions/{sessionId}`
- **Authorization**: SUPER_ADMIN, TENANT_ADMIN, Teacher (own sessions)
- **Description**: Update course session details (restricted for published sessions)
- **Request Body**:
```json
{
  "session_name": "Spring 2024 - Advanced Mathematics (Updated)",
  "session_description": "Updated course description",
  "max_students": 35,
  "enrollment_deadline": "2024-02-28T23:59:59Z"
}
```
- **Response**: `200 OK`

#### Publish Course Session
- **Method**: `PATCH`
- **Path**: `/api/v1/teacher/sessions/{sessionId}/publish`
- **Authorization**: SUPER_ADMIN, TENANT_ADMIN, Teacher (own sessions)
- **Description**: Publish a draft session to make it available for enrollment
- **Response**: `200 OK`
```json
{
  "success": true,
  "data": {
    "course_session_id": 456,
    "course_session_status": "PUBLISHED",
    "session_code": "MATH2024A1",
    "updated_at": "2024-01-15T14:20:00Z"
  },
  "message": "Course session published successfully"
}
```

#### Delete Course Session
- **Method**: `DELETE`
- **Path**: `/api/v1/teacher/sessions/{sessionId}`
- **Authorization**: SUPER_ADMIN, TENANT_ADMIN, Teacher (own sessions)
- **Description**: Soft delete a course session (only for draft sessions)
- **Response**: `204 No Content`

### Session Enrollment Management

#### Get Session Enrollments
- **Method**: `GET`
- **Path**: `/api/v1/teacher/sessions/{sessionId}/enrollments`
- **Authorization**: SUPER_ADMIN, TENANT_ADMIN, Teacher (own sessions)
- **Description**: Retrieve all enrollments for a specific session
- **Query Parameters**:
  - `status?: SessionEnrollmentStatus` - Filter by enrollment status
  - `page?: number` - Page number (default: 1)
  - `limit?: number` - Items per page (default: 20, max: 100)
- **Response**: `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "course_session_enrollment_id": 789,
      "course_session_id": 456,
      "student_id": 123,
      "enrolled_at": "2024-02-20T15:30:00Z",
      "enrollment_status": "ENROLLED",
      "completion_percentage": 75,
      "final_grade": 85,
      "student": {
        "full_name": "John Doe",
        "email_address": "john.doe@example.com"
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 25,
    "totalPages": 2,
    "hasNext": true,
    "hasPrev": false
  }
}
```

#### Update Enrollment Status
- **Method**: `PATCH`
- **Path**: `/api/v1/teacher/sessions/{sessionId}/enrollments/{enrollmentId}/status`
- **Authorization**: SUPER_ADMIN, TENANT_ADMIN, Teacher (own sessions)
- **Description**: Update enrollment status (approve, reject, expel)
- **Request Body**:
```json
{
  "enrollment_status": "ENROLLED"
}
```
- **Response**: `200 OK`

#### Update Student Grade
- **Method**: `PATCH`
- **Path**: `/api/v1/teacher/sessions/{sessionId}/enrollments/{enrollmentId}/grade`
- **Authorization**: SUPER_ADMIN, TENANT_ADMIN, Teacher (own sessions)
- **Description**: Update final grade for student
- **Request Body**:
```json
{
  "final_grade": 85,
  "completion_percentage": 90
}
```
- **Response**: `200 OK`

### Session Announcements

#### Create Announcement
- **Method**: `POST`
- **Path**: `/api/v1/teacher/sessions/{sessionId}/announcements`
- **Authorization**: SUPER_ADMIN, TENANT_ADMIN, Teacher (own sessions)
- **Description**: Create a new announcement for the session
- **Request Body**:
```json
{
  "title": "Assignment Due Date Extended",
  "message": "The final assignment due date has been extended to March 15th due to technical issues.",
  "is_urgent": true,
  "scheduled_for": "2024-03-01T09:00:00Z",
  "expires_at": "2024-03-20T23:59:59Z"
}
```
- **Response**: `201 Created`

#### List Session Announcements
- **Method**: `GET`
- **Path**: `/api/v1/teacher/sessions/{sessionId}/announcements`
- **Authorization**: SUPER_ADMIN, TENANT_ADMIN, Teacher (own sessions)
- **Description**: Retrieve announcements for a session
- **Query Parameters**:
  - `isUrgent?: boolean` - Filter urgent announcements
  - `activeOnly?: boolean` - Filter non-expired announcements
  - `page?: number` - Page number (default: 1)
  - `limit?: number` - Items per page (default: 20, max: 100)
- **Response**: `200 OK`

#### Update Announcement
- **Method**: `PATCH`
- **Path**: `/api/v1/teacher/sessions/{sessionId}/announcements/{announcementId}`
- **Authorization**: SUPER_ADMIN, TENANT_ADMIN, Teacher (own sessions)
- **Description**: Update announcement details
- **Response**: `200 OK`

#### Delete Announcement
- **Method**: `DELETE`
- **Path**: `/api/v1/teacher/sessions/{sessionId}/announcements/{announcementId}`
- **Authorization**: SUPER_ADMIN, TENANT_ADMIN, Teacher (own sessions)
- **Description**: Soft delete an announcement
- **Response**: `204 No Content`

### Session Settings Management

#### Get Session Settings
- **Method**: `GET`
- **Path**: `/api/v1/teacher/sessions/{sessionId}/settings`
- **Authorization**: SUPER_ADMIN, TENANT_ADMIN, Teacher (own sessions)
- **Description**: Retrieve session configuration settings
- **Response**: `200 OK`
```json
{
  "success": true,
  "data": {
    "course_session_settings_id": 123,
    "course_session_id": 456,
    "allow_late_enrollment": false,
    "require_approval_for_enrollment": false,
    "allow_student_discussions": true,
    "send_reminder_emails": true,
    "reminder_days_before_expiry": 7,
    "grading_scale": {
      "A": {"min": 85, "max": 100},
      "B": {"min": 75, "max": 84},
      "C": {"min": 65, "max": 74}
    },
    "attendance_tracking_enabled": false
  }
}
```

#### Update Session Settings
- **Method**: `PUT`
- **Path**: `/api/v1/teacher/sessions/{sessionId}/settings`
- **Authorization**: SUPER_ADMIN, TENANT_ADMIN, Teacher (own sessions)
- **Description**: Update session configuration settings
- **Request Body**:
```json
{
  "allow_late_enrollment": true,
  "require_approval_for_enrollment": false,
  "send_reminder_emails": true,
  "reminder_days_before_expiry": 5,
  "grading_scale": {
    "A": {"min": 85, "max": 100},
    "B": {"min": 75, "max": 84}
  },
  "attendance_tracking_enabled": true
}
```
- **Response**: `200 OK`

### Student Operations

#### Join Session by Code
- **Method**: `POST`
- **Path**: `/api/v1/student/sessions/join`
- **Authorization**: Student JWT Token
- **Description**: Join a session using session code
- **Request Body**:
```json
{
  "session_code": "MATH2024A1"
}
```
- **Response**: `201 Created`
```json
{
  "success": true,
  "data": {
    "course_session_enrollment_id": 456,
    "course_session_id": 123,
    "student_id": 789,
    "enrolled_at": "2024-02-20T15:30:00Z",
    "enrollment_status": "ENROLLED"
  },
  "message": "Successfully enrolled in session"
}
```

#### List Student Sessions
- **Method**: `GET`
- **Path**: `/api/v1/student/sessions`
- **Authorization**: Student JWT Token
- **Description**: Retrieve sessions the student is enrolled in
- **Query Parameters**:
  - `status?: SessionEnrollmentStatus` - Filter by enrollment status
  - `activeOnly?: boolean` - Filter active sessions only
  - `page?: number` - Page number (default: 1)
  - `limit?: number` - Items per page (default: 20, max: 100)
- **Response**: `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "course_session_id": 123,
      "session_name": "Spring 2024 - Advanced Mathematics",
      "course_session_status": "PUBLISHED",
      "enrollment_status": "ENROLLED",
      "completion_percentage": 75,
      "start_date": "2024-03-01T09:00:00Z",
      "end_date": "2024-06-30T17:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 1,
    "totalPages": 1,
    "hasNext": false,
    "hasPrev": false
  }
}
```

#### Get Session Details
- **Method**: `GET`
- **Path**: `/api/v1/student/sessions/{sessionId}`
- **Authorization**: Student JWT Token
- **Description**: Get detailed information about enrolled session
- **Response**: `200 OK`

#### Drop from Session
- **Method**: `DELETE`
- **Path**: `/api/v1/student/sessions/{sessionId}/enrollment`
- **Authorization**: Student JWT Token
- **Description**: Drop from a session (if allowed by settings)
- **Response**: `200 OK`

#### Get Session Announcements (Student)
- **Method**: `GET`
- **Path**: `/api/v1/student/sessions/{sessionId}/announcements`
- **Authorization**: Student JWT Token
- **Description**: Retrieve active announcements for enrolled session
- **Response**: `200 OK`

### Admin Operations

#### List All Sessions
- **Method**: `GET`
- **Path**: `/api/v1/admin/sessions`
- **Authorization**: SUPER_ADMIN, TENANT_ADMIN
- **Description**: Retrieve all sessions within tenant (admin overview)
- **Query Parameters**:
  - `teacherId?: number` - Filter by teacher
  - `courseId?: number` - Filter by course
  - `status?: CourseSessionStatus` - Filter by status
  - `startDate?: string` - Filter by start date
  - `endDate?: string` - Filter by end date
  - `page?: number` - Page number (default: 1)
  - `limit?: number` - Items per page (default: 10, max: 100)
- **Response**: `200 OK`

#### Get Session Analytics
- **Method**: `GET`
- **Path**: `/api/v1/admin/sessions/{sessionId}/analytics`
- **Authorization**: SUPER_ADMIN, TENANT_ADMIN
- **Description**: Retrieve session performance analytics
- **Response**: `200 OK`
```json
{
  "success": true,
  "data": {
    "session_overview": {
      "total_enrolled": 25,
      "completion_rate": 68.5,
      "average_grade": 78.2,
      "dropout_rate": 12.0,
      "active_students": 22
    },
    "enrollment_timeline": [
      {"date": "2024-02-01", "enrollments": 5},
      {"date": "2024-02-02", "enrollments": 8}
    ],
    "performance_metrics": {
      "average_completion_percentage": 72.3,
      "students_above_80_percent": 15,
      "students_below_50_percent": 3
    }
  }
}
```

## Authorization Rules

### SUPER_ADMIN Permissions
- Can create, read, update, and delete any course session across all tenants
- Can manage session enrollments, announcements, and settings
- Can access analytics and progress data across all tenants
- Global scope operations

### TENANT_ADMIN Permissions
- Can only manage sessions within their own tenant
- Can create, read, update, and delete sessions in their tenant
- Can manage enrollments, announcements, and settings for tenant sessions
- Tenant-scoped operations only

### Teacher Permissions
- Can create, read, update, and delete their own assigned sessions
- Can manage enrollments, announcements, and settings for their sessions
- Cannot access sessions assigned to other teachers
- Can access session-specific analytics for their sessions

### Student Permissions
- Can read enrolled session content and structure
- Can join sessions using session codes
- Can view their enrollment status and progress
- Can drop from sessions (if allowed by settings)
- Cannot modify session content or access other students' data

## Validation Rules

### Session Validation
- **session_name**: Required, 2-255 characters, string type
- **course_session_status**: Must be valid CourseSessionStatus enum value
- **start_date**: Required, valid ISO date, cannot be in the past for new sessions
- **end_date**: Required, valid ISO date, must be after start_date
- **max_students**: Optional, positive integer, minimum 1
- **teacher_id**: Required, must be valid teacher within tenant
- **course_id**: Required, must be valid course within tenant

### Enrollment Validation
- **enrollment_status**: Must be valid SessionEnrollmentStatus enum value
- **completion_percentage**: Required, 0-100 range
- **final_grade**: Optional, 0-100 range when provided

### Announcement Validation
- **title**: Required, 2-255 characters, string type
- **message**: Required, 10-2000 characters, string type
- **scheduled_for**: Optional, valid ISO date format
- **expires_at**: Optional, valid ISO date, must be after scheduled_for

### Settings Validation
- **grading_scale**: Optional, valid JSON object with grade definitions
- **reminder_days_before_expiry**: Required, positive integer, 1-30 range

## Prisma Schema Implementation

### CourseSession Model
```prisma
model CourseSession {
  course_session_id        Int      @id @default(autoincrement())
  tenant_id                Int
  session_name             String   @db.VarChar(255)
  session_description      String?  @db.Text
  teacher_id               Int
  course_id                Int
  course_session_status    CourseSessionStatus @default(DRAFT)
  start_date               DateTime
  end_date                 DateTime
  max_students             Int?
  enrollment_deadline      DateTime?
  session_timezone         String?  @db.VarChar(50)
  session_code             String?  @unique @db.VarChar(12)
  auto_expire_enabled      Boolean  @default(true)

  // Enhanced audit fields
  is_active                Boolean  @default(true)
  is_deleted               Boolean  @default(false)
  created_at               DateTime @default(now())
  updated_at               DateTime @updatedAt
  created_by               Int
  updated_by               Int?
  deleted_at               DateTime?
  deleted_by               Int?
  created_ip               String?  @db.VarChar(45)
  updated_ip               String?  @db.VarChar(45)

  // Relationships
  tenant                   Tenant   @relation(fields: [tenant_id], references: [tenant_id], onDelete: Restrict)
  teacher                  Teacher  @relation(fields: [teacher_id], references: [teacher_id], onDelete: Restrict)
  course                   Course   @relation(fields: [course_id], references: [course_id], onDelete: Restrict)
  enrollments              CourseSessionEnrollment[]
  announcements            CourseSessionAnnouncement[]
  settings                 CourseSessionSettings?
  
  // Audit trail relationships with SystemUser
  created_by_user          SystemUser   @relation("CourseSessionCreatedBy", fields: [created_by], references: [system_user_id], onDelete: Restrict)
  updated_by_user          SystemUser?  @relation("CourseSessionUpdatedBy", fields: [updated_by], references: [system_user_id], onDelete: SetNull)
  deleted_by_user          SystemUser?  @relation("CourseSessionDeletedBy", fields: [deleted_by], references: [system_user_id], onDelete: SetNull)

  @@map("course_sessions")
}
```

### CourseSessionEnrollment Model
```prisma
model CourseSessionEnrollment {
  course_session_enrollment_id Int      @id @default(autoincrement())
  tenant_id                    Int
  course_session_id            Int
  student_id                   Int
  enrolled_at                  DateTime @default(now())
  dropped_at                   DateTime?
  enrollment_status            SessionEnrollmentStatus @default(PENDING)
  completion_percentage        Int      @default(0)
  final_grade                  Int?
  completion_date              DateTime?

  // Enhanced audit fields
  is_active                    Boolean  @default(true)
  is_deleted                   Boolean  @default(false)
  created_at                   DateTime @default(now())
  updated_at                   DateTime @updatedAt
  created_by                   Int
  updated_by                   Int?
  deleted_at                   DateTime?
  deleted_by                   Int?
  created_ip                   String?  @db.VarChar(45)
  updated_ip                   String?  @db.VarChar(45)

  // Relationships
  tenant                       Tenant           @relation(fields: [tenant_id], references: [tenant_id], onDelete: Restrict)
  course_session               CourseSession    @relation(fields: [course_session_id], references: [course_session_id], onDelete: Cascade)
  student                      Student          @relation(fields: [student_id], references: [student_id], onDelete: Cascade)
  
  // Audit trail relationships with SystemUser
  created_by_user              SystemUser       @relation("CourseSessionEnrollmentCreatedBy", fields: [created_by], references: [system_user_id], onDelete: Restrict)
  updated_by_user              SystemUser?      @relation("CourseSessionEnrollmentUpdatedBy", fields: [updated_by], references: [system_user_id], onDelete: SetNull)
  deleted_by_user              SystemUser?      @relation("CourseSessionEnrollmentDeletedBy", fields: [deleted_by], references: [system_user_id], onDelete: SetNull)

  @@map("course_session_enrollments")
}
```

### CourseSessionAnnouncement Model
```prisma
model CourseSessionAnnouncement {
  course_session_announcement_id Int      @id @default(autoincrement())
  tenant_id                      Int
  course_session_id              Int
  title                          String
  message                        String
  is_urgent                      Boolean  @default(false)
  scheduled_for                  DateTime?
  expires_at                     DateTime?

  // Multi-tenant audit fields
  is_active                      Boolean  @default(true)
  is_deleted                     Boolean  @default(false)
  created_at                     DateTime @default(now())
  created_by                     Int
  created_ip                     String
  updated_at                     DateTime? @updatedAt
  updated_by                     Int?
  updated_ip                     String?

  // Relationships
  tenant                         Tenant        @relation(fields: [tenant_id], references: [tenant_id])
  course_session                 CourseSession @relation(fields: [course_session_id], references: [course_session_id], onDelete: Cascade)
  created_by_user                SystemUser    @relation("CourseSessionAnnouncementCreatedBy", fields: [created_by], references: [system_user_id])
  updated_by_user                SystemUser?   @relation("CourseSessionAnnouncementUpdatedBy", fields: [updated_by], references: [system_user_id])

  // Constraints
  @@unique([course_session_id, title], name: "uq_session_announcement_title")
  @@index([course_session_id, created_at, is_active], name: "idx_session_announcement_chronological")
  @@index([course_session_id, is_urgent, expires_at], name: "idx_session_announcement_urgent", where: "is_urgent = true")
  @@map("course_session_announcements")
}
```

### CourseSessionSettings Model
```prisma
model CourseSessionSettings {
  course_session_settings_id      Int     @id @default(autoincrement())
  tenant_id                       Int
  course_session_id               Int     @unique
  allow_late_enrollment           Boolean @default(false)
  require_approval_for_enrollment Boolean @default(false)
  allow_student_discussions       Boolean @default(true)
  send_reminder_emails            Boolean @default(true)
  reminder_days_before_expiry     Int     @default(7)
  grading_scale                   Json?
  attendance_tracking_enabled     Boolean @default(false)

  // Multi-tenant audit fields
  is_active                       Boolean  @default(true)
  is_deleted                      Boolean  @default(false)
  created_at                      DateTime @default(now())
  created_by                      Int
  created_ip                      String
  updated_at                      DateTime? @updatedAt
  updated_by                      Int?
  updated_ip                      String?

  // Relationships
  tenant                          Tenant        @relation(fields: [tenant_id], references: [tenant_id])
  course_session                  CourseSession @relation(fields: [course_session_id], references: [course_session_id], onDelete: Cascade)
  created_by_user                 SystemUser    @relation("CourseSessionSettingsCreatedBy", fields: [created_by], references: [system_user_id])
  updated_by_user                 SystemUser?   @relation("CourseSessionSettingsUpdatedBy", fields: [updated_by], references: [system_user_id])

  @@index([course_session_id], name: "idx_session_settings_lookup")
  @@map("course_session_settings")
}
```

### Key Design Patterns

1. **Multi-Tenant Isolation**: All entities include `tenant_id` for proper tenant boundary enforcement
2. **Conditional Unique Constraints**: Teacher can have only one active session per course using partial unique constraints
3. **Cascade Relationships**: Enrollments, announcements, and settings cascade when session is deleted
4. **Session Lifecycle Management**: Status-based workflow with draft → published → expired progression
5. **Enrollment Status Tracking**: Comprehensive enrollment lifecycle with completion percentage and grading
6. **Performance Optimization**: Strategic indexes for common query patterns including date ranges and status filtering
7. **Session Code Uniqueness**: Global unique constraint on session codes for easy student joining
8. **Expiry Automation**: Built-in support for automatic session expiration with monitoring indexes

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
    "field": "session_name",
    "reason": "Session name already exists for this teacher and course"
  }
}
```

### Common Error Scenarios

#### Authorization Errors
- **403 FORBIDDEN**: "You can only manage your own course sessions"
- **403 FORBIDDEN**: "Students can only access enrolled sessions"
- **403 FORBIDDEN**: "Teachers can only access assigned sessions"

#### Validation Errors
- **409 CONFLICT**: "Session name already exists for this teacher and course" (errorCode: "DUPLICATE_SESSION_NAME")
- **409 CONFLICT**: "Student already enrolled in this session" (errorCode: "ALREADY_ENROLLED")
- **409 CONFLICT**: "Invalid session code" (errorCode: "INVALID_SESSION_CODE")
- **400 BAD_REQUEST**: "End date must be after start date"
- **400 BAD_REQUEST**: "Cannot enroll after enrollment deadline"

#### Not Found Errors
- **404 NOT_FOUND**: "Course session with ID {sessionId} not found" (errorCode: "SESSION_NOT_FOUND")
- **404 NOT_FOUND**: "Session enrollment not found" (errorCode: "ENROLLMENT_NOT_FOUND")
- **404 NOT_FOUND**: "Session announcement not found" (errorCode: "ANNOUNCEMENT_NOT_FOUND")

#### Business Logic Errors
- **422 UNPROCESSABLE_ENTITY**: "Cannot delete published session with enrollments"
- **422 UNPROCESSABLE_ENTITY**: "Session has expired"
- **422 UNPROCESSABLE_ENTITY**: "Maximum student capacity reached"

## Security Considerations

### Authentication & Authorization
- **JWT-based Authentication**: Required for all endpoints
- **Role-Based Access Control**: SUPER_ADMIN vs TENANT_ADMIN vs Teacher vs Student permissions
- **Tenant Isolation**: Strict enforcement except for SUPER_ADMIN operations
- **Session Ownership**: Teachers can only manage their assigned sessions

### Data Protection
- **Session Code Security**: Auto-generated unique codes for secure joining
- **Enrollment Privacy**: Student progress isolated per tenant and session
- **Announcement Security**: Time-based visibility and expiration
- **Settings Protection**: Configuration changes logged and monitored

### Input Validation and Sanitization
- **Comprehensive Validation**: All fields validated using express-validator
- **SQL Injection Prevention**: Parameterized queries through Prisma ORM
- **XSS Protection**: HTML encoding for all text outputs
- **Date Validation**: ISO date format validation and business rule enforcement

### Rate Limiting and Abuse Prevention
- **API Rate Limiting**: 1000 requests per hour per tenant
- **Session Creation**: 10 sessions per hour per teacher
- **Enrollment Operations**: 100 enrollments per hour per session
- **Announcement Creation**: 20 announcements per hour per session

### Audit and Monitoring
- **Comprehensive Audit Trail**: All operations logged with user, IP, and timestamp
- **Session Activity Tracking**: Detailed analytics for session engagement
- **Enrollment Monitoring**: Real-time tracking of student participation
- **Failed Access Attempts**: Monitoring and alerting for security

### Business Rules Enforcement
- **Session Lifecycle Validation**: Draft → Published → Expired workflow
- **Enrollment Prerequisites**: Session capacity and deadline validation
- **Teacher Assignment**: Only assigned teachers can manage sessions
- **Student Access**: Enrollment-based access to session content

## Implementation Patterns

### Service Layer Pattern
```typescript
// Example from courseSession.service.ts
async createCourseSession(
  data: CreateCourseSessionDto,
  requestingUser: TokenPayload,
  ip?: string
): Promise<CourseSession> {
  return tryCatch(async () => {
    // Validate requesting user context
    if (!requestingUser || !requestingUser.user_type) {
      throw new BadRequestError('Invalid requesting user context');
    }
    
    // Authorization checks
    // Validation logic
    // Business rule enforcement
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
    sessionId,
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
body('end_date')
  .exists().withMessage('End date is required')
  .isISO8601().withMessage('End date must be valid ISO date')
  .custom((value, { req }) => {
    const startDate = new Date(req.body.start_date);
    const endDate = new Date(value);
    if (endDate <= startDate) {
      throw new Error('End date must be after start date');
    }
    return true;
  })
```

## Import Strategy

All imports use configured path aliases:

```typescript
// Shared types
import { 
  CourseSession,
  CourseSessionEnrollment,
  CourseSessionAnnouncement,
  CourseSessionSettings,
  CourseSessionStatus,
  SessionEnrollmentStatus
} from '@shared/types/course-session.types';

// Enums
import { 
  CourseSessionStatus,
  SessionEnrollmentStatus
} from '@/types/enums';

// Internal modules
import { CreateCourseSessionDto, UpdateCourseSessionDto } from '@/dtos/courseSession/courseSession.dto';
import { CourseSessionService } from '@/services/courseSession.service';
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

Based on the core entities relationships, the course session management domain has the following key foreign key constraints:

- **course_sessions.tenant_id** → **tenants.tenant_id** (Required for all sessions)
- **course_sessions.teacher_id** → **teachers.teacher_id** (Required teacher assignment)
- **course_sessions.course_id** → **courses.course_id** (Required course reference)
- **course_session_enrollments.course_session_id** → **course_sessions.course_session_id** (Cascade delete)
- **course_session_enrollments.student_id** → **students.student_id** (Cascade delete)
- **course_session_announcements.course_session_id** → **course_sessions.course_session_id** (Cascade delete)
- **course_session_settings.course_session_id** → **course_sessions.course_session_id** (Cascade delete)

All entities include comprehensive audit trail relationships where system users can create, update, and delete records with proper foreign key constraints and cascade behaviors.

## Data Constraints and Business Rules

### Unique Constraints
- **session_name + teacher_id + course_id**: Session names must be unique per teacher per course
- **course_session_id + student_id**: Student enrollment must be unique per session
- **session_code**: Session codes must be globally unique when assigned

### Check Constraints
- **session_name**: 2-255 characters, non-empty after trimming
- **start_date**: Cannot be in the past for new sessions
- **end_date**: Must be after start_date
- **max_students**: Positive integer when provided, minimum 1
- **completion_percentage**: 0-100 range for enrollment tracking
- **final_grade**: 0-100 range when provided

### Session Lifecycle Rules
- **Draft → Published**: Can only publish draft sessions
- **Published → Expired**: Automatic expiration based on end_date
- **Enrollment Deadline**: Students cannot enroll after deadline
- **Capacity Management**: Enrollment limited by max_students setting

### Status Transition Rules
- **Session Status**: Draft → Published → Expired (one-way transitions)
- **Enrollment Status**: PENDING → ENROLLED → COMPLETED/DROPPED/EXPELLED
- **Auto-Expiration**: Sessions automatically expire after end_date when enabled
- **Enrollment Lifecycle**: Complete tracking of student participation