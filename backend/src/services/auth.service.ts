/**
 * @file services/auth.service.ts
 * @description Universal authentication service for system users and teachers
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
import { SystemUserRole, UserType } from '@/types/enums.types';

// Token blacklist - In production, this would be implemented with Redis
const TOKEN_BLACKLIST = new Set<string>();
const TOKEN_RESET_HASHES = new Map<string, { 
  userId: number, 
  hash: string, 
  expiresAt: Date,
  userType: 'ADMIN' | 'TEACHER'
}>();

interface UserSearchResult {
  user: any;
  type: 'ADMIN' | 'TEACHER';
}

export class AuthService {
  constructor(private prisma: PrismaClient) {}

  /**
   * Extract domain from IIS headers and get tenant
   * @param req Express request object with IIS headers
   * @returns Tenant object or null
   */
  private async getTenantFromDomain(req: any): Promise<any | null> {
    const originalHost = req?.headers['x-original-host'] as string || 
                        req?.headers['x-forwarded-host'] as string || 
                        req?.headers.host as string;

    if (!originalHost) {
      logger.warn('No domain found in request headers');
      return null;
    }

    const domain = 'betaschool.com'//'epsilonuniversity.com'//originalHost.split(':')[0]; // Remove port
    logger.info(`Extracting tenant for domain: ${domain}`);

    
    try {
      // Use raw query to find tenant by domain since Prisma types might not be generated
      const tenants = await this.prisma.$queryRaw`
        SELECT * FROM tenants 
        WHERE tenant_domain = ${domain} 
        AND tenant_status IN ('ACTIVE', 'TRIAL')
        AND is_active = true 
        AND is_deleted = false 
        LIMIT 1
      ` as any[];
      
      const tenant = tenants.length > 0 ? tenants[0] : null;

      if (tenant) {
        logger.info(`Found tenant: ${tenant.tenant_name} (ID: ${tenant.tenant_id}) for domain: ${domain}`);
      } else {
        logger.warn(`No active tenant found for domain: ${domain}`);
      }

      return tenant;
    } catch (error) {
      logger.error('Error fetching tenant by domain:', { error, domain });
      return null;
    }
  }

  /**
   * Find user across SystemUser and Teacher tables
   * @param emailOrUsername Email address or username
   * @returns User object with type or null
   */
  private async findUserAcrossAllTables(emailOrUsername: string): Promise<UserSearchResult | null> {
    const queries = await Promise.allSettled([
      // Check SystemUser (Admin/Super Admin)
      this.prisma.systemUser.findFirst({
        where: {
          OR: [
            { username: emailOrUsername },
            { email_address: emailOrUsername }
          ],
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
      }),
      
      // Check Teacher with complex email logic using raw query
      this.prisma.$queryRaw`
        SELECT 
          t.*,
          te.tenant_id as tenant_tenant_id,
          te.tenant_name,
          te.tenant_domain,
          te.tenant_status,
          tea.email_address as primary_email
        FROM teachers t
        LEFT JOIN teacher_email_addresses tea ON t.teacher_id = tea.teacher_id 
          AND tea.is_active = true 
          AND tea.is_deleted = false
          AND tea.priority = 1
        LEFT JOIN tenants te ON t.tenant_id = te.tenant_id
        WHERE t.is_active = true 
          AND t.is_deleted = false 
          AND (
            t.username = ${emailOrUsername} 
            OR (tea.email_address = ${emailOrUsername} AND tea.priority = 1)
          )
        LIMIT 1
      ` as Promise<any[]>,
    ]);

    console.log('==>',emailOrUsername)

    // Return first found user with type
    if (queries[0].status === 'fulfilled' && queries[0].value) {
      return { user: queries[0].value, type: 'ADMIN' };
    }
    
    // Handle teacher query result (array from raw query)
    if (queries[1].status === 'fulfilled' && queries[1].value) {
      const teacherResults = queries[1].value as any[];
      if (teacherResults.length > 0) {
        const teacher = teacherResults[0];
        // Map tenant data properly
        if (teacher.tenant_tenant_id) {
          teacher.tenant = {
            tenant_id: teacher.tenant_tenant_id,
            tenant_name: teacher.tenant_name,
            tenant_domain: teacher.tenant_domain,
            tenant_status: teacher.tenant_status
          };
        }
        // Use primary_email if available, otherwise fallback to username-based email
        if (teacher.primary_email) {
          teacher.email_address = teacher.primary_email;
        }
        return { user: teacher, type: 'TEACHER' };
      }
    }

    return null;
  }

  /**
   * Universal login for both system users and teachers
   * @param data Login credentials
   * @param req Express request object (for domain extraction)
   * @returns Authentication response with tokens and user info
   */
  async loginUser(data: LoginDto, req?: any): Promise<TAuthResponse> {
    const { email_address: emailOrUsername, password, tenant_context } = data;

    // Extract tenant from domain (IIS headers)
    const domainTenant = req ? await this.getTenantFromDomain(req) : null;
    
    // Find user across all tables
    const userResult = await this.findUserAcrossAllTables(emailOrUsername);

    if (!userResult) {
      throw new UnauthorizedError('Invalid credentials', 'INVALID_CREDENTIALS');
    }

    const { user, type } = userResult;

    console.log('Login attempt:', {
      userType: type,
      username: user.username,
      domain: req?.headers['x-original-host'] || req?.headers.host,
      tenantFound: domainTenant?.tenant_name || 'None'
    });

    if (type === 'ADMIN') {
      return this.loginSystemUser(user, password, domainTenant, tenant_context);
    } else if (type === 'TEACHER') {
      return this.loginTeacher(user, password, domainTenant);
    }

    throw new UnauthorizedError('Invalid credentials', 'INVALID_CREDENTIALS');
  }

  /**
   * Login system user (Admin/Super Admin) with domain-based tenant resolution
   */
  private async loginSystemUser(
    user: any, 
    password: string, 
    domainTenant: any, 
    tenant_context?: string
  ): Promise<TAuthResponse> {
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

    // Determine tenant context based on user role and domain
    let finalTenantId: number | null = null;

    if (user.role_type === SystemUserRole.SUPER_ADMIN) {
      // SUPER_ADMIN logic
      if (tenant_context) {
        // Manual tenant context provided - try multiple ways to find tenant
        let tenant = null;
        
        // Try by ID first
        if (!isNaN(Number(tenant_context))) {
          tenant = await this.prisma.tenant.findFirst({
            where: {
              tenant_id: Number(tenant_context),
              is_active: true,
              is_deleted: false
            }
          });
        }
        
        // Try by name if not found
        if (!tenant) {
          tenant = await this.prisma.tenant.findFirst({
            where: {
              tenant_name: tenant_context,
              is_active: true,
              is_deleted: false
            }
          });
        }
        
        // Try by domain if not found
        if (!tenant) {
          tenant = await this.prisma.$queryRaw`
            SELECT * FROM tenants 
            WHERE tenant_domain = ${tenant_context} 
            AND is_active = true 
            AND is_deleted = false 
            LIMIT 1
          `;
          tenant = Array.isArray(tenant) && tenant.length > 0 ? tenant[0] : null;
        }

        if (!tenant) {
          throw new NotFoundError('Tenant not found', 'TENANT_NOT_FOUND');
        }
        finalTenantId = tenant.tenant_id;
      } else if (domainTenant) {
        // Use domain-based tenant
        finalTenantId = domainTenant.tenant_id;
      }
      // If no tenant context and no domain tenant, SUPER_ADMIN gets global access (finalTenantId = null)
    } else {
      // TENANT_ADMIN must be associated with a tenant
      if (domainTenant) {
        // Verify TENANT_ADMIN has access to this domain's tenant
        if (user.tenant_id && user.tenant_id !== domainTenant.tenant_id) {
          throw new UnauthorizedError(
            `Access denied. You don't have permission for ${domainTenant.tenant_domain}`, 
            'TENANT_ACCESS_DENIED'
          );
        }
        finalTenantId = domainTenant.tenant_id;
      } else {
        // Use user's assigned tenant
        finalTenantId = user.tenant_id;
      }

      if (!finalTenantId) {
        throw new UnauthorizedError('No tenant context available', 'NO_TENANT_CONTEXT');
      }
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
    const permissions = await this.getUserPermissions(user.system_user_id, finalTenantId);

    // Generate JWT tokens
    const tokenPayload: TokenPayload = {
      id: user.system_user_id,
      email: user.email_address,
      role: user.role.role_name,
      user_type: user.role_type as UserType,
      tenantId: finalTenantId || 0,
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
          role_type: user.role_type as UserType,
          role_name: user.role.role_name
        },
        tenant_id: finalTenantId || 0,
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
   * Login teacher with domain validation
   */
  private async loginTeacher(teacher: any, password: string, domainTenant: any): Promise<TAuthResponse> {
    // Verify password
    const isPasswordValid = await comparePassword(password, teacher.password_hash);
    
    if (!isPasswordValid) {
      throw new UnauthorizedError('Invalid credentials', 'INVALID_CREDENTIALS');
    }

    // Validate teacher belongs to the domain's tenant
    if (domainTenant && teacher.tenant_id !== domainTenant.tenant_id) {
      throw new UnauthorizedError(
        `Access denied. You don't have permission for ${domainTenant.tenant_domain}`, 
        'TENANT_ACCESS_DENIED'
      );
    }

    const finalTenantId = domainTenant?.tenant_id || teacher.tenant_id;

    if (!finalTenantId) {
      throw new UnauthorizedError('No tenant context available for teacher', 'NO_TENANT_CONTEXT');
    }

    // Update last login
    await this.prisma.teacher.update({
      where: { teacher_id: teacher.teacher_id },
      data: {
        last_login_at: new Date()
      }
    });

    // Get primary email
    const primaryEmail = teacher.email_address || `${teacher.username}@${domainTenant?.tenant_domain || 'teacher.com'}`;

    // Generate JWT tokens
    const tokenPayload: TokenPayload = {
      id: teacher.teacher_id,
      email: primaryEmail,
      role: 'Teacher',
      user_type: UserType.TEACHER,
      tenantId: finalTenantId,
      permissions: ['teacher:*']
    };

    const tokens = generateTokens(tokenPayload);

    return {
      user: {
        id: teacher.teacher_id,
        username: teacher.username,
        full_name: teacher.full_name,
        email: primaryEmail,
        role: {
          role_type: UserType.TEACHER,
          role_name: 'Teacher'
        },
        tenant_id: finalTenantId,
        user_type: UserType.TEACHER
      },
      tokens: {
        access_token: tokens.accessToken,
        refresh_token: tokens.refreshToken,
        expires_in: tokens.expiresIn,
        token_type: 'Bearer'
      },
      permissions: ['teacher:*']
    };
  }

  /**
   * Universal refresh token handler
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
      
      // Determine user type from token and fetch user
      let user: any;
      let userType: 'ADMIN' | 'TEACHER';

      // Try to find in both tables based on ID
      const [adminUser, teacherUser] = await Promise.allSettled([
        this.prisma.systemUser.findFirst({
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
        }),
        this.prisma.teacher.findFirst({
          where: {
            teacher_id: tokenData.id,
            is_active: true,
            is_deleted: false
          }
        })
      ]);

      if (adminUser.status === 'fulfilled' && adminUser.value) {
        user = adminUser.value;
        userType = 'ADMIN';
      } else if (teacherUser.status === 'fulfilled' && teacherUser.value) {
        user = teacherUser.value;
        userType = 'TEACHER';
      } else {
        throw new NotFoundError('User not found', 'USER_NOT_FOUND');
      }

      // Generate new tokens based on user type
      let newTokenPayload: TokenPayload;
      let permissions: string[];

      if (userType === 'TEACHER') {
        const primaryEmail = user.email_address || `${user.username}@teacher.com`;
        permissions = ['teacher:*'];
        
        newTokenPayload = {
          id: user.teacher_id,
          email: primaryEmail,
          role: 'Teacher',
          user_type: UserType.TEACHER,
          tenantId: user.tenant_id,
          permissions
        };
      } else {
        permissions = await this.getUserPermissions(user.system_user_id, user.tenant_id);
        
        newTokenPayload = {
          id: user.system_user_id,
          email: user.email_address,
          role: user.role.role_name,
          user_type: user.role_type as UserType,
          tenantId: user.tenant_id || 0,
          permissions
        };
      }

      const tokens = generateTokens(newTokenPayload);

      // Add old refresh token to blacklist
      TOKEN_BLACKLIST.add(refreshToken);
      
      // Auto-cleanup blacklist after token would have expired anyway
      setTimeout(() => {
        TOKEN_BLACKLIST.delete(refreshToken);
      }, 7 * 24 * 60 * 60 * 1000); // 7 days

      // Return response based on user type
      return {
        user: userType === 'TEACHER' ? {
          id: user.teacher_id,
          username: user.username,
          full_name: user.full_name,
          email: user.email_address || `${user.username}@teacher.com`,
          role: {
            role_type: UserType.TEACHER,
            role_name: 'Teacher'
          },
          tenant_id: user.tenant_id,
          user_type: UserType.TEACHER
        } : {
          id: user.system_user_id,
          username: user.username,
          full_name: user.full_name,
          email: user.email_address,
          role: {
            role_type: user.role_type as UserType,
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
   * Universal forgot password handler
   */
  async initiatePasswordReset(data: ForgotPasswordDto, req?: any): Promise<void> {
    const { email_address: emailOrUsername } = data;

    // Extract tenant from domain
    const domainTenant = req ? await this.getTenantFromDomain(req) : null;
    
    // Find user across all tables
    const userResult = await this.findUserAcrossAllTables(emailOrUsername);

    if (!userResult) {
      // Log the attempt but return success to prevent email enumeration
      logger.info(`Password reset requested for non-existent user: ${emailOrUsername}`);
      return;
    }

    const { user, type } = userResult;

    // Validate tenant access for non-SUPER_ADMIN users
    if (domainTenant && type === 'ADMIN' && user.role_type !== SystemUserRole.SUPER_ADMIN) {
      if (user.tenant_id && user.tenant_id !== domainTenant.tenant_id) {
        logger.warn(`Password reset denied for ${emailOrUsername} - wrong tenant domain`);
        return; // Don't reveal that user exists but on wrong domain
      }
    }

    if (domainTenant && type === 'TEACHER') {
      if (user.tenant_id !== domainTenant.tenant_id) {
        logger.warn(`Password reset denied for teacher ${emailOrUsername} - wrong tenant domain`);
        return;
      }
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

    // Store token information
    TOKEN_RESET_HASHES.set(tokenHash, {
      userId: type === 'ADMIN' ? user.system_user_id : user.teacher_id,
      hash: tokenHash,
      expiresAt,
      userType: type
    });

    // Auto-cleanup expired tokens
    setTimeout(() => {
      TOKEN_RESET_HASHES.delete(tokenHash);
    }, 60 * 60 * 1000); // 1 hour

    const email = type === 'ADMIN' ? user.email_address : user.email_address || `${user.username}@${domainTenant?.tenant_domain || 'teacher.com'}`;
    logger.info(`Password reset token generated for ${type} user ${user.username} (${email}): ${resetToken}`);
  }

  /**
   * Universal password reset handler
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

    // Hash the new password
    const passwordHash = await hashPassword(newPassword);

    // Update password based on user type
    if (resetData.userType === 'ADMIN') {
      await this.prisma.systemUser.update({
        where: { system_user_id: resetData.userId },
        data: {
          password_hash: passwordHash,
          login_attempts: 0,
          system_user_status: PrismaSystemUserStatus.ACTIVE,
          updated_at: new Date()
        }
      });
    } else {
      await this.prisma.teacher.update({
        where: { teacher_id: resetData.userId },
        data: {
          password_hash: passwordHash,
          updated_at: new Date()
        }
      });
    }

    // Remove the used token
    TOKEN_RESET_HASHES.delete(tokenHash);

    logger.info(`Password reset completed for ${resetData.userType} user ${resetData.userId}`);
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
