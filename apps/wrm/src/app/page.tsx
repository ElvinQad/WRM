"use client";

import { Timeline, type Ticket } from "../components/timeline/Timeline";
import { TicketDetailModal } from "../components/tickets/TicketDetailModal";
import { useState, useEffect, useCallback } from "react";
import SunCalc from "suncalc";
import { generateSampleTickets } from "../components/timeline/sampleData";

export default function Index() {
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [sunTimes, setSunTimes] = useState<{ sunrise: Date; sunset: Date; nextSunrise: Date } | null>(null);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [useInfiniteTickets, setUseInfiniteTickets] = useState(true); // Default to infinite tickets

  // Initialize sample tickets (only when not using infinite tickets)
  useEffect(() => {
    if (!useInfiniteTickets) {
      setTickets(generateSampleTickets());
    }
  }, [useInfiniteTickets]);

  // Get user location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        },
        () => {
          setCoords({ lat: 0, lng: 0 });
        }
      );
    } else {
      setCoords({ lat: 0, lng: 0 });
    }
  }, []);

  // Calculate sun times
  useEffect(() => {
    if (coords) {
      const today = new Date();
      const times = SunCalc.getTimes(today, coords.lat, coords.lng);
      const nextDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
      const nextTimes = SunCalc.getTimes(nextDay, coords.lat, coords.lng);
      setSunTimes({ sunrise: times.sunrise, sunset: times.sunset, nextSunrise: nextTimes.sunrise });
    }
  }, [coords]);

  // Handle ticket updates
  const handleTicketUpdate = useCallback((updatedTicket: Ticket) => {
    setTickets(prev => prev.map(ticket => 
      ticket.id === updatedTicket.id ? updatedTicket : ticket
    ));
  }, []);

  // Handle ticket click
  const handleTicketClick = useCallback((ticket: Ticket) => {
    setSelectedTicket(ticket);
    setIsModalOpen(true);
  }, []);

  // Handle ticket deletion
  const handleTicketDelete = useCallback((ticketId: string) => {
    setTickets(prev => prev.filter(ticket => ticket.id !== ticketId));
    setIsModalOpen(false);
    setSelectedTicket(null);
  }, []);

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
    
    setTickets(prev => [...prev, newTicket]);
    setSelectedTicket(newTicket);
    setIsModalOpen(true);
  }, []);

  return (
    <div className="flex flex-col h-full w-full">
      <header className="p-4 border-b flex bg-white shadow-sm flex-shrink-0">
        <div className="flex items-center space-x-4">
          <button
            onClick={handleAddTicket}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
          >
            Add Ticket
          </button>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={useInfiniteTickets}
              onChange={(e) => setUseInfiniteTickets(e.target.checked)}
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
          setIsModalOpen(false);
          setSelectedTicket(null);
        }}
        onUpdate={handleTicketUpdate}
        onDelete={handleTicketDelete}
      />
    </div>
  );
}
