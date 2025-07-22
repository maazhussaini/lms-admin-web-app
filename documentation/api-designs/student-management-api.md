# Student Management API Design

## Introduction

The Student Management API provides comprehensive functionality for managing student profiles, contact information, and device tracking within the Learning Management System (LMS). This API is designed with multi-tenant architecture, ensuring complete data isolation between different educational institutions while maintaining robust security and audit capabilities.

The API handles student authentication, profile management, contact information management, and device tracking. All operations are performed within the context of a specific tenant, ensuring data security and compliance with educational privacy requirements.

## Data Model Overview

### Core Entities

The Student Management domain consists of the following main entities defined in `@shared/types/student.types.ts`:

- **students**: Core student entity with comprehensive profile information
- **student_email_addresses**: Student contact email information with primary designation support
- **student_phone_numbers**: Student contact phone information with international support
- **student_devices**: Device tracking for security and access control
- **countries, states, cities**: Geographic reference data for location-based organization
- **enrollments**: Student course enrollment with complete lifecycle tracking
- **enrollment_status_histories**: Complete audit trail of enrollment status changes

### Key Enums

From `@/types/enums.types.ts`:

- **Gender**: `MALE`, `FEMALE`
- **StudentStatus**: `ACTIVE`, `ALUMNI`, `DROPOUT`, `ACCOUNT_FREEZED`, `BLACKLISTED`, `SUSPENDED`, `DEACTIVATED`
- **DeviceType**: `IOS`, `ANDROID`, `WEB`, `DESKTOP`
- **EnrollmentStatus**: `PENDING`, `ACTIVE`, `COMPLETED`, `DROPPED`, `SUSPENDED`, `EXPELLED`, `TRANSFERRED`, `DEFERRED`

### Base Interfaces

All entities extend `MultiTenantAuditFields` from `@shared/types/base.types.ts`, providing:
- Tenant isolation (`tenant_id`)
- Comprehensive audit trail (`created_at`, `created_by`, `updated_at`, `updated_by`)
- Soft deletion capabilities (`is_active`, `is_deleted`, `deleted_at`, `deleted_by`)
- IP tracking for security (`created_ip`, `updated_ip`)

## API Endpoints

### Student Profile Management

#### Create Student
- **Method**: `POST`
- **Path**: `/api/v1/admin/students`
- **Authorization**: SUPER_ADMIN, TENANT_ADMIN
- **Description**: Create a new student profile with proper authorization checks
- **Request Body**:
```json
{
  "full_name": "John Michael Doe",
  "first_name": "John",
  "middle_name": "Michael",
  "last_name": "Doe",
  "country_id": 1,
  "state_id": 5,
  "city_id": 25,
  "address": "123 Student Street",
  "date_of_birth": "2000-01-15",
  "profile_picture_url": "https://example.com/profile.jpg",
  "zip_code": "12345",
  "age": 24,
  "gender": "MALE",
  "username": "john.doe",
  "password": "SecurePassword123",
  "student_status": "ACTIVE",
  "referral_type": "ONLINE"
}
```
- **Response**: `201 Created`
```json
{
  "success": true,
  "data": {
    "student_id": 1,
    "full_name": "John Michael Doe",
    "first_name": "John",
    "middle_name": "Michael",
    "last_name": "Doe",
    "username": "john.doe",
    "student_status": "ACTIVE",
    "tenant_id": 123,
    "created_at": "2024-01-01T00:00:00Z",
    "is_active": true,
    "is_deleted": false
  },
  "message": "Student created successfully"
}
```

#### Get Student by ID
- **Method**: `GET`
- **Path**: `/api/v1/admin/students/{studentId}`
- **Authorization**: SUPER_ADMIN, TENANT_ADMIN
- **Description**: Retrieve a specific student with proper authorization checks
- **Response**: `200 OK`
```json
{
  "success": true,
  "data": {
    "student_id": 1,
    "full_name": "John Michael Doe",
    "username": "john.doe",
    "student_status": "ACTIVE",
    "last_login_at": "2024-01-01T12:00:00Z",
    "country_id": 1,
    "state_id": 5,
    "city_id": 25,
    "profile_picture_url": "https://example.com/profile.jpg"
  }
}
```

