// API client configuration and utilities
import { BaseTicket, CreateTicketDto, UpdateTicketDto, TicketType } from '@wrm/types';

const API_BASE_URL = 'http://localhost:8000/api';

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
        ...options.headers,
      },
      ...options,
    };

    // Only add Content-Type header if we have a body to send
    if (options.body) {
      config.headers = {
        'Content-Type': 'application/json',
        ...config.headers,
      };
    }

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
        
        // Enhance error message for auth-related errors
        if (response.status === 401) {
          errorMessage = 'Unauthorized - ' + errorMessage;
        }
        
        throw new ApiError(response.status, errorMessage);
      }

      // Handle empty responses (204 No Content or empty body)
      if (response.status === 204) {
        return {} as T;
      }

      // Check if response has content before trying to parse JSON
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const text = await response.text();
        return text ? JSON.parse(text) : {} as T;
      } else {
        // For non-JSON responses, return empty object
        return {} as T;
      }
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
      body: JSON.stringify({}),
    });
  }

  async refreshToken(refreshToken: string): Promise<unknown> {
    return await this.request('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    });
  }

  async getProfile(): Promise<unknown> {
    return await this.request('/auth/me');
  }

  async sendVerificationEmail(): Promise<unknown> {
    return await this.request('/auth/send-verification', {
      method: 'POST',
      body: JSON.stringify({}),
    });
  }

  async verifyEmail(token: string): Promise<unknown> {
    return await this.request('/auth/verify-email', {
      method: 'POST',
      body: JSON.stringify({ token }),
    });
  }

  async requestPasswordReset(email: string): Promise<unknown> {
    return await this.request('/auth/request-password-reset', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  async resetPassword(token: string, newPassword: string): Promise<unknown> {
    return await this.request('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, newPassword }),
    });
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

  // Ticket Types API methods
  async getTicketTypes(): Promise<TicketType[]> {
    return await this.request<TicketType[]>('/ticket-types');
  }
}

// Export singleton instance
export const apiClient = new ApiClient();
export { ApiError };
