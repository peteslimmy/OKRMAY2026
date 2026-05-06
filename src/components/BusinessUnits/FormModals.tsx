import React from 'react';
import { LoaderCircle, X, Plus } from 'lucide-react';
import { BusinessUnit, User } from '../../types';
import { motion } from 'framer-motion';
import { Select } from '../ui/Select';

interface AddUnitFormProps {
  tempUnit: BusinessUnit;
  users: User[];
  isSubmitting: boolean;
  onTempUnitChange: (unit: BusinessUnit) => void;
  onSave: () => void;
  onCancel: () => void;
}

export const AddUnitForm: React.FC<AddUnitFormProps> = ({
  tempUnit,
  users,
  isSubmitting,
  onTempUnitChange,
  onSave,
  onCancel,
}) => {
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onTempUnitChange({ ...tempUnit, avatarUrl: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="card p-6 border-2 border-orange-400 bg-white shadow-xl rounded-2xl">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-black text-slate-900 tracking-tight">Initialize New Unit</h3>
        <button onClick={onCancel} className="p-2 text-slate-400 hover:text-slate-600 bg-slate-50 rounded-lg transition-colors"><X size={18} /></button>
      </div>
      <div className="space-y-5">
        <div className="flex items-center gap-4 mb-6">
          <div className="relative group">
            <div className="w-20 h-20 rounded-2xl bg-slate-100 border-2 border-dashed border-slate-300 flex items-center justify-center overflow-hidden relative">
              {tempUnit.avatarUrl ? (
                <img src={tempUnit.avatarUrl} alt="Unit Avatar" className="w-full h-full object-cover" />
              ) : (
                <div className="text-slate-400 text-[10px] font-bold uppercase text-center p-2">No Image</div>
              )}
              <label className="absolute inset-0 flex items-center justify-center bg-black/40 text-white opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
                <Plus size={16} />
                <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
              </label>
            </div>
          </div>
          <div className="flex-1">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Unit Identity</p>
            <p className="text-sm text-slate-500">Upload a representative icon for the business unit</p>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Unit Name</label>
          <input type="text" value={tempUnit.name} onChange={(e) => onTempUnitChange({ ...tempUnit, name: e.target.value })} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-orange-400/20 outline-none transition-all" placeholder="e.g. Global Operations" autoFocus />
        </div>
        <div className="space-y-1.5">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Assign Unit Head</label>
          <div className="bg-slate-50 border border-slate-200 rounded-xl focus-within:ring-2 focus-within:ring-orange-400/20 outline-none transition-all overflow-hidden">
            <Select
              value={tempUnit.head_user_id}
              onChange={(val) => onTempUnitChange({ ...tempUnit, head_user_id: val as string })}
              options={users.map(u => ({ value: u.id, label: u.name }))}
              placeholder="Select Head..."
              className="w-full text-sm font-semibold border-0 bg-transparent ring-0 shadow-none focus:ring-0"
            />
          </div>
        </div>
        <div className="space-y-1.5">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Contact Email</label>
          <input type="email" value={tempUnit.contactEmail} onChange={(e) => onTempUnitChange({ ...tempUnit, contactEmail: e.target.value })} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-orange-400/20 outline-none transition-all" placeholder="ops@company.com" />
        </div>
        <div className="flex gap-3 pt-4 border-t border-slate-100">
          <button onClick={onSave} disabled={isSubmitting} className="flex-1 bg-orange-500 text-white py-3 rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-orange-500/20 hover:bg-orange-600 transition-all flex items-center justify-center gap-2 active:scale-95">
            {isSubmitting && <LoaderCircle className="animate-spin" size={14} />} Commit Entity
          </button>
          <button onClick={onCancel} className="flex-1 bg-slate-100 text-slate-500 py-3 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-slate-200 transition-all active:scale-95">Discard</button>
        </div>
      </div>
    </motion.div>
  );
};

interface DeleteModalProps {
  unit: BusinessUnit | null;
  isSubmitting: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const DeleteModal: React.FC<DeleteModalProps> = ({ unit, isSubmitting, onConfirm, onCancel }) => {
  if (!unit) return null;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[160] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 font-sans">
      <motion.div initial={{ scale: 0.95, y: 10 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 10 }} className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden p-8 text-center relative">
        <button onClick={onCancel} className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors"><X size={18} /></button>
        <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-inner">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
        </div>
        <h3 className="text-xl font-black text-slate-900 tracking-tight">Remove Unit?</h3>
        <p className="text-slate-500 text-sm mt-3 leading-relaxed px-4">You are about to permanently disconnect <strong className="text-slate-800">{unit.name}</strong>. This operation cannot be undone.</p>
        <div className="flex gap-3 w-full mt-8">
          <button onClick={onCancel} className="flex-1 py-3.5 bg-slate-100 text-slate-600 rounded-xl text-sm font-bold transition-colors hover:bg-slate-200">Cancel</button>
          <button onClick={onConfirm} disabled={isSubmitting} className="flex-[1.5] py-3.5 bg-rose-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-rose-600/20 active:scale-95 transition-all flex items-center justify-center gap-2 hover:bg-rose-700">
            {isSubmitting ? <LoaderCircle className="animate-spin" size={16} /> : 'Delete Organization'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};