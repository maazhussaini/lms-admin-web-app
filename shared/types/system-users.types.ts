import { BaseAuditFields } from './base.types';

/**
 * System user role enumeration
 * @description Defines system-level roles with proper hierarchy
 */
export enum SystemUserRole {
  SUPERADMIN = 'SUPERADMIN',
  TENANT_ADMIN = 'TENANT_ADMIN',
}

/**
 * System user status enumeration
 * @description Operational status of system users
 */
export enum SystemUserStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED',
  LOCKED = 'LOCKED',
}

/**
 * Represents a system user with conditional tenant isolation
 * @description System user entity - SuperAdmin has no tenant, others are tenant-specific
 */
export interface SystemUser extends BaseAuditFields {
  system_user_id: number;
  tenant_id?: number | null; // NULL for SuperAdmin, required for others
  role_type: SystemUserRole;  // Changed from role_id to role_type
  username: string;
  full_name: string;
  email_address: string;
  password_hash: string;
  last_login_at?: Date | string | null;
  login_attempts?: number | null;
  system_user_status: SystemUserStatus;
}

/**
 * Represents a role in the system
 * @description Role definition for system users
 */
export interface Role extends BaseAuditFields {
  role_id: number;                    // Auto-increment primary key
  role_type: SystemUserRole;          // Business identifier (enum) - renamed from role_id
  role_name: string;
  role_description?: string | null;
  is_system_role: boolean; // True for built-in roles
}

/**
 * Represents a screen/module in the system
 * @description System screens for permission management
 */
export interface Screen extends BaseAuditFields {
  screen_id: number;
  screen_name: string;
  screen_description?: string | null;
  route_path?: string | null;
  parent_screen_id?: number | null;
  sort_order?: number | null;
  icon_class?: string | null;
}

/**
 * Represents user-specific screen permissions
 * @description Individual user permissions that override role permissions
 */
export interface UserScreen extends BaseAuditFields {
  user_screen_id: number;
  tenant_id: number;
  system_user_id: number;
  screen_id: number;
  can_view: boolean;
  can_create: boolean;
  can_edit: boolean;
  can_delete: boolean;
  can_export: boolean;
}

/**
 * Represents role-based screen permissions
 * @description Default permissions for roles
 */
export interface RoleScreen extends BaseAuditFields {
  role_screen_id: number;
  tenant_id: number;
  role_type: SystemUserRole;          // Changed from role_id to role_type
  screen_id: number;
  can_view: boolean;
  can_create: boolean;
  can_edit: boolean;
  can_delete: boolean;
  can_export: boolean;
}

// Type guards for runtime type checking
export const isSystemUserRole = (value: any): value is SystemUserRole => 
  Object.values(SystemUserRole).includes(value);

export const isSystemUserStatus = (value: any): value is SystemUserStatus => 
  Object.values(SystemUserStatus).includes(value);

/**
 * Helper function to check if a system user is SuperAdmin
 */
export const isSuperAdmin = (user: SystemUser): boolean => 
  user.tenant_id === null && user.role_type === SystemUserRole.SUPERADMIN;

/**
 * Helper function to check if a system user is tenant-specific
 */
export const isTenantUser = (user: SystemUser): boolean => 
  user.tenant_id !== null && user.role_type === SystemUserRole.TENANT_ADMIN;