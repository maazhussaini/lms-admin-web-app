import { QuizAttemptStatus } from '@prisma/client';
// Seed data for quiz attempts
export const quiz_attempts = [
  {
    tenant_id: 1,
    quiz_id: 1,
    student_id: 1,
    attempt_number: 1,
    started_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    submitted_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 30 * 60 * 1000), // 2 days ago + 30 min
    score: 18.0,
    percentage: 90.0,
    status: QuizAttemptStatus.GRADED,
    time_taken_minutes: 30,
    graded_by: 1,
    graded_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
    teacher_notes: 'Excellent work!',
    is_active: true,
    is_deleted: false,
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
    created_by: 1,
    updated_by: 1,
    deleted_at: null,
    deleted_by: null,
    created_ip: '13.2.1.1',
    updated_ip: '13.2.1.2',
  },
  {
    tenant_id: 1,
    quiz_id: 2,
    student_id: 2,
    attempt_number: 1,
    started_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
    submitted_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000 + 20 * 60 * 1000), // 5 days ago + 20 min
    score: 13.0,
    percentage: 86.67,
    status: QuizAttemptStatus.GRADED,
    time_taken_minutes: 20,
    graded_by: 2,
    graded_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), // 4 days ago
    teacher_notes: 'Good understanding.',
    is_active: true,
    is_deleted: false,
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
    updated_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), // 4 days ago
    created_by: 2,
    updated_by: 2,
    deleted_at: null,
    deleted_by: null,
    created_ip: '13.2.1.3',
    updated_ip: '13.2.1.4',
  },
  {
    tenant_id: 1,
    quiz_id: 3,
    student_id: 3,
    attempt_number: 1,
    started_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
    submitted_at: null,
    score: null,
    percentage: null,
    status: QuizAttemptStatus.IN_PROGRESS,
    time_taken_minutes: 10,
    graded_by: null,
    graded_at: null,
    teacher_notes: null,
    is_active: true,
    is_deleted: false,
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
    updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
    created_by: 3,
    updated_by: null,
    deleted_at: null,
    deleted_by: null,
    created_ip: '13.2.1.5',
    updated_ip: '13.2.1.6',
  },
];
