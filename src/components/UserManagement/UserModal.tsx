import React from 'react';
import { X, Users, UploadCloud, ShieldCheck, LoaderCircle } from 'lucide-react';
import { Select } from '../ui/Select';
import { UserRole } from '../../types';

interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingId: string | null;
  formData: any;
  setFormData: React.Dispatch<React.SetStateAction<any>>;
  onSave: () => void;
  isSubmitting: boolean;
  availableBUs: any[];
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const UserModal: React.FC<UserModalProps> = ({
  isOpen,
  onClose,
  editingId,
  formData,
  setFormData,
  onSave,
  isSubmitting,
  availableBUs,
  handleFileChange,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-950/40 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden animate-scale-in border border-white/10">
        <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-white">
          <div>
            <h3 className="font-black text-slate-900 uppercase tracking-tight text-xl leading-none">{editingId ? 'Modify Identity Record' : 'New Identity Provision'}</h3>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-2">{editingId ? 'Protocol: Registry Update' : 'Protocol: Deployment Authorization'}</p>
          </div>
          <button onClick={onClose} className="p-4 hover:bg-slate-50 rounded-2xl text-slate-300 transition-all hover:text-slate-600"><X size={24} /></button>
        </div>

        <div className="flex flex-col md:flex-row h-full">
          <div className="flex-1 p-8 space-y-8 bg-slate-50/30">
            <div className="flex flex-col items-center">
              <div className="relative group">
                <div className="w-24 h-24 rounded-3xl bg-white border-2 border-slate-200 overflow-hidden shadow-sm flex items-center justify-center relative transition-all group-hover:border-primary-500 group-hover:shadow-lg group-hover:shadow-primary-500/10">
                  {formData.avatarUrl ? (
                    <img src={formData.avatarUrl} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-slate-300 flex flex-col items-center">
                      <Users size={32} />
                      <span className="text-[8px] font-black uppercase mt-1">Ready</span>
                    </div>
                  )}
                  <label title="Upload Avatar" className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center cursor-pointer text-white">
                    <UploadCloud size={20} />
                    <span className="text-[10px] font-black uppercase mt-1 tracking-widest">Update</span>
                    <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                  </label>
                </div>
              </div>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mt-4">Security ID: Node Avatar Binding</p>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block ml-1">First Name</label>
                  <input type="text" value={formData.firstName} onChange={(e) => setFormData({ ...formData, firstName: e.target.value })} className="w-full p-4 bg-white border border-slate-200 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 outline-none transition-all" placeholder="John" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block ml-1">Last Name</label>
                  <input type="text" value={formData.lastName} onChange={(e) => setFormData({ ...formData, lastName: e.target.value })} className="w-full p-4 bg-white border border-slate-200 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 outline-none transition-all" placeholder="Doe" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block ml-1">Corporate Endpoint</label>
                <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="w-full p-4 bg-white border border-slate-200 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 outline-none transition-all" placeholder="john.doe@novaai.com.ng" />
              </div>
            </div>
          </div>

          <div className="flex-1 p-8 space-y-6 border-l border-slate-100 bg-white">
            <div className="space-y-6">
              <div className="grid grid-cols-1 gap-6">
                <Select
                  label="Target Department"
                  value={formData.department}
                  onChange={(val) => setFormData({ ...formData, department: val as string })}
                  options={availableBUs.map(bu => ({ value: bu.name, label: bu.name }))}
                  placeholder="Select Unit"
                  className="w-full"
                />
                <Select
                  label="Governance Role"
                  value={formData.role}
                  onChange={(val) => setFormData({ ...formData, role: val as UserRole })}
                  options={Object.values(UserRole).map(role => ({ value: role, label: role }))}
                  className="w-full"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="p-8 border-t border-slate-50 bg-slate-50/30 flex justify-end gap-4">
          <button
            onClick={onClose}
            className="px-8 py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onSave}
            disabled={isSubmitting}
            className="flex items-center gap-3 px-10 py-4 rounded-2xl text-[12px] font-black uppercase tracking-[0.1em] bg-slate-900 text-white shadow-xl shadow-slate-900/10 hover:bg-primary-600 hover:shadow-primary-500/20 transition-all hover:translate-y-[-2px] active:translate-y-0 disabled:opacity-50 disabled:translate-y-0"
          >
            {isSubmitting ? <LoaderCircle className="w-5 h-5 animate-spin" /> : <ShieldCheck size={18} />}
            {editingId ? 'Modify Access' : 'Authorize Identity'}
          </button>
        </div>
      </div>
    </div>
  );
};
