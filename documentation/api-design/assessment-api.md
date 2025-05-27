# Assessment API Design Documentation

## Introduction

The Assessment API provides comprehensive functionality for managing quizzes and assignments within the LMS platform. This API supports creating, managing, and grading assessments with full multi-tenant isolation, role-based access control, and detailed audit trails.

The assessment system consists of two main components:
- **Quizzes**: Interactive assessments with multiple question types and automated grading capabilities
- **Assignments**: File-based submissions with manual grading workflows

## Data Model Overview

### Assessment Entities

The assessment system includes the following main entities defined in `@shared/types/`:

#### Quiz Entities
- **quizzes** (`@shared/types/quiz.types.ts`): Main quiz entity with configuration and settings
- **quiz_mappings**: Maps quizzes to courses, modules, or topics  
- **quiz_questions**: Individual questions within quizzes
- **quiz_question_options**: Multiple choice options for questions
- **quiz_question_answers**: Correct answers for essay/short answer questions
- **quiz_attempts**: Student attempts at completing quizzes
- **quiz_attempt_answers**: Student responses to individual questions

#### Assignment Entities  
- **assignments** (`@shared/types/assignment.types.ts`): Main assignment entity with requirements
- **assignment_mappings**: Maps assignments to courses, modules, or topics
- **student_assignments**: Student submissions for assignments
- **assignment_submission_files**: Files uploaded for assignment submissions

### Key Enumerations

#### Quiz Enums
- `QuizStatus`: DRAFT, PUBLISHED, GRADING_IN_PROGRESS, GRADED, ARCHIVED
- `QuizQuestionType`: MULTIPLE_CHOICE_SINGLE_ANSWER, MULTIPLE_CHOICE_MULTIPLE_ANSWERS, TRUE_FALSE, SHORT_ANSWER_ESSAY
- `QuizAttemptStatus`: NOT_STARTED, IN_PROGRESS, SUBMITTED, GRADED
- `QuizReferenceTable`: COURSE, COURSE_MODULE, COURSE_TOPIC

#### Assignment Enums
- `AssignmentType`: FILE_UPLOAD
- `AssignmentStatus`: DRAFT, PUBLISHED, GRADING_IN_PROGRESS, GRADED, ARCHIVED
- `SubmissionStatus`: NOT_SUBMITTED, SUBMITTED, LATE_SUBMISSION, GRADED, RESUBMITTED
- `AssignmentReferenceTable`: COURSE, COURSE_MODULE, COURSE_TOPIC

### Multi-Tenant Architecture

All assessment entities extend `MultiTenantAuditFields` from `base.types.ts`, providing:
- Tenant isolation via `tenant_id`
- Complete audit trail with creation and modification tracking
- Soft deletion with `is_active` and `is_deleted` flags
- User tracking with `created_by` and `updated_by` references

## API Endpoints

### Admin/Instructor Endpoints

#### Quiz Management

**Create Quiz**
- **Method**: POST
- **Path**: `/api/v1/admin/courses/{courseId}/quizzes`
- **Description**: Create a new quiz for a course
- **Request Body**: CreateQuizDto
- **Response**: TApiSuccessResponse<Quiz>
- **Status Code**: 201

**Update Quiz**
- **Method**: PATCH  
- **Path**: `/api/v1/admin/quizzes/{quizId}`
- **Description**: Update quiz details and configuration
- **Request Body**: UpdateQuizDto
- **Response**: TApiSuccessResponse<Quiz>
- **Status Code**: 200

**Delete Quiz**
- **Method**: DELETE
- **Path**: `/api/v1/admin/quizzes/{quizId}`
- **Description**: Soft delete a quiz (sets is_deleted = true)
- **Response**: TApiSuccessResponse<{success: boolean}>
- **Status Code**: 200

**Get Quiz Details**
- **Method**: GET
- **Path**: `/api/v1/admin/quizzes/{quizId}`
- **Description**: Retrieve detailed quiz information with questions
- **Response**: TApiSuccessResponse<Quiz & {questions: QuizQuestion[]}>
- **Status Code**: 200

**List Course Quizzes**
- **Method**: GET
- **Path**: `/api/v1/admin/courses/{courseId}/quizzes`
- **Description**: Get all quizzes for a course with filtering
- **Query Parameters**: status, page, limit, search
- **Response**: TApiSuccessResponse<{quizzes: Quiz[], total: number}>
- **Status Code**: 200

