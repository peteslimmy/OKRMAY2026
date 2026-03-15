# =============================================================================
# 4CORE WEEKLY OKR - PRODUCT DOCUMENTATION
# =============================================================================
# Generated: March 2026
# =============================================================================

# =============================================================================
# 1. PRODUCT REQUIREMENTS DOCUMENT (PRD)
# =============================================================================

## 1.1 Product Overview

4CORE Weekly OKR is a comprehensive enterprise performance management platform designed to help organizations track, manage, and execute their quarterly Objectives and Key Results (OKRs) through weekly activity reporting, financial tracking, and AI-powered insights.

The platform provides a unified governance system that enables organizations to:
- Define and monitor quarterly Key Results with progress tracking
- Report weekly activities with automated scoring
- Manage business units and organizational structure
- Track financial metrics (violations, contributions, expenses)
- Monitor meeting attendance
- Leverage AI for strategic insights
- Maintain audit trails and data integrity

---

## 1.2 Vision Statement

To empower organizations with real-time visibility into their strategic objectives, enabling data-driven decision-making through unified performance tracking, automated governance workflows, and AI-enhanced analytics.

---

## 1.3 Business Objectives

| Objective | Description | Success Criteria |
|-----------|-------------|------------------|
| BO-1 | Enable organizations to track quarterly OKRs with real-time progress visibility | 100% of defined KRs visible on dashboard with live status updates |
| BO-2 | Standardize weekly performance reporting across all business units | 95% compliance rate for weekly submissions |
| BO-3 | Provide financial transparency and control | Complete financial tracking with audit trails |
| BO-4 | Deliver AI-powered strategic insights | AI assistant responds to 100% of valid governance queries |
| BO-5 | Ensure data integrity and compliance | Automated integrity checks with <24hr issue resolution |
| BO-6 | Reduce administrative overhead | 50% reduction in manual reporting effort |

---

## 1.4 Problem Statement

Organizations currently struggle with:
- Disconnected performance tracking across multiple spreadsheets and tools
- Lack of real-time visibility into OKR progress
- Manual and error-prone weekly reporting processes
- Fragmented financial tracking without unified governance
- Limited accessibility of strategic data for decision-makers
- Compliance and audit challenges due to lack of centralized logging

---

## 1.5 Target Market and Users

### Target Market
- Mid-to-large organizations (50-5000 employees)
- Organizations with distributed teams
- Companies adopting OKR methodology
- Educational institutions and non-profits

### Primary Users

| User Class | Description | Count (Typical) |
|------------|-------------|-----------------|
| Executive Leadership | CEO, Directors who need strategic overview | 2-10 |
| Department Heads | Managers overseeing business units | 10-50 |
| Team Members | Individual contributors reporting weekly activities | 50-500 |
| Administrators | IT/HR managing users and system configuration | 2-10 |
| Finance Teams | Managing financial tracking and reporting | 2-20 |

---

## 1.6 User Personas

### Persona 1: Corporate Director
- Name: Sarah Mitchell
- Role: Corporate Director, Finance
- Goals: View organizational health at a glance, track quarterly OKR progress, ensure compliance
- Pain Points: Manual data aggregation, lack of real-time insights
- Success Metric: Can access complete OKR status within 30 seconds

### Persona 2: Business Unit Head
- Name: James Okafor
- Role: Head of IDEC Business Unit
- Goals: Track team performance, submit weekly reports, manage unit budget
- Pain Points: Complex reporting requirements, difficulty tracking multiple reports
- Success Metric: Submit weekly report in <5 minutes

### Persona 3: System Administrator
- Name: Chidi Adebayo
- Role: IT Administrator
- Goals: Manage user access, configure system settings, ensure security
- Pain Points: Manual user provisioning, security compliance
- Success Metric: Onboard new user in <3 minutes

### Persona 4: Team Member
- Name: Grace Johnson
- Role: Marketing Associate
- Goals: Complete weekly activity reports, view personal performance
- Pain Points: Time-consuming form filling, unclear requirements
- Success Metric: Submit weekly activities in <3 minutes

---

## 1.7 User Journeys

### Journey 1: Director Views Organizational Health
1. Login to dashboard
2. View KPI cards (total score, completion rate, governance health)
3. Filter by year/quarter/business unit
4. Drill into specific KR details
5. Export reports as needed

### Journey 2: Unit Head Submits Weekly Report
1. Navigate to Weekly Reporting
2. Select current week and business unit
3. Add activities with task completion status
4. Add comments and descriptions
5. System auto-calculates score
6. Submit report (governance lock permitting)

### Journey 3: Administrator Onboards New User
1. Navigate to User Directory
2. Click "Add User"
3. Enter user details (name, email, role, department)
4. System sends welcome email with login instructions
5. New user appears in directory

### Journey 4: User Queries AI for Insights
1. Click AI Assistant button
2. Ask question about OKR performance
3. AI retrieves relevant data
4. Receive contextual response
5. Query logged for audit

---

## 1.8 Product Scope

### In Scope (Phase 1)
- OKR dashboard with KPI visualization
- Quarterly Key Results management
- Weekly activity reporting
- Business unit management
- User directory with role-based access
- Financial tracking (violations, contributions, expenses)
- Attendance tracking
- Basic AI assistant
- Audit logging

### Out of Scope (Initial Release)
- Mobile native applications
- Third-party integrations (Slack, Teams)
- Advanced analytics/reporting
- Custom branding (Phase 2)
- Multi-organization support (Phase 3)

---

## 1.9 Key Features

