
import { Task, TaskStatus, UserRole, UserStatus, AuditLogEntry, User, BusinessUnit, KeyResult, Activity, BUPerformanceDataPoint, StrategicNote, ALLOWED_DOMAINS as BASE_DOMAINS, Violation, Contribution, Expense, MonthlyFinancialSummary, AttendanceRecord } from './types';
import { supabase } from './supabaseClient';

export let ALLOWED_DOMAINS: string[] = [...BASE_DOMAINS];
export let DISABLE_LOCKS = false;
let CACHED_IP: string = 'RESOLVING...';

export const AUDIT_LOGS: AuditLogEntry[] = [];

// CACHE LAYER: Singleton storage for reducing database flight count
const CACHE: {
  users: { data: User[] | null, lastFetch: number },
  bus: { data: BusinessUnit[] | null, lastFetch: number },
  krs: { data: KeyResult[] | null, lastFetch: number },
  governance: { data: any | null, lastFetch: number },
  performance: { data: BUPerformanceDataPoint[] | null, lastFetch: number }
} = {
  users: { data: null, lastFetch: 0 },
  bus: { data: null, lastFetch: 0 },
  krs: { data: null, lastFetch: 0 },
  governance: { data: null, lastFetch: 0 },
  performance: { data: null, lastFetch: 0 }
};

const STALE_TIME = 30000; // 30 seconds cache TTL for high-frequency data
let hasSeededDatabase = false; // Optimization: prevent repeated seeding checks

const isCacheValid = (key: keyof typeof CACHE) => {
  return CACHE[key].data !== null && (Date.now() - CACHE[key].lastFetch < STALE_TIME);
};

// FR 2025.IMMUTABLE: Core Strategic Roadmap for 2025 (Full Cycle)
export const HARDCODED_2025_KRS: KeyResult[] = [
  // Q1 2025
  { id: '2025-q1-kr1', label: 'KR1', quarter: 'Q1', year: 2025, title: 'Revenue Generation', description: '<p>1.1 Achieve [X]% Quarter-on-Quarter Revenue Growth</p>', owner_id: 'SYSTEM', progress: 0, status: 'Amber' },
  { id: '2025-q1-kr2', label: 'KR2', quarter: 'Q1', year: 2025, title: 'Intentional Structural Reforms', description: '<p>Review business Structures and Processes to optimize performance.</p>', owner_id: 'SYSTEM', progress: 0, status: 'Amber' },
  { id: '2025-q1-kr3', label: 'KR3', quarter: 'Q1', year: 2025, title: 'Data-driven Innovation', description: '<p>Deliberate translation of user feedback for product evolution.</p>', owner_id: 'SYSTEM', progress: 0, status: 'Amber' },

  // Q2 2025
  { id: '2025-q2-kr1', label: 'KR1', quarter: 'Q2', year: 2025, title: 'Market Penetration & Reach', description: '<p>Expand market presence in secondary regions by 15% through strategic partnerships.</p>', owner_id: 'SYSTEM', progress: 0, status: 'Amber' },
  { id: '2025-q2-kr2', label: 'KR2', quarter: 'Q2', year: 2025, title: 'Operational Excellence', description: '<p>Reduce internal processing latency by 20% through automated workflow triggers.</p>', owner_id: 'SYSTEM', progress: 0, status: 'Amber' },

  // Q3 2025
  { id: '2025-q3-kr1', label: 'KR1', quarter: 'Q3', year: 2025, title: 'Customer Experience Transformation', description: '<p>Deploy omnichannel support infrastructure with AI-assisted sentiment analysis.</p>', owner_id: 'SYSTEM', progress: 0, status: 'Amber' },
  { id: '2025-q3-kr2', label: 'KR2', quarter: 'Q3', year: 2025, title: 'Product Ecosystem Diversification', description: '<p>Launch two major service extensions catering to enterprise high-volume nodes.</p>', owner_id: 'SYSTEM', progress: 0, status: 'Amber' },

  // Q4 2025
  { id: '2025-q4-kr1', label: 'KR1', quarter: 'Q4', year: 2025, title: 'Profitability Optimization', description: '<p>Achieve net margin improvements of 5% through cloud resource cost optimization.</p>', owner_id: 'SYSTEM', progress: 0, status: 'Amber' },
  { id: '2025-q4-kr2', label: 'KR2', quarter: 'Q4', year: 2025, title: 'Strategic Roadmap Review 2026', description: '<p>Finalize the 2026 Strategic Plan with full stakeholder alignment by EOY.</p>', owner_id: 'SYSTEM', progress: 0, status: 'Amber' },
];

// FR 2026.IMMUTABLE: Strategic Roadmap for 2026
export const HARDCODED_2026_KRS: KeyResult[] = [
  { id: '2026-q1-kr1', label: 'KR1', quarter: 'Q1', year: 2026, title: 'Scaled Revenue Operations', description: '<p>1.1 Achieve sustained growth through automated sales pipelines and market expansion.</p>', owner_id: 'SYSTEM', progress: 0, status: 'Amber' },
  { id: '2026-q1-kr2', label: 'KR2', quarter: 'Q1', year: 2026, title: 'Global Process Standardization', description: '<p>2.1 Align all regional units under unified governance protocols and technology stacks.</p>', owner_id: 'SYSTEM', progress: 0, status: 'Amber' },
  { id: '2026-q1-kr3', label: 'KR3', quarter: 'Q1', year: 2026, title: 'Next-Gen Product Lifecycle', description: '<p>3.1 Launch AI-integrated service modules across all enterprise platforms.</p>', owner_id: 'SYSTEM', progress: 0, status: 'Amber' },
];

