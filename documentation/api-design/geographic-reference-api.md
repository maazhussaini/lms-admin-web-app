# Geographic Reference API Design

## 1. Introduction

The Geographic Reference API provides comprehensive functionality for managing geographic reference data within the Learning Management System (LMS). This API handles countries, states, and cities that are used throughout the system for user profiles, institute locations, and other geographic references.

The API is designed to provide fast, cached access to geographic data while maintaining data consistency and supporting international localization. These endpoints are primarily read-only and serve as reference data for other system components.

## 2. Data Model Overview

### Core Geographic Entities

The geographic reference system is built around hierarchical entities:

- **Countries** (`@shared/types/student.types.ts`): Top-level geographic entities with ISO codes
- **States** (`@shared/types/student.types.ts`): Administrative divisions within countries
- **Cities** (`@shared/types/student.types.ts`): Urban areas within states

### Key Features

- Hierarchical geographic structure (Country → State → City)
- ISO standard country codes (ISO 3166-1 alpha-2 and alpha-3)
- International dial codes for phone number formatting
- State codes for standardized identification
- Minimal audit fields for reference data integrity

### Audit and Data Integrity

Geographic entities use `MinimalAuditFields` from `base.types.ts`, providing:
- Basic audit trail (`created_at`, `created_by`, `updated_at`, `updated_by`)
- Active status tracking (`is_active`)
- Simplified audit for reference data

## 3. API Endpoints

### 3.1 Country Management

#### Country Operations

**GET /api/common/countries**
- Description: Retrieve list of all countries
- Query Parameters:
  - `search` (string): Search by country name or ISO code
  - `is_active` (boolean): Filter by active status (default: true)
  - `with_dial_code` (boolean): Include only countries with dial codes
- Response: `TApiSuccessResponse<Country[]>`
- Status Code: 200

**GET /api/common/countries/{country_id}**
- Description: Retrieve specific country details
- Path Parameters:
  - `country_id` (number): Country identifier
- Response: `TApiSuccessResponse<Country>`
- Status Code: 200

**GET /api/common/countries/iso/{iso_code}**
- Description: Retrieve country by ISO code (2 or 3 letter)
- Path Parameters:
  - `iso_code` (string): ISO country code (e.g., 'US', 'USA')
- Response: `TApiSuccessResponse<Country>`
- Status Code: 200

**POST /api/admin/countries**
- Description: Create new country (admin only)
- Request Body:
```typescript
{
  name: string;
  iso_code_2?: string;
  iso_code_3?: string;
  dial_code?: string;
}
```
- Response: `TApiSuccessResponse<Country>`
- Status Code: 201

**PATCH /api/admin/countries/{country_id}**
- Description: Update country information (admin only)
- Path Parameters:
  - `country_id` (number): Country identifier
- Request Body:
```typescript
{
  name?: string;
  iso_code_2?: string;
  iso_code_3?: string;
  dial_code?: string;
  is_active?: boolean;
}
```
- Response: `TApiSuccessResponse<Country>`
- Status Code: 200

### 3.2 State Management

#### State Operations

**GET /api/common/countries/{country_id}/states**
- Description: Retrieve states for a specific country
- Path Parameters:
  - `country_id` (number): Country identifier
- Query Parameters:
  - `search` (string): Search by state name or code
  - `is_active` (boolean): Filter by active status (default: true)
- Response: `TApiSuccessResponse<State[]>`
- Status Code: 200

**GET /api/common/states/{state_id}**
- Description: Retrieve specific state details
- Path Parameters:
  - `state_id` (number): State identifier
- Response: `TApiSuccessResponse<State>`
- Status Code: 200

**GET /api/common/states/search**
- Description: Search states across all countries
- Query Parameters:
  - `q` (string): Search query
  - `country_id` (number): Filter by country
  - `limit` (number): Maximum results (default: 50, max: 200)
- Response: `TApiSuccessResponse<State[]>`
- Status Code: 200

**POST /api/admin/states**
- Description: Create new state (admin only)
- Request Body:
```typescript
{
  country_id: number;
  name: string;
  state_code?: string;
}
```
- Response: `TApiSuccessResponse<State>`
- Status Code: 201

**PATCH /api/admin/states/{state_id}**
- Description: Update state information (admin only)
- Path Parameters:
  - `state_id` (number): State identifier
