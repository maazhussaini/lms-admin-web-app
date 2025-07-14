/**
 * @file dtos/tenant/tenant.dto.ts
 * @description Data Transfer Objects for Tenant operations with validation rules
 */

import { body, query, ValidationChain } from 'express-validator';
import {
  TenantStatus,
  ContactType
} from '@/types/enums.types';

/**
 * DTO interface for creating a new tenant
 */
export interface CreateTenantDto {
  tenant_name: string;
  logo_url_light?: string;
  logo_url_dark?: string;
  favicon_url?: string;
  theme?: Record<string, any>;
  tenant_status?: TenantStatus;
}

/**
 * DTO interface for updating an existing tenant
 */
export interface UpdateTenantDto {
  tenant_name?: string;
  logo_url_light?: string | null;
  logo_url_dark?: string | null;
  favicon_url?: string | null;
  theme?: Record<string, any> | null;
  tenant_status?: TenantStatus;
}

/**
 * DTO interface for filtering tenants in list operations
 */
export interface TenantFilterDto {
  search?: string;
  status?: TenantStatus;
}

/**
 * Validation chains for creating a tenant
 */
export const createTenantValidation: ValidationChain[] = [
  body('tenant_name')
    .exists().withMessage('Tenant name is required')
    .isString().withMessage('Tenant name must be a string')
    .notEmpty().withMessage('Tenant name cannot be empty')
    .trim()
    .isLength({ min: 2, max: 100 }).withMessage('Tenant name must be between 2 and 100 characters'),

  body('logo_url_light')
    .optional()
    .isURL().withMessage('Light logo URL must be a valid URL')
    .trim(),

  body('logo_url_dark')
    .optional()
    .isURL().withMessage('Dark logo URL must be a valid URL')
    .trim(),

  body('favicon_url')
    .optional()
    .isURL().withMessage('Favicon URL must be a valid URL')
    .trim(),

  body('theme')
    .optional()
    .custom(value => {
      try {
        if (typeof value === 'string') {
          JSON.parse(value);
        } else if (typeof value !== 'object') {
          throw new Error('Theme must be a valid JSON object');
        }
        return true;
      } catch (error) {
        throw new Error('Theme must be a valid JSON object');
      }
    }),

  body('tenant_status')
    .optional()
    .isString().withMessage('Tenant status must be a string')
    .isIn(Object.values(TenantStatus)).withMessage('Tenant status must be a valid status')
];

/**
 * Validation chains for updating a tenant
 */
export const updateTenantValidation: ValidationChain[] = [
  body('tenant_name')
    .optional()
    .isString().withMessage('Tenant name must be a string')
    .notEmpty().withMessage('Tenant name cannot be empty')
    .trim()
    .isLength({ min: 2, max: 100 }).withMessage('Tenant name must be between 2 and 100 characters'),

  body('logo_url_light')
    .optional()
    .if(value => value !== null)
    .isURL().withMessage('Light logo URL must be a valid URL')
    .trim(),

  body('logo_url_dark')
    .optional()
    .if(value => value !== null)
    .isURL().withMessage('Dark logo URL must be a valid URL')
    .trim(),

  body('favicon_url')
    .optional()
    .if(value => value !== null)
    .isURL().withMessage('Favicon URL must be a valid URL')
    .trim(),

  body('theme')
    .optional()
    .custom(value => {
      try {
        if (value === null) return true;
        if (typeof value === 'string') {
          JSON.parse(value);
        } else if (typeof value !== 'object') {
          throw new Error('Theme must be a valid JSON object');
        }
        return true;
      } catch (error) {
        throw new Error('Theme must be a valid JSON object');
      }
    }),

  body('tenant_status')
    .optional()
    .isString().withMessage('Tenant status must be a string')
    .isIn(Object.values(TenantStatus)).withMessage('Tenant status must be a valid status')
];

/**
 * Validation chains for listing tenants
 */
export const listTenantsValidation: ValidationChain[] = [
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
    .isIn(['tenant_id', 'tenant_name', 'tenant_status', 'created_at', 'updated_at'])
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

  query('status')
    .optional()
    .isString().withMessage('Status must be a string')
    .isIn(Object.values(TenantStatus)).withMessage('Status must be a valid tenant status')
];

// ==================== TENANT CONTACT INFORMATION DTOs ====================

/**
 * DTO interface for creating a new tenant phone number
 */
export interface CreateTenantPhoneNumberDto {
  dial_code: string;
  phone_number: string;
  iso_country_code?: string;
  is_primary: boolean;
  contact_type: ContactType;
}

/**
 * DTO interface for updating an existing tenant phone number
 */
