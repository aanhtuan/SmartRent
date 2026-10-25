import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/shared/context/AuthContext';
import { LoginPage } from '@/features/auth/LoginPage';
import { authApi } from '@/shared/api';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useLocation: () => ({ state: null }),
  };
});

describe('LoginPage', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient();
    vi.restoreAllMocks();
    mockNavigate.mockReset();
  });

  const renderComponent = () =>
    render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <AuthProvider>
            <LoginPage />
          </AuthProvider>
        </BrowserRouter>
      </QueryClientProvider>
    );

  it('renders login form with title and inputs', () => {
    renderComponent();
    expect(screen.getByText('SmartRent')).toBeInTheDocument();
    expect(screen.getByText('Đăng nhập tài khoản')).toBeInTheDocument();
    expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^Mật khẩu/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Đăng nhập/i })).toBeInTheDocument();
  });

  it('prefills only the synthetic email and clears passwords when switching accounts', () => {
    renderComponent();
    const landlordDemoBtn = screen.getByRole('button', { name: /Chủ trọ mẫu/i });
    fireEvent.click(landlordDemoBtn);

    const emailInput = screen.getByLabelText(/Email/i) as HTMLInputElement;
    expect(emailInput.value).toBe('landlord.one@smartrent.test');
    const passwordInput = screen.getByLabelText(/^Mật khẩu/i) as HTMLInputElement;
    expect(passwordInput.value).toBe('');
    fireEvent.change(passwordInput, { target: { value: 'synthetic-unit-fixture' } });
    fireEvent.click(screen.getByRole('button', { name: /Khách thuê mẫu/i }));
    expect(emailInput.value).toBe('tenant.one@smartrent.test');
    expect(passwordInput.value).toBe('');
  });

  it('submits credentials and redirects to landlord dashboard on success', async () => {
    vi.spyOn(authApi, 'login').mockResolvedValue({
      access_token: 'fake-token',
      token_type: 'Bearer',
      user: {
        id: '123',
        email: 'landlord.one@smartrent.test',
        role: 'LANDLORD',
      },
    });

    renderComponent();
    fireEvent.click(screen.getByRole('button', { name: /Chủ trọ mẫu/i }));
    fireEvent.change(screen.getByLabelText(/^Mật khẩu/i), {
      target: { value: 'synthetic-unit-fixture' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Đăng nhập/i }));

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/landlord/dashboard', { replace: true });
    });
  });
});
