/**
 * @file dtos/auth/auth.dto.ts
 * @description Data Transfer Objects for authentication operations
 */

import { check, ValidationChain } from 'express-validator';

/**
 * Login DTO for authentication
 */
export interface LoginDto {
  email_address: string; // Changed from username to email_address for consistency
  password: string;
  tenant_context?: string;
  tenant_domain?:string;
}

/**
 * Refresh token DTO
 */
export interface RefreshTokenDto {
  refreshToken: string;
}

/**
 * Forgot password DTO
 */
export interface ForgotPasswordDto {
  email_address: string;
}

/**
 * Reset password DTO
 */
export interface ResetPasswordDto {
  token: string;
  newPassword: string;
}

/**
 * Validation chains for login DTO
 */
export const loginValidation: ValidationChain[] = [
  check('email_address')
    .notEmpty()
    .withMessage('Email address is required')
    .isEmail()
    .withMessage('Must be a valid email address')
    .normalizeEmail({ gmail_remove_dots: false, all_lowercase: true })
    .trim(),
  check('password')
    .notEmpty()
    .withMessage('Password is required')
    .isString()
    .withMessage('Password must be a string'),
  check('tenant_context')
    .optional()
    .isString()
    .withMessage('Tenant context must be a string')
    .trim(),
];

/**
 * Validation chains for refresh token DTO
 */
export const refreshTokenValidation: ValidationChain[] = [
  check('refreshToken')
    .notEmpty()
    .withMessage('Refresh token is required')
    .isString()
    .withMessage('Refresh token must be a string')
    .trim(),
];

/**
 * Validation chains for forgot password DTO
 */
export const forgotPasswordValidation: ValidationChain[] = [
  check('email_address')
    .notEmpty()
    .withMessage('Email address is required')
    .isEmail()
    .withMessage('Must be a valid email address')
    .normalizeEmail({ gmail_remove_dots: false, all_lowercase: true }),
];

/**
 * Validation chains for reset password DTO
 */
export const resetPasswordValidation: ValidationChain[] = [
  check('token')
    .notEmpty()
    .withMessage('Token is required')
    .isString()
    .withMessage('Token must be a string')
    .trim(),
  check('newPassword')
    .notEmpty()
    .withMessage('New password is required')
    .isString()
    .withMessage('New password must be a string')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage(
      'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
    ),
];
