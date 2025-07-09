import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { SupabaseService } from './supabase.service';
import { SupabaseAuthGuard } from '../guards/jwt-auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';
import type { SupabaseAuthUser } from 'nestjs-supabase-auth';

@ApiTags('Application')
@Controller()
export class AppController {
  constructor(
    private readonly supabaseService: SupabaseService
  ) {}

  @Get('test-supabase')
  @ApiOperation({ summary: 'Test Supabase connection' })
  @ApiResponse({ status: 200, description: 'Supabase connection test result' })
  async testSupabase() {
    const supabase = this.supabaseService.getClient();
    const { data, error } = await supabase.from('test_table').select('*');
    
    if (error) {
      return { error: error.message };
    }
    
    return { data };
  }

  @Get('protected')
  @UseGuards(SupabaseAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Access protected data' })
  @ApiResponse({ status: 200, description: 'Protected data retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  getProtectedData(@CurrentUser() user: SupabaseAuthUser) {
    return {
      message: 'This is protected data',
      user: {
        id: user.id,
        email: user.email,
        created_at: user.created_at,
      },
    };
  }

  @Get('profile')
  @UseGuards(SupabaseAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get user profile' })
  @ApiResponse({ status: 200, description: 'User profile retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  getUserProfile(@CurrentUser() user: SupabaseAuthUser) {
    return {
      user: {
        id: user.id,
        email: user.email,
        user_metadata: user.user_metadata,
        app_metadata: user.app_metadata,
        created_at: user.created_at,
        updated_at: user.updated_at,
      },
    };
  }

  @Get()
  @ApiOperation({ summary: 'Get backend structure overview' })
  @ApiResponse({ status: 200, description: 'Backend structure information' })
  getBackendStructure() {
    return {
      message: 'Welcome to the API backend with Supabase Auth!',
      modules: [
        'AppModule',
        'AuthModule (with Supabase)',
      ],
      services: [
        'AppService',
        'SupabaseService',
      ],
      endpoints: [
        { path: '/', description: 'Backend structure overview' },
        { path: '/test-supabase', description: 'Test Supabase connection' },
        { path: '/protected', description: 'Protected endpoint requiring auth', auth: true },
        { path: '/profile', description: 'Get user profile from Supabase auth', auth: true },
      ],
      auth: {
        strategy: 'Supabase Auth',
        guard: 'SupabaseAuthGuard',
        decorator: '@CurrentUser()',
      },
    };
  }
}
