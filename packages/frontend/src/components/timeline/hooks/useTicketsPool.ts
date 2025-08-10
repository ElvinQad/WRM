import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FrontendTicket } from '@wrm/types';
import { addTicketToPool, removeTicketFromPool, reorderPoolTickets } from '../../../store/slices/timelineSlice.ts';
import { moveTicketToPoolAsync, scheduleTicketFromPoolAsync, reorderTicketInPoolAsync } from '../../../store/thunks/ticketThunks.ts';
import type { RootState, AppDispatch } from '../../../store/index.ts';

/**
 * Hook for managing tickets pool operations
 * Handles FIFO queue operations and ticket movement between timeline and pool
 */
export function useTicketsPool() {
  const dispatch = useDispatch() as AppDispatch;
  const poolTickets = useSelector((state: RootState) => state.timeline.poolTickets);
  const poolExpanded = useSelector((state: RootState) => state.timeline.poolExpanded);

  // Move ticket from timeline to pool (persistent backend operation)
  const moveTicketToPool = useCallback(async (ticket: FrontendTicket) => {
    // Optimistically update local state first
    dispatch(addTicketToPool(ticket));
    
    try {
      // Persist to backend - this will update the main tickets array via the thunk
      await dispatch(moveTicketToPoolAsync(ticket.id)).unwrap();
    } catch (error) {
      // Rollback optimistic update on failure
      dispatch(removeTicketFromPool(ticket.id));
      console.error('Failed to move ticket to pool:', error);
      throw error;
    }
  }, [dispatch]);

  // Schedule ticket from pool (returns to current time, persistent backend operation)
  const scheduleTicketFromPool = useCallback(async (ticket: FrontendTicket, duration = 3600000) => {
    // Optimistically remove from pool first  
    dispatch(removeTicketFromPool(ticket.id));
    
    try {
      // Persist to backend with current time - this will update the main tickets array via the thunk
      await dispatch(scheduleTicketFromPoolAsync({ ticketId: ticket.id, duration })).unwrap();
    } catch (error) {
      // Rollback optimistic update on failure
      dispatch(addTicketToPool(ticket));
      console.error('Failed to schedule ticket from pool:', error);
      throw error;
    }
  }, [dispatch]);

  // Reorder tickets within pool for priority management (persistent backend operation)
  const reorderPoolTicket = useCallback(async (ticketId: string, newPosition: number) => {
    // Optimistically update local state first
    dispatch(reorderPoolTickets({ ticketId, newPosition }));
    
    try {
      // Persist to backend - this will update the main tickets array via the thunk
      await dispatch(reorderTicketInPoolAsync({ ticketId, newPosition })).unwrap();
    } catch (error) {
      // Note: For reordering, it's complex to rollback so we'll let the next fetch fix it
      console.error('Failed to reorder ticket in pool:', error);
      throw error;
    }
  }, [dispatch]);

  // Check if a ticket is currently in the pool
  const isTicketInPool = useCallback((ticketId: string) => {
    return poolTickets.some(ticket => ticket.id === ticketId);
  }, [poolTickets]);

  return {
    // State
    poolTickets,
    poolExpanded,
    
    // Actions
    moveTicketToPool,
    scheduleTicketFromPool,
    reorderPoolTicket,
    isTicketInPool,
    
    // Computed
    isPoolEmpty: poolTickets.length === 0,
    nextTicketToSchedule: poolTickets.length > 0 ? poolTickets[0] : null,
    poolCount: poolTickets.length,
  };
}
