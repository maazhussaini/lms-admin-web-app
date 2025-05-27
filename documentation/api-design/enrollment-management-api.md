# Enrollment Management API Design

## 1. Introduction

The Enrollment Management API provides comprehensive functionality for managing student course enrollments within the Learning Management System (LMS). This API is designed with multi-tenant architecture, ensuring complete data isolation between different educational institutions while maintaining robust security and audit capabilities.

The API handles enrollment creation, status management, completion tracking, and comprehensive audit trails. All operations are performed within the context of a specific tenant, ensuring data security and compliance with educational privacy requirements.

## 2. Data Model Overview

### Core Enrollment Entities

The enrollment management system is built around several key entities:

- **enrollments** (`@shared/types/student.types.ts`): Complete enrollment lifecycle with status tracking and history
- **enrollment_status_histories**: Comprehensive audit trail of enrollment status changes
- **status_managements**: Enum-driven status workflow with validation

### Key Enums and Status Management

From `student.types.ts`:
- `EnrollmentStatus`: PENDING, ACTIVE, COMPLETED, DROPPED, SUSPENDED, EXPELLED, TRANSFERRED, DEFERRED

### Audit and Multi-tenancy

All entities extend `MultiTenantAuditFields` from `base.types.ts`, providing:
- Tenant isolation (`tenant_id`)
- Comprehensive audit trail (`created_at`, `created_by`, `updated_at`, `updated_by`)
- Soft deletion capabilities (`is_active`, `is_deleted`)
- IP tracking for security (`created_ip`, `updated_ip`)

## 3. API Endpoints

### 3.1 Enrollment Operations

#### Core Enrollment Management

**GET /api/admin/enrollments**
- Description: Retrieve paginated list of enrollments with filtering
- Query Parameters:
  - `page` (number): Page number (default: 1)
  - `limit` (number): Items per page (default: 20, max: 100)
  - `status` (EnrollmentStatus): Filter by enrollment status
  - `course_id` (number): Filter by course
  - `student_id` (number): Filter by student
  - `institute_id` (number): Filter by institute
  - `teacher_id` (number): Filter by teacher
  - `enrolled_from` (string): Filter by enrollment date range
  - `enrolled_to` (string): Filter by enrollment date range
- Response: `TApiSuccessResponse<{ enrollments: Enrollment[], total: number, page: number, limit: number }>`
- Status Code: 200

**GET /api/admin/enrollments/{enrollment_id}**
- Description: Retrieve detailed enrollment information
- Path Parameters:
  - `enrollment_id` (number): Enrollment identifier
- Response: `TApiSuccessResponse<Enrollment>`
- Status Code: 200

**POST /api/admin/enrollments**
- Description: Create new enrollment
- Request Body:
```typescript
{
  course_id: number;
  student_id: number;
  institute_id: number;
  teacher_id?: number;
  enrollment_status_id: EnrollmentStatus;
  expected_completion_date?: string;
}
```
- Response: `TApiSuccessResponse<Enrollment>`
- Status Code: 201

**PATCH /api/admin/enrollments/{enrollment_id}**
- Description: Update enrollment details (non-status fields)
- Path Parameters:
  - `enrollment_id` (number): Enrollment identifier
- Request Body:
```typescript
{
  teacher_id?: number;
  expected_completion_date?: string;
  grade?: string;
  final_score?: number;
}
```
- Response: `TApiSuccessResponse<Enrollment>`
- Status Code: 200

**DELETE /api/admin/enrollments/{enrollment_id}**
- Description: Soft delete enrollment (sets is_deleted = true)
- Path Parameters:
  - `enrollment_id` (number): Enrollment identifier
- Response: `TApiSuccessResponse<{ message: string }>`
- Status Code: 200

### 3.2 Enrollment Status Management

#### Status Change Operations

**PATCH /api/admin/enrollments/{enrollment_id}/status**
- Description: Update enrollment status with history tracking
- Path Parameters:
  - `enrollment_id` (number): Enrollment identifier
- Request Body:
```typescript
{
  new_status_id: EnrollmentStatus;
  change_reason?: string;
  notes?: string;
}
```
- Response: `TApiSuccessResponse<Enrollment>`
- Status Code: 200

**PATCH /api/admin/enrollments/{enrollment_id}/activate**
- Description: Activate pending enrollment
- Path Parameters:
  - `enrollment_id` (number): Enrollment identifier
