/**
 * @file hooks/useErrorBoundary.ts
 * @description Hook to trigger error boundary from within components with enhanced type safety
 */

import { useErrorBoundary as useReactErrorBoundary } from 'react-error-boundary';
import { ApiError } from '@/api/client';

/**
 * Supported error types for error boundary
 */
export type BoundaryError = Error | ApiError | DOMException | TypeError | ReferenceError;

/**
 * Error boundary hook result with improved typing
 */
interface ErrorBoundaryHookResult {
  showBoundary: (error: BoundaryError) => void;
  resetBoundary: () => void;
}

/**
 * Hook to trigger error boundary from within components
 * Uses react-error-boundary's useErrorBoundary for consistency
 * 
 * @returns Object with showBoundary function and resetBoundary function
 * 
 * @example
 * ```typescript
 * const { showBoundary } = useErrorBoundary();
 * 
 * const handleApiError = (error: ApiError) => {
 *   showBoundary(error);
 * };
 * ```
 */
export function useErrorBoundary(): ErrorBoundaryHookResult {
  const { showBoundary, resetBoundary } = useReactErrorBoundary();
  
  return {
    showBoundary: (error: BoundaryError): void => {
      showBoundary(error);
    },
    resetBoundary
  };
}

/**
 * Alias for consistency with the new API error boundary
 * Returns only the showBoundary function for backward compatibility
 * 
 * @returns Function to show API errors in error boundary
 */
export const useApiErrorBoundary = (): ((error: BoundaryError) => void) => {
  const { showBoundary } = useErrorBoundary();
  return showBoundary;
};

/**
 * Hook for handling specific error types with type guards
 */
export function useTypedErrorBoundary() {
  const { showBoundary, resetBoundary } = useErrorBoundary();

  const showApiError = (error: ApiError): void => {
    showBoundary(error);
  };

  const showNetworkError = (error: TypeError | DOMException): void => {
    showBoundary(error);
  };

  const showGenericError = (error: Error): void => {
    showBoundary(error);
  };

  const showUnknownError = (error: unknown): void => {
    if (error instanceof Error) {
      showBoundary(error);
    } else {
      showBoundary(new Error(String(error)));
    }
  };

  return {
    showApiError,
    showNetworkError,
    showGenericError,
    showUnknownError,
    resetBoundary
  };
}
