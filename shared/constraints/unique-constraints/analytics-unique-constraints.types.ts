/**
 * @file analytics-unique-constraints.types.ts
 * @description Unique constraints for analytics entities.
 */

import { UniqueConstraint } from '../base-constraint.types';

/**
 * Analytics unique constraints
 */
export const ANALYTICS_UNIQUE_CONSTRAINTS: Record<string, UniqueConstraint> = {
  // Course analytics unique constraints
  COURSE_ANALYTICS_PERIOD_UNIQUE: {
    table: 'course_analytics',
    constraintName: 'uq_course_analytics_course_period',
    columns: ['course_id', 'period_start', 'period_end'],
    description: 'Unique analytics record per course per time period'
  },

  // User analytics unique constraints
  USER_ANALYTICS_PERIOD_UNIQUE: {
    table: 'user_analytics',
    constraintName: 'uq_user_analytics_user_period',
    columns: ['user_id', 'user_type', 'period_start', 'period_end'],
    description: 'Unique analytics record per user per time period'
  },

  // System metrics unique constraints
  SYSTEM_METRICS_TENANT_PERIOD_UNIQUE: {
    table: 'system_metrics',
    constraintName: 'uq_system_metrics_tenant_period',
    columns: ['tenant_id', 'period_start', 'period_end'],
    description: 'Unique system metrics per tenant per time period'
  },

  // Report unique constraints
  REPORT_NAME_TENANT_UNIQUE: {
    table: 'reports',
    constraintName: 'uq_reports_name_tenant',
    columns: ['report_name', 'tenant_id'],
    description: 'Report name must be unique within tenant'
  },

  // Custom metric unique constraints
  CUSTOM_METRIC_NAME_TENANT_UNIQUE: {
    table: 'custom_metrics',
    constraintName: 'uq_custom_metrics_name_tenant',
    columns: ['metric_name', 'tenant_id'],
    description: 'Custom metric name must be unique within tenant'
  },

  // Dashboard widget unique constraints
  DASHBOARD_WIDGET_POSITION_UNIQUE: {
    table: 'dashboard_widgets',
    constraintName: 'uq_dashboard_widgets_position',
    columns: ['dashboard_id', 'position_x', 'position_y'],
    condition: 'dashboard_id IS NOT NULL',
    description: 'Widget position must be unique within dashboard'
  },

  // Daily course metrics unique constraints
  DAILY_COURSE_METRICS_DATE_UNIQUE: {
    table: 'daily_course_metrics',
    constraintName: 'uq_daily_course_metrics_course_date',
    columns: ['course_id', 'date'],
    description: 'Unique daily metrics per course per date'
  },

  // Weekly course metrics unique constraints
  WEEKLY_COURSE_METRICS_WEEK_UNIQUE: {
    table: 'weekly_course_metrics',
    constraintName: 'uq_weekly_course_metrics_course_week',
    columns: ['course_id', 'week_start_date'],
    description: 'Unique weekly metrics per course per week'
  },

  // Monthly user metrics unique constraints
  MONTHLY_USER_METRICS_MONTH_UNIQUE: {
    table: 'monthly_user_metrics',
    constraintName: 'uq_monthly_user_metrics_user_month',
    columns: ['user_id', 'user_type', 'month', 'year'],
    description: 'Unique monthly metrics per user per month'
  },

  // Assessment analytics unique constraints
  ASSESSMENT_ANALYTICS_PERIOD_UNIQUE: {
    table: 'assessment_analytics',
    constraintName: 'uq_assessment_analytics_assessment_period',
    columns: ['assessment_id', 'assessment_type', 'period_start', 'period_end'],
    description: 'Unique assessment analytics per assessment per time period'
  },

  // Video watch analytics unique constraints
  VIDEO_WATCH_ANALYTICS_SESSION_UNIQUE: {
    table: 'video_watch_analytics',
    constraintName: 'uq_video_watch_analytics_session',
    columns: ['video_id', 'student_id', 'session_id'],
    description: 'Unique video watch record per session'
  },

  // Analytics snapshot unique constraints
  ANALYTICS_SNAPSHOT_NAME_DATE_UNIQUE: {
    table: 'analytics_snapshots',
    constraintName: 'uq_analytics_snapshots_name_date',
    columns: ['snapshot_name', 'snapshot_date', 'tenant_id'],
    description: 'Unique snapshot name per date per tenant'
  },

  // Report schedule unique constraints
  REPORT_SCHEDULE_NAME_UNIQUE: {
    table: 'report_schedules',
    constraintName: 'uq_report_schedules_name_tenant',
    columns: ['schedule_name', 'tenant_id'],
    description: 'Report schedule name must be unique within tenant'
  },

  // Analytics export unique constraints
  ANALYTICS_EXPORT_NAME_TENANT_UNIQUE: {
    table: 'analytics_exports',
    constraintName: 'uq_analytics_exports_name_tenant',
    columns: ['export_name', 'tenant_id'],
    description: 'Analytics export name must be unique within tenant'
  },
};
