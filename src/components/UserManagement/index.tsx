import React, { useState, useMemo, useEffect } from 'react';
import { User, UserRole, UserStatus, BusinessUnit, Permission } from '../../types';
import { getStoredUsers, saveStoredUsers, logAudit, getBusinessUnits, getSessionUser, canManageUsers as checkCanManageUsers, generateLocalUUID, getRegistryUsers, triggerWelcomeEmail, checkPermission, hasPermissionByRole, getUserPermissions } from '../../utils';
import { supabase, supabaseAdmin } from '../../lib/supabase';
import { useToast } from '../ui/Toast';
import { UserHeader } from './UserHeader';
import { UserStats } from './UserStats';
import { UserTable } from './UserTable';
import { UserModal } from './UserModal';
import { BulkRoleModal } from './BulkRoleModal';
import { ImportModal } from './ImportModal';
import { AlertTriangle, CheckCircle2, LoaderCircle } from 'lucide-react';
import { ChevronDown } from 'lucide-react';

const SIMULATE_USER_CREATION = !import.meta.env.PROD;

const simulateUserInsert = async (user: User): Promise<{ success: boolean; error?: any }> => {
  const storedUsers = localStorage.getItem('simulated_users');
  const existingUsers: User[] = storedUsers ? JSON.parse(storedUsers) : [];
  if (existingUsers.some(u => u.email === user.email)) {
    return { success: false, error: { message: 'User already exists' } };
  }
  existingUsers.push(user);
  localStorage.setItem('simulated_users', JSON.stringify(existingUsers));
  return { success: true };
};

const generateTempPassword = (): string => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$%';
  let password = '';
  for (let i = 0; i < 16; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
};

