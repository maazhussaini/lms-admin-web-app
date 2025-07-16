import { UserType } from '@prisma/client';
// Seed data for roles
export const roles = [
  {
    role_type: UserType.STUDENT,
    role_name: 'Basic Student',
    role_description: 'Default role for enrolled students',
    is_system_role: false,
    is_active: true,
    is_deleted: false,
    created_at: new Date(),
    updated_at: new Date(),
    created_by: 1,
    updated_by: 2,
    deleted_at: null,
    deleted_by: null,
    created_ip: '192.168.10.1',
    updated_ip: '192.168.10.2'
  },
  {
    role_type: UserType.TEACHER,
    role_name: 'Standard Teacher',
    role_description: 'Teacher with access to course content and student grades',
    is_system_role: false,
    is_active: true,
    is_deleted: false,
    created_at: new Date(),
    updated_at: new Date(),
    created_by: 2,
    updated_by: 1,
    deleted_at: null,
    deleted_by: null,
    created_ip: '192.168.10.5',
    updated_ip: '192.168.10.6'
  },
  {
    role_type: UserType.TENANT_ADMIN,
    role_name: 'Tenant Admin',
    role_description: 'Manages tenant settings and users',
    is_system_role: true,
    is_active: true,
    is_deleted: false,
    created_at: new Date(),
    updated_at: new Date(),
    created_by: 3,
    updated_by: null,
    deleted_at: null,
    deleted_by: null,
    created_ip: '192.168.10.9',
    updated_ip: '192.168.11.0'
  },
  {
    role_type: UserType.SUPER_ADMIN,
    role_name: 'Platform Super Admin',
    role_description: 'Has full system-wide permissions',
    is_system_role: true,
    is_active: true,
    is_deleted: false,
    created_at: new Date(),
    updated_at: new Date(),
    created_by: 4,
    updated_by: null,
    deleted_at: null,
    deleted_by: null,
    created_ip: '192.168.11.3',
    updated_ip: '192.168.11.4'
  }
];
