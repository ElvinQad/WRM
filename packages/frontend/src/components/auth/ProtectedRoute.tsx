import React, { useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '../../hooks/use-auth.ts';
import { getReturnUrl } from '../../utils/auth-helpers.ts';

interface ProtectedRouteProps {
  children: React.ReactNode;
  redirectTo?: string;
  requireAuth?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  redirectTo = '/auth?mode=signin',
  requireAuth = true
}: ProtectedRouteProps) => {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const hasRedirected = useRef(false);

  useEffect(() => {
    // Prevent multiple redirects
    if (hasRedirected.current || isLoading) return;

    // If authentication is required but user is not authenticated
    if (requireAuth && !isAuthenticated) {
      hasRedirected.current = true;
      const currentPath = globalThis.location?.pathname + globalThis.location?.search;
      const returnUrl = encodeURIComponent(currentPath || '/');
      router.push(`${redirectTo}?returnUrl=${returnUrl}`);
      return;
    }

    // If authentication is NOT required but user IS authenticated
    if (!requireAuth && isAuthenticated) {
      hasRedirected.current = true;
      router.push(getReturnUrl(searchParams));
      return;
    }
    
    // Reset redirect flag if we're in a stable state
    hasRedirected.current = false;
  }, [isAuthenticated, isLoading, requireAuth, redirectTo, router, searchParams]);

  // Show loading spinner while determining auth state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // If auth is required but user is not authenticated, don't render children
  // (redirect will happen in useEffect)
  if (requireAuth && !isAuthenticated) {
    return null;
  }

  // If auth is not required but user is authenticated, don't render children
  // (redirect will happen in useEffect)
  if (!requireAuth && isAuthenticated) {
    return null;
  }

  // Render children if auth requirements are met
  return <>{children}</>;
};
