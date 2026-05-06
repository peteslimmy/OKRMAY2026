# 4CORE Weekly OKR - Quality Dashboard Specification v1.0

**Document Classification:** Internal - Controlled
**Version:** 1.0
**Last Updated:** 2026-04-27

---

## 1. Executive Dashboard Overview

### 1.1 Purpose
Provide real-time visibility into system quality, security posture, and release readiness for all stakeholders.

### 1.2 Dashboard Scope

| Dashboard | Audience | Refresh | Location |
|-----------|----------|---------|----------|
| Executive Summary | Leadership | Real-time | Confluence/Portal |
| Release Readiness | Dev + QA | Real-time | CI/CD Pipeline |
| Security Posture | Security Team | Real-time | Security Portal |
| Quality Metrics | All Teams | Daily | Quality Portal |

### 1.3 Data Sources

```
┌─────────────────────────────────────────────────────────────────┐
│                     QUALITY DATA LAKE                           │
├─────────────────┬─────────────────┬─────────────────────────────┤
│  GitHub         │  Playwright     │  SonarQube                  │
│  (commits, PRs) │  (test results) │  (code quality)             │
├─────────────────┼─────────────────┼─────────────────────────────┤
│  Snyk           │  Lighthouse     │  PagerDuty                  │
│  (vulns)        │  (performance)  │  (incidents)                │
├─────────────────┼─────────────────┼─────────────────────────────┤
│  Datadog        │  GitHub Actions │  Custom Metrics             │
│  (APM)          │  (pipeline)     │  (business)                 │
└─────────────────┴─────────────────┴─────────────────────────────┘
```

---

## 2. Executive Summary Dashboard

### 2.1 Key Performance Indicators

```
┌────────────────────────────────────────────────────────────────────────┐
│  EXECUTIVE QUALITY SUMMARY                           [Last 24h] 🔄    │
├────────────────────────────────────────────────────────────────────────┤
│                                                                        │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  │
│  │   99.2%     │  │   82.4%     │  │     3       │  │    GREEN    │  │
│  │ Test Pass   │  │ Coverage    │  │ Open Vulns  │  │Risk Level   │  │
│  │   ▲ 0.5%    │  │   ▲ 2.1%    │  │   ▼ 2       │  │  LOW RISK   │  │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘  │
│                                                                        │
│  Deployment Health        Code Quality         Security Posture        │
│  ┌──────────────────┐    ┌──────────────┐     ┌──────────────────┐   │
│  │ ● 12 deploys/    │    │ Grade: A     │     │ Critical: 0      │   │
│  │   day            │    │ Tech Debt:   │     │ High: 3          │   │
│  │ ● 98.5% success  │    │   2.3%       │     │ Medium: 12       │   │
│  │ ● MTTR: 18min    │    │ Duplicates:  │     │ Compliance: ✓    │   │
│  │                  │    │   1.2%       │     │                  │   │
│  └──────────────────┘    └──────────────┘     └──────────────────┘   │
│                                                                        │
└────────────────────────────────────────────────────────────────────────┘
```

### 2.2 Traffic Light Status Indicators

| Status | Color | Criteria |
|--------|-------|----------|
| **HEALTHY** | Green | All metrics within target |
| **WARNING** | Yellow | 1-2 metrics below target |
| **CRITICAL** | Red | 3+ metrics below target or any P1 incident |

### 2.3 Trend Charts

```
┌──────────────────────────────────────────────────────────────────────┐
│  QUALITY TRENDS - Last 30 Days                                        │
├──────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  Test Pass Rate              Security Vulns          Deployment      │
│  100%│    ╭─╮                  10│    ╲                  14│         │
│      │   ╭╯ ╰╮    ╭──          8│     ╲   ╭╮            12│  ╭──    │
│   95%│──╯    ╰───╯  ──         6│      ╰──╯╰───          10│──╯  ╰──│
│      │                            4│                        8│         │
│   90%│                            2│                        6│         │
│      │                            0│                        4│         │
│      └────────────────────        └────────────────────     └─────────│
│       M T W T F S S                  M T W T F S S                 │
│                                                                       │
│  Legend: ── Actual    ╭── Target    ─ ─ Forecast                    │
│                                                                       │
└──────────────────────────────────────────────────────────────────────┘
```

