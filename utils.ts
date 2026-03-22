/**
 * 4CORE OKR Platform - Utility Functions
 * Centralized utilities for authentication, authorization, caching, and data operations
 */

import {
  Task, TaskStatus, UserRole, UserStatus, AuditLogEntry, User, BusinessUnit,
  KeyResult, Activity, BUPerformanceDataPoint,
  ALLOWED_DOMAINS as BASE_DOMAINS, Violation, Contribution, Expense,
  MonthlyFinancialSummary, AttendanceRecord, FineType, Permission, ROLE_PERMISSIONS,
  GovernanceConfig
} from './src/types';
import { supabase } from './supabaseClient';

// ============================================================================
// Constants
// ============================================================================

export let ALLOWED_DOMAINS: string[] = [...BASE_DOMAINS];
export let DISABLE_LOCKS = false;

export const AUDIT_LOGS: AuditLogEntry[] = [];

const STALE_TIME = 30000;
let hasSeededDatabase = false;

// ============================================================================
// Cache Layer
// ============================================================================

const CACHE: Record<string, { data: unknown; lastFetch: number }> = {
  users: { data: null, lastFetch: 0 },
  bus: { data: null, lastFetch: 0 },
  krs: { data: null, lastFetch: 0 },
  governance: { data: null, lastFetch: 0 },
  performance: { data: null, lastFetch: 0 }
};

const isCacheValid = (key: string): boolean => {
  const entry = CACHE[key];
  return entry?.data !== null && (Date.now() - entry.lastFetch < STALE_TIME);
};

const invalidateCache = (key: string): void => {
  CACHE[key] = { data: null, lastFetch: 0 };
};

// ============================================================================
// Default Data
// ============================================================================

const DEFAULT_USERS: User[] = [
  {
    id: 'f3312dd7-8f3a-4760-81b0-7e000c2feb18',
    firstName: 'System', lastName: 'Administrator',
    name: 'System Administrator', email: 'admin@fcis.com',
    role: UserRole.SuperAdmin, department: 'IT',
    avatarUrl: 'https://ui-avatars.com/api/?name=System+Admin&background=0f172a&color=fff',
    status: UserStatus.Active, mustChangePassword: false
  },
  {
    id: 'user-director-001', firstName: 'Corporate', lastName: 'Director',
    name: 'Corporate Director', email: 'director@fcis.com',
    role: UserRole.Director, department: 'FINANCE',
    avatarUrl: 'https://ui-avatars.com/api/?name=Corporate+Director&background=1e293b&color=fff',
    status: UserStatus.Active, mustChangePassword: false
  }
];

const DEFAULT_BUSINESS_UNITS: BusinessUnit[] = [
  { id: 'bu-idec', name: 'IDEC', head_user_id: 'f3312dd7-8f3a-4760-81b0-7e000c2feb18', contactEmail: 'idec@fcis.com' },
  { id: 'bu-vreg', name: 'VREG', head_user_id: 'user-vreg-001', contactEmail: 'vreg@pee.com' },
  { id: 'bu-hnb', name: 'HnB', head_user_id: 'f3312dd7-8f3a-4760-81b0-7e000c2feb18', contactEmail: 'hnb@fcis.com' },
  { id: 'bu-possap', name: 'POSSAP', head_user_id: 'user-possap-001', contactEmail: 'poaasp@pee.com' },
  { id: 'bu-wacs', name: 'WACS', head_user_id: 'f3312dd7-8f3a-4760-81b0-7e000c2feb18', contactEmail: 'wacs@fcis.com' },
  { id: 'bu-nbms', name: 'NBMS', head_user_id: 'f3312dd7-8f3a-4760-81b0-7e000c2feb18', contactEmail: 'nbms@fcis.com' },
  { id: 'bu-niger', name: 'NIGER', head_user_id: 'f3312dd7-8f3a-4760-81b0-7e000c2feb18', contactEmail: 'niger@fcis.com' },
  { id: 'bu-nasarawa', name: 'NASARAWA', head_user_id: 'f3312dd7-8f3a-4760-81b0-7e000c2feb18', contactEmail: 'nasarawa@fcis.com' },
  { id: 'bu-busdev', name: 'BUS.DEV', head_user_id: 'f3312dd7-8f3a-4760-81b0-7e000c2feb18', contactEmail: 'busdev@fcis.com' },
  { id: 'bu-hr', name: 'HR', head_user_id: 'f3312dd7-8f3a-4760-81b0-7e000c2feb18', contactEmail: 'hr@fcis.com' },
  { id: 'bu-it', name: 'IT', head_user_id: 'f3312dd7-8f3a-4760-81b0-7e000c2feb18', contactEmail: 'it@fcis.com' },
  { id: 'bu-finance', name: 'FINANCE', head_user_id: 'user-director-001', contactEmail: 'finance@fcis.com' },
  { id: 'bu-c4h', name: 'C4H', head_user_id: 'user-c4h-001', contactEmail: 'c4h@pee.com' }
];

