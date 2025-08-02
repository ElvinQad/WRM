import React from 'react';
import { useAuth } from '../../hooks/use-auth.ts';

interface EmailVerificationBannerProps {
  user: {
    email: string;
    emailVerified?: boolean;
  };
}

export const EmailVerificationBanner: React.FC<EmailVerificationBannerProps> = ({ user }) => {
  const { sendVerificationEmail, emailVerificationStatus, error, clearError } = useAuth();

  // Don't show banner if email is already verified
  if (user.emailVerified) {
    return null;
  }

  const handleResendVerification = async () => {
    clearError();
    try {
      await sendVerificationEmail();
    } catch (err) {
      console.error('Failed to send verification email:', err);
    }
  };

  return (
    <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-6">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <svg className="h-5 w-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
            Email Verification Required
          </h3>
          <p className="mt-1 text-sm text-yellow-700 dark:text-yellow-300">
            Please verify your email address ({user.email}) to ensure account security and receive important notifications.
          </p>
          
          {emailVerificationStatus === 'success' && (
            <div className="mt-2 p-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded">
              <p className="text-sm text-green-700 dark:text-green-300">
                ✓ Verification email sent! Please check your inbox and follow the instructions.
              </p>
            </div>
          )}
          
          {error && emailVerificationStatus === 'error' && (
            <div className="mt-2 p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded">
              <p className="text-sm text-red-700 dark:text-red-300">
                {error}
              </p>
            </div>
          )}
          
          <div className="mt-3">
            <button
              type="button"
              onClick={handleResendVerification}
              disabled={emailVerificationStatus === 'pending'}
              className="text-sm font-medium text-yellow-800 dark:text-yellow-200 hover:text-yellow-900 dark:hover:text-yellow-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {emailVerificationStatus === 'pending' ? 'Sending...' : 'Resend verification email'}
            </button>
          </div>
        </div>
        <div className="ml-auto pl-3">
          <div className="-mx-1.5 -my-1.5">
            <button
              type="button"
              onClick={clearError}
              className="inline-flex bg-yellow-50 dark:bg-yellow-900/20 rounded-md p-1.5 text-yellow-400 hover:bg-yellow-100 dark:hover:bg-yellow-900/40 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-yellow-50 focus:ring-yellow-600"
            >
              <span className="sr-only">Dismiss</span>
              <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