| Feature ID | Feature Name | Description | Priority |
|------------|--------------|-------------|----------|
| F-01 | Executive Dashboard | Real-time KPIs, performance charts, trend analysis | Critical |
| F-02 | KR Management | Create, update, track quarterly Key Results | Critical |
| F-03 | Weekly Reporting | Activity submission with task tracking and scoring | Critical |
| F-04 | Business Unit Management | CRUD operations for organizational units | High |
| F-05 | User Directory | User management with role-based permissions | High |
| F-06 | Financial Dashboard | Violations, contributions, expenses tracking | High |
| F-07 | Attendance Tracking | Meeting attendance with engagement scoring | Medium |
| F-08 | AI Assistant | Gemini-powered query interface | Medium |
| F-09 | Governance Hub | System configuration, SMTP, lock schedules | High |
| F-10 | Integrity Checker | Data validation and audit tools | Medium |
| F-11 | Strategic Notes | Session notes and documentation | Medium |
| F-12 | Audit Logs | Comprehensive activity logging | High |

---

## 1.10 Competitive Differentiation

| Competitor | Limitation | 4CORE Advantage |
|------------|------------|-----------------|
| Excel/Sheets | Manual, error-prone, no real-time collaboration | Real-time cloud platform with automated scoring |
| Asana/Jira | Project-focused, not OKR-native | Purpose-built OKR methodology support |
| Weekdone | Limited financial tracking | Integrated financial and attendance modules |

### 4CORE Unique Value Propositions:
1. Integrated weekly OKR + financial + attendance tracking
2. AI-powered insights with organization-specific context
3. Governance lock system for reporting deadlines
4. Role simulation for training/demos
5. Nigerian Naira (NGN) currency support

---

## 1.11 Success Metrics (KPIs)

| Metric | Target | Measurement |
|--------|--------|-------------|
| Weekly Report Completion Rate | ≥95% | (Submitted Reports / Expected Reports) × 100 |
| System Uptime | ≥99.5% | (Total Available Time - Downtime) / Total Time |
| User Adoption Rate | ≥80% | (Active Users / Total Licensed Users) × 100 |
| Average Report Submission Time | ≤5 min | Time from page load to submission |
| AI Query Success Rate | ≥95% | Successful Responses / Total Queries |
| Data Integrity Score | 100% | Records passing validation checks |
| Audit Log Completeness | 100% | All actions logged with required fields |
| Support Ticket Resolution | <24 hrs | Average time to resolve |

---

## 1.12 Monetization Strategy

### Revenue Model: SaaS Subscription

| Tier | Price (Monthly) | Features |
|------|-----------------|----------|
| Starter | $49/month | Up to 25 users, core OKR features |
| Professional | $149/month | Up to 100 users, AI assistant, all features |
| Enterprise | Custom | Unlimited users, dedicated support, custom integrations |

### Additional Revenue Streams
- Implementation services (setup, training)
- Custom development
- Consulting for OKR methodology adoption

---

## 1.13 Product Roadmap

### Phase 1: Foundation (Months 1-3)
- Core OKR dashboard and KR management
- Weekly activity reporting
- User management with RBAC
- Business unit management
- Basic audit logging

### Phase 2: Enhancement (Months 4-6)
- Financial tracking module expansion
- Advanced AI capabilities
- Custom branding options
- Mobile-responsive improvements
- Email notifications integration

### Phase 3: Scale (Months 7-12)
- Multi-organization support
- Advanced analytics dashboard
- Third-party integrations (Slack, Teams)
- API access for custom integrations
- White-label options

---

## 1.14 Risks and Mitigation

| Risk | Impact | Probability | Mitigation Strategy |
|------|--------|-------------|---------------------|
| Low user adoption | High | Medium | Comprehensive training, executive sponsorship |
| Data security breach | Critical | Low | Regular security audits, encryption, RLS policies |
| AI service disruption | Medium | Medium | Fallback responses, manual override capability |
| Database performance | Medium | Low | Query optimization, caching, indexing |
| Regulatory compliance changes | Medium | Low | Modular design, regular compliance reviews |
| Vendor lock-in (Supabase) | Medium | Low | Data export capabilities, standard SQL |

---

## 1.15 Regulatory or Compliance Considerations

### Data Privacy
- GDPR compliance for EU users
- Data residency options
- User consent management

### Security Standards
- SOC 2 Type II certification (target)
- ISO 27001 alignment
- OWASP Top 10 mitigation

### Financial Compliance
- Audit trail requirements
- Data retention policies
- Financial record accuracy

### Accessibility
- WCAG 2.1 Level AA compliance
- Screen reader compatibility


# =============================================================================
# 2. SOFTWARE REQUIREMENTS SPECIFICATION (SRS)
# =============================================================================

## 2.1 Introduction

### 2.1.1 Purpose

This Software Requirements Specification (SRS) document provides a comprehensive description of the 4CORE Weekly OKR system. It defines the functional and non-functional requirements, system architecture, external interfaces, and design constraints necessary for the development team to implement the system.

### 2.1.2 Scope

The 4CORE Weekly OKR platform is a cloud-based enterprise performance management system that enables organizations to:
- Define and track quarterly Objectives and Key Results
- Submit and manage weekly activity reports
- Manage organizational structure (business units)
- Track financial metrics
- Monitor attendance
- Leverage AI for strategic insights
- Maintain comprehensive audit trails

### 2.1.3 Definitions

| Term | Definition |
|------|------------|
| OKR | Objectives and Key Results - a goal-setting framework |
| KR | Key Result - a measurable outcome supporting an Objective |
| Activity | Weekly task or action submitted by a user |
| Business Unit | Organizational subunit (department, team, division) |
| Governance Lock | System-enforced reporting deadline restrictions |
| RBAC | Role-Based Access Control |
| RLS | Row Level Security (database security) |
| WAT | West Africa Time (timezone) |

### 2.1.4 References

- IEEE 830-1998: Recommended Practice for Software Requirements Specifications
- ISO/IEC 25010: Systems and software Quality Requirements and Evaluation (SQuaRE)
- OWASP Top 10 (2021)
- GDPR (General Data Protection Regulation)
- WCAG 2.1 Guidelines

---

## 2.2 Overall System Description

### 2.2.1 Product Perspective

The 4CORE system is a client-server web application with:
- Client: Single Page Application (SPA) running in modern browsers
- Server: Supabase backend (PostgreSQL + Edge Functions + Auth)
- AI Service: Google Gemini API via proxy edge function

