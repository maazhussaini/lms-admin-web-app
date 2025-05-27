# Course Session Management API Design

## Introduction

The Course Session Management API provides comprehensive functionality for managing time-bound learning containers within the LMS platform. Course sessions represent organized learning environments where a single teacher delivers a specific course to multiple students within defined time boundaries. This API implements multi-tenant isolation, role-based access control, and supports the complete lifecycle of session management including enrollment, announcements, settings, and progress tracking.

## Data Model Overview

### Core Entities

The Course Session domain consists of the following main entities defined in `@shared/types/course-session.types.ts`:

- **course_sessions**: Time-bound learning container with one teacher, one course, multiple students
- **course_session_status_lookups**: Reference data for session lifecycle status
- **course_session_enrollments**: Student enrollment records in specific sessions
- **course_session_announcements**: Teacher announcements for session communication
- **course_session_settings**: Configuration settings for session behavior

### Key Enums

From `@shared/types/course-session.types.ts`:

- **CourseSessionStatus**: `DRAFT (1)`, `PUBLISHED (2)`, `EXPIRED (3)`
- **SessionEnrollmentStatus**: `ENROLLED (1)`, `DROPPED (2)`, `COMPLETED (3)`, `EXPELLED (4)`

### Base Interfaces

All entities extend `MultiTenantAuditFields` from `@shared/types/base.types.ts`, providing:
- Tenant isolation (`tenant_id`)
- Audit trail fields (`created_at`, `created_by`, `updated_at`, `updated_by`)
- Soft delete support (`is_active`, `is_deleted`)
- IP tracking for security (`created_ip`, `updated_ip`)

### Entity Relationships

Based on `@shared/entity-relationships/course-session-entities.types.ts`:
- Course sessions belong to tenants and are assigned to teachers for specific courses
- Enrollments link students to sessions with completion tracking
- Announcements provide communication channels within sessions
- Settings control session behavior and policies

## API Endpoints

### Teacher/Admin Operations

#### Create Course Session
- **Method**: `POST`
- **Path**: `/api/v1/teacher/sessions`
- **Description**: Create a new course session for a specific course
- **Request Body**:
```json
{
  "session_name": "Spring 2024 - Advanced Mathematics",
  "session_description": "Advanced calculus and linear algebra course",
  "course_id": 123,
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
    "session_code": "MATH2024A1",
    "course_session_status_id": 1,
    "teacher_id": 789,
    "course_id": 123,
    "start_date": "2024-03-01T09:00:00Z",
    "end_date": "2024-06-30T17:00:00Z",
    "created_at": "2024-01-15T10:30:00Z"
  },
  "message": "Course session created successfully"
}
```

#### List Teacher Sessions
- **Method**: `GET`
- **Path**: `/api/v1/teacher/sessions`
- **Description**: Retrieve course sessions assigned to the current teacher
- **Query Parameters**:
  - `page?: number` - Page number (default: 1)
  - `limit?: number` - Items per page (default: 20)
  - `status?: CourseSessionStatus` - Filter by session status
  - `course_id?: number` - Filter by specific course
  - `start_date?: string` - Filter sessions starting after date
  - `end_date?: string` - Filter sessions ending before date
- **Response**: `200 OK`
```json
{
  "success": true,
  "data": {
    "sessions": [
      {
        "course_session_id": 456,
        "session_name": "Spring 2024 - Advanced Mathematics",
        "course_name": "Advanced Mathematics",
        "course_session_status_id": 2,
        "start_date": "2024-03-01T09:00:00Z",
        "end_date": "2024-06-30T17:00:00Z",
        "enrolled_students_count": 25,
        "max_students": 30
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 5,
      "total_pages": 1
    }
  }
}
```

#### Update Course Session
- **Method**: `PATCH`
- **Path**: `/api/v1/teacher/sessions/{sessionId}`
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
- **Description**: Publish a draft session to make it available for enrollment
- **Response**: `200 OK`
```json
{
  "success": true,
  "data": {
    "course_session_id": 456,
    "course_session_status_id": 2,
    "session_code": "MATH2024A1",
    "updated_at": "2024-01-15T14:20:00Z"
  },
  "message": "Course session published successfully"
}
```

