# System User Models Documentation

## Table: roles
| Column Name        | Data Type         | Default                | Nullable | Enums (if any)         |
|--------------------|------------------|------------------------|----------|------------------------|
| role_id            | Int               | autoincrement()        | No       |                        |
| role_type          | UserType          |                        | No       | STUDENT, TEACHER, TENANT_ADMIN, SUPER_ADMIN |
| role_name          | String (VarChar(100)) |                      | No       |                        |
| role_description   | String (Text)     |                        | Yes      |                        |
| is_system_role     | Boolean           | false                  | No       |                        |
| is_active          | Boolean           | true                   | No       |                        |
| is_deleted         | Boolean           | false                  | No       |                        |
| created_at         | DateTime          | now()                  | No       |                        |
| updated_at         | DateTime          | updatedAt              | No       |                        |
| created_by         | Int               |                        | Yes      |                        |
| updated_by         | Int               |                        | Yes      |                        |
| deleted_at         | DateTime          |                        | Yes      |                        |
| deleted_by         | Int               |                        | Yes      |                        |
| created_ip         | String (VarChar(45)) |                      | Yes      |                        |
| updated_ip         | String (VarChar(45)) |                      | Yes      |                        |

## Table: screens
| Column Name        | Data Type         | Default                | Nullable | Enums (if any)         |
|--------------------|------------------|------------------------|----------|------------------------|
| screen_id          | Int               | autoincrement()        | No       |                        |
| screen_name        | String (VarChar(100)) |                      | No       |                        |
| screen_description | String (Text)     |                        | Yes      |                        |
| route_path         | String (VarChar(255)) |                      | Yes      |                        |
| parent_screen_id   | Int               |                        | Yes      |                        |
| sort_order         | Int               |                        | Yes      |                        |
| icon_class         | String (VarChar(100)) |                      | Yes      |                        |
| is_active          | Boolean           | true                   | No       |                        |
| is_deleted         | Boolean           | false                  | No       |                        |
| created_at         | DateTime          | now()                  | No       |                        |
| updated_at         | DateTime          | updatedAt              | No       |                        |
| created_by         | Int               |                        | No       |                        |
| updated_by         | Int               |                        | Yes      |                        |
| deleted_at         | DateTime          |                        | Yes      |                        |
| deleted_by         | Int               |                        | Yes      |                        |
| created_ip         | String (VarChar(45)) |                      | Yes      |                        |
| updated_ip         | String (VarChar(45)) |                      | Yes      |                        |

## Table: system_users
| Column Name        | Data Type         | Default                | Nullable | Enums (if any)         |
|--------------------|------------------|------------------------|----------|------------------------|
| system_user_id     | Int               | autoincrement()        | No       |                        |
| tenant_id          | Int               |                        | Yes      |                        |
| role_type          | UserType          |                        | No       | STUDENT, TEACHER, TENANT_ADMIN, SUPER_ADMIN |
| username           | String (VarChar(50)) |                      | No       |                        |
| full_name          | String (VarChar(255)) |                      | No       |                        |
| email_address      | String (VarChar(255)) |                      | No       |                        |
| password_hash      | String (VarChar(255)) |                      | No       |                        |
| last_login_at      | DateTime          |                        | Yes      |                        |
| login_attempts     | Int               | 0                      | Yes      |                        |
| system_user_status | SystemUserStatus  | ACTIVE                 | No       | ACTIVE, INACTIVE, SUSPENDED, LOCKED |
| is_active          | Boolean           | true                   | No       |                        |
| is_deleted         | Boolean           | false                  | No       |                        |
| created_at         | DateTime          | now()                  | No       |                        |
| updated_at         | DateTime          | updatedAt              | No       |                        |
| created_by         | Int               |                        | Yes      |                        |
| updated_by         | Int               |                        | Yes      |                        |
| deleted_at         | DateTime          |                        | Yes      |                        |
| deleted_by         | Int               |                        | Yes      |                        |
| created_ip         | String (VarChar(45)) |                      | Yes      |                        |
| updated_ip         | String (VarChar(45)) |                      | Yes      |                        |

## Table: user_screens
| Column Name        | Data Type         | Default                | Nullable | Enums (if any)         |
|--------------------|------------------|------------------------|----------|------------------------|
| user_screen_id     | Int               | autoincrement()        | No       |                        |
| tenant_id          | Int               |                        | No       |                        |
| system_user_id     | Int               |                        | No       |                        |
| screen_id          | Int               |                        | No       |                        |
| can_view           | Boolean           | false                  | No       |                        |
| can_create         | Boolean           | false                  | No       |                        |
| can_edit           | Boolean           | false                  | No       |                        |
| can_delete         | Boolean           | false                  | No       |                        |
| can_export         | Boolean           | false                  | No       |                        |
| is_active          | Boolean           | true                   | No       |                        |
| is_deleted         | Boolean           | false                  | No       |                        |
| created_at         | DateTime          | now()                  | No       |                        |
| updated_at         | DateTime          | updatedAt              | No       |                        |
| created_by         | Int               |                        | No       |                        |
| updated_by         | Int               |                        | Yes      |                        |
| deleted_at         | DateTime          |                        | Yes      |                        |
| deleted_by         | Int               |                        | Yes      |                        |
| created_ip         | String (VarChar(45)) |                      | Yes      |                        |
| updated_ip         | String (VarChar(45)) |                      | Yes      |                        |

## Table: role_screens
| Column Name        | Data Type         | Default                | Nullable | Enums (if any)         |
|--------------------|------------------|------------------------|----------|------------------------|
| role_screen_id     | Int               | autoincrement()        | No       |                        |
| tenant_id          | Int               |                        | No       |                        |
| role_type          | UserType          |                        | No       | STUDENT, TEACHER, TENANT_ADMIN, SUPER_ADMIN |
| screen_id          | Int               |                        | No       |                        |
| can_view           | Boolean           | false                  | No       |                        |
| can_create         | Boolean           | false                  | No       |                        |
| can_edit           | Boolean           | false                  | No       |                        |
| can_delete         | Boolean           | false                  | No       |                        |
| can_export         | Boolean           | false                  | No       |                        |
| is_active          | Boolean           | true                   | No       |                        |
| is_deleted         | Boolean           | false                  | No       |                        |
| created_at         | DateTime          | now()                  | No       |                        |
| updated_at         | DateTime          | updatedAt              | No       |                        |
| created_by         | Int               |                        | No       |                        |
| updated_by         | Int               |                        | Yes      |                        |
| deleted_at         | DateTime          |                        | Yes      |                        |
| deleted_by         | Int               |                        | Yes      |                        |
| created_ip         | String (VarChar(45)) |                      | Yes      |                        |
| updated_ip         | String (VarChar(45)) |                      | Yes      |                        |
