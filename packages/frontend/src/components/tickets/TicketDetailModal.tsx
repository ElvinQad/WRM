"use client";

import React, { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { FrontendTicket as Ticket } from '@wrm/types';
import { RootState } from '../../store/store.ts';
import { Button } from '../ui/Button.tsx';
import { cn } from '../../lib/utils.ts';
import { DynamicFormField } from '../forms/DynamicFormField.tsx';
import { CustomFieldDefinition } from './CustomPropertyForm.tsx';
import { getTicketDuration } from '../timeline/utils/duration.ts';
import { useTicketsPool } from '../timeline/hooks/useTicketsPool.ts';
import { RecurrenceConfigModal, RecurrencePatternConfig } from './RecurrenceConfigModal.tsx';
import { recurrenceApi, RecurrencePattern } from '../../services/recurrenceApi.ts';

interface TicketDetailModalProps {
  ticket: Ticket | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate?: (ticket: Ticket) => void;
  onDelete?: (ticketId: string) => void;
}

interface RepeatFormValue {
  enabled: boolean;
  pattern: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'CUSTOM';
  interval: number;
  byWeekday: string[];
  skipDates: Date[];
}

export function TicketDetailModal({ ticket, isOpen, onClose, onUpdate, onDelete }: TicketDetailModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const { ticketTypes } = useSelector((state: RootState) => state.ticketTypes);
  const { moveTicketToPool, isTicketInPool } = useTicketsPool();

  // Recurrence modal state
  const [isRecurrenceModalOpen, setIsRecurrenceModalOpen] = useState(false);
  const [recurrencePattern, setRecurrencePattern] = useState<RecurrencePattern | null>(null);

  // Load recurrence pattern when ticket changes
  useEffect(() => {
    if (ticket && isOpen) {
      // Try to load recurrence pattern regardless of isRecurring flag
      recurrenceApi.get(ticket.id)
        .then(pattern => {
          setRecurrencePattern(pattern);
        })
        .catch((error) => {
          // If no recurrence pattern found (404), that's expected
          if (error.status !== 404) {
            console.error('Error loading recurrence pattern:', error);
          }
          setRecurrencePattern(null);
        });
    } else {
      setRecurrencePattern(null);
    }
  }, [ticket?.id, isOpen]);

  // Repeat form local state (not persisted yet) - MUST be called before any conditional returns
  const [_repeat, _setRepeat] = React.useState<RepeatFormValue>({ 
    enabled: false, 
    pattern: 'DAILY', 
    interval: 1, 
    byWeekday: [], 
    skipDates: [] 
  });

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

  const handleCustomPropertyUpdate = (fieldName: string, value: string | number | boolean | undefined) => {
    if (!ticket || !onUpdate) return;
    
    onUpdate({
      ...ticket,
      customProperties: {
        ...ticket.customProperties,
        [fieldName]: value
      }
    });
  };

  const handleMoveToPool = async () => {
    if (!ticket) return;
    try {
      await moveTicketToPool(ticket);
      onClose(); // Close modal after successfully moving to pool
    } catch (error) {
      console.error('Failed to move ticket to pool:', error);
      // Could show a toast or error message here
    }
  };

  // Handle recurrence configuration
  const handleRecurrenceClick = () => {
    setIsRecurrenceModalOpen(true);
  };

  const handleRecurrenceSave = async (pattern: RecurrencePatternConfig) => {
    if (!ticket) return;
    
    try {
      if (recurrencePattern) {
        // Update existing recurrence
        await recurrenceApi.update(ticket.id, {
          frequency: pattern.frequency,
          interval: pattern.interval,
          endDate: pattern.endDate?.toISOString(),
          maxOccurrences: pattern.maxOccurrences,
          skipDates: pattern.skipDates?.map((d: Date) => d.toISOString())
        });
      } else {
        // Create new recurrence
        try {
          await recurrenceApi.create(ticket.id, {
            frequency: pattern.frequency,
            interval: pattern.interval,
            endDate: pattern.endDate?.toISOString(),
            maxOccurrences: pattern.maxOccurrences,
            skipDates: pattern.skipDates?.map((d: Date) => d.toISOString())
          });
        } catch (createError: unknown) {
          // If ticket already has recurrence, try to update instead
          if (createError instanceof Error && createError.message?.includes('already has recurrence pattern')) {
            await recurrenceApi.update(ticket.id, {
              frequency: pattern.frequency,
              interval: pattern.interval,
              endDate: pattern.endDate?.toISOString(),
              maxOccurrences: pattern.maxOccurrences,
              skipDates: pattern.skipDates?.map((d: Date) => d.toISOString())
            });
          } else {
            throw createError;
          }
        }
      }
      
      // Reload recurrence pattern
      const updatedPattern = await recurrenceApi.get(ticket.id);
      setRecurrencePattern(updatedPattern);
      
      // Generate initial instances if this is a new recurrence
      if (!recurrencePattern) {
        await recurrenceApi.generateInstances(ticket.id, 5);
      }
      
    } catch (error) {
      console.error('Failed to save recurrence:', error);
    }
  };

  const handleRemoveRecurrence = async () => {
    if (!ticket || !recurrencePattern) return;
    
    try {
      await recurrenceApi.delete(ticket.id);
      setRecurrencePattern(null);
      
      // Update ticket to reflect non-recurring status if needed
      
    } catch (error) {
      console.error('Failed to remove recurrence:', error);
    }
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

          {/* Duration Information */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-foreground">
              Duration
            </label>
            <div className="p-3 bg-muted/50 rounded-lg border border-border">
              <div className="text-sm text-foreground">
                {getTicketDuration(ticket).detailed}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                {ticket.start.toLocaleString()} - {ticket.end.toLocaleString()}
              </div>
            </div>
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

          {/* Repeat/Recurrence Configuration */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-foreground">
              Repeat
            </label>
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg border border-border">
              <div className="flex items-center gap-2">
                {recurrencePattern ? (
                  <>
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-sm text-foreground">
                      {recurrencePattern.frequency === 'DAILY' && `Every ${recurrencePattern.interval} day${recurrencePattern.interval > 1 ? 's' : ''}`}
                      {recurrencePattern.frequency === 'WEEKLY' && `Every ${recurrencePattern.interval} week${recurrencePattern.interval > 1 ? 's' : ''}`}
                      {recurrencePattern.frequency === 'MONTHLY' && `Every ${recurrencePattern.interval} month${recurrencePattern.interval > 1 ? 's' : ''}`}
                    </span>
                  </>
                ) : (
                  <>
                    <div className="w-2 h-2 bg-muted-foreground rounded-full"></div>
                    <span className="text-sm text-muted-foreground">No repeat</span>
                  </>
                )}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRecurrenceClick}
                  className="text-xs"
                >
                  {recurrencePattern ? 'Edit' : 'Add Repeat'}
                </Button>
                {recurrencePattern && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRemoveRecurrence}
                    className="text-xs text-destructive hover:bg-destructive/10"
                  >
                    Remove
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Time Range
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
          </div> */}

          {/* Custom Properties */}
          {(() => {
            const selectedTicketType = ticketTypes.find(t => t.id === ticket.typeId);
            const propertiesSchema = selectedTicketType?.propertiesSchema;
            const customFields = (Array.isArray(propertiesSchema) ? propertiesSchema : []) as CustomFieldDefinition[];
            
            if (customFields.length > 0) {
              return (
                <div className="space-y-4">
                  <h3 className="text-sm font-medium text-foreground border-b border-border pb-2">
                    Custom Properties
                  </h3>
                  {customFields.map((field) => (
                    <DynamicFormField
                      key={field.name}
                      field={field}
                      value={ticket.customProperties?.[field.name]}
                      onChange={(value) => handleCustomPropertyUpdate(field.name, value as string | number | boolean | undefined)}
                    />
                  ))}
                </div>
              );
            }
            return null;
          })()}

        </div>

        {/* Footer */}
        <div className="flex justify-between items-center p-6 border-t border-border/50 bg-card/50">
          <div className="flex space-x-3">
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
            {!isTicketInPool(ticket.id) && (
              <Button
                variant="outline"
                onClick={handleMoveToPool}
                className="text-orange-600 border-orange-300 hover:bg-orange-50 hover:border-orange-400"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                Move to Pool
              </Button>
            )}
          </div>
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

      {/* Recurrence Configuration Modal */}
      <RecurrenceConfigModal
        isOpen={isRecurrenceModalOpen}
        onClose={() => setIsRecurrenceModalOpen(false)}
        onSave={handleRecurrenceSave}
        initialPattern={recurrencePattern ? {
          frequency: recurrencePattern.frequency,
          interval: recurrencePattern.interval,
          endDate: recurrencePattern.endDate,
          maxOccurrences: recurrencePattern.maxOccurrences,
          skipDates: recurrencePattern.skipDates
        } : undefined}
        ticketTitle={ticket?.title || 'ticket'}
      />
    </div>
  );
}
