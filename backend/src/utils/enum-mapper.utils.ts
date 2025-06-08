/**
 * @file Enum Mapper Utilities
 * @description Utilities for mapping between shared types and Prisma generated types
 */

import { 
  SystemUserStatus as PrismaSystemUserStatus,
  TenantStatus as PrismaTenantStatus,
  ClientStatus as PrismaClientStatus,
  ContactType as PrismaContactType,
  Tenant as PrismaTenant,
  Client as PrismaClient,
  SystemUser as PrismaSystemUser
} from '@prisma/client';
import { TenantStatus, ClientStatus, ContactType, Tenant, Client } from '@shared/types/tenant.types';
import { SystemUser } from '@shared/types/system-users.types';

/**
 * System user status enumeration (shared)
 * @description Operational status of system users
 */
export enum SystemUserStatus {
  ACTIVE = 1,
  INACTIVE = 2,
  SUSPENDED = 3,
  LOCKED = 4
}

/**
 * Tenant status enumeration (shared)
 * @description Operational status of tenants
 */
export enum TenantStatusEnum {
  ACTIVE = 1,
  SUSPENDED = 2,
  TRIAL = 3,
  EXPIRED = 4,
  CANCELLED = 5
}

/**
 * Client status enumeration (shared)
 * @description Operational status of clients
 */
export enum ClientStatusEnum {
  ACTIVE = 1,
  INACTIVE = 2,
  SUSPENDED = 3,
  TERMINATED = 4
}

/**
 * Contact type enumeration (shared)
 * @description Contact type classification
 */
export enum ContactTypeEnum {
  PRIMARY = 1,
  SECONDARY = 2,
  EMERGENCY = 3,
  BILLING = 4
}

/**
 * Convert shared SystemUserStatus enum to Prisma enum
 * @param status - Shared system user status
 * @returns Prisma system user status
 */
export function toPrismaSystemUserStatus(status: SystemUserStatus): PrismaSystemUserStatus {
  switch (status) {
    case SystemUserStatus.ACTIVE:
      return PrismaSystemUserStatus.ACTIVE;
    case SystemUserStatus.INACTIVE:
      return PrismaSystemUserStatus.INACTIVE;
    case SystemUserStatus.SUSPENDED:
      return PrismaSystemUserStatus.SUSPENDED;
    case SystemUserStatus.LOCKED:
      return PrismaSystemUserStatus.LOCKED;
    default:
      return PrismaSystemUserStatus.ACTIVE;
  }
}

/**
 * Convert Prisma SystemUserStatus enum to shared enum
 * @param prismaStatus - Prisma system user status
 * @returns Shared system user status
 */
export function fromPrismaSystemUserStatus(prismaStatus: PrismaSystemUserStatus): SystemUserStatus {
  switch (prismaStatus) {
    case PrismaSystemUserStatus.ACTIVE:
      return SystemUserStatus.ACTIVE;
    case PrismaSystemUserStatus.INACTIVE:
      return SystemUserStatus.INACTIVE;
    case PrismaSystemUserStatus.SUSPENDED:
      return SystemUserStatus.SUSPENDED;
    case PrismaSystemUserStatus.LOCKED:
      return SystemUserStatus.LOCKED;
    default:
      return SystemUserStatus.ACTIVE;
  }
}

/**
 * Convert shared TenantStatus enum to Prisma enum
 * @param status - Shared tenant status
 * @returns Prisma tenant status
 */
export function toPrismaTenantStatus(status: TenantStatus): PrismaTenantStatus {
  switch (status) {
    case TenantStatus.ACTIVE:
      return PrismaTenantStatus.ACTIVE;
    case TenantStatus.SUSPENDED:
      return PrismaTenantStatus.SUSPENDED;
    case TenantStatus.TRIAL:
      return PrismaTenantStatus.TRIAL;
    case TenantStatus.EXPIRED:
      return PrismaTenantStatus.EXPIRED;
    case TenantStatus.CANCELLED:
      return PrismaTenantStatus.CANCELLED;
    default:
      return PrismaTenantStatus.ACTIVE;
  }
}

