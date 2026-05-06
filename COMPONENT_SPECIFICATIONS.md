# Component Design Specifications & Implementation Guide
## Ready-to-Build Component Library

**Document Version:** 1.0  
**Focus:** React + TypeScript + Tailwind CSS  
**Target:** Production-ready components with all states  

---

## 📋 QUICK REFERENCE: Component Props & Variants

### Button Component

```typescript
// Props interface
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  // Style
  variant?: 'primary' | 'secondary' | 'tertiary' | 'danger' | 'success';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  shape?: 'default' | 'pill' | 'square'; // square = icon button
  fullWidth?: boolean;
  
  // State
  isLoading?: boolean;
  isDisabled?: boolean;
  
  // Content
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  
  // Additional
  onClick?: (e: React.MouseEvent) => void;
  className?: string;
  children: React.ReactNode;
}

// Tailwind classes by variant
const VARIANTS = {
  primary: 'bg-primary-500 text-white hover:bg-primary-600 hover:shadow-hover active:bg-primary-700 disabled:bg-slate-200 disabled:text-slate-400',
  secondary: 'bg-slate-100 text-slate-900 border border-slate-200 hover:bg-slate-200 hover:border-slate-300 active:bg-slate-300 disabled:bg-slate-50',
  tertiary: 'bg-transparent text-primary-600 hover:bg-primary-50 hover:text-primary-700 active:bg-primary-100 disabled:text-slate-300',
  danger: 'bg-error-500 text-white hover:bg-error-600 hover:shadow-hover active:bg-error-700 disabled:bg-slate-200',
  success: 'bg-success-500 text-white hover:bg-success-600 hover:shadow-hover active:bg-success-700 disabled:bg-slate-200',
};

const SIZES = {
  xs: 'px-3 py-1 text-xs h-7',
  sm: 'px-4 py-1.5 text-sm h-8',
  md: 'px-5 py-2 text-sm h-9',
  lg: 'px-7 py-2.5 text-base h-11',
  xl: 'px-8 py-3 text-base h-12',
};

const SHAPES = {
  default: 'rounded-md',
  pill: 'rounded-full',
  square: 'rounded-none w-9 h-9 flex items-center justify-center p-0', // Icon button
};

// Usage examples
<Button variant="primary" size="lg" onClick={handleSave}>
  Save Changes
</Button>

<Button variant="secondary" size="md">
  Cancel
</Button>

<Button variant="danger" size="md" isLoading={isSaving}>
  Delete Item
</Button>

<Button variant="tertiary" size="sm" icon={<EditIcon />}>
  Edit
</Button>

<Button shape="square" variant="tertiary" icon={<MenuIcon />} />
```

---

### Input Component

```typescript
// Props interface
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  placeholder?: string;
  description?: string;
  error?: string;
  success?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  size?: 'sm' | 'md' | 'lg';
  required?: boolean;
  disabled?: boolean;
  className?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

// Tailwind base classes
const INPUT_BASE = 'w-full border border-slate-200 rounded-md transition-all duration-200 focus:ring-3 focus:ring-primary-300 focus:border-primary-500 focus:outline-none placeholder-slate-400';

const SIZES = {
  sm: 'px-3 py-1.5 text-sm h-8',
  md: 'px-4 py-2 text-base h-9',
  lg: 'px-5 py-2.5 text-base h-11',
};

// States
const STATES = {
  default: 'border-slate-200',
  focus: 'border-primary-500 ring-3 ring-primary-300',
  error: 'border-error-500 ring-3 ring-error-200',
  success: 'border-success-500 ring-3 ring-success-200',
  disabled: 'bg-slate-50 text-slate-400 cursor-not-allowed opacity-50',
};

// Usage examples
<Input
  label="Email Address"
  type="email"
  placeholder="name@company.com"
  error={emailError}
  required
/>

<Input
  label="Search"
  placeholder="Find KRs..."
  icon={<SearchIcon />}
  iconPosition="left"
/>

<Input
  label="Progress"
  type="number"
  success={isValid}
  description="Enter percentage (0-100)"
/>
```

