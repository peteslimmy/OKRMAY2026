/**
 * 4CORE OKR Platform - Core Type Definitions
 * Centralized types for the entire application
 */

import type { ReactNode } from 'react';

// ============================================================================
// Authentication & User Management
// ============================================================================

export enum UserRole {
  SuperAdmin = 'SuperAdmin',
  Admin = 'Admin',
  Manager = 'Manager',
  Director = 'Director',
  BULead = 'BULead',
  Viewer = 'Viewer'
}

export enum UserStatus {
  Active = 'Active',
  Suspended = 'Suspended'
}

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
  created_at?: string;
  updated_at?: string;
}

// ============================================================================
// RBAC Permissions
// ============================================================================

export enum Permission {
  USERS_VIEW = 'USERS_VIEW',
  USERS_CREATE = 'USERS_CREATE',
  USERS_EDIT = 'USERS_EDIT',
  USERS_DELETE = 'USERS_DELETE',
  USERS_ASSIGN_ROLE = 'USERS_ASSIGN_ROLE',
  GOAL_VIEW = 'GOAL_VIEW',
  GOAL_CREATE = 'GOAL_CREATE',
  GOAL_EDIT = 'GOAL_EDIT',
  GOAL_DELETE = 'GOAL_DELETE',
  GOAL_VIEW_ALL_BU = 'GOAL_VIEW_ALL_BU',
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
    Permission.GOAL_VIEW, Permission.KR_VIEW,
    Permission.GOVERNANCE_VIEW, Permission.REPORTS_VIEW_BASIC
  ],
  [UserRole.BULead]: [
    Permission.GOAL_VIEW, Permission.GOAL_CREATE, Permission.GOAL_EDIT,
    Permission.KR_VIEW, Permission.GOVERNANCE_VIEW,
    Permission.REPORTS_VIEW_BASIC, Permission.ATTENDANCE_VIEW
  ],
  [UserRole.Manager]: [
    Permission.GOAL_VIEW, Permission.KR_VIEW, Permission.GOVERNANCE_VIEW,
    Permission.REPORTS_VIEW_BASIC, Permission.GOAL_CREATE, Permission.GOAL_EDIT,
    Permission.REPORTS_VIEW_ADVANCED, Permission.REPORTS_EXPORT, Permission.ATTENDANCE_VIEW
  ],
  [UserRole.Director]: [
    Permission.GOAL_VIEW, Permission.GOAL_CREATE, Permission.GOAL_EDIT,
    Permission.KR_VIEW, Permission.GOVERNANCE_VIEW, Permission.REPORTS_VIEW_BASIC,
    Permission.REPORTS_VIEW_ADVANCED, Permission.REPORTS_EXPORT, Permission.ATTENDANCE_VIEW,
    Permission.GOAL_DELETE, Permission.KR_CREATE, Permission.KR_EDIT,
    Permission.REPORTS_VIEW_EXECUTIVE, Permission.FINANCE_VIEW,
    Permission.ATTENDANCE_MANAGE, Permission.AUDIT_VIEW
  ],
  [UserRole.Admin]: [
    Permission.GOAL_VIEW, Permission.GOAL_CREATE, Permission.GOAL_EDIT,
    Permission.GOAL_DELETE, Permission.KR_VIEW, Permission.KR_CREATE, Permission.KR_EDIT,
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
// Business Units
// ============================================================================

export interface BusinessUnit {
  id: string;
  name: string;
  head_user_id?: string;
  contactEmail?: string;
  avatarUrl?: string;
  created_at?: string;
  updated_at?: string;
}

// ============================================================================
// OKR - Objectives & Key Results
// ============================================================================

export enum QuarterType {
  Q1 = 'Q1',
  Q2 = 'Q2',
  Q3 = 'Q3',
  Q4 = 'Q4'
}

export type ObjectiveStatus = 'Draft' | 'Active' | 'Locked';

export interface Objective {
  id: string;
  yearly_theme_id?: string;
  quarter: QuarterType;
  year: number;
  title: string;
  description?: string;
  status: ObjectiveStatus;
  progress: number;
  created_at?: string;
  updated_at?: string;
  created_by?: string;
  updated_by?: string;
}

export type KRStatus = 'Green' | 'Amber' | 'Red';

export type KRSlot = 'KR1' | 'KR2' | 'KR3' | 'KR4';

export interface KeyResult {
  id: string;
  objective_id: string;
  kr_slot: KRSlot;
  title: string;
  description?: string;
  progress: number;
  status: KRStatus;
  version: number;
  label?: string;
  parent_kr_id?: string | null;
  quarter?: string;
  year?: number;
  owner_id?: string;
  created_at?: string;
  updated_at?: string;
}

// ============================================================================
// Goals & Tasks
// ============================================================================

export enum TaskStatus {
  Undefined = 'Undefined',
  Done = 'Done',
  NotDone = 'NotDone'
}

export interface Task {
  id: string;
  title: string;
  status: TaskStatus;
  goal_id?: string;
}

export interface Goal {
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
  sub_kr_tag?: string;
  created_at?: string;
  updated_at?: string;
}

// ============================================================================
// Activities (Goals in DB)
// ============================================================================

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
  sub_kr_tag?: string;
  created_at?: string;
  updated_at?: string;
}

