# Student Management API Design

## 1. Introduction

The Student Management API provides comprehensive functionality for managing student profiles, contact information, and device tracking within the Learning Management System (LMS). This API is designed with multi-tenant architecture, ensuring complete data isolation between different educational institutions while maintaining robust security and audit capabilities.

The API handles student authentication, profile management, contact information management, and device tracking. All operations are performed within the context of a specific tenant, ensuring data security and compliance with educational privacy requirements.

## 2. Data Model Overview

### Core Student Entities

The student management system is built around several key entities:

- **Students** (`@shared/types/student.types.ts`): Primary learners with comprehensive profiles including geographic information, contact details, and device tracking
- **contact_informations**: Separate entities for email addresses and phone numbers with primary designation support
- **device_managements**: Complete device tracking for security and access control
- **geographic_datas**: Countries, states, and cities for location-based organization

### Key Enums and Status Management

From `base.types.ts` and `student.types.ts`:
- `Gender`: MALE (1), FEMALE (2)
- `StudentStatusName`: ACTIVE, ALUMNI, DROPOUT, ACCOUNT_FREEZED, BLACKLISTED, SUSPENDED, DEACTIVATED
- `DeviceType`: IOS, ANDROID, WEB, DESKTOP

### Audit and Multi-tenancy

All entities extend `MultiTenantAuditFields` from `base.types.ts`, providing:
- Tenant isolation (`tenant_id`)
- Comprehensive audit trail (`created_at`, `created_by`, `updated_at`, `updated_by`)
- Soft deletion capabilities (`is_active`, `is_deleted`)
- IP tracking for security (`created_ip`, `updated_ip`)

## 3. API Endpoints

### 3.1 Student Profile Management

#### Student Profile Operations

**GET /api/admin/students**
- Description: Retrieve paginated list of students with filtering
- Query Parameters:
  - `page` (number): Page number (default: 1)
  - `limit` (number): Items per page (default: 20, max: 100)
  - `status` (StudentStatusName): Filter by student status
  - `search` (string): Search by name, username, or email
  - `country_id` (number): Filter by country
  - `state_id` (number): Filter by state
  - `city_id` (number): Filter by city
  - `age_min` (number): Minimum age filter
  - `age_max` (number): Maximum age filter
- Response: `TApiSuccessResponse<{ students: Student[], total: number, page: number, limit: number }>`
- Status Code: 200

**GET /api/admin/students/{student_id}**
- Description: Retrieve detailed student profile
- Path Parameters:
  - `student_id` (number): Student identifier
- Response: `TApiSuccessResponse<Student>`
- Status Code: 200

**POST /api/admin/students**
- Description: Create new student profile
- Request Body:
```typescript
{
  full_name: string;
  first_name: string;
  middle_name?: string;
  last_name: string;
  country_id: number;
  state_id: number;
  city_id: number;
  address?: string;
  date_of_birth?: string;
  profile_picture_url?: string;
  zip_code?: string;
  age?: number;
  gender?: Gender;
  username: string;
  password: string;
  student_status_id: StudentStatusName;
  referral_type?: string;
}
```
- Response: `TApiSuccessResponse<Student>`
- Status Code: 201

**PATCH /api/admin/students/{student_id}**
- Description: Update student profile
- Path Parameters:
  - `student_id` (number): Student identifier
- Request Body: Partial student update object
- Response: `TApiSuccessResponse<Student>`
- Status Code: 200

**DELETE /api/admin/students/{student_id}**
- Description: Soft delete student (sets is_deleted = true)
- Path Parameters:
  - `student_id` (number): Student identifier
- Response: `TApiSuccessResponse<{ message: string }>`
- Status Code: 200

### 3.2 Student Contact Management

#### Email Address Management

**GET /api/admin/students/{student_id}/emails**
- Description: Retrieve student email addresses
- Path Parameters:
  - `student_id` (number): Student identifier
- Response: `TApiSuccessResponse<StudentEmailAddress[]>`
- Status Code: 200

**POST /api/admin/students/{student_id}/emails**
- Description: Add email address to student
- Path Parameters:
  - `student_id` (number): Student identifier
- Request Body:
```typescript
{
  email_address: string;
  is_primary: boolean;
  priority?: number;
}
```
- Response: `TApiSuccessResponse<StudentEmailAddress>`
- Status Code: 201

