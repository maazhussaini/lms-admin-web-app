/**
 * @file controllers/program.controller.ts
 * @description Controller for handling program-related HTTP requests
 */

import { Request, Response } from 'express';
import { ProgramService } from '@/services/program.service';
import { CreateProgramDto, UpdateProgramDto } from '@/dtos/course/program.dto';
import { asyncHandler } from '@/utils/async-handler.utils';
import { ApiError } from '@/utils/api-error.utils';
import { getPaginationFromRequest, getSortParamsFromRequest } from '../utils/pagination.utils';
import { TApiSuccessResponse } from '@shared/types/api.types';
import logger from '@/config/logger';
import { UserType } from '@/types/enums';

/**
 * Extended Request interface with authenticated user data
 */
interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    email: string;
    role: string;
    user_type: UserType;
    tenantId: number; // Can be 0 for SUPER_ADMIN
    permissions?: string[];
    [key: string]: any;
  };
}

// Initialize program service
const programService = new ProgramService();

export class ProgramController {
  /**
   * Create a new academic program
   * 
   * @route POST /api/v1/programs
   * @access Private (SUPER_ADMIN, TENANT_ADMIN)
   */
  static createProgramHandler = asyncHandler(
    async (req: AuthenticatedRequest, res: Response) => {
      // Extract data from request
      const programData = req.body as CreateProgramDto;
      
      // Debug the user object to help troubleshoot
      logger.debug('User object in create program handler', {
        hasUser: !!req.user,
        userId: req.user?.id,
        role: req.user?.role,
        tenantId: req.user?.tenantId,
        path: req.path,
        requestId: req.id
      });
      
      // Extract tenant ID and user ID from authenticated user
      if (!req.user || req.user.id === undefined) {
        throw new ApiError('Authentication required', 401, 'AUTHENTICATION_REQUIRED');
      }
      
      // Special handling for tenantId - Super Admin can have tenantId = 0
      const tenantId = req.user.tenantId !== undefined ? req.user.tenantId : null;
      if (tenantId === null) {
        throw new ApiError('Tenant context required', 400, 'TENANT_REQUIRED');
      }
      
      const userId = req.user.id;
      
      // Create program using service
      const program = await programService.createProgram(
        programData, 
        tenantId, 
        userId, 
        req.ip || undefined
      );
      
      // Send successful response
      const response: TApiSuccessResponse = {
        success: true,
        statusCode: 201,
        message: 'Program created successfully',
        data: program,
        timestamp: new Date().toISOString()
      };
      
      return res.status(201).json(response);
    }
  );
  
  /**
   * Get program by ID
   * 
   * @route GET /api/v1/programs/:programId
   * @access Private (Any authenticated user within tenant)
   */
  static getProgramByIdHandler = asyncHandler(
    async (req: AuthenticatedRequest, res: Response) => {
      // Extract program ID from request parameters
      const programIdParam = req.params['programId'];
      if (!programIdParam) {
        throw new ApiError('Program ID is required', 400, 'MISSING_PROGRAM_ID');
      }
      
      const programId = parseInt(programIdParam, 10);
      if (isNaN(programId)) {
        throw new ApiError('Invalid program ID', 400, 'INVALID_PROGRAM_ID');
      }

      // Debug the user object to help troubleshoot
      logger.debug('User object in get program handler', {
        hasUser: !!req.user,
        userId: req.user?.id,
        role: req.user?.role,
        tenantId: req.user?.tenantId,
        path: req.path,
        requestId: req.id
      });

      // Extract tenant ID from authenticated user
      if (!req.user) {
        throw new ApiError('Authentication required', 401, 'AUTHENTICATION_REQUIRED');
      }
      
      // Super Admin can have tenantId = 0, which is valid
      const tenantId = req.user.tenantId;

      // Get program using service
      const program = await programService.getProgramById(programId, tenantId);
      
      // Send successful response
      const response: TApiSuccessResponse = {
        success: true,
        statusCode: 200,
        message: 'Program retrieved successfully',
        data: program,
        timestamp: new Date().toISOString()
      };
      
      return res.status(200).json(response);
    }
  );
  
