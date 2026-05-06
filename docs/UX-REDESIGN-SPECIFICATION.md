# 4CORE OKR Platform — Complete UX Redesign & Design System
## Implementation-Ready Specification Document

---

## 1. EXECUTIVE SUMMARY

### Current UX Maturity Score: **4.2 / 10**

The 4CORE OKR Platform has a solid functional foundation with good backend architecture, comprehensive RBAC, and a basic design system. However, the UI/UX suffers from structural issues that significantly impact usability, consistency, and user efficiency.

### Key Systemic Issues

| Category | Severity | Issue |
|----------|----------|-------|
| **Inconsistent UI Patterns** | Critical | Mix of CSS utility classes vs. React components; no unified Button/Input/Modal components |
| **Poor Navigation UX** | Critical | Sidebar expandedMenus defaults to `Set(['Accounting'])` — nonexistent menu; hardcoded parent labels mismatch children routes |
| **Cognitive Overload** | High | Dashboard displays 20+ unrelated widgets with no visual hierarchy or grouping |
| **Native Browser Dialogs** | High | Heavy use of `alert()` and `confirm()` instead of in-app modal/dialog system |
| **Static Data** | High | Dashboard uses hardcoded values instead of live Supabase data |
| **Missing Micro-interactions** | Medium | Cards/buttons lack hover/press feedback; no transition animations between states |
| **Accessibility Gaps** | Medium | Inconsistent focus states, missing ARIA labels, no skip-navigation |
| **Responsive Blindspots** | Medium | Mobile-first not enforced; touch targets undersized in many places |
| **Information Architecture** | Medium | Flat navigation structure doesn't reflect user roles; no breadcrumbs |
| **Loading States Inconsistent** | Low-Medium | Mix of skeleton loaders and spinners across modules |

### Transformation Vision

> **"Enterprise-grade clarity meets modern SaaS elegance — every interaction is intentional, every data point is actionable, and every click reduces cognitive load."**

**Design Pillars:**
1. **Clarity First** — Reduce decision fatigue with clear visual hierarchy and progressive disclosure
2. **Consistent Patterns** — One way to do things; component reuse enforced at design and code level
3. **Action-Oriented** — Every card, counter, and metric is clickable with clear affordances
4. **Motion with Purpose** — Animations communicate state changes, not decoration
5. **Accessible by Default** — WCAG 2.2 AA compliance as a baseline, not an afterthought

---

## 2. UX AUDIT FINDINGS

### 2.1 Critical Usability Issues

#### A. Navigation & IA Problems

**Issue 1: Orphaned Menu State**
```tsx
// src/hooks/useNavigation.tsx:51
const [expandedMenus, setExpandedMenus] = useState<Set<string>>(new Set(['Accounting']));
```
- `'Accounting'` is never a valid menu label — appears to be a debug artifact
- No menu in `navItems` has `label: 'Accounting'`
- **Impact**: First render shows empty expanded state; user must manually toggle to see submenus

**Issue 2: Route Mismatch with Navigation Labels**
```tsx
// src/hooks/useNavigation.tsx:41-43
children: [
  { to: '/settings', label: '- Settings' },  // Leading dash is UI pattern, not label
  { to: '/settings/permissions', label: '- Access Control' },
  { to: '/settings/cycles', label: '- Cycles' }
]
```
- The `'-'` prefix suggests a hack for visual hierarchy rather than proper CSS/styling
- `/settings/permissions` and `/settings/cycles` routes don't exist in App.tsx
- **Impact**: Dead links; broken navigation expectations

**Issue 3: "Governance Hub" is a Navigation Orphan**
```tsx
// src/hooks/useNavigation.tsx:34-45
{ to: '#', label: 'Governance Hub', isParent: true, children: [...] }
```
- `to: '#'` is not a valid route — this parent item cannot be navigated to directly
- The parent itself is a dead link
- **Impact**: Users cannot click "Governance Hub" to expand; must click the chevron icon

#### B. Interaction Inconsistencies

**Issue 4: Native Browser Dialogs Used Throughout**
```tsx
// src/components/BusinessObjectives/index.tsx:92, 95, 107, 131
alert(`Successfully removed ${orphanIds.length} orphaned sub-KR(s).`);
alert('Failed to cleanup orphaned sub-KRs.');
if (!confirm(`Are you sure you want to manually ${currentLockedState ? 'UNLOCK' : 'LOCK'}...`))

// src/components/ReportModule/index.tsx:151, 396, 408-409
alert(`Save failure: ${e.message || "Check cloud status."}`);
alert(isPartiallyLocked ? "Status-Only Mode" : "Report Locked");
if (confirm('Delete this goal?'))
```
- **Impact**: Breaks UX consistency, poor accessibility, different visual treatment per OS
- **Fix Required**: Replace with custom Dialog/ConfirmModal components

#### C. Dashboard Static Data

**Issue 5: Hardcoded Dashboard Metrics**
```tsx
// src/components/Dashboard/index.tsx:22-26
<StatCard bgColor="#3B82F6" icon={<Clock />} title={...Cycle Time...} subtitle="Week 5 of 12..." />
<StatCard ... value={24} subtitle="Active Objectives" />  // Hardcoded 24
<StatCard ... value={8} subtitle="Business Units" />       // Hardcoded 8
```
- **Impact**: Dashboard shows false information; not reflective of actual system state
- Stats should come from Supabase queries

#### D. Empty/Loading States

**Issue 6: Inconsistent Loading Indicators**
```tsx
// src/components/ReportModule/index.tsx:281-284 — Spinner
<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>

// src/components/BusinessObjectives/index.tsx:248-251 — Skeleton with icon
<LoaderCircle className="w-12 h-12 animate-spin text-primary-500 mb-6" />
<p className="font-bold uppercase tracking-widest text-[10px] text-slate-400">Syncing Strategic Nodes...</p>
```
- **Impact**: Different loading patterns create cognitive dissonance

### 2.2 Friction Points by User Journey

#### Journey: First-Time Admin Sets Up OKRs
1. User logs in → lands on Dashboard with static/hardcoded data → **trust erodes**
2. User navigates to "Quarterly KRs" → sees 4-column layout → **unclear what to do first**
3. User tries to add KR → clicks "Add" → modal opens → **but which quarter?**
4. User fills form → no inline validation feedback → saves → error → **confusion**
5. Total: **12+ interactions** to create first KR (should be 5-6)

#### Journey: Manager Reviews Team Progress
1. Navigate to Weekly Reporting → wait for load → **no skeleton, blank screen**
2. Filter by week → dropdown interaction is slow → **perceived lag**
3. See goal cards → need to click into each to see task status → **no summary at card level**
4. Find incomplete tasks → need to cross-reference with last week → **manual work**
5. Total: **8+ interactions** to assess team status (should be 3-4)

#### Journey: Director Reviews Company Health
1. Land on Dashboard → see 15+ widgets competing for attention → **cognitive overload**
2. Want to drill into "At Risk" items → click chart → **no detail view**
3. Want to see BPI trend → see tiny axis labels → **unreadable**
4. Total: **impossible to assess quickly** — defeats executive dashboard purpose

---

## 3. REDESIGNED USER JOURNEYS

### 3.1 Onboarding Journey (New Admin)

```
BEFORE:
[Login] → [Blank Dashboard] → [Guess Settings] → [Find Quarterly KRs] → [Click Add] → [Confusion]

AFTER:
[Login] → [Guided Setup Modal] → [Quick Tour Tooltips] → [Pre-populated Sample KRs] → [Ready to Use]
```

### 3.2 Weekly Reporting Flow

```
BEFORE:
[Go to Reporting] → [Find Week Dropdown] → [Scroll to KR1] → [Click "Add Goal"] →
[Fill Form] → [Add Tasks One-by-One] → [Save] → [Repeat for KR2-KR4]

AFTER:
[Go to Reporting] → [Week Selector (prominent)] → [See KR Columns with existing goals] →
[Click "+ Add" on any KR] → [Inline creation with AI assist] → [Auto-save on blur]
```

### 3.3 Executive Review Flow

```
BEFORE:
[Dashboard] → [Parse 15 widgets] → [Guess what matters] → [Click something] → [Get lost]

AFTER:
[Dashboard] → [3-4 Hero Metrics (clickable)] → [Drill into "At Risk" filter] →
[See action items sorted by priority] → [Take action or delegate]
```

---

## 4. INFORMATION ARCHITECTURE REDESIGN

### 4.1 Navigation Model — "Command Center" Approach

**Problems with Current IA:**
- Flat structure treats all users the same
- Admin tools mixed with operational tools
- No clear entry points for different user roles

**Proposed Role-Based Navigation:**

