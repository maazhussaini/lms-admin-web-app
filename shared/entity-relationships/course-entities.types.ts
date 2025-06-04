/**
 * @file course-entities.types.ts
 * @description Course entity relationship mappings for academic structure with complete foreign key definitions.
 */

import { EntityRelationship } from '../constraints';

export const COURSE_ENTITY_RELATIONSHIPS: EntityRelationship[] = [
  {
    entity: 'programs',
    foreignKeys: [
      { column: 'tenant_id', referencedEntity: 'tenants', referencedColumn: 'tenant_id', required: true, description: 'Program belongs to tenant' },
      { column: 'created_by', referencedEntity: 'system_users', referencedColumn: 'system_user_id', required: true, description: 'Audit: created by user' },
      { column: 'updated_by', referencedEntity: 'system_users', referencedColumn: 'system_user_id', required: false, description: 'Audit: updated by user' },
      { column: 'deleted_by', referencedEntity: 'system_users', referencedColumn: 'system_user_id', required: false, description: 'Audit: deleted by user' }
    ]
  },
  {
    entity: 'specializations',
    foreignKeys: [
      { column: 'tenant_id', referencedEntity: 'tenants', referencedColumn: 'tenant_id', required: true, description: 'Specialization belongs to tenant' },
      { column: 'program_id', referencedEntity: 'programs', referencedColumn: 'program_id', required: true, cascadeDelete: true, description: 'Specialization belongs to program' },
      { column: 'created_by', referencedEntity: 'system_users', referencedColumn: 'system_user_id', required: true, description: 'Audit: created by user' },
      { column: 'updated_by', referencedEntity: 'system_users', referencedColumn: 'system_user_id', required: false, description: 'Audit: updated by user' },
      { column: 'deleted_by', referencedEntity: 'system_users', referencedColumn: 'system_user_id', required: false, description: 'Audit: deleted by user' }
    ]
  },
  {
    entity: 'courses',
    foreignKeys: [
      { column: 'tenant_id', referencedEntity: 'tenants', referencedColumn: 'tenant_id', required: true, description: 'Course belongs to tenant' },
      { column: 'specialization_id', referencedEntity: 'specializations', referencedColumn: 'specialization_id', required: false, description: 'Course may belong to specialization' },
      { column: 'created_by', referencedEntity: 'system_users', referencedColumn: 'system_user_id', required: true, description: 'Audit: created by user' },
      { column: 'updated_by', referencedEntity: 'system_users', referencedColumn: 'system_user_id', required: false, description: 'Audit: updated by user' },
      { column: 'deleted_by', referencedEntity: 'system_users', referencedColumn: 'system_user_id', required: false, description: 'Audit: deleted by user' }
    ]
  },
  {
    entity: 'course_modules',
    foreignKeys: [
      { column: 'tenant_id', referencedEntity: 'tenants', referencedColumn: 'tenant_id', required: true, description: 'Module belongs to tenant' },
      { column: 'course_id', referencedEntity: 'courses', referencedColumn: 'course_id', required: true, cascadeDelete: true, description: 'Module belongs to course' },
      { column: 'created_by', referencedEntity: 'system_users', referencedColumn: 'system_user_id', required: true, description: 'Audit: created by user' },
      { column: 'updated_by', referencedEntity: 'system_users', referencedColumn: 'system_user_id', required: false, description: 'Audit: updated by user' },
      { column: 'deleted_by', referencedEntity: 'system_users', referencedColumn: 'system_user_id', required: false, description: 'Audit: deleted by user' }
    ]
  },
  {
    entity: 'course_topics',
    foreignKeys: [
      { column: 'tenant_id', referencedEntity: 'tenants', referencedColumn: 'tenant_id', required: true, description: 'Topic belongs to tenant' },
      { column: 'module_id', referencedEntity: 'course_modules', referencedColumn: 'course_module_id', required: true, cascadeDelete: true, description: 'Topic belongs to module' },
      { column: 'created_by', referencedEntity: 'system_users', referencedColumn: 'system_user_id', required: true, description: 'Audit: created by user' },
      { column: 'updated_by', referencedEntity: 'system_users', referencedColumn: 'system_user_id', required: false, description: 'Audit: updated by user' },
      { column: 'deleted_by', referencedEntity: 'system_users', referencedColumn: 'system_user_id', required: false, description: 'Audit: deleted by user' }
    ]
  },
  {
    entity: 'course_videos',
    foreignKeys: [
      { column: 'tenant_id', referencedEntity: 'tenants', referencedColumn: 'tenant_id', required: true, description: 'Video belongs to tenant' },
      { column: 'course_id', referencedEntity: 'courses', referencedColumn: 'course_id', required: true, cascadeDelete: true, description: 'Video belongs to course' },
      { column: 'course_topic_id', referencedEntity: 'course_topics', referencedColumn: 'course_topic_id', required: true, cascadeDelete: true, description: 'Video belongs to topic' },
      { column: 'created_by', referencedEntity: 'system_users', referencedColumn: 'system_user_id', required: true, description: 'Audit: created by user' },
      { column: 'updated_by', referencedEntity: 'system_users', referencedColumn: 'system_user_id', required: false, description: 'Audit: updated by user' },
      { column: 'deleted_by', referencedEntity: 'system_users', referencedColumn: 'system_user_id', required: false, description: 'Audit: deleted by user' }
    ]
  },
  {
    entity: 'course_documents',
    foreignKeys: [
      { column: 'tenant_id', referencedEntity: 'tenants', referencedColumn: 'tenant_id', required: true, description: 'Document belongs to tenant' },
      { column: 'course_id', referencedEntity: 'courses', referencedColumn: 'course_id', required: true, cascadeDelete: true, description: 'Document belongs to course' },
      { column: 'course_topic_id', referencedEntity: 'course_topics', referencedColumn: 'course_topic_id', required: true, cascadeDelete: true, description: 'Document belongs to topic' },
      { column: 'created_by', referencedEntity: 'system_users', referencedColumn: 'system_user_id', required: true, description: 'Audit: created by user' },
      { column: 'updated_by', referencedEntity: 'system_users', referencedColumn: 'system_user_id', required: false, description: 'Audit: updated by user' },
      { column: 'deleted_by', referencedEntity: 'system_users', referencedColumn: 'system_user_id', required: false, description: 'Audit: deleted by user' }
    ]
  },
  {
    entity: 'video_progresses',
    foreignKeys: [
      { column: 'tenant_id', referencedEntity: 'tenants', referencedColumn: 'tenant_id', required: true, description: 'Progress belongs to tenant' },
      { column: 'student_id', referencedEntity: 'students', referencedColumn: 'student_id', required: true, cascadeDelete: true, description: 'Progress tracked for student' },
      { column: 'course_video_id', referencedEntity: 'course_videos', referencedColumn: 'course_video_id', required: true, cascadeDelete: true, description: 'Progress tracked for video' },
      { column: 'created_by', referencedEntity: 'system_users', referencedColumn: 'system_user_id', required: true, description: 'Audit: created by user' },
      { column: 'updated_by', referencedEntity: 'system_users', referencedColumn: 'system_user_id', required: false, description: 'Audit: updated by user' },
      { column: 'deleted_by', referencedEntity: 'system_users', referencedColumn: 'system_user_id', required: false, description: 'Audit: deleted by user' }
    ]
  },
  {
    entity: 'student_course_progresses',
    foreignKeys: [
      { column: 'tenant_id', referencedEntity: 'tenants', referencedColumn: 'tenant_id', required: true, description: 'Progress belongs to tenant' },
      { column: 'student_id', referencedEntity: 'students', referencedColumn: 'student_id', required: true, cascadeDelete: true, description: 'Progress tracked for student' },
      { column: 'course_id', referencedEntity: 'courses', referencedColumn: 'course_id', required: true, cascadeDelete: true, description: 'Progress tracked for course' },
      { column: 'created_by', referencedEntity: 'system_users', referencedColumn: 'system_user_id', required: true, description: 'Audit: created by user' },
      { column: 'updated_by', referencedEntity: 'system_users', referencedColumn: 'system_user_id', required: false, description: 'Audit: updated by user' },
      { column: 'deleted_by', referencedEntity: 'system_users', referencedColumn: 'system_user_id', required: false, description: 'Audit: deleted by user' }
    ]
  },
  {
    entity: 'institutes',
    foreignKeys: [
      { column: 'tenant_id', referencedEntity: 'tenants', referencedColumn: 'tenant_id', required: true, description: 'Institute belongs to tenant' },
      { column: 'created_by', referencedEntity: 'system_users', referencedColumn: 'system_user_id', required: true, description: 'Audit: created by user' },
      { column: 'updated_by', referencedEntity: 'system_users', referencedColumn: 'system_user_id', required: false, description: 'Audit: updated by user' },
      { column: 'deleted_by', referencedEntity: 'system_users', referencedColumn: 'system_user_id', required: false, description: 'Audit: deleted by user' }
    ]
  },
  {
    entity: 'enrollments',
    foreignKeys: [
      { column: 'tenant_id', referencedEntity: 'tenants', referencedColumn: 'tenant_id', required: true, description: 'Enrollment belongs to tenant' },
      { column: 'course_id', referencedEntity: 'courses', referencedColumn: 'course_id', required: true, cascadeDelete: true, description: 'Enrollment for course' },
      { column: 'student_id', referencedEntity: 'students', referencedColumn: 'student_id', required: true, cascadeDelete: true, description: 'Student enrolled' },
      { column: 'institute_id', referencedEntity: 'institutes', referencedColumn: 'institute_id', required: true, description: 'Enrollment through institute' },
      { column: 'teacher_id', referencedEntity: 'teachers', referencedColumn: 'teacher_id', required: false, description: 'Enrollment with teacher' },
      { column: 'created_by', referencedEntity: 'system_users', referencedColumn: 'system_user_id', required: true, description: 'Audit: created by user' },
      { column: 'updated_by', referencedEntity: 'system_users', referencedColumn: 'system_user_id', required: false, description: 'Audit: updated by user' }
    ]
  },
  {
    entity: 'student_institutes',
    foreignKeys: [
      { column: 'tenant_id', referencedEntity: 'tenants', referencedColumn: 'tenant_id', required: true, description: 'Association belongs to tenant' },
      { column: 'student_id', referencedEntity: 'students', referencedColumn: 'student_id', required: true, cascadeDelete: true, description: 'Student associated with institute' },
      { column: 'institute_id', referencedEntity: 'institutes', referencedColumn: 'institute_id', required: true, cascadeDelete: true, description: 'Institute associated with student' },
      { column: 'created_by', referencedEntity: 'system_users', referencedColumn: 'system_user_id', required: true, description: 'Audit: created by user' },
      { column: 'updated_by', referencedEntity: 'system_users', referencedColumn: 'system_user_id', required: false, description: 'Audit: updated by user' },
      { column: 'deleted_by', referencedEntity: 'system_users', referencedColumn: 'system_user_id', required: false, description: 'Audit: deleted by user' }
    ]
  },
];