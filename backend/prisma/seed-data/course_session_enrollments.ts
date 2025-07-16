import { SessionEnrollmentStatus } from '@prisma/client';
// Seed data for course session enrollments
export const course_session_enrollments = [
  {
    tenant_id: 1,
    course_session_id: 1,
    student_id: 1,
    enrolled_at: new Date(Date.now() - 95 * 24 * 60 * 60 * 1000), // 95 days ago
    dropped_at: null,
    enrollment_status: SessionEnrollmentStatus.ENROLLED,
    completion_percentage: 100,
    final_grade: 95,
    completion_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
    is_active: true,
    is_deleted: false,
    created_at: new Date(Date.now() - 95 * 24 * 60 * 60 * 1000), // 95 days ago
    created_by: 1,
    created_ip: '10.61.1.1',
    updated_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
    updated_by: 1,
    updated_ip: '10.61.1.2',
    deleted_at: null,
    deleted_by: null,
  },
  {
    tenant_id: 1,
    course_session_id: 2,
    student_id: 2,
    enrolled_at: new Date(Date.now() - 185 * 24 * 60 * 60 * 1000), // 185 days ago
    dropped_at: null,
    enrollment_status: SessionEnrollmentStatus.COMPLETED,
    completion_percentage: 100,
    final_grade: 88,
    completion_date: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000), // 120 days ago
    is_active: true,
    is_deleted: false,
    created_at: new Date(Date.now() - 185 * 24 * 60 * 60 * 1000), // 185 days ago
    created_by: 2,
    created_ip: '10.61.1.3',
    updated_at: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000), // 120 days ago
    updated_by: 2,
    updated_ip: '10.61.1.4',
    deleted_at: null,
    deleted_by: null,
  },
  {
    tenant_id: 1,
    course_session_id: 3,
    student_id: 3,
    enrolled_at: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
    dropped_at: null,
    enrollment_status: SessionEnrollmentStatus.PENDING,
    completion_percentage: 0,
    final_grade: null,
    completion_date: null,
    is_active: true,
    is_deleted: false,
    created_at: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
    created_by: 3,
    created_ip: '10.61.1.5',
    updated_at: null,
    updated_by: null,
    updated_ip: null,
    deleted_at: null,
    deleted_by: null,
  },
  {
    tenant_id: 1,
    course_session_id: 4,
    student_id: 4,
    enrolled_at: new Date(Date.now() - 65 * 24 * 60 * 60 * 1000), // 65 days ago
    dropped_at: null,
    enrollment_status: SessionEnrollmentStatus.ENROLLED,
    completion_percentage: 60,
    final_grade: null,
    completion_date: null,
    is_active: true,
    is_deleted: false,
    created_at: new Date(Date.now() - 65 * 24 * 60 * 60 * 1000), // 65 days ago
    created_by: 4,
    created_ip: '10.61.1.6',
    updated_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    updated_by: 4,
    updated_ip: '10.61.1.7',
    deleted_at: null,
    deleted_by: null,
  },
  {
    tenant_id: 1,
    course_session_id: 5,
    student_id: 5,
    enrolled_at: new Date(Date.now() - 305 * 24 * 60 * 60 * 1000), // 305 days ago
    dropped_at: new Date(Date.now() - 260 * 24 * 60 * 60 * 1000), // 260 days ago
    enrollment_status: SessionEnrollmentStatus.DROPPED,
    completion_percentage: 0,
    final_grade: null,
    completion_date: null,
    is_active: false,
    is_deleted: true,
    created_at: new Date(Date.now() - 305 * 24 * 60 * 60 * 1000), // 305 days ago
    created_by: 5,
    created_ip: '10.61.1.8',
    updated_at: new Date(Date.now() - 260 * 24 * 60 * 60 * 1000), // 260 days ago
    updated_by: 5,
    updated_ip: '10.61.1.9',
    deleted_at: null,
    deleted_by: null,
  },
];
