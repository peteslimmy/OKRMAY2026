import { useMemo, useCallback } from 'react';
import { User, UserRole, Permission } from '../types';
import { ROLE_PERMISSIONS } from '../types';

export interface UsePermissionsReturn {
  role: UserRole | undefined;
  permissions: Permission[];
  hasPermission: (permission: Permission) => boolean;
  isSuperAdmin: boolean;
  isAdmin: boolean;
  isDirector: boolean;
  isManager: boolean;
  canManageObjectives: boolean;
  canManageUsers: boolean;
  canManageUnits: boolean;
  canViewSettings: boolean;
  canBypassGovernance: boolean;
  canConfigureGovernance: boolean;
}

const isRoleIn = (role: UserRole | undefined, allowed: UserRole[]): boolean => {
  return role ? allowed.includes(role) : false;
};

export const usePermissions = (user: User | null): UsePermissionsReturn => {
  const role = user?.role;
  const permissions = useMemo(() => {
    if (!role) return [];
    return ROLE_PERMISSIONS[role] ?? [];
  }, [role]);

  const hasPermission = useCallback((permission: Permission): boolean => {
    return permissions.includes(permission);
  }, [permissions]);

  return {
    role,
    permissions,
    hasPermission,
    isSuperAdmin: role === UserRole.SuperAdmin,
    isAdmin: role === UserRole.Admin,
    isDirector: role === UserRole.Director,
    isManager: role === UserRole.Manager,
    canManageObjectives: isRoleIn(role, [UserRole.SuperAdmin, UserRole.Admin, UserRole.Director]),
    canManageUsers: isRoleIn(role, [UserRole.SuperAdmin, UserRole.Admin]),
    canManageUnits: isRoleIn(role, [UserRole.SuperAdmin, UserRole.Admin]),
    canViewSettings: isRoleIn(role, [UserRole.SuperAdmin, UserRole.Admin]),
    canBypassGovernance: hasPermission(Permission.GOVERNANCE_BYPASS),
    canConfigureGovernance: hasPermission(Permission.GOVERNANCE_CONFIG),
  };
};