// Token refresh utility to handle automatic token renewal
import { store } from '../store/store.ts';
import { refreshToken, clearAuth } from '../store/slices/authSlice.ts';

let refreshInterval: number | null = null;
let lastRefreshAttempt = 0;
const REFRESH_COOLDOWN = 30000; // 30 seconds

// Helper function to check if token should be refreshed
function shouldRefreshToken(token: string): boolean {
  try {
    // Basic JWT token expiration check
    const payload = JSON.parse(atob(token.split('.')[1]));
    const currentTime = Date.now() / 1000;
    const timeUntilExpiry = payload.exp - currentTime;
    
    // Refresh if token expires in less than 5 minutes
    return timeUntilExpiry < 300;
  } catch {
    // If we can't parse the token, assume it needs refresh
    return true;
  }
}

// Setup automatic token refresh checking
export const startTokenRefreshTimer = () => {
  if (refreshInterval) {
    clearInterval(refreshInterval);
  }
  
  // Check token every minute
  refreshInterval = setInterval(async () => {
    const state = store.getState();
    
    if (!state.auth.isAuthenticated || !state.auth.accessToken || state.auth.isLoading) {
      return;
    }

    if (shouldRefreshToken(state.auth.accessToken)) {
      const now = Date.now();
      if (now - lastRefreshAttempt > REFRESH_COOLDOWN) {
        lastRefreshAttempt = now;
        try {
          await store.dispatch(refreshToken()).unwrap();
        } catch (error) {
          console.error('Token refresh failed:', error);
          store.dispatch(clearAuth());
        }
      }
    }
  }, 60000); // Check every minute
};

// Stop the token refresh timer
export const stopTokenRefreshTimer = () => {
  if (refreshInterval) {
    clearInterval(refreshInterval);
    refreshInterval = null;
  }
};

// Manual token refresh with error handling
export const attemptTokenRefresh = async (): Promise<boolean> => {
  const state = store.getState();
  
  if (!state.auth.refreshToken || !state.auth.isAuthenticated) {
    store.dispatch(clearAuth());
    return false;
  }

  const now = Date.now();
  if (now - lastRefreshAttempt < REFRESH_COOLDOWN) {
    return false; // Too soon to retry
  }

  lastRefreshAttempt = now;
  try {
    await store.dispatch(refreshToken()).unwrap();
    return true;
  } catch (error) {
    console.error('Token refresh failed:', error);
    store.dispatch(clearAuth());
    return false;
  }
};