- Request Body:
```typescript
{
  change_reason?: string;
  notes?: string;
}
```
- Response: `TApiSuccessResponse<Enrollment>`
- Status Code: 200

**PATCH /api/admin/enrollments/{enrollment_id}/suspend**
- Description: Suspend active enrollment
- Path Parameters:
  - `enrollment_id` (number): Enrollment identifier
- Request Body:
```typescript
{
  change_reason: string;
  notes?: string;
  suspension_end_date?: string;
}
```
- Response: `TApiSuccessResponse<Enrollment>`
- Status Code: 200

**PATCH /api/admin/enrollments/{enrollment_id}/complete**
- Description: Mark enrollment as completed with grade and score
- Path Parameters:
  - `enrollment_id` (number): Enrollment identifier
- Request Body:
```typescript
{
  grade?: string;
  final_score?: number;
  actual_completion_date?: string;
  change_reason?: string;
  notes?: string;
}
```
- Response: `TApiSuccessResponse<Enrollment>`
- Status Code: 200

**PATCH /api/admin/enrollments/{enrollment_id}/drop**
- Description: Drop student from enrollment
- Path Parameters:
  - `enrollment_id` (number): Enrollment identifier
- Request Body:
```typescript
{
  change_reason: string;
  notes?: string;
  drop_date?: string;
}
```
- Response: `TApiSuccessResponse<Enrollment>`
- Status Code: 200

**PATCH /api/admin/enrollments/{enrollment_id}/transfer**
- Description: Transfer enrollment to different section/batch
- Path Parameters:
  - `enrollment_id` (number): Enrollment identifier
- Request Body:
```typescript
{
  new_teacher_id?: number;
  change_reason: string;
  notes?: string;
  transfer_date?: string;
}
```
- Response: `TApiSuccessResponse<Enrollment>`
- Status Code: 200

### 3.3 Enrollment Status History

**GET /api/admin/enrollments/{enrollment_id}/status-history**
- Description: Retrieve enrollment status change history
- Path Parameters:
  - `enrollment_id` (number): Enrollment identifier
- Query Parameters:
  - `page` (number): Page number (default: 1)
  - `limit` (number): Items per page (default: 20, max: 100)
- Response: `TApiSuccessResponse<{ history: EnrollmentStatusHistory[], total: number }>`
- Status Code: 200

**GET /api/admin/enrollment-status-history**
- Description: Retrieve enrollment status changes across all enrollments
- Query Parameters:
  - `page` (number): Page number (default: 1)
  - `limit` (number): Items per page (default: 20, max: 100)
  - `status_id` (EnrollmentStatus): Filter by new status
  - `changed_by` (number): Filter by user who made change
  - `changed_from` (string): Filter by date range
  - `changed_to` (string): Filter by date range
  - `course_id` (number): Filter by course
  - `student_id` (number): Filter by student
- Response: `TApiSuccessResponse<{ history: EnrollmentStatusHistory[], total: number }>`
- Status Code: 200

### 3.4 Bulk Enrollment Operations

**POST /api/admin/enrollments/bulk**
- Description: Create multiple enrollments at once
- Request Body:
```typescript
{
  enrollments: Array<{
    course_id: number;
    student_id: number;
    institute_id: number;
    teacher_id?: number;
    enrollment_status_id: EnrollmentStatus;
    expected_completion_date?: string;
  }>;
}
```
- Response: `TApiSuccessResponse<{ created: Enrollment[], failed: Array<{ error: string, data: any }> }>`
- Status Code: 201

**PATCH /api/admin/enrollments/bulk/status**
- Description: Update status for multiple enrollments
- Request Body:
```typescript
{
  enrollment_ids: number[];
  new_status_id: EnrollmentStatus;
  change_reason?: string;
  notes?: string;
}
```
- Response: `TApiSuccessResponse<{ updated: Enrollment[], failed: Array<{ enrollment_id: number, error: string }> }>`
- Status Code: 200

### 3.5 Enrollment Analytics

**GET /api/admin/enrollments/analytics/overview**
- Description: Get enrollment statistics overview
- Query Parameters:
  - `course_id` (number): Filter by course
  - `institute_id` (number): Filter by institute
  - `teacher_id` (number): Filter by teacher
  - `date_from` (string): Filter by date range
  - `date_to` (string): Filter by date range
- Response: `TApiSuccessResponse<{ total: number, by_status: Record<EnrollmentStatus, number>, completion_rate: number }>`
- Status Code: 200

