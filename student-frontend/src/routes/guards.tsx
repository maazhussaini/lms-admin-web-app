import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { UserTypeGuards, SecurityManager } from '@/utils/securityUtils';
import { 
  isPublicRoute, 
  getAllowedUserTypes,
  getRoutePermissions 
} from '@/config/routeConfig';

/**
 * Loading component for guard checks
 */
const GuardLoading: React.FC<{ message?: string }> = ({ message = "Loading..." }) => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
      <p className="mt-4 text-gray-600">{message}</p>
    </div>
  </div>
);

/**
 * Enhanced student guard with comprehensive security checks
 * - Handles authentication check  
 * - Validates user is a student
 * - Checks route-specific permissions
 * - Sets up security context
 * - Manages session validation
 */
export const StudentGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading, user, permissions } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [securityCheck, setSecurityCheck] = useState<'pending' | 'passed' | 'failed'>('pending');

  useEffect(() => {
    const performSecurityCheck = async () => {
      if (isLoading) return;

      try {
        const currentPath = location.pathname;
        
        // Check if route is public (shouldn't be for StudentGuard, but safety check)
        if (isPublicRoute(currentPath)) {
          setSecurityCheck('passed');
          return;
        }

        // Authentication check
        if (!isAuthenticated) {
          navigate('/login', { 
            replace: true, 
            state: { returnUrl: currentPath + location.search } 
          });
          setSecurityCheck('failed');
          return;
        }

        // User type validation
        if (!user || !UserTypeGuards.isStudent(user.user_type)) {
          console.warn('Non-student user attempting to access student portal:', user?.user_type);
          navigate('/unauthorized', { replace: true });
          setSecurityCheck('failed');
          return;
        }

        // Route-specific security checks
        const routeAllowedTypes = getAllowedUserTypes(currentPath);
        const routeRequiredPermissions = getRoutePermissions(currentPath);

        // Check allowed user types for this route
        if (routeAllowedTypes.length > 0 && !routeAllowedTypes.includes(user.user_type)) {
          console.warn('User type not allowed for route:', {
            userType: user.user_type,
            allowedTypes: routeAllowedTypes,
            path: currentPath
          });
          navigate('/unauthorized', { replace: true });
          setSecurityCheck('failed');
          return;
        }

        // Check required permissions for this route  
        if (routeRequiredPermissions.length > 0) {
          const hasRequiredPermissions = routeRequiredPermissions.every(
            permission => permissions.includes(permission)
          );
          
          if (!hasRequiredPermissions) {
            console.warn('Insufficient permissions for route:', {
              userPermissions: permissions,
              requiredPermissions: routeRequiredPermissions,
              path: currentPath
            });
            navigate('/unauthorized', { replace: true });
            setSecurityCheck('failed');
            return;
          }
        }

        // Set up security context for authenticated student
        const securityManager = SecurityManager.getInstance();
        securityManager.setSecurityContext({
          userType: user.user_type,
          userId: user.id,
          tenantId: user.tenant_id,
          sessionId: `session_${user.id}_${Date.now()}`,
          lastActivity: new Date()
        });

        // Session validation
        if (!securityManager.validateAndUpdateSession()) {
          console.warn('Session expired or invalid');
          navigate('/login', { 
            replace: true, 
            state: { returnUrl: currentPath + location.search } 
          });
          setSecurityCheck('failed');
          return;
        }

        setSecurityCheck('passed');
      } catch (error) {
        console.error('Security check failed:', error);
        setSecurityCheck('failed');
        navigate('/unauthorized', { replace: true });
      }
    };

    performSecurityCheck();
  }, [isAuthenticated, isLoading, user, permissions, navigate, location]);

  // Show loading while checking authentication
  if (isLoading || securityCheck === 'pending') {
    return <GuardLoading message="Verifying access..." />;
  }

  // Security check failed
  if (securityCheck === 'failed') {
    return null;
  }

  // Render protected content - use children instead of Outlet since we're not using nested routes
  return <>{children}</>;
};

/**
 * Simplified public-only guard that works with render props pattern
 * - Redirects authenticated students to dashboard
 */
export const PublicOnlyGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (isLoading) return;

    if (isAuthenticated && user) {
      if (UserTypeGuards.isStudent(user.user_type)) {
        // Get return URL or default to courses page
        const state = location.state as { returnUrl?: string } | undefined;
        const returnUrl = state?.returnUrl || '/courses';
        navigate(returnUrl, { replace: true });
      } else {
        // Non-student users shouldn't be here
        navigate('/unauthorized', { replace: true });
      }
    }
  }, [isAuthenticated, isLoading, user, navigate, location]);

  // Show loading while checking
  if (isLoading) {
    return <GuardLoading />;
  }

  // Only render for non-authenticated users
  if (!isAuthenticated) {
    return <>{children}</>;
  }

  // Authenticated users will be redirected
  return null;
};
