/**
 * @file middleware/validation.middleware.ts
 * @description Advanced request validation middleware using express-validator.
 * Follows industry best practices for validation error handling and formatting.
 */

import { Request, Response, NextFunction } from 'express';
import { 
  validationResult, 
  ValidationChain, 
  matchedData,
  body,
  param,
  query} from 'express-validator';
import { ValidationError as ApiValidationError } from '@/utils/api-error.utils.js';
import logger from '@/config/logger.js';

/**
 * Interface for validation options
 */
interface ValidationOptions {
  /**
   * When true, sanitized data is attached to req.validatedData
   */
  attachSanitizedData?: boolean;
  
  /**
   * Custom error message for validation failure
   */
  errorMessage?: string;
  
  /**
   * Whether to log validation errors (for debugging)
   */
  logErrors?: boolean;
}

/**
 * Extends Express Request interface to include validatedData
 */
declare global {
  namespace Express {
    interface Request {
      validatedData?: Record<string, any>;
    }
  }
}

/**
 * Enhanced validation middleware that validates requests against provided validation chains
 * and attaches sanitized data to the request object if requested
 * 
 * @param validations Array of express-validator validation chains
 * @param options Optional configuration options
 * @returns Middleware function
 */
export const validate = (
  validations: ValidationChain[], 
  options: ValidationOptions = {}
) => {
  const { 
    attachSanitizedData = true, 
    errorMessage = 'Validation failed',
    logErrors = process.env['NODE_ENV'] !== 'production'
  } = options;
  
  return async (req: Request, _res: Response, next: NextFunction) => {
    try {
      // Execute all validations
      await Promise.all(validations.map(validation => validation.run(req)));
      
      // Get validation errors
      const errors = validationResult(req);
      
      if (errors.isEmpty()) {
        // If requested, attach sanitized data to request object
        if (attachSanitizedData) {
          req.validatedData = matchedData(req, { 
            onlyValidData: true,
            includeOptionals: true 
          });
        }
        
        return next();
      }      // Format errors for response - grouped by field
      const formattedErrors: Record<string, string[]> = {};
      
      errors.array({ onlyFirstError: false }).forEach(error => {
        // Handle differences in error format by using type assertion
        const errorObj = error as any;
        const field = errorObj.param || 'general';
        const message = errorObj.msg || 'Invalid value';
        
        if (!formattedErrors[field]) {
          formattedErrors[field] = [];
        }
        
        // Avoid duplicate messages for the same field
        if (!formattedErrors[field].includes(message)) {
          formattedErrors[field].push(message);
        }
      });
      
      // Log validation errors if requested (useful for debugging)
      if (logErrors) {
        logger.debug('Validation errors:', { 
          errors: formattedErrors,
          path: req.path,
          method: req.method
        });
      }
      
      // Create validation error with details
      next(new ApiValidationError(errorMessage, formattedErrors));
    } catch (error) {
      // Handle unexpected errors in the validation process
      logger.error('Unexpected error during validation:', error);
      next(error);
    }
  };
};

/**
 * Utility validation chains for common validation scenarios
 */