---

## 3. Release Readiness Dashboard

### 3.1 Gate Status

```
┌────────────────────────────────────────────────────────────────────────┐
│  RELEASE READINESS                              Next: v2.4.1 [PROD]   │
├────────────────────────────────────────────────────────────────────────┤
│                                                                        │
│  Quality Gates                                    Status               │
│  ════════════════════════════════════════════════════════════════════  │
│                                                                        │
│  Gate 0: Code Quality                                                    │
│  ├── Linting                           ✅ PASS (0 errors)              │
│  ├── Type Check                        ✅ PASS (0 errors)              │
│  ├── Secrets Scan                      ✅ PASS (0 found)               │
│  └── Commit Validation                 ⚠️  WARN (2 non-conventional)    │
│                                                                        │
│  Gate 1: Unit Tests                                                      │
│  ├── Test Execution                 ✅ PASS (487/487)                  │
│  ├── Coverage Threshold              ✅ PASS (82.4% > 80%)             │
│  └── Flaky Test Check                ✅ PASS (0 flaky)                 │
│                                                                        │
│  Gate 2: Build & Security                                               │
│  ├── Build Success                     ✅ PASS                         │
│  ├── SAST Scan                         ✅ PASS (0 critical/high)       │
│  ├── Dependency Scan                   ⚠️  WARN (3 medium)             │
│  └── Bundle Size                       ✅ PASS (541KB)                 │
│                                                                        │
│  Gate 3: E2E Tests                                                      │
│  ├── Navigation Tests               ✅ PASS (7/7)                      │
│  ├── Auth Tests                     ✅ PASS (10/10)                    │
│  ├── Feature Tests                  ✅ PASS (20/20)                    │
│  ├── Component Tests                ✅ PASS (12/12)                    │
│  ├── API Tests                      ⚠️  WARN (14/15 - 1 skipped)       │
│  └── Visual Regression              ✅ PASS (18/20, 2 skipped)         │
│                                                                        │
│  Gate 4: Security Validation                                            │
│  ├── OWASP ZAP                       ✅ PASS (0 critical/high)         │
│  ├── Security Headers                ⚠️  WARN (CSP via meta)           │
│  └── Accessibility                   ✅ PASS (WCAG AA)                 │
│                                                                        │
│  Gate 5: Risk Assessment                                               │
│  └── Risk Score                      ✅ PASS (18/100 - LOW)            │
│                                                                        │
├────────────────────────────────────────────────────────────────────────┤
│                                                                        │
│  Overall Status:                    ✅ ALL GATES PASSED               │
│  Auto-Deploy:                       🚀 ENABLED                        │
│  Approval Required:                 No                                │
│                                                                        │
│  [Pre-Deployment Checklist]                                            │
│  ☑ Rollback plan documented                                            │
│  ☑ Monitoring active                                                     │
│  ☑ On-call notified                                                      │
│  ☑ Stakeholder informed                                                 │
│                                                                        │
│                           [ APPROVE & DEPLOY TO PRODUCTION ]           │
│                                                                        │
└────────────────────────────────────────────────────────────────────────┘
```

### 3.2 Risk Score Breakdown

