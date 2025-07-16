-- CreateEnum
CREATE TYPE "ReportType" AS ENUM ('COURSE_PERFORMANCE', 'USER_ENGAGEMENT', 'SYSTEM_USAGE', 'ASSESSMENT_SUMMARY', 'VIDEO_ANALYTICS', 'CUSTOM');

-- CreateEnum
CREATE TYPE "ReportStatus" AS ENUM ('DRAFT', 'SCHEDULED', 'GENERATING', 'COMPLETED', 'FAILED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "MetricType" AS ENUM ('COUNT', 'PERCENTAGE', 'AVERAGE', 'SUM', 'RATIO', 'TREND');

-- CreateEnum
CREATE TYPE "TimeGranularity" AS ENUM ('HOURLY', 'DAILY', 'WEEKLY', 'MONTHLY', 'QUARTERLY', 'YEARLY');

-- CreateEnum
CREATE TYPE "WidgetType" AS ENUM ('CHART', 'TABLE', 'METRIC_CARD', 'PROGRESS_BAR', 'MAP', 'TIMELINE');

-- CreateEnum
CREATE TYPE "ExportFormat" AS ENUM ('PDF', 'EXCEL', 'CSV', 'JSON');

-- CreateEnum
CREATE TYPE "AssignmentType" AS ENUM ('FILE_UPLOAD');

-- CreateEnum
CREATE TYPE "AssignmentStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'GRADING_IN_PROGRESS', 'GRADED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "SubmissionStatus" AS ENUM ('PENDING', 'NOT_SUBMITTED', 'SUBMITTED', 'LATE_SUBMISSION', 'GRADED', 'RESUBMITTED');

-- CreateEnum
CREATE TYPE "UploadStatus" AS ENUM ('PENDING', 'UPLOADING', 'COMPLETED', 'FAILED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "AssignmentReferenceTable" AS ENUM ('COURSE', 'COURSE_MODULE', 'COURSE_TOPIC');

-- CreateEnum
CREATE TYPE "BunnyVideoStatus" AS ENUM ('UPLOADING', 'PROCESSING', 'FINISHED', 'FAILED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "BunnyVideoQuality" AS ENUM ('AUTO', 'P240', 'P360', 'P480', 'P720', 'P1080', 'P1440', 'P2160');

-- CreateEnum
CREATE TYPE "BunnyDrmProvider" AS ENUM ('WIDEVINE', 'PLAYREADY', 'FAIRPLAY');

-- CreateEnum
CREATE TYPE "BunnyWebhookEvent" AS ENUM ('VIDEO_UPLOADED', 'VIDEO_ENCODED', 'VIDEO_FAILED', 'VIDEO_DELETED', 'PURGE_COMPLETED');

-- CreateEnum
CREATE TYPE "BunnyCdnRegion" AS ENUM ('GLOBAL', 'US_EAST', 'US_WEST', 'EUROPE', 'ASIA', 'OCEANIA');

-- CreateEnum
CREATE TYPE "BunnyEncodingPreset" AS ENUM ('FAST', 'BALANCED', 'QUALITY', 'CUSTOM');

-- CreateEnum
CREATE TYPE "CourseSessionStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "SessionEnrollmentStatus" AS ENUM ('PENDING', 'ENROLLED', 'DROPPED', 'COMPLETED', 'EXPELLED');

-- CreateEnum
CREATE TYPE "VideoUploadStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "CourseStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "CourseType" AS ENUM ('FREE', 'PAID');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('ANNOUNCEMENT', 'ASSIGNMENT_DUE', 'QUIZ_AVAILABLE', 'GRADE_POSTED', 'COURSE_UPDATE', 'SYSTEM_ALERT', 'ENROLLMENT_CONFIRMATION', 'DEADLINE_REMINDER');

-- CreateEnum
CREATE TYPE "NotificationPriority" AS ENUM ('LOW', 'NORMAL', 'HIGH', 'URGENT');

-- CreateEnum
CREATE TYPE "DeliveryStatus" AS ENUM ('PENDING', 'DELIVERED', 'FAILED', 'READ', 'DISMISSED');

-- CreateEnum
CREATE TYPE "DeliveryChannel" AS ENUM ('IN_APP', 'EMAIL', 'PUSH', 'SMS');

-- CreateEnum
CREATE TYPE "TemplateType" AS ENUM ('EMAIL_HTML', 'EMAIL_TEXT', 'PUSH', 'IN_APP');

-- CreateEnum
CREATE TYPE "RecipientType" AS ENUM ('STUDENT', 'TEACHER', 'SYSTEM_USER', 'ALL_STUDENTS', 'ALL_TEACHERS', 'COURSE_ENROLLMENTS');

-- CreateEnum
CREATE TYPE "EmailSendStatus" AS ENUM ('PENDING', 'SENT', 'FAILED', 'BOUNCED', 'DELIVERED');

-- CreateEnum
CREATE TYPE "QuizStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'GRADING_IN_PROGRESS', 'GRADED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "QuizQuestionType" AS ENUM ('MULTIPLE_CHOICE_SINGLE_ANSWER', 'MULTIPLE_CHOICE_MULTIPLE_ANSWERS', 'TRUE_FALSE', 'SHORT_ANSWER_ESSAY');

-- CreateEnum
CREATE TYPE "QuizAttemptStatus" AS ENUM ('NOT_STARTED', 'IN_PROGRESS', 'SUBMITTED', 'GRADED');

-- CreateEnum
CREATE TYPE "QuizReferenceTable" AS ENUM ('COURSE', 'COURSE_MODULE', 'COURSE_TOPIC');

-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE');

-- CreateEnum
CREATE TYPE "StudentStatus" AS ENUM ('ACTIVE', 'ALUMNI', 'DROPOUT', 'ACCOUNT_FREEZED', 'BLACKLISTED', 'SUSPENDED', 'DEACTIVATED');

-- CreateEnum
CREATE TYPE "DeviceType" AS ENUM ('IOS', 'ANDROID', 'WEB', 'DESKTOP');

-- CreateEnum
CREATE TYPE "EnrollmentStatus" AS ENUM ('PENDING', 'ACTIVE', 'COMPLETED', 'DROPPED', 'SUSPENDED', 'EXPELLED', 'TRANSFERRED', 'DEFERRED');

-- CreateEnum
CREATE TYPE "SystemUserRole" AS ENUM ('SUPER_ADMIN', 'TENANT_ADMIN');

-- CreateEnum
CREATE TYPE "SystemUserStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'SUSPENDED', 'LOCKED');

-- CreateEnum
CREATE TYPE "TenantStatus" AS ENUM ('ACTIVE', 'SUSPENDED', 'TRIAL', 'EXPIRED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "ClientStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'SUSPENDED', 'TERMINATED');

-- CreateEnum
CREATE TYPE "ContactType" AS ENUM ('PRIMARY', 'SECONDARY', 'EMERGENCY', 'BILLING');

-- CreateEnum
CREATE TYPE "UserType" AS ENUM ('STUDENT', 'TEACHER', 'TENANT_ADMIN', 'SUPER_ADMIN');

-- CreateTable
CREATE TABLE "tenants" (
    "tenant_id" SERIAL NOT NULL,
    "tenant_name" VARCHAR(100) NOT NULL,
    "logo_url_light" VARCHAR(500),
    "logo_url_dark" VARCHAR(500),
    "favicon_url" VARCHAR(500),
    "theme" JSONB,
    "tenant_status" "TenantStatus" NOT NULL DEFAULT 'ACTIVE',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" INTEGER NOT NULL,
    "updated_by" INTEGER,
    "deleted_at" TIMESTAMP(3),
    "deleted_by" INTEGER,
    "created_ip" VARCHAR(45),
    "updated_ip" VARCHAR(45),

    CONSTRAINT "tenants_pkey" PRIMARY KEY ("tenant_id")
);

-- CreateTable
CREATE TABLE "clients" (
    "client_id" SERIAL NOT NULL,
    "full_name" VARCHAR(255) NOT NULL,
    "email_address" VARCHAR(255) NOT NULL,
    "dial_code" VARCHAR(20),
    "phone_number" VARCHAR(20),
    "address" VARCHAR(500),
    "client_status" "ClientStatus" NOT NULL DEFAULT 'ACTIVE',
    "tenant_id" INTEGER NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" INTEGER NOT NULL,
    "updated_by" INTEGER,
    "deleted_at" TIMESTAMP(3),
    "deleted_by" INTEGER,
    "created_ip" VARCHAR(45),
    "updated_ip" VARCHAR(45),

    CONSTRAINT "clients_pkey" PRIMARY KEY ("client_id")
);

-- CreateTable
CREATE TABLE "tenant_phone_numbers" (
    "tenant_phone_number_id" SERIAL NOT NULL,
    "tenant_id" INTEGER NOT NULL,
    "dial_code" VARCHAR(20) NOT NULL,
    "phone_number" VARCHAR(20) NOT NULL,
    "iso_country_code" CHAR(2),
    "is_primary" BOOLEAN NOT NULL DEFAULT false,
    "contact_type" "ContactType" NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" INTEGER NOT NULL,
    "updated_by" INTEGER,
    "deleted_at" TIMESTAMP(3),
    "deleted_by" INTEGER,
    "created_ip" VARCHAR(45),
    "updated_ip" VARCHAR(45),

    CONSTRAINT "tenant_phone_numbers_pkey" PRIMARY KEY ("tenant_phone_number_id")
);

-- CreateTable
CREATE TABLE "tenant_email_addresses" (
    "tenant_email_address_id" SERIAL NOT NULL,
    "tenant_id" INTEGER NOT NULL,
    "email_address" VARCHAR(255) NOT NULL,
    "is_primary" BOOLEAN NOT NULL DEFAULT false,
    "contact_type" "ContactType" NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" INTEGER NOT NULL,
    "updated_by" INTEGER,
    "deleted_at" TIMESTAMP(3),
    "deleted_by" INTEGER,
    "created_ip" VARCHAR(45),
    "updated_ip" VARCHAR(45),

    CONSTRAINT "tenant_email_addresses_pkey" PRIMARY KEY ("tenant_email_address_id")
);

-- CreateTable
CREATE TABLE "client_tenants" (
    "client_tenant_id" SERIAL NOT NULL,
    "client_id" INTEGER NOT NULL,
    "tenant_id" INTEGER NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" INTEGER NOT NULL,
    "updated_by" INTEGER,
    "deleted_at" TIMESTAMP(3),
    "deleted_by" INTEGER,
    "created_ip" VARCHAR(45),
    "updated_ip" VARCHAR(45),

    CONSTRAINT "client_tenants_pkey" PRIMARY KEY ("client_tenant_id")
);

-- CreateTable
CREATE TABLE "roles" (
    "role_id" SERIAL NOT NULL,
    "role_type" "UserType" NOT NULL,
    "role_name" VARCHAR(100) NOT NULL,
    "role_description" TEXT,
    "is_system_role" BOOLEAN NOT NULL DEFAULT false,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" INTEGER,
    "updated_by" INTEGER,
    "deleted_at" TIMESTAMP(3),
    "deleted_by" INTEGER,
    "created_ip" VARCHAR(45),
    "updated_ip" VARCHAR(45),

    CONSTRAINT "roles_pkey" PRIMARY KEY ("role_id")
);

-- CreateTable
CREATE TABLE "screens" (
    "screen_id" SERIAL NOT NULL,
    "screen_name" VARCHAR(100) NOT NULL,
    "screen_description" TEXT,
    "route_path" VARCHAR(255),
    "parent_screen_id" INTEGER,
    "sort_order" INTEGER,
    "icon_class" VARCHAR(100),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" INTEGER NOT NULL,
    "updated_by" INTEGER,
    "deleted_at" TIMESTAMP(3),
    "deleted_by" INTEGER,
    "created_ip" VARCHAR(45),
    "updated_ip" VARCHAR(45),

    CONSTRAINT "screens_pkey" PRIMARY KEY ("screen_id")
);

-- CreateTable
CREATE TABLE "system_users" (
    "system_user_id" SERIAL NOT NULL,
    "tenant_id" INTEGER,
    "role_type" "UserType" NOT NULL,
    "username" VARCHAR(50) NOT NULL,
    "full_name" VARCHAR(255) NOT NULL,
    "email_address" VARCHAR(255) NOT NULL,
    "password_hash" VARCHAR(255) NOT NULL,
    "last_login_at" TIMESTAMP(3),
    "login_attempts" INTEGER DEFAULT 0,
    "system_user_status" "SystemUserStatus" NOT NULL DEFAULT 'ACTIVE',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" INTEGER,
    "updated_by" INTEGER,
    "deleted_at" TIMESTAMP(3),
    "deleted_by" INTEGER,
    "created_ip" VARCHAR(45),
    "updated_ip" VARCHAR(45),

    CONSTRAINT "system_users_pkey" PRIMARY KEY ("system_user_id")
);

-- CreateTable
CREATE TABLE "user_screens" (
    "user_screen_id" SERIAL NOT NULL,
    "tenant_id" INTEGER NOT NULL,
    "system_user_id" INTEGER NOT NULL,
    "screen_id" INTEGER NOT NULL,
    "can_view" BOOLEAN NOT NULL DEFAULT false,
    "can_create" BOOLEAN NOT NULL DEFAULT false,
    "can_edit" BOOLEAN NOT NULL DEFAULT false,
    "can_delete" BOOLEAN NOT NULL DEFAULT false,
    "can_export" BOOLEAN NOT NULL DEFAULT false,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" INTEGER NOT NULL,
    "updated_by" INTEGER,
    "deleted_at" TIMESTAMP(3),
    "deleted_by" INTEGER,
    "created_ip" VARCHAR(45),
    "updated_ip" VARCHAR(45),

    CONSTRAINT "user_screens_pkey" PRIMARY KEY ("user_screen_id")
);

-- CreateTable
CREATE TABLE "role_screens" (
    "role_screen_id" SERIAL NOT NULL,
    "tenant_id" INTEGER NOT NULL,
    "role_type" "UserType" NOT NULL,
    "screen_id" INTEGER NOT NULL,
    "can_view" BOOLEAN NOT NULL DEFAULT false,
    "can_create" BOOLEAN NOT NULL DEFAULT false,
    "can_edit" BOOLEAN NOT NULL DEFAULT false,
    "can_delete" BOOLEAN NOT NULL DEFAULT false,
    "can_export" BOOLEAN NOT NULL DEFAULT false,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" INTEGER NOT NULL,
    "updated_by" INTEGER,
    "deleted_at" TIMESTAMP(3),
    "deleted_by" INTEGER,
    "created_ip" VARCHAR(45),
    "updated_ip" VARCHAR(45),

    CONSTRAINT "role_screens_pkey" PRIMARY KEY ("role_screen_id")
);

-- CreateTable
CREATE TABLE "countries" (
    "country_id" SERIAL NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "iso_code_2" VARCHAR(2),
    "iso_code_3" VARCHAR(3),
    "dial_code" VARCHAR(10),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" INTEGER NOT NULL,
    "updated_by" INTEGER,
    "deleted_at" TIMESTAMP(3),
    "deleted_by" INTEGER,
    "created_ip" VARCHAR(45),
    "updated_ip" VARCHAR(45),

    CONSTRAINT "countries_pkey" PRIMARY KEY ("country_id")
);

-- CreateTable
CREATE TABLE "states" (
    "state_id" SERIAL NOT NULL,
    "country_id" INTEGER NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "state_code" VARCHAR(10),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" INTEGER NOT NULL,
    "updated_by" INTEGER,
    "deleted_at" TIMESTAMP(3),
    "deleted_by" INTEGER,
    "created_ip" VARCHAR(45),
    "updated_ip" VARCHAR(45),

    CONSTRAINT "states_pkey" PRIMARY KEY ("state_id")
);

-- CreateTable
CREATE TABLE "cities" (
    "city_id" SERIAL NOT NULL,
    "state_id" INTEGER NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" INTEGER NOT NULL,
    "updated_by" INTEGER,
    "deleted_at" TIMESTAMP(3),
    "deleted_by" INTEGER,
    "created_ip" VARCHAR(45),
    "updated_ip" VARCHAR(45),

    CONSTRAINT "cities_pkey" PRIMARY KEY ("city_id")
);

-- CreateTable
CREATE TABLE "programs" (
    "program_id" SERIAL NOT NULL,
    "tenant_id" INTEGER NOT NULL,
    "program_name" VARCHAR(255) NOT NULL,
    "program_thumbnail_url" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" INTEGER NOT NULL,
    "updated_by" INTEGER,
    "deleted_at" TIMESTAMP(3),
    "deleted_by" INTEGER,
    "created_ip" VARCHAR(45),
    "updated_ip" VARCHAR(45),

    CONSTRAINT "programs_pkey" PRIMARY KEY ("program_id")
);

-- CreateTable
CREATE TABLE "specializations" (
    "specialization_id" SERIAL NOT NULL,
    "tenant_id" INTEGER NOT NULL,
    "program_id" INTEGER NOT NULL,
    "specialization_name" VARCHAR(255) NOT NULL,
    "specialization_thumbnail_url" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" INTEGER NOT NULL,
    "updated_by" INTEGER,
    "deleted_at" TIMESTAMP(3),
    "deleted_by" INTEGER,
    "created_ip" VARCHAR(45),
    "updated_ip" VARCHAR(45),

    CONSTRAINT "specializations_pkey" PRIMARY KEY ("specialization_id")
);

-- CreateTable
CREATE TABLE "institutes" (
    "institute_id" SERIAL NOT NULL,
    "tenant_id" INTEGER NOT NULL,
    "institute_name" VARCHAR(255) NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" INTEGER NOT NULL,
    "updated_by" INTEGER,
    "deleted_at" TIMESTAMP(3),
    "deleted_by" INTEGER,
    "created_ip" VARCHAR(45),
    "updated_ip" VARCHAR(45),

    CONSTRAINT "institutes_pkey" PRIMARY KEY ("institute_id")
);

-- CreateTable
CREATE TABLE "student_institutes" (
    "student_institute_id" SERIAL NOT NULL,
    "tenant_id" INTEGER NOT NULL,
    "student_id" INTEGER NOT NULL,
    "institute_id" INTEGER NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" INTEGER NOT NULL,
    "updated_by" INTEGER,
    "deleted_at" TIMESTAMP(3),
    "deleted_by" INTEGER,
    "created_ip" VARCHAR(45),
    "updated_ip" VARCHAR(45),

    CONSTRAINT "student_institutes_pkey" PRIMARY KEY ("student_institute_id")
);

-- CreateTable
CREATE TABLE "teachers" (
    "teacher_id" SERIAL NOT NULL,
    "tenant_id" INTEGER NOT NULL,
    "full_name" VARCHAR(255) NOT NULL,
    "first_name" VARCHAR(100) NOT NULL,
    "middle_name" VARCHAR(100),
    "last_name" VARCHAR(100) NOT NULL,
    "country_id" INTEGER,
    "state_id" INTEGER,
    "city_id" INTEGER,
    "address" TEXT,
    "teacher_qualification" TEXT,
    "date_of_birth" TIMESTAMP(3),
    "profile_picture_url" VARCHAR(500),
    "zip_code" VARCHAR(20),
    "age" INTEGER,
    "gender" "Gender",
    "username" VARCHAR(50) NOT NULL,
    "password_hash" VARCHAR(255) NOT NULL,
    "last_login_at" TIMESTAMP(3),
    "joining_date" TIMESTAMP(3),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" INTEGER NOT NULL,
    "updated_by" INTEGER,
    "deleted_at" TIMESTAMP(3),
    "deleted_by" INTEGER,
    "created_ip" VARCHAR(45),
    "updated_ip" VARCHAR(45),

    CONSTRAINT "teachers_pkey" PRIMARY KEY ("teacher_id")
);

-- CreateTable
CREATE TABLE "teacher_email_addresses" (
    "teacher_email_address_id" SERIAL NOT NULL,
    "tenant_id" INTEGER NOT NULL,
    "teacher_id" INTEGER NOT NULL,
    "email_address" VARCHAR(255) NOT NULL,
    "is_primary" BOOLEAN NOT NULL DEFAULT false,
    "priority" INTEGER,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" INTEGER NOT NULL,
    "updated_by" INTEGER,
    "deleted_at" TIMESTAMP(3),
    "deleted_by" INTEGER,
    "created_ip" VARCHAR(45),
    "updated_ip" VARCHAR(45),

    CONSTRAINT "teacher_email_addresses_pkey" PRIMARY KEY ("teacher_email_address_id")
);

-- CreateTable
CREATE TABLE "teacher_phone_numbers" (
    "teacher_phone_number_id" SERIAL NOT NULL,
    "tenant_id" INTEGER NOT NULL,
    "teacher_id" INTEGER NOT NULL,
    "dial_code" VARCHAR(10) NOT NULL,
    "phone_number" VARCHAR(20) NOT NULL,
    "iso_country_code" VARCHAR(3),
    "is_primary" BOOLEAN NOT NULL DEFAULT false,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" INTEGER NOT NULL,
    "updated_by" INTEGER,
    "deleted_at" TIMESTAMP(3),
    "deleted_by" INTEGER,
    "created_ip" VARCHAR(45),
    "updated_ip" VARCHAR(45),

    CONSTRAINT "teacher_phone_numbers_pkey" PRIMARY KEY ("teacher_phone_number_id")
);

-- CreateTable
CREATE TABLE "students" (
    "student_id" SERIAL NOT NULL,
    "tenant_id" INTEGER NOT NULL,
    "full_name" VARCHAR(255) NOT NULL,
    "first_name" VARCHAR(100) NOT NULL,
    "middle_name" VARCHAR(100),
    "last_name" VARCHAR(100) NOT NULL,
    "country_id" INTEGER NOT NULL,
    "state_id" INTEGER NOT NULL,
    "city_id" INTEGER NOT NULL,
    "address" TEXT,
    "date_of_birth" TIMESTAMP(3),
    "profile_picture_url" VARCHAR(500),
    "zip_code" VARCHAR(20),
    "age" INTEGER,
    "gender" "Gender",
    "username" VARCHAR(50) NOT NULL,
    "password_hash" VARCHAR(255) NOT NULL,
    "last_login_at" TIMESTAMP(3),
    "student_status" "StudentStatus" NOT NULL DEFAULT 'ACTIVE',
    "referral_type" VARCHAR(100),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" INTEGER NOT NULL,
    "updated_by" INTEGER,
    "deleted_at" TIMESTAMP(3),
    "deleted_by" INTEGER,
    "created_ip" VARCHAR(45),
    "updated_ip" VARCHAR(45),

    CONSTRAINT "students_pkey" PRIMARY KEY ("student_id")
);

-- CreateTable
CREATE TABLE "student_email_addresses" (
    "student_email_address_id" SERIAL NOT NULL,
    "tenant_id" INTEGER NOT NULL,
    "student_id" INTEGER NOT NULL,
    "email_address" VARCHAR(255) NOT NULL,
    "is_primary" BOOLEAN NOT NULL DEFAULT false,
    "priority" INTEGER,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" INTEGER NOT NULL,
    "updated_by" INTEGER,
    "deleted_at" TIMESTAMP(3),
    "deleted_by" INTEGER,
    "created_ip" VARCHAR(45),
    "updated_ip" VARCHAR(45),

    CONSTRAINT "student_email_addresses_pkey" PRIMARY KEY ("student_email_address_id")
);

-- CreateTable
CREATE TABLE "student_phone_numbers" (
    "student_phone_number_id" SERIAL NOT NULL,
    "tenant_id" INTEGER NOT NULL,
    "student_id" INTEGER NOT NULL,
    "dial_code" VARCHAR(10) NOT NULL,
    "phone_number" VARCHAR(20) NOT NULL,
    "iso_country_code" VARCHAR(3),
    "is_primary" BOOLEAN NOT NULL DEFAULT false,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" INTEGER NOT NULL,
    "updated_by" INTEGER,
    "deleted_at" TIMESTAMP(3),
    "deleted_by" INTEGER,
    "created_ip" VARCHAR(45),
    "updated_ip" VARCHAR(45),

    CONSTRAINT "student_phone_numbers_pkey" PRIMARY KEY ("student_phone_number_id")
);

-- CreateTable
CREATE TABLE "student_devices" (
    "student_device_id" SERIAL NOT NULL,
    "tenant_id" INTEGER NOT NULL,
    "student_id" INTEGER NOT NULL,
    "device_type" "DeviceType" NOT NULL,
    "device_identifier" VARCHAR(255) NOT NULL,
    "device_ip" VARCHAR(45),
    "mac_address" VARCHAR(17),
    "is_primary" BOOLEAN NOT NULL DEFAULT false,
    "last_active_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" INTEGER NOT NULL,
    "updated_by" INTEGER,
    "deleted_at" TIMESTAMP(3),
    "deleted_by" INTEGER,
    "created_ip" VARCHAR(45),
    "updated_ip" VARCHAR(45),

    CONSTRAINT "student_devices_pkey" PRIMARY KEY ("student_device_id")
);

-- CreateTable
CREATE TABLE "courses" (
    "course_id" SERIAL NOT NULL,
    "tenant_id" INTEGER NOT NULL,
    "course_name" VARCHAR(255) NOT NULL,
    "course_description" TEXT,
    "main_thumbnail_url" TEXT,
    "course_status" "CourseStatus" NOT NULL DEFAULT 'DRAFT',
    "course_type" "CourseType" NOT NULL DEFAULT 'PAID',
    "course_price" DECIMAL(10,2),
    "course_total_hours" DECIMAL(6,2),
    "specialization_id" INTEGER,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" INTEGER NOT NULL,
    "updated_by" INTEGER,
    "deleted_at" TIMESTAMP(3),
    "deleted_by" INTEGER,
    "created_ip" VARCHAR(45),
    "updated_ip" VARCHAR(45),

    CONSTRAINT "courses_pkey" PRIMARY KEY ("course_id")
);

-- CreateTable
CREATE TABLE "course_modules" (
    "course_module_id" SERIAL NOT NULL,
    "tenant_id" INTEGER NOT NULL,
    "course_id" INTEGER NOT NULL,
    "course_module_name" VARCHAR(255) NOT NULL,
    "position" INTEGER,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" INTEGER NOT NULL,
    "updated_by" INTEGER,
    "deleted_at" TIMESTAMP(3),
    "deleted_by" INTEGER,
    "created_ip" VARCHAR(45),
    "updated_ip" VARCHAR(45),

    CONSTRAINT "course_modules_pkey" PRIMARY KEY ("course_module_id")
);

-- CreateTable
CREATE TABLE "course_topics" (
    "course_topic_id" SERIAL NOT NULL,
    "tenant_id" INTEGER NOT NULL,
    "module_id" INTEGER NOT NULL,
    "course_topic_name" VARCHAR(255) NOT NULL,
    "position" INTEGER,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" INTEGER NOT NULL,
    "updated_by" INTEGER,
    "deleted_at" TIMESTAMP(3),
    "deleted_by" INTEGER,
    "created_ip" VARCHAR(45),
    "updated_ip" VARCHAR(45),

    CONSTRAINT "course_topics_pkey" PRIMARY KEY ("course_topic_id")
);

-- CreateTable
CREATE TABLE "course_videos" (
    "course_video_id" SERIAL NOT NULL,
    "tenant_id" INTEGER NOT NULL,
    "course_id" INTEGER NOT NULL,
    "course_topic_id" INTEGER NOT NULL,
    "bunny_video_id" VARCHAR(255) NOT NULL,
    "video_name" VARCHAR(255) NOT NULL,
    "video_url" TEXT NOT NULL,
    "thumbnail_url" TEXT,
    "duration_seconds" INTEGER,
    "position" INTEGER,
    "upload_status" "VideoUploadStatus" DEFAULT 'PENDING',
    "IsLocked" BOOLEAN NOT NULL DEFAULT false,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" INTEGER NOT NULL,
    "updated_by" INTEGER,
    "deleted_at" TIMESTAMP(3),
    "deleted_by" INTEGER,
    "created_ip" VARCHAR(45),
    "updated_ip" VARCHAR(45),

    CONSTRAINT "course_videos_pkey" PRIMARY KEY ("course_video_id")
);

-- CreateTable
CREATE TABLE "course_documents" (
    "course_document_id" SERIAL NOT NULL,
    "tenant_id" INTEGER NOT NULL,
    "course_id" INTEGER NOT NULL,
    "course_topic_id" INTEGER NOT NULL,
    "document_name" VARCHAR(255) NOT NULL,
    "document_url" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" INTEGER NOT NULL,
    "updated_by" INTEGER,
    "deleted_at" TIMESTAMP(3),
    "deleted_by" INTEGER,
    "created_ip" VARCHAR(45),
    "updated_ip" VARCHAR(45),

    CONSTRAINT "course_documents_pkey" PRIMARY KEY ("course_document_id")
);

-- CreateTable
CREATE TABLE "enrollments" (
    "enrollment_id" SERIAL NOT NULL,
    "tenant_id" INTEGER NOT NULL,
    "course_id" INTEGER NOT NULL,
    "student_id" INTEGER NOT NULL,
    "institute_id" INTEGER NOT NULL,
    "teacher_id" INTEGER,
    "enrollment_status" "EnrollmentStatus" NOT NULL DEFAULT 'PENDING',
    "enrolled_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expected_completion_date" TIMESTAMP(3),
    "actual_completion_date" TIMESTAMP(3),
    "status_changed_at" TIMESTAMP(3),
    "status_changed_by" INTEGER,
    "status_change_reason" TEXT,
    "grade" VARCHAR(10),
    "final_score" DECIMAL(5,2),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" INTEGER NOT NULL,
    "created_ip" VARCHAR(45),
    "updated_at" TIMESTAMP(3),
    "updated_by" INTEGER,
    "updated_ip" VARCHAR(45),
    "deleted_at" TIMESTAMP(3),
    "deleted_by" INTEGER,

    CONSTRAINT "enrollments_pkey" PRIMARY KEY ("enrollment_id")
);

-- CreateTable
CREATE TABLE "enrollment_status_histories" (
    "enrollment_status_history_id" SERIAL NOT NULL,
    "tenant_id" INTEGER NOT NULL,
    "enrollment_id" INTEGER NOT NULL,
    "previous_status" "EnrollmentStatus",
    "new_status" "EnrollmentStatus" NOT NULL,
    "status_changed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "changed_by" INTEGER NOT NULL,
    "change_reason" TEXT,
    "notes" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" INTEGER NOT NULL,
    "created_ip" VARCHAR(45),
    "updated_at" TIMESTAMP(3),
    "updated_by" INTEGER,
    "updated_ip" VARCHAR(45),
    "deleted_at" TIMESTAMP(3),
    "deleted_by" INTEGER,

    CONSTRAINT "enrollment_status_histories_pkey" PRIMARY KEY ("enrollment_status_history_id")
);

-- CreateTable
CREATE TABLE "student_course_progresses" (
    "student_course_progress_id" SERIAL NOT NULL,
    "tenant_id" INTEGER NOT NULL,
    "student_id" INTEGER NOT NULL,
    "course_id" INTEGER NOT NULL,
    "overall_progress_percentage" INTEGER NOT NULL DEFAULT 0,
    "modules_completed" INTEGER NOT NULL DEFAULT 0,
    "videos_completed" INTEGER NOT NULL DEFAULT 0,
    "quizzes_completed" INTEGER NOT NULL DEFAULT 0,
    "assignments_completed" INTEGER NOT NULL DEFAULT 0,
    "total_time_spent_minutes" INTEGER NOT NULL DEFAULT 0,
    "last_accessed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "is_course_completed" BOOLEAN NOT NULL DEFAULT false,
    "completion_date" TIMESTAMP(3),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" INTEGER NOT NULL,
    "created_ip" VARCHAR(45),
    "updated_at" TIMESTAMP(3),
    "updated_by" INTEGER,
    "updated_ip" VARCHAR(45),
    "deleted_at" TIMESTAMP(3),
    "deleted_by" INTEGER,

    CONSTRAINT "student_course_progresses_pkey" PRIMARY KEY ("student_course_progress_id")
);

-- CreateTable
CREATE TABLE "teacher_courses" (
    "teacher_course_id" SERIAL NOT NULL,
    "tenant_id" INTEGER NOT NULL,
    "course_id" INTEGER NOT NULL,
    "teacher_id" INTEGER NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" INTEGER NOT NULL,
    "created_ip" VARCHAR(45),
    "updated_at" TIMESTAMP(3),
    "updated_by" INTEGER,
    "updated_ip" VARCHAR(45),
    "deleted_at" TIMESTAMP(3),
    "deleted_by" INTEGER,

    CONSTRAINT "teacher_courses_pkey" PRIMARY KEY ("teacher_course_id")
);

-- CreateTable
CREATE TABLE "course_sessions" (
    "course_session_id" SERIAL NOT NULL,
    "tenant_id" INTEGER NOT NULL,
    "teacher_id" INTEGER NOT NULL,
    "course_id" INTEGER NOT NULL,
    "course_session_status" "CourseSessionStatus" NOT NULL DEFAULT 'DRAFT',
    "session_name" VARCHAR(255) NOT NULL,
    "session_description" TEXT,
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3) NOT NULL,
    "max_students" INTEGER,
    "enrollment_deadline" TIMESTAMP(3),
    "session_timezone" VARCHAR(50),
    "session_code" VARCHAR(20),
    "auto_expire_enabled" BOOLEAN NOT NULL DEFAULT true,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" INTEGER NOT NULL,
    "created_ip" VARCHAR(45),
    "updated_at" TIMESTAMP(3),
    "updated_by" INTEGER,
    "updated_ip" VARCHAR(45),
    "deleted_at" TIMESTAMP(3),
    "deleted_by" INTEGER,

    CONSTRAINT "course_sessions_pkey" PRIMARY KEY ("course_session_id")
);

-- CreateTable
CREATE TABLE "course_session_enrollments" (
    "course_session_enrollment_id" SERIAL NOT NULL,
    "tenant_id" INTEGER NOT NULL,
    "course_session_id" INTEGER NOT NULL,
    "student_id" INTEGER NOT NULL,
    "enrolled_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dropped_at" TIMESTAMP(3),
    "enrollment_status" "SessionEnrollmentStatus" NOT NULL DEFAULT 'PENDING',
    "completion_percentage" INTEGER NOT NULL DEFAULT 0,
    "final_grade" INTEGER,
    "completion_date" TIMESTAMP(3),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" INTEGER NOT NULL,
    "created_ip" VARCHAR(45),
    "updated_at" TIMESTAMP(3),
    "updated_by" INTEGER,
    "updated_ip" VARCHAR(45),
    "deleted_at" TIMESTAMP(3),
    "deleted_by" INTEGER,

    CONSTRAINT "course_session_enrollments_pkey" PRIMARY KEY ("course_session_enrollment_id")
);

-- CreateTable
CREATE TABLE "course_session_settings" (
    "course_session_settings_id" SERIAL NOT NULL,
    "tenant_id" INTEGER NOT NULL,
    "course_session_id" INTEGER NOT NULL,
    "allow_late_enrollment" BOOLEAN NOT NULL DEFAULT false,
    "require_approval_for_enrollment" BOOLEAN NOT NULL DEFAULT false,
    "allow_student_discussions" BOOLEAN NOT NULL DEFAULT true,
    "send_reminder_emails" BOOLEAN NOT NULL DEFAULT true,
    "reminder_days_before_expiry" INTEGER NOT NULL DEFAULT 7,
    "grading_scale" JSONB,
    "attendance_tracking_enabled" BOOLEAN NOT NULL DEFAULT false,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" INTEGER NOT NULL,
    "created_ip" VARCHAR(45),
    "updated_at" TIMESTAMP(3),
    "updated_by" INTEGER,
    "updated_ip" VARCHAR(45),
    "deleted_at" TIMESTAMP(3),
    "deleted_by" INTEGER,

    CONSTRAINT "course_session_settings_pkey" PRIMARY KEY ("course_session_settings_id")
);

-- CreateTable
CREATE TABLE "video_progresses" (
    "video_progress_id" SERIAL NOT NULL,
    "tenant_id" INTEGER NOT NULL,
    "student_id" INTEGER NOT NULL,
    "course_video_id" INTEGER NOT NULL,
    "watch_duration_seconds" INTEGER NOT NULL DEFAULT 0,
    "completion_percentage" INTEGER NOT NULL DEFAULT 0,
    "last_watched_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "is_completed" BOOLEAN NOT NULL DEFAULT false,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" INTEGER NOT NULL,
    "created_ip" VARCHAR(45),
    "updated_at" TIMESTAMP(3),
    "updated_by" INTEGER,
    "updated_ip" VARCHAR(45),
    "deleted_at" TIMESTAMP(3),
    "deleted_by" INTEGER,

    CONSTRAINT "video_progresses_pkey" PRIMARY KEY ("video_progress_id")
);

-- CreateTable
CREATE TABLE "quizzes" (
    "quiz_id" SERIAL NOT NULL,
    "tenant_id" INTEGER NOT NULL,
    "course_id" INTEGER NOT NULL,
    "teacher_id" INTEGER NOT NULL,
    "quiz_name" VARCHAR(255) NOT NULL,
    "quiz_description" TEXT,
    "total_marks" DECIMAL(6,2) NOT NULL,
    "passing_marks" DECIMAL(6,2),
    "time_limit_minutes" INTEGER,
    "max_attempts" INTEGER,
    "allow_retake" BOOLEAN NOT NULL DEFAULT false,
    "randomize_questions" BOOLEAN NOT NULL DEFAULT false,
    "due_date" TIMESTAMP(3),
    "status" "QuizStatus" NOT NULL DEFAULT 'DRAFT',
    "instructions" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" INTEGER NOT NULL,
    "updated_by" INTEGER,
    "deleted_at" TIMESTAMP(3),
    "deleted_by" INTEGER,
    "created_ip" VARCHAR(45),
    "updated_ip" VARCHAR(45),

    CONSTRAINT "quizzes_pkey" PRIMARY KEY ("quiz_id")
);

-- CreateTable
CREATE TABLE "quiz_mappings" (
    "quiz_mapping_id" SERIAL NOT NULL,
    "tenant_id" INTEGER NOT NULL,
    "quiz_id" INTEGER NOT NULL,
    "reference_table_type" "QuizReferenceTable" NOT NULL,
    "reference_id" INTEGER NOT NULL,
    "teacher_id" INTEGER NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" INTEGER NOT NULL,
    "updated_by" INTEGER,
    "deleted_at" TIMESTAMP(3),
    "deleted_by" INTEGER,
    "created_ip" VARCHAR(45),
    "updated_ip" VARCHAR(45),

    CONSTRAINT "quiz_mappings_pkey" PRIMARY KEY ("quiz_mapping_id")
);

-- CreateTable
CREATE TABLE "quiz_questions" (
    "quiz_question_id" SERIAL NOT NULL,
    "tenant_id" INTEGER NOT NULL,
    "quiz_id" INTEGER NOT NULL,
    "teacher_id" INTEGER NOT NULL,
    "question_text" TEXT NOT NULL,
    "question_type" "QuizQuestionType" NOT NULL,
    "question_marks" DECIMAL(6,2) NOT NULL,
    "position" INTEGER NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" INTEGER NOT NULL,
    "updated_by" INTEGER,
    "deleted_at" TIMESTAMP(3),
    "deleted_by" INTEGER,
    "created_ip" VARCHAR(45),
    "updated_ip" VARCHAR(45),

    CONSTRAINT "quiz_questions_pkey" PRIMARY KEY ("quiz_question_id")
);

-- CreateTable
CREATE TABLE "quiz_question_options" (
    "quiz_question_option_id" SERIAL NOT NULL,
    "tenant_id" INTEGER NOT NULL,
    "quiz_question_id" INTEGER NOT NULL,
    "option_text" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    "is_correct" BOOLEAN NOT NULL DEFAULT false,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" INTEGER NOT NULL,
    "updated_by" INTEGER,
    "deleted_at" TIMESTAMP(3),
    "deleted_by" INTEGER,
    "created_ip" VARCHAR(45),
    "updated_ip" VARCHAR(45),

    CONSTRAINT "quiz_question_options_pkey" PRIMARY KEY ("quiz_question_option_id")
);

-- CreateTable
CREATE TABLE "quiz_question_answers" (
    "quiz_question_answer_id" SERIAL NOT NULL,
    "tenant_id" INTEGER NOT NULL,
    "quiz_question_id" INTEGER NOT NULL,
    "answer_text" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" INTEGER NOT NULL,
    "updated_by" INTEGER,
    "deleted_at" TIMESTAMP(3),
    "deleted_by" INTEGER,
    "created_ip" VARCHAR(45),
    "updated_ip" VARCHAR(45),

    CONSTRAINT "quiz_question_answers_pkey" PRIMARY KEY ("quiz_question_answer_id")
);

-- CreateTable
CREATE TABLE "quiz_attempts" (
    "quiz_attempt_id" SERIAL NOT NULL,
    "tenant_id" INTEGER NOT NULL,
    "quiz_id" INTEGER NOT NULL,
    "student_id" INTEGER NOT NULL,
    "attempt_number" INTEGER NOT NULL,
    "started_at" TIMESTAMP(3) NOT NULL,
    "submitted_at" TIMESTAMP(3),
    "score" DECIMAL(6,2),
    "percentage" DECIMAL(5,2),
    "status" "QuizAttemptStatus" NOT NULL,
    "time_taken_minutes" INTEGER,
    "graded_by" INTEGER,
    "graded_at" TIMESTAMP(3),
    "teacher_notes" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" INTEGER NOT NULL,
    "updated_by" INTEGER,
    "deleted_at" TIMESTAMP(3),
    "deleted_by" INTEGER,
    "created_ip" VARCHAR(45),
    "updated_ip" VARCHAR(45),

    CONSTRAINT "quiz_attempts_pkey" PRIMARY KEY ("quiz_attempt_id")
);

-- CreateTable
CREATE TABLE "quiz_attempt_answers" (
    "quiz_attempt_answer_id" SERIAL NOT NULL,
    "tenant_id" INTEGER NOT NULL,
    "quiz_attempt_id" INTEGER NOT NULL,
    "quiz_question_id" INTEGER NOT NULL,
    "quiz_question_option_id" INTEGER,
    "answer_text" TEXT,
    "is_correct" BOOLEAN,
    "marks_obtained" DECIMAL(6,2),
    "reviewed_by_teacher_id" INTEGER,
    "teacher_comment" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" INTEGER NOT NULL,
    "updated_by" INTEGER,
    "deleted_at" TIMESTAMP(3),
    "deleted_by" INTEGER,
    "created_ip" VARCHAR(45),
    "updated_ip" VARCHAR(45),

    CONSTRAINT "quiz_attempt_answers_pkey" PRIMARY KEY ("quiz_attempt_answer_id")
);

-- CreateTable
CREATE TABLE "assignments" (
    "assignment_id" SERIAL NOT NULL,
    "tenant_id" INTEGER NOT NULL,
    "course_id" INTEGER NOT NULL,
    "teacher_id" INTEGER NOT NULL,
    "assignment_name" VARCHAR(255) NOT NULL,
    "assignment_description" TEXT,
    "assignment_type" "AssignmentType" NOT NULL DEFAULT 'FILE_UPLOAD',
    "total_marks" DECIMAL(6,2) NOT NULL,
    "passing_marks" DECIMAL(6,2),
    "due_date" TIMESTAMP(3) NOT NULL,
    "allow_late_submissions" BOOLEAN NOT NULL DEFAULT false,
    "max_file_size_mb" INTEGER,
    "allowed_file_types" TEXT,
    "max_attempts" INTEGER,
    "status" "AssignmentStatus" NOT NULL DEFAULT 'DRAFT',
    "instructions" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" INTEGER NOT NULL,
    "updated_by" INTEGER,
    "deleted_at" TIMESTAMP(3),
    "deleted_by" INTEGER,
    "created_ip" VARCHAR(45),
    "updated_ip" VARCHAR(45),

    CONSTRAINT "assignments_pkey" PRIMARY KEY ("assignment_id")
);

-- CreateTable
CREATE TABLE "assignment_mappings" (
    "assignment_mapping_id" SERIAL NOT NULL,
    "tenant_id" INTEGER NOT NULL,
    "assignment_id" INTEGER NOT NULL,
    "reference_table_type" "AssignmentReferenceTable" NOT NULL,
    "reference_id" INTEGER NOT NULL,
    "teacher_id" INTEGER NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" INTEGER NOT NULL,
    "updated_by" INTEGER,
    "deleted_at" TIMESTAMP(3),
    "deleted_by" INTEGER,
    "created_ip" VARCHAR(45),
    "updated_ip" VARCHAR(45),

    CONSTRAINT "assignment_mappings_pkey" PRIMARY KEY ("assignment_mapping_id")
);

-- CreateTable
CREATE TABLE "student_assignments" (
    "student_assignment_id" SERIAL NOT NULL,
    "tenant_id" INTEGER NOT NULL,
    "assignment_id" INTEGER NOT NULL,
    "student_id" INTEGER NOT NULL,
    "attempt_number" INTEGER NOT NULL,
    "submission_date" TIMESTAMP(3),
    "submission_status" "SubmissionStatus" NOT NULL DEFAULT 'PENDING',
    "grade" DECIMAL(6,2),
    "percentage" DECIMAL(5,2),
    "feedback" TEXT,
    "graded_by" INTEGER,
    "graded_at" TIMESTAMP(3),
    "teacher_notes" TEXT,
    "is_late_submission" BOOLEAN NOT NULL DEFAULT false,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" INTEGER NOT NULL,
    "updated_by" INTEGER,
    "deleted_at" TIMESTAMP(3),
    "deleted_by" INTEGER,
    "created_ip" VARCHAR(45),
    "updated_ip" VARCHAR(45),

    CONSTRAINT "student_assignments_pkey" PRIMARY KEY ("student_assignment_id")
);

-- CreateTable
CREATE TABLE "assignment_submission_files" (
    "assignment_submission_file_id" SERIAL NOT NULL,
    "tenant_id" INTEGER NOT NULL,
    "student_assignment_id" INTEGER NOT NULL,
    "original_file_name" VARCHAR(255) NOT NULL,
    "file_url" TEXT NOT NULL,
    "file_size_bytes" INTEGER,
    "mime_type" VARCHAR(128),
    "upload_status" "UploadStatus" DEFAULT 'PENDING',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" INTEGER NOT NULL,
    "updated_by" INTEGER,
    "deleted_at" TIMESTAMP(3),
    "deleted_by" INTEGER,
    "created_ip" VARCHAR(45),
    "updated_ip" VARCHAR(45),

    CONSTRAINT "assignment_submission_files_pkey" PRIMARY KEY ("assignment_submission_file_id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "notification_id" SERIAL NOT NULL,
    "tenant_id" INTEGER NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "message" TEXT NOT NULL,
    "notification_type" "NotificationType" NOT NULL,
    "priority" "NotificationPriority" NOT NULL DEFAULT 'NORMAL',
    "sender_id" INTEGER,
    "category_id" INTEGER,
    "scheduled_at" TIMESTAMP(3),
    "expires_at" TIMESTAMP(3),
    "metadata" JSONB,
    "is_read_receipt_required" BOOLEAN NOT NULL DEFAULT false,
    "target_audience" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" INTEGER NOT NULL,
    "updated_by" INTEGER,
    "deleted_at" TIMESTAMP(3),
    "deleted_by" INTEGER,
    "created_ip" VARCHAR(45),
    "updated_ip" VARCHAR(45),

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("notification_id")
);

-- CreateTable
CREATE TABLE "course_session_announcements" (
    "announcement_id" SERIAL NOT NULL,
    "tenant_id" INTEGER NOT NULL,
    "course_session_id" INTEGER NOT NULL,
    "teacher_id" INTEGER NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "content" TEXT NOT NULL,
    "announcement_type" INTEGER NOT NULL DEFAULT 1,
    "is_pinned" BOOLEAN NOT NULL DEFAULT false,
    "is_published" BOOLEAN NOT NULL DEFAULT true,
    "publish_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiry_date" TIMESTAMP(3),
    "attachment_url" TEXT,
    "attachment_type" VARCHAR(50),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" INTEGER NOT NULL,
    "updated_by" INTEGER,
    "deleted_at" TIMESTAMP(3),
    "deleted_by" INTEGER,
    "created_ip" VARCHAR(45),
    "updated_ip" VARCHAR(45),

    CONSTRAINT "course_session_announcements_pkey" PRIMARY KEY ("announcement_id")
);

-- CreateTable
CREATE TABLE "notification_deliveries" (
    "notification_delivery_id" SERIAL NOT NULL,
    "tenant_id" INTEGER NOT NULL,
    "notification_id" INTEGER NOT NULL,
    "recipient_id" INTEGER NOT NULL,
    "recipient_type" "RecipientType" NOT NULL,
    "delivery_channel" "DeliveryChannel" NOT NULL,
    "delivery_status" "DeliveryStatus" NOT NULL DEFAULT 'PENDING',
    "delivered_at" TIMESTAMP(3),
    "read_at" TIMESTAMP(3),
    "dismissed_at" TIMESTAMP(3),
    "failure_reason" TEXT,
    "retry_count" INTEGER NOT NULL DEFAULT 0,
    "delivery_metadata" JSONB,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" INTEGER NOT NULL,
    "updated_by" INTEGER,
    "deleted_at" TIMESTAMP(3),
    "deleted_by" INTEGER,
    "created_ip" VARCHAR(45),
    "updated_ip" VARCHAR(45),

    CONSTRAINT "notification_deliveries_pkey" PRIMARY KEY ("notification_delivery_id")
);

-- CreateTable
CREATE TABLE "email_queues" (
    "email_queue_id" SERIAL NOT NULL,
    "tenant_id" INTEGER NOT NULL,
    "notification_id" INTEGER NOT NULL,
    "recipient_email" VARCHAR(255) NOT NULL,
    "recipient_name" VARCHAR(255),
    "subject" VARCHAR(255) NOT NULL,
    "body_html" TEXT,
    "body_text" TEXT,
    "send_status" "EmailSendStatus" NOT NULL DEFAULT 'PENDING',
    "send_attempts" INTEGER NOT NULL DEFAULT 0,
    "last_attempt_at" TIMESTAMP(3),
    "sent_at" TIMESTAMP(3),
    "failure_reason" TEXT,
    "priority" INTEGER NOT NULL DEFAULT 5,
    "scheduled_for" TIMESTAMP(3),
    "email_provider_id" VARCHAR(255),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" INTEGER NOT NULL,
    "updated_by" INTEGER,
    "deleted_at" TIMESTAMP(3),
    "deleted_by" INTEGER,
    "created_ip" VARCHAR(45),
    "updated_ip" VARCHAR(45),

    CONSTRAINT "email_queues_pkey" PRIMARY KEY ("email_queue_id")
);

-- CreateTable
CREATE TABLE "notification_templates" (
    "notification_template_id" SERIAL NOT NULL,
    "tenant_id" INTEGER NOT NULL,
    "template_name" VARCHAR(255) NOT NULL,
    "template_type" "TemplateType" NOT NULL,
    "subject_template" TEXT,
    "body_template" TEXT NOT NULL,
    "variables" JSONB,
    "is_system_template" BOOLEAN NOT NULL DEFAULT false,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" INTEGER NOT NULL,
    "updated_by" INTEGER,
    "deleted_at" TIMESTAMP(3),
    "deleted_by" INTEGER,
    "created_ip" VARCHAR(45),
    "updated_ip" VARCHAR(45),

    CONSTRAINT "notification_templates_pkey" PRIMARY KEY ("notification_template_id")
);

-- CreateTable
CREATE TABLE "push_notification_devices" (
    "push_device_id" SERIAL NOT NULL,
    "tenant_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "user_type" "RecipientType" NOT NULL,
    "device_token" VARCHAR(500) NOT NULL,
    "device_type" "DeviceType" NOT NULL,
    "app_version" VARCHAR(50),
    "os_version" VARCHAR(50),
    "is_production" BOOLEAN NOT NULL DEFAULT true,
    "last_used_at" TIMESTAMP(3),
    "expires_at" TIMESTAMP(3),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" INTEGER NOT NULL,
    "updated_by" INTEGER,
    "deleted_at" TIMESTAMP(3),
    "deleted_by" INTEGER,
    "created_ip" VARCHAR(45),
    "updated_ip" VARCHAR(45),

    CONSTRAINT "push_notification_devices_pkey" PRIMARY KEY ("push_device_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "uq_tenants_tenant_name" ON "tenants"("tenant_name");

-- CreateIndex
CREATE UNIQUE INDEX "roles_role_type_key" ON "roles"("role_type");

-- CreateIndex
CREATE UNIQUE INDEX "course_session_settings_course_session_id_key" ON "course_session_settings"("course_session_id");

-- AddForeignKey
ALTER TABLE "tenants" ADD CONSTRAINT "tenants_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "system_users"("system_user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenants" ADD CONSTRAINT "tenants_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "system_users"("system_user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenants" ADD CONSTRAINT "tenants_deleted_by_fkey" FOREIGN KEY ("deleted_by") REFERENCES "system_users"("system_user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clients" ADD CONSTRAINT "clients_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("tenant_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clients" ADD CONSTRAINT "clients_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "system_users"("system_user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clients" ADD CONSTRAINT "clients_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "system_users"("system_user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clients" ADD CONSTRAINT "clients_deleted_by_fkey" FOREIGN KEY ("deleted_by") REFERENCES "system_users"("system_user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant_phone_numbers" ADD CONSTRAINT "tenant_phone_numbers_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("tenant_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant_phone_numbers" ADD CONSTRAINT "tenant_phone_numbers_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "system_users"("system_user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant_phone_numbers" ADD CONSTRAINT "tenant_phone_numbers_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "system_users"("system_user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant_phone_numbers" ADD CONSTRAINT "tenant_phone_numbers_deleted_by_fkey" FOREIGN KEY ("deleted_by") REFERENCES "system_users"("system_user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant_email_addresses" ADD CONSTRAINT "tenant_email_addresses_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("tenant_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant_email_addresses" ADD CONSTRAINT "tenant_email_addresses_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "system_users"("system_user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant_email_addresses" ADD CONSTRAINT "tenant_email_addresses_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "system_users"("system_user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant_email_addresses" ADD CONSTRAINT "tenant_email_addresses_deleted_by_fkey" FOREIGN KEY ("deleted_by") REFERENCES "system_users"("system_user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "client_tenants" ADD CONSTRAINT "client_tenants_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "clients"("client_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "client_tenants" ADD CONSTRAINT "client_tenants_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("tenant_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "client_tenants" ADD CONSTRAINT "client_tenants_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "system_users"("system_user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "client_tenants" ADD CONSTRAINT "client_tenants_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "system_users"("system_user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "client_tenants" ADD CONSTRAINT "client_tenants_deleted_by_fkey" FOREIGN KEY ("deleted_by") REFERENCES "system_users"("system_user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "roles" ADD CONSTRAINT "roles_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "system_users"("system_user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "roles" ADD CONSTRAINT "roles_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "system_users"("system_user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "roles" ADD CONSTRAINT "roles_deleted_by_fkey" FOREIGN KEY ("deleted_by") REFERENCES "system_users"("system_user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "screens" ADD CONSTRAINT "screens_parent_screen_id_fkey" FOREIGN KEY ("parent_screen_id") REFERENCES "screens"("screen_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "screens" ADD CONSTRAINT "screens_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "system_users"("system_user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "screens" ADD CONSTRAINT "screens_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "system_users"("system_user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "screens" ADD CONSTRAINT "screens_deleted_by_fkey" FOREIGN KEY ("deleted_by") REFERENCES "system_users"("system_user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "system_users" ADD CONSTRAINT "system_users_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("tenant_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "system_users" ADD CONSTRAINT "system_users_role_type_fkey" FOREIGN KEY ("role_type") REFERENCES "roles"("role_type") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "system_users" ADD CONSTRAINT "system_users_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "system_users"("system_user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "system_users" ADD CONSTRAINT "system_users_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "system_users"("system_user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "system_users" ADD CONSTRAINT "system_users_deleted_by_fkey" FOREIGN KEY ("deleted_by") REFERENCES "system_users"("system_user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_screens" ADD CONSTRAINT "user_screens_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("tenant_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_screens" ADD CONSTRAINT "user_screens_system_user_id_fkey" FOREIGN KEY ("system_user_id") REFERENCES "system_users"("system_user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_screens" ADD CONSTRAINT "user_screens_screen_id_fkey" FOREIGN KEY ("screen_id") REFERENCES "screens"("screen_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_screens" ADD CONSTRAINT "user_screens_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "system_users"("system_user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_screens" ADD CONSTRAINT "user_screens_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "system_users"("system_user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_screens" ADD CONSTRAINT "user_screens_deleted_by_fkey" FOREIGN KEY ("deleted_by") REFERENCES "system_users"("system_user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role_screens" ADD CONSTRAINT "role_screens_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("tenant_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role_screens" ADD CONSTRAINT "role_screens_role_type_fkey" FOREIGN KEY ("role_type") REFERENCES "roles"("role_type") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role_screens" ADD CONSTRAINT "role_screens_screen_id_fkey" FOREIGN KEY ("screen_id") REFERENCES "screens"("screen_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role_screens" ADD CONSTRAINT "role_screens_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "system_users"("system_user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role_screens" ADD CONSTRAINT "role_screens_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "system_users"("system_user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role_screens" ADD CONSTRAINT "role_screens_deleted_by_fkey" FOREIGN KEY ("deleted_by") REFERENCES "system_users"("system_user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "countries" ADD CONSTRAINT "countries_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "system_users"("system_user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "countries" ADD CONSTRAINT "countries_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "system_users"("system_user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "countries" ADD CONSTRAINT "countries_deleted_by_fkey" FOREIGN KEY ("deleted_by") REFERENCES "system_users"("system_user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "states" ADD CONSTRAINT "states_country_id_fkey" FOREIGN KEY ("country_id") REFERENCES "countries"("country_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "states" ADD CONSTRAINT "states_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "system_users"("system_user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "states" ADD CONSTRAINT "states_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "system_users"("system_user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "states" ADD CONSTRAINT "states_deleted_by_fkey" FOREIGN KEY ("deleted_by") REFERENCES "system_users"("system_user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cities" ADD CONSTRAINT "cities_state_id_fkey" FOREIGN KEY ("state_id") REFERENCES "states"("state_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cities" ADD CONSTRAINT "cities_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "system_users"("system_user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cities" ADD CONSTRAINT "cities_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "system_users"("system_user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cities" ADD CONSTRAINT "cities_deleted_by_fkey" FOREIGN KEY ("deleted_by") REFERENCES "system_users"("system_user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "programs" ADD CONSTRAINT "programs_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("tenant_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "programs" ADD CONSTRAINT "programs_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "system_users"("system_user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "programs" ADD CONSTRAINT "programs_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "system_users"("system_user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "programs" ADD CONSTRAINT "programs_deleted_by_fkey" FOREIGN KEY ("deleted_by") REFERENCES "system_users"("system_user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "specializations" ADD CONSTRAINT "specializations_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("tenant_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "specializations" ADD CONSTRAINT "specializations_program_id_fkey" FOREIGN KEY ("program_id") REFERENCES "programs"("program_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "specializations" ADD CONSTRAINT "specializations_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "system_users"("system_user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "specializations" ADD CONSTRAINT "specializations_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "system_users"("system_user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "specializations" ADD CONSTRAINT "specializations_deleted_by_fkey" FOREIGN KEY ("deleted_by") REFERENCES "system_users"("system_user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "institutes" ADD CONSTRAINT "institutes_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("tenant_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "institutes" ADD CONSTRAINT "institutes_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "system_users"("system_user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "institutes" ADD CONSTRAINT "institutes_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "system_users"("system_user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "institutes" ADD CONSTRAINT "institutes_deleted_by_fkey" FOREIGN KEY ("deleted_by") REFERENCES "system_users"("system_user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_institutes" ADD CONSTRAINT "student_institutes_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("tenant_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_institutes" ADD CONSTRAINT "student_institutes_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("student_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_institutes" ADD CONSTRAINT "student_institutes_institute_id_fkey" FOREIGN KEY ("institute_id") REFERENCES "institutes"("institute_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_institutes" ADD CONSTRAINT "student_institutes_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "system_users"("system_user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_institutes" ADD CONSTRAINT "student_institutes_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "system_users"("system_user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_institutes" ADD CONSTRAINT "student_institutes_deleted_by_fkey" FOREIGN KEY ("deleted_by") REFERENCES "system_users"("system_user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teachers" ADD CONSTRAINT "teachers_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("tenant_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teachers" ADD CONSTRAINT "teachers_country_id_fkey" FOREIGN KEY ("country_id") REFERENCES "countries"("country_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teachers" ADD CONSTRAINT "teachers_state_id_fkey" FOREIGN KEY ("state_id") REFERENCES "states"("state_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teachers" ADD CONSTRAINT "teachers_city_id_fkey" FOREIGN KEY ("city_id") REFERENCES "cities"("city_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teachers" ADD CONSTRAINT "teachers_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "system_users"("system_user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teachers" ADD CONSTRAINT "teachers_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "system_users"("system_user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teachers" ADD CONSTRAINT "teachers_deleted_by_fkey" FOREIGN KEY ("deleted_by") REFERENCES "system_users"("system_user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teacher_email_addresses" ADD CONSTRAINT "teacher_email_addresses_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("tenant_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teacher_email_addresses" ADD CONSTRAINT "teacher_email_addresses_teacher_id_fkey" FOREIGN KEY ("teacher_id") REFERENCES "teachers"("teacher_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teacher_email_addresses" ADD CONSTRAINT "teacher_email_addresses_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "system_users"("system_user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teacher_email_addresses" ADD CONSTRAINT "teacher_email_addresses_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "system_users"("system_user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teacher_email_addresses" ADD CONSTRAINT "teacher_email_addresses_deleted_by_fkey" FOREIGN KEY ("deleted_by") REFERENCES "system_users"("system_user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teacher_phone_numbers" ADD CONSTRAINT "teacher_phone_numbers_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("tenant_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teacher_phone_numbers" ADD CONSTRAINT "teacher_phone_numbers_teacher_id_fkey" FOREIGN KEY ("teacher_id") REFERENCES "teachers"("teacher_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teacher_phone_numbers" ADD CONSTRAINT "teacher_phone_numbers_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "system_users"("system_user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teacher_phone_numbers" ADD CONSTRAINT "teacher_phone_numbers_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "system_users"("system_user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teacher_phone_numbers" ADD CONSTRAINT "teacher_phone_numbers_deleted_by_fkey" FOREIGN KEY ("deleted_by") REFERENCES "system_users"("system_user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "students" ADD CONSTRAINT "students_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("tenant_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "students" ADD CONSTRAINT "students_country_id_fkey" FOREIGN KEY ("country_id") REFERENCES "countries"("country_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "students" ADD CONSTRAINT "students_state_id_fkey" FOREIGN KEY ("state_id") REFERENCES "states"("state_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "students" ADD CONSTRAINT "students_city_id_fkey" FOREIGN KEY ("city_id") REFERENCES "cities"("city_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "students" ADD CONSTRAINT "students_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "system_users"("system_user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "students" ADD CONSTRAINT "students_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "system_users"("system_user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "students" ADD CONSTRAINT "students_deleted_by_fkey" FOREIGN KEY ("deleted_by") REFERENCES "system_users"("system_user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_email_addresses" ADD CONSTRAINT "student_email_addresses_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("tenant_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_email_addresses" ADD CONSTRAINT "student_email_addresses_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("student_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_email_addresses" ADD CONSTRAINT "student_email_addresses_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "system_users"("system_user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_email_addresses" ADD CONSTRAINT "student_email_addresses_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "system_users"("system_user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_email_addresses" ADD CONSTRAINT "student_email_addresses_deleted_by_fkey" FOREIGN KEY ("deleted_by") REFERENCES "system_users"("system_user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_phone_numbers" ADD CONSTRAINT "student_phone_numbers_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("tenant_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_phone_numbers" ADD CONSTRAINT "student_phone_numbers_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("student_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_phone_numbers" ADD CONSTRAINT "student_phone_numbers_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "system_users"("system_user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_phone_numbers" ADD CONSTRAINT "student_phone_numbers_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "system_users"("system_user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_phone_numbers" ADD CONSTRAINT "student_phone_numbers_deleted_by_fkey" FOREIGN KEY ("deleted_by") REFERENCES "system_users"("system_user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_devices" ADD CONSTRAINT "student_devices_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("tenant_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_devices" ADD CONSTRAINT "student_devices_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("student_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_devices" ADD CONSTRAINT "student_devices_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "system_users"("system_user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_devices" ADD CONSTRAINT "student_devices_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "system_users"("system_user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_devices" ADD CONSTRAINT "student_devices_deleted_by_fkey" FOREIGN KEY ("deleted_by") REFERENCES "system_users"("system_user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "courses" ADD CONSTRAINT "courses_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("tenant_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "courses" ADD CONSTRAINT "courses_specialization_id_fkey" FOREIGN KEY ("specialization_id") REFERENCES "specializations"("specialization_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "courses" ADD CONSTRAINT "courses_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "system_users"("system_user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "courses" ADD CONSTRAINT "courses_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "system_users"("system_user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "courses" ADD CONSTRAINT "courses_deleted_by_fkey" FOREIGN KEY ("deleted_by") REFERENCES "system_users"("system_user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "course_modules" ADD CONSTRAINT "course_modules_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("tenant_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "course_modules" ADD CONSTRAINT "course_modules_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "courses"("course_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "course_modules" ADD CONSTRAINT "course_modules_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "system_users"("system_user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "course_modules" ADD CONSTRAINT "course_modules_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "system_users"("system_user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "course_modules" ADD CONSTRAINT "course_modules_deleted_by_fkey" FOREIGN KEY ("deleted_by") REFERENCES "system_users"("system_user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "course_topics" ADD CONSTRAINT "course_topics_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("tenant_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "course_topics" ADD CONSTRAINT "course_topics_module_id_fkey" FOREIGN KEY ("module_id") REFERENCES "course_modules"("course_module_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "course_topics" ADD CONSTRAINT "course_topics_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "system_users"("system_user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "course_topics" ADD CONSTRAINT "course_topics_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "system_users"("system_user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "course_topics" ADD CONSTRAINT "course_topics_deleted_by_fkey" FOREIGN KEY ("deleted_by") REFERENCES "system_users"("system_user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "course_videos" ADD CONSTRAINT "course_videos_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("tenant_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "course_videos" ADD CONSTRAINT "course_videos_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "courses"("course_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "course_videos" ADD CONSTRAINT "course_videos_course_topic_id_fkey" FOREIGN KEY ("course_topic_id") REFERENCES "course_topics"("course_topic_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "course_videos" ADD CONSTRAINT "course_videos_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "system_users"("system_user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "course_videos" ADD CONSTRAINT "course_videos_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "system_users"("system_user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "course_videos" ADD CONSTRAINT "course_videos_deleted_by_fkey" FOREIGN KEY ("deleted_by") REFERENCES "system_users"("system_user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "course_documents" ADD CONSTRAINT "course_documents_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("tenant_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "course_documents" ADD CONSTRAINT "course_documents_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "courses"("course_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "course_documents" ADD CONSTRAINT "course_documents_course_topic_id_fkey" FOREIGN KEY ("course_topic_id") REFERENCES "course_topics"("course_topic_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "course_documents" ADD CONSTRAINT "course_documents_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "system_users"("system_user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "course_documents" ADD CONSTRAINT "course_documents_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "system_users"("system_user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "course_documents" ADD CONSTRAINT "course_documents_deleted_by_fkey" FOREIGN KEY ("deleted_by") REFERENCES "system_users"("system_user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "enrollments" ADD CONSTRAINT "enrollments_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("tenant_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "enrollments" ADD CONSTRAINT "enrollments_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "courses"("course_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "enrollments" ADD CONSTRAINT "enrollments_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("student_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "enrollments" ADD CONSTRAINT "enrollments_institute_id_fkey" FOREIGN KEY ("institute_id") REFERENCES "institutes"("institute_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "enrollments" ADD CONSTRAINT "enrollments_teacher_id_fkey" FOREIGN KEY ("teacher_id") REFERENCES "teachers"("teacher_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "enrollments" ADD CONSTRAINT "enrollments_status_changed_by_fkey" FOREIGN KEY ("status_changed_by") REFERENCES "system_users"("system_user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "enrollments" ADD CONSTRAINT "enrollments_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "system_users"("system_user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "enrollments" ADD CONSTRAINT "enrollments_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "system_users"("system_user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "enrollments" ADD CONSTRAINT "enrollments_deleted_by_fkey" FOREIGN KEY ("deleted_by") REFERENCES "system_users"("system_user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "enrollment_status_histories" ADD CONSTRAINT "enrollment_status_histories_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("tenant_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "enrollment_status_histories" ADD CONSTRAINT "enrollment_status_histories_enrollment_id_fkey" FOREIGN KEY ("enrollment_id") REFERENCES "enrollments"("enrollment_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "enrollment_status_histories" ADD CONSTRAINT "enrollment_status_histories_changed_by_fkey" FOREIGN KEY ("changed_by") REFERENCES "system_users"("system_user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "enrollment_status_histories" ADD CONSTRAINT "enrollment_status_histories_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "system_users"("system_user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "enrollment_status_histories" ADD CONSTRAINT "enrollment_status_histories_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "system_users"("system_user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "enrollment_status_histories" ADD CONSTRAINT "enrollment_status_histories_deleted_by_fkey" FOREIGN KEY ("deleted_by") REFERENCES "system_users"("system_user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_course_progresses" ADD CONSTRAINT "student_course_progresses_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("tenant_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_course_progresses" ADD CONSTRAINT "student_course_progresses_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("student_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_course_progresses" ADD CONSTRAINT "student_course_progresses_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "courses"("course_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_course_progresses" ADD CONSTRAINT "student_course_progresses_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "system_users"("system_user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_course_progresses" ADD CONSTRAINT "student_course_progresses_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "system_users"("system_user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_course_progresses" ADD CONSTRAINT "student_course_progresses_deleted_by_fkey" FOREIGN KEY ("deleted_by") REFERENCES "system_users"("system_user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teacher_courses" ADD CONSTRAINT "teacher_courses_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("tenant_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teacher_courses" ADD CONSTRAINT "teacher_courses_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "courses"("course_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teacher_courses" ADD CONSTRAINT "teacher_courses_teacher_id_fkey" FOREIGN KEY ("teacher_id") REFERENCES "teachers"("teacher_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teacher_courses" ADD CONSTRAINT "teacher_courses_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "system_users"("system_user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teacher_courses" ADD CONSTRAINT "teacher_courses_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "system_users"("system_user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teacher_courses" ADD CONSTRAINT "teacher_courses_deleted_by_fkey" FOREIGN KEY ("deleted_by") REFERENCES "system_users"("system_user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "course_sessions" ADD CONSTRAINT "course_sessions_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("tenant_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "course_sessions" ADD CONSTRAINT "course_sessions_teacher_id_fkey" FOREIGN KEY ("teacher_id") REFERENCES "teachers"("teacher_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "course_sessions" ADD CONSTRAINT "course_sessions_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "courses"("course_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "course_sessions" ADD CONSTRAINT "course_sessions_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "system_users"("system_user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "course_sessions" ADD CONSTRAINT "course_sessions_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "system_users"("system_user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "course_sessions" ADD CONSTRAINT "course_sessions_deleted_by_fkey" FOREIGN KEY ("deleted_by") REFERENCES "system_users"("system_user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "course_session_enrollments" ADD CONSTRAINT "course_session_enrollments_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("tenant_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "course_session_enrollments" ADD CONSTRAINT "course_session_enrollments_course_session_id_fkey" FOREIGN KEY ("course_session_id") REFERENCES "course_sessions"("course_session_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "course_session_enrollments" ADD CONSTRAINT "course_session_enrollments_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("student_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "course_session_enrollments" ADD CONSTRAINT "course_session_enrollments_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "system_users"("system_user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "course_session_enrollments" ADD CONSTRAINT "course_session_enrollments_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "system_users"("system_user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "course_session_enrollments" ADD CONSTRAINT "course_session_enrollments_deleted_by_fkey" FOREIGN KEY ("deleted_by") REFERENCES "system_users"("system_user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "course_session_settings" ADD CONSTRAINT "course_session_settings_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("tenant_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "course_session_settings" ADD CONSTRAINT "course_session_settings_course_session_id_fkey" FOREIGN KEY ("course_session_id") REFERENCES "course_sessions"("course_session_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "course_session_settings" ADD CONSTRAINT "course_session_settings_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "system_users"("system_user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "course_session_settings" ADD CONSTRAINT "course_session_settings_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "system_users"("system_user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "course_session_settings" ADD CONSTRAINT "course_session_settings_deleted_by_fkey" FOREIGN KEY ("deleted_by") REFERENCES "system_users"("system_user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "video_progresses" ADD CONSTRAINT "video_progresses_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("tenant_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "video_progresses" ADD CONSTRAINT "video_progresses_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("student_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "video_progresses" ADD CONSTRAINT "video_progresses_course_video_id_fkey" FOREIGN KEY ("course_video_id") REFERENCES "course_videos"("course_video_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "video_progresses" ADD CONSTRAINT "video_progresses_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "system_users"("system_user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "video_progresses" ADD CONSTRAINT "video_progresses_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "system_users"("system_user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "video_progresses" ADD CONSTRAINT "video_progresses_deleted_by_fkey" FOREIGN KEY ("deleted_by") REFERENCES "system_users"("system_user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quizzes" ADD CONSTRAINT "quizzes_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("tenant_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quizzes" ADD CONSTRAINT "quizzes_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "courses"("course_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quizzes" ADD CONSTRAINT "quizzes_teacher_id_fkey" FOREIGN KEY ("teacher_id") REFERENCES "teachers"("teacher_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quiz_mappings" ADD CONSTRAINT "quiz_mappings_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("tenant_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quiz_mappings" ADD CONSTRAINT "quiz_mappings_quiz_id_fkey" FOREIGN KEY ("quiz_id") REFERENCES "quizzes"("quiz_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quiz_mappings" ADD CONSTRAINT "quiz_mappings_teacher_id_fkey" FOREIGN KEY ("teacher_id") REFERENCES "teachers"("teacher_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quiz_questions" ADD CONSTRAINT "quiz_questions_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("tenant_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quiz_questions" ADD CONSTRAINT "quiz_questions_quiz_id_fkey" FOREIGN KEY ("quiz_id") REFERENCES "quizzes"("quiz_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quiz_questions" ADD CONSTRAINT "quiz_questions_teacher_id_fkey" FOREIGN KEY ("teacher_id") REFERENCES "teachers"("teacher_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quiz_question_options" ADD CONSTRAINT "quiz_question_options_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("tenant_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quiz_question_options" ADD CONSTRAINT "quiz_question_options_quiz_question_id_fkey" FOREIGN KEY ("quiz_question_id") REFERENCES "quiz_questions"("quiz_question_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quiz_question_answers" ADD CONSTRAINT "quiz_question_answers_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("tenant_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quiz_question_answers" ADD CONSTRAINT "quiz_question_answers_quiz_question_id_fkey" FOREIGN KEY ("quiz_question_id") REFERENCES "quiz_questions"("quiz_question_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quiz_attempts" ADD CONSTRAINT "quiz_attempts_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("tenant_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quiz_attempts" ADD CONSTRAINT "quiz_attempts_quiz_id_fkey" FOREIGN KEY ("quiz_id") REFERENCES "quizzes"("quiz_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quiz_attempts" ADD CONSTRAINT "quiz_attempts_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("student_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quiz_attempt_answers" ADD CONSTRAINT "quiz_attempt_answers_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("tenant_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quiz_attempt_answers" ADD CONSTRAINT "quiz_attempt_answers_quiz_attempt_id_fkey" FOREIGN KEY ("quiz_attempt_id") REFERENCES "quiz_attempts"("quiz_attempt_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quiz_attempt_answers" ADD CONSTRAINT "quiz_attempt_answers_quiz_question_id_fkey" FOREIGN KEY ("quiz_question_id") REFERENCES "quiz_questions"("quiz_question_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quiz_attempt_answers" ADD CONSTRAINT "quiz_attempt_answers_quiz_question_option_id_fkey" FOREIGN KEY ("quiz_question_option_id") REFERENCES "quiz_question_options"("quiz_question_option_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quiz_attempt_answers" ADD CONSTRAINT "quiz_attempt_answers_reviewed_by_teacher_id_fkey" FOREIGN KEY ("reviewed_by_teacher_id") REFERENCES "teachers"("teacher_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assignments" ADD CONSTRAINT "assignments_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("tenant_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assignments" ADD CONSTRAINT "assignments_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "courses"("course_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assignments" ADD CONSTRAINT "assignments_teacher_id_fkey" FOREIGN KEY ("teacher_id") REFERENCES "teachers"("teacher_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assignment_mappings" ADD CONSTRAINT "assignment_mappings_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("tenant_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assignment_mappings" ADD CONSTRAINT "assignment_mappings_assignment_id_fkey" FOREIGN KEY ("assignment_id") REFERENCES "assignments"("assignment_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assignment_mappings" ADD CONSTRAINT "assignment_mappings_teacher_id_fkey" FOREIGN KEY ("teacher_id") REFERENCES "teachers"("teacher_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_assignments" ADD CONSTRAINT "student_assignments_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("tenant_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_assignments" ADD CONSTRAINT "student_assignments_assignment_id_fkey" FOREIGN KEY ("assignment_id") REFERENCES "assignments"("assignment_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_assignments" ADD CONSTRAINT "student_assignments_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("student_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assignment_submission_files" ADD CONSTRAINT "assignment_submission_files_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("tenant_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assignment_submission_files" ADD CONSTRAINT "assignment_submission_files_student_assignment_id_fkey" FOREIGN KEY ("student_assignment_id") REFERENCES "student_assignments"("student_assignment_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("tenant_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "course_session_announcements" ADD CONSTRAINT "course_session_announcements_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("tenant_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "course_session_announcements" ADD CONSTRAINT "course_session_announcements_course_session_id_fkey" FOREIGN KEY ("course_session_id") REFERENCES "course_sessions"("course_session_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "course_session_announcements" ADD CONSTRAINT "course_session_announcements_teacher_id_fkey" FOREIGN KEY ("teacher_id") REFERENCES "teachers"("teacher_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notification_deliveries" ADD CONSTRAINT "notification_deliveries_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("tenant_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notification_deliveries" ADD CONSTRAINT "notification_deliveries_notification_id_fkey" FOREIGN KEY ("notification_id") REFERENCES "notifications"("notification_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "email_queues" ADD CONSTRAINT "email_queues_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("tenant_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "email_queues" ADD CONSTRAINT "email_queues_notification_id_fkey" FOREIGN KEY ("notification_id") REFERENCES "notifications"("notification_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notification_templates" ADD CONSTRAINT "notification_templates_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("tenant_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "push_notification_devices" ADD CONSTRAINT "push_notification_devices_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("tenant_id") ON DELETE RESTRICT ON UPDATE CASCADE;
