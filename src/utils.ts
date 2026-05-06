/**
 * 4CORE OKR Platform - Utility Functions
 * Centralized utilities for authentication, authorization, caching, and data operations
 */

import {
  Task, TaskStatus, UserRole, UserStatus, AuditLogEntry, User, BusinessUnit,
  KeyResult, Goal, BUPerformanceDataPoint,
  ALLOWED_DOMAINS as BASE_DOMAINS, Violation, Contribution, Expense,
  MonthlyFinancialSummary, AttendanceRecord, FineType, Permission,
  GovernanceConfig, Objective
} from './types';
import { 
  MOCK_BUSINESS_UNITS, 
  MOCK_USERS, 
  MOCK_OBJECTIVES, 
  MOCK_KRS, 
  MOCK_GOVERNANCE_CONFIG, 
  generateMockActivities 
} from './utils/mock-data';
import { supabase, supabaseAdmin } from './lib/supabase';
import { 
  hasPermissionByRole as permissionsHasPermissionByRole, 
  getUserPermissions as permissionsGetUserPermissions,
  hasAllPermissions,
  hasAnyPermission 
} from './utils/permissions';
import { logger } from './utils/logging';

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

export const clearAllCache = (): void => {
  Object.keys(CACHE).forEach(key => {
    CACHE[key as keyof typeof CACHE] = { data: null, lastFetch: 0 };
  });
  localStorage.removeItem('simulated_users');
  window.dispatchEvent(new Event('4COREUserUpdate'));
  logger.info('[CACHE] All cache cleared');
};

export const clearBrowserData = (): void => {
  localStorage.clear();
  sessionStorage.clear();
  clearAllCache();
  window.dispatchEvent(new Event('4COREUserUpdate'));
  logger.info('[CACHE] Browser data cleared');
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
  },
  { id: '0bfc8ec6-f79e-4ac5-ad3d-f18a2cf84c60', firstName: 'Hnb', lastName: 'User', name: 'hnb', email: 'hnb@fcis.com', role: UserRole.Manager, department: 'Strategic Planning', avatarUrl: 'https://ui-avatars.com/api/?name=Hnb+User&background=0f766e&color=fff', status: UserStatus.Active, mustChangePassword: false },
  { id: '28297fd3-1927-48cc-8efd-2b40eef5232d', firstName: 'Vreg', lastName: 'User', name: 'vreg', email: 'vreg@fcis.com', role: UserRole.Manager, department: 'Strategic Planning', avatarUrl: 'https://ui-avatars.com/api/?name=Vreg+User&background=7c3aed&color=fff', status: UserStatus.Active, mustChangePassword: false },
  { id: '9c2556ba-fa53-42c3-843b-6bab1420b49b', firstName: 'Idec', lastName: 'User', name: 'idec', email: 'idec@fcis.com', role: UserRole.Manager, department: 'Strategic Planning', avatarUrl: 'https://ui-avatars.com/api/?name=Idec+User&background=dc2626&color=fff', status: UserStatus.Active, mustChangePassword: false },
  { id: '930023fe-833b-49fe-8e6d-126e1c4c0789', firstName: 'C', lastName: '4h', name: 'c4h', email: 'c4h@fcis.com', role: UserRole.Manager, department: 'Strategic Planning', avatarUrl: 'https://ui-avatars.com/api/?name=C+4h&background=059669&color=fff', status: UserStatus.Active, mustChangePassword: false }
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
  if (!__SIMULATION_ENABLED__) return null;
  const simulated = localStorage.getItem('4CORE_simulated_user');
  return simulated ? JSON.parse(simulated) : null;
};

export const setSimulatedUser = (user: User | null): void => {
  if (!__SIMULATION_ENABLED__) return;
  if (user) {
    localStorage.setItem('4CORE_simulated_user', JSON.stringify(user));
  } else {
    localStorage.removeItem('4CORE_simulated_user');
  }
  window.dispatchEvent(new Event('4COREUserUpdate'));
};

