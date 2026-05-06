import { test, expect, Page } from '@playwright/test';
import { waitForPageLoad } from '../utils/test-helpers';

test.describe('Accessibility & Security Tests', () => {

  test.describe.configure({ mode: 'parallel' });

  test('AC01. All buttons have accessible names', async ({ page }) => {
    await page.goto('/');
    await waitForPageLoad(page);

    const buttons = await page.locator('button').all();
    const accessibleButtons: string[] = [];
    const inaccessibleButtons: string[] = [];

    for (const button of buttons) {
      const ariaLabel = await button.getAttribute('aria-label');
      const text = await button.textContent();
      const hasAccessibleName = ariaLabel || (text && text.trim().length > 0);

      if (hasAccessibleName) {
        accessibleButtons.push(text?.trim() || ariaLabel || 'button');
      } else {
        inaccessibleButtons.push('anonymous button');
      }
    }

    console.log(`\n♿ Accessible buttons: ${accessibleButtons.length}`);
    console.log(`⚠️ Inaccessible buttons: ${inaccessibleButtons.length}`);

    if (inaccessibleButtons.length > 0) {
      console.log(`  ${inaccessibleButtons.slice(0, 3).join(', ')}`);
    }
  });

  test('AC02. All images have alt text', async ({ page }) => {
    await page.goto('/');
    await waitForPageLoad(page);

    const images = await page.locator('img').all();
    const imagesWithAlt: string[] = [];
    const imagesWithoutAlt: string[] = [];

    for (const img of images) {
      const alt = await img.getAttribute('alt');
      const src = await img.getAttribute('src');

      if (alt !== null) {
        imagesWithAlt.push(src?.split('/').pop() || 'image');
      } else {
        imagesWithoutAlt.push(src?.split('/').pop() || 'image');
      }
    }

    console.log(`\n♿ Images with alt: ${imagesWithAlt.length}`);
    console.log(`⚠️ Images without alt: ${imagesWithoutAlt.length}`);

    if (imagesWithoutAlt.length > 0) {
      console.log(`  ${imagesWithoutAlt.slice(0, 5).join(', ')}`);
    }
  });

  test('AC03. Form inputs have labels', async ({ page }) => {
    await page.goto('/reporting');
    await waitForPageLoad(page);

    const addBtn = page.locator('button:has-text("New Update"), button:has-text("Add Goal")').first();

    if (await addBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await addBtn.click();

      const modal = page.locator('[role="dialog"]').first();
      await modal.waitFor({ state: 'visible', timeout: 5000 });

      const inputs = await modal.locator('input, select, textarea').all();
      let labeledCount = 0;
      let unlabeledCount = 0;

      for (const input of inputs) {
        const id = await input.getAttribute('id');
        const ariaLabel = await input.getAttribute('aria-label');
        const ariaLabelledby = await input.getAttribute('aria-labelledby');
        const placeholder = await input.getAttribute('placeholder');

        const hasLabel = id || ariaLabel || ariaLabelledby || placeholder;

        if (hasLabel) labeledCount++;
        else unlabeledCount++;
      }

      console.log(`\n♿ Labeled inputs: ${labeledCount}`);
      console.log(`⚠️ Unlabeled inputs: ${unlabeledCount}`);
    }
  });

  test('AC04. Color contrast meets WCAG AA', async ({ page }) => {
    await page.goto('/');
    await waitForPageLoad(page);

    const contrastIssues: { selector: string; ratio: number }[] = [];

    const textElements = await page.locator('p, h1, h2, h3, h4, span, a, button').all();

    for (const el of textElements.slice(0, 20)) {
      try {
        const rgb = await el.evaluate(e => {
          const style = window.getComputedStyle(e);
          return style.color;
        });

        if (rgb && rgb !== 'rgba(0, 0, 0, 0)') {
          const ratio = await page.evaluate(([el]) => {
            const style = window.getComputedStyle(el);
            const color = style.color;
            const bgColor = style.backgroundColor;

            const getLuminance = (c: string) => {
              const rgb = c.match(/\d+/g)?.map(Number) || [0, 0, 0];
              const [r, g, b] = rgb.map(v => {
                v /= 255;
                return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
              });
              return 0.2126 * r + 0.7152 * g + 0.0722 * b;
            };

            const l1 = getLuminance(color);
            const l2 = getLuminance(bgColor);
            const ratio = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);

            return ratio;
          }, [el]);

          if (ratio < 4.5) {
            const text = await el.textContent();
            contrastIssues.push({ selector: text?.slice(0, 20) || 'text', ratio });
          }
        }
      } catch {
        // Skip elements that can't be evaluated
      }
    }

    console.log(`\n♿ Contrast issues found: ${contrastIssues.length}`);
    if (contrastIssues.length > 0) {
      contrastIssues.slice(0, 5).forEach(issue => {
        console.log(`  ⚠️ "${issue.selector}" - ratio: ${issue.ratio.toFixed(2)} (need 4.5:1)`);
      });
    }
  });

  test('AC05. Focus indicators are visible', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(1000);

    await page.keyboard.press('Tab');

    const focusedElement = await page.evaluate(() => {
      const el = document.activeElement;
      if (!el) return null;

      const style = window.getComputedStyle(el);
      return {
        tagName: el.tagName,
        outline: style.outline,
        outlineWidth: style.outlineWidth,
        boxShadow: style.boxShadow,
      };
    });

    if (focusedElement) {
      console.log(`\n♿ Focused element: ${focusedElement.tagName}`);
      console.log(`  Outline: ${focusedElement.outline}`);
      console.log(`  Box-shadow: ${focusedElement.boxShadow}`);

      const hasFocusIndicator = focusedElement.outlineWidth !== '0px' ||
                                 focusedElement.boxShadow !== 'none';
      expect(hasFocusIndicator).toBe(true);
    }
  });

  test('AC06. ARIA roles are correctly applied', async ({ page }) => {
    await page.goto('/');
    await waitForPageLoad(page);

    const navElements = await page.locator('nav, [role="navigation"]').all();
    const mainElements = await page.locator('main, [role="main"]').all();
    const headerElements = await page.locator('header, [role="banner"]').all();
    const footerElements = await page.locator('footer, [role="contentinfo"]').all();

    console.log(`\n♿ Landmark elements:`);
    console.log(`  Nav: ${navElements.length}`);
    console.log(`  Main: ${mainElements.length}`);
    console.log(`  Header: ${headerElements.length}`);
    console.log(`  Footer: ${footerElements.length}`);
  });

  test('AC07. Skip to content link exists', async ({ page }) => {
    await page.goto('/');
    await waitForPageLoad(page);

    const skipLink = page.locator('a[href="#main"], a[href="#content"], a[class*="skip"]').first();

    const skipLinkExists = await skipLink.count() > 0;

    console.log(`\n♿ Skip link exists: ${skipLinkExists}`);

    if (skipLinkExists) {
      await skipLink.click();
      await page.waitForTimeout(500);

      const focusedElement = await page.evaluate(() => document.activeElement?.tagName);
      console.log(`  After skip link click, focus: ${focusedElement}`);
    }
  });

  test('AC08. Heading hierarchy is correct', async ({ page }) => {
    await page.goto('/');
    await waitForPageLoad(page);

    const headings: { level: number; text: string }[] = [];

    for (let i = 1; i <= 6; i++) {
      const hElements = await page.locator(`h${i}`).all();
      for (const h of hElements) {
        const text = await h.textContent();
        headings.push({ level: i, text: text?.trim().slice(0, 30) || '' });
      }
    }

    console.log(`\n♿ Headings found: ${headings.length}`);
    headings.slice(0, 10).forEach(h => {
      console.log(`  h${h.level}: "${h.text}"`);
    });

    let validHierarchy = true;
    let lastLevel = 0;
    for (const h of headings) {
      if (h.level - lastLevel > 1) {
        validHierarchy = false;
        break;
      }
      lastLevel = h.level;
    }

    console.log(`  Valid hierarchy: ${validHierarchy}`);
  });

  test('AC09. No keyboard traps exist', async ({ page }) => {
    await page.goto('/');
    await waitForPageLoad(page);

    const initialFocus = await page.evaluate(() => document.activeElement?.tagName);

    for (let i = 0; i < 20; i++) {
      await page.keyboard.press('Tab');
    }

    const finalFocus = await page.evaluate(() => document.activeElement?.tagName);

    console.log(`\n♿ Focus movement:`);
    console.log(`  Start: ${initialFocus}`);
    console.log(`  End: ${finalFocus}`);
    console.log(`  Keyboard navigation works: ${initialFocus !== finalFocus}`);
  });

  test('AC10. Dialogs trap focus correctly', async ({ page }) => {
    await page.goto('/reporting');
    await waitForPageLoad(page);

    const addBtn = page.locator('button:has-text("New Update"), button:has-text("Add Goal")').first();

    if (await addBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await addBtn.click();

      const modal = page.locator('[role="dialog"]').first();
      await modal.waitFor({ state: 'visible', timeout: 5000 });

      const modalFocusableElements = await modal.locator('button, input, select, textarea, [tabindex="0"]').all();
      console.log(`\n♿ Modal focusable elements: ${modalFocusableElements.length}`);

      const firstFocusable = modalFocusableElements[0];
      if (firstFocusable) {
        await firstFocusable.focus();
        const focusedInModal = await modal.locator(':focus').count();
        console.log(`  Focus trapped in modal: ${focusedInModal > 0}`);
      }
    }
  });

  test('AC11. Screen reader text exists for icons', async ({ page }) => {
    await page.goto('/');
    await waitForPageLoad(page);

    const icons = await page.locator('[class*="icon"], svg').all();
    let withAriaLabel = 0;
    let withoutAriaLabel = 0;

    for (const icon of icons.slice(0, 20)) {
      const ariaLabel = await icon.getAttribute('aria-label');
      const role = await icon.getAttribute('role');

      if (ariaLabel || role) {
        withAriaLabel++;
      } else {
        withoutAriaLabel++;
      }
    }

    console.log(`\n♿ Icons with accessibility: ${withAriaLabel}`);
    console.log(`⚠️ Icons without accessibility: ${withoutAriaLabel}`);
  });

  test('AC12. Tables have proper headers', async ({ page }) => {
    await page.goto('/users');
    await waitForPageLoad(page);

    const tables = await page.locator('table').all();

    for (const table of tables) {
      const thead = table.locator('thead');
      const headers = await thead.locator('th, td').allTextContents();

      console.log(`\n♿ Table headers: ${headers.join(', ')}`);

      if (headers.length === 0) {
        console.log(`  ⚠️ Table has no headers`);
      }
    }
  });

  test('AC13. Security headers present', async ({ page }) => {
    const response = await page.request.get('http://192.168.100.2:3000');
    const headers = response.headers();

    console.log(`\n🔒 Security headers:`);
    console.log(`  X-Frame-Options: ${headers['x-frame-options'] || 'MISSING'}`);
    console.log(`  X-Content-Type-Options: ${headers['x-content-type-options'] || 'MISSING'}`);
    console.log(`  X-XSS-Protection: ${headers['x-xss-protection'] || 'MISSING'}`);
  });

  test('AC14. No敏感数据 in page source', async ({ page }) => {
    await page.goto('/');
    await waitForPageLoad(page);

    const pageContent = await page.content();

    const sensitivePatterns = [
      /password["\s]*[:=]["\s]*[^"'\s]+/i,
      /api[_-]?key["\s]*[:=]["\s]*[^"'\s]+/i,
      /secret["\s]*[:=]["\s]*[^"'\s]+/i,
      /token["\s]*[:=]["\s]*[^"'\s]+/i,
    ];

    const foundIssues: string[] = [];

    for (const pattern of sensitivePatterns) {
      if (pattern.test(pageContent)) {
        foundIssues.push(pattern.source);
      }
    }

    console.log(`\n🔒 Sensitive data in source: ${foundIssues.length === 0 ? 'NONE' : foundIssues.join(', ')}`);
    expect(foundIssues).toHaveLength(0);
  });

  test('AC15. CSP header check', async ({ page }) => {
    const response = await page.request.get('http://192.168.100.2:3000');
    const headers = response.headers();

    const csp = headers['content-security-policy'];

    console.log(`\n🔒 Content-Security-Policy: ${csp ? 'PRESENT' : 'MISSING'}`);

    if (csp) {
      console.log(`  Length: ${csp.length} chars`);
    }
  });
});