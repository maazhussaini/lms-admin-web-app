# System User Management API Design

## Introduction

The System User Management API provides comprehensive functionality for managing system-level users within the LMS platform. This API handles both SuperAdmin users (global system administrators) and Tenant Admin users (tenant-specific administrators), implementing role-based access control and tenant isolation patterns.

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

- **SystemUserRole**: `SUPERADMIN (1)`, `TENANT_ADMIN (2)`
- **SystemUserStatus**: `ACTIVE (1)`, `INACTIVE (2)`, `SUSPENDED (3)`, `LOCKED (4)`

### Base Interfaces

All entities extend `BaseAuditFields` from `@shared/types/base.types.ts`, providing:
- Audit trail fields (`created_at`, `created_by`, `updated_at`, `updated_by`)
- Soft delete support (`is_active`, `is_deleted`)
- IP tracking for security (`created_ip`, `updated_ip`)

## API Endpoints

### SuperAdmin Operations

#### Create SuperAdmin User
- **Method**: `POST`
- **Path**: `/api/v1/superadmin/users`
- **Description**: Create a new SuperAdmin user (global scope, no tenant)
- **Request Body**:
```json
{
  "username": "string",
  "full_name": "string", 
  "email_address": "string",
  "password": "string"
}
```
- **Response**: `201 Created`
```json
{
  "success": true,
  "data": {
    "system_user_id": 1,
    "username": "superadmin",
    "full_name": "System Administrator",
    "email_address": "admin@system.com",
    "role_id": 1,
    "tenant_id": null,
    "system_user_status": 1,
    "created_at": "2024-01-01T00:00:00Z"
  },
  "message": "SuperAdmin user created successfully"
}
```

#### List All System Users
- **Method**: `GET`
- **Path**: `/api/v1/superadmin/users`
- **Description**: Retrieve all system users across all tenants
- **Query Parameters**:
  - `page?: number` - Page number (default: 1)
  - `limit?: number` - Items per page (default: 20)
  - `role_id?: SystemUserRole` - Filter by role
  - `status?: SystemUserStatus` - Filter by status
  - `tenant_id?: number` - Filter by tenant (null for SuperAdmin)
- **Response**: `200 OK`
```json
{
  "success": true,
  "data": {
    "users": [
      {
        "system_user_id": 1,
        "username": "superadmin",
        "full_name": "System Administrator",
        "email_address": "admin@system.com",
        "role_id": 1,
        "tenant_id": null,
        "system_user_status": 1,
        "last_login_at": "2024-01-01T12:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 1,
      "total_pages": 1
    }
  }
}
```

#### Update System User Status
- **Method**: `PATCH`
- **Path**: `/api/v1/superadmin/users/{userId}/status`
- **Description**: Update system user operational status
- **Request Body**:
```json
{
  "system_user_status": 2
}
```
- **Response**: `200 OK`

### Tenant Admin Operations

#### Create Tenant Admin
- **Method**: `POST`
- **Path**: `/api/v1/admin/users`
- **Description**: Create a new tenant administrator
- **Request Body**:
```json
{
  "username": "string",
  "full_name": "string",
  "email_address": "string", 
  "password": "string"
}
```
- **Response**: `201 Created`

#### List Tenant Users
- **Method**: `GET`
- **Path**: `/api/v1/admin/users`
- **Description**: Retrieve system users within the current tenant
- **Query Parameters**:
  - `page?: number`
  - `limit?: number`
  - `status?: SystemUserStatus`
- **Response**: `200 OK`

#### Update Tenant User
- **Method**: `PATCH`
- **Path**: `/api/v1/admin/users/{userId}`
- **Description**: Update tenant user details
- **Request Body**:
```json
{
  "full_name?: "string",
  "email_address?: "string",
  "system_user_status?: number
}
```
- **Response**: `200 OK`

#### Delete Tenant User
- **Method**: `DELETE`
- **Path**: `/api/v1/admin/users/{userId}`
- **Description**: Soft delete a tenant user
- **Response**: `204 No Content`