---

### Select / Dropdown Component

```typescript
// Props interface
interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: Array<{ value: string; label: string; disabled?: boolean }>;
  placeholder?: string;
  error?: string;
  size?: 'sm' | 'md' | 'lg';
  required?: boolean;
  className?: string;
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}

// Custom select styling (override browser default)
// Use Headless UI or Radix UI for advanced customization

// Usage examples
<Select
  label="Role"
  options={[
    { value: 'admin', label: 'Admin' },
    { value: 'manager', label: 'Manager' },
    { value: 'viewer', label: 'Viewer' },
  ]}
  required
/>

<Select
  label="Filter by Status"
  options={[
    { value: 'all', label: 'All' },
    { value: 'on-track', label: 'On Track' },
    { value: 'at-risk', label: 'At Risk' },
    { value: 'behind', label: 'Behind' },
  ]}
  placeholder="Select status..."
/>
```

---

### Checkbox Component

```typescript
// Props interface
interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  description?: string;
  error?: string;
  disabled?: boolean;
  checked?: boolean;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
}

// Tailwind classes
const CHECKBOX_WRAPPER = 'flex items-center gap-3';
const CHECKBOX_INPUT = 'w-4.5 h-4.5 border-2 border-slate-300 rounded cursor-pointer accent-primary-500 focus:ring-2 focus:ring-primary-300';
const CHECKBOX_LABEL = 'text-sm font-medium text-slate-700 cursor-pointer';

// Usage examples
<Checkbox
  label="I agree to the terms and conditions"
  checked={isAgreed}
  onChange={handleChange}
  required
/>

<Checkbox
  label="Enable notifications"
  description="Receive email alerts for urgent items"
  checked={notificationsEnabled}
  onChange={handleToggle}
/>

// Multiple checkboxes
<fieldset className="space-y-3">
  <legend className="heading-5">Select Permissions</legend>
  <Checkbox label="View Reports" checked={perms.view} onChange={...} />
  <Checkbox label="Edit Objectives" checked={perms.edit} onChange={...} />
  <Checkbox label="Delete Users" checked={perms.delete} onChange={...} />
</fieldset>
```

---

### Card Component

```typescript
// Props interface
interface CardProps {
  // Styling
  variant?: 'default' | 'interactive' | 'status' | 'action' | 'empty';
  status?: 'on-track' | 'at-risk' | 'behind' | 'paused';
  
  // Content
  header?: string | React.ReactNode;
  footer?: string | React.ReactNode;
  icon?: React.ReactNode;
  
  // Interaction
  onClick?: () => void;
  href?: string;
  
  // Additional
  className?: string;
  children: React.ReactNode;
}

// Tailwind classes
const CARD_BASE = 'rounded-lg border transition-all duration-200';
const CARD_VARIANTS = {
  default: 'bg-white border-slate-200 shadow-card hover:shadow-card',
  interactive: 'bg-white border-slate-200 shadow-card hover:shadow-hover cursor-pointer hover:scale-105',
  status: 'bg-white border-l-4 shadow-card',
  action: 'bg-white border-slate-200 shadow-card hover:shadow-hover',
  empty: 'bg-slate-50 border-2 border-dashed border-slate-200 flex flex-col items-center justify-center min-h-60',
};

const STATUS_COLORS = {
  'on-track': 'border-l-success-500',
  'at-risk': 'border-l-warning-500',
  'behind': 'border-l-error-500',
  'paused': 'border-l-slate-400',
};

// Usage examples
<Card
  variant="interactive"
  header="Q2 Revenue"
  onClick={() => navigate('/kr/123')}
>
  <MetricRow label="Target" value="$62.5M" />
  <MetricRow label="Current" value="$48.3M" />
  <MetricRow label="Progress" value="77%" status="on-track" />
</Card>

<Card variant="status" status="at-risk" header="At-Risk Items">
  <p className="text-sm text-slate-600">3 KRs need attention</p>
</Card>

<Card variant="empty">
  <icon className="w-12 h-12 text-slate-300 mb-4" />
  <p className="heading-5 text-slate-700">No KRs Created</p>
  <p className="text-sm text-slate-500 mb-6">Start by creating your first quarterly objective</p>
  <Button variant="primary">Create Objective</Button>
</Card>
```

