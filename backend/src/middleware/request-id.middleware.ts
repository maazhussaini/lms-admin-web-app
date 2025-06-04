/**
 * @file middleware/request-id.middleware.ts
 * @description Middleware to generate and attach a unique ID to each request.
 */

import { Request, Response, NextFunction } from 'express';
import { randomUUID } from 'crypto';

/**
 * Extends Express Request interface to include request ID
 */
declare global {
  namespace Express {
    interface Request {
      id: string;
    }
  }
}

/**
 * Generate and attach a unique correlation ID to each request
 * Used for request tracking across logs and responses
 */
export const requestId = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Use existing ID from headers if available, otherwise generate new UUID
  const correlationId = 
    req.headers['x-correlation-id'] as string || 
    req.headers['x-request-id'] as string || 
    randomUUID();
  
  // Attach to request object
  req.id = correlationId;
  
  // Add to response headers
  res.setHeader('X-Correlation-ID', correlationId);
  
  next();
};

export default requestId;
