# Client Management API Design

## Introduction

The Client Management API provides comprehensive functionality for managing clients and their tenant associations within the Learning Management System (LMS). This API enables administrators to configure client profiles and maintain client-tenant relationships securely with comprehensive data validation and multi-tenant isolation.

The API handles client creation, profile management, and tenant associations. All operations are performed with proper authorization checks, ensuring data security and compliance with multi-tenant architecture requirements.

## Data Model Overview

### Core Entities

The Client Management domain consists of the following main entities defined in `@shared/types/tenant.types.ts`:

- **clients**: Organizations or individuals within tenants with comprehensive profile information
- **client_tenants**: Many-to-many relationship between clients and tenants for flexible associations

### Key Enums

From `@/types/enums.types.ts`:

- **ClientStatus**: `ACTIVE`, `INACTIVE`, `SUSPENDED`, `TERMINATED`

### Base Interfaces

All entities extend `MultiTenantAuditFields` from `@shared/types/base.types.ts`, providing:
- Tenant isolation (`tenant_id`)
- Comprehensive audit trail (`created_at`, `created_by`, `updated_at`, `updated_by`)
- Soft deletion capabilities (`is_active`, `is_deleted`, `deleted_at`, `deleted_by`)
- IP tracking for security (`created_ip`, `updated_ip`)

## API Endpoints

### Client Management

#### Create Client
- **Method**: `POST`
- **Path**: `/api/v1/clients`
- **Authorization**: SUPER_ADMIN, TENANT_ADMIN
- **Description**: Create a new client with proper authorization checks
- **Request Body**:
```json
{
  "full_name": "Acme Corporation",
  "email_address": "contact@acme.com",
  "dial_code": "+1",
  "phone_number": "5551234567",
  "address": "123 Business Street, City, State",
  "client_status": "ACTIVE",
  "tenant_id": 123
}
```
- **Response**: `201 Created`
```json
{
  "success": true,
  "data": {
    "client_id": 1,
    "full_name": "Acme Corporation",
    "email_address": "contact@acme.com",
    "dial_code": "+1",
    "phone_number": "5551234567",
    "address": "123 Business Street, City, State",
    "client_status": "ACTIVE",
    "tenant_id": 123,
    "created_at": "2024-01-01T00:00:00Z",
    "is_active": true,
    "is_deleted": false
  },
  "message": "Client created successfully"
}
```

#### Get Client by ID
- **Method**: `GET`
- **Path**: `/api/v1/clients/{clientId}`
- **Authorization**: SUPER_ADMIN, TENANT_ADMIN
- **Description**: Retrieve a specific client with proper authorization checks
- **Response**: `200 OK`
```json
{
  "success": true,
  "data": {
    "client_id": 1,
    "full_name": "Acme Corporation",
    "email_address": "contact@acme.com",
    "dial_code": "+1",
    "phone_number": "5551234567",
    "address": "123 Business Street, City, State",
    "client_status": "ACTIVE",
    "tenant_id": 123
  }
}
```

#### List All Clients
- **Method**: `GET`
- **Path**: `/api/v1/clients`
- **Authorization**: SUPER_ADMIN, TENANT_ADMIN
- **Description**: Retrieve clients with pagination and filtering (tenant-scoped for TENANT_ADMIN)
- **Query Parameters**:
  - `page?: number` - Page number (default: 1)
  - `limit?: number` - Items per page (default: 10, max: 100)
  - `search?: string` - Search in full_name, email_address
  - `tenantId?: number` - Filter by tenant (SUPER_ADMIN only)
  - `status?: ClientStatus` - Filter by client status
  - `sortBy?: string` - Sort by field (client_id, full_name, email_address, client_status, created_at, updated_at)
  - `sortOrder?: string` - Sort order (asc, desc)
