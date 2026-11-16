import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../shared/context/AuthContext';
import { authApi } from '../../shared/api';
import { Button, Input, Select } from '../../shared/components/ui';
import { Building2, UserPlus, AlertCircle } from 'lucide-react';
import { AccountRole, ApiError } from '../../shared/types';

export const RegisterPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [role, setRole] = useState<AccountRole>('TENANT');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password || !fullName.trim()) {
      setError('Vui lòng nhập đầy đủ các thông tin bắt buộc.');
      return;
    }

    if (password.length < 6) {
      setError('Mật khẩu phải có tối thiểu 6 ký tự.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp.');
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      await authApi.register({
        email: email.trim(),
        password,
        role,
        full_name: fullName.trim(),
        phone_number: phoneNumber.trim() || undefined,
      });

      // Auto login after registration
      const user = await login({ email: email.trim(), password });
      if (user.role === 'LANDLORD') {
        navigate('/landlord/dashboard', { replace: true });
      } else {
        navigate('/tenant/dashboard', { replace: true });
      }
    } catch (err: any) {
      if (err instanceof ApiError && err.status === 409) {
        setError('Địa chỉ email này đã được sử dụng. Vui lòng đăng nhập hoặc dùng email khác.');
      } else {
        setError(err.message || 'Không thể đăng ký tài khoản. Vui lòng thử lại.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center mb-8">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary text-white shadow-card mb-4">
          <Building2 className="w-8 h-8 text-accent-soft" />
        </div>
        <h2 className="text-3xl font-bold tracking-tight text-ink">Đăng ký tài khoản</h2>
        <p className="mt-2 text-sm text-ink-secondary">
          Tạo tài khoản SmartRent để bắt đầu quản lý hoặc thuê phòng trọ.
        </p>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-surface py-8 px-6 shadow-card rounded-container border border-border sm:px-10">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 bg-status-error-soft text-status-error border border-status-error-border rounded-control text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <Input
              label="Địa chỉ Email"
              type="email"
              placeholder="tenban@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
            />

            <Input
              label="Họ và tên"
              type="text"
              placeholder="Nguyễn Văn A"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />

            <Input
              label="Số điện thoại liên hệ"
              type="tel"
              placeholder="0912 345 678"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
            />

            <Select
              label="Bạn tham gia với vai trò"
              value={role}
              onChange={(e) => setRole(e.target.value as AccountRole)}
              options={[
                { value: 'TENANT', label: 'Khách thuê phòng (Tenant)' },
                { value: 'LANDLORD', label: 'Chủ nhà trọ / Quản lý (Landlord)' },
              ]}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="Mật khẩu"
                type="password"
                placeholder="Ít nhất 6 ký tự"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />

              <Input
                label="Xác nhận mật khẩu"
                type="password"
                placeholder="Nhập lại mật khẩu"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              className="w-full mt-2"
              size="lg"
              isLoading={isSubmitting}
              leftIcon={<UserPlus className="w-4 h-4" />}
            >
              Đăng ký tài khoản
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-border text-center text-xs text-ink-secondary">
            <span>Đã có tài khoản? </span>
            <Link to="/login" className="font-semibold text-primary hover:underline">
              Đăng nhập ngay
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
