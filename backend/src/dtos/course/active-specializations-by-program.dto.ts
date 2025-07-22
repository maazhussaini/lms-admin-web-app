import { query } from 'express-validator';

export interface GetActiveSpecializationsByProgramDto {
  program_id?: number;
  tenant_id?: number;
}

export interface ActiveSpecializationsByProgramResponse {
  specialization_id: number;
  program_id: number;
  specialization_name: string;
  specialization_thumbnail_url: string | null;
}

export const getActiveSpecializationsByProgramValidation = [
  query('program_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Program ID must be a positive integer')
    .toInt(),
  query('tenant_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Tenant ID must be a positive integer')
    .toInt()
];