// ============================================================================
// UUID Generation
// ============================================================================

export const generateLocalUUID = (): string => crypto.randomUUID();

// ============================================================================
// Authentication & Session
// ============================================================================

export const getSimulatedUser = (): User | null => {
  if (import.meta.env.PROD) return null;
  const simulated = localStorage.getItem('4CORE_simulated_user');
  return simulated ? JSON.parse(simulated) : null;
};

export const setSimulatedUser = (user: User | null): void => {
  if (import.meta.env.PROD) return;
  if (user) {
    localStorage.setItem('4CORE_simulated_user', JSON.stringify(user));
  } else {
    localStorage.removeItem('4CORE_simulated_user');
  }
  window.dispatchEvent(new Event('4COREUserUpdate'));
};

export const getSessionUser = async (): Promise<User | null> => {
  // Development: Check for simulated user
  if (!import.meta.env.PROD) {
    const simulated = getSimulatedUser();
    if (simulated) return simulated;
  }

  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return null;

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('auth_id', session.user.id)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('[AUTH] Profile fetch error:', error);
    }

    if (data) return data as User;

    // Auto-create profile for new auth users
    if (error?.code === 'PGRST116') {
      const email = session.user.email || '';
      const newUser: User = {
        id: generateLocalUUID(),
        auth_id: session.user.id,
        email,
        firstName: email.split('@')[0],
        lastName: '',
        name: email.split('@')[0],
        role: UserRole.Viewer,
        department: 'Registry',
        avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(email)}&background=random`,
        status: UserStatus.Active
      };
      await supabase.from('profiles').insert([newUser]);
      return newUser;
    }
  } catch (e) {
    console.error('[AUTH] Session error:', e);
  }
  return null;
};

// ============================================================================
// Authorization
// ============================================================================

export const hasPermission = async (requiredRoles: UserRole[]): Promise<boolean> => {
  const user = await getSessionUser();
  return !!user && requiredRoles.includes(user.role);
};

export const hasPermissionByRole = (userRole: UserRole, permission: Permission): boolean => {
  return ROLE_PERMISSIONS[userRole]?.includes(permission) ?? false;
};

export const checkPermission = async (permission: Permission): Promise<boolean> => {
  const user = await getSessionUser();
  return !!user && hasPermissionByRole(user.role, permission);
};

export const getUserPermissions = (userRole: UserRole): Permission[] => {
  return ROLE_PERMISSIONS[userRole] ?? [];
};

// Role-based permission checks
export const canManageObjectives = () => hasPermission([UserRole.SuperAdmin, UserRole.Admin, UserRole.Director]);
export const canManageUsers = () => hasPermission([UserRole.SuperAdmin, UserRole.Admin]);
export const canViewSettings = () => hasPermission([UserRole.SuperAdmin, UserRole.Admin]);
export const canManageUnits = () => hasPermission([UserRole.SuperAdmin, UserRole.Admin]);
export const canConfigureSystem = () => hasPermission([UserRole.SuperAdmin, UserRole.Admin]);
export const canViewAuditLogs = () => hasPermission([UserRole.SuperAdmin, UserRole.Admin]);
export const canManageBusinessUnits = canManageUnits;

// Activity permissions
export const canCreateActivity = () => checkPermission(Permission.ACTIVITY_CREATE);
export const canEditActivity = () => checkPermission(Permission.ACTIVITY_EDIT);
export const canDeleteActivity = () => checkPermission(Permission.ACTIVITY_DELETE);
export const canViewAllBUActivities = () => checkPermission(Permission.ACTIVITY_VIEW_ALL_BU);

// Key Result permissions
export const canCreateKR = () => checkPermission(Permission.KR_CREATE);
export const canEditKR = () => checkPermission(Permission.KR_EDIT);
export const canDeleteKR = () => checkPermission(Permission.KR_DELETE);

// Governance permissions
export const canConfigureGovernance = () => checkPermission(Permission.GOVERNANCE_CONFIG);
export const canBypassGovernance = () => checkPermission(Permission.GOVERNANCE_BYPASS);

// Report permissions
export const canViewAdvancedReports = () => checkPermission(Permission.REPORTS_VIEW_ADVANCED);
export const canViewExecutiveReports = () => checkPermission(Permission.REPORTS_VIEW_EXECUTIVE);
export const canExportReports = () => checkPermission(Permission.REPORTS_EXPORT);

// Other permissions
export const canManageFinance = () => checkPermission(Permission.FINANCE_MANAGE);
export const canManageAttendance = () => checkPermission(Permission.ATTENDANCE_MANAGE);
export const canEditSettings = () => checkPermission(Permission.SETTINGS_EDIT);
export const canExportAudit = () => checkPermission(Permission.AUDIT_EXPORT);

// ============================================================================
// Audit Logging
// ============================================================================

export const logAudit = async (
  action: AuditLogEntry['action'],
  details: string,
  metadata?: Record<string, unknown>
): Promise<void> => {
  const user = await getSessionUser();
  const entry: AuditLogEntry = {
    id: generateLocalUUID(),
    timestamp: new Date().toISOString(),
    userId: user?.id || 'SYSTEM',
    userName: user?.name || 'SYSTEM',
    action,
    details,
    metadata
  };
  AUDIT_LOGS.push(entry);

  try {
    await supabase.from('audit_logs').insert([entry]);
  } catch {
    // Audit logging should never break the app
  }
};

// ============================================================================
// Time Utilities
// ============================================================================

export const getWATTime = (): Date => {
  return new Date(new Date().toLocaleString('en-US', { timeZone: 'Africa/Lagos' }));
};

export const getCurrentQuarterInfo = () => {
  const now = getWATTime();
  const month = now.getMonth();
  const quarters = ['Q1', 'Q2', 'Q3', 'Q4'];
  const quarterIndex = Math.floor(month / 3);
  return {
    year: now.getFullYear(),
    quarter: quarters[quarterIndex],
    quarterIndex,
    quarterLabel: quarters[quarterIndex]
  };
};

export const getCurrentWeekNumber = () => {
  const now = getWATTime();
  const startOfYear = new Date(now.getFullYear(), 0, 1);
  const week = Math.ceil(((now.getTime() - startOfYear.getTime()) / 86400000 + startOfYear.getDay() + 1) / 7);
  return { week: `Week ${week}`, year: now.getFullYear() };
};

export const getCurrentWeekRange = (): string => {
  const now = getWATTime();
  const day = now.getDay();
  const diff = now.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(now.setDate(diff));
  const sunday = new Date(now.setDate(diff + 6));
  return `${monday.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${sunday.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}, ${monday.getFullYear()}`;
};

export const getRecentWeekRanges = (): { label: string; value: string }[] => {
  const now = getWATTime();
  const ranges = [];
  for (let i = 0; i < 8; i++) {
    const d = new Date(now);
    d.setDate(now.getDate() - (i * 7));
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    const mon = new Date(d.setDate(diff));
    const sun = new Date(d.setDate(diff + 6));
    const weekNum = Math.ceil(((mon.getTime() - new Date(mon.getFullYear(), 0, 1).getTime()) / 86400000 + new Date(mon.getFullYear(), 0, 1).getDay() + 1) / 7);
    ranges.push({
      label: `Week ${weekNum}: ${mon.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${sun.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}, ${sun.getFullYear()}`,
      value: `W${weekNum}`
    });
  }
  return ranges;
};

export const generateReportId = (department: string, week: number, year: number): string => {
  return `${department.toUpperCase().replace(/\s+/g, '-')}-WEEK-${week.toString().padStart(2, '0')}`;
};

// ============================================================================
// User Management
// ============================================================================

export const getRegistryUsers = async (): Promise<User[]> => {
  try {
    if (isCacheValid('users')) return CACHE.users.data as User[];

    const { data, error } = await supabase.from('profiles').select('*');
    if (error) throw error;

    const dbUsers = (data as User[]) || [];
    const merged = [...DEFAULT_USERS];
    dbUsers.forEach(dbU => {
      const idx = merged.findIndex(m => m.id === dbU.id || m.email === dbU.email);
      if (idx > -1) merged[idx] = dbU;
      else merged.push(dbU);
    });

    CACHE.users.data = merged;
    CACHE.users.lastFetch = Date.now();
    return merged;
  } catch {
    return DEFAULT_USERS;
  }
};

export const getStoredUsers = getRegistryUsers;

export const saveStoredUsers = async (users: User[]): Promise<void> => {
  try {
    await supabase.from('profiles').upsert(users);
  } finally {
    invalidateCache('users');
    window.dispatchEvent(new Event('4COREUserUpdate'));
  }
};

// ============================================================================
// Business Units
// ============================================================================

export const getBusinessUnits = async (): Promise<BusinessUnit[]> => {
  try {
    if (isCacheValid('bus')) return CACHE.bus.data as BusinessUnit[];

    const { data, error } = await supabase.from('business_units').select('*');
    if (error) throw error;

    const dbUnits = (data as BusinessUnit[]) || [];
    const merged = [...DEFAULT_BUSINESS_UNITS];
    dbUnits.forEach(dbU => {
      const idx = merged.findIndex(m => m.id === dbU.id || m.name === dbU.name);
      if (idx > -1) merged[idx] = dbU;
      else merged.push(dbU);
    });

    CACHE.bus.data = merged;
    CACHE.bus.lastFetch = Date.now();
    return merged;
  } catch {
    return DEFAULT_BUSINESS_UNITS;
  }
};

export const saveBusinessUnits = async (units: BusinessUnit[]): Promise<void> => {
  await supabase.from('business_units').upsert(units);
  invalidateCache('bus');
  window.dispatchEvent(new Event('4COREBUUpdate'));
};

// ============================================================================
// Key Results
// ============================================================================

export const getRegistryKeyResults = async (year?: number): Promise<KeyResult[]> => {
  try {
    if (isCacheValid('krs') && !year) return CACHE.krs.data as KeyResult[];

    const { data, error } = await supabase.from('key_results').select('*');
    if (error) throw error;

    const dbKrs = (data as KeyResult[]) || [];
    const filteredDb = year ? dbKrs.filter(k => k.year === year) : dbKrs;

    if (!year) {
      CACHE.krs.data = filteredDb;
      CACHE.krs.lastFetch = Date.now();
    }
    return filteredDb;
  } catch {
    return [];
  }
};

export const findOrphanedSubKRs = async (year?: number): Promise<KeyResult[]> => {
  try {
    const { data } = await supabase.from('key_results').select('*');
    const allKRs = (data as KeyResult[]) || [];
    const krsForYear = year ? allKRs.filter(k => k.year === year) : allKRs;
    const parentIds = new Set(krsForYear.filter(k => !k.parent_kr_id).map(k => k.id));
    return krsForYear.filter(k => k.parent_kr_id && !parentIds.has(k.parent_kr_id));
  } catch {
    return [];
  }
};

export const cleanupOrphanedSubKRs = async (year?: number): Promise<{ deleted: number }> => {
  try {
    const orphans = await findOrphanedSubKRs(year);
    if (orphans.length === 0) return { deleted: 0 };
    await supabase.from('key_results').delete().in('id', orphans.map(o => o.id));
    invalidateCache('krs');
    return { deleted: orphans.length };
  } catch {
    return { deleted: 0 };
  }
};

// ============================================================================
// Database Seeding
// ============================================================================

export const seedDatabase = async (): Promise<void> => {
  if (hasSeededDatabase) return;

  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const { count, error: countError } = await supabase
      .from('key_results')
      .select('*', { count: 'exact', head: true });

    if (countError || count) {
      hasSeededDatabase = true;
      return;
    }

    console.log('[DB] Seeding Key Results...');
    hasSeededDatabase = true;
  } catch (e) {
    console.error('[DB] Seeding error:', e);
  }
};

// ============================================================================
// Activities
// ============================================================================

export const calculateActivityScore = (tasks: Task[]): number => {
  if (!tasks || tasks.length === 0) return 0;
  const completed = tasks.filter(t => t.status === TaskStatus.Done).length;
  return Math.round((completed / tasks.length) * 100);
};

// ============================================================================
// Governance Configuration
// ============================================================================

export const getGovernanceConfig = async (): Promise<GovernanceConfig> => {
  try {
    if (isCacheValid('governance')) return CACHE.governance.data as GovernanceConfig;

    const { data, error } = await supabase.from('governance_config').select('*').single();
    if (error) throw error;

    const config: GovernanceConfig = {
      contentLockDay: 2, contentLockTime: '18:00', finalLockDay: 2, finalLockTime: '11:00',
      manualContentLock: false, manualFinalLock: false, allowedDomains: BASE_DOMAINS,
      disableLocks: false, smtpEnabled: false, ...data
    };

    ALLOWED_DOMAINS = config.allowedDomains || BASE_DOMAINS;
    DISABLE_LOCKS = config.disableLocks || false;

    // Load SMTP from localStorage
    const localSmtp = localStorage.getItem('4CORE_smtp_settings');
    if (localSmtp) {
      try {
        const smtp = JSON.parse(localSmtp);
        config.smtpEnabled = smtp.enabled ?? config.smtpEnabled;
        config.smtpHost = smtp.host || config.smtpHost;
        config.smtpPort = smtp.port || config.smtpPort;
        config.smtpUser = smtp.user || config.smtpUser;
        config.smtpPass = smtp.pass || config.smtpPass;
      } catch { /* ignore */ }
    }

    CACHE.governance.data = config;
    CACHE.governance.lastFetch = Date.now();
    return config;
  } catch {
    return {
      contentLockDay: 2, contentLockTime: '18:00', finalLockDay: 2, finalLockTime: '11:00',
      manualContentLock: false, manualFinalLock: false, disableLocks: false,
      allowedDomains: BASE_DOMAINS, smtpEnabled: false
    };
  }
};

export const saveGovernanceConfig = async (config: GovernanceConfig): Promise<void> => {
  await supabase.from('governance_config').upsert([config]);
  ALLOWED_DOMAINS = config.allowedDomains || BASE_DOMAINS;
  DISABLE_LOCKS = config.disableLocks || false;
  invalidateCache('governance');
  window.dispatchEvent(new Event('4COREGovernanceUpdate'));
};

// ============================================================================
// Report Lock Status
// ============================================================================

export type LockStatus = 'UNLOCKED' | 'PARTIAL' | 'LOCKED';

export const getReportLockStatus = (weekNum: number, year: number): LockStatus => {
  if (DISABLE_LOCKS) return 'UNLOCKED';

  const now = getWATTime();
  const config = CACHE.governance.data as GovernanceConfig | null;

  if (config?.manualContentLock || config?.manualFinalLock) {
    return config.manualFinalLock ? 'LOCKED' : 'PARTIAL';
  }

  const targetDate = getWeekStartDate(weekNum, year);
  const contentLockDate = getLockDate(targetDate, config?.contentLockDay ?? 2, config?.contentLockTime ?? '18:00');
  const finalLockDate = getLockDate(targetDate, config?.finalLockDay ?? 2, config?.finalLockTime ?? '11:00');

  if (now > finalLockDate) return 'LOCKED';
  if (now > contentLockDate) return 'PARTIAL';
  return 'UNLOCKED';
};

const getWeekStartDate = (weekNum: number, year: number): Date => {
  const jan1 = new Date(year, 0, 1);
  const days = (weekNum - 1) * 7 - jan1.getDay() + 1;
  return new Date(year, 0, days);
};

const getLockDate = (weekStart: Date, lockDay: number, lockTime: string): Date => {
  const date = new Date(weekStart);
  date.setDate(date.getDate() + lockDay);
  const [hours, minutes] = lockTime.split(':').map(Number);
  date.setHours(hours, minutes, 0, 0);
  return date;
};

// ============================================================================
// Governance Health Score
// ============================================================================

export const calculateGovernanceHealth = async (): Promise<number> => {
  try {
    const config = await getGovernanceConfig();
    const users = await getRegistryUsers();
    const activities = await supabase.from('activities').select('*');

    const userCount = users.length;
    const activeCount = users.filter(u => u.status === UserStatus.Active).length;
    const activityCount = activities.data?.length ?? 0;

    let score = 50;
    score += Math.min((activeCount / userCount) * 30, 30);
    score += Math.min(activityCount / 10, 20);

    return Math.min(100, Math.round(score));
  } catch {
    return 0;
  }
};

// ============================================================================
// BU Performance Data
// ============================================================================

export const getBUPerformanceData = async (buId?: string, weekFilter?: string): Promise<BUPerformanceDataPoint[]> => {
  try {
    if (isCacheValid('performance') && !buId && !weekFilter) {
      return CACHE.performance.data as BUPerformanceDataPoint[];
    }

    const year = getWATTime().getFullYear();
    const { data: activities } = await supabase.from('activities').select('*').eq('year', year);
    if (!activities) return [];

    const bus = await getBusinessUnits();
    const grouped: Record<string, { total: number; count: number }> = {};

    (activities as Activity[]).forEach(act => {
      const key = weekFilter || `W${act.week}`;
      if (!grouped[key]) grouped[key] = { total: 0, count: 0 };
      grouped[key][act.department] = grouped[key][act.department] || { total: 0, count: 0 };
      grouped[key][act.department].total += act.score;
      grouped[key][act.department].count += 1;
    });

    const result: BUPerformanceDataPoint[] = Object.entries(grouped).map(([week, data]) => {
      const buScores: Record<string, number> = {};
      let totalScore = 0;
      let totalCount = 0;

      bus.forEach(bu => {
        const buData = data[bu.name];
        if (buData) {
          buScores[bu.name] = Math.round(buData.total / buData.count);
          totalScore += buData.total;
          totalCount += buData.count;
        }
      });

      return {
        week,
        totalCompanyScore: totalCount ? Math.round(totalScore / totalCount) : 0,
        ...buScores
      };
    });

    result.sort((a, b) => a.week.localeCompare(b.week));

    if (!buId && !weekFilter) {
      CACHE.performance.data = result;
      CACHE.performance.lastFetch = Date.now();
    }

    return result;
  } catch {
    return [];
  }
};

// ============================================================================
// Score Calculation
// ============================================================================

export const calculateOverallScore = (activities: Activity[]): number => {
  if (!activities.length) return 0;
  const total = activities.reduce((sum, a) => sum + (a.score || 0), 0);
  return Math.round(total / activities.length);
};

export const calculateIntegrityScore = (activities: Activity[]): number => {
  if (!activities.length) return 0;

  const compliantCount = activities.filter(a => a.score >= 50).length;
  const reportingDensity = Math.min(100, (activities.length / 13) * 100);
  const descriptionScore = (compliantCount / activities.length) * 40;
  const densityScore = (reportingDensity / 100) * 40;
  const consistencyScore = (activities.filter(a => a.score >= 50).length / activities.length) * 20;

  return Math.round(descriptionScore + densityScore + consistencyScore);
};

// ============================================================================
// Email Dispatch (SMTP)
// ============================================================================

const dispatchEmail = async (to: string, subject: string, body: string): Promise<void> => {
  const config = await getGovernanceConfig();
  if (!config.smtpEnabled) return;

  logAudit('SYSTEM', `Email dispatched: ${subject} to ${to}`);

  try {
    await supabase.functions.invoke('send-email', {
      body: { to, subject, content: body }
    });
  } catch (e) {
    console.error('[EMAIL] Dispatch failed:', e);
  }
};

export const testSMTPSettings = async (config: GovernanceConfig, testEmail: string) => {
  logAudit('SYSTEM', `SMTP test to ${testEmail}`);

  try {
    await supabase.functions.invoke('send-email', {
      body: {
        to: testEmail,
        subject: '4CORE SMTP Test',
        content: `<h1>Test Successful</h1><p>Timestamp: ${new Date().toISOString()}</p>`
      }
    });
    return { success: true, message: 'Test email sent successfully' };
  } catch (e: any) {
    return { success: false, message: e.message || 'SMTP test failed' };
  }
};

export const triggerWelcomeEmail = async (user: User): Promise<void> => {
  const body = `
    <h2>Welcome to 4CORE Unified Governance</h2>
    <p>Your identity node has been provisioned.</p>
    <p><strong>Username:</strong> ${user.email}</p>
    <p>Please log in to synchronize your performance metrics.</p>
  `;
  await dispatchEmail(user.email, 'Identity Provisioned: 4CORE Access Authorized', body);
};

export const exportAuditLogsToCSV = (): void => {
  if (!AUDIT_LOGS.length) return;
  const headers = 'Timestamp,User,Action,Details,IP Address\n';
  const rows = AUDIT_LOGS.map(log =>
    `${log.timestamp},${log.userName},${log.action},"${log.details.replace(/"/g, '""')}",${log.ipAddress || ''}`
  ).join('\n');
  const blob = new Blob([headers + rows], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `4CORE_audit_log_${new Date().toISOString().split('T')[0]}.csv`;
  a.click();
  URL.revokeObjectURL(url);
};

