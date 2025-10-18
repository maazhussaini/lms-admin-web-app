/**
 * @file utils/file-upload.utils.ts
 * @description Utilities for file uploads using Multer with enhanced security,
 * validation, and multi-tenant support.
 */

import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { randomUUID } from 'crypto';
import { createHash } from 'crypto';
import { Request } from 'express';
import env from '@/config/environment';
import { BadRequestError, InternalServerError } from './api-error.utils';
import { TUploadedFile, TUploadResult, TFileCategory } from '@shared/types/file.types';

/**
 * Type guard to check if user has required tenant information
 */
const isValidUserWithTenant = (user: unknown): user is { tenantId: number; id: number } => {
  return (
    typeof user === 'object' &&
    user !== null &&
    'tenantId' in user &&
    'id' in user &&
    typeof (user as any).tenantId === 'number' &&
    typeof (user as any).id === 'number' &&
    (user as any).tenantId > 0 &&
    (user as any).id > 0
  );
};

// Ensure upload directory exists
const createUploadDir = (dirPath: string): string => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
  return dirPath;
};

// Create base upload directory
const baseUploadDir = createUploadDir(env.UPLOAD_TEMP_DIR);

// File type validation
const allowedImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
const allowedDocumentTypes = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation', // .pptx
  'text/plain',
  'text/csv',
];
const allowedVideoTypes = ['video/mp4', 'video/webm', 'video/ogg'];
const allowedAudioTypes = ['audio/mpeg', 'audio/ogg', 'audio/wav', 'audio/webm'];

/**
 * File size limits in bytes
 */
const fileSizeLimits = {
  image: 5 * 1024 * 1024, // 5MB
  document: 20 * 1024 * 1024, // 20MB
  video: 500 * 1024 * 1024, // 500MB
  audio: 50 * 1024 * 1024, // 50MB
  default: env.MAX_FILE_SIZE_MB * 1024 * 1024, // From environment
};

/**
 * Sanitizes a filename to prevent path traversal and directory structure attacks
 * @param filename Original filename
 * @returns Sanitized filename
 */
const sanitizeFilename = (filename: string): string => {
  // Remove path components and special characters
  return filename
    .replace(/[/\\?%*:|"<>]/g, '_') // Replace invalid characters with underscore
    .replace(/\.\./g, '_'); // Prevent directory traversal attempts
};

/**
 * Generates a hash of a file for integrity verification
 * @param filePath Path to the file
 * @returns Promise resolving to the SHA-256 hash of the file
 */
export const generateFileHash = async (filePath: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const hash = createHash('sha256');
    const stream = fs.createReadStream(filePath);
    
    stream.on('error', (err) => reject(err));
    stream.on('data', (chunk) => hash.update(chunk));
    stream.on('end', () => resolve(hash.digest('hex')));
  });
};

/**
 * Multer disk storage configuration
 * @param subDir Subdirectory within the upload directory
 * @returns Multer storage engine
 */
const getStorage = (subDir: string) => {
  const uploadDir = createUploadDir(path.join(baseUploadDir, subDir));
  
  return multer.diskStorage({
    destination: (req, _file, cb) => {
      // Use tenant ID from request if available
      if (!isValidUserWithTenant(req.user)) {
        return cb(new BadRequestError(
          'Tenant ID is required for file uploads',
          'TENANT_ID_MISSING'
        ), '');
      }
      
      const tenantPath = path.join(uploadDir, req.user.tenantId.toString());
      createUploadDir(tenantPath);
      cb(null, tenantPath);
    },
    filename: (_req, file, cb) => {
      try {
        // Sanitize original filename for secure storage
        const sanitizedName = sanitizeFilename(file.originalname);
        const originalExt = path.extname(sanitizedName);
        const timestamp = Date.now();
        const uuid = randomUUID();
        const filename = `${timestamp}-${uuid}${originalExt}`;
        cb(null, filename);
      } catch (error) {
        cb(new InternalServerError(
          'Failed to process filename',
          'FILENAME_PROCESSING_ERROR'
        ), '');
      }
    },
  });
};