#### Delete Course Session
- **Method**: `DELETE`
- **Path**: `/api/v1/teacher/sessions/{sessionId}`
- **Description**: Soft delete a course session (only for draft sessions)
- **Response**: `204 No Content`

### Session Enrollment Management

#### Get Session Enrollments
- **Method**: `GET`
- **Path**: `/api/v1/teacher/sessions/{sessionId}/enrollments`
- **Description**: Retrieve all enrollments for a specific session
- **Query Parameters**:
  - `status?: SessionEnrollmentStatus` - Filter by enrollment status
  - `page?: number`
  - `limit?: number`
- **Response**: `200 OK`
```json
{
  "success": true,
  "data": {
    "enrollments": [
      {
        "course_session_enrollment_id": 789,
        "student_id": 123,
        "student_name": "John Doe",
        "student_email": "john.doe@email.com",
        "enrolled_at": "2024-02-15T10:00:00Z",
        "enrollment_status": "ENROLLED",
        "completion_percentage": 75,
        "final_grade": null
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 25,
      "total_pages": 2
    }
  }
}
```

#### Approve/Reject Enrollment
- **Method**: `PATCH`
- **Path**: `/api/v1/teacher/sessions/{sessionId}/enrollments/{enrollmentId}/status`
- **Description**: Update enrollment status (approve, reject, expel)
- **Request Body**:
```json
{
  "enrollment_status": "ENROLLED",
  "reason": "Application approved"
}
```
- **Response**: `200 OK`

#### Update Student Grade
- **Method**: `PATCH`
- **Path**: `/api/v1/teacher/sessions/{sessionId}/enrollments/{enrollmentId}/grade`
- **Description**: Update final grade for student
- **Request Body**:
```json
{
  "final_grade": 85,
  "feedback": "Excellent performance throughout the session"
}
```
- **Response**: `200 OK`

### Session Announcements

#### Create Announcement
- **Method**: `POST`
- **Path**: `/api/v1/teacher/sessions/{sessionId}/announcements`
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
- **Description**: Retrieve announcements for a session
- **Query Parameters**:
  - `is_urgent?: boolean` - Filter urgent announcements
  - `active_only?: boolean` - Filter non-expired announcements
- **Response**: `200 OK`

#### Update Announcement
- **Method**: `PATCH`
- **Path**: `/api/v1/teacher/sessions/{sessionId}/announcements/{announcementId}`
- **Description**: Update announcement details
- **Response**: `200 OK`

#### Delete Announcement
- **Method**: `DELETE`
- **Path**: `/api/v1/teacher/sessions/{sessionId}/announcements/{announcementId}`
- **Description**: Soft delete an announcement
- **Response**: `204 No Content`

### Session Settings Management

#### Get Session Settings
- **Method**: `GET`
- **Path**: `/api/v1/teacher/sessions/{sessionId}/settings`
- **Description**: Retrieve session configuration settings
- **Response**: `200 OK`
```json
{
  "success": true,
  "data": {
    "course_session_settings_id": 123,
    "allow_late_enrollment": false,
    "require_approval_for_enrollment": true,
    "allow_student_discussions": true,
    "send_reminder_emails": true,
    "reminder_days_before_expiry": 7,
    "attendance_tracking_enabled": true,
    "grading_scale": {
      "A": {"min": 90, "max": 100},
      "B": {"min": 80, "max": 89},
      "C": {"min": 70, "max": 79}
    }
  }
}
```

#### Update Session Settings
- **Method**: `PUT`
- **Path**: `/api/v1/teacher/sessions/{sessionId}/settings`
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
  }
}
```
- **Response**: `200 OK`

### Student Operations

#### Join Session by Code
- **Method**: `POST`
- **Path**: `/api/v1/student/sessions/join`
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
    "session_name": "Spring 2024 - Advanced Mathematics",
    "enrollment_status": "ENROLLED",
    "enrolled_at": "2024-02-20T15:30:00Z"
  },
  "message": "Successfully enrolled in session"
}
```

