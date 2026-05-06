# 4CORE OKR Platform - Comprehensive Codebase Analysis

## Executive Summary
The 4CORE OKR Platform is a **React 19 + TypeScript + Vite** enterprise application for tracking and managing organizational objectives and key results (OKRs). It features role-based access control (RBAC), governance workflows, financial management, attendance tracking, and advanced reporting with AI capabilities.

---

## 1. COMPONENT ARCHITECTURE & TREE

### 1.1 Overall Structure
```
src/components/
├── layout/                    # Layout components
│   ├── Sidebar.tsx           # Collapsible sidebar navigation (300px expanded, 84px collapsed)
│   └── SignOutConfirmDialog.tsx
├── ui/                        # Reusable atomic UI components
│   ├── AdvancedFilters.tsx
│   ├── Card.tsx
│   ├── CommandPalette.tsx
│   ├── EmptyState.tsx
│   ├── FloatingActionButton.tsx
│   ├── OrgChart.tsx
│   ├── Select.tsx
│   ├── Skeleton.tsx
│   ├── Toast.tsx
│   └── VirtualList.tsx
├── Auth/                      # Authentication module
│   ├── AuthHeader.tsx
│   ├── ForgotPasswordForm.tsx
│   ├── MFASetup.tsx
│   ├── PasswordUpdateForm.tsx
│   ├── RoleGate.tsx
│   ├── SignInForm.tsx
│   ├── SignUpForm.tsx
│   ├── SuccessScreen.tsx
│   └── utils.ts
├── Dashboard/                 # Executive dashboard
│   ├── index.tsx             # Main dashboard component
│   ├── StatCard.tsx          # KPI metric cards
│   ├── GovernanceScoreWidget.tsx
│   └── KRHeatmap.tsx
├── BusinessObjectives/        # KR management
│   ├── index.tsx
│   ├── KREditModal.tsx       # Form for creating/editing KRs
│   ├── BulkUploadModal.tsx   # CSV bulk import
│   ├── QuarterColumn.tsx     # Quarterly view
│   ├── QuarterlyArchive.tsx
│   └── utils.ts
├── BusinessUnits/            # BU configuration
│   └── index.tsx
├── UserManagement/           # User admin CRUD
│   ├── index.tsx
│   ├── UserHeader.tsx
│   ├── UserStats.tsx
│   ├── UserTable.tsx
│   ├── UserRow.tsx
│   ├── UserModal.tsx         # User creation/editing form
│   ├── BulkRoleModal.tsx
│   └── ImportModal.tsx       # CSV user import
├── ReportModule/             # Weekly reporting
│   ├── index.tsx
│   ├── ReportForm.tsx
│   ├── ReportHeader.tsx
│   ├── ReportStats.tsx
│   ├── GoalCard.tsx
│   ├── CompliancePDF.tsx
│   └── utils.ts
├── AllSummaryReports/        # Report aggregation
│   ├── index.tsx
│   ├── data.tsx
│   └── ReportCard.tsx
├── Settings/                 # Admin settings
│   ├── index.tsx
│   ├── AuditLogTab.tsx       # Activity log viewer
│   ├── BrandUploadCard.tsx   # Logo/branding upload
│   ├── MFASetup.tsx
│   └── SettingsTabs.tsx
├── IntegrityChecker/         # Data integrity audit
│   ├── index.tsx
│   ├── IntegrityHeader.tsx
│   ├── AuditTabs.tsx
│   ├── ConfigTab.tsx
│   └── ReversionModal.tsx
├── Financials/               # Finance & accounting module
│   ├── index.tsx
│   ├── Contributions.tsx     # Donations/contributions
│   ├── DisbursementApproval.tsx
│   ├── Expenses.tsx          # Expense tracking
│   ├── FineConfig.tsx        # Fine type CRUD
│   ├── MonthlyClose.tsx
│   ├── PaymentReceipt.tsx
│   ├── PhoneViolators.tsx    # Violation/fine tracking
│   ├── Statement.tsx
│   ├── VarianceAnalysis.tsx
│   ├── UI.tsx
│   └── constants.ts
├── Attendance/               # Attendance tracking
│   ├── index.tsx
│   ├── AttendanceTable.tsx   # Data grid
│   ├── AttendanceSidebar.tsx # Filter panel
│   └── StatCard.tsx
├── UnifiedHeader.tsx         # Top navigation bar (user profile, notifications, icons)
├── AIAssistant.tsx          # AI-powered assistance
├── ErrorBoundary.tsx        # Error handling wrapper
├── ProtectedRoute.tsx       # Permission-based route guard
├── LoadingFallback.tsx      # Suspense loading state
└── RichTextEditor.tsx       # Rich content editing
```

### 1.2 Component Composition Pattern
- **Page components** (Dashboard, BusinessObjectives, etc.): Entry points, lazy-loaded
- **Feature components** (ReportForm, KREditModal): Domain-specific logic
- **UI components** (Card, Button, Select): Reusable primitives from `src/components/ui/`
- **Layout components** (Sidebar, UnifiedHeader): App structure

---

## 2. DESIGN SYSTEM

### 2.1 Design Tokens (CSS Variables in `design-system.css`)

