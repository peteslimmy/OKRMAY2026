# 4CORE Weekly OKR Platform

A comprehensive OKR (Objectives & Key Results) management system for tracking organizational performance, weekly reporting, and governance.

## Features

- **Weekly Reporting Engine** - Track activities, tasks, and progress across business units
- **OKR Management** - Create and manage Key Results with quarterly planning
- **Business Units Dashboard** - Monitor performance across departments
- **Role-Based Access Control (RBAC)** - Granular permissions with 26 predefined permissions
- **User Management** - Complete identity and access management
- **Financial Tracking** - Violations, contributions, and expense management
- **Attendance System** - Meeting attendance tracking
- **Governance Controls** - Configurable lock policies and security settings
- **AI-Powered Insights** - Strategic briefings using Google Gemini

## Tech Stack

- **Frontend**: React 19 + TypeScript
- **Styling**: Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Auth + Edge Functions)
- **Charts**: Recharts
- **Animations**: Framer Motion
- **Icons**: Lucide React

## Project Structure

```
src/
├── types/              # TypeScript type definitions
│   └── index.ts
├── styles/             # CSS and design system
│   └── design-system.css
├── components/         # React components
│   ├── ui/             # Reusable UI primitives
│   ├── Auth.tsx        # Authentication
│   ├── Dashboard.tsx   # Main dashboard
│   ├── ReportModule.tsx # Weekly reporting
│   ├── UserManagement.tsx
│   ├── BusinessUnits.tsx
│   ├── BusinessObjectives.tsx
│   ├── Financials.tsx
│   ├── Attendance.tsx
│   ├── Settings.tsx
│   └── IntegrityChecker.tsx
├── utils.ts            # Utility functions
├── supabaseClient.ts   # Supabase client
└── App.tsx             # Main application

tests/                   # Test suites
├── 01-environment-verification.ts
├── 02-authentication.ts
├── 03-authorization.ts
├── 04-api-security.ts
└── 07-security-headers.ts
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account

### Installation

```bash
# Clone the repository
git clone <repo-url>
cd OKR2026-feb

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env
# Edit .env with your Supabase credentials

# Start development server
npm run dev
```

### Environment Variables

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_SUPABASE_SERVICE_KEY=your-service-role-key
VITE_OPENROUTER_API_KEY=your-openrouter-key
```

## Design System

The application uses a consistent design system with reusable CSS classes:

### Typography
```css
.heading-1, .heading-2, .heading-3  /* Headings */
.text-body, .text-caption, .text-label  /* Body text */
```

### Buttons
```css
.btn-primary   /* Primary action */
.btn-secondary /* Secondary action */
.btn-outline   /* Outlined button */
.btn-ghost     /* Ghost button */
.btn-danger    /* Destructive action */
.btn-success   /* Success action */
```

### Components
```css
.card          /* Card container */
.badge-success /* Success badge */
.badge-warning /* Warning badge */
.badge-danger  /* Danger badge */
.input         /* Form input */
.select        /* Select dropdown */
```

## Role-Based Access Control

| Role | Permissions |
|------|------------|
| **Viewer** | View activities, KR, reports |
| **Manager** | + Create/edit activities, advanced reports |
| **Director** | + Delete, KR management, executive reports |
| **Admin** | + User management, governance config |
| **SuperAdmin** | Full access |

## Testing

```bash
# Environment verification
npm run test:env

# Authentication tests
npm run test:auth

# Authorization tests  
npm run test:authz

# Security tests
npm run test:security

# Run all tests
npm run test:all
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run build:verify` | Build with verification |
| `npm run preview` | Preview production build |
| `npm run test:env` | Environment verification |
| `npm run test:auth` | Authentication tests |
| `npm run lint` | Run ESLint |

## Security

- Row-Level Security (RLS) policies on all tables
- JWT-based authentication
- Password breach detection via HaveIBeenPwned API
- Rate limiting on authentication
- XSS prevention via DOMPurify
- CSRF protection
- Input validation and sanitization

## License

Private - All rights reserved
