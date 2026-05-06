import { useState, useEffect, useCallback } from 'react';
import { User } from '../types';
import { 
  canManageUsers, 
  canViewSettings, 
  canManageObjectives, 
  canManageUnits, 
  hasPermission,
  canManageFinance,
  canConfigureGovernance 
} from '../utils';
import { UserRole } from '../types';
import { 
  LayoutDashboard, FileText, Target, Users as UsersIcon, 
  Settings as SettingsIcon, Building2, Shield as ShieldIcon, 
  BarChart3, Activity, ShieldAlert, DollarSign, AlertTriangle,
  History, Wallet, Scale
} from 'lucide-react';

interface NavItemConfig {
  to: string;
  label: string;
  icon: React.ReactNode;
  check?: () => Promise<boolean>;
  isParent?: boolean;
  children?: { to: string; label: string; check?: () => Promise<boolean> }[];
}

interface UseNavigationReturn {
  authorizedNavItems: NavItemConfig[];
  expandedMenus: Set<string>;
  toggleMenu: (label: string) => void;
}

const checkIntegrityAccess = async () => hasPermission([UserRole.SuperAdmin, UserRole.Admin, UserRole.Director]);

export const navItems: NavItemConfig[] = [
  { to: '/', label: 'Executive View', icon: <LayoutDashboard size={16} /> },
  { to: '/objectives', label: 'Quarterly KRs', icon: <Target size={16} />, check: canManageObjectives },
  { to: '/reporting', label: 'Weekly Reporting', icon: <FileText size={16} /> },
  { to: '/reports', label: 'All Summary Reports', icon: <BarChart3 size={16} /> },
  { to: '/governance/violations', label: 'OKR Violations', icon: <AlertTriangle size={16} />, check: canManageObjectives },
  { to: '/operations/attendance', label: 'Attendance', icon: <UsersIcon size={16} /> },
  { to: '/integrity', label: 'Integrity Audit', icon: <ShieldIcon size={16} />, check: checkIntegrityAccess },
  { to: '/users', label: 'User Directory', icon: <UsersIcon size={16} />, check: canManageUsers },
  { to: '/units', label: 'Business Units', icon: <Building2 size={16} />, check: canManageUnits },
  {
    to: '',           // parent-only: no direct navigation
    label: 'Governance Hub',
    icon: <SettingsIcon size={16} />,
    isParent: true,
    check: canViewSettings,
    children: [
      { to: '/governance', label: 'Strategic Overview', check: canManageObjectives },
      { to: '/governance/violations', label: 'Violation Matrix', check: canManageObjectives },
      { to: '/governance/ledger', label: 'Financial Ledger', check: canManageObjectives },
      { to: '/governance/disbursement', label: 'Disbursements', check: canManageFinance },
      { to: '/governance/audit', label: 'Audit Trail', check: canManageObjectives },
      { to: '/governance/config', label: 'System Protocols', check: canConfigureGovernance },
      { to: '/governance/review', label: 'Validation Engine', check: canConfigureGovernance },
      { to: '/settings', label: 'Base Settings' },
    ]
  },
];

export const useNavigation = (currentUser: User | null): UseNavigationReturn => {
  const [authorizedNavItems, setAuthorizedNavItems] = useState<NavItemConfig[]>([]);
  const [expandedMenus, setExpandedMenus] = useState<Set<string>>(new Set());

  const toggleMenu = useCallback((label: string) => {
    setExpandedMenus(prev => {
      const newSet = new Set(prev);
      if (newSet.has(label)) {
        newSet.delete(label);
      } else {
        newSet.add(label);
      }
      return newSet;
    });
  }, []);

  useEffect(() => {
    if (!currentUser) return;

    const resolvePermissions = async () => {
      const results = await Promise.all(
        navItems.map(async (item) => {
          if (item.isParent && item.children) {
            const childResults = await Promise.all(
              item.children.map(async (child) => {
                if (!child.check) return true;
                return await child.check();
              })
            );
            return childResults.some(r => r);
          }
          if (!item.check) return true;
          return await item.check();
        })
      );
      setAuthorizedNavItems(navItems.filter((_, idx) => results[idx]));
    };

    resolvePermissions();
  }, [currentUser]);

  return {
    authorizedNavItems,
    expandedMenus,
    toggleMenu,
  };
};

export type { NavItemConfig };