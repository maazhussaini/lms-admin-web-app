/**
 * @file utils/jwt.utils.ts
 * @description JWT token generation and verification utilities.
 * Implements secure token handling for authentication and authorization,
 * with support for multi-tenancy and role-based access control.
 */

import jwt from 'jsonwebtoken';
import { promisify } from 'util';
import crypto from 'crypto';
import type { StringValue } from 'ms';
import env from '@/config/environment.js';
import { UnauthorizedError } from './api-error.utils.js';
import logger from '@/config/logger.js';

/**
 * User payload structure for JWT token
 * Contains essential user information for authentication and authorization
 */
export interface TokenPayload {
  id: number;
  email: string;
  tenantId: number;
  role: string;
  permissions?: string[];
  sessionId?: string; // Optional session ID for tracking/revocation
}

/**
 * Token response structure returned to clients
 */
export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number; // seconds
  tokenType: string; // Always "Bearer"
}

// Promisify jwt functions for better async/await support
const verifyAsync = promisify(jwt.verify);

/**
 * JWT sign options base configuration
 */
const JWT_BASE_OPTIONS: jwt.SignOptions = {
  issuer: env.JWT_ISSUER || 'lms-admin',
  audience: env.JWT_AUDIENCE || 'lms-client',
  algorithm: 'HS256' // Explicitly set algorithm for security
};

/**
 * Generate JWT access token
 * @param payload User data to include in the token
 * @param expiresIn Token expiration time (default: from env or 15 minutes for security)
 * @returns JWT access token string
 */
export const generateAccessToken = (
  payload: TokenPayload,
  expiresIn: StringValue | number = (env.JWT_EXPIRES_IN || '15m') as StringValue
): string => {
  // Create payload with issue time and custom claims
  const tokenPayload = {
    ...payload,
    iat: Math.floor(Date.now() / 1000), // Issued at time
    type: 'access' // Token type claim for additional security
  };  const options: jwt.SignOptions = {
    ...JWT_BASE_OPTIONS,
    expiresIn,
    subject: `user:${payload.id}` // Subject identifies the principal
  };
  
  try {
    return jwt.sign(tokenPayload, env.JWT_SECRET, options);
  } catch (error) {
    logger.error('Error generating access token', { error });
    throw new Error('Failed to generate access token');
  }
};

/**
 * Generate JWT refresh token
 * @param userId User ID to include in the token
 * @param tenantId Tenant ID to include in the token
 * @param expiresIn Token expiration time (default: from env or 7 days)
 * @param sessionId Optional session ID for token revocation capability
 * @returns JWT refresh token string
 */
export const generateRefreshToken = (
  userId: number,
  tenantId: number,
  expiresIn: StringValue | number = (env.JWT_REFRESH_EXPIRES_IN || '7d') as StringValue,
  sessionId?: string
): string => {
  // Create minimal payload for refresh token (security best practice)
  const tokenPayload = {
    id: userId,
    tenantId,
    iat: Math.floor(Date.now() / 1000),
    type: 'refresh', // Token type claim for additional security
    ...(sessionId ? { sessionId } : {})
  };    const options: jwt.SignOptions = {
    ...JWT_BASE_OPTIONS,
    expiresIn,
    subject: `user:${userId}`, // Subject identifies the principal
    jwtid: crypto.randomUUID?.() || Date.now().toString() // Unique token ID for revocation capability
  };
  
  try {
    return jwt.sign(tokenPayload, env.JWT_REFRESH_SECRET, options);
  } catch (error) {
    logger.error('Error generating refresh token', { error });
    throw new Error('Failed to generate refresh token');
  }
};

/**
 * Generate both access and refresh tokens
 * @param user User data for token payload
 * @returns Object containing both tokens and expiry information
 */
export const generateTokens = (user: TokenPayload): TokenResponse => {
  // Calculate expiration time in seconds for client usage
  const expiresIn = typeof env.JWT_EXPIRES_IN === 'string' 
    ? parseInt(env.JWT_EXPIRES_IN) || 3600 // Default to 1 hour
    : env.JWT_EXPIRES_IN || 3600;

  return {
    accessToken: generateAccessToken(user),
    refreshToken: generateRefreshToken(user.id, user.tenantId),
    expiresIn,
    tokenType: 'Bearer'
  };
};

/**
 * Verify JWT access token
 * @param token JWT access token to verify
 * @returns Decoded token payload
 * @throws UnauthorizedError if token is invalid or expired
 */
