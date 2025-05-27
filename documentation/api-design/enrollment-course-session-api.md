# Enrollment & Course Session API Design

## 1. Introduction
The Enrollment & Course Session API manages student course enrollments and course session management within the LMS. This API handles the relationship between students, courses, and educational institutions, while providing course session functionality for time-bound learning experiences. It ensures proper enrollment tracking, institute management, and course session management with multi-tenant isolation and comprehensive audit trails.

## 2. Data Model Overview
Based on `shared/types/student.types.ts`, `shared/entity-relationships/course-session-entities.types.ts`, and `shared/entity-relationships/course-entities.types.ts`:

### Core Enrollment Entities:

- **enrollments** (`Enrollment`):  
  Fields: `enrollment_id`, `course_id` (FK), `student_id` (FK), `institute_id` (FK), `enrolled_at`, `teacher_id` (FK, optional) + audit fields (includes `tenant_id`).  
  Purpose: Records student enrollment in courses through institutes.

- **institutes** (`Institute`):  
  Fields: `institute_id`, `institute_name` + audit fields (includes `tenant_id`).  
  Purpose: Educational institutions within tenants.

- **student_institutes** (`StudentInstitute`):  
  Fields: `student_institute_id`, `student_id` (FK), `institute_id` (FK) + audit fields (includes `tenant_id`).  
  Purpose: Many-to-many relationship between students and institutes.

### Core Course Session Entities:

- **course_session_status_lookups** (`CourseSessionStatusLookup`):  
  Fields: `course_session_status_id`, `status_name`, `description` + minimal audit fields.  
  Purpose: Status tracking for course sessions.

- **course_sessions** (`CourseSession`):  
  Fields: `course_session_id`, `session_name`, `teacher_id` (FK), `course_id` (FK), `start_date`, `end_date`, `max_students`, `session_code`, `course_session_status_id` (FK) + audit fields (includes `tenant_id`).  
  Purpose: Time-bound learning containers linking teachers and courses with enrollment management.

- **course_session_enrollments** (`CourseSessionEnrollment`):  
  Fields: `course_session_enrollment_id`, `course_session_id` (FK), `student_id` (FK), `enrollment_status`, `completion_percentage`, `final_grade` + audit fields (includes `tenant_id`).  
  Purpose: Student enrollment in specific course sessions.

- **course_session_announcements** (`CourseSessionAnnouncement`):  
  Fields: `course_session_announcement_id`, `course_session_id` (FK), `title`, `message`, `is_urgent` + audit fields (includes `tenant_id`).  
  Purpose: Teacher announcements for course sessions.

- **course_session_settings** (`CourseSessionSettings`):  
  Fields: `course_session_settings_id`, `course_session_id` (FK), `allow_late_enrollment`, `require_approval_for_enrollment` + audit fields (includes `tenant_id`).  
  Purpose: Configuration settings for course session behavior.

### Key Enums:
- `CourseSessionStatus` (DRAFT = 1, PUBLISHED = 2, EXPIRED = 3)
- `SessionEnrollmentStatus` (ENROLLED = 1, DROPPED = 2, COMPLETED = 3, EXPELLED = 4)

### Relationships:
- students ↔ institutes (many-to-many via student_institutes)
- enrollments link students, courses, institutes, and optionally teachers
- course sessions connect teachers and courses with time boundaries
- course session enrollments link students to specific sessions
- All entities support multi-tenant isolation via audit fields

## 3. API Endpoints

### 3.1 Institute Management (Admin Only)
Base path: `/api/admin/institutes`

- POST `/`  
  Create institute. Body: `CreateInstituteDto`.
- GET `/`  
  List institutes (pagination, filtering by tenant).
- GET `/{id}`  
  Retrieve institute details with students.
- PATCH `/{id}`  
  Update institute information.
- DELETE `/{id}`  
  Soft-delete institute.
- GET `/{id}/students`  
  List students associated with institute.
- GET `/{id}/enrollments`  
  List all enrollments through this institute.
- POST `/{id}/students`  
  Associate student with institute. Body: `{ studentId }`.
- DELETE `/{id}/students/{studentId}`  
  Remove student from institute.

### 3.2 Enrollment Management (Admin/Teacher)
Base path: `/api/admin/enrollments`

- POST `/`  
  Create enrollment. Body: `CreateEnrollmentDto`.
- GET `/`  
  List enrollments (pagination, filtering by course, student, institute, teacher).
- GET `/{id}`  
  Retrieve enrollment details.
- PATCH `/{id}`  
  Update enrollment (e.g., assign/change teacher).
