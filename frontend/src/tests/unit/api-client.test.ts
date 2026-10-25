import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  apiClient,
  setAccessToken,
  getAccessToken,
  onUnauthorized,
} from '@/shared/api/client';
import { ApiError } from '@/shared/types';

describe('apiClient', () => {
  beforeEach(() => {
    setAccessToken(null);
    onUnauthorized(null);
    vi.restoreAllMocks();
  });

  it('manages access token in memory without using browser storage', () => {
    expect(getAccessToken()).toBeNull();
    setAccessToken('test-jwt-token-xyz');
    expect(getAccessToken()).toBe('test-jwt-token-xyz');
    setAccessToken(null);
    expect(getAccessToken()).toBeNull();
  });

  it('attaches Bearer token in request headers when available', async () => {
    setAccessToken('jwt-secret-token');

    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => ({ success: true }),
    });
    vi.stubGlobal('fetch', fetchMock);

    const result = await apiClient<{ success: boolean }>('/api/properties');
    expect(result).toEqual({ success: true });
    expect(fetchMock).toHaveBeenCalledTimes(1);

    const calledHeaders = fetchMock.mock.calls[0][1].headers;
    expect(calledHeaders['Authorization']).toBe('Bearer jwt-secret-token');
  });

  it('parses backend error envelope and throws ApiError', async () => {
    const errorBody = {
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid request input.',
      },
    };

    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      status: 400,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => errorBody,
    });
    vi.stubGlobal('fetch', fetchMock);

    await expect(apiClient('/api/properties')).rejects.toThrow('Invalid request input.');
    try {
      await apiClient('/api/properties');
    } catch (err: any) {
      expect(err).toBeInstanceOf(ApiError);
      expect(err.status).toBe(400);
      expect(err.code).toBe('VALIDATION_ERROR');
    }
  });

  it('handles 401 by clearing in-memory token and triggering unauthorized listener', async () => {
    setAccessToken('expired-token');
    const unauthorizedSpy = vi.fn();
    onUnauthorized(unauthorizedSpy);

    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      status: 401,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => ({
        error: { code: 'UNAUTHENTICATED', message: 'Authentication required.' },
      }),
    });
    vi.stubGlobal('fetch', fetchMock);

    await expect(apiClient('/api/users/me')).rejects.toThrow('Authentication required.');
    expect(getAccessToken()).toBeNull();
    expect(unauthorizedSpy).toHaveBeenCalledTimes(1);
  });

  it('handles 204 No Content without failing JSON parse', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 204,
      headers: new Headers(),
    });
    vi.stubGlobal('fetch', fetchMock);

    const result = await apiClient<void>('/api/rooms/123', { method: 'DELETE' });
    expect(result).toBeUndefined();
  });
});
