# Teacher Management API Design

## Introduction

The Teacher Management API provides comprehensive functionality for managing teacher profiles, contact information, and course assignments within the Learning Management System (LMS). This API is designed with multi-tenant architecture, ensuring complete data isolation between different educational institutions while maintaining robust security and audit capabilities.

The API handles teacher authentication, profile management, contact information management, and course assignment tracking. All operations are performed within the context of a specific tenant, ensuring data security and compliance with educational privacy requirements.

## Data Model Overview

### Core Entities

The Teacher Management domain consists of the following main entities defined in `@shared/types/teacher.types.ts`:

- **teachers**: Core teacher entity with professional profiles and course assignments
- **teacher_email_addresses**: Teacher contact email information with primary designation support
- **teacher_phone_numbers**: Teacher contact phone information with international support
- **teacher_courses**: Many-to-many relationship between teachers and courses
- **countries, states, cities**: Optional geographic reference data for location-based organization

### Key Enums

From `@/types/enums.types.ts`:

- **Gender**: `MALE`, `FEMALE`

### Base Interfaces

All entities extend `MultiTenantAuditFields` from `@shared/types/base.types.ts`, providing:
- Tenant isolation (`tenant_id`)
- Comprehensive audit trail (`created_at`, `created_by`, `updated_at`, `updated_by`)
- Soft deletion capabilities (`is_active`, `is_deleted`, `deleted_at`, `deleted_by`)
- IP tracking for security (`created_ip`, `updated_ip`)

## API Endpoints

### Teacher Profile Management

#### Create Teacher
- **Method**: `POST`
- **Path**: `/api/v1/admin/teachers`
- **Authorization**: SUPER_ADMIN, TENANT_ADMIN
- **Description**: Create a new teacher profile with proper authorization checks
- **Request Body**:
```json
{
  "full_name": "Dr. Jane Smith",
  "first_name": "Jane",
  "middle_name": "Marie",
  "last_name": "Smith",
  "country_id": 1,
  "state_id": 5,
  "city_id": 25,
  "address": "456 University Avenue",
  "date_of_birth": "1985-03-20",
  "profile_picture_url": "https://example.com/teacher-profile.jpg",
  "zip_code": "12345",
  "age": 38,
  "gender": "FEMALE",
  "username": "jane.smith",
  "password": "SecurePassword123",
  "joining_date": "2024-01-01"
}
```
- **Response**: `201 Created`
```json
{
  "success": true,
  "data": {
    "teacher_id": 1,
    "full_name": "Dr. Jane Smith",
    "first_name": "Jane",
    "middle_name": "Marie",
    "last_name": "Smith",
    "username": "jane.smith",
    "tenant_id": 123,
    "joining_date": "2024-01-01T00:00:00Z",
    "created_at": "2024-01-01T00:00:00Z",
    "is_active": true,
    "is_deleted": false
  },
  "message": "Teacher created successfully"
}
```

#### Get Teacher by ID
- **Method**: `GET`
- **Path**: `/api/v1/admin/teachers/{teacherId}`
- **Authorization**: SUPER_ADMIN, TENANT_ADMIN
- **Description**: Retrieve a specific teacher with proper authorization checks
- **Response**: `200 OK`
```json
{
  "success": true,
  "data": {
    "teacher_id": 1,
    "full_name": "Dr. Jane Smith",
    "username": "jane.smith",
    "last_login_at": "2024-01-01T12:00:00Z",
    "country_id": 1,
    "state_id": 5,
    "city_id": 25,
    "profile_picture_url": "https://example.com/teacher-profile.jpg",
    "joining_date": "2024-01-01T00:00:00Z"
  }
}
```

