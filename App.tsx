
import React, { useState, useEffect, useMemo } from 'react';
import { HashRouter as Router, Routes, Route, NavLink, Navigate } from 'react-router-dom';
import {
  LayoutDashboard, FileText, Target, Users, Settings as SettingsIcon, LogOut, Menu, X, Zap, CalendarDays, Building2, Briefcase, ShieldAlert, ChevronDown, ShieldCheck, Database, ShieldCheck as ShieldIcon, LoaderCircle, AlertTriangle, Fingerprint, Lock, ArrowRight, Mail, KeyRound, Eye, EyeOff, Globe, MessageSquare, ImageIcon, LogIn, Shield, Clock, Check, ShieldEllipsis, ShieldX, Sparkles, Droplets, CheckCircle2, ChevronLeft, ChevronRight, UserCircle2, UserCheck, Save
} from 'lucide-react';
import { Dashboard } from './components/Dashboard';
import { ReportingEngine } from './components/ReportingEngine';
import { StrategicBoard } from './components/StrategicBoard';
import { BusinessObjectives } from './components/BusinessObjectives';
import { Settings } from './components/Settings';
import { BusinessUnits } from './components/BusinessUnits';
import { UserManagement } from './components/UserManagement';
import { IntegrityChecker } from './components/IntegrityChecker';
import { UserRole, UserStatus, User } from './types';
import {
  hasPermission, canManageUsers, canViewSettings, canManageObjectives, canManageUnits,
  getLockState, getWATTime, formatWATTime, formatWATDate, getCurrentWeekRange,
  getBusinessUnits, getCurrentQuarterInfo, getSessionUser,
  getRecentWeekRanges,
  logAudit,
  canViewStrategicNotes,
  getRegistryUsers,
  setSimulatedUser,
  getSimulatedUser,
  updateUserPassword,
  getGovernanceConfig,
  seedDatabase
} from './utils';
import { Select } from './components/ui/Select';
import { supabase, checkConnection } from './supabaseClient';
import { Auth } from './components/Auth';

const ProtectedRoute: React.FC<{ children?: React.ReactNode; check: () => Promise<boolean> }> = ({ children, check }) => {
  const [allowed, setAllowed] = useState<boolean | null>(null);

  useEffect(() => {
    check().then(setAllowed);
  }, [check]);

  if (allowed === null) return <div className="p-10 text-center text-slate-400">Verifying credentials...</div>;

  if (!allowed) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-slate-400 glass-surface rounded-[4px] border border-slate-200/60 m-8 animate-scale-in shadow-sm">
        <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center mb-6">
          <ShieldAlert size={32} />
        </div>
        <h3 className="text-xl font-bold text-slate-900 tracking-tight">Access Restricted</h3>
        <p className="text-slate-500 mt-2 font-medium">Insufficient clearance for this governance node.</p>
        <NavLink to="/" className="mt-8 px-8 py-2.5 bg-slate-900 text-white rounded-xl shadow-lg hover:bg-slate-800 transition-all text-sm font-semibold">
          Return to Dashboard
        </NavLink>
      </div>
    );
  }
  return <>{children}</>;
};