// ============================================================================
// Audit Logging
// ============================================================================

export type AuditAction = 
  | 'CREATE' 
  | 'UPDATE' 
  | 'DELETE' 
  | 'LOGIN' 
  | 'IMPORT' 
  | 'SYSTEM' 
  | 'AI_QUERY' 
  | 'INTEGRITY_ADJUSTMENT' 
  | 'LOGOUT'
  | 'LOCK'
  | 'OVERRIDE';

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  action: AuditAction;
  details: string;
  ipAddress?: string;
  metadata?: Record<string, unknown>;
}

// ============================================================================
// Finance & Governance
// ============================================================================

export enum AttendanceStatus {
  Present = 'Present',
  Remote = 'Remote',
  Absent = 'Absent',
  Excused = 'Excused'
}

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

export interface Violation {
  id: string;
  name: string;
  department: string;
  amount: number;
  date: string;
  paid: boolean;
  fine_type_id?: string;
  created_at?: string;
  updated_at?: string;
}

export interface FineType {
  id: string;
  name: string;
  description: string;
  default_amount: number;
  is_active: boolean;
  created_at?: string;
}

export interface Contribution {
  id: string;
  donorName: string;
  amount: number;
  date: string;
  anonymous: boolean;
  created_at?: string;
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
  created_at?: string;
}

// ============================================================================
// Governance Configuration
// ============================================================================

export interface GovernanceConfig {
  id?: number;
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
  created_at?: string;
  updated_at?: string;
}

export type LockStatus = 'UNLOCKED' | 'PARTIAL' | 'LOCKED';

// ============================================================================
// Performance Data
// ============================================================================

export interface BUPerformanceDataPoint {
  week: string;
  totalCompanyScore: number;
  [buName: string]: number | string;
}

// ============================================================================
// UI Component Types
// ============================================================================

export interface KPICardProps {
  title: string;
  value: string;
  trendValue?: number;
  trendUp?: boolean;
  subtitle?: ReactNode;
  icon?: ReactNode;
}

export interface StatCardProps {
  label: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon?: ReactNode;
  trend?: 'up' | 'down' | 'neutral';
}

export interface TableColumn<T> {
  key: keyof T | string;
  header: string;
  render?: (item: T) => ReactNode;
  sortable?: boolean;
  width?: string;
}

export interface PaginationInfo {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

// ============================================================================
// API Response Types
// ============================================================================

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: PaginationInfo;
}

// ============================================================================
// Form Types
// ============================================================================

export interface FormFieldProps {
  name: string;
  label?: string;
  placeholder?: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  helpText?: string;
}

// ============================================================================
// Navigation Types
// ============================================================================

export interface NavItem {
  id?: string;
  label: string;
  to: string;
  icon: React.ReactNode;
  isParent?: boolean;
  badge?: number | string;
  badgeType?: 'count' | 'status' | 'new';
  children?: { to: string; label: string; check?: () => Promise<boolean> }[];
}

// ============================================================================
// Constants
// ============================================================================

export const ALLOWED_DOMAINS = ['novaai.com.ng', 'fcis.com', 'pee.com'];
export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;