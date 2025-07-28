/**
 * @file controllers/program.controller.ts
 * @description Controller for handling program-related HTTP requests
 */

import { Request, Response } from 'express';
import { ProgramService } from '@/services/program.service';
import { CreateProgramDto, UpdateProgramDto } from '../dtos/course/program.dto';
import { asyncHandler, createListHandler, ExtendedPaginationWithFilters } from '@/utils/async-handler.utils';
import { ApiError } from '@/utils/api-error.utils';
import { TApiSuccessResponse } from '@shared/types/api.types';
import { TokenPayload } from '@/utils/jwt.utils';
import logger from '@/config/logger';

/**
 * Extended Request interface with authenticated user data
 */
interface AuthenticatedRequest extends Request {
  user?: TokenPayload;
}

// Initialize program service - using singleton pattern
const programService = ProgramService.getInstance();

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
      
      // Create program using service
      const program = await programService.createProgram(
        programData, 
        req.user, 
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

      // Get program using service
      const program = await programService.getProgramById(programId, req.user);
      
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
  static getAllProgramsHandler = createListHandler(
    async (params: ExtendedPaginationWithFilters, req: AuthenticatedRequest) => {
      if (!req.user) {
        throw new ApiError('Authentication required', 401, 'AUTHENTICATION_REQUIRED');
      }
      const requestingUser = req.user;
      const result = await programService.getAllPrograms(requestingUser, params);
      return {
        items: result.items,
        total: result.pagination.total
      };
    },
    {
      message: 'Programs retrieved successfully'
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
      
      // Update program using service
      const updatedProgram = await programService.updateProgram(
        programId, 
        updateData, 
        req.user,
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

      // Delete program using service
      const result = await programService.deleteProgram(
        programId, 
        req.user, 
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

  /**
   * Get programs by tenant - Retrieve all programs associated with the authenticated user's tenant
   * Query parameters for pagination and filtering
   * Authentication required - uses JWT token to determine tenant
   * @param paginationParams ExtendedPaginationWithFilters - Pagination and filtering parameters
   * @param req AuthenticatedRequest - Express request with authenticated user context
   */
  public static getProgramsByTenantHandler = createListHandler(
    async (paginationParams: ExtendedPaginationWithFilters, req: AuthenticatedRequest) => {
      // Extract tenant ID from authenticated user
      if (!req.user?.tenantId) {
        throw new ApiError('Authentication required', 401, 'AUTHENTICATION_REQUIRED');
      }
      
      const tenantId = req.user.tenantId;

      // Extract filtering parameters
      const filters: { is_active?: boolean } = {};
      if (req.query['is_active'] !== undefined) {
        filters.is_active = req.query['is_active'] === 'true';
      }

      // Debug logging
      logger.debug('Getting programs by tenant with filters', {
        tenantId,
        filters,
        paginationParams,
        userInfo: {
          id: req.user.id,
          email: req.user.email,
          user_type: req.user.user_type
        },
        query: req.query
      });

      // Get programs by tenant using service
      const result = await programService.getProgramsByTenant(tenantId, filters, paginationParams);
      
      // Debug logging
      logger.debug('Programs retrieved', {
        tenantId,
        programCount: result.items.length,
        total: result.total,
        programs: result.items.map(p => ({ 
          id: p.program_id, 
          name: p.program_name, 
          is_active: p.is_active,
          tenant_id: p.tenant_id 
        }))
      });

      return {
        items: result.items,
        total: result.total
      };
    },
    {
      message: 'Programs retrieved successfully'
    }
  );
}