const UnifiedHeader: React.FC<{
  sidebarOpen: boolean,
  setSidebarOpen: (o: boolean) => void,
  selectedYear: number,
  setSelectedYear: (y: number) => void,
  selectedBu: string,
  setSelectedBu: (bu: string) => void,
  selectedWeek: string,
  setSelectedWeek: (w: string) => void,
  currentUser: any
}> = ({ sidebarOpen, setSidebarOpen, selectedYear, setSelectedYear, selectedBu, setSelectedBu, selectedWeek, setSelectedWeek, currentUser }) => {
  const [dbHealthy, setDbHealthy] = useState<boolean>(true);
  const [availableBUs, setAvailableBUs] = useState([]);
  const weekRange = getCurrentWeekRange();
  const quarterWeeks = getRecentWeekRanges();

  useEffect(() => {
    getBusinessUnits().then(setAvailableBUs).catch(() => setDbHealthy(false));
    checkConnection().then(setDbHealthy);
  }, []);

  return (
    <div className="w-full mb-8 sticky top-0 z-[40]">
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row items-stretch w-full animate-slide-up">
        <div className="flex items-center gap-5 p-5 md:px-8 flex-1">
          <button className="lg:hidden text-slate-500 hover:bg-slate-100 p-2 rounded-lg transition-colors" onClick={() => setSidebarOpen(!sidebarOpen)}>
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <div className="min-w-[160px]">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Welcome, {currentUser?.name?.split(' ')[0] || 'Operator'}</h1>
            <div className="flex items-center gap-1.5 text-slate-400 text-[10px] font-bold mt-0.5 uppercase tracking-wider">
              <div
                className={`w-1.5 h-1.5 rounded-full cursor-help ${dbHealthy ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'}`}
                title={dbHealthy ? "System Operational: Database Connected" : "Connection Warning: Database Unreachable (Check Credentials)"}
              />
              <span>{selectedYear} Governance Node • {currentUser?.role}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-stretch">
          <Select
            label="Year"
            value={selectedYear}
            onChange={(val) => setSelectedYear(Number(val))}
            options={[2024, 2025, 2026, 2027].map(y => ({ label: y.toString(), value: y }))}
            variant="header"
          />
          <Select
            label="Unit"
            value={selectedBu}
            onChange={(val) => setSelectedBu(String(val))}
            options={[
              { label: 'All Units', value: 'all' },
              ...availableBUs.map((bu: any) => ({ label: bu.name, value: bu.name }))
            ]}
            variant="header"
          />

          <div className="flex flex-col px-6 py-3 border-l border-slate-100 justify-center min-w-[140px]">
            <span className="text-[9px] text-slate-400 font-black uppercase tracking-[0.1em] mb-0.5 flex items-center gap-1.5">
              <CalendarDays className="w-2.5 h-2.5" /> Cycle
            </span>
            <span className="text-[12px] font-bold text-slate-700 whitespace-nowrap">{weekRange.split(',')[0]}</span>
          </div>

          <Select
            label="Period"
            value={selectedWeek}
            onChange={(val) => setSelectedWeek(String(val))}
            options={[
              { label: 'All Periods', value: 'all' },
              ...quarterWeeks.map((w: any) => ({ label: w.label, value: w.value }))
            ]}
            variant="header"
          />
        </div>
      </div>
    </div>
  );
};