// ============================================================================
// Finance Utilities
// ============================================================================

export const getViolations = async (): Promise<Violation[]> => {
  try {
    const { data, error } = await supabase.from('violations').select('*').order('date', { ascending: false });
    if (error) throw error;
    return (data as Violation[]) || [];
  } catch { return []; }
};

export const addViolation = async (v: Violation): Promise<boolean> => {
  if (typeof v.amount !== 'number' || v.amount <= 0) return false;
  try {
    const { error } = await supabase.from('violations').insert([v]);
    if (error) throw error;
    logAudit('CREATE', `Violation added: ${v.name} - ₦${v.amount}`);
    return true;
  } catch { return false; }
};

export const getContributions = async (): Promise<Contribution[]> => {
  try {
    const { data, error } = await supabase.from('contributions').select('*').order('date', { ascending: false });
    if (error) throw error;
    return (data as Contribution[]) || [];
  } catch { return []; }
};

export const getExpenses = async (): Promise<Expense[]> => {
  try {
    const { data, error } = await supabase.from('expenses').select('*').order('date', { ascending: false });
    if (error) throw error;
    return (data as Expense[]) || [];
  } catch { return []; }
};

export const getMonthlyFinancialSummary = async (): Promise<MonthlyFinancialSummary[]> => {
  try {
    const { data, error } = await supabase.from('monthly_financial_summary').select('*').order('year', { ascending: false }).order('month', { ascending: false });
    if (error) throw error;
    return (data as MonthlyFinancialSummary[]) || [];
  } catch { return []; }
};

