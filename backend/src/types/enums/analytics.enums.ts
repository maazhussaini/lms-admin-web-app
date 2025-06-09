/**
 * Enum for report types
 */
export enum ReportType {
  COURSE_PERFORMANCE,
  USER_ENGAGEMENT,
  SYSTEM_USAGE,
  ASSESSMENT_SUMMARY,
  VIDEO_ANALYTICS,
  CUSTOM,
}

/**
 * Enum for report status
 */
export enum ReportStatus {
  DRAFT,
  SCHEDULED,
  GENERATING,
  COMPLETED,
  FAILED,
  CANCELLED,
}

/**
 * Enum for metric types
 */
export enum MetricType {
  COUNT,
  PERCENTAGE,
  AVERAGE,
  SUM,
  RATIO,
  TREND,
}

/**
 * Enum for time granularity
 */
export enum TimeGranularity {
  HOURLY,
  DAILY,
  WEEKLY,
  MONTHLY,
  QUARTERLY,
  YEARLY,
}

/**
 * Enum for widget types
 */
export enum WidgetType {
  CHART,
  TABLE,
  METRIC_CARD,
  PROGRESS_BAR,
  MAP,
  TIMELINE,
}

/**
 * Enum for export formats
 */
export enum ExportFormat {
  PDF,
  EXCEL,
  CSV,
  JSON,
}