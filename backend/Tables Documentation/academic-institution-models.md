# Database Table Documentation

## Program
- program_id: Int, [PK, autoincrement], not null
- tenant_id: Int, not null
- program_name: String, not null
- program_thumbnail_url: String, nullable
- is_active: Boolean, default true, not null
- is_deleted: Boolean, default false, not null
- created_at: DateTime, default now(), not null
- updated_at: DateTime, default now(), not null
- created_by: Int, not null
- updated_by: Int, nullable
- deleted_at: DateTime, nullable
- deleted_by: Int, nullable
- created_ip: String, nullable
- updated_ip: String, nullable

## Specialization
- specialization_id: Int, [PK, autoincrement], not null
- tenant_id: Int, not null
- program_id: Int, not null
- specialization_name: String, not null
- specialization_thumbnail_url: String, nullable
- is_active: Boolean, default true, not null
- is_deleted: Boolean, default false, not null
- created_at: DateTime, default now(), not null
- updated_at: DateTime, default now(), not null
- created_by: Int, not null
- updated_by: Int, nullable
- deleted_at: DateTime, nullable
- deleted_by: Int, nullable
- created_ip: String, nullable
- updated_ip: String, nullable

## Institute
- institute_id: Int, [PK, autoincrement], not null
- tenant_id: Int, not null
- institute_name: String, not null
- is_active: Boolean, default true, not null
- is_deleted: Boolean, default false, not null
- created_at: DateTime, default now(), not null
- updated_at: DateTime, default now(), not null
- created_by: Int, not null
- updated_by: Int, nullable
- deleted_at: DateTime, nullable
- deleted_by: Int, nullable
- created_ip: String, nullable
- updated_ip: String, nullable

## StudentInstitute
- student_institute_id: Int, [PK, autoincrement], not null
- tenant_id: Int, not null
- student_id: Int, not null
- institute_id: Int, not null
- is_active: Boolean, default true, not null
- is_deleted: Boolean, default false, not null
- created_at: DateTime, default now(), not null
- updated_at: DateTime, default now(), not null
- created_by: Int, not null
- updated_by: Int, nullable
- deleted_at: DateTime, nullable
- deleted_by: Int, nullable
- created_ip: String, nullable
- updated_ip: String, nullable

---

# Enums

## AssignmentReferenceTable
- COURSE, COURSE_MODULE, COURSE_TOPIC

## Gender
- MALE, FEMALE

## StudentStatus
- ACTIVE, ALUMNI, DROPOUT, ACCOUNT_FREEZED, BLACKLISTED, SUSPENDED, DEACTIVATED

## DeviceType
- IOS, ANDROID, WEB, DESKTOP

## EnrollmentStatus
- PENDING, ACTIVE, COMPLETED, DROPPED, SUSPENDED, EXPELLED, TRANSFERRED, DEFERRED

## SystemUserRole
- SUPER_ADMIN, TENANT_ADMIN

## SystemUserStatus
- ACTIVE, INACTIVE, SUSPENDED, LOCKED

## TenantStatus
- ACTIVE, SUSPENDED, TRIAL, EXPIRED, CANCELLED

## ClientStatus
- ACTIVE, INACTIVE, SUSPENDED, TERMINATED

## ContactType
- PRIMARY, SECONDARY, EMERGENCY, BILLING

## UserType
- STUDENT, TEACHER, TENANT_ADMIN, SUPER_ADMIN
