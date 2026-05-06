import React, { useState, useEffect, useMemo } from 'react';
import { Target, Plus, Trash2, ChevronLeft, ChevronRight, AlertTriangle, LoaderCircle, ShieldCheck, Lock, Edit3, Save, X, FileText } from 'lucide-react';
import { KeyResult, User, Objective } from '../../types';
import { logAudit, getSessionUser, getCurrentQuarterInfo, canManageObjectives, generateLocalUUID, getRegistryKeyResults, getObjectives, saveObjective } from '../../utils';
import { supabase } from '../../lib/supabase';
import { useToast } from '../ui/Toast';
import { ConfirmDialog } from '../ui/Modal';
import { KREditModal } from './KREditModal';
import { BulkUploadModal } from './BulkUploadModal';

interface BusinessObjectivesProps {
  selectedYear?: number;
  setSelectedYear?: (y: number) => void;
}

export const BusinessObjectives: React.FC<BusinessObjectivesProps> = ({ selectedYear: propSelectedYear, setSelectedYear: propSetSelectedYear }) => {
  const [internalSelectedYear, setInternalSelectedYear] = useState(() => getCurrentQuarterInfo().year);
  const selectedYear = propSelectedYear ?? internalSelectedYear;
  const setSelectedYear = propSetSelectedYear ?? setInternalSelectedYear;
  
  const { addToast } = useToast();
  const [krs, setKrs] = useState<KeyResult[]>([]);
  const [objectives, setObjectives] = useState<Objective[]>([]);
  const [lockOverrides, setLockOverrides] = useState<KeyResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingKR, setEditingKR] = useState<Partial<KeyResult> | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [orphanedSubKRs, setOrphanedSubKRs] = useState<KeyResult[]>([]);
  const [showCleanupWarning, setShowCleanupWarning] = useState(false);
  const [editingObjective, setEditingObjective] = useState<{ quarter: string; title: string } | null>(null);

  const [canManage, setCanManage] = useState(false);
  const [showBulkUpload, setShowBulkUpload] = useState(false);
  const [lockConfirm, setLockConfirm] = useState<{ isOpen: boolean; quarter: string; year: number; currentLocked: boolean }>({ isOpen: false, quarter: '', year: 0, currentLocked: false });
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; id: string; isParent: boolean }>({ isOpen: false, id: '', isParent: false });

  useEffect(() => {
    canManageObjectives().then(result => setCanManage(result));
  }, []);
  
  const quarters = ['Q1', 'Q2', 'Q3', 'Q4'];
const currentQuarterInfo = useMemo(() => getCurrentQuarterInfo(), []);

  const fetchKRs = async () => {
    setLoading(true);
    try {
      const [allKRs, objectivesData] = await Promise.all([
        getRegistryKeyResults(selectedYear),
        getObjectives(selectedYear)
      ]);
      let actualKRs = allKRs.filter(k => k.label !== 'SYSTEM_LOCK');

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
      setObjectives(objectivesData);
      setLockOverrides(locks);

      const user = await getSessionUser();
      setCurrentUser(user);
    } catch (err) {
      console.error(err);
    } finally { setLoading(false); }
  };

  const handleSaveObjective = async (quarter: string, title: string) => {
    try {
      const existingObj = objectives.find(o => o.quarter === quarter && o.year === selectedYear);
      const objectiveToSave: Objective = {
        id: existingObj?.id || generateLocalUUID(),
        title,
        quarter: quarter as 'Q1' | 'Q2' | 'Q3' | 'Q4',
        year: selectedYear
      };

      const result = await saveObjective(objectiveToSave);
      if (result.error) {
        addToast(`Failed to save objective: ${result.error}`, 'error');
      } else {
        logAudit('UPDATE', `Updated Objective for ${quarter} ${selectedYear}: ${title}`);
        addToast('Objective saved successfully', 'success');
        setEditingObjective(null);
        await fetchKRs();
      }
    } catch (err) {
      console.error('[OBJECTIVE] Save failed:', err);
      addToast('Failed to save objective', 'error');
    }
  };

  const cleanupOrphanedSubKRs = async () => {
    if (orphanedSubKRs.length === 0) return;
    
    try {
      const orphanIds = orphanedSubKRs.map(o => o.id);
      const { error } = await supabase.from('key_results').delete().in('id', orphanIds);
      if (error) throw error;
      
logAudit('DELETE', `Cleaned up ${orphanIds.length} orphaned sub-KRs`);
  setOrphanedSubKRs([]);
  setShowCleanupWarning(false);
  await fetchKRs();
  addToast(`Successfully removed ${orphanIds.length} orphaned sub-KR(s).`, 'success');
} catch (err) {
  console.error('[CLEANUP] Failed:', err);
  addToast('Failed to cleanup orphaned sub-KRs.', 'error');
}
};

  const isQuarterLocked = (year: number, quarter: string) => {
    const lockRecord = lockOverrides.find(
      lock => lock.quarter === quarter && lock.year === year
    );
return lockRecord?.status === 'Red';
};

