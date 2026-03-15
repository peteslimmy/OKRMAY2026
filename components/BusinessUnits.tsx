import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Building2, Plus, Edit2, Trash2, Mail, User as UserIcon, Save, X, AlertTriangle, LoaderCircle, Users, Activity, Download, MoreVertical, Search, Bell, Network } from 'lucide-react';
import { BusinessUnit, User } from '../types';
import { getBusinessUnits, saveBusinessUnits, getRegistryUsers, canManageBusinessUnits, logAudit } from '../utils';
import { supabase } from '../supabaseClient';
import { Select } from './ui/Select';
import { motion, AnimatePresence } from 'framer-motion';

// --- Helper Functions ---
const getAcronym = (name: string) => {
  const words = name.trim().split(/\s+/);
  if (words.length >= 2) {
    return (words[0][0] + words[words.length - 1][0]).toUpperCase();
  }
  return name.substring(0, 3).toUpperCase();
};

const getRoleLabel = (name: string) => {
  const hash = name.length % 3;
  if (hash === 0) return 'Unit Head';
  if (hash === 1) return 'Division Lead';
  return 'Dept. Manager';
};

const getPlaceholderDesc = (name: string) => {
  const templates = [
    `Strategic division focusing on cross-platform execution and ${name.toLowerCase()} deliverables.`,
    `Validation and continuous governance overseeing global operations for ${name}.`,
    `Core entity managing corporate logistics and execution wing for ${name}.`,
    `Ensuring optimal performance and forecasting for all internal ${name} systems.`
  ];
  return templates[name.length % templates.length];
};

