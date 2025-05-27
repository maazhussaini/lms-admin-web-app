# Course Management API Design

## 1. Introduction

The Course Management API provides comprehensive functionality for managing the complete academic structure and content within the Learning Management System (LMS). This API is designed with multi-tenant architecture, ensuring complete data isolation between different educational institutions while maintaining robust security and audit capabilities.

The API handles the entire course lifecycle from program creation to individual video progress tracking, including academic programs, specializations, courses, modules, topics, videos, documents, and student progress monitoring. All operations are performed within the context of a specific tenant, ensuring data security and compliance with educational privacy requirements.

## 2. Data Model Overview

### Core Course Structure Entities

The course management system is built around a hierarchical academic structure:

- **Programs** (`shared/types/course.types.ts`): Top-level academic programs within a tenant
- **Specializations** (`shared/types/course.types.ts`): Academic specializations within programs
- **Courses** (`shared/types/course.types.ts`): Individual courses with comprehensive metadata
- **course_modules** (`shared/types/course.types.ts`): Structural components organizing course content
- **course_topics** (`shared/types/course.types.ts`): Content topics within course modules
- **course_videos** (`shared/types/course.types.ts`): Video content with Bunny.net integration
- **course_documents** (`shared/types/course.types.ts`): Document resources within topics

### Progress Tracking Entities

- **video_progresses** (`shared/types/course.types.ts`): Individual video viewing progress tracking
- **student_course_progresses** (`shared/types/course.types.ts`): Comprehensive course progress tracking

### Key Enums and Status Management

From `course.types.ts`:
- `CourseStatus`: DRAFT (1), PUBLISHED (2), ARCHIVED (3), SUSPENDED (4)
- `VideoUploadStatus`: PENDING (1), PROCESSING (2), COMPLETED (3), FAILED (4), CANCELLED (5)

### Audit and Multi-tenancy

All entities extend `MultiTenantAuditFields` from `base.types.ts`, providing:
- Tenant isolation (`tenant_id`)
- Comprehensive audit trail (`created_at`, `created_by`, `updated_at`, `updated_by`)
- Soft deletion capabilities (`is_active`, `is_deleted`)
- IP tracking for security (`created_ip`, `updated_ip`)

## 3. API Endpoints

### 3.1 Program Management

#### Admin Program Operations

**GET /api/v1/admin/programs**
- Description: Retrieve paginated list of academic programs
- Query Parameters:
  - `page` (number): Page number (default: 1)
  - `limit` (number): Items per page (default: 20, max: 100)
  - `search` (string): Search program names
  - `is_active` (boolean): Filter by active status
- Response: `TApiSuccessResponse<{ programs: Program[], total: number, page: number, limit: number }>`
- Status Code: 200

**GET /api/v1/admin/programs/{program_id}**
- Description: Retrieve detailed program information
- Path Parameters:
  - `program_id` (number): Program identifier
- Response: `TApiSuccessResponse<Program>`
- Status Code: 200

**POST /api/v1/admin/programs**
- Description: Create new academic program
- Request Body:
```typescript
{
  program_name: string;
}
```
- Response: `TApiSuccessResponse<Program>`
- Status Code: 201

**PATCH /api/v1/admin/programs/{program_id}**
- Description: Update program information
- Path Parameters:
  - `program_id` (number): Program identifier
- Request Body:
```typescript
{
  program_name?: string;
  is_active?: boolean;
}
```
- Response: `TApiSuccessResponse<Program>`
- Status Code: 200

**DELETE /api/v1/admin/programs/{program_id}**
- Description: Soft delete program (sets is_deleted = true)
- Path Parameters:
  - `program_id` (number): Program identifier
- Response: `TApiSuccessResponse<{ message: string }>`
- Status Code: 200

### 3.2 Specialization Management

#### Admin Specialization Operations

**GET /api/v1/admin/specializations**
- Description: Retrieve paginated list of specializations
- Query Parameters:
  - `page` (number): Page number (default: 1)
  - `limit` (number): Items per page (default: 20, max: 100)
  - `program_id` (number): Filter by program
  - `search` (string): Search specialization names
  - `is_active` (boolean): Filter by active status
- Response: `TApiSuccessResponse<{ specializations: Specialization[], total: number, page: number, limit: number }>`
- Status Code: 200

**GET /api/v1/admin/programs/{program_id}/specializations**
- Description: Retrieve specializations for specific program
- Path Parameters:
  - `program_id` (number): Program identifier
- Query Parameters:
  - `is_active` (boolean): Filter by active status
- Response: `TApiSuccessResponse<Specialization[]>`
- Status Code: 200

**POST /api/v1/admin/specializations**
- Description: Create new specialization
- Request Body:
```typescript
{
  program_id: number;
  specialization_name: string;
}
```
- Response: `TApiSuccessResponse<Specialization>`
- Status Code: 201