```
┌────────────────────────────────────────────────────────────────────────┐
│  RISK SCORE BREAKDOWN                                    Current: 18  │
├────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  Score: 18/100                                         [LOW RISK]      │
│  ════════════════════════════════════════════════════════════         │
│                                                                         │
│  Component            Score   Max   Weight   Contribution               │
│  ────────────────────────────────────────────────────────────────────  │
│  Test Failure         5       100   25%      1.25                       │
│  Bug Factor           10      100   20%      2.00                       │
│  Security Vuln        8       100   30%      2.40                       │
│  Code Churn           15      100   15%      2.25                       │
│  Change Probability   30      100   10%      3.00                       │
│  ────────────────────────────────────────────────────────────────────  │
│  Total                -       -      100%    9.90 → 18 (rounded)       │
│                                                                         │
│  Risk Distribution                                                   │
│  [0-25]███████████████████████████████[26-50][51-75][76-100]          │
│   LOW          MEDIUM                HIGH      CRITICAL                │
│                     ▼                                           ▼      │
│                  Current                                    Threshold  │
│                                                                         │
│  Recommendations:                                                      │
│  • Code churn is moderate - consider smaller PRs                       │
│  • 2 high-severity bugs open - prioritize resolution                   │
│  • Security scan clean - no blocking issues                            │
│                                                                         │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 4. Security Posture Dashboard

### 4.1 Vulnerability Overview

```
┌────────────────────────────────────────────────────────────────────────┐
│  SECURITY POSTURE                                  Updated: 2 min ago  │
├────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  │
│  │     0       │  │     3       │  │    12       │  │     8       │  │
│  │ Critical    │  │ High        │  │ Medium      │  │ Low         │  │
│  │   ✅ 0      │  │   ⚠️ 3       │  │   ℹ️ 12      │  │   ℹ️ 8       │  │
│  │ Open        │  │ Open        │  │ Open        │  │ Open        │  │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘  │
│                                                                         │
│  Security Grade: A                                                     │
│  ═══════════════════════════════                                       │
│                                                                         │
│  Vulnerability Trend (30 days)                                         │
│  20│╭╮                                                             │
│   15│││╭╮╭╮                                                          │
│   10││││││││╭╮  ╭╮                                                      │
│    5││││││││││╰──╯╰╮                                                    │
│    0│╰╯╰╯╰╯╰╯╰╯╰╯╰╯╰                                                 │
│      M T W T F S S M T W T F S S M T W T F S S M T W T F S S         │
│                                                                         │
│  [ Critical  ─ ─ ─ High  ─ ─ Medium  ─ ─ Low ]                        │
│                                                                         │
└────────────────────────────────────────────────────────────────────────┘
```

### 4.2 Security Controls Status

```
┌────────────────────────────────────────────────────────────────────────┐
│  SECURITY CONTROLS - ISO 27001                                         │
├────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  Access Control                    [██████████] 100% Effective         │
│  ├── Multi-factor authentication   ✅ Enabled                          │
│  ├── Role-based access control     ✅ Configured                       │
│  ├── Privileged access management  ✅ Enforced                         │
│  └── Session management            ✅ Secure                           │
│                                                                         │
│  Cryptography                      [████████░░] 80% Effective          │
│  ├── Data at rest encryption       ✅ AES-256                          │
│  ├── Data in transit               ✅ TLS 1.3                          │
│  ├── Key management                ⚠️  Manual rotation                 │
│  └── Certificate management        ✅ Automated                        │
│                                                                         │
│  Security Testing                  [██████████] 100% Effective         │
│  ├── SAST                          ✅ Integrated                       │
│  ├── DAST                          ✅ Weekly                           │
│  ├── Dependency scanning           ✅ Every build                      │
│  └── Penetration testing           ✅ Quarterly                        │
│                                                                         │
│  Logging & Monitoring              [████████░░] 85% Effective          │
│  ├── Audit logging                 ✅ Comprehensive                    │
│  ├── Real-time alerting            ✅ Configured                       │
│  ├── Log retention                 ⚠️  90 days (std: 1 year)          │
│  └── SIEM integration              ✅ Connected                        │
│                                                                         │
└────────────────────────────────────────────────────────────────────────┘
```

### 4.3 Security Incident Timeline

```
┌────────────────────────────────────────────────────────────────────────┐
│  RECENT SECURITY EVENTS                                                │
├────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  Today                                                                  │
│  ├── 14:32  🔍 Failed login attempt (user: admin@fcis.com)             │
│  │         └── 3 attempts, account locked, alert sent                  │
│  └── 09:15  ✅ Security scan completed - no new vulnerabilities         │
│                                                                         │
│  Yesterday                                                              │
│  ├── 16:45  ✅ Dependency update applied (lodash @ 4.17.21 → 4.17.23)  │
│  ├── 11:20  🔍 Suspicious API access pattern detected                   │
│  │         └── False positive - stress test from QA                    │
│  └── 02:00  ✅ Nightly security scan completed                          │
│                                                                         │
│  This Week                                                              │
│  ├── 3  Failed login attempts (all blocked)                            │
│  ├── 12  Dependency updates applied                                    │
│  ├── 0   Critical vulnerabilities detected                              │
│  └── 0   Security incidents                                             │
│                                                                         │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 5. Quality Metrics Dashboard