export const getSessionUser = async (): Promise<User | null> => {
  logger.debug('[SESSION] getSessionUser called');
  
  if (!import.meta.env.PROD) {
    const simulated = getSimulatedUser();
    if (simulated) {
      logger.debug('[SESSION] Using simulated user:', { email: simulated.email });
      return simulated;
    }
  }

  try {
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    logger.debug('[SESSION] Got session:', { session: session ? 'exists' : 'none', sessionError });
    
    if (!session?.user) {
      logger.debug('[SESSION] Temporarily bypassing login for development');
      return DEFAULT_USERS[0];
    }

    logger.debug('[SESSION] Session user ID:', { id: session.user.id, email: session.user.email });

    const _profileResult = await supabase
      .from('profiles')
      .select('*')
      .eq('auth_id', session.user.id)
      .single();
    let data = _profileResult.data;
    const error = _profileResult.error;

    logger.debug('[SESSION] Profile query by auth_id:', { data, error });

    if (data) {
      logger.debug('[SESSION] Profile data fields:', { fields: Object.keys(data), mustChangePassword: (data as any).must_change_password });
    }

    if (!data && error?.code === 'PGRST116') {
      logger.debug('[SESSION] Trying to find profile by email...');
      const { data: emailData, error: emailError } = await supabase
        .from('profiles')
        .select('*')
        .eq('email', session.user.email)
        .single();
      
      logger.debug('[SESSION] Profile query by email:', { emailData, emailError });
      
      if (emailData) {
        logger.debug('[SESSION] Found profile by email, updating auth_id...');
        await supabase
          .from('profiles')
          .update({ auth_id: session.user.id })
          .eq('id', emailData.id);
        
        data = { ...emailData, auth_id: session.user.id };
      } else if (emailError?.code === 'PGRST116') {
        logger.debug('[SESSION] No profile found by email either');
      }
    }

    if (error && error.code !== 'PGRST116') {
      logger.error('[SESSION] Profile fetch error:', { error });
    }

    if (data) {
      const userData = {
        ...data,
        mustChangePassword: (data as any).must_change_password || false
      };
      logger.debug('[SESSION] Returning user:', { email: userData.email, role: userData.role, mustChangePassword: userData.mustChangePassword });
      return userData as User;
    }

    if (error?.code === 'PGRST116') {
      const email = session.user.email || '';
      logger.debug('[SESSION] No profile found, creating new profile for:', { email });
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
    logger.error('[SESSION] Session error:', { error: e });
  }
  logger.debug('[SESSION] Returning null bypassed, returning DEFAULT_USERS[0]');
  return DEFAULT_USERS[0];
};

// ============================================================================
// Authorization
// ============================================================================

export const hasPermission = async (requiredRoles: UserRole[]): Promise<boolean> => {
  const user = await getSessionUser();
  return !!user && requiredRoles.includes(user.role);
};

export const hasPermissionByRole = (userRole: UserRole, permission: Permission): boolean => {
  return permissionsHasPermissionByRole(userRole, permission);
};

export const checkPermission = async (permission: Permission): Promise<boolean> => {
  const user = await getSessionUser();
  return !!user && hasPermissionByRole(user.role, permission);
};

export const getUserPermissions = (userRole: UserRole): Permission[] => {
  return permissionsGetUserPermissions(userRole);
};

export { hasAllPermissions, hasAnyPermission };

// Role-based permission checks
export const canManageObjectives = () => hasPermission([UserRole.SuperAdmin, UserRole.Admin, UserRole.Director]);
export const canManageUsers = () => hasPermission([UserRole.SuperAdmin, UserRole.Admin]);
export const canViewSettings = () => hasPermission([UserRole.SuperAdmin, UserRole.Admin]);
export const canManageUnits = () => hasPermission([UserRole.SuperAdmin, UserRole.Admin]);
export const canConfigureSystem = () => hasPermission([UserRole.SuperAdmin, UserRole.Admin]);
export const canViewAuditLogs = () => hasPermission([UserRole.SuperAdmin, UserRole.Admin]);
export const canManageBusinessUnits = canManageUnits;

// Goal permissions
export const canCreateGoal = () => checkPermission(Permission.GOAL_CREATE);
export const canEditGoal = () => checkPermission(Permission.GOAL_EDIT);
export const canDeleteGoal = () => checkPermission(Permission.GOAL_DELETE);
export const canViewAllBUGoals = () => checkPermission(Permission.GOAL_VIEW_ALL_BU);

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
export const checkIntegrityAccess = () => hasPermission([UserRole.SuperAdmin, UserRole.Admin, UserRole.Director]);

// ============================================================================
// Audit Logging
// ============================================================================

export const logAudit = async (
  action: AuditLogEntry['action'],
  details: string,
  before?: unknown,
  after?: unknown,
  metadata?: Record<string, unknown>
): Promise<void> => {
  const user = await getSessionUser();
  
  // Compute diff if before/after provided
  let changes: Record<string, { from: unknown; to: unknown }> | undefined;
  if (before && after) {
    const beforeObj = before as Record<string, unknown>;
    const afterObj = after as Record<string, unknown>;
    changes = {};
    for (const key of Object.keys(afterObj)) {
      if (JSON.stringify(beforeObj[key]) !== JSON.stringify(afterObj[key])) {
        changes[key] = { from: beforeObj[key], to: afterObj[key] };
      }
    }
  }
  
  const entry: AuditLogEntry = {
    id: generateLocalUUID(),
    timestamp: new Date().toISOString(),
    userId: user?.id || 'SYSTEM',
    userName: user?.name || 'SYSTEM',
    action,
    details,
    metadata: {
      ...metadata,
      ...(changes && Object.keys(changes).length > 0 ? { changes } : {}),
      ...(before ? { before: deepClone(before) } : {}),
      ...(after ? { after: deepClone(after) } : {})
    }
  };
  AUDIT_LOGS.push(entry);

  try {
    await supabase.from('audit_logs').insert([entry]);
  } catch {
    // Audit logging should never break the app
  }
};

// Add helper for deep clone
const deepClone = (obj: unknown): unknown => {
  if (obj === null || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(deepClone);
  return JSON.parse(JSON.stringify(obj));
};

// ============================================================================
// Time Utilities
// ============================================================================

export const today = () => new Date().toISOString().split('T')[0];

export const fmt = (n: number) => new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 2 }).format(n);

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
  const weekNum = Math.ceil(((monday.getTime() - new Date(monday.getFullYear(), 0, 1).getTime()) / 86400000 + new Date(monday.getFullYear(), 0, 1).getDay() + 1) / 7);
  return `Week ${weekNum}, ${monday.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${sunday.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
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
      label: `Week ${weekNum}, ${mon.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${sun.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`,
      value: `W${weekNum}`
    });
  }
  return ranges;
};

export const generateReportId = (department: string, week: number, _year: number): string => {
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
// Objectives (Quarterly Objectives)
// ============================================================================

export const getObjectives = async (year: number): Promise<Objective[]> => {
  try {
    const client = supabaseAdmin || supabase;
    const { data, error } = await client
      .from('objectives')
      .select('*')
      .eq('year', year)
      .order('quarter', { ascending: true });
    if (error) throw error;
    return (data as Objective[]) || [];
  } catch {
    return [];
  }
};

export const getObjectiveByQuarter = async (quarter: string, year: number): Promise<Objective | null> => {
  try {
    const client = supabaseAdmin || supabase;
    const { data, error } = await client
      .from('objectives')
      .select('*')
      .eq('quarter', quarter)
      .eq('year', year)
      .single();
    if (error) return null;
    return data as Objective;
  } catch {
    return null;
  }
};

export const saveObjective = async (objective: Objective): Promise<{ error?: string }> => {
  try {
    const client = supabaseAdmin || supabase;
    
    // Check if objective exists for this quarter/year
    const { data: existing } = await client
      .from('objectives')
      .select('id')
      .eq('quarter', objective.quarter)
      .eq('year', objective.year)
      .single();
    
    if (existing) {
      // Update existing
      const { error } = await client
        .from('objectives')
        .update({ title: objective.title, updated_at: new Date().toISOString() })
        .eq('id', existing.id);
      if (error) throw error;
    } else {
      // Insert new
      const { error } = await client
        .from('objectives')
        .insert([objective]);
      if (error) throw error;
    }
    return {};
  } catch (e: any) {
    return { error: e.message };
  }
};

export const getSubKRTags = async (year: number): Promise<string[]> => {
  try {
    const krs = await getRegistryKeyResults(year);
    const subKRs = krs.filter(k => k.parent_kr_id !== null && k.parent_kr_id !== undefined);
    return subKRs.map(s => s.label).sort();
  } catch {
    return [];
  }
};

export const STRESSED_TAG = 'Stressed';

export const getGoalTagOptions = async (year: number): Promise<string[]> => {
  const subKRTags = await getSubKRTags(year);
  return [...subKRTags, STRESSED_TAG];
};

// ============================================================================
// Database Seeding
// ============================================================================

export const seedDatabase = async (): Promise<void> => {
  if (hasSeededDatabase) return;

  try {
    logger.info('[DB] Starting comprehensive seeding...');
    
    const seed = async (table: string, data: any[], label: string) => {
      const { error } = await supabase.from(table).upsert(data);
      if (error) {
        logger.error(`[DB] Error seeding ${label}:`, { error: error.message });
        throw error;
      }
      logger.debug(`[DB] ${label} seeded successfully`);
    };

    await seed('governance_config', [MOCK_GOVERNANCE_CONFIG], 'Governance config');
    await seed('business_units', MOCK_BUSINESS_UNITS, 'Business units');
    await seed('profiles', MOCK_USERS, 'User profiles');
    await seed('objectives', MOCK_OBJECTIVES, 'Objectives');
    await seed('key_results', MOCK_KRS, 'Key results');
    
    const activities = generateMockActivities(12, 2026);
    await seed('activities', activities, `Activities (${activities.length} records)`);

    hasSeededDatabase = true;
    logger.info('[DB] Database seeding completed successfully!');
  } catch (e) {
    logger.error('[DB] Seeding failed:', { error: e });
  }
};

// ============================================================================
// Goals
// ============================================================================

export const calculateGoalScore = (tasks: Task[]): number => {
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

    // Map snake_case DB columns to camelCase frontend properties
    const config: GovernanceConfig = {
      contentLockDay: data.content_lock_day ?? 2,
      contentLockTime: data.content_lock_time ?? '18:00',
      finalLockDay: data.final_lock_day ?? 9,
      finalLockTime: data.final_lock_time ?? '11:00',
      manualContentLock: data.manual_content_lock ?? false,
      manualFinalLock: data.manual_final_lock ?? false,
      disableLocks: data.disable_locks ?? false,
      allowedDomains: data.allowed_domains || BASE_DOMAINS,
      smtpEnabled: data.smtp_enabled ?? false,
      smtpHost: data.smtp_host || '',
      smtpPort: data.smtp_port || 587,
      smtpUser: data.smtp_user || '',
      smtpPass: data.smtp_pass || '',
      brandLogo: data.brand_logo || '',
      brandLandingImage: data.brand_landing_image || '',
      brandLoginImage: data.brand_login_image || '',
      ...data
    };

    ALLOWED_DOMAINS = config.allowedDomains || BASE_DOMAINS;
    DISABLE_LOCKS = config.disableLocks || false;

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
  // Map camelCase frontend properties back to snake_case DB columns
  const dbData = {
    id: 1,
    content_lock_day: config.contentLockDay,
    content_lock_time: config.contentLockTime,
    final_lock_day: config.finalLockDay,
    final_lock_time: config.finalLockTime,
    manual_content_lock: config.manualContentLock,
    manual_final_lock: config.manualFinalLock,
    disable_locks: config.disableLocks,
    allowed_domains: config.allowedDomains,
    smtp_enabled: config.smtpEnabled,
    smtp_host: config.smtpHost,
    smtp_port: config.smtpPort,
    smtp_user: config.smtpUser,
    smtp_pass: config.smtpPass,
    brand_logo: config.brandLogo,
    brand_landing_image: config.brandLandingImage,
    brand_login_image: config.brandLoginImage
  };

  await supabase.from('governance_config').upsert([dbData]);
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
    const goals = await supabase.from('activities').select('*');

    const userCount = users.length;
    const activeCount = users.filter(u => u.status === UserStatus.Active).length;
    const goalCount = goals.data?.length ?? 0;

    let score = 50;
    score += Math.min((activeCount / userCount) * 30, 30);
    score += Math.min(goalCount / 10, 20);

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
    const { data: goals } = await supabase.from('activities').select('*').eq('year', year);
    if (!goals) return [];

    const bus = await getBusinessUnits();
    const grouped: Record<string, { total: number; count: number }> = {};

    (goals as Goal[]).forEach(act => {
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

export const calculateOverallScore = (goals: Goal[]): number => {
  if (!goals.length) return 0;
  const total = goals.reduce((sum, a) => sum + (a.score || 0), 0);
  return Math.round(total / goals.length);
};

export const calculateIntegrityScore = (goals: Goal[]): number => {
  if (!goals.length) return 0;

  const compliantCount = goals.filter(a => a.score >= 50).length;
  const reportingDensity = Math.min(100, (goals.length / 13) * 100);
  const descriptionScore = (compliantCount / goals.length) * 40;
  const densityScore = (reportingDensity / 100) * 40;
  const consistencyScore = (goals.filter(a => a.score >= 50).length / goals.length) * 20;

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
  } catch { 
    return getMockAttendanceRecords();
  }
};

const getMockAttendanceRecords = (): AttendanceRecord[] => {
  const today = new Date().toISOString().split('T')[0];
  return [
    { id: '1', meetingId: today, userId: 'u1', name: 'John Doe', email: 'john@example.com', status: AttendanceStatus.Present, participationScore: 90, timeJoined: `${today}T09:05:00Z` },
    { id: '2', meetingId: today, userId: 'u2', name: 'Jane Smith', email: 'jane@example.com', status: AttendanceStatus.Present, participationScore: 85, timeJoined: `${today}T09:02:00Z` },
    { id: '3', meetingId: today, userId: 'u3', name: 'Bob Wilson', email: 'bob@example.com', status: AttendanceStatus.Remote, participationScore: 75, timeJoined: `${today}T09:15:00Z` },
    { id: '4', meetingId: today, userId: 'u4', name: 'Alice Brown', email: 'alice@example.com', status: AttendanceStatus.Present, participationScore: 95, timeJoined: `${today}T09:00:00Z` },
    { id: '5', meetingId: today, userId: 'u5', name: 'Charlie Davis', email: 'charlie@example.com', status: AttendanceStatus.Absent, participationScore: 0, timeJoined: undefined },
    { id: '6', meetingId: today, userId: 'u6', name: 'Eva Martinez', email: 'eva@example.com', status: AttendanceStatus.Excused, participationScore: 0, timeJoined: undefined },
  ];
};

export const calculateBUCompliance = async (buId: string): Promise<{ compliant: number; total: number; percentage: number }> => {
  try {
    const activities = await supabase.from('activities').select('*').eq('department', buId);
    const total = activities.data?.length ?? 0;
    const compliant = activities.data?.filter((a: Goal) => a.score >= 50).length ?? 0;
    return { compliant, total, percentage: total ? Math.round((compliant / total) * 100) : 0 };
  } catch {
    return { compliant: 0, total: 0, percentage: 0 };
  }
};

export type AIProvider = 'nvidia' | 'openrouter' | 'local';
export type AIModel = 'minimax-m2.5' | 'minimax-m2.7' | 'minimax-text-01' | 'claude' | 'gpt-4o' | 'gemini';

export interface AIMessage {
  role: 'system' | 'user';
  content: string;
}

export const getDefaultAIProvider = (): AIProvider => {
  return import.meta.env.VITE_LOCAL_AI_URL ? 'local' : 'nvidia';
};

export const callMinimaxDirect = async (messages: AIMessage[], model: AIModel = 'minimax-m2.5'): Promise<string> => {
  const apiKey = import.meta.env.VITE_NVIDIA_API_KEY;
  
  if (!apiKey) {
    throw new Error('NVIDIA API key not configured. Add VITE_NVIDIA_API_KEY to .env');
  }

  const modelMap: Record<AIModel, string> = {
    'minimax-m2.5': 'minimaxai/minimax-m2.5',
    'minimax-m2.7': 'minimaxai/minimax-m2.7',
    'minimax-text-01': 'minimaxai/minimax-text-01',
    'claude': 'anthropic/claude-3-5-sonnet-20241022',
    'gpt-4o': 'openai/gpt-4o',
    'gemini': 'google/gemini-2.0-flash-001'
  };

  const makeRequest = async (modelId: string): Promise<string> => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    try {
      const response = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: modelId,
          messages: messages,
          temperature: 0.2,
          max_tokens: 4096
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || `NVIDIA API error: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.choices?.[0]?.message?.content) {
        console.warn('Unexpected NVIDIA API response structure for model:', modelId);
        console.warn('Full response:', JSON.stringify(data, null, 2));
        throw new Error(`Invalid response structure from NVIDIA API for ${modelId}`);
      }
      
      return data.choices[0].message.content;
    } catch (err) {
      clearTimeout(timeoutId);
      throw err;
    }
  };

  const modelId = modelMap[model];
  
  try {
    return await makeRequest(modelId);
  } catch (err: any) {
    if (model === 'minimax-m2.7') {
      console.warn('MiniMax M2.7 failed, falling back to M2.5:', err.message);
      return await makeRequest('minimaxai/minimax-m2.5');
    }
    throw err;
  }
};

