import React, { useState } from 'react';
import { Menu, Bell, User as UserIcon } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { notificationApi } from '../../api';
import { Link } from 'react-router-dom';
import { ProfileModal } from '../../../features/auth/ProfileModal';
import { useNotificationsStream, StreamNotification } from '../../hooks/useNotificationsStream';

interface HeaderProps {
  onMenuToggle: () => void;
  title?: string;
  subtitle?: string;
}

export const Header: React.FC<HeaderProps> = ({ onMenuToggle, title, subtitle }) => {
  const { user } = useAuth();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [liveAlert, setLiveAlert] = useState<string | null>(null);

  // Real-time SSE listener
  useNotificationsStream((notification: StreamNotification) => {
    setLiveAlert(notification.message || 'Bạn vừa nhận được một thông báo mới từ hệ thống.');
    setTimeout(() => {
      setLiveAlert(null);
    }, 5000);
  });

  // Query unread notifications
  const { data: notificationsData } = useQuery({
    queryKey: ['notifications', 'unread', user?.id],
    queryFn: () => notificationApi.list({ unread: true, page: 1, page_size: 10 }),
    enabled: !!user,
    staleTime: 30000,
  });

  const unreadCount = notificationsData?.items?.length ?? 0;

  return (
    <>
      <header className="h-16 bg-surface/90 backdrop-blur-md border-b border-border px-4 sm:px-6 lg:px-8 flex items-center justify-between sticky top-0 z-30 transition-all">
        <div className="flex items-center gap-3">
          <button
            onClick={onMenuToggle}
            className="p-2 -ml-2 rounded-control text-ink-muted hover:text-ink hover:bg-surface-subtle lg:hidden transition-colors"
            aria-label="Mở menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          {title && (
            <div>
              <h1 className="text-base sm:text-lg font-semibold text-ink tracking-tight flex items-center gap-2">
                {title}
              </h1>
              {subtitle && <p className="hidden sm:block text-xs text-ink-secondary">{subtitle}</p>}
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          {/* Notification bell */}
          <Link
            to="/notifications"
            className="relative p-2 rounded-control text-ink-muted hover:text-ink hover:bg-surface-subtle transition-colors"
            aria-label="Thông báo"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 flex h-4 min-w-[16px] px-1 items-center justify-center rounded-full bg-status-error text-[10px] font-bold text-white leading-none">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </Link>

          {/* User profile button */}
          <button
            type="button"
            onClick={() => setIsProfileOpen(true)}
            className="hidden sm:flex items-center gap-2 pl-2 border-l border-border hover:opacity-80 transition-opacity cursor-pointer"
            title="Xem hồ sơ & Đổi mật khẩu"
          >
            <div className="w-7 h-7 rounded-full bg-surface-subtle border border-border flex items-center justify-center text-ink-secondary">
              <UserIcon className="w-3.5 h-3.5" />
            </div>
            <span className="text-xs font-medium text-ink truncate max-w-[140px]">{user?.email}</span>
          </button>
        </div>
      </header>

      {/* Real-time SSE alert banner */}
      {liveAlert && (
        <div className="fixed top-20 right-6 z-50 bg-primary text-white text-xs px-4 py-2.5 rounded-xl shadow-lg flex items-center gap-2 border border-primary/20 animate-in slide-in-from-top-2 duration-200">
          <Bell className="w-3.5 h-3.5 text-accent" />
          <span>{liveAlert}</span>
        </div>
      )}

      <ProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
      />
    </>
  );
};