/**
 * File filter factory for different file types
 * @param allowedMimeTypes Array of allowed MIME types
 * @returns Multer file filter function
 */
const createFileFilter = (allowedMimeTypes: string[], maxFileSize?: number) => {
  return (_req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    // Validate file type
    if (!allowedMimeTypes.includes(file.mimetype)) {
      return cb(new BadRequestError(
        `Invalid file type for ${file.originalname}. Allowed types: ${allowedMimeTypes.join(', ')}`,
        'INVALID_FILE_TYPE'
      ));
    }
    
    // File size validation handled by multer limits, but adding extra check for streaming
    if (maxFileSize && file.size && file.size > maxFileSize) {
      return cb(new BadRequestError(
        `File ${file.originalname} exceeds maximum size of ${Math.round(maxFileSize / (1024 * 1024))}MB`,
        'FILE_TOO_LARGE'
      ));
    }
    
    cb(null, true);
  };
};

/**
 * Image upload configuration
 */
export const imageUpload = multer({
  storage: getStorage('images'),
  limits: { 
    fileSize: fileSizeLimits.image,
    files: 10 // Limit number of files per request 
  },
  fileFilter: createFileFilter(allowedImageTypes, fileSizeLimits.image),
});

/**
 * Document upload configuration
 */
export const documentUpload = multer({
  storage: getStorage('documents'),
  limits: { 
    fileSize: fileSizeLimits.document,
    files: 5 // Limit number of files per request
  },
  fileFilter: createFileFilter(allowedDocumentTypes, fileSizeLimits.document),
});

/**
 * Video upload configuration
 */
export const videoUpload = multer({
  storage: getStorage('videos'),
  limits: { 
    fileSize: fileSizeLimits.video,
    files: 1 // Videos are large, limit to 1 per request
  },
  fileFilter: createFileFilter(allowedVideoTypes, fileSizeLimits.video),
});

/**
 * Audio upload configuration
 */
export const audioUpload = multer({
  storage: getStorage('audio'),
  limits: { 
    fileSize: fileSizeLimits.audio,
    files: 3 // Limit number of files per request
  },
  fileFilter: createFileFilter(allowedAudioTypes, fileSizeLimits.audio),
});

/**
 * Generic file upload configuration
 * @param subDir Subdirectory within the upload directory
 * @param options Optional multer options
 * @returns Multer instance
 */
export const createUploader = (
  subDir: string,
  options: {
    allowedTypes?: string[];
    maxSize?: number;
    maxFiles?: number;
    fieldName?: string;
  } = {}
) => {
  const { allowedTypes, maxSize = fileSizeLimits.default, maxFiles = 1, fieldName } = options;
  
  const multerConfig: multer.Options = {
    storage: getStorage(subDir),
    limits: { 
      fileSize: maxSize,
      files: maxFiles
    },
  };

  // Only add fileFilter if allowedTypes is provided
  if (allowedTypes) {
    multerConfig.fileFilter = createFileFilter(allowedTypes, maxSize);
  }
  
  const multerInstance = multer(multerConfig);
  
  // Return configured uploader based on field name
  return fieldName 
    ? multerInstance.single(fieldName)
    : multerInstance;
};

/**
 * Delete a file from the upload directory
 * @param filePath Path to the file to delete
 * @param tenantId Optional tenant ID for validation
 * @returns Promise resolving to true if deletion was successful
 */
export const deleteFile = async (
  filePath: string,
  tenantId?: number
): Promise<boolean> => {
  // Input validation
  if (!filePath || typeof filePath !== 'string') {
    console.error('Invalid file path provided for deletion');
    return false;
  }

  // Security check: if tenantId is provided, ensure the file belongs to that tenant
  if (tenantId !== undefined) {
    if (typeof tenantId !== 'number' || tenantId <= 0) {
      console.error('Invalid tenant ID provided for file deletion');
      return false;
    }
    
    if (!filePath.includes(`/${tenantId}/`)) {
      console.error(`Security violation: Attempted to delete file ${filePath} from another tenant`);
      return false;
    }
  }

  return new Promise((resolve) => {
    // Check if file exists before attempting to delete
    if (!fs.existsSync(filePath)) {
      console.warn(`File ${filePath} does not exist, nothing to delete`);
      resolve(true);
      return;
    }
    
    fs.unlink(filePath, (err) => {
      if (err) {
        console.error(`Error deleting file ${filePath}:`, err);
        resolve(false);
      } else {
        resolve(true);
      }
    });
  });
};

