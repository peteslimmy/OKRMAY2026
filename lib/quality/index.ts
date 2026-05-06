export * from './risk-scoring';
export * from './audit-logger';

export const FRAMEWORK_VERSION = '1.0.0';
export const FRAMEWORK_NAME = '4CORE OKR Quality Framework';
export const LAST_UPDATED = '2026-04-27';

export const COMPLIANCE_STANDARDS = {
  iso27001: 'ISO/IEC 27001:2022',
  sdlc: 'Secure SDLC',
  testing: 'Test Governance Policy v1.0',
} as const;

export const QUALITY_THRESHOLDS = {
  testPassRate: 99,
  codeCoverage: 80,
  buildSuccessRate: 98,
  releaseSuccessRate: 95,
  securityVulnsCritical: 0,
  securityVulnsHigh: 5,
  mttrMinutes: 30,
} as const;

export const RISK_LEVELS = {
  LOW: { max: 25, color: 'green', autoDeploy: true },
  MEDIUM: { max: 50, color: 'yellow', autoDeploy: false },
  HIGH: { max: 75, color: 'orange', autoDeploy: false },
  CRITICAL: { max: 100, color: 'red', autoDeploy: false },
} as const;