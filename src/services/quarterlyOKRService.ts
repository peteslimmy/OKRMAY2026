import { supabase } from '../lib/supabase';
import { YearlyTheme, QuarterlyObjective, KeyResult, SubKR, QuarterType } from '../types';
import { generateId } from '../lib/utils';
import { logger, logError } from '../utils/logging';

export interface YearlyThemeWithQuarters extends YearlyTheme {
  quarters: QuarterlyObjectiveWithKRs[];
}

export interface QuarterlyObjectiveWithKRs extends QuarterlyObjective {
  keyResults: KeyResultWithSubKRs[];
}

export interface KeyResultWithSubKRs extends KeyResult {
  subKRs: SubKR[];
}

export class QuarterlyOKRService {
  async getActiveYearlyTheme(): Promise<YearlyThemeWithQuarters | null> {
    try {
      const { data: theme, error: themeError } = await supabase
        .from('yearly_themes')
        .select('*')
        .eq('is_active', true)
        .single();

      if (themeError || !theme) {
        return null;
      }

      const quarters = await this.getQuartersForTheme(theme.id);
      return { ...theme, quarters };
    } catch (error) {
      logError(error as Error, { operation: 'getActiveYearlyTheme' });
      return null;
    }
  }

  async getYearlyThemeByYear(year: number): Promise<YearlyThemeWithQuarters | null> {
    try {
      const { data: theme, error: themeError } = await supabase
        .from('yearly_themes')
        .select('*')
        .eq('year', year)
        .single();

      if (themeError || !theme) {
        return this.getMockYearlyTheme(year);
      }

      const quarters = await this.getQuartersForTheme(theme.id);
      return { ...theme, quarters };
    } catch (error) {
      logError(error as Error, { operation: 'getYearlyThemeByYear' });
      return this.getMockYearlyTheme(year);
    }
  }

  async getQuartersForTheme(themeId: string): Promise<QuarterlyObjectiveWithKRs[]> {
    try {
      const { data: objectives, error } = await supabase
        .from('quarterly_objectives')
        .select('*')
        .eq('yearly_theme_id', themeId)
        .order('quarter', { ascending: true });

      if (error) throw error;

      const quartersWithKRs: QuarterlyObjectiveWithKRs[] = [];

      for (const obj of objectives || []) {
        const keyResults = await this.getKeyResultsForObjective(obj.id);
        quartersWithKRs.push({ ...obj, keyResults });
      }

      return quartersWithKRs;
    } catch (error) {
      logError(error as Error, { operation: 'getQuartersForTheme', themeId });
      return [];
    }
  }

  async getKeyResultsForObjective(objectiveId: string): Promise<KeyResultWithSubKRs[]> {
    try {
      const { data: krs, error } = await supabase
        .from('key_results')
        .select('*')
        .eq('objective_id', objectiveId)
        .order('kr_slot', { ascending: true });

      if (error) throw error;

      const krsWithSubKRs: KeyResultWithSubKRs[] = [];

      for (const kr of krs || []) {
        const subKRs = await this.getSubKRsForKR(kr.id);
        krsWithSubKRs.push({ ...kr, subKRs });
      }

      return krsWithSubKRs;
    } catch (error) {
      logError(error as Error, { operation: 'getKeyResultsForObjective', objectiveId });
      return [];
    }
  }

