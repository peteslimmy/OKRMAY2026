import React, { useState, useEffect } from 'react';
import { X, Sparkles, Plus, LoaderCircle, Trash2, Save, AlertTriangle } from 'lucide-react';
import { Select } from '../ui/Select';
import { RichTextEditor } from '../RichTextEditor';
import { Task, TaskStatus } from '../../types';
import { validateSMARTGoal, SMARTCheck } from '../../validators/smartValidator';

interface ReportFormProps {
  isOpen: boolean;
  onClose: () => void;
  editingGoalId: string | null;
  selectedSubKrtag: string;
  setSelectedSubKrtag: (tag: string) => void;
  availableSubKrtags: string[];
  goalTitle: string;
  setGoalTitle: (title: string) => void;
  goalComments: string;
  setGoalComments: (comments: string) => void;
  tasks: Task[];
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
  currentTaskInput: string;
  setCurrentTaskInput: (input: string) => void;
  onSave: () => void;
  onAddTask: () => void;
  submitting: boolean;
  onVetTitle: () => void;
  isVetting: boolean;
  aiSuggestion: string | null;
  setAiSuggestion: (suggestion: string | null) => void;
}

export const ReportForm: React.FC<ReportFormProps> = ({
  isOpen, onClose, editingGoalId, selectedSubKrtag, setSelectedSubKrtag, availableSubKrtags,
  goalTitle, setGoalTitle, goalComments, setGoalComments,
  tasks, setTasks, currentTaskInput, setCurrentTaskInput, onSave, onAddTask,
  submitting, onVetTitle, isVetting, aiSuggestion, setAiSuggestion
}) => {
  const [smartCheck, setSmartCheck] = useState<SMARTCheck | null>(null);
  const [showLowScoreWarning, setShowLowScoreWarning] = useState(false);

  useEffect(() => {
    if (goalTitle.trim()) {
      const check = validateSMARTGoal(goalTitle);
      setSmartCheck(check);
      setShowLowScoreWarning(check.score < 50);
    } else {
      setSmartCheck(null);
      setShowLowScoreWarning(false);
    }
  }, [goalTitle]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-950/50 backdrop-blur-md p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden max-h-[92vh] flex flex-col">
        <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-white">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
              <Sparkles size={22} />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-xl">{editingGoalId ? 'Edit Goal' : 'New Goal'}</h3>
              <p className="text-xs text-slate-400 font-medium mt-0.5">Weekly reporting cycle</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl transition-all">
            <X size={22} />
          </button>
        </div>
        
<div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
      <div className="space-y-3">
        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">1. Sub-KR Tag</label>
        <Select
          value={selectedSubKrtag}
          onChange={(val) => setSelectedSubKrtag(String(val))}
          options={availableSubKrtags.map(tag => ({ value: tag, label: tag === 'Stressed' ? 'Stressed (No KR alignment)' : tag }))}
          placeholder="Select Sub-KR tag or Stressed..."
          className="w-full"
        />
        <p className="text-xs text-slate-400 mt-1">Tag your goal to a Sub-KR (e.g., KR1.1) or mark as "Stressed" if no KR alignment</p>
      </div>

      <div className="space-y-3">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">2. Goal Title</label>
              <button onClick={onVetTitle} disabled={!goalTitle.trim() || isVetting} className="flex items-center gap-2 text-xs font-semibold text-blue-600 hover:text-blue-700 disabled:opacity-30">
                {isVetting ? <LoaderCircle size={12} className="animate-spin" /> : <Sparkles size={12} />}
                {isVetting ? 'Analyzing...' : 'AI Review'}
              </button>
            </div>
            <input type="text" value={goalTitle} onChange={(e) => setGoalTitle(e.target.value)} placeholder="What did you accomplish this week?" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" />
            {smartCheck && (
              <div className={`mt-3 p-3 rounded-xl border ${smartCheck.score >= 60 ? 'bg-emerald-50 border-emerald-200' : smartCheck.score >= 40 ? 'bg-amber-50 border-amber-200' : 'bg-red-50 border-red-200'}`}>
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-xs font-bold ${smartCheck.score >= 60 ? 'text-emerald-700' : smartCheck.score >= 40 ? 'text-amber-700' : 'text-red-700'}`}>SMART Score: {smartCheck.score}/100</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${smartCheck.passed ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>{smartCheck.passed ? 'PASS' : 'NEEDS IMPROVEMENT'}</span>
                </div>
                {smartCheck.warnings.length > 0 && (
                  <div className="space-y-1">
                    {smartCheck.warnings.map((w, i) => (
                      <div key={i} className="flex items-start gap-2 text-[11px]">
                        <AlertTriangle size={12} className="mt-0.5 flex-shrink-0 text-amber-600" />
                        <span className="text-slate-600">{w}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
            {aiSuggestion && (
              <div className="bg-slate-900 text-white rounded-xl p-4 space-y-3 animate-slide-up">
                <p className="text-xs font-medium leading-relaxed text-slate-300 italic">"{aiSuggestion}"</p>
                <div className="flex gap-2">
                  <button onClick={() => { const rec = aiSuggestion.match(/Recommendation: (.*)/); if (rec) setGoalTitle(rec[1]); setAiSuggestion(null); }} className="px-3 py-2 bg-white text-slate-950 rounded-lg text-xs font-bold hover:bg-blue-500 hover:text-white transition-all">Apply Suggestion</button>
                  <button onClick={() => setAiSuggestion(null)} className="px-3 py-2 border border-white/20 text-white rounded-lg text-xs font-bold hover:bg-white/10">Dismiss</button>
                </div>
              </div>
            )}
          </div>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">3. Tasks</label>
              <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full">{tasks.length} tasks</span>
            </div>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-2">
              {tasks.map((task, idx) => (
                <div key={task.id} className="flex items-center gap-3 p-3 bg-white border border-slate-200 rounded-lg shadow-sm">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500">{idx + 1}</div>
                  <span className="text-sm font-semibold text-slate-700 flex-1">{task.title}</span>
                  <button onClick={() => setTasks(prev => prev.filter(t => t.id !== task.id))} className="text-slate-300 hover:text-red-500 transition-colors p-1">
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
              <div className="flex gap-2 mt-3">
                <input type="text" value={currentTaskInput} onChange={(e) => setCurrentTaskInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && onAddTask()} placeholder="Add a task..." className="flex-1 px-3 py-2.5 bg-white border border-slate-200 rounded-lg text-sm font-semibold outline-none focus:border-blue-400" />
                <button onClick={onAddTask} disabled={!currentTaskInput.trim()} className="px-4 py-2.5 bg-slate-900 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-semibold disabled:opacity-30">
                  <Plus size={18} />
                </button>
              </div>
            </div>
          </div>
          
          <div className="space-y-3">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">4. Additional Context</label>
            <RichTextEditor value={goalComments} onChange={setGoalComments} placeholder="Notes, blockers, or achievements..." />
          </div>
        </div>
        
        <div className="px-6 py-5 border-t border-slate-100 bg-slate-50">
          {showLowScoreWarning && (
            <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-2">
              <AlertTriangle size={16} className="text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-amber-800">Low SMART Score Warning</p>
                <p className="text-[11px] text-amber-700 mt-1">This goal has a low quality score. You can still save, but consider improving it for better governance tracking.</p>
              </div>
            </div>
          )}
          <button onClick={onSave} disabled={submitting || tasks.length === 0 || !goalTitle.trim() || !selectedSubKrtag} className="w-full py-4 bg-slate-900 text-white rounded-xl text-sm font-bold shadow-xl hover:bg-blue-600 transition-all flex items-center justify-center gap-3 disabled:opacity-40">
            {submitting ? <LoaderCircle className="w-5 h-5 animate-spin" /> : <Save size={18} />}
            {editingGoalId ? 'Update Goal' : 'Save Goal'}
          </button>
        </div>
      </div>
    </div>
  );
};
