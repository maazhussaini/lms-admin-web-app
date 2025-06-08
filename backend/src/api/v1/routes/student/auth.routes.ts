/**
 * @file api/v1/routes/student/auth.routes.ts
 * @description Authentication routes for student users
 */

import { Router } from 'express';
import { validate } from '@/middleware/validation.middleware';
import { authenticate } from '@/middleware/auth.middleware';
import { StudentAuthController } from '@/controllers/student-auth.controller';
import {
  studentLoginValidation,
  studentRefreshTokenValidation,
  studentForgotPasswordValidation,
  studentResetPasswordValidation
} from '@/dtos/auth/student-auth.dto';
import rateLimit from 'express-rate-limit';
import env from '@/config/environment';

const router = Router();

// Rate limiter for login attempts - 5 attempts per 15 minutes
const loginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    statusCode: 429,
    message: 'Too many login attempts, please try again later',
    errorCode: 'RATE_LIMIT_EXCEEDED',
    timestamp: new Date().toISOString()
  },
  skip: () => env.NODE_ENV === 'development',
});

// Rate limiter for password reset requests - 3 attempts per 60 minutes
const passwordResetRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 3,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    statusCode: 429,
    message: 'Too many password reset requests, please try again later',
    errorCode: 'RATE_LIMIT_EXCEEDED',
    timestamp: new Date().toISOString()
  },
  skip: () => env.NODE_ENV === 'development',
});

/**
 * @route POST /api/v1/student/auth/login
 * @desc Authenticate student user and get tokens
 * @access Public
 */
router.post(
  '/login',
  loginRateLimiter,
  validate(studentLoginValidation),
  StudentAuthController.loginHandler
);

/**
 * @route POST /api/v1/student/auth/refresh
 * @desc Refresh access token using refresh token
 * @access Public
 */
router.post(
  '/refresh',
  validate(studentRefreshTokenValidation),
  StudentAuthController.refreshTokenHandler
);

/**
 * @route POST /api/v1/student/auth/logout
 * @desc Logout student and invalidate tokens
 * @access Private
 */
router.post(
  '/logout',
  authenticate,
  StudentAuthController.logoutHandler
);

/**
 * @route POST /api/v1/student/auth/forgot-password
 * @desc Request password reset link
 * @access Public
 */
router.post(
  '/forgot-password',
  passwordResetRateLimiter,
  validate(studentForgotPasswordValidation),
  StudentAuthController.forgotPasswordHandler
);

/**
 * @route POST /api/v1/student/auth/reset-password
 * @desc Reset password with token
 * @access Public
 */
router.post(
  '/reset-password',
  validate(studentResetPasswordValidation),
  StudentAuthController.resetPasswordHandler
);

export default router;
