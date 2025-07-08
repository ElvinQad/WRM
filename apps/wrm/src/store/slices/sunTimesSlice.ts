import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface SunTimesState {
  times: { sunrise: Date; sunset: Date; nextSunrise: Date } | null;
}

const initialState: SunTimesState = {
  times: null,
};

const sunTimesSlice = createSlice({
  name: 'sunTimes',
  initialState,
  reducers: {
    setSunTimes: (state, action: PayloadAction<{ sunrise: Date; sunset: Date; nextSunrise: Date } | null>) => {
      state.times = action.payload;
    },
  },
});

export const { setSunTimes } = sunTimesSlice.actions;

export default sunTimesSlice.reducer;
