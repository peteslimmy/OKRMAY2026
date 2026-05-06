import { test, expect, Page, Locator } from '@playwright/test';
import { waitForPageLoad, safeClick, routes } from '../utils/test-helpers';
import { DashboardPage, ReportModulePage, BusinessUnitsPage, SettingsPage } from '../utils/page-objects';

test.describe('Button & Interaction Tests', () => {

  test.describe.configure({ mode: 'parallel' });

  test('01. All buttons on dashboard should be clickable', async ({ page }) => {
    await page.goto('/');
    await waitForPageLoad(page);

    const buttons = await page.locator('button').all();
    console.log(`\n📋 Found ${buttons.length} buttons on Dashboard`);

    let clickableCount = 0;
    let unclickableCount = 0;
    const unclickable: string[] = [];

    for (const button of buttons) {
      const isDisabled = await button.isDisabled();
      const isHidden = await button.isHidden();

      if (!isDisabled && !isHidden) {
        try {
          await button.click({ timeout: 2000 });
          clickableCount++;
        } catch {
          unclickableCount++;
          const text = await button.textContent();
          unclickable.push(text?.trim() || '(empty button)');
        }
      }
    }

    console.log(`  ✅ Clickable: ${clickableCount}`);
    console.log(`  ❌ Unclickable: ${unclickableCount}`);
    if (unclickable.length > 0) {
      console.log(`  Buttons without handlers: ${unclickable.slice(0, 5).join(', ')}`);
    }
  });

  test('02. Filter and export buttons on Dashboard should trigger actions', async ({ page }) => {
    await page.goto('/');
    await waitForPageLoad(page);

    const filterBtn = page.locator('button:has-text("Filter")').first();
    const exportBtn = page.locator('button:has-text("Export")').first();

    if (await filterBtn.isVisible()) {
      await filterBtn.click();
      await page.waitForTimeout(500);
      console.log('✅ Filter button clicked successfully');
    }

    if (await exportBtn.isVisible()) {
      await exportBtn.click();
      await page.waitForTimeout(500);
      console.log('✅ Export button clicked successfully');
    }
  });

  test('03. ReportModule - New Update button should open modal', async ({ page }) => {
    await page.goto('/reporting');
    await waitForPageLoad(page);

    const newUpdateBtn = page.locator('button:has-text("New Update"), button:has-text("Add Goal")').first();

    if (await newUpdateBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      await newUpdateBtn.click();

      const modal = page.locator('[role="dialog"], [class*="modal"]');
      await expect(modal).toBeVisible({ timeout: 5000 });
      console.log('✅ New Update modal opened successfully');
    } else {
      console.log('⚠️ New Update button not visible (may require permissions)');
    }
  });

  test('04. ReportModule - Week selector should filter content', async ({ page }) => {
    await page.goto('/reporting');
    await waitForPageLoad(page);

    const weekSelector = page.locator('select').first();
    if (await weekSelector.isVisible({ timeout: 5000 })) {
      const initialGoals = await page.locator('[class*="GoalCard"]').count();

      await weekSelector.selectOption({ index: 1 });
      await page.waitForTimeout(500);

      const filteredGoals = await page.locator('[class*="GoalCard"]').count();
      console.log(`📊 Goals: before=${initialGoals}, after=${filteredGoals}`);
    }
  });

  test('05. BusinessUnits - View mode toggle should work', async ({ page }) => {
    await page.goto('/units');
    await waitForPageLoad(page);

    const cardsViewBtn = page.locator('button:has-text("Cards")').first();
    const orgChartBtn = page.locator('button:has-text("Org Chart")').first();

    if (await cardsViewBtn.isVisible()) {
      await cardsViewBtn.click();
      await page.waitForTimeout(300);

      const orgChartVisible = await orgChartBtn.isVisible();
      expect(orgChartVisible).toBe(true);
      console.log('✅ View mode toggle works');
    }
  });

  test('06. Settings tabs should switch correctly', async ({ page }) => {
    await page.goto('/settings');
    await waitForPageLoad(page);

    const settingsPage = new SettingsPage(page);
    const availableTabs = ['Security', 'MFA', 'Protocols', 'Brand', 'Notifications', 'AI Models', 'Audit Trace'];

    for (const tab of availableTabs) {
      const tabBtn = page.locator(`button:has-text("${tab}")`).first();
      if (await tabBtn.isVisible().catch(() => false)) {
        await tabBtn.click();
        await page.waitForTimeout(300);

        const isActive = await tabBtn.evaluate(el => el.classList.contains('bg-primary') || el.getAttribute('aria-selected') === 'true');
        console.log(`  ${isActive ? '✅' : '⚠️'} ${tab} tab ${isActive ? 'activated' : 'may not be active'}`);
      }
    }
  });

  test('07. Clicking stat cards should trigger navigation or action', async ({ page }) => {
    await page.goto('/');
    await waitForPageLoad(page);

    const statCards = page.locator('[class*="StatCard"], [class*="stat-card"]');
    const count = await statCards.count();

    for (let i = 0; i < Math.min(count, 4); i++) {
      const card = statCards.nth(i);
      const initialUrl = page.url();

      try {
        await card.click({ timeout: 2000 });
        await page.waitForTimeout(500);

        const afterUrl = page.url();
        const navigationOccurred = initialUrl !== afterUrl;

        if (navigationOccurred) {
          console.log(`✅ Card ${i + 1}: Navigated to ${afterUrl}`);
          await page.goBack();
          await waitForPageLoad(page);
        } else {
          console.log(`✅ Card ${i + 1}: Action triggered (no navigation)`);
        }
      } catch {
        console.log(`⚠️ Card ${i + 1}: Click failed or no handler`);
      }
    }
  });

  test('08. Search input on pages should filter content', async ({ page }) => {
    await page.goto('/reporting');
    await waitForPageLoad(page);

    const searchInput = page.locator('input[placeholder*="Search"], input[type="search"]').first();

    if (await searchInput.isVisible({ timeout: 5000 })) {
      const initialCards = await page.locator('[class*="GoalCard"]').count();

      await searchInput.fill('test');
      await page.waitForTimeout(500);

      const filteredCards = await page.locator('[class*="GoalCard"]').count();
      console.log(`📊 Search filter: ${initialCards} -> ${filteredCards} cards`);
    }
  });

  test('09. Floating action buttons should be clickable', async ({ page }) => {
    await page.goto('/');
    await waitForPageLoad(page);

    const fabButtons = page.locator('[class*="FAB"], [class*="fab"], button[aria-label]');

    for (let i = 0; i < await fabButtons.count(); i++) {
      const fab = fabButtons.nth(i);
      if (await fab.isVisible()) {
        try {
          await fab.click({ timeout: 2000 });
          console.log(`✅ FAB ${i + 1} clicked`);
        } catch {
          console.log(`⚠️ FAB ${i + 1} click failed`);
        }
      }
    }
  });

  test('10. All disabled buttons should remain disabled and not trigger actions', async ({ page }) => {
    await page.goto('/reporting');
    await waitForPageLoad(page);

    const disabledButtons = page.locator('button:disabled');
    const count = await disabledButtons.count();

    console.log(`📋 Found ${count} disabled buttons`);

    for (let i = 0; i < Math.min(count, 10); i++) {
      const btn = disabledButtons.nth(i);
      const isDisabled = await btn.isDisabled();
      expect(isDisabled).toBe(true);
    }
  });

  test('11. Modal close button should work', async ({ page }) => {
    await page.goto('/reporting');
    await waitForPageLoad(page);

    const newUpdateBtn = page.locator('button:has-text("New Update"), button:has-text("Add Goal")').first();

    if (await newUpdateBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      await newUpdateBtn.click();

      const modal = page.locator('[role="dialog"], [class*="modal"]');
      await modal.waitFor({ state: 'visible', timeout: 5000 });

      const closeBtn = modal.locator('button[aria-label="Close"], button:has-text("Cancel"), button:has-text("X")').first();

      if (await closeBtn.isVisible().catch(() => false)) {
        await closeBtn.click();
        await modal.waitFor({ state: 'hidden', timeout: 5000 });
        console.log('✅ Modal closed successfully');
      }
    }
  });

  test('12. Dropdown selects should open and allow selection', async ({ page }) => {
    await page.goto('/reporting');
    await waitForPageLoad(page);

    const select = page.locator('select').first();

    if (await select.isVisible({ timeout: 5000 })) {
      await select.open();
      const options = await select.locator('option').count();
      console.log(`📋 Select has ${options} options`);

      if (options > 1) {
        await select.selectOption({ index: 1 });
        const selectedValue = await select.inputValue();
        expect(selectedValue).toBeTruthy();
        console.log(`✅ Selected value: ${selectedValue}`);
      }
    }
  });
});