// FR-SECURITY: BUG-003 Mandatory Password Change Overlay
const PasswordChangeOverlay: React.FC<{ user: User, onComplete: () => void }> = ({ user, onComplete }) => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (newPassword.length < 8) {
      alert("Security Protocol: New key must be at least 8 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Validation Error: Keys do not match.");
      return;
    }
    setIsSubmitting(true);
    try {
      await updateUserPassword(newPassword);
      onComplete();
    } catch (e: any) {
      setError(e.message || "Credential synchronization failure.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] bg-slate-950 flex items-center justify-center p-6">
      <div className="absolute inset-0 bg-cover bg-center opacity-10" style={{ backgroundImage: `url('https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=1600&q=80')` }}></div>
      <div className="relative w-full max-w-lg bg-white rounded-[4px] p-12 shadow-2xl animate-scale-in border border-white/10">
        <div className="flex flex-col items-center text-center mb-10">
          <div className="w-20 h-20 bg-primary-50 rounded-[4px] flex items-center justify-center text-primary-600 mb-8 shadow-inner">
            <Fingerprint size={40} />
          </div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tighter uppercase leading-none">Initialize Security</h2>
          <p className="text-slate-500 text-sm mt-4 font-medium leading-relaxed">
            Your identity node requires a personalized security key update before tactical access is granted.
          </p>
        </div>

        <div className="space-y-6 mb-10">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">New Security Key</label>
            <div className="relative">
              <input
                type={showPwd ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full p-4 pl-12 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold outline-none focus:ring-4 focus:ring-primary-500/10 transition-all"
                placeholder="Enter new 8+ char key"
              />
              <KeyRound size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
              <button onClick={() => setShowPwd(!showPwd)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
                {showPwd ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Confirm Security Key</label>
            <div className="relative">
              <input
                type={showPwd ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full p-4 pl-12 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold outline-none focus:ring-4 focus:ring-primary-500/10 transition-all"
                placeholder="Repeat security key"
              />
              <ShieldCheck size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-center gap-3 animate-shake">
            <AlertTriangle className="text-rose-500 shrink-0" size={18} />
            <p className="text-rose-600 text-xs font-semibold">{error}</p>
          </div>
        )}

        <button
          onClick={handleSubmit}
          disabled={isSubmitting || !newPassword || !confirmPassword}
          className="w-full py-6 bg-slate-950 text-white rounded-[4px] text-[12px] font-black uppercase tracking-[0.2em] shadow-2xl hover:bg-primary-600 transition-all flex items-center justify-center gap-3 active:scale-[0.98] disabled:opacity-30"
        >
          {isSubmitting ? <LoaderCircle className="w-5 h-5 animate-spin" /> : <Save size={20} />}
          {isSubmitting ? 'Syncing Credentials...' : 'Finalize Identity Node'}
        </button>
      </div >
    </div >
  );
};

const App = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [showSignOutConfirm, setShowSignOutConfirm] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const [isRecoveryMode, setIsRecoveryMode] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [registryUsers, setRegistryUsers] = useState<User[]>([]);
  const [authorizedNavItems, setAuthorizedNavItems] = useState<any[]>([]);

  const [selectedYear, setSelectedYear] = useState(() => getCurrentQuarterInfo().year);
  const [selectedBu, setSelectedBu] = useState('all');
  const [selectedWeek, setSelectedWeek] = useState('all');
  const [customLogo, setCustomLogo] = useState<string | null>(null);

  const refreshUserData = () => {
    getSessionUser().then(setCurrentUser);
    getRegistryUsers().then(setRegistryUsers);
  };

  useEffect(() => {
    getGovernanceConfig().then(config => {
      setCustomLogo(config.brandLogo || localStorage.getItem('4CORE_logo'));
    });
    refreshUserData();
    seedDatabase(); // Perform database integrity seed on application boot

    // Check URL hash immediately — recovery links arrive as
    // /#access_token=xxx&type=recovery before auth event fires
    const hash = window.location.hash;
    if (hash.includes('type=recovery') || hash.includes('type%3Drecovery')) {
      setIsRecoveryMode(true);
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        setIsAuthenticated(true);
        refreshUserData();
      } else {
        setIsAuthenticated(false);
      }

      if (_event === 'PASSWORD_RECOVERY') {
        setIsRecoveryMode(true);
        setIsAuthenticated(false);
      } else if (_event === 'USER_UPDATED' || _event === 'SIGNED_IN') {
        setIsRecoveryMode(false);
      }
    });

    const handleUserUpdate = () => refreshUserData();
    window.addEventListener('4COREUserUpdate', handleUserUpdate);

    return () => {
      subscription.unsubscribe();
      window.removeEventListener('4COREUserUpdate', handleUserUpdate);
    };
  }, []);

  const navItems = useMemo(() => [
    { to: '/', label: 'Executive View', icon: <LayoutDashboard size={18} /> },
    { to: '/objectives', label: 'Quarterly KRs', icon: <Target size={18} />, check: canManageObjectives },
    { to: '/reporting', label: 'Weekly Reporting', icon: <FileText size={18} /> },
    { to: '/strategic', label: 'Session Notes', icon: <Briefcase size={18} />, check: canViewStrategicNotes },
    { to: '/integrity', label: 'Integrity Audit', icon: <ShieldIcon size={18} />, check: async () => await hasPermission([UserRole.SuperAdmin, UserRole.Admin]) },
    { to: '/users', label: 'User Directory', icon: <Users size={18} />, check: canManageUsers },
    { to: '/units', label: 'Business Units', icon: <Building2 size={18} />, check: canManageUnits },
    { to: '/settings', label: 'Governance Hub', icon: <SettingsIcon size={18} />, check: canViewSettings },
  ], []);

  // Pre-filter nav items whenever current user or their simulated identity changes
  useEffect(() => {
    if (!currentUser) return;

    const resolvePermissions = async () => {
      const results = await Promise.all(
        navItems.map(async (item) => {
          if (!item.check) return true;
          return await item.check();
        })
      );
      setAuthorizedNavItems(navItems.filter((_, idx) => results[idx]));
    };

    resolvePermissions();
  }, [currentUser, navItems]);

  const handleSignOut = async () => {
    setIsSigningOut(true);
    setSimulatedUser(null);
    localStorage.removeItem('4CORE_simulated_user');
    sessionStorage.removeItem('4CORE_simulated_user');
    try {
      await supabase.auth.signOut();
    } catch (e) { }
    logAudit('LOGOUT', 'Session terminated.');
    setIsSigningOut(false);
    setShowSignOutConfirm(false);
    window.location.hash = '/';
  };

  // Recovery mode takes highest priority — always show Auth for password reset
  if (isRecoveryMode) {
    console.log('[Recovery] Rendering Auth component');
    try {
      return <Auth />;
    } catch (e) {
      console.error('Auth render error:', e);
      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-100 to-purple-100">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-slate-800 mb-2">Something went wrong</h1>
            <p className="text-slate-600">Please refresh the page</p>
          </div>
        </div>
      );
    }
  }

  // Not authenticated (or still loading) — show Auth
  if (!isAuthenticated) {
    try {
      return <Auth />;
    } catch (e) {
      console.error('Auth render error:', e);
      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-100 to-purple-100">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-slate-800 mb-2">Loading...</h1>
          </div>
        </div>
      );
    }
  }

  // If we get here without currentUser, show loading
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <LoaderCircle className="w-10 h-10 text-primary-500 animate-spin" />
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center opacity-20 blur-xl scale-110" style={{ backgroundImage: `url('https://images.unsplash.com/photo-1678581231067-644dddeca6dc?w=2160&q=80')` }}></div>
        <div className="relative w-full max-w-lg animate-in fade-in slide-in-from-bottom-8 duration-700">
          <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[4px] p-12 text-center shadow-2xl">
            <div className="w-20 h-20 bg-primary-600 rounded-[4px] flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-primary-900/40">
              <LoaderCircle size={40} className="text-white animate-spin" />
            </div>
            <h1 className="text-3xl font-black text-white tracking-tight uppercase">Identity Sync</h1>
            <p className="text-slate-400 mt-4 text-sm font-medium leading-relaxed">Identity node detected but not yet synchronized with the governance registry. Linking datasets...</p>

            <div className="mt-12 p-8 bg-white/5 rounded-2xl border border-white/5 text-left">
              <div className="flex items-center gap-3 text-primary-500 mb-4">
                <div className="w-2 h-2 rounded-full bg-primary-500 animate-pulse"></div>
                <span className="text-[10px] font-black uppercase tracking-widest">Protocol: Handshake Active</span>
              </div>
              <p className="text-[11px] text-slate-500 font-bold uppercase tracking-widest leading-loose">
                Verifying profile signature. <br />
                Fetching RBAC permissions. <br />
                Initializing tactical workspace.
              </p>
            </div>
          </div>
        </div>
        <p className="relative z-10 text-[9px] text-slate-600 font-black uppercase tracking-[0.3em] mt-8">4CORE PERFORMANCE ENGINE v2.5</p>
      </div>
    );
  }

  const sidebarWidth = isSidebarCollapsed ? 'w-[84px]' : 'w-[300px]';
  const mainMargin = isSidebarCollapsed ? 'lg:ml-[84px]' : 'lg:ml-[300px]';

  return (
    <Router>
      <div className="flex min-h-screen bg-[#f8fafc] text-slate-900">
        {/* FR-SECURITY: BUG-003 Enforcement logic */}
        {currentUser?.mustChangePassword && (
          <PasswordChangeOverlay user={currentUser} onComplete={refreshUserData} />
        )}

        <aside className={`fixed inset-y-0 left-0 z-[50] ${sidebarWidth} bg-slate-950 text-slate-400 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] transform lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="flex flex-col h-full overflow-hidden">
            <div className={`p-8 flex-1 overflow-y-auto custom-scrollbar flex flex-col ${isSidebarCollapsed ? 'items-center px-4' : ''}`}>
              <div className={`flex items-center gap-3 mb-10 px-2 relative ${isSidebarCollapsed ? 'justify-center w-full' : ''}`}>
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-primary-600 shadow-lg group border border-white/10 shrink-0">
                  {customLogo ? (
                    <img src={customLogo} alt="Logo" className="w-full h-full object-contain p-1.5" />
                  ) : (
                    <Zap size={20} fill="currentColor" />
                  )}
                </div>
                {!isSidebarCollapsed && (
                  <div className="space-y-0.5 animate-fade-in whitespace-nowrap">
                    <h2 className="text-xl font-bold text-white tracking-tight">4CORE</h2>
                    <p className="text-[9px] font-bold text-primary-500 uppercase tracking-[0.2em] opacity-80">Execution Engine</p>
                  </div>
                )}
                <button
                  onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                  className="hidden lg:flex absolute -right-4 top-1/2 -translate-y-1/2 w-8 h-8 bg-slate-800 text-slate-400 rounded-full items-center justify-center border border-white/5 hover:bg-primary-600 hover:text-white transition-all shadow-xl z-20"
                >
                  {isSidebarCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
                </button>
              </div>

              <nav className="flex-1 space-y-1.5 w-full">
                {authorizedNavItems.map(item => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    onClick={() => setSidebarOpen(false)}
                    className={({ isActive }) => `flex items-center gap-3.5 px-5 py-3 rounded-xl text-[13px] font-semibold transition-all duration-200 group relative ${isSidebarCollapsed ? 'justify-center px-0' : ''} ${isActive ? 'bg-primary-600 text-white shadow-lg shadow-primary-900/20' : 'hover:bg-white/5 hover:text-white'}`}
                    title={isSidebarCollapsed ? item.label : ''}
                  >
                    <span className="shrink-0">{item.icon}</span>
                    {!isSidebarCollapsed && <span className="animate-fade-in whitespace-nowrap">{item.label}</span>}
                    {isSidebarCollapsed && (
                      <div className="absolute left-full ml-4 px-2 py-1 bg-slate-900 text-white text-[10px] font-bold rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-[100] uppercase tracking-wider border border-white/10">
                        {item.label}
                      </div>
                    )}
                  </NavLink>
                ))}
              </nav>

              {/* Simulate Role Section */}
              <div className={`mt-10 mb-6 ${isSidebarCollapsed ? 'flex flex-col items-center' : ''}`}>
                {!isSidebarCollapsed && (
                  <div className="flex items-center justify-between mb-4 px-3">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-600">Simulate Role</h3>
                    {getSimulatedUser() && (
                      <button
                        onClick={() => setSimulatedUser(null)}
                        className="text-[9px] font-bold text-primary-500 hover:text-white transition-colors"
                      >
                        RESET
                      </button>
                    )}
                  </div>
                )}
                <div className="space-y-1.5 w-full">
                  {registryUsers.slice(0, 6).map(user => {
                    const isActive = currentUser?.id === user.id;
                    return (
                      <button
                        key={user.id}
                        onClick={() => setSimulatedUser(user)}
                        className={`flex items-center gap-3 w-full px-4 py-2 rounded-xl text-[11px] font-bold transition-all group ${isActive ? 'bg-primary-600/10 text-primary-400' : 'text-slate-500 hover:bg-white/5 hover:text-slate-300'} ${isSidebarCollapsed ? 'justify-center px-0' : ''}`}
                        title={isSidebarCollapsed ? user.name : ''}
                      >
                        <div className={`shrink-0 w-6 h-6 rounded-lg overflow-hidden border ${isActive ? 'border-primary-500 shadow-[0_0_8px_rgba(249,115,22,0.3)]' : 'border-slate-800'}`}>
                          <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
                        </div>
                        {!isSidebarCollapsed && (
                          <div className="flex flex-col items-start truncate overflow-hidden">
                            <span className="truncate w-full text-left">{user.name}</span>
                            <span className="text-[8px] opacity-60 uppercase tracking-widest truncate w-full text-left">{user.role}</span>
                          </div>
                        )}
                        {!isSidebarCollapsed && isActive && <UserCheck size={12} className="ml-auto text-primary-500" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className={`p-6 border-t border-white/5 bg-slate-950/50 ${isSidebarCollapsed ? 'px-4 flex flex-col items-center' : ''}`}>
              <div className={`flex items-center gap-3.5 px-3 mb-6 ${isSidebarCollapsed ? 'justify-center w-full px-0' : ''}`}>
                <div className="relative shrink-0">
                  <img src={currentUser?.avatarUrl} className="w-10 h-10 rounded-xl border border-white/10 shadow-md" alt="" />
                  <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-slate-950 rounded-full"></div>
                </div>
                {!isSidebarCollapsed && (
                  <div className="overflow-hidden animate-fade-in">
                    <p className="text-sm font-bold text-white truncate">{currentUser?.name || 'Operator'}</p>
                    <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">{currentUser?.role || 'Viewer'}</p>
                  </div>
                )}
              </div>
              <button
                onClick={() => setShowSignOutConfirm(true)}
                className={`flex items-center gap-3.5 w-full px-4 py-3 text-[13px] font-semibold text-slate-400 hover:bg-rose-500/10 hover:text-rose-400 rounded-xl transition-all border border-transparent hover:border-rose-500/10 ${isSidebarCollapsed ? 'justify-center px-0' : ''}`}
                title={isSidebarCollapsed ? 'Sign Out' : ''}
              >
                <LogOut size={16} />
                {!isSidebarCollapsed && <span className="animate-fade-in">Sign Out</span>}
              </button>
            </div>
          </div>
        </aside>

        <main className={`flex-1 ${mainMargin} min-h-screen p-6 md:p-8 lg:p-10 relative overflow-x-hidden transition-all duration-300`}>
          <div className="w-full animate-fade-in space-y-8">
            <UnifiedHeader
              sidebarOpen={sidebarOpen}
              setSidebarOpen={setSidebarOpen}
              selectedYear={selectedYear}
              setSelectedYear={setSelectedYear}
              selectedBu={selectedBu}
              setSelectedBu={setSelectedBu}
              selectedWeek={selectedWeek}
              setSelectedWeek={setSelectedWeek}
              currentUser={currentUser}
            />
            <Routes>
              <Route path="/" element={<Dashboard selectedYear={selectedYear} selectedBu={selectedBu} selectedWeek={selectedWeek} />} />
              <Route path="/reporting" element={<ReportingEngine selectedYear={selectedYear} selectedWeek={selectedWeek} />} />
              <Route path="/objectives" element={<ProtectedRoute check={canManageObjectives}><BusinessObjectives selectedYear={selectedYear} setSelectedYear={setSelectedYear} /></ProtectedRoute>} />
              <Route path="/strategic" element={<ProtectedRoute check={canViewStrategicNotes}><StrategicBoard selectedYear={selectedYear} /></ProtectedRoute>} />
              <Route path="/integrity" element={<ProtectedRoute check={async () => await hasPermission([UserRole.SuperAdmin, UserRole.Admin])}><IntegrityChecker /></ProtectedRoute>} />
              <Route path="/users" element={<ProtectedRoute check={canManageUsers}><UserManagement /></ProtectedRoute>} />
              <Route path="/units" element={<ProtectedRoute check={canManageUnits}><BusinessUnits /></ProtectedRoute>} />
              <Route path="/settings" element={<ProtectedRoute check={canViewSettings}><Settings /></ProtectedRoute>} />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </div>
        </main>

        {showSignOutConfirm && (
          <div className="fixed inset-0 z-[160] flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-6 animate-fade-in">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-scale-in border border-slate-100">
              <div className="p-10 flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center mb-6">
                  <AlertTriangle size={32} />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 tracking-tight mb-2">End Identity Session?</h3>
                <p className="text-slate-500 text-sm font-medium leading-relaxed mb-10">
                  Are you sure you want to disconnect from the <span className="font-bold text-slate-900">Governance Registry</span>?
                </p>
                <div className="flex gap-3 w-full">
                  <button onClick={() => setShowSignOutConfirm(false)} disabled={isSigningOut} className="flex-1 py-3 bg-slate-100 text-slate-600 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-slate-200 transition-all">Cancel</button>
                  <button onClick={handleSignOut} disabled={isSigningOut} className="flex-[2] py-3 bg-rose-600 text-white rounded-xl text-xs font-bold uppercase tracking-widest shadow-lg shadow-rose-900/20 hover:bg-rose-700 transition-all flex items-center justify-center gap-2">
                    {isSigningOut ? 'Terminating...' : 'Confirm Sign Out'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Router>
  );
};

export default App;




