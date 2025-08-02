import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { apiClient } from '../../lib/api.ts';
import type { RootState } from '../store.ts';

// Auth state interface
export interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  emailVerificationStatus: 'idle' | 'pending' | 'success' | 'error';
  passwordResetStatus: 'idle' | 'pending' | 'success' | 'error';
}

// User interface based on backend auth response
export interface User {
  id: string;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  emailVerified?: boolean;
  createdAt: Date | string;
  updatedAt: Date | string;
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
  // Support camelCase format from current backend
  accessToken?: string;
  refreshToken?: string;
}

// Initial state
const initialState: AuthState = {
  user: null,
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  emailVerificationStatus: 'idle',
  passwordResetStatus: 'idle',
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

export const sendVerificationEmail = createAsyncThunk<
  { message: string },
  void,
  { rejectValue: string }
>(
  'auth/sendVerificationEmail',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.sendVerificationEmail() as { message: string };
      return response;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to send verification email';
      return rejectWithValue(message);
    }
  }
);

export const verifyEmail = createAsyncThunk<
  { message: string },
  string,
  { rejectValue: string }
>(
  'auth/verifyEmail',
  async (token, { rejectWithValue }) => {
    try {
      const response = await apiClient.verifyEmail(token) as { message: string };
      return response;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Email verification failed';
      return rejectWithValue(message);
    }
  }
);

export const requestPasswordReset = createAsyncThunk<
  { message: string },
  string,
  { rejectValue: string }
>(
  'auth/requestPasswordReset',
  async (email, { rejectWithValue }) => {
    try {
      const response = await apiClient.requestPasswordReset(email) as { message: string };
      return response;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to request password reset';
      return rejectWithValue(message);
    }
  }
);

export const resetPassword = createAsyncThunk<
  { message: string },
  { token: string; newPassword: string },
  { rejectValue: string }
>(
  'auth/resetPassword',
  async ({ token, newPassword }, { rejectWithValue }) => {
    try {
      const response = await apiClient.resetPassword(token, newPassword) as { message: string };
      return response;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Password reset failed';
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
        // Handle multiple response formats: nested session, flat snake_case, and camelCase
        state.accessToken = action.payload.session?.access_token || action.payload.access_token || action.payload.accessToken || null;
        state.refreshToken = action.payload.session?.refresh_token || action.payload.refresh_token || action.payload.refreshToken || null;
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
        // Handle multiple response formats: nested session, flat snake_case, and camelCase
        state.accessToken = action.payload.session?.access_token || action.payload.access_token || action.payload.accessToken || null;
        state.refreshToken = action.payload.session?.refresh_token || action.payload.refresh_token || action.payload.refreshToken || null;
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
        // Handle multiple response formats: nested session, flat snake_case, and camelCase
        state.accessToken = action.payload.session?.access_token || action.payload.access_token || action.payload.accessToken || null;
        state.refreshToken = action.payload.session?.refresh_token || action.payload.refresh_token || action.payload.refreshToken || null;
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

    // Send Verification Email
    builder
      .addCase(sendVerificationEmail.pending, (state) => {
        state.emailVerificationStatus = 'pending';
        state.error = null;
      })
      .addCase(sendVerificationEmail.fulfilled, (state) => {
        state.emailVerificationStatus = 'success';
        state.error = null;
      })
      .addCase(sendVerificationEmail.rejected, (state, action) => {
        state.emailVerificationStatus = 'error';
        state.error = action.payload as string;
      });

    // Verify Email
    builder
      .addCase(verifyEmail.pending, (state) => {
        state.emailVerificationStatus = 'pending';
        state.error = null;
      })
      .addCase(verifyEmail.fulfilled, (state) => {
        state.emailVerificationStatus = 'success';
        state.error = null;
        // Update user's email verification status if user exists
        if (state.user) {
          state.user = { ...state.user, emailVerified: true };
        }
      })
      .addCase(verifyEmail.rejected, (state, action) => {
        state.emailVerificationStatus = 'error';
        state.error = action.payload as string;
      });

    // Request Password Reset
    builder
      .addCase(requestPasswordReset.pending, (state) => {
        state.passwordResetStatus = 'pending';
        state.error = null;
      })
      .addCase(requestPasswordReset.fulfilled, (state) => {
        state.passwordResetStatus = 'success';
        state.error = null;
      })
      .addCase(requestPasswordReset.rejected, (state, action) => {
        state.passwordResetStatus = 'error';
        state.error = action.payload as string;
      });

    // Reset Password
    builder
      .addCase(resetPassword.pending, (state) => {
        state.passwordResetStatus = 'pending';
        state.error = null;
      })
      .addCase(resetPassword.fulfilled, (state) => {
        state.passwordResetStatus = 'success';
        state.error = null;
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.passwordResetStatus = 'error';
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
export const selectEmailVerificationStatus = (state: RootState) => state.auth?.emailVerificationStatus || 'idle';
export const selectPasswordResetStatus = (state: RootState) => state.auth?.passwordResetStatus || 'idle';

// Export reducer
export default authSlice.reducer;