#### Quiz Question Management

**Add Quiz Question**
- **Method**: POST
- **Path**: `/api/v1/admin/quizzes/{quizId}/questions`
- **Description**: Add a new question to a quiz
- **Request Body**: CreateQuizQuestionDto
- **Response**: TApiSuccessResponse<QuizQuestion>
- **Status Code**: 201

**Update Quiz Question**
- **Method**: PATCH
- **Path**: `/api/v1/admin/quiz-questions/{questionId}`
- **Description**: Update question text, type, or marks
- **Request Body**: UpdateQuizQuestionDto
- **Response**: TApiSuccessResponse<QuizQuestion>
- **Status Code**: 200

**Delete Quiz Question**
- **Method**: DELETE
- **Path**: `/api/v1/admin/quiz-questions/{questionId}`
- **Description**: Remove question from quiz
- **Response**: TApiSuccessResponse<{success: boolean}>
- **Status Code**: 200

**Add Question Options**
- **Method**: POST
- **Path**: `/api/v1/admin/quiz-questions/{questionId}/options`
- **Description**: Add multiple choice options to a question
- **Request Body**: CreateQuizQuestionOptionsDto
- **Response**: TApiSuccessResponse<QuizQuestionOption[]>
- **Status Code**: 201

#### Assignment Management

**Create Assignment**
- **Method**: POST
- **Path**: `/api/v1/admin/courses/{courseId}/assignments`
- **Description**: Create a new assignment for a course
- **Request Body**: CreateAssignmentDto
- **Response**: TApiSuccessResponse<Assignment>
- **Status Code**: 201

**Update Assignment**
- **Method**: PATCH
- **Path**: `/api/v1/admin/assignments/{assignmentId}`
- **Description**: Update assignment details and requirements
- **Request Body**: UpdateAssignmentDto
- **Response**: TApiSuccessResponse<Assignment>
- **Status Code**: 200

**Delete Assignment**
- **Method**: DELETE
- **Path**: `/api/v1/admin/assignments/{assignmentId}`
- **Description**: Soft delete an assignment
- **Response**: TApiSuccessResponse<{success: boolean}>
- **Status Code**: 200

**List Course Assignments**
- **Method**: GET
- **Path**: `/api/v1/admin/courses/{courseId}/assignments`
- **Description**: Get all assignments for a course
- **Query Parameters**: status, page, limit, search
- **Response**: TApiSuccessResponse<{assignments: Assignment[], total: number}>
- **Status Code**: 200

#### Grading Management

**Get Quiz Attempts for Grading**
- **Method**: GET
- **Path**: `/api/v1/admin/quizzes/{quizId}/attempts`
- **Description**: Retrieve quiz attempts requiring grading
- **Query Parameters**: status, studentId, page, limit
- **Response**: TApiSuccessResponse<{attempts: QuizAttempt[], total: number}>
- **Status Code**: 200

**Grade Quiz Attempt**
- **Method**: PATCH
- **Path**: `/api/v1/admin/quiz-attempts/{attemptId}/grade`
- **Description**: Grade and provide feedback for quiz attempt
- **Request Body**: GradeQuizAttemptDto
- **Response**: TApiSuccessResponse<QuizAttempt>
- **Status Code**: 200

**Get Assignment Submissions for Grading**
- **Method**: GET
- **Path**: `/api/v1/admin/assignments/{assignmentId}/submissions`
- **Description**: Retrieve assignment submissions requiring grading
- **Query Parameters**: status, studentId, page, limit
- **Response**: TApiSuccessResponse<{submissions: StudentAssignment[], total: number}>
- **Status Code**: 200

**Grade Assignment Submission**
- **Method**: PATCH
- **Path**: `/api/v1/admin/student-assignments/{submissionId}/grade`
- **Description**: Grade and provide feedback for assignment submission
- **Request Body**: GradeAssignmentDto
- **Response**: TApiSuccessResponse<StudentAssignment>
- **Status Code**: 200

### Student Endpoints

#### Quiz Participation

