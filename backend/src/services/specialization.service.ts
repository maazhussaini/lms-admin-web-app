import { PrismaClient } from '@prisma/client';
import { Specialization } from '@shared/types/course.types';
import { CreateSpecializationDto, UpdateSpecializationDto } from '@/dtos/course/specialization.dto';
import { ActiveSpecializationsByProgramResponse } from '@/dtos/course/active-specializations-by-program.dto';
import { NotFoundError } from '@/utils/api-error.utils';
import { wrapError } from '@/utils/error-wrapper.utils';

const prisma = new PrismaClient();

/**
 * Service for managing specializations
 */
export class SpecializationService {
  /**
   * Create a new specialization
   */
  static async createSpecialization(
    data: CreateSpecializationDto,
    tenantId: number,
    userId: number
  ): Promise<Specialization> {
    try {
      // Validate program exists and belongs to tenant
      const program = await prisma.program.findFirst({
        where: { program_id: data.programId, tenant_id: tenantId, is_deleted: false },
      });
      if (!program) throw new NotFoundError('Program not found or not accessible');

      // Create specialization first
      const specialization = await prisma.specialization.create({
        data: {
          tenant_id: tenantId,
          specialization_name: data.specializationName,
          is_active: true,
          is_deleted: false,
          created_by: userId,
          created_ip: null,
        },
      });

      // Create the relationship in the junction table
      await prisma.specializationProgram.create({
        data: {
          specialization_id: specialization.specialization_id,
          program_id: data.programId,
          is_active: true,
          is_deleted: false,
          created_by: userId,
          created_ip: null,
        },
      });

      return specialization as unknown as Specialization;
    } catch (err) {
      throw wrapError(err);
    }
  }

  /**
   * Get specialization by ID (tenant scoped)
   */
  static async getSpecializationById(
    specializationId: number,
    tenantId: number
  ): Promise<Specialization> {
    try {
      const specialization = await prisma.specialization.findFirst({
        where: { specialization_id: specializationId, tenant_id: tenantId, is_deleted: false },
      });
      if (!specialization) throw new NotFoundError('Specialization not found');
      return specialization as unknown as Specialization;
    } catch (err) {
      throw wrapError(err);
    }
  }

  /**
   * Get all specializations for a tenant, optionally filtered by programId
   */
  static async getAllSpecializations(
    tenantId: number,
    programId?: number,
    queryOptions?: any
  ): Promise<Specialization[]> {
    try {
      const where: any = { tenant_id: tenantId, is_deleted: false };
      if (programId) where.program_id = programId;
      const specializations = await prisma.specialization.findMany({
        where,
        orderBy: { created_at: 'desc' },
        ...queryOptions,
      });
      return specializations as unknown as Specialization[];
    } catch (err) {
      throw wrapError(err);
    }
  }

  /**
   * Update a specialization (tenant scoped)
   */
  static async updateSpecialization(
    specializationId: number,
    data: UpdateSpecializationDto,
    tenantId: number,
    userId: number
  ): Promise<Specialization> {
    try {
      const specialization = await prisma.specialization.findFirst({
        where: { specialization_id: specializationId, tenant_id: tenantId, is_deleted: false },
      });
      if (!specialization) throw new NotFoundError('Specialization not found');
      const updated = await prisma.specialization.update({
        where: { specialization_id: specializationId },
        data: {
          ...('specializationName' in data ? { specialization_name: data.specializationName } : {}),
          updated_by: userId,
          updated_at: new Date(),
        },
      });
      return updated as unknown as Specialization;
    } catch (err) {
      throw wrapError(err);
    }
  }

  /**
   * Soft delete a specialization (tenant scoped)
   */
  static async deleteSpecialization(
    specializationId: number,
    tenantId: number
  ): Promise<void> {
    try {
      const specialization = await prisma.specialization.findFirst({
        where: { specialization_id: specializationId, tenant_id: tenantId, is_deleted: false },
      });
      if (!specialization) throw new NotFoundError('Specialization not found');
      await prisma.specialization.update({
        where: { specialization_id: specializationId },
        data: {
          is_deleted: true,
          is_active: false,
          deleted_at: new Date(),
          // deleted_by: userId, // if available in context
        },
      });
    } catch (err) {
      throw wrapError(err);
    }
  }

  /**
   * Get active specializations by program
   * Converts PostgreSQL function: get_active_specializations_by_program
   */
  static async getActiveSpecializationsByProgram(
    programId: number,
    tenantId: number
  ): Promise<ActiveSpecializationsByProgramResponse[]> {
    try {
      const specializations = await prisma.specialization.findMany({
        where: {
          is_active: true,
          is_deleted: false,
          tenant_id: tenantId,
          specialization_program: {
            some: {
              program_id: programId,
              is_active: true,
              is_deleted: false
            }
          }
        },
        include: {
          specialization_program: {
            where: {
              program_id: programId,
              is_active: true,
              is_deleted: false
            },
            select: {
              program_id: true
            }
          }
        },
        orderBy: {
          specialization_name: 'asc'
        }
      });

      // Transform the results to match the expected response format
      return specializations.map(specialization => ({
        specialization_id: specialization.specialization_id,
        program_id: programId, // We know this from the query parameter
        specialization_name: specialization.specialization_name,
        specialization_thumbnail_url: specialization.specialization_thumbnail_url
      }));
    } catch (err) {
      throw wrapError(err);
    }
  }
}
