
import { Search, UserPlus, MoreVertical, Mail, Briefcase, Shield, X, Check, Ban, RefreshCw, FileWarning, Edit2, Trash2, Filter, AlertTriangle, UploadCloud, FileText, Trash, LoaderCircle, KeyRound, Eye, EyeOff, Users, Save, CheckCircle2, AlertCircle, ShieldAlert, UserCheck, LayoutGrid, ListFilter, ChevronDown, Activity, History, Download, DatabaseZap } from 'lucide-react';
import React, { useState, useMemo, useEffect } from 'react';
import { getStoredUsers, saveStoredUsers, logAudit, getBusinessUnits, getSessionUser, canManageUsers as checkCanManageUsers, generateLocalUUID, getRegistryUsers, triggerWelcomeEmail } from '../utils';
import { User, UserRole, UserStatus, BusinessUnit } from '../types';
import { supabase } from '../supabaseClient';
import { Select } from './ui/Select';

export const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterDepartment, setFilterDepartment] = useState<string>('all');
  const [showBUHeadsOnly, setShowBUHeadsOnly] = useState(false);
  const [availableBUs, setAvailableBUs] = useState<BusinessUnit[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showTempPassword, setShowTempPassword] = useState(false);
  const [canManageUsers, setCanManageUsers] = useState(false);
  const [successFeedback, setSuccessFeedback] = useState<string | null>(null);

  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [selectedUserIds, setSelectedUserIds] = useState<Set<string>>(new Set());
  const [bulkRole, setBulkRole] = useState<UserRole>(UserRole.Viewer);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    const init = async () => {
      const [allUsers, allBUs, permission, sessionUser] = await Promise.all([
        getRegistryUsers(),
        getBusinessUnits(),
        checkCanManageUsers(),
        getSessionUser()
      ]);
      setUsers(allUsers);
      setAvailableBUs(allBUs);
      setCanManageUsers(permission);
      setCurrentUser(sessionUser);

      const storedHistory = localStorage.getItem('user_search_history');
      if (storedHistory) setSearchHistory(JSON.parse(storedHistory));
    };
    init();

    const handleBUUpdate = () => {
      getBusinessUnits().then(setAvailableBUs);
    };
    const handleUserUpdate = () => {
      getRegistryUsers().then(setUsers);
    };
    window.addEventListener('4COREBUUpdate', handleBUUpdate);
    window.addEventListener('4COREUserUpdate', handleUserUpdate);
    return () => {
      window.removeEventListener('4COREBUUpdate', handleBUUpdate);
      window.removeEventListener('4COREUserUpdate', handleUserUpdate);
    };
  }, []);

  const addToSearchHistory = (term: string) => {
    if (!term.trim()) return;
    const newHistory = [term, ...searchHistory.filter(h => h !== term)].slice(0, 5);
    setSearchHistory(newHistory);
    localStorage.setItem('user_search_history', JSON.stringify(newHistory));
  };

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    if (term.length > 2) addToSearchHistory(term);
  };

  const clearHistory = () => {
    setSearchHistory([]);
    localStorage.removeItem('user_search_history');
  };

  const toggleUserSelection = (userId: string) => {
    const newSelected = new Set(selectedUserIds);
    if (newSelected.has(userId)) newSelected.delete(userId);
    else newSelected.add(userId);
    setSelectedUserIds(newSelected);
  };

  const handleBulkRoleUpdate = async () => {
    if (selectedUserIds.size === 0) return;
    setIsSubmitting(true);
    try {
      const updates = Array.from(selectedUserIds).map(id => ({
        id,
        role: bulkRole
      }));

      // Prevent non-SuperAdmins from promoting to SuperAdmin
      if (bulkRole === UserRole.SuperAdmin && currentUser?.role !== UserRole.SuperAdmin) {
        throw new Error("Privilege Escalation Denied: Only SuperAdmins can promote to SuperAdmin.");
      }

      const { error } = await supabase.from('profiles').upsert(updates);
      if (error) throw error;

      await logAudit('UPDATE', `Bulk role update: ${selectedUserIds.size} users set to ${bulkRole}`);
      triggerFeedback(`Roles updated for ${selectedUserIds.size} identities.`);
      setIsBulkModalOpen(false);
      setSelectedUserIds(new Set());
      const allUsers = await getRegistryUsers();
      setUsers(allUsers);
    } catch (e: any) {
      alert(e.message || "Bulk Update Failure.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const triggerFeedback = (message: string) => {
    setSuccessFeedback(message);
    setTimeout(() => setSuccessFeedback(null), 4000);
  };

  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importCsvData, setImportCsvData] = useState('');
  const [bulkImportResults, setBulkImportResults] = useState<{ success: number, failures: string[] } | null>(null);

  const handleBulkUpload = async () => {
    if (!importCsvData.trim()) return;
    setIsSubmitting(true);
    setBulkImportResults(null);
    const lines = importCsvData.trim().split('\n');
    const newUsers: User[] = [];
    const failures: string[] = [];

    // Header: firstName,lastName,email,role,department
    for (const [index, line] of lines.entries()) {
      const parts = line.split(',').map(p => p.trim());
      if (parts.length < 4) {
        failures.push(`Line ${index + 1}: Insufficient columns`);
        continue;
      }

      const [firstName, lastName, email, roleStr, department] = parts;
      const role = Object.values(UserRole).find(r => r.toLowerCase() === roleStr.toLowerCase()) as UserRole;

      if (!role) {
        failures.push(`Line ${index + 1}: Invalid role ${roleStr}`);
        continue;
      }

      if (role === UserRole.SuperAdmin && currentUser?.role !== UserRole.SuperAdmin) {
        failures.push(`Line ${index + 1}: SuperAdmin privilege escalation denied`);
        continue;
      }

      newUsers.push({
        id: crypto.randomUUID(),
        firstName,
        lastName,
        name: `${firstName} ${lastName}`,
        email,
        role,
        department: department || 'UNASSIGNED',
        status: UserStatus.Active,
        mustChangePassword: true,
        avatarUrl: `https://ui-avatars.com/api/?name=${firstName}+${lastName}&background=f97316&color=fff&size=64&bold=true`
      });
    }

    try {
      if (newUsers.length > 0) {
        const { error } = await supabase.from('profiles').insert(newUsers);
        if (error) throw error;
      }

      setBulkImportResults({ success: newUsers.length, failures });
      if (newUsers.length > 0) {
        await logAudit('IMPORT', `Bulk provisioned ${newUsers.length} identities.`, { successCount: newUsers.length, failCount: failures.length });
        const allUsers = await getRegistryUsers();
        setUsers(allUsers);
      }

      if (failures.length === 0) {
        triggerFeedback(`Registry synchronized: ${newUsers.length} nodes added.`);
        setIsImportModalOpen(false);
        setImportCsvData('');
      }
    } catch (e: any) {
      alert(`Bulk Import Error: ${e.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const downloadCsvTemplate = () => {
    const csvContent = "firstName,lastName,email,role,department\nJohn,Doe,john.doe@fcis.com,Manager,IT\nJane,Smith,jane.smith@fcis.com,Viewer,FINANCE";
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('href', url);
    a.setAttribute('download', 'identity_import_template.csv');
    a.click();
  };

  const handleCsvFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.name.toLowerCase().endsWith('.csv')) {
        alert("Validation Error: Please select a valid .csv file.");
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        setImportCsvData(event.target?.result as string);
        setBulkImportResults(null); // Clear previous results on new file load
      };
      reader.readAsText(file);
    }
  };

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSuspending, setIsSuspending] = useState(false);
  const [userToModifyStatus, setUserToModifyStatus] = useState<User | null>(null);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    department: '',
    role: UserRole.Viewer as UserRole,
    avatarUrl: ''
  });

  const buHeadIds = useMemo(() => {
    return new Set(availableBUs.map(bu => bu.head_user_id).filter(id => id !== undefined));
  }, [availableBUs]);

  const filteredUsers = useMemo(() => {
    let baseList = users.filter(user => showBUHeadsOnly ? buHeadIds.has(user.id) : true);
    if (filterRole !== 'all') baseList = baseList.filter(u => u.role === filterRole);
    if (filterStatus !== 'all') baseList = baseList.filter(u => u.status === filterStatus);
    if (filterDepartment !== 'all') baseList = baseList.filter(u => u.department === filterDepartment);

    // RBAC: Hide SuperAdmins from non-SuperAdmins
    if (currentUser?.role !== UserRole.SuperAdmin) {
      baseList = baseList.filter(u => u.role !== UserRole.SuperAdmin);
    }

    if (!searchTerm.trim()) return baseList.sort((a, b) => a.name.localeCompare(b.name));
    const term = searchTerm.toLowerCase();
    return baseList
      .map(user => {
        let score = 0;
        const name = user.name.toLowerCase();
        const email = user.email.toLowerCase();
        const dept = (user.department || '').toLowerCase();
        if (name === term) score += 1000;
        else if (name.startsWith(term)) score += 500;
        else if (name.includes(term)) score += 100;
        if (email.startsWith(term)) score += 400;
        else if (email.includes(term)) score += 80;
        if (dept.includes(term)) score += 50;
        return { user, score };
      })
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .map(item => item.user);
  }, [users, searchTerm, showBUHeadsOnly, buHeadIds, filterRole, filterStatus, filterDepartment]);

  const resetForm = () => {
    setFormData({ firstName: '', lastName: '', email: '', department: '', role: UserRole.Viewer, avatarUrl: '' });
    setEditingId(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert("Payload Restriction: Files must be under 2MB.");
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        setFormData(prev => ({ ...prev, avatarUrl: event.target?.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveUser = async () => {
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.department) {
      alert("Validation Error: Please fill in all required fields.");
      return;
    }

    // RBAC Check for SuperAdmin creation/modification
    if (formData.role === UserRole.SuperAdmin && currentUser?.role !== UserRole.SuperAdmin) {
      alert("Security Violation: Only SuperAdmins can assign the SuperAdmin role.");
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingId) {
        const oldUser = users.find(u => u.id === editingId);
        const updatedUser = {
          firstName: formData.firstName,
          lastName: formData.lastName,
          name: `${formData.firstName} ${formData.lastName}`,
          email: formData.email,
          department: formData.department,
          role: formData.role,
          avatarUrl: formData.avatarUrl || oldUser?.avatarUrl
        };
        const { error } = await supabase.from('profiles').update(updatedUser).eq('id', editingId);
        if (error) throw error;
        await logAudit('UPDATE', `Modified user identity: ${formData.email}`, { targetId: editingId });
        triggerFeedback("Identity record synchronized.");
      } else {
        const newUser: User = {
          id: crypto.randomUUID(),
          firstName: formData.firstName,
          lastName: formData.lastName,
          name: `${formData.firstName} ${formData.lastName}`,
          email: formData.email,
          role: formData.role,
          department: formData.department,
          avatarUrl: formData.avatarUrl || `https://ui-avatars.com/api/?name=${formData.firstName}+${formData.lastName}&background=f97316&color=fff&size=64&bold=true`,
          status: UserStatus.Active,
          mustChangePassword: true
        };
        const { error } = await supabase.from('profiles').insert([newUser]);
        if (error) throw error;
        await logAudit('CREATE', `Initialized identity node: ${newUser.email}`, { targetId: newUser.id });
        await triggerWelcomeEmail(newUser);
        triggerFeedback(`Node registered. Identity authorized.`);
      }
      setIsModalOpen(false);
      resetForm();
      const allUsers = await getRegistryUsers();
      setUsers(allUsers);
    } catch (e: any) {
      alert("Registration Protocol Failure. Check permissions.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!userToDelete) return;
    const currentSessionUser = await getSessionUser();

    if (userToDelete.role === UserRole.SuperAdmin && currentSessionUser?.role !== UserRole.SuperAdmin) {
      alert("Security Violation: Only SuperAdmins can purge SuperAdmin identities.");
      setUserToDelete(null);
      return;
    }

    if (userToDelete.id === currentSessionUser?.id) {
      alert("Security Refusal: Self-purge is not permitted.");
      setUserToDelete(null);
      return;
    }
    setIsSubmitting(true);
    try {
      // SECURITY PROTOCOL: Unbind identity from all governance nodes before purging
      // This prevents Foreign Key constraint violations for historical data (KRs, Activities, Notes).
      const identityId = userToDelete.id;

      await Promise.all([
        // Unbind from Business Units
        supabase.from('business_units').update({ head_user_id: null }).eq('head_user_id', identityId),

        // Re-assign Key Results to SYSTEM
        supabase.from('key_results').update({ owner_id: 'SYSTEM' }).eq('owner_id', identityId),

        // Re-assign Activities to SYSTEM
        supabase.from('activities').update({ owner_id: 'SYSTEM' }).eq('owner_id', identityId),

        // Re-assign Strategic Notes to SYSTEM
        supabase.from('strategic_notes').update({ owner_id: 'SYSTEM' }).eq('owner_id', identityId)
      ]);

      const { error } = await supabase.from('profiles').delete().eq('id', identityId);
      if (error) throw error;

      await logAudit('DELETE', `Identity node purged: ${userToDelete.email}`, { targetId: identityId });
      triggerFeedback(`Identity ${userToDelete.email} purged from organization registry.`);
      setUserToDelete(null);
      const allUsers = await getRegistryUsers();
      setUsers(allUsers);
    } catch (e: any) {
      console.error("Purge Protocol Critical Failure:", e);
      alert(`Purge Protocol Failure: ${e.message || 'Check database constraints or integrity references.'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStatusChange = async () => {
    if (!userToModifyStatus) return;
    setIsSubmitting(true);
    try {
      const nextStatus = userToModifyStatus.status === UserStatus.Active ? UserStatus.Suspended : UserStatus.Active;
      const { error } = await supabase.from('profiles').update({ status: nextStatus }).eq('id', userToModifyStatus.id);
      if (error) throw error;
      await logAudit('UPDATE', `Access ${nextStatus.toLowerCase()}: ${userToModifyStatus.email}`, { targetId: userToModifyStatus.id });
      triggerFeedback(`Identity node ${nextStatus === UserStatus.Active ? 'restored' : 'frozen'}.`);
      setUserToModifyStatus(null);
      setIsSuspending(false);
      const allUsers = await getRegistryUsers();
      setUsers(allUsers);
    } catch (e) {
      alert("Access protocol update failure.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!canManageUsers) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-slate-400 glass-surface rounded-[4px] border border-white/20 m-8 animate-scale-in shadow-sm">
        <AlertTriangle className="w-16 h-16 mb-4 opacity-20" />
        <h3 className="text-lg font-bold text-slate-900 tracking-tight">Access Restricted</h3>
        <p className="text-sm text-slate-500">Only authorized Admin identities can modify the registry.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-scale-in relative">
      {successFeedback && (
        <div className="fixed top-8 left-1/2 -translate-x-1/2 z-[200] animate-slide-up">
          <div className="bg-slate-900 text-white px-8 py-4 rounded-[4px] shadow-2xl flex items-center gap-3 border border-white/10 backdrop-blur-xl">
            <CheckCircle2 className="text-emerald-500" size={20} />
            <span className="text-[12px] font-black uppercase tracking-widest">{successFeedback}</span>
          </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row items-center justify-between gap-6 bg-white/80 backdrop-blur-xl p-8 rounded-[4px] border border-white/20 shadow-sm">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 bg-slate-900 rounded-[4px] flex items-center justify-center text-white shadow-xl">
            <Users size={32} />
          </div>
          <div>
            <h2 className="text-3xl font-black text-slate-800 tracking-tighter uppercase leading-none">Identity Management</h2>
            <p className="text-xs text-slate-500 mt-1 font-black uppercase tracking-widest flex items-center gap-2">
              <Shield className="w-4 h-4 text-primary-500" /> Administrative Access Node
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => setIsImportModalOpen(true)} className="flex items-center gap-2 px-6 py-4 rounded-[4px] text-[11px] font-black uppercase tracking-widest shadow-xl transition-transform bg-white text-slate-900 border border-slate-200 hover:scale-[1.02] active:scale-[0.98]">
            <UploadCloud size={16} className="text-primary-500" /> Bulk Provisioning
          </button>
          {selectedUserIds.size > 0 && (
            <button onClick={() => setIsBulkModalOpen(true)} className="flex items-center gap-2 px-6 py-4 rounded-[4px] text-[11px] font-black uppercase tracking-widest shadow-xl transition-transform bg-slate-900 text-white shadow-slate-900/20 hover:scale-[1.02] active:scale-[0.98]">
              <Users size={16} /> Bulk Role ({selectedUserIds.size})
            </button>
          )}
          <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 px-8 py-4 rounded-[4px] text-[11px] font-black uppercase tracking-widest shadow-xl transition-transform bg-primary-600 text-white shadow-primary-500/20 hover:scale-[1.02] active:scale-[0.98]"><UserPlus size={16} /> New Identity</button>
        </div>
      </div>

      <div className="bg-white/80 backdrop-blur-2xl p-10 rounded-[4px] shadow-xl border border-white/40">
        <div className="flex flex-col xl:flex-row justify-between items-stretch gap-6 mb-10">
          <div className="flex flex-col md:flex-row items-stretch gap-4 flex-1">
            <div className="relative flex-1 max-w-sm group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input type="text" placeholder="Filter identities..." value={searchTerm} onChange={(e) => handleSearch(e.target.value)} className="w-full pl-11 pr-4 py-4 bg-white border border-slate-200 rounded-[4px] text-xs font-bold outline-none transition-all shadow-sm focus:ring-4 focus:ring-primary-500/10" />
              {searchHistory.length > 0 && !searchTerm && (
                <div className="absolute top-full left-0 w-full mt-2 bg-white border border-slate-100 rounded-[4px] shadow-xl z-50 overflow-hidden hidden group-focus-within:block animate-fade-in">
                  <div className="p-3 border-b border-slate-50 flex justify-between items-center">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Recent Searches</span>
                    <button onClick={clearHistory} className="text-[9px] font-bold text-rose-500 hover:text-rose-600">Clear</button>
                  </div>
                  {searchHistory.map((term, i) => (
                    <button key={i} onMouseDown={() => setSearchTerm(term)} className="w-full text-left px-4 py-3 text-xs font-bold text-slate-600 hover:bg-slate-50 flex items-center gap-2">
                      <History size={12} className="text-slate-300" /> {term}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center bg-white border border-slate-200 rounded-[4px] pl-4 shadow-sm hover:border-slate-300 transition-all">
                <ListFilter size={14} className="text-slate-400" />
                <Select
                  value={filterRole}
                  onChange={(val) => setFilterRole(val as string)}
                  options={[
                    { value: 'all', label: 'All Roles' },
                    ...Object.values(UserRole).map(role => ({ value: role, label: role }))
                  ]}
                  variant="minimal"
                  className="px-2 py-3"
                />
              </div>

              <div className="flex items-center bg-white border border-slate-200 rounded-[4px] pl-4 shadow-sm hover:border-slate-300 transition-all">
                <Activity size={14} className="text-slate-400" />
                <Select
                  value={filterStatus}
                  onChange={(val) => setFilterStatus(val as string)}
                  options={[
                    { value: 'all', label: 'All Statuses' },
                    ...Object.values(UserStatus).map(status => ({ value: status, label: status }))
                  ]}
                  variant="minimal"
                  className="px-2 py-3"
                />
              </div>

              <div className="flex items-center bg-white border border-slate-200 rounded-[4px] pl-4 shadow-sm hover:border-slate-300 transition-all">
                <Briefcase size={14} className="text-slate-400" />
                <Select
                  value={filterDepartment}
                  onChange={(val) => setFilterDepartment(val as string)}
                  options={[
                    { value: 'all', label: 'All Units' },
                    ...availableBUs.map(bu => ({ value: bu.name, label: bu.name }))
                  ]}
                  variant="minimal"
                  className="px-2 py-3"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {filteredUsers.map(user => (
            <div key={user.id} className={`bg-white rounded-[4px] border p-6 shadow-sm hover:shadow-xl transition-all flex flex-col justify-between group animate-scale-in border-b-4 ${selectedUserIds.has(user.id) ? 'border-primary-500 ring-2 ring-primary-500/20' : 'border-slate-200/60 hover:border-b-primary-500'}`}>
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-4">
                  <div className="relative cursor-pointer" onClick={() => toggleUserSelection(user.id)}>
                    <img src={user.avatarUrl} alt={user.name} className={`w-14 h-14 rounded-[4px] object-cover border-2 ${user.status === UserStatus.Active ? 'border-emerald-100' : 'border-rose-100'}`} />
                    <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${user.status === UserStatus.Active ? 'bg-emerald-500' : 'bg-rose-500'}`}></div>
                    {selectedUserIds.has(user.id) && (
                      <div className="absolute inset-0 bg-primary-500/80 rounded-[4px] flex items-center justify-center animate-fade-in">
                        <Check size={24} className="text-white" />
                      </div>
                    )}
                  </div>
                  <div className="overflow-hidden">
                    <h4 className="font-black text-slate-800 text-sm leading-tight uppercase truncate">{user.name}</h4>
                    <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest mt-1 truncate">{user.role}</p>
                  </div>
                </div>
                {canManageUsers && (
                  <button onClick={() => setUserToDelete(user)} className="p-2 text-slate-300 hover:text-rose-600 transition-colors">
                    <Trash2 size={16} />
                  </button>
                )}
              </div>

              <div className="space-y-4 pt-4 border-t border-slate-50 mt-auto">
                <details className="group/details">
                  <summary className="list-none cursor-pointer flex items-center justify-between text-[10px] font-bold text-slate-400 hover:text-slate-600 transition-colors">
                    <span>Contact & Unit</span>
                    <ChevronDown size={12} className="group-open/details:rotate-180 transition-transform" />
                  </summary>
                  <div className="mt-3 space-y-2 animate-slide-up">
                    <div className="flex items-center gap-2 text-[11px] font-medium text-slate-600">
                      <Mail size={12} className="text-slate-300" /> <span className="truncate">{user.email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-[11px] font-medium text-slate-600">
                      <Briefcase size={12} className="text-slate-300" /> <span className="truncate">{user.department}</span>
                    </div>
                  </div>
                </details>

                {canManageUsers && (
                  <div className="flex gap-2 pt-2">
                    <button onClick={() => { setEditingId(user.id); setFormData({ firstName: user.firstName, lastName: user.lastName, email: user.email, department: user.department, role: user.role, password: '' }); setIsModalOpen(true); }} className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-slate-50 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-[4px] transition-all text-[9px] font-black uppercase tracking-widest border border-slate-100">
                      <Edit2 size={12} /> Modify
                    </button>
                    <button onClick={() => { setUserToModifyStatus(user); setIsSuspending(true); }} className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-[4px] transition-all text-[9px] font-black uppercase tracking-widest border ${user.status === UserStatus.Active ? 'bg-rose-50 text-rose-400 border-rose-100 hover:bg-rose-100 hover:text-rose-600' : 'bg-emerald-50 text-emerald-400 border-emerald-100 hover:bg-emerald-100 hover:text-emerald-600'}`}>
                      {user.status === UserStatus.Active ? 'Freeze' : 'Restore'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {isBulkModalOpen && (
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
                  disabled: role === UserRole.SuperAdmin && currentUser?.role !== UserRole.SuperAdmin
                })).filter(opt => !opt.disabled)}
                className="w-full"
              />
            </div>

            <div className="flex gap-4">
              <button onClick={() => setIsBulkModalOpen(false)} className="flex-1 py-4 bg-slate-100 text-slate-500 rounded-[4px] text-[11px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all">Cancel</button>
              <button onClick={handleBulkRoleUpdate} disabled={isSubmitting} className="flex-[2] py-4 bg-slate-900 text-white rounded-[4px] text-[11px] font-black uppercase tracking-widest shadow-xl hover:bg-primary-600 transition-all disabled:opacity-50">
                {isSubmitting ? <LoaderCircle className="w-4 h-4 animate-spin mx-auto" /> : 'Confirm Update'}
              </button>
            </div>
          </div>
        </div>
      )}

      {isImportModalOpen && (
        <div className="fixed inset-0 z-[130] flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white rounded-[4px] shadow-2xl w-full max-w-2xl overflow-hidden animate-scale-in border border-white/20">
            <div className="p-10 border-b border-slate-50 flex justify-between items-center bg-white">
              <div>
                <h3 className="font-black text-slate-900 uppercase tracking-tight text-xl leading-none">Bulk Identity Provisioning</h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-2 italic">Registry Protocol: Recursive Identity injection</p>
              </div>
              <button onClick={() => { setIsImportModalOpen(false); setBulkImportResults(null); }} className="p-3 hover:bg-slate-50 rounded-[4px] text-slate-300 transition-all hover:text-slate-600"><X size={24} /></button>
            </div>

            <div className="p-10 space-y-6">
              <div className="flex justify-between items-center bg-slate-50 p-4 rounded-[4px] border border-slate-100 mb-6">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">CSV Source Selection</label>
                  <p className="text-[11px] text-slate-600 font-bold">Upload a .csv file or paste raw data directly below.</p>
                </div>
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-[4px] text-[10px] font-black uppercase tracking-widest cursor-pointer hover:bg-slate-50 transition-all shadow-sm">
                    <UploadCloud size={14} className="text-primary-500" /> Upload File
                    <input type="file" className="hidden" accept=".csv" onChange={handleCsvFileChange} />
                  </label>
                  <button
                    onClick={downloadCsvTemplate}
                    className="flex items-center gap-2 px-4 py-2.5 bg-primary-50 text-primary-600 rounded-[4px] text-[10px] font-black uppercase tracking-widest hover:bg-primary-100 transition-all"
                  >
                    <Download size={14} /> Template
                  </button>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Payload Manifest (CSV Text)</label>
                {importCsvData && (
                  <button onClick={() => { setImportCsvData(''); setBulkImportResults(null); }} className="text-[9px] font-black text-rose-500 uppercase tracking-widest hover:text-rose-600 flex items-center gap-1">
                    <Trash2 size={12} /> Clear Workspace
                  </button>
                )}
              </div>

              <div className="relative">
                <textarea
                  value={importCsvData}
                  onChange={(e) => setImportCsvData(e.target.value)}
                  placeholder="firstName,lastName,email,role,department&#10;John,Doe,john.doe@fcis.com,Manager,IT"
                  className="w-full h-64 p-6 bg-slate-50 border border-slate-200 rounded-[4px] text-xs font-mono outline-none focus:ring-4 focus:ring-primary-500/10 transition-all resize-none"
                />
                <div className="absolute bottom-4 right-4 text-[9px] font-black text-slate-300 uppercase tracking-widest pointer-events-none">
                  Line Delimited / Comma Separated
                </div>
              </div>

              {bulkImportResults && (
                <div className={`p-6 rounded-[4px] border border-dashed animate-slide-up ${bulkImportResults.failures.length > 0 ? 'bg-amber-50/50 border-amber-200' : 'bg-emerald-50/50 border-emerald-200'}`}>
                  <div className="flex items-center gap-3 mb-3">
                    {bulkImportResults.failures.length > 0 ? <AlertTriangle className="text-amber-500" size={18} /> : <CheckCircle2 className="text-emerald-500" size={18} />}
                    <span className="text-[11px] font-black uppercase tracking-widest text-slate-900">Import Analysis Complete</span>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[11px] font-bold text-slate-600">Successfully Prepared: <span className="text-emerald-600">{bulkImportResults.success} Identities</span></p>
                    {bulkImportResults.failures.length > 0 && (
                      <div className="mt-4">
                        <p className="text-[11px] font-bold text-rose-600 mb-2">Protocol Violations ({bulkImportResults.failures.length}):</p>
                        <div className="max-h-24 overflow-y-auto space-y-1 pr-2 custom-scrollbar">
                          {bulkImportResults.failures.map((f, i) => (
                            <p key={i} className="text-[10px] font-medium text-slate-500 bg-white/50 px-2 py-1 rounded">Critical Error: {f}</p>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="p-10 border-t border-slate-50 bg-slate-50/30 flex justify-end gap-4">
              <button
                onClick={() => { setIsImportModalOpen(false); setBulkImportResults(null); }}
                className="px-8 py-5 rounded-full text-[11px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-colors"
                disabled={isSubmitting}
              >
                Abort Protocol
              </button>
              <button
                onClick={handleBulkUpload}
                disabled={isSubmitting || !importCsvData.trim()}
                className="flex items-center gap-3 px-10 py-5 rounded-full text-[12px] font-black uppercase tracking-[0.1em] bg-slate-900 text-white shadow-2xl hover:bg-primary-600 transition-all disabled:opacity-50"
              >
                {isSubmitting ? <LoaderCircle className="w-5 h-5 animate-spin" /> : <DatabaseZap size={18} />} Execute Batch Injection
              </button>
            </div>
          </div>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-950/40 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white rounded-[4px] shadow-2xl w-full max-w-xl overflow-hidden animate-scale-in border border-white/10">
            <div className="p-10 border-b border-slate-50 flex justify-between items-center bg-white">
              <h3 className="font-black text-slate-900 uppercase tracking-tight text-xl leading-none">{editingId ? 'Modify Identity Record' : 'New Identity Provision'}</h3>
              <button onClick={() => { setIsModalOpen(false); resetForm(); }} className="p-3 hover:bg-slate-50 rounded-[4px] text-slate-300 transition-all hover:text-slate-600"><X size={24} /></button>
            </div>

            <div className="px-10 py-6 bg-slate-50/50 flex flex-col items-center border-b border-slate-100">
              <div className="relative group">
                <div className="w-24 h-24 rounded-2xl bg-white border-2 border-slate-200 overflow-hidden shadow-inner flex items-center justify-center relative">
                  {formData.avatarUrl ? (
                    <img src={formData.avatarUrl} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-slate-300 flex flex-col items-center">
                      <Users size={32} />
                      <span className="text-[8px] font-black uppercase mt-1">No Image</span>
                    </div>
                  )}
                  <label className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center cursor-pointer text-white">
                    <UploadCloud size={20} />
                    <span className="text-[10px] font-black uppercase mt-1 tracking-widest">Update</span>
                    <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                  </label>
                </div>
                {formData.avatarUrl && (
                  <button
                    onClick={() => setFormData(prev => ({ ...prev, avatarUrl: '' }))}
                    className="absolute -top-2 -right-2 w-7 h-7 bg-rose-500 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-rose-600 transition-colors border-2 border-white"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mt-4">Security ID: Node Avatar Binding</p>
            </div>

            <div className="p-10 space-y-8">
              <div className="grid grid-cols-2 gap-6">
                <input type="text" value={formData.firstName} onChange={(e) => setFormData({ ...formData, firstName: e.target.value })} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-[4px] text-sm font-bold" placeholder="First Name" />
                <input type="text" value={formData.lastName} onChange={(e) => setFormData({ ...formData, lastName: e.target.value })} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-[4px] text-sm font-bold" placeholder="Last Name" />
              </div>
              <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-[4px] text-sm font-bold" placeholder="Corporate Endpoint (@fcis.com)" />
              <div className="grid grid-cols-2 gap-6">
                <Select
                  label="Target Unit"
                  value={formData.department}
                  onChange={(val) => setFormData({ ...formData, department: val as string })}
                  options={availableBUs.map(bu => ({ value: bu.name, label: bu.name }))}
                  placeholder="Select Unit"
                  className="w-full"
                />
                <Select
                  label="Access Role"
                  value={formData.role}
                  onChange={(val) => setFormData({ ...formData, role: val as UserRole })}
                  options={Object.values(UserRole).map(role => ({ value: role, label: role }))}
                  className="w-full"
                />
              </div>
              {!editingId && (
                <div className="relative">
                  <input type={showTempPassword ? "text" : "password"} value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} className="w-full p-4 pl-12 bg-slate-50 border border-slate-200 rounded-[4px] text-sm font-bold" placeholder="Temporary Security Key" />
                  <KeyRound size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                  <button type="button" onClick={() => setShowTempPassword(!showTempPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">{showTempPassword ? <EyeOff size={20} /> : <Eye size={20} />}</button>
                </div>
              )}
            </div>
            <div className="p-10 border-t border-slate-50 bg-slate-50/30 flex justify-end">
              <button onClick={handleSaveUser} disabled={isSubmitting} className="flex items-center gap-3 px-10 py-5 rounded-full text-[12px] font-black uppercase tracking-[0.1em] bg-slate-900 text-white shadow-2xl hover:bg-primary-600 transition-all">
                {isSubmitting ? <LoaderCircle className="w-5 h-5 animate-spin" /> : <Save size={18} />} {editingId ? 'Update Record' : 'Authorize Identity'}
              </button>
            </div>
          </div>
        </div>
      )}

      {userToDelete && (
        <div className="fixed inset-0 z-[160] flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4 animate-fade-in font-montserrat">
          <div className="bg-white rounded-[4px] shadow-2xl w-full max-w-xl animate-scale-in border border-slate-100 overflow-hidden">
            <div className="p-12 flex flex-col items-center text-center">
              <div className="w-20 h-20 bg-rose-50 text-rose-500 rounded-[4px] flex items-center justify-center mb-6"><AlertTriangle size={40} /></div>
              <h3 className="text-2xl font-black text-slate-900 tracking-tight uppercase">Purge Identity Node?</h3>
              <p className="text-slate-500 text-sm mt-4 leading-relaxed">Permanently disconnect <span className="font-bold text-slate-900">{userToDelete.email}</span> from the organization cloud? This action is irreversible.</p>
              <div className="flex gap-4 w-full mt-10">
                <button onClick={() => setUserToDelete(null)} className="flex-1 py-4 bg-slate-100 text-slate-500 rounded-[4px] text-[11px] font-black uppercase tracking-widest">Abort</button>
                <button onClick={handleDeleteUser} disabled={isSubmitting} className="flex-[2] py-4 bg-rose-600 text-white rounded-[4px] text-[11px] font-black uppercase tracking-widest shadow-xl shadow-rose-500/20 active:scale-95 transition-all">
                  {isSubmitting ? <LoaderCircle className="w-4 h-4 animate-spin" /> : 'Confirm Purge'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {isSuspending && userToModifyStatus && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white rounded-[4px] shadow-2xl w-full max-w-lg overflow-hidden animate-scale-in border border-white/20 p-12 text-center">
            <h3 className="text-2xl font-black text-slate-900 tracking-tighter uppercase mb-4">{userToModifyStatus.status === UserStatus.Active ? 'Freeze Access Node?' : 'Restore Access Node?'}</h3>
            <p className="text-slate-500 text-sm mb-10">Updating governance status for <span className="font-black text-slate-800">{userToModifyStatus.email}</span>.</p>
            <div className="flex gap-4">
              <button onClick={() => { setIsSuspending(false); setUserToModifyStatus(null); }} className="flex-1 py-5 bg-slate-100 rounded-full text-[11px] font-black uppercase tracking-widest">Abort</button>
              <button onClick={handleStatusChange} disabled={isSubmitting} className={`flex-[2] py-5 text-white rounded-full text-[11px] font-black uppercase tracking-widest transition-all ${userToModifyStatus.status === UserStatus.Active ? 'bg-rose-600 shadow-rose-900/20' : 'bg-emerald-600 shadow-emerald-900/20'}`}>Confirm Change</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};