#### List All Students
- **Method**: `GET`
- **Path**: `/api/v1/admin/students`
- **Authorization**: SUPER_ADMIN, TENANT_ADMIN
- **Description**: Retrieve students with pagination and filtering (tenant-scoped for TENANT_ADMIN)
- **Query Parameters**:
  - `page?: number` - Page number (default: 1)
  - `limit?: number` - Items per page (default: 10, max: 100)
  - `status?: StudentStatus` - Filter by student status
  - `search?: string` - Search in username, full_name, email_address
  - `country_id?: number` - Filter by country
  - `state_id?: number` - Filter by state
  - `city_id?: number` - Filter by city
  - `age_min?: number` - Minimum age filter
  - `age_max?: number` - Maximum age filter
  - `gender?: Gender` - Filter by gender
- **Response**: `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "student_id": 1,
      "full_name": "John Michael Doe",
      "username": "john.doe",
      "student_status": "ACTIVE",
      "last_login_at": "2024-01-01T12:00:00Z",
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

#### Update Student
- **Method**: `PATCH`
- **Path**: `/api/v1/admin/students/{studentId}`
- **Authorization**: SUPER_ADMIN, TENANT_ADMIN
- **Description**: Update student with proper authorization and validation
- **Request Body**:
```json
{
  "full_name": "John Updated Doe",
  "student_status": "SUSPENDED",
  "profile_picture_url": "https://example.com/new-profile.jpg"
}
```
- **Response**: `200 OK`

#### Delete Student
- **Method**: `DELETE`
- **Path**: `/api/v1/admin/students/{studentId}`
- **Authorization**: SUPER_ADMIN, TENANT_ADMIN
- **Description**: Soft delete a student
- **Response**: `204 No Content`

### Student Contact Management

#### Email Address Management

**Get Student Emails**
- **Method**: `GET`
- **Path**: `/api/v1/admin/students/{studentId}/emails`
- **Authorization**: SUPER_ADMIN, TENANT_ADMIN
- **Response**: `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "student_email_address_id": 1,
      "student_id": 1,
      "email_address": "john.doe@example.com",
      "is_primary": true,
      "priority": 1
    }
  ]
}
```

**Add Student Email**
- **Method**: `POST`
- **Path**: `/api/v1/admin/students/{studentId}/emails`
- **Request Body**:
```json
{
  "email_address": "john.doe@example.com",
  "is_primary": true,
  "priority": 1
}
```
- **Response**: `201 Created`

**Set Primary Email**
- **Method**: `PATCH`
- **Path**: `/api/v1/admin/students/{studentId}/emails/{emailId}/primary`
- **Response**: `200 OK`

**Delete Student Email**
- **Method**: `DELETE`
- **Path**: `/api/v1/admin/students/{studentId}/emails/{emailId}`
- **Response**: `204 No Content`

#### Phone Number Management

**Get Student Phones**
- **Method**: `GET`
- **Path**: `/api/v1/admin/students/{studentId}/phones`
- **Authorization**: SUPER_ADMIN, TENANT_ADMIN
- **Response**: `200 OK`

**Add Student Phone**
- **Method**: `POST`
- **Path**: `/api/v1/admin/students/{studentId}/phones`
- **Request Body**:
```json
{
  "dial_code": "+1",
  "phone_number": "1234567890",
  "iso_country_code": "US",
  "is_primary": true
}
```
- **Response**: `201 Created`

### Student Device Management

**Get Student Devices**
- **Method**: `GET`
- **Path**: `/api/v1/admin/students/{studentId}/devices`
- **Query Parameters**:
  - `device_type?: DeviceType` - Filter by device type
  - `is_active?: boolean` - Filter by active status
- **Response**: `200 OK`

**Register Student Device**
- **Method**: `POST`
- **Path**: `/api/v1/admin/students/{studentId}/devices`
- **Request Body**:
```json
{
  "device_type": "WEB",
  "device_identifier": "browser-uuid-123",
  "device_ip": "192.168.1.1",
  "mac_address": "AA:BB:CC:DD:EE:FF",
  "is_primary": false
}
```
- **Response**: `201 Created`

### Student Self-Service Endpoints

**Get Own Profile**
- **Method**: `GET`
- **Path**: `/api/v1/student/profile`
- **Authorization**: Student JWT Token
- **Response**: `200 OK`

**Update Own Profile**
- **Method**: `PATCH`
- **Path**: `/api/v1/student/profile`
- **Authorization**: Student JWT Token
- **Description**: Limited fields update for self-service
- **Request Body**:
```json
{
  "profile_picture_url": "https://example.com/new-avatar.jpg",
  "address": "456 New Address"
}
```
- **Response**: `200 OK`

### Student Enrollment Management

#### Get Enrolled Courses by Student ID
- **Method**: `GET`
- **Path**: `/api/v1/students/{studentId}/enrolled-courses`
- **Authorization**: SUPER_ADMIN, TENANT_ADMIN, TEACHER, STUDENT
- **Description**: Retrieve all enrolled courses for a specific student with comprehensive details including progress, specializations, and teacher information
- **Path Parameters**:
  - `studentId` (required): Student identifier
- **Query Parameters**:
  - `search_query` (optional): Filter courses by name (case-insensitive)
- **Response**: `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "enrollment_id": 123,
      "specialization_program_id": 45,
      "course_id": 67,
      "specialization_id": 12,
      "program_id": 8,
      "course_name": "Advanced Web Development",
      "start_date": "2024-01-15T09:00:00Z",
      "end_date": "2024-05-15T17:00:00Z",
      "specialization_name": "Full Stack Development",
      "program_name": "Computer Science",
      "teacher_name": "Dr. Jane Smith",
      "course_total_hours": 120.5,
      "overall_progress_percentage": 75
    },
    {
      "enrollment_id": 124,
      "specialization_program_id": 46,
      "course_id": 68,
      "specialization_id": null,
      "program_id": null,
      "course_name": "Database Management Systems",
      "start_date": null,
      "end_date": null,
      "specialization_name": null,
      "program_name": null,
      "teacher_name": "Prof. John Doe",
      "course_total_hours": 80.0,
      "overall_progress_percentage": 45
    }
  ],
  "message": "Enrolled courses retrieved successfully"
}
```
- **Access Control**:
  - **SUPER_ADMIN**: Can access any student's enrolled courses across all tenants
  - **TENANT_ADMIN**: Can access enrolled courses for students within their tenant
  - **TEACHER**: Can access enrolled courses for students within their tenant
  - **STUDENT**: Can access their own enrolled courses only
- **Business Rules**:
  - Only active, non-deleted enrollments are returned
  - Only public courses are included
  - Tenant isolation is automatically applied for non-SUPER_ADMIN users
  - Progress data is fetched from `student_course_progresses` table
  - Teacher information comes from the first assigned teacher to the course
  - Course session dates represent the earliest scheduled session

## Authorization Rules

### SUPER_ADMIN Permissions
- Can create, read, update, and delete any student across all tenants
- Can manage student contact information and devices
- Can change student status and enrollment
- Global scope operations

### TENANT_ADMIN Permissions
- Can only manage students within their own tenant
- Can create, read, update, and soft delete students
- Can manage contact information and devices for tenant students
- Tenant-scoped operations only

### Student Permissions
- Can read and update limited fields of their own profile
- Can manage their own contact information
- Can view their own devices and register new ones
- Cannot change critical fields like username, student_status

## Validation Rules

### Student Profile Validation
- **username**: Required, 3-50 characters, unique within tenant
- **full_name**: Required, 2-255 characters
- **first_name**: Required, 2-100 characters
- **last_name**: Required, 2-100 characters
- **email_address**: Valid email format, unique within tenant
- **password**: 8-100 characters for creation
- **age**: Optional, 5-120 range when provided
- **gender**: Must be valid Gender enum value
- **student_status**: Must be valid StudentStatus enum value

### Contact Information Validation
- **email_address**: Valid RFC 5322 format, maximum 255 characters
- **phone_number**: Valid international format with dial_code
- **dial_code**: Required with phone, 1-10 characters
- **is_primary**: Only one primary email/phone per student

### Device Validation
- **device_type**: Must be valid DeviceType enum value
- **device_identifier**: Required, 10-255 characters
- **mac_address**: Valid MAC address format when provided
- **device_ip**: Valid IPv4/IPv6 format when provided

## Prisma Schema Implementation

### Student Model
```prisma
model Student {
  student_id              Int                    @id @default(autoincrement())
  tenant_id               Int
  full_name               String                 @db.VarChar(255)
  first_name              String                 @db.VarChar(100)
  middle_name             String?                @db.VarChar(100)
  last_name               String                 @db.VarChar(100)
  country_id              Int
  state_id                Int
  city_id                 Int
  address                 String?                @db.Text
  date_of_birth           DateTime?
  profile_picture_url     String?                @db.VarChar(500)
  zip_code                String?                @db.VarChar(20)
  age                     Int?
  gender                  Gender?                // Direct enum reference
  username                String                 @db.VarChar(50)
  password_hash           String                 @db.VarChar(255)
  last_login_at           DateTime?
  student_status          StudentStatus          @default(ACTIVE)
  referral_type           String?                @db.VarChar(100)
  
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
  country                 Country                @relation(fields: [country_id], references: [country_id], onDelete: Restrict)
  state                   State                  @relation(fields: [state_id], references: [state_id], onDelete: Restrict)
  city                    City                   @relation(fields: [city_id], references: [city_id], onDelete: Restrict)
  emails                  StudentEmailAddress[]
  phones                  StudentPhoneNumber[]
  devices                 StudentDevice[]
  enrollments             Enrollment[]
  student_progresses      StudentCourseProgress[]
  course_session_enrollments CourseSessionEnrollment[]
  video_progresses        VideoProgress[]
  student_institutes      StudentInstitute[]
  student_assignments     StudentAssignment[]
  quiz_attempts           QuizAttempt[]
  
  // Audit trail relationships with SystemUser
  created_by_user   SystemUser        @relation("StudentCreatedBy", fields: [created_by], references: [system_user_id], onDelete: Restrict)
  updated_by_user   SystemUser?       @relation("StudentUpdatedBy", fields: [updated_by], references: [system_user_id], onDelete: SetNull)
  deleted_by_user   SystemUser?       @relation("StudentDeletedBy", fields: [deleted_by], references: [system_user_id], onDelete: SetNull)

  @@map("students")
  // Note: Unique constraints and indexes will be implemented via custom SQL in Prisma migrations
}
```

### StudentEmailAddress Model
```prisma
model StudentEmailAddress {
  student_email_address_id Int      @id @default(autoincrement())
  tenant_id                Int
  student_id               Int
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
  student                  Student  @relation(fields: [student_id], references: [student_id], onDelete: Cascade)
  
  // Audit trail relationships with SystemUser
  created_by_user   SystemUser        @relation("StudentEmailAddressCreatedBy", fields: [created_by], references: [system_user_id], onDelete: Restrict)
  updated_by_user   SystemUser?       @relation("StudentEmailAddressUpdatedBy", fields: [updated_by], references: [system_user_id], onDelete: SetNull)
  deleted_by_user   SystemUser?       @relation("StudentEmailAddressDeletedBy", fields: [deleted_by], references: [system_user_id], onDelete: SetNull)

  @@map("student_email_addresses")
  // Note: Unique constraints and indexes will be implemented via custom SQL in Prisma migrations
}
```

### StudentPhoneNumber Model
```prisma
model StudentPhoneNumber {
  student_phone_number_id  Int      @id @default(autoincrement())
  tenant_id                Int
  student_id               Int
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
  student                  Student  @relation(fields: [student_id], references: [student_id], onDelete: Cascade)
  
  // Audit trail relationships with SystemUser
  created_by_user   SystemUser        @relation("StudentPhoneNumberCreatedBy", fields: [created_by], references: [system_user_id], onDelete: Restrict)
  updated_by_user   SystemUser?       @relation("StudentPhoneNumberUpdatedBy", fields: [updated_by], references: [system_user_id], onDelete: SetNull)
  deleted_by_user   SystemUser?       @relation("StudentPhoneNumberDeletedBy", fields: [deleted_by], references: [system_user_id], onDelete: SetNull)

  @@map("student_phone_numbers")
  // Note: Unique constraints and indexes will be implemented via custom SQL in Prisma migrations
}
```

### StudentDevice Model
```prisma
model StudentDevice {
  student_device_id        Int       @id @default(autoincrement())
  tenant_id                Int
  student_id               Int
  device_type              DeviceType // Enum instead of Int
  device_identifier        String    @db.VarChar(255)
  device_ip                String?   @db.VarChar(45)
  mac_address              String?   @db.VarChar(17)
  is_primary               Boolean   @default(false)
  last_active_at           DateTime  @default(now())
  
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
  student                  Student  @relation(fields: [student_id], references: [student_id], onDelete: Cascade)
  
  // Audit trail relationships with SystemUser
  created_by_user   SystemUser        @relation("StudentDeviceCreatedBy", fields: [created_by], references: [system_user_id], onDelete: Restrict)
  updated_by_user   SystemUser?       @relation("StudentDeviceUpdatedBy", fields: [updated_by], references: [system_user_id], onDelete: SetNull)
  deleted_by_user   SystemUser?       @relation("StudentDeviceDeletedBy", fields: [deleted_by], references: [system_user_id], onDelete: SetNull)

  @@map("student_devices")
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
- **403 FORBIDDEN**: "You can only manage students within your own tenant"
- **403 FORBIDDEN**: "Insufficient permissions to access this student"
- **403 FORBIDDEN**: "Students can only update their own profile"

#### Validation Errors
- **409 CONFLICT**: "Username already exists within tenant" (errorCode: "USERNAME_EXISTS")
- **409 CONFLICT**: "Email already exists within tenant" (errorCode: "EMAIL_EXISTS")
- **409 CONFLICT**: "Student already has a primary email address" (errorCode: "PRIMARY_EMAIL_EXISTS")
- **400 BAD_REQUEST**: "Age must be between 5-120 when provided"
- **400 BAD_REQUEST**: "Invalid device MAC address format"
- **400 BAD_REQUEST**: "Maximum 5 devices allowed per student"

#### Not Found Errors
- **404 NOT_FOUND**: "Student with ID {studentId} not found"
- **404 NOT_FOUND**: "Email address not found for this student"
- **404 NOT_FOUND**: "Device not found for this student"

#### Business Logic Errors
- **422 UNPROCESSABLE_ENTITY**: "Cannot change student status to ACTIVE from BLACKLISTED"
- **422 UNPROCESSABLE_ENTITY**: "Cannot delete primary contact information"
- **422 UNPROCESSABLE_ENTITY**: "Device already registered for this student"

## Security Considerations

### Authentication & Authorization
- **JWT-based Authentication**: Required for all endpoints
- **Role-Based Access Control**: SUPER_ADMIN vs TENANT_ADMIN permissions
- **Tenant Isolation**: Strict enforcement except for SUPER_ADMIN operations
- **Student Self-Service**: Limited profile update capabilities

### Data Protection
- **Password Security**: Bcrypt hashing with salt rounds ≥ 12
- **PII Protection**: Profile pictures and addresses encrypted at rest
- **Contact Information**: Separate storage for granular access control
- **Device Privacy**: Device identifiers hashed for privacy protection

### Input Validation and Sanitization
- **Comprehensive Validation**: All fields validated using express-validator
- **SQL Injection Prevention**: Parameterized queries through Prisma ORM
- **XSS Protection**: HTML encoding for all text outputs
- **File Upload Security**: Profile picture URL validation and sanitization

### Rate Limiting and Abuse Prevention
- **API Rate Limiting**: 1000 requests per hour per tenant
- **Authentication Endpoints**: 5 attempts per minute per IP
- **Device Registration**: 3 new devices per hour per student
- **Profile Updates**: 10 updates per hour per student
- **Contact Updates**: 5 contact changes per day per student

### Audit and Monitoring
- **Comprehensive Audit Trail**: All operations logged with user, IP, and timestamp
- **Contact Information Changes**: Permanent audit trail maintained
- **Device Registration**: Alerts for suspicious patterns
- **Failed Authentication**: Monitoring and alerting
- **Cross-tenant Access**: Attempt logging and blocking

### Business Rules Enforcement
- **Username Uniqueness**: Scoped by tenant
- **Email Uniqueness**: Scoped by tenant
- **Primary Contact**: Only one primary email/phone per student
- **Device Limits**: Maximum 5 devices per student
- **Status Transitions**: Validated business rules for student status changes
- **Geographic Consistency**: Country-State-City relationship validation

## Implementation Patterns

### Service Layer Pattern
```typescript
// Example from studentManagement.service.ts
async createStudent(
  data: CreateStudentDto,
  requestingUser: TokenPayload
): Promise<Student> {
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
    studentId,
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
body('student_status')
  .exists().withMessage('Student status is required')
  .isIn(Object.values(StudentStatus)).withMessage('Student status must be a valid StudentStatus')
  .custom(async (value, { req }) => {
    // Custom business rule validation
    const currentStudent = await getStudentById(req.params.studentId);
    if (!isValidStatusTransition(currentStudent.student_status, value)) {
      throw new Error(`Invalid status transition from ${currentStudent.student_status} to ${value}`);
    }
    return true;
  })
```

## Import Strategy

All imports use configured path aliases:

```typescript
// Shared types
import { 
  Student,
  StudentEmailAddress,
  StudentPhoneNumber,
  StudentDevice,
  Country,
  State,
  City,
  Enrollment,
  EnrollmentStatus,
  EnrollmentStatusHistory,
  Institute,
  StudentInstitute,
  Gender,
  StudentStatus,
  DeviceType
} from '@shared/types/student.types';

// Enums
import { 
  Gender,
  StudentStatus,
  DeviceType,
  EnrollmentStatus
} from '@/types/enums';

// Internal modules
import { CreateStudentDto, UpdateStudentDto } from '@/dtos/student/student.dto';
import { StudentService } from '@/services/student.service';
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

Based on the core entities relationships, the student management domain has the following key foreign key constraints:

- **students.tenant_id** → **tenants.tenant_id** (Required for all students)
- **students.country_id** → **countries.country_id** (Required geographic reference)
- **students.state_id** → **states.state_id** (Required geographic reference)
- **students.city_id** → **cities.city_id** (Required geographic reference)
- **student_email_addresses.student_id** → **students.student_id** (Cascade delete)
- **student_phone_numbers.student_id** → **students.student_id** (Cascade delete)
- **student_devices.student_id** → **students.student_id** (Cascade delete)
- **enrollments.student_id** → **students.student_id** (Restrict delete)
- **enrollments.teacher_id** → **teachers.teacher_id** (Optional instructor)

All entities include comprehensive audit trail relationships where system users can create, update, and delete records with proper foreign key constraints and cascade behaviors.