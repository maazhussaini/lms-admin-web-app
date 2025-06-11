# Assessment API Design

## Introduction

The Assessment API provides comprehensive functionality for managing quizzes and assignments within the Learning Management System (LMS). This API enables teachers and administrators to create, manage, and grade assessments while providing students with secure access to take quizzes and submit assignments. The system supports multi-tenant architecture, ensuring complete data isolation between different educational institutions while maintaining robust security and audit capabilities.

The API handles quiz creation, question management, assignment creation, submission processing, grading workflows, and progress tracking. All operations are performed within the context of a specific tenant, ensuring data security and compliance with educational privacy requirements.

## Data Model Overview

### Core Entities

The Assessment domain consists of the following main entities defined in `@shared/types/quiz.types.ts` and `@shared/types/assignment.types.ts`:

#### Quiz Entities
- **quizzes**: Main quiz entity with comprehensive metadata and configuration
- **quiz_mappings**: Maps quizzes to different entities (course, module, topic)
- **quiz_questions**: Individual questions within quizzes with various question types
- **quiz_question_options**: Multiple choice options for quiz questions
- **quiz_question_answers**: Correct answers for essay/short answer questions
- **quiz_attempts**: Student attempts to complete quizzes with grading information
- **quiz_attempt_answers**: Student answers for individual quiz questions

#### Assignment Entities
- **assignments**: Main assignment entity with file upload and grading configuration
- **assignment_mappings**: Maps assignments to different entities (course, module, topic)
- **student_assignments**: Student submissions for assignments with grading
- **assignment_submission_files**: Files uploaded for assignment submissions

### Key Enums

From `@/types/enums.types.ts`:
- **QuizStatus**: `DRAFT`, `PUBLISHED`, `GRADING_IN_PROGRESS`, `GRADED`, `ARCHIVED`
- **QuizQuestionType**: `MULTIPLE_CHOICE_SINGLE_ANSWER`, `MULTIPLE_CHOICE_MULTIPLE_ANSWERS`, `TRUE_FALSE`, `SHORT_ANSWER_ESSAY`
- **QuizAttemptStatus**: `NOT_STARTED`, `IN_PROGRESS`, `SUBMITTED`, `GRADED`
- **QuizReferenceTable**: `COURSE`, `COURSE_MODULE`, `COURSE_TOPIC`

From `@/types/enums.types.ts`:
- **AssignmentType**: `FILE_UPLOAD`
- **AssignmentStatus**: `DRAFT`, `PUBLISHED`, `GRADING_IN_PROGRESS`, `GRADED`, `ARCHIVED`
- **SubmissionStatus**: `PENDING`, `NOT_SUBMITTED`, `SUBMITTED`, `LATE_SUBMISSION`, `GRADED`, `RESUBMITTED`
- **UploadStatus**: `PENDING`, `UPLOADING`, `COMPLETED`, `FAILED`, `CANCELLED`
- **AssignmentReferenceTable**: `COURSE`, `COURSE_MODULE`, `COURSE_TOPIC`

### Base Interfaces

All entities extend `MultiTenantAuditFields` from `@shared/types/base.types.ts`, providing:
- Tenant isolation (`tenant_id`)
- Comprehensive audit trail (`created_at`, `created_by`, `updated_at`, `updated_by`)
- Soft deletion capabilities (`is_active`, `is_deleted`, `deleted_at`, `deleted_by`)
- IP tracking for security (`created_ip`, `updated_ip`)

## API Endpoints

### Quiz Management

