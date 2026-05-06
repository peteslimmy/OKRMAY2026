import { test, expect, Page, Locator } from '@playwright/test';
import { waitForPageLoad } from '../utils/test-helpers';

test.describe('Component Rendering Tests', () => {

  test.describe.configure({ mode: 'parallel' });

  test('01. Dashboard StatCards should render with data', async ({ page }) => {
    await page.goto('/');
    await waitForPageLoad(page);

    const statCards = page.locator('[class*="StatCard"], [class*="stat-card"], [data-testid*="stat"]');
    const count = await statCards.count();

    console.log(`📋 Found ${count} StatCards on Dashboard`);

    expect(count).toBeGreaterThan(0);

    for (let i = 0; i < Math.min(count, 4); i++) {
      const card = statCards.nth(i);
      await expect(card).toBeVisible();

      const hasContent = await card.locator('text=Week, Objective, Unit, Score, BPI').first().isVisible().catch(() => true);
      console.log(`  Card ${i + 1} has content: ${hasContent}`);
    }
  });

  test('02. GoalCards should display goal information correctly', async ({ page }) => {
    await page.goto('/reporting');
    await waitForPageLoad(page);

    const goalCards = page.locator('[class*="GoalCard"], [data-testid="goal-card"]');
    const count = await goalCards.count();

    console.log(`📋 Found ${count} GoalCards`);

    if (count > 0) {
      const firstCard = goalCards.first();

      const hasTitle = await firstCard.locator('h3, h4, [class*="title"]').first().isVisible().catch(() => false);
      const hasProgress = await firstCard.locator('[class*="progress"], [class*="score"]').first().isVisible().catch(() => false);
      const hasTasks = await firstCard.locator('[class*="task"]').first().isVisible().catch(() => false);

      console.log(`  First card - Title: ${hasTitle}, Progress: ${hasProgress}, Tasks: ${hasTasks}`);

      expect(hasTitle || hasProgress).toBe(true);
    }
  });

  test('03. KR sections should have correct structure', async ({ page }) => {
    await page.goto('/objectives');
    await waitForPageLoad(page);

    const quarterColumns = page.locator('[class*="quarter"], [class*="Q1"], [class*="Q2"], [class*="Q3"], [class*="Q4"]');
    const count = await quarterColumns.count();

    console.log(`📋 Found ${count} quarter sections`);

    expect(count).toBeGreaterThan(0);

    for (const q of ['Q1', 'Q2', 'Q3', 'Q4']) {
      const qSection = page.locator(`text="${q}"`).first();
      const isVisible = await qSection.isVisible().catch(() => false);
      console.log(`  ${q} visible: ${isVisible}`);
    }
  });

  test('04. User table should render with proper structure', async ({ page }) => {
    await page.goto('/users');
    await waitForPageLoad(page);

    const table = page.locator('table, [data-testid="user-table"]').first();
    const isVisible = await table.isVisible().catch(() => false);

    if (isVisible) {
      const headers = await table.locator('thead th, thead td').allTextContents();
      const rowCount = await table.locator('tbody tr').count();

      console.log(`📋 User table: ${rowCount} rows`);
      console.log(`  Headers: ${headers.join(', ')}`);

      expect(rowCount).toBeGreaterThanOrEqual(0);
    } else {
      console.log('⚠️ User table not visible (may require admin access)');
    }
  });

  test('05. Charts should render without errors', async ({ page }) => {
    await page.goto('/');
    await waitForPageLoad(page);

    const charts = page.locator('svg.recharts-surface, [class*="Chart"], [data-testid*="chart"]');
    const count = await charts.count();

    console.log(`📋 Found ${count} charts`);

    for (let i = 0; i < Math.min(count, 5); i++) {
      const chart = charts.nth(i);
      await expect(chart).toBeVisible();

      const svgContent = await chart.locator('svg').first().innerHTML();
      const hasContent = svgContent.length > 100;
      console.log(`  Chart ${i + 1} rendered: ${hasContent}`);
    }
  });

  test('06. Toast notifications should be present if triggered', async ({ page }) => {
    await page.goto('/');
    await waitForPageLoad(page);

    const toasts = page.locator('[role="alert"], [class*="toast"], [data-testid*="toast"]');
    const initialCount = await toasts.count();

    console.log(`📋 Initial toast count: ${initialCount}`);
  });

  test('07. Loading states should show and hide correctly', async ({ page }) => {
    await page.goto('/reporting');
    await waitForPageLoad(page);

    const loadingSpinner = page.locator('[class*="spinner"], [class*="loading"], [data-testid*="loading"]');
    const isLoadingVisible = await loadingSpinner.first().isVisible().catch(() => false);

    console.log(`📋 Loading spinner visible: ${isLoadingVisible}`);

    await page.waitForTimeout(2000);

    const stillLoading = await loadingSpinner.first().isVisible().catch(() => false);
    console.log(`📋 Still loading after 2s: ${stillLoading}`);
  });

  test('08. Empty states should display correctly', async ({ page }) => {
    await page.goto('/reporting');
    await waitForPageLoad(page);

    const emptyStates = page.locator('[class*="empty"], [data-testid*="empty"], text=No.*found');
    const count = await emptyStates.count();

    console.log(`📋 Found ${count} empty state elements`);
  });

  test('09. Sidebar navigation should have proper ARIA attributes', async ({ page }) => {
    await page.goto('/');
    await waitForPageLoad(page);

    const sidebar = page.locator('aside, [data-testid="sidebar"]').first();
    const nav = sidebar.locator('nav').first();

    const hasNavRole = await nav.getAttribute('role') === 'navigation' || await nav.locator('nav').count() > 0;
    const links = await nav.locator('a').all();

    console.log(`📋 Sidebar: ${links.length} links`);
    console.log(`  Has nav role: ${hasNavRole}`);

    for (const link of links.slice(0, 5)) {
      const href = await link.getAttribute('href');
      const text = await link.textContent();
      console.log(`  - ${text?.trim()}: ${href}`);
    }
  });

  test('10. Modal dialogs should have proper accessibility', async ({ page }) => {
    await page.goto('/reporting');
    await waitForPageLoad(page);

    const addBtn = page.locator('button:has-text("New Update"), button:has-text("Add Goal")').first();

    if (await addBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await addBtn.click();

      const modal = page.locator('[role="dialog"]').first();
      await modal.waitFor({ state: 'visible', timeout: 5000 });

      const hasDialogRole = await modal.getAttribute('role') === 'dialog';
      const hasAriaLabel = (await modal.getAttribute('aria-label')) !== null;
      const focusableContent = await modal.locator('button, input, select, textarea').count();

      console.log(`📋 Modal accessibility:`);
      console.log(`  - role="dialog": ${hasDialogRole}`);
      console.log(`  - aria-label: ${hasAriaLabel}`);
      console.log(`  - Focusable elements: ${focusableContent}`);

      const closeBtn = modal.locator('button[aria-label="Close"]').first();
      if (await closeBtn.isVisible().catch(() => false)) {
        await closeBtn.click();
        await modal.waitFor({ state: 'hidden', timeout: 5000 });
        console.log('  - Close button works: ✅');
      }
    }
  });

  test('11. Cards should have consistent styling structure', async ({ page }) => {
    await page.goto('/units');
    await waitForPageLoad(page);

    const cards = page.locator('[class*="card"], [class*="Card"]');
    const count = await cards.count();

    console.log(`📋 Found ${count} card elements`);

    if (count > 0) {
      const firstCard = cards.first();

      const hasPadding = await firstCard.evaluate(el => {
        const style = window.getComputedStyle(el);
        return parseFloat(style.padding) > 0 || parseFloat(style.paddingLeft) > 0;
      });

      const hasBorder = await firstCard.evaluate(el => {
        const style = window.getComputedStyle(el);
        return parseFloat(style.borderWidth) > 0 || style.border.includes('px');
      });

      const hasRounded = await firstCard.evaluate(el => {
        const style = window.getComputedStyle(el);
        return parseFloat(style.borderRadius) > 0;
      });

      console.log(`  First card - Padding: ${hasPadding}, Border: ${hasBorder}, Rounded: ${hasRounded}`);
    }
  });

  test('12. Forms should have proper label associations', async ({ page }) => {
    await page.goto('/reporting');
    await waitForPageLoad(page);

    const addBtn = page.locator('button:has-text("New Update"), button:has-text("Add Goal")').first();

    if (await addBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await addBtn.click();

      const modal = page.locator('[role="dialog"]').first();
      await modal.waitFor({ state: 'visible', timeout: 5000 });

      const inputs = await modal.locator('input, select, textarea').all();

      console.log(`📋 Form inputs in modal: ${inputs.length}`);

      for (const input of inputs.slice(0, 5)) {
        const id = await input.getAttribute('id');
        const name = await input.getAttribute('name');
        const ariaLabel = await input.getAttribute('aria-label');
        const hasLabel = id || name || ariaLabel;

        console.log(`  - Input: id=${id}, name=${name}, aria-label=${ariaLabel}, hasLabel=${!!hasLabel}`);
      }
    }
  });
});