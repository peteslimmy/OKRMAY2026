# Functional Requirements Document (FRD)
# 4CORE Weekly OKR Platform

## Document Information
- **Document ID:** FRD-4CORE-OKR-2026
- **Version:** 1.0
- **Date:** March 2026
- **Project:** 4CORE Weekly OKR Platform

---

## Table of Contents
1. Introduction
2. Authentication Module
3. Dashboard Module
4. OKR Management Module
5. Weekly Reporting Module
6. Business Units Module
7. User Management Module
8. Finance Module
9. Attendance Module
10. AI Assistant Module
11. Settings Module
12. Appendix

---

## 1. Introduction

### 1.1 Purpose
This document provides detailed functional requirements for the 4CORE Weekly OKR Platform. It serves as the technical specification for development and testing teams.

### 1.2 Scope
This FRD covers all functional modules of the 4CORE OKR Platform including authentication, dashboard, OKR management, reporting, user management, finance, attendance, AI assistant, and settings.

### 1.3 Methodology
Requirements are organized by module with clear:
- Functional ID and description
- Acceptance criteria
- Input/output specifications
- Business rules
- Edge cases

---

## 2. Authentication Module

### 2.1 User Login (FRD-AUTH-001)

**Description:** Authenticate users with email and password

**Input:**
- Email (string, required, valid email format)
- Password (string, required, min 8 characters)

**Processing:**
1. Validate email format
2. Check account lock status
3. Verify credentials against Supabase Auth
4. Check password breach (HaveIBeenPwned API)
5. Create session with JWT
6. Log authentication attempt

**Output:**
- Success: Redirect to dashboard, session token
- Failure: Error message, failed attempt counter

**Business Rules:**
- Account locks after 5 failed attempts
- Lockout duration: 15 minutes
- Session timeout: 30 minutes (configurable)

**Acceptance Criteria:**
- [ ] Valid credentials redirect to dashboard
- [ ] Invalid credentials show error message
- [ ] Locked account shows lockout message with timer
- [ ] Breached password triggers change prompt

---

### 2.2 User Registration (FRD-AUTH-002)

**Description:** Register new user accounts

**Input:**
- Email (string, required, valid format)
- Password (string, required, meets complexity)
- First Name (string, required)
- Last Name (string, optional)
- Department (string, required)
- Role (string, default: Viewer)

**Processing:**
1. Validate email domain against allowed domains
2. Validate password complexity
3. Check password breach
4. Create Supabase Auth user
5. Create profile record in database
6. Send welcome email (optional)

**Output:**
- Success: Account created, confirmation message
- Failure: Error message

**Business Rules:**
- Email must be from allowed domain
- Password requires: 8+ chars, uppercase, lowercase, number, special char

**Acceptance Criteria:**
- [ ] Valid registration creates account
- [ ] Invalid email domain rejected
- [ ] Weak password rejected with details
- [ ] Duplicate email rejected

---

### 2.3 Password Reset (FRD-AUTH-003)

**Description:** Allow users to reset forgotten passwords

**Input:**
- Email (string, required, valid format)

**Processing:**
1. Validate email format
2. Check if email exists (generic response)
3. Generate password reset link (Supabase)
4. Send reset email via edge function
5. Log password reset request

**Output:**
- Success: "If account exists, reset email sent"
- Failure: Error message

**Business Rules:**
- Rate limited: 3 requests per hour per IP
- Rate limited: 3 requests per hour per email
- Reset link expires in 1 hour

**Acceptance Criteria:**
- [ ] Valid email triggers reset flow
- [ ] Invalid email shows generic message
- [ ] Rate limiting prevents abuse

---

### 2.4 Password Change (FRD-AUTH-004)

**Description:** Allow logged-in users to change password

**Input:**
- Current Password (string, required)
- New Password (string, required)
- Confirm Password (string, required)

**Processing:**
1. Verify current password
2. Validate new password complexity
3. Check new password breach
4. Update password in Supabase Auth
5. Invalidate existing sessions
6. Log password change

**Output:**
- Success: Password changed, redirect to login
- Failure: Error message

**Acceptance Criteria:**
- [ ] Correct current password allows change
- [ ] Incorrect current password rejected
- [ ] New password validated for complexity

