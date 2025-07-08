"use client";

import { type Ticket, Timeline } from "../components/timeline";
import { TicketDetailModal } from "../components/tickets/TicketDetailModal";
import { Button } from "../components/ui";
import { useEffect, useCallback } from "react";
import SunCalc from "suncalc";
import { generateSampleTickets } from "../components/timeline/sampleData";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { 
  setTickets, 
  addTicket, 
  updateTicket, 
  deleteTicket, 
  setSelectedTicket 
} from "../store/slices/ticketsSlice";
import { 
  setModalOpen, 
  setUseInfiniteTickets, 
  setCoords 
} from "../store/slices/appSlice";
import { setSunTimes } from "../store/slices/sunTimesSlice";

export default function Index() {
  const dispatch = useAppDispatch();
  const { tickets, selectedTicket } = useAppSelector((state) => state.tickets);
  const { isModalOpen, useInfiniteTickets, coords } = useAppSelector((state) => state.app);
  const { times: sunTimes } = useAppSelector((state) => state.sunTimes);
  
  // Initialize sample tickets (only when not using infinite tickets)
  useEffect(() => {
    if (!useInfiniteTickets && tickets.length === 0) {
      dispatch(setTickets(generateSampleTickets()));
    }
  }, [useInfiniteTickets, tickets.length, dispatch]);

  // Get user location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          dispatch(setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude }));
        },
        () => {
          dispatch(setCoords({ lat: 0, lng: 0 }));
        }
      );
    } else {
      dispatch(setCoords({ lat: 0, lng: 0 }));
    }
  }, [dispatch]);

  // Calculate sun times
  useEffect(() => {
    if (coords) {
      const today = new Date();
      const times = SunCalc.getTimes(today, coords.lat, coords.lng);
      const nextDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
      const nextTimes = SunCalc.getTimes(nextDay, coords.lat, coords.lng);
      dispatch(setSunTimes({ sunrise: times.sunrise, sunset: times.sunset, nextSunrise: nextTimes.sunrise }));
    }
  }, [coords, dispatch]);

  // Handle ticket updates
  const handleTicketUpdate = useCallback((updatedTicket: Ticket) => {
    dispatch(updateTicket(updatedTicket));
  }, [dispatch]);

  // Handle ticket click
  const handleTicketClick = useCallback((ticket: Ticket) => {
    dispatch(setSelectedTicket(ticket));
    dispatch(setModalOpen(true));
  }, [dispatch]);

  // Handle ticket deletion
  const handleTicketDelete = useCallback((ticketId: string) => {
    dispatch(deleteTicket(ticketId));
    dispatch(setModalOpen(false));
    dispatch(setSelectedTicket(null));
  }, [dispatch]);

  // Add new ticket
  const handleAddTicket = useCallback(() => {
    const now = new Date();
    const newTicket: Ticket = {
      id: `ticket-${Date.now()}`,
      title: 'New Ticket',
      description: 'Description for new ticket',
      start: now,
      end: new Date(now.getTime() + 60 * 60 * 1000), // 1 hour duration
      color: '#ffffff',
      category: 'Work',
    };
    
    dispatch(addTicket(newTicket));
    dispatch(setSelectedTicket(newTicket));
    dispatch(setModalOpen(true));
  }, [dispatch]);

  return (
    <div className="flex flex-col h-full w-full">
      <header className="p-4 border-b flex bg-white shadow-sm flex-shrink-0">
        <div className="flex items-center space-x-4">
          <Button
            onClick={handleAddTicket}
            variant="primary"
            size="md"
          >
            Add Ticket
          </Button>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={useInfiniteTickets}
              onChange={(e) => dispatch(setUseInfiniteTickets(e.target.checked))}
              className="rounded"
            />
            <span className="text-sm text-gray-700">Infinite Tickets</span>
          </label>
        </div>
      </header>
      
      <div className="flex-1 overflow-hidden">
        <Timeline
          sunTimes={sunTimes}
          tickets={tickets}
          onTicketUpdate={handleTicketUpdate}
          onTicketClick={handleTicketClick}
          useInfiniteTickets={useInfiniteTickets}
        />
      </div>

      <TicketDetailModal
        ticket={selectedTicket}
        isOpen={isModalOpen}
        onClose={() => {
          dispatch(setModalOpen(false));
          dispatch(setSelectedTicket(null));
        }}
        onUpdate={handleTicketUpdate}
        onDelete={handleTicketDelete}
      />
    </div>
  );
}
