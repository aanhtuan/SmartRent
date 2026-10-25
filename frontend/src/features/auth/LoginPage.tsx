import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../shared/context/AuthContext';
import { Button, Input } from '../../shared/components/ui';
import { Building2, Sparkles, AlertCircle, ArrowRight, CheckCircle2 } from 'lucide-react';
import { ApiError } from '../../shared/types';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as { from?: { pathname: string } })?.from?.pathname;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setError('Vui lòng nhập đầy đủ email và mật khẩu.');
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      const user = await login({ email: email.trim(), password });
      // Redirect to the originally intended page or the role-specific dashboard
      if (from && from !== '/login') {
        navigate(from, { replace: true });
      } else if (user.role === 'LANDLORD') {
        navigate('/landlord/dashboard', { replace: true });
      } else {
        navigate('/tenant/dashboard', { replace: true });
      }
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        if (err.status === 401) {
          setError('Email hoặc mật khẩu không chính xác.');
        } else if (err.status === 429) {
          setError('Bạn đã thử đăng nhập quá nhiều lần. Vui lòng đợi và thử lại sau.');
        } else {
          setError(err.message || 'Đăng nhập thất bại. Vui lòng thử lại.');
        }
      } else {
        setError('Không thể kết nối đến máy chủ. Vui lòng kiểm tra lại mạng.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const fillDemoAccount = (role: 'LANDLORD' | 'TENANT') => {
    if (role === 'LANDLORD') {
      setEmail('landlord.one@smartrent.test');
      setPassword('Landlord@123');
    } else {
      setEmail('tenant.one@smartrent.test');
      setPassword('Tenant@123');
    }
    setError(null);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center mb-8">
        {/* Brand Icon */}
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary text-white shadow-card mb-4">
          <Building2 className="w-8 h-8 text-accent-soft" />
        </div>
        <h2 className="text-3xl font-bold tracking-tight text-ink">SmartRent</h2>
        <p className="mt-2 text-sm text-ink-secondary">
          Hệ thống quản lý thuê trọ thông minh hỗ trợ bởi AI
        </p>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-surface py-8 px-6 sm:px-10 border border-border rounded-container shadow-card">
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-ink">Đăng nhập tài khoản</h3>
            <p className="text-xs text-ink-secondary mt-1">
              Đăng nhập bằng tài khoản quản lý hoặc khách thuê được cấp
            </p>
          </div>

          {error && (
            <div
              className="mb-5 p-3.5 bg-status-error-soft border border-status-error-border rounded-control flex items-start gap-2.5 text-status-error text-xs font-medium"
              role="alert"
            >
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email"
              type="email"
              placeholder="ten@smartrent.test"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              autoFocus
            />

            <Input
              label="Mật khẩu"
              isPassword
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />

            <Button
              type="submit"
              variant="primary"
              className="w-full h-11 text-sm font-semibold mt-2"
              isLoading={isSubmitting}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Đăng nhập
            </Button>
          </form>

          {/* Synthetic Demo Account Helper */}
          <div className="mt-8 pt-6 border-t border-border">
            <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-ink-muted mb-3">
              <Sparkles className="w-3.5 h-3.5 text-accent" />
              <span>Tài khoản thử nghiệm (Môi trường phát triển)</span>
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => fillDemoAccount('LANDLORD')}
                className="flex items-center justify-center gap-1.5 p-2.5 text-xs font-medium text-ink bg-surface-subtle border border-border hover:border-primary/40 hover:bg-primary-soft/30 rounded-control transition-all text-left"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0" />
                <span>Chủ trọ mẫu</span>
              </button>
              <button
                type="button"
                onClick={() => fillDemoAccount('TENANT')}
                className="flex items-center justify-center gap-1.5 p-2.5 text-xs font-medium text-ink bg-surface-subtle border border-border hover:border-accent/40 hover:bg-accent-soft/30 rounded-control transition-all text-left"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-accent shrink-0" />
                <span>Khách thuê mẫu</span>
              </button>
            </div>
          </div>
        </div>

        {/* Security notice footer */}
        <p className="mt-6 text-center text-xs text-ink-muted">
          Bảo mật RS256 JWT • Không lưu trữ mã phiên trên bộ nhớ trình duyệt
        </p>
      </div>
    </div>
  );
};
