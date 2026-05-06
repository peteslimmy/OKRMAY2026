import React from 'react';
import { Edit2, Trash2, Mail, MoreVertical, X, ShieldCheck } from 'lucide-react';
import { BusinessUnit, User } from '../../types';
import { getAcronym, getRoleLabel, getPlaceholderDesc } from './utils';
import { motion, AnimatePresence } from 'framer-motion';
import { Select } from '../ui/Select';

interface UnitCardProps {
  unit: BusinessUnit;
  users: User[];
  canManage: boolean;
  isEditing: boolean;
  tempUnit: BusinessUnit | null;
  isAdding: boolean;
  openMenuId: string | null;
  isSubmitting: boolean;
  onStartEdit: (unit: BusinessUnit) => void;
  onDelete: (unit: BusinessUnit) => void;
  onTempUnitChange: (unit: BusinessUnit) => void;
  onSave: () => void;
  onCancel: () => void;
  onToggleMenu: (id: string) => void;
}

export const UnitCard: React.FC<UnitCardProps> = ({
  unit,
  users,
  canManage,
  isEditing,
  tempUnit,
  isAdding,
  openMenuId,
  isSubmitting,
  onStartEdit,
  onDelete,
  onTempUnitChange,
  onSave,
  onCancel,
  onToggleMenu,
}) => {
  const headUser = users.find(u => u.id === (isEditing && tempUnit ? tempUnit.head_user_id : unit.head_user_id));
  const acronym = getAcronym(unit.name);
  const desc = getPlaceholderDesc(unit.name);

  if (isEditing && tempUnit) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl p-6 shadow-2xl border-2 border-orange-400 relative group flex flex-col justify-between ring-8 ring-orange-50/50 z-10"
      >
        <div className="flex justify-between items-start mb-6">
          <div className="w-16 h-12 bg-orange-500 text-white rounded-lg flex items-center justify-center font-black text-lg tracking-wider shadow-md">
            {acronym}
          </div>
          <button onClick={onCancel} className="p-2 text-slate-400 hover:text-slate-600 bg-slate-50 rounded-lg transition-colors"><X size={18} /></button>
        </div>
        <div className="space-y-4 flex-1">
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Unit Name</label>
            <input type="text" value={tempUnit.name} onChange={(e) => onTempUnitChange({ ...tempUnit, name: e.target.value })} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-orange-400/20 outline-none transition-all" />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Department Head</label>
            <div className="bg-slate-50 border border-slate-200 rounded-xl focus-within:ring-2 focus-within:ring-orange-400/20 outline-none transition-all overflow-hidden">
              <Select
                value={tempUnit.head_user_id}
                onChange={(val) => onTempUnitChange({ ...tempUnit, head_user_id: val as string })}
                options={users.map(u => ({ value: u.id, label: u.name }))}
                placeholder="Assign Head"
                className="w-full text-xs font-semibold border-0 shadow-none bg-transparent"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Contact Email</label>
            <input type="email" value={tempUnit.contactEmail} onChange={(e) => onTempUnitChange({ ...tempUnit, contactEmail: e.target.value })} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-orange-400/20 outline-none transition-all" placeholder="email@fcis.com" />
          </div>
        </div>
        <div className="pt-6 mt-auto">
          <button onClick={onSave} disabled={isSubmitting} className="w-full bg-orange-500 text-white py-3 rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-orange-500/20 hover:bg-orange-600 active:scale-[0.98] transition-all flex items-center justify-center gap-2">
            {isSubmitting && <span className="animate-spin">⟳</span>} Commit Changes
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      layout
      className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 relative hover:shadow-xl hover:border-orange-100 transition-all duration-300 flex flex-col min-h-[240px] group overflow-hidden"
    >
      <div className="absolute -right-4 -top-4 w-24 h-24 bg-orange-50 rounded-full blur-3xl opacity-50 group-hover:opacity-100 transition-opacity" />

      <div className="flex justify-between items-start mb-6 relative z-10">
        <div className="w-16 h-12 bg-slate-900 text-white rounded-lg flex items-center justify-center font-black text-xl tracking-wider shadow-lg ring-4 ring-slate-50 group-hover:ring-orange-50 transition-all">
          {acronym}
        </div>
        <div className="relative">
          <button
            onClick={(e) => { e.stopPropagation(); onToggleMenu(openMenuId === unit.id ? '' : unit.id); }}
            className="p-2 text-slate-300 hover:text-slate-600 transition-colors rounded-xl hover:bg-slate-50"
          >
            <MoreVertical size={20} className="stroke-[2.5]" />
          </button>

          <AnimatePresence>
            {openMenuId === unit.id && canManage && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: -5 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: -5 }} transition={{ duration: 0.15 }}
                className="absolute right-0 top-full mt-2 w-48 bg-white rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.1)] border border-slate-100 overflow-hidden z-50 py-2"
              >
                <button onClick={() => onStartEdit(unit)} className="w-full text-left px-4 py-3 text-xs font-bold text-slate-600 hover:bg-orange-50 hover:text-orange-600 transition-colors flex items-center gap-3">
                  <Edit2 size={14} /> Edit Profile
                </button>
                <button onClick={() => onDelete(unit)} className="w-full text-left px-4 py-3 text-xs font-bold text-slate-600 hover:bg-rose-50 hover:text-rose-600 transition-colors flex items-center gap-3 border-t border-slate-50">
                  <Trash2 size={14} /> Delete Unit
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="flex-1 relative z-10">
        <div className="flex items-center gap-2 mb-2">
          <ShieldCheck size={14} className="text-emerald-500" />
          <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Verified Unit</span>
        </div>
        <h3 className="text-lg font-black text-slate-900 tracking-tight leading-tight group-hover:text-orange-600 transition-colors">{unit.name}</h3>
        <p className="text-sm text-slate-500 font-medium leading-relaxed mt-2 line-clamp-2 opacity-80">
          {desc}
        </p>
      </div>

      <div className="mt-6 pt-5 border-t border-slate-100 flex items-center justify-between relative z-10">
        <div className="flex items-center gap-3">
          <div className="relative">
            <img src={headUser?.avatarUrl || `https://ui-avatars.com/api/?name=${unit.name}&background=f1f5f9&color=64748b&font-size=0.4`} className="w-11 h-11 rounded-full bg-slate-100 object-cover shrink-0 ring-2 ring-white shadow-sm" alt="Head" />
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold text-slate-900 truncate pr-2 max-w-[140px]">{headUser?.name || 'Unassigned Role'}</p>
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">{headUser ? getRoleLabel(unit.name) : 'Pending'}</p>
          </div>
        </div>
        <a href={`mailto:${unit.contactEmail || ''}`} onClick={e => !unit.contactEmail && e.preventDefault()} title={unit.contactEmail || 'No email assigned'} className={`w-10 h-10 flex items-center justify-center rounded-xl bg-slate-50 border border-slate-200 text-slate-500 transition-all shadow-sm group-hover:bg-orange-400 group-hover:text-white group-hover:border-orange-400 ${unit.contactEmail ? 'cursor-pointer' : 'opacity-50 cursor-not-allowed'}`}>
          <Mail size={18} className="stroke-[2]" />
        </a>
      </div>
    </motion.div>
  );
};