```
EXECUTIVE (Director+)
├── Executive Dashboard (Hero metrics, company health)
├── Weekly Reporting (Own department focus)
├── AI Assistant (Quick insights)
└── Reports (Aggregated views)

OPERATIONAL (Manager, BULead)
├── My Dashboard (Personalized KPIs)
├── Weekly Reporting (Team scope)
├── Business Units (View)
└── Reports (Department scope)

ADMINISTRATIVE (Admin, SuperAdmin)
├── Dashboard (Full company view)
├── Quarterly KRs (Full CRUD)
├── Weekly Reporting (All departments)
├── User Directory (Full CRUD)
├── Business Units (Full CRUD)
├── Financials (Full access)
├── Settings (All tabs)
└── Integrity Audit (Full access)
```

### 4.2 Recommended Navigation Structure

```tsx
// PROPOSED: src/navigation/navConfig.ts

interface NavSection {
  id: string;
  label: string;           // Section header (not clickable)
  items: NavItem[];
}

interface NavItem {
  id: string;
  to: string;              // Route path (or null for labels only)
  label: string;           // Display label
  icon: LucideIcon;        // Lucide icon component
  badge?: number | string; // Optional badge count
  badgeType?: 'count' | 'status' | 'new';
  children?: NavItem[];    // Sub-items for expandable groups
  permission?: Permission | Permission[];
  roles?: UserRole[];
}

// Example Configuration:
export const navigationConfig: NavSection[] = [
  {
    id: 'overview',
    label: 'Overview',
    items: [
      { id: 'dashboard', to: '/', label: 'Dashboard', icon: LayoutDashboard, permission: Permission.GOAL_VIEW },
      { id: 'reporting', to: '/reporting', label: 'Weekly Reporting', icon: FileText, permission: Permission.GOAL_VIEW },
      { id: 'ai', to: '/ai', label: 'AI Assistant', icon: Sparkles, permission: Permission.GOAL_VIEW },
    ]
  },
  {
    id: 'governance',
    label: 'Governance',
    items: [
      { id: 'quarterly-krs', to: '/objectives', label: 'Quarterly KRs', icon: Target, permission: Permission.KR_VIEW },
      { id: 'integrity', to: '/integrity', label: 'Integrity Audit', icon: ShieldIcon, roles: [UserRole.SuperAdmin, UserRole.Admin, UserRole.Director] },
    ]
  },
  {
    id: 'organization',
    label: 'Organization',
    items: [
      { id: 'users', to: '/users', label: 'User Directory', icon: UsersIcon, permission: Permission.USERS_VIEW },
      { id: 'units', to: '/units', label: 'Business Units', icon: Building2, permission: Permission.KR_VIEW },
      { id: 'attendance', to: '/operations/attendance', label: 'Attendance', icon: Calendar, permission: Permission.ATTENDANCE_VIEW },
    ]
  },
  {
    id: 'analytics',
    label: 'Analytics',
    items: [
      { id: 'reports', to: '/reports', label: 'Summary Reports', icon: BarChart3, permission: Permission.REPORTS_VIEW_BASIC },
    ]
  },
  {
    id: 'administration',
    label: 'Administration',
    items: [
      { id: 'financials', to: '/financials', label: 'Financials', icon: Landmark, permission: Permission.FINANCE_VIEW },
      {
        id: 'settings-parent',
        to: null,              // Parent only — not clickable
        label: 'Settings',
        icon: SettingsIcon,
        permission: Permission.SETTINGS_VIEW,
        children: [
          { id: 'settings-general', to: '/settings', label: 'General', icon: SettingsIcon },
          { id: 'settings-permissions', to: '/settings/permissions', label: 'Access Control', icon: ShieldCheck },
          { id: 'settings-cycles', to: '/settings/cycles', label: 'Cycles', icon: CalendarClock },
        ]
      },
    ]
  },
];
```

### 4.3 Breadcrumb Specification

All nested routes must include breadcrumbs:

```
/reporting → Weekly Reporting
/reporting?week=5 → Weekly Reporting › Week 5
/settings/permissions → Settings › Access Control
/objectives → Quarterly KRs
/objectives?q=Q1 → Quarterly KRs › Q1 2026
```

**Breadcrumb Component Requirements:**
- Clickable links for all segments except current
- Truncation with tooltip for long labels
- `/` separator with muted color

---

## 5. DESIGN SYSTEM SPECIFICATION v2.0

### 5.1 Typography System

**Font Stack:**
```css
--font-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
--font-mono: 'JetBrains Mono', 'Fira Code', 'Consolas', monospace;
```

**Google Fonts Import:**
```html
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
```

**Type Scale (8px baseline, 1.25 ratio):**

| Token | Size | Weight | Line Height | Letter Spacing | Usage |
|-------|------|--------|-------------|----------------|-------|
| `--text-hero` | 48px | 900 (Black) | 1.1 | -0.03em | Large hero numbers (BPI scores) |
| `--text-h1` | 36px | 800 (Extrabold) | 1.2 | -0.025em | Page titles |
| `--text-h2` | 30px | 700 (Bold) | 1.25 | -0.02em | Section headers |
| `--text-h3` | 24px | 700 (Bold) | 1.3 | -0.015em | Card titles |
| `--text-h4` | 20px | 600 (Semibold) | 1.4 | -0.01em | Subsections |
| `--text-h5` | 16px | 600 (Semibold) | 1.5 | 0 | Component headers |
| `--text-body-lg` | 18px | 400 (Regular) | 1.6 | 0 | Lead paragraphs |
| `--text-body` | 16px | 400 (Regular) | 1.6 | 0 | Body text |
| `--text-body-sm` | 14px | 400 (Regular) | 1.5 | 0.01em | Secondary text |
| `--text-caption` | 12px | 500 (Medium) | 1.4 | 0.02em | Captions, labels |
| `--text-overline` | 11px | 600 (Semibold) | 1.2 | 0.08em | OVERLINE LABELS (uppercase) |

### 5.2 Color System

**Primary Palette (Orange — brand identity):**
```css
--primary-50: #fff7ed;   /* Lightest background */
--primary-100: #ffedd5;
--primary-200: #fed7aa;
--primary-300: #fdba74;
--primary-400: #fb923c;
--primary-500: #f97316;  /* PRIMARY — main brand */
--primary-600: #ea580c;  /* DARK — hover states */
--primary-700: #c2410c;  /* DARKER — active states */
--primary-800: #9a3412;
--primary-900: #7c2d12;  /* Darkest text on light */
```

**Semantic Colors:**

```css
/* Success (Green) */
--success-50: #f0fdf4;
--success-100: #dcfce7;
--success-500: #22c55e;  /* MAIN */
--success-600: #16a34a;  /* DARK */
--success-700: #15803d;

/* Warning (Amber) */
--warning-50: #fffbeb;
--warning-100: #fef3c7;
--warning-500: #f59e0b;  /* MAIN */
--warning-600: #d97706;  /* DARK */
--warning-700: #b45309;

/* Error (Red) */
--error-50: #fef2f2;
--error-100: #fee2e2;
--error-500: #ef4444;    /* MAIN */
--error-600: #dc2626;    /* DARK */
--error-700: #b91c1c;

/* Info (Blue) */
--info-50: #eff6ff;
--info-100: #dbeafe;
--info-500: #3b82f6;     /* MAIN */
--info-600: #2563eb;     /* DARK */
--info-700: #1d4ed8;

/* Neutral (Slate) — full 10-step scale */
--slate-50: #f8fafc;
--slate-100: #f1f5f9;
--slate-200: #e2e8f0;
--slate-300: #cbd5e1;
--slate-400: #94a3b8;
--slate-500: #64748b;
--slate-600: #475569;
--slate-700: #334155;
--slate-800: #1e293b;
--slate-900: #0f172a;
--slate-950: #020617;    /* Darkest — modal overlays */
```

**Status Color Mapping:**

| Status | Background | Text | Border | Usage |
|--------|------------|------|--------|-------|
| On Track | `--success-50` | `--success-700` | `--success-200` | Green badges, progress |
| At Risk | `--warning-50` | `--warning-700` | `--warning-200` | Amber badges |
| Behind | `--error-50` | `--error-700` | `--error-200` | Red badges |
| Locked | `--slate-100` | `--slate-500` | `--slate-200` | Disabled states |

### 5.3 Spacing & Layout

**8pt Grid System:**

```css
--space-0: 0;
--space-1: 0.25rem;   /* 4px */
--space-2: 0.5rem;    /* 8px */
--space-3: 0.75rem;   /* 12px */
--space-4: 1rem;      /* 16px */
--space-5: 1.25rem;   /* 20px */
--space-6: 1.5rem;    /* 24px */
--space-8: 2rem;      /* 32px */
--space-10: 2.5rem;   /* 40px */
--space-12: 3rem;     /* 48px */
--space-16: 4rem;     /* 64px */
--space-20: 5rem;     /* 80px */
--space-24: 6rem;     /* 96px */
```

