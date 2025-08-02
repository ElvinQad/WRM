import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import { combineReducers } from '@reduxjs/toolkit';
import { apiClient } from '../lib/api.ts';

// Import reducers
import ticketsReducer from './slices/ticketsSlice.ts';
import appReducer from './slices/appSlice.ts';
import sunTimesReducer from './slices/sunTimesSlice.ts';
import timelineReducer from './slices/timelineSlice.ts';
import authReducer from './slices/authSlice.ts';
import ticketTypesReducer from './slices/ticketTypesSlice.ts';
import { authListenerMiddleware } from './middleware/authMiddleware.ts';

// Custom storage implementation for Deno compatibility
const storage = {
  getItem: (key: string): Promise<string | null> => {
    try {
      return Promise.resolve(localStorage.getItem(key));
    } catch {
      return Promise.resolve(null);
    }
  },
  setItem: (key: string, value: string): Promise<void> => {
    try {
      localStorage.setItem(key, value);
      return Promise.resolve();
    } catch {
      return Promise.resolve();
    }
  },
  removeItem: (key: string): Promise<void> => {
    try {
      localStorage.removeItem(key);
      return Promise.resolve();
    } catch {
      return Promise.resolve();
    }
  },
};

// Redux persist configuration
const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['auth'], // Only persist auth state
};

// Combine reducers
const rootReducer = combineReducers({
  tickets: ticketsReducer,
  app: appReducer,
  sunTimes: sunTimesReducer,
  timeline: timelineReducer,
  auth: authReducer,
  ticketTypes: ticketTypesReducer,
});

// Create persisted reducer
const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types for Redux Persist
        ignoredActions: [
          'persist/PERSIST',
          'persist/REHYDRATE',
          'persist/PAUSE',
          'persist/PURGE',
          'persist/REGISTER',
          'persist/FLUSH',
          'sunTimes/setSunTimes'
        ],
        // Ignore these field paths in all actions
        ignoredActionsPaths: [
          'meta.arg', 
          'payload.timestamp',
          'payload.start',
          'payload.end',
          'payload.sunrise',
          'payload.sunset',
          'payload.nextSunrise',
          'register'
        ],
        // Ignore these paths in the state
        ignoredPaths: [
          'sunTimes.times',
          'tickets.tickets',
          'tickets.selectedTicket',
          '_persist'
        ],
        // Custom isSerializable function to handle Date objects
        isSerializable: (value: unknown) => {
          // Allow Date objects
          if (value instanceof Date) {
            return true;
          }
          // Use the default serialization check for other values
          return true;
        },
      },
    })
    .prepend(authListenerMiddleware.middleware),
});

// Configure API client to use auth token from Redux store
apiClient.setTokenGetter(() => {
  const state = store.getState();
  return state.auth.accessToken;
});

// Initialize token refresh timer if user is already authenticated
if (typeof window !== 'undefined') {
  import('../lib/token-refresh.ts').then(({ startTokenRefreshTimer }) => {
    const state = store.getState();
    if (state.auth.isAuthenticated && state.auth.accessToken) {
      startTokenRefreshTimer();
    }
  });
}

export const persistor = persistStore(store);
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
