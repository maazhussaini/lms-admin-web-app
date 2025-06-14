# Geographic Reference API Design

## Introduction

The Geographic Reference API provides comprehensive functionality for managing geographic reference data within the Learning Management System (LMS). This API handles global reference data for countries, states, and cities that are used across all tenants while maintaining proper audit trails and data integrity. The API is designed to support user registration, profile management, and administrative operations requiring geographic information.

The API handles country, state, and city management with hierarchical relationships. All operations are performed with proper authorization checks and comprehensive audit logging to ensure data integrity and compliance requirements.

## Data Model Overview

### Core Entities

The Geographic Reference domain consists of the following main entities defined in `@shared/types/student.types.ts`:

- **countries**: Global country reference data with ISO codes and dial codes
- **states**: State/province reference data within countries
- **cities**: City reference data within states

### Key Enums

The geographic entities use standard enums for data integrity but do not define custom status enums as they are reference data.

### Base Interfaces

All entities extend `MinimalAuditFields` from `@shared/types/base.types.ts`, providing:
- Basic audit trail (`created_at`, `created_by`, `updated_at`, `updated_by`)
- Soft deletion capabilities (`is_active`, `is_deleted`, `deleted_at`, `deleted_by`)
- IP tracking for security (`created_ip`, `updated_ip`)

**Note**: Geographic entities do NOT include `tenant_id` as they are global reference data used across all tenants.

## API Endpoints

### Country Management

#### Create Country
- **Method**: `POST`
- **Path**: `/api/v1/admin/countries`
- **Authorization**: SUPER_ADMIN
- **Description**: Create a new country with proper authorization checks
- **Request Body**:
```json
{
  "name": "United States",
  "iso_code_2": "US",
  "iso_code_3": "USA",
  "dial_code": "+1"
}
```
- **Response**: `201 Created`
```json
{
  "success": true,
  "data": {
    "country_id": 1,
    "name": "United States",
    "iso_code_2": "US",
    "iso_code_3": "USA",
    "dial_code": "+1",
    "created_at": "2024-01-01T00:00:00Z",
    "is_active": true,
    "is_deleted": false
  },
  "message": "Country created successfully"
}
```

#### Get Country by ID
- **Method**: `GET`
- **Path**: `/api/v1/countries/{countryId}`
- **Authorization**: Public (for user registration), SUPER_ADMIN, TENANT_ADMIN
- **Description**: Retrieve a specific country
- **Response**: `200 OK`
```json
{
  "success": true,
  "data": {
    "country_id": 1,
    "name": "United States",
    "iso_code_2": "US",
    "iso_code_3": "USA",
    "dial_code": "+1",
    "created_at": "2024-01-01T00:00:00Z"
  }
}
```

#### List All Countries
- **Method**: `GET`
- **Path**: `/api/v1/countries`
- **Authorization**: Public (for user registration), SUPER_ADMIN, TENANT_ADMIN
- **Description**: Retrieve countries with pagination and filtering
- **Query Parameters**:
  - `page?: number` - Page number (default: 1)
  - `limit?: number` - Items per page (default: 10, max: 100)
  - `search?: string` - Search in country name
  - `sortBy?: string` - Sort by field (country_id, name, iso_code_2, created_at, updated_at)
  - `sortOrder?: string` - Sort order (asc, desc)
