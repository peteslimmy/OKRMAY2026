import React from 'react';
import { TrendingUp, Target, DollarSign, Shield, Users, Calendar, CheckCircle, Star } from 'lucide-react';

export interface Report {
  cat: string;
  id: string;
  title: string;
  desc: string;
  freq: string;
  roles: string;
  live: boolean;
  ai: boolean;
  export: boolean;
}

export const REPORTS: Report[] = [
  { cat: 'performance', id: 'RPT-001', title: 'Weekly Performance Summary', desc: 'Company-wide average score for the selected week across all BUs. Includes week-over-week delta, top-performing BU, and lowest-scoring BU with recommendations.', freq: 'Weekly', roles: 'All', live: true, ai: true, export: true },
  { cat: 'performance', id: 'RPT-002', title: 'BU Performance Matrix Report', desc: 'Side-by-side scorecard of all 13 business units for a selected period. Shows score, status (Green/Amber/Red), submitted activity count, and compliance flag per BU.', freq: 'Weekly', roles: 'All', live: true, ai: false, export: true },
  { cat: 'performance', id: 'RPT-003', title: 'BU Trend Report', desc: '8-week rolling performance trend per business unit. Area chart of weekly scores with slope direction and whether each BU is improving, declining, or flat.', freq: 'Monthly', roles: 'All', live: true, ai: true, export: true },
  { cat: 'performance', id: 'RPT-004', title: 'Department Ranking Report', desc: 'Ranked leaderboard of all BUs by average score for the selected period. Highlights top 3 and flags any BU that has not submitted in 2+ weeks.', freq: 'Weekly', roles: 'All', live: false, ai: false, export: true },
  { cat: 'performance', id: 'RPT-005', title: 'Submission Compliance Report', desc: 'Which BUs submitted activities and which did not, per week. Shows compliance rate as a percentage. Flags repeat non-submitters.', freq: 'Weekly', roles: 'Admin+', live: false, ai: false, export: true },
  { cat: 'performance', id: 'RPT-006', title: 'Score Distribution Report', desc: 'Histogram of activity scores across the organisation — how many activities landed in each bracket: 90–100, 80–89, 70–79, 50–69, and below 50.', freq: 'Monthly', roles: 'Director+', live: false, ai: false, export: true },
  { cat: 'performance', id: 'RPT-007', title: 'Year-over-Year Comparison Report', desc: 'Company and per-BU performance compared across two selected fiscal years by quarter and week. Identifies structural improvement or regression.', freq: 'Quarterly', roles: 'Director+', live: false, ai: true, export: true },

  { cat: 'okr', id: 'RPT-008', title: 'Quarterly KR Progress Report', desc: 'Full status of all Key Results for the selected quarter and year. Shows progress bar, percentage, status badge, and week-by-week contribution.', freq: 'Quarterly', roles: 'All', live: true, ai: false, export: true },
{ cat: 'okr', id: 'RPT-009', title: 'KR-to-Goal Linkage Report', desc: 'Shows which goals are contributing to each KR, and which KRs have zero linked goals in the current cycle.', freq: 'Weekly', roles: 'Manager+', live: false, ai: false, export: true },


  { cat: 'people', id: 'RPT-026', title: 'User Goal Report', desc: "Per-user summary of how many goals submitted, average score, KRs contributed to, and weeks active vs weeks absent.", freq: 'Monthly', roles: 'Admin+', live: false, ai: true, export: true },
  { cat: 'people', id: 'RPT-027', title: 'User Role & Permission Report', desc: 'Full roster of all users with their current role, department, status, and last login date. Flags dormant accounts.', freq: 'Monthly', roles: 'Admin+', live: false, ai: false, export: true },
  { cat: 'people', id: 'RPT-028', title: 'Team Performance by Department', desc: "Groups all users by department and shows the team's collective weekly and quarterly score.", freq: 'Monthly', roles: 'Director+', live: false, ai: true, export: true },
  { cat: 'people', id: 'RPT-029', title: 'New User Onboarding Report', desc: 'Lists all users invited in the selected period, their acceptance status, role assigned, and first activity submission.', freq: 'Monthly', roles: 'Admin+', live: false, ai: false, export: true },
  { cat: 'people', id: 'RPT-030', title: 'Manager Effectiveness Report', desc: 'For each Manager-role user: activities submitted, average team score, KR coverage, and on-time submission rate.', freq: 'Quarterly', roles: 'Director+', live: false, ai: true, export: true },

  { cat: 'attendance', id: 'RPT-031', title: 'Weekly Meeting Attendance Report', desc: 'Full attendance list for a selected meeting date: present, remote, absent, excused counts, and attendance rate.', freq: 'Weekly', roles: 'Manager+', live: false, ai: false, export: true },
  { cat: 'attendance', id: 'RPT-032', title: 'Attendance Trend Report', desc: '8-week rolling chart of attendance rate and average participation score. Identifies meetings with declining engagement.', freq: 'Monthly', roles: 'Admin+', live: false, ai: true, export: true },
  { cat: 'attendance', id: 'RPT-033', title: 'Chronic Absenteeism Report', desc: 'Users who have been marked Absent or Excused 3+ times in the last 8 meetings.', freq: 'Monthly', roles: 'Admin+', live: false, ai: false, export: true },
  { cat: 'attendance', id: 'RPT-034', title: 'Participation Score Ranking', desc: 'Ranked list of all staff by average participation score. Highlights top engagers and lowest scorers.', freq: 'Quarterly', roles: 'Director+', live: false, ai: false, export: true },
  { cat: 'attendance', id: 'RPT-035', title: 'Remote vs In-Person Ratio Report', desc: 'Breakdown of Present vs Remote attendance over time. Shows whether remote participation is increasing.', freq: 'Monthly', roles: 'Admin+', live: false, ai: false, export: true },

  { cat: 'audit', id: 'RPT-036', title: 'Full Audit Trail Report', desc: 'Complete audit_logs export for a selected date range. All CREATE, UPDATE, DELETE, LOGIN, LOGOUT events.', freq: 'On demand', roles: 'Admin+', live: false, ai: false, export: true },
  { cat: 'audit', id: 'RPT-037', title: 'User Login History Report', desc: 'All LOGIN and LOGOUT events per user. Shows sign-in times, session durations, and failed login attempts.', freq: 'On demand', roles: 'Admin+', live: false, ai: false, export: true },
  { cat: 'audit', id: 'RPT-038', title: 'Data Modification Report', desc: 'All UPDATE and DELETE audit events. Who changed what, and when.', freq: 'On demand', roles: 'Admin+', live: false, ai: false, export: true },
  { cat: 'audit', id: 'RPT-039', title: 'AI Usage Report', desc: 'All AI_QUERY events: who queried the AI assistant, how frequently, which model was selected.', freq: 'Monthly', roles: 'Admin+', live: false, ai: false, export: true },
  { cat: 'audit', id: 'RPT-040', title: 'Security Integrity Report', desc: 'Results of all Integrity Checker scans: which checks passed, warned, or failed.', freq: 'Monthly', roles: 'Admin+', live: false, ai: false, export: true },

  { cat: 'strategic', id: 'RPT-041', title: 'Executive Strategy Report', desc: 'AI-generated quarterly narrative combining KR progress, BU performance, attendance trends, and financial health.', freq: 'Quarterly', roles: 'Director+', live: false, ai: true, export: true },
  { cat: 'strategic', id: 'RPT-042', title: 'Session Notes Digest', desc: 'Compiled summary of all strategic_notes for a selected quarter. Groups notes by week with AI-synthesised key themes.', freq: 'Quarterly', roles: 'Director+', live: false, ai: true, export: true },
];

export const CAT_META: Record<string, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
  performance: { label: 'Performance', color: '#ea580c', bg: '#fff7ed', icon: <TrendingUp size={18} /> },
  okr: { label: 'OKR & KR', color: '#2563eb', bg: '#eff6ff', icon: <Target size={18} /> },
  financial: { label: 'Financial', color: '#16a34a', bg: '#f0fdf4', icon: <DollarSign size={18} /> },
  governance: { label: 'Governance', color: '#7c3aed', bg: '#f5f3ff', icon: <Shield size={18} /> },
  people: { label: 'People', color: '#0891b2', bg: '#ecfeff', icon: <Users size={18} /> },
  attendance: { label: 'Attendance', color: '#d97706', bg: '#fffbeb', icon: <Calendar size={18} /> },
  audit: { label: 'Audit & Security', color: '#dc2626', bg: '#fef2f2', icon: <CheckCircle size={18} /> },
  strategic: { label: 'Strategic', color: '#166534', bg: '#f0fdf4', icon: <Star size={18} /> },
};