/**
 * Convert Prisma TenantStatus enum to shared enum
 * @param prismaStatus - Prisma tenant status
 * @returns Shared tenant status
 */
export function fromPrismaTenantStatus(prismaStatus: PrismaTenantStatus): TenantStatus {
  switch (prismaStatus) {
    case PrismaTenantStatus.ACTIVE:
      return TenantStatus.ACTIVE;
    case PrismaTenantStatus.SUSPENDED:
      return TenantStatus.SUSPENDED;
    case PrismaTenantStatus.TRIAL:
      return TenantStatus.TRIAL;
    case PrismaTenantStatus.EXPIRED:
      return TenantStatus.EXPIRED;
    case PrismaTenantStatus.CANCELLED:
      return TenantStatus.CANCELLED;
    default:
      return TenantStatus.ACTIVE;
  }
}

/**
 * Convert shared ClientStatus enum to Prisma enum
 * @param status - Shared client status
 * @returns Prisma client status
 */
export function toPrismaClientStatus(status: ClientStatus): PrismaClientStatus {
  switch (status) {
    case ClientStatus.ACTIVE:
      return PrismaClientStatus.ACTIVE;
    case ClientStatus.INACTIVE:
      return PrismaClientStatus.INACTIVE;
    case ClientStatus.SUSPENDED:
      return PrismaClientStatus.SUSPENDED;
    case ClientStatus.TERMINATED:
      return PrismaClientStatus.TERMINATED;
    default:
      return PrismaClientStatus.ACTIVE;
  }
}

/**
 * Convert Prisma ClientStatus enum to shared enum
 * @param prismaStatus - Prisma client status
 * @returns Shared client status
 */
export function fromPrismaClientStatus(prismaStatus: PrismaClientStatus): ClientStatus {
  switch (prismaStatus) {
    case PrismaClientStatus.ACTIVE:
      return ClientStatus.ACTIVE;
    case PrismaClientStatus.INACTIVE:
      return ClientStatus.INACTIVE;
    case PrismaClientStatus.SUSPENDED:
      return ClientStatus.SUSPENDED;
    case PrismaClientStatus.TERMINATED:
      return ClientStatus.TERMINATED;
    default:
      return ClientStatus.ACTIVE;
  }
}

/**
 * Convert shared ContactType enum to Prisma enum
 * @param type - Shared contact type
 * @returns Prisma contact type
 */
export function toPrismaContactType(type: ContactType): PrismaContactType {
  switch (type) {
    case ContactType.PRIMARY:
      return PrismaContactType.PRIMARY;
    case ContactType.SECONDARY:
      return PrismaContactType.SECONDARY;
    case ContactType.EMERGENCY:
      return PrismaContactType.EMERGENCY;
    case ContactType.BILLING:
      return PrismaContactType.BILLING;
    default:
      return PrismaContactType.PRIMARY;
  }
}

/**
 * Convert Prisma ContactType enum to shared enum
 * @param prismaType - Prisma contact type
 * @returns Shared contact type
 */
export function fromPrismaContactType(prismaType: PrismaContactType): ContactType {
  switch (prismaType) {
    case PrismaContactType.PRIMARY:
      return ContactType.PRIMARY;
    case PrismaContactType.SECONDARY:
      return ContactType.SECONDARY;
    case PrismaContactType.EMERGENCY:
      return ContactType.EMERGENCY;
    case PrismaContactType.BILLING:
      return ContactType.BILLING;
    default:
      return ContactType.PRIMARY;
  }
}

/**
 * Convert Prisma Tenant to shared Tenant type
 * @param prismaTenant - Prisma tenant entity
 * @returns Shared tenant type
 */
