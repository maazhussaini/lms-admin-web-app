import React from 'react';
import { motion } from 'framer-motion';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';
import StateDisplay from '@/components/common/StateDisplay';

interface ErrorBoundaryProps {
  children: React.ReactNode;
  
  /**
   * Optional function to handle retry/refresh action
   * @default window.location.reload
   */
  onReset?: () => void;
  
  /**
   * Optional fallback component to display instead of the default error UI
   */
  fallback?: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * Error Boundary component to gracefully handle runtime errors
 * Enhanced with animations and improved UI
 */
class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
    this.handleReset = this.handleReset.bind(this);
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // You can log error info to an error reporting service here
    console.error('ErrorBoundary caught an error', error, errorInfo);
  }

  handleReset() {
    const { onReset } = this.props;
    
    this.setState({ hasError: false, error: null });
    
    if (onReset) {
      onReset();
    } else {
      window.location.reload();
    }
  }

  render() {
    const { hasError, error } = this.state;
    const { children, fallback } = this.props;
    
    if (!hasError) {
      return children;
    }
    
    if (fallback) {
      return fallback;
    }

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
      <div className="flex flex-col items-center justify-center min-h-screen bg-neutral-50">
        <motion.div
          className="w-full max-w-2xl px-4"
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          <motion.div variants={itemVariants}>
            <StateDisplay 
              label="Application Error" 
              state="error" 
              size="lg"
            />
          </motion.div>
          
          <motion.div variants={itemVariants} className="mt-4">
            <Card 
              title={
                <div className="flex items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 text-error mr-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                  <span>Something went wrong</span>
                </div>
              }
              footer={
                <div className="flex justify-end space-x-2">
                  <Button
                    onClick={this.handleReset}
                    variant="primary"
                    leftIcon={
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                        />
                      </svg>
                    }
                    animationVariant="emphatic"
                  >
                    Try Again
                  </Button>
                </div>
              }
            >
              <div className="space-y-4">
                <p className="text-neutral-600">
                  We apologize for the inconvenience. The application encountered an unexpected error.
                </p>

                {error && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    transition={{ duration: 0.3, delay: 0.5 }}
                    className="overflow-hidden"
                  >
                    <div className="text-sm font-medium text-neutral-700 mb-1">Error details:</div>
                    <pre className="bg-neutral-100 border border-neutral-200 p-3 rounded text-xs text-neutral-800 max-w-full overflow-x-auto">
                      {error.message || 'Unknown error'}
                      {error.stack && (
                        <>
                          <br />
                          <br />
                          {error.stack.split('\n').slice(1, 4).join('\n')}
                        </>
                      )}
                    </pre>
                  </motion.div>
                )}
              </div>
            </Card>
          </motion.div>
        </motion.div>
      </div>
    );
  }
}

export default ErrorBoundary;
