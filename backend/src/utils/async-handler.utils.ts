/**
 * @file utils/async-handler.utils.ts
 * @description Utility to wrap Express route handlers for async error handling.
 */

import { Request, Response, NextFunction } from 'express';

/**
 * Wraps an async Express route handler to automatically catch errors
 * and pass them to Express error middleware
 * 
 * @param fn Async Express route handler function
 * @returns Wrapped function that forwards errors to next()
 */
export const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

export default asyncHandler;
