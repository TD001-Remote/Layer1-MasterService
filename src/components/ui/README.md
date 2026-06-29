# UI Components Library

Reusable, type-safe UI components for the L1 Identity Registry Console.

All components use custom Tailwind design tokens (`brand-*`, `entity-*`, `nonentity-*`, `surface-*`), `rounded-xl/2xl` radii, `font-extrabold` headings, `active:scale-[0.97]` press feedback, and consistent `focus:ring-2` outlines.

---

## Button

```tsx
import { Button } from '@/components/ui';

<Button variant="primary" size="md" icon={<Plus />}>
  Create Entity
</Button>

<Button variant="danger" loading>
  Deleting...
</Button>

<Button variant="outline" fullWidth>
  Cancel
</Button>
```

| Prop | Type | Default |
|------|------|---------|
| `variant` | `primary` \| `secondary` \| `danger` \| `ghost` \| `outline` | `primary` |
| `size` | `sm` \| `md` \| `lg` | `md` |
| `loading` | `boolean` | `false` |
| `icon` | `ReactNode` | — |
| `fullWidth` | `boolean` | `false` |

---

## Input

```tsx
import { Input } from '@/components/ui';
import { Search } from 'lucide-react';

<Input
  label="Search Term"
  placeholder="Enter name or PK..."
  icon={<Search size={16} />}
  error={errors.search}
  helperText="Search by entity name"
/>
```

| Prop | Type | Default |
|------|------|---------|
| `label` | `string` | — |
| `error` | `string` | — |
| `helperText` | `string` | — |
| `icon` | `ReactNode` | — |

Features: focus ring transitions, icon slot with color shift on focus, error state with `AlertCircle`

---

## Select

```tsx
import { Select } from '@/components/ui';

<Select
  label="Domain"
  options={domains.map(d => ({ value: d.code, label: d.name }))}
/>

<Select label="Status">
  <option value="active">Active</option>
  <option value="stopped">Stopped</option>
</Select>
```

| Prop | Type | Default |
|------|------|---------|
| `label` | `string` | — |
| `error` | `string` | — |
| `helperText` | `string` | — |
| `options` | `{ value: string; label: string }[]` | — |

---

## Card + CardHeader

```tsx
import { Card, CardHeader, Button } from '@/components/ui';

<Card padding="lg" hover>
  <CardHeader
    title="Entity Details"
    subtitle="View and manage"
    icon={<Building2 size={18} />}
    action={<Button size="sm">Edit</Button>}
  />
  <div className="mt-4">…</div>
</Card>
```

| Card prop | Type | Default |
|-----------|------|---------|
| `padding` | `none` \| `sm` \| `md` \| `lg` | `md` |
| `hover` | `boolean` | `false` |

---

## Badge

```tsx
import { Badge } from '@/components/ui';

<Badge variant="success" size="md">Active</Badge>
<Badge variant="warning" dot>Pending Review</Badge>
```

| Prop | Type | Default |
|------|------|---------|
| `variant` | `default` \| `success` \| `warning` \| `danger` \| `info` | `default` |
| `size` | `sm` \| `md` \| `lg` | `md` |
| `dot` | `boolean` | `false` |

---

## Modal

```tsx
import { Modal, Button } from '@/components/ui';
import { useState } from 'react';

function Example() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setOpen(true)}>Open</Button>
      <Modal isOpen={open} onClose={() => setOpen(false)} title="Confirm" maxWidth="md">
        <p>Are you sure?</p>
        <div className="flex gap-2 mt-4">
          <Button variant="secondary" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={() => setOpen(false)}>Confirm</Button>
        </div>
      </Modal>
    </>
  );
}
```

| Prop | Type | Default |
|------|------|---------|
| `isOpen` | `boolean` | — |
| `onClose` | `() => void` | — |
| `title` | `string` | — |
| `maxWidth` | `sm` \| `md` \| `lg` \| `xl` \| `2xl` | `md` |
| `showCloseButton` | `boolean` | `true` |

Features: Escape-close, body scroll lock, backdrop blur + `animate-fade-in-up`

---

## LoadingSpinner

```tsx
import { LoadingSpinner } from '@/components/ui';

<LoadingSpinner size={24} text="Loading data…" />
<LoadingSpinner fullScreen color="text-brand-600" />
```

| Prop | Type | Default |
|------|------|---------|
| `size` | `number` | `24` |
| `text` | `string` | — |
| `fullScreen` | `boolean` | `false` |
| `color` | `string` | `text-brand-600` |

---

## Design Tokens

### Colors

| Token | Usage |
|-------|-------|
| `brand-*` (teal) | Primary actions, focus rings |
| `entity-*` (orange) | Entity pages, indicators |
| `nonentity-*` (blue) | Non-entity pages, indicators |
| `dct-*` (emerald) | DCT management |
| `upload-*` (violet) | Data upload |
| `site-*` (rose) | Site provisioning |
| `geo-*` (teal) | Geography manager |
| `surface-*` (gray) | Backgrounds, borders, text |

### Shadows

| Token | Value |
|-------|-------|
| `shadow-card-rest` | `0 1px 2px rgb(0 0 0 / 0.04)` |
| `shadow-card-hover` | `0 10px 15px -3px rgb(0 0 0 / 0.06)` |
| `shadow-elevated` | `0 20px 25px -5px rgb(0 0 0 / 0.08)` |
| `shadow-brand-glow` | `0 0 24px -4px var(--color-brand-300)` |

### Typography

| Token | Usage |
|-------|-------|
| `font-display` | Headings, tracking-tight |
| `font-sans` | Body text |
| `font-mono` | PKs, codes, paths, IDs |

### Spacing

- **Small**: `gap-2`, `p-3`
- **Medium**: `gap-4`, `p-5`
- **Large**: `gap-6`, `p-6`

### Borders

- **Default**: `border-surface-200`
- **Focus**: `focus:border-brand-500 focus:ring-brand-200`
- **Radius**: `rounded-xl` (12px), `rounded-2xl` (16px)

---

## Best Practices

1. **Always use UI components** instead of raw HTML elements for consistency
2. **Use variants** instead of custom classes when possible
3. **Provide labels** for form inputs for accessibility
4. **Show errors** inline with form fields
5. **Use loading states** for async operations
6. **Use modals** for confirmations and forms
7. **Use badges** for status indicators
