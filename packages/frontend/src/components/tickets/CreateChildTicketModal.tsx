"use client";

import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { FrontendTicket as Ticket } from '@wrm/types';
import { RootState } from '../../store/store.ts';
import { Button } from '../ui/Button.tsx';
import { cn } from '../../lib/utils.ts';
import { hierarchyApi } from '../../services/hierarchyApi.ts';
import { CustomFieldDefinition } from './CustomPropertyForm.tsx';

interface CreateChildTicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  parentTicket: Ticket;
  onChildCreated?: (childTicket: Ticket) => void;
}

interface ChildTicketForm {
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  inheritCustomProperties: string[];
}

export function CreateChildTicketModal({ 
  isOpen, 
  onClose, 
  parentTicket, 
  onChildCreated 
}: CreateChildTicketModalProps) {
  const { ticketTypes } = useSelector((state: RootState) => state.ticketTypes);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState<ChildTicketForm>({
    title: '',
    description: '',
    startTime: '',
    endTime: '',
    inheritCustomProperties: []
  });

  const parentTicketType = ticketTypes.find(t => t.id === parentTicket.typeId);
  const availableProperties = (Array.isArray(parentTicketType?.propertiesSchema) 
    ? parentTicketType.propertiesSchema 
    : []) as CustomFieldDefinition[];

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      const now = new Date();
      const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000);
      
      setForm({
        title: '',
        description: '',
        startTime: now.toISOString().slice(0, 16), // Format for datetime-local input
        endTime: oneHourLater.toISOString().slice(0, 16),
        inheritCustomProperties: []
      });
    }
  }, [isOpen]);

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

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handlePropertyToggle = (propertyName: string) => {
    setForm(prev => ({
      ...prev,
      inheritCustomProperties: prev.inheritCustomProperties.includes(propertyName)
        ? prev.inheritCustomProperties.filter(p => p !== propertyName)
        : [...prev.inheritCustomProperties, propertyName]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!form.title.trim()) {
      return;
    }

    try {
      setIsSubmitting(true);
      
      const childTicket = await hierarchyApi.createChildTicket(parentTicket.id, {
        title: form.title.trim(),
        description: form.description.trim() || undefined,
        startTime: form.startTime,
        endTime: form.endTime,
        inheritCustomProperties: form.inheritCustomProperties.length > 0 
          ? form.inheritCustomProperties 
          : undefined
      });

      onChildCreated?.(childTicket as Ticket);
      onClose();
    } catch (error) {
      console.error('Failed to create child ticket:', error);
      // Could show a toast or error message here
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div 
        className={cn(
          "bg-card/95 backdrop-blur-md rounded-2xl shadow-2xl",
          "max-w-md w-full mx-4 transform transition-all duration-300",
          "border border-border/50"
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border/50">
          <h2 className="text-xl font-bold text-foreground">Add Child Ticket</h2>
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

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Parent Context */}
          <div className="bg-muted/20 rounded-lg p-3">
            <p className="text-sm text-muted-foreground">Creating child under:</p>
            <p className="font-medium text-foreground">{parentTicket.title}</p>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Title <span className="text-destructive">*</span>
            </label>
            <input
              type="text"
              required
              value={form.title}
              onChange={(e) => setForm(prev => ({ ...prev, title: e.target.value }))}
              className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="Enter child ticket title"
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
              className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
              placeholder="Enter child ticket description"
              rows={3}
            />
          </div>

          {/* Time Range */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Start Time</label>
              <input
                type="datetime-local"
                required
                value={form.startTime}
                onChange={(e) => setForm(prev => ({ ...prev, startTime: e.target.value }))}
                className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">End Time</label>
              <input
                type="datetime-local"
                required
                value={form.endTime}
                onChange={(e) => setForm(prev => ({ ...prev, endTime: e.target.value }))}
                className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
          </div>

          {/* Property Inheritance */}
          {availableProperties.length > 0 && (
            <div className="space-y-3">
              <label className="text-sm font-medium text-foreground">
                Inherit Custom Properties
              </label>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {availableProperties.map((property) => {
                  const currentValue = parentTicket.customProperties?.[property.name];
                  const hasValue = currentValue !== undefined && currentValue !== null && currentValue !== '';
                  
                  return (
                    <label 
                      key={property.name}
                      className={cn(
                        "flex items-start space-x-3 p-2 rounded border cursor-pointer transition-colors",
                        form.inheritCustomProperties.includes(property.name)
                          ? "bg-primary/5 border-primary/20"
                          : "bg-background border-border",
                        !hasValue && "opacity-50"
                      )}
                    >
                      <input
                        type="checkbox"
                        disabled={!hasValue}
                        checked={form.inheritCustomProperties.includes(property.name)}
                        onChange={() => hasValue && handlePropertyToggle(property.name)}
                        className="mt-0.5"
                      />
                      <div className="flex-1">
                        <div className="text-sm font-medium text-foreground">
                          {property.label || property.name}
                        </div>
                        {property.label && property.name !== property.label && (
                          <div className="text-xs text-muted-foreground">
                            {property.name}
                          </div>
                        )}
                        {hasValue && (
                          <div className="text-xs text-primary mt-1">
                            Current: {String(currentValue)}
                          </div>
                        )}
                        {!hasValue && (
                          <div className="text-xs text-muted-foreground">
                            No value to inherit
                          </div>
                        )}
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>
          )}

          {/* Footer Buttons */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-border/50">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={isSubmitting || !form.title.trim()}
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating...
                </>
              ) : (
                'Create Child Ticket'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
