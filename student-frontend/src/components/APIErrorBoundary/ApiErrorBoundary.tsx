/**
 * @file components/ErrorBoundary/ApiErrorBoundary.tsx
 * @description Modern functional API error boundary using react-error-boundary
 */

import React, { ReactNode, useCallback, useEffect, useState, ErrorInfo } from 'react';
import { ErrorBoundary, withErrorBoundary, useErrorBoundary } from 'react-error-boundary';
import { ApiError } from '@/api/client';
import { TApiErrorResponse } from '@shared/types/api.types';

/**
 * Props for the API Error Boundary
 */
interface ApiErrorBoundaryProps {
  children: ReactNode;
  fallback?: (error: ApiError, retry: () => void) => ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  enableRetry?: boolean;
  maxRetries?: number;
  retryDelay?: number;
  resetKeys?: Array<string | number>;
  onReset?: (details: { reason: 'imperative-api' | 'keys' }) => void;
}

/**
 * Props for the fallback component (follows react-error-boundary pattern)
 */
interface FallbackProps {
  error: Error;
  resetErrorBoundary: () => void;
}

/**
 * Extended fallback props with our custom options
 */
interface ApiErrorFallbackProps extends FallbackProps {
  enableRetry?: boolean;
  maxRetries?: number;
}

/**
 * Hook for managing retry logic
 */
function useRetryLogic(maxRetries: number = 3, retryDelay: number = 1000) {
  const [retryCount, setRetryCount] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);

  const retry = useCallback((resetErrorBoundary: () => void) => {
    if (retryCount >= maxRetries) {
      console.warn('Maximum retry attempts reached');
      return;
    }

    setIsRetrying(true);
    setRetryCount(prev => prev + 1);

    // Exponential backoff
    const delay = retryDelay * Math.pow(2, retryCount);
    
    setTimeout(() => {
      setIsRetrying(false);
      resetErrorBoundary();
    }, delay);
  }, [retryCount, maxRetries, retryDelay]);

  const reset = useCallback(() => {
    setRetryCount(0);
    setIsRetrying(false);
  }, []);

  return { retryCount, isRetrying, retry, reset };
}

/**
 * Hook for error classification and user-friendly messages
 */
function useErrorClassification(error: ApiError) {
  const isNetworkError = error.statusCode >= 500 || error.statusCode === 0;
  const isValidationError = error.statusCode === 422;
  const isNotFoundError = error.statusCode === 404;

  const getErrorMessage = useCallback(() => {
    switch (error.statusCode) {
      case 400:
        return 'The request contains invalid data. Please check your input and try again.';
      case 401:
        return 'You need to log in to access this resource.';
      case 403:
        return 'You don\'t have permission to access this resource.';
      case 404:
        return 'The requested resource could not be found.';
      case 409:
        return 'There was a conflict with the current state of the resource.';
      case 422:
        return 'The submitted data could not be processed. Please check the form below.';
      case 429:
        return 'Too many requests. Please wait a moment before trying again.';
      case 500:
        return 'An internal server error occurred. Our team has been notified.';
      case 502:
      case 503:
        return 'The service is temporarily unavailable. Please try again later.';
      default:
        return error.message || 'An unexpected error occurred.';
    }
  }, [error]);

  const getErrorIcon = useCallback(() => {
    if (isNetworkError) return '🌐';
    if (error.statusCode === 401 || error.statusCode === 403) return '🔒';
    if (isNotFoundError) return '🔍';
    if (isValidationError) return '📝';
    return '⚠️';
  }, [isNetworkError, isNotFoundError, isValidationError, error.statusCode]);

  const getErrorTitle = useCallback(() => {
    if (isNetworkError) return 'Connection Error';
    if (error.statusCode === 401 || error.statusCode === 403) return 'Access Denied';
    if (isNotFoundError) return 'Not Found';
    if (isValidationError) return 'Validation Error';
    return 'Something Went Wrong';
  }, [isNetworkError, isNotFoundError, isValidationError, error.statusCode]);

  return {
    isNetworkError,
    isValidationError,
    isNotFoundError,
    getErrorMessage,
    getErrorIcon,
    getErrorTitle
  };
}

/**
 * Component for rendering validation errors
 */
