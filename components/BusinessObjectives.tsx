
import React, { useState, useEffect, useMemo, useRef } from 'react';
import DOMPurify from 'dompurify';
import { Target, Plus, Trash2, X, ChevronLeft, ChevronRight, AlertTriangle, LoaderCircle, ShieldCheck, DatabaseZap, Lock, CheckCircle2, RefreshCw, AlertCircle, RefreshCcw, Download, UploadCloud, FileText, Check, TrendingUp, Save, Upload, FileSpreadsheet } from 'lucide-react';
import { KeyResult, Activity, User } from '../src/types';
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
  canManage: boolean;
}> = ({ kr, existingKRsForQuarter, onSave, onClose, canEditContent, canManage }) => {
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
  const availableSlots = allSlots.filter(s => !usedSlots.includes(s));

  const parentPrefix = parentKR?.label || 'KR';
  const allSubSlots = parentKR ? ['1', '2', '3', '4'].map(n => `${parentPrefix}.${n}`) : [];
  const usedSubSlots = existingKRsForQuarter.filter(k => k.parent_kr_id === formData.parent_kr_id && k.id !== formData.id).map(k => k.label);
  const availableSubSlots = isSubKR ? allSubSlots.filter(s => !usedSubSlots.includes(s)) : [];

  // Auto-default the label if missing
  useEffect(() => {
    if (!formData.label) {
      if (isSubKR && availableSubSlots.length > 0) setFormData(prev => ({ ...prev, label: availableSubSlots[0] }));
      else if (!isSubKR && availableSlots.length > 0) setFormData(prev => ({ ...prev, label: availableSlots[0] }));
    }
  }, [formData.label, isSubKR, availableSlots, availableSubSlots]);

  const handleSave = async () => {
    console.log('[DEBUG] handleSave called', { canEditContent, isSaving, formData });
    if (!canEditContent || isSaving) {
      console.log('[DEBUG] Blocked: canEditContent=', canEditContent, 'isSaving=', isSaving);
      return;
    }
    const trimmedTitle = formData.title?.trim();
    console.log('[DEBUG] Values:', { trimmedTitle, label: formData.label });
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
      };
      await onSave(saveData as KeyResult);
    } catch (error: any) { console.error(error); } finally { setIsSaving(false); }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-white rounded-[4px] shadow-2xl w-full max-w-lg overflow-hidden animate-scale-in flex flex-col max-h-[95vh] border border-slate-100">
        <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-white">
          <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
            {kr.id ? `Edit ${kr.label}` : isSubKR ? `Sub-KR for ${parentKR?.label}` : 'Strategic KR'}
            {!canEditContent && (
              <span className="px-2 py-0.5 bg-slate-100 text-slate-500 text-[10px] uppercase tracking-wider rounded-full border border-slate-200 flex items-center gap-1">
                <Lock size={10} /> Locked
              </span>
            )}
          </h3>
          <button onClick={onClose} disabled={isSaving} aria-label="Close" title="Close" className="p-2 hover:bg-slate-50 rounded-full transition-colors text-slate-400"><X size={20} /></button>
        </div>
        <div className="p-6 space-y-6 overflow-y-auto">
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">Key Result Title</label>
            <input type="text" title="Key Result Title" placeholder="Enter KR Title..." value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="w-full p-3 bg-white border border-slate-200 rounded-[4px] text-sm font-medium outline-none focus:ring-2 focus:ring-primary-500/20" disabled={isSaving || !canEditContent} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">{isSubKR ? 'Sub-KR Slot' : 'KR Slot'}</label>
              {console.log('[DEBUG] Select options:', { isSubKR, availableSlots, availableSubSlots, formLabel: formData.label })}
              <Select
                label={isSubKR ? 'Sub-KR Slot' : 'KR Slot'}
                value={formData.label || ''}
                onChange={(val) => { 
                  console.log('[DEBUG] Select changed to:', val);
                  setFormData({ ...formData, label: String(val) }); 
                }}
                options={(isSubKR ? availableSubSlots : availableSlots).map(s => ({ value: s, label: s }))}
                placeholder={isSubKR ? "Select Sub-KR Slot..." : "Select KR Slot..."}
                disabled={isSaving || !!formData.id || !canEditContent}
                className="w-full"
              />
            </div>
            {isSubKR && (
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">Parent KR</label>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-[4px] text-sm font-medium text-slate-600">
                  {parentKR?.label}: {parentKR?.title}
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="px-6 py-5 border-t border-slate-100 flex justify-end items-center gap-3 bg-slate-50/50">
          <button onClick={onClose} disabled={isSaving} className="text-sm font-semibold text-slate-500 hover:text-slate-700 px-4 py-2">Close</button>
          {canManage ? (
            <button onClick={handleSave} disabled={isSaving} className="px-6 py-2.5 bg-primary-600 text-white rounded-[4px] text-sm font-bold shadow-md hover:bg-primary-700 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
              {isSaving ? <LoaderCircle className="w-4 h-4 animate-spin" /> : <Save size={16} />} {isSaving ? 'Saving...' : 'Save Key Result'}
            </button>
          ) : (
            <div className="text-xs text-red-500 font-semibold">No permission to save (need Admin/Director role)</div>
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
  const [orphanedSubKRs, setOrphanedSubKRs] = useState<KeyResult[]>([]);
  const [showCleanupWarning, setShowCleanupWarning] = useState(false);

  const [canManage, setCanManage] = useState(false);
  const [showBulkUpload, setShowBulkUpload] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const [uploadError, setUploadError] = useState('');

  // Simple CSV parser that handles quoted values with commas
  const parseCSVLine = (line: string): string[] => {
    const values: string[] = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        values.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    values.push(current.trim());
    return values;
  };

  const handleBulkUpload = async (file: File) => {
    setUploadStatus('processing');
    setUploadProgress(0);
    setUploadError('');

    try {
      const text = await file.text();
      // Split by newlines and filter out empty/whitespace-only lines
      const lines = text.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0);
      if (lines.length < 2) {
        throw new Error('CSV must have a header row and at least one data row');
      }
      const headers = parseCSVLine(lines[0]).map(h => h.toLowerCase());

      if (!headers.includes('quarter') || !headers.includes('year') || !headers.includes('label') || !headers.includes('title')) {
        throw new Error('Invalid CSV format. Required columns: quarter, year, label, title');
      }

      const data = lines.slice(1).map(line => {
        const values = parseCSVLine(line);
        const row: any = {};
        headers.forEach((h, i) => {
          row[h] = values[i] || '';
        });
        return row;
      }).filter(r => r.quarter && r.year && r.label && r.title);

      const total = data.length;
      const krsToInsert: any[] = [];
      const parentMap: Record<string, string> = {};
      const errors: string[] = [];

      // First pass: identify parent KRs
      const parentRows = data.filter(row => !row.parent_label || row.parent_label === row.label);
      parentRows.forEach(row => {
        // Detect circular reference (self-reference)
        if (row.parent_label === row.label) {
          errors.push(`Row "${row.label}": parent_label cannot be the same as label (self-reference)`);
          return;
        }
        const id = generateLocalUUID();
        parentMap[row.label] = id;
        krsToInsert.push({
          id,
          quarter: row.quarter,
          year: parseInt(row.year),
          label: row.label,
          title: row.title,
          description: '',
          owner_id: currentUser?.id || 'SYSTEM',
          progress: 0,
          status: (['Green', 'Amber', 'Red'].includes(row.status) ? row.status : 'Green') as 'Green' | 'Amber' | 'Red',
          parent_kr_id: null
        });
        setUploadProgress(Math.round((krsToInsert.length / (total * 2)) * 100));
      });

      // Second pass: create sub-KRs
      const childRows = data.filter(row => row.parent_label && row.parent_label !== row.label);
      childRows.forEach(row => {
        // Detect orphaned sub-KR (parent not in CSV)
        if (!parentMap[row.parent_label]) {
          errors.push(`Row "${row.label}": parent_label "${row.parent_label}" not found in CSV`);
          return;
        }
        krsToInsert.push({
          id: generateLocalUUID(),
          quarter: row.quarter,
          year: parseInt(row.year),
          label: row.label,
          title: row.title,
          description: '',
          owner_id: currentUser?.id || 'SYSTEM',
          progress: 0,
          status: (['Green', 'Amber', 'Red'].includes(row.status) ? row.status : 'Green') as 'Green' | 'Amber' | 'Red',
          parent_kr_id: parentMap[row.parent_label]
        });
        setUploadProgress(Math.round(((krsToInsert.length + parentRows.length) / (total * 2)) * 100));
      });

      // Report CSV-level errors
      if (errors.length > 0) {
        throw new Error('CSV errors:\n' + errors.join('\n'));
      }

      // Insert in batches
      const batchSize = 10;
      for (let i = 0; i < krsToInsert.length; i += batchSize) {
        const batch = krsToInsert.slice(i, i + batchSize);
        const { error } = await supabase.from('key_results').upsert(batch, { onConflict: 'id' });
        if (error) throw error;
        setUploadProgress(Math.round((i + batch.length) / krsToInsert.length * 100));
      }

      await fetchKRs();
      setUploadProgress(100);
      setUploadStatus('success');
      setTimeout(() => {
        setShowBulkUpload(false);
        setUploadStatus('idle');
        setUploadProgress(0);
      }, 2000);
    } catch (err: any) {
      setUploadError(err.message || 'Upload failed');
      setUploadStatus('error');
    }
  };

  useEffect(() => {
    canManageObjectives().then(result => setCanManage(result));
  }, []);
  const quarters = ['Q1', 'Q2', 'Q3', 'Q4'];
  const currentQuarterInfo = useMemo(() => getCurrentQuarterInfo(), []);

  const fetchKRs = async () => {
    setLoading(true);
    try {
      const allKRs = await getRegistryKeyResults(selectedYear);
      // Separate actual KRs from System Lock KRs
      let actualKRs = allKRs.filter(k => k.label !== 'SYSTEM_LOCK');
      
      // Check for orphaned sub-KRs (sub-KRs whose parent no longer exists)
      const parentIds = new Set(actualKRs.filter(k => !k.parent_kr_id).map(k => k.id));
      const orphans = actualKRs.filter(k => k.parent_kr_id && !parentIds.has(k.parent_kr_id));
      
      if (orphans.length > 0) {
        console.warn('[BUSINESS_OBJECTIVES] Found orphaned sub-KRs:', orphans);
        setOrphanedSubKRs(orphans);
        setShowCleanupWarning(true);
      } else {
        setOrphanedSubKRs([]);
        setShowCleanupWarning(false);
      }
      
      // Deduplicate: keep only first occurrence of each label within each quarter (for parent KRs)
      const seen = new Set<string>();
      actualKRs = actualKRs.filter(kr => {
        if (!kr.parent_kr_id) {
          const key = `${kr.quarter}-${kr.label}`;
          if (seen.has(key)) return false;
          seen.add(key);
        }
        return true;
      });
      
      const locks = allKRs.filter(k => k.label === 'SYSTEM_LOCK');

      setKrs(actualKRs);
      setLockOverrides(locks);

      const user = await getSessionUser();
      setCurrentUser(user);
    } catch (err) {
      console.error(err);
    } finally { setLoading(false); }
  };

  const cleanupOrphanedSubKRs = async () => {
    if (orphanedSubKRs.length === 0) return;
    
    try {
      // Delete orphaned sub-KRs
      const orphanIds = orphanedSubKRs.map(o => o.id);
      const { error } = await supabase.from('key_results').delete().in('id', orphanIds);
      if (error) throw error;
      
      logAudit('DELETE', `Cleaned up ${orphanIds.length} orphaned sub-KRs`);
      setOrphanedSubKRs([]);
      setShowCleanupWarning(false);
      await fetchKRs();
      alert(`Successfully removed ${orphanIds.length} orphaned sub-KR(s).`);
    } catch (err) {
      console.error('[CLEANUP] Failed:', err);
      alert('Failed to cleanup orphaned sub-KRs.');
    }
  };

  const isQuarterLocked = (year: number, quarter: string) => {
    // Lock disabled - always return false
    return false;
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
      // Validation: If this is a sub-KR, ensure parent exists
      if (krToSave.parent_kr_id) {
        const parentExists = krs.some(k => k.id === krToSave.parent_kr_id);
        if (!parentExists) {
          alert('Error: Cannot save sub-KR. Parent KR not found. Please select a valid parent KR.');
          return;
        }
      }
      
      const krToSaveWithDefaults = {
        ...krToSave,
        progress: krToSave.progress ?? 0,
        status: (krToSave.status ?? 'Green') as 'Green' | 'Amber' | 'Red',
        quarter: krToSave.quarter ?? 'Q1',
        year: krToSave.year ?? selectedYear,
        owner_id: krToSave.owner_id || currentUser?.id || 'SYSTEM',
        description: krToSave.description || ''
      };
      
      console.log('Upserting KR:', krToSaveWithDefaults);
      const { error } = await supabase.from('key_results').upsert(krToSaveWithDefaults);
      if (error) {
        throw error;
      }
      logAudit(krToSave.id ? 'UPDATE' : 'CREATE', `Synced Strategic KR: ${krToSave.label}`);
      await fetchKRs();
      setEditingKR(null);
    } catch (err: any) {
      alert("Failed to save Key Result. Please try again.");
      setEditingKR(null);
    }
  };

  const handleDeleteKR = async (id: string, isParent: boolean) => {
    console.log('[DEBUG] handleDeleteKR called', { id, canManage, isParent });
    if (!canManage) {
      alert('No permission to delete (need Admin/Director role)');
      return;
    }
    const confirmMsg = isParent 
      ? 'Delete this KR and all its Sub-KRs?' 
      : 'Purge this Sub-KR record?';
    if (!confirm(confirmMsg)) return;
    
    try {
      console.log('[DEBUG] Deleting KR:', id, 'isParent:', isParent);
      
      // If deleting a parent, also delete all sub-KRs
      if (isParent) {
        const { error: deleteSubError } = await supabase
          .from('key_results')
          .delete()
          .eq('parent_kr_id', id);
        if (deleteSubError) throw deleteSubError;
      }
      
      const { error } = await supabase.from('key_results').delete().eq('id', id);
      if (error) {
        console.error('[DEBUG] Delete error:', error);
        throw error;
      }
      await fetchKRs();
    } catch (err) { 
      console.error('[DEBUG] Delete failed:', err);
      alert('Failed to delete: ' + (err as any)?.message);
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg border border-slate-200 animate-fade-in relative">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 border-b border-slate-100 pb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900 uppercase">Strategic Governance Engine</h2>
          <div className="flex items-center gap-2 mt-2">
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-[#067032]/10 text-[#067032]">
              <ShieldCheck size={12} className="mr-1" /> AUTHORITATIVE CONTEXT {selectedYear}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {canManage && (
            <button
              onClick={() => setShowBulkUpload(true)}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-600 border border-emerald-200 rounded-lg text-xs font-semibold hover:bg-emerald-100 transition-all"
            >
              <UploadCloud size={16} /> Bulk Upload
            </button>
          )}
          <div className="flex items-center bg-slate-100 rounded-lg p-1 border border-slate-200">
            <button onClick={() => setSelectedYear(selectedYear - 1)} aria-label="Previous Year" title="Previous Year" className="p-1.5 text-slate-500 hover:text-primary-600 hover:bg-white rounded-md transition-all"><ChevronLeft size={16} /></button>
            <span className="font-semibold text-slate-800 w-16 text-center text-sm">{selectedYear}</span>
            <button onClick={() => setSelectedYear(selectedYear + 1)} aria-label="Next Year" title="Next Year" className="p-1.5 text-slate-500 hover:text-primary-600 hover:bg-white rounded-md transition-all"><ChevronRight size={16} /></button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-40 text-slate-300">
          <LoaderCircle className="w-12 h-12 animate-spin text-primary-500 mb-6" />
          <p className="font-bold uppercase tracking-widest text-[10px] text-slate-400">Syncing Strategic Nodes...</p>
        </div>
      ) : (
        <>
          {showCleanupWarning && orphanedSubKRs.length > 0 && (
            <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-xl">
              <div className="flex items-start gap-3">
                <AlertTriangle className="text-rose-500 shrink-0 mt-0.5" size={20} />
                <div className="flex-1">
                  <h4 className="font-bold text-rose-700 text-sm">Orphaned Sub-KRs Detected</h4>
                  <p className="text-rose-600 text-xs mt-1">
                    Found {orphanedSubKRs.length} sub-KR(s) without valid parents. These must be cleaned up.
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {orphanedSubKRs.map(o => (
                      <span key={o.id} className="px-2 py-1 bg-rose-100 text-rose-700 text-xs rounded font-medium">{o.label}</span>
                    ))}
                  </div>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button
                    onClick={cleanupOrphanedSubKRs}
                    className="px-3 py-1.5 bg-rose-500 text-white text-xs font-bold rounded-lg hover:bg-rose-600 transition-all"
                  >
                    Cleanup All
                  </button>
                  <button
                    onClick={() => setShowCleanupWarning(false)}
                    className="p-1.5 text-rose-400 hover:text-rose-600"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>
            </div>
          )}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quarters.map((q) => {
            const quarterKRs = krs.filter(kr => kr.quarter === q).sort((a, b) => a.label.localeCompare(b.label));
            const locked = isQuarterLocked(selectedYear, q);
            const isCurrentQuarter = selectedYear === currentQuarterInfo.year && q === currentQuarterInfo.quarterLabel;
            const canOverride = (currentUser?.role === 'SuperAdmin' || currentUser?.role === 'Admin') && isCurrentQuarter;

            return (
              <div key={q} className="flex flex-col rounded-xl border bg-slate-50 border-slate-200 p-4 min-h-[480px]">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-base font-bold text-slate-800">{q}</span>
                  <div className="flex items-center gap-2">
                    {canOverride && (
                      <button
                        onClick={() => toggleQuarterLock(selectedYear, q, locked)}
                        className={`p-1.5 rounded-lg transition-all border ${locked ? 'bg-slate-100 text-slate-500 border-slate-200 hover:bg-white hover:text-emerald-600' : 'bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-100'}`}
                        title={locked ? "Manually Unlock" : "Manually Lock"}
                      >
                        {locked ? <Lock size={12} /> : <DatabaseZap size={12} />}
                      </button>
                    )}
                    {!canOverride && locked && <Lock size={12} className="text-slate-400" />}
                    <span className="text-xs font-semibold text-slate-400 uppercase">{quarterKRs.filter(k => !k.parent_kr_id).length}/4 OBJECTIVES</span>
                  </div>
                </div>
                <div className="space-y-3 flex-1">
                  {quarterKRs.filter(kr => !kr.parent_kr_id).map(kr => {
                    const subKRs = quarterKRs.filter(sk => sk.parent_kr_id === kr.id).sort((a, b) => a.label.localeCompare(b.label));
                    return (
                      <div key={kr.id} className={`group bg-white rounded-lg border border-slate-200 p-4 shadow-sm transition-all hover:shadow-md ${locked ? 'opacity-80' : 'hover:border-primary-400'}`}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-semibold bg-primary-100 text-primary-700 px-2 py-1 rounded uppercase tracking-wide">{kr.label}</span>
                          <div className="flex items-center gap-1">
                            {canManage && !locked && (
                              <button onClick={() => setEditingKR(kr)} aria-label="Edit KR" title="Edit KR" className="p-1 text-slate-300 hover:text-primary-500">
                                <FileText size={12} />
                              </button>
                            )}
                            {locked ? (
                              <div className="p-1 text-slate-300"><Lock size={12} /></div>
                            ) : canManage ? (
                              <button onClick={(e) => { e.stopPropagation(); handleDeleteKR(kr.id, true); }} aria-label="Delete KR" title="Delete KR & Sub-KRs" className="p-1 text-slate-300 hover:text-rose-500"><Trash2 size={12} /></button>
                            ) : null}
                          </div>
                        </div>
                        <h4 className="font-semibold text-sm leading-tight mb-2 text-slate-800">{kr.title}</h4>
                        {subKRs.length > 0 && (
                          <div className="mt-3 pt-3 border-t border-slate-100 space-y-1.5">
                            {subKRs.map(subKr => (
                              <div
                                key={subKr.id}
                                className="flex items-center justify-between bg-slate-50 rounded px-2 py-1.5"
                              >
                                <div className="flex items-center gap-2">
                                  <span className="text-[10px] font-semibold bg-amber-50 text-amber-600 px-1.5 py-0.5 rounded">{subKr.label}</span>
                                  <span className="text-xs text-slate-600">{subKr.title}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  {canManage && !locked && (
                                    <button onClick={() => setEditingKR(subKr)} className="p-0.5 text-slate-300 hover:text-primary-500">
                                      <FileText size={10} />
                                    </button>
                                  )}
                                  {canManage && (
                                    <button onClick={() => handleDeleteKR(subKr.id, false)} className="p-0.5 text-slate-300 hover:text-rose-500">
                                      <Trash2 size={10} />
                                    </button>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                        {canManage && !locked && (
                          <button
                            onClick={() => setEditingKR({ year: selectedYear, quarter: q, title: '', owner_id: currentUser?.id || 'SYSTEM', description: '', label: `${kr.label}.${subKRs.length + 1}`, parent_kr_id: kr.id })}
                            className="mt-2 w-full flex items-center justify-center gap-1 py-1.5 border border-dashed border-slate-200 rounded text-[10px] font-semibold uppercase tracking-wide transition-all text-slate-400 hover:bg-slate-50 hover:text-primary-600"
                          >
                            <Plus size={10} /> Add Sub-KR
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
                <button
                  onClick={() => {
                    const existingLabels = quarterKRs.filter(k => !k.parent_kr_id).map(k => k.label);
                    const allLabels = ['KR1', 'KR2', 'KR3', 'KR4'];
                    const nextLabel = allLabels.find(l => !existingLabels.includes(l)) || 'KR' + (existingLabels.length + 1);
                    setEditingKR({ year: selectedYear, quarter: q, title: '', owner_id: currentUser?.id || 'SYSTEM', description: '', label: nextLabel });
                  }}
                  disabled={locked || quarterKRs.filter(k => !k.parent_kr_id).length >= 4 || !canManage}
                  className={`mt-4 w-full flex items-center justify-center gap-2 py-2.5 border border-dashed border-slate-200 rounded-lg text-xs font-semibold uppercase tracking-wide transition-all ${locked || quarterKRs.filter(k => !k.parent_kr_id).length >= 4 || !canManage ? 'opacity-50 cursor-not-allowed bg-slate-50 text-slate-300' : 'text-slate-500 hover:bg-white hover:text-primary-600'}`}
                >
                  {locked ? <Lock size={14} /> : <Plus size={14} />} {locked ? 'Locked' : quarterKRs.filter(k => !k.parent_kr_id).length >= 4 ? 'Max 4 KRs' : 'New KR Slot'}
                </button>
              </div>
            );
          })}
        </div>
        </>
      )}

      {editingKR && (
        <KREditModal
          kr={editingKR}
          onSave={handleSaveKR}
          onClose={() => setEditingKR(null)}
          existingKRsForQuarter={krs.filter(k => k.quarter === editingKR.quarter)}
          canEditContent={!isQuarterLocked(editingKR.year || selectedYear, editingKR.quarter || 'Q1')}
          canManage={canManage}
        />
      )}

      {showBulkUpload && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <UploadCloud size={20} className="text-emerald-600" /> Bulk Upload KRs
              </h3>
              <button onClick={() => { setShowBulkUpload(false); setUploadStatus('idle'); setUploadProgress(0); }} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6">
              {uploadStatus === 'idle' && (
                <>
                  <div className="mb-4 p-4 bg-slate-50 rounded-lg border border-slate-200">
                    <p className="text-sm text-slate-600 font-medium mb-2">CSV Format:</p>
                    <p className="text-xs text-slate-500">quarter,year,label,title,parent_label,status</p>
                    <p className="text-xs text-slate-400 mt-2">Example: Q1,2026,KR1,Grow Revenue,,Green</p>
                    <p className="text-xs text-slate-400">Sub-KR: Q1,2026,KR1.1,Increase Sales,KR1,Green</p>
                    <p className="text-xs text-slate-400 mt-1">Status: Green, Amber, or Red (optional)</p>
                  </div>
                  
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-300 rounded-lg cursor-pointer hover:border-emerald-500 hover:bg-emerald-50/30 transition-all">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <FileSpreadsheet size={32} className="text-slate-400 mb-2" />
                      <p className="text-sm text-slate-500 font-medium">Click to upload CSV file</p>
                    </div>
                    <input type="file" accept=".csv" className="hidden" onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleBulkUpload(file);
                    }} />
                  </label>
                  
                  <button
                    onClick={() => {
                      const csvContent = [
                        'quarter,year,label,title,parent_label,status',
                        'Q1,2026,KR1,Grow revenue by 20%,,Green',
                        'Q1,2026,KR1.1,Increase customer acquisition by 15%,KR1,Green',
                        'Q1,2026,KR1.2,Launch new product line,KR1,Green',
                        'Q1,2026,KR1.3,Improve customer satisfaction,KR1,Green',
                        'Q1,2026,KR2,Improve operational efficiency,,Green',
                        'Q1,2026,KR2.1,Automate manual processes,KR2,Green',
                        'Q1,2026,KR2.2,Reduce operational costs by 10%,KR2,Green',
                        'Q1,2026,KR3,Enhance customer experience,,Green',
                        'Q1,2026,KR3.1,Launch customer feedback system,KR3,Green',
                        'Q2,2026,KR1,Expand market reach,,Green',
                        'Q2,2026,KR1.1,Enter new geographic markets,KR1,Green',
                        'Q2,2026,KR1.2,Increase brand awareness,KR1,Green',
                        'Q2,2026,KR2,Enhance product quality,,Green',
                        'Q2,2026,KR2.1,Reduce defect rate,KR2,Green',
                      ].join('\n');
                      const blob = new Blob([csvContent], { type: 'text/csv' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = 'kr-template.csv';
                      a.click();
                      URL.revokeObjectURL(url);
                    }}
                    className="mt-4 flex items-center justify-center gap-2 text-sm text-emerald-600 hover:text-emerald-700 font-medium"
                  >
                    <Download size={16} /> Download Template
                  </button>
                </>
              )}

              {uploadStatus === 'processing' && (
                <div className="text-center py-8">
                  <LoaderCircle size={48} className="mx-auto mb-4 text-emerald-600 animate-spin" />
                  <p className="text-lg font-semibold text-slate-800 mb-2">Uploading KRs...</p>
                  <div className="w-full bg-slate-100 rounded-full h-3 mb-2 overflow-hidden">
                    <div 
                      className="bg-emerald-500 h-3 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                  <p className="text-sm text-slate-500">{uploadProgress}% complete</p>
                </div>
              )}

              {uploadStatus === 'success' && (
                <div className="text-center py-8">
                  <div className="w-16 h-16 mx-auto mb-4 bg-emerald-100 rounded-full flex items-center justify-center">
                    <Check size={32} className="text-emerald-600" />
                  </div>
                  <p className="text-lg font-semibold text-slate-800 mb-2">Upload Complete!</p>
                  <p className="text-sm text-slate-500">All KRs have been imported successfully.</p>
                </div>
              )}

              {uploadStatus === 'error' && (
                <div className="text-center py-8">
                  <div className="w-16 h-16 mx-auto mb-4 bg-rose-100 rounded-full flex items-center justify-center">
                    <AlertCircle size={32} className="text-rose-600" />
                  </div>
                  <p className="text-lg font-semibold text-slate-800 mb-2">Upload Failed</p>
                  <p className="text-sm text-rose-600 mb-4">{uploadError}</p>
                  <button 
                    onClick={() => setUploadStatus('idle')}
                    className="px-4 py-2 bg-slate-100 text-slate-600 rounded-lg text-sm font-medium hover:bg-slate-200"
                  >
                    Try Again
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};



