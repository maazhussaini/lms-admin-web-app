/**
 * @file dtos/tenant/tenant.dto.ts
 * @description Data Transfer Objects for Tenant operations with validation rules
 */

import { body } from 'express-validator';
import { TenantStatus, ContactType, ClientStatus } from '@shared/types/tenant.types';

/**
 * DTO for creating a new tenant
 */
export class CreateTenantDto {
  /**
   * Tenant name - required, must be unique
   */
  tenant_name!: string;

  /**
   * Optional URL for light theme logo
   */
  logo_url_light?: string;

  /**
   * Optional URL for dark theme logo
   */
  logo_url_dark?: string;

  /**
   * Optional URL for favicon
   */
  favicon_url?: string;

  /**
   * Optional JSON theme configuration
   */
  theme?: Record<string, any>;

  /**
   * Optional tenant status
   */
  tenant_status?: TenantStatus;

  /**
   * Static validation method for express-validator middleware
   */
  static validate() {
    return [
      body('tenant_name')
        .isString()
        .withMessage('Tenant name is required')
        .notEmpty()
        .withMessage('Tenant name cannot be empty')
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage('Tenant name must be between 2 and 100 characters'),
      body('logo_url_light')
        .optional()
        .isURL()
        .withMessage('Logo URL must be a valid URL')
        .trim(),
      body('logo_url_dark')
        .optional()
        .isURL()
        .withMessage('Dark logo URL must be a valid URL')
        .trim(),
      body('favicon_url')
        .optional()
        .isURL()
        .withMessage('Favicon URL must be a valid URL')
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
        .isInt({ min: 1, max: 5 })
        .withMessage('Tenant status must be a valid status code')
        .toInt()
        .custom(value => {
          if (!Object.values(TenantStatus).includes(value)) {
            throw new Error('Invalid tenant status');
          }
          return true;
        })
    ];
  }
}

/**
 * DTO for updating an existing tenant
 */
export class UpdateTenantDto {
  /**
   * Optional tenant name for updates
   */
  tenant_name?: string;

  /**
   * Optional URL for light theme logo
   */
  logo_url_light?: string | null;

  /**
   * Optional URL for dark theme logo
   */
  logo_url_dark?: string | null;

  /**
   * Optional URL for favicon
   */
  favicon_url?: string | null;

  /**
   * Optional JSON theme configuration
   */
  theme?: Record<string, any> | null;

  /**
   * Optional tenant status
   */
  tenant_status?: TenantStatus;

  /**
   * Static validation method for express-validator middleware
   */
  static validate() {
    return [
      body('tenant_name')
        .optional()
        .isString()
        .withMessage('Tenant name must be a string')
        .notEmpty()
        .withMessage('Tenant name cannot be empty')
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage('Tenant name must be between 2 and 100 characters'),
      body('logo_url_light')
        .optional()
        .if(value => value !== null)
        .isURL()
        .withMessage('Logo URL must be a valid URL')
        .trim(),
      body('logo_url_dark')
        .optional()
        .if(value => value !== null)
        .isURL()
        .withMessage('Dark logo URL must be a valid URL')
        .trim(),
      body('favicon_url')
        .optional()
        .if(value => value !== null)
        .isURL()
        .withMessage('Favicon URL must be a valid URL')
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
        .isInt({ min: 1, max: 5 })
        .withMessage('Tenant status must be a valid status code')
        .toInt()
        .custom(value => {
          if (!Object.values(TenantStatus).includes(value)) {
            throw new Error('Invalid tenant status');
          }
          return true;
        })
    ];
  }
}

/**
 * @file dtos/tenant/clientTenant.dto.ts
 * @description Data Transfer Objects for Client-Tenant association with validation rules
 */

// import { body } from 'express-validator';

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

/**
 * @file dtos/tenant/tenantContact.dto.ts
 * @description Data Transfer Objects for Tenant Contact information (phone, email) with validation rules
 */

// import { body } from 'express-validator';

/**
 * DTO for creating a new tenant phone number
 */
export class CreateTenantPhoneNumberDto {
  /**
   * International dialing code - required
   */
  dial_code!: string;

  /**
   * Phone number - required
   */
  phone_number!: string;

  /**
   * Optional ISO country code (2 characters)
   */
  iso_country_code?: string;

  /**
   * Is this the primary phone for the contact type - required
   */
  is_primary!: boolean;

  /**
   * Contact type - required
   */
  contact_type!: ContactType;

  /**
   * Static validation method for express-validator middleware
   */
  static validate() {
    return [
      body('dial_code')
        .isString()
        .withMessage('Dial code is required')
        .notEmpty()
        .withMessage('Dial code cannot be empty')
        .trim()
        .isLength({ min: 1, max: 20 })
        .withMessage('Dial code must be between 1 and 20 characters')
        .matches(/^[+0-9]*$/)
        .withMessage('Dial code can only contain digits and + symbol'),
      body('phone_number')
        .isString()
        .withMessage('Phone number is required')
        .notEmpty()
        .withMessage('Phone number cannot be empty')
        .trim()
        .isLength({ min: 3, max: 20 })
        .withMessage('Phone number must be between 3 and 20 characters')
        .matches(/^[0-9\s\-()]*$/)
        .withMessage('Phone number can only contain digits, spaces, -, and parentheses'),
      body('iso_country_code')
        .optional()
        .isString()
        .withMessage('Country code must be a string')
        .trim()
        .isLength({ min: 2, max: 2 })
        .withMessage('Country code must be exactly 2 characters')
        .isAlpha()
        .withMessage('Country code must contain only alphabetic characters')
        .isUppercase()
        .withMessage('Country code must be uppercase'),
      body('is_primary')
        .isBoolean()
        .withMessage('Primary flag must be a boolean')
        .toBoolean(),
      body('contact_type')
        .isInt({ min: 1, max: 4 })
        .withMessage('Contact type must be a valid type code')
        .toInt()
        .custom(value => {
          if (!Object.values(ContactType).includes(value)) {
            throw new Error('Invalid contact type');
          }
          return true;
        })
    ];
  }
}

