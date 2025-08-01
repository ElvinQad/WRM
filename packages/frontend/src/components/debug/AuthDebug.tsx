import React from 'react';
import { useAuth } from '../../hooks/use-auth.ts';

export const AuthDebug: React.FC = () => {
  const { user, isAuthenticated, accessToken, error, isLoading } = useAuth();

  if (process.env.NODE_ENV === 'production') {
    return null; // Don't show in production
  }

  return (
    <div className="fixed top-4 right-4 bg-gray-800 text-white p-4 rounded-lg shadow-lg max-w-md z-50">
      <h3 className="text-lg font-bold mb-2">🔍 Auth Debug</h3>
      
      <div className="space-y-2 text-sm">
        <div>
          <span className="font-semibold">Authenticated:</span> 
          <span className={isAuthenticated ? 'text-green-400' : 'text-red-400'}>
            {isAuthenticated ? ' ✅ Yes' : ' ❌ No'}
          </span>
        </div>
        
        <div>
          <span className="font-semibold">Loading:</span> 
          <span className={isLoading ? 'text-yellow-400' : 'text-gray-400'}>
            {isLoading ? ' ⏳ Yes' : ' ✅ No'}
          </span>
        </div>
        
        <div>
          <span className="font-semibold">User ID:</span> 
          <span className="text-blue-400">
            {user?.id ? ` ${user.id.slice(0, 8)}...` : ' None'}
          </span>
        </div>
        
        <div>
          <span className="font-semibold">Email:</span> 
          <span className="text-blue-400">
            {user?.email || ' None'}
          </span>
        </div>
        
        <div>
          <span className="font-semibold">Token:</span> 
          <span className={accessToken ? 'text-green-400' : 'text-red-400'}>
            {accessToken ? ` ✅ Present (${accessToken.slice(0, 10)}...)` : ' ❌ Missing'}
          </span>
        </div>
        
        {error && (
          <div>
            <span className="font-semibold">Error:</span> 
            <span className="text-red-400"> {error}</span>
          </div>
        )}
      </div>
    </div>
  );
};
