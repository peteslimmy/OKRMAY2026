# Design System Quick Reference
## Visual Cheat Sheet for Developers

**Version:** 1.0 | **Updated:** April 2026 | **Use:** Keep open while building

---

## 🎨 COLOR PALETTE (At-a-Glance)

```
PRIMARY BRAND - Orange
├─ 50   #FFF7ED  ← Light backgrounds
├─ 100  #FFEDD5  
├─ 200  #FED7AA  ← Subtle accents
├─ 300  #FDBA74
├─ 400  #FB923C  ← Light interactive
├─ 500  #F97316  ← HERO COLOR (Use for CTAs)
├─ 600  #EA580C  ← Hover states
├─ 700  #C2410C  ← Active states
├─ 800  #9A3412  ← Dark UI
└─ 900  #7C2D12  ← Darkest

SEMANTIC COLORS (Status Mapping)
✓  SUCCESS    #22C55E  (On-Track, Complete, Approved)
⚠️  WARNING    #F59E0B  (At-Risk, Pending, Needs Review)
✕  ERROR      #EF4444  (Behind, Failed, Deleted)
ℹ️  INFO       #3B82F6  (Paused, In Progress, Help)

NEUTRALS (Text & Backgrounds)
├─ 50   #F8FAFC  ← Page background
├─ 100  #F1F5F9  ← Card backgrounds
├─ 200  #E2E8F0  ← Borders
├─ 300  #CBD5E1  ← Disabled state
├─ 400  #94A3B8  ← Secondary text
├─ 500  #64748B  ← Tertiary text
├─ 600  #475569  ← Muted heading
├─ 700  #334155  ← Primary text
├─ 800  #1E293B  ← Body text
├─ 900  #0F172A  ← High contrast
└─ 950  #020617  ← Darkest

QUICK COPY-PASTE:
bg-primary-500    text-white       ← Primary button
bg-slate-100      text-slate-900   ← Card background
border-error-500  text-error-600   ← Error state
bg-success-50     text-success-700 ← Success badge
```

---

## 📝 TYPOGRAPHY SYSTEM

```
Font: Inter (system fonts fallback)

SCALE & USAGE
──────────────────────────────────────────────────
Display    48px  700 w  1.1 lh    Hero headlines
Display-2  36px  700 w  1.2 lh    Page titles
H1         28px  600 w  1.3 lh    Section headers
H2         24px  600 w  1.3 lh    Card titles
H3         20px  600 w  1.4 lh    Subsections
H4         18px  500 w  1.5 lh    List headers
Body       16px  400 w  1.6 lh    Main content
Body-sm    14px  400 w  1.6 lh    Form labels
Caption    12px  500 w  1.5 lh    Metadata

QUICK COPY-PASTE:
<h1 className="text-3xl font-bold text-slate-900">Heading</h1>
<p className="text-base font-normal text-slate-700">Body text</p>
<span className="text-xs font-medium text-slate-500">Caption</span>

Responsive:
<h1 className="text-2xl md:text-3xl lg:text-4xl">Responsive</h1>
```

---

## 📏 SPACING & SIZING

```
SPACING SCALE (4px base grid)
────────────────────────────
2px   space-0.5   ← Borders, micro-gaps
4px   space-1     ← Tight spacing
6px   space-1.5   
8px   space-2     ← Default gap between elements
12px  space-3     ← Small sections
16px  space-4     ← Default padding
20px  space-5     ← Section margins
24px  space-6     ← Card padding
32px  space-8     ← Large sections
40px  space-10    
48px  space-12    ← Hero sections
64px  space-16    ← Page margins

COMMON USAGE:
px-4 py-2           ← Button padding (16px × 8px)
px-6 py-4           ← Card padding (24px)
gap-4               ← Grid gap
space-y-3           ← Vertical stacking (12px)
mb-6                ← Margin bottom (24px)

TOUCH TARGETS (Minimum 44px × 44px)
min-h-11            ← 44px button minimum
h-11 w-11           ← Icon button
px-4 py-2.5         ← Button padding for 44px height
```

