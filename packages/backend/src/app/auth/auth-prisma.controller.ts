import { Controller, Post, Body, UseGuards, Get, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth-prisma.service.ts';
import { JwtAuthGuard } from './jwt-auth.guard.ts';
import { 
  SignUpDto, 
  SignInDto, 
  RefreshTokenDto, 
  AuthResponseDto, 
  TokenResponseDto,
  SendVerificationEmailDto,
  VerifyEmailDto,
  RequestPasswordResetDto,
  ResetPasswordDto,
  MessageResponseDto
} from '../dto/auth-prisma.dto.ts';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({ status: 201, description: 'User successfully created', type: AuthResponseDto })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async signUp(@Body() signUpDto: SignUpDto): Promise<AuthResponseDto> {
    return await this.authService.signUp(
      signUpDto.email,
      signUpDto.password,
      signUpDto.firstName,
      signUpDto.lastName
    );
  }

  @Post('signin')
  @ApiOperation({ summary: 'Sign in user' })
  @ApiResponse({ status: 200, description: 'User successfully signed in', type: AuthResponseDto })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async signIn(@Body() signInDto: SignInDto): Promise<AuthResponseDto> {
    return await this.authService.signIn(signInDto.email, signInDto.password);
  }

  @Post('refresh')
  @ApiOperation({ summary: 'Refresh authentication token' })
  @ApiResponse({ status: 200, description: 'Token successfully refreshed', type: TokenResponseDto })
  @ApiResponse({ status: 401, description: 'Invalid refresh token' })
  async refreshToken(@Body() refreshTokenDto: RefreshTokenDto): Promise<TokenResponseDto> {
    return await this.authService.refreshToken(refreshTokenDto.refreshToken);
  }

  @Post('signout')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Sign out user' })
  @ApiResponse({ status: 200, description: 'User successfully signed out' })
  signOut(): { message: string } {
    return this.authService.signOut();
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: 200, description: 'User profile retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getMe(@Request() req: { user: { id: string } }) {
    return await this.authService.getUserProfile(req.user.id);
  }

  @Post('send-verification')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Send email verification' })
  @ApiResponse({ status: 200, description: 'Verification email sent', type: MessageResponseDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async sendVerification(@Request() req: { user: { id: string } }): Promise<MessageResponseDto> {
    return await this.authService.sendVerificationEmail(req.user.id);
  }

  @Post('verify-email')
  @ApiOperation({ summary: 'Verify email address' })
  @ApiResponse({ status: 200, description: 'Email verified successfully', type: MessageResponseDto })
  @ApiResponse({ status: 400, description: 'Invalid verification token' })
  async verifyEmail(@Body() verifyEmailDto: VerifyEmailDto): Promise<MessageResponseDto> {
    return await this.authService.verifyEmail(verifyEmailDto.token);
  }

  @Post('request-password-reset')
  @ApiOperation({ summary: 'Request password reset' })
  @ApiResponse({ status: 200, description: 'Password reset email sent', type: MessageResponseDto })
  async requestPasswordReset(@Body() requestPasswordResetDto: RequestPasswordResetDto): Promise<MessageResponseDto> {
    return await this.authService.requestPasswordReset(requestPasswordResetDto.email);
  }

  @Post('reset-password')
  @ApiOperation({ summary: 'Reset password with token' })
  @ApiResponse({ status: 200, description: 'Password reset successfully', type: MessageResponseDto })
  @ApiResponse({ status: 400, description: 'Invalid or expired reset token' })
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto): Promise<MessageResponseDto> {
    return await this.authService.resetPassword(resetPasswordDto.token, resetPasswordDto.newPassword);
  }
}
