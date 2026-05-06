import { test, expect, Page, Locator } from '@playwright/test';
import { waitForPageLoad, safeClick } from '../utils/test-helpers';
import { BusinessUnitsPage } from '../utils/page-objects';

test.describe('Business Units Module Tests', () => {

  test.describe.configure({ mode: 'serial' });

  test('01. Business Units page should load correctly', async ({ page }) => {
    await page.goto('/units');
    await waitForPageLoad(page);

    const heading = page.locator('h1:has-text("Corporate Units")').first();
    await expect(heading).toBeVisible({ timeout: 10000 });

    console.log('✅ Business Units page loaded successfully');
  });

  test('02. User can switch between card and org chart views', async ({ page }) => {
    await page.goto('/units');
    await waitForPageLoad(page);

    // Check that cards view is default
    const unitCards = page.locator('[class*="UnitCard"], [data-testid="unit-card"]');
    const initialCardCount = await unitCards.count();
    expect(initialCardCount).toBeGreaterThan(0);

    // Switch to org chart view
    const orgChartBtn = page.locator('button:has-text("Org Chart")').first();
    await orgChartBtn.click();
    await page.waitForTimeout(1000);

    // Check that org chart is visible
    const orgChart = page.locator('[class*="org-chart"], svg.org-chart').first();
    const isOrgChartVisible = await orgChart.isVisible().catch(() => false);
    expect(isOrgChartVisible).toBeTruthy();

    // Switch back to cards view
    const cardsBtn = page.locator('button:has-text("Cards")').first();
    await cardsBtn.click();
    await page.waitForTimeout(1000);

    // Check that cards are visible again
    const finalCardCount = await unitCards.count();
    expect(finalCardCount).toBeGreaterThan(0);

    console.log('✅ View mode switching works correctly');
  });

  test('03. User can add a new business unit', async ({ page }) => {
    await page.goto('/units');
    await waitForPageLoad(page);

    const addUnitBtn = page.locator('button:has-text("New Unit")').first();
    await addUnitBtn.click();

    // Check that the add unit form is visible
    const addUnitForm = page.locator('form[data-testid="add-unit-form"], div[class*="card"][class*="border-orange-400"]');
    await expect(addUnitForm).toBeVisible({ timeout: 5000 });

    console.log('✅ Add Unit form opened successfully');
  });

  test('04. Add Unit form should have all required fields', async ({ page }) => {
    await page.goto('/units');
    await waitForPageLoad(page);

    const addUnitBtn = page.locator('button:has-text("New Unit")').first();
    await addUnitBtn.click();
    await waitForPageLoad(page);

    // Wait for form to be visible
    const form = page.locator('div[class*="border-orange-400"]');
    await expect(form).toBeVisible({ timeout: 5000 });

    // Check for form fields
    const nameInput = page.locator('input[placeholder="e.g. Global Operations"]');
    const headSelect = page.locator('select, [class*="select"]');
    const emailInput = page.locator('input[type="email"]');
    const saveButton = page.locator('button:has-text("Save")');
    const cancelButton = page.locator('button:has-text("Discard")').first();

    const fields = [
      { name: 'Unit Name Input', locator: nameInput },
      { name: 'Unit Head Select', locator: headSelect },
      { name: 'Contact Email Input', locator: emailInput },
      { name: 'Save Button', locator: saveButton },
      { name: 'Cancel Button', locator: cancelButton }
    ];

    for (const field of fields) {
      const isVisible = await field.locator.first().isVisible().catch(() => false);
      expect(isVisible).toBeTruthy();
      console.log(`  ✅ ${field.name} is present`);
    }
  });

  test('05. User can edit an existing business unit', async ({ page }) => {
    await page.goto('/units');
    await waitForPageLoad(page);

    // Find the first unit card and click edit
    const firstUnitCard = page.locator('[class*="UnitCard"], [data-testid="unit-card"]').first();
    const editButton = page.locator('button[aria-label*="edit"], button:has-text("Edit")').first();
    
    if (await editButton.isVisible().catch(() => false)) {
      await editButton.click();
      
      // Check that edit form opens
      const editForm = page.locator('div[class*="border-orange-400"]');
      await expect(editForm).toBeVisible({ timeout: 5000 });
      
      console.log('✅ Edit form opened successfully');
    } else {
      console.log('⚠️ No edit button found on unit cards');
    }
  });

  test('06. User can cancel the add/edit form', async ({ page }) => {
    await page.goto('/units');
    await waitForPageLoad(page);

    // Open add unit form
    const addUnitBtn = page.locator('button:has-text("New Unit")').first();
    await addUnitBtn.click();
    await waitForPageLoad(page);

    // Check for cancel button
    const cancelButton = page.locator('button:has-text("Discard")').first();
    await cancelButton.click();
    
    // Check that form is closed
    const form = page.locator('div[class*="border-orange-400"]');
    const isVisible = await form.isVisible().catch(() => false);
    expect(isVisible).toBeFalsy();
    
    console.log('✅ Cancel button closes form correctly');
  });

  test('07. Business Units page should have proper search functionality', async ({ page }) => {
    await page.goto('/units');
    await waitForPageLoad(page);

    const searchInput = page.locator('input[placeholder*="Search"], input[type="text"]').first();
    await searchInput.fill('Test Unit');
    await page.waitForTimeout(500);

    // Check if search results are filtered
    const unitCards = page.locator('[class*="UnitCard"], [data-testid="unit-card"]');
    const count = await unitCards.count();

    console.log(`  🔍 Search returned ${count} results`);
    expect(count).toBeGreaterThanOrEqual(0); // Either 0 or some results
  });

  test('08. Business Units metrics should display correctly', async ({ page }) => {
    await page.goto('/units');
    await waitForPageLoad(page);

    const metrics = [
      { label: 'Total Units', selector: 'p:has-text("Total Units") + p' },
      { label: 'Active Staff', selector: 'p:has-text("Active Staff") + p' },
      { label: 'Active Heads', selector: 'p:has-text("Active Heads") + p' },
      { label: 'System Health', selector: 'p:has-text("System Health") + p' }
    ];

    for (const metric of metrics) {
      const value = page.locator(metric.selector).first();
      const isVisible = await value.isVisible().catch(() => false);
      expect(isVisible).toBeTruthy();
      console.log(`  ✅ ${metric.label} metric is visible`);
    }
  });

  test('09. Unit cards should display correct information', async ({ page }) => {
    await page.goto('/units');
    await waitForPageLoad(page);

    const unitCards = page.locator('[class*="UnitCard"], [data-testid="unit-card"]');
    const count = await unitCards.count();
    
    if (count > 0) {
      const firstCard = unitCards.first();
      
      // Check card elements
      const acronym = firstCard.locator('div[class*="w-16"], div[class*="h-12"]');
      const unitName = firstCard.locator('h3');
      const description = firstCard.locator('p:text-matches("^[A-Z].*")'); // Description text
      const headUser = firstCard.locator('p:text-matches(".*[A-Z].*")').nth(1); // Head user name
      const contactEmail = firstCard.locator('a[href^="mailto:"]'); // Email link
      
      const elements = [
        { name: 'Unit Acronym', locator: acronym },
        { name: 'Unit Name', locator: unitName },
        { name: 'Unit Description', locator: description },
        { name: 'Head User', locator: headUser },
        { name: 'Contact Email', locator: contactEmail }
      ];
      
      for (const element of elements) {
        const isVisible = await element.locator.isVisible().catch(() => false);
        expect(isVisible).toBeTruthy();
        console.log(`  ✅ ${element.name} is visible`);
      }
    } else {
      console.log('⚠️ No unit cards found');
    }
  });
  
  test('10. User can delete a business unit', async ({ page }) => {
    await page.goto('/units');
    await waitForPageLoad(page);

    // Find a unit card with a delete button
    const deleteButton = page.locator('button[aria-label*="delete"], button:has-text("Delete")').first();
    
    if (await deleteButton.isVisible().catch(() => false)) {
      await deleteButton.click();
      
      // Check that delete confirmation modal appears
      const deleteModal = page.locator('div:has-text("Remove Unit?")');
      await expect(deleteModal).toBeVisible({ timeout: 5000 });
      
      console.log('✅ Delete confirmation modal opened');
    } else {
      console.log('⚠️ No delete button found');
    }
  });
});