import React, { useEffect } from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

/**
 * Properties for the AuthGuard component
 */
interface AuthGuardProps {
  requiredPermissions?: string[];
}

/**
 * Guard for protected routes - redirects to login if not authenticated
 */
export const AuthGuard: React.FC<AuthGuardProps> = ({ requiredPermissions = [] }) => {
  const { isAuthenticated, isLoading, permissions } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Only check after loading is complete
    if (!isLoading) {
      // If not authenticated, redirect to login with return URL
      if (!isAuthenticated) {
        navigate('/login', { 
          replace: true, 
          state: { returnUrl: location.pathname + location.search } 
        });
        return;
      }

      // Check for required permissions if specified
      if (requiredPermissions.length > 0) {
        const hasAllPermissions = requiredPermissions.every(
          permission => permissions.includes(permission)
        );

        if (!hasAllPermissions) {
          navigate('/unauthorized', { replace: true });
          return;
        }
      }
    }
  }, [isAuthenticated, isLoading, navigate, location, permissions, requiredPermissions]);

  // Show nothing while loading to prevent flickering
  if (isLoading) {
    return <div className="page-loading">Loading...</div>;
  }

  // User is authenticated and has necessary permissions
  if (isAuthenticated && (!requiredPermissions.length || 
      requiredPermissions.every(p => permissions.includes(p)))) {
    return <Outlet />;
  }

  // This should not actually render as the useEffect will redirect
  return null;
};

/**
 * Guard for public routes - redirects to dashboard if already authenticated
 */
export const PublicOnlyGuard: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      // Get the return URL from location state or default to dashboard
      const state = location.state as { returnUrl?: string } | undefined;
      const returnUrl = state?.returnUrl || '/dashboard';
      navigate(returnUrl, { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate, location]);

  // Show nothing while loading
  if (isLoading) {
    return <div className="page-loading">Loading...</div>;
  }

  // Only render for non-authenticated users
  if (!isAuthenticated) {
    return <Outlet />;
  }

  // This should not actually render as the useEffect will redirect
  return null;
};

/**
 * Layout guard - ensures consistent layout for protected routes
 */
export const LayoutGuard: React.FC<{ layout: React.ComponentType<{ children: React.ReactNode }> }> = ({ layout: Layout }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <div className="page-loading">Loading...</div>;
  }

  // Render the layout with child routes
  if (isAuthenticated) {
    return (
      <Layout>
        <Outlet />
      </Layout>
    );
  }

  return null;
};
