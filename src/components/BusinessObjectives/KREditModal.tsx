import React, { useState, useEffect } from 'react';
import { X, Lock, LoaderCircle, Save, Target, DatabaseZap } from 'lucide-react';
import { KeyResult } from '../../types';
import { generateLocalUUID } from '../../utils';
import { Select } from '../ui/Select';

interface KREditModalProps {
  kr: Partial<KeyResult>;
  existingKRsForQuarter: KeyResult[];
  onSave: (kr: KeyResult) => Promise<void>;
  onClose: () => void;
  canEditContent: boolean;
  canManage: boolean;
}

export const KREditModal: React.FC<KREditModalProps> = ({
  kr,
  existingKRsForQuarter,
  onSave,
  onClose,
  canEditContent,
  canManage,
}) => {
  const isNewKR = !kr.id;
  const [formData, setFormData] = useState<Partial<KeyResult>>(
    isNewKR && !kr.label ? { ...kr, label: kr.parent_kr_id ? getNextSubLabel(kr.parent_kr_id, existingKRsForQuarter) : getNextLabel(existingKRsForQuarter) } : kr
  );
  const [isSaving, setIsSaving] = useState(false);

  function getNextLabel(existingKRs: KeyResult[]) {
    const allSlots = ['KR1', 'KR2', 'KR3', 'KR4'];
    const usedSlots = existingKRs.filter(k => !k.parent_kr_id).map(k => k.label);
    return allSlots.find(s => !usedSlots.includes(s)) || 'KR1';
  }

  function getNextSubLabel(parentId: string, existingKRs: KeyResult[]) {
    const parent = existingKRs.find(k => k.id === parentId);
    if (!parent) return '1.1';
    const prefix = parent.label.replace('KR', '');
    const usedSubSlots = existingKRs.filter(k => k.parent_kr_id === parentId).map(k => k.label.replace(`${prefix}.`, ''));
    const num = ['1', '2', '3', '4'].find(n => !usedSubSlots.includes(n)) || '1';
    return `${prefix}.${num}`;
  }

  const isSubKR = !!formData.parent_kr_id;
  const parentKR = isSubKR ? existingKRsForQuarter.find(k => k.id === formData.parent_kr_id) : null;

  const allSlots = ['KR1', 'KR2', 'KR3', 'KR4'];
  const usedSlots = existingKRsForQuarter.filter(k => !k.parent_kr_id && k.id !== formData.id).map(k => k.label);
  const availableSlots = allSlots;

  const parentPrefix = parentKR?.label || 'KR';
  const allSubSlots = parentKR ? ['1', '2', '3', '4'].map(n => `${parentPrefix}.${n}`) : [];
  const usedSubSlots = existingKRsForQuarter.filter(k => k.parent_kr_id === formData.parent_kr_id && k.id !== formData.id).map(k => k.label);
  const availableSubSlots = isSubKR ? allSubSlots : [];

  useEffect(() => {
    if (!formData.label) {
      if (isSubKR && availableSubSlots.length > 0) setFormData(prev => ({ ...prev, label: availableSubSlots[0] }));
      else if (!isSubKR && availableSlots.length > 0) setFormData(prev => ({ ...prev, label: availableSlots[0] }));
    }
  }, [formData.label, isSubKR, availableSlots, availableSubSlots]);

  const handleSave = async () => {
    if (!canEditContent || isSaving) return;
    const trimmedTitle = formData.title?.trim();
    if (!trimmedTitle || !formData.label) {
      alert("Validation Error: Please complete all required fields. Title: " + trimmedTitle + ", Label: " + formData.label);
      return;
    }
    setIsSaving(true);
    try {
      const saveData = {
        ...formData,
        id: formData.id || generateLocalUUID(),
        title: trimmedTitle,
        description: '',
        parent_kr_id: formData.parent_kr_id || kr.parent_kr_id || null,
        objective_id: formData.objective_id || null,
      };
      await onSave(saveData as KeyResult);
    } catch (error: any) { console.error(error); } finally { setIsSaving(false); }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-scale-in flex flex-col max-h-[95vh] border border-slate-200">
        <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-white">
          <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
            <div className="p-2 bg-primary-50 text-primary-600 rounded-lg">
              {isSubKR ? <Target size={20} /> : <DatabaseZap size={20} />}
            </div>
            <div>
              <div className="text-sm font-bold">{kr.id ? `Update ${kr.label}` : isSubKR ? `Create Sub-KR` : 'Create Strategic KR'}</div>
              <div className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold">Governance Registry</div>
            </div>
            {!canEditContent && (
              <span className="ml-2 px-2 py-0.5 bg-slate-100 text-slate-500 text-[10px] uppercase tracking-wider rounded-full border border-slate-200 flex items-center gap-1">
                <Lock size={10} /> Locked
              </span>
            )}
          </h3>
          <button onClick={onClose} disabled={isSaving} aria-label="Close" title="Close" className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400"><X size={20} /></button>
        </div>
        <div className="p-6 space-y-6 overflow-y-auto bg-slate-50/30">
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Key Result Title</label>
            <input 
              type="text" 
              title="Key Result Title" 
              placeholder="Enter a clear, measurable title..." 
              value={formData.title} 
              onChange={(e) => setFormData({ ...formData, title: e.target.value })} 
              className="w-full p-3 bg-white border border-slate-200 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-primary-500/20 transition-all shadow-sm" 
              disabled={isSaving || !canEditContent} 
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">{isSubKR ? 'Sub-KR Slot' : 'KR Slot'}</label>
              <Select
                label={isSubKR ? 'Sub-KR Slot' : 'KR Slot'}
                value={formData.label || ''}
                onChange={(val) => setFormData({ ...formData, label: String(val) })}
                options={(isSubKR ? availableSubSlots : availableSlots).map(s => ({ value: s, label: s }))}
                placeholder={isSubKR ? "Select Sub-KR Slot..." : "Select KR Slot..."}
                disabled={isSaving || !!formData.id || !canEditContent}
                className="w-full"
              />
            </div>
            {isSubKR && (
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Parent KR</label>
                <div className="p-3 bg-primary-50 border border-primary-100 rounded-xl text-sm font-bold text-primary-700 flex items-center gap-2">
                  <Target size={14} />
                  <span className="truncate">{parentKR?.label}: {parentKR?.title}</span>
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="px-6 py-5 border-t border-slate-100 flex justify-end items-center gap-3 bg-white">
          <button onClick={onClose} disabled={isSaving} className="text-sm font-bold text-slate-500 hover:text-slate-700 px-4 py-2 transition-colors">Cancel</button>
          {canManage ? (
            <button onClick={handleSave} disabled={isSaving} className="px-6 py-2.5 bg-primary-600 text-white rounded-xl text-sm font-bold shadow-lg hover:bg-primary-700 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
              {isSaving ? <LoaderCircle className="w-4 h-4 animate-spin" /> : <Save size={16} />} {isSaving ? 'Saving...' : 'Confirm & Save'}
            </button>
          ) : (
            <div className="text-xs text-red-500 font-bold">No permission to save</div>
          )}
        </div>
      </div>
    </div>
  );

};