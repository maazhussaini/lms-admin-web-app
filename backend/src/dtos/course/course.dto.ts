import { body } from 'express-validator';

export interface CreateCourseDto {
  tenant_id?: number;
  course_name: string;
  course_description?: string;
  main_thumbnail_url?: string;
  course_status?: string;
  course_type?: string;
  course_price?: number;
  course_total_hours?: number;
}

export interface UpdateCourseDto {
  course_name?: string;
  course_description?: string;
  main_thumbnail_url?: string;
  course_status?: string;
  course_type?: string;
  course_price?: number;
  course_total_hours?: number;
}

export const createCourseValidation = [
  body('course_name')
    .exists()
    .withMessage('Course name is required')
    .isString()
    .withMessage('Course name must be a string')
    .isLength({ min: 2, max: 255 })
    .withMessage('Course name must be between 2 and 255 characters'),
  body('course_description')
    .optional()
    .isString()
    .withMessage('Course description must be a string'),
  body('main_thumbnail_url')
    .optional()
    .isString()
    .withMessage('Main thumbnail URL must be a string'),
  body('course_status')
    .optional()
    .isString()
    .isIn(['DRAFT', 'PUBLISHED', 'ARCHIVED'])
    .withMessage('Invalid course status'),
  body('course_type')
    .optional()
    .isString()
    .isIn(['PAID', 'FREE'])
    .withMessage('Invalid course type'),
  body('course_price')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Course price must be a positive number'),
  body('course_total_hours')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Course total hours must be a positive number'),
];

export const updateCourseValidation = [
  body('course_name')
    .optional()
    .isString()
    .isLength({ min: 2, max: 255 })
    .withMessage('Course name must be between 2 and 255 characters'),
  body('course_description')
    .optional()
    .isString()
    .withMessage('Course description must be a string'),
  body('main_thumbnail_url')
    .optional()
    .isString()
    .withMessage('Main thumbnail URL must be a string'),
  body('course_status')
    .optional()
    .isString()
    .isIn(['DRAFT', 'PUBLISHED', 'ARCHIVED'])
    .withMessage('Invalid course status'),
  body('course_type')
    .optional()
    .isString()
    .isIn(['PAID', 'FREE'])
    .withMessage('Invalid course type'),
  body('course_price')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Course price must be a positive number'),
  body('course_total_hours')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Course total hours must be a positive number'),
];
