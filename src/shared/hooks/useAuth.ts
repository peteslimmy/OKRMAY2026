/**
 * 4CORE OKR Platform - Authentication Hook
 */

import { useState, useEffect, useCallback } from 'react';
import type { User } from '../types';
import { UserRole, UserStatus } from '../types';
import { supabase, supabaseAdmin } from '../../lib/supabase';
import { 
  getSimulatedUser, 
  setSimulatedUser, 
  DEFAULT_USERS,
  generateLocalUUID 
} from '../utils/auth';
import { getUserPermissions, type Permission } from '../utils/permissions';
import { logger } from '../../lib/logger';

export interface UseAuthReturn {
  currentUser: User | null;
  isAuthenticated: boolean;
  isAuthLoading: boolean;
  isRecoveryMode: boolean;
  requirePasswordChange: boolean;
  permissions: Permission[];
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  setRequirePasswordChange: (v: boolean) => void;
  setIsRecoveryMode: (v: boolean) => void;
  refreshUser: () => Promise<void>;
  hasPermission: (permission: Permission) => boolean;
  hasAnyPermission: (permissions: Permission[]) => boolean;
  hasAllPermissions: (permissions: Permission[]) => boolean;
}

export const useAuth = (): UseAuthReturn => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [isRecoveryMode, setIsRecoveryMode] = useState(false);
  const [requirePasswordChange, setRequirePasswordChange] = useState(false);

  const permissions = currentUser ? getUserPermissions(currentUser.role) : [];

  const refreshUser = useCallback(async () => {
    logger.debug('[AUTH] Refreshing user session');
    
    // Check for simulated user in development
    const simulated = getSimulatedUser();
    if (simulated) {
      logger.debug('[AUTH] Using simulated user:', simulated.email);
      setCurrentUser(simulated);
      return;
    }
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) {
        logger.debug('[AUTH] No session, using default user');
        setCurrentUser(DEFAULT_USERS[0]);
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('auth_id', session.user.id)
        .single();

      if (profile) {
        setCurrentUser({
          ...profile,
          mustChangePassword: profile.must_change_password || false
        });
      } else {
        // Create profile if doesn't exist
        const newUser: User = {
          id: generateLocalUUID(),
          auth_id: session.user.id,
          email: session.user.email || '',
          firstName: session.user.email?.split('@')[0] || '',
          lastName: '',
          name: session.user.email?.split('@')[0] || '',
          role: UserRole.Viewer,
          department: 'General',
          avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(session.user.email || '')}&background=random`,
          status: UserStatus.Active,
          mustChangePassword: false
        };
        
        await supabase.from('profiles').insert([newUser]);
        setCurrentUser(newUser);
      }
    } catch (error) {
      logger.error('[AUTH] Error refreshing user:', error);
      setCurrentUser(DEFAULT_USERS[0]);
    }
  }, []);

  const login = useCallback(async (email: string, _password: string) => {
    try {
      // For development, check if it's a simulated login
      const simulatedUser = DEFAULT_USERS.find(u => u.email === email);
      if (simulatedUser && !import.meta.env.PROD) {
        setSimulatedUser(simulatedUser);
        setCurrentUser(simulatedUser);
        logger.info('[AUTH] Simulated login successful:', email);
        return { success: true };
      }

      // For production, use Supabase auth
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password: _password
      });

      if (error) {
        logger.error('[AUTH] Login failed:', error.message);
        return { success: false, error: error.message };
      }

      await refreshUser();
      logger.info('[AUTH] Login successful:', email);
      return { success: true };
    } catch (error) {
      logger.error('[AUTH] Login error:', error);
      return { success: false, error: 'Login failed' };
    }
  }, [refreshUser]);

  const logout = useCallback(async () => {
    logger.info('[AUTH] Logging out');
    
    // Clear simulated user
    setSimulatedUser(null);
    localStorage.removeItem('4CORE_simulated_user');
    sessionStorage.removeItem('4CORE_simulated_user');
    
    try {
      await supabase.auth.signOut();
    } catch {
      // Ignore signout errors
    }
    
    setCurrentUser(null);
    window.dispatchEvent(new Event('4COREUserUpdate'));
  }, []);

  const hasPermission = useCallback((permission: Permission): boolean => {
    return permissions.includes(permission);
  }, [permissions]);

  const hasAnyPermission = useCallback((perms: Permission[]): boolean => {
    return perms.some(p => permissions.includes(p));
  }, [permissions]);

  const hasAllPermissions = useCallback((perms: Permission[]): boolean => {
    return perms.every(p => permissions.includes(p));
  }, [permissions]);

  // Initialize auth on mount
  useEffect(() => {
    let isMounted = true;
    
    const initialize = async () => {
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Auth timeout')), 5000)
      );
      
      try {
        await Promise.race([refreshUser(), timeoutPromise]);
        
        if (!isMounted) return;
        
        // Check for recovery mode
        const hash = window.location.hash;
        if (hash.includes('type=recovery') || hash.includes('type%3Drecovery')) {
          setIsRecoveryMode(true);
        }
        
        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
          refreshUser();
        });

        return () => {
          subscription.unsubscribe();
        };
      } catch (error) {
        logger.error('[AUTH] Initialization error:', error);
        if (isMounted) {
          setCurrentUser(DEFAULT_USERS[0]);
        }
      } finally {
        if (isMounted) {
          setIsAuthLoading(false);
        }
      }
    };

    initialize();
    
    return () => {
      isMounted = false;
    };
  }, [refreshUser]);

  return {
    currentUser,
    isAuthenticated: !!currentUser,
    isAuthLoading,
    isRecoveryMode,
    requirePasswordChange,
    permissions,
    login,
    logout,
    setRequirePasswordChange,
    setIsRecoveryMode,
    refreshUser,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions
  };
};