/**
 * 4CORE OKR Platform - Permission Utilities
 * Centralized RBAC permission checking
 */

import { UserRole, Permission, ROLE_PERMISSIONS } from '../types';

/**
 * Check if a user role has a specific permission
 */
export const hasPermissionByRole = (userRole: UserRole, permission: Permission): boolean => {
  const permissions = ROLE_PERMISSIONS[userRole] || [];
  return permissions.includes(permission);
};

/**
 * Get all permissions for a specific role
 */
export const getUserPermissions = (userRole: UserRole): Permission[] => {
  return ROLE_PERMISSIONS[userRole] || [];
};

/**
 * Check if user has ALL of the specified permissions
 */
export const hasAllPermissions = (userRole: UserRole, requiredPermissions: Permission[]): boolean => {
  if (requiredPermissions.length === 0) return true;
  return requiredPermissions.every(p => hasPermissionByRole(userRole, p));
};

/**
 * Check if user has ANY of the specified permissions
 */
export const hasAnyPermission = (userRole: UserRole, requiredPermissions: Permission[]): boolean => {
  if (requiredPermissions.length === 0) return true;
  return requiredPermissions.some(p => hasPermissionByRole(userRole, p));
};

/**
 * Check if role can manage objectives (create/edit)
 */
export const canManageObjectives = (role: UserRole): boolean => {
  return [UserRole.SuperAdmin, UserRole.Admin, UserRole.Director].includes(role);
};

/**
 * Check if role can manage users
 */
export const canManageUsers = (role: UserRole): boolean => {
  return [UserRole.SuperAdmin, UserRole.Admin].includes(role);
};

/**
 * Check if role can view settings
 */
export const canViewSettings = (role: UserRole): boolean => {
  return [UserRole.SuperAdmin, UserRole.Admin].includes(role);
};

/**
 * Check if role can manage business units
 */
export const canManageUnits = (role: UserRole): boolean => {
  return [UserRole.SuperAdmin, UserRole.Admin].includes(role);
};

/**
 * Check if role can configure governance
 */
export const canConfigureGovernance = (role: UserRole): boolean => {
  return hasPermissionByRole(role, Permission.GOVERNANCE_CONFIG);
};

/**
 * Check if role can manage finance
 */
export const canManageFinance = (role: UserRole): boolean => {
  return hasPermissionByRole(role, Permission.FINANCE_MANAGE);
};

/**
 * Check if role can view audit logs
 */
export const canViewAuditLogs = (role: UserRole): boolean => {
  return hasPermissionByRole(role, Permission.AUDIT_VIEW);
};

/**
 * Check if role can export audit logs
 */
export const canExportAudit = (role: UserRole): boolean => {
  return hasPermissionByRole(role, Permission.AUDIT_EXPORT);
};

/**
 * Check if role can access integrity checker
 */
export const checkIntegrityAccess = (role: UserRole): boolean => {
  return [UserRole.SuperAdmin, UserRole.Admin, UserRole.Director].includes(role);
};

/**
 * Check if role can view advanced reports
 */
export const canViewAdvancedReports = (role: UserRole): boolean => {
  return hasPermissionByRole(role, Permission.REPORTS_VIEW_ADVANCED);
};

/**
 * Check if role can view executive reports
 */
export const canViewExecutiveReports = (role: UserRole): boolean => {
  return hasPermissionByRole(role, Permission.REPORTS_VIEW_EXECUTIVE);
};

/**
 * Check if role can export reports
 */
export const canExportReports = (role: UserRole): boolean => {
  return hasPermissionByRole(role, Permission.REPORTS_EXPORT);
};

/**
 * Check if role can manage attendance
 */
export const canManageAttendance = (role: UserRole): boolean => {
  return hasPermissionByRole(role, Permission.ATTENDANCE_MANAGE);
};

/**
 * Check if role can edit settings
 */
export const canEditSettings = (role: UserRole): boolean => {
  return hasPermissionByRole(role, Permission.SETTINGS_EDIT);
};

/**
 * Get role display name
 */
export const getRoleDisplayName = (role: UserRole): string => {
  const names: Record<UserRole, string> = {
    [UserRole.SuperAdmin]: 'Super Admin',
    [UserRole.Admin]: 'Administrator',
    [UserRole.Manager]: 'Manager',
    [UserRole.Director]: 'Director',
    [UserRole.BULead]: 'BU Lead',
    [UserRole.Viewer]: 'Viewer'
  };
  return names[role] || role;
};

/**
 * Get role badge color
 */
export const getRoleBadgeColor = (role: UserRole): string => {
  const colors: Record<UserRole, string> = {
    [UserRole.SuperAdmin]: 'bg-purple-100 text-purple-700 border-purple-200',
    [UserRole.Admin]: 'bg-blue-100 text-blue-700 border-blue-200',
    [UserRole.Director]: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    [UserRole.Manager]: 'bg-amber-100 text-amber-700 border-amber-200',
    [UserRole.BULead]: 'bg-cyan-100 text-cyan-700 border-cyan-200',
    [UserRole.Viewer]: 'bg-slate-100 text-slate-600 border-slate-200'
  };
  return colors[role] || 'bg-slate-100 text-slate-600 border-slate-200';
};