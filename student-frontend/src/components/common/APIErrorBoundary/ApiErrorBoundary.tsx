/**
 * @file ApiErrorBoundary.tsx
 * @description API-specific error boundary for handling API-related errors with enhanced UI
 */

import React from 'react';
import { QueryErrorResetBoundary } from '@tanstack/react-query';
import { ErrorBoundary } from 'react-error-boundary';
import { motion } from 'framer-motion';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';
import StateDisplay from '@/components/common/StateDisplay';
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
        return (
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        );
      case 403:
        return (
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728" />
          </svg>
        );
      case 404:
        return (
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        );
      case 429:
        return (
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 500:
        return (
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        );
      default:
        return (
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        );
    }
  };

  const getErrorTitle = () => {
    switch (error.statusCode) {
      case 401:
        return 'Authentication Required';
      case 403:
        return 'Access Denied';
      case 404:
        return 'Resource Not Found';
      case 429:
        return 'Rate Limit Exceeded';
      case 500:
        return 'Server Error';
      default:
        return 'API Error';
    }
  };

  // Animation variants for the error UI elements
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        when: "beforeChildren",
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.5 } }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] bg-neutral-50 p-4">
      <motion.div
        className="w-full max-w-2xl"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <motion.div variants={itemVariants}>
          <StateDisplay 
            label={getErrorTitle()} 
            state="error" 
            size="lg"
          />
        </motion.div>
        
        <motion.div variants={itemVariants} className="mt-4">
          <Card 
            title={
              <div className="flex items-center">
                <span className="text-error mr-2">
                  {getErrorIcon()}
                </span>
                <span>{getErrorTitle()}</span>
              </div>
            }
            footer={
              <div className="flex justify-end space-x-2">
                <Button
                  onClick={resetError}
                  variant="primary"
                  leftIcon={
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  }
                  animationVariant="emphatic"
                >
                  Try Again
                </Button>
                
                {error.statusCode === 401 && (
                  <Button
                    onClick={() => window.location.href = '/login'}
                    variant="outline"
                    leftIcon={
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                      </svg>
                    }
                  >
                    Login
                  </Button>
                )}
              </div>
            }
          >
            <div className="space-y-4">
              <p className="text-neutral-600">
                {getErrorMessage()}
              </p>

              {import.meta.env.DEV && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  transition={{ duration: 0.3, delay: 0.5 }}
                  className="overflow-hidden"
                >
                  <div className="text-sm font-medium text-neutral-700 mb-2">Technical Details (Development)</div>
                  <div className="bg-neutral-100 border border-neutral-200 p-3 rounded text-xs text-neutral-800 space-y-1">
                    <p><strong>Status:</strong> {error.statusCode}</p>
                    <p><strong>Code:</strong> {error.errorCode || 'N/A'}</p>
                    <p><strong>Correlation ID:</strong> {error.correlationId || 'N/A'}</p>
                    {error.details && (
                      <div className="mt-2">
                        <strong>Details:</strong>
                        <pre className="mt-1 text-xs max-w-full overflow-x-auto">
                          {JSON.stringify(error.details, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </div>
          </Card>
        </motion.div>
      </motion.div>
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
            
            // Fallback for non-API errors - use enhanced UI
            const containerVariants = {
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: {
                  when: "beforeChildren",
                  staggerChildren: 0.2
                }
              }
            };

            const itemVariants = {
              hidden: { y: 20, opacity: 0 },
              visible: { y: 0, opacity: 1, transition: { duration: 0.5 } }
            };

            return (
              <div className="flex flex-col items-center justify-center min-h-[400px] bg-neutral-50 p-4">
                <motion.div
                  className="w-full max-w-2xl"
                  initial="hidden"
                  animate="visible"
                  variants={containerVariants}
                >
                  <motion.div variants={itemVariants}>
                    <StateDisplay 
                      label="Unexpected Error" 
                      state="error" 
                      size="lg"
                    />
                  </motion.div>
                  
                  <motion.div variants={itemVariants} className="mt-4">
                    <Card 
                      title={
                        <div className="flex items-center">
                          <svg className="h-6 w-6 text-error mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                          </svg>
                          <span>Unexpected Error</span>
                        </div>
                      }
                      footer={
                        <div className="flex justify-end">
                          <Button
                            onClick={() => {
                              reset();
                              resetErrorBoundary();
                            }}
                            variant="primary"
                            leftIcon={
                              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                              </svg>
                            }
                            animationVariant="emphatic"
                          >
                            Try Again
                          </Button>
                        </div>
                      }
                    >
                      <p className="text-neutral-600">
                        An unexpected error occurred. Please try again.
                      </p>
                    </Card>
                  </motion.div>
                </motion.div>
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
