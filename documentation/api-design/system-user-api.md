# System User Management API Design

## Introduction

The System User Management API provides comprehensive functionality for managing system-level users within the LMS platform. This API handles both SUPER_ADMIN users (global system administrators) and TENANT_ADMIN users (tenant-specific administrators), implementing role-based access control and tenant isolation patterns.

## Data Model Overview

### Core Entities

The System User domain consists of the following main entities defined in `@shared/types/system-users.types.ts`:

- **system_users**: Core user entity with conditional tenant isolation
- **roles**: System role definitions for access control
- **screens**: System screens/modules for permission management
- **user_screens**: Individual user permissions that override role permissions
- **role_screens**: Default role-based permissions

### Key Enums

From `@shared/types/system-users.types.ts`:

- **SystemUserRole**: `SUPER_ADMIN`, `TENANT_ADMIN`
- **SystemUserStatus**: `ACTIVE`, `INACTIVE`, `SUSPENDED`, `LOCKED`

### Base Interfaces

All entities extend `BaseAuditFields` from `@shared/types/base.types.ts`, providing:
- Audit trail fields (`created_at`, `created_by`, `updated_at`, `updated_by`)
- Soft delete support (`is_active`, `is_deleted`)
- IP tracking for security (`created_ip`, `updated_ip`)

## API Endpoints

### System User Management

#### Create System User
- **Method**: `POST`
- **Path**: `/api/v1/system-users`
- **Authorization**: SUPER_ADMIN, TENANT_ADMIN
- **Description**: Create a new system user with proper authorization checks
- **Request Body**:
```json
{
  "username": "admin_user",
  "fullName": "Administrator User",
  "email": "admin@example.com",
  "password": "SecurePassword123",
  "roleType": "TENANT_ADMIN",
  "tenantId": 123,
  "status": "ACTIVE"
}
```
- **Response**: `201 Created`
```json
{
  "success": true,
  "data": {
    "system_user_id": 1,
    "username": "admin_user",
    "full_name": "Administrator User",
    "email_address": "admin@example.com",
    "role_type": "TENANT_ADMIN",
    "tenant_id": 123,
    "system_user_status": "ACTIVE",
    "created_at": "2024-01-01T00:00:00Z",
    "is_active": true,
    "is_deleted": false
  },
  "message": "System user created successfully"
}
```

#### Get System User by ID
- **Method**: `GET`
- **Path**: `/api/v1/system-users/{userId}`
- **Authorization**: SUPER_ADMIN, TENANT_ADMIN
- **Description**: Retrieve a specific system user with proper authorization checks
- **Response**: `200 OK`
```json
{
  "success": true,
  "data": {
    "system_user_id": 1,
    "username": "admin_user",
    "full_name": "Administrator User",
    "email_address": "admin@example.com",
    "role_type": "TENANT_ADMIN",
    "tenant_id": 123,
    "system_user_status": "ACTIVE",
    "last_login_at": "2024-01-01T12:00:00Z",
    "login_attempts": 0
  }
}
```

#### List All System Users
- **Method**: `GET`
- **Path**: `/api/v1/system-users`
- **Authorization**: SUPER_ADMIN, TENANT_ADMIN
- **Description**: Retrieve system users with pagination and filtering (tenant-scoped for TENANT_ADMIN)
- **Query Parameters**:
  - `page?: number` - Page number (default: 1)
  - `limit?: number` - Items per page (default: 10)
  - `roleType?: SystemUserRole` - Filter by role
  - `status?: SystemUserStatus` - Filter by status
  - `tenantId?: number` - Filter by tenant (SUPER_ADMIN only)
  - `search?: string` - Search in username, full_name, email_address
- **Response**: `200 OK`
```json
{
  "success": true,
  "data": {
    "users": [
      {
        "system_user_id": 1,
        "username": "admin_user",
        "full_name": "Administrator User",
        "email_address": "admin@example.com",
        "role_type": "TENANT_ADMIN",
        "tenant_id": 123,
        "system_user_status": "ACTIVE",
        "last_login_at": "2024-01-01T12:00:00Z"
      }
    ],
    "total": 1
  }
}
```

#### Update System User
- **Method**: `PATCH`
- **Path**: `/api/v1/system-users/{userId}`
- **Authorization**: SUPER_ADMIN, TENANT_ADMIN
- **Description**: Update system user with proper authorization and validation
- **Request Body**:
```json
{
  "fullName": "Updated Administrator",
  "email": "updated@example.com",
  "status": "INACTIVE",
  "password": "NewSecurePassword123"
}
```
- **Response**: `200 OK`

#### Delete System User
- **Method**: `DELETE`
- **Path**: `/api/v1/system-users/{userId}`
- **Authorization**: SUPER_ADMIN, TENANT_ADMIN
- **Description**: Soft delete a system user (users cannot delete themselves)
- **Response**: `204 No Content`

### Authorization Rules