### Authentication & Session Management

#### User Login
- **Method**: `POST`
- **Path**: `/api/v1/auth/login`
- **Description**: Authenticate system user and establish session
- **Request Body**:
```json
{
  "username": "string",
  "password": "string",
  "tenant_context?: "string"
}
```
- **Response**: `200 OK`
```json
{
  "success": true,
  "data": {
    "access_token": "jwt-token",
    "refresh_token": "refresh-token",
    "user": {
      "system_user_id": 1,
      "username": "admin",
      "full_name": "Administrator",
      "role_id": 2,
      "tenant_id": 123,
      "permissions": ["users:read", "users:write"]
    },
    "expires_in": 3600
  }
}
```

#### Refresh Token
- **Method**: `POST`
- **Path**: `/api/v1/auth/refresh`
- **Description**: Refresh authentication token
- **Request Body**:
```json
{
  "refresh_token": "string"
}
```
- **Response**: `200 OK`

#### Logout
- **Method**: `POST`
- **Path**: `/api/v1/auth/logout`
- **Description**: Invalidate user session
- **Response**: `200 OK`

### Permission Management

#### Get User Permissions
- **Method**: `GET`
- **Path**: `/api/v1/admin/users/{userId}/permissions`
- **Description**: Retrieve effective permissions for a user
- **Response**: `200 OK`
```json
{
  "success": true,
  "data": {
    "user_permissions": [
      {
        "screen_id": 1,
        "screen_name": "User Management",
        "can_view": true,
        "can_create": true,
        "can_edit": true,
        "can_delete": false,
        "can_export": true
      }
    ]
  }
}
```

#### Update User Permissions
- **Method**: `PUT`
- **Path**: `/api/v1/admin/users/{userId}/permissions`
- **Description**: Update individual user permissions
- **Request Body**:
```json
{
  "permissions": [
    {
      "screen_id": 1,
      "can_view": true,
      "can_create": true,
      "can_edit": true,
      "can_delete": false,
      "can_export": true
    }
  ]
}
```
- **Response**: `200 OK`

### Role Management

#### List Roles
- **Method**: `GET`
- **Path**: `/api/v1/admin/roles`
- **Description**: Retrieve available system roles
- **Response**: `200 OK`

#### Get Role Permissions
- **Method**: `GET`
- **Path**: `/api/v1/admin/roles/{roleId}/permissions`
- **Description**: Retrieve default permissions for a role
- **Response**: `200 OK`

#### Update Role Permissions
- **Method**: `PUT`
- **Path**: `/api/v1/admin/roles/{roleId}/permissions`
- **Description**: Update default role permissions
- **Request Body**:
```json
{
  "permissions": [
    {
      "screen_id": 1,
      "can_view": true,
      "can_create": false,
      "can_edit": false,
      "can_delete": false,
      "can_export": false
    }
  ]
}
```
- **Response**: `200 OK`

## Prisma Schema Considerations

### SystemUser Model
```prisma
model SystemUser {
  system_user_id    Int               @id @default(autoincrement())
  tenant_id         Int?              // NULL for SuperAdmin
  role_id           Int
  username          String
  full_name         String
  email_address     String
  password_hash     String
  last_login_at     DateTime?
  login_attempts    Int?              @default(0)
  system_user_status Int              @default(1)
  
  // Audit fields
  is_active         Boolean           @default(true)
  is_deleted        Boolean           @default(false)
  created_at        DateTime          @default(now())
  created_by        Int
  created_ip        String
  updated_at        DateTime?         @updatedAt
  updated_by        Int?
  updated_ip        String?

  // Relationships
  tenant            Tenant?           @relation(fields: [tenant_id], references: [tenant_id])
  role              Role              @relation(fields: [role_id], references: [role_id])
  user_screens      UserScreen[]
  created_records   SystemUser[]      @relation("CreatedBy")
  updated_records   SystemUser[]      @relation("UpdatedBy")

  // Constraints
  @@unique([email_address, tenant_id], name: "uq_system_user_email")
  @@unique([username, tenant_id], name: "uq_system_user_username")
  @@index([tenant_id, is_active, is_deleted], name: "idx_system_user_tenant_lookup")
  @@index([role_id, is_active, is_deleted], name: "idx_system_user_superadmin_lookup", where: "tenant_id IS NULL")
  @@map("system_users")
}
```

