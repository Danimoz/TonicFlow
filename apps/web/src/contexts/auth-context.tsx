'use client';

import React, { createContext, useContext, useState } from 'react';
import { refreshTokens } from '@/app/(auth)/actions';

interface User {
  id: string;
  email: string;
  fullName: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: User | null;
  refreshAuth: () => Promise<void>;
}

interface AuthProviderProps {
  children: React.ReactNode;
  initialAuthState: {
    isAuthenticated: boolean;
    user: User | null;
  };
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children, initialAuthState }: AuthProviderProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(initialAuthState.isAuthenticated);
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState<User | null>(initialAuthState.user);

  const refreshAuth = async () => {
    try {
      setIsLoading(true);

      const newTokens = await refreshTokens();

      if (newTokens) {
        // Server action will update cookies, we just need to trigger a page refresh
        // or handle the state update via server action response
        window.location.reload();
      } else {
        // Refresh failed, user is logged out
        setIsAuthenticated(false);
        setUser(null);
      }
    } catch (error) {
      console.error('Error refreshing auth:', error);
      setIsAuthenticated(false);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isLoading,
        user,
        refreshAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
}