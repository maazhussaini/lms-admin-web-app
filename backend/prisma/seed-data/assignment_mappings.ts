import { AssignmentReferenceTable } from '@prisma/client';

// Seed data for assignment mappings
// All fields mapped from SQL, robust audit fields, type-safe

export const assignmentMappings = [
  // Assignment 1 mapped to Course 1 (Introduction to Programming)
  {
    tenant_id: 1,
    assignment_id: 1,
    reference_table_type: AssignmentReferenceTable.COURSE,
    reference_id: 1,
    teacher_id: 1,
    is_active: true,
    is_deleted: false,
    created_at: new Date(),
    updated_at: new Date(),
    created_by: 1,
    updated_by: null,
    deleted_at: null,
    deleted_by: null,
    created_ip: '14.1.1.1',
    updated_ip: '14.1.1.2',
  },
  // Assignment 2 mapped to Course Module 1 (Getting Started with Python)
  {
    tenant_id: 1,
    assignment_id: 2,
    reference_table_type: AssignmentReferenceTable.COURSE_MODULE,
    reference_id: 1,
    teacher_id: 1,
    is_active: true,
    is_deleted: false,
    created_at: new Date(),
    updated_at: new Date(),
    created_by: 1,
    updated_by: null,
    deleted_at: null,
    deleted_by: null,
    created_ip: '14.1.1.3',
    updated_ip: '14.1.1.4',
  },
  // Assignment 3 mapped to Course Topic 1 (Python Syntax)
  {
    tenant_id: 1,
    assignment_id: 3,
    reference_table_type: AssignmentReferenceTable.COURSE_TOPIC,
    reference_id: 1,
    teacher_id: 1,
    is_active: true,
    is_deleted: false,
    created_at: new Date(),
    updated_at: new Date(),
    created_by: 1,
    updated_by: null,
    deleted_at: null,
    deleted_by: null,
    created_ip: '14.1.1.5',
    updated_ip: '14.1.1.6',
  },
  // Assignment 4 mapped to Course 2 (Principles of Marketing)
  {
    tenant_id: 1,
    assignment_id: 4,
    reference_table_type: AssignmentReferenceTable.COURSE,
    reference_id: 2,
    teacher_id: 2,
    is_active: true,
    is_deleted: false,
    created_at: new Date(),
    updated_at: new Date(),
    created_by: 2,
    updated_by: null,
    deleted_at: null,
    deleted_by: null,
    created_ip: '14.1.1.7',
    updated_ip: '14.1.1.8',
  },
  // Assignment 5 mapped to Course Module 3 (Solar Power)
  {
    tenant_id: 1,
    assignment_id: 5,
    reference_table_type: AssignmentReferenceTable.COURSE_MODULE,
    reference_id: 3,
    teacher_id: 3,
    is_active: true,
    is_deleted: false,
    created_at: new Date(),
    updated_at: new Date(),
    created_by: 3,
    updated_by: null,
    deleted_at: null,
    deleted_by: null,
    created_ip: '14.1.1.9',
    updated_ip: '14.1.2.0',
  },
];

export default assignmentMappings;
