/**
 * 4CORE Anomaly Detection Engine
 * Flags: mass status changes, out-of-window toggles, suspicious patterns
 */

import { supabase } from '../lib/supabase';
import { logAudit } from '../utils';

export interface AnomalyAlert {
  id: string;
  type: AnomalyType;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  userId: string;
  userName: string;
  description: string;
  details: Record<string, unknown>;
  timestamp: string;
}

export type AnomalyType = 
  | 'MASS_STATUS_CHANGE'
  | 'OUT_OF_WINDOW_TOGGLE'
  | 'SCORE_SPIKE'
  | 'REPETITIVE_GOAL'
  | 'BUYER_DEVIATION'
  | 'LOCK_BYPASS_ATTEMPT';

const WINDOW_ALERT_THRESHOLD = 10;
const SCORE_SPIKE_THRESHOLD = 50;

let recentToggleTimestamps: { userId: string; timestamp: number }[] = [];

export const detectAnomalies = async (
  userId: string,
  userName: string,
  action: 'task_toggle' | 'score_update' | 'goal_create' | 'goal_modify',
  context: Record<string, unknown>
): Promise<AnomalyAlert[]> => {
  const alerts: AnomalyAlert[] = [];
  const now = Date.now();
  const oneMinuteAgo = now - 60000;

  if (action === 'task_toggle') {
    recentToggleTimestamps = recentToggleTimestamps.filter(t => t.timestamp > oneMinuteAgo);
    recentToggleTimestamps.push({ userId, timestamp: now });
    
    const userToggles = recentToggleTimestamps.filter(t => t.userId === userId);
    if (userToggles.length > WINDOW_ALERT_THRESHOLD) {
      alerts.push({
        id: crypto.randomUUID(),
        type: 'MASS_STATUS_CHANGE',
        severity: 'HIGH',
        userId,
        userName,
        description: `${userName} toggled ${userToggles.length} tasks in the last minute (threshold: ${WINDOW_ALERT_THRESHOLD})`,
        details: { toggleCount: userToggles.length, threshold: WINDOW_ALERT_THRESHOLD },
        timestamp: new Date().toISOString()
      });
    }
  }

  if (action === 'task_toggle' && context.lockState === 'HARD_LOCKED') {
    alerts.push({
      id: crypto.randomUUID(),
      type: 'OUT_OF_WINDOW_TOGGLE',
      severity: 'CRITICAL',
      userId,
      userName,
      description: `Toggle attempt on HARD_LOCKED goal by ${userName}`,
      details: { goalId: context.goalId, week: context.week, year: context.year },
      timestamp: new Date().toISOString()
    });
  }

  if (action === 'score_update' && context.previousScore !== undefined && context.newScore !== undefined) {
    const delta = (context.newScore as number) - (context.previousScore as number);
    if (delta > SCORE_SPIKE_THRESHOLD) {
      alerts.push({
        id: crypto.randomUUID(),
        type: 'SCORE_SPIKE',
        severity: 'MEDIUM',
        userId,
        userName,
        description: `Score jumped ${delta}% for ${userName} (${context.previousScore}% → ${context.newScore}%)`,
        details: { previousScore: context.previousScore, newScore: context.newScore, delta },
        timestamp: new Date().toISOString()
      });
    }
  }

  if (action === 'goal_modify' && context.lockState === 'HARD_LOCKED') {
    alerts.push({
      id: crypto.randomUUID(),
      type: 'LOCK_BYPASS_ATTEMPT',
      severity: 'CRITICAL',
      userId,
      userName,
      description: `Modification attempt on HARD_LOCKED goal by ${userName} - possible bypass`,
      details: { goalId: context.goalId, week: context.week, year: context.year },
      timestamp: new Date().toISOString()
    });
    
    await logAudit('SYSTEM', `LOCK BYPASS ALERT: ${userName} attempted modification on HARD_LOCKED goal`, undefined, undefined, {
      alertType: 'LOCK_BYPASS_ATTEMPT',
      userId,
      goalId: context.goalId
    });
  }

  for (const alert of alerts) {
    try {
      await supabase.from('anomaly_alerts').insert([{
        id: alert.id,
        type: alert.type,
        severity: alert.severity,
        user_id: alert.userId,
        user_name: alert.userName,
        description: alert.description,
        details: alert.details,
        timestamp: alert.timestamp
      }]);
    } catch { /* ignore persistence errors */ }
  }

  return alerts;
};

export const getRecentAnomalies = async (limit = 20): Promise<AnomalyAlert[]> => {
  try {
    const { data } = await supabase
      .from('anomaly_alerts')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(limit);
    return (data || []).map(row => ({
      id: row.id,
      type: row.type as AnomalyType,
      severity: row.severity as 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL',
      userId: row.user_id,
      userName: row.user_name,
      description: row.description,
      details: row.details,
      timestamp: row.timestamp
    }));
  } catch {
    return [];
  }
};

export const getAnomalyStats = async (days = 7): Promise<Record<string, number>> => {
  const since = new Date();
  since.setDate(since.getDate() - days);
  
  try {
    const { data } = await supabase
      .from('anomaly_alerts')
      .select('type, severity')
      .gte('timestamp', since.toISOString());
    
    const stats: Record<string, number> = { total: data?.length || 0 };
    for (const row of data || []) {
      const key = `${row.type}_${row.severity}`;
      stats[key] = (stats[key] || 0) + 1;
    }
    return stats;
  } catch {
    return { total: 0 };
  }
};