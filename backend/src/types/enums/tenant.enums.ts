/**
 * Tenant status enumeration
 * @description Defines the operational status of a tenant in the system
 */
export enum TenantStatus {
  ACTIVE,
  SUSPENDED,
  TRIAL,
  EXPIRED,
  CANCELLED
}

/**
 * Client status enumeration
 * @description Defines the operational status of a client
 */
export enum ClientStatus {
  ACTIVE,
  INACTIVE,
  SUSPENDED,
  TERMINATED
}

/**
 * Contact type enumeration
 * @description Categorizes different types of contact information
 */
export enum ContactType {
  PRIMARY,
  SECONDARY,
  EMERGENCY,
  BILLING
}