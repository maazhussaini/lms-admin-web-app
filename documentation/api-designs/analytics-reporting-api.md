# Analytics & Reporting API Design

## 1. Introduction

The Analytics & Reporting API provides comprehensive data analytics and reporting capabilities for the Learning Management System (LMS). This API enables administrators, instructors, and stakeholders to gain insights into user engagement, course performance, learning outcomes, and system usage patterns. It supports real-time dashboards, scheduled reports, data export functionality, and advanced analytics with support for custom metrics and KPIs.

The Analytics API is designed to handle large datasets efficiently, providing both real-time analytics and historical reporting. Built on PostgreSQL with optimized queries and caching strategies, it ensures fast response times for dashboard data while supporting complex analytical queries for detailed reporting.

## 2. Data Model Overview

The Analytics domain consists of aggregated data entities, reporting configurations, and real-time metrics tracking.

### Core Analytics Entities

- **course_analytics** (`analytics.types.ts`): Aggregated course performance metrics
- **user_analytics** (`analytics.types.ts`): User engagement and progress analytics
- **system_metrics** (`analytics.types.ts`): System-wide performance and usage metrics
- **reports** (`analytics.types.ts`): Saved reports and report configurations
- **report_schedules** (`analytics.types.ts`): Automated report generation schedules
- **analytics_snapshots** (`analytics.types.ts`): Point-in-time analytics snapshots
- **custom_metrics** (`analytics.types.ts`): User-defined custom metrics and KPIs
- **dashboard_widgets** (`analytics.types.ts`): Dashboard widget configurations

### Analytics Aggregation Entities

- **daily_course_metrics** (`analytics.types.ts`): Daily aggregated course statistics
- **weekly_course_metrics** (`analytics.types.ts`): Weekly course performance summaries
- **monthly_user_metrics** (`analytics.types.ts`): Monthly user engagement metrics
- **assessment_analytics** (`analytics.types.ts`): Quiz and assignment performance analytics
- **video_watch_analytics** (`analytics.types.ts`): Video consumption and engagement metrics

### Export and Additional Entities

- **analytics_exports** (`analytics.types.ts`): Analytics data export records
- **custom_metric_results** (`analytics.types.ts`): Custom metric calculation results

### Key Enums

- **ReportType** (`analytics.types.ts`): `COURSE_PERFORMANCE`, `USER_ENGAGEMENT`, `SYSTEM_USAGE`, `ASSESSMENT_SUMMARY`, `VIDEO_ANALYTICS`, `CUSTOM`
- **ReportStatus** (`analytics.types.ts`): `DRAFT`, `SCHEDULED`, `GENERATING`, `COMPLETED`, `FAILED`, `CANCELLED`
- **MetricType** (`analytics.types.ts`): `COUNT`, `PERCENTAGE`, `AVERAGE`, `SUM`, `RATIO`, `TREND`
- **TimeGranularity** (`analytics.types.ts`): `HOURLY`, `DAILY`, `WEEKLY`, `MONTHLY`, `QUARTERLY`, `YEARLY`
- **WidgetType** (`analytics.types.ts`): `CHART`, `TABLE`, `METRIC_CARD`, `PROGRESS_BAR`, `MAP`, `TIMELINE`
- **ExportFormat** (`analytics.types.ts`): `PDF`, `EXCEL`, `CSV`, `JSON`

All entities inherit from **BaseAuditFields** (`base.types.ts`) providing comprehensive audit trails.

## 3. API Endpoints

### Admin/Management Analytics Endpoints

#### Dashboard Analytics

**Get Dashboard Overview**
- **GET** `/api/admin/analytics/dashboard`
- Returns high-level system metrics and KPIs
- Query Parameters: `period?`, `tenantId?`
- Response: `TApiSuccessResponse<DashboardOverview>` (200)

**Get Real-time Metrics**
- **GET** `/api/admin/analytics/realtime`
- Returns current system activity and live metrics
- Response: `TApiSuccessResponse<RealtimeMetrics>` (200)

**Get Custom Dashboard**
- **GET** `/api/admin/analytics/dashboard/{dashboardId}`
- Returns configured custom dashboard data
- Response: `TApiSuccessResponse<CustomDashboard>` (200)

**Create Dashboard Widget**
- **POST** `/api/admin/analytics/dashboard/widgets`
- Create custom dashboard widget
- Request Body: `Omit<DashboardWidget, 'widget_id' | BaseAuditFields>`
- Response: `TApiSuccessResponse<DashboardWidget>` (201)

**Update Dashboard Widget**
- **PATCH** `/api/admin/analytics/dashboard/widgets/{widgetId}`
- Update dashboard widget configuration
- Request Body: `Partial<Omit<DashboardWidget, 'widget_id' | BaseAuditFields>>`
- Response: `TApiSuccessResponse<DashboardWidget>` (200)

