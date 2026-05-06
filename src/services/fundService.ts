/**
 * 4CORE Fund Disbursement Service
 * Multi-step workflow: REQUESTED → APPROVED_FINANCE → APPROVED_SUPERADMIN → DISBURSED
 */

import { supabase } from '../lib/supabase';
import { logAudit } from '../utils';

export interface FundRequest {
  id: string;
  request_number: string;
  bu_id: string;
  bu_name: string;
  amount: number;
  purpose: string;
  category: 'OPERATIONS' | 'MARKETING' | 'TRAINING' | 'EQUIPMENT' | 'OTHER';
  status: 'REQUESTED' | 'APPROVED_FINANCE' | 'APPROVED_SUPERADMIN' | 'DISBURSED' | 'REJECTED';
  requested_by: string;
  requested_by_name: string;
  requested_at: string;
  finance_approved_at: string | null;
  finance_notes: string | null;
  super_admin_approved_at: string | null;
  super_admin_notes: string | null;
  disbursed_at: string | null;
  receipt_url: string | null;
  rejection_reason: string | null;
  approval_level: number;
}

export interface ViolationLedgerEntry {
  id: string;
  violation_id: string;
  user_id: string;
  user_name: string;
  amount: number;
  status: 'PENDING' | 'PAID' | 'WAIVED' | 'DISPUTED';
  payment_method: 'CASH' | 'TRANSFER' | 'DEDUCTION' | null;
  reference_number: string | null;
  paid_at: string | null;
  receipt_url: string | null;
}

export interface ViolationCategory {
  id: string;
  name: string;
  description: string;
  default_amount: number;
  severity: 'MINOR' | 'MAJOR' | 'CRITICAL';
  grace_period_hours: number;
  is_active: boolean;
}

const getSessionUser = async (): Promise<{ id: string; name: string; role: string } | null> => {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user) return null;
  
  const { data: profile } = await supabase
    .from('profiles')
    .select('id, name, role')
    .eq('auth_id', session.user.id)
    .single();
  
  if (!profile) return null;
  return { id: profile.id, name: profile.name, role: profile.role };
};

export const createFundRequest = async (
  buId: string,
  amount: number,
  purpose: string,
  category: string
): Promise<{ success: boolean; requestId?: string; error?: string }> => {
  const user = await getSessionUser();
  if (!user) return { success: false, error: 'Authentication required' };
  
  try {
    const { data, error } = await supabase.rpc('request_fund_disbursement', {
      p_bu_id: buId,
      p_amount: amount,
      p_purpose: purpose,
      p_category: category
    });
    
    if (error) throw error;
    return { success: true, requestId: data };
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Unknown error';
    return { success: false, error: message };
  }
};

export const approveByFinance = async (
  requestId: string,
  notes: string
): Promise<{ success: boolean; error?: string }> => {
  const user = await getSessionUser();
  if (!user) return { success: false, error: 'Authentication required' };
  if (!['SuperAdmin', 'Admin'].includes(user.role)) {
    return { success: false, error: 'Finance/Admin access required' };
  }
  
  try {
    const { error } = await supabase.rpc('approve_fund_by_finance', {
      p_request_id: requestId,
      p_notes: notes
    });
    
    if (error) throw error;
    await logAudit('FUND_APPROVAL', `Finance approved fund request ${requestId}`, undefined, undefined, { requestId });
    return { success: true };
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Unknown error';
    return { success: false, error: message };
  }
};

export const approveBySuperAdmin = async (
  requestId: string,
  notes: string
): Promise<{ success: boolean; error?: string }> => {
  const user = await getSessionUser();
  if (!user) return { success: false, error: 'Authentication required' };
  if (user.role !== 'SuperAdmin') {
    return { success: false, error: 'Super Admin access required' };
  }
  
  try {
    const { error } = await supabase.rpc('approve_fund_by_super_admin', {
      p_request_id: requestId,
      p_notes: notes
    });
    
    if (error) throw error;
    await logAudit('FUND_APPROVAL', `Super Admin approved fund request ${requestId}`, undefined, undefined, { requestId });
    return { success: true };
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Unknown error';
    return { success: false, error: message };
  }
};

