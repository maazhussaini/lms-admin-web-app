/**
 * @file course-session-entities.types.ts
 * @description Course session entity relationship mappings with complete foreign key definitions.
 */

import { EntityRelationship } from '../constraints';

export const COURSE_SESSION_ENTITY_RELATIONSHIPS: EntityRelationship[] = [
  {
    entity: 'course_session_status_lookups',
    foreignKeys: [
      { column: 'created_by', referencedEntity: 'system_users', referencedColumn: 'system_user_id', required: true, description: 'Audit: created by user' },
      { column: 'updated_by', referencedEntity: 'system_users', referencedColumn: 'system_user_id', required: false, description: 'Audit: updated by user' }
    ]
  },
  {
    entity: 'course_sessions',
    foreignKeys: [
      { column: 'tenant_id', referencedEntity: 'tenants', referencedColumn: 'tenant_id', required: true, description: 'Course session belongs to tenant' },
      { column: 'teacher_id', referencedEntity: 'teachers', referencedColumn: 'teacher_id', required: true, description: 'Course session assigned to teacher' },
      { column: 'course_id', referencedEntity: 'courses', referencedColumn: 'course_id', required: true, description: 'Course session for specific course' },
      { column: 'course_session_status_id', referencedEntity: 'course_session_status_lookups', referencedColumn: 'course_session_status_id', required: true, description: 'Course session status' },
      { column: 'created_by', referencedEntity: 'system_users', referencedColumn: 'system_user_id', required: true, description: 'Audit: created by user' },
      { column: 'updated_by', referencedEntity: 'system_users', referencedColumn: 'system_user_id', required: false, description: 'Audit: updated by user' }
    ]
  },
  {
    entity: 'course_session_enrollments',
    foreignKeys: [
      { column: 'tenant_id', referencedEntity: 'tenants', referencedColumn: 'tenant_id', required: true, description: 'Enrollment belongs to tenant' },
      { column: 'course_session_id', referencedEntity: 'course_sessions', referencedColumn: 'course_session_id', required: true, cascadeDelete: true, description: 'Enrollment for course session' },
      { column: 'student_id', referencedEntity: 'students', referencedColumn: 'student_id', required: true, cascadeDelete: true, description: 'Student enrolled in session' },
      { column: 'created_by', referencedEntity: 'system_users', referencedColumn: 'system_user_id', required: true, description: 'Audit: created by user' },
      { column: 'updated_by', referencedEntity: 'system_users', referencedColumn: 'system_user_id', required: false, description: 'Audit: updated by user' }
    ]
  },
  {
    entity: 'course_session_announcements',
    foreignKeys: [
      { column: 'tenant_id', referencedEntity: 'tenants', referencedColumn: 'tenant_id', required: true, description: 'Announcement belongs to tenant' },
      { column: 'course_session_id', referencedEntity: 'course_sessions', referencedColumn: 'course_session_id', required: true, cascadeDelete: true, description: 'Announcement for course session' },
      { column: 'created_by', referencedEntity: 'system_users', referencedColumn: 'system_user_id', required: true, description: 'Audit: created by user' },
      { column: 'updated_by', referencedEntity: 'system_users', referencedColumn: 'system_user_id', required: false, description: 'Audit: updated by user' }
    ]
  },
  {
    entity: 'course_session_settings',
    foreignKeys: [
      { column: 'tenant_id', referencedEntity: 'tenants', referencedColumn: 'tenant_id', required: true, description: 'Settings belong to tenant' },
      { column: 'course_session_id', referencedEntity: 'course_sessions', referencedColumn: 'course_session_id', required: true, cascadeDelete: true, description: 'Settings for course session' },
      { column: 'created_by', referencedEntity: 'system_users', referencedColumn: 'system_user_id', required: true, description: 'Audit: created by user' },
      { column: 'updated_by', referencedEntity: 'system_users', referencedColumn: 'system_user_id', required: false, description: 'Audit: updated by user' }
    ]
  },
];