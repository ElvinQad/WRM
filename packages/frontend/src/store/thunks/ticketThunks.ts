// API integration thunks for tickets
import { createAsyncThunk } from '@reduxjs/toolkit';
import { apiClient, ApiError } from '../../lib/api.ts';
import { apiTicketToFrontend, frontendTicketToCreateRequest, frontendTicketToUpdateRequest } from '../../lib/ticket-converters.ts';
import { FrontendTicket } from '@wrm/types';

// Fetch all tickets
export const fetchTickets = createAsyncThunk(
  'tickets/fetchTickets',
  async (params: { start?: string; end?: string } = {}, { rejectWithValue }) => {
    try {
      const apiTickets = await apiClient.getTickets(params.start, params.end);
      return apiTickets.map(apiTicketToFrontend);
    } catch (error) {
      if (error instanceof ApiError) {
        return rejectWithValue({ message: error.message, status: error.status });
      }
      return rejectWithValue({ message: 'Failed to fetch tickets', status: 0 });
    }
  }
);

// Create a new ticket
export const createTicketAsync = createAsyncThunk(
  'tickets/createTicket',
  async (ticket: Omit<FrontendTicket, 'id'>, { rejectWithValue }) => {
    try {
      const createRequest = frontendTicketToCreateRequest(ticket);
      const apiTicket = await apiClient.createTicket(createRequest);
      return apiTicketToFrontend(apiTicket);
    } catch (error) {
      if (error instanceof ApiError) {
        return rejectWithValue({ message: error.message, status: error.status });
      }
      return rejectWithValue({ message: 'Failed to create ticket', status: 0 });
    }
  }
);

// Update an existing ticket
export const updateTicketAsync = createAsyncThunk(
  'tickets/updateTicket',
  async (ticket: FrontendTicket, { rejectWithValue }) => {
    try {
      const updateRequest = frontendTicketToUpdateRequest(ticket);
      const apiTicket = await apiClient.updateTicket(ticket.id, updateRequest);
      return apiTicketToFrontend(apiTicket);
    } catch (error) {
      if (error instanceof ApiError) {
        return rejectWithValue({ message: error.message, status: error.status });
      }
      return rejectWithValue({ message: 'Failed to update ticket', status: 0 });
    }
  }
);

// Delete a ticket
export const deleteTicketAsync = createAsyncThunk(
  'tickets/deleteTicket',
  async (ticketId: string, { rejectWithValue }) => {
    try {
      await apiClient.deleteTicket(ticketId);
      return ticketId;
    } catch (error) {
      if (error instanceof ApiError) {
        return rejectWithValue({ message: error.message, status: error.status });
      }
      return rejectWithValue({ message: 'Failed to delete ticket', status: 0 });
    }
  }
);

// Pool operation thunks for Story 1.5.4 - Tickets Pool

// Move ticket to pool
export const moveTicketToPoolAsync = createAsyncThunk(
  'tickets/moveToPool',
  async (ticketId: string, { rejectWithValue }) => {
    try {
      const apiTicket = await apiClient.moveTicketToPool(ticketId);
      return apiTicketToFrontend(apiTicket);
    } catch (error) {
      if (error instanceof ApiError) {
        return rejectWithValue({ message: error.message, status: error.status });
      }
      return rejectWithValue({ message: 'Failed to move ticket to pool', status: 0 });
    }
  }
);

// Schedule ticket from pool (automatically sets to current time)
export const scheduleTicketFromPoolAsync = createAsyncThunk(
  'tickets/scheduleFromPool',
  async ({ ticketId, duration = 3600000 }: { ticketId: string; duration?: number }, { rejectWithValue }) => {
    try {
      const now = new Date();
      const endTime = new Date(now.getTime() + duration); // Default 1 hour duration
      
      const apiTicket = await apiClient.scheduleTicketFromPool(
        ticketId,
        now.toISOString(),
        endTime.toISOString()
      );
      return apiTicketToFrontend(apiTicket);
    } catch (error) {
      if (error instanceof ApiError) {
        return rejectWithValue({ message: error.message, status: error.status });
      }
      return rejectWithValue({ message: 'Failed to schedule ticket from pool', status: 0 });
    }
  }
);

// Reorder ticket in pool
export const reorderTicketInPoolAsync = createAsyncThunk(
  'tickets/reorderInPool',
  async ({ ticketId, newPosition }: { ticketId: string; newPosition: number }, { rejectWithValue }) => {
    try {
      const apiTicket = await apiClient.reorderTicketInPool(ticketId, newPosition);
      return apiTicketToFrontend(apiTicket);
    } catch (error) {
      if (error instanceof ApiError) {
        return rejectWithValue({ message: error.message, status: error.status });
      }
      return rejectWithValue({ message: 'Failed to reorder ticket in pool', status: 0 });
    }
  }
);