export interface UpdateTenantPhoneNumberDto {
  dial_code?: string;
  phone_number?: string;
  iso_country_code?: string | null;
  is_primary?: boolean;
  contact_type?: ContactType;
}

/**
 * Validation chains for creating a tenant phone number
 */
export const createTenantPhoneNumberValidation: ValidationChain[] = [
  body('dial_code')
    .exists().withMessage('Dial code is required')
    .isString().withMessage('Dial code must be a string')
    .notEmpty().withMessage('Dial code cannot be empty')
    .trim()
    .isLength({ min: 1, max: 20 }).withMessage('Dial code must be between 1 and 20 characters')
    .matches(/^[+0-9]*$/).withMessage('Dial code can only contain digits and + symbol'),

  body('phone_number')
    .exists().withMessage('Phone number is required')
    .isString().withMessage('Phone number must be a string')
    .notEmpty().withMessage('Phone number cannot be empty')
    .trim()
    .isLength({ min: 3, max: 20 }).withMessage('Phone number must be between 3 and 20 characters')
    .matches(/^[0-9\s\-()]*$/).withMessage('Phone number can only contain digits, spaces, -, and parentheses'),

  body('iso_country_code')
    .optional()
    .isString().withMessage('Country code must be a string')
    .trim()
    .isLength({ min: 2, max: 2 }).withMessage('Country code must be exactly 2 characters')
    .isAlpha().withMessage('Country code must contain only alphabetic characters')
    .isUppercase().withMessage('Country code must be uppercase'),

  body('is_primary')
    .exists().withMessage('Primary flag is required')
    .isBoolean().withMessage('Primary flag must be a boolean')
    .toBoolean(),

  body('contact_type')
    .exists().withMessage('Contact type is required')
    .isString().withMessage('Contact type must be a string')
    .isIn(Object.values(ContactType)).withMessage('Contact type must be a valid contact type')
];

/**
 * Validation chains for updating a tenant phone number
 */
export const updateTenantPhoneNumberValidation: ValidationChain[] = [
  body('dial_code')
    .optional()
    .isString().withMessage('Dial code must be a string')
    .notEmpty().withMessage('Dial code cannot be empty')
    .trim()
    .isLength({ min: 1, max: 20 }).withMessage('Dial code must be between 1 and 20 characters')
    .matches(/^[+0-9]*$/).withMessage('Dial code can only contain digits and + symbol'),

  body('phone_number')
    .optional()
    .isString().withMessage('Phone number must be a string')
    .notEmpty().withMessage('Phone number cannot be empty')
    .trim()
    .isLength({ min: 3, max: 20 }).withMessage('Phone number must be between 3 and 20 characters')
    .matches(/^[0-9\s\-()]*$/).withMessage('Phone number can only contain digits, spaces, -, and parentheses'),

  body('iso_country_code')
    .optional()
    .if(value => value !== null)
    .isString().withMessage('Country code must be a string')
    .trim()
    .isLength({ min: 2, max: 2 }).withMessage('Country code must be exactly 2 characters')
    .isAlpha().withMessage('Country code must contain only alphabetic characters')
    .isUppercase().withMessage('Country code must be uppercase'),

  body('is_primary')
    .optional()
    .isBoolean().withMessage('Primary flag must be a boolean')
    .toBoolean(),

  body('contact_type')
    .optional()
    .isString().withMessage('Contact type must be a string')
    .isIn(Object.values(ContactType)).withMessage('Contact type must be a valid contact type')
];

/**
 * Validation chains for listing tenant phone numbers
 */
export const listTenantPhoneNumbersValidation: ValidationChain[] = [
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
    .isIn(['tenant_phone_number_id', 'phone_number', 'contact_type', 'created_at', 'updated_at'])
    .withMessage('Sort by must be a valid field'),

  query('sortOrder')
    .optional()
    .isString().withMessage('Sort order must be a string')
    .isIn(['asc', 'desc']).withMessage('Sort order must be asc or desc'),

  // Filter parameters
  query('contactType')
    .optional()
    .isString().withMessage('Contact type must be a string')
    .isIn(Object.values(ContactType)).withMessage('Contact type must be a valid type'),

  query('isPrimary')
    .optional()
    .isBoolean().withMessage('isPrimary must be a boolean')
    .toBoolean()
];

// ==================== TENANT EMAIL ADDRESS DTOs ====================

/**
 * DTO interface for creating a new tenant email address
 */
export interface CreateTenantEmailAddressDto {
  email_address: string;
  is_primary: boolean;
  contact_type: ContactType;
}

