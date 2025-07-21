import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller.ts';
import { AppService } from './app.service.ts';
import { SupabaseService } from './supabase.service.ts';

// Simple mock for Supabase service
const mockSupabaseService = {
  getClient: () => ({
    from: () => ({
      select: () => Promise.resolve({
        data: [{ id: 1, name: 'test' }],
        error: null
      })
    })
  })
};

Deno.test('AppController - getBackendStructure', async () => {
  const module: TestingModule = await Test.createTestingModule({
    controllers: [AppController],
    providers: [
      AppService,
      {
        provide: SupabaseService,
        useValue: mockSupabaseService,
      },
    ],
  }).compile();

  const appController = module.get<AppController>(AppController);
  const result = await appController.getBackendStructure();
  
  if (!result) throw new Error('Result should be defined');
  if (result.message !== 'Welcome to the API backend with Supabase Auth!') throw new Error('Message should match');
  if (!Array.isArray(result.endpoints)) throw new Error('Endpoints should be an array');
});

Deno.test('AppController - testSupabase', async () => {
  const module: TestingModule = await Test.createTestingModule({
    controllers: [AppController],
    providers: [
      AppService,
      {
        provide: SupabaseService,
        useValue: mockSupabaseService,
      },
    ],
  }).compile();

  const appController = module.get<AppController>(AppController);
  const result = await appController.testSupabase();
  
  if (!result) throw new Error('Result should be defined');
  if (!result.data || !Array.isArray(result.data)) throw new Error('Data should be an array');
});

Deno.test('AppController - getProtectedData', async () => {
  const module: TestingModule = await Test.createTestingModule({
    controllers: [AppController],
    providers: [
      AppService,
      {
        provide: SupabaseService,
        useValue: mockSupabaseService,
      },
    ],
  }).compile();

  const mockUser = {
    id: 'user-123',
    email: 'test@example.com',
    created_at: '2024-01-01T00:00:00Z',
    app_metadata: {},
    user_metadata: {},
    aud: 'authenticated'
  };

  const appController = module.get<AppController>(AppController);
  const result = await appController.getProtectedData(mockUser);
  
  if (!result) throw new Error('Result should be defined');
  if (result.message !== 'This is protected data') throw new Error('Message should match');
  if (result.user.id !== mockUser.id) throw new Error('User ID should match');
});