### 5.1 Test Coverage Matrix

```
┌────────────────────────────────────────────────────────────────────────┐
│  TEST COVERAGE MATRIX                               Overall: 82.4%     │
├────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  Component             Statements  Branches  Functions  Lines          │
│  ────────────────────────────────────────────────────────────────────  │
│  Dashboard             ████████████  85.2%    92.1%      88.5%        │
│  ReportModule          ██████████░░  78.4%    81.3%      76.2%        │
│  BusinessObjectives    █████████░░░  72.1%    75.8%      71.4%        │
│  BusinessUnits         ███████████░  88.7%    90.2%      86.9%        │
│  UserManagement        ██████████░░  79.5%    82.4%      78.3%        │
│  Settings              █████████░░░  74.2%    76.8%      73.1%        │
│  Auth                  ████████████  95.3%    97.2%      94.8%        │
│  Utils                 ████████████  98.1%    99.0%      97.5%        │
│  ────────────────────────────────────────────────────────────────────  │
│  Target                ≥ 80%       ≥ 75%    ≥ 80%      ≥ 80%         │
│  Actual                82.4%       78.4%    84.8%      80.8%         │
│  Status                ✅ PASS     ⚠️ WARN   ✅ PASS    ✅ PASS      │
│                                                                         │
│  [ Trend: ▼ 1.2% from last week ]                                      │
│                                                                         │
└────────────────────────────────────────────────────────────────────────┘
```

### 5.2 Test Execution History

```
┌────────────────────────────────────────────────────────────────────────┐
│  TEST EXECUTION HISTORY                            Last 14 days        │
├────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  Date        Total  Pass  Fail  Skip  Pass Rate  Duration  Coverage   │
│  ────────────────────────────────────────────────────────────────────  │
│  2026-04-27  625    621    4    0     99.4%      45m       82.4%     │
│  2026-04-26  620    618    2    0     99.7%      42m       82.1%     │
│  2026-04-25  618    616    2    0     99.7%      43m       81.9%     │
│  2026-04-24  612    610    2    0     99.7%      44m       81.5%     │
│  2026-04-23  605    603    1    1     99.8%      41m       81.2%     │
│  2026-04-22  598    596    2    0     99.7%      40m       80.8%     │
│  2026-04-21  595    593    2    0     99.7%      42m       80.5%     │
│  2026-04-20  590    588    1    1     99.8%      39m       80.2%     │
│  2026-04-19  588    586    0    2     99.7%      38m       79.8%     │
│  2026-04-18  585    583    2    0     99.7%      40m       79.5%     │
│  ────────────────────────────────────────────────────────────────────  │
│  Average     604    601    2    0.4   99.7%      41.4m     81.0%     │
│                                                                         │
│  [ Trend: Pass rate stable, coverage improving ]                        │
│                                                                         │
└────────────────────────────────────────────────────────────────────────┘
```

### 5.3 Build Health

