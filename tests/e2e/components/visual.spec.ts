import { test, expect } from '@playwright/test';
import { waitForPageLoad } from '../utils/test-helpers';

test.describe('Visual Regression Tests', () => {

  test.describe.configure({ mode: 'serial' });

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await waitForPageLoad(page);
  });

  test('V01. Dashboard visual baseline', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });

    const dashboard = page.locator('[class*="dashboard"], main').first();
    await dashboard.waitFor({ state: 'visible' });

    await page.waitForTimeout(1000);

    await expect(page).toHaveScreenshot('dashboard-full.png', {
      fullPage: false,
      animations: 'disabled',
    });

    console.log('📸 Dashboard screenshot captured');
  });

  test('V02. Sidebar collapsed state', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });

    const collapseBtn = page.locator('[aria-label*="collapse"], button[class*="collapse"]').first();

    if (await collapseBtn.isVisible().catch(() => false)) {
      await collapseBtn.click();
      await page.waitForTimeout(500);

      await expect(page).toHaveScreenshot('sidebar-collapsed.png', {
        fullPage: false,
        animations: 'disabled',
      });

      console.log('📸 Collapsed sidebar screenshot captured');
    }
  });

  test('V03. Dashboard mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });

    const sidebar = page.locator('aside');
    const menuBtn = page.locator('[aria-label*="menu"], button[class*="menu"]').first();

    if (await menuBtn.isVisible().catch(() => false)) {
      await menuBtn.click();
      await page.waitForTimeout(500);
    }

    await expect(page).toHaveScreenshot('dashboard-mobile.png', {
      fullPage: false,
      animations: 'disabled',
    });

    console.log('📸 Mobile dashboard screenshot captured');
  });

  test('V04. Reporting page visual baseline', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('/reporting');
    await waitForPageLoad(page);

    await page.waitForTimeout(1000);

    const main = page.locator('main').first();
    await main.waitFor({ state: 'visible' });

    await expect(page).toHaveScreenshot('reporting-full.png', {
      fullPage: false,
      animations: 'disabled',
    });

    console.log('📸 Reporting page screenshot captured');
  });

  test('V05. Business Units page visual baseline', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('/units');
    await waitForPageLoad(page);

    await page.waitForTimeout(1000);

    const main = page.locator('main').first();
    await main.waitFor({ state: 'visible' });

    await expect(page).toHaveScreenshot('units-full.png', {
      fullPage: false,
      animations: 'disabled',
    });

    console.log('📸 Units page screenshot captured');
  });

  test('V06. Settings page visual baseline', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('/settings');
    await waitForPageLoad(page);

    await page.waitForTimeout(1000);

    const main = page.locator('main').first();
    await main.waitFor({ state: 'visible' });

    await expect(page).toHaveScreenshot('settings-full.png', {
      fullPage: false,
      animations: 'disabled',
    });

    console.log('📸 Settings page screenshot captured');
  });

  test('V07. Modal dialog visual check', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('/reporting');
    await waitForPageLoad(page);

    const addBtn = page.locator('button:has-text("New Update"), button:has-text("Add Goal")').first();

    if (await addBtn.isVisible().catch(() => false)) {
      await addBtn.click();

      const modal = page.locator('[role="dialog"]').first();
      await modal.waitFor({ state: 'visible', timeout: 5000 });
      await page.waitForTimeout(500);

      await expect(page).toHaveScreenshot('modal-open.png', {
        fullPage: false,
        animations: 'disabled',
      });

      console.log('📸 Modal screenshot captured');
    }
  });

  test('V08. Goal card component detail', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('/reporting');
    await waitForPageLoad(page);

    const goalCard = page.locator('[class*="GoalCard"], [class*="goal-card"]').first();

    if (await goalCard.isVisible().catch(() => false)) {
      await goalCard.scrollIntoViewIfNeeded();
      await goalCard.hover();
      await page.waitForTimeout(500);

      await expect(goalCard).toHaveScreenshot('goal-card-hover.png', {
        animations: 'disabled',
      });

      console.log('📸 Goal card hover state captured');
    }
  });

  test('V09. Dropdown select open state', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('/reporting');
    await waitForPageLoad(page);

    const select = page.locator('select').first();

    if (await select.isVisible().catch(() => false)) {
      await select.focus();
      await select.press('Space');
      await page.waitForTimeout(300);

      await expect(select).toHaveScreenshot('select-dropdown.png', {
        animations: 'disabled',
      });

      console.log('📸 Dropdown screenshot captured');
    }
  });

  test('V10. Charts render correctly', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('/');
    await waitForPageLoad(page);

    const chart = page.locator('.recharts-wrapper').first();

    if (await chart.isVisible().catch(() => false)) {
      await chart.scrollIntoViewIfNeeded();
      await page.waitForTimeout(1000);

      await expect(chart).toHaveScreenshot('chart-rendered.png', {
        animations: 'disabled',
      });

      console.log('📸 Chart screenshot captured');
    }
  });

  test('V11. Loading state skeleton', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });

    await page.evaluate(() => {
      (window as any).showLoadingState?.();
    });

    await page.waitForTimeout(500);

    const skeletons = page.locator('[class*="skeleton"], [class*="loading"], [class*="placeholder"]');
    const hasSkeletons = await skeletons.first().isVisible().catch(() => false);

    if (hasSkeletons) {
      await expect(page).toHaveScreenshot('loading-skeleton.png', {
        fullPage: false,
        animations: 'disabled',
      });
      console.log('📸 Loading skeleton screenshot captured');
    }
  });

  test('V12. Empty state display', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('/reporting');
    await waitForPageLoad(page);

    const emptyState = page.locator('[class*="empty"], text=No.*found, text=Nothing').first();

    if (await emptyState.isVisible().catch(() => false)) {
      await emptyState.scrollIntoViewIfNeeded();
      await page.waitForTimeout(500);

      await expect(page).toHaveScreenshot('empty-state.png', {
        fullPage: false,
        animations: 'disabled',
      });

      console.log('📸 Empty state screenshot captured');
    }
  });

  test('V13. Toast notification appearance', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });

    await page.evaluate(() => {
      const toast = document.createElement('div');
      toast.className = 'toast-notification';
      toast.textContent = 'Test notification';
      toast.style.cssText = 'position:fixed;top:20px;right:20px;padding:16px;background:green;color:white;z-index:9999;border-radius:8px;';
      document.body.appendChild(toast);
    });

    await page.waitForTimeout(500);

    await expect(page).toHaveScreenshot('toast-notification.png', {
      fullPage: false,
      animations: 'disabled',
    });

    console.log('📸 Toast notification screenshot captured');
  });

  test('V14. User table component', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('/users');
    await waitForPageLoad(page);

    const table = page.locator('table').first();

    if (await table.isVisible().catch(() => false)) {
      await table.scrollIntoViewIfNeeded();
      await page.waitForTimeout(500);

      await expect(table).toHaveScreenshot('user-table.png', {
        animations: 'disabled',
      });

      console.log('📸 User table screenshot captured');
    }
  });

  test('V15. Quarter sections in Objectives', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('/objectives');
    await waitForPageLoad(page);

    await page.waitForTimeout(1000);

    const q1 = page.locator('text=Q1').first();
    if (await q1.isVisible().catch(() => false)) {
      await q1.scrollIntoViewIfNeeded();

      await expect(page).toHaveScreenshot('objectives-quarter.png', {
        fullPage: false,
        animations: 'disabled',
      });

      console.log('📸 Objectives quarter screenshot captured');
    }
  });

  test('V16. Org chart view', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('/units');
    await waitForPageLoad(page);

    const orgChartBtn = page.locator('button:has-text("Org Chart")').first();

    if (await orgChartBtn.isVisible().catch(() => false)) {
      await orgChartBtn.click();
      await page.waitForTimeout(1000);

      const orgChart = page.locator('[class*="org"], svg').first();

      if (await orgChart.isVisible().catch(() => false)) {
        await expect(orgChart).toHaveScreenshot('org-chart.png', {
          animations: 'disabled',
        });
        console.log('📸 Org chart screenshot captured');
      }
    }
  });

  test('V17. Settings tab content', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('/settings');
    await waitForPageLoad(page);

    const tabs = page.locator('[role="tab"]');
    if (await tabs.count() > 1) {
      await tabs.nth(1).click();
      await page.waitForTimeout(500);

      await expect(page).toHaveScreenshot('settings-tab-content.png', {
        fullPage: false,
        animations: 'disabled',
      });

      console.log('📸 Settings tab screenshot captured');
    }
  });

  test('V18. Attendance page visual', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('/operations/attendance');
    await waitForPageLoad(page);

    await page.waitForTimeout(1000);

    const main = page.locator('main').first();
    await main.waitFor({ state: 'visible' });

    await expect(page).toHaveScreenshot('attendance-full.png', {
      fullPage: false,
      animations: 'disabled',
    });

    console.log('📸 Attendance page screenshot captured');
  });

  test('V19. Integrity checker page visual', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('/integrity');
    await waitForPageLoad(page);

    await page.waitForTimeout(1000);

    const main = page.locator('main').first();
    await main.waitFor({ state: 'visible' });

    await expect(page).toHaveScreenshot('integrity-full.png', {
      fullPage: false,
      animations: 'disabled',
    });

    console.log('📸 Integrity page screenshot captured');
  });

  test('V20. Full page scroll depth check', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('/');
    await waitForPageLoad(page);

    const scrollHeight = await page.evaluate(() => document.body.scrollHeight);
    console.log(`📏 Page scroll height: ${scrollHeight}px`);

    const viewportHeight = 1080;
    const scrollSteps = Math.ceil(scrollHeight / viewportHeight);

    for (let i = 0; i < Math.min(scrollSteps, 5); i++) {
      await page.evaluate((step) => {
        window.scrollTo(0, window.innerHeight * step);
      }, i);
      await page.waitForTimeout(500);

      await expect(page).toHaveScreenshot(`scroll-position-${i}.png`, {
        fullPage: false,
        animations: 'disabled',
      });
    }

    await page.evaluate(() => window.scrollTo(0, 0));
    console.log(`📸 Scroll position screenshots captured (${scrollSteps} steps)`);
  });
});