#### List Student Sessions
- **Method**: `GET`
- **Path**: `/api/v1/student/sessions`
- **Description**: Retrieve sessions the student is enrolled in
- **Query Parameters**:
  - `status?: SessionEnrollmentStatus` - Filter by enrollment status
  - `active_only?: boolean` - Filter active sessions only
- **Response**: `200 OK`
```json
{
  "success": true,
  "data": {
    "sessions": [
      {
        "course_session_id": 123,
        "session_name": "Spring 2024 - Advanced Mathematics",
        "course_name": "Advanced Mathematics",
        "teacher_name": "Dr. Smith",
        "enrollment_status": "ENROLLED",
        "completion_percentage": 75,
        "start_date": "2024-03-01T09:00:00Z",
        "end_date": "2024-06-30T17:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 3,
      "total_pages": 1
    }
  }
}
```

#### Get Session Details
- **Method**: `GET`
- **Path**: `/api/v1/student/sessions/{sessionId}`
- **Description**: Get detailed information about enrolled session
- **Response**: `200 OK`

#### Drop from Session
- **Method**: `DELETE`
- **Path**: `/api/v1/student/sessions/{sessionId}/enrollment`
- **Description**: Drop from a session (if allowed by settings)
- **Response**: `200 OK`

#### Get Session Announcements (Student)
- **Method**: `GET`
- **Path**: `/api/v1/student/sessions/{sessionId}/announcements`
- **Description**: Retrieve active announcements for enrolled session
- **Response**: `200 OK`

### Admin Operations

#### List All Sessions
- **Method**: `GET`
- **Path**: `/api/v1/admin/sessions`
- **Description**: Retrieve all sessions within tenant (admin overview)
- **Query Parameters**:
  - `teacher_id?: number` - Filter by teacher
  - `course_id?: number` - Filter by course
  - `status?: CourseSessionStatus` - Filter by status
  - `start_date?: string`
  - `end_date?: string`
- **Response**: `200 OK`

#### Get Session Analytics
- **Method**: `GET`
- **Path**: `/api/v1/admin/sessions/{sessionId}/analytics`
- **Description**: Retrieve session performance analytics
- **Response**: `200 OK`
```json
{
  "success": true,
  "data": {
    "session_overview": {
      "total_enrolled": 25,
      "active_students": 23,
      "dropped_students": 2,
      "average_completion": 78.5,
      "average_grade": 82.3
    },
    "enrollment_timeline": [
      {"date": "2024-02-15", "enrolled_count": 15},
      {"date": "2024-02-20", "enrolled_count": 25}
    ],
    "completion_distribution": {
      "0-25%": 2,
      "26-50%": 3,
      "51-75%": 8,
      "76-100%": 12
    }
  }
}
```

## Prisma Schema Considerations

### CourseSessionStatusLookup Model
```prisma
model CourseSessionStatusLookup {
  course_session_status_id Int     @id @default(autoincrement())
  status_name              String  @unique
  description              String?
  
  // Minimal audit fields
  is_active                Boolean @default(true)
  created_at               DateTime @default(now())
  created_by               Int
  updated_at               DateTime? @updatedAt
  updated_by               Int?

  // Relationships
  course_sessions          CourseSession[]
  created_by_user          SystemUser @relation("CourseSessionStatusCreatedBy", fields: [created_by], references: [system_user_id])
  updated_by_user          SystemUser? @relation("CourseSessionStatusUpdatedBy", fields: [updated_by], references: [system_user_id])

  @@map("course_session_status_lookups")
}
```