---

### Badge Component

```typescript
// Props interface
interface BadgeProps {
  variant?: 'status' | 'categorical' | 'inline' | 'notification';
  status?: 'on-track' | 'at-risk' | 'behind' | 'complete' | 'paused';
  category?: 'primary' | 'success' | 'warning' | 'error' | 'info';
  count?: number;
  label: string;
  icon?: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

// Tailwind classes
const BADGE_VARIANTS = {
  status: 'inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium',
  categorical: 'inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium',
  inline: 'inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border',
  notification: 'absolute top-0 right-0 inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white rounded-full',
};

// Status colors
const STATUS_STYLES = {
  'on-track': 'bg-success-50 text-success-700 border-success-300',
  'at-risk': 'bg-warning-50 text-warning-700 border-warning-300',
  'behind': 'bg-error-50 text-error-700 border-error-300',
  'complete': 'bg-success-100 text-success-800',
  'paused': 'bg-slate-100 text-slate-700',
};

// Usage examples
<Badge variant="status" status="on-track" label="On Track" icon={<CheckIcon />} />

<Badge variant="categorical" category="primary" label="High Priority" />

<Badge variant="notification" count={5} label="5" />

<Badge 
  variant="inline" 
  category="info" 
  label="Finance" 
  icon={<DollarIcon />}
/>
```

---

### Modal Component

```typescript
// Props interface
interface ModalProps {
  isOpen: boolean;
  title: string;
  description?: string;
  onClose: () => void;
  icon?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
  isDangerous?: boolean;
  children: React.ReactNode;
}

// Tailwind classes
const MODAL_OVERLAY = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 transition-opacity duration-200';
const MODAL_CONTAINER = 'bg-white rounded-xl shadow-modal max-h-[90vh] overflow-y-auto';

const SIZES = {
  sm: 'w-full max-w-sm',
  md: 'w-full max-w-2xl',
  lg: 'w-full max-w-4xl',
};

// Usage examples
<Modal
  isOpen={isOpen}
  title="Confirm Deletion"
  description="This action cannot be undone."
  onClose={handleClose}
  isDangerous
>
  <p className="text-sm text-slate-600 mb-6">
    Are you sure you want to delete this KR?
  </p>
  <ModalFooter>
    <Button variant="secondary" onClick={handleClose}>Cancel</Button>
    <Button variant="danger" onClick={handleDelete}>Delete</Button>
  </ModalFooter>
</Modal>

<Modal
  isOpen={isFormOpen}
  title="Create New KR"
  onClose={handleClose}
  size="md"
>
  <form onSubmit={handleSubmit}>
    <Input label="KR Name" required />
    <Input label="Target Value" required />
    <Button variant="primary" type="submit" fullWidth>Create</Button>
  </form>
</Modal>
```

---

### Table Component

