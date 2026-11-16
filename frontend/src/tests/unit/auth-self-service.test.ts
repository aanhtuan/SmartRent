import { describe, it, expect, vi, beforeEach } from 'vitest';
import { apiClient } from '../../shared/api/client';
import { authApi } from '../../shared/api/authApi';
import { LoginResponse, UserProfile } from '../../shared/types';

vi.mock('../../shared/api/client', () => ({
  apiClient: vi.fn(),
}));

describe('Auth Self-Service API Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('registers new user and receives auth token and profile', async () => {
    const mockLoginResponse: LoginResponse = {
      access_token: 'fake-jwt-register',
      token_type: 'Bearer',
      user: {
        id: 'usr-123',
        email: 'tenant.new@smartrent.test',
        role: 'TENANT',
      },
    };

    vi.mocked(apiClient).mockResolvedValueOnce(mockLoginResponse);

    const result = await authApi.register({
      email: 'tenant.new@smartrent.test',
      password: 'password123',
      role: 'TENANT',
      full_name: 'Tran Thi B',
      phone_number: '0987654321',
    });

    expect(apiClient).toHaveBeenCalledWith('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        email: 'tenant.new@smartrent.test',
        password: 'password123',
        role: 'TENANT',
        full_name: 'Tran Thi B',
        phone_number: '0987654321',
      }),
    });
    expect(result.access_token).toBe('fake-jwt-register');
    expect(result.user.email).toBe('tenant.new@smartrent.test');
  });

  it('requests password reset token via email', async () => {
    vi.mocked(apiClient).mockResolvedValueOnce({
      message: 'Mã đặt lại mật khẩu đã được tạo',
      reset_token: 'tok-abc-123',
    });

    const res = await authApi.forgotPassword({ email: 'user@smartrent.test' });

    expect(apiClient).toHaveBeenCalledWith('/api/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email: 'user@smartrent.test' }),
    });
    expect(res.reset_token).toBe('tok-abc-123');
  });

  it('resets password with token and new password', async () => {
    vi.mocked(apiClient).mockResolvedValueOnce(undefined);

    await authApi.resetPassword({
      token: 'tok-abc-123',
      new_password: 'newSecretPassword456',
    });

    expect(apiClient).toHaveBeenCalledWith('/api/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({
        token: 'tok-abc-123',
        new_password: 'newSecretPassword456',
      }),
    });
  });

  it('updates profile and changes password for authenticated user', async () => {
    const mockProfile: UserProfile = {
      id: 'usr-123',
      email: 'user@smartrent.test',
      role: 'TENANT',
      full_name: 'Tran Thi B Updated',
      phone_number: '0987654322',
    };

    vi.mocked(apiClient).mockResolvedValueOnce(mockProfile);

    const updated = await authApi.updateProfile({
      full_name: 'Tran Thi B Updated',
      phone_number: '0987654322',
    });

    expect(apiClient).toHaveBeenCalledWith('/api/users/profile', {
      method: 'PUT',
      body: JSON.stringify({
        full_name: 'Tran Thi B Updated',
        phone_number: '0987654322',
      }),
    });
    expect(updated.full_name).toBe('Tran Thi B Updated');

    vi.mocked(apiClient).mockResolvedValueOnce(undefined);

    await authApi.changePassword({
      current_password: 'oldPassword123',
      new_password: 'brandNewPassword789',
    });

    expect(apiClient).toHaveBeenCalledWith('/api/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({
        current_password: 'oldPassword123',
        new_password: 'brandNewPassword789',
      }),
    });
  });
});