### Role Model
```prisma
model Role {
  role_id           Int               @id @default(autoincrement())
  role_name         String            @unique
  role_description  String?
  is_system_role    Boolean           @default(false)
  
  // Audit fields
  is_active         Boolean           @default(true)
  is_deleted        Boolean           @default(false)
  created_at        DateTime          @default(now())
  created_by        Int
  created_ip        String
  updated_at        DateTime?         @updatedAt
  updated_by        Int?
  updated_ip        String?

  // Relationships
  system_users      SystemUser[]
  role_screens      RoleScreen[]

  @@map("roles")
}
```

### Screen Model
```prisma
model Screen {
  screen_id         Int               @id @default(autoincrement())
  screen_name       String            @unique
  screen_description String?
  route_path        String?           @unique
  parent_screen_id  Int?
  sort_order        Int?
  icon_class        String?
  
  // Audit fields
  is_active         Boolean           @default(true)
  is_deleted        Boolean           @default(false)
  created_at        DateTime          @default(now())
  created_by        Int
  created_ip        String
  updated_at        DateTime?         @updatedAt
  updated_by        Int?
  updated_ip        String?

  // Relationships
  parent_screen     Screen?           @relation("ScreenHierarchy", fields: [parent_screen_id], references: [screen_id])
  child_screens     Screen[]          @relation("ScreenHierarchy")
  user_screens      UserScreen[]
  role_screens      RoleScreen[]
  created_by_user   SystemUser        @relation("ScreenCreatedBy", fields: [created_by], references: [system_user_id])
  updated_by_user   SystemUser?       @relation("ScreenUpdatedBy", fields: [updated_by], references: [system_user_id])

  // Constraints
  @@index([parent_screen_id, is_active], name: "idx_screen_hierarchy")
  @@index([is_active, is_deleted], name: "idx_screen_active_lookup")
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
  created_by        Int
  created_ip        String
  updated_at        DateTime?         @updatedAt
  updated_by        Int?
  updated_ip        String?

  // Relationships
  tenant            Tenant            @relation(fields: [tenant_id], references: [tenant_id])
  system_user       SystemUser        @relation(fields: [system_user_id], references: [system_user_id])
  screen            Screen            @relation(fields: [screen_id], references: [screen_id])
  created_by_user   SystemUser        @relation("UserScreenCreatedBy", fields: [created_by], references: [system_user_id])
  updated_by_user   SystemUser?       @relation("UserScreenUpdatedBy", fields: [updated_by], references: [system_user_id])

  // Constraints
  @@unique([system_user_id, screen_id], name: "uq_user_screen_permission")
  @@index([tenant_id, is_active, is_deleted], name: "idx_user_screen_tenant_lookup")
  @@index([system_user_id, screen_id], name: "idx_user_screen_permissions")
  @@map("user_screens")
}
```

### RoleScreen Model
```prisma
model RoleScreen {
  role_screen_id    Int               @id @default(autoincrement())
  tenant_id         Int
  role_id           Int
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
  created_by        Int
  created_ip        String
  updated_at        DateTime?         @updatedAt
  updated_by        Int?
  updated_ip        String?

  // Relationships
  tenant            Tenant            @relation(fields: [tenant_id], references: [tenant_id])
  role              Role              @relation(fields: [role_id], references: [role_id])
  screen            Screen            @relation(fields: [screen_id], references: [screen_id])
  created_by_user   SystemUser        @relation("RoleScreenCreatedBy", fields: [created_by], references: [system_user_id])
  updated_by_user   SystemUser?       @relation("RoleScreenUpdatedBy", fields: [updated_by], references: [system_user_id])

  // Constraints
  @@unique([role_id, screen_id], name: "uq_role_screen_permission")
  @@index([tenant_id, is_active, is_deleted], name: "idx_role_screen_tenant_lookup")
  @@index([role_id, screen_id], name: "idx_role_screen_permissions")
  @@map("role_screens")
}
```

