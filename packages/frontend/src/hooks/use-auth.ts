import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks.ts';
import {
  signUp as signUpAction,
  signIn as signInAction,
  signOut as signOutAction,
  refreshToken as refreshTokenAction,
  getProfile as getProfileAction,
  clearError as clearErrorAction,
  selectAuth,
  selectUser,
  selectIsAuthenticated,
  selectIsLoading,
  selectError,
} from '../store/slices/authSlice.ts';

export const useAuth = () => {
  const dispatch = useAppDispatch();
  const auth = useAppSelector(selectAuth);
  const user = useAppSelector(selectUser);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const isLoading = useAppSelector(selectIsLoading);
  const error = useAppSelector(selectError);

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

  return {
    // State
    auth,
    user,
    isAuthenticated,
    isLoading,
    error,
    // Actions
    signUp,
    signIn,
    signOut,
    refreshToken,
    getProfile,
    clearError,
  };
};
