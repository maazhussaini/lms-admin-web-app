/**
 * @file controllers/auth.controller.ts
 * @description Universal authentication controller for system users and teachers
 */

import { Request, Response, NextFunction } from 'express';
import { AuthService } from '@/services/auth.service';
import { asyncHandler } from '@/utils/async-handler.utils';
import { createSuccessResponse } from '@/utils/api-response.utils';
import { extractTokenFromHeader } from '@/utils/jwt.utils';
import { BadRequestError } from '@/utils/api-error.utils';
import prisma from '@/config/database';


const authService = new AuthService(prisma);

export class AuthController {
  
  /**
   * Handle universal login for admins and teachers
   * @route POST /api/v1/auth/login
   */
  static loginHandler = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const loginData = req.validatedData || req.body;
    // Log domain information for debugging
    const domain = req.headers['x-original-host'] || req.headers['x-forwarded-host'] || req.headers.host;
    console.log(`Login attempt from domain: ${domain}`);
    loginData.tenant_domain = domain as string;
    
    // Pass request object to auth service for domain extraction
    const authResponse = await authService.loginUser(loginData, req);
    
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
   * Handle universal token refresh
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
   * Handle universal user logout
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
   * Handle universal forgot password request
   * @route POST /api/v1/auth/forgot-password
   */
  static forgotPasswordHandler = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const forgotPasswordData = req.validatedData || req.body;
    
    // Pass request object for domain-based tenant resolution
    await authService.initiatePasswordReset(forgotPasswordData, req);
    
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
   * Handle universal password reset
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
