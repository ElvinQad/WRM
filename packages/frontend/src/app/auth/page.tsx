'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { UnifiedAuthForm } from '../../components/auth/UnifiedAuthForm.tsx';
import { ProtectedRoute } from '../../components/auth/ProtectedRoute.tsx';
import { getReturnUrl } from '../../utils/auth-helpers.ts';
import { Suspense } from 'react';

function AuthContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Check if we should default to signup mode
  const mode = searchParams.get('mode') as 'signin' | 'signup' || 'signin';

  const handleAuthSuccess = () => {
    router.push(getReturnUrl(searchParams));
  };

  return (
    <ProtectedRoute requireAuth={false}>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          {/* Header */}
          <div className="text-center">
            <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-gradient-to-r from-blue-600 to-purple-600">
              <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h2 className="mt-6 text-3xl font-bold text-gray-900 dark:text-white">
              Welcome to WRM
            </h2>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Access your account or create a new one
            </p>
          </div>

          {/* Auth Form Container */}
          <div className="bg-white dark:bg-gray-800 py-8 px-6 shadow-xl rounded-xl border border-gray-200 dark:border-gray-700">
            <UnifiedAuthForm 
              onSuccess={handleAuthSuccess} 
              defaultMode={mode}
            />
          </div>

          {/* Footer */}
          <div className="text-center">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              By continuing, you agree to our{' '}
              <a href="#" className="text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300">
                Terms of Service
              </a>{' '}
              and{' '}
              <a href="#" className="text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300">
                Privacy Policy
              </a>
            </p>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}

export default function AuthPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    }>
      <AuthContent />
    </Suspense>
  );
}