**Get Available Quizzes**
- **Method**: GET
- **Path**: `/api/v1/student/courses/{courseId}/quizzes`
- **Description**: Get published quizzes available to student
- **Query Parameters**: status, page, limit
- **Response**: TApiSuccessResponse<{quizzes: Quiz[], total: number}>
- **Status Code**: 200

**Start Quiz Attempt**
- **Method**: POST
- **Path**: `/api/v1/student/quizzes/{quizId}/attempts`
- **Description**: Begin a new quiz attempt
- **Response**: TApiSuccessResponse<QuizAttempt & {questions: QuizQuestion[]}>
- **Status Code**: 201

**Submit Quiz Answer**
- **Method**: POST
- **Path**: `/api/v1/student/quiz-attempts/{attemptId}/answers`
- **Description**: Submit answer for a quiz question
- **Request Body**: SubmitQuizAnswerDto
- **Response**: TApiSuccessResponse<QuizAttemptAnswer>
- **Status Code**: 201

**Update Quiz Answer**
- **Method**: PATCH
- **Path**: `/api/v1/student/quiz-attempt-answers/{answerId}`
- **Description**: Update previously submitted answer (if allowed)
- **Request Body**: UpdateQuizAnswerDto
- **Response**: TApiSuccessResponse<QuizAttemptAnswer>
- **Status Code**: 200

**Submit Quiz Attempt**
- **Method**: PATCH
- **Path**: `/api/v1/student/quiz-attempts/{attemptId}/submit`
- **Description**: Final submission of quiz attempt
- **Response**: TApiSuccessResponse<QuizAttempt>
- **Status Code**: 200

**Get Quiz Attempt Results**
- **Method**: GET
- **Path**: `/api/v1/student/quiz-attempts/{attemptId}/results`
- **Description**: Retrieve quiz results and feedback
- **Response**: TApiSuccessResponse<QuizAttempt & {answers: QuizAttemptAnswer[]}>
- **Status Code**: 200

#### Assignment Participation

**Get Available Assignments**
- **Method**: GET
- **Path**: `/api/v1/student/courses/{courseId}/assignments`
- **Description**: Get published assignments available to student
- **Query Parameters**: status, page, limit
- **Response**: TApiSuccessResponse<{assignments: Assignment[], total: number}>
- **Status Code**: 200

**Create Assignment Submission**
- **Method**: POST
- **Path**: `/api/v1/student/assignments/{assignmentId}/submissions`
- **Description**: Create a new assignment submission
- **Response**: TApiSuccessResponse<StudentAssignment>
- **Status Code**: 201

**Upload Assignment File**
- **Method**: POST
- **Path**: `/api/v1/student/student-assignments/{submissionId}/files`
- **Description**: Upload file for assignment submission
- **Request Body**: Multipart form data with file
- **Response**: TApiSuccessResponse<AssignmentSubmissionFile>
- **Status Code**: 201

**Submit Assignment**
- **Method**: PATCH
- **Path**: `/api/v1/student/student-assignments/{submissionId}/submit`
- **Description**: Final submission of assignment
- **Response**: TApiSuccessResponse<StudentAssignment>
- **Status Code**: 200

**Get Assignment Submission Results**
- **Method**: GET
- **Path**: `/api/v1/student/student-assignments/{submissionId}/results`
- **Description**: Retrieve assignment results and feedback
- **Response**: TApiSuccessResponse<StudentAssignment & {files: AssignmentSubmissionFile[]}>
- **Status Code**: 200

### Common/Public Endpoints

**Get Assessment Analytics**
- **Method**: GET
- **Path**: `/api/v1/analytics/assessments/{courseId}`
- **Description**: Retrieve assessment performance analytics
- **Query Parameters**: type (quiz|assignment), dateFrom, dateTo
- **Response**: TApiSuccessResponse<AssessmentAnalytics>
- **Status Code**: 200

## Prisma Schema Considerations

### Assessment Models

The TypeScript interfaces will translate to Prisma models with proper relationships and constraints:

