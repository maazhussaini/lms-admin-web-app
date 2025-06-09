import { MultiTenantAuditFields } from './base.types';

/**
 * Tenant status enumeration
 * @description Defines the operational status of a tenant in the system
 */
export enum TenantStatus {
  ACTIVE = 'ACTIVE',
  SUSPENDED = 'SUSPENDED',
  TRIAL = 'TRIAL',
  EXPIRED = 'EXPIRED',
  CANCELLED = 'CANCELLED',
}

/**
 * Client status enumeration
 * @description Defines the operational status of a client
 */
export enum ClientStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED',
  TERMINATED = 'TERMINATED',
}

/**
 * Contact type enumeration
 * @description Categorizes different types of contact information
 */
export enum ContactType {
  PRIMARY = 'PRIMARY',
  SECONDARY = 'SECONDARY',
  EMERGENCY = 'EMERGENCY',
  BILLING = 'BILLING',
}

/**
 * Represents a client entity
 * @description Core client information with tenant isolation
 */
export interface Client extends MultiTenantAuditFields {
  client_id: number;
  full_name: string;
  email_address: string;
  dial_code?: string | null;
  phone_number?: string | null;
  address?: string | null;
  client_status: ClientStatus;
  // Note: tenant_id is inherited from MultiTenantAuditFields
}

/**
 * Represents a tenant entity
 * @description Multi-tenant root entity for system isolation
 */
export interface Tenant extends MultiTenantAuditFields {
  tenant_id: number;
  tenant_name: string;
  logo_url_light?: string | null;
  logo_url_dark?: string | null;
  favicon_url?: string | null;
  theme?: Record<string, any> | null;
  tenant_status: TenantStatus;
  // Note: tenant_id is inherited but represents self-reference for audit purposes
}

/**
 * Represents a tenant phone number
 * @description Contact phone numbers associated with a tenant
 */
export interface TenantPhoneNumber extends MultiTenantAuditFields {
  tenant_phone_number_id: number;
  // tenant_id inherited from MultiTenantAuditFields - references owning tenant
  dial_code: string;
  phone_number: string;
  iso_country_code?: string | null;
  is_primary: boolean;
  contact_type: ContactType;
}

/**
 * Represents a tenant email address
 * @description Contact email addresses associated with a tenant
 */
export interface TenantEmailAddress extends MultiTenantAuditFields {
  tenant_email_address_id: number;
  // tenant_id inherited from MultiTenantAuditFields - references owning tenant
  email_address: string;
  is_primary: boolean;
  contact_type: ContactType;
}

/**
 * Represents a client-tenant association
 * @description Many-to-many relationship between clients and tenants
 */
export interface ClientTenant extends MultiTenantAuditFields {
  client_tenant_id: number;
  client_id: number; // Foreign key to Client
  // Note: tenant_id is inherited from MultiTenantAuditFields and also serves as FK reference
}

// Type guards for runtime type checking
export const isTenantStatus = (value: any): value is TenantStatus => 
  Object.values(TenantStatus).includes(value);

export const isClientStatus = (value: any): value is ClientStatus => 
  Object.values(ClientStatus).includes(value);

export const isContactType = (value: any): value is ContactType => 
  Object.values(ContactType).includes(value);