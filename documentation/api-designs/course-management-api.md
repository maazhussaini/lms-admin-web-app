# Course Management API Design

## Introduction

The Course Management API provides comprehensive functionality for managing the complete academic structure and content within the Learning Management System (LMS). This API is designed with multi-tenant architecture, ensuring complete data isolation between different educational institutions while maintaining robust security and audit capabilities.

The API handles the entire course lifecycle from program creation to individual video progress tracking, including academic programs, specializations, courses, modules, topics, videos, documents, and student progress monitoring. All operations are performed within the context of a specific tenant, ensuring data security and compliance with educational privacy requirements.

The API includes specialized endpoints for course discovery, allowing students and anonymous users to browse available courses filtered by programs, specializations, and course types, with dynamic purchase status calculation based on enrollment data.

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

#### Get Programs by Tenant
- **Method**: `GET`
- **Path**: `/api/v1/programs/tenant/list`
- **Authorization**: Required (Any authenticated user)
- **Description**: Retrieve all active programs for the authenticated user's tenant. This endpoint automatically filters programs based on the tenant ID from the JWT token, ensuring users only see programs from their own institution.
- **Source**: Converted from PostgreSQL function `get_programs_by_tenant`
- **Authentication**: Uses JWT token to determine tenant ID automatically
- **Query Parameters**: None required (tenant filtering is automatic)
- **Response**: `200 OK`
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Programs retrieved successfully",
  "data": [
    {
      "program_id": 1,
      "program_name": "Computer Science",
      "program_thumbnail_url": "https://cdn.example.com/thumbnails/cs.jpg",
      "tenant_id": 123,
      "is_active": true,
      "is_deleted": false,
      "created_at": "2024-01-15T10:00:00Z",
      "updated_at": "2024-01-15T10:00:00Z"
    },
    {
      "program_id": 2,
      "program_name": "Business Administration",
      "program_thumbnail_url": "https://cdn.example.com/thumbnails/ba.jpg",
      "tenant_id": 123,
      "is_active": true,
      "is_deleted": false,
      "created_at": "2024-01-10T08:30:00Z",
      "updated_at": "2024-01-12T14:20:00Z"
    }
  ],
  "timestamp": "2024-01-15T10:00:00Z"
}
```

**Key Features:**
- **Automatic Tenant Filtering**: Uses JWT token to identify user's tenant
- **Active Programs Only**: Returns only programs where `is_active = true` and `is_deleted = false`
- **Complete Metadata**: Includes program details, thumbnails, and audit information
- **No Additional Parameters**: Simplifies frontend implementation by handling tenant filtering automatically
- **Security**: Users can only access programs from their own tenant

**Usage Examples:**
```bash
# Get all programs for the authenticated user's tenant
GET /api/v1/programs/tenant/list
Authorization: Bearer <jwt_token>
```

**Error Responses:**
- `401 Unauthorized`: When no valid JWT token is provided
- `403 Forbidden`: When user doesn't have permission to access programs
- `500 Internal Server Error`: For server-side errors

### Specialization Management

#### Get Active Specializations by Program
- **Method**: `GET`
- **Path**: `/api/v1/admin/specializations/by-program`
- **Authorization**: SUPER_ADMIN, TENANT_ADMIN, TEACHER
- **Description**: Retrieve active specializations for a specific program within the authenticated user's tenant. This endpoint replicates the functionality of the PostgreSQL function `get_active_specializations_by_program`.
- **Query Parameters**:
  - `program_id: number` - Required. The program ID to filter specializations
- **Response**: `200 OK`
```json
{
  "success": true,
  "message": "Active specializations retrieved successfully",
  "data": [
    {
      "specialization_id": 1,
      "program_id": 2,
      "specialization_name": "Artificial Intelligence",
      "specialization_thumbnail_url": "https://example.com/ai-thumb.jpg"
    },
    {
      "specialization_id": 3,
      "program_id": 2,
      "specialization_name": "Machine Learning",
      "specialization_thumbnail_url": "https://example.com/ml-thumb.jpg"
    }
  ]
}
```

**Key Features**:
- **Tenant Isolation**: Automatically filters results based on authenticated user's tenant
- **Program Filtering**: Returns only specializations associated with the specified program
- **Active Records Only**: Filters for active, non-deleted specializations
- **Sorted Results**: Returns specializations ordered alphabetically by name
- **Junction Table Handling**: Properly handles the many-to-many relationship through SpecializationProgram table

**Usage Examples**:
```bash
# Get all active specializations for program ID 2
GET /api/v1/admin/specializations/by-program?program_id=2

