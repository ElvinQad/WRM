import React, { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/use-auth.ts';

interface EmailVerificationPageProps {
  token: string;
  onSuccess?: () => void;
  onError?: () => void;
}

export const EmailVerificationPage: React.FC<EmailVerificationPageProps> = ({ 
  token,
  onSuccess,
  onError 
}) => {
  const [verificationState, setVerificationState] = useState<'pending' | 'success' | 'error'>('pending');
  const { verifyEmail, error } = useAuth();

  useEffect(() => {
    const performVerification = async () => {
      try {
        await verifyEmail(token);
        setVerificationState('success');
        setTimeout(() => {
          onSuccess?.();
        }, 2000);
      } catch (err) {
        console.error('Email verification error:', err);
        setVerificationState('error');
        onError?.();
      }
    };

    if (token) {
      performVerification();
    }
  }, [token, verifyEmail, onSuccess, onError]);

  if (verificationState === 'pending') {
    return (
      <div className="w-full max-w-md mx-auto text-center">
        <div className="mb-4">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900">
            <svg className="animate-spin h-6 w-6 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Verifying Your Email
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Please wait while we verify your email address...
        </p>
      </div>
    );
  }

  if (verificationState === 'success') {
    return (
      <div className="w-full max-w-md mx-auto text-center">
        <div className="mb-4">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 dark:bg-green-900">
            <svg className="h-6 w-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Email Verified Successfully!
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Your email address has been successfully verified. You can now access all features of your account.
        </p>
        <button
          type="button"
          onClick={onSuccess}
          className="w-full py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
        >
          Continue to Dashboard
        </button>
      </div>
    );
  }

  // Error state
  return (
    <div className="w-full max-w-md mx-auto text-center">
      <div className="mb-4">
        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900">
          <svg className="h-6 w-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
      </div>
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
        Verification Failed
      </h2>
      <p className="text-gray-600 dark:text-gray-400 mb-4">
        We couldn't verify your email address. This could be because:
      </p>
      <ul className="text-left text-sm text-gray-600 dark:text-gray-400 mb-6 space-y-1">
        <li>• The verification link has expired</li>
        <li>• The link has already been used</li>
        <li>• The link is invalid or corrupted</li>
      </ul>
      {error && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/50 border border-red-200 dark:border-red-800 rounded-md">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}
      <div className="space-y-3">
        <button
          type="button"
          onClick={() => globalThis.location.reload()}
          className="w-full py-2 px-4 text-sm font-medium text-blue-600 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/40 border border-blue-200 dark:border-blue-800 rounded-md transition-colors duration-200"
        >
          Try Again
        </button>
        <button
          type="button"
          onClick={onError}
          className="w-full py-2 px-4 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-600 hover:bg-gray-200 dark:hover:bg-gray-500 rounded-md transition-colors duration-200"
        >
          Back to Login
        </button>
      </div>
    </div>
  );
};
