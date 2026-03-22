import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  FileText, LoaderCircle, ShieldCheck, UploadCloud,
  Plus, X, Trash2, Sparkles, AlertTriangle, Save, ListChecks,
  Lock, Check, Target, Upload, Download, AlertCircle
} from 'lucide-react';
import DOMPurify from 'dompurify';
import { Activity, Task, TaskStatus, KeyResult, UserRole, User, Permission } from '../src/types';
import {
  calculateActivityScore, getRecentWeekRanges, logAudit,
  getSessionUser, getReportLockStatus, getRegistryKeyResults,
  generateReportId, hasPermissionByRole, getUserPermissions
} from '../utils';
import { RichTextEditor } from './RichTextEditor';
import { Select } from './ui/Select';
import { supabase } from '../supabaseClient';

const DEPT_COLORS: Record<string, { bg: string; text: string }> = {
  'CEO': { bg: '#1e293b', text: '#fff' },
  'Finance': { bg: '#059669', text: '#fff' },
  'HR': { bg: '#7c3aed', text: '#fff' },
  'Operations': { bg: '#ea580c', text: '#fff' },
  'Technology': { bg: '#2563eb', text: '#fff' },
  'Marketing': { bg: '#db2777', text: '#fff' },
  'Sales': { bg: '#16a34a', text: '#fff' },
  'Legal': { bg: '#9333ea', text: '#fff' },
  'Registry': { bg: '#0891b2', text: '#fff' },
  'BUS.DEV': { bg: '#d97706', text: '#fff' },
};

const getDeptAbbr = (dept: string): string => {
  if (!dept) return '??';
  const words = dept.trim().split(/\s+/);
  if (words.length === 1) return dept.slice(0, 2).toUpperCase();
  return words.map(w => w[0]).join('').slice(0, 2).toUpperCase();
};

