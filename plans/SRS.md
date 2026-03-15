# Software Requirements Specification (SRS)
# 4CORE Weekly OKR Platform

## Document Information
- **Document ID:** SRS-4CORE-OKR-2026
- **Version:** 1.0
- **Date:** March 2026
- **Project:** 4CORE Weekly OKR Platform
- **Status:** Approved for Development

---

## Table of Contents
1. Introduction
2. System Architecture
3. User Requirements
4. Functional Requirements
5. Non-Functional Requirements
6. Data Model Requirements
7. Security Requirements
8. Integration Requirements
9. Appendix

---

## 1. Introduction

### 1.1 Purpose
The Software Requirements Specification (SRS) document provides a comprehensive description of the 4CORE Weekly OKR Platform. This document serves as the authoritative reference for all development, testing, and validation activities.

### 1.2 Scope
The 4CORE Weekly OKR Platform is an enterprise performance management system that enables organizations to:
- Define and track quarterly Objectives and Key Results (OKRs)
- Submit and manage weekly activity reports
- Track financial metrics (violations, contributions, expenses)
- Monitor meeting attendance
- Leverage AI-powered insights
- Maintain audit trails and governance compliance

### 1.3 Definitions, Acronyms, and Abbreviations

| Term | Definition |
|------|------------|
| OKR | Objectives and Key Results - A goal-setting framework |
| KR | Key Result - A measurable outcome tied to an objective |
| WAT | West Africa Time (UTC+1) - Primary timezone |
| RBAC | Role-Based Access Control |
| RLS | Row Level Security (Supabase) |
| CSR | Client-Side Rendering |
| SPA | Single Page Application |

### 1.4 References
- Product Documentation: `4CORE_OKR_PRODUCT_DOCUMENTATION.md`
- Security Implementation: `plans/PRODUCTION_BUILD_SECURITY.md`
- QA Plan: `plans/QA_IMPLEMENTATION_PLAN.md`

---

## 2. System Architecture

