import React, { createContext, useContext, useEffect } from 'react';
import { apiClient } from '../lib/api.ts';
import { useAuth } from '../hooks/use-auth.ts';

const ApiClientContext = createContext<typeof apiClient>(apiClient);

export const ApiClientProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { accessToken } = useAuth();

  useEffect(() => {
    // Configure API client to use Redux auth token
    apiClient.setTokenGetter(() => accessToken);
  }, [accessToken]);

  return (
    <ApiClientContext.Provider value={apiClient}>
      {children}
    </ApiClientContext.Provider>
  );
};

export const useApiClient = () => {
  const context = useContext(ApiClientContext);
  if (!context) {
    throw new Error('useApiClient must be used within an ApiClientProvider');
  }
  return context;
};
