import { test as base, Page, Locator, Request, Response } from '@playwright/test';

export interface TestUser {
  email: string;
  password: string;
  role: string;
}

export interface ConsoleError {
  type: 'error' | 'warn' | 'log';
  message: string;
  location: string;
}

export class ConsoleCapture {
  private errors: ConsoleError[] = [];
  private page: Page;

  constructor(page: Page) {
    this.page = page;
    this.attach();
  }

  private attach(): void {
    this.page.on('console', msg => {
      if (msg.type() === 'error') {
        this.errors.push({
          type: 'error',
          message: msg.text(),
          location: msg.location()?.url || '',
        });
      }
    });

    this.page.on('pageerror', err => {
      this.errors.push({
        type: 'error',
        message: err.message,
        location: '',
      });
    });
  }

  getErrors(): ConsoleError[] {
    return [...this.errors];
  }

  clear(): void {
    this.errors = [];
  }

  hasErrors(): boolean {
    return this.errors.length > 0;
  }

  logSummary(): void {
    if (this.errors.length > 0) {
      console.log(`\n📋 Console Errors Captured (${this.errors.length}):`);
      this.errors.forEach((err, i) => {
        console.log(`  ${i + 1}. ${err.message}`);
        if (err.location) console.log(`     at ${err.location}`);
      });
    }
  }
}

export class NetworkMonitor {
  private failedRequests: Request[] = [];
  private page: Page;

  constructor(page: Page) {
    this.page = page;
    this.attach();
  }

  private attach(): void {
    this.page.on('requestfailed', request => {
      this.failedRequests.push(request);
    });
  }

  getFailedRequests(): Request[] {
    return [...this.failedRequests];
  }

  clear(): void {
    this.failedRequests = [];
  }

  hasFailures(): boolean {
    return this.failedRequests.length > 0;
  }

  logSummary(): void {
    if (this.failedRequests.length > 0) {
      console.log(`\n📋 Failed Network Requests (${this.failedRequests.length}):`);
      this.failedRequests.forEach((req, i) => {
        console.log(`  ${i + 1}. ${req.method()} ${req.url()}`);
        console.log(`     Failure: ${req.failure()?.errorText}`);
      });
    }
  }
}

export const detectBrokenLinks = async (page: Page): Promise<string[]> => {
  const links = await page.locator('a[href]').all();
  const brokenLinks: string[] = [];

  for (const link of links) {
    const href = await link.getAttribute('href');
    if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) continue;
    if (href.startsWith('http')) continue;

    try {
      const response = await page.goto(href, { waitUntil: 'domcontentloaded', timeout: 5000 }).catch(() => null);
      if (response && response.status() >= 400) {
        brokenLinks.push(`${href} (${response.status()})`);
      }
      await page.goBack();
    } catch {
      brokenLinks.push(`${href} (navigation failed)`);
    }
  }

  return brokenLinks;
};

export const detectUnclickableButtons = async (page: Page): Promise<string[]> => {
  const buttons = await page.locator('button').all();
  const unclickable: string[] = [];

  for (const button of buttons) {
    const isDisabled = await button.isDisabled();
    const isHidden = await button.isHidden();
    const hasOnClick = await button.evaluate(el => {
      const onclick = (el as HTMLElement).getAttribute('onclick');
      const hasListener = (el as HTMLElement).onclick !== null;
      return onclick !== null || hasListener;
    });

    if (!isDisabled && !isHidden && !hasOnClick) {
      const text = await button.textContent();
      unclickable.push(`button: "${text?.trim() || '(no text)'}" - has no click handler`);
    }
  }

  return unclickable;
};

export const detectDuplicateIds = async (page: Page): Promise<Record<string, number>> => {
  const ids = await page.evaluate(() => {
    const elements = document.querySelectorAll('[id]');
    const idCount: Record<string, number> = {};
    elements.forEach(el => {
      const id = el.id;
      idCount[id] = (idCount[id] || 0) + 1;
    });
    return idCount;
  });

  return Object.fromEntries(
    Object.entries(ids).filter(([, count]) => count > 1)
  );
};

export const waitForPageLoad = async (page: Page, timeout = 30000): Promise<void> => {
  await page.waitForLoadState('networkidle', { timeout }).catch(() => {
    console.warn('Network idle timeout - continuing anyway');
  });
  await page.waitForLoadState('domcontentloaded', { timeout });
};

export const safeClick = async (page: Page, selector: string, options?: { timeout?: number }): Promise<boolean> => {
  try {
    const locator = page.locator(selector).first();
    await locator.waitFor({ state: 'visible', timeout: options?.timeout || 5000 });
    await locator.click({ timeout: options?.timeout || 5000 });
    return true;
  } catch (error) {
    console.warn(`SafeClick failed for "${selector}":`, (error as Error).message);
    return false;
  }
};

export const fillForm = async (page: Page, fields: Record<string, string>): Promise<void> => {
  for (const [selector, value] of Object.entries(fields)) {
    const locator = page.locator(selector).first();
    await locator.waitFor({ state: 'visible' });
    await locator.fill(value);
  }
};

export const submitForm = async (page: Page, submitSelector: string): Promise<Response | null> => {
  const [response] = await Promise.all([
    page.waitForResponse(resp => resp.status() >= 200 && resp.status() < 400, { timeout: 10000 }).catch(() => null),
    page.locator(submitSelector).click(),
  ]);
  return response;
};

export function createPageFixture() {
  return base.extend<{ page: Page }>({
    page: async ({ page }, use) => {
      await page.goto('/');
      await waitForPageLoad(page);
      await use(page);
    },
  });
}

export const routes = {
  dashboard: '/',
  reporting: '/reporting',
  reports: '/reports',
  objectives: '/objectives',
  attendance: '/operations/attendance',
  integrity: '/integrity',
  users: '/users',
  units: '/units',
  settings: '/settings',
};

export const pageIdentifiers: Record<string, { selector: string; label: string }> = {
  dashboard: { selector: 'h1', label: 'Executive Dashboard' },
  reporting: { selector: 'h1', label: 'Weekly Reporting' },
  reports: { selector: 'h1', label: 'Report Library' },
  objectives: { selector: 'h2', label: 'Strategic Governance Engine' },
  attendance: { selector: 'h1', label: 'Weekly Meeting Attendance' },
  integrity: { selector: 'h1', label: 'Integrity Checker' },
  users: { selector: 'h1', label: 'User Management' },
  units: { selector: 'h1', label: 'Corporate Units' },
  settings: { selector: 'h2', label: 'Governance Hub' },
};

export const testUsers: Record<string, TestUser> = {
  superAdmin: {
    email: 'admin@fcis.com',
    password: 'Admin123!',
    role: 'SuperAdmin',
  },
  director: {
    email: 'director@fcis.com',
    password: 'Director123!',
    role: 'Director',
  },
  admin: {
    email: 'admin@fcis.com',
    password: 'Admin123!',
    role: 'Admin',
  },
};