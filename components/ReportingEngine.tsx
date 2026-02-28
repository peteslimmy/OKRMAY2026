
import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  CheckCircle2,
  Plus,
  X,
  Trash2,
  Edit3,
  LoaderCircle,
  ShieldCheck,
  UploadCloud,
  Zap,
  MoreVertical,
  FileText,
  Lock,
  Info,
  XCircle,
  Save,
  PlusCircle,
  Quote,
  HelpCircle,
  Sparkles,
  Search,
  Check,
  RotateCcw,
  ArrowRight,
  AlertTriangle,
  FileWarning,
  ListChecks,
  ListFilter,
  AlertCircle,
  Target
} from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import DOMPurify from 'dompurify';
import { Activity, Task, TaskStatus, KeyResult, UserRole, User, StrategicNote } from '../types';
import {
  calculateActivityScore,
  getRecentWeekRanges,
  logAudit,
  getSessionUser,
  getReportLockStatus,
  getRegistryKeyResults,
  generateReportId
} from '../utils';
import { RichTextEditor } from './RichTextEditor';
import { Select } from './ui/Select';
import { supabase } from '../supabaseClient';

const getHeuristicHints = (text: string) => {
  const input = text.toLowerCase().trim();
  const words = input.split(/\s+/).filter(w => w.length > 0);

  const strategicVerbs = ['implement', 'execute', 'launch', 'deploy', 'develop', 'conduct', 'audit', 'analyze', 'configure', 'design', 'establish', 'integrate', 'streamline', 'automate', 'scale', 'optimize', 'complete', 'resolve', 'reduce', 'validate', 'achieve', 'ensure', 'perform'];
  const hasStrongVerb = strategicVerbs.some(v => words.slice(0, 5).some(w => w.startsWith(v)));
  const isSpecific = hasStrongVerb && words.length >= 6;

  const measurablePatterns = [
    /\b\d+%\b/,
    /\b\d+\s?(users|leads|deals|hours|days|weeks|nodes|items|units|records|tickets|seconds|sec|ms|minutes|min|hr)\b/i,
    /[$£₦€]\s?\d+/,
    /\b(zero|100%|full|none|all|complete)\b/i
  ];
  const isMeasurable = measurablePatterns.some(p => p.test(input));

  const relevantKeywords = ['revenue', 'efficiency', 'growth', 'strategy', 'cost', 'users', 'risk', 'security', 'qa', 'defects', 'access', 'stakeholders', 'performance', 'compliance', 'quality', 'product'];
  const isRelevant = words.length >= 4 && words.some(w => relevantKeywords.some(k => w.includes(k)));

  const isAchievable = words.length >= 4 && words.length <= 75;
  const isTimebound = /\b(by|within|before|after|due|q[1-4]|eod|eow|weekly|monday|friday|january|february|march|april|may|june|july|august|september|october|november|december|202[4-9])\b/i.test(input);

  return { isSpecific, isMeasurable, isRelevant, isTimebound, isAchievable };
};

