import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { AccountRole } from '../../types';

interface RoleGuardProps {
  allowedRole: AccountRole;
  children: React.ReactNode;
}

export const RoleGuard: React.FC<RoleGuardProps> = ({ allowedRole, children }) => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== allowedRole) {
    // Redirect to the user's role dashboard
    const fallbackPath = user.role === 'LANDLORD' ? '/landlord/dashboard' : '/tenant/dashboard';
    return <Navigate to={fallbackPath} replace />;
  }

  return <>{children}</>;
};
