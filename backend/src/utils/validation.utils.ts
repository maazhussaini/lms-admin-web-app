/**
 * @file utils/validation.utils.ts
 * @description Common validation utilities and express-validator rules for the LMS application.
 * These validators follow express-validator patterns and best practices for consistent
 * input validation across the application.
 */

import { body, param, query, ValidationChain, Schema } from 'express-validator';
import { LocationOptions } from '@shared/types/validation.types.js';
import { Socket } from 'socket.io';
import { 
  ContentProgressPayload,
  VideoProgressPayload,
  NotificationPayload,
  NotificationStatusPayload,
  CourseUpdatePayload,
  DeliveryStatus,
  NotificationType,
  NotificationPriority
} from '@shared/types/notification.types.js';
import { AuthenticatedSocket, UserRole } from '../sockets/index.js';

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
 * Socket validation error interface
 */
interface SocketValidationError {
  field: string;
  value: any;
  message: string;
}

/**
 * Socket validation result interface
 */
interface SocketValidationResult {
  isValid: boolean;
  errors: SocketValidationError[];
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

// =============================================================================
// SOCKET.IO VALIDATION UTILITIES
// =============================================================================

/**
 * Validates a socket base payload structure
 * @param payload The payload to validate
 * @returns Validation result
 */
const validateSocketBasePayload = (payload: any): SocketValidationResult => {
  const errors: SocketValidationError[] = [];

  // Validate tenantId
  if (!payload.tenantId || typeof payload.tenantId !== 'number' || payload.tenantId <= 0) {
    errors.push({
      field: 'tenantId',
      value: payload.tenantId,
      message: 'tenantId must be a positive integer'
    });
  }

  // Validate timestamp (optional but if present must be valid)
  if (payload.timestamp && !isValidTimestamp(payload.timestamp)) {
    errors.push({
      field: 'timestamp',
      value: payload.timestamp,
      message: 'timestamp must be a valid ISO 8601 date string or Date object'
    });
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Helper function to validate timestamp
 * @param timestamp The timestamp to validate
 * @returns True if valid timestamp
 */
const isValidTimestamp = (timestamp: any): boolean => {
  if (timestamp instanceof Date) {
    return !isNaN(timestamp.getTime());
  }
  if (typeof timestamp === 'string') {
    const date = new Date(timestamp);
    return !isNaN(date.getTime());
  }
  return false;
};

/**
 * Validates content progress payload for socket events
 * @param payload The content progress payload
 * @returns True if valid, throws error if invalid
 */
export const validateContentProgressPayload = (payload: any): payload is ContentProgressPayload => {
  const baseValidation = validateSocketBasePayload(payload);
  const errors = [...baseValidation.errors];

  // Validate userId
  if (!payload.userId || typeof payload.userId !== 'number' || payload.userId <= 0) {
    errors.push({
      field: 'userId',
      value: payload.userId,
      message: 'userId must be a positive integer'
    });
  }

  // Validate courseId
  if (!payload.courseId || typeof payload.courseId !== 'number' || payload.courseId <= 0) {
    errors.push({
      field: 'courseId',
      value: payload.courseId,
      message: 'courseId must be a positive integer'
    });
  }

  // Validate progressPercentage
  if (typeof payload.progressPercentage !== 'number' || payload.progressPercentage < 0 || payload.progressPercentage > 100) {
    errors.push({
      field: 'progressPercentage',
      value: payload.progressPercentage,
      message: 'progressPercentage must be a number between 0 and 100'
    });
  }

  // Validate optional fields
  if (payload.moduleId !== undefined && (typeof payload.moduleId !== 'number' || payload.moduleId <= 0)) {
    errors.push({
      field: 'moduleId',
      value: payload.moduleId,
      message: 'moduleId must be a positive integer when provided'
    });
  }

  if (payload.topicId !== undefined && (typeof payload.topicId !== 'number' || payload.topicId <= 0)) {
    errors.push({
      field: 'topicId',
      value: payload.topicId,
      message: 'topicId must be a positive integer when provided'
    });
  }

  if (payload.contentId !== undefined && (typeof payload.contentId !== 'number' || payload.contentId <= 0)) {
    errors.push({
      field: 'contentId',
      value: payload.contentId,
      message: 'contentId must be a positive integer when provided'
    });
  }

  if (payload.timeSpentSeconds !== undefined && (typeof payload.timeSpentSeconds !== 'number' || payload.timeSpentSeconds < 0)) {
    errors.push({
      field: 'timeSpentSeconds',
      value: payload.timeSpentSeconds,
      message: 'timeSpentSeconds must be a non-negative number when provided'
    });
  }

  if (payload.completedAt !== undefined && !isValidTimestamp(payload.completedAt)) {
    errors.push({
      field: 'completedAt',
      value: payload.completedAt,
      message: 'completedAt must be a valid timestamp when provided'
    });
  }

  if (errors.length > 0) {
    throw new Error(`Content progress validation failed: ${errors.map(e => `${e.field}: ${e.message}`).join(', ')}`);
  }

  return true;
};

/**
 * Validates video progress payload for socket events
 * @param payload The video progress payload
 * @returns True if valid, throws error if invalid
 */
export const validateVideoProgressPayload = (payload: any): payload is VideoProgressPayload => {
  // First validate as content progress payload
  validateContentProgressPayload(payload);
  
  const errors: SocketValidationError[] = [];

  // Validate videoId
  if (!payload.videoId || typeof payload.videoId !== 'string' || payload.videoId.trim().length === 0) {
    errors.push({
      field: 'videoId',
      value: payload.videoId,
      message: 'videoId must be a non-empty string'
    });
  }

  // Validate currentTimeSeconds
  if (typeof payload.currentTimeSeconds !== 'number' || payload.currentTimeSeconds < 0) {
    errors.push({
      field: 'currentTimeSeconds',
      value: payload.currentTimeSeconds,
      message: 'currentTimeSeconds must be a non-negative number'
    });
  }

  // Validate durationSeconds
  if (typeof payload.durationSeconds !== 'number' || payload.durationSeconds <= 0) {
    errors.push({
      field: 'durationSeconds',
      value: payload.durationSeconds,
      message: 'durationSeconds must be a positive number'
    });
  }

  // Validate isCompleted
  if (typeof payload.isCompleted !== 'boolean') {
    errors.push({
      field: 'isCompleted',
      value: payload.isCompleted,
      message: 'isCompleted must be a boolean'
    });
  }

  // Validate that currentTimeSeconds doesn't exceed durationSeconds
  if (typeof payload.currentTimeSeconds === 'number' && typeof payload.durationSeconds === 'number' && 
      payload.currentTimeSeconds > payload.durationSeconds) {
    errors.push({
      field: 'currentTimeSeconds',
      value: payload.currentTimeSeconds,
      message: 'currentTimeSeconds cannot exceed durationSeconds'
    });
  }

  if (errors.length > 0) {
    throw new Error(`Video progress validation failed: ${errors.map(e => `${e.field}: ${e.message}`).join(', ')}`);
  }

  return true;
};

/**
 * Validates notification status payload for socket events
 * @param payload The notification status payload
 * @returns True if valid, throws error if invalid
 */
export const validateNotificationStatusPayload = (payload: any): payload is NotificationStatusPayload => {
  const baseValidation = validateSocketBasePayload(payload);
  const errors = [...baseValidation.errors];

  // Validate notificationId
  if (!payload.notificationId || typeof payload.notificationId !== 'number' || payload.notificationId <= 0) {
    errors.push({
      field: 'notificationId',
      value: payload.notificationId,
      message: 'notificationId must be a positive integer'
    });
  }

  // Validate userId
  if (!payload.userId || typeof payload.userId !== 'number' || payload.userId <= 0) {
    errors.push({
      field: 'userId',
      value: payload.userId,
      message: 'userId must be a positive integer'
    });
  }

  // Validate status
  if (!payload.status || !Object.values(DeliveryStatus).includes(payload.status)) {
    errors.push({
      field: 'status',
      value: payload.status,
      message: `status must be one of: ${Object.values(DeliveryStatus).join(', ')}`
    });
  }

  if (errors.length > 0) {
    throw new Error(`Notification status validation failed: ${errors.map(e => `${e.field}: ${e.message}`).join(', ')}`);
  }

  return true;
};

/**
 * Validates tenant broadcast payload for socket events
 * @param payload The tenant broadcast payload
 * @returns True if valid, throws error if invalid
 */
export const validateTenantBroadcastPayload = (payload: any): payload is Omit<NotificationPayload, 'recipientId'> => {
  const baseValidation = validateSocketBasePayload(payload);
  const errors = [...baseValidation.errors];

  // Validate title
  if (!payload.title || typeof payload.title !== 'string' || payload.title.trim().length === 0) {
    errors.push({
      field: 'title',
      value: payload.title,
      message: 'title must be a non-empty string'
    });
  }

  // Validate message
  if (!payload.message || typeof payload.message !== 'string' || payload.message.trim().length === 0) {
    errors.push({
      field: 'message',
      value: payload.message,
      message: 'message must be a non-empty string'
    });
  }

  // Validate type
  if (!payload.type || !Object.values(NotificationType).includes(payload.type)) {
    errors.push({
      field: 'type',
      value: payload.type,
      message: `type must be one of: ${Object.values(NotificationType).join(', ')}`
    });
  }

  // Validate priority
  if (!payload.priority || !Object.values(NotificationPriority).includes(payload.priority)) {
    errors.push({
      field: 'priority',
      value: payload.priority,
      message: `priority must be one of: ${Object.values(NotificationPriority).join(', ')}`
    });
  }

  // Validate optional senderId
  if (payload.senderId !== undefined && (typeof payload.senderId !== 'number' || payload.senderId <= 0)) {
    errors.push({
      field: 'senderId',
      value: payload.senderId,
      message: 'senderId must be a positive integer when provided'
    });
  }

  // Validate optional metadata
  if (payload.metadata !== undefined && (typeof payload.metadata !== 'object' || payload.metadata === null || Array.isArray(payload.metadata))) {
    errors.push({
      field: 'metadata',
      value: payload.metadata,
      message: 'metadata must be an object when provided'
    });
  }

  if (errors.length > 0) {
    throw new Error(`Tenant broadcast validation failed: ${errors.map(e => `${e.field}: ${e.message}`).join(', ')}`);
  }

  return true;
};

/**
 * Validates system alert payload for socket events
 * @param payload The system alert payload
 * @returns True if valid, throws error if invalid
 */
export const validateSystemAlertPayload = (payload: any): payload is { message: string; severity: 'info' | 'warning' | 'critical' } => {
  const errors: SocketValidationError[] = [];

  // Validate message
  if (!payload.message || typeof payload.message !== 'string' || payload.message.trim().length === 0) {
    errors.push({
      field: 'message',
      value: payload.message,
      message: 'message must be a non-empty string'
    });
  }

  // Validate severity
  const allowedSeverities = ['info', 'warning', 'critical'] as const;
  if (!payload.severity || !allowedSeverities.includes(payload.severity)) {
    errors.push({
      field: 'severity',
      value: payload.severity,
      message: `severity must be one of: ${allowedSeverities.join(', ')}`
    });
  }

  if (errors.length > 0) {
    throw new Error(`System alert validation failed: ${errors.map(e => `${e.field}: ${e.message}`).join(', ')}`);
  }

  return true;
};

/**
 * Validates course update payload for socket events
 * @param payload The course update payload
 * @returns True if valid, throws error if invalid
 */
export const validateCourseUpdatePayload = (payload: any): payload is CourseUpdatePayload => {
  const baseValidation = validateSocketBasePayload(payload);
  const errors = [...baseValidation.errors];

  // Validate courseId
  if (!payload.courseId || typeof payload.courseId !== 'number' || payload.courseId <= 0) {
    errors.push({
      field: 'courseId',
      value: payload.courseId,
      message: 'courseId must be a positive integer'
    });
  }

  // Validate updateType
  const allowedUpdateTypes = ['CONTENT', 'SCHEDULE', 'INSTRUCTOR', 'STATUS'] as const;
  if (!payload.updateType || !allowedUpdateTypes.includes(payload.updateType)) {
    errors.push({
      field: 'updateType',
      value: payload.updateType,
      message: `updateType must be one of: ${allowedUpdateTypes.join(', ')}`
    });
  }

  // Validate title
  if (!payload.title || typeof payload.title !== 'string' || payload.title.trim().length === 0) {
    errors.push({
      field: 'title',
      value: payload.title,
      message: 'title must be a non-empty string'
    });
  }

  // Validate message
  if (!payload.message || typeof payload.message !== 'string' || payload.message.trim().length === 0) {
    errors.push({
      field: 'message',
      value: payload.message,
      message: 'message must be a non-empty string'
    });
  }

  // Validate updatedBy
  if (!payload.updatedBy || typeof payload.updatedBy !== 'number' || payload.updatedBy <= 0) {
    errors.push({
      field: 'updatedBy',
      value: payload.updatedBy,
      message: 'updatedBy must be a positive integer'
    });
  }

  if (errors.length > 0) {
    throw new Error(`Course update validation failed: ${errors.map(e => `${e.field}: ${e.message}`).join(', ')}`);
  }

  return true;
};

/**
 * Higher-order function that wraps socket event handlers with validation and error handling
 * @param socket The socket instance
 * @param eventName The name of the socket event
 * @param validator The validation function
 * @param handler The actual event handler
 * @returns Wrapped handler function
 */
export const withValidationAndErrorResponse = <T>(
  socket: Socket,
  eventName: string,
  validator: (payload: any) => payload is T,
  handler: (payload: T) => Promise<void> | void
) => {
  return async (payload: any): Promise<void> => {
    try {
      // Validate the payload
      if (!validator(payload)) {
        socket.emit(`${eventName}:error`, {
          message: 'Invalid payload structure',
          timestamp: new Date().toISOString()
        });
        return;
      }

      // Execute the handler
      await handler(payload);
    } catch (error) {
      // Log the error
      console.error(`Socket event ${eventName} validation or execution error:`, error);
      
      // Send error response to client
      socket.emit(`${eventName}:error`, {
        message: error instanceof Error ? error.message : 'Unknown error occurred',
        timestamp: new Date().toISOString()
      });
    }
  };
};

/**
 * Checks if a socket user has any of the required roles
 * @param socket The authenticated socket
 * @param requiredRoles Array of roles that are allowed
 * @returns True if user has required role, false otherwise
 */
export const checkSocketRoleAuthorization = (
  socket: AuthenticatedSocket,
  requiredRoles: UserRole[]
): boolean => {
  const userRole = socket.data?.user?.role;
  
  if (!userRole) {
    console.warn('Socket user role not found in socket data');
    return false;
  }

  const hasRole = requiredRoles.includes(userRole);
  
  if (!hasRole) {
    console.warn(`Socket authorization failed: User role '${userRole}' not in required roles [${requiredRoles.join(', ')}]`);
  }

  return hasRole;
};

/**
 * Validates an enum value against allowed values
 * @param value The value to validate
 * @param enumObject The enum object to validate against
 * @param fieldName The field name for error messages
 * @returns True if valid
 */
export const validateEnumValue = <T extends Record<string, string | number>>(
  value: any,
  enumObject: T,
  fieldName: string
): value is T[keyof T] => {
  const allowedValues = Object.values(enumObject);
  if (!allowedValues.includes(value)) {
    throw new Error(`${fieldName} must be one of: ${allowedValues.join(', ')}`);
  }
  return true;
};

/**
 * Validates a numeric range
 * @param value The value to validate
 * @param min Minimum allowed value
 * @param max Maximum allowed value
 * @param fieldName The field name for error messages
 * @returns True if valid
 */
export const validateNumericRange = (
  value: any,
  min: number,
  max: number,
  fieldName: string
): value is number => {
  if (typeof value !== 'number' || isNaN(value)) {
    throw new Error(`${fieldName} must be a valid number`);
  }
  if (value < min || value > max) {
    throw new Error(`${fieldName} must be between ${min} and ${max}`);
  }
  return true;
};

/**
 * Validates that a value is a positive integer
 * @param value The value to validate
 * @param fieldName The field name for error messages
 * @returns True if valid
 */
export const validatePositiveInteger = (
  value: any,
  fieldName: string
): value is number => {
  if (!Number.isInteger(value) || value <= 0) {
    throw new Error(`${fieldName} must be a positive integer`);
  }
  return true;
};

/**
 * Validates an array of items using a validator function
 * @param items The array to validate
 * @param validator The validator function for each item
 * @param fieldName The field name for error messages
 * @returns True if all items are valid
 */
export const validateArray = <T>(
  items: any[],
  validator: (item: any) => item is T,
  fieldName: string
): items is T[] => {
  if (!Array.isArray(items)) {
    throw new Error(`${fieldName} must be an array`);
  }
  
  items.forEach((item, index) => {
    try {
      validator(item);
    } catch (error) {
      throw new Error(`${fieldName}[${index}]: ${error instanceof Error ? error.message : 'Validation failed'}`);
    }
  });
  
  return true;
};

/**
 * Validates that a string is not empty after trimming
 * @param value The value to validate
 * @param fieldName The field name for error messages
 * @returns True if valid
 */
export const validateNonEmptyString = (
  value: any,
  fieldName: string
): value is string => {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new Error(`${fieldName} must be a non-empty string`);
  }
  return true;
};

/**
 * Creates a composite validator that runs multiple validators
 * @param validators Array of validator functions
 * @returns Composite validator function
 */
export const createCompositeValidator = <T>(
  ...validators: Array<(value: any) => value is T>
) => {
  return (value: any): value is T => {
    for (const validator of validators) {
      validator(value); // Will throw if validation fails
    }
    return true;
  };
};