**PATCH /api/v1/admin/specializations/{specialization_id}**
- Description: Update specialization information
- Path Parameters:
  - `specialization_id` (number): Specialization identifier
- Request Body:
```typescript
{
  specialization_name?: string;
  program_id?: number;
  is_active?: boolean;
}
```
- Response: `TApiSuccessResponse<Specialization>`
- Status Code: 200

**DELETE /api/v1/admin/specializations/{specialization_id}**
- Description: Soft delete specialization
- Path Parameters:
  - `specialization_id` (number): Specialization identifier
- Response: `TApiSuccessResponse<{ message: string }>`
- Status Code: 200

### 3.3 Course Management

#### Admin Course Operations

**GET /api/v1/admin/courses**
- Description: Retrieve paginated list of courses with comprehensive filtering
- Query Parameters:
  - `page` (number): Page number (default: 1)
  - `limit` (number): Items per page (default: 20, max: 100)
  - `specialization_id` (number): Filter by specialization
  - `course_status_id` (CourseStatus): Filter by course status
  - `search` (string): Search course names
  - `is_active` (boolean): Filter by active status
- Response: `TApiSuccessResponse<{ courses: Course[], total: number, page: number, limit: number }>`
- Status Code: 200

**GET /api/v1/admin/courses/{course_id}**
- Description: Retrieve detailed course information
- Path Parameters:
  - `course_id` (number): Course identifier
- Response: `TApiSuccessResponse<Course>`
- Status Code: 200

**POST /api/v1/admin/courses**
- Description: Create new course
- Request Body:
```typescript
{
  course_name: string;
  specialization_id?: number;
  main_thumbnail_url?: string;
  course_status_id: CourseStatus;
  course_total_hours?: number;
}
```
- Response: `TApiSuccessResponse<Course>`
- Status Code: 201

**PATCH /api/v1/admin/courses/{course_id}**
- Description: Update course information
- Path Parameters:
  - `course_id` (number): Course identifier
- Request Body:
```typescript
{
  course_name?: string;
  specialization_id?: number;
  main_thumbnail_url?: string;
  course_status_id?: CourseStatus;
  course_total_hours?: number;
  is_active?: boolean;
}
```
- Response: `TApiSuccessResponse<Course>`
- Status Code: 200

**DELETE /api/v1/admin/courses/{course_id}**
- Description: Soft delete course
- Path Parameters:
  - `course_id` (number): Course identifier
- Response: `TApiSuccessResponse<{ message: string }>`
- Status Code: 200

### 3.4 Course Module Management

#### Admin Module Operations

**GET /api/v1/admin/courses/{course_id}/modules**
- Description: Retrieve course modules in order
- Path Parameters:
  - `course_id` (number): Course identifier
- Query Parameters:
  - `is_active` (boolean): Filter by active status
- Response: `TApiSuccessResponse<CourseModule[]>`
- Status Code: 200

**GET /api/v1/admin/modules/{module_id}**
- Description: Retrieve detailed module information
- Path Parameters:
  - `module_id` (number): Module identifier
- Response: `TApiSuccessResponse<CourseModule>`
- Status Code: 200

**POST /api/v1/admin/courses/{course_id}/modules**
- Description: Create new course module
- Path Parameters:
  - `course_id` (number): Course identifier
- Request Body:
```typescript
{
  course_module_name: string;
  position?: number;
}
```
- Response: `TApiSuccessResponse<CourseModule>`
- Status Code: 201

**PATCH /api/v1/admin/modules/{module_id}**
- Description: Update module information
- Path Parameters:
  - `module_id` (number): Module identifier
- Request Body:
```typescript
{
  course_module_name?: string;
  position?: number;
  is_active?: boolean;
}
```
- Response: `TApiSuccessResponse<CourseModule>`
- Status Code: 200

**PATCH /api/v1/admin/modules/reorder**
- Description: Reorder multiple modules within a course
- Request Body:
```typescript
{
  course_id: number;
  module_orders: Array<{
    module_id: number;
    position: number;
  }>;
}
```
- Response: `TApiSuccessResponse<CourseModule[]>`
- Status Code: 200

**DELETE /api/v1/admin/modules/{module_id}**
- Description: Soft delete module
- Path Parameters:
  - `module_id` (number): Module identifier
- Response: `TApiSuccessResponse<{ message: string }>`
- Status Code: 200

### 3.5 Course Topic Management

#### Admin Topic Operations

**GET /api/v1/admin/modules/{module_id}/topics**
- Description: Retrieve course topics within module in order
- Path Parameters:
  - `module_id` (number): Module identifier
- Query Parameters:
  - `is_active` (boolean): Filter by active status
- Response: `TApiSuccessResponse<CourseTopic[]>`
- Status Code: 200

**GET /api/v1/admin/topics/{topic_id}**
- Description: Retrieve detailed topic information
- Path Parameters:
  - `topic_id` (number): Topic identifier
