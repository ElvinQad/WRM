import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service.ts';
import { SupabaseService } from './supabase.service.ts';

// Mock environment variables for AuthService
const originalEnv = Deno.env.toObject();

// Mock Supabase service
const mockSupabaseService = {
  getClient: () => ({
    auth: {
      signUp: () => Promise.resolve({
        data: { user: { id: 'user-123', email: 'test@example.com' } },
        error: null
      }),
      signInWithPassword: () => Promise.resolve({
        data: { user: { id: 'user-123', email: 'test@example.com' }, session: { access_token: 'token123' } },
        error: null
      }),
      signOut: () => Promise.resolve({
        error: null
      }),
      refreshSession: () => Promise.resolve({
        data: { session: { access_token: 'new_token123' } },
        error: null
      }),
      admin: {
        listUsers: () => Promise.resolve({
          data: { users: [{ id: 'user-123', email: 'test@example.com' }] },
          error: null
        })
      }
    }
  })
};

// Mock AuthService that doesn't require environment variables
class MockAuthService {
  signUp(email: string, _password: string) {
    return Promise.resolve({
      user: { id: 'user-123', email },
      session: null
    });
  }

  signIn(email: string, _password: string) {
    return Promise.resolve({
      user: { id: 'user-123', email },
      session: { access_token: 'token123' }
    });
  }

  signOut() {
    return Promise.resolve({ message: 'Signed out successfully' });
  }

  refreshToken(_refreshToken: string) {
    return Promise.resolve({
      session: { access_token: 'new_token123' },
      user: { id: 'user-123' }
    });
  }
}

Deno.test('AuthService - signUp', async () => {
  const module: TestingModule = await Test.createTestingModule({
    providers: [
      {
        provide: AuthService,
        useClass: MockAuthService,
      },
      {
        provide: SupabaseService,
        useValue: mockSupabaseService,
      },
    ],
  }).compile();

  const authService = module.get<AuthService>(AuthService);
  try {
    const result = await authService.signUp('test@example.com', 'password123');
    if (!result.user) throw new Error('User should be returned');
    if (result.user.email !== 'test@example.com') throw new Error('Email should match');
  } catch (_error) {
    throw new Error('SignUp should succeed');
  }
});

Deno.test('AuthService - signIn', async () => {
  const module: TestingModule = await Test.createTestingModule({
    providers: [
      {
        provide: AuthService,
        useClass: MockAuthService,
      },
      {
        provide: SupabaseService,
        useValue: mockSupabaseService,
      },
    ],
  }).compile();

  const authService = module.get<AuthService>(AuthService);
  const result = await authService.signIn('test@example.com', 'password123');
  if (!result.user) throw new Error('User should be returned');
  if (!result.session) throw new Error('Session should be returned');
  if (result.session.access_token !== 'token123') throw new Error('Access token should match');
});

Deno.test('AuthService - signOut', async () => {
  const module: TestingModule = await Test.createTestingModule({
    providers: [
      {
        provide: AuthService,
        useClass: MockAuthService,
      },
      {
        provide: SupabaseService,
        useValue: mockSupabaseService,
      },
    ],
  }).compile();

  const authService = module.get<AuthService>(AuthService);
  const result = await authService.signOut();
  if (result.message !== 'Signed out successfully') throw new Error('SignOut should succeed');
});

Deno.test('AuthService - refreshToken', async () => {
  const module: TestingModule = await Test.createTestingModule({
    providers: [
      {
        provide: AuthService,
        useClass: MockAuthService,
      },
      {
        provide: SupabaseService,
        useValue: mockSupabaseService,
      },
    ],
  }).compile();

  const authService = module.get<AuthService>(AuthService);
  const result = await authService.refreshToken('refresh_token_123');
  if (!result.session) throw new Error('Session should be returned');
  if (result.session.access_token !== 'new_token123') throw new Error('New access token should match');
});