### 2.2.2 System Architecture

```
CLIENT LAYER
  - Dashboard
  - Reporting
  - Financials
  - AI Chat
        │
        ▼
API GATEWAY LAYER
  - Supabase Edge Functions
    • AI Proxy
    • Send Email
    • Rate Limit
        │
        ▼
DATA LAYER
  - PostgreSQL
  - Auth
  - Storage
  - RLS
```

### 2.2.3 User Classes

| Class | Description | Access Level |
|-------|-------------|--------------|
| SuperAdmin | Full system access | All features, all data |
| Admin | Administrative functions | User management, settings, all reporting |
| Director | Executive access | Strategic views, all units |
| Manager | Department oversight | Own department data |
| Viewer | Read-only access | Dashboard and personal reports |

### 2.2.4 Operating Environment

| Component | Specification |
|-----------|---------------|
| Browser Support | Chrome 90+, Firefox 88+, Safari 14+, Edge 90+ |
| Frontend | React 19, Vite 6, TypeScript 5.8 |
| Backend | Supabase (PostgreSQL 15) |
| AI | Google Gemini 2.0 Flash |
| Timezone | UTC (display in WAT) |
| Currency | NGN (Nigerian Naira) |

### 2.2.5 Design Constraints

1. Technology Stack: React + Supabase (non-negotiable)
2. Browser Support: Last 2 major versions of Chrome, Firefox, Safari, Edge
3. Response Time: Dashboard load <3 seconds, API responses <500ms
4. Accessibility: WCAG 2.1 Level AA
5. Security: All data encrypted at rest and in transit

### 2.2.6 Assumptions

1. Users have reliable internet connectivity
2. Organization uses email for communication
3. Supabase services remain available
4. Google Gemini API remains accessible
5. Users are trained on OKR methodology

---

## 2.3 System Features

| Feature ID | Feature | Description |
|------------|---------|-------------|
| FE-01 | User Authentication | Email/password login with role assignment |
| FE-02 | Dashboard | Real-time KPIs, charts, performance overview |
| FE-03 | KR Management | CRUD operations for Key Results |
| FE-04 | Weekly Reporting | Activity submission with task tracking |
| FE-05 | Scoring System | Automated score calculation with penalties |
| FE-06 | Business Units | Organization structure management |
| FE-07 | User Directory | User CRUD with role management |
| FE-08 | Financial Tracking | Violations, contributions, expenses |
| FE-09 | Attendance | Meeting attendance recording |
| FE-10 | AI Assistant | Gemini-powered query system |
| FE-11 | Audit Logging | Comprehensive action tracking |
| FE-12 | Governance Config | System settings, SMTP, locks |
| FE-13 | Integrity Checker | Data validation tools |
| FE-14 | Strategic Notes | Session documentation |

---

## 2.4 External Interface Requirements

### 2.4.1 User Interface

#### Layout Structure
- Header: Unified filter bar (Year, Business Unit, Period)
- Sidebar: Collapsible navigation with role-based items
- Main Content: Module-specific content area
- Footer: Minimal (copyright, version)

#### Visual Design

| Element | Specification |
|---------|---------------|
| Color Palette | Primary: #6366f1 (Indigo), Background: #f8fafc |
| Typography | Inter font, 13-14px base size |
| Spacing | 8px grid system |
| Border Radius | 8px (cards), 4px (buttons), 12px (modals) |
| Shadows | Subtle elevation (0 2px 15px rgba(0,0,0,0.02)) |

#### Components

| Component | States | Behavior |
|-----------|--------|----------|
| Buttons | Default, Hover, Active, Disabled | 200ms transition |
| Inputs | Default, Focus, Error, Disabled | Focus ring on interaction |
| Cards | Default, Hover | Elevation on hover |
| Tables | Default, Selected Row | Row highlight |
| Modals | Open, Closing | Fade + scale animation |

### 2.4.2 Hardware Interfaces

No specific hardware requirements. System runs in web browsers on standard computing devices.

### 2.4.3 Software Interfaces

| Interface | Technology | Purpose |
|-----------|------------|---------|
| Database | PostgreSQL | Data persistence |
| Authentication | Supabase Auth | User authentication |
| AI Service | Google Gemini API | AI assistant functionality |
| Email Service | SMTP | Notification delivery |

### 2.4.4 API Integrations

| Integration | Endpoint | Data Format | Purpose |
|-------------|----------|-------------|---------|
| Supabase DB | REST/PostgREST | JSON | CRUD operations |
| AI Proxy | /functions/v1/ai-proxy | JSON | Gemini API proxy |
| Send Email | /functions/v1/send-email | JSON | SMTP relay |

### 2.4.5 Communication Interfaces

| Protocol | Port | Purpose |
|----------|------|---------|
| HTTPS | 443 | All client-server communication |
| WebSocket | 443 | Real-time updates (Supabase Realtime) |

---

## 2.5 Non-Functional Requirements

### 2.5.1 Performance

| Requirement | Target |
|-------------|--------|
| Page Load Time | <3 seconds |
| API Response Time | <500ms (p95) |
| Time to Interactive | <5 seconds |
| Lighthouse Score | >80 |

### 2.5.2 Scalability

| Requirement | Target |
|-------------|--------|
| Concurrent Users | 500+ |
| Data Volume | 10,000+ activities |
| Database Records | 100,000+ |

### 2.5.3 Security

| Requirement | Implementation |
|-------------|----------------|
| Authentication | Supabase Auth with email/password |
| Authorization | RBAC + RLS policies |
| Encryption | TLS 1.3, AES-256 at rest |
| SQL Injection | Parameterized queries (PostgREST) |
| XSS Prevention | React default + DOMPurify |
| CSRF | Supabase built-in |

### 2.5.4 Availability

| Requirement | Target |
|-------------|--------|
| Uptime | 99.5% |
| Recovery Time | <1 hour |
| Backup Frequency | Daily |

### 2.5.5 Reliability

| Requirement | Target |
|-------------|--------|
| Data Durability | 99.999999999% |
| Error Rate | <0.1% |
| Bug Escape Rate | <5% |

