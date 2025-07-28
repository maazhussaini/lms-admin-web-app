/**
 * @file services/programService.ts
 * @description Service layer for program and specialization-related API operations
 */

import { apiClient } from '@/api';
import { TListResponse } from '@shared/types/api.types';

// API Response Types based on the provided API responses
export interface Program {
  program_id: number;
  program_name: string;
  program_thumbnail_url: string | null;
  tenant_id: number;
  is_active: boolean;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
}

export interface Specialization {
  specialization_id: number;
  program_id: number;
  specialization_name: string;
  specialization_thumbnail_url: string | null;
}

// Request parameter types
export interface ProgramParams {
  is_active?: boolean;
  page?: number;
  limit?: number;
}

export interface SpecializationParams {
  program_id: number;
  page?: number;
  limit?: number;
}

/**
 * Program Service Class
 */
export class ProgramService {
  /**
   * Get programs for the current tenant
   */
  async getPrograms(params: ProgramParams = {}): Promise<TListResponse<Program>> {
    const searchParams = new URLSearchParams();
    
    if (params.is_active !== undefined) searchParams.append('is_active', params.is_active.toString());
    if (params.page) searchParams.append('page', params.page.toString());
    if (params.limit) searchParams.append('limit', params.limit.toString());

    const queryString = searchParams.toString();
    const endpoint = `/programs/tenant/list${queryString ? `?${queryString}` : ''}`;
    
    return await apiClient.get<TListResponse<Program>>(endpoint);
  }

  /**
   * Get specializations by program
   */
  async getSpecializationsByProgram(params: SpecializationParams): Promise<TListResponse<Specialization>> {
    const searchParams = new URLSearchParams();
    
    searchParams.append('program_id', params.program_id.toString());
    if (params.page) searchParams.append('page', params.page.toString());
    if (params.limit) searchParams.append('limit', params.limit.toString());

    const queryString = searchParams.toString();
    const endpoint = `/specializations/by-program?${queryString}`;
    
    return await apiClient.get<TListResponse<Specialization>>(endpoint);
  }
}

// Export singleton instance
export const programService = new ProgramService();
export default programService;
