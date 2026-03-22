import React, { useState, useMemo } from 'react';

const REPORTS = [
  { cat: 'performance', id: 'RPT-001', title: 'Weekly Performance Summary', desc: 'Company-wide average score for the selected week across all BUs. Includes week-over-week delta, top-performing BU, and lowest-scoring BU with recommendations.', freq: 'Weekly', roles: 'All', live: true, ai: true, export: true },
  { cat: 'performance', id: 'RPT-002', title: 'BU Performance Matrix Report', desc: 'Side-by-side scorecard of all 13 business units for a selected period. Shows score, status (Green/Amber/Red), submitted activity count, and compliance flag per BU.', freq: 'Weekly', roles: 'All', live: true, ai: false, export: true },
  { cat: 'performance', id: 'RPT-003', title: 'BU Trend Report', desc: '8-week rolling performance trend per business unit. Area chart of weekly scores with slope direction and whether each BU is improving, declining, or flat.', freq: 'Monthly', roles: 'All', live: true, ai: true, export: true },
  { cat: 'performance', id: 'RPT-004', title: 'Department Ranking Report', desc: 'Ranked leaderboard of all BUs by average score for the selected period. Highlights top 3 and flags any BU that has not submitted in 2+ weeks.', freq: 'Weekly', roles: 'All', live: false, ai: false, export: true },
  { cat: 'performance', id: 'RPT-005', title: 'Submission Compliance Report', desc: 'Which BUs submitted activities and which did not, per week. Shows compliance rate as a percentage. Flags repeat non-submitters.', freq: 'Weekly', roles: 'Admin+', live: false, ai: false, export: true },
  { cat: 'performance', id: 'RPT-006', title: 'Score Distribution Report', desc: 'Histogram of activity scores across the organisation — how many activities landed in each bracket: 90–100, 80–89, 70–79, 50–69, and below 50.', freq: 'Monthly', roles: 'Director+', live: false, ai: false, export: true },
  { cat: 'performance', id: 'RPT-007', title: 'Year-over-Year Comparison Report', desc: 'Company and per-BU performance compared across two selected fiscal years by quarter and week. Identifies structural improvement or regression.', freq: 'Quarterly', roles: 'Director+', live: false, ai: true, export: true },

  { cat: 'okr', id: 'RPT-008', title: 'Quarterly KR Progress Report', desc: 'Full status of all Key Results for the selected quarter and year. Shows progress bar, percentage, status badge, and week-by-week contribution.', freq: 'Quarterly', roles: 'All', live: true, ai: false, export: true },
  { cat: 'okr', id: 'RPT-009', title: 'KR-to-Activity Linkage Report', desc: 'Shows which activities are contributing to each KR, and which KRs have zero linked activities in the current cycle.', freq: 'Weekly', roles: 'Manager+', live: false, ai: false, export: true },
  { cat: 'okr', id: 'RPT-010', title: 'KR End-of-Quarter Forecast Report', desc: 'AI-powered linear regression projection for each active KR. Shows current progress, projected end-of-quarter score, trend direction, and confidence range.', freq: 'Weekly', roles: 'Director+', live: true, ai: true, export: true },
  { cat: 'okr', id: 'RPT-011', title: 'KR Achievement Report (Retrospective)', desc: 'Post-quarter analysis of all KRs. Final achievement vs target, percentage of KRs that reached Green, and narrative summary.', freq: 'Quarterly', roles: 'Director+', live: false, ai: true, export: true },
  { cat: 'okr', id: 'RPT-012', title: 'KR Contribution by BU Report', desc: 'Which business units contributed activities to each KR. Reveals if certain KRs are being driven by only one department.', freq: 'Monthly', roles: 'Director+', live: false, ai: false, export: true },
  { cat: 'okr', id: 'RPT-013', title: 'Task Completion Rate Report', desc: 'Across all activities, what percentage of individual tasks were marked Done vs Not Done. Breakdown by BU, by KR, and by user.', freq: 'Weekly', roles: 'Manager+', live: false, ai: false, export: true },
  { cat: 'okr', id: 'RPT-014', title: 'OKR Cascade Report', desc: 'Visual mapping of how each KR connects to activities and which teams own each part. Shows the full strategy-to-execution chain.', freq: 'Quarterly', roles: 'Director+', live: false, ai: true, export: true },

  { cat: 'financial', id: 'RPT-015', title: 'Monthly Financial Statement', desc: 'Income vs expenses by month with net balance, opening/closing balance, and month-over-month change.', freq: 'Monthly', roles: 'Admin+', live: false, ai: false, export: true },
  { cat: 'financial', id: 'RPT-016', title: 'Phone Fine Violations Report', desc: 'Full list of phone fine violations: name, department, amount, date, and paid/unpaid status.', freq: 'Weekly', roles: 'Admin+', live: false, ai: false, export: true },
  { cat: 'financial', id: 'RPT-017', title: 'Outstanding Fines Ageing Report', desc: 'Unpaid violations sorted by days outstanding. Flags fines overdue by 7, 14, 30+ days.', freq: 'Weekly', roles: 'Admin+', live: false, ai: false, export: true },
  { cat: 'financial', id: 'RPT-018', title: 'Donations & Contributions Report', desc: 'All contributions received: donor name, amount, date, and cumulative total.', freq: 'Monthly', roles: 'Admin+', live: false, ai: false, export: true },
  { cat: 'financial', id: 'RPT-019', title: 'Expense Analysis Report', desc: 'All expenses grouped by category. Shows total per category, largest single expenses, and requestor/approver breakdown.', freq: 'Monthly', roles: 'Admin+', live: false, ai: true, export: true },
  { cat: 'financial', id: 'RPT-020', title: 'Financial Health Dashboard Report', desc: 'One-page summary: total income, total expenses, net balance, outstanding fines, and a traffic-light health indicator.', freq: 'Monthly', roles: 'Director+', live: false, ai: true, export: true },
  { cat: 'financial', id: 'RPT-021', title: 'Budget vs Actual Report', desc: 'Compares planned expenses against actual spend per category. Flags over-budget categories.', freq: 'Monthly', roles: 'Admin+', live: false, ai: true, export: true },

  { cat: 'governance', id: 'RPT-022', title: 'Governance Lock Compliance Report', desc: 'Shows for each week whether submissions arrived before or after the content lock and final lock windows.', freq: 'Weekly', roles: 'Admin+', live: false, ai: false, export: true },
  { cat: 'governance', id: 'RPT-023', title: 'Submission Timing Report', desc: 'Histogram of when during the week activities are submitted. Identifies whether teams are front-loading vs last-minute.', freq: 'Weekly', roles: 'Admin+', live: false, ai: false, export: true },
  { cat: 'governance', id: 'RPT-024', title: 'Lock Override History Report', desc: 'All instances where manual content lock or final lock overrides were activated or deactivated.', freq: 'On demand', roles: 'Admin+', live: false, ai: false, export: true },
  { cat: 'governance', id: 'RPT-025', title: 'System Configuration Change Report', desc: 'History of all changes to governance_config table: lock times, allowed domains, SMTP settings, brand assets.', freq: 'On demand', roles: 'Admin+', live: false, ai: false, export: true },

  { cat: 'people', id: 'RPT-026', title: 'User Activity Report', desc: "Per-user summary of how many activities submitted, average score, KRs contributed to, and weeks active vs weeks absent.", freq: 'Monthly', roles: 'Admin+', live: false, ai: true, export: true },
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

const CAT_META: Record<string, { label: string; color: string; bg: string }> = {
  performance: { label: 'Performance', color: '#ea580c', bg: '#fff3ed' },
  okr: { label: 'OKR & KR', color: '#2563eb', bg: '#eff6ff' },
  financial: { label: 'Financial', color: '#16a34a', bg: '#f0fdf4' },
  governance: { label: 'Governance', color: '#7c3aed', bg: '#f5f3ff' },
  people: { label: 'People', color: '#0891b2', bg: '#ecfeff' },
  attendance: { label: 'Attendance', color: '#d97706', bg: '#fffbeb' },
  audit: { label: 'Audit & Security', color: '#dc2626', bg: '#fef2f2' },
  strategic: { label: 'Strategic', color: '#166534', bg: '#f0fdf4' },
};

const ICONS: Record<string, React.ReactNode> = {
  performance: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="w-4 h-4">
      <polyline points="3,17 8,10 13,14 18,6" />
      <polyline points="18,6 22,6 22,10" />
    </svg>
  ),
  okr: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="w-4 h-4">
      <circle cx="12" cy="12" r="8" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="12" cy="12" r="1" />
    </svg>
  ),
  financial: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="w-4 h-4">
      <line x1="12" y1="2" x2="12" y2="22" />
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
  ),
  governance: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="w-4 h-4">
      <path d="M12 2L2 7l10 5 10-5-10-5z" />
      <path d="M2 17l10 5 10-5" />
      <path d="M2 12l10 5 10-5" />
    </svg>
  ),
  people: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="w-4 h-4">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
  attendance: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="w-4 h-4">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  ),
  audit: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="w-4 h-4">
      <path d="M9 11l3 3L22 4" />
      <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
    </svg>
  ),
  strategic: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="w-4 h-4">
      <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
    </svg>
  ),
};