**PATCH /api/admin/students/{student_id}/emails/{email_id}/primary**
- Description: Set email as primary (automatically unsets other primary emails)
- Path Parameters:
  - `student_id` (number): Student identifier
  - `email_id` (number): Email identifier
- Response: `TApiSuccessResponse<StudentEmailAddress>`
- Status Code: 200

**DELETE /api/admin/students/{student_id}/emails/{email_id}**
- Description: Remove email address from student
- Path Parameters:
  - `student_id` (number): Student identifier
  - `email_id` (number): Email identifier
- Response: `TApiSuccessResponse<{ message: string }>`
- Status Code: 200

#### Phone Number Management

**GET /api/admin/students/{student_id}/phones**
- Description: Retrieve student phone numbers
- Path Parameters:
  - `student_id` (number): Student identifier
- Response: `TApiSuccessResponse<StudentPhoneNumber[]>`
- Status Code: 200

**POST /api/admin/students/{student_id}/phones**
- Description: Add phone number to student
- Path Parameters:
  - `student_id` (number): Student identifier
- Request Body:
```typescript
{
  dial_code: string;
  phone_number: string;
  iso_country_code?: string;
  is_primary: boolean;
}
```
- Response: `TApiSuccessResponse<StudentPhoneNumber>`
- Status Code: 201

**PATCH /api/admin/students/{student_id}/phones/{phone_id}/primary**
- Description: Set phone as primary (automatically unsets other primary phones)
- Path Parameters:
  - `student_id` (number): Student identifier
  - `phone_id` (number): Phone identifier
- Response: `TApiSuccessResponse<StudentPhoneNumber>`
- Status Code: 200

**DELETE /api/admin/students/{student_id}/phones/{phone_id}**
- Description: Remove phone number from student
- Path Parameters:
  - `student_id` (number): Student identifier
  - `phone_id` (number): Phone identifier
- Response: `TApiSuccessResponse<{ message: string }>`
- Status Code: 200

### 3.3 Student Device Management

**GET /api/admin/students/{student_id}/devices**
- Description: Retrieve student registered devices
- Path Parameters:
  - `student_id` (number): Student identifier
- Query Parameters:
  - `device_type` (DeviceType): Filter by device type
  - `is_active` (boolean): Filter by active status
- Response: `TApiSuccessResponse<StudentDevice[]>`
- Status Code: 200

**POST /api/admin/students/{student_id}/devices**
- Description: Register new device for student
- Path Parameters:
  - `student_id` (number): Student identifier
- Request Body:
```typescript
{
  device_type: DeviceType;
  device_identifier: string;
  device_ip?: string;
  mac_address?: string;
  is_primary: boolean;
}
```
- Response: `TApiSuccessResponse<StudentDevice>`
- Status Code: 201

**PATCH /api/admin/students/{student_id}/devices/{device_id}/active**
- Description: Update device last active timestamp
- Path Parameters:
  - `student_id` (number): Student identifier
  - `device_id` (number): Device identifier
- Response: `TApiSuccessResponse<StudentDevice>`
- Status Code: 200

**PATCH /api/admin/students/{student_id}/devices/{device_id}/primary**
- Description: Set device as primary (automatically unsets other primary devices)
- Path Parameters:
  - `student_id` (number): Student identifier
  - `device_id` (number): Device identifier
- Response: `TApiSuccessResponse<StudentDevice>`
- Status Code: 200

**DELETE /api/admin/students/{student_id}/devices/{device_id}**
- Description: Remove device from student
- Path Parameters:
  - `student_id` (number): Student identifier
  - `device_id` (number): Device identifier
- Response: `TApiSuccessResponse<{ message: string }>`
- Status Code: 200

### 3.4 Student Self-Service Endpoints

**GET /api/student/profile**
- Description: Retrieve authenticated student's profile
- Headers: `Authorization: Bearer <jwt_token>`
- Response: `TApiSuccessResponse<Student>`
- Status Code: 200

**PATCH /api/student/profile**
- Description: Update authenticated student's profile (limited fields)
- Headers: `Authorization: Bearer <jwt_token>`
- Request Body: Partial student update object (restricted fields)
- Response: `TApiSuccessResponse<Student>`
- Status Code: 200

**GET /api/student/emails**
- Description: Retrieve authenticated student's email addresses
- Headers: `Authorization: Bearer <jwt_token>`
- Response: `TApiSuccessResponse<StudentEmailAddress[]>`
- Status Code: 200

