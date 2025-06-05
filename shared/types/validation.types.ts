/**
 * @file types/validation.types.ts
 * @description TypeScript type definitions for validation utilities
 */

/**
 * Locations where validation can be applied in Express requests
 */
export type LocationOptions = 'params' | 'body' | 'query';

/**
 * Base validation options that apply to most validators
 */
export interface ValidationOptions {
  /** Whether the field is required */
  required?: boolean;
  /** Field location (params, body, query) */
  location?: LocationOptions;
  /** Custom error message */
  errorMessage?: string;
}

/**
 * Validation schema field types
 */
export type ValidationFieldType = 
  | 'string'
  | 'integer'
  | 'float'
  | 'boolean'
  | 'date'
  | 'email'
  | 'array'
  | 'url'
  | 'uuid'
  | 'custom';

/**
 * String validation schema field
 */
export interface StringFieldSchema extends ValidationOptions {
  type: 'string';
  min?: number;
  max?: number;
  pattern?: RegExp;
  trim?: boolean;
}

/**
 * Number validation schema field
 */
export interface NumberFieldSchema extends ValidationOptions {
  type: 'integer' | 'float';
  min?: number;
  max?: number;
  options?: any;
}

/**
 * Boolean validation schema field
 */
export interface BooleanFieldSchema extends ValidationOptions {
  type: 'boolean';
}

/**
 * Date validation schema field
 */
export interface DateFieldSchema extends ValidationOptions {
  type: 'date';
  allowPast?: boolean;
  allowFuture?: boolean;
  minDate?: Date;
  maxDate?: Date;
}

/**
 * Email validation schema field
 */
export interface EmailFieldSchema extends ValidationOptions {
  type: 'email';
  normalizeOptions?: any;
}

/**
 * Array validation schema field
 */
export interface ArrayFieldSchema extends ValidationOptions {
  type: 'array';
  minLength?: number;
  maxLength?: number;
  options?: any;
}

/**
 * URL validation schema field
 */
export interface UrlFieldSchema extends ValidationOptions {
  type: 'url';
  protocols?: string[];
  options?: any;
}

/**
 * UUID validation schema field
 */
export interface UuidFieldSchema extends ValidationOptions {
  type: 'uuid';
  options?: any;
}

/**
 * Custom validation schema field
 */
export interface CustomFieldSchema extends ValidationOptions {
  type: 'custom';
  customValidator?: (value: any) => boolean | Promise<boolean>;
  custom?: (value: any) => boolean | Promise<boolean>;
}

/**
 * Union type of all field schema types
 */
export type ValidationFieldSchema =
  | StringFieldSchema
  | NumberFieldSchema
  | BooleanFieldSchema
  | DateFieldSchema
  | EmailFieldSchema
  | ArrayFieldSchema
  | UrlFieldSchema
  | UuidFieldSchema
  | CustomFieldSchema;

/**
 * Complete validation schema type
 */
export type ValidationSchema = Record<string, ValidationFieldSchema>;