### 2.5.6 Maintainability

| Requirement | Target |
|-------------|--------|
| Code Coverage | >70% |
| Cyclomatic Complexity | <15 |
| Documentation | JSDoc/TSDoc |

### 2.5.7 Usability

| Requirement | Target |
|-------------|--------|
| Accessibility | WCAG 2.1 AA |
| Learnability | First action <2 min |
| Error Prevention | Confirmation for destructive actions |

### 2.5.8 Compliance

| Standard | Requirement |
|----------|-------------|
| GDPR | Data privacy for EU users |
| SOC 2 | Security controls (planned) |
| WCAG 2.1 | Accessibility AA |

---

## 2.6 Data Requirements

### 2.6.1 Data Model

#### Core Tables
- profiles: User accounts and profiles
- business_units: Organizational units
- key_results: Quarterly OKRs
- activities: Weekly activity reports
- strategic_notes: Session notes
- audit_logs: Action logging
- violations: Phone fines
- contributions: Donations
- expenses: Financial expenses
- attendance: Meeting attendance

### 2.6.2 Database Structure

| Table | Records (Est.) | Size (Est.) | Retention |
|-------|---------------|-------------|-----------|
| profiles | 1,000 | 1 MB | Active + 1 year |
| business_units | 50 | 10 KB | Indefinite |
| key_results | 500 | 100 KB | 3 years |
| activities | 50,000 | 50 MB | 2 years |
| strategic_notes | 1,000 | 10 MB | 2 years |
| audit_logs | 100,000 | 100 MB | 1 year |
| violations | 5,000 | 5 MB | 3 years |
| contributions | 5,000 | 5 MB | 3 years |
| expenses | 10,000 | 10 MB | 3 years |
| attendance | 20,000 | 20 MB | 1 year |

### 2.6.3 Data Retention

| Data Type | Retention Period | Disposal Method |
|-----------|-------------------|------------------|
| Audit Logs | 1 year | Automated purge |
| Activities | 2 years | Archive to cold storage |
| User Data | Active + 1 year | Anonymize |
| Financial | 3 years | Secure deletion |

---

## 2.7 Security Architecture

### 2.7.1 Authentication

| Feature | Implementation |
|---------|----------------|
| Method | Email/Password via Supabase Auth |
| Password Policy | Min 8 chars, upper, lower, number, special |
| Session Timeout | 30 minutes (configurable) |
| Max Login Attempts | 5 (15-minute lockout) |
| Password Reset | Email-based with token |

### 2.7.2 Authorization Levels

```
SUPERADMIN: All permissions + System configuration
ADMIN: User management + Settings + All reporting
DIRECTOR: Strategic views + All units + Audit logs
MANAGER: Department view + Own unit reports
VIEWER: Dashboard + Personal reports only
```

### 2.7.3 Encryption

| Data State | Encryption |
|------------|------------|
| In Transit | TLS 1.3 |
| At Rest | AES-256 (Supabase) |
| Backups | Encrypted |

### 2.7.4 Audit Logging

| Event Type | Logged Fields |
|------------|---------------|
| Authentication | User, timestamp, IP, result |
| Data Changes | User, timestamp, table, old/new values |
| System Events | Timestamp, event type, details |
| AI Queries | User, timestamp, query, response |

### 2.7.5 Role-Based Access Control

| Permission | SuperAdmin | Admin | Director | Manager | Viewer |
|------------|------------|-------|----------|---------|--------|
| View Dashboard | ✓ | ✓ | ✓ | ✓ | ✓ |
| Manage KRs | ✓ | ✓ | ✓ | ✗ | ✗ |
| Submit Reports | ✓ | ✓ | ✓ | ✓ | ✓ |
| View All Units | ✓ | ✓ | ✓ | ✗ | ✗ |
| Manage Users | ✓ | ✓ | ✗ | ✗ | ✗ |
| View Audit Logs | ✓ | ✓ | ✗ | ✗ | ✗ |
| Configure System | ✓ | ✓ | ✗ | ✗ | ✗ |
| View Financials | ✓ | ✓ | ✓ | ✓ | ✗ |

---

## 2.8 System Workflows

### Workflow 1: User Authentication
```
User → Login Page → Enter Credentials → Validate → 
Success → Create Session → Redirect to Dashboard
         Failure → Show Error → Retry (max 5)
```

### Workflow 2: Weekly Report Submission
```
User → Weekly Reporting → Select Week/BU → 
Add Activities → Add Tasks → System Calculates Score →
Governance Check → (If Locked: Show Warning) →
Submit → Log to Audit → Show Confirmation
```

### Workflow 3: KR Progress Update
```
Admin/Director → KR Management → Select KR →
Update Progress (0-100%) → Update Status (Green/Amber/Red) →
Save → Log to Audit → Update Dashboard
```

---

## 2.9 Error Handling

| Error Type | User Message | Action |
|------------|---------------|--------|
| Auth Failed | "Invalid credentials" | Show login retry |
| Session Expired | "Session expired, please login" | Redirect to login |
| Network Error | "Connection lost, retrying..." | Auto-retry 3x |
| Permission Denied | "Access restricted" | Show access denied page |
| Validation Error | Specific field error | Highlight field |
| Server Error | "System error, contact support" | Log error, show message |

---

## 2.10 Disaster Recovery and Backup

### Backup Strategy

| Type | Frequency | Retention |
|------|-----------|-----------|
| Database | Daily | 30 days |
| File Storage | Daily | 30 days |
| Config | On change | Versioned |

### Recovery Procedures

| Scenario | RTO | RPO |
|----------|-----|-----|
| Database failure | 1 hour | 24 hours |
| Application failure | 30 minutes | N/A |
| Region outage | 4 hours | 24 hours |

### Testing
- Monthly DR drills
- Quarterly full restoration test


# =============================================================================
# 3. FUNCTIONAL REQUIREMENTS DOCUMENT (FRD)
# =============================================================================

## 3.1 Functional Overview

