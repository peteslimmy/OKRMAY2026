import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Sparkles, Trash2, Lock, ShieldCheck, AlertTriangle, ListChecks } from 'lucide-react';
import DOMPurify from 'dompurify';
import { Goal, Task, TaskStatus } from '../../types';
import { generateReportId, calculateGoalScore } from '../../utils';
import { getDeptColor, getDeptAbbr } from './utils';
import { Card, Button } from '../ui';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../lib/utils';

interface GoalCardProps {
  goal: Goal;
  index: number;
  keyResultLabel: string;
  onEdit: (a: Goal) => void;
  onDelete: (id: string) => void;
  onTaskToggle: (goalId: string, taskId: string) => void;
  canModify: boolean;
  isBypassActive: boolean;
  isContentLocked: boolean;
  isPartiallyLocked: boolean;
}

const GoalProgressBar: React.FC<{ score: number, total: number, completed: number }> = ({ score, total, completed }) => {
  const colorClass = score >= 100 ? 'bg-emerald-500' : score >= 50 ? 'bg-blue-500' : 'bg-amber-500';
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 bg-slate-100 h-2 rounded-full overflow-hidden">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          className={`h-full ${colorClass} transition-all duration-500 rounded-full`} 
        />
      </div>
      <span className="text-xs font-bold text-slate-700 min-w-[40px] text-right">{score}%</span>
    </div>
  );
};