---

## 3. Dashboard Module

### 3.1 Dashboard Overview (FRD-DASH-001)

**Description:** Display executive dashboard with KPIs

**Processing:**
1. Fetch current week/year data
2. Calculate total company score
3. Calculate completion rate
4. Calculate governance health
5. Fetch recent activities
6. Fetch performance trends

**Output:**
- Total Company Score (0-100)
- Weekly Completion Rate (%)
- Governance Health (Green/Amber/Red)
- Recent Activities (last 5)
- Performance Trend (12 weeks)

**Acceptance Criteria:**
- [ ] All KPIs display correctly
- [ ] Data refreshes on page load
- [ ] Filters work correctly
- [ ] Charts render properly

---

### 3.2 Dashboard Filtering (FRD-DASH-002)

**Description:** Filter dashboard data by time and unit

**Input:**
- Year (integer, required)
- Quarter (integer, optional)
- Business Unit (string, optional)

**Processing:**
1. Apply year filter to all queries
2. Apply quarter filter if provided
3. Apply business unit filter if provided
4. Recalculate all KPIs
5. Update all charts

**Output:**
- Filtered KPIs
- Filtered charts

**Acceptance Criteria:**
- [ ] Year filter updates all data
- [ ] Quarter filter works correctly
- [ ] Business unit filter restricts data

---

### 3.3 AI Weekly Briefing (FRD-DASH-003)

**Description:** Generate AI-powered weekly summary

**Processing:**
1. Fetch week's activities
2. Fetch KR progress
3. Send to Gemini API
4. Format response as HTML
5. Cache result for 1 hour

**Output:**
- HTML formatted briefing
- Generation timestamp

**Acceptance Criteria:**
- [ ] Briefing generates successfully
- [ ] Cached results returned quickly
- [ ] Error handling works

---

## 4. OKR Management Module

### 4.1 Create Key Result (FRD-OKR-001)

**Description:** Create new Key Result

**Input:**
- Title (string, required, max 200 chars)
- Description (string, optional, max 2000 chars)
- Quarter (string, required, Q1-Q4)
- Year (integer, required, 2025+)
- Label (string, required)
- Owner ID (UUID, required)
- Initial Progress (integer, 0-100)

**Processing:**
1. Validate all required fields
2. Check user permissions
3. Create record in database
4. Log creation action

**Output:**
- Success: Created KR object
- Failure: Error message

**Acceptance Criteria:**
- [ ] Valid input creates KR
- [ ] Missing required fields rejected
- [ ] Permission check enforced

---

### 4.2 Update Key Result Progress (FRD-OKR-002)

**Description:** Update progress on existing Key Result

**Input:**
- KR ID (UUID, required)
- Progress (integer, 0-100)
- Notes (string, optional)

**Processing:**
1. Validate KR exists
2. Check user permissions
3. Update progress value
4. Auto-calculate status:
   - Green: progress >= 70%
   - Amber: progress 40-69%
   - Red: progress < 40%
5. Log update action

**Output:**
- Success: Updated KR object
- Failure: Error message

**Acceptance Criteria:**
- [ ] Progress updates correctly
- [ ] Status auto-calculates
- [ ] History preserved

---

### 4.3 View Key Results List (FRD-OKR-003)

**Description:** Display list of Key Results

**Input:**
- Year (integer, optional)
- Quarter (string, optional)
- Status (string, optional)
- Owner ID (UUID, optional)

**Processing:**
1. Build query filters
2. Fetch matching KRs
3. Calculate status for each
4. Sort by deadline

**Output:**
- Array of KR objects
- Total count

**Acceptance Criteria:**
- [ ] All filters work correctly
- [ ] Pagination works
- [ ] Status displays correctly

---

## 5. Weekly Reporting Module

### 5.1 Submit Weekly Activity (FRD-REP-001)

**Description:** Submit weekly activity report

**Input:**
- Week (integer, 1-53)
- Year (integer, required)
- Key Result ID (UUID, required)
- Tasks (array of objects):
  - Title (string)
  - Completed (boolean)
  - Notes (string)
- Comments (string, optional)

