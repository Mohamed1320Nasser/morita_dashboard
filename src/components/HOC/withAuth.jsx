import { useEffect } from 'react';
import { useRouter } from 'next/router';
import authService from '@/controllers/login/authService';
import Loading from '@/components/atoms/loading';

/**
 * Higher Order Component for protecting routes with authentication
 * Usage: export default withAuth(YourComponent)
 *
 * @param {React.Component} Component - The component to protect
 * @param {Object} options - Configuration options
 * @param {string[]} options.allowedRoles - Array of allowed roles (e.g., ['admin'])
 * @param {string} options.redirectTo - Where to redirect if unauthorized (default: '/login')
 */
const withAuth = (Component, options = {}) => {
  const {
    allowedRoles = null, // null means any authenticated user
    redirectTo = '/login'
  } = options;

  return function AuthenticatedComponent(props) {
    const router = useRouter();
    const isAuthorized = authService.checkIfAuthorized();
    const user = authService.getUser();

    useEffect(() => {
      // Check if user is authenticated
      if (!isAuthorized) {
        console.log('[withAuth] User not authenticated, redirecting to login');
        router.replace(redirectTo);
        return;
      }

      // Check if user has required role
      if (allowedRoles && allowedRoles.length > 0) {
        const userRole = user?.role;
        if (!userRole || !allowedRoles.includes(userRole)) {
          console.log(`[withAuth] User role "${userRole}" not authorized. Required: ${allowedRoles.join(', ')}`);
          router.replace('/unauthorized');
          return;
        }
      }
    }, [isAuthorized, user, router]);

    // Show loading while checking auth
    if (!isAuthorized) {
      return <Loading />;
    }

    // Check role authorization
    if (allowedRoles && allowedRoles.length > 0) {
      const userRole = user?.role;
      if (!userRole || !allowedRoles.includes(userRole)) {
        return <Loading />;
      }
    }

    // User is authorized, render the component
    return <Component {...props} />;
  };
};

export default withAuth;
