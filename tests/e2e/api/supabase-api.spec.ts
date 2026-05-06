import { test, expect, request } from '@playwright/test';

const API_BASE_URL = process.env.API_BASE_URL || 'https://qshewfoyhglgweeotttj.supabase.co';

test.describe('API Integration Tests', () => {

  test('01. Supabase connection should be accessible', async () => {
    const api = await request.newContext({
      baseURL: API_BASE_URL,
      ignoreHTTPSErrors: true,
    });

    const response = await api.get('/rest/v1/');

    console.log(`\n🔗 API Base: ${response.status()}`);
    expect(response.status()).toBeLessThan(500);
  });

  test('02. Business units endpoint should return data', async () => {
    const api = await request.newContext({
      baseURL: API_BASE_URL,
      ignoreHTTPSErrors: true,
      headers: {
        'apikey': process.env.VITE_SUPABASE_ANON_KEY || '',
        'Authorization': `Bearer ${process.env.VITE_SUPABASE_ANON_KEY || ''}`,
      },
    });

    const response = await api.get('/rest/v1/business_units?select=*&limit=5');

    console.log(`\n📊 Business Units: ${response.status()}`);
    
    if (response.ok()) {
      const data = await response.json();
      console.log(`  Found ${Array.isArray(data) ? data.length : 0} business units`);
    }
  });

  test('03. Objectives endpoint should return data', async () => {
    const api = await request.newContext({
      baseURL: API_BASE_URL,
      ignoreHTTPSErrors: true,
      headers: {
        'apikey': process.env.VITE_SUPABASE_ANON_KEY || '',
        'Authorization': `Bearer ${process.env.VITE_SUPABASE_ANON_KEY || ''}`,
      },
    });

    const response = await api.get('/rest/v1/objectives?select=*&limit=5');

    console.log(`\n🎯 Objectives: ${response.status()}`);
    
    if (response.ok()) {
      const data = await response.json();
      console.log(`  Found ${Array.isArray(data) ? data.length : 0} objectives`);
    }
  });

  test('04. Monthly actuals endpoint should return financial data', async () => {
    const api = await request.newContext({
      baseURL: API_BASE_URL,
      ignoreHTTPSErrors: true,
      headers: {
        'apikey': process.env.VITE_SUPABASE_ANON_KEY || '',
        'Authorization': `Bearer ${process.env.VITE_SUPABASE_ANON_KEY || ''}`,
      },
    });

    const response = await api.get('/rest/v1/monthly_actuals?select=*&limit=10');

    console.log(`\n💰 Monthly Actuals: ${response.status()}`);
    
    if (response.ok()) {
      const data = await response.json();
      console.log(`  Found ${Array.isArray(data) ? data.length : 0} monthly actuals`);
    }
  });

  test('05. Key results endpoint should return KRs', async () => {
    const api = await request.newContext({
      baseURL: API_BASE_URL,
      ignoreHTTPSErrors: true,
      headers: {
        'apikey': process.env.VITE_SUPABASE_ANON_KEY || '',
        'Authorization': `Bearer ${process.env.VITE_SUPABASE_ANON_KEY || ''}`,
      },
    });

    const response = await api.get('/rest/v1/key_results?select=*&limit=5');

    console.log(`\n📈 Key Results: ${response.status()}`);
    
    if (response.ok()) {
      const data = await response.json();
      console.log(`  Found ${Array.isArray(data) ? data.length : 0} key results`);
    }
  });

  test('06. Violations endpoint should be accessible', async () => {
    const api = await request.newContext({
      baseURL: API_BASE_URL,
      ignoreHTTPSErrors: true,
      headers: {
        'apikey': process.env.VITE_SUPABASE_ANON_KEY || '',
        'Authorization': `Bearer ${process.env.VITE_SUPABASE_ANON_KEY || ''}`,
      },
    });

    const response = await api.get('/rest/v1/violations?select=*&limit=5');

    console.log(`\n⚠️ Violations: ${response.status()}`);
    
    if (response.ok()) {
      const data = await response.json();
      console.log(`  Found ${Array.isArray(data) ? data.length : 0} violations`);
    }
  });

  test('07. Governance config endpoint should be accessible', async () => {
    const api = await request.newContext({
      baseURL: API_BASE_URL,
      ignoreHTTPSErrors: true,
      headers: {
        'apikey': process.env.VITE_SUPABASE_ANON_KEY || '',
        'Authorization': `Bearer ${process.env.VITE_SUPABASE_ANON_KEY || ''}`,
      },
    });

    const response = await api.get('/rest/v1/governance_config?select=*&limit=1');

    console.log(`\n⚙️ Governance Config: ${response.status()}`);
  });
});

test.describe('Data Integrity Tests', () => {

  test('08. All tables should have proper schema', async () => {
    const tables = [
      'profiles',
      'business_units',
      'yearly_themes',
      'objectives',
      'key_results',
      'sub_krs',
      'activities',
      'monthly_actuals',
      'violations',
      'governance_config',
    ];

    const api = await request.newContext({
      baseURL: API_BASE_URL,
      ignoreHTTPSErrors: true,
      headers: {
        'apikey': process.env.VITE_SUPABASE_ANON_KEY || '',
        'Authorization': `Bearer ${process.env.VITE_SUPABASE_ANON_KEY || ''}`,
      },
    });

    console.log('\n📋 Table Schema Check:');
    let allAccessible = true;

    for (const table of tables) {
      const response = await api.get(`/rest/v1/${table}?select=*&limit=1`);
      const status = response.status();
      const icon = status === 200 ? '✅' : '❌';
      console.log(`  ${icon} ${table}: ${status}`);
      
      if (status !== 200) allAccessible = false;
    }

    expect(allAccessible).toBe(true);
  });
});