/**
 * DTO interface for updating an existing tenant email address
 */
export interface UpdateTenantEmailAddressDto {
  email_address?: string;
  is_primary?: boolean;
  contact_type?: ContactType;
}

/**
 * Validation chains for creating a tenant email address
 */
export const createTenantEmailAddressValidation: ValidationChain[] = [
  body('email_address')
    .exists().withMessage('Email address is required')
    .isEmail().withMessage('Valid email address is required')
    .normalizeEmail()
    .trim()
    .isLength({ max: 255 }).withMessage('Email address cannot exceed 255 characters'),

  body('is_primary')
    .exists().withMessage('Primary flag is required')
    .isBoolean().withMessage('Primary flag must be a boolean')
    .toBoolean(),

  body('contact_type')
    .exists().withMessage('Contact type is required')
    .isString().withMessage('Contact type must be a string')
    .isIn(Object.values(ContactType)).withMessage('Contact type must be a valid contact type')
];

/**
 * Validation chains for updating a tenant email address
 */
export const updateTenantEmailAddressValidation: ValidationChain[] = [
  body('email_address')
    .optional()
    .isEmail().withMessage('Email address must be valid')
    .normalizeEmail()
    .trim()
    .isLength({ max: 255 }).withMessage('Email address cannot exceed 255 characters'),

  body('is_primary')
    .optional()
    .isBoolean().withMessage('Primary flag must be a boolean')
    .toBoolean(),

  body('contact_type')
    .optional()
    .isString().withMessage('Contact type must be a string')
    .isIn(Object.values(ContactType)).withMessage('Contact type must be a valid contact type')
];

/**
 * Validation chains for listing tenant email addresses
 */
export const listTenantEmailAddressesValidation: ValidationChain[] = [
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
    .isIn(['tenant_email_address_id', 'email_address', 'contact_type', 'created_at', 'updated_at'])
    .withMessage('Sort by must be a valid field'),

  query('sortOrder')
    .optional()
    .isString().withMessage('Sort order must be a string')
    .isIn(['asc', 'desc']).withMessage('Sort order must be asc or desc'),

  // Filter parameters
  query('contactType')
    .optional()
    .isString().withMessage('Contact type must be a string')
    .isIn(Object.values(ContactType)).withMessage('Contact type must be a valid type'),

  query('isPrimary')
    .optional()
    .isBoolean().withMessage('isPrimary must be a boolean')
    .toBoolean()
];

/**
 * Validation chains for listing tenant clients
 */
export const listTenantClientsValidation: ValidationChain[] = [
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
    .isIn(['client_id', 'full_name', 'email_address', 'created_at', 'updated_at'])
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
    .isLength({ min: 1, max: 100 }).withMessage('Search term must be between 1 and 100 characters'),

  query('status')
    .optional()
    .isString().withMessage('Status must be a string')
    .trim()
];

/**
 * Enhanced filter DTO with proper typing for validated query parameters
 */
export interface TenantListQueryDto {
  // Pagination
  page?: number;
  limit?: number;
  
  // Sorting
  sortBy?: 'tenant_id' | 'tenant_name' | 'tenant_status' | 'created_at' | 'updated_at';
  sortOrder?: 'asc' | 'desc';
  
  // Filters
  search?: string;
  status?: TenantStatus;
}

/**
 * Enhanced filter DTO for tenant phone numbers
 */
export interface TenantPhoneNumberListQueryDto {
  // Pagination
  page?: number;
  limit?: number;
  
  // Sorting
  sortBy?: 'tenant_phone_number_id' | 'phone_number' | 'contact_type' | 'created_at' | 'updated_at';
  sortOrder?: 'asc' | 'desc';
  
  // Filters
  contactType?: ContactType;
  isPrimary?: boolean;
}

/**
 * Enhanced filter DTO for tenant email addresses
 */
export interface TenantEmailAddressListQueryDto {
  // Pagination
  page?: number;
  limit?: number;
  
  // Sorting
  sortBy?: 'tenant_email_address_id' | 'email_address' | 'contact_type' | 'created_at' | 'updated_at';
  sortOrder?: 'asc' | 'desc';
  
  // Filters
  contactType?: ContactType;
  isPrimary?: boolean;
}

/**
 * Enhanced filter DTO for tenant clients
 */
export interface TenantClientListQueryDto {
  // Pagination
  page?: number;
  limit?: number;
  
  // Sorting
  sortBy?: 'client_id' | 'full_name' | 'email_address' | 'created_at' | 'updated_at';
  sortOrder?: 'asc' | 'desc';
  
  // Filters
  search?: string;
  status?: string;
}

