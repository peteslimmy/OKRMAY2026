import React from 'react';
import { Target, Plus, Trash2, FileText, Lock, AlertTriangle, X } from 'lucide-react';
import { KeyResult } from '../../types';

interface QuarterColumnProps {
  quarter: string;
  krs: KeyResult[];
  selectedYear: number;
  currentQuarterLabel: string;
  currentYear: number;
  currentUserId: string | undefined;
  canManage: boolean;
  locked: boolean;
  isCurrentQuarter: boolean;
  canOverride: boolean;
  onToggleLock: () => void;
  onEditKR: (kr: KeyResult) => void;
  onDeleteKR: (id: string, isParent: boolean) => void;
  onAddSubKR: (parentKR: KeyResult) => void;
  onAddNewKR: () => void;
}

export const QuarterColumn: React.FC<QuarterColumnProps> = ({
  quarter,
  krs,
  canManage,
  locked,
  isCurrentQuarter,
  canOverride,
  onToggleLock,
  onEditKR,
  onDeleteKR,
  onAddSubKR,
  onAddNewKR,
}) => {
  const parentKRs = krs.filter(kr => !kr.parent_kr_id);
  const maxReached = parentKRs.length >= 4;

  return (
    <div className="flex flex-col rounded-xl border bg-slate-50 border-slate-200 p-4 min-h-[480px]">
      <div className="flex justify-between items-center mb-4">
        <span className="text-base font-bold text-slate-800">{quarter}</span>
        <div className="flex items-center gap-2">
          {canOverride && (
            <button
              onClick={onToggleLock}
              className={`p-1.5 rounded-lg transition-all border ${locked ? 'bg-slate-100 text-slate-500 border-slate-200 hover:bg-white hover:text-emerald-600' : 'bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-100'}`}
              title={locked ? "Manually Unlock" : "Manually Lock"}
            >
              {locked ? <Lock size={12} /> : <Target size={12} />}
            </button>
          )}
          {!canOverride && locked && <Lock size={12} className="text-slate-400" />}
          <span className="text-xs font-semibold text-slate-400 uppercase">{parentKRs.length}/4 OBJECTIVES</span>
        </div>
      </div>
      <div className="space-y-3 flex-1">
        {parentKRs.map(kr => {
          const subKRs = krs.filter(sk => sk.parent_kr_id === kr.id).sort((a, b) => a.label.localeCompare(b.label));
          return (
            <div key={kr.id} className={`group bg-white rounded-lg border border-slate-200 p-4 shadow-sm transition-all hover:shadow-md ${locked ? 'opacity-80' : 'hover:border-primary-400'}`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold bg-primary-100 text-primary-700 px-2 py-1 rounded uppercase tracking-wide">{kr.label}</span>
                <div className="flex items-center gap-1">
                  {canManage && !locked && (
                    <button onClick={() => onEditKR(kr)} aria-label="Edit KR" title="Edit KR" className="p-1 text-slate-300 hover:text-primary-500">
                      <FileText size={12} />
                    </button>
                  )}
                  {locked ? (
                    <div className="p-1 text-slate-300"><Lock size={12} /></div>
                  ) : canManage ? (
                    <button onClick={() => onDeleteKR(kr.id, true)} aria-label="Delete KR" title="Delete KR & Sub-KRs" className="p-1 text-slate-300 hover:text-rose-500"><Trash2 size={12} /></button>
                  ) : null}
                </div>
              </div>
              <h4 className="font-semibold text-sm leading-tight mb-2 text-slate-800">{kr.title}</h4>
              {subKRs.length > 0 && (
                <div className="mt-3 pt-3 border-t border-slate-100 space-y-1.5">
                  {subKRs.map(subKr => (
                    <div key={subKr.id} className="flex items-center justify-between bg-slate-50 rounded px-2 py-1.5">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-semibold bg-amber-50 text-amber-600 px-1.5 py-0.5 rounded">{subKr.label}</span>
                        <span className="text-xs text-slate-600">{subKr.title}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        {canManage && !locked && (
                          <button onClick={() => onEditKR(subKr)} className="p-0.5 text-slate-300 hover:text-primary-500">
                            <FileText size={10} />
                          </button>
                        )}
                        {canManage && (
                          <button onClick={() => onDeleteKR(subKr.id, false)} className="p-0.5 text-slate-300 hover:text-rose-500">
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
                  onClick={() => onAddSubKR(kr)}
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
        onClick={onAddNewKR}
        disabled={locked || maxReached || !canManage}
        className={`mt-4 w-full flex items-center justify-center gap-2 py-2.5 border border-dashed border-slate-200 rounded-lg text-xs font-semibold uppercase tracking-wide transition-all ${locked || maxReached || !canManage ? 'opacity-50 cursor-not-allowed bg-slate-50 text-slate-300' : 'text-slate-500 hover:bg-white hover:text-primary-600'}`}
      >
        {locked ? <Lock size={14} /> : <Plus size={14} />} {locked ? 'Locked' : maxReached ? 'Max 4 KRs' : 'New KR Slot'}
      </button>
    </div>
  );
};