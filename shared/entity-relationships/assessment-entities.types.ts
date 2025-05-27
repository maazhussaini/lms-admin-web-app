/**
 * @file assessment-entities.types.ts
 * @description Assessment entity relationship mappings for quizzes, assignments, and their related entities.
 */

import { EntityRelationship } from '../constraints';

export const ASSESSMENT_ENTITY_RELATIONSHIPS: EntityRelationship[] = [
  {
    entity: 'quizzes',
    foreignKeys: [
      { column: 'tenant_id', referencedEntity: 'tenants', referencedColumn: 'tenant_id', required: true, description: 'Quiz belongs to tenant' },
      { column: 'course_id', referencedEntity: 'courses', referencedColumn: 'course_id', required: true, cascadeDelete: true, description: 'Quiz belongs to course' },
      { column: 'created_by', referencedEntity: 'system_users', referencedColumn: 'system_user_id', required: true, description: 'Audit: created by user' },
      { column: 'updated_by', referencedEntity: 'system_users', referencedColumn: 'system_user_id', required: false, description: 'Audit: updated by user' }
    ]
  },
  {
    entity: 'quiz_mappings',
    foreignKeys: [
      { column: 'tenant_id', referencedEntity: 'tenants', referencedColumn: 'tenant_id', required: true, description: 'Mapping belongs to tenant' },
      { column: 'quiz_id', referencedEntity: 'quizzes', referencedColumn: 'quiz_id', required: true, cascadeDelete: true, description: 'Mapping for quiz' },
      { column: 'created_by', referencedEntity: 'system_users', referencedColumn: 'system_user_id', required: true, description: 'Audit: created by user' },
      { column: 'updated_by', referencedEntity: 'system_users', referencedColumn: 'system_user_id', required: false, description: 'Audit: updated by user' }
    ]
  },
  {
    entity: 'quiz_questions',
    foreignKeys: [
      { column: 'tenant_id', referencedEntity: 'tenants', referencedColumn: 'tenant_id', required: true, description: 'Question belongs to tenant' },
      { column: 'quiz_id', referencedEntity: 'quizzes', referencedColumn: 'quiz_id', required: true, cascadeDelete: true, description: 'Question belongs to quiz' },
      { column: 'created_by', referencedEntity: 'system_users', referencedColumn: 'system_user_id', required: true, description: 'Audit: created by user' },
      { column: 'updated_by', referencedEntity: 'system_users', referencedColumn: 'system_user_id', required: false, description: 'Audit: updated by user' }
    ]
  },
  {
    entity: 'quiz_question_options',
    foreignKeys: [
      { column: 'tenant_id', referencedEntity: 'tenants', referencedColumn: 'tenant_id', required: true, description: 'Option belongs to tenant' },
      { column: 'quiz_question_id', referencedEntity: 'quiz_questions', referencedColumn: 'quiz_question_id', required: true, cascadeDelete: true, description: 'Option belongs to question' },
      { column: 'created_by', referencedEntity: 'system_users', referencedColumn: 'system_user_id', required: true, description: 'Audit: created by user' },
      { column: 'updated_by', referencedEntity: 'system_users', referencedColumn: 'system_user_id', required: false, description: 'Audit: updated by user' }
    ]
  },
  {
    entity: 'quiz_question_answers',
    foreignKeys: [
      { column: 'tenant_id', referencedEntity: 'tenants', referencedColumn: 'tenant_id', required: true, description: 'Answer belongs to tenant' },
      { column: 'quiz_question_id', referencedEntity: 'quiz_questions', referencedColumn: 'quiz_question_id', required: true, cascadeDelete: true, description: 'Answer belongs to question' },
      { column: 'created_by', referencedEntity: 'system_users', referencedColumn: 'system_user_id', required: true, description: 'Audit: created by user' },
      { column: 'updated_by', referencedEntity: 'system_users', referencedColumn: 'system_user_id', required: false, description: 'Audit: updated by user' }
    ]
  },
  {
    entity: 'quiz_attempts',
    foreignKeys: [
      { column: 'tenant_id', referencedEntity: 'tenants', referencedColumn: 'tenant_id', required: true, description: 'Attempt belongs to tenant' },
      { column: 'quiz_id', referencedEntity: 'quizzes', referencedColumn: 'quiz_id', required: true, cascadeDelete: true, description: 'Attempt for quiz' },
      { column: 'student_id', referencedEntity: 'students', referencedColumn: 'student_id', required: true, cascadeDelete: true, description: 'Attempt by student' },
      { column: 'graded_by', referencedEntity: 'system_users', referencedColumn: 'system_user_id', required: false, description: 'Graded by user' },
      { column: 'created_by', referencedEntity: 'system_users', referencedColumn: 'system_user_id', required: true, description: 'Audit: created by user' },
      { column: 'updated_by', referencedEntity: 'system_users', referencedColumn: 'system_user_id', required: false, description: 'Audit: updated by user' }
    ]
  },
  {
    entity: 'quiz_attempt_answers',
    foreignKeys: [
      { column: 'tenant_id', referencedEntity: 'tenants', referencedColumn: 'tenant_id', required: true, description: 'Answer belongs to tenant' },
      { column: 'quiz_attempt_id', referencedEntity: 'quiz_attempts', referencedColumn: 'quiz_attempt_id', required: true, cascadeDelete: true, description: 'Answer for attempt' },
      { column: 'quiz_question_id', referencedEntity: 'quiz_questions', referencedColumn: 'quiz_question_id', required: true, description: 'Answer for question' },
      { column: 'quiz_question_option_id', referencedEntity: 'quiz_question_options', referencedColumn: 'quiz_question_option_id', required: false, description: 'Selected option (if applicable)' },
      { column: 'created_by', referencedEntity: 'system_users', referencedColumn: 'system_user_id', required: true, description: 'Audit: created by user' },
      { column: 'updated_by', referencedEntity: 'system_users', referencedColumn: 'system_user_id', required: false, description: 'Audit: updated by user' }
    ]
  },
  {
    entity: 'assignments',
    foreignKeys: [
      { column: 'tenant_id', referencedEntity: 'tenants', referencedColumn: 'tenant_id', required: true, description: 'Assignment belongs to tenant' },
      { column: 'course_id', referencedEntity: 'courses', referencedColumn: 'course_id', required: true, cascadeDelete: true, description: 'Assignment belongs to course' },
      { column: 'created_by', referencedEntity: 'system_users', referencedColumn: 'system_user_id', required: true, description: 'Audit: created by user' },
      { column: 'updated_by', referencedEntity: 'system_users', referencedColumn: 'system_user_id', required: false, description: 'Audit: updated by user' }
    ]
  },
  {
    entity: 'assignment_mappings',
    foreignKeys: [
      { column: 'tenant_id', referencedEntity: 'tenants', referencedColumn: 'tenant_id', required: true, description: 'Mapping belongs to tenant' },
      { column: 'assignment_id', referencedEntity: 'assignments', referencedColumn: 'assignment_id', required: true, cascadeDelete: true, description: 'Mapping for assignment' },
      { column: 'created_by', referencedEntity: 'system_users', referencedColumn: 'system_user_id', required: true, description: 'Audit: created by user' },
      { column: 'updated_by', referencedEntity: 'system_users', referencedColumn: 'system_user_id', required: false, description: 'Audit: updated by user' }
    ]
  },
  {
    entity: 'student_assignments',
    foreignKeys: [
      { column: 'tenant_id', referencedEntity: 'tenants', referencedColumn: 'tenant_id', required: true, description: 'Submission belongs to tenant' },
      { column: 'assignment_id', referencedEntity: 'assignments', referencedColumn: 'assignment_id', required: true, cascadeDelete: true, description: 'Submission for assignment' },
      { column: 'student_id', referencedEntity: 'students', referencedColumn: 'student_id', required: true, cascadeDelete: true, description: 'Submission by student' },
      { column: 'graded_by', referencedEntity: 'system_users', referencedColumn: 'system_user_id', required: false, description: 'Graded by user' },
      { column: 'created_by', referencedEntity: 'system_users', referencedColumn: 'system_user_id', required: true, description: 'Audit: created by user' },
      { column: 'updated_by', referencedEntity: 'system_users', referencedColumn: 'system_user_id', required: false, description: 'Audit: updated by user' }
    ]
  },
  {
    entity: 'assignment_submission_files',
    foreignKeys: [
      { column: 'tenant_id', referencedEntity: 'tenants', referencedColumn: 'tenant_id', required: true, description: 'File belongs to tenant' },
      { column: 'student_assignment_id', referencedEntity: 'student_assignments', referencedColumn: 'student_assignment_id', required: true, cascadeDelete: true, description: 'File for submission' },
      { column: 'created_by', referencedEntity: 'system_users', referencedColumn: 'system_user_id', required: true, description: 'Audit: created by user' },
      { column: 'updated_by', referencedEntity: 'system_users', referencedColumn: 'system_user_id', required: false, description: 'Audit: updated by user' }
    ]
  },
];