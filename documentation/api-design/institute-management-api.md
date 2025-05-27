# Institute Management API Design

## 1. Introduction

The Institute Management API provides comprehensive functionality for managing educational institutions and their associations with students within the Learning Management System (LMS). This API is designed with multi-tenant architecture, ensuring complete data isolation between different educational institutions while maintaining robust security and audit capabilities.

The API handles institute creation, management, and student-institute associations. All operations are performed within the context of a specific tenant, ensuring data security and compliance with educational privacy requirements.

## 2. Data Model Overview

### Core Institute Entities

The institute management system is built around several key entities:

- **institutes** (`@shared/types/student.types.ts`): Educational institutions with multi-tenant isolation
- **student_institute_associations**: Many-to-many relationship between students and institutes
- **enrollment_integrations**: Institute context for all course enrollments

### Key Features

- Multi-tenant institute management
- Student-institute association tracking
- Integration with enrollment system
- Comprehensive audit trails

### Audit and Multi-tenancy

All entities extend `MultiTenantAuditFields` from `base.types.ts`, providing:
- Tenant isolation (`tenant_id`)
- Comprehensive audit trail (`created_at`, `created_by`, `updated_at`, `updated_by`)
- Soft deletion capabilities (`is_active`, `is_deleted`)
- IP tracking for security (`created_ip`, `updated_ip`)

## 3. API Endpoints

### 3.1 Institute Management

#### Institute Operations

**GET /api/admin/institutes**
- Description: Retrieve paginated list of institutes with filtering
- Query Parameters:
  - `page` (number): Page number (default: 1)
  - `limit` (number): Items per page (default: 20, max: 100)
  - `search` (string): Search by institute name
  - `is_active` (boolean): Filter by active status
- Response: `TApiSuccessResponse<{ institutes: Institute[], total: number, page: number, limit: number }>`
- Status Code: 200

**GET /api/admin/institutes/{institute_id}**
- Description: Retrieve detailed institute information
- Path Parameters:
  - `institute_id` (number): Institute identifier
- Response: `TApiSuccessResponse<Institute>`
- Status Code: 200

**POST /api/admin/institutes**
- Description: Create new institute
- Request Body:
```typescript
{
  institute_name: string;
}
```
- Response: `TApiSuccessResponse<Institute>`
- Status Code: 201

**PATCH /api/admin/institutes/{institute_id}**
- Description: Update institute information
- Path Parameters:
  - `institute_id` (number): Institute identifier
- Request Body:
```typescript
{
  institute_name?: string;
}
```
- Response: `TApiSuccessResponse<Institute>`
- Status Code: 200

**DELETE /api/admin/institutes/{institute_id}**
- Description: Soft delete institute (sets is_deleted = true)
- Path Parameters:
  - `institute_id` (number): Institute identifier
- Response: `TApiSuccessResponse<{ message: string }>`
- Status Code: 200

### 3.2 Student-Institute Association Management

#### Association Operations

**GET /api/admin/institutes/{institute_id}/students**
- Description: Retrieve students associated with institute
- Path Parameters:
  - `institute_id` (number): Institute identifier
- Query Parameters:
  - `page` (number): Page number (default: 1)
  - `limit` (number): Items per page (default: 20, max: 100)
  - `is_active` (boolean): Filter by active associations
  - `search` (string): Search by student name
- Response: `TApiSuccessResponse<{ associations: StudentInstitute[], total: number, page: number, limit: number }>`
- Status Code: 200

**POST /api/admin/institutes/{institute_id}/students**
- Description: Associate student with institute
- Path Parameters:
  - `institute_id` (number): Institute identifier
- Request Body:
```typescript
{
  student_id: number;
}
```
- Response: `TApiSuccessResponse<StudentInstitute>`
- Status Code: 201

**DELETE /api/admin/institutes/{institute_id}/students/{student_id}**
- Description: Remove student association from institute
- Path Parameters:
  - `institute_id` (number): Institute identifier
  - `student_id` (number): Student identifier
- Response: `TApiSuccessResponse<{ message: string }>`
- Status Code: 200

