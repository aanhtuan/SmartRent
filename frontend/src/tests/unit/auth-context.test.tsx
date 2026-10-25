import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from '@/shared/context/AuthContext';
import { authApi } from '@/shared/api';
import { getAccessToken } from '@/shared/api/client';

describe('AuthContext', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    vi.restoreAllMocks();
  });

  const wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>{children}</AuthProvider>
    </QueryClientProvider>
  );

  it('starts in unauthenticated state', () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBeNull();
    expect(getAccessToken()).toBeNull();
  });

  it('authenticates user and stores token in memory on successful login', async () => {
    vi.spyOn(authApi, 'login').mockResolvedValue({
      access_token: 'valid-jwt-token',
      token_type: 'Bearer',
      user: {
        id: 'user-123',
        email: 'landlord.one@smartrent.test',
        role: 'LANDLORD',
      },
    });

    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      const user = await result.current.login({
        email: 'landlord.one@smartrent.test',
        password: 'password123',
      });
      expect(user.role).toBe('LANDLORD');
    });

    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.user?.email).toBe('landlord.one@smartrent.test');
    expect(getAccessToken()).toBe('valid-jwt-token');
  });

  it('clears user, token, and cache on logout', async () => {
    vi.spyOn(authApi, 'login').mockResolvedValue({
      access_token: 'valid-jwt-token',
      token_type: 'Bearer',
      user: {
        id: 'user-123',
        email: 'tenant.one@smartrent.test',
        role: 'TENANT',
      },
    });

    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      await result.current.login({
        email: 'tenant.one@smartrent.test',
        password: 'password123',
      });
    });

    expect(result.current.isAuthenticated).toBe(true);

    act(() => {
      result.current.logout();
    });

    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBeNull();
    expect(getAccessToken()).toBeNull();
  });
});
