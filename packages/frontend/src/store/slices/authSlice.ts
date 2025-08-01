import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { apiClient } from '../../lib/api.ts';

// Auth state interface
export interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

// User interface based on Supabase auth response
export interface User {
  id: string;
  email: string;
  email_confirmed_at?: string;
  last_sign_in_at?: string;
  created_at: string;
  updated_at: string;
}

// Auth response interface from backend
interface AuthResponse {
  user: User;
  session?: {
    access_token: string;
    refresh_token: string;
    expires_in: number;
    token_type: string;
  };
  // For backward compatibility, also support flat structure
  access_token?: string;
  refresh_token?: string;
  expires_in?: number;
  token_type?: string;
}

// Initial state
const initialState: AuthState = {
  user: null,
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

// Async thunks for auth operations
export const signUp = createAsyncThunk<
  AuthResponse,
  { email: string; password: string },
  { rejectValue: string }
>(
  'auth/signUp',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await apiClient.signUp(credentials) as AuthResponse;
      return response;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Sign up failed';
      return rejectWithValue(message);
    }
  }
);

export const signIn = createAsyncThunk<
  AuthResponse,
  { email: string; password: string },
  { rejectValue: string }
>(
  'auth/signIn',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await apiClient.signIn(credentials) as AuthResponse;
      return response;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Sign in failed';
      return rejectWithValue(message);
    }
  }
);

export const signOut = createAsyncThunk<
  void,
  void,
  { rejectValue: string }
>(
  'auth/signOut',
  async (_, { rejectWithValue }) => {
    try {
      await apiClient.signOut();
      return;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Sign out failed';
      return rejectWithValue(message);
    }
  }
);

export const refreshToken = createAsyncThunk<
  AuthResponse,
  void,
  { rejectValue: string }
>(
  'auth/refreshToken',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.refreshToken() as AuthResponse;
      return response;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Token refresh failed';
      return rejectWithValue(message);
    }
  }
);

export const getProfile = createAsyncThunk<
  User,
  void,
  { rejectValue: string }
>(
  'auth/getProfile',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.getProfile() as { user: User };
      return response.user;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to get profile';
      return rejectWithValue(message);
    }
  }
);

// Auth slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setTokens: (state, action: PayloadAction<{ accessToken: string; refreshToken: string }>) => {
      state.accessToken = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken;
      state.isAuthenticated = true;
    },
    clearAuth: (state) => {
      state.user = null;
      state.accessToken = null;
      state.refreshToken = null;
      state.isAuthenticated = false;
      state.error = null;
      state.isLoading = false;
    },
  },
  extraReducers: (builder) => {
    // Sign Up
    builder
      .addCase(signUp.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(signUp.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        // Handle both nested session structure and flat structure
        state.accessToken = action.payload.session?.access_token || action.payload.access_token || null;
        state.refreshToken = action.payload.session?.refresh_token || action.payload.refresh_token || null;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(signUp.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        state.isAuthenticated = false;
      });

    // Sign In
    builder
      .addCase(signIn.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(signIn.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        // Handle both nested session structure and flat structure
        state.accessToken = action.payload.session?.access_token || action.payload.access_token || null;
        state.refreshToken = action.payload.session?.refresh_token || action.payload.refresh_token || null;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(signIn.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        state.isAuthenticated = false;
      });

    // Sign Out
    builder
      .addCase(signOut.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(signOut.fulfilled, (state) => {
        state.user = null;
        state.accessToken = null;
        state.refreshToken = null;
        state.isAuthenticated = false;
        state.isLoading = false;
        state.error = null;
      })
      .addCase(signOut.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        // Still clear auth on error to ensure logout
        state.user = null;
        state.accessToken = null;
        state.refreshToken = null;
        state.isAuthenticated = false;
      });

    // Refresh Token
    builder
      .addCase(refreshToken.pending, (state) => {
        // Don't set loading for refresh to avoid UI flickering
        state.error = null;
      })
      .addCase(refreshToken.fulfilled, (state, action) => {
        // Handle both nested session structure and flat structure
        state.accessToken = action.payload.session?.access_token || action.payload.access_token || null;
        state.refreshToken = action.payload.session?.refresh_token || action.payload.refresh_token || null;
        state.user = action.payload.user;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(refreshToken.rejected, (state, action) => {
        state.error = action.payload as string;
        // Clear auth on refresh failure
        state.user = null;
        state.accessToken = null;
        state.refreshToken = null;
        state.isAuthenticated = false;
      });

    // Get Profile
    builder
      .addCase(getProfile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
        state.error = null;
      })
      .addCase(getProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Handle Redux Persist REHYDRATE action to fix auth state after reload
    // NOTE: addMatcher must come AFTER all addCase calls
    builder.addMatcher(
      (action) => action.type === 'persist/REHYDRATE',
      (state, action: { payload?: { auth?: AuthState } }) => {
        if (action.payload?.auth) {
          const persistedAuth = action.payload.auth;
          // Only consider authenticated if we have both user and token
          if (persistedAuth.user && persistedAuth.accessToken) {
            state.isAuthenticated = true;
            state.user = persistedAuth.user;
            state.accessToken = persistedAuth.accessToken;
            state.refreshToken = persistedAuth.refreshToken;
          } else {
            // Clear invalid auth state
            state.isAuthenticated = false;
            state.user = null;
            state.accessToken = null;
            state.refreshToken = null;
          }
          state.isLoading = false;
        }
      }
    );
  },
});

// Export actions
export const { clearError, setTokens, clearAuth } = authSlice.actions;

// Export selectors - fix to use proper RootState type
export const selectAuth = (state: RootState) => state.auth;
export const selectUser = (state: RootState) => state.auth?.user || null;
// Fix: Make isAuthenticated based on whether we have both user and token
export const selectIsAuthenticated = (state: RootState) => {
  const auth = state.auth;
  return !!(auth?.isAuthenticated && auth?.user && auth?.accessToken);
};
export const selectIsLoading = (state: RootState) => state.auth?.isLoading || false;
export const selectError = (state: RootState) => state.auth?.error || null;
export const selectAccessToken = (state: RootState) => state.auth?.accessToken || null;

// Export reducer
export default authSlice.reducer;
