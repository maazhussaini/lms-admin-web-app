import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { queryClient } from '@/store/queryClient';
import { AuthProvider } from '@/context/AuthContext';
import { Helmet } from 'react-helmet-async';
import { PublicRoutes } from './PublicRoutes';
import { ProtectedRoutes } from './ProtectedRoutes';

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
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              
              {/* Public routes - direct paths only */}
              <Route path="/login" element={<PublicRoutes />} />
              <Route path="/signup" element={<PublicRoutes />} />
              <Route path="/forgot-password" element={<PublicRoutes />} />
              <Route path="/forgot-password/check-email" element={<PublicRoutes />} />
              <Route path="/reset-password" element={<PublicRoutes />} />
              <Route path="/reset-password-success" element={<PublicRoutes />} />
              <Route path="/unauthorized" element={<PublicRoutes />} />
              <Route path="/404" element={<PublicRoutes />} />
              
              {/* All other routes are protected */}
              <Route path="/*" element={<ProtectedRoutes />} />
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