- **Response**: `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "country_id": 1,
      "name": "United States",
      "iso_code_2": "US",
      "iso_code_3": "USA",
      "dial_code": "+1",
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

#### Update Country
- **Method**: `PATCH`
- **Path**: `/api/v1/admin/countries/{countryId}`
- **Authorization**: SUPER_ADMIN
- **Description**: Update country with proper authorization and validation
- **Request Body**:
```json
{
  "name": "United States of America",
  "dial_code": "+1"
}
```
- **Response**: `200 OK`

#### Delete Country
- **Method**: `DELETE`
- **Path**: `/api/v1/admin/countries/{countryId}`
- **Authorization**: SUPER_ADMIN
- **Description**: Soft delete a country
- **Response**: `204 No Content`

### State Management

#### Create State
- **Method**: `POST`
- **Path**: `/api/v1/admin/states`
- **Authorization**: SUPER_ADMIN
- **Description**: Create a new state within a country
- **Request Body**:
```json
{
  "country_id": 1,
  "name": "California",
  "state_code": "CA"
}
```
- **Response**: `201 Created`
```json
{
  "success": true,
  "data": {
    "state_id": 1,
    "country_id": 1,
    "name": "California",
    "state_code": "CA",
    "created_at": "2024-01-01T00:00:00Z",
    "is_active": true,
    "is_deleted": false
  },
  "message": "State created successfully"
}
```

#### Get State by ID
- **Method**: `GET`
- **Path**: `/api/v1/states/{stateId}`
- **Authorization**: Public (for user registration), SUPER_ADMIN, TENANT_ADMIN
- **Description**: Retrieve a specific state
- **Response**: `200 OK`

#### List States by Country
- **Method**: `GET`
- **Path**: `/api/v1/countries/{countryId}/states`
- **Authorization**: Public (for user registration), SUPER_ADMIN, TENANT_ADMIN
- **Description**: Retrieve states within a specific country
- **Query Parameters**:
  - `page?: number` - Page number (default: 1)
  - `limit?: number` - Items per page (default: 20, max: 100)
  - `search?: string` - Search in state name
  - `sortBy?: string` - Sort by field (state_id, name, state_code, created_at, updated_at)
  - `sortOrder?: string` - Sort order (asc, desc)
- **Response**: `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "state_id": 1,
      "country_id": 1,
      "name": "California",
      "state_code": "CA",
      "created_at": "2024-01-01T00:00:00Z"
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

#### Update State
- **Method**: `PATCH`
- **Path**: `/api/v1/admin/states/{stateId}`
- **Authorization**: SUPER_ADMIN
- **Description**: Update state with proper authorization and validation
- **Response**: `200 OK`

#### Delete State
- **Method**: `DELETE`
- **Path**: `/api/v1/admin/states/{stateId}`
- **Authorization**: SUPER_ADMIN
- **Description**: Soft delete a state
- **Response**: `204 No Content`

### City Management

#### Create City
- **Method**: `POST`
- **Path**: `/api/v1/admin/cities`
- **Authorization**: SUPER_ADMIN
- **Description**: Create a new city within a state
- **Request Body**:
```json
{
  "state_id": 1,
  "name": "Los Angeles"
}
```
- **Response**: `201 Created`
```json
{
  "success": true,
  "data": {
    "city_id": 1,
    "state_id": 1,
    "name": "Los Angeles",
    "created_at": "2024-01-01T00:00:00Z",
    "is_active": true,
    "is_deleted": false
  },
  "message": "City created successfully"
}
```

#### Get City by ID
- **Method**: `GET`
- **Path**: `/api/v1/cities/{cityId}`
- **Authorization**: Public (for user registration), SUPER_ADMIN, TENANT_ADMIN
- **Description**: Retrieve a specific city
- **Response**: `200 OK`

#### List Cities by State
- **Method**: `GET`
- **Path**: `/api/v1/states/{stateId}/cities`
- **Authorization**: Public (for user registration), SUPER_ADMIN, TENANT_ADMIN
- **Description**: Retrieve cities within a specific state
- **Query Parameters**:
  - `page?: number` - Page number (default: 1)
  - `limit?: number` - Items per page (default: 20, max: 100)
  - `search?: string` - Search in city name
  - `sortBy?: string` - Sort by field (city_id, name, created_at, updated_at)
  - `sortOrder?: string` - Sort order (asc, desc)
- **Response**: `200 OK`

#### Update City
- **Method**: `PATCH`
- **Path**: `/api/v1/admin/cities/{cityId}`
- **Authorization**: SUPER_ADMIN
- **Description**: Update city with proper authorization and validation
- **Response**: `200 OK`

#### Delete City
- **Method**: `DELETE`
- **Path**: `/api/v1/admin/cities/{cityId}`
- **Authorization**: SUPER_ADMIN
- **Description**: Soft delete a city
- **Response**: `204 No Content`

### Geographic Lookup Operations

