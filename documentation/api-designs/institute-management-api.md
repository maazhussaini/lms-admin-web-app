# Institute Management API Design

## Introduction

The Institute Management API provides comprehensive functionality for managing educational institutions and their student associations within the Learning Management System (LMS). This API is designed with multi-tenant architecture, ensuring complete data isolation between different educational institutions while maintaining robust security and audit capabilities.

The API handles institute creation, profile management, and student-institute associations. All operations are performed within the context of a specific tenant, ensuring data security and compliance with educational privacy requirements.

## Data Model Overview

### Core Entities

The Institute Management domain consists of the following main entities defined in `@shared/types/student.types.ts`:

- **institutes**: Educational institutions within tenants with comprehensive profile information
- **student_institutes**: Many-to-many relationship between students and institutes for flexible associations

### Key Enums

From `@/types/enums.types.ts`:

- **StudentStatus**: `ACTIVE`, `ALUMNI`, `DROPOUT`, `ACCOUNT_FREEZED`, `BLACKLISTED`, `SUSPENDED`, `DEACTIVATED`

### Base Interfaces

All entities extend `MultiTenantAuditFields` from `@shared/types/base.types.ts`, providing:
- Tenant isolation (`tenant_id`)
- Comprehensive audit trail (`created_at`, `created_by`, `updated_at`, `updated_by`)
- Soft deletion capabilities (`is_active`, `is_deleted`, `deleted_at`, `deleted_by`)
- IP tracking for security (`created_ip`, `updated_ip`)

## API Endpoints

### Institute Management

#### Create Institute
- **Method**: `POST`
- **Path**: `/api/v1/admin/institutes`
- **Authorization**: SUPER_ADMIN, TENANT_ADMIN
- **Description**: Create a new institute with proper authorization checks
- **Request Body**:
```json
{
  "institute_name": "Harvard University"
}
```
- **Response**: `201 Created`
```json
{
  "success": true,
  "data": {
    "institute_id": 1,
    "institute_name": "Harvard University",
    "tenant_id": 123,
    "created_at": "2024-01-01T00:00:00Z",
    "is_active": true,
    "is_deleted": false
  },
  "message": "Institute created successfully"
}
```

#### Get Institute by ID
- **Method**: `GET`
- **Path**: `/api/v1/admin/institutes/{instituteId}`
- **Authorization**: SUPER_ADMIN, TENANT_ADMIN
- **Description**: Retrieve a specific institute with proper authorization checks
- **Response**: `200 OK`
```json
{
  "success": true,
  "data": {
    "institute_id": 1,
    "institute_name": "Harvard University",
    "tenant_id": 123,
    "created_at": "2024-01-01T00:00:00Z",
    "is_active": true,
    "is_deleted": false
  }
}
```

#### List All Institutes
- **Method**: `GET`
- **Path**: `/api/v1/admin/institutes`
- **Authorization**: SUPER_ADMIN, TENANT_ADMIN
- **Description**: Retrieve institutes with pagination and filtering (tenant-scoped for TENANT_ADMIN)
- **Query Parameters**:
  - `page?: number` - Page number (default: 1)
  - `limit?: number` - Items per page (default: 10, max: 100)
  - `search?: string` - Search in institute_name
  - `sortBy?: string` - Sort by field (institute_id, institute_name, created_at, updated_at)
  - `sortOrder?: string` - Sort order (asc, desc)
