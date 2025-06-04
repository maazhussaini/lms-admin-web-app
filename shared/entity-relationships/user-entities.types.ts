/**
 * @file user-entities.types.ts
 * @description User entity relationship mappings for students, teachers, and system users.
 */

import { EntityRelationship } from '../constraints';

export const USER_ENTITY_RELATIONSHIPS: EntityRelationship[] = [
  {
    entity: 'students',
    foreignKeys: [
      { column: 'tenant_id', referencedEntity: 'tenants', referencedColumn: 'tenant_id', required: true, description: 'Student belongs to tenant' },
      { column: 'country_id', referencedEntity: 'countries', referencedColumn: 'country_id', required: true, description: 'Student country' },
      { column: 'state_id', referencedEntity: 'states', referencedColumn: 'state_id', required: true, description: 'Student state' },
      { column: 'city_id', referencedEntity: 'cities', referencedColumn: 'city_id', required: true, description: 'Student city' },
      { column: 'created_by', referencedEntity: 'system_users', referencedColumn: 'system_user_id', required: true, description: 'Audit: created by user' },
      { column: 'updated_by', referencedEntity: 'system_users', referencedColumn: 'system_user_id', required: false, description: 'Audit: updated by user' },
      { column: 'deleted_by', referencedEntity: 'system_users', referencedColumn: 'system_user_id', required: false, description: 'Audit: deleted by user' }
    ]
  },
  {
    entity: 'student_email_addresses',
    foreignKeys: [
      { column: 'tenant_id', referencedEntity: 'tenants', referencedColumn: 'tenant_id', required: true, description: 'Email within tenant' },
      { column: 'student_id', referencedEntity: 'students', referencedColumn: 'student_id', required: true, cascadeDelete: true, description: 'Email belongs to student' },
      { column: 'created_by', referencedEntity: 'system_users', referencedColumn: 'system_user_id', required: true, description: 'Audit: created by user' },
      { column: 'updated_by', referencedEntity: 'system_users', referencedColumn: 'system_user_id', required: false, description: 'Audit: updated by user' },
      { column: 'deleted_by', referencedEntity: 'system_users', referencedColumn: 'system_user_id', required: false, description: 'Audit: deleted by user' }
    ]
  },
  {
    entity: 'student_phone_numbers',
    foreignKeys: [
      { column: 'tenant_id', referencedEntity: 'tenants', referencedColumn: 'tenant_id', required: true, description: 'Phone within tenant' },
      { column: 'student_id', referencedEntity: 'students', referencedColumn: 'student_id', required: true, cascadeDelete: true, description: 'Phone belongs to student' },
      { column: 'created_by', referencedEntity: 'system_users', referencedColumn: 'system_user_id', required: true, description: 'Audit: created by user' },
      { column: 'updated_by', referencedEntity: 'system_users', referencedColumn: 'system_user_id', required: false, description: 'Audit: updated by user' },
      { column: 'deleted_by', referencedEntity: 'system_users', referencedColumn: 'system_user_id', required: false, description: 'Audit: deleted by user' }
    ]
  },
  {
    entity: 'student_devices',
    foreignKeys: [
      { column: 'tenant_id', referencedEntity: 'tenants', referencedColumn: 'tenant_id', required: true, description: 'Device within tenant' },
      { column: 'student_id', referencedEntity: 'students', referencedColumn: 'student_id', required: true, cascadeDelete: true, description: 'Device belongs to student' },
      { column: 'created_by', referencedEntity: 'system_users', referencedColumn: 'system_user_id', required: true, description: 'Audit: created by user' },
      { column: 'updated_by', referencedEntity: 'system_users', referencedColumn: 'system_user_id', required: false, description: 'Audit: updated by user' },
      { column: 'deleted_by', referencedEntity: 'system_users', referencedColumn: 'system_user_id', required: false, description: 'Audit: deleted by user' }
    ]
  },
  {
    entity: 'teachers',
    foreignKeys: [
      { column: 'tenant_id', referencedEntity: 'tenants', referencedColumn: 'tenant_id', required: true, description: 'Teacher belongs to tenant' },
      { column: 'country_id', referencedEntity: 'countries', referencedColumn: 'country_id', required: false, description: 'Teacher country' },
      { column: 'state_id', referencedEntity: 'states', referencedColumn: 'state_id', required: false, description: 'Teacher state' },
      { column: 'city_id', referencedEntity: 'cities', referencedColumn: 'city_id', required: false, description: 'Teacher city' },
      { column: 'created_by', referencedEntity: 'system_users', referencedColumn: 'system_user_id', required: true, description: 'Audit: created by user' },
      { column: 'updated_by', referencedEntity: 'system_users', referencedColumn: 'system_user_id', required: false, description: 'Audit: updated by user' },
      { column: 'deleted_by', referencedEntity: 'system_users', referencedColumn: 'system_user_id', required: false, description: 'Audit: deleted by user' }
    ]
  },
  {
    entity: 'teacher_email_addresses',
    foreignKeys: [
      { column: 'tenant_id', referencedEntity: 'tenants', referencedColumn: 'tenant_id', required: true, description: 'Email within tenant' },
      { column: 'teacher_id', referencedEntity: 'teachers', referencedColumn: 'teacher_id', required: true, cascadeDelete: true, description: 'Email belongs to teacher' },
      { column: 'created_by', referencedEntity: 'system_users', referencedColumn: 'system_user_id', required: true, description: 'Audit: created by user' },
      { column: 'updated_by', referencedEntity: 'system_users', referencedColumn: 'system_user_id', required: false, description: 'Audit: updated by user' },
      { column: 'deleted_by', referencedEntity: 'system_users', referencedColumn: 'system_user_id', required: false, description: 'Audit: deleted by user' }
    ]
  },
  {
    entity: 'teacher_phone_numbers',
    foreignKeys: [
      { column: 'tenant_id', referencedEntity: 'tenants', referencedColumn: 'tenant_id', required: true, description: 'Phone within tenant' },
      { column: 'teacher_id', referencedEntity: 'teachers', referencedColumn: 'teacher_id', required: true, cascadeDelete: true, description: 'Phone belongs to teacher' },
      { column: 'created_by', referencedEntity: 'system_users', referencedColumn: 'system_user_id', required: true, description: 'Audit: created by user' },
      { column: 'updated_by', referencedEntity: 'system_users', referencedColumn: 'system_user_id', required: false, description: 'Audit: updated by user' },
      { column: 'deleted_by', referencedEntity: 'system_users', referencedColumn: 'system_user_id', required: false, description: 'Audit: deleted by user' }
    ]
  },
  {
    entity: 'teacher_courses',
    foreignKeys: [
      { column: 'tenant_id', referencedEntity: 'tenants', referencedColumn: 'tenant_id', required: true, description: 'Assignment within tenant' },
      { column: 'course_id', referencedEntity: 'courses', referencedColumn: 'course_id', required: true, cascadeDelete: true, description: 'Teacher assigned to course' },
      { column: 'teacher_id', referencedEntity: 'teachers', referencedColumn: 'teacher_id', required: true, cascadeDelete: true, description: 'Course assigned to teacher' },
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
  {
    entity: 'enrollments',
    foreignKeys: [
      { column: 'tenant_id', referencedEntity: 'tenants', referencedColumn: 'tenant_id', required: true, description: 'Enrollment belongs to tenant' },
      { column: 'course_id', referencedEntity: 'courses', referencedColumn: 'course_id', required: true, description: 'Enrollment for specific course' },
      { column: 'student_id', referencedEntity: 'students', referencedColumn: 'student_id', required: true, description: 'Student enrolled in course' },
      { column: 'institute_id', referencedEntity: 'institutes', referencedColumn: 'institute_id', required: true, description: 'Enrollment through institute' },
      { column: 'teacher_id', referencedEntity: 'teachers', referencedColumn: 'teacher_id', required: false, description: 'Optional teacher assignment' },
      { column: 'status_changed_by', referencedEntity: 'system_users', referencedColumn: 'system_user_id', required: false, description: 'User who changed enrollment status' },
      { column: 'created_by', referencedEntity: 'system_users', referencedColumn: 'system_user_id', required: true, description: 'Audit: created by user' },
      { column: 'updated_by', referencedEntity: 'system_users', referencedColumn: 'system_user_id', required: false, description: 'Audit: updated by user' },
      { column: 'deleted_by', referencedEntity: 'system_users', referencedColumn: 'system_user_id', required: false, description: 'Audit: deleted by user' }
    ]
  },
  {
    entity: 'enrollment_status_history',
    foreignKeys: [
      { column: 'tenant_id', referencedEntity: 'tenants', referencedColumn: 'tenant_id', required: true, description: 'Status history belongs to tenant' },
      { column: 'enrollment_id', referencedEntity: 'enrollments', referencedColumn: 'enrollment_id', required: true, cascadeDelete: true, description: 'Status history for specific enrollment' },
      { column: 'changed_by', referencedEntity: 'system_users', referencedColumn: 'system_user_id', required: true, description: 'User who made the status change' },
      { column: 'created_by', referencedEntity: 'system_users', referencedColumn: 'system_user_id', required: true, description: 'Audit: created by user' },
      { column: 'updated_by', referencedEntity: 'system_users', referencedColumn: 'system_user_id', required: false, description: 'Audit: updated by user' },
      { column: 'deleted_by', referencedEntity: 'system_users', referencedColumn: 'system_user_id', required: false, description: 'Audit: deleted by user' }
    ]
  }
];