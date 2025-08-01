import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface AppState {
  isModalOpen: boolean;
  coords: { lat: number; lng: number } | null;
}

const initialState: AppState = {
  isModalOpen: false,
  coords: null,
};

const appSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    setModalOpen: (state, action: PayloadAction<boolean>) => {
      state.isModalOpen = action.payload;
    },
    setCoords: (state, action: PayloadAction<{ lat: number; lng: number } | null>) => {
      state.coords = action.payload;
    },
  },
});

export const { 
  setModalOpen, 
  setCoords 
} = appSlice.actions;

export default appSlice.reducer;
