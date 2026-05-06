import { Injectable, Logger } from '@nestjs/common';
import { SupabaseService } from './supabase.service';

export interface ViolationCategory {
  id: string;
  name: string;
  description: string;
  severity_level: 'Minor' | 'Major' | 'Critical';
  default_fine_amount: number;
  created_at: string;
  updated_at: string;
  created_by: string;
  updated_by: string;
  version: number;
  is_active: boolean;
}

export interface Violation {
  id: string;
  category_id: string;
  violator_id: string;
  bu_id: string;
  week_reference: string;
  notes: string;
  status: 'UNPAID' | 'PAID' | 'VOID';
  created_at: string;
  updated_at: string;
}

export interface ViolationPayment {
  id: string;
  violation_id: string;
  amount: number;
  payment_method: string;
  payment_reference: string;
  paid_at: string;
}

export interface FundLedgerEntry {
  id: string;
  entry_type: 'CREDIT' | 'DEBIT';
  amount: number;
  description: string;
  created_at: string;
  created_by: string;
}

export interface DisbursementRequest {
  id: string;
  amount: number;
  purpose: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  requested_by: string;
  approved_by: string;
  created_at: string;
  updated_at: string;
}

@Injectable()
export class ViolationService {
  private readonly logger = new Logger(ViolationService.name);

  constructor(private readonly supabase: SupabaseService) {}

  // Violation Configuration Engine
  async createViolationCategory(category: Omit<ViolationCategory, 'id' | 'created_at' | 'updated_at' | 'version'>) {
    try {
      const newCategory = {
        ...category,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        version: 1
      };
      
      const { data, error } = await this.supabase.client
        .from('violation_categories')
        .insert([newCategory])
        .select()
        .single();
      
      if (error) throw error;
      
      // Log audit
      await this.logAudit('VIOLATION_CATEGORY_CREATED', data.id, 'SYSTEM');
      
      return data;
    } catch (error) {
      this.logger.error('Error creating violation category:', error);
      throw error;
    }
  }

  async getViolationCategories() {
    try {
      const { data, error } = await this.supabase.client
        .from('violation_categories')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    } catch (error) {
      this.logger.error('Error fetching violation categories:', error);
      throw error;
    }
  }

