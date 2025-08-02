import React from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../hooks/use-auth.ts';

interface LogoutButtonProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
  className?: string;
  children?: React.ReactNode;
  redirectTo?: string;
}

export const LogoutButton: React.FC<LogoutButtonProps> = ({ 
  onSuccess, 
  onError, 
  className = "",
  children = "Sign Out",
  redirectTo = "/auth?mode=signin"
}) => {
  const { signOut, isLoading } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await signOut();
      // Redirect to sign-in page immediately after successful sign-out
      router.push(redirectTo);
      onSuccess?.();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Sign out failed';
      onError?.(errorMessage);
    }
  };

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={isLoading}
      className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    >
      {isLoading ? 'Signing Out...' : children}
    </button>
  );
};
