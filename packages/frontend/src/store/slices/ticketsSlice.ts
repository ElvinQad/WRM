import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { FrontendTicket } from '@wrm/types';
import { fetchTickets, createTicketAsync, updateTicketAsync, deleteTicketAsync, moveTicketToPoolAsync, scheduleTicketFromPoolAsync, reorderTicketInPoolAsync } from '../thunks/ticketThunks.ts';

// Type for error payload from async thunks
interface AsyncThunkError {
  message: string;
  status: number;
}

export interface TicketsState {
  tickets: FrontendTicket[];
  selectedTicket: FrontendTicket | null;
  loading: boolean;
  error: string | null;
}

const initialState: TicketsState = {
  tickets: [],
  selectedTicket: null,
  loading: false,
  error: null,
};

const ticketsSlice = createSlice({
  name: 'tickets',
  initialState,
  reducers: {
    setTickets: (state, action: PayloadAction<FrontendTicket[]>) => {
      state.tickets = action.payload;
    },
    addTicket: (state, action: PayloadAction<FrontendTicket>) => {
      state.tickets.push(action.payload);
    },
    updateTicket: (state, action: PayloadAction<FrontendTicket>) => {
      const index = state.tickets.findIndex((ticket: FrontendTicket) => ticket.id === action.payload.id);
      if (index !== -1) {
        state.tickets[index] = action.payload;
      }
    },
    deleteTicket: (state, action: PayloadAction<string>) => {
      state.tickets = state.tickets.filter((ticket: FrontendTicket) => ticket.id !== action.payload);
      // Clear selected ticket if it was deleted
      if (state.selectedTicket?.id === action.payload) {
        state.selectedTicket = null;
      }
    },
    setSelectedTicket: (state, action: PayloadAction<FrontendTicket | null>) => {
      state.selectedTicket = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch tickets
    builder
      .addCase(fetchTickets.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTickets.fulfilled, (state, action) => {
        state.loading = false;
        state.tickets = action.payload;
      })
      .addCase(fetchTickets.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as AsyncThunkError)?.message || 'Failed to fetch tickets';
      });

    // Create ticket
    builder
      .addCase(createTicketAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createTicketAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.tickets.push(action.payload);
      })
      .addCase(createTicketAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as AsyncThunkError)?.message || 'Failed to create ticket';
      });

    // Update ticket
    builder
      .addCase(updateTicketAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateTicketAsync.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.tickets.findIndex((ticket: FrontendTicket) => ticket.id === action.payload.id);
        if (index !== -1) {
          state.tickets[index] = action.payload;
        }
        // Update selected ticket if it was updated
        if (state.selectedTicket?.id === action.payload.id) {
          state.selectedTicket = action.payload;
        }
      })
      .addCase(updateTicketAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as AsyncThunkError)?.message || 'Failed to update ticket';
      });

    // Delete ticket
    builder
      .addCase(deleteTicketAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteTicketAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.tickets = state.tickets.filter((ticket: FrontendTicket) => ticket.id !== action.payload);
        // Clear selected ticket if it was deleted
        if (state.selectedTicket?.id === action.payload) {
          state.selectedTicket = null;
        }
      })
      .addCase(deleteTicketAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as AsyncThunkError)?.message || 'Failed to delete ticket';
      });

    // Pool operations for Story 1.5.4 - Tickets Pool
    
    // Move ticket to pool
    builder
      .addCase(moveTicketToPoolAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(moveTicketToPoolAsync.fulfilled, (state, action) => {
        state.loading = false;
        // Update ticket in main tickets array
        const index = state.tickets.findIndex(t => t.id === action.payload.id);
        if (index !== -1) {
          state.tickets[index] = action.payload;
        }
        // Update selected ticket if it matches
        if (state.selectedTicket?.id === action.payload.id) {
          state.selectedTicket = action.payload;
        }
      })
      .addCase(moveTicketToPoolAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as AsyncThunkError)?.message || 'Failed to move ticket to pool';
      });

    // Schedule ticket from pool
    builder
      .addCase(scheduleTicketFromPoolAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(scheduleTicketFromPoolAsync.fulfilled, (state, action) => {
        state.loading = false;
        // Update ticket in main tickets array
        const index = state.tickets.findIndex(t => t.id === action.payload.id);
        if (index !== -1) {
          state.tickets[index] = action.payload;
        }
        // Update selected ticket if it matches
        if (state.selectedTicket?.id === action.payload.id) {
          state.selectedTicket = action.payload;
        }
      })
      .addCase(scheduleTicketFromPoolAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as AsyncThunkError)?.message || 'Failed to schedule ticket from pool';
      });

    // Reorder ticket in pool
    builder
      .addCase(reorderTicketInPoolAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(reorderTicketInPoolAsync.fulfilled, (state, action) => {
        state.loading = false;
        // Update ticket in main tickets array
        const index = state.tickets.findIndex(t => t.id === action.payload.id);
        if (index !== -1) {
          state.tickets[index] = action.payload;
        }
        // Update selected ticket if it matches
        if (state.selectedTicket?.id === action.payload.id) {
          state.selectedTicket = action.payload;
        }
      })
      .addCase(reorderTicketInPoolAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as AsyncThunkError)?.message || 'Failed to reorder ticket in pool';
      });
  },
});

export const { 
  setTickets, 
  addTicket, 
  updateTicket, 
  deleteTicket, 
  setSelectedTicket,
  clearError
} = ticketsSlice.actions;

export default ticketsSlice.reducer;
