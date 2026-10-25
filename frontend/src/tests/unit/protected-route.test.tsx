import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { ProtectedRoute } from '@/shared/components/routing/ProtectedRoute';
import { RoleGuard } from '@/shared/components/routing/RoleGuard';
import * as AuthContextModule from '@/shared/context/AuthContext';

describe('Routing Guards', () => {
  it('redirects unauthenticated users to /login', () => {
    vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({
      isAuthenticated: false,
      user: null,
      isLoading: false,
      isSessionExpired: false,
      login: vi.fn(),
      logout: vi.fn(),
      dismissSessionExpired: vi.fn(),
    });

    render(
      <MemoryRouter initialEntries={['/landlord/dashboard']}>
        <Routes>
          <Route path="/login" element={<div>Trang Đăng Nhập</div>} />
          <Route
            path="/landlord/dashboard"
            element={
              <ProtectedRoute>
                <div>Trang Chủ Nhà</div>
              </ProtectedRoute>
            }
          />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Trang Đăng Nhập')).toBeInTheDocument();
    expect(screen.queryByText('Trang Chủ Nhà')).not.toBeInTheDocument();
  });

  it('renders protected content when user is authenticated', () => {
    vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({
      isAuthenticated: true,
      user: { id: '1', email: 'landlord@test.com', role: 'LANDLORD' },
      isLoading: false,
      isSessionExpired: false,
      login: vi.fn(),
      logout: vi.fn(),
      dismissSessionExpired: vi.fn(),
    });

    render(
      <MemoryRouter initialEntries={['/landlord/dashboard']}>
        <Routes>
          <Route
            path="/landlord/dashboard"
            element={
              <ProtectedRoute>
                <div>Trang Chủ Nhà</div>
              </ProtectedRoute>
            }
          />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Trang Chủ Nhà')).toBeInTheDocument();
  });

  it('RoleGuard redirects user with TENANT role away from LANDLORD dashboard', () => {
    vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({
      isAuthenticated: true,
      user: { id: '2', email: 'tenant@test.com', role: 'TENANT' },
      isLoading: false,
      isSessionExpired: false,
      login: vi.fn(),
      logout: vi.fn(),
      dismissSessionExpired: vi.fn(),
    });

    render(
      <MemoryRouter initialEntries={['/landlord/dashboard']}>
        <Routes>
          <Route path="/tenant/dashboard" element={<div>Trang Khách Thuê</div>} />
          <Route
            path="/landlord/dashboard"
            element={
              <RoleGuard allowedRole="LANDLORD">
                <div>Trang Chủ Nhà</div>
              </RoleGuard>
            }
          />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Trang Khách Thuê')).toBeInTheDocument();
    expect(screen.queryByText('Trang Chủ Nhà')).not.toBeInTheDocument();
  });
});