```typescript
// Props interface
interface TableColumn {
  id: string;
  label: string;
  align?: 'left' | 'center' | 'right';
  width?: string;
  sortable?: boolean;
  render?: (row: any) => React.ReactNode;
}

interface TableProps {
  columns: TableColumn[];
  data: any[];
  isSelectable?: boolean;
  isSortable?: boolean;
  isFilterable?: boolean;
  isPaginated?: boolean;
  pageSize?: number;
  onRowClick?: (row: any) => void;
  onSelectionChange?: (selectedRows: any[]) => void;
  className?: string;
}

// Tailwind classes
const TABLE_WRAPPER = 'w-full border border-slate-200 rounded-lg overflow-hidden';
const TABLE_HEAD = 'bg-slate-50 border-b border-slate-200';
const TABLE_HEADER_CELL = 'px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wide';
const TABLE_ROW = 'border-b border-slate-100 hover:bg-slate-50 transition-colors';
const TABLE_CELL = 'px-4 py-3 text-sm text-slate-900';

// Usage examples
<Table
  columns={[
    { id: 'name', label: 'Name', sortable: true },
    { id: 'status', label: 'Status', align: 'center' },
    { id: 'progress', label: 'Progress', align: 'right' },
  ]}
  data={krs}
  isSelectable
  isSortable
  isPaginated
  pageSize={10}
  onRowClick={handleRowClick}
/>

// With custom render
<Table
  columns={[
    { 
      id: 'status', 
      label: 'Status',
      render: (row) => <Badge status={row.status} label={row.status} />
    },
    { id: 'name', label: 'KR Name' },
    {
      id: 'actions',
      label: 'Actions',
      render: (row) => (
        <div className="flex gap-2">
          <Button variant="tertiary" size="sm" onClick={() => edit(row)}>Edit</Button>
          <Button variant="danger" size="sm" onClick={() => delete(row)}>Delete</Button>
        </div>
      )
    }
  ]}
  data={data}
/>
```

---

## 🛠️ COMPONENT FILE STRUCTURE

```
src/components/ui/
├── Button/
│   ├── Button.tsx          (Main component)
│   ├── Button.stories.tsx  (Storybook)
│   ├── Button.test.tsx     (Unit tests)
│   └── Button.types.ts     (Props interface)
├── Input/
│   ├── Input.tsx
│   ├── Input.stories.tsx
│   ├── Input.test.tsx
│   └── Input.types.ts
├── Select/
│   ├── Select.tsx
│   ├── Select.stories.tsx
│   ├── Select.test.tsx
│   └── Select.types.ts
├── Checkbox/
│   ├── Checkbox.tsx
│   ├── Checkbox.stories.tsx
│   ├── Checkbox.test.tsx
│   └── Checkbox.types.ts
├── Card/
│   ├── Card.tsx
│   ├── Card.stories.tsx
│   ├── Card.test.tsx
│   └── Card.types.ts
├── Badge/
│   ├── Badge.tsx
│   ├── Badge.stories.tsx
│   ├── Badge.test.tsx
│   └── Badge.types.ts
├── Modal/
│   ├── Modal.tsx
│   ├── Modal.stories.tsx
│   ├── Modal.test.tsx
│   ├── Modal.types.ts
│   └── ModalFooter.tsx
├── Table/
│   ├── Table.tsx
│   ├── Table.stories.tsx
│   ├── Table.test.tsx
│   ├── Table.types.ts
│   ├── TableHeader.tsx
│   ├── TableRow.tsx
│   └── TableCell.tsx
├── index.ts (Export all components)
└── shared/
    ├── colors.ts (Color constants)
    ├── sizes.ts (Size constants)
    └── variants.ts (Variant definitions)
```

---

## 🎨 CSS UTILITIES FOR COMPONENTS

Create `src/styles/components.css`:

