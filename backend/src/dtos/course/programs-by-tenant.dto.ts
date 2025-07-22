import { query } from 'express-validator';

/**
 * DTO for getting programs by tenant request
 */
export interface GetProgramsByTenantDto {
  tenant_id: number;
}

/**
 * Response DTO for programs by tenant
 */
export interface ProgramsByTenantResponse {
  program_id: number;
  program_name: string;
  program_thumbnail_url: string | null;
  tenant_id: number;
  is_active: boolean;
  is_deleted: boolean;
  created_at: Date;
  updated_at: Date;
}

/**
 * Validation rules for getting programs by tenant
 */
export const getProgramsByTenantValidation = [
  query('tenant_id')
    .isInt({ min: 0 })
    .withMessage('Tenant ID must be a non-negative integer')
    .toInt()
];
