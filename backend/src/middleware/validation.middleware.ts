/**
 * @file middleware/validation.middleware.ts
 * @description Request validation middleware using express-validator.
 */

import { Request, Response, NextFunction } from 'express';
import { validationResult, ValidationChain } from 'express-validator';
import { ValidationError as ApiValidationError } from '@/utils/api-error.utils.js';

/**
 * Validates request against provided validation chains
 * @param validations Array of express-validator validation chains
 * @returns Middleware function
 */
export const validate = (validations: ValidationChain[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    // Execute all validations
    await Promise.all(validations.map(validation => validation.run(req)));
    
    // Get validation errors
    const errors = validationResult(req);
    
    if (errors.isEmpty()) {
      return next();
    }
    
    // Format errors for response
    const formattedErrors: Record<string, string[]> = {};
    
    errors.array().forEach(error => {
      const { msg, param } = error as { msg: string; param?: string };
      const field: string = param || 'general';
      
      if (!formattedErrors[field]) {
        formattedErrors[field] = [];
      }
      
      formattedErrors[field].push(msg);
    });
    
    // Throw validation error with details
    next(new ApiValidationError('Validation failed', formattedErrors));
  };
};

export default validate;