- Request Body:
```typescript
{
  name?: string;
  state_code?: string;
  is_active?: boolean;
}
```
- Response: `TApiSuccessResponse<State>`
- Status Code: 200

### 3.3 City Management

#### City Operations

**GET /api/common/states/{state_id}/cities**
- Description: Retrieve cities for a specific state
- Path Parameters:
  - `state_id` (number): State identifier
- Query Parameters:
  - `search` (string): Search by city name
  - `is_active` (boolean): Filter by active status (default: true)
  - `page` (number): Page number (default: 1)
  - `limit` (number): Items per page (default: 50, max: 200)
- Response: `TApiSuccessResponse<{ cities: City[], total: number, page: number, limit: number }>`
- Status Code: 200

**GET /api/common/cities/{city_id}**
- Description: Retrieve specific city details
- Path Parameters:
  - `city_id` (number): City identifier
- Response: `TApiSuccessResponse<City>`
- Status Code: 200

**GET /api/common/cities/search**
- Description: Search cities across all states/countries
- Query Parameters:
  - `q` (string): Search query (minimum 2 characters)
  - `state_id` (number): Filter by state
  - `country_id` (number): Filter by country
  - `limit` (number): Maximum results (default: 50, max: 200)
- Response: `TApiSuccessResponse<City[]>`
- Status Code: 200

**POST /api/admin/cities**
- Description: Create new city (admin only)
- Request Body:
```typescript
{
  state_id: number;
  name: string;
}
```
- Response: `TApiSuccessResponse<City>`
- Status Code: 201

**PATCH /api/admin/cities/{city_id}**
- Description: Update city information (admin only)
- Path Parameters:
  - `city_id` (number): City identifier
- Request Body:
```typescript
{
  name?: string;
  is_active?: boolean;
}
```
- Response: `TApiSuccessResponse<City>`
- Status Code: 200

### 3.4 Hierarchical Geographic Queries

#### Combined Operations

**GET /api/common/geography/hierarchy/{country_id}**
- Description: Get complete geographic hierarchy for a country
- Path Parameters:
  - `country_id` (number): Country identifier
- Query Parameters:
  - `include_inactive` (boolean): Include inactive states/cities
- Response: `TApiSuccessResponse<{ country: Country, states: Array<{ state: State, cities: City[] }> }>`
- Status Code: 200

**GET /api/common/geography/lookup**
- Description: Geographic lookup for autocomplete
- Query Parameters:
  - `q` (string): Search query (minimum 2 characters)
  - `type` (string): 'country', 'state', 'city', or 'all' (default: 'all')
  - `limit` (number): Maximum results (default: 20, max: 50)
- Response: `TApiSuccessResponse<Array<{ type: string, id: number, name: string, parent_name?: string }>>`
- Status Code: 200

**GET /api/common/geography/validate**
- Description: Validate geographic hierarchy relationships
- Query Parameters:
  - `country_id` (number): Country identifier
  - `state_id` (number): State identifier
  - `city_id` (number): City identifier
- Response: `TApiSuccessResponse<{ valid: boolean, relationships: { country_state: boolean, state_city: boolean } }>`
- Status Code: 200

### 3.5 Bulk Operations

#### Bulk Geographic Operations

**POST /api/admin/geography/bulk/countries**
- Description: Create multiple countries (admin only)
- Request Body:
```typescript
{
  countries: Array<{
    name: string;
    iso_code_2?: string;
    iso_code_3?: string;
    dial_code?: string;
  }>;
}
```
- Response: `TApiSuccessResponse<{ created: Country[], failed: Array<{ error: string, data: any }> }>`
- Status Code: 201

**POST /api/admin/geography/bulk/states**
- Description: Create multiple states (admin only)
- Request Body:
```typescript
{
  states: Array<{
    country_id: number;
    name: string;
    state_code?: string;
  }>;
}
```
- Response: `TApiSuccessResponse<{ created: State[], failed: Array<{ error: string, data: any }> }>`
- Status Code: 201

**POST /api/admin/geography/bulk/cities**
- Description: Create multiple cities (admin only)
- Request Body:
```typescript
{
  cities: Array<{
    state_id: number;
    name: string;
  }>;
}
```
- Response: `TApiSuccessResponse<{ created: City[], failed: Array<{ error: string, data: any }> }>`
- Status Code: 201

