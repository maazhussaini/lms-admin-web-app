/**
 * @file services/student-auth.service.ts
 * @description Authentication service for student users
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
  StudentLoginDto, 
  StudentRefreshTokenDto, 
  StudentForgotPasswordDto, 
  StudentResetPasswordDto 
} from '@/dtos/auth/student-auth.dto';
import crypto from 'crypto';
import logger from '@/config/logger';
import { UserType } from '@/types/enums.types.js';

// Token blacklist - In production, this would be implemented with Redis
const STUDENT_TOKEN_BLACKLIST = new Set<string>();
const STUDENT_TOKEN_RESET_HASHES = new Map<string, { 
  studentId: number, 
  hash: string, 
  expiresAt: Date 
}>();

export class StudentAuthService {
  constructor(private prisma: PrismaClient) {}

  /**
   * Authenticate a student user and generate auth tokens
   * @param data Login credentials and optional tenant context
   * @returns Authentication response with tokens and user info
   */
  async loginStudent(data: StudentLoginDto): Promise<TAuthResponse> {
    const { email_address, password, tenant_context } = data;

    // Find student email first, then get the student record
    const studentEmail = await this.prisma.studentEmailAddress.findFirst({
      where: {
        email_address,
        is_active: true,
        is_deleted: false
      },
      include: {
        student: {
          include: {
            tenant: {
              select: {
                tenant_id: true,
                tenant_name: true
              }
            }
          }
        }
      }
    });

    // If no email found or associated student is inactive/deleted
    if (!studentEmail || !studentEmail.student || !studentEmail.student.is_active || studentEmail.student.is_deleted) {
      throw new UnauthorizedError('Invalid credentials', 'INVALID_CREDENTIALS');
    }

    const student = studentEmail.student;

    // Verify password
    const isPasswordValid = await comparePassword(password, student.password_hash);
    
    if (!isPasswordValid) {
      // Log failed login attempt
      logger.info(`Failed login attempt for student email: ${email_address}`);
      
      throw new UnauthorizedError('Invalid credentials', 'INVALID_CREDENTIALS');
    }

    // Check tenant context if provided
    if (tenant_context && student.tenant_id.toString() !== tenant_context) {
      throw new ForbiddenError('Student does not belong to the specified tenant', 'TENANT_MISMATCH');
    }

    // Update last login timestamp
    await this.prisma.student.update({
      where: { student_id: student.student_id },
      data: {
        last_login_at: new Date()
      }
    });

    // Get student permissions
    const permissions = await this.getStudentPermissions(student.student_id, student.tenant_id);

    // Get primary email for student
    const primaryEmail = await this.getPrimaryEmail(student.student_id);

    // Generate JWT tokens
    const tokenPayload: TokenPayload = {
      id: student.student_id,
      email: primaryEmail || student.username,
      role: 'STUDENT',
      user_type: UserType.STUDENT,
      tenantId: student.tenant_id,
      permissions
    };

    const tokens = generateTokens(tokenPayload);

    return {
      user: {
        id: student.student_id,
        username: student.username,
        full_name: student.full_name,
        email: primaryEmail || student.username,
        role: {
          // No role_type for students as they don't use SystemUserRole
          role_name: 'STUDENT'
        },
        tenant_id: student.tenant_id,
        user_type: UserType.STUDENT
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
   * Refresh student's access token using a valid refresh token
   * @param data Refresh token DTO
   * @returns New authentication response
   */
  async refreshStudentToken(data: StudentRefreshTokenDto): Promise<TAuthResponse> {
    const { refreshToken } = data;

    // Check if token is blacklisted
    if (STUDENT_TOKEN_BLACKLIST.has(refreshToken)) {
      throw new UnauthorizedError('Token has been revoked', 'TOKEN_REVOKED');
    }

    try {
      // Verify the refresh token
      const tokenData = verifyRefreshToken(refreshToken);
      
      // Get student from database
      const student = await this.prisma.student.findFirst({
        where: {
          student_id: tokenData.id,
          is_active: true,
          is_deleted: false
        },
        include: {
          tenant: {
            select: {
              tenant_id: true,
              tenant_name: true
            }
          }
        }
      });

      if (!student) {
        throw new NotFoundError('Student not found', 'STUDENT_NOT_FOUND');
      }

      // Get student permissions
      const permissions = await this.getStudentPermissions(student.student_id, student.tenant_id);

      // Get primary email for student
      const primaryEmail = await this.getPrimaryEmail(student.student_id);
      
      // Generate new tokens
      const tokenPayload: TokenPayload = {
        id: student.student_id,
        email: primaryEmail || student.username,
        role: 'STUDENT',
        user_type: UserType.STUDENT,
        tenantId: student.tenant_id,
        permissions
      };

      const tokens = generateTokens(tokenPayload);

      // Add old refresh token to blacklist
      STUDENT_TOKEN_BLACKLIST.add(refreshToken);
      
      // Auto-cleanup blacklist after token would have expired anyway
      setTimeout(() => {
        STUDENT_TOKEN_BLACKLIST.delete(refreshToken);
      }, 7 * 24 * 60 * 60 * 1000); // 7 days

      return {
        user: {
          id: student.student_id,
          username: student.username,
          full_name: student.full_name,
          email: primaryEmail || student.username,
          role: {
            // No role_type for students as they don't use SystemUserRole
            role_name: 'STUDENT'
          },
          tenant_id: student.tenant_id,
          user_type: UserType.STUDENT
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
   * Log out a student by blacklisting their refresh token
   * @param studentId Student ID
   * @param token Refresh token to blacklist
   */
  async logoutStudent(studentId: number, token: string): Promise<void> {
    if (!token) {
      throw new BadRequestError('Token is required', 'TOKEN_REQUIRED');
    }

    // Check if student exists
    const student = await this.prisma.student.findUnique({
      where: { student_id: studentId }
    });

    if (!student) {
      throw new NotFoundError('Student not found', 'STUDENT_NOT_FOUND');
    }

    // Add token to blacklist
    STUDENT_TOKEN_BLACKLIST.add(token);
    
    // Auto-cleanup blacklist after token would have expired anyway
    setTimeout(() => {
      STUDENT_TOKEN_BLACKLIST.delete(token);
    }, 7 * 24 * 60 * 60 * 1000); // 7 days
    
    logger.info(`Student ${studentId} logged out`);
  }

  /**
   * Initiate password reset process for a student
   * @param data Student's email address
   */
  async initiateStudentPasswordReset(data: StudentForgotPasswordDto): Promise<void> {
    const { email_address } = data;

    // Find student email first, then the associated student
    const studentEmail = await this.prisma.studentEmailAddress.findFirst({
      where: {
        email_address,
        is_active: true,
        is_deleted: false
      },
      include: {
        student: {
          select: {
            student_id: true,
            username: true,
            is_active: true,
            is_deleted: true
          }
        }
      }
    });

    // For security reasons, don't reveal if email exists or not
    if (!studentEmail || !studentEmail.student || !studentEmail.student.is_active || studentEmail.student.is_deleted) {
      // Log the attempt but return success to prevent email enumeration
      logger.info(`Password reset requested for non-existent student email: ${email_address}`);
      return;
    }

    const student = studentEmail.student;

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
    STUDENT_TOKEN_RESET_HASHES.set(tokenHash, {
      studentId: student.student_id,
      hash: tokenHash,
      expiresAt
    });

    // Auto-cleanup expired tokens
    setTimeout(() => {
      STUDENT_TOKEN_RESET_HASHES.delete(tokenHash);
    }, 60 * 60 * 1000); // 1 hour

    // In a real application, send an email to the student with the reset link
    logger.info(`Password reset token generated for student ${student.student_id} (${email_address}): ${resetToken}`);
    logger.info(`Reset URL would be: /student/reset-password?token=${resetToken}`);
  }

  /**
   * Complete password reset process for a student
   * @param data Reset token and new password
   */
  async finalizeStudentPasswordReset(data: StudentResetPasswordDto): Promise<void> {
    const { token, newPassword } = data;

    // Hash the provided token to compare with stored hash
    const tokenHash = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    // Get the reset token data
    const resetData = STUDENT_TOKEN_RESET_HASHES.get(tokenHash);

    if (!resetData) {
      throw new BadRequestError('Invalid or expired password reset token', 'INVALID_RESET_TOKEN');
    }

    // Check if token is expired
    if (new Date() > resetData.expiresAt) {
      STUDENT_TOKEN_RESET_HASHES.delete(tokenHash);
      throw new BadRequestError('Password reset token has expired', 'EXPIRED_RESET_TOKEN');
    }

    // Find the student
    const student = await this.prisma.student.findFirst({
      where: {
        student_id: resetData.studentId,
        is_active: true,
        is_deleted: false
      }
    });

    if (!student) {
      throw new NotFoundError('Student not found', 'STUDENT_NOT_FOUND');
    }

    // Hash the new password
    const passwordHash = await hashPassword(newPassword);

    // Update the student's password
    await this.prisma.student.update({
      where: { student_id: student.student_id },
      data: {
        password_hash: passwordHash,
        updated_at: new Date()
      }
    });

    // Remove the used token
    STUDENT_TOKEN_RESET_HASHES.delete(tokenHash);

    logger.info(`Password reset completed for student ${student.student_id}`);
  }

  /**
   * Get student's effective permissions
   * @param studentId Student ID
   * @param tenantId Tenant ID
   * @returns Array of permission strings
   */
  private async getStudentPermissions(studentId: number, tenantId: number): Promise<string[]> {
    try {
      // Get student enrollment status for permission determination
      const enrollments = await this.prisma.enrollment.findMany({
        where: {
          student_id: studentId,
          tenant_id: tenantId,
          is_active: true,
          is_deleted: false
        }
      });

      // Basic student permissions
      const basicPermissions = [
        'profile:view',
        'profile:edit',
        'courses:view',
        'assignments:view',
        'assignments:submit',
        'quizzes:view',
        'quizzes:take',
        'discussions:view',
        'discussions:post',
        'discussions:reply'
      ];

      // If student has active enrollments, add more permissions
      if (enrollments.length > 0) {
        basicPermissions.push(
          'course:content:view',
          'course:progress:view',
          'grades:view',
          'course:certificates:view'
        );
      }

      return basicPermissions;
    } catch (error) {
      logger.error('Error fetching student permissions', { error, studentId, tenantId });
      return [];
    }
  }

  /**
   * Helper method to get a student's primary email address
   * @param studentId Student ID
   * @returns Primary email address string or null
   */
  private async getPrimaryEmail(studentId: number): Promise<string | null> {
    try {
      const primaryEmail = await this.prisma.studentEmailAddress.findFirst({
        where: {
          student_id: studentId,
          is_primary: true,
          is_active: true,
          is_deleted: false
        }
      });
      
      return primaryEmail?.email_address || null;
    } catch (error) {
      logger.error('Error fetching student primary email', { error, studentId });
      return null;
    }
  }
}

export default StudentAuthService;
