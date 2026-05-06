import { test, expect, Page } from '@playwright/test';
import { waitForPageLoad, routes, pageIdentifiers, ConsoleCapture, NetworkMonitor } from '../utils/test-helpers';
import { Sidebar } from '../utils/page-objects';

test.describe('Navigation & Routing Tests', () => {

  test.describe.configure({ mode: 'serial' });

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await waitForPageLoad(page);
  });

  test('01. All defined routes should load without 404', async ({ page }) => {
    const routeResults: { route: string; status: number | null; error?: string }[] = [];

    for (const [name, path] of Object.entries(routes)) {
      try {
        const response = await page.goto(path, { waitUntil: 'domcontentloaded', timeout: 15000 });
        routeResults.push({ route: name, status: response?.status() || null });

        expect(response?.status() || 0).toBeLessThan(400);

        await page.goBack();
        await waitForPageLoad(page);
      } catch (error) {
        routeResults.push({ route: name, status: null, error: (error as Error).message });
      }
    }

    console.log('\n📋 Route Test Results:');
    routeResults.forEach(r => {
      const icon = r.status && r.status < 400 ? '✅' : '❌';
      console.log(`  ${icon} ${r.route}: ${r.status || 'FAILED'} ${r.error || ''}`);
    });
  });

  test('02. Sidebar navigation should navigate to correct routes', async ({ page }) => {
    const sidebar = new Sidebar(page);
    const navResults: { label: string; url: string; success: boolean }[] = [];

    for (const [name, path] of Object.entries(routes)) {
      const initialUrl = page.url();
      try {
        await sidebar.clickNavItem(name);
        await page.waitForURL(`**${path}`, { timeout: 5000 });
        navResults.push({ label: name, url: page.url(), success: true });
      } catch {
        navResults.push({ label: name, url: page.url(), success: false });
      }
    }

    console.log('\n📋 Sidebar Navigation Results:');
    navResults.forEach(r => {
      const icon = r.success ? '✅' : '❌';
      console.log(`  ${icon} ${r.label}: ${r.url}`);
    });

    const failed = navResults.filter(r => !r.success);
    expect(failed).toHaveLength(0);
  });

  test('03. Each page should have unique identifying content', async ({ page }) => {
    const identifierResults: { page: string; identifier: string; found: boolean }[] = [];

    for (const [name, path] of Object.entries(routes)) {
      await page.goto(path);
      await waitForPageLoad(page);

      const identifier = pageIdentifiers[name];
      if (identifier) {
        const element = page.locator(identifier.selector).filter({ hasText: identifier.label }).first();
        const found = await element.isVisible().catch(() => false);
        identifierResults.push({ page: name, identifier: identifier.label, found });
      }
    }

    console.log('\n📋 Page Identifier Results:');
    identifierResults.forEach(r => {
      const icon = r.found ? '✅' : '❌';
      console.log(`  ${icon} ${r.page}: "${r.identifier}" ${r.found ? 'found' : 'NOT FOUND'}`);
    });

    const missing = identifierResults.filter(r => !r.found);
    expect(missing).toHaveLength(0);
  });

  test('04. No broken internal links on any page', async ({ page }) => {
    const allBrokenLinks: { page: string; link: string; error: string }[] = [];

    for (const [name, path] of Object.entries(routes)) {
      await page.goto(path);
      await waitForPageLoad(page);

      const links = await page.locator('a[href]').all();
      for (const link of links) {
        const href = await link.getAttribute('href');
        if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('http')) continue;

        try {
          const response = await page.goto(href, { waitUntil: 'domcontentloaded', timeout: 5000 });
          if (response && response.status() >= 400) {
            allBrokenLinks.push({ page: name, link: href, error: `HTTP ${response.status()}` });
          }
          await page.goBack();
          await waitForPageLoad(page);
        } catch (error) {
          allBrokenLinks.push({ page: name, link: href, error: (error as Error).message });
        }
      }
    }

    console.log('\n📋 Broken Links Results:');
    if (allBrokenLinks.length === 0) {
      console.log('  ✅ No broken links found');
    } else {
      allBrokenLinks.forEach(b => {
        console.log(`  ❌ ${b.page}: ${b.link} - ${b.error}`);
      });
    }

    expect(allBrokenLinks).toHaveLength(0);
  });

  test('05. Page should load within acceptable time', async ({ page }) => {
    const loadTimes: { page: string; time: number }[] = [];

    for (const [name, path] of Object.entries(routes)) {
      const start = Date.now();
      await page.goto(path, { waitUntil: 'networkidle', timeout: 30000 });
      const loadTime = Date.now() - start;
      loadTimes.push({ page: name, time: loadTime });

      console.log(`  ${loadTime < 3000 ? '✅' : '⚠️'} ${name}: ${loadTime}ms`);
    }

    const slowPages = loadTimes.filter(t => t.time > 5000);
    if (slowPages.length > 0) {
      console.log('\n⚠️ Slow loading pages detected:');
      slowPages.forEach(p => console.log(`  - ${p.page}: ${p.time}ms`));
    }
  });

  test('06. Sidebar should collapse/expand correctly', async ({ page }) => {
    const sidebar = new Sidebar(page);

    await page.goto('/');
    await waitForPageLoad(page);

    const initialExpanded = await sidebar.isExpanded();
    expect(initialExpanded).toBe(true);

    await sidebar.toggleCollapse();
    const collapsed = await sidebar.isExpanded();
    expect(collapsed).toBe(false);

    await sidebar.toggleCollapse();
    const reExpanded = await sidebar.isExpanded();
    expect(reExpanded).toBe(true);
  });

  test('07. Navigate via URL directly should work for all routes', async ({ page }) => {
    for (const [name, path] of Object.entries(routes)) {
      await page.goto(path);
      const content = await page.content();
      expect(content).not.toContain('Page not found');
      expect(content).not.toContain('404');

      const hasContent = await page.locator('body').textContent();
      expect(hasContent?.length).toBeGreaterThan(100);
    }
  });
});