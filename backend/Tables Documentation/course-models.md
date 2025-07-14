# Course Models Table Documentation

## Course
- course_id Int, [PK, autoincrement], not null
- tenant_id Int, not null
- course_name String, not null
- course_description String, nullable
- main_thumbnail_url String, nullable
- course_status CourseStatus, default DRAFT, not null [DRAFT, PUBLISHED, ARCHIVED, SUSPENDED]
- course_type CourseType, default PAID, not null [FREE, PAID]
- course_price Decimal(10,2), nullable
- course_total_hours Decimal(6,2), nullable
- specialization_id Int, nullable
- is_active Boolean, default true, not null
- is_deleted Boolean, default false, not null
- created_at DateTime, default now(), not null
- updated_at DateTime, default now(), not null
- created_by Int, not null
- updated_by Int, nullable
- deleted_at DateTime, nullable
- deleted_by Int, nullable
- created_ip String, nullable
- updated_ip String, nullable

## CourseModule
- course_module_id Int, [PK, autoincrement], not null
- tenant_id Int, not null
- course_id Int, not null
- course_module_name String, not null
- position Int, nullable
- is_active Boolean, default true, not null
- is_deleted Boolean, default false, not null
- created_at DateTime, default now(), not null
- updated_at DateTime, default now(), not null
- created_by Int, not null
- updated_by Int, nullable
- deleted_at DateTime, nullable
- deleted_by Int, nullable
- created_ip String, nullable
- updated_ip String, nullable

## CourseTopic
- course_topic_id Int, [PK, autoincrement], not null
- tenant_id Int, not null
- module_id Int, not null
- course_topic_name String, not null
- position Int, nullable
- is_active Boolean, default true, not null
- is_deleted Boolean, default false, not null
- created_at DateTime, default now(), not null
- updated_at DateTime, default now(), not null
- created_by Int, not null
- updated_by Int, nullable
- deleted_at DateTime, nullable
- deleted_by Int, nullable
- created_ip String, nullable
- updated_ip String, nullable

## CourseVideo
- course_video_id Int, [PK, autoincrement], not null
- tenant_id Int, not null
- course_id Int, not null
- course_topic_id Int, not null
- bunny_video_id String, not null
- video_name String, not null
- video_url String, not null
- thumbnail_url String, nullable
- duration_seconds Int, nullable
- position Int, nullable
- upload_status VideoUploadStatus, default PENDING, nullable [PENDING, PROCESSING, COMPLETED, FAILED, CANCELLED]
- IsLocked Boolean, default false, not null
- is_active Boolean, default true, not null
- is_deleted Boolean, default false, not null
- created_at DateTime, default now(), not null
- updated_at DateTime, default now(), not null
- created_by Int, not null
- updated_by Int, nullable
- deleted_at DateTime, nullable
- deleted_by Int, nullable
- created_ip String, nullable
- updated_ip String, nullable

## CourseDocument
- course_document_id Int, [PK, autoincrement], not null
- tenant_id Int, not null
- course_id Int, not null
- course_topic_id Int, not null
- document_name String, not null
- document_url String, not null
- is_active Boolean, default true, not null
- is_deleted Boolean, default false, not null
- created_at DateTime, default now(), not null
- updated_at DateTime, default now(), not null
- created_by Int, not null
- updated_by Int, nullable
- deleted_at DateTime, nullable
- deleted_by Int, nullable
- created_ip String, nullable
- updated_ip String, nullable