The 4CORE Weekly OKR system provides comprehensive OKR management capabilities through the following functional modules:

1. Authentication Module - User login, registration, password management
2. Dashboard Module - KPI visualization, performance overview
3. OKR Management Module - Key Results CRUD, progress tracking
4. Weekly Reporting Module - Activity submission, task tracking, scoring
5. Business Unit Module - Organizational structure management
6. User Management Module - User CRUD, role assignment
7. Financial Module - Violations, contributions, expenses tracking
8. Attendance Module - Meeting attendance recording
9. AI Assistant Module - Gemini-powered query system
10. Governance Module - System configuration, SMTP, locks
11. Audit Module - Comprehensive logging and integrity checking

---

## 3.2 Module Breakdown

### 3.2.1 Authentication Module

| Attribute | Description |
|-----------|-------------|
| Module Name | Authentication |
| Description | Handles user authentication, session management, and password policies |
| Actors | All users (SuperAdmin, Admin, Director, Manager, Viewer) |

**Inputs:**
- Email address
- Password
- Session token (for persistence)

**Processing Logic:**
1. Validate email format and domain (if domain restriction enabled)
2. Verify password meets complexity requirements
3. Authenticate against Supabase Auth
4. Create session with timeout
5. Log authentication attempt

**Outputs:**
- Session token
- User profile data
- Redirect URL

**Dependencies:**
- Supabase Auth
- Governance Config (domain restrictions)

**Edge Cases:**
- Invalid email format → Show validation error
- Wrong password → Increment attempt counter, show error
- Account locked → Show lockout message with duration
- Domain not allowed → Reject registration/login

**Error Handling:**
- Display user-friendly error messages
- Log all failed attempts
- Auto-logout on session expiry

---

### 3.2.2 Dashboard Module

| Attribute | Description |
|-----------|-------------|
| Module Name | Executive Dashboard |
| Description | Provides real-time KPIs, performance charts, and organizational health metrics |
| Actors | All authenticated users (filtered by role) |

**Inputs:**
- Selected year
- Selected business unit
- Selected week/period
- User role

**Processing Logic:**
1. Fetch aggregated metrics from database
2. Calculate KPIs (total score, completion rate, governance health)
3. Generate chart data for visualizations
4. Filter data based on user role and selected filters

**Outputs:**
- KPI cards (Total Score, Completion Rate, Governance Health)
- Performance trend charts
- Recent activities list
- BU performance matrix

**Dependencies:**
- Activities table
- Key Results table
- Business Units table
- Audit Logs

**Edge Cases:**
- No data for selected period → Show empty state
- Partial data → Show available data with indicator
- Large dataset → Paginate/aggregate

---

### 3.2.3 OKR Management Module

| Attribute | Description |
|-----------|-------------|
| Module Name | Key Results Management |
| Description | CRUD operations for quarterly Key Results with progress tracking |
| Actors | SuperAdmin, Admin, Director |

**Inputs:**
- KR title, description
- Quarter (Q1-Q4)
- Year
- Label (KR1, KR2, etc.)
- Owner
- Target progress (0-100%)

**Processing Logic:**
1. Validate KR data
2. Check for duplicate KRs (same year/quarter/label)
3. Calculate status based on progress:
   - ≥70%: Green
   - 40-69%: Amber
   - <40%: Red
4. Save to database
5. Log action to audit

**Outputs:**
- KR list with status indicators
- Progress bar visualization
- Status summary

**Dependencies:**
- Key Results table
- User profiles (for owners)

**Edge Cases:**
- Duplicate KR → Show warning, allow override
- Future quarter KR → Allow creation, mark as planned
- Past quarter KR → Allow viewing, restrict editing

---

### 3.2.4 Weekly Reporting Module

| Attribute | Description |
|-----------|-------------|
| Module Name | Weekly Activity Reporting |
| Description | Submit weekly activities with task tracking and automated scoring |
| Actors | All users |

**Inputs:**
- Week number
- Year
- Business unit
- Activities (title, tasks, comments)

**Processing Logic:**
1. Check governance lock status for target week
2. If locked (PARTIAL/LOCKED), apply scoring penalty:
   - PARTIAL: -5 points
   - LOCKED: -15 points
3. Calculate completion score based on tasks
4. Save activity with calculated score
5. Log submission

**Scoring Formula:**
Score = (Completed Tasks / Total Tasks) × 100 - Penalty
Penalty = 0 (OPEN), 5 (PARTIAL), 15 (LOCKED)

**Governance Lock Phases:**
| Phase | Time Window | Access |
|-------|-------------|--------|
| OPEN | Sun 00:00 - Wed 12:00 | Full Edit |
| PARTIAL | Wed 12:01 - Tue 11:00 next week | Status Only |
| LOCKED | Tue 11:01 onwards | Read Only |

**Outputs:**
- Activity record with score
- Confirmation message
- Updated dashboard

**Dependencies:**
- Activities table
- Governance Config (lock schedule)
- Key Results (optional linking)

---

### 3.2.5 Business Unit Module

| Attribute | Description |
|-----------|-------------|
| Module Name | Business Unit Management |
| Description | Manage organizational units and their heads |
| Actors | SuperAdmin, Admin |

**Inputs:**
- Unit name
- Head user (optional)
- Contact email

**Processing Logic:**
1. Validate unit name uniqueness
2. Verify head user exists (if specified)
3. Save business unit
4. Update related records if name changes

**Outputs:**
- Business unit list
- Unit details with head

**Dependencies:**
- Business Units table
- Profiles (for heads)

**Edge Cases:**
- Duplicate name → Show error
- Delete unit with activities → Warn, allow with confirmation

---

### 3.2.6 User Management Module

| Attribute | Description |
|-----------|-------------|
| Module Name | User Directory |
| Description | User CRUD operations with role assignment |
| Actors | SuperAdmin, Admin |

**Inputs:**
- First name, Last name
- Email (must be unique)
- Role
- Department
- Avatar URL

