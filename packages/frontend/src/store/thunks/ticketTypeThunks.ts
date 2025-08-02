import { createAsyncThunk } from '@reduxjs/toolkit';
import { apiClient } from '../../lib/api.ts';
import { TicketType } from '../slices/ticketTypesSlice.ts';

export const fetchTicketTypes = createAsyncThunk<TicketType[], void, { rejectValue: string }>(
  'ticketTypes/fetchTicketTypes',
  async (_, { rejectWithValue }) => {
    try {
      const ticketTypes = await apiClient.getTicketTypes();
      return ticketTypes as TicketType[];
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch ticket types';
      return rejectWithValue(errorMessage);
    }
  }
);
