// Authentication service that integrates with our NestJS backend
import { apiClient } from './api.ts';

export interface SignUpRequest {
  email: string;
  password: string;
}

export interface SignInRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
  user: {
    id: string;
    email: string;
    user_metadata: Record<string, unknown>;
    app_metadata: Record<string, unknown>;
    created_at: string;
    updated_at: string;
  };
}

export interface UserProfile {
  user: {
    id: string;
    email: string;
    user_metadata: Record<string, unknown>;
    app_metadata: Record<string, unknown>;
  };
}

class AuthService {
  async signUp(data: SignUpRequest): Promise<AuthResponse> {
    return await apiClient.signUp(data) as AuthResponse;
  }

  async signIn(data: SignInRequest): Promise<AuthResponse> {
    return await apiClient.signIn(data) as AuthResponse;
  }

  async signOut(): Promise<{ message: string }> {
    return await apiClient.signOut() as { message: string };
  }

  async refreshToken(refreshToken: string): Promise<AuthResponse> {
    return await apiClient.refreshToken(refreshToken) as AuthResponse;
  }

  async getProfile(): Promise<UserProfile> {
    return await apiClient.getProfile() as UserProfile;
  }
}

export const authService = new AuthService();
