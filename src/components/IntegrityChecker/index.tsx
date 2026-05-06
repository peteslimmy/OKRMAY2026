import React, { useState, useEffect, useMemo } from 'react';
import { Goal, Task, TaskStatus } from '../../types';
import { logAudit, getCurrentWeekNumber, calculateGoalScore } from '../../utils';
import { supabase } from '../../lib/supabase';
import { IntegrityHeader } from './IntegrityHeader';
import { ConfigTab } from './ConfigTab';
import { AuditTab, HistoryTab } from './AuditTabs';
import { ReversionModal } from './ReversionModal';
import { Search, SlidersHorizontal, Loader2, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const IntegrityChecker: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'audit' | 'config' | 'history'>(() => {
    return (localStorage.getItem('4core_integrity_tab') as any) || 'audit';
  });

  const [penaltyConfig, setPenaltyConfig] = useState<number>(5);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const [revertingTask, setRevertingTask] = useState<{ goal: Goal, task: Task } | null>(null);
  const [selectedTasks, setSelectedTasks] = useState<{ goal: Goal, task: Task }[]>([]);
  const [isBulkRevertMode, setIsBulkRevertMode] = useState(false);

  const [applyPenalty, setApplyPenalty] = useState(true);
  const [waiveReason, setWaiveReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    localStorage.setItem('4core_integrity_tab', activeTab);
  }, [activeTab]);

  useEffect(() => {
    const savedPenalty = localStorage.getItem('integrity_penalty_pct');
    if (savedPenalty) setPenaltyConfig(parseInt(savedPenalty));

    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchCloudHistory(), fetchActiveGoals()]);
      setLoading(false);
    };
    loadData();
  }, []);

  const fetchCloudHistory = async () => {
    const { data } = await supabase
      .from('audit_logs')
      .select('*')
      .eq('action', 'INTEGRITY_ADJUSTMENT')
      .order('timestamp', { ascending: false });
    if (data) setHistory(data);
  };

  const fetchActiveGoals = async () => {
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
      setGoals(parsed);
    } catch (e) {
      console.error("Governance fetch error:", e);
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
      const tasksByGoal = tasksToRevert.reduce((acc, item) => {
        if (!acc[item.goal.id]) acc[item.goal.id] = [];
        acc[item.goal.id].push(item.task.id);
        return acc;
      }, {} as Record<string, string[]>);

      for (const [goalId, taskIds] of Object.entries(tasksByGoal)) {
        const castedTaskIds = taskIds as string[];
        const goal = goals.find(a => a.id === goalId);
        if (!goal) continue;

        const updatedTasks = goal.tasks.map(t =>
          castedTaskIds.includes(t.id) ? { ...t, status: TaskStatus.NotDone } : t
        );

        let newScore = calculateGoalScore(updatedTasks);

        if (shouldApply) {
          newScore = Math.max(0, newScore - (penaltyConfig * castedTaskIds.length));
        }

        const { error } = await supabase.from('activities').update({
          tasks: JSON.stringify(updatedTasks),
          score: newScore
        }).eq('id', goalId);

        if (error) throw error;
      }

      await logAudit('INTEGRITY_ADJUSTMENT', `BULK REVERSION: ${tasksToRevert.length} nodes reverted to Not Done.`, {
        penaltyApplied: shouldApply,
        penaltyValue: shouldApply ? penaltyConfig : 0,
        reason: waiveReason || 'Standard displicinary protocol applied.',
        count: tasksToRevert.length
      });

      await fetchActiveGoals();
      await fetchCloudHistory();
      setRevertingTask(null);
      setSelectedTasks([]);
      setIsBulkRevertMode(false);
      setWaiveReason('');
      setApplyPenalty(true);
    } catch (e) {
      console.error(e);
      alert("Cloud Sync Error during integrity adjustment.");
    } finally {
      setSubmitting(false);
    }
  };

  const toggleTaskSelection = (goal: Goal, task: Task) => {
    const exists = selectedTasks.find(t => t.task.id === task.id);
    if (exists) {
      setSelectedTasks(selectedTasks.filter(t => t.task.id !== task.id));
    } else {
      setSelectedTasks([...selectedTasks, { goal, task }]);
    }
  };

  const handleSelectAll = (select: boolean) => {
    if (select) {
      const allDone = filteredGoals.flatMap(a => a.tasks.filter(t => t.status === TaskStatus.Done).map(t => ({ goal: a, task: t })));
      setSelectedTasks(allDone);
    } else {
      setSelectedTasks([]);
    }
  };

  const handleBulkRevert = () => {
    if (selectedTasks.length > 0) {
      setIsBulkRevertMode(true);
      // Use the first one for context but modal handles count
      setRevertingTask({ goal: selectedTasks[0].goal, task: selectedTasks[0].task });
    }
  };

  const filteredGoals = useMemo(() => {
    if (!searchTerm.trim()) return goals;
    const term = searchTerm.toLowerCase();
    return goals.map(g => ({
      ...g,
      tasks: g.tasks.filter(t => t.title.toLowerCase().includes(term) || g.title.toLowerCase().includes(term))
    })).filter(g => g.tasks.length > 0);
  }, [goals, searchTerm]);

  const handleCancelRevert = () => {
    setRevertingTask(null);
    setIsBulkRevertMode(false);
    setWaiveReason('');
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-6">
        <div className="relative">
          <div className="w-20 h-20 border-4 border-slate-100 border-t-primary-600 rounded-full animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <ShieldCheck className="text-primary-600 animate-pulse" size={24} />
          </div>
        </div>
        <div className="flex flex-col items-center gap-1">
          <p className="text-sm font-black text-slate-900 uppercase tracking-[0.3em]">Governance Protocol Init</p>
          <p className="text-xs text-slate-400 font-medium">Synchronizing cryptographic audit trails...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1400px] mx-auto space-y-10 animate-fade-in pb-20">
      <IntegrityHeader activeTab={activeTab} onTabChange={setActiveTab} />

      <div className="space-y-8">
        {activeTab === 'audit' && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
               <div className="relative flex-1 max-w-md group">
                 <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-500 transition-colors" size={18} />
                 <input 
                   type="text"
                   placeholder="Search tactical nodes or governance objectives..."
                   value={searchTerm}
                   onChange={(e) => setSearchTerm(e.target.value)}
                   className="w-full pl-14 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold placeholder:text-slate-400 focus:bg-white focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all outline-none"
                 />
               </div>
               
               <div className="flex items-center gap-4 text-[10px] font-black text-slate-400 uppercase tracking-widest px-4 py-2 border-l border-slate-100">
                 <SlidersHorizontal size={16} className="text-slate-300" />
                 <span>Filtering 24 Active Protocols</span>
               </div>
            </div>

            <AuditTab
              filteredGoals={filteredGoals}
              selectedTasks={selectedTasks}
              onToggleTaskSelection={toggleTaskSelection}
              onSelectAll={handleSelectAll}
              onRevertSingle={(a, t) => {
                setIsBulkRevertMode(false);
                setRevertingTask({ goal: a, task: t });
              }}
              onBulkRevert={handleBulkRevert}
            />
          </motion.div>
        )}

        {activeTab === 'config' && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <ConfigTab
              penaltyConfig={penaltyConfig}
              onPenaltyChange={setPenaltyConfig}
              onSave={saveConfig}
            />
          </motion.div>
        )}

        {activeTab === 'history' && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <HistoryTab history={history} />
          </motion.div>
        )}
      </div>

      <AnimatePresence>
        {(revertingTask || isBulkRevertMode) && (
          <ReversionModal
            isBulkMode={isBulkRevertMode}
            selectedCount={selectedTasks.length}
            taskTitle={revertingTask?.task.title}
            applyPenalty={applyPenalty}
            penaltyConfig={penaltyConfig}
            waiveReason={waiveReason}
            submitting={submitting}
            onApplyPenaltyChange={setApplyPenalty}
            onWaiveReasonChange={setWaiveReason}
            onConfirm={() => handleReversionConfirm(applyPenalty)}
            onCancel={handleCancelRevert}
          />
        )}
      </AnimatePresence>
    </div>
  );
};