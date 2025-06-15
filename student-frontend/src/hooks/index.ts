/**
 * @file hooks/index.ts
 * @description Barrel exports for custom hooks with enhanced type safety
 */

// Error boundary hooks
export { 
  useErrorBoundary, 
  useApiErrorBoundary, 
  useTypedErrorBoundary 
} from './useErrorBoundary';
export type { BoundaryError } from './useErrorBoundary';

// API hooks
export { 
  useApiItem, 
  useApiList, 
  useApiCreate, 
  useApiUpdate, 
  useApiDelete,
  useApiCrud
} from './useApi';

// Re-export commonly used types for convenience
export type { ApiError } from '@/api/client';
export type { PaginatedResponseResult } from '@/api/response-utils';