**Processing Logic:**
1. Validate email format and uniqueness
2. Check domain restrictions
3. Create user in Supabase Auth (if self-registration allowed)
4. Create profile record
5. Send welcome email
6. Log user creation

**Outputs:**
- User list with role badges
- User detail view
- Activity summary

**Dependencies:**
- Profiles table
- Supabase Auth
- Governance Config (allowed domains)

**Edge Cases:**
- Email already exists → Show error
- Invalid domain → Reject with message
- Self-registration disabled → Only admin can create

---

### 3.2.7 Financial Module

| Attribute | Description |
|-----------|-------------|
| Module Name | Financial Control Center |
| Description | Track violations (phone fines), contributions (donations), and expenses |
| Actors | All users (view by role, edit by permission) |

**Sub-Modules:**

**A. Violations (Phone Fines)**
| Input | Description |
|-------|-------------|
| Name | Employee name |
| Department | Business unit |
| Amount | Fine amount (NGN) |
| Date | Violation date |
| Paid | Payment status |

**B. Contributions (Donations)**
| Input | Description |
|-------|-------------|
| Donor Name | Name of donor |
| Amount | Contribution amount |
| Date | Date received |
| Anonymous | Visibility toggle |

**C. Expenses**
| Input | Description |
|-------|-------------|
| Amount | Expense amount |
| Description | Purpose |
| Category | Expense type |
| Requestor | Who requested |
| Approver | Who approved |
| Receiver | Vendor/recipient |
| Date | Expense date |

**Outputs:**
- Financial dashboard with summary cards
- Detailed transaction lists
- Monthly trend charts

---

### 3.2.8 Attendance Module

| Attribute | Description |
|-----------|-------------|
| Module Name | Meeting Attendance |
| Description | Track meeting attendance and engagement |
| Actors | All users |

**Inputs:**
- User selection
- Attendance status (Present, Remote, Absent, Excused)
- Time joined
- Participation score

**Processing Logic:**
1. Fetch registered users
2. Record attendance with timestamp
3. Calculate participation score (optional)
4. Generate summary statistics

**Outputs:**
- Attendance list
- Summary metrics (total, present, average engagement)

---

### 3.2.9 AI Assistant Module

| Attribute | Description |
|-----------|-------------|
| Module Name | 4CORE Strategic Intelligence |
| Description | Gemini-powered AI assistant for OKR queries |
| Actors | All authenticated users |

**Inputs:**
- Natural language query

**Processing Logic:**
1. Collect current context (KRs, activities)
2. Construct prompt with system instructions
3. Send to AI proxy edge function
4. Forward to Gemini API
5. Return response to user
6. Log query to audit

**System Instructions:**
You are 4CORE AI, the authoritative corporate governance assistant.
Provide context on business trends, OKR methodology, and internal data analysis.
Refuse non-professional queries.

**Outputs:**
- AI response
- Query confirmation (for audit)

**Edge Cases:**
- API unavailable → Show fallback message
- Invalid query → Redirect to governance topics
- Rate limiting → Queue requests

---

### 3.2.10 Governance Module

| Attribute | Description |
|-----------|-------------|
| Module Name | Governance Hub |
| Description | System configuration including SMTP, locks, branding |
| Actors | SuperAdmin, Admin |

**Configuration Areas:**

**A. Reporting Locks**
| Setting | Description |
|---------|-------------|
| Content Lock Day | Day of week for content lock |
| Content Lock Time | Time of day for content lock |
| Final Lock Day | Day of week for final lock |
| Final Lock Time | Time of day for final lock |
| Manual Override | Force lock state |

**B. SMTP Settings**
| Setting | Description |
|---------|-------------|
| Host | SMTP server hostname |
| Port | SMTP port |
| Encryption | SSL/TLS or STARTTLS |
| Username | SMTP username |
| Password | SMTP password |

**C. Security**
| Setting | Description |
|---------|-------------|
| Allowed Domains | Email domains permitted |
| Session Timeout | Minutes before auto-logout |
| Max Login Attempts | Failed attempts before lockout |
| Lockout Duration | Minutes to remain locked |
| Password Policy | Complexity requirements |
| MFA Enabled | Multi-factor auth toggle |

**D. Branding**
| Setting | Description |
|---------|-------------|
| Brand Logo | Custom logo URL |
| Landing Image | Custom landing page image |
| Login Image | Custom login page image |

---

### 3.2.11 Integrity Checker Module

| Attribute | Description |
|-----------|-------------|
| Module Name | Data Integrity Audit |
| Description | Validate data consistency and integrity |
| Actors | SuperAdmin, Admin, Director |

**Checks Performed:**
1. Orphaned records (references to deleted items)
2. Invalid data types
3. Required field completeness
4. Duplicate entries
5. Out-of-range values
6. Audit log completeness

**Outputs:**
- Integrity score
- Issue list with severity
- Recommended fixes

---

### 3.2.12 Audit Module

| Attribute | Description |
|-----------|-------------|
| Module Name | Audit Logging |
| Description | Comprehensive logging of all system actions |
| Actors | System (automatic) |

**Logged Actions:**
- CREATE, UPDATE, DELETE
- LOGIN, LOGOUT
- IMPORT, SYSTEM
- AI_QUERY
- INTEGRITY_ADJUSTMENT

**Logged Fields:**
- Timestamp
- User ID
- User Name
- Action Type
- Details
- IP Address
- Metadata (JSON)

**Outputs:**
- Audit log list (filterable)
- CSV export
- Retention management

---

## 3.3 Use Case Diagrams

### Use Case 1: User Authentication
User enters credentials → Validate → Auth Service → Create Session → Success: Redirect to Dashboard / Failure: Show error

### Use Case 2: Weekly Report Submission
User selects week & BU → Check Lock Status → LOCKED: Block / OPEN: Allow edit → Add activities & tasks → Calculate Score → Save to database → Log to audit → Show confirmation

---

## 3.4 User Stories