**Delete Dashboard Widget**
- **DELETE** `/api/admin/analytics/dashboard/widgets/{widgetId}`
- Remove dashboard widget
- Response: `TApiSuccessResponse<{ message: string }>` (200)

#### Course Analytics

**Get Course Performance**
- **GET** `/api/admin/analytics/courses/{courseId}/performance`
- Detailed course performance analytics
- Query Parameters: `startDate?`, `endDate?`, `granularity?`
- Response: `TApiSuccessResponse<CoursePerformanceAnalytics>` (200)

**Get Course Engagement**
- **GET** `/api/admin/analytics/courses/{courseId}/engagement`
- Student engagement metrics for course
- Query Parameters: `period?`, `studentId?`
- Response: `TApiSuccessResponse<CourseEngagementAnalytics>` (200)

**Get Course Completion Rates**
- **GET** `/api/admin/analytics/courses/{courseId}/completion`
- Course completion statistics and trends
- Query Parameters: `period?`, `groupBy?`
- Response: `TApiSuccessResponse<CourseCompletionAnalytics>` (200)

**Get Video Analytics**
- **GET** `/api/admin/analytics/courses/{courseId}/videos`
- Video consumption and engagement analytics
- Query Parameters: `videoId?`, `period?`
- Response: `TApiSuccessResponse<VideoAnalytics[]>` (200)

**Get Assessment Analytics**
- **GET** `/api/admin/analytics/courses/{courseId}/assessments`
- Quiz and assignment performance analytics
- Query Parameters: `assessmentType?`, `period?`
- Response: `TApiSuccessResponse<AssessmentAnalytics[]>` (200)

**Compare Courses**
- **GET** `/api/admin/analytics/courses/compare`
- Compare performance across multiple courses
- Query Parameters: `courseIds`, `metrics`, `period?`
- Response: `TApiSuccessResponse<CoursePerformanceAnalytics[]>` (200)

**Get Daily Course Metrics**
- **GET** `/api/admin/analytics/courses/{courseId}/daily-metrics`
- Daily aggregated course statistics
- Query Parameters: `startDate?`, `endDate?`
- Response: `TApiSuccessResponse<DailyCourseMetrics[]>` (200)

**Get Weekly Course Metrics**
- **GET** `/api/admin/analytics/courses/{courseId}/weekly-metrics`
- Weekly course performance summaries
- Query Parameters: `startDate?`, `endDate?`
- Response: `TApiSuccessResponse<WeeklyCourseMetrics[]>` (200)

#### User Analytics

**Get User Engagement**
- **GET** `/api/admin/analytics/users/{userId}/engagement`
- Individual user engagement metrics
- Query Parameters: `period?`, `courseId?`
- Response: `TApiSuccessResponse<UserEngagementAnalytics>` (200)

**Get User Progress**
- **GET** `/api/admin/analytics/users/{userId}/progress`
- User learning progress across courses
- Response: `TApiSuccessResponse<UserProgressAnalytics>` (200)

**Get User Cohort Analysis**
- **GET** `/api/admin/analytics/users/cohort`
- Cohort analysis for user groups
- Query Parameters: `cohortBy`, `period?`, `filters?`
- Response: `TApiSuccessResponse<UserAnalytics[]>` (200)

**Get User Retention**
- **GET** `/api/admin/analytics/users/retention`
- User retention metrics and trends
- Query Parameters: `period?`, `segmentBy?`
- Response: `TApiSuccessResponse<UserAnalytics[]>` (200)

**Get User Activity Heatmap**
- **GET** `/api/admin/analytics/users/activity-heatmap`
- User activity patterns visualization data
- Query Parameters: `period?`, `granularity?`
- Response: `TApiSuccessResponse<UserAnalytics[]>` (200)

**Get Monthly User Metrics**
- **GET** `/api/admin/analytics/users/{userId}/monthly-metrics`
- Monthly user engagement metrics
- Query Parameters: `year?`, `month?`
- Response: `TApiSuccessResponse<MonthlyUserMetrics[]>` (200)

#### System Analytics

**Get System Usage**
- **GET** `/api/admin/analytics/system/usage`
- Overall system usage statistics
- Query Parameters: `period?`, `granularity?`
- Response: `TApiSuccessResponse<SystemMetrics[]>` (200)

**Get Performance Metrics**
- **GET** `/api/admin/analytics/system/performance`
- System performance and health metrics
- Query Parameters: `period?`, `metric?`
- Response: `TApiSuccessResponse<SystemMetrics[]>` (200)

**Get Storage Analytics**
- **GET** `/api/admin/analytics/system/storage`
- Storage usage and trends
- Response: `TApiSuccessResponse<SystemMetrics>` (200)

