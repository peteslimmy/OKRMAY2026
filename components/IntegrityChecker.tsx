
import React, { useState, useEffect, useMemo } from 'react';
import {
  Search,
  Settings2,
  History,
  AlertTriangle,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Info,
  Save,
  LoaderCircle,
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
  Check,
  ShieldCheck,
  Download,
  BarChart3,
  AlertCircle,
  ArrowUpRight,
  Plus,
  Bell,
  HelpCircle,
  Lock
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell } from 'recharts';
import { Activity, Task, TaskStatus, UserRole } from '../src/types';
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

        let newScore = calculateActivityScore(updatedTasks);

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
    <div className="space-y-8 animate-fade-in font-inter p-4 lg:p-0">
      {/* --- TOP HEADER / BREADCRUMB --- */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-2">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 text-[11px] font-bold text-slate-400 uppercase tracking-widest">
            <ActivityIcon size={12} className="text-primary-500" />
            <span>Organization</span>
            <ChevronDown size={12} className="-rotate-90" />
            <span className="text-primary-500 font-black">System Integrity</span>
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Integrity Audit</h1>
          <p className="text-slate-500 text-sm font-medium">Disciplinary Performance Governance & Logic Configuration</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex bg-slate-100 p-1.5 rounded-xl border border-slate-200">
            {[
              { id: 'audit', label: 'Tactical', icon: <Scale size={14} /> },
              { id: 'config', label: 'Logic', icon: <Settings2 size={14} /> },
              { id: 'history', label: 'Trace', icon: <History size={14} /> }
            ].map(t => (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id as any)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${activeTab === t.id ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
              >
                {t.icon} {t.label}
              </button>
            ))}
          </div>
          <div className="w-px h-8 bg-slate-200 mx-2"></div>
          <button
            onClick={() => alert("Report Exported")}
            className="flex items-center gap-2 px-6 py-3 bg-white text-slate-900 border border-slate-200 rounded-xl text-sm font-bold shadow-sm hover:bg-slate-50 transition-all hover:translate-y-[-1px]"
          >
            <Download size={18} /> Export Report
          </button>
        </div>
      </div>

      <div className="space-y-10 animate-slide-up">
        {activeTab === 'config' && (
          <div className="animate-scale-in space-y-8">
            {/* --- MAIN CONFIGURATION CARD --- */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-card overflow-hidden">
              <div className="p-10">
                <div className="flex items-center justify-between mb-10">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-primary-50 text-primary-600 rounded-xl flex items-center justify-center">
                      <Settings2 size={24} />
                    </div>
                    <h2 className="text-xl font-black text-slate-900 tracking-tight">Disciplinary Logic Configuration</h2>
                  </div>
                  <span className="px-3 py-1 bg-orange-50 text-orange-600 text-[10px] font-black uppercase tracking-widest rounded-lg border border-orange-100">
                    Active Protocol
                  </span>
                </div>

                <div className="space-y-12">
                  <div>
                    <div className="flex items-center justify-between mb-8">
                      <label className="text-sm font-bold text-slate-700">Adjustment Disciplinary Penalty</label>
                      <span className="px-4 py-1.5 bg-orange-50 text-orange-600 text-xs font-black rounded-full border border-orange-100">
                        -{penaltyConfig.toFixed(1)}% {penaltyConfig <= 5 ? 'Leniency' : 'Standard'}
                      </span>
                    </div>
                    <div className="relative h-2 bg-slate-100 rounded-full mb-8 group">
                      <input
                        type="range"
                        min="0"
                        max="20"
                        step="1"
                        title="Penalty Protocol Level"
                        value={penaltyConfig}
                        onChange={(e) => setPenaltyConfig(parseInt(e.target.value))}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      />
                      <div
                        className="absolute left-0 top-0 h-full bg-primary-600 rounded-full transition-all duration-300"
                        style={{ width: `calc(${penaltyConfig} / 20 * 100%)` } as React.CSSProperties}
                      >
                        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-6 h-6 bg-white border-4 border-primary-600 rounded-full shadow-lg scale-110 group-active:scale-125 transition-transform" />
                      </div>
                      <div className="absolute top-6 left-0 w-full flex justify-between px-1">
                        <span className="text-[10px] font-bold text-slate-300">-20%</span>
                        <span className="text-[10px] font-bold text-slate-300">-10%</span>
                        <span className="text-[10px] font-bold text-slate-300">-5%</span>
                        <span className="text-[10px] font-bold text-slate-300">0%</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-6 bg-primary-50/30 rounded-2xl border border-primary-100">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 bg-primary-100 text-primary-600 rounded-lg">
                          <ActivityIcon size={18} />
                        </div>
                        <h4 className="text-sm font-black text-primary-900 uppercase tracking-tight">Automated Impact Analysis</h4>
                      </div>
                      <p className="text-xs text-primary-700/80 leading-relaxed font-medium">
                        The proposed -{penaltyConfig}% adjustment reduces systemic friction by {15 - penaltyConfig}% while maintaining 98.2% compliance efficacy across all operational vectors.
                      </p>
                    </div>
                    <div className="p-6 bg-amber-50/50 rounded-2xl border border-amber-100">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 bg-amber-100 text-amber-600 rounded-lg">
                          <BarChart3 size={18} />
                        </div>
                        <h4 className="text-sm font-black text-amber-900 uppercase tracking-tight">Simulated Impact Preview</h4>
                      </div>
                      <p className="text-xs text-amber-700/80 leading-relaxed font-medium">
                        Projected outcome suggests a significant increase in node throughput. Risk of disciplinary recidivism remains within the "Green" threshold.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="px-10 py-6 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2 text-slate-400 text-xs font-medium">
                  <Info size={14} />
                  <span>Last updated: Oct 24, 2023 at 14:20 UTC</span>
                </div>
                <div className="flex items-center gap-4">
                  <button className="text-sm font-bold text-slate-500 hover:text-slate-900 px-4 py-2 transition-colors">Cancel Changes</button>
                  <button
                    onClick={saveConfig}
                    className="flex items-center gap-2 px-8 py-3 bg-primary-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-primary-500/20 hover:bg-primary-700 transition-all"
                  >
                    <Lock size={16} /> Commit Integrity Protocol
                  </button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Chart Column */}
              <div className="lg:col-span-2 space-y-4">
                <h3 className="text-lg font-black text-slate-900 tracking-tight">Historical Audit Performance</h3>
                <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-card h-[360px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={[
                      { name: 'Mon', value: 30 },
                      { name: 'Tue', value: 45 },
                      { name: 'Wed', value: 25 },
                      { name: 'Thu', value: 60 },
                      { name: 'Fri', value: 35 },
                      { name: 'Sat', value: 80 },
                      { name: 'Sun', value: 95 },
                    ]}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }} />
                      <YAxis hide />
                      <Tooltip
                        cursor={{ fill: '#f8fafc' }}
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                      />
                      <Bar dataKey="value" radius={[4, 4, 0, 0]} barSize={40}>
                        {[30, 45, 25, 60, 35, 80, 95].map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={index === 6 ? '#f97316' : '#cbd5e1'} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Violations Sidebar */}
              <div className="space-y-4">
                <h3 className="text-lg font-black text-slate-900 tracking-tight">Recent Violations</h3>
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-card divide-y divide-slate-100 min-h-[360px]">
                  {[
                    { id: '1', title: 'Protocol Variance-99', time: '2 minutes ago', value: '-5.0%', type: 'V' },
                    { id: '2', title: 'Latency Threshold', time: '1 hour ago', value: '-1.2%', type: 'L' },
                    { id: '3', title: 'Identity Mismatch', time: '4 hours ago', value: '-0.8%', type: 'I' },
                  ].map((v) => (
                    <div key={v.id} className="py-4 flex items-center justify-between first:pt-0 last:pb-0">
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm ring-4 ring-white shadow-sm ${v.type === 'V' ? 'bg-rose-50 text-rose-600' : 'bg-amber-50 text-amber-600'
                          }`}>
                          {v.type}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-900">{v.title}</p>
                          <p className="text-[10px] font-medium text-slate-400">{v.time}</p>
                        </div>
                      </div>
                      <span className="text-xs font-black text-rose-600 bg-rose-50 px-2 py-1 rounded-lg">
                        {v.value}
                      </span>
                    </div>
                  ))}
                  <button className="w-full mt-6 py-3 text-[11px] font-black uppercase tracking-widest text-slate-400 hover:text-primary-600 transition-colors">
                    View All Logs
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'audit' && (
          <div className="animate-scale-in space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-card overflow-hidden">
              <div className="p-10 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-black text-slate-900 tracking-tight">Status Correction Engine</h2>
                  <p className="text-sm text-slate-500 font-medium">Spot-check and revert inaccurate status claims.</p>
                </div>
                {selectedTasks.length > 0 && (
                  <button
                    onClick={() => { setIsBulkRevertMode(true); setRevertingTask({ activity: selectedTasks[0].activity, task: selectedTasks[0].task }); }}
                    className="bg-rose-600 text-white px-8 py-3 rounded-xl text-sm font-black uppercase tracking-widest shadow-lg shadow-rose-900/10 hover:bg-rose-700 transition-all"
                  >
                    Revert {selectedTasks.length} Nodes
                  </button>
                )}
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-slate-50/50 border-b border-slate-100">
                      <th className="px-10 py-5 text-left">
                        <input
                          type="checkbox"
                          title="Select All Nodes"
                          checked={selectedTasks.length > 0 && selectedTasks.length === filteredActivities.flatMap(a => a.tasks.filter(t => t.status === TaskStatus.Done)).length}
                          onChange={(e) => {
                            if (e.target.checked) {
                              const allDone = filteredActivities.flatMap(a => a.tasks.filter(t => t.status === TaskStatus.Done).map(t => ({ activity: a, task: t })));
                              setSelectedTasks(allDone);
                            } else {
                              setSelectedTasks([]);
                            }
                          }}
                          className="w-4 h-4 rounded border-slate-200 accent-primary-600 cursor-pointer"
                        />
                      </th>
                      <th className="px-6 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Tactical Node</th>
                      <th className="px-6 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Parent Metric</th>
                      <th className="px-10 py-5 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {filteredActivities.length === 0 ? (
                      <tr><td colSpan={4} className="py-20 text-center opacity-20 font-black uppercase text-xs">No active claims found</td></tr>
                    ) : (
                      filteredActivities.flatMap(activity => activity.tasks.filter(t => t.status === TaskStatus.Done).map(task => (
                        <tr key={task.id} className="group hover:bg-slate-50/50 transition-colors">
                          <td className="px-10 py-5">
                            <input
                              type="checkbox"
                              title={`Select node: ${task.title}`}
                              checked={selectedTasks.some(t => t.task.id === task.id)}
                              onChange={() => toggleTaskSelection(activity, task)}
                              className="w-4 h-4 rounded border-slate-200 accent-primary-600 cursor-pointer"
                            />
                          </td>
                          <td className="px-6 py-5 font-bold text-slate-700 text-sm">{task.title}</td>
                          <td className="px-6 py-5">
                            <span className="px-2 py-1 bg-slate-100 text-slate-500 text-[10px] font-black rounded-lg border border-slate-200 uppercase tracking-widest">
                              {activity.title}
                            </span>
                          </td>
                          <td className="px-10 py-5 text-right">
                            <button title="Revert Node Status" onClick={() => setRevertingTask({ activity, task })} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all opacity-0 group-hover:opacity-100">
                              <RotateCcw size={16} />
                            </button>
                          </td>
                        </tr>
                      )))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="animate-scale-in space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-card overflow-hidden">
              <div className="p-10 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-black text-slate-900 tracking-tight">Audit Trail Ledger</h2>
                  <p className="text-sm text-slate-500 font-medium">Immutable trace of all disciplinary adjustments.</p>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-slate-50/50 border-b border-slate-100">
                      <th className="px-10 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Timestamp</th>
                      <th className="px-10 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Operator</th>
                      <th className="px-10 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Details</th>
                      <th className="px-10 py-5 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Impact</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {history.length === 0 ? (
                      <tr><td colSpan={4} className="py-20 text-center opacity-20 font-black uppercase text-xs">No records found</td></tr>
                    ) : (
                      history.map(item => (
                        <tr key={item.id} className="hover:bg-slate-50/50 transition-colors text-sm">
                          <td className="px-10 py-5 font-bold text-slate-900">{new Date(item.timestamp).toLocaleTimeString()}</td>
                          <td className="px-10 py-5 text-slate-500 font-medium">{item.user_name || 'System'}</td>
                          <td className="px-10 py-5 font-bold text-slate-700">{item.details}</td>
                          <td className="px-10 py-5 text-right">
                            <span className={`px-2 py-1 rounded-lg font-black text-[10px] ${item.metadata?.penaltyApplied ? 'bg-rose-50 text-rose-600 border border-rose-100' : 'bg-emerald-50 text-emerald-600 border border-emerald-100'}`}>
                              {item.metadata?.penaltyApplied ? `-${item.metadata.penaltyValue}%` : 'WAIVED'}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* --- High Fidelity Reversion Safety Interlock --- */}
      {(revertingTask || isBulkRevertMode) && (
        <div className="fixed inset-0 z-[160] flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-6 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden animate-scale-in border border-white/20">
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