export const BusinessUnits: React.FC = () => {
  const [units, setUnits] = useState<BusinessUnit[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [tempUnit, setTempUnit] = useState<BusinessUnit | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [canManage, setCanManage] = useState(false);
  const [unitToDelete, setUnitToDelete] = useState<BusinessUnit | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

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

    const closeMenu = () => setOpenMenuId(null);
    window.addEventListener('click', closeMenu);
    return () => {
      window.removeEventListener('4COREUserUpdate', handleUserUpdate);
      window.removeEventListener('click', closeMenu);
    }
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
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const totalStaff = users.length;
  // Formatting staff number like "1.2k" for realism based on random value just for demo effect, 
  // but we use actual length if it's small, otherwise map to 'k'
  const staffDisplay = totalStaff >= 1000 ? (totalStaff / 1000).toFixed(1) + 'k' : totalStaff.toString();

  return (
    <div className="h-full min-h-screen bg-[#F8FAFC]">
      <div className="max-w-[1400px] mx-auto p-4 md:p-8 space-y-8 animate-fade-in font-sans">

        {/* Header & Title Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight leading-none mb-2">Corporate Units</h1>
            <p className="text-sm font-medium text-slate-500">Manage organizational hierarchies, department leads, and unit communications.</p>
          </div>
        </div>

        {/* KPI/Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl px-5 py-4 shadow-sm border border-slate-200 flex items-center gap-4">
            <div className="w-11 h-11 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <Network size={18} className="stroke-[2.5]" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Total Units</p>
              <p className="text-xl font-bold text-slate-900 leading-none mt-1">{units.length}</p>
            </div>
          </div>

          <div className="bg-white rounded-xl px-5 py-4 shadow-sm border border-slate-200 flex items-center gap-4">
            <div className="w-11 h-11 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <Users size={18} className="stroke-[2.5]" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Active Staff</p>
              <p className="text-xl font-bold text-slate-900 leading-none mt-1">{staffDisplay}</p>
            </div>
          </div>

          <div className="bg-white rounded-xl px-5 py-4 shadow-sm border border-slate-200 flex items-center gap-4">
            <div className="w-11 h-11 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center shrink-0">
              <Activity size={18} className="stroke-[2.5]" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Pending Reviews</p>
              <p className="text-xl font-bold text-slate-900 leading-none mt-1">08</p>
            </div>
          </div>

          <div className="bg-white rounded-xl px-5 py-4 shadow-sm border border-slate-200 flex items-center gap-4">
            <div className="w-11 h-11 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
              <Download size={18} className="stroke-[2.5]" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Report Status</p>
              <p className="text-sm font-bold text-slate-900 leading-tight mt-1">Sync Completed</p>
            </div>
          </div>

          {/* Floating Add Button acting visually like part of the stats or separate layer but we put it as an extra card block for aesthetics or absolute? The design has it top right. We will float it below the KPIs if no space, but it fits nicely here */}
        </div>

        {/* Subheader / Toolbar */}
        <div className="flex justify-end mb-4">
          <button onClick={startAdd} disabled={isAdding || editingId !== null || !canManage} className="flex items-center gap-2 px-5 py-2.5 bg-[#f97316] text-white rounded-xl text-sm font-bold shadow-md hover:bg-[#ea580c] transition-colors disabled:opacity-50">
            <Plus size={18} className="stroke-[2.5]" /> New Unit
          </button>
        </div>

        {/* Grid of Units */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
          {/* Add/Edit Form Card (Placed first if active) */}
          <AnimatePresence>
            {(isAdding && tempUnit) && (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-xl p-6 shadow-lg border-2 border-orange-500 relative col-span-1 md:col-span-2 xl:col-span-1 xl:row-span-2 self-start ring-4 ring-orange-500/10 z-20">
                <h3 className="text-lg font-bold text-slate-900 mb-5">Initialize New Unit</h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-semibold uppercase tracking-wide text-slate-400 ml-1">Unit Name</label>
                    <input type="text" value={tempUnit.name} onChange={(e) => setTempUnit({ ...tempUnit, name: e.target.value })} className="mt-1 w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-sm font-semibold focus:ring-2 focus:ring-orange-500 focus:bg-white outline-none transition-all" placeholder="e.g. Global Operations" autoFocus />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold uppercase tracking-wide text-slate-400 ml-1">Assign Unit Head</label>
                    <div className="bg-slate-50 border border-slate-200 rounded-lg focus-within:ring-2 focus-within:ring-orange-500 focus-within:bg-white transition-all overflow-hidden">
                      <Select
                        value={tempUnit.head_user_id}
                        onChange={(val) => setTempUnit({ ...tempUnit, head_user_id: val as string })}
                        options={users.map(u => ({ value: u.id, label: u.name }))}
                        placeholder="Select Head..."
                        className="w-full text-sm font-semibold border-0 bg-transparent ring-0 shadow-none focus:ring-0"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-semibold uppercase tracking-wide text-slate-400 ml-1">Contact Email</label>
                    <input type="email" value={tempUnit.contactEmail} onChange={(e) => setTempUnit({ ...tempUnit, contactEmail: e.target.value })} className="mt-1 w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-sm font-semibold focus:ring-2 focus:ring-orange-500 focus:bg-white outline-none transition-all" placeholder="ops@company.com" />
                  </div>
                  <div className="flex gap-3 pt-3 border-t border-slate-100">
                    <button onClick={saveEdit} disabled={isSubmitting} className="flex-1 bg-slate-900 text-white py-2.5 rounded-lg text-xs font-bold shadow-md hover:bg-slate-800 transition-colors flex items-center justify-center gap-2">
                      {isSubmitting && <LoaderCircle className="animate-spin" size={14} />} Commit Entity
                    </button>
                    <button onClick={cancelEdit} className="flex-1 bg-slate-100 text-slate-500 py-2.5 rounded-lg text-xs font-bold hover:bg-slate-200 transition-colors">Discard</button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {units.map((unit) => {
            const isEditing = editingId === unit.id && !isAdding;
            const headUser = users.find(u => u.id === (isEditing && tempUnit ? tempUnit.head_user_id : unit.head_user_id));
            const acronym = getAcronym(unit.name);
            const desc = getPlaceholderDesc(unit.name);

            // Edit state inline for an existing unit card
            if (isEditing && tempUnit) {
              return (
                <div key={unit.id} className="bg-white rounded-[20px] p-6 shadow-lg border-2 border-slate-300 relative group flex flex-col justify-between ring-4 ring-slate-100">
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-14 h-14 bg-slate-900 text-white rounded-2xl flex items-center justify-center font-black text-lg tracking-wider shadow-md">
                      {acronym}
                    </div>
                    <button onClick={cancelEdit} className="p-1.5 text-slate-400 hover:text-slate-600 bg-slate-50 rounded-lg hover:bg-slate-100"><X size={16} /></button>
                  </div>
                  <div className="space-y-4 flex-1">
                    <input type="text" value={tempUnit.name} onChange={(e) => setTempUnit({ ...tempUnit, name: e.target.value })} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold focus:ring-1 focus:ring-orange-500 outline-none" />
                    <div className="bg-slate-50 border border-slate-200 rounded-lg focus-within:ring-1 focus-within:ring-orange-500 outline-none overflow-hidden">
                      <Select
                        value={tempUnit.head_user_id}
                        onChange={(val) => setTempUnit({ ...tempUnit, head_user_id: val as string })}
                        options={users.map(u => ({ value: u.id, label: u.name }))}
                        placeholder="Assign Head"
                        className="w-full text-xs font-semibold border-0 shadow-none bg-transparent"
                      />
                    </div>
                    <input type="email" value={tempUnit.contactEmail} onChange={(e) => setTempUnit({ ...tempUnit, contactEmail: e.target.value })} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-semibold focus:ring-1 focus:ring-orange-500 outline-none" placeholder="Email" />
                  </div>
                  <div className="pt-5 mt-auto">
                    <button onClick={saveEdit} disabled={isSubmitting} className="w-full bg-slate-900 text-white py-2.5 rounded-xl text-xs font-bold shadow-md hover:bg-slate-800 flex items-center justify-center gap-2">
                      {isSubmitting && <LoaderCircle className="animate-spin" size={14} />} Save Details
                    </button>
                  </div>
                </div>
              );
            }

            // Normal View Card
            return (
              <div key={unit.id} className="bg-white rounded-xl p-5 shadow-sm border border-slate-200 relative hover:shadow-md transition-all duration-300 flex flex-col min-h-[220px] group">
                <div className="flex justify-between items-start mb-4">
                  <div className="w-12 h-12 bg-[#111827] text-white rounded-xl flex items-center justify-center font-bold text-base tracking-wide shadow-md">
                    {acronym}
                  </div>
                  <div className="relative">
                    <button
                      onClick={(e) => { e.stopPropagation(); setOpenMenuId(openMenuId === unit.id ? null : unit.id); }}
                      className="p-1.5 text-slate-300 hover:text-slate-600 transition-colors rounded-lg hover:bg-slate-50"
                    >
                      <MoreVertical size={18} className="stroke-[2.5]" />
                    </button>

                    {/* Dropdown Menu */}
                    <AnimatePresence>
                      {openMenuId === unit.id && canManage && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.9, y: -5 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: -5 }} transition={{ duration: 0.15 }}
                          className="absolute right-0 top-full mt-1 w-36 bg-white rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.15)] border border-slate-100 overflow-hidden z-20 py-1"
                        >
                          <button onClick={() => startEdit(unit)} className="w-full text-left px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50 hover:text-orange-600 transition-colors flex items-center gap-2">
                            <Edit2 size={14} /> Edit Profile
                          </button>
                          <button onClick={() => setUnitToDelete(unit)} className="w-full text-left px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-rose-50 hover:text-rose-600 transition-colors flex items-center gap-2 border-t border-slate-50">
                            <Trash2 size={14} /> Delete
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                <div className="flex-1">
                  <h3 className="text-base font-extrabold text-slate-900 tracking-tight leading-tight">{unit.name}</h3>
                  <p className="text-[13px] text-slate-500 font-medium leading-[1.6] mt-2 line-clamp-2">
                    {desc}
                  </p>
                </div>

                <div className="mt-6 pt-5 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img src={headUser?.avatarUrl || `https://ui-avatars.com/api/?name=${unit.name}&background=f1f5f9&color=64748b&font-size=0.4`} className="w-10 h-10 rounded-full bg-slate-100 object-cover shrink-0 ring-2 ring-white shadow-sm" alt="Head" />
                    <div className="min-w-0">
                      <p className="text-[13px] font-bold text-slate-900 truncate pr-2 max-w-[120px]">{headUser?.name || 'Unassigned Role'}</p>
                      <p className="text-[11px] font-semibold text-slate-500">{headUser ? getRoleLabel(unit.name) : 'Pending'}</p>
                    </div>
                  </div>
                  <a href={`mailto:${unit.contactEmail || ''}`} onClick={e => !unit.contactEmail && e.preventDefault()} title={unit.contactEmail || 'No email assigned'} className={`w-9 h-9 flex items-center justify-center rounded-xl bg-slate-50 border border-slate-200 text-slate-500 transition-all shadow-sm ${unit.contactEmail ? 'hover:bg-orange-50 hover:text-orange-600 hover:border-orange-200' : 'opacity-50 cursor-not-allowed'}`}>
                    <Mail size={16} className="stroke-[2]" />
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Global Delete Confirmation Modal */}
      <AnimatePresence>
        {unitToDelete && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[160] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 font-sans">
            <motion.div initial={{ scale: 0.95, y: 10 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 10 }} className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden p-8 text-center relative">
              <button onClick={() => setUnitToDelete(null)} className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors"><X size={18} /></button>
              <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-inner"><AlertTriangle size={32} /></div>
              <h3 className="text-xl font-black text-slate-900 tracking-tight">Remove Unit?</h3>
              <p className="text-slate-500 text-sm mt-3 leading-relaxed px-4">You are about to permanently disconnect <strong className="text-slate-800">{unitToDelete.name}</strong>. This operation cannot be undone.</p>
              <div className="flex gap-3 w-full mt-8">
                <button onClick={() => setUnitToDelete(null)} className="flex-1 py-3.5 bg-slate-100 text-slate-600 rounded-xl text-sm font-bold transition-colors hover:bg-slate-200">Cancel</button>
                <button onClick={confirmDelete} disabled={isSubmitting} className="flex-[1.5] py-3.5 bg-rose-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-rose-600/20 active:scale-95 transition-all flex items-center justify-center gap-2 hover:bg-rose-700">
                  {isSubmitting ? <LoaderCircle className="animate-spin" size={16} /> : 'Delete Organization'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
