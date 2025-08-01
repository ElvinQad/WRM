import { createListenerMiddleware } from '@reduxjs/toolkit';
import { refreshToken, clearAuth } from '../slices/authSlice.ts';
import { RootState } from '../store.ts';

export const authListenerMiddleware = createListenerMiddleware();

// Track last refresh attempt to prevent spam
let lastRefreshAttempt = 0;
const REFRESH_COOLDOWN = 60000; // 1 minute

// Add listener for automatic token refresh - only on specific actions
authListenerMiddleware.startListening({
  // Fix: Use predicate instead of actionCreator
  predicate: (action) => {
    // Listen to API calls or user interactions, not auth actions themselves
    const actionType = action.type;
    return (actionType.includes('api/') || actionType.includes('user/')) && 
           !actionType.includes('auth/');
  },
  
  effect: async (action, listenerApi) => {
    const state = listenerApi.getState() as RootState;
    const now = Date.now();
    
    // Prevent spam refreshes
    if (now - lastRefreshAttempt < REFRESH_COOLDOWN) {
      return;
    }
    
    // Only refresh if user is authenticated and has tokens
    if (!state.auth.isAuthenticated || !state.auth.accessToken || state.auth.isLoading) {
      return;
    }

    // Check if we need to refresh
    if (shouldRefreshToken(state.auth.accessToken)) {
      lastRefreshAttempt = now;
      try {
        await listenerApi.dispatch(refreshToken()).unwrap();
      } catch (error) {
        // If refresh fails, clear auth
        listenerApi.dispatch(clearAuth());
      }
    }
  },
});

// Helper function to check if token should be refreshed
function shouldRefreshToken(token: string): boolean {
  try {
    // Basic JWT token expiration check
    const payload = JSON.parse(atob(token.split('.')[1]));
    const currentTime = Date.now() / 1000;
    const timeUntilExpiry = payload.exp - currentTime;
    
    // Refresh if token expires in less than 10 minutes
    return timeUntilExpiry < 600;
  } catch {
    // If we can't parse the token, assume it needs refresh
    return true;
  }
}

// API Response interceptor for handling auth errors
export const handleApiAuthError = (error: unknown) => {
  // If we get a 401 or 403, the token is likely invalid
  if (error && typeof error === 'object' && 'status' in error) {
    const status = (error as { status: number }).status;
    if (status === 401 || status === 403) {
      return true; // Indicates auth error
    }
  }
  return false;
};
