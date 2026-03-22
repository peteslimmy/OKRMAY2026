
import React, { useState, useEffect, useMemo, lazy, Suspense, ReactNode } from 'react';
import { HashRouter as Router, Routes, Route, NavLink, Navigate } from 'react-router-dom';
import {
  LayoutDashboard, FileText, Target, Users, Settings as SettingsIcon, LogOut, Menu, X, Zap, CalendarDays, Building2, ShieldAlert, ShieldCheck as ShieldIcon, LoaderCircle, AlertTriangle, AlertCircle, ChevronLeft, ChevronRight, ChevronDown, UserCheck, Landmark, BarChart3
} from 'lucide-react';
import { UserRole, User } from './src/types';
import {
  hasPermission, canManageUsers, canViewSettings, canManageObjectives, canManageUnits,
  getCurrentWeekRange,
  getBusinessUnits, getCurrentQuarterInfo, getSessionUser,
  getRecentWeekRanges,
  logAudit,
  getRegistryUsers,
  setSimulatedUser,
  getSimulatedUser,
  getGovernanceConfig,
  seedDatabase
} from './utils';
import { Select } from './components/ui/Select';
import { supabase, checkConnection } from './supabaseClient';
import { Auth } from './components/Auth';
import ReportModule from './components/ReportModule';
import AllSummaryReports from './components/AllSummaryReports';

const Dashboard = lazy(() => import('./components/Dashboard').then(m => ({ default: m.Dashboard })));
const BusinessObjectives = lazy(() => import('./components/BusinessObjectives').then(m => ({ default: m.BusinessObjectives })));
const Settings = lazy(() => import('./components/Settings').then(m => ({ default: m.Settings })));
const BusinessUnits = lazy(() => import('./components/BusinessUnits').then(m => ({ default: m.BusinessUnits })));
const UserManagement = lazy(() => import('./components/UserManagement').then(m => ({ default: m.UserManagement })));
const IntegrityChecker = lazy(() => import('./components/IntegrityChecker').then(m => ({ default: m.IntegrityChecker })));
const Financials = lazy(() => import('./components/Financials').then(m => ({ default: m.Financials })));
const Attendance = lazy(() => import('./components/Attendance').then(m => ({ default: m.Attendance })));

const checkIntegrityAccess = async () => await hasPermission([UserRole.SuperAdmin, UserRole.Admin, UserRole.Director]);

const LoadingFallback = () => (
  <div className="flex flex-col items-center justify-center h-[60vh]">
    <LoaderCircle className="w-10 h-10 text-primary-500 animate-spin mb-4" />
    <p className="text-sm font-bold text-slate-400 uppercase tracking-wider">Loading module...</p>
  </div>
);

