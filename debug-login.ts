import { chromium } from '@playwright/test';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 }
  });
  const page = await context.newPage();

  const logs: string[] = [];
  const networkFailures: string[] = [];

  // Capture console logs
  page.on('console', msg => {
    logs.push(`[${msg.type()}] ${msg.text()}`);
  });

  // Capture page errors
  page.on('pageerror', err => {
    logs.push(`[PAGE ERROR] ${err.message}`);
  });

  // Capture network failures
  page.on('requestfailed', request => {
    networkFailures.push(`${request.method()} ${request.url()} - ${request.failure()?.errorText}`);
  });

  try {
    console.log('🚀 Navigating to http://localhost:3030...');
    const response = await page.goto('http://localhost:3030', {
      waitUntil: 'networkidle',
      timeout: 30000
    });

    console.log(`📡 Response status: ${response?.status()}`);
    
    await page.screenshot({ path: 'debug-loading.png' });
    console.log('📸 Screenshot saved as debug-loading.png');

    // Attempt to find login fields
    const emailInput = page.locator('input[type="email"], input[name="email"]').first();
    const passwordInput = page.locator('input[type="password"]').first();
    const submitButton = page.locator('button[type="submit"]').first();

    if (await emailInput.isVisible()) {
      console.log('✅ Login form visible');
      await emailInput.fill('admin@fcis.com');
      await passwordInput.fill('Admin123!');
      await submitButton.click();
      
      console.log('🖱️ Clicked submit. Waiting for navigation...');
      await page.waitForLoadState('networkidle');
      await page.screenshot({ path: 'debug-after-login.png' });
      console.log('📸 After-login screenshot saved as debug-after-login.png');
    } else {
      console.log('❌ Login form NOT visible. Checking page content...');
      const content = await page.textContent('body');
      console.log('Page content sample:', content?.slice(0, 500));
    }

  } catch (error) {
    console.error('❌ Error during debug run:', error);
  } finally {
    console.log('\n--- CONSOLE LOGS ---');
    logs.forEach(log => console.log(log));

    console.log('\n--- NETWORK FAILURES ---');
    if (networkFailures.length === 0) console.log('No network failures');
    networkFailures.forEach(fail => console.log(fail));

    await browser.close();
  }
})();