#### Get Complete Geographic Data
- **Method**: `GET`
- **Path**: `/api/v1/geographic/lookup/{countryId}/{stateId}/{cityId}`
- **Authorization**: Public (for user registration), SUPER_ADMIN, TENANT_ADMIN
- **Description**: Retrieve complete geographic hierarchy for validation
- **Response**: `200 OK`
```json
{
  "success": true,
  "data": {
    "country": {
      "country_id": 1,
      "name": "United States",
      "iso_code_2": "US",
      "dial_code": "+1"
    },
    "state": {
      "state_id": 1,
      "name": "California",
      "state_code": "CA"
    },
    "city": {
      "city_id": 1,
      "name": "Los Angeles"
    }
  }
}
```

#### Bulk Geographic Import
- **Method**: `POST`
- **Path**: `/api/v1/admin/geographic/bulk-import`
- **Authorization**: SUPER_ADMIN
- **Description**: Bulk import geographic data from external sources
- **Request Body**: `multipart/form-data`
```
file: [CSV file with geographic data]
import_type: "countries" | "states" | "cities"
```
- **Response**: `201 Created`

## Authorization Rules

### SUPER_ADMIN Permissions
- Can create, read, update, and delete any geographic reference data
- Can perform bulk imports and data management operations
- Can access comprehensive analytics and usage statistics
- Global scope operations

### TENANT_ADMIN Permissions
- Can read all geographic reference data
- Cannot modify reference data (read-only access)
- Can access geographic data for user profile management

### Public Access (Unauthenticated)
- Can read countries, states, and cities for user registration
- Limited to GET operations only
- Rate-limited access for security

### Student/Teacher Permissions
- Can read geographic reference data for profile management
- Cannot modify reference data
- Can access only active (non-deleted) records

## Validation Rules

### Country Validation
- **name**: Required, 2-100 characters, string type, unique globally
- **iso_code_2**: Optional, exactly 2 uppercase alphabetic characters
- **iso_code_3**: Optional, exactly 3 uppercase alphabetic characters
- **dial_code**: Optional, valid international dial code format (+1 to +999)

### State Validation
- **country_id**: Required, must be valid existing country
- **name**: Required, 2-100 characters, string type
- **state_code**: Optional, 2-10 characters, alphanumeric

### City Validation
- **state_id**: Required, must be valid existing state
- **name**: Required, 2-100 characters, string type

### Hierarchical Validation
- **Geographic Integrity**: Cities must belong to valid states, states must belong to valid countries
- **Circular Reference Prevention**: Prevents invalid hierarchical relationships
- **Cascade Delete Validation**: Ensures dependent records are handled properly

## Prisma Schema Implementation

### Country Model
```prisma
model Country {
  country_id    Int       @id @default(autoincrement())
  name          String    @db.VarChar(100)
  iso_code_2    String?   @db.Char(2)
  iso_code_3    String?   @db.Char(3)
  dial_code     String?   @db.VarChar(10)
  
  // Minimal audit fields
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
  states        State[]
  students      Student[]
  teachers      Teacher[]
  
  // Audit trail relationships with SystemUser
  created_by_user         SystemUser       @relation("CountryCreatedBy", fields: [created_by], references: [system_user_id], onDelete: Restrict)
  updated_by_user         SystemUser?      @relation("CountryUpdatedBy", fields: [updated_by], references: [system_user_id], onDelete: SetNull)
  deleted_by_user         SystemUser?      @relation("CountryDeletedBy", fields: [deleted_by], references: [system_user_id], onDelete: SetNull)

  @@map("countries")
}
```

### State Model
```prisma
model State {
  state_id      Int       @id @default(autoincrement())
  country_id    Int
  name          String    @db.VarChar(100)
  state_code    String?   @db.VarChar(10)
  
  // Minimal audit fields
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
  country       Country   @relation(fields: [country_id], references: [country_id], onDelete: Restrict)
  cities        City[]
  students      Student[]
  teachers      Teacher[]
  
  // Audit trail relationships with SystemUser
  created_by_user         SystemUser       @relation("StateCreatedBy", fields: [created_by], references: [system_user_id], onDelete: Restrict)
  updated_by_user         SystemUser?      @relation("StateUpdatedBy", fields: [updated_by], references: [system_user_id], onDelete: SetNull)
  deleted_by_user         SystemUser?      @relation("StateDeletedBy", fields: [deleted_by], references: [system_user_id], onDelete: SetNull)

  @@map("states")
}
```

