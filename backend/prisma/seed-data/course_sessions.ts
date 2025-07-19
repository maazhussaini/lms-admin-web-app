import { CourseSessionStatus } from "@prisma/client";
// Seed data for course sessions
export const course_sessions = [
  {
    tenant_id: 1,
    teacher_id: 1,
    course_id: 1,
    course_session_status: CourseSessionStatus.PUBLIC,
    session_name: 'Spring 2025 - Python Basics',
    session_description: 'Introductory Python programming session for Spring 2025.',
    start_date: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000), // 90 days ago
    end_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
    max_students: 30,
    enrollment_deadline: new Date(Date.now() - 100 * 24 * 60 * 60 * 1000), // 100 days ago
    session_timezone: 'America/Los_Angeles',
    session_code: 'PY-SPR25',
    auto_expire_enabled: true,
    is_active: true,
    is_deleted: false,
    created_at: new Date(Date.now() - 100 * 24 * 60 * 60 * 1000), // 100 days ago
    created_by: 1,
    created_ip: '10.60.1.1',
    updated_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
    updated_by: 1,
    updated_ip: '10.60.1.2',
    deleted_at: null,
    deleted_by: null,
  },
  {
    tenant_id: 1,
    teacher_id: 2,
    course_id: 2,
    course_session_status: CourseSessionStatus.EXPIRED,
    session_name: 'Winter 2025 - Digital Marketing',
    session_description: 'Digital marketing session for Winter 2025.',
    start_date: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000), // 180 days ago
    end_date: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000), // 120 days ago
    max_students: 25,
    enrollment_deadline: new Date(Date.now() - 190 * 24 * 60 * 60 * 1000), // 190 days ago
    session_timezone: 'Europe/London',
    session_code: 'MK-WIN25',
    auto_expire_enabled: true,
    is_active: true,
    is_deleted: false,
    created_at: new Date(Date.now() - 190 * 24 * 60 * 60 * 1000), // 190 days ago
    created_by: 2,
    created_ip: '10.60.1.3',
    updated_at: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000), // 120 days ago
    updated_by: 2,
    updated_ip: '10.60.1.4',
    deleted_at: null,
    deleted_by: null,
  },
  {
    tenant_id: 1,
    teacher_id: 3,
    course_id: 3,
    course_session_status: CourseSessionStatus.DRAFT,
    session_name: 'Summer 2025 - Solar Energy',
    session_description: 'Solar energy systems session for Summer 2025.',
    start_date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 days from now
    end_date: new Date(Date.now() + 70 * 24 * 60 * 60 * 1000), // 70 days from now
    max_students: 20,
    enrollment_deadline: new Date(),
    session_timezone: 'Europe/Berlin',
    session_code: 'EN-SUM25',
    auto_expire_enabled: true,
    is_active: true,
    is_deleted: false,
    created_at: new Date(),
    created_by: 3,
    created_ip: '10.60.1.5',
    updated_at: null,
    updated_by: null,
    updated_ip: null,
    deleted_at: null,
    deleted_by: null,
  },
  {
    tenant_id: 1,
    teacher_id: 4,
    course_id: 4,
    course_session_status: CourseSessionStatus.PUBLIC,
    session_name: 'Spring 2025 - Data Science',
    session_description: 'Data science session for Spring 2025.',
    start_date: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000), // 60 days ago
    end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    max_students: 35,
    enrollment_deadline: new Date(Date.now() - 70 * 24 * 60 * 60 * 1000), // 70 days ago
    session_timezone: 'Asia/Kolkata',
    session_code: 'DS-SPR25',
    auto_expire_enabled: true,
    is_active: true,
    is_deleted: false,
    created_at: new Date(Date.now() - 70 * 24 * 60 * 60 * 1000), // 70 days ago
    created_by: 4,
    created_ip: '10.60.1.6',
    updated_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    updated_by: 4,
    updated_ip: '10.60.1.7',
    deleted_at: null,
    deleted_by: null,
  },
  {
    tenant_id: 1,
    teacher_id: 5,
    course_id: 5,
    course_session_status: CourseSessionStatus.EXPIRED,
    session_name: 'Fall 2024 - Clinical Psychology',
    session_description: 'Clinical psychology session for Fall 2024.',
    start_date: new Date(Date.now() - 300 * 24 * 60 * 60 * 1000), // 300 days ago
    end_date: new Date(Date.now() - 250 * 24 * 60 * 60 * 1000), // 250 days ago
    max_students: 15,
    enrollment_deadline: new Date(Date.now() - 310 * 24 * 60 * 60 * 1000), // 310 days ago
    session_timezone: 'Australia/Sydney',
    session_code: 'PSY-FALL24',
    auto_expire_enabled: true,
    is_active: true,
    is_deleted: false,
    created_at: new Date(Date.now() - 310 * 24 * 60 * 60 * 1000), // 310 days ago
    created_by: 5,
    created_ip: '10.60.1.8',
    updated_at: new Date(Date.now() - 250 * 24 * 60 * 60 * 1000), // 250 days ago
    updated_by: 5,
    updated_ip: '10.60.1.9',
    deleted_at: null,
    deleted_by: null,
  },
];
