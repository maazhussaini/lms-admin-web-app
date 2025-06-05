/**
 * @file utils/file-upload.utils.ts
 * @description Utilities for file uploads using Multer with enhanced security,
 * validation, and multi-tenant support.
 */

import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { randomUUID } from 'crypto';
import { createHash } from 'crypto';
import { Request } from 'express';
import env from '@/config/environment.js';
import { BadRequestError, InternalServerError } from './api-error.utils.js';
import { TUploadedFile, TUploadResult } from '@shared/types/file.types.js';

// Get directory name using ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
    destination: (req, file, cb) => {
      // Use tenant ID from request if available
      const tenantId = req.user?.tenantId;
      
      if (!tenantId) {
        return cb(new BadRequestError(
          'Tenant ID is required for file uploads',
          'TENANT_ID_MISSING'
        ), '');
      }
      
      const tenantPath = path.join(uploadDir, tenantId.toString());
      createUploadDir(tenantPath);
      cb(null, tenantPath);
    },
    filename: (req, file, cb) => {
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
  return (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
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
  
  const multerInstance = multer({
    storage: getStorage(subDir),
    limits: { 
      fileSize: maxSize,
      files: maxFiles
    },
    fileFilter: allowedTypes
      ? createFileFilter(allowedTypes, maxSize)
      : undefined,
  });
  
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
  // Security check: if tenantId is provided, ensure the file belongs to that tenant
  if (tenantId && !filePath.includes(`/${tenantId}/`)) {
    console.error(`Security violation: Attempted to delete file ${filePath} from another tenant`);
    return false;
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
  const fileArray = Array.isArray(files) ? files : [files];
  const processedFiles: TUploadedFile[] = [];
  const errors: string[] = [];

  for (const file of fileArray) {
    try {
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
      console.error(`Error processing file ${file.originalname}:`, error);
      errors.push(`Failed to process ${file.originalname}: ${(error as Error).message}`);      // Clean up the file that failed processing
      await deleteFile(file.path, tenantId).catch(err => 
        console.error(`Failed to delete file ${file.path} after error:`, err)
      );
    }
  }

  return {
    success: errors.length === 0,
    files: processedFiles,
    errors: errors.length > 0 ? errors : undefined,
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
export const getFileCategory = (mimeType: string): 'image' | 'document' | 'video' | 'audio' | 'other' => {
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
    if (metadata.category === 'image') {
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
    if (metadata.category === 'video') {
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