  /**
   * Get all programs with pagination, sorting, and filtering
   * 
   * @route GET /api/v1/programs
   * @access Private (Any authenticated user within tenant)
   */
  static getAllProgramsHandler = asyncHandler(
    async (req: AuthenticatedRequest, res: Response) => {
      // Debug the user object to help troubleshoot
      logger.debug('User object in get all programs handler', {
        hasUser: !!req.user,
        userId: req.user?.id,
        role: req.user?.role,
        tenantId: req.user?.tenantId,
        path: req.path,
        requestId: req.id
      });

      // Extract tenant ID from authenticated user
      if (!req.user) {
        throw new ApiError('Authentication required', 401, 'AUTHENTICATION_REQUIRED');
      }
      
      // Super Admin can have tenantId = 0, which is valid
      const tenantId = req.user.tenantId;

      // Extract pagination and sorting from query parameters
      const pagination = getPaginationFromRequest(req);
      const { sortBy, order } = getSortParamsFromRequest(
        req, 
        'created_at', 
        'desc', 
        ['program_id', 'program_name', 'created_at', 'updated_at']
      );
      
      // Extract additional filters
      const search = req.query['search'] as string | undefined;
      const isActive = req.query['is_active'] !== undefined 
        ? req.query['is_active'] === 'true' 
        : undefined;
      
      // Get programs using service
      const result = await programService.getAllPrograms(tenantId, {
        page: pagination.page,
        limit: pagination.limit,
        sortBy,
        order,
        search,
        is_active: isActive
      });
      
      // Send successful response
      const response: TApiSuccessResponse = {
        success: true,
        statusCode: 200,
        message: 'Programs retrieved successfully',
        data: result.items,
        timestamp: new Date().toISOString()
      };
      
      // Add pagination info to response
      return res.status(200).json({
        ...response,
        pagination: result.pagination
      });
    }
  );
  
  /**
   * Update program by ID
   * 
   * @route PATCH /api/v1/programs/:programId
   * @access Private (SUPER_ADMIN, TENANT_ADMIN)
   */
  static updateProgramHandler = asyncHandler(
    async (req: AuthenticatedRequest, res: Response) => {
      // Extract program ID from request parameters
      const programIdParam = req.params['programId'];
      if (!programIdParam) {
        throw new ApiError('Program ID is required', 400, 'MISSING_PROGRAM_ID');
      }
      
      const programId = parseInt(programIdParam, 10);
      if (isNaN(programId)) {
        throw new ApiError('Invalid program ID', 400, 'INVALID_PROGRAM_ID');
      }

      // Extract update data from request body
      const updateData = req.body as UpdateProgramDto;
      
      // Extract tenant ID and user ID from authenticated user
      if (!req.user?.tenantId || !req.user?.id) {
        throw new ApiError('Authentication required', 401, 'AUTHENTICATION_REQUIRED');
      }
      
      const tenantId = req.user.tenantId;
      const userId = req.user.id;
      
      // Update program using service
      const updatedProgram = await programService.updateProgram(
        programId, 
        updateData, 
        tenantId, 
        userId,
        req.ip || undefined
      );
      
      // Send successful response
      const response: TApiSuccessResponse = {
        success: true,
        statusCode: 200,
        message: 'Program updated successfully',
        data: updatedProgram,
        timestamp: new Date().toISOString()
      };
      
      return res.status(200).json(response);
    }
  );
  
  /**
   * Delete program by ID (soft delete)
   * 
   * @route DELETE /api/v1/programs/:programId
   * @access Private (SUPER_ADMIN, TENANT_ADMIN)
   */
  static deleteProgramHandler = asyncHandler(
    async (req: AuthenticatedRequest, res: Response) => {
      // Extract program ID from request parameters
      const programIdParam = req.params['programId'];
      if (!programIdParam) {
        throw new ApiError('Program ID is required', 400, 'MISSING_PROGRAM_ID');
      }
      
      const programId = parseInt(programIdParam, 10);
      if (isNaN(programId)) {
        throw new ApiError('Invalid program ID', 400, 'INVALID_PROGRAM_ID');
      }

      // Extract tenant ID and user ID from authenticated user
      if (!req.user?.tenantId || !req.user?.id) {
        throw new ApiError('Authentication required', 401, 'AUTHENTICATION_REQUIRED');
      }
      
      const tenantId = req.user.tenantId;
      const userId = req.user.id;

      // Delete program using service
      const result = await programService.deleteProgram(
        programId, 
        tenantId, 
        userId, 
        req.ip || undefined
      );
      
      // Send successful response
      const response: TApiSuccessResponse = {
        success: true,
        statusCode: 200,
        message: result.message,
        data: null,
        timestamp: new Date().toISOString()
      };
      
      return res.status(200).json(response);
    }
  );
}