#### List All Teachers
- **Method**: `GET`
- **Path**: `/api/v1/admin/teachers`
- **Authorization**: SUPER_ADMIN, TENANT_ADMIN
- **Description**: Retrieve teachers with pagination and filtering (tenant-scoped for TENANT_ADMIN)
- **Query Parameters**:
  - `page?: number` - Page number (default: 1)
  - `limit?: number` - Items per page (default: 10, max: 100)
  - `search?: string` - Search in username, full_name, email_address
  - `country_id?: number` - Filter by country
  - `state_id?: number` - Filter by state
  - `city_id?: number` - Filter by city
  - `joining_date_from?: string` - Filter by joining date range
  - `joining_date_to?: string` - Filter by joining date range
  - `gender?: Gender` - Filter by gender
- **Response**: `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "teacher_id": 1,
      "full_name": "Dr. Jane Smith",
      "username": "jane.smith",
      "last_login_at": "2024-01-01T12:00:00Z",
      "joining_date": "2024-01-01T00:00:00Z",
      "tenant_id": 123
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

#### Update Teacher
- **Method**: `PATCH`
- **Path**: `/api/v1/admin/teachers/{teacherId}`
- **Authorization**: SUPER_ADMIN, TENANT_ADMIN
- **Description**: Update teacher with proper authorization and validation
- **Request Body**:
```json
{
  "full_name": "Dr. Jane Updated Smith",
  "profile_picture_url": "https://example.com/new-teacher-profile.jpg"
}
```
- **Response**: `200 OK`

#### Delete Teacher
- **Method**: `DELETE`
- **Path**: `/api/v1/admin/teachers/{teacherId}`
- **Authorization**: SUPER_ADMIN, TENANT_ADMIN
- **Description**: Soft delete a teacher
- **Response**: `204 No Content`

### Teacher Contact Management

#### Email Address Management

**Get Teacher Emails**
- **Method**: `GET`
- **Path**: `/api/v1/admin/teachers/{teacherId}/emails`
- **Authorization**: SUPER_ADMIN, TENANT_ADMIN
- **Response**: `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "teacher_email_address_id": 1,
      "teacher_id": 1,
      "email_address": "jane.smith@university.edu",
      "is_primary": true,
      "priority": 1
    }
  ]
}
```

**Add Teacher Email**
- **Method**: `POST`
- **Path**: `/api/v1/admin/teachers/{teacherId}/emails`
- **Request Body**:
```json
{
  "email_address": "jane.smith@university.edu",
  "is_primary": true,
  "priority": 1
}
```
- **Response**: `201 Created`

**Set Primary Email**
- **Method**: `PATCH`
- **Path**: `/api/v1/admin/teachers/{teacherId}/emails/{emailId}/primary`
- **Response**: `200 OK`

**Delete Teacher Email**
- **Method**: `DELETE`
- **Path**: `/api/v1/admin/teachers/{teacherId}/emails/{emailId}`
- **Response**: `204 No Content`

#### Phone Number Management

**Get Teacher Phones**
- **Method**: `GET`
- **Path**: `/api/v1/admin/teachers/{teacherId}/phones`
- **Authorization**: SUPER_ADMIN, TENANT_ADMIN
- **Response**: `200 OK`

**Add Teacher Phone**
- **Method**: `POST`
- **Path**: `/api/v1/admin/teachers/{teacherId}/phones`
- **Request Body**:
```json
{
  "dial_code": "+1",
  "phone_number": "5551234567",
  "iso_country_code": "US",
  "is_primary": true
}
```
- **Response**: `201 Created`

### Teacher Course Assignment Management

**Get Teacher Courses**
- **Method**: `GET`
- **Path**: `/api/v1/admin/teachers/{teacherId}/courses`
- **Query Parameters**:
  - `is_active?: boolean` - Filter by active assignments
- **Response**: `200 OK`

**Assign Teacher to Course**
- **Method**: `POST`
- **Path**: `/api/v1/admin/teachers/{teacherId}/courses`
- **Request Body**:
```json
{
  "course_id": 456
}
```
- **Response**: `201 Created`

**Remove Teacher from Course**
- **Method**: `DELETE`
- **Path**: `/api/v1/admin/teachers/{teacherId}/courses/{courseId}`
- **Response**: `204 No Content`

### Teacher Self-Service Endpoints

**Get Own Profile**
- **Method**: `GET`
- **Path**: `/api/v1/teacher/profile`
- **Authorization**: Teacher JWT Token
- **Response**: `200 OK`

**Update Own Profile**
- **Method**: `PATCH`
- **Path**: `/api/v1/teacher/profile`
- **Authorization**: Teacher JWT Token
- **Description**: Limited fields update for self-service
- **Request Body**:
```json
{
  "profile_picture_url": "https://example.com/new-avatar.jpg",
  "address": "789 New University Street"
}
```
- **Response**: `200 OK`

## Authorization Rules

### SUPER_ADMIN Permissions
- Can create, read, update, and delete any teacher across all tenants
- Can manage teacher contact information and course assignments
- Global scope operations

### TENANT_ADMIN Permissions
- Can only manage teachers within their own tenant
- Can create, read, update, and soft delete teachers
- Can manage contact information and course assignments for tenant teachers
- Tenant-scoped operations only

### Teacher Permissions
- Can read and update limited fields of their own profile
- Can manage their own contact information
- Can view their own course assignments
- Cannot change critical fields like username or course assignments

## Validation Rules

### Teacher Profile Validation
- **username**: Required, 3-50 characters, unique within tenant
- **full_name**: Required, 2-255 characters
- **first_name**: Required, 2-100 characters
- **last_name**: Required, 2-100 characters
- **email_address**: Valid email format, unique within tenant
- **password**: 8-100 characters for creation
- **age**: Optional, 18-120 range when provided
- **gender**: Must be valid Gender enum value
- **joining_date**: Cannot be in the future

### Contact Information Validation
- **email_address**: Valid RFC 5322 format, maximum 255 characters
- **phone_number**: Valid international format with dial_code
- **dial_code**: Required with phone, 1-10 characters
- **is_primary**: Only one primary email/phone per teacher

### Course Assignment Validation
- **course_id**: Must be valid course within tenant
- **teacher_id**: Must be valid teacher within tenant
- **unique_assignment**: Teacher can only be assigned to course once

## Prisma Schema Implementation

### Teacher Model
```prisma
model Teacher {
  teacher_id              Int                    @id @default(autoincrement())
  tenant_id               Int
  full_name               String                 @db.VarChar(255)
  first_name              String                 @db.VarChar(100)
  middle_name             String?                @db.VarChar(100)
  last_name               String                 @db.VarChar(100)
  country_id              Int?
  state_id                Int?
  city_id                 Int?
  address                 String?                @db.Text
  date_of_birth           DateTime?
  profile_picture_url     String?                @db.VarChar(500)
  zip_code                String?                @db.VarChar(20)
  age                     Int?
  gender                  Gender?                // Direct enum reference
  username                String                 @db.VarChar(50)
  password_hash           String                 @db.VarChar(255)
  last_login_at           DateTime?
  joining_date            DateTime?
  
  // Enhanced audit fields
  is_active               Boolean                @default(true)
  is_deleted              Boolean                @default(false)
  created_at              DateTime               @default(now())
  updated_at              DateTime               @updatedAt
  created_by              Int
  updated_by              Int?
  deleted_at              DateTime?
  deleted_by              Int?
  created_ip              String?                @db.VarChar(45)
  updated_ip              String?                @db.VarChar(45)

  // Relationships
  tenant                  Tenant                 @relation(fields: [tenant_id], references: [tenant_id], onDelete: Restrict)
  country                 Country?               @relation(fields: [country_id], references: [country_id], onDelete: SetNull)
  state                   State?                 @relation(fields: [state_id], references: [state_id], onDelete: SetNull)
  city                    City?                  @relation(fields: [city_id], references: [city_id], onDelete: SetNull)
  emails                  TeacherEmailAddress[]
  phones                  TeacherPhoneNumber[]
  enrollments             Enrollment[]
  teacher_courses         TeacherCourse[]
  course_sessions         CourseSession[]
  course_announcements    CourseSessionAnnouncement[]
  assignments             Assignment[]
  assignment_mappings     AssignmentMapping[]
  quizzes                 Quiz[]
  quiz_mappings           QuizMapping[]
  quiz_questions          QuizQuestion[]
  quiz_attempt_answers    QuizAttemptAnswer[]
  
  // Audit trail relationships with SystemUser
  created_by_user   SystemUser        @relation("TeacherCreatedBy", fields: [created_by], references: [system_user_id], onDelete: Restrict)
  updated_by_user   SystemUser?       @relation("TeacherUpdatedBy", fields: [updated_by], references: [system_user_id], onDelete: SetNull)
  deleted_by_user   SystemUser?       @relation("TeacherDeletedBy", fields: [deleted_by], references: [system_user_id], onDelete: SetNull)

  @@map("teachers")
  // Note: Unique constraints and indexes will be implemented via custom SQL in Prisma migrations
}
```

### TeacherEmailAddress Model
```prisma
model TeacherEmailAddress {
  teacher_email_address_id Int      @id @default(autoincrement())
  tenant_id                Int
  teacher_id               Int
  email_address            String   @db.VarChar(255)
  is_primary               Boolean  @default(false)
  priority                 Int?
  
  // Enhanced audit fields
  is_active                Boolean   @default(true)
  is_deleted               Boolean   @default(false)
  created_at               DateTime  @default(now())
  updated_at               DateTime  @updatedAt
  created_by               Int
  updated_by               Int?
  deleted_at               DateTime?
  deleted_by               Int?
  created_ip               String?   @db.VarChar(45)
  updated_ip               String?   @db.VarChar(45)

  // Relationships
  tenant                   Tenant   @relation(fields: [tenant_id], references: [tenant_id], onDelete: Restrict)
  teacher                  Teacher  @relation(fields: [teacher_id], references: [teacher_id], onDelete: Cascade)
  
  // Audit trail relationships with SystemUser
  created_by_user   SystemUser        @relation("TeacherEmailAddressCreatedBy", fields: [created_by], references: [system_user_id], onDelete: Restrict)
  updated_by_user   SystemUser?       @relation("TeacherEmailAddressUpdatedBy", fields: [updated_by], references: [system_user_id], onDelete: SetNull)
  deleted_by_user   SystemUser?       @relation("TeacherEmailAddressDeletedBy", fields: [deleted_by], references: [system_user_id], onDelete: SetNull)

  @@map("teacher_email_addresses")
  // Note: Unique constraints and indexes will be implemented via custom SQL in Prisma migrations
}
```

### TeacherPhoneNumber Model
```prisma
model TeacherPhoneNumber {
  teacher_phone_number_id  Int      @id @default(autoincrement())
  tenant_id                Int
  teacher_id               Int
  dial_code                String   @db.VarChar(10)
  phone_number             String   @db.VarChar(20)
  iso_country_code         String?  @db.VarChar(3)
  is_primary               Boolean  @default(false)
  
  // Enhanced audit fields
  is_active                Boolean   @default(true)
  is_deleted               Boolean   @default(false)
  created_at               DateTime  @default(now())
  updated_at               DateTime  @updatedAt
  created_by               Int
  updated_by               Int?
  deleted_at               DateTime?
  deleted_by               Int?
  created_ip               String?   @db.VarChar(45)
  updated_ip               String?   @db.VarChar(45)

  // Relationships
  tenant                   Tenant   @relation(fields: [tenant_id], references: [tenant_id], onDelete: Restrict)
  teacher                  Teacher  @relation(fields: [teacher_id], references: [teacher_id], onDelete: Cascade)
  
  // Audit trail relationships with SystemUser
  created_by_user   SystemUser        @relation("TeacherPhoneNumberCreatedBy", fields: [created_by], references: [system_user_id], onDelete: Restrict)
  updated_by_user   SystemUser?       @relation("TeacherPhoneNumberUpdatedBy", fields: [updated_by], references: [system_user_id], onDelete: SetNull)
  deleted_by_user   SystemUser?       @relation("TeacherPhoneNumberDeletedBy", fields: [deleted_by], references: [system_user_id], onDelete: SetNull)

  @@map("teacher_phone_numbers")
  // Note: Unique constraints and indexes will be implemented via custom SQL in Prisma migrations
}
```

### TeacherCourse Model
```prisma
model TeacherCourse {
  teacher_course_id        Int       @id @default(autoincrement())
  tenant_id                Int
  course_id                Int
  teacher_id               Int
  
  // Enhanced audit fields
  is_active                Boolean   @default(true)
  is_deleted               Boolean   @default(false)
  created_at               DateTime  @default(now())
  updated_at               DateTime  @updatedAt
  created_by               Int
  updated_by               Int?
  deleted_at               DateTime?
  deleted_by               Int?
  created_ip               String?   @db.VarChar(45)
  updated_ip               String?   @db.VarChar(45)

  // Relationships
  tenant                   Tenant    @relation(fields: [tenant_id], references: [tenant_id], onDelete: Restrict)
  course                   Course    @relation(fields: [course_id], references: [course_id], onDelete: Cascade)
  teacher                  Teacher   @relation(fields: [teacher_id], references: [teacher_id], onDelete: Cascade)
  
  // Audit trail relationships with SystemUser
  created_by_user   SystemUser        @relation("TeacherCourseCreatedBy", fields: [created_by], references: [system_user_id], onDelete: Restrict)
  updated_by_user   SystemUser?       @relation("TeacherCourseUpdatedBy", fields: [updated_by], references: [system_user_id], onDelete: SetNull)
  deleted_by_user   SystemUser?       @relation("TeacherCourseDeletedBy", fields: [deleted_by], references: [system_user_id], onDelete: SetNull)

  @@map("teacher_courses")
  // Note: Unique constraints and indexes will be implemented via custom SQL in Prisma migrations
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
    "field": "username",
    "reason": "Username already exists within tenant"
  }
}
```

### Common Error Scenarios

#### Authorization Errors
- **403 FORBIDDEN**: "You can only manage teachers within your own tenant"
- **403 FORBIDDEN**: "Insufficient permissions to access this teacher"
- **403 FORBIDDEN**: "Teachers can only update their own profile"

#### Validation Errors
- **409 CONFLICT**: "Username already exists within tenant" (errorCode: "USERNAME_EXISTS")
- **409 CONFLICT**: "Email already exists within tenant" (errorCode: "EMAIL_EXISTS")
- **409 CONFLICT**: "Teacher already has a primary email address" (errorCode: "PRIMARY_EMAIL_EXISTS")
- **409 CONFLICT**: "Teacher is already assigned to this course" (errorCode: "COURSE_ASSIGNMENT_EXISTS")
- **400 BAD_REQUEST**: "Joining date cannot be in the future"
- **400 BAD_REQUEST**: "Age must be between 18-120 when provided"

#### Not Found Errors
- **404 NOT_FOUND**: "Teacher with ID {teacherId} not found"
- **404 NOT_FOUND**: "Email address not found for this teacher"
- **404 NOT_FOUND**: "Course assignment not found"

#### Business Logic Errors
- **422 UNPROCESSABLE_ENTITY**: "Cannot delete primary contact information"
- **422 UNPROCESSABLE_ENTITY**: "Teacher qualification verification required"
- **422 UNPROCESSABLE_ENTITY**: "Cannot assign teacher to course in different tenant"

## Security Considerations

### Authentication & Authorization
- **JWT-based Authentication**: Required for all endpoints
- **Role-Based Access Control**: SUPER_ADMIN vs TENANT_ADMIN permissions
- **Tenant Isolation**: Strict enforcement except for SUPER_ADMIN operations
- **Teacher Self-Service**: Limited profile update capabilities

### Data Protection
- **Password Security**: Bcrypt hashing with salt rounds ≥ 12
- **PII Protection**: Profile pictures and addresses encrypted at rest
- **Contact Information**: Separate storage for granular access control
- **Geographic Data**: Optional references for privacy protection

### Input Validation and Sanitization
- **Comprehensive Validation**: All fields validated using express-validator
- **SQL Injection Prevention**: Parameterized queries through Prisma ORM
- **XSS Protection**: HTML encoding for all text outputs
- **File Upload Security**: Profile picture URL validation and sanitization

### Rate Limiting and Abuse Prevention
- **API Rate Limiting**: 1000 requests per hour per tenant
- **Authentication Endpoints**: 5 attempts per minute per IP
- **Profile Updates**: 10 updates per hour per teacher
- **Contact Updates**: 5 contact changes per day per teacher
- **Course Assignment Operations**: 20 per hour per admin

### Audit and Monitoring
- **Comprehensive Audit Trail**: All operations logged with user, IP, and timestamp
- **Contact Information Changes**: Permanent audit trail maintained
- **Course Assignment Changes**: Logged and monitored
- **Failed Authentication**: Monitoring and alerting
- **Cross-tenant Access**: Attempt logging and blocking

### Business Rules Enforcement
- **Username Uniqueness**: Scoped by tenant
- **Email Uniqueness**: Scoped by tenant
- **Primary Contact**: Only one primary email/phone per teacher
- **Course Assignment**: Unique teacher-course combinations
- **Geographic Consistency**: Country-State-City relationship validation
- **Professional Qualifications**: Verification requirements

## Implementation Patterns

### Service Layer Pattern
```typescript
// Example from teacherManagement.service.ts
async createTeacher(
  data: CreateTeacherDto,
  requestingUser: TokenPayload
): Promise<Teacher> {
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
    teacherId,
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
body('joining_date')
  .optional()
  .isISO8601()
  .withMessage('Joining date must be a valid date')
  .custom((value) => {
    if (new Date(value) > new Date()) {
      throw new Error('Joining date cannot be in the future');
    }
    return true;
  })
```

## Import Strategy

All imports use configured path aliases:

```typescript
// Shared types
import { 
  Teacher, 
  TeacherEmailAddress, 
  TeacherPhoneNumber, 
  TeacherCourse 
} from '@shared/types/teacher.types';

// Enums
import { 
  Gender 
} from '@/types/enums';

// Internal modules
import { CreateTeacherDto, UpdateTeacherDto } from '@/dtos/teacher/teacher.dto';
import { TeacherService } from '@/services/teacher.service';
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

Based on the core entities relationships, the teacher management domain has the following key foreign key constraints:

- **teachers.tenant_id** → **tenants.tenant_id** (Required for all teachers)
- **teachers.country_id** → **countries.country_id** (Optional geographic reference)
- **teachers.state_id** → **states.state_id** (Optional geographic reference)
- **teachers.city_id** → **cities.city_id** (Optional geographic reference)
- **teacher_email_addresses.teacher_id** → **teachers.teacher_id** (Cascade delete)
- **teacher_phone_numbers.teacher_id** → **teachers.teacher_id** (Cascade delete)
- **teacher_courses.teacher_id** → **teachers.teacher_id** (Cascade delete)
- **teacher_courses.course_id** → **courses.course_id** (Cascade delete)
- **enrollments.teacher_id** → **teachers.teacher_id** (Optional instructor)

All entities include comprehensive audit trail relationships where system users can create, update, and delete records with proper foreign key constraints and cascade behaviors.