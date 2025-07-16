
// Seed data for video progresses
export const video_progresses = [
  {
    tenant_id: 1,
    student_id: 1,
    course_video_id: 1,
    watch_duration_seconds: 600,
    completion_percentage: 100,
    last_watched_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
    is_completed: true,
    is_active: true,
    is_deleted: false,
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
    created_by: 1,
    created_ip: '10.63.1.1',
    updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
    updated_by: 1,
    updated_ip: '10.63.1.2',
    deleted_at: null,
    deleted_by: null,
  },
  {
    tenant_id: 1,
    student_id: 2,
    course_video_id: 2,
    watch_duration_seconds: 540,
    completion_percentage: 100,
    last_watched_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
    is_completed: true,
    is_active: true,
    is_deleted: false,
    created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
    created_by: 2,
    created_ip: '10.63.1.3',
    updated_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
    updated_by: 2,
    updated_ip: '10.63.1.4',
    deleted_at: null,
    deleted_by: null,
  },
  {
    tenant_id: 1,
    student_id: 3,
    course_video_id: 3,
    watch_duration_seconds: 60,
    completion_percentage: 12,
    last_watched_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    is_completed: false,
    is_active: true,
    is_deleted: false,
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    created_by: 3,
    created_ip: '10.63.1.5',
    updated_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    updated_by: 3,
    updated_ip: '10.63.1.6',
    deleted_at: null,
    deleted_by: null,
  },
  {
    tenant_id: 1,
    student_id: 4,
    course_video_id: 5,
    watch_duration_seconds: 400,
    completion_percentage: 44,
    last_watched_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
    is_completed: false,
    is_active: true,
    is_deleted: false,
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
    created_by: 4,
    created_ip: '10.63.1.7',
    updated_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
    updated_by: 4,
    updated_ip: '10.63.1.8',
    deleted_at: null,
    deleted_by: null,
  },
  {
    tenant_id: 1,
    student_id: 5,
    course_video_id: 4,
    watch_duration_seconds: 0,
    completion_percentage: 0,
    last_watched_at: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000), // 60 days ago
    is_completed: false,
    is_active: true,
    is_deleted: false,
    created_at: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000), // 60 days ago
    created_by: 5,
    created_ip: '10.63.1.9',
    updated_at: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000), // 60 days ago
    updated_by: 5,
    updated_ip: '10.63.2.0',
    deleted_at: null,
    deleted_by: null,
  },
];
