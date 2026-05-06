/**
 * 4CORE OKR Platform - Mock Data
 * 90 days of comprehensive mock data for all modules
 * Last Updated: May 2026
 */

import { UserRole, UserStatus } from '../types';

// ============================================================================
// DATE HELPERS
// ============================================================================

const today = new Date('2026-05-06');

const getWeekNumber = (date: Date): number => {
  const start = new Date(date.getFullYear(), 0, 1);
  const diff = date.getTime() - start.getTime();
  const oneWeek = 1000 * 60 * 60 * 24 * 7;
  return Math.ceil((diff + start.getDay() * oneWeek) / oneWeek);
};

const formatDate = (date: Date): string => date.toISOString().split('T')[0];

const addDays = (date: Date, days: number): Date => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

const getDateRange = (startDate: Date, days: number): Date[] => {
  const dates: Date[] = [];
  for (let i = 0; i < days; i++) {
    dates.push(addDays(startDate, i));
  }
  return dates;
};

// ============================================================================
// USERS & PROFILES
// ============================================================================

export const MOCK_USERS = [
  { id: 'user-1', firstName: 'John', lastName: 'Doe', name: 'John Doe', email: 'john.doe@4core.com', role: UserRole.Director as string, department: 'Technology', avatarUrl: 'https://i.pravatar.cc/150?u=john', status: UserStatus.Active as string },
  { id: 'user-2', firstName: 'Jane', lastName: 'Smith', name: 'Jane Smith', email: 'jane.smith@4core.com', role: UserRole.Admin as string, department: 'Finance', avatarUrl: 'https://i.pravatar.cc/150?u=jane', status: UserStatus.Active as string },
  { id: 'user-3', firstName: 'Mike', lastName: 'Johnson', name: 'Mike Johnson', email: 'mike.johnson@4core.com', role: UserRole.Manager as string, department: 'Operations', avatarUrl: 'https://i.pravatar.cc/150?u=mike', status: UserStatus.Active as string },
  { id: 'user-4', firstName: 'Sarah', lastName: 'Williams', name: 'Sarah Williams', email: 'sarah.williams@4core.com', role: UserRole.Manager as string, department: 'Marketing', avatarUrl: 'https://i.pravatar.cc/150?u=sarah', status: UserStatus.Active as string },
  { id: 'user-5', firstName: 'David', lastName: 'Brown', name: 'David Brown', email: 'david.brown@4core.com', role: UserRole.BULead as string, department: 'Technology', avatarUrl: 'https://i.pravatar.cc/150?u=david', status: UserStatus.Active as string },
  { id: 'user-6', firstName: 'Emily', lastName: 'Davis', name: 'Emily Davis', email: 'emily.davis@4core.com', role: UserRole.Manager as string, department: 'Finance', avatarUrl: 'https://i.pravatar.cc/150?u=emily', status: UserStatus.Active as string },
  { id: 'user-7', firstName: 'Chris', lastName: 'Miller', name: 'Chris Miller', email: 'chris.miller@4core.com', role: UserRole.BULead as string, department: 'Operations', avatarUrl: 'https://i.pravatar.cc/150?u=chris', status: UserStatus.Active as string },
  { id: 'user-8', firstName: 'Lisa', lastName: 'Wilson', name: 'Lisa Wilson', email: 'lisa.wilson@4core.com', role: UserRole.Manager as string, department: 'Marketing', avatarUrl: 'https://i.pravatar.cc/150?u=lisa', status: UserStatus.Active as string },
  { id: 'user-9', firstName: 'James', lastName: 'Taylor', name: 'James Taylor', email: 'james.taylor@4core.com', role: UserRole.Manager as string, department: 'Technology', avatarUrl: 'https://i.pravatar.cc/150?u=james', status: UserStatus.Active as string },
  { id: 'user-10', firstName: 'Anna', lastName: 'Anderson', name: 'Anna Anderson', email: 'anna.anderson@4core.com', role: UserRole.Viewer as string, department: 'Finance', avatarUrl: 'https://i.pravatar.cc/150?u=anna', status: UserStatus.Active as string },
  { id: 'user-11', firstName: 'Robert', lastName: 'Thomas', name: 'Robert Thomas', email: 'robert.thomas@4core.com', role: UserRole.Viewer as string, department: 'Operations', avatarUrl: 'https://i.pravatar.cc/150?u=robert', status: UserStatus.Active as string },
  { id: 'user-12', firstName: 'Michelle', lastName: 'Garcia', name: 'Michelle Garcia', email: 'michelle.garcia@4core.com', role: UserRole.Viewer as string, department: 'Marketing', avatarUrl: 'https://i.pravatar.cc/150?u=michelle', status: UserStatus.Active as string },
  { id: 'user-13', firstName: 'Daniel', lastName: 'Martinez', name: 'Daniel Martinez', email: 'daniel.martinez@4core.com', role: UserRole.SuperAdmin as string, department: 'Technology', avatarUrl: 'https://i.pravatar.cc/150?u=daniel', status: UserStatus.Active as string },
  { id: 'user-14', firstName: 'Jessica', lastName: 'Hernandez', name: 'Jessica Hernandez', email: 'jessica.hernandez@4core.com', role: UserRole.Admin as string, department: 'Finance', avatarUrl: 'https://i.pravatar.cc/150?u=jessica', status: UserStatus.Active as string },
  { id: 'user-15', firstName: 'Kevin', lastName: 'Lopez', name: 'Kevin Lopez', email: 'kevin.lopez@4core.com', role: UserRole.Manager as string, department: 'Operations', avatarUrl: 'https://i.pravatar.cc/150?u=kevin', status: UserStatus.Active as string },
  { id: 'user-16', firstName: 'Laura', lastName: 'Gonzalez', name: 'Laura Gonzalez', email: 'laura.gonzalez@4core.com', role: UserRole.BULead as string, department: 'Marketing', avatarUrl: 'https://i.pravatar.cc/150?u=laura', status: UserStatus.Active as string },
  { id: 'user-17', firstName: 'Brian', lastName: 'Wilson', name: 'Brian Wilson', email: 'brian.wilson@4core.com', role: UserRole.Manager as string, department: 'Technology', avatarUrl: 'https://i.pravatar.cc/150?u=brian', status: UserStatus.Active as string },
  { id: 'user-18', firstName: 'Stephanie', lastName: 'Moore', name: 'Stephanie Moore', email: 'stephanie.moore@4core.com', role: UserRole.Viewer as string, department: 'Finance', avatarUrl: 'https://i.pravatar.cc/150?u=stephanie', status: UserStatus.Active as string },
  { id: 'user-19', firstName: 'Jason', lastName: 'Jackson', name: 'Jason Jackson', email: 'jason.jackson@4core.com', role: UserRole.Viewer as string, department: 'Operations', avatarUrl: 'https://i.pravatar.cc/150?u=jason', status: UserStatus.Active as string },
  { id: 'user-20', firstName: 'Amanda', lastName: 'White', name: 'Amanda White', email: 'amanda.white@4core.com', role: UserRole.Manager as string, department: 'Marketing', avatarUrl: 'https://i.pravatar.cc/150?u=amanda', status: UserStatus.Active as string },
];

