/**
 * 4CORE OKR Platform - Type Definitions
 * Central location for all TypeScript types, enums, and interfaces
 */

import type { ReactNode } from 'react';

// ============================================================================
// Authentication & Authorization
// ============================================================================

export enum UserRole {
  SuperAdmin = 'SuperAdmin',
  Admin = 'Admin',
  Manager = 'Manager',
  Director = 'Director',
  Viewer = 'Viewer'
}

export enum UserStatus {
  Active = 'Active',
  Suspended = 'Suspended'
}

export enum TaskStatus {
  Undefined = 'Undefined',
  Done = 'Done',
  NotDone = 'NotDone'
}

export enum AttendanceStatus {
  Present = 'Present',
  Remote = 'Remote',
  Absent = 'Absent',
  Excused = 'Excused'
}

// ============================================================================
// RBAC: Permission Definitions
// ============================================================================

export enum Permission {
  USERS_VIEW = 'USERS_VIEW',
  USERS_CREATE = 'USERS_CREATE',
  USERS_EDIT = 'USERS_EDIT',
  USERS_DELETE = 'USERS_DELETE',
  USERS_ASSIGN_ROLE = 'USERS_ASSIGN_ROLE',
  ACTIVITY_VIEW = 'ACTIVITY_VIEW',
  ACTIVITY_CREATE = 'ACTIVITY_CREATE',
  ACTIVITY_EDIT = 'ACTIVITY_EDIT',
  ACTIVITY_DELETE = 'ACTIVITY_DELETE',
  ACTIVITY_VIEW_ALL_BU = 'ACTIVITY_VIEW_ALL_BU',
  KR_VIEW = 'KR_VIEW',
  KR_CREATE = 'KR_CREATE',
  KR_EDIT = 'KR_EDIT',
  KR_DELETE = 'KR_DELETE',
  KR_OVERRIDE = 'KR_OVERRIDE',
  GOVERNANCE_VIEW = 'GOVERNANCE_VIEW',
  GOVERNANCE_CONFIG = 'GOVERNANCE_CONFIG',
  GOVERNANCE_LOCK = 'GOVERNANCE_LOCK',
  GOVERNANCE_BYPASS = 'GOVERNANCE_BYPASS',
  REPORTS_VIEW_BASIC = 'REPORTS_VIEW_BASIC',
  REPORTS_VIEW_ADVANCED = 'REPORTS_VIEW_ADVANCED',
  REPORTS_VIEW_EXECUTIVE = 'REPORTS_VIEW_EXECUTIVE',
  REPORTS_EXPORT = 'REPORTS_EXPORT',
  FINANCE_VIEW = 'FINANCE_VIEW',
  FINANCE_MANAGE = 'FINANCE_MANAGE',
  ATTENDANCE_VIEW = 'ATTENDANCE_VIEW',
  ATTENDANCE_MANAGE = 'ATTENDANCE_MANAGE',
  SETTINGS_VIEW = 'SETTINGS_VIEW',
  SETTINGS_EDIT = 'SETTINGS_EDIT',
  AUDIT_VIEW = 'AUDIT_VIEW',
  AUDIT_EXPORT = 'AUDIT_EXPORT',
  SYSTEM_CONFIG = 'SYSTEM_CONFIG',
  SYSTEM_INTEGRITY = 'SYSTEM_INTEGRITY'
}

export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  [UserRole.Viewer]: [
    Permission.ACTIVITY_VIEW, Permission.KR_VIEW,
    Permission.GOVERNANCE_VIEW, Permission.REPORTS_VIEW_BASIC
  ],
  [UserRole.Manager]: [
    Permission.ACTIVITY_VIEW, Permission.KR_VIEW, Permission.GOVERNANCE_VIEW,
    Permission.REPORTS_VIEW_BASIC, Permission.ACTIVITY_CREATE, Permission.ACTIVITY_EDIT,
    Permission.REPORTS_VIEW_ADVANCED, Permission.REPORTS_EXPORT, Permission.ATTENDANCE_VIEW
  ],
  [UserRole.Director]: [
    Permission.ACTIVITY_VIEW, Permission.ACTIVITY_CREATE, Permission.ACTIVITY_EDIT,
    Permission.KR_VIEW, Permission.GOVERNANCE_VIEW, Permission.REPORTS_VIEW_BASIC,
    Permission.REPORTS_VIEW_ADVANCED, Permission.REPORTS_EXPORT, Permission.ATTENDANCE_VIEW,
    Permission.ACTIVITY_DELETE, Permission.KR_CREATE, Permission.KR_EDIT,
    Permission.REPORTS_VIEW_EXECUTIVE, Permission.FINANCE_VIEW,
    Permission.ATTENDANCE_MANAGE, Permission.AUDIT_VIEW
  ],
  [UserRole.Admin]: [
    Permission.ACTIVITY_VIEW, Permission.ACTIVITY_CREATE, Permission.ACTIVITY_EDIT,
    Permission.ACTIVITY_DELETE, Permission.KR_VIEW, Permission.KR_CREATE, Permission.KR_EDIT,
    Permission.GOVERNANCE_VIEW, Permission.REPORTS_VIEW_BASIC, Permission.REPORTS_VIEW_ADVANCED,
    Permission.REPORTS_VIEW_EXECUTIVE, Permission.REPORTS_EXPORT, Permission.FINANCE_VIEW,
    Permission.ATTENDANCE_VIEW, Permission.ATTENDANCE_MANAGE, Permission.AUDIT_VIEW,
    Permission.USERS_VIEW, Permission.USERS_CREATE, Permission.USERS_EDIT,
    Permission.GOVERNANCE_CONFIG, Permission.GOVERNANCE_LOCK, Permission.FINANCE_MANAGE,
    Permission.SETTINGS_VIEW, Permission.SETTINGS_EDIT, Permission.AUDIT_EXPORT,
    Permission.SYSTEM_INTEGRITY
  ],
  [UserRole.SuperAdmin]: [...Object.values(Permission)]
};

