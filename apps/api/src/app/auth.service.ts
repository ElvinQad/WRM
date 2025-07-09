import { Injectable, Logger, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { createClient } from '@supabase/supabase-js';

@Injectable()
export class AuthService {
  private supabase;
  private readonly logger = new Logger(AuthService.name);

  constructor() {
    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
      throw new Error('Missing Supabase environment variables');
    }
    // Use anon key for auth operations, not service role key
    this.supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_ANON_KEY
    );
  }

  async signUp(email: string, password: string, metadata?: { full_name?: string }) {
    this.logger.log('SignUp attempt with email: ' + email);
    this.logger.log('Email type: ' + typeof email);
    this.logger.log('Email length: ' + email.length);
    this.logger.log('API_URL for redirect:', process.env.API_URL);
    
    const supabase = this.supabase;
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata || {}, // This goes to raw_user_meta_data
        emailRedirectTo: `${process.env.API_URL || 'http://localhost:3000/api'}/auth/callback`
      }
    });

    if (error) {
      this.logger.error('Supabase signup error:', error);
      this.logger.error('Error details:', {
        message: error.message,
        status: error.status,
        name: error.name
      });
      throw new BadRequestException(error.message);
    }

    this.logger.log('Signup successful. User created:', {
      id: data.user?.id,
      email: data.user?.email,
      emailConfirmed: data.user?.email_confirmed_at,
      confirmationSentAt: data.user?.confirmation_sent_at
    });

    // Check if email confirmation is required
    if (data.user && !data.user.email_confirmed_at) {
      return {
        ...data,
        message: 'Please check your email and click the confirmation link to complete your registration.'
      };
    }

    return data;
  }

  async signIn(email: string, password: string) {
    this.logger.log('SignIn attempt with email: ' + email);
    
    const supabase = this.supabase;
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      this.logger.error('Supabase signin error:', {
        message: error.message,
        status: error.status,
        name: error.name,
        email: email
      });
      
      // Provide more helpful error messages
      if (error.message.includes('Email not confirmed')) {
        throw new UnauthorizedException('Please check your email and click the confirmation link before signing in.');
      }
      if (error.message.includes('Invalid login credentials')) {
        throw new UnauthorizedException('The email or password you entered is incorrect. Please try again.');
      }
      throw new UnauthorizedException(error.message);
    }

    this.logger.log('SignIn successful for user:', data.user?.id);
    return data;
  }

  async resendConfirmation(email: string) {
    this.logger.log('Resending confirmation email to:', email);
    const supabase = this.supabase;
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email,
      options: {
        emailRedirectTo: `${process.env.API_URL || 'http://localhost:3000/api'}/auth/callback`
      }
    });

    if (error) {
      this.logger.error('Error resending confirmation email:', error);
      throw new Error(error.message);
    }

    this.logger.log('Confirmation email resent successfully to:', email);
    return { message: 'Confirmation email resent successfully' };
  }

  async checkUserStatus(email: string) {
    this.logger.log('Checking user status for:', email);
    
    try {
      // Check if we have the required environment variables
      if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
        return {
          success: false,
          error: 'Missing Supabase environment variables'
        };
      }

      // Try to get user info from Supabase admin API
      const supabase = createClient(
        process.env.SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY,
        {
          auth: {
            autoRefreshToken: false,
            persistSession: false
          }
        }
      );

      const { data, error } = await supabase.auth.admin.listUsers();
      
      if (error) {
        this.logger.error('Error checking user status:', error);
        return {
          success: false,
          error: error.message
        };
      }

      const user = data.users.find(u => u.email === email);
      
      if (!user) {
        return {
          success: true,
          userExists: false,
          message: 'User not found'
        };
      }

      return {
        success: true,
        userExists: true,
        user: {
          id: user.id,
          email: user.email,
          emailConfirmed: !!user.email_confirmed_at,
          confirmationSentAt: user.confirmation_sent_at,
          createdAt: user.created_at,
          lastSignInAt: user.last_sign_in_at
        }
      };
    } catch (error) {
      this.logger.error('Error checking user status:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async signOut() {
    // Note: signOut should typically be handled on the client side
    // This is a placeholder - consider removing this endpoint
    // or implementing it differently based on your needs
    return { message: 'Signed out successfully' };
  }

  async refreshToken(refreshToken: string) {
    const supabase = this.supabase;
    const { data, error } = await supabase.auth.refreshSession({
      refresh_token: refreshToken,
    });

    if (error) {
      throw new Error(error.message);
    }

    return data;
  }

  async handleEmailConfirmation(tokenHash: string) {
    try {
      const supabase = this.supabase;
      const { data, error } = await supabase.auth.verifyOtp({
        token_hash: tokenHash,
        type: 'email'
      });

      if (error) {
        return {
          success: false,
          error: error.message
        };
      }

      return {
        success: true,
        data
      };
    } catch {
      return {
        success: false,
        error: 'Email confirmation failed'
      };
    }
  }
}
