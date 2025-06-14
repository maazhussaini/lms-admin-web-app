/**
 * @file services/auth.service.ts
 * @description Authentication service for user login, token management, and password operations
 */

import { PrismaClient, SystemUserStatus as PrismaSystemUserStatus } from '@prisma/client';
import { comparePassword, hashPassword } from '@/utils/password.utils';
import { 
  generateTokens, 
  verifyRefreshToken, 
  TokenPayload 
} from '@/utils/jwt.utils';
import { 
  UnauthorizedError, 
  NotFoundError, 
  BadRequestError 
} from '@/utils/api-error.utils';
import { TAuthResponse } from '@shared/types/api.types';
import { 
  LoginDto, 
  RefreshTokenDto, 
  ForgotPasswordDto, 
  ResetPasswordDto 
} from '@/dtos/auth/auth.dto';
import crypto from 'crypto';
import logger from '@/config/logger';
import { SystemUserRole, UserType } from '@/types/enums.types.js';

// Token blacklist - In production, this would be implemented with Redis
const TOKEN_BLACKLIST = new Set<string>();
const TOKEN_RESET_HASHES = new Map<string, { 
  userId: number, 
  hash: string, 
  expiresAt: Date 
}>();

export class AuthService {
  constructor(private prisma: PrismaClient) {}

  /**
   * Authenticate a system user and generate auth tokens
   * @param data Login credentials and optional tenant context
   * @returns Authentication response with tokens and user info
   */
  async loginUser(data: LoginDto): Promise<TAuthResponse> {
    const { email_address, password, tenant_context } = data;

    // Find user by email address, ensuring they are active
    const user = await this.prisma.systemUser.findFirst({
      where: {
        email_address,
        system_user_status: PrismaSystemUserStatus.ACTIVE,
        is_active: true,
        is_deleted: false
      },
      include: {
        role: {
          select: {
            role_id: true,
            role_name: true
          }
        }
      }
    });

    if (!user) {
      throw new UnauthorizedError('Invalid credentials', 'INVALID_CREDENTIALS');
    }

    // Check if account is locked due to too many failed attempts
    if (user.login_attempts && user.login_attempts >= 5) {
      throw new UnauthorizedError('Account is locked due to too many failed login attempts', 'ACCOUNT_LOCKED');
    }

    // Verify password
    const isPasswordValid = await comparePassword(password, user.password_hash);
    
    if (!isPasswordValid) {
      // Increment login attempts
      await this.prisma.systemUser.update({
        where: { system_user_id: user.system_user_id },
        data: { login_attempts: (user.login_attempts || 0) + 1 }
      });
      
      throw new UnauthorizedError('Invalid credentials', 'INVALID_CREDENTIALS');
    }

    // Check tenant context for SUPER_ADMIN users
    if (user.role_type === SystemUserRole.SUPER_ADMIN && tenant_context) {
      const tenant = await this.prisma.tenant.findFirst({
        where: {
          OR: [
            ...(isNaN(Number(tenant_context)) ? [] : [{ tenant_id: Number(tenant_context) }]),
            { tenant_name: tenant_context }
          ],
          is_active: true,
          is_deleted: false
        }
      });

      if (!tenant) {
        throw new NotFoundError('Tenant not found', 'TENANT_NOT_FOUND');
      }

      // SUPER_ADMIN logging into a specific tenant context
      user.tenant_id = tenant.tenant_id;
    }

    // Reset login attempts on successful login
    await this.prisma.systemUser.update({
      where: { system_user_id: user.system_user_id },
      data: {
        login_attempts: 0,
        last_login_at: new Date()
      }
    });

    // Fetch user permissions
    const permissions = await this.getUserPermissions(user.system_user_id, user.tenant_id);

    // Generate JWT tokens
    const tokenPayload: TokenPayload = {
      id: user.system_user_id,
      email: user.email_address,
      role: user.role.role_name,
      user_type: user.role_type as UserType, // Use enum for role type
      tenantId: user.tenant_id || 0, // 0 is a special case for SUPER_ADMIN with no tenant
      permissions
    };

    const tokens = generateTokens(tokenPayload);

    return {
      user: {
        id: user.system_user_id,
        username: user.username,
        full_name: user.full_name,
        email: user.email_address,
        role: {
          role_type: user.role_type as UserType,  // System users have role_type
          role_name: user.role.role_name
        },
        tenant_id: user.tenant_id || 0,
        user_type: user.role_type === UserType.SUPER_ADMIN ? UserType.SUPER_ADMIN : UserType.TENANT_ADMIN
      },
      tokens: {
        access_token: tokens.accessToken,
        refresh_token: tokens.refreshToken,
        expires_in: tokens.expiresIn,
        token_type: 'Bearer'
      },
      permissions
    };
  }

