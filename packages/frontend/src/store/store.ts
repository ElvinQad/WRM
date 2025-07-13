import { configureStore } from '@reduxjs/toolkit';
import ticketsReducer from './slices/ticketsSlice';
import appReducer from './slices/appSlice';
import sunTimesReducer from './slices/sunTimesSlice';

export const store = configureStore({
  reducer: {
    tickets: ticketsReducer,
    app: appReducer,
    sunTimes: sunTimesReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types
        ignoredActions: ['sunTimes/setSunTimes'],
        // Ignore these field paths in all actions
        ignoredActionsPaths: [
          'meta.arg', 
          'payload.timestamp',
          'payload.start',
          'payload.end',
          'payload.sunrise',
          'payload.sunset',
          'payload.nextSunrise'
        ],
        // Ignore these paths in the state
        ignoredPaths: [
          'sunTimes.times',
          'tickets.tickets',
          'tickets.selectedTicket'
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
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
