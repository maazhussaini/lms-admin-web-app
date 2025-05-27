export interface BaseAuditFields {
  is_active: boolean;
  is_deleted: boolean;
  created_at: Date | string;
  created_by: number; // User ID who created the record
  created_ip: string;
  updated_at?: Date | string | null;
  updated_by?: number | null; // User ID who updated the record
  updated_ip?: string | null;
}

/**
 * Multi-tenant audit fields - extends base audit with tenant isolation
 */
export interface MultiTenantAuditFields extends BaseAuditFields {
  tenant_id: number; // For multi-tenant isolation
}

/**
 * Extended audit fields for entities that need additional audit information
 */
export interface ExtendedAuditFields extends MultiTenantAuditFields {
  last_login_at?: Date | string | null;
  last_modified_by?: number | null;
  version?: number | null; // For optimistic locking
}

/**
 * Minimal audit fields for lookup tables and simple entities
 */
export interface MinimalAuditFields {
  is_active: boolean;
  created_at: Date | string;
  created_by: number;
  updated_at?: Date | string | null;
  updated_by?: number | null;
}