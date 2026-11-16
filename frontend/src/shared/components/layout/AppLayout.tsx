import React, { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { useAuth } from '../../context/AuthContext';
import { Dialog, Button } from '../ui';
import { AlertCircle } from 'lucide-react';

export const AppLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { isSessionExpired, dismissSessionExpired } = useAuth();
  const navigate = useNavigate();

  const handleReLogin = () => {
    dismissSessionExpired();
    navigate('/login', { replace: true });
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar navigation */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main column */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <Header onMenuToggle={() => setSidebarOpen(true)} />

        {/* Scrollable content area */}
        <main className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Session Expired Reauthentication Dialog */}
      <Dialog
        isOpen={isSessionExpired}
        onClose={handleReLogin}
        title="Phiên đăng nhập đã hết hạn"
        maxWidth="sm"
      >
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-3 bg-status-warning-soft border border-status-warning-border rounded-control text-status-warning">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <p className="text-xs font-medium text-ink">
              Mã xác thực JWT 30 phút đã hết hạn để đảm bảo an toàn. Vui lòng đăng nhập lại để tiếp tục sử dụng.
            </p>
          </div>
          <Button variant="primary" className="w-full" onClick={handleReLogin}>
            Đăng nhập lại
          </Button>
        </div>
      </Dialog>
    </div>
  );
};