const getDeptColor = (dept: string): { bg: string; text: string } => {
  if (!dept) return { bg: '#64748b', text: '#fff' };
  if (DEPT_COLORS[dept]) return DEPT_COLORS[dept];
  let hash = 0;
  for (let i = 0; i < dept.length; i++) {
    hash = dept.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = Math.abs(hash % 360);
  return { bg: `hsl(${hue}, 60%, 45%)`, text: '#fff' };
};

const getHeuristicHints = (text: string) => {
  const input = text.toLowerCase().trim();
  const words = input.split(/\s+/).filter(w => w.length > 0);
  const wordCount = words.length;

  // ─── SPECIFIC ───────────────────────────────────────────────────────────────
  // Must have: strong action verb + enough detail (not just "update X" or "work on X")
  const vagueVerbPatterns = [/\bwork on\b/i, /\blook at\b/i, /\bhelp\b/, /\bassist\b/, /\bsupport\b/, /\bmanage\b/, /\bhandle\b/, /\btouch\b/, /\bthings\b/, /\bstuff\b/, /\btasks\b/, /\bmisc\b/, /\bupdate\b/, /\breview\b/, /\bcheck\b/];
  // Use word-boundary match on full input so "customer support" doesn't match "support" as vague verb
  const hasVagueVerb = vagueVerbPatterns.some(p => p.test(input));
  const strongVerbs = ['implement', 'execute', 'launch', 'deploy', 'develop', 'conduct', 'audit', 'analyze', 'configure', 'design', 'establish', 'integrate', 'streamline', 'automate', 'scale', 'optimize', 'complete', 'resolve', 'reduce', 'validate', 'achieve', 'ensure', 'perform', 'deliver', 'create', 'build', 'ship', 'rollout', 'finalize', 'finalise', 'migrate', 'consolidate', 'restructure', 'refactor', 'test', 'debug', 'patch', 'release', 'onboard', 'coordinate', 'facilitate', 'negotiate', 'finalize', 'present', 'document', 'specify', 'architect', 'prototype', 'benchmark', 'calibrate', 'forecast', 'prioritize', 'allocate', 'delegate', 'mandate', 'earn', 'attain', 'obtain', 'acquire', 'secure', 'finish', 'submit', 'pass', 'certify', 'qualify', 'enroll', 'convert', 'close'];
  const hasStrongVerb = strongVerbs.some(v => words.slice(0, 6).some(w => w.startsWith(v)));
  // Specific also requires minimum length and NOT vague
  const isSpecific = hasStrongVerb && wordCount >= 6 && !hasVagueVerb;

  // ─── MEASURABLE ─────────────────────────────────────────────────────────────
  const measurablePatterns = [
    // Fixed: use look-ahead (?=\s|$) instead of trailing \b which fails at end-of-string for "80%"
    /\b\d+(?:\.\d+)?\s*(%|percent|percentage)(?=\s|$)/i,
    /\b\d+(?:\.\d+)?\s*(users?|leads?|deals?|hours?|days?|weeks?|nodes?|items?|units?|records?|tickets?|seconds?|sec|minutes?|min|hrs?|k|m\b)\b/i,
    // Currency: supports "$50,000", "50,000 USD", "$50,000.00"
    /[$£₦€¥]\s?[\d,]+(?:\.\d{2})?/i,
    /[\d,]+(?:\.\d{2})?\s*(usd|gbp|eur|ngn)/i,
    /\b\d{1,3}(?:,\d{3})+(?:\.\d{2})?\b/,
    /\b(zero|none|all|complete[d]?|full|100%|baseline)\b/i,
    /\b(kpi|okr|nps|csat|roi|roe|conversion|sla|mtbf|mttf|rrp|arpu|ltv|churn)\b/i,
    // Fixed: flexible from-to with .*? to allow intervening words like "per month"
    /\bfrom\s+\d+.*?(?:to|and|-)\s+\d+/i,
    /\b(increase|decrease|growth\s+of|improvement\s+of|reduce\s+by|up\s+to|at\s+least|targeting)\b/i,
    /\b(before|after|vs|versus|compared\s+to|delta)\b/i,
    /\b\d+\s*(x|times|twofold|threefold)\b/i,
  ];
  const isMeasurable = measurablePatterns.some(p => p.test(input));

  // ─── RELEVANT ───────────────────────────────────────────────────────────────
  const relevantKeywords = [
    'revenue', 'efficiency', 'growth', 'strategy', 'cost', 'risk', 'security',
    'qa', 'defects', 'access', 'stakeholders', 'performance', 'compliance',
    'quality', 'product', 'customer', 'client', 'sales', 'profit', 'loss',
    'automation', 'pipeline', 'workflow', 'throughput', 'latency', 'incident',
    'deployment', 'release', 'adoption', 'engagement', 'retention', 'churn',
    'onboarding', 'migration', 'integration', 'api', 'infrastructure', 'platform',
    'operational', 'budget', 'forecast', 'planning', 'objective', 'key result',
    'epic', 'feature', 'sprint', 'milestone', 'roadmap', 'stakeholder',
    'governance', 'audit', 'policy', 'security', 'data', 'analytics', 'reporting',
    'documentation', 'training', 'process', 'procedure', 'protocol', 'framework',
  ];
  const hasRelevantKeyword = words.some(w => relevantKeywords.some(k => w.includes(k)));
  const isRelevant = wordCount >= 4 && hasRelevantKeyword;

  // ─── ACHIEVABLE ─────────────────────────────────────────────────────────────
  // Too short = vague, too long = unfocused
  const isAchievable = wordCount >= 4 && wordCount <= 80;

  // ─── TIME-BOUND ─────────────────────────────────────────────────────────────
  const timePatterns = [
    /\b(q[1-4]|quarter)\b/i,
    /\b(eod|eow|eos|eom|qtd|ytd)\b/i,
    /\b(by\s+|within\s+|before\s+|after\s+|until\s+)\b/i,
    /\b(monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/i,
    /\b(january|february|march|april|may|june|july|august|september|october|november|december)\b/i,
    /\b(week\s*\d+|wk\s*\d+)\b/i,
    /\b(202[4-9]|203[0-9])\b/,
    /\b(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\b/i,
    /\b(daily|weekly|monthly|quarterly|annually|biannually)\b/i,
    /\b(fiscal\s*(year|quarter)|fy\s*\d+|fy\d+)\b/i,
    /\b(end\s+(of\s+)?(week|month|quarter|year)|start\s+(of\s+)?(week|month|quarter|year))\b/i,
    /\b(milestone|deadline|hurdle)\b/i,
  ];
  const isTimebound = timePatterns.some(p => p.test(input));

  // ─── OUTCOME CHECK (bonus) ──────────────────────────────────────────────────
  // Does it describe an outcome/result vs just an activity?
  const outcomeIndicators = ['increase', 'decrease', 'reduce', 'improve', 'achieve', 'deliver', 'ensure', 'maintain', 'eliminate', 'prevent', 'protect', 'boost', 'grow', 'reach', 'attain', 'meet (a|an)'];
  const hasOutcome = outcomeIndicators.some(o => {
    try { return new RegExp(`\\b${o}\\b`, 'i').test(input); } catch { return false; }
  });

  // ─── RISK/BLOCKER CHECK (bonus) ─────────────────────────────────────────────
  const riskIndicators = ['risk', 'blocker', 'dependency', 'barrier', 'impediment', 'challenge', 'constraint', 'bottleneck', 'issue', 'concern', 'escalate', 'unblock'];
  const hasRisk = riskIndicators.some(r => words.some(w => w.includes(r)));

  // ─── STAKEHOLDER CHECK (bonus) ───────────────────────────────────────────────
  const stakeholderIndicators = ['client', 'customer', 'stakeholder', 'management', 'executive', 'leadership', 'team', 'department', 'board', 'partner', 'vendor', 'investor', 'shareholder', 'employee', 'user', 'member'];
  const hasStakeholder = stakeholderIndicators.some(s => words.some(w => w.includes(s)));

  return {
    isSpecific,
    isMeasurable,
    isRelevant,
    isTimebound,
    isAchievable,
    hasOutcome,
    hasRisk,
    hasStakeholder,
    wordCount,
  };
};

const TaskCheckmark: React.FC<{ status: TaskStatus; onClick: () => void; isLocked: boolean }> = ({ status, onClick, isLocked }) => {
  const isDone = status === TaskStatus.Done;
  const isNotDone = status === TaskStatus.NotDone;
  return (
    <div className={`shrink-0 pt-0.5 text-[9px] font-black uppercase tracking-wider transition-all duration-300 ${isDone ? 'text-emerald-600' : isNotDone ? 'text-rose-600' : 'text-slate-400'} ${!isLocked ? 'cursor-pointer hover:scale-105 active:scale-95' : ''} group/status relative`} onClick={!isLocked ? onClick : undefined}>
      <span className={`px-2 py-0.5 rounded-[2px] border transition-all duration-300 animate-pulse-once ${isDone ? 'bg-emerald-50 border-emerald-200' : isNotDone ? 'bg-rose-50 border-rose-200' : 'bg-slate-50 border-slate-200'}`}>
        {isDone ? 'Done' : isNotDone ? 'Not Done' : 'Undefined'}
      </span>
      <div className="absolute bottom-full right-0 mb-2 px-2 py-1 bg-slate-900 text-white text-[10px] font-black uppercase tracking-wider rounded-[2px] opacity-0 group-hover/status:opacity-100 pointer-events-none whitespace-nowrap z-50 transition-all scale-95 group-hover:scale-100 shadow-xl border border-white/10">
        Click to toggle protocol status
        <div className="absolute top-full right-4 border-l-[4px] border-r-[4px] border-t-[4px] border-t-slate-900 border-x-transparent" />
      </div>
    </div>
  );
};

const ActivityProgressBar: React.FC<{ score: number, total: number, completed: number }> = ({ score, total, completed }) => {
  let colorClass = 'bg-primary-500';
  if (score >= 100) colorClass = 'bg-emerald-500';
  else if (score < 50) colorClass = 'bg-amber-500';
  return (
    <div className="flex items-center gap-4 mb-6 group/score relative cursor-help">
      <div className="flex-1 bg-slate-100 h-2 rounded-full overflow-hidden">
        <div className={`h-full ${colorClass} transition-all duration-1000 shadow-sm relative`} style={{ width: `${score}%` }}>
          <div className="absolute inset-0 bg-white/20 animate-[shimmer_2s_infinite]" style={{ backgroundImage: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.5), transparent)' }}></div>
        </div>
      </div>
      <span className="text-[12px] font-bold text-slate-900">{score}%</span>
      <div className="absolute bottom-full right-0 mb-2 px-3 py-1.5 bg-slate-900 text-white text-[10px] font-medium rounded-[4px] opacity-0 group-hover/score:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10 shadow-xl">
        {completed} of {total} tasks completed
        <div className="absolute top-full right-4 border-l-[4px] border-r-[4px] border-t-[4px] border-t-slate-900 border-x-transparent" />
      </div>
    </div>
  );
};

const ActivityCard: React.FC<{
  activity: Activity; index: number; keyResultLabel: string;
  onEdit: (a: Activity) => void; onDelete: (id: string) => void;
  onTaskToggle: (activityId: string, taskId: string) => void;
  canModify: boolean; isBypassActive: boolean;
  isContentLocked: boolean; isPartiallyLocked: boolean;
}> = ({ activity, index, keyResultLabel, onEdit, onDelete, onTaskToggle, canModify, isBypassActive, isContentLocked, isPartiallyLocked }) => {
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) setShowMenu(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [menuRef]);
  const hints = useMemo(() => getHeuristicHints(activity.title), [activity.title]);
  const taskArray = useMemo(() => {
    if (typeof activity.tasks === 'string') {
      try { return JSON.parse(activity.tasks); } catch { return []; }
    }
    return activity.tasks || [];
  }, [activity.tasks]);
  const completedTasks = taskArray.filter((t: Task) => t.status === TaskStatus.Done).length;
  const totalTasks = taskArray.length;
  const dynamicScore = useMemo(() => calculateActivityScore(taskArray), [taskArray]);
  const effectivelyLocked = isContentLocked && !isBypassActive;
  const effectivelyPartiallyLocked = isPartiallyLocked && !isBypassActive;
  const deptColor = getDeptColor(activity.department || 'Registry');
  const deptAbbr = getDeptAbbr(activity.department || 'Registry');

  return (
    <div className="card p-5 flex flex-col h-full hover:shadow-xl transition-all">
      <div className="flex justify-between items-start mb-4 gap-4">
        <div className="flex flex-wrap gap-2 items-center">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center text-[11px] font-bold shrink-0" style={{ backgroundColor: deptColor.bg, color: deptColor.text }} title={activity.department}>{deptAbbr}</div>
          <span className="badge-success flex items-center gap-1.5">
            <ShieldCheck size={12} /> {keyResultLabel}-Activity {String(index + 1).padStart(2, '0')}
          </span>
          {effectivelyPartiallyLocked && (
            <span className="badge-warning flex items-center gap-1">
              <AlertTriangle size={10} /> Status Only
            </span>
          )}
        </div>
        <div className="flex items-center gap-4 shrink-0">
          <div className="flex flex-col items-end text-right min-w-0">
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
              <FileText size={10} className="text-primary-400" /> W{activity.week}
            </div>
            <span className="text-[9px] font-bold text-slate-300 uppercase tracking-tight block truncate max-w-[120px]" title={generateReportId(activity.department, activity.week, activity.year)}>
              {generateReportId(activity.department, activity.week, activity.year)}
            </span>
          </div>
          <div className="relative" ref={menuRef}>
            {!effectivelyLocked && canModify && !effectivelyPartiallyLocked ? (
              <button onClick={() => setShowMenu(!showMenu)} className="btn-icon">
                <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><circle cx="8" cy="3" r="1.5"/><circle cx="8" cy="8" r="1.5"/><circle cx="8" cy="13" r="1.5"/></svg>
              </button>
            ) : (
              <div className="btn-icon opacity-50"><Lock size={14} /></div>
            )}
            {showMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-slate-100 py-2 z-[100] animate-scale-in overflow-hidden">
                <button onClick={() => { onEdit(activity); setShowMenu(false); }} className="w-full px-4 py-2.5 text-left text-[11px] font-bold uppercase tracking-widest text-slate-600 hover:bg-slate-50 flex items-center gap-3 transition-colors"><Sparkles size={14} /> Modify Update</button>
                <button onClick={() => { onDelete(activity.id); setShowMenu(false); }} className="w-full px-4 py-2.5 text-left text-[11px] font-bold uppercase tracking-widest text-red-600 hover:bg-red-50 flex items-center gap-3 transition-colors"><Trash2 size={14} /> Purge Record</button>
              </div>
            )}
          </div>
        </div>
      </div>
      <h3 className="text-sm font-medium text-slate-900 mb-4 group-hover:text-primary-600 transition-colors">{activity.title}</h3>
      <ActivityProgressBar score={dynamicScore} total={totalTasks} completed={completedTasks} />
      {activity.comments && (
        <div className="bg-slate-50 border border-slate-100 rounded-lg p-4 mt-3 mb-2">
          <p className="text-xs text-slate-600 leading-relaxed line-clamp-2" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(activity.comments) }} />
        </div>
      )}
      <div className="mt-3 mb-2">
        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
          <ListChecks size={12} className="text-primary-500" /> Tactical Steps
        </p>
        <div className="space-y-1">
          {taskArray.length === 0 ? (
            <div className="py-4 text-center border-2 border-dashed border-slate-100 rounded-lg">
              <span className="text-[11px] font-medium text-slate-300 uppercase tracking-widest">No tasks defined</span>
            </div>
          ) : (
            taskArray.map((task: Task, taskIdx: number) => {
              const isDone = task.status === TaskStatus.Done;
              const isNotDone = task.status === TaskStatus.NotDone;
              return (
                <div key={task.id} className={`flex items-start justify-between p-1.5 px-3 rounded-lg border transition-all duration-300 ${!effectivelyLocked ? 'cursor-pointer hover:shadow-md hover:border-primary-200 active:scale-[0.98]' : 'opacity-70'} ${isDone ? 'bg-emerald-50/40 border-emerald-100/60' : isNotDone ? 'bg-red-50/40 border-red-100/60' : 'bg-white border-slate-200/60 hover:border-slate-300'}`} onClick={() => !effectivelyLocked ? onTaskToggle(activity.id, task.id) : undefined}>
                  <div className="flex items-center gap-3 min-w-0 pr-3">
                    <span className="text-[10px] font-bold text-slate-300 bg-slate-100 px-1.5 py-0.5 rounded shrink-0">{taskIdx + 1}</span>
                    <span className={`text-xs font-medium leading-tight truncate ${isDone ? 'text-emerald-900' : isNotDone ? 'text-red-900' : 'text-slate-600'}`} title={task.title}>{task.title}</span>
                  </div>
                  <TaskCheckmark status={task.status} onClick={() => onTaskToggle(activity.id, task.id)} isLocked={effectivelyLocked} />
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

const ReportModule: React.FC = () => {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedWeek, setSelectedWeek] = useState<number | null>(null);
  const reportingWeeks = useMemo(() => getRecentWeekRanges(), []);
  const effectiveWeekValue = useMemo(() => {
    if (selectedWeek !== null) return `Week ${selectedWeek}`;
    return reportingWeeks[0]?.value || '';
  }, [selectedWeek, reportingWeeks]);
  const currentFilterWeekNum = useMemo(() => parseInt(effectiveWeekValue.match(/\d+/)?.[0] || '1'), [effectiveWeekValue]);
  const currentQuarter = useMemo(() => Math.ceil((new Date().getMonth() + 1) / 3), []);

  const getWeekDateRange = (week: number, year: number) => {
    const simple = new Date(year, 0, 1 + (week - 1) * 7);
    const dow = simple.getDay();
    const start = new Date(simple);
    if (dow <= 4) start.setDate(simple.getDate() - simple.getDay() + 1);
    else start.setDate(simple.getDate() + 8 - simple.getDay());
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `W ${week}, ${months[start.getMonth()]} ${start.getDate()} - ${months[end.getMonth()]} ${end.getDate()}`;
  };

  const weekOptions = useMemo(() => {
    const weeks: { value: number; label: string }[] = [];
    for (let w = 1; w <= 52; w++) {
      weeks.push({ value: w, label: getWeekDateRange(w, selectedYear) });
    }
    return weeks;
  }, [selectedYear]);

  const [availableKRs, setAvailableKRs] = useState<KeyResult[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingActivityId, setEditingActivityId] = useState<string | null>(null);
  const [selectedKrId, setSelectedKrId] = useState('');
  const [activityTitle, setActivityTitle] = useState('');
  const [activityComments, setActivityComments] = useState('');
  const [tasks, setTasks] = useState<{ id: string, title: string, status: TaskStatus }[]>([]);
  const [currentTaskInput, setCurrentTaskInput] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [intelligencePeriod, setIntelligencePeriod] = useState<'current' | 'last4' | 'last8' | 'quarter'>('current');
  const [governanceVersion, setGovernanceVersion] = useState(0);
  const [isVetting, setIsVetting] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState<string | null>(null);

  const [bulkProgress, setBulkProgress] = useState({
    current: 0, total: 0, success: 0, errors: [] as string[],
    currentStatus: '', currentRow: '', isComplete: false,
    failedRows: [] as { row: number, data: string, error: string; solution: string }[]
  });
  const [showLastWeekOutstanding, setShowLastWeekOutstanding] = useState(false);

  const isBypassActive = currentUser?.role === UserRole.SuperAdmin || currentUser?.role === UserRole.Admin;
  const isManagerial = currentUser?.role === UserRole.Manager || currentUser?.role === UserRole.Director;
  const canCreate = isManagerial || isBypassActive;
  const lockStatus = useMemo(() => getReportLockStatus(currentFilterWeekNum, selectedYear), [currentFilterWeekNum, selectedYear, governanceVersion]);
  const isFullyLocked = lockStatus === 'LOCKED';
  const isPartiallyLocked = lockStatus === 'PARTIAL';

  const canModifyActivity = (act: Activity) => {
    if (isBypassActive) return true;
    if (isManagerial && act.department === currentUser?.department) return true;
    return false;
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const [krs, actsRes, user] = await Promise.all([
        getRegistryKeyResults(selectedYear),
        supabase.from('activities').select('*').eq('year', selectedYear),
        getSessionUser()
      ]);
      // Deduplicate KRs by label within each quarter - keep first occurrence
      const seenLabels = new Set<string>();
      const uniqueKRs = krs.filter(kr => {
        const key = `${kr.quarter}-${kr.label}`;
        if (seenLabels.has(key)) return false;
        seenLabels.add(key);
        return true;
      });
      console.log('[DEBUG] Raw KRs from DB:', krs.length, 'Unique KRs:', uniqueKRs.length);
      setAvailableKRs(uniqueKRs);
      setCurrentUser(user);
      const dbActs = (actsRes.data as any[]) || [];
      setActivities(dbActs.map(a => ({
        ...a,
        tasks: typeof a.tasks === 'string' ? JSON.parse(a.tasks) : (a.tasks || [])
      })));
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  useEffect(() => {
    fetchData();
    const handleSync = () => fetchData();
    const handleGovSync = () => setGovernanceVersion(v => v + 1);
    window.addEventListener('4COREUserUpdate', handleSync);
    window.addEventListener('4COREGovernanceUpdate', handleGovSync);
    return () => {
      window.removeEventListener('4COREUserUpdate', handleSync);
      window.removeEventListener('4COREGovernanceUpdate', handleGovSync);
    };
  }, [selectedYear, effectiveWeekValue]);

  const handleTaskStatusToggle = async (activityId: string, taskId: string) => {
    const act = activities.find(a => a.id === activityId);
    if (!act) return;
    if (!isBypassActive && isFullyLocked) return;
    if (!canModifyActivity(act)) return;
    const updatedTasks = act.tasks.map(t => {
      if (t.id === taskId) {
        const statusOrder = [TaskStatus.Undefined, TaskStatus.Done, TaskStatus.NotDone];
        const currentIndex = statusOrder.indexOf(t.status);
        const nextStatus = statusOrder[(currentIndex + 1) % statusOrder.length];
        return { ...t, status: nextStatus };
      }
      return t;
    });
    const newScore = calculateActivityScore(updatedTasks);
    await supabase.from('activities').update({ tasks: JSON.stringify(updatedTasks), score: newScore }).eq('id', activityId);
    await fetchData();
  };

  const saveActivity = async () => {
    if (!activityTitle.trim() || !selectedKrId || tasks.length === 0) return;
    setSubmitting(true);
    try {
      const newAct = {
        id: editingActivityId || crypto.randomUUID(),
        key_result_id: selectedKrId,
        owner_id: currentUser?.id || 'SYSTEM',
        department: currentUser?.department || 'Registry',
        title: activityTitle.trim(),
        tasks: JSON.stringify(tasks),
        comments: activityComments,
        week: currentFilterWeekNum,
        year: selectedYear,
        score: calculateActivityScore(tasks)
      };
      const { error } = await supabase.from('activities').upsert([newAct]);
      if (error) throw error;
      setIsAddModalOpen(false);
      await fetchData();
      logAudit(editingActivityId ? 'UPDATE' : 'CREATE', `Update saved: ${activityTitle}`);
    } catch (e: any) {
      console.error("Save Error:", e);
      alert(`Save failure: ${e.message || "Check cloud status."}`);
    } finally { setSubmitting(false); }
  };

  const handleAddTask = () => {
    if (!currentTaskInput.trim()) return;
    setTasks(prev => [...prev, { id: crypto.randomUUID(), title: currentTaskInput.trim(), status: TaskStatus.Undefined }]);
    setCurrentTaskInput('');
  };

  const vetTitleWithAI = async () => {
    if (!activityTitle.trim() || isVetting) return;
    setIsVetting(true);
    setAiSuggestion(null);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      const suggestion = `Analysis: Consider making this more specific and measurable. | Recommendation: ${activityTitle} - Achieve 95% completion rate by EOW`;
      setAiSuggestion(suggestion);
    } catch (e) {
      setAiSuggestion("AI node unavailable.");
    } finally {
      setIsVetting(false);
    }
  };

  const downloadCSVTemplate = () => {
    // Get current parent KRs for the selected year to include in template
    const parentKRs = availableKRs.filter(kr => !kr.parent_kr_id && kr.label.match(/^KR[1-4]$/));
    const seenKeys = new Set<string>();
    const uniqueKRs = parentKRs.filter(kr => {
      const key = `${kr.quarter}-${kr.label}`;
      if (seenKeys.has(key)) return false;
      seenKeys.add(key);
      return true;
    });

    const headers = "Year,Week,Key Result Label,Activity Title,Task 1,Task 2,Task 3,Task 4,Task 5\n";
    const sampleRows = uniqueKRs.map(kr =>
      `${selectedYear},${currentFilterWeekNum},${kr.label},"[Enter activity title for ${kr.label}]",[Task 1],[Task 2],[Task 3],[Task 4],[Task 5]`
    ).join('\n');

    const template = `${headers}${sampleRows}\n`;
    const blob = new Blob([template], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `4core_reporting_template_W${currentFilterWeekNum}_${selectedYear}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Simple CSV parser that handles quoted values with commas
  const parseCSVLine = (line: string): string[] => {
    const values: string[] = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        values.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    values.push(current.trim());
    return values;
  };

  const handleBulkUpload = async (file: File) => {
    setBulkProgress({ current: 0, total: 100, success: 0, errors: [], currentStatus: 'Reading file...', currentRow: '', isComplete: false, failedRows: [] });
    try {
      const text = await file.text();
      const lines = text.trim().split(/\r?\n/).filter(l => l.trim());
      const rows = lines.slice(1);
      setBulkProgress(prev => ({ ...prev, total: rows.length, currentStatus: `Processing ${rows.length} rows...` }));

      const newActivities: any[] = [];
      const failedRows: typeof bulkProgress.failedRows = [];

      // Use current filter values as defaults
      const defaultWeek = currentFilterWeekNum;
      const defaultYear = selectedYear;

      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        setBulkProgress(prev => ({ ...prev, current: i + 1, currentStatus: `Processing row ${i + 1} of ${rows.length}`, currentRow: row.slice(0, 60) + (row.length > 60 ? '...' : '') }));

        const parts = parseCSVLine(row);
        if (parts.length < 2) {
          failedRows.push({ row: i + 2, data: row, error: 'Missing required columns', solution: 'Ensure CSV has at least 2 columns: KR Label and Activity Title' });
          continue;
        }

        const krLabel = parts[2];
        const title = parts[3];
        const rowYear = parts[0]?.trim() && !isNaN(parseInt(parts[0])) ? parseInt(parts[0]) : defaultYear;
        const rowWeek = parts[1]?.trim() && !isNaN(parseInt(parts[1])) ? parseInt(parts[1]) : defaultWeek;

        if (rowWeek < defaultWeek && currentUser?.role !== UserRole.SuperAdmin) {
          failedRows.push({ row: i + 2, data: row, error: 'Cannot upload to previous weeks', solution: 'Only Super Admin can upload previous week reports' });
          continue;
        }
        // Tasks are all columns from index 4 onwards
        const taskColumns = parts.slice(4);
        const rowTasks = taskColumns.filter(t => t && !t.match(/^\[Task\s*\d*\]$/i)).map(t => ({ id: crypto.randomUUID(), title: t, status: TaskStatus.Undefined }));

        const parentKRs = availableKRs.filter(kr => !kr.parent_kr_id);
        const krMatch = parentKRs.find(k => k.label.toUpperCase() === krLabel.toUpperCase());
        if (!krMatch) {
          failedRows.push({ row: i + 2, data: row, error: `KR "${krLabel}" not found`, solution: `Available Parent KRs: ${parentKRs.map(k => k.label).join(', ')}` });
          continue;
        }

        if (!currentUser) {
          failedRows.push({ row: i + 2, data: row, error: 'User not authenticated', solution: 'Please log out and log back in' });
          continue;
        }

        newActivities.push({
          id: crypto.randomUUID(),
          key_result_id: krMatch.id,
          owner_id: currentUser.id,
          department: currentUser.department || 'Registry',
          title,
          tasks: JSON.stringify(rowTasks),
          comments: '',
          week: rowWeek,
          year: rowYear,
          score: calculateActivityScore(rowTasks)
        });
        console.log('[DEBUG] Created activity:', { week: rowWeek, year: rowYear, title, taskCount: rowTasks.length });
      }

      setBulkProgress(prev => ({ ...prev, currentStatus: 'Analyzing data...', currentRow: `${newActivities.length} activities prepared` }));

      if (newActivities.length > 0) {
        const groups = new Map<string, typeof newActivities>();
        newActivities.forEach(act => {
          const key = `${act.week}-${act.year}`;
          if (!groups.has(key)) groups.set(key, []);
          groups.get(key)!.push(act);
        });

        const conflictWeeks: string[] = [];
        for (const [key, group] of groups) {
          const [week, year] = key.split('-').map(Number);
          const { data: existing } = await supabase.from('activities').select('id').eq('week', week).eq('year', year);
          if (existing && existing.length > 0) {
            conflictWeeks.push(`W${week} (${existing.length} existing)`);
          }
        }

        if (conflictWeeks.length > 0) {
          const confirmMsg = `This will replace existing data for: ${conflictWeeks.join(', ')}. Are you sure you want to proceed?`;
          if (!confirm(confirmMsg)) {
            setBulkProgress(prev => ({
              ...prev,
              currentStatus: 'Upload cancelled by user',
              isComplete: true,
              failedRows: []
            }));
            return;
          }
        }

        for (const [, group] of groups) {
          await supabase.from('activities').delete().eq('week', group[0].week).eq('year', group[0].year);
        }
        const { error } = await supabase.from('activities').insert(newActivities);
        if (error) {
          failedRows.push({ row: 0, data: 'Database sync', error: error.message, solution: 'Check your connection and try again' });
        } else {
          logAudit('IMPORT', `Bulk upload: ${newActivities.length} updates`);
          await fetchData();
        }
      }

      setBulkProgress(prev => ({
        ...prev,
        success: newActivities.length,
        errors: failedRows.map(f => f.error),
        failedRows,
        currentStatus: failedRows.length > 0 ? 'Completed with issues' : 'Upload successful!',
        isComplete: true
      }));
    } catch (e: any) {
      setBulkProgress(prev => ({
        ...prev,
        errors: [e?.message || 'Upload failed'],
        currentStatus: 'Upload failed',
        isComplete: true,
        failedRows: [{ row: 0, data: 'Error', error: e?.message || 'Unknown error', solution: 'Refresh and try again' }]
      }));
    }
  };

  return (
    <div className="p-6 space-y-8 pb-20">
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 bg-white p-6 md:p-8 rounded-[4px] border border-slate-200 shadow-sm animate-slide-up">
        <div className="flex items-center gap-5">
          <div className="w-14 h-14 bg-slate-900 rounded-[4px] flex items-center justify-center text-white shadow-lg relative shrink-0">
            <FileText size={24} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight leading-none">Weekly Reporting</h2>
            <p className="text-[11px] text-slate-500 mt-2 font-medium flex items-center gap-2">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> Cycle W{currentFilterWeekNum}{selectedWeek !== null ? ' (Previous)' : ''} • {currentUser?.department || 'Registry'} • <span className="font-mono text-slate-400">{currentUser?.department ? generateReportId(currentUser.department, currentFilterWeekNum, selectedYear) : '...'}</span>
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <select value={selectedYear} onChange={(e) => setSelectedYear(parseInt(e.target.value))} className="px-4 py-3 bg-white border border-slate-200 rounded-[4px] text-[11px] font-bold uppercase tracking-wider">
            {[2024, 2025, 2026, 2027].map(y => <option key={y} value={y}>{y}</option>)}
          </select>
          <select value={selectedWeek ?? ''} onChange={(e) => setSelectedWeek(e.target.value ? parseInt(e.target.value) : null)} className="px-4 py-3 bg-white border border-slate-200 rounded-[4px] text-[11px] font-bold uppercase tracking-wider">
            <option value="">Current: {getWeekDateRange(currentFilterWeekNum, selectedYear)}</option>
            {weekOptions.map(w => <option key={w.value} value={w.value}>{w.label}</option>)}
          </select>
          {canCreate && (
            <div className="flex items-center gap-2">
              <button onClick={downloadCSVTemplate} className="flex items-center gap-2 px-4 py-3 bg-emerald-50 text-emerald-700 rounded-[4px] text-[11px] font-bold uppercase tracking-wider hover:bg-emerald-100 transition-all border border-emerald-200">
                <Download size={16} /> Template
              </button>
              <label className="flex items-center gap-2 px-5 py-3 bg-slate-100 text-slate-600 rounded-[4px] text-[11px] font-bold uppercase tracking-wider hover:bg-slate-200 transition-all border border-slate-200 cursor-pointer">
                <UploadCloud size={16} /> Bulk Upload
                <input type="file" accept=".csv" className="hidden" onChange={(e) => { if (e.target.files?.[0]) handleBulkUpload(e.target.files[0]); }} />
              </label>
            </div>
          )}
          {canCreate && (
            <button onClick={() => { setEditingActivityId(null); setActivityTitle(''); setActivityComments(''); setTasks([]); setAiSuggestion(null); setSelectedKrId(''); setIsAddModalOpen(true); }} disabled={!isBypassActive && (isPartiallyLocked || isFullyLocked)} className="flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-[4px] text-[11px] font-bold uppercase tracking-wider shadow-lg shadow-primary-500/20 hover:bg-primary-700 transition-all disabled:opacity-50">
              <Plus size={18} /> New Update
            </button>
          )}
          {isPartiallyLocked && !isBypassActive && (
            <div className="px-4 py-3 bg-amber-50 text-amber-600 rounded-[4px] text-[11px] font-bold uppercase tracking-wider border border-amber-100 flex items-center gap-2">
              <AlertTriangle size={14} /> Status-Only Mode
            </div>
          )}
          {isFullyLocked && !isBypassActive && (
            <div className="px-4 py-3 bg-slate-100 text-slate-500 rounded-[4px] text-[11px] font-bold uppercase tracking-wider border border-slate-200 flex items-center gap-2">
              <Lock size={14} /> Report Locked
            </div>
          )}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-32">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      ) : !currentUser ? (
        <div className="flex flex-col items-center justify-center py-32 bg-white rounded-[4px] border border-slate-200 border-dashed animate-fade-in">
          <div className="w-16 h-16 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center mb-6">
            <ShieldCheck size={32} />
          </div>
          <p className="text-slate-400 font-bold uppercase tracking-widest text-[11px]">Authentication Required</p>
          <p className="text-slate-300 text-[9px] uppercase tracking-wider mt-2 font-medium">Please log in to access Weekly Reporting</p>
        </div>
      ) : (
        <div className="space-y-12">
          {availableKRs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-32 bg-white rounded-[4px] border border-slate-200 border-dashed animate-fade-in">
              <div className="w-16 h-16 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center mb-6">
                <Target size={32} />
              </div>
              <p className="text-slate-400 font-bold uppercase tracking-widest text-[11px]">No Key Results found for {selectedYear}</p>
              <p className="text-slate-300 text-[9px] uppercase tracking-wider mt-2 font-medium">Create KRs in Quarterly KRs module first</p>
            </div>
          ) : (() => {
            const parentKRsOnly = availableKRs.filter(kr => !kr.parent_kr_id && kr.label.match(/^KR[1-4]$/));
            const seenLabels = new Set<string>();
            const uniqueParentKRs = parentKRsOnly.filter(kr => {
              const key = `${kr.quarter}-${kr.label}`;
              if (seenLabels.has(key)) return false;
              seenLabels.add(key);
              return true;
            });

            const weekFilter = (week: number) => {
              const targetWeek = selectedWeek !== null ? selectedWeek : currentFilterWeekNum;
              if (intelligencePeriod === 'current') return week === targetWeek;
              if (intelligencePeriod === 'last4') return week >= targetWeek - 3 && week <= targetWeek;
              if (intelligencePeriod === 'last8') return week >= targetWeek - 7 && week <= targetWeek;
              if (intelligencePeriod === 'quarter') return true;
              return week === targetWeek;
            };

            const allFilteredActivities = activities.filter(a => weekFilter(a.week) && a.year === selectedYear && (isBypassActive || a.department === currentUser?.department));
            console.log('[DEBUG] SelectedWeek:', selectedWeek, 'CurrentFilterWeek:', currentFilterWeekNum, 'Total activities:', activities.length, 'Filtered:', allFilteredActivities.length);
            const overallAvg = allFilteredActivities.length > 0
              ? Math.round(allFilteredActivities.reduce((sum, a) => sum + (a.score || 0), 0) / allFilteredActivities.length)
              : 0;

            const lastWeekNum = currentFilterWeekNum - 1;
            const lastWeekYear = lastWeekNum < 1 ? selectedYear - 1 : selectedYear;
            const adjustedLastWeekNum = lastWeekNum < 1 ? 52 : lastWeekNum;
            const lastWeekActivities = activities.filter(a => a.week === adjustedLastWeekNum && a.year === lastWeekYear && (isBypassActive || a.department === currentUser?.department));
            console.log('[DEBUG] Last week activities:', lastWeekActivities.length);
            const lastWeekTaskCounts = lastWeekActivities.reduce((acc, act) => {
              const taskArray = Array.isArray(act.tasks) ? act.tasks : (typeof act.tasks === 'string' ? JSON.parse(act.tasks) : []);
              const notDoneCount = taskArray.filter((t: Task) => t.status === TaskStatus.NotDone).length;
              if (notDoneCount > 0) {
                acc.totalTasks += taskArray.length;
                acc.notDoneTasks += notDoneCount;
              }
              return acc;
            }, { totalTasks: 0, notDoneTasks: 0 });

            return (
              <>
                <div className="flex items-center justify-end gap-4 mb-6">
                  {lastWeekTaskCounts.notDoneTasks > 0 && (
                    <button onClick={() => setShowLastWeekOutstanding(true)} className="flex items-center gap-4 bg-white px-6 py-4 rounded-xl border border-amber-200 shadow-sm hover:border-amber-400 hover:shadow-md transition-all cursor-pointer">
                      <span className="text-[11px] font-bold text-amber-600 uppercase tracking-widest">Last Week Outstanding</span>
                      <div className="text-right">
                        <span className="text-xl font-bold text-amber-600">{lastWeekTaskCounts.notDoneTasks}</span>
                        <span className="text-[10px] text-slate-400 block">tasks not done</span>
                      </div>
                    </button>
                  )}
                  {overallAvg > 0 && (
                    <div className="flex items-center gap-4 bg-white px-6 py-4 rounded-xl border border-slate-200 shadow-sm">
                      <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Weekly Scoreboard</span>
                      <div className="relative w-16 h-16">
                        <svg className="w-16 h-16 transform -rotate-90">
                          <circle cx="32" cy="32" r="28" stroke="#e2e8f0" strokeWidth="4" fill="none" />
                          <circle cx="32" cy="32" r="28" stroke={overallAvg >= 70 ? '#10b981' : overallAvg >= 40 ? '#f59e0b' : '#ef4444'} strokeWidth="4" fill="none" strokeDasharray={`${overallAvg * 1.76} 176`} strokeLinecap="round" />
                        </svg>
                        <span className="absolute inset-0 flex items-center justify-center text-lg font-bold text-slate-900">{overallAvg}%</span>
                      </div>
                    </div>
                  )}
                </div>

                {uniqueParentKRs.map(kr => {
                  const krActs = activities.filter(a => a.key_result_id === kr.id && weekFilter(a.week) && a.year === selectedYear && (isBypassActive || a.department === currentUser?.department));
                  console.log('[DEBUG] KR:', kr.label, 'Activities for this KR:', krActs.length, 'key_result_id:', kr.id, 'target week:', selectedWeek ?? currentFilterWeekNum, 'year:', selectedYear);
                  const krAvg = krActs.length > 0
                    ? Math.round(krActs.reduce((sum, a) => sum + (a.score || 0), 0) / krActs.length)
                    : 0;
                  return (
                    <div key={kr.id} className="animate-fade-in">
                      <div className="flex items-center gap-4 mb-6">
                        <div className="px-3 py-1 bg-slate-900 text-white rounded text-[10px] font-bold uppercase tracking-wider">{kr.label}</div>
                        <h2 className="text-base font-semibold text-slate-800">{kr.title}</h2>
                        {krAvg > 0 && (
                          <span className="ml-auto text-[11px] font-bold text-primary-500 bg-primary-50 px-3 py-1 rounded-full">Avg: {krAvg}%</span>
                        )}
                        <div className="h-px flex-grow bg-slate-200" />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {krActs.map((a, i) => (
                          <ActivityCard key={a.id} activity={a} index={i} keyResultLabel={kr.label}
                            onEdit={(act) => {
                              if (!isBypassActive && (isPartiallyLocked || isFullyLocked)) {
                                if (isPartiallyLocked) alert("Governance Protocol: Report is in Status-Only Mode. You can only update task status checkboxes.");
                                else alert("Governance Protocol: Report is Fully Locked.");
                                return;
                              }
                              setEditingActivityId(act.id);
                              setSelectedKrId(act.key_result_id);
                              setActivityTitle(act.title);
                              setActivityComments(act.comments || '');
                              setTasks([...act.tasks]);
                              setAiSuggestion(null);
                              setIsAddModalOpen(true);
                            }}
                            onDelete={async (id) => {
                              if (!isBypassActive && (isPartiallyLocked || isFullyLocked)) { alert("Governance Protocol: Deletion is restricted during lock phases."); return; }
                              if (confirm('Delete this update?')) {
                                await supabase.from('activities').delete().eq('id', id);
                                fetchData();
                              }
                            }}
                            onTaskToggle={handleTaskStatusToggle}
                            isContentLocked={isFullyLocked} isPartiallyLocked={isPartiallyLocked} isBypassActive={isBypassActive} canModify={canModifyActivity(a)} />
                        ))}
                        {canCreate && !isFullyLocked && !isPartiallyLocked && !isBypassActive && (
                          <button onClick={() => { setEditingActivityId(null); setSelectedKrId(kr.id); setActivityTitle(''); setActivityComments(''); setTasks([]); setAiSuggestion(null); setIsAddModalOpen(true); }} className="h-full min-h-[340px] border-2 border-dashed border-slate-200 rounded-[4px] flex flex-col items-center justify-center text-slate-300 hover:text-primary-500 hover:border-primary-200 transition-all group p-10 bg-white/40">
                            <div className="w-12 h-12 rounded-[4px] bg-white flex items-center justify-center shadow-sm border border-slate-100 mb-5 group-hover:scale-110 transition-transform"><Plus size={24} /></div>
                            <span className="text-[11px] font-bold uppercase tracking-wider text-center leading-relaxed">Add Update Node</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </>
            )
          })()}
        </div>
      )}

      {isAddModalOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-950/40 backdrop-blur-md p-4 animate-fade-in">
          <div className="bg-white rounded-[4px] shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col border border-white/20 animate-scale-in max-h-[92vh]">
            <div className="px-8 py-6 border-b border-slate-50 flex justify-between items-center bg-white shrink-0">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-[4px] bg-primary-50 text-primary-600 flex items-center justify-center shadow-inner"><Sparkles size={20} /></div>
                <div>
                  <h3 className="font-bold text-slate-900 text-lg tracking-tight leading-none">{editingActivityId ? 'Modify Update' : 'New Update'}</h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase mt-1 tracking-widest">Strategic Alignment Protocol</p>
                </div>
              </div>
              <button onClick={() => setIsAddModalOpen(false)} className="p-2 hover:bg-slate-50 rounded-[4px] transition-all text-slate-300 hover:text-slate-600"><X size={24} /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
              <div className="space-y-3">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">1. Link to Strategic KR <span className="text-primary-500 normal-case font-medium ml-1">(Parent KRs Only)</span></label>
                {(() => {
                  const parentKRs = availableKRs.filter(kr => !kr.parent_kr_id && kr.label.match(/^KR[1-4]$/));
                  const seen = new Set<string>();
                  const uniqueOptions: { label: string; value: string }[] = [];
                  parentKRs.forEach(kr => {
                    const key = `${kr.quarter}-${kr.label}`;
                    if (!seen.has(key)) {
                      seen.add(key);
                      uniqueOptions.push({ label: `${kr.label}: ${kr.title}`, value: kr.id });
                    }
                  });
                  console.log('[DEBUG] Parent KRs:', parentKRs.map(k => ({ id: k.id, label: k.label, title: k.title, quarter: k.quarter })));
                  console.log('[DEBUG] Unique options:', uniqueOptions);
                  return <Select value={selectedKrId} onChange={(val) => setSelectedKrId(String(val))} options={uniqueOptions} placeholder={uniqueOptions.length === 0 ? "No parent KRs available" : "Select Strategic Key Result..."} className="w-full" />;
                })()}
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">2. Activity Title</label>
                  <button onClick={vetTitleWithAI} disabled={!activityTitle.trim() || isVetting} className="flex items-center gap-2 text-[10px] font-bold uppercase text-primary-600 hover:text-primary-700 transition-colors disabled:opacity-30">
                    {isVetting ? <LoaderCircle size={12} className="animate-spin" /> : <Sparkles size={12} />}
                    {isVetting ? 'Vetting...' : 'AI Review'}
                  </button>
                </div>
                <input type="text" value={activityTitle} onChange={(e) => setActivityTitle(e.target.value)} placeholder="Describe the measurable tactical progress..." className="w-full p-4 bg-slate-50 border border-slate-200 rounded-[4px] text-sm font-bold outline-none focus:ring-4 focus:ring-primary-500/10 focus:bg-white transition-all shadow-inner" />
                {aiSuggestion && (
                  <div className="bg-slate-900 text-white rounded-[4px] p-5 space-y-3 animate-slide-up">
                    <p className="text-[11px] font-medium leading-relaxed text-slate-300 italic">"{aiSuggestion}"</p>
                    <div className="flex gap-2">
                      <button onClick={() => { const rec = aiSuggestion.match(/Recommendation: (.*)/); if (rec) setActivityTitle(rec[1]); setAiSuggestion(null); }} className="px-3 py-1.5 bg-white text-slate-950 rounded-[4px] text-[9px] font-bold uppercase hover:bg-primary-500 hover:text-white transition-all">Adopt</button>
                      <button onClick={() => setAiSuggestion(null)} className="px-3 py-1.5 border border-white/20 text-white rounded-[4px] text-[9px] font-bold uppercase hover:bg-white/10">Dismiss</button>
                    </div>
                  </div>
                )}
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">3. Tactical Steps</label>
                  <span className="text-[10px] font-bold text-primary-600 bg-primary-50 px-2.5 py-1 rounded-full uppercase tracking-wider">{tasks.length} Steps</span>
                </div>
                <div className="space-y-2.5 bg-slate-50 p-5 rounded-[4px] border border-slate-100 shadow-inner">
                  {tasks.map((task, idx) => (
                    <div key={task.id} className="flex items-center gap-3 p-3 bg-white border border-slate-200 rounded-[4px] group animate-slide-up shadow-sm">
                      <div className="w-7 h-7 rounded bg-slate-50 flex items-center justify-center text-[10px] font-bold text-slate-400">{idx + 1}</div>
                      <span className="text-[13px] font-semibold text-slate-700 flex-1">{task.title}</span>
                      <button onClick={() => setTasks(prev => prev.filter(t => t.id !== task.id))} className="text-slate-300 hover:text-rose-500 transition-all p-1.5"><Trash2 size={16} /></button>
                    </div>
                  ))}
                  <div className="flex gap-2 mt-3">
                    <input type="text" value={currentTaskInput} onChange={(e) => setCurrentTaskInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTask())} placeholder="Add next task..." className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-[4px] text-sm font-semibold outline-none focus:border-primary-400" />
                    <button onClick={handleAddTask} disabled={!currentTaskInput.trim()} className="px-4 py-2 bg-slate-900 text-white rounded-[4px] hover:bg-primary-600 transition-all text-[10px] font-bold uppercase disabled:opacity-20"><Plus size={14} /></button>
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">4. Contextual Narrative</label>
                <RichTextEditor value={activityComments} onChange={setActivityComments} placeholder="Alignment outcomes or blockers..." />
              </div>
            </div>
            <div className="px-8 py-6 border-t border-slate-50 bg-slate-50/50 shrink-0">
              <button onClick={saveActivity} disabled={submitting || tasks.length === 0 || !activityTitle.trim() || !selectedKrId} className="w-full py-4 bg-slate-950 text-white rounded-[4px] text-[12px] font-bold uppercase tracking-widest shadow-xl hover:bg-primary-600 transition-all flex items-center justify-center gap-3 active:scale-[0.98] disabled:opacity-30">
                {submitting ? <LoaderCircle className="animate-spin" size={18} /> : <Save size={18} />}
                {submitting ? 'Syncing...' : 'Sync to Registry'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportModule;
