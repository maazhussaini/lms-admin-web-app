/**
 * @file System User DTOs for handling user creation and updates
 * @description Defines data transfer objects for system user management with validation rules
 */

import { body, query, ValidationChain } from 'express-validator';
import { UserType, SystemUserStatus } from '@/types/enums.types';

/**
 * DTO interface for creating a new system user
 */
export interface CreateSystemUserDto {
  username: string;
  fullName: string;
  email: string;
  password: string;
  roleType: UserType;
  tenantId?: number | null;
  status?: SystemUserStatus;
}

/**
 * DTO interface for updating an existing system user
 */
export interface UpdateSystemUserDto {
  fullName?: string;
  email?: string;
  roleType?: UserType;
  status?: SystemUserStatus;
  password?: string;
}

/**
 * DTO interface for filtering system users in list operations
 */
export interface SystemUserFilterDto {
  roleType?: UserType;
  status?: SystemUserStatus;
  tenantId?: number | null;
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
    .isLength({ max: 255 }).withMessage('Email must not exceed 255 characters')
    .normalizeEmail({ gmail_remove_dots: false })
    .trim(),

  body('password')
    .exists().withMessage('Password is required')
    .isString().withMessage('Password must be a string')
    .isLength({ min: 8, max: 100 }).withMessage('Password must be between 8 and 100 characters'),

  body('roleType')
    .exists().withMessage('Role type is required')
    .isString().withMessage('Role type must be a string')
    .isIn(Object.values(UserType)).withMessage('Role type must be a valid UserType')
    .custom((value, { req }) => {
      const tenantId = req.body.tenantId;
      // SUPER_ADMIN cannot have a tenantId
      if (value === UserType.SUPER_ADMIN && tenantId !== undefined && tenantId !== null) {
        throw new Error('SUPER_ADMIN users cannot be associated with a tenant');
      }
      
      // TENANT_ADMIN must have a tenantId
      if (value === UserType.TENANT_ADMIN && (tenantId === undefined || tenantId === null)) {
        throw new Error('TENANT_ADMIN users must be associated with a tenant');
      }
      
      return true;
    }),

  body('tenantId')
    .optional()
    .isInt({ min: 1 }).withMessage('Tenant ID must be a positive integer'),

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
    .isLength({ max: 255 }).withMessage('Email must not exceed 255 characters')
    .normalizeEmail({ gmail_remove_dots: false })
    .trim(),

  body('roleType')
    .optional()
    .isString().withMessage('Role type must be a string')
    .isIn(Object.values(UserType)).withMessage('Role type must be a valid UserType'),

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
  body('roleType')
    .optional()
    .isString().withMessage('Role type must be a string')
    .isIn(Object.values(UserType)).withMessage('Role type must be a valid UserType'),

  body('status')
    .optional()
    .isString().withMessage('Status must be a string')
    .isIn(Object.values(SystemUserStatus)).withMessage('Status must be a valid SystemUserStatus'),

  body('tenantId')
    .optional()
    .isInt({ min: 1 }).withMessage('Tenant ID must be a positive integer'),

  body('search')
    .optional()
    .isString().withMessage('Search must be a string')
    .trim()
];

/**
 * Validation chains for query parameters when listing system users
 */
export const listSystemUsersValidation: ValidationChain[] = [
  // Pagination parameters (using query validation instead of body)
  query('page')
    .optional()
    .isInt({ min: 1 }).withMessage('Page must be a positive integer')
    .toInt(),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100')
    .toInt(),

  // Sorting parameters
  query('sortBy')
    .optional()
    .isString().withMessage('Sort by must be a string')
    .isIn(['createdAt', 'updatedAt', 'fullName', 'email', 'roleType', 'status', 'tenantId', 'username'])
    .withMessage('Sort by must be a valid field'),

  query('sortOrder')
    .optional()
    .isString().withMessage('Sort order must be a string')
    .isIn(['asc', 'desc']).withMessage('Sort order must be asc or desc'),

  // Filter parameters
  query('roleType')
    .optional()
    .isString().withMessage('Role type must be a string')
    .isIn(Object.values(UserType)).withMessage('Role type must be a valid UserType'),

  query('status')
    .optional()
    .isString().withMessage('Status must be a string')
    .isIn(Object.values(SystemUserStatus)).withMessage('Status must be a valid SystemUserStatus'),

  query('tenantId')
    .optional()
    .isInt({ min: 1 }).withMessage('Tenant ID must be a positive integer')
    .toInt(),

  query('search')
    .optional()
    .isString().withMessage('Search must be a string')
    .isLength({ min: 1, max: 100 }).withMessage('Search term must be between 1 and 100 characters')
    .trim()
];

/**
 * Enhanced filter DTO with proper typing for validated query parameters
 */
export interface SystemUserListQueryDto {
  // Pagination
  page?: number;
  limit?: number;
  
  // Sorting
  sortBy?: 'createdAt' | 'updatedAt' | 'fullName' | 'email' | 'roleType' | 'status' | 'tenantId' | 'username';
  sortOrder?: 'asc' | 'desc';
  
  // Filters
  roleType?: UserType;
  status?: SystemUserStatus;
  tenantId?: number;
  search?: string;
}