# Error if program_id is missing
GET /api/v1/admin/specializations/by-program
# Returns: 400 Bad Request - "Program ID is required"
```

**Error Responses**:
- `400 Bad Request`: Missing or invalid program_id parameter
- `401 Unauthorized`: Authentication required
- `403 Forbidden`: Insufficient permissions for the endpoint
- `404 Not Found`: Program not found or no specializations available

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

#### Get Courses by Programs and Specialization
- **Method**: `GET`
- **Path**: `/api/v1/courses/by-programs-specialization`
- **Authorization**: Public (No authentication required)
- **Description**: Retrieve courses filtered by programs and specializations with purchase status information. This endpoint supports course discovery for students and anonymous users.
- **Query Parameters**:
  - `course_type?: string` - Filter by course type ('FREE', 'PAID', 'PURCHASED')
  - `program_id?: number` - Filter by program ID (-1 for all programs)
  - `specialization_id?: number` - Filter by specialization ID (-1 for all specializations)
  - `search_query?: string` - Search query for course names (case-insensitive)
  - `student_id?: number` - Student ID for purchase status calculation
- **Response**: `200 OK`
```json
{
  "success": true,
  "message": "Courses retrieved successfully",
  "data": [
    {
      "course_id": 1,
      "course_name": "Introduction to Programming",
      "start_date": "2024-02-01T00:00:00.000Z",
      "end_date": "2024-05-01T00:00:00.000Z",
      "program_name": "Computer Science",
      "teacher_name": "Dr. John Smith",
      "course_total_hours": 120.50,
      "profile_picture_url": "https://example.com/teacher1.jpg",
      "teacher_qualification": "PhD in Computer Science",
      "program_id": 1,
      "purchase_status": "Buy: $299.99"
    },
    {
      "course_id": 2,
      "course_name": "Advanced Mathematics",
      "start_date": "2024-03-01T00:00:00.000Z",
      "end_date": "2024-06-01T00:00:00.000Z",
      "program_name": "Mathematics",
      "teacher_name": "Prof. Jane Doe",
      "course_total_hours": 80.0,
      "profile_picture_url": "https://example.com/teacher2.jpg",
      "teacher_qualification": "PhD in Mathematics",
      "program_id": 2,
      "purchase_status": "Free"
    }
  ]
}
```

**Purchase Status Values**:
- `"Free"` - Course is free and not purchased
- `"Buy: $X.XX"` - Course is paid and not purchased (shows price)
- `"Purchased"` - Course is purchased by the student
- `"N/A"` - Status cannot be determined

**Usage Examples**:
```bash
# Get all free courses
GET /api/v1/courses/by-programs-specialization?course_type=FREE

# Get courses for specific program
GET /api/v1/courses/by-programs-specialization?program_id=1

# Search courses with purchase status for student
GET /api/v1/courses/by-programs-specialization?search_query=programming&student_id=123