```prisma
model Quiz {
  quiz_id              Int                   @id @default(autoincrement())
  tenant_id            Int
  course_id            Int
  quiz_name            String                @db.VarChar(255)
  quiz_description     String?               @db.Text
  total_marks          Int
  passing_marks        Int?
  time_limit_minutes   Int?
  max_attempts         Int?
  allow_retake         Boolean               @default(false)
  randomize_questions  Boolean               @default(false)
  due_date             DateTime?
  status               Int                   @default(1)
  instructions         String?               @db.Text
  is_active            Boolean               @default(true)
  is_deleted           Boolean               @default(false)
  created_at           DateTime              @default(now())
  created_by           Int
  created_ip           String                @db.VarChar(45)
  updated_at           DateTime?             @updatedAt
  updated_by           Int?
  updated_ip           String?               @db.VarChar(45)

  // Relationships
  tenant               Tenant                @relation(fields: [tenant_id], references: [tenant_id])
  course               Course                @relation(fields: [course_id], references: [course_id], onDelete: Cascade)
  creator              SystemUser            @relation("QuizCreator", fields: [created_by], references: [system_user_id])
  updater              SystemUser?           @relation("QuizUpdater", fields: [updated_by], references: [system_user_id])
  
  quiz_mappings        QuizMapping[]
  quiz_questions       QuizQuestion[]
  quiz_attempts        QuizAttempt[]

  @@map("quizzes")
  @@unique([quiz_name, course_id], name: "uq_quiz_name_course")
  @@index([course_id, status, tenant_id, is_active], name: "idx_quiz_course_status_tenant")
  @@index([due_date, tenant_id, status], name: "idx_quiz_due_date_tenant")
}

model Assignment {
  assignment_id            Int                     @id @default(autoincrement())
  tenant_id                Int
  course_id                Int
  assignment_name          String                  @db.VarChar(255)
  assignment_description   String?                 @db.Text
  assignment_type          Int                     @default(1)
  total_marks              Int
  passing_marks            Int?
  due_date                 DateTime
  allow_late_submissions   Boolean                 @default(false)
  max_file_size_mb         Int?
  allowed_file_types       String?                 @db.Text
  max_attempts             Int?
  status                   Int                     @default(1)
  instructions             String?                 @db.Text
  is_active                Boolean                 @default(true)
  is_deleted               Boolean                 @default(false)
  created_at               DateTime                @default(now())
  created_by               Int
  created_ip               String                  @db.VarChar(45)
  updated_at               DateTime?               @updatedAt
  updated_by               Int?
  updated_ip               String?                 @db.VarChar(45)

  // Relationships
  tenant                   Tenant                  @relation(fields: [tenant_id], references: [tenant_id])
  course                   Course                  @relation(fields: [course_id], references: [course_id], onDelete: Cascade)
  creator                  SystemUser              @relation("AssignmentCreator", fields: [created_by], references: [system_user_id])
  updater                  SystemUser?             @relation("AssignmentUpdater", fields: [updated_by], references: [system_user_id])
  
  assignment_mappings      AssignmentMapping[]
  student_assignments      StudentAssignment[]

  @@map("assignments")
  @@unique([assignment_name, course_id], name: "uq_assignment_name_course")
  @@index([course_id, status, tenant_id, is_active], name: "idx_assignment_course_status_tenant")
  @@index([due_date, tenant_id, status], name: "idx_assignment_due_date_tenant")
}
```

### Key Relationships

1. **One-to-Many**: Quiz → QuizQuestion → QuizQuestionOption
2. **One-to-Many**: Assignment → StudentAssignment → AssignmentSubmissionFile
3. **Many-to-Many**: Quiz ↔ Course/Module/Topic (via QuizMapping)
4. **Many-to-Many**: Assignment ↔ Course/Module/Topic (via AssignmentMapping)
5. **Tracking**: All entities reference SystemUser for audit trails

### Unique Constraints

- Quiz names must be unique within a course
- Assignment names must be unique within a course
- Quiz question positions must be unique within a quiz
- Quiz option positions must be unique within a question
- Student quiz attempts are tracked by attempt number
- Student assignment submissions are tracked by attempt number

### Performance Indexes

Critical indexes for query optimization:
- Course + Status + Tenant for listing assessments
- Due date queries for deadline tracking
- Student + Assessment for submission lookups
- Grading status for instructor workflows
- Analytics queries with date ranges

## Error Handling

### Standard HTTP Status Codes