**Get Traffic Analytics**
- **GET** `/api/admin/analytics/system/traffic`
- Traffic patterns and geographic distribution
- Query Parameters: `period?`, `granularity?`
- Response: `TApiSuccessResponse<SystemMetrics[]>` (200)

#### Institute Analytics

**Get Institute Performance**
- **GET** `/api/admin/analytics/institutes/{instituteId}/performance`
- Institute-level performance metrics
- Query Parameters: `period?`, `includeComparison?`
- Response: `TApiSuccessResponse<SystemMetrics>` (200)

**Get Institute Enrollment Trends**
- **GET** `/api/admin/analytics/institutes/{instituteId}/enrollments`
- Enrollment trends and patterns
- Query Parameters: `period?`, `courseId?`
- Response: `TApiSuccessResponse<CourseAnalytics[]>` (200)

#### Analytics Snapshots

**Create Analytics Snapshot**
- **POST** `/api/admin/analytics/snapshots`
- Create point-in-time analytics snapshot
- Request Body: `Omit<AnalyticsSnapshot, 'snapshot_id' | BaseAuditFields>`
- Response: `TApiSuccessResponse<AnalyticsSnapshot>` (201)

**List Analytics Snapshots**
- **GET** `/api/admin/analytics/snapshots`
- List available analytics snapshots
- Query Parameters: `type?`, `startDate?`, `endDate?`, `page?`, `limit?`
- Response: `TApiSuccessResponse<AnalyticsSnapshot[]>` (200)

**Get Analytics Snapshot**
- **GET** `/api/admin/analytics/snapshots/{snapshotId}`
- Get specific analytics snapshot
- Response: `TApiSuccessResponse<AnalyticsSnapshot>` (200)

**Delete Analytics Snapshot**
- **DELETE** `/api/admin/analytics/snapshots/{snapshotId}`
- Delete analytics snapshot
- Response: `TApiSuccessResponse<{ message: string }>` (200)

### Reporting Endpoints

#### Report Management

**Create Report**
- **POST** `/api/admin/reports`
- Create new report configuration
- Request Body: `Omit<Report, 'report_id' | BaseAuditFields>`
- Response: `TApiSuccessResponse<Report>` (201)

**List Reports**
- **GET** `/api/admin/reports`
- List available reports
- Query Parameters: `type?`, `status?`, `createdBy?`, `page?`, `limit?`
- Response: `TApiSuccessResponse<Report[]>` (200)

**Get Report**
- **GET** `/api/admin/reports/{reportId}`
- Get report configuration and data
- Response: `TApiSuccessResponse<Report & { data?: any }>` (200)

**Update Report**
- **PATCH** `/api/admin/reports/{reportId}`
- Update report configuration
- Request Body: `Partial<Omit<Report, 'report_id' | BaseAuditFields>>`
- Response: `TApiSuccessResponse<Report>` (200)

**Delete Report**
- **DELETE** `/api/admin/reports/{reportId}`
- Soft delete report
- Response: `TApiSuccessResponse<{ message: string }>` (200)

**Generate Report**
- **POST** `/api/admin/reports/{reportId}/generate`
- Generate report with current data
- Request Body: `{ parameters?: Record<string, any>, format?: ExportFormat }`
- Response: `TApiSuccessResponse<{ reportUrl: string, generatedAt: string }>` (200)

#### Report Scheduling

**Schedule Report**
- **POST** `/api/admin/reports/{reportId}/schedule`
- Schedule automatic report generation
- Request Body: `Omit<ReportSchedule, 'schedule_id' | 'report_id' | BaseAuditFields>`
- Response: `TApiSuccessResponse<ReportSchedule>` (201)

**List Scheduled Reports**
- **GET** `/api/admin/reports/schedules`
- List all scheduled reports
- Query Parameters: `status?`, `reportId?`
- Response: `TApiSuccessResponse<ReportSchedule[]>` (200)

**Update Schedule**
- **PATCH** `/api/admin/reports/schedules/{scheduleId}`
- Update report schedule
- Request Body: `Partial<Omit<ReportSchedule, 'schedule_id' | BaseAuditFields>>`
- Response: `TApiSuccessResponse<ReportSchedule>` (200)

**Cancel Schedule**
- **DELETE** `/api/admin/reports/schedules/{scheduleId}`
- Cancel scheduled report
- Response: `TApiSuccessResponse<{ message: string }>` (200)

#### Data Export

**Export Analytics Data**
- **POST** `/api/admin/analytics/export`
- Export analytics data in various formats
- Request Body: `{ dataType: string, filters?: object, format: ExportFormat, timeRange?: TimeRangeFilter }`
- Response: `TApiSuccessResponse<{ exportUrl: string, expiresAt: string }>` (200)

**Download Export**
- **GET** `/api/admin/analytics/exports/{exportId}/download`
- Download exported analytics data
- Response: File download (200)