**Container Widths:**

```css
--container-xs: 320px;   /* Minimal content (errors, confirmations) */
--container-sm: 400px;   /* Small modals, dropdowns */
--container-md: 560px;   /* Medium modals */
--container-lg: 720px;   /* Large modals, wide forms */
--container-xl: 960px;   /* Content max-width */
--container-2xl: 1280px; /* Wide dashboards */
```

**Sidebar Dimensions:**

```css
--sidebar-collapsed-width: 72px;   /* Icon-only mode */
--sidebar-expanded-width: 280px;   /* Full navigation */
--sidebar-header-height: 72px;
```

### 5.4 Border Radius System

```css
--radius-sm: 6px;      /* Small elements: badges, chips */
--radius-md: 8px;      /* Inputs, buttons, small cards */
--radius-lg: 12px;     /* Cards, panels, dropdowns */
--radius-xl: 16px;     /* Modals, large containers */
--radius-2xl: 24px;    /* Hero cards, featured sections */
--radius-full: 9999px; /* Avatars, pills, toggle knobs */
```

### 5.5 Shadow System

```css
--shadow-xs: 0 1px 2px rgba(0,0,0,0.04);                    /* Subtle depth */
--shadow-sm: 0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04); /* Cards at rest */
--shadow-md: 0 4px 6px -1px rgba(0,0,0,0.08), 0 2px 4px -1px rgba(0,0,0,0.04); /* Hover state */
--shadow-lg: 0 10px 15px -3px rgba(0,0,0,0.08), 0 4px 6px -2px rgba(0,0,0,0.04); /* Dropdowns */
--shadow-xl: 0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04); /* Modals */
--shadow-focus: 0 0 0 3px rgba(249,115,22,0.3);             /* Focus rings */
--shadow-focus-error: 0 0 0 3px rgba(239,68,68,0.3);        /* Error focus */
```

### 5.6 Motion & Transitions

```css
--duration-instant: 50ms;   /* Hover states */
--duration-fast: 150ms;     /* Micro-interactions */
--duration-base: 200ms;     /* Standard transitions */
--duration-slow: 300ms;     /* Modals, drawers */
--duration-slower: 400ms;   /* Page transitions */

--ease-default: cubic-bezier(0.4, 0, 0.2, 1);        /* Standard */
--ease-in: cubic-bezier(0.4, 0, 1, 1);                /* Entering */
--ease-out: cubic-bezier(0, 0, 0.2, 1);               /* Exiting */
--ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);     /* Bouncy/spring */
```

---

## 6. COMPONENT LIBRARY DEFINITION

### 6.1 Component Architecture Overview

All components follow this structure:
```
src/components/
├── ui/                    # Atomic primitives (design system)
│   ├── Button/
│   │   ├── Button.tsx
│   │   ├── Button.stories.tsx
│   │   └── Button.test.tsx
│   ├── Input/
│   ├── Select/
│   ├── Modal/
│   ├── Dialog/
│   ├── Card/
│   ├── Badge/
│   ├── Avatar/
│   ├── Skeleton/
│   ├── Toast/
│   └── index.ts           # Barrel export
├── layout/                # Layout components
│   ├── Sidebar/
│   ├── Header/
│   ├── Breadcrumbs/
│   └── CommandPalette/
├── feedback/              # Feedback components
│   ├── Alert/
│   ├── LoadingSpinner/
│   ├── ProgressBar/
│   └── EmptyState/
└── domain/                # Domain-specific components
    ├── StatCard/
    ├── GoalCard/
    ├── KRColumn/
    └── ...
```

### 6.2 Button Component

```tsx
// src/components/ui/Button/Button.tsx

import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '../../lib/utils';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success';
type ButtonSize = 'xs' | 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  isFullWidth?: boolean;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: 'bg-primary-600 text-white shadow-sm hover:bg-primary-700 hover:shadow-md focus-visible:ring-primary-500',
  secondary: 'bg-slate-100 text-slate-700 border border-slate-200 hover:bg-slate-200 hover:border-slate-300',
  outline: 'border-2 border-slate-200 text-slate-600 bg-white hover:border-primary-300 hover:text-primary-600',
  ghost: 'text-slate-600 bg-transparent hover:bg-slate-100 hover:text-slate-900',
  danger: 'bg-red-600 text-white shadow-sm hover:bg-red-700 hover:shadow-md',
  success: 'bg-emerald-600 text-white shadow-sm hover:bg-emerald-700 hover:shadow-md',
};

const sizeClasses: Record<ButtonSize, string> = {
  xs: 'px-2.5 py-1.5 text-xs gap-1.5 rounded-md',
  sm: 'px-3 py-2 text-sm gap-2 rounded-lg',
  md: 'px-4 py-2.5 text-sm gap-2 rounded-lg',
  lg: 'px-6 py-3 text-base gap-2.5 rounded-xl',
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  isFullWidth = false,
  disabled,
  className,
  children,
  ...props
}, ref) => {
  return (
    <button
      ref={ref}
      disabled={disabled || isLoading}
      className={cn(
        'inline-flex items-center justify-center font-semibold',
        'transition-all duration-200 ease-out',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
        'disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none',
        'active:scale-[0.98]',  // Press effect
        variantClasses[variant],
        sizeClasses[size],
        isFullWidth && 'w-full',
        className
      )}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="animate-spin" size={size === 'xs' ? 12 : size === 'sm' ? 14 : 16} />
      ) : leftIcon ? (
        <span className="shrink-0">{leftIcon}</span>
      ) : null}
      {children}
      {!isLoading && rightIcon && <span className="shrink-0">{rightIcon}</span>}
    </button>
  );
});

Button.displayName = 'Button';

// States covered:
// ✓ Default    — Standard appearance
// ✓ Hover      — Darker shade + shadow lift
// ✓ Active     — Scale down (press effect)
// ✓ Focus      — Ring highlight
// ✓ Disabled   — 50% opacity, no pointer events
// ✓ Loading    — Spinner replaces icon
```

### 6.3 Input Component

```tsx
// src/components/ui/Input/Input.tsx

import React from 'react';
import { AlertCircle } from 'lucide-react';
import { cn } from '../../lib/utils';

type InputSize = 'sm' | 'md' | 'lg';

interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  hint?: string;
  error?: string;
  size?: InputSize;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  isFullWidth?: boolean;
}

const sizeClasses: Record<InputSize, string> = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2.5 text-sm',
  lg: 'px-4 py-3 text-base',
};

export const Input = React.forwardRef<HTMLInputElement, InputProps>(({
  label,
  hint,
  error,
  size = 'md',
  leftIcon,
  rightIcon,
  isFullWidth = true,
  className,
  id,
  ...props
}, ref) => {
  const inputId = id || `input-${Math.random().toString(36).slice(2)}`;
  const hasError = Boolean(error);

  return (
    <div className={cn('flex flex-col gap-1.5', isFullWidth && 'w-full')}>
      {label && (
        <label htmlFor={inputId} className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
          {label}
          {props.required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
      )}
      <div className="relative">
        {leftIcon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
            {leftIcon}
          </div>
        )}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            'w-full bg-white border rounded-md font-medium',
            'transition-all duration-200',
            'placeholder:text-slate-400',
            'focus:outline-none focus:ring-2 focus:ring-offset-0',
            sizeClasses[size],
            hasError
              ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
              : 'border-slate-200 focus:border-primary-500 focus:ring-primary-500/20',
            'disabled:bg-slate-50 disabled:text-slate-500 disabled:cursor-not-allowed',
            leftIcon && 'pl-10',
            rightIcon && 'pr-10',
            className
          )}
          aria-invalid={hasError}
          aria-describedby={hasError ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
          {...props}
        />
        {rightIcon && !hasError && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
            {rightIcon}
          </div>
        )}
        {hasError && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-red-500">
            <AlertCircle size={16} />
          </div>
        )}
      </div>
      {hasError && (
        <p id={`${inputId}-error`} className="text-xs text-red-600 font-medium flex items-center gap-1">
          {error}
        </p>
      )}
      {hint && !hasError && (
        <p id={`${inputId}-hint`} className="text-xs text-slate-500">{hint}</p>
      )}
    </div>
  );
});

Input.displayName = 'Input';
```

### 6.4 Modal / Dialog Component

