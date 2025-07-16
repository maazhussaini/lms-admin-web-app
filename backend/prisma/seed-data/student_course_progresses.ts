// Seed data for student course progresses
export const student_course_progresses = [
  {
    tenant_id: 1,
    student_id: 1,
    course_id: 1,
    overall_progress_percentage: 100,
    modules_completed: 5,
    videos_completed: 10,
    quizzes_completed: 2,
    assignments_completed: 3,
    total_time_spent_minutes: 1200,
    last_accessed_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
    is_course_completed: true,
    completion_date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
    is_active: true,
    is_deleted: false,
    created_at: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000), // 60 days ago
    created_by: 1,
    created_ip: '10.52.1.1',
    updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
    updated_by: 1,
    updated_ip: '10.52.1.2',
    deleted_at: null,
    deleted_by: null,
  },
  {
    tenant_id: 1,
    student_id: 2,
    course_id: 2,
    overall_progress_percentage: 100,
    modules_completed: 4,
    videos_completed: 8,
    quizzes_completed: 1,
    assignments_completed: 2,
    total_time_spent_minutes: 900,
    last_accessed_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
    is_course_completed: true,
    completion_date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
    is_active: true,
    is_deleted: false,
    created_at: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000), // 120 days ago
    created_by: 2,
    created_ip: '10.52.1.3',
    updated_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
    updated_by: 2,
    updated_ip: '10.52.1.4',
    deleted_at: null,
    deleted_by: null,
  },
  {
    tenant_id: 1,
    student_id: 3,
    course_id: 3,
    overall_progress_percentage: 20,
    modules_completed: 1,
    videos_completed: 2,
    quizzes_completed: 0,
    assignments_completed: 0,
    total_time_spent_minutes: 120,
    last_accessed_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    is_course_completed: false,
    completion_date: null,
    is_active: true,
    is_deleted: false,
    created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
    created_by: 3,
    created_ip: '10.52.1.5',
    updated_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    updated_by: 3,
    updated_ip: '10.52.1.6',
    deleted_at: null,
    deleted_by: null,
  },
  {
    tenant_id: 1,
    student_id: 4,
    course_id: 4,
    overall_progress_percentage: 60,
    modules_completed: 2,
    videos_completed: 5,
    quizzes_completed: 1,
    assignments_completed: 1,
    total_time_spent_minutes: 400,
    last_accessed_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
    is_course_completed: false,
    completion_date: null,
    is_active: true,
    is_deleted: false,
    created_at: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000), // 20 days ago
    created_by: 4,
    created_ip: '10.52.1.7',
    updated_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
    updated_by: 4,
    updated_ip: '10.52.1.8',
    deleted_at: null,
    deleted_by: null,
  },
  {
    tenant_id: 1,
    student_id: 5,
    course_id: 5,
    overall_progress_percentage: 0,
    modules_completed: 0,
    videos_completed: 0,
    quizzes_completed: 0,
    assignments_completed: 0,
    total_time_spent_minutes: 0,
    last_accessed_at: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000), // 60 days ago
    is_course_completed: false,
    completion_date: null,
    is_active: true,
    is_deleted: false,
    created_at: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000), // 90 days ago
    created_by: 5,
    created_ip: '10.52.1.9',
    updated_at: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000), // 60 days ago
    updated_by: 5,
    updated_ip: '10.52.2.0',
    deleted_at: null,
    deleted_by: null,
  },
];
