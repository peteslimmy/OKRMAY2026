import { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, Save, ChevronDown, ChevronRight, Calendar, Target, Layers, CheckCircle, Info } from 'lucide-react';
import { QuarterlyOKRService, YearlyThemeWithQuarters, QuarterlyObjectiveWithKRs } from '@/services/quarterlyOKRService';
import { YearlyTheme, QuarterlyObjective, KeyResult, SubKR, QuarterType } from '@/types';
import { useAuth } from '@/hooks/useAuth';
import { motion, AnimatePresence } from 'framer-motion';

const QUARTERS: QuarterType[] = [QuarterType.Q1, QuarterType.Q2, QuarterType.Q3, QuarterType.Q4];
const KR_SLOTS: Array<'KR1' | 'KR2' | 'KR3' | 'KR4'> = ['KR1', 'KR2', 'KR3', 'KR4'];

interface FormSectionProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  defaultExpanded?: boolean;
}

const FormSection: React.FC<FormSectionProps> = ({ title, icon, children, defaultExpanded = true }) => {
  const [expanded, setExpanded] = useState(defaultExpanded);

  return (
    <div className="border border-slate-200 rounded-2xl bg-white overflow-hidden shadow-sm transition-all hover:border-slate-300">
      <div
        className="flex items-center justify-between p-5 bg-slate-50/50 cursor-pointer hover:bg-slate-50 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-4">
          <div className="p-2 bg-white rounded-lg shadow-sm text-primary-600">
            {icon}
          </div>
          <h3 className="font-black text-slate-900 uppercase tracking-widest text-xs">{title}</h3>
        </div>
        <div className={`p-1 rounded-lg transition-transform duration-300 ${expanded ? 'rotate-180 bg-slate-100' : ''}`}>
           <ChevronDown className="w-5 h-5 text-slate-400" />
        </div>
      </div>
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
          >
            <div className="p-6 border-t border-slate-100 bg-white">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

interface YearlyThemeFormProps {
  theme: YearlyTheme | null;
  onSave: (theme: Omit<YearlyTheme, 'id' | 'created_at' | 'updated_at'>) => void;
  onCancel: () => void;
}

const YearlyThemeForm: React.FC<YearlyThemeFormProps> = ({ theme, onSave, onCancel }) => {
  const [year, setYear] = useState(theme?.year || new Date().getFullYear());
  const [title, setTitle] = useState(theme?.title || '');
  const [description, setDescription] = useState(theme?.description || '');
  const [isActive, setIsActive] = useState(theme?.is_active || false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      year,
      title,
      description,
      is_active: isActive,
      created_by: '',
      updated_by: ''
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Target Fiscal Year</label>
          <select
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 outline-none focus:ring-2 focus:ring-primary-500/20 transition-all"
          >
            {[2025, 2026, 2027, 2028].map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>
        <div className="flex items-end pb-1">
          <label className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer hover:bg-primary-50/50 transition-all w-full">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="w-5 h-5 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
            />
            <span className="text-xs font-black text-slate-700 uppercase tracking-wider">Set as Primary Active Theme</span>
          </label>
        </div>
      </div>
      <div>
        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Strategic Theme Title</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          placeholder="e.g., Accelerating Growth Through Digital Transformation"
          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 outline-none focus:ring-2 focus:ring-primary-500/20 transition-all placeholder:text-slate-300"
        />
      </div>
      <div>
        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Operational Context</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          placeholder="Describe the strategic focus for this year..."
          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 outline-none focus:ring-2 focus:ring-primary-500/20 transition-all placeholder:text-slate-300"
        />
      </div>
      <div className="flex gap-3 justify-end pt-4">
        <button type="button" onClick={onCancel} className="px-6 py-3 text-xs font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-all">
          Abort
        </button>
        <button type="submit" className="px-8 py-3 bg-primary-600 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-primary-500/20 hover:bg-primary-700 active:scale-95 transition-all flex items-center gap-2">
          <Save className="w-4 h-4" />
          Synchronize Theme
        </button>
      </div>
    </form>
  );
};

interface QuarterlyObjectiveFormProps {
  objective: QuarterlyObjective | null;
  yearlyThemeId: string;
  onSave: (obj: Omit<QuarterlyObjective, 'id' | 'created_at' | 'updated_at'>) => void;
  onCancel: () => void;
}

const QuarterlyObjectiveForm: React.FC<QuarterlyObjectiveFormProps> = ({ objective, yearlyThemeId, onSave, onCancel }) => {
  const [quarter, setQuarter] = useState<QuarterType>(objective?.quarter || QuarterType.Q1);
  const [title, setTitle] = useState(objective?.title || '');
  const [description, setDescription] = useState(objective?.description || '');
  const [status, setStatus] = useState<'Draft' | 'Active' | 'Locked'>(objective?.status || 'Draft');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const year = new Date().getFullYear();
    onSave({
      yearly_theme_id: yearlyThemeId,
      quarter,
      year,
      title,
      description,
      status,
      progress: objective?.progress || 0,
      created_by: '',
      updated_by: ''
    });
  };

  return (
    <div className="bg-slate-50/50 p-6 rounded-2xl border border-slate-200 mb-6 animate-fade-in">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Fiscal Quarter</label>
            <select
              value={quarter}
              onChange={(e) => setQuarter(e.target.value as QuarterType)}
              className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-900 outline-none focus:ring-2 focus:ring-primary-500/20 transition-all"
            >
              {QUARTERS.map(q => (
                <option key={q} value={q}>{q}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Governance Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as 'Draft' | 'Active' | 'Locked')}
              className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-900 outline-none focus:ring-2 focus:ring-primary-500/20 transition-all"
            >
              <option value="Draft">Draft Mode</option>
              <option value="Active">Operational / Active</option>
              <option value="Locked">Locked / Immutable</option>
            </select>
          </div>
        </div>
        <div>
          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Objective Mission</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            placeholder="e.g., Launch new product line achieving market fit"
            className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-900 outline-none focus:ring-2 focus:ring-primary-500/20 transition-all"
          />
        </div>
        <div>
          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Mission Parameters</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            placeholder="Describe the objective mission..."
            className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-900 outline-none focus:ring-2 focus:ring-primary-500/20 transition-all"
          />
        </div>
        <div className="flex gap-3 justify-end">
          <button type="button" onClick={onCancel} className="px-6 py-3 text-xs font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-all">
            Cancel
          </button>
          <button type="submit" className="px-8 py-3 bg-primary-600 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-primary-500/20 hover:bg-primary-700 active:scale-95 transition-all flex items-center gap-2">
            <Save className="w-4 h-4" />
            Commit Objective
          </button>
        </div>
      </form>
    </div>
  );
};

interface KeyResultFormProps {
  kr: KeyResult | null;
  objectiveId: string;
  onSave: (kr: Omit<KeyResult, 'id' | 'created_at' | 'updated_at' | 'version'>) => void;
  onCancel: () => void;
  existingSlots: string[];
}

const KeyResultForm: React.FC<KeyResultFormProps> = ({ kr, objectiveId, onSave, onCancel, existingSlots }) => {
  const [krSlot, setKrSlot] = useState<string>(kr?.kr_slot || 'KR1');
  const [title, setTitle] = useState(kr?.title || '');
  const [description, setDescription] = useState(kr?.description || '');
  const [progress, setProgress] = useState(kr?.progress || 0);
  const [status, setStatus] = useState<'Green' | 'Amber' | 'Red'>(kr?.status || 'Red');

  const availableSlots = KR_SLOTS.filter(slot => !existingSlots.includes(slot) || slot === kr?.kr_slot);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      objective_id: objectiveId,
      kr_slot: krSlot as 'KR1' | 'KR2' | 'KR3' | 'KR4',
      title,
      description,
      progress,
      status
    });
  };

  return (
    <div className="bg-white p-6 rounded-2xl border border-primary-100 shadow-lg shadow-primary-500/5 mb-4 animate-slide-up">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Alignment Slot</label>
            <select
              value={krSlot}
              onChange={(e) => setKrSlot(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 outline-none focus:ring-2 focus:ring-primary-500/20 transition-all"
            >
              {availableSlots.map(slot => (
                <option key={slot} value={slot}>{slot}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">KPI Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as 'Green' | 'Amber' | 'Red')}
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 outline-none focus:ring-2 focus:ring-primary-500/20 transition-all"
            >
              <option value="Green">Green / On Track</option>
              <option value="Amber">Amber / At Risk</option>
              <option value="Red">Red / Critical</option>
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Manual Progress %</label>
            <input
              type="number"
              min="0"
              max="100"
              value={progress}
              onChange={(e) => setProgress(Number(e.target.value))}
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 outline-none focus:ring-2 focus:ring-primary-500/20 transition-all"
            />
          </div>
        </div>
        <div>
          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Key Result Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            placeholder="Define the measurable outcome..."
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 outline-none focus:ring-2 focus:ring-primary-500/20 transition-all"
          />
        </div>
        <div className="flex gap-2 justify-end">
          <button type="button" onClick={onCancel} className="px-4 py-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-all">
            Abort
          </button>
          <button type="submit" className="px-6 py-2.5 bg-primary-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-primary-500/20 hover:bg-primary-700 active:scale-95 transition-all flex items-center gap-1.5">
            <Save className="w-3.5 h-3.5" />
            Sync KR
          </button>
        </div>
      </form>
    </div>
  );
};

interface SubKRFormProps {
  subKR: SubKR | null;
  krId: string;
  onSave: (subKR: Omit<SubKR, 'id' | 'created_at' | 'updated_at'>) => void;
  onCancel: () => void;
}

const SubKRForm: React.FC<SubKRFormProps> = ({ subKR, krId, onSave, onCancel }) => {
  const [title, setTitle] = useState(subKR?.title || '');
  const [progress, setProgress] = useState(subKR?.progress || 0);
  const [weight, setWeight] = useState(subKR?.weight || 1);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ kr_id: krId, title, progress, weight });
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-4 animate-fade-in">
      <div>
        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Milestone Track Title</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          placeholder="Sub-KR title..."
          className="w-full px-3 py-2 bg-slate-50 border border-slate-100 rounded-lg text-sm font-bold text-slate-900 outline-none focus:ring-2 focus:ring-primary-500/20"
        />
      </div>
      <div className="flex flex-col sm:flex-row gap-4 items-end">
        <div className="flex-1 w-full">
          <div className="flex justify-between items-center mb-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Velocity</label>
            <span className="text-xs font-black text-primary-600">{progress}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={progress}
            onChange={(e) => setProgress(Number(e.target.value))}
            className="w-full accent-primary-600 h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer"
          />
        </div>
        <div className="w-full sm:w-24">
          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Impact Weight</label>
          <input
            type="number"
            min="0.1"
            max="10"
            step="0.1"
            value={weight}
            onChange={(e) => setWeight(Number(e.target.value))}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-100 rounded-lg text-sm font-bold text-slate-900"
          />
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={onCancel} className="p-2.5 text-slate-400 hover:text-slate-600 transition-all">
            <Trash2 size={18} />
          </button>
          <button type="submit" className="px-5 py-2.5 bg-slate-900 text-white rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all">
            Add
          </button>
        </div>
      </div>
    </form>
  );
};

interface QuarterlyObjectiveEditorProps {
  yearlyThemeId: string;
  objectives: QuarterlyObjectiveWithKRs[];
  onUpdate: () => void;
}

const QuarterlyObjectiveEditor: React.FC<QuarterlyObjectiveEditorProps> = ({ yearlyThemeId, objectives, onUpdate }) => {
  const service = new QuarterlyOKRService();
  const [expandedQuarters, setExpandedQuarters] = useState<Set<string>>(new Set());
  const [editingObjective, setEditingObjective] = useState<string | null>(null);
  const [editingKR, setEditingKR] = useState<string | null>(null);
  const [addingSubKR, setAddingSubKR] = useState<string | null>(null);

  const toggleQuarter = (quarter: string) => {
    const newExpanded = new Set(expandedQuarters);
    if (newExpanded.has(quarter)) {
      newExpanded.delete(quarter);
    } else {
      newExpanded.add(quarter);
    }
    setExpandedQuarters(newExpanded);
  };

  const getObjectiveForQuarter = (quarter: QuarterType) =>
    objectives.find(o => o.quarter === quarter);

  const handleSaveObjective = async (quarter: QuarterType, data: Omit<QuarterlyObjective, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const existing = getObjectiveForQuarter(quarter);
      if (existing) {
        await service.updateQuarterlyObjective(existing.id, data);
      } else {
        await service.createQuarterlyObjective(data);
      }
      setEditingObjective(null);
      onUpdate();
    } catch (error) {
      console.error('Failed to save objective:', error);
    }
  };

  const handleSaveKR = async (objectiveId: string, data: Omit<KeyResult, 'id' | 'created_at' | 'updated_at' | 'version'>) => {
    try {
      const objective = objectives.find(o => o.id === objectiveId);
      const existingKR = objective?.keyResults.find(kr => kr.kr_slot === data.kr_slot);
      if (existingKR) {
        await service.updateKeyResult(existingKR.id, data);
      } else {
        await service.createKeyResult(data);
      }
      setEditingKR(null);
      onUpdate();
    } catch (error) {
      console.error('Failed to save KR:', error);
    }
  };

  const handleSaveSubKR = async (krId: string, data: Omit<SubKR, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      await service.createSubKR(data);
      setAddingSubKR(null);
      onUpdate();
    } catch (error) {
      console.error('Failed to save Sub-KR:', error);
    }
  };

  const handleDeleteSubKR = async (id: string) => {
    try {
      await service.deleteSubKR(id);
      onUpdate();
    } catch (error) {
      console.error('Failed to delete Sub-KR:', error);
    }
  };

  const handleDeleteKR = async (id: string) => {
    if (!confirm("Are you sure you want to delete this Key Result? This action cannot be undone.")) return;
    try {
      await service.deleteKeyResult(id);
      onUpdate();
    } catch (error) {
      console.error('Failed to delete KR:', error);
    }
  };

  return (
    <div className="space-y-4">
      {QUARTERS.map(quarter => {
        const objective = getObjectiveForQuarter(quarter);
        const isExpanded = expandedQuarters.has(quarter);

        return (
          <div key={quarter} className="border border-slate-200 rounded-2xl bg-white overflow-hidden transition-all hover:border-slate-300">
            <div
              className="flex items-center justify-between p-5 bg-slate-50/30 cursor-pointer hover:bg-slate-50 transition-colors"
              onClick={() => toggleQuarter(quarter)}
            >
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl bg-white border border-slate-100 shadow-sm flex items-center justify-center transition-transform duration-300 ${isExpanded ? 'rotate-0' : '-rotate-90'}`}>
                  <ChevronDown className={`w-5 h-5 ${objective ? 'text-primary-600' : 'text-slate-300'}`} />
                </div>
                <div>
                  <span className="font-black text-lg text-slate-900 tracking-tight">{quarter}</span>
                  {objective && (
                    <span className="text-xs font-bold text-slate-400 block -mt-1">{objective.title}</span>
                  )}
                </div>
              </div>
              {objective && (
                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${
                    objective.status === 'Active' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                    objective.status === 'Locked' ? 'bg-slate-100 text-slate-500 border border-slate-200' :
                    'bg-orange-50 text-orange-600 border border-orange-100'
                  }`}>
                    {objective.status}
                  </span>
                </div>
              )}
            </div>

            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                >
                  <div className="p-6 border-t border-slate-100 space-y-6">
                    {!objective || editingObjective === quarter ? (
                      <QuarterlyObjectiveForm
                        objective={objective || null}
                        yearlyThemeId={yearlyThemeId}
                        onSave={(data) => handleSaveObjective(quarter, data)}
                        onCancel={() => setEditingObjective(null)}
                      />
                    ) : (
                      <div className="space-y-6">
                        <div className="flex items-center justify-between bg-slate-50 p-4 rounded-xl border border-slate-200">
                           <div className="flex items-center gap-3">
                              <Info size={16} className="text-slate-400" />
                              <p className="text-xs font-medium text-slate-600">You are editing the objective for {quarter}. Commit changes to sync.</p>
                           </div>
                           <button
                             onClick={() => setEditingObjective(quarter)}
                             className="px-4 py-2 bg-white text-slate-900 rounded-lg text-[10px] font-black uppercase tracking-widest border border-slate-200 shadow-sm hover:bg-slate-50 transition-all flex items-center gap-2"
                           >
                             <Edit2 className="w-3 h-3" />
                             Modify Mission
                           </button>
                        </div>

                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Layers size={14} className="text-primary-600" />
                              <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Key Results Architecture</span>
                            </div>
                            {objective && editingKR !== quarter && (
                              <button
                                onClick={() => setEditingKR(quarter)}
                                className="px-4 py-1.5 bg-primary-600 text-white rounded-lg text-[10px] font-black uppercase tracking-widest shadow-lg shadow-primary-500/20 hover:bg-primary-700 transition-all flex items-center gap-1.5"
                              >
                                <Plus className="w-3.5 h-3.5" />
                                Add KR Node
                              </button>
                            )}
                          </div>

                          {editingKR === quarter && objective && (
                            <KeyResultForm
                              kr={null}
                              objectiveId={objective.id}
                              onSave={(data) => handleSaveKR(objective.id, data)}
                              onCancel={() => setEditingKR(null)}
                              existingSlots={objective.keyResults.map(kr => kr.kr_slot)}
                            />
                          )}

                          <div className="grid grid-cols-1 gap-4">
                            {objective?.keyResults.map(kr => (
                              <div key={kr.id} className="border border-slate-200 rounded-2xl p-5 bg-white shadow-sm hover:border-primary-200 transition-all group">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                                  <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-primary-50 rounded-xl flex items-center justify-center text-primary-600 font-black text-xs shadow-sm">
                                      {kr.kr_slot}
                                    </div>
                                    <div>
                                      <h4 className="font-black text-slate-900 tracking-tight">{kr.title}</h4>
                                      <div className="flex items-center gap-2 mt-1">
                                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider ${
                                          kr.status === 'Green' ? 'bg-emerald-50 text-emerald-600' :
                                          kr.status === 'Amber' ? 'bg-orange-50 text-orange-600' :
                                          'bg-rose-50 text-rose-600'
                                        }`}>
                                          {kr.status}
                                        </span>
                                        <span className="text-[10px] font-bold text-slate-400">{kr.progress}% Velocity</span>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                     <button 
                                      onClick={() => handleDeleteKR(kr.id)}
                                      className="p-2 text-slate-400 hover:text-rose-500 transition-colors"
                                     >
                                        <Trash2 size={16} />
                                     </button>
                                  </div>
                                </div>

                                <div className="ml-0 sm:ml-16 space-y-3">
                                  <div className="flex items-center justify-between border-b border-slate-50 pb-2">
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Sub-KR Tracks ({kr.subKRs.length})</span>
                                    <button
                                      onClick={() => setAddingSubKR(kr.id)}
                                      className="text-[10px] font-black text-primary-600 uppercase tracking-widest flex items-center gap-1.5 hover:text-primary-700 transition-all"
                                    >
                                      <Plus className="w-3.5 h-3.5" />
                                      Deploy Track
                                    </button>
                                  </div>

                                  {addingSubKR === kr.id && (
                                    <SubKRForm
                                      subKR={null}
                                      krId={kr.id}
                                      onSave={(data) => handleSaveSubKR(kr.id, data)}
                                      onCancel={() => setAddingSubKR(null)}
                                    />
                                  )}

                                  <div className="grid grid-cols-1 gap-2">
                                    {kr.subKRs.map((subKR, idx) => (
                                      <div key={subKR.id} className="flex items-center justify-between bg-slate-50/50 p-3 rounded-xl border border-slate-100 group/sub">
                                        <div className="flex items-center gap-3">
                                          <span className="text-[10px] font-black text-slate-300 font-mono">{idx + 1}</span>
                                          <span className="text-sm font-semibold text-slate-700">{subKR.title}</span>
                                        </div>
                                        <div className="flex items-center gap-4">
                                          <div className="flex items-center gap-2">
                                            <span className="text-[10px] font-black text-slate-400 uppercase">W:{subKR.weight}</span>
                                            <span className={`text-[10px] font-black px-2 py-0.5 rounded-md ${
                                              subKR.progress >= 75 ? 'bg-emerald-100 text-emerald-700' :
                                              subKR.progress >= 50 ? 'bg-orange-100 text-orange-700' :
                                              'bg-rose-100 text-rose-700'
                                            }`}>
                                              {subKR.progress}%
                                            </span>
                                          </div>
                                          <button
                                            onClick={() => handleDeleteSubKR(subKR.id)}
                                            className="text-slate-300 hover:text-rose-500 opacity-0 group-hover/sub:opacity-100 transition-all"
                                          >
                                            <Trash2 className="w-3.5 h-3.5" />
                                          </button>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>

                          {(!objective || objective.keyResults.length === 0) && !editingKR && (
                            <div className="text-center py-12 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                               <TrendingUp size={32} className="text-slate-200 mx-auto mb-3" />
                               <p className="text-xs font-black text-slate-400 uppercase tracking-widest">No Strategic Nodes Defined</p>
                               <p className="text-[10px] text-slate-400 mt-1">Start by adding a Key Result to this objective.</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
};

export const QuarterlyOKREditor: React.FC = () => {
  const { currentUser } = useAuth();
  const service = new QuarterlyOKRService();
  const [theme, setTheme] = useState<YearlyThemeWithQuarters | null>(null);
  const [loading, setLoading] = useState(true);
  const [editingTheme, setEditingTheme] = useState(false);
  const [showThemeForm, setShowThemeForm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedYear, setSelectedYear] = useState<number>(2025);

  useEffect(() => {
    loadTheme();
  }, [selectedYear]);

  const loadTheme = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await service.getYearlyThemeByYear(selectedYear);
      setTheme(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveTheme = async (themeData: Omit<YearlyTheme, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      if (theme) {
        await service.updateYearlyTheme(theme.id, themeData);
      } else {
        const newTheme = await service.createYearlyTheme(themeData);
        if (themeData.is_active) {
          await service.setActiveYearlyTheme(newTheme.id);
        }
      }
      setShowThemeForm(false);
      setEditingTheme(false);
      loadTheme();
    } catch (error) {
      console.error('Failed to save theme:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 space-y-4">
        <div className="w-12 h-12 border-4 border-primary-100 border-t-primary-600 rounded-full animate-spin"></div>
        <p className="text-xs font-black text-slate-400 uppercase tracking-widest animate-pulse">Accessing Core Strategy...</p>
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
             <div className="p-2 bg-primary-50 rounded-xl">
                <Target size={24} className="text-primary-600" />
             </div>
             <h2 className="text-3xl font-black text-slate-900 tracking-tight">Strategic OKR Editor</h2>
          </div>
          <p className="text-slate-500 font-medium">Define high-level yearly themes and cascade into quarterly objectives.</p>
        </div>
        
        <div className="flex items-center gap-3 bg-white p-2 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs font-black text-slate-400 uppercase tracking-widest pl-2">Timeline</span>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-sm font-black text-slate-900 outline-none focus:ring-2 focus:ring-primary-500/20 transition-all"
          >
            {[2025, 2026, 2027].map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>
      </div>

      {error && (
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-5 text-rose-700 flex items-center gap-4">
          <AlertCircle className="shrink-0" />
          <p className="text-sm font-bold">{error}</p>
        </div>
      )}

      <FormSection
        title="Yearly Strategic Theme"
        icon={<Calendar className="w-5 h-5" />}
        defaultExpanded={true}
      >
        {showThemeForm || editingTheme || !theme ? (
          <YearlyThemeForm
            theme={theme}
            onSave={handleSaveTheme}
            onCancel={() => {
              setShowThemeForm(false);
              setEditingTheme(false);
            }}
          />
        ) : (
          <div className="space-y-6">
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-primary-600 to-orange-400 rounded-2xl blur opacity-5 group-hover:opacity-10 transition duration-1000"></div>
              <div className="relative bg-slate-50/50 p-6 rounded-2xl border border-slate-200 flex flex-col lg:flex-row lg:items-start justify-between gap-6">
                <div className="flex-1 space-y-4">
                  <div className="flex items-center gap-3">
                    <span className="px-3 py-1 bg-slate-900 text-white text-[10px] font-black rounded-lg uppercase tracking-widest">
                      {theme.year} ANNUAL THEME
                    </span>
                    {theme.is_active && (
                      <span className="px-3 py-1 bg-emerald-50 text-emerald-700 text-[10px] font-black rounded-lg uppercase tracking-widest border border-emerald-100">
                        Primary Nexus
                      </span>
                    )}
                  </div>
                  <h3 className="text-2xl font-black text-slate-900 tracking-tight">{theme.title}</h3>
                  <p className="text-slate-600 font-medium text-sm leading-relaxed max-w-2xl">{theme.description}</p>
                </div>
                <div className="flex flex-row lg:flex-col gap-2 min-w-[140px]">
                  <button
                    onClick={() => setEditingTheme(true)}
                    className="flex-1 px-4 py-2.5 bg-white text-slate-900 rounded-xl text-[10px] font-black uppercase tracking-widest border border-slate-200 shadow-sm hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    Edit
                  </button>
                  <button
                    onClick={async () => {
                      await service.setActiveYearlyTheme(theme.id);
                      loadTheme();
                    }}
                    className="flex-1 px-4 py-2.5 bg-white text-emerald-600 rounded-xl text-[10px] font-black uppercase tracking-widest border border-emerald-100 shadow-sm hover:bg-emerald-50 transition-all flex items-center justify-center gap-2"
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    Set Active
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </FormSection>

      {theme && (
        <FormSection
          title="Quarterly Objectives, KRs, and Sub-KRs"
          icon={<Target className="w-5 h-5" />}
          defaultExpanded={true}
        >
          <QuarterlyObjectiveEditor
            yearlyThemeId={theme.id}
            objectives={theme.quarters}
            onUpdate={loadTheme}
          />
        </FormSection>
      )}

      {!theme && !showThemeForm && (
        <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-slate-200">
          <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <Layers className="w-10 h-10 text-slate-200" />
          </div>
          <h3 className="text-xl font-black text-slate-900 mb-2">No Theme Initialized for {selectedYear}</h3>
          <p className="text-slate-500 font-medium mb-8 max-w-xs mx-auto">Establish a yearly strategic theme to begin cascading objectives across quarters.</p>
          <button
            onClick={() => setShowThemeForm(true)}
            className="px-8 py-4 bg-primary-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl shadow-primary-500/30 hover:bg-primary-700 active:scale-95 transition-all flex items-center gap-3 mx-auto"
          >
            <Plus className="w-5 h-5" />
            Initialize Yearly Theme
          </button>
        </div>
      )}
    </div>
  );
};