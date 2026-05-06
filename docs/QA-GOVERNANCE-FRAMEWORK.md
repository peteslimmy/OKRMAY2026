# 4CORE Weekly OKR - QA Governance Framework v1.0

**Document Classification:** Internal - Controlled
**Version:** 1.0
**Last Updated:** 2026-04-27
**Framework Owner:** Quality Engineering
**ISO 27001 Aligned:** Yes

---

## 1. Purpose & Scope

This framework establishes the governance structure for ensuring software quality, security, and operational excellence across the 4CORE Weekly OKR platform. It defines mandatory controls, quality gates, and risk-based release mechanisms that transform the development lifecycle from reactive debugging into proactive quality control.

**Scope:** All code changes, deployments, and releases to any environment.
**Exclusions:** None.

---

## 2. Quality Principles

### 2.1 Foundational Principles

| ID | Principle | Definition | Enforcement |
|----|-----------|------------|-------------|
| QP-01 | Zero Defect Tolerance | No broken functionality shall reach production | Mandatory testing + automated gates |
| QP-02 | Test Coverage Mandate | All features must have corresponding automated tests | Coverage thresholds enforced in CI |
| QP-03 | Verifiable Releases | Every release must be documented, reproducible, and reversible | Audit trail + rollback procedures |
| QP-04 | Security by Default | Security is embedded in development, not appended | SAST/DAST in pipeline |
| QP-05 | Risk-Aware Deployment | Release decisions are based on quantified risk scores | Automated risk scoring engine |
| QP-06 | Continuous Compliance | System maintains compliance posture at all times | Real-time monitoring |

### 2.2 Non-Negotiable Rules

1. **No bypass of quality gates** - Even under deadline pressure
2. **No secrets in code** - Environment variables or secret management only
3. **No untested code in production** - Minimum 80% coverage required
4. **No single-point-of-failure releases** - Blue/green or canary mandatory for high-risk
5. **All changes are auditable** - Every code change, deployment, and configuration change logged

---

## 3. Quality Gates

Quality gates are **mandatory checkpoints** that must pass before proceeding to the next stage. Failure at any gate blocks the release.

### 3.1 Gate 1: Code Commit

| Check | Criteria | Tool | Severity on Failure |
|-------|----------|------|---------------------|
| Linting | Zero errors | ESLint, Ruff | Block |
| Unit Tests | 100% pass rate | Vitest, Jest | Block |
| Type Check | Zero type errors | TypeScript | Block |
| Secrets Scan | No credentials detected | Gitleaks, TruffleHog | Block |
| Commit Message | Follows conventional commit | Commitlint | Warning |
| Branch Protection | PR review required | GitHub | Block |

### 3.2 Gate 2: Build Stage

| Check | Criteria | Tool | Severity on Failure |
|-------|----------|------|---------------------|
| Build Success | Exit code 0 | Vite, Webpack | Block |
| SAST Scan | No critical/high vulns | SonarQube, Snyk | Block |
| Dependency Scan | No known vulns | npm audit, Snyk | Block |
| Bundle Size | Within limits | bundle-buddy | Warning |
| Tree Shaking | No unused code | Build analysis | Warning |
| License Check | No prohibited licenses | FOSSA | Block |

### 3.3 Gate 3: Pre-Deployment

| Check | Criteria | Tool | Severity on Failure |
|-------|----------|------|---------------------|
| Playwright E2E | 100% pass rate | Playwright | Block |
| API Tests | Success rate ≥ 99% | Postman, Playwright | Block |
| Performance | Load time < 3s | Lighthouse | Warning |
| Broken Links | 0 broken internal links | Playwright | Block |
| Accessibility | WCAG AA compliance | axe-core | Warning |
| Regression Suite | 100% pass rate | Custom | Block |
| Security Scan | No critical/high vulns | OWASP ZAP | Block |

### 3.4 Gate 4: Production Release

| Check | Criteria | Authority | Severity on Failure |
|-------|----------|-----------|---------------------|
| Risk Score | Within acceptable threshold | Auto/LManual | Block if High |
| Rollback Plan | Documented and tested | Release Manager | Block |
| Change Advisory | Approved for high-risk changes | CAB | Block if High Risk |
| Stakeholder Sign-off | Required for major releases | Product Owner | Warning |
| Monitoring Active | All dashboards configured | SRE | Block |
| Incident Response | On-call team ready | SRE | Warning |

### 3.5 Gate Failure Actions

```yaml
Gate Failure Protocol:
  - Immediately notify: Dev Lead, QA Lead, Release Manager
  - Create incident ticket in tracking system
  - Block deployment to affected environment
  - Initiate root cause analysis within 4 hours
  - Require sign-off from Quality Engineering to bypass (emergency only)
```

---

## 4. Risk-Based Release Model

### 4.1 Risk Score Calculation

The Risk Score (RS) is a composite score from 0-100 calculated at pre-deployment stage.

