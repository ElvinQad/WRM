"use client";

import React, { useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { FrontendTicket as Ticket } from '@wrm/types';
import { RootState } from '../../store/store.ts';
import { Button } from '../ui/Button.tsx';
import { Input } from '../ui/Input.tsx';
import { cn } from '../../lib/utils.ts';

interface TicketDetailModalProps {
  ticket: Ticket | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate?: (ticket: Ticket) => void;
  onDelete?: (ticketId: string) => void;
}

export function TicketDetailModal({ ticket, isOpen, onClose, onUpdate, onDelete }: TicketDetailModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const { ticketTypes } = useSelector((state: RootState) => state.ticketTypes);

  // Close modal on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  // Close modal on backdrop click
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen || !ticket) return null;

  const handleUpdate = (field: keyof Ticket | 'description', value: string | Date) => {
    if (!ticket || !onUpdate) return;
    
    if (field === 'description') {
      // Handle description separately since it's stored in customProperties
      onUpdate({ 
        ...ticket, 
        customProperties: { 
          ...ticket.customProperties, 
          description: value 
        } 
      });
    } else {
      onUpdate({ ...ticket, [field]: value });
    }
  };

  const formatDateTime = (date: Date) => {
    return date.toISOString().slice(0, 16);
  };

  const parseDateTime = (value: string) => {
    return new Date(value);
  };

  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div 
        ref={modalRef}
        className={cn(
          "bg-card/95 backdrop-blur-md rounded-2xl shadow-2xl",
          "max-w-md w-full mx-4 transform transition-all duration-300",
          "border border-border/50",
          isOpen ? "scale-100 opacity-100" : "scale-95 opacity-0"
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border/50">
          <h2 className="text-2xl font-bold text-foreground">Ticket Details</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground hover:bg-accent rounded-full p-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </Button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
          {/* Title */}
          <div className="space-y-2">
                        <input
              type="text"
              value={ticket.title}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleUpdate('title', e.target.value)}
              className="font-medium"
              placeholder="Enter ticket title"
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-foreground">
              Description
            </label>
            <textarea
              value={(ticket.customProperties?.description as string) || ''}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleUpdate('description', e.target.value)}
              rows={3}
              placeholder="Enter ticket description"
              className={cn(
                "w-full px-3 py-2 border border-input rounded-lg text-sm bg-background text-foreground",
                "focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent",
                "transition-colors resize-none"
              )}
            />
          </div>

          {/* Ticket Type Selection */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-foreground">
              Ticket Type
            </label>
            <select
              value={ticket.typeId}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleUpdate('typeId', e.target.value)}
              className={cn(
                "w-full px-3 py-2 border border-input rounded-lg text-sm bg-background text-foreground",
                "focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent",
                "transition-colors"
              )}
            >
              {ticketTypes.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.name}
                </option>
              ))}
            </select>
            {ticketTypes.find(t => t.id === ticket.typeId) && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <div 
                  className="w-3 h-3 rounded-full border border-border"
                  style={{ backgroundColor: ticketTypes.find(t => t.id === ticket.typeId)?.color || '#3B82F6' }}
                />
                Current type color
              </div>
            )}
          </div>

          {/* Time Range */}
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Start Time"
              type="datetime-local"
              value={formatDateTime(ticket.start)}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleUpdate('start', parseDateTime(e.target.value))}
            />
            <Input
              label="End Time"
              type="datetime-local"
              value={formatDateTime(ticket.end)}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleUpdate('end', parseDateTime(e.target.value))}
            />
          </div>

          {/* Category */}
          <Input
            label="Category"
            value={ticket.category || ''}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleUpdate('category', e.target.value)}
            placeholder="e.g., Work, Personal, Meeting"
          />

        </div>

        {/* Footer */}
        <div className="flex justify-between items-center p-6 border-t border-border/50 bg-card/50">
          <Button
            variant="outline"
            onClick={() => onDelete?.(ticket.id)}
            className="text-destructive border-destructive/20 hover:bg-destructive/10 hover:border-destructive/30"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Delete
          </Button>
          <div className="flex space-x-3">
            <Button
              variant="outline"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={onClose}
            >
              Save Changes
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
