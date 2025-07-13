# Teacher Models Documentation

## Table: teachers
| Column Name            | Data Type           | Default         | Nullable | Enums (if any)         |
|------------------------|--------------------|-----------------|----------|------------------------|
| teacher_id             | Int                | autoincrement() | No       |                        |
| tenant_id              | Int                |                 | No       |                        |
| full_name              | String (VarChar(255)) |               | No       |                        |
| first_name             | String (VarChar(100)) |               | No       |                        |
| middle_name            | String (VarChar(100)) |               | Yes      |                        |
| last_name              | String (VarChar(100)) |               | No       |                        |
| country_id             | Int                |                 | Yes      |                        |
| state_id               | Int                |                 | Yes      |                        |
| city_id                | Int                |                 | Yes      |                        |
| address                | String (Text)      |                 | Yes      |                        |
| teacher_qualification  | String (Text)      |                 | Yes      |                        |
| date_of_birth          | DateTime           |                 | Yes      |                        |
| profile_picture_url    | String (VarChar(500)) |               | Yes      |                        |
| zip_code               | String (VarChar(20)) |                | Yes      |                        |
| age                    | Int                |                 | Yes      |                        |
| gender                 | Gender             |                 | Yes      | MALE, FEMALE           |
| username               | String (VarChar(50)) |               | No       |                        |
| password_hash          | String (VarChar(255)) |              | No       |                        |
| last_login_at          | DateTime           |                 | Yes      |                        |
| joining_date           | DateTime           |                 | Yes      |                        |
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

## Table: teacher_email_addresses
| Column Name              | Data Type           | Default         | Nullable | Enums (if any)         |
|--------------------------|--------------------|-----------------|----------|------------------------|
| teacher_email_address_id | Int                | autoincrement() | No       |                        |
| tenant_id                | Int                |                 | No       |                        |
| teacher_id               | Int                |                 | No       |                        |
| email_address            | String (VarChar(255)) |               | No       |                        |
| is_primary               | Boolean            | false           | No       |                        |
| priority                 | Int                |                 | Yes      |                        |
| is_active                | Boolean            | true            | No       |                        |
| is_deleted               | Boolean            | false           | No       |                        |
| created_at               | DateTime           | now()           | No       |                        |
| updated_at               | DateTime           | updatedAt       | No       |                        |
| created_by               | Int                |                 | No       |                        |
| updated_by               | Int                |                 | Yes      |                        |
| deleted_at               | DateTime           |                 | Yes      |                        |
| deleted_by               | Int                |                 | Yes      |                        |
| created_ip               | String (VarChar(45)) |               | Yes      |                        |
| updated_ip               | String (VarChar(45)) |               | Yes      |                        |

## Table: teacher_phone_numbers
| Column Name              | Data Type           | Default         | Nullable | Enums (if any)         |
|--------------------------|--------------------|-----------------|----------|------------------------|
| teacher_phone_number_id  | Int                | autoincrement() | No       |                        |
| tenant_id                | Int                |                 | No       |                        |
| teacher_id               | Int                |                 | No       |                        |
| dial_code                | String (VarChar(10)) |                | No       |                        |
| phone_number             | String (VarChar(20)) |                | No       |                        |
| iso_country_code         | String (VarChar(3)) |                 | Yes      |                        |
| is_primary               | Boolean            | false           | No       |                        |
| is_active                | Boolean            | true            | No       |                        |
| is_deleted               | Boolean            | false           | No       |                        |
| created_at               | DateTime           | now()           | No       |                        |
| updated_at               | DateTime           | updatedAt       | No       |                        |
| created_by               | Int                |                 | No       |                        |
| updated_by               | Int                |                 | Yes      |                        |
| deleted_at               | DateTime           |                 | Yes      |                        |
| deleted_by               | Int                |                 | Yes      |                        |
| created_ip               | String (VarChar(45)) |               | Yes      |                        |
| updated_ip               | String (VarChar(45)) |               | Yes      |                        |
