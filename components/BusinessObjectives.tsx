
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Target, Plus, Trash2, X, ChevronLeft, ChevronRight, AlertTriangle, LoaderCircle, ShieldCheck, DatabaseZap, Lock, CheckCircle2, RefreshCw, AlertCircle, RefreshCcw, Download, UploadCloud, FileText, Check, TrendingUp, Save } from 'lucide-react';
import { KeyResult, Activity, User } from '../types';
import { logAudit, getSessionUser, getRegistryUsers, getCurrentQuarterInfo, canManageObjectives, generateLocalUUID, getRegistryKeyResults, getWATTime } from '../utils';
import { RichTextEditor } from './RichTextEditor';
import { supabase } from '../supabaseClient';
import { Select } from './ui/Select';

const KREditModal: React.FC<{
  kr: Partial<KeyResult>;
  existingKRsForQuarter: KeyResult[];
  onSave: (kr: KeyResult) => Promise<void>;
  onClose: () => void;
  canEditContent: boolean;
}> = ({ kr, existingKRsForQuarter, onSave, onClose, canEditContent }) => {
  const [formData, setFormData] = useState<Partial<KeyResult>>(kr);
  const [isSaving, setIsSaving] = useState(false);

  const allSlots = ['KR1', 'KR2', 'KR3', 'KR4'];
  const takenSlots = existingKRsForQuarter.map(k => k.label).filter(label => label !== kr.label);
  const availableSlots = allSlots.filter(s => !takenSlots.includes(s));

  const handleSave = async () => {
    if (!canEditContent || isSaving) return;
    const trimmedTitle = formData.title?.trim();
    const trimmedDescription = formData.description?.trim();
    if (!trimmedTitle || !trimmedDescription || !formData.label) {
      alert("Validation Error: Please complete all required strategic fields.");
      return;
    }
    setIsSaving(true);
    try {
      await onSave({
        ...formData,
        id: formData.id || generateLocalUUID(),
        title: trimmedTitle,
        description: trimmedDescription,
      } as KeyResult);
    } catch (error: any) { console.error(error); } finally { setIsSaving(false); }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-white rounded-[4px] shadow-2xl w-full max-w-lg overflow-hidden animate-scale-in flex flex-col max-h-[95vh] border border-slate-100">
        <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-white">
          <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
            {kr.id ? `Edit ${kr.label}` : 'Strategic KR'}
            {!canEditContent && (
              <span className="px-2 py-0.5 bg-slate-100 text-slate-500 text-[10px] uppercase tracking-wider rounded-full border border-slate-200 flex items-center gap-1">
                <Lock size={10} /> Locked
              </span>
            )}
          </h3>
          <button onClick={onClose} disabled={isSaving} className="p-2 hover:bg-slate-50 rounded-full transition-colors text-slate-400"><X size={20} /></button>
        </div>
        <div className="p-6 space-y-6 overflow-y-auto">
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">Key Result Title</label>
            <input type="text" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="w-full p-3 bg-white border border-slate-200 rounded-[4px] text-sm font-medium outline-none focus:ring-2 focus:ring-primary-500/20" disabled={isSaving || !canEditContent} />
          </div>
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">Strategy & Context</label>
            <RichTextEditor value={formData.description || ''} onChange={(val) => setFormData({ ...formData, description: val })} rows={4} readOnly={!canEditContent || isSaving} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">KR Slot</label>
              <Select
                label="KR Slot"
                value={formData.label || ''}
                onChange={(val) => setFormData({ ...formData, label: val as string })}
                options={[
                  ...(formData.id ? [{ value: formData.label, label: formData.label }] : []),
                  ...availableSlots.map(s => ({ value: s, label: s }))
                ]}
                placeholder="Select Slot..."
                disabled={isSaving || !!formData.id || !canEditContent}
                className="w-full"
              />
            </div>
          </div>
        </div>
        <div className="px-6 py-5 border-t border-slate-100 flex justify-end items-center gap-3 bg-slate-50/50">
          <button onClick={onClose} disabled={isSaving} className="text-sm font-semibold text-slate-500 hover:text-slate-700 px-4 py-2">Close</button>
          {canEditContent && (
            <button onClick={handleSave} disabled={isSaving} className="px-6 py-2.5 bg-primary-600 text-white rounded-[4px] text-sm font-bold shadow-md hover:bg-primary-700 flex items-center gap-2">
              {isSaving ? <LoaderCircle className="w-4 h-4 animate-spin" /> : <Save size={16} />} Save Key Result
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export const BusinessObjectives: React.FC<{ selectedYear: number, setSelectedYear: (y: number) => void }> = ({ selectedYear, setSelectedYear }) => {
  const [krs, setKrs] = useState<KeyResult[]>([]);
  const [lockOverrides, setLockOverrides] = useState<KeyResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingKR, setEditingKR] = useState<Partial<KeyResult> | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const canManage = true; // Use real permission check if needed
  const quarters = ['Q1', 'Q2', 'Q3', 'Q4'];
  const currentQuarterInfo = useMemo(() => getCurrentQuarterInfo(), []);

  const fetchKRs = async () => {
    setLoading(true);
    try {
      const allKRs = await getRegistryKeyResults(selectedYear);
      // Separate actual KRs from System Lock KRs
      const actualKRs = allKRs.filter(k => k.label !== 'SYSTEM_LOCK');
      const locks = allKRs.filter(k => k.label === 'SYSTEM_LOCK');

      setKrs(actualKRs);
      setLockOverrides(locks);

      const user = await getSessionUser();
      setCurrentUser(user);
    } catch (err) {
      console.error(err);
    } finally { setLoading(false); }
  };

  const isQuarterLocked = (year: number, quarter: string) => {
    // 1. Check Manual Override
    const override = lockOverrides.find(l => l.year === year && l.quarter === quarter);
    if (override) {
      return override.status === 'Red'; // Red = Locked, Green = Unlocked
    }

    const now = getWATTime();
    const qIndex = parseInt(quarter.replace('Q', '')) - 1;

    // 2. Time-based locking (14 days after start)
    const quarterStartMonth = qIndex * 3;
    const quarterStartDate = new Date(year, quarterStartMonth, 1);
    const lockDate = new Date(quarterStartDate);
    lockDate.setDate(lockDate.getDate() + 14);

    if (now.getTime() > lockDate.getTime()) return true;

    // 3. Future KR Creation Rule
    const currentVal = year * 4 + qIndex;
    const hasFutureKR = krs.some(k => {
      const kQIndex = parseInt(k.quarter.replace('Q', '')) - 1;
      const kVal = k.year * 4 + kQIndex;
      return kVal > currentVal;
    });

    return hasFutureKR;
  };

  const toggleQuarterLock = async (year: number, quarter: string, currentLockedState: boolean) => {
    if (!confirm(`Are you sure you want to manually ${currentLockedState ? 'UNLOCK' : 'LOCK'} ${quarter} ${year}? This will override automatic governance rules.`)) return;

    try {
      const lockId = `LOCK-${year}-${quarter}`;
      const newStatus = currentLockedState ? 'Green' : 'Red'; // Green = Unlocked, Red = Locked

      const lockKR: KeyResult = {
        id: lockId,
        label: 'SYSTEM_LOCK',
        title: 'Manual Lock Override',
        description: 'System generated lock record',
        quarter,
        year,
        owner_id: 'SYSTEM',
        progress: 0,
        status: newStatus
      };

      const { error } = await supabase.from('key_results').upsert([lockKR]);
      if (error) throw error;

      logAudit('UPDATE', `Manual Governance Override: ${quarter} ${year} set to ${currentLockedState ? 'UNLOCKED' : 'LOCKED'}`);
      await fetchKRs();
    } catch (e) {
      alert("Failed to update lock state.");
    }
  };

  useEffect(() => {
    fetchKRs();
    window.addEventListener('4COREUserUpdate', fetchKRs);
    return () => window.removeEventListener('4COREUserUpdate', fetchKRs);
  }, [selectedYear]);

  const handleSaveKR = async (krToSave: KeyResult) => {
    try {
      const { error } = await supabase.from('key_results').upsert([krToSave]);
      if (error) throw error;
      logAudit(krToSave.id ? 'UPDATE' : 'CREATE', `Synced Strategic KR: ${krToSave.label}`);
      await fetchKRs();
      setEditingKR(null);
    } catch (err: any) {
      alert("Governance Sync Error.");
    }
  };

  const handleDeleteKR = async (id: string) => {
    if (!confirm('Purge this Strategic record?')) return;
    try {
      const { error } = await supabase.from('key_results').delete().eq('id', id);
      if (error) throw error;
      await fetchKRs();
    } catch (err) { console.error(err); }
  };

  return (
    <div className="bg-white p-6 md:p-10 rounded-[4px] shadow-xl border border-slate-100 animate-fade-in relative">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12 border-b border-slate-50 pb-8">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight uppercase">Strategic Governance Engine</h2>
          <div className="flex items-center gap-2 mt-2">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#067032]/10 text-[#067032]">
              <ShieldCheck size={14} className="mr-1.5" /> AUTHORITATIVE CONTEXT {selectedYear}
            </span>
          </div>
        </div>
        <div className="flex items-center bg-slate-100 rounded-[4px] p-1 border border-slate-200">
          <button onClick={() => setSelectedYear(selectedYear - 1)} className="p-1.5 text-slate-500 hover:text-primary-600 hover:bg-white rounded-[4px] transition-all"><ChevronLeft size={18} /></button>
          <span className="font-bold text-slate-800 w-20 text-center text-sm">{selectedYear}</span>
          <button onClick={() => setSelectedYear(selectedYear + 1)} className="p-1.5 text-slate-500 hover:text-primary-600 hover:bg-white rounded-[4px] transition-all"><ChevronRight size={18} /></button>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-40 text-slate-300">
          <LoaderCircle className="w-12 h-12 animate-spin text-primary-500 mb-6" />
          <p className="font-bold uppercase tracking-widest text-[10px] text-slate-400">Syncing Strategic Nodes...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {quarters.map((q) => {
            const quarterKRs = krs.filter(kr => kr.quarter === q).sort((a, b) => a.label.localeCompare(b.label));
            const locked = isQuarterLocked(selectedYear, q);
            const isCurrentQuarter = selectedYear === currentQuarterInfo.year && q === currentQuarterInfo.quarterLabel;
            const canOverride = (currentUser?.role === 'SuperAdmin' || currentUser?.role === 'Admin') && isCurrentQuarter;

            return (
              <div key={q} className="flex flex-col rounded-[4px] border bg-slate-50/20 border-slate-200/60 p-5 min-h-[500px]">
                <div className="flex justify-between items-center mb-6">
                  <span className="text-lg font-black text-slate-800">{q}</span>
                  <div className="flex items-center gap-2">
                    {canOverride && (
                      <button
                        onClick={() => toggleQuarterLock(selectedYear, q, locked)}
                        className={`p-1.5 rounded-[4px] transition-all border ${locked ? 'bg-slate-100 text-slate-500 border-slate-200 hover:bg-white hover:text-emerald-600' : 'bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-100'}`}
                        title={locked ? "Manually Unlock" : "Manually Lock"}
                      >
                        {locked ? <Lock size={12} /> : <DatabaseZap size={12} />}
                      </button>
                    )}
                    {!canOverride && locked && <Lock size={12} className="text-slate-400" />}
                    <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{quarterKRs.length}/4 OBJECTIVES</span>
                  </div>
                </div>
                <div className="space-y-4 flex-1">
                  {quarterKRs.map(kr => (
                    <div
                      key={kr.id}
                      className={`group bg-white rounded-[4px] border border-slate-200 p-6 shadow-sm transition-all hover:shadow-md cursor-pointer ${locked ? 'opacity-80' : 'hover:border-primary-400'}`}
                      onClick={() => setEditingKR(kr)}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-[10px] font-black bg-primary-100 text-primary-700 px-2 py-1 rounded uppercase tracking-wider">{kr.label}</span>
                        {locked ? (
                          <div className="p-1.5 text-slate-200"><Lock size={12} /></div>
                        ) : (
                          <button onClick={(e) => { e.stopPropagation(); handleDeleteKR(kr.id); }} className="p-1.5 text-slate-300 hover:text-rose-500"><Trash2 size={12} /></button>
                        )}
                      </div>
                      <h4 className="font-bold text-sm leading-tight mb-3 text-slate-800">{kr.title}</h4>
                      <div className="text-[11px] leading-relaxed line-clamp-3 text-slate-500" dangerouslySetInnerHTML={{ __html: kr.description || '' }} />
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => setEditingKR({ year: selectedYear, quarter: q, title: '', owner_id: currentUser?.id || 'SYSTEM', description: '', label: 'KR' + (quarterKRs.length + 1) })}
                  disabled={locked}
                  className={`mt-4 w-full flex items-center justify-center gap-2 py-3 border border-slate-200 rounded-[4px] text-[10px] font-bold uppercase tracking-widest transition-all ${locked ? 'opacity-50 cursor-not-allowed bg-slate-50 text-slate-300' : 'text-slate-500 hover:bg-white hover:text-primary-600'}`}
                >
                  {locked ? <Lock size={14} /> : <Plus size={14} />} {locked ? 'Locked' : 'New KR Slot'}
                </button>
              </div>
            );
          })}
        </div>
      )}

      {editingKR && (
        <KREditModal
          kr={editingKR}
          onSave={handleSaveKR}
          onClose={() => setEditingKR(null)}
          existingKRsForQuarter={krs.filter(k => k.quarter === editingKR.quarter)}
          canEditContent={!isQuarterLocked(editingKR.year || selectedYear, editingKR.quarter || 'Q1')}
        />
      )}
    </div>
  );
};