### Authentication
| ID | User Story |
|----|-------------|
| US-AUTH-01 | As a user, I want to log in with email and password so that I can access my dashboard |
| US-AUTH-02 | As a user, I want to reset my password via email so that I can recover access if forgotten |
| US-AUTH-03 | As an admin, I want to configure domain restrictions so that only allowed domains can register |

### Dashboard
| ID | User Story |
|----|-------------|
| US-DASH-01 | As a director, I want to view organizational KPIs at a glance so that I can assess performance |
| US-DASH-02 | As a manager, I want to filter dashboard by my business unit so that I can see relevant metrics |

### OKR Management
| ID | User Story |
|----|-------------|
| US-KR-01 | As an admin, I want to create quarterly Key Results so that the organization has clear objectives |
| US-KR-02 | As a director, I want to update KR progress so that stakeholders see current status |
| US-KR-03 | As a user, I want to view all KRs so that I understand organizational priorities |

### Weekly Reporting
| ID | User Story |
|----|-------------|
| US-REPORT-01 | As a team member, I want to submit weekly activities so that my contributions are tracked |
| US-REPORT-02 | As a user, I want to see my past submissions so that I can track my progress |
| US-REPORT-03 | As a system, I want to apply late submission penalties so that deadlines are enforced |

### Business Units
| ID | User Story |
|----|-------------|
| US-BU-01 | As an admin, I want to add new business units so that the organizational structure is accurate |
| US-BU-02 | As a manager, I want to assign a head to my business unit so that responsibilities are clear |

### User Management
| ID | User Story |
|----|-------------|
| US-USER-01 | As an admin, I want to create new users so that team members can access the system |
| US-USER-02 | As an admin, I want to assign roles to users so that access control is enforced |
| US-USER-03 | As a user, I want to update my profile so that my information is current |

### Financials
| ID | User Story |
|----|-------------|
| US-FIN-01 | As a finance user, I want to record violations so that phone fines are tracked |
| US-FIN-02 | As a finance user, I want to record contributions so that donations are documented |
| US-FIN-03 | As a director, I want to view financial summaries so that I understand financial health |

### AI Assistant
| ID | User Story |
|----|-------------|
| US-AI-01 | As a user, I want to ask questions about OKR performance so that I get instant insights |
| US-AI-02 | As a system, I want to log all AI queries so that there's an audit trail |

### Governance
| ID | User Story |
|----|-------------|
| US-GOV-01 | As an admin, I want to configure SMTP so that email notifications work |
| US-GOV-02 | As an admin, I want to set reporting deadlines so that submissions are enforced |
| US-GOV-03 | As an admin, I want to customize branding so that the system reflects my organization |

---

## 3.5 Acceptance Criteria

### Authentication
| ID | Criteria | Test Method |
|----|----------|-------------|
| AC-AUTH-01 | User can login with valid credentials | Enter valid email/password, verify redirect to dashboard |
| AC-AUTH-02 | User sees error with invalid credentials | Enter wrong password, verify error message |
| AC-AUTH-03 | Session expires after 30 minutes of inactivity | Wait 30 minutes, verify redirect to login |
| AC-AUTH-04 | Password reset email is sent | Request reset, verify email received |

### Dashboard
| ID | Criteria | Test Method |
|----|----------|-------------|
| AC-DASH-01 | Dashboard loads within 3 seconds | Measure load time with dev tools |
| AC-DASH-02 | KPIs display correct aggregated values | Compare to direct DB query |
| AC-DASH-03 | Filters update displayed data | Change filters, verify data updates |

### OKR Management
| ID | Criteria | Test Method |
|----|----------|-------------|
| AC-KR-01 | New KR can be created with all fields | Create KR, verify saved in DB |
| AC-KR-02 | KR status updates based on progress | Set progress <40%, verify Red status |
| AC-KR-03 | KR progress persists after page reload | Update progress, refresh page, verify value |

### Weekly Reporting
| ID | Criteria | Test Method |
|----|----------|-------------|
| AC-REPORT-01 | Activity can be submitted in OPEN phase | Submit during open window, verify success |
| AC-REPORT-02 | Penalty applied in PARTIAL phase | Submit during partial, verify score reduced |
| AC-REPORT-03 | Submission blocked in LOCKED phase | Attempt submit during lock, verify blocked |

### User Management
| ID | Criteria | Test Method |
|----|----------|-------------|
| AC-USER-01 | New user can be created | Add user, verify in directory |
| AC-USER-02 | Role changes take effect immediately | Change role, verify new permissions |
| AC-USER-03 | User can update own profile | Edit profile, verify changes saved |

### Financials
| ID | Criteria | Test Method |
|----|----------|-------------|
| AC-FIN-01 | Violation can be added and listed | Add violation, verify in list |
| AC-FIN-02 | Financial totals calculate correctly | Add amounts, verify sum |
| AC-FIN-03 | Expense categories are filterable | Filter by category, verify results |

### AI Assistant
| ID | Criteria | Test Method |
|----|----------|-------------|
| AC-AI-01 | AI responds to valid queries | Ask question, verify response |
| AC-AI-02 | Query is logged to audit | Check audit log after query |
| AC-AI-03 | Fallback shown when API unavailable | Simulate failure, verify message |

### Security
| ID | Criteria | Test Method |
|----|----------|-------------|
| AC-SEC-01 | Unauthorized access is blocked | Attempt access without login, verify redirect |
| AC-SEC-02 | RBAC enforced for all features | Test each role's access |
| AC-SEC-03 | Audit log captures all actions | Perform actions, verify log entries |

---

## 3.6 Functional Workflows

### Workflow: Complete Weekly Reporting Cycle
1. START: Week begins (Sunday)
2. SYSTEM: Display OPEN status in header
3. USER: Navigate to Weekly Reporting
4. USER: Select current week and business unit
5. SYSTEM: Display empty activity form
6. USER: Add activity title
7. USER: Add tasks with Done/NotDone status
8. USER: Add comments (minimum 8 words for full score)
9. SYSTEM: Calculate score = (completed tasks / total tasks) × 100
10. USER: Click Submit
11. SYSTEM: Verify lock status = OPEN
12. SYSTEM: Save activity to database
13. SYSTEM: Log CREATE to audit_logs
14. SYSTEM: Show success confirmation
15. USER: Return to dashboard
16. SYSTEM: Display updated KPIs
17. END: Week progresses to PARTIAL phase