- **Response**: `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "client_id": 1,
      "full_name": "Acme Corporation",
      "email_address": "contact@acme.com",
      "client_status": "ACTIVE",
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

#### Update Client
- **Method**: `PATCH`
- **Path**: `/api/v1/clients/{clientId}`
- **Authorization**: SUPER_ADMIN, TENANT_ADMIN
- **Description**: Update client with proper authorization and validation
- **Request Body**:
```json
{
  "full_name": "Acme Corporation Updated",
  "client_status": "INACTIVE",
  "address": "456 New Business Avenue"
}
```
- **Response**: `200 OK`

#### Delete Client
- **Method**: `DELETE`
- **Path**: `/api/v1/clients/{clientId}`
- **Authorization**: SUPER_ADMIN, TENANT_ADMIN
- **Description**: Soft delete a client
- **Response**: `204 No Content`

### Client-Tenant Association Management

#### Create Client-Tenant Association
- **Method**: `POST`
- **Path**: `/api/v1/clients/tenant-associations`
- **Authorization**: SUPER_ADMIN, TENANT_ADMIN
- **Description**: Create a new client-tenant association
- **Request Body**:
```json
{
  "client_id": 1,
  "tenant_id": 123
}
```
- **Response**: `201 Created`
```json
{
  "success": true,
  "data": {
    "client_tenant_id": 1,
    "client_id": 1,
    "tenant_id": 123,
    "created_at": "2024-01-01T00:00:00Z",
    "is_active": true,
    "is_deleted": false
  },
  "message": "Client-tenant association created successfully"
}
```

#### Get Client Tenants
- **Method**: `GET`
- **Path**: `/api/v1/clients/{clientId}/tenants`
- **Authorization**: SUPER_ADMIN, TENANT_ADMIN
- **Description**: Get all tenants associated with a client
- **Response**: `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "tenant_id": 123,
      "tenant_name": "University of Excellence",
      "tenant_status": "ACTIVE",
      "logo_url_light": "https://example.com/logo-light.png"
    }
  ],
  "message": "Client tenants retrieved successfully"
}
```

#### Remove Client-Tenant Association
- **Method**: `DELETE`
- **Path**: `/api/v1/clients/tenant-associations/{associationId}`
- **Authorization**: SUPER_ADMIN, TENANT_ADMIN
- **Description**: Remove client-tenant association
- **Response**: `204 No Content`

## Authorization Rules

### SUPER_ADMIN Permissions
- Can create, read, update, and delete any client across all tenants
- Can manage client-tenant associations across all tenants
- Can filter clients by any tenant using tenantId query parameter
- Global scope operations

### TENANT_ADMIN Permissions
- Can only manage clients within their own tenant
- Can create, read, update, and soft delete clients in their tenant
- Can manage client-tenant associations only for their own tenant
- Cannot access clients from other tenants
- Tenant-scoped operations only

## Validation Rules

### Client Validation
- **full_name**: Required, 2-255 characters, string type
- **email_address**: Required, valid email format, unique within tenant
- **dial_code**: Optional, 1-20 characters, string type
- **phone_number**: Optional, 3-20 characters, valid phone format
- **address**: Optional, maximum 500 characters
- **client_status**: Must be valid ClientStatus enum value
- **tenant_id**: Required for creation, must be valid tenant ID

### Contact Information Validation
- **email_address**: Valid RFC 5322 format, normalized email
- **phone_number**: Valid international format, digits/spaces/+/-/() only
- **dial_code**: Required with phone number, 1-20 characters

### Association Validation
- **client_id**: Must be valid existing client
- **tenant_id**: Must be valid existing tenant
- **unique_association**: Client-tenant combination must be unique

## Prisma Schema Implementation

### Client Model
```prisma
model Client {
  client_id     Int          @id @default(autoincrement())
  full_name     String       @db.VarChar(255)
  email_address String       @db.VarChar(255)
  dial_code     String?      @db.VarChar(20)
  phone_number  String?      @db.VarChar(20)
  address       String?      @db.VarChar(500)
  client_status ClientStatus @default(ACTIVE)

  // Multi-tenant audit fields
  tenant_id     Int
  is_active     Boolean   @default(true)
  is_deleted    Boolean   @default(false)
  created_at    DateTime  @default(now())
  updated_at    DateTime  @updatedAt
  created_by    Int
  updated_by    Int?
  deleted_at    DateTime?
  deleted_by    Int?
  created_ip    String?   @db.VarChar(45)
  updated_ip    String?   @db.VarChar(45)

  // Relations
  tenant         Tenant         @relation(fields: [tenant_id], references: [tenant_id], onDelete: Restrict)
  client_tenants ClientTenant[]
  
  // Audit trail relationships with SystemUser
  created_by_user   SystemUser        @relation("ClientCreatedBy", fields: [created_by], references: [system_user_id], onDelete: Restrict)
  updated_by_user   SystemUser?       @relation("ClientUpdatedBy", fields: [updated_by], references: [system_user_id], onDelete: SetNull)
  deleted_by_user   SystemUser?       @relation("ClientDeletedBy", fields: [deleted_by], references: [system_user_id], onDelete: SetNull)

  @@map("clients")
}
```

### ClientTenant Model
```prisma
model ClientTenant {
  client_tenant_id Int @id @default(autoincrement())
  client_id        Int
  tenant_id        Int

  // Audit fields
  is_active     Boolean   @default(true)
  is_deleted    Boolean   @default(false)
  created_at    DateTime  @default(now())
  updated_at    DateTime  @updatedAt
  created_by    Int
  updated_by    Int?
  deleted_at    DateTime?
  deleted_by    Int?
  created_ip    String?   @db.VarChar(45)
  updated_ip    String?   @db.VarChar(45)

  // Relations
  client Client @relation(fields: [client_id], references: [client_id], onDelete: Cascade)
  tenant Tenant @relation(fields: [tenant_id], references: [tenant_id], onDelete: Cascade)
  
  // Audit trail relationships with SystemUser
  created_by_user   SystemUser        @relation("ClientTenantCreatedBy", fields: [created_by], references: [system_user_id], onDelete: Restrict)
  updated_by_user   SystemUser?       @relation("ClientTenantUpdatedBy", fields: [updated_by], references: [system_user_id], onDelete: SetNull)
  deleted_by_user   SystemUser?       @relation("ClientTenantDeletedBy", fields: [deleted_by], references: [system_user_id], onDelete: SetNull)

  @@map("client_tenants")
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
    "field": "email_address",
    "reason": "Email already exists within tenant"
  }
}
```

### Common Error Scenarios

#### Authorization Errors
- **403 FORBIDDEN**: "You can only manage clients within your own tenant"
- **403 FORBIDDEN**: "Cannot create client for another tenant"
- **403 FORBIDDEN**: "Cannot access clients from another tenant"

#### Validation Errors
- **409 CONFLICT**: "Client with this email already exists in this tenant" (errorCode: "DUPLICATE_CLIENT_EMAIL")
- **409 CONFLICT**: "Client-tenant association already exists" (errorCode: "DUPLICATE_CLIENT_TENANT_ASSOCIATION")
- **400 BAD_REQUEST**: "Phone number can only contain digits, spaces, +, -, and parentheses"
- **400 BAD_REQUEST**: "Valid tenant ID is required"

#### Not Found Errors
- **404 NOT_FOUND**: "Client with ID {clientId} not found" (errorCode: "CLIENT_NOT_FOUND")
- **404 NOT_FOUND**: "Target tenant not found" (errorCode: "TENANT_NOT_FOUND")
- **404 NOT_FOUND**: "Client-tenant association not found" (errorCode: "ASSOCIATION_NOT_FOUND")

#### Business Logic Errors
- **422 UNPROCESSABLE_ENTITY**: "Cannot create association for another tenant"
- **422 UNPROCESSABLE_ENTITY**: "Cannot remove association from another tenant"

## Security Considerations

### Authentication & Authorization
- **JWT-based Authentication**: Required for all endpoints
- **Role-Based Access Control**: SUPER_ADMIN vs TENANT_ADMIN permissions
- **Tenant Isolation**: Strict enforcement except for SUPER_ADMIN operations
- **Association Management**: Controlled access to client-tenant relationships

### Data Protection
- **Email Uniqueness**: Per-tenant uniqueness validation
- **Contact Information Security**: Proper validation and storage
- **Client Data Privacy**: Tenant-scoped access controls
- **Association Security**: Controlled creation and removal of client-tenant links

### Input Validation and Sanitization
- **Comprehensive Validation**: All fields validated using express-validator
- **SQL Injection Prevention**: Parameterized queries through Prisma ORM
- **XSS Protection**: HTML encoding for all text outputs
- **Email Normalization**: Consistent email format handling

### Rate Limiting and Abuse Prevention
- **API Rate Limiting**: 1000 requests per hour per tenant
- **Authentication Endpoints**: 5 attempts per minute per IP
- **Client Creation**: Limited creation rate for TENANT_ADMIN
- **Association Operations**: 20 per hour per admin

### Audit and Monitoring
- **Comprehensive Audit Trail**: All operations logged with user, IP, and timestamp
- **Client Data Changes**: Critical changes logged and monitored
- **Association Changes**: Client-tenant relationship changes tracked
- **Failed Authentication**: Monitoring and alerting
- **Cross-tenant Access**: Attempt logging and blocking

### Business Rules Enforcement
- **Email Uniqueness**: Per-tenant email address validation
- **Tenant Association**: Valid client-tenant relationship enforcement
- **Status Management**: Client status transition validation
- **Data Consistency**: Client profile and association integrity

## Implementation Patterns

### Service Layer Pattern
```typescript
// Example from client.service.ts
async createClient(
  data: CreateClientDto,
  requestingUser: TokenPayload,
  ip?: string
) {
  return tryCatch(async () => {
    // Determine target tenant based on user role
    let targetTenantId: number;
    
    if (requestingUser.user_type === UserType.SUPER_ADMIN) {
      targetTenantId = data.tenant_id;
    } else {
      // Non-SUPER_ADMIN users can only create clients for their own tenant
      if (data.tenant_id !== requestingUser.tenantId) {
        throw new ForbiddenError('Cannot create client for another tenant');
      }
      targetTenantId = requestingUser.tenantId;
    }
    
    // Business logic and database operations
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
    clientId,
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
body('email_address')
  .exists().withMessage('Email address is required')
  .isEmail().withMessage('Valid email address is required')
  .normalizeEmail()
  .trim()
```

### Controller Implementation
```typescript
// Using createRouteHandler for consistent response handling
static createClientHandler = createRouteHandler(
  async (req: AuthenticatedRequest) => {
    if (!req.user) {
      throw new ApiError('Authentication required', 401, 'AUTHENTICATION_REQUIRED');
    }

    const clientData = req.validatedData as CreateClientDto;
    const requestingUser = req.user;
    
    return await clientService.createClient(
      clientData, 
      requestingUser, 
      req.ip || undefined
    );
  },
  {
    statusCode: 201,
    message: 'Client created successfully'
  }
);
```

## Import Strategy

All imports use configured path aliases:

```typescript
// Shared types
import { 
  Client,
  ClientTenant,
  ClientStatus
} from '@shared/types/tenant.types';

// Enums
import { 
  ClientStatus,
  UserType
} from '@/types/enums';

// Internal modules
import { CreateClientDto, UpdateClientDto } from '@/dtos/client/client.dto';
import { ClientService } from '@/services/client.service';
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

Based on the core entities relationships, the client management domain has the following key foreign key constraints:

- **clients.tenant_id** → **tenants.tenant_id** (Required primary tenant association)
- **clients.created_by** → **system_users.system_user_id** (Audit trail)
- **client_tenants.client_id** → **clients.client_id** (Cascade delete)
- **client_tenants.tenant_id** → **tenants.tenant_id** (Cascade delete)

All entities include comprehensive audit trail relationships where system users can create, update, and delete records with proper foreign key constraints and cascade behaviors.

## Data Constraints and Business Rules

### Unique Constraints
- **email_address + tenant_id**: Email addresses must be unique per tenant
- **client_id + tenant_id**: Client-tenant associations must be unique

### Check Constraints
- **full_name**: 2-255 characters, non-empty after trimming
- **email_address**: Valid email format, maximum 255 characters
- **phone_number**: Valid phone format, 3-20 characters when provided
- **dial_code**: 1-20 characters, digits and + symbol only when provided
- **address**: Maximum 500 characters when provided

### Status Transition Rules
- Client status changes follow business logic validation
- Association status changes require proper authorization
- Status change history maintained for audit purposes

### Multi-Tenant Rules
- SUPER_ADMIN can create clients for any tenant via tenant_id parameter
- TENANT_ADMIN can only create clients for their own tenant
- Client email uniqueness enforced per tenant
- Cross-tenant access strictly controlled
