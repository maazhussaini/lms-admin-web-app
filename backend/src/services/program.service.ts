/**
 * @file services/program.service.ts
 * @description Service for managing academic programs with tenant isolation
 */

import { PrismaClient } from '@prisma/client';
import { CreateProgramDto, UpdateProgramDto, ProgramResponseDto } from '@/dtos/course/program.dto';
import { ApiError } from '@/utils/api-error.utils';
import { TListResponse } from '@shared/types';

// Initialize Prisma client
const prisma = new PrismaClient();

export class ProgramService {
  /**
   * Create a new academic program
   * 
   * @param data Program data from validated DTO
   * @param tenantId Current tenant ID for multi-tenancy
   * @param userId System user ID for audit trail
   * @returns Newly created program
   */
  async createProgram(data: CreateProgramDto, tenantId: number, userId: number, ip?: string): Promise<ProgramResponseDto> {
    // Check if program with same name exists in this tenant
    const existingProgram = await prisma.program.findFirst({
      where: {
        program_name: data.program_name,
        tenant_id: tenantId,
        is_deleted: false
      }
    });

    if (existingProgram) {
      throw new ApiError('Program with this name already exists', 409, 'DUPLICATE_PROGRAM_NAME');
    }

    // Create new program with audit fields
    const newProgram = await prisma.program.create({
      data: {
        program_name: data.program_name,
        tenant_id: tenantId,
        is_active: true,
        is_deleted: false,
        created_by: userId,
        updated_by: userId,
        created_ip: ip || null,
        updated_ip: ip || null
      }
    });

    return this.mapProgramToDto(newProgram);
  }
  
  /**
   * Get program by ID with tenant isolation
   * 
   * @param programId Program identifier
   * @param tenantId Current tenant ID for multi-tenancy
   * @returns Program if found, null otherwise
   */
  async getProgramById(programId: number, tenantId: number): Promise<ProgramResponseDto> {
    const program = await prisma.program.findFirst({
      where: {
        program_id: programId,
        tenant_id: tenantId,
        is_deleted: false
      }
    });
    
    if (!program) {
      throw new ApiError('Program not found', 404, 'PROGRAM_NOT_FOUND');
    }
    
    return this.mapProgramToDto(program);
  }
  
  /**
   * Get all programs for a tenant with pagination, sorting and filtering
   * 
   * @param tenantId Current tenant ID for multi-tenancy
   * @param options Pagination, sorting, and filtering options
   * @returns List response with programs and pagination metadata
   */
  async getAllPrograms(
    tenantId: number, 
    options: {
      page?: number | undefined;
      limit?: number | undefined;
      sortBy?: string | undefined;
      order?: 'asc' | 'desc' | undefined;
      search?: string | undefined;
      is_active?: boolean | undefined;
    } = {}
  ): Promise<TListResponse<ProgramResponseDto>> {
    // Set default pagination options
    const page = options.page || 1;
    const limit = options.limit || 20;
    const skip = (page - 1) * limit;
    
    // Build where clause with tenant isolation
    const where = {
      tenant_id: tenantId,
      is_deleted: false
    } as any;
    
    // Add optional filters
    if (options.search) {
      where.program_name = {
        contains: options.search,
        mode: 'insensitive'
      };
    }
    
    if (options.is_active !== undefined) {
      where.is_active = options.is_active;
    }
    
    // Determine sort field and direction
    const sortField = options.sortBy || 'created_at';
    const sortOrder = options.order || 'desc';
    
    // Execute queries using Promise.all for better performance
    const [programs, total] = await Promise.all([
      prisma.program.findMany({
        where,
        orderBy: {
          [sortField]: sortOrder
        },
        skip,
        take: limit
      }),
      prisma.program.count({ where })
    ]);
    
    // Map to DTOs and return with pagination metadata
    return {
      items: programs.map(program => this.mapProgramToDto(program)),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      }
    };
  }
  
  /**
   * Update program by ID with tenant isolation
   * 
   * @param programId Program identifier
   * @param data Update data from validated DTO
   * @param tenantId Current tenant ID for multi-tenancy
   * @param userId System user ID for audit trail
   * @returns Updated program
   */
  async updateProgram(
    programId: number, 
    data: UpdateProgramDto, 
    tenantId: number, 
    userId: number,
    ip?: string
  ): Promise<ProgramResponseDto> {
    // Verify program exists and belongs to tenant
    await this.getProgramById(programId, tenantId);
    
    // Check name uniqueness if updating name
    if (data.program_name) {
      const existingProgram = await prisma.program.findFirst({
        where: {
          program_name: data.program_name,
          tenant_id: tenantId,
          is_deleted: false,
          program_id: {
            not: programId
          }
        }
      });
      
      if (existingProgram) {
        throw new ApiError('Program with this name already exists', 409, 'DUPLICATE_PROGRAM_NAME');
      }
    }
    
    // Update program
    const updatedProgram = await prisma.program.update({
      where: {
        program_id: programId
      },
      data: {
        ...data,
        updated_by: userId,
        updated_at: new Date(),
        updated_ip: ip || null
      }
    });
    
    return this.mapProgramToDto(updatedProgram);
  }
  
  /**
   * Soft delete program by ID with tenant isolation
   * 
   * @param programId Program identifier
   * @param tenantId Current tenant ID for multi-tenancy
   * @param userId System user ID for audit trail
   * @returns Success message
   */
  async deleteProgram(programId: number, tenantId: number, userId: number, ip?: string): Promise<{ message: string }> {
    // Verify program exists and belongs to tenant
    await this.getProgramById(programId, tenantId);
    
    // Check if specializations exist for this program
    const specializationsCount = await prisma.specialization.count({
      where: {
        program_id: programId,
        is_deleted: false
      }
    });
    
    if (specializationsCount > 0) {
      throw new ApiError(
        'Cannot delete program with existing specializations',
        422,
        'PROGRAM_HAS_SPECIALIZATIONS',
        { context: { specializationsCount } }
      );
    }
    
    // Soft delete by updating is_deleted flag
    await prisma.program.update({
      where: {
        program_id: programId
      },
      data: {
        is_deleted: true,
        is_active: false,
        deleted_at: new Date(),
        deleted_by: userId,
        updated_by: userId,
        updated_at: new Date(),
        updated_ip: ip || null
      }
    });
    
    return { message: 'Program deleted successfully' };
  }
  
  /**
   * Map Prisma program entity to DTO for client response
   * @param program Program entity from database
   * @returns Program DTO for API response
   */
  private mapProgramToDto(program: any): ProgramResponseDto {
    return {
      program_id: program.program_id,
      program_name: program.program_name,
      is_active: program.is_active,
      created_at: program.created_at,
      updated_at: program.updated_at
    };
  }
}