```css
/* Button utilities */
.btn-base {
  @apply inline-flex items-center justify-center
         rounded-md font-medium
         transition-all duration-200
         focus-visible:ring-3 focus-visible:ring-primary-300 focus-visible:outline-none
         disabled:opacity-50 disabled:cursor-not-allowed;
  min-height: var(--touch-target-min, 2.75rem);
}

.btn-primary {
  @apply bg-primary-500 text-white
         hover:bg-primary-600 hover:shadow-hover
         active:bg-primary-700;
}

.btn-secondary {
  @apply bg-slate-100 text-slate-900 border border-slate-200
         hover:bg-slate-200 hover:border-slate-300
         active:bg-slate-300;
}

/* Input utilities */
.input-base {
  @apply w-full border border-slate-200 rounded-md
         px-4 py-2 text-base
         transition-all duration-200
         focus:ring-3 focus:ring-primary-300 focus:border-primary-500 focus:outline-none
         placeholder-slate-400
         disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed;
  min-height: var(--touch-target-min, 2.75rem);
}

.input-error {
  @apply border-error-500 ring-3 ring-error-200;
}

/* Card utilities */
.card {
  @apply rounded-lg border border-slate-200 bg-white
         shadow-card
         transition-all duration-200;
}

.card:hover {
  @apply shadow-hover;
}

.card-interactive {
  @apply cursor-pointer;
}

.card-interactive:hover {
  @apply scale-105;
}

/* Badge utilities */
.badge {
  @apply inline-flex items-center gap-1
         px-2.5 py-0.5 rounded text-xs font-medium;
}

.badge-status {
  @apply rounded-full px-3 py-1 text-sm;
}

/* Focus ring utilities */
.focus-ring {
  @apply focus-visible:ring-3 focus-visible:ring-primary-300 focus-visible:outline-none;
}

/* Touch target utility */
.touch-target {
  min-height: var(--touch-target-min, 2.75rem);
  min-width: var(--touch-target-min, 2.75rem);
}

/* Responsive utilities */
@media (max-width: 768px) {
  .sm\:full-width {
    @apply w-full;
  }
  
  .sm\:stack {
    @apply flex flex-col;
  }
}
```

---

## 📱 RESPONSIVE HELPERS

Create `src/utils/responsive.ts`:

```typescript
// Tailwind breakpoints
export const BREAKPOINTS = {
  sm: 640,   // phones
  md: 768,   // tablets
  lg: 1024,  // desktops
  xl: 1280,  // large desktops
  '2xl': 1536, // ultra-wide
};

// Utility hook for responsive behavior
export const useMediaQuery = (query: string): boolean => {
  const [matches, setMatches] = React.useState(false);
  
  React.useEffect(() => {
    const media = window.matchMedia(query);
    setMatches(media.matches);
    
    const listener = () => setMatches(media.matches);
    media.addEventListener('change', listener);
    return () => media.removeEventListener('change', listener);
  }, [query]);
  
  return matches;
};

// Tailwind grid helpers
export const getGridCols = (variant: 'auto' | 'dashboard' | 'table') => {
  const classes = {
    auto: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
    dashboard: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    table: 'grid-cols-1',
  };
  return classes[variant];
};
```

---

## ✅ COMPONENT TESTING TEMPLATE

Create `src/components/ui/Button/Button.test.tsx`:

```typescript
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from './Button';

describe('Button Component', () => {
  it('renders with correct variant classes', () => {
    const { container } = render(
      <Button variant="primary">Click me</Button>
    );
    const button = container.querySelector('button');
    expect(button).toHaveClass('bg-primary-500', 'text-white');
  });

  it('handles click events', async () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    
    await userEvent.click(screen.getByText('Click me'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('disables button when loading', () => {
    render(<Button isLoading>Saving...</Button>);
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
  });

  it('has accessible focus state', async () => {
    render(<Button>Focusable</Button>);
    const button = screen.getByRole('button');
    
    button.focus();
    expect(button).toHaveFocus();
  });

  it('renders icon in correct position', () => {
    const { container } = render(
      <Button icon={<span>→</span>} iconPosition="right">
        Next
      </Button>
    );
    const button = container.querySelector('button');
    expect(button?.textContent).toMatch(/Next→/);
  });
});
```

---

## 🚀 STORYBOOK TEMPLATE

Create `src/components/ui/Button/Button.stories.tsx`:

```typescript
import { Meta, StoryObj } from '@storybook/react';
import { Button } from './Button';

const meta: Meta<typeof Button> = {
  title: 'UI Components/Button',
  component: Button,
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['primary', 'secondary', 'tertiary', 'danger', 'success'],
    },
    size: {
      control: { type: 'select' },
      options: ['xs', 'sm', 'md', 'lg', 'xl'],
    },
    isLoading: { control: 'boolean' },
    isDisabled: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj<typeof Button>;

// Variants
export const Primary: Story = {
  args: {
    variant: 'primary',
    children: 'Primary Button',
  },
};

export const Secondary: Story = {
  args: {
    variant: 'secondary',
    children: 'Secondary Button',
  },
};

export const Danger: Story = {
  args: {
    variant: 'danger',
    children: 'Delete',
  },
};

// Sizes
export const Small: Story = {
  args: {
    size: 'sm',
    children: 'Small',
  },
};

export const Large: Story = {
  args: {
    size: 'lg',
    children: 'Large',
  },
};

// States
export const Loading: Story = {
  args: {
    variant: 'primary',
    isLoading: true,
    children: 'Saving...',
  },
};

export const Disabled: Story = {
  args: {
    isDisabled: true,
    children: 'Disabled Button',
  },
};

// All variants showcase
export const AllVariants: Story = {
  render: () => (
    <div className="space-y-4">
      <Button variant="primary">Primary</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="tertiary">Tertiary</Button>
      <Button variant="danger">Danger</Button>
      <Button variant="success">Success</Button>
    </div>
  ),
};
```

---

## 📊 IMPLEMENTATION CHECKLIST

Track implementation progress:

```markdown
## Phase 1: Core Components (Week 1-2)

- [ ] Button component (all variants, sizes, states)
  - [ ] Primary variant
  - [ ] Secondary variant
  - [ ] Tertiary variant
  - [ ] Danger variant
  - [ ] Success variant
  - [ ] All sizes (xs, sm, md, lg, xl)
  - [ ] Loading state
  - [ ] Icon button
  - [ ] Unit tests
  - [ ] Storybook stories

- [ ] Input component
  - [ ] Text input
  - [ ] Email input
  - [ ] Number input
  - [ ] Error state
  - [ ] Success state
  - [ ] Disabled state
  - [ ] Icon support
  - [ ] Label + required indicator
  - [ ] Unit tests

- [ ] Select/Dropdown
- [ ] Checkbox
- [ ] Radio button
- [ ] Textarea

## Phase 2: Container Components (Week 2-3)

- [ ] Card component
  - [ ] Default variant
  - [ ] Interactive variant
  - [ ] Status variant
  - [ ] Action variant
  - [ ] Empty state variant
  - [ ] Header/footer support
  
- [ ] Badge component
  - [ ] Status badges
  - [ ] Categorical badges
  - [ ] Inline badges
  - [ ] Notification badges

- [ ] Modal component
  - [ ] Confirmation modal
  - [ ] Form modal
  - [ ] Info modal
  - [ ] Focus management
  - [ ] Escape key handling
  - [ ] Backdrop click

## Phase 3: Complex Components (Week 3-4)

- [ ] Table component
  - [ ] Basic table
  - [ ] Sorting
  - [ ] Filtering
  - [ ] Pagination
  - [ ] Row selection
  - [ ] Responsive (card layout on mobile)
  - [ ] Keyboard navigation

- [ ] Navigation components
  - [ ] Sidebar (collapsible)
  - [ ] Mobile bottom nav
  - [ ] Top header

## Phase 4: Testing & Documentation (Week 4)

- [ ] Unit tests for all components
- [ ] Accessibility audit (WCAG 2.2 AAA)
- [ ] Storybook documentation
- [ ] Component prop documentation
- [ ] Usage examples for developers
```

---

## 🎯 QUICK START: Building Your First Component

### Example: Creating the Input Component

**Step 1: Create the file structure**
```bash
mkdir -p src/components/ui/Input
touch src/components/ui/Input/{Input.tsx,Input.types.ts,Input.test.tsx,Input.stories.tsx}
```

**Step 2: Define types** (`Input.types.ts`):
```typescript
export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  success?: boolean;
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
}
```

