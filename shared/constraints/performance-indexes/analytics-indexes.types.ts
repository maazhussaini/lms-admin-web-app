/**
 * @file analytics-indexes.types.ts
 * @description Performance indexes for analytics entities.
 */

import { IndexConstraint } from '../base-constraint.types';

/**
 * Analytics performance indexes
 */
export const ANALYTICS_PERFORMANCE_INDEXES: Record<string, IndexConstraint> = {
  // Course analytics indexes
  COURSE_ANALYTICS_TIME_RANGE: {
    table: 'course_analytics',
    constraintName: 'idx_course_analytics_time_range',
    indexName: 'idx_course_analytics_time_range',
    columns: ['course_id', 'period_start', 'period_end'],
    indexType: 'BTREE',
    isUnique: false,
    description: 'Optimize course analytics time range queries'
  },

  COURSE_ANALYTICS_TENANT_COURSE: {
    table: 'course_analytics',
    constraintName: 'idx_course_analytics_tenant_course',
    indexName: 'idx_course_analytics_tenant_course',
    columns: ['tenant_id', 'course_id'],
    indexType: 'BTREE',
    isUnique: false,
    description: 'Optimize tenant-specific course analytics queries'
  },

  COURSE_ANALYTICS_PERIOD_START: {
    table: 'course_analytics',
    constraintName: 'idx_course_analytics_period_start',
    indexName: 'idx_course_analytics_period_start',
    columns: ['period_start'],
    indexType: 'BTREE',
    isUnique: false,
    description: 'Optimize queries by period start date'
  },

  // User analytics indexes
  USER_ANALYTICS_TIME_RANGE: {
    table: 'user_analytics',
    constraintName: 'idx_user_analytics_time_range',
    indexName: 'idx_user_analytics_time_range',
    columns: ['user_id', 'period_start', 'period_end'],
    indexType: 'BTREE',
    isUnique: false,
    description: 'Optimize user analytics time range queries'
  },

  USER_ANALYTICS_TENANT_USER_TYPE: {
    table: 'user_analytics',
    constraintName: 'idx_user_analytics_tenant_user_type',
    indexName: 'idx_user_analytics_tenant_user_type',
    columns: ['tenant_id', 'user_type'],
    indexType: 'BTREE',
    isUnique: false,
    description: 'Optimize tenant and user type filtered queries'
  },

  USER_ANALYTICS_ENGAGEMENT_SCORE: {
    table: 'user_analytics',
    constraintName: 'idx_user_analytics_engagement_score',
    indexName: 'idx_user_analytics_engagement_score',
    columns: ['engagement_score'],
    indexType: 'BTREE',
    isUnique: false,
    description: 'Optimize engagement score based queries'
  },

  // System metrics indexes
  SYSTEM_METRICS_TENANT_PERIOD: {
    table: 'system_metrics',
    constraintName: 'idx_system_metrics_tenant_period',
    indexName: 'idx_system_metrics_tenant_period',
    columns: ['tenant_id', 'period_start', 'period_end'],
    indexType: 'BTREE',
    isUnique: false,
    description: 'Optimize tenant system metrics by period'
  },

  SYSTEM_METRICS_PERIOD_START: {
    table: 'system_metrics',
    constraintName: 'idx_system_metrics_period_start',
    indexName: 'idx_system_metrics_period_start',
    columns: ['period_start'],
    indexType: 'BTREE',
    isUnique: false,
    description: 'Optimize system metrics by period start'
  },

  // Reports indexes
  REPORTS_TENANT_TYPE_STATUS: {
    table: 'reports',
    constraintName: 'idx_reports_tenant_type_status',
    indexName: 'idx_reports_tenant_type_status',
    columns: ['tenant_id', 'report_type', 'report_status'],
    indexType: 'BTREE',
    isUnique: false,
    description: 'Optimize report filtering by tenant, type, and status'
  },

  REPORTS_LAST_GENERATED: {
    table: 'reports',
    constraintName: 'idx_reports_last_generated',
    indexName: 'idx_reports_last_generated',
    columns: ['last_generated_at'],
    indexType: 'BTREE',
    isUnique: false,
    description: 'Optimize queries by last generation date'
  },

  REPORTS_CREATED_BY: {
    table: 'reports',
    constraintName: 'idx_reports_created_by',
    indexName: 'idx_reports_created_by',
    columns: ['created_by', 'tenant_id'],
    indexType: 'BTREE',
    isUnique: false,
    description: 'Optimize user-specific report queries'
  },

  // Report schedules indexes
  REPORT_SCHEDULES_REPORT_ENABLED: {
    table: 'report_schedules',
    constraintName: 'idx_report_schedules_report_enabled',
    indexName: 'idx_report_schedules_report_enabled',
    columns: ['report_id', 'is_enabled'],
    indexType: 'BTREE',
    isUnique: false,
    description: 'Optimize enabled schedule queries'
  },

  REPORT_SCHEDULES_NEXT_RUN: {
    table: 'report_schedules',
    constraintName: 'idx_report_schedules_next_run',
    indexName: 'idx_report_schedules_next_run',
    columns: ['next_run_at', 'is_enabled'],
    indexType: 'BTREE',
    isUnique: false,
    description: 'Optimize schedule execution queries'
  },

  REPORT_SCHEDULES_TENANT: {
    table: 'report_schedules',
    constraintName: 'idx_report_schedules_tenant',
    indexName: 'idx_report_schedules_tenant',
    columns: ['tenant_id'],
    indexType: 'BTREE',
    isUnique: false,
    description: 'Optimize tenant-specific schedule queries'
  },

  // Analytics snapshots indexes
  ANALYTICS_SNAPSHOTS_DATE_TYPE: {
    table: 'analytics_snapshots',
    constraintName: 'idx_analytics_snapshots_date_type',
    indexName: 'idx_analytics_snapshots_date_type',
    columns: ['snapshot_date', 'snapshot_type'],
    indexType: 'BTREE',
    isUnique: false,
    description: 'Optimize snapshot queries by date and type'
  },

  ANALYTICS_SNAPSHOTS_TENANT_DATE: {
    table: 'analytics_snapshots',
    constraintName: 'idx_analytics_snapshots_tenant_date',
    indexName: 'idx_analytics_snapshots_tenant_date',
    columns: ['tenant_id', 'snapshot_date'],
    indexType: 'BTREE',
    isUnique: false,
    description: 'Optimize tenant snapshot queries by date'
  },

  // Custom metrics indexes
  CUSTOM_METRICS_TENANT_TYPE: {
    table: 'custom_metrics',
    constraintName: 'idx_custom_metrics_tenant_type',
    indexName: 'idx_custom_metrics_tenant_type',
    columns: ['tenant_id', 'metric_type'],
    indexType: 'BTREE',
    isUnique: false,
    description: 'Optimize custom metrics by tenant and type'
  },

  CUSTOM_METRICS_CREATED_BY: {
    table: 'custom_metrics',
    constraintName: 'idx_custom_metrics_created_by',
    indexName: 'idx_custom_metrics_created_by',
    columns: ['created_by', 'tenant_id'],
    indexType: 'BTREE',
    isUnique: false,
    description: 'Optimize user-specific custom metrics'
  },

  // Dashboard widgets indexes
  DASHBOARD_WIDGETS_DASHBOARD: {
    table: 'dashboard_widgets',
    constraintName: 'idx_dashboard_widgets_dashboard',
    indexName: 'idx_dashboard_widgets_dashboard',
    columns: ['dashboard_id'],
    indexType: 'BTREE',
    isUnique: false,
    description: 'Optimize dashboard widget queries'
  },

  DASHBOARD_WIDGETS_USER_TENANT: {
    table: 'dashboard_widgets',
    constraintName: 'idx_dashboard_widgets_user_tenant',
    indexName: 'idx_dashboard_widgets_user_tenant',
    columns: ['user_id', 'tenant_id'],
    indexType: 'BTREE',
    isUnique: false,
    description: 'Optimize user-specific widget queries'
  },

  DASHBOARD_WIDGETS_TYPE: {
    table: 'dashboard_widgets',
    constraintName: 'idx_dashboard_widgets_type',
    indexName: 'idx_dashboard_widgets_type',
    columns: ['widget_type', 'tenant_id'],
    indexType: 'BTREE',
    isUnique: false,
    description: 'Optimize widget queries by type'
  },

  // Daily course metrics indexes
  DAILY_COURSE_METRICS_COURSE_DATE: {
    table: 'daily_course_metrics',
    constraintName: 'idx_daily_course_metrics_course_date',
    indexName: 'idx_daily_course_metrics_course_date',
    columns: ['course_id', 'date'],
    indexType: 'BTREE',
    isUnique: false,
    description: 'Optimize daily metrics by course and date'
  },

  DAILY_COURSE_METRICS_DATE_RANGE: {
    table: 'daily_course_metrics',
    constraintName: 'idx_daily_course_metrics_date_range',
    indexName: 'idx_daily_course_metrics_date_range',
    columns: ['date'],
    indexType: 'BTREE',
    isUnique: false,
    description: 'Optimize daily metrics date range queries'
  },

  DAILY_COURSE_METRICS_TENANT: {
    table: 'daily_course_metrics',
    constraintName: 'idx_daily_course_metrics_tenant',
    indexName: 'idx_daily_course_metrics_tenant',
    columns: ['tenant_id', 'date'],
    indexType: 'BTREE',
    isUnique: false,
    description: 'Optimize tenant daily metrics queries'
  },

  // Weekly course metrics indexes
  WEEKLY_COURSE_METRICS_COURSE_WEEK: {
    table: 'weekly_course_metrics',
    constraintName: 'idx_weekly_course_metrics_course_week',
    indexName: 'idx_weekly_course_metrics_course_week',
    columns: ['course_id', 'week_start_date'],
    indexType: 'BTREE',
    isUnique: false,
    description: 'Optimize weekly metrics by course and week'
  },

  WEEKLY_COURSE_METRICS_TENANT_WEEK: {
    table: 'weekly_course_metrics',
    constraintName: 'idx_weekly_course_metrics_tenant_week',
    indexName: 'idx_weekly_course_metrics_tenant_week',
    columns: ['tenant_id', 'week_start_date'],
    indexType: 'BTREE',
    isUnique: false,
    description: 'Optimize tenant weekly metrics queries'
  },

  // Monthly user metrics indexes
  MONTHLY_USER_METRICS_USER_MONTH: {
    table: 'monthly_user_metrics',
    constraintName: 'idx_monthly_user_metrics_user_month',
    indexName: 'idx_monthly_user_metrics_user_month',
    columns: ['user_id', 'year', 'month'],
    indexType: 'BTREE',
    isUnique: false,
    description: 'Optimize monthly metrics by user and period'
  },

  MONTHLY_USER_METRICS_TENANT_PERIOD: {
    table: 'monthly_user_metrics',
    constraintName: 'idx_monthly_user_metrics_tenant_period',
    indexName: 'idx_monthly_user_metrics_tenant_period',
    columns: ['tenant_id', 'year', 'month'],
    indexType: 'BTREE',
    isUnique: false,
    description: 'Optimize tenant monthly metrics queries'
  },

  MONTHLY_USER_METRICS_USER_TYPE: {
    table: 'monthly_user_metrics',
    constraintName: 'idx_monthly_user_metrics_user_type',
    indexName: 'idx_monthly_user_metrics_user_type',
    columns: ['user_type', 'tenant_id'],
    indexType: 'BTREE',
    isUnique: false,
    description: 'Optimize monthly metrics by user type'
  },

  // Assessment analytics indexes
  ASSESSMENT_ANALYTICS_ASSESSMENT_PERIOD: {
    table: 'assessment_analytics',
    constraintName: 'idx_assessment_analytics_assessment_period',
    indexName: 'idx_assessment_analytics_assessment_period',
    columns: ['assessment_id', 'period_start', 'period_end'],
    indexType: 'BTREE',
    isUnique: false,
    description: 'Optimize assessment analytics by period'
  },

  ASSESSMENT_ANALYTICS_COURSE_TYPE: {
    table: 'assessment_analytics',
    constraintName: 'idx_assessment_analytics_course_type',
    indexName: 'idx_assessment_analytics_course_type',
    columns: ['course_id', 'assessment_type'],
    indexType: 'BTREE',
    isUnique: false,
    description: 'Optimize assessment analytics by course and type'
  },

  ASSESSMENT_ANALYTICS_TENANT_PERIOD: {
    table: 'assessment_analytics',
    constraintName: 'idx_assessment_analytics_tenant_period',
    indexName: 'idx_assessment_analytics_tenant_period',
    columns: ['tenant_id', 'period_start'],
    indexType: 'BTREE',
    isUnique: false,
    description: 'Optimize tenant assessment analytics queries'
  },

  // Video watch analytics indexes
  VIDEO_WATCH_ANALYTICS_VIDEO_STUDENT: {
    table: 'video_watch_analytics',
    constraintName: 'idx_video_watch_analytics_video_student',
    indexName: 'idx_video_watch_analytics_video_student',
    columns: ['video_id', 'student_id'],
    indexType: 'BTREE',
    isUnique: false,
    description: 'Optimize video analytics by video and student'
  },

  VIDEO_WATCH_ANALYTICS_STUDENT_START_TIME: {
    table: 'video_watch_analytics',
    constraintName: 'idx_video_watch_analytics_student_start_time',
    indexName: 'idx_video_watch_analytics_student_start_time',
    columns: ['student_id', 'start_time'],
    indexType: 'BTREE',
    isUnique: false,
    description: 'Optimize student video analytics by time'
  },

  VIDEO_WATCH_ANALYTICS_TENANT_DATE: {
    table: 'video_watch_analytics',
    constraintName: 'idx_video_watch_analytics_tenant_date',
    indexName: 'idx_video_watch_analytics_tenant_date',
    columns: ['tenant_id', 'start_time'],
    indexType: 'BTREE',
    isUnique: false,
    description: 'Optimize tenant video analytics by date'
  },

  VIDEO_WATCH_ANALYTICS_COMPLETION: {
    table: 'video_watch_analytics',
    constraintName: 'idx_video_watch_analytics_completion',
    indexName: 'idx_video_watch_analytics_completion',
    columns: ['completion_percentage'],
    indexType: 'BTREE',
    isUnique: false,
    description: 'Optimize video analytics by completion rate'
  },

  // Analytics exports indexes
  ANALYTICS_EXPORTS_TENANT_STATUS: {
    table: 'analytics_exports',
    constraintName: 'idx_analytics_exports_tenant_status',
    indexName: 'idx_analytics_exports_tenant_status',
    columns: ['tenant_id', 'export_status'],
    indexType: 'BTREE',
    isUnique: false,
    description: 'Optimize export queries by tenant and status'
  },

  ANALYTICS_EXPORTS_REQUESTED_BY: {
    table: 'analytics_exports',
    constraintName: 'idx_analytics_exports_requested_by',
    indexName: 'idx_analytics_exports_requested_by',
    columns: ['requested_by', 'tenant_id'],
    indexType: 'BTREE',
    isUnique: false,
    description: 'Optimize user export queries'
  },

  ANALYTICS_EXPORTS_CREATED_AT: {
    table: 'analytics_exports',
    constraintName: 'idx_analytics_exports_created_at',
    indexName: 'idx_analytics_exports_created_at',
    columns: ['created_at'],
    indexType: 'BTREE',
    isUnique: false,
    description: 'Optimize export queries by creation date'
  },

  ANALYTICS_EXPORTS_EXPIRES_AT: {
    table: 'analytics_exports',
    constraintName: 'idx_analytics_exports_expires_at',
    indexName: 'idx_analytics_exports_expires_at',
    columns: ['expires_at'],
    indexType: 'BTREE',
    isUnique: false,
    description: 'Optimize cleanup queries by expiration date'
  },

  // Custom dashboards indexes
  CUSTOM_DASHBOARDS_USER_TENANT: {
    table: 'custom_dashboards',
    constraintName: 'idx_custom_dashboards_user_tenant',
    indexName: 'idx_custom_dashboards_user_tenant',
    columns: ['user_id', 'tenant_id'],
    indexType: 'BTREE',
    isUnique: false,
    description: 'Optimize user dashboard queries'
  },

  CUSTOM_DASHBOARDS_TENANT: {
    table: 'custom_dashboards',
    constraintName: 'idx_custom_dashboards_tenant',
    indexName: 'idx_custom_dashboards_tenant',
    columns: ['tenant_id'],
    indexType: 'BTREE',
    isUnique: false,
    description: 'Optimize tenant dashboard queries'
  },

  // Composite indexes for common query patterns
  COURSE_ANALYTICS_REPORTING: {
    table: 'course_analytics',
    constraintName: 'idx_course_analytics_reporting',
    indexName: 'idx_course_analytics_reporting',
    columns: ['tenant_id', 'period_start', 'completion_rate'],
    indexType: 'BTREE',
    isUnique: false,
    description: 'Optimize course analytics reporting queries'
  },

  USER_ANALYTICS_ENGAGEMENT_REPORTING: {
    table: 'user_analytics',
    constraintName: 'idx_user_analytics_engagement_reporting',
    indexName: 'idx_user_analytics_engagement_reporting',
    columns: ['tenant_id', 'user_type', 'engagement_score'],
    indexType: 'BTREE',
    isUnique: false,
    description: 'Optimize user engagement reporting queries'
  },

  SYSTEM_METRICS_DASHBOARD: {
    table: 'system_metrics',
    constraintName: 'idx_system_metrics_dashboard',
    indexName: 'idx_system_metrics_dashboard',
    columns: ['tenant_id', 'period_start', 'system_uptime', 'error_rate'],
    indexType: 'BTREE',
    isUnique: false,
    description: 'Optimize system metrics dashboard queries'
  },
};