#### Create Quiz
- **Method**: `POST`
- **Path**: `/api/v1/teacher/quizzes`
- **Authorization**: SUPER_ADMIN, TENANT_ADMIN, Teacher
- **Description**: Create a new quiz with proper authorization checks
- **Request Body**:
```json
{
  "course_id": 123,
  "quiz_name": "Midterm Exam - Mathematics",
  "quiz_description": "Comprehensive exam covering chapters 1-5",
  "total_marks": 100,
  "passing_marks": 60,
  "time_limit_minutes": 120,
  "max_attempts": 2,
  "allow_retake": true,
  "randomize_questions": true,
  "due_date": "2024-03-15T23:59:59Z",
  "status": "DRAFT",
  "instructions": "Read all questions carefully. Show your work for full credit."
}
```
- **Response**: `201 Created`
```json
{
  "success": true,
  "data": {
    "quiz_id": 456,
    "course_id": 123,
    "teacher_id": 789,
    "quiz_name": "Midterm Exam - Mathematics",
    "quiz_description": "Comprehensive exam covering chapters 1-5",
    "total_marks": 100,
    "passing_marks": 60,
    "time_limit_minutes": 120,
    "max_attempts": 2,
    "allow_retake": true,
    "randomize_questions": true,
    "due_date": "2024-03-15T23:59:59Z",
    "status": "DRAFT",
    "instructions": "Read all questions carefully. Show your work for full credit.",
    "tenant_id": 123,
    "created_at": "2024-01-01T00:00:00Z",
    "is_active": true,
    "is_deleted": false
  },
  "message": "Quiz created successfully"
}
```

#### Get Quiz by ID
- **Method**: `GET`
- **Path**: `/api/v1/teacher/quizzes/{quizId}`
- **Authorization**: SUPER_ADMIN, TENANT_ADMIN, Teacher (own quizzes)
- **Description**: Retrieve a specific quiz with questions
- **Response**: `200 OK`
```json
{
  "success": true,
  "data": {
    "quiz_id": 456,
    "course_id": 123,
    "teacher_id": 789,
    "quiz_name": "Midterm Exam - Mathematics",
    "status": "PUBLISHED",
    "questions": [
      {
        "quiz_question_id": 1,
        "question_text": "What is 2 + 2?",
        "question_type": "MULTIPLE_CHOICE_SINGLE_ANSWER",
        "question_marks": 5,
        "position": 1,
        "options": [
          {
            "quiz_question_option_id": 1,
            "option_text": "3",
            "position": 1,
            "is_correct": false
          },
          {
            "quiz_question_option_id": 2,
            "option_text": "4",
            "position": 2,
            "is_correct": true
          }
        ]
      }
    ]
  }
}
```

#### List Teacher Quizzes
- **Method**: `GET`
- **Path**: `/api/v1/teacher/quizzes`
- **Authorization**: SUPER_ADMIN, TENANT_ADMIN, Teacher
- **Description**: Retrieve quizzes created by the authenticated teacher (teacher-scoped for Teacher role)
- **Query Parameters**:
  - `page?: number` - Page number (default: 1)
  - `limit?: number` - Items per page (default: 10, max: 100)
  - `courseId?: number` - Filter by specific course
  - `status?: QuizStatus` - Filter by quiz status
  - `sortBy?: string` - Sort by field (quiz_id, quiz_name, due_date, created_at, updated_at)
  - `sortOrder?: string` - Sort order (asc, desc)
