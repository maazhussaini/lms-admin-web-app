# Notification Models Table Documentation

## Notification
- notification_id Int, [PK, autoincrement], not null
- tenant_id Int, not null
- title String, not null
- message String, not null
- notification_type NotificationType, not null [ANNOUNCEMENT, ASSIGNMENT_DUE, QUIZ_AVAILABLE, GRADE_POSTED, COURSE_UPDATE, SYSTEM_ALERT, ENROLLMENT_CONFIRMATION, DEADLINE_REMINDER]
- priority NotificationPriority, default NORMAL, not null [LOW, NORMAL, HIGH, URGENT]
- sender_id Int, nullable
- category_id Int, nullable
- scheduled_at DateTime, nullable
- expires_at DateTime, nullable
- metadata Json, nullable
- is_read_receipt_required Boolean, default false, not null
- target_audience String, nullable
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

## CourseSessionAnnouncement
- announcement_id Int, [PK, autoincrement], not null
- tenant_id Int, not null
- course_session_id Int, not null
- teacher_id Int, not null
- title String, not null
- content String, not null
- announcement_type Int, default 1, not null
- is_pinned Boolean, default false, not null
- is_published Boolean, default true, not null
- publish_date DateTime, default now(), not null
- expiry_date DateTime, nullable
- attachment_url String, nullable
- attachment_type String, nullable
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

## NotificationDelivery
- notification_delivery_id Int, [PK, autoincrement], not null
- tenant_id Int, not null
- notification_id Int, not null
- recipient_id Int, not null
- recipient_type RecipientType, not null [STUDENT, TEACHER, SYSTEM_USER, ALL_STUDENTS, ALL_TEACHERS, COURSE_ENROLLMENTS]
- delivery_channel DeliveryChannel, not null [IN_APP, EMAIL, PUSH, SMS]
- delivery_status DeliveryStatus, default PENDING, not null [PENDING, DELIVERED, FAILED, READ, DISMISSED]
- delivered_at DateTime, nullable
- read_at DateTime, nullable
- dismissed_at DateTime, nullable
- failure_reason String, nullable
- retry_count Int, default 0, not null
- delivery_metadata Json, nullable
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

## EmailQueue
- email_queue_id Int, [PK, autoincrement], not null
- tenant_id Int, not null
- notification_id Int, not null
- recipient_email String, not null
- recipient_name String, nullable
- subject String, not null
- body_html String, nullable
- body_text String, nullable
- send_status EmailSendStatus, default PENDING, not null [PENDING, SENT, FAILED, BOUNCED, DELIVERED]
- send_attempts Int, default 0, not null
- last_attempt_at DateTime, nullable
- sent_at DateTime, nullable
- failure_reason String, nullable
- priority Int, default 5, not null
- scheduled_for DateTime, nullable
- email_provider_id String, nullable
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

## NotificationTemplate
- notification_template_id Int, [PK, autoincrement], not null
- tenant_id Int, not null
- template_name String, not null
- template_type TemplateType, not null [EMAIL_HTML, EMAIL_TEXT, PUSH, IN_APP]
- subject_template String, nullable
- body_template String, not null
- variables Json, nullable
- is_system_template Boolean, default false, not null
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

## PushNotificationDevice
- push_device_id Int, [PK, autoincrement], not null
- tenant_id Int, not null
- user_id Int, not null
- user_type RecipientType, not null [STUDENT, TEACHER, SYSTEM_USER, ALL_STUDENTS, ALL_TEACHERS, COURSE_ENROLLMENTS]
- device_token String, not null
- device_type DeviceType, not null [IOS, ANDROID, WEB, DESKTOP]
- app_version String, nullable
- os_version String, nullable
- is_production Boolean, default true, not null
- last_used_at DateTime, nullable
- expires_at DateTime, nullable
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
