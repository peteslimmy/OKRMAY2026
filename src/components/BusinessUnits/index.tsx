import React, { useState, useEffect, useMemo } from 'react';
import { Building2, Network, Users, Target, Download, LayoutGrid, Search, Filter, Plus, Share2 } from 'lucide-react';
import { BusinessUnit, User, UserRole } from '../../types';
import { getBusinessUnits, getRegistryUsers, canManageBusinessUnits, logAudit } from '../../utils';
import { supabase } from '../../lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '../ui/Toast';
import { OrgChart } from '../ui/OrgChart';
import { UnitCard } from './UnitCard';
import { AddUnitForm, DeleteModal } from './FormModals';
import { EmptyStateNoUnits } from '../ui/EmptyState';

export const BusinessUnits: React.FC = () => {
  const { addToast } = useToast();
  const [units, setUnits] = useState<BusinessUnit[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [tempUnit, setTempUnit] = useState<BusinessUnit | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [canManage, setCanManage] = useState(false);
  const [unitToDelete, setUnitToDelete] = useState<BusinessUnit | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'cards' | 'orgchart'>('cards');
  const [searchTerm, setSearchTerm] = useState('');

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
    };
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
      addToast(`Business unit "${tempUnit.name}" saved successfully`, 'success');
    } catch (e) {
      addToast("Failed to save business unit. Please try again.", 'error');
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
      addToast(`Business unit "${unitToDelete.name}" deleted successfully`, 'success');
    } catch (e) {
      addToast("Failed to delete business unit. Please try again.", 'error');
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
  const staffDisplay = totalStaff >= 1000 ? (totalStaff / 1000).toFixed(1) + 'k' : totalStaff.toString();

  const toggleMenu = (id: string) => {
    setOpenMenuId(openMenuId === id ? null : id);
  };

  const filteredUnits = useMemo(() => {
    if (!searchTerm.trim()) return units;
    const term = searchTerm.toLowerCase();
    return units.filter(u => 
      u.name.toLowerCase().includes(term) || 
      u.contactEmail?.toLowerCase().includes(term)
    );
  }, [units, searchTerm]);

  return (
    <div className="min-h-screen bg-[#fbfcfd] font-inter">
      <div className="mx-auto p-6 space-y-8 animate-fade-in">
        
        {/* Header Section */}
        <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-black text-primary-600 uppercase tracking-[0.2em]">
              <Building2 size={14} />
              <span>Organization Architecture</span>
            </div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tighter">Corporate Units</h1>
            <p className="text-slate-500 text-sm font-medium max-w-2xl">
              Centralized governance of organizational hierarchies and department leadership.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
              <button
                onClick={() => setViewMode('cards')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                  viewMode === 'cards' 
                    ? 'bg-white text-primary-600 shadow-sm' 
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <LayoutGrid size={14} /> Cards
              </button>
              <button
                onClick={() => setViewMode('orgchart')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                  viewMode === 'orgchart' 
                    ? 'bg-white text-primary-600 shadow-sm' 
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <Network size={14} /> Org Chart
              </button>
            </div>
            <button 
              onClick={startAdd} 
              disabled={isAdding || editingId !== null || !canManage} 
              className="btn-primary px-6 py-2.5 flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-primary-500/20 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus size={18} /> <span className="hidden sm:inline">New Unit</span>
            </button>
          </div>
        </header>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Total Units', value: units.length, icon: Building2, color: 'bg-blue-50 text-blue-600' },
            { label: 'Active Staff', value: staffDisplay, icon: Users, color: 'bg-emerald-50 text-emerald-600' },
            { label: 'Active Heads', value: units.filter(u => u.head_user_id).length, icon: Target, color: 'bg-orange-50 text-orange-600' },
            { label: 'System Health', value: 'Synced', icon: Share2, color: 'bg-indigo-50 text-indigo-600' },
          ].map((stat, i) => (
            <div key={i} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4 group hover:border-primary-200 transition-all">
              <div className={`w-12 h-12 rounded-xl ${stat.color} flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform`}>
                <stat.icon size={20} />
              </div>
              <div>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{stat.label}</p>
                <p className="text-xl font-black text-slate-900">{stat.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Search units or contacts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500/20 outline-none transition-all shadow-sm"
            />
          </div>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 transition-all shadow-sm">
              <Filter size={14} /> Filters
            </button>
            <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 transition-all shadow-sm">
              <Download size={14} /> Export
            </button>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="relative">
          <AnimatePresence mode="wait">
            {viewMode === 'cards' ? (
              <motion.div 
                key="cards"
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
              >
                {(isAdding && tempUnit) && (
                  <AddUnitForm
                    tempUnit={tempUnit}
                    users={users}
                    isSubmitting={isSubmitting}
                    onTempUnitChange={setTempUnit}
                    onSave={saveEdit}
                    onCancel={cancelEdit}
                  />
                )}

                {filteredUnits.length === 0 && !isAdding && (
                  <div className="col-span-full">
                    <EmptyStateNoUnits onAdd={canManage ? startAdd : undefined} />
                  </div>
                )}

                {filteredUnits.map((unit) => (
                  <UnitCard
                    key={unit.id}
                    unit={unit}
                    users={users}
                    canManage={canManage}
                    isEditing={editingId === unit.id && !isAdding}
                    tempUnit={editingId === unit.id ? tempUnit : null}
                    isAdding={isAdding}
                    openMenuId={openMenuId}
                    isSubmitting={isSubmitting}
                    onStartEdit={startEdit}
                    onDelete={setUnitToDelete}
                    onTempUnitChange={setTempUnit}
                    onSave={saveEdit}
                    onCancel={cancelEdit}
                    onToggleMenu={toggleMenu}
                  />
                ))}
              </motion.div>
            ) : (
              <motion.div 
                key="orgchart"
                initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }}
                className="bg-white rounded-3xl border border-slate-200 shadow-xl p-8 overflow-auto min-h-[600px]"
              >
                <OrgChart
                  businessUnits={units}
                  users={users}
                  onNodeClick={(unit) => {
                    setEditingId(unit.id);
                    setTempUnit(unit);
                  }}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Modals */}
        <AnimatePresence>
          {unitToDelete && (
            <DeleteModal
              unit={unitToDelete}
              isSubmitting={isSubmitting}
              onConfirm={confirmDelete}
              onCancel={() => setUnitToDelete(null)}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};