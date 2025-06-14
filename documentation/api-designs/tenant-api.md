# Tenant Management API Design

## Introduction

The Tenant Management API provides comprehensive functionality for managing tenants and their contact information within the Learning Management System (LMS). This API enables administrators to configure and isolate tenant environments, customize branding (themes, logos), and maintain tenant contact information securely with comprehensive data validation and multi-tenant isolation.

The API handles tenant creation, profile management, and contact information management. All operations are performed with proper authorization checks, ensuring data security and compliance with multi-tenant architecture requirements.

## Data Model Overview

### Core Entities

The Tenant Management domain consists of the following main entities defined in `@shared/types/tenant.types.ts`:

- **tenants**: Core tenant entity for multi-tenant isolation with branding and configuration
- **tenant_phone_numbers**: Tenant contact phone information with contact type categorization
- **tenant_email_addresses**: Tenant contact email information with contact type categorization

### Key Enums

From `@/types/enums.types.ts`:

- **TenantStatus**: `ACTIVE`, `SUSPENDED`, `TRIAL`, `EXPIRED`, `CANCELLED`
- **ContactType**: `PRIMARY`, `SECONDARY`, `EMERGENCY`, `BILLING`

### Base Interfaces

All entities extend `MultiTenantAuditFields` from `@shared/types/base.types.ts`, providing:
- Tenant isolation (`tenant_id`)
- Comprehensive audit trail (`created_at`, `created_by`, `updated_at`, `updated_by`)
- Soft deletion capabilities (`is_active`, `is_deleted`, `deleted_at`, `deleted_by`)
- IP tracking for security (`created_ip`, `updated_ip`)

## API Endpoints

### Tenant Management

#### Create Tenant
- **Method**: `POST`
- **Path**: `/api/v1/tenants`
- **Authorization**: SUPER_ADMIN
- **Description**: Create a new tenant with proper authorization checks
- **Request Body**:
```json
{
  "tenant_name": "University of Excellence",
  "logo_url_light": "https://example.com/logo-light.png",
  "logo_url_dark": "https://example.com/logo-dark.png",
  "favicon_url": "https://example.com/favicon.ico",
  "theme": {
    "primaryColor": "#1976d2",
    "secondaryColor": "#424242",
    "backgroundColor": "#ffffff"
  },
  "tenant_status": "ACTIVE"
}
```
- **Response**: `201 Created`
```json
{
  "success": true,
  "data": {
    "tenant_id": 1,
    "tenant_name": "University of Excellence",
    "logo_url_light": "https://example.com/logo-light.png",
    "logo_url_dark": "https://example.com/logo-dark.png",
    "favicon_url": "https://example.com/favicon.ico",
    "theme": {
      "primaryColor": "#1976d2",
      "secondaryColor": "#424242",
      "backgroundColor": "#ffffff"
    },
    "tenant_status": "ACTIVE",
    "created_at": "2024-01-01T00:00:00Z",
    "is_active": true,
    "is_deleted": false
  },
  "message": "Tenant created successfully"
}
```

#### Get Tenant by ID
- **Method**: `GET`
- **Path**: `/api/v1/tenants/{tenantId}`
- **Authorization**: SUPER_ADMIN, TENANT_ADMIN
- **Description**: Retrieve a specific tenant with proper authorization checks
- **Response**: `200 OK`
```json
{
  "success": true,
  "data": {
    "tenant_id": 1,
    "tenant_name": "University of Excellence",
    "logo_url_light": "https://example.com/logo-light.png",
    "logo_url_dark": "https://example.com/logo-dark.png",
    "favicon_url": "https://example.com/favicon.ico",
    "theme": {
      "primaryColor": "#1976d2",
      "secondaryColor": "#424242",
      "backgroundColor": "#ffffff"
    },
    "tenant_status": "ACTIVE"
  }
}
```

#### List All Tenants
- **Method**: `GET`
- **Path**: `/api/v1/tenants`
- **Authorization**: SUPER_ADMIN, TENANT_ADMIN
- **Description**: Retrieve tenants with pagination and filtering (tenant-scoped for TENANT_ADMIN)
- **Query Parameters**:
  - `page?: number` - Page number (default: 1)
  - `limit?: number` - Items per page (default: 10, max: 100)
  - `search?: string` - Search in tenant_name
  - `status?: TenantStatus` - Filter by tenant status
  - `sortBy?: string` - Sort by field (tenant_id, tenant_name, tenant_status, created_at, updated_at)
  - `sortOrder?: string` - Sort order (asc, desc)