export const callLocalDirect = async (messages: AIMessage[], model: string = 'deepseek-ai/deepseek-v4-pro'): Promise<string> => {
  // Default to localhost:11434 for Ollama, adjust as needed for your local setup
  const apiUrl = import.meta.env.VITE_LOCAL_AI_URL || 'http://localhost:11434/api/chat';
  
  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: model,
      messages: messages,
      stream: false,
      options: {
        temperature: 0.2
      }
    })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || `Local AI error: ${response.status}`);
  }

  const data = await response.json();
  // Handle Ollama response format
  return data.message?.content || data.response || '';
};

export const callAIDirect = async (messages: AIMessage[], provider?: AIProvider, model?: string): Promise<string> => {
  const effectiveProvider = provider || getDefaultAIProvider();

  if (effectiveProvider === 'nvidia') {
    return callMinimaxDirect(messages, (model as AIModel) || 'minimax-m2.5');
  }
  
  if (effectiveProvider === 'local') {
    return callLocalDirect(messages, model || 'gemma4:latest');
  }

  const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error('OpenRouter API key not configured');
  }

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
      'HTTP-Referer': window.location.origin,
      'X-Title': '4CORE OKR'
    },
    body: JSON.stringify({
      model: model || 'openai/gpt-4o-mini',
      messages: messages,
      temperature: 0.2
    })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || `OpenRouter error: ${response.status}`);
  }

  const data = await response.json();
  return data.choices[0]?.message?.content || '';
};

