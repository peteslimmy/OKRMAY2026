import React, { useState, useEffect, useRef } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  ChevronLeft, ChevronRight, ChevronDown, ChevronUp,
  Bell, Settings, LogOut, User as UserIcon, Shield as ShieldIcon,
  Target, TrendingUp, AlertTriangle, CheckCircle,
  Search, LayoutDashboard, FileText, Clock,
  Building2, Users, DollarSign
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { getWeeklyMetrics } from '../../utils';
import type { User } from '../../shared/types';

interface SidebarProps {
  isCollapsed: boolean;
  setIsCollapsed: (v: boolean) => void;
  currentUser: User | null;
  onSignOut?: () => void;
}

const navItems = [
  { id: 'dashboard', label: 'Executive View', to: '/', icon: <LayoutDashboard size={18} /> },
  { id: 'objectives', label: 'Quarterly KRs', to: '/objectives', icon: <Target size={18} />, roles: ['SuperAdmin', 'Admin', 'Director'] },
  { id: 'reports', label: 'Weekly Reporting', to: '/reports', icon: <Clock size={18} /> },
  { id: 'violations', label: 'OKR Violations', to: '/governance/violations', icon: <AlertTriangle size={18} />, roles: ['SuperAdmin', 'Admin', 'Director'] },
  { id: 'attendance', label: 'Attendance', to: '/attendance', icon: <Clock size={18} /> },
  { id: 'integrity', label: 'Integrity Audit', to: '/integrity', icon: <ShieldIcon size={18} />, roles: ['SuperAdmin', 'Admin', 'Director'] },
  { id: 'users', label: 'User Directory', to: '/users', icon: <Users size={18} />, roles: ['SuperAdmin', 'Admin'] },
  { id: 'units', label: 'Business Units', to: '/units', icon: <Building2 size={18} />, roles: ['SuperAdmin', 'Admin'] },
  { 
    id: 'governance', label: 'Governance Hub', icon: <Settings size={18} />,
    children: [
      { id: 'gov-overview', to: '/governance', label: 'Overview' },
      { id: 'gov-krs', to: '/governance/quarterly-krs', label: 'Quarterly OKRs' },
      { id: 'gov-violations', to: '/governance/violations', label: 'Violations' }
    ],
    roles: ['SuperAdmin', 'Admin', 'Director']
  },
];

interface NotificationItem {
  id: string;
  type: 'goal_due' | 'report_pending' | 'violation' | 'success';
  title: string;
  message: string;
  isRead: boolean;
  createdAt: Date;
}