### City Model
```prisma
model City {
  city_id       Int       @id @default(autoincrement())
  state_id      Int
  name          String    @db.VarChar(100)
  
  // Minimal audit fields
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
  state         State     @relation(fields: [state_id], references: [state_id], onDelete: Restrict)
  students      Student[]
  teachers      Teacher[]
  
  // Audit trail relationships with SystemUser
  created_by_user         SystemUser       @relation("CityCreatedBy", fields: [created_by], references: [system_user_id], onDelete: Restrict)
  updated_by_user         SystemUser?      @relation("CityUpdatedBy", fields: [updated_by], references: [system_user_id], onDelete: SetNull)
  deleted_by_user         SystemUser?      @relation("CityDeletedBy", fields: [deleted_by], references: [system_user_id], onDelete: SetNull)

  @@map("cities")
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
    "field": "country_id",
    "reason": "Referenced country does not exist"
  }
}
```

### Common Error Scenarios

#### Authorization Errors
- **403 FORBIDDEN**: "Only SUPER_ADMIN can modify geographic reference data"
- **401 UNAUTHORIZED**: "Authentication required for administrative operations"

#### Validation Errors
- **409 CONFLICT**: "Country with this name already exists" (errorCode: "DUPLICATE_COUNTRY_NAME")
- **409 CONFLICT**: "ISO code already exists" (errorCode: "DUPLICATE_ISO_CODE")
- **400 BAD_REQUEST**: "Invalid ISO code format"
- **400 BAD_REQUEST**: "Invalid dial code format"

#### Not Found Errors
- **404 NOT_FOUND**: "Country with ID {countryId} not found" (errorCode: "COUNTRY_NOT_FOUND")
- **404 NOT_FOUND**: "State with ID {stateId} not found" (errorCode: "STATE_NOT_FOUND")
- **404 NOT_FOUND**: "City with ID {cityId} not found" (errorCode: "CITY_NOT_FOUND")

#### Business Logic Errors
- **422 UNPROCESSABLE_ENTITY**: "Cannot delete country with existing states"
- **422 UNPROCESSABLE_ENTITY**: "Cannot delete state with existing cities"
- **422 UNPROCESSABLE_ENTITY**: "Invalid geographic hierarchy"

## Security Considerations

### Authentication & Authorization
- **JWT-based Authentication**: Required for administrative operations
- **Role-Based Access Control**: SUPER_ADMIN for modifications, read access for others
- **Public API Access**: Limited read access for user registration
- **Rate Limiting**: Aggressive rate limiting for public endpoints

### Data Protection
- **Reference Data Integrity**: Strict validation to maintain data quality
- **Hierarchical Validation**: Ensures proper geographic relationships
- **Audit Trails**: Comprehensive logging for all modifications
- **Input Sanitization**: Prevents injection attacks and data corruption

### Input Validation and Sanitization
- **Comprehensive Validation**: All fields validated using express-validator
- **SQL Injection Prevention**: Parameterized queries through Prisma ORM
- **XSS Protection**: HTML encoding for all text outputs
- **ISO Code Validation**: Format validation for international standards

### Rate Limiting and Abuse Prevention
- **Public API Rate Limiting**: 100 requests per hour per IP for public access
- **Authenticated API Rate Limiting**: 1000 requests per hour per user
- **Bulk Import Rate Limiting**: Limited to authorized administrators
- **Geographic Lookup Caching**: Aggressive caching for performance

### Audit and Monitoring
- **Comprehensive Audit Trail**: All operations logged with user, IP, and timestamp
- **Reference Data Changes**: Critical changes logged and monitored
- **Usage Analytics**: Tracking of geographic data usage patterns
- **Failed Access Attempts**: Monitoring and alerting for security
- **Data Quality Monitoring**: Automated checks for data integrity

### Business Rules Enforcement
- **Name Uniqueness**: Country names unique globally, state names unique per country
- **ISO Code Uniqueness**: ISO codes unique globally when provided
- **Hierarchical Integrity**: Cities belong to states, states belong to countries
- **Referential Integrity**: Prevents deletion of referenced geographic entities

## Implementation Patterns

