import { body, query, ValidationChain } from 'express-validator';
import { BaseFilterDto } from '@/utils/service.types';

/**
 * DTO interface for creating a new institute
 */
export interface CreateInstituteDto {
  tenant_id?: number; // Required for SUPER_ADMIN, ignored for others
  institute_name: string;
}

/**
 * DTO interface for updating an existing institute
 */
export interface UpdateInstituteDto {
  institute_name?: string;
}

/**
 * DTO interface for filtering institutes in list operations
 */
export interface InstituteFilterDto extends BaseFilterDto {
  tenantId?: number;
}

/**
 * Response DTO for institute entities
 */
export interface InstituteResponseDto {
  institute_id: number;
  tenant_id: number;
  institute_name: string;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

/**
 * Validation chains for creating an institute
 */
export const createInstituteValidation: ValidationChain[] = [
  body('tenant_id')
    .optional()
    .isInt({ min: 1 }).withMessage('Tenant ID must be a positive integer')
    .toInt(),

  body('institute_name')
    .exists().withMessage('Institute name is required')
    .isString().withMessage('Institute name must be a string')
    .notEmpty().withMessage('Institute name cannot be empty')
    .trim()
    .isLength({ min: 2, max: 255 }).withMessage('Institute name must be between 2 and 255 characters')
];

/**
 * Validation chains for updating an institute
 */
export const updateInstituteValidation: ValidationChain[] = [
  body('institute_name')
    .optional()
    .isString().withMessage('Institute name must be a string')
    .notEmpty().withMessage('Institute name cannot be empty')
    .trim()
    .isLength({ min: 2, max: 255 }).withMessage('Institute name must be between 2 and 255 characters')
];

/**
 * Validation chains for querying institutes
 */
export const instituteQueryValidation: ValidationChain[] = [
  query('page')
    .optional()
    .isInt({ min: 1 }).withMessage('Page must be a positive integer')
    .toInt(),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100')
    .toInt(),

  query('sortBy')
    .optional()
    .isString().withMessage('Sort field must be a string')
    .trim(),

  query('sortOrder')
    .optional()
    .isIn(['asc', 'desc']).withMessage('Sort order must be asc or desc'),

  query('search')
    .optional()
    .isString().withMessage('Search term must be a string')
    .trim(),

  query('tenantId')
    .optional()
    .isInt({ min: 1 }).withMessage('Tenant ID must be a positive integer')
    .toInt()
];
