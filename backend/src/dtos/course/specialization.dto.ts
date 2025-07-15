// import { Specialization } from '@shared/types/course.types';
import { body } from 'express-validator';

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