export const seedDatabase = async () => {
  // Optimization: Skip if already seeded in this session
  if (hasSeededDatabase) {
    return;
  }

  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      console.log("Seed skipped: Not authenticated");
      return;
    }

    const allKRs = [...HARDCODED_2025_KRS, ...HARDCODED_2026_KRS];

    const { count, error: countError } = await supabase
      .from('key_results')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      console.error("Seed Check Error:", countError);
      return;
    }

    if (!count || count === 0) {
      console.log("Seeding Key Results...");
      const { error } = await supabase.from('key_results').insert(allKRs);
      if (error) console.error("Seeding Error:", error);
      else {
        console.log("Key Results Seeded Successfully.");
        hasSeededDatabase = true; // Mark as seeded to prevent repeated checks
      }
    } else {
      hasSeededDatabase = true; // Already seeded, skip future checks
    }
  } catch (e) {
    console.error("Seeding Exception:", e);
  }
};

const DEFAULT_USERS: User[] = [
  {
    id: 'f3312dd7-8f3a-4760-81b0-7e000c2feb18',
    firstName: 'System',
    lastName: 'Administrator',
    name: 'System Administrator',
    email: 'admin@fcis.com',
    role: UserRole.SuperAdmin,
    department: 'IT',
    avatarUrl: 'https://ui-avatars.com/api/?name=System+Admin&background=0f172a&color=fff',
    status: UserStatus.Active,
    mustChangePassword: false
  },
  {
    id: 'user-director-001',
    firstName: 'Corporate',
    lastName: 'Director',
    name: 'Corporate Director',
    email: 'director@fcis.com',
    role: UserRole.Director,
    department: 'FINANCE',
    avatarUrl: 'https://ui-avatars.com/api/?name=Corporate+Director&background=1e293b&color=fff',
    status: UserStatus.Active,
    mustChangePassword: false
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

const getHardcodedKRs = (year: number): KeyResult[] => {
  if (year === 2025) return HARDCODED_2025_KRS;
  if (year === 2026) return HARDCODED_2026_KRS;
  return [];
};

export const getRegistryKeyResults = async (year?: number): Promise<KeyResult[]> => {
  try {
    if (isCacheValid('krs') && !year) return CACHE.krs.data!;

    const { data, error } = await supabase.from('key_results').select('*');
    if (error) throw error;

    const dbKrs = (data as KeyResult[]) || [];
    const baseKrs = year ? getHardcodedKRs(year) : [...HARDCODED_2025_KRS, ...HARDCODED_2026_KRS];

    const filteredDb = year
      ? dbKrs.filter(k => k.year === year)
      : dbKrs;

    const merged = [...baseKrs];
    filteredDb.forEach(dbKr => {
      const idx = merged.findIndex(m => m.id === dbKr.id);
      if (idx > -1) merged[idx] = dbKr;
      else merged.push(dbKr);
    });

    if (!year) {
      CACHE.krs.data = merged;
      CACHE.krs.lastFetch = Date.now();
    }

    return merged;
  } catch (e) {
    return year ? getHardcodedKRs(year) : [...HARDCODED_2025_KRS, ...HARDCODED_2026_KRS];
  }
};

export const generateLocalUUID = (): string => {
  return crypto.randomUUID();
};

export const getRegistryUsers = async (): Promise<User[]> => {
  try {
    if (isCacheValid('users')) return CACHE.users.data!;

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
  } catch (e) {
    return DEFAULT_USERS;
  }
};

export const getStoredUsers = getRegistryUsers;

export const saveStoredUsers = async (users: User[]) => {
  try {
    const { error } = await supabase.from('profiles').upsert(users);
    if (error) {
      console.error('[AUTH_ERROR] Failed to save users:', error);
    }
    CACHE.users.data = null;
    CACHE.users.lastFetch = 0;
  } catch (e) {
    console.error('[AUTH_ERROR] Exception saving users:', e);
  }
  window.dispatchEvent(new Event('4COREUserUpdate'));
};

export const getSimulatedUser = (): User | null => {
  // DEFENSE IN DEPTH: Use AND logic to ensure simulation is disabled in production
  // Even if __SIMULATION_ENABLED__ is somehow manipulated, PROD flag provides backup
  if (!__SIMULATION_ENABLED__ && import.meta.env.PROD) {
    return null; // Safe: simulation disabled in production
  }

  // Additional runtime safety check
  if (import.meta.env.PROD) {
    console.warn('[SECURITY] Simulation access blocked in production environment');
    return null;
  }

  const simulated = localStorage.getItem('4CORE_simulated_user');
  return simulated ? JSON.parse(simulated) : null;
};

export const setSimulatedUser = (user: User | null): void => {
  // DEFENSE IN DEPTH: Use AND logic to ensure simulation is disabled in production
  if (!__SIMULATION_ENABLED__ && import.meta.env.PROD) {
    return; // Safe: simulation disabled in production
  }

  // Additional runtime safety check
  if (import.meta.env.PROD) {
    console.warn('[SECURITY] Simulation modification blocked in production environment');
    return;
  }

  if (user) localStorage.setItem('4CORE_simulated_user', JSON.stringify(user));
  else localStorage.removeItem('4CORE_simulated_user');
  window.dispatchEvent(new Event('4COREUserUpdate'));
};

export const getSessionUser = async (): Promise<User | null> => {
  // DEFENSE IN DEPTH: Check production FIRST - simulation not allowed in production
  if (import.meta.env.PROD) {
    console.warn('[SECURITY] Simulation access blocked in production environment');
  } else {
    // Only allow simulated users in non-production
    const simulated = getSimulatedUser();
    if (simulated) return simulated;
  }

  try {
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError) {
      console.error('[AUTH_ERROR] Session error:', sessionError);
    }

    if (session?.user) {
      const { data, error } = await supabase.from('profiles').select('*').eq('auth_id', session.user.id).single();
      if (error && error.code !== 'PGRST116') {
        console.error('[AUTH_ERROR] Profile fetch error:', error);
      }

      if (data) return data as User;

      if (error && error.code === 'PGRST116') {
        const newUser: User = {
          id: generateLocalUUID(),
          auth_id: session.user.id,
          email: session.user.email || '',
          firstName: session.user.email?.split('@')[0] || 'User',
          lastName: '',
          name: session.user.email?.split('@')[0] || 'User',
          role: UserRole.Viewer,
          department: 'Registry',
          avatarUrl: `https://ui-avatars.com/api/?name=${session.user.email || 'User'}&background=random`,
          status: UserStatus.Active
        };
        const { error: insertError } = await supabase.from('profiles').insert([newUser]);
        if (insertError) {
          console.error('[AUTH_ERROR] Profile creation error:', insertError);
        }
        return newUser;
      }
    }
  } catch (e) {
    console.error('[AUTH_ERROR] Exception in getSessionUser:', e);
  }

  return null;
};

export const hasPermission = async (requiredRoles: UserRole[]): Promise<boolean> => {
  const user = await getSessionUser();
  return !!user && requiredRoles.includes(user.role);
};

export const canManageObjectives = async (): Promise<boolean> => hasPermission([UserRole.SuperAdmin, UserRole.Admin, UserRole.Director]);
export const canViewStrategicNotes = async (): Promise<boolean> => hasPermission([UserRole.SuperAdmin, UserRole.Admin, UserRole.Director]);
export const canManageUsers = async (): Promise<boolean> => hasPermission([UserRole.SuperAdmin, UserRole.Admin]);
export const canViewSettings = async (): Promise<boolean> => hasPermission([UserRole.SuperAdmin, UserRole.Admin]);
export const canManageUnits = async (): Promise<boolean> => hasPermission([UserRole.SuperAdmin, UserRole.Admin]);
export const canManageBusinessUnits = canManageUnits;
export const canConfigureSystem = async (): Promise<boolean> => hasPermission([UserRole.SuperAdmin, UserRole.Admin]);
export const canViewAuditLogs = async (): Promise<boolean> => hasPermission([UserRole.SuperAdmin, UserRole.Admin]);

export const getBusinessUnits = async (): Promise<BusinessUnit[]> => {
  try {
    if (isCacheValid('bus')) return CACHE.bus.data!;

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
  } catch (e) {
    return DEFAULT_BUSINESS_UNITS;
  }
};

export const saveBusinessUnits = async (units: BusinessUnit[]) => {
  try {
    await supabase.from('business_units').upsert(units);
  } catch (e) { }
  window.dispatchEvent(new Event('4COREBUUpdate'));
};

export const getWATTime = (): Date => {
  return new Date(new Date().toLocaleString("en-US", { timeZone: "Africa/Lagos" }));
};

export const getCurrentQuarterInfo = () => {
  const now = getWATTime();
  const month = now.getMonth();
  const quarters = ['Q1', 'Q2', 'Q3', 'Q4'];
  return { year: now.getFullYear(), quarter: quarters[Math.floor(month / 3)], quarterIndex: Math.floor(month / 3), quarterLabel: quarters[Math.floor(month / 3)] };
};

export const logAudit = async (action: AuditLogEntry['action'], details: string, metadata?: Record<string, any>) => {
  const user = await getSessionUser();
  const newLog: AuditLogEntry = {
    id: generateLocalUUID(),
    timestamp: new Date().toISOString(),
    userId: user?.id || 'SYSTEM',
    userName: user?.name || 'SYSTEM',
    action,
    details,
    ipAddress: CACHED_IP,
    metadata
  };
  AUDIT_LOGS.unshift(newLog);
  try {
    await supabase.from('audit_logs').insert([{
      user_id: user?.id || 'SYSTEM',
      user_name: user?.name || 'SYSTEM',
      action,
      details,
      ip_address: CACHED_IP,
      metadata
    }]);
  } catch (e) { }
};

const dispatchEmail = async (to: string, subject: string, body: string) => {
  const config = await getGovernanceConfig();
  if (!config.smtpEnabled) return;

  logAudit('SYSTEM', `Email Dispatch Triggered: ${subject} to ${to}`);

  try {
    // SECURITY: This calls the Supabase Edge Function configured for SMTP relays
    // It now uses secure Deno Edge function Environment Variables inside the function itself.
    const { error } = await supabase.functions.invoke('send-email', {
      body: {
        to,
        subject,
        content: body
      }
    });
    if (error) throw error;
  } catch (e) {
    console.error(`[RELAY_FAILURE] Node synchronization error during mail dispatch:`, e);
  }
};

export const testSMTPSettings = async (config: GovernanceConfig, testEmail: string): Promise<{ success: boolean; message: string }> => {
  logAudit('SYSTEM', `Manual SMTP Connection Test Initiated to ${testEmail}`);

  try {
    const { data, error } = await supabase.functions.invoke('send-email', {
      body: {
        to: testEmail,
        subject: '4CORE Infrastructure Test: SMTP Handshake',
        content: `
          <h1>SMTP Node Verification Successful</h1>
          <p>Your identity node has successfully established a handshake with the 4CORE Governance Relay.</p>
          <p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
          <p><strong>Operator:</strong> SYSTEM_AUDIT</p>
        `
      }
    });

    if (error) throw error;

    return { success: true, message: 'Node synchronization successful. Test packet dispatched.' };
  } catch (e: any) {
    console.error('[SMTP_TEST_ERROR]', e);
    return { success: false, message: e.message || 'Remote handshake failed. Verify SMTP parameters and provider relay rules.' };
  }
};

export const triggerWelcomeEmail = async (user: User) => {
  const body = `
    <h2>Welcome to 4CORE Unified Governance</h2>
    <p>Your identity node has been provisioned.</p>
    <p><strong>Username:</strong> ${user.email}</p>
    <p>Please log in to synchronize your performance metrics.</p>
  `;
  await dispatchEmail(user.email, 'Identity Provisioned: 4CORE Access Authorized', body);
};

export const triggerReminderEmail = async (email: string, week: number) => {
  const body = `
    <h2>Governance Reminder: Week ${week}</h2>
    <p>The reporting window for Week ${week} is now active. Please ensure all strategic updates are committed before the Wednesday 18:00 WAT threshold.</p>
  `;
  await dispatchEmail(email, `Metric Synchronization Reminder: Week ${week}`, body);
};

export const triggerStatusLockEmail = async (email: string, type: 'CONTENT' | 'FINAL') => {
  const body = `
    <h2>Security Protocol: Phase ${type} Lock Imminent</h2>
    <p>Warning: The governance node will enter ${type} Lock phase in T-minus 2 hours. All pending updates must be finalized immediately.</p>
  `;
  await dispatchEmail(email, `Priority Alert: Governance Lock Sequence Initiated`, body);
};


export const exportAuditLogsToCSV = () => {
  if (AUDIT_LOGS.length === 0) return;
  const headers = "Timestamp,User,Action,Details,IP Address\n";
  const rows = AUDIT_LOGS.map(log => `${log.timestamp},${log.userName},${log.action},"${log.details.replace(/"/g, '""')}",${log.ipAddress || ''}`).join("\n");
  const blob = new Blob([headers + rows], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `4CORE_audit_log_${new Date().toISOString().split('T')[0]}.csv`;
  a.click();
};

export const getBUPerformanceData = async (buId?: string, weekFilter?: string): Promise<BUPerformanceDataPoint[]> => {
  try {
    if (isCacheValid('performance') && !buId && !weekFilter) return CACHE.performance.data!;

    const year = getWATTime().getFullYear();
    const { data: activities, error } = await supabase.from('activities').select('*').eq('year', year);
    if (error) throw error;
    const data = (activities as Activity[]) || [];
    const weeks = Array.from(new Set(data.map(a => a.week))).sort((a, b) => a - b);
    const bus = await getBusinessUnits();
    const result = weeks.map(w => {
      const weekActs = data.filter(a => a.week === w);
      const row: BUPerformanceDataPoint = { week: `W${w.toString().padStart(2, '0')}`, totalCompanyScore: 0 };
      let totalScore = 0;
      bus.forEach(bu => {
        const buActs = weekActs.filter(a => a.department === bu.name);
        const avg = buActs.length > 0 ? buActs.reduce((acc, curr) => acc + curr.score, 0) / buActs.length : 0;
        row[bu.name] = Math.round(avg);
        totalScore += avg;
      });
      row.totalCompanyScore = Math.round(totalScore / (bus.length || 1));
      return row;
    });

    if (!buId && !weekFilter) {
      CACHE.performance.data = result;
      CACHE.performance.lastFetch = Date.now();
    }

    return result;
  } catch (e) { return []; }
};

export const getStrategicNotes = async (): Promise<StrategicNote[]> => {
  try {
    const { data, error } = await supabase.from('strategic_notes').select('*');
    if (error) throw error;
    return (data as StrategicNote[]) || [];
  } catch (e) { return []; }
};

export const addStrategicNote = async (note: StrategicNote) => {
  try { await supabase.from('strategic_notes').insert([note]); } catch (e) { }
  logAudit('CREATE', `Strategic session note added: ${note.title}`);
};

export const updateStrategicNote = async (note: StrategicNote) => {
  try {
    const { error } = await supabase.from('strategic_notes').update(note).eq('id', note.id);
    if (error) throw error;
  } catch (e) { }
  logAudit('UPDATE', `Strategic session note updated: ${note.title}`);
};

export const deleteStrategicNote = async (id: string) => {
  try {
    const { error } = await supabase.from('strategic_notes').delete().eq('id', id);
    if (error) throw error;
  } catch (e) { }
  logAudit('DELETE', `Strategic session note deleted: ${id}`);
};

export const getCurrentWeekNumber = () => {
  const now = getWATTime();
  const startOfYear = new Date(now.getFullYear(), 0, 1);
  const diff = now.getTime() - startOfYear.getTime();
  const week = Math.ceil(diff / (1000 * 60 * 60 * 24 * 7));
  return { week: `Week ${week}`, year: now.getFullYear() };
};

export const getCurrentWeekRange = () => {
  const now = getWATTime();
  const day = now.getDay();
  const diff = now.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(now.setDate(diff));
  const sunday = new Date(now.setDate(diff + 6));
  return `${monday.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${sunday.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}, ${monday.getFullYear()}`;
};

export const getRecentWeekRanges = () => {
  const now = getWATTime();
  const ranges = [];
  for (let i = 0; i < 8; i++) {
    const d = new Date(now);
    d.setDate(now.getDate() - (i * 7));
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    const mon = new Date(d.setDate(diff));
    const sun = new Date(d.setDate(diff + 6));
    const startOfYear = new Date(mon.getFullYear(), 0, 1);
    const weekNum = Math.ceil((((mon.getTime() - startOfYear.getTime()) / 86400000) + startOfYear.getDay() + 1) / 7);
    ranges.push({ label: `Week ${weekNum}: ${mon.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${sun.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}, ${sun.getFullYear()}`, value: `W${weekNum}` });
  }
  return ranges;
};

export const formatDateWAT = (d: Date) => `${d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).replace(/,/g, '')}, ${d.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}`;

export interface GovernanceConfig {
  contentLockDay: number;
  contentLockTime: string;
  finalLockDay: number;
  finalLockTime: string;
  manualContentLock: boolean;
  manualFinalLock: boolean;
  allowedDomains: string[];
  disableLocks?: boolean;
  brandLogo?: string;
  brandLandingImage?: string;
  brandLoginImage?: string;
  smtpEnabled?: boolean;
  smtpHost?: string;
  smtpPort?: number;
  smtpUser?: string;
  smtpPass?: string;
}

export const getGovernanceConfig = async (): Promise<GovernanceConfig> => {
  try {
    const { data, error } = await supabase.from('governance_config').select('*').single();
    if (error) throw error;
    const config = data || {
      contentLockDay: 2, contentLockTime: "18:00", finalLockDay: 2, finalLockTime: "11:00",
      manualContentLock: false, manualFinalLock: false, allowedDomains: BASE_DOMAINS,
      disableLocks: false, smtpEnabled: false
    };
    ALLOWED_DOMAINS = config.allowedDomains || BASE_DOMAINS;
    DISABLE_LOCKS = config.disableLocks || false;

    const localSmtp = localStorage.getItem('4CORE_smtp_settings');
    if (localSmtp) {
      try {
        const smtp = JSON.parse(localSmtp);
        config.smtpEnabled = smtp.enabled ?? config.smtpEnabled;
        config.smtpHost = smtp.host || config.smtpHost;
        config.smtpPort = smtp.port || config.smtpPort;
        config.smtpUser = smtp.user || config.smtpUser;
        config.smtpPass = smtp.pass || config.smtpPass;
      } catch { }
    }

    if (!config.smtpHost) {
      // Set default SMTP credentials in localStorage if not present
      const localSmtp = localStorage.getItem('4CORE_smtp_settings');
      if (!localSmtp) {
        // Note: wghp2.wghservers.com may not work from Supabase - use a reliable SMTP
        const defaultSmtp = {
          enabled: true,
          host: 'smtp.gmail.com',
          port: 465,
          user: 'your-email@gmail.com',
          pass: 'your-app-password'
        };
        localStorage.setItem('4CORE_smtp_settings', JSON.stringify(defaultSmtp));
        config.smtpEnabled = true;
        config.smtpHost = defaultSmtp.host;
        config.smtpPort = defaultSmtp.port;
        config.smtpUser = defaultSmtp.user;
        config.smtpPass = defaultSmtp.pass;
      }
    }

    return config;
  } catch (e) {
    return {
      contentLockDay: 2, contentLockTime: "18:00", finalLockDay: 2, finalLockTime: "11:00",
      manualContentLock: false, manualFinalLock: false, allowedDomains: BASE_DOMAINS,
      disableLocks: false, smtpEnabled: false
    };
  }
};

export const saveGovernanceConfig = async (config: GovernanceConfig) => {
  try {
    // Don't save SMTP credentials to database - store only in localStorage
    // This prevents exposure via database RLS policies
    const { smtpPass, smtpUser, smtpHost, smtpPort, smtpEnabled, ...configWithoutPassword } = config;
    await supabase.from('governance_config').upsert({ id: 1, ...configWithoutPassword });
  } catch (e) { }
  ALLOWED_DOMAINS = config.allowedDomains;
  DISABLE_LOCKS = config.disableLocks || false;

  // Store SMTP in localStorage only (not sent to database)
  localStorage.setItem('4CORE_smtp_settings', JSON.stringify({
    enabled: config.smtpEnabled,
    host: config.smtpHost,
    port: config.smtpPort,
    user: config.smtpUser,
    pass: config.smtpPass
  }));

  CACHE.governance.data = null;
  window.dispatchEvent(new Event('4COREGovernanceUpdate'));
};

export const addAllowedDomain = (domain: string) => {
  if (domain && !ALLOWED_DOMAINS.includes(domain)) {
    ALLOWED_DOMAINS = [...ALLOWED_DOMAINS, domain];
  }
};

export const removeAllowedDomain = (domain: string) => {
  ALLOWED_DOMAINS = ALLOWED_DOMAINS.filter(d => d !== domain);
};

export const getLockState = () => {
  const now = getWATTime();
  const currentDay = now.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();

  // Phase 1: Full Edit (Sun 00:00 -> Wed 12:00)
  // Phase 2: Partial Lock (Wed 12:01 -> Tue 11:00 NEXT WEEK) - Status Only
  // Phase 3: Full Lock (Tue 11:01 NEXT WEEK onwards) - Read Only

  // We need to determine the current phase relative to the *current reporting week*.
  // Assuming "Current Week" starts Sunday.

  let phase: 'OPEN' | 'PARTIAL' | 'LOCKED' = 'OPEN';
  let label = 'Open for Reporting';
  let countdown = '';

  // Check for Phase 1: Sun 00:00 to Wed 12:00
  const isWedAfterNoon = currentDay > 3 || (currentDay === 3 && (currentHour > 12 || (currentHour === 12 && currentMinute >= 1)));

  if (!isWedAfterNoon) {
    phase = 'OPEN';
    label = 'Full Edit Mode';
    // Countdown to Wed 12:00
    const wedNoon = new Date(now);
    wedNoon.setDate(now.getDate() + (3 - currentDay));
    wedNoon.setHours(12, 0, 0, 0);
    const diff = wedNoon.getTime() - now.getTime();
    const h = Math.floor(diff / (1000 * 60 * 60));
    countdown = `${h}h remaining`;
  } else {
    // We are past Wed 12:00. Now check if we are past Tue 11:00 of the *next* week.
    // Actually, the requirement says "Tuesday 11:00 AM of the following week".
    // This implies the cycle is:
    // Week N starts Sunday.
    // Week N Open: Sun -> Wed 12:00
    // Week N Partial: Wed 12:01 -> Next Tue 11:00
    // Week N Locked: Next Tue 11:01 -> Forever

    // However, `getLockState` is usually called to check the status of the *current* week's report.
    // If I am in Week N, and it is Thursday, I am in Partial mode for Week N.
    // If I am in Week N+1, and it is Monday, I am still in Partial mode for Week N (previous week).

    // This function needs to return the global state of "Now".
    // But lock status is relative to a specific *reporting week*.

    // Let's redefine getLockState to return the current *time* context, 
    // and helper functions will take a `targetWeek` to determine status.

    // For backward compatibility with the UI header that shows "Time Remaining":
    // We will show time remaining until the *next* major deadline (Wed 12:00 or Tue 11:00).

    // If today is Thu, Fri, Sat, Sun, Mon, or Tue (<11am): We are in the "Partial Window" for the *current active report* (which might be last week's).
    // But wait, "Current Week" usually refers to the week currently happening.

    // Let's simplify:
    // The UI needs to know: "Can I edit the report for Week X?"

    // We will return a generic lock object here for the UI header, targeting the *current calendar week's* deadlines.
    phase = 'PARTIAL';
    label = 'Status-Only Mode';
    countdown = 'Until Tue 11:00';
  }

  return {
    phase,
    label,
    countdown,
    manualContentOverride: false, // Deprecated but kept for type safety
    manualFinalOverride: false    // Deprecated but kept for type safety
  };
};

export const getReportLockStatus = (reportWeek: number, reportYear: number): 'OPEN' | 'PARTIAL' | 'LOCKED' => {
  if (DISABLE_LOCKS) return 'OPEN';
  const now = getWATTime();
  const currentWeekObj = getCurrentWeekNumber();
  const currentWeek = parseInt(currentWeekObj.week.replace(/\D/g, ''));
  const currentYear = currentWeekObj.year;

  // 1. Future weeks are always OPEN (or blocked, but let's say OPEN for editing if created)
  if (reportYear > currentYear || (reportYear === currentYear && reportWeek > currentWeek)) return 'OPEN';

  // 2. Past weeks (older than 1 week) are LOCKED
  if (reportYear < currentYear || (reportYear === currentYear && reportWeek < currentWeek - 1)) return 'LOCKED';

  // 3. Current Week (The week currently happening)
  if (reportWeek === currentWeek) {
    // Open: Sun 00:00 -> Wed 12:00
    // Partial: Wed 12:01 -> End of Week (technically continues to next Tue)
    const day = now.getDay();
    const hour = now.getHours();
    const minute = now.getMinutes();

    // Wed is day 3
    if (day < 3) return 'OPEN';
    if (day === 3 && (hour < 12 || (hour === 12 && minute === 0))) return 'OPEN';

    return 'PARTIAL';
  }

  // 4. Previous Week (The week that just finished)
  if (reportWeek === currentWeek - 1) {
    // Partial: Until Tue 11:00
    // Locked: After Tue 11:00
    const day = now.getDay(); // 0=Sun, 1=Mon, 2=Tue
    const hour = now.getHours();

    // If we are in the week *after* the report week:
    // Sun (0), Mon (1) are Partial.
    // Tue (2) is Partial until 11:00.

    if (day < 2) return 'PARTIAL'; // Sun, Mon
    if (day === 2 && hour < 11) return 'PARTIAL'; // Tue before 11am

    return 'LOCKED'; // Tue 11am+ or Wed-Sat
  }

  return 'LOCKED';
};

// Deprecated wrapper for backward compatibility
export const isWeekPastContentLock = (weekNum: number, year: number): boolean => {
  const status = getReportLockStatus(weekNum, year);
  return status === 'LOCKED'; // "Content Lock" in old terms meant "ReadOnly"
};

export const calculateActivityScore = (tasks: Task[], activityWeek?: number, activityYear?: number): number => {
  if (tasks.length === 0) return 0;

  const completionRate = tasks.filter(t => t.status === TaskStatus.Done).length / tasks.length;
  let score = Math.round(completionRate * 100);

  // FR-PENALTY-1.1: Automatic Submission Latency Penalty
  if (activityWeek && activityYear) {
    const lockStatus = getReportLockStatus(activityWeek, activityYear);
    if (lockStatus === 'LOCKED') {
      // If report is being calculated/saved and it's currently LOCKED, it means it's a retro-active submission
      score = Math.max(0, score - 15); // Fixed -15% for late submission "LOCKED" state
    } else if (lockStatus === 'PARTIAL') {
      score = Math.max(0, score - 5);  // Fixed -5% for "PARTIAL" (after Wed 12:00)
    }
  }

  return score;
};

export const calculateGovernanceHealth = (activities: Activity[]): number => {
  if (activities.length === 0) return 100;

  // Governance Health Factors:
  // 1. Description Quality (Min length) - 40%
  // 2. Reporting Density (Submission counts) - 40%
  // 3. Consistency (Lack of penalties) - 20%

  const compliantCount = activities.filter(a => (a.comments || '').split(' ').length >= 8).length;
  const reportingDensity = Math.min(100, (activities.length / 13) * 100);

  const descriptionScore = (compliantCount / activities.length) * 40;
  const densityScore = (reportingDensity / 100) * 40;
  const rawConsistencyScore = activities.reduce((acc, curr) => acc + (curr.score < 50 ? 0 : 1), 0);
  const consistencyScore = (rawConsistencyScore / activities.length) * 20;

  return Math.round(descriptionScore + densityScore + consistencyScore);
};

export const updateUserRoleByEmail = async (email: string, role: UserRole) => {
  const users = await getRegistryUsers();
  const updated = users.map(u => u.email === email ? { ...u, role } : u);
  await saveStoredUsers(updated);
  logAudit('UPDATE', `Role for ${email} updated to ${role} via console/utility.`);
};

export const updateUserPassword = async (newPassword: string) => {
  const { error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) throw error;
  logAudit('UPDATE', `Security key updated for authenticated node.`);
};

export const getReportingWeekRanges = () => getRecentWeekRanges();
export const formatWATTime = (d: Date) => d.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
export const formatWATDate = (d: Date) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).replace(/,/g, '');

export const generateReportId = (department: string, week: number, year: number) => {
  return `${department.toUpperCase().replace(/\s+/g, '-')}-WEEK-${week.toString().padStart(2, '0')}`;
};

// ============================================================================
// Finance Module Database Operations (FR-FINANCE)
// ============================================================================

// Violations (Phone Fines)
export const getViolations = async (): Promise<Violation[]> => {
  try {
    const { data, error } = await supabase.from('violations').select('*').order('date', { ascending: false });
    if (error) throw error;
    return (data as Violation[]) || [];
  } catch (e) {
    console.error('[FINANCE_ERROR] Failed to fetch violations:', e);
    return [];
  }
};

export const addViolation = async (v: Violation): Promise<boolean> => {
  try {
    // Validate amount is a positive number
    if (typeof v.amount !== 'number' || v.amount <= 0) {
      console.error('[FINANCE_ERROR] Amount must be a positive number');
      return false;
    }
    const { error } = await supabase.from('violations').insert([{
      id: v.id,
      name: v.name,
      department: v.department,
      amount: v.amount,
      date: v.date,
      paid: v.paid
    }]);
    if (error) throw error;
    logAudit('CREATE', `Violation added: ${v.name} - ₦${v.amount}`);
    return true;
  } catch (e) {
    console.error('[FINANCE_ERROR] Failed to add violation:', e);
    return false;
  }
};

export const updateViolation = async (id: string, paid: boolean): Promise<boolean> => {
  try {
    const { error } = await supabase.from('violations').update({ paid }).eq('id', id);
    if (error) throw error;
    logAudit('UPDATE', `Violation ${id} status changed to ${paid ? 'Paid' : 'Unpaid'}`);
    return true;
  } catch (e) {
    console.error('[FINANCE_ERROR] Failed to update violation:', e);
    return false;
  }
};

// Contributions (Donations)
export const getContributions = async (): Promise<Contribution[]> => {
  try {
    const { data, error } = await supabase.from('contributions').select('*').order('date', { ascending: false });
    if (error) throw error;
    // Map donor_name to donorName for compatibility
    return (data as any[]).map(c => ({
      id: c.id,
      donorName: c.donor_name,
      amount: c.amount,
      date: c.date,
      anonymous: c.anonymous
    })) || [];
  } catch (e) {
    console.error('[FINANCE_ERROR] Failed to fetch contributions:', e);
    return [];
  }
};

export const addContribution = async (c: Contribution): Promise<boolean> => {
  try {
    // Validate amount is a positive number
    if (typeof c.amount !== 'number' || c.amount <= 0) {
      console.error('[FINANCE_ERROR] Amount must be a positive number');
      return false;
    }
    const { error } = await supabase.from('contributions').insert([{
      id: c.id,
      donor_name: c.donorName,
      amount: c.amount,
      date: c.date,
      anonymous: c.anonymous
    }]);
    if (error) throw error;
    logAudit('CREATE', `Contribution added: ${c.anonymous ? 'Anonymous' : c.donorName} - ₦${c.amount}`);
    return true;
  } catch (e) {
    console.error('[FINANCE_ERROR] Failed to add contribution:', e);
    return false;
  }
};

// Expenses
export const getExpenses = async (): Promise<Expense[]> => {
  try {
    const { data, error } = await supabase.from('expenses').select('*').order('date', { ascending: false });
    if (error) throw error;
    // Map receipt_url to receiptUrl for compatibility
    return (data as any[]).map(e => ({
      id: e.id,
      amount: e.amount,
      description: e.description,
      category: e.category,
      requestor: e.requestor,
      approver: e.approver || '',
      receiver: e.receiver || '',
      date: e.date,
      receiptUrl: e.receipt_url
    })) || [];
  } catch (e) {
    console.error('[FINANCE_ERROR] Failed to fetch expenses:', e);
    return [];
  }
};

export const addExpense = async (e: Expense): Promise<boolean> => {
  try {
    // Validate amount is a positive number
    if (typeof e.amount !== 'number' || e.amount <= 0) {
      console.error('[FINANCE_ERROR] Amount must be a positive number');
      return false;
    }
    const { error } = await supabase.from('expenses').insert([{
      id: e.id,
      amount: e.amount,
      description: e.description,
      category: e.category,
      requestor: e.requestor,
      approver: e.approver,
      receiver: e.receiver,
      date: e.date,
      receipt_url: e.receiptUrl
    }]);
    if (error) throw error;
    logAudit('CREATE', `Expense added: ${e.category} - ₦${e.amount}`);
    return true;
  } catch (e) {
    console.error('[FINANCE_ERROR] Failed to add expense:', e);
    return false;
  }
};

// Monthly Financial Summary (for charts)
export const getMonthlyFinancialSummary = async (): Promise<MonthlyFinancialSummary[]> => {
  try {
    const { data, error } = await supabase.from('monthly_financial_summary').select('*').order('year', { ascending: true }).order('month', { ascending: true });
    if (error) throw error;
    return (data as MonthlyFinancialSummary[]) || [];
  } catch (e) {
    console.error('[FINANCE_ERROR] Failed to fetch monthly summary:', e);
    return [];
  }
};

export const updateMonthlyFinancialSummary = async (month: number, year: number, totalIncome: number, totalExpenses: number): Promise<boolean> => {
  try {
    const { error } = await supabase.from('monthly_financial_summary').upsert({
      month,
      year,
      total_income: totalIncome,
      total_expenses: totalExpenses,
      updated_at: new Date().toISOString()
    }, { onConflict: 'month,year' });
    if (error) throw error;
    return true;
  } catch (e) {
    console.error('[FINANCE_ERROR] Failed to update monthly summary:', e);
    return false;
  }
};

// ============================================================================
// Attendance Module Database Operations (FR-ATTENDANCE)
// ============================================================================

export const getAttendanceRecords = async (date?: string): Promise<AttendanceRecord[]> => {
  try {
    let query = supabase.from('attendance').select('*').order('meeting_date', { ascending: false });

    if (date) {
      query = query.eq('meeting_date', date);
    }

    const { data, error } = await query;
    if (error) throw error;

    return (data as AttendanceRecord[]) || [];
  } catch (e) {
    console.error('[ATTENDANCE_ERROR] Failed to fetch attendance records:', e);
    return [];
  }
};

export const addAttendanceRecord = async (record: AttendanceRecord): Promise<boolean> => {
  try {
    const { error } = await supabase.from('attendance').insert([{
      id: record.id,
      user_id: record.userId,
      user_name: record.userName,
      user_avatar: record.userAvatar,
      department: record.department,
      status: record.status,
      time_joined: record.timeJoined,
      participation_score: record.participationScore,
      meeting_date: new Date().toISOString().split('T')[0]
    }]);
    if (error) throw error;
    logAudit('CREATE', `Attendance record added for ${record.userName}`);
    return true;
  } catch (e) {
    console.error('[ATTENDANCE_ERROR] Failed to add attendance record:', e);
    return false;
  }
};

export const updateAttendanceRecord = async (id: string, updates: Partial<AttendanceRecord>): Promise<boolean> => {
  try {
    const updateData: any = { updated_at: new Date().toISOString() };
    if (updates.status) updateData.status = updates.status;
    if (updates.timeJoined) updateData.time_joined = updates.timeJoined;
    if (updates.participationScore) updateData.participation_score = updates.participationScore;

    const { error } = await supabase.from('attendance').update(updateData).eq('id', id);
    if (error) throw error;
    logAudit('UPDATE', `Attendance record ${id} updated`);
    return true;
  } catch (e) {
    console.error('[ATTENDANCE_ERROR] Failed to update attendance record:', e);
    return false;
  }
};

