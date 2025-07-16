import { EnrollmentStatus } from "@prisma/client";
// Seed data for enrollments
export const enrollments = [
  {
    tenant_id: 1,
    course_id: 1,
    student_id: 1,
    institute_id: 1,
    teacher_id: 1,
    enrollment_status: EnrollmentStatus.ACTIVE,
    enrolled_at: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000), // 60 days ago
    expected_completion_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    actual_completion_date: null,
    status_changed_at: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000), // 60 days ago
    status_changed_by: 1,
    status_change_reason: null,
    grade: 'A',
    final_score: 95.00,
    is_active: true,
    is_deleted: false,
    created_at: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000), // 60 days ago
    created_by: 1,
    created_ip: '10.50.1.1',
    updated_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
    updated_by: 1,
    updated_ip: '10.50.1.2',
    deleted_at: null,
    deleted_by: null,
  },
  {
    tenant_id: 1,
    course_id: 2,
    student_id: 2,
    institute_id: 2,
    teacher_id: 2,
    enrollment_status: EnrollmentStatus.COMPLETED,
    enrolled_at: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000), // 120 days ago
    expected_completion_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
    actual_completion_date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
    status_changed_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
    status_changed_by: 2,
    status_change_reason: 'Completed successfully',
    grade: 'B+',
    final_score: 88.50,
    is_active: true,
    is_deleted: false,
    created_at: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000), // 120 days ago
    created_by: 2,
    created_ip: '10.50.1.3',
    updated_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
    updated_by: 2,
    updated_ip: '10.50.1.4',
    deleted_at: null,
    deleted_by: null,
  },
  {
    tenant_id: 1,
    course_id: 3,
    student_id: 3,
    institute_id: 3,
    teacher_id: 3,
    enrollment_status: EnrollmentStatus.PENDING,
    enrolled_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
    expected_completion_date: new Date(Date.now() + 50 * 24 * 60 * 60 * 1000), // 50 days from now
    actual_completion_date: null,
    status_changed_at: null,
    status_changed_by: null,
    status_change_reason: null,
    grade: null,
    final_score: null,
    is_active: true,
    is_deleted: false,
    created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
    created_by: 3,
    created_ip: '10.50.1.5',
    updated_at: null,
    updated_by: null,
    updated_ip: null,
    deleted_at: null,
    deleted_by: null,
  },
  {
    tenant_id: 1,
    course_id: 4,
    student_id: 4,
    institute_id: 4,
    teacher_id: 4,
    enrollment_status: EnrollmentStatus.ACTIVE,
    enrolled_at: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000), // 20 days ago
    expected_completion_date: new Date(Date.now() + 40 * 24 * 60 * 60 * 1000), // 40 days from now
    actual_completion_date: null,
    status_changed_at: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000), // 20 days ago
    status_changed_by: 4,
    status_change_reason: null,
    grade: null,
    final_score: null,
    is_active: true,
    is_deleted: false,
    created_at: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000), // 20 days ago
    created_by: 4,
    created_ip: '10.50.1.6',
    updated_at: null,
    updated_by: null,
    updated_ip: null,
    deleted_at: null,
    deleted_by: null,
  },
  {
    tenant_id: 1,
    course_id: 5,
    student_id: 5,
    institute_id: 5,
    teacher_id: 5,
    enrollment_status: EnrollmentStatus.DROPPED,
    enrolled_at: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000), // 90 days ago
    expected_completion_date: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000), // 60 days ago
    actual_completion_date: new Date(Date.now() - 70 * 24 * 60 * 60 * 1000), // 70 days ago
    status_changed_at: new Date(Date.now() - 70 * 24 * 60 * 60 * 1000), // 70 days ago
    status_changed_by: 5,
    status_change_reason: 'Withdrew due to personal reasons',
    grade: null,
    final_score: null,
    is_active: true,
    is_deleted: false,
    created_at: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000), // 90 days ago
    created_by: 5,
    created_ip: '10.50.1.7',
    updated_at: new Date(Date.now() - 70 * 24 * 60 * 60 * 1000), // 70 days ago
    updated_by: 5,
    updated_ip: '10.50.1.8',
    deleted_at: null,
    deleted_by: null,
  },
];