---

## 🔘 COMPONENTS QUICK REFERENCE

### Button
```
PRIMARY:   bg-primary-500 text-white hover:bg-primary-600
SECONDARY: bg-slate-100 text-slate-900 border border-slate-200
DANGER:    bg-error-500 text-white hover:bg-error-600
SUCCESS:   bg-success-500 text-white hover:bg-success-600
TERTIARY:  bg-transparent text-primary-600 hover:bg-primary-50

SIZES:
xs  px-3 py-1   text-xs    h-7
sm  px-4 py-1.5 text-sm    h-8
md  px-5 py-2   text-sm    h-9
lg  px-7 py-2.5 text-base  h-11  ← Mobile friendly
xl  px-8 py-3   text-base  h-12

USAGE:
<button className="px-5 py-2 bg-primary-500 text-white rounded-md 
                   hover:bg-primary-600 focus:ring-3 
                   focus:ring-primary-300 transition-all duration-200">
  Save Changes
</button>
```

### Input
```
BASE:      border border-slate-200 rounded-md px-4 py-2
FOCUS:     border-primary-500 ring-3 ring-primary-300
ERROR:     border-error-500 ring-3 ring-error-200
SUCCESS:   border-success-500 ring-3 ring-success-200
DISABLED:  bg-slate-50 text-slate-400 cursor-not-allowed

USAGE:
<input className="w-full px-4 py-2 border border-slate-200 rounded-md
                  focus:ring-3 focus:ring-primary-300 focus:outline-none
                  placeholder-slate-400 disabled:bg-slate-50
                  transition-all duration-200" />
```

### Card
```
BASE:     rounded-lg border border-slate-200 bg-white shadow-card px-6 py-4
HOVER:    hover:shadow-hover cursor-pointer transition-all
STATUS:   border-l-4 (success-500 | warning-500 | error-500)
EMPTY:    bg-slate-50 border-2 border-dashed flex items-center justify-center

USAGE:
<div className="rounded-lg border border-slate-200 bg-white shadow-card 
                hover:shadow-hover hover:cursor-pointer px-6 py-4">
  Card content
</div>
```

### Badge
```
STATUS:        inline-flex items-center px-3 py-1 rounded-full
              bg-success-50 text-success-700 text-sm font-medium
              
CATEGORICAL:   inline-flex items-center px-2.5 py-0.5 rounded text-xs
              bg-primary-100 text-primary-700 font-medium
              
USAGE:
<span className="inline-flex items-center gap-1 px-3 py-1 rounded-full
                bg-success-50 text-success-700 text-sm font-medium">
  ✓ On Track
</span>
```

### Modal
```
OVERLAY:  fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center
DIALOG:   bg-white rounded-xl shadow-modal p-6 max-w-md

USAGE:
<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center 
               justify-center z-50">
  <div className="bg-white rounded-xl shadow-modal p-6 max-w-md">
    <h2 className="text-xl font-bold mb-4">Confirm</h2>
    <p className="text-sm text-slate-600 mb-6">Your message</p>
    <div className="flex gap-3">
      <button>Cancel</button>
      <button>Confirm</button>
    </div>
  </div>
</div>
```

### Table
```
HEADER:   bg-slate-50 border-b border-slate-200 px-4 py-3
         text-xs font-semibold text-slate-700 uppercase

ROW:      border-b border-slate-100 hover:bg-slate-50
CELL:     px-4 py-3 text-sm text-slate-900

USAGE:
<table className="w-full border border-slate-200 rounded-lg">
  <thead className="bg-slate-50 border-b border-slate-200">
    <tr>
      <th className="px-4 py-3 text-left text-xs font-semibold">Name</th>
    </tr>
  </thead>
  <tbody>
    <tr className="border-b border-slate-100 hover:bg-slate-50">
      <td className="px-4 py-3 text-sm">Item</td>
    </tr>
  </tbody>
</table>
```

