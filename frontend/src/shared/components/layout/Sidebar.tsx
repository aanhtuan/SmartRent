import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Building2,
  DoorOpen,
  Users,
  FileText,
  CreditCard,
  Wrench,
  Bot,
  Bell,
  LogOut,
  X,
  Home,
  ShieldCheck,
} from 'lucide-react';
import { cn } from '../../utils/cn';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();
  const isLandlord = user?.role === 'LANDLORD';

  const landlordNavItems = [
    { to: '/landlord/dashboard', label: 'Tổng quan', icon: LayoutDashboard },
    { to: '/landlord/properties', label: 'Nhà trọ', icon: Building2 },
    { to: '/landlord/rooms', label: 'Phòng trọ', icon: DoorOpen },
    { to: '/landlord/tenants', label: 'Khách thuê', icon: Users },
    { to: '/landlord/contracts', label: 'Hợp đồng', icon: FileText },
    { to: '/landlord/payments', label: 'Hóa đơn & Thu phí', icon: CreditCard },
    { to: '/landlord/maintenance', label: 'Yêu cầu sửa chữa', icon: Wrench },
    { to: '/assistant', label: 'Trợ lý AI', icon: Bot },
    { to: '/notifications', label: 'Thông báo', icon: Bell },
  ];

  const tenantNavItems = [
    { to: '/tenant/dashboard', label: 'Tổng quan thuê trọ', icon: Home },
    { to: '/tenant/contracts', label: 'Hợp đồng của tôi', icon: FileText },
    { to: '/tenant/payments', label: 'Hóa đơn của tôi', icon: CreditCard },
    { to: '/tenant/maintenance', label: 'Báo sửa chữa', icon: Wrench },
    { to: '/assistant', label: 'Trợ lý AI', icon: Bot },
    { to: '/notifications', label: 'Thông báo', icon: Bell },
  ];

  const navItems = isLandlord ? landlordNavItems : tenantNavItems;

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-ink/40 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar container */}
      <aside
        className={cn(
          'fixed top-0 bottom-0 left-0 z-50 w-72 bg-surface border-r border-border flex flex-col transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:z-auto',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Brand header */}
        <div className="h-16 px-6 flex items-center justify-between border-b border-border/80">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-control bg-primary flex items-center justify-center text-white shadow-soft">
              <Building2 className="w-5 h-5 text-accent-soft" />
            </div>
            <div>
              <span className="font-bold text-ink text-base tracking-tight">SmartRent</span>
              <span className="block text-[10px] text-ink-muted uppercase font-semibold tracking-wider">
                {isLandlord ? 'Chủ nhà trọ' : 'Khách thuê'}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-control text-ink-muted hover:text-ink lg:hidden"
            aria-label="Đóng menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 px-4 py-5 space-y-1 overflow-y-auto">
          <div className="px-3 pb-2 text-[11px] font-semibold text-ink-muted uppercase tracking-wider">
            Menu chính
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => onClose()}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 px-3.5 py-2.5 rounded-control text-sm font-medium transition-colors duration-150',
                    isActive
                      ? 'bg-primary-soft text-primary-active font-semibold shadow-soft'
                      : 'text-ink-secondary hover:text-ink hover:bg-surface-subtle'
                  )
                }
              >
                <Icon className="w-4 h-4 shrink-0 text-current" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* User profile & logout footer */}
        <div className="p-4 border-t border-border bg-surface-subtle/50">
          <div className="flex items-center justify-between p-2 rounded-control bg-surface border border-border/70 shadow-soft">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-primary-soft text-primary flex items-center justify-center font-bold text-xs shrink-0">
                {user?.email?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-ink truncate" title={user?.email}>
                  {user?.email}
                </p>
                <div className="flex items-center gap-1 text-[10px] text-ink-muted">
                  <ShieldCheck className="w-3 h-3 text-primary" />
                  <span>{isLandlord ? 'LANDLORD' : 'TENANT'}</span>
                </div>
              </div>
            </div>
            <button
              onClick={() => logout()}
              className="p-1.5 text-ink-muted hover:text-status-error hover:bg-status-error-soft rounded-control transition-colors"
              title="Đăng xuất"
              aria-label="Đăng xuất"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