**Processing:**
1. Validate governance lock
2. Validate all tasks
3. Calculate score: (completed/total) × 100
4. Check for duplicates
5. Create activity record
6. Update KR progress if needed
7. Log submission

**Output:**
- Success: Activity created with score
- Failure: Error with details

**Business Rules:**
- Cannot submit for future weeks
- Cannot submit after governance lock
- One submission per week per user per KR

**Acceptance Criteria:**
- [ ] Score calculates correctly
- [ ] Lock prevents late submission
- [ ] Duplicate submission blocked

---

### 5.2 View Activity History (FRD-REP-002)

**Description:** View historical activity reports

**Input:**
- User ID (UUID, optional)
- Week (integer, optional)
- Year (integer, optional)
- Business Unit ID (UUID, optional)

**Processing:**
1. Build query with filters
2. Fetch matching activities
3. Join with user and KR data
4. Sort by date descending

**Output:**
- Array of activity objects
- Pagination metadata

**Acceptance Criteria:**
- [ ] Filters work correctly
- [ ] Data displays properly
- [ ] Pagination works

---

### 5.3 Export Reports (FRD-REP-003)

**Description:** Export reports to file

**Input:**
- Format (PDF/CSV)
- Date Range (start, end)
- Filters (unit, user, etc.)

**Processing:**
1. Fetch report data
2. Format according to type
3. Generate file
4. Trigger download

**Output:**
- File download

**Acceptance Criteria:**
- [ ] PDF generates correctly
- [ ] CSV exports properly
- [ ] All data included

---

## 6. Business Units Module

### 6.1 Create Business Unit (FRD-BU-001)

**Description:** Create new business unit

**Input:**
- Name (string, required, max 100 chars)
- Head User ID (UUID, optional)
- Contact Email (string, optional)

**Processing:**
1. Validate name uniqueness
2. Validate head user exists
3. Create record
4. Log creation

**Output:**
- Success: BU object
- Failure: Error message

**Acceptance Criteria:**
- [ ] Valid input creates BU
- [ ] Duplicate name rejected
- [ ] Invalid head rejected

---

### 6.2 Manage Business Unit Members (FRD-BU-002)

**Description:** Add/remove users from business unit

**Input:**
- Business Unit ID (UUID)
- User IDs (array of UUID)
- Action (add/remove)

**Processing:**
1. Validate BU exists
2. Validate users exist
3. Update user profiles
4. Log changes

**Output:**
- Success: Updated member list
- Failure: Error message

**Acceptance Criteria:**
- [ ] Users added correctly
- [ ] Users removed correctly
- [ ] Duplicate operations prevented

---

### 6.3 View Performance Matrix (FRD-BU-003)

**Description:** Display BU performance comparison

**Input:**
- Year (integer)
- Quarter (string)
- Weeks (array, optional)

**Processing:**
1. Fetch all BU data
2. Calculate scores per week
3. Generate comparison matrix
4. Identify trends

**Output:**
- Performance matrix
- Trend analysis

**Acceptance Criteria:**
- [ ] All BUs included
- [ ] Scores calculated correctly
- [ ] Trends identified

---

## 7. User Management Module

### 7.1 User CRUD Operations (FRD-USER-001)

**Description:** Create, read, update, delete users

**Input (Create):**
- Email (string, required)
- First Name (string, required)
- Last Name (string, optional)
- Role (string, required)
- Department (string, required)
- Status (string, default: Active)

**Processing:**
1. Validate email uniqueness
2. Validate role validity
3. Create auth user (if email-based)
4. Create profile record
5. Log creation

**Output:**
- Success: User object
- Failure: Error message

**Acceptance Criteria:**
- [ ] Create works correctly
- [ ] Update modifies fields
- [ ] Delete deactivates (soft delete)
- [ ] Permissions enforced

---

### 7.2 Role Assignment (FRD-USER-002)

**Description:** Assign and manage user roles

**Input:**
- User ID (UUID)
- Role (string: SA/ADM/DIR/MGR/VIEW)

**Processing:**
1. Validate user exists
2. Validate role is valid
3. Check permissions (must be SA/ADM)
4. Update role
5. Log change

**Output:**
- Success: Updated user
- Failure: Error message

**Business Rules:**
- Only Super Admin can assign Super Admin
- Admins cannot modify Super Admins

