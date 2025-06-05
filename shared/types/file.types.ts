/**
 * @file shared/types/file.types.ts
 * @description Type definitions for file uploads and processing
 */

import { MultiTenantAuditFields } from './base.types.js';

/**
 * Represents metadata for an uploaded file
 */
export interface TUploadedFile extends MultiTenantAuditFields {  /**
   * Original name of the file as uploaded by the user
   */
  original_name: string;
  
  /**
   * Generated secure filename in the storage system
   */
  file_name: string;
  
  /**
   * Absolute path to the file in the storage system
   */
  file_path: string;
  
  /**
   * MIME type of the file
   */
  mime_type: string;
  
  /**
   * Size of the file in bytes
   */
  file_size: number;
  
  /**
   * SHA-256 hash of the file content for integrity verification
   */
  file_hash: string;
  
  /**
   * ID of the tenant that owns this file
   */
  tenant_id: number;
  
  /**
   * Timestamp when the file was uploaded
   */
  uploaded_at: Date | string;
  
  /**
   * Optional URL where the file can be accessed
   */
  file_url?: string;
  
  /**
   * Optional metadata about the file (depends on the file type)
   */
  metadata?: Record<string, any>;
}

/**
 * Response structure for file upload operations
 */
export interface TUploadResult {
  /**
   * Whether the upload operation was successful
   */
  success: boolean;
  
  /**
   * Array of processed file metadata
   */
  files: TUploadedFile[];
  
  /**
   * Array of error messages if any occurred during processing
   */
  errors?: string[];
}

/**
 * File categories supported by the system
 */
export type TFileCategory = 'image' | 'document' | 'video' | 'audio' | 'other';

/**
 * Options for file upload configuration
 */
export interface TUploaderOptions {
  /**
   * Array of allowed MIME types
   */
  allowedTypes?: string[];
  
  /**
   * Maximum size of the file in bytes
   */
  maxSize?: number;
  
  /**
   * Maximum number of files that can be uploaded in a single request
   */
  maxFiles?: number;
  
  /**
   * Field name in the multipart form data
   */
  fieldName?: string;
}
