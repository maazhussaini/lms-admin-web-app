import { Request, Response } from 'express';
import { SpecializationService } from '@/services/specialization.service';
import { createSuccessResponse } from '@/utils/api-response.utils';
import { BadRequestError } from '@/utils/api-error.utils';
import { CreateSpecializationDto, UpdateSpecializationDto } from '@/dtos/course/specialization.dto';
import { createRouteHandler, createListHandler, AuthenticatedRequest, ExtendedPaginationWithFilters } from '@/utils/async-handler.utils';

/**
 * Controller for Specialization operations
 */
export class SpecializationController {
  private static get specializationService() {
    return SpecializationService.getInstance();
  }
  /**
   * Create a new specialization
   */
  static createSpecializationHandler = createRouteHandler(async (req: Request, res: Response) => {
    const user = req.user;
    if (!user) throw new BadRequestError('Authentication required');
    const dto = req.validatedData as CreateSpecializationDto;
    const specialization = await SpecializationController.specializationService.createSpecialization(dto, user);
    return res.status(201).json(createSuccessResponse(specialization, 'Specialization created successfully', 201));
  });

  /**
   * Get specialization by ID
   */
  static getSpecializationByIdHandler = createRouteHandler(async (req: Request, res: Response) => {
    const user = req.user;
    if (!user) throw new BadRequestError('Authentication required');
    const specializationId = Number(req.params['specializationId']);
    if (!specializationId) throw new BadRequestError('Invalid specializationId');
    const specialization = await SpecializationController.specializationService.getSpecializationById(specializationId, user);
    return res.json(createSuccessResponse(specialization));
  });

  /**
   * Get all specializations with pagination and filtering
   */
  static getAllSpecializationsHandler = createListHandler(
    async (params: ExtendedPaginationWithFilters, req: AuthenticatedRequest) => {
      if (!req.user) {
        throw new BadRequestError('Authentication required');
      }
      const requestingUser = req.user;
      const result = await SpecializationController.specializationService.getAllSpecializations(requestingUser, params);
      return {
        items: result.items,
        total: result.pagination.total
      };
    }
  );

  /**
   * Update a specialization
   */
  static updateSpecializationHandler = createRouteHandler(async (req: Request, res: Response) => {
    const user = req.user;
    if (!user) throw new BadRequestError('Authentication required');
    const specializationId = Number(req.params['specializationId']);
    if (!specializationId) throw new BadRequestError('Invalid specializationId');
    const dto = req.validatedData as UpdateSpecializationDto;
    const specialization = await SpecializationController.specializationService.updateSpecialization(specializationId, dto, user);
    return res.json(createSuccessResponse(specialization, 'Specialization updated successfully'));
  });

  /**
   * Delete a specialization (soft delete)
   */
  static deleteSpecializationHandler = createRouteHandler(async (req: Request, res: Response) => {
    const user = req.user;
    if (!user) throw new BadRequestError('Authentication required');
    const specializationId = Number(req.params['specializationId']);
    if (!specializationId) throw new BadRequestError('Invalid specializationId');
    await SpecializationController.specializationService.deleteSpecialization(specializationId, user);
    return res.status(204).send();
  });

  /**
   * Get active specializations by program for authenticated student
   */
  static getActiveSpecializationsByProgramHandler = createRouteHandler(async (req: Request, res: Response) => {
    const user = req.user;
    if (!user) throw new BadRequestError('Authentication required');
    
    const programId = Number(req.query['program_id']);
    if (!programId) throw new BadRequestError('Program ID is required');
    
    const specializations = await SpecializationController.specializationService.getActiveSpecializationsByProgram(
      programId, 
      user
    );
    
    return res.json(createSuccessResponse(specializations, 'Active specializations retrieved successfully'));
  });
}