**GET /api/admin/students/{student_id}/institutes**
- Description: Retrieve institutes associated with student
- Path Parameters:
  - `student_id` (number): Student identifier
- Query Parameters:
  - `is_active` (boolean): Filter by active associations
- Response: `TApiSuccessResponse<StudentInstitute[]>`
- Status Code: 200

**POST /api/admin/students/{student_id}/institutes**
- Description: Associate institute with student
- Path Parameters:
  - `student_id` (number): Student identifier
- Request Body:
```typescript
{
  institute_id: number;
}
```
- Response: `TApiSuccessResponse<StudentInstitute>`
- Status Code: 201

### 3.3 Institute Analytics and Reporting

#### Institute Statistics

**GET /api/admin/institutes/{institute_id}/analytics/overview**
- Description: Get institute statistics overview
- Path Parameters:
  - `institute_id` (number): Institute identifier
- Query Parameters:
  - `date_from` (string): Filter by date range
  - `date_to` (string): Filter by date range
- Response: `TApiSuccessResponse<{ total_students: number, active_enrollments: number, completed_enrollments: number, completion_rate: number }>`
- Status Code: 200

**GET /api/admin/institutes/{institute_id}/analytics/enrollments**
- Description: Get enrollment analytics for institute
- Path Parameters:
  - `institute_id` (number): Institute identifier
- Query Parameters:
  - `period` (string): 'daily', 'weekly', 'monthly'
  - `date_from` (string): Filter by date range
  - `date_to` (string): Filter by date range
- Response: `TApiSuccessResponse<Array<{ period: string, new_enrollments: number, completed_enrollments: number }>>`
- Status Code: 200

**GET /api/admin/institutes/{institute_id}/enrollments**
- Description: Get all enrollments for institute
- Path Parameters:
  - `institute_id` (number): Institute identifier
- Query Parameters:
  - `page` (number): Page number (default: 1)
  - `limit` (number): Items per page (default: 20, max: 100)
  - `status` (EnrollmentStatus): Filter by enrollment status
  - `course_id` (number): Filter by course
  - `student_id` (number): Filter by student
- Response: `TApiSuccessResponse<{ enrollments: Enrollment[], total: number, page: number, limit: number }>`
- Status Code: 200

### 3.4 Bulk Operations

#### Bulk Association Management

**POST /api/admin/institutes/{institute_id}/students/bulk**
- Description: Associate multiple students with institute
- Path Parameters:
  - `institute_id` (number): Institute identifier
- Request Body:
```typescript
{
  student_ids: number[];
}
```
- Response: `TApiSuccessResponse<{ created: StudentInstitute[], failed: Array<{ student_id: number, error: string }> }>`
- Status Code: 201

**DELETE /api/admin/institutes/{institute_id}/students/bulk**
- Description: Remove multiple student associations from institute
- Path Parameters:
  - `institute_id` (number): Institute identifier
- Request Body:
```typescript
{
  student_ids: number[];
}
```
- Response: `TApiSuccessResponse<{ removed: number, failed: Array<{ student_id: number, error: string }> }>`
- Status Code: 200

### 3.5 Institute Search and Discovery

#### Search Operations

**GET /api/admin/institutes/search**
- Description: Advanced institute search with multiple filters
- Query Parameters:
  - `q` (string): Search query
  - `page` (number): Page number (default: 1)
  - `limit` (number): Items per page (default: 20, max: 100)
  - `has_students` (boolean): Filter institutes with/without students
  - `student_count_min` (number): Minimum student count
  - `student_count_max` (number): Maximum student count
- Response: `TApiSuccessResponse<{ institutes: Institute[], total: number, page: number, limit: number }>`
- Status Code: 200

**GET /api/admin/institutes/lookup**
- Description: Simple institute lookup for dropdowns
- Query Parameters:
  - `q` (string): Search query (minimum 2 characters)
  - `limit` (number): Maximum results (default: 10, max: 50)
- Response: `TApiSuccessResponse<Array<{ institute_id: number, institute_name: string }>>`
- Status Code: 200

### 3.6 Student Self-Service Endpoints

