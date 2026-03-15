
import React from 'react';

// FR 1.0: Role Definitions
export enum UserRole {
  SuperAdmin = 'SuperAdmin',
  Admin = 'Admin',
  Manager = 'Manager',
  Director = 'Director',
  Viewer = 'Viewer'
}

// FR 4.6: User Status
export enum UserStatus {
  Active = 'Active',
  Suspended = 'Suspended'
}

// FR 3.7: Task Status
export enum TaskStatus {
  Undefined = 'Undefined',
  Done = 'Done',
  NotDone = 'NotDone'
}

export interface User {
  id: string;
  auth_id?: string; // Link to Supabase Auth
  firstName: string;
  lastName: string;
  name: string;
  email: string;
  role: UserRole;
  department: string;
  avatarUrl: string;
  status: UserStatus;
  // DEPRECATED: mustChangePassword retained for auth flow compatibility
  // Password field removed - use Supabase Auth instead
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
}

export interface Task {
  id: string;
  title: string;
  status: TaskStatus;
}

export interface Activity {
  id: string;
  key_result_id: string;
  owner_id: string;      // Traceable ownership
  department: string;    // Data isolation anchor
  title: string;
  tasks: Task[];
  comments?: string;
  week: number;
  year: number;
  score: number;
}

export interface KPICardProps {
  title: string;
  value: string;
  trendValue: number;
  trendUp: boolean;
  subtitle: React.ReactNode;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'LOGIN' | 'IMPORT' | 'SYSTEM' | 'AI_QUERY' | 'INTEGRITY_ADJUSTMENT' | 'LOGOUT';
  details: string;
  ipAddress?: string;
  metadata?: Record<string, any>;
}

export interface BUPerformanceDataPoint {
  week: string;
  totalCompanyScore: number;
  [buName: string]: number | string;
}

export interface StrategicNote {
  id: string;
  week: string;
  year: number;
  title: string;
  content: string;
  timestamp: string;
  owner_id: string;
}

// ============================================================================
// Finance Module Types (FR-FINANCE)
// ============================================================================
export interface Violation {
  id: string;
  name: string;
  department: string;
  amount: number;
  date: string;
  paid: boolean;
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

// ============================================================================
// Attendance Module Types (FR-ATTENDANCE)
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

export let ALLOWED_DOMAINS = ['novaai.com.ng', 'fcis.com', 'pee.com'];