```
Risk Score (RS) = (TF × 0.25) + (BF × 0.20) + (SV × 0.30) + (CH × 0.15) + (CP × 0.10)

Where:
  TF = Test Failure Rate (0-100)
  BF = Bug Factor (critical bugs × 10, high × 5, medium × 2)
  SV = Security Vulnerability Score (critical × 10, high × 5, medium × 2)
  CH = Code Churn (changed lines / 500, capped at 100)
  CP = Change Probability (based on file volatility, 0-100)
```

### 4.2 Risk Thresholds

| Risk Level | Score Range | Action | Auto-Deploy |
|------------|-------------|--------|-------------|
| **Low** | 0-25 | Proceed with monitoring | Yes |
| **Medium** | 26-50 | Proceed with enhanced monitoring | Conditional |
| **High** | 51-75 | Block until review | No |
| **Critical** | 76-100 | Full blocking + incident declaration | No |

### 4.3 Release Decision Matrix

| Environment | Low Risk | Medium Risk | High Risk | Critical |
|-------------|----------|-------------|-----------|----------|
| Development | Auto | Auto | Auto | Block |
| Staging | Auto | Watch | Watch | Block |
| Production | Auto | Manual Approval | Manual + CAB | Block |

---

## 5. Test Governance

### 5.1 Test Pyramid

```
                    ┌─────────────────┐
                    │      E2E        │  ← 10% of tests
                    │   (Playwright)  │     Critical user journeys
                   ─────────────────────
                  │   Integration     │  ← 30% of tests
                  │   (API + DB)      │     API contracts, data flow
                 ───────────────────────
                │      Unit          │  ← 60% of tests
                │   (Vitest/Jest)    │     Business logic
               ─────────────────────────
```

### 5.2 Coverage Requirements

| Layer | Minimum Coverage | Enforcement |
|-------|-----------------|-------------|
| Unit Tests | 80% | Gate blocks if below |
| Integration Tests | 70% | Gate blocks if below |
| E2E Tests | 50% (critical paths) | Gate blocks if below |
| Overall | 80% | Required for release |

### 5.3 Test Categories

| Category | Purpose | Run Frequency | SLAs |
|----------|---------|---------------|------|
| Unit | Logic validation | Every commit | < 5 min |
| Integration | API + Database | Every PR | < 10 min |
| E2E (Playwright) | Full flows | Every deployment | < 30 min |
| Security | Vuln detection | Every release | < 15 min |
| Performance | Load testing | Weekly + release | < 20 min |
| Regression | Full suite | Nightly | < 60 min |

### 5.4 Test Requirements for New Features

1. **Unit tests** for all business logic
2. **Integration tests** for all API endpoints
3. **E2E tests** for user journeys
4. **Accessibility tests** for all UI components
5. **Performance tests** for critical flows
6. **Security review** for data handling

---

## 6. Secure SDLC Controls

### 6.1 SDLC Phase Mapping to ISO 27001

| Phase | ISO 27001 Control | Implementation |
|-------|------------------|----------------|
| Planning | A.14.1.1 Security Requirements | Threat modeling, security stories |
| Development | A.14.2.1 Secure Development | Secure coding standards, SAST |
| Testing | A.14.2.8 Security Testing | DAST, penetration testing |
| Deployment | A.14.1.2 Change Management | Environment segregation, approval |
| Operations | A.12.4.1 Event Logging | Comprehensive audit logging |
| Operations | A.16.1.1 Incident Management | Incident response plan |

### 6.2 Security Controls by Phase

**Planning:**
- Security requirements documentation
- Threat modeling (STRIDE)
- Risk assessment
- Security architecture review

**Development:**
- Secure coding standards (OWASP Top 10)
- Secrets management (no hardcoding)
- Code review with security focus
- Static Application Security Testing (SAST)
- Dependency vulnerability scanning

**Testing:**
- Dynamic Application Security Testing (DAST)
- Interactive Application Security Testing (IAST)
- Vulnerability scanning
- Security unit tests

**Deployment:**
- Environment segregation (dev/staging/prod)
- Access control (least privilege)
- Configuration management
- Deployment approval workflow
- Rollback procedures tested

**Operations:**
- Real-time monitoring
- Security event logging
- Incident response plan
- Regular security assessments
- Compliance reporting

---

## 7. Audit & Compliance Layer

### 7.1 Audit Log Requirements

All critical events must be logged with:
- Timestamp (UTC)
- Actor (user/system)
- Action performed
- Resource affected
- Outcome (success/failure)
- IP/Source context

### 7.2 Logged Events

| Category | Events | Retention |
|----------|--------|-----------|
| Code Changes | Commits, PRs, merges | 7 years |
| Deployments | Environment, version, actor | 7 years |
| Test Results | Pass/fail, coverage, metrics | 3 years |
| Security | Auth attempts, vulns, fixes | 7 years |
| User Actions | Login, logout, data access | 1 year |
| Configuration | Changes to settings | 3 years |
| Incidents | Created, updated, resolved | 7 years |

### 7.3 Compliance Mapping

