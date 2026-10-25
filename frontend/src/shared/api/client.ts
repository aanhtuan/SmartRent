import { ApiError, ApiErrorPayload } from '../types/common';

// Memory-only token storage (NEVER written to localStorage/sessionStorage)
let inMemoryAccessToken: string | null = null;
let unauthorizedListener: (() => void) | null = null;

export const setAccessToken = (token: string | null) => {
  inMemoryAccessToken = token;
};

export const getAccessToken = (): string | null => {
  return inMemoryAccessToken;
};

export const onUnauthorized = (listener: (() => void) | null) => {
  unauthorizedListener = listener;
};

export interface RequestOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined | null>;
}

const getBaseUrl = (): string => {
  const envUrl = import.meta.env.VITE_API_BASE_URL;
  if (envUrl) {
    return envUrl.endsWith('/') ? envUrl.slice(0, -1) : envUrl;
  }
  // In development, Vite proxies /api to backend
  return '';
};

export async function apiClient<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { params, headers: customHeaders, ...restOptions } = options;

  let url = `${getBaseUrl()}${path.startsWith('/') ? path : `/${path}`}`;

  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        searchParams.append(key, String(value));
      }
    });
    const queryString = searchParams.toString();
    if (queryString) {
      url += (url.includes('?') ? '&' : '?') + queryString;
    }
  }

  const headers: Record<string, string> = {
    Accept: 'application/json',
    ...(customHeaders as Record<string, string>),
  };

  if (restOptions.body && typeof restOptions.body === 'string' && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  if (inMemoryAccessToken) {
    headers['Authorization'] = `Bearer ${inMemoryAccessToken}`;
  }

  const response = await fetch(url, {
    ...restOptions,
    headers,
  });

  if (response.status === 204) {
    return undefined as unknown as T;
  }

  const contentType = response.headers.get('content-type');
  const isJson = contentType && contentType.includes('application/json');

  if (!response.ok) {
    let errorCode = 'UNKNOWN_ERROR';
    let errorMessage = `Yêu cầu thất bại với mã trạng thái ${response.status}`;

    if (isJson) {
      try {
        const errorData = (await response.json()) as ApiErrorPayload;
        if (errorData?.error) {
          errorCode = errorData.error.code || errorCode;
          errorMessage = errorData.error.message || errorMessage;
        }
      } catch {
        // Fallback to default message
      }
    }

    if (response.status === 401) {
      setAccessToken(null);
      if (unauthorizedListener) {
        unauthorizedListener();
      }
    }

    throw new ApiError(response.status, errorCode, errorMessage);
  }

  if (!isJson) {
    return undefined as unknown as T;
  }

  return response.json() as Promise<T>;
}
