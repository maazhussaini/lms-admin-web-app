# Teacher Management API Design

## 1. Introduction

The Teacher Management API provides comprehensive functionality for managing teacher profiles, contact information, and course assignments within the Learning Management System (LMS). This API is designed with multi-tenant architecture, ensuring complete data isolation between different educational institutions while maintaining robust security and audit capabilities.

The API handles teacher authentication, profile management, contact information management, and course assignment tracking. All operations are performed within the context of a specific tenant, ensuring data security and compliance with educational privacy requirements.

## 2. Data Model Overview

### Core Teacher Entities

The teacher management system is built around several key entities:

- **teachers** (`@shared/types/teacher.types.ts`): Instructors with professional profiles and course assignments
- **contact_informations**: Separate entities for email addresses and phone numbers with primary designation support
- **course_assignments**: Many-to-many relationship between teachers and courses
- **geographic_datas**: Optional countries, states, and cities for location-based organization

### Key Enums and Status Management

From `base.types.ts` and `teacher.types.ts`:
- `Gender`: MALE (1), FEMALE (2)

### Audit and Multi-tenancy

All entities extend `MultiTenantAuditFields` from `base.types.ts`, providing:
- Tenant isolation (`tenant_id`)
- Comprehensive audit trail (`created_at`, `created_by`, `updated_at`, `updated_by`)
- Soft deletion capabilities (`is_active`, `is_deleted`)
- IP tracking for security (`created_ip`, `updated_ip`)

## 3. API Endpoints

### 3.1 Teacher Profile Management

#### Teacher Profile Operations

**GET /api/admin/teachers**
- Description: Retrieve paginated list of teachers with filtering
- Query Parameters:
  - `page` (number): Page number (default: 1)
  - `limit` (number): Items per page (default: 20, max: 100)
  - `search` (string): Search by name, username, or email
  - `country_id` (number): Filter by country
  - `state_id` (number): Filter by state
  - `city_id` (number): Filter by city
  - `joining_date_from` (string): Filter by joining date range
  - `joining_date_to` (string): Filter by joining date range
- Response: `TApiSuccessResponse<{ teachers: Teacher[], total: number, page: number, limit: number }>`
- Status Code: 200

**GET /api/admin/teachers/{teacher_id}**
- Description: Retrieve detailed teacher profile
- Path Parameters:
  - `teacher_id` (number): Teacher identifier
- Response: `TApiSuccessResponse<Teacher>`
- Status Code: 200

**POST /api/admin/teachers**
- Description: Create new teacher profile
- Request Body:
```typescript
{
  full_name: string;
  first_name: string;
  middle_name?: string;
  last_name: string;
  country_id?: number;
  state_id?: number;
  city_id?: number;
  address?: string;
  date_of_birth?: string;
  profile_picture_url?: string;
  zip_code?: string;
  age?: number;
  gender?: Gender;
  username: string;
  password: string;
  joining_date?: string;
}
```
- Response: `TApiSuccessResponse<Teacher>`
- Status Code: 201

**PATCH /api/admin/teachers/{teacher_id}**
- Description: Update teacher profile
- Path Parameters:
  - `teacher_id` (number): Teacher identifier
- Request Body: Partial teacher update object
- Response: `TApiSuccessResponse<Teacher>`
- Status Code: 200

**DELETE /api/admin/teachers/{teacher_id}**
- Description: Soft delete teacher (sets is_deleted = true)
- Path Parameters:
  - `teacher_id` (number): Teacher identifier
- Response: `TApiSuccessResponse<{ message: string }>`
- Status Code: 200

### 3.2 Teacher Contact Management

#### Email Address Management

**GET /api/admin/teachers/{teacher_id}/emails**
- Description: Retrieve teacher email addresses
- Path Parameters:
  - `teacher_id` (number): Teacher identifier
- Response: `TApiSuccessResponse<TeacherEmailAddress[]>`
- Status Code: 200

**POST /api/admin/teachers/{teacher_id}/emails**
- Description: Add email address to teacher
- Path Parameters:
  - `teacher_id` (number): Teacher identifier
