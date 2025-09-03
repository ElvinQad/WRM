/**
 * API client for ticket hierarchy operations
 * Story 2.5: Child Tickets & Hierarchical Structure
 */

import { FrontendTicket as Ticket } from '@wrm/types';

const API_BASE = 'http://localhost:8000/api';

export interface HierarchyResponse {
  ticket: Ticket & { nestingLevel: number };
  children: (Ticket & { nestingLevel: number })[];
  completionProgress: {
    completed: number;
    total: number;
    percentage: number;
  };
  maxDepth: number;
}

export interface CreateChildTicketRequest {
  title: string;
  description?: string;
  inheritCustomProperties?: string[];
  startTime?: string;
  endTime?: string;
}

export interface CompletionSettingsRequest {
  autoCompleteOnChildrenDone: boolean;
}

export interface MoveHierarchyRequest {
  newParentId?: string;
  validateNesting: boolean;
}

export interface CompletionProgressResponse {
  completedChildren: number;
  totalChildren: number;
  percentage: number;
  canAutoComplete: boolean;
}

class HierarchyApi {
  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('auth_token');
    return {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    };
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
      throw {
        status: response.status,
        message: errorData.message || `HTTP ${response.status}`,
        ...errorData
      };
    }
    return response.json();
  }

  /**
   * Create a child ticket under a parent ticket
   * Implements Subtask 2.1: Child ticket creation endpoint
   */
  async createChildTicket(parentId: string, request: CreateChildTicketRequest): Promise<Ticket & { nestingLevel: number }> {
    const response = await fetch(`${API_BASE}/tickets/${parentId}/children`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(request)
    });

    return this.handleResponse(response);
  }

  /**
   * Get hierarchy information for a ticket
   * Implements Subtask 2.3: Hierarchy-aware ticket retrieval
   */
  async getHierarchy(ticketId: string): Promise<HierarchyResponse> {
    const response = await fetch(`${API_BASE}/tickets/${ticketId}/hierarchy`, {
      method: 'GET',
      headers: this.getAuthHeaders()
    });

    return this.handleResponse(response);
  }

  /**
   * Update completion settings for a parent ticket
   * Implements Subtask 2.5: Auto-completion configuration
   */
  async updateCompletionSettings(ticketId: string, settings: CompletionSettingsRequest): Promise<void> {
    const response = await fetch(`${API_BASE}/tickets/${ticketId}/completion-settings`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(settings)
    });

    await this.handleResponse(response);
  }

  /**
   * Move a ticket in the hierarchy
   * Implements Subtask 2.6: Hierarchy manipulation
   */
  async moveTicketInHierarchy(ticketId: string, moveData: MoveHierarchyRequest): Promise<void> {
    const response = await fetch(`${API_BASE}/tickets/${ticketId}/move-hierarchy`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(moveData)
    });

    await this.handleResponse(response);
  }

  /**
   * Get completion progress for a parent ticket
   * Implements Subtask 2.4: Parent completion tracking
   */
  async getCompletionProgress(ticketId: string): Promise<CompletionProgressResponse> {
    const response = await fetch(`${API_BASE}/tickets/${ticketId}/completion-progress`, {
      method: 'GET',
      headers: this.getAuthHeaders()
    });

    return this.handleResponse(response);
  }
}

export const hierarchyApi = new HierarchyApi();