  /**
   * Refresh user's access token using a valid refresh token
   * @param data Refresh token DTO
   * @returns New authentication response
   */
  async refreshUserToken(data: RefreshTokenDto): Promise<TAuthResponse> {
    const { refreshToken } = data;

    // Check if token is blacklisted
    if (TOKEN_BLACKLIST.has(refreshToken)) {
      throw new UnauthorizedError('Token has been revoked', 'TOKEN_REVOKED');
    }

    try {
      // Verify the refresh token
      const tokenData = verifyRefreshToken(refreshToken);
      
      // Get user from database
      const user = await this.prisma.systemUser.findFirst({
        where: {
          system_user_id: tokenData.id,
          system_user_status: PrismaSystemUserStatus.ACTIVE,
          is_active: true,
          is_deleted: false
        },
        include: {
          role: {
            select: {
              role_id: true,
              role_name: true
            }
          }
        }
      });

      if (!user) {
        throw new NotFoundError('User not found', 'USER_NOT_FOUND');
      }

      // Fetch user permissions
      const permissions = await this.getUserPermissions(user.system_user_id, user.tenant_id);

      // Generate new tokens
      const tokenPayload: TokenPayload = {
        id: user.system_user_id,
        email: user.email_address,
        role: user.role.role_name,
        user_type: user.role_type as UserType, // Use enum for role type
        tenantId: user.tenant_id || 0,
        permissions
      };

      const tokens = generateTokens(tokenPayload);

      // Add old refresh token to blacklist
      TOKEN_BLACKLIST.add(refreshToken);
      
      // Auto-cleanup blacklist after token would have expired anyway
      setTimeout(() => {
        TOKEN_BLACKLIST.delete(refreshToken);
      }, 7 * 24 * 60 * 60 * 1000); // 7 days

      return {
        user: {
          id: user.system_user_id,
          username: user.username,
          full_name: user.full_name,
          email: user.email_address,
          role: {
            role_type: user.role_type as UserType,  // System users have role_type
            role_name: user.role.role_name
          },
          tenant_id: user.tenant_id || 0,
          user_type: user.role_type === UserType.SUPER_ADMIN ? UserType.SUPER_ADMIN : UserType.TENANT_ADMIN
        },
        tokens: {
          access_token: tokens.accessToken,
          refresh_token: tokens.refreshToken,
          expires_in: tokens.expiresIn,
          token_type: 'Bearer'
        },
        permissions
      };
    } catch (error) {
      if (error instanceof UnauthorizedError) {
        throw error;
      }
      throw new UnauthorizedError('Invalid refresh token', 'INVALID_REFRESH_TOKEN');
    }
  }

  /**
   * Log out a user by blacklisting their refresh token
   * @param userId User ID
   * @param token Refresh token to blacklist
   */
  async logoutUser(userId: number, token: string): Promise<void> {
    if (!token) {
      throw new BadRequestError('Token is required', 'TOKEN_REQUIRED');
    }

    // Check if user exists
    const user = await this.prisma.systemUser.findUnique({
      where: { system_user_id: userId }
    });

    if (!user) {
      throw new NotFoundError('User not found', 'USER_NOT_FOUND');
    }

    // Add token to blacklist
    TOKEN_BLACKLIST.add(token);
    
    // Auto-cleanup blacklist after token would have expired anyway
    setTimeout(() => {
      TOKEN_BLACKLIST.delete(token);
    }, 7 * 24 * 60 * 60 * 1000); // 7 days
    
    logger.info(`User ${userId} logged out`);
  }

  /**
   * Initiate password reset process
   * @param data User's email address
   */
  async initiatePasswordReset(data: ForgotPasswordDto): Promise<void> {
    const { email_address } = data;

    // Find user by email
    const user = await this.prisma.systemUser.findFirst({
      where: {
        email_address,
        is_active: true,
        is_deleted: false
      }
    });

    // For security reasons, don't reveal if email exists or not
    if (!user) {
      // Log the attempt but return success to prevent email enumeration
      logger.info(`Password reset requested for non-existent email: ${email_address}`);
      return;
    }

    // Generate a secure random token
    const resetToken = crypto.randomBytes(32).toString('hex');
    
    // Hash the token for storage
    const tokenHash = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');

    // Set expiration time (1 hour from now)
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1);

    // Store token information (in a real app, this would go in the database)
    TOKEN_RESET_HASHES.set(tokenHash, {
      userId: user.system_user_id,
      hash: tokenHash,
      expiresAt
    });

