
import React, { useState, useEffect } from 'react';
import { Building2, Plus, Edit2, Trash2, Mail, User as UserIcon, Save, X, AlertTriangle, LoaderCircle } from 'lucide-react';
import { BusinessUnit, User } from '../types';
import { getBusinessUnits, saveBusinessUnits, getRegistryUsers, canManageBusinessUnits, logAudit } from '../utils';
import { supabase } from '../supabaseClient';
import { Select } from './ui/Select';

export const BusinessUnits: React.FC = () => {
  const [units, setUnits] = useState<BusinessUnit[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [tempUnit, setTempUnit] = useState<BusinessUnit | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [canManage, setCanManage] = useState(false);
  const [unitToDelete, setUnitToDelete] = useState<BusinessUnit | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchRegistry = async () => {
    const [allUnits, allUsers, permission] = await Promise.all([
      getBusinessUnits(),
      getRegistryUsers(),
      canManageBusinessUnits()
    ]);
    setUnits(allUnits);
    setUsers(allUsers);
    setCanManage(permission);
  };

  useEffect(() => {
    fetchRegistry();
    const handleUserUpdate = () => getRegistryUsers().then(setUsers);
    window.addEventListener('4COREUserUpdate', handleUserUpdate);
    return () => window.removeEventListener('4COREUserUpdate', handleUserUpdate);
  }, []);

  const startEdit = (unit: BusinessUnit) => {
    if (!canManage) return;
    setEditingId(unit.id);
    setTempUnit({ ...unit });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setTempUnit(null);
    setIsAdding(false);
  };

  const saveEdit = async () => {
    if (!canManage || !tempUnit || !tempUnit.name.trim()) return;
    setIsSubmitting(true);
    try {
      const { error } = await supabase.from('business_units').upsert([tempUnit]);
      if (error) throw error;
      logAudit(isAdding ? 'CREATE' : 'UPDATE', `Organization node synced: ${tempUnit.name}`);
      setEditingId(null);
      setTempUnit(null);
      setIsAdding(false);
      await fetchRegistry();
      window.dispatchEvent(new Event('4COREBUUpdate'));
    } catch (e) {
      alert("Unit synchronization failure.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmDelete = async () => {
    if (!unitToDelete) return;
    setIsSubmitting(true);
    try {
      const { error } = await supabase.from('business_units').delete().eq('id', unitToDelete.id);
      if (error) throw error;
      logAudit('DELETE', `Organization node purged: ${unitToDelete.name}`);
      setUnitToDelete(null);
      await fetchRegistry();
      window.dispatchEvent(new Event('4COREBUUpdate'));
    } catch (e) {
      alert("Purge Protocol Failure.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const startAdd = () => {
    if (!canManage) return;
    const newUnit: BusinessUnit = { id: crypto.randomUUID(), name: '', head_user_id: '', contactEmail: '' };
    setIsAdding(true);
    setEditingId(newUnit.id);
    setTempUnit(newUnit);
  };

  return (
    <div className="space-y-6 animate-scale-in">
      <div className="flex justify-between items-center bg-white/70 backdrop-blur-xl p-8 rounded-[4px] shadow-sm border border-white/20">
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight uppercase">Organization Registry</h2>
          <p className="text-sm text-slate-500 mt-1 font-medium">Manage corporate unit nodes and head assignments</p>
        </div>
        <button onClick={startAdd} disabled={isAdding || editingId !== null || !canManage} className="flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-[4px] text-[11px] font-black uppercase tracking-widest hover:bg-primary-700 transition-all shadow-xl shadow-primary-500/20 disabled:opacity-50"><Plus size={16} /> New Unit</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        {(isAdding && tempUnit) && (
          <div className="bg-white rounded-[4px] p-8 shadow-2xl border-2 border-primary-500 animate-scale-in">
            <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight mb-6">Initialize Unit</h3>
            <div className="space-y-6">
              <input type="text" value={tempUnit.name} onChange={(e) => setTempUnit({ ...tempUnit, name: e.target.value })} className="w-full p-4 bg-slate-50 border rounded-[4px] text-sm font-bold" placeholder="Unit Name" />
              <Select
                label="Assign Unit Head"
                value={tempUnit.head_user_id}
                onChange={(val) => setTempUnit({ ...tempUnit, head_user_id: val as string })}
                options={users.map(u => ({ value: u.id, label: u.name }))}
                placeholder="Assign Unit Head..."
                className="w-full"
              />
              <input type="email" value={tempUnit.contactEmail} onChange={(e) => setTempUnit({ ...tempUnit, contactEmail: e.target.value })} className="w-full p-4 bg-slate-50 border rounded-[4px] text-sm font-bold" placeholder="Contact Email" />
              <div className="flex gap-3 pt-2">
                <button onClick={saveEdit} disabled={isSubmitting} className="flex-1 bg-primary-600 text-white py-4 rounded-[4px] text-[11px] font-black uppercase tracking-widest hover:bg-primary-700 transition-all flex items-center justify-center gap-2">{isSubmitting && <LoaderCircle className="animate-spin" size={14} />} Commit</button>
                <button onClick={cancelEdit} className="flex-1 bg-slate-100 text-slate-500 py-4 rounded-[4px] text-[11px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all">Abort</button>
              </div>
            </div>
          </div>
        )}

        {units.map((unit) => {
          const isEditing = editingId === unit.id;
          const headUser = users.find(u => u.id === (isEditing && tempUnit ? tempUnit.head_user_id : unit.head_user_id));
          return (
            <div key={unit.id} className={`bg-white rounded-[4px] p-8 shadow-sm border border-slate-200 group hover:shadow-xl transition-all ${isEditing ? 'ring-4 ring-primary-500/10 border-primary-500' : ''}`}>
              <div className="flex justify-between items-start mb-6">
                <div className="p-4 bg-slate-950 text-white rounded-[4px] shadow-xl transition-transform group-hover:scale-110"><Building2 size={24} /></div>
                {!isEditing && (
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => startEdit(unit)} className="p-2.5 bg-slate-50 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-[4px] transition-all"><Edit2 size={16} /></button>
                    <button onClick={() => setUnitToDelete(unit)} className="p-2.5 bg-slate-50 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-[4px] transition-all"><Trash2 size={16} /></button>
                  </div>
                )}
              </div>

              {isEditing && tempUnit ? (
                <div className="space-y-4">
                  <input className="w-full font-black text-slate-900 bg-slate-50 border border-slate-200 rounded-[4px] px-4 py-3 text-sm" value={tempUnit.name} onChange={(e) => setTempUnit({ ...tempUnit, name: e.target.value })} />
                  <Select
                    label="Select Head"
                    value={tempUnit.head_user_id}
                    onChange={(val) => setTempUnit({ ...tempUnit, head_user_id: val as string })}
                    options={users.map(u => ({ value: u.id, label: u.name }))}
                    placeholder="Select Head..."
                    className="w-full"
                  />
                  <input className="w-full text-sm text-slate-600 bg-white border border-slate-200 rounded-[4px] px-4 py-3" value={tempUnit.contactEmail} onChange={(e) => setTempUnit({ ...tempUnit, contactEmail: e.target.value })} />
                  <div className="flex gap-3 pt-2">
                    <button onClick={saveEdit} className="flex-1 bg-slate-900 text-white py-3 rounded-[4px] text-[10px] font-black uppercase tracking-widest flex justify-center items-center gap-2"><Save size={14} /> Sync</button>
                    <button onClick={cancelEdit} className="flex-1 bg-slate-100 text-slate-400 py-3 rounded-[4px] text-[10px] font-black uppercase tracking-widest"><X size={14} /></button>
                  </div>
                </div>
              ) : (
                <>
                  <h3 className="text-lg font-black text-slate-800 mb-6 uppercase tracking-tight truncate">{unit.name}</h3>
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <img src={headUser?.avatarUrl || `https://ui-avatars.com/api/?name=${unit.name}&background=f1f5f9&color=94a3b8`} className="w-10 h-10 rounded-[4px] border border-white shadow-sm" alt="" />
                      <div>
                        <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest">Unit Head</p>
                        <p className="text-sm font-bold text-slate-700">{headUser?.name || 'Unassigned'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 pt-4 border-t border-slate-50 text-slate-400">
                      <Mail size={14} className="shrink-0" />
                      <span className="text-[11px] font-bold truncate">{unit.contactEmail || 'No endpoint verified'}</span>
                    </div>
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>

      {unitToDelete && (
        <div className="fixed inset-0 z-[160] flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4 animate-fade-in font-montserrat">
          <div className="bg-white rounded-[4px] shadow-2xl w-full max-w-xl overflow-hidden animate-scale-in border border-slate-100 p-12 text-center">
            <div className="w-20 h-20 bg-rose-50 text-rose-500 rounded-[4px] flex items-center justify-center mx-auto mb-8 shadow-inner"><AlertTriangle size={40} /></div>
            <h3 className="text-2xl font-black text-slate-900 tracking-tight uppercase">Purge Business Unit?</h3>
            <p className="text-slate-500 text-sm mt-4 leading-relaxed">Permanently disconnect <span className="font-black text-slate-900">{unitToDelete.name}</span> from the organization registry? Tactical links remain archived but detached.</p>
            <div className="flex gap-4 w-full mt-10">
              <button onClick={() => setUnitToDelete(null)} className="flex-1 py-5 bg-slate-100 text-slate-500 rounded-[4px] text-[11px] font-black uppercase tracking-widest">Abort</button>
              <button onClick={confirmDelete} disabled={isSubmitting} className="flex-[2] py-5 bg-rose-600 text-white rounded-[4px] text-[11px] font-black uppercase tracking-widest shadow-xl shadow-rose-900/20 active:scale-95 transition-all flex items-center justify-center gap-2">
                {isSubmitting ? <LoaderCircle className="animate-spin" size={16} /> : 'Confirm Purge'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};





