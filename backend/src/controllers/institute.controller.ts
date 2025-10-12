import { InstituteService } from '@/services/institute.service';
import { 
  CreateInstituteDto, 
  UpdateInstituteDto
} from '@/dtos/institute/institute.dto';
import { 
  createRouteHandler,
  createListHandler,
  createUpdateHandler,
  createDeleteHandler,
  ExtendedPaginationWithFilters,
  AuthenticatedRequest
} from '@/utils/async-handler.utils';
import { ApiError } from '@/utils/api-error.utils';
import { UserType } from '@/types/enums.types';

// Get institute service singleton instance
const instituteService = InstituteService.getInstance();

export class InstituteController {
  /**
   * Create a new institute
   * 
   * @route POST /api/v1/institutes
   * @access Private (SUPER_ADMIN, TENANT_ADMIN)
   */
  static createInstituteHandler = createRouteHandler(
    async (req: AuthenticatedRequest) => {
      const tenant = await instituteService.getTenantFromDomain(req);
      const instituteData = req.validatedData as CreateInstituteDto;
      let requestingUser:any = req.user || {};

      if(requestingUser.user_type !== UserType.SUPER_ADMIN){
        requestingUser.tenantId = tenant.tenant_id;
      }
      else{
        instituteData.tenant_id = tenant.tenant_id;
      }
      
      return await instituteService.createInstitute(
        instituteData, 
        requestingUser,
        req.ip || undefined
      );
    },
    {
      statusCode: 201,
      message: 'Institute created successfully'
    }
  );

  /**
   * Get institute by ID
   * 
   * @route GET /api/v1/institutes/:instituteId
   * @access Private (SUPER_ADMIN, TENANT_ADMIN)
   */
  static getInstituteByIdHandler = createRouteHandler(
    async (req: AuthenticatedRequest) => {
      const instituteIdParam = req.params['instituteId'];
      if (!instituteIdParam) {
        throw new ApiError('Institute ID is required', 400, 'MISSING_INSTITUTE_ID');
      }
      
      const instituteId = parseInt(instituteIdParam, 10);
      if (isNaN(instituteId)) {
        throw new ApiError('Invalid institute ID', 400, 'INVALID_INSTITUTE_ID');
      }

      if (!req.user) {
        throw new ApiError('Authentication required', 401, 'AUTHENTICATION_REQUIRED');
      }

      const requestingUser = req.user;

      return await instituteService.getInstituteById(instituteId, requestingUser);
    },
    {
      message: 'Institute retrieved successfully'
    }
  );

  /**
   * Get all institutes with pagination, sorting, and filtering
   * 
   * @route GET /api/v1/institutes
   * @access Private (SUPER_ADMIN, TENANT_ADMIN)
   */
  static getAllInstitutesHandler = createListHandler(
    async (params: ExtendedPaginationWithFilters, req: AuthenticatedRequest) => {
      if (!req.user) {
        throw new ApiError('Authentication required', 401, 'AUTHENTICATION_REQUIRED');
      }

      const requestingUser = req.user;

      // Call the service with the params directly
      const result = await instituteService.getAllInstitutes(requestingUser, params);
      
      return {
        items: result.items,
        total: result.pagination.total
      };
    },
    {
      message: 'Institutes retrieved successfully'
    }
  );

  /**
   * Update institute by ID
   * 
   * @route PATCH /api/v1/institutes/:instituteId
   * @access Private (SUPER_ADMIN, TENANT_ADMIN)
   */
  static updateInstituteHandler = createUpdateHandler(
    async (req: AuthenticatedRequest) => {
      const instituteIdParam = req.params['instituteId'];
      if (!instituteIdParam) {
        throw new ApiError('Institute ID is required', 400, 'MISSING_INSTITUTE_ID');
      }
      
      const instituteId = parseInt(instituteIdParam, 10);
      if (isNaN(instituteId)) {
        throw new ApiError('Invalid institute ID', 400, 'INVALID_INSTITUTE_ID');
      }

      const updateData = req.validatedData as UpdateInstituteDto;
      
      if (!req.user) {
        throw new ApiError('Authentication required', 401, 'AUTHENTICATION_REQUIRED');
      }

      const requestingUser = req.user;
      
      return await instituteService.updateInstitute(
        instituteId, 
        updateData, 
        requestingUser,
        req.ip || undefined
      );
    },
    {
      message: 'Institute updated successfully'
    }
  );

  /**
   * Delete institute by ID (soft delete)
   * 
   * @route DELETE /api/v1/institutes/:instituteId
   * @access Private (SUPER_ADMIN, TENANT_ADMIN)
   */
  static deleteInstituteHandler = createDeleteHandler(
    async (req: AuthenticatedRequest): Promise<void> => {
      const instituteIdParam = req.params['instituteId'];
      if (!instituteIdParam) {
        throw new ApiError('Institute ID is required', 400, 'MISSING_INSTITUTE_ID');
      }
      
      const instituteId = parseInt(instituteIdParam, 10);
      if (isNaN(instituteId)) {
        throw new ApiError('Invalid institute ID', 400, 'INVALID_INSTITUTE_ID');
      }

      if (!req.user) {
        throw new ApiError('Authentication required', 401, 'AUTHENTICATION_REQUIRED');
      }

      const requestingUser = req.user;

      await instituteService.deleteInstitute(
        instituteId, 
        requestingUser, 
        req.ip || undefined
      );
    },
    {
      message: 'Institute deleted successfully'
    }
  );
}