### CourseSession Model
```prisma
model CourseSession {
  course_session_id        Int      @id @default(autoincrement())
  tenant_id                Int
  teacher_id               Int
  course_id                Int
  course_session_status_id Int
  session_name             String
  session_description      String?
  start_date               DateTime
  end_date                 DateTime
  max_students             Int?
  enrollment_deadline      DateTime?
  session_timezone         String?
  session_code             String?  @unique
  auto_expire_enabled      Boolean  @default(true)

  // Multi-tenant audit fields
  is_active                Boolean  @default(true)
  is_deleted               Boolean  @default(false)
  created_at               DateTime @default(now())
  created_by               Int
  created_ip               String
  updated_at               DateTime? @updatedAt
  updated_by               Int?
  updated_ip               String?

  // Relationships
  tenant                   Tenant   @relation(fields: [tenant_id], references: [tenant_id])
  teacher                  Teacher  @relation(fields: [teacher_id], references: [teacher_id])
  course                   Course   @relation(fields: [course_id], references: [course_id])
  status                   CourseSessionStatusLookup @relation(fields: [course_session_status_id], references: [course_session_status_id])
  enrollments              CourseSessionEnrollment[]
  announcements            CourseSessionAnnouncement[]
  settings                 CourseSessionSettings?
  created_by_user          SystemUser @relation("CourseSessionCreatedBy", fields: [created_by], references: [system_user_id])
  updated_by_user          SystemUser? @relation("CourseSessionUpdatedBy", fields: [updated_by], references: [system_user_id])

  // Constraints
  @@unique([session_name, tenant_id], name: "uq_course_session_name_tenant")
  @@unique([teacher_id, course_id], name: "uq_teacher_course_active_session", where: "course_session_status_id IN (1, 2)")
  @@index([course_session_status_id, tenant_id, is_active], name: "idx_course_session_status_tenant")
  @@index([teacher_id, tenant_id, course_session_status_id], name: "idx_course_session_teacher")
  @@index([course_id, tenant_id, course_session_status_id], name: "idx_course_session_course")
  @@index([start_date, end_date, tenant_id], name: "idx_course_session_date_range")
  @@index([end_date, course_session_status_id, auto_expire_enabled], name: "idx_course_session_expiry", where: "course_session_status_id = 2 AND auto_expire_enabled = true")
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
  enrollment_status            Int      @default(1) // 1=ENROLLED, 2=DROPPED, 3=COMPLETED, 4=EXPELLED
  completion_percentage        Int      @default(0)
  final_grade                  Int?
  completion_date              DateTime?

  // Multi-tenant audit fields
  is_active                    Boolean  @default(true)
  is_deleted                   Boolean  @default(false)
  created_at                   DateTime @default(now())
  created_by                   Int
  created_ip                   String
  updated_at                   DateTime? @updatedAt
  updated_by                   Int?
  updated_ip                   String?

  // Relationships
  tenant                       Tenant           @relation(fields: [tenant_id], references: [tenant_id])
  course_session               CourseSession    @relation(fields: [course_session_id], references: [course_session_id], onDelete: Cascade)
  student                      Student          @relation(fields: [student_id], references: [student_id], onDelete: Cascade)
  created_by_user              SystemUser       @relation("CourseSessionEnrollmentCreatedBy", fields: [created_by], references: [system_user_id])
  updated_by_user              SystemUser?      @relation("CourseSessionEnrollmentUpdatedBy", fields: [updated_by], references: [system_user_id])

  // Constraints
  @@unique([course_session_id, student_id], name: "uq_student_session_enrollment")
  @@index([course_session_id, enrollment_status], name: "idx_session_enrollment_session")
  @@index([student_id, tenant_id, enrollment_status], name: "idx_session_enrollment_student")
  @@index([course_session_id, completion_percentage, enrollment_status], name: "idx_session_enrollment_completion")
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
    "field": "end_date",
    "reason": "End date must be after start date"
  }
}
```