- **Response**: `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "quiz_id": 456,
      "quiz_name": "Midterm Exam - Mathematics",
      "course_id": 123,
      "status": "PUBLISHED",
      "total_marks": 100,
      "due_date": "2024-03-15T23:59:59Z",
      "attempts_count": 25,
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

#### Update Quiz
- **Method**: `PATCH`
- **Path**: `/api/v1/teacher/quizzes/{quizId}`
- **Authorization**: SUPER_ADMIN, TENANT_ADMIN, Teacher (own quizzes)
- **Description**: Update quiz with proper authorization and validation
- **Request Body**:
```json
{
  "quiz_name": "Updated Midterm Exam",
  "status": "PUBLISHED",
  "due_date": "2024-03-20T23:59:59Z"
}
```
- **Response**: `200 OK`

#### Delete Quiz
- **Method**: `DELETE`
- **Path**: `/api/v1/teacher/quizzes/{quizId}`
- **Authorization**: SUPER_ADMIN, TENANT_ADMIN, Teacher (own quizzes)
- **Description**: Soft delete a quiz (only for draft quizzes)
- **Response**: `204 No Content`

### Quiz Question Management

#### Create Quiz Question
- **Method**: `POST`
- **Path**: `/api/v1/teacher/quizzes/{quizId}/questions`
- **Authorization**: SUPER_ADMIN, TENANT_ADMIN, Teacher (own quizzes)
- **Description**: Add a new question to a quiz
- **Request Body**:
```json
{
  "question_text": "Solve for x: 2x + 5 = 15",
  "question_type": "SHORT_ANSWER_ESSAY",
  "question_marks": 10,
  "position": 1
}
```
- **Response**: `201 Created`

#### Add Question Options
- **Method**: `POST`
- **Path**: `/api/v1/teacher/questions/{questionId}/options`
- **Authorization**: SUPER_ADMIN, TENANT_ADMIN, Teacher (own questions)
- **Description**: Add multiple choice options to a question
- **Request Body**:
```json
{
  "options": [
    {
      "option_text": "x = 5",
      "position": 1,
      "is_correct": true
    },
    {
      "option_text": "x = 10",
      "position": 2,
      "is_correct": false
    }
  ]
}
```
- **Response**: `201 Created`

#### Update Question
- **Method**: `PATCH`
- **Path**: `/api/v1/teacher/questions/{questionId}`
- **Authorization**: SUPER_ADMIN, TENANT_ADMIN, Teacher (own questions)
- **Description**: Update question details
- **Response**: `200 OK`

#### Delete Question
- **Method**: `DELETE`
- **Path**: `/api/v1/teacher/questions/{questionId}`
- **Authorization**: SUPER_ADMIN, TENANT_ADMIN, Teacher (own questions)
- **Description**: Soft delete a question
- **Response**: `204 No Content`

### Assignment Management

#### Create Assignment
- **Method**: `POST`
- **Path**: `/api/v1/teacher/assignments`
- **Authorization**: SUPER_ADMIN, TENANT_ADMIN, Teacher
- **Description**: Create a new assignment with file upload configuration
- **Request Body**:
```json
{
  "course_id": 123,
  "assignment_name": "Research Paper - AI Ethics",
  "assignment_description": "Write a 10-page research paper on AI ethics",
  "assignment_type": "FILE_UPLOAD",
  "total_marks": 100,
  "passing_marks": 70,
  "due_date": "2024-04-01T23:59:59Z",
  "allow_late_submissions": true,
  "max_file_size_mb": 50,
  "allowed_file_types": "application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "max_attempts": 3,
  "status": "DRAFT",
  "instructions": "Submit your paper in PDF format. Include citations and bibliography."
}
```
- **Response**: `201 Created`
```json
{
  "success": true,
  "data": {
    "assignment_id": 789,
    "course_id": 123,
    "teacher_id": 456,
    "assignment_name": "Research Paper - AI Ethics",
    "assignment_description": "Write a 10-page research paper on AI ethics",
    "assignment_type": "FILE_UPLOAD",
    "total_marks": 100,
    "passing_marks": 70,
    "due_date": "2024-04-01T23:59:59Z",
    "allow_late_submissions": true,
    "max_file_size_mb": 50,
    "allowed_file_types": "application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "max_attempts": 3,
    "status": "DRAFT",
    "instructions": "Submit your paper in PDF format. Include citations and bibliography.",
    "tenant_id": 123,
    "created_at": "2024-01-01T00:00:00Z",
    "is_active": true,
    "is_deleted": false
  },
  "message": "Assignment created successfully"
}
```

#### List Teacher Assignments
- **Method**: `GET`
- **Path**: `/api/v1/teacher/assignments`
- **Authorization**: SUPER_ADMIN, TENANT_ADMIN, Teacher
- **Description**: Retrieve assignments created by the authenticated teacher
- **Query Parameters**:
  - `page?: number` - Page number (default: 1)
  - `limit?: number` - Items per page (default: 10, max: 100)
  - `courseId?: number` - Filter by specific course
  - `status?: AssignmentStatus` - Filter by assignment status
  - `sortBy?: string` - Sort by field (assignment_id, assignment_name, due_date, created_at, updated_at)
  - `sortOrder?: string` - Sort order (asc, desc)
- **Response**: `200 OK`

#### Update Assignment
- **Method**: `PATCH`
- **Path**: `/api/v1/teacher/assignments/{assignmentId}`
- **Authorization**: SUPER_ADMIN, TENANT_ADMIN, Teacher (own assignments)
- **Description**: Update assignment details
- **Response**: `200 OK`

#### Delete Assignment
- **Method**: `DELETE`
- **Path**: `/api/v1/teacher/assignments/{assignmentId}`
- **Authorization**: SUPER_ADMIN, TENANT_ADMIN, Teacher (own assignments)
- **Description**: Soft delete an assignment
- **Response**: `204 No Content`

### Student Quiz Operations

#### Get Available Quizzes
- **Method**: `GET`
- **Path**: `/api/v1/student/quizzes`
- **Authorization**: Student JWT Token
- **Description**: Retrieve available quizzes for the authenticated student
- **Query Parameters**:
  - `courseId?: number` - Filter by specific course
  - `page?: number` - Page number (default: 1)
  - `limit?: number` - Items per page (default: 20, max: 100)
- **Response**: `200 OK`

#### Start Quiz Attempt
- **Method**: `POST`
- **Path**: `/api/v1/student/quizzes/{quizId}/attempts`
- **Authorization**: Student JWT Token
- **Description**: Start a new quiz attempt
- **Response**: `201 Created`
```json
{
  "success": true,
  "data": {
    "quiz_attempt_id": 123,
    "quiz_id": 456,
    "student_id": 789,
    "attempt_number": 1,
    "started_at": "2024-03-01T10:00:00Z",
    "status": "IN_PROGRESS",
    "time_limit_expires_at": "2024-03-01T12:00:00Z"
  },
  "message": "Quiz attempt started successfully"
}
```

#### Submit Quiz Answer
- **Method**: `POST`
- **Path**: `/api/v1/student/quiz-attempts/{attemptId}/answers`
- **Authorization**: Student JWT Token
- **Description**: Submit answer for a quiz question
- **Request Body**:
```json
{
  "quiz_question_id": 1,
  "quiz_question_option_id": 2,
  "answer_text": null
}
```
- **Response**: `201 Created`

#### Submit Quiz Attempt
- **Method**: `PATCH`
- **Path**: `/api/v1/student/quiz-attempts/{attemptId}/submit`
- **Authorization**: Student JWT Token
- **Description**: Submit completed quiz attempt for grading
- **Response**: `200 OK`

### Student Assignment Operations

#### Get Available Assignments
- **Method**: `GET`
- **Path**: `/api/v1/student/assignments`
- **Authorization**: Student JWT Token
- **Description**: Retrieve available assignments for the authenticated student
- **Response**: `200 OK`

#### Submit Assignment
- **Method**: `POST`
- **Path**: `/api/v1/student/assignments/{assignmentId}/submissions`
- **Authorization**: Student JWT Token
- **Description**: Submit assignment with file uploads
- **Request Body**: `multipart/form-data`
```
files: [File uploads]
attempt_number: 1
```
- **Response**: `201 Created`
```json
{
  "success": true,
  "data": {
    "student_assignment_id": 123,
    "assignment_id": 456,
    "student_id": 789,
    "attempt_number": 1,
    "submission_date": "2024-03-30T15:30:00Z",
    "submission_status": "SUBMITTED",
    "is_late_submission": false,
    "submitted_files": [
      {
        "assignment_submission_file_id": 1,
        "original_file_name": "research_paper.pdf",
        "file_url": "https://storage.example.com/files/research_paper.pdf",
        "file_size_bytes": 2048576,
        "mime_type": "application/pdf",
        "upload_status": "COMPLETED"
      }
    ]
  },
  "message": "Assignment submitted successfully"
}
```

#### Get Submission Status
- **Method**: `GET`
- **Path**: `/api/v1/student/assignments/{assignmentId}/submission`
- **Authorization**: Student JWT Token
- **Description**: Get student's submission status for an assignment
- **Response**: `200 OK`

### Grading Operations

#### Grade Quiz Attempt
- **Method**: `PATCH`
- **Path**: `/api/v1/teacher/quiz-attempts/{attemptId}/grade`
- **Authorization**: SUPER_ADMIN, TENANT_ADMIN, Teacher (own quizzes)
- **Description**: Grade a quiz attempt (for essay questions)
- **Request Body**:
```json
{
  "score": 85,
  "percentage": 85,
  "teacher_notes": "Good work overall. Improve explanations for question 3.",
  "question_grades": [
    {
      "quiz_question_id": 1,
      "marks_obtained": 8,
      "teacher_comment": "Excellent answer"
    }
  ]
}
```
- **Response**: `200 OK`

#### Grade Assignment Submission
- **Method**: `PATCH`
- **Path**: `/api/v1/teacher/assignments/{assignmentId}/submissions/{submissionId}/grade`
- **Authorization**: SUPER_ADMIN, TENANT_ADMIN, Teacher (own assignments)
- **Description**: Grade an assignment submission
- **Request Body**:
```json
{
  "grade": 88,
  "percentage": 88,
  "feedback": "Well-researched paper with clear arguments. Good use of citations.",
  "teacher_notes": "Consider expanding on the ethical implications in section 3."
}
```
- **Response**: `200 OK`

#### Get Submissions for Grading
- **Method**: `GET`
- **Path**: `/api/v1/teacher/assignments/{assignmentId}/submissions`
- **Authorization**: SUPER_ADMIN, TENANT_ADMIN, Teacher (own assignments)
- **Description**: Get all submissions for an assignment for grading
- **Query Parameters**:
  - `status?: SubmissionStatus` - Filter by submission status
  - `page?: number` - Page number (default: 1)
  - `limit?: number` - Items per page (default: 20, max: 100)
- **Response**: `200 OK`

### Assessment Analytics

#### Get Quiz Analytics
- **Method**: `GET`
- **Path**: `/api/v1/teacher/quizzes/{quizId}/analytics`
- **Authorization**: SUPER_ADMIN, TENANT_ADMIN, Teacher (own quizzes)
- **Description**: Get detailed analytics for a quiz
- **Response**: `200 OK`
```json
{
  "success": true,
  "data": {
    "quiz_overview": {
      "total_attempts": 45,
      "average_score": 78.5,
      "completion_rate": 88.9,
      "pass_rate": 82.2
    },
    "question_analytics": [
      {
        "quiz_question_id": 1,
        "question_text": "What is 2 + 2?",
        "correct_answers": 42,
        "incorrect_answers": 3,
        "average_marks": 4.8
      }
    ],
    "score_distribution": {
      "0-59": 8,
      "60-69": 5,
      "70-79": 12,
      "80-89": 15,
      "90-100": 5
    }
  }
}
```

#### Get Assignment Analytics
- **Method**: `GET`
- **Path**: `/api/v1/teacher/assignments/{assignmentId}/analytics`
- **Authorization**: SUPER_ADMIN, TENANT_ADMIN, Teacher (own assignments)
- **Description**: Get detailed analytics for an assignment
- **Response**: `200 OK`

### Assessment Mapping Management

#### Map Quiz to Entity
- **Method**: `POST`
- **Path**: `/api/v1/teacher/quizzes/{quizId}/mappings`
- **Authorization**: SUPER_ADMIN, TENANT_ADMIN, Teacher (own quizzes)
- **Description**: Map quiz to course, module, or topic
- **Request Body**:
```json
{
  "reference_table_type": "COURSE_MODULE",
  "reference_id": 123
}
```
- **Response**: `201 Created`

#### Map Assignment to Entity
- **Method**: `POST`
- **Path**: `/api/v1/teacher/assignments/{assignmentId}/mappings`
- **Authorization**: SUPER_ADMIN, TENANT_ADMIN, Teacher (own assignments)
- **Description**: Map assignment to course, module, or topic
- **Response**: `201 Created`

## Authorization Rules

### SUPER_ADMIN Permissions
- Can create, read, update, and delete any assessment across all tenants
- Can grade any quiz attempt or assignment submission
- Can access analytics and progress data across all tenants
- Global scope operations

### TENANT_ADMIN Permissions
- Can only manage assessments within their own tenant
- Can create, read, update, and delete assessments in their tenant
- Can grade attempts/submissions within tenant
- Tenant-scoped operations only

### Teacher Permissions
- Can create, read, update, and delete their own assessments
- Can grade attempts/submissions for their own assessments
- Cannot access assessments created by other teachers
- Can access assessment-specific analytics for their assessments

### Student Permissions
- Can read available assessments they are enrolled in
- Can submit quiz attempts and assignment submissions
- Can view their own grades and feedback
- Cannot modify assessment content or access other students' data

## Validation Rules

### Quiz Validation
- **quiz_name**: Required, 2-255 characters, string type
- **total_marks**: Required, positive decimal number
- **passing_marks**: Optional, must be ≤ total_marks
- **time_limit_minutes**: Optional, positive integer
- **max_attempts**: Optional, positive integer
- **due_date**: Optional, valid ISO date format
- **status**: Must be valid QuizStatus enum value

### Assignment Validation
- **assignment_name**: Required, 2-255 characters, string type
- **assignment_type**: Must be valid AssignmentType enum value
- **total_marks**: Required, positive decimal number
- **due_date**: Required, valid ISO date format
- **max_file_size_mb**: Optional, positive integer
- **allowed_file_types**: Optional, comma-separated MIME types
- **status**: Must be valid AssignmentStatus enum value

### Question Validation
- **question_text**: Required, 10-2000 characters, string type
- **question_type**: Must be valid QuizQuestionType enum value
- **question_marks**: Required, positive decimal number
- **position**: Required, positive integer for ordering

### Submission Validation
- **file_uploads**: Must meet assignment file size and type restrictions
- **attempt_number**: Must be within max_attempts limit
- **submission_timing**: Must respect due_date and late submission policies

## Prisma Schema Implementation

### Quiz Model
```prisma
model Quiz {
  quiz_id             Int              @id @default(autoincrement())
  tenant_id           Int
  course_id           Int
  teacher_id          Int              // Teacher who owns the quiz content
  quiz_name           String           @db.VarChar(255)
  quiz_description    String?          @db.Text
  total_marks         Decimal          @db.Decimal(6, 2)
  passing_marks       Decimal?         @db.Decimal(6, 2)
  time_limit_minutes  Int?
  max_attempts        Int?
  allow_retake        Boolean          @default(false)
  randomize_questions Boolean          @default(false)
  due_date            DateTime?
  status              QuizStatus       @default(DRAFT)
  instructions        String?          @db.Text

  // Enhanced audit fields
  is_active           Boolean          @default(true)
  is_deleted          Boolean          @default(false)
  created_at          DateTime         @default(now())
  updated_at          DateTime         @default(now())
  created_by          Int
  updated_by          Int?
  deleted_at          DateTime?
  deleted_by          Int?
  created_ip          String?          @db.VarChar(45)
  updated_ip          String?          @db.VarChar(45)

  // Relationships
  tenant              Tenant           @relation(fields: [tenant_id], references: [tenant_id], onDelete: Restrict)
  course              Course           @relation(fields: [course_id], references: [course_id], onDelete: Cascade)
  teacher             Teacher          @relation(fields: [teacher_id], references: [teacher_id], onDelete: Restrict)
  
  // Related entities
  quiz_mappings       QuizMapping[]
  quiz_questions      QuizQuestion[]
  quiz_attempts       QuizAttempt[]

  @@map("quizzes")
}
```

### Assignment Model
```prisma
model Assignment {
  assignment_id          Int                @id @default(autoincrement())
  tenant_id              Int
  course_id              Int
  teacher_id             Int                // Teacher who created/owns the assignment
  assignment_name        String             @db.VarChar(255)
  assignment_description String?            @db.Text
  assignment_type        AssignmentType     @default(FILE_UPLOAD)
  total_marks            Decimal            @db.Decimal(6, 2)
  passing_marks          Decimal?           @db.Decimal(6, 2)
  due_date               DateTime
  allow_late_submissions Boolean            @default(false)
  max_file_size_mb       Int?
  allowed_file_types     String?            @db.Text
  max_attempts           Int?
  status                 AssignmentStatus   @default(DRAFT)
  instructions           String?            @db.Text

  // Enhanced audit fields
  is_active              Boolean            @default(true)
  is_deleted             Boolean            @default(false)
  created_at             DateTime           @default(now())
  updated_at             DateTime           @default(now())
  created_by             Int
  updated_by             Int?
  deleted_at             DateTime?
  deleted_by             Int?
  created_ip             String?            @db.VarChar(45)
  updated_ip             String?            @db.VarChar(45)

  // Relationships
  tenant                 Tenant             @relation(fields: [tenant_id], references: [tenant_id], onDelete: Restrict)
  course                 Course             @relation(fields: [course_id], references: [course_id], onDelete: Cascade)
  teacher                Teacher            @relation(fields: [teacher_id], references: [teacher_id], onDelete: Restrict)
  
  // Related entities
  assignment_mappings    AssignmentMapping[]
  student_assignments    StudentAssignment[]

  @@map("assignments")
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
    "field": "quiz_name",
    "reason": "Quiz name already exists for this course"
  }
}
```

### Common Error Scenarios

#### Authorization Errors
- **403 FORBIDDEN**: "You can only manage your own assessments"
- **403 FORBIDDEN**: "Students can only access enrolled course assessments"
- **403 FORBIDDEN**: "Cannot grade assessments from other teachers"

#### Validation Errors
- **409 CONFLICT**: "Quiz with this name already exists in this course" (errorCode: "DUPLICATE_QUIZ_NAME")
- **409 CONFLICT**: "Assignment with this name already exists in this course" (errorCode: "DUPLICATE_ASSIGNMENT_NAME")
- **409 CONFLICT**: "Student has already submitted maximum attempts" (errorCode: "MAX_ATTEMPTS_EXCEEDED")
- **400 BAD_REQUEST**: "File size exceeds maximum allowed limit"
- **400 BAD_REQUEST**: "File type not allowed for this assignment"

#### Not Found Errors
- **404 NOT_FOUND**: "Quiz with ID {quizId} not found" (errorCode: "QUIZ_NOT_FOUND")
- **404 NOT_FOUND**: "Assignment with ID {assignmentId} not found" (errorCode: "ASSIGNMENT_NOT_FOUND")
- **404 NOT_FOUND**: "Quiz attempt not found" (errorCode: "QUIZ_ATTEMPT_NOT_FOUND")

#### Business Logic Errors
- **422 UNPROCESSABLE_ENTITY**: "Cannot submit quiz after due date"
- **422 UNPROCESSABLE_ENTITY**: "Quiz attempt has already been submitted"
- **422 UNPROCESSABLE_ENTITY**: "Cannot delete published assessment with submissions"

## Security Considerations

### Authentication & Authorization
- **JWT-based Authentication**: Required for all endpoints
- **Role-Based Access Control**: SUPER_ADMIN vs TENANT_ADMIN vs Teacher vs Student permissions
- **Tenant Isolation**: Strict enforcement except for SUPER_ADMIN operations
- **Assessment Ownership**: Teachers can only manage their own assessments

### Data Protection
- **File Upload Security**: Size limits, type validation, virus scanning
- **Assessment Content Security**: Secure storage and access controls
- **Student Data Privacy**: Grades and submissions isolated per tenant
- **Academic Integrity**: Attempt tracking and submission validation

### Input Validation and Sanitization
- **Comprehensive Validation**: All fields validated using express-validator
- **SQL Injection Prevention**: Parameterized queries through Prisma ORM
- **XSS Protection**: HTML encoding for all text outputs
- **File Upload Validation**: MIME type verification and content scanning

### Rate Limiting and Abuse Prevention
- **API Rate Limiting**: 1000 requests per hour per tenant
- **Assessment Creation**: 20 assessments per hour per teacher
- **Submission Operations**: 100 submissions per hour per student
- **Grading Operations**: 200 grades per hour per teacher

### Audit and Monitoring
- **Comprehensive Audit Trail**: All operations logged with user, IP, and timestamp
- **Assessment Activity Tracking**: Detailed analytics for assessment engagement
- **Submission Monitoring**: Real-time tracking of student submissions
- **Failed Access Attempts**: Monitoring and alerting for security

### Business Rules Enforcement
- **Assessment Lifecycle Validation**: Draft → Published → Graded workflow
- **Submission Requirements**: Due date, attempt limits, and file restrictions
- **Grading Integrity**: Only authorized teachers can grade assessments
- **Academic Privacy**: Student grades visible only to authorized users

## Implementation Patterns

### Service Layer Pattern
```typescript
// Example from quiz.service.ts
async createQuiz(
  data: CreateQuizDto,
  requestingUser: TokenPayload,
  ip?: string
): Promise<Quiz> {
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
    quizId,
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
body('due_date')
  .exists().withMessage('Due date is required')
  .isISO8601().withMessage('Due date must be valid ISO date')
  .custom((value) => {
    const dueDate = new Date(value);
    const now = new Date();
    if (dueDate <= now) {
      throw new Error('Due date must be in the future');
    }
    return true;
  })
```

## Import Strategy

All imports use configured path aliases:

```typescript
// Shared types
import { 
  Quiz,
  QuizQuestion,
  QuizAttempt,
  Assignment,
  StudentAssignment,
  QuizStatus,
  AssignmentStatus,
  QuizQuestionType,
  SubmissionStatus
} from '@shared/types/quiz.types';
import { 
  Assignment,
  AssignmentType,
  SubmissionStatus,
  UploadStatus
} from '@shared/types/assignment.types';

// Enums
import { 
  QuizStatus,
  AssignmentStatus,
  UserType
} from '@/types/enums';

// Internal modules
import { CreateQuizDto, UpdateQuizDto } from '@/dtos/quiz/quiz.dto';
import { CreateAssignmentDto, UpdateAssignmentDto } from '@/dtos/assignment/assignment.dto';
import { QuizService } from '@/services/quiz.service';
import { AssignmentService } from '@/services/assignment.service';
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

Based on the assessment entities relationships, the assessment domain has the following key foreign key constraints:

### Quiz Relationships
- **quizzes.tenant_id** → **tenants.tenant_id** (Required for all quizzes)
- **quizzes.course_id** → **courses.course_id** (Required course association, cascade delete)
- **quizzes.teacher_id** → **teachers.teacher_id** (Required teacher ownership)
- **quiz_mappings.quiz_id** → **quizzes.quiz_id** (Cascade delete)
- **quiz_questions.quiz_id** → **quizzes.quiz_id** (Cascade delete)
- **quiz_attempts.quiz_id** → **quizzes.quiz_id** (Cascade delete)
- **quiz_attempts.student_id** → **students.student_id** (Cascade delete)

### Assignment Relationships
- **assignments.tenant_id** → **tenants.tenant_id** (Required for all assignments)
- **assignments.course_id** → **courses.course_id** (Required course association, cascade delete)
- **assignments.teacher_id** → **teachers.teacher_id** (Required teacher ownership)
- **assignment_mappings.assignment_id** → **assignments.assignment_id** (Cascade delete)
- **student_assignments.assignment_id** → **assignments.assignment_id** (Cascade delete)
- **student_assignments.student_id** → **students.student_id** (Cascade delete)
- **assignment_submission_files.student_assignment_id** → **student_assignments.student_assignment_id** (Cascade delete)

All entities include comprehensive audit trail relationships where system users can create, update, and delete records with proper foreign key constraints and cascade behaviors.

## Data Constraints and Business Rules

### Unique Constraints
- **quiz_name + course_id + teacher_id**: Quiz names must be unique per teacher per course
- **assignment_name + course_id + teacher_id**: Assignment names must be unique per teacher per course
- **student_id + quiz_id + attempt_number**: Quiz attempts must be unique per student per quiz per attempt
- **student_id + assignment_id + attempt_number**: Assignment submissions must be unique per student per assignment per attempt

### Check Constraints
- **quiz_name**: 2-255 characters, non-empty after trimming
- **assignment_name**: 2-255 characters, non-empty after trimming
- **total_marks**: Positive decimal number
- **passing_marks**: Must be ≤ total_marks when provided
- **time_limit_minutes**: Positive integer when provided
- **max_attempts**: Positive integer when provided
- **max_file_size_mb**: Positive integer when provided

### Assessment Lifecycle Rules
- **Status Transitions**: Draft → Published → Graded workflow
- **Submission Deadlines**: Enforced based on due_date and late submission policies
- **Attempt Limits**: Students cannot exceed max_attempts configuration
- **File Upload Rules**: Size and type restrictions enforced per assignment

### Academic Integrity Rules
- **Teacher Ownership**: Only assessment owners can modify or grade
- **Student Access**: Only enrolled students can access and submit assessments
- **Grading Authority**: Only teachers and admins can assign grades
- **Submission Immutability**: Submitted attempts cannot be modified by students