| ISO 27001 Control | Requirement | Implementation |
|-------------------|-------------|----------------|
| A.12.4.1 | Event Logging | Audit service with immutable logs |
| A.12.4.2 | Clock Synchronization | NTP across all systems |
| A.12.4.3 | Administrator Logs | Separate privileged access logs |
| A.12.4.4 | Clock Synchronization | UTC timestamps enforced |
| A.14.1.1 | Security Requirements | Security stories in sprint planning |
| A.14.2.1 | Secure Development | SAST/DAST in CI/CD |
| A.14.2.2 | Change Management | PR approval workflow |
| A.14.2.5 | Secure Metrics | Quality dashboard |
| A.16.1.1 | Incident Management | Ticketing + incident response |
| A.16.1.4 | Assessment of Incidents | Post-incident reviews |

---

## 8. Failure Handling & Rollback

### 8.1 Automatic Rollback Triggers

| Trigger | Threshold | Action |
|---------|-----------|--------|
| Health Check Failure | 3 consecutive fails | Auto-rollback |
| Error Rate Spike | > 5% errors in 1 min | Auto-rollback |
| Latency Spike | P99 > 5s for 2 min | Alert + conditional rollback |
| Security Vuln Detection | Critical/high CVE found | Immediate rollback |
| Deployment Failure | Non-zero exit code | Auto-rollback |

### 8.2 Rollback Procedures

**Blue/Green Deployment:**
1. Traffic split: 100% blue (old) → 10% green (new)
2. Monitor for 10 minutes
3. If healthy: shift 100% to green
4. If unhealthy: revert 100% to blue

**Canary Deployment:**
1. Deploy to 5% of users
2. Monitor metrics for 30 minutes
3. If healthy: expand to 25%
4. If unhealthy: immediate rollback

### 8.3 Incident Classification

| Severity | Definition | Response Time | Escalation |
|----------|------------|---------------|------------|
| P1 - Critical | Production down, data loss | 15 min | Immediate |
| P2 - High | Major feature broken, security vuln | 1 hour | 30 min |
| P3 - Medium | Feature degraded, workaround exists | 4 hours | 2 hours |
| P4 - Low | Minor issue, no business impact | 24 hours | Next business day |

---

## 9. Quality Metrics & SLAs

### 9.1 Quality KPIs

| Metric | Target | Measurement |
|--------|--------|-------------|
| Test Pass Rate | ≥ 99% | Per deployment |
| Build Success Rate | ≥ 98% | Weekly |
| Release Success Rate | ≥ 95% | Monthly |
| Security Vulns (Open) | 0 critical, < 5 high | Weekly |
| Mean Time to Recovery | < 30 min | Per incident |
| Deployment Frequency | Daily (dev), Weekly (prod) | Per environment |
| Lead Time for Changes | < 2 hours | PR merge to deploy |

### 9.2 Security KPIs

| Metric | Target |
|--------|--------|
| SAST Findings (Critical/High) | 0 at release |
| DAST Findings (Critical/High) | 0 at release |
| Mean Time to Patch (Critical Vuln) | < 24 hours |
| Security Test Coverage | 100% |
| Failed Auth Attempts (Blocked) | Logged 100% |

---

## 10. Governance Roles & Responsibilities

### 10.1 Roles

| Role | Responsibilities | Authority |
|------|------------------|-----------|
| Quality Engineering Lead | Framework maintenance, gate oversight | Final escalation |
| Security Champion | Security controls, vuln management | Block on security |
| Release Manager | Deployment coordination, risk decisions | Approve releases |
| SRE | Monitoring, incident response | Trigger rollbacks |
| Developer | Code quality, test coverage | Self-certify gates 1-2 |

### 10.2 Approval Authority

| Action | Developer | Tech Lead | QA Lead | Release Manager | CAB |
|---------|-----------|-----------|---------|-----------------|-----|
| Code merge | Yes | Yes | - | - | - |
| Stage deploy (Low risk) | - | Yes | - | - | - |
| Stage deploy (High risk) | - | Yes | Yes | Yes | - |
| Prod deploy (Low risk) | - | Yes | - | Yes | - |
| Prod deploy (High risk) | - | Yes | Yes | Yes | Yes |
| Emergency bypass | - | - | - | Yes | - |

---

## 11. Framework Maintenance

### 11.1 Review Schedule

| Artifact | Review Frequency | Owner |
|----------|------------------|-------|
| Quality Gates | Quarterly | Quality Engineering |
| Risk Scoring | Quarterly | Risk Management |
| Test Policies | Semi-annually | QA Lead |
| Security Controls | Annually | Security Champion |
| Compliance Mapping | Annually | Compliance |

### 11.2 Continuous Improvement

- Monthly metrics review
- Quarterly framework audit
- Post-incident reviews within 48 hours
- Feedback loop from deployment retrospectives

---

## 12. Appendices

### Appendix A: Test Coverage Standards

### Appendix B: Security Vulnerability Severity Matrix

### Appendix C: Rollback Runbook

### Appendix D: Incident Response Playbook

### Appendix E: Compliance Evidence Checklist

---

**Document Control:**

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-04-27 | Quality Engineering | Initial release |

**Approval:**

| Role | Name | Signature | Date |
|------|------|-----------|------|
| Quality Lead | | | |
| Security Champion | | | |
| Release Manager | | | |