/**
 * 4CORE Financial Module - Finance Service
 * Monthly actuals, variance analysis, BU ranking
 */

import { supabase } from '../lib/supabase';

export interface MonthlyActual {
  id: string;
  bu_id: string;
  bu_name: string;
  month: number;
  year: number;
  projection: number;
  actual: number | null;
  variance: number | null;
  variance_pct: number | null;
  status: 'PENDING' | 'FILED' | 'REVIEWED' | 'APPROVED';
  filed_by: string | null;
  filed_at: string | null;
}

export interface BUVariance {
  bu_id: string;
  bu_name: string;
  projection: number;
  actual: number;
  variance: number;
  variance_pct: number;
  months_filed: number;
  bu_rank: number;
}

export interface GovernanceScore {
  year: number;
  quarter: string;
  bpi_avg: number;
  compliance_rate: number;
  governance_score: number;
  computed_at: string;
}

export const getMonthlyActuals = async (
  month?: number,
  year?: number,
  buId?: string
): Promise<MonthlyActual[]> => {
  try {
    let query = supabase
      .from('monthly_actuals')
      .select('*')
      .order('year', { ascending: false })
      .order('month', { ascending: false });

    if (month) query = query.eq('month', month);
    if (year) query = query.eq('year', year);
    if (buId) query = query.eq('bu_id', buId);

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  } catch (e) {
    console.error('[Finance] Get monthly actuals error:', e);
    return [];
  }
};

export const fileMonthlyActuals = async (
  buId: string,
  month: number,
  year: number,
  projection: number,
  actual: number
): Promise<{ success: boolean; id?: string; error?: string }> => {
  try {
    const { data, error } = await supabase.rpc('file_monthly_actuals', {
      p_bu_id: buId,
      p_month: month,
      p_year: year,
      p_projection: projection,
      p_actual: actual
    });

    if (error) throw error;
    return { success: true, id: data };
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Unknown error';
    return { success: false, error: message };
  }
};

export const getBUVarianceRanking = async (): Promise<BUVariance[]> => {
  try {
    const { data, error } = await supabase
      .from('v_bu_ranking')
      .select('*')
      .order('bu_rank');

    if (error) throw error;
    return data || [];
  } catch (e) {
    console.error('[Finance] Get BU ranking error:', e);
    return [];
  }
};

export const getGovernanceScore = async (
  year: number,
  quarter: string
): Promise<GovernanceScore | null> => {
  try {
    const { data, error } = await supabase.rpc('calculate_governance_score', {
      p_year: year,
      p_quarter: quarter
    });

    if (error) throw error;
    return data;
  } catch (e) {
    console.error('[Finance] Get governance score error:', e);
    return null;
  }
};

export const getVarianceAnalysis = async (
  month?: number,
  year?: number
): Promise<MonthlyActual[]> => {
  try {
    let query = supabase
      .from('v_bu_variance_analysis')
      .select('*')
      .order('variance_pct', { ascending: false });

    if (month) query = query.eq('month', month);
    if (year) query = query.eq('year', year);

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  } catch (e) {
    console.error('[Finance] Get variance analysis error:', e);
    return [];
  }
};

export const getKRHeatmap = async (): Promise<any[]> => {
  try {
    const { data, error } = await supabase
      .from('v_kr_heatmap')
      .select('*')
      .order('attainment_pct', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (e) {
    console.error('[Finance] Get KR heatmap error:', e);
    return [];
  }
};

export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value);
};

export const formatVariancePct = (value: number | null): string => {
  if (value === null || value === undefined) return '—';
  const sign = value > 0 ? '+' : '';
  return `${sign}${value.toFixed(1)}%`;
};

export const getVarianceColor = (variancePct: number | null): string => {
  if (variancePct === null) return 'text-slate-400';
  if (variancePct > 10) return 'text-emerald-600';
  if (variancePct >= -10) return 'text-blue-600';
  return 'text-red-600';
};

export const getPerformanceCategory = (
  variancePct: number | null
): 'OVER' | 'ON_TRACK' | 'UNDER' | 'NO_DATA' => {
  if (variancePct === null) return 'NO_DATA';
  if (variancePct > 10) return 'OVER';
  if (variancePct >= -10) return 'ON_TRACK';
  return 'UNDER';
};