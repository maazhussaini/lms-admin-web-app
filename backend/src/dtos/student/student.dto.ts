import { body, ValidationChain } from 'express-validator';
import { Gender, StudentStatus } from '@/types/enums.types.js';

/**
 * DTO interface for creating a new student
 */
export interface CreateStudentDto {
  tenant_id?: number; // Required for SUPER_ADMIN, ignored for others
  full_name: string;
  first_name: string;
  middle_name?: string;
  last_name: string;
  email_address: string;
  username: string;
  password: string;
  country_id: number;
  state_id: number;
  city_id: number;
  address?: string;
  date_of_birth?: string;
  profile_picture_url?: string;
  zip_code?: string;
  age?: number;
  gender?: Gender;
  student_status?: StudentStatus;
  referral_type?: string;
}

/**
 * DTO interface for updating an existing student
 */
export interface UpdateStudentDto {
  full_name?: string;
  first_name?: string;
  middle_name?: string | null;
  last_name?: string;
  country_id?: number;
  state_id?: number;
  city_id?: number;
  address?: string | null;
  date_of_birth?: string | null;
  profile_picture_url?: string | null;
  zip_code?: string | null;
  age?: number | null;
  gender?: Gender | null;
  student_status?: StudentStatus;
  referral_type?: string | null;
}

/**
 * DTO interface for updating student profile (limited fields for students)
 */
export interface UpdateStudentProfileDto {
  full_name?: string;
  first_name?: string;
  middle_name?: string | null;
  last_name?: string;
  address?: string | null;
  date_of_birth?: string | null;
  profile_picture_url?: string | null;
}

/**
 * Validation chains for creating a student
 */
export const createStudentValidation: ValidationChain[] = [
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
    .optional()
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
    .exists().withMessage('Country ID is required')
    .isInt({ min: 1 }).withMessage('Country ID must be a positive integer')
    .toInt(),

  body('state_id')
    .exists().withMessage('State ID is required')
    .isInt({ min: 1 }).withMessage('State ID must be a positive integer')
    .toInt(),

  body('city_id')
    .exists().withMessage('City ID is required')
    .isInt({ min: 1 }).withMessage('City ID must be a positive integer')
    .toInt(),

  body('address')
    .optional()
    .isString().withMessage('Address must be a string')
    .trim()
    .isLength({ max: 500 }).withMessage('Address cannot exceed 500 characters'),

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
    .isInt({ min: 0, max: 150 }).withMessage('Age must be between 0 and 150')
    .toInt(),

  body('gender')
    .optional()
    .isIn(Object.values(Gender)).withMessage('Gender must be a valid value'),

  body('student_status')
    .optional()
    .isIn(Object.values(StudentStatus)).withMessage('Student status must be a valid status')
    .default(StudentStatus.ACTIVE),

  body('referral_type')
    .optional()
    .isString().withMessage('Referral type must be a string')
    .trim()
    .isLength({ max: 100 }).withMessage('Referral type cannot exceed 100 characters')
];

/**
 * Validation chains for updating a student
 */
export const updateStudentValidation: ValidationChain[] = [
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
    .if(value => value !== null)
    .isString().withMessage('Address must be a string')
    .trim()
    .isLength({ max: 500 }).withMessage('Address cannot exceed 500 characters'),

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
    .isInt({ min: 0, max: 150 }).withMessage('Age must be between 0 and 150')
    .toInt(),

  body('gender')
    .optional()
    .if(value => value !== null)
    .isIn(Object.values(Gender)).withMessage('Gender must be a valid value'),

  body('student_status')
    .optional()
    .isIn(Object.values(StudentStatus)).withMessage('Student status must be a valid status'),

  body('referral_type')
    .optional()
    .if(value => value !== null)
    .isString().withMessage('Referral type must be a string')
    .trim()
    .isLength({ max: 100 }).withMessage('Referral type cannot exceed 100 characters')
];

/**
 * Validation chains for updating student profile (limited fields)
 */
export const updateStudentProfileValidation: ValidationChain[] = [
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

  body('address')
    .optional()
    .if(value => value !== null)
    .isString().withMessage('Address must be a string')
    .trim()
    .isLength({ max: 500 }).withMessage('Address cannot exceed 500 characters'),

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
    .isLength({ max: 500 }).withMessage('Profile picture URL cannot exceed 500 characters')
];