### Key Design Patterns

1. **Conditional Tenant Isolation**: SuperAdmin users have `tenant_id = NULL`, while tenant administrators have a specific `tenant_id`
2. **Partial Unique Constraints**: Email and username uniqueness enforced differently for SuperAdmin (global) vs. tenant users (tenant-scoped)
3. **Self-Referencing Audit**: System users can create/update other system users
4. **Permission Inheritance**: User-specific permissions override role-based permissions
5. **Hierarchical Screen Structure**: Screens can have parent-child relationships for menu organization
6. **Granular Permission Control**: Five-level permission matrix (view, create, edit, delete, export) for each screen
7. **Tenant-Scoped Permissions**: Both user and role permissions are tenant-specific for proper isolation

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
    "field": "email_address",
    "reason": "Email already exists within tenant"
  }
}
```

### Common Error Codes
- **400**: `VALIDATION_ERROR` - Invalid input data
- **401**: `UNAUTHORIZED` - Authentication required
- **403**: `FORBIDDEN` - Insufficient permissions
- **404**: `USER_NOT_FOUND` - User does not exist
- **409**: `CONFLICT` - Username/email already exists
- **422**: `BUSINESS_RULE_VIOLATION` - Business logic constraints
- **500**: `INTERNAL_ERROR` - Server error

## Security Considerations

### Authentication & Authorization
- **JWT-based Authentication**: Using `TAuthResponse` structure
- **Role-Based Access Control (RBAC)**: SuperAdmin vs. Tenant Admin roles
- **Tenant Isolation**: Strict tenant boundary enforcement except for SuperAdmin
- **Password Security**: Bcrypt hashing with salt rounds

### Data Protection
- **Audit Trails**: Comprehensive logging using `BaseAuditFields`
- **Soft Deletes**: No permanent data deletion
- **Input Validation**: Email format, username constraints
- **Rate Limiting**: Login attempt tracking and account lockout

### Permission Model
- **Hierarchical Permissions**: Role-based defaults with user-specific overrides
- **Screen-Level Control**: Granular permissions (view, create, edit, delete, export)
- **Tenant Context**: All operations within tenant boundaries

### Security Constraints
Based on constraint definitions:
- Username length: 3-50 characters
- Full name length: 2-255 characters  
- Email format validation: RFC 5322 compliance
- Login attempts limit: 0-10 attempts before lockout
- Password complexity: Enforced at application level

## Naming Conventions

### API Endpoints
- **Versioning**: `/api/v1/` prefix for all endpoints
- **Resource Names**: Plural nouns (`users`, `roles`, `permissions`)
- **Actions**: HTTP verbs for operations
- **Nested Resources**: `/users/{userId}/permissions`

### Request/Response Bodies
- **PascalCase**: For JSON properties
- **Consistent Structure**: Following `TApiSuccessResponse` pattern
- **Error Handling**: Standardized error response format

### Database Models
- **snake_case**: For all database columns and table names
- **Descriptive Names**: Clear entity and relationship naming
- **Constraint Naming**: Consistent prefix patterns (`uq_`, `idx_`, `fk_`, `chk_`)

### Import Strategy
All type imports use `@shared/types/` path strategy:
```typescript
import { 
  SystemUser, 
  Role, 
  Screen, 
  UserScreen, 
  RoleScreen,
  SystemUserRole, 
  SystemUserStatus
} from '@shared/types/system-users.types';
import { 
  Tenant 
} from '@shared/types/tenant.types';
import { 
  BaseAuditFields 
} from '@shared/types/base.types';
import { 
  TApiSuccessResponse, 
  TApiErrorResponse,
  TAuthResponse 
} from '@shared/types/api.types';
```