- DELETE `/{id}`  
  Soft-delete enrollment (unenroll student).
- GET `/{id}/progress`  
  Get student's progress in enrolled course.

**Bulk Enrollment Operations:**
- POST `/bulk`  
  Bulk enroll students. Body: `{ studentIds: number[], courseId: number, instituteId: number, teacherId?: number }`.
- DELETE `/bulk`  
  Bulk unenroll students. Body: `{ enrollmentIds: number[] }`.

### 3.3 Course Enrollment Management (Admin/Teacher)
Base path: `/api/admin/courses/{courseId}/enrollments`

- POST `/`  
  Enroll student in specific course. Body: `CreateCourseEnrollmentDto`.
- GET `/`  
  List all enrollments for course.
- GET `/students`  
  List enrolled students with progress.
- GET `/analytics`  
  Get course enrollment analytics (total enrollments, completion rates, etc.).
- PATCH `/{enrollmentId}/teacher`  
  Assign/change teacher for enrollment. Body: `{ teacherId }`.

### 3.4 Student Enrollment Management (Admin/Teacher)
Base path: `/api/admin/students/{studentId}/enrollments`

- GET `/`  
  List student's enrollments across all courses.
- GET `/active`  
  List student's active enrollments.
- GET `/completed`  
  List student's completed courses.
- POST `/`  
  Enroll student in course. Body: `{ courseId, instituteId, teacherId? }`.
- DELETE `/{enrollmentId}`  
  Unenroll student from specific course.

### 3.5 Course Session Management (Admin/Teacher)
Base path: `/api/admin/course-sessions`

- POST `/`  
  Create course session. Body: `CreateCourseSessionDto`.
- GET `/`  
  List course sessions (pagination, filtering by teacher, course, status).
- GET `/{id}`  
  Retrieve course session details.
- PATCH `/{id}`  
  Update course session information.
- DELETE `/{id}`  
  Soft-delete course session.
- PATCH `/{id}/status`  
  Update course session status. Body: `{ status: CourseSessionStatus }`.
- PATCH `/{id}/publish`  
  Publish draft session to make available for enrollment.

**Course Session Status Management:**
- GET `/statuses`  
  List all course session statuses.
- POST `/statuses`  
  Create new course session status. Body: `CreateCourseSessionStatusDto`.

### 3.6 Course Session Enrollment Management (Admin/Teacher)
Base path: `/api/admin/course-sessions/{sessionId}/enrollments`

- POST `/`  
  Enroll student in course session. Body: `CreateSessionEnrollmentDto`.
- GET `/`  
  List all enrollments for course session.
- GET `/{enrollmentId}`  
  Get specific session enrollment details.
- PATCH `/{enrollmentId}/status`  
  Update enrollment status. Body: `{ enrollment_status, reason }`.
- PATCH `/{enrollmentId}/grade`  
  Update student grade. Body: `{ final_grade, feedback }`.
- DELETE `/{enrollmentId}`  
  Remove student from session.

### 3.7 Teacher Course Session Management (Teacher Only)
Base path: `/api/teacher/course-sessions`

- GET `/`  
  List teacher's course sessions.
- GET `/{id}`  
  Get course session details for teacher.
- GET `/{id}/enrollments`  
  List students enrolled in session.
- POST `/{id}/announcements`  
  Create session announcement.
- GET `/{id}/announcements`  
  List session announcements.
- PATCH `/{id}/settings`  
  Update session settings.

### 3.8 Student Enrollment Access (Student Only)
Base path: `/api/student/enrollments`

- GET `/`  
  List own enrollments.
- GET `/active`  
  List active course enrollments.
- GET `/{enrollmentId}`  
  Get specific enrollment details.
- GET `/{enrollmentId}/progress`  
  Get progress in enrolled course.
- GET `/{enrollmentId}/course-sessions`  
  List course-sessions for enrollment.

### 3.9 Student Course Session Access (Student Only)
Base path: `/api/student/course-sessions`

- GET `/`  
  List own course sessions.
- GET `/active`  
  List active/upcoming sessions.
- GET `/{id}`  
  Get course session details.
- POST `/join`  
  Join session using session code. Body: `{ session_code }`.
- DELETE `/{id}/enrollment`  
  Drop from course session.
- GET `/{id}/announcements`  
  Get session announcements.

### 3.10 Institute Student Management (Admin)
Base path: `/api/admin/institutes/{instituteId}/students`

- GET `/`  
  List students in institute.
- POST `/`  
  Add student to institute. Body: `{ studentId }`.
- DELETE `/{studentId}`  
  Remove student from institute.
