# Tenant API Design

## 1. Introduction
The Tenant API is a core component of the LMS, responsible for managing clients, tenants, and their associations. It enables administrators to configure and isolate tenant environments, customize branding (themes, logos), and maintain client-tenant relationships securely with comprehensive data validation and constraints.

## 2. Data Model Overview
Based on `@shared/types/tenant.types.ts` and `@shared/entity-relationships/core-entities.types.ts`:

### 2.1 Core Entities

- **tenants** (`Tenant`):  
  Fields: `tenant_id`, `tenant_name`, `logo_url_light`, `logo_url_dark`, `favicon_url`, `theme` (JSON), `tenant_status` + audit fields (including self-referencing `tenant_id` for audit consistency).
  
- **clients** (`Client`):  
  Fields: `client_id`, `full_name`, `email_address`, `dial_code`, `phone_number`, `address`, `client_status`, `tenant_id` + audit fields.

- **tenant_phone_numbers** (`TenantPhoneNumber`):  
  Fields: `tenant_phone_number_id`, `dial_code`, `phone_number`, `iso_country_code`, `is_primary`, `contact_type` + `tenant_id` + audit fields.

- **tenant_email_addresses** (`TenantEmailAddress`):  
  Fields: `tenant_email_address_id`, `email_address`, `is_primary`, `contact_type` + `tenant_id` + audit fields.

- **client_tenants** (`ClientTenant`):  
  Association table: `client_tenant_id`, `client_id` (FK), with `tenant_id` inherited from audit fields + audit fields.

### 2.2 Entity Relationships
- **tenants** → self-reference via audit `tenant_id` for consistency
- **tenants** → many **tenant_phone_numbers** & **tenant_email_addresses** (cascade delete)
- **clients** → belongs to one **tenant** via `tenant_id` FK
- **clients** ↔ **tenants** via **client_tenants** (many-to-many association)
- All entities include audit trail relationships to **system_users**

### 2.3 Data Constraints

#### Unique Constraints
- `tenant_name` must be unique across all tenants
- `client_email_address` must be unique per tenant
- Only one primary email/phone per tenant per contact type
- `client_id + tenant_id` combination must be unique in client_tenants

#### Check Constraints
- Email addresses must follow valid format
- Phone numbers must contain only valid characters with international dial codes
- Status fields must be within valid enum ranges (TenantStatus: 1-5, ClientStatus: 1-4, ContactType: 1-4)
- `is_primary` boolean fields for contact information
- Tenant theme JSON must be valid format
- URL fields must be valid HTTP/HTTPS format when provided

#### Foreign Key Constraints
- **tenants** → self-reference via `tenant_id` for audit consistency (RESTRICT on delete)
- **clients.tenant_id** → `tenants.tenant_id` (RESTRICT on delete)
- **tenant_phone_numbers.tenant_id** → `tenants.tenant_id` (CASCADE on delete)
- **tenant_email_addresses.tenant_id** → `tenants.tenant_id` (CASCADE on delete)
- **client_tenants.client_id** → `clients.client_id` (CASCADE on delete)
- **client_tenants.tenant_id** → `tenants.tenant_id` (CASCADE on delete)

## 3. API Endpoints
All endpoints under `/api/admin`, secured via JWT and RBAC (Admin role required).

### 3.1 Tenants

#### Create Tenant
- **POST** `/tenants`
- **Body**: `CreateTenantDto`
- **Response**: `TApiSuccessResponse<Tenant>`
- **Status**: 201 Created

#### List Tenants
- **GET** `/tenants`
- **Query Parameters**: `page`, `limit`, `search`, `sortBy`, `sortOrder`
- **Response**: `TApiSuccessResponse<Tenant[]>` with pagination meta
- **Status**: 200 OK

#### Get Tenant
- **GET** `/tenants/{id}`
- **Response**: `TApiSuccessResponse<Tenant>`
- **Status**: 200 OK

#### Update Tenant
- **PATCH** `/tenants/{id}`
- **Body**: `UpdateTenantDto`
- **Response**: `TApiSuccessResponse<Tenant>`
- **Status**: 200 OK

#### Delete Tenant
- **DELETE** `/tenants/{id}`
- **Response**: `TApiSuccessResponse<void>`
- **Status**: 204 No Content

### 3.2 Clients