```tsx
// src/components/ui/Modal/Modal.tsx

import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Button } from '../Button/Button';

type ModalSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'full';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  size?: ModalSize;
  children: React.ReactNode;
  footer?: React.ReactNode;
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
  showCloseButton?: boolean;
  preventScroll?: boolean;
}

const sizeClasses: Record<ModalSize, string> = {
  xs: 'max-w-xs',
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  full: 'max-w-[calc(100vw-4rem)] max-h-[calc(100vh-4rem)]',
};

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  size = 'md',
  children,
  footer,
  closeOnOverlayClick = true,
  closeOnEscape = true,
  showCloseButton = true,
  preventScroll = true,
}) => {
  const overlayRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<Element | null>(null);

  useEffect(() => {
    if (isOpen) {
      previousActiveElement.current = document.activeElement;
      if (preventScroll) {
        document.body.style.overflow = 'hidden';
      }
    } else {
      document.body.style.overflow = '';
      if (previousActiveElement.current instanceof HTMLElement) {
        previousActiveElement.current.focus();
      }
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen, preventScroll]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && closeOnEscape && isOpen) {
        onClose();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose, closeOnEscape]);

  if (!isOpen) return null;

  return createPortal(
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'modal-title' : undefined}
      aria-describedby={description ? 'modal-description' : undefined}
      onClick={closeOnOverlayClick ? (e) => e.target === overlayRef.current && onClose() : undefined}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm animate-fade-in"
        aria-hidden="true"
      />

      {/* Modal Panel */}
      <div
        className={cn(
          'relative bg-white rounded-xl shadow-xl w-full animate-scale-in',
          'transform transition-all duration-200',
          sizeClasses[size]
        )}
        style={{ maxHeight: 'calc(100vh - 2rem)' }}
      >
        {/* Header */}
        {(title || showCloseButton) && (
          <div className="flex items-start justify-between p-6 border-b border-slate-100">
            <div>
              {title && (
                <h2 id="modal-title" className="text-lg font-bold text-slate-900">
                  {title}
                </h2>
              )}
              {description && (
                <p id="modal-description" className="mt-1 text-sm text-slate-500">
                  {description}
                </p>
              )}
            </div>
            {showCloseButton && (
              <Button
                variant="ghost"
                size="sm"
                className="shrink-0 -mr-2 -mt-2 text-slate-400 hover:text-slate-600"
                onClick={onClose}
                aria-label="Close modal"
              >
                <X size={18} />
              </Button>
            )}
          </div>
        )}

        {/* Body */}
        <div className="p-6 overflow-y-auto" style={{ maxHeight: footer ? 'calc(100% - 160px)' : '100%' }}>
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="flex items-center justify-end gap-3 p-6 border-t border-slate-100 bg-slate-50/50 rounded-b-xl">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
};

// ConfirmDialog sub-component for confirmation modals
interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'warning' | 'info';
  isLoading?: boolean;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'danger',
  isLoading = false,
}) => {
  const buttonVariant = variant === 'danger' ? 'danger' : variant === 'warning' ? 'primary' : 'secondary';

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <p className="text-slate-600">{message}</p>
      <div className="flex gap-3 mt-6 justify-end">
        <Button variant="ghost" onClick={onClose} disabled={isLoading}>
          {cancelLabel}
        </Button>
        <Button variant={buttonVariant} onClick={onConfirm} isLoading={isLoading}>
          {confirmLabel}
        </Button>
      </div>
    </Modal>
  );
};
```

### 6.5 Card Component (Enhanced)

```tsx
// src/components/ui/Card/Card.tsx

import React from 'react';
import { cn } from '../../lib/utils';

type CardPadding = 'none' | 'sm' | 'md' | 'lg' | 'xl';
type CardVariant = 'default' | 'bordered' | 'elevated' | 'flat';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  variant?: CardVariant;
  padding?: CardPadding;
  isInteractive?: boolean;
  onClick?: () => void;
  as?: 'div' | 'article' | 'section';
}

const paddingClasses: Record<CardPadding, string> = {
  none: '',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
  xl: 'p-10',
};

const variantClasses: Record<CardVariant, string> = {
  default: 'bg-white border border-slate-200 shadow-sm',
  bordered: 'bg-white border border-slate-200',
  elevated: 'bg-white shadow-lg',
  flat: 'bg-slate-50',
};

export const Card: React.FC<CardProps> = ({
  children,
  className,
  variant = 'default',
  padding = 'md',
  isInteractive = false,
  onClick,
  as: Component = 'div',
}) => {
  const isClickable = Boolean(onClick);

  return (
    <Component
      onClick={onClick}
      className={cn(
        'rounded-xl',
        paddingClasses[padding],
        variantClasses[variant],
        isInteractive && 'cursor-pointer transition-all duration-200 hover:shadow-md hover:border-slate-300 hover:-translate-y-0.5 active:translate-y-0 active:shadow-sm',
        isClickable && !isInteractive && 'cursor-pointer',
        className
      )}
      role={isClickable ? 'button' : undefined}
      tabIndex={isClickable ? 0 : undefined}
      onKeyDown={isClickable ? (e) => e.key === 'Enter' && onClick?.() : undefined}
    >
      {children}
    </Component>
  );
};

// Card sub-components
interface CardHeaderProps {
  children: React.ReactNode;
  className?: string;
  action?: React.ReactNode;
}

export const CardHeader: React.FC<CardHeaderProps> = ({ children, className, action }) => (
  <div className={cn('flex items-center justify-between mb-4', className)}>
    <div className="flex items-center gap-3">{children}</div>
    {action && <div>{action}</div>}
  </div>
);

interface CardTitleProps {
  children: React.ReactNode;
  className?: string;
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
}

export const CardTitle: React.FC<CardTitleProps> = ({ children, className, as: Component = 'h3' }) => (
  <Component className={cn('text-lg font-bold text-slate-900', className)}>{children}</Component>
);

interface CardDescriptionProps {
  children: React.ReactNode;
  className?: string;
}

export const CardDescription: React.FC<CardDescriptionProps> = ({ children, className }) => (
  <p className={cn('text-sm text-slate-500 mt-1', className)}>{children}</p>
);

interface CardContentProps {
  children: React.ReactNode;
  className?: string;
}

export const CardContent: React.FC<CardContentProps> = ({ children, className }) => (
  <div className={cn('', className)}>{children}</div>
);

interface CardFooterProps {
  children: React.ReactNode;
  className?: string;
}

export const CardFooter: React.FC<CardFooterProps> = ({ children, className }) => (
  <div className={cn('mt-4 pt-4 border-t border-slate-100', className)}>{children}</div>
);
```

### 6.6 Badge Component

```tsx
// src/components/ui/Badge/Badge.tsx

import React from 'react';
import { cn } from '../../lib/utils';

type BadgeVariant = 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'outline';
type BadgeSize = 'sm' | 'md' | 'lg';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  size?: BadgeSize;
  className?: string;
  dot?: boolean;        // Show colored dot before text
  removable?: boolean;  // Show X button
  onRemove?: () => void;
}

const variantClasses: Record<BadgeVariant, string> = {
  primary: 'bg-primary-100 text-primary-700',
  success: 'bg-emerald-100 text-emerald-700',
  warning: 'bg-amber-100 text-amber-700',
  danger: 'bg-red-100 text-red-700',
  info: 'bg-blue-100 text-blue-700',
  neutral: 'bg-slate-100 text-slate-600',
  outline: 'bg-transparent border border-slate-200 text-slate-600',
};

const dotColors: Record<BadgeVariant, string> = {
  primary: 'bg-primary-500',
  success: 'bg-emerald-500',
  warning: 'bg-amber-500',
  danger: 'bg-red-500',
  info: 'bg-blue-500',
  neutral: 'bg-slate-500',
  outline: 'bg-slate-500',
};

const sizeClasses: Record<BadgeSize, string> = {
  sm: 'px-2 py-0.5 text-[10px]',
  md: 'px-2.5 py-1 text-xs',
  lg: 'px-3 py-1.5 text-sm',
};

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'neutral',
  size = 'md',
  className,
  dot = false,
  removable = false,
  onRemove,
}) => {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full font-semibold',
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
    >
      {dot && (
        <span className={cn('w-1.5 h-1.5 rounded-full', dotColors[variant])} />
      )}
      {children}
      {removable && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove?.();
          }}
          className="ml-0.5 -mr-1 rounded-full hover:bg-black/10 p-0.5 transition-colors"
          aria-label="Remove"
        >
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>
      )}
    </span>
  );
};

// StatusBadge convenience component
interface StatusBadgeProps {
  status: 'green' | 'amber' | 'red' | 'locked';
  showDot?: boolean;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, showDot = true }) => {
  const config = {
    green: { variant: 'success' as const, label: 'On Track' },
    amber: { variant: 'warning' as const, label: 'At Risk' },
    red: { variant: 'danger' as const, label: 'Behind' },
    locked: { variant: 'neutral' as const, label: 'Locked' },
  };
  const { variant, label } = config[status];
  return (
    <Badge variant={variant} dot={showDot}>
      {label}
    </Badge>
  );
};
```

### 6.7 Toast Component (Enhanced)