export const disburseFund = async (
  requestId: string,
  receiptUrl: string
): Promise<{ success: boolean; error?: string }> => {
  const user = await getSessionUser();
  if (!user) return { success: false, error: 'Authentication required' };
  
  try {
    const { error } = await supabase.rpc('disburse_fund', {
      p_request_id: requestId,
      p_receipt_url: receiptUrl
    });
    
    if (error) throw error;
    await logAudit('FUND_DISBURSEMENT', `Fund disbursed for request ${requestId}`, undefined, undefined, { requestId, receiptUrl });
    return { success: true };
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Unknown error';
    return { success: false, error: message };
  }
};

export const rejectFundRequest = async (
  requestId: string,
  reason: string
): Promise<{ success: boolean; error?: string }> => {
  const user = await getSessionUser();
  if (!user) return { success: false, error: 'Authentication required' };
  
  try {
    const { error } = await supabase.rpc('reject_fund_request', {
      p_request_id: requestId,
      p_reason: reason
    });
    
    if (error) throw error;
    await logAudit('FUND_REJECTION', `Fund request ${requestId} rejected: ${reason}`, undefined, undefined, { requestId });
    return { success: true };
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Unknown error';
    return { success: false, error: message };
  }
};

export const getFundRequests = async (status?: string): Promise<FundRequest[]> => {
  try {
    let query = supabase
      .from('v_fund_requests')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (status) query = query.eq('status', status);
    
    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  } catch (e) {
    console.error('[Fund] Get requests error:', e);
    return [];
  }
};

export const recordViolationPayment = async (
  violationId: string,
  userId: string,
  amount: number,
  paymentMethod: 'CASH' | 'TRANSFER' | 'DEDUCTION',
  reference: string
): Promise<{ success: boolean; ledgerId?: string; error?: string }> => {
  const user = await getSessionUser();
  if (!user) return { success: false, error: 'Authentication required' };
  
  try {
    const { data, error } = await supabase.rpc('record_violation_payment', {
      p_violation_id: violationId,
      p_user_id: userId,
      p_amount: amount,
      p_payment_method: paymentMethod,
      p_reference: reference
    });
    
    if (error) throw error;
    return { success: true, ledgerId: data };
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Unknown error';
    return { success: false, error: message };
  }
};

export const getViolationLedger = async (userId?: string): Promise<ViolationLedgerEntry[]> => {
  try {
    let query = supabase
      .from('v_violation_ledger_summary')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (userId) query = query.eq('user_id', userId);
    
    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  } catch (e) {
    console.error('[Fund] Get ledger error:', e);
    return [];
  }
};

export const getViolationCategories = async (): Promise<ViolationCategory[]> => {
  try {
    const { data, error } = await supabase
      .from('violation_categories')
      .select('*')
      .eq('is_active', true);
    
    if (error) throw error;
    return data || [];
  } catch (e) {
    console.error('[Fund] Get categories error:', e);
    return [];
  }
};

export const formatAmount = (value: number): string => {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 0
  }).format(value);
};

export const getStatusColor = (status: string): 'success' | 'warning' | 'error' | 'neutral' => {
  switch (status) {
    case 'DISBURSED':
    case 'PAID':
      return 'success';
    case 'APPROVED_FINANCE':
    case 'APPROVED_SUPERADMIN':
      return 'warning';
    case 'REJECTED':
      return 'error';
    default:
      return 'neutral';
  }
};

export const getApprovalProgress = (status: string): number => {
  switch (status) {
    case 'REQUESTED':
      return 25;
    case 'APPROVED_FINANCE':
      return 50;
    case 'APPROVED_SUPERADMIN':
      return 75;
    case 'DISBURSED':
      return 100;
    default:
      return 0;
  }
};