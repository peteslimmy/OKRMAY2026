/**
 * 4CORE OKR Platform - Mock Data Service
 * Provides realistic mock data for development without Supabase
 */

import type { 
  User, BusinessUnit, Objective, KeyResult, Goal, Task,
  KRStatus, AuditLogEntry, Violation, AttendanceRecord 
} from '../types';
import { UserRole, UserStatus, TaskStatus } from '../types';

// ============================================================================
// Mock Users (aligned with MOCK_USERS from mock-data.ts)
// ============================================================================

export const MOCK_USERS: User[] = [
  {
    id: 'f3312dd7-8f3a-4760-81b0-7e000c2feb18',
    auth_id: 'f3312dd7-8f3a-4760-81b0-7e000c2feb18',
    firstName: 'System', lastName: 'Administrator',
    name: 'System Administrator', email: 'admin@fcis.com',
    role: UserRole.SuperAdmin, department: 'IT',
    avatarUrl: 'https://ui-avatars.com/api/?name=System+Admin&background=0f172a&color=fff',
    status: UserStatus.Active, mustChangePassword: false, must_change_password: false
  },
  {
    id: 'user-director-001',
    auth_id: 'user-director-001',
    firstName: 'Corporate', lastName: 'Director',
    name: 'Corporate Director', email: 'director@fcis.com',
    role: UserRole.Director, department: 'FINANCE',
    avatarUrl: 'https://ui-avatars.com/api/?name=Corporate+Director&background=1e293b&color=fff',
    status: UserStatus.Active, mustChangePassword: false, must_change_password: false
  },
  {
    id: 'user-1',
    auth_id: 'user-1',
    firstName: 'Admin', lastName: 'User',
    name: 'Admin User', email: 'adminuser@fcis.com',
    role: UserRole.Admin, department: 'Strategic Planning',
    avatarUrl: 'https://i.pravatar.cc/150?u=user-1',
    status: UserStatus.Active, mustChangePassword: false, must_change_password: false
  },
  {
    id: 'user-2',
    auth_id: 'user-2',
    firstName: 'Director', lastName: 'Ops',
    name: 'Director Ops', email: 'ops@fcis.com',
    role: UserRole.Director, department: 'Infrastructure & Ops',
    avatarUrl: 'https://i.pravatar.cc/150?u=user-2',
    status: UserStatus.Active, mustChangePassword: false, must_change_password: false
  },
  {
    id: 'user-3',
    auth_id: 'user-3',
    firstName: 'Sarah', lastName: 'Connor',
    name: 'Sarah Connor', email: 'sarah@fcis.com',
    role: UserRole.BULead, department: 'Financial Governance',
    avatarUrl: 'https://i.pravatar.cc/150?u=user-3',
    status: UserStatus.Active, mustChangePassword: false, must_change_password: false
  },
  {
    id: 'user-4',
    auth_id: 'user-4',
    firstName: 'John', lastName: 'Smith',
    name: 'John Smith', email: 'john@fcis.com',
    role: UserRole.BULead, department: 'Digital Transformation',
    avatarUrl: 'https://i.pravatar.cc/150?u=user-4',
    status: UserStatus.Active, mustChangePassword: false, must_change_password: false
  },
  {
    id: 'user-5',
    auth_id: 'user-5',
    firstName: 'Mike', lastName: 'Ross',
    name: 'Mike Ross', email: 'mike@fcis.com',
    role: UserRole.Manager, department: 'Quality Assurance',
    avatarUrl: 'https://i.pravatar.cc/150?u=user-5',
    status: UserStatus.Active, mustChangePassword: false, must_change_password: false
  },
  {
    id: '0bfc8ec6-f79e-4ac5-ad3d-f18a2cf84c60',
    auth_id: '0bfc8ec6-f79e-4ac5-ad3d-f18a2cf84c60',
    firstName: 'Hnb', lastName: 'User',
    name: 'Hnb User', email: 'hnb@fcis.com',
    role: UserRole.Manager, department: 'Strategic Planning',
    avatarUrl: 'https://i.pravatar.cc/150?u=user-6',
    status: UserStatus.Active, mustChangePassword: false, must_change_password: false
  }
];