#### Create Client
- **POST** `/clients`
- **Body**: `CreateClientDto`
- **Response**: `TApiSuccessResponse<Client>`
- **Status**: 201 Created

#### List Clients
- **GET** `/clients`
- **Query Parameters**: `page`, `limit`, `search`, `tenantId`, `sortBy`, `sortOrder`
- **Response**: `TApiSuccessResponse<Client[]>` with pagination meta
- **Status**: 200 OK

#### Get Client
- **GET** `/clients/{id}`
- **Response**: `TApiSuccessResponse<Client>`
- **Status**: 200 OK

#### Update Client
- **PATCH** `/clients/{id}`
- **Body**: `UpdateClientDto`
- **Response**: `TApiSuccessResponse<Client>`
- **Status**: 200 OK

#### Delete Client
- **DELETE** `/clients/{id}`
- **Response**: `TApiSuccessResponse<void>`
- **Status**: 204 No Content

### 3.3 Tenant Contact Information

#### Tenant Phone Numbers
- **POST** `/tenants/{tenantId}/phone-numbers`
- **GET** `/tenants/{tenantId}/phone-numbers`
- **PATCH** `/tenants/{tenantId}/phone-numbers/{id}`
- **DELETE** `/tenants/{tenantId}/phone-numbers/{id}`

#### Tenant Email Addresses
- **POST** `/tenants/{tenantId}/email-addresses`
- **GET** `/tenants/{tenantId}/email-addresses`
- **PATCH** `/tenants/{tenantId}/email-addresses/{id}`
- **DELETE** `/tenants/{tenantId}/email-addresses/{id}`

### 3.4 Client-Tenant Associations

#### Create Association
- **POST** `/client-tenants`
- **Body**: `CreateClientTenantDto`
- **Response**: `TApiSuccessResponse<ClientTenant>`
- **Status**: 201 Created

#### Get Client's Tenants
- **GET** `/clients/{clientId}/tenants`
- **Response**: `TApiSuccessResponse<Tenant[]>`
- **Status**: 200 OK

#### Get Tenant's Clients
- **GET** `/tenants/{tenantId}/clients`
- **Response**: `TApiSuccessResponse<Client[]>`
- **Status**: 200 OK

#### Remove Association
- **DELETE** `/client-tenants/{id}`
- **Response**: `TApiSuccessResponse<void>`
- **Status**: 204 No Content

## 4. Data Transfer Objects (DTOs)

### 4.1 Create DTOs
```typescript
interface CreateTenantDto {
  tenant_name: string;
  logo_url_light?: string;
  logo_url_dark?: string;
  favicon_url?: string;
  theme?: Record<string, any>;
  tenant_status?: TenantStatus; // Defaults to ACTIVE
}

interface CreateClientDto {
  full_name: string;
  email_address: string;
  dial_code?: string;
  phone_number?: string;
  address?: string;
  client_status?: ClientStatus; // Defaults to ACTIVE
  tenant_id: number;
}

interface CreateTenantPhoneNumberDto {
  dial_code: string;
  phone_number: string;
  iso_country_code?: string;
  is_primary: boolean;
  contact_type: ContactType;
}

interface CreateTenantEmailAddressDto {
  email_address: string;
  is_primary: boolean;
  contact_type: ContactType;
}

interface CreateClientTenantDto {
  client_id: number;
  tenant_id: number;
}
```

### 4.2 Update DTOs
All update DTOs use `Partial<>` of their respective create DTOs, excluding audit fields.

## 5. Database Schema Considerations

