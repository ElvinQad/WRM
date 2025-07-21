import { Controller, Post, Body, UseGuards, Get, Query, Res } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import type { Response } from 'express';
import process from "node:process";
import { AuthService } from './auth.service.ts';
import { SignUpDto, SignInDto, RefreshTokenDto, ResendConfirmationDto } from './dto/auth.dto.ts';
import { SupabaseAuthGuard } from '../guards/jwt-auth.guard.ts';
import { CurrentUser } from './decorators/current-user.decorator.ts';
import type { SupabaseAuthUser } from 'nestjs-supabase-auth';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({ status: 201, description: 'User successfully created' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async signUp(@Body() signUpDto: SignUpDto) {
    return await this.authService.signUp(
      signUpDto.email, 
      signUpDto.password, 
      signUpDto.full_name ? { full_name: signUpDto.full_name } : undefined
    );
  }

  @Post('signin')
  @ApiOperation({ summary: 'Sign in user' })
  @ApiResponse({ status: 200, description: 'User successfully signed in' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async signIn(@Body() signInDto: SignInDto) {
    return await this.authService.signIn(signInDto.email, signInDto.password);
  }

  @Post('signout')
  @UseGuards(SupabaseAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Sign out user' })
  @ApiResponse({ status: 200, description: 'User successfully signed out' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async signOut() {
    // Note: Actual signOut should be handled on the client side
    // This endpoint just acknowledges the signout request
    return await this.authService.signOut();
  }

  @Post('refresh')
  @ApiOperation({ summary: 'Refresh authentication token' })
  @ApiResponse({ status: 200, description: 'Token successfully refreshed' })
  @ApiResponse({ status: 401, description: 'Invalid refresh token' })
  async refreshToken(@Body() refreshTokenDto: RefreshTokenDto) {
    return await this.authService.refreshToken(refreshTokenDto.refreshToken);
  }

  @Post('resend-confirmation')
  @ApiOperation({ summary: 'Resend email confirmation' })
  @ApiResponse({ status: 200, description: 'Confirmation email resent' })
  @ApiResponse({ status: 400, description: 'Invalid email address' })
  async resendConfirmation(@Body() resendConfirmationDto: ResendConfirmationDto) {
    return await this.authService.resendConfirmation(resendConfirmationDto.email);
  }

  @Get('me')
  @UseGuards(SupabaseAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: 200, description: 'User profile retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  getMe(@CurrentUser() user: SupabaseAuthUser) {
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

  @Get('callback')
  @ApiOperation({ summary: 'Handle email confirmation callback' })
  @ApiResponse({ status: 200, description: 'Email confirmation processed' })
  @ApiResponse({ status: 400, description: 'Invalid confirmation parameters' })
  async handleEmailConfirmation(
    @Query('token_hash') tokenHash: string,
    @Query('type') type: string,
    @Res() res: Response
  ) {
    try {
      if (!tokenHash || !type) {
        return res.redirect(`${process.env.CLIENT_URL || 'http://localhost:3000'}/auth/error?message=Missing confirmation parameters`);
      }

      const result = await this.authService.handleEmailConfirmation(tokenHash);
      
      if (result.success) {
        return res.redirect(`${process.env.CLIENT_URL || 'http://localhost:3000'}/auth/success?message=Email confirmed successfully`);
      } else {
        return res.redirect(`${process.env.CLIENT_URL || 'http://localhost:3000'}/auth/error?message=${encodeURIComponent(result.error || 'Unknown error')}`);
      }
    } catch {
      return res.redirect(`${process.env.CLIENT_URL || 'http://localhost:3000'}/auth/error?message=Email confirmation failed`);
    }
  }
}