export function fromPrismaTenant(prismaTenant: PrismaTenant): Tenant {
  return {
    tenant_id: prismaTenant.tenant_id,
    tenant_name: prismaTenant.tenant_name,
    logo_url_light: prismaTenant.logo_url_light,
    logo_url_dark: prismaTenant.logo_url_dark,
    favicon_url: prismaTenant.favicon_url,
    theme: prismaTenant.theme as Record<string, any> | null,
    tenant_status: fromPrismaTenantStatus(prismaTenant.tenant_status),
    
    // Audit fields - handle nullable to non-nullable conversion
    is_active: prismaTenant.is_active,
    is_deleted: prismaTenant.is_deleted,
    created_at: prismaTenant.created_at,
    created_by: prismaTenant.created_by ?? 0, // Default to 0 if null (system-created)
    created_ip: prismaTenant.created_ip ?? '',
    updated_at: prismaTenant.updated_at,
    updated_by: prismaTenant.updated_by,
    updated_ip: prismaTenant.updated_ip
  };
}

/**
 * Convert Prisma Client to shared Client type
 * @param prismaClient - Prisma client entity
 * @returns Shared client type
 */
export function fromPrismaClient(prismaClient: PrismaClient): Client {
  return {
    client_id: prismaClient.client_id,
    full_name: prismaClient.full_name,
    email_address: prismaClient.email_address,
    dial_code: prismaClient.dial_code,
    phone_number: prismaClient.phone_number,
    address: prismaClient.address,
    client_status: fromPrismaClientStatus(prismaClient.client_status),
    
    // Audit fields - handle nullable to non-nullable conversion
    tenant_id: prismaClient.tenant_id,
    is_active: prismaClient.is_active,
    is_deleted: prismaClient.is_deleted,
    created_at: prismaClient.created_at,
    created_by: prismaClient.created_by ?? 0, // Default to 0 if null (system-created)
    created_ip: prismaClient.created_ip ?? '',
    updated_at: prismaClient.updated_at,
    updated_by: prismaClient.updated_by,
    updated_ip: prismaClient.updated_ip
  };
}

/**
 * Convert Prisma SystemUser to shared SystemUser type
 * @param prismaSystemUser - Prisma system user entity
 * @returns Shared system user type
 */
export function fromPrismaSystemUser(prismaSystemUser: PrismaSystemUser): SystemUser {
  return {
    system_user_id: prismaSystemUser.system_user_id,
    tenant_id: prismaSystemUser.tenant_id,
    role_id: prismaSystemUser.role_id,
    username: prismaSystemUser.username,
    full_name: prismaSystemUser.full_name,
    email_address: prismaSystemUser.email_address,
    password_hash: prismaSystemUser.password_hash,
    last_login_at: prismaSystemUser.last_login_at,
    login_attempts: prismaSystemUser.login_attempts,
    system_user_status: fromPrismaSystemUserStatus(prismaSystemUser.system_user_status),
    
    // Audit fields - handle nullable to non-nullable conversion
    is_active: prismaSystemUser.is_active,
    is_deleted: prismaSystemUser.is_deleted,
    created_at: prismaSystemUser.created_at,
    created_by: prismaSystemUser.created_by ?? 0, // Default to 0 if null (system-created)
    created_ip: prismaSystemUser.created_ip ?? '',
    updated_at: prismaSystemUser.updated_at,
    updated_by: prismaSystemUser.updated_by,
    updated_ip: prismaSystemUser.updated_ip
  };
}

/**
 * Generic enum mapper creator for future use
 * @param mappings - Object mapping shared enum values to Prisma enum values
 * @returns Mapper functions for bidirectional conversion
 */
export function createEnumMapper<TShared, TPrisma>(
  mappings: Record<TShared extends string | number ? TShared : never, TPrisma>
) {
  const reverseMappings = Object.fromEntries(
    Object.entries(mappings).map(([key, value]) => [value, key])
  ) as Record<TPrisma extends string | number ? TPrisma : never, TShared>;

  return {
    toPrisma: (sharedValue: TShared): TPrisma => mappings[sharedValue as TShared extends string | number ? TShared : never],
    fromPrisma: (prismaValue: TPrisma): TShared => reverseMappings[prismaValue as TPrisma extends string | number ? TPrisma : never]
  };
}