  async getSubKRsForKR(krId: string): Promise<SubKR[]> {
    try {
      const { data, error } = await supabase
        .from('sub_krs')
        .select('*')
        .eq('kr_id', krId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      logError(error as Error, { operation: 'getSubKRsForKR', krId });
      return [];
    }
  }

  async createYearlyTheme(theme: Omit<YearlyTheme, 'id' | 'created_at' | 'updated_at'>): Promise<YearlyTheme> {
    try {
      const { data, error } = await supabase
        .from('yearly_themes')
        .insert([{
          year: theme.year,
          title: theme.title,
          description: theme.description,
          is_active: theme.is_active,
          created_by: theme.created_by,
          updated_by: theme.updated_by
        }])
        .select()
        .single();

      if (error) throw error;
      logger.info('Created yearly theme', { themeId: data.id, year: data.year });
      return data;
    } catch (error) {
      logError(error as Error, { operation: 'createYearlyTheme', theme });
      throw error;
    }
  }

  async updateYearlyTheme(id: string, updates: Partial<YearlyTheme>): Promise<YearlyTheme> {
    try {
      const { data, error } = await supabase
        .from('yearly_themes')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      logger.info('Updated yearly theme', { themeId: id });
      return data;
    } catch (error) {
      logError(error as Error, { operation: 'updateYearlyTheme', id, updates });
      throw error;
    }
  }

  async setActiveYearlyTheme(id: string): Promise<void> {
    try {
      await supabase
        .from('yearly_themes')
        .update({ is_active: false });

      const { error } = await supabase
        .from('yearly_themes')
        .update({ is_active: true })
        .eq('id', id);

      if (error) throw error;
      logger.info('Set active yearly theme', { themeId: id });
    } catch (error) {
      logError(error as Error, { operation: 'setActiveYearlyTheme', id });
      throw error;
    }
  }

  async createQuarterlyObjective(
    objective: Omit<QuarterlyObjective, 'id' | 'created_at' | 'updated_at'>
  ): Promise<QuarterlyObjective> {
    try {
      const { data, error } = await supabase
        .from('quarterly_objectives')
        .insert([{
          yearly_theme_id: objective.yearly_theme_id,
          quarter: objective.quarter,
          year: objective.year,
          title: objective.title,
          description: objective.description,
          status: objective.status,
          progress: objective.progress,
          created_by: objective.created_by,
          updated_by: objective.updated_by
        }])
        .select()
        .single();

      if (error) throw error;
      logger.info('Created quarterly objective', { objectiveId: data.id, quarter: data.quarter });
      return data;
    } catch (error) {
      logError(error as Error, { operation: 'createQuarterlyObjective', objective });
      throw error;
    }
  }

  async updateQuarterlyObjective(id: string, updates: Partial<QuarterlyObjective>): Promise<QuarterlyObjective> {
    try {
      const { data, error } = await supabase
        .from('quarterly_objectives')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      logger.info('Updated quarterly objective', { objectiveId: id });
      return data;
    } catch (error) {
      logError(error as Error, { operation: 'updateQuarterlyObjective', id, updates });
      throw error;
    }
  }

  async createKeyResult(kr: Omit<KeyResult, 'id' | 'created_at' | 'updated_at' | 'version'>): Promise<KeyResult> {
    try {
      const { data, error } = await supabase
        .from('key_results')
        .insert([{
          objective_id: kr.objective_id,
          kr_slot: kr.kr_slot,
          title: kr.title,
          description: kr.description,
          progress: kr.progress,
          status: kr.status
        }])
        .select()
        .single();

      if (error) throw error;
      logger.info('Created key result', { krId: data.id, slot: data.kr_slot });
      return data;
    } catch (error) {
      logError(error as Error, { operation: 'createKeyResult', kr });
      throw error;
    }
  }

  async updateKeyResult(id: string, updates: Partial<KeyResult>): Promise<KeyResult> {
    try {
      const { data, error } = await supabase
        .from('key_results')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      logger.info('Updated key result', { krId: id });
      return data;
    } catch (error) {
      logError(error as Error, { operation: 'updateKeyResult', id, updates });
      throw error;
    }
  }

  async createSubKR(subKR: Omit<SubKR, 'id' | 'created_at' | 'updated_at'>): Promise<SubKR> {
    try {
      const { data, error } = await supabase
        .from('sub_krs')
        .insert([{
          kr_id: subKR.kr_id,
          title: subKR.title,
          progress: subKR.progress,
          weight: subKR.weight
        }])
        .select()
        .single();

      if (error) throw error;
      logger.info('Created sub KR', { subKrId: data.id });
      return data;
    } catch (error) {
      logError(error as Error, { operation: 'createSubKR', subKR });
      throw error;
    }
  }

  async updateSubKRProgress(id: string, progress: number): Promise<SubKR> {
    try {
      const { data, error } = await supabase
        .from('sub_krs')
        .update({
          progress,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      logError(error as Error, { operation: 'updateSubKRProgress', id, progress });
      throw error;
    }
  }

  async deleteSubKR(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('sub_krs')
        .delete()
        .eq('id', id);

      if (error) throw error;
      logger.info('Deleted sub KR', { subKrId: id });
    } catch (error) {
      logError(error as Error, { operation: 'deleteSubKR', id });
      throw error;
    }
  }

  async deleteKeyResult(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('key_results')
        .delete()
        .eq('id', id);

      if (error) throw error;
      logger.info('Deleted key result', { krId: id });
    } catch (error) {
      logError(error as Error, { operation: 'deleteKeyResult', id });
      throw error;
    }
  }

  async deleteQuarterlyObjective(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('quarterly_objectives')
        .delete()
        .eq('id', id);

      if (error) throw error;
      logger.info('Deleted quarterly objective', { objectiveId: id });
    } catch (error) {
      logError(error as Error, { operation: 'deleteQuarterlyObjective', id });
      throw error;
    }
  }

