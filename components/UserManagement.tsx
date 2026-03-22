
import { Search, UserPlus, MoreVertical, Mail, Briefcase, Shield, X, Check, Ban, RefreshCw, FileWarning, Edit2, Trash2, Filter, AlertTriangle, UploadCloud, FileText, Trash, LoaderCircle, KeyRound, Eye, EyeOff, Users, Save, CheckCircle2, AlertCircle, ShieldAlert, UserCheck, LayoutGrid, ListFilter, ChevronDown, Activity, History, Download, DatabaseZap, Plus, Bell, HelpCircle, ShieldCheck, Lock, Unlock } from 'lucide-react';
import React, { useState, useMemo, useEffect } from 'react';
import { getStoredUsers, saveStoredUsers, logAudit, getBusinessUnits, getSessionUser, canManageUsers as checkCanManageUsers, generateLocalUUID, getRegistryUsers, triggerWelcomeEmail, checkPermission, hasPermissionByRole, getUserPermissions } from '../utils';
import { User, UserRole, UserStatus, BusinessUnit, Permission } from '../src/types';
import { supabase, supabaseAdmin } from '../supabaseClient';
import { Select } from './ui/Select';

// Simulation mode for development
const SIMULATE_USER_CREATION = !import.meta.env.PROD;

const simulateUserInsert = async (user: User): Promise<{ success: boolean; error?: any }> => {
  console.log('[SIMULATION] Creating user:', user.email);
  
  // Get existing simulated users
  const storedUsers = localStorage.getItem('simulated_users');
  const existingUsers: User[] = storedUsers ? JSON.parse(storedUsers) : [];
  
  // Check for duplicates
  if (existingUsers.some(u => u.email === user.email)) {
    return { success: false, error: { message: 'User already exists' } };
  }
  
  // Add new user
  existingUsers.push(user);
  localStorage.setItem('simulated_users', JSON.stringify(existingUsers));
  
  console.log('[SIMULATION] User created successfully:', user.email);
  return { success: true };
};

// Generate a secure temporary password
const generateTempPassword = (): string => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$%';
  let password = '';
  for (let i = 0; i < 16; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
};