- Response: `TApiSuccessResponse<CourseTopic>`
- Status Code: 200

**POST /api/v1/admin/modules/{module_id}/topics**
- Description: Create new course topic
- Path Parameters:
  - `module_id` (number): Module identifier
- Request Body:
```typescript
{
  course_topic_name: string;
  position?: number;
}
```
- Response: `TApiSuccessResponse<CourseTopic>`
- Status Code: 201

**PATCH /api/v1/admin/topics/{topic_id}**
- Description: Update topic information
- Path Parameters:
  - `topic_id` (number): Topic identifier
- Request Body:
```typescript
{
  course_topic_name?: string;
  position?: number;
  is_active?: boolean;
}
```
- Response: `TApiSuccessResponse<CourseTopic>`
- Status Code: 200

**PATCH /api/v1/admin/topics/reorder**
- Description: Reorder multiple topics within a module
- Request Body:
```typescript
{
  module_id: number;
  topic_orders: Array<{
    topic_id: number;
    position: number;
  }>;
}
```
- Response: `TApiSuccessResponse<CourseTopic[]>`
- Status Code: 200

**DELETE /api/v1/admin/topics/{topic_id}**
- Description: Soft delete topic
- Path Parameters:
  - `topic_id` (number): Topic identifier
- Response: `TApiSuccessResponse<{ message: string }>`
- Status Code: 200

### 3.6 Course Video Management

#### Admin Video Operations

**GET /api/v1/admin/courses/{course_id}/videos**
- Description: Retrieve all videos in a course
- Path Parameters:
  - `course_id` (number): Course identifier
- Query Parameters:
  - `topic_id` (number): Filter by topic
  - `upload_status` (VideoUploadStatus): Filter by upload status
  - `is_active` (boolean): Filter by active status
- Response: `TApiSuccessResponse<CourseVideo[]>`
- Status Code: 200

**GET /api/v1/admin/topics/{topic_id}/videos**
- Description: Retrieve videos within topic in order
- Path Parameters:
  - `topic_id` (number): Topic identifier
- Query Parameters:
  - `upload_status` (VideoUploadStatus): Filter by upload status
  - `is_active` (boolean): Filter by active status
- Response: `TApiSuccessResponse<CourseVideo[]>`
- Status Code: 200

**GET /api/v1/admin/videos/{video_id}**
- Description: Retrieve detailed video information
- Path Parameters:
  - `video_id` (number): Video identifier
- Response: `TApiSuccessResponse<CourseVideo>`
- Status Code: 200

**POST /api/v1/admin/topics/{topic_id}/videos**
- Description: Create new course video
- Path Parameters:
  - `topic_id` (number): Topic identifier
- Request Body:
```typescript
{
  bunny_video_id: string;
  video_name: string;
  video_url: string;
  thumbnail_url?: string;
  duration_seconds?: number;
  position?: number;
  upload_status?: VideoUploadStatus;
}
```
- Response: `TApiSuccessResponse<CourseVideo>`
- Status Code: 201

**PATCH /api/v1/admin/videos/{video_id}**
- Description: Update video information
- Path Parameters:
  - `video_id` (number): Video identifier
- Request Body:
```typescript
{
  video_name?: string;
  video_url?: string;
  thumbnail_url?: string;
  duration_seconds?: number;
  position?: number;
  upload_status?: VideoUploadStatus;
  is_active?: boolean;
}
```
- Response: `TApiSuccessResponse<CourseVideo>`
- Status Code: 200

**PATCH /api/v1/admin/videos/reorder**
- Description: Reorder multiple videos within a topic
- Request Body:
```typescript
{
  topic_id: number;
  video_orders: Array<{
    video_id: number;
    position: number;
  }>;
}
```
- Response: `TApiSuccessResponse<CourseVideo[]>`
- Status Code: 200

**DELETE /api/v1/admin/videos/{video_id}**
- Description: Soft delete video
- Path Parameters:
  - `video_id` (number): Video identifier
- Response: `TApiSuccessResponse<{ message: string }>`
- Status Code: 200

### 3.7 Course Document Management

#### Admin Document Operations

**GET /api/v1/admin/topics/{topic_id}/documents**
- Description: Retrieve documents within topic
- Path Parameters:
  - `topic_id` (number): Topic identifier
- Query Parameters:
  - `is_active` (boolean): Filter by active status
- Response: `TApiSuccessResponse<CourseDocument[]>`
- Status Code: 200

**GET /api/v1/admin/documents/{document_id}**
- Description: Retrieve detailed document information
- Path Parameters:
  - `document_id` (number): Document identifier
- Response: `TApiSuccessResponse<CourseDocument>`
- Status Code: 200

**POST /api/v1/admin/topics/{topic_id}/documents**
- Description: Create new course document
- Path Parameters:
  - `topic_id` (number): Topic identifier
