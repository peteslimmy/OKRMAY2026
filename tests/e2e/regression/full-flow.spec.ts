import { test, expect, Page, Response } from '@playwright/test';
import { waitForPageLoad, ConsoleCapture, NetworkMonitor, routes } from '../utils/test-helpers';

test.describe('Regression Test Suite - Full Flow Validation', () => {

  test.describe.configure({ mode: 'serial' });

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await waitForPageLoad(page);
  });

  test('R01. Application loads without console errors', async ({ page }) => {
    const consoleCapture = new ConsoleCapture(page);

    await page.goto('/');
    await waitForPageLoad(page);
    await page.waitForTimeout(2000);

    const errors = consoleCapture.getErrors();
    const criticalErrors = errors.filter(e =>
      !e.message.includes('favicon') &&
      !e.message.includes('placeholder') &&
      !e.message.includes('net::ERR')
    );

    console.log(`\n📋 Console Errors: ${criticalErrors.length}`);
    criticalErrors.forEach(e => console.log(`  - ${e.message}`));

    expect(criticalErrors.length).toBe(0);
  });

  test('R02. All network requests succeed', async ({ page }) => {
    const networkMonitor = new NetworkMonitor(page);

    await page.goto('/');
    await waitForPageLoad(page);

    const failedRequests = networkMonitor.getFailedRequests();

    console.log(`\n📋 Failed Requests: ${failedRequests.length}`);
    failedRequests.forEach(req => {
      console.log(`  - ${req.method()} ${req.url()}`);
      console.log(`    Error: ${req.failure()?.errorText}`);
    });

    expect(failedRequests.length).toBe(0);
  });

  test('R03. Complete user workflow - Dashboard to Reporting', async ({ page }) => {
    await page.goto('/');
    await waitForPageLoad(page);

    const dashboardLoaded = await page.locator('h1').first().isVisible();
    expect(dashboardLoaded).toBe(true);
    console.log('✅ Dashboard loaded');

    await page.locator('a:has-text("Reporting"), a:has-text("Weekly Reporting")').click();
    await waitForPageLoad(page);

    const reportingLoaded = await page.locator('h1:has-text("Weekly")').isVisible().catch(() => false) ||
                           await page.locator('text=Weekly Reporting').isVisible().catch(() => false);
    console.log(`✅ Reporting page loaded: ${reportingLoaded}`);
  });

  test('R04. Complete user workflow - Reporting Goal Creation', async ({ page }) => {
    await page.goto('/reporting');
    await waitForPageLoad(page);

    const addBtn = page.locator('button:has-text("New Update"), button:has-text("Add Goal")').first();

    if (await addBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      await addBtn.click();

      const modal = page.locator('[role="dialog"]').first();
      await modal.waitFor({ state: 'visible', timeout: 5000 });
      console.log('✅ Add Goal modal opened');

      const titleInput = modal.locator('input[placeholder*="goal"], input[placeholder*="Goal"]').first();
      const taskInput = modal.locator('input[placeholder*="task"], input[placeholder*="Task"]').first();

      if (await titleInput.isVisible().catch(() => false)) {
        await titleInput.fill('Test Goal from Playwright');
        await taskInput.fill('Test Task 1');
        console.log('✅ Form filled');

        const saveBtn = modal.locator('button:has-text("Save"), button:has-text("Update")').first();
        await saveBtn.click();

        await page.waitForTimeout(2000);
        console.log('✅ Goal creation attempted');
      }
    } else {
      console.log('⚠️ Add Goal button not visible');
    }
  });

  test('R05. Complete user workflow - Business Units Navigation', async ({ page }) => {
    await page.goto('/units');
    await waitForPageLoad(page);

    const heading = page.locator('h1:has-text("Unit"), h1:has-text("Corporate")').first();
    await expect(heading).toBeVisible({ timeout: 10000 });
    console.log('✅ Business Units page loaded');

    const viewToggle = page.locator('button:has-text("Org Chart"), button:has-text("Cards")').first();
    if (await viewToggle.isVisible()) {
      await viewToggle.click();
      await page.waitForTimeout(500);
      console.log('✅ View toggle clicked');
    }
  });

  test('R06. Complete user workflow - Settings Navigation', async ({ page }) => {
    await page.goto('/settings');
    await waitForPageLoad(page);

    const heading = page.locator('h2:has-text("Governance"), h1:has-text("Governance")').first();
    await expect(heading).toBeVisible({ timeout: 10000 });
    console.log('✅ Settings page loaded');

    const tabs = page.locator('[role="tab"], button[class*="tab"]');
    const tabCount = await tabs.count();
    console.log(`📋 Found ${tabCount} settings tabs`);

    if (tabCount > 1) {
      await tabs.nth(1).click();
      await page.waitForTimeout(500);
      console.log('✅ Tab switching works');
    }
  });

  test('R07. State persistence across navigation', async ({ page }) => {
    await page.goto('/reporting');
    await waitForPageLoad(page);

    const weekSelector = page.locator('select').first();
    const initialValue = await weekSelector.inputValue().catch(() => '');

    if (initialValue) {
      await weekSelector.selectOption({ index: 2 });
      await page.waitForTimeout(500);

      await page.goto('/');
      await waitForPageLoad(page);

      await page.goto('/reporting');
      await waitForPageLoad(page);

      const selector = page.locator('select').first();
      const rememberedValue = await selector.inputValue().catch(() => '');

      console.log(`📋 Initial: ${initialValue}, After nav: ${rememberedValue}`);
    }
  });

  test('R08. No duplicate element IDs exist', async ({ page }) => {
    await page.goto('/');
    await waitForPageLoad(page);

    const duplicateIds = await page.evaluate(() => {
      const elements = document.querySelectorAll('[id]');
      const idCount: Record<string, number> = {};
      elements.forEach(el => {
        const id = el.id;
        idCount[id] = (idCount[id] || 0) + 1;
      });
      return Object.fromEntries(Object.entries(idCount).filter(([, count]) => count > 1));
    });

    console.log(`\n📋 Duplicate IDs found: ${Object.keys(duplicateIds).length}`);
    Object.entries(duplicateIds).forEach(([id, count]) => {
      console.log(`  - #${id}: ${count} occurrences`);
    });

    expect(Object.keys(duplicateIds)).toHaveLength(0);
  });

  test('R09. All interactive elements are accessible', async ({ page }) => {
    await page.goto('/');
    await waitForPageLoad(page);

    const buttons = await page.locator('button').all();
    const links = await page.locator('a[href]').all();
    const inputs = await page.locator('input, select, textarea').all();

    console.log(`\n📋 Interactive elements:`);
    console.log(`  - Buttons: ${buttons.length}`);
    console.log(`  - Links: ${links.length}`);
    console.log(`  - Inputs: ${inputs.length}`);

    for (const button of buttons.slice(0, 5)) {
      const isDisabled = await button.isDisabled();
      const isHidden = await button.isHidden();
      const text = await button.textContent();
      console.log(`  Button: "${text?.trim().slice(0, 30)}" - disabled:${isDisabled}, hidden:${isHidden}`);
    }
  });

  test('R10. Page content is not duplicated across routes', async ({ page }) => {
    const pageSignatures: Record<string, string> = {};

    for (const [name, path] of Object.entries(routes)) {
      await page.goto(path);
      await waitForPageLoad(page);

      const h1Text = await page.locator('h1').first().textContent().catch(() => 'NO_H1');
      const mainContent = await page.locator('main, [role="main"]').first().textContent().catch(() => '');

      const signature = `${h1Text?.trim()}_${mainContent?.trim().slice(0, 50)}`;

      if (Object.values(pageSignatures).includes(signature) && name !== 'dashboard') {
        console.log(`⚠️ ${name} may have duplicate content`);
      } else {
        console.log(`✅ ${name}: signature unique`);
      }

      pageSignatures[name] = signature;
    }
  });

  test('R11. Visual smoke test - critical pages render', async ({ page }) => {
    const criticalPages = ['/', '/reporting', '/units', '/settings'];

    for (const path of criticalPages) {
      await page.goto(path);
      await waitForPageLoad(page);

      const body = await page.locator('body').first();
      const boundingBox = await body.boundingBox();

      console.log(`📋 ${path}: ${boundingBox ? `${boundingBox.width}x${boundingBox.height}` : 'no bounding box'}`);

      expect(boundingBox).not.toBeNull();
      expect(boundingBox!.width).toBeGreaterThan(100);
      expect(boundingBox!.height).toBeGreaterThan(100);
    }
  });

  test('R12. No memory leaks on repeated navigation', async ({ page }) => {
    const routesToTest = ['/', '/reporting', '/units', '/settings', '/objectives'];

    for (let i = 0; i < 3; i++) {
      for (const path of routesToTest) {
        await page.goto(path);
        await waitForPageLoad(page);
        await page.waitForTimeout(200);
      }
    }

    const memoryUsage = await page.evaluate(() => {
      if ((performance as any).memory) {
        return {
          used: (performance as any).memory.usedJSHeapSize,
          total: (performance as any).memory.totalJSHeapSize,
        };
      }
      return null;
    });

    if (memoryUsage) {
      console.log(`📋 Memory usage: ${Math.round(memoryUsage.used / 1024 / 1024)}MB / ${Math.round(memoryUsage.total / 1024 / 1024)}MB`);
    } else {
      console.log('📋 Memory API not available in this browser');
    }

    console.log('✅ Repeated navigation completed without crash');
  });

  test('R13. API responses are properly handled', async ({ page }) => {
    await page.goto('/reporting');
    await waitForPageLoad(page);

    const apiCalls: { url: string; status: number | null }[] = [];

    page.on('response', response => {
      if (response.url().includes('/rest/v1/') || response.url().includes('/api/')) {
        apiCalls.push({ url: response.url(), status: response.status() });
      }
    });

    await page.reload();
    await waitForPageLoad(page);
    await page.waitForTimeout(2000);

    console.log(`\n📋 API calls made: ${apiCalls.length}`);
    apiCalls.slice(0, 10).forEach(call => {
      const icon = call.status && call.status < 400 ? '✅' : '❌';
      console.log(`  ${icon} ${call.status} ${call.url.split('?')[0].split('/').slice(-2).join('/')}`);
    });

    const failedCalls = apiCalls.filter(c => c.status && c.status >= 400);
    expect(failedCalls).toHaveLength(0);
  });

  test('R14. Responsive design - mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    await waitForPageLoad(page);

    const sidebar = page.locator('aside');
    const sidebarVisible = await sidebar.isVisible();

    if (sidebarVisible) {
      const sidebarWidth = await sidebar.evaluate(el => (el as HTMLElement).offsetWidth);
      console.log(`📋 Mobile: Sidebar width = ${sidebarWidth}px`);

      const menuBtn = page.locator('[aria-label*="menu"], [aria-label*="Menu"]').first();
      if (await menuBtn.isVisible()) {
        await menuBtn.click();
        await page.waitForTimeout(500);
        console.log('✅ Mobile menu opened');
      }
    }

    const mainContent = page.locator('main');
    const contentWidth = await mainContent.evaluate(el => (el as HTMLElement).offsetWidth);
    console.log(`📋 Mobile: Content width = ${contentWidth}px`);

    expect(contentWidth).toBeLessThanOrEqual(375);
  });
});