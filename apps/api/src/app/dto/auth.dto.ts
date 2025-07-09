import { IsEmail, IsString, MinLength, IsOptional } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class SignUpDto {
  @ApiProperty({ example: 'user@example.com', description: 'User email address' })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @Transform(({ value }) => value.trim().toLowerCase())
  email!: string;

  @ApiProperty({ example: 'password123', description: 'User password (minimum 6 characters)' })
  @IsString()
  @MinLength(6)
  password!: string;

  @ApiProperty({ example: 'John Doe', description: 'Full name', required: false })
  @IsString()
  @IsOptional()
  full_name?: string;
}

export class SignInDto {
  @ApiProperty({ example: 'user@example.com', description: 'User email address' })
  @IsEmail()
  @Transform(({ value }) => value.trim().toLowerCase())
  email!: string;

  @ApiProperty({ example: 'password123', description: 'User password' })
  @IsString()
  password!: string;
}

export class RefreshTokenDto {
  @ApiProperty({ example: 'refresh_token_here', description: 'Refresh token' })
  @IsString()
  refreshToken!: string;
}

export class ResendConfirmationDto {
  @ApiProperty({ example: 'user@example.com', description: 'User email address' })
  @IsEmail()
  @Transform(({ value }) => value.trim().toLowerCase())
  email!: string;
}
