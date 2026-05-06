import React from 'react';
import { RotateCcw, AlertTriangle, User, Clock, FileText, CheckCircle2, ChevronRight } from 'lucide-react';
import { Goal, Task, TaskStatus } from '../../types';

interface AuditTabProps {
  filteredGoals: Goal[];
  selectedTasks: { goal: Goal; task: Task }[];
  onToggleTaskSelection: (goal: Goal, task: Task) => void;
  onSelectAll: (select: boolean) => void;
  onRevertSingle: (goal: Goal, task: Task) => void;
  onBulkRevert: () => void;
}

export const AuditTab: React.FC<AuditTabProps> = ({
  filteredGoals,
  selectedTasks,
  onToggleTaskSelection,
  onSelectAll,
  onRevertSingle,
  onBulkRevert,
}) => {
  const allDoneTasks = filteredGoals.flatMap(a => a.tasks.filter(t => t.status === TaskStatus.Done));
  const allDoneCount = allDoneTasks.length;
  const isAllSelected = selectedTasks.length > 0 && selectedTasks.length === allDoneCount;

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/50 overflow-hidden">
        <div className="p-8 lg:p-10 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Status Correction Engine</h2>
            <p className="text-slate-500 font-medium text-sm">Systemically audit and revert inaccurate node completions.</p>
          </div>
          {selectedTasks.length > 0 && (
            <button
              onClick={onBulkRevert}
              className="bg-rose-600 text-white px-10 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-2xl shadow-rose-600/20 hover:bg-rose-700 transition-all active:scale-95 flex items-center gap-3 animate-slide-up"
            >
              <RotateCcw size={16} />
              Revert {selectedTasks.length} Nodes
            </button>
          )}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="pl-10 pr-6 py-6 text-left w-10">
                  <div className="relative flex items-center">
                    <input
                      type="checkbox"
                      checked={isAllSelected}
                      onChange={(e) => onSelectAll(e.target.checked)}
                      className="w-5 h-5 rounded-lg border-slate-300 text-primary-600 focus:ring-primary-500/20 transition-all cursor-pointer"
                    />
                  </div>
                </th>
                <th className="px-6 py-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Tactical Node Identification</th>
                <th className="px-6 py-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Primary Governance Objective</th>
                <th className="pl-6 pr-10 py-6 text-right text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredGoals.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-24 text-center">
                    <div className="flex flex-col items-center gap-4 opacity-30">
                       <CheckCircle2 size={48} className="text-slate-400" />
                       <p className="font-black uppercase tracking-[0.3em] text-xs">No active claims detected</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredGoals.flatMap(goal => goal.tasks.filter(t => t.status === TaskStatus.Done).map(task => (
                  <tr key={task.id} className="group hover:bg-slate-50/50 transition-all">
                    <td className="pl-10 pr-6 py-5">
                      <input
                        type="checkbox"
                        checked={selectedTasks.some(t => t.task.id === task.id)}
                        onChange={() => onToggleTaskSelection(goal, task)}
                        className="w-5 h-5 rounded-lg border-slate-300 text-primary-600 focus:ring-primary-500/20 transition-all cursor-pointer"
                      />
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex flex-col">
                        <span className="font-black text-slate-900 text-sm tracking-tight">{task.title}</span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Node ID: {task.id.slice(0, 8)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-primary-500 rounded-full"></div>
                        <span className="text-xs font-bold text-slate-600">{goal.title}</span>
                      </div>
                    </td>
                    <td className="pl-6 pr-10 py-5 text-right">
                      <button 
                        onClick={() => onRevertSingle(goal, task)} 
                        className="inline-flex items-center gap-2 px-4 py-2 bg-white text-rose-600 border border-rose-100 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-sm hover:bg-rose-50 hover:border-rose-200 transition-all opacity-0 group-hover:opacity-100"
                      >
                        <RotateCcw size={14} />
                        Revert
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
  );
};

interface HistoryTabProps {
  history: any[];
}

export const HistoryTab: React.FC<HistoryTabProps> = ({ history }) => {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/50 overflow-hidden">
        <div className="p-8 lg:p-10 border-b border-slate-100">
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Audit Trail Ledger</h2>
          <p className="text-slate-500 font-medium text-sm">Immutable cryptographic trace of all disciplinary adjustments.</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="pl-10 pr-6 py-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Temporal Stamp</th>
                <th className="px-6 py-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">System Operator</th>
                <th className="px-6 py-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Action Vector</th>
                <th className="pl-6 pr-10 py-6 text-right text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Systemic Impact</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {history.length === 0 ? (
                <tr>
                   <td colSpan={4} className="py-24 text-center">
                    <div className="flex flex-col items-center gap-4 opacity-30">
                       <Clock size={48} className="text-slate-400" />
                       <p className="font-black uppercase tracking-[0.3em] text-xs">No records archived</p>
                    </div>
                  </td>
                </tr>
              ) : (
                history.map(item => (
                  <tr key={item.id} className="hover:bg-slate-50/50 transition-all group">
                    <td className="pl-10 pr-6 py-6">
                      <div className="flex items-center gap-3">
                         <div className="p-2 bg-slate-50 rounded-lg group-hover:bg-white transition-colors">
                           <Clock size={14} className="text-slate-400" />
                         </div>
                         <span className="font-black text-slate-900 text-xs">{new Date(item.timestamp).toLocaleString()}</span>
                      </div>
                    </td>
                    <td className="px-6 py-6">
                      <div className="flex items-center gap-2">
                        <User size={14} className="text-primary-500" />
                        <span className="text-xs font-bold text-slate-700">{item.user_name || 'System Protocol'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-6">
                      <div className="flex flex-col gap-1">
                        <span className="text-xs font-bold text-slate-800 leading-tight">{item.details}</span>
                        {item.metadata?.reason && (
                          <span className="text-[10px] text-slate-400 font-medium italic">Ref: {item.metadata.reason}</span>
                        )}
                      </div>
                    </td>
                    <td className="pl-6 pr-10 py-6 text-right">
                      <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl font-black text-[10px] uppercase tracking-widest ${
                        item.metadata?.penaltyApplied 
                          ? 'bg-rose-50 text-rose-600 border border-rose-100 shadow-sm' 
                          : 'bg-emerald-50 text-emerald-600 border border-emerald-100 shadow-sm'
                      }`}>
                        {item.metadata?.penaltyApplied ? `Disciplinary -${item.metadata.penaltyValue}%` : 'Waived Exception'}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};