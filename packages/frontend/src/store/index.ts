// Store exports
export { store } from './store.ts';
export type { RootState, AppDispatch } from './store.ts';

// Hooks
export { useAppDispatch, useAppSelector } from './hooks.ts';

// Provider
export { ReduxProvider } from './ReduxProvider.tsx';

// Action creators
export {
  setTickets,
  addTicket,
  updateTicket,
  deleteTicket,
  setSelectedTicket,
} from './slices/ticketsSlice.ts';

export {
  setModalOpen,
  setCoords,
} from './slices/appSlice.ts';

export { setSunTimes } from './slices/sunTimesSlice.ts';

// State interfaces
export type { TicketsState } from './slices/ticketsSlice.ts';
export type { AppState } from './slices/appSlice.ts';
export type { SunTimesState } from './slices/sunTimesSlice.ts';