export const validationChains = {
  /**
   * Validates an ID in request parameters
   * @param paramName Parameter name (default: 'id')
   * @param errorMessage Custom error message
   * @returns Validation chain
   */
  paramId: (paramName = 'id', errorMessage = 'Invalid ID format'): ValidationChain => {
    return param(paramName)
      .exists().withMessage(`${paramName} is required`)
      .isInt().withMessage(errorMessage)
      .toInt();
  },
  
  /**
   * Validates tenant ID in request parameters
   * @param paramName Parameter name (default: 'tenantId')
   * @returns Validation chain
   */
  paramTenantId: (paramName = 'tenantId'): ValidationChain => {
    return param(paramName)
      .exists().withMessage('Tenant ID is required')
      .isInt().withMessage('Invalid tenant ID format')
      .toInt();
  },

  /**
   * Validates UUID format in request parameters
   * @param paramName Parameter name
   * @param errorMessage Custom error message
   * @returns Validation chain
   */
  paramUuid: (paramName: string, errorMessage = 'Invalid UUID format'): ValidationChain => {
    return param(paramName)
      .exists().withMessage(`${paramName} is required`)
      .isUUID().withMessage(errorMessage);
  },
  
  /**
   * Validates pagination parameters
   * @returns Array of validation chains
   */
  pagination: (): ValidationChain[] => {
    return [
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
        .isString().withMessage('sortBy must be a string')
        .matches(/^[a-zA-Z0-9_]+:(asc|desc)$/).withMessage('sortBy format should be field:asc or field:desc')
    ];
  },

  /**
   * Validates required string field in request body
   * @param fieldName Field name
   * @param options Validation options
   * @returns Validation chain
   */
  requiredString: (
    fieldName: string, 
    options: { 
      min?: number; 
      max?: number; 
      trim?: boolean;
      escape?: boolean;
    } = {}
  ): ValidationChain => {
    const { min = 1, max = 255, trim = true, escape = true } = options;
    
    let chain = body(fieldName)
      .exists().withMessage(`${fieldName} is required`)
      .isString().withMessage(`${fieldName} must be a string`)
      .isLength({ min, max }).withMessage(`${fieldName} must be between ${min} and ${max} characters`);
    
    if (trim) chain = chain.trim();
    if (escape) chain = chain.escape();
    
    return chain;
  },
  
  /**
   * Validates optional string field in request body
   * @param fieldName Field name
   * @param options Validation options
   * @returns Validation chain
   */
  optionalString: (
    fieldName: string, 
    options: { 
      min?: number; 
      max?: number; 
      trim?: boolean;
      escape?: boolean;
      defaultValue?: string | null;
    } = {}
  ): ValidationChain => {
    const { min = 1, max = 255, trim = true, escape = true, defaultValue = undefined } = options;
    
    let chain = body(fieldName)
      .optional({ nullable: true, checkFalsy: false })
      .isString().withMessage(`${fieldName} must be a string`)
      .isLength({ min, max }).withMessage(`${fieldName} must be between ${min} and ${max} characters`);
    
    if (trim) chain = chain.trim();
    if (escape) chain = chain.escape();
    if (defaultValue !== undefined) chain = chain.default(defaultValue);
    
    return chain;
  },

  /**
   * Validates email field in request body
   * @param fieldName Field name (default: 'email')
   * @param required Whether the field is required
   * @returns Validation chain
   */
  email: (fieldName = 'email', required = true): ValidationChain => {
    let chain = body(fieldName);
    
    if (required) {
      chain = chain.exists().withMessage('Email is required');
    } else {
      chain = chain.optional({ nullable: true, checkFalsy: false });
    }
    
    return chain
      .isEmail().withMessage('Invalid email format')
      .normalizeEmail({ gmail_remove_dots: false })
      .trim();
  },
  
  /**
   * Validates password field in request body with configurable strength requirements
   * @param fieldName Field name (default: 'password')
   * @param options Validation options
   * @returns Validation chain
   */
  password: (
    fieldName = 'password', 
    options: { 
      required?: boolean;
      min?: number;
      requireSpecialChar?: boolean;
      requireNumber?: boolean;
      requireUppercase?: boolean;
      requireLowercase?: boolean;
    } = {}
  ): ValidationChain => {
    const { 
      required = true, 
      min = 8,
      requireSpecialChar = true,
      requireNumber = true,
      requireUppercase = true,
      requireLowercase = true
    } = options;
    
    let chain = body(fieldName);
    
    if (required) {
      chain = chain.exists().withMessage('Password is required');
    } else {
      chain = chain.optional();
    }
    
    chain = chain.isString().withMessage('Password must be a string')
      .isLength({ min }).withMessage(`Password must be at least ${min} characters`);
    
    if (requireSpecialChar) {
      chain = chain.matches(/[!@#$%^&*(),.?":{}|<>]/)
        .withMessage('Password must contain at least one special character');
    }
    
    if (requireNumber) {
      chain = chain.matches(/\d/)
        .withMessage('Password must contain at least one number');
    }
    
    if (requireUppercase) {
      chain = chain.matches(/[A-Z]/)
        .withMessage('Password must contain at least one uppercase letter');
    }
    
    if (requireLowercase) {
      chain = chain.matches(/[a-z]/)
        .withMessage('Password must contain at least one lowercase letter');
    }
    
    return chain;
  },
  
  /**
   * Validates a date field in request body
   * @param fieldName Field name
   * @param options Validation options
   * @returns Validation chain
   */
  date: (
    fieldName: string,
    options: {
      required?: boolean;
      isAfter?: string | Date;
      isBefore?: string | Date;
    } = {}
  ): ValidationChain => {
    const { required = true, isAfter, isBefore } = options;
    
    let chain = body(fieldName);
    
    if (required) {
      chain = chain.exists().withMessage(`${fieldName} is required`);
    } else {
      chain = chain.optional({ nullable: true });
    }
    
    chain = chain.isISO8601().withMessage(`${fieldName} must be a valid ISO8601 date`);
    
    if (isAfter) {
      const afterDate = typeof isAfter === 'string' ? isAfter : isAfter.toISOString();
      chain = chain.isAfter(afterDate)
        .withMessage(`${fieldName} must be after ${afterDate}`);
    }
    
    if (isBefore) {
      const beforeDate = typeof isBefore === 'string' ? isBefore : isBefore.toISOString();
      chain = chain.isBefore(beforeDate)
        .withMessage(`${fieldName} must be before ${beforeDate}`);
    }
    
    return chain.toDate();
  },
  
  /**
   * Validates boolean field in request body
   * @param fieldName Field name
   * @param required Whether the field is required
   * @returns Validation chain
   */
  boolean: (fieldName: string, required = true): ValidationChain => {
    let chain = body(fieldName);
    
    if (required) {
      chain = chain.exists().withMessage(`${fieldName} is required`);
    } else {
      chain = chain.optional({ nullable: true });
    }
    
    return chain
      .isBoolean().withMessage(`${fieldName} must be a boolean`)
      .toBoolean();
  },
  
  /**
   * Validates enum field in request body against allowed values
   * @param fieldName Field name
   * @param allowedValues Array of allowed values
   * @param required Whether the field is required
   * @returns Validation chain
   */
  enum: (fieldName: string, allowedValues: string[], required = true): ValidationChain => {
    let chain = body(fieldName);
    
    if (required) {
      chain = chain.exists().withMessage(`${fieldName} is required`);
    } else {
      chain = chain.optional({ nullable: true });
    }
    
    return chain
      .isIn(allowedValues).withMessage(`${fieldName} must be one of: ${allowedValues.join(', ')}`);
  },
  
  /**
   * Validates array field in request body
   * @param fieldName Field name
   * @param options Validation options
   * @returns Validation chain
   */
  array: (
    fieldName: string,
    options: {
      required?: boolean;
      minItems?: number;
      maxItems?: number;
      itemType?: 'string' | 'integer' | 'uuid';
    } = {}
  ): ValidationChain => {
    const { required = true, minItems = 1, maxItems, itemType } = options;
    
    let chain = body(fieldName);
    
    if (required) {
      chain = chain.exists().withMessage(`${fieldName} is required`);
    } else {
      chain = chain.optional({ nullable: true });
    }
    
    chain = chain
      .isArray({ min: minItems }).withMessage(`${fieldName} must be an array with at least ${minItems} items`);
    
    if (maxItems) {
      chain = chain.isArray({ max: maxItems })
        .withMessage(`${fieldName} must have at most ${maxItems} items`);
    }
    
    if (itemType === 'string') {
      chain = chain.custom(value => {
        if (!Array.isArray(value)) return true;
        return value.every(item => typeof item === 'string');
      }).withMessage(`All items in ${fieldName} must be strings`);
    } else if (itemType === 'integer') {
      chain = chain.custom(value => {
        if (!Array.isArray(value)) return true;
        return value.every(item => Number.isInteger(Number(item)));
      }).withMessage(`All items in ${fieldName} must be integers`);
    } else if (itemType === 'uuid') {
      chain = chain.custom(value => {
        if (!Array.isArray(value)) return true;
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        return value.every(item => typeof item === 'string' && uuidRegex.test(item));
      }).withMessage(`All items in ${fieldName} must be valid UUIDs`);
    }
    
    return chain;
  }
};

export default validate;
