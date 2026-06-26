# UI Components Library

Reusable, type-safe UI components for the Layer 1 Identity Registry.

---

## Components

### Button

Standardized button with multiple variants and states.

**Props:**
- `variant`: 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline'
- `size`: 'sm' | 'md' | 'lg'
- `loading`: boolean
- `icon`: React.ReactNode
- `fullWidth`: boolean

**Usage:**
```tsx
import { Button } from '@/components/ui';
import { Plus } from 'lucide-react';

<Button variant="primary" size="md" icon={<Plus size={16} />}>
  Add New
</Button>

<Button variant="danger" loading>
  Deleting...
</Button>
```

---

### Input

Form input with label, error state, and helper text.

**Props:**
- `label`: string
- `error`: string
- `helperText`: string
- `icon`: React.ReactNode

**Usage:**
```tsx
import { Input } from '@/components/ui';
import { Search } from 'lucide-react';

<Input
  label="Search Term"
  placeholder="Enter name or ID..."
  icon={<Search size={16} />}
  error={errors.search}
  helperText="Search by entity name or PK"
/>
```

---

### Select

Dropdown select with label and error state.

**Props:**
- `label`: string
- `error`: string
- `helperText`: string
- `options`: { value: string; label: string }[]

**Usage:**
```tsx
import { Select } from '@/components/ui';

<Select
  label="Domain"
  options={[
    { value: 'MED', label: 'Medical' },
    { value: 'EDU', label: 'Education' },
  ]}
/>

// Or with children
<Select label="Status">
  <option value="">Select...</option>
  <option value="active">Active</option>
  <option value="stopped">Stopped</option>
</Select>
```

---

### Card & CardHeader

Content container with consistent styling.

**Props (Card):**
- `padding`: 'none' | 'sm' | 'md' | 'lg'
- `hover`: boolean

**Props (CardHeader):**
- `title`: string
- `subtitle`: string
- `action`: React.ReactNode

**Usage:**
```tsx
import { Card, CardHeader, Button } from '@/components/ui';

<Card padding="lg" hover>
  <CardHeader
    title="Entity Details"
    subtitle="View and manage entity information"
    action={<Button size="sm">Edit</Button>}
  />
  <div className="mt-4">
    {/* Content */}
  </div>
</Card>
```

---

### Badge

Status indicator with color variants.

**Props:**
- `variant`: 'default' | 'success' | 'warning' | 'danger' | 'info'
- `size`: 'sm' | 'md' | 'lg'

**Usage:**
```tsx
import { Badge } from '@/components/ui';

<Badge variant="success" size="md">Active</Badge>
<Badge variant="warning">Pending</Badge>
<Badge variant="danger">Stopped</Badge>
```

---

### Modal

Dialog/modal overlay with backdrop.

**Props:**
- `isOpen`: boolean
- `onClose`: () => void
- `title`: string
- `maxWidth`: 'sm' | 'md' | 'lg' | 'xl' | '2xl'
- `showCloseButton`: boolean

**Usage:**
```tsx
import { Modal, Button } from '@/components/ui';
import { useState } from 'react';

function MyComponent() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setIsOpen(true)}>Open Modal</Button>
      
      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Confirm Action"
        maxWidth="md"
      >
        <p>Are you sure you want to proceed?</p>
        <div className="flex gap-2 mt-4">
          <Button onClick={() => setIsOpen(false)}>Cancel</Button>
          <Button variant="danger">Confirm</Button>
        </div>
      </Modal>
    </>
  );
}
```

---

### LoadingSpinner

Loading indicator with optional text.

**Props:**
- `size`: number
- `text`: string
- `fullScreen`: boolean

**Usage:**
```tsx
import { LoadingSpinner } from '@/components/ui';

// Inline
<LoadingSpinner size={24} text="Loading data..." />

// Full screen overlay
<LoadingSpinner fullScreen text="Processing..." />
```

---

## Design Tokens

### Colors

**Primary**: Indigo
- `indigo-600` - Primary buttons, focus rings
- `indigo-700` - Hover states

**Success**: Emerald
- `emerald-100/800` - Success badges, messages

**Warning**: Amber
- `amber-100/800` - Warning badges, messages

**Danger**: Rose
- `rose-600` - Danger buttons, error states

**Neutral**: Slate
- `slate-100` - Secondary buttons
- `slate-700` - Text

### Typography

- **Font Display**: `font-display` - Headings
- **Font Body**: `font-sans` - Body text
- **Font Mono**: `font-mono` - Code, IDs

### Spacing

- **Small**: `gap-2`, `p-3`
- **Medium**: `gap-4`, `p-5`
- **Large**: `gap-6`, `p-6`

### Borders

- **Default**: `border-slate-200`
- **Focus**: `focus:border-indigo-500`
- **Radius**: `rounded-lg` (8px), `rounded-xl` (12px)

---

## Best Practices

1. **Always use UI components** instead of raw HTML elements for consistency
2. **Use variants** instead of custom classes when possible
3. **Provide labels** for form inputs for accessibility
4. **Show errors** inline with form fields
5. **Use loading states** for async operations
6. **Use modals** for confirmations and forms
7. **Use badges** for status indicators

---

## Examples

### Form Example
```tsx
import { Input, Select, Button } from '@/components/ui';

function EntityForm() {
  return (
    <form className="space-y-4">
      <Input
        label="Entity Name"
        placeholder="Enter entity name"
        required
      />
      
      <Select
        label="Domain"
        options={domains.map(d => ({
          value: d.code,
          label: d.name
        }))}
      />
      
      <div className="flex gap-2">
        <Button type="button" variant="secondary">
          Cancel
        </Button>
        <Button type="submit" variant="primary">
          Create Entity
        </Button>
      </div>
    </form>
  );
}
```

### List with Cards Example
```tsx
import { Card, CardHeader, Badge, Button } from '@/components/ui';

function EntityList() {
  return (
    <div className="space-y-4">
      {entities.map(entity => (
        <Card key={entity.id} hover>
          <CardHeader
            title={entity.name}
            subtitle={entity.zone_pk}
            action={
              <Badge variant={entity.status === 'active' ? 'success' : 'danger'}>
                {entity.status}
              </Badge>
            }
          />
        </Card>
      ))}
    </div>
  );
}
```

---

## Contributing

When adding new components:

1. Follow the existing component patterns
2. Include TypeScript types
3. Support common variants (size, variant)
4. Add proper accessibility attributes
5. Document props and usage
6. Test with different states
