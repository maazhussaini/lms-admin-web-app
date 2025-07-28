// import { Specialization } from '@shared/types/course.types';
import { body } from 'express-validator';
import { BaseFilterDto } from '@/utils/service.types';

/**
 * Filter DTO for specialization queries extending BaseFilterDto
 */
export interface SpecializationFilterDto extends BaseFilterDto {
  search?: string;
  program_id?: number;
  is_active?: boolean;
  dateRange?: {
    start?: string;
    end?: string;
  };
  createdAtRange?: {
    start?: string;
    end?: string;
  };
  updatedAtRange?: {
    start?: string;
    end?: string;
  };
}

/**
 * Response DTO for specialization data
 */
export interface SpecializationResponseDto {
  specialization_id: number;
  specialization_name: string;
  specialization_description?: string;
  specialization_code?: string;
  specialization_thumbnail_url?: string;
  tenant_id: number;
  is_active: boolean;
  is_deleted: boolean;
  created_at: Date;
  updated_at: Date;
  created_by: number;
  updated_by: number;
  deleted_at?: Date;
  deleted_by?: number;
  created_ip?: string;
  updated_ip?: string;
}

/**
 * DTO for creating a specialization
 */
export class CreateSpecializationDto {
  programId!: number; // Must exist within tenant
  specializationName!: string;
  specializationDescription?: string;
  specializationCode?: string;
}

/**
 * DTO for updating a specialization
 */
export class UpdateSpecializationDto {
  specializationName?: string;
  specializationDescription?: string;
  specializationCode?: string;
}

// Validation chains for express-validator
export const createSpecializationValidation = [
  body('programId')
    .isInt({ min: 1 })
    .withMessage('programId must be a positive integer'),
  body('specializationName')
    .isString()
    .trim()
    .isLength({ min: 2, max: 255 })
    .withMessage('specializationName must be 2-255 characters'),
  body('specializationDescription')
    .optional()
    .isString()
    .isLength({ max: 1000 })
    .withMessage('specializationDescription max 1000 chars'),
  body('specializationCode')
    .optional()
    .isString()
    .isLength({ max: 50 })
    .withMessage('specializationCode max 50 chars'),
];

export const updateSpecializationValidation = [
  body('specializationName')
    .optional()
    .isString()
    .trim()
    .isLength({ min: 2, max: 255 })
    .withMessage('specializationName must be 2-255 characters'),
  body('specializationDescription')
    .optional()
    .isString()
    .isLength({ max: 1000 })
    .withMessage('specializationDescription max 1000 chars'),
  body('specializationCode')
    .optional()
    .isString()
    .isLength({ max: 50 })
    .withMessage('specializationCode max 50 chars'),
];