- Request Body:
```typescript
{
  document_name: string;
  document_url: string;
}
```
- Response: `TApiSuccessResponse<CourseDocument>`
- Status Code: 201

**PATCH /api/v1/admin/documents/{document_id}**
- Description: Update document information
- Path Parameters:
  - `document_id` (number): Document identifier
- Request Body:
```typescript
{
  document_name?: string;
  document_url?: string;
  is_active?: boolean;
}
```
- Response: `TApiSuccessResponse<CourseDocument>`
- Status Code: 200

**DELETE /api/v1/admin/documents/{document_id}**
- Description: Soft delete document
- Path Parameters:
  - `document_id` (number): Document identifier
- Response: `TApiSuccessResponse<{ message: string }>`
- Status Code: 200

### 3.8 Student Course Access

#### Student Course Browsing

**GET /api/v1/student/courses**
- Description: Retrieve available courses for authenticated student
- Headers: `Authorization: Bearer <jwt_token>`
- Query Parameters:
  - `specialization_id` (number): Filter by specialization
  - `search` (string): Search course names
  - `page` (number): Page number (default: 1)
  - `limit` (number): Items per page (default: 20, max: 100)
- Response: `TApiSuccessResponse<{ courses: Course[], total: number, page: number, limit: number }>`
- Status Code: 200

**GET /api/v1/student/courses/{course_id}**
- Description: Retrieve detailed course structure for enrolled student
- Headers: `Authorization: Bearer <jwt_token>`
- Path Parameters:
  - `course_id` (number): Course identifier
- Response: `TApiSuccessResponse<Course & { modules: CourseModule[] }>`
- Status Code: 200

**GET /api/v1/student/courses/{course_id}/modules/{module_id}/topics**
- Description: Retrieve topic list within module for enrolled student
- Headers: `Authorization: Bearer <jwt_token>`
- Path Parameters:
  - `course_id` (number): Course identifier
  - `module_id` (number): Module identifier
- Response: `TApiSuccessResponse<CourseTopic[]>`
- Status Code: 200

**GET /api/v1/student/topics/{topic_id}/content**
- Description: Retrieve topic content (videos and documents) for enrolled student
- Headers: `Authorization: Bearer <jwt_token>`
- Path Parameters:
  - `topic_id` (number): Topic identifier
- Response: `TApiSuccessResponse<{ videos: CourseVideo[], documents: CourseDocument[] }>`
- Status Code: 200

### 3.9 Video Progress Tracking

#### Student Video Progress

**GET /api/v1/student/videos/{video_id}/progress**
- Description: Retrieve authenticated student's progress for specific video
- Headers: `Authorization: Bearer <jwt_token>`
- Path Parameters:
  - `video_id` (number): Video identifier
- Response: `TApiSuccessResponse<VideoProgress | null>`
- Status Code: 200

**POST /api/v1/student/videos/{video_id}/progress**
- Description: Create or update video progress for authenticated student
- Headers: `Authorization: Bearer <jwt_token>`
- Path Parameters:
  - `video_id` (number): Video identifier
- Request Body:
```typescript
{
  watch_duration_seconds: number;
  completion_percentage: number;
  is_completed: boolean;
}
```
- Response: `TApiSuccessResponse<VideoProgress>`
- Status Code: 201

**GET /api/v1/student/courses/{course_id}/progress**
- Description: Retrieve authenticated student's overall course progress
- Headers: `Authorization: Bearer <jwt_token>`
- Path Parameters:
  - `course_id` (number): Course identifier
- Response: `TApiSuccessResponse<StudentCourseProgress>`
- Status Code: 200

### 3.10 Course Analytics and Reporting

#### Admin Analytics

**GET /api/v1/admin/courses/{course_id}/analytics/overview**
- Description: Get course analytics overview
- Path Parameters:
  - `course_id` (number): Course identifier
- Response: `TApiSuccessResponse<{ total_students: number, completion_rate: number, average_progress: number, total_videos: number, total_documents: number }>`
- Status Code: 200

**GET /api/v1/admin/courses/{course_id}/analytics/video-performance**
- Description: Get video performance analytics for course
- Path Parameters:
  - `course_id` (number): Course identifier
- Query Parameters:
  - `date_from` (string): Filter by date range
  - `date_to` (string): Filter by date range
- Response: `TApiSuccessResponse<Array<{ video_id: number, video_name: string, avg_completion: number, total_views: number }>>`
- Status Code: 200

**GET /api/v1/admin/courses/{course_id}/analytics/student-progress**
- Description: Get student progress analytics for course
- Path Parameters:
  - `course_id` (number): Course identifier
- Query Parameters:
  - `page` (number): Page number (default: 1)
  - `limit` (number): Items per page (default: 20, max: 100)
- Response: `TApiSuccessResponse<{ progress: StudentCourseProgress[], total: number, page: number, limit: number }>`
- Status Code: 200

### 3.11 Teacher Course Access

