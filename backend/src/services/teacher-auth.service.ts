/**
 * @file services/teacher-auth.service.ts
 * @description Authentication service for teacher users
 */

import { PrismaClient } from '@prisma/client';
import { comparePassword, hashPassword } from '@/utils/password.utils';
import { 
  generateTokens, 
  verifyRefreshToken, 
  TokenPayload 
} from '@/utils/jwt.utils';
import { 
  UnauthorizedError, 
  NotFoundError, 
  ForbiddenError, 
  BadRequestError 
} from '@/utils/api-error.utils';
import { TAuthResponse } from '@shared/types/api.types';
import { 
  TeacherLoginDto, 
  TeacherRefreshTokenDto, 
  TeacherForgotPasswordDto, 
  TeacherResetPasswordDto 
} from '@/dtos/auth/teacher-auth.dto';
import crypto from 'crypto';
import logger from '@/config/logger';

// Token blacklist - In production, this would be implemented with Redis
const TEACHER_TOKEN_BLACKLIST = new Set<string>();
const TEACHER_TOKEN_RESET_HASHES = new Map<string, { 
  teacherId: number, 
  hash: string, 
  expiresAt: Date 
}>();

export class TeacherAuthService {
  constructor(private prisma: PrismaClient) {}

  /**
   * Authenticate a teacher user and generate auth tokens
   * @param data Login credentials and optional tenant context
   * @returns Authentication response with tokens and user info
   */
  async loginTeacher(data: TeacherLoginDto): Promise<TAuthResponse> {
    const { email_address, password, tenant_context } = data;

    // Find teacher email first, then get the teacher record
    const teacherEmail = await this.prisma.teacherEmailAddress.findFirst({
      where: {
        email_address,
        is_active: true,
        is_deleted: false
      },
      include: {
        teacher: true
      }
    });

    // If no email found or associated teacher is inactive/deleted
    if (!teacherEmail || !teacherEmail.teacher || !teacherEmail.teacher.is_active || teacherEmail.teacher.is_deleted) {
      throw new UnauthorizedError('Invalid credentials', 'INVALID_CREDENTIALS');
    }

    const teacher = teacherEmail.teacher;

    // Verify password
    const isPasswordValid = await comparePassword(password, teacher.password_hash);
    
    if (!isPasswordValid) {
      // Log failed login attempt
      logger.info(`Failed login attempt for teacher email: ${email_address}`);
      
      throw new UnauthorizedError('Invalid credentials', 'INVALID_CREDENTIALS');
    }

    // Check tenant context if provided
    if (tenant_context && teacher.tenant_id.toString() !== tenant_context) {
      throw new ForbiddenError('Teacher does not belong to the specified tenant', 'TENANT_MISMATCH');
    }

    // Update last login timestamp
    await this.prisma.teacher.update({
      where: { teacher_id: teacher.teacher_id },
      data: {
        last_login_at: new Date()
      }
    });

    // Get teacher permissions
    const permissions = await this.getTeacherPermissions(teacher.teacher_id, teacher.tenant_id);

    // Get primary email for teacher using the helper method
    const primaryEmail = await this.getPrimaryEmail(teacher.teacher_id);

    // Generate JWT tokens
    const tokenPayload: TokenPayload = {
      id: teacher.teacher_id,
      email: primaryEmail || teacher.username,
      role: 'TEACHER',
      tenantId: teacher.tenant_id,
      permissions
    };

    const tokens = generateTokens(tokenPayload);

    return {
      user: {
        id: teacher.teacher_id,
        username: teacher.username,
        full_name: teacher.full_name,
        email: primaryEmail || teacher.username,
        role: {
          role_id: 0, // Teachers don't have traditional roles like admins
          role_name: 'TEACHER'
        },
        tenant_id: teacher.tenant_id,
        user_type: 'TEACHER'
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
   * Refresh teacher's access token using a valid refresh token
   * @param data Refresh token DTO
   * @returns New authentication response
   */
  async refreshTeacherToken(data: TeacherRefreshTokenDto): Promise<TAuthResponse> {
    const { refreshToken } = data;

    // Check if token is blacklisted
    if (TEACHER_TOKEN_BLACKLIST.has(refreshToken)) {
      throw new UnauthorizedError('Token has been revoked', 'TOKEN_REVOKED');
    }

    try {
      // Verify the refresh token
      const tokenData = verifyRefreshToken(refreshToken);
      
      // Get teacher from database
      const teacher = await this.prisma.teacher.findFirst({
        where: {
          teacher_id: tokenData.id,
          is_active: true,
          is_deleted: false
        }
      });

      if (!teacher) {
        throw new NotFoundError('Teacher not found', 'TEACHER_NOT_FOUND');
      }

      // Get teacher permissions
      const permissions = await this.getTeacherPermissions(teacher.teacher_id, teacher.tenant_id);

      // Get primary email for teacher using the helper method
      const primaryEmail = await this.getPrimaryEmail(teacher.teacher_id);
      
      // Generate new tokens
      const tokenPayload: TokenPayload = {
        id: teacher.teacher_id,
        email: primaryEmail || teacher.username,
        role: 'TEACHER',
        tenantId: teacher.tenant_id,
        permissions
      };

      const tokens = generateTokens(tokenPayload);

      // Add old refresh token to blacklist
      TEACHER_TOKEN_BLACKLIST.add(refreshToken);
      
      // Auto-cleanup blacklist after token would have expired anyway
      setTimeout(() => {
        TEACHER_TOKEN_BLACKLIST.delete(refreshToken);
      }, 7 * 24 * 60 * 60 * 1000); // 7 days

      return {
        user: {
          id: teacher.teacher_id,
          username: teacher.username,
          full_name: teacher.full_name,
          email: primaryEmail || teacher.username,
          role: {
            role_id: 0,
            role_name: 'TEACHER'
          },
          tenant_id: teacher.tenant_id,
          user_type: 'TEACHER'
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
   * Log out a teacher by blacklisting their refresh token
   * @param teacherId Teacher ID
   * @param token Refresh token to blacklist
   */
  async logoutTeacher(teacherId: number, token: string): Promise<void> {
    if (!token) {
      throw new BadRequestError('Token is required', 'TOKEN_REQUIRED');
    }

    // Check if teacher exists
    const teacher = await this.prisma.teacher.findUnique({
      where: { teacher_id: teacherId }
    });

    if (!teacher) {
      throw new NotFoundError('Teacher not found', 'TEACHER_NOT_FOUND');
    }

    // Add token to blacklist
    TEACHER_TOKEN_BLACKLIST.add(token);
    
    // Auto-cleanup blacklist after token would have expired anyway
    setTimeout(() => {
      TEACHER_TOKEN_BLACKLIST.delete(token);
    }, 7 * 24 * 60 * 60 * 1000); // 7 days
    
    logger.info(`Teacher ${teacherId} logged out`);
  }

  /**
   * Initiate password reset process for a teacher
   * @param data Teacher's email address
   */
  async initiateTeacherPasswordReset(data: TeacherForgotPasswordDto): Promise<void> {
    const { email_address } = data;

    // Find teacher by email address from the teacher_email_addresses table
    const teacherEmail = await this.prisma.teacherEmailAddress.findFirst({
      where: {
        email_address,
        is_active: true,
        is_deleted: false
      },
      include: {
        teacher: {
          select: {
            teacher_id: true,
            username: true,
            is_active: true,
            is_deleted: true
          }
        }
      }
    });

    // For security reasons, don't reveal if email exists or not
    if (!teacherEmail || !teacherEmail.teacher || !teacherEmail.teacher.is_active || teacherEmail.teacher.is_deleted) {
      // Log the attempt but return success to prevent email enumeration
      logger.info(`Password reset requested for non-existent teacher email: ${email_address}`);
      return;
    }

    const teacher = teacherEmail.teacher;

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
    TEACHER_TOKEN_RESET_HASHES.set(tokenHash, {
      teacherId: teacher.teacher_id,
      hash: tokenHash,
      expiresAt
    });

    // Auto-cleanup expired tokens
    setTimeout(() => {
      TEACHER_TOKEN_RESET_HASHES.delete(tokenHash);
    }, 60 * 60 * 1000); // 1 hour

    // In a real application, send an email to the teacher with the reset link
    logger.info(`Password reset token generated for teacher ${teacher.teacher_id} (${email_address}): ${resetToken}`);
    logger.info(`Reset URL would be: /teacher/reset-password?token=${resetToken}`);
  }

  /**
   * Complete password reset process for a teacher
   * @param data Reset token and new password
   */
  async finalizeTeacherPasswordReset(data: TeacherResetPasswordDto): Promise<void> {
    const { token, newPassword } = data;

    // Hash the provided token to compare with stored hash
    const tokenHash = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    // Get the reset token data
    const resetData = TEACHER_TOKEN_RESET_HASHES.get(tokenHash);

    if (!resetData) {
      throw new BadRequestError('Invalid or expired password reset token', 'INVALID_RESET_TOKEN');
    }

    // Check if token is expired
    if (new Date() > resetData.expiresAt) {
      TEACHER_TOKEN_RESET_HASHES.delete(tokenHash);
      throw new BadRequestError('Password reset token has expired', 'EXPIRED_RESET_TOKEN');
    }

    // Find the teacher
    const teacher = await this.prisma.teacher.findFirst({
      where: {
        teacher_id: resetData.teacherId,
        is_active: true,
        is_deleted: false
      }
    });

    if (!teacher) {
      throw new NotFoundError('Teacher not found', 'TEACHER_NOT_FOUND');
    }

    // Hash the new password
    const passwordHash = await hashPassword(newPassword);

    // Update the teacher's password
    await this.prisma.teacher.update({
      where: { teacher_id: teacher.teacher_id },
      data: {
        password_hash: passwordHash,
        updated_at: new Date()
      }
    });

    // Remove the used token
    TEACHER_TOKEN_RESET_HASHES.delete(tokenHash);

    logger.info(`Password reset completed for teacher ${teacher.teacher_id}`);
  }

  /**
   * Get teacher's effective permissions
   * @param teacherId Teacher ID
   * @param tenantId Tenant ID
   * @returns Array of permission strings
   */
  private async getTeacherPermissions(teacherId: number, tenantId: number): Promise<string[]> {
    try {
      // Get teacher's course assignments for permission determination
      const courseAssignments = await this.prisma.teacherCourse.findMany({
        where: {
          teacher_id: teacherId,
          tenant_id: tenantId,
          is_active: true,
          is_deleted: false
        }
      });

      // Basic teacher permissions
      const basicPermissions = [
        'profile:view',
        'profile:edit',
        'courses:view',
        'student:view',
        'student:progress:view',
        'discussions:view',
        'discussions:post',
        'discussions:reply',
        'discussions:moderate'
      ];

      // If teacher has active course assignments, add more permissions
      if (courseAssignments.length > 0) {
        basicPermissions.push(
          'course:content:view',
          'course:content:edit',
          'course:materials:upload',
          'course:materials:delete',
          'assignments:create',
          'assignments:edit',
          'assignments:grade',
          'quizzes:create',
          'quizzes:edit',
          'quizzes:grade',
          'announcements:create',
          'announcements:edit',
          'announcements:delete'
        );
      }

      return basicPermissions;
    } catch (error) {
      logger.error('Error fetching teacher permissions', { error, teacherId, tenantId });
      return [];
    }
  }

  /**
   * Helper method to get a teacher's primary email address
   * @param teacherId Teacher ID
   * @returns Primary email address string or null
   */
  private async getPrimaryEmail(teacherId: number): Promise<string | null> {
    try {
      const primaryEmail = await this.prisma.teacherEmailAddress.findFirst({
        where: {
          teacher_id: teacherId,
          is_primary: true,
          is_active: true,
          is_deleted: false
        }
      });
      
      return primaryEmail?.email_address || null;
    } catch (error) {
      logger.error('Error fetching teacher primary email', { error, teacherId });
      return null;
    }
  }
}

export default TeacherAuthService;
