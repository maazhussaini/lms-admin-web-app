/**
 * @file controllers/teacher-auth.controller.ts
 * @description Controller for handling teacher authentication requests
 */

import { Request, Response, NextFunction } from 'express';
import { TeacherAuthService } from '@/services/teacher-auth.service';
import { asyncHandler } from '@/utils/async-handler.utils';
import { createSuccessResponse } from '@/utils/api-response.utils';
import { extractTokenFromHeader } from '@/utils/jwt.utils';
import { BadRequestError } from '@/utils/api-error.utils';
import prisma from '@/config/database';


const teacherAuthService = new TeacherAuthService(prisma);

export class TeacherAuthController {
  /**
   * Handle teacher login
   * @route POST /api/v1/teacher/auth/login
   */
  static loginHandler = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const loginData = req.validatedData || req.body;
    
    const authResponse = await teacherAuthService.loginTeacher(loginData);
    
    return res.status(200).json(
      createSuccessResponse(
        authResponse,
        'Teacher login successful',
        200,
        undefined,
        req.id
      )
    );
  });

  /**
   * Handle token refresh
   * @route POST /api/v1/teacher/auth/refresh
   */
  static refreshTokenHandler = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const refreshData = req.validatedData || req.body;
    
    const authResponse = await teacherAuthService.refreshTeacherToken(refreshData);
    
    return res.status(200).json(
      createSuccessResponse(
        authResponse,
        'Token refreshed successfully',
        200,
        undefined,
        req.id
      )
    );
  });

  /**
   * Handle teacher logout
   * @route POST /api/v1/teacher/auth/logout
   */
  static logoutHandler = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    if (!req.user || !req.user.id) {
      throw new BadRequestError('User not authenticated', 'USER_NOT_AUTHENTICATED');
    }
    
    const teacherId = req.user.id;
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      throw new BadRequestError('Authorization header missing', 'AUTH_HEADER_MISSING');
    }
    
    const token = extractTokenFromHeader(authHeader);
    
    await teacherAuthService.logoutTeacher(teacherId, token);
    
    return res.status(200).json(
      createSuccessResponse(
        null,
        'Teacher logout successful',
        200,
        undefined,
        req.id
      )
    );
  });

  /**
   * Handle forgot password request
   * @route POST /api/v1/teacher/auth/forgot-password
   */
  static forgotPasswordHandler = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const forgotPasswordData = req.validatedData || req.body;
    
    await teacherAuthService.initiateTeacherPasswordReset(forgotPasswordData);
    
    // Always return success to prevent email enumeration
    return res.status(200).json(
      createSuccessResponse(
        null,
        'Password reset instructions have been sent to your email if the account exists',
        200,
        undefined,
        req.id
      )
    );
  });

  /**
   * Handle password reset
   * @route POST /api/v1/teacher/auth/reset-password
   */
  static resetPasswordHandler = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const resetPasswordData = req.validatedData || req.body;
    
    await teacherAuthService.finalizeTeacherPasswordReset(resetPasswordData);
    
    return res.status(200).json(
      createSuccessResponse(
        null,
        'Password has been reset successfully',
        200,
        undefined,
        req.id
      )
    );
  });
}

export default TeacherAuthController;