- **200**: Successful GET/PATCH operations
- **201**: Successful POST operations (creation)
- **400**: Bad Request (validation errors)
- **401**: Unauthorized (invalid authentication)
- **403**: Forbidden (insufficient permissions)
- **404**: Not Found (resource doesn't exist)
- **409**: Conflict (constraint violations)
- **422**: Unprocessable Entity (business logic errors)
- **500**: Internal Server Error

### Error Response Structure

All errors follow the `TApiErrorResponse` structure from `api.types.ts`:

```typescript
{
  statusCode: number;
  message: string;
  errorCode: string;
  details?: {
    field: string;
    constraint: string;
    value: any;
  }[];
}
```

### Assessment-Specific Error Codes

- `QUIZ_NOT_FOUND`: Quiz does not exist or is deleted
- `QUIZ_NOT_PUBLISHED`: Attempting to access unpublished quiz
- `QUIZ_ATTEMPT_LIMIT_EXCEEDED`: Student has reached maximum attempts
- `QUIZ_TIME_LIMIT_EXCEEDED`: Quiz submission after time limit
- `ASSIGNMENT_NOT_FOUND`: Assignment does not exist or is deleted
- `ASSIGNMENT_SUBMISSION_LATE`: Submission after due date when not allowed
- `FILE_SIZE_EXCEEDED`: Uploaded file exceeds size limit
- `INVALID_FILE_TYPE`: Uploaded file type not allowed
- `GRADING_IN_PROGRESS`: Cannot modify assessment being graded

## Security Considerations

### Authentication & Authorization

- **JWT-based Authentication**: All endpoints require valid JWT tokens
- **Role-Based Access Control**: Proper permission checks for admin/instructor vs student endpoints
- **Tenant Isolation**: All queries filtered by `tenant_id` to prevent cross-tenant access

### Assessment Security

- **Quiz Integrity**: 
  - Questions randomized if enabled
  - Time limits enforced server-side
  - Attempt tracking to prevent cheating
  - Secure answer validation

- **File Upload Security**:
  - File type validation using MIME type checking
  - File size limits enforced
  - Virus scanning integration
  - Secure file storage with access controls

- **Grading Security**:
  - Only authorized instructors can grade
  - Grade modification audit trails
  - Immutable submission records after grading

### Input Validation

- **Assessment Data**: Validate marks, time limits, attempt numbers
- **Question Content**: Sanitize HTML content to prevent XSS
- **File Uploads**: Validate file headers and content
- **Date Validation**: Ensure due dates are in the future

### Data Protection

- **Encryption**: HTTPS for all API communications
- **Audit Trails**: Complete tracking via `BaseAuditFields`
- **Soft Deletion**: Preserve data integrity with `is_deleted` flag
- **Access Logging**: Log all grading and submission activities

## Naming Conventions

### API Endpoints
- RESTful design with resource-based URLs
- Versioning: `/api/v1/...`
- Plural nouns for collections: `/quizzes`, `/assignments`
- Nested resources: `/courses/{id}/quizzes`

### Request/Response Bodies
- PascalCase for JSON properties
- Descriptive DTO naming: `CreateQuizDto`, `UpdateAssignmentDto`
- Consistent response wrapping with `TApiSuccessResponse`

### Database Models
- Snake_case for all database fields
- Descriptive table names: `quiz_attempts`, `assignment_submission_files`
- Consistent foreign key naming: `quiz_id`, `student_id`

### Import Strategy
All type imports use `@shared/types/` path strategy:
```typescript
import { 
  Quiz,
  QuizMapping,
  QuizQuestion,
  QuizQuestionOption,
  QuizQuestionAnswer,
  QuizAttempt,
  QuizAttemptAnswer,
  QuizStatus,
  QuizQuestionType,
  QuizAttemptStatus,
  QuizReferenceTable
} from '@shared/types/quiz.types';
import { 
  Assignment,
  AssignmentMapping,
  StudentAssignment,
  AssignmentSubmissionFile,
  AssignmentType,
  AssignmentStatus,
  SubmissionStatus,
  AssignmentReferenceTable
} from '@shared/types/assignment.types';
import { 
  Course,
  CourseModule,
  CourseTopic
} from '@shared/types/course.types';
import { 
  Student
} from '@shared/types/student.types';
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

---

This assessment API design provides a comprehensive, secure, and scalable solution for managing quizzes and assignments within the multi-tenant LMS platform.