/**
 * Process uploaded files with additional metadata
 * @param files Array of uploaded files from multer
 * @param tenantId Tenant ID for the upload
 * @param userId User ID who uploaded the files
 * @param userIp IP address of the user uploading the files
 * @returns Promise resolving to the upload result
 */
export const processUploadedFiles = async (
  files: Express.Multer.File | Express.Multer.File[],
  tenantId: number,
  userId: number,
  userIp: string
): Promise<TUploadResult> => {
  // Input validation
  if (!files) {
    return {
      success: false,
      files: [],
      errors: ['No files provided for processing'],
    };
  }

  if (typeof tenantId !== 'number' || tenantId <= 0) {
    return {
      success: false,
      files: [],
      errors: ['Invalid tenant ID provided'],
    };
  }

  if (typeof userId !== 'number' || userId <= 0) {
    return {
      success: false,
      files: [],
      errors: ['Invalid user ID provided'],
    };
  }

  if (!userIp || typeof userIp !== 'string' || userIp.trim().length === 0) {
    return {
      success: false,
      files: [],
      errors: ['Invalid user IP address provided'],
    };
  }

  const fileArray = Array.isArray(files) ? files : [files];
  const processedFiles: TUploadedFile[] = [];
  const errors: string[] = [];

  // Validate that all files in the array are valid Multer files
  for (const file of fileArray) {
    if (!file || typeof file !== 'object' || !file.originalname || !file.filename || !file.path) {
      errors.push('Invalid file object detected in files array');
      continue;
    }

    try {
      // Additional file-level validation
      if (!fs.existsSync(file.path)) {
        throw new Error('File does not exist at specified path');
      }

      if (file.size <= 0) {
        throw new Error('File appears to be empty');
      }

      // Validate file content against its claimed MIME type
      const isValidContent = await validateFileContent(file.path, file.mimetype);
      
      if (!isValidContent) {
        throw new Error(`File content does not match claimed type ${file.mimetype}`);
      }
      
      // Calculate file hash for integrity verification
      const hash = await generateFileHash(file.path);
      
      // Extract file metadata
      const metadata = await extractFileMetadata(file.path, file.mimetype);

      processedFiles.push({
        original_name: file.originalname,
        file_name: file.filename,
        file_path: file.path,
        mime_type: file.mimetype,
        file_size: file.size,
        file_hash: hash,
        tenant_id: tenantId,
        uploaded_at: new Date(),
        metadata,
        // Required audit fields from MultiTenantAuditFields
        is_active: true,
        is_deleted: false,
        created_at: new Date(),
        created_by: userId,
        created_ip: userIp,
        updated_at: null,
        updated_by: null,
        updated_ip: null,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      console.error(`Error processing file ${file.originalname}:`, error);
      errors.push(`Failed to process ${file.originalname}: ${errorMessage}`);

      // Clean up the file that failed processing
      await deleteFile(file.path, tenantId).catch(err => 
        console.error(`Failed to delete file ${file.path} after error:`, err)
      );
    }
  }
  return {
    success: errors.length === 0,
    files: processedFiles,
    ...(errors.length > 0 && { errors }),
  };
};

/**
 * Move file from temporary upload location to permanent storage
 * @param sourcePath Source file path
 * @param destinationPath Destination file path
 * @returns Promise resolving to true if move was successful
 */
export const moveFile = async (
  sourcePath: string,
  destinationPath: string
): Promise<boolean> => {
  return new Promise((resolve) => {
    // Ensure destination directory exists
    const destDir = path.dirname(destinationPath);
    createUploadDir(destDir);
    
    // Create read and write streams for efficient file copying
    const readStream = fs.createReadStream(sourcePath);
    const writeStream = fs.createWriteStream(destinationPath);
    
    readStream.on('error', (err) => {
      console.error(`Error reading from ${sourcePath}:`, err);
      resolve(false);
    });
    
    writeStream.on('error', (err) => {
      console.error(`Error writing to ${destinationPath}:`, err);
      resolve(false);
    });
    
    writeStream.on('finish', async () => {
      // Delete the source file after successful copy
      const deleted = await deleteFile(sourcePath);
      resolve(deleted);
    });
    
    // Perform the copy
    readStream.pipe(writeStream);
  });
};

/**
 * Get MIME type mapping for file extension
 * @param extension File extension (with or without dot)
 * @returns MIME type or undefined if not recognized
 */
export const getMimeTypeFromExtension = (extension: string): string | undefined => {
  const ext = extension.startsWith('.') ? extension.slice(1) : extension;
  const mimeMap: Record<string, string> = {
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'png': 'image/png',
    'gif': 'image/gif',
    'webp': 'image/webp',
    'pdf': 'application/pdf',
    'doc': 'application/msword',
    'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'xls': 'application/vnd.ms-excel',
    'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'ppt': 'application/vnd.ms-powerpoint',
    'pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'txt': 'text/plain',
    'csv': 'text/csv',
    'mp4': 'video/mp4',
    'webm': 'video/webm',
    'ogg': 'video/ogg',
    'mp3': 'audio/mpeg',
    'wav': 'audio/wav',
  };
  
  return mimeMap[ext.toLowerCase()];
};

/**
 * Get file category based on MIME type
 * @param mimeType MIME type of the file
 * @returns File category (image, document, video, audio, other)
 */
export const getFileCategory = (mimeType: string): TFileCategory => {
  if (allowedImageTypes.includes(mimeType)) return 'image';
  if (allowedDocumentTypes.includes(mimeType)) return 'document';
  if (allowedVideoTypes.includes(mimeType)) return 'video';
  if (allowedAudioTypes.includes(mimeType)) return 'audio';
  return 'other';
};

/**
 * Extract basic metadata from a file
 * @param filePath Path to the file
 * @param mimeType MIME type of the file
 * @returns Object containing extracted metadata
 */
export const extractFileMetadata = async (
  filePath: string,
  mimeType: string
): Promise<Record<string, any>> => {
  try {
    const stats = fs.statSync(filePath);
    const metadata: Record<string, any> = {
      size: stats.size,
      created: stats.birthtime,
      modified: stats.mtime,
      category: getFileCategory(mimeType),
    };

    // For images, we could extract dimensions, etc.
    // This would require additional libraries like sharp
    // Example placeholder:
    if (metadata['category'] === 'image') {
      // Placeholder for image-specific metadata
      // With a library like sharp, you could add:
      // const imageInfo = await sharp(filePath).metadata();
      // metadata.width = imageInfo.width;
      // metadata.height = imageInfo.height;
      // metadata.format = imageInfo.format;
    }
    
    // For videos, we could extract duration, resolution, etc.
    // This would require additional libraries like ffprobe
    // Example placeholder:
    if (metadata['category'] === 'video') {
      // Placeholder for video-specific metadata
      // With ffprobe integration, you could add:
      // const videoInfo = await getVideoMetadata(filePath);
      // metadata.duration = videoInfo.duration;
      // metadata.resolution = `${videoInfo.width}x${videoInfo.height}`;
    }

    return metadata;
  } catch (error) {
    console.error(`Error extracting metadata from ${filePath}:`, error);
    return { error: 'Failed to extract metadata' };
  }
};

/**
 * Validate file content matches its claimed MIME type
 * This provides an additional security layer beyond just checking the file extension
 * @param filePath Path to the file
 * @param mimeType Expected MIME type
 * @returns Promise resolving to boolean indicating if file is valid
 */
export const validateFileContent = async (
  filePath: string,
  mimeType: string
): Promise<boolean> => {
  try {
    // Read the first few bytes of the file to check signature/magic numbers
    const buffer = fs.readFileSync(filePath, { flag: 'r' }).slice(0, 50);
    
    // Check file signatures based on mime type
    if (mimeType === 'image/jpeg' || mimeType === 'image/jpg') {
      // JPEG starts with FF D8 FF
      return buffer[0] === 0xFF && buffer[1] === 0xD8 && buffer[2] === 0xFF;
    } else if (mimeType === 'image/png') {
      // PNG starts with 89 50 4E 47 0D 0A 1A 0A
      return (
        buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4E && 
        buffer[3] === 0x47 && buffer[4] === 0x0D && buffer[5] === 0x0A && 
        buffer[6] === 0x1A && buffer[7] === 0x0A
      );
    } else if (mimeType === 'application/pdf') {
      // PDF starts with %PDF (25 50 44 46)
      const signature = buffer.slice(0, 4).toString('ascii');
      return signature === '%PDF';
    } else if (mimeType === 'video/mp4') {
      // MP4 has 'ftyp' at bytes 4-8
      if (buffer.length >= 8) {
        const signature = buffer.slice(4, 8).toString('ascii');
        return signature === 'ftyp';
      }
      return false;
    } else if (mimeType.startsWith('audio/')) {
      // Basic audio validation - can be expanded for specific formats
      // This is a simplified check that just verifies the file exists and is readable
      return true;
    } else if (mimeType.includes('officedocument')) {
      // Office documents are ZIP files with specific internal structure
      // Simple check for ZIP signature: PK (50 4B)
      return buffer[0] === 0x50 && buffer[1] === 0x4B;
    } else {
      // For other types, we skip content validation
      return true;
    }
  } catch (error) {
    console.error(`Error validating file content for ${filePath}:`, error);
    return false;
  }
};

/**
 * Secure temporary file cleanup for failed uploads
 * @param directory Directory path to clean
 * @param maxAge Maximum age of files to keep in milliseconds (default: 24 hours)
 * @returns Promise resolving to number of files cleaned
 */
export const cleanupTempFiles = async (
  directory: string = baseUploadDir,
  maxAge: number = 24 * 60 * 60 * 1000 // 24 hours
): Promise<number> => {
  const now = Date.now();
  let cleanedCount = 0;
  
  const cleanDir = async (dirPath: string): Promise<void> => {
    try {
      const files = fs.readdirSync(dirPath);
      
      for (const file of files) {
        const filePath = path.join(dirPath, file);
        const stats = fs.statSync(filePath);
        
        if (stats.isDirectory()) {
          // Recursively clean subdirectories
          await cleanDir(filePath);
          
          // Remove empty directories
          const subFiles = fs.readdirSync(filePath);
          if (subFiles.length === 0) {
            fs.rmdirSync(filePath);
          }        } else if (stats.isFile()) {
          // Check file age
          const fileAge = now - stats.mtimeMs;
          
          if (fileAge > maxAge) {
            await deleteFile(filePath); // No tenant ID needed for cleanup
            cleanedCount++;
          }
        }
      }
    } catch (error) {
      console.error(`Error cleaning directory ${directory}:`, error);
    }
  };
  
  await cleanDir(directory);
  return cleanedCount;
};

/**
 * ========================================
 * TENANT LOGO & FAVICON UPLOAD UTILITIES
 * ========================================
 */

/**
 * Network share upload path configuration
 */
export const NETWORK_UPLOAD_PATH = env.UPLOAD_BASE_PATH || '\\\\DESKTOP-ERNLAOT\\uploads';

/**
 * Tenant logo/favicon file naming conventions
 */
export const TENANT_FILE_NAMES = {
  LOGO_LIGHT: 'logo_lg',
  LOGO_DARK: 'logo_dk',
  FAVICON: 'favicon.ico',
} as const;

/**
 * Ensures network share directory exists and is accessible
 * @param networkPath Network share path
 * @returns boolean indicating if path is accessible
 */
export const ensureNetworkPath = (networkPath: string = NETWORK_UPLOAD_PATH): boolean => {
  try {
    if (!fs.existsSync(networkPath)) {
      fs.mkdirSync(networkPath, { recursive: true });
    }
    // Test write access
    const testFile = path.join(networkPath, '.access_test');
    fs.writeFileSync(testFile, 'test');
    fs.unlinkSync(testFile);
    return true;
  } catch (error) {
    console.error(`Network path ${networkPath} is not accessible:`, error);
    return false;
  }
};

/**
 * Uploads tenant logo to network share with standardized naming
 * @param file Express Multer file
 * @param tenantId Tenant ID
 * @param logoType Type of logo (light/dark)
 * @returns Path to uploaded file or null if failed
 */
export const uploadTenantLogo = async (
  file: Express.Multer.File,
  tenantId: number,
  logoType: 'light' | 'dark'
): Promise<string | null> => {
  try {
    console.log('=== uploadTenantLogo START ===', {
      tenantId,
      logoType,
      hasFile: !!file,
      hasBuffer: !!file?.buffer,
      bufferLength: file?.buffer?.length,
      originalname: file?.originalname
    });

    // Validate network path
    if (!ensureNetworkPath()) {
      console.error('Network path not accessible');
      throw new InternalServerError(
        'Network upload path is not accessible',
        'NETWORK_PATH_ERROR'
      );
    }

    // Create tenant directory - preserve UNC path format (\\server\share)
    // Use simple concatenation to avoid path normalization issues
    const tenantDir = NETWORK_UPLOAD_PATH + '\\' + tenantId;
    console.log('Creating tenant directory:', tenantDir);
    console.log('Using raw UNC path format');
    
    // Ensure directory exists
    if (!fs.existsSync(tenantDir)) {
      console.log('Directory does not exist, creating...');
      fs.mkdirSync(tenantDir, { recursive: true });
      console.log('Tenant directory created');
    } else {
      console.log('Tenant directory already exists');
    }

    // Determine file extension
    const ext = path.extname(file.originalname);
    const fileName = logoType === 'light' 
      ? `${TENANT_FILE_NAMES.LOGO_LIGHT}${ext}`
      : `${TENANT_FILE_NAMES.LOGO_DARK}${ext}`;

    const targetPath = tenantDir + '\\' + fileName;
    console.log('Target path:', targetPath);

    // Write file from buffer (multer memoryStorage)
    if (file.buffer) {
      console.log('Writing file from buffer, size:', file.buffer.length);
      
      // Delete old file if exists
      if (fs.existsSync(targetPath)) {
        console.log('Deleting existing file:', targetPath);
        fs.unlinkSync(targetPath);
      }
      
      // Write buffer to file with proper error handling
      try {
        fs.writeFileSync(targetPath, file.buffer, { mode: 0o666 });
        console.log('File written to disk');
        
        // Verify file was actually written
        if (!fs.existsSync(targetPath)) {
          throw new Error('File write verification failed - file does not exist after write');
        }
        
        const stats = fs.statSync(targetPath);
        console.log('File verification successful:', {
          exists: true,
          size: stats.size,
          expectedSize: file.buffer.length,
          path: targetPath
        });
        
        if (stats.size !== file.buffer.length) {
          throw new Error(`File size mismatch: written ${stats.size} bytes, expected ${file.buffer.length} bytes`);
        }
        
        console.log('File written and verified successfully');
      } catch (writeError) {
        console.error('File write error:', writeError);
        throw writeError;
      }
    } else if (file.path) {
      console.log('Copying file from path:', file.path);
      // Copy file from disk storage
      if (fs.existsSync(targetPath)) {
        fs.unlinkSync(targetPath);
      }
      
      fs.copyFileSync(file.path, targetPath);
      
      // Delete temporary file
      fs.unlinkSync(file.path);
      console.log('File copied successfully');
    } else {
      console.error('File has no buffer or path!');
      throw new Error('File has no buffer or path');
    }

    // Return network path with proper UNC format
    const finalPath = NETWORK_UPLOAD_PATH + '\\' + tenantId + '\\' + fileName;
    console.log('=== uploadTenantLogo SUCCESS ===', finalPath);
    return finalPath;
  } catch (error) {
    console.error(`Error uploading tenant logo:`, error);
    throw new InternalServerError(
      'Failed to upload tenant logo',
      'LOGO_UPLOAD_ERROR'
    );
  }
};

/**
 * Uploads tenant favicon to network share
 * @param file Express Multer file
 * @param tenantId Tenant ID
 * @returns Path to uploaded favicon or null if failed
 */
export const uploadTenantFavicon = async (
  file: Express.Multer.File,
  tenantId: number
): Promise<string | null> => {
  try {
    console.log('=== uploadTenantFavicon START ===', {
      tenantId,
      hasFile: !!file,
      hasBuffer: !!file?.buffer,
      bufferLength: file?.buffer?.length,
      originalname: file?.originalname
    });

    // Validate network path
    if (!ensureNetworkPath()) {
      console.error('Network path not accessible');
      throw new InternalServerError(
        'Network upload path is not accessible',
        'NETWORK_PATH_ERROR'
      );
    }

    // Create tenant directory - preserve UNC path format (\\server\share)
    // Use simple concatenation to avoid path normalization issues
    const tenantDir = NETWORK_UPLOAD_PATH + '\\' + tenantId;
    console.log('Creating tenant directory:', tenantDir);
    console.log('Using raw UNC path format');
    
    // Ensure directory exists
    if (!fs.existsSync(tenantDir)) {
      console.log('Directory does not exist, creating...');
      fs.mkdirSync(tenantDir, { recursive: true });
      console.log('Tenant directory created');
    } else {
      console.log('Tenant directory already exists');
    }

    const targetPath = tenantDir + '\\' + TENANT_FILE_NAMES.FAVICON;
    console.log('Target path:', targetPath);

    // Write file from buffer (multer memoryStorage)
    if (file.buffer) {
      console.log('Writing favicon from buffer, size:', file.buffer.length);
      
      // Delete old file if exists
      if (fs.existsSync(targetPath)) {
        console.log('Deleting existing favicon:', targetPath);
        fs.unlinkSync(targetPath);
      }
      
      // Write buffer to file with proper error handling
      try {
        fs.writeFileSync(targetPath, file.buffer, { mode: 0o666 });
        console.log('Favicon written to disk');
        
        // Verify file was actually written
        if (!fs.existsSync(targetPath)) {
          throw new Error('File write verification failed - favicon does not exist after write');
        }
        
        const stats = fs.statSync(targetPath);
        console.log('Favicon verification successful:', {
          exists: true,
          size: stats.size,
          expectedSize: file.buffer.length,
          path: targetPath
        });
        
        if (stats.size !== file.buffer.length) {
          throw new Error(`Favicon size mismatch: written ${stats.size} bytes, expected ${file.buffer.length} bytes`);
        }
        
        console.log('Favicon written and verified successfully');
      } catch (writeError) {
        console.error('Favicon write error:', writeError);
        throw writeError;
      }
    } else if (file.path) {
      console.log('Copying favicon from path:', file.path);
      // Copy file from disk storage
      if (fs.existsSync(targetPath)) {
        fs.unlinkSync(targetPath);
      }
      
      fs.copyFileSync(file.path, targetPath);
      
      // Delete temporary file
      fs.unlinkSync(file.path);
      console.log('Favicon copied successfully');
    } else {
      console.error('Favicon has no buffer or path!');
      throw new Error('File has no buffer or path');
    }

    // Return network path with proper UNC format
    const finalPath = NETWORK_UPLOAD_PATH + '\\' + tenantId + '\\' + TENANT_FILE_NAMES.FAVICON;
    console.log('=== uploadTenantFavicon SUCCESS ===', finalPath);
    return finalPath;
  } catch (error) {
    console.error(`Error uploading tenant favicon:`, error);
    throw new InternalServerError(
      'Failed to upload tenant favicon',
      'FAVICON_UPLOAD_ERROR'
    );
  }
};

/**
 * Deletes tenant logo/favicon from network share
 * @param filePath Full file path to delete
 */
export const deleteTenantFile = async (filePath: string): Promise<boolean> => {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      return true;
    }
    return false;
  } catch (error) {
    console.error(`Error deleting tenant file ${filePath}:`, error);
    return false;
  }
};
