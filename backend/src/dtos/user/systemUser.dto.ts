/**
 * @file System User DTOs for handling user creation and updates
 * @description Defines data transfer objects for system user management with validation rules
 */

import { body, ValidationChain } from 'express-validator';
import { SystemUserRole, SystemUserStatus } from '@/types/enums';

/**
 * DTO interface for creating a new system user
 */
export interface CreateSystemUserDto {
  username: string;
  fullName: string;
  email: string;
  password: string;
  role: SystemUserRole;
  tenantId?: number;
  status?: SystemUserStatus;
}

/**
 * DTO interface for updating an existing system user
 */
export interface UpdateSystemUserDto {
  fullName?: string;
  email?: string;
  role?: SystemUserRole;
  status?: SystemUserStatus;
  password?: string;
}

/**
 * DTO interface for filtering system users in list operations
 */
export interface SystemUserFilterDto {
  role?: SystemUserRole;
  status?: SystemUserStatus;
  tenantId?: number;
  search?: string;
}

/**
 * Validation chains for creating a system user
 */
export const createSystemUserValidation: ValidationChain[] = [
  body('username')
    .exists().withMessage('Username is required')
    .isString().withMessage('Username must be a string')
    .isLength({ min: 3, max: 50 }).withMessage('Username must be between 3 and 50 characters')
    .trim(),

  body('fullName')
    .exists().withMessage('Full name is required')
    .isString().withMessage('Full name must be a string')
    .isLength({ min: 2, max: 255 }).withMessage('Full name must be between 2 and 255 characters')
    .trim(),

  body('email')
    .exists().withMessage('Email is required')
    .isEmail().withMessage('Email must be a valid email address')
    .normalizeEmail({ gmail_remove_dots: false })
    .trim(),

  body('password')
    .exists().withMessage('Password is required')
    .isString().withMessage('Password must be a string')
    .isLength({ min: 8, max: 100 }).withMessage('Password must be between 8 and 100 characters'),

  body('role')
    .exists().withMessage('Role is required')
    .isString().withMessage('Role must be a string')
    .isIn(Object.values(SystemUserRole)).withMessage('Role must be a valid SystemUserRole')
    .custom((value, { req }) => {
      const tenantId = req.body.tenantId;
      // SUPERADMIN cannot have a tenantId
      if (value === SystemUserRole.SUPERADMIN && tenantId !== undefined) {
        throw new Error('SUPERADMIN users cannot be associated with a tenant');
      }
      
      // TENANT_ADMIN must have a tenantId
      if (value === SystemUserRole.TENANT_ADMIN && tenantId === undefined) {
        throw new Error('TENANT_ADMIN users must be associated with a tenant');
      }
      
      return true;
    }),

  body('tenantId')
    .optional()
    .isInt().withMessage('Tenant ID must be an integer'),

  body('status')
    .optional()
    .isString().withMessage('Status must be a string')
    .isIn(Object.values(SystemUserStatus)).withMessage('Status must be a valid SystemUserStatus')
    .default(SystemUserStatus.ACTIVE)
];

/**
 * Validation chains for updating a system user
 */
export const updateSystemUserValidation: ValidationChain[] = [
  body('fullName')
    .optional()
    .isString().withMessage('Full name must be a string')
    .isLength({ min: 2, max: 255 }).withMessage('Full name must be between 2 and 255 characters')
    .trim(),

  body('email')
    .optional()
    .isEmail().withMessage('Email must be a valid email address')
    .normalizeEmail({ gmail_remove_dots: false })
    .trim(),

  body('role')
    .optional()
    .isString().withMessage('Role must be a string')
    .isIn(Object.values(SystemUserRole)).withMessage('Role must be a valid SystemUserRole'),

  body('status')
    .optional()
    .isString().withMessage('Status must be a string')
    .isIn(Object.values(SystemUserStatus)).withMessage('Status must be a valid SystemUserStatus'),

  body('password')
    .optional()
    .isString().withMessage('Password must be a string')
    .isLength({ min: 8, max: 100 }).withMessage('Password must be between 8 and 100 characters')
];

/**
 * Validation chains for filtering system users
 */
export const filterSystemUserValidation: ValidationChain[] = [
  body('role')
    .optional()
    .isString().withMessage('Role must be a string')
    .isIn(Object.values(SystemUserRole)).withMessage('Role must be a valid SystemUserRole'),

  body('status')
    .optional()
    .isString().withMessage('Status must be a string')
    .isIn(Object.values(SystemUserStatus)).withMessage('Status must be a valid SystemUserStatus'),

  body('tenantId')
    .optional()
    .isInt().withMessage('Tenant ID must be an integer'),

  body('search')
    .optional()
    .isString().withMessage('Search must be a string')
    .trim()
];