**GET /api/student/institutes**
- Description: Retrieve authenticated student's institute associations
- Headers: `Authorization: Bearer <jwt_token>`
- Response: `TApiSuccessResponse<StudentInstitute[]>`
- Status Code: 200

**GET /api/student/institutes/{institute_id}**
- Description: Retrieve specific institute details for authenticated student
- Headers: `Authorization: Bearer <jwt_token>`
- Path Parameters:
  - `institute_id` (number): Institute identifier
- Response: `TApiSuccessResponse<Institute>`
- Status Code: 200

### 3.7 Teacher Institute Access

**GET /api/teacher/institutes**
- Description: Retrieve institutes for authenticated teacher's courses
- Headers: `Authorization: Bearer <jwt_token>`
- Response: `TApiSuccessResponse<Institute[]>`
- Status Code: 200

**GET /api/teacher/institutes/{institute_id}/students**
- Description: Retrieve students from institute in teacher's courses
- Headers: `Authorization: Bearer <jwt_token>`
- Path Parameters:
  - `institute_id` (number): Institute identifier
- Query Parameters:
  - `course_id` (number): Filter by specific course
- Response: `TApiSuccessResponse<StudentInstitute[]>`
- Status Code: 200

## 4. Prisma Schema Considerations

### Database Schema Mapping

#### Institute Tables
```prisma
model Institute {
  institute_id             Int                @id @default(autoincrement())
  tenant_id                Int
  institute_name           String             @db.VarChar(255)
  
  // Audit fields
  is_active                Boolean            @default(true)
  is_deleted               Boolean            @default(false)
  created_at               DateTime           @default(now())
  created_by               Int
  created_ip               String             @db.VarChar(45)
  updated_at               DateTime?          @updatedAt
  updated_by               Int?
  updated_ip               String?            @db.VarChar(45)

  // Relationships
  tenant                   Tenant             @relation(fields: [tenant_id], references: [tenant_id])
  student_associations     StudentInstitute[]
  enrollments              Enrollment[]

  @@unique([institute_name, tenant_id], name: "uq_institute_name_tenant")
  @@index([institute_name, tenant_id], name: "idx_institute_name_search")
  @@index([tenant_id, is_active], name: "idx_institute_tenant_active")
  @@map("institutes")
}

model StudentInstitute {
  student_institute_id     Int       @id @default(autoincrement())
  tenant_id                Int
  student_id               Int
  institute_id             Int
  
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
  student                  Student   @relation(fields: [student_id], references: [student_id], onDelete: Cascade)
  institute                Institute @relation(fields: [institute_id], references: [institute_id], onDelete: Cascade)

  @@unique([student_id, institute_id], name: "uq_student_institute_association")
  @@index([student_id, institute_id], name: "idx_student_institute_lookup")
  @@index([institute_id, tenant_id], name: "idx_institute_student_lookup")
  @@map("student_institutes")
}
```

### Key Schema Design Decisions

1. **Multi-tenant Isolation**: All tables include `tenant_id` with appropriate indexes
2. **Unique Institute Names**: Institute names must be unique within tenant
3. **Cascading Deletes**: Student-institute associations cascade delete when either entity is deleted
4. **Audit Trail**: Complete audit fields on all entities
5. **Soft Deletion**: `is_deleted` flag for data retention
6. **Performance Indexes**: Optimized for common query patterns
7. **Snake Case Naming**: All table and column names use snake_case convention
8. **Pluralized Table Names**: All tables use plural forms for consistency

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

**Institute Name Uniqueness (409)**
```json
{
  "statusCode": 409,
  "message": "Institute name already exists within this tenant",
  "errorCode": "INSTITUTE_NAME_CONFLICT",
  "details": {
    "constraint": "uq_institute_name_tenant",
    "field": "institute_name",
    "value": "ABC University"
  }
}
```

**Duplicate Student Association (409)**
```json
{
  "statusCode": 409,
  "message": "Student is already associated with this institute",
  "errorCode": "DUPLICATE_STUDENT_ASSOCIATION",
  "details": {
    "constraint": "uq_student_institute_association",
    "student_id": 123,
    "institute_id": 456
  }
}
```