// ============================================================================
// BUSINESS UNITS
// ============================================================================

export const MOCK_BUSINESS_UNITS = [
  { id: 'bu-1', name: 'Technology', code: 'TECH', headId: 'user-5', budget: 5000000, spent: 2150000 },
  { id: 'bu-2', name: 'Finance', code: 'FIN', headId: 'user-6', budget: 3000000, spent: 1450000 },
  { id: 'bu-3', name: 'Operations', code: 'OPS', headId: 'user-7', budget: 2500000, spent: 980000 },
  { id: 'bu-4', name: 'Marketing', code: 'MKT', headId: 'user-8', budget: 2000000, spent: 720000 },
];

// ============================================================================
// VIOLATION CATEGORIES
// ============================================================================

export const MOCK_VIOLATION_CATEGORIES = [
  { id: 'cat-1', name: 'Late KR Update', description: 'Failure to update key results on time', severity_level: 'Minor', default_fine_amount: 5000, is_active: true },
  { id: 'cat-2', name: 'Missed Report', description: 'Weekly report not submitted', severity_level: 'Major', default_fine_amount: 15000, is_active: true },
  { id: 'cat-3', name: 'Zero Progress', description: 'No progress made on OKRs', severity_level: 'Critical', default_fine_amount: 25000, is_active: true },
  { id: 'cat-4', name: 'Attendance Miss', description: 'Unapproved absence', severity_level: 'Minor', default_fine_amount: 3000, is_active: true },
  { id: 'cat-5', name: 'Late Check-in', description: 'Arriving late without approval', severity_level: 'Minor', default_fine_amount: 2000, is_active: true },
  { id: 'cat-6', name: 'Policy Violation', description: 'Breach of company policy', severity_level: 'Major', default_fine_amount: 20000, is_active: true },
  { id: 'cat-7', name: 'Data Breach', description: 'Unauthorized data access', severity_level: 'Critical', default_fine_amount: 50000, is_active: true },
  { id: 'cat-8', name: 'Expense Violation', description: 'Unapproved expense claim', severity_level: 'Major', default_fine_amount: 15000, is_active: true },
];

