# 4CORE Weekly OKR Platform

## Project Overview
A high-performance OKR tracking and governance platform designed for corporate execution and strategic alignment.

## Build & Development
- **Dev Server:** `npm run dev`
- **Build:** `npm run build`
- **Build Verification:** `npm run build:verify`
- **Preview:** `npm run preview`

## Testing & Quality Assurance
- **Unit Tests:** `npm run test`
- **Watch Mode:** `npm run test:watch`
- **Coverage:** `npm run test:coverage`
- **E2E Tests:** `npm run test:e2e` (Cypress)
- **Security Lint:** `npm run test:security:lint`
- **Env Verification:** `npm run test:env`
- **Auth Tests:** `npm run test:auth`
- **Authz Tests:** `npm run test:authz`
- **API Security:** `npm run test:security`
- **Load Testing:** `npm run test:load`

## Code Style & Guidelines
### Frontend
- **Framework:** React 19 + TypeScript + Vite.
- **Styling:** Tailwind CSS with a centralized design system in `src/styles/design-system.css`.
- **UI Components:**
  - Atomic UI primitives (Buttons, Cards, Inputs) must be implemented as reusable components in `components/ui/`.
  - Avoid hardcoded hex colors; use CSS variables from the design system (e.g., `var(--color-primary-500)`).
  - Follow the 4px/8px spacing grid.
- **State Management:** Use React hooks and Supabase for data persistence.
- **Routing:** React Router DOM v7.

### Engineering Patterns
- **Modularization:** Logic should be extracted into `src/hooks/`, `src/utils/`, and `src/validators/`.
- **Types:** All data models must be defined in `src/types/index.ts`.
- **Error Handling:** Use the `ErrorBoundary` component for high-level module failures.

## Architecture
- **Backend:** Supabase (PostgreSQL, Auth, Edge Functions).
- **API:** Supabase Client for direct DB access and Edge Functions for proxy/email logic.
- **Auth:** Role-based access control (RBAC) with `SuperAdmin`, `Admin`, `Director`, etc.