- Request Body:
```typescript
{
  email_address: string;
  is_primary: boolean;
  priority?: number;
}
```
- Response: `TApiSuccessResponse<TeacherEmailAddress>`
- Status Code: 201

**PATCH /api/admin/teachers/{teacher_id}/emails/{email_id}/primary**
- Description: Set email as primary (automatically unsets other primary emails)
- Path Parameters:
  - `teacher_id` (number): Teacher identifier
  - `email_id` (number): Email identifier
- Response: `TApiSuccessResponse<TeacherEmailAddress>`
- Status Code: 200

**DELETE /api/admin/teachers/{teacher_id}/emails/{email_id}**
- Description: Remove email address from teacher
- Path Parameters:
  - `teacher_id` (number): Teacher identifier
  - `email_id` (number): Email identifier
- Response: `TApiSuccessResponse<{ message: string }>`
- Status Code: 200

#### Phone Number Management

**GET /api/admin/teachers/{teacher_id}/phones**
- Description: Retrieve teacher phone numbers
- Path Parameters:
  - `teacher_id` (number): Teacher identifier
- Response: `TApiSuccessResponse<TeacherPhoneNumber[]>`
- Status Code: 200

**POST /api/admin/teachers/{teacher_id}/phones**
- Description: Add phone number to teacher
- Path Parameters:
  - `teacher_id` (number): Teacher identifier
- Request Body:
```typescript
{
  dial_code: string;
  phone_number: string;
  iso_country_code?: string;
  is_primary: boolean;
}
```
- Response: `TApiSuccessResponse<TeacherPhoneNumber>`
- Status Code: 201

**PATCH /api/admin/teachers/{teacher_id}/phones/{phone_id}/primary**
- Description: Set phone as primary (automatically unsets other primary phones)
- Path Parameters:
  - `teacher_id` (number): Teacher identifier
  - `phone_id` (number): Phone identifier
- Response: `TApiSuccessResponse<TeacherPhoneNumber>`
- Status Code: 200

**DELETE /api/admin/teachers/{teacher_id}/phones/{phone_id}**
- Description: Remove phone number from teacher
- Path Parameters:
  - `teacher_id` (number): Teacher identifier
  - `phone_id` (number): Phone identifier
- Response: `TApiSuccessResponse<{ message: string }>`
- Status Code: 200

### 3.3 Teacher Course Assignment Management

**GET /api/admin/teachers/{teacher_id}/courses**
- Description: Retrieve courses assigned to teacher
- Path Parameters:
  - `teacher_id` (number): Teacher identifier
- Query Parameters:
  - `is_active` (boolean): Filter by active assignments
- Response: `TApiSuccessResponse<TeacherCourse[]>`
- Status Code: 200

**POST /api/admin/teachers/{teacher_id}/courses**
- Description: Assign teacher to course
- Path Parameters:
  - `teacher_id` (number): Teacher identifier
- Request Body:
```typescript
{
  course_id: number;
}
```
- Response: `TApiSuccessResponse<TeacherCourse>`
- Status Code: 201

**DELETE /api/admin/teachers/{teacher_id}/courses/{course_id}**
- Description: Remove teacher from course assignment
- Path Parameters:
  - `teacher_id` (number): Teacher identifier
  - `course_id` (number): Course identifier
- Response: `TApiSuccessResponse<{ message: string }>`
- Status Code: 200

**GET /api/admin/courses/{course_id}/teachers**
- Description: Retrieve teachers assigned to course
- Path Parameters:
  - `course_id` (number): Course identifier
- Query Parameters:
  - `is_active` (boolean): Filter by active assignments
- Response: `TApiSuccessResponse<TeacherCourse[]>`
- Status Code: 200

**POST /api/admin/courses/{course_id}/teachers**
- Description: Assign course to teacher
- Path Parameters:
  - `course_id` (number): Course identifier
- Request Body:
```typescript
{
  teacher_id: number;
}
```
- Response: `TApiSuccessResponse<TeacherCourse>`
- Status Code: 201

### 3.4 Teacher Self-Service Endpoints

**GET /api/teacher/profile**
- Description: Retrieve authenticated teacher's profile
- Headers: `Authorization: Bearer <jwt_token>`
- Response: `TApiSuccessResponse<Teacher>`
- Status Code: 200