### 5.1 Prisma Schema Mapping
```prisma
model Tenant {
  tenant_id       Int           @id @default(autoincrement())
  tenant_name     String        @unique
  logo_url_light  String?
  logo_url_dark   String?
  favicon_url     String?
  theme           Json?
  tenant_status   Int           @default(1) // TenantStatus enum
  
  // Audit fields (self-referencing tenant_id for consistency)
  tenant_id       Int           // Self-reference for audit trail
  is_active       Boolean       @default(true)
  is_deleted      Boolean       @default(false)
  created_at      DateTime      @default(now())
  updated_at      DateTime      @updatedAt
  created_by      Int
  updated_by      Int?
  created_ip      String?
  updated_ip      String?
  
  // Relations
  clients                Client[]
  tenant_phone_numbers   TenantPhoneNumber[]
  tenant_email_addresses TenantEmailAddress[]
  client_tenants         ClientTenant[]
  
  @@map("tenants")
}

model Client {
  client_id     Int           @id @default(autoincrement())
  full_name     String
  email_address String
  dial_code     String?
  phone_number  String?
  address       String?
  client_status Int           @default(1) // ClientStatus enum
  
  // Multi-tenant audit fields
  tenant_id     Int
  is_active     Boolean       @default(true)
  is_deleted    Boolean       @default(false)
  created_at    DateTime      @default(now())
  updated_at    DateTime      @updatedAt
  created_by    Int
  updated_by    Int?
  created_ip    String?
  updated_ip    String?
  
  // Relations
  tenant         Tenant         @relation(fields: [tenant_id], references: [tenant_id])
  client_tenants ClientTenant[]
  
  @@unique([email_address, tenant_id])
  @@map("clients")
}
```

### 5.2 Indexes for Performance
- `idx_tenant_name` on `tenants.tenant_name`
- `idx_client_email_tenant` on `clients.email_address, tenant_id`
- `idx_tenant_phone_primary` on `tenant_phone_numbers.tenant_id, is_primary`
- `idx_tenant_email_primary` on `tenant_email_addresses.tenant_id, is_primary`
- `idx_client_tenant_association` on `client_tenants.client_id, tenant_id`

## 6. Error Handling

### 6.1 Error Response Format
```typescript
interface TApiErrorResponse {
  statusCode: number;
  message: string;
  errorCode: string;
  details?: Record<string, any>;
  correlationId: string;
  timestamp: string;
}
```

### 6.2 Common Error Scenarios
- **400 Bad Request**: Invalid input data, constraint violations, invalid status values
- **401 Unauthorized**: Invalid or missing JWT token
- **403 Forbidden**: Insufficient permissions (non-Admin role)
- **404 Not Found**: Resource not found
- **409 Conflict**: Unique constraint violations (duplicate names, emails), primary contact conflicts
- **422 Unprocessable Entity**: Business rule violations, invalid enum values
- **500 Internal Server Error**: Unexpected server errors

### 6.3 Validation Rules
- `tenant_name`: Required, 2-100 characters, unique
- `tenant_status`: Must be valid TenantStatus enum value (1-5)
- `client_status`: Must be valid ClientStatus enum value (1-4)
- `contact_type`: Must be valid ContactType enum value (1-4)
- `email_address`: Required, valid email format, unique per tenant
- `phone_number`: Valid phone format when provided, must include valid dial_code
- `is_primary`: Only one primary contact per tenant per contact type
- `theme`: Valid JSON object when provided
- URLs: Must be valid HTTP/HTTPS format when provided

## 7. Security Considerations

### 7.1 Authentication & Authorization
- JWT authentication required for all endpoints
- Role-based access control (Admin role only)
- Token refresh mechanism for long-running sessions

### 7.2 Data Protection
- HTTPS enforced for all API communications
- Input validation and sanitization to prevent injection attacks
- Rate limiting on admin endpoints (100 requests/minute per user)
- Audit trail logging for all operations

### 7.3 Multi-Tenant Security
- Tenant isolation enforced at database level
- Cross-tenant data access prevention
- Audit fields track user actions and IP addresses

## 8. Performance Considerations

### 8.1 Caching Strategy
- Tenant configuration cached for 1 hour
- Client data cached for 30 minutes
- Cache invalidation on updates/deletes

### 8.2 Query Optimization
- Efficient indexes on frequently queried fields
- Pagination for list endpoints (default: 20 items per page)
- Eager loading for related entities when appropriate

### 8.3 Monitoring
- API response time monitoring
- Database query performance tracking
- Error rate monitoring and alerting

### Import Strategy
All type imports use `@shared/types/` path strategy:
```typescript
import { 
  Tenant, 
  Client, 
  TenantPhoneNumber, 
  TenantEmailAddress, 
  ClientTenant,
  TenantStatus,
  ClientStatus,
  ContactType
} from '@shared/types/tenant.types';
import { 
  SystemUser
} from '@shared/types/user.types';
import { 
  MultiTenantAuditFields 
} from '@shared/types/base.types';
import { 
  TApiSuccessResponse, 
  TApiErrorResponse 
} from '@shared/types/api.types';
```