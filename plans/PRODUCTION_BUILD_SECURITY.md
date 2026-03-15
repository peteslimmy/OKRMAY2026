# Production Build Security Plan: Remove Simulation Code

## Problem Statement

The application currently contains user simulation functionality that allows bypassing authentication in development mode. While there are runtime checks (`import.meta.env.DEV`, production hostname detection), any vulnerability in these checks could allow unauthorized access in production.

### Current State

The simulation code exists in [`utils.ts`](utils.ts:210):
- [`getSimulatedUser()`](utils.ts:210) - retrieves user from localStorage
- [`setSimulatedUser()`](utils.ts:215) - stores user in localStorage  
- [`getSessionUser()`](utils.ts:221) - uses simulation if in development mode

Current protections:
```typescript
const isDev = isLocalDev && isDevMode && !isProduction;
const simulated = getSimulatedUser();
if (simulated && isDev) return simulated;
```

## Solution

Use Vite's build-time code elimination to completely remove simulation code from production builds.

## Implementation Steps

### Step 1: Add Compile-Time Flags in vite.config.ts

Modify [`vite.config.ts`](vite.config.ts:17) to define a flag:

```typescript
define: {
  'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
  'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
  // Add simulation flag - false in production
  '__SIMULATION_ENABLED__': mode !== 'production'
}
```

### Step 2: Update Simulation Functions in utils.ts

Wrap simulation code with the compile-time flag:

```typescript
export const getSimulatedUser = (): User | null => {
  if (!__SIMULATION_ENABLED__) return null;
  const simulated = localStorage.getItem('4CORE_simulated_user');
  return simulated ? JSON.parse(simulated) : null;
};

export const setSimulatedUser = (user: User | null) => {
  if (!__SIMULATION_ENABLED__) {
    console.warn('Simulation not available in production');
    return;
  }
  // ... rest of implementation
};
```

### Step 3: Simplify getSessionUser

Update [`getSessionUser()`](utils.ts:221) to rely on compile-time flag:

```typescript
export const getSessionUser = async (): Promise<User | null> => {
  // Compile-time check - entire simulation path removed in production
  const simulated = __SIMULATION_ENABLED__ ? getSimulatedUser() : null;
  if (simulated) return simulated;

  // Normal authentication flow
  const { data: { session } } = await supabase.auth.getSession();
  // ... rest of implementation
};
```

### Step 4: Add Build Verification

Add a post-build check to verify simulation code is removed:

```typescript
// scripts/verify-production-build.js
const fs = require('fs');
const path = require('path');

const distPath = path.join(__dirname, '../dist');
const indexHtml = fs.readFileSync(path.join(distPath, 'index.html'), 'utf8');

if (indexHtml.includes('4CORE_simulated_user')) {
  console.error('ERROR: Simulation code found in production build!');
  process.exit(1);
}

console.log('✓ Production build verified - simulation code removed');
```

Add to package.json:
```json
"scripts": {
  "build": "vite build && node scripts/verify-production-build.js"
}
```

## Benefits

1. **Defense in Depth** - Simulation code doesn't even exist in production bundles
2. **Zero Runtime Overhead** - Code is eliminated at compile time
3. **Fail-Safe** - Even if runtime checks are bypassed, simulation functions return null/fail silently in production
4. **Verification** - Post-build check ensures compliance

## Files to Modify

| File | Change |
|------|--------|
| [`vite.config.ts`](vite.config.ts) | Add `__SIMULATION_ENABLED__` define |
| [`utils.ts`](utils.ts) | Add compile-time guards to simulation functions |
| [`package.json`](package.json) | Add build verification script |

## Rollback Plan

If simulation is needed in production for debugging:
1. Set `__SIMULATION_ENABLED__: true` in vite.config.ts temporarily
2. Or use environment variable: `'__SIMULATION_ENABLED__': env.SIMULATION === 'true'`
