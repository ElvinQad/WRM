# WRM API Documentation

## Overview
The WRM (Web Resource Management) API is a NestJS-based backend service that provides authentication, database integration with Supabase, and comprehensive API documentation with Swagger.

## Features
- **Authentication**: JWT-based authentication with Passport.js
- **Database**: Supabase integration for data persistence
- **Documentation**: Swagger/OpenAPI documentation
- **Health Checks**: Built-in health monitoring endpoints
- **TypeScript**: Full TypeScript support with strict typing

## Project Structure

```
apps/api/
├── src/
│   ├── app/
│   │   ├── dto/                    # Data Transfer Objects
│   │   │   ├── api-response.dto.ts
│   │   │   ├── auth.dto.ts
│   │   │   └── health.dto.ts
│   │   ├── guards/                 # Authentication Guards
│   │   │   └── jwt-auth.guard.ts
│   │   ├── app.controller.ts       # Main application controller
│   │   ├── app.module.ts          # Root module
│   │   ├── app.service.ts         # Main application service
│   │   ├── auth.controller.ts     # Authentication controller
│   │   ├── auth.module.ts         # Authentication module
│   │   ├── health.controller.ts   # Health check controller
│   │   ├── jwt.strategy.ts        # JWT authentication strategy
│   │   └── supabase.service.ts    # Supabase client service
│   └── main.ts                    # Application entry point
├── package.json
├── tsconfig.json
└── webpack.config.js
```

## Environment Variables

Create a `.env` file in the project root with the following variables:

```env
# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key

# Supabase Configuration
SUPABASE_URL=your-supabase-url
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

# Application Configuration
PORT=3000
NODE_ENV=development
```

## API Endpoints

### Core Endpoints
- `GET /api/` - Backend structure overview
- `GET /api/health` - Health check endpoint
- `GET /api/test-supabase` - Test Supabase connection

### Authentication Endpoints
- `POST /api/auth/login` - Login and receive JWT token
- `GET /api/auth/profile` - Get user profile (protected)

### Documentation
- `GET /docs` - Swagger UI documentation

## Authentication

The API uses JWT (JSON Web Tokens) for authentication. To access protected endpoints:

1. Login via `POST /api/auth/login` with valid credentials
2. Use the returned `access_token` in the `Authorization` header: `Bearer <token>`

## Swagger Documentation

The API includes comprehensive Swagger documentation available at `/docs` when the server is running.

Features:
- Interactive API testing
- Request/response schemas
- Authentication testing with JWT tokens
- Detailed endpoint descriptions

## Development

### Installation
```bash
pnpm install
```

### Running the Application
```bash
# Development mode
pnpm nx serve api

# Build for production
pnpm nx build api
```

### Testing
```bash
# Run tests
pnpm nx test api

# Run e2e tests
pnpm nx e2e api
```

## Architecture

### Modules
- **AppModule**: Root module that imports all other modules
- **AuthModule**: Handles JWT authentication and user management
- **ConfigModule**: Global configuration management

### Services
- **AppService**: Core application logic
- **SupabaseService**: Database client and operations
- **JwtStrategy**: JWT validation and user extraction

### Guards
- **JwtAuthGuard**: Protects routes requiring authentication

### DTOs
- **ApiResponseDto**: Standard API response structure
- **BackendStructureDto**: Backend information schema
- **SupabaseTestDto**: Supabase connection test response
- **LoginDto**: User login request
- **TokenResponseDto**: JWT token response
- **ProfileDto**: User profile information
- **HealthCheckDto**: Health check response

## Security

- JWT tokens with configurable expiration
- Environment-based configuration
- Supabase Row Level Security (RLS) integration
- CORS configuration (can be configured in main.ts)

## Contributing

1. Follow the existing code structure
2. Add appropriate DTOs for new endpoints
3. Include Swagger documentation for all endpoints
4. Write unit tests for new functionality
5. Update this README for significant changes

## License

This project is licensed under the MIT License.