```
┌────────────────────────────────────────────────────────────────────────┐
│  BUILD HEALTH                                    Last 30 days          │
├────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  Build Success Rate: 98.2%           Target: ≥ 98%      [HEALTHY]      │
│  ════════════════════════════════════════════════════════════════════  │
│                                                                         │
│  Successful Builds: 218       Failed Builds: 4        Total: 222       │
│                                                                         │
│  Failed Build Analysis                                                      │
│  ├── Feature/test-redesign     Apr 24  [FIXED] TypeScript error        │
│  ├── Feature/auth-flow         Apr 20  [FIXED] Missing dependency      │
│  ├── Feature/dashboard-v2      Apr 15  [FIXED] Build timeout           │
│  └── Feature/api-refactor      Apr 10  [FIXED] Bundle size exceeded    │
│                                                                         │
│  Build Duration                                                             │
│  ├── Average: 4m 32s                                                     │
│  ├── P50: 4m 15s                                                         │
│  ├── P90: 5m 45s                                                         │
│  └── P99: 8m 12s                                                         │
│                                                                         │
│  [ Trend: Duration decreasing (-12%) ]                                   │
│                                                                         │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 6. Real-Time Monitoring Dashboard

### 6.1 Application Health

```
┌────────────────────────────────────────────────────────────────────────┐
│  APPLICATION HEALTH                                ● All Systems UP    │
├────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  Service Status                                                          │
│  ════════════════════════════════════════════════════════════════════  │
│                                                                         │
│  ● Frontend (React)         200 OK    45ms    ● HEALTHY                │
│  ● API Gateway              200 OK    32ms    ● HEALTHY                │
│  ● Supabase (Primary)       200 OK    28ms    ● HEALTHY                │
│  ● Supabase (Auth)          200 OK    24ms    ● HEALTHY                │
│  ● Edge Functions           200 OK    156ms   ● HEALTHY                │
│  ● CDN                      200 OK    12ms    ● HEALTHY                │
│                                                                         │
│  Error Rates (Last Hour)                                                 │
│  ├── JS Errors:     0.02%   (threshold: 0.1%)     ● HEALTHY            │
│  ├── API Errors:    0.08%   (threshold: 1.0%)     ● HEALTHY            │
│  ├── 404 Errors:    0.01%   (threshold: 0.5%)     ● HEALTHY            │
│  └── Auth Errors:   0.00%   (threshold: 0.1%)     ● HEALTHY            │
│                                                                         │
│  Performance (Last Hour)                                                 │
│  ├── Page Load:     1.8s    (threshold: 3.0s)    ● HEALTHY             │
│  ├── API Latency:   124ms   (threshold: 500ms)   ● HEALTHY             │
│  ├── TTFB:          45ms    (threshold: 200ms)   ● HEALTHY             │
│  └── CLS:           0.05    (threshold: 0.1)     ● HEALTHY             │
│                                                                         │
└────────────────────────────────────────────────────────────────────────┘
```

### 6.2 User Journey Monitoring

```
┌────────────────────────────────────────────────────────────────────────┐
│  USER JOURNEY STATUS                                                    │
├────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  Critical Journeys                                                      │
│  ════════════════════════════════════════════════════════════════════  │
│                                                                         │
│  Login Flow                                                             │
│  ├── / → Login Page              99.8%  ● HEALTHY                      │
│  ├── Submit Credentials           99.9%  ● HEALTHY                     │
│  └── Redirect to Dashboard        99.7%  ● HEALTHY                     │
│                                                                         │
│  Weekly Reporting                                                       │
│  ├── /reporting                  99.9%  ● HEALTHY                      │
│  ├── Select Week                 99.8%  ● HEALTHY                      │
│  ├── View Goal Cards             99.5%  ● HEALTHY                      │
│  └── Create Goal                 98.2%  ● HEALTHY                      │
│                                                                         │
│  Business Units                                                          │
│  ├── /units                     99.9%  ● HEALTHY                       │
│  ├── View Unit Cards            99.8%  ● HEALTHY                       │
│  └── Toggle Org Chart           99.4%  ● HEALTHY                       │
│                                                                         │
│  Recent User-Facing Errors                                                │
│  ├── None in last 24 hours                                               │
│                                                                         │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 7. Compliance Dashboard

### 7.1 ISO 27001 Controls Status

```
┌────────────────────────────────────────────────────────────────────────┐
│  ISO 27001 COMPLIANCE STATUS                        AUDIT: Q1 2026    │
├────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  Overall Compliance: 94.2%                              [EFFECTIVE]    │
│  ════════════════════════════════════════════════════════════════════  │
│                                                                         │
│  A.5 - Information Security Policies       [██████████] 100%           │
│  A.6 - Organization of Information Sec     [████████░░] 88%           │
│  A.7 - Human Resource Security             [██████████] 100%           │
│  A.8 - Asset Management                    [████████░░] 90%           │
│  A.9 - Access Control                      [██████████] 100%           │
│  A.10 - Cryptography                       [████████░░] 85%           │
│  A.11 - Physical & Environmental Sec       [██████████] 100%           │
│  A.12 - Operations Security                [████████░░] 92%           │
│  A.13 - Communications Security            [██████████] 100%           │
│  A.14 - System Acquisition & Dev           [█████████░] 95%           │
│  A.15 - Supplier Relationships            [████████░░] 88%            │
│  A.16 - Incident Management                [██████████] 100%           │
│  A.17 - Business Continuity                [████████░░] 90%           │
│  A.18 - Compliance                         [██████████] 100%           │
│                                                                         │
│  Findings This Quarter                                                 │
│  ├── Minor: Log retention period (90d vs 1y) - Remediation in progress │
│  ├── Minor: Key rotation manual - Automated rotation planned Q3        │
│  └── Info: Third-party vendor review - Scheduled                       │
│                                                                         │
└────────────────────────────────────────────────────────────────────────┘
```