### Workflow: Admin Creates New User
1. ADMIN: Navigate to User Directory
2. ADMIN: Click "Add User"
3. ADMIN: Enter user details
4. SYSTEM: Validate email format
5. SYSTEM: Check domain restrictions
6. SYSTEM: Verify email uniqueness
7. ADMIN: Click "Create User"
8. SYSTEM: Create auth user in Supabase
9. SYSTEM: Create profile record
10. SYSTEM: Trigger welcome email
11. SYSTEM: Log CREATE to audit_logs
12. SYSTEM: Show success confirmation
13. NEW USER: Receives welcome email
14. NEW USER: Logs in with temporary credentials
15. SYSTEM: Prompt password change
16. END: User ready to use system

---

## 3.7 API Functional Behavior

### Authentication Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| /auth/v1/signup | POST | Register new user |
| /auth/v1/login | POST | User login |
| /auth/v1/logout | POST | User logout |
| /auth/v1/recover | POST | Password recovery |

### Data Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| /rest/v1/profiles | GET/POST/PATCH/DELETE | User profiles |
| /rest/v1/business_units | GET/POST/PATCH/DELETE | Business units |
| /rest/v1/key_results | GET/POST/PATCH/DELETE | Key Results |
| /rest/v1/activities | GET/POST/PATCH/DELETE | Weekly activities |
| /rest/v1/strategic_notes | GET/POST/PATCH/DELETE | Strategic notes |
| /rest/v1/audit_logs | GET | Audit logs (read) |
| /rest/v1/violations | GET/POST/PATCH/DELETE | Financial violations |
| /rest/v1/contributions | GET/POST/PATCH/DELETE | Financial contributions |
| /rest/v1/expenses | GET/POST/PATCH/DELETE | Financial expenses |

### Edge Functions

| Function | Purpose |
|----------|---------|
| ai-proxy | Proxy Gemini API requests |
| send-email | SMTP email delivery |
| rate-limit | Rate limiting middleware |

---

## 3.8 Role-Based Permission Matrix

| Feature | SuperAdmin | Admin | Director | Manager | Viewer |
|---------|------------|-------|----------|---------|--------|
| Login | ✓ | ✓ | ✓ | ✓ | ✓ |
| Logout | ✓ | ✓ | ✓ | ✓ | ✓ |
| Password Reset | ✓ | ✓ | ✓ | ✓ | ✓ |
| View Dashboard | ✓ | ✓ | ✓ | ✓ | ✓ |
| View All | ✓ | ✓ | ✓ | ✗ | ✗ |
| View Department | ✓ | ✓ | ✓ | ✓ | ✗ |
| Create KRs | ✓ | ✓ | ✓ | ✗ | ✗ |
| Read All KRs | ✓ | ✓ | ✓ | ✗ | ✗ |
| Update KRs | ✓ | ✓ | ✓ | ✗ | ✗ |
| Delete KRs | ✓ | ✓ | ✗ | ✗ | ✗ |
| Submit Reports | ✓ | ✓ | ✓ | ✓ | ✗ |
| View All Reports | ✓ | ✓ | ✓ | ✗ | ✗ |
| Create Users | ✓ | ✓ | ✗ | ✗ | ✗ |
| Edit Users | ✓ | ✓ | ✗ | ✗ | ✗ |
| Delete Users | ✓ | ✗ | ✗ | ✗ | ✗ |
| Manage BUs | ✓ | ✓ | ✗ | ✗ | ✗ |
| View Financials | ✓ | ✓ | ✓ | ✓ | ✗ |
| Edit Financials | ✓ | ✓ | ✗ | ✗ | ✗ |
| Configure System | ✓ | ✓ | ✗ | ✗ | ✗ |
| View Audit Logs | ✓ | ✓ | ✗ | ✗ | ✗ |
| Use AI | ✓ | ✓ | ✓ | ✓ | ✗ |

---

## 3.9 Event Handling

### Client-Side Events

| Event | Handler | Action |
|-------|---------|--------|
| Page Load | useEffect | Fetch initial data |
| Form Submit | onSubmit | Validate & save |
| Filter Change | onChange | Refetch with params |
| Session Expiry | onAuthStateChange | Redirect to login |
| Network Error | catch | Show retry option |

### Server-Side Events (Database Triggers)

| Trigger | Table | Action |
|---------|-------|--------|
| on_auth_user_created | auth.users | Auto-create profile |

### System Events

| Event | Source | Action |
|-------|--------|--------|
| Lock Phase Change | Scheduler | Update UI state |
| Score Penalty | Report Submit | Calculate & apply |
| Audit Log | All mutations | Write to logs |

---

## 3.10 Logging and Monitoring Requirements

### Client-Side Logging

| Log Type | When | Data |
|----------|------|------|
| Page View | Route change | Page, user, timestamp |
| User Action | Button clicks | Action, target, user |
| Error | Exception | Error message, stack, user |
| Performance | Page load | Load time, metrics |

### Server-Side Logging

| Log Type | When | Data |
|----------|------|------|
| Authentication | Login/logout | User, IP, result |
| Data Mutation | CRUD operations | Table, ID, changes |
| Security | Permission denied | User, resource, action |
| System | Configuration changes | Setting, old/new |

### Monitoring Metrics

| Metric | Target | Alert Threshold |
|--------|--------|-----------------|
| API Response Time | <500ms | >1000ms |
| Error Rate | <0.1% | >1% |
| Active Users | Growing | >20% drop |
| Session Duration | >5 min | <1 min |

### Retention

| Log Type | Retention |
|----------|-----------|
| Audit Logs | 1 year |
| Performance Logs | 30 days |
| Error Logs | 90 days |
| Access Logs | 30 days |

---

# END OF DOCUMENTATION
