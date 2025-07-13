import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Ticket } from '../../components/timeline/types';

export interface TicketsState {
  tickets: Ticket[];
  selectedTicket: Ticket | null;
}

const initialState: TicketsState = {
  tickets: [],
  selectedTicket: null,
};

const ticketsSlice = createSlice({
  name: 'tickets',
  initialState,
  reducers: {
    setTickets: (state, action: PayloadAction<Ticket[]>) => {
      state.tickets = action.payload;
    },
    addTicket: (state, action: PayloadAction<Ticket>) => {
      state.tickets.push(action.payload);
    },
    updateTicket: (state, action: PayloadAction<Ticket>) => {
      const index = state.tickets.findIndex(ticket => ticket.id === action.payload.id);
      if (index !== -1) {
        state.tickets[index] = action.payload;
      }
    },
    deleteTicket: (state, action: PayloadAction<string>) => {
      state.tickets = state.tickets.filter(ticket => ticket.id !== action.payload);
      // Clear selected ticket if it was deleted
      if (state.selectedTicket?.id === action.payload) {
        state.selectedTicket = null;
      }
    },
    setSelectedTicket: (state, action: PayloadAction<Ticket | null>) => {
      state.selectedTicket = action.payload;
    },
  },
});

export const { 
  setTickets, 
  addTicket, 
  updateTicket, 
  deleteTicket, 
  setSelectedTicket 
} = ticketsSlice.actions;

export default ticketsSlice.reducer;
