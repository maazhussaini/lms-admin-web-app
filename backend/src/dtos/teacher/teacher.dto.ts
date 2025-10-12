import { body, query, ValidationChain } from 'express-validator';
import { Gender } from '@/types/enums.types';
import { BaseFilterDto } from '@/utils/service.types';

/**
 * DTO interface for teacher phone number
 */
export interface CreateTeacherPhoneNumberDto {
  dial_code: string;
  phone_number: string;
  iso_country_code?: string;
  is_primary?: boolean;
}

/**
 * DTO interface for teacher email address
 */
export interface CreateTeacherEmailAddressDto {
  email_address: string;
  is_primary?: boolean;
  priority?: number;
}

/**
 * DTO interface for creating a new teacher
 */
export interface CreateTeacherDto {
  tenant_id?: number; // Required for SUPER_ADMIN, ignored for others
  full_name: string;
  first_name: string;
  middle_name?: string;
  last_name: string;
  email_address: string; // Primary email (deprecated - use emailAddresses array)
  username: string;
  password: string;
  country_id?: number;
  state_id?: number;
  city_id?: number;
  address?: string;
  date_of_birth?: string;
  profile_picture_url?: string;
  zip_code?: string;
  age?: number;
  gender?: Gender;
  teacher_qualification?: string;
  joining_date?: string;
  // Multiple contact arrays
  phoneNumbers?: CreateTeacherPhoneNumberDto[];
  emailAddresses?: CreateTeacherEmailAddressDto[];
}

/**
 * DTO interface for updating an existing teacher
 */
export interface UpdateTeacherDto {
  full_name?: string;
  first_name?: string;
  middle_name?: string | null;
  last_name?: string;
  country_id?: number | null;
  state_id?: number | null;
  city_id?: number | null;
  address?: string | null;
  date_of_birth?: string | null;
  profile_picture_url?: string | null;
  zip_code?: string | null;
  age?: number | null;
  gender?: Gender | null;
  teacher_qualification?: string | null;
  joining_date?: string | null;
  // Multiple contact arrays (soft delete + insert strategy)
  phoneNumbers?: CreateTeacherPhoneNumberDto[];
  emailAddresses?: CreateTeacherEmailAddressDto[];
}

/**
 * DTO interface for filtering teachers in list operations
 */
export interface TeacherFilterDto extends BaseFilterDto {
  gender?: Gender;
  countryId?: number;
  stateId?: number;
  cityId?: number;
  ageMin?: number;
  ageMax?: number;
}

/**
 * Response DTO for teacher entities
 */
