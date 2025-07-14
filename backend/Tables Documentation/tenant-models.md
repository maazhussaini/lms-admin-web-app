# Tenant Models Documentation

## Table: tenants
| Column Name      | Data Type           | Default         | Nullable | Enums (if any)         |
|------------------|--------------------|-----------------|----------|------------------------|
| tenant_id        | Int                | autoincrement() | No       |                        |
| tenant_name      | String (VarChar(100)) |                | No       |                        |
| logo_url_light   | String (VarChar(500)) |                | Yes      |                        |
| logo_url_dark    | String (VarChar(500)) |                | Yes      |                        |
| favicon_url      | String (VarChar(500)) |                | Yes      |                        |
| theme            | Json               |                 | Yes      |                        |
| tenant_status    | TenantStatus       | ACTIVE          | No       | ACTIVE, SUSPENDED, TRIAL, EXPIRED, CANCELLED |
| is_active        | Boolean            | true            | No       |                        |
| is_deleted       | Boolean            | false           | No       |                        |
| created_at       | DateTime           | now()           | No       |                        |
| updated_at       | DateTime           | updatedAt       | No       |                        |
| created_by       | Int                |                 | No       |                        |
| updated_by       | Int                |                 | Yes      |                        |
| deleted_at       | DateTime           |                 | Yes      |                        |
| deleted_by       | Int                |                 | Yes      |                        |
| created_ip       | String (VarChar(45)) |               | Yes      |                        |
| updated_ip       | String (VarChar(45)) |               | Yes      |                        |

## Table: clients
| Column Name      | Data Type           | Default         | Nullable | Enums (if any)         |
|------------------|--------------------|-----------------|----------|------------------------|
| client_id        | Int                | autoincrement() | No       |                        |
| full_name        | String (VarChar(255)) |                | No       |                        |
| email_address    | String (VarChar(255)) |                | No       |                        |
| dial_code        | String (VarChar(20)) |                | Yes      |                        |
| phone_number     | String (VarChar(20)) |                | Yes      |                        |
| address          | String (VarChar(500)) |               | Yes      |                        |
| client_status    | ClientStatus       | ACTIVE          | No       | ACTIVE, INACTIVE, SUSPENDED, TERMINATED |
| tenant_id        | Int                |                 | No       |                        |
| is_active        | Boolean            | true            | No       |                        |
| is_deleted       | Boolean            | false           | No       |                        |
| created_at       | DateTime           | now()           | No       |                        |
| updated_at       | DateTime           | updatedAt       | No       |                        |
| created_by       | Int                |                 | No       |                        |
| updated_by       | Int                |                 | Yes      |                        |
| deleted_at       | DateTime           |                 | Yes      |                        |
| deleted_by       | Int                |                 | Yes      |                        |
| created_ip       | String (VarChar(45)) |               | Yes      |                        |
| updated_ip       | String (VarChar(45)) |               | Yes      |                        |

## Table: tenant_phone_numbers
| Column Name            | Data Type           | Default         | Nullable | Enums (if any)         |
|------------------------|--------------------|-----------------|----------|------------------------|
| tenant_phone_number_id | Int                | autoincrement() | No       |                        |
| tenant_id              | Int                |                 | No       |                        |
| dial_code              | String (VarChar(20)) |                | No       |                        |
| phone_number           | String (VarChar(20)) |                | No       |                        |
| iso_country_code       | String (Char(2))   |                 | Yes      |                        |
| is_primary             | Boolean            | false           | No       |                        |
| contact_type           | ContactType        |                 | No       | PRIMARY, SECONDARY, EMERGENCY, BILLING |
| is_active              | Boolean            | true            | No       |                        |
| is_deleted             | Boolean            | false           | No       |                        |
| created_at             | DateTime           | now()           | No       |                        |
| updated_at             | DateTime           | updatedAt       | No       |                        |
| created_by             | Int                |                 | No       |                        |
| updated_by             | Int                |                 | Yes      |                        |
| deleted_at             | DateTime           |                 | Yes      |                        |
| deleted_by             | Int                |                 | Yes      |                        |
| created_ip             | String (VarChar(45)) |               | Yes      |                        |
| updated_ip             | String (VarChar(45)) |               | Yes      |                        |

## Table: tenant_email_addresses
| Column Name            | Data Type           | Default         | Nullable | Enums (if any)         |
|------------------------|--------------------|-----------------|----------|------------------------|
| tenant_email_address_id| Int                | autoincrement() | No       |                        |
| tenant_id              | Int                |                 | No       |                        |
| email_address          | String (VarChar(255)) |               | No       |                        |
| is_primary             | Boolean            | false           | No       |                        |
| contact_type           | ContactType        |                 | No       | PRIMARY, SECONDARY, EMERGENCY, BILLING |
| is_active              | Boolean            | true            | No       |                        |
| is_deleted             | Boolean            | false           | No       |                        |
| created_at             | DateTime           | now()           | No       |                        |
| updated_at             | DateTime           | updatedAt       | No       |                        |
| created_by             | Int                |                 | No       |                        |
| updated_by             | Int                |                 | Yes      |                        |
| deleted_at             | DateTime           |                 | Yes      |                        |
| deleted_by             | Int                |                 | Yes      |                        |
| created_ip             | String (VarChar(45)) |               | Yes      |                        |
| updated_ip             | String (VarChar(45)) |               | Yes      |                        |

## Table: client_tenants
| Column Name        | Data Type           | Default         | Nullable | Enums (if any)         |
|--------------------|--------------------|-----------------|----------|------------------------|
| client_tenant_id   | Int                | autoincrement() | No       |                        |
| client_id          | Int                |                 | No       |                        |
| tenant_id          | Int                |                 | No       |                        |
| is_active          | Boolean            | true            | No       |                        |
| is_deleted         | Boolean            | false           | No       |                        |
| created_at         | DateTime           | now()           | No       |                        |
| updated_at         | DateTime           | updatedAt       | No       |                        |
| created_by         | Int                |                 | No       |                        |
| updated_by         | Int                |                 | Yes      |                        |
| deleted_at         | DateTime           |                 | Yes      |                        |
| deleted_by         | Int                |                 | Yes      |                        |
| created_ip         | String (VarChar(45)) |               | Yes      |                        |
| updated_ip         | String (VarChar(45)) |               | Yes      |                        |
