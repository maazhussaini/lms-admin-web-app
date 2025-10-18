/**
 * @file api/v1/routes/geographic.routes.ts
 * @description Routes for geographic data (countries, states, cities)
 */

import { Router } from 'express';
import { GeographicController } from '@/controllers/geographic.controller';
import { param } from 'express-validator';
import { validate } from '@/middleware/validation.middleware';

const router = Router();

/**
 * @route GET /api/v1/countries
 * @description Get all countries with pagination
 * @access Public
 */
router.get(
  '/countries',
  GeographicController.getAllCountriesHandler
);

/**
 * @route GET /api/v1/countries/:countryId
 * @description Get country by ID
 * @access Public
 */
router.get(
  '/countries/:countryId',
  validate([
    param('countryId')
      .isInt({ min: 1 })
      .withMessage('Country ID must be a positive integer')
      .toInt()
  ]),
  GeographicController.getCountryByIdHandler
);

/**
 * @route GET /api/v1/countries/:countryId/states
 * @description Get states by country ID
 * @access Public
 */
router.get(
  '/countries/:countryId/states',
  validate([
    param('countryId')
      .isInt({ min: 1 })
      .withMessage('Country ID must be a positive integer')
      .toInt()
  ]),
  GeographicController.getStatesByCountryHandler
);

/**
 * @route GET /api/v1/states/:stateId
 * @description Get state by ID
 * @access Public
 */
router.get(
  '/states/:stateId',
  validate([
    param('stateId')
      .isInt({ min: 1 })
      .withMessage('State ID must be a positive integer')
      .toInt()
  ]),
  GeographicController.getStateByIdHandler
);

/**
 * @route GET /api/v1/states/:stateId/cities
 * @description Get cities by state ID
 * @access Public
 */
router.get(
  '/states/:stateId/cities',
  validate([
    param('stateId')
      .isInt({ min: 1 })
      .withMessage('State ID must be a positive integer')
      .toInt()
  ]),
  GeographicController.getCitiesByStateHandler
);

/**
 * @route GET /api/v1/cities/:cityId
 * @description Get city by ID
 * @access Public
 */
router.get(
  '/cities/:cityId',
  validate([
    param('cityId')
      .isInt({ min: 1 })
      .withMessage('City ID must be a positive integer')
      .toInt()
  ]),
  GeographicController.getCityByIdHandler
);

export default router;
