import { apiClient } from './client';
import {
  LoginRequest,
  LoginResponse,
  MeResponse,
  RegisterRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  ChangePasswordRequest,
  UserProfile,
  UpdateProfileRequest,
} from '../types';

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

  register: async (data: RegisterRequest): Promise<LoginResponse> => {
    return apiClient<LoginResponse>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  forgotPassword: async (
    data: ForgotPasswordRequest
  ): Promise<{ message: string; reset_token?: string }> => {
    return apiClient<{ message: string; reset_token?: string }>('/api/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  resetPassword: async (data: ResetPasswordRequest): Promise<void> => {
    return apiClient<void>('/api/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  changePassword: async (data: ChangePasswordRequest): Promise<void> => {
    return apiClient<void>('/api/auth/change-password', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  getProfile: async (): Promise<UserProfile> => {
    return apiClient<UserProfile>('/api/users/profile', {
      method: 'GET',
    });
  },

  updateProfile: async (data: UpdateProfileRequest): Promise<UserProfile> => {
    return apiClient<UserProfile>('/api/users/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
};
