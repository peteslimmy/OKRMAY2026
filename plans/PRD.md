# Product Requirements Document (PRD)
# 4CORE Weekly OKR Platform

## Document Information
- **Document ID:** PRD-4CORE-OKR-2026
- **Version:** 1.0
- **Date:** March 2026
- **Project:** 4CORE Weekly OKR Platform

---

## Table of Contents
1. Executive Summary
2. Market Analysis
3. Product Vision
4. Business Objectives
5. User Personas
6. Product Features
7. Technical Architecture
8. Go-to-Market Strategy
9. Success Metrics
10. Roadmap

---

## 1. Executive Summary

4CORE Weekly OKR is an enterprise performance management platform designed for organizations to track, manage, and execute their quarterly Objectives and Key Results (OKRs) through weekly activity reporting, financial tracking, and AI-powered insights.

### Problem Statement
Organizations struggle with:
- Disconnected performance tracking across multiple spreadsheets
- Lack of real-time visibility into OKR progress
- Manual and error-prone weekly reporting processes
- Fragmented financial tracking without unified governance
- Limited accessibility of strategic data for decision-makers

### Solution
A unified cloud platform that provides:
- Real-time OKR tracking with automated scoring
- Weekly activity reporting with governance controls
- Integrated financial and attendance modules
- AI-powered strategic insights
- Comprehensive audit trails

---

## 2. Market Analysis

### Target Market

| Segment | Description | Size |
|---------|-------------|------|
| Mid-size Companies | 50-500 employees | Primary |
| Large Enterprises | 500-5000 employees | Secondary |
| Educational Institutions | Schools, universities | Tertiary |
| Non-profits | NGOs, foundations | Tertiary |

### Market Pain Points

| Pain Point | Current Solution | Opportunity |
|------------|------------------|--------------|
| Spreadsheet chaos | Manual tracking | Centralized platform |
| No real-time insights | Monthly reviews | Live dashboards |
| Compliance challenges | Paper trails | Automated logging |
| Limited visibility | Email updates | Unified view |

### Competitive Landscape

| Competitor | Strength | Weakness | Our Advantage |
|------------|---------|----------|---------------|
| Excel/Sheets | Familiar | Manual Automated, error-prone |, real-time |
| Asana/Jira | Project focus | Not OKR-native | Purpose-built OKR |
 OK| Weekdone |R focus | Limited features | Integrated modules |
| Lattice | Performance | Complex setup | Simplified deployment |

---

## 3. Product Vision

### Vision Statement
To empower organizations with real-time visibility into their strategic objectives, enabling data-driven decision-making through unified performance tracking, automated governance workflows, and AI-enhanced analytics.

### Value Propositions

1. **Integrated Performance Management**
   - OKR tracking + financial + attendance in one platform
   - Unified dashboard for all stakeholders

2. **AI-Powered Insights**
   - Gemini-powered assistant for strategic queries
   - Organization-specific context

3. **Governance Automation**
   - Configurable reporting locks
   - Automated scoring
   - Audit trails

4. **Role-Based Simulation**
   - Demo mode for training
   - Role switching for demonstrations

5. **Local Market Focus**
   - Nigerian Naira (NGN) support
   - West Africa timezone
   - Domain-based authentication

---

## 4. Business Objectives

### Strategic Objectives

| ID | Objective | Success Criteria | Timeline |
|----|-----------|------------------|----------|
| BO-1 | Enable real-time OKR visibility | 100% of KRs visible with live status | Q1 2026 |
| BO-2 | Standardize weekly reporting | 95% compliance rate | Q1 2026 |
| BO-3 | Provide financial transparency | Complete tracking with audit | Q1 2026 |
| BO-4 | Deliver AI insights | 95% query success rate | Q2 2026 |
| BO-5 | Ensure data integrity | 100% validation pass rate | Q1 2026 |
| BO-6 | Reduce administrative overhead | 50% time reduction | Q2 2026 |

### Financial Objectives

| Metric | Year 1 Target |
|--------|---------------|
| Customer Acquisition | 50 organizations |
| Monthly Recurring Revenue | $50,000 |
| Customer Retention | 90% |
| Net Revenue Retention | 110% |

---

## 5. User Personas

### Persona 1: Corporate```
 Director
Name: Sarah Mitchell
Role: Corporate Director, Finance
Demographics: 45 years old, MBA, 15 years experience

Goals:
- View organizational health at a glance
- Track quarterly OKR progress
- Ensure compliance and governance
- Generate strategic reports

Pain Points:
- Manual data aggregation from multiple sources
- Lack of real-time insights
- Complex reporting requirements

Success Metrics:
- Access complete OKR status within 30 seconds
- Generate monthly reports in <10 minutes
```

### Persona 2: Business Unit Head
```
Name: James Okafor
Role: Head of IDEC Business Unit
Demographics: 35 years old, BSc, 8 years experience

Goals:
- Track team performance
- Submit weekly reports on time
- Manage unit budget and resources
- Develop team members

