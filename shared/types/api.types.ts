/**
 * @file api.types.ts
 * @description Standard API response types and authentication structures.
 */

import { SystemUserRole } from './system-users.types';

/**
 * Standard success response structure for all API endpoints
 */
export interface TApiSuccessResponse<T = any> {
  success: true;
  statusCode: number;
  message: string;
  data: T;
  timestamp: string;
  correlationId?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

/**
 * Standard error response structure for all API endpoints
 */
export interface TApiErrorResponse {
  success: false;
  statusCode: number;
  message: string;
  errorCode?: string;
  details?: Record<string, string[]>;
  timestamp: string;
  correlationId?: string;
  path?: string;
}

/**
 * User type enumeration for authentication
 * @description Distinguishes between different categories of users in the system
 */
export enum UserType {
  STUDENT = 'STUDENT',
  TEACHER = 'TEACHER',
  TENANT_ADMIN = 'TENANT_ADMIN',
  SUPER_ADMIN = 'SUPER_ADMIN'
}

/**
 * Authentication response structure
 */
export interface TAuthResponse {
  user: {
    id: number;
    username: string;
    full_name: string;
    email: string;
    role: {
      role_type?: SystemUserRole;      // Only for system users (ADMIN, SUPER_ADMIN)
      role_name: string;               // Descriptive name for all user types
    };
    tenant_id: number;
    user_type: UserType;               // Changed to use UserType enum
  };
  tokens: {
    access_token: string;
    refresh_token: string;
    expires_in: number;
    token_type: 'Bearer';
  };
  permissions: string[];
}

/**
 * Refresh token response structure
 */
export interface TRefreshTokenResponse {
  access_token: string;
  expires_in: number;
  token_type: 'Bearer';
}

/**
 * Generic list response with pagination
 */
export interface TListResponse<T> {
  items: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

/**
 * File upload response structure
 */
export interface TFileUploadResponse {
  file_id: string;
  file_name: string;
  file_url: string;
  file_size_bytes: number;
  mime_type: string;
  upload_timestamp: string;
}

/**
 * Bulk operation response structure
 */
export interface TBulkOperationResponse<T = any> {
  success_count: number;
  failure_count: number;
  total_count: number;
  successful_items?: T[];
  failed_items?: {
    item: T;
    error: string;
  }[];
}

/**
 * Health check response structure
 */
export interface THealthCheckResponse {
  status: 'healthy' | 'unhealthy' | 'degraded';
  timestamp: string;
  version: string;
  uptime: number;
  checks: {
    database: 'healthy' | 'unhealthy';
    redis: 'healthy' | 'unhealthy';
    file_storage: 'healthy' | 'unhealthy';
    external_services: 'healthy' | 'unhealthy';
  };
}

/**
 * Assessment progress types for student endpoints
 */
export interface QuizProgress {
  quiz_id: number;
  quiz_name: string;
  status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'OVERDUE';
  attempts_count: number;
  max_attempts: number | null;
  best_score: number | null;
  total_marks: number;
  due_date: string | null;
  last_attempt_date: string | null;
}

export interface AssignmentProgress {
  assignment_id: number;
  assignment_name: string;
  status: 'NOT_SUBMITTED' | 'SUBMITTED' | 'LATE_SUBMITTED' | 'GRADED' | 'OVERDUE';
  submission_date: string | null;
  grade: number | null;
  total_marks: number;
  due_date: string;
  feedback: string | null;
}