export const GoalCard: React.FC<GoalCardProps> = ({
  goal, index, keyResultLabel, onEdit, onDelete, onTaskToggle, canModify, isBypassActive, isContentLocked, isPartiallyLocked
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) setShowMenu(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const taskArray = useMemo(() => {
    if (typeof goal.tasks === 'string') {
      try { return JSON.parse(goal.tasks); } catch { return []; }
    }
    return goal.tasks || [];
  }, [goal.tasks]);

  const completedTasks = taskArray.filter((t: Task) => t.status === TaskStatus.Done).length;
  const totalTasks = taskArray.length;
  const dynamicScore = useMemo(() => calculateGoalScore(taskArray), [taskArray]);
  const effectivelyLocked = isContentLocked && !isBypassActive;
  const effectivelyPartiallyLocked = isPartiallyLocked && !isBypassActive;
  const deptColor = getDeptColor(goal.department || 'Registry');
  const deptAbbr = getDeptAbbr(goal.department || 'Registry');

  return (
    <Card variant="threeD" clickable className="overflow-hidden group">
      <div className="p-5">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center text-xs font-bold shadow-sm" style={{ backgroundColor: deptColor.bg, color: deptColor.text }} title={goal.department}>
              {deptAbbr}
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="inline-flex items-center px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-full text-[10px] font-bold">
                  <ShieldCheck size={10} className="mr-1" />
                  {keyResultLabel} goal {String(index + 1).padStart(2, '0')}
                </span>
                {effectivelyPartiallyLocked && (
                  <span className="inline-flex items-center px-2 py-0.5 bg-amber-50 text-amber-700 rounded-full text-[10px] font-bold">
                    <AlertTriangle size={10} className="mr-1" />
                    Status only
                  </span>
                )}
              </div>
              <span className="text-[9px] font-medium text-slate-400 tracking-wide">
                Week {goal.week} • {generateReportId(goal.department, goal.week, goal.year)}
              </span>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {!effectivelyLocked && canModify && !effectivelyPartiallyLocked ? (
              <div className="relative" ref={menuRef}>
                <button 
                  onClick={() => setShowMenu(!showMenu)} 
                  className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-400 hover:text-slate-600"
                >
                  <div className="flex gap-1">
                    <div className="w-1 h-1 rounded-full bg-current" />
                    <div className="w-1 h-1 rounded-full bg-current" />
                    <div className="w-1 h-1 rounded-full bg-current" />
                  </div>
                </button>
                <AnimatePresence>
                  {showMenu && (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.95, y: -10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: -10 }}
                      className="absolute right-0 mt-2 w-40 bg-white rounded-xl shadow-xl border border-slate-100 py-2 z-50 overflow-hidden"
                    >
                      <button onClick={() => { onEdit(goal); setShowMenu(false); }} className="w-full px-4 py-2 text-left text-xs font-semibold text-slate-600 hover:bg-slate-50 flex items-center gap-3 transition-colors">
                        <Sparkles size={14} /> Edit
                      </button>
                      <button onClick={() => { onDelete(goal.id); setShowMenu(false); }} className="w-full px-4 py-2 text-left text-xs font-semibold text-red-600 hover:bg-red-50 flex items-center gap-3 transition-colors">
                        <Trash2 size={14} /> Delete
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="p-2 text-slate-300"><Lock size={16} /></div>
            )}
          </div>
        </div>
        
        <h3 className="text-sm font-semibold text-slate-800 mb-4 line-clamp-2 leading-snug">{goal.title}</h3>
        
        <div className="mb-5">
          <div className="flex items-center justify-between text-[10px] text-slate-400 mb-2">
            <span>Progress</span>
            <span>{completedTasks}/{totalTasks} tasks</span>
          </div>
          <GoalProgressBar score={dynamicScore} total={totalTasks} completed={completedTasks} />
        </div>
        
        {goal.comments && (
          <div className="bg-slate-50 rounded-xl p-3 mb-5 border border-slate-100">
            <p className="text-xs text-slate-500 line-clamp-2" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(goal.comments) }} />
          </div>
        )}
        
        <div className="border-t border-slate-100 pt-4">
          <div className="flex items-center gap-2 mb-3">
            <ListChecks size={14} className="text-brand-500" />
            <span className="text-[10px] font-bold text-slate-400 tracking-wider">Tasks</span>
          </div>
          <div className="space-y-2">
            {taskArray.length === 0 ? (
              <div className="py-6 text-center border-2 border-dashed border-slate-100 rounded-xl">
                <span className="text-xs font-medium text-slate-300">No tasks defined</span>
              </div>
            ) : (
              taskArray.map((task: Task, taskIdx: number) => {
                const isDone = task.status === TaskStatus.Done;
                const isNotDone = task.status === TaskStatus.NotDone;
                return (
                  <motion.div 
                    key={task.id} 
                    whileHover={!effectivelyLocked ? { x: 4 } : {}}
                    whileTap={!effectivelyLocked ? { scale: 0.98 } : {}}
                    className={cn(
                      "flex items-center justify-between p-2.5 rounded-lg border transition-all duration-200",
                      isDone ? 'bg-emerald-50/50 border-emerald-100' : isNotDone ? 'bg-red-50/50 border-red-100' : 'bg-slate-50 border-slate-100',
                      !effectivelyLocked ? 'cursor-pointer' : 'opacity-60'
                    )}
                    onClick={() => !effectivelyLocked && onTaskToggle(goal.id, task.id)}
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className={cn(
                        "w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-all duration-300",
                        isDone ? 'bg-emerald-500 text-white shadow-sm' : isNotDone ? 'bg-red-500 text-white shadow-sm' : 'bg-slate-200 text-slate-500'
                      )}>
                        {taskIdx + 1}
                      </div>
                      <span className={cn(
                        "text-xs font-medium truncate transition-colors duration-300",
                        isDone ? 'text-emerald-800' : isNotDone ? 'text-red-800' : 'text-slate-600'
                      )}>{task.title}</span>
                    </div>
                    <div className={cn(
                      "ml-3 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider transition-all duration-300",
                      isDone ? 'bg-emerald-100 text-emerald-700' : isNotDone ? 'bg-red-100 text-red-700' : 'bg-slate-200 text-slate-500'
                    )}>
                      {isDone ? 'Done' : isNotDone ? 'Not Done' : 'Undefined'}
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};