// ============================================================================
// Mock Business Units
// ============================================================================

export const MOCK_BUSINESS_UNITS: BusinessUnit[] = [
  { id: 'bu-1', name: 'Strategic Planning', head_user_id: 'user-1', contactEmail: 'planning@fcis.com' },
  { id: 'bu-2', name: 'Infrastructure & Ops', head_user_id: 'user-2', contactEmail: 'ops@fcis.com' },
  { id: 'bu-3', name: 'Human Capital', head_user_id: 'user-3', contactEmail: 'hr@fcis.com' },
  { id: 'bu-4', name: 'Digital Transformation', head_user_id: 'user-4', contactEmail: 'digital@fcis.com' },
  { id: 'bu-5', name: 'Financial Governance', head_user_id: 'user-5', contactEmail: 'finance@fcis.com' },
  { id: 'bu-6', name: 'Quality Assurance', head_user_id: 'user-6', contactEmail: 'qa@fcis.com' },
];

// ============================================================================
// Mock Objectives (2026)
// ============================================================================

export const MOCK_OBJECTIVES: Objective[] = [
  {
    id: 'obj-1',
    title: 'Cloud Migration & Infrastructure Modernization',
    description: 'Migrate 80% of legacy applications to AWS and implement Zero Trust security',
    quarter: 'Q1',
    year: 2026,
    status: 'Active',
    progress: 65,
    created_by: 'user-director-001',
    created_at: '2026-01-15T00:00:00Z'
  },
  {
    id: 'obj-2',
    title: 'Business Continuity Excellence',
    description: 'Enhance risk mitigation and disaster recovery capabilities',
    quarter: 'Q1',
    year: 2026,
    status: 'Active',
    progress: 40,
    created_by: 'user-director-001',
    created_at: '2026-01-15T00:00:00Z'
  },
  {
    id: 'obj-3',
    title: 'Talent Acquisition & Retention',
    description: 'Hire 15 senior engineers and reduce attrition by 30%',
    quarter: 'Q2',
    year: 2026,
    status: 'Active',
    progress: 50,
    created_by: 'user-1',
    created_at: '2026-04-01T00:00:00Z'
  },
  {
    id: 'obj-4',
    title: 'Operational Cost Optimization',
    description: 'Reduce operational expenditure by 15% through automation',
    quarter: 'Q2',
    year: 2026,
    status: 'Active',
    progress: 70,
    created_by: 'user-1',
    created_at: '2026-04-01T00:00:00Z'
  },
  {
    id: 'obj-5',
    title: 'Performance Management System',
    description: 'Implement OKR-driven performance evaluations across all BUs',
    quarter: 'Q3',
    year: 2026,
    status: 'Active',
    progress: 25,
    created_by: 'user-director-001',
    created_at: '2026-07-01T00:00:00Z'
  },
  {
    id: 'obj-6',
    title: 'Client Satisfaction Excellence',
    description: 'Achieve NPS score of 70+ across all service lines',
    quarter: 'Q3',
    year: 2026,
    status: 'Active',
    progress: 60,
    created_by: 'user-1',
    created_at: '2026-07-01T00:00:00Z'
  }
];

// ============================================================================
// Mock Key Results
// ============================================================================

