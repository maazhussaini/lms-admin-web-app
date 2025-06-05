/**
 * @file utils/validation.utils.ts
 * @description Common validation utilities and express-validator rules for the LMS application.
 * These validators follow express-validator patterns and best practices for consistent
 * input validation across the application.
 */

import { body, param, query, ValidationChain, checkSchema, Schema, CustomValidator } from 'express-validator';
import { ValidationOptions, LocationOptions } from '@shared/types/validation.types.js';

/**
 * Interface for pagination options
 */
interface PaginationOptions {
  /** Minimum page number (default: 1) */
  minPage?: number;
  /** Maximum number of items per page (default: 100) */
  maxLimit?: number;
  /** Default number of items per page if not specified (default: 10) */
  defaultLimit?: number;
}

/**
 * Interface for date validation options
 */
interface DateValidationOptions {
  /** Whether the field is required (default: false) */
  required?: boolean;
  /** Whether past dates are allowed (default: true) */
  allowPast?: boolean;
  /** Whether future dates are allowed (default: true) */
  allowFuture?: boolean;
  /** Minimum allowed date */
  minDate?: Date;
  /** Maximum allowed date */
  maxDate?: Date;
  /** Field location (params, body, query) (default: 'body') */
  location?: LocationOptions;
}

/**
 * Interface for string validation options
 */
interface StringValidationOptions {
  /** Whether the field is required (default: false) */
  required?: boolean;
  /** Minimum string length */
  min?: number;
  /** Maximum string length */
  max?: number;
  /** Regular expression pattern the string must match */
  pattern?: RegExp;
  /** Whether to trim the string (default: true) */
  trim?: boolean;
  /** Field location (params, body, query) (default: 'body') */
  location?: LocationOptions;
}

/**
 * Common validation rules for tenant ID
 * 
 * @param location Parameter location ('params', 'body', or 'query')
 * @param fieldName Name of the field (default: 'tenantId')
 * @returns ValidationChain for tenant ID
 * 
 * @example
 * // In a route file:
 * router.get('/:tenantId/users', [tenantIdValidation()], userController.getUsers);
 */
