import { MultiTenantAuditFields } from './base.types';

/**
 * Report types
 */
export const ReportType = {
  COURSE_PERFORMANCE: 'COURSE_PERFORMANCE',
  USER_ENGAGEMENT: 'USER_ENGAGEMENT',
  SYSTEM_USAGE: 'SYSTEM_USAGE',
  ASSESSMENT_SUMMARY: 'ASSESSMENT_SUMMARY',
  VIDEO_ANALYTICS: 'VIDEO_ANALYTICS',
  CUSTOM: 'CUSTOM',
} as const;

export type ReportType = typeof ReportType[keyof typeof ReportType];

/**
 * Report status
 */
export const ReportStatus = {
  DRAFT: 'DRAFT',
  SCHEDULED: 'SCHEDULED',
  GENERATING: 'GENERATING',
  COMPLETED: 'COMPLETED',
  FAILED: 'FAILED',
  CANCELLED: 'CANCELLED',
} as const;

export type ReportStatus = typeof ReportStatus[keyof typeof ReportStatus];

/**
 * Metric types
 */
export const MetricType = {
  COUNT: 'COUNT',
  PERCENTAGE: 'PERCENTAGE',
  AVERAGE: 'AVERAGE',
  SUM: 'SUM',
  RATIO: 'RATIO',
  TREND: 'TREND',
} as const;

export type MetricType = typeof MetricType[keyof typeof MetricType];

/**
 * Time granularity
 */
export const TimeGranularity = {
  HOURLY: 'HOURLY',
  DAILY: 'DAILY',
  WEEKLY: 'WEEKLY',
  MONTHLY: 'MONTHLY',
  QUARTERLY: 'QUARTERLY',
  YEARLY: 'YEARLY',
} as const;

export type TimeGranularity = typeof TimeGranularity[keyof typeof TimeGranularity];

/**
 * Widget types
 */
export const WidgetType = {
  CHART: 'CHART',
  TABLE: 'TABLE',
  METRIC_CARD: 'METRIC_CARD',
  PROGRESS_BAR: 'PROGRESS_BAR',
  MAP: 'MAP',
  TIMELINE: 'TIMELINE',
} as const;

export type WidgetType = typeof WidgetType[keyof typeof WidgetType];

/**
 * Export formats
 */
export const ExportFormat = {
  PDF: 'PDF',
  EXCEL: 'EXCEL',
  CSV: 'CSV',
  JSON: 'JSON',
} as const;

export type ExportFormat = typeof ExportFormat[keyof typeof ExportFormat];

/**
 * Aggregated course performance metrics
 */
export interface CourseAnalytics extends MultiTenantAuditFields {
  analytics_id: number;
  course_id: number;
  period_start: Date | string;
  period_end: Date | string;
  total_enrollments: number;
  active_students: number;
  completion_rate: number; // Decimal(5,2)
  average_progress: number; // Decimal(5,2)
  total_watch_time: number; // in minutes
  quiz_completion_rate: number; // Decimal(5,2)
  assignment_submission_rate: number; // Decimal(5,2)
  engagement_score: number; // Decimal(5,2)
}

/**
 * User engagement and progress analytics
 */
export interface UserAnalytics extends MultiTenantAuditFields {
  analytics_id: number;
  user_id: number;
  user_type: string; // 'student', 'teacher'
  period_start: Date | string;
  period_end: Date | string;
  login_count: number;
  session_duration_avg: number; // in minutes
  courses_accessed: number;
  videos_watched: number;
  quizzes_attempted: number;
  assignments_submitted: number;
  engagement_score: number; // Decimal(5,2)
}

/**
 * System-wide performance and usage metrics
 */
export interface SystemMetrics extends MultiTenantAuditFields {
  metrics_id: number;
  period_start: Date | string;
  period_end: Date | string;
  total_users: number;
  active_users: number;
  total_courses: number;
  active_courses: number;
  total_sessions: number;
  average_session_duration: number; // in minutes
  total_video_views: number;
  total_storage_used: number; // in bytes
  bandwidth_used: number; // in bytes
  system_uptime: number; // percentage
  error_rate: number; // percentage
}

/**
 * Saved reports and report configurations
 */
export interface Report extends MultiTenantAuditFields {
  report_id: number;
  report_name: string;
  report_type: ReportType | number;
  report_description?: string | null;
  report_config: Record<string, any>; // JSON configuration and parameters
  report_status: ReportStatus | number;
  last_generated_at?: Date | string | null;
  report_data_url?: string | null;
}