**List Exports**
- **GET** `/api/admin/analytics/exports`
- List recent data exports
- Query Parameters: `status?`, `format?`, `page?`, `limit?`
- Response: `TApiSuccessResponse<AnalyticsExport[]>` (200)

**Get Export Status**
- **GET** `/api/admin/analytics/exports/{exportId}`
- Get export status and details
- Response: `TApiSuccessResponse<AnalyticsExport>` (200)

**Cancel Export**
- **DELETE** `/api/admin/analytics/exports/{exportId}`
- Cancel pending export
- Response: `TApiSuccessResponse<{ message: string }>` (200)

### Teacher Analytics Endpoints

#### Course-Specific Teacher Analytics

**Get My Course Analytics**
- **GET** `/api/teacher/analytics/courses/{courseId}`
- Analytics for teacher's assigned course
- Query Parameters: `period?`, `metric?`
- Response: `TApiSuccessResponse<CoursePerformanceAnalytics>` (200)

**Get Student Progress**
- **GET** `/api/teacher/analytics/courses/{courseId}/students`
- Student progress in teacher's course
- Query Parameters: `studentId?`, `includeDetails?`
- Response: `TApiSuccessResponse<UserProgressAnalytics[]>` (200)

**Get Assignment Analytics**
- **GET** `/api/teacher/analytics/assignments/{assignmentId}`
- Assignment submission and grading analytics
- Response: `TApiSuccessResponse<AssessmentAnalytics>` (200)

**Get Quiz Analytics**
- **GET** `/api/teacher/analytics/quizzes/{quizId}`
- Quiz performance analytics
- Response: `TApiSuccessResponse<AssessmentAnalytics>` (200)

**Get My Course Video Analytics**
- **GET** `/api/teacher/analytics/courses/{courseId}/video-analytics`
- Video watch analytics for teacher's course
- Query Parameters: `videoId?`, `period?`
- Response: `TApiSuccessResponse<VideoWatchAnalytics[]>` (200)

### Student Analytics Endpoints

#### Personal Analytics

**Get My Progress**
- **GET** `/api/student/analytics/progress`
- Personal learning progress across all courses
- Response: `TApiSuccessResponse<UserProgressAnalytics>` (200)

**Get My Engagement**
- **GET** `/api/student/analytics/engagement`
- Personal engagement metrics and trends
- Query Parameters: `period?`, `courseId?`
- Response: `TApiSuccessResponse<UserEngagementAnalytics>` (200)

**Get My Performance**
- **GET** `/api/student/analytics/performance`
- Assessment scores and performance trends
- Query Parameters: `courseId?`, `assessmentType?`
- Response: `TApiSuccessResponse<AssessmentAnalytics[]>` (200)

**Get Study Time Analytics**
- **GET** `/api/student/analytics/study-time`
- Time spent learning and activity patterns
- Query Parameters: `period?`, `granularity?`
- Response: `TApiSuccessResponse<UserAnalytics[]>` (200)

**Get My Video Watch History**
- **GET** `/api/student/analytics/video-history`
- Personal video watching analytics
- Query Parameters: `courseId?`, `period?`
- Response: `TApiSuccessResponse<VideoWatchAnalytics[]>` (200)

### Custom Metrics Endpoints

#### Custom Metric Management

**Create Custom Metric**
- **POST** `/api/admin/analytics/custom-metrics`
- Define custom business metric
- Request Body: `Omit<CustomMetric, 'metric_id' | BaseAuditFields>`
- Response: `TApiSuccessResponse<CustomMetric>` (201)

**Get Custom Metrics**
- **GET** `/api/admin/analytics/custom-metrics`
- List defined custom metrics
- Response: `TApiSuccessResponse<CustomMetric[]>` (200)

**Get Custom Metric**
- **GET** `/api/admin/analytics/custom-metrics/{metricId}`
- Get specific custom metric configuration
- Response: `TApiSuccessResponse<CustomMetric>` (200)

**Update Custom Metric**
- **PATCH** `/api/admin/analytics/custom-metrics/{metricId}`
- Update custom metric configuration
- Request Body: `Partial<Omit<CustomMetric, 'metric_id' | BaseAuditFields>>`
- Response: `TApiSuccessResponse<CustomMetric>` (200)

**Delete Custom Metric**
- **DELETE** `/api/admin/analytics/custom-metrics/{metricId}`
- Delete custom metric
- Response: `TApiSuccessResponse<{ message: string }>` (200)

**Calculate Custom Metric**
- **POST** `/api/admin/analytics/custom-metrics/{metricId}/calculate`
- Calculate custom metric value
- Request Body: `{ parameters?: object, timeRange?: TimeRangeFilter }`
- Response: `TApiSuccessResponse<CustomMetricResult>` (200)

## 4. Prisma Schema Considerations

### Analytics Tables