// ============================================================================
// EXECUTIVE DASHBOARD - Weekly Data Functions
// ============================================================================

export interface WeeklyMetrics {
  tasksCompleted: number;
  tasksCompletedDelta: number;
  goalsCompleted: number;
  goalsCompletedDelta: number;
  onTrackRate: number;
  onTrackRateDelta: number;
  completionRate: number;
  completionRateDelta: number;
}

export interface KRBUProgress {
  kr: string;
  krId: string;
  bu: string;
  buId: string;
  score: number;
  status: 'Green' | 'Amber' | 'Red';
}

export interface PerformancePoint {
  week: number;
  score: number;
  onTrack: number;
  atRisk: number;
  behind: number;
  total: number;
}

function getWeekDateRange(week: number, year: number): { start: Date; end: Date } {
  const jan1 = new Date(year, 0, 1);
  const daysToFirstThursday = (4 - jan1.getDay() + 7) % 7;
  const firstThursday = new Date(year, 0, 1 + daysToFirstThursday);
  const weekStart = new Date(firstThursday);
  weekStart.setDate(firstThursday.getDate() + (week - 1) * 7);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);
  return { start: weekStart, end: weekEnd };
}

export const getWeeklyMetrics = async (
  week: number,
  year: number,
  buFilter?: string
): Promise<WeeklyMetrics> => {
  const { start: currentStart, end: currentEnd } = getWeekDateRange(week, year);
  const { start: prevStart, end: prevEnd } = getWeekDateRange(week - 1, year);

  const [currentGoalsRes, prevGoalsRes, krsRes, busRes] = await Promise.all([
    supabase
      .from('goals')
      .select('id, status, business_unit')
      .eq('week', week)
      .eq('year', year)
      .in('status', ['submitted', 'approved']),
    supabase
      .from('goals')
      .select('id, status')
      .eq('week', week - 1)
      .eq('year', year)
      .in('status', ['submitted', 'approved']),
    supabase
      .from('key_results')
      .select('id, status, progress, label, business_unit')
      .neq('label', 'SYSTEM_LOCK'),
    supabase
      .from('business_units')
      .select('id, name')
  ]);

  const currentGoals = currentGoalsRes.data || [];
  const prevGoals = prevGoalsRes.data || [];
  const krs = (krsRes.data || []) as { id: string; status: string; progress: number; label: string; business_unit: string }[];
  const bus = busRes.data || [];

  const busFilterIds = buFilter 
    ? bus.filter(b => b.name === buFilter).map(b => b.id)
    : bus.map(b => b.id);

  const filteredKRs = krs.filter(kr => 
    kr.business_unit ? busFilterIds.includes(kr.business_unit) : true
  );

  const goalsCompleted = currentGoals.filter(g => 
    buFilter ? g.business_unit === buFilter : true
  ).length;
  const prevGoalsCompleted = prevGoals.filter(g => 
    buFilter ? g.business_unit === buFilter : true
  ).length;

  const onTrack = filteredKRs.filter(k => k.status === 'Green').length;
  const total = filteredKRs.length;
  const onTrackRate = total > 0 ? Math.round((onTrack / total) * 100) : 0;
  const prevOnTrack = total > 0 ? onTrack : 0;

  const goalsExpected = buFilter ? 1 : busFilterIds.length;
  const completionRate = goalsExpected > 0 ? Math.round((goalsCompleted / goalsExpected) * 100) : 0;

  return {
    tasksCompleted: filteredKRs.filter(kr => kr.progress > 0).length,
    tasksCompletedDelta: 0,
    goalsCompleted,
    goalsCompletedDelta: goalsCompleted - prevGoalsCompleted,
    onTrackRate,
    onTrackRateDelta: 0,
    completionRate,
    completionRateDelta: completionRate - (prevGoalsExpected => prevGoalsExpected > 0 ? Math.round((prevGoalsCompleted / prevGoalsExpected) * 100) : 0)(buFilter ? 1 : busFilterIds.length),
  };
};

