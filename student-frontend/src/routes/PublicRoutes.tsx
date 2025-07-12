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

// Dummy components for development purposes (keeping existing ones for other routes)
const DummyPage = ({ pageName, description }: { pageName: string; description: string }) => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center">
    <div className="max-w-md w-full space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{pageName}</h1>
        <p className="text-gray-600 mb-8">{description}</p>
        
        <div className="bg-white shadow-md rounded-lg p-6">
          <div className="text-sm text-gray-500 mb-4">
            📍 Current Path: <code className="bg-gray-100 px-2 py-1 rounded">{window.location.pathname}</code>
          </div>
          
          <div className="space-y-2">
            <p className="text-sm text-gray-700">This is a temporary placeholder component.</p>
            <p className="text-sm text-gray-700">The actual {pageName.toLowerCase()} implementation will be added later.</p>
          </div>
          
          {/* Development navigation links */}
          <div className="mt-6 pt-4 border-t">
            <h3 className="text-sm font-medium text-gray-900 mb-3">Quick Navigation</h3>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <a href="/login" className="text-blue-600 hover:text-blue-800 underline">Login</a>
              <a href="/dashboard" className="text-blue-600 hover:text-blue-800 underline">Dashboard</a>
              <a href="/courses" className="text-blue-600 hover:text-blue-800 underline">Courses</a>
              <a href="/profile" className="text-blue-600 hover:text-blue-800 underline">Profile</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const UnauthorizedPage = () => (
  <DummyPage 
    pageName="Unauthorized Access" 
    description="You don't have permission to access this resource."
  />
);

const NotFoundPage = () => (
  <DummyPage 
    pageName="Page Not Found" 
    description="The page you're looking for doesn't exist or has been moved."
  />
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