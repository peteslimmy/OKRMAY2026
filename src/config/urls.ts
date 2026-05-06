/**
 * Centralized URL Configuration
 * Eliminates hardcoded URLs and ensures consistent origin across the app
 */

const getBaseUrl = (): string => {
  if (typeof window === 'undefined') return '';
  return window.location.origin;
};

export const CONFIG = {
  // Canonical origin - always derived from current window
  origin: getBaseUrl(),
  
  // Base URL for API calls (relative paths)
  api: '',
  
  // Frontend routes (relative)
  routes: {
    home: '/',
    objectives: '/objectives',
    units: '/units',
    reports: '/reports',
    attendance: '/attendance',
    settings: '/settings',
    governance: '/governance',
    quarterlyKrs: '/governance/quarterly-krs',
    violations: '/governance/violations',
    recordViolation: '/governance/violations/new',
    integrity: '/integrity',
    users: '/users',
  },
  
  // Supabase config from environment
  supabase: {
    url: import.meta.env.VITE_SUPABASE_URL || '',
    anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || '',
  },
  
  // AI Config
  ai: {
    openRouterKey: import.meta.env.VITE_OPENROUTER_API_KEY || '',
    nvidiaKey: import.meta.env.VITE_NVIDIA_API_KEY || '',
    localUrl: import.meta.env.VITE_LOCAL_AI_URL || '',
  },
} as const;

export type RouteKey = keyof typeof CONFIG.routes;

export const getRoute = (key: RouteKey): string => CONFIG.routes[key];

export const isValidOrigin = (): boolean => {
  if (typeof window === 'undefined') return false;
  const { protocol, hostname, port } = window.location;
  return protocol === 'http:' || protocol === 'https:';
};

export const safeNavigate = (path: string): void => {
  if (!isValidOrigin()) {
    console.warn('[SAFE_NAVIGATE] Blocked navigation - invalid origin:', window.location.href);
    return;
  }
  window.history.pushState(null, '', path);
};

export const safeReload = (): void => {
  if (!isValidOrigin()) {
    console.warn('[SAFE_RELOAD] Blocked reload - invalid origin:', window.location.href);
    return;
  }
  window.location.reload();
};

export default CONFIG;