**POST /api/student/emails**
- Description: Add email address to authenticated student
- Headers: `Authorization: Bearer <jwt_token>`
- Request Body:
```typescript
{
  email_address: string;
  is_primary: boolean;
  priority?: number;
}
```
- Response: `TApiSuccessResponse<StudentEmailAddress>`
- Status Code: 201

**GET /api/student/phones**
- Description: Retrieve authenticated student's phone numbers
- Headers: `Authorization: Bearer <jwt_token>`
- Response: `TApiSuccessResponse<StudentPhoneNumber[]>`
- Status Code: 200

**POST /api/student/phones**
- Description: Add phone number to authenticated student
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
- Response: `TApiSuccessResponse<StudentPhoneNumber>`
- Status Code: 201

**GET /api/student/devices**
- Description: Retrieve authenticated student's devices
- Headers: `Authorization: Bearer <jwt_token>`
- Response: `TApiSuccessResponse<StudentDevice[]>`
- Status Code: 200

**POST /api/student/devices**
- Description: Register new device for authenticated student
- Headers: `Authorization: Bearer <jwt_token>`
- Request Body:
```typescript
{
  device_type: DeviceType;
  device_identifier: string;
  device_ip?: string;
  mac_address?: string;
}
```
- Response: `TApiSuccessResponse<StudentDevice>`
- Status Code: 201

## 4. Prisma Schema Considerations

### Database Schema Mapping

#### Student Tables
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
  gender                  Int?                   // 1: MALE, 2: FEMALE
  username                String                 @db.VarChar(50)
  password_hash           String                 @db.VarChar(255)
  last_login_at           DateTime?
  student_status_id       Int                    // 1-7 enum values
  referral_type           String?                @db.VarChar(100)
  
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
  country                 Country                @relation(fields: [country_id], references: [country_id])
  state                   State                  @relation(fields: [state_id], references: [state_id])
  city                    City                   @relation(fields: [city_id], references: [city_id])
  emails                  StudentEmailAddress[]
  phones                  StudentPhoneNumber[]
  devices                 StudentDevice[]
  enrollments             Enrollment[]
  institute_associations  StudentInstitute[]

  @@unique([username, tenant_id], name: "uq_student_username_tenant")
  @@index([student_status_id, tenant_id, is_active], name: "idx_student_status_tenant")
  @@index([full_name, tenant_id], name: "idx_student_name_search")
  @@index([country_id, state_id, city_id, tenant_id], name: "idx_student_geographic")
  @@map("students")
}

model StudentEmailAddress {
  student_email_address_id Int      @id @default(autoincrement())
  tenant_id                Int
  student_id               Int
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
  student                  Student  @relation(fields: [student_id], references: [student_id], onDelete: Cascade)

  @@unique([email_address, tenant_id], name: "uq_student_email_tenant")
  @@unique([student_id], where: { is_primary: true }, name: "uq_student_primary_email")
  @@index([student_id, is_primary], name: "idx_student_email_primary")
  @@map("student_email_addresses")
}

model StudentPhoneNumber {
  student_phone_number_id  Int      @id @default(autoincrement())
  tenant_id                Int
  student_id               Int
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
  student                  Student  @relation(fields: [student_id], references: [student_id], onDelete: Cascade)

  @@unique([dial_code, phone_number, tenant_id], name: "uq_student_phone_tenant")
  @@unique([student_id], where: { is_primary: true }, name: "uq_student_primary_phone")
  @@index([student_id, is_primary], name: "idx_student_phone_primary")
  @@map("student_phone_numbers")
}