---

## 🎯 RESPONSIVE BREAKPOINTS

```
Mobile First:
───────────────────────────────────────────
sm   0–640px      ← Default (phones)
md   640–1024px   md:     (tablets)
lg   1024px+      lg:     (desktops)
xl   1280px+      xl:     (large desktops)
2xl  1536px+      2xl:    (ultra-wide)

QUICK PATTERNS:
grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4
─ Mobile: 1 column
─ Tablet: 2 columns
─ Desktop: 4 columns

hidden lg:flex
─ Hidden on mobile/tablet
─ Visible on desktop

w-full md:w-1/2 lg:w-1/3
─ Mobile: 100% width
─ Tablet: 50% width
─ Desktop: 33% width
```

---

## 🎬 ANIMATIONS & TRANSITIONS

```
DURATIONS:
150ms  --transition-fast    ← Hover feedback, quick interactions
200ms  --transition-base    ← Default state changes
300ms  --transition-slow    ← Modals, drawers, page transitions

USAGE:
transition-all duration-200        ← All properties, 200ms
transition-colors duration-200     ← Only color changes
hover:scale-105 transition-transform duration-200  ← Grow on hover

COMMON PATTERNS:
hover:bg-slate-100 transition-colors duration-150
hover:shadow-hover transition-shadow duration-200
group-hover:translate-x-1 transition-transform duration-200
```

---

## ♿ ACCESSIBILITY ESSENTIALS

```
FOCUS STATES (Always visible):
focus:ring-3 focus:ring-primary-300 focus:outline-none

MIN CONTRAST RATIOS:
Normal text:   ≥7:1  (AAA)
Large text:    ≥4.5:1 (AAA)
UI components: ≥3:1  (AA minimum)

COLOR + ICON RULE:
❌ Color alone (red = error)
✅ Color + icon (🔴 + text = error)

TOUCH TARGETS:
min-h-11       ← 44px (minimum)
min-w-11       ← 44px (minimum)

KEYBOARD NAV:
Tab through elements in logical order
Space bar activates buttons
Arrow keys in menus
Escape closes modals
Enter submits forms

LABELS & DESCRIPTIONS:
<label htmlFor="email">Email</label>
<input id="email" aria-describedby="email-help" />
<small id="email-help">We'll never share your email</small>
```

---

## 🔍 FOCUS RING STANDARD

```
All interactive elements (buttons, inputs, links):

.focus-ring {
  focus:ring-3           ← 3px ring width
  focus:ring-primary-300 ← Bright orange ring
  focus:outline-none     ← Remove default outline
}

Tailwind class:
focus:ring-3 focus:ring-primary-300 focus:outline-none

Visual result:
┌─────────────────────┐
│ Button              │◄── 3px ring around element
└─────────────────────┘
```

---

## 📊 SHADOW ELEVATION SYSTEM

```
NO SHADOW:           (flat backgrounds)
--shadow-xs:         (subtle hover)
--shadow-card:       (default card) ← Most common
--shadow-hover:      (interactive hover, lifted)
--shadow-modal:      (modals, popovers)
--shadow-focus:      (keyboard focus ring)

USAGE:
shadow-card         ← Default for cards
hover:shadow-hover  ← Lift on hover
shadow-modal        ← For modals/dialogs
ring-3 ring-primary-300  ← Focus state
```

---

## ✅ VALIDATION & ERROR STATES

```
ERROR DISPLAY:
┌────────────────────┐
│ Email address      │
│ [_____________@_] ◄─── Red border
└────────────────────┘
✕ Email is required  ◄─── Red text, small
  └─ Error icon + message (12px, error-600)

SUCCESS DISPLAY:
┌────────────────────┐
│ Email address      │
│ [user@comp.com]   ◄─── Green border
└────────────────────┘
✓ Valid email

FORM LEVEL:
┌─────────────────────────────────┐
│ ⚠ Please fix 2 errors below    │  ← Alert at top
└─────────────────────────────────┘
[Form fields with individual errors]

USAGE:
border-error-500 ring-3 ring-error-200    ← Error state
border-success-500 ring-3 ring-success-200 ← Success state
```

