import { supabase } from '../lib/supabase';
import { Objective, KeyResult, SubKR, KRVersion, StrategicAuditLog } from '../types';
import { generateId } from '../lib/utils';
import { validate } from '../utils/security';
import { 
  createError, 
  createValidationError, 
  createDatabaseError,
  createNotFoundError,
  createConflictError
} from '../utils/errors';
import { logger, logDBOperation, logError } from '../utils/logging';
import { dbCache } from '../utils/cache';

// OKR Service for handling all OKR-related database operations
export class OKRService {
  // Get current active objective
  async getCurrentObjective() {
    try {
      logDBOperation('SELECT', 'objectives', { status: 'Active' });
      
      const { data, error } = await supabase
        .from('objectives')
        .select('*')
        .eq('status', 'Active')
        .single();
      
      if (error) {
        logError(new Error(`Failed to fetch current objective: ${error.message}`));
        throw createDatabaseError('SELECT', 'objectives', error);
      }
      
      return data;
    } catch (error) {
      logError(error as Error, { operation: 'getCurrentObjective' });
      throw error;
    }
  }
  
  // Get key results for an objective
  async getKeyResults(objectiveId: string) {
    // Validate input
    if (!validate.uuid(objectiveId)) {
      throw createValidationError('objective_id', 'Invalid UUID format', objectiveId);
    }
    
    const cacheKey = `key_results_${objectiveId}`;
    const cached = dbCache.get(cacheKey);
    if (cached) {
      return cached;
    }
    
    try {
      logDBOperation('SELECT', 'key_results', { objective_id: objectiveId });
      
      const { data, error } = await supabase
        .from('key_results')
        .select('*, sub_key_results(*)')
        .eq('objective_id', objectiveId);
      
      if (error) {
        logError(new Error(`Failed to fetch key results: ${error.message}`));
        throw createDatabaseError('SELECT', 'key_results', error);
      }
      
      // Cache the result
      dbCache.set(cacheKey, data);
      
      return data;
    } catch (error) {
      logError(error as Error, { operation: 'getKeyResults', objectiveId });
      throw error;
    }
  }
  
  // Get sub key results for a key result
  async getSubKeyResults(krId: string) {
    // Validate input
    if (!validate.uuid(krId)) {
      throw createValidationError('kr_id', 'Invalid UUID format', krId);
    }
    
    const cacheKey = `sub_key_results_${krId}`;
    const cached = dbCache.get(cacheKey);
    if (cached) {
      return cached;
    }
    
    try {
      logDBOperation('SELECT', 'sub_key_results', { kr_id: krId });
      
      const { data, error } = await supabase
        .from('sub_key_results')
        .select('*')
        .eq('kr_id', krId);
      
      if (error) {
        logError(new Error(`Failed to fetch sub key results: ${error.message}`));
        throw createDatabaseError('SELECT', 'sub_key_results', error);
      }
      
      // Cache the result
      dbCache.set(cacheKey, data);
      
      return data;
    } catch (error) {
      logError(error as Error, { operation: 'getSubKeyResults', krId });
      throw error;
    }
  }
  
  // Get all objectives
  async getObjectives() {
    try {
      logDBOperation('SELECT', 'objectives');
      
      const { data, error } = await supabase.from('objectives').select('*');
      if (error) {
        logError(new Error(`Failed to fetch objectives: ${error.message}`));
        throw createDatabaseError('SELECT', 'objectives', error);
      }
      
      return data;
    } catch (error) {
      logError(error as Error, { operation: 'getObjectives' });
      throw error;
    }
  }
  
  // Get all key results for an objective
  async getObjectiveKRs(objectiveId: string) {
    try {
      logDBOperation('SELECT', 'key_results', { objective_id: objectiveId });
      
      const { data, error } = await supabase
        .from('key_results')
        .select('*')
        .eq('objective_id', objectiveId);
      
      if (error) {
        logError(new Error(`Failed to fetch KRs: ${error.message}`));
        throw createDatabaseError('SELECT', 'key_results', error);
      }
      
      return data;
    } catch (error) {
      logError(error as Error, { operation: 'getObjectiveKRs', objectiveId });
      throw error;
    }
  }
  
  // Get all sub key results for KR
  async getKRSubKRs(krId: string) {
    try {
      logDBOperation('SELECT', 'sub_key_results', { kr_id: krId });
      
      const { data, error } = await supabase
        .from('sub_key_results')
        .select('*')
        .eq('kr_id', krId);
      
      if (error) {
        logError(new Error(`Failed to fetch sub KRs: ${error.message}`));
        throw createDatabaseError('SELECT', 'sub_key_results', error);
      }
      
      return data;
    } catch (error) {
      logError(error as Error, { operation: 'getKRSubKRs', krId });
      throw error;
    }
  }
  
  // Create audit log entry
  async createAuditLog(auditData: Omit<StrategicAuditLog, 'id' | 'timestamp'>) {
    try {
      logDBOperation('INSERT', 'audit_logs', auditData);
      
      const { data, error } = await supabase
        .from('audit_logs')
        .insert([auditData])
        .select()
        .single();
      
      if (error) {
        logError(new Error(`Failed to create audit log: ${error.message}`));
        throw createDatabaseError('INSERT', 'audit_logs', error);
      }
      
      return data;
    } catch (error) {
      logError(error as Error, { operation: 'createAuditLog', auditData: auditData });
      throw error;
    }
  }
  
  // Update a sub KR progress value
  async updateSubKRProgress(subKrId: string, progress: number) {
    try {
      logDBOperation('UPDATE', 'sub_key_results', { sub_kr_id: subKrId, progress });
      
      // Validate progress value
      if (progress < 0 || progress > 100) {
        throw createValidationError('progress', 'Progress must be between 0 and 100', progress);
      }
      
      const { data, error } = await supabase
        .from('sub_key_results')
        .update({ progress })
        .eq('id', subKrId)
        .select()
        .single();
      
      if (error) {
        logError(new Error(`Failed to update sub KR progress: ${error.message}`));
        throw createDatabaseError('UPDATE', 'sub_key_results', error);
      }
      
      return data;
    } catch (error) {
      logError(error as Error, { operation: 'updateSubKRProgress', subKrId, progress });
      throw error;
    }
  }
  
  // Get audit logs
  async getAuditLogs() {
    try {
      logDBOperation('SELECT', 'audit_logs');
      
      const { data, error } = await supabase
        .from('audit_logs')
        .select('*')
        .order('timestamp', { ascending: false });
      
      if (error) {
        logError(new Error(`Failed to fetch audit logs: ${error.message}`));
        throw createDatabaseError('SELECT', 'audit_logs', error);
      }
      
      return data;
    } catch (error) {
      logError(error as Error, { operation: 'getAuditLogs' });
      throw error;
    }
  }
  
  // Lock objective
  async lockObjective(objectiveId: string) {
    try {
      logDBOperation('UPDATE', 'objectives', { id: objectiveId, status: 'Locked' });
      
      const { data, error } = await supabase
        .from('objectives')
        .update({ status: 'Locked' })
        .eq('id', objectiveId)
        .select()
        .single();
      
      if (error) {
        logError(new Error(`Failed to lock objective: ${error.message}`));
        throw createDatabaseError('UPDATE', 'objectives', error);
      }
      
      return data;
    } catch (error) {
      logError(error as Error, { operation: 'lockObjective', objectiveId });
      throw error;
    }
  }
}