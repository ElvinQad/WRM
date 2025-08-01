import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth-prisma.service.ts';
import { AuthController } from './auth-prisma.controller.ts';
import { JwtStrategy } from './jwt.strategy.ts';
import { PrismaService } from './prisma.service.ts';
import process from "node:process";

@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'your-secret-key',
      signOptions: { expiresIn: process.env.JWT_EXPIRES_IN || '15m' },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, PrismaService],
  exports: [AuthService, PrismaService],
})
export class AuthModule {}
