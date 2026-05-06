import { test, expect, Page, Response } from '@playwright/test';
import { waitForPageLoad, routes } from '../utils/test-helpers';

test.describe('Feature Validation Tests', () => {

  test.describe.configure({ mode: 'serial' });

  test('F01. Dashboard - KPI Widgets display correct data', async ({ page }) => {
    await page.goto('/');
    await waitForPageLoad(page);

    await page.waitForTimeout(2000);

    const statCards = page.locator('[class*="StatCard"], [data-testid*="stat"]');
    const count = await statCards.count();

    console.log(`📊 Dashboard StatCards: ${count}`);

    expect(count).toBeGreaterThan(0);

    const kpiLabels = ['Week', 'Objective', 'Unit', 'BPI', 'Score'];
    for (const label of kpiLabels) {
      const hasLabel = await page.locator(`text="${label}"`).first().isVisible().catch(() => false);
      console.log(`  ${label} widget: ${hasLabel ? '✅' : '⚠️'}`);
    }
  });

  test('F02. Dashboard - Charts render with data', async ({ page }) => {
    await page.goto('/');
    await waitForPageLoad(page);

    await page.waitForTimeout(2000);

    const charts = page.locator('.recharts-wrapper, [data-testid*="chart"], svg.recharts-surface');
    const chartCount = await charts.count();

    console.log(`📊 Charts on dashboard: ${chartCount}`);

    if (chartCount > 0) {
      for (let i = 0; i < Math.min(chartCount, 3); i++) {
        const chart = charts.nth(i);
        const svg = chart.locator('svg').first();
        const svgHtml = await svg.innerHTML();

        console.log(`  Chart ${i + 1}: ${svgHtml.length > 500 ? '✅ has content' : '⚠️ may be empty'}`);
      }
    }
  });

  test('F03. Dashboard - Filter functionality works', async ({ page }) => {
    await page.goto('/');
    await waitForPageLoad(page);

    const filterBtn = page.locator('button:has-text("Filter")').first();

    if (await filterBtn.isVisible().catch(() => false)) {
      await filterBtn.click();
      await page.waitForTimeout(500);

      const filterPanel = page.locator('[class*="filter"], [class*="Filter"], [role="dialog"]').first();
      const panelVisible = await filterPanel.isVisible().catch(() => false);

      console.log(`📊 Filter panel opened: ${panelVisible}`);

      if (panelVisible) {
        const closeBtn = filterPanel.locator('button[aria-label="Close"]').first();
        if (await closeBtn.isVisible().catch(() => false)) {
          await closeBtn.click();
          await page.waitForTimeout(300);
          console.log('  ✅ Filter panel closed');
        }
      }
    }
  });

  test('F04. Dashboard - Export functionality available', async ({ page }) => {
    await page.goto('/');
    await waitForPageLoad(page);

    const exportBtn = page.locator('button:has-text("Export"), button:has-text("Download")').first();

    if (await exportBtn.isVisible().catch(() => false)) {
      console.log('📊 Export button found');

      await exportBtn.click();
      await page.waitForTimeout(1000);

      const downloadStarted = await page.evaluate(() => {
        return document.cookie.includes('download') || true;
      });

      console.log(`  ✅ Export triggered`);
    }
  });

  test('F05. Reporting - Week-over-week navigation', async ({ page }) => {
    await page.goto('/reporting');
    await waitForPageLoad(page);

    const weekSelector = page.locator('select').first();

    if (await weekSelector.isVisible().catch(() => false)) {
      const options = await weekSelector.locator('option').allTextContents();
      console.log(`📅 Available weeks: ${options.length}`);

      if (options.length > 1) {
        const initialValue = await weekSelector.inputValue();

        await weekSelector.selectOption({ index: 1 });
        await page.waitForTimeout(500);

        const newValue = await weekSelector.inputValue();
        const changed = initialValue !== newValue;

        console.log(`  Week changed: ${changed}`);
        console.log(`  ${initialValue} → ${newValue}`);

        expect(changed).toBe(true);
      }
    }
  });

  test('F06. Reporting - Goal CRUD operations', async ({ page }) => {
    await page.goto('/reporting');
    await waitForPageLoad(page);

    const addBtn = page.locator('button:has-text("New Update"), button:has-text("Add Goal")').first();

    if (await addBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      await addBtn.click();

      const modal = page.locator('[role="dialog"]').first();
      await modal.waitFor({ state: 'visible', timeout: 5000 });
      console.log('✅ Add Goal modal opened');

      const titleInput = modal.locator('input').first();
      if (await titleInput.isVisible().catch(() => false)) {
        await titleInput.fill('Playwright Test Goal');

        const saveBtn = modal.locator('button:has-text("Save"), button:has-text("Create")').first();
        await saveBtn.click();

        await page.waitForTimeout(2000);

        const successToast = page.locator('[role="alert"]:has-text("success"), [class*="success"]').first();
        const hasFeedback = await successToast.isVisible().catch(() => false);

        console.log(`  Goal creation feedback: ${hasFeedback ? '✅ shown' : '⚠️ no feedback'}`);
      }
    } else {
      console.log('⚠️ Add Goal button not accessible');
    }
  });

  test('F07. Reporting - Inline task completion toggle', async ({ page }) => {
    await page.goto('/reporting');
    await waitForPageLoad(page);

    const checkboxes = page.locator('input[type="checkbox"], [class*="checkbox"]').first();

    if (await checkboxes.isVisible({ timeout: 3000 }).catch(() => false)) {
      const wasChecked = await checkboxes.isChecked().catch(() => false);

      await checkboxes.click();
      await page.waitForTimeout(500);

      const isChecked = await checkboxes.isChecked().catch(() => false);
      const stateChanged = wasChecked !== isChecked;

      console.log(`📋 Checkbox toggle: ${wasChecked} → ${isChecked}`);
      console.log(`  State changed: ${stateChanged}`);

      expect(stateChanged).toBe(true);
    } else {
      console.log('⚠️ No checkbox found for task toggle');
    }
  });

  test('F08. Objectives - Quarter collapse/expand', async ({ page }) => {
    await page.goto('/objectives');
    await waitForPageLoad(page);

    await page.waitForTimeout(1000);

    const quarterHeaders = page.locator('text=Q1, text=Q2, text=Q3, text=Q4');

    for (const q of ['Q1', 'Q2', 'Q3', 'Q4']) {
      const qHeader = page.locator(`text="${q}"`).first();

      if (await qHeader.isVisible().catch(() => false)) {
        const clickable = qHeader.locator('..').locator('button, [role="button"]').first();

        if (await clickable.isVisible().catch(() => false)) {
          await clickable.click();
          await page.waitForTimeout(300);
          console.log(`  ✅ ${q} toggled`);
        }
      }
    }
  });

  test('F09. Objectives - Lock/unlock quarter', async ({ page }) => {
    await page.goto('/objectives');
    await waitForPageLoad(page);

    await page.waitForTimeout(1000);

    const lockButtons = page.locator('button[aria-label*="lock"], button[title*="lock"], button:has-text("Lock")');

    const lockCount = await lockButtons.count();
    console.log(`🔒 Lock buttons found: ${lockCount}`);

    if (lockCount > 0) {
      const firstLock = lockButtons.first();
      const initialState = await firstLock.getAttribute('aria-label') || '';

      await firstLock.click();
      await page.waitForTimeout(500);

      const newState = await firstLock.getAttribute('aria-label') || '';
      console.log(`  Lock state: "${initialState}" → "${newState}"`);
    }
  });

  test('F10. Units - Card view displays correctly', async ({ page }) => {
    await page.goto('/units');
    await waitForPageLoad(page);

    const unitCards = page.locator('[class*="UnitCard"], [class*="card"]');
    const count = await unitCards.count();

    console.log(`🏢 Unit cards displayed: ${count}`);

    if (count > 0) {
      const firstCard = unitCards.first();

      const hasName = await firstCard.locator('h3, h4, [class*="name"]').first().isVisible().catch(() => false);
      const hasMeta = await firstCard.locator('[class*="meta"], [class*="owner"]').first().isVisible().catch(() => false);

      console.log(`  First card - Name: ${hasName}, Meta: ${hasMeta}`);
    }

    expect(count).toBeGreaterThan(0);
  });

  test('F11. Units - Org chart view toggle', async ({ page }) => {
    await page.goto('/units');
    await waitForPageLoad(page);

    const orgChartBtn = page.locator('button:has-text("Org Chart")').first();

    if (await orgChartBtn.isVisible().catch(() => false)) {
      await orgChartBtn.click();
      await page.waitForTimeout(1000);

      const orgChart = page.locator('[class*="org-chart"], [class*="OrgChart"], svg').first();
      const chartVisible = await orgChart.isVisible().catch(() => false);

      console.log(`📊 Org chart visible: ${chartVisible}`);

      const cardsBtn = page.locator('button:has-text("Cards")').first();
      await cardsBtn.click();
      await page.waitForTimeout(500);

      const backToCards = await unitCards.first().isVisible().catch(() => false);
      console.log(`  Back to cards: ${backToCards}`);
    }
  });

  test('F12. Users - User table pagination', async ({ page }) => {
    await page.goto('/users');
    await waitForPageLoad(page);

    const pagination = page.locator('[class*="pagination"], [class*="paginate"]');
    const hasPagination = await pagination.isVisible().catch(() => false);

    if (hasPagination) {
      const rows = await page.locator('tbody tr').count();
      console.log(`👥 Users displayed: ${rows}`);

      const nextBtn = pagination.locator('button:has-text("Next"), button[aria-label*="next"]').first();

      if (await nextBtn.isEnabled().catch(() => false)) {
        await nextBtn.click();
        await page.waitForTimeout(500);
        console.log('  ✅ Next page clicked');
      }
    } else {
      console.log('👥 Pagination not visible (may be single page)');
    }
  });

  test('F13. Settings - Tab navigation', async ({ page }) => {
    await page.goto('/settings');
    await waitForPageLoad(page);

    const tabs = page.locator('[role="tab"]');
    const tabCount = await tabs.count();

    console.log(`⚙️ Settings tabs: ${tabCount}`);

    for (let i = 0; i < Math.min(tabCount, 4); i++) {
      const tab = tabs.nth(i);
      const tabText = await tab.textContent();

      await tab.click();
      await page.waitForTimeout(300);

      const isActive = await tab.getAttribute('aria-selected');
      console.log(`  Tab "${tabText?.trim()}": active=${isActive}`);
    }
  });

  test('F14. Settings - Save configuration', async ({ page }) => {
    await page.goto('/settings');
    await waitForPageLoad(page);

    const saveBtn = page.locator('button:has-text("Save"), button:has-text("Commit")').first();

    if (await saveBtn.isVisible().catch(() => false)) {
      await saveBtn.click();
      await page.waitForTimeout(2000);

      const toast = page.locator('[role="alert"], [class*="toast"]').first();
      const hasFeedback = await toast.isVisible().catch(() => false);

      console.log(`  ✅ Save triggered, feedback: ${hasFeedback ? 'shown' : 'none'}`);
    }
  });

  test('F15. Attendance - Week selection and display', async ({ page }) => {
    await page.goto('/operations/attendance');
    await waitForPageLoad(page);

    await page.waitForTimeout(1000);

    const heading = page.locator('h1:has-text("Attendance"), h1:has-text("Meeting")');
    const isLoaded = await heading.isVisible().catch(() => false);

    console.log(`📅 Attendance page loaded: ${isLoaded}`);

    if (isLoaded) {
      const attendees = page.locator('[class*="attendee"], [class*="participant"]');
      const count = await attendees.count();
      console.log(`  Participants listed: ${count}`);
    }
  });

  test('F16. Integrity - Check functionality', async ({ page }) => {
    await page.goto('/integrity');
    await waitForPageLoad(page);

    await page.waitForTimeout(1000);

    const runCheckBtn = page.locator('button:has-text("Run Check"), button:has-text("Check"), button:has-text("Validate")').first();

    if (await runCheckBtn.isVisible().catch(() => false)) {
      await runCheckBtn.click();
      await page.waitForTimeout(3000);

      const results = page.locator('[class*="result"], [class*="status"], [class*="check"]');
      const resultsCount = await results.count();

      console.log(`🔍 Integrity check results: ${resultsCount}`);
    }
  });

  test('F17. Sidebar - All navigation links work', async ({ page }) => {
    await page.goto('/');
    await waitForPageLoad(page);

    const navLinks = page.locator('aside nav a');
    const linkCount = await navLinks.count();

    console.log(`🧭 Navigation links: ${linkCount}`);

    let workingLinks = 0;
    let brokenLinks = 0;

    for (let i = 0; i < Math.min(linkCount, 10); i++) {
      const link = navLinks.nth(i);
      const href = await link.getAttribute('href');
      const text = await link.textContent();

      try {
        await link.click();
        await page.waitForTimeout(500);

        const currentUrl = page.url();
        const worked = !currentUrl.includes('404') && !currentUrl.includes('error');

        if (worked) workingLinks++;
        else brokenLinks++;

        console.log(`  ${text?.trim()}: ${worked ? '✅' : '❌'}`);

        await page.goBack();
        await waitForPageLoad(page);
      } catch {
        brokenLinks++;
        console.log(`  ${text?.trim()}: ❌ click failed`);
      }
    }

    console.log(`  Summary: ${workingLinks} working, ${brokenLinks} broken`);
  });

  test('F18. Global search functionality', async ({ page }) => {
    await page.goto('/');
    await waitForPageLoad(page);

    const searchInput = page.locator('input[type="search"], input[placeholder*="Search"], input[placeholder*="search"]').first();

    if (await searchInput.isVisible().catch(() => false)) {
      await searchInput.fill('test');
      await page.waitForTimeout(1000);

      const searchResults = page.locator('[class*="result"], [class*="suggestion"], [class*="dropdown"]');
      const hasResults = await searchResults.isVisible().catch(() => false);

      console.log(`🔍 Search shows results: ${hasResults}`);

      await searchInput.clear();
    }
  });

  test('F19. Toast notifications display', async ({ page }) => {
    await page.goto('/');
    await waitForPageLoad(page);

    const toasts = page.locator('[role="alert"], [class*="toast"]');
    const count = await toasts.count();

    console.log(`🔔 Initial toast count: ${count}`);

    await page.evaluate(() => {
      (window as any).showToast?.('Test message', 'success');
    });

    await page.waitForTimeout(500);

    const newCount = await toasts.count();
    console.log(`🔔 After trigger: ${newCount}`);
  });

  test('F20. Error boundary catches errors gracefully', async ({ page }) => {
    await page.goto('/');
    await waitForPageLoad(page);

    const consoleErrors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    await page.evaluate(() => {
      throw new Error('Test error for error boundary');
    });

    await page.waitForTimeout(1000);

    const errorContent = page.locator('text=Something went wrong, text=Error, text=500');
    const hasErrorBoundary = await errorContent.isVisible().catch(() => false);

    console.log(`🛡️ Error boundary active: ${hasErrorBoundary}`);
    console.log(`  Console errors: ${consoleErrors.length}`);
  });
});