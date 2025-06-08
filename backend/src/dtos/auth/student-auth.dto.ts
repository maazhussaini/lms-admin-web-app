/**
 * @file dtos/auth/student-auth.dto.ts
 * @description Data Transfer Objects for student authentication operations
 */

import { check, ValidationChain } from 'express-validator';

/**
 * Student Login DTO for authentication
 */
export interface StudentLoginDto {
  username: string;
  password: string;
  tenant_context?: string; // For multi-tenant support
}

/**
 * Student Refresh token DTO
 */
export interface StudentRefreshTokenDto {
  refreshToken: string;
}

/**
 * Student Forgot password DTO
 */
export interface StudentForgotPasswordDto {
  username: string;
}

/**
 * Student Reset password DTO
 */
export interface StudentResetPasswordDto {
  token: string;
  newPassword: string;
}

/**
 * Validation chains for student login DTO
 */
export const studentLoginValidation: ValidationChain[] = [
  check('username')
    .notEmpty()
    .withMessage('Username is required')
    .isString()
    .withMessage('Username must be a string')
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
 * Validation chains for student refresh token DTO
 */
export const studentRefreshTokenValidation: ValidationChain[] = [
  check('refreshToken')
    .notEmpty()
    .withMessage('Refresh token is required')
    .isString()
    .withMessage('Refresh token must be a string')
    .trim(),
];

/**
 * Validation chains for student forgot password DTO
 */
export const studentForgotPasswordValidation: ValidationChain[] = [
  check('username')
    .notEmpty()
    .withMessage('Username is required')
    .isString()
    .withMessage('Username must be a string')
    .trim(),
];

/**
 * Validation chains for student reset password DTO
 */
export const studentResetPasswordValidation: ValidationChain[] = [
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
