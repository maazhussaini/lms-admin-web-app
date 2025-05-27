/**
 * @file analytics-entities-checks.types.ts
 * @description Check constraint definitions for analytics and reporting entities.
 */

import { CheckConstraint } from '../base-constraint.types';

/**
 * Check constraints for analytics entities
 */
export const ANALYTICS_ENTITIES_CHECK_CONSTRAINTS: Record<string, CheckConstraint> = {
  // General analytics validations
  COMPLETION_PERCENTAGE_CHECK: {
    table: '*',
    constraintName: 'completion_percentage_valid',
    condition: 'completion_percentage >= 0 AND completion_percentage <= 100',
    description: 'Completion percentage must be between 0 and 100'
  },

  PROGRESS_PERCENTAGE_CHECK: {
    table: '*',
    constraintName: 'progress_percentage_valid',
    condition: 'overall_progress_percentage >= 0 AND overall_progress_percentage <= 100',
    description: 'Progress percentage must be between 0 and 100'
  },

  ANALYTICS_ENGAGEMENT_SCORE_CHECK: {
    table: 'course_analytics,user_analytics',
    constraintName: 'analytics_engagement_score_valid',
    condition: 'engagement_score >= 0 AND engagement_score <= 10',
    description: 'Engagement score must be between 0 and 10'
  },

  ANALYTICS_COMPLETION_RATE_CHECK: {
    table: 'course_analytics,system_metrics',
    constraintName: 'analytics_completion_rate_valid',
    condition: 'completion_rate >= 0 AND completion_rate <= 100',
    description: 'Completion rate must be between 0 and 100'
  },

  ANALYTICS_PERIOD_CONSISTENCY_CHECK: {
    table: 'course_analytics,user_analytics,system_metrics',
    constraintName: 'analytics_period_consistency_valid',
    condition: 'period_start <= period_end',
    description: 'Analytics period start must be before or equal to end'
  },

  ANALYTICS_WATCH_TIME_CHECK: {
    table: 'course_analytics,video_watch_analytics',
    constraintName: 'analytics_watch_time_valid',
    condition: 'total_watch_time >= 0',
    description: 'Total watch time must be non-negative'
  },

  // Report validations
  REPORT_STATUS_ENUM_CHECK: {
    table: 'reports',
    constraintName: 'chk_report_status_range',
    condition: 'report_status BETWEEN 1 AND 6',
    description: 'Report status must be within valid enum range (1-6)'
  },

  REPORT_TYPE_ENUM_CHECK: {
    table: 'reports',
    constraintName: 'chk_report_type_range',
    condition: 'report_type BETWEEN 1 AND 6',
    description: 'Report type must be within valid enum range (1-6)'
  },

  REPORT_NAME_LENGTH_CHECK: {
    table: 'reports',
    constraintName: 'chk_report_name_length',
    condition: 'LENGTH(TRIM(report_name)) >= 3 AND LENGTH(TRIM(report_name)) <= 255',
    description: 'Report name must be between 3-255 characters (trimmed)'
  },

  REPORT_CONFIG_JSON_CHECK: {
    table: 'reports',
    constraintName: 'report_config_json_valid',
    condition: 'report_config IS NULL OR JSON_VALID(report_config)',
    description: 'Report config must be valid JSON when provided'
  },

  // Metric validations
  METRIC_TYPE_ENUM_CHECK: {
    table: 'custom_metrics',
    constraintName: 'chk_metric_type_range',
    condition: 'metric_type BETWEEN 1 AND 6',
    description: 'Metric type must be within valid enum range (1-6)'
  },

  METRIC_NAME_LENGTH_CHECK: {
    table: 'custom_metrics',
    constraintName: 'chk_metric_name_length',
    condition: 'LENGTH(TRIM(metric_name)) >= 3 AND LENGTH(TRIM(metric_name)) <= 255',
    description: 'Metric name must be between 3-255 characters (trimmed)'
  },

  METRIC_CALCULATION_CONFIG_JSON_CHECK: {
    table: 'custom_metrics',
    constraintName: 'metric_calculation_config_json_valid',
    condition: 'calculation_config IS NULL OR JSON_VALID(calculation_config)',
    description: 'Metric calculation config must be valid JSON when provided'
  },

  // Widget validations
  WIDGET_TYPE_ENUM_CHECK: {
    table: 'dashboard_widgets',
    constraintName: 'chk_widget_type_range',
    condition: 'widget_type BETWEEN 1 AND 6',
    description: 'Widget type must be within valid enum range (1-6)'
  },

  WIDGET_NAME_LENGTH_CHECK: {
    table: 'dashboard_widgets',
    constraintName: 'chk_widget_name_length',
    condition: 'LENGTH(TRIM(widget_name)) >= 3 AND LENGTH(TRIM(widget_name)) <= 255',
    description: 'Widget name must be between 3-255 characters (trimmed)'
  },

  WIDGET_POSITION_CHECK: {
    table: 'dashboard_widgets',
    constraintName: 'widget_position_valid',
    condition: 'position_x >= 0 AND position_y >= 0 AND width > 0 AND height > 0',
    description: 'Widget position must be non-negative and dimensions positive'
  },

  WIDGET_CONFIG_JSON_CHECK: {
    table: 'dashboard_widgets',
    constraintName: 'widget_config_json_valid',
    condition: 'widget_config IS NULL OR JSON_VALID(widget_config)',
    description: 'Widget config must be valid JSON when provided'
  },

  // System metrics validations
  SYSTEM_UPTIME_CHECK: {
    table: 'system_metrics',
    constraintName: 'system_uptime_valid',
    condition: 'system_uptime >= 0 AND system_uptime <= 100',
    description: 'System uptime must be between 0 and 100 percent'
  },

  SYSTEM_ERROR_RATE_CHECK: {
    table: 'system_metrics',
    constraintName: 'system_error_rate_valid',
    condition: 'error_rate >= 0 AND error_rate <= 100',
    description: 'Error rate must be between 0 and 100 percent'
  },

  // Schedule validations
  SCHEDULE_NAME_LENGTH_CHECK: {
    table: 'report_schedules',
    constraintName: 'chk_schedule_name_length',
    condition: 'LENGTH(TRIM(schedule_name)) >= 3 AND LENGTH(TRIM(schedule_name)) <= 255',
    description: 'Schedule name must be between 3-255 characters (trimmed)'
  },

  CRON_EXPRESSION_FORMAT_CHECK: {
    table: 'report_schedules',
    constraintName: 'cron_expression_format_valid',
    condition: "cron_expression ~ '^[0-9*,-/\\s]+$'",
    description: 'Cron expression must contain valid cron characters'
  },

  TIMEZONE_FORMAT_CHECK: {
    table: 'report_schedules',
    constraintName: 'timezone_format_valid',
    condition: "timezone ~ '^[A-Za-z_/]+$'",
    description: 'Timezone must be in valid format'
  },

  SCHEDULE_CONFIG_JSON_CHECK: {
    table: 'report_schedules',
    constraintName: 'schedule_config_json_valid',
    condition: 'schedule_config IS NULL OR JSON_VALID(schedule_config)',
    description: 'Schedule config must be valid JSON when provided'
  },

  // Export validations
  EXPORT_FORMAT_ENUM_CHECK: {
    table: 'analytics_exports',
    constraintName: 'chk_export_format_range',
    condition: 'export_format BETWEEN 1 AND 4',
    description: 'Export format must be within valid enum range (1-4)'
  },

  EXPORT_NAME_LENGTH_CHECK: {
    table: 'analytics_exports',
    constraintName: 'chk_export_name_length',
    condition: 'LENGTH(TRIM(export_name)) >= 3 AND LENGTH(TRIM(export_name)) <= 255',
    description: 'Export name must be between 3-255 characters (trimmed)'
  },

  EXPORT_FILE_SIZE_CHECK: {
    table: 'analytics_exports',
    constraintName: 'chk_export_file_size',
    condition: 'file_size IS NULL OR file_size > 0',
    description: 'Export file size must be positive when provided'
  },

  // Snapshot validations
  TIME_GRANULARITY_ENUM_CHECK: {
    table: 'analytics_snapshots',
    constraintName: 'chk_time_granularity_range',
    condition: 'granularity BETWEEN 1 AND 6',
    description: 'Time granularity must be within valid enum range (1-6)'
  },

  SNAPSHOT_NAME_LENGTH_CHECK: {
    table: 'analytics_snapshots',
    constraintName: 'chk_snapshot_name_length',
    condition: 'LENGTH(TRIM(snapshot_name)) >= 3 AND LENGTH(TRIM(snapshot_name)) <= 255',
    description: 'Snapshot name must be between 3-255 characters (trimmed)'
  },

  SNAPSHOT_DATA_JSON_CHECK: {
    table: 'analytics_snapshots',
    constraintName: 'snapshot_data_json_valid',
    condition: 'data IS NULL OR JSON_VALID(data)',
    description: 'Snapshot data must be valid JSON when provided'
  },

  SNAPSHOT_METADATA_JSON_CHECK: {
    table: 'analytics_snapshots',
    constraintName: 'snapshot_metadata_json_valid',
    condition: 'metadata IS NULL OR JSON_VALID(metadata)',
    description: 'Snapshot metadata must be valid JSON when provided'
  },

  // Assessment analytics validations
  ASSESSMENT_TYPE_CHECK: {
    table: 'assessment_analytics',
    constraintName: 'chk_assessment_type_valid',
    condition: "assessment_type IN ('quiz', 'assignment')",
    description: 'Assessment type must be quiz or assignment'
  },

  ASSESSMENT_SCORE_CHECK: {
    table: 'assessment_analytics',
    constraintName: 'chk_assessment_score_valid',
    condition: 'average_score >= 0 AND average_score <= 100',
    description: 'Assessment average score must be between 0 and 100'
  },

  ASSESSMENT_PASS_RATE_CHECK: {
    table: 'assessment_analytics',
    constraintName: 'chk_assessment_pass_rate_valid',
    condition: 'pass_rate >= 0 AND pass_rate <= 100',
    description: 'Assessment pass rate must be between 0 and 100'
  },

  // Dashboard validations
  DASHBOARD_NAME_LENGTH_CHECK: {
    table: 'custom_dashboards',
    constraintName: 'chk_dashboard_name_length',
    condition: 'LENGTH(TRIM(dashboard_name)) >= 3 AND LENGTH(TRIM(dashboard_name)) <= 255',
    description: 'Dashboard name must be between 3-255 characters (trimmed)'
  },

  DASHBOARD_LAYOUT_CONFIG_JSON_CHECK: {
    table: 'custom_dashboards',
    constraintName: 'dashboard_layout_config_json_valid',
    condition: 'layout_config IS NULL OR JSON_VALID(layout_config)',
    description: 'Dashboard layout config must be valid JSON when provided'
  },

  // Video watch analytics validations
  VIDEO_WATCH_DURATION_CHECK: {
    table: 'video_watch_analytics',
    constraintName: 'video_watch_duration_valid',
    condition: 'watch_duration >= 0',
    description: 'Video watch duration must be non-negative'
  },

  VIDEO_COMPLETION_PERCENTAGE_CHECK: {
    table: 'video_watch_analytics',
    constraintName: 'video_completion_percentage_valid',
    condition: 'completion_percentage >= 0 AND completion_percentage <= 100',
    description: 'Video completion percentage must be between 0 and 100'
  },

  VIDEO_BUFFER_EVENTS_CHECK: {
    table: 'video_watch_analytics',
    constraintName: 'video_buffer_events_valid',
    condition: 'buffer_events IS NULL OR buffer_events >= 0',
    description: 'Buffer events count must be non-negative when provided'
  },

  VIDEO_SEEK_EVENTS_CHECK: {
    table: 'video_watch_analytics',
    constraintName: 'video_seek_events_valid',
    condition: 'seek_events IS NULL OR seek_events >= 0',
    description: 'Seek events count must be non-negative when provided'
  },

  // Time period validations for metrics tables
  DAILY_METRICS_DATE_CHECK: {
    table: 'daily_course_metrics',
    constraintName: 'daily_metrics_date_valid',
    condition: 'date <= CURRENT_DATE',
    description: 'Daily metrics date cannot be in the future'
  },

  WEEKLY_METRICS_PERIOD_CHECK: {
    table: 'weekly_course_metrics',
    constraintName: 'weekly_metrics_period_valid',
    condition: 'week_start_date <= week_end_date AND week_end_date <= week_start_date + INTERVAL \'7 days\'',
    description: 'Weekly metrics must have valid 7-day period'
  },

  MONTHLY_METRICS_MONTH_CHECK: {
    table: 'monthly_user_metrics',
    constraintName: 'monthly_metrics_month_valid',
    condition: 'month BETWEEN 1 AND 12',
    description: 'Month must be between 1 and 12'
  },

  MONTHLY_METRICS_YEAR_CHECK: {
    table: 'monthly_user_metrics',
    constraintName: 'monthly_metrics_year_valid',
    condition: 'year BETWEEN 2020 AND EXTRACT(YEAR FROM CURRENT_DATE) + 1',
    description: 'Year must be reasonable range'
  },

  // User type validations
  USER_TYPE_CHECK: {
    table: 'user_analytics,monthly_user_metrics',
    constraintName: 'user_type_valid',
    condition: "user_type IN ('student', 'teacher', 'admin')",
    description: 'User type must be student, teacher, or admin'
  },

  // Assessment analytics additional validations
  ASSESSMENT_DIFFICULTY_SCORE_CHECK: {
    table: 'assessment_analytics',
    constraintName: 'assessment_difficulty_score_valid',
    condition: 'difficulty_score >= 0 AND difficulty_score <= 10',
    description: 'Assessment difficulty score must be between 0 and 10'
  },

  ASSESSMENT_TIME_TAKEN_CHECK: {
    table: 'assessment_analytics',
    constraintName: 'assessment_time_taken_valid',
    condition: 'average_time_taken >= 0',
    description: 'Average time taken must be non-negative'
  },

  // Storage and bandwidth validations
  STORAGE_SIZE_CHECK: {
    table: 'system_metrics',
    constraintName: 'storage_size_valid',
    condition: 'total_storage_used >= 0 AND bandwidth_used >= 0',
    description: 'Storage and bandwidth usage must be non-negative'
  },

  // Session duration validations
  SESSION_DURATION_CHECK: {
    table: 'user_analytics,system_metrics',
    constraintName: 'session_duration_valid',
    condition: 'session_duration_avg >= 0 OR average_session_duration >= 0',
    description: 'Session duration must be non-negative'
  },
};
