#!/usr/bin/env tsx
/**
 * 4CORE OKR Platform - Database Seeder
 * Populates Supabase with mock data for development
 */

import { MOCK_USERS, MOCK_BUSINESS_UNITS, MOCK_OBJECTIVES, MOCK_KRS, MOCK_GOVERNANCE_CONFIG, generateMockActivities } from '../src/utils/mock-data';
import { supabase, supabaseAdmin } from '../src/lib/supabase';
import { UserRole, TaskStatus } from '../src/types';

const CURRENT_YEAR = 2026;
const CURRENT_WEEK = 18; // May 5, 2026

async function seed() {
  console.log('🌱 Starting database seed...\n');

  // Check Supabase connection
  const { error: healthError } = await supabase.from('activities').select('count', { count: 'exact', head: true });
  if (healthError) {
    console.error('❌ Cannot connect to Supabase. Check your environment variables:');
    console.error('   VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY must be set');
    console.error(`   Error: ${healthError.message}`);
    process.exit(1);
  }
  console.log('✅ Connected to Supabase\n');

  // Seed Users
  console.log('📝 Seeding users...');
  for (const user of MOCK_USERS) {
    const { error } = await supabaseAdmin?.from('profiles').upsert({
      id: user.id,
      auth_id: user.id, // In mock mode, auth_id equals local id
      email: user.email,
      first_name: user.firstName,
      last_name: user.lastName,
      name: user.name,
      role: user.role,
      department: user.department,
      avatar_url: user.avatarUrl,
      status: user.status,
      must_change_password: false,
      created_at: new Date().toISOString(),
    });
    if (error) {
      console.warn(`   ⚠️  ${user.email}: ${error.message}`);
    } else {
      console.log(`   ✓ ${user.email} (${user.role})`);
    }
  }

  // Seed Business Units
  console.log('\n🏢 Seeding business units...');
  for (const bu of MOCK_BUSINESS_UNITS) {
    const { error } = await supabase.from('business_units').upsert(bu);
    if (error) {
      console.warn(`   ⚠️  ${bu.name}: ${error.message}`);
    } else {
      console.log(`   ✓ ${bu.name}`);
    }
  }

  // Seed Objectives
  console.log('\n🎯 Seeding objectives...');
  for (const obj of MOCK_OBJECTIVES) {
    const { error } = await supabase.from('objectives').upsert({
      ...obj,
      status: 'Active',
      progress: 0,
      created_at: new Date().toISOString(),
    });
    if (error) {
      console.warn(`   ⚠️  ${obj.title}: ${error.message}`);
    } else {
      console.log(`   ✓ ${obj.title}`);
    }
  }

  // Seed Key Results
  console.log('\n🔑 Seeding key results...');
  for (const kr of MOCK_KRS) {
    const { error } = await supabase.from('key_results').upsert(kr);
    if (error) {
      console.warn(`   ⚠️  ${kr.title}: ${error.message}`);
    } else {
      console.log(`   ✓ ${kr.title} (${kr.progress}%)`);
    }
  }

  // Seed Governance Config
  console.log('\n⚙️  Seeding governance configuration...');
  const { error: configError } = await supabase.from('governance_config').upsert({
    id: 1,
    ...MOCK_GOVERNANCE_CONFIG,
    allowed_domains: ['fcis.com', 'novaai.com.ng', 'pee.com'],
    created_at: new Date().toISOString(),
  });
  if (configError) {
    console.warn(`   ⚠️  Governance config: ${configError.message}`);
  } else {
    console.log('   ✓ Governance configuration');
  }

  // Seed Activities (Weekly Progress) - current week + 8 weeks back
  console.log('\n📊 Seeding weekly activities (last 12 weeks)...');
  const activities = generateMockActivities(12, CURRENT_YEAR);
  // Filter only current and future weeks, plus recent past
  const recentActivities = activities.filter(a => a.week >= CURRENT_WEEK - 8 && a.week <= CURRENT_WEEK);

  const BATCH_SIZE = 50;
  for (let i = 0; i < recentActivities.length; i += BATCH_SIZE) {
    const batch = recentActivities.slice(i, i + BATCH_SIZE);
    const { error: actError } = await supabase.from('activities').upsert(
      batch.map(a => ({
        ...a,
        created_at: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
      }))
    );
    if (actError) {
      console.warn(`   ⚠️  Activities batch ${i / BATCH_SIZE + 1}: ${actError.message}`);
    } else {
      console.log(`   ✓ Week ${batch[0]?.week}: ${batch.length} activities`);
    }
  }

  // Seed Audit Logs
  console.log('\n📋 Seeding audit logs...');
  const auditLogs = [
    { action: 'SYSTEM', details: 'System initialized with mock data', user_id: MOCK_USERS[0].id, user_name: MOCK_USERS[0].name, timestamp: new Date().toISOString() },
    { action: 'GOAL_CREATE', details: 'Objective "Digital Infrastructure Overhaul" created', user_id: MOCK_USERS[0].id, user_name: MOCK_USERS[0].name, timestamp: new Date().toISOString() },
    { action: 'KR_CREATE', details: 'Key Result "Cloud Migration" created', user_id: MOCK_USERS[3].id, user_name: MOCK_USERS[3].name, timestamp: new Date().toISOString() },
    { action: 'INTEGRITY_ADJUSTMENT', details: 'Weekly integrity check completed - 98% compliance', user_id: MOCK_USERS[0].id, user_name: MOCK_USERS[0].name, timestamp: new Date().toISOString() },
  ];

  for (const log of auditLogs) {
    await supabase.from('audit_logs').insert({
      ...log,
      ip_address: '127.0.0.1',
      metadata: {},
    });
  }
  console.log(`   ✓ ${auditLogs.length} audit entries`);

  console.log('\n✅ Database seeded successfully!');
  console.log('\n📌 Demo logins available:');
  MOCK_USERS.slice(0, 6).forEach(u => {
    console.log(`   ${u.email.padEnd(30)} (${u.role.padEnd(12)}) [password: "password"]`);
  });
}

seed().catch(err => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