```tsx
// src/components/ui/Toast/Toast.tsx

import React, { createContext, useContext, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { CheckCircle2, XCircle, AlertTriangle, Info, X, Lock, Scale } from 'lucide-react';
import { cn } from '../../lib/utils';

type ToastType = 'success' | 'error' | 'warning' | 'info' | 'lock' | 'penalty';

interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface ToastContextValue {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => string;
  removeToast: (id: string) => void;
  clearAll: () => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within ToastProvider');
  return context;
};

const toastConfig: Record<ToastType, { icon: React.ReactNode; className: string }> = {
  success: { icon: <CheckCircle2 size={20} />, className: 'bg-emerald-50 border-emerald-200 text-emerald-800' },
  error: { icon: <XCircle size={20} />, className: 'bg-red-50 border-red-200 text-red-800' },
  warning: { icon: <AlertTriangle size={20} />, className: 'bg-amber-50 border-amber-200 text-amber-800' },
  info: { icon: <Info size={20} />, className: 'bg-blue-50 border-blue-200 text-blue-800' },
  lock: { icon: <Lock size={20} />, className: 'bg-slate-50 border-slate-200 text-slate-800' },
  penalty: { icon: <Scale size={20} />, className: 'bg-red-50 border-red-200 text-red-800' },
};

const ToastItem: React.FC<{ toast: Toast; onRemove: () => void }> = ({ toast, onRemove }) => {
  const config = toastConfig[toast.type];

  React.useEffect(() => {
    if (toast.duration !== 0) {
      const timer = setTimeout(onRemove, toast.duration || 5000);
      return () => clearTimeout(timer);
    }
  }, [toast.duration, onRemove]);

  return (
    <div
      className={cn(
        'flex items-start gap-3 p-4 rounded-lg border shadow-lg animate-slide-up',
        'min-w-[320px] max-w-[420px]',
        config.className
      )}
      role="alert"
      aria-live="polite"
    >
      <div className="shrink-0 mt-0.5">{config.icon}</div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm">{toast.title}</p>
        {toast.message && <p className="text-sm opacity-80 mt-0.5">{toast.message}</p>}
        {toast.action && (
          <button
            onClick={toast.action.onClick}
            className="text-sm font-semibold underline underline-offset-2 mt-2 hover:opacity-80"
          >
            {toast.action.label}
          </button>
        )}
      </div>
      <button
        onClick={onRemove}
        className="shrink-0 p-1 rounded hover:bg-black/10 transition-colors"
        aria-label="Dismiss"
      >
        <X size={16} />
      </button>
    </div>
  );
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = crypto.randomUUID();
    setToasts(prev => [...prev, { ...toast, id }]);
    return id;
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const clearAll = useCallback(() => setToasts([]), []);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast, clearAll }}>
      {children}
      {createPortal(
        <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2" aria-label="Notifications">
          {toasts.map(toast => (
            <ToastItem key={toast.id} toast={toast} onRemove={() => removeToast(toast.id)} />
          ))}
        </div>,
        document.body
      )}
    </ToastContext.Provider>
  );
};
```

### 6.8 Skeleton Component

```tsx
// src/components/ui/Skeleton/Skeleton.tsx

import React from 'react';
import { cn } from '../../lib/utils';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string | number;
  height?: string | number;
  animation?: 'pulse' | 'shimmer' | 'wave' | 'none';
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className,
  variant = 'text',
  width,
  height,
  animation = 'shimmer',
}) => {
  const baseClass = 'bg-slate-200';
  const animationClass = animation === 'none' ? '' :
    animation === 'pulse' ? 'animate-pulse' :
    animation === 'wave' ? 'animate-pulse' : // Using pulse for wave as fallback
    'animate-shimmer';

  const variantClass = variant === 'circular' ? 'rounded-full' :
    variant === 'rectangular' ? 'rounded-lg' : 'rounded';

  const style: React.CSSProperties = {
    width: typeof width === 'number' ? `${width}px` : width,
    height: typeof height === 'number' ? `${height}px` : height,
  };

  return (
    <div
      className={cn(baseClass, animationClass, variantClass, className)}
      style={style}
      aria-hidden="true"
    />
  );
};

// Preset skeleton components
export const SkeletonText: React.FC<{ lines?: number; className?: string }> = ({ lines = 3, className }) => (
  <div className={cn('space-y-2', className)}>
    {Array.from({ length: lines }).map((_, i) => (
      <Skeleton key={i} height={16} width={i === lines - 1 ? '60%' : '100%'} />
    ))}
  </div>
);

export const SkeletonCard: React.FC<{ className?: string }> = ({ className }) => (
  <div className={cn('p-6 bg-white rounded-xl border border-slate-200', className)}>
    <div className="flex items-center gap-4 mb-4">
      <Skeleton variant="circular" width={48} height={48} />
      <div className="flex-1 space-y-2">
        <Skeleton height={20} width="60%" />
        <Skeleton height={14} width="40%" />
      </div>
    </div>
    <SkeletonText lines={3} />
  </div>
);

export const SkeletonTable: React.FC<{ rows?: number; cols?: number; className?: string }> = ({
  rows = 5, cols = 4, className
}) => (
  <div className={cn('border border-slate-200 rounded-lg overflow-hidden', className)}>
    <div className="bg-slate-50 border-b border-slate-200 p-4">
      <div className="flex gap-8">
        {Array.from({ length: cols }).map((_, i) => (
          <Skeleton key={i} height={14} width={80} />
        ))}
      </div>
    </div>
    {Array.from({ length: rows }).map((_, rowIdx) => (
      <div key={rowIdx} className="p-4 border-b border-slate-100 last:border-0">
        <div className="flex gap-8">
          {Array.from({ length: cols }).map((_, colIdx) => (
            <Skeleton key={colIdx} height={16} width={colIdx === 0 ? 120 : 80} />
          ))}
        </div>
      </div>
    ))}
  </div>
);

export const SkeletonChart: React.FC<{ className?: string }> = ({ className }) => (
  <div className={cn('p-6 bg-white rounded-xl border border-slate-200', className)}>
    <Skeleton height={20} width={160} className="mb-6" />
    <div className="flex items-end justify-between h-40 gap-2">
      {Array.from({ length: 12 }).map((_, i) => (
        <Skeleton
          key={i}
          width="100%"
          height={`${Math.random() * 60 + 40}%`}
          animation="shimmer"
        />
      ))}
    </div>
  </div>
);
```

---

## 7. SCREEN REDESIGNS

### 7.1 Dashboard Redesign

**Current Issues:**
- 20+ widgets with no visual hierarchy
- Hardcoded static data
- No clear action paths
- No clickable drill-downs

