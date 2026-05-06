/**
 * 4CORE Behavioral Performance Index (BPI)
 * Composite score: timeliness + completion rate + compliance + penalties
 * Score 0-100 per user per quarter
 */

import { supabase } from '../lib/supabase';

const getWATTime = (): Date => {
  return new Date(new Date().toLocaleString('en-US', { timeZone: 'Africa/Lagos' }));
};

const getCurrentQuarterInfo = () => {
  const now = getWATTime();
  const month = now.getMonth();
  const quarters = ['Q1', 'Q2', 'Q3', 'Q4'];
  const quarterIndex = Math.floor(month / 3);
  return {
    year: now.getFullYear(),
    quarter: quarters[quarterIndex],
    quarterIndex,
    quarterLabel: quarters[quarterIndex]
  };
};

export interface BPIScore {
  userId: string;
  userName: string;
  department: string;
  quarter: string;
  year: number;
  overallBPI: number;
  timelinessScore: number;
  completionScore: number;
  complianceScore: number;
  penaltyScore: number;
  rank?: number;
  trend?: 'up' | 'down' | 'stable';
}

const MAX_PENALTY_POINTS = 100;

function getWeekNumber(date: Date): number {
  const startOfYear = new Date(date.getFullYear(), 0, 1);
  return Math.ceil(((date.getTime() - startOfYear.getTime()) / 86400000 + startOfYear.getDay() + 1) / 7);
}

export const calculateBPI = async (userId?: string, quarter?: string, year?: number): Promise<BPIScore[]> => {
  const currentQ = getCurrentQuarterInfo();
  const targetQuarter = quarter || currentQ.quarter;
  const targetYear = year || currentQ.year;
  
  const qStartMonth: Record<string, number> = { Q1: 0, Q2: 3, Q3: 6, Q4: 9 };
  const qStart = qStartMonth[targetQuarter] ?? 0;
  const qEnd = qStart + 2;
  const startDate = new Date(targetYear, qStart, 1);
  const endDate = new Date(targetYear, qEnd + 1, 0);
  
  const qStartWeek = getWeekNumber(startDate);
  const qEndWeek = getWeekNumber(endDate);
  
  try {
    const { data: goals } = await supabase
      .from('activities')
      .select('*')
      .gte('week', qStartWeek)
      .lte('week', qEndWeek)
      .gte('year', targetYear);
    
    const { data: profiles } = await supabase.from('profiles').select('*');
    const users = profiles || [];
    
    const { data: auditLogs } = await supabase
      .from('audit_logs')
      .select('*')
      .in('action', ['CREATE', 'UPDATE'])
      .gte('timestamp', startDate.toISOString());
    
    const { data: penalties } = await supabase
      .from('audit_logs')
      .select('*')
      .eq('action', 'INTEGRITY_ADJUSTMENT')
      .gte('timestamp', startDate.toISOString());
    
    const results: BPIScore[] = [];
    
    for (const user of users) {
      if (userId && user.id !== userId) continue;
      
      const userGoals = (goals || []).filter((g: any) => g.owner_id === user.id);
      const userAudits = (auditLogs || []).filter((a: any) => a.user_id === user.id);
      const userPenalties = (penalties || []).filter((p: any) => p.user_id === user.id);
      
      let timelinessScore = 25;
      const lateSubmissions = userGoals.filter((g: any) => {
        const submittedLate = userAudits.some((a: any) => 
          a.action === 'CREATE' && a.details?.includes(g.id)
        );
        return submittedLate;
      }).length;
      const lateRatio = userGoals.length > 0 ? lateSubmissions / userGoals.length : 0;
      timelinessScore = Math.max(0, 25 - Math.round(lateRatio * 25));
      
      let totalTasks = 0;
      let completedTasks = 0;
      for (const goal of userGoals) {
        const tasks = typeof goal.tasks === 'string' ? JSON.parse(goal.tasks) : (goal.tasks || []);
        totalTasks += tasks.length;
        completedTasks += tasks.filter((t: any) => t.status === 'Done').length;
      }
      const completionRatio = totalTasks > 0 ? completedTasks / totalTasks : 0;
      const completionScore = Math.round(completionRatio * 25);
      
      let complianceScore = 25;
      const uniqueKRs = new Set(userGoals.map((g: any) => g.key_result_id));
      const krCoverage = uniqueKRs.size >= 4 ? 25 : Math.round(uniqueKRs.size / 4 * 25);
      const goalFrequency = userGoals.length >= 13 ? 25 : Math.round(userGoals.length / 13 * 25);
      complianceScore = Math.round((krCoverage + goalFrequency) / 2);
      
      const totalPenaltyDeduction = userPenalties.reduce((sum: number, p: any) => {
        return sum + ((p.metadata?.penaltyValue as number) || 0);
      }, 0);
      const penaltyRatio = Math.min(1, totalPenaltyDeduction / MAX_PENALTY_POINTS);
      const penaltyScore = Math.max(0, 25 - Math.round(penaltyRatio * 25));
      
      const overallBPI = timelinessScore + completionScore + complianceScore + penaltyScore;
      
      results.push({
        userId: user.id,
        userName: user.name,
        department: user.department,
        quarter: targetQuarter,
        year: targetYear,
        overallBPI,
        timelinessScore,
        completionScore,
        complianceScore,
        penaltyScore
      });
    }
    
    results.sort((a, b) => b.overallBPI - a.overallBPI);
    results.forEach((r, i) => { r.rank = i + 1; });
    
    return results;
  } catch (e) {
    console.error('[BPI] Calculation error:', e);
    return [];
  }
};

export const calculateWeeklyBPI = async (userId?: string): Promise<number> => {
  const scores = await calculateBPI(userId);
  if (!scores.length) return 0;
  if (userId) return scores[0].overallBPI;
  
  const avgBPI = scores.reduce((sum, s) => sum + s.overallBPI, 0) / scores.length;
  return Math.round(avgBPI);
};