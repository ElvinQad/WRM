# Supabase Auth Implementation

This API now uses Supabase Auth for authentication, replacing the previous JWT-based authentication.

## Features

- **Supabase Authentication Strategy**: Uses `nestjs-supabase-auth` package
- **Protected Routes**: Routes protected with `@UseGuards(SupabaseAuthGuard)`
- **Current User Decorator**: `@CurrentUser()` decorator to get authenticated user
- **Authentication Endpoints**: Sign up, sign in, sign out, refresh token, and user profile

## Environment Variables

Make sure to set these environment variables:

```bash
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

## API Endpoints

### Public Endpoints

- `GET /` - Backend structure overview
- `GET /test-supabase` - Test Supabase connection
- `POST /auth/signup` - Register new user
- `POST /auth/signin` - Sign in user
- `POST /auth/refresh` - Refresh authentication token

### Protected Endpoints (Require Bearer Token)

- `POST /auth/signout` - Sign out user
- `GET /auth/me` - Get current user profile
- `GET /protected` - Example protected endpoint
- `GET /profile` - Get user profile

## Usage Examples

### Sign Up
```bash
curl -X POST http://localhost:3000/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'
```

### Sign In
```bash
curl -X POST http://localhost:3000/auth/signin \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'
```

### Access Protected Endpoint
```bash
curl -X GET http://localhost:3000/protected \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## Implementation Details

### Strategy
- `SupabaseStrategy` extends `SupabaseAuthStrategy` from `nestjs-supabase-auth`
- Validates JWT tokens issued by Supabase
- Extracts user information from the token

### Guard
- `SupabaseAuthGuard` protects routes requiring authentication
- Uses the 'supabase' strategy

### Decorator
- `@CurrentUser()` decorator provides access to authenticated user data
- Returns `SupabaseAuthUser` object with user details

### Services
- `AuthService` handles authentication operations (signup, signin, signout, refresh)
- `SupabaseService` provides Supabase client instance

## File Structure

```
src/app/
├── auth.controller.ts       # Authentication endpoints
├── auth.module.ts          # Auth module configuration
├── auth.service.ts         # Authentication service
├── supabase.strategy.ts    # Supabase authentication strategy
├── supabase.service.ts     # Supabase client service
├── decorators/
│   └── current-user.decorator.ts  # Current user decorator
├── dto/
│   └── auth.dto.ts         # Authentication DTOs
└── guards/
    └── jwt-auth.guard.ts   # Authentication guard (renamed to SupabaseAuthGuard)
```

## Migration from JWT

The implementation has been migrated from JWT to Supabase Auth:
- Replaced `JwtStrategy` with `SupabaseStrategy`
- Replaced `JwtAuthGuard` with `SupabaseAuthGuard`
- Updated auth module to use Supabase instead of JWT
- Added authentication endpoints and services