**Acceptance Criteria:**
- [ ] Role updates correctly
- [ ] Permission hierarchy enforced

---

### 7.3 Domain Restriction (FRD-USER-003)

**Description:** Configure allowed email domains

**Input:**
- Domains (array of strings)

**Processing:**
1. Validate domain formats
2. Update governance config
3. Apply to new registrations
4. Log change

**Output:**
- Success: Domains updated
- Failure: Error message

**Acceptance Criteria:**
- [ ] Domains save correctly
- [ ] Registration respects domains

---

## 8. Finance Module

### 8.1 Violation Management (FRD-FIN-001)

**Description:** Track phone violations/fines

**Input (Create):**
- Name (string, required)
- Department (string, required)
- Amount (number, required, NGN)
- Date (date, required)
- Paid (boolean, default: false)

**Processing:**
1. Validate required fields
2. Create violation record
3. Log creation
4. Update summary

**Output:**
- Success: Violation object
- Failure: Error message

**Acceptance Criteria:**
- [ ] Violation created
- [ ] Amount displays in NGN
- [ ] Paid status toggleable

---

### 8.2 Contribution Tracking (FRD-FIN-002)

**Description:** Record donations/contributions

**Input (Create):**
- Donor Name (string, required)
- Amount (number, required, NGN)
- Date (date, required)
- Anonymous (boolean, default: false)

**Processing:**
1. Validate required fields
2. Create contribution record
3. Handle anonymous flag
4. Log creation
5. Update summary

**Output:**
- Success: Contribution object
- Failure: Error message

**Acceptance Criteria:**
- [ ] Contribution created
- [ ] Anonymous hides name
- [ ] Amount in NGN

---

### 8.3 Expense Management (FRD-FIN-003)

**Description:** Track business expenses

**Input (Create):**
- Amount (number, required, NGN)
- Description (string, required)
- Category (string, required)
- Requestor (string, required)
- Approver (string, optional)
- Receiver (string, optional)
- Date (date, required)
- Receipt URL (string, optional)

**Processing:**
1. Validate required fields
2. Validate category
3. Create expense record
4. Log creation
5. Update summary

**Output:**
- Success: Expense object
- Failure: Error message

**Categories:**
- Office Supplies
- Travel
- Equipment
- Software
- Marketing
- Utilities
- Maintenance
- Professional Services
- Events
- Other

**Acceptance Criteria:**
- [ ] Expense created
- [ ] Category enforced
- [ ] Amount in NGN

---

### 8.4 Financial Dashboard (FRD-FIN-004)

**Description:** Display financial summaries

**Processing:**
1. Fetch all financial data
2. Calculate totals by category
3. Calculate monthly summaries
4. Generate charts

**Output:**
- Total Violations
- Total Contributions
- Total Expenses
- Monthly trends chart

**Acceptance Criteria:**
- [ ] All totals correct
- [ ] Charts display properly
- [ ] Filters work

---

## 9. Attendance Module

### 9.1 Record Attendance (FRD-ATT-001)

**Description:** Record meeting attendance

**Input:**
- User ID (UUID, required)
- Status (Present/Remote/Absent/Excused)
- Time Joined (datetime, optional)
- Participation Score (0-100, optional)

**Processing:**
1. Validate user exists
2. Validate status
3. Calculate participation if needed
4. Create record
5. Log creation

**Output:**
- Success: Attendance record
- Failure: Error message

**Acceptance Criteria:**
- [ ] Record created
- [ ] Status validated
- [ ] Score calculated

---

### 9.2 Attendance Summary (FRD-ATT-002)

**Description:** Display attendance summaries

**Input:**
- Date (date, optional)
- Department (string, optional)

**Processing:**
1. Fetch attendance records
2. Calculate metrics:
   - Total invited
   - Actual attendees
   - Average engagement
   - Late arrivals
3. Calculate trends
4. Generate summary

**Output:**
- Total Invited
- Actual Attendees (%)
- Avg Engagement
- Late Arrivals
- Trends

**Acceptance Criteria:**
- [ ] Metrics calculate correctly
- [ ] Trends display
- [ ] Filters work

---

## 10. AI Assistant Module

