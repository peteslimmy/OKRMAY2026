/**
 * Manual Unlock Workflow
 * BU Lead → Request → SuperAdmin/Admin → Approval → 1hr edit window
 */

import { supabase } from '../lib/supabase';
import { logAudit } from '../utils';
import type { User } from '../types';
import type { UnlockRequest } from '../types/unlockRequest';

interface SessionUserResult {
  id: string;
  name: string;
  role: string;
}

const getSessionUser = async (): Promise<SessionUserResult | null> => {
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

const generateLocalUUID = (): string => crypto.randomUUID();

export const createUnlockRequest = async (
  week: number, 
  year: number, 
  reason: string
): Promise<{ success: boolean; requestId?: string; error?: string }> => {
  if (!reason.trim() || reason.trim().length < 20) {
    return { success: false, error: 'A formal reason (minimum 20 characters) is required.' };
  }
  
  const user = await getSessionUser();
  if (!user) return { success: false, error: 'Authentication required.' };
  
  const request: UnlockRequest = {
    id: generateLocalUUID(),
    week,
    year,
    requestedById: user.id,
    requestedByName: user.name,
    reason: reason.trim(),
    status: 'PENDING',
    createdAt: new Date().toISOString()
  };
  
  try {
    const { error } = await supabase.from('unlock_requests').insert([{
      id: request.id,
      week: request.week,
      year: request.year,
      requested_by_id: request.requestedById,
      requested_by_name: request.requestedByName,
      reason: request.reason,
      status: request.status,
      created_at: request.createdAt
    }]);
    
    if (error) throw error;
    
    await logAudit('CREATE', `Unlock requested for Week ${week}/${year}: ${reason.substring(0, 50)}...`, undefined, undefined, {
      unlockRequestId: request.id,
      week,
      year
    });
    
    return { success: true, requestId: request.id };
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Unknown error';
    return { success: false, error: message };
  }
};

export const approveUnlockRequest = async (
  requestId: string, 
  note: string
): Promise<{ success: boolean; error?: string }> => {
  const user = await getSessionUser();
  if (!user) return { success: false, error: 'Authentication required.' };
  if (!['SuperAdmin', 'Admin'].includes(user.role)) {
    return { success: false, error: 'Insufficient permissions.' };
  }
  
  const oneHourLater = new Date();
  oneHourLater.setTime(oneHourLater.getTime() + 60 * 60 * 1000);
  
  try {
    const { error } = await supabase.from('unlock_requests').update({
      status: 'APPROVED',
      reviewed_by_id: user.id,
      reviewed_by_name: user.name,
      review_note: note,
      expires_at: oneHourLater.toISOString()
    }).eq('id', requestId).eq('status', 'PENDING');
    
    if (error) throw error;
    
    await logAudit('UPDATE', `Unlock request ${requestId} APPROVED by ${user.name}: ${note}`, undefined, undefined, {
      unlockRequestId: requestId,
      expiresAt: oneHourLater.toISOString()
    });
    
    return { success: true };
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Unknown error';
    return { success: false, error: message };
  }
};

export const rejectUnlockRequest = async (
  requestId: string, 
  reason: string
): Promise<{ success: boolean; error?: string }> => {
  const user = await getSessionUser();
  if (!user) return { success: false, error: 'Authentication required.' };
  if (!['SuperAdmin', 'Admin'].includes(user.role)) {
    return { success: false, error: 'Insufficient permissions.' };
  }
  
  try {
    const { error } = await supabase.from('unlock_requests').update({
      status: 'REJECTED',
      reviewed_by_id: user.id,
      reviewed_by_name: user.name,
      review_note: reason
    }).eq('id', requestId).eq('status', 'PENDING');
    
    if (error) throw error;
    
    await logAudit('UPDATE', `Unlock request ${requestId} REJECTED by ${user.name}: ${reason}`, undefined, undefined, {
      unlockRequestId: requestId
    });
    
    return { success: true };
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Unknown error';
    return { success: false, error: message };
  }
};

export const getUnlockRequests = async (status?: string): Promise<UnlockRequest[]> => {
  try {
    let query = supabase.from('unlock_requests').select('*').order('created_at', { ascending: false });
    if (status) query = query.eq('status', status);
    const { data, error } = await query;
    if (error) throw error;
    
    return (data || []).map(row => ({
      id: row.id,
      week: row.week,
      year: row.year,
      requestedById: row.requested_by_id,
      requestedByName: row.requested_by_name,
      reason: row.reason,
      status: row.status,
      reviewedById: row.reviewed_by_id,
      reviewedByName: row.reviewed_by_name,
      reviewNote: row.review_note,
      createdAt: row.created_at,
      expiresAt: row.expires_at
    }));
  } catch {
    return [];
  }
};

export const isUnlockApproved = async (
  week: number, 
  year: number
): Promise<{ approved: boolean; expiresAt?: string; requestId?: string }> => {
  try {
    const { data } = await supabase
      .from('unlock_requests')
      .select('*')
      .eq('week', week)
      .eq('year', year)
      .eq('status', 'APPROVED')
      .single();
    
    if (!data) return { approved: false };
    
    const expiresAt = new Date(data.expires_at);
    if (expiresAt < new Date()) {
      await supabase.from('unlock_requests').update({ status: 'EXPIRED' }).eq('id', data.id);
      return { approved: false };
    }
    
    return { approved: true, expiresAt: data.expires_at, requestId: data.id };
  } catch {
    return { approved: false };
  }
};