### 3.6 Geographic Statistics

#### Analytics Operations

**GET /api/admin/geography/analytics/overview**
- Description: Get geographic data statistics
- Response: `TApiSuccessResponse<{ total_countries: number, total_states: number, total_cities: number, active_countries: number, active_states: number, active_cities: number }>`
- Status Code: 200

**GET /api/admin/geography/analytics/usage**
- Description: Get geographic data usage statistics
- Query Parameters:
  - `type` (string): 'country', 'state', 'city'
  - `limit` (number): Top N results (default: 10, max: 50)
- Response: `TApiSuccessResponse<Array<{ id: number, name: string, usage_count: number }>>`
- Status Code: 200

## 4. Prisma Schema Considerations

### Database Schema Mapping

#### Geographic Tables
```prisma
model Country {
  country_id              Int       @id @default(autoincrement())
  name                    String    @db.VarChar(100)
  iso_code_2              String?   @db.VarChar(2)
  iso_code_3              String?   @db.VarChar(3)
  dial_code               String?   @db.VarChar(10)
  
  // Minimal audit fields
  is_active               Boolean   @default(true)
  created_at              DateTime  @default(now())
  created_by              Int
  updated_at              DateTime? @updatedAt
  updated_by              Int?

  // Relationships
  states                  State[]
  students                Student[]
  teachers                Teacher[]

  @@unique([iso_code_2], name: "uq_country_iso_2")
  @@unique([iso_code_3], name: "uq_country_iso_3")
  @@index([name], name: "idx_country_name_search")
  @@index([iso_code_2, iso_code_3], name: "idx_country_iso_codes")
  @@map("countries")
}

model State {
  state_id                Int       @id @default(autoincrement())
  country_id              Int
  name                    String    @db.VarChar(100)
  state_code              String?   @db.VarChar(10)
  
  // Minimal audit fields
  is_active               Boolean   @default(true)
  created_at              DateTime  @default(now())
  created_by              Int
  updated_at              DateTime? @updatedAt
  updated_by              Int?

  // Relationships
  country                 Country   @relation(fields: [country_id], references: [country_id])
  cities                  City[]
  students                Student[]
  teachers                Teacher[]

  @@unique([country_id, state_code], name: "uq_state_code_country")
  @@index([country_id, name], name: "idx_state_country_name")
  @@index([name], name: "idx_state_name_search")
  @@map("states")
}

model City {
  city_id                 Int       @id @default(autoincrement())
  state_id                Int
  name                    String    @db.VarChar(100)
  
  // Minimal audit fields
  is_active               Boolean   @default(true)
  created_at              DateTime  @default(now())
  created_by              Int
  updated_at              DateTime? @updatedAt
  updated_by              Int?

  // Relationships
  state                   State     @relation(fields: [state_id], references: [state_id])
  students                Student[]
  teachers                Teacher[]

  @@index([state_id, name], name: "idx_city_state_name")
  @@index([name], name: "idx_city_name_search")
  @@map("cities")
}
```

### Key Schema Design Decisions