Pain Points:
- Complex reporting requirements
- Difficulty tracking multiple reports
- Communication gaps with leadership

Success Metrics:
- Submit weekly report in <5 minutes
- View team performance in real-time
- Access historical reports easily
```

### Persona 3: System Administrator
```
Name: Chidi Adebayo
Role: IT Administrator
Demographics: 30 years old, BSc Computer Science

Goals:
- Manage user access and permissions
- Configure system settings
- Ensure security and compliance
- Maintain system uptime

Pain Points:
- Manual user provisioning
- Security compliance requirements
- Limited visibility into issues

Success Metrics:
- Onboard new user in <3 minutes
- Resolve security incidents in <1 hour
- Maintain 99.5% uptime
```

### Persona 4: Team Member
```
Name: Grace Johnson
Role: Marketing Associate
Demographics: 25 years old, BSc Marketing

Goals:
- Complete weekly activity reports
- View personal performance trends
- Understand team objectives
- Grow professionally

Pain Points:
- Time-consuming form filling
- Unclear reporting requirements
- Limited visibility into contribution

Success Metrics:
- Submit weekly activities in <3 minutes
- View performance feedback weekly
- Understand alignment with OKRs
```

---

## 6. Product Features

### Core Features (Phase 1)

| Feature | Description | Priority | Status |
|---------|-------------|----------|--------|
| F-01 | Executive Dashboard | Real-time KPIs, charts, trends | Complete |
| F-02 | KR Management | Create, update, track Key Results | Complete |
| F-03 | Weekly Reporting | Activity submission with scoring | Complete |
| F-04 | Business Unit Management | CRUD for organizational units | Complete |
| F-05 | User Directory | RBAC user management | Complete |
| F-06 | Financial Dashboard | Violations, contributions, expenses | Complete |
| F-07 | Attendance Tracking | Meeting attendance scoring | Complete |
| F-08 | AI Assistant | Gemini-powered queries | Complete |
| F-09 | Governance Hub | System configuration | Complete |
| F-10 | Integrity Checker | Data validation tools | Complete |
| F-11 | Strategic Notes | Meeting documentation | Complete |
| F-12 | Audit Logs | Comprehensive activity logging | Complete |

### Feature Descriptions

#### F-01: Executive Dashboard
- Total company score display
- Weekly completion rate visualization
- Governance health indicator
- Performance trend charts (line, bar)
- AI-generated weekly briefing
- Year/quarter/BU filtering

#### F-02: KR Management
- Create/edit Key Results
- Assign owners and departments
- Set quarterly targets
- Progress updates (0-100%)
- Auto status calculation (Green/Amber/Red)
- Progress history tracking

#### F-03: Weekly Reporting
- Activity submission form
- Task checklist with completion
- Auto score calculation
- Governance lock enforcement
- Comments and descriptions
- Historical report viewing
- Export functionality

#### F-04: Business Unit Management
- Create/edit/delete business units
- Assign unit heads
- View unit performance matrix
- Filter by unit in reports

#### F-05: User Directory
- User listing with search/filter
- Add/edit/deactivate users
- Role assignment (Super Admin, Admin, Director, Manager, Viewer)
- Department assignment
- Domain restriction configuration

#### F-06: Financial Dashboard
- **Phone Violations:** Track phone fine violations with payment status
- **Contributions:** Record donations (anonymous option)
- **Expenses:** Track business expenses by category
- **Monthly Summary:** Aggregated financial charts
- Currency: Nigerian Naira (NGN)

#### F-07: Attendance Tracking
- Meeting attendance recording
- Participation score calculation
- Late arrival tracking
- Attendance trends
- Department filtering

#### F-08: AI Assistant
- Natural language queries
- Gemini API integration
- Organization-specific context
- Rate limiting (50 requests/hour)
- Query logging for audit

#### F-09: Governance Hub
- SMTP configuration (host, port, credentials)
- Governance lock schedule
- Password policy settings
- Session timeout configuration
- Allowed email domains

#### F-10: Integrity Checker
- Data validation checks
- Duplicate detection
- Missing data identification
- Fix recommendations
- Audit trail

#### F-11: Strategic Notes
- Weekly meeting notes
- Rich text editing
- Department association
- Search functionality

#### F-12: Audit Logs
- All CRUD operations logged
- User, action, timestamp, details
- IP address tracking
- JSON metadata support
- Filterable search

---

## 7. Technical Architecture

### Technology Stack

| Layer | Technology | Version |
|-------|------------|---------|
| Frontend | React | 19.x |
| Language | TypeScript | 5.x |
| Routing | React Router | 7.x |
| Styling | Tailwind CSS | 3.x |
| Charts | Recharts | 3.x |
| Animation | Framer Motion | 11.x |
| Build Tool | Vite | 6.x |
| Backend | Supabase | Latest |
| Database | PostgreSQL | Latest |
| Auth | Supabase Auth | Latest |
| Edge Functions | Deno Deploy | Latest |
| AI | Gemini | 1.x |

### System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                      CLIENT (React SPA)                      │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐        │
│  │Dashboard│ │ Reporting│ │   OKR   │ │ Finance │        │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘        │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐        │
│  │  Users  │ │   AI    │ │Settings │ │Attendance│        │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘        │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    SUPABASE (Backend)                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐   │
│  │  PostgreSQL  │  │    Auth      │  │   Storage    │   │
│  │  (RLS)       │  │   (JWT)      │  │   (Future)   │   │
│  └──────────────┘  └──────────────┘  └──────────────┘   │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                  EDGE FUNCTIONS (Deno)                      │
│  ┌──────────────┐  ┌──────────────┐                       │
│  │ send-email   │  │   ai-proxy   │                       │
│  │  (SMTP)      │  │  (Gemini)    │                       │
│  └──────────────┘  └──────────────┘                       │
└─────────────────────────────────────────────────────────────┘
```