export const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
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

  // RBAC: Permission states
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

      // RBAC: Load user permissions
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
    
    // RBAC: Check permission
    if (!permAssignRoles) {
      alert("Access Denied: You don't have permission to assign roles.");
      return;
    }
    
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
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      department: '',
      role: UserRole.Viewer,
      avatarUrl: ''
    });
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

    // RBAC: Check create/edit permissions
    if (editingId && !permEditUsers) {
      alert("Access Denied: You don't have permission to edit users.");
      return;
    }
    if (!editingId && !permCreateUsers) {
      alert("Access Denied: You don't have permission to create users.");
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
        const tempPassword = generateTempPassword();
        
        // Step 1: Create auth user via Supabase Admin API
        let authUserId: string | null = null;
        let inviteError: string | null = null;
        
        try {
          console.log('[USER_MGMT] Creating auth user for:', formData.email);
          
          // Use Supabase Admin client if available
          const adminClient = supabaseAdmin;
          
          if (!adminClient) {
            console.warn('[USER_MGMT] Supabase Admin client not configured (missing VITE_SUPABASE_SERVICE_KEY)');
            console.log('[USER_MGMT] Profile will be created without auth user. User cannot login until auth is set up.');
          } else {
            // Use Supabase Admin API to create user
            const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
              email: formData.email,
              password: tempPassword,
              email_confirm: true,
              user_metadata: {
                first_name: formData.firstName,
                last_name: formData.lastName,
                full_name: `${formData.firstName} ${formData.lastName}`
              }
            });
            
            if (authError) {
              console.error('[USER_MGMT] Auth creation error:', authError);
              inviteError = authError.message;
            } else if (authData?.user) {
              authUserId = authData.user.id;
              console.log('[USER_MGMT] Auth user created:', authData.user.id);
            }
          }
        } catch (e: any) {
          console.error('[USER_MGMT] Auth creation exception:', e);
          inviteError = e.message || 'Failed to create auth user';
        }
        
        // Step 2: Create profile record
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
        
        // Try Supabase insert first, fallback to simulation in dev
        let insertSuccess = false;
        let insertError: any = null;
        
        const { error } = await supabase.from('profiles').insert([newUser]);
        
        if (error) {
          console.warn('[USER_MGMT] Supabase insert failed, checking simulation mode:', error.message);
          
          if (SIMULATE_USER_CREATION) {
            const simResult = await simulateUserInsert(newUser);
            if (simResult.success) {
              insertSuccess = true;
              console.log('[USER_MGMT] User created via simulation:', newUser.email);
            } else {
              insertError = simResult.error;
            }
          } else {
            insertError = error;
          }
        } else {
          insertSuccess = true;
        }
        
        if (!insertSuccess && insertError) {
          console.error('[USER_MGMT] Insert error details:', {
            code: insertError.code,
            message: insertError.message,
            details: insertError.details,
            hint: insertError.hint
          });
          
          if (insertError.code === '42501' || insertError.message?.includes('RLS')) {
            throw new Error('Permission Denied: RLS policy prevents insertion. Please run the SQL policies from the terminal.');
          } else if (insertError.code === '23505' || insertError.message?.includes('already exists')) {
            throw new Error('Duplicate Entry: A user with this email already exists.');
          }
          throw insertError;
        }
        
        if (insertSuccess) {
          await logAudit('CREATE', `Initialized identity node: ${newUser.email}`, { targetId: newUser.id, auth_id: newUser.auth_id });
          
          // Show success message with auth status
          if (authUserId) {
            triggerFeedback(`✅ User created: ${newUser.email}. Share temp password with user.`);
            console.log(`[USER_MGMT] Temp password for ${newUser.email}: ${tempPassword}`);
          } else {
            triggerFeedback(`⚠️ Profile created (no auth). Add VITE_SUPABASE_SERVICE_KEY for full user creation.`);
          }
        }
      }
      setIsModalOpen(false);
      resetForm();
      const allUsers = await getRegistryUsers();
      setUsers(allUsers);
    } catch (e: any) {
      console.error("User creation error:", e);
      const errorMessage = e?.message || e?.error_description || JSON.stringify(e) || "Unknown error";
      alert(`Registration Protocol Failure: ${errorMessage}`);
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

      // Check if identityId is a valid UUID format
      const isValidUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(identityId);

      // Check if user exists in database
      const { data: existingProfile } = await supabase.from('profiles').select('id').eq('id', identityId).maybeSingle();
      const userExistsInDB = !!existingProfile;

      if (!isValidUUID) {
        // For legacy non-UUID users, clean up references first then delete
        const cleanupPromises = [
          supabase.from('business_units').update({ head_user_id: null }).eq('head_user_id', identityId),
          supabase.from('key_results').update({ owner_id: 'SYSTEM' }).eq('owner_id', identityId),
          supabase.from('activities').update({ owner_id: 'SYSTEM' }).eq('owner_id', identityId),
          supabase.from('strategic_notes').update({ owner_id: 'SYSTEM' }).eq('owner_id', identityId),
          supabase.from('audit_logs').update({ user_id: 'SYSTEM' }).eq('user_id', identityId)
        ];

        const results = await Promise.all(cleanupPromises);
        const errors = results.filter(r => r.error);
        if (errors.length > 0) {
          console.error('Cleanup errors:', errors);
        }

        // Only try to delete if user exists in database
        if (userExistsInDB) {
          const { error } = await supabase.from('profiles').delete().eq('id', identityId);
          if (error) {
            console.error('Delete error:', error);
            await supabase.from('profiles').update({ status: 'Suspended' }).eq('id', identityId);
            throw new Error(`Legacy user deactivated: ${error.message}`);
          }
        }
      } else {
        // For valid UUIDs, clean up references first
        const cleanupPromises = [
          supabase.from('business_units').update({ head_user_id: null }).eq('head_user_id', identityId),
          supabase.from('key_results').update({ owner_id: 'SYSTEM' }).eq('owner_id', identityId),
          supabase.from('activities').update({ owner_id: 'SYSTEM' }).eq('owner_id', identityId),
          supabase.from('strategic_notes').update({ owner_id: 'SYSTEM' }).eq('owner_id', identityId),
          supabase.from('audit_logs').update({ user_id: 'SYSTEM' }).eq('user_id', identityId)
        ];

        const results = await Promise.all(cleanupPromises);
        const errors = results.filter(r => r.error);
        if (errors.length > 0) {
          console.error('Cleanup errors:', errors);
        }

        // Only try to delete if user exists in database
        if (userExistsInDB) {
          const { error } = await supabase.from('profiles').delete().eq('id', identityId);
          if (error) {
            console.error('Delete error:', error);
            throw error;
          }
        }
      }

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
    <div className="space-y-8 animate-fade-in relative font-inter p-4 lg:p-0">
      {successFeedback && (
        <div className="fixed top-8 left-1/2 -translate-x-1/2 z-[200] animate-slide-up">
          <div className="bg-slate-900 text-white px-8 py-4 rounded-xl shadow-2xl flex items-center gap-3 border border-white/10 backdrop-blur-xl">
            <CheckCircle2 className="text-emerald-500" size={20} />
            <span className="text-[12px] font-black uppercase tracking-widest">{successFeedback}</span>
          </div>
        </div>
      )}

      {/* --- TOP HEADER / BREADCRUMB --- */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-2">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 text-[11px] font-bold text-slate-400 uppercase tracking-widest">
            <span>Organization</span>
            <ChevronDown size={12} className="-rotate-90" />
            <span className="text-primary-500">Identities</span>
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Identity Management</h1>
          <p className="text-slate-500 text-sm font-medium">Directory of all authorized users and system principals.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-500 transition-colors" size={18} />
            <input
              type="text"
              placeholder="Search identities, groups, or roles..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-[360px] pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 placeholder:text-slate-400 focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 outline-none transition-all shadow-sm"
            />
          </div>
          <div className="flex items-center gap-3 pl-6 border-l border-slate-200">
            <button title="Notifications" className="relative p-2.5 bg-white text-slate-400 hover:text-primary-600 rounded-xl transition-all border border-slate-200 shadow-sm transition-all">
              <Bell size={20} />
              <span className="absolute top-2.5 right-2.5 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-white shadow-sm"></span>
            </button>
            <button title="Help Center" className="p-2.5 bg-white text-slate-400 hover:text-slate-800 rounded-xl transition-all border border-slate-200 shadow-sm transition-all">
              <HelpCircle size={20} />
            </button>
            <div className="w-px h-8 bg-slate-200 mx-2"></div>
            {permCreateUsers ? (
              <button
                onClick={() => setIsModalOpen(true)}
                className="flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-primary-500/20 hover:bg-primary-700 transition-all hover:translate-y-[-2px] active:translate-y-0"
              >
                <Plus size={18} /> New Identity
              </button>
            ) : (
              <div className="flex items-center gap-2 px-6 py-3 bg-slate-200 text-slate-400 rounded-xl text-sm font-bold cursor-not-allowed" title="Insufficient permissions: USERS_CREATE required">
                <Lock size={16} /> No Create Access
              </div>
            )}
          </div>
        </div>
      </div>

      {/* --- KPI CARDS --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-card hover:shadow-card-hover transition-all">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-4">Total Identities</p>
          <div className="flex items-end justify-between">
            <h3 className="text-3xl font-black text-slate-900 leading-none tracking-tight">{users.length.toLocaleString()}</h3>
            <span className="badge-success">+12%</span>
          </div>
        </div>

        <div className="card p-6">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-4">Active Now</p>
          <div className="flex items-end justify-between">
            <h3 className="text-3xl font-black text-slate-900 leading-none tracking-tight">
              {users.filter(u => u.status === UserStatus.Active).length}
            </h3>
            <div className="flex -space-x-2">
              {users.slice(0, 3).map((u, i) => (
                <img key={i} src={u.avatarUrl} className="w-8 h-8 rounded-full border-2 border-white object-cover" alt="" />
              ))}
              {users.length > 3 && (
                <div className="w-8 h-8 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-500">
                  +{users.length - 3}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="card p-6">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-4">Pending Review</p>
          <div className="flex items-end justify-between">
            <h3 className="text-3xl font-black text-slate-900 leading-none tracking-tight">0</h3>
            <span className="badge-warning">Action Req.</span>
          </div>
        </div>

        <div className="card p-6">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-4">Suspended</p>
          <div className="flex items-end justify-between">
            <h3 className="text-3xl font-black text-slate-900 leading-none tracking-tight">
              {users.filter(u => u.status !== UserStatus.Active).length}
            </h3>
            <span className="badge-neutral">-2%</span>
          </div>
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="flex flex-col md:flex-row items-center justify-between px-8 py-6 border-b border-slate-100 gap-4">
          <div className="flex items-center gap-3">
            <div className="flex bg-slate-50 p-1 rounded-xl border border-slate-200">
              <button
                onClick={() => setFilterRole('all')}
                className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${filterRole === 'all' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
              >
                All Accounts
              </button>
              <button
                onClick={() => setFilterRole('External')}
                className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${filterRole === 'External' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
              >
                External
              </button>
            </div>
            <button title="Filter Results" className="btn-icon">
              <Filter size={18} />
            </button>
            {selectedUserIds.size > 0 && permAssignRoles && (
              <button onClick={() => setIsBulkModalOpen(true)} className="btn-primary">
                Bulk Role ({selectedUserIds.size})
              </button>
            )}
            {selectedUserIds.size > 0 && !permAssignRoles && (
              <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-[11px] font-bold bg-slate-100 text-slate-400">
                <Lock size={14} /> No Bulk Access
              </div>
            )}
            {permCreateUsers && (
              <button onClick={() => setIsImportModalOpen(true)} className="btn-icon" title="Bulk Provisioning">
                <UploadCloud size={18} />
              </button>
            )}
          </div>

          <div className="flex items-center gap-4">
            <button onClick={() => downloadCsvTemplate()} className="btn-ghost text-sm">
              <Download size={16} /> Export
            </button>
          </div>
        </div>

        <div className="overflow-x-auto min-h-[400px]">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/30">
                <th className="py-5 px-10 text-left">
                  <input
                    type="checkbox"
                    checked={selectedUserIds.size === filteredUsers.length && filteredUsers.length > 0}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedUserIds(new Set(filteredUsers.map(u => u.id)));
                      } else {
                        setSelectedUserIds(new Set());
                      }
                    }}
                    className="w-4 h-4 rounded border-slate-200 accent-primary-500 cursor-pointer"
                  />
                </th>
                <th className="text-left py-5 px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">User Identity</th>
                <th className="text-left py-5 px-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Identifier</th>
                <th className="text-left py-5 px-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Access Status</th>
                <th className="text-left py-5 px-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Role Designation</th>
                <th className="text-left py-5 px-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Last Activity</th>
                <th className="text-right py-5 px-10 text-[10px] font-black text-slate-400 uppercase tracking-widest">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-20 text-center">
                    <div className="flex flex-col items-center gap-3 opacity-20">
                      <Users size={48} />
                      <p className="text-sm font-bold uppercase tracking-widest">No matching identities found</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className={`group hover:bg-slate-50/50 transition-colors ${selectedUserIds.has(user.id) ? 'bg-primary-50/30' : ''}`}>
                    <td className="py-6 px-10">
                      <input
                        type="checkbox"
                        checked={selectedUserIds.has(user.id)}
                        onChange={() => toggleUserSelection(user.id)}
                        className="w-4 h-4 rounded border-slate-200 accent-primary-500 cursor-pointer"
                      />
                    </td>
                    <td className="py-6 px-4">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-slate-100 flex-shrink-0 overflow-hidden ring-2 ring-white shadow-sm">
                          <img src={user.avatarUrl} alt="" className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-900 tracking-tight">{user.name}</p>
                          <p className="text-xs text-slate-400 font-medium">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-6 px-6">
                      <span className="px-2 py-1 bg-slate-100 text-slate-500 text-[10px] font-black rounded-lg border border-slate-200 uppercase">
                        ID-{user.id.slice(0, 5)}
                      </span>
                    </td>
                    <td className="py-6 px-6">
                      <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-bold ${user.status === UserStatus.Active
                        ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                        : user.status === UserStatus.Suspended
                          ? 'bg-rose-50 text-rose-600 border border-rose-100'
                          : 'bg-amber-50 text-amber-600 border border-amber-100'
                        }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${user.status === UserStatus.Active ? 'bg-emerald-500 animate-pulse' : user.status === UserStatus.Suspended ? 'bg-rose-500' : 'bg-amber-500'
                          }`} />
                        {user.status}
                      </div>
                    </td>
                    <td className="py-6 px-6">
                      <p className="text-sm font-bold text-slate-700">{user.role}</p>
                    </td>
                    <td className="py-6 px-6">
                      <p className="text-[11px] font-bold text-slate-400 italic">2 minutes ago</p>
                    </td>
                    <td className="py-6 px-10 text-right">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {permEditUsers && (
                          <button
                            onClick={() => {
                              setEditingId(user.id);
                              setFormData({
                                firstName: user.firstName,
                                lastName: user.lastName,
                                email: user.email,
                                department: user.department,
                                role: user.role,
                                avatarUrl: user.avatarUrl || ''
                              });
                              setIsModalOpen(true);
                            }}
                            className="p-2 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all"
                            title="Edit"
                          >
                            <Edit2 size={16} />
                          </button>
                        )}
                        {permEditUsers && (
                          <button
                            onClick={() => {
                              setUserToModifyStatus(user);
                              setIsSuspending(true);
                            }}
                            className={`p-2 rounded-lg transition-all ${user.status === UserStatus.Active
                              ? 'text-slate-400 hover:text-rose-600 hover:bg-rose-50'
                              : 'text-slate-400 hover:text-emerald-600 hover:bg-emerald-50'
                              }`}
                            title={user.status === UserStatus.Active ? 'Freeze' : 'Restore'}
                          >
                            {user.status === UserStatus.Active ? <Ban size={16} /> : <Check size={16} />}
                          </button>
                        )}
                        {permDeleteUsers && (
                          <button
                            onClick={() => setUserToDelete(user)}
                            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                            title="Purge"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                        {!permEditUsers && (
                          <div className="flex items-center gap-1 text-slate-300">
                            <Lock size={14} />
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Toolbar */}
        <div className="px-10 py-6 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
            Showing <span className="text-slate-900">1</span> to <span className="text-slate-900">{Math.min(filteredUsers.length, 10)}</span> of <span className="text-slate-900">{users.length}</span> identities
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              title="Previous Page"
              className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-slate-900 transition-all disabled:opacity-30 disabled:hover:text-slate-400 shadow-sm"
            >
              <ChevronDown size={16} className="rotate-90" />
            </button>
            <div className="flex items-center gap-1 mx-2">
              <button className="min-w-[40px] h-10 flex items-center justify-center rounded-xl text-xs font-black bg-primary-600 text-white shadow-lg shadow-primary-500/20">1</button>
              <button className="min-w-[40px] h-10 flex items-center justify-center rounded-xl text-xs font-black bg-white text-slate-500 border border-slate-200 hover:border-slate-300">2</button>
              <button className="min-w-[40px] h-10 flex items-center justify-center rounded-xl text-xs font-black bg-white text-slate-500 border border-slate-200 hover:border-slate-300">3</button>
              <span className="text-slate-300 px-1">...</span>
              <button className="min-w-[40px] h-10 flex items-center justify-center rounded-xl text-xs font-black bg-white text-slate-500 border border-slate-200 hover:border-slate-300">129</button>
            </div>
            <button title="Next Page" className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-slate-700 shadow-sm transition-all">
              <ChevronDown size={16} className="-rotate-90" />
            </button>
          </div>
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
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden animate-scale-in border border-white/10">
            <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-white">
              <div>
                <h3 className="font-black text-slate-900 uppercase tracking-tight text-xl leading-none">{editingId ? 'Modify Identity Record' : 'New Identity Provision'}</h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-2">{editingId ? 'Protocol: Registry Update' : 'Protocol: Deployment Authorization'}</p>
              </div>
              <button onClick={() => { setIsModalOpen(false); resetForm(); }} className="p-4 hover:bg-slate-50 rounded-2xl text-slate-300 transition-all hover:text-slate-600"><X size={24} /></button>
            </div>

            <div className="flex flex-col md:flex-row h-full">
              {/* Left Column: Profile & Basics */}
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

              {/* Right Column: Provisioning & Roles */}
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
                onClick={() => { setIsModalOpen(false); resetForm(); }}
                className="px-8 py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveUser}
                disabled={isSubmitting}
                className="flex items-center gap-3 px-10 py-4 rounded-2xl text-[12px] font-black uppercase tracking-[0.1em] bg-slate-900 text-white shadow-xl shadow-slate-900/10 hover:bg-primary-600 hover:shadow-primary-500/20 transition-all hover:translate-y-[-2px] active:translate-y-0 disabled:opacity-50 disabled:translate-y-0"
              >
                {isSubmitting ? <LoaderCircle className="w-5 h-5 animate-spin" /> : <ShieldCheck size={18} />}
                {editingId ? 'Modify Access' : 'Authorize Identity'}
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