const AllSummaryReports: React.FC = () => {
  const [currentCat, setCurrentCat] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const categories = [
    { key: 'all', label: 'All' },
    { key: 'performance', label: 'Performance' },
    { key: 'okr', label: 'OKR & KR' },
    { key: 'financial', label: 'Financial' },
    { key: 'governance', label: 'Governance' },
    { key: 'people', label: 'People' },
    { key: 'attendance', label: 'Attendance' },
    { key: 'audit', label: 'Audit & Security' },
    { key: 'strategic', label: 'Strategic' },
  ];

  const filteredReports = useMemo(() => {
    return REPORTS.filter(r => {
      const matchCat = currentCat === 'all' || r.cat === currentCat;
      const matchSearch = !searchTerm ||
        r.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.desc.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.cat.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.freq.toLowerCase().includes(searchTerm.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [currentCat, searchTerm]);

  const byCategory: Record<string, typeof REPORTS> = {};
  filteredReports.forEach(r => {
    if (!byCategory[r.cat]) byCategory[r.cat] = [];
    byCategory[r.cat].push(r);
  });

  const order = Object.keys(CAT_META);
  const totalReports = REPORTS.length;
  const catCount = Object.keys(CAT_META).length;
  const liveCount = REPORTS.filter(r => r.live).length;
  const aiCount = REPORTS.filter(r => r.ai).length;

  return (
    <div style={{ maxWidth: '100%', padding: '1.5rem 0' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: '10px', marginBottom: '1.5rem' }}>
        <div style={{ background: 'var(--color-background-secondary)', borderRadius: 'var(--border-radius-md)', padding: '.9rem 1rem' }}>
          <div style={{ fontSize: '24px', fontWeight: 500, marginBottom: '2px', color: '#ea580c' }}>{totalReports}</div>
          <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>Total reports</div>
        </div>
        <div style={{ background: 'var(--color-background-secondary)', borderRadius: 'var(--border-radius-md)', padding: '.9rem 1rem' }}>
          <div style={{ fontSize: '24px', fontWeight: 500, marginBottom: '2px', color: '#2563eb' }}>{catCount}</div>
          <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>Categories</div>
        </div>
        <div style={{ background: 'var(--color-background-secondary)', borderRadius: 'var(--border-radius-md)', padding: '.9rem 1rem' }}>
          <div style={{ fontSize: '24px', fontWeight: 500, marginBottom: '2px', color: '#16a34a' }}>{liveCount}</div>
          <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>Live / realtime</div>
        </div>
        <div style={{ background: 'var(--color-background-secondary)', borderRadius: 'var(--border-radius-md)', padding: '.9rem 1rem' }}>
          <div style={{ fontSize: '24px', fontWeight: 500, marginBottom: '2px', color: '#d97706' }}>{aiCount}</div>
          <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>AI-enhanced</div>
        </div>
      </div>

      <input
        type="text"
        placeholder="Search reports by name, category, or description…"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        style={{
          width: '100%',
          padding: '8px 12px',
          border: '0.5px solid var(--color-border-secondary)',
          borderRadius: 'var(--border-radius-md)',
          fontSize: '13px',
          color: 'var(--color-text-primary)',
          background: 'var(--color-background-primary)',
          marginBottom: '1rem',
          outline: 'none',
        }}
      />

      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' as const, marginBottom: '1.25rem', alignItems: 'center' }}>
        <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)', fontWeight: 500, marginRight: '4px' }}>Category:</span>
        {categories.map(cat => (
          <button
            key={cat.key}
            onClick={() => setCurrentCat(cat.key)}
            style={{
              padding: '5px 13px',
              borderRadius: '999px',
              fontSize: '12px',
              fontWeight: 500,
              cursor: 'pointer',
              border: currentCat === cat.key ? '0.5px solid var(--color-border-primary)' : '0.5px solid var(--color-border-tertiary)',
              background: currentCat === cat.key ? 'var(--color-background-primary)' : 'transparent',
              color: currentCat === cat.key ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
              transition: 'all .15s',
            }}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {filteredReports.length === 0 ? (
        <div style={{ padding: '3rem', textAlign: 'center' as const, color: 'var(--color-text-tertiary)', fontSize: '14px' }}>
          No reports match your search.
        </div>
      ) : (
        <div>
          {order.map(cat => {
            const items = byCategory[cat];
            if (!items) return null;
            const meta = CAT_META[cat];
            return (
              <div key={cat} style={{ marginBottom: '2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '.875rem', paddingBottom: '.625rem', borderBottom: '0.5px solid var(--color-border-tertiary)' }}>
                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: meta.color, flexShrink: 0 }} />
                  <span style={{ fontSize: '15px', fontWeight: 500 }}>{meta.label}</span>
                  <span style={{ fontSize: '12px', color: 'var(--color-text-tertiary)', marginLeft: 'auto' }}>{items.length} report{items.length > 1 ? 's' : ''}</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '10px' }}>
                  {items.map(r => (
                    <div
                      key={r.id}
                      style={{
                        background: 'var(--color-background-primary)',
                        border: '0.5px solid var(--color-border-tertiary)',
                        borderRadius: 'var(--border-radius-lg)',
                        padding: '1rem 1.125rem',
                        transition: 'border-color .15s',
                        cursor: 'pointer',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', marginBottom: '.625rem' }}>
                        <div style={{
                          width: '34px',
                          height: '34px',
                          borderRadius: 'var(--border-radius-md)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          background: meta.bg,
                          color: meta.color,
                          flexShrink: 0,
                        }}>
                          {ICONS[r.cat]}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: '13px', fontWeight: 500, lineHeight: 1.35, marginBottom: '3px' }}>{r.title}</div>
                          <div style={{ fontSize: '10px', color: 'var(--color-text-tertiary)', fontFamily: 'var(--font-mono, monospace)' }}>{r.id}</div>
                        </div>
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', lineHeight: 1.5, marginBottom: '.75rem' }}>{r.desc}</div>
                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' as const, alignItems: 'center' }}>
                        <span style={{ fontSize: '10px', padding: '2px 7px', borderRadius: '999px', fontWeight: 500, background: 'var(--color-background-info)', color: 'var(--color-text-info)' }}>{r.freq}</span>
                        <span style={{ fontSize: '10px', padding: '2px 7px', borderRadius: '999px', fontWeight: 500, background: 'var(--color-background-secondary)', color: 'var(--color-text-secondary)' }}>{r.roles}</span>
                        {r.live && <span style={{ fontSize: '10px', padding: '2px 7px', borderRadius: '999px', fontWeight: 500, background: 'var(--color-background-success)', color: 'var(--color-text-success)' }}>Live</span>}
                        {r.ai && <span style={{ fontSize: '10px', padding: '2px 7px', borderRadius: '999px', fontWeight: 500, background: 'var(--color-background-warning)', color: 'var(--color-text-warning)' }}>AI-enhanced</span>}
                        {r.export && <span style={{ fontSize: '10px', padding: '2px 7px', borderRadius: '999px', fontWeight: 500, background: 'var(--color-background-secondary)', color: 'var(--color-text-secondary)' }}>CSV/PDF</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AllSummaryReports;