### 10.1 Query AI (FRD-AI-001)

**Description:** Send query to AI assistant

**Input:**
- Query (string, required, max 1000 chars)

**Processing:**
1. Validate query
2. Check rate limit (50/hour)
3. Fetch relevant data from database
4. Send to Gemini API with context
5. Format response
6. Log query

**Output:**
- Success: AI response (HTML)
- Failure: Error message

**Rate Limiting:**
- Per-user: 50 requests/hour
- In-memory fallback if DB unavailable

**Acceptance Criteria:**
- [ ] Query processes successfully
- [ ] Rate limiting enforced
- [ ] Error handling works

---

### 10.2 AI Context (FRD-AI-002)

**Description:** Provide context to AI queries

**Processing:**
1. Fetch current OKR data
2. Fetch recent activities
3. Fetch performance metrics
4. Format as context
5. Include in prompt

**Output:**
- Context object for AI

**Acceptance Criteria:**
- [ ] Relevant data included
- [ ] Format correct

---

## 11. Settings Module

### 11.1 SMTP Configuration (FRD-SET-001)

**Description:** Configure email settings

**Input:**
- Host (string, required)
- Port (number, required)
- Encryption (string: SSL/TLS)
- Username (string, required)
- Password (string, required)

**Processing:**
1. Validate all fields
2. Test SMTP connection
3. Save to governance config
4. Encrypt password
5. Log configuration

**Output:**
- Success: Configuration saved
- Failure: Error with details

**Acceptance Criteria:**
- [ ] Valid config saves
- [ ] Invalid rejected
- [ ] Test email works

---

### 11.2 Governance Lock (FRD-SET-002)

**Description:** Configure reporting locks

**Input:**
- Lock Day (integer: 0-6, Sunday=0)
- Lock Time (HH:MM format)

**Processing:**
1. Validate inputs
2. Update governance config
3. Apply to new submissions
4. Log change

**Output:**
- Success: Lock configured
- Failure: Error message

**Acceptance Criteria:**
- [ ] Lock saves correctly
- [ ] Late submissions blocked

---

### 11.3 Password Policy (FRD-SET-003)

**Description:** Configure password requirements

**Input:**
- Min Length (integer, default: 8)
- Require Uppercase (boolean)
- Require Lowercase (boolean)
- Require Number (boolean)
- Require Special (boolean)
- Max Attempts (integer, default: 5)
- Lockout Duration (minutes, default: 15)

**Processing:**
1. Validate all fields
2. Update governance config
3. Log change

**Output:**
- Success: Policy updated
- Failure: Error message

**Acceptance Criteria:**
- [ ] Policy saves correctly
- [ ] Enforced on registration

---

## 12. Appendix

### A. Data Types

| Type | Format | Example |
|------|--------|---------|
| UUID | xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx | 550e8400-e29b-41d4-a716-446655440000 |
| Date | YYYY-MM-DD | 2026-03-08 |
| DateTime | ISO 8601 | 2026-03-08T12:00:00Z |
| Currency | NGN | ₦50,000.00 |
| Percentage | 0-100 | 75% |

### B. Error Codes

| Code | Description |
|------|-------------|
| AUTH-001 | Invalid credentials |
| AUTH-002 | Account locked |
| AUTH-003 | Session expired |
| AUTH-004 | Password too weak |
| PERM-001 | Permission denied |
| VAL-001 | Validation failed |
| LOCK-001 | Governance lock active |
| RATE-001 | Rate limit exceeded |

### C. Audit Events

| Event | Description |
|-------|-------------|
| USER_LOGIN | User logged in |
| USER_LOGOUT | User logged out |
| USER_CREATE | User created |
| USER_UPDATE | User updated |
| USER_DELETE | User deleted |
| KR_CREATE | Key Result created |
| KR_UPDATE | Key Result updated |
| REPORT_SUBMIT | Weekly report submitted |
| REPORT_EXPORT | Report exported |
| PASSWORD_RESET | Password reset requested |
| PASSWORD_CHANGE | Password changed |
| SETTINGS_UPDATE | Settings changed |

---

## Document Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | March 2026 | Product Team | Initial Release |

---

*This document defines the functional requirements for the 4CORE Weekly OKR Platform.*