#### SUPER_ADMIN Permissions
- Can create, read, update, and delete any system user
- Can create both SUPER_ADMIN and TENANT_ADMIN users
- Can manage users across all tenants
- Global scope operations

#### TENANT_ADMIN Permissions
- Can only manage users within their own tenant
- Cannot create SUPER_ADMIN users
- Cannot manage SUPER_ADMIN users
- Cannot update user roles to SUPER_ADMIN
- Tenant-scoped operations only

### Validation Rules

#### Username Validation
- Required field
- 3-50 characters length
- String type
- Unique within tenant scope (global for SUPER_ADMIN)

#### Email Validation
- Required field
- Valid email format (RFC 5322)
- Maximum 255 characters
- Unique within tenant scope (global for SUPER_ADMIN)
- Normalized (gmail_remove_dots: false)

#### Password Validation
- Required for creation
- 8-100 characters length
- Hashed using bcrypt before storage

#### Role Type Validation
- Must be valid SystemUserRole enum value
- SUPER_ADMIN cannot have tenantId
- TENANT_ADMIN must have tenantId

## Prisma Schema Implementation

### SystemUser Model
```prisma
model SystemUser {
  system_user_id    Int               @id @default(autoincrement())
  tenant_id         Int?              // NULL for SUPER_ADMIN
  role_type         SystemUserRole    // Direct enum reference
  username          String            @db.VarChar(50)
  full_name         String            @db.VarChar(255)
  email_address     String            @db.VarChar(255)
  password_hash     String            @db.VarChar(255)
  last_login_at     DateTime?
  login_attempts    Int?              @default(0)
  system_user_status SystemUserStatus @default(ACTIVE)
  
  // Audit fields from BaseAuditFields
  is_active         Boolean           @default(true)
  is_deleted        Boolean           @default(false)
  created_at        DateTime          @default(now())
  updated_at        DateTime          @updatedAt
  created_by        Int?
  updated_by        Int?
  deleted_at        DateTime?
  deleted_by        Int?
  created_ip        String?           @db.VarChar(45)
  updated_ip        String?           @db.VarChar(45)

  // Relationships
  tenant            Tenant?           @relation(fields: [tenant_id], references: [tenant_id], onDelete: Restrict)
  role              Role              @relation("UserRole", fields: [role_type], references: [role_type], onDelete: Restrict)
  user_screens      UserScreen[]

  // ...existing audit relationships...

  @@map("system_users")
}
```

### Role Model
```prisma
model Role {
  role_id           Int               @id @default(autoincrement())
  role_type         SystemUserRole    @unique // Business identifier
  role_name         String            @db.VarChar(100)
  role_description  String?           @db.Text
  is_system_role    Boolean           @default(false)
  
  // Audit fields
  is_active         Boolean           @default(true)
  is_deleted        Boolean           @default(false)
  created_at        DateTime          @default(now())
  updated_at        DateTime          @updatedAt
  created_by        Int?
  updated_by        Int?
  deleted_at        DateTime?
  deleted_by        Int?
  created_ip        String?           @db.VarChar(45)
  updated_ip        String?           @db.VarChar(45)

  // Relationships
  system_users      SystemUser[]      @relation("UserRole")
  role_screens      RoleScreen[]      @relation("RoleScreenRole")

  @@map("roles")
}
```

### Screen Model
```prisma
model Screen {
  screen_id         Int               @id @default(autoincrement())
  screen_name       String            @db.VarChar(100)
  screen_description String?          @db.Text
  route_path        String?           @db.VarChar(255)
  parent_screen_id  Int?
  sort_order        Int?
  icon_class        String?           @db.VarChar(100)
  
  // Audit fields
  is_active         Boolean           @default(true)
  is_deleted        Boolean           @default(false)
  created_at        DateTime          @default(now())
  updated_at        DateTime          @updatedAt
  created_by        Int
  updated_by        Int?
  deleted_at        DateTime?
  deleted_by        Int?
  created_ip        String?           @db.VarChar(45)
  updated_ip        String?           @db.VarChar(45)

  // Relationships
  parent_screen     Screen?           @relation("ScreenHierarchy", fields: [parent_screen_id], references: [screen_id], onDelete: SetNull)
  child_screens     Screen[]          @relation("ScreenHierarchy")
  user_screens      UserScreen[]
  role_screens      RoleScreen[]

  @@map("screens")
}
```

### UserScreen Model
```prisma
model UserScreen {
  user_screen_id    Int               @id @default(autoincrement())
  tenant_id         Int
  system_user_id    Int
  screen_id         Int
  can_view          Boolean           @default(false)
  can_create        Boolean           @default(false)
  can_edit          Boolean           @default(false)
  can_delete        Boolean           @default(false)
  can_export        Boolean           @default(false)
  
  // Audit fields
  is_active         Boolean           @default(true)
  is_deleted        Boolean           @default(false)
  created_at        DateTime          @default(now())
  updated_at        DateTime          @updatedAt
  created_by        Int
  updated_by        Int?
  deleted_at        DateTime?
  deleted_by        Int?
  created_ip        String?           @db.VarChar(45)
  updated_ip        String?           @db.VarChar(45)

  // Relationships
  tenant            Tenant            @relation(fields: [tenant_id], references: [tenant_id], onDelete: Restrict)
  system_user       SystemUser        @relation(fields: [system_user_id], references: [system_user_id], onDelete: Cascade)
  screen            Screen            @relation(fields: [screen_id], references: [screen_id], onDelete: Cascade)

  @@map("user_screens")
}
```

