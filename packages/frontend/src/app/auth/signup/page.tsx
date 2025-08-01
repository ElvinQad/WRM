'use client';

import React, { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { SignUpForm } from '../../../components/auth/SignUpForm.tsx';
import { ProtectedRoute } from '../../../components/auth/ProtectedRoute.tsx';
import { getReturnUrl } from '../../../utils/auth-helpers.ts';

function SignUpContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleSignUpSuccess = () => {
    router.push(getReturnUrl(searchParams));
  };

  return (
    <ProtectedRoute requireAuth={false}>
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
        <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md w-full max-w-md">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">
            Sign Up
          </h1>
          <SignUpForm onSuccess={handleSignUpSuccess} />
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Already have an account?{' '}
              <a 
                href="/auth/signin" 
                className="text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
              >
                Sign in
              </a>
            </p>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}

export default function SignUpPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    }>
      <SignUpContent />
    </Suspense>
  );
}
