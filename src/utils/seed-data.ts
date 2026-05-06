import { supabase } from '../lib/supabase';
import { logger } from '../lib/logger';

const MOCK_BUSINESS_UNITS = [
  { id: 'bu-1', name: 'Strategic Planning', head_user_id: 'user-1', contactEmail: 'planning@fcis.com' },
  { id: 'bu-2', name: 'Infrastructure & Ops', head_user_id: 'user-2', contactEmail: 'ops@fcis.com' },
  { id: 'bu-3', name: 'Human Capital', head_user_id: 'user-3', contactEmail: 'hr@fcis.com' },
  { id: 'bu-4', name: 'Digital Transformation', head_user_id: 'user-4', contactEmail: 'digital@fcis.com' },
  { id: 'bu-5', name: 'Financial Governance', head_user_id: 'user-5', contactEmail: 'finance@fcis.com' },
  { id: 'bu-6', name: 'Quality Assurance', head_user_id: 'user-6', contactEmail: 'qa@fcis.com' },
  { id: 'bu-7', name: 'Corporate Communications', head_user_id: 'user-7', contactEmail: 'comm@fcis.com' },
  { id: 'bu-8', name: 'Risk Management', head_user_id: 'user-8', contactEmail: 'risk@fcis.com' },
];

const MOCK_USERS = [
  { id: 'user-1', first_name: 'Admin', last_name: 'User', name: 'Admin User', email: 'admin@fcis.com', role: 'SuperAdmin', department: 'Strategic Planning', status: 'Active', auth_id: 'user-1' },
  { id: 'user-2', first_name: 'Director', last_name: 'Ops', name: 'Director Ops', email: 'ops@fcis.com', role: 'Director', department: 'Infrastructure & Ops', status: 'Active', auth_id: 'user-2' },
  { id: 'user-3', first_name: 'Jane', last_name: 'Doe', name: 'Jane Doe', email: 'jane@fcis.com', role: 'BULead', department: 'Human Capital', status: 'Active', auth_id: 'user-3' },
  { id: 'user-4', first_name: 'John', last_name: 'Smith', name: 'John Smith', email: 'john@fcis.com', role: 'BULead', department: 'Digital Transformation', status: 'Active', auth_id: 'user-4' },
  { id: 'user-5', first_name: 'Sarah', last_name: 'Connor', name: 'Sarah Connor', email: 'sarah@fcis.com', role: 'BULead', department: 'Financial Governance', status: 'Active', auth_id: 'user-5' },
  { id: 'user-6', first_name: 'Mike', last_name: 'Ross', name: 'Mike Ross', email: 'mike@fcis.com', role: 'BULead', department: 'Quality Assurance', status: 'Active', auth_id: 'user-6' },
  { id: 'user-7', first_name: 'Rachel', last_name: 'Zane', name: 'Rachel Zane', email: 'rachel@fcis.com', role: 'BULead', department: 'Corporate Communications', status: 'Active', auth_id: 'user-7' },
  { id: 'user-8', first_name: 'Harvey', last_name: 'Specter', name: 'Harvey Specter', email: 'harvey@fcis.com', role: 'BULead', department: 'Risk Management', status: 'Active', auth_id: 'user-8' },
  { id: 'user-9', first_name: 'Louis', last_name: 'Litt', name: 'Louis Litt', email: 'louis@fcis.com', role: 'Manager', department: 'Financial Governance', status: 'Active', auth_id: 'user-9' },
  { id: 'user-10', first_name: 'Donna', last_name: 'Paulsen', name: 'Donna Paulsen', email: 'donna@fcis.com', role: 'Admin', department: 'Strategic Planning', status: 'Active', auth_id: 'user-10' },
  { id: 'user-11', first_name: 'Vreg', last_name: 'User', name: 'Vreg User', email: 'vreg@fcis.com', role: 'Viewer', department: 'Strategic Planning', status: 'Active', auth_id: 'user-11' },
  { id: 'user-12', first_name: 'Idec', last_name: 'User', name: 'Idec User', email: 'idec@fcis.com', role: 'Viewer', department: 'Infrastructure & Ops', status: 'Active', auth_id: 'user-12' },
  { id: 'user-13', first_name: 'Hnb', last_name: 'User', name: 'Hnb User', email: 'hnb@fcis.com', role: 'Viewer', department: 'Human Capital', status: 'Active', auth_id: 'user-13' },
];

const MOCK_OBJECTIVES = [
  { id: 'obj-1', title: 'Digital Infrastructure Overhaul', description: 'Modernize legacy systems for 2026 efficiency', quarter: 'Q1', year: 2026, status: 'Active' },
  { id: 'obj-2', title: 'Organizational Resilience', description: 'Improve risk mitigation and business continuity', quarter: 'Q1', year: 2026, status: 'Active' },
  { id: 'obj-3', title: 'Human Capital Optimization', description: 'Enhance talent acquisition and retention', quarter: 'Q2', year: 2026, status: 'Active' },
  { id: 'obj-4', title: 'Financial Sustainability', description: 'Reduce operational expenditure by 15%', quarter: 'Q2', year: 2026, status: 'Active' },
];