export const MOCK_KEY_RESULTS: KeyResult[] = [
  // Obj 1 - Cloud Migration
  { id: 'kr-1', objective_id: 'obj-1', kr_slot: 'KR1', title: 'Cloud Migration', description: 'Migrate 80% of legacy apps to AWS', quarter: 'Q1', year: 2026, owner_id: 'user-4', progress: 65, status: 'Amber' as KRStatus },
  { id: 'kr-2', objective_id: 'obj-1', kr_slot: 'KR2', title: 'Security Upgrade', description: 'Implement Zero Trust architecture', quarter: 'Q1', year: 2026, owner_id: 'user-2', progress: 40, status: 'Red' as KRStatus },
  { id: 'kr-3', objective_id: 'obj-1', kr_slot: 'KR3', title: 'Cost Reduction', description: 'Reduce cloud spend by 20%', quarter: 'Q1', year: 2026, owner_id: 'user-4', progress: 75, status: 'Green' as KRStatus },
  
  // Obj 2 - Business Continuity
  { id: 'kr-4', objective_id: 'obj-2', kr_slot: 'KR1', title: 'Risk Audit', description: 'Complete ISO 27001 gap analysis', quarter: 'Q1', year: 2026, owner_id: 'user-5', progress: 90, status: 'Green' as KRStatus },
  { id: 'kr-5', objective_id: 'obj-2', kr_slot: 'KR2', title: 'BCP Testing', description: 'Run 3 full-scale disaster recovery drills', quarter: 'Q1', year: 2026, owner_id: 'user-5', progress: 30, status: 'Amber' as KRStatus },
  { id: 'kr-6', objective_id: 'obj-2', kr_slot: 'KR3', title: 'Documentation', description: 'Update all operational playbooks', quarter: 'Q1', year: 2026, owner_id: 'user-5', progress: 55, status: 'Amber' as KRStatus },

  // Obj 3 - Talent
  { id: 'kr-7', objective_id: 'obj-3', kr_slot: 'KR1', title: 'Talent Pipeline', description: 'Hire 15 senior engineers', quarter: 'Q2', year: 2026, owner_id: 'user-3', progress: 50, status: 'Green' as KRStatus },
  { id: 'kr-8', objective_id: 'obj-3', kr_slot: 'KR2', title: 'Training Program', description: 'Certify 50% of staff in new tech stack', quarter: 'Q2', year: 2026, owner_id: '0bfc8ec6-f79e-4ac5-ad3d-f18a2cf84c60', progress: 20, status: 'Red' as KRStatus },
  { id: 'kr-9', objective_id: 'obj-3', kr_slot: 'KR3', title: 'Retention Program', description: 'Reduce voluntary attrition to <10%', quarter: 'Q2', year: 2026, owner_id: 'user-3', progress: 45, status: 'Amber' as KRStatus },

  // Obj 4 - Cost Optimization
  { id: 'kr-10', objective_id: 'obj-4', kr_slot: 'KR1', title: 'OpEx Reduction', description: 'Cut non-essential software spend by $50k', quarter: 'Q2', year: 2026, owner_id: 'user-5', progress: 70, status: 'Green' as KRStatus },
  { id: 'kr-11', objective_id: 'obj-4', kr_slot: 'KR2', title: 'Revenue Diversification', description: 'Launch 2 new service lines', quarter: 'Q2', year: 2026, owner_id: 'user-1', progress: 10, status: 'Red' as KRStatus },

  // Obj 5 - Performance System
  { id: 'kr-12', objective_id: 'obj-5', kr_slot: 'KR1', title: 'OKR Platform', description: 'Deploy integrated OKR platform to all employees', quarter: 'Q3', year: 2026, owner_id: 'user-1', progress: 35, status: 'Amber' as KRStatus },
  { id: 'kr-13', objective_id: 'obj-5', kr_slot: 'KR2', title: 'Training Rollout', description: 'Train 100% of staff on OKR methodology', quarter: 'Q3', year: 2026, owner_id: 'user-4', progress: 15, status: 'Red' as KRStatus },
  { id: 'kr-14', objective_id: 'obj-5', kr_slot: 'KR3', title: 'Calibration Process', description: 'Implement quarterly calibration committees', quarter: 'Q3', year: 2026, owner_id: 'user-director-001', progress: 5, status: 'Red' as KRStatus },

  // Obj 6 - Client Satisfaction
  { id: 'kr-15', objective_id: 'obj-6', kr_slot: 'KR1', title: 'NPS Improvement', description: 'Achieve NPS 70+ across all service lines', quarter: 'Q3', year: 2026, owner_id: 'user-3', progress: 60, status: 'Green' as KRStatus },
  { id: 'kr-16', objective_id: 'obj-6', kr_slot: 'KR2', title: 'Client Feedback', description: 'Close 95% of client complaints within 48hrs', quarter: 'Q3', year: 2026, owner_id: 'user-2', progress: 82, status: 'Green' as KRStatus }
];