#### Teacher Course Management

**GET /api/v1/teacher/courses**
- Description: Retrieve courses assigned to authenticated teacher
- Headers: `Authorization: Bearer <jwt_token>`
- Query Parameters:
  - `course_status_id` (CourseStatus): Filter by course status
  - `page` (number): Page number (default: 1)
  - `limit` (number): Items per page (default: 20, max: 100)
- Response: `TApiSuccessResponse<{ courses: Course[], total: number, page: number, limit: number }>`
- Status Code: 200

**GET /api/v1/teacher/courses/{course_id}/students**
- Description: Retrieve enrolled students for teacher's course
- Headers: `Authorization: Bearer <jwt_token>`
- Path Parameters:
  - `course_id` (number): Course identifier
- Query Parameters:
  - `page` (number): Page number (default: 1)
  - `limit` (number): Items per page (default: 20, max: 100)
- Response: `TApiSuccessResponse<{ students: Array<{ student_id: number, name: string, progress: StudentCourseProgress }>, total: number }>`
- Status Code: 200

## 4. Prisma Schema Considerations

### Database Schema Mapping

#### Academic Structure Tables
```prisma
model Program {
  program_id               Int             @id @default(autoincrement())
  tenant_id               Int
  program_name            String          @db.VarChar(255)
  
  // Audit fields
  is_active               Boolean         @default(true)
  is_deleted              Boolean         @default(false)
  created_at              DateTime        @default(now())
  created_by              Int
  created_ip              String          @db.VarChar(45)
  updated_at              DateTime?       @updatedAt
  updated_by              Int?
  updated_ip              String?         @db.VarChar(45)

  // Relationships
  tenant                  Tenant          @relation(fields: [tenant_id], references: [tenant_id])
  specializations         Specialization[]

  @@unique([program_name, tenant_id], name: "uq_program_name_tenant")
  @@index([tenant_id, is_active, is_deleted], name: "idx_programs_tenant_active")
  @@map("programs")
}

model Specialization {
  specialization_id       Int             @id @default(autoincrement())
  tenant_id               Int
  program_id              Int
  specialization_name     String          @db.VarChar(255)
  
  // Audit fields
  is_active               Boolean         @default(true)
  is_deleted              Boolean         @default(false)
  created_at              DateTime        @default(now())
  created_by              Int
  created_ip              String          @db.VarChar(45)
  updated_at              DateTime?       @updatedAt
  updated_by              Int?
  updated_ip              String?         @db.VarChar(45)

  // Relationships
  tenant                  Tenant          @relation(fields: [tenant_id], references: [tenant_id])
  program                 Program         @relation(fields: [program_id], references: [program_id], onDelete: Cascade)
  courses                 Course[]

  @@unique([specialization_name, program_id], name: "uq_specialization_name_program")
  @@index([program_id, is_active, is_deleted], name: "idx_specializations_program")
  @@map("specializations")
}

model Course {
  course_id               Int             @id @default(autoincrement())
  tenant_id               Int
  course_name             String          @db.VarChar(255)
  main_thumbnail_url      String?         @db.Text
  course_status_id        Int             // 1-4 enum values
  course_total_hours      Decimal?        @db.Decimal(6,2)
  specialization_id       Int?
  
  // Audit fields
  is_active               Boolean         @default(true)
  is_deleted              Boolean         @default(false)
  created_at              DateTime        @default(now())
  created_by              Int
  created_ip              String          @db.VarChar(45)
  updated_at              DateTime?       @updatedAt
  updated_by              Int?
  updated_ip              String?         @db.VarChar(45)

  // Relationships
  tenant                  Tenant          @relation(fields: [tenant_id], references: [tenant_id])
  specialization          Specialization? @relation(fields: [specialization_id], references: [specialization_id], onDelete: SetNull)
  modules                 CourseModule[]
  videos                  CourseVideo[]
  documents               CourseDocument[]
  enrollments             Enrollment[]
  student_progresses      StudentCourseProgress[]

  @@unique([course_name, tenant_id], name: "uq_course_name_tenant")
  @@index([course_status_id, tenant_id, is_active], name: "idx_courses_status_tenant")
  @@index([specialization_id, is_active, is_deleted], name: "idx_courses_specialization")
  @@map("courses")
}

model CourseModule {
  course_module_id        Int             @id @default(autoincrement())
  tenant_id               Int
  course_id               Int
  course_module_name      String          @db.VarChar(255)
  position                Int?
  
  // Audit fields
  is_active               Boolean         @default(true)
  is_deleted              Boolean         @default(false)
  created_at              DateTime        @default(now())
  created_by              Int
  created_ip              String          @db.VarChar(45)
  updated_at              DateTime?       @updatedAt
  updated_by              Int?
  updated_ip              String?         @db.VarChar(45)

  // Relationships
  tenant                  Tenant          @relation(fields: [tenant_id], references: [tenant_id])
  course                  Course          @relation(fields: [course_id], references: [course_id], onDelete: Cascade)
  topics                  CourseTopic[]

  @@unique([course_module_name, course_id], name: "uq_course_module_name_course")
  @@unique([course_id, position], where: { position: { not: null } }, name: "uq_course_module_position_course")
  @@index([course_id, position, is_active], name: "idx_course_modules_course_position")
  @@map("course_modules")
}

model CourseTopic {
  course_topic_id         Int             @id @default(autoincrement())
  tenant_id               Int
  module_id               Int
  course_topic_name       String          @db.VarChar(255)
  position                Int?
  
  // Audit fields
  is_active               Boolean         @default(true)
  is_deleted              Boolean         @default(false)
  created_at              DateTime        @default(now())
  created_by              Int
  created_ip              String          @db.VarChar(45)
  updated_at              DateTime?       @updatedAt
  updated_by              Int?
  updated_ip              String?         @db.VarChar(45)

  // Relationships
  tenant                  Tenant          @relation(fields: [tenant_id], references: [tenant_id])
  module                  CourseModule    @relation(fields: [module_id], references: [course_module_id], onDelete: Cascade)
  videos                  CourseVideo[]
  documents               CourseDocument[]

  @@unique([course_topic_name, module_id], name: "uq_course_topic_name_module")
  @@unique([module_id, position], where: { position: { not: null } }, name: "uq_course_topic_position_module")
  @@index([module_id, position, is_active], name: "idx_course_topics_module_position")
  @@map("course_topics")
}

model CourseVideo {
  course_video_id         Int             @id @default(autoincrement())
  tenant_id               Int
  course_id               Int
  course_topic_id         Int
  bunny_video_id          String          @db.VarChar(255)
  video_name              String          @db.VarChar(255)
  video_url               String          @db.Text
  thumbnail_url           String?         @db.Text
  duration_seconds        Int?
  position                Int?
  upload_status           Int?            // 1-5 enum values
  
  // Audit fields
  is_active               Boolean         @default(true)
  is_deleted              Boolean         @default(false)
  created_at              DateTime        @default(now())
  created_by              Int
  created_ip              String          @db.VarChar(45)
  updated_at              DateTime?       @updatedAt
  updated_by              Int?
  updated_ip              String?         @db.VarChar(45)

  // Relationships
  tenant                  Tenant          @relation(fields: [tenant_id], references: [tenant_id])
  course                  Course          @relation(fields: [course_id], references: [course_id], onDelete: Cascade)
  topic                   CourseTopic     @relation(fields: [course_topic_id], references: [course_topic_id], onDelete: Cascade)
  video_progresses        VideoProgress[]

  @@unique([bunny_video_id], name: "uq_bunny_video_id_global")
  @@unique([video_name, course_topic_id], name: "uq_course_video_name_topic")
  @@unique([course_topic_id, position], where: { position: { not: null } }, name: "uq_course_video_position_topic")
  @@index([course_topic_id, position, is_active], name: "idx_course_videos_topic_position")
  @@index([course_id, upload_status, is_active], name: "idx_course_videos_course")
  @@map("course_videos")
}

model CourseDocument {
  course_document_id      Int             @id @default(autoincrement())
  tenant_id               Int
  course_id               Int
  course_topic_id         Int
  document_name           String          @db.VarChar(255)
  document_url            String          @db.Text
  
  // Audit fields
  is_active               Boolean         @default(true)
  is_deleted              Boolean         @default(false)
  created_at              DateTime        @default(now())
  created_by              Int
  created_ip              String          @db.VarChar(45)
  updated_at              DateTime?       @updatedAt
  updated_by              Int?
  updated_ip              String?         @db.VarChar(45)

  // Relationships
  tenant                  Tenant          @relation(fields: [tenant_id], references: [tenant_id])
  course                  Course          @relation(fields: [course_id], references: [course_id], onDelete: Cascade)
  topic                   CourseTopic     @relation(fields: [course_topic_id], references: [course_topic_id], onDelete: Cascade)

  @@unique([document_name, course_topic_id], name: "uq_course_document_name_topic")
  @@index([course_topic_id, is_active, is_deleted], name: "idx_course_documents_topic")
  @@index([course_id, is_active, is_deleted], name: "idx_course_documents_course")
  @@map("course_documents")
}

model VideoProgress {
  video_progress_id       Int             @id @default(autoincrement())
  tenant_id               Int
  student_id              Int
  course_video_id         Int
  watch_duration_seconds  Int             @default(0)
  completion_percentage   Int             @default(0)
  last_watched_at         DateTime        @default(now())
  is_completed            Boolean         @default(false)
  
  // Audit fields
  is_active               Boolean         @default(true)
  is_deleted              Boolean         @default(false)
  created_at              DateTime        @default(now())
  created_by              Int
  created_ip              String          @db.VarChar(45)
  updated_at              DateTime?       @updatedAt
  updated_by              Int?
  updated_ip              String?         @db.VarChar(45)

  // Relationships
  tenant                  Tenant          @relation(fields: [tenant_id], references: [tenant_id])
  student                 Student         @relation(fields: [student_id], references: [student_id], onDelete: Cascade)
  video                   CourseVideo     @relation(fields: [course_video_id], references: [course_video_id], onDelete: Cascade)

  @@unique([student_id, course_video_id], name: "uq_video_progress_student_video")
  @@index([student_id, is_completed, last_watched_at], name: "idx_video_progresses_student")
  @@index([course_video_id, completion_percentage], name: "idx_video_progresses_video")
  @@map("video_progresses")
}

model StudentCourseProgress {
  student_course_progress_id    Int       @id @default(autoincrement())
  tenant_id                     Int
  student_id                    Int
  course_id                     Int
  overall_progress_percentage   Int       @default(0)
  modules_completed            Int       @default(0)
  videos_completed             Int       @default(0)
  quizzes_completed            Int       @default(0)
  assignments_completed        Int       @default(0)
  total_time_spent_minutes     Int       @default(0)
  last_accessed_at             DateTime  @default(now())
  is_course_completed          Boolean   @default(false)
  completion_date              DateTime?
  
  // Audit fields
  is_active                    Boolean   @default(true)
  is_deleted                   Boolean   @default(false)
  created_at                   DateTime  @default(now())
  created_by                   Int
  created_ip                   String    @db.VarChar(45)
  updated_at                   DateTime? @updatedAt
  updated_by                   Int?
  updated_ip                   String?   @db.VarChar(45)

  // Relationships
  tenant                       Tenant    @relation(fields: [tenant_id], references: [tenant_id])
  student                      Student   @relation(fields: [student_id], references: [student_id], onDelete: Cascade)
  course                       Course    @relation(fields: [course_id], references: [course_id], onDelete: Cascade)

  @@unique([student_id, course_id], name: "uq_student_course_progress_student_course")
  @@index([course_id, is_course_completed, completion_date], name: "idx_student_course_progresses_completion")
  @@index([student_id, last_accessed_at, overall_progress_percentage], name: "idx_student_course_progresses_activity")
  @@map("student_course_progresses")
}
```

