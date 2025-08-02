'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function AuthStatus() {
  const searchParams = useSearchParams();
  const message = searchParams.get('message');
  const type = searchParams.get('type');

  // This page is now primarily for email confirmation and similar flows
  const isEmailConfirmation = type === 'email-confirmation';

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md w-full max-w-md text-center">
        <h1 className="text-2xl font-bold text-green-600 dark:text-green-400 mb-4">
          {isEmailConfirmation ? 'Check Your Email' : 'Success!'}
        </h1>
        <p className="text-gray-700 dark:text-gray-300 mb-6">
          {message || (isEmailConfirmation 
            ? 'We\'ve sent you a confirmation email. Please check your inbox and click the link to complete your registration.'
            : 'Your action was successful.'
          )}
        </p>
        <div className="space-y-3">
          <a 
            href="/auth?mode=signin"
            className="block w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Go to Sign In
          </a>
          <a 
            href="/"
            className="block w-full px-4 py-2 border border-gray-300 text-gray-700 dark:text-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            Go to Home
          </a>
        </div>
      </div>
    </div>
  );
}

export default function AuthSuccessPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <AuthStatus />
        </Suspense>
    )
}
