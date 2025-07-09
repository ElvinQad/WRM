'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function AuthStatus() {
  const searchParams = useSearchParams();
  const message = searchParams.get('message');

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md w-full max-w-md text-center">
        <h1 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-4">Error</h1>
        <p className="text-gray-700 dark:text-gray-300">{message || 'An unexpected error occurred.'}</p>
      </div>
    </div>
  );
}

export default function AuthErrorPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <AuthStatus />
        </Suspense>
    )
}
