import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from './jwt-auth.guard.ts';
import { CurrentUser, type AuthenticatedUser } from './decorators/current-user.decorator.ts';

@ApiTags('Application')
@Controller()
export class AppController {

  @Get('protected')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Access protected data' })
  @ApiResponse({ status: 200, description: 'Protected data retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  getProtectedData(@CurrentUser() user: AuthenticatedUser) {
    return {
      message: 'This is protected data',
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      },
    };
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get user profile' })
  @ApiResponse({ status: 200, description: 'User profile retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  getUserProfile(@CurrentUser() user: AuthenticatedUser) {
    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      },
    };
  }

  @Get()
  @ApiOperation({ summary: 'Get backend structure overview' })
  @ApiResponse({ status: 200, description: 'Backend structure information' })
  getBackendStructure() {
    return {
      message: 'Welcome to the API backend with JWT Auth and Prisma!',
      modules: [
        'AppModule',
        'AuthModule (with JWT and Prisma)',
        'TicketsModule',
      ],
      services: [
        'AppService',
        'AuthService (Prisma-based)',
        'PrismaService',
        'TicketsService',
      ],
      endpoints: [
        { path: '/', description: 'Backend structure overview' },
        { path: '/auth/signup', description: 'Register new user' },
        { path: '/auth/signin', description: 'Login user' },
        { path: '/protected', description: 'Protected endpoint requiring auth', auth: true },
        { path: '/profile', description: 'Get user profile', auth: true },
        { path: '/tickets', description: 'Ticket management endpoints', auth: true },
      ],
      auth: {
        strategy: 'JWT Authentication',
        guard: 'JwtAuthGuard',
        decorator: '@CurrentUser()',
        database: 'PostgreSQL with Prisma',
      },
    };
  }
}