**Proposed Redesign — "Command Center" Layout:**

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ HEADER: User context bar (breadcrumb, search, notifications, profile)      │
├──────────┬──────────────────────────────────────────────────────────────────┤
│          │ HERO SECTION — 3-4 Key Metrics (large, clickable)                │
│          │ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ │
│          │ │   BPI       │ │ CYCLE TIME  │ │ ACTIVE KRs  │ │ COMPLIANCE  │ │
│          │ │   32        │ │  W5/12      │ │   24        │ │   94%       │ │
│          │ │   ▲ +4      │ │   41%       │ │   ▼ -2      │ │             │ │
│  SIDEBAR │ └──────┬──────┘ └──────┬──────┘ └──────┬──────┘ └──────┬──────┘ │
│          │        │ clickable    │               │               │        │
│          ├────────┴──────────────┴───────────────┴───────────────┴────────┤
│          │ MAIN CONTENT — Tab-based sections                               │
│          │ [ Executive View ] [ Department View ] [ My Tasks ]             │
│          │ ┌────────────────────────────────────────────────────────────┐ │
│          │ │ KR Progress Overview — Stacked bar chart by status         │ │
│          │ │ [On Track: 20] [At Risk: 1] [Behind: 17]                   │ │
│          │ └────────────────────────────────────────────────────────────┘ │
│          │ ┌─────────────────────┐ ┌─────────────────────────────────────┐ │
│          │ │ Pending Actions     │ │ AI Insights                         │ │
│          │ │ • 3 reports missing │ │ "Execution operating smoothly"      │ │
│          │ │ • 2 tasks overdue   │ │ [View Details]                      │ │
│          │ │ • Lock in 2 days    │ │                                     │ │
│          │ └─────────────────────┘ └─────────────────────────────────────┘ │
│          │ ┌────────────────────────────────────────────────────────────┐ │
│          │ │ Recent Activity Feed — Timeline format                     │ │
│          │ └────────────────────────────────────────────────────────────┘ │
└──────────┴─────────────────────────────────────────────────────────────────┘
```

**Key Changes:**
1. Hero metrics are LARGE (clickable cards, not small stat boxes)
2. Each hero metric links to detailed view
3. Tab-based content organization (not all widgets visible at once)
4. "Pending Actions" section replaces anomaly alerts (actionable)
5. AI Insights in a dedicated card
6. Activity feed in chronological timeline

### 7.2 Weekly Reporting Redesign

**Current Flow (12+ interactions):**
1. See week selector
2. See all KRs in columns
3. Click "+ Add Goal" on a KR
4. Modal opens
5. Fill form
6. Add tasks one-by-one
7. Close modal
8. Repeat

**Proposed Flow (5-6 interactions):**

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ REPORTING — Week 5, 2026    [◀ Prev] [Week 5 ▼] [Next ▶]    [+ New Goal]  │
│ Department: Engineering                              [Filters ▼] [Export]  │
├─────────────────────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────────────────────────┐ │
│ │ REPORTING STATS              │ GOAL SCORE       │ TASK COMPLETION      │ │
│ │ 24 Goals  │  Avg 67%  │  18/24  │ │ Progress bar      │ 72% ████████░░    │ │
│ └─────────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
│ ┌─ KR1: Revenue Growth ─────────────────────────────────────────────────┐  │
│ │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐                 │  │
│ │  │ Goal Card    │  │ Goal Card    │  │ + Add Goal   │                 │  │
│ │  │ ─────────    │  │ ─────────    │  │              │                 │  │
│ │  │ Tasks: 3/5 ✓ │  │ Tasks: 1/3   │  │ Click to     │                 │  │
│ │  │ Score: 85%   │  │ Score: 40%   │  │ create inline│                 │  │
│ │  └──────────────┘  └──────────────┘  └──────────────┘                 │  │
│ └─────────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│ ┌─ KR2: Customer Acquisition ───────────────────────────────────────────┐  │
│ │  [Similar structure]                                                   │  │
│ └─────────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│ ┌─ LAST WEEK OUTSTANDING (Expandable) ─────────────────────────────────┐  │
│ │  ▲ 3 incomplete tasks from Week 4                                     │  │
│ │  ┌─────────┐ ┌─────────┐ ┌─────────┐                                  │  │
│ │  │ Task 1  │ │ Task 2  │ │ Task 3  │  [Click to carry forward]        │  │
│ │  └─────────┘ └─────────┘ └─────────┘                                  │  │
│ └─────────────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Key Changes:**
1. **Inline Goal Creation** — Click "+ Add" opens inline form in the column, not a modal
2. **Task Status at Card Level** — Immediately visible task progress, not hidden
3. **Quick Actions on Cards** — Hover reveals edit/delete/duplicate
4. **Carry Forward** — One-click to move incomplete tasks to current week
5. **Collapsible "Last Week Outstanding"** — Prominent but not always expanded

### 7.3 Goal Card — Component Specification

```tsx
// src/components/domain/GoalCard/GoalCard.tsx

import React, { useState } from 'react';
import { MoreHorizontal, Edit2, Trash2, Copy, ChevronDown, ChevronUp } from 'lucide-react';
import { Goal, Task, TaskStatus } from '../../types';
import { Badge } from '../../ui/Badge/Badge';
import { Button } from '../../ui/Button/Button';
import { cn } from '../../lib/utils';

interface GoalCardProps {
  goal: Goal;
  onEdit?: (goal: Goal) => void;
  onDelete?: (goalId: string) => void;
  onDuplicate?: (goal: Goal) => void;
  onTaskToggle?: (goalId: string, taskId: string) => void;
  isLocked?: boolean;
  compact?: boolean;
}

const taskStatusConfig = {
  [TaskStatus.Done]: { label: 'Done', variant: 'success' as const, icon: '✓' },
  [TaskStatus.NotDone]: { label: 'Not Done', variant: 'danger' as const, icon: '✗' },
  [TaskStatus.Undefined]: { label: 'Pending', variant: 'neutral' as const, icon: '○' },
};

