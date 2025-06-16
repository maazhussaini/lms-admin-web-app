import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { UserType } from '@shared/types/api.types';
import { 
  UserTypeGuards, 
  SecurityValidators,
  SecurityManager,
  RouteProtection
} from '@/utils/securityUtils';
import { 
  getAllowedUserTypes, 
  getRoutePermissions,
  isPublicRoute,
  routeRequiresAuth
} from '@/config/routeConfig';

/**
 * Properties for the AuthGuard component
 */
interface AuthGuardProps {
  requiredPermissions?: string[];
  allowedUserTypes?: UserType[];
  requiresAuth?: boolean;
}

/**
 * Enhanced guard for protected routes with comprehensive security checks
 */
export const AuthGuard: React.FC<AuthGuardProps> = ({ 
  requiredPermissions = [], 
  allowedUserTypes = [],
  requiresAuth = true 
}) => {
  const { isAuthenticated, isLoading, permissions, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [securityCheck, setSecurityCheck] = useState<'pending' | 'passed' | 'failed'>('pending');

  useEffect(() => {
    const performSecurityCheck = async () => {
      // Only check after loading is complete
      if (isLoading) {
        return;
      }

      try {
        const currentPath = location.pathname;
        const securityManager = SecurityManager.getInstance();
        
        // Get route-specific security configuration
        const isPublic = isPublicRoute(currentPath);
        const needsAuth = routeRequiresAuth(currentPath);
        const routeAllowedTypes = getAllowedUserTypes(currentPath);
        const routeRequiredPermissions = getRoutePermissions(currentPath);

        // Merge props with route config (props take precedence)
        const finalRequiredPermissions = requiredPermissions.length > 0 
          ? requiredPermissions 
          : routeRequiredPermissions;
        const finalAllowedUserTypes = allowedUserTypes.length > 0 
          ? allowedUserTypes 
          : routeAllowedTypes;
        const finalRequiresAuth = requiresAuth !== undefined 
          ? requiresAuth 
          : needsAuth;

        // Public routes - allow access
        if (isPublic) {
          setSecurityCheck('passed');
          return;
        }

        // Authentication check
        if (finalRequiresAuth && !isAuthenticated) {
          navigate('/login', { 
            replace: true, 
            state: { returnUrl: currentPath + location.search } 
          });
          setSecurityCheck('failed');
          return;
        }

        // User type validation
        if (isAuthenticated && user) {
          // Verify user is a student (this is student frontend)
          if (!UserTypeGuards.isStudent(user.user_type)) {
            console.error('Non-student user attempted to access student portal:', {
              userType: user.user_type,
              userId: user.id,
              path: currentPath
            });
            navigate('/unauthorized', { replace: true });
            setSecurityCheck('failed');
            return;
          }

          // Update security context
          securityManager.setSecurityContext({
            userType: user.user_type,
            userId: user.id,
            tenantId: user.tenant_id,
            sessionId: `session_${user.id}_${Date.now()}`,
            lastActivity: new Date()
          });

          // Check allowed user types if specified
          if (finalAllowedUserTypes.length > 0) {
            if (!SecurityValidators.isUserTypeAllowed(user.user_type, finalAllowedUserTypes)) {
              console.warn('User type not allowed for route:', {
                userType: user.user_type,
                allowedTypes: finalAllowedUserTypes,
                path: currentPath
              });
              navigate('/unauthorized', { replace: true });
              setSecurityCheck('failed');
              return;
            }
          }

          // Check required permissions
          if (finalRequiredPermissions.length > 0) {
            if (!SecurityValidators.hasPermission(permissions, finalRequiredPermissions)) {
              console.warn('Insufficient permissions for route:', {
                userPermissions: permissions,
                requiredPermissions: finalRequiredPermissions,
                path: currentPath
              });
              navigate('/unauthorized', { replace: true });
              setSecurityCheck('failed');
              return;
            }
          }

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
        }

        setSecurityCheck('passed');
      } catch (error) {
        console.error('Security check failed:', error);
        setSecurityCheck('failed');
        
        // Redirect based on error type
        const redirectPath = RouteProtection.getUnauthorizedRedirectPath(user?.user_type || null);
        navigate(redirectPath, { replace: true });
      }
    };

    performSecurityCheck();
  }, [
    isAuthenticated, 
    isLoading, 
    navigate, 
    location, 
    permissions, 
    requiredPermissions, 
    allowedUserTypes, 
    requiresAuth,
    user
  ]);

  // Show loading while security check is pending
  if (isLoading || securityCheck === 'pending') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Verifying access...</p>
        </div>
      </div>
    );
  }

  // Security check failed - this should not render as useEffect handles redirect
  if (securityCheck === 'failed') {
    return null;
  }

  // Security check passed - render protected content
  return <Outlet />;
};

/**
 * Enhanced guard for public routes - redirects to dashboard if already authenticated as student
 */
export const PublicOnlyGuard: React.FC = () => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!isLoading && isAuthenticated && user) {
      // Verify this is a student user
      if (UserTypeGuards.isStudent(user.user_type)) {
        // Get the return URL from location state or default to dashboard
        const state = location.state as { returnUrl?: string } | undefined;
        const returnUrl = state?.returnUrl || '/dashboard';
        navigate(returnUrl, { replace: true });
      } else {
        // Non-student users should not be here
        console.warn('Non-student user in student portal:', user.user_type);
        navigate('/unauthorized', { replace: true });
      }
    }
  }, [isAuthenticated, isLoading, navigate, location, user]);

  // Show loading while authentication check is in progress
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Only render for non-authenticated users
  if (!isAuthenticated) {
    return <Outlet />;
  }

  // This should not actually render as the useEffect will redirect
  return null;
};

/**
 * Enhanced layout guard - ensures consistent layout for protected routes with security context
 */
export const LayoutGuard: React.FC<{ 
  layout: React.ComponentType<{ children: React.ReactNode }> 
}> = ({ layout: Layout }) => {
  const { isAuthenticated, isLoading, user } = useAuth();

  useEffect(() => {
    // Initialize session monitoring for authenticated users
    if (isAuthenticated && user && UserTypeGuards.isStudent(user.user_type)) {
      // Update security context
      const securityManager = SecurityManager.getInstance();
      securityManager.setSecurityContext({
        userType: user.user_type,
        userId: user.id,
        tenantId: user.tenant_id,
        sessionId: `session_${user.id}_${Date.now()}`,
        lastActivity: new Date()
      });
    }
  }, [isAuthenticated, user]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Render the layout with child routes for authenticated students
  if (isAuthenticated && user && UserTypeGuards.isStudent(user.user_type)) {
    return (
      <Layout>
        <Outlet />
      </Layout>
    );
  }

  return null;
};

/**
 * Student-only guard - strict validation for student-specific routes
 */
export const StudentOnlyGuard: React.FC<AuthGuardProps> = (props) => {
  return (
    <AuthGuard
      {...props}
      allowedUserTypes={[UserType.STUDENT]}
      requiresAuth={true}
    />
  );
};

/**
 * Permission-based guard - validates specific permissions
 */
export const PermissionGuard: React.FC<{ permissions: string[] }> = ({ permissions }) => {
  return (
    <AuthGuard
      requiredPermissions={permissions}
      allowedUserTypes={[UserType.STUDENT]}
      requiresAuth={true}
    />
  );
};