**Step 3: Implement component** (`Input.tsx`):
```typescript
import React from 'react';
import { InputProps } from './Input.types';

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({
    label,
    error,
    success,
    size = 'md',
    icon,
    iconPosition = 'left',
    className,
    ...props
  }, ref) => {
    const sizeClasses = {
      sm: 'px-3 py-1.5 text-sm h-8',
      md: 'px-4 py-2 text-base h-9',
      lg: 'px-5 py-2.5 text-base h-11',
    };

    const stateClasses = error 
      ? 'border-error-500 ring-3 ring-error-200'
      : success
      ? 'border-success-500 ring-3 ring-success-200'
      : 'border-slate-200 focus:border-primary-500';

    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            {label}
            {props.required && <span className="text-error-500 ml-1">*</span>}
          </label>
        )}
        <div className="relative">
          {icon && iconPosition === 'left' && (
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            className={`
              w-full border rounded-md transition-all duration-200
              focus:ring-3 focus:ring-primary-300 focus:outline-none
              placeholder-slate-400 disabled:bg-slate-50
              ${sizeClasses[size]}
              ${stateClasses}
              ${icon && iconPosition === 'left' ? 'pl-10' : ''}
              ${icon && iconPosition === 'right' ? 'pr-10' : ''}
              ${className}
            `}
            {...props}
          />
          {icon && iconPosition === 'right' && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400">
              {icon}
            </div>
          )}
        </div>
        {error && (
          <p className="text-xs text-error-600 mt-1">
            {error}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
```

**Step 4: Write tests** (`Input.test.tsx`):
```typescript
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Input } from './Input';

describe('Input Component', () => {
  it('renders with label', () => {
    render(<Input label="Email" />);
    expect(screen.getByText('Email')).toBeInTheDocument();
  });

  it('shows error message', () => {
    render(<Input error="This field is required" />);
    expect(screen.getByText('This field is required')).toBeInTheDocument();
  });

  it('handles user input', async () => {
    const { container } = render(<Input />);
    const input = container.querySelector('input');
    
    await userEvent.type(input!, 'test@example.com');
    expect(input).toHaveValue('test@example.com');
  });

  it('shows required indicator', () => {
    render(<Input label="Email" required />);
    expect(screen.getByText('*')).toBeInTheDocument();
  });
});
```

**Step 5: Create Storybook story** (`Input.stories.tsx`):
```typescript
import { Meta, StoryObj } from '@storybook/react';
import { Input } from './Input';

const meta: Meta<typeof Input> = {
  title: 'UI Components/Input',
  component: Input,
};

export default meta;
type Story = StoryObj<typeof Input>;

export const Default: Story = {
  args: {
    label: 'Email Address',
    placeholder: 'Enter your email',
  },
};

export const WithError: Story = {
  args: {
    label: 'Email Address',
    error: 'Invalid email format',
    placeholder: 'Enter your email',
  },
};

export const WithSuccess: Story = {
  args: {
    label: 'Email Address',
    success: true,
    value: 'user@company.com',
  },
};
```

**Step 6: Export from index** (`src/components/ui/index.ts`):
```typescript
export { Input } from './Input/Input';
export type { InputProps } from './Input/Input.types';
// ... other exports
```

---

## 🚀 NEXT STEPS

1. **Set up Storybook** (if not already done):
   ```bash
   npm install --save-dev @storybook/react @storybook/addon-essentials
   npx storybook init
   ```

2. **Create all base components** in priority order:
   - Button, Input, Select, Checkbox
   - Card, Badge, Modal
   - Table, Navigation

3. **Update design system CSS** with motion/shadow tokens

4. **Migrate existing pages** one at a time

5. **Test thoroughly** on desktop, tablet, and mobile

6. **Gather user feedback** and iterate

---

**Document prepared by:** Engineering Architecture Team  
**Next Review:** After Phase 1 completion  
**Last Updated:** April 2026