#### Color Palette
```css
/* Primary Brand (Orange) */
--color-primary-50: #fff7ed;    /* Lightest */
--color-primary-500: #f97316;   /* Main brand */
--color-primary-600: #ea580c;   /* Darker, interactive */
--color-primary-900: #7c2d12;   /* Darkest */

/* Semantic Colors */
--color-success-500: #22c55e;   /* Green */
--color-warning-500: #f59e0b;   /* Amber */
--color-error-500: #ef4444;     /* Red */
--color-info-500: #3b82f6;      /* Blue */

/* Neutral (Slate) - Primary text/bg */
--color-slate-50: #f8fafc;      /* Lightest bg */
--color-slate-900: #0f172a;     /* Darkest text */
--color-slate-950: #020617;     /* Very dark */
```

#### Spacing (4px base grid)
```css
--space-1: 0.25rem;    /* 4px */
--space-2: 0.5rem;     /* 8px */
--space-4: 1rem;       /* 16px */
--space-6: 1.5rem;     /* 24px */
--space-8: 2rem;       /* 32px */
--space-12: 3rem;      /* 48px */
```

#### Border Radius (Standardized)
```css
--radius-sm: 0.375rem;   /* 6px - small elements */
--radius-md: 0.5rem;     /* 8px - buttons, inputs */
--radius-lg: 0.75rem;    /* 12px - cards, panels */
--radius-xl: 1rem;       /* 16px - modals */
--radius-2xl: 1.5rem;    /* 24px - hero elements */
--radius-full: 9999px;   /* Pills, avatars */
```

#### Shadows
```css
--shadow-card: 0 2px 4px -1px rgba(0,0,0,0.06), 0 4px 6px -1px rgba(0,0,0,0.1);
--shadow-card-hover: 0 10px 15px -3px rgba(0,0,0,0.1);
--shadow-modal: 0 20px 25px -5px rgba(0,0,0,0.1);
--shadow-focus: 0 0 0 3px rgba(249,115,22,0.3);
```

#### Typography Scale
```css
--font-size-xs: 0.75rem;    /* 12px */
--font-size-sm: 0.875rem;   /* 14px */
--font-size-base: 1rem;     /* 16px */
--font-size-lg: 1.125rem;   /* 18px */
--font-size-xl: 1.25rem;    /* 20px */
--font-size-2xl: 1.5rem;    /* 24px */
--font-size-3xl: 1.875rem;  /* 30px */
--font-size-4xl: 2.25rem;   /* 36px */
```

#### Transition Speeds
```css
--transition-fast: 150ms ease;
--transition-base: 200ms ease;
--transition-slow: 300ms ease;
```

### 2.2 Typography System
| Class | Use | Properties |
|-------|-----|-----------|
| `.heading-1` | Page titles | `text-4xl font-black tracking-tight` |
| `.heading-2` | Major sections | `text-3xl font-bold tracking-tight` |
| `.heading-3` | Section headers | `text-2xl font-bold` |
| `.heading-4` | Subsections | `text-xl font-semibold` |
| `.text-body` | Body copy | `text-sm text-slate-600` |
| `.text-label` | Form labels | `text-xs font-semibold uppercase` |

### 2.3 Component Systems

#### Button Classes
```css
.btn               /* Base: padding, radius, focus states */
.btn-primary       /* Orange brand, white text, shadow */
.btn-secondary     /* Slate background */
.btn-outline       /* Border with hover color change */
.btn-ghost         /* Transparent, hover background */
.btn-danger        /* Red, for destructive actions */
.btn-success       /* Green */
.btn-sm            /* Small variant: px-3 py-1.5 text-xs */
.btn-lg            /* Large variant: px-6 py-3 text-base */
```

#### Card System
```css
.card             /* White bg, border, rounded-lg, shadow-card */
.card-hover       /* Add hover: shadow-card-hover, border-slate-300 */
.card-body        /* Padding: p-6 */
.card-header      /* Top section with border-bottom */
```

### 2.4 Responsive Design Breakpoints
Uses **Tailwind CSS defaults**:
- `sm`: 640px
- `md`: 768px
- `lg`: 1024px (Sidebar fixed width used here)
- `xl`: 1280px
- `2xl`: 1536px

**Key responsive patterns:**
- Sidebar: `fixed` on lg+, `hidden` on mobile (triggered by `setSidebarOpen`)
- Dashboard grid: `grid-cols-1 md:grid-cols-4` (responsive columns)
- Tables: `overflow-x-auto` on mobile
- Forms: `grid grid-cols-1 md:grid-cols-2` (stacking on mobile)

---

## 3. ROUTES & PAGES

