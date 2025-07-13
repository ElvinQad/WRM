"use client";

import React, { useEffect, useRef } from 'react';
import { Ticket } from '../timeline/types';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { cn } from '../../lib/utils';

interface TicketDetailModalProps {
  ticket: Ticket | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate?: (ticket: Ticket) => void;
  onDelete?: (ticketId: string) => void;
}

export function TicketDetailModal({ ticket, isOpen, onClose, onUpdate, onDelete }: TicketDetailModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

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

  const handleUpdate = (field: keyof Ticket, value: string | Date) => {
    if (!ticket || !onUpdate) return;
    onUpdate({ ...ticket, [field]: value });
  };

  const formatDateTime = (date: Date) => {
    return date.toISOString().slice(0, 16);
  };

  const parseDateTime = (value: string) => {
    return new Date(value);
  };

  const colorOptions = [
    { value: '#ffffff', name: 'White' },
    { value: '#fef3c7', name: 'Yellow' },
    { value: '#dbeafe', name: 'Blue' },
    { value: '#dcfce7', name: 'Green' },
    { value: '#fce7f3', name: 'Pink' },
    { value: '#f3e8ff', name: 'Purple' },
    { value: '#fed7d7', name: 'Red' },
    { value: '#e0f2fe', name: 'Cyan' },
    { value: '#f0f9ff', name: 'Sky' },
  ];

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
            <Input
              label="Title"
              value={ticket.title}
              onChange={(e) => handleUpdate('title', e.target.value)}
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
              value={ticket.description}
              onChange={(e) => handleUpdate('description', e.target.value)}
              rows={3}
              placeholder="Enter ticket description"
              className={cn(
                "w-full px-3 py-2 border border-input rounded-lg text-sm bg-background text-foreground",
                "focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent",
                "transition-colors resize-none"
              )}
            />
          </div>

          {/* Time Range */}
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Start Time"
              type="datetime-local"
              value={formatDateTime(ticket.start)}
              onChange={(e) => handleUpdate('start', parseDateTime(e.target.value))}
            />
            <Input
              label="End Time"
              type="datetime-local"
              value={formatDateTime(ticket.end)}
              onChange={(e) => handleUpdate('end', parseDateTime(e.target.value))}
            />
          </div>

          {/* Category */}
          <Input
            label="Category"
            value={ticket.category || ''}
            onChange={(e) => handleUpdate('category', e.target.value)}
            placeholder="e.g., Work, Personal, Meeting"
          />

          {/* Color Selection */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-foreground">
              Color
            </label>
            <div className="grid grid-cols-5 gap-2">
              {colorOptions.map((color) => (
                <button
                  key={color.value}
                  onClick={() => handleUpdate('color', color.value)}
                  className={cn(
                    "w-10 h-10 rounded-lg border-2 transition-all duration-200",
                    "hover:scale-105 hover:shadow-md",
                    ticket.color === color.value 
                      ? 'border-primary ring-2 ring-primary/20' 
                      : 'border-border hover:border-border/60'
                  )}
                  style={{ backgroundColor: color.value }}
                  title={color.name}
                />
              ))}
            </div>
          </div>
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