### Key Schema Design Decisions

1. **Hierarchical Structure**: Program → Specialization → Course → Module → Topic → Content
2. **Position Management**: Optional positioning with partial unique constraints
3. **Multi-tenant Isolation**: All tables include `tenant_id` with appropriate indexes
4. **Cascade Delete Behavior**: Maintains referential integrity throughout hierarchy
5. **Bunny.net Integration**: Global unique constraint on `bunny_video_id`
6. **Progress Tracking**: Comprehensive student progress with unique constraints
7. **Enum Integration**: Status fields stored as integers with range check constraints
8. **Performance Indexes**: Optimized for common query patterns
9. **Snake Case Naming**: All table and column names use snake_case convention
10. **Audit Trail**: Complete audit information for all entities

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

**Duplicate Course Name (409)**
```json
{
  "statusCode": 409,
  "message": "Course name already exists within tenant",
  "errorCode": "DUPLICATE_COURSE_NAME",
  "details": {
    "constraint": "uq_course_name_tenant",
    "course_name": "Advanced Mathematics",
    "tenant_id": 123
  }
}
```

**Duplicate Bunny Video ID (409)**
```json
{
  "statusCode": 409,
  "message": "Bunny video ID already exists in system",
  "errorCode": "DUPLICATE_BUNNY_VIDEO_ID",
  "details": {
    "constraint": "uq_bunny_video_id_global",
    "bunny_video_id": "abcd1234-efgh-5678",
    "existing_video_id": 789
  }
}
```

