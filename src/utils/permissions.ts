/**
 * RBAC Permission Utilities
 * Helper functions for role-based access control
 */

import { UserRole, Permission, ROLE_PERMISSIONS } from '../types';

/**
 * Check if a user role has a specific permission
 */
export const hasPermissionByRole = (userRole: UserRole, permission: Permission): boolean => {
  const permissions = ROLE_PERMISSIONS[userRole];
  return permissions?.includes(permission) ?? false;
};

/**
 * Get all permissions for a user role
 */
export const getUserPermissions = (userRole: UserRole): Permission[] => {
  return ROLE_PERMISSIONS[userRole] ?? [];
};

/**
 * Check if a role has all of the specified permissions
 */
export const hasAllPermissions = (userRole: UserRole, permissions: Permission[]): boolean => {
  return permissions.every(p => hasPermissionByRole(userRole, p));
};

/**
 * Check if a role has any of the specified permissions
 */
export const hasAnyPermission = (userRole: UserRole, permissions: Permission[]): boolean => {
  return permissions.some(p => hasPermissionByRole(userRole, p));
};

/**
 * Get permission groups for display
 */
export const getPermissionGroups = () => ({
  users: [
    Permission.USERS_VIEW,
    Permission.USERS_CREATE,
    Permission.USERS_EDIT,
    Permission.USERS_DELETE,
    Permission.USERS_ASSIGN_ROLE
  ],
  activities: [
    Permission.ACTIVITY_VIEW,
    Permission.ACTIVITY_CREATE,
    Permission.ACTIVITY_EDIT,
    Permission.ACTIVITY_DELETE,
    Permission.ACTIVITY_VIEW_ALL_BU
  ],
  keyResults: [
    Permission.KR_VIEW,
    Permission.KR_CREATE,
    Permission.KR_EDIT,
    Permission.KR_DELETE,
    Permission.KR_OVERRIDE
  ],
  governance: [
    Permission.GOVERNANCE_VIEW,
    Permission.GOVERNANCE_CONFIG,
    Permission.GOVERNANCE_LOCK,
    Permission.GOVERNANCE_BYPASS
  ],
  reports: [
    Permission.REPORTS_VIEW_BASIC,
    Permission.REPORTS_VIEW_ADVANCED,
    Permission.REPORTS_VIEW_EXECUTIVE,
    Permission.REPORTS_EXPORT
  ],
  finance: [
    Permission.FINANCE_VIEW,
    Permission.FINANCE_MANAGE
  ],
  attendance: [
    Permission.ATTENDANCE_VIEW,
    Permission.ATTENDANCE_MANAGE
  ],
  settings: [
    Permission.SETTINGS_VIEW,
    Permission.SETTINGS_EDIT
  ],
  audit: [
    Permission.AUDIT_VIEW,
    Permission.AUDIT_EXPORT
  ],
  system: [
    Permission.SYSTEM_CONFIG,
    Permission.SYSTEM_INTEGRITY
  ]
});