export const getFineTypes = async (): Promise<FineType[]> => {
  try {
    const { data, error } = await supabase.from('fine_types').select('*');
    if (error) throw error;
    return (data as FineType[]) || [];
  } catch { return []; }
};

export const updateViolation = async (v: Violation): Promise<boolean> => {
  try {
    const { error } = await supabase.from('violations').update(v).eq('id', v.id);
    if (error) throw error;
    return true;
  } catch { return false; }
};

export const deleteViolation = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase.from('violations').delete().eq('id', id);
    if (error) throw error;
    return true;
  } catch { return false; }
};

export const addContribution = async (c: Contribution): Promise<boolean> => {
  try {
    const { error } = await supabase.from('contributions').insert([c]);
    if (error) throw error;
    logAudit('CREATE', `Contribution added: ${c.donorName} - ₦${c.amount}`);
    return true;
  } catch { return false; }
};

export const addExpense = async (e: Expense): Promise<boolean> => {
  try {
    const { error } = await supabase.from('expenses').insert([e]);
    if (error) throw error;
    logAudit('CREATE', `Expense added: ${e.description} - ₦${e.amount}`);
    return true;
  } catch { return false; }
};

export const addFineType = async (ft: FineType): Promise<boolean> => {
  try {
    const { error } = await supabase.from('fine_types').insert([ft]);
    if (error) throw error;
    return true;
  } catch { return false; }
};

