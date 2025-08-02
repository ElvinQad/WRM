import { createListenerMiddleware } from '@reduxjs/toolkit';
import { clearAuth } from '../slices/authSlice.ts';
import { RootState } from '../store.ts';
import { startTokenRefreshTimer, stopTokenRefreshTimer, attemptTokenRefresh } from '../../lib/token-refresh.ts';

export const authListenerMiddleware = createListenerMiddleware();

// Track last refresh attempt to prevent spam
let lastRefreshAttempt = 0;
const REFRESH_COOLDOWN = 30000; // 30 seconds

// Add listener for API response errors
authListenerMiddleware.startListening({
  predicate: (action) => {
    // Listen for any rejected actions that might indicate auth errors
    return action.type.endsWith('/rejected') && !action.type.includes('auth/refreshToken');
  },
  
  effect: async (action, listenerApi) => {
    const state = listenerApi.getState() as RootState;
    
    // Check if this is an auth-related error
    if (action.payload && typeof action.payload === 'string') {
      const errorMessage = action.payload.toLowerCase();
      if (errorMessage.includes('unauthorized') || 
          errorMessage.includes('token') || 
          errorMessage.includes('401')) {
        
        // Try to refresh token if we have one
        if (state.auth.refreshToken && state.auth.isAuthenticated) {
          const now = Date.now();
          if (now - lastRefreshAttempt > REFRESH_COOLDOWN) {
            lastRefreshAttempt = now;
            const refreshSuccess = await attemptTokenRefresh();
            if (!refreshSuccess) {
              // If refresh fails, clear auth
              listenerApi.dispatch(clearAuth());
            }
          }
        } else {
          // No refresh token available, clear auth
          listenerApi.dispatch(clearAuth());
        }
      }
    }
  },
});

// Add listener for successful login to start timer
authListenerMiddleware.startListening({
  predicate: (action) => {
    return action.type === 'auth/signIn/fulfilled' || 
           action.type === 'auth/signUp/fulfilled' ||
           action.type === 'auth/refreshToken/fulfilled';
  },
  
  effect: () => {
    startTokenRefreshTimer();
  },
});

// Add listener for logout to stop timer
authListenerMiddleware.startListening({
  predicate: (action) => {
    return action.type === 'auth/signOut/fulfilled' || 
           action.type === 'auth/clearAuth' ||
           action.type === 'auth/refreshToken/rejected';
  },
  
  effect: () => {
    stopTokenRefreshTimer();
  },
});

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
