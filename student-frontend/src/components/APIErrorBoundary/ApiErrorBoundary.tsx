/**
 * @file ApiErrorBoundary.tsx
 * @description API-specific error boundary for handling API-related errors
 */

import React from 'react';
import { QueryErrorResetBoundary } from '@tanstack/react-query';
import { ErrorBoundary } from 'react-error-boundary';
import { ApiError } from '@/types/auth.types';

interface ApiErrorBoundaryProps {
  children: React.ReactNode;
}

/**
 * API Error Display Component
 */
const ApiErrorDisplay: React.FC<{ 
  error: ApiError; 
  resetError: () => void;
}> = ({ error, resetError }) => {
  const getErrorMessage = () => {
    switch (error.statusCode) {
      case 401:
        return 'Your session has expired. Please log in again.';
      case 403:
        return 'You do not have permission to access this resource.';
      case 404:
        return 'The requested resource was not found.';
      case 429:
        return 'Too many requests. Please try again later.';
      case 500:
        return 'Server error. Please try again later.';
      default:
        return error.message || 'An unexpected error occurred.';
    }
  };

  const getErrorIcon = () => {
    switch (error.statusCode) {
      case 401:
        return '🔒';
      case 403:
        return '🚫';
      case 404:
        return '🔍';
      case 429:
        return '⏱️';
      case 500:
        return '🛠️';
      default:
        return '⚠️';
    }
  };

  return (
    <div className="min-h-[400px] flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <div className="text-6xl mb-4">{getErrorIcon()}</div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {error.statusCode >= 500 ? 'Server Error' : 'Request Error'}
        </h3>
        <p className="text-gray-600 mb-6">{getErrorMessage()}</p>
        
        {import.meta.env.DEV && (
          <details className="mb-6 text-left">
            <summary className="cursor-pointer text-sm font-medium text-red-600 mb-2">
              Technical Details
            </summary>
            <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded">
              <p><strong>Status:</strong> {error.statusCode}</p>
              <p><strong>Code:</strong> {error.errorCode || 'N/A'}</p>
              <p><strong>Correlation ID:</strong> {error.correlationId || 'N/A'}</p>
              {error.details && (
                <div className="mt-2">
                  <strong>Details:</strong>
                  <pre className="mt-1 text-xs">
                    {JSON.stringify(error.details, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </details>
        )}

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={resetError}
            className="flex-1 py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            Try Again
          </button>
          
          {error.statusCode === 401 && (
            <button
              onClick={() => window.location.href = '/login'}
              className="flex-1 py-2 px-4 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              Login
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

/**
 * API Error Boundary Component
 */
export const ApiErrorBoundary: React.FC<ApiErrorBoundaryProps> = ({ children }) => {
  return (
    <QueryErrorResetBoundary>
      {({ reset }) => (
        <ErrorBoundary
          onError={(error) => {
            if (error instanceof ApiError) {
              console.error('API Error:', {
                status: error.statusCode,
                code: error.errorCode,
                message: error.message,
                correlationId: error.correlationId,
              });
            }
          }}
          fallbackRender={({ error, resetErrorBoundary }) => {
            if (error instanceof ApiError) {
              return (
                <ApiErrorDisplay 
                  error={error} 
                  resetError={() => {
                    reset();
                    resetErrorBoundary();
                  }} 
                />
              );
            }
            
            // Fallback for non-API errors
            return (
              <div className="min-h-[400px] flex items-center justify-center p-4">
                <div className="max-w-md w-full text-center">
                  <div className="text-6xl mb-4">❌</div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Unexpected Error
                  </h3>
                  <p className="text-gray-600 mb-6">
                    An unexpected error occurred. Please try again.
                  </p>
                  <button
                    onClick={() => {
                      reset();
                      resetErrorBoundary();
                    }}
                    className="py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  >
                    Try Again
                  </button>
                </div>
              </div>
            );
          }}
        >
          {children}
        </ErrorBoundary>
      )}
    </QueryErrorResetBoundary>
  );
};

// Export for convenience
export { default as ErrorBoundary } from '@/components/common/ErrorBoundary/ErrorBoundary';