// Generate tasks for each KR
export const generateMockTasks = (): Task[] => {
  const tasks: Task[] = [];
  const taskTemplates = [
    'Define requirements and success criteria',
    'Execute implementation phase',
    'Review and validate results',
    'Document lessons learned',
    'Present to leadership team'
  ];

  MOCK_KEY_RESULTS.forEach((kr, idx) => {
    taskTemplates.forEach((title, tIdx) => {
      const doneRatio = MOCK_KEY_RESULTS.find(k => k.id === kr.id)?.progress || 0;
      tasks.push({
        id: `task-${kr.id}-${tIdx}`,
        title,
        status: Math.random() * 100 < doneRatio ? TaskStatus.Done : TaskStatus.NotDone
      });
    });
  });

  return tasks;
};

// ============================================================================
// Mock Activities (Weekly Progress) - 12 weeks trailing
// ============================================================================

export const generateMockActivities = (weeks: number = 12, year: number = 2026): Goal[] => {
  const activities: Goal[] = [];
  const currentWeek = 18; // Week of May 5, 2026
  const startWeek = currentWeek - weeks + 1;

  MOCK_BUSINESS_UNITS.forEach(bu => {
    // Filter KRs for this BU's department
    const buKrs = MOCK_KEY_RESULTS.filter(kr => {
      const owner = MOCK_USERS.find(u => u.id === kr.owner_id);
      return owner?.department === bu.name;
    });

    // Create a weekly activity per KR
    for (let w = startWeek; w <= currentWeek; w++) {
      buKrs.forEach((kr, idx) => {
        const baseScore = (kr.progress / 100) * 80; // 0-80 base
        const weeklyVariance = Math.floor(Math.random() * 20) - 10; // ±10
        const finalScore = Math.max(0, Math.min(100, baseScore + weeklyVariance));

        const tasks: Task[] = [
          { id: `t-w${w}-${bu.id}-${idx}-1`, title: 'Plan and define requirements', status: TaskStatus.Done },
          { id: `t-w${w}-${bu.id}-${idx}-2`, title: 'Execute implementation phase', status: finalScore > 30 ? TaskStatus.Done : TaskStatus.NotDone },
          { id: `t-w${w}-${bu.id}-${idx}-3`, title: 'Verify and document results', status: finalScore > 70 ? TaskStatus.Done : TaskStatus.NotDone },
        ];

        activities.push({
          id: `act-w${w}-${bu.id}-${idx}`,
          key_result_id: kr.id,
          owner_id: kr.owner_id,
          department: bu.name,
          title: `${kr.title} — Week ${w}`,
          tasks,
          week: w,
          year,
          score: finalScore,
          sub_kr_tag: `KR${idx + 1}`,
          created_at: new Date(Date.now() - (currentWeek - w) * 7 * 24 * 60 * 60 * 1000).toISOString()
        });
      });
    }
  });

  return activities;
};

// ============================================================================
// Mock Governance Config
// ============================================================================

export const MOCK_GOVERNANCE_CONFIG = {
  id: 1,
  content_lock_day: 2,
  content_lock_time: '18:00',
  final_lock_day: 2,
  final_lock_time: '11:00',
  manual_content_lock: false,
  manual_final_lock: false,
  disable_locks: false,
  allowed_domains: ['fcis.com', 'novaai.com.ng', 'pee.com']
};

// ============================================================================
// Mock Audit Logs
// ============================================================================