/**
 * DTO for updating an existing tenant phone number
 */
export class UpdateTenantPhoneNumberDto {
  /**
   * Optional international dialing code
   */
  dial_code?: string;

  /**
   * Optional phone number
   */
  phone_number?: string;

  /**
   * Optional ISO country code (2 characters)
   */
  iso_country_code?: string | null;

  /**
   * Optional primary phone flag
   */
  is_primary?: boolean;

  /**
   * Optional contact type
   */
  contact_type?: ContactType;

  /**
   * Static validation method for express-validator middleware
   */
  static validate() {
    return [
      body('dial_code')
        .optional()
        .isString()
        .withMessage('Dial code must be a string')
        .notEmpty()
        .withMessage('Dial code cannot be empty')
        .trim()
        .isLength({ min: 1, max: 20 })
        .withMessage('Dial code must be between 1 and 20 characters')
        .matches(/^[+0-9]*$/)
        .withMessage('Dial code can only contain digits and + symbol'),
      body('phone_number')
        .optional()
        .isString()
        .withMessage('Phone number must be a string')
        .notEmpty()
        .withMessage('Phone number cannot be empty')
        .trim()
        .isLength({ min: 3, max: 20 })
        .withMessage('Phone number must be between 3 and 20 characters')
        .matches(/^[0-9\s\-()]*$/)
        .withMessage('Phone number can only contain digits, spaces, -, and parentheses'),
      body('iso_country_code')
        .optional()
        .if(value => value !== null)
        .isString()
        .withMessage('Country code must be a string')
        .trim()
        .isLength({ min: 2, max: 2 })
        .withMessage('Country code must be exactly 2 characters')
        .isAlpha()
        .withMessage('Country code must contain only alphabetic characters')
        .isUppercase()
        .withMessage('Country code must be uppercase'),
      body('is_primary')
        .optional()
        .isBoolean()
        .withMessage('Primary flag must be a boolean')
        .toBoolean(),
      body('contact_type')
        .optional()
        .isInt({ min: 1, max: 4 })
        .withMessage('Contact type must be a valid type code')
        .toInt()
        .custom(value => {
          if (!Object.values(ContactType).includes(value)) {
            throw new Error('Invalid contact type');
          }
          return true;
        })
    ];
  }
}

/**
 * DTO for creating a new tenant email address
 */
export class CreateTenantEmailAddressDto {
  /**
   * Email address - required
   */
  email_address!: string;

  /**
   * Is this the primary email for the contact type - required
   */
  is_primary!: boolean;

  /**
   * Contact type - required
   */
  contact_type!: ContactType;

  /**
   * Static validation method for express-validator middleware
   */
  static validate() {
    return [
      body('email_address')
        .isEmail()
        .withMessage('Valid email address is required')
        .normalizeEmail()
        .trim()
        .isLength({ max: 255 })
        .withMessage('Email address cannot exceed 255 characters'),
      body('is_primary')
        .isBoolean()
        .withMessage('Primary flag must be a boolean')
        .toBoolean(),
      body('contact_type')
        .isInt({ min: 1, max: 4 })
        .withMessage('Contact type must be a valid type code')
        .toInt()
        .custom(value => {
          if (!Object.values(ContactType).includes(value)) {
            throw new Error('Invalid contact type');
          }
          return true;
        })
    ];
  }
}

/**
 * DTO for updating an existing tenant email address
 */
export class UpdateTenantEmailAddressDto {
  /**
   * Optional email address
   */
  email_address?: string;

  /**
   * Optional primary email flag
   */
  is_primary?: boolean;

  /**
   * Optional contact type
   */
  contact_type?: ContactType;

  /**
   * Static validation method for express-validator middleware
   */
  static validate() {
    return [
      body('email_address')
        .optional()
        .isEmail()
        .withMessage('Email address must be valid')
        .normalizeEmail()
        .trim()
        .isLength({ max: 255 })
        .withMessage('Email address cannot exceed 255 characters'),
      body('is_primary')
        .optional()
        .isBoolean()
        .withMessage('Primary flag must be a boolean')
        .toBoolean(),
      body('contact_type')
        .optional()
        .isInt({ min: 1, max: 4 })
        .withMessage('Contact type must be a valid type code')
        .toInt()
        .custom(value => {
          if (!Object.values(ContactType).includes(value)) {
            throw new Error('Invalid contact type');
          }
          return true;
        })
    ];
  }
}

/**
 * @file dtos/tenant/client.dto.ts
 * @description Data Transfer Objects for Client operations with validation rules
 */

// import { body } from 'express-validator';

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
   * Tenant ID to which this client belongs
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
        .isInt({ min: 1, max: 4 })
        .withMessage('Client status must be a valid status code')
        .toInt()
        .custom(value => {
          if (!Object.values(ClientStatus).includes(value)) {
            throw new Error('Invalid client status');
          }
          return true;
        }),
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
        .isInt({ min: 1, max: 4 })
        .withMessage('Client status must be a valid status code')
        .toInt()
        .custom(value => {
          if (!Object.values(ClientStatus).includes(value)) {
            throw new Error('Invalid client status');
          }
          return true;
        })
    ];
  }
}
