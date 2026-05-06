import { Page, Locator, expect } from '@playwright/test';
import { safeClick, waitForPageLoad } from './test-helpers';

export abstract class BasePage {
  protected page: Page;
  protected url: string;

  constructor(page: Page, url: string) {
    this.page = page;
    this.url = url;
  }

  async goto(): Promise<void> {
    await this.page.goto(this.url);
    await waitForPageLoad(this.page);
  }

  async waitForSelector(selector: string, timeout = 10000): Promise<Locator> {
    const locator = this.page.locator(selector).first();
    await locator.waitFor({ state: 'visible', timeout });
    return locator;
  }

  async isLoaded(): Promise<boolean> {
    try {
      await this.waitForSelector('body', 5000);
      return true;
    } catch {
      return false;
    }
  }

  getPage(): Page {
    return this.page;
  }
}

export class LoginPage extends BasePage {
  constructor(page: Page) {
    super(page, '/');
  }

  get emailInput(): Locator {
    return this.page.locator('input[type="email"], input[name="email"]').first();
  }

  get passwordInput(): Locator {
    return this.page.locator('input[type="password"]').first();
  }

  get submitButton(): Locator {
    return this.page.locator('button[type="submit"]').first();
  }

  get errorMessage(): Locator {
    return this.page.locator('[role="alert"], .text-red-500, [data-testid="error"]').first();
  }

  async login(email: string, password: string): Promise<void> {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.submitButton.click();
    await this.page.waitForURL('**/');
    await waitForPageLoad(this.page);
  }

  async isLoginFormVisible(): Promise<boolean> {
    try {
      await this.emailInput.waitFor({ state: 'visible', timeout: 5000 });
      return true;
    } catch {
      return false;
    }
  }
}

export class DashboardPage extends BasePage {
  constructor(page: Page) {
    super(page, '/');
  }

  get heading(): Locator {
    return this.page.locator('h1').first();
  }

  get statCards(): Locator {
    return this.page.locator('[class*="StatCard"], [class*="stat-card"]');
  }

  get charts(): Locator {
    return this.page.locator('svg[data-testid*="chart"], .recharts-wrapper');
  }

  get sideNav(): Locator {
    return this.page.locator('aside nav, [data-testid="sidebar"]').first();
  }

  async isDashboardLoaded(): Promise<boolean> {
    try {
      await this.heading.waitFor({ state: 'visible', timeout: 10000 });
      const text = await this.heading.textContent();
      return text?.toLowerCase().includes('dashboard') || text?.toLowerCase().includes('overview');
    } catch {
      return false;
    }
  }

  async getStatCardCount(): Promise<number> {
    return this.statCards.count();
  }

  async clickStatCard(index: number): Promise<void> {
    const card = this.statCards.nth(index);
    await card.click();
  }

  async getSideNavItems(): Promise<string[]> {
    const items = await this.sideNav.locator('a, button').all();
    return Promise.all(items.map(item => item.textContent().then(t => t?.trim() || '')));
  }
}

export class ReportModulePage extends BasePage {
  constructor(page: Page) {
    super(page, '/reporting');
  }

  get heading(): Locator {
    return this.page.locator('h1').first();
  }

  get goalCards(): Locator {
    return this.page.locator('[class*="GoalCard"], [data-testid="goal-card"]');
  }

  get addGoalButton(): Locator {
    return this.page.locator('button:has-text("New Update"), button:has-text("Add Goal")').first();
  }

  get weekSelector(): Locator {
    return this.page.locator('select').first();
  }

  get krSections(): Locator {
    return this.page.locator('[class*="kr-section"], [data-testid="kr-section"]');
  }

  async isReportModuleLoaded(): Promise<boolean> {
    try {
      await this.heading.waitFor({ state: 'visible', timeout: 10000 });
      const text = await this.heading.textContent();
      return text?.toLowerCase().includes('weekly') || text?.toLowerCase().includes('reporting');
    } catch {
      return false;
    }
  }

  async getGoalCardCount(): Promise<number> {
    return this.goalCards.count();
  }

  async openAddGoalModal(): Promise<void> {
    await this.addGoalButton.click();
    await this.page.locator('[role="dialog"], [class*="modal"]').waitFor({ state: 'visible' });
  }

  async selectWeek(week: string): Promise<void> {
    await this.weekSelector.selectOption(week);
  }

  async getKRGoalCount(krLabel: string): Promise<number> {
    const section = this.page.locator(`text="${krLabel}"`).first();
    await section.waitFor({ state: 'visible' });
    const parent = section.locator('..').locator('..');
    return parent.locator('[class*="GoalCard"]').count();
  }
}

export class BusinessObjectivesPage extends BasePage {
  constructor(page: Page) {
    super(page, '/objectives');
  }

  get heading(): Locator {
    return this.page.locator('h2').first();
  }

  get quarterColumns(): Locator {
    return this.page.locator('[class*="quarter"], [data-testid="quarter-column"]');
  }

  get addKRButton(): Locator {
    return this.page.locator('button:has-text("New KR")').first();
  }

  async isObjectivesPageLoaded(): Promise<boolean> {
    try {
      await this.heading.waitFor({ state: 'visible', timeout: 10000 });
      const text = await this.heading.textContent();
      return text?.toLowerCase().includes('governance') || text?.toLowerCase().includes('strategic');
    } catch {
      return false;
    }
  }