- **Response**: `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "institute_id": 1,
      "institute_name": "Harvard University",
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

#### Update Institute
- **Method**: `PATCH`
- **Path**: `/api/v1/admin/institutes/{instituteId}`
- **Authorization**: SUPER_ADMIN, TENANT_ADMIN
- **Description**: Update institute with proper authorization and validation
- **Request Body**:
```json
{
  "institute_name": "Harvard University Updated"
}
```
- **Response**: `200 OK`

#### Delete Institute
- **Method**: `DELETE`
- **Path**: `/api/v1/admin/institutes/{instituteId}`
- **Authorization**: SUPER_ADMIN, TENANT_ADMIN
- **Description**: Soft delete an institute
- **Response**: `204 No Content`

### Student-Institute Association Management

#### Get Institute Students
- **Method**: `GET`
- **Path**: `/api/v1/admin/institutes/{instituteId}/students`
- **Authorization**: SUPER_ADMIN, TENANT_ADMIN
- **Description**: Get all students associated with an institute
- **Query Parameters**:
  - `page?: number` - Page number (default: 1)
  - `limit?: number` - Items per page (default: 20, max: 100)
  - `search?: string` - Search in student full_name
  - `status?: StudentStatus` - Filter by student status
- **Response**: `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "student_id": 456,
      "full_name": "John Michael Doe",
      "email_address": "john.doe@example.com",
      "student_status": "ACTIVE",
      "tenant_id": 123,
      "association": {
        "student_institute_id": 789,
        "created_at": "2024-01-01T00:00:00Z"
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 1,
    "totalPages": 1,
    "hasNext": false,
    "hasPrev": false
  }
}
```

#### Add Student to Institute
- **Method**: `POST`
- **Path**: `/api/v1/admin/institutes/{instituteId}/students`
- **Authorization**: SUPER_ADMIN, TENANT_ADMIN
- **Description**: Add a student to an institute
- **Request Body**:
```json
{
  "student_id": 456
}
```
- **Response**: `201 Created`
```json
{
  "success": true,
  "data": {
    "student_institute_id": 789,
    "institute_id": 1,
    "student_id": 456,
    "tenant_id": 123,
    "created_at": "2024-01-01T00:00:00Z",
    "is_active": true,
    "is_deleted": false
  },
  "message": "Student added to institute successfully"
}
```

#### Remove Student from Institute
- **Method**: `DELETE`
- **Path**: `/api/v1/admin/institutes/{instituteId}/students/{studentId}`
- **Authorization**: SUPER_ADMIN, TENANT_ADMIN
- **Description**: Remove student from institute (soft delete association)
- **Response**: `204 No Content`

### Student Institute Access

#### Get Student Institutes
- **Method**: `GET`
- **Path**: `/api/v1/student/institutes`
- **Authorization**: Student JWT Token
- **Description**: Retrieve institutes the authenticated student is associated with
- **Response**: `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "institute_id": 1,
      "institute_name": "Harvard University",
      "association": {
        "student_institute_id": 789,
        "created_at": "2024-01-01T00:00:00Z"
      }
    }
  ]
}
```

#### Get Institute Details (Student)
- **Method**: `GET`
- **Path**: `/api/v1/student/institutes/{instituteId}`
- **Authorization**: Student JWT Token
- **Description**: Retrieve specific institute details for authenticated student
- **Response**: `200 OK`
```json
{
  "success": true,
  "data": {
    "institute_id": 1,
    "institute_name": "Harvard University",
    "tenant_id": 123
  }
}
```

### Teacher Institute Access

#### Get Teacher Institutes
- **Method**: `GET`
- **Path**: `/api/v1/teacher/institutes`
- **Authorization**: Teacher JWT Token
- **Description**: Retrieve institutes for authenticated teacher's courses
- **Response**: `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "institute_id": 1,
      "institute_name": "Harvard University"
    }
  ]
}
```

#### Get Institute Students (Teacher)
- **Method**: `GET`
- **Path**: `/api/v1/teacher/institutes/{instituteId}/students`
- **Authorization**: Teacher JWT Token
- **Description**: Retrieve students from institute in teacher's courses
- **Query Parameters**:
  - `courseId?: number` - Filter by specific course
  - `page?: number` - Page number (default: 1)
  - `limit?: number` - Items per page (default: 20, max: 100)
- **Response**: `200 OK`

## Authorization Rules

### SUPER_ADMIN Permissions
- Can create, read, update, and delete any institute across all tenants
- Can manage student-institute associations across all tenants
- Can access institute data across all organizations
- Global scope operations

### TENANT_ADMIN Permissions
- Can only manage institutes within their own tenant
- Can create, read, update, and soft delete institutes in their tenant
- Can manage student-institute associations for their tenant only
- Cannot access institutes from other tenants
- Tenant-scoped operations only

### Teacher Permissions
- Can read institutes related to their assigned courses
- Can view students from institutes in their courses
- Cannot modify institute data or associations
- Can access institute-specific data for assigned courses

### Student Permissions
- Can read institutes they are associated with
- Can view their own institute associations
- Cannot modify institute data or associations
- Can only access institutes they are enrolled in

## Validation Rules

### Institute Validation
- **institute_name**: Required, 2-255 characters, string type

### Association Validation
- **student_id**: Must be valid existing student within tenant
- **institute_id**: Must be valid existing institute within tenant
- **unique_association**: Student-institute combination must be unique per tenant

## Prisma Schema Implementation

### Institute Model
```prisma
model Institute {
  institute_id         Int             @id @default(autoincrement())
  tenant_id            Int
  institute_name       String          @db.VarChar(255)
  
  // Enhanced audit fields
  is_active            Boolean         @default(true)
  is_deleted           Boolean         @default(false)
  created_at           DateTime        @default(now())
  updated_at           DateTime        @updatedAt
  created_by           Int
  updated_by           Int?
  deleted_at           DateTime?
  deleted_by           Int?
  created_ip           String?         @db.VarChar(45)
  updated_ip           String?         @db.VarChar(45)

  // Relationships
  tenant               Tenant          @relation(fields: [tenant_id], references: [tenant_id], onDelete: Restrict)
  student_institutes   StudentInstitute[]
  enrollments          Enrollment[]
  
  // Audit trail relationships with SystemUser
  created_by_user      SystemUser      @relation("InstituteCreatedBy", fields: [created_by], references: [system_user_id], onDelete: Restrict)
  updated_by_user      SystemUser?     @relation("InstituteUpdatedBy", fields: [updated_by], references: [system_user_id], onDelete: SetNull)
  deleted_by_user      SystemUser?     @relation("InstituteDeletedBy", fields: [deleted_by], references: [system_user_id], onDelete: SetNull)

  @@map("institutes")
}
```

### StudentInstitute Model
```prisma
model StudentInstitute {
  student_institute_id Int             @id @default(autoincrement())
  tenant_id            Int
  student_id           Int
  institute_id         Int
  
  // Enhanced audit fields
  is_active            Boolean         @default(true)
  is_deleted           Boolean         @default(false)
  created_at           DateTime        @default(now())
  updated_at           DateTime        @updatedAt
  created_by           Int
  updated_by           Int?
  deleted_at           DateTime?
  deleted_by           Int?
  created_ip           String?         @db.VarChar(45)
  updated_ip           String?         @db.VarChar(45)

  // Relationships
  tenant               Tenant          @relation(fields: [tenant_id], references: [tenant_id], onDelete: Restrict)
  student              Student         @relation(fields: [student_id], references: [student_id], onDelete: Cascade)
  institute            Institute       @relation(fields: [institute_id], references: [institute_id], onDelete: Cascade)
  
  // Audit trail relationships with SystemUser
  created_by_user      SystemUser      @relation("StudentInstituteCreatedBy", fields: [created_by], references: [system_user_id], onDelete: Restrict)
  updated_by_user      SystemUser?     @relation("StudentInstituteUpdatedBy", fields: [updated_by], references: [system_user_id], onDelete: SetNull)
  deleted_by_user      SystemUser?     @relation("StudentInstituteDeletedBy", fields: [deleted_by], references: [system_user_id], onDelete: SetNull)

  @@map("student_institutes")
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
    "field": "institute_name",
    "reason": "Institute name already exists within tenant"
  }
}
```

### Common Error Scenarios

#### Authorization Errors
- **403 FORBIDDEN**: "You can only manage institutes within your own tenant"
- **403 FORBIDDEN**: "Students can only access associated institutes"
- **403 FORBIDDEN**: "Teachers can only access institutes related to their courses"

#### Validation Errors
- **409 CONFLICT**: "Institute with this name already exists in this tenant" (errorCode: "DUPLICATE_INSTITUTE_NAME")
- **409 CONFLICT**: "Student already associated with this institute" (errorCode: "DUPLICATE_STUDENT_INSTITUTE_ASSOCIATION")
- **400 BAD_REQUEST**: "Institute name cannot be empty"
- **400 BAD_REQUEST**: "Valid student ID is required"

#### Not Found Errors
- **404 NOT_FOUND**: "Institute with ID {instituteId} not found" (errorCode: "INSTITUTE_NOT_FOUND")
- **404 NOT_FOUND**: "Student not found" (errorCode: "STUDENT_NOT_FOUND")
- **404 NOT_FOUND**: "Student-institute association not found" (errorCode: "ASSOCIATION_NOT_FOUND")

#### Business Logic Errors
- **422 UNPROCESSABLE_ENTITY**: "Cannot delete institute with active enrollments"
- **422 UNPROCESSABLE_ENTITY**: "Student not found in tenant"
- **422 UNPROCESSABLE_ENTITY**: "Cannot associate student from another tenant"

## Security Considerations

### Authentication & Authorization
- **JWT-based Authentication**: Required for all endpoints
- **Role-Based Access Control**: SUPER_ADMIN vs TENANT_ADMIN vs Teacher vs Student permissions
- **Tenant Isolation**: Strict enforcement except for SUPER_ADMIN operations
- **Association Management**: Controlled access to student-institute relationships

### Data Protection
- **Institute Name Uniqueness**: Per-tenant uniqueness validation
- **Student Data Privacy**: Tenant-scoped access controls
- **Association Security**: Controlled creation and removal of student-institute links
- **Academic Privacy**: Protection of student-institute relationships

### Input Validation and Sanitization
- **Comprehensive Validation**: All fields validated using express-validator
- **SQL Injection Prevention**: Parameterized queries through Prisma ORM
- **XSS Protection**: HTML encoding for all text outputs
- **Institute Name Sanitization**: Proper validation and trimming

### Rate Limiting and Abuse Prevention
- **API Rate Limiting**: 1000 requests per hour per tenant
- **Authentication Endpoints**: 5 attempts per minute per IP
- **Institute Creation**: Limited creation rate for TENANT_ADMIN
- **Association Operations**: 50 per hour per admin

### Audit and Monitoring
- **Comprehensive Audit Trail**: All operations logged with user, IP, and timestamp
- **Institute Data Changes**: Critical changes logged and monitored
- **Association Changes**: Student-institute relationship changes tracked
- **Failed Authentication**: Monitoring and alerting
- **Cross-tenant Access**: Attempt logging and blocking

### Business Rules Enforcement
- **Institute Name Uniqueness**: Per-tenant institute name validation
- **Student Association**: Valid student-institute relationship enforcement
- **Academic Integrity**: Institute association validation
- **Data Consistency**: Institute and association integrity maintained

## Implementation Patterns

### Service Layer Pattern
```typescript
// Example from institute.service.ts
async createInstitute(
  data: CreateInstituteDto,
  requestingUser: TokenPayload,
  ip?: string
): Promise<Institute> {
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
    instituteId,
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
body('institute_name')
  .exists().withMessage('Institute name is required')
  .isString().withMessage('Institute name must be a string')
  .notEmpty().withMessage('Institute name cannot be empty')
  .trim()
  .isLength({ min: 2, max: 255 }).withMessage('Institute name must be between 2 and 255 characters')
```

### Controller Implementation
```typescript
// Using createRouteHandler for consistent response handling
static createInstituteHandler = createRouteHandler(
  async (req: AuthenticatedRequest) => {
    if (!req.user) {
      throw new ApiError('Authentication required', 401, 'AUTHENTICATION_REQUIRED');
    }

    const instituteData = req.validatedData as CreateInstituteDto;
    const requestingUser = req.user;
    
    return await instituteService.createInstitute(
      instituteData, 
      requestingUser, 
      req.ip || undefined
    );
  },
  {
    statusCode: 201,
    message: 'Institute created successfully'
  }
);
```

## Import Strategy

All imports use configured path aliases:

```typescript
// Shared types
import { 
  Institute,
  StudentInstitute,
  StudentStatus
} from '@shared/types/student.types';

// Enums
import { 
  StudentStatus,
  UserType
} from '@/types/enums';

// Internal modules
import { CreateInstituteDto, UpdateInstituteDto } from '@/dtos/institute/institute.dto';
import { InstituteService } from '@/services/institute.service';
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

Based on the core entities relationships, the institute management domain has the following key foreign key constraints:

- **institutes.tenant_id** → **tenants.tenant_id** (Required for all institutes)
- **institutes.created_by** → **system_users.system_user_id** (Audit trail)
- **student_institutes.institute_id** → **institutes.institute_id** (Cascade delete)
- **student_institutes.student_id** → **students.student_id** (Cascade delete)
- **student_institutes.tenant_id** → **tenants.tenant_id** (Required tenant association)
- **enrollments.institute_id** → **institutes.institute_id** (Restrict delete - preserve enrollment history)

All entities include comprehensive audit trail relationships where system users can create, update, and delete records with proper foreign key constraints and cascade behaviors.

## Data Constraints and Business Rules

### Unique Constraints
- **institute_name + tenant_id**: Institute names must be unique per tenant
- **student_id + institute_id**: Student-institute associations must be unique

### Check Constraints
- **institute_name**: 2-255 characters, non-empty after trimming

### Association Rules
- **Student-Institute**: Students can be associated with multiple institutes within the same tenant
- **Cross-Tenant**: Students cannot be associated with institutes from other tenants
- **Enrollment Dependency**: Institute deletion restricted if active enrollments exist

### Academic Integrity Rules
- **Tenant Isolation**: Institute associations strictly tenant-scoped
- **Student Validation**: Only active students can be associated with institutes
- **Data Consistency**: Institute-enrollment relationship integrity maintained
- **Audit Trail**: Complete tracking of all institute and association changes