export const tenantIdValidation = (
  location: LocationOptions = 'params',
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
 * 
 * @param options Configuration options for pagination
 * @returns Array of ValidationChain objects for page and limit
 * 
 * @example
 * // In a route file:
 * router.get('/courses', [...paginationValidation()], courseController.getAllCourses);
 * 
 * // With custom options:
 * router.get('/popular-courses', [...paginationValidation({ maxLimit: 50 })], courseController.getPopularCourses);
 */
export const paginationValidation = (options: PaginationOptions = {}): ValidationChain[] => {
  const {
    minPage = 1,
    maxLimit = 100,
    defaultLimit = 10
  } = options;

  return [
    query('page')
      .optional()
      .isInt({ min: minPage })
      .withMessage(`Page must be a positive integer greater than or equal to ${minPage}`)
      .toInt(),
    query('limit')
      .optional()
      .isInt({ min: 1, max: maxLimit })
      .withMessage(`Limit must be between 1 and ${maxLimit}`)
      .toInt()
      .default(defaultLimit),
  ];
};

/**
 * Common validation rules for sorting parameters
 * 
 * @param allowedFields Array of field names allowed for sorting
 * @param options Optional configuration for default sort
 * @returns ValidationChain for sortBy and order
 * 
 * @example
 * // In a route file:
 * router.get('/courses', [
 *   ...sortingValidation(['name', 'createdAt', 'enrollmentCount'], { defaultField: 'createdAt', defaultOrder: 'desc' })
 * ], courseController.getAllCourses);
 */
export const sortingValidation = (
  allowedFields: string[], 
  options: { defaultField?: string; defaultOrder?: 'asc' | 'desc' } = {}
): ValidationChain[] => [
  query('sortBy')
    .optional()
    .custom((value) => {
      if (!value) return true;
      
      // Check if value contains field:direction format
      if (value.includes(':')) {
        const [field] = value.split(':');
        return allowedFields.includes(field);
      }
      
      return allowedFields.includes(value);
    })
    .withMessage(`SortBy must be one of: ${allowedFields.join(', ')}`)
    .default(options.defaultField),
  query('order')
    .optional()
    .isIn(['asc', 'desc', 'ASC', 'DESC'])
    .withMessage('Order must be asc or desc')
    .customSanitizer(value => value?.toLowerCase())
    .default(options.defaultOrder || 'asc'),
];

/**
 * Common validation rules for ID parameter
 * 
 * @param paramName Name of the ID parameter
 * @param options Additional validation options
 * @returns ValidationChain for ID parameter
 * 
 * @example
 * // In a route file:
 * router.get('/courses/:courseId', [idValidation('courseId')], courseController.getCourseById);
 */
export const idValidation = (
  paramName = 'id',
  options: { location?: LocationOptions } = {}
): ValidationChain => {
  const { location = 'params' } = options;
  const validator = 
    location === 'params' ? param(paramName) :
    location === 'body' ? body(paramName) :
    query(paramName);

  return validator
    .notEmpty().withMessage(`${paramName} is required`)
    .isInt({ min: 1 }).withMessage(`${paramName} must be a positive integer`)
    .toInt();
};

/**
 * Common validation rules for UUID parameter
 * 
 * @param paramName Name of the UUID parameter
 * @param options Additional validation options
 * @returns ValidationChain for UUID parameter
 * 
 * @example
 * // In a route file:
 * router.get('/resources/:resourceId', [uuidValidation('resourceId')], resourceController.getById);
 */
export const uuidValidation = (
  paramName = 'id',
  options: { location?: LocationOptions; required?: boolean } = {}
): ValidationChain => {
  const { location = 'params', required = true } = options;
  const validator = 
    location === 'params' ? param(paramName) :
    location === 'body' ? body(paramName) :
    query(paramName);

  if (required) {
    validator.notEmpty().withMessage(`${paramName} is required`);
  } else {
    validator.optional();
  }

  return validator
    .isUUID().withMessage(`${paramName} must be a valid UUID`);
};

/**
 * Common validation rules for email field
 * 
 * @param fieldName Name of the email field (default: 'email')
 * @param options Additional validation options
 * @returns ValidationChain for email field
 * 
 * @example
 * // In a route file:
 * router.post('/users', [emailValidation()], userController.createUser);
 * 
 * // With custom options:
 * router.patch('/users/:id', [emailValidation('email', { required: false })], userController.updateUser);
 */
export const emailValidation = (
  fieldName = 'email',
  options: { required?: boolean; location?: LocationOptions } = {}
): ValidationChain => {
  const { required = true, location = 'body' } = options;
  const validator = 
    location === 'params' ? param(fieldName) :
    location === 'body' ? body(fieldName) :
    query(fieldName);

  if (required) {
    validator.notEmpty().withMessage('Email is required');
  } else {
    validator.optional();
  }

  return validator
    .isEmail().withMessage('Must be a valid email address')
    .normalizeEmail({ gmail_remove_dots: false, all_lowercase: true });
};

/**
 * Common validation rules for password field
 * 
 * @param fieldName Name of the password field (default: 'password')
 * @param options Password validation options
 * @returns ValidationChain for password field
 * 
 * @example
 * // In a route file:
 * router.post('/auth/register', [passwordValidation()], authController.register);
 * 
 * // With custom options:
 * router.patch('/auth/change-password', [
 *   passwordValidation('newPassword', { minLength: 10 })
 * ], authController.changePassword);
 */
export const passwordValidation = (
  fieldName = 'password',
  options: { 
    required?: boolean; 
    minLength?: number;
    requireUppercase?: boolean;
    requireLowercase?: boolean;
    requireNumbers?: boolean;
    requireSpecialChars?: boolean;
  } = {}
): ValidationChain => {
  const { 
    required = true,
    minLength = 8,
    requireUppercase = true,
    requireLowercase = true,
    requireNumbers = true,
    requireSpecialChars = true
  } = options;

  let validator = body(fieldName);
  
  if (required) {
    validator = validator.notEmpty().withMessage('Password is required');
  } else {
    validator = validator.optional();
  }
  
  validator = validator.isLength({ min: minLength })
    .withMessage(`Password must be at least ${minLength} characters long`);

  // Build the regex pattern based on requirements
  let pattern = '';
  let requirements = [];

  if (requireLowercase) {
    pattern += '(?=.*[a-z])';
    requirements.push('lowercase letter');
  }
  
  if (requireUppercase) {
    pattern += '(?=.*[A-Z])';
    requirements.push('uppercase letter');
  }
  
  if (requireNumbers) {
    pattern += '(?=.*\\d)';
    requirements.push('number');
  }
  
  if (requireSpecialChars) {
    pattern += '(?=.*[@$!%*?&])';
    requirements.push('special character');
  }
  
  // Add the character class for allowed characters
  pattern += '[A-Za-z\\d@$!%*?&]';
  
  if (pattern) {
    validator = validator.matches(new RegExp(pattern))
      .withMessage(`Password must contain at least one ${requirements.join(', one ')}`);
  }
  
  return validator;
};

/**
 * Validation for date fields
 * 
 * @param fieldName Name of the date field
 * @param options Configuration options
 * @returns ValidationChain for date field
 * 
 * @example
 * // In a route file:
 * router.post('/courses', [
 *   dateValidation('startDate', { allowPast: false }),
 *   dateValidation('endDate', { allowPast: false, minDate: new Date() })
 * ], courseController.createCourse);
 */
export const dateValidation = (
  fieldName: string,
  options: DateValidationOptions = {}
): ValidationChain => {
  const { 
    required = false,
    allowPast = true,
    allowFuture = true,
    minDate,
    maxDate,
    location = 'body'
  } = options;
  
  const validator = 
    location === 'params' ? param(fieldName) :
    location === 'body' ? body(fieldName) :
    query(fieldName);
  
  if (required) {
    validator.notEmpty().withMessage(`${fieldName} is required`);
  } else {
    validator.optional();
  }
  
  validator
    .isISO8601().withMessage(`${fieldName} must be a valid date in ISO 8601 format`)
    .toDate();
  
  if (!allowPast) {
    validator.custom((date: Date) => {
      const now = new Date();
      // Set time to beginning of the day for comparison
      now.setHours(0, 0, 0, 0);
      return date >= now;
    }).withMessage(`${fieldName} cannot be in the past`);
  }
  
  if (!allowFuture) {
    validator.custom((date: Date) => {
      const now = new Date();
      // Set time to end of the day for comparison
      now.setHours(23, 59, 59, 999);
      return date <= now;
    }).withMessage(`${fieldName} cannot be in the future`);
  }
  
  if (minDate) {
    validator.custom((date: Date) => date >= minDate)
      .withMessage(`${fieldName} must be on or after ${minDate.toISOString().split('T')[0]}`);
  }
  
  if (maxDate) {
    validator.custom((date: Date) => date <= maxDate)
      .withMessage(`${fieldName} must be on or before ${maxDate.toISOString().split('T')[0]}`);
  }
  
  return validator;
};

/**
 * Validation for string fields
 * 
 * @param fieldName Name of the string field
 * @param options Configuration options
 * @returns ValidationChain for string field
 * 
 * @example
 * // In a route file:
 * router.post('/courses', [
 *   stringValidation('title', { min: 5, max: 100, required: true }),
 *   stringValidation('description', { max: 500 })
 * ], courseController.createCourse);
 */
export const stringValidation = (
  fieldName: string,
  options: StringValidationOptions = {}
): ValidationChain => {
  const { 
    required = false,
    min,
    max,
    pattern,
    trim = true,
    location = 'body'
  } = options;
  
  const validator = 
    location === 'params' ? param(fieldName) :
    location === 'body' ? body(fieldName) :
    query(fieldName);
  
  if (required) {
    validator.notEmpty().withMessage(`${fieldName} is required`);
  } else {
    validator.optional();
  }
  
  if (trim) {
    validator.trim();
  }
  
  if (min !== undefined) {
    validator.isLength({ min }).withMessage(`${fieldName} must be at least ${min} characters long`);
  }
  
  if (max !== undefined) {
    validator.isLength({ max }).withMessage(`${fieldName} must be at most ${max} characters long`);
  }
  
  if (pattern) {
    validator.matches(pattern).withMessage(`${fieldName} format is invalid`);
  }
  
  return validator;
};

/**
 * Validation for URL fields
 * 
 * @param fieldName Name of the URL field
 * @param options Configuration options
 * @returns ValidationChain for URL field
 * 
 * @example
 * // In a route file:
 * router.post('/resources', [
 *   urlValidation('resourceUrl', { protocols: ['https'] })
 * ], resourceController.createResource);
 */
export const urlValidation = (
  fieldName: string,
  options: {
    required?: boolean;
    protocols?: string[];
    location?: LocationOptions;
  } = {}
): ValidationChain => {
  const { 
    required = false,
    protocols = ['http', 'https'],
    location = 'body'
  } = options;
  
  const validator = 
    location === 'params' ? param(fieldName) :
    location === 'body' ? body(fieldName) :
    query(fieldName);
  
  if (required) {
    validator.notEmpty().withMessage(`${fieldName} is required`);
  } else {
    validator.optional();
  }
  
  return validator
    .isURL({ protocols })
    .withMessage(`${fieldName} must be a valid URL${protocols.length ? ` (allowed protocols: ${protocols.join(', ')})` : ''}`);
};

/**
 * Validation for boolean fields
 * 
 * @param fieldName Name of the boolean field
 * @param options Configuration options
 * @returns ValidationChain for boolean field
 * 
 * @example
 * // In a route file:
 * router.post('/settings', [
 *   booleanValidation('isActive')
 * ], settingsController.updateSettings);
 */
export const booleanValidation = (
  fieldName: string,
  options: {
    required?: boolean;
    location?: LocationOptions;
  } = {}
): ValidationChain => {
  const { 
    required = false,
    location = 'body'
  } = options;
  
  const validator = 
    location === 'params' ? param(fieldName) :
    location === 'body' ? body(fieldName) :
    query(fieldName);
  
  if (required) {
    validator.notEmpty().withMessage(`${fieldName} is required`);
  } else {
    validator.optional();
  }
  
  return validator
    .isBoolean()
    .withMessage(`${fieldName} must be a boolean value`)
    .toBoolean();
};

/**
 * Validation for array fields
 * 
 * @param fieldName Name of the array field
 * @param options Configuration options
 * @returns ValidationChain for array field
 * 
 * @example
 * // In a route file:
 * router.post('/courses', [
 *   arrayValidation('tags', { minLength: 1, maxLength: 5 })
 * ], courseController.createCourse);
 */
export const arrayValidation = (
  fieldName: string,
  options: {
    required?: boolean;
    minLength?: number;
    maxLength?: number;
    location?: LocationOptions;
  } = {}
): ValidationChain => {
  const { 
    required = false,
    minLength,
    maxLength,
    location = 'body'
  } = options;
  
  const validator = 
    location === 'params' ? param(fieldName) :
    location === 'body' ? body(fieldName) :
    query(fieldName);
  
  if (required) {
    validator.notEmpty().withMessage(`${fieldName} is required`);
  } else {
    validator.optional();
  }
  
  validator.isArray().withMessage(`${fieldName} must be an array`);
  
  if (minLength !== undefined) {
    validator.isArray({ min: minLength })
      .withMessage(`${fieldName} must contain at least ${minLength} item(s)`);
  }
  
  if (maxLength !== undefined) {
    validator.isArray({ max: maxLength })
      .withMessage(`${fieldName} must contain at most ${maxLength} item(s)`);
  }
  
  return validator;
};

/**
 * Creates a schema for express-validator's checkSchema function
 * 
 * @param schema A schema object mapping field names to validation rules
 * @returns The same schema for chainability
 * 
 * @example
 * // In a route file:
 * const courseSchema = createValidationSchema({
 *   title: { type: 'string', required: true, min: 5, max: 100 },
 *   description: { type: 'string', max: 500 },
 *   startDate: { type: 'date', allowPast: false },
 *   isPublished: { type: 'boolean' },
 *   tags: { type: 'array', maxLength: 5 }
 * });
 * 
 * router.post('/courses', checkSchema(courseSchema), courseController.createCourse);
 */
export const createValidationSchema = <T extends Record<string, any>>(schema: T): Schema => {
  const result: Schema = {};
  
  Object.entries(schema).forEach(([field, rules]) => {
    result[field] = {
      in: rules.location ? [rules.location] : ['body'],
      optional: !rules.required,
      errorMessage: rules.errorMessage || {},
    };
      switch (rules.type) {
      case 'string':
        result[field].isString = true;
        if (rules.trim !== false) result[field].trim = true;
        if (rules.min !== undefined || rules.max !== undefined) {
          const lengthOptions: any = {};
          if (rules.min !== undefined) lengthOptions.min = rules.min;
          if (rules.max !== undefined) lengthOptions.max = rules.max;
          result[field].isLength = { options: lengthOptions };
        }
        if (rules.pattern) result[field].matches = { options: rules.pattern };
        break;
      case 'integer':
        result[field].isInt = rules.options || true;
        result[field].toInt = true;
        break;
      case 'float':
        result[field].isFloat = rules.options || true;
        result[field].toFloat = true;
        break;
      case 'boolean':
        result[field].isBoolean = true;
        result[field].toBoolean = true;
        break;
      case 'date':
        result[field].isISO8601 = true;
        result[field].toDate = true;
        break;
      case 'email':
        result[field].isEmail = true;
        result[field].normalizeEmail = rules.normalizeOptions || true;
        break;
      case 'array':
        result[field].isArray = rules.options || true;
        break;
      case 'url':
        result[field].isURL = rules.options || true;
        break;
      case 'uuid':
        result[field].isUUID = rules.options || true;
        break;
      case 'custom':
        if (rules.customValidator) {
          result[field].custom = {
            options: rules.customValidator,
          };
        }
        break;
    }
    
    // Add any custom validation rules
    if (rules.custom) {
      result[field].custom = {
        options: rules.custom,
      };
    }
  });
  
  return result;
};
