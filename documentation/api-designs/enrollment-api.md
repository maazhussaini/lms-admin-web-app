# Enrollment Management API Design

## Introduction

The Enrollment Management API provides comprehensive functionality for managing student course enrollments within the Learning Management System (LMS). This API handles the fundamental relationship between students and courses, including institute-based enrollments, status tracking, and progress monitoring. It implements multi-tenant isolation, role-based access control, and supports the complete lifecycle of enrollment management.

The API handles general course enrollments (distinct from time-bound course sessions), institute management, enrollment status tracking, and comprehensive progress analytics. All operations are performed within the context of a specific tenant, ensuring data security and compliance with educational privacy requirements.

## Data Model Overview

### Core Entities

The Enrollment Management domain consists of the following main entities defined in `@shared/types/student.types.ts`:

- **enrollments**: Student-course relationships through institutes with comprehensive tracking
- **enrollment_status_histories**: Complete audit trail of enrollment status changes
- **student_course_progresses**: Detailed progress tracking and analytics for enrolled courses
- **institutes**: Educational institutions within tenants for enrollment management
- **student_institutes**: Student associations with institutes for multi-institute support

### Key Enums

From `@/types/enums.types.ts`:

- **EnrollmentStatus**: `PENDING`, `ACTIVE`, `COMPLETED`, `DROPPED`, `SUSPENDED`, `EXPELLED`, `TRANSFERRED`, `DEFERRED`

### Base Interfaces

All entities extend `MultiTenantAuditFields` from `@shared/types/base.types.ts`, providing:
- Tenant isolation (`tenant_id`)
- Comprehensive audit trail (`created_at`, `created_by`, `updated_at`, `updated_by`)
- Soft deletion capabilities (`is_active`, `is_deleted`, `deleted_at`, `deleted_by`)
- IP tracking for security (`created_ip`, `updated_ip`)

## API Endpoints

### Student Enrollment Operations

#### Enroll in Course
- **Method**: `POST`
- **Path**: `/api/v1/student/enrollments`
- **Authorization**: Student JWT Token
- **Description**: Enroll authenticated student in a course through an institute
- **Request Body**:
```json
{
  "course_id": 123,
  "institute_id": 456,
  "teacher_id": 789
}
```
- **Response**: `201 Created`
```json
{
  "success": true,
  "data": {
    "enrollment_id": 789,
    "course_id": 123,
    "student_id": 456,
    "institute_id": 456,
    "teacher_id": 789,
    "enrolled_at": "2024-01-15T10:30:00Z",
    "enrollment_status": "PENDING",
    "tenant_id": 123,
    "created_at": "2024-01-15T10:30:00Z",
    "is_active": true,
    "is_deleted": false
  },
  "message": "Enrollment request submitted successfully"
}
```

#### Get Student Enrollments
- **Method**: `GET`
- **Path**: `/api/v1/student/enrollments`
- **Authorization**: Student JWT Token
- **Description**: Retrieve authenticated student's course enrollments
- **Query Parameters**:
  - `status?: EnrollmentStatus` - Filter by enrollment status
  - `courseId?: number` - Filter by specific course
  - `instituteId?: number` - Filter by institute
  - `page?: number` - Page number (default: 1)
  - `limit?: number` - Items per page (default: 20, max: 100)
