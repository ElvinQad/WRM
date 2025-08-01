'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { SignInForm } from '../../../components/auth/SignInForm.tsx';
import { ProtectedRoute } from '../../../components/auth/ProtectedRoute.tsx';
import { getReturnUrl } from '../../../utils/auth-helpers.ts';
import { Suspense } from 'react';

function SignInContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleSignInSuccess = () => {
    router.push(getReturnUrl(searchParams));
  };

  return (
    <ProtectedRoute requireAuth={false}>
      <div className="flex flex-col items-center justify-center min-h-screen bg-white dark:bg-gray-900" style={{minHeight: '100vh', backgroundColor: '#1f2937', color: 'white'}}>
        <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md w-full max-w-md" style={{backgroundColor: '#374151', padding: '2rem', borderRadius: '0.5rem', maxWidth: '24rem'}}>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center" style={{fontSize: '1.5rem', fontWeight: 'bold', color: 'white', marginBottom: '1.5rem', textAlign: 'center'}}>
            Sign In
          </h1>
          <SignInForm onSuccess={handleSignInSuccess} />
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400" style={{fontSize: '0.875rem', color: '#9ca3af', textAlign: 'center', marginTop: '1rem'}}>
              Don't have an account?{' '}
              <a 
                href="/auth/signup" 
                className="text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
                style={{color: '#60a5fa'}}
              >
                Sign up
              </a>
            </p>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}

export default function SignInPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    }>
      <SignInContent />
    </Suspense>
  );
}
