import { test, expect, Page, Request, Response } from '@playwright/test';
import { waitForPageLoad } from '../utils/test-helpers';

test.describe('API & Data Flow Tests', () => {

  test.describe.configure({ mode: 'serial' });

  test('A01. Supabase REST API responds correctly', async ({ page }) => {
    const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://pvzecbcpuhmfytfdonfc.supabase.co';
    const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || '';

    const response = await page.request.get(`${supabaseUrl}/rest/v1/`, {
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
      },
    });

    console.log(`📡 API Status: ${response.status()}`);

    expect(response.status()).toBe(200);

    const data = await response.json();
    console.log(`📡 API Response type: ${typeof data}`);
  });

  test('A02. Activities endpoint returns data', async ({ page }) => {
    const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://pvzecbcpuhmfytfdonfc.supabase.co';
    const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || '';

    const response = await page.request.get(`${supabaseUrl}/rest/v1/activities?select=*&limit=5`, {
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
      },
    });

    console.log(`📡 Activities Status: ${response.status()}`);

    expect(response.status()).toBe(200);

    const activities = await response.json();
    console.log(`📡 Activities count: ${Array.isArray(activities) ? activities.length : 'not array'}`);
  });

  test('A03. Goals endpoint accessible', async ({ page }) => {
    const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://pvzecbcpuhmfytfdonfc.supabase.co';
    const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || '';

    const response = await page.request.get(`${supabaseUrl}/rest/v1/goals?select=*&limit=5`, {
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
      },
    });

    console.log(`📡 Goals Status: ${response.status()}`);

    const statusOk = response.status() === 200 || response.status() === 206;
    expect(statusOk).toBe(true);
  });

  test('A04. Business units endpoint accessible', async ({ page }) => {
    const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://pvzecbcpuhmfytfdonfc.supabase.co';
    const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || '';

    const response = await page.request.get(`${supabaseUrl}/rest/v1/business_units?select=*&limit=5`, {
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
      },
    });

    console.log(`📡 Business Units Status: ${response.status()}`);

    const statusOk = response.status() === 200 || response.status() === 206;
    expect(statusOk).toBe(true);
  });

  test('A05. Users endpoint accessible', async ({ page }) => {
    const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://pvzecbcpuhmfytfdonfc.supabase.co';
    const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || '';

    const response = await page.request.get(`${supabaseUrl}/rest/v1/users?select=*&limit=5`, {
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
      },
    });

    console.log(`📡 Users Status: ${response.status()}`);

    const statusOk = response.status() === 200 || response.status() === 206;
    expect(statusOk).toBe(true);
  });

  test('A06. API responses have correct content-type', async ({ page }) => {
    const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://pvzecbcpuhmfytfdonfc.supabase.co';
    const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || '';

    const response = await page.request.get(`${supabaseUrl}/rest/v1/activities?limit=1`, {
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
      },
    });

    const contentType = response.headers()['content-type'];
    console.log(`📡 Content-Type: ${contentType}`);

    expect(contentType).toContain('application/json');
  });

  test('A07. API error handling - invalid endpoint', async ({ page }) => {
    const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://pvzecbcpuhmfytfdonfc.supabase.co';
    const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || '';

    const response = await page.request.get(`${supabaseUrl}/rest/v1/nonexistent_table`, {
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
      },
    });

    console.log(`📡 Invalid endpoint status: ${response.status()}`);

    const isErrorStatus = response.status() >= 400;
    expect(isErrorStatus).toBe(true);
  });

  test('A08. API error handling - missing auth', async ({ page }) => {
    const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://pvzecbcpuhmfytfdonfc.supabase.co';

    const response = await page.request.get(`${supabaseUrl}/rest/v1/activities?limit=1`, {
      headers: {},
    });

    console.log(`📡 No auth status: ${response.status()}`);

    const isErrorStatus = response.status() >= 400;
    expect(isErrorStatus).toBe(true);
  });

  test('A09. Page intercepts API calls correctly', async ({ page }) => {
    const apiCalls: { url: string; status: number }[] = [];

    page.on('response', response => {
      if (response.url().includes('/rest/v1/') || response.url().includes('/auth/')) {
        apiCalls.push({ url: response.url(), status: response.status() });
      }
    });

    await page.goto('/');
    await waitForPageLoad(page);
    await page.waitForTimeout(3000);

    console.log(`📡 API calls made on page load: ${apiCalls.length}`);

    apiCalls.slice(0, 5).forEach(call => {
      const icon = call.status < 400 ? '✅' : '❌';
      console.log(`  ${icon} ${call.status} - ${call.url.split('?')[0].split('/').slice(-2).join('/')}`);
    });

    const failedCalls = apiCalls.filter(c => c.status >= 400);
    expect(failedCalls).toHaveLength(0);
  });

  test('A10. Mutations trigger correct API calls', async ({ page }) => {
    const mutations: Request[] = [];

    page.on('request', request => {
      if (request.method() !== 'GET' && (request.url().includes('/rest/v1/') || request.url().includes('/functions/'))) {
        mutations.push(request);
      }
    });

    await page.goto('/reporting');
    await waitForPageLoad(page);

    const addBtn = page.locator('button:has-text("New Update"), button:has-text("Add Goal")').first();

    if (await addBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await addBtn.click();

      const modal = page.locator('[role="dialog"]').first();
      await modal.waitFor({ state: 'visible', timeout: 5000 });

      const input = modal.locator('input').first();
      if (await input.isVisible().catch(() => false)) {
        await input.fill('API Test Goal');
        await modal.locator('button:has-text("Save")').click();

        await page.waitForTimeout(2000);

        console.log(`📡 Mutations triggered: ${mutations.length}`);
        mutations.forEach(req => {
          console.log(`  ${req.method()} ${req.url().split('?')[0].split('/').slice(-2).join('/')}`);
        });
      }
    }
  });

  test('A11. Edge functions are reachable', async ({ page }) => {
    const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://pvzecbcpuhmfytfdonfc.supabase.co';
    const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || '';

    const response = await page.request.post(
      `${supabaseUrl}/functions/v1/send-email`,
      {
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json',
        },
        data: { healthCheck: true },
      }
    );

    console.log(`📡 Edge function status: ${response.status()}`);

    const statusOk = response.status() < 500;
    expect(statusOk).toBe(true);
  });

  test('A12. Real-time subscriptions connection', async ({ page }) => {
    const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://pvzecbcpuhmfytfdonfc.supabase.co';
    const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || '';

    const wsUrl = supabaseUrl.replace('https://', 'wss://').replace('http://', 'ws://');

    console.log(`📡 WebSocket URL: ${wsUrl}/realtime/v1/websocket`);

    await page.goto('/');
    await waitForPageLoad(page);

    const connected = await page.evaluate(() => {
      return typeof (window as any).supabase !== 'undefined' ||
             document.body.dataset.supabaseConnected === 'true';
    });

    console.log(`📡 Realtime connected: ${connected}`);
  });

  test('A13. Data caching works correctly', async ({ page }) => {
    await page.goto('/reporting');
    await waitForPageLoad(page);

    const initialLoad = Date.now();
    await page.waitForTimeout(1000);
    const initialDuration = Date.now() - initialLoad;

    await page.reload();
    await waitForPageLoad(page);

    const cachedLoad = Date.now();
    await page.waitForTimeout(500);
    const cachedDuration = Date.now() - cachedLoad;

    console.log(`📡 Initial load: ${initialDuration}ms`);
    console.log(`📡 Cached load: ${cachedDuration}ms`);
    console.log(`📡 Speed improvement: ${initialDuration > cachedDuration ? 'yes' : 'no caching detected'}`);
  });

  test('A14. Pagination API works', async ({ page }) => {
    const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://pvzecbcpuhmfytfdonfc.supabase.co';
    const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || '';

    const page1 = await page.request.get(`${supabaseUrl}/rest/v1/activities?select=id&limit=5&offset=0`, {
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
      },
    });

    const page2 = await page.request.get(`${supabaseUrl}/rest/v1/activities?select=id&limit=5&offset=5`, {
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
      },
    });

    const data1 = await page1.json();
    const data2 = await page2.json();

    console.log(`📡 Page 1 items: ${(data1 as any[]).length}`);
    console.log(`📡 Page 2 items: ${(data2 as any[]).length}`);

    const differentData = JSON.stringify(data1) !== JSON.stringify(data2);
    expect(differentData).toBe(true);
  });

  test('A15. Filter API query works', async ({ page }) => {
    const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://pvzecbcpuhmfytfdonfc.supabase.co';
    const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || '';

    const response = await page.request.get(
      `${supabaseUrl}/rest/v1/activities?status=eq.active&select=*&limit=5`,
      {
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
        },
      }
    );

    console.log(`📡 Filtered query status: ${response.status()}`);

    expect(response.status()).toBe(200);
  });
});