- **Response**: `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "enrollment_id": 789,
      "course_id": 123,
      "enrollment_status": "ACTIVE",
      "enrolled_at": "2024-01-15T10:30:00Z",
      "course": {
        "course_name": "Introduction to Programming",
        "course_status": "PUBLISHED"
      },
      "institute": {
        "institute_name": "Computer Science Department"
      },
      "progress": {
        "overall_progress_percentage": 75,
        "videos_completed": 15,
        "total_time_spent_minutes": 1200
      }
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

#### Get Enrollment Details
- **Method**: `GET`
- **Path**: `/api/v1/student/enrollments/{enrollmentId}`
- **Authorization**: Student JWT Token
- **Description**: Get detailed enrollment information for authenticated student
- **Response**: `200 OK`
```json
{
  "success": true,
  "data": {
    "enrollment_id": 789,
    "course_id": 123,
    "student_id": 456,
    "institute_id": 456,
    "teacher_id": 789,
    "enrollment_status": "ACTIVE",
    "enrolled_at": "2024-01-15T10:30:00Z",
    "course": {
      "course_name": "Introduction to Programming",
      "course_total_hours": 40.5,
      "course_status": "PUBLISHED"
    },
    "teacher": {
      "full_name": "Dr. Jane Smith",
      "email_address": "jane.smith@university.edu"
    },
    "progress": {
      "overall_progress_percentage": 75,
      "modules_completed": 3,
      "videos_completed": 15,
      "total_time_spent_minutes": 1200,
      "last_accessed_at": "2024-01-20T14:30:00Z"
    }
  }
}
```

#### Drop from Course
- **Method**: `DELETE`
- **Path**: `/api/v1/student/enrollments/{enrollmentId}`
- **Authorization**: Student JWT Token
- **Description**: Drop from a course (changes status to DROPPED)
- **Response**: `200 OK`
```json
{
  "success": true,
  "data": {
    "enrollment_id": 789,
    "enrollment_status": "DROPPED",
    "dropped_at": "2024-01-20T15:00:00Z"
  },
  "message": "Successfully dropped from course"
}
```

### Teacher Enrollment Management

#### Get Teacher Course Enrollments
- **Method**: `GET`
- **Path**: `/api/v1/teacher/enrollments`
- **Authorization**: Teacher JWT Token
- **Description**: Get enrollments for courses assigned to authenticated teacher
- **Query Parameters**:
  - `courseId?: number` - Filter by specific course
  - `status?: EnrollmentStatus` - Filter by enrollment status
  - `instituteId?: number` - Filter by institute
  - `page?: number` - Page number (default: 1)
  - `limit?: number` - Items per page (default: 20, max: 100)
- **Response**: `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "enrollment_id": 789,
      "course_id": 123,
      "student_id": 456,
      "enrollment_status": "ACTIVE",
      "enrolled_at": "2024-01-15T10:30:00Z",
      "student": {
        "full_name": "John Doe",
        "email_address": "john.doe@student.edu"
      },
      "course": {
        "course_name": "Introduction to Programming"
      },
      "progress": {
        "overall_progress_percentage": 75,
        "last_accessed_at": "2024-01-20T14:30:00Z"
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

#### Approve Enrollment
- **Method**: `PATCH`
- **Path**: `/api/v1/teacher/enrollments/{enrollmentId}/approve`
- **Authorization**: Teacher JWT Token (for assigned courses)
- **Description**: Approve a pending enrollment for teacher's course
- **Response**: `200 OK`
```json
{
  "success": true,
  "data": {
    "enrollment_id": 789,
    "enrollment_status": "ACTIVE",
    "approved_at": "2024-01-16T09:00:00Z"
  },
  "message": "Enrollment approved successfully"
}
```

#### Reject Enrollment
- **Method**: `PATCH`
- **Path**: `/api/v1/teacher/enrollments/{enrollmentId}/reject`
- **Authorization**: Teacher JWT Token (for assigned courses)
- **Description**: Reject a pending enrollment for teacher's course
- **Request Body**:
```json
{
  "rejection_reason": "Course capacity reached"
}
```
- **Response**: `200 OK`

#### Update Student Status
- **Method**: `PATCH`
- **Path**: `/api/v1/teacher/enrollments/{enrollmentId}/status`
- **Authorization**: Teacher JWT Token (for assigned courses)
- **Description**: Update enrollment status (suspend, reactivate, etc.)
- **Request Body**:
```json
{
  "enrollment_status": "SUSPENDED",
  "status_reason": "Academic misconduct"
}
```
- **Response**: `200 OK`

### Admin Enrollment Management

#### List All Enrollments
- **Method**: `GET`
- **Path**: `/api/v1/admin/enrollments`
- **Authorization**: SUPER_ADMIN, TENANT_ADMIN
- **Description**: Retrieve all enrollments within tenant (admin overview)
- **Query Parameters**:
  - `studentId?: number` - Filter by student
  - `courseId?: number` - Filter by course
  - `teacherId?: number` - Filter by teacher
  - `instituteId?: number` - Filter by institute
  - `status?: EnrollmentStatus` - Filter by status
  - `enrolledFrom?: string` - Filter by enrollment date (ISO)
  - `enrolledTo?: string` - Filter by enrollment date (ISO)
  - `page?: number` - Page number (default: 1)
  - `limit?: number` - Items per page (default: 20, max: 100)
  - `sortBy?: string` - Sort by field (enrollment_id, enrolled_at, enrollment_status)
  - `sortOrder?: string` - Sort order (asc, desc)
- **Response**: `200 OK`

#### Get Enrollment Analytics
- **Method**: `GET`
- **Path**: `/api/v1/admin/enrollments/analytics`
- **Authorization**: SUPER_ADMIN, TENANT_ADMIN
- **Description**: Get enrollment analytics and metrics
- **Query Parameters**:
  - `dateFrom?: string` - Filter by date range (ISO)
  - `dateTo?: string` - Filter by date range (ISO)
  - `courseId?: number` - Filter by specific course
  - `instituteId?: number` - Filter by institute
- **Response**: `200 OK`
```json
{
  "success": true,
  "data": {
    "overview": {
      "total_enrollments": 1250,
      "active_enrollments": 987,
      "pending_enrollments": 45,
      "completion_rate": 78.5,
      "dropout_rate": 12.3
    },
    "status_distribution": {
      "ACTIVE": 987,
      "COMPLETED": 156,
      "DROPPED": 67,
      "PENDING": 45
    },
    "enrollment_trends": [
      {"date": "2024-01-01", "enrollments": 25},
      {"date": "2024-01-02", "enrollments": 30}
    ],
    "top_courses": [
      {
        "course_id": 123,
        "course_name": "Introduction to Programming",
        "enrollment_count": 156
      }
    ]
  }
}
```

#### Force Update Enrollment
- **Method**: `PATCH`
- **Path**: `/api/v1/admin/enrollments/{enrollmentId}`
- **Authorization**: SUPER_ADMIN, TENANT_ADMIN
- **Description**: Admin override for enrollment status and details
- **Request Body**:
```json
{
  "enrollment_status": "EXPELLED",
  "status_reason": "Violation of academic policy",
  "teacher_id": 456
}
```
- **Response**: `200 OK`

### Institute Management

#### Create Institute
- **Method**: `POST`
- **Path**: `/api/v1/admin/institutes`
- **Authorization**: SUPER_ADMIN, TENANT_ADMIN
- **Description**: Create a new institute within tenant
- **Request Body**:
```json
{
  "institute_name": "Computer Science Department"
}
```
- **Response**: `201 Created`
```json
{
  "success": true,
  "data": {
    "institute_id": 123,
    "institute_name": "Computer Science Department",
    "tenant_id": 456,
    "created_at": "2024-01-15T10:30:00Z",
    "is_active": true,
    "is_deleted": false
  },
  "message": "Institute created successfully"
}
```

#### List Institutes
- **Method**: `GET`
- **Path**: `/api/v1/admin/institutes`
- **Authorization**: SUPER_ADMIN, TENANT_ADMIN, Teacher, Student
- **Description**: Retrieve institutes within tenant
- **Query Parameters**:
  - `search?: string` - Search institute names
  - `page?: number` - Page number (default: 1)
  - `limit?: number` - Items per page (default: 20, max: 100)
- **Response**: `200 OK`

#### Update Institute
- **Method**: `PATCH`
- **Path**: `/api/v1/admin/institutes/{instituteId}`
- **Authorization**: SUPER_ADMIN, TENANT_ADMIN
- **Description**: Update institute details
- **Request Body**:
```json
{
  "institute_name": "Department of Computer Science and Engineering"
}
```
- **Response**: `200 OK`

#### Delete Institute
- **Method**: `DELETE`
- **Path**: `/api/v1/admin/institutes/{instituteId}`
- **Authorization**: SUPER_ADMIN, TENANT_ADMIN
- **Description**: Soft delete institute (only if no active enrollments)
- **Response**: `204 No Content`

### Student-Institute Management

#### Associate Student with Institute
- **Method**: `POST`
- **Path**: `/api/v1/admin/student-institutes`
- **Authorization**: SUPER_ADMIN, TENANT_ADMIN
- **Description**: Associate a student with an institute
- **Request Body**:
```json
{
  "student_id": 123,
  "institute_id": 456
}
```
- **Response**: `201 Created`

#### Get Student Institutes
- **Method**: `GET`
- **Path**: `/api/v1/student/institutes`
- **Authorization**: Student JWT Token
- **Description**: Get institutes associated with authenticated student
- **Response**: `200 OK`

#### Remove Student Institute Association
- **Method**: `DELETE`
- **Path**: `/api/v1/admin/student-institutes/{associationId}`
- **Authorization**: SUPER_ADMIN, TENANT_ADMIN
- **Description**: Remove student-institute association
- **Response**: `204 No Content`

### Progress Tracking

#### Get Course Progress
- **Method**: `GET`
- **Path**: `/api/v1/student/enrollments/{enrollmentId}/progress`
- **Authorization**: Student JWT Token
- **Description**: Get detailed progress for enrolled course
- **Response**: `200 OK`
```json
{
  "success": true,
  "data": {
    "student_course_progress_id": 123,
    "enrollment_id": 789,
    "student_id": 456,
    "course_id": 123,
    "overall_progress_percentage": 75,
    "modules_completed": 8,
    "videos_completed": 25,
    "quizzes_completed": 5,
    "assignments_completed": 3,
    "total_time_spent_minutes": 1800,
    "last_accessed_at": "2024-01-20T14:30:00Z",
    "is_course_completed": false,
    "completion_date": null
  }
}
```

#### Update Progress
- **Method**: `POST`
- **Path**: `/api/v1/student/enrollments/{enrollmentId}/progress`
- **Authorization**: Student JWT Token
- **Description**: Update progress metrics for enrolled course
- **Request Body**:
```json
{
  "overall_progress_percentage": 80,
  "modules_completed": 9,
  "videos_completed": 28,
  "total_time_spent_minutes": 2100
}
```
- **Response**: `200 OK`

## Authorization Rules

### SUPER_ADMIN Permissions
- Can manage all enrollments, institutes, and associations across all tenants
- Can force update enrollment statuses and override business rules
- Can access comprehensive analytics across all tenants
- Global scope operations

### TENANT_ADMIN Permissions
- Can manage enrollments, institutes, and associations within their tenant
- Can approve/reject enrollments and update statuses
- Can access tenant-specific analytics and reports
- Tenant-scoped operations only

### Teacher Permissions
- Can view and manage enrollments for their assigned courses
- Can approve/reject enrollments for their courses
- Can update student enrollment status within their courses
- Cannot access enrollments for other teachers' courses

### Student Permissions
- Can enroll in available courses through institutes
- Can view their own enrollment status and progress
- Can drop from courses (changes status to DROPPED)
- Cannot access other students' enrollment data

## Validation Rules

### Enrollment Validation
- **course_id**: Required, must be valid published course within tenant
- **institute_id**: Required, must be valid institute within tenant
- **teacher_id**: Optional, must be valid teacher assigned to course
- **enrollment_status**: Must be valid EnrollmentStatus enum value

### Institute Validation
- **institute_name**: Required, 2-255 characters, unique within tenant

### Progress Validation
- **overall_progress_percentage**: Required, 0-100 range
- **modules_completed**: Required, non-negative integer
- **videos_completed**: Required, non-negative integer
- **total_time_spent_minutes**: Required, non-negative integer

## Prisma Schema Implementation

### Enrollment Model
```prisma
model Enrollment {
  enrollment_id    Int              @id @default(autoincrement())
  tenant_id        Int
  course_id        Int
  student_id       Int
  institute_id     Int
  teacher_id       Int?
  enrolled_at      DateTime         @default(now())
  enrollment_status EnrollmentStatus @default(PENDING)

  // Enhanced audit fields
  is_active        Boolean          @default(true)
  is_deleted       Boolean          @default(false)
  created_at       DateTime         @default(now())
  updated_at       DateTime         @updatedAt
  created_by       Int
  updated_by       Int?
  deleted_at       DateTime?
  deleted_by       Int?
  created_ip       String?          @db.VarChar(45)
  updated_ip       String?          @db.VarChar(45)

  // Relationships
  tenant           Tenant           @relation(fields: [tenant_id], references: [tenant_id], onDelete: Restrict)
  course           Course           @relation(fields: [course_id], references: [course_id], onDelete: Restrict)
  student          Student          @relation(fields: [student_id], references: [student_id], onDelete: Cascade)
  institute        Institute        @relation(fields: [institute_id], references: [institute_id], onDelete: Restrict)
  teacher          Teacher?         @relation(fields: [teacher_id], references: [teacher_id], onDelete: SetNull)
  status_histories EnrollmentStatusHistory[]
  progress         StudentCourseProgress?
  
  // Audit trail relationships with SystemUser
  created_by_user  SystemUser       @relation("EnrollmentCreatedBy", fields: [created_by], references: [system_user_id], onDelete: Restrict)
  updated_by_user  SystemUser?      @relation("EnrollmentUpdatedBy", fields: [updated_by], references: [system_user_id], onDelete: SetNull)
  deleted_by_user  SystemUser?      @relation("EnrollmentDeletedBy", fields: [deleted_by], references: [system_user_id], onDelete: SetNull)

  @@unique([student_id, course_id, institute_id], name: "uq_student_course_institute")
  @@map("enrollments")
}
```

### StudentCourseProgress Model
```prisma
model StudentCourseProgress {
  student_course_progress_id  Int      @id @default(autoincrement())
  tenant_id                   Int
  enrollment_id               Int      @unique
  student_id                  Int
  course_id                   Int
  overall_progress_percentage Int      @default(0)
  modules_completed           Int      @default(0)
  videos_completed            Int      @default(0)
  quizzes_completed           Int      @default(0)
  assignments_completed       Int      @default(0)
  total_time_spent_minutes    Int      @default(0)
  last_accessed_at            DateTime @default(now())
  is_course_completed         Boolean  @default(false)
  completion_date             DateTime?

  // Enhanced audit fields
  is_active                   Boolean  @default(true)
  is_deleted                  Boolean  @default(false)
  created_at                  DateTime @default(now())
  updated_at                  DateTime @updatedAt
  created_by                  Int
  updated_by                  Int?
  deleted_at                  DateTime?
  deleted_by                  Int?
  created_ip                  String?  @db.VarChar(45)
  updated_ip                  String?  @db.VarChar(45)

  // Relationships
  tenant                      Tenant     @relation(fields: [tenant_id], references: [tenant_id], onDelete: Restrict)
  enrollment                  Enrollment @relation(fields: [enrollment_id], references: [enrollment_id], onDelete: Cascade)
  student                     Student    @relation(fields: [student_id], references: [student_id], onDelete: Cascade)
  course                      Course     @relation(fields: [course_id], references: [course_id], onDelete: Cascade)
  
  // Audit trail relationships with SystemUser
  created_by_user             SystemUser @relation("StudentCourseProgressCreatedBy", fields: [created_by], references: [system_user_id], onDelete: Restrict)
  updated_by_user             SystemUser? @relation("StudentCourseProgressUpdatedBy", fields: [updated_by], references: [system_user_id], onDelete: SetNull)
  deleted_by_user             SystemUser? @relation("StudentCourseProgressDeletedBy", fields: [deleted_by], references: [system_user_id], onDelete: SetNull)

  @@map("student_course_progresses")
}
```

### Institute Model
```prisma
model Institute {
  institute_id     Int      @id @default(autoincrement())
  tenant_id        Int
  institute_name   String   @db.VarChar(255)

  // Enhanced audit fields
  is_active        Boolean  @default(true)
  is_deleted       Boolean  @default(false)
  created_at       DateTime @default(now())
  updated_at       DateTime @updatedAt
  created_by       Int
  updated_by       Int?
  deleted_at       DateTime?
  deleted_by       Int?
  created_ip       String?  @db.VarChar(45)
  updated_ip       String?  @db.VarChar(45)

  // Relationships
  tenant           Tenant            @relation(fields: [tenant_id], references: [tenant_id], onDelete: Restrict)
  enrollments      Enrollment[]
  student_institutes StudentInstitute[]
  
  // Audit trail relationships with SystemUser
  created_by_user  SystemUser        @relation("InstituteCreatedBy", fields: [created_by], references: [system_user_id], onDelete: Restrict)
  updated_by_user  SystemUser?       @relation("InstituteUpdatedBy", fields: [updated_by], references: [system_user_id], onDelete: SetNull)
  deleted_by_user  SystemUser?       @relation("InstituteDeletedBy", fields: [deleted_by], references: [system_user_id], onDelete: SetNull)

  @@unique([tenant_id, institute_name], name: "uq_tenant_institute_name")
  @@map("institutes")
}
```

// ...existing code...

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
    "field": "course_id",
    "reason": "Student already enrolled in this course through this institute"
  }
}
```

### Common Error Scenarios

#### Authorization Errors
- **403 FORBIDDEN**: "Students can only access their own enrollments"
- **403 FORBIDDEN**: "Teachers can only manage enrollments for assigned courses"
- **403 FORBIDDEN**: "Cannot access enrollments from another tenant"

#### Validation Errors
- **409 CONFLICT**: "Student already enrolled in this course through this institute" (errorCode: "DUPLICATE_ENROLLMENT")
- **409 CONFLICT**: "Institute name already exists within tenant" (errorCode: "DUPLICATE_INSTITUTE_NAME")
- **400 BAD_REQUEST**: "Course is not published and available for enrollment"
- **400 BAD_REQUEST**: "Progress percentage must be between 0-100"

#### Not Found Errors
- **404 NOT_FOUND**: "Enrollment with ID {enrollmentId} not found" (errorCode: "ENROLLMENT_NOT_FOUND")
- **404 NOT_FOUND**: "Institute not found" (errorCode: "INSTITUTE_NOT_FOUND")
- **404 NOT_FOUND**: "Course not available for enrollment" (errorCode: "COURSE_NOT_AVAILABLE")

#### Business Logic Errors
- **422 UNPROCESSABLE_ENTITY**: "Cannot delete institute with active enrollments"
- **422 UNPROCESSABLE_ENTITY**: "Enrollment has already been completed"
- **422 UNPROCESSABLE_ENTITY**: "Invalid status transition from COMPLETED to ACTIVE"

## Security Considerations

### Authentication & Authorization
- **JWT-based Authentication**: Required for all endpoints
- **Role-Based Access Control**: SUPER_ADMIN vs TENANT_ADMIN vs Teacher vs Student permissions
- **Tenant Isolation**: Strict enforcement except for SUPER_ADMIN operations
- **Enrollment Ownership**: Students can only manage their own enrollments

### Data Protection
- **Progress Privacy**: Student progress isolated per tenant and user
- **Institute Isolation**: Institute data scoped per tenant
- **Enrollment History**: Complete audit trail of status changes
- **Access Control**: Role-based access to enrollment management functions

### Input Validation and Sanitization
- **Comprehensive Validation**: All fields validated using express-validator
- **SQL Injection Prevention**: Parameterized queries through Prisma ORM
- **XSS Protection**: HTML encoding for all text outputs
- **Business Rule Validation**: Status transition and enrollment prerequisite checks

### Rate Limiting and Abuse Prevention
- **API Rate Limiting**: 1000 requests per hour per tenant
- **Enrollment Operations**: 50 enrollments per hour per student
- **Status Updates**: 100 status updates per hour per teacher
- **Progress Updates**: 500 progress updates per hour per student

### Audit and Monitoring
- **Comprehensive Audit Trail**: All operations logged with user, IP, and timestamp
- **Enrollment Activity Tracking**: Detailed analytics for enrollment patterns
- **Progress Monitoring**: Real-time tracking of student engagement
- **Failed Operations**: Monitoring and alerting for security and business rule violations

### Business Rules Enforcement
- **Enrollment Prerequisites**: Course availability and institute association validation
- **Status Transitions**: Valid enrollment status workflow enforcement
- **Progress Consistency**: Progress metrics validation and consistency checks
- **Institute Management**: Proper cascade handling for institute deletion

## Implementation Patterns

### Service Layer Pattern
```typescript
// Example from enrollment.service.ts
async createEnrollment(
  data: CreateEnrollmentDto,
  requestingUser: TokenPayload,
  ip?: string
): Promise<Enrollment> {
  return tryCatch(async () => {
    // Validate requesting user context
    if (!requestingUser || !requestingUser.user_type) {
      throw new BadRequestError('Invalid requesting user context');
    }
    
    // Authorization checks
    // Duplicate enrollment check
    // Course availability validation
    // Institute association validation
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
    enrollmentId,
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
body('enrollment_status')
  .exists().withMessage('Enrollment status is required')
  .isIn(Object.values(EnrollmentStatus)).withMessage('Invalid enrollment status')
  .custom(async (value, { req }) => {
    const currentEnrollment = await getEnrollmentById(req.params.enrollmentId);
    if (!isValidStatusTransition(currentEnrollment.enrollment_status, value)) {
      throw new Error(`Invalid status transition from ${currentEnrollment.enrollment_status} to ${value}`);
    }
    return true;
  })
```

## Import Strategy

All imports use configured path aliases:

```typescript
// Shared types
import { 
  Enrollment,
  EnrollmentStatusHistory,
  StudentCourseProgress,
  Institute,
  StudentInstitute,
  EnrollmentStatus
} from '@shared/types/student.types';

// Enums
import { 
  EnrollmentStatus
} from '@/types/enums';

// Internal modules
import { CreateEnrollmentDto, UpdateEnrollmentDto } from '@/dtos/enrollment/enrollment.dto';
import { EnrollmentService } from '@/services/enrollment.service';
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

Based on the core entities relationships, the enrollment management domain has the following key foreign key constraints:

- **enrollments.tenant_id** → **tenants.tenant_id** (Required for all enrollments)
- **enrollments.course_id** → **courses.course_id** (Required course reference)
- **enrollments.student_id** → **students.student_id** (Cascade delete)
- **enrollments.institute_id** → **institutes.institute_id** (Required institute reference)
- **enrollments.teacher_id** → **teachers.teacher_id** (Optional teacher assignment)
- **student_course_progresses.enrollment_id** → **enrollments.enrollment_id** (Cascade delete)
- **enrollment_status_histories.enrollment_id** → **enrollments.enrollment_id** (Cascade delete)
- **student_institutes.student_id** → **students.student_id** (Cascade delete)
- **student_institutes.institute_id** → **institutes.institute_id** (Cascade delete)

All entities include comprehensive audit trail relationships where system users can create, update, and delete records with proper foreign key constraints and cascade behaviors.

## Data Constraints and Business Rules

### Unique Constraints
- **student_id + course_id + institute_id**: Student can only enroll once in a course through a specific institute
- **institute_name + tenant_id**: Institute names must be unique within tenant
- **enrollment_id**: Each enrollment must have unique progress record

### Check Constraints
- **institute_name**: 2-255 characters, non-empty after trimming
- **overall_progress_percentage**: 0-100 range for progress tracking
- **modules_completed**: Non-negative integer
- **videos_completed**: Non-negative integer
- **total_time_spent_minutes**: Non-negative integer

### Enrollment Lifecycle Rules
- **Status Transitions**: PENDING → ACTIVE → COMPLETED/DROPPED/SUSPENDED/EXPELLED/TRANSFERRED/DEFERRED
- **Progress Tracking**: Automatic progress record creation upon enrollment approval
- **Institute Association**: Students must be associated with institute before enrollment
- **Course Availability**: Only published courses available for enrollment

### Business Logic Constraints
- **Institute Deletion**: Cannot delete institute with active enrollments
- **Course Enrollment**: Student enrollment limited by course capacity and prerequisites
- **Progress Consistency**: Progress metrics must be consistent with actual course content
- **Status History**: All status changes maintained for audit and reporting