```prisma
model CourseAnalytics {
  analytics_id          Int       @id @default(autoincrement())
  course_id             Int
  tenant_id             Int
  period_start          DateTime
  period_end            DateTime
  total_enrollments     Int       @default(0)
  active_students       Int       @default(0)
  completion_rate       Decimal   @db.Decimal(5,2)
  average_progress      Decimal   @db.Decimal(5,2)
  total_watch_time      Int       @default(0) // in minutes
  quiz_completion_rate  Decimal   @db.Decimal(5,2)
  assignment_submission_rate Decimal @db.Decimal(5,2)
  engagement_score      Decimal   @db.Decimal(5,2)
  
  // Relations
  course                Course    @relation(fields: [course_id], references: [course_id])
  tenant                Tenant    @relation(fields: [tenant_id], references: [tenant_id])
  
  // Audit fields
  is_active             Boolean   @default(true)
  is_deleted            Boolean   @default(false)
  created_at            DateTime  @default(now())
  created_by            Int
  created_ip            String    @db.VarChar(45)
  updated_at            DateTime? @updatedAt
  updated_by            Int?
  updated_ip            String?   @db.VarChar(45)
  
  @@map("course_analytics")
  @@index([course_id])
  @@index([tenant_id])
  @@index([period_start, period_end])
  @@unique([course_id, period_start, period_end])
}

model UserAnalytics {
  analytics_id          Int       @id @default(autoincrement())
  user_id               Int
  user_type             String    @db.VarChar(20) // 'student', 'teacher'
  tenant_id             Int
  period_start          DateTime
  period_end            DateTime
  login_count           Int       @default(0)
  session_duration_avg  Int       @default(0) // in minutes
  courses_accessed      Int       @default(0)
  videos_watched        Int       @default(0)
  quizzes_attempted     Int       @default(0)
  assignments_submitted Int       @default(0)
  engagement_score      Decimal   @db.Decimal(5,2)
  
  // Relations
  tenant                Tenant    @relation(fields: [tenant_id], references: [tenant_id])
  
  // Audit fields
  is_active             Boolean   @default(true)
  is_deleted            Boolean   @default(false)
  created_at            DateTime  @default(now())
  created_by            Int
  created_ip            String    @db.VarChar(45)
  updated_at            DateTime? @updatedAt
  updated_by            Int?
  updated_ip            String?   @db.VarChar(45)
  
  @@map("user_analytics")
  @@index([user_id, user_type])
  @@index([tenant_id])
  @@index([period_start, period_end])
  @@unique([user_id, user_type, period_start, period_end])
}

model SystemMetrics {
  metrics_id            Int       @id @default(autoincrement())
  tenant_id             Int
  period_start          DateTime
  period_end            DateTime
  total_users           Int       @default(0)
  active_users          Int       @default(0)
  total_courses         Int       @default(0)
  active_courses        Int       @default(0)
  total_sessions        Int       @default(0)
  average_session_duration Int    @default(0) // in minutes
  total_video_views     Int       @default(0)
  total_storage_used    BigInt    @default(0) // in bytes
  bandwidth_used        BigInt    @default(0) // in bytes
  system_uptime         Decimal   @db.Decimal(5,2) // percentage
  error_rate            Decimal   @db.Decimal(5,2) // percentage
  
  // Relations
  tenant                Tenant    @relation(fields: [tenant_id], references: [tenant_id])
  
  // Audit fields
  is_active             Boolean   @default(true)
  is_deleted            Boolean   @default(false)
  created_at            DateTime  @default(now())
  created_by            Int
  created_ip            String    @db.VarChar(45)
  updated_at            DateTime? @updatedAt
  updated_by            Int?
  updated_ip            String?   @db.VarChar(45)
  
  @@map("system_metrics")
  @@index([tenant_id])
  @@index([period_start, period_end])
  @@unique([tenant_id, period_start, period_end])
}

model Report {
  report_id             Int       @id @default(autoincrement())
  report_name           String    @db.VarChar(255)
  report_type           Int       // ReportType enum
  report_description    String?   @db.Text
  report_config         Json      // Report configuration and parameters
  report_status         Int       @default(1) // ReportStatus enum
  tenant_id             Int
  last_generated_at     DateTime?
  report_data_url       String?   @db.VarChar(500)
  
  // Relations
  tenant                Tenant    @relation(fields: [tenant_id], references: [tenant_id])
  schedules             ReportSchedule[]
  
  // Audit fields
  is_active             Boolean   @default(true)
  is_deleted            Boolean   @default(false)
  created_at            DateTime  @default(now())
  created_by            Int
  created_ip            String    @db.VarChar(45)
  updated_at            DateTime? @updatedAt
  updated_by            Int?
  updated_ip            String?   @db.VarChar(45)
  
  @@map("reports")
  @@index([tenant_id])
  @@index([report_type])
  @@index([report_status])
}

model ReportSchedule {
  schedule_id           Int       @id @default(autoincrement())
  report_id             Int
  schedule_name         String    @db.VarChar(255)
  cron_expression       String    @db.VarChar(100)
  timezone              String    @db.VarChar(50)
  is_enabled            Boolean   @default(true)
  last_run_at           DateTime?
  next_run_at           DateTime?
  recipients            Json      // Array of email addresses or user IDs
  schedule_config       Json?     // Additional schedule configuration
  tenant_id             Int
  
  // Relations
  report                Report    @relation(fields: [report_id], references: [report_id])
  tenant                Tenant    @relation(fields: [tenant_id], references: [tenant_id])
  
  // Audit fields
  is_active             Boolean   @default(true)
  is_deleted            Boolean   @default(false)
  created_at            DateTime  @default(now())
  created_by            Int
  created_ip            String    @db.VarChar(45)
  updated_at            DateTime? @updatedAt
  updated_by            Int?
  updated_ip            String?   @db.VarChar(45)
  
  @@map("report_schedules")
  @@index([report_id])
  @@index([tenant_id])
  @@index([is_enabled])
}

model AnalyticsSnapshot {
  snapshot_id           Int       @id @default(autoincrement())
  snapshot_name         String    @db.VarChar(255)
  snapshot_type         String    @db.VarChar(50) // Type of snapshot (daily, weekly, monthly)
  tenant_id             Int
  snapshot_date         DateTime
  data                  Json      // JSON data containing the snapshot
  metadata              Json?     // Additional metadata
  
  // Relations
  tenant                Tenant    @relation(fields: [tenant_id], references: [tenant_id])
  
  // Audit fields
  is_active             Boolean   @default(true)
  is_deleted            Boolean   @default(false)
  created_at            DateTime  @default(now())
  created_by            Int
  created_ip            String    @db.VarChar(45)
  updated_at            DateTime? @updatedAt
  updated_by            Int?
  updated_ip            String?   @db.VarChar(45)
  
  @@map("analytics_snapshots")
  @@index([tenant_id])
  @@index([snapshot_date])
  @@index([snapshot_type])
}

model CustomMetric {
  metric_id             Int       @id @default(autoincrement())
  metric_name           String    @db.VarChar(255)
  metric_description    String?   @db.Text
  metric_type           Int       // MetricType enum
  calculation_config    Json      // Metric calculation configuration
  tenant_id             Int
  
  // Relations
  tenant                Tenant    @relation(fields: [tenant_id], references: [tenant_id])
  
  // Audit fields
  is_active             Boolean   @default(true)
  is_deleted            Boolean   @default(false)
  created_at            DateTime  @default(now())
  created_by            Int
  created_ip            String    @db.VarChar(45)
  updated_at            DateTime? @updatedAt
  updated_by            Int?
  updated_ip            String?   @db.VarChar(45)
  
  @@map("custom_metrics")
  @@index([tenant_id])
  @@index([metric_type])
}

model DashboardWidget {
  widget_id             Int       @id @default(autoincrement())
  widget_name           String    @db.VarChar(255)
  widget_type           Int       // WidgetType enum
  dashboard_id          Int?      // FK to Dashboard (if applicable)
  position_x            Int
  position_y            Int
  width                 Int
  height                Int
  widget_config         Json      // JSON widget configuration
  data_source           String    @db.VarChar(255) // Data source identifier
  tenant_id             Int
  user_id               Int?      // For user-specific widgets
  
  // Relations
  tenant                Tenant    @relation(fields: [tenant_id], references: [tenant_id])
  
  // Audit fields
  is_active             Boolean   @default(true)
  is_deleted            Boolean   @default(false)
  created_at            DateTime  @default(now())
  created_by            Int
  created_ip            String    @db.VarChar(45)
  updated_at            DateTime? @updatedAt
  updated_by            Int?
  updated_ip            String?   @db.VarChar(45)
  
  @@map("dashboard_widgets")
  @@index([tenant_id])
  @@index([user_id])
  @@index([dashboard_id])
}

model DailyCourseMetrics {
  metrics_id            Int       @id @default(autoincrement())
  course_id             Int
  date                  DateTime  @db.Date
  total_views           Int       @default(0)
  unique_viewers        Int       @default(0)
  total_watch_time      Int       @default(0) // in minutes
  completion_count      Int       @default(0)
  quiz_attempts         Int       @default(0)
  assignment_submissions Int      @default(0)
  average_engagement    Decimal   @db.Decimal(5,2)
  tenant_id             Int
  
  // Relations
  course                Course    @relation(fields: [course_id], references: [course_id])
  tenant                Tenant    @relation(fields: [tenant_id], references: [tenant_id])
  
  // Audit fields
  is_active             Boolean   @default(true)
  is_deleted            Boolean   @default(false)
  created_at            DateTime  @default(now())
  created_by            Int
  created_ip            String    @db.VarChar(45)
  updated_at            DateTime? @updatedAt
  updated_by            Int?
  updated_ip            String?   @db.VarChar(45)
  
  @@map("daily_course_metrics")
  @@index([course_id])
  @@index([tenant_id])
  @@index([date])
  @@unique([course_id, date])
}

model WeeklyCourseMetrics {
  metrics_id            Int       @id @default(autoincrement())
  course_id             Int
  week_start_date       DateTime  @db.Date
  week_end_date         DateTime  @db.Date
  total_enrollments     Int       @default(0)
  new_enrollments       Int       @default(0)
  completed_enrollments Int       @default(0)
  total_watch_time      Int       @default(0) // in minutes
  average_progress      Decimal   @db.Decimal(5,2)
  engagement_score      Decimal   @db.Decimal(5,2)
  tenant_id             Int
  
  // Relations
  course                Course    @relation(fields: [course_id], references: [course_id])
  tenant                Tenant    @relation(fields: [tenant_id], references: [tenant_id])
  
  // Audit fields
  is_active             Boolean   @default(true)
  is_deleted            Boolean   @default(false)
  created_at            DateTime  @default(now())
  created_by            Int
  created_ip            String    @db.VarChar(45)
  updated_at            DateTime? @updatedAt
  updated_by            Int?
  updated_ip            String?   @db.VarChar(45)
  
  @@map("weekly_course_metrics")
  @@index([course_id])
  @@index([tenant_id])
  @@index([week_start_date])
  @@unique([course_id, week_start_date])
}

model MonthlyUserMetrics {
  metrics_id            Int       @id @default(autoincrement())
  user_id               Int
  user_type             String    @db.VarChar(20) // 'student', 'teacher'
  month                 Int       // 1-12
  year                  Int
  total_login_time      Int       @default(0) // in minutes
  courses_completed     Int       @default(0)
  videos_watched        Int       @default(0)
  quizzes_completed     Int       @default(0)
  assignments_submitted Int       @default(0)
  engagement_score      Decimal   @db.Decimal(5,2)
  tenant_id             Int
  
  // Relations
  tenant                Tenant    @relation(fields: [tenant_id], references: [tenant_id])
  
  // Audit fields
  is_active             Boolean   @default(true)
  is_deleted            Boolean   @default(false)
  created_at            DateTime  @default(now())
  created_by            Int
  created_ip            String    @db.VarChar(45)
  updated_at            DateTime? @updatedAt
  updated_by            Int?
  updated_ip            String?   @db.VarChar(45)
  
  @@map("monthly_user_metrics")
  @@index([user_id])
  @@index([tenant_id])
  @@index([year, month])
  @@unique([user_id, user_type, year, month])
}

model AssessmentAnalytics {
  analytics_id          Int       @id @default(autoincrement())
  assessment_id         Int
  assessment_type       String    @db.VarChar(20) // 'quiz', 'assignment'
  course_id             Int
  total_attempts        Int       @default(0)
  completed_attempts    Int       @default(0)
  average_score         Decimal   @db.Decimal(5,2)
  pass_rate             Decimal   @db.Decimal(5,2)
  average_time_taken    Int       @default(0) // in minutes
  difficulty_score      Decimal   @db.Decimal(5,2) // Calculated difficulty rating
  period_start          DateTime
  period_end            DateTime
  tenant_id             Int
  
  // Relations
  course                Course    @relation(fields: [course_id], references: [course_id])
  tenant                Tenant    @relation(fields: [tenant_id], references: [tenant_id])
  
  // Audit fields
  is_active             Boolean   @default(true)
  is_deleted            Boolean   @default(false)
  created_at            DateTime  @default(now())
  created_by            Int
  created_ip            String    @db.VarChar(45)
  updated_at            DateTime? @updatedAt
  updated_by            Int?
  updated_ip            String?   @db.VarChar(45)
  
  @@map("assessment_analytics")
  @@index([assessment_id])
  @@index([course_id])
  @@index([tenant_id])
  @@index([period_start, period_end])
}

model VideoWatchAnalytics {
  analytics_id          Int       @id @default(autoincrement())
  video_id              Int
  student_id            Int
  session_id            String    @db.VarChar(100)
  watch_duration        Int       // in seconds
  completion_percentage Decimal   @db.Decimal(5,2)
  start_time            DateTime
  end_time              DateTime?
  device_type           String?   @db.VarChar(20)
  playback_quality      String?   @db.VarChar(20)
  buffer_events         Int?
  seek_events           Int?
  tenant_id             Int
  
  // Relations
  student               Student   @relation(fields: [student_id], references: [student_id])
  tenant                Tenant    @relation(fields: [tenant_id], references: [tenant_id])
  
  // Audit fields
  is_active             Boolean   @default(true)
  is_deleted            Boolean   @default(false)
  created_at            DateTime  @default(now())
  created_by            Int
  created_ip            String    @db.VarChar(45)
  updated_at            DateTime? @updatedAt
  updated_by            Int?
  updated_ip            String?   @db.VarChar(45)
  
  @@map("video_watch_analytics")
  @@index([video_id])
  @@index([student_id])
  @@index([tenant_id])
  @@index([start_time])
}

model AnalyticsExport {
  export_id             Int       @id @default(autoincrement())
  export_name           String    @db.VarChar(255)
  export_type           String    @db.VarChar(50)
  export_format         Int       // ExportFormat enum
  export_status         String    @db.VarChar(20) // 'pending', 'processing', 'completed', 'failed'
  file_url              String?   @db.VarChar(500)
  file_size             BigInt?   // in bytes
  expires_at            DateTime?
  tenant_id             Int
  requested_by          Int       // FK to User
  
  // Relations
  tenant                Tenant    @relation(fields: [tenant_id], references: [tenant_id])
  
  // Audit fields
  is_active             Boolean   @default(true)
  is_deleted            Boolean   @default(false)
  created_at            DateTime  @default(now())
  created_by            Int
  created_ip            String    @db.VarChar(45)
  updated_at            DateTime? @updatedAt
  updated_by            Int?
  updated_ip            String?   @db.VarChar(45)
  
  @@map("analytics_exports")
  @@index([tenant_id])
  @@index([requested_by])
  @@index([export_status])
  @@index([created_at])
}
```

