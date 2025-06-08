/**
 * @file controllers/auth.controller.ts
 * @description Authentication controller for handling user login, token refresh, and password operations
 */

import { Request, Response, NextFunction } from 'express';
import { AuthService } from '@/services/auth.service';
import { asyncHandler } from '@/utils/async-handler.utils';
import { createSuccessResponse } from '@/utils/api-response.utils';
import { extractTokenFromHeader } from '@/utils/jwt.utils';
import { BadRequestError } from '@/utils/api-error.utils';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const authService = new AuthService(prisma);

export class AuthController {
  /**
   * Handle user login
   * @route POST /api/v1/auth/login
   */
  static loginHandler = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const loginData = req.validatedData || req.body;
    
    const authResponse = await authService.loginUser(loginData);
    
    return res.status(200).json(
      createSuccessResponse(
        authResponse,
        'Login successful',
        200,
        undefined,
        req.id
      )
    );
  });

  /**
   * Handle token refresh
   * @route POST /api/v1/auth/refresh
   */
  static refreshTokenHandler = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const refreshData = req.validatedData || req.body;
    
    const authResponse = await authService.refreshUserToken(refreshData);
    
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
   * Handle user logout
   * @route POST /api/v1/auth/logout
   */
  static logoutHandler = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    if (!req.user || !req.user.id) {
      throw new BadRequestError('User not authenticated', 'USER_NOT_AUTHENTICATED');
    }
    
    const userId = req.user.id;
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      throw new BadRequestError('Authorization header missing', 'AUTH_HEADER_MISSING');
    }
    
    const token = extractTokenFromHeader(authHeader);
    
    await authService.logoutUser(userId, token);
    
    return res.status(200).json(
      createSuccessResponse(
        null,
        'Logout successful',
        200,
        undefined,
        req.id
      )
    );
  });

  /**
   * Handle forgot password request
   * @route POST /api/v1/auth/forgot-password
   */
  static forgotPasswordHandler = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const forgotPasswordData = req.validatedData || req.body;
    
    await authService.initiatePasswordReset(forgotPasswordData);
    
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
   * @route POST /api/v1/auth/reset-password
   */
  static resetPasswordHandler = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const resetPasswordData = req.validatedData || req.body;
    
    await authService.finalizePasswordReset(resetPasswordData);
    
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

export default AuthController;
