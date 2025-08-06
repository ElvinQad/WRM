import { createAsyncThunk } from '@reduxjs/toolkit';
import { TicketType } from '@wrm/types';
import { apiClient } from '../../lib/api.ts';
import { CustomFieldDefinition } from '../../components/tickets/CustomPropertyForm.tsx';

export interface CreateTicketTypeRequest {
  name: string;
  color?: string;
  customFieldSchema?: CustomFieldDefinition[];
}

export interface UpdateTicketTypeRequest {
  name?: string;
  color?: string;
  customFieldSchema?: CustomFieldDefinition[];
}

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

export const createTicketType = createAsyncThunk<TicketType, CreateTicketTypeRequest, { rejectValue: string }>(
  'ticketTypes/createTicketType',
  async (createRequest, { rejectWithValue }) => {
    try {
      const ticketType = await apiClient.createTicketType(createRequest);
      return ticketType as TicketType;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create ticket type';
      return rejectWithValue(errorMessage);
    }
  }
);

export const updateTicketType = createAsyncThunk<TicketType, { id: string } & UpdateTicketTypeRequest, { rejectValue: string }>(
  'ticketTypes/updateTicketType',
  async ({ id, ...updateRequest }, { rejectWithValue }) => {
    try {
      const ticketType = await apiClient.updateTicketType(id, updateRequest);
      return ticketType as TicketType;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update ticket type';
      return rejectWithValue(errorMessage);
    }
  }
);
