/**
 * 4CORE OKR Platform - Supabase Client
 * Supports real Supabase (production) and mock mode (development)
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { 
  MOCK_USERS, MOCK_BUSINESS_UNITS, MOCK_OBJECTIVES, MOCK_KEY_RESULTS,
  MOCK_AUDIT_LOGS, MOCK_VIOLATIONS, MOCK_ATTENDANCE, generateMockActivities,
  MOCK_GOVERNANCE_CONFIG
} from '../utils/mock-service';
import { logger } from '../lib/logger';

const getEnv = (key: string, fallback = ''): string => {
  return (import.meta.env[key] as string) || fallback;
};

const supabaseUrl = getEnv('VITE_SUPABASE_URL');
const supabaseAnonKey = getEnv('VITE_SUPABASE_ANON_KEY');
const supabaseServiceKey = getEnv('VITE_SUPABASE_SERVICE_KEY');
const SIMULATION_MODE = getEnv('VITE_SIMULATION_MODE') === 'true';
const EXPLICIT_MOCK = getEnv('VITE_USE_MOCK') === 'true';
const IS_DEV = import.meta.env.DEV;
const IS_PROD = import.meta.env.PROD;

// Force real Supabase when SIMULATION_MODE is FALSE
const FORCE_REAL = !SIMULATION_MODE && supabaseUrl && supabaseAnonKey;

if (IS_PROD && FORCE_REAL === false) {
  throw new Error('CRITICAL: Mock mode must NEVER run in production');
}

const USE_MOCK = FORCE_REAL ? false : ((IS_DEV && (!supabaseUrl || !supabaseAnonKey || SIMULATION_MODE)) || EXPLICIT_MOCK);

if (USE_MOCK && !IS_DEV) {
  throw new Error('CRITICAL: Mock mode cannot be enabled outside of development');
}

let supabase: SupabaseClient;
let supabaseAdmin: SupabaseClient | null = null;

if (USE_MOCK) {
  logger.info('[SUPABASE] Using MOCK mode - all data is simulated');
  supabase = createMockClient();
  if (supabaseServiceKey) {
    supabaseAdmin = createMockClient();
  }
} else {
  const realUrl = supabaseUrl || 'https://placeholder.supabase.co';
  const realKey = supabaseAnonKey || 'placeholder-key';
  
  if (realUrl.includes('placeholder') && import.meta.env.PROD) {
    throw new Error('Missing required environment variables: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY must be set in production');
  }
  
  supabase = createClient(realUrl, realKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    }
  });
  
  if (supabaseServiceKey) {
    supabaseAdmin = createClient(realUrl, supabaseServiceKey, {
      auth: { persistSession: false, autoRefreshToken: false }
    });
  }
}

// ============================================================================
// Mock Client Implementation
// ============================================================================

function createMockClient(): SupabaseClient {
  const activities = generateMockActivities(12, 2026);
  const db: Record<string, any[]> = {
    profiles: MOCK_USERS.map(u => ({ ...u, auth_id: u.id })),
    business_units: [...MOCK_BUSINESS_UNITS],
    objectives: [...MOCK_OBJECTIVES],
    key_results: [...MOCK_KEY_RESULTS],
    activities: activities,
    goals: activities,
    audit_logs: [...MOCK_AUDIT_LOGS],
    violations: [...MOCK_VIOLATIONS],
    attendance: [...MOCK_ATTENDANCE],
    governance_config: [MOCK_GOVERNANCE_CONFIG],
  };

  class MockQuery<T> {
    private _table: string;
    private _select: string = '*';
    private _filters: { column: string; operator: string; value: any }[] = [];
    private _limitVal?: number;
    private _order?: { column: string; ascending: boolean };
    private _singleVal = false;
    private _headVal = false;
    private _action?: 'insert' | 'update' | 'upsert' | 'delete';
    private _payload?: any;
    private _countExact = false;

    constructor(table: string) {
      this._table = table;
    }

    select(columns: string, options?: { count?: 'exact' | 'estimated' | null }) {
      this._select = columns;
      if (options?.count === 'exact') this._countExact = true;
      return this;
    }

    eq(column: string, value: any) { this._filters.push({ column, operator: '=', value }); return this; }
    neq(column: string, value: any) { this._filters.push({ column, operator: '!=', value }); return this; }
    gt(column: string, value: any) { this._filters.push({ column, operator: '>', value }); return this; }
    lt(column: string, value: any) { this._filters.push({ column, operator: '<', value }); return this; }
    in(column: string, values: any[]) { this._filters.push({ column, operator: 'in', value: values }); return this; }
    is(val: string) { this._singleVal = true; return this; }
    single() { this._singleVal = true; return this; }
    head() { this._headVal = true; return this; }
    limit(count: number) { this._limitVal = count; return this; }
    order(column: string, options?: { ascending?: boolean }) {
      this._order = { column, ascending: options?.ascending ?? true };
      return this;
    }

    insert(data: any) { this._action = 'insert'; this._payload = Array.isArray(data) ? data : [data]; return this as any; }
    update(data: any) { this._action = 'update'; this._payload = data; return this as any; }
    upsert(data: any) { this._action = 'upsert'; this._payload = Array.isArray(data) ? data : [data]; return this as any; }
    delete() { this._action = 'delete'; return this as any; }

    async execute(): Promise<{ data: any; error: any }> {
      try {
        const tableData = db[this._table] || [];

        // Mutations
        if (this._action === 'insert') {
          const newRecords = this._payload.map((record: any) => ({
            ...record,
            id: record.id || `mock-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
            created_at: new Date().toISOString()
          }));
          db[this._table] = [...tableData, ...newRecords];
          return { data: newRecords, error: null };
        }

        if (this._action === 'update') {
          let updatedCount = 0;
          db[this._table] = tableData.map(record => {
            if (this._matchesFilters(record)) {
              updatedCount++;
              return { ...record, ...this._payload, updated_at: new Date().toISOString() };
            }
            return record;
          });
          return { data: [{ id: updatedCount }], error: null };
        }

        if (this._action === 'upsert') {
          const inserted: any[] = [];
          for (const record of this._payload) {
            const existingIdx = tableData.findIndex(r => this._matchesSingle(r, record.id || record.auth_id));
            if (existingIdx >= 0) {
              db[this._table][existingIdx] = { ...tableData[existingIdx], ...record, updated_at: new Date().toISOString() };
            } else {
              const newRec = {
                ...record,
                id: record.id || `mock-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
                created_at: new Date().toISOString()
              };
              db[this._table].push(newRec);
              inserted.push(newRec);
            }
          }
          return { data: inserted, error: null };
        }

        if (this._action === 'delete') {
          const initialLength = tableData.length;
          db[this._table] = tableData.filter(record => !this._matchesFilters(record));
          return { data: [{ id: initialLength - db[this._table].length }], error: null };
        }

        // SELECT queries
        let results = [...tableData];
        for (const filter of this._filters) {
          results = results.filter(row => {
            const val = row[filter.column];
            switch (filter.operator) {
              case '=': return val === filter.value;
              case '!=': return val !== filter.value;
              case '>': return val > filter.value;
              case '<': return val < filter.value;
              case 'in': return filter.value.includes(val);
              default: return true;
            }
          });
        }

        if (this._order) {
          results.sort((a, b) => {
            const aVal = a[this._order!.column];
            const bVal = b[this._order!.column];
            if (aVal < bVal) return this._order!.ascending ? -1 : 1;
            if (aVal > bVal) return this._order!.ascending ? 1 : -1;
            return 0;
          });
        }

        if (this._limitVal) results = results.slice(0, this._limitVal);

        if (this._select === 'count' && this._countExact) {
          return { data: { count: results.length }, error: null };
        }

        if (this._singleVal || this._headVal) {
          return { data: results.length > 0 ? results[0] : null, error: null };
        }

        return { data: results as T[], error: null };
      } catch (err) {
        logger.error('[MOCK] Query error:', err);
        return { data: null, error: { message: 'Mock query failed' } };
      }
    }

    private _matchesFilters(record: any): boolean {
      return this._filters.every(f => {
        const val = record[f.column];
        switch (f.operator) {
          case '=': return val === f.value;
          case '!=': return val !== f.value;
          case '>': return val > f.value;
          case '<': return val < f.value;
          case 'in': return f.value.includes(val);
          default: return true;
        }
      });
    }

    private _matchesSingle(record: any, id: string): boolean {
      return record.id === id;
    }

    then<T>(resolve: (value: { data: T | T[] | null; error: any }) => void, _reject: (reason?: any) => void) {
      this.execute().then(resolve);
      return this;
    }
  }

  const mockSupabase: SupabaseClient = {
    from: <T>(table: string) => new MockQuery<T>(table),
    
    auth: {
      getSession: async () => ({
        data: { session: { user: { id: MOCK_USERS[0].id, email: MOCK_USERS[0].email, aud: 'authenticated' } } },
        error: null
      }),
      signInWithPassword: async ({ email }: { email: string }) => {
        const user = MOCK_USERS.find(u => u.email === email) || MOCK_USERS[0];
        return { data: { session: { user: { id: user.id, email: user.email } } }, error: null };
      },
      signOut: async () => ({ error: null }),
      onAuthStateChange: (callback: (event: string, session: any) => void) => {
        callback('SIGNED_IN', { user: { id: MOCK_USERS[0].id } });
        const { unsubscribe } = { unsubscribe: () => {} };
        return { data: { subscription: { unsubscribe } } };
      }
    } as any,
    
    storage: {
      from: () => ({
        upload: async () => ({ data: { path: 'mock' }, error: null }),
        getPublicUrl: (path: string) => ({ data: { publicUrl: `https://mock/${path}` } })
      })
    }
  };

  return mockSupabase;
}

// ============================================================================
// Health Check
// ============================================================================

export const checkConnection = async (): Promise<boolean> => {
  if (USE_MOCK) return true;
  try {
    const { error } = await supabase.from('activities').select('count', { count: 'exact', head: true });
    return !error;
  } catch {
    return false;
  }
};

export { supabase, supabaseAdmin };
