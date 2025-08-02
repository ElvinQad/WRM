import { Injectable, Logger } from '@nestjs/common';

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  constructor() {
    // For demo purposes, we'll just log emails
    // In production, you would integrate with SendGrid, AWS SES, etc.
  }

  sendEmail(options: EmailOptions): Promise<boolean> {
    try {
      // For development, just log the email
      this.logger.log(`--- EMAIL ---`);
      this.logger.log(`To: ${options.to}`);
      this.logger.log(`Subject: ${options.subject}`);
      this.logger.log(`HTML: ${options.html}`);
      this.logger.log(`--- END EMAIL ---`);

      // In production, replace this with actual email sending logic
      // Example with nodemailer:
      // await this.transporter.sendMail(options);

      return Promise.resolve(true);
    } catch (error) {
      this.logger.error(`Failed to send email to ${options.to}:`, error);
      return Promise.resolve(false);
    }
  }

  async sendVerificationEmail(email: string, verificationToken: string, baseUrl: string): Promise<boolean> {
    const verificationUrl = `${baseUrl}/verify-email?token=${verificationToken}`;
    
    const html = `
      <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
        <h2 style="color: #333;">Verify Your Email Address</h2>
        <p>Thank you for signing up! Please click the button below to verify your email address:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${verificationUrl}" 
             style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
            Verify Email Address
          </a>
        </div>
        <p>Or copy and paste this link into your browser:</p>
        <p style="word-break: break-all; color: #666;">${verificationUrl}</p>
        <p style="color: #666; font-size: 14px; margin-top: 30px;">
          If you didn't create an account, you can safely ignore this email.
        </p>
      </div>
    `;

    const text = `
      Verify Your Email Address
      
      Thank you for signing up! Please visit the following link to verify your email address:
      ${verificationUrl}
      
      If you didn't create an account, you can safely ignore this email.
    `;

    return await this.sendEmail({
      to: email,
      subject: 'Verify Your Email Address',
      html,
      text,
    });
  }

  async sendPasswordResetEmail(email: string, resetToken: string, baseUrl: string): Promise<boolean> {
    const resetUrl = `${baseUrl}/reset-password?token=${resetToken}`;
    
    const html = `
      <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
        <h2 style="color: #333;">Reset Your Password</h2>
        <p>You requested a password reset. Click the button below to reset your password:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" 
             style="background-color: #dc3545; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
            Reset Password
          </a>
        </div>
        <p>Or copy and paste this link into your browser:</p>
        <p style="word-break: break-all; color: #666;">${resetUrl}</p>
        <p style="color: #666; font-size: 14px; margin-top: 30px;">
          This link will expire in 1 hour. If you didn't request a password reset, you can safely ignore this email.
        </p>
      </div>
    `;

    const text = `
      Reset Your Password
      
      You requested a password reset. Please visit the following link to reset your password:
      ${resetUrl}
      
      This link will expire in 1 hour. If you didn't request a password reset, you can safely ignore this email.
    `;

    return await this.sendEmail({
      to: email,
      subject: 'Reset Your Password',
      html,
      text,
    });
  }
}
