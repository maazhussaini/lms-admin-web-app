/**
 * @file config/environment.ts
 * @description Loads and validates environment variables.
 */

import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables from .env file
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper to require environment variables
const requireEnv = (name: string): string => {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
};

// Environment configuration
export const env = {
  // Application
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT || '3000', 10),
  API_BASE_URL: process.env.API_BASE_URL || '/api/v1',
  APP_NAME: process.env.APP_NAME || 'LMS Admin Portal',
  IS_PRODUCTION: process.env.NODE_ENV === 'production',
  IS_DEVELOPMENT: process.env.NODE_ENV === 'development',
  IS_TEST: process.env.NODE_ENV === 'test',
  
  // Database
  DATABASE_URL: requireEnv('DATABASE_URL'),
  
  // JWT
  JWT_SECRET: requireEnv('JWT_SECRET'),
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '1h',
  JWT_REFRESH_SECRET: requireEnv('JWT_REFRESH_SECRET'),
  JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  JWT_ISSUER: process.env.JWT_ISSUER || 'lms-admin',
  JWT_AUDIENCE: process.env.JWT_AUDIENCE || 'lms-client',
  
  // CORS
  CORS_ORIGIN: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:4200'],
  
  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10),
  RATE_LIMIT_MAX_REQUESTS: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
  
  // Logging
  LOG_LEVEL: process.env.LOG_LEVEL || 'info',
  
  // Bunny.net
  BUNNY_API_KEY: process.env.BUNNY_API_KEY || '',
  BUNNY_STORAGE_ZONE_NAME: process.env.BUNNY_STORAGE_ZONE_NAME || '',
  BUNNY_PULL_ZONE_URL: process.env.BUNNY_PULL_ZONE_URL || '',
  BUNNY_DRM_USER_ID: process.env.BUNNY_DRM_USER_ID || '',
  BUNNY_DRM_API_KEY: process.env.BUNNY_DRM_API_KEY || '',
  
  // File Uploads
  MAX_FILE_SIZE_MB: parseInt(process.env.MAX_FILE_SIZE_MB || '10', 10),
  UPLOAD_TEMP_DIR: process.env.UPLOAD_TEMP_DIR || path.join(__dirname, '../../uploads/temp'),
  
  // Socket.IO
  SOCKET_IO_PATH: process.env.SOCKET_IO_PATH || '/socket.io',
};

export default env;