const handleLockToggle = async () => {
  if (!lockConfirm.quarter) return;
  const { quarter, year, currentLocked } = lockConfirm;

  try {
    const lockId = `LOCK-${year}-${quarter}`;
    const newStatus = currentLocked ? 'Green' : 'Red';

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

    logAudit('UPDATE', `Manual Governance Override: ${quarter} ${year} set to ${currentLocked ? 'UNLOCKED' : 'LOCKED'}`);
    await fetchKRs();
    addToast(`Quarter ${quarter} ${currentLocked ? 'unlocked' : 'locked'} successfully`, 'success');
  } catch (e) {
    addToast("Failed to update lock state.", 'error');
  } finally {
    setLockConfirm({ isOpen: false, quarter: '', year: 0, currentLocked: false });
  }
};

const confirmLockToggle = (year: number, quarter: string, currentLockedState: boolean) => {
  setLockConfirm({ isOpen: true, quarter, year, currentLocked: currentLockedState });
};

  useEffect(() => {
    fetchKRs();
    window.addEventListener('4COREUserUpdate', fetchKRs);
    return () => window.removeEventListener('4COREUserUpdate', fetchKRs);
  }, [selectedYear]);

  const handleSaveKR = async (krToSave: KeyResult) => {
    try {
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
      
      const { error } = await supabase.from('key_results').upsert(krToSaveWithDefaults);
      if (error) {
        throw error;
      }
      logAudit(krToSave.id ? 'UPDATE' : 'CREATE', `Synced Strategic KR: ${krToSave.label}`);
      await fetchKRs();
      setEditingKR(null);
      addToast(krToSave.id ? 'Key Result updated successfully' : 'Key Result created successfully', 'success');
    } catch (err: any) {
      addToast("Failed to save Key Result. Please try again.", 'error');
      setEditingKR(null);
    }
  };

  const handleDeleteKR = async (id: string, isParent: boolean) => {
    if (!canManage) {
      alert('No permission to delete (need Admin/Director role)');
      return;
    }
    const confirmMsg = isParent 
      ? 'Delete this KR and all its Sub-KRs?' 
      : 'Purge this Sub-KR record?';
    if (!confirm(confirmMsg)) return;
    
    try {
      if (isParent) {
        const { error: deleteSubError } = await supabase
          .from('key_results')
          .delete()
          .eq('parent_kr_id', id);
        if (deleteSubError) throw deleteSubError;
      }
      
      const { error } = await supabase.from('key_results').delete().eq('id', id);
      if (error) {
        throw error;
      }
      await fetchKRs();
      addToast(isParent ? 'KR and all sub-KRs deleted successfully' : 'Sub-KR deleted successfully', 'success');
    } catch (err) { 
      addToast('Failed to delete: ' + (err as any)?.message, 'error');
    }
  };

