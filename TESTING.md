# 4CORE Weekly OKR - Playwright E2E Testing Framework

## Overview

Comprehensive automated testing framework using Playwright for the 4CORE Weekly OKR application.

## Quick Start

```bash
# Install dependencies
npm install -D @playwright/test

# Install browsers
npx playwright install chromium --with-deps

# Run all tests
npx playwright test

# Run with UI
npx playwright test --ui

# Run specific test file
npx playwright test tests/e2e/navigation/routes.spec.ts

# Run specific browser only
npx playwright test --project=chromium

# Generate report
npx playwright show-report
```

## Test Structure

```
tests/e2e/
├── auth/               # Authentication tests
│   └── auth.spec.ts
├── navigation/         # Routing & button tests
│   ├── routes.spec.ts
│   └── buttons.spec.ts
├── features/           # Feature validation
│   ├── features.spec.ts
│   ├── api.spec.ts
│   └── accessibility.spec.ts
├── components/         # Component & visual tests
│   ├── rendering.spec.ts
│   └── visual.spec.ts
├── regression/         # Full flow regression
│   └── full-flow.spec.ts
└── utils/              # Test utilities
    ├── test-helpers.ts
    └── page-objects.ts
```

## Available Test Commands

### Full Test Suite
```bash
npx playwright test                    # All tests, all browsers
npx playwright test --ui               # Interactive UI mode
npx playwright test --headed           # Visible browser
npx playwright test --debug            # Debug mode
```

### By Category
```bash
# Navigation tests
npx playwright test tests/e2e/navigation/

# Auth tests
npx playwright test tests/e2e/auth/

# Feature tests
npx playwright test tests/e2e/features/

# Component tests
npx playwright test tests/e2e/components/

# Regression tests
npx playwright test tests/e2e/regression/
```

### Single Browser
```bash
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project=webkit
```

## Configuration

Key settings in `playwright.config.ts`:

- **Base URL**: `http://192.168.100.2:3000`
- **Timeout**: 30s (configurable)
- **Retries**: 1 local, 2 CI
- **Reporters**: HTML, JSON, List

### Environment Variables

```bash
BASE_URL=http://192.168.100.2:3000
CI=true                           # Enables CI mode
E2E_PORT=3000                     # Dev server port
```

## Test Coverage

### Phase 1: Navigation & Routing
- [x] All routes load without 404
- [x] Sidebar navigation works
- [x] Page identifiers verified
- [x] No broken internal links
- [x] Page load performance

### Phase 2: Button & Interactions
- [x] All buttons clickable
- [x] Filter/Export functionality
- [x] Modal open/close
- [x] Week selector
- [x] View mode toggle
- [x] Search input

### Phase 3: Authentication
- [x] Login form renders
- [x] Successful login redirect
- [x] Invalid credentials error
- [x] Form validation
- [x] Password visibility toggle
- [x] Session persistence

### Phase 4: Components
- [x] StatCards render
- [x] GoalCards display correctly
- [x] KR sections structure
- [x] User table render
- [x] Charts render
- [x] Loading states
- [x] Empty states
- [x] Modal accessibility

### Phase 5: Features
- [x] KPI widgets
- [x] Charts with data
- [x] Filter functionality
- [x] Export functionality
- [x] Week navigation
- [x] Goal CRUD
- [x] Task completion toggle
- [x] Quarter collapse/expand
- [x] Lock/unlock quarter
- [x] Unit card view
- [x] Org chart toggle
- [x] User pagination
- [x] Settings tabs
- [x] Attendance display
- [x] Integrity check

### Phase 6: API & Data
- [x] Supabase REST API
- [x] Activities endpoint
- [x] Goals endpoint
- [x] Business units endpoint
- [x] Users endpoint
- [x] API error handling
- [x] Page API intercepts
- [x] Mutations trigger
- [x] Edge functions
- [x] Data caching
- [x] Pagination
- [x] Filter queries

### Phase 7: Visual Regression
- [x] Dashboard baseline
- [x] Sidebar states
- [x] Mobile viewport
- [x] Reporting page
- [x] Units page
- [x] Settings page
- [x] Modal states
- [x] Goal card hover
- [x] Dropdown open
- [x] Charts
- [x] Loading skeletons
- [x] Empty states
- [x] Toast notifications
- [x] User table
- [x] Quarter sections
- [x] Org chart
- [x] Settings tabs
- [x] Scroll depth

### Phase 8: Accessibility
- [x] Accessible button names
- [x] Image alt text
- [x] Form labels
- [x] Color contrast
- [x] Focus indicators
- [x] ARIA roles
- [x] Skip links
- [x] Heading hierarchy
- [x] Keyboard navigation
- [x] Dialog focus trap
- [x] Icon accessibility
- [x] Table headers

### Phase 9: Security
- [x] Security headers
- [x] No sensitive data in source
- [x] CSP header check

## CI/CD Integration

GitHub Actions workflow at `.github/workflows/playwright.yml`:

```yaml
# Run on every push/PR
on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]
```

### Pipeline Stages
1. **Quality Gate**: Lint, typecheck
2. **Playwright Tests**: All browsers, sharded
3. **Visual Regression**: Screenshot comparison
4. **Combine Results**: Merge artifacts
5. **Deployment Check**: Pre-deployment approval

## Visual Testing

Screenshots are stored in `playwright-report/`:
- Baseline images for comparison
- Diff images on failures
- Full-page screenshots

Update baselines:
```bash
npx playwright test --update-snapshots
```

## Report

Open test report:
```bash
npx playwright show-report
```

JSON results: `playwright-report/results.json`

## Troubleshooting

### Tests timeout
```bash
npx playwright test --timeout=60000
```

### Browser doesn't launch
```bash
npx playwright install chromium --with-deps
```

### Clear cache
```bash
rm -rf playwright-report/ test-results/
npx playwright test
```

### Run single test
```bash
npx playwright test tests/e2e/navigation/routes.spec.ts --grep "01. All routes"
```

## Environment Verification

Before running E2E tests, verify environment:
```bash
npm run test:env
```

This checks:
- DNS resolution
- HTTPS certificate
- API health
- Database connectivity
- Auth endpoint
- Edge functions

## Success Criteria

- [x] 100% of pages tested
- [x] 0 broken routes
- [x] 0 dead buttons
- [x] All core features validated
- [x] Automated regression protection
- [ ] Performance checks (load time thresholds)
- [ ] Full accessibility audit
- [ ] Security penetration testing