### 2.1 Technology Stack

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                              │
├─────────────────────────────────────────────────────────────────┤
│  Framework: React 19.x with TypeScript 5.x                      │
│  Routing: React Router DOM 7.x                                  │
│  State: React Context + Hooks                                    │
│  Styling: Tailwind CSS 3.x                                      │
│  Charts: Recharts 3.x                                            │
│  Animation: Framer Motion 11.x                                   │
│  Build: Vite 6.x                                                 │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                       EDGE FUNCTIONS                             │
├─────────────────────────────────────────────────────────────────┤
│  Runtime: Deno Deploy                                            │
│  Functions:                                                      │
│    - send-email: SMTP email with password reset                  │
│    - ai-proxy: Gemini AI integration with rate limiting          │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      BACKEND SERVICES                             │
├─────────────────────────────────────────────────────────────────┤
│  Database: Supabase (PostgreSQL)                                 │
│  Auth: Supabase Auth (JWT)                                       │
│  Storage: Supabase Storage (future)                              │
│  Realtime: Supabase Realtime (future)                           │
└─────────────────────────────────────────────────────────────────┘
```

### 2.2 Application Modules

| Module | Component | Description |
|--------|----------|-------------|
| Authentication | Auth.tsx | Login, registration, password management |
| Dashboard | Dashboard.tsx | KPI overview, charts, recent activity |
| Reporting | ReportingEngine.tsx | Weekly activity submission and viewing |
| OKR Management | BusinessObjectives.tsx | KR creation and progress tracking |
| Business Units | BusinessUnits.tsx | Organizational structure management |
| User Management | UserManagement.tsx | User CRUD with RBAC |
| Finance | Financials.tsx | Violations, contributions, expenses |
| Attendance | Attendance.tsx | Meeting attendance tracking |
| AI Assistant | AIAssistant.tsx | Gemini-powered query interface |
| Settings | Settings.tsx | System configuration |

---

## 3. User Requirements

### 3.1 User Roles

| Role | Abbreviation | Permissions |
|------|--------------|-------------|
| Super Admin | SA | Full system access, user management, settings |
| Admin | ADM | User management, reports, configuration |
| Director | DIR | View all data, generate reports |
| Manager | MGR | Manage business unit, view reports |
| Viewer | VIEW | Read-only access to assigned scope |

### 3.2 User Characteristics

#### 3.2.1 Executive Leadership
- **Needs:** Real-time strategic visibility, high-level KPIs, trend analysis
- **Technical Proficiency:** Medium - prefers dashboards over forms
- **Access Frequency:** Daily, short sessions (5-15 minutes)

#### 3.2.2 Department Heads
- **Needs:** Team performance metrics, report submission, budget tracking
- **Technical Proficiency:** Medium-High
- **Access Frequency:** Daily, moderate sessions (15-30 minutes)

#### 3.2.3 Team Members
- **Needs:** Submit weekly activities, view personal performance
- **Technical Proficiency:** Variable
- **Access Frequency:** Weekly for reporting, occasional viewing

#### 3.2.4 System Administrators
- **Needs:** User provisioning, security configuration, system monitoring
- **Technical Proficiency:** High
- **Access Frequency:** As needed, often daily during deployment

### 3.3 User Interface Requirements

| Requirement | Description |
|-------------|-------------|
| UI-01 | Application must be accessible via modern browsers (Chrome, Firefox, Edge, Safari) |
| UI-02 | Interface must be responsive, supporting desktop (1024px+) and tablet (768px+) |
| UI-03 | All interactive elements must have visible focus states |
| UI-04 | Error messages must be clear and actionable |
| UI-05 | Loading states must be indicated with visual feedback |
| UI-06 | Session timeout must be configurable (default 30 minutes) |

---

## 4. Functional Requirements

### 4.1 Authentication Module (FR-AUTH)

| ID | Requirement | Priority | Validation |
|----|-------------|----------|------------|
| FR-AUTH-01 | Users must authenticate with email and password | Critical | Automated |
| FR-AUTH-02 | Passwords must meet complexity requirements (8+ chars, upper, lower, number, special) | Critical | Automated |
| FR-AUTH-03 | Passwords must be checked against breach database (HaveIBeenPwned) | High | Automated |
| FR-AUTH-04 | Account must be locked after 5 failed login attempts | Critical | Automated |
| FR-AUTH-05 | Password reset must be available via email | Critical | Automated |
| FR-AUTH-06 | Session must expire after configurable timeout | Critical | Automated |
| FR-AUTH-07 | CSRF protection must be implemented | Critical | Automated |

### 4.2 Dashboard Module (FR-DASH)

| ID | Requirement | Priority | Validation |
|----|-------------|----------|------------|
| FR-DASH-01 | Dashboard must display total company score | Critical | Visual |
| FR-DASH-02 | Dashboard must show weekly completion rate | Critical | Visual |
| FR-DASH-03 | Dashboard must display governance health indicator | High | Visual |
| FR-DASH-04 | Dashboard must show performance trend chart | High | Visual |
| FR-DASH-05 | Dashboard must filter by year and quarter | High | Automated |
| FR-DASH-06 | Dashboard must support business unit filtering | Medium | Automated |
| FR-DASH-07 | AI-generated weekly briefing must be available | Medium | Visual |

### 4.3 OKR Management Module (FR-OKR)

| ID | Requirement | Priority | Validation |
|----|-------------|----------|------------|
| FR-OKR-01 | Users must be able to create Key Results | Critical | Automated |
| FR-OKR-02 | Key Results must have title, description, owner, quarter, year | Critical | Automated |
| FR-OKR-03 | Progress must be updatable (0-100%) | Critical | Automated |
| FR-OKR-04 | Status must auto-calculate based on progress (Green/Amber/Red) | Critical | Automated |
| FR-OKR-05 | Key Results must be filterable by quarter and year | High | Automated |
| FR-OKR-06 | Progress history must be maintained | Medium | Automated |

### 4.4 Weekly Reporting Module (FR-REP)

| ID | Requirement | Priority | Validation |
|----|-------------|----------|------------|
| FR-REP-01 | Users must submit weekly activities | Critical | Automated |
| FR-REP-02 | Activities must include task list with completion status | Critical | Automated |
| FR-REP-03 | Score must auto-calculate based on task completion | Critical | Automated |
| FR-REP-04 | Governance lock must prevent late submissions | High | Automated |
| FR-REP-05 | Reports must support comments and descriptions | Medium | Automated |
| FR-REP-06 | Historical reports must be viewable | Medium | Visual |
| FR-REP-07 | Report export must be available | Medium | Manual |

### 4.5 Business Units Module (FR-BU)

| ID | Requirement | Priority | Validation |
|----|-------------|----------|------------|
| FR-BU-01 | Admins must create business units | Critical | Automated |
| FR-BU-02 | Business units must have name and head | High | Automated |
| FR-BU-03 | Users must be assigned to business units | Critical | Automated |
| FR-BU-04 | Performance matrix must show BU comparisons | Medium | Visual |

### 4.6 User Management Module (FR-USER)

| ID | Requirement | Priority | Validation |
|----|-------------|----------|------------|
| FR-USER-01 | Admins must add new users | Critical | Automated |
| FR-USER-02 | Users must have role assignment | Critical | Automated |
| FR-USER-03 | Users must have department assignment | High | Automated |
| FR-USER-04 | User status must be manageable (Active/Inactive) | High | Automated |
| FR-USER-05 | Email domain restriction must be configurable | High | Automated |

### 4.7 Finance Module (FR-FIN)

| ID | Requirement | Priority | Validation |
|----|-------------|----------|------------|
| FR-FIN-01 | System must track phone violations/fines | High | Automated |
| FR-FIN-02 | System must record contributions/donations | High | Automated |
| FR-FIN-03 | System must track expenses by category | High | Automated |
| FR-FIN-04 | Financial dashboard must show summaries | Medium | Visual |
| FR-FIN-05 | Currency must display in NGN (Nigerian Naira) | High | Visual |
| FR-FIN-06 | Payment status must be trackable | Medium | Automated |

### 4.8 Attendance Module (FR-ATT)

| ID | Requirement | Priority | Validation |
|----|-------------|----------|------------|
| FR-ATT-01 | System must record meeting attendance | High | Automated |
| FR-ATT-02 | Attendance must track participation score | Medium | Automated |
| FR-ATT-03 | Late arrivals must be tracked | Medium | Automated |
| FR-ATT-04 | Attendance summary must be available | Medium | Visual |

### 4.9 AI Assistant Module (FR-AI)

| ID | Requirement | Priority | Validation |
|----|-------------|----------|------------|
| FR-AI-01 | Users must query AI for insights | Medium | Automated |
| FR-AI-02 | AI must use Gemini API | Medium | Automated |
| FR-AI-03 | AI queries must be rate-limited (50/hour) | High | Automated |
| FR-AI-04 | AI queries must be logged for audit | High | Automated |
| FR-AI-05 | AI must provide organization-specific context | Medium | Manual |

### 4.10 Settings Module (FR-SET)

| ID | Requirement | Priority | Validation |
|----|-------------|----------|------------|
| FR-SET-01 | SMTP configuration must be available | High | Automated |
| FR-SET-02 | Governance lock schedule must be configurable | High | Automated |
| FR-SET-03 | Password policy must be configurable | High | Automated |
| FR-SET-04 | Session timeout must be configurable | High | Automated |

---

## 5. Non-Functional Requirements

### 5.1 Performance Requirements

| Requirement | Target | Measurement |
|-------------|--------|-------------|
| Page Load Time | < 3 seconds | Lighthouse |
| API Response Time | < 500ms | APM |
| Concurrent Users | 500+ | Load Testing |
| Build Size | < 500KB gzipped | Bundle Analyzer |

### 5.2 Availability Requirements

| Requirement | Target |
|-------------|--------|
| Uptime | 99.5% |
| Planned Maintenance Window | Weekly, Sunday 2-4 AM WAT |
| Recovery Time Objective | 1 hour |
| Recovery Point Objective | 15 minutes |

### 5.3 Security Requirements

| Requirement | Implementation |
|-------------|----------------|
| Data Encryption | TLS 1.2+ in transit |
| Password Storage | Supabase Auth (bcrypt) |
| Session Management | JWT with 30-minute expiry |
| RLS | All tables enabled |
| Rate Limiting | Per-user, per-IP limits |
| Audit Logging | All CRUD operations |

### 5.4 Usability Requirements

| Requirement | Target |
|-------------|--------|
| Task Completion Rate | > 95% |
| User Error Rate | < 2% |
| Help Documentation | Context-sensitive |
| Onboarding | Guided tour available |

---

## 6. Data Model Requirements

### 6.1 Core Tables

| Table | Description | Key Fields |
|-------|-------------|------------|
| profiles | User accounts | id, auth_id, email, role, department, status |
| key_results | OKR key results | id, title, quarter, year, owner_id, progress, status |
| activities | Weekly activities | id, key_result_id, owner_id, week, year, score |
| business_units | Organizational units | id, name, head_user_id |
| audit_logs | System audit trail | id, timestamp, userId, action, details |

### 6.2 Finance Tables

| Table | Description | Key Fields |
|-------|-------------|------------|
| violations | Phone fines | id, name, department, amount, date, paid |
| contributions | Donations | id, donor_name, amount, date, anonymous |
| expenses | Business expenses | id, amount, category, requestor, approver, date |
| monthly_financial_summary | Aggregated data | month, year, total_income, total_expenses |

### 6.3 Attendance Tables

| Table | Description | Key Fields |
|-------|-------------|------------|
| attendance | Meeting attendance | id, user_id, status, time_joined, participation_score |

### 6.4 Configuration Tables

| Table | Description | Key Fields |
|-------|-------------|------------|
| governance_config | System settings | smtp_*, password_*, session_*, mfa_enabled |
| rate_limits | Rate limiting | identifier, rate_type, count, window_start |
| strategic_notes | Meeting notes | id, week, year, title, content |

---

## 7. Security Requirements

### 7.1 Authentication Security

| ID | Requirement |
|----|-------------|
| SEC-AUTH-01 | Passwords must use bcrypt with cost factor 10+ |
| SEC-AUTH-02 | JWT tokens must expire within 30 minutes |
| SEC-AUTH-03 | Failed logins must trigger account lockout after 5 attempts |
| SEC-AUTH-04 | Password reset links must expire within 1 hour |

### 7.2 Authorization Security

| ID | Requirement |
|----|-------------|
| SEC-AUTHZ-01 | All database tables must have RLS enabled |
| SEC-AUTHZ-02 | Role-based access must be enforced at application level |
| SEC-AUTHZ-03 | Service role key must never be exposed to client |

### 7.3 Data Protection

| ID | Requirement |
|----|-------------|
| SEC-DATA-01 | Sensitive data must never be logged |
| SEC-DATA-02 | Email enumeration must be prevented |
| SEC-DATA-03 | HTML output must be sanitized (DOMPurify) |

### 7.4 API Security

| ID | Requirement |
|----|-------------|
| SEC-API-01 | Edge functions must validate JWT authorization |
| SEC-API-02 | Rate limiting must prevent abuse |
| SEC-API-03 | CORS must be restricted to known origins |

---

## 8. Integration Requirements

### 8.1 External Services

| Service | Purpose | Integration Method |
|---------|---------|-------------------|
| Supabase | Backend | SDK (supabase-js) |
| Gemini AI | AI Assistant | Edge Function (ai-proxy) |
| HaveIBeenPwned | Password Checking | REST API |
| SMTP (Gmail) | Email | Edge Function (send-email) |

### 8.2 Environment Variables

| Variable | Purpose | Required |
|----------|---------|----------|
| VITE_SUPABASE_URL | Supabase project URL | Yes |
| VITE_SUPABASE_ANON_KEY | Supabase anon key | Yes |
| SMTP_HOST | Email server | Yes (production) |
| SMTP_PORT | Email port | Yes (production) |
| SMTP_USER | Email username | Yes (production) |
| SMTP_PASS | Email password | Yes (production) |
| GEMINI_API_KEY | AI service | No |

---

## 9. Appendix

### 9.1 Glossary

| Term | Definition |
|------|------------|
| Objective | A qualitative goal that the organization wants to achieve |
| Key Result | A measurable outcome that indicates progress toward an objective |
| Activity | Weekly task or action reported by an employee |
| Score | Calculated value based on task completion (0-100) |
| Governance Lock | System control that prevents late report submissions |

### 9.2 Related Documents

| Document | Location |
|----------|----------|
| Product Documentation | `4CORE_OKR_PRODUCT_DOCUMENTATION.md` |
| Security Guide | `plans/PRODUCTION_BUILD_SECURITY.md` |
| QA Plan | `plans/QA_IMPLEMENTATION_PLAN.md` |
| SQL Setup | `supabase/sql/setup.sql` |
| Finance SQL | `supabase/sql/finance-tables.sql` |

---

## Document Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | March 2026 | System | Initial Release |

---

*This document is part of the 4CORE OKR Platform development documentation.*
