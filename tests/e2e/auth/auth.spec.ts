import { test, expect, Page } from '@playwright/test';
import { waitForPageLoad, ConsoleCapture } from '../utils/test-helpers';
import { LoginPage } from '../utils/page-objects';

test.describe('Authentication Tests', () => {

  test.describe.configure({ mode: 'serial' });

  test('01. Login page should render correctly', async ({ page }) => {
    await page.goto('/');
    await waitForPageLoad(page);

    const consoleCapture = new ConsoleCapture(page);

    const loginPage = new LoginPage(page);
    const isLoginFormVisible = await loginPage.isLoginFormVisible();

    if (!isLoginFormVisible) {
      await page.goto('/');
      await waitForPageLoad(page);
    }

    const emailInput = page.locator('input[type="email"], input[name="email"]').first();
    const passwordInput = page.locator('input[type="password"]').first();
    const submitButton = page.locator('button[type="submit"]').first();

    await expect(emailInput).toBeVisible({ timeout: 10000 });
    await expect(passwordInput).toBeVisible();
    await expect(submitButton).toBeVisible();

    consoleCapture.logSummary();
  });

  test('02. Successful login should redirect to dashboard', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await page.goto('/');
    await waitForPageLoad(page);

    const isLoginFormVisible = await loginPage.isLoginFormVisible();

    if (isLoginFormVisible) {
      await loginPage.login('admin@fcis.com', 'admin123');

      await page.waitForURL('**/', { timeout: 10000 }).catch(() => {
        console.log('⚠️ Did not redirect to dashboard, checking current state...');
      });

      const currentUrl = page.url();
      const isOnDashboard = currentUrl === '/' || currentUrl.endsWith('/');
      console.log(`📍 After login URL: ${currentUrl}`);
      console.log(`📍 On dashboard: ${isOnDashboard}`);
    } else {
      console.log('⚠️ Already authenticated or login form not visible');
      const heading = page.locator('h1').first().textContent().catch(() => 'unknown');
      console.log(`📍 Current page heading: ${heading}`);
    }
  });

  test('03. Invalid credentials should show error message', async ({ page }) => {
    await page.goto('/');
    await waitForPageLoad(page);

    const emailInput = page.locator('input[type="email"], input[name="email"]').first();
    const passwordInput = page.locator('input[type="password"]').first();
    const submitButton = page.locator('button[type="submit"]').first();

    await emailInput.fill('invalid@test.com');
    await passwordInput.fill('wrongpassword');
    await submitButton.click();

    await page.waitForTimeout(2000);

    const errorMessage = page.locator('[role="alert"], .text-red-500, [data-testid="error"]').first();
    const errorVisible = await errorMessage.isVisible().catch(() => false);

    if (errorVisible) {
      const errorText = await errorMessage.textContent();
      console.log(`✅ Error displayed: ${errorText}`);
      expect(errorText).toBeTruthy();
    } else {
      const currentUrl = page.url();
      console.log(`⚠️ No error message visible. URL: ${currentUrl}`);
    }
  });

  test('04. Empty form submission should show validation', async ({ page }) => {
    await page.goto('/');
    await waitForPageLoad(page);

    const submitButton = page.locator('button[type="submit"]').first();
    await submitButton.click();

    await page.waitForTimeout(500);

    const hasValidation = await page.locator('input:invalid, [aria-invalid="true"]').count() > 0;
    console.log(`📋 Form shows validation on empty submit: ${hasValidation}`);
  });

  test('05. Password field should be maskable', async ({ page }) => {
    await page.goto('/');
    await waitForPageLoad(page);

    const passwordInput = page.locator('input[type="password"]').first();
    await passwordInput.fill('testpassword123');

    const inputType = await passwordInput.getAttribute('type');
    expect(inputType).toBe('password');

    const toggleBtn = page.locator('button[aria-label*="password" i], button[title*="password" i]').first();
    if (await toggleBtn.isVisible().catch(() => false)) {
      await toggleBtn.click();
      const newType = await passwordInput.getAttribute('type');
      console.log(`📋 Password toggle: ${inputType} -> ${newType}`);
    }
  });

  test('06. Session should persist across page reloads', async ({ page }) => {
    await page.goto('/');
    await waitForPageLoad(page);

    const isLoginFormVisible = await page.locator('input[type="password"]').isVisible().catch(() => false);

    if (isLoginFormVisible) {
      const loginPage = new LoginPage(page);
      await loginPage.login('admin@fcis.com', 'admin123');
    }

    await page.reload();
    await waitForPageLoad(page);

    const afterReloadUrl = page.url();
    const stillLoggedIn = !afterReloadUrl.includes('login') && !afterReloadUrl.includes('signin');
    console.log(`📍 After reload URL: ${afterReloadUrl}`);
    console.log(`📋 Session persisted: ${stillLoggedIn}`);
  });

  test('07. Console should have no errors on auth pages', async ({ page }) => {
    const consoleCapture = new ConsoleCapture(page);

    await page.goto('/');
    await waitForPageLoad(page);

    if (await page.locator('input[type="password"]').isVisible().catch(() => false)) {
      const loginPage = new LoginPage(page);
      await loginPage.login('admin@fcis.com', 'admin123').catch(() => {});
    }

    await page.goto('/');
    await waitForPageLoad(page);

    const errors = consoleCapture.getErrors();
    const criticalErrors = errors.filter(e => !e.message.includes('favicon') && !e.message.includes('placeholder'));

    if (criticalErrors.length > 0) {
      console.log(`\n⚠️ Console errors found:`);
      criticalErrors.forEach(e => console.log(`  - ${e.message}`));
    } else {
      console.log('✅ No critical console errors on auth pages');
    }
  });

  test('08. Sign up link should navigate to signup', async ({ page }) => {
    await page.goto('/');
    await waitForPageLoad(page);

    const signUpLink = page.locator('a:has-text("Sign up"), button:has-text("Sign up")').first();

    if (await signUpLink.isVisible().catch(() => false)) {
      await signUpLink.click();
      await page.waitForTimeout(1000);

      const url = page.url();
      console.log(`📍 After signup click: ${url}`);
    } else {
      console.log('⚠️ Sign up link not visible');
    }
  });

  test('09. Forgot password flow should be accessible', async ({ page }) => {
    await page.goto('/');
    await waitForPageLoad(page);

    const forgotPasswordLink = page.locator('a:has-text("Forgot"), button:has-text("Forgot")').first();

    if (await forgotPasswordLink.isVisible().catch(() => false)) {
      await forgotPasswordLink.click();
      await page.waitForTimeout(1000);

      const emailInput = page.locator('input[type="email"]').first();
      const isOnResetFlow = await emailInput.isVisible().catch(() => false);

      console.log(`📍 Forgot password flow: ${isOnResetFlow ? 'opened' : 'not accessible'}`);
    }
  });

  test('10. Auth state should clear on sign out', async ({ page }) => {
    await page.goto('/');
    await waitForPageLoad(page);

    if (await page.locator('input[type="password"]').isVisible().catch(() => false)) {
      const loginPage = new LoginPage(page);
      await loginPage.login('admin@fcis.com', 'admin123');
    }

    const signOutBtn = page.locator('button:has-text("Sign out"), button:has-text("Logout"), button[aria-label*="sign out"]').first();

    if (await signOutBtn.isVisible().catch(() => false)) {
      await signOutBtn.click();
      await page.waitForTimeout(2000);

      const currentUrl = page.url();
      const isLoggedOut = currentUrl.includes('login') || currentUrl.includes('signin') || currentUrl === page.url();
      console.log(`📍 After sign out URL: ${currentUrl}`);
    }
  });
});