- GET `/{studentId}/enrollments`  
  List student's enrollments within institute.

### 3.11 Analytics & Reporting (Admin/Teacher)
Base path: `/api/admin/analytics`

- GET `/enrollments/summary`  
  Get enrollment analytics summary.
- GET `/enrollments/trends`  
  Get enrollment trends over time.
- GET `/institutes/{instituteId}/analytics`  
  Get institute-specific analytics.
- GET `/course-sessions/usage`  
  Get course session usage statistics.
- GET `/course-sessions/{sessionId}/analytics`  
  Get session performance analytics.
- GET `/students/{studentId}/enrollment-history`  
  Get student's complete enrollment history.

All endpoints return `TApiSuccessResponse<T>` for success or `TApiErrorResponse` for errors.

## 4. Prisma Schema Considerations

```prisma
model Institute {
  institute_id        Int       @id @default(autoincrement())
  institute_name      String
  
  // Relations
  tenant              Tenant    @relation(fields: [tenant_id], references: [tenant_id])
  enrollments         Enrollment[]
  student_institutes  StudentInstitute[]
  
  // Audit fields (includes tenant_id from BaseAuditFields)
  tenant_id           Int
  is_active           Boolean   @default(true)
  is_deleted          Boolean   @default(false)
  created_at          DateTime  @default(now())
  created_by          Int
  created_ip          String
  updated_at          DateTime? @updatedAt
  updated_by          Int?
  updated_ip          String?
  
  @@map("institutes")
}

model Enrollment {
  enrollment_id       Int       @id @default(autoincrement())
  course_id           Int
  student_id          Int
  institute_id        Int
  enrolled_at         DateTime  @default(now())
  teacher_id          Int?
  
  // Relations
  tenant              Tenant    @relation(fields: [tenant_id], references: [tenant_id])
  course              Course    @relation(fields: [course_id], references: [course_id], onDelete: Cascade)
  student             Student   @relation(fields: [student_id], references: [student_id], onDelete: Cascade)
  institute           Institute @relation(fields: [institute_id], references: [institute_id])
  teacher             Teacher?  @relation(fields: [teacher_id], references: [teacher_id])
  
  // Audit fields (includes tenant_id from BaseAuditFields)
  tenant_id           Int
  is_active           Boolean   @default(true)
  is_deleted          Boolean   @default(false)
  created_at          DateTime  @default(now())
  created_by          Int
  created_ip          String
  updated_at          DateTime? @updatedAt
  updated_by          Int?
  updated_ip          String?
  
  // Unique constraint to prevent duplicate enrollments
  @@unique([course_id, student_id, institute_id])
  @@map("enrollments")
}

model StudentInstitute {
  student_institute_id  Int       @id @default(autoincrement())
  student_id            Int
  institute_id          Int
  
  // Relations
  tenant                Tenant    @relation(fields: [tenant_id], references: [tenant_id])
  student               Student   @relation(fields: [student_id], references: [student_id], onDelete: Cascade)
  institute             Institute @relation(fields: [institute_id], references: [institute_id], onDelete: Cascade)
  
  // Audit fields (includes tenant_id from BaseAuditFields)
  tenant_id             Int
  is_active             Boolean   @default(true)
  is_deleted            Boolean   @default(false)
  created_at            DateTime  @default(now())
  created_by            Int
  created_ip            String
  updated_at            DateTime? @updatedAt
  updated_by            Int?
  updated_ip            String?
  
  // Unique constraint
  @@unique([student_id, institute_id])
  @@map("student_institutes")
}

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

// Enums
enum CourseSessionStatus {
  DRAFT      @map("1")
  PUBLISHED  @map("2")
  EXPIRED    @map("3")
}

enum SessionEnrollmentStatus {
  ENROLLED   @map("1")
  DROPPED    @map("2")
  COMPLETED  @map("3")
  EXPELLED   @map("4")
}
```

**Key Considerations:**
- All entities inherit `tenant_id` from BaseAuditFields for multi-tenant isolation (except course_session_status_lookups which is global)
- Unique constraints prevent duplicate enrollments and student-institute associations
- Proper foreign key relationships with cascade rules for data integrity
- Indexing on frequently queried fields (course_id, student_id, institute_id, teacher_id)
- Date fields for enrollment tracking and course session validity
- Soft delete support with audit trails
- `created_by` and `updated_by` are numeric IDs (user IDs) as per base.types.ts
- Session enrollments provide detailed tracking within course sessions

## 5. Error Handling

Use standardized `TApiErrorResponse` structure:

```json
{
  "statusCode": 409,
  "message": "Student already enrolled in this course session",
  "errorCode": "DUPLICATE_SESSION_ENROLLMENT",
  "details": {
    "studentId": 123,
    "courseSessionId": 456,
    "existingEnrollmentId": 789
  },
  "correlationId": "req_session_enrollment_12345"
}
```

**Common HTTP Status Codes:**
- 200: Success
- 201: Created (new enrollment/course session)
- 204: No Content (successful unenrollment/deletion)
- 400: Bad Request (validation errors)
- 401: Unauthorized (authentication required)
- 403: Forbidden (insufficient permissions)
- 404: Not Found (student/course/institute/session not found)
- 409: Conflict (duplicate enrollment, session conflicts)
- 422: Unprocessable Entity (business logic errors)
- 500: Internal Server Error

**Error Codes:**
- `DUPLICATE_ENROLLMENT`
- `DUPLICATE_SESSION_ENROLLMENT`
- `STUDENT_NOT_FOUND`
- `COURSE_NOT_FOUND`
- `COURSE_SESSION_NOT_FOUND`
- `INSTITUTE_NOT_FOUND`
- `ENROLLMENT_NOT_FOUND`
- `INVALID_ENROLLMENT_DATE`
- `SESSION_EXPIRED`
- `SESSION_FULL`
- `ENROLLMENT_DEADLINE_PASSED`
- `INVALID_SESSION_CODE`
- `ENROLLMENT_LIMIT_EXCEEDED`
- `INSUFFICIENT_PERMISSIONS`
- `INVALID_TEACHER_ASSIGNMENT`
- `TEACHER_SESSION_OVERLAP`

## 6. Security Considerations

### Access Control:
- **Role-Based Access Control (RBAC)**: Admin can manage all enrollments and sessions, Teachers can manage their assigned courses/sessions, Students can only view their own data.
- **Multi-tenant Isolation**: All data scoped to tenant boundaries through institute relationships.
- **Enrollment Validation**: Verify student eligibility and course/session availability before enrollment.
- **Session Code Security**: Auto-generated unique codes for secure session joining.

### Data Protection:
- **Audit Trails**: Complete audit logging using `BaseAuditFields` for enrollment and session operations.
- **PII Protection**: Secure handling of student personal information in enrollment records.
- **Session Security**: Secure course session management with proper authentication and time boundaries.
- **Grade Protection**: Secure handling of academic performance data.

### API Security:
- **JWT Authentication**: Required for all enrollment and session operations.
- **Input Validation**: Comprehensive validation for enrollment data and session parameters.
- **Rate Limiting**: Prevent abuse of enrollment endpoints and bulk operations.
- **SQL Injection Prevention**: Parameterized queries via Prisma ORM.

### Business Logic Security:
- **Enrollment Limits**: Enforce maximum enrollment limits per course/session.
- **Date Validation**: Validate enrollment dates and session validity periods.
- **Teacher Assignment**: Verify teacher permissions for course and session assignments.
- **Institute Validation**: Ensure students can only enroll through authorized institutes.
- **Session Overlap Prevention**: Prevent teacher conflicts with multiple active sessions.

### Course Session Security:
- **Session Code Management**: Secure generation and validation of session join codes.
- **Time-based Access**: Enforce session start/end dates and enrollment deadlines.
- **Capacity Management**: Monitor and enforce session enrollment limits.
- **Announcement Security**: Ensure only authorized users can create/modify announcements.
- **Settings Protection**: Secure session configuration management.

### Additional Security Measures:
- **Duplicate Prevention**: Prevent duplicate enrollments and conflicting sessions.
- **Cascade Restrictions**: Proper handling of deletions to maintain data integrity.
- **Notification Security**: Secure delivery of enrollment and session notifications.
- **Analytics Privacy**: Anonymize sensitive data in analytics and reporting.
- **Backup Security**: Secure backup of enrollment and session data.
- **Expiry Automation**: Automated session expiration with security controls.

### Import Strategy
All type imports use `@shared/types/` path strategy:
```typescript
import { 
  Enrollment, 
  EnrollmentStatusHistory,
  Institute,
  StudentInstitute 
} from '@shared/types/student.types';
import { 
  CourseSession,
  CourseSessionEnrollment,
  CourseSessionAnnouncement,
  CourseSessionSettings,
  CourseSessionStatusLookup 
} from '@shared/types/course-session-entities.types';
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
  BaseAuditFields 
} from '@shared/types/base.types';
import { 
  TApiSuccessResponse, 
  TApiErrorResponse 
} from '@shared/types/api.types';
```