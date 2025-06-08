/**
 * @file api/v1/routes/teacher/auth.routes.ts
 * @description Authentication routes for teacher users
 */

import { Router } from 'express';
import { validate } from '@/middleware/validation.middleware';
import { authenticate } from '@/middleware/auth.middleware';
import { TeacherAuthController } from '@/controllers/teacher-auth.controller';
import {
  teacherLoginValidation,
  teacherRefreshTokenValidation,
  teacherForgotPasswordValidation,
  teacherResetPasswordValidation
} from '@/dtos/auth/teacher-auth.dto';
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
 * @route POST /api/v1/teacher/auth/login
 * @desc Authenticate teacher user and get tokens
 * @access Public
 */
router.post(
  '/login',
  loginRateLimiter,
  validate(teacherLoginValidation),
  TeacherAuthController.loginHandler
);

/**
 * @route POST /api/v1/teacher/auth/refresh
 * @desc Refresh access token using refresh token
 * @access Public
 */
router.post(
  '/refresh',
  validate(teacherRefreshTokenValidation),
  TeacherAuthController.refreshTokenHandler
);

/**
 * @route POST /api/v1/teacher/auth/logout
 * @desc Logout teacher and invalidate tokens
 * @access Private
 */
router.post(
  '/logout',
  authenticate,
  TeacherAuthController.logoutHandler
);

/**
 * @route POST /api/v1/teacher/auth/forgot-password
 * @desc Request password reset link
 * @access Public
 */
router.post(
  '/forgot-password',
  passwordResetRateLimiter,
  validate(teacherForgotPasswordValidation),
  TeacherAuthController.forgotPasswordHandler
);

/**
 * @route POST /api/v1/teacher/auth/reset-password
 * @desc Reset password with token
 * @access Public
 */
router.post(
  '/reset-password',
  validate(teacherResetPasswordValidation),
  TeacherAuthController.resetPasswordHandler
);

export default router;