### RoleScreen Model
```prisma
model RoleScreen {
  role_screen_id    Int               @id @default(autoincrement())
  tenant_id         Int
  role_type         SystemUserRole    // Direct reference to enum
  screen_id         Int
  can_view          Boolean           @default(false)
  can_create        Boolean           @default(false)
  can_edit          Boolean           @default(false)
  can_delete        Boolean           @default(false)
  can_export        Boolean           @default(false)
  
  // Audit fields
  is_active         Boolean           @default(true)
  is_deleted        Boolean           @default(false)
  created_at        DateTime          @default(now())
  updated_at        DateTime          @updatedAt
  created_by        Int
  updated_by        Int?
  deleted_at        DateTime?
  deleted_by        Int?
  created_ip        String?           @db.VarChar(45)
  updated_ip        String?           @db.VarChar(45)

  // Relationships
  tenant            Tenant            @relation(fields: [tenant_id], references: [tenant_id], onDelete: Restrict)
  role              Role              @relation("RoleScreenRole", fields: [role_type], references: [role_type], onDelete: Cascade)
  screen            Screen            @relation(fields: [screen_id], references: [screen_id], onDelete: Cascade)

  @@map("role_screens")
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
    "field": "email",
    "reason": "Email already exists within tenant"
  }
}
```

### Common Error Scenarios

#### Authorization Errors
- **403 FORBIDDEN**: "You can only create users within your own tenant"
- **403 FORBIDDEN**: "Tenant administrators cannot create super admin users"
- **403 FORBIDDEN**: "You cannot access users from another tenant"

#### Validation Errors
- **409 CONFLICT**: "Username already exists" (errorCode: "USERNAME_EXISTS")
- **409 CONFLICT**: "Email already exists" (errorCode: "EMAIL_EXISTS")
- **400 BAD_REQUEST**: "Users cannot delete their own account"
- **400 BAD_REQUEST**: "Cannot change to TENANT_ADMIN without specifying a tenant"

#### Not Found Errors
- **404 NOT_FOUND**: "System user with ID {userId} not found"

## Security Considerations

### Authentication & Authorization
- **JWT-based Authentication**: Required for all endpoints
- **Role-Based Access Control**: SUPER_ADMIN vs TENANT_ADMIN permissions
- **Tenant Isolation**: Strict enforcement except for SUPER_ADMIN operations
- **Self-Protection**: Users cannot delete their own accounts

### Data Protection
- **Password Security**: Bcrypt hashing with salt
- **Audit Trails**: Comprehensive logging using BaseAuditFields
- **Soft Deletes**: No permanent data deletion
- **Input Validation**: Comprehensive validation using express-validator

### Business Rules
- **Username Uniqueness**: Scoped by tenant (global for SUPER_ADMIN)
- **Email Uniqueness**: Scoped by tenant (global for SUPER_ADMIN)  
- **Role Constraints**: SUPER_ADMIN cannot have tenant_id, TENANT_ADMIN must have tenant_id
- **Permission Inheritance**: User permissions override role permissions

## Implementation Patterns

### Service Layer Pattern
```typescript
// Example from systemUser.service.ts
async createSystemUser(
  data: CreateSystemUserDto,
  requestingUser: SystemUser
): Promise<SystemUser> {
  return tryCatch(async () => {
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
    userId,
    requestingUser: { 
      id: requestingUser.system_user_id, 
      role: requestingUser.role_type, 
      tenantId: requestingUser.tenant_id 
    }
  }
});
```

### Validation Middleware
```typescript
// Using express-validator with custom validation chains
body('roleType')
  .exists().withMessage('Role type is required')
  .isIn(Object.values(SystemUserRole)).withMessage('Invalid role type')
  .custom((value, { req }) => {
    // Custom validation logic for business rules
    return true;
  })
```

## Import Strategy

All imports use configured path aliases:

```typescript
// Shared types
import { 
  SystemUser, 
  Role, 
  Screen, 
  UserScreen, 
  RoleScreen,
  SystemUserRole, 
  SystemUserStatus
} from '@shared/types/system-users.types';

// Internal modules
import { CreateSystemUserDto } from '@/dtos/user/systemUser.dto';
import { SystemUserService } from '@/services/systemUser.service';
import { authenticate, authorize } from '@/middleware/auth.middleware';
import { tryCatch } from '@/utils/error-wrapper.utils';
```