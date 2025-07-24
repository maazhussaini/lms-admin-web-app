import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { queryClient } from '@/store/queryClient';
import { AuthProvider } from '@/context/AuthContext';
import { Helmet } from 'react-helmet-async';
import { ProtectedRoutes } from './ProtectedRoutes';
import { PublicLayout } from '@/components/layout/PublicLayout';
import { PublicOnlyGuard } from './guards';
import { MyCoursesPage } from '@/pages/MyCoursesPage';
import { CourseDetailsPage } from '@/pages/CourseDetailsPage';
import { VideoPlayerPage } from '@/pages/VideoPlayerPage';

// Import public page components
import LoginPage from '@/pages/LoginPage/LoginPage';
import ForgotPasswordPage from '@/pages/ForgotPasswordPage/ForgotPasswordPage';
import ForgotCheckEmailPage from '@/pages/ForgotCheckEmailPage/ForgotCheckEmailPage';
import ResetPasswordPage from '@/pages/ResetPasswordPage/ResetPasswordPage';
import ResetPasswordSuccessPage from '@/pages/ResetPasswordSuccessPage/ResetPasswordSuccessPage';
import SignUpPage from '@/pages/SignUpPage';

// Public page components that don't need guard protection
const UnauthorizedPage = () => (
  <PublicLayout title="Unauthorized">
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Unauthorized Access</h1>
        <p className="text-gray-600 mb-8">You don't have permission to access this resource.</p>
      </div>
    </div>
  </PublicLayout>
);

const NotFoundPage = () => (
  <PublicLayout title="Page Not Found">
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Page Not Found</h1>
        <p className="text-gray-600 mb-8">The page you're looking for doesn't exist or has been moved.</p>
      </div>
    </div>
  </PublicLayout>
);

/**
 * Simplified main application router
 * - Clear separation between public and protected routes
 * - Integrated with QueryClient and AuthProvider
 * - Consistent error boundaries and loading states
 */
const AppRouter: React.FC = () => {
  return (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <Helmet>
            <title>Student LMS Portal</title>
            <meta name="description" content="Learning Management System for Students" />
          </Helmet>
          
          <React.Suspense fallback={
            <div className="min-h-screen flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
              <p className="mt-4 text-gray-600">Loading...</p>
            </div>
          }>
            <Routes>
              {/* Default redirect */}
              <Route path="/" element={<Navigate to="/courses" replace />} />
              
              {/* Public routes with proper declarative structure */}
              <Route path="/login" element={
                <PublicOnlyGuard>
                  <PublicLayout title="Login">
                    <LoginPage />
                  </PublicLayout>
                </PublicOnlyGuard>
              } />
              <Route path="/signup" element={
                <PublicOnlyGuard>
                  <PublicLayout title="Sign Up">
                    <SignUpPage />
                  </PublicLayout>
                </PublicOnlyGuard>
              } />
              <Route path="/forgot-password" element={
                <PublicOnlyGuard>
                  <PublicLayout title="Forgot Password">
                    <ForgotPasswordPage />
                  </PublicLayout>
                </PublicOnlyGuard>
              } />
              <Route path="/forgot-password/check-email" element={
                <PublicOnlyGuard>
                  <PublicLayout title="Check Email">
                    <ForgotCheckEmailPage />
                  </PublicLayout>
                </PublicOnlyGuard>
              } />
              <Route path="/reset-password" element={
                <PublicOnlyGuard>
                  <PublicLayout title="Reset Password">
                    <ResetPasswordPage />
                  </PublicLayout>
                </PublicOnlyGuard>
              } />
              <Route path="/reset-password-success" element={
                <PublicOnlyGuard>
                  <PublicLayout title="Password Reset Success">
                    <ResetPasswordSuccessPage />
                  </PublicLayout>
                </PublicOnlyGuard>
              } />
              
              {/* Public routes without guard protection */}
              <Route path="/unauthorized" element={<UnauthorizedPage />} />
              <Route path="/404" element={<NotFoundPage />} />
              
              {/* Protected routes with nested structure */}
              <Route path="/courses" element={<ProtectedRoutes />}>
                <Route index element={<MyCoursesPage />} />
                <Route path=":courseId" element={<CourseDetailsPage />} />
                <Route path=":courseId/modules/:moduleId" element={<CourseDetailsPage />} />
                <Route path=":courseId/modules/:moduleId/topics/:topicId" element={<CourseDetailsPage />} />
                <Route path=":courseId/modules/:moduleId/topics/:topicId/videos/:videoId" element={<VideoPlayerPage />} />
              </Route>
              
              {/* Catch all for unmatched routes */}
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </React.Suspense>
          
          {/* React Query Devtools */}
          {process.env.NODE_ENV === 'development' && (
            <ReactQueryDevtools initialIsOpen={false} position="bottom" />
          )}
        </AuthProvider>
      </QueryClientProvider>
    </BrowserRouter>
  );
};

export default AppRouter;
