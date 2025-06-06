/**
 * @file types/express.d.ts
 * @description TypeScript declaration file to extend Express Request interface
 * with custom properties used throughout the application.
 */

import { TokenPayload } from '@/utils/jwt.utils.js';

declare global {
  namespace Express {
    /**
     * Extended Request interface with application-specific properties
     */
    interface Request {
      /**
       * Authenticated user data from JWT token
       * Set by authentication middleware
       */
      user?: TokenPayload;
      
      /**
       * Unique request identifier for tracing and correlation
       * Set by request-id middleware
       */
      id: string;
      
      /**
       * Validated and sanitized request data
       * Set by validation middleware when attachSanitizedData is true
       */
      validatedData?: Record<string, any>;
    }

    /**
     * Extended Response locals interface with application-specific properties
     */
    interface Locals {
      /**
       * Current tenant ID for the request
       * Set by tenant context middleware
       */
      tenantId?: number;
      
      /**
       * Current user ID for the request
       * Set by authentication middleware
       */
      userId?: number;
      
      /**
       * Resource information for authorization
       * Set by resource authorization middleware
       */
      resource?: {
        id: number;
        type: string;
      };
    }
  }
}

export {};