### 7.2 Audit Trail

```
┌────────────────────────────────────────────────────────────────────────┐
│  RECENT AUDIT EVENTS                                                   │
├────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  Apr 27, 2026                                                          │
│  ├── 14:32  CODE_COMMIT       developer@fcis.com → feature/new-dash   │
│  ├── 14:45  PR_CREATED        developer@fcis.com → feature/new-dash   │
│  ├── 15:12  GATE_PASSED       CI/CD → Gate 1: Unit Tests               │
│  ├── 15:18  GATE_PASSED       CI/CD → Gate 2: Build                    │
│  └── 16:45  DEPLOYMENT_START  release@v2.4.0 → staging                │
│                                                                         │
│  Apr 26, 2026                                                          │
│  ├── 09:00  USER_LOGIN        admin@fcis.com → Session started         │
│  ├── 10:30  CONFIG_CHANGE     admin@fcis.com → Security settings       │
│  ├── 11:45  SECURITY_SCAN     CI/CD → SonarQube completed              │
│  └── 14:00  INCIDENT_RESOLVED tech-lead@fcis.com → P2-1234             │
│                                                                         │
│  [View Full Audit Log]                                                  │
│                                                                         │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 8. Alerting & Notifications

### 8.1 Alert Configuration

| Alert | Condition | Severity | Notification |
|-------|-----------|----------|--------------|
| Build Failure | Any build fails | P2 | Slack: #dev-alerts |
| Test Coverage Drop | < 80% | P2 | Slack: #qa-alerts |
| Security Vuln | Critical/High CVE | P1 | PagerDuty + Slack |
| Error Rate Spike | > 1% for 5 min | P1 | PagerDuty |
| Deployment Failure | Auto-rollback triggered | P1 | PagerDuty + Slack |
| Compliance Breach | Any control failure | P2 | Slack: #security |

### 8.2 Escalation Path

```
P1 Alert
├── 0 min: On-call SRE
├── 5 min: Tech Lead
├── 15 min: QA Lead
└── 30 min: CTO

P2 Alert
├── 15 min: On-call SRE
├── 30 min: Dev Lead
└── 2 hours: QA Lead
```

---

## 9. Appendix: Widget Specifications

### 9.1 KPI Card Widget

```typescript
interface KPICardWidget {
  title: string;
  value: number | string;
  unit?: string;
  target?: number;
  trend: 'up' | 'down' | 'stable';
  trendValue: number;
  status: 'healthy' | 'warning' | 'critical';
  lastUpdated: string;
}
```

### 9.2 Gauge Widget

```typescript
interface GaugeWidget {
  value: number;
  min: number;
  max: number;
  thresholds: {
    warning: number;
    critical: number;
  };
  label: string;
  unit?: string;
}
```

### 9.3 Trend Chart Widget

```typescript
interface TrendChartWidget {
  data: Array<{
    timestamp: string;
    value: number;
    metadata?: Record<string, unknown>;
  }>;
  metric: string;
  unit: string;
  targetLine?: number;
  thresholds: {
    warning?: number;
    critical?: number;
  };
}
```

### 9.4 Status Table Widget

```typescript
interface StatusTableWidget {
  headers: string[];
  rows: Array<{
    cells: string[];
    status: 'pass' | 'fail' | 'warning' | 'skipped';
    metadata?: Record<string, unknown>;
  }>;
  pagination?: {
    page: number;
    pageSize: number;
    total: number;
  };
}
```

---

**Document Control:**

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-04-27 | Quality Engineering | Initial release |

**Dashboard Implementation:**

For dashboard implementation, refer to:
- `lib/quality/risk-scoring.ts` - Risk calculation engine
- `lib/quality/audit-logger.ts` - Audit logging system
- `.github/workflows/secure-sdlc.yml` - CI/CD pipeline
- `docs/QA-GOVERNANCE-FRAMEWORK.md` - Governance policies