---

## 8. Go-to-Market Strategy

### Launch Strategy

| Phase | Timeline | Focus |
|-------|----------|-------|
| Beta | Month 1-2 | 5-10 pilot organizations |
| Launch | Month 3 | Public release, marketing push |
| Growth | Month 4-6 | Customer acquisition |
| Scale | Month 7-12 | Enterprise features |

### Marketing Channels

1. **Content Marketing**
   - OKR methodology blog posts
   - Case studies
   - White papers

2. **Digital Marketing**
   - LinkedIn advertising
   - Google Ads
   - Email campaigns

3. **Partnerships**
   - Consulting firms
   - Training organizations
   - Technology partners

4. **Events**
   - Industry conferences
   - Webinars
   - Product demos

### Pricing Strategy

| Tier | Users | Price | Features |
|------|-------|-------|----------|
| Starter | Up to 25 | $49/mo | Core OKR, 5 BUs |
| Professional | Up to 100 | $149/mo | All features, AI |
| Enterprise | Unlimited | Custom | Dedicated support |

---

## 9. Success Metrics

### Product Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Weekly Report Completion | ≥95% | (Submitted/Expected) × 100 |
| System Uptime | ≥99.5% | (Available/Total) × 100 |
| User Adoption | ≥80% | (Active/Total) × 100 |
| Report Submission Time | ≤5 min | Average time |
| AI Query Success | ≥95% | (Success/Total) × 100 |
| Data Integrity | 100% | Validation pass rate |

### Business Metrics

| Metric | Target | Timeline |
|--------|--------|----------|
| Customers | 50 | Year 1 |
| MRR | $50,000 | Year 1 |
| CAC | <$500 | Year 1 |
| LTV | >$5,000 | Year 1 |
| Churn | <10% | Year 1 |

### Customer Success Metrics

| Metric | Target |
|--------|--------|
| Time to Value | <1 week |
| NPS Score | >40 |
| Support Response | <4 hours |
| Issue Resolution | <24 hours |

---

## 10. Roadmap

### Phase 1: Foundation (Q1 2026)
- [x] Core OKR dashboard
- [x] Weekly activity reporting
- [x] User management with RBAC
- [x] Business unit management
- [x] Basic audit logging
- [x] Finance module (MVP)
- [x] Attendance module (MVP)
- [x] AI assistant (MVP)

### Phase 2: Enhancement (Q2 2026)
- [ ] Advanced AI capabilities
- [ ] Custom branding options
- [ ] Mobile-responsive improvements
- [ ] Email notifications
- [ ] Advanced reporting
- [ ] Export to PDF/Excel

### Phase 3: Scale (Q3-Q4 2026)
- [ ] Multi-organization support
- [ ] Advanced analytics
- [ ] Third-party integrations (Slack, Teams)
- [ ] Mobile applications
- [ ] White-label options

---

## Appendix

### A. User Roles and Permissions

| Permission | Super Admin | Admin | Director | Manager | Viewer |
|------------|-------------|-------|----------|---------|--------|
| Manage Users | ✓ | ✓ | - | - | - |
| Manage Settings | ✓ | ✓ | - | - | - |
| View All Reports | ✓ | ✓ | ✓ | Own Unit | - |
| Submit Reports | ✓ | ✓ | ✓ | ✓ | - |
| Manage KRs | ✓ | ✓ | ✓ | Own Unit | - |
| View Dashboard | ✓ | ✓ | ✓ | ✓ | ✓ |
| Use AI Assistant | ✓ | ✓ | ✓ | ✓ | ✓ |

### B. Support Structure

| Tier | Response Time | Channels |
|------|---------------|----------|
| Critical | <4 hours | Email, Phone |
| High | <8 hours | Email |
| Medium | <24 hours | Email |
| Low | <72 hours | Email |

---

## Document Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | March 2026 | Product Team | Initial Release |

---

*This document defines the product requirements for the 4CORE Weekly OKR Platform.*