const TaskCheckmark: React.FC<{ status: TaskStatus; onClick: () => void; isLocked: boolean }> = ({ status, onClick, isLocked }) => {
  const isDone = status === TaskStatus.Done;
  const isNotDone = status === TaskStatus.NotDone;

  return (
    <div
      className={`shrink-0 pt-0.5 text-[9px] font-black uppercase tracking-wider transition-all duration-300 ${isDone ? 'text-emerald-600' : isNotDone ? 'text-rose-600' : 'text-slate-400'} ${!isLocked ? 'cursor-pointer hover:scale-105' : ''} group/status relative`}
      onClick={!isLocked ? onClick : undefined}
    >
      <span className={`px-2 py-0.5 rounded-[2px] border ${isDone ? 'bg-emerald-50 border-emerald-200' : isNotDone ? 'bg-rose-50 border-rose-200' : 'bg-slate-50 border-slate-200'}`}>
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
        <div
          className={`h-full ${colorClass} transition-all duration-1000 shadow-sm relative`}
          style={{ width: `${score}%` }}
        >
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
  activity: Activity;
  index: number;
  keyResultLabel: string;
  onEdit: (a: Activity) => void;
  onDelete: (id: string) => void;
  onTaskToggle: (activityId: string, taskId: string) => void;
  canModify: boolean;
  isBypassActive: boolean;
  isContentLocked: boolean;
  isPartiallyLocked: boolean;
}> = ({ activity, index, keyResultLabel, onEdit, onDelete, onTaskToggle, canModify, isBypassActive, isContentLocked, isPartiallyLocked }) => {
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
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

  const dynamicScore = useMemo(() => calculateActivityScore(taskArray, activity.week, activity.year), [taskArray, activity.week, activity.year]);
  const effectivelyLocked = isContentLocked && !isBypassActive;
  const effectivelyPartiallyLocked = isPartiallyLocked && !isBypassActive;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200/60 transition-all relative flex flex-col h-full hover:shadow-xl group ring-1 ring-slate-900/5">
      <div className="p-8 pb-5 flex-1 flex flex-col">
        <div className="flex justify-between items-start mb-6 gap-4">
          <div className="flex flex-wrap gap-2 flex-1">
            <span className="flex items-center gap-1.5 text-[10px] font-black text-emerald-600 bg-emerald-50/50 border border-emerald-100/50 px-3 py-1.5 rounded-lg uppercase tracking-wider">
              <ShieldCheck size={12} /> {keyResultLabel}-{index + 1}
            </span>
            {effectivelyPartiallyLocked && (
              <span className="text-[9px] font-bold text-amber-600 bg-amber-50 px-2.5 py-1.5 rounded-lg uppercase tracking-wider border border-amber-100 flex items-center gap-1">
                <AlertTriangle size={10} /> Status Only
              </span>
            )}
          </div>

          <div className="flex items-center gap-4 shrink-0">
            <div className="flex flex-col items-end text-right min-w-0">
              <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                <FileText size={10} className="text-primary-400" /> W{activity.week}
              </div>
              <span className="text-[9px] font-black text-slate-300 uppercase tracking-tight block truncate max-w-[120px]" title={generateReportId(activity.department, activity.week, activity.year)}>
                {generateReportId(activity.department, activity.week, activity.year)}
              </span>
            </div>

            <div className="relative" ref={menuRef}>
              {!effectivelyLocked && canModify && !effectivelyPartiallyLocked ? (
                <button onClick={() => setShowMenu(!showMenu)} className="p-2.5 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-full transition-all border border-transparent active:scale-95">
                  <MoreVertical size={16} />
                </button>
              ) : (
                <div className="p-2.5 text-slate-200 bg-slate-50/50 rounded-full border border-slate-50">
                  <Lock size={14} />
                </div>
              )}
              {showMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-2xl border border-slate-100 py-2 z-[100] animate-scale-in overflow-hidden">
                  <button onClick={() => { onEdit(activity); setShowMenu(false); }} className="w-full px-4 py-2.5 text-left text-[11px] font-bold uppercase tracking-widest text-slate-600 hover:bg-slate-50 flex items-center gap-3 transition-colors"><Edit3 size={14} /> Modify Update</button>
                  <button onClick={() => { onDelete(activity.id); setShowMenu(false); }} className="w-full px-4 py-2.5 text-left text-[11px] font-bold uppercase tracking-widest text-rose-600 hover:bg-rose-50 flex items-center gap-3 transition-colors"><Trash2 size={14} /> Purge Record</button>
                </div>
              )}
            </div>
          </div>
        </div>

        <h3 className="text-[14px] font-medium text-slate-900 tracking-tight leading-snug mb-6 group-hover:text-primary-600 transition-colors drop-shadow-sm">{activity.title}</h3>

        <ActivityProgressBar score={dynamicScore} total={totalTasks} completed={completedTasks} />

        {activity.comments && (
          <div className="bg-slate-50/50 border border-slate-100 rounded-lg p-5 mt-6 mb-2 relative overflow-hidden group/comment">
            <Quote className="absolute top-2 right-2 w-6 h-6 text-slate-100 transition-transform group-hover/comment:scale-110" />
            <div className="text-[12px] text-slate-600 leading-relaxed rich-text-content line-clamp-3 relative z-10" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(activity.comments) }} />
          </div>
        )}

        <div className="mt-8 mb-4">
          <p className="text-[12px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
            <ListFilter size={12} className="text-primary-500" /> Operational Milestones
          </p>
          <div className="space-y-1.5">
            {taskArray.length === 0 ? (
              <div className="py-8 text-center border-2 border-dashed border-slate-100 rounded-lg">
                <span className="text-[11px] font-medium text-slate-300 uppercase tracking-widest">No tasks defined</span>
              </div>
            ) : (
              taskArray.map((task: Task) => {
                const isDone = task.status === TaskStatus.Done;
                const isNotDone = task.status === TaskStatus.NotDone;

                return (
                  <div
                    key={task.id}
                    className={`flex items-start justify-between p-1.5 px-3 rounded-lg border transition-all duration-300 ${!effectivelyLocked ? 'cursor-pointer hover:shadow-md hover:border-primary-200 active:scale-[0.98]' : 'opacity-70'} ${isDone ? 'bg-emerald-50/40 border-emerald-100/60' : isNotDone ? 'bg-rose-50/40 border-rose-100/60' : 'bg-white border-slate-200/60 hover:border-slate-300'
                      }`}
                    onClick={() => !effectivelyLocked ? onTaskToggle(activity.id, task.id) : undefined}
                  >
                    <div className="flex-1 min-w-0 pr-3">
                      <span className={`text-[12px] font-bold leading-tight block truncate ${isDone ? 'text-emerald-900' : isNotDone ? 'text-rose-900' : 'text-slate-600'}`} title={task.title}>{task.title}</span>
                    </div>
                    <TaskCheckmark
                      status={task.status}
                      onClick={() => onTaskToggle(activity.id, task.id)}
                      isLocked={effectivelyLocked}
                    />
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      <div className="px-8 py-6 border-t border-slate-50 bg-slate-50/40 mt-auto rounded-b-[4px]">
        <div className="flex justify-between items-center gap-2.5">
          {[
            { label: 'Specific', active: hints.isSpecific, code: 'S' },
            { label: 'Measurable', active: hints.isMeasurable, code: 'M' },
            { label: 'Achievable', active: hints.isAchievable, code: 'A' },
            { label: 'Relevant', active: hints.isRelevant, code: 'R' },
            { label: 'Time-bound', active: hints.isTimebound, code: 'T' },
          ].map((m, idx) => (
            <div key={idx} className="flex flex-col items-center gap-2 group relative cursor-help flex-1">
              <div className={`w-9 h-9 rounded-[4px] flex items-center justify-center text-[11px] font-black transition-all duration-300 border ${m.active
                ? 'bg-emerald-500 text-white border-emerald-600 shadow-[0_2px_10px_-3px_rgba(16,185,129,0.4)]'
                : 'bg-white text-slate-300 border-slate-200'
                }`}>
                {m.code}
              </div>
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 px-3 py-2 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest rounded-[2px] opacity-0 group-hover:opacity-100 transition-all scale-95 group-hover:scale-100 whitespace-nowrap pointer-events-none z-50 shadow-2xl border border-white/10">
                <span className={m.active ? 'text-emerald-400' : 'text-slate-400'}>{m.label}:</span> {m.active ? 'PROTOCOL MET' : 'CRITERIA WEAK'}
                <div className="absolute top-full left-1/2 -translate-x-1/2 border-l-[4px] border-r-[4px] border-t-[4px] border-t-slate-900 border-x-transparent" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export const ReportingEngine: React.FC<{ selectedYear: number, selectedWeek?: string }> = ({ selectedYear, selectedWeek = 'all' }) => {
  const reportingWeeks = useMemo(() => getRecentWeekRanges(), []);
  const effectiveWeekValue = useMemo(() => (selectedWeek === 'all' ? reportingWeeks[0]?.value || '' : selectedWeek), [selectedWeek, reportingWeeks]);
  const currentFilterWeekNum = useMemo(() => parseInt(effectiveWeekValue.match(/\d+/)?.[0] || '1'), [effectiveWeekValue]);

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
  const [isImporting, setIsImporting] = useState(false);
  const [importData, setImportData] = useState('');

  const [bulkProgress, setBulkProgress] = useState({ current: 0, total: 0, success: 0, errors: [] as string[] });
  const [isVetting, setIsVetting] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState<string | null>(null);

  const isBypassActive = currentUser?.role === UserRole.SuperAdmin || currentUser?.role === UserRole.Admin;
  // FR: Only Managers/Directors can create reports. Admins are restricted to governance (edit/delete).
  const isManagerial = currentUser?.role === UserRole.Manager || currentUser?.role === UserRole.Director;
  const canCreate = isManagerial || isBypassActive;

  // Lock Status for the *currently selected week*
  const [governanceVersion, setGovernanceVersion] = useState(0);
  const lockStatus = useMemo(() => getReportLockStatus(currentFilterWeekNum, selectedYear), [currentFilterWeekNum, selectedYear, governanceVersion]);
  const isFullyLocked = lockStatus === 'LOCKED';
  const isPartiallyLocked = lockStatus === 'PARTIAL';

  // FR: Admins can edit anything (Governance). Managers can only edit their own unit's work.
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
      setAvailableKRs(krs);
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

  const downloadCSVTemplate = () => {
    const headers = "Key Result Label,Activity Title,Department,Owner Email,Comments,Task 1,Task 2,Task 3,Task 4,Task 5,Task 6,Task 7,Task 8,Task 9,Task 10\n";
    const sample = "KR1,Improve Mobile Responsiveness,IT,john.doe@example.com,\"Implemented responsive design across all key pages, improving user experience on mobile devices.\",Test API,Run UAT,Test responsiveness,Design new flow,Gather feedback,Create mockups,Analyze feedback,Update FAQs,Create tutorial content,Deploy changes\n";
    const blob = new Blob([headers + sample], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `4core_bulk_reporting_template.csv`;
    a.click();
  };

  const vetTitleWithAI = async () => {
    if (!activityTitle.trim() || isVetting) return;
    setIsVetting(true);
    setAiSuggestion(null);
    try {
      const apiKey = (import.meta as any).env.VITE_GEMINI_API_KEY;
      const ai = new (GoogleGenAI as any)({ apiKey });
      const prompt = `Critique this objective title: "${activityTitle}". Provide 1 alternative that is more Specific and Measurable. Format: "Analysis: [1 sentence] | Recommendation: [Measurable Title]"`;
      const response = await (ai.models as any).generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: { thinkingConfig: { includeThinking: true } }
      });
      setAiSuggestion(response.text || response.response?.text() || "Suggestion unavailable.");
    } catch (e) {
      setAiSuggestion("AI node unavailable.");
    } finally {
      setIsVetting(false);
    }
  };

  const handleBulkUpload = async () => {
    if (!importData.trim()) return;
    setSubmitting(true);
    const rows = importData.split('\n').filter(r => r.trim() !== '').slice(1);
    setBulkProgress({ current: 0, total: rows.length, success: 0, errors: [] });

    try {
      const newActivities: any[] = [];
      const errors: string[] = [];
      let successCount = 0;

      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        setBulkProgress(prev => ({ ...prev, current: i + 1 }));
        const parts = row.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(p => p.trim().replace(/^"|"$/g, '')); // Handle commas in quotes

        if (parts.length < 2) {
          errors.push(`Row ${i + 2}: Missing required columns. Expected at least 2 (Key Result, Activity Title).`);
          continue;
        }
        const krLabel = parts[0];
        const title = parts[1];
        const rowTasksRaw = parts.slice(2, 12); // Tasks start from index 2

        const krMatch = availableKRs.find(k => k.label.toUpperCase() === krLabel.toUpperCase());
        if (!krMatch) {
          errors.push(`Row ${i + 2}: Strategic KR "${krLabel}" not found.`);
          continue;
        }
        if (!title) {
          errors.push(`Row ${i + 2}: Activity Title missing.`);
          continue;
        }

        // Use current user's department and ID as owner
        if (!currentUser) {
          errors.push(`Row ${i + 2}: User not authenticated. Cannot assign owner.`);
          continue;
        }

        const rowTasks = rowTasksRaw.filter(t => t !== '').map(t => ({
          id: crypto.randomUUID(),
          title: t,
          status: TaskStatus.Undefined
        }));
        if (rowTasks.length === 0) {
          errors.push(`Row ${i + 2}: No tasks defined.`);
          continue;
        }
        newActivities.push({
          id: crypto.randomUUID(),
          key_result_id: krMatch.id,
          owner_id: currentUser?.id || 'SYSTEM',
          department: currentUser?.department || 'Registry',
          title: title,
          tasks: JSON.stringify(rowTasks),
          comments: '', // Comments removed from CSV, default to empty
          week: currentFilterWeekNum,
          year: selectedYear,
          score: calculateActivityScore(rowTasks, currentFilterWeekNum, selectedYear)
        });
        successCount++;
      }

      if (newActivities.length > 0) {
        const { error } = await supabase.from('activities').upsert(newActivities);
        if (error) throw error;
        logAudit('IMPORT', `Bulk ingestion complete: ${newActivities.length} updates added.`);
        await fetchData();
      }
      setBulkProgress(prev => ({ ...prev, success: successCount, errors: errors }));
      if (errors.length === 0) {
        setIsImporting(false);
        setImportData('');
      }
    } catch (e) {
      alert("Ingestion failure. Check cloud connection.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleTaskStatusToggle = async (activityId: string, taskId: string) => {
    const act = activities.find(a => a.id === activityId);
    if (!act) return;

    // Permission Check:
    // 1. If Bypass (Admin) -> Allow
    // 2. If Fully Locked -> Deny
    // 3. If Partial Lock -> Allow (Status Only)
    // 4. If Open -> Allow
    // 5. Must be owner/manager of unit (checked by canModifyActivity)

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
    const newScore = calculateActivityScore(updatedTasks, act.week, act.year);
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
        score: calculateActivityScore(tasks, currentFilterWeekNum, selectedYear)
      };
      const { error } = await supabase.from('activities').upsert([newAct]);
      if (error) throw error;
      setIsAddModalOpen(false);
      await fetchData();
      logAudit(editingActivityId ? 'UPDATE' : 'CREATE', `Update saved: ${activityTitle}`);
    } catch (e: any) {
      console.error("Save Error:", e);
      alert(`Save failure: ${e.message || "Check cloud status."}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddTask = () => {
    if (!currentTaskInput.trim()) return;
    setTasks(prev => [...prev, { id: crypto.randomUUID(), title: currentTaskInput.trim(), status: TaskStatus.Undefined }]);
    setCurrentTaskInput('');
  };

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 bg-white p-6 md:p-8 rounded-[4px] border border-slate-200 shadow-sm animate-slide-up">
        <div className="flex items-center gap-5">
          <div className="w-14 h-14 bg-slate-900 rounded-[4px] flex items-center justify-center text-white shadow-lg relative shrink-0">
            <FileText size={24} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight leading-none">Weekly Reporting</h2>
            <p className="text-[11px] text-slate-500 mt-2 font-medium flex items-center gap-2">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> Cycle W{currentFilterWeekNum} • {currentUser?.department || 'Registry'} • <span className="font-mono text-slate-400">{currentUser?.department ? generateReportId(currentUser.department, currentFilterWeekNum, selectedYear) : '...'}</span>
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {canCreate && (
            <button onClick={() => { setBulkProgress({ current: 0, total: 0, success: 0, errors: [] }); setIsImporting(true); }} disabled={isPartiallyLocked || isFullyLocked} className="flex items-center gap-2 px-5 py-3 bg-slate-100 text-slate-600 rounded-[4px] text-[11px] font-bold uppercase tracking-wider hover:bg-slate-200 transition-all border border-slate-200 disabled:opacity-50"><UploadCloud size={16} /> Bulk Upload</button>
          )}
          {canCreate && (
            <button onClick={() => { setEditingActivityId(null); setActivityTitle(''); setActivityComments(''); setTasks([]); setAiSuggestion(null); setSelectedKrId(''); setIsAddModalOpen(true); }} disabled={isPartiallyLocked || isFullyLocked} className="flex items-center gap-2 px-6 py-3.5 bg-primary-600 text-white rounded-[4px] text-[11px] font-bold uppercase tracking-wider shadow-lg shadow-primary-500/20 hover:bg-primary-700 transition-all disabled:opacity-50">
              <Plus size={18} /> New Update
            </button>
          )}
          {isPartiallyLocked && !isBypassActive && (
            <div className="px-4 py-2 bg-amber-50 text-amber-600 rounded-[4px] text-[10px] font-bold uppercase tracking-wider border border-amber-100 flex items-center gap-2">
              <AlertTriangle size={14} /> Status-Only Mode
            </div>
          )}
          {isFullyLocked && !isBypassActive && (
            <div className="px-4 py-2 bg-slate-100 text-slate-500 rounded-[4px] text-[10px] font-bold uppercase tracking-wider border border-slate-200 flex items-center gap-2">
              <Lock size={14} /> Report Locked
            </div>
          )}
          {!canCreate && isBypassActive && (
            <div className="px-4 py-2 bg-amber-50 text-amber-600 rounded-[4px] text-[10px] font-bold uppercase tracking-wider border border-amber-100 flex items-center gap-2">
              <ShieldCheck size={14} /> Governance Mode (Read/Edit Only)
            </div>
          )}
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-40 text-slate-400">
          <LoaderCircle className="w-10 h-10 animate-spin text-primary-500 mb-6" />
          <p className="font-semibold uppercase tracking-widest text-[11px]">Syncing Updates...</p>
        </div>
      ) : (
        <div className="space-y-12">
          {availableKRs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-32 bg-white rounded-[4px] border border-slate-200 border-dashed animate-fade-in">
              <div className="w-16 h-16 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center mb-6">
                <Target size={32} />
              </div>
              <p className="text-slate-400 font-bold uppercase tracking-widest text-[11px]">No strategic context found for {selectedYear}</p>
              <p className="text-slate-300 text-[9px] uppercase tracking-wider mt-2 font-medium">Verify node configuration in Governance Hub</p>
            </div>
          ) : availableKRs.map(kr => {
            const krActs = activities.filter(a =>
              a.key_result_id === kr.id &&
              a.week === currentFilterWeekNum &&
              (isBypassActive || a.department === currentUser?.department)
            );
            return (
              <div key={kr.id} className="animate-fade-in">
                <div className="flex items-center gap-4 mb-6">
                  <div className="px-3 py-1 bg-slate-900 text-white rounded text-[10px] font-bold uppercase tracking-wider">{kr.label}</div>
                  <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest">{kr.title}</h2>
                  <div className="h-px flex-grow bg-slate-200" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {krActs.map((a, i) => (
                    <ActivityCard
                      key={a.id}
                      activity={a}
                      index={i}
                      keyResultLabel={kr.label}
                      onEdit={(act) => {
                        // Prevent full edit if partially locked or fully locked (unless bypass)
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
                        if (!isBypassActive && (isPartiallyLocked || isFullyLocked)) {
                          alert("Governance Protocol: Deletion is restricted during lock phases.");
                          return;
                        }
                        if (confirm('Delete this update?')) {
                          await supabase.from('activities').delete().eq('id', id);
                          fetchData();
                        }
                      }}
                      onTaskToggle={handleTaskStatusToggle}
                      isContentLocked={isFullyLocked}
                      isPartiallyLocked={isPartiallyLocked}
                      isBypassActive={isBypassActive}
                      canModify={canModifyActivity(a)}
                    />
                  ))}
                  {canCreate && !isFullyLocked && !isPartiallyLocked && !isBypassActive && (
                    <button onClick={() => { setEditingActivityId(null); setSelectedKrId(kr.id); setActivityTitle(''); setActivityComments(''); setTasks([]); setAiSuggestion(null); setIsAddModalOpen(true); }} className="h-full min-h-[340px] border-2 border-dashed border-slate-200 rounded-[4px] flex flex-col items-center justify-center text-slate-300 hover:text-primary-500 hover:border-primary-200 transition-all group p-10 bg-white/40">
                      <div className="w-12 h-12 rounded-[4px] bg-white flex items-center justify-center shadow-sm border border-slate-100 mb-5 group-hover:scale-110 transition-transform">
                        <Plus size={24} />
                      </div>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-center leading-relaxed">Add Update Node</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {isImporting && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-900/40 backdrop-blur-md p-4 animate-fade-in">
          <div className="bg-white rounded-[4px] shadow-2xl w-full max-w-xl p-8 space-y-6 animate-scale-in flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center shrink-0">
              <div>
                <h3 className="font-bold text-slate-900 text-lg uppercase tracking-tight">Bulk Node Ingestion</h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Protocol: Intelligent Mapping</p>
              </div>
              <div className="flex items-center gap-4">
                <button onClick={downloadCSVTemplate} className="text-[11px] font-bold text-primary-600 uppercase hover:underline flex items-center gap-1.5"><FileText size={14} /> CSV Template</button>
                <label htmlFor="csv-upload" className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-600 rounded-[4px] text-[10px] font-bold uppercase tracking-wider border border-emerald-100 hover:bg-emerald-100 transition-colors cursor-pointer">
                  <UploadCloud size={14} /> UPLOAD CSV
                </label>
                <input
                  id="csv-upload"
                  type="file"
                  accept=".csv"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      const file = e.target.files[0];
                      const reader = new FileReader();
                      reader.onload = (ev) => {
                        if (ev.target?.result) {
                          setImportData(ev.target.result as string);
                        }
                      };
                      reader.readAsText(file);
                    }
                  }}
                  className="hidden"
                />
              </div>
            </div>

            {submitting ? (
              <div className="py-12 flex flex-col items-center justify-center space-y-8 w-full max-w-sm mx-auto">
                <div className="w-full space-y-2">
                  <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-slate-500">
                    <span>Ingestion Progress</span>
                    <span>{bulkProgress.total > 0 ? Math.round((bulkProgress.current / bulkProgress.total) * 100) : 0}%</span>
                  </div>
                  <div className="h-3 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                    <div
                      className="h-full bg-primary-600 transition-all duration-300 relative"
                      style={{ width: `${bulkProgress.total > 0 ? (bulkProgress.current / bulkProgress.total) * 100 : 0}%` }}
                    >
                      <div className="absolute inset-0 bg-white/30 animate-[shimmer_1s_infinite]" style={{ backgroundImage: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.5), transparent)' }}></div>
                    </div>
                  </div>
                </div>
                <div className="text-center">
                  <h4 className="font-bold text-slate-900 uppercase text-sm">Processing Data Stream</h4>
                  <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wider mt-1">Node {bulkProgress.current} of {bulkProgress.total}</p>
                </div>
              </div>
            ) : bulkProgress.errors.length > 0 ? (
              <div className="flex-1 overflow-y-auto space-y-6 p-2">
                <div className="p-5 bg-rose-50 border border-rose-100 rounded-[4px] flex items-start gap-4">
                  <FileWarning className="text-rose-600 shrink-0" size={20} />
                  <div>
                    <h4 className="text-rose-900 font-bold text-xs uppercase tracking-wider">Validation Faults Identified</h4>
                    <p className="text-rose-600 text-[11px] mt-1 font-medium">Please correct CSV formatting before retrying.</p>
                  </div>
                </div>
                <div className="space-y-2">
                  {bulkProgress.errors.map((err, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-100 rounded-[4px] text-[11px] font-medium text-slate-600">
                      <XCircle size={14} className="text-rose-500 shrink-0" /> {err}
                    </div>
                  ))}
                </div>
                <button onClick={() => setBulkProgress({ ...bulkProgress, errors: [] })} className="w-full py-4 bg-slate-900 text-white rounded-[4px] text-[11px] font-bold uppercase tracking-widest">Return to Editor</button>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                <div className="p-4 bg-amber-50 border border-amber-100 rounded-[4px] flex items-start gap-3">
                  <AlertCircle className="text-amber-600 shrink-0" size={18} />
                  <p className="text-amber-800 text-[11px] leading-relaxed font-medium uppercase tracking-tighter">Required: Key Result, Activity Title, Task 1, ..., Task 10.</p>
                </div>
                <textarea
                  value={importData}
                  onChange={(e) => setImportData(e.target.value)}
                  onDrop={(e) => {
                    e.preventDefault();
                    const file = e.dataTransfer.files[0];
                    if (file && file.type === 'text/csv') {
                      const reader = new FileReader();
                      reader.onload = (ev) => {
                        if (ev.target?.result) {
                          setImportData(ev.target.result as string);
                        }
                      };
                      reader.readAsText(file);
                    }
                  }}
                  onDragOver={(e) => e.preventDefault()}
                  placeholder="Paste your CSV dataset here or drag & drop a file..."
                  rows={10}
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-[4px] text-[12px] font-mono outline-none focus:ring-4 focus:ring-primary-500/10 focus:bg-white transition-all shadow-inner" />
              </div>
            )}

            {!submitting && bulkProgress.errors.length === 0 && (
              <div className="flex gap-3 shrink-0">
                <button onClick={() => setIsImporting(false)} className="flex-1 py-4 bg-slate-100 text-slate-500 rounded-[4px] font-bold text-xs uppercase tracking-wider">Cancel</button>
                <button onClick={handleBulkUpload} disabled={!importData.trim()} className="flex-[2] py-4 bg-primary-600 text-white rounded-[4px] font-bold text-xs uppercase tracking-wider shadow-lg shadow-primary-500/20 active:scale-95 transition-all">
                  Begin Sync
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {isAddModalOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-950/40 backdrop-blur-md p-4 animate-fade-in">
          <div className="bg-white rounded-[4px] shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col border border-white/20 animate-scale-in max-h-[92vh]">
            <div className="px-8 py-6 border-b border-slate-50 flex justify-between items-center bg-white shrink-0">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-[4px] bg-primary-50 text-primary-600 flex items-center justify-center shadow-inner">
                  <Sparkles size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-lg tracking-tight leading-none">{editingActivityId ? 'Modify Update' : 'New Update'}</h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase mt-1 tracking-widest">Protocol: Sequential Alignment</p>
                </div>
              </div>
              <button onClick={() => setIsAddModalOpen(false)} className="p-2 hover:bg-slate-50 rounded-[4px] transition-all text-slate-300 hover:text-slate-600"><X size={24} /></button>
            </div>

            <div className="flex-1 overflow-y-auto p-8 space-y-10 custom-scrollbar">
              <div className="space-y-3">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">1. Link to Strategic KR</label>
                <Select
                  value={selectedKrId}
                  onChange={(val) => setSelectedKrId(String(val))}
                  options={availableKRs.map(kr => ({ label: `${kr.label}: ${kr.title}`, value: kr.id }))}
                  placeholder="Select Strategic Key Result..."
                  className="w-full"
                />
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">2. Activity Title</label>
                  <button
                    onClick={vetTitleWithAI}
                    disabled={!activityTitle.trim() || isVetting}
                    className="flex items-center gap-2 text-[10px] font-bold uppercase text-primary-600 hover:text-primary-700 transition-colors disabled:opacity-30"
                  >
                    {isVetting ? <LoaderCircle size={12} className="animate-spin" /> : <Sparkles size={12} />}
                    {isVetting ? 'Vetting...' : '4CORE AI Review'}
                  </button>
                </div>
                <input
                  type="text"
                  value={activityTitle}
                  onChange={(e) => setActivityTitle(e.target.value)}
                  placeholder="Describe the measurable tactical progress..."
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-[4px] text-sm font-bold outline-none focus:ring-4 focus:ring-primary-500/10 focus:bg-white transition-all shadow-inner"
                />

                {aiSuggestion && (
                  <div className="bg-slate-900 text-white rounded-[4px] p-5 space-y-3 animate-slide-up relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-5"><Sparkles size={40} /></div>
                    <p className="text-[11px] font-medium leading-relaxed text-slate-300 italic">"{aiSuggestion}"</p>
                    <div className="flex gap-2">
                      <button onClick={() => {
                        const recMatch = aiSuggestion.match(/Recommendation: (.*)/);
                        if (recMatch) setActivityTitle(recMatch[1]);
                        setAiSuggestion(null);
                      }} className="px-3 py-1.5 bg-white text-slate-950 rounded-[4px] text-[9px] font-bold uppercase hover:bg-primary-500 hover:text-white transition-all">Adopt</button>
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
                      <button onClick={() => setTasks(prev => prev.filter(t => t.id !== task.id))} className="text-slate-300 hover:text-rose-500 transition-all p-1.5">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}

                  <div className="relative mt-3">
                    <div className="flex gap-2 bg-white p-2 rounded-[4px] border border-slate-200 focus-within:border-primary-400 transition-all shadow-sm">
                      <input
                        type="text"
                        value={currentTaskInput}
                        onChange={(e) => setCurrentTaskInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTask())}
                        placeholder="Add next task requirement..."
                        className="flex-1 px-3 py-2 bg-transparent text-sm font-semibold outline-none"
                      />
                      <button
                        onClick={handleAddTask}
                        disabled={!currentTaskInput.trim()}
                        className="px-4 py-2 bg-slate-900 text-white rounded-[4px] hover:bg-primary-600 transition-all flex items-center gap-2 shadow-sm disabled:opacity-20"
                      >
                        <span className="text-[10px] font-bold uppercase">Add</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">4. Contextual Narrative</label>
                <RichTextEditor value={activityComments} onChange={setActivityComments} placeholder="Alignment outcomes or blockers..." />
              </div>
            </div>

            <div className="px-8 py-6 border-t border-slate-50 bg-slate-50/50 flex flex-col gap-4 shrink-0">
              <button
                onClick={saveActivity}
                disabled={submitting || tasks.length === 0 || !activityTitle.trim() || !selectedKrId}
                className="w-full py-4 bg-slate-950 text-white rounded-[4px] text-[12px] font-bold uppercase tracking-widest shadow-xl hover:bg-primary-600 transition-all flex items-center justify-center gap-3 active:scale-[0.98] disabled:opacity-30"
              >
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