/**
 * Automated report generation schedules
 */
export interface ReportSchedule extends MultiTenantAuditFields {
  schedule_id: number;
  report_id: number; // FK to Report
  schedule_name: string;
  cron_expression: string; // Cron pattern for scheduling
  timezone: string;
  is_enabled: boolean;
  last_run_at?: Date | string | null;
  next_run_at?: Date | string | null;
  recipients: string[]; // Email addresses or user IDs
  schedule_config?: Record<string, any> | null; // Additional schedule configuration
}

/**
 * Point-in-time analytics snapshots
 */
export interface AnalyticsSnapshot extends MultiTenantAuditFields {
  snapshot_id: number;
  snapshot_name: string;
  snapshot_type: string; // Type of snapshot (daily, weekly, monthly)
  snapshot_date: Date | string;
  data: Record<string, any>; // JSON data containing the snapshot
  metadata?: Record<string, any> | null; // Additional metadata
}

/**
 * User-defined custom metrics and KPIs
 */
export interface CustomMetric extends MultiTenantAuditFields {
  metric_id: number;
  metric_name: string;
  metric_description?: string | null;
  metric_type: MetricType | number;
  calculation_config: Record<string, any>; // JSON configuration for metric calculation
}

/**
 * Dashboard widget configurations
 */
export interface DashboardWidget extends MultiTenantAuditFields {
  widget_id: number;
  widget_name: string;
  widget_type: WidgetType | number;
  dashboard_id?: number | null; // FK to Dashboard (if applicable)
  position_x: number;
  position_y: number;
  width: number;
  height: number;
  widget_config: Record<string, any>; // JSON widget configuration
  data_source: string; // Data source identifier
  user_id?: number | null; // For user-specific widgets
}

/**
 * Daily aggregated course statistics
 */
export interface DailyCourseMetrics extends MultiTenantAuditFields {
  metrics_id: number;
  course_id: number;
  date: Date | string;
  total_views: number;
  unique_viewers: number;
  total_watch_time: number; // in minutes
  completion_count: number;
  quiz_attempts: number;
  assignment_submissions: number;
  average_engagement: number; // Decimal(5,2)
}

/**
 * Weekly course performance summaries
 */
export interface WeeklyCourseMetrics extends MultiTenantAuditFields {
  metrics_id: number;
  course_id: number;
  week_start_date: Date | string;
  week_end_date: Date | string;
  total_enrollments: number;
  new_enrollments: number;
  completed_enrollments: number;
  total_watch_time: number; // in minutes
  average_progress: number; // Decimal(5,2)
  engagement_score: number; // Decimal(5,2)
}

/**
 * Monthly user engagement metrics
 */
export interface MonthlyUserMetrics extends MultiTenantAuditFields {
  metrics_id: number;
  user_id: number;
  user_type: string; // 'student', 'teacher'
  month: number; // 1-12
  year: number;
  total_login_time: number; // in minutes
  courses_completed: number;
  videos_watched: number;
  quizzes_completed: number;
  assignments_submitted: number;
  engagement_score: number; // Decimal(5,2)
}

/**
 * Quiz and assignment performance analytics
 */
export interface AssessmentAnalytics extends MultiTenantAuditFields {
  analytics_id: number;
  assessment_id: number;
  assessment_type: string; // 'quiz', 'assignment'
  course_id: number;
  total_attempts: number;
  completed_attempts: number;
  average_score: number; // Decimal(5,2)
  pass_rate: number; // Decimal(5,2)
  average_time_taken: number; // in minutes
  difficulty_score: number; // Calculated difficulty rating
  period_start: Date | string;
  period_end: Date | string;
}

/**
 * Video consumption and engagement metrics
 */
export interface VideoWatchAnalytics extends MultiTenantAuditFields {
  analytics_id: number;
  video_id: number;
  student_id: number;
  session_id: string;
  watch_duration: number; // in seconds
  completion_percentage: number; // Decimal(5,2)
  start_time: Date | string;
  end_time?: Date | string | null;
  device_type?: string | null;
  playback_quality?: string | null;
  buffer_events?: number | null;
  seek_events?: number | null;
}

/**
 * Dashboard overview data structure
 */
export interface DashboardOverview {
  totalUsers: number;
  activeUsers: number;
  totalCourses: number;
  activeCourses: number;
  totalEnrollments: number;
  averageCompletionRate: number;
  systemUptime: number;
  recentActivity: {
    enrollments: number;
    completions: number;
    activeUsers: number;
    period: string;
  };
}

