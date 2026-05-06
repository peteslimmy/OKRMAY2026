import { useState, useEffect, useCallback } from 'react';
import { User, UserRole } from '../types';
import { supabase } from '../lib/supabase';
import { getSessionUser, getRegistryUsers, logAudit, getGovernanceConfig, seedDatabase, setSimulatedUser } from '../utils';

export interface UseAuthReturn {
  currentUser: User | null;
  registryUsers: User[];
  isAuthenticated: boolean;
  isAuthLoading: boolean;
  isRecoveryMode: boolean;
  requirePasswordChange: boolean;
  refreshUserData: () => Promise<void>;
  handleSignOut: () => Promise<void>;
  setRequirePasswordChange: (v: boolean) => void;
  setIsRecoveryMode: (v: boolean) => void;
}

export const useAuth = (): UseAuthReturn => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [registryUsers, setRegistryUsers] = useState<User[]>([]);
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [isRecoveryMode, setIsRecoveryMode] = useState(false);
  const [requirePasswordChange, setRequirePasswordChange] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);

  const refreshUserData = useCallback(async () => {
    const user = await getSessionUser();
    setCurrentUser(user);
    const users = await getRegistryUsers();
    setRegistryUsers(users);
  }, []);

  const handleSignOut = useCallback(async () => {
    setIsSigningOut(true);
    if (__SIMULATION_ENABLED__) {
      setSimulatedUser(null);
      localStorage.removeItem('4CORE_simulated_user');
      sessionStorage.removeItem('4CORE_simulated_user');
    }
    try {
      await supabase.auth.signOut();
    } catch (_e) {
      // Ignore signOut errors
    }
    logAudit('LOGOUT', 'Session terminated.');
    setIsSigningOut(false);
  }, []);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        await getGovernanceConfig();
        await refreshUserData();
        await seedDatabase();
      } catch (e) {
        console.error('Auth initialization error:', e);
      } finally {
        setIsAuthLoading(false);
      }
    };

    initializeAuth();

    const hash = window.location.hash;
    if (hash.includes('type=recovery') || hash.includes('type%3Drecovery')) {
      setIsRecoveryMode(true);
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthLoading(false);
      refreshUserData();
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [refreshUserData]);

  return {
    currentUser,
    registryUsers,
    isAuthenticated,
    isAuthLoading,
    isRecoveryMode,
    requirePasswordChange,
    refreshUserData,
    handleSignOut,
    setRequirePasswordChange,
    setIsRecoveryMode,
  };
};