export const verifyAccessToken = (token: string): TokenPayload => {
  try {
    // Add verification options to ensure token is used as intended
    const options: jwt.VerifyOptions = {
      issuer: JWT_BASE_OPTIONS.issuer,
      audience: JWT_BASE_OPTIONS.audience,
      algorithms: [JWT_BASE_OPTIONS.algorithm as jwt.Algorithm]
    };
    
    const decoded = jwt.verify(token, env.JWT_SECRET, options) as jwt.JwtPayload;
      // Validate token type to prevent token substitution attacks
    if (decoded['type'] !== 'access') {
      logger.warn('Token type verification failed', { 
        expectedType: 'access', 
        receivedType: decoded['type'] 
      });
      throw new UnauthorizedError('Invalid token type', 'INVALID_TOKEN_TYPE');
    }
    
    // Extract and return the payload with the TokenPayload interface
    const payload: TokenPayload = {
      id: decoded['id'],
      email: decoded['email'],
      tenantId: decoded['tenantId'],
      role: decoded['role'],
      permissions: decoded['permissions'],
      sessionId: decoded['sessionId']
    };
    
    return payload;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new UnauthorizedError('Token has expired', 'TOKEN_EXPIRED');
    } else if (error instanceof jwt.JsonWebTokenError) {
      throw new UnauthorizedError('Invalid token', 'INVALID_TOKEN');
    } else if (error instanceof UnauthorizedError) {
      throw error; // Pass through our custom errors
    }
    
    logger.error('Token verification error', { error });
    throw new UnauthorizedError('Token verification failed', 'TOKEN_VERIFICATION_FAILED');
  }
};

/**
 * Async version of token verification for use with async/await
 * @param token JWT token to verify
 * @returns Promise resolving to decoded token payload
 */
export const verifyAccessTokenAsync = async (token: string): Promise<TokenPayload> => {
  try {
    const decoded = await verifyAsync(token) as jwt.JwtPayload;
    
    if (decoded['type'] !== 'access') {
      throw new UnauthorizedError('Invalid token type', 'INVALID_TOKEN_TYPE');
    }
    
    return {
      id: decoded['id'],
      email: decoded['email'],
      tenantId: decoded['tenantId'],
      role: decoded['role'],
      permissions: decoded['permissions'],
      sessionId: decoded['sessionId']
    };
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new UnauthorizedError('Token has expired', 'TOKEN_EXPIRED');
    } else if (error instanceof jwt.JsonWebTokenError) {
      throw new UnauthorizedError('Invalid token', 'INVALID_TOKEN');
    } else if (error instanceof UnauthorizedError) {
      throw error;
    }
    
    throw new UnauthorizedError('Token verification failed', 'TOKEN_VERIFICATION_FAILED');
  }
};

/**
 * Verify JWT refresh token
 * @param token JWT refresh token to verify
 * @returns Decoded token payload (containing user ID and tenant ID)
 * @throws UnauthorizedError if token is invalid or expired
 */
export const verifyRefreshToken = (token: string): { id: number; tenantId: number; sessionId?: string; jti?: string } => {
  try {
    // Add verification options to ensure token is used as intended
    const options: jwt.VerifyOptions = {
      issuer: JWT_BASE_OPTIONS.issuer,
      audience: JWT_BASE_OPTIONS.audience,
      algorithms: [JWT_BASE_OPTIONS.algorithm as jwt.Algorithm]
    };
    
    const decoded = jwt.verify(token, env.JWT_REFRESH_SECRET, options) as jwt.JwtPayload;
      // Validate token type to prevent token substitution attacks
    if (decoded['type'] !== 'refresh') {
      logger.warn('Token type verification failed', { 
        expectedType: 'refresh', 
        receivedType: decoded['type'] 
      });
      throw new UnauthorizedError('Invalid token type', 'INVALID_TOKEN_TYPE');
    }
    
    // Return minimal payload needed for refresh operation
    return {
      id: decoded['id'],
      tenantId: decoded['tenantId'],
      sessionId: decoded['sessionId'],
      ...(decoded['jti'] && { jti: decoded['jti'] }) // JWT ID useful for token revocation
    };
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new UnauthorizedError('Refresh token has expired', 'REFRESH_TOKEN_EXPIRED');
    } else if (error instanceof jwt.JsonWebTokenError) {
      throw new UnauthorizedError('Invalid refresh token', 'INVALID_REFRESH_TOKEN');
    } else if (error instanceof UnauthorizedError) {
      throw error; // Pass through our custom errors
    }
    
    logger.error('Refresh token verification error', { error });
    throw new UnauthorizedError('Refresh token verification failed', 'REFRESH_TOKEN_VERIFICATION_FAILED');
  }
};

/**
 * Extract JWT token from authorization header
 * @param authHeader Authorization header value
 * @returns JWT token string
 * @throws UnauthorizedError if no token is found
 */