### Key Prisma Considerations

- **Time-Series Data**: Optimized for time-based analytics queries with proper indexing
- **Aggregation Tables**: Pre-calculated metrics for faster dashboard performance
- **JSON Configuration**: Flexible configuration storage for reports and metrics
- **Unique Constraints**: Prevent duplicate analytics records for same periods
- **Partitioning**: Consider table partitioning for large analytics datasets
- **Performance**: Strategic indexes on time ranges and frequently queried dimensions
- **Data Retention**: Automated cleanup policies for historical analytics data
- **Audit Fields**: Changed audit field types from string to int for user references

## 5. Error Handling

Use standardized `TApiErrorResponse` structure:

```json
{
  "statusCode": 400,
  "message": "Analytics query validation failed",
  "errorCode": "ANALYTICS_VALIDATION_ERROR",
  "details": {
    "dateRange": ["End date must be after start date"],
    "courseId": ["Course not found or no access"]
  },
  "correlationId": "req_analytics_456"
}
```

**Common HTTP Status Codes:**
- 200: Success
- 201: Created (reports, metrics)
- 400: Bad Request (invalid parameters)
- 401: Unauthorized
- 403: Forbidden (insufficient access)
- 404: Not Found (report/metric not found)
- 422: Unprocessable Entity (calculation errors)
- 500: Internal Server Error