**GET /api/admin/enrollments/analytics/trends**
- Description: Get enrollment trends over time
- Query Parameters:
  - `period` (string): 'daily', 'weekly', 'monthly'
  - `course_id` (number): Filter by course
  - `date_from` (string): Filter by date range
  - `date_to` (string): Filter by date range
- Response: `TApiSuccessResponse<Array<{ period: string, enrollments: number, completions: number }>>`
- Status Code: 200

### 3.6 Student Self-Service Endpoints

**GET /api/student/enrollments**
- Description: Retrieve authenticated student's enrollments
- Headers: `Authorization: Bearer <jwt_token>`
- Query Parameters:
  - `status` (EnrollmentStatus): Filter by enrollment status
  - `course_id` (number): Filter by specific course
- Response: `TApiSuccessResponse<Enrollment[]>`
- Status Code: 200

**GET /api/student/enrollments/{enrollment_id}**
- Description: Retrieve specific enrollment details for authenticated student
- Headers: `Authorization: Bearer <jwt_token>`
- Path Parameters:
  - `enrollment_id` (number): Enrollment identifier
- Response: `TApiSuccessResponse<Enrollment>`
- Status Code: 200

**GET /api/student/enrollments/{enrollment_id}/status-history**
- Description: Retrieve enrollment status history for authenticated student
- Headers: `Authorization: Bearer <jwt_token>`
- Path Parameters:
  - `enrollment_id` (number): Enrollment identifier
- Response: `TApiSuccessResponse<EnrollmentStatusHistory[]>`
- Status Code: 200

### 3.7 Teacher Enrollment Access

**GET /api/teacher/enrollments**
- Description: Retrieve enrollments for authenticated teacher's courses
- Headers: `Authorization: Bearer <jwt_token>`
- Query Parameters:
  - `course_id` (number): Filter by specific course
  - `status` (EnrollmentStatus): Filter by enrollment status
  - `student_id` (number): Filter by specific student
- Response: `TApiSuccessResponse<Enrollment[]>`
- Status Code: 200