/**
 * Real-time metrics data structure
 */
export interface RealtimeMetrics {
  currentActiveUsers: number;
  ongoingVideoSessions: number;
  currentQuizAttempts: number;
  systemLoad: number;
  serverResponse: number; // average response time in ms
  errorRate: number;
  timestamp: Date | string;
}

/**
 * Custom dashboard data structure
 */
export interface CustomDashboard {
  dashboard_id: number;
  dashboard_name: string;
  widgets: DashboardWidget[];
  layout: Record<string, any>; // Layout configuration
  user_id?: number | null;
  tenant_id: number;
}

/**
 * Course performance analytics data structure
 */
export interface CoursePerformanceAnalytics {
  courseId: number;
  courseName: string;
  totalEnrollments: number;
  activeStudents: number;
  completionRate: number;
  averageProgress: number;
  totalWatchTime: number;
  engagementScore: number;
  trends: {
    period: string;
    enrollments: number;
    completions: number;
    engagement: number;
  }[];
}

/**
 * Course engagement analytics data structure
 */
export interface CourseEngagementAnalytics {
  courseId: number;
  averageSessionDuration: number;
  videoCompletionRate: number;
  quizParticipationRate: number;
  assignmentSubmissionRate: number;
  discussionParticipation: number;
  peakActivityHours: number[];
  engagementTrends: {
    date: string;
    engagement: number;
    activeUsers: number;
  }[];
}

/**
 * Course completion analytics data structure
 */
export interface CourseCompletionAnalytics {
  courseId: number;
  totalCompletions: number;
  completionRate: number;
  averageTimeToComplete: number; // in days
  completionsByPeriod: {
    period: string;
    completions: number;
    enrollments: number;
    rate: number;
  }[];
  completionDistribution: {
    timeRange: string; // "0-7 days", "8-30 days", etc.
    count: number;
    percentage: number;
  }[];
}

/**
 * Video analytics data structure
 */
export interface VideoAnalytics {
  videoId: number;
  videoName: string;
  totalViews: number;
  uniqueViewers: number;
  averageWatchTime: number;
  completionRate: number;
  engagementScore: number;
  dropOffPoints: {
    timeStamp: number; // in seconds
    dropOffRate: number;
  }[];
  deviceBreakdown: {
    device: string;
    views: number;
    percentage: number;
  }[];
}

/**
 * User engagement analytics data structure
 */
export interface UserEngagementAnalytics {
  userId: number;
  userType: string;
  totalSessions: number;
  averageSessionDuration: number;
  coursesAccessed: number;
  videosWatched: number;
  quizzesAttempted: number;
  assignmentsSubmitted: number;
  engagementScore: number;
  activityPattern: {
    hour: number;
    activityLevel: number;
  }[];
}

/**
 * User progress analytics data structure
 */
export interface UserProgressAnalytics {
  userId: number;
  totalCourses: number;
  completedCourses: number;
  inProgressCourses: number;
  overallProgress: number;
  courseProgress: {
    courseId: number;
    courseName: string;
    progress: number;
    lastAccessed: Date | string;
    timeSpent: number;
  }[];
}

/**
 * Analytics export data structure
 */
export interface AnalyticsExports extends MultiTenantAuditFields {
  export_id: number;
  export_name: string;
  export_type: string;
  export_format: ExportFormat | number;
  export_status: string; // 'pending', 'processing', 'completed', 'failed'
  file_url?: string | null;
  file_size?: number | null; // in bytes
  expires_at?: Date | string | null;
  requested_by: number; // FK to User
}

/**
 * Custom metric calculation result
 */
export interface CustomMetricResult {
  metricId: number;
  metricName: string;
  value: number;
  unit?: string | null;
  calculatedAt: Date | string;
  period?: {
    start: Date | string;
    end: Date | string;
  } | null;
  breakdown?: {
    label: string;
    value: number;
  }[] | null;
}

/**
 * Time range filter for analytics queries
 */
export interface TimeRangeFilter {
  startDate: Date | string;
  endDate: Date | string;
  granularity?: TimeGranularity;
  timezone?: string;
}

/**
 * Analytics query parameters
 */
export interface AnalyticsQueryParams {
  timeRange?: TimeRangeFilter;
  filters?: Record<string, any>;
  groupBy?: string[];
  metrics?: string[];
  limit?: number;
  offset?: number;
}
