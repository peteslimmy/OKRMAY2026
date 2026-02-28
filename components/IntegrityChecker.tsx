
import React, { useState, useEffect, useMemo } from 'react';
import {
  ShieldCheck,
  Settings2,
  History,
  AlertTriangle,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Info,
  Save,
  LoaderCircle,
  Search,
  ChevronDown,
  Activity as ActivityIcon,
  ShieldAlert,
  ArrowRightLeft,
  X,
  FileText,
  BadgeCheck,
  Scale,
  Gavel,
  Undo2,
  Trash2,
  MessageSquareQuote,
  // Fix: Added Check to the imports from lucide-react to resolve the "Cannot find name 'Check'" error.
  Check
} from 'lucide-react';
import { Activity, Task, TaskStatus, UserRole } from '../types';
import { logAudit, getWATTime, getCurrentWeekNumber, generateLocalUUID, getSessionUser, calculateActivityScore } from '../utils';
import { supabase } from '../supabaseClient';
import { Select } from './ui/Select';

export const IntegrityChecker: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'audit' | 'config' | 'history'>(() => {
    return (localStorage.getItem('4core_integrity_tab') as any) || 'audit';
  });

  const [penaltyConfig, setPenaltyConfig] = useState<number>(5);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const [revertingTask, setRevertingTask] = useState<{ activity: Activity, task: Task } | null>(null);
  const [selectedTasks, setSelectedTasks] = useState<{ activity: Activity, task: Task }[]>([]);
  const [isBulkRevertMode, setIsBulkRevertMode] = useState(false);

  const [applyPenalty, setApplyPenalty] = useState(true);
  const [waiveReason, setWaiveReason] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [history, setHistory] = useState<any[]>([]);
  const [historyFilter, setHistoryFilter] = useState('ALL');

  useEffect(() => {
    localStorage.setItem('4core_integrity_tab', activeTab);
  }, [activeTab]);

  useEffect(() => {
    const savedPenalty = localStorage.getItem('integrity_penalty_pct');
    if (savedPenalty) setPenaltyConfig(parseInt(savedPenalty));

    fetchCloudHistory();
    fetchActiveActivities();
  }, []);

  const fetchCloudHistory = async () => {
    const { data } = await supabase
      .from('audit_logs')
      .select('*')
      .eq('action', 'INTEGRITY_ADJUSTMENT')
      .order('timestamp', { ascending: false });
    if (data) setHistory(data);
  };

  const fetchActiveActivities = async () => {
    setLoading(true);
    try {
      const { week, year } = getCurrentWeekNumber();
      const weekNum = parseInt(week.replace(/\D/g, ''));

      const { data } = await supabase
        .from('activities')
        .select('*')
        .eq('year', year)
        .eq('week', weekNum);

      const parsed = (data as any[] || []).map(a => ({
        ...a,
        tasks: typeof a.tasks === 'string' ? JSON.parse(a.tasks) : a.tasks
      }));
      setActivities(parsed);
    } catch (e) {
      console.error("Governance fetch error:", e);
    } finally {
      setLoading(false);
    }
  };

  const saveConfig = () => {
    localStorage.setItem('integrity_penalty_pct', penaltyConfig.toString());
    logAudit('SYSTEM', `Integrity Protocol Updated: Status reversion penalty set to ${penaltyConfig}%`);
    alert("Governance Configuration Synchronized.");
  };

  const handleReversionConfirm = async (shouldApply: boolean) => {
    const tasksToRevert = isBulkRevertMode ? selectedTasks : (revertingTask ? [revertingTask] : []);
    if (tasksToRevert.length === 0) return;

    if (!shouldApply && (!waiveReason.trim() || waiveReason.trim().length < 10)) {
      alert("Governance Requirement: A formal reason (minimum 10 characters) must be provided to authorize a penalty waiver.");
      return;
    }

    setSubmitting(true);
    try {
      // Group by activity to minimize updates
      const tasksByActivity = tasksToRevert.reduce((acc, item) => {
        if (!acc[item.activity.id]) acc[item.activity.id] = [];
        acc[item.activity.id].push(item.task.id);
        return acc;
      }, {} as Record<string, string[]>);

      for (const [activityId, taskIds] of Object.entries(tasksByActivity)) {
        const castedTaskIds = taskIds as string[];
        const activity = activities.find(a => a.id === activityId);
        if (!activity) continue;

        const updatedTasks = activity.tasks.map(t =>
          castedTaskIds.includes(t.id) ? { ...t, status: TaskStatus.NotDone } : t
        );

        let newScore = calculateActivityScore(updatedTasks, activity.week, activity.year);

        if (shouldApply) {
          newScore = Math.max(0, newScore - (penaltyConfig * castedTaskIds.length)); // Cumulative penalty for bulk
        }

        const { error } = await supabase.from('activities').update({
          tasks: JSON.stringify(updatedTasks),
          score: newScore
        }).eq('id', activityId);

        if (error) throw error;
      }

      await logAudit('INTEGRITY_ADJUSTMENT', `BULK REVERSION: ${tasksToRevert.length} nodes reverted to Not Done.`, {
        penaltyApplied: shouldApply,
        penaltyValue: shouldApply ? penaltyConfig : 0,
        reason: waiveReason || 'Standard displicinary protocol applied.',
        count: tasksToRevert.length
      });

      await fetchActiveActivities();
      await fetchCloudHistory();
      setRevertingTask(null);
      setSelectedTasks([]);
      setIsBulkRevertMode(false);
      setWaiveReason('');
      setApplyPenalty(true);
      setSelectedFile(null);
    } catch (e) {
      console.error(e);
      alert("Cloud Sync Error during integrity adjustment.");
    } finally {
      setSubmitting(false);
    }
  };



  const toggleTaskSelection = (activity: Activity, task: Task) => {
    const exists = selectedTasks.find(t => t.task.id === task.id);
    if (exists) {
      setSelectedTasks(selectedTasks.filter(t => t.task.id !== task.id));
    } else {
      setSelectedTasks([...selectedTasks, { activity, task }]);
    }
  };

  const filteredActivities = useMemo(() => {
    if (!searchTerm.trim()) return activities;
    const term = searchTerm.toLowerCase();
    return activities.filter(a =>
      a.title.toLowerCase().includes(term) ||
      a.tasks.some(t => t.title.toLowerCase().includes(term))
    );
  }, [activities, searchTerm]);

  return (
    <div className="space-y-8 animate-fade-in font-montserrat">
      {/* Module Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white/80 backdrop-blur-xl p-8 rounded-[4px] border border-white shadow-xl">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 bg-slate-950 rounded-[4px] flex items-center justify-center text-white shadow-2xl relative">
            <Gavel size={32} />
            <div className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 rounded-full border-2 border-white flex items-center justify-center">
              <ShieldAlert size={10} className="text-white" />
            </div>
          </div>
          <div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tighter uppercase leading-none">Integrity Audit</h2>
            <p className="text-[10px] text-slate-500 mt-2 font-black uppercase tracking-[0.2em] flex items-center gap-2">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> Disciplinary Performance Governance
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 p-1.5 bg-slate-100 rounded-[4px] border border-slate-200 shadow-inner">
          {[
            { id: 'audit', label: 'Tactical Review', icon: <Scale size={14} /> },
            { id: 'config', label: 'Penalty Logic', icon: <Settings2 size={14} /> },
            { id: 'history', label: 'Audit Trace', icon: <History size={14} /> }
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as any)}
              className={`flex items-center gap-2 px-6 py-3 rounded-[4px] text-[11px] font-black uppercase tracking-widest transition-all ${activeTab === t.id ? 'bg-white text-slate-900 shadow-md ring-1 ring-slate-200' : 'text-slate-400 hover:text-slate-800'
                }`}
            >
              {t.icon} {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white/90 backdrop-blur-2xl p-12 rounded-[4px] shadow-2xl border border-white/50 min-h-[60vh] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-slate-50 rounded-full -translate-y-32 translate-x-32 opacity-40 blur-3xl pointer-events-none"></div>

        {/* --- Tab: Tactical Audit (CRUD interface for adjustments) --- */}
        {activeTab === 'audit' && (
          <div className="space-y-10 animate-slide-up">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-slate-100">
              <div className="border-l-[8px] border-emerald-500 pl-8">
                <h3 className="text-2xl font-black text-slate-900 tracking-tighter uppercase leading-none">Status Correction Engine</h3>
                <p className="text-sm text-slate-500 mt-3 font-medium">Spot-check and revert inaccurate status claims. Reversions trigger disciplinary scores.</p>
              </div>
              <div className="flex items-center gap-4 w-full md:w-auto">
                {selectedTasks.length > 0 && (
                  <button
                    onClick={() => { setIsBulkRevertMode(true); setRevertingTask({ activity: selectedTasks[0].activity, task: selectedTasks[0].task }); }} // Hack to trigger modal
                    className="bg-rose-600 text-white px-6 py-4 rounded-[4px] text-[11px] font-black uppercase tracking-widest shadow-xl hover:bg-rose-700 transition-all animate-scale-in"
                  >
                    Revert {selectedTasks.length} Nodes
                  </button>
                )}
                <div className="relative w-full md:w-80">
                  <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                  <input
                    type="text"
                    placeholder="Filter tactical nodes..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-200 rounded-[4px] text-sm font-bold outline-none focus:ring-4 focus:ring-slate-900/5 focus:bg-white transition-all shadow-inner"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">
              {loading ? (
                <div className="col-span-full py-32 flex flex-col items-center justify-center text-slate-300">
                  <LoaderCircle className="w-12 h-12 animate-spin mb-4" />
                  <span className="text-[10px] font-black uppercase tracking-[0.3em]">Harvesting Node Registry...</span>
                </div>
              ) : filteredActivities.length === 0 ? (
                <div className="col-span-full py-32 flex flex-col items-center justify-center text-slate-300 border-2 border-dashed border-slate-100 rounded-[4px]">
                  <BadgeCheck size={64} className="mb-6 opacity-20" />
                  <h4 className="text-xl font-bold text-slate-400">Registry Integrity Validated</h4>
                  <p className="text-xs uppercase font-black tracking-widest mt-2">No nodes found matching current filters.</p>
                </div>
              ) : (
                filteredActivities.map(activity => (
                  <div key={activity.id} className="bg-white rounded-[4px] border border-slate-100 p-10 shadow-sm hover:shadow-xl hover:border-primary-200 transition-all group flex flex-col relative">
                    <div className="flex justify-between items-start mb-8">
                      <div className="flex items-center gap-5">
                        <div className="w-12 h-12 bg-slate-50 rounded-[4px] flex items-center justify-center text-slate-400 group-hover:bg-primary-50 group-hover:text-primary-600 transition-colors shadow-inner">
                          <ActivityIcon size={24} />
                        </div>
                        <div>
                          <h4 className="font-black text-slate-900 text-[15px] leading-tight uppercase group-hover:text-primary-700 transition-colors">{activity.title}</h4>
                          <p className="text-[9px] text-slate-400 font-black uppercase tracking-[0.2em] mt-1.5 flex items-center gap-2">
                            W{activity.week} REPORT • <span className="text-primary-600">CLAIMED {activity.score}% PERFORMANCE</span>
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      {activity.tasks.map(task => {
                        const isDone = task.status === TaskStatus.Done;
                        const isSelected = selectedTasks.some(t => t.task.id === task.id);
                        return (
                          <div key={task.id} className={`flex items-center justify-between p-5 rounded-[4px] border transition-all ${isDone ? 'bg-emerald-50/40 border-emerald-100' : 'bg-slate-50/50 border-slate-100 opacity-60'} ${isSelected ? 'ring-2 ring-rose-500 border-rose-200 bg-rose-50' : ''}`}>
                            <div className="flex items-center gap-3">
                              {isDone && (
                                <div onClick={() => toggleTaskSelection(activity, task)} className={`w-5 h-5 rounded-[4px] border-2 cursor-pointer flex items-center justify-center transition-colors ${isSelected ? 'bg-rose-500 border-rose-500' : 'border-slate-300 bg-white'}`}>
                                  {isSelected && <Check size={12} className="text-white" />}
                                </div>
                              )}
                              <div className={`w-2 h-2 rounded-full ${isDone ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                              <span className={`text-[13px] font-bold ${isDone ? 'text-emerald-900' : 'text-slate-600'}`}>{task.title}</span>
                            </div>
                            {isDone && (
                              <button
                                onClick={() => { setRevertingTask({ activity, task }); setIsBulkRevertMode(false); setApplyPenalty(true); }}
                                className="flex items-center gap-2.5 px-5 py-2.5 bg-rose-600 text-white rounded-[4px] text-[10px] font-black uppercase tracking-widest shadow-lg shadow-rose-900/10 hover:bg-rose-700 active:scale-95 transition-all"
                              >
                                <RotateCcw size={14} /> Revert Node
                              </button>
                            )}
                            {!isDone && (
                              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-3">Review Not Required</span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* --- Tab: Penalty Configuration --- */}
        {activeTab === 'config' && (
          <div className="max-w-3xl space-y-12 animate-slide-up">
            <div className="border-l-[8px] border-primary-500 pl-8">
              <h3 className="text-3xl font-black text-slate-900 tracking-tighter uppercase leading-none">Disciplinary Logic</h3>
              <p className="text-sm text-slate-500 mt-3 font-medium leading-relaxed">Configure the standard performance penalty for integrity adjustments. This logic is applied automatically during node reversions unless explicitly waived via waiver protocol.</p>
            </div>

            <div className="bg-white p-12 rounded-[4px] border border-slate-200 shadow-sm space-y-12 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8">
                <Settings2 className="text-slate-50" size={120} />
              </div>

              <div className="space-y-8 relative z-10">
                <div className="flex justify-between items-end">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] block">Adjustment Disciplinary Penalty</label>
                  <span className="px-6 py-3 bg-slate-950 text-white rounded-[4px] font-black text-2xl shadow-xl">-{penaltyConfig}%</span>
                </div>
                <div className="flex items-center gap-8 bg-slate-50 p-6 rounded-[4px] border border-slate-100">
                  <input
                    type="range"
                    min="0"
                    max="20"
                    step="1"
                    value={penaltyConfig}
                    onChange={(e) => setPenaltyConfig(parseInt(e.target.value))}
                    className="flex-1 h-3 bg-white border border-slate-200 rounded-[4px] appearance-none cursor-pointer accent-primary-600 shadow-inner"
                  />
                  <div className="flex flex-col gap-1 text-right min-w-[120px]">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Protocol Level</span>
                    <span className={`text-[12px] font-black uppercase tracking-wider ${penaltyConfig > 10 ? 'text-rose-600' : 'text-emerald-600'}`}>
                      {penaltyConfig === 0 ? 'Disabled' : penaltyConfig <= 5 ? 'Leniency Tier' : penaltyConfig <= 15 ? 'Strategic Tier' : 'Draconian Tier'}
                    </span>
                  </div>
                </div>

                <div className="bg-amber-50 rounded-[4px] p-6 border border-amber-100 flex gap-4">
                  <div className="shrink-0 p-2 bg-amber-200 text-amber-700 rounded-[4px] h-fit"><Info size={20} /></div>
                  <div>
                    <h5 className="font-black text-amber-900 text-xs uppercase tracking-wider">Automated Impact Analysis</h5>
                    <p className="text-xs text-amber-700 mt-1 leading-relaxed font-medium">Setting this penalty affects the <span className="font-bold">Total Activity Score</span>. For example, if an activity with 4 tasks is reverted, the score drops from 100% to 75%, and then this additional disciplinary penalty is subtracted from the result.</p>
                  </div>
                </div>

                <div className="bg-blue-50 rounded-[4px] p-6 border border-blue-100 flex gap-4">
                  <div className="shrink-0 p-2 bg-blue-200 text-blue-700 rounded-[4px] h-fit"><ActivityIcon size={20} /></div>
                  <div>
                    <h5 className="font-black text-blue-900 text-xs uppercase tracking-wider">Simulated Impact Preview</h5>
                    <p className="text-xs text-blue-700 mt-1 leading-relaxed font-medium">
                      A single task reversion (from 100% done) would reduce an activity score by <span className="font-bold">{100 - 25 - penaltyConfig}%</span> (from 100% to 75% for task, then -{penaltyConfig}% penalty).
                    </p>
                  </div>
                </div>
              </div>

              <button
                onClick={saveConfig}
                className="w-full py-6 bg-slate-950 text-white rounded-[4px] text-[12px] font-black uppercase tracking-[0.2em] shadow-2xl shadow-slate-900/20 hover:scale-[1.01] hover:bg-primary-600 transition-all flex items-center justify-center gap-3 active:scale-95"
              >
                <Save size={20} /> Commit Integrity Protocol
              </button>
            </div>
          </div>
        )}

        {/* --- Tab: History Ledger --- */}
        {activeTab === 'history' && (
          <div className="space-y-10 animate-slide-up">
            <div className="flex justify-between items-end border-b border-slate-100 pb-6">
              <div className="border-l-[8px] border-blue-500 pl-8">
                <h3 className="text-3xl font-black text-slate-900 tracking-tighter uppercase leading-none">Adjustment Trace</h3>
                <p className="text-sm text-slate-500 mt-3 font-medium">An immutable high-fidelity trace of all tactical reversions and penalty applications.</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-3 bg-white border border-slate-200 rounded-[4px] pl-4 shadow-sm hover:border-slate-300 transition-all">
                  <History size={14} className="text-slate-400" />
                  <Select
                    value={historyFilter}
                    onChange={(val) => setHistoryFilter(val as string)}
                    options={[
                      { value: 'ALL', label: 'All Actions' },
                      { value: 'INTEGRITY_ADJUSTMENT', label: 'Integrity Reversions' },
                      { value: 'SYSTEM', label: 'System Config' }
                    ]}
                    variant="minimal"
                    className="px-2 py-3"
                  />
                </div>
              </div>
            </div>

            <div className="overflow-hidden rounded-[4px] border border-slate-200 bg-white shadow-xl relative group">
              <table className="w-full text-left">
                <thead className="bg-slate-950 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-white/5">
                  <tr>
                    <th className="px-8 py-6">Timestamp (WAT)</th>
                    <th className="px-8 py-6">Audit Node / Operator</th>
                    <th className="px-8 py-6">Disciplinary Action</th>
                    <th className="px-8 py-6 text-center">Score Delta</th>
                    <th className="px-8 py-6 text-right">Protocol Trail</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {history.filter(h => historyFilter === 'ALL' || h.action === historyFilter).length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-8 py-32 text-center text-slate-300">
                        <FileText size={48} className="mx-auto mb-4 opacity-20" />
                        <p className="text-sm uppercase font-black tracking-widest">No Integrity Adjustments Archived</p>
                      </td>
                    </tr>
                  ) : (
                    history.filter(h => historyFilter === 'ALL' || h.action === historyFilter).map(item => (
                      <tr key={item.id} className="hover:bg-slate-50/80 transition-colors group/row">
                        <td className="px-8 py-6">
                          <div className="flex flex-col">
                            <span className="text-[11px] font-black text-slate-900">{new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
                            <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">{new Date(item.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 bg-slate-100 rounded-[4px] flex items-center justify-center font-black text-[11px] text-slate-400 group-hover/row:bg-blue-50 group-hover/row:text-blue-600 transition-colors shadow-inner">{item.user_name?.[0] || 'O'}</div>
                            <div className="flex flex-col">
                              <span className="font-black text-slate-900 text-[12px]">{item.user_name || 'System Operator'}</span>
                              <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">{item.ip_address || '105.112.XX.XX'}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <div className="flex flex-col gap-1.5 max-w-xs">
                            <span className="font-black text-slate-800 text-[12px] leading-tight line-clamp-1">{item.details}</span>
                            {item.metadata?.reason && (
                              <div className="flex items-start gap-2 text-[10px] text-slate-400 italic">
                                <MessageSquareQuote size={12} className="shrink-0 mt-0.5" />
                                <span className="line-clamp-1">Waiver: {item.metadata.reason}</span>
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-8 py-6 text-center">
                          {item.metadata?.penaltyApplied ? (
                            <span className="px-3 py-1.5 bg-rose-50 text-rose-600 rounded-[4px] text-[9px] font-black uppercase tracking-widest border border-rose-100">
                              ADJUSTED -{item.metadata.penaltyValue}%
                            </span>
                          ) : (
                            <span className="px-3 py-1.5 bg-emerald-50 text-emerald-600 rounded-[4px] text-[9px] font-black uppercase tracking-widest border border-emerald-100">
                              WAIVED
                            </span>
                          )}
                        </td>
                        <td className="px-8 py-6 text-right">
                          <div className="flex justify-end gap-2">
                            <button className="p-2 bg-slate-50 text-slate-300 rounded-[4px] hover:bg-slate-900 hover:text-white transition-all"><ChevronDown size={16} /></button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* --- High Fidelity Reversion Safety Interlock --- */}
      {(revertingTask || isBulkRevertMode) && (
        <div className="fixed inset-0 z-[160] flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-6 animate-fade-in">
          <div className="bg-white rounded-[4px] shadow-2xl w-full max-w-xl overflow-hidden animate-scale-in border border-white/20">
            <div className="relative p-12 flex flex-col items-center text-center">
              <div className="absolute top-0 right-0 p-8">
                <ShieldAlert className="text-slate-50" size={160} />
              </div>

              <div className="w-24 h-24 bg-rose-50 rounded-[4px] flex items-center justify-center text-rose-600 mb-8 shadow-inner relative z-10 border border-rose-100 animate-pulse">
                <RotateCcw size={48} strokeWidth={2.5} />
              </div>

              <div className="relative z-10 space-y-4 mb-10">
                <h3 className="text-3xl font-black text-slate-900 tracking-tighter uppercase leading-none">
                  {isBulkRevertMode ? 'Bulk Reversion Protocol' : 'Node Reversion Protocol'}
                </h3>
                <p className="text-slate-500 text-[14px] leading-relaxed max-w-[420px] font-medium mx-auto">
                  {isBulkRevertMode
                    ? `You are performing an integrity override on ${selectedTasks.length} selected tactical tasks. This will revert all statuses to 'Not Done'.`
                    : <>You are performing an integrity override on tactical task <span className="font-black text-slate-900 underline decoration-rose-200 decoration-4">"{revertingTask?.task.title}"</span>. This will revert the node status to <span className="font-black text-slate-900">'Not Done'</span>.</>
                  }
                </p>
              </div>

              <div className="w-full space-y-6 mb-12 relative z-10">
                <div
                  onClick={() => setApplyPenalty(!applyPenalty)}
                  className={`group flex items-center justify-between p-6 rounded-[4px] border-2 transition-all cursor-pointer ${applyPenalty ? 'bg-rose-50 border-rose-200' : 'bg-slate-50 border-slate-200'}`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-6 h-6 rounded-[4px] border-2 flex items-center justify-center transition-colors ${applyPenalty ? 'bg-rose-600 border-rose-600' : 'bg-white border-slate-300'}`}>
                      {applyPenalty && <Check size={14} className="text-white" />}
                    </div>
                    <div className="text-left">
                      <span className="text-[13px] font-black text-slate-900 uppercase tracking-tight block">Apply Disciplinary Penalty</span>
                      <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                        {isBulkRevertMode ? `Cumulative Impact: -${penaltyConfig * selectedTasks.length}%` : `Substract ${penaltyConfig}% from registry score`}
                      </span>
                    </div>
                  </div>
                  <Scale size={24} className={applyPenalty ? 'text-rose-600' : 'text-slate-300'} />
                </div>

                {!applyPenalty && (
                  <div className="space-y-3 animate-slide-up">
                    <div className="flex justify-between items-center px-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] block">Protocol Waiver Justification</label>
                      <span className="text-[9px] font-black text-rose-500 uppercase tracking-widest">Mandatory</span>
                    </div>
                    <textarea
                      value={waiveReason}
                      onChange={(e) => setWaiveReason(e.target.value)}
                      placeholder="Specify why the penalty is being waived (e.g., Cleryical error, verified system sync latency)..."
                      rows={4}
                      className="w-full p-5 bg-slate-50 border border-slate-200 rounded-[4px] text-sm font-bold outline-none focus:ring-4 focus:ring-slate-900/5 focus:bg-white shadow-inner transition-all"
                    ></textarea>
                  </div>
                )}
              </div>

              <div className="flex gap-4 w-full relative z-10">
                <button
                  onClick={() => { setRevertingTask(null); setIsBulkRevertMode(false); setWaiveReason(''); }}
                  disabled={submitting}
                  className="flex-1 py-6 bg-slate-100 text-slate-500 rounded-[4px] text-[11px] font-black uppercase tracking-[0.2em] hover:bg-slate-200 transition-all disabled:opacity-50 active:scale-95"
                >
                  Abort Protocol
                </button>
                <button
                  onClick={() => handleReversionConfirm(applyPenalty)}
                  disabled={submitting || (!applyPenalty && !waiveReason.trim())}
                  className="flex-[2] py-6 bg-slate-950 text-white rounded-[4px] text-[11px] font-black uppercase tracking-[0.2em] shadow-2xl shadow-slate-950/20 hover:bg-rose-600 active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-30 disabled:grayscale"
                >
                  {submitting ? <LoaderCircle className="w-5 h-5 animate-spin" /> : <Undo2 size={18} />}
                  {submitting ? 'Updating Cloud...' : 'Confirm Reversion'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};




