import { IsEmail, IsString, MinLength, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SignUpDto {
  @ApiProperty({ description: 'User email address' })
  @IsEmail()
  email!: string;

  @ApiProperty({ description: 'User password', minLength: 6 })
  @IsString()
  @MinLength(6)
  password!: string;

  @ApiPropertyOptional({ description: 'User first name' })
  @IsOptional()
  @IsString()
  firstName?: string;

  @ApiPropertyOptional({ description: 'User last name' })
  @IsOptional()
  @IsString()
  lastName?: string;
}

export class SignInDto {
  @ApiProperty({ description: 'User email address' })
  @IsEmail()
  email!: string;

  @ApiProperty({ description: 'User password' })
  @IsString()
  password!: string;
}

export class RefreshTokenDto {
  @ApiProperty({ description: 'Refresh token' })
  @IsString()
  refreshToken!: string;
}

export class AuthResponseDto {
  @ApiProperty({ description: 'User information' })
  user!: {
    id: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
    createdAt: Date;
    updatedAt: Date;
  };

  @ApiProperty({ description: 'JWT access token' })
  accessToken!: string;

  @ApiPropertyOptional({ description: 'JWT refresh token' })
  refreshToken?: string;
}

export class TokenResponseDto {
  @ApiProperty({ description: 'JWT access token' })
  accessToken!: string;

  @ApiProperty({ description: 'JWT refresh token' })
  refreshToken!: string;
}

export class SendVerificationEmailDto {
  @ApiProperty({ description: 'User ID to send verification email to' })
  @IsString()
  userId!: string;
}

export class VerifyEmailDto {
  @ApiProperty({ description: 'Email verification token' })
  @IsString()
  token!: string;
}

export class RequestPasswordResetDto {
  @ApiProperty({ description: 'User email address' })
  @IsEmail()
  email!: string;
}

export class ResetPasswordDto {
  @ApiProperty({ description: 'Password reset token' })
  @IsString()
  token!: string;

  @ApiProperty({ description: 'New password', minLength: 6 })
  @IsString()
  @MinLength(6)
  newPassword!: string;
}

export class MessageResponseDto {
  @ApiProperty({ description: 'Response message' })
  message!: string;
}
