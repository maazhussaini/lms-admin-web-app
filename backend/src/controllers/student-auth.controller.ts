/**
 * @file controllers/student-auth.controller.ts
 * @description Controller for handling student authentication requests
 */

import { Request, Response, NextFunction } from 'express';
import { StudentAuthService } from '@/services/student-auth.service';
import { asyncHandler } from '@/utils/async-handler.utils';
import { createSuccessResponse } from '@/utils/api-response.utils';
import { extractTokenFromHeader } from '@/utils/jwt.utils';
import { BadRequestError } from '@/utils/api-error.utils';
import prisma from '@/config/database';


const studentAuthService = new StudentAuthService(prisma);

export class StudentAuthController {
  /**
   * Handle student login
   * @route POST /api/v1/auth/student/login
   */
  static loginHandler = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const loginData = req.validatedData || req.body;
    
    const authResponse = await studentAuthService.loginStudent(loginData);
    
    return res.status(200).json(
      createSuccessResponse(
        authResponse,
        'Student login successful',
        200,
        undefined,
        req.id
      )
    );
  });

  /**
   * Handle token refresh
   * @route POST /api/v1/auth/student/refresh
   */
  static refreshTokenHandler = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const refreshData = req.validatedData || req.body;
    
    const authResponse = await studentAuthService.refreshStudentToken(refreshData);
    
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
   * Handle student logout
   * @route POST /api/v1/auth/student/logout
   */
  static logoutHandler = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    if (!req.user || !req.user.id) {
      throw new BadRequestError('User not authenticated', 'USER_NOT_AUTHENTICATED');
    }
    
    const studentId = req.user.id;
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      throw new BadRequestError('Authorization header missing', 'AUTH_HEADER_MISSING');
    }
    
    const token = extractTokenFromHeader(authHeader);
    
    await studentAuthService.logoutStudent(studentId, token);
    
    return res.status(200).json(
      createSuccessResponse(
        null,
        'Student logout successful',
        200,
        undefined,
        req.id
      )
    );
  });

  /**
   * Handle forgot password request
   * @route POST /api/v1/auth/student/forgot-password
   */
  static forgotPasswordHandler = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const forgotPasswordData = req.validatedData || req.body;
    
    await studentAuthService.initiateStudentPasswordReset(forgotPasswordData);
    
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
   * @route POST /api/v1/auth/student/reset-password
   */
  static resetPasswordHandler = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const resetPasswordData = req.validatedData || req.body;
    
    await studentAuthService.finalizeStudentPasswordReset(resetPasswordData);
    
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

export default StudentAuthController;