# Get purchased courses for student
GET /api/v1/courses/by-programs-specialization?course_type=PURCHASED&student_id=123
```

#### Get Course Basic Details
- **Method**: `GET`
- **Path**: `/api/v1/courses/{courseId}/basic-details`
- **Authorization**: Public (authentication optional for enhanced features)
- **Description**: Retrieve basic details for a specific course including progress information if student ID is provided
- **Path Parameters**:
  - `courseId` (required): Course identifier
- **Query Parameters**:
  - `student_id` (optional): Student identifier for enrollment and progress data
- **Response**: `200 OK`
```json
{
  "success": true,
  "data": {
    "course_id": 123,
    "course_name": "Advanced Web Development",
    "course_description": "Comprehensive course covering modern web development technologies...",
    "overall_progress_percentage": 75,
    "teacher_name": "Dr. Jane Smith",
    "start_date": "2024-01-15T09:00:00Z",
    "end_date": "2024-05-15T17:00:00Z",
    "purchase_status": "PURCHASED",
    "program_name": "Computer Science",
    "specialization_name": "Full Stack Development"
  },
  "message": "Course basic details retrieved successfully"
}
```
- **Use Cases**:
  - **Course Overview**: Get comprehensive course information for display
  - **Student Progress**: Track individual student progress when student_id is provided
  - **Enrollment Status**: Check if student is enrolled and course purchase status
  - **Academic Context**: Display program and specialization information
- **Business Rules**:
  - Course must be active and not deleted
  - If student_id is provided, enrollment and progress data is included
  - Purchase status shows "PURCHASED" if student is enrolled, otherwise shows course type
  - Teacher information comes from the first assigned teacher
  - Session dates represent the earliest scheduled course session
  - Progress percentage is null if student is not enrolled or has no progress

#### Get Course Modules
- **Method**: `GET`
- **Path**: `/api/v1/courses/{courseId}/modules`
- **Authorization**: Public (authentication optional for enhanced features)
- **Description**: Retrieve modules list for a specific course with comprehensive statistics including topic and video counts
- **Path Parameters**:
  - `courseId` (required): Course identifier
- **Query Parameters**:
  - `student_id` (optional): Student identifier for progress tracking and enrollment context
- **Response**: `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "course_module_id": 1,
      "course_module_name": "Introduction to Programming",
      "position": 1,
      "is_active": true,
      "total_topics": 5,
      "total_videos": 12,
      "created_at": "2024-01-15T09:00:00Z",
      "updated_at": "2024-01-20T14:30:00Z"
    },
    {
      "course_module_id": 2,
      "course_module_name": "Advanced Concepts",
      "position": 2,
      "is_active": true,
      "total_topics": 8,
      "total_videos": 18,
      "created_at": "2024-01-16T10:00:00Z",
      "updated_at": "2024-01-22T16:45:00Z"
    }
  ],
  "message": "Course modules retrieved successfully"
}
```
- **Use Cases**:
  - **Course Structure**: Display course organization and module hierarchy
  - **Content Statistics**: Show total topics and videos per module for course overview
  - **Navigation**: Provide module-based navigation for course content
  - **Progress Tracking**: Module-level progress context when student_id is provided
- **Business Rules**:
  - Course must be active and not deleted
  - Only active modules are returned in the response
  - Modules are ordered by position field in ascending order
  - Statistics include only active topics and videos
  - Total counts help students understand course scope and depth
  - Student ID context enables future progress tracking enhancements

#### Get Course Topics by Module
- **Method**: `GET`
- **Path**: `/api/v1/modules/{moduleId}/topics`
- **Authorization**: Public (authentication optional for enhanced features)
- **Description**: Retrieve topics list for a specific module with comprehensive video lecture statistics
- **Path Parameters**:
  - `moduleId` (required): Module identifier
- **Response**: `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "course_topic_id": 1,
      "course_topic_name": "Introduction to Variables",
      "overall_video_lectures": "5 Video Lectures",
      "position": 1,
      "is_active": true,
      "created_at": "2024-01-15T09:00:00Z",
      "updated_at": "2024-01-20T14:30:00Z"
    },
    {
      "course_topic_id": 2,
      "course_topic_name": "Data Types and Operations",
      "overall_video_lectures": "7 Video Lectures",
      "position": 2,
      "is_active": true,
      "created_at": "2024-01-16T10:00:00Z",
      "updated_at": "2024-01-22T16:45:00Z"
    }
  ],
  "message": "Course topics retrieved successfully"
}
```
- **Use Cases**:
  - **Module Content Display**: Show detailed topic structure within a module
  - **Learning Path Navigation**: Provide topic-based navigation for course content
  - **Content Statistics**: Display video lecture counts for each topic
  - **Progress Planning**: Help students understand topic scope and video content
- **Business Rules**:
  - Module must be active and not deleted
  - Only active topics are returned in the response
  - Topics are ordered by position field in ascending order
  - Video lecture counts include only active videos
  - Statistics provide clear understanding of topic content depth
  - Course structure supports hierarchical content organization

#### Get Course Videos by Topic
- **Method**: `GET`
- **Path**: `/api/v1/topics/{topicId}/videos`
- **Authorization**: Public (authentication optional for progress tracking)
- **Description**: Retrieve all videos for a specific topic with comprehensive progress tracking and intelligent locking logic
- **Path Parameters**:
  - `topicId` (required): Topic identifier
- **Query Parameters**:
  - `student_id` (optional): Student identifier for progress tracking and video locking
- **Response**: `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "course_video_id": 1,
      "position": 1,
      "video_name": "Introduction to Variables",
      "duration_seconds": 450,
      "is_completed": true,
      "completion_percentage": 100,
      "last_watched_at": "2024-01-20T14:30:00Z",
      "completion_status": "Completed",
      "is_video_locked": false
    },
    {
      "course_video_id": 2,
      "position": 2,
      "video_name": "Variable Types and Scope",
      "duration_seconds": 620,
      "is_completed": false,
      "completion_percentage": 35,
      "last_watched_at": "2024-01-21T10:15:00Z",
      "completion_status": "In Completed",
      "is_video_locked": false
    },
    {
      "course_video_id": 3,
      "position": 3,
      "video_name": "Advanced Variable Concepts",
      "duration_seconds": 780,
      "is_completed": null,
      "completion_percentage": null,
      "last_watched_at": null,
      "completion_status": "Pending",
      "is_video_locked": true
    }
  ],
  "message": "Course videos retrieved successfully"
}
```
- **Use Cases**:
  - **Video Learning Interface**: Display sequential video content with progress tracking
  - **Adaptive Learning**: Implement intelligent video locking based on completion status
  - **Progress Monitoring**: Track individual video completion and watch time
  - **Sequential Learning**: Enforce structured learning paths through position-based locking
- **Business Rules**:
  - Topic must be active and not deleted
  - Only active videos are returned in the response
  - Videos are ordered by position field in ascending order
  - First video (minimum position) is never locked for any student
  - Subsequent videos are locked until the previous video is completed
  - Progress data is null when no student_id is provided
  - Completion status: "Completed" (100%), "In Completed" (1-99%), "Pending" (0%)
  - Video locking ensures structured learning progression and prevents content skipping

#### Get Video Details by ID
- **Method**: `GET`
- **Path**: `/api/v1/videos/{videoId}/details`
- **Authorization**: Public (authentication optional for enhanced features)
- **Description**: Retrieve comprehensive video details by ID including teacher information and navigation to next/previous videos
- **Path Parameters**:
  - `videoId` (required): Video identifier
- **Response**: `200 OK`
```json
{
  "success": true,
  "data": {
    "course_video_id": 1,
    "video_name": "Lecture:1 Introduction to Variables",
    "video_url": "https://video.bunnycdn.com/play/abc123/playlist.m3u8",
    "thumbnail_url": "https://video.bunnycdn.com/thumbnails/abc123.jpg",
    "duration": 450,
    "position": 1,
    "bunny_video_id": "abc123-def456-ghi789",
    "course_topic_id": 1,
    "course_id": 1,
    "teacher_name": "Dr. Jane Smith",
    "teacher_qualification": "PhD in Computer Science",
    "profile_picture_url": "https://example.com/teacher-profile.jpg",
    "next_course_video_id": 2,
    "next_video_name": "Variable Types and Scope",
    "next_video_duration": 620,
    "previous_course_video_id": null,
    "previous_video_name": null,
    "previous_video_duration": null
  },
  "message": "Video details retrieved successfully"
}
```
- **Use Cases**:
  - **Video Player Interface**: Display comprehensive video information for playback
  - **Teacher Information**: Show instructor details and qualifications
  - **Video Navigation**: Enable seamless navigation between sequential videos
  - **Content Management**: Provide complete video metadata for learning platforms
- **Business Rules**:
  - Video must be active and not deleted
  - Teacher information comes from the first assigned teacher for the course
  - Navigation shows next/previous videos within the same topic based on position
  - Video name is formatted as "Lecture:{position} {original_name}"
  - Duration is returned in seconds for consistent time handling
  - Null values are returned when no next/previous videos exist
  - Bunny Video ID provides integration with Bunny.net CDN for video delivery

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

### Public Access (No Authentication Required)
- Can browse available courses using the course discovery endpoint
- Can filter courses by programs, specializations, and course types
- Can search courses by name
- Purchase status is calculated only when student_id is provided
- Cannot access course content or modify any data

## Validation Rules

### Program Validation
- **program_name**: Required, 2-255 characters, string type

### Specialization Validation
- **program_id**: Required for by-program endpoint, positive integer, must exist within tenant

### Course Validation
- **course_name**: Required, 2-255 characters, string type
- **course_description**: Optional, max 2000 characters, string type
- **course_status**: Must be valid CourseStatus enum value
- **course_total_hours**: Read-only field, auto-calculated by backend from sum of video durations in course
- **main_thumbnail_url**: Optional, valid URL format
- **specialization_ids**: Optional, must be an array of valid specialization IDs within tenant

### Course Discovery Validation
- **course_type**: Optional, must be one of 'FREE', 'PAID', 'PURCHASED'
- **program_id**: Optional, integer (-1 for all programs), minimum value -1
- **specialization_id**: Optional, integer (-1 for all specializations), minimum value -1
- **search_query**: Optional, string for course name search, trimmed
- **student_id**: Optional, positive integer for purchase status calculation

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