// ============================================================================
// VIOLATIONS (90 DAYS - WEEKS 10-18)
// ============================================================================

const generateViolations = () => {
  const violations = [];
  const statuses: Array<'UNPAID' | 'PAID' | 'VOID'> = ['UNPAID', 'PAID', 'PAID', 'VOID'];
  const categories = ['cat-1', 'cat-2', 'cat-3', 'cat-4', 'cat-5', 'cat-6'];
  const users = MOCK_USERS.slice(0, 15);
  const bus = MOCK_BUSINESS_UNITS;
  
  let violationId = 1;

  // Generate violations for weeks 10-18 (9 weeks)
  for (let week = 18; week >= 10; week--) {
    const violationsThisWeek = Math.floor(Math.random() * 3) + 2; // 2-4 per week
    
    for (let i = 0; i < violationsThisWeek; i++) {
      const user = users[Math.floor(Math.random() * users.length)];
      const bu = bus[Math.floor(Math.random() * bus.length)];
      const category = categories[Math.floor(Math.random() * categories.length)];
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      
      const daysAgo = (18 - week) * 7 + Math.floor(Math.random() * 7);
      const createdDate = addDays(today, -daysAgo);
      
      violations.push({
        id: `v-${violationId++}`,
        category_id: category,
        violator_id: user.id,
        bu_id: bu.id,
        week_reference: `Week ${week}, 2026`,
        notes: getViolationNote(category),
        status,
        fine_amount: Math.floor(Math.random() * 20000) + 5000,
        created_at: createdDate.toISOString(),
        updated_at: status === 'PAID' ? addDays(createdDate, Math.floor(Math.random() * 3)).toISOString() : createdDate.toISOString(),
      });
    }
  }
  
  return violations;
};

const getViolationNote = (category: string): string => {
  const notes: Record<string, string[]> = {
    'cat-1': ['Key result update delayed by 2 days', 'Weekly KR update missed', 'Progress not logged on time'],
    'cat-2': ['Weekly report not submitted', 'Monday report missing', 'End of week report outstanding'],
    'cat-3': ['No progress made on quarterly targets', 'Zero movement on KR', 'Stagnant performance'],
    'cat-4': ['Unexcused absence yesterday', 'No attendance recorded', 'Missing from office without notice'],
    'cat-5': ['Arrived 45 mins late', 'Late check-in multiple times', 'Arrival after 9:30 AM'],
    'cat-6': ['Policy breach on data handling', 'Unauthorized system access', 'Process deviation'],
  };
  const categoryNotes = notes[category] || ['General violation'];
  return categoryNotes[Math.floor(Math.random() * categoryNotes.length)];
};

export const MOCK_VIOLATIONS = generateViolations();

// ============================================================================
// ATTENDANCE RECORDS (90 DAYS)
// ============================================================================

const ATTENDANCE_STATUSES = ['PRESENT', 'PRESENT', 'PRESENT', 'PRESENT', 'PRESENT', 'PRESENT', 'LATE', 'ABSENT', 'REMOTE'];
const CHECKIN_TIMES = ['08:15', '08:22', '08:30', '08:45', '08:55', '09:00', '09:15', '09:30'];

