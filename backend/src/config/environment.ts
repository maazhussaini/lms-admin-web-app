/**
 * @file config/environment.ts
 * @description Loads and validates environment variables with full TypeScript safety.
 */

import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables from .env file
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Type definition for environment configuration
 */
interface EnvironmentConfig {
  // Application
  NODE_ENV: 'development' | 'production' | 'test';
  PORT: number;
  API_BASE_URL: string;
  APP_NAME: string;
  IS_PRODUCTION: boolean;
  IS_DEVELOPMENT: boolean;
  IS_TEST: boolean;
  
  // Database
  DATABASE_URL: string;
  DB_AUTO_CONNECT: boolean;
  
  // JWT
  JWT_SECRET: string;
  JWT_EXPIRES_IN: string;
  JWT_REFRESH_SECRET: string;
  JWT_REFRESH_EXPIRES_IN: string;
  JWT_ISSUER: string;
  JWT_AUDIENCE: string;
  
  // CORS
  CORS_ORIGIN: string[];
  
  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: number;
  RATE_LIMIT_MAX_REQUESTS: number;
  
  // Logging
  LOG_LEVEL: 'error' | 'warn' | 'info' | 'debug';
  
  // Bunny.net
  BUNNY_API_KEY: string;
  BUNNY_STORAGE_ZONE_NAME: string;
  BUNNY_PULL_ZONE_URL: string;
  BUNNY_DRM_USER_ID: string;
  BUNNY_DRM_API_KEY: string;
  
  // File Uploads
  MAX_FILE_SIZE_MB: number;
  UPLOAD_TEMP_DIR: string;
  
  // Socket.IO
  SOCKET_IO_PATH: string;
}

/**
 * Helper to safely get environment variable
 */
const getEnv = (name: string): string | undefined => {
  return process.env[name];
};

/**
 * Helper to require environment variables with type safety
 */
const requireEnv = (name: string): string => {
  const value = getEnv(name);
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
};

/**
 * Helper to safely parse integer with validation
 */
const parseIntSafe = (value: string | undefined, defaultValue: number, varName: string): number => {
  if (!value) return defaultValue;
  
  const parsed = parseInt(value, 10);
  if (isNaN(parsed)) {
    throw new Error(`Invalid integer value for environment variable ${varName}: ${value}`);
  }
  return parsed;
};

/**
 * Helper to validate NODE_ENV value
 */
const validateNodeEnv = (env: string | undefined): 'development' | 'production' | 'test' => {
  const validEnvs = ['development', 'production', 'test'] as const;
  if (!env || !validEnvs.includes(env as any)) {
    return 'development';
  }
  return env as 'development' | 'production' | 'test';
};

/**
 * Helper to validate log level
 */
const validateLogLevel = (level: string | undefined): 'error' | 'warn' | 'info' | 'debug' => {
  const validLevels = ['error', 'warn', 'info', 'debug'] as const;
  if (!level || !validLevels.includes(level as any)) {
    return 'info';
  }
  return level as 'error' | 'warn' | 'info' | 'debug';
};

/**
 * Helper to parse CORS origins safely
 */
const parseCorsOrigins = (origins: string | undefined): string[] => {
  if (!origins) return ['http://localhost:4200'];
  return origins.split(',').map(origin => origin.trim()).filter(Boolean);
};

// Environment configuration with full type safety
export const env: EnvironmentConfig = {
  // Application
  NODE_ENV: validateNodeEnv(getEnv('NODE_ENV')),
  PORT: parseIntSafe(getEnv('PORT'), 3000, 'PORT'),
  API_BASE_URL: getEnv('API_BASE_URL') || '/api/v1',
  APP_NAME: getEnv('APP_NAME') || 'LMS Admin Portal',
  IS_PRODUCTION: validateNodeEnv(getEnv('NODE_ENV')) === 'production',
  IS_DEVELOPMENT: validateNodeEnv(getEnv('NODE_ENV')) === 'development',
  IS_TEST: validateNodeEnv(getEnv('NODE_ENV')) === 'test',
  
  // Database
  DATABASE_URL: requireEnv('DATABASE_URL'),
  DB_AUTO_CONNECT: getEnv('DB_AUTO_CONNECT') !== 'false',
  
  // JWT
  JWT_SECRET: requireEnv('JWT_SECRET'),
  JWT_EXPIRES_IN: getEnv('JWT_EXPIRES_IN') || (validateNodeEnv(getEnv('NODE_ENV')) === 'development' ? '2h' : '15m'),
  JWT_REFRESH_SECRET: requireEnv('JWT_REFRESH_SECRET'),
  JWT_REFRESH_EXPIRES_IN: getEnv('JWT_REFRESH_EXPIRES_IN') || '7d',
  JWT_ISSUER: getEnv('JWT_ISSUER') || 'lms-admin',
  JWT_AUDIENCE: getEnv('JWT_AUDIENCE') || 'lms-client',
  
  // CORS
  CORS_ORIGIN: parseCorsOrigins(getEnv('CORS_ORIGIN')),
  
  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: parseIntSafe(getEnv('RATE_LIMIT_WINDOW_MS'), 900000, 'RATE_LIMIT_WINDOW_MS'),
  RATE_LIMIT_MAX_REQUESTS: parseIntSafe(getEnv('RATE_LIMIT_MAX_REQUESTS'), 100, 'RATE_LIMIT_MAX_REQUESTS'),
  
  // Logging
  LOG_LEVEL: validateLogLevel(getEnv('LOG_LEVEL')),
  
  // Bunny.net
  BUNNY_API_KEY: getEnv('BUNNY_API_KEY') || '',
  BUNNY_STORAGE_ZONE_NAME: getEnv('BUNNY_STORAGE_ZONE_NAME') || '',
  BUNNY_PULL_ZONE_URL: getEnv('BUNNY_PULL_ZONE_URL') || '',
  BUNNY_DRM_USER_ID: getEnv('BUNNY_DRM_USER_ID') || '',
  BUNNY_DRM_API_KEY: getEnv('BUNNY_DRM_API_KEY') || '',
  
  // File Uploads
  MAX_FILE_SIZE_MB: parseIntSafe(getEnv('MAX_FILE_SIZE_MB'), 10, 'MAX_FILE_SIZE_MB'),
  UPLOAD_TEMP_DIR: getEnv('UPLOAD_TEMP_DIR') || path.join(__dirname, '../../uploads/temp'),
  
  // Socket.IO
  SOCKET_IO_PATH: getEnv('SOCKET_IO_PATH') || '/socket.io',
};

export default env;