const handleAddNewKR = (quarter: string) => {
  const quarterKRs = krs.filter(kr => kr.quarter === quarter);
  const existingLabels = quarterKRs.filter(k => !k.parent_kr_id).map(k => k.label);
  const allLabels = ['KR1', 'KR2', 'KR3', 'KR4'];
  const nextLabel = allLabels.find(l => !existingLabels.includes(l)) || 'KR' + (existingLabels.length + 1);
  const objective = objectives.find(o => o.quarter === quarter);
  
  setEditingKR({ 
    year: selectedYear, 
    quarter, 
    title: '', 
    owner_id: currentUser?.id || 'SYSTEM', 
    description: '', 
    label: nextLabel, 
    objective_id: objective?.id 
  });
};

  const handleAddSubKR = (parentKR: KeyResult, quarter: string) => {
    const quarterKRs = krs.filter(kr => kr.quarter === quarter);
    const subKRs = quarterKRs.filter(sk => sk.parent_kr_id === parentKR.id);
    setEditingKR({ year: selectedYear, quarter, title: '', owner_id: currentUser?.id || 'SYSTEM', description: '', label: `${parentKR.label}.${subKRs.length + 1}`, parent_kr_id: parentKR.id });
  };

  return (
    <div className="bg-white p-4 lg:p-6 rounded-xl shadow-lg border border-slate-200 animate-fade-in relative">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6 border-b border-slate-100 pb-6">
        <div className="min-w-0">
          <h2 className="text-lg lg:text-xl font-bold text-slate-900 uppercase">Strategic Governance Engine</h2>
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-[#067032]/10 text-[#067032]">
              <ShieldCheck size={12} className="mr-1" /> AUTHORITATIVE CONTEXT {selectedYear}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          {canManage && (
            <button
              onClick={() => setShowBulkUpload(true)}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-600 border border-emerald-200 rounded-lg text-xs font-semibold hover:bg-emerald-100 transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
            >
              <Plus size={16} /> Bulk Upload
            </button>
          )}
          <div className="flex items-center bg-slate-100 rounded-lg p-1 border border-slate-200">
            <button onClick={() => setSelectedYear(selectedYear - 1)} aria-label="Previous Year" title="Previous Year" className="p-1.5 text-slate-500 hover:text-primary-600 hover:bg-white rounded-md transition-all focus:outline-none focus:ring-2 focus:ring-primary-500"><ChevronLeft size={16} /></button>
            <span className="font-semibold text-slate-800 w-16 text-center text-sm">{selectedYear}</span>
            <button onClick={() => setSelectedYear(selectedYear + 1)} aria-label="Next Year" title="Next Year" className="p-1.5 text-slate-500 hover:text-primary-600 hover:bg-white rounded-md transition-all focus:outline-none focus:ring-2 focus:ring-primary-500"><ChevronRight size={16} /></button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 lg:py-40 text-slate-300">
          <LoaderCircle className="w-10 h-10 lg:w-12 lg:h-12 animate-spin text-primary-500 mb-6" />
          <p className="font-bold uppercase tracking-widest text-[10px] text-slate-400">Syncing Strategic Nodes...</p>
        </div>
      ) : (
        <>
          {showCleanupWarning && orphanedSubKRs.length > 0 && (
            <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-xl">
              <div className="flex items-start gap-3">
                <AlertTriangle className="text-rose-500 shrink-0 mt-0.5" size={20} />
                <div className="flex-1 min-w-0">
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
                    className="px-3 py-1.5 bg-rose-500 text-white text-xs font-bold rounded-lg hover:bg-rose-600 transition-all focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2"
                  >
                    Cleanup All
                  </button>
                  <button
                    onClick={() => setShowCleanupWarning(false)}
                    className="p-1.5 text-rose-400 hover:text-rose-600 focus:outline-none focus:ring-2 focus:ring-rose-500 rounded"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>
            </div>
          )}
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {quarters.map((q) => {
          const quarterKRs = krs.filter(kr => kr.quarter === q).sort((a, b) => a.label.localeCompare(b.label));
          const objective = objectives.find(o => o.quarter === q);
          const locked = isQuarterLocked(selectedYear, q);
          const isCurrentQuarter = selectedYear === currentQuarterInfo.year && q === currentQuarterInfo.quarterLabel;
          const canOverride = (currentUser?.role === 'SuperAdmin' || currentUser?.role === 'Admin') && isCurrentQuarter;
          const isEditingObjective = editingObjective?.quarter === q;

          return (
            <div key={q} className="flex flex-col rounded-xl border bg-slate-50 border-slate-200 p-4 min-h-[480px]">
              <div className="flex justify-between items-center mb-3">
                <span className="text-base font-bold text-slate-800">{q}</span>
                <div className="flex items-center gap-2">
                  {canOverride && (
                    <button
                      onClick={() => confirmLockToggle(selectedYear, q, locked)}
                      className={`p-1.5 rounded-lg transition-all border ${locked ? 'bg-slate-100 text-slate-500 border-slate-200 hover:bg-white hover:text-emerald-600' : 'bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-100'}`}
                      title={locked ? "Manually Unlock" : "Manually Lock"}
                    >
                      {locked ? <Lock size={12} /> : <Target size={12} />}
                    </button>
                  )}
                  {!canOverride && locked && <Lock size={12} className="text-slate-400" />}
                  <span className="text-xs font-semibold text-slate-400 uppercase">{quarterKRs.filter(kr => !kr.parent_kr_id).length}/4 KRs</span>
                </div>
              </div>

               {isEditingObjective ? (
                 <div className="mb-4 p-3 bg-white rounded-xl border-2 border-primary-500 shadow-sm animate-scale-in">
                   <div className="flex items-center gap-2 mb-2 text-primary-600">
                     <Edit3 size={14} />
                     <span className="text-[10px] font-bold uppercase tracking-wider">Editing Quarterly Objective</span>
                   </div>
                   <input
                     type="text"
                     value={editingObjective.title}
                     onChange={(e) => setEditingObjective({ ...editingObjective, title: e.target.value })}
                     placeholder="Enter strategic objective for the quarter..."
                     className="w-full text-sm font-medium border border-slate-200 rounded-lg px-3 py-2 mb-3 focus:outline-none focus:ring-2 focus:ring-primary-500 bg-slate-50"
                     autoFocus
                   />
                   <div className="flex gap-2">
                     <button
                       onClick={() => handleSaveObjective(q, editingObjective.title)}
                       className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-primary-600 text-white text-xs font-bold rounded-lg hover:bg-primary-700 transition-colors shadow-sm"
                     >
                       <Save size={14} /> Save Objective
                     </button>
                     <button
                       onClick={() => setEditingObjective(null)}
                       className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-slate-100 text-slate-600 text-xs font-bold rounded-lg hover:bg-slate-200 transition-colors"
                     >
                       <X size={14} /> Cancel
                     </button>
                   </div>
                 </div>
               ) : (
                 <div
                   className={`mb-4 p-3 rounded-xl border transition-all cursor-pointer group ${
                     objective 
                       ? 'bg-gradient-to-br from-primary-50 to-white border-primary-200 hover:border-primary-400 shadow-sm' 
                       : 'bg-slate-50 border-dashed border-slate-300 hover:bg-slate-100'
                   }`}
                   onClick={() => currentUser?.role === 'SuperAdmin' && setEditingObjective({ quarter: q, title: objective?.title || '' })}
                 >
                   <div className="flex items-center justify-between mb-1">
                     <span className={`text-[10px] font-bold uppercase tracking-widest ${objective ? 'text-primary-600' : 'text-slate-400'}`}>
                       Quarterly Objective
                     </span>
                     {currentUser?.role === 'SuperAdmin' && (
                       <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 text-primary-500">
                         <Edit3 size={10} />
                         <span className="text-[9px] font-bold">EDIT</span>
                       </div>
                     )}
                   </div>
                   <p className={`text-xs font-bold leading-tight ${objective ? 'text-slate-800' : 'text-slate-400 italic'}`}>
                     {objective?.title || 'No objective defined. SuperAdmin must set objective before KRs can be added.'}
                   </p>
                 </div>
               )}


               <div className="space-y-3 flex-1 overflow-y-auto pr-1">
                 {['KR1', 'KR2', 'KR3', 'KR4'].map((slot) => {
                   const kr = quarterKRs.find(k => !k.parent_kr_id && k.label === slot);
                   const subKRs = kr ? quarterKRs.filter(sk => sk.parent_kr_id === kr.id).sort((a, b) => a.label.localeCompare(b.label)) : [];
                   
                   if (!kr) {
                     return (
                       <div 
                         key={slot} 
                         className={`group relative rounded-xl border-2 border-dashed transition-all p-4 flex flex-col items-center justify-center text-center min-h-[100px] ${
                           !objective || !canManage
                             ? 'border-slate-200 bg-slate-50/50 text-slate-300 cursor-not-allowed' 
                             : 'border-slate-200 hover:border-primary-300 hover:bg-primary-50/30 text-slate-400 hover:text-primary-600 cursor-pointer'
                         }`}
                         onClick={() => objective && canManage && handleAddNewKR(q)}
                       >
                         <div className={`mb-1 font-bold text-[10px] uppercase tracking-tighter ${objective && canManage ? 'text-slate-400 group-hover:text-primary-500' : 'text-slate-300'}`}>
                           {slot} Slot
                         </div>
                         {objective && canManage ? (
                           <div className="flex items-center gap-1 font-bold text-xs transition-all group-hover:scale-110">
                             <Plus size={14} /> Add Key Result
                           </div>
                         ) : (
                           <div className="flex items-center gap-1 text-xs italic">
                             <Lock size={12} /> {!objective ? 'Define Objective First' : 'No Permission'}
                           </div>
                         )}
                       </div>
                     );
                   }

                   return (
                     <div key={kr.id} className={`group bg-white rounded-xl border border-slate-200 p-4 shadow-sm transition-all hover:shadow-md ${locked ? 'opacity-80' : 'hover:border-primary-400'}`}>
                       <div className="flex items-center justify-between mb-2">
                         <span className="text-xs font-bold bg-primary-100 text-primary-700 px-2 py-1 rounded-md uppercase tracking-wide">{kr.label}</span>
                         <div className="flex items-center gap-1">
                           {canManage && !locked && (
                             <button onClick={() => setEditingKR(kr)} aria-label="Edit KR" title="Edit KR" className="p-1.5 text-slate-300 hover:text-primary-500 hover:bg-primary-50 rounded-md transition-all">
                               <FileText size={14} />
                             </button>
                           )}
                           {locked ? (
                             <div className="p-1.5 text-slate-300"><Lock size={14} /></div>
                           ) : canManage ? (
                             <button onClick={() => handleDeleteKR(kr.id, true)} aria-label="Delete KR" title="Delete KR & Sub-KRs" className="p-1.5 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-md transition-all"><Trash2 size={14} /></button>
                           ) : null}
                         </div>
                       </div>
                       <h4 className="font-bold text-sm leading-tight mb-2 text-slate-800">{kr.title}</h4>
                       {subKRs.length > 0 && (
                         <div className="mt-3 pt-3 border-t border-slate-100 space-y-1.5">
                           {subKRs.map(subKr => (
                             <div key={subKr.id} className="flex items-center justify-between bg-slate-50 rounded-lg px-2 py-1.5 border border-slate-100 group/sub hover:border-primary-200 transition-all">
                               <div className="flex items-center gap-2 overflow-hidden">
                                 <span className="text-[9px] font-bold bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded uppercase tracking-tighter">{subKr.label}</span>
                                 <span className="text-xs text-slate-600 truncate font-medium">{subKr.title}</span>
                               </div>
                               <div className="flex items-center gap-1 shrink-0">
                                 {canManage && !locked && (
                                   <button onClick={() => setEditingKR(subKr)} className="p-1 text-slate-300 hover:text-primary-500 transition-colors">
                                     <FileText size={12} />
                                   </button>
                                 )}
                                 {canManage && (
                                   <button onClick={() => handleDeleteKR(subKr.id, false)} className="p-1 text-slate-300 hover:text-rose-500 transition-colors">
                                     <Trash2 size={12} />
                                   </button>
                                 )}
                               </div>
                             </div>
                           ))}
                         </div>
                       )}
                       {canManage && !locked && (
                         <button
                           onClick={() => handleAddSubKR(kr, q)}
                           className="mt-3 w-full flex items-center justify-center gap-1 py-2 border border-dashed border-slate-200 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all text-slate-400 hover:bg-slate-50 hover:text-primary-600 hover:border-primary-300"
                         >
                           <Plus size={12} /> Add Sub-KR
                         </button>
                       )}
                     </div>
                   );
                 })}
               </div>


               {/* Removed the old "New KR" button at the bottom as it's now integrated into the slots */}

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
        <BulkUploadModal
          currentUserId={currentUser?.id}
          selectedYear={selectedYear}
          onClose={() => setShowBulkUpload(false)}
          onUploadComplete={fetchKRs}
        />
      )}
    </div>
  );
};