export const UserManagement: React.FC = () => {
  const { addToast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterDepartment, setFilterDepartment] = useState<string>('all');
  const [showBUHeadsOnly, setShowBUHeadsOnly] = useState(false);
  const [availableBUs, setAvailableBUs] = useState<BusinessUnit[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [canManageUsers, setCanManageUsers] = useState(false);
  const [successFeedback, setSuccessFeedback] = useState<string | null>(null);
  const [advancedFilters, setAdvancedFilters] = useState<Record<string, any>>({});
  const [userPermissions, setUserPermissions] = useState<Permission[]>([]);
  const [permViewUsers, setPermViewUsers] = useState(false);
  const [permCreateUsers, setPermCreateUsers] = useState(false);
  const [permEditUsers, setPermEditUsers] = useState(false);
  const [permDeleteUsers, setPermDeleteUsers] = useState(false);
  const [permAssignRoles, setPermAssignRoles] = useState(false);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [selectedUserIds, setSelectedUserIds] = useState<Set<string>>(new Set());
  const [bulkRole, setBulkRole] = useState<UserRole>(UserRole.Viewer);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importCsvData, setImportCsvData] = useState('');
  const [bulkImportResults, setBulkImportResults] = useState<{ success: number, failures: string[] } | null>(null);
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

  useEffect(() => {
    const init = async () => {
      const sessionUser = await getSessionUser();
      const [allUsers, allBUs, permission] = await Promise.all([
        getRegistryUsers(),
        getBusinessUnits(),
        checkCanManageUsers()
      ]);
      setUsers(allUsers);
      setAvailableBUs(allBUs);
      setCanManageUsers(permission);
      setCurrentUser(sessionUser);
      setIsLoading(false);

      if (sessionUser) {
        const perms = getUserPermissions(sessionUser.role);
        setUserPermissions(perms);
        setPermViewUsers(hasPermissionByRole(sessionUser.role, Permission.USERS_VIEW));
        setPermCreateUsers(hasPermissionByRole(sessionUser.role, Permission.USERS_CREATE));
        setPermEditUsers(hasPermissionByRole(sessionUser.role, Permission.USERS_EDIT));
        setPermDeleteUsers(hasPermissionByRole(sessionUser.role, Permission.USERS_DELETE));
        setPermAssignRoles(hasPermissionByRole(sessionUser.role, Permission.USERS_ASSIGN_ROLE));
      }
      const storedHistory = localStorage.getItem('user_search_history');
      if (storedHistory) setSearchHistory(JSON.parse(storedHistory));
    };
    init();

    const handleBUUpdate = () => getBusinessUnits().then(setAvailableBUs);
    const handleUserUpdate = () => getRegistryUsers().then(setUsers);
    window.addEventListener('4COREBUUpdate', handleBUUpdate);
    window.addEventListener('4COREUserUpdate', handleUserUpdate);
    return () => {
      window.removeEventListener('4COREBUUpdate', handleBUUpdate);
      window.removeEventListener('4COREUserUpdate', handleUserUpdate);
    };
  }, []);

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    if (term.length > 2) {
      const newHistory = [term, ...searchHistory.filter(h => h !== term)].slice(0, 5);
      setSearchHistory(newHistory);
      localStorage.setItem('user_search_history', JSON.stringify(newHistory));
    }
  };

  const triggerFeedback = (message: string, type: 'success' | 'error' | 'warning' = 'success') => {
    addToast(message, type);
  };

  const handleBulkRoleUpdate = async () => {
    if (selectedUserIds.size === 0) return;
    if (!permAssignRoles) {
      alert("Access Denied: You don't have permission to assign roles.");
      return;
    }
    setIsSubmitting(true);
    try {
      const updates = Array.from(selectedUserIds).map(id => ({ id, role: bulkRole }));
      if (bulkRole === UserRole.SuperAdmin && currentUser?.role !== UserRole.SuperAdmin) {
        throw new Error("Privilege Escalation Denied: Only SuperAdmins can promote to SuperAdmin.");
      }
      const { error } = await supabase.from('profiles').upsert(updates);
      if (error) throw error;
      await logAudit('UPDATE', `Bulk role update: ${selectedUserIds.size} users set to ${bulkRole}`);
      triggerFeedback(`Roles updated for ${selectedUserIds.size} identities.`);
      setIsBulkModalOpen(false);
      setSelectedUserIds(new Set());
      setUsers(await getRegistryUsers());
    } catch (e: any) {
      alert(e.message || "Bulk Update Failure.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBulkUpload = async () => {
    if (!importCsvData.trim()) return;
    setIsSubmitting(true);
    setBulkImportResults(null);
    const lines = importCsvData.trim().split('\n');
    const newUsers: User[] = [];
    const failures: string[] = [];
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
        setUsers(await getRegistryUsers());
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
        setBulkImportResults(null);
      };
      reader.readAsText(file);
    }
  };

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
    if (editingId && !permEditUsers) {
      alert("Access Denied: You don't have permission to edit users.");
      return;
    }
    if (!editingId && !permCreateUsers) {
      alert("Access Denied: You don't have permission to create users.");
      return;
    }
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
        const tempPassword = generateTempPassword();
        let authUserId: string | null = null;
        try {
          const adminClient = supabaseAdmin;
          if (adminClient) {
            const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
              email: formData.email,
              password: tempPassword,
              email_confirm: true,
              user_metadata: { first_name: formData.firstName, last_name: formData.lastName, full_name: `${formData.firstName} ${formData.lastName}` }
            });
            if (authError) console.error('[USER_MGMT] Auth creation error:', authError);
            else if (authData?.user) authUserId = authData.user.id;
          }
        } catch (e: any) {
          console.error('[USER_MGMT] Auth creation exception:', e);
        }
        const newUser: User = {
          id: authUserId || crypto.randomUUID(),
          auth_id: authUserId || undefined,
          firstName: formData.firstName,
          lastName: formData.lastName,
          name: `${formData.firstName} ${formData.lastName}`,
          email: formData.email,
          role: formData.role,
          department: formData.department,
          avatarUrl: formData.avatarUrl || `https://ui-avatars.com/api/?name=${formData.firstName}+${formData.lastName}&background=f97316&color=fff&size=64&bold=true`,
          status: UserStatus.Active,
          mustChangePassword: true,
        };
        let insertSuccess = false;
        const { error } = await supabase.from('profiles').insert([newUser]);
        if (error) {
          if (SIMULATE_USER_CREATION) {
            const simResult = await simulateUserInsert(newUser);
            if (simResult.success) insertSuccess = true;
          }
        } else {
          insertSuccess = true;
        }
        if (!insertSuccess) throw new Error('Insert failed');
        await logAudit('CREATE', `Initialized identity node: ${newUser.email}`, { targetId: newUser.id, auth_id: newUser.auth_id });
        triggerFeedback(authUserId ? `✅ User created: ${newUser.email}. Share temp password with user.` : `⚠️ Profile created (no auth). Add VITE_SUPABASE_SERVICE_KEY for full user creation.`);
      }
      setIsModalOpen(false);
      resetForm();
      setUsers(await getRegistryUsers());
    } catch (e: any) {
      alert(`Registration Protocol Failure: ${e.message}`);
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
      const identityId = userToDelete.id;
      const cleanupPromises = [
        supabase.from('business_units').update({ head_user_id: null }).eq('head_user_id', identityId),
        supabase.from('key_results').update({ owner_id: 'SYSTEM' }).eq('owner_id', identityId),
        supabase.from('activities').update({ owner_id: 'SYSTEM' }).eq('owner_id', identityId),
        supabase.from('strategic_notes').update({ owner_id: 'SYSTEM' }).eq('owner_id', identityId),
        supabase.from('audit_logs').update({ user_id: 'SYSTEM' }).eq('user_id', identityId)
      ];
      await Promise.all(cleanupPromises);
      const { error } = await supabase.from('profiles').delete().eq('id', identityId);
      if (error) throw error;
      await logAudit('DELETE', `Identity node purged: ${userToDelete.email}`, { targetId: identityId });
      triggerFeedback(`Identity ${userToDelete.email} purged from organization registry.`);
      setUserToDelete(null);
      setUsers(await getRegistryUsers());
    } catch (e: any) {
      alert(`Purge Protocol Failure: ${e.message}`);
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
      setUsers(await getRegistryUsers());
    } catch (e) {
      alert("Access protocol update failure.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const buHeadIds = useMemo(() => new Set(availableBUs.map(bu => bu.head_user_id).filter(id => id !== undefined)), [availableBUs]);

  const filteredUsers = useMemo(() => {
    let baseList = users.filter(user => showBUHeadsOnly ? buHeadIds.has(user.id) : true);
    if (filterRole !== 'all') baseList = baseList.filter(u => u.role === filterRole);
    if (filterStatus !== 'all') baseList = baseList.filter(u => u.status === filterStatus);
    if (filterDepartment !== 'all') baseList = baseList.filter(u => u.department === filterDepartment);
    if (advancedFilters.status) baseList = baseList.filter(u => u.status === advancedFilters.status);
    if (advancedFilters.role) baseList = baseList.filter(u => u.role === advancedFilters.role);
    if (advancedFilters.department) baseList = baseList.filter(u => u.department === advancedFilters.department);
    if (currentUser?.role !== UserRole.SuperAdmin) baseList = baseList.filter(u => u.role !== UserRole.SuperAdmin);
    if (!searchTerm.trim()) return baseList.sort((a, b) => a.name.localeCompare(b.name));
    const term = searchTerm.toLowerCase();
    return baseList
      .map(user => {
        let score = 0;
        const name = user.name.toLowerCase();
        const email = user.email.toLowerCase();
        const dept = (user.department || '').toLowerCase();
        if (name === term) score += 1000; else if (name.startsWith(term)) score += 500; else if (name.includes(term)) score += 100;
        if (email.startsWith(term)) score += 400; else if (email.includes(term)) score += 80;
        if (dept.includes(term)) score += 50;
        return { user, score };
      })
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .map(item => item.user);
  }, [users, searchTerm, showBUHeadsOnly, buHeadIds, filterRole, filterStatus, filterDepartment, advancedFilters, currentUser?.role]);

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
    <div className="space-y-8 animate-fade-in relative font-inter p-4 lg:p-0">
      {successFeedback && (
        <div className="fixed top-8 left-1/2 -translate-x-1/2 z-[200] animate-slide-up">
          <div className="bg-slate-900 text-white px-8 py-4 rounded-xl shadow-2xl flex items-center gap-3 border border-white/10 backdrop-blur-xl">
            <CheckCircle2 className="text-emerald-500" size={20} />
            <span className="text-[12px] font-black uppercase tracking-widest">{successFeedback}</span>
          </div>
        </div>
      )}

      <UserHeader 
        searchTerm={searchTerm} 
        handleSearch={handleSearch} 
        permCreateUsers={permCreateUsers} 
        onNewIdentityClick={() => { resetForm(); setIsModalOpen(true); }} 
      />

      <UserStats users={users} />

      <UserTable 
        users={users}
        isLoading={isLoading}
        searchTerm={searchTerm}
        filteredUsers={filteredUsers}
        selectedUserIds={selectedUserIds}
        setSelectedUserIds={setSelectedUserIds}
        toggleUserSelection={(id) => {
          const newSelected = new Set(selectedUserIds);
          if (newSelected.has(id)) newSelected.delete(id); else newSelected.add(id);
          setSelectedUserIds(newSelected);
        }}
        onEditUser={(user) => {
          setEditingId(user.id);
          setFormData({ firstName: user.firstName, lastName: user.lastName, email: user.email, department: user.department, role: user.role, avatarUrl: user.avatarUrl || '' });
          setIsModalOpen(true);
        }}
        onToggleUserStatus={(user) => { setUserToModifyStatus(user); setIsSuspending(true); }}
        onDeleteUser={setUserToDelete}
        permAssignRoles={permAssignRoles}
        permCreateUsers={permCreateUsers}
        permEditUsers={permEditUsers}
        permDeleteUsers={permDeleteUsers}
        onBulkRoleUpdateClick={() => setIsBulkModalOpen(true)}
        onImportClick={() => setIsImportModalOpen(true)}
        onExportClick={() => {}} // Export logic
        advancedFilters={advancedFilters}
        setAdvancedFilters={setAdvancedFilters}
        availableBUs={availableBUs}
      />

      <div className="px-10 py-6 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
        {filteredUsers.length > 0 && (
          <>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              Showing <span className="text-slate-900">{((currentPage - 1) * itemsPerPage) + 1}</span> to <span className="text-slate-900">{Math.min(currentPage * itemsPerPage, filteredUsers.length)}</span> of <span className="text-slate-900">{filteredUsers.length}</span> identities
            </p>
            <div className="flex items-center gap-1">
              <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-slate-900 transition-all disabled:opacity-30 disabled:hover:text-slate-400 shadow-sm"><ChevronDown size={16} className="rotate-90" /></button>
              <div className="flex items-center gap-1 mx-2">
                {Array.from({ length: Math.ceil(filteredUsers.length / itemsPerPage) }, (_, i) => i + 1).slice(0, 5).map(page => (
                  <button key={page} onClick={() => setCurrentPage(page)} className={`min-w-[40px] h-10 flex items-center justify-center rounded-xl text-xs font-black transition-all ${currentPage === page ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/20' : 'bg-white text-slate-500 border border-slate-200 hover:border-slate-300'}`}>{page}</button>
                ))}
              </div>
              <button onClick={() => setCurrentPage(p => Math.min(Math.ceil(filteredUsers.length / itemsPerPage), p + 1))} disabled={currentPage >= Math.ceil(filteredUsers.length / itemsPerPage)} className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-slate-700 shadow-sm transition-all disabled:opacity-30"><ChevronDown size={16} className="-rotate-90" /></button>
            </div>
          </>
        )}
      </div>

      <BulkRoleModal 
        isOpen={isBulkModalOpen} 
        onClose={() => setIsBulkModalOpen(false)} 
        selectedUserIds={selectedUserIds} 
        bulkRole={bulkRole} 
        setBulkRole={setBulkRole} 
        onConfirm={handleBulkRoleUpdate} 
        isSubmitting={isSubmitting} 
        currentUserRole={currentUser?.role} 
      />

      <ImportModal 
        isOpen={isImportModalOpen} 
        onClose={() => { setIsImportModalOpen(false); setBulkImportResults(null); }} 
        importCsvData={importCsvData} 
        setImportCsvData={setImportCsvData} 
        bulkImportResults={bulkImportResults} 
        onBulkUpload={handleBulkUpload} 
        onDownloadTemplate={downloadCsvTemplate} 
        onFileChange={handleCsvFileChange} 
        isSubmitting={isSubmitting} 
      />

      <UserModal 
        isOpen={isModalOpen} 
        onClose={() => { setIsModalOpen(false); resetForm(); }} 
        editingId={editingId} 
        formData={formData} 
        setFormData={setFormData} 
        onSave={handleSaveUser} 
        isSubmitting={isSubmitting} 
        availableBUs={availableBUs} 
        handleFileChange={handleFileChange} 
      />

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