export const generateAttendanceRecords = () => {
  const records = [];
  const users = MOCK_USERS.slice(0, 15);
  
  // Generate attendance for last 90 days (but only weekdays)
  let recordId = 1;
  const startDate = addDays(today, -90);
  
  for (let d = 0; d <= 90; d++) {
    const currentDate = addDays(startDate, d);
    const dayOfWeek = currentDate.getDay();
    
    // Skip weekends
    if (dayOfWeek === 0 || dayOfWeek === 6) continue;
    
    const weekNum = getWeekNumber(currentDate);
    
    for (const user of users) {
      // Random status weighted toward PRESENT
      const rand = Math.random();
      let status: string;
      if (rand < 0.75) status = 'PRESENT';
      else if (rand < 0.85) status = 'LATE';
      else if (rand < 0.95) status = 'REMOTE';
      else status = 'ABSENT';
      
      const checkInTime = CHECKIN_TIMES[Math.floor(Math.random() * CHECKIN_TIMES.length)];
      
      records.push({
        id: `att-${recordId++}`,
        user_id: user.id,
        date: formatDate(currentDate),
        week: weekNum,
        year: 2026,
        status,
        check_in: checkInTime,
        check_out: status === 'ABSENT' ? null : `${16 + Math.floor(Math.random() * 2)}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')}`,
        location: status === 'REMOTE' ? 'Remote' : user.department,
        notes: status === 'ABSENT' ? 'Sick leave' : '',
      });
    }
  }
  
  return records;
};

export const MOCK_ATTENDANCE_RECORDS = generateAttendanceRecords();

// ============================================================================
// QUARTERLY OKR DATA
// ============================================================================

export const MOCK_YEARLY_THEME = {
  id: 'theme-1',
  year: 2026,
  title: 'Accelerating Growth Through Digital Transformation',
  description: 'Focus on digital transformation, customer acquisition, and operational excellence to achieve 40% YoY growth.',
  is_active: true,
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-15T00:00:00Z',
};

export const MOCK_QUARTERLY_OBJECTIVES = [
  {
    id: 'obj-q1',
    quarterly_theme_id: 'theme-1',
    quarter: 'Q1',
    year: 2026,
    title: 'Revenue Growth & Market Expansion',
    description: 'Expand market presence and achieve 20% revenue growth through new product launches.',
    status: 'Locked',
    progress: 100,
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-04-01T00:00:00Z',
    keyResults: [
      { id: 'kr-1', kr_slot: 'KR1', title: 'Launch 3 new enterprise products', progress: 100, status: 'Green', subKRs: [
        { id: 'skr-1', title: 'Product A launch', progress: 100, weight: 1 },
        { id: 'skr-2', title: 'Product B launch', progress: 100, weight: 1 },
        { id: 'skr-3', title: 'Product C launch', progress: 100, weight: 1 },
      ]},
      { id: 'kr-2', kr_slot: 'KR2', title: 'Acquire 50 new enterprise clients', progress: 100, status: 'Green', subKRs: [
        { id: 'skr-4', title: 'Close 20 clients Q1', progress: 100, weight: 1 },
        { id: 'skr-5', title: 'Close 30 clients Q1', progress: 100, weight: 1 },
      ]},
      { id: 'kr-3', kr_slot: 'KR3', title: 'Achieve $2M ARR', progress: 100, status: 'Green', subKRs: [
        { id: 'skr-6', title: 'Q1 target $500K', progress: 100, weight: 1 },
        { id: 'skr-7', title: 'Q1 target $1M', progress: 100, weight: 1 },
        { id: 'skr-8', title: 'Q1 target $2M', progress: 100, weight: 1 },
      ]},
    ],
  },
  {
    id: 'obj-q2',
    quarterly_theme_id: 'theme-1',
    quarter: 'Q2',
    year: 2026,
    title: 'Customer Acquisition & Retention',
    description: 'Focus on customer success and retention while scaling acquisition channels.',
    status: 'Active',
    progress: 75,
    created_at: '2026-04-01T00:00:00Z',
    updated_at: '2026-05-06T00:00:00Z',
    keyResults: [
      { id: 'kr-4', kr_slot: 'KR1', title: 'Increase NPS to 60+', progress: 80, status: 'Green', subKRs: [
        { id: 'skr-9', title: 'Survey customers', progress: 100, weight: 1 },
        { id: 'skr-10', title: 'Address feedback', progress: 70, weight: 1 },
        { id: 'skr-11', title: 'NPS target 60+', progress: 70, weight: 1 },
      ]},
      { id: 'kr-5', kr_slot: 'KR2', title: 'Retain 95% existing clients', progress: 70, status: 'Amber', subKRs: [
        { id: 'skr-12', title: 'Client health check', progress: 100, weight: 1 },
        { id: 'skr-13', title: 'Retention rate 95%', progress: 40, weight: 1 },
      ]},
      { id: 'kr-6', kr_slot: 'KR3', title: 'Scale marketing to 100 leads/day', progress: 75, status: 'Green', subKRs: [
        { id: 'skr-14', title: 'Lead gen optimization', progress: 80, weight: 1 },
        { id: 'skr-15', title: '100 leads/day', progress: 70, weight: 1 },
      ]},
    ],
  },
  {
    id: 'obj-q3',
    quarterly_theme_id: 'theme-1',
    quarter: 'Q3',
    year: 2026,
    title: 'Product Innovation & Excellence',
    description: 'Launch innovative products and improve engineering excellence.',
    status: 'Draft',
    progress: 20,
    created_at: '2026-07-01T00:00:00Z',
    updated_at: '2026-05-06T00:00:00Z',
    keyResults: [
      { id: 'kr-7', kr_slot: 'KR1', title: 'Launch AI-powered analytics', progress: 25, status: 'Green', subKRs: [
        { id: 'skr-16', title: 'AI framework setup', progress: 50, weight: 1 },
        { id: 'skr-17', title: 'Beta release', progress: 0, weight: 1 },
      ]},
      { id: 'kr-8', kr_slot: 'KR2', title: 'Reduce technical debt by 40%', progress: 15, status: 'Amber', subKRs: [
        { id: 'skr-18', title: 'Code audit', progress: 30, weight: 1 },
        { id: 'skr-19', title: 'Refactor critical modules', progress: 0, weight: 1 },
      ]},
      { id: 'kr-9', kr_slot: 'KR3', title: 'Achieve 99.9% uptime', progress: 20, status: 'Green', subKRs: [
        { id: 'skr-20', title: 'Infrastructure upgrade', progress: 40, weight: 1 },
        { id: 'skr-21', title: 'Monitoring setup', progress: 0, weight: 1 },
      ]},
    ],
  },
  {
    id: 'obj-q4',
    quarterly_theme_id: 'theme-1',
    quarter: 'Q4',
    year: 2026,
    title: 'Scale & Dominance',
    description: 'Scale operations for market dominance.',
    status: 'Draft',
    progress: 0,
    created_at: '2026-10-01T00:00:00Z',
    updated_at: '2026-05-06T00:00:00Z',
    keyResults: [],
  },
];