export const extractTokenFromHeader = (authHeader?: string): string => {
  if (!authHeader) {
    throw new UnauthorizedError('No authorization header provided', 'NO_AUTH_HEADER');
  }
  
  // Check for Bearer scheme
  if (!authHeader.startsWith('Bearer ')) {
    throw new UnauthorizedError('Invalid authorization scheme', 'INVALID_AUTH_SCHEME');
  }
  
  const token = authHeader.substring(7).trim(); // Remove 'Bearer ' prefix
  
  if (!token) {
    throw new UnauthorizedError('Empty token provided', 'EMPTY_TOKEN');
  }
  
  return token;
};

/**
 * Refresh access token using refresh token
 * @param refreshToken Valid refresh token
 * @param userData Additional user data to include in the new token
 * @returns New access token response
 * @throws UnauthorizedError if refresh token is invalid
 */
export const refreshAccessToken = (
  refreshToken: string,
  userData: Omit<TokenPayload, 'id' | 'tenantId'>
): TokenResponse => {
  // Verify the refresh token
  const { id, tenantId, sessionId } = verifyRefreshToken(refreshToken);
  
  // Check if token has been revoked (implementation would depend on your token blacklist mechanism)
  // This would typically involve checking a database or Redis cache
  // e.g. if (await isTokenRevoked(refreshToken)) { throw new UnauthorizedError(...); }
    // Generate new tokens, passing along the session ID for continuity
  return generateTokens({
    id,
    tenantId,
    ...(sessionId && { sessionId }),
    ...userData
  });
};

/**
 * Get token expiration time in seconds
 * @param token JWT token
 * @returns Time in seconds until token expires, or 0 if expired
 */
export const getTokenExpirationTime = (token: string): number => {
  try {
    const decoded = jwt.decode(token) as jwt.JwtPayload;
    if (!decoded || !decoded.exp) return 0;
    
    const now = Math.floor(Date.now() / 1000);
    const expiry = decoded.exp;
    
    return expiry > now ? expiry - now : 0;
  } catch (error) {
    logger.error('Error decoding token for expiration check', { error });
    return 0; // Return 0 for any error cases
  }
};

/**
 * Check if a token needs refresh based on a threshold
 * @param token JWT token to check
 * @param thresholdSeconds Seconds threshold before expiry to trigger refresh (default: 5 minutes)
 * @returns True if token should be refreshed, false otherwise
 */
export const shouldRefreshToken = (token: string, thresholdSeconds = 300): boolean => {
  const expirySeconds = getTokenExpirationTime(token);
  return expirySeconds > 0 && expirySeconds <= thresholdSeconds;
};

/**
 * Extract basic information from a token without verifying it
 * Useful for non-critical operations like logging or debugging
 * WARNING: This does not verify the token's signature and should NOT be used for authentication
 * 
 * @param token JWT token
 * @returns Basic token information or null if token is invalid
 */
export const getTokenInfo = (token: string): { 
  subject?: string; 
  userId?: number; 
  expiresAt?: Date; 
  issuedAt?: Date;
  type?: string;
} | null => {
  try {
    const decoded = jwt.decode(token) as jwt.JwtPayload;
    if (!decoded) return null;    // Extract user ID from subject claim (e.g., "user:123" -> 123)
    let userId: number | undefined;
    if (decoded.sub && decoded.sub.startsWith('user:')) {
      const idStr = decoded.sub.split(':')[1];
      if (idStr) {
        userId = parseInt(idStr, 10);
      }
    }
    
    const result: {
      subject?: string;
      userId?: number;
      expiresAt?: Date;
      issuedAt?: Date;
      type?: string;
    } = {};
    
    if (decoded.sub) result.subject = decoded.sub;
    if (userId || decoded['id']) result.userId = userId || decoded['id'];
    if (decoded.exp) result.expiresAt = new Date(decoded.exp * 1000);
    if (decoded.iat) result.issuedAt = new Date(decoded.iat * 1000);
    if (decoded['type']) result.type = decoded['type'] as string;
    
    return result;
  } catch (error) {
    logger.error('Error getting token info', { error });
    return null;
  }
};

/**
 * Security best practices implemented in this module:
 * 
 * 1. Limited token lifetimes - Access tokens expire quickly (15m default)
 * 2. Explicit algorithm specification to prevent algorithm switching attacks
 * 3. Token type verification to prevent token substitution attacks
 * 4. Comprehensive error handling with specific error codes
 * 5. JWT ID (jti) for refresh tokens to support token revocation
 * 6. Minimal payloads in refresh tokens for security
 * 7. Token validation includes issuer and audience verification
 * 8. Proper error logging with sensitive data handling
 * 9. Token type separation (access vs refresh) with distinct purposes
 * 10. Session ID support for token revocation during logout
 */
