/**
 * @file utils/file-upload.utils.ts
 * @description Utilities for file uploads using Multer.
 */

import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { randomUUID } from 'crypto';
import { Request } from 'express';
import env from '@/config/environment.js';
import { BadRequestError } from './api-error.utils.js';

// Get directory name using ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure upload directory exists
const createUploadDir = (dirPath: string) => {
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
 * Multer disk storage configuration
 * @param subDir Subdirectory within the upload directory
 * @returns Multer storage engine
 */
const getStorage = (subDir: string) => {
  const uploadDir = createUploadDir(path.join(baseUploadDir, subDir));
  
  return multer.diskStorage({
    destination: (req, file, cb) => {
      // Use tenant ID from request if available
      const tenantPath = req.user?.tenantId
        ? path.join(uploadDir, req.user.tenantId.toString())
        : uploadDir;
      
      createUploadDir(tenantPath);
      cb(null, tenantPath);
    },
    filename: (req, file, cb) => {
      // Generate unique filename with original extension
      const originalExt = path.extname(file.originalname);
      const filename = `${Date.now()}-${randomUUID()}${originalExt}`;
      cb(null, filename);
    },
  });
};

/**
 * File filter factory for different file types
 * @param allowedMimeTypes Array of allowed MIME types
 * @returns Multer file filter function
 */
const createFileFilter = (allowedMimeTypes: string[]) => {
  return (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new BadRequestError(
        `Invalid file type. Allowed types: ${allowedMimeTypes.join(', ')}`,
        'INVALID_FILE_TYPE'
      ));
    }
  };
};

/**
 * Image upload configuration
 */
export const imageUpload = multer({
  storage: getStorage('images'),
  limits: { fileSize: fileSizeLimits.image },
  fileFilter: createFileFilter(allowedImageTypes),
});

/**
 * Document upload configuration
 */
export const documentUpload = multer({
  storage: getStorage('documents'),
  limits: { fileSize: fileSizeLimits.document },
  fileFilter: createFileFilter(allowedDocumentTypes),
});

/**
 * Video upload configuration
 */
export const videoUpload = multer({
  storage: getStorage('videos'),
  limits: { fileSize: fileSizeLimits.video },
  fileFilter: createFileFilter(allowedVideoTypes),
});

/**
 * Audio upload configuration
 */
export const audioUpload = multer({
  storage: getStorage('audio'),
  limits: { fileSize: fileSizeLimits.audio },
  fileFilter: createFileFilter(allowedAudioTypes),
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
  } = {}
) => {
  return multer({
    storage: getStorage(subDir),
    limits: { fileSize: options.maxSize || fileSizeLimits.default },
    fileFilter: options.allowedTypes
      ? createFileFilter(options.allowedTypes)
      : undefined,
  });
};

/**
 * Delete a file from the upload directory
 * @param filePath Path to the file to delete
 * @returns Promise resolving to true if deletion was successful
 */
export const deleteFile = async (filePath: string): Promise<boolean> => {
  return new Promise((resolve) => {
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