// ============================================================================
// WEEKLY REPORTS
// ============================================================================

export const MOCK_WEEKLY_REPORTS = (() => {
  const reports = [];
  let reportId = 1;
  
  for (let week = 18; week >= 10; week--) {
    const users = MOCK_USERS.slice(0, 15);
    
    for (const user of users) {
      if (Math.random() < 0.15) continue; // 15% no report
      
      const submitted = Math.random() > 0.1; // 90% submitted
      const daysAgo = (18 - week) * 7 + Math.floor(Math.random() * 7);
      const submittedDate = addDays(today, -daysAgo);
      
      reports.push({
        id: `report-${reportId++}`,
        user_id: user.id,
        week,
        year: 2026,
        title: `Week ${week} Progress Report`,
        status: submitted ? 'Submitted' : 'Missing',
        submitted_at: submitted ? submittedDate.toISOString() : null,
        content: submitted ? `Progress summary for Week ${week} - ${user.name} completed all key results as planned.` : null,
      });
    }
  }
  
  return reports;
})();

// ============================================================================
// DASHBOARD METRICS
// ============================================================================

export const MOCK_DASHBOARD_METRICS = {
  overview: {
    activeObjectives: 12,
    onTrack: 8,
    atRisk: 3,
    behind: 1,
    weeklyReportsDue: 9,
    weeklyReportsSubmitted: 8,
    attendanceRate: 94,
    governanceScore: 87,
  },
  businessUnits: [
    { name: 'Technology', objectives: 4, onTrack: 3, atRisk: 1, behind: 0, score: 92 },
    { name: 'Finance', objectives: 3, onTrack: 2, atRisk: 1, behind: 0, score: 85 },
    { name: 'Operations', objectives: 3, onTrack: 2, atRisk: 0, behind: 1, score: 78 },
    { name: 'Marketing', objectives: 2, onTrack: 1, atRisk: 1, behind: 0, score: 88 },
  ],
  historicalPerformance: [
    { week: 18, overall: 87, target: 80 },
    { week: 17, overall: 85, target: 80 },
    { week: 16, overall: 82, target: 80 },
    { week: 15, overall: 80, target: 80 },
    { week: 14, overall: 78, target: 80 },
    { week: 13, overall: 75, target: 80 },
    { week: 12, overall: 73, target: 80 },
    { week: 11, overall: 70, target: 80 },
    { week: 10, overall: 68, target: 80 },
  ],
};