---

## 🎨 QUICK COMPONENT TEMPLATES

### Login Form
```tsx
<form className="space-y-4 max-w-sm">
  <input 
    type="email"
    placeholder="Email"
    className="w-full px-4 py-2 border border-slate-200 rounded-md focus:ring-3 focus:ring-primary-300"
  />
  <input 
    type="password"
    placeholder="Password"
    className="w-full px-4 py-2 border border-slate-200 rounded-md focus:ring-3 focus:ring-primary-300"
  />
  <button className="w-full px-4 py-2 bg-primary-500 text-white rounded-md hover:bg-primary-600">
    Sign In
  </button>
</form>
```

### Dashboard Metric Card
```tsx
<div className="rounded-lg border border-slate-200 bg-white shadow-card p-6 
              hover:shadow-hover cursor-pointer transition-all">
  <p className="text-sm font-medium text-slate-500">Total Execution</p>
  <p className="text-3xl font-bold text-slate-900 mt-2">85%</p>
  <p className="text-xs text-success-600 mt-2">↑ 3% from last week</p>
</div>
```

### Status Badge
```tsx
<span className="inline-flex items-center gap-1 px-3 py-1 rounded-full 
             bg-success-50 text-success-700 text-sm font-medium">
  ✓ On Track
</span>
```

### Data Table Header
```tsx
<table className="w-full border border-slate-200 rounded-lg">
  <thead className="bg-slate-50">
    <tr>
      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700">
        Name
      </th>
      <th className="px-4 py-3 text-center text-xs font-semibold text-slate-700">
        Status
      </th>
    </tr>
  </thead>
</table>
```

---

## 🚀 COPY-PASTE SNIPPETS

### Common Button States
```tailwind
<!-- Primary CTA -->
<button class="px-6 py-2 bg-primary-500 text-white rounded-md 
               hover:bg-primary-600 active:bg-primary-700 
               focus:ring-3 focus:ring-primary-300 
               disabled:opacity-50 disabled:cursor-not-allowed
               transition-all duration-200">Save</button>

<!-- Secondary -->
<button class="px-6 py-2 bg-slate-100 text-slate-900 border border-slate-200 
               rounded-md hover:bg-slate-200 active:bg-slate-300
               focus:ring-3 focus:ring-primary-300
               disabled:opacity-50
               transition-all duration-200">Cancel</button>

<!-- Danger -->
<button class="px-6 py-2 bg-error-500 text-white rounded-md 
               hover:bg-error-600 active:bg-error-700
               focus:ring-3 focus:ring-error-300
               transition-all duration-200">Delete</button>
```

### Responsive Grid
```tailwind
<!-- 1 col on mobile, 2 on tablet, 4 on desktop -->
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
  <!-- Cards here -->
</div>
```

### Form Stack
```tailwind
<!-- Responsive form: stacked on mobile, 2-col on desktop -->
<form class="grid grid-cols-1 md:grid-cols-2 gap-4">
  <input class="w-full px-4 py-2 border rounded-md" />
  <input class="w-full px-4 py-2 border rounded-md" />
  <button class="md:col-span-2">Submit</button>
</form>
```

---

## 📞 CHEAT SHEET REFERENCE

**Keep this guide open while:**
- Building new components
- Styling new pages
- Adding new features
- Reviewing code

**Next steps:**
1. Copy component template from this guide
2. Refer to detailed specs in COMPONENT_SPECIFICATIONS.md
3. Check MOBILE_RESPONSIVE_GUIDE.md for breakpoints
4. See UX_REDESIGN_STRATEGY.md for design decisions

---

**Document Version:** 1.0 | **Last Updated:** April 2026 | **Maintained By:** Design Architecture Team
