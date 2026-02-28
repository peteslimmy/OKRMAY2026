
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

// FR-SMTP-1.1: Encryption Types
export enum EncryptionType {
  None = 'None',
  SSL_TLS = 'SSL/TLS',
  STARTTLS = 'STARTTLS'
}

// FR-SMTP-1.1: SMTP Config Interface
export interface SMTPConfig {
  host: string;
  port: number;
  encryption: EncryptionType;
  username: string;
  password?: string; 
}

// FR-MSG-2.1: Email Triggers
export enum EmailTriggerType {
  ContentLockWarning = 'Content Lock Warning',
  FinalLockWarning = 'Final Status Lock Warning',
  WelcomeUser = 'New User Welcome',
  PasswordReset = 'Password Reset'
}

// FR-MSG-2.1: Email Template Interface
export interface EmailTemplate {
  id: string;
  trigger: EmailTriggerType;
  name: string;
  subject: string;
  body: string; // HTML string
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
  // Password stored for local/demo purposes or initial setup
  password?: string; 
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

export let ALLOWED_DOMAINS = ['novaai.com.ng', 'fcis.com', 'pee.com'];