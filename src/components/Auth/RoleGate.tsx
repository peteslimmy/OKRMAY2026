import React from 'react';
import { UserRole } from '../../types';

interface RoleGateProps {
  allowedRoles: UserRole[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const RoleGate: React.FC<RoleGateProps> = ({ allowedRoles, children, fallback = null }) => {
  const userRole = localStorage.getItem('4CORE_current_user_role') as UserRole | null;
  
  if (!userRole || !allowedRoles.includes(userRole)) {
    return <>{fallback}</>;
  }
  
  return <>{children}</>;
};