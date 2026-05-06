/**
 * 4CORE OKR Platform - Authentication Utilities
 */

import type { User } from '../types';
import { UserRole, UserStatus } from '../types';

export const generateLocalUUID = (): string => crypto.randomUUID();

export const getSimulatedUser = (): User | null => {
  if (!import.meta.env.PROD) {
    const simulated = localStorage.getItem('4CORE_simulated_user');
    return simulated ? JSON.parse(simulated) : null;
  }
  return null;
};

export const setSimulatedUser = (user: User | null): void => {
  if (!import.meta.env.PROD) {
    if (user) {
      localStorage.setItem('4CORE_simulated_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('4CORE_simulated_user');
    }
    window.dispatchEvent(new Event('4COREUserUpdate'));
  }
};

export const DEFAULT_USERS: User[] = [
  {
    id: 'f3312dd7-8f3a-4760-81b0-7e000c2feb18',
    firstName: 'System',
    lastName: 'Administrator',
    name: 'System Administrator',
    email: 'admin@fcis.com',
    role: UserRole.SuperAdmin,
    department: 'IT',
    avatarUrl: 'https://ui-avatars.com/api/?name=System+Admin&background=0f172a&color=fff',
    status: UserStatus.Active,
    mustChangePassword: false
  },
  {
    id: 'user-director-001',
    firstName: 'Corporate',
    lastName: 'Director',
    name: 'Corporate Director',
    email: 'director@fcis.com',
    role: UserRole.Director,
    department: 'FINANCE',
    avatarUrl: 'https://ui-avatars.com/api/?name=Corporate+Director&background=1e293b&color=fff',
    status: UserStatus.Active,
    mustChangePassword: false
  },
  {
    id: '0bfc8ec6-f79e-4ac5-ad3d-f18a2cf84c60',
    firstName: 'Hnb',
    lastName: 'User',
    name: 'hnb',
    email: 'hnb@fcis.com',
    role: UserRole.Manager,
    department: 'Strategic Planning',
    avatarUrl: 'https://ui-avatars.com/api/?name=Hnb+User&background=0f766e&color=fff',
    status: UserStatus.Active,
    mustChangePassword: false
  }
];

export const getUserInitials = (user: User): string => {
  if (user.firstName && user.lastName) {
    return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
  }
  return user.name.slice(0, 2).toUpperCase();
};

export const formatUserName = (user: User): string => {
  if (user.firstName && user.lastName) {
    return `${user.firstName} ${user.lastName}`;
  }
  return user.name || user.email.split('@')[0];
};

export const isUserActive = (user: User | null): boolean => {
  return user?.status === UserStatus.Active;
};

export const needsPasswordChange = (user: User | null): boolean => {
  return user?.mustChangePassword === true;
};