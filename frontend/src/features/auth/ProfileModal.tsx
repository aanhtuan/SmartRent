import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { authApi } from '../../shared/api';
import { Dialog, Button, Input, Skeleton } from '../../shared/components/ui';
import { User, KeyRound, Check } from 'lucide-react';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose }) => {
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<'INFO' | 'PASSWORD'>('INFO');

  // Profile form
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [profileMsg, setProfileMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(
    null
  );

  // Password form
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwdMsg, setPwdMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const { data: profile, isLoading } = useQuery({
    queryKey: ['user-profile'],
    queryFn: () => authApi.getProfile(),
    enabled: isOpen,
  });

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || '');
      setPhoneNumber(profile.phone_number || '');
    }
  }, [profile]);

  const updateProfileMutation = useMutation({
    mutationFn: () =>
      authApi.updateProfile({
        full_name: fullName.trim() || undefined,
        phone_number: phoneNumber.trim() || undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-profile'] });
      setProfileMsg({ type: 'success', text: 'Cập nhật hồ sơ thành công!' });
    },
    onError: (err: any) => {
      setProfileMsg({ type: 'error', text: err.message || 'Lỗi khi cập nhật hồ sơ.' });
    },
  });

  const changePasswordMutation = useMutation({
    mutationFn: () =>
      authApi.changePassword({
        current_password: currentPassword,
        new_password: newPassword,
      }),
    onSuccess: () => {
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setPwdMsg({ type: 'success', text: 'Đổi mật khẩu thành công!' });
    },
    onError: (err: any) => {
      setPwdMsg({
        type: 'error',
        text: err.message || 'Mật khẩu hiện tại không đúng hoặc không hợp lệ.',
      });
    },
  });

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setProfileMsg(null);
    updateProfileMutation.mutate();
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPwdMsg(null);
    if (newPassword.length < 6) {
      setPwdMsg({ type: 'error', text: 'Mật khẩu mới phải có ít nhất 6 ký tự.' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPwdMsg({ type: 'error', text: 'Mật khẩu xác nhận không khớp.' });
      return;
    }
    changePasswordMutation.mutate();
  };

  return (
    <Dialog isOpen={isOpen} onClose={onClose} title="Hồ sơ & Tài khoản" maxWidth="md">
      <div className="space-y-4">
        {/* Tab switcher */}
        <div className="flex border-b border-border">
          <button
            type="button"
            className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold border-b-2 transition-colors ${
              tab === 'INFO'
                ? 'border-primary text-primary'
                : 'border-transparent text-ink-secondary hover:text-ink'
            }`}
            onClick={() => setTab('INFO')}
          >
            <User className="w-3.5 h-3.5" />
            <span>Thông tin cá nhân</span>
          </button>
          <button
            type="button"
            className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold border-b-2 transition-colors ${
              tab === 'PASSWORD'
                ? 'border-primary text-primary'
                : 'border-transparent text-ink-secondary hover:text-ink'
            }`}
            onClick={() => setTab('PASSWORD')}
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>Đổi mật khẩu</span>
          </button>
        </div>

        {/* Tab 1: Profile Info */}
        {tab === 'INFO' && (
          <div>
            {isLoading ? (
              <Skeleton className="h-40 w-full" />
            ) : (
              <form onSubmit={handleProfileSubmit} className="space-y-3">
                {profileMsg && (
                  <div
                    className={`p-2.5 text-xs rounded-lg border ${
                      profileMsg.type === 'success'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-red-50 text-red-600 border-red-200'
                    }`}
                  >
                    {profileMsg.text}
                  </div>
                )}

                <div className="p-3 bg-surface-subtle border border-border rounded-lg text-xs space-y-1">
                  <div className="text-ink-secondary">
                    Email đăng nhập: <strong className="text-ink">{profile?.email}</strong>
                  </div>
                  <div className="text-ink-secondary">
                    Vai trò tài khoản:{' '}
                    <strong className="text-primary">
                      {profile?.role === 'LANDLORD' ? 'Chủ nhà / Quản lý' : 'Khách thuê phòng'}
                    </strong>
                  </div>
                </div>

                <Input
                  label="Họ và tên"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Nhập họ tên của bạn"
                />

                <Input
                  label="Số điện thoại"
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="0912 345 678"
                />

                <div className="flex justify-end gap-2 pt-2 border-t border-border">
                  <Button type="button" size="sm" variant="ghost" onClick={onClose}>
                    Đóng
                  </Button>
                  <Button
                    type="submit"
                    size="sm"
                    variant="primary"
                    isLoading={updateProfileMutation.isPending}
                    leftIcon={<Check className="w-3.5 h-3.5" />}
                  >
                    Lưu thông tin
                  </Button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* Tab 2: Change Password */}
        {tab === 'PASSWORD' && (
          <form onSubmit={handlePasswordSubmit} className="space-y-3">
            {pwdMsg && (
              <div
                className={`p-2.5 text-xs rounded-lg border ${
                  pwdMsg.type === 'success'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-red-50 text-red-600 border-red-200'
                }`}
              >
                {pwdMsg.text}
              </div>
            )}

            <Input
              label="Mật khẩu hiện tại"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Nhập mật khẩu đang dùng"
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

            <div className="flex justify-end gap-2 pt-2 border-t border-border">
              <Button type="button" size="sm" variant="ghost" onClick={onClose}>
                Đóng
              </Button>
              <Button
                type="submit"
                size="sm"
                variant="primary"
                isLoading={changePasswordMutation.isPending}
              >
                Đổi mật khẩu
              </Button>
            </div>
          </form>
        )}
      </div>
    </Dialog>
  );
};
