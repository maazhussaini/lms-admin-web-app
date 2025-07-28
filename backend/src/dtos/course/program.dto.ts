/**
 * @file dtos/course/program.dto.ts
 * @description Data Transfer Objects for Program operations with validation rules.
 */

import { body } from 'express-validator';
import { Program } from '@shared/types/course.types';
import { BaseFilterDto } from '@/utils/service.types';

/**
 * DTO for filtering programs in list operations
 */
export interface ProgramFilterDto extends BaseFilterDto {
  programName?: string;
  isActive?: boolean;
  dateRange?: {
    startDate?: string;
    endDate?: string;
    field?: 'createdAt' | 'updatedAt';
  };
  createdAtRange?: {
    from?: string;
    to?: string;
  };
  updatedAtRange?: {
    from?: string;
    to?: string;
  };
}

/**
 * DTO for creating a new academic program
 */
export class CreateProgramDto {
  /**
   * Program name - required, must be a non-empty string
   */
  program_name!: string;

  /**
   * Static validation method for express-validator middleware
   */
  static validate() {
    return [
      body('program_name')
        .isString()
        .withMessage('Program name is required')
        .notEmpty()
        .withMessage('Program name cannot be empty')
        .trim()
        .isLength({ min: 3, max: 255 })
        .withMessage('Program name must be between 3 and 255 characters')
    ];
  }
}

/**
 * DTO for updating an existing academic program
 */
export class UpdateProgramDto {
  /**
   * Program name - optional for updates
   */
  program_name?: string;

  /**
   * Is program active - optional boolean
   */
  is_active?: boolean;

  /**
   * Static validation method for express-validator middleware
   */
  static validate() {
    return [
      body('program_name')
        .optional()
        .isString()
        .withMessage('Program name must be a string')
        .notEmpty()
        .withMessage('Program name cannot be empty')
        .trim()
        .isLength({ min: 3, max: 255 })
        .withMessage('Program name must be between 3 and 255 characters'),
      body('is_active')
        .optional()
        .isBoolean()
        .withMessage('Active status must be a boolean')
    ];
  }
}

/**
 * Type for program response to client - matches Program interface 
 * without exposing internal system fields
 */
export type ProgramResponseDto = Pick<
  Program,
  'program_id' | 'program_name' | 'created_at' | 'updated_at'
> & {
  is_active: boolean;
};
