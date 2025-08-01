'use client';

import { useEffect } from 'react';
import { useAppSelector } from '../hooks.ts';
import { selectAccessToken } from '../slices/authSlice.ts';
import { apiClient } from '../../lib/api.ts';

// Component to initialize API client with Redux token
export function ApiClientInitializer() {
  const accessToken = useAppSelector(selectAccessToken);

  useEffect(() => {
    // Update API client with current token
    apiClient.setTokenGetter(() => accessToken);
  }, [accessToken]);

  return null;
}
