/**
 * @file analytics-entities.types.ts
 * @description analytics entity relationship mappings for analytics, reports, and their related entities.
 */

import { EntityRelationship } from '../constraints';

export const ANALYTICS_ENTITY_RELATIONSHIPS: EntityRelationship[] = [
  {
    entity: 'course_analytics',
    foreignKeys: [
      { column: 'course_id', referencedEntity: 'courses', referencedColumn: 'course_id', required: true, cascadeDelete: true, description: 'Analytics for course' },
      { column: 'tenant_id', referencedEntity: 'tenants', referencedColumn: 'tenant_id', required: true, description: 'Analytics belongs to tenant' },
      { column: 'created_by', referencedEntity: 'system_users', referencedColumn: 'system_user_id', required: true, description: 'Audit: created by user' },
      { column: 'updated_by', referencedEntity: 'system_users', referencedColumn: 'system_user_id', required: false, description: 'Audit: updated by user' }
    ]
  },
  {
    entity: 'user_analytics',
    foreignKeys: [
      { column: 'tenant_id', referencedEntity: 'tenants', referencedColumn: 'tenant_id', required: true, description: 'Analytics belongs to tenant' },
      { column: 'created_by', referencedEntity: 'system_users', referencedColumn: 'system_user_id', required: true, description: 'Audit: created by user' },
      { column: 'updated_by', referencedEntity: 'system_users', referencedColumn: 'system_user_id', required: false, description: 'Audit: updated by user' }
    ]
  },
  {
    entity: 'system_metrics',
    foreignKeys: [
      { column: 'tenant_id', referencedEntity: 'tenants', referencedColumn: 'tenant_id', required: true, description: 'Metrics belongs to tenant' },
      { column: 'created_by', referencedEntity: 'system_users', referencedColumn: 'system_user_id', required: true, description: 'Audit: created by user' },
      { column: 'updated_by', referencedEntity: 'system_users', referencedColumn: 'system_user_id', required: false, description: 'Audit: updated by user' }
    ]
  },
  {
    entity: 'reports',
    foreignKeys: [
      { column: 'tenant_id', referencedEntity: 'tenants', referencedColumn: 'tenant_id', required: true, description: 'Report belongs to tenant' },
      { column: 'created_by', referencedEntity: 'system_users', referencedColumn: 'system_user_id', required: true, description: 'Audit: created by user' },
      { column: 'updated_by', referencedEntity: 'system_users', referencedColumn: 'system_user_id', required: false, description: 'Audit: updated by user' }
    ]
  },
  {
    entity: 'report_schedules',
    foreignKeys: [
      { column: 'report_id', referencedEntity: 'reports', referencedColumn: 'report_id', required: true, cascadeDelete: true, description: 'Schedule for report' },
      { column: 'tenant_id', referencedEntity: 'tenants', referencedColumn: 'tenant_id', required: true, description: 'Schedule belongs to tenant' },
      { column: 'created_by', referencedEntity: 'system_users', referencedColumn: 'system_user_id', required: true, description: 'Audit: created by user' },
      { column: 'updated_by', referencedEntity: 'system_users', referencedColumn: 'system_user_id', required: false, description: 'Audit: updated by user' }
    ]
  },
  {
    entity: 'analytics_snapshots',
    foreignKeys: [
      { column: 'tenant_id', referencedEntity: 'tenants', referencedColumn: 'tenant_id', required: true, description: 'Snapshot belongs to tenant' },
      { column: 'created_by', referencedEntity: 'system_users', referencedColumn: 'system_user_id', required: true, description: 'Audit: created by user' },
      { column: 'updated_by', referencedEntity: 'system_users', referencedColumn: 'system_user_id', required: false, description: 'Audit: updated by user' }
    ]
  },
  {
    entity: 'custom_metrics',
    foreignKeys: [
      { column: 'tenant_id', referencedEntity: 'tenants', referencedColumn: 'tenant_id', required: true, description: 'Metric belongs to tenant' },
      { column: 'created_by', referencedEntity: 'system_users', referencedColumn: 'system_user_id', required: true, description: 'Audit: created by user' },
      { column: 'updated_by', referencedEntity: 'system_users', referencedColumn: 'system_user_id', required: false, description: 'Audit: updated by user' }
    ]
  },
  {
    entity: 'custom_dashboards',
    foreignKeys: [
      { column: 'tenant_id', referencedEntity: 'tenants', referencedColumn: 'tenant_id', required: true, description: 'Dashboard belongs to tenant' },
      { column: 'user_id', referencedEntity: 'system_users', referencedColumn: 'system_user_id', required: false, description: 'Dashboard belongs to user (optional)' },
      { column: 'created_by', referencedEntity: 'system_users', referencedColumn: 'system_user_id', required: true, description: 'Audit: created by user' },
      { column: 'updated_by', referencedEntity: 'system_users', referencedColumn: 'system_user_id', required: false, description: 'Audit: updated by user' }
    ]
  },
  {
    entity: 'dashboard_widgets',
    foreignKeys: [
      { column: 'dashboard_id', referencedEntity: 'custom_dashboards', referencedColumn: 'dashboard_id', required: false, cascadeDelete: true, description: 'Widget belongs to dashboard (optional)' },
      { column: 'user_id', referencedEntity: 'system_users', referencedColumn: 'system_user_id', required: false, description: 'Widget belongs to user (optional)' },
      { column: 'tenant_id', referencedEntity: 'tenants', referencedColumn: 'tenant_id', required: true, description: 'Widget belongs to tenant' },
      { column: 'created_by', referencedEntity: 'system_users', referencedColumn: 'system_user_id', required: true, description: 'Audit: created by user' },
      { column: 'updated_by', referencedEntity: 'system_users', referencedColumn: 'system_user_id', required: false, description: 'Audit: updated by user' }
    ]
  },
  {
    entity: 'daily_course_metrics',
    foreignKeys: [
      { column: 'course_id', referencedEntity: 'courses', referencedColumn: 'course_id', required: true, cascadeDelete: true, description: 'Metrics for course' },
      { column: 'tenant_id', referencedEntity: 'tenants', referencedColumn: 'tenant_id', required: true, description: 'Metrics belongs to tenant' },
      { column: 'created_by', referencedEntity: 'system_users', referencedColumn: 'system_user_id', required: true, description: 'Audit: created by user' },
      { column: 'updated_by', referencedEntity: 'system_users', referencedColumn: 'system_user_id', required: false, description: 'Audit: updated by user' }
    ]
  },
  {
    entity: 'weekly_course_metrics',
    foreignKeys: [
      { column: 'course_id', referencedEntity: 'courses', referencedColumn: 'course_id', required: true, cascadeDelete: true, description: 'Metrics for course' },
      { column: 'tenant_id', referencedEntity: 'tenants', referencedColumn: 'tenant_id', required: true, description: 'Metrics belongs to tenant' },
      { column: 'created_by', referencedEntity: 'system_users', referencedColumn: 'system_user_id', required: true, description: 'Audit: created by user' },
      { column: 'updated_by', referencedEntity: 'system_users', referencedColumn: 'system_user_id', required: false, description: 'Audit: updated by user' }
    ]
  },
  {
    entity: 'monthly_user_metrics',
    foreignKeys: [
      { column: 'tenant_id', referencedEntity: 'tenants', referencedColumn: 'tenant_id', required: true, description: 'Metrics belongs to tenant' },
      { column: 'created_by', referencedEntity: 'system_users', referencedColumn: 'system_user_id', required: true, description: 'Audit: created by user' },
      { column: 'updated_by', referencedEntity: 'system_users', referencedColumn: 'system_user_id', required: false, description: 'Audit: updated by user' }
    ]
  },
  {
    entity: 'video_watch_analytics',
    foreignKeys: [
      { column: 'video_id', referencedEntity: 'course_videos', referencedColumn: 'video_id', required: true, cascadeDelete: true, description: 'Analytics for video' },
      { column: 'student_id', referencedEntity: 'students', referencedColumn: 'student_id', required: true, cascadeDelete: true, description: 'Analytics for student' },
      { column: 'tenant_id', referencedEntity: 'tenants', referencedColumn: 'tenant_id', required: true, description: 'Analytics belongs to tenant' },
      { column: 'created_by', referencedEntity: 'system_users', referencedColumn: 'system_user_id', required: true, description: 'Audit: created by user' },
      { column: 'updated_by', referencedEntity: 'system_users', referencedColumn: 'system_user_id', required: false, description: 'Audit: updated by user' }
    ]
  },
  {
    entity: 'assessment_analytics',
    foreignKeys: [
      { column: 'assessment_id', referencedEntity: 'assessments', referencedColumn: 'assessment_id', required: true, cascadeDelete: true, description: 'Analytics for assessment' },
      { column: 'course_id', referencedEntity: 'courses', referencedColumn: 'course_id', required: true, cascadeDelete: true, description: 'Analytics for course assessments' },
      { column: 'tenant_id', referencedEntity: 'tenants', referencedColumn: 'tenant_id', required: true, description: 'Analytics belongs to tenant' },
      { column: 'created_by', referencedEntity: 'system_users', referencedColumn: 'system_user_id', required: true, description: 'Audit: created by user' },
      { column: 'updated_by', referencedEntity: 'system_users', referencedColumn: 'system_user_id', required: false, description: 'Audit: updated by user' }
    ]
  },
  {
    entity: 'analytics_exports',
    foreignKeys: [
      { column: 'tenant_id', referencedEntity: 'tenants', referencedColumn: 'tenant_id', required: true, description: 'Export belongs to tenant' },
      { column: 'requested_by', referencedEntity: 'system_users', referencedColumn: 'system_user_id', required: true, description: 'Export requested by user' },
      { column: 'created_by', referencedEntity: 'system_users', referencedColumn: 'system_user_id', required: true, description: 'Audit: created by user' },
      { column: 'updated_by', referencedEntity: 'system_users', referencedColumn: 'system_user_id', required: false, description: 'Audit: updated by user' }
    ]
  },
]