export const getKRProgressByBU = async (
  week: number,
  year: number,
  buFilter?: string
): Promise<KRBUProgress[]> => {
  const [krsRes, busRes] = await Promise.all([
    supabase
      .from('key_results')
      .select('id, label, progress, status, business_unit')
      .neq('label', 'SYSTEM_LOCK'),
    supabase
      .from('business_units')
      .select('id, name')
  ]);

  const krs = (krsRes.data || []) as { id: string; label: string; progress: number; status: string; business_unit: string }[];
  const bus = busRes.data || [];

  const busFilterIds = buFilter
    ? bus.filter(b => b.name === buFilter).map(b => b.id)
    : bus.map(b => b.id);

  const filteredBus = bus.filter(b => busFilterIds.includes(b.id));

  const cells: KRBUProgress[] = [];
  const krLabels = [...new Set(krs.map(k => k.label))].sort();

  for (const krLabel of krLabels) {
    const parentKR = krs.find(k => k.label === krLabel && !k.parent_kr_id);
    const baseScore = parentKR?.progress ?? 50;
    const baseStatus = parentKR?.status as 'Green' | 'Amber' | 'Red' || 'Amber';

    for (const bu of filteredBus) {
      const buKR = krs.find(k => k.label === krLabel && k.business_unit === bu.id);
      const score = buKR?.progress ?? baseScore;
      const status = (buKR?.status as 'Green' | 'Amber' | 'Red') || baseStatus;

      cells.push({
        kr: krLabel,
        krId: buKR?.id || parentKR?.id || '',
        bu: bu.name,
        buId: bu.id,
        score,
        status
      });
    }
  }

  return cells;
};