// ============================================================================
// Core Domain Interfaces
// ============================================================================

export interface User {
  id: string;
  auth_id?: string;
  firstName: string;
  lastName: string;
  name: string;
  email: string;
  role: UserRole;
  department: string;
  avatarUrl: string;
  status: UserStatus;
  mustChangePassword?: boolean;
}

export interface BusinessUnit {
  id: string;
  name: string;
  head_user_id?: string;
  contactEmail?: string;
}

export interface KeyResult {
  id: string;
  title: string;
  description?: string;
  quarter: string;
  year: number;
  label: string;
  owner_id: string;
  progress: number;
  status: 'Green' | 'Amber' | 'Red';
  parent_kr_id?: string | null;
}

export interface Task {
  id: string;
  title: string;
  status: TaskStatus;
}

export interface Activity {
  id: string;
  key_result_id: string;
  owner_id: string;
  department: string;
  title: string;
  tasks: Task[];
  comments?: string;
  week: number;
  year: number;
  score: number;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'LOGIN' | 'IMPORT' | 'SYSTEM' | 'AI_QUERY' | 'INTEGRITY_ADJUSTMENT' | 'LOGOUT';
  details: string;
  ipAddress?: string;
  metadata?: Record<string, unknown>;
}

export interface BUPerformanceDataPoint {
  week: string;
  totalCompanyScore: number;
  [buName: string]: number | string;
}

// ============================================================================
// Finance Module Types
// ============================================================================

export interface Violation {
  id: string;
  name: string;
  department: string;
  amount: number;
  date: string;
  paid: boolean;
  fine_type_id?: string;
}

export interface Contribution {
  id: string;
  donorName: string;
  amount: number;
  date: string;
  anonymous: boolean;
}

export interface Expense {
  id: string;
  amount: number;
  description: string;
  category: string;
  requestor: string;
  approver: string;
  receiver: string;
  date: string;
  receiptUrl?: string;
}

export interface MonthlyFinancialSummary {
  id: string;
  month: number;
  year: number;
  total_income: number;
  total_expenses: number;
}

export interface FineType {
  id: string;
  name: string;
  description: string;
  default_amount: number;
  is_active: boolean;
  created_at: string;
}

// ============================================================================
// Attendance Module Types
// ============================================================================

export interface AttendanceRecord {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  department: string;
  status: AttendanceStatus;
  timeJoined: string | null;
  participationScore: number;
}

// ============================================================================
// Governance Configuration
// ============================================================================

export interface GovernanceConfig {
  contentLockDay: number;
  contentLockTime: string;
  finalLockDay: number;
  finalLockTime: string;
  manualContentLock: boolean;
  manualFinalLock: boolean;
  disableLocks: boolean;
  allowedDomains: string[];
  brandLogo?: string;
  brandLandingImage?: string;
  brandLoginImage?: string;
  smtpEnabled?: boolean;
  smtpHost?: string;
  smtpPort?: number;
  smtpUser?: string;
  smtpPass?: string;
}

// ============================================================================
// UI Component Props
// ============================================================================

export interface KPICardProps {
  title: string;
  value: string;
  trendValue: number;
  trendUp: boolean;
  subtitle: ReactNode;
}

// ============================================================================
// Constants
// ============================================================================

export const ALLOWED_DOMAINS = ['novaai.com.ng', 'fcis.com', 'pee.com'];
