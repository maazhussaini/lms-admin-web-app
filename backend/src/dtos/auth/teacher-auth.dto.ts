/**
 * @file dtos/auth/teacher-auth.dto.ts
 * @description Data Transfer Objects for teacher authentication operations
 */

import { check, ValidationChain } from 'express-validator';

/**
 * Teacher Login DTO for authentication
 */
export interface TeacherLoginDto {
  email_address: string;
  password: string;
  tenant_context?: string; // For multi-tenant support
}

/**
 * Teacher Refresh token DTO
 */
export interface TeacherRefreshTokenDto {
  refreshToken: string;
}

/**
 * Teacher Forgot password DTO
 */
export interface TeacherForgotPasswordDto {
  email_address: string;
}

/**
 * Teacher Reset password DTO
 */
export interface TeacherResetPasswordDto {
  token: string;
  newPassword: string;
}

/**
 * Validation chains for teacher login DTO
 */
export const teacherLoginValidation: ValidationChain[] = [
  check('email_address')
    .notEmpty()
    .withMessage('Email address is required')
    .isEmail()
    .withMessage('Must be a valid email address')
    .normalizeEmail({ gmail_remove_dots: false, all_lowercase: true }),
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
 * Validation chains for teacher refresh token DTO
 */
export const teacherRefreshTokenValidation: ValidationChain[] = [
  check('refreshToken')
    .notEmpty()
    .withMessage('Refresh token is required')
    .isString()
    .withMessage('Refresh token must be a string')
    .trim(),
];

/**
 * Validation chains for teacher forgot password DTO
 */
export const teacherForgotPasswordValidation: ValidationChain[] = [
  check('email_address')
    .notEmpty()
    .withMessage('Email address is required')
    .isEmail()
    .withMessage('Must be a valid email address')
    .normalizeEmail({ gmail_remove_dots: false, all_lowercase: true }),
];

/**
 * Validation chains for teacher reset password DTO
 */
export const teacherResetPasswordValidation: ValidationChain[] = [
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
