// API client configuration and utilities
import { BaseTicket, CreateTicketDto, UpdateTicketDto } from '@wrm/types';

const API_BASE_URL = 'http://localhost:3000/api';

// Keep ApiTicket for backward compatibility with legacy code, but it should match BaseTicket
export interface ApiTicket extends BaseTicket {}

// Legacy interfaces for backward compatibility
export interface CreateTicketRequest extends CreateTicketDto {}
export interface UpdateTicketRequest extends UpdateTicketDto {}

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

class ApiClient {
  private baseUrl: string;
  private getAuthToken: () => string | null;

  constructor(baseUrl: string = API_BASE_URL, tokenGetter?: () => string | null) {
    this.baseUrl = baseUrl;
    this.getAuthToken = tokenGetter || this.defaultGetAuthToken;
  }

  private defaultGetAuthToken(): string | null {
    // Default implementation for backward compatibility
    if (typeof window !== 'undefined') {
      return localStorage.getItem('auth_token');
    }
    return null;
  }

  // Method to update the token getter (for Redux integration)
  setTokenGetter(tokenGetter: () => string | null) {
    this.getAuthToken = tokenGetter;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    // Add auth token if available
    const token = this.getAuthToken();
    if (token) {
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${token}`,
      };
    }

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        let errorMessage = `HTTP error! status: ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch {
          // Use default error message if JSON parsing fails
        }
        throw new ApiError(response.status, errorMessage);
      }

      // Handle empty responses
      if (response.status === 204) {
        return {} as T;
      }

      return await response.json();
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(0, `Network error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Auth API methods
  async signUp(data: { email: string; password: string }): Promise<unknown> {
    return await this.request('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async signIn(data: { email: string; password: string }): Promise<unknown> {
    return await this.request('/auth/signin', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async signOut(): Promise<unknown> {
    return await this.request('/auth/signout', {
      method: 'POST',
    });
  }

  async refreshToken(): Promise<unknown> {
    return await this.request('/auth/refresh', {
      method: 'POST',
    });
  }

  async getProfile(): Promise<unknown> {
    return await this.request('/auth/me');
  }

  // Tickets API methods
  async getTickets(start?: string, end?: string): Promise<ApiTicket[]> {
    const params = new URLSearchParams();
    if (start) params.append('start', start);
    if (end) params.append('end', end);
    
    const endpoint = `/tickets${params.toString() ? `?${params.toString()}` : ''}`;
    return await this.request<ApiTicket[]>(endpoint);
  }

  async getTicket(id: string): Promise<ApiTicket> {
    return await this.request<ApiTicket>(`/tickets/${id}`);
  }

  async createTicket(ticket: CreateTicketRequest): Promise<ApiTicket> {
    return await this.request<ApiTicket>('/tickets', {
      method: 'POST',
      body: JSON.stringify(ticket),
    });
  }

  async updateTicket(id: string, ticket: UpdateTicketRequest): Promise<ApiTicket> {
    return await this.request<ApiTicket>(`/tickets/${id}`, {
      method: 'PUT',
      body: JSON.stringify(ticket),
    });
  }

  async deleteTicket(id: string): Promise<{ message: string }> {
    return await this.request<{ message: string }>(`/tickets/${id}`, {
      method: 'DELETE',
    });
  }
}

// Export singleton instance
export const apiClient = new ApiClient();
export { ApiError };
