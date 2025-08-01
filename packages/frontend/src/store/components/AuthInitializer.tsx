'use client';

import { useEffect } from 'react';
import { useAuth } from '../../hooks/use-auth.ts';

// Component to initialize auth on app startup
export function AuthInitializer() {
  const { isAuthenticated, accessToken, getProfile } = useAuth();

  useEffect(() => {
    // If we have a token but no user data, attempt to get profile
    if (accessToken && isAuthenticated) {
      getProfile().catch((error) => {
        console.warn('Failed to fetch user profile on startup:', error);
      });
    }
  }, [accessToken, isAuthenticated, getProfile]);

  return null;
}