### Service Layer Pattern
```typescript
// Example from geographic.service.ts
async createCountry(
  data: CreateCountryDto,
  requestingUser: TokenPayload,
  ip?: string
): Promise<Country> {
  return tryCatch(async () => {
    // Validate requesting user context
    if (requestingUser.user_type !== UserType.SUPER_ADMIN) {
      throw new ForbiddenError('Only SUPER_ADMIN can create countries');
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
    geographicId,
    requestingUser: { 
      id: requestingUser.id, 
      role: requestingUser.user_type 
    }
  }
});
```

### Validation Middleware
```typescript
// Using express-validator with custom validation chains
body('iso_code_2')
  .optional()
  .isString().withMessage('ISO code 2 must be a string')
  .isLength({ min: 2, max: 2 }).withMessage('ISO code 2 must be exactly 2 characters')
  .isAlpha().withMessage('ISO code 2 must contain only alphabetic characters')
  .isUppercase().withMessage('ISO code 2 must be uppercase')
```

### Controller Implementation
```typescript
// Using createRouteHandler for consistent response handling
static createCountryHandler = createRouteHandler(
  async (req: AuthenticatedRequest) => {
    if (!req.user) {
      throw new ApiError('Authentication required', 401, 'AUTHENTICATION_REQUIRED');
    }

    const countryData = req.validatedData as CreateCountryDto;
    const requestingUser = req.user;
    
    return await geographicService.createCountry(
      countryData, 
      requestingUser, 
      req.ip || undefined
    );
  },
  {
    statusCode: 201,
    message: 'Country created successfully'
  }
);
```

## Import Strategy

All imports use configured path aliases:

```typescript
// Shared types
import { 
  Country,
  State,
  City
} from '@shared/types/student.types';

// Internal modules
import { CreateCountryDto, UpdateCountryDto } from '@/dtos/geographic/geographic.dto';
import { GeographicService } from '@/services/geographic.service';
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

Based on the core entities relationships, the geographic reference domain has the following key foreign key constraints:

- **states.country_id** → **countries.country_id** (Required country reference, restrict delete)
- **cities.state_id** → **states.state_id** (Required state reference, restrict delete)
- **students.country_id** → **countries.country_id** (Required for student profiles, restrict delete)
- **students.state_id** → **states.state_id** (Required for student profiles, restrict delete)
- **students.city_id** → **cities.city_id** (Required for student profiles, restrict delete)
- **teachers.country_id** → **countries.country_id** (Optional for teacher profiles, set null)
- **teachers.state_id** → **states.state_id** (Optional for teacher profiles, set null)
- **teachers.city_id** → **cities.city_id** (Optional for teacher profiles, set null)

All entities include comprehensive audit trail relationships where system users can create, update, and delete records with proper foreign key constraints and restrict behaviors to maintain referential integrity.

## Data Constraints and Business Rules

### Unique Constraints
- **countries.name**: Country names must be unique globally
- **countries.iso_code_2**: ISO 2-letter codes must be unique when provided
- **countries.iso_code_3**: ISO 3-letter codes must be unique when provided
- **states.name + country_id**: State names must be unique per country
- **cities.name + state_id**: City names must be unique per state

### Check Constraints
- **country.name**: 2-100 characters, non-empty after trimming
- **state.name**: 2-100 characters, non-empty after trimming
- **city.name**: 2-100 characters, non-empty after trimming
- **iso_code_2**: Exactly 2 uppercase alphabetic characters when provided
- **iso_code_3**: Exactly 3 uppercase alphabetic characters when provided
- **dial_code**: Valid international format (+1 to +999) when provided

### Hierarchical Integrity Rules
- **Geographic Hierarchy**: Countries → States → Cities (strict hierarchy)
- **Referential Integrity**: Cannot delete countries with states, states with cities
- **Data Consistency**: Geographic relationships must remain valid
- **Usage Validation**: Cannot delete geographic entities referenced by users

### Global Reference Data Rules
- **No Tenant Isolation**: Geographic data is global and shared across all tenants
- **SUPER_ADMIN Only**: Only SUPER_ADMIN can modify reference data
- **Public Read Access**: Limited public access for user registration
- **Data Quality**: Strict validation to maintain high-quality reference data