**Position Conflict (409)**
```json
{
  "statusCode": 409,
  "message": "Position already exists for another module in this course",
  "errorCode": "DUPLICATE_MODULE_POSITION",
  "details": {
    "constraint": "uq_course_module_position_course",
    "course_id": 456,
    "position": 2,
    "existing_module_id": 789
  }
}
```

#### Business Logic Errors

**Invalid Course Status Transition (422)**
```json
{
  "statusCode": 422,
  "message": "Cannot change course status from ARCHIVED to DRAFT",
  "errorCode": "INVALID_STATUS_TRANSITION",
  "details": {
    "current_status": "ARCHIVED",
    "requested_status": "DRAFT",
    "course_id": 123,
    "valid_transitions": ["PUBLISHED"]
  }
}
```

**Cannot Delete Course with Enrollments (422)**
```json
{
  "statusCode": 422,
  "message": "Cannot delete course with active enrollments",
  "errorCode": "COURSE_HAS_ACTIVE_ENROLLMENTS",
  "details": {
    "course_id": 123,
    "active_enrollments_count": 25,
    "suggested_action": "Archive course instead or transfer enrollments"
  }
}
```

#### Validation Errors

**Invalid Video Duration (400)**
```json
{
  "statusCode": 400,
  "message": "Video duration must be non-negative",
  "errorCode": "INVALID_VIDEO_DURATION",
  "details": {
    "field": "duration_seconds",
    "value": -120,
    "constraint": "chk_course_video_duration_non_negative"
  }
}
```