model StudentDevice {
  student_device_id        Int      @id @default(autoincrement())
  tenant_id                Int
  student_id               Int
  device_type              Int      // 1: IOS, 2: ANDROID, 3: WEB, 4: DESKTOP
  device_identifier        String   @db.VarChar(255)
  device_ip                String?  @db.VarChar(45)
  mac_address              String?  @db.VarChar(17)
  is_primary               Boolean  @default(false)
  last_active_at           DateTime @default(now())
  
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
  student                  Student  @relation(fields: [student_id], references: [student_id], onDelete: Cascade)

  @@unique([device_identifier, student_id], name: "uq_device_identifier_student")
  @@unique([student_id], where: { is_primary: true }, name: "uq_student_primary_device")
  @@index([student_id, is_active, last_active_at], name: "idx_student_device_active")
  @@index([device_type, tenant_id], name: "idx_student_device_type")
  @@map("student_devices")
}
```

### Key Schema Design Decisions

1. **Multi-tenant Isolation**: All tables include `tenant_id` with appropriate indexes
2. **Partial Unique Constraints**: Used for primary email/phone/device constraints with conditions
3. **Audit Trail**: Complete audit fields on all entities
4. **Soft Deletion**: `is_deleted` flag for data retention
5. **Performance Indexes**: Comprehensive indexing strategy for common queries
6. **Referential Integrity**: Appropriate foreign key constraints with CASCADE/RESTRICT policies
7. **Snake Case Naming**: All table and column names use snake_case convention
8. **Pluralized Table Names**: All tables use plural forms for consistency
9. **Cascading Deletes**: Contact information and devices cascade delete with student removal

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
    "constraint": "uq_student_username_tenant",
    "field": "username",
    "value": "john.doe"
  }
}
```

**Primary Email Constraint (409)**
```json
{
  "statusCode": 409,
  "message": "Student already has a primary email address",
  "errorCode": "PRIMARY_EMAIL_EXISTS",
  "details": {
    "constraint": "uq_student_primary_email",
    "student_id": 123
  }
}
```

#### Validation Errors

**Invalid Age Range (400)**
```json
{
  "statusCode": 400,
  "message": "Age must be between 5-120 when provided",
  "errorCode": "INVALID_AGE_RANGE",
  "details": {
    "field": "age",
    "value": 150,
    "constraint": "chk_age_range"
  }
}
```

**Invalid Device MAC Address (400)**
```json
{
  "statusCode": 400,
  "message": "MAC address must be in valid format (XX:XX:XX:XX:XX:XX)",
  "errorCode": "INVALID_MAC_ADDRESS_FORMAT",
  "details": {
    "field": "mac_address",
    "value": "invalid-mac",
    "constraint": "chk_mac_address_format"
  }
}
```

## 6. Security Considerations

### Authentication and Authorization

#### JWT-Based Authentication
- All authenticated endpoints require valid JWT tokens in Authorization header
- Token structure follows `TAuthResponse` from `api.types.ts`
- Tokens include tenant context for multi-tenant isolation
- Separate token scopes for students and administrators

#### Role-Based Access Control (RBAC)
- **Admin Role**: Full CRUD access to all student management endpoints
- **Student Role**: Read/update access to own profile and contact data
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

#### Device Tracking Security
- Device identifiers hashed for privacy protection
- MAC addresses and IP addresses stored with encryption
- Device registration limited per student (configurable maximum: 5 devices)
- Automatic device cleanup for inactive devices (90+ days)

### Input Validation and Sanitization

#### Comprehensive Validation
- Username length: 3-50 characters (trimmed)
- Full name length: 2-255 characters (trimmed)
- Email format validation with RFC compliance
- Phone number format validation with international support
- ZIP code alphanumeric validation (3-20 characters)
- Device identifier length: 10-255 characters

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
- Device registration: 3 new devices per hour per student
- Search endpoints: 100 requests per minute per user

#### Student Profile Protection
- Profile updates limited to 10 per hour per student
- Contact information updates limited to 5 per day per student
- Device registration alerts for suspicious patterns

### Audit and Monitoring

#### Comprehensive Audit Trail
- All operations logged with user, IP, and timestamp
- Sensitive operations (profile updates, device registration) require reason codes
- Contact information changes maintained permanently
- Failed authentication attempts logged and monitored

#### Security Monitoring
- Suspicious login pattern detection
- Multiple device registration alerts
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
- Student status transition validation
- Geographic data consistency enforcement
- Contact information format validation
- Device registration limits and validation

### Import Strategy
All type imports use `@shared/types/` path strategy:
```typescript
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
  StudentStatusName,
  DeviceType
} from '@shared/types/student.types';
import { 
  SystemUser
} from '@shared/types/user.types';
import { 
  Tenant
} from '@shared/types/tenant.types';
import { 
  MultiTenantAuditFields,
  MinimalAuditFields 
} from '@shared/types/base.types';
import { 
  TApiSuccessResponse, 
  TApiErrorResponse 
} from '@shared/types/api.types';
```