/**
 * @file analytics-enum-constraints.types.ts
 * @description Analytics entity enum constraints for reports, metrics, and dashboard entities.
 */

import { EnumConstraint } from '../base-constraint.types';

/**
 * Analytics entity enum constraints
 */
export const ANALYTICS_ENUM_CONSTRAINTS: Record<string, EnumConstraint> = {
  // Report type enum
  REPORT_TYPE_ENUM: {
    table: 'reports',
    constraintName: 'chk_report_type_valid',
    column: 'report_type',
    enumName: 'ReportType',
    enumValues: {
      COURSE_PERFORMANCE: 1,
      USER_ENGAGEMENT: 2,
      SYSTEM_USAGE: 3,
      ASSESSMENT_SUMMARY: 4,
      VIDEO_ANALYTICS: 5,
      CUSTOM: 6
    },
    description: 'Report type enumeration constraint'
  },

  // Report status enum
  REPORT_STATUS_ENUM: {
    table: 'reports',
    constraintName: 'chk_report_status_valid',
    column: 'report_status',
    enumName: 'ReportStatus',
    enumValues: {
      DRAFT: 1,
      SCHEDULED: 2,
      GENERATING: 3,
      COMPLETED: 4,
      FAILED: 5,
      CANCELLED: 6
    },
    description: 'Report status enumeration constraint'
  },

  // Metric type enum
  METRIC_TYPE_ENUM: {
    table: 'custom_metrics',
    constraintName: 'chk_metric_type_valid',
    column: 'metric_type',
    enumName: 'MetricType',
    enumValues: {
      COUNT: 1,
      PERCENTAGE: 2,
      AVERAGE: 3,
      SUM: 4,
      RATIO: 5,
      TREND: 6
    },
    description: 'Metric type enumeration constraint'
  },

  // Time granularity enum
  TIME_GRANULARITY_ENUM: {
    table: 'analytics_snapshots',
    constraintName: 'chk_time_granularity_valid',
    column: 'granularity',
    enumName: 'TimeGranularity',
    enumValues: {
      HOURLY: 1,
      DAILY: 2,
      WEEKLY: 3,
      MONTHLY: 4,
      QUARTERLY: 5,
      YEARLY: 6
    },
    description: 'Time granularity enumeration constraint'
  },

  // Widget type enum
  WIDGET_TYPE_ENUM: {
    table: 'dashboard_widgets',
    constraintName: 'chk_widget_type_valid',
    column: 'widget_type',
    enumName: 'WidgetType',
    enumValues: {
      CHART: 1,
      TABLE: 2,
      METRIC_CARD: 3,
      PROGRESS_BAR: 4,
      MAP: 5,
      TIMELINE: 6
    },
    description: 'Widget type enumeration constraint'
  },

  // Export format enum
  EXPORT_FORMAT_ENUM: {
    table: 'analytics_exports',
    constraintName: 'chk_export_format_valid',
    column: 'export_format',
    enumName: 'ExportFormat',
    enumValues: {
      PDF: 1,
      EXCEL: 2,
      CSV: 3,
      JSON: 4
    },
    description: 'Export format enumeration constraint'
  },
};
