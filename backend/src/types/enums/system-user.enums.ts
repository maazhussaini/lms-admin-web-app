/**
 * System user role enumeration
 * @description Defines system-level roles with proper hierarchy
 */
export enum SystemUserRole {
  SUPER_ADMIN,
  TENANT_ADMIN,
}

/**
 * System user status enumeration
 * @description Operational status of system users
 */
export enum SystemUserStatus {
  ACTIVE,
  INACTIVE,
  SUSPENDED,
  LOCKED,
}