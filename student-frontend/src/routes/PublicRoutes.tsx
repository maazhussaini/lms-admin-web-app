import React from 'react';
import { useLocation } from 'react-router-dom';
import { PublicOnlyGuard } from './guards';

// Import the actual LoginPage component
import LoginPage from '@/pages/LoginPage/LoginPage';
// Import the actual ForgotPasswordPage component
import ForgotPasswordPage from '@/pages/ForgotPasswordPage/ForgotPasswordPage';
// Import the actual ForgotCheckEmailPage component
import ForgotCheckEmailPage from '@/pages/ForgotCheckEmailPage/ForgotCheckEmailPage';
// Import the actual ResetPasswordPage component
import ResetPasswordPage from '@/pages/ResetPasswordPage/ResetPasswordPage';
// Import the actual ResetPasswordSuccessPage component
import ResetPasswordSuccessPage from '@/pages/ResetPasswordSuccessPage/ResetPasswordSuccessPage';
// Import the actual SignUpPage component
import SignUpPage from '@/pages/SignUpPage';

const UnauthorizedPage = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="text-center">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Unauthorized Access</h1>
      <p className="text-gray-600 mb-8">You don't have permission to access this resource.</p>
    </div>
  </div>
);

const NotFoundPage = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="text-center">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Page Not Found</h1>
      <p className="text-gray-600 mb-8">The page you're looking for doesn't exist or has been moved.</p>
    </div>
  </div>
);

/**
 * Public routes component that renders the appropriate page based on current path
 * Handles both guarded and unguarded public routes without nested Routes
 */
export const PublicRoutes: React.FC = () => {
  const location = useLocation();
  const currentPath = location.pathname;

  // Routes that should redirect authenticated users away
  const guardedPaths = [
    '/login',
    '/signup',
    '/forgot-password',
    '/forgot-password/check-email',
    '/reset-password',
    '/reset-password-success'
  ];
  const isGuardedPath = guardedPaths.includes(currentPath);

  // Determine which page to render based on path
  const renderPage = () => {
    switch (currentPath) {
      case '/login':
        return <LoginPage />;
      case '/signup':
        return <SignUpPage />;
      case '/forgot-password':
        return <ForgotPasswordPage />;
      case '/forgot-password/check-email':
        return <ForgotCheckEmailPage />;
      case '/reset-password':
        return <ResetPasswordPage />;
      case '/reset-password-success':
        return <ResetPasswordSuccessPage />;
      case '/unauthorized':
        return <UnauthorizedPage />;
      case '/404':
        return <NotFoundPage />;
      default:
        return <NotFoundPage />;
    }
  };

  // For guarded paths, wrap with PublicOnlyGuard
  if (isGuardedPath) {
    return (
      <PublicOnlyGuard>
        {renderPage()}
      </PublicOnlyGuard>
    );
  }

  // For unguarded public routes, render directly
  return renderPage();
};