const NavItemComponent: React.FC<{
  item: typeof navItems[0];
  isCollapsed: boolean;
  expandedMenus: Set<string>;
  toggleMenu: (id: string) => void;
  userRole?: string;
}> = ({ item, isCollapsed, expandedMenus, toggleMenu, userRole }) => {
  const hasChildren = item.children && item.children.length > 0;
  const isExpanded = expandedMenus.has(item.id);
  const location = useLocation();

  // Filter by role
  if (item.roles && userRole && !item.roles.includes(userRole)) {
    return null;
  }

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  const anyChildActive = hasChildren && item.children?.some(child => isActive(child.to));

  if (hasChildren) {
    return (
      <div className="space-y-0.5">
        <button
          onClick={() => toggleMenu(item.id)}
          className={cn(
            'nav-link flex items-center justify-between w-full group',
            isCollapsed ? 'justify-center px-0' : 'px-4 py-2',
            (anyChildActive || isExpanded) && 'nav-link-active'
          )}
          aria-expanded={isExpanded}
        >
          <span className="shrink-0 flex items-center gap-3">
            {item.icon}
            {!isCollapsed && <span className="whitespace-nowrap text-sm">{item.label}</span>}
          </span>
          {!isCollapsed && (
            <span className="transition-transform duration-200 text-slate-400">
              {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </span>
          )}
        </button>
        {isExpanded && !isCollapsed && (
          <div className="mt-0.5 animate-fade-in">
            {item.children?.map((child) => (
              <NavLink
                key={child.id}
                to={child.to}
                className={({ isActive }) => cn(
                  'nav-link pl-10 py-2 text-sm',
                  isActive && 'nav-link-active'
                )}
              >
                <span>{child.label}</span>
              </NavLink>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <NavLink
      to={item.to}
      className={({ isActive }) => cn(
        'nav-link group relative',
        isCollapsed ? 'justify-center px-0 py-2' : 'px-4 py-2',
        isActive && 'nav-link-active'
      )}
    >
      <span className="flex items-center gap-3">
        {item.icon}
        {!isCollapsed && <span className="whitespace-nowrap text-sm">{item.label}</span>}
      </span>
    </NavLink>
  );
};

const QuickStatsWidget: React.FC<{ onNavigate?: (filter: string) => void }> = ({ onNavigate }) => {
  const [stats, setStats] = useState({
    completed: 0,
    pending: 0,
    behind: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const metrics = await getWeeklyMetrics();
        setStats({
          completed: metrics.goalsCompleted,
          pending: Math.max(0, 100 - metrics.goalsCompleted),
          behind: Math.max(0, 100 - metrics.onTrackRate),
        });
      } catch {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-3 gap-1 p-3">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-12 bg-slate-100 rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-1 p-3">
      <button
        onClick={() => onNavigate?.('completed')}
        className="group flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-emerald-50 transition-all"
      >
        <CheckCircle size={16} className="text-emerald-500 group-hover:scale-110 transition-transform" />
        <span className="text-sm font-bold text-emerald-600">{stats.completed}%</span>
        <span className="text-[10px] text-slate-400">Done</span>
      </button>
      <button
        onClick={() => onNavigate?.('pending')}
        className="group flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-amber-50 transition-all"
      >
        <Target size={16} className="text-amber-500 group-hover:scale-110 transition-transform" />
        <span className="text-sm font-bold text-amber-600">{stats.pending}%</span>
        <span className="text-[10px] text-slate-400">Pending</span>
      </button>
      <button
        onClick={() => onNavigate?.('behind')}
        className="group flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-rose-50 transition-all"
      >
        <AlertTriangle size={16} className="text-rose-500 group-hover:scale-110 transition-transform" />
        <span className="text-sm font-bold text-rose-600">{stats.behind}%</span>
        <span className="text-[10px] text-slate-400">Behind</span>
      </button>
    </div>
  );
};

const SidebarNotifications: React.FC<{
  notifications: NotificationItem[];
  onMarkRead?: (id: string) => void;
  onMarkAllRead?: () => void;
}> = ({ notifications, onMarkRead, onMarkAllRead }) => {
  const [isOpen, setIsOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const unreadCount = notifications.filter(n => !n.isRead).length;

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={panelRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'relative p-2 rounded-lg hover:bg-slate-100 transition-colors',
          isOpen && 'bg-slate-100'
        )}
      >
        <Bell size={18} className="text-slate-600" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden z-50 animate-fade-in">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
            <h3 className="text-sm font-semibold text-slate-900">Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={onMarkAllRead}
                className="text-xs text-brand-600 hover:text-brand-700 font-medium"
              >
                Mark all read
              </button>
            )}
          </div>
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-slate-400">
                <Bell size={24} className="mx-auto mb-2 opacity-50" />
                <p className="text-sm">No notifications</p>
              </div>
            ) : (
              notifications.map(notification => (
                <button
                  key={notification.id}
                  onClick={() => onMarkRead?.(notification.id)}
                  className={cn(
                    'w-full px-4 py-3 text-left hover:bg-slate-50 border-b border-slate-50 last:border-0 transition-colors',
                    !notification.isRead && 'bg-brand-50/50'
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div className={cn(
                      'w-2 h-2 rounded-full mt-1.5 shrink-0',
                      notification.type === 'success' ? 'bg-emerald-500' :
                      notification.type === 'goal_due' ? 'bg-amber-500' :
                      notification.type === 'violation' ? 'bg-rose-500' : 'bg-brand-500'
                    )} />
                    <div className="flex-1 min-w-0">
                      <p className={cn(
                        'text-sm font-medium truncate',
                        notification.isRead ? 'text-slate-600' : 'text-slate-900'
                      )}>
                        {notification.title}
                      </p>
                      <p className="text-xs text-slate-500 truncate">{notification.message}</p>
                      <p className="text-[10px] text-slate-400 mt-1">
                        {new Date(notification.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const SidebarUserMenu: React.FC<{
  user: User | null;
  onProfile?: () => void;
  onSettings?: () => void;
  onSignOut?: () => void;
}> = ({ user, onProfile, onSettings, onSignOut }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-slate-100 transition-colors"
      >
        <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center shrink-0">
          {user?.avatar_url ? (
            <img src={user.avatar_url} alt="" className="w-8 h-8 rounded-full object-cover" />
          ) : (
            <UserIcon size={14} className="text-brand-600" />
          )}
        </div>
        <div className="flex-1 text-left min-w-0">
          <p className="text-sm font-medium text-slate-900 truncate">
            {user?.full_name || user?.email || 'User'}
          </p>
          <p className="text-[10px] text-slate-500 truncate">
            {user?.email || 'user@company.com'}
          </p>
        </div>
        <ChevronDown size={14} className={cn('text-slate-400 transition-transform', isOpen && 'rotate-180')} />
      </button>

      {isOpen && (
        <div className="absolute bottom-full left-0 right-0 mb-2 bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden animate-fade-in">
          <button
            onClick={() => { onProfile?.(); setIsOpen(false); }}
            className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-slate-50 transition-colors"
          >
            <UserIcon size={16} className="text-slate-500" />
            <span className="text-sm text-slate-700">Profile</span>
          </button>
          <button
            onClick={() => { onSettings?.(); setIsOpen(false); }}
            className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-slate-50 transition-colors"
          >
            <Settings size={16} className="text-slate-500" />
            <span className="text-sm text-slate-700">Settings</span>
          </button>
          <div className="border-t border-slate-100">
            <button
              onClick={() => { onSignOut?.(); setIsOpen(false); }}
              className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-rose-50 transition-colors"
            >
              <LogOut size={16} className="text-rose-500" />
              <span className="text-sm text-rose-600">Sign Out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export const Sidebar: React.FC<SidebarProps> = ({
  isCollapsed,
  setIsCollapsed,
  currentUser,
  onSignOut,
}) => {
  const [expandedMenus, setExpandedMenus] = useState<Set<string>>(new Set());
  const [isLoaded, setIsLoaded] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([
    { id: '1', type: 'report_pending', title: 'Week 18 report due', message: 'Submit your weekly OKR report', isRead: false, createdAt: new Date() },
    { id: '2', type: 'goal_due', title: 'Q3 deadline approaching', message: 'Increase revenue by 20%', isRead: false, createdAt: new Date(Date.now() - 86400000) },
    { id: '3', type: 'violation', title: 'Budget alert', message: 'Department overspend detected', isRead: true, createdAt: new Date(Date.now() - 172800000) },
  ]);

  useEffect(() => {
    requestAnimationFrame(() => setIsLoaded(true));
  }, []);

  const toggleMenu = (id: string) => {
    setExpandedMenus(prev => {
      const newSet = new Set(prev);
      newSet.has(id) ? newSet.delete(id) : newSet.add(id);
      return newSet;
    });
  };

  const userRole = currentUser?.role;

  const sidebarWidth = isCollapsed ? 'w-[72px]' : 'w-[260px]';

  return (
    <aside
      className={cn(
        'fixed inset-y-0 left-0 z-[50] bg-white border-r border-slate-200 text-slate-600',
        'flex flex-col',
        sidebarWidth,
        'transition-all duration-300 ease-out',
        isLoaded ? 'opacity-100' : 'opacity-0'
      )}
    >
      {/* Header */}
      <div className={cn('flex items-center gap-2 p-4 border-b border-slate-100', isCollapsed && 'justify-center')}>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-brand-600 flex items-center justify-center">
            <ShieldIcon size={16} className="text-white" />
          </div>
          {!isCollapsed && (
            <h2 className="text-sm font-bold text-slate-900 tracking-tight">
              CENTRA OKR
            </h2>
          )}
        </div>
        
        {/* Notifications (always visible) */}
        <SidebarNotifications
          notifications={notifications}
          onMarkRead={(id) => setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n))}
          onMarkAllRead={() => setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))}
        />

        {/* Collapse Toggle - Always visible */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? <ChevronRight size={16} className="text-slate-500" /> : <ChevronLeft size={16} className="text-slate-500" />}
        </button>
      </div>

      {/* Search Area */}
      {!isCollapsed && (
        <div className="px-4 py-3 border-b border-slate-100">
          <div className="flex items-center gap-2 text-slate-400 hover:text-slate-600 cursor-pointer">
            <Search size={14} />
            <span className="text-xs">Search...</span>
            <kbd className="ml-auto text-[10px] bg-slate-100 px-1.5 py-0.5 rounded">⌘K</kbd>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-2">
        <div className="space-y-0.5">
          {navItems.map((item) => (
            <NavItemComponent
              key={item.id}
              item={item}
              isCollapsed={isCollapsed}
              expandedMenus={expandedMenus}
              toggleMenu={toggleMenu}
              userRole={userRole}
            />
          ))}
        </div>
      </nav>

      {/* Quick Stats Widget */}
      {!isCollapsed && (
        <div className="border-t border-slate-100">
          <QuickStatsWidget onNavigate={(filter) => console.log('Navigate to', filter)} />
        </div>
      )}

      {/* User Menu */}
      <div className="p-2 border-t border-slate-100">
        <SidebarUserMenu
          user={currentUser}
          onProfile={() => console.log('Navigate to profile')}
          onSettings={() => console.log('Navigate to settings')}
          onSignOut={onSignOut}
        />
      </div>
    </aside>
  );
};