function ValidationErrors({ details }: { details: Record<string, string[]> }) {
  const errors = Object.entries(details).flatMap(([field, messages]) =>
    messages.map(message => ({ field, message }))
  );

  if (errors.length === 0) return null;

  return (
    <div className="mb-4 p-3 bg-error-50 border border-error-200 rounded-md">
      <h4 className="text-sm font-medium text-error-800 mb-2">
        Please fix the following issues:
      </h4>
      <ul className="text-sm text-error-700 space-y-1">
        {errors.map((error, index) => (
          <li key={index} className="flex">
            <span className="font-medium mr-1">{error.field}:</span>
            <span>{error.message}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/**
 * Component for development error details
 */
function DevelopmentErrorDetails({ error }: { error: ApiError }) {
  if (!import.meta.env.DEV) return null;

  return (
    <details className="mt-4 text-left">
      <summary className="cursor-pointer text-sm text-neutral-600 hover:text-neutral-800">
        Technical Details
      </summary>
      <pre className="mt-2 p-3 bg-neutral-100 rounded text-xs overflow-auto max-h-40 text-neutral-800">
        {JSON.stringify({
          statusCode: error.statusCode,
          errorCode: error.errorCode,
          message: error.message,
          details: error.details,
          correlationId: error.correlationId,
          stack: error.stack
        }, null, 2)}
      </pre>
    </details>
  );
}

/**
 * Default error fallback component
 */
function ApiErrorFallback({ 
  error, 
  resetErrorBoundary,
  enableRetry = true,
  maxRetries = 3 
}: ApiErrorFallbackProps) {
  const { retryCount, isRetrying, retry, reset } = useRetryLogic(maxRetries);
  
  // Convert generic Error to ApiError if needed
  const apiError = error instanceof ApiError 
    ? error 
    : new ApiError({
        success: false,
        statusCode: 500,
        message: error.message || 'An unexpected error occurred',
        errorCode: 'UNKNOWN_ERROR',
        timestamp: new Date().toISOString()
      } as TApiErrorResponse);

  const {
    isNetworkError,
    getErrorMessage,
    getErrorIcon,
    getErrorTitle
  } = useErrorClassification(apiError);

  const canRetry = enableRetry && retryCount < maxRetries && isNetworkError;

  const handleRetry = useCallback(() => {
    retry(resetErrorBoundary);
  }, [retry, resetErrorBoundary]);

  const handleReset = useCallback(() => {
    reset();
    resetErrorBoundary();
  }, [reset, resetErrorBoundary]);

  // Reset retry count when error boundary resets
  useEffect(() => {
    return () => reset();
  }, [reset]);

  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-4" role="alert">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6">
        <div className="text-center mb-4">
          <div className="text-4xl mb-2">
            {getErrorIcon()}
          </div>
          
          <h2 className="text-xl font-semibold text-neutral-900 mb-2">
            {getErrorTitle()}
          </h2>
          
          <p className="text-neutral-600 mb-4">
            {getErrorMessage()}
          </p>
          
          {apiError.correlationId && (
            <p className="text-xs text-neutral-500 mb-4 font-mono">
              Reference ID: {apiError.correlationId}
            </p>
          )}
        </div>
        
        {apiError.details && <ValidationErrors details={apiError.details} />}
        
        <div className="flex flex-col gap-2">
          {canRetry && (
            <button 
              onClick={handleRetry}
              disabled={isRetrying || retryCount >= maxRetries}
              className="w-full bg-primary-600 text-white py-2 px-4 rounded-md hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isRetrying 
                ? 'Retrying...' 
                : `Retry ${retryCount > 0 ? `(${retryCount}/${maxRetries})` : ''}`
              }
            </button>
          )}
          
          <button 
            onClick={handleReset} 
            className="w-full bg-neutral-200 text-neutral-900 py-2 px-4 rounded-md hover:bg-neutral-300 transition-colors"
          >
            Go Back
          </button>
          
          <DevelopmentErrorDetails error={apiError} />
        </div>
      </div>
    </div>
  );
}

/**
 * Modern functional API Error Boundary component
 */
export function ApiErrorBoundary({
  children,
  fallback,
  onError,
  enableRetry = true,
  maxRetries = 3,
  resetKeys = [],
  onReset
}: ApiErrorBoundaryProps) {
  // Create fallback render function
  const fallbackRender = useCallback(({ error, resetErrorBoundary }: FallbackProps) => {
    // If custom fallback is provided and error is ApiError, use it
    if (fallback && error instanceof ApiError) {
      return fallback(error, resetErrorBoundary);
    }

    // Otherwise use default fallback
    return (
      <ApiErrorFallback 
        error={error}
        resetErrorBoundary={resetErrorBoundary}
        enableRetry={enableRetry}
        maxRetries={maxRetries}
      />
    );
  }, [fallback, enableRetry, maxRetries]);

  // Handle errors with proper logging and type compatibility
  const handleError = useCallback((error: Error, errorInfo: ErrorInfo) => {
    // Convert to ApiError if needed for logging
    const apiError = error instanceof ApiError 
      ? error 
      : new ApiError({
          success: false,
          statusCode: 500,
          message: error.message || 'An unexpected error occurred',
          errorCode: 'UNKNOWN_ERROR',
          timestamp: new Date().toISOString()
        } as TApiErrorResponse);

    // Log the error
    console.error('API Error caught by boundary:', {
      error: apiError,
      errorInfo: {
        componentStack: errorInfo.componentStack || 'No component stack available'
      },
      correlationId: apiError.correlationId,
      timestamp: new Date().toISOString()
    });

    // Call custom error handler if provided
    if (onError) {
      onError(error, errorInfo);
    }
  }, [onError]);

  return (
    <ErrorBoundary
      fallbackRender={fallbackRender}
      onError={handleError}
      resetKeys={resetKeys}
      onReset={onReset}
    >
      {children}
    </ErrorBoundary>
  );
}

/**
 * HOC to wrap components with API error boundary
 */
export function withApiErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<ApiErrorBoundaryProps, 'children'>
) {
  return withErrorBoundary(Component, {
    fallbackRender: ({ error, resetErrorBoundary }: FallbackProps) => (
      <ApiErrorFallback 
        error={error}
        resetErrorBoundary={resetErrorBoundary}
        enableRetry={errorBoundaryProps?.enableRetry}
        maxRetries={errorBoundaryProps?.maxRetries}
      />
    ),
    onError: errorBoundaryProps?.onError,
    resetKeys: errorBoundaryProps?.resetKeys,
    onReset: errorBoundaryProps?.onReset
  });
}

/**
 * Hook to throw errors to the nearest error boundary
 * Uses react-error-boundary's useErrorBoundary hook
 */
export function useApiErrorBoundary() {
  const { showBoundary } = useErrorBoundary();
  
  return useCallback((error: Error | ApiError) => {
    showBoundary(error);
  }, [showBoundary]);
}
