/**
 * @file System User Controller
 * @description Controller for handling system user CRUD operations
 */

import { Request, Response } from 'express';
import { SystemUserService } from '@/services/systemUser.service.js';
import { CreateSystemUserDto, UpdateSystemUserDto, SystemUserFilterDto } from '@/dtos/user/systemUser.dto.js';
import { SystemUser } from '@shared/types/system-users.types';
import {
  createRouteHandler,
  createSuccessResponse,
  asyncHandler
} from '@/utils/index.js';
import prisma from '@/config/database.js';

export class SystemUserController {
  private systemUserService: SystemUserService;

  constructor() {
    this.systemUserService = new SystemUserService(prisma);
  }

  /**
   * Create a new system user
   */
  createSystemUserHandler = createRouteHandler(
    async (req: Request): Promise<SystemUser> => {
      if (!req.user) {
        throw new Error('User not authenticated');
      }

      const requestingUser = req.user as unknown as SystemUser;
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
   */  getSystemUserByIdHandler = createRouteHandler(
    async (req: Request): Promise<SystemUser> => {
      if (!req.user) {
        throw new Error('User not authenticated');
      }

      const requestingUser = req.user as unknown as SystemUser;
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
  getAllSystemUsersHandler = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      if (!req.user) {
        throw new Error('User not authenticated');
      }

      const requestingUser = req.user as unknown as SystemUser;
      const page = parseInt(req.query['page'] as string || '1', 10);
      const limit = parseInt(req.query['limit'] as string || '10', 10);

      // Extract filter parameters
      const filter: SystemUserFilterDto = {};
      
      if (req.query['role']) {
        filter.role = parseInt(req.query['role'] as string, 10);
      }
      
      if (req.query['status']) {
        filter.status = parseInt(req.query['status'] as string, 10);
      }
      
      if (req.query['tenantId']) {
        filter.tenantId = parseInt(req.query['tenantId'] as string, 10);
      }
      
      if (req.query['search']) {
        filter.search = req.query['search'] as string;
      }

      const { users, total } = await this.systemUserService.getAllSystemUsers(
        filter,
        page,
        limit,
        requestingUser
      );

      // Use createSuccessResponse instead to avoid duplicate pagination
      const paginationMetadata = {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      };

      const response = createSuccessResponse(
        users,
        'System users retrieved successfully',
        200,
        paginationMetadata
      );

      res.status(200).json(response);
    }
  );

  /**
   * Update a system user
   */  updateSystemUserHandler = createRouteHandler(
    async (req: Request): Promise<SystemUser> => {
      if (!req.user) {
        throw new Error('User not authenticated');
      }

      const requestingUser = req.user as unknown as SystemUser;
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
   */  deleteSystemUserHandler = createRouteHandler(
    async (req: Request): Promise<void> => {
      if (!req.user) {
        throw new Error('User not authenticated');
      }

      const requestingUser = req.user as unknown as SystemUser;
      const userIdParam = req.params['userId'];
      
      if (!userIdParam) {
        throw new Error('User ID parameter is required');
      }
      
      const userId = parseInt(userIdParam, 10);

      await this.systemUserService.deleteSystemUser(userId, requestingUser);
      return;
    },
    {
      message: 'System user deleted successfully',
      statusCode: 204
    }
  );
}

export default new SystemUserController();
