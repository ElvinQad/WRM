"use client";

import { Timeline } from "../components/timeline/index.ts";
import { type FrontendTicket as Ticket } from "@wrm/types";
import { TicketDetailModal } from "../components/tickets/TicketDetailModal.tsx";
import { Button } from "../components/ui/index.ts";
import { ProtectedRoute } from "../components/auth/ProtectedRoute.tsx";
import { useEffect, useCallback } from "react";
import SunCalc from "suncalc";
import { useAppDispatch, useAppSelector } from "../store/hooks.ts";
import {
  setSelectedTicket
} from "../store/slices/ticketsSlice.ts";
import {
  setModalOpen,
  setCoords
} from "../store/slices/appSlice.ts";
import { setSunTimes } from "../store/slices/sunTimesSlice.ts";
import { fetchTickets, createTicketAsync, updateTicketAsync, deleteTicketAsync } from "../store/thunks/ticketThunks.ts";
import { getProfile } from "../store/slices/authSlice.ts";

export default function Index() {
  const dispatch = useAppDispatch();
  const { tickets, selectedTicket, error } = useAppSelector((state) => state.tickets);
  const { isModalOpen, coords } = useAppSelector((state) => state.app);
  const { times: sunTimes } = useAppSelector((state) => state.sunTimes);
  const { user, isAuthenticated, accessToken } = useAppSelector((state) => state.auth);
  
  // Load user profile when authenticated but user data is missing
  useEffect(() => {
    if (isAuthenticated && accessToken && !user) {
      dispatch(getProfile());
    }
  }, [isAuthenticated, accessToken, user, dispatch]);
  
  // Load tickets from API on mount
  useEffect(() => {
    dispatch(fetchTickets({}));
  }, [dispatch]);

  // Handle API errors
  useEffect(() => {
    if (error) {
      console.error('Ticket API Error:', error);
    }
  }, [error, tickets.length, dispatch]);

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
    dispatch(updateTicketAsync(updatedTicket));
  }, [dispatch]);

  // Handle ticket click
  const handleTicketClick = useCallback((ticket: Ticket) => {
    dispatch(setSelectedTicket(ticket));
    dispatch(setModalOpen(true));
  }, [dispatch]);

  // Handle ticket deletion
  const handleTicketDelete = useCallback((ticketId: string) => {
    dispatch(deleteTicketAsync(ticketId));
    dispatch(setModalOpen(false));
    dispatch(setSelectedTicket(null));
  }, [dispatch]);

  // Add new ticket
  const handleAddTicket = useCallback(() => {
    if (!user?.id) {
      console.error('User not authenticated');
      return;
    }

    const now = new Date();
    const newTicket: Omit<Ticket, 'id'> = {
      userId: user.id, // ✅ FIXED: Use authenticated user ID
      title: 'New Ticket',
      startTime: now.toISOString(),
      endTime: new Date(now.getTime() + 60 * 60 * 1000).toISOString(), // 1 hour duration
      start: now,
      end: new Date(now.getTime() + 60 * 60 * 1000), // 1 hour duration
      typeId: 'default-type', // ✅ FIXED: Use a default type ID or fetch from backend
      customProperties: {},
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
      color: '#ffffff',
      category: 'Work',
    };
    
    dispatch(createTicketAsync(newTicket)).unwrap().then((createdTicket: Ticket) => {
      dispatch(setSelectedTicket(createdTicket));
      dispatch(setModalOpen(true));
    }).catch((error: { message: string }) => {
      console.error('Failed to create ticket:', error);
    });
  }, [dispatch, user]);

  return (
    <ProtectedRoute>
      {/* Temporary Debug */}
      <div style={{position: 'fixed', top: '10px', right: '10px', background: 'black', color: 'white', padding: '10px', zIndex: 1000, fontSize: '12px'}}>
        Auth: {isAuthenticated ? 'YES' : 'NO'} | User: {user?.email || 'None'} | Token: {accessToken ? 'YES' : 'NO'}
      </div>
      <div className="flex flex-col h-full w-full">
        <header className="p-4 border-b border-border flex bg-card shadow-sm flex-shrink-0">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center space-x-4">
              <Button
                onClick={handleAddTicket}
                variant="primary"
                size="md"
                disabled={!isAuthenticated}
              >
                Add Ticket
              </Button>
            </div>
            
            {/* User Profile Section */}
            <div className="flex items-center space-x-4">
              {user && (
                <div className="flex items-center space-x-3">
                  <div className="text-sm">
                    <span className="text-muted-foreground">Welcome, </span>
                    <span className="font-medium">{user.email}</span>
                  </div>
                  <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">
                    {user.email.charAt(0).toUpperCase()}
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>
        
        <div className="flex-1 overflow-hidden">
          <Timeline
            sunTimes={sunTimes}
            tickets={tickets}
            onTicketUpdate={handleTicketUpdate}
            onTicketClick={handleTicketClick}
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
    </ProtectedRoute>
  );
}