// ============================================================================
// AUDIT LOGS
// ============================================================================

export const MOCK_AUDIT_LOGS = (() => {
  const logs = [];
  let logId = 1;
  
  const actions = ['CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT', 'LOCK', 'UNLOCK'];
  const entities = ['Objective', 'KeyResult', 'SubKR', 'User', 'Violation', 'Report'];
  
  for (let i = 0; i < 60; i++) {
    const daysAgo = Math.floor(Math.random() * 90);
    const createdDate = addDays(today, -daysAgo);
    const user = MOCK_USERS[Math.floor(Math.random() * MOCK_USERS.length)];
    const action = actions[Math.floor(Math.random() * actions.length)];
    const entity = entities[Math.floor(Math.random() * entities.length)];
    
    logs.push({
      id: `audit-${logId++}`,
      entity_type: entity,
      entity_id: `${entity.toLowerCase()}-${Math.floor(Math.random() * 100)}`,
      action,
      performed_by: user.id,
      user_name: user.name,
      created_at: createdDate.toISOString(),
      details: `${action} performed on ${entity}`,
    });
  }
  
  return logs.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
})();

// ============================================================================
// EXPORTS
// ============================================================================

export const getMockData = {
  users: MOCK_USERS,
  businessUnits: MOCK_BUSINESS_UNITS,
  violationCategories: MOCK_VIOLATION_CATEGORIES,
  violations: MOCK_VIOLATIONS,
  attendance: MOCK_ATTENDANCE_RECORDS,
  yearlyTheme: MOCK_YEARLY_THEME,
  quarterlyObjectives: MOCK_QUARTERLY_OBJECTIVES,
  weeklyReports: MOCK_WEEKLY_REPORTS,
  dashboardMetrics: MOCK_DASHBOARD_METRICS,
  auditLogs: MOCK_AUDIT_LOGS,
};

// Legacy exports for utils.ts compatibility
export const MOCK_GOVERNANCE_CONFIG = {
  content_lock_day: 2,
  content_lock_time: '18:00',
  final_lock_day: 9,
  final_lock_time: '11:00',
  manual_content_lock: false,
  manual_final_lock: false,
  disable_locks: false,
  allowed_domains: ['4core.com', 'fcis.com'],
  smtp_enabled: false,
};

export const MOCK_OBJECTIVES = MOCK_QUARTERLY_OBJECTIVES.map(q => ({
  id: q.id,
  quarter: q.quarter,
  year: q.year,
  title: q.title,
  description: q.description,
  status: q.status,
  progress: q.progress,
  created_at: q.created_at,
  updated_at: q.updated_at,
}));

export const MOCK_KRS = MOCK_QUARTERLY_OBJECTIVES.flatMap(q => 
  (q.keyResults || []).map(kr => ({
    id: kr.id,
    objective_id: q.id,
    kr_slot: kr.kr_slot,
    title: kr.title,
    progress: kr.progress,
    status: kr.status,
    created_at: q.created_at,
    updated_at: q.updated_at,
  }))
);

export const generateMockActivities = (weeks: number, year: number) => {
  const activities = [];
  const types = ['check_in', 'check_out', 'report_submitted', 'kr_update'];
  for (let w = weeks; w >= 1; w--) {
    for (const user of MOCK_USERS.slice(0, 10)) {
      if (Math.random() > 0.2) {
        activities.push({
          id: `act-${w}-${user.id}`,
          user_id: user.id,
          week: w,
          year,
          type: types[Math.floor(Math.random() * types.length)],
          created_at: new Date().toISOString(),
        });
      }
    }
  }
  return activities;
};

export default getMockData;