**PATCH /api/teacher/profile**
- Description: Update authenticated teacher's profile (limited fields)
- Headers: `Authorization: Bearer <jwt_token>`
- Request Body: Partial teacher update object (restricted fields)
- Response: `TApiSuccessResponse<Teacher>`
- Status Code: 200

**GET /api/teacher/emails**
- Description: Retrieve authenticated teacher's email addresses
- Headers: `Authorization: Bearer <jwt_token>`
- Response: `TApiSuccessResponse<TeacherEmailAddress[]>`
- Status Code: 200

**POST /api/teacher/emails**
- Description: Add email address to authenticated teacher
- Headers: `Authorization: Bearer <jwt_token>`
- Request Body:
```typescript
{
  email_address: string;
  is_primary: boolean;
  priority?: number;
}
```
- Response: `TApiSuccessResponse<TeacherEmailAddress>`
- Status Code: 201

**GET /api/teacher/phones**
- Description: Retrieve authenticated teacher's phone numbers
- Headers: `Authorization: Bearer <jwt_token>`
- Response: `TApiSuccessResponse<TeacherPhoneNumber[]>`
- Status Code: 200

**POST /api/teacher/phones**
- Description: Add phone number to authenticated teacher
- Headers: `Authorization: Bearer <jwt_token>`
- Request Body:
```typescript
{
  dial_code: string;
  phone_number: string;
  iso_country_code?: string;
  is_primary: boolean;
}
```
- Response: `TApiSuccessResponse<TeacherPhoneNumber>`
- Status Code: 201

**GET /api/teacher/courses**
- Description: Retrieve authenticated teacher's assigned courses
- Headers: `Authorization: Bearer <jwt_token>`
- Response: `TApiSuccessResponse<TeacherCourse[]>`
- Status Code: 200

## 4. Prisma Schema Considerations

### Database Schema Mapping

#### Teacher Tables
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
  gender                  Int?                   // 1: MALE, 2: FEMALE
  username                String                 @db.VarChar(50)
  password_hash           String                 @db.VarChar(255)
  last_login_at           DateTime?
  joining_date            DateTime?
  
  // Audit fields
  is_active               Boolean                @default(true)
  is_deleted              Boolean                @default(false)
  created_at              DateTime               @default(now())
  created_by              Int
  created_ip              String                 @db.VarChar(45)
  updated_at              DateTime?              @updatedAt
  updated_by              Int?
  updated_ip              String?                @db.VarChar(45)

  // Relationships
  tenant                  Tenant                 @relation(fields: [tenant_id], references: [tenant_id])
  country                 Country?               @relation(fields: [country_id], references: [country_id])
  state                   State?                 @relation(fields: [state_id], references: [state_id])
  city                    City?                  @relation(fields: [city_id], references: [city_id])
  emails                  TeacherEmailAddress[]
  phones                  TeacherPhoneNumber[]
  course_assignments      TeacherCourse[]
  enrollments             Enrollment[]

  @@unique([username, tenant_id], name: "uq_teacher_username_tenant")
  @@index([full_name, tenant_id], name: "idx_teacher_name_search")
  @@index([joining_date, tenant_id], name: "idx_teacher_joining_date")
  @@map("teachers")
}

model TeacherEmailAddress {
  teacher_email_address_id Int      @id @default(autoincrement())
  tenant_id                Int
  teacher_id               Int
  email_address            String   @db.VarChar(255)
  is_primary               Boolean  @default(false)
  priority                 Int?
  
  // Audit fields
  is_active                Boolean  @default(true)
  is_deleted               Boolean  @default(false)
  created_at               DateTime @default(now())
  created_by               Int
  created_ip               String   @db.VarChar(45)
  updated_at               DateTime? @updatedAt
  updated_by               Int?
  updated_ip               String?  @db.VarChar(45)

  // Relationships
  tenant                   Tenant   @relation(fields: [tenant_id], references: [tenant_id])
  teacher                  Teacher  @relation(fields: [teacher_id], references: [teacher_id], onDelete: Cascade)

  @@unique([email_address, tenant_id], name: "uq_teacher_email_tenant")
  @@unique([teacher_id], where: { is_primary: true }, name: "uq_teacher_primary_email")
  @@index([teacher_id, is_primary], name: "idx_teacher_email_primary")
  @@map("teacher_email_addresses")
}

