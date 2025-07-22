/**
 * @file System User Controller
 * @description Controller for handling system user CRUD operations
 */

import { SystemUserService } from '@/services/system-user.service';
import { CreateSystemUserDto, UpdateSystemUserDto } from '@/dtos/user/system-user.dto';
import { SystemUser } from '@shared/types/system-users.types';
import {
  createRouteHandler,
  createListHandler,
  createUpdateHandler,
  createDeleteHandler,
  ExtendedPaginationWithFilters,
  AuthenticatedRequest
} from '@/utils/async-handler.utils';
import prisma from '@/config/database';

export class SystemUserController {
  /**
   * Get the SystemUserService instance
   */
  private static get systemUserService() {
    return SystemUserService.getInstance(prisma);
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
      const systemUserService = SystemUserController.systemUserService;

      const newUser = await systemUserService.createSystemUser(userData, requestingUser);
      
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
      const systemUserService = SystemUserController.systemUserService;

      return systemUserService.getSystemUserById(userId, requestingUser);
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
      const systemUserService = SystemUserController.systemUserService;
      
      // Call the service with the params directly - no need to extract filters here
      // since the service now handles ExtendedPaginationWithFilters
      const result = await systemUserService.getAllSystemUsers(
        requestingUser,
        params
      );

      return {
        items: result.items,
        total: result.pagination.total
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
      const systemUserService = SystemUserController.systemUserService;

      return systemUserService.updateSystemUser(userId, updateData, requestingUser);
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
      const systemUserService = SystemUserController.systemUserService;

      await systemUserService.deleteSystemUser(userId, requestingUser);
    },
    {
      message: 'System user deleted successfully'
    }
  );
}

export default new SystemUserController();