// Error Boundary Component
interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  props: ErrorBoundaryProps;
  public state: ErrorBoundaryState = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    console.error('[ERROR_BOUNDARY] Caught error:', error, errorInfo);
  }

  public render(): React.ReactNode {
    if (this.state.hasError) {
      const fallback = this.props.fallback;
      if (fallback) {
        return fallback;
      }

      return (
        <div className="flex flex-col items-center justify-center h-[60vh] p-8">
          <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
          <h2 className="text-xl font-bold text-slate-900 mb-2">Something went wrong</h2>
          <p className="text-sm text-slate-500 mb-4">{this.state.error?.message || 'An unexpected error occurred'}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-primary-500 text-white rounded-lg font-bold text-sm"
          >
            Reload Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

const ProtectedRoute: React.FC<{ children?: React.ReactNode; check: () => Promise<boolean> }> = ({ children, check }) => {
  const [allowed, setAllowed] = useState<boolean | null>(null);

  useEffect(() => {
    check().then(setAllowed);
  }, [check]);

  if (allowed === null) return <div className="p-10 text-center text-slate-400">Verifying credentials...</div>;

  if (!allowed) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-slate-400 glass-surface rounded-2xl border border-slate-200/60 m-8 animate-scale-in shadow-modal">
        <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-xl flex items-center justify-center mb-6">
          <ShieldAlert size={32} />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Access Restricted</h1>
        <p className="text-slate-500 mt-2 font-medium">Insufficient clearance for this governance node.</p>
        <NavLink to="/" className="mt-8 px-8 py-3 bg-slate-900 text-white rounded-xl shadow-lg hover:bg-slate-800 transition-all text-sm font-bold uppercase tracking-widest">
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
  selectedCycle: string,
  setSelectedCycle: (c: string) => void,
  selectedWeek: string,
  setSelectedWeek: (w: string) => void,
  currentUser: any
}> = ({ sidebarOpen, setSidebarOpen, selectedYear, setSelectedYear, selectedBu, setSelectedBu, selectedCycle, setSelectedCycle, selectedWeek, setSelectedWeek, currentUser }) => {
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
      <div className="bg-white rounded-2xl border border-slate-200 shadow-card flex flex-col md:flex-row items-stretch w-full overflow-hidden animate-slide-up">
        <div className="flex items-center gap-4 p-4 md:px-6 border-b md:border-b-0 md:border-r border-slate-100 flex-1">
          <button className="lg:hidden text-slate-500 hover:bg-slate-50 p-2.5 rounded-xl transition-colors" onClick={() => setSidebarOpen(!sidebarOpen)}>
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <div className="flex items-center gap-4">
            <div className={`w-2.5 h-2.5 rounded-full ${dbHealthy ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'bg-amber-500 animate-pulse'}`} />
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1.5">System Status</p>
              <h4 className="text-[14px] font-bold text-slate-900 leading-none">Active Identity • {currentUser?.name?.split(' ')[0]}</h4>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-stretch">
          <Select
            label="Fiscal Year"
            value={selectedYear}
            onChange={(val) => setSelectedYear(Number(val))}
            options={[2024, 2025, 2026, 2027].map(y => ({ label: y.toString(), value: y }))}
            variant="header"
          />
          <Select
            label="Business Unit"
            value={selectedBu}
            onChange={(val) => setSelectedBu(String(val))}
            options={[
              { label: 'All Units', value: 'all' },
              ...availableBUs.map((bu: any) => ({ label: bu.name, value: bu.name }))
            ]}
            variant="header"
          />

          <Select
            label="Current Cycle"
            value={selectedCycle}
            onChange={(val) => setSelectedCycle(String(val))}
            options={quarterWeeks.map((w: any) => {
              const dateRange = w.label.split(':')[1]?.split(',')[0]?.trim() || w.label;
              return { label: dateRange, value: w.value };
            })}
            variant="header"
          />

          <Select
            label="Intelligence Period"
            value={selectedWeek}
            onChange={(val) => setSelectedWeek(String(val))}
            options={[
              { label: 'Full Quarter', value: 'all' },
              ...quarterWeeks.map((w: any) => ({ label: w.label, value: w.value }))
            ]}
            variant="header"
          />
        </div>
      </div>
    </div>
  );
};

const App = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState<Set<string>>(new Set(['Operations']));
  const [showSignOutConfirm, setShowSignOutConfirm] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(true); // Prevent auth flash
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    // SECURITY: Only auto-auth in development mode AND not in production
    // Additional check to prevent accidental auth bypass in production
    const hostname = window.location.hostname;
    const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1';
    // Use Vite's DEV mode and check for production flag
    const isDevMode = import.meta.env.DEV === true && !import.meta.env.PROD;
    const isProduction =
      import.meta.env.PROD === true ||
      window.location.hostname.includes('vercel.app') ||
      window.location.hostname.includes('netlify.app') ||
      window.location.hostname.includes('herokuapp.com');

    // Only allow simulation bypass on localhost/127.0.0.1 in development mode
    // This is intentionally restrictive to prevent auth bypass in any production deployment
    if (isLocalhost && isDevMode && !isProduction && getSimulatedUser()) {
      return true;
    }
    return false;
  });
  const [isRecoveryMode, setIsRecoveryMode] = useState(false);
  const [requirePasswordChange, setRequirePasswordChange] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [registryUsers, setRegistryUsers] = useState<User[]>([]);
  const [authorizedNavItems, setAuthorizedNavItems] = useState<any[]>([]);

  const [selectedYear, setSelectedYear] = useState(() => getCurrentQuarterInfo().year);
  const [selectedBu, setSelectedBu] = useState('all');
  const [selectedCycle, setSelectedCycle] = useState(() => getRecentWeekRanges()[0]?.value || 'all');
  const [selectedWeek, setSelectedWeek] = useState('all');
  const [customLogo, setCustomLogo] = useState<string | null>(null);

  const refreshUserData = () => {
    getSessionUser().then(setCurrentUser);
    getRegistryUsers().then(setRegistryUsers);
  };

  // Check if password change is required after user loads
  useEffect(() => {
    if (currentUser?.mustChangePassword) {
      setRequirePasswordChange(true);
    }
  }, [currentUser]);

  const handlePasswordChanged = async () => {
    setRequirePasswordChange(false);
    // Update the user's mustChangePassword in the database
    if (currentUser?.id) {
      const { error } = await supabase
        .from('profiles')
        .update({ must_change_password: false })
        .eq('id', currentUser.id);
      if (error) {
        console.error('Failed to update mustChangePassword:', error);
      }
    }
    refreshUserData();
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

    // Check for simulated user (development mode)
    const checkSimulatedUser = () => {
      const simulated = getSimulatedUser();
      if (simulated) {
        setIsAuthenticated(true);
        setCurrentUser(simulated);
      }
      // Auth check complete (simulated or not)
      setIsAuthLoading(false);
    };
    checkSimulatedUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        setIsAuthenticated(true);
        refreshUserData();
      } else {
        // Only set to false if no simulated user
        if (!getSimulatedUser()) {
          setIsAuthenticated(false);
        }
      }
      // Auth check complete - stop loading
      setIsAuthLoading(false);

      if (_event === 'PASSWORD_RECOVERY') {
        setIsRecoveryMode(true);
        setIsAuthenticated(false);
      } else if (_event === 'USER_UPDATED' || _event === 'SIGNED_IN') {
        setIsRecoveryMode(false);
      }
    });

    const handleUserUpdate = () => {
      refreshUserData();
      checkSimulatedUser();
    };
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
    { to: '/reports', label: 'All Summary Reports', icon: <BarChart3 size={18} /> },
    { to: '/operations/attendance', label: 'Attendance', icon: <Users size={18} /> },
    { to: '/integrity', label: 'Integrity Audit', icon: <ShieldIcon size={18} />, check: checkIntegrityAccess },
    { to: '/users', label: 'User Directory', icon: <Users size={18} />, check: canManageUsers },
    { to: '/units', label: 'Business Units', icon: <Building2 size={18} />, check: canManageUnits },
    { to: '/settings', label: 'Governance Hub', icon: <SettingsIcon size={18} />, check: canViewSettings },
    { to: '/financials', label: 'Financials', icon: <Landmark size={18} /> },
  ], []);

  // Pre-filter nav items whenever current user or their simulated identity changes
  useEffect(() => {
    if (!currentUser) return;

    const resolvePermissions = async () => {
      const results = await Promise.all(
        navItems.map(async (item) => {
          // If it's a parent item with children, check if any child is accessible
          if (item.isParent && item.children) {
            const childResults = await Promise.all(
              item.children.map(async (child: any) => {
                if (!child.check) return true;
                return await child.check();
              })
            );
            return childResults.some(r => r);
          }
          // Regular item - use existing check
          if (!item.check) return true;
          return await item.check();
        })
      );
      setAuthorizedNavItems(navItems.filter((_, idx) => results[idx]));
    };

    resolvePermissions();
  }, [currentUser, navItems]);

  const toggleMenu = (label: string) => {
    setExpandedMenus(prev => {
      const newSet = new Set(prev);
      if (newSet.has(label)) {
        newSet.delete(label);
      } else {
        newSet.add(label);
      }
      return newSet;
    });
  };

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
      return <Auth requirePasswordChange={requirePasswordChange} onPasswordChanged={handlePasswordChanged} />;
    } catch (e) {
      console.error('Auth render error:', e);
      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-100 to-purple-100">
          <div className="text-center max-w-md p-8">
            <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="w-8 h-8 text-rose-500" />
            </div>
            <h1 className="text-2xl font-bold text-slate-800 mb-2">Unable to load application</h1>
            <p className="text-slate-600 mb-6">We encountered an issue initializing the application. This may be due to a network problem or session timeout.</p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-primary-600 text-white rounded-xl font-semibold hover:bg-primary-700 transition-colors"
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }
  }

  // Not authenticated (or still loading) — show Auth
  // But if password change is required, still show Auth with that mode
  // Also show loading spinner while checking auth state
  if (isAuthLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'linear-gradient(135deg, #dde1f5 0%, #c8ccee 40%, #d4c9f0 100%)' }}>
        <LoaderCircle className="w-10 h-10 text-indigo-500 animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated || requirePasswordChange) {
    try {
      return <Auth requirePasswordChange={requirePasswordChange} onPasswordChanged={handlePasswordChanged} />;
    } catch (e) {
      console.error('Auth render error:', e);
      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-100 to-purple-100">
          <div className="text-center max-w-md p-8">
            <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="w-8 h-8 text-rose-500" />
            </div>
            <h1 className="text-2xl font-bold text-slate-800 mb-2">Session expired</h1>
            <p className="text-slate-600 mb-6">Your session has expired or there was a problem verifying your credentials. Please sign in again.</p>
            <button
              onClick={() => supabase.auth.signOut().then(() => window.location.reload())}
              className="px-6 py-3 bg-primary-600 text-white rounded-xl font-semibold hover:bg-primary-700 transition-colors"
            >
              Sign In Again
            </button>
          </div>
        </div>
      );
    }
  }

  // If we get here without currentUser, show loading
  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-50 via-primary-50/30 to-slate-100">
        <div className="text-center">
          <LoaderCircle className="w-10 h-10 text-primary-600 animate-spin mx-auto mb-4" />
          <p className="text-sm text-slate-500 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  const sidebarWidth = isSidebarCollapsed ? 'w-[84px]' : 'w-[300px]';
  const mainMargin = isSidebarCollapsed ? 'lg:ml-[84px]' : 'lg:ml-[300px]';

  return (
    <Router>
      <div className="flex min-h-screen bg-[#f8fafc] text-slate-900">
        <aside className={`fixed inset-y-0 left-0 z-[50] ${sidebarWidth} bg-white border-r border-slate-200 text-slate-600 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] transform lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="flex flex-col h-full overflow-hidden">
            <div className={`p-8 flex-1 overflow-y-auto custom-scrollbar flex flex-col ${isSidebarCollapsed ? 'items-center px-4' : ''}`}>
              <div className={`flex items-center gap-3 mb-12 px-2 relative ${isSidebarCollapsed ? 'justify-center w-full' : ''}`}>
                <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-primary-600/20 shrink-0">
                  {customLogo ? (
                    <img src={customLogo} alt="Logo" className="w-full h-full object-contain p-1.5" />
                  ) : (
                    <Zap size={20} fill="currentColor" />
                  )}
                </div>
                {!isSidebarCollapsed && (
                  <div className="space-y-0.5 animate-fade-in whitespace-nowrap">
                    <h2 className="text-xl font-bold text-slate-900 tracking-tight">4CORE</h2>
                    <p className="text-[9px] font-bold text-primary-600 uppercase tracking-[0.2em] opacity-80">Execution Engine</p>
                  </div>
                )}
                <button
                  onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                  className="hidden lg:flex absolute -right-4 top-1/2 -translate-y-1/2 w-8 h-8 bg-white text-slate-400 rounded-full items-center justify-center border border-slate-200 hover:bg-primary-600 hover:text-white transition-all shadow-md z-20"
                >
                  {isSidebarCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
                </button>
              </div>

              <nav className="flex-1 w-full flex flex-col gap-2">
                {!isSidebarCollapsed && <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.25em] px-5 mb-2">GENERAL</h3>}
                <div className="space-y-1">
                  {authorizedNavItems.map((item, idx) => (
                    <React.Fragment key={item.label || item.to}>
                      {item.isParent && item.children ? (
                        <>
                          <button
                            onClick={() => toggleMenu(item.label)}
                            className={`flex items-center justify-between gap-3.5 px-5 py-3 rounded text-[13px] font-bold transition-all duration-200 group w-full ${isSidebarCollapsed ? 'justify-center px-0' : ''} ${expandedMenus.has(item.label) ? 'bg-slate-50 text-slate-900' : 'hover:bg-slate-50/80 text-slate-500 hover:text-slate-900'}`}
                          >
                            <span className="shrink-0 flex items-center gap-3.5">
                              {item.icon}
                              {!isSidebarCollapsed && <span className="animate-fade-in whitespace-nowrap">{item.label}</span>}
                            </span>
                            {!isSidebarCollapsed && <ChevronDown size={14} className={`transition-transform ${expandedMenus.has(item.label) ? 'rotate-180' : ''}`} />}
                          </button>
                          {expandedMenus.has(item.label) && !isSidebarCollapsed && (
                            <div className="ml-4 pl-4 border-l border-slate-100 space-y-1 mt-1">
                              {item.children.map((child: any) => (
                                <NavLink
                                  key={child.to}
                                  to={child.to}
                                  onClick={() => setSidebarOpen(false)}
                                  className={({ isActive }) => `flex items-center gap-3.5 px-5 py-2.5 rounded text-[12px] font-bold transition-all duration-200 ${isActive ? 'bg-primary-50 text-primary-600' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'}`}
                                >
                                  <span>{child.label}</span>
                                </NavLink>
                              ))}
                            </div>
                          )}
                        </>
                      ) : (
                        <NavLink
                          to={item.to}
                          onClick={() => setSidebarOpen(false)}
                          className={({ isActive }) => `flex items-center gap-3.5 px-5 py-3 rounded text-[13px] font-bold transition-all duration-200 group relative ${isSidebarCollapsed ? 'justify-center px-0' : ''} ${isActive ? 'bg-primary-50 text-primary-600 border-r-4 border-primary-500' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'}`}
                        >
                          {({ isActive }) => (
                            <>
                              <span className={`${isActive ? 'text-primary-600' : 'text-slate-400 group-hover:text-slate-600'}`}>{item.icon}</span>
                              {!isSidebarCollapsed && <span className="animate-fade-in whitespace-nowrap">{item.label}</span>}
                            </>
                          )}
                        </NavLink>
                      )}
                    </React.Fragment>
                  ))}
                </div>
              </nav>

              {/* SIMULATE ROLE Section updated for light theme */}
              <div className={`mt-10 mb-6 ${isSidebarCollapsed ? 'flex flex-col items-center' : ''}`}>
                {!isSidebarCollapsed && (
                  <div className="flex items-center justify-between mb-4 px-5">
                    <h3 className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">Identity Portal</h3>
                    {getSimulatedUser() && (
                      <button onClick={() => setSimulatedUser(null)} className="text-[9px] font-bold text-primary-600 hover:underline">RESET</button>
                    )}
                  </div>
                )}
                <div className="space-y-1 px-2 w-full">
                  {registryUsers.slice(0, 6).map(user => {
                    const isActive = currentUser?.id === user.id;
                    return (
                      <button
                        key={user.id}
                        onClick={() => setSimulatedUser(user)}
                        className={`flex items-center gap-3 w-full px-4 py-2.5 rounded-xl text-[11px] font-bold transition-all group ${isActive ? 'bg-slate-100 text-slate-900' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'} ${isSidebarCollapsed ? 'justify-center px-0' : ''}`}
                      >
                        <div className={`shrink-0 w-6 h-6 rounded-lg overflow-hidden border ${isActive ? 'border-primary-500 shadow-sm' : 'border-slate-200'}`}>
                          <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
                        </div>
                        {!isSidebarCollapsed && (
                          <div className="flex flex-col items-start truncate overflow-hidden">
                            <span className="truncate w-full text-left text-slate-900 italic">{user.name}</span>
                            <span className="text-[8px] font-bold opacity-60 uppercase tracking-widest truncate w-full text-left">{user.role}</span>
                          </div>
                        )}
                        {!isSidebarCollapsed && isActive && <UserCheck size={12} className="ml-auto text-primary-600" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className={`p-6 border-t border-slate-100 bg-slate-50/50 ${isSidebarCollapsed ? 'px-4 flex flex-col items-center' : ''}`}>
              <div className={`flex items-center gap-3.5 px-3 mb-6 ${isSidebarCollapsed ? 'justify-center w-full px-0' : ''}`}>
                <div className="relative shrink-0">
                  <img src={currentUser?.avatarUrl} className="w-10 h-10 rounded-xl border border-slate-200 shadow-sm" alt="" />
                  <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full"></div>
                </div>
                {!isSidebarCollapsed && (
                  <div className="overflow-hidden animate-fade-in text-slate-900">
                    <p className="text-sm font-bold truncate">{currentUser?.name || 'Operator'}</p>
                    <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">{currentUser?.role || 'Viewer'}</p>
                  </div>
                )}
              </div>
              <button
                onClick={() => setShowSignOutConfirm(true)}
                className={`flex items-center gap-3.5 w-full px-4 py-3 text-[13px] font-bold text-slate-500 hover:bg-rose-50 hover:text-rose-600 rounded-xl transition-all border border-transparent ${isSidebarCollapsed ? 'justify-center px-0' : ''}`}
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
              selectedCycle={selectedCycle}
              setSelectedCycle={setSelectedCycle}
              selectedWeek={selectedWeek}
              setSelectedWeek={setSelectedWeek}
              currentUser={currentUser}
            />
            <Suspense fallback={<LoadingFallback />}>
              <Routes>
                <Route path="/" element={<Dashboard selectedYear={selectedYear} selectedBu={selectedBu} selectedWeek={selectedWeek} />} />
                <Route path="/reporting" element={<ReportModule />} />
                <Route path="/reports" element={<AllSummaryReports />} />
                <Route path="/objectives" element={<ProtectedRoute check={canManageObjectives}><BusinessObjectives selectedYear={selectedYear} setSelectedYear={setSelectedYear} /></ProtectedRoute>} />
                <Route path="/operations/attendance" element={<Attendance />} />
                <Route path="/integrity" element={<ProtectedRoute check={checkIntegrityAccess}><IntegrityChecker /></ProtectedRoute>} />
                <Route path="/users" element={<ProtectedRoute check={canManageUsers}><UserManagement /></ProtectedRoute>} />
                <Route path="/units" element={<ProtectedRoute check={canManageUnits}><BusinessUnits /></ProtectedRoute>} />
                <Route path="/settings" element={<ProtectedRoute check={canViewSettings}><Settings /></ProtectedRoute>} />
                <Route path="/financials" element={<ErrorBoundary><Financials /></ErrorBoundary>} />
                <Route path="*" element={<Navigate to="/" />} />
              </Routes>
            </Suspense>
          </div>
        </main>

        {showSignOutConfirm && (
          <div className="fixed inset-0 z-[160] flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-6 animate-fade-in">
            <div className="bg-white rounded shadow-modal w-full max-w-md overflow-hidden animate-scale-in border border-slate-100">
              <div className="p-10 flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded flex items-center justify-center mb-6">
                  <AlertTriangle size={32} />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 tracking-tight mb-2">End Identity Session?</h3>
                <p className="text-slate-500 text-sm font-medium leading-relaxed mb-10">
                  Are you sure you want to disconnect from the <span className="font-bold text-slate-900">Governance Registry</span>?
                </p>
                <div className="flex gap-3 w-full">
                  <button onClick={() => setShowSignOutConfirm(false)} disabled={isSigningOut} className="flex-1 py-3 bg-slate-100 text-slate-600 rounded text-xs font-bold uppercase tracking-widest hover:bg-slate-200 transition-all">Cancel</button>
                  <button onClick={handleSignOut} disabled={isSigningOut} className="flex-[2] py-3 bg-rose-600 text-white rounded text-xs font-bold uppercase tracking-widest shadow-lg shadow-rose-900/20 hover:bg-rose-700 transition-all flex items-center justify-center gap-2">
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




