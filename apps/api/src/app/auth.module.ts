import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { SupabaseStrategy } from './supabase.strategy';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { SupabaseService } from './supabase.service';

@Module({
  imports: [
    PassportModule,
  ],
  controllers: [AuthController],
  providers: [SupabaseStrategy, AuthService, SupabaseService],
  exports: [SupabaseStrategy, AuthService],
})
export class AuthModule {}