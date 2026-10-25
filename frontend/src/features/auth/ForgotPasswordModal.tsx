import React, { useState } from 'react';
import { authApi } from '../../shared/api';
import { Dialog, Button, Input } from '../../shared/components/ui';
import { CheckCircle2, ArrowRight } from 'lucide-react';

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ForgotPasswordModal: React.FC<ForgotPasswordModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [step, setStep] = useState<'REQUEST' | 'RESET' | 'SUCCESS'>('REQUEST');
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const resetState = () => {
    setStep('REQUEST');
    setEmail('');
    setToken('');
    setNewPassword('');
    setConfirmPassword('');
    setErrorMsg(null);
    setIsLoading(false);
  };

  const handleRequestToken = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setErrorMsg('Vui lòng nhập địa chỉ email.');
      return;
    }
    setErrorMsg(null);
    setIsLoading(true);

    try {
      const res = await authApi.forgotPassword({ email: email.trim() });
      if (res.reset_token) {
        setToken(res.reset_token);
      }
      setStep('RESET');
    } catch (err: any) {
      setErrorMsg(err.message || 'Không thể tạo yêu cầu đặt lại mật khẩu.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token.trim() || !newPassword) {
      setErrorMsg('Vui lòng điền mã xác nhận và mật khẩu mới.');
      return;
    }
    if (newPassword.length < 6) {
      setErrorMsg('Mật khẩu mới phải có tối thiểu 6 ký tự.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorMsg('Mật khẩu xác nhận không khớp.');
      return;
    }

    setErrorMsg(null);
    setIsLoading(true);

    try {
      await authApi.resetPassword({
        token: token.trim(),
        new_password: newPassword,
      });
      setStep('SUCCESS');
    } catch (err: any) {
      setErrorMsg(err.message || 'Mã xác nhận không hợp lệ hoặc đã hết hạn.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={() => {
        resetState();
        onClose();
      }}
      title="Khôi phục & Đặt lại mật khẩu"
      maxWidth="sm"
    >
      <div className="space-y-4">
        {errorMsg && (
          <div className="p-2.5 text-xs bg-red-50 text-red-600 rounded-lg border border-red-200">
            {errorMsg}
          </div>
        )}

        {step === 'REQUEST' && (
          <form onSubmit={handleRequestToken} className="space-y-3">
            <p className="text-xs text-ink-secondary">
              Nhập địa chỉ email đăng ký tài khoản. Hệ thống sẽ tạo mã xác nhận để bạn đặt lại mật khẩu mới.
            </p>

            <Input
              label="Email tài khoản"
              type="email"
              placeholder="tenban@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
            />

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" size="sm" variant="ghost" onClick={onClose}>
                Hủy
              </Button>
              <Button
                type="submit"
                size="sm"
                variant="primary"
                isLoading={isLoading}
                rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
              >
                Gửi mã xác nhận
              </Button>
            </div>
          </form>
        )}

        {step === 'RESET' && (
          <form onSubmit={handleResetPassword} className="space-y-3">
            <p className="text-xs text-ink-secondary">
              Vui lòng nhập mã xác minh và thiết lập mật khẩu mới (tối thiểu 6 ký tự).
            </p>

            <Input
              label="Mã đặt lại mật khẩu (Token)"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="VD: a1b2c3d4..."
              required
            />

            <Input
              label="Mật khẩu mới"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Tối thiểu 6 ký tự"
              required
            />

            <Input
              label="Xác nhận mật khẩu mới"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Nhập lại mật khẩu mới"
              required
            />

            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => setStep('REQUEST')}
              >
                Quay lại
              </Button>
              <Button
                type="submit"
                size="sm"
                variant="primary"
                isLoading={isLoading}
              >
                Cập nhật mật khẩu
              </Button>
            </div>
          </form>
        )}

        {step === 'SUCCESS' && (
          <div className="text-center py-4 space-y-3">
            <CheckCircle2 className="w-10 h-10 text-status-success mx-auto" />
            <h4 className="text-sm font-semibold text-ink">Đặt lại mật khẩu thành công!</h4>
            <p className="text-xs text-ink-secondary">
              Mật khẩu của bạn đã được cập nhật thành công. Bạn có thể sử dụng mật khẩu mới để đăng nhập ngay bây giờ.
            </p>
            <div className="pt-2">
              <Button
                size="sm"
                variant="primary"
                onClick={() => {
                  resetState();
                  onClose();
                }}
              >
                Đăng nhập lại
              </Button>
            </div>
          </div>
        )}
      </div>
    </Dialog>
  );
};