1. **Hierarchical Structure**: Clear parent-child relationships between geographic entities
2. **ISO Standards**: Support for ISO 3166-1 country codes
3. **Unique Constraints**: ISO codes unique globally, state codes unique within country
4. **Search Optimization**: Comprehensive indexing for name-based searches
5. **Minimal Audit**: Simplified audit fields for reference data
6. **Performance Indexes**: Optimized for common lookup patterns
7. **Snake Case Naming**: All table and column names use snake_case convention
8. **Referential Integrity**: Appropriate foreign key constraints

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
- **403**: Forbidden (insufficient permissions)
- **404**: Not Found (resource doesn't exist)
- **409**: Conflict (unique constraint violations)
- **500**: Internal Server Error (system errors)

### Specific Error Scenarios

#### Constraint Violation Errors

**ISO Code Uniqueness (409)**
```json
{
  "statusCode": 409,
  "message": "ISO code already exists",
  "errorCode": "ISO_CODE_CONFLICT",
  "details": {
    "constraint": "uq_country_iso_2",
    "field": "iso_code_2",
    "value": "US"
  }
}
```

**State Code Uniqueness (409)**
```json
{
  "statusCode": 409,
  "message": "State code already exists for this country",
  "errorCode": "STATE_CODE_CONFLICT",
  "details": {
    "constraint": "uq_state_code_country",
    "country_id": 1,
    "state_code": "CA"
  }
}
```

#### Validation Errors

**Invalid ISO Code Format (400)**
```json
{
  "statusCode": 400,
  "message": "ISO code must be 2 or 3 uppercase letters",
  "errorCode": "INVALID_ISO_CODE_FORMAT",
  "details": {
    "field": "iso_code_2",
    "value": "usa",
    "expected_format": "2 uppercase letters"
  }
}
```

**Invalid Dial Code Format (400)**
```json
{
  "statusCode": 400,
  "message": "Dial code must start with + and contain only digits",
  "errorCode": "INVALID_DIAL_CODE_FORMAT",
  "details": {
    "field": "dial_code",
    "value": "1",
    "expected_format": "+{digits}"
  }
}
```

#### Hierarchical Errors

**Invalid Geographic Hierarchy (400)**
```json
{
  "statusCode": 400,
  "message": "State does not belong to the specified country",
  "errorCode": "INVALID_GEOGRAPHIC_HIERARCHY",
  "details": {
    "country_id": 1,
    "state_id": 50,
    "state_country_id": 2
  }
}
```

## 6. Security Considerations

### Authentication and Authorization

#### JWT-Based Authentication
- Read operations are generally public or require minimal authentication
- Write operations require admin-level authentication
- Token structure follows `TAuthResponse` from `api.types.ts`

#### Role-Based Access Control (RBAC)
- **Public Access**: Read-only access to active geographic data
- **User Access**: Same as public, with potential for cached responses
- **Admin Role**: Full CRUD access to all geographic data
- **System Access**: Special permissions for data seeding and bulk operations

### Data Protection and Privacy

#### Reference Data Security
- Geographic data is generally considered public information
- No tenant isolation required (global reference data)
- Audit trails maintained for administrative accountability

#### Data Integrity
- Strict validation of ISO codes and formats
- Hierarchical relationship validation
- Data consistency checks for bulk operations

### Input Validation and Sanitization

#### Comprehensive Validation
- Country name length: 2-100 characters (trimmed)
- ISO code format validation (2/3 uppercase letters)
- Dial code format validation (+{digits})
- State/city name length: 2-100 characters (trimmed)

#### SQL Injection Prevention
- Parameterized queries through Prisma ORM
- No dynamic SQL construction
- Input sanitization for all user-provided data

#### XSS Protection
- HTML encoding for all text outputs
- Content Security Policy headers
- Input sanitization for search queries

### Rate Limiting and Abuse Prevention

#### API Rate Limiting
- Read operations: 5000 requests per hour per IP
- Search operations: 1000 requests per hour per IP
- Admin operations: 100 requests per hour per user
- Bulk operations: 10 requests per hour per admin

#### Data Protection
- Bulk operation size limits (countries: 50, states: 200, cities: 1000)
- Search query minimum length requirements
- Result set size limitations

### Audit and Monitoring

#### Audit Trail
- All write operations logged with user and timestamp
- Geographic data usage tracking for analytics
- Failed operation attempts logged

#### Security Monitoring
- Unusual search pattern detection
- Bulk operation monitoring
- Admin operation alerting

#### Compliance Features
- Data consistency validation
- Reference data integrity checks
- Administrative audit trails

### Additional Security Measures

#### HTTPS and Encryption
- TLS 1.3 required for all API communications
- Database connection encryption
- Cached response security

#### API Security Headers
- CORS policy configuration
- X-Frame-Options: DENY
- X-Content-Type-Options: nosniff
- Strict-Transport-Security headers

#### Caching and Performance
- Geographic data caching for performance
- Cache invalidation on data updates
- CDN distribution for global access
- Compression for large result sets

### Import Strategy
All type imports use `@shared/types/` path strategy:
```typescript
import { 
  Country, 
  State, 
  City 
} from '@shared/types/student.types';
import { 
  MinimalAuditFields 
} from '@shared/types/base.types';
import { 
  TApiSuccessResponse, 
  TApiErrorResponse 
} from '@shared/types/api.types';
```