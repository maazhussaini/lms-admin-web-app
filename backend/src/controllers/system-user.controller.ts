/**
 * @file System User Controller
 * @description Controller for handling system user CRUD operations
 */

import { SystemUserService } from '@/services/system-user.service.js';
import { CreateSystemUserDto, UpdateSystemUserDto } from '@/dtos/user/system-user.dto.js';
import { SystemUser } from '@shared/types/system-users.types';
import {
  createRouteHandler,
  createListHandler,
  createUpdateHandler,
  createDeleteHandler,
  ExtendedPaginationWithFilters,
  AuthenticatedRequest
} from '@/utils/async-handler.utils.js';
import prisma from '@/config/database.js';

export class SystemUserController {
  private systemUserService: SystemUserService;

  constructor() {
    this.systemUserService = new SystemUserService(prisma);
  }

  /**
   * Create a new system user
   */
  createSystemUserHandler = createRouteHandler<SystemUser>(
    async (req: AuthenticatedRequest): Promise<SystemUser> => {
      if (!req.user) {
        throw new Error('User not authenticated');
      }

      const requestingUser = req.user;
      
      // Validate that we have proper user context
      if (!requestingUser.id || !requestingUser.user_type) {
        throw new Error('Invalid user context - missing required user information');
      }

      const userData: CreateSystemUserDto = req.validatedData as CreateSystemUserDto;

      const newUser = await this.systemUserService.createSystemUser(userData, requestingUser);
      
      return newUser;
    },
    {
      statusCode: 201,
      message: 'System user created successfully'
    }
  );

  /**
   * Get a system user by ID
   */
  getSystemUserByIdHandler = createRouteHandler<SystemUser>(
    async (req: AuthenticatedRequest): Promise<SystemUser> => {
      if (!req.user) {
        throw new Error('User not authenticated');
      }

      const requestingUser = req.user;
      const userIdParam = req.params['userId'];
      
      if (!userIdParam) {
        throw new Error('User ID parameter is required');
      }
      
      const userId = parseInt(userIdParam, 10);

      return this.systemUserService.getSystemUserById(userId, requestingUser);
    },
    {
      message: 'System user retrieved successfully'
    }
  );

  /**
   * Get all system users with pagination and filtering
   */
  getAllSystemUsersHandler = createListHandler<SystemUser>(
    async (params: ExtendedPaginationWithFilters, req: AuthenticatedRequest) => {
      if (!req.user) {
        throw new Error('User not authenticated');
      }

      const requestingUser = req.user;
      
      // Call the service with the params directly - no need to extract filters here
      // since the service now handles ExtendedPaginationWithFilters
      const { users, total } = await this.systemUserService.getAllSystemUsers(
        params,
        requestingUser
      );

      return {
        items: users,
        total
      };
    },
    {
      message: 'System users retrieved successfully'
    }
  );

  /**
   * Update a system user
   */
  updateSystemUserHandler = createUpdateHandler<SystemUser>(
    async (req: AuthenticatedRequest): Promise<SystemUser> => {
      if (!req.user) {
        throw new Error('User not authenticated');
      }

      const requestingUser = req.user;
      const userIdParam = req.params['userId'];
      
      if (!userIdParam) {
        throw new Error('User ID parameter is required');
      }
      
      const userId = parseInt(userIdParam, 10);
      const updateData: UpdateSystemUserDto = req.validatedData as UpdateSystemUserDto;

      return this.systemUserService.updateSystemUser(userId, updateData, requestingUser);
    },
    {
      message: 'System user updated successfully'
    }
  );

  /**
   * Delete (soft-delete) a system user
   */
  deleteSystemUserHandler = createDeleteHandler(
    async (req: AuthenticatedRequest): Promise<void> => {
      if (!req.user) {
        throw new Error('User not authenticated');
      }

      const requestingUser = req.user;
      const userIdParam = req.params['userId'];
      
      if (!userIdParam) {
        throw new Error('User ID parameter is required');
      }
      
      const userId = parseInt(userIdParam, 10);

      await this.systemUserService.deleteSystemUser(userId, requestingUser);
    },
    {
      message: 'System user deleted successfully'
    }
  );
}

export default new SystemUserController();
