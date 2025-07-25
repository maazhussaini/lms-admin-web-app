import React, { Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { queryClient } from '@/store/queryClient';
import { AuthProvider } from '@/context/AuthContext';
import { Helmet } from 'react-helmet-async';
import { ProtectedRoutes } from './ProtectedRoutes';
import { PublicLayout } from '@/components/layout/PublicLayout';
import { PublicOnlyGuard } from './guards';

// Lazy load page components for better code splitting
const LoginPage = React.lazy(() => import('@/pages/LoginPage/LoginPage'));
const ForgotPasswordPage = React.lazy(() => import('@/pages/ForgotPasswordPage/ForgotPasswordPage'));
const ForgotCheckEmailPage = React.lazy(() => import('@/pages/ForgotCheckEmailPage/ForgotCheckEmailPage'));
const ResetPasswordPage = React.lazy(() => import('@/pages/ResetPasswordPage/ResetPasswordPage'));
const ResetPasswordSuccessPage = React.lazy(() => import('@/pages/ResetPasswordSuccessPage/ResetPasswordSuccessPage'));
const SignUpPage = React.lazy(() => import('@/pages/SignUpPage'));

// Lazy load protected page components with correct import structure
const MyCoursesPage = React.lazy(() => import('@/pages/MyCoursesPage').then(module => ({ default: module.MyCoursesPage })));
const CourseDetailsPage = React.lazy(() => import('@/pages/CourseDetailsPage').then(module => ({ default: module.CourseDetailsPage })));
const VideoPlayerPage = React.lazy(() => import('@/pages/VideoPlayerPage').then(module => ({ default: module.VideoPlayerPage })));

// Loading component for Suspense fallback
const PageLoader: React.FC<{ message?: string }> = ({ message = "Loading..." }) => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
      <p className="text-gray-600 font-medium">{message}</p>
    </div>
  </div>
);

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
          
          <Suspense fallback={<PageLoader message="Loading application..." />}>
            <Routes>
              {/* Default redirect */}
              <Route path="/" element={<Navigate to="/courses" replace />} />
              
              {/* Public routes with proper declarative structure */}
              <Route path="/login" element={
                <PublicOnlyGuard>
                  <PublicLayout title="Login">
                    <Suspense fallback={<PageLoader message="Loading login..." />}>
                      <LoginPage />
                    </Suspense>
                  </PublicLayout>
                </PublicOnlyGuard>
              } />
              <Route path="/signup" element={
                <PublicOnlyGuard>
                  <PublicLayout title="Sign Up">
                    <Suspense fallback={<PageLoader message="Loading sign up..." />}>
                      <SignUpPage />
                    </Suspense>
                  </PublicLayout>
                </PublicOnlyGuard>
              } />
              <Route path="/forgot-password" element={
                <PublicOnlyGuard>
                  <PublicLayout title="Forgot Password">
                    <Suspense fallback={<PageLoader message="Loading forgot password..." />}>
                      <ForgotPasswordPage />
                    </Suspense>
                  </PublicLayout>
                </PublicOnlyGuard>
              } />
              <Route path="/forgot-password/check-email" element={
                <PublicOnlyGuard>
                  <PublicLayout title="Check Email">
                    <Suspense fallback={<PageLoader message="Loading check email..." />}>
                      <ForgotCheckEmailPage />
                    </Suspense>
                  </PublicLayout>
                </PublicOnlyGuard>
              } />
              <Route path="/reset-password" element={
                <PublicOnlyGuard>
                  <PublicLayout title="Reset Password">
                    <Suspense fallback={<PageLoader message="Loading reset password..." />}>
                      <ResetPasswordPage />
                    </Suspense>
                  </PublicLayout>
                </PublicOnlyGuard>
              } />
              <Route path="/reset-password-success" element={
                <PublicOnlyGuard>
                  <PublicLayout title="Password Reset Success">
                    <Suspense fallback={<PageLoader message="Loading success page..." />}>
                      <ResetPasswordSuccessPage />
                    </Suspense>
                  </PublicLayout>
                </PublicOnlyGuard>
              } />
              
              {/* Public routes without guard protection */}
              <Route path="/unauthorized" element={<UnauthorizedPage />} />
              <Route path="/404" element={<NotFoundPage />} />
              
              {/* Protected routes with nested structure */}
              <Route path="/courses" element={<ProtectedRoutes />}>
                <Route index element={
                  <Suspense fallback={<PageLoader message="Loading courses..." />}>
                    <MyCoursesPage />
                  </Suspense>
                } />
                <Route path=":courseId" element={
                  <Suspense fallback={<PageLoader message="Loading course details..." />}>
                    <CourseDetailsPage />
                  </Suspense>
                } />
                <Route path=":courseId/modules/:moduleId" element={
                  <Suspense fallback={<PageLoader message="Loading course details..." />}>
                    <CourseDetailsPage />
                  </Suspense>
                } />
                <Route path=":courseId/modules/:moduleId/topics/:topicId" element={
                  <Suspense fallback={<PageLoader message="Loading course details..." />}>
                    <CourseDetailsPage />
                  </Suspense>
                } />
                <Route path=":courseId/modules/:moduleId/topics/:topicId/videos/:videoId" element={
                  <Suspense fallback={<PageLoader message="Loading video player..." />}>
                    <VideoPlayerPage />
                  </Suspense>
                } />
              </Route>
              
              {/* Catch all for unmatched routes */}
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </Suspense>
          
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
