# Course Management API Design

## Introduction

The Course Management API provides comprehensive functionality for managing the complete academic structure and content within the Learning Management System (LMS). This API is designed with multi-tenant architecture, ensuring complete data isolation between different educational institutions while maintaining robust security and audit capabilities.

The API handles the entire course lifecycle from program creation to individual video progress tracking, including academic programs, specializations, courses, modules, topics, videos, documents, and student progress monitoring. All operations are performed within the context of a specific tenant, ensuring data security and compliance with educational privacy requirements.

## Data Model Overview

### Core Entities


The Course Management domain consists of the following main entities defined in `@shared/types/course.types.ts`:

- **programs**: Top-level academic programs within a tenant
- **specializations**: Academic specializations that can belong to multiple programs (many-to-many)
- **courses**: Individual courses that can belong to multiple specializations (many-to-many)
- **course_modules**: Structural components organizing course content in hierarchical order
- **course_topics**: Content topics within course modules for granular organization
- **course_videos**: Video content with Bunny.net integration and comprehensive metadata
- **course_documents**: Document resources and supplementary materials within topics
- **video_progresses**: Individual video viewing progress tracking for students
- **student_course_progresses**: Comprehensive course progress tracking and analytics

#### Junction Tables
- **CourseSpecialization**: Junction table for many-to-many between courses and specializations
- **SpecializationProgram**: Junction table for many-to-many between specializations and programs

### Key Enums

From `@/types/enums.types.ts`:

- **VideoUploadStatus**: `PENDING`, `PROCESSING`, `COMPLETED`, `FAILED`, `CANCELLED`
- **CourseStatus**: `DRAFT`, `PUBLISHED`, `ARCHIVED`, `SUSPENDED`

### Base Interfaces

All entities extend `MultiTenantAuditFields` from `@shared/types/base.types.ts`, providing:
- Tenant isolation (`tenant_id`)
- Comprehensive audit trail (`created_at`, `created_by`, `updated_at`, `updated_by`)
- Soft deletion capabilities (`is_active`, `is_deleted`, `deleted_at`, `deleted_by`)
- IP tracking for security (`created_ip`, `updated_ip`)

## API Endpoints

### Program Management

#### Create Program
- **Method**: `POST`
- **Path**: `/api/v1/admin/programs`
- **Authorization**: SUPER_ADMIN, TENANT_ADMIN
- **Description**: Create a new academic program with proper authorization checks
- **Request Body**:
```json
{
  "program_name": "Computer Science"
}
```
- **Response**: `201 Created`
```json
{
  "success": true,
  "data": {
    "program_id": 1,
    "program_name": "Computer Science",
    "tenant_id": 123,
    "created_at": "2024-01-01T00:00:00Z",
    "is_active": true,
    "is_deleted": false
  },
  "message": "Program created successfully"
}
```

#### Get Program by ID
- **Method**: `GET`
- **Path**: `/api/v1/admin/programs/{programId}`
- **Authorization**: SUPER_ADMIN, TENANT_ADMIN
- **Description**: Retrieve a specific program with proper authorization checks
- **Response**: `200 OK`
```json
{
  "success": true,
  "data": {
    "program_id": 1,
    "program_name": "Computer Science",
    "tenant_id": 123,
    "created_at": "2024-01-01T00:00:00Z"
  }
}
```

#### List All Programs
- **Method**: `GET`
- **Path**: `/api/v1/admin/programs`
- **Authorization**: SUPER_ADMIN, TENANT_ADMIN
- **Description**: Retrieve programs with pagination and filtering (tenant-scoped for TENANT_ADMIN)
- **Query Parameters**:
  - `page?: number` - Page number (default: 1)
  - `limit?: number` - Items per page (default: 10, max: 100)
  - `search?: string` - Search in program_name
  - `sortBy?: string` - Sort by field (program_id, program_name, created_at, updated_at)
  - `sortOrder?: string` - Sort order (asc, desc)
