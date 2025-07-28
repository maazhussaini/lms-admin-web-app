/**
 * @file dtos/client/client.dto.ts
 * @description Data Transfer Objects for Client operations with validation rules
 */

import { body, query, ValidationChain } from 'express-validator';
import { ClientStatus } from '@/types/enums.types';
import { BaseFilterDto } from '@/utils/service.types';

/**
 * DTO interface for creating a new client
 */
export interface CreateClientDto {
  full_name: string;
  email_address: string;
  dial_code?: string;
  phone_number?: string;
  address?: string;
  client_status?: ClientStatus;
  tenant_id: number;
}

/**
 * DTO interface for updating an existing client
 */
export interface UpdateClientDto {
  full_name?: string;
  email_address?: string;
  dial_code?: string | null;
  phone_number?: string | null;
  address?: string | null;
  client_status?: ClientStatus;
}

/**
 * DTO interface for filtering clients in list operations
 */
export interface ClientFilterDto extends BaseFilterDto {
  tenantId?: number;
  status?: ClientStatus;
}

/**
 * Response DTO for client entities
 */
export interface ClientResponseDto {
  client_id: number;
  full_name: string;
  email_address: string;
  dial_code?: string;
  phone_number?: string;
  address?: string;
  client_status: ClientStatus;
  tenant_id: number;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

/**
 * Validation chains for creating a client
 */
export const createClientValidation: ValidationChain[] = [
  body('full_name')
    .exists().withMessage('Full name is required')
    .isString().withMessage('Full name must be a string')
    .notEmpty().withMessage('Full name cannot be empty')
    .trim()
    .isLength({ min: 2, max: 255 }).withMessage('Full name must be between 2 and 255 characters'),

  body('email_address')
    .exists().withMessage('Email address is required')
    .isEmail().withMessage('Valid email address is required')
    .normalizeEmail()
    .trim(),

  body('dial_code')
    .optional()
    .isString().withMessage('Dial code must be a string')
    .trim()
    .isLength({ min: 1, max: 20 }).withMessage('Dial code must be between 1 and 20 characters'),

  body('phone_number')
    .optional()
    .isString().withMessage('Phone number must be a string')
    .trim()
    .isLength({ min: 3, max: 20 }).withMessage('Phone number must be between 3 and 20 characters')
    .matches(/^[+0-9\s\-()]*$/).withMessage('Phone number can only contain digits, spaces, +, -, and parentheses'),

  body('address')
    .optional()
    .isString().withMessage('Address must be a string')
    .trim()
    .isLength({ max: 500 }).withMessage('Address cannot exceed 500 characters'),

  body('client_status')
    .optional()
    .isString().withMessage('Client status must be a string')
    .isIn(Object.values(ClientStatus)).withMessage('Client status must be a valid status'),

  body('tenant_id')
    .exists().withMessage('Tenant ID is required')
    .isInt({ min: 1 }).withMessage('Valid tenant ID is required')
    .toInt()
];

/**
 * Validation chains for updating a client
 */
export const updateClientValidation: ValidationChain[] = [
  body('full_name')
    .optional()
    .isString().withMessage('Full name must be a string')
    .notEmpty().withMessage('Full name cannot be empty')
    .trim()
    .isLength({ min: 2, max: 255 }).withMessage('Full name must be between 2 and 255 characters'),

  body('email_address')
    .optional()
    .isEmail().withMessage('Email address must be valid')
    .normalizeEmail()
    .trim(),

  body('dial_code')
    .optional()
    .if(value => value !== null)
    .isString().withMessage('Dial code must be a string')
    .trim()
    .isLength({ min: 1, max: 20 }).withMessage('Dial code must be between 1 and 20 characters'),

  body('phone_number')
    .optional()
    .if(value => value !== null)
    .isString().withMessage('Phone number must be a string')
    .trim()
    .isLength({ min: 3, max: 20 }).withMessage('Phone number must be between 3 and 20 characters')
    .matches(/^[+0-9\s\-()]*$/).withMessage('Phone number can only contain digits, spaces, +, -, and parentheses'),

  body('address')
    .optional()
    .if(value => value !== null)
    .isString().withMessage('Address must be a string')
    .trim()
    .isLength({ max: 500 }).withMessage('Address cannot exceed 500 characters'),

  body('client_status')
    .optional()
    .isString().withMessage('Client status must be a string')
    .isIn(Object.values(ClientStatus)).withMessage('Client status must be a valid status')
];

/**
 * Validation chains for listing clients
 */
export const listClientsValidation: ValidationChain[] = [
  // Pagination parameters
  query('page')
    .optional()
    .isInt({ min: 1 }).withMessage('Page must be a positive integer')
    .toInt(),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100')
    .toInt(),

  // Sorting parameters
  query('sortBy')
    .optional()
    .isString().withMessage('Sort by must be a string')
    .isIn(['client_id', 'full_name', 'email_address', 'client_status', 'created_at', 'updated_at'])
    .withMessage('Sort by must be a valid field'),

  query('sortOrder')
    .optional()
    .isString().withMessage('Sort order must be a string')
    .isIn(['asc', 'desc']).withMessage('Sort order must be asc or desc'),

  // Filter parameters
  query('search')
    .optional()
    .isString().withMessage('Search must be a string')
    .trim()
    .isLength({ max: 255 }).withMessage('Search term cannot exceed 255 characters'),

  query('tenantId')
    .optional()
    .isInt({ min: 1 }).withMessage('Tenant ID must be a positive integer')
    .toInt(),

  query('status')
    .optional()
    .isString().withMessage('Status must be a string')
    .isIn(Object.values(ClientStatus)).withMessage('Status must be a valid client status')
];

// ==================== CLIENT-TENANT ASSOCIATION DTOs ====================

/**
 * DTO interface for creating a new client-tenant association
 */
export interface CreateClientTenantDto {
  client_id: number;
  tenant_id: number;
}

/**
 * Validation chains for creating a client-tenant association
 */
export const createClientTenantValidation: ValidationChain[] = [
  body('client_id')
    .exists().withMessage('Client ID is required')
    .isInt({ min: 1 }).withMessage('Valid client ID is required')
    .toInt(),

  body('tenant_id')
    .exists().withMessage('Tenant ID is required')
    .isInt({ min: 1 }).withMessage('Valid tenant ID is required')
    .toInt()
];

/**
 * Enhanced filter DTO with proper typing for validated query parameters
 */
export interface ClientListQueryDto {
  // Pagination
  page?: number;
  limit?: number;
  
  // Sorting
  sortBy?: 'client_id' | 'full_name' | 'email_address' | 'client_status' | 'created_at' | 'updated_at';
  sortOrder?: 'asc' | 'desc';
  
  // Filters
  search?: string;
  tenantId?: number;
  status?: ClientStatus;
}