export const updateFineType = async (ft: FineType): Promise<boolean> => {
  try {
    const { error } = await supabase.from('fine_types').update(ft).eq('id', ft.id);
    if (error) throw error;
    return true;
  } catch { return false; }
};

export const deleteFineType = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase.from('fine_types').delete().eq('id', id);
    if (error) throw error;
    return true;
  } catch { return false; }
};

export const addAllowedDomain = (domain: string): void => {
  if (!ALLOWED_DOMAINS.includes(domain)) {
    ALLOWED_DOMAINS.push(domain);
  }
};

export const removeAllowedDomain = (domain: string): void => {
  ALLOWED_DOMAINS = ALLOWED_DOMAINS.filter(d => d !== domain);
};

export const getAttendanceRecords = async (meetingId?: string): Promise<AttendanceRecord[]> => {
  try {
    let query = supabase.from('attendance').select('*');
    if (meetingId) query = query.eq('meeting_id', meetingId);
    const { data, error } = await query;
    if (error) throw error;
    return (data as AttendanceRecord[]) || [];
  } catch { return []; }
};

export const calculateBUCompliance = async (buId: string): Promise<{ compliant: number; total: number; percentage: number }> => {
  try {
    const activities = await supabase.from('activities').select('*').eq('department', buId);
    const total = activities.data?.length ?? 0;
    const compliant = activities.data?.filter((a: Activity) => a.score >= 50).length ?? 0;
    return { compliant, total, percentage: total ? Math.round((compliant / total) * 100) : 0 };
  } catch {
    return { compliant: 0, total: 0, percentage: 0 };
  }
};