export interface TeacherResponseDto {
  teacher_id: number;
  full_name: string;
  first_name: string;
  middle_name?: string;
  last_name: string;
  username: string;
  primary_email?: string;
  country_id?: number;
  state_id?: number;
  city_id?: number;
  address?: string;
  date_of_birth?: string;
  profile_picture_url?: string;
  zip_code?: string;
  age?: number;
  gender?: Gender;
  teacher_qualification?: string;
  joining_date?: string;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

/**
 * Validation chains for teacher phone numbers
 */
export const teacherPhoneNumberValidation: ValidationChain[] = [
  body('phoneNumbers')
    .optional()
    .isArray().withMessage('Phone numbers must be an array'),

  body('phoneNumbers.*.dial_code')
    .if(body('phoneNumbers').exists())
    .notEmpty().withMessage('Dial code is required for phone numbers')
    .isString().withMessage('Dial code must be a string')
    .trim()
    .isLength({ min: 1, max: 10 }).withMessage('Dial code must be between 1 and 10 characters'),

  body('phoneNumbers.*.phone_number')
    .if(body('phoneNumbers').exists())
    .notEmpty().withMessage('Phone number is required')
    .isString().withMessage('Phone number must be a string')
    .trim()
    .isLength({ min: 7, max: 20 }).withMessage('Phone number must be between 7 and 20 characters'),

  body('phoneNumbers.*.iso_country_code')
    .optional()
    .isString().withMessage('ISO country code must be a string')
    .trim()
    .isLength({ min: 2, max: 3 }).withMessage('ISO country code must be 2-3 characters'),

  body('phoneNumbers.*.is_primary')
    .optional()
    .isBoolean().withMessage('is_primary must be a boolean')
    .toBoolean()
];

/**
 * Validation chains for teacher email addresses
 */
export const teacherEmailAddressValidation: ValidationChain[] = [
  body('emailAddresses')
    .optional()
    .isArray().withMessage('Email addresses must be an array'),

  body('emailAddresses.*.email_address')
    .if(body('emailAddresses').exists())
    .notEmpty().withMessage('Email address is required')
    .isEmail().withMessage('Email address must be valid')
    .normalizeEmail()
    .trim()
    .isLength({ max: 255 }).withMessage('Email address cannot exceed 255 characters'),

  body('emailAddresses.*.is_primary')
    .optional()
    .isBoolean().withMessage('is_primary must be a boolean')
    .toBoolean(),

  body('emailAddresses.*.priority')
    .optional()
    .isInt({ min: 1, max: 10 }).withMessage('Priority must be between 1 and 10')
    .toInt()
];

/**
 * Validation chains for creating a teacher
 */
export const createTeacherValidation: ValidationChain[] = [
  body('tenant_id')
    .optional()
    .isInt({ min: 1 }).withMessage('Tenant ID must be a positive integer')
    .toInt(),

  body('full_name')
    .exists().withMessage('Full name is required')
    .isString().withMessage('Full name must be a string')
    .notEmpty().withMessage('Full name cannot be empty')
    .trim()
    .isLength({ min: 2, max: 255 }).withMessage('Full name must be between 2 and 255 characters'),

  body('first_name')
    .exists().withMessage('First name is required')
    .isString().withMessage('First name must be a string')
    .notEmpty().withMessage('First name cannot be empty')
    .trim()
    .isLength({ min: 1, max: 100 }).withMessage('First name must be between 1 and 100 characters'),

  body('middle_name')
    .optional({ checkFalsy: true })
    .isString().withMessage('Middle name must be a string')
    .trim()
    .isLength({ min: 1, max: 100 }).withMessage('Middle name must be between 1 and 100 characters'),

  body('last_name')
    .exists().withMessage('Last name is required')
    .isString().withMessage('Last name must be a string')
    .notEmpty().withMessage('Last name cannot be empty')
    .trim()
    .isLength({ min: 1, max: 100 }).withMessage('Last name must be between 1 and 100 characters'),

  body('email_address')
    .exists().withMessage('Email address is required')
    .isEmail().withMessage('Email address must be valid')
    .normalizeEmail()
    .trim()
    .isLength({ max: 255 }).withMessage('Email address cannot exceed 255 characters'),

  body('username')
    .exists().withMessage('Username is required')
    .isString().withMessage('Username must be a string')
    .notEmpty().withMessage('Username cannot be empty')
    .trim()
    .isLength({ min: 3, max: 50 }).withMessage('Username must be between 3 and 50 characters')
    .isAlphanumeric().withMessage('Username must contain only letters and numbers'),

  body('password')
    .exists().withMessage('Password is required')
    .isString().withMessage('Password must be a string')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
    .matches(/[A-Z]/).withMessage('Password must contain at least one uppercase letter')
    .matches(/[a-z]/).withMessage('Password must contain at least one lowercase letter')
    .matches(/[0-9]/).withMessage('Password must contain at least one number')
    .matches(/[!@#$%^&*(),.?":{}|<>]/).withMessage('Password must contain at least one special character'),

  body('country_id')
    .optional()
    .isInt({ min: 1 }).withMessage('Country ID must be a positive integer')
    .toInt(),

  body('state_id')
    .optional()
    .isInt({ min: 1 }).withMessage('State ID must be a positive integer')
    .toInt(),

  body('city_id')
    .optional()
    .isInt({ min: 1 }).withMessage('City ID must be a positive integer')
    .toInt(),

  body('address')
    .optional()
    .isString().withMessage('Address must be a string')
    .trim(),

  body('date_of_birth')
    .optional()
    .isISO8601().withMessage('Date of birth must be a valid ISO8601 date (YYYY-MM-DD)')
    .toDate(),

  body('profile_picture_url')
    .optional()
    .isURL().withMessage('Profile picture URL must be a valid URL')
    .trim()
    .isLength({ max: 500 }).withMessage('Profile picture URL cannot exceed 500 characters'),

  body('zip_code')
    .optional()
    .isString().withMessage('Zip code must be a string')
    .trim()
    .isLength({ min: 3, max: 20 }).withMessage('Zip code must be between 3 and 20 characters'),

  body('age')
    .optional()
    .isInt({ min: 18, max: 100 }).withMessage('Age must be between 18 and 100')
    .toInt(),

  body('gender')
    .optional()
    .isIn(Object.values(Gender)).withMessage('Gender must be a valid value'),

  body('teacher_qualification')
    .optional()
    .isString().withMessage('Teacher qualification must be a string')
    .trim(),

  body('joining_date')
    .optional()
    .isISO8601().withMessage('Joining date must be a valid ISO8601 date (YYYY-MM-DD)')
    .toDate()
];

/**
 * Validation chains for updating a teacher
 */
export const updateTeacherValidation: ValidationChain[] = [
  body('full_name')
    .optional()
    .isString().withMessage('Full name must be a string')
    .notEmpty().withMessage('Full name cannot be empty')
    .trim()
    .isLength({ min: 2, max: 255 }).withMessage('Full name must be between 2 and 255 characters'),

  body('first_name')
    .optional()
    .isString().withMessage('First name must be a string')
    .notEmpty().withMessage('First name cannot be empty')
    .trim()
    .isLength({ min: 1, max: 100 }).withMessage('First name must be between 1 and 100 characters'),

  body('middle_name')
    .optional()
    .if(value => value !== null)
    .isString().withMessage('Middle name must be a string')
    .trim()
    .isLength({ min: 1, max: 100 }).withMessage('Middle name must be between 1 and 100 characters'),

  body('last_name')
    .optional()
    .isString().withMessage('Last name must be a string')
    .notEmpty().withMessage('Last name cannot be empty')
    .trim()
    .isLength({ min: 1, max: 100 }).withMessage('Last name must be between 1 and 100 characters'),

  body('country_id')
    .optional()
    .if(value => value !== null)
    .isInt({ min: 1 }).withMessage('Country ID must be a positive integer')
    .toInt(),

  body('state_id')
    .optional()
    .if(value => value !== null)
    .isInt({ min: 1 }).withMessage('State ID must be a positive integer')
    .toInt(),

  body('city_id')
    .optional()
    .if(value => value !== null)
    .isInt({ min: 1 }).withMessage('City ID must be a positive integer')
    .toInt(),

  body('address')
    .optional()
    .if(value => value !== null)
    .isString().withMessage('Address must be a string')
    .trim(),

  body('date_of_birth')
    .optional()
    .if(value => value !== null)
    .isISO8601().withMessage('Date of birth must be a valid ISO8601 date (YYYY-MM-DD)')
    .toDate(),

  body('profile_picture_url')
    .optional()
    .if(value => value !== null)
    .isURL().withMessage('Profile picture URL must be a valid URL')
    .trim()
    .isLength({ max: 500 }).withMessage('Profile picture URL cannot exceed 500 characters'),

  body('zip_code')
    .optional()
    .if(value => value !== null)
    .isString().withMessage('Zip code must be a string')
    .trim()
    .isLength({ min: 3, max: 20 }).withMessage('Zip code must be between 3 and 20 characters'),

  body('age')
    .optional()
    .if(value => value !== null)
    .isInt({ min: 18, max: 100 }).withMessage('Age must be between 18 and 100')
    .toInt(),

  body('gender')
    .optional()
    .if(value => value !== null)
    .isIn(Object.values(Gender)).withMessage('Gender must be a valid value'),

  body('teacher_qualification')
    .optional()
    .if(value => value !== null)
    .isString().withMessage('Teacher qualification must be a string')
    .trim(),

  body('joining_date')
    .optional()
    .if(value => value !== null)
    .isISO8601().withMessage('Joining date must be a valid ISO8601 date (YYYY-MM-DD)')
    .toDate()
];

/**
 * Validation chains for querying teachers
 */
export const teacherQueryValidation: ValidationChain[] = [
  query('page')
    .optional()
    .isInt({ min: 1 }).withMessage('Page must be a positive integer')
    .toInt(),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100')
    .toInt(),

  query('sortBy')
    .optional()
    .isString().withMessage('Sort field must be a string')
    .trim(),

  query('sortOrder')
    .optional()
    .isIn(['asc', 'desc']).withMessage('Sort order must be asc or desc'),

  query('search')
    .optional()
    .isString().withMessage('Search term must be a string')
    .trim(),

  query('gender')
    .optional()
    .isIn(Object.values(Gender)).withMessage('Gender must be a valid value'),

  query('countryId')
    .optional()
    .isInt({ min: 1 }).withMessage('Country ID must be a positive integer')
    .toInt(),

  query('stateId')
    .optional()
    .isInt({ min: 1 }).withMessage('State ID must be a positive integer')
    .toInt(),

  query('cityId')
    .optional()
    .isInt({ min: 1 }).withMessage('City ID must be a positive integer')
    .toInt(),

  query('ageMin')
    .optional()
    .isInt({ min: 0, max: 150 }).withMessage('Minimum age must be between 0 and 150')
    .toInt(),

  query('ageMax')
    .optional()
    .isInt({ min: 0, max: 150 }).withMessage('Maximum age must be between 0 and 150')
    .toInt()
];
