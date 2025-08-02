import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { TicketType } from '@wrm/types';
import { fetchTicketTypes, createTicketType, updateTicketType } from '../thunks/ticketTypeThunks.ts';

interface TicketTypesState {
  ticketTypes: TicketType[];
  isLoading: boolean;
  error: string | null;
  defaultTypeId: string | null;
}

const initialState: TicketTypesState = {
  ticketTypes: [],
  isLoading: false,
  error: null,
  defaultTypeId: null,
};

const ticketTypesSlice = createSlice({
  name: 'ticketTypes',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTicketTypes.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchTicketTypes.fulfilled, (state, action: PayloadAction<TicketType[]>) => {
        state.isLoading = false;
        state.ticketTypes = action.payload;
        // Set the first ticket type as default if none is set
        if (action.payload.length > 0 && !state.defaultTypeId) {
          state.defaultTypeId = action.payload[0].id;
        }
      })
      .addCase(fetchTicketTypes.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string || 'Failed to fetch ticket types';
      })
      .addCase(createTicketType.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createTicketType.fulfilled, (state, action: PayloadAction<TicketType>) => {
        state.isLoading = false;
        state.ticketTypes.push(action.payload);
        // Set as default if it's the first one
        if (!state.defaultTypeId) {
          state.defaultTypeId = action.payload.id;
        }
      })
      .addCase(createTicketType.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string || 'Failed to create ticket type';
      })
      .addCase(updateTicketType.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateTicketType.fulfilled, (state, action: PayloadAction<TicketType>) => {
        state.isLoading = false;
        const index = state.ticketTypes.findIndex(type => type.id === action.payload.id);
        if (index !== -1) {
          state.ticketTypes[index] = action.payload;
        }
      })
      .addCase(updateTicketType.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string || 'Failed to update ticket type';
      });
  },
});

export const { clearError } = ticketTypesSlice.actions;
export default ticketTypesSlice.reducer;