  // Violation Capture Engine
  async createViolation(violation: Omit<Violation, 'id' | 'created_at' | 'updated_at'>) {
    try {
      const newViolation = {
        ...violation,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      const { data, error } = await this.supabase.client
        .from('violations')
        .insert([newViolation])
        .select()
        .single();
      
      if (error) throw error;
      
      // Log audit
      await this.logAudit('VIOLATION_CREATED', data.id, 'SYSTEM');
      
      // Emit event
      this.emitEvent('VIOLATION_CREATED', data);
      
      return data;
    } catch (error) {
      this.logger.error('Error creating violation:', error);
      throw error;
    }
  }

  async getViolations() {
    try {
      const { data, error } = await this.supabase.client
        .from('violations')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    } catch (error) {
      this.logger.error('Error fetching violations:', error);
      throw error;
    }
  }

  // Payment Tracking Engine
  async payViolation(violationId: string, payment: Omit<ViolationPayment, 'id' | 'violation_id' | 'paid_at'>) {
    try {
      // Update violation status
      const { data: violation, error: violationError } = await this.supabase.client
        .from('violations')
        .update({ status: 'PAID' })
        .eq('id', violationId)
        .select()
        .single();
      
      if (violationError) throw violationError;
      
      // Create payment record
      const paymentData = {
        violation_id: violationId,
        ...payment,
        paid_at: new Date().toISOString()
      };
      
      const { data: paymentRecord, error: paymentError } = await this.supabase.client
        .from('violation_payments')
        .insert([paymentData])
        .select()
        .single();
      
      if (paymentError) throw paymentError;
      
      // Create ledger entry
      await this.createLedgerEntry({
        entry_type: 'CREDIT',
        amount: payment.amount,
        description: `Payment for violation ${violationId}`,
        created_by: paymentRecord.paid_at
      });
      
      // Log audit
      await this.logAudit('VIOLATION_PAID', violationId, 'SYSTEM');
      
      // Emit event
      this.emitEvent('VIOLATION_PAID', paymentRecord);
      
      return paymentRecord;
    } catch (error) {
      this.logger.error('Error paying violation:', error);
      throw error;
    }
  }

  // Ledger System
  async createLedgerEntry(entry: Omit<FundLedgerEntry, 'id'>) {
    try {
      const ledgerEntry = {
        ...entry,
        id: crypto.randomUUID(),
        created_at: new Date().toISOString()
      };
      
      const { data, error } = await this.supabase.client
        .from('fund_ledger')
        .insert([ledgerEntry])
        .select()
        .single();
      
      if (error) throw error;
      
      return data;
    } catch (error) {
      this.logger.error('Error creating ledger entry:', error);
      throw error;
    }
  }

  async getLedger() {
    try {
      const { data, error } = await this.supabase.client
        .from('fund_ledger')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    } catch (error) {
      this.logger.error('Error fetching ledger:', error);
      throw error;
    }
  }

  // Disbursement Workflow Engine
  async createDisbursementRequest(request: Omit<DisbursementRequest, 'id' | 'created_at' | 'updated_at' | 'status'>) {
    try {
      const newRequest = {
        ...request,
        status: 'PENDING',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      const { data, error } = await this.supabase.client
        .from('disbursement_requests')
        .insert([newRequest])
        .select()
        .single();
      
      if (error) throw error;
      
      return data;
    } catch (error) {
      this.logger.error('Error creating disbursement request:', error);
      throw error;
    }
  }

  async approveDisbursement(requestId: string, approvedBy: string) {
    try {
      const { data, error } = await this.supabase.client
        .from('disbursement_requests')
        .update({ 
          status: 'APPROVED',
          approved_by: approvedBy,
          updated_at: new Date().toISOString()
        })
        .eq('id', requestId)
        .select()
        .single();
      
      if (error) throw error;
      
      // Create ledger entry
      await this.createLedgerEntry({
        entry_type: 'DEBIT',
        amount: data.amount,
        description: `Disbursement approved: ${data.purpose}`,
        created_by: approvedBy
      });
      
      // Log audit
      await this.logAudit('DISBURSEMENT_APPROVED', requestId, approvedBy);
      
      return data;
    } catch (error) {
      this.logger.error('Error approving disbursement:', error);
      throw error;
    }
  }

  // Audit & Compliance Engine
  async logAudit(action: string, entityId: string, performedBy: string) {
    try {
      const auditLog = {
        entity_type: 'violation',
        entity_id: entityId,
        action,
        performed_by: performedBy,
        timestamp: new Date().toISOString()
      };
      
      const { error } = await this.supabase.client
        .from('audit_logs_violations')
        .insert([auditLog]);
      
      if (error) throw error;
    } catch (error) {
      this.logger.error('Error logging audit:', error);
      throw error;
    }
  }

  // Event system
  emitEvent(eventName: string, data: any) {
    // In a real implementation, this would emit to an event bus
    this.logger.log(`Event emitted: ${eventName}`, data);
  }

  // Reporting & Analytics Layer
  async getViolationReport() {
    try {
      const { data: violations, error: violationsError } = await this.supabase.client
        .from('violations')
        .select('*');
      
      if (violationsError) throw violationsError;
      
      const { data: categories, error: categoriesError } = await this.supabase.client
        .from('violation_categories')
        .select('*');
      
      if (categoriesError) throw categoriesError;
      
      // Process data for reporting
      const report = {
        totalViolations: violations.length,
        violationsByBU: this.groupViolationsByBU(violations),
        violationsByCategory: this.groupViolationsByCategory(violations, categories),
        outstandingPayments: violations.filter(v => v.status === 'UNPAID').length
      };
      
      return report;
    } catch (error) {
      this.logger.error('Error generating violation report:', error);
      throw error;
    }
  }

  private groupViolationsByBU(violations: any[]) {
    const grouped: Record<string, any[]> = {};
    violations.forEach(violation => {
      if (!grouped[violation.bu_id]) {
        grouped[violation.bu_id] = [];
      }
      grouped[violation.bu_id].push(violation);
    });
    return grouped;
  }

  private groupViolationsByCategory(violations: any[], categories: any[]) {
    const grouped: Record<string, any[]> = {};
    violations.forEach(violation => {
      const category = categories.find(c => c.id === violation.category_id);
      if (category) {
        if (!grouped[category.name]) {
          grouped[category.name] = [];
        }
        grouped[category.name].push(violation);
      }
    });
    return grouped;
  }

  // Anomaly detection engine
  async detectAnomalies() {
    try {
      const { data: violations, error } = await this.supabase.client
        .from('violations')
        .select('*')
        .limit(100)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      const anomalies = [];
      
      // Detect bulk violation creation
      const recentViolations = violations.slice(0, 10);
      if (recentViolations.length >= 5) {
        const violatorCounts: Record<string, number> = {};
        recentViolations.forEach(v => {
          violatorCounts[v.violator_id] = (violatorCounts[v.violator_id] || 0) + 1;
        });
        
        for (const [violator, count] of Object.entries(violatorCounts)) {
          if (count > 3) {
            anomalies.push({
              type: 'bulk_violation_creation',
              violator,
              count,
              message: `User ${violator} created ${count} violations recently`
            });
          }
        }
      }
      
      return anomalies;
    } catch (error) {
      this.logger.error('Error detecting anomalies:', error);
      throw error;
    }
  }
}