export const MOCK_AUDIT_LOGS: AuditLogEntry[] = [
  {
    id: 'audit-1',
    timestamp: new Date().toISOString(),
    user_id: MOCK_USERS[0].id,
    user_name: MOCK_USERS[0].name,
    action: 'SYSTEM',
    details: 'System initialized with mock data',
    ip_address: '127.0.0.1',
    metadata: {}
  },
  {
    id: 'audit-2',
    timestamp: new Date().toISOString(),
    user_id: MOCK_USERS[0].id,
    user_name: MOCK_USERS[0].name,
    action: 'GOAL_CREATE',
    details: 'Objective "Cloud Migration & Infrastructure Modernization" created',
    ip_address: '127.0.0.1',
    metadata: { objective_id: 'obj-1' }
  },
  {
    id: 'audit-3',
    timestamp: new Date().toISOString(),
    user_id: MOCK_USERS[3].id,
    user_name: MOCK_USERS[3].name,
    action: 'KR_CREATE',
    details: 'Key Result "Cloud Migration" created with 0% progress',
    ip_address: '127.0.0.1',
    metadata: { kr_id: 'kr-1' }
  },
  {
    id: 'audit-4',
    timestamp: new Date().toISOString(),
    user_id: MOCK_USERS[0].id,
    user_name: MOCK_USERS[0].name,
    action: 'INTEGRITY_ADJUSTMENT',
    details: 'Weekly integrity check completed - 98% compliance rate across 48 tactical nodes',
    ip_address: '127.0.0.1',
    metadata: { compliance: 98, nodes_checked: 48 }
  },
  {
    id: 'audit-5',
    timestamp: new Date().toISOString(),
    user_id: MOCK_USERS[1].id,
    user_name: MOCK_USERS[1].name,
    action: 'OVERRIDE',
    details: 'Disciplinary override applied: -5% penalty for missed deadline',
    ip_address: '127.0.0.1',
    metadata: { penalty: 5, reason: 'Late submission of Q1 deliverables' }
  }
];

// ============================================================================
// Mock Violations
// ============================================================================

export const MOCK_VIOLATIONS: Violation[] = [
  {
    id: 'viol-1',
    name: 'Late KR Update - Week 17',
    department: 'Digital Transformation',
    amount: 5000,
    date: '2026-05-01',
    paid: false,
    created_at: '2026-05-01T09:00:00Z'
  },
  {
    id: 'viol-2',
    name: 'Scope Creep - Alpha Project',
    department: 'Strategic Planning',
    amount: 12500,
    date: '2026-04-28',
    paid: true,
    created_at: '2026-04-28T14:30:00Z'
  },
  {
    id: 'viol-3',
    name: 'Missing Governance Approval',
    department: 'Quality Assurance',
    amount: 7500,
    date: '2026-04-22',
    paid: false,
    created_at: '2026-04-22T11:15:00Z'
  },
  {
    id: 'viol-4',
    name: 'Unauthorized Budget Transfer',
    department: 'Financial Governance',
    amount: 25000,
    date: '2026-04-15',
    paid: true,
    created_at: '2026-04-15T16:45:00Z'
  }
];

// ============================================================================
// Mock Attendance
// ============================================================================

export const MOCK_ATTENDANCE: AttendanceRecord[] = MOCK_USERS.slice(0, 5).map((user, idx) => ({
  id: `att-${idx + 1}`,
  userId: user.id,
  userName: user.name,
  userAvatar: user.avatarUrl,
  department: user.department,
  status: ['Present', 'Remote', 'Present', 'Absent', 'Excused'][idx] as any,
  timeJoined: idx === 0 ? '08:15' : idx === 1 ? '09:00' : '08:45',
  participationScore: Math.floor(Math.random() * 10) + 90 // 90-100
}));

// ============================================================================
// Utility: Get all data for current user
// ============================================================================

export const getUserDashboardData = (userId: string) => {
  const user = MOCK_USERS.find(u => u.id === userId) || MOCK_USERS[0];
  const myKRs = MOCK_KEY_RESULTS.filter(kr => kr.owner_id === userId);
  const myActivities = generateMockActivities(12, 2026).filter(a => a.owner_id === userId);
  
  return {
    user,
    myKeyResults: myKRs,
    recentActivities: myActivities.slice(0, 10),
    departmentStats: {
      totalKRs: MOCK_KEY_RESULTS.length,
      avgProgress: Math.round(MOCK_KEY_RESULTS.reduce((sum, k) => sum + k.progress, 0) / MOCK_KEY_RESULTS.length),
      atRiskCount: MOCK_KEY_RESULTS.filter(k => k.status === 'Red' || k.status === 'Amber').length
    }
  };
};
