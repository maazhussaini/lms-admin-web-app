/**
 * @file dtos/tenant/client.dto.ts
 * @description Data Transfer Objects for Client operations with validation rules
 */

import { body } from 'express-validator';
import { ClientStatus } from '@/types/enums';

/**
 * DTO for creating a new client
 */
export class CreateClientDto {
  /**
   * Client's full name - required
   */
  full_name!: string;

  /**
   * Client's email address - required, unique per tenant
   */
  email_address!: string;

  /**
   * Optional international dialing code
   */
  dial_code?: string;

  /**
   * Optional phone number
   */
  phone_number?: string;

  /**
   * Optional address
   */
  address?: string;

  /**
   * Optional client status
   */
  client_status?: ClientStatus;

  /**
   * Tenant ID to which this client belongs - required
   */
  tenant_id!: number;

  /**
   * Static validation method for express-validator middleware
   */
  static validate() {
    return [
      body('full_name')
        .isString()
        .withMessage('Full name is required')
        .notEmpty()
        .withMessage('Full name cannot be empty')
        .trim()
        .isLength({ min: 2, max: 255 })
        .withMessage('Full name must be between 2 and 255 characters'),
      body('email_address')
        .isEmail()
        .withMessage('Valid email address is required')
        .normalizeEmail()
        .trim(),
      body('dial_code')
        .optional()
        .isString()
        .withMessage('Dial code must be a string')
        .trim()
        .isLength({ min: 1, max: 20 })
        .withMessage('Dial code must be between 1 and 20 characters'),
      body('phone_number')
        .optional()
        .isString()
        .withMessage('Phone number must be a string')
        .trim()
        .isLength({ min: 3, max: 20 })
        .withMessage('Phone number must be between 3 and 20 characters')
        .matches(/^[+0-9\s\-()]*$/)
        .withMessage('Phone number can only contain digits, spaces, +, -, and parentheses'),
      body('address')
        .optional()
        .isString()
        .withMessage('Address must be a string')
        .trim()
        .isLength({ max: 500 })
        .withMessage('Address cannot exceed 500 characters'),
      body('client_status')
        .optional()
        .isString()
        .withMessage('Client status must be a string')
        .isIn(Object.values(ClientStatus))
        .withMessage('Client status must be a valid status'),
      body('tenant_id')
        .isInt({ min: 1 })
        .withMessage('Valid tenant ID is required')
        .toInt()
    ];
  }
}

/**
 * DTO for updating an existing client
 */
export class UpdateClientDto {
  /**
   * Optional client's full name
   */
  full_name?: string;

  /**
   * Optional client's email address
   */
  email_address?: string;

  /**
   * Optional international dialing code
   */
  dial_code?: string | null;

  /**
   * Optional phone number
   */
  phone_number?: string | null;

  /**
   * Optional address
   */
  address?: string | null;

  /**
   * Optional client status
   */
  client_status?: ClientStatus;

  /**
   * Static validation method for express-validator middleware
   */
  static validate() {
    return [
      body('full_name')
        .optional()
        .isString()
        .withMessage('Full name must be a string')
        .notEmpty()
        .withMessage('Full name cannot be empty')
        .trim()
        .isLength({ min: 2, max: 255 })
        .withMessage('Full name must be between 2 and 255 characters'),
      body('email_address')
        .optional()
        .isEmail()
        .withMessage('Email address must be valid')
        .normalizeEmail()
        .trim(),
      body('dial_code')
        .optional()
        .if(value => value !== null)
        .isString()
        .withMessage('Dial code must be a string')
        .trim()
        .isLength({ min: 1, max: 20 })
        .withMessage('Dial code must be between 1 and 20 characters'),
      body('phone_number')
        .optional()
        .if(value => value !== null)
        .isString()
        .withMessage('Phone number must be a string')
        .trim()
        .isLength({ min: 3, max: 20 })
        .withMessage('Phone number must be between 3 and 20 characters')
        .matches(/^[+0-9\s\-()]*$/)
        .withMessage('Phone number can only contain digits, spaces, +, -, and parentheses'),
      body('address')
        .optional()
        .if(value => value !== null)
        .isString()
        .withMessage('Address must be a string')
        .trim()
        .isLength({ max: 500 })
        .withMessage('Address cannot exceed 500 characters'),
      body('client_status')
        .optional()
        .isString()
        .withMessage('Client status must be a string')
        .isIn(Object.values(ClientStatus))
        .withMessage('Client status must be a valid status')
    ];
  }
}

/**
 * @file dtos/tenant/clientTenant.dto.ts
 * @description Data Transfer Objects for Client-Tenant association with validation rules
 */

/**
 * DTO for creating a new client-tenant association
 */
export class CreateClientTenantDto {
  /**
   * Client ID - required
   */
  client_id!: number;

  /**
   * Tenant ID - required
   */
  tenant_id!: number;

  /**
   * Static validation method for express-validator middleware
   */
  static validate() {
    return [
      body('client_id')
        .isInt({ min: 1 })
        .withMessage('Valid client ID is required')
        .toInt(),
      body('tenant_id')
        .isInt({ min: 1 })
        .withMessage('Valid tenant ID is required')
        .toInt()
    ];
  }
}