  async deleteYearlyTheme(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('yearly_themes')
        .delete()
        .eq('id', id);

      if (error) throw error;
      logger.info('Deleted yearly theme', { themeId: id });
    } catch (error) {
      logError(error as Error, { operation: 'deleteYearlyTheme', id });
      throw error;
    }
  }

  calculateObjectiveProgress(keyResults: KeyResultWithSubKRs[]): number {
    if (keyResults.length === 0) return 0;

    const totalProgress = keyResults.reduce((sum, kr) => {
      if (kr.subKRs.length === 0) {
        return sum + (kr.progress || 0);
      }
      const subKRProgress = kr.subKRs.reduce((skSum, skr) => {
        return skSum + ((skr.progress || 0) * (skr.weight || 1));
      }, 0);
      const totalWeight = kr.subKRs.reduce((wSum, skr) => wSum + (skr.weight || 1), 0);
      return sum + (totalWeight > 0 ? subKRProgress / totalWeight : 0);
    }, 0);

    return Math.round(totalProgress / keyResults.length * 100) / 100;
  }

  getMockYearlyTheme(year: number): YearlyThemeWithQuarters {
    return {
      id: `mock-theme-${year}`,
      year,
      title: `FY${year} Strategic Roadmap`,
      description: `Strategic objectives and key results for fiscal year ${year}`,
      is_active: year === 2026,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      created_by: 'system',
      updated_by: 'system',
      quarters: [
        {
          id: 'q1-mock',
          yearly_theme_id: `mock-theme-${year}`,
          quarter: QuarterType.Q1,
          year,
          title: 'Foundation & Growth',
          description: 'Build operational foundation and drive initial growth',
          status: 'Active',
          progress: 68,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          created_by: 'system',
          updated_by: 'system',
          keyResults: [
            { id: 'kr1', objective_id: 'q1-mock', kr_slot: 1, title: 'Revenue Growth', description: 'Achieve 72% of revenue target', progress: 72, target: 100, unit: 'percent', status: 'On Track', weight: 1, created_at: '', updated_at: '', created_by: '', updated_by: '' },
            { id: 'kr2', objective_id: 'q1-mock', kr_slot: 2, title: 'Customer Acquisition', description: 'Acquire 45 new enterprise customers', progress: 45, target: 200, unit: 'customers', status: 'At Risk', weight: 1, created_at: '', updated_at: '', created_by: '', updated_by: '' },
            { id: 'kr3', objective_id: 'q1-mock', kr_slot: 3, title: 'Team Expansion', description: 'Hire 20 new team members', progress: 88, target: 20, unit: 'hires', status: 'On Track', weight: 1, created_at: '', updated_at: '', created_by: '', updated_by: '' },
          ]
        },
        {
          id: 'q2-mock',
          yearly_theme_id: `mock-theme-${year}`,
          quarter: QuarterType.Q2,
          year,
          title: 'Market Expansion',
          description: 'Expand into new market segments',
          status: 'Draft',
          progress: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          created_by: 'system',
          updated_by: 'system',
          keyResults: [
            { id: 'kr4', objective_id: 'q2-mock', kr_slot: 1, title: 'Market Share', description: 'Gain 15% market share', progress: 0, target: 15, unit: 'percent', status: 'Not Started', weight: 1, created_at: '', updated_at: '', created_by: '', updated_by: '' },
            { id: 'kr5', objective_id: 'q2-mock', kr_slot: 2, title: 'Product Launch', description: 'Launch 3 new product features', progress: 0, target: 3, unit: 'features', status: 'Not Started', weight: 1, created_at: '', updated_at: '', created_by: '', updated_by: '' },
          ]
        },
        {
          id: 'q3-mock',
          yearly_theme_id: `mock-theme-${year}`,
          quarter: QuarterType.Q3,
          year,
          title: 'Operational Excellence',
          description: 'Optimize operations and processes',
          status: 'Draft',
          progress: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          created_by: 'system',
          updated_by: 'system',
          keyResults: []
        },
        {
          id: 'q4-mock',
          yearly_theme_id: `mock-theme-${year}`,
          quarter: QuarterType.Q4,
          year,
          title: 'Scale & Sustainability',
          description: 'Scale operations for long-term growth',
          status: 'Draft',
          progress: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          created_by: 'system',
          updated_by: 'system',
          keyResults: []
        },
      ]
    };
  }
}