- **Response**: `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "tenant_id": 1,
      "tenant_name": "University of Excellence",
      "tenant_status": "ACTIVE",
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

#### Update Tenant
- **Method**: `PATCH`
- **Path**: `/api/v1/tenants/{tenantId}`
- **Authorization**: SUPER_ADMIN, TENANT_ADMIN
- **Description**: Update tenant with proper authorization and validation
- **Request Body**:
```json
{
  "tenant_name": "University of Excellence Updated",
  "tenant_status": "ACTIVE",
  "theme": {
    "primaryColor": "#2196f3",
    "secondaryColor": "#616161"
  }
}
```
- **Response**: `200 OK`

#### Delete Tenant
- **Method**: `DELETE`
- **Path**: `/api/v1/tenants/{tenantId}`
- **Authorization**: SUPER_ADMIN
- **Description**: Soft delete a tenant
- **Response**: `204 No Content`

### Tenant Contact Management

#### Phone Number Management

**Get Tenant Phone Numbers**
- **Method**: `GET`
- **Path**: `/api/v1/tenants/{tenantId}/phone-numbers`
- **Authorization**: SUPER_ADMIN, TENANT_ADMIN
- **Query Parameters**:
  - `page?: number` - Page number (default: 1)
  - `limit?: number` - Items per page (default: 10, max: 100)
  - `contactType?: ContactType` - Filter by contact type
  - `isPrimary?: boolean` - Filter by primary status
- **Response**: `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "tenant_phone_number_id": 1,
      "tenant_id": 1,
      "dial_code": "+1",
      "phone_number": "5551234567",
      "iso_country_code": "US",
      "is_primary": true,
      "contact_type": "PRIMARY"
    }
  ]
}
```

**Add Tenant Phone Number**
- **Method**: `POST`
- **Path**: `/api/v1/tenants/{tenantId}/phone-numbers`
- **Authorization**: SUPER_ADMIN, TENANT_ADMIN
- **Request Body**:
```json
{
  "dial_code": "+1",
  "phone_number": "5551234567",
  "iso_country_code": "US",
  "is_primary": true,
  "contact_type": "PRIMARY"
}
```
- **Response**: `201 Created`

**Update Tenant Phone Number**
- **Method**: `PATCH`
- **Path**: `/api/v1/tenants/{tenantId}/phone-numbers/{phoneNumberId}`
- **Authorization**: SUPER_ADMIN, TENANT_ADMIN
- **Response**: `200 OK`

**Delete Tenant Phone Number**
- **Method**: `DELETE`
- **Path**: `/api/v1/tenants/{tenantId}/phone-numbers/{phoneNumberId}`
- **Authorization**: SUPER_ADMIN, TENANT_ADMIN
- **Response**: `204 No Content`

#### Email Address Management

**Get Tenant Email Addresses**
- **Method**: `GET`
- **Path**: `/api/v1/tenants/{tenantId}/email-addresses`
- **Authorization**: SUPER_ADMIN, TENANT_ADMIN
- **Query Parameters**:
  - `page?: number` - Page number (default: 1)
  - `limit?: number` - Items per page (default: 10, max: 100)
  - `contactType?: ContactType` - Filter by contact type
  - `isPrimary?: boolean` - Filter by primary status
- **Response**: `200 OK`

**Add Tenant Email Address**
- **Method**: `POST`
- **Path**: `/api/v1/tenants/{tenantId}/email-addresses`
- **Authorization**: SUPER_ADMIN, TENANT_ADMIN
- **Request Body**:
```json
{
  "email_address": "admin@university.edu",
  "is_primary": true,
  "contact_type": "PRIMARY"
}
```
- **Response**: `201 Created`

### Tenant Client Lookup

**Get Tenant Clients (Convenience Endpoint)**
- **Method**: `GET`
- **Path**: `/api/v1/tenants/{tenantId}/clients`
- **Authorization**: SUPER_ADMIN, TENANT_ADMIN
- **Description**: Convenience endpoint to view clients associated with a tenant. Full client management is available at `/api/v1/clients`
- **Query Parameters**:
  - `page?: number` - Page number (default: 1)
  - `limit?: number` - Items per page (default: 10, max: 100)
  - `search?: string` - Search in full_name, email_address
  - `status?: string` - Filter by client status
- **Response**: `200 OK`

## Authorization Rules

### SUPER_ADMIN Permissions
- Can create, read, update, and delete any tenant across the system
- Can manage tenant contact information
- Can access tenants across all organizations
- Global scope operations

### TENANT_ADMIN Permissions
- Can only manage their own tenant
- Can read and update their tenant's profile and contact information
- Cannot create new tenants or delete their own tenant
- Tenant-scoped operations only

## Validation Rules

### Tenant Validation
- **tenant_name**: Required, 2-100 characters, unique across system
- **logo_url_light**: Optional, valid URL format
- **logo_url_dark**: Optional, valid URL format
- **favicon_url**: Optional, valid URL format
- **theme**: Optional, valid JSON object
- **tenant_status**: Must be valid TenantStatus enum value

### Contact Information Validation
- **email_address**: Valid RFC 5322 format, maximum 255 characters
- **phone_number**: Valid international format with dial_code, 3-20 characters
- **dial_code**: Required with phone, 1-20 characters, digits and + symbol only
- **iso_country_code**: Optional, exactly 2 uppercase alphabetic characters
- **contact_type**: Must be valid ContactType enum value
- **is_primary**: Only one primary email/phone per tenant per contact type

## Prisma Schema Implementation

### Tenant Model
```prisma
model Tenant {
  tenant_id      Int     @id @default(autoincrement())
  tenant_name    String  @unique(map: "uq_tenants_tenant_name") @db.VarChar(100)
  logo_url_light String? @db.VarChar(500)
  logo_url_dark  String? @db.VarChar(500)
  favicon_url    String? @db.VarChar(500)
  theme          Json?
  tenant_status  TenantStatus @default(ACTIVE)

  // Enhanced audit fields
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

  // Relationships
  clients                Client[]
  tenant_phone_numbers   TenantPhoneNumber[]
  tenant_email_addresses TenantEmailAddress[]
  client_tenants         ClientTenant[]
  system_users           SystemUser[]
  
  // Audit trail relationships with SystemUser
  created_by_user   SystemUser        @relation("TenantCreatedBy", fields: [created_by], references: [system_user_id], onDelete: Restrict)
  updated_by_user   SystemUser?       @relation("TenantUpdatedBy", fields: [updated_by], references: [system_user_id], onDelete: SetNull)
  deleted_by_user   SystemUser?       @relation("TenantDeletedBy", fields: [deleted_by], references: [system_user_id], onDelete: SetNull)

  @@map("tenants")
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
    "field": "tenant_name",
    "reason": "Tenant name already exists"
  }
}
```

### Common Error Scenarios

#### Authorization Errors
- **403 FORBIDDEN**: "You can only manage your own tenant"
- **403 FORBIDDEN**: "Insufficient permissions to create tenants"
- **403 FORBIDDEN**: "Cannot access tenant data from another organization"

#### Validation Errors
- **409 CONFLICT**: "Tenant with this name already exists" (errorCode: "DUPLICATE_TENANT_NAME")
- **409 CONFLICT**: "Phone number already exists for this tenant" (errorCode: "PHONE_EXISTS")
- **409 CONFLICT**: "Email address already exists for this tenant" (errorCode: "EMAIL_EXISTS")
- **409 CONFLICT**: "Tenant already has a primary email address for this contact type" (errorCode: "PRIMARY_EMAIL_EXISTS")
- **400 BAD_REQUEST**: "Theme must be a valid JSON object"
- **400 BAD_REQUEST**: "Phone number can only contain digits, spaces, -, and parentheses"

#### Not Found Errors
- **404 NOT_FOUND**: "Tenant with ID {tenantId} not found" (errorCode: "TENANT_NOT_FOUND")
- **404 NOT_FOUND**: "Tenant phone number not found" (errorCode: "TENANT_PHONE_NOT_FOUND")
- **404 NOT_FOUND**: "Tenant email address not found" (errorCode: "TENANT_EMAIL_NOT_FOUND")

#### Business Logic Errors
- **422 UNPROCESSABLE_ENTITY**: "Cannot delete primary contact information"
- **422 UNPROCESSABLE_ENTITY**: "Cannot change tenant status from CANCELLED to ACTIVE"

## Security Considerations

### Authentication & Authorization
- **JWT-based Authentication**: Required for all endpoints
- **Role-Based Access Control**: SUPER_ADMIN vs TENANT_ADMIN permissions
- **Tenant Isolation**: Strict enforcement except for SUPER_ADMIN operations
- **Self-Tenant Access**: TENANT_ADMIN can only access their own tenant

### Data Protection
- **Tenant Name Uniqueness**: Global uniqueness across all tenants
- **Contact Information Security**: Separate storage for granular access control
- **Theme Data Validation**: JSON schema validation for theme objects
- **URL Validation**: Strict validation for logo and favicon URLs

### Input Validation and Sanitization
- **Comprehensive Validation**: All fields validated using express-validator
- **SQL Injection Prevention**: Parameterized queries through Prisma ORM
- **XSS Protection**: HTML encoding for all text outputs
- **URL Sanitization**: Logo and favicon URL validation and sanitization

### Rate Limiting and Abuse Prevention
- **API Rate Limiting**: 1000 requests per hour per tenant
- **Authentication Endpoints**: 5 attempts per minute per IP
- **Tenant Creation**: SUPER_ADMIN only, 10 creations per hour
- **Contact Updates**: 5 contact changes per day per tenant

### Audit and Monitoring
- **Comprehensive Audit Trail**: All operations logged with user, IP, and timestamp
- **Tenant Configuration Changes**: Critical changes logged and monitored
- **Contact Information Changes**: Permanent audit trail maintained
- **Failed Authentication**: Monitoring and alerting
- **Cross-tenant Access**: Attempt logging and blocking

### Business Rules Enforcement
- **Tenant Name Uniqueness**: Global uniqueness validation
- **Contact Information Uniqueness**: Per-tenant uniqueness for contact details
- **Primary Contact**: Only one primary email/phone per tenant per contact type
- **Theme Validation**: JSON schema enforcement for theme objects
- **Status Transitions**: Business rules for tenant status changes

## Implementation Patterns

### Service Layer Pattern
```typescript
// Example from tenant.service.ts
async createTenant(
  data: CreateTenantDto,
  userId: number,
  ip?: string
): Promise<Tenant> {
  return tryCatch(async () => {
    // Check for duplicate tenant name
    const existingTenant = await prisma.tenant.findFirst({
      where: {
        tenant_name: data.tenant_name,
        is_deleted: false
      }
    });

    if (existingTenant) {
      throw new ConflictError('Tenant with this name already exists', 'DUPLICATE_TENANT_NAME');
    }

    // Business logic and database operations
  }, { context: { tenantName: data.tenant_name, userId } });
}
```

### Error Wrapping
```typescript
// Using tryCatch utility for consistent error handling
return tryCatch(async () => {
  // Operation logic
}, {
  context: {
    tenantId,
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
body('tenant_name')
  .exists().withMessage('Tenant name is required')
  .isString().withMessage('Tenant name must be a string')
  .notEmpty().withMessage('Tenant name cannot be empty')
  .trim()
  .isLength({ min: 2, max: 100 }).withMessage('Tenant name must be between 2 and 100 characters')
```

### Controller Implementation
```typescript
// Using createRouteHandler for consistent response handling
static createTenantHandler = createRouteHandler(
  async (req: AuthenticatedRequest) => {
    if (!req.user) {
      throw new ApiError('Authentication required', 401, 'AUTHENTICATION_REQUIRED');
    }

    const tenantData = req.validatedData as CreateTenantDto;
    const requestingUser = req.user;
    
    return await tenantService.createTenant(
      tenantData, 
      requestingUser.id, 
      req.ip || undefined
    );
  },
  {
    statusCode: 201,
    message: 'Tenant created successfully'
  }
);
```

## Related APIs

For comprehensive management of the tenant ecosystem, refer to these related APIs:

- **[Client Management API](./client-api.md)**: Full CRUD operations for clients and client-tenant associations
- **[System User Management API](./system-user-api.md)**: User management with tenant-specific admin roles
- **[Student Management API](./student-management-api.md)**: Student profile management within tenants
- **[Teacher Management API](./teacher-management-api.md)**: Teacher profile management within tenants

## Import Strategy

All imports use configured path aliases:

```typescript
// Shared types
import { 
  Tenant, 
  TenantPhoneNumber, 
  TenantEmailAddress,
  TenantStatus,
  ContactType
} from '@shared/types/tenant.types';

// Enums
import { 
  TenantStatus,
  ContactType,
  UserType
} from '@/types/enums';

// Internal modules
import { CreateTenantDto, UpdateTenantDto } from '@/dtos/tenant/tenant.dto';
import { TenantService } from '@/services/tenant.service';
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

Based on the core entities relationships, the tenant management domain has the following key foreign key constraints:

- **tenants.created_by** → **system_users.system_user_id** (Audit trail)
- **tenant_phone_numbers.tenant_id** → **tenants.tenant_id** (Cascade delete)
- **tenant_email_addresses.tenant_id** → **tenants.tenant_id** (Cascade delete)
- **system_users.tenant_id** → **tenants.tenant_id** (TENANT_ADMIN association)

All entities include comprehensive audit trail relationships where system users can create, update, and delete records with proper foreign key constraints and cascade behaviors.

## Data Constraints and Business Rules

### Unique Constraints
- **tenant_name**: Must be unique across all tenants globally
- **email_address + tenant_id**: Email addresses must be unique per tenant
- **dial_code + phone_number + tenant_id**: Phone numbers must be unique per tenant

### Check Constraints
- **tenant_name**: 2-100 characters, non-empty after trimming
- **email_address**: Valid email format, maximum 255 characters
- **phone_number**: Valid phone format, 3-20 characters
- **dial_code**: 1-20 characters, digits and + symbol only
- **theme**: Valid JSON object when provided
- **URL fields**: Valid HTTP/HTTPS format when provided

### Primary Contact Rules
- Only one primary email per tenant per contact type
- Only one primary phone per tenant per contact type
- Primary contact updates automatically unset other primary contacts of same type

### Status Transition Rules
- Tenant status changes follow business logic validation
- Status change history maintained for audit purposes