'use client';

import React from 'react';
import { useAuth } from '../../hooks/use-auth.ts';
import { LogoutButton } from '../auth/LogoutButton.tsx';
import { usePathname } from 'next/navigation';

interface AuthenticatedLayoutProps {
  children: React.ReactNode;
}

export const AuthenticatedLayout: React.FC<AuthenticatedLayoutProps> = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const pathname = usePathname();
  
  // Allow auth pages to render without the authenticated layout
  const isAuthPage = pathname?.startsWith('/auth/');
  
  // For auth pages, just render children without the nav
  if (isAuthPage) {
    return <>{children}</>;
  }

  // For non-auth pages, always render children (let ProtectedRoute handle auth logic)
  // But only show the nav bar if user is authenticated
  if (!isAuthenticated) {
    return <>{children}</>;
  }

  return (
    <>
      <nav className="flex items-center justify-between px-6 py-4 bg-card shadow-md flex-shrink-0 border-b border-border">
        <div className="flex items-center gap-4">
          {/* Home Icon */}
          <a href="/" aria-label="Home" className="hover:bg-accent rounded-full p-2 transition">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-7 h-7 text-primary">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l9-9 9 9M4.5 10.5V21h15V10.5" />
            </svg>
          </a>
          <span className="text-xl font-semibold text-foreground">WRM Timeline</span>
        </div>
        
        {/* User Profile and Actions */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              Hi, {user?.email?.split('@')[0] || 'User'}
            </span>
            <img
              src="https://randomuser.me/api/portraits/men/32.jpg"
              alt="User Avatar"
              width={40}
              height={40}
              className="w-10 h-10 rounded-full border-2 border-primary shadow-sm object-cover"
            />
          </div>
          
          <LogoutButton 
            className="px-3 py-1 text-xs"
          >
            Sign Out
          </LogoutButton>
        </div>
      </nav>
      
      <main className="flex-1 overflow-hidden">
        {children}
      </main>
    </>
  );
};
