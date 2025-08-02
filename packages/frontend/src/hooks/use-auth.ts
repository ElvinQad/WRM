import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks.ts';
import {
  signUp as signUpAction,
  signIn as signInAction,
  signOut as signOutAction,
  refreshToken as refreshTokenAction,
  getProfile as getProfileAction,
  sendVerificationEmail as sendVerificationEmailAction,
  verifyEmail as verifyEmailAction,
  requestPasswordReset as requestPasswordResetAction,
  resetPassword as resetPasswordAction,
  clearError as clearErrorAction,
  selectAuth,
  selectUser,
  selectIsAuthenticated,
  selectIsLoading,
  selectError,
  selectEmailVerificationStatus,
  selectPasswordResetStatus,
} from '../store/slices/authSlice.ts';

export const useAuth = () => {
  const dispatch = useAppDispatch();
  const auth = useAppSelector(selectAuth);
  const user = useAppSelector(selectUser);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const isLoading = useAppSelector(selectIsLoading);
  const error = useAppSelector(selectError);
  const emailVerificationStatus = useAppSelector(selectEmailVerificationStatus);
  const passwordResetStatus = useAppSelector(selectPasswordResetStatus);

  const signUp = useCallback(
    async (credentials: { email: string; password: string }) => {
      return await dispatch(signUpAction(credentials)).unwrap();
    },
    [dispatch]
  );

  const signIn = useCallback(
    async (credentials: { email: string; password: string }) => {
      return await dispatch(signInAction(credentials)).unwrap();
    },
    [dispatch]
  );

  const signOut = useCallback(async () => {
    return await dispatch(signOutAction()).unwrap();
  }, [dispatch]);

  const refreshToken = useCallback(async () => {
    return await dispatch(refreshTokenAction()).unwrap();
  }, [dispatch]);

  const getProfile = useCallback(async () => {
    return await dispatch(getProfileAction()).unwrap();
  }, [dispatch]);

  const clearError = useCallback(() => {
    dispatch(clearErrorAction());
  }, [dispatch]);

  const sendVerificationEmail = useCallback(async () => {
    return await dispatch(sendVerificationEmailAction()).unwrap();
  }, [dispatch]);

  const verifyEmail = useCallback(async (token: string) => {
    return await dispatch(verifyEmailAction(token)).unwrap();
  }, [dispatch]);

  const requestPasswordReset = useCallback(async (email: string) => {
    return await dispatch(requestPasswordResetAction(email)).unwrap();
  }, [dispatch]);

  const resetPassword = useCallback(async (token: string, newPassword: string) => {
    return await dispatch(resetPasswordAction({ token, newPassword })).unwrap();
  }, [dispatch]);

  return {
    // State
    auth,
    user,
    isAuthenticated,
    isLoading,
    error,
    emailVerificationStatus,
    passwordResetStatus,
    // Actions
    signUp,
    signIn,
    signOut,
    refreshToken,
    getProfile,
    clearError,
    sendVerificationEmail,
    verifyEmail,
    requestPasswordReset,
    resetPassword,
  };
};
