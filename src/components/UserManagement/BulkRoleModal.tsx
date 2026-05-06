import React from 'react';
import { X, LoaderCircle } from 'lucide-react';
import { Select } from '../ui/Select';
import { UserRole } from '../../types';

interface BulkRoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedUserIds: Set<string>;
  bulkRole: UserRole;
  setBulkRole: (role: UserRole) => void;
  onConfirm: () => void;
  isSubmitting: boolean;
  currentUserRole: UserRole | null;
}

export const BulkRoleModal: React.FC<BulkRoleModalProps> = ({
  isOpen,
  onClose,
  selectedUserIds,
  bulkRole,
  setBulkRole,
  onConfirm,
  isSubmitting,
  currentUserRole,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[130] flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-white rounded-[4px] shadow-2xl w-full max-w-md overflow-hidden animate-scale-in border border-white/20 p-8 text-center">
        <h3 className="text-xl font-black text-slate-900 tracking-tight uppercase mb-2">Bulk Role Assignment</h3>
        <p className="text-slate-500 text-sm mb-6">Updating role for <span className="font-bold text-slate-900">{selectedUserIds.size}</span> selected identities.</p>

        <div className="mb-8 text-left">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">New Role Assignment</label>
          <Select
            value={bulkRole}
            onChange={(val) => setBulkRole(val as UserRole)}
            options={Object.values(UserRole).map(role => ({
              value: role,
              label: role,
              disabled: role === UserRole.SuperAdmin && currentUserRole !== UserRole.SuperAdmin
            })).filter(opt => !opt.disabled)}
            className="w-full"
          />
        </div>

        <div className="flex gap-4">
          <button onClick={onClose} className="flex-1 py-4 bg-slate-100 text-slate-500 rounded-[4px] text-[11px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all">Cancel</button>
          <button onClick={onConfirm} disabled={isSubmitting} className="flex-[2] py-4 bg-slate-900 text-white rounded-[4px] text-[11px] font-black uppercase tracking-widest shadow-xl hover:bg-primary-600 transition-all disabled:opacity-50">
            {isSubmitting ? <LoaderCircle className="w-4 h-4 animate-spin mx-auto" /> : 'Confirm Update'}
          </button>
        </div>
      </div>
    </div>
  );
};
