/**
 * @file controllers/geographic.controller.ts
 * @description Controller for geographic data (countries, states, cities)
 */

import prisma from '@/config/database';
import {
  createRouteHandler,
  createListHandler,
  AuthenticatedRequest,
  ExtendedPaginationWithFilters
} from '@/utils/async-handler.utils';
import { ApiError } from '@/utils/api-error.utils';



export class GeographicController {
  /**
   * Get all countries
   * 
   * @route GET /api/v1/countries
   * @access Public/Private
   */
  static getAllCountriesHandler = createListHandler(
    async (params: ExtendedPaginationWithFilters) => {
      const { page = 1, limit = 1000, sortBy = 'name', sortOrder = 'asc' } = params;

      // Build where clause for search
      const whereClause: any = {
        is_deleted: false
      };

      const search = (params as any).search;
      if (search) {
        whereClause.OR = [
          { name: { contains: search, mode: 'insensitive' } },
          { iso_code_2: { contains: search, mode: 'insensitive' } },
          { iso_code_3: { contains: search, mode: 'insensitive' } }
        ];
      }

      // Get total count
      const total = await prisma.country.count({ where: whereClause });

      // Get paginated results
      const countries = await prisma.country.findMany({
        where: whereClause,
        orderBy: { [sortBy]: sortOrder },
        skip: (page - 1) * limit,
        take: limit,
        select: {
          country_id: true,
          name: true,
          iso_code_2: true,
          iso_code_3: true,
          dial_code: true,
          is_active: true
        }
      });

      return {
        items: countries,
        total
      };
    },
    {
      message: 'Countries retrieved successfully'
    }
  );

  /**
   * Get country by ID
   * 
   * @route GET /api/v1/countries/:countryId
   * @access Public/Private
   */
  static getCountryByIdHandler = createRouteHandler(
    async (req: AuthenticatedRequest) => {
      const countryIdParam = req.params['countryId'];
      if (!countryIdParam) {
        throw new ApiError('Country ID is required', 400, 'MISSING_COUNTRY_ID');
      }

      const countryId = parseInt(countryIdParam, 10);
      if (isNaN(countryId)) {
        throw new ApiError('Invalid country ID', 400, 'INVALID_COUNTRY_ID');
      }

      const country = await prisma.country.findFirst({
        where: {
          country_id: countryId,
          is_deleted: false
        }
      });

      if (!country) {
        throw new ApiError('Country not found', 404, 'COUNTRY_NOT_FOUND');
      }

      return country;
    },
    {
      message: 'Country retrieved successfully'
    }
  );

  /**
   * Get states by country ID
   * 
   * @route GET /api/v1/countries/:countryId/states
   * @access Public/Private
   */
  static getStatesByCountryHandler = createListHandler(
    async (params: ExtendedPaginationWithFilters, req: AuthenticatedRequest) => {
      const countryIdParam = req.params['countryId'];
      if (!countryIdParam) {
        throw new ApiError('Country ID is required', 400, 'MISSING_COUNTRY_ID');
      }

      const countryId = parseInt(countryIdParam, 10);
      if (isNaN(countryId)) {
        throw new ApiError('Invalid country ID', 400, 'INVALID_COUNTRY_ID');
      }

      const { page = 1, limit = 1000, sortBy = 'name', sortOrder = 'asc' } = params;

      // Build where clause
      const whereClause: any = {
        country_id: countryId,
        is_deleted: false
      };

      const search = (params as any).search;
      if (search) {
        whereClause.OR = [
          { name: { contains: search, mode: 'insensitive' } },
          { state_code: { contains: search, mode: 'insensitive' } }
        ];
      }

      // Get total count
      const total = await prisma.state.count({ where: whereClause });

      // Get paginated results
      const states = await prisma.state.findMany({
        where: whereClause,
        orderBy: { [sortBy]: sortOrder },
        skip: (page - 1) * limit,
        take: limit,
        select: {
          state_id: true,
          name: true,
          state_code: true,
          country_id: true,
          is_active: true
        }
      });

      return {
        items: states,
        total
      };
    },
    {
      message: 'States retrieved successfully'
    }
  );

  /**
   * Get state by ID
   * 
   * @route GET /api/v1/states/:stateId
   * @access Public/Private
   */
  static getStateByIdHandler = createRouteHandler(
    async (req: AuthenticatedRequest) => {
      const stateIdParam = req.params['stateId'];
      if (!stateIdParam) {
        throw new ApiError('State ID is required', 400, 'MISSING_STATE_ID');
      }

      const stateId = parseInt(stateIdParam, 10);
      if (isNaN(stateId)) {
        throw new ApiError('Invalid state ID', 400, 'INVALID_STATE_ID');
      }

      const state = await prisma.state.findFirst({
        where: {
          state_id: stateId,
          is_deleted: false
        },
        include: {
          country: {
            select: {
              country_id: true,
              name: true,
              iso_code_2: true
            }
          }
        }
      });

      if (!state) {
        throw new ApiError('State not found', 404, 'STATE_NOT_FOUND');
      }

      return state;
    },
    {
      message: 'State retrieved successfully'
    }
  );

  /**
   * Get cities by state ID
   * 
   * @route GET /api/v1/states/:stateId/cities
   * @access Public/Private
   */
  static getCitiesByStateHandler = createListHandler(
    async (params: ExtendedPaginationWithFilters, req: AuthenticatedRequest) => {
      const stateIdParam = req.params['stateId'];
      if (!stateIdParam) {
        throw new ApiError('State ID is required', 400, 'MISSING_STATE_ID');
      }

      const stateId = parseInt(stateIdParam, 10);
      if (isNaN(stateId)) {
        throw new ApiError('Invalid state ID', 400, 'INVALID_STATE_ID');
      }

      const { page = 1, limit = 1000, sortBy = 'name', sortOrder = 'asc' } = params;

      // Build where clause
      const whereClause: any = {
        state_id: stateId,
        is_deleted: false
      };

      const search = (params as any).search;
      if (search) {
        whereClause.name = { contains: search, mode: 'insensitive' };
      }

      // Get total count
      const total = await prisma.city.count({ where: whereClause });

      // Get paginated results
      const cities = await prisma.city.findMany({
        where: whereClause,
        orderBy: { [sortBy]: sortOrder },
        skip: (page - 1) * limit,
        take: limit,
        select: {
          city_id: true,
          name: true,
          state_id: true,
          is_active: true
        }
      });

      return {
        items: cities,
        total
      };
    },
    {
      message: 'Cities retrieved successfully'
    }
  );

  /**
   * Get city by ID
   * 
   * @route GET /api/v1/cities/:cityId
   * @access Public/Private
   */
  static getCityByIdHandler = createRouteHandler(
    async (req: AuthenticatedRequest) => {
      const cityIdParam = req.params['cityId'];
      if (!cityIdParam) {
        throw new ApiError('City ID is required', 400, 'MISSING_CITY_ID');
      }

      const cityId = parseInt(cityIdParam, 10);
      if (isNaN(cityId)) {
        throw new ApiError('Invalid city ID', 400, 'INVALID_CITY_ID');
      }

      const city = await prisma.city.findFirst({
        where: {
          city_id: cityId,
          is_deleted: false
        },
        include: {
          state: {
            select: {
              state_id: true,
              name: true,
              state_code: true,
              country: {
                select: {
                  country_id: true,
                  name: true,
                  iso_code_2: true
                }
              }
            }
          }
        }
      });

      if (!city) {
        throw new ApiError('City not found', 404, 'CITY_NOT_FOUND');
      }

      return city;
    },
    {
      message: 'City retrieved successfully'
    }
  );
}
