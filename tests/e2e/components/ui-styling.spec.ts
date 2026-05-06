import { test, expect, Page } from '@playwright/test';

interface StyleValidation {
  element: string;
  backgroundColor: string;
  color: string;
  isValid: boolean;
}

async function validateUIIntegrity(page: Page): Promise<StyleValidation[]> {
  const results: StyleValidation[] = [];
  
  const selectors = [
    'button',
    'nav',
    'aside',
    '[class*="card"]',
    '[class*="Card"]',
    '[class*="header"]',
    '[class*="Header"]',
    'input',
    'select',
    'textarea',
  ];

  for (const selector of selectors) {
    const elements = await page.locator(selector).all();
    
    for (const el of elements.slice(0, 3)) {
      const isVisible = await el.isVisible().catch(() => false);
      if (!isVisible) continue;

      try {
        const bgColor = await el.evaluate((e) => 
          window.getComputedStyle(e).backgroundColor
        );
        const color = await el.evaluate((e) => 
          window.getComputedStyle(e).color
        );

        results.push({
          element: selector,
          backgroundColor: bgColor,
          color: color,
          isValid: bgColor !== 'rgb(0, 0, 0)' || color !== 'rgb(0, 0, 0)',
        });
      } catch {
        // Skip errors
      }
    }
  }

  return results;
}

test.describe('UI Integrity & Visual Regression', () => {

  test('01. UI should NOT render in grayscale/black state', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const results = await validateUIIntegrity(page);
    
    console.log('\n🖌️ UI Style Validation:');
    let hasIssue = false;
    for (const r of results.slice(0, 10)) {
      console.log(`  ${r.element}: bg=${r.backgroundColor}, text=${r.color}`);
      if (r.backgroundColor === 'rgb(0, 0, 0)' && r.color === 'rgb(0, 0, 0)') {
        hasIssue = true;
      }
    }

    if (hasIssue) {
      console.log('  ⚠️ WARNING: UI appears to be in monochrome/unstyled state!');
    } else {
      console.log('  ✅ UI styling appears correct');
    }

    expect(hasIssue).toBe(false);
  });

  test('02. Primary buttons should have brand colors', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const buttons = page.locator('button');
    const count = await buttons.count();

    console.log(`\n🔘 Found ${count} buttons on page`);

    let hasColoredButton = false;
    for (let i = 0; i < Math.min(count, 5); i++) {
      const btn = buttons.nth(i);
      const isVisible = await btn.isVisible().catch(() => false);
      if (!isVisible) continue;

      const bgColor = await btn.evaluate((e) => 
        window.getComputedStyle(e).backgroundColor
      );
      const text = await btn.textContent();
      
      console.log(`  Button "${text?.trim().slice(0, 20)}": ${bgColor}`);

      if (bgColor && bgColor !== 'rgba(0, 0, 0, 0)' && bgColor !== 'rgb(0, 0, 0)') {
        hasColoredButton = true;
      }
    }

    expect(hasColoredButton).toBe(true);
  });

  test('03. Sidebar should have proper background color', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const sidebar = page.locator('aside, [class*="sidebar"]').first();
    const isVisible = await sidebar.isVisible().catch(() => false);

    if (isVisible) {
      const bgColor = await sidebar.evaluate((e) => 
        window.getComputedStyle(e).backgroundColor
      );
      console.log(`\n📐 Sidebar background: ${bgColor}`);
      
      expect(bgColor).not.toBe('rgb(0, 0, 0)');
    }
  });

  test('04. Cards should have visual styling', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const cards = page.locator('[class*="card"], [class*="Card"]');
    const count = await cards.count();

    console.log(`\n📋 Found ${count} cards`);

    if (count > 0) {
      const firstCard = cards.first();
      const bgColor = await firstCard.evaluate((e) => 
        window.getComputedStyle(e).backgroundColor
      );
      const padding = await firstCard.evaluate((e) => 
        window.getComputedStyle(e).padding
      );
      
      console.log(`  First card: bg=${bgColor}, padding=${padding}`);
      expect(bgColor).not.toBe('rgb(0, 0, 0)');
    }
  });

  test('05. Forms should have visible inputs with styles', async ({ page }) => {
    await page.goto('/reporting');
    await page.waitForLoadState('networkidle');

    const inputs = page.locator('input, select, textarea');
    const count = await inputs.count();

    console.log(`\n📝 Found ${count} form inputs`);

    if (count > 0) {
      const firstInput = inputs.first();
      const isVisible = await firstInput.isVisible().catch(() => false);
      
      if (isVisible) {
        const bgColor = await firstInput.evaluate((e) => 
          window.getComputedStyle(e).backgroundColor
        );
        const borderColor = await firstInput.evaluate((e) => 
          window.getComputedStyle(e).borderColor
        );
        
        console.log(`  Input: bg=${bgColor}, border=${borderColor}`);
        expect(bgColor).not.toBe('rgb(0, 0, 0)');
      }
    }
  });

  test('06. Visual snapshot - dashboard loads correctly', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    await page.screenshot({ 
      path: 'playwright-report/snapshots/dashboard.png',
      fullPage: true 
    });

    console.log('\n📸 Dashboard screenshot saved');
    
    const html = await page.content();
    expect(html.length).toBeGreaterThan(1000);
  });

  test('07. No broken CSS imports', async ({ page }) => {
    const issues: string[] = [];
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const styles = await page.locator('style, link[rel="stylesheet"]').all();
    
    for (const style of styles) {
      const href = await style.getAttribute('href').catch(() => null);
      const hasContent = await style.textContent().catch(() => '');
      
      if (href && href.includes('.css') && !hasContent) {
        issues.push(`CSS file may not loaded: ${href}`);
      }
    }

    console.log(`\n🎨 CSS validation: ${issues.length === 0 ? '✅ No issues' : issues.join(', ')}`);
    expect(issues.length).toBe(0);
  });
});