- **Response**: `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "program_id": 1,
      "program_name": "Computer Science",
      "tenant_id": 123,
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

#### Update Program
- **Method**: `PATCH`
- **Path**: `/api/v1/admin/programs/{programId}`
- **Authorization**: SUPER_ADMIN, TENANT_ADMIN
- **Description**: Update program with proper authorization and validation
- **Request Body**:
```json
{
  "program_name": "Computer Science Updated"
}
```
- **Response**: `200 OK`

#### Delete Program
- **Method**: `DELETE`
- **Path**: `/api/v1/admin/programs/{programId}`
- **Authorization**: SUPER_ADMIN, TENANT_ADMIN
- **Description**: Soft delete a program
- **Response**: `204 No Content`

### Course Management

#### Create Course
- **Method**: `POST`
- **Path**: `/api/v1/admin/courses`
- **Authorization**: SUPER_ADMIN, TENANT_ADMIN
- **Description**: Create a new course with comprehensive metadata and associate with one or more specializations (many-to-many)
- **Request Body**:
```json
{
  "course_name": "Introduction to Programming",
  "course_description": "A comprehensive introduction to programming concepts and fundamentals using modern programming languages.",
  "main_thumbnail_url": "https://example.com/thumbnail.jpg",
  "course_status": "DRAFT",
  "specialization_ids": [1, 2]
}
```
- **Response**: `201 Created`
```json
{
  "success": true,
  "data": {
    "course_id": 1,
    "course_name": "Introduction to Programming",
    "course_description": "A comprehensive introduction to programming concepts and fundamentals using modern programming languages.",
    "main_thumbnail_url": "https://example.com/thumbnail.jpg",
    "course_status": "DRAFT",
    "course_total_hours": null,
    "specializations": [
      { "specialization_id": 1, "specialization_name": "AI Track" },
      { "specialization_id": 2, "specialization_name": "Robotics Track" }
    ],
    "tenant_id": 123,
    "created_at": "2024-01-01T00:00:00Z",
    "is_active": true,
    "is_deleted": false
  },
  "message": "Course created successfully"
}
```

#### Get Course by ID
- **Method**: `GET`
- **Path**: `/api/v1/admin/courses/{courseId}`
- **Authorization**: SUPER_ADMIN, TENANT_ADMIN
- **Description**: Retrieve detailed course information with modules structure
- **Response**: `200 OK`
```json
{
  "success": true,
  "data": {
    "course_id": 1,
    "course_name": "Introduction to Programming",
    "course_description": "A comprehensive introduction to programming concepts and fundamentals using modern programming languages.",
    "course_status": "PUBLISHED",
    "course_total_hours": 40.5,
    "modules": [
      {
        "course_module_id": 1,
        "course_module_name": "Fundamentals",
        "position": 1
      }
    ]
  }
}
```

#### List All Courses
- **Method**: `GET`
- **Path**: `/api/v1/admin/courses`
- **Authorization**: SUPER_ADMIN, TENANT_ADMIN
- **Description**: Retrieve courses with comprehensive filtering and pagination
- **Query Parameters**:
  - `page?: number` - Page number (default: 1)
  - `limit?: number` - Items per page (default: 10, max: 100)
  - `search?: string` - Search in course_name
  - `status?: CourseStatus` - Filter by course status
  - `specializationId?: number` - Filter by specialization
  - `sortBy?: string` - Sort by field (course_id, course_name, course_status, created_at, updated_at)
  - `sortOrder?: string` - Sort order (asc, desc)
- **Response**: `200 OK`

### Course Module Management

#### Create Course Module
- **Method**: `POST`
- **Path**: `/api/v1/admin/courses/{courseId}/modules`
- **Authorization**: SUPER_ADMIN, TENANT_ADMIN
- **Description**: Create a new course module with position management
- **Request Body**:
```json
{
  "course_module_name": "Advanced Concepts",
  "position": 2
}
```
- **Response**: `201 Created`

#### Get Course Modules
- **Method**: `GET`
- **Path**: `/api/v1/admin/courses/{courseId}/modules`
- **Authorization**: SUPER_ADMIN, TENANT_ADMIN
- **Description**: Retrieve course modules in order with filtering
- **Query Parameters**:
  - `page?: number` - Page number (default: 1)
  - `limit?: number` - Items per page (default: 20, max: 100)
- **Response**: `200 OK`

#### Update Module Position
- **Method**: `PATCH`
- **Path**: `/api/v1/admin/modules/reorder`
- **Authorization**: SUPER_ADMIN, TENANT_ADMIN
- **Description**: Reorder multiple modules within a course
- **Request Body**:
```json
{
  "course_id": 1,
  "modules": [
    {"course_module_id": 1, "position": 2},
    {"course_module_id": 2, "position": 1}
  ]
}
```
- **Response**: `200 OK`

### Course Video Management

#### Create Course Video
- **Method**: `POST`
- **Path**: `/api/v1/admin/topics/{topicId}/videos`
- **Authorization**: SUPER_ADMIN, TENANT_ADMIN
- **Description**: Create new course video with Bunny.net integration
- **Request Body**:
```json
{
  "bunny_video_id": "abc123-def456-ghi789",
  "video_name": "Introduction to Variables",
  "video_url": "https://video.bunnycdn.com/play/abc123/playlist.m3u8",
  "thumbnail_url": "https://video.bunnycdn.com/abc123/thumbnail.jpg",
  "duration_seconds": 1800,
  "position": 1,
  "upload_status": "COMPLETED"
}
```
- **Response**: `201 Created`

#### Get Video Progress
- **Method**: `GET`
- **Path**: `/api/v1/student/videos/{videoId}/progress`
- **Authorization**: Student JWT Token
- **Description**: Retrieve authenticated student's progress for specific video
- **Response**: `200 OK`
```json
{
  "success": true,
  "data": {
    "video_progress_id": 1,
    "student_id": 123,
    "course_video_id": 456,
    "watch_duration_seconds": 900,
    "completion_percentage": 50,
    "last_watched_at": "2024-01-01T12:00:00Z",
    "is_completed": false
  }
}
```

#### Update Video Progress
- **Method**: `POST`
- **Path**: `/api/v1/student/videos/{videoId}/progress`
- **Authorization**: Student JWT Token
- **Description**: Create or update video progress for authenticated student
- **Request Body**:
```json
{
  "watch_duration_seconds": 1200,
  "completion_percentage": 67,
  "is_completed": false
}
```
- **Response**: `201 Created`

### Student Course Access

#### Get Available Courses
- **Method**: `GET`
- **Path**: `/api/v1/student/courses`
- **Authorization**: Student JWT Token
- **Description**: Retrieve available courses for authenticated student
- **Query Parameters**:
  - `page?: number` - Page number (default: 1)
  - `limit?: number` - Items per page (default: 20, max: 100)
  - `specializationId?: number` - Filter by specialization
- **Response**: `200 OK`

#### Get Course Content
- **Method**: `GET`
- **Path**: `/api/v1/student/courses/{courseId}`
- **Authorization**: Student JWT Token
- **Description**: Retrieve detailed course structure for enrolled student
- **Response**: `200 OK`

#### Get Course Progress
- **Method**: `GET`
- **Path**: `/api/v1/student/courses/{courseId}/progress`
- **Authorization**: Student JWT Token
- **Description**: Retrieve authenticated student's overall course progress
- **Response**: `200 OK`
```json
{
  "success": true,
  "data": {
    "student_course_progress_id": 1,
    "student_id": 123,
    "course_id": 456,
    "overall_progress_percentage": 75,
    "modules_completed": 3,
    "videos_completed": 15,
    "quizzes_completed": 2,
    "assignments_completed": 1,
    "total_time_spent_minutes": 1200,
    "last_accessed_at": "2024-01-01T12:00:00Z",
    "is_course_completed": false
  }
}
```

### Teacher Course Access

#### Get Assigned Courses
- **Method**: `GET`
- **Path**: `/api/v1/teacher/courses`
- **Authorization**: Teacher JWT Token
- **Description**: Retrieve courses assigned to authenticated teacher
- **Query Parameters**:
  - `page?: number` - Page number (default: 1)
  - `limit?: number` - Items per page (default: 20, max: 100)
  - `status?: CourseStatus` - Filter by course status
- **Response**: `200 OK`

#### Get Course Students
- **Method**: `GET`
- **Path**: `/api/v1/teacher/courses/{courseId}/students`
- **Authorization**: Teacher JWT Token
- **Description**: Retrieve enrolled students for teacher's course
- **Response**: `200 OK`

### Course Analytics

#### Get Course Overview
- **Method**: `GET`
- **Path**: `/api/v1/admin/courses/{courseId}/analytics/overview`
- **Authorization**: SUPER_ADMIN, TENANT_ADMIN
- **Description**: Get course analytics overview with key metrics
- **Response**: `200 OK`
```json
{
  "success": true,
  "data": {
    "total_students": 150,
    "completion_rate": 68.5,
    "average_progress": 72.3,
    "total_videos": 25,
    "total_documents": 8,
    "average_time_spent_hours": 28.5
  }
}
```

#### Get Video Performance
- **Method**: `GET`
- **Path**: `/api/v1/admin/courses/{courseId}/analytics/video-performance`
- **Authorization**: SUPER_ADMIN, TENANT_ADMIN
- **Description**: Get video performance analytics for course
- **Query Parameters**:
  - `dateFrom?: string` - Filter by date range (ISO format)
  - `dateTo?: string` - Filter by date range (ISO format)
- **Response**: `200 OK`

#### Get Student Progress Analytics
- **Method**: `GET`
- **Path**: `/api/v1/admin/courses/{courseId}/analytics/student-progress`
- **Authorization**: SUPER_ADMIN, TENANT_ADMIN
- **Description**: Get student progress analytics for course
- **Query Parameters**:
  - `page?: number` - Page number (default: 1)
  - `limit?: number` - Items per page (default: 10, max: 100)
- **Response**: `200 OK`

## Authorization Rules

### SUPER_ADMIN Permissions
- Can create, read, update, and delete any course content across all tenants
- Can manage course structure, videos, and documents
- Can access analytics and progress data across all tenants
- Global scope operations

### TENANT_ADMIN Permissions
- Can only manage courses within their own tenant
- Can create, read, update, and delete courses and content
- Can access tenant-specific analytics and progress data
- Tenant-scoped operations only

### Teacher Permissions
- Can read assigned courses and their content structure
- Can view student progress for assigned courses
- Cannot modify course content or structure
- Can access course-specific analytics for assigned courses

### Student Permissions
- Can read enrolled course content and structure
- Can update their own video progress and course progress
- Cannot modify course content or access other students' data
- Can only access courses they are enrolled in

## Validation Rules

### Program Validation
- **program_name**: Required, 2-255 characters, string type

### Course Validation
- **course_name**: Required, 2-255 characters, string type
- **course_description**: Optional, max 2000 characters, string type
- **course_status**: Must be valid CourseStatus enum value
- **course_total_hours**: Read-only field, auto-calculated by backend from sum of video durations in course
- **main_thumbnail_url**: Optional, valid URL format
- **specialization_ids**: Optional, must be an array of valid specialization IDs within tenant

### Module Validation
- **course_module_name**: Required, 2-255 characters, string type
- **position**: Optional, positive integer for ordering

### Video Validation
- **bunny_video_id**: Required, 10-255 characters, unique globally
- **video_name**: Required, 2-255 characters, string type
- **video_url**: Required, valid URL format for video playback
- **duration_seconds**: Optional, positive integer
- **upload_status**: Must be valid VideoUploadStatus enum value

### Progress Validation
- **watch_duration_seconds**: Required, non-negative integer
- **completion_percentage**: Required, 0-100 range
- **is_completed**: Required, boolean value

## Prisma Schema Implementation

### Course Model
```prisma
model Course {
  course_id            Int       @id @default(autoincrement())
  tenant_id            Int
  course_name          String    @db.VarChar(255)
  course_description   String?   @db.Text
  main_thumbnail_url   String?   @db.Text
  course_status        CourseStatus @default(DRAFT)
  course_total_hours   Decimal?  @db.Decimal(6, 2) // Auto-calculated by backend from sum of video durations
  specialization_id    Int?
  
  // Enhanced audit fields
  is_active            Boolean   @default(true)
  is_deleted           Boolean   @default(false)
  created_at           DateTime  @default(now())
  updated_at           DateTime  @updatedAt
  created_by           Int
  updated_by           Int?
  deleted_at           DateTime?
  deleted_by           Int?
  created_ip           String?   @db.VarChar(45)
  updated_ip           String?   @db.VarChar(45)

  // Relationships
  tenant               Tenant    @relation(fields: [tenant_id], references: [tenant_id], onDelete: Restrict)
  specialization       Specialization? @relation(fields: [specialization_id], references: [specialization_id], onDelete: SetNull)
  modules              CourseModule[]
  videos               CourseVideo[]
  documents            CourseDocument[]
  enrollments          Enrollment[]
  student_progresses   StudentCourseProgress[]
  teacher_courses      TeacherCourse[]
  
  // Audit trail relationships with SystemUser
  created_by_user      SystemUser   @relation("CourseCreatedBy", fields: [created_by], references: [system_user_id], onDelete: Restrict)
  updated_by_user      SystemUser?  @relation("CourseUpdatedBy", fields: [updated_by], references: [system_user_id], onDelete: SetNull)
  deleted_by_user      SystemUser?  @relation("CourseDeletedBy", fields: [deleted_by], references: [system_user_id], onDelete: SetNull)

  @@map("courses")
}
```

### CourseVideo Model
```prisma
model CourseVideo {
  course_video_id      Int       @id @default(autoincrement())
  tenant_id            Int
  course_id            Int
  course_topic_id      Int
  bunny_video_id       String    @db.VarChar(255)
  video_name           String    @db.VarChar(255)
  video_url            String    @db.Text
  thumbnail_url        String?   @db.Text
  duration_seconds     Int?
  position             Int?
  upload_status        VideoUploadStatus? @default(PENDING)
  
  // Enhanced audit fields
  is_active            Boolean   @default(true)
  is_deleted           Boolean   @default(false)
  created_at           DateTime  @default(now())
  updated_at           DateTime  @updatedAt
  created_by           Int
  updated_by           Int?
  deleted_at           DateTime?
  deleted_by           Int?
  created_ip           String?   @db.VarChar(45)
  updated_ip           String?   @db.VarChar(45)

  // Relationships
  tenant               Tenant    @relation(fields: [tenant_id], references: [tenant_id], onDelete: Restrict)
  course               Course    @relation(fields: [course_id], references: [course_id], onDelete: Cascade)
  topic                CourseTopic @relation(fields: [course_topic_id], references: [course_topic_id], onDelete: Cascade)
  video_progresses     VideoProgress[]
  
  // Audit trail relationships with SystemUser
  created_by_user      SystemUser   @relation("CourseVideoCreatedBy", fields: [created_by], references: [system_user_id], onDelete: Restrict)
  updated_by_user      SystemUser?  @relation("CourseVideoUpdatedBy", fields: [updated_by], references: [system_user_id], onDelete: SetNull)
  deleted_by_user      SystemUser?  @relation("CourseVideoDeletedBy", fields: [deleted_by], references: [system_user_id], onDelete: SetNull)

  @@map("course_videos")
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
    "field": "course_name",
    "reason": "Course name already exists within tenant"
  }
}
```

### Common Error Scenarios

#### Authorization Errors
- **403 FORBIDDEN**: "You can only manage courses within your own tenant"
- **403 FORBIDDEN**: "Students can only access enrolled courses"
- **403 FORBIDDEN**: "Teachers can only access assigned courses"

#### Validation Errors
- **409 CONFLICT**: "Course with this name already exists within tenant" (errorCode: "DUPLICATE_COURSE_NAME")
- **409 CONFLICT**: "Bunny video ID already exists" (errorCode: "DUPLICATE_BUNNY_VIDEO_ID")
- **409 CONFLICT**: "Module position conflict in course" (errorCode: "MODULE_POSITION_CONFLICT")
- **400 BAD_REQUEST**: "Invalid video duration format"
- **400 BAD_REQUEST**: "Progress percentage must be between 0-100"

#### Not Found Errors
- **404 NOT_FOUND**: "Course with ID {courseId} not found" (errorCode: "COURSE_NOT_FOUND")
- **404 NOT_FOUND**: "Video not found for this student" (errorCode: "VIDEO_NOT_FOUND")
- **404 NOT_FOUND**: "Course module not found" (errorCode: "MODULE_NOT_FOUND")

#### Business Logic Errors
- **422 UNPROCESSABLE_ENTITY**: "Cannot delete course with active enrollments"
- **422 UNPROCESSABLE_ENTITY**: "Cannot change course status from PUBLISHED to DRAFT"
- **422 UNPROCESSABLE_ENTITY**: "Student not enrolled in this course"

## Security Considerations

### Authentication & Authorization
- **JWT-based Authentication**: Required for all endpoints
- **Role-Based Access Control**: SUPER_ADMIN vs TENANT_ADMIN vs Teacher vs Student permissions
- **Tenant Isolation**: Strict enforcement except for SUPER_ADMIN operations
- **Enrollment Validation**: Students can only access enrolled course content

### Data Protection
- **Video Content Security**: Bunny.net integration with secure video tokens
- **Progress Data Privacy**: Student progress isolated per tenant and user
- **Course Content Protection**: DRM and watermarking capabilities
- **Secure Video Delivery**: Time-based access tokens and geographic restrictions

### Input Validation and Sanitization
- **Comprehensive Validation**: All fields validated using express-validator
- **SQL Injection Prevention**: Parameterized queries through Prisma ORM
- **XSS Protection**: HTML encoding for all text outputs
- **File Upload Security**: Video and document URL validation

### Rate Limiting and Abuse Prevention
- **API Rate Limiting**: 1000 requests per hour per tenant
- **Video Upload**: 50 uploads per hour per admin user
- **Progress Updates**: 500 progress updates per hour per student
- **Content Access**: Rate limiting for video streaming requests

### Audit and Monitoring
- **Comprehensive Audit Trail**: All operations logged with user, IP, and timestamp
- **Video Access Tracking**: Detailed analytics for content consumption
- **Progress Monitoring**: Real-time tracking of student engagement
- **Failed Access Attempts**: Monitoring and alerting for security

### Business Rules Enforcement
- **Course Hierarchy Validation**: Program → Specialization → Course → Module → Topic structure
- **Video Completion Logic**: Progress calculation and completion threshold validation
- **Enrollment Prerequisites**: Course access based on enrollment status
- **Content Availability**: Published status requirements for student access
- **Course Duration Calculation**: Total hours automatically calculated from sum of video durations when videos are uploaded

## Implementation Patterns

### Service Layer Pattern
```typescript
// Example from course.service.ts
async createCourse(
  data: CreateCourseDto,
  requestingUser: TokenPayload,
  ip?: string
): Promise<Course> {
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
    courseId,
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
body('course_status')
  .exists().withMessage('Course status is required')
  .isIn(Object.values(CourseStatus)).withMessage('Course status must be a valid CourseStatus')
  .custom(async (value, { req }) => {
    const currentCourse = await getCourseById(req.params.courseId);
    if (!isValidStatusTransition(currentCourse.course_status, value)) {
      throw new Error(`Invalid status transition from ${currentCourse.course_status} to ${value}`);
    }
    return true;
  })
```

## Import Strategy

All imports use configured path aliases:

```typescript
// Shared types
import { 
  Program,
  Specialization,
  Course,
  CourseModule,
  CourseTopic,
  CourseVideo,
  CourseDocument,
  VideoProgress,
  StudentCourseProgress,
  VideoUploadStatus,
  CourseStatus
} from '@shared/types/course.types';

// Enums
import { 
  VideoUploadStatus,
  CourseStatus
} from '@/types/enums';

// Internal modules
import { CreateCourseDto, UpdateCourseDto } from '@/dtos/course/course.dto';
import { CourseService } from '@/services/course.service';
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

Based on the core entities relationships, the course management domain has the following key foreign key constraints:

- **courses.tenant_id** → **tenants.tenant_id** (Required for all courses)
- **CourseSpecialization**: Many-to-many between courses and specializations
- **SpecializationProgram**: Many-to-many between specializations and programs
- **course_modules.course_id** → **courses.course_id** (Cascade delete)
- **course_topics.module_id** → **course_modules.course_module_id** (Cascade delete)
- **course_videos.course_id** → **courses.course_id** (Cascade delete)
- **course_videos.course_topic_id** → **course_topics.course_topic_id** (Cascade delete)
- **video_progresses.student_id** → **students.student_id** (Restrict delete)
- **video_progresses.course_video_id** → **course_videos.course_video_id** (Cascade delete)
- **student_course_progresses.student_id** → **students.student_id** (Restrict delete)
- **student_course_progresses.course_id** → **courses.course_id** (Cascade delete)

All entities include comprehensive audit trail relationships where system users can create, update, and delete records with proper foreign key constraints and cascade behaviors.

## Data Constraints and Business Rules

### Unique Constraints
- **bunny_video_id**: Must be unique globally across all tenants
- **course_name + tenant_id**: Course names must be unique per tenant
- **program_name + tenant_id**: Program names must be unique per tenant
- **student_id + course_video_id**: Video progress must be unique per student per video

### Check Constraints
- **course_name**: 2-255 characters, non-empty after trimming
- **video_name**: 2-255 characters, non-empty after trimming
- **duration_seconds**: Non-negative integer when provided
- **completion_percentage**: 0-100 range for progress tracking
- **position**: Positive integer for content ordering

### Hierarchical Integrity Rules
- **Course Hierarchy**: Program → Specialization → Course → Module → Topic → Content
- **Position Management**: Sequential positioning within parent containers
- **Content Dependencies**: Topics require modules, videos require topics
- **Enrollment Requirements**: Student access requires active enrollment

### Video Content Rules
- **Bunny.net Integration**: Global unique constraint on bunny_video_id
- **Upload Status Workflow**: PENDING → PROCESSING → COMPLETED/FAILED
- **Progress Calculation**: Watch duration vs video duration for completion
- **Access Control**: Video availability based on course publication status
