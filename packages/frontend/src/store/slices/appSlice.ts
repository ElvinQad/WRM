import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface AppState {
  isModalOpen: boolean;
  useInfiniteTickets: boolean;
  coords: { lat: number; lng: number } | null;
}

const initialState: AppState = {
  isModalOpen: false,
  useInfiniteTickets: true,
  coords: null,
};

const appSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    setModalOpen: (state, action: PayloadAction<boolean>) => {
      state.isModalOpen = action.payload;
    },
    setUseInfiniteTickets: (state, action: PayloadAction<boolean>) => {
      state.useInfiniteTickets = action.payload;
    },
    setCoords: (state, action: PayloadAction<{ lat: number; lng: number } | null>) => {
      state.coords = action.payload;
    },
  },
});

export const { 
  setModalOpen, 
  setUseInfiniteTickets, 
  setCoords 
} = appSlice.actions;

export default appSlice.reducer;