export const getHistoricalPerformance = async (
  weeksBack: number
): Promise<PerformancePoint[]> => {
  const now = getWATTime ? getWATTime() : new Date();
  const currentWeek = Math.ceil((now.getTime() - new Date(now.getFullYear(), 0, 1).getTime()) / (86400000 * 7));

  const points: PerformancePoint[] = [];

  for (let i = weeksBack; i >= 1; i--) {
    const week = Math.max(1, currentWeek - i + 1);
    
    const goalsRes = await supabase
      .from('goals')
      .select('id, status')
      .eq('week', week)
      .eq('year', now.getFullYear())
      .in('status', ['submitted', 'approved']);

    const krsRes = await supabase
      .from('key_results')
      .select('id, status')
      .neq('label', 'SYSTEM_LOCK');

    const goals = goalsRes.data || [];
    const krs = (krsRes.data || []) as { status: string }[];
    
    const submitted = goals.length;
    const onTrack = krs.filter(k => k.status === 'Green').length;
    const atRisk = krs.filter(k => k.status === 'Amber').length;
    const behind = krs.filter(k => k.status === 'Red').length;
    const total = krs.length;

    const score = total > 0 
      ? Math.round(((onTrack + atRisk * 0.5) / total) * 100)
      : Math.round((submitted / Math.max(submitted, 1)) * 100);

    points.push({ week, score, onTrack, atRisk, behind, total });
  }

  return points;
};