### 3.1 Application Routes (React Router v7)
Defined in [App.tsx](App.tsx#L26-L54):

| Route | Component | Protection | Purpose |
|-------|-----------|-----------|---------|
| `/` | Dashboard | None | Executive overview (KPIs, heatmap, governance score) |
| `/reporting` | ReportModule | None | Weekly progress reporting form |
| `/reports` | AllSummaryReports | None | Aggregated report viewer |
| `/ai` | AIAssistant | None | AI-powered assistance tool |
| `/objectives` | BusinessObjectives | `canManageObjectives` | Quarterly KR management |
| `/operations/attendance` | Attendance | None | Attendance tracking & stats |
| `/integrity` | IntegrityChecker | SuperAdmin/Admin/Director | Data integrity audit tool |
| `/users` | UserManagement | `canManageUsers` | User CRUD & role assignment |
| `/units` | BusinessUnits | `canManageUnits` | Business unit configuration |
| `/settings` | Settings | `canViewSettings` | Admin settings & governance config |
| `/settings/permissions` | Settings (tab) | `canViewSettings` | RBAC permissions viewer |
| `/settings/cycles` | Settings (tab) | `canViewSettings` | Cycle management |
| `/financials` | Financials | None | Finance module (fines, expenses, donations) |
| `*` | Navigate to `/` | - | Catch-all redirect |

### 3.2 Navigation Structure

#### Sidebar Menu (Collapsible: 300px → 84px)
Built from `navItems` in [useNavigation.tsx](src/hooks/useNavigation.tsx#L15-L45):

1. **Executive View** → `/` (Dashboard)
2. **Quarterly KRs** → `/objectives`
3. **Weekly Reporting** → `/reporting`
4. **All Summary Reports** → `/reports`
5. **AI Assistant** → `/ai`
6. **Attendance** → `/operations/attendance`
7. **Integrity Audit** → `/integrity`
8. **User Directory** → `/users`
9. **Business Units** → `/units`
10. **Governance Hub** (Parent)
    - Settings → `/settings`
    - Access Control → `/settings/permissions`
    - Cycles → `/settings/cycles`
11. **Financials** → `/financials`

Each item has:
- Permission check function (`canManageObjectives`, etc.)
- Lucide React icon
- Dynamic visibility based on user role

---

## 4. USER ROLES & PERMISSION SYSTEM

### 4.1 Role Hierarchy
Defined in [types/index.ts](src/types/index.ts#L16-L21):

```typescript
enum UserRole {
  SuperAdmin  // All permissions
  Admin       // Management + reports + settings
  Director    // Goals + reports + audit
  Manager     // Goals + reports + limited editing
  BULead      // Goals + basic reports + attendance
  Viewer      // Read-only
}
```

### 4.2 Permission System
**92 granular permissions** grouped by domain [types/index.ts#L38-L86]:

#### Permission Groups
| Group | Permissions | Roles |
|-------|------------|-------|
| **Users** | VIEW, CREATE, EDIT, DELETE, ASSIGN_ROLE | Admin, SuperAdmin |
| **Goals/KRs** | VIEW, CREATE, EDIT, DELETE, OVERRIDE | Director+, Manager, BULead |
| **Governance** | VIEW, CONFIG, LOCK, BYPASS | Admin+, Director |
| **Reports** | VIEW_BASIC, VIEW_ADVANCED, VIEW_EXECUTIVE, EXPORT | All+ |
| **Finance** | VIEW, MANAGE | Admin+, Director |
| **Attendance** | VIEW, MANAGE | All+, Director+ |
| **Settings** | VIEW, EDIT | Admin+, Director+ |
| **Audit** | VIEW, EXPORT | Admin+, Director |
| **System** | CONFIG, INTEGRITY | SuperAdmin, Admin |

### 4.3 Role Permission Matrix
```typescript
// From types/index.ts: ROLE_PERMISSIONS map
Viewer       → GOAL_VIEW, KR_VIEW, GOVERNANCE_VIEW, REPORTS_VIEW_BASIC
BULead       → +GOAL_CREATE, GOAL_EDIT, ATTENDANCE_VIEW
Manager      → +REPORTS_VIEW_ADVANCED, REPORTS_EXPORT
Director     → +GOAL_DELETE, KR_CREATE, KR_EDIT, REPORTS_VIEW_EXECUTIVE, 
               FINANCE_VIEW, ATTENDANCE_MANAGE, AUDIT_VIEW
Admin        → +USERS_*, GOVERNANCE_CONFIG, GOVERNANCE_LOCK, 
               FINANCE_MANAGE, SETTINGS_VIEW, SETTINGS_EDIT, 
               AUDIT_EXPORT, SYSTEM_INTEGRITY
SuperAdmin   → All 92 permissions
```

### 4.4 Permission Checks
Utilities in [utils/permissions.ts](src/utils/permissions.ts):
- `hasPermissionByRole(userRole, permission)` - Check single permission
- `hasAllPermissions(userRole, permissions[])` - AND check
- `hasAnyPermission(userRole, permissions[])` - OR check
- `getPermissionGroups()` - Organized permission list

Route protection example:
```tsx
<Route path="/objectives" element={
  <ProtectedRoute check={canManageObjectives}>
    <BusinessObjectives />
  </ProtectedRoute>
} />
```

---

## 5. KEY WORKFLOWS & USER JOURNEYS

### 5.1 Weekly Reporting Workflow
**Path:** `/reporting` → ReportModule

**Steps:**
1. Select KR from dropdown (all KRs in current quarter)
2. Add weekly progress update (AI review optional)
3. Add measurable activity details
4. Create tasks (with completion status: Done/NotDone/Undefined)
5. Add comments
6. Submit report

**Data Flow:**
- Fetches all KRs for current quarter
- Creates Goal record linked to KeyResult
- Stores tasks in nested Task array
- Logs audit: `CREATE` action
- Triggers governance lock checks

**AI Features:**
- Title vetting with AI ("AI Review" button)
- Suggestion generation from historical data
- Intelligence period selector: current week, last 4/8 weeks, full quarter

### 5.2 Quarterly KR Management Workflow
**Path:** `/objectives` → BusinessObjectives

**Steps:**
1. **Select quarter/year** using QuarterColumn navigation
2. **Create KR** modal:
   - Title, description
   - Select KR slot (KR1-KR4 per quarter)
   - Choose owner (user dropdown)
   - Initial progress/status
   - Optional parent KR (for sub-KRs)
3. **Edit KR** - inline modal form
4. **Delete KR** - confirmation dialog
5. **Bulk upload** - CSV import modal
6. **Lock/Unlock** quarter manually (override governance)

**Data Model:**
- KeyResult entity: `{ id, title, description, quarter, year, label, owner_id, progress, status, parent_kr_id }`
- Status: 'Green' (on track) | 'Amber' (at risk) | 'Red' (behind)
- Supports KR hierarchy (parent_kr_id for sub-KRs)
- System locks: `label === 'SYSTEM_LOCK'` with status='Red' = locked

**Orphan Detection:**
- Detects sub-KRs with missing parent
- Offers cleanup button to delete orphans
- Warns user on page load

### 5.3 User Management Workflow
**Path:** `/users` → UserManagement

**Create/Edit User:**
1. Open modal with form fields:
   - First/Last name
   - Email (corporate domain validation)
   - Department (BU dropdown)
   - Role (enum select: SuperAdmin → Viewer)
   - Avatar (image upload)
2. Validate email domain (whitelist in Governance Config)
3. Auto-generate avatar if not uploaded
4. Create/Update in `profiles` table
5. Audit log: `CREATE` or `UPDATE`

**Bulk Import:**
1. Upload CSV or paste data
2. CSV format: `firstName,lastName,email,department,role,avatarUrl`
3. Validate each row (email, role enum)
4. Show progress with success/error breakdown
5. Failed rows show error reason + suggested fix

**Batch Operations:**
- Suspend user (status = Suspended)
- Delete user (hard delete)
- Change role (for single or bulk)
- Export user list

### 5.4 Governance & Lock Workflow
**Path:** `/settings` → Governance configuration

**Lock Times:**
- Content soft-lock: Configurable day + time (e.g., Tuesday 5pm WAT)
- Final hard-lock: Configurable day + time (e.g., Next Tuesday 11am WAT)
- Manual override: Admin can manually lock/unlock quarters

**Automatic Locking:**
- Triggered by edge functions at scheduled times
- `SYSTEM_LOCK` KR records created/updated
- Prevents further edits when `status='Red'`

**Manual Override:**
- Admin clicks lock/unlock button on quarter
- Confirmation prompt
- Creates/updates `SYSTEM_LOCK` record
- Audited: `UPDATE` action with override reason

### 5.5 Financial Management Workflow
**Path:** `/financials` → Financials module

**Sub-workflows:**

#### A. Fine Management
1. **Configure Fine Types** (admin only):
   - Create fine type: name, description, default amount
   - Toggle active/inactive
   - Edit/delete existing

2. **Record Violations**:
   - Select violator (user dropdown)
   - Select department (BU dropdown)
   - Select fine type (links default amount)
   - Override amount if needed
   - Submit (creates Violation record)

3. **Track Payments**:
   - Mark fine as paid
   - Record payment receipt
   - Track per-user total fines

#### B. Expense Tracking
1. **Initiate Spend**:
   - Amount, category (select from EXPENSE_CATEGORIES)
   - Description
   - Requestor, approver, receiver (user selects)
   - Receipt upload (optional)
   - Submit

2. **Approval Flow**:
   - Awaiting approval state
   - Approver views expense
   - Approve/reject with comments

3. **Month Close**:
   - Summarize total income/expenses per month
   - Track variance vs. budget

#### C. Contributions
1. **Record Donation**:
   - Donor (user select or external name)
   - Amount
   - Anonymous flag
   - Submit

2. **Disbursement**:
   - Allocate contributions to projects
   - Approval workflow
   - Track allocation history

### 5.6 Attendance Workflow
**Path:** `/operations/attendance` → Attendance

**Daily Tracking:**
1. Mark attendance: Present, Remote, Absent, Excused
2. Record time joined (timestamp)
3. Calculate participation score (auto-computed)
4. Filter by department, status, date range

**Reports:**
- Attendance rate per department
- Participation trends over time
- Absence patterns

---

## 6. DATA MODELS & ENTITIES

### 6.1 Core Entities

#### User
```typescript
interface User {
  id: string;
  auth_id?: string;              // Supabase auth reference
  firstName: string;
  lastName: string;
  name: string;                  // Full name computed
  email: string;
  role: UserRole;                // One of 6 roles
  department: string;            // BU identifier
  avatarUrl: string;             // Generated or uploaded
  status: UserStatus;            // Active | Suspended
  mustChangePassword?: boolean;  // Recovery mode flag
}
```

#### KeyResult
```typescript
interface KeyResult {
  id: string;
  title: string;
  description?: string;
  quarter: string;               // Q1, Q2, Q3, Q4
  year: number;
  label: string;                 // KR1-KR4 or SYSTEM_LOCK
  owner_id: string;              // User ID
  progress: number;              // 0-100 %
  status: 'Green' | 'Amber' | 'Red';
  parent_kr_id?: string | null;  // For sub-KRs (optional)
}
```

#### Goal
```typescript
interface Goal {
  id: string;
  key_result_id: string;         // Links to KeyResult
  owner_id: string;              // User ID
  department: string;            // BU name
  title: string;
  tasks: Task[];                 // Weekly tasks
  comments?: string;
  week: number;                  // Week of year
  year: number;
  score: number;                 // Achievement score 0-100
}
```

#### Task
```typescript
interface Task {
  id: string;
  title: string;
  status: TaskStatus;            // Undefined | Done | NotDone
}
```

#### AttendanceRecord
```typescript
interface AttendanceRecord {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  department: string;
  status: AttendanceStatus;      // Present | Remote | Absent | Excused
  timeJoined: string | null;     // ISO timestamp
  participationScore: number;    // Calculated %
}
```

#### Violation (Fines)
```typescript
interface Violation {
  id: string;
  name: string;
  department: string;
  amount: number;
  date: string;
  paid: boolean;
  fine_type_id?: string;
}
```

#### Expense
```typescript
interface Expense {
  id: string;
  amount: number;
  description: string;
  category: string;              // From EXPENSE_CATEGORIES
  requestor: string;             // User name
  approver: string;              // User name
  receiver: string;              // Vendor name
  date: string;
  receiptUrl?: string;
}
```

#### AuditLogEntry
```typescript
interface AuditLogEntry {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'LOGIN' | 'IMPORT' | 
          'SYSTEM' | 'AI_QUERY' | 'INTEGRITY_ADJUSTMENT' | 'LOGOUT';
  details: string;
  ipAddress?: string;
  metadata?: Record<string, unknown>;
}
```

#### GovernanceConfig
```typescript
interface GovernanceConfig {
  contentLockDay: number;        // 0=Sun, 1=Mon, ..., 6=Sat
  contentLockTime: string;       // HH:MM 24-hour
  finalLockDay: number;
  finalLockTime: string;
  manualContentLock: boolean;    // Allow manual override
  manualFinalLock: boolean;
  disableLocks: boolean;         // Dev mode
  allowedDomains: string[];      // Email domain whitelist
  brandLogo?: string;
  brandLandingImage?: string;
  brandLoginImage?: string;
  smtpEnabled?: boolean;         // Email config
  smtpHost?: string;
  smtpPort?: number;
  smtpUser?: string;
  smtpPass?: string;
}
```

### 6.2 Database Schema
**Supabase PostgreSQL tables:**
- `profiles` - User records (extends Supabase auth)
- `key_results` - Quarterly objectives
- `goals` - Weekly goals linked to KRs
- `tasks` - Sub-tasks within goals
- `business_units` - Organization departments
- `attendance_records` - Daily attendance
- `violations` - Fines/penalties
- `expenses` - Spend requests
- `contributions` - Donations
- `fine_types` - Fine type templates
- `governance_config` - Platform configuration
- `audit_logs` - Activity history

### 6.3 Relationships
```
User
├── owns multiple KeyResults
├── owns multiple Goals
├── belongs to one BusinessUnit
├── has one AttendanceRecord (per day)
├── has multiple AuditLogEntries

KeyResult
├── has multiple sub-KeyResults (parent_kr_id)
├── has multiple Goals
└── may have SYSTEM_LOCK override

Goal
├── links to one KeyResult
├── has multiple Tasks
└── has one owner (User)

BusinessUnit
├── has multiple Users
└── referenced by Goals/Violations
```

---

## 7. STYLING APPROACH & PATTERNS

### 7.1 CSS Architecture
- **Framework:** Tailwind CSS 3.x + custom CSS variables
- **Design tokens:** Defined in [src/styles/design-system.css](src/styles/design-system.css)
- **CSS-in-JS:** None (Tailwind utility classes only)
- **Customization:** Via CSS variables (`var(--color-primary-500)`)

### 7.2 Styling Patterns

#### Using Design Tokens
```jsx
// ❌ Avoid hardcoded colors
<div className="bg-[#f97316]">...</div>

// ✅ Use CSS variables
<div className="bg-primary-600">...</div>

// ✅ Or reference via var()
<div style={{ backgroundColor: 'var(--color-primary-500)' }}>...</div>
```

#### Button Pattern
```jsx
<button className="btn btn-primary">
  Submit
</button>

<button className="btn btn-outline btn-sm">
  Cancel
</button>

<button className="btn btn-danger btn-lg">
  Delete All
</button>
```

#### Card Pattern
```jsx
<div className="card">
  <div className="card-header">Title</div>
  <div className="card-body">Content</div>
</div>

<div className="card card-hover">...</div>
```

#### Form Pattern
```jsx
<div className="space-y-2">
  <label className="text-xs font-bold text-slate-500 uppercase">Email</label>
  <input 
    type="email"
    className="w-full p-3 bg-white border border-slate-200 rounded-lg text-sm font-medium outline-none focus:ring-2 focus:ring-primary-500/20"
  />
</div>
```

#### Responsive Grid Pattern
```jsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
  {items.map(item => <Card>{item}</Card>)}
</div>
```

### 7.3 Key CSS Classes

#### Utility Overrides
```css
.custom-scrollbar {
  /* Custom scrollbar styling */
}

.nav-link {
  @apply px-6 py-3 flex items-center gap-3 rounded-lg text-sm font-medium 
         text-slate-600 transition-colors duration-200 whitespace-nowrap;
}

.nav-link-active {
  @apply bg-primary-50 text-primary-600 border-l-4 border-primary-500;
}

.animate-fade-in {
  animation: fadeIn 200ms ease-in-out;
}

.animate-scale-in {
  animation: scaleIn 200ms ease-out;
}
```

### 7.4 Focus States
All interactive elements follow:
```css
focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2
```

### 7.5 Hover Effects
**Cards:**
```
default: shadow-card
hover: shadow-card-hover + border-slate-300 + slight lift (hover:-translate-y-0.5)
```

**Buttons:**
```
primary: hover:bg-primary-700 + hover:shadow-md
secondary: hover:bg-slate-200
danger: hover:bg-red-700
```

---

## 8. RESPONSIVE DESIGN PATTERNS

### 8.1 Breakpoint Usage
| Breakpoint | Width | Usage |
|-----------|-------|-------|
| Default (mobile) | <640px | Single column, full-width, hidden lg elements |
| `sm` | 640px+ | Minor layout adjustments |
| `md` | 768px+ | 2-column grids, tablet layout |
| `lg` | 1024px+ | 3-4 column grids, sidebar visible |
| `xl` | 1280px+ | Full feature layout |

### 8.2 Mobile-First Components

#### Sidebar (Mobile Responsive)
```jsx
// Hidden on mobile, fixed left on lg+
<aside className="fixed inset-y-0 left-0 z-[50] w-[300px] lg:translate-x-0 -translate-x-full">
  {/* Sidebar slides in on mobile via state */}
</aside>
```

#### Dashboard Grid
```jsx
<div className="grid grid-cols-1 md:grid-cols-4 gap-6">
  {/* 1 col on mobile, 4 cols on md+ */}
</div>
```

#### Form Fields
```jsx
<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
  {/* 1 col form on mobile, 2 cols on md+ */}
</div>
```

#### Data Tables
```jsx
<div className="overflow-x-auto">
  <table className="w-full">
    {/* Scrollable on mobile */}
  </table>
</div>
```

### 8.3 Touch Target Sizes
Minimum 44px (2.75rem) for clickable elements:
```css
--touch-target-min: 2.75rem;

/* Applied to buttons, nav items */
.btn { min-height: var(--touch-target-min); }
```

### 8.4 Accessibility Patterns
- Focus states: All buttons/inputs have visible focus ring
- ARIA labels on icon buttons
- Semantic HTML: `<button>`, `<label>`, `<input>`
- Color contrast: All text meets WCAG AA
- Focus indicators: Not removed, always visible

---

## 9. NAVIGATION STRUCTURE

### 9.1 Navigation Levels

#### Level 1: Main Sidebar (Primary Navigation)
- Fixed left sidebar (lg+) or slide-in drawer (mobile)
- Icon + label pairs
- Active state: Orange background + left border
- Collapse toggle for mobile (84px → 300px)

**Items:** Executive View, Quarterly KRs, Weekly Reporting, etc. (11 items + parent menu)

#### Level 2: Top Header (Secondary Controls)
[UnifiedHeader.tsx](src/components/UnifiedHeader.tsx)
- Left: Menu toggle, quick action icons
- Right: Settings, notifications, user profile dropdown
- Sticky to top (z-[40])
- Shows current user name + avatar

#### Level 3: In-Page Tabs/Filters
- Settings: AuditLogTab, BrandUploadCard tabs
- IntegrityChecker: AuditTabs, ConfigTab
- Financials: Multiple sub-modules (Violations, Expenses, etc.)
- ReportModule: KR selector, activity timeline

#### Level 4: Modal/Inline Forms
- Create/edit modals: Fade + scale animation
- Bulk import dialogs: CSV upload or paste
- Confirmation dialogs: Delete/lock actions

### 9.2 Navigation State Management

**Hook:** `useNavigation(currentUser)` [useNavigation.tsx](src/hooks/useNavigation.tsx)

**State:**
- `authorizedNavItems[]` - Filtered by permission
- `expandedMenus: Set<string>` - Track open parent menus
- `toggleMenu(label)` - Add/remove from Set

**Permission Resolution:**
```typescript
const resolvePermissions = async () => {
  const results = await Promise.all(
    navItems.map(async (item) => {
      if (!item.check) return true;  // No permission required
      return await item.check();     // Async permission function
    })
  );
  setAuthorizedNavItems(navItems.filter((_, idx) => results[idx]));
};
```

### 9.3 Breadcrumb/Context
- No breadcrumbs implemented currently
- Page title shown in header region
- Context inferred from URL route

### 9.4 Deep Linking Support
- All routes support direct URL access (if permission granted)
- React Router Hash-based routing (`#/path`)
- Share URLs maintained across navigation

---

## 10. ADVANCED FEATURES

### 10.1 AI Integration
**Component:** AIAssistant.tsx

**Features:**
- AI title vetting during report submission
- Suggestion generation from historical context
- Query-based intelligence (last week vs. last quarter)
- Uses `ai-proxy` Edge Function

**API Integration:**
```typescript
const vetTitleWithAI = async () => {
  const response = await supabase.functions.invoke('ai-proxy', {
    body: { activityTitle, selectedKrId, currentQuarter }
  });
  return response.data.suggestion;
};
```

### 10.2 Real-Time Updates
**Mechanism:** Event-driven updates
```javascript
window.dispatchEvent(new Event('4COREUserUpdate'));
window.addEventListener('4COREUserUpdate', refetchData);
```

### 10.3 Bulk Operations
- **CSV Import:** Users, KRs, Expenses, etc.
- **Progress Tracking:** Real-time upload progress
- **Error Recovery:** Show failed rows with suggested fixes
- **Rollback:** Partial success handling

### 10.4 Audit & Compliance
- Full audit log: All CRUD + system actions
- Immutable records: No deletion, only creation
- Export capability: CSV download of audit logs
- Metadata tracking: IP address, timestamp, user context

### 10.5 Performance Optimizations

#### Caching
[utils.ts](src/utils.ts#L24-L32):
```typescript
const STALE_TIME = 30000;  // 30 seconds
const CACHE: Record<string, { data: unknown; lastFetch: number }> = {
  users: { data: null, lastFetch: 0 },
  bus: { data: null, lastFetch: 0 },
  // ... other keys
};
```

#### Lazy Loading
```typescript
const BusinessObjectives = lazy(() => 
  import('./components/BusinessObjectives/index')
    .then(m => ({ default: m.BusinessObjectives }))
);
```

#### Virtual Lists
`VirtualList.tsx` - For rendering thousands of items

#### Suspense Boundaries
```jsx
<Suspense fallback={<LoadingFallback />}>
  <Routes>
    {/* routes */}
  </Routes>
</Suspense>
```

### 10.6 Error Handling
- `ErrorBoundary.tsx` - Catches render errors
- Toast notifications - User feedback for actions
- Validation errors - Form-level & API-level
- Recovery flows - Password reset, session recovery

---

## 11. AUTHENTICATION & SECURITY

### 11.1 Auth Flow
[useAuth.ts](src/hooks/useAuth.ts):

**Login:**
1. Supabase auth sign-in with email/password
2. CSRF token validation
3. Fetch user profile from `profiles` table
4. Cache in React state + localStorage
5. Redirect to `/` (Dashboard)

**Session Recovery:**
1. Check Supabase session on app load
2. Look up profile by auth_id or email
3. Auto-create profile if new user
4. Set `mustChangePassword` flag if recovery mode

**Sign Out:**
1. Supabase auth sign-out
2. Clear simulated user (dev mode)
3. Clear localStorage/sessionStorage
4. Audit log: `LOGOUT` action
5. Redirect to login screen

### 11.2 Password Security
[Auth/PasswordUpdateForm.tsx](src/components/Auth/PasswordUpdateForm.tsx):
- Minimum 8 characters
- Password breach checking (via Have I Been Pwned API)
- CSRF token validation
- Bcrypt hashing (server-side)
- Automatic expiration after reset

### 11.3 Domain Whitelisting
[Settings component](src/components/Settings/index.tsx):
- Configurable allowed email domains (Admin only)
- Prevents signup from unauthorized domains
- Default: `['novaai.com.ng', 'fcis.com', 'pee.com']`
- Dynamic update via Settings UI

### 11.4 Rate Limiting
[Auth component](src/components/Auth/index.tsx):
```typescript
interface RateLimitState {
  attempts: number;
  lockedUntil: number | null;
  lastAttempt: number;
}
// 5 failed attempts → locked for 15 minutes
```

### 11.5 Simulated User (Dev Mode)
For testing without Supabase:
```typescript
const simulated = localStorage.getItem('4CORE_simulated_user');
if (simulated) return JSON.parse(simulated) as User;
```

---

## 12. KEY FILES REFERENCE

### Core App Files
- [App.tsx](App.tsx) - Main app component with routes
- [index.tsx](index.tsx) - React DOM mount
- [vite.config.ts](vite.config.ts) - Build config
- [tsconfig.json](tsconfig.json) - TypeScript config
- [package.json](package.json) - Dependencies & scripts
- [index.html](index.html) - HTML entry point

### Styles
- [src/styles/design-system.css](src/styles/design-system.css) - All design tokens
- [index.css](index.css) - Global styles (animations, utilities)

### Types & Constants
- [src/types/index.ts](src/types/index.ts) - All TypeScript interfaces & enums
- [src/types/unlockRequest.ts](src/types/unlockRequest.ts) - Unlock workflow types

### Utilities
- [src/utils.ts](src/utils.ts) - Main utilities (auth, caching, data fetching)
- [src/utils/permissions.ts](src/utils/permissions.ts) - RBAC helpers
- [src/utils/bpiCalculation.ts](src/utils/bpiCalculation.ts) - BPI score logic
- [src/utils/anomalyDetection.ts](src/utils/anomalyDetection.ts) - Anomaly detection
- [src/utils/unlockWorkflow.ts](src/utils/unlockWorkflow.ts) - Unlock request handling

### Hooks
- [src/hooks/useAuth.ts](src/hooks/useAuth.ts) - Authentication hook
- [src/hooks/useNavigation.tsx](src/hooks/useNavigation.tsx) - Navigation/permission hook

### Components
- [src/components/Auth/](src/components/Auth/) - Login/signup/password reset
- [src/components/Dashboard/](src/components/Dashboard/) - Executive dashboard
- [src/components/BusinessObjectives/](src/components/BusinessObjectives/) - KR management
- [src/components/ReportModule/](src/components/ReportModule/) - Weekly reporting
- [src/components/UserManagement/](src/components/UserManagement/) - User CRUD
- [src/components/Settings/](src/components/Settings/) - Admin settings
- [src/components/Financials/](src/components/Financials/) - Finance module
- [src/components/Attendance/](src/components/Attendance/) - Attendance tracking
- [src/components/ui/](src/components/ui/) - Reusable UI components
- [src/components/layout/](src/components/layout/) - App layout

### Tests
- [src/__tests__/auth.test.ts](src/__tests__/auth.test.ts) - Auth tests
- [src/__tests__/permissions.test.ts](src/__tests__/permissions.test.ts) - Permission tests
- [tests/](tests/) - E2E & integration tests

### Backend
- [supabase/functions/](supabase/functions/) - Edge Functions
  - `ai-proxy/` - AI integration wrapper
  - `send-email/` - Email sending
  - `process-hardlock/` - Automated lock scheduling
- [supabase/sql/](supabase/sql/) - Database migrations & setup

### Configuration
- [CLAUDE.md](CLAUDE.md) - Project documentation
- [README.md](README.md) - Project overview
- [package.json](package.json) - Dependencies & scripts
- [.env.example](.env.example) - Environment variables template

---

## 13. BUILD & DEPLOYMENT

### 13.1 Development
```bash
npm run dev          # Start Vite dev server
npm run test         # Run unit tests
npm run test:watch  # Watch mode tests
```

### 13.2 Production Build
```bash
npm run build         # Build to dist/
npm run build:verify  # Verify production build
npm run preview       # Preview production build
```

### 13.3 Testing
```bash
npm run test:coverage    # Coverage report
npm run test:e2e        # Cypress E2E tests
npm run test:auth       # Auth-specific tests
npm run test:security   # Security audit
npm run test:load       # Load testing
```

---

## 14. DEVELOPMENT PATTERNS

### 14.1 Component Structure Template
```tsx
interface ComponentProps {
  prop1: string;
  prop2?: number;
}

export const ComponentName: React.FC<ComponentProps> = ({ prop1, prop2 }) => {
  const [state, setState] = useState<Type>(initial);
  const { currentUser } = useAuth();
  const { addToast } = useToast();

  useEffect(() => {
    // Side effects
  }, [dependencies]);

  const handleAction = async () => {
    try {
      // Action logic
      logAudit('ACTION', 'Details');
      addToast('success', 'Success message');
    } catch (err) {
      addToast('error', 'Error message');
    }
  };

  return (
    <div className="space-y-6 p-6">
      {/* JSX */}
    </div>
  );
};
```

### 14.2 Modal Pattern
```tsx
{isModalOpen && (
  <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/40 backdrop-blur-sm">
    <div className="bg-white rounded-xl shadow-modal w-full max-w-2xl">
      <div className="p-8 border-b border-slate-100">
        <h2 className="text-xl font-bold">Title</h2>
      </div>
      <div className="p-8 space-y-6">
        {/* Content */}
      </div>
      <div className="p-8 border-t border-slate-100 flex gap-4 justify-end">
        <button onClick={handleCancel} className="btn btn-secondary">
          Cancel
        </button>
        <button onClick={handleConfirm} className="btn btn-primary">
          Confirm
        </button>
      </div>
    </div>
  </div>
)}
```

### 14.3 Form Validation Pattern
```tsx
const [errors, setErrors] = useState<Record<string, string>>({});

const validate = (): boolean => {
  const newErrors: Record<string, string> = {};
  if (!form.email) newErrors.email = 'Required';
  if (!form.email.includes('@')) newErrors.email = 'Invalid email';
  setErrors(newErrors);
  return Object.keys(newErrors).length === 0;
};

const handleSubmit = () => {
  if (!validate()) return;
  // Submit logic
};
```

### 14.4 Async Data Fetching Pattern
```tsx
const [data, setData] = useState<T | null>(null);
const [loading, setLoading] = useState(true);
const [error, setError] = useState<string | null>(null);

useEffect(() => {
  const fetchData = async () => {
    setLoading(true);
    try {
      const result = await fetchFromDB();
      setData(result);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  fetchData();
}, [dependencies]);
```

---

## 15. SUMMARY TABLE

| Aspect | Value |
|--------|-------|
| **Framework** | React 19 + TypeScript + Vite |
| **UI Library** | Tailwind CSS 3.x |
| **State Management** | React Hooks + Supabase |
| **Routing** | React Router v7 (Hash-based) |
| **Authentication** | Supabase Auth + Custom RBAC |
| **Database** | Supabase PostgreSQL |
| **API** | Supabase Client + Edge Functions |
| **Icons** | Lucide React |
| **Charts** | Recharts |
| **Animation** | Tailwind animations + Framer Motion |
| **Forms** | React hooks + custom validation |
| **Testing** | Jest + Cypress |
| **Build** | Vite |
| **Package Manager** | npm |
| **Browsers Supported** | Modern browsers (Chrome, Firefox, Safari, Edge) |
| **Mobile Support** | Responsive design (mobile-first) |
| **Accessibility** | WCAG 2.1 AA compliant |
| **Performance** | Lazy loading, caching, code splitting |

---

## 16. NEXT STEPS FOR DEVELOPMENT

### Common Tasks

#### Add a New Page
1. Create component in `src/components/NewPage/index.tsx`
2. Add route in `App.tsx`
3. Add nav item in `useNavigation.tsx` with permission check
4. Import design tokens (colors, spacing)
5. Build UI using card/button/form components

#### Add a Permission
1. Define in `Permission` enum in `types/index.ts`
2. Add to role in `ROLE_PERMISSIONS` map
3. Create permission check function in `permissions.ts`
4. Guard route with `<ProtectedRoute check={permissionCheck}>`

#### Create a Data Model
1. Define TypeScript interface in `types/index.ts`
2. Create Supabase table in SQL migration
3. Add fetch/create/update/delete functions in `utils.ts`
4. Use in components via hooks/utils

#### Style a Component
1. Use Tailwind classes from design system
2. Reference CSS variables: `var(--color-primary-500)`
3. Follow spacing grid (4px multiples)
4. Use standardized radius: `rounded-lg`, `rounded-xl`
5. Test responsive breakpoints (md, lg)

---

**Document Version:** 1.0  
**Last Updated:** April 2026  
**Maintainer:** 4CORE Development Team