export const GoalCard: React.FC<GoalCardProps> = ({
  goal,
  onEdit,
  onDelete,
  onDuplicate,
  onTaskToggle,
  isLocked = false,
  compact = false,
}) => {
  const [isExpanded, setIsExpanded] = useState(!compact);
  const [showMenu, setShowMenu] = useState(false);

  const tasks = goal.tasks || [];
  const completedTasks = tasks.filter(t => t.status === TaskStatus.Done).length;
  const taskProgress = tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0;

  return (
    <div
      className={cn(
        'bg-white rounded-xl border border-slate-200 shadow-sm transition-all duration-200',
        'hover:shadow-md hover:border-slate-300 group',
        isLocked && 'opacity-75'
      )}
    >
      {/* Card Header */}
      <div className="p-4 pb-0">
        <div className="flex items-start justify-between gap-2">
          <h4 className="font-semibold text-slate-900 text-sm line-clamp-2 flex-1">
            {goal.title}
          </h4>
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => onEdit?.(goal)}
              className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600"
              aria-label="Edit goal"
            >
              <Edit2 size={14} />
            </button>
            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600"
                aria-label="More actions"
              >
                <MoreHorizontal size={14} />
              </button>
              {showMenu && (
                <div className="absolute right-0 top-full mt-1 w-40 bg-white rounded-lg shadow-lg border border-slate-200 py-1 z-10 animate-fade-in">
                  <button
                    onClick={() => { onDuplicate?.(goal); setShowMenu(false); }}
                    className="w-full px-3 py-2 text-left text-sm text-slate-600 hover:bg-slate-50 flex items-center gap-2"
                  >
                    <Copy size={14} /> Duplicate
                  </button>
                  <button
                    onClick={() => { onDelete?.(goal.id); setShowMenu(false); }}
                    className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                  >
                    <Trash2 size={14} /> Delete
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Task Progress Summary — ALWAYS VISIBLE */}
      <div className="px-4 py-3">
        <div className="flex items-center justify-between text-xs mb-2">
          <span className="text-slate-500 font-medium">
            {completedTasks}/{tasks.length} tasks
          </span>
          <span className={cn(
            'font-bold',
            taskProgress >= 70 ? 'text-emerald-600' :
            taskProgress >= 40 ? 'text-amber-600' : 'text-red-600'
          )}>
            {taskProgress}%
          </span>
        </div>
        <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
          <div
            className={cn(
              'h-full rounded-full transition-all duration-500',
              taskProgress >= 70 ? 'bg-emerald-500' :
              taskProgress >= 40 ? 'bg-amber-500' : 'bg-red-500'
            )}
            style={{ width: `${taskProgress}%` }}
          />
        </div>
      </div>

      {/* Task List — Expandable */}
      {tasks.length > 0 && (
        <div className="px-4 pb-4">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-full flex items-center justify-center gap-1 py-1.5 text-xs text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
          >
            {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            {isExpanded ? 'Hide tasks' : 'Show tasks'}
          </button>

          {isExpanded && (
            <div className="mt-2 space-y-1.5 animate-fade-in">
              {tasks.map((task) => {
                const config = taskStatusConfig[task.status];
                return (
                  <div
                    key={task.id}
                    className={cn(
                      'flex items-center gap-2.5 p-2 rounded-lg text-sm transition-colors',
                      'hover:bg-slate-50 cursor-pointer group/task',
                      !isLocked && 'cursor-pointer'
                    )}
                    onClick={() => !isLocked && onTaskToggle?.(goal.id, task.id)}
                    role="checkbox"
                    aria-checked={task.status === TaskStatus.Done}
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === ' ' || e.key === 'Enter') {
                        e.preventDefault();
                        !isLocked && onTaskToggle?.(goal.id, task.id);
                      }
                    }}
                  >
                    <span className={cn(
                      'w-4 h-4 rounded border flex items-center justify-center text-[10px] font-bold shrink-0',
                      'transition-colors',
                      task.status === TaskStatus.Done
                        ? 'bg-emerald-500 border-emerald-500 text-white'
                        : task.status === TaskStatus.NotDone
                        ? 'bg-red-500 border-red-500 text-white'
                        : 'border-slate-300 text-transparent group-hover/task:border-slate-400'
                    )}>
                      {config.icon}
                    </span>
                    <span className={cn(
                      'flex-1',
                      task.status === TaskStatus.Done && 'line-through text-slate-400'
                    )}>
                      {task.title}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Card Footer — Score */}
      {goal.score > 0 && (
        <div className="px-4 pb-4 pt-0">
          <Badge variant={goal.score >= 70 ? 'success' : goal.score >= 40 ? 'warning' : 'danger'}>
            Score: {goal.score}%
          </Badge>
        </div>
      )}
    </div>
  );
};
```

### 7.4 Quarterly KRs — Grid Layout Redesign

```
┌──────────────────────────────────────────────────────────────────────────────┐
│ STRATEGIC GOVERNANCE ENGINE                              [◀ 2026 ▶] [+ Add] │
│ Q1 ████░░ 67%  Q2 ░░░░░░ 0%  Q3 ░░░░░░ 0%  Q4 ░░░░░░ 0%                    │
├──────────────────────────────────────────────────────────────────────────────┤
│ ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐ ┌─────────────┐ │
│ │      Q1         │ │      Q2         │ │      Q3         │ │     Q4      │ │
│ │  Jan — Mar      │ │  Apr — Jun      │ │  Jul — Sep      │ │  Oct — Dec  │ │
│ │  ┌───────────┐  │ │  ┌───────────┐  │ │  ┌───────────┐  │ │             │ │
│ │  │ KR1 Card  │  │ │  │ Empty     │  │ │  │ Empty     │  │ │   Locked    │ │
│ │  │ Progress  │  │ │  │ State     │  │ │  │ State     │  │ │   (Future)  │ │
│ │  │ ─ Sub-KRs │  │ │  │ + Add KR  │  │ │  │ + Add KR  │  │ │             │ │
│ │  └───────────┘  │ │  └───────────┘  │ │  └───────────┘  │ │             │ │
│ │  ┌───────────┐  │ │                 │ │                 │ │             │ │
│ │  │ KR2 Card  │  │ │                 │ │                 │ │             │ │
│ │  └───────────┘  │ │                 │ │                 │ │             │ │
│ │  [+ Add KR]     │ │                 │ │                 │ │             │ │
│ └─────────────────┘ └─────────────────┘ └─────────────────┘ └─────────────┘ │
└──────────────────────────────────────────────────────────────────────────────┘
```

**Key Improvements:**
1. Current quarter highlighted with colored header
2. Future quarters show "Locked" overlay with lock icon
3. Past quarters show actual data
4. Quarter-level progress bar at top
5. Empty state with clear CTA for quarters with no KRs

---

## 8. INTERACTION & MOTION GUIDELINES

### 8.1 Animation Philosophy

**Purpose over decoration** — Every animation communicates something:
- **State change** — Element appearing/disappearing
- **feedback** — Response to user action
- **relationship** — Spatial connection between elements
- **attention** — Draw eye to important changes

**Performance first** — Animations must not block interaction:
- Use `transform` and `opacity` only (GPU-accelerated)
- Never animate `width`, `height`, `margin`, `padding` on layout triggers
- Keep durations under 400ms for UI feedback, under 300ms for micro-interactions

### 8.2 Animation Tokens

```css
:root {
  /* Duration tokens */
  --duration-instant: 50ms;    /* Immediate feedback (hover bg) */
  --duration-fast: 150ms;      /* Quick transitions (color changes) */
  --duration-base: 200ms;      /* Standard UI transitions */
  --duration-slow: 300ms;      /* Modal/drawer open */
  --duration-slower: 400ms;    /* Page transitions */

  /* Easing tokens */
  --ease-default: cubic-bezier(0.4, 0, 0.2, 1);
  --ease-in: cubic-bezier(0.4, 0, 1, 1);
  --ease-out: cubic-bezier(0, 0, 0.2, 1);
  --ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);  /* Bouncy */
  --ease-smooth: cubic-bezier(0.25, 0.1, 0.25, 1);
}
```

### 8.3 Animation Use Cases

| Animation | Trigger | Duration | Easing | Description |
|-----------|---------|----------|--------|-------------|
| **Fade In** | Element appears | 200ms | ease-out | Opacity 0→1 |
| **Fade Out** | Element disappears | 150ms | ease-in | Opacity 1→0 |
| **Scale In** | Modal, dropdown open | 200ms | ease-spring | Scale 0.95→1 + fade |
| **Slide Up** | Toast, tooltip appear | 250ms | ease-out | TranslateY 8px→0 + fade |
| **Slide Down** | Dropdown menu open | 150ms | ease-out | Height auto with fade |
| **Hover Lift** | Card, button hover | 200ms | ease-out | translateY -2px + shadow increase |
| **Press Down** | Button click | 50ms | ease-in | scale 0.98 |
| **Skeleton Shimmer** | Loading state | 1.5s | linear | Background position sweep |
| **Progress Fill** | Progress bar update | 400ms | ease-out | Width change |
| **Stagger** | List item appear | 50ms delay between items | — | Sequential fade-in |

### 8.4 Animation Code Patterns

**CSS Animation Classes:**
```css
.animate-fade-in {
  animation: fadeIn var(--duration-base) var(--ease-out) forwards;
}

.animate-scale-in {
  animation: scaleIn var(--duration-base) var(--ease-spring) forwards;
}

.animate-slide-up {
  animation: slideUp var(--duration-slow) var(--ease-out) forwards;
}

.animate-slide-down {
  animation: slideDown var(--duration-fast) var(--ease-out) forwards;
}

/* Hover lift effect (for cards) */
.hover-lift {
  transition: transform var(--duration-base) var(--ease-out),
              box-shadow var(--duration-base) var(--ease-out);
}
.hover-lift:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

/* Press effect (for buttons) */
.press-effect:active {
  transform: scale(0.98);
  transition: transform var(--duration-instant) var(--ease-in);
}

/* Skeleton shimmer */
.skeleton-shimmer {
  background: linear-gradient(
    90deg,
    var(--slate-100) 25%,
    var(--slate-200) 50%,
    var(--slate-100) 75%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
```

**React Animation Pattern (using CSS):**
```tsx
// Staggered list animation pattern
const ListItem: React.FC<{ index: number; children: React.ReactNode }> = ({ index, children }) => (
  <div
    style={{
      animationDelay: `${index * 50}ms`,
      animationFillMode: 'both',
    }}
    className="animate-fade-in"
  >
    {children}
  </div>
);

// Usage
<div className="space-y-2">
  {items.map((item, index) => (
    <ListItem key={item.id} index={index}>
      {item.content}
    </ListItem>
  ))}
</div>
```

### 8.5 Motion Restrictions

**Never animate:**
- `display`, `visibility` (use opacity with JS callback for cleanup)
- `width`/`height` on elements that trigger layout
- `top`, `left`, `right`, `bottom` (use `transform` instead)
- `border-width` during hover (causes layout recalc)

**Avoid:**
- Animations that loop indefinitely (except skeleton loading)
- Animations longer than 400ms for UI feedback
- Animations that start automatically on page load (except loading states)
- Motion that moves more than 20px (causes eye fatigue)

---

## 9. ACCESSIBILITY COMPLIANCE (WCAG 2.2)

### 9.1 Accessibility Checklist

| Requirement | Level | Current Status | Target |
|-------------|-------|----------------|--------|
| Non-text contrast ratio ≥ 3:1 | AA | ⚠️ Partial | ✓ |
| Text contrast ratio ≥ 4.5:1 (normal) / ≥ 3:1 (large) | AA | ✓ | ✓ |
| Focus visible indicator | AA | ⚠️ Inconsistent | ✓ |
| Target size ≥ 44x44px (touch) | AA | ⚠️ Some areas | ✓ |
| Keyboard navigation | AA | ⚠️ Missing skip links | ✓ |
| Focus order | AA | ✓ | ✓ |
| No keyboard trap | A | ✓ | ✓ |
| Skip navigation link | A | ✗ Missing | ✓ |
| Page titles | A | ✓ | ✓ |
| Language attributes | A | ✓ | ✓ |
| Form labels | A | ⚠️ Some | ✓ |
| Error identification | A | ⚠️ Native alerts | ✓ |
| Error suggestion | AA | ⚠️ | ✓ |
| Error prevention (legal) | A | N/A | N/A |
| Parsing (duplicate IDs) | A | ✓ | ✓ |
| Name/role/value | A | ✓ | ✓ |
| Status messages | AA | ✗ | ✓ |

### 9.2 Implementation Requirements

#### A. Focus Management

```tsx
// FocusTrap component for modals
import React, { useEffect, useRef } from 'react';

interface FocusTrapProps {
  children: React.ReactNode;
  enabled?: boolean;
}

export const FocusTrap: React.FC<FocusTrapProps> = ({ children, enabled = true }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!enabled) return;

    const container = containerRef.current;
    if (!container) return;

    const focusableSelectors = [
      'button:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      'a[href]',
      '[tabindex]:not([tabindex="-1"])',
    ].join(', ');

    const focusableElements = container.querySelectorAll(focusableSelectors);
    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    };

    container.addEventListener('keydown', handleKeyDown);
    firstElement?.focus();

    return () => container.removeEventListener('keydown', handleKeyDown);
  }, [enabled]);

  return <div ref={containerRef}>{children}</div>;
};
```

#### B. Skip Navigation

```tsx
// src/components/layout/SkipNav.tsx

export const SkipNav: React.FC = () => (
  <a
    href="#main-content"
    className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[200] focus:px-4 focus:py-2 focus:bg-primary-600 focus:text-white focus:rounded-lg focus:font-semibold"
  >
    Skip to main content
  </a>
);

// Usage in layout:
<>
  <SkipNav />
  <Sidebar />
  <main id="main-content" tabIndex={-1}>
    {children}
  </main>
</>
```

#### C. ARIA Pattern for Interactive Cards

```tsx
// All clickable cards must follow this pattern
<div
  role="button"
  tabIndex={0}
  onClick={handleClick}
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  }}
  aria-label={`View details for ${title}`}
  aria-describedby={`${id}-description`}