#### Validation Errors

**Invalid Institute Name (400)**
```json
{
  "statusCode": 400,
  "message": "Institute name must be between 2 and 255 characters",
  "errorCode": "INVALID_INSTITUTE_NAME",
  "details": {
    "field": "institute_name",
    "value": "A",
    "min_length": 2,
    "max_length": 255
  }
}
```

#### Business Logic Errors

**Institute With Active Enrollments (422)**
```json
{
  "statusCode": 422,
  "message": "Cannot delete institute with active enrollments",
  "errorCode": "INSTITUTE_HAS_ACTIVE_ENROLLMENTS",
  "details": {
    "institute_id": 456,
    "active_enrollments": 25
  }
}
```

**Student Not Found (404)**
```json
{
  "statusCode": 404,
  "message": "Student not found or not accessible",
  "errorCode": "STUDENT_NOT_FOUND",
  "details": {
    "student_id": 789
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
- **Admin Role**: Full CRUD access to all institute management endpoints
- **Teacher Role**: Read-only access to institutes with enrolled students in their courses
- **Student Role**: Read-only access to own institute associations
- **Tenant Isolation**: All operations automatically filtered by tenant_id

### Data Protection and Privacy

#### Tenant Isolation
- All database queries automatically include tenant_id filtering
- Cross-tenant institute data access is strictly prohibited
- API responses never expose institute data from other tenants

#### Sensitive Data Handling
- Institute names and associations treated as educational records
- Complete audit trail for all association changes
- IP tracking for all institute operations
- Data retention policies for compliance

### Input Validation and Sanitization

#### Comprehensive Validation
- Institute name length: 2-255 characters (trimmed)
- Institute name format validation (no special characters)
- Student ID validation against tenant context
- Association uniqueness validation

#### SQL Injection Prevention
- Parameterized queries through Prisma ORM
- No dynamic SQL construction
- Input sanitization for all user-provided data

#### XSS Protection
- HTML encoding for institute names
- Content Security Policy headers
- Input sanitization for search queries

### Rate Limiting and Abuse Prevention

#### API Rate Limiting
- Global rate limit: 1000 requests per hour per tenant
- Institute creation: 20 per hour per admin user
- Association operations: 100 per hour per admin user
- Bulk operations: 5 per hour per admin user

#### Institute Protection
- Institute name change tracking
- Association change limits (50 per day per institute)
- Bulk association operations limited to 500 records
- Search query rate limiting

### Audit and Monitoring

#### Comprehensive Audit Trail
- All institute operations logged with user, IP, and timestamp
- Association changes tracked with complete history
- Institute name changes preserved in audit logs
- Failed operation attempts logged and monitored

#### Security Monitoring
- Suspicious association pattern detection
- Bulk operation monitoring and alerting
- Unauthorized institute access attempts
- Cross-tenant access attempt logging

#### Compliance Features
- FERPA compliance for educational institution records
- Complete association history preservation
- Data retention policies for audit trails
- Export capabilities for compliance reporting

### Additional Security Measures

#### HTTPS and Encryption
- TLS 1.3 required for all API communications
- Perfect Forward Secrecy (PFS) enabled
- Database connection encryption
- At-rest encryption for institute data

#### API Security Headers
- CORS policy configuration
- X-Frame-Options: DENY
- X-Content-Type-Options: nosniff
- Strict-Transport-Security headers

#### Business Logic Security
- Institute deletion validation
- Association consistency enforcement
- Enrollment context validation
- Access permission verification
- Data integrity checks

### Import Strategy
All type imports use `@shared/types/` path strategy:
```typescript
import { 
  Institute, 
  StudentInstitute,
  Enrollment,
  EnrollmentStatus,
  Student
} from '@shared/types/student.types';
import { 
  Course
} from '@shared/types/course.types';
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
  MultiTenantAuditFields 
} from '@shared/types/base.types';
import { 
  TApiSuccessResponse, 
  TApiErrorResponse 
} from '@shared/types/api.types';
```