**Analytics-Specific Error Codes:**
- `ANALYTICS_DATA_NOT_AVAILABLE`
- `REPORT_GENERATION_FAILED`
- `INVALID_DATE_RANGE`
- `INSUFFICIENT_DATA`
- `CALCULATION_ERROR`
- `EXPORT_FAILED`
- `METRIC_NOT_FOUND`
- `DASHBOARD_CONFIG_ERROR`

## 6. Security Considerations

### Data Access Control

- **JWT Authentication**: Required for all analytics endpoints
- **Role-Based Access**: Granular permissions for different analytics data
- **Tenant Isolation**: Analytics data scoped to tenant boundaries
- **Data Filtering**: Automatic filtering based on user permissions and roles

### Analytics Security

- **Query Validation**: Prevent malicious or resource-intensive queries
- **Rate Limiting**: Protect against analytics API abuse
- **Data Anonymization**: Anonymize sensitive data in analytics where required
- **Audit Logging**: Complete audit trail for analytics access and report generation

### Performance Security

- **Query Timeouts**: Prevent long-running analytics queries
- **Resource Limits**: Limit memory and processing for complex calculations
- **Caching Strategy**: Secure caching of analytics data with proper invalidation
- **Background Processing**: Offload heavy analytics calculations to background jobs

### Privacy & Compliance

- **Data Minimization**: Only collect necessary analytics data
- **GDPR Compliance**: Support for data export and deletion requests
- **Data Retention**: Configurable retention policies for analytics data
- **Consent Management**: Respect user privacy preferences for analytics

### Additional Security Measures

- **Export Security**: Secure generation and delivery of exported data
- **Dashboard Security**: Prevent unauthorized access to sensitive dashboards
- **Real-time Security**: Secure WebSocket connections for real-time analytics
- **Backup Security**: Secure backup of analytics configurations and historical data
