import { apiClient } from '../lib/api.ts';
import { FrontendTicket, baseToFrontendTicket } from '@wrm/types';

export interface RecurrencePattern {
  id: string;
  frequency: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'CUSTOM';
  interval: number;
  endDate?: Date;
  maxOccurrences?: number;
  skipDates?: Date[];
  createdAt: Date;
}

export interface CreateRecurrenceRequest {
  frequency: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'CUSTOM';
  interval: number;
  endDate?: string;
  maxOccurrences?: number;
  skipDates?: string[];
}

export interface UpdateRecurrenceRequest {
  frequency?: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'CUSTOM';
  interval?: number;
  endDate?: string;
  maxOccurrences?: number;
  skipDates?: string[];
}

export const recurrenceApi = {
  // Create recurrence pattern for a ticket
  create: async (ticketId: string, pattern: CreateRecurrenceRequest): Promise<RecurrencePattern> => {
    return await apiClient.createRecurrence(ticketId, pattern);
  },

  // Get recurrence pattern for a ticket
  get: async (ticketId: string): Promise<RecurrencePattern> => {
    return await apiClient.getRecurrence(ticketId);
  },

  // Update recurrence pattern
  update: async (ticketId: string, pattern: UpdateRecurrenceRequest): Promise<RecurrencePattern> => {
    return await apiClient.updateRecurrence(ticketId, pattern);
  },

  // Delete recurrence pattern
  delete: async (ticketId: string): Promise<void> => {
    await apiClient.deleteRecurrence(ticketId);
  },

  // Generate instances for a recurring ticket
  generateInstances: async (ticketId: string, count: number = 10): Promise<FrontendTicket[]> => {
    const apiTickets = await apiClient.generateRecurrenceInstances(ticketId, count);
    return apiTickets.map(apiTicket => baseToFrontendTicket(apiTicket));
  },

  // Detach a ticket instance from its recurrence series
  detachInstance: async (ticketId: string): Promise<void> => {
    await apiClient.detachRecurrenceInstance(ticketId);
  }
};
