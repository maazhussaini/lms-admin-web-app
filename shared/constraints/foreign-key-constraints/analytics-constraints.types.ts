import { ForeignKeyConstraint } from '../base-constraint.types';

/**
 * Foreign key constraints for analytics entities
 */
export const ANALYTICS_FOREIGN_KEY_CONSTRAINTS: Record<string, ForeignKeyConstraint> = {
  // Add missing tenant constraints for analytics entities
  COURSE_ANALYTICS_TENANT_CONSTRAINT: {
    table: 'course_analytics',
    constraintName: 'fk_course_analytics_tenant',
    column: 'tenant_id',
    referencedTable: 'tenants',
    referencedColumn: 'tenant_id',
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE',
    isNullable: false,
    description: 'Course analytics belongs to tenant'
  },

  USER_ANALYTICS_TENANT_CONSTRAINT: {
    table: 'user_analytics',
    constraintName: 'fk_user_analytics_tenant',
    column: 'tenant_id',
    referencedTable: 'tenants',
    referencedColumn: 'tenant_id',
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE',
    isNullable: false,
    description: 'User analytics belongs to tenant'
  },

  SYSTEM_METRICS_TENANT_CONSTRAINT: {
    table: 'system_metrics',
    constraintName: 'fk_system_metrics_tenant',
    column: 'tenant_id',
    referencedTable: 'tenants',
    referencedColumn: 'tenant_id',
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE',
    isNullable: false,
    description: 'System metrics belongs to tenant'
  },

  REPORTS_TENANT_CONSTRAINT: {
    table: 'reports',
    constraintName: 'fk_reports_tenant',
    column: 'tenant_id',
    referencedTable: 'tenants',
    referencedColumn: 'tenant_id',
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE',
    isNullable: false,
    description: 'Reports belong to tenant'
  },

  CUSTOM_METRICS_TENANT_CONSTRAINT: {
    table: 'custom_metrics',
    constraintName: 'fk_custom_metrics_tenant',
    column: 'tenant_id',
    referencedTable: 'tenants',
    referencedColumn: 'tenant_id',
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE',
    isNullable: false,
    description: 'Custom metrics belong to tenant'
  },

  DASHBOARD_WIDGETS_TENANT_CONSTRAINT: {
    table: 'dashboard_widgets',
    constraintName: 'fk_dashboard_widgets_tenant',
    column: 'tenant_id',
    referencedTable: 'tenants',
    referencedColumn: 'tenant_id',
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE',
    isNullable: false,
    description: 'Dashboard widgets belong to tenant'
  },

  ANALYTICS_SNAPSHOTS_TENANT_CONSTRAINT: {
    table: 'analytics_snapshots',
    constraintName: 'fk_analytics_snapshots_tenant',
    column: 'tenant_id',
    referencedTable: 'tenants',
    referencedColumn: 'tenant_id',
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE',
    isNullable: false,
    description: 'Analytics snapshots belong to tenant'
  },

  REPORT_SCHEDULES_TENANT_CONSTRAINT: {
    table: 'report_schedules',
    constraintName: 'fk_report_schedules_tenant',
    column: 'tenant_id',
    referencedTable: 'tenants',
    referencedColumn: 'tenant_id',
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE',
    isNullable: false,
    description: 'Report schedules belong to tenant'
  },

  ANALYTICS_EXPORTS_TENANT_CONSTRAINT: {
    table: 'analytics_exports',
    constraintName: 'fk_analytics_exports_tenant',
    column: 'tenant_id',
    referencedTable: 'tenants',
    referencedColumn: 'tenant_id',
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE',
    isNullable: false,
    description: 'Analytics exports belong to tenant'
  },

  // Course analytics constraints
  COURSE_ANALYTICS_COURSE_CONSTRAINT: {
    table: 'course_analytics',
    constraintName: 'fk_course_analytics_course',
    column: 'course_id',
    referencedTable: 'courses',
    referencedColumn: 'course_id',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
    isNullable: false,
    description: 'Course analytics belongs to course'
  },

  USER_ANALYTICS_USER_CONSTRAINT: {
    table: 'user_analytics',
    constraintName: 'fk_user_analytics_user',
    column: 'user_id',
    referencedTable: 'system_users',
    referencedColumn: 'system_user_id',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
    isNullable: false,
    description: 'User analytics belongs to user'
  },

  // Report constraints
  REPORT_SCHEDULE_REPORT_CONSTRAINT: {
    table: 'report_schedules',
    constraintName: 'fk_report_schedule_report',
    column: 'report_id',
    referencedTable: 'reports',
    referencedColumn: 'report_id',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
    isNullable: false,
    description: 'Report schedule belongs to report'
  },

  // Dashboard constraints
  DASHBOARD_WIDGET_DASHBOARD_CONSTRAINT: {
    table: 'dashboard_widgets',
    constraintName: 'fk_dashboard_widget_dashboard',
    column: 'dashboard_id',
    referencedTable: 'custom_dashboards',
    referencedColumn: 'dashboard_id',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
    isNullable: true,
    description: 'Widget belongs to dashboard (optional)'
  },

  DASHBOARD_WIDGET_USER_CONSTRAINT: {
    table: 'dashboard_widgets',
    constraintName: 'fk_dashboard_widget_user',
    column: 'user_id',
    referencedTable: 'system_users',
    referencedColumn: 'system_user_id',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
    isNullable: true,
    description: 'Widget belongs to user (optional)'
  },

  // Metrics constraints
  DAILY_COURSE_METRICS_COURSE_CONSTRAINT: {
    table: 'daily_course_metrics',
    constraintName: 'fk_daily_course_metrics_course',
    column: 'course_id',
    referencedTable: 'courses',
    referencedColumn: 'course_id',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
    isNullable: false,
    description: 'Daily metrics belongs to course'
  },

  WEEKLY_COURSE_METRICS_COURSE_CONSTRAINT: {
    table: 'weekly_course_metrics',
    constraintName: 'fk_weekly_course_metrics_course',
    column: 'course_id',
    referencedTable: 'courses',
    referencedColumn: 'course_id',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
    isNullable: false,
    description: 'Weekly metrics belongs to course'
  },

  MONTHLY_USER_METRICS_USER_CONSTRAINT: {
    table: 'monthly_user_metrics',
    constraintName: 'fk_monthly_user_metrics_user',
    column: 'user_id',
    referencedTable: 'system_users',
    referencedColumn: 'system_user_id',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
    isNullable: false,
    description: 'Monthly metrics belongs to user'
  },

  // Video analytics constraints
  VIDEO_WATCH_ANALYTICS_VIDEO_CONSTRAINT: {
    table: 'video_watch_analytics',
    constraintName: 'fk_video_watch_analytics_video',
    column: 'video_id',
    referencedTable: 'course_videos',
    referencedColumn: 'video_id',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
    isNullable: false,
    description: 'Video analytics belongs to video'
  },

  VIDEO_WATCH_ANALYTICS_STUDENT_CONSTRAINT: {
    table: 'video_watch_analytics',
    constraintName: 'fk_video_watch_analytics_student',
    column: 'student_id',
    referencedTable: 'students',
    referencedColumn: 'student_id',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
    isNullable: false,
    description: 'Video analytics belongs to student'
  },

  // Assessment analytics constraints
  ASSESSMENT_ANALYTICS_ASSESSMENT_CONSTRAINT: {
    table: 'assessment_analytics',
    constraintName: 'fk_assessment_analytics_assessment',
    column: 'assessment_id',
    referencedTable: 'assessments',
    referencedColumn: 'assessment_id',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
    isNullable: false,
    description: 'Assessment analytics belongs to assessment'
  },

  ASSESSMENT_ANALYTICS_COURSE_CONSTRAINT: {
    table: 'assessment_analytics',
    constraintName: 'fk_assessment_analytics_course',
    column: 'course_id',
    referencedTable: 'courses',
    referencedColumn: 'course_id',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
    isNullable: false,
    description: 'Assessment analytics belongs to course'
  },

  // Export constraints
  ANALYTICS_EXPORT_REQUESTED_BY_CONSTRAINT: {
    table: 'analytics_exports',
    constraintName: 'fk_analytics_export_requested_by',
    column: 'requested_by',
    referencedTable: 'system_users',
    referencedColumn: 'system_user_id',
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE',
    isNullable: false,
    description: 'Analytics export requested by user'
  },

  // Add missing tenant constraints
  DAILY_COURSE_METRICS_TENANT_CONSTRAINT: {
    table: 'daily_course_metrics',
    constraintName: 'fk_daily_course_metrics_tenant',
    column: 'tenant_id',
    referencedTable: 'tenants',
    referencedColumn: 'tenant_id',
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE',
    isNullable: false,
    description: 'Daily course metrics belongs to tenant'
  },

  WEEKLY_COURSE_METRICS_TENANT_CONSTRAINT: {
    table: 'weekly_course_metrics',
    constraintName: 'fk_weekly_course_metrics_tenant',
    column: 'tenant_id',
    referencedTable: 'tenants',
    referencedColumn: 'tenant_id',
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE',
    isNullable: false,
    description: 'Weekly course metrics belongs to tenant'
  },

  MONTHLY_USER_METRICS_TENANT_CONSTRAINT: {
    table: 'monthly_user_metrics',
    constraintName: 'fk_monthly_user_metrics_tenant',
    column: 'tenant_id',
    referencedTable: 'tenants',
    referencedColumn: 'tenant_id',
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE',
    isNullable: false,
    description: 'Monthly user metrics belongs to tenant'
  },

  ASSESSMENT_ANALYTICS_TENANT_CONSTRAINT: {
    table: 'assessment_analytics',
    constraintName: 'fk_assessment_analytics_tenant',
    column: 'tenant_id',
    referencedTable: 'tenants',
    referencedColumn: 'tenant_id',
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE',
    isNullable: false,
    description: 'Assessment analytics belongs to tenant'
  },

  VIDEO_WATCH_ANALYTICS_TENANT_CONSTRAINT: {
    table: 'video_watch_analytics',
    constraintName: 'fk_video_watch_analytics_tenant',
    column: 'tenant_id',
    referencedTable: 'tenants',
    referencedColumn: 'tenant_id',
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE',
    isNullable: false,
    description: 'Video watch analytics belongs to tenant'
  },

  // Custom dashboards constraints
  CUSTOM_DASHBOARDS_TENANT_CONSTRAINT: {
    table: 'custom_dashboards',
    constraintName: 'fk_custom_dashboards_tenant',
    column: 'tenant_id',
    referencedTable: 'tenants',
    referencedColumn: 'tenant_id',
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE',
    isNullable: false,
    description: 'Custom dashboards belong to tenant'
  },

  CUSTOM_DASHBOARDS_USER_CONSTRAINT: {
    table: 'custom_dashboards',
    constraintName: 'fk_custom_dashboards_user',
    column: 'user_id',
    referencedTable: 'system_users',
    referencedColumn: 'system_user_id',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
    isNullable: true,
    description: 'Custom dashboard belongs to user (optional)'
  },
};