    // Auto-cleanup expired tokens
    setTimeout(() => {
      TOKEN_RESET_HASHES.delete(tokenHash);
    }, 60 * 60 * 1000); // 1 hour

    // In a real application, send an email to the user with the reset link
    logger.info(`Password reset token generated for user ${user.username} (${email_address}): ${resetToken}`);
    logger.info(`Reset URL would be: /reset-password?token=${resetToken}`);
  }

  /**
   * Complete password reset process
   * @param data Reset token and new password
   */
  async finalizePasswordReset(data: ResetPasswordDto): Promise<void> {
    const { token, newPassword } = data;

    // Hash the provided token to compare with stored hash
    const tokenHash = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    // Get the reset token data
    const resetData = TOKEN_RESET_HASHES.get(tokenHash);

    if (!resetData) {
      throw new BadRequestError('Invalid or expired password reset token', 'INVALID_RESET_TOKEN');
    }

    // Check if token is expired
    if (new Date() > resetData.expiresAt) {
      TOKEN_RESET_HASHES.delete(tokenHash);
      throw new BadRequestError('Password reset token has expired', 'EXPIRED_RESET_TOKEN');
    }

    // Find the user
    const user = await this.prisma.systemUser.findFirst({
      where: {
        system_user_id: resetData.userId,
        is_active: true,
        is_deleted: false
      }
    });

    if (!user) {
      throw new NotFoundError('User not found', 'USER_NOT_FOUND');
    }

    // Hash the new password
    const passwordHash = await hashPassword(newPassword);

    // Update the user's password
    await this.prisma.systemUser.update({
      where: { system_user_id: user.system_user_id },
      data: {
        password_hash: passwordHash,
        login_attempts: 0, // Reset login attempts
        system_user_status: PrismaSystemUserStatus.ACTIVE, // Ensure account is active
        updated_at: new Date(),
        updated_by: user.system_user_id, // Self-update
        updated_ip: '127.0.0.1' // Would be captured from request in real implementation
      }
    });

    // Remove the used token
    TOKEN_RESET_HASHES.delete(tokenHash);

    logger.info(`Password reset completed for user ${user.username}`);
  }

  /**
   * Get user's effective permissions
   * @param userId User ID
   * @param tenantId Tenant ID
   * @returns Array of permission strings
   */
  private async getUserPermissions(userId: number, tenantId?: number | null): Promise<string[]> {
    // If no tenant ID for SUPER_ADMIN, return all permissions
    if (!tenantId) {
      return ['*']; // SUPER_ADMIN has all permissions
    }

    try {
      // Get user-specific permissions first
      const userScreens = await this.prisma.userScreen.findMany({
        where: {
          system_user_id: userId,
          tenant_id: tenantId,
          is_active: true,
          is_deleted: false
        },
        include: {
          screen: true
        }
      });

      // Get role-based permissions
      const user = await this.prisma.systemUser.findUnique({
        where: { system_user_id: userId }
      });

      if (!user) {
        return [];
      }

      const roleScreens = await this.prisma.roleScreen.findMany({
        where: {
          role_type: user.role_type,
          tenant_id: tenantId,
          is_active: true,
          is_deleted: false
        },
        include: {
          screen: true
        }
      });

      // Map screens to permission strings based on access levels
      // User permissions override role permissions
      const permissionMap = new Map<string, string[]>();

      // Process role screens first
      roleScreens.forEach(rs => {
        const screenKey = rs.screen.route_path || rs.screen.screen_name;
        const permissions = [];
        
        if (rs.can_view) permissions.push('view');
        if (rs.can_create) permissions.push('create');
        if (rs.can_edit) permissions.push('edit');
        if (rs.can_delete) permissions.push('delete');
        if (rs.can_export) permissions.push('export');
        
        permissionMap.set(screenKey, permissions);
      });

      // Override with user-specific permissions
      userScreens.forEach(us => {
        const screenKey = us.screen.route_path || us.screen.screen_name;
        const permissions = [];
        
        if (us.can_view) permissions.push('view');
        if (us.can_create) permissions.push('create');
        if (us.can_edit) permissions.push('edit');
        if (us.can_delete) permissions.push('delete');
        if (us.can_export) permissions.push('export');
        
        permissionMap.set(screenKey, permissions);
      });

      // Format permissions as "resource:action"
      const formattedPermissions: string[] = [];
      
      permissionMap.forEach((actions, resource) => {
        actions.forEach(action => {
          formattedPermissions.push(`${resource}:${action}`);
        });
      });

      return formattedPermissions;
    } catch (error) {
      logger.error('Error fetching user permissions', { error, userId, tenantId });
      return [];
    }
  }
}

export default AuthService;
