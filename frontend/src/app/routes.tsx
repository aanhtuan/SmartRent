import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../shared/context/AuthContext';
import { ProtectedRoute } from '../shared/components/routing/ProtectedRoute';
import { RoleGuard } from '../shared/components/routing/RoleGuard';
import { AppLayout } from '../shared/components/layout/AppLayout';

// Features
import { LoginPage } from '../features/auth/LoginPage';
import { RegisterPage } from '../features/auth/RegisterPage';
import { LandlordDashboard } from '../features/dashboard/LandlordDashboard';
import { TenantDashboard } from '../features/dashboard/TenantDashboard';
import { PropertyList } from '../features/properties/PropertyList';
import { PropertyDetail } from '../features/properties/PropertyDetail';
import { RoomList } from '../features/rooms/RoomList';
import { TenantList } from '../features/tenants/TenantList';
import { ContractList } from '../features/contracts/ContractList';
import { TenantContracts } from '../features/contracts/TenantContracts';
import { PaymentList } from '../features/payments/PaymentList';
import { TenantPayments } from '../features/payments/TenantPayments';
import { MaintenanceList } from '../features/maintenance/MaintenanceList';
import { TenantMaintenance } from '../features/maintenance/TenantMaintenance';
import { NotificationsPage } from '../features/notifications/NotificationsPage';
import { AssistantPage } from '../features/assistant/AssistantPage';
import { Button } from '../shared/components/ui';
import { Link } from 'react-router-dom';

const RootRedirect: React.FC = () => {
  const { isAuthenticated, user } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user?.role === 'LANDLORD') return <Navigate to="/landlord/dashboard" replace />;
  return <Navigate to="/tenant/dashboard" replace />;
};

const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
      <div className="w-16 h-16 rounded-2xl bg-surface border border-border flex items-center justify-center text-primary text-2xl font-bold mb-4 shadow-soft">
        404
      </div>
      <h1 className="text-xl font-bold text-ink">Không tìm thấy trang</h1>
      <p className="text-xs text-ink-secondary mt-1.5 max-w-sm mb-6">
        Trang bạn đang tìm kiếm không tồn tại hoặc bạn không có quyền truy cập.
      </p>
      <Link to="/">
        <Button variant="primary">Trở về trang chủ</Button>
      </Link>
    </div>
  );
};

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/" element={<RootRedirect />} />

      {/* Authenticated routes */}
      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        {/* Landlord-only routes */}
        <Route
          path="/landlord/dashboard"
          element={
            <RoleGuard allowedRole="LANDLORD">
              <LandlordDashboard />
            </RoleGuard>
          }
        />
        <Route
          path="/landlord/properties"
          element={
            <RoleGuard allowedRole="LANDLORD">
              <PropertyList />
            </RoleGuard>
          }
        />
        <Route
          path="/landlord/properties/:id"
          element={
            <RoleGuard allowedRole="LANDLORD">
              <PropertyDetail />
            </RoleGuard>
          }
        />
        <Route
          path="/landlord/rooms"
          element={
            <RoleGuard allowedRole="LANDLORD">
              <RoomList />
            </RoleGuard>
          }
        />
        <Route
          path="/landlord/tenants"
          element={
            <RoleGuard allowedRole="LANDLORD">
              <TenantList />
            </RoleGuard>
          }
        />
        <Route
          path="/landlord/contracts"
          element={
            <RoleGuard allowedRole="LANDLORD">
              <ContractList />
            </RoleGuard>
          }
        />
        <Route
          path="/landlord/payments"
          element={
            <RoleGuard allowedRole="LANDLORD">
              <PaymentList />
            </RoleGuard>
          }
        />
        <Route
          path="/landlord/maintenance"
          element={
            <RoleGuard allowedRole="LANDLORD">
              <MaintenanceList />
            </RoleGuard>
          }
        />

        {/* Tenant-only routes */}
        <Route
          path="/tenant/dashboard"
          element={
            <RoleGuard allowedRole="TENANT">
              <TenantDashboard />
            </RoleGuard>
          }
        />
        <Route
          path="/tenant/contracts"
          element={
            <RoleGuard allowedRole="TENANT">
              <TenantContracts />
            </RoleGuard>
          }
        />
        <Route
          path="/tenant/payments"
          element={
            <RoleGuard allowedRole="TENANT">
              <TenantPayments />
            </RoleGuard>
          }
        />
        <Route
          path="/tenant/maintenance"
          element={
            <RoleGuard allowedRole="TENANT">
              <TenantMaintenance />
            </RoleGuard>
          }
        />

        {/* Shared Authenticated routes */}
        <Route path="/notifications" element={<NotificationsPage />} />
        <Route path="/assistant" element={<AssistantPage />} />
      </Route>

      {/* Catch-all */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};
