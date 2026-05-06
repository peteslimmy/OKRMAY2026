/**
 * 4CORE OKR Platform - Main Application
 * Production-ready, modular, scalable architecture
 */

import { lazy, Suspense, useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

import { ToastProvider } from './shared/components/ui/Toast';
import { useAuth } from './shared/hooks/useAuth';
import { canManageObjectives, canManageUsers, canViewSettings, canManageUnits, canConfigureGovernance, canManageFinance, checkIntegrityAccess } from './shared/utils/permissions';
import { safeReload } from './config/urls';
import { cn } from './lib/utils';

// Layout Components
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';

// Auth Components
import { Auth } from './features/auth/components/Auth';

// UI Components
import { ErrorBoundary } from './components/ErrorBoundary';
import { LoadingFallback } from './components/LoadingFallback';
import { StartupHealthCheck } from './components/StartupHealthCheck';

// Lazy-loaded pages with preloading
const Dashboard = lazy(() => import('./pages/Dashboard'));
const BusinessObjectives = lazy(() => import('./pages/Objectives'));
const BusinessUnits = lazy(() => import('./pages/BusinessUnits'));
const Reports = lazy(() => import('./pages/Reports'));
const Attendance = lazy(() => import('./pages/Attendance'));
const Settings = lazy(() => import('./pages/Settings'));
const StrategicGovernance = lazy(() => import('./pages/governance/StrategicGovernance'));
const QuarterlyOKR = lazy(() => import('./components/governance/QuarterlyOKR'));
const ViolationDashboard = lazy(() => import('./components/governance/ViolationDashboard'));
const IntegrityChecker = lazy(() => import('./pages/IntegrityChecker'));
const UserManagement = lazy(() => import('./pages/UserManagement'));
const RecordViolation = lazy(() => import('./pages/governance/RecordViolation'));

// Preload function for routes
const preloadRoute = (route: string) => {
  switch(route) {
    case '/': import('./pages/Dashboard'); break;
    case '/objectives': import('./pages/Objectives'); break;
    case '/units': import('./pages/BusinessUnits'); break;
    case '/reports': import('./pages/Reports'); break;
    case '/attendance': import('./pages/Attendance'); break;
    case '/settings': import('./pages/Settings'); break;
    case '/governance': import('./pages/governance/StrategicGovernance'); break;
    case '/governance/quarterly-krs': import('./components/governance/QuarterlyOKR'); break;
    case '/governance/violations': import('./components/governance/ViolationDashboard'); break;
    case '/governance/violations/new': import('./pages/governance/RecordViolation'); break;
    case '/integrity': import('./pages/IntegrityChecker'); break;
    case '/users': import('./pages/UserManagement'); break;
  }
};

const App = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showSignOut, setShowSignOut] = useState(false);

  const {
    currentUser,
    isAuthLoading,
    isRecoveryMode,
    requirePasswordChange,
    setRequirePasswordChange,
    logout
  } = useAuth();

  // Preload common routes after initial render
  useEffect(() => {
    const timer = setTimeout(() => {
      preloadRoute('/objectives');
      preloadRoute('/governance/quarterly-krs');
      preloadRoute('/governance/violations');
      preloadRoute('/attendance');
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  if (isAuthLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-primary-50/30 to-slate-100">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-primary-500 animate-spin mx-auto mb-4" />
          <p className="text-sm font-medium text-slate-500">Loading 4CORE...</p>
        </div>
      </div>
    );
  }

  if (isRecoveryMode || requirePasswordChange || !currentUser) {
    return (
      <Auth
        requirePasswordChange={requirePasswordChange}
        onPasswordChanged={() => setRequirePasswordChange(false)}
      />
    );
  }



  return (
    <StartupHealthCheck>
    <ToastProvider>
      <Router>
        <div className="flex min-h-screen bg-slate-50">
          <Sidebar
            isCollapsed={sidebarCollapsed}
            setIsCollapsed={setSidebarCollapsed}
            currentUser={currentUser}
            onSignOut={() => setShowSignOut(true)}
          />

          <main className={cn(
            'flex-1 h-screen overflow-auto transition-all duration-300',
            sidebarCollapsed ? 'ml-[72px]' : 'ml-[260px]'
          )}>
            <Header
              currentUser={currentUser}
              onMenuClick={() => setSidebarOpen(!sidebarOpen)}
            />
            
            <div className="p-4 lg:p-6">
              <ErrorBoundary fallback={<PageError />}>
                <Suspense fallback={<div className="flex items-center justify-center p-8"><div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div></div>}>
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/objectives" element={<BusinessObjectives />} />
                  <Route path="/units" element={<BusinessUnits />} />
                  <Route path="/reports" element={<Reports />} />
                  <Route path="/attendance" element={<Attendance />} />
                  <Route path="/settings" element={<Settings />} />
                  
                  {/* Governance Routes */}
                  <Route path="/governance" element={<StrategicGovernance />} />
                  <Route path="/governance/quarterly-krs" element={<QuarterlyOKR />} />
                  <Route path="/governance/violations" element={<ViolationDashboard />} />
                  <Route path="/governance/violations/new" element={<RecordViolation />} />

                  {/* Admin Routes */}
                  <Route path="/integrity" element={<IntegrityChecker />} />
                  <Route path="/users" element={<UserManagement />} />

                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </Suspense>
            </ErrorBoundary>
          </div>
          </main>

          <SignOutDialog
            isOpen={showSignOut}
            onClose={() => setShowSignOut(false)}
            onConfirm={logout}
          />
        </div>
      </Router>
    </ToastProvider>
    </StartupHealthCheck>
  );
};

// Protected Route Wrapper
const Protected: React.FC<{ check: () => boolean; children: React.ReactNode }> = ({
  check,
  children
}) => {
  const isAuthorized = check();
  if (!isAuthorized) {
    console.log('Protected: Not authorized, redirecting to /');
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
};

// Page Error Fallback
const PageError = () => (
  <div className="flex-1 flex items-center justify-center min-h-[60vh]">
    <div className="text-center">
      <p className="text-slate-700 font-semibold mb-2">Something went wrong loading this page.</p>
      <button onClick={() => safeReload()} className="text-sm text-primary-500 hover:underline">
        Reload page
      </button>
    </div>
  </div>
);

// Sign Out Dialog
const SignOutDialog: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}> = ({ isOpen, onClose, onConfirm }) => {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full animate-scale-in">
        <h3 className="text-lg font-semibold text-slate-900 mb-2">Sign out?</h3>
        <p className="text-sm text-slate-500 mb-4">Are you sure you want to sign out?</p>
        <div className="flex gap-3 justify-end">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg">
            Cancel
          </button>
          <button onClick={onConfirm} className="px-4 py-2 text-sm font-medium text-white bg-red-500 hover:bg-red-600 rounded-lg">
            Sign out
          </button>
        </div>
      </div>
    </div>
  );
};

export default App;