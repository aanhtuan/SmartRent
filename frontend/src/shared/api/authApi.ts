import { apiClient } from './client';
import { LoginRequest, LoginResponse, MeResponse } from '../types';

export const authApi = {
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    return apiClient<LoginResponse>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  },

  getMe: async (): Promise<MeResponse> => {
    return apiClient<MeResponse>('/api/users/me', {
      method: 'GET',
    });
  },
};