  async getQuarterCount(): Promise<number> {
    return this.quarterColumns.count();
  }

  async clickQuarter(quarter: 'Q1' | 'Q2' | 'Q3' | 'Q4'): Promise<void> {
    const column = this.page.locator(`text="${quarter}"`).first();
    await column.click();
  }

  async addNewKR(quarter: string): Promise<void> {
    await this.clickQuarter(quarter as any);
    await this.addKRButton.click();
    await this.page.locator('[role="dialog"], [class*="modal"]').waitFor({ state: 'visible' });
  }
}

export class BusinessUnitsPage extends BasePage {
  constructor(page: Page) {
    super(page, '/units');
  }

  get heading(): Locator {
    return this.page.locator('h1:has-text("Corporate Units")').first();
  }

  get unitCards(): Locator {
    return this.page.locator('[class*="UnitCard"], [data-testid="unit-card"]');
  }

  get addUnitButton(): Locator {
    return this.page.locator('button:has-text("New Unit")').first();
  }

  get viewModeToggle(): Locator {
    return this.page.locator('[data-testid="view-mode-toggle"]');
  }

  async isUnitsPageLoaded(): Promise<boolean> {
    try {
      await this.heading.waitFor({ state: 'visible', timeout: 10000 });
      return true;
    } catch {
      return false;
    }
  }

  async getUnitCardCount(): Promise<number> {
    return this.unitCards.count();
  }

  async clickAddUnit(): Promise<void> {
    await this.addUnitButton.click();
  }

  async toggleViewMode(mode: 'cards' | 'orgchart'): Promise<void> {
    const toggle = this.page.locator(`button:has-text("${mode}")`).first();
    await toggle.click();
  }

  async getUnitCardByName(name: string): Promise<Locator> {
    return this.page.locator(`[data-testid="unit-card"]:has-text("${name}")`).first();
  }
}

export class UserManagementPage extends BasePage {
  constructor(page: Page) {
    super(page, '/users');
  }

  get heading(): Locator {
    return this.page.locator('h1').first();
  }

  get userTable(): Locator {
    return this.page.locator('table, [data-testid="user-table"]').first();
  }

  get addUserButton(): Locator {
    return this.page.locator('button:has-text("New Identity"), button:has-text("Add User")').first();
  }

  get searchInput(): Locator {
    return this.page.locator('input[type="search"], input[placeholder*="Search"]').first();
  }

  async isUserManagementLoaded(): Promise<boolean> {
    try {
      await this.heading.waitFor({ state: 'visible', timeout: 10000 });
      const text = await this.heading.textContent();
      return text?.toLowerCase().includes('user') || text?.toLowerCase().includes('identity');
    } catch {
      return false;
    }
  }

  async getUserCount(): Promise<number> {
    return this.userTable.locator('tbody tr').count();
  }

  async searchForUser(query: string): Promise<void> {
    await this.searchInput.fill(query);
    await this.page.waitForTimeout(500);
  }

  async clickUserRow(email: string): Promise<void> {
    await this.userTable.locator(`text="${email}"`).click();
  }

  async openAddUserModal(): Promise<void> {
    await this.addUserButton.click();
    await this.page.locator('[role="dialog"], [class*="modal"]').waitFor({ state: 'visible' });
  }
}

export class SettingsPage extends BasePage {
  constructor(page: Page) {
    super(page, '/settings');
  }

  get heading(): Locator {
    return this.page.locator('h2').first();
  }

  get tabs(): Locator {
    return this.page.locator('[role="tab"], [data-testid="settings-tab"]');
  }

  get saveButton(): Locator {
    return this.page.locator('button:has-text("Save"), button:has-text("Commit")').first();
  }

  async isSettingsPageLoaded(): Promise<boolean> {
    try {
      await this.heading.waitFor({ state: 'visible', timeout: 10000 });
      const text = await this.heading.textContent();
      return text?.toLowerCase().includes('governance') || text?.toLowerCase().includes('settings');
    } catch {
      return false;
    }
  }

  async clickTab(tabName: string): Promise<void> {
    await this.page.locator(`[role="tab"]:has-text("${tabName}")`).click();
    await this.page.waitForTimeout(300);
  }

  async getActiveTabName(): Promise<string> {
    const active = this.page.locator('[role="tab"][aria-selected="true"]').first();
    return active.textContent() || '';
  }
}

export class Sidebar {
  constructor(private page: Page) {}

  get navLinks(): Locator {
    return this.page.locator('aside nav a, [data-testid="sidebar"] a');
  }

  get collapsedToggle(): Locator {
    return this.page.locator('[aria-label*="collapse"], [aria-label*="expand"]').first();
  }

  async getNavItemCount(): Promise<number> {
    return this.navLinks.count();
  }

  async clickNavItem(label: string): Promise<void> {
    await this.navLinks.locator(`text="${label}"`).click();
    await waitForPageLoad(this.page);
  }

  async isExpanded(): Promise<boolean> {
    const sidebar = this.page.locator('aside').first();
    const width = await sidebar.evaluate(el => (el as HTMLElement).offsetWidth);
    return width > 100;
  }

  async toggleCollapse(): Promise<void> {
    await this.collapsedToggle.click();
    await this.page.waitForTimeout(300);
  }
}