**Invalid Progress Percentage (400)**
```json
{
  "statusCode": 400,
  "message": "Completion percentage must be between 0 and 100",
  "errorCode": "INVALID_COMPLETION_PERCENTAGE",
  "details": {
    "field": "completion_percentage",
    "value": 150,
    "min": 0,
    "max": 100,
    "constraint": "chk_video_progress_completion_range"
  }
}
```

#### Access Control Errors

**Student Access to Unenrolled Course (403)**
```json
{
  "statusCode": 403,
  "message": "Student is not enrolled in this course",
  "errorCode": "STUDENT_NOT_ENROLLED",
  "details": {
    "student_id": 123,
    "course_id": 456,
    "required_action": "Enroll in course to access content"
  }
}
```

**Teacher Access to Unassigned Course (403)**
```json
{
  "statusCode": 403,
  "message": "Teacher is not assigned to this course",
  "errorCode": "TEACHER_NOT_ASSIGNED",
  "details": {
    "teacher_id": 789,
    "course_id": 456,
    "required_permission": "Course assignment required"
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
- **Admin Role**: Full CRUD access to all course management endpoints
- **Teacher Role**: Limited access to assigned courses and student progress
- **Student Role**: Read-only access to enrolled course content and own progress
- **Tenant Isolation**: All operations automatically filtered by tenant_id

### Data Protection and Privacy

#### Tenant Isolation
- All database queries automatically include tenant_id filtering
- Cross-tenant course data access is strictly prohibited
- API responses never expose course data from other tenants

#### Sensitive Data Handling
- Video URLs contain access tokens for content protection
- Bunny.net integration provides secure video delivery
- Student progress data protected with additional access controls
- IP tracking for all content access and modifications

### Input Validation and Sanitization

#### Comprehensive Validation
- Course names validated for length and special characters
- Video URLs validated for proper format and security
- Position values validated for positive integers
- File upload validation for document attachments
- Progress percentages validated within 0-100 range

#### SQL Injection Prevention
- Parameterized queries through Prisma ORM
- No dynamic SQL construction
- Input sanitization for all user-provided data

#### XSS Protection
- HTML encoding for course descriptions and names
- Content Security Policy headers
- Input sanitization for all text fields

### Video Content Security

#### Bunny.net Integration Security
- Secure video token generation for authenticated access
- DRM protection for premium content
- Geographic restrictions when required
- Watermarking capabilities for content protection
- Secure video upload workflows

#### Access Control
- Video access validated against enrollment status
- Time-based access tokens for video streaming
- IP-based access restrictions when configured
- Secure thumbnail generation and delivery

### Rate Limiting and Abuse Prevention

#### API Rate Limiting
- Global rate limit: 1000 requests per hour per tenant
- Course creation: 20 per hour per admin user
- Video uploads: 50 per hour per admin user
- Progress updates: 500 per hour per student

#### Content Protection
- Video upload size limits enforced
- Maximum course structure depth limits
- Bulk operation limits for performance protection
- Content modification audit trails

### Audit and Monitoring

#### Comprehensive Audit Trail
- All course operations logged with user, IP, and timestamp
- Video access patterns tracked for analytics
- Content modification history preserved
- Failed access attempts logged and monitored

#### Security Monitoring
- Suspicious video access pattern detection
- Bulk operation monitoring and alerting
- Unauthorized content access attempts
- Cross-tenant access attempt logging

#### Compliance Features
- FERPA compliance for student progress records
- Content access audit trails
- Data retention policies for educational content
- Export capabilities for compliance reporting

### Additional Security Measures

#### HTTPS and Encryption
- TLS 1.3 required for all API communications
- Perfect Forward Secrecy (PFS) enabled
- Database connection encryption
- At-rest encryption for video metadata

#### API Security Headers
- CORS policy configuration
- X-Frame-Options: DENY
- X-Content-Type-Options: nosniff
- Strict-Transport-Security headers

#### Business Logic Security
- Course hierarchy validation
- Progress calculation verification
- Video completion threshold validation
- Content access permission verification
- Academic integrity monitoring

### Import Strategy
All type imports use `@shared/types/` path strategy:
```typescript
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
  CourseStatus,
  VideoUploadStatus
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
  Enrollment
} from '@shared/types/student.types';
import { 
  MultiTenantAuditFields 
} from '@shared/types/base.types';
import { 
  TApiSuccessResponse, 
  TApiErrorResponse 
} from '@shared/types/api.types';
```
