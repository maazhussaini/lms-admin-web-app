/**
 * @file utils/validation.utils.ts
 * @description Common validation utilities and express-validator rules.
 */

import { body, param, query, ValidationChain } from 'express-validator';

/**
 * Common validation rules for tenant ID
 * @param location Parameter location ('params', 'body', or 'query')
 * @param fieldName Name of the field (default: 'tenantId')
 * @returns ValidationChain for tenant ID
 */
export const tenantIdValidation = (
  location: 'params' | 'body' | 'query' = 'params',
  fieldName = 'tenantId'
): ValidationChain => {
  const validator = 
    location === 'params' ? param(fieldName) :
    location === 'body' ? body(fieldName) :
    query(fieldName);
  
  return validator
    .notEmpty().withMessage('Tenant ID is required')
    .isInt({ min: 1 }).withMessage('Tenant ID must be a positive integer')
    .toInt();
};

/**
 * Common validation rules for pagination parameters
 * @returns Array of ValidationChain objects for page and limit
 */
export const paginationValidation = (): ValidationChain[] => [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer')
    .toInt(),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100')
    .toInt(),
];

/**
 * Common validation rules for sorting parameters
 * @param allowedFields Array of field names allowed for sorting
 * @returns ValidationChain for sortBy and order
 */
export const sortingValidation = (allowedFields: string[]): ValidationChain[] => [
  query('sortBy')
    .optional()
    .custom((value) => {
      // Check if value contains field:direction format
      if (value.includes(':')) {
        const [field] = value.split(':');
        return allowedFields.includes(field);
      }
      
      return allowedFields.includes(value);
    })
    .withMessage(`SortBy must be one of: ${allowedFields.join(', ')}`),
  query('order')
    .optional()
    .isIn(['asc', 'desc', 'ASC', 'DESC'])
    .withMessage('Order must be asc or desc'),
];

/**
 * Common validation rules for ID parameter
 * @param paramName Name of the ID parameter
 * @returns ValidationChain for ID parameter
 */
export const idValidation = (paramName = 'id'): ValidationChain => {
  return param(paramName)
    .notEmpty().withMessage(`${paramName} is required`)
    .isInt({ min: 1 }).withMessage(`${paramName} must be a positive integer`)
    .toInt();
};

/**
 * Common validation rules for email field
 * @param fieldName Name of the email field (default: 'email')
 * @returns ValidationChain for email field
 */
export const emailValidation = (fieldName = 'email'): ValidationChain => {
  return body(fieldName)
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Must be a valid email address')
    .normalizeEmail();
};

/**
 * Common validation rules for password field
 * @param fieldName Name of the password field (default: 'password')
 * @returns ValidationChain for password field
 */
export const passwordValidation = (fieldName = 'password'): ValidationChain => {
  return body(fieldName)
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character');
};

/**
 * Validation for date fields
 * @param fieldName Name of the date field
 * @param options Configuration options
 * @returns ValidationChain for date field
 */
export const dateValidation = (
  fieldName: string,
  options: {
    required?: boolean;
    allowPast?: boolean;
    allowFuture?: boolean;
    minDate?: Date;
    maxDate?: Date;
  } = {}
): ValidationChain => {
  const validator = body(fieldName);
  
  if (options.required) {
    validator.notEmpty().withMessage(`${fieldName} is required`);
  } else {
    validator.optional();
  }
  
  validator
    .isISO8601().withMessage(`${fieldName} must be a valid date in ISO 8601 format`)
    .toDate();
  
  if (!options.allowPast) {
    validator.custom(date => date >= new Date()).withMessage(`${fieldName} cannot be in the past`);
  }
  
  if (!options.allowFuture) {
    validator.custom(date => date <= new Date()).withMessage(`${fieldName} cannot be in the future`);
  }
  
  if (options.minDate) {
    const minDate = options.minDate;
    validator.custom(date => date >= minDate)
      .withMessage(`${fieldName} must be on or after ${minDate.toISOString().split('T')[0]}`);
  }
  
  if (options.maxDate) {
    const maxDate = options.maxDate;
    validator.custom(date => date <= maxDate)
      .withMessage(`${fieldName} must be on or before ${maxDate.toISOString().split('T')[0]}`);
  }
  
  return validator;
};