### Common Error Codes
- **400**: `VALIDATION_ERROR` - Invalid input data (date ranges, student limits)
- **401**: `UNAUTHORIZED` - Authentication required
- **403**: `FORBIDDEN` - Insufficient permissions (teacher/student access restrictions)
- **404**: `SESSION_NOT_FOUND` - Session does not exist or not accessible
- **409**: `CONFLICT` - Session name already exists, enrollment conflicts
- **422**: `BUSINESS_RULE_VIOLATION` - Session rules violated (enrollment deadline passed, session expired)
- **500**: `INTERNAL_ERROR` - Server error

### Session-Specific Error Scenarios
- **SESSION_EXPIRED**: Attempting to enroll in expired session
- **ENROLLMENT_DEADLINE_PASSED**: Late enrollment not allowed
- **SESSION_FULL**: Maximum students reached
- **ALREADY_ENROLLED**: Student already enrolled in session
- **INVALID_SESSION_CODE**: Invalid or expired session join code
- **TEACHER_SESSION_OVERLAP**: Teacher already has active session for course

## Security Considerations

### Authentication & Authorization
- **JWT-based Authentication**: Using `TAuthResponse` structure
- **Role-Based Access Control**: Teacher/Student/Admin role segregation
- **Tenant Isolation**: Strict tenant boundary enforcement
- **Session-Level Permissions**: Teachers can only manage their own sessions

### Data Protection
- **Audit Trails**: Comprehensive logging using `MultiTenantAuditFields`
- **Soft Deletes**: No permanent data deletion, maintaining data integrity
- **Input Validation**: Session name lengths, date range validation, student limits
- **Session Code Security**: Auto-generated unique codes for secure joining

### Access Control Patterns
- **Teacher Restrictions**: Can only access sessions they teach
- **Student Restrictions**: Can only access enrolled sessions
- **Admin Oversight**: Full tenant-level session visibility
- **Enrollment Approval**: Optional approval workflow for controlled access

### Security Constraints
Based on constraint definitions:
- Session name length: 2-255 characters (trimmed)
- Session description: max 1000 characters
- Session code format: 6-12 uppercase alphanumeric characters
- Date consistency: start_date < end_date
- Grade validation: 0-100 range
- Completion percentage: 0-100 range

### Session Code Security
- **Unique Generation**: Globally unique 6-12 character codes
- **Time-Limited**: Codes become invalid after session expiry
- **Audit Logging**: All join attempts logged with IP tracking
- **Rate Limiting**: Protection against brute force code guessing

## Naming Conventions

### API Endpoints
- **Versioning**: `/api/v1/` prefix for all endpoints
- **Resource Names**: Plural nouns (`sessions`, `enrollments`, `announcements`)
- **Nested Resources**: `/sessions/{sessionId}/enrollments`
- **Actions**: HTTP verbs with descriptive paths (`/sessions/{sessionId}/publish`)

### Request/Response Bodies
- **PascalCase**: For JSON properties in TypeScript interfaces
- **snake_case**: For database column references
- **Consistent Structure**: Following `TApiSuccessResponse` pattern
- **Descriptive Naming**: Clear entity and action identification

### Database Models
- **snake_case**: For all database columns and table names
- **Descriptive Prefixes**: `course_session_` prefix for related entities
- **Constraint Naming**: Consistent patterns (`uq_`, `idx_`, `fk_`, `chk_`)

### Import Strategy
All type imports use `@shared/types/` path strategy:
```typescript
import { 
  CourseSession,
  CourseSessionStatusLookup,
  CourseSessionEnrollment,
  CourseSessionAnnouncement,
  CourseSessionSettings,
  CourseSessionStatus
} from '@shared/types/course-session.types';
import { 
  Course 
} from '@shared/types/course.types';
import { 
  Student 
} from '@shared/types/student.types';
import { 
  Teacher 
} from '@shared/types/teacher.types';
import { 
  SystemUser 
} from '@shared/types/user.types';
import { 
  Tenant 
} from '@shared/types/tenant.types';
import { 
  MultiTenantAuditFields,
  MinimalAuditFields 
} from '@shared/types/base.types';
import { 
  TApiSuccessResponse, 
  TApiErrorResponse 
} from '@shared/types/api.types';
```