'use client';

import React from 'react';
import { Provider } from 'react-redux';
import { store } from './store.ts';
import { ApiClientInitializer } from './components/ApiClientInitializer.tsx';
import { AuthInitializer } from './components/AuthInitializer.tsx';

interface ReduxProviderProps {
  children: React.ReactNode;
}

export function ReduxProvider({ children }: ReduxProviderProps) {
  return (
    <Provider store={store}>
      <ApiClientInitializer />
      <AuthInitializer />
      {children}
    </Provider>
  );
}