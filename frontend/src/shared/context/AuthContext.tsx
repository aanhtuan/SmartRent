import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { User, LoginRequest } from '../types';
import { authApi, setAccessToken, onUnauthorized } from '../api';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isSessionExpired: boolean;
  login: (credentials: LoginRequest) => Promise<User>;
  logout: () => void;
  dismissSessionExpired: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSessionExpired, setIsSessionExpired] = useState<boolean>(false);
  const queryClient = useQueryClient();

  const handleUnauthorized = useCallback(() => {
    setUser(null);
    setAccessToken(null);
    queryClient.clear();
    setIsSessionExpired(true);
  }, [queryClient]);

  useEffect(() => {
    onUnauthorized(handleUnauthorized);
    return () => {
      onUnauthorized(null);
    };
  }, [handleUnauthorized]);

  const login = useCallback(
    async (credentials: LoginRequest): Promise<User> => {
      setIsLoading(true);
      setIsSessionExpired(false);
      try {
        const response = await authApi.login(credentials);
        // Store JWT token strictly in memory
        setAccessToken(response.access_token);
        setUser(response.user);
        queryClient.clear();
        return response.user;
      } finally {
        setIsLoading(false);
      }
    },
    [queryClient]
  );

  const logout = useCallback(() => {
    setUser(null);
    setAccessToken(null);
    queryClient.clear();
    setIsSessionExpired(false);
  }, [queryClient]);

  const dismissSessionExpired = useCallback(() => {
    setIsSessionExpired(false);
  }, []);

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: !!user,
      isLoading,
      isSessionExpired,
      login,
      logout,
      dismissSessionExpired,
    }),
    [user, isLoading, isSessionExpired, login, logout, dismissSessionExpired]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
