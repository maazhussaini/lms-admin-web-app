/**
 * @file utils/jwt.utils.ts
 * @description JWT token generation and verification utilities.
 */

import * as jwt from 'jsonwebtoken';
import env from '@/config/environment.js';
import { UnauthorizedError } from './api-error.utils.js';

/**
 * User payload structure for JWT token
 */
export interface TokenPayload {
  id: number;
  email: string;
  tenantId: number;
  role: string;
  permissions?: string[];
}

/**
 * Token response structure
 */
export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number; // seconds
}

/**
 * Generate JWT access token
 * @param payload User data to include in the token
 * @param expiresIn Token expiration time (default: from env or 1 hour)
 * @returns JWT access token string
 */
export const generateAccessToken = (
  payload: TokenPayload,
  expiresIn: string | number = env.JWT_EXPIRES_IN || '1h'
): string => {
  const options: jwt.SignOptions = {
    expiresIn: expiresIn as jwt.SignOptions['expiresIn'],
    issuer: env.JWT_ISSUER || 'lms-admin',
    audience: env.JWT_AUDIENCE || 'lms-client'
  };
  return jwt.sign(payload, env.JWT_SECRET, options);
};

/**
 * Generate JWT refresh token
 * @param userId User ID to include in the token
 * @param tenantId Tenant ID to include in the token
 * @param expiresIn Token expiration time (default: from env or 7 days)
 * @returns JWT refresh token string
 */
export const generateRefreshToken = (
  userId: number,
  tenantId: number,
  expiresIn: string | number = env.JWT_REFRESH_EXPIRES_IN || '7d'
): string => {
  const options: jwt.SignOptions = {
    expiresIn: expiresIn as jwt.SignOptions['expiresIn'],
    issuer: env.JWT_ISSUER || 'lms-admin',
    audience: env.JWT_AUDIENCE || 'lms-client'
  };
  return jwt.sign({ id: userId, tenantId }, env.JWT_REFRESH_SECRET, options);
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
    expiresIn
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
    const decoded = jwt.verify(token, env.JWT_SECRET) as TokenPayload;
    return decoded;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new UnauthorizedError('Token has expired', 'TOKEN_EXPIRED');
    } else if (error instanceof jwt.JsonWebTokenError) {
      throw new UnauthorizedError('Invalid token', 'INVALID_TOKEN');
    }
    throw new UnauthorizedError('Token verification failed', 'TOKEN_VERIFICATION_FAILED');
  }
};

/**
 * Verify JWT refresh token
 * @param token JWT refresh token to verify
 * @returns Decoded token payload (containing user ID)
 * @throws UnauthorizedError if token is invalid or expired
 */
export const verifyRefreshToken = (token: string): { id: number; tenantId: number } => {
  try {
    const decoded = jwt.verify(token, env.JWT_REFRESH_SECRET) as { id: number; tenantId: number };
    return decoded;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new UnauthorizedError('Refresh token has expired', 'REFRESH_TOKEN_EXPIRED');
    } else if (error instanceof jwt.JsonWebTokenError) {
      throw new UnauthorizedError('Invalid refresh token', 'INVALID_REFRESH_TOKEN');
    }
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
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new UnauthorizedError('No token provided', 'NO_TOKEN_PROVIDED');
  }
  
  return authHeader.substring(7); // Remove 'Bearer ' prefix
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
  const { id, tenantId } = verifyRefreshToken(refreshToken);
  
  // Generate new tokens
  return generateTokens({
    id,
    tenantId,
    ...userData
  });
};