**PATCH /api/teacher/enrollments/{enrollment_id}/grade**
- Description: Update grade and score for enrollment (teacher's courses only)
- Headers: `Authorization: Bearer <jwt_token>`
- Path Parameters:
  - `enrollment_id` (number): Enrollment identifier
- Request Body:
```typescript
{
  grade?: string;
  final_score?: number;
  notes?: string;
}
```
- Response: `TApiSuccessResponse<Enrollment>`
- Status Code: 200

## 4. Prisma Schema Considerations

### Database Schema Mapping

#### Enrollment Tables
```prisma
model Enrollment {
  enrollment_id             Int       @id @default(autoincrement())
  tenant_id                 Int
  course_id                 Int
  student_id                Int
  institute_id              Int
  teacher_id                Int?
  enrollment_status_id      Int       // 1-8 enum values
  enrolled_at               DateTime  @default(now())
  expected_completion_date  DateTime?
  actual_completion_date    DateTime?
  status_changed_at         DateTime?
  status_changed_by         Int?
  status_change_reason      String?   @db.Text
  grade                     String?   @db.VarChar(10)
  final_score               Decimal?  @db.Decimal(5,2)
  
  // Audit fields
  is_active                 Boolean   @default(true)
  is_deleted                Boolean   @default(false)
  created_at                DateTime  @default(now())
  created_by                Int
  created_ip                String    @db.VarChar(45)
  updated_at                DateTime? @updatedAt
  updated_by                Int?
  updated_ip                String?   @db.VarChar(45)

  // Relationships
  tenant                    Tenant    @relation(fields: [tenant_id], references: [tenant_id])
  course                    Course    @relation(fields: [course_id], references: [course_id])
  student                   Student   @relation(fields: [student_id], references: [student_id])
  institute                 Institute @relation(fields: [institute_id], references: [institute_id])
  teacher                   Teacher?  @relation(fields: [teacher_id], references: [teacher_id])
  status_history            EnrollmentStatusHistory[]

  @@unique([student_id, course_id], name: "uq_student_course_enrollment")
  @@unique([student_id, course_id, tenant_id], where: { enrollment_status_id: { in: [1, 2] } }, name: "uq_student_course_active_enrollment")
  @@index([enrollment_status_id, enrolled_at, tenant_id], name: "idx_enrollment_status_date")
  @@index([course_id, enrollment_status_id, actual_completion_date], name: "idx_enrollment_course_status_analytics")
  @@map("enrollments")
}

model EnrollmentStatusHistory {
  enrollment_status_history_id Int            @id @default(autoincrement())
  tenant_id                    Int
  enrollment_id                Int
  previous_status_id           Int?
  new_status_id                Int            // 1-8 enum values
  status_changed_at            DateTime       @default(now())
  changed_by                   Int
  change_reason                String?        @db.Text
  notes                        String?        @db.Text
  
  // Audit fields
  is_active                    Boolean        @default(true)
  is_deleted                   Boolean        @default(false)
  created_at                   DateTime       @default(now())
  created_by                   Int
  created_ip                   String         @db.VarChar(45)
  updated_at                   DateTime?      @updatedAt
  updated_by                   Int?
  updated_ip                   String?        @db.VarChar(45)

  // Relationships
  tenant                       Tenant         @relation(fields: [tenant_id], references: [tenant_id])
  enrollment                   Enrollment     @relation(fields: [enrollment_id], references: [enrollment_id], onDelete: Cascade)
  changed_by_user              SystemUser     @relation(fields: [changed_by], references: [system_user_id])

  @@unique([enrollment_id, status_changed_at, new_status_id], name: "uq_enrollment_status_history_entry")
  @@index([enrollment_id, status_changed_at], name: "idx_enrollment_status_history_lookup")
  @@index([new_status_id, status_changed_at, tenant_id], name: "idx_enrollment_status_change_analytics")
  @@map("enrollment_status_histories")
}
```

### Key Schema Design Decisions

1. **Multi-tenant Isolation**: All tables include `tenant_id` with appropriate indexes
2. **Unique Enrollment Constraint**: One student can only have one enrollment per course
3. **Active Enrollment Constraint**: Only one active or pending enrollment per student-course combination
4. **Status History Tracking**: Complete audit trail of all status changes
5. **Optional Teacher Assignment**: Teacher can be assigned later or changed
6. **Performance Indexes**: Optimized for common query patterns
7. **Cascading History**: Status history is deleted when enrollment is deleted
8. **Snake Case Naming**: All table and column names use snake_case convention
9. **Decimal Precision**: Final scores stored with 2 decimal places (0.00-100.00)

## 5. Error Handling

### Standardized Error Response Structure

All API endpoints return errors using the `TApiErrorResponse` structure from `api.types.ts`:

```typescript
{
  statusCode: number;
  message: string;
  errorCode: string;
  details?: any;
  timestamp: string;
  path: string;
}
```

### Common HTTP Status Codes

- **200**: Success (GET, PATCH operations)
- **201**: Created (POST operations)
- **400**: Bad Request (validation errors, constraint violations)
- **401**: Unauthorized (authentication required)
- **403**: Forbidden (insufficient permissions, tenant isolation violation)
- **404**: Not Found (resource doesn't exist)
- **409**: Conflict (unique constraint violations)
- **422**: Unprocessable Entity (business logic violations)
- **500**: Internal Server Error (system errors)

### Specific Error Scenarios

#### Constraint Violation Errors

**Duplicate Enrollment (409)**
```json
{
  "statusCode": 409,
  "message": "Student is already enrolled in this course",
  "errorCode": "DUPLICATE_ENROLLMENT",
  "details": {
    "constraint": "uq_student_course_enrollment",
    "student_id": 123,
    "course_id": 456
  }
}
```

**Active Enrollment Exists (409)**
```json
{
  "statusCode": 409,
  "message": "Student already has an active or pending enrollment for this course",
  "errorCode": "ACTIVE_ENROLLMENT_EXISTS",
  "details": {
    "constraint": "uq_student_course_active_enrollment",
    "student_id": 123,
    "course_id": 456,
    "existing_status": "ACTIVE"
  }
}
```

#### Business Logic Errors

**Invalid Status Transition (422)**
```json
{
  "statusCode": 422,
  "message": "Cannot change enrollment status from COMPLETED to ACTIVE",
  "errorCode": "INVALID_STATUS_TRANSITION",
  "details": {
    "current_status": "COMPLETED",
    "requested_status": "ACTIVE",
    "enrollment_id": 789,
    "valid_transitions": ["TRANSFERRED"]
  }
}
```

**Completion Without Active Status (422)**
```json
{
  "statusCode": 422,
  "message": "Cannot complete enrollment that is not in ACTIVE status",
  "errorCode": "INVALID_COMPLETION_STATUS",
  "details": {
    "current_status": "SUSPENDED",
    "enrollment_id": 789,
    "required_status": "ACTIVE"
  }
}
```

#### Validation Errors

**Invalid Final Score (400)**
```json
{
  "statusCode": 400,
  "message": "Final score must be between 0 and 100",
  "errorCode": "INVALID_FINAL_SCORE",
  "details": {
    "field": "final_score",
    "value": 150,
    "min": 0,
    "max": 100
  }
}
```

**Future Enrollment Date (400)**
```json
{
  "statusCode": 400,
  "message": "Enrollment date cannot be in the future",
  "errorCode": "INVALID_ENROLLMENT_DATE",
  "details": {
    "field": "enrolled_at",
    "value": "2025-01-01",
    "constraint": "enrollment_date_past_check"
  }
}
```

## 6. Security Considerations

### Authentication and Authorization

#### JWT-Based Authentication
- All authenticated endpoints require valid JWT tokens in Authorization header
- Token structure follows `TAuthResponse` from `api.types.ts`
- Tokens include tenant context for multi-tenant isolation
- Separate token scopes for students, teachers, and administrators

#### Role-Based Access Control (RBAC)
- **Admin Role**: Full CRUD access to all enrollment management endpoints
- **Teacher Role**: Limited access to enrollments for assigned courses only
- **Student Role**: Read-only access to own enrollment data and history
- **Tenant Isolation**: All operations automatically filtered by tenant_id

### Data Protection and Privacy

#### Tenant Isolation
- All database queries automatically include tenant_id filtering
- Cross-tenant enrollment data access is strictly prohibited
- API responses never expose enrollment data from other tenants

#### Sensitive Data Handling
- Enrollment notes and change reasons treated as sensitive data
- Grade information protected with additional access controls
- IP tracking for all enrollment status changes
- Complete audit trail for compliance requirements

### Input Validation and Sanitization

#### Comprehensive Validation
- Enrollment status transitions validated against business rules
- Final scores validated within 0-100 range
- Grade format validation (A-F, percentage, etc.)
- Date validation for enrollment and completion dates
- Change reason required for critical status changes

#### SQL Injection Prevention
- Parameterized queries through Prisma ORM
- No dynamic SQL construction
- Input sanitization for all user-provided data

#### XSS Protection
- HTML encoding for notes and change reasons
- Content Security Policy headers
- Input sanitization for all text fields

### Rate Limiting and Abuse Prevention

#### API Rate Limiting
- Global rate limit: 1000 requests per hour per tenant
- Enrollment creation: 50 per hour per admin user
- Status changes: 100 per hour per admin user
- Bulk operations: 10 per hour per admin user

#### Enrollment Protection
- Maximum 5 status changes per day per enrollment
- Bulk enrollment operations limited to 100 records
- Completion status changes require additional validation
- Grade updates limited to authorized users only

### Audit and Monitoring

#### Comprehensive Audit Trail
- All enrollment operations logged with user, IP, and timestamp
- Status changes tracked in separate history table
- Change reasons logged for critical transitions
- Failed enrollment attempts logged and monitored

#### Security Monitoring
- Suspicious enrollment pattern detection
- Bulk operation monitoring and alerting
- Unauthorized status change attempts
- Cross-tenant access attempt logging

#### Compliance Features
- FERPA compliance for student enrollment records
- Complete enrollment history preservation
- Data retention policies for audit trails
- Export capabilities for compliance reporting

### Additional Security Measures

#### HTTPS and Encryption
- TLS 1.3 required for all API communications
- Perfect Forward Secrecy (PFS) enabled
- Database connection encryption
- At-rest encryption for sensitive enrollment data

#### API Security Headers
- CORS policy configuration
- X-Frame-Options: DENY
- X-Content-Type-Options: nosniff
- Strict-Transport-Security headers

#### Business Logic Security
- Enrollment status transition validation
- Teacher-course assignment verification
- Institute association validation
- Grade modification permissions
- Completion requirements enforcement

### Import Strategy
All type imports use `@shared/types/` path strategy:
```typescript
import { 
  Enrollment, 
  EnrollmentStatusHistory,
  EnrollmentStatus,
  Institute,
  StudentInstitute
} from '@shared/types/student.types';
import { 
  Student 
} from '@shared/types/student.types';
import { 
  Course 
} from '@shared/types/course.types';
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
  MultiTenantAuditFields 
} from '@shared/types/base.types';
import { 
  TApiSuccessResponse, 
  TApiErrorResponse 
} from '@shared/types/api.types';
```