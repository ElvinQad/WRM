import { Injectable, UnauthorizedException, BadRequestException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma.service.ts';
import { EmailService } from '../email/email.service.ts';
import { User } from '@prisma/client';
import bcrypt from 'bcryptjs';
import crypto from 'node:crypto';
import process from "node:process";

// User type definition (now imported from Prisma client)
export interface JwtPayload {
  sub: string; // user id
  email: string;
  iat?: number;
  exp?: number;
}

export interface AuthResult {
  user: Omit<User, 'password'>;
  accessToken: string;
  refreshToken?: string;
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private emailService: EmailService,
  ) {}

  async signUp(email: string, password: string, firstName?: string, lastName?: string): Promise<AuthResult> {
    this.logger.log(`SignUp attempt with email: ${email}`);

    // Check if user already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      throw new BadRequestException('User with this email already exists');
    }

    // Validate password strength
    if (password.length < 6) {
      throw new BadRequestException('Password must be at least 6 characters long');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const user = await this.prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
      },
    });

    this.logger.log(`User created successfully: ${user.id}`);

    // Send verification email
    try {
      await this.sendVerificationEmail(user.id);
    } catch (emailError) {
      this.logger.error(`Failed to send verification email to ${user.email}`, emailError);
      // We don't want to fail the whole signup process if email fails
      // but we should log it.
    }

    // Generate tokens
    const tokens = await this.generateTokens(user);

    // Return user without password
    const { password: _, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    };
  }

  async signIn(email: string, password: string): Promise<AuthResult> {
    this.logger.log(`SignIn attempt with email: ${email}`);

    // Find user
    const user = await this.prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    this.logger.log(`SignIn successful for user: ${user.id}`);

    // Generate tokens
    const tokens = await this.generateTokens(user);

    // Return user without password
    const { password: _, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    };
  }

  async refreshToken(refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET,
      });

      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub }
      });

      if (!user) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      return this.generateTokens(user);
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async validateUser(payload: JwtPayload): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub }
    });

    if (!user) {
      return null;
    }

    return user;
  }

  async getUserProfile(userId: string): Promise<Omit<User, 'password'>> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  private async generateTokens(user: User): Promise<{ accessToken: string; refreshToken: string }> {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: process.env.JWT_SECRET,
        expiresIn: process.env.JWT_EXPIRES_IN || '15m',
      }),
      this.jwtService.signAsync(payload, {
        secret: process.env.JWT_REFRESH_SECRET,
        expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
      }),
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }

  signOut(): { message: string } {
    // With JWT, we don't need to do anything server-side
    // The client should remove the tokens
    return { message: 'Signed out successfully' };
  }

  // Generate a secure random token
  private generateSecureToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  async sendVerificationEmail(userId: string): Promise<{ message: string }> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    if (user.emailVerified) {
      throw new BadRequestException('Email already verified');
    }

    // Generate verification token
    const verificationToken = this.generateSecureToken();

    // Update user with verification token
    await this.prisma.user.update({
      where: { id: userId },
      data: { emailVerificationToken: verificationToken }
    });

    // Send verification email
    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    await this.emailService.sendVerificationEmail(user.email, verificationToken, baseUrl);

    return { message: 'Verification email sent' };
  }

  async verifyEmail(token: string): Promise<{ message: string }> {
    const user = await this.prisma.user.findUnique({
      where: { emailVerificationToken: token }
    });

    if (!user) {
      throw new BadRequestException('Invalid verification token');
    }

    if (user.emailVerified) {
      throw new BadRequestException('Email already verified');
    }

    // Update user as verified and clear token
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: true,
        emailVerificationToken: null
      }
    });

    return { message: 'Email verified successfully' };
  }

  async requestPasswordReset(email: string): Promise<{ message: string }> {
    const user = await this.prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      // Don't reveal if user exists or not for security
      return { message: 'If an account with that email exists, a password reset link has been sent' };
    }

    // Generate reset token
    const resetToken = this.generateSecureToken();
    const resetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // Update user with reset token
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        passwordResetToken: resetToken,
        passwordResetExpires: resetExpires
      }
    });

    // Send reset email
    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    await this.emailService.sendPasswordResetEmail(user.email, resetToken, baseUrl);

    return { message: 'If an account with that email exists, a password reset link has been sent' };
  }

  async resetPassword(token: string, newPassword: string): Promise<{ message: string }> {
    const user = await this.prisma.user.findUnique({
      where: { passwordResetToken: token }
    });

    if (!user || !user.passwordResetExpires || user.passwordResetExpires < new Date()) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    // Validate password strength
    if (newPassword.length < 6) {
      throw new BadRequestException('Password must be at least 6 characters long');
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // Update user password and clear reset token
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        passwordResetToken: null,
        passwordResetExpires: null
      }
    });

    return { message: 'Password reset successfully' };
  }
}
