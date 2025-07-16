// Seed data for teacher courses
export const teacher_courses = [
  {
    tenant_id: 1,
    course_id: 1,
    teacher_id: 1,
    is_active: true,
    is_deleted: false,
    created_at: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000), // 60 days ago
    created_by: 1,
    created_ip: '10.53.1.1',
    updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
    updated_by: 1,
    updated_ip: '10.53.1.2',
    deleted_at: null,
    deleted_by: null,
  },
  {
    tenant_id: 1,
    course_id: 2,
    teacher_id: 2,
    is_active: true,
    is_deleted: false,
    created_at: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000), // 120 days ago
    created_by: 2,
    created_ip: '10.53.1.3',
    updated_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
    updated_by: 2,
    updated_ip: '10.53.1.4',
    deleted_at: null,
    deleted_by: null,
  },
  {
    tenant_id: 1,
    course_id: 3,
    teacher_id: 3,
    is_active: true,
    is_deleted: false,
    created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
    created_by: 3,
    created_ip: '10.53.1.5',
    updated_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    updated_by: 3,
    updated_ip: '10.53.1.6',
    deleted_at: null,
    deleted_by: null,
  },
  {
    tenant_id: 1,
    course_id: 4,
    teacher_id: 4,
    is_active: true,
    is_deleted: false,
    created_at: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000), // 20 days ago
    created_by: 4,
    created_ip: '10.53.1.7',
    updated_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
    updated_by: 4,
    updated_ip: '10.53.1.8',
    deleted_at: null,
    deleted_by: null,
  },
  {
    tenant_id: 1,
    course_id: 5,
    teacher_id: 5,
    is_active: true,
    is_deleted: false,
    created_at: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000), // 90 days ago
    created_by: 5,
    created_ip: '10.53.1.9',
    updated_at: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000), // 60 days ago
    updated_by: 5,
    updated_ip: '10.53.2.0',
    deleted_at: null,
    deleted_by: null,
  },
];
