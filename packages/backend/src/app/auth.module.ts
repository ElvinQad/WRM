import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { SupabaseStrategy } from './supabase.strategy.ts';
import { AuthService } from './auth.service.ts';
import { AuthController } from './auth.controller.ts';
import { SupabaseService } from './supabase.service.ts';

@Module({
  imports: [
    PassportModule,
  ],
  controllers: [AuthController],
  providers: [SupabaseStrategy, AuthService, SupabaseService],
  exports: [SupabaseStrategy, AuthService],
})
export class AuthModule {}