import { Request, Response } from 'express';
import { SpecializationService } from '@/services/specialization.service';
import { createSuccessResponse } from '@/utils/api-response.utils';
import { BadRequestError } from '@/utils/api-error.utils';
import { CreateSpecializationDto, UpdateSpecializationDto } from '@/dtos/course/specialization.dto';
import { createRouteHandler } from '@/utils/async-handler.utils';

/**
 * Controller for Specialization operations
 */
export class SpecializationController {
  /**
   * Create a new specialization
   */
  static createSpecializationHandler = createRouteHandler(async (req: Request, res: Response) => {
    const tenantId = req.user?.tenantId;
    const userId = req.user?.id;
    if (!tenantId || !userId) throw new BadRequestError('Missing tenant or user context');
    const dto = req.validatedData as CreateSpecializationDto;
    const specialization = await SpecializationService.createSpecialization(dto, Number(tenantId), Number(userId));
    return res.status(201).json(createSuccessResponse(specialization, 'Specialization created successfully', 201));
  });

  /**
   * Get specialization by ID
   */
  static getSpecializationByIdHandler = createRouteHandler(async (req: Request, res: Response) => {
    const tenantId = req.user?.tenantId;
    if (!tenantId) throw new BadRequestError('Missing tenant context');
    const specializationId = Number(req.params['specializationId']);
    if (!specializationId) throw new BadRequestError('Invalid specializationId');
    const specialization = await SpecializationService.getSpecializationById(specializationId, Number(tenantId));
    return res.json(createSuccessResponse(specialization));
  });

  /**
   * Get all specializations (optionally filtered by programId)
   */
  static getAllSpecializationsHandler = createRouteHandler(async (req: Request, res: Response) => {
    const tenantId = req.user?.tenantId;
    if (!tenantId) throw new BadRequestError('Missing tenant context');
    const programId = req.query['programId'] ? Number(req.query['programId']) : undefined;
    // Pagination/queryOptions can be extracted here if needed
    const specializations = await SpecializationService.getAllSpecializations(Number(tenantId), programId);
    return res.json(createSuccessResponse(specializations));
  });

  /**
   * Update a specialization
   */
  static updateSpecializationHandler = createRouteHandler(async (req: Request, res: Response) => {
    const tenantId = req.user?.tenantId;
    const userId = req.user?.id;
    if (!tenantId || !userId) throw new BadRequestError('Missing tenant or user context');
    const specializationId = Number(req.params['specializationId']);
    if (!specializationId) throw new BadRequestError('Invalid specializationId');
    const dto = req.validatedData as UpdateSpecializationDto;
    const specialization = await SpecializationService.updateSpecialization(specializationId, dto, Number(tenantId), Number(userId));
    return res.json(createSuccessResponse(specialization, 'Specialization updated successfully'));
  });

  /**
   * Delete a specialization (soft delete)
   */
  static deleteSpecializationHandler = createRouteHandler(async (req: Request, res: Response) => {
    const tenantId = req.user?.tenantId;
    if (!tenantId) throw new BadRequestError('Missing tenant context');
    const specializationId = Number(req.params['specializationId']);
    if (!specializationId) throw new BadRequestError('Invalid specializationId');
    await SpecializationService.deleteSpecialization(specializationId, Number(tenantId));
    return res.status(204).send();
  });
}