const MOCK_KRS = [
  { id: 'kr-1', objective_id: 'obj-1', title: 'Cloud Migration', description: 'Migrate 80% of legacy apps to AWS', progress: 65, status: 'Amber', owner_id: 'user-4', kr_slot: 'KR1' },
  { id: 'kr-2', objective_id: 'obj-1', title: 'Network Security Upgrade', description: 'Implement Zero Trust architecture', progress: 40, status: 'Red', owner_id: 'user-2', kr_slot: 'KR2' },
  { id: 'kr-3', objective_id: 'obj-2', title: 'Risk Framework Audit', description: 'Complete ISO 27001 gap analysis', progress: 90, status: 'Green', owner_id: 'user-8', kr_slot: 'KR1' },
  { id: 'kr-4', objective_id: 'obj-2', title: 'BCP Testing', description: 'Run 3 full-scale disaster recovery drills', progress: 30, status: 'Amber', owner_id: 'user-8', kr_slot: 'KR2' },
  { id: 'kr-5', objective_id: 'obj-3', title: 'Talent Pipeline', description: 'Hire 15 senior engineers', progress: 50, status: 'Green', owner_id: 'user-3', kr_slot: 'KR1' },
  { id: 'kr-6', objective_id: 'obj-3', title: 'Training Program', description: 'Certify 50% of staff in new tech stack', progress: 20, status: 'Red', owner_id: 'user-3', kr_slot: 'KR2' },
  { id: 'kr-7', objective_id: 'obj-4', title: 'OpEx Reduction', description: 'Cut non-essential software spend by $50k', progress: 70, status: 'Green', owner_id: 'user-5', kr_slot: 'KR1' },
  { id: 'kr-8', objective_id: 'obj-4', title: 'Revenue Diversification', description: 'Launch 2 new service lines', progress: 10, status: 'Red', owner_id: 'user-5', kr_slot: 'KR2' },
];

function generateMockGoals(weeks: number, year: number) {
  const goals = [];
  const departments = ['Strategic Planning', 'Infrastructure & Ops', 'Human Capital', 'Digital Transformation', 'Financial Governance', 'Quality Assurance', 'Corporate Communications', 'Risk Management'];
  
  for (let w = 1; w <= weeks; w++) {
    departments.forEach((dept, deptIdx) => {
      const score = Math.floor(Math.random() * 101);
      const tasks = [
        { id: `t-${w}-${deptIdx}-1`, title: 'Plan and define requirements', status: 'Done' },
        { id: `t-${w}-${deptIdx}-2`, title: 'Execute implementation phase', status: Math.random() > 0.5 ? 'Done' : 'NotDone' },
        { id: `t-${w}-${deptIdx}-3`, title: 'Verify and document results', status: Math.random() > 0.8 ? 'Done' : 'NotDone' },
      ];
      
      goals.push({
        id: `goal-${w}-${deptIdx}`,
        key_result_id: MOCK_KRS[deptIdx % MOCK_KRS.length].id,
        owner_id: MOCK_USERS[deptIdx % MOCK_USERS.length].id,
        department: dept,
        title: `Weekly Progress Report - ${dept} (W${w})`,
        tasks: JSON.stringify(tasks),
        comments: `Weekly update for W${w} - ${year}`,
        week: w,
        year,
        score,
      });
    });
  }
  return goals;
}

export async function populateMockData() {
  logger.info('[SEED] Starting data population...');

  try {
    // Seed Business Units
    const { error: buError } = await supabase.from('business_units').upsert(MOCK_BUSINESS_UNITS, { onConflict: 'id' });
    if (buError) logger.warn('[SEED] Business units:', buError.message);
    else logger.info('[SEED] Business units seeded');

    // Seed Profiles (Users)
    const { error: profileError } = await supabase.from('profiles').upsert(MOCK_USERS, { onConflict: 'id' });
    if (profileError) logger.warn('[SEED] Profiles:', profileError.message);
    else logger.info('[SEED] Profiles seeded');

    // Seed Objectives
    const { error: objError } = await supabase.from('objectives').upsert(MOCK_OBJECTIVES, { onConflict: 'id' });
    if (objError) logger.warn('[SEED] Objectives:', objError.message);
    else logger.info('[SEED] Objectives seeded');

    // Seed Key Results
    const { error: krError } = await supabase.from('key_results').upsert(MOCK_KRS, { onConflict: 'id' });
    if (krError) logger.warn('[SEED] Key Results:', krError.message);
    else logger.info('[SEED] Key Results seeded');

    // Seed Goals/Activities
    const goals = generateMockGoals(12, 2026);
    const { error: goalsError } = await supabase.from('goals').upsert(goals, { onConflict: 'id' });
    if (goalsError) logger.warn('[SEED] Goals:', goalsError.message);
    else logger.info(`[SEED] Goals seeded (${goals.length} records)`);

    logger.info('[SEED] Data population completed!');
    return { success: true, message: 'Mock data populated successfully' };
  } catch (error: any) {
    logger.error('[SEED] Failed:', error);
    return { success: false, message: error.message };
  }
}

// Auto-run seed on import if in development
if (import.meta.env.DEV) {
  setTimeout(() => populateMockData(), 1000);
}