model TeacherPhoneNumber {
  teacher_phone_number_id  Int      @id @default(autoincrement())
  tenant_id                Int
  teacher_id               Int
  dial_code                String   @db.VarChar(10)
  phone_number             String   @db.VarChar(20)
  iso_country_code         String?  @db.VarChar(3)
  is_primary               Boolean  @default(false)
  
  // Audit fields
  is_active                Boolean  @default(true)
  is_deleted               Boolean  @default(false)
  created_at               DateTime @default(now())
  created_by               Int
  created_ip               String   @db.VarChar(45)
  updated_at               DateTime? @updatedAt
  updated_by               Int?
  updated_ip               String?  @db.VarChar(45)

  // Relationships
  tenant                   Tenant   @relation(fields: [tenant_id], references: [tenant_id])
  teacher                  Teacher  @relation(fields: [teacher_id], references: [teacher_id], onDelete: Cascade)

  @@unique([dial_code, phone_number, tenant_id], name: "uq_teacher_phone_tenant")
  @@unique([teacher_id], where: { is_primary: true }, name: "uq_teacher_primary_phone")
  @@index([teacher_id, is_primary], name: "idx_teacher_phone_primary")
  @@map("teacher_phone_numbers")
}

model TeacherCourse {
  teacher_course_id        Int       @id @default(autoincrement())
  tenant_id                Int
  course_id                Int
  teacher_id               Int
  
  // Audit fields
  is_active                Boolean   @default(true)
  is_deleted               Boolean   @default(false)
  created_at               DateTime  @default(now())
  created_by               Int
  created_ip               String    @db.VarChar(45)
  updated_at               DateTime? @updatedAt
  updated_by               Int?
  updated_ip               String?   @db.VarChar(45)

  // Relationships
  tenant                   Tenant    @relation(fields: [tenant_id], references: [tenant_id])
  course                   Course    @relation(fields: [course_id], references: [course_id], onDelete: Cascade)
  teacher                  Teacher   @relation(fields: [teacher_id], references: [teacher_id], onDelete: Cascade)

  @@unique([teacher_id, course_id], name: "uq_teacher_course_assignment")
  @@index([teacher_id, course_id], name: "idx_teacher_course_assignment")
  @@index([course_id, tenant_id], name: "idx_course_teacher_lookup")
  @@map("teacher_courses")
}
```

### Key Schema Design Decisions

1. **Multi-tenant Isolation**: All tables include `tenant_id` with appropriate indexes
2. **Optional Geographic Data**: Teacher location information is optional (nullable foreign keys)
3. **Partial Unique Constraints**: Used for primary email/phone constraints with conditions
4. **Audit Trail**: Complete audit fields on all entities
5. **Soft Deletion**: `is_deleted` flag for data retention
6. **Performance Indexes**: Comprehensive indexing strategy for common queries
7. **Referential Integrity**: Appropriate foreign key constraints with CASCADE/RESTRICT policies
8. **Snake Case Naming**: All table and column names use snake_case convention
9. **Pluralized Table Names**: All tables use plural forms for consistency
10. **Cascading Deletes**: Contact information and course assignments cascade delete with teacher removal

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

**Username Uniqueness (409)**
```json
{
  "statusCode": 409,
  "message": "Username already exists within this tenant",
  "errorCode": "USERNAME_CONFLICT",
  "details": {
    "constraint": "uq_teacher_username_tenant",
    "field": "username",
    "value": "john.smith"
  }
}
```

**Course Assignment Duplicate (409)**
```json
{
  "statusCode": 409,
  "message": "Teacher is already assigned to this course",
  "errorCode": "COURSE_ASSIGNMENT_EXISTS",
  "details": {
    "constraint": "uq_teacher_course_assignment",
    "teacher_id": 123,
    "course_id": 456
  }
}
```

#### Validation Errors

**Invalid Email Format (400)**
```json
{
  "statusCode": 400,
  "message": "Email address format is invalid",
  "errorCode": "INVALID_EMAIL_FORMAT",
  "details": {
    "field": "email_address",
    "value": "invalid-email",
    "constraint": "email_format_validation"
  }
}
```

**Invalid Joining Date (400)**
```json
{
  "statusCode": 400,
  "message": "Joining date cannot be in the future",
  "errorCode": "INVALID_JOINING_DATE",
  "details": {
    "field": "joining_date",
    "value": "2025-01-01",
    "constraint": "joining_date_future_check"
  }
}
```

## 6. Security Considerations

### Authentication and Authorization

#### JWT-Based Authentication
- All authenticated endpoints require valid JWT tokens in Authorization header
- Token structure follows `TAuthResponse` from `api.types.ts`
- Tokens include tenant context for multi-tenant isolation
- Separate token scopes for teachers and administrators

#### Role-Based Access Control (RBAC)
- **Admin Role**: Full CRUD access to all teacher management endpoints
- **Teacher Role**: Read/update access to own profile and contact data
- **Course Assignment**: Teachers can only view their assigned courses
- **Tenant Isolation**: All operations automatically filtered by tenant_id

### Data Protection and Privacy

#### Tenant Isolation
- All database queries automatically include tenant_id filtering
- Cross-tenant data access is strictly prohibited
- API responses never expose data from other tenants

#### Sensitive Data Handling
- Password hashes using bcrypt with salt rounds ≥ 12
- PII data encryption at rest for profile pictures and addresses
- Contact information (emails/phones) stored separately for granular access control
- Geographic data stored as references to maintain normalization

### Input Validation and Sanitization

#### Comprehensive Validation
- Username length: 3-50 characters (trimmed)
- Full name length: 2-255 characters (trimmed)
- Email format validation with RFC compliance
- Phone number format validation with international support
- ZIP code alphanumeric validation (3-20 characters)

#### SQL Injection Prevention
- Parameterized queries through Prisma ORM
- No dynamic SQL construction
- Input sanitization for all user-provided data

#### XSS Protection
- HTML encoding for all text outputs
- Content Security Policy headers
- Input sanitization for profile data and notes

### Rate Limiting and Abuse Prevention

#### API Rate Limiting
- Global rate limit: 1000 requests per hour per tenant
- Authentication endpoints: 5 attempts per minute per IP
- Profile updates: 10 per hour per teacher
- Course assignment operations: 20 per hour per admin

#### Teacher Profile Protection
- Profile updates limited to essential fields for self-service
- Contact information updates limited to 5 per day per teacher
- Course assignment changes logged and monitored

### Audit and Monitoring

#### Comprehensive Audit Trail
- All operations logged with user, IP, and timestamp
- Sensitive operations (profile updates, course assignments) require reason codes
- Contact information changes maintained permanently
- Failed authentication attempts logged and monitored

#### Security Monitoring
- Suspicious login pattern detection
- Unauthorized course assignment attempts
- Cross-tenant access attempt logging
- API abuse pattern detection

#### Compliance Features
- FERPA compliance for educational records
- GDPR compliance for European users
- Data retention policies with automatic cleanup
- User data export capabilities for compliance requests

### Additional Security Measures

#### HTTPS and Encryption
- TLS 1.3 required for all API communications
- Perfect Forward Secrecy (PFS) enabled
- Database connection encryption
- At-rest encryption for sensitive fields

#### API Security Headers
- CORS policy configuration
- X-Frame-Options: DENY
- X-Content-Type-Options: nosniff
- Strict-Transport-Security headers

#### Business Logic Security
- Course assignment validation
- Geographic data consistency enforcement
- Contact information format validation
- Teacher qualification verification

### Import Strategy
All type imports use `@shared/types/` path strategy:
```typescript
import { 
  Teacher, 
  TeacherEmailAddress, 
  TeacherPhoneNumber, 
  TeacherCourse 
} from '@shared/types/teacher.types';
import { 
  Gender 
} from '@shared/types/student.types';
import { 
  Country, 
  State, 
  City 
} from '@shared/types/student.types';
import { 
  Course 
} from '@shared/types/course.types';
import { 
  Enrollment 
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
  TApiErrorResponse,
  TAuthResponse 
} from '@shared/types/api.types';
```