>
  <span id={`${id}-description`} className="sr-only">
    {description}
  </span>
  {/* content */}
</div>
```

#### D. Color + Icon for Status (not color alone)

```tsx
// Bad: Color only
<Badge variant="success">On Track</Badge>

// Good: Color + Icon + Text
<Badge variant="success" dot>
  <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
  </svg>
  On Track
</Badge>
```

#### E. Touch Target Minimum

```css
/* Enforce minimum touch target */
.touch-target {
  min-width: 44px;
  min-height: 44px;
}

/* For icon-only buttons, wrap in touch target */
.icon-button-wrapper {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 44px;
  min-height: 44px;
}
```

---

## 10. IMPLEMENTATION GUIDANCE

### 10.1 Project Structure

```
src/
├── components/
│   ├── ui/                      # Design system components
│   │   ├── Button/
│   │   │   ├── Button.tsx
│   │   │   ├── Button.test.tsx
│   │   │   └── index.ts
│   │   ├── Input/
│   │   ├── Select/
│   │   ├── Modal/
│   │   ├── Dialog/
│   │   ├── Card/
│   │   ├── Badge/
│   │   ├── Avatar/
│   │   ├── Skeleton/
│   │   ├── Toast/
│   │   ├── Spinner/
│   │   ├── Tooltip/
│   │   ├── Dropdown/
│   │   ├── Tabs/
│   │   └── index.ts
│   ├── layout/                  # Layout components
│   │   ├── Sidebar/
│   │   │   ├── Sidebar.tsx
│   │   │   ├── SidebarItem.tsx
│   │   │   └── index.ts
│   │   ├── Header/
│   │   ├── Breadcrumbs/
│   │   ├── CommandPalette/
│   │   └── index.ts
│   ├── domain/                  # Business-specific components
│   │   ├── StatCard/
│   │   ├── GoalCard/
│   │   ├── KRColumn/
│   │   ├── UserRow/
│   │   └── ...
│   └── index.ts
├── navigation/
│   ├── navConfig.ts             # Centralized navigation config
│   ├── useNavigation.ts         # Navigation hook
│   └── types.ts
├── hooks/
│   ├── useAuth.ts
│   ├── useToast.ts
│   ├── useKeyboard.ts
│   └── useMediaQuery.ts
├── styles/
│   ├── globals.css              # Tailwind base + CSS variables
│   └── design-system.css        # Full design tokens
├── lib/
│   ├── utils.ts                 # cn() helper, formatters
│   └── constants.ts
├── types/
│   └── index.ts
├── App.tsx
└── main.tsx
```

### 10.2 Utility Function (cn - className merge)

```tsx
// src/lib/utils.ts

import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Usage:
// cn('px-4', isActive && 'bg-primary-100', className)
```

### 10.3 Design Token Export (CSS → TypeScript)

```tsx
// src/lib/tokens.ts

export const tokens = {
  colors: {
    primary: {
      50: 'rgb(var(--color-primary-50) / 1)',
      100: 'rgb(var(--color-primary-100) / 1)',
      // ... etc
    },
    // ...
  },
  spacing: {
    1: '0.25rem',  // 4px
    2: '0.5rem',   // 8px
    // ...
  },
  // etc
} as const;
```

### 10.4 Migration Checklist

**Phase 1: Foundation (Week 1-2)**
- [ ] Install dependencies: `clsx`, `tailwind-merge`, `lucide-react`
- [ ] Create `src/lib/utils.ts` with `cn()` helper
- [ ] Update `globals.css` with new design tokens
- [ ] Build Button, Input, Badge, Card components
- [ ] Build Modal/Dialog system
- [ ] Build Toast system

**Phase 2: Navigation (Week 2-3)**
- [ ] Create `navigation/navConfig.ts`
- [ ] Refactor `useNavigation.ts`
- [ ] Update Sidebar with new structure
- [ ] Add Breadcrumbs component
- [ ] Add SkipNav component

**Phase 3: Key Screens (Week 3-5)**
- [ ] Redesign Dashboard with clickable cards
- [ ] Redesign Weekly Reporting with inline creation
- [ ] Redesign Quarterly KRs grid
- [ ] Add skeleton loaders to all screens

**Phase 4: Polish (Week 5-6)**
- [ ] Add hover/press effects to all interactive elements
- [ ] Add focus-visible styles
- [ ] Verify touch target sizes
- [ ] Test keyboard navigation
- [ ] Add ARIA labels throughout

**Phase 5: Validation (Week 6-7)**
- [ ] Run Lighthouse accessibility audit
- [ ] Test with screen reader
- [ ] Test keyboard-only navigation
- [ ] Test on mobile devices
- [ ] Fix any remaining issues

### 10.5 Supabase Data Integration Pattern

```tsx
// src/hooks/useDashboardData.ts

import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

interface DashboardStats {
  activeObjectives: number;
  businessUnits: number;
  bpiScore: number;
  cycleTime: { week: number; total: number };
  complianceRate: number;
}

export const useDashboardStats = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Fetch all data in parallel
        const [
          objectivesCount,
          unitsCount,
          recentGoals,
          governanceConfig
        ] = await Promise.all([
          supabase.from('key_results').select('id', { count: 'exact', head: true }),
          supabase.from('business_units').select('id', { count: 'exact', head: true }),
          supabase.from('activities').select('score').gte('week', 1),
          supabase.from('governance_config').select('*').limit(1)
        ]);

        // Calculate BPI
        const scores = recentGoals.data?.map(g => g.score || 0) || [];
        const avgScore = scores.length > 0
          ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
          : 0;

        // Calculate compliance (goals with score >= 70)
        const compliantGoals = scores.filter(s => s >= 70).length;
        const complianceRate = scores.length > 0
          ? Math.round((compliantGoals / scores.length) * 100)
          : 100;

        const currentWeek = new Date().getWeek(); // Assumes week getter exists
        const config = governanceConfig.data?.[0];
        const totalWeeks = config?.totalWeeksInCycle || 12;

        setStats({
          activeObjectives: objectivesCount.count || 0,
          businessUnits: unitsCount.count || 0,
          bpiScore: avgScore,
          cycleTime: { week: currentWeek, total: totalWeeks },
          complianceRate
        });
      } catch (err) {
        setError('Failed to load dashboard data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();

    // Subscribe to changes
    const subscription = supabase
      .channel('dashboard-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'activities' }, fetchStats)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'key_results' }, fetchStats)
      .subscribe();

    return () => subscription.unsubscribe();
  }, []);

  return { stats, loading, error };
};
```

### 10.6 Responsive Breakpoints

```css
/* Tailwind responsive prefixes:
 * sm: 640px   — Large phones
 * md: 768px   — Tablets
 * lg: 1024px  — Small laptops
 * xl: 1280px  — Desktops
 * 2xl: 1536px — Large screens
 */

/* Sidebar behavior */
@media (max-width: 1023px) {
  .sidebar-expanded { display: none; }
  .sidebar-collapsed { display: flex; }
}

/* Dashboard grid */
.dashboard-grid {
  @apply grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4;
}

/* Card layouts */
.card-grid {
  @apply grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4;
}
```

---

## APPENDIX: Component State Matrix

| Component | Default | Hover | Active/Focus | Disabled | Loading | Error | Empty |
|-----------|---------|-------|--------------|----------|---------|-------|-------|
| **Button** | Primary bg | Darker bg, lift | Scale 0.98, ring | 50% opacity | Spinner | — | — |
| **Input** | Border gray | Border darker | Primary ring | Gray bg | — | Red border | — |
| **Select** | Same as Input | Arrow rotates | Open dropdown | Gray bg | — | Red border | — |
| **Card** | White bg, shadow-sm | Shadow-md, lift | Scale 0.99 | Gray overlay | Skeleton | — | Empty state |
| **Modal** | Centered, overlay | — | Focus trap | — | — | — | — |
| **Badge** | Colored bg | Darker bg | — | 50% opacity | — | — | — |
| **Toast** | Colored bg | — | — | — | — | — | — |
| **Table Row** | White bg | Gray bg | Blue outline | Gray text | Skeleton | Red bg | Empty state |
| **Goal Card** | White bg | Lift | — | Gray overlay | Skeleton | — | Add CTA |

---

*Document Version: 1.0*
*Last Updated: 2026-04-23*
*Status: Implementation-Ready*