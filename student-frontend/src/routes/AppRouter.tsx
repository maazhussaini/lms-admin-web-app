import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { queryClient } from '@/store/queryClient';
import { AuthProvider } from '@/context/AuthContext';
import { routes } from './routes';
import { Helmet } from 'react-helmet-async';

/**
 * Map route configuration to React Router elements
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
            <div className="app-loading">
              <div className="loading-spinner" />
            </div>
          }>
            <Routes>
              {/* Default route - redirect to dashboard */}
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              
              {/* Map all routes from configuration */}
              {routes.map((route, index) => {
                const RouteElement = () => {
                  if (route.element) {
                    return route.element;
                  }
                  
                  // Default case for any route without element
                  return <Navigate to="/404" replace />;
                };
                
                return (
                  <Route 
                    key={index}
                    path={route.path} 
                    element={<RouteElement />}
                  >
                    {route.children?.map((childRoute, childIndex) => (
                      <Route
                        key={`${index}-${childIndex}`}
                        path={childRoute.path}
                        element={childRoute.element}
                      >
                        {childRoute.children?.map((grandChild, grandChildIndex) => (
                          <Route
                            key={`${index}-${childIndex}-${grandChildIndex}`}
                            path={grandChild.path}
                            element={grandChild.element}
                          />
                        ))}
                      </Route>
                    ))}
                  </Route>
                );
              })}
            </Routes>
          </React.Suspense>
          
          {/* Show React Query Devtools only in development */}
          {process.env.NODE_ENV === 'development' && (
            <ReactQueryDevtools initialIsOpen={false} position="bottom" />
          )}
        </AuthProvider>
      </QueryClientProvider>
    </BrowserRouter>
  );
};

export default AppRouter;
