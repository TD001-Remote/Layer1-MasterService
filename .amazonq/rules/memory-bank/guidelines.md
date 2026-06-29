# Development Guidelines

## Code Quality Standards

### License Header (All files)
Every source file begins with the Apache-2.0 SPDX identifier:
```ts
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
```

### TypeScript Conventions
- All interfaces defined in `src/types.ts` — never inline complex types in components
- Use `interface` over `type` for object shapes; `type` for unions/aliases
- Prefer `Omit<T, 'field1' | 'field2'>` for derived types (e.g., `Omit<StagingEntity, 'id' | 'uploadedAt'>`)
- Use `as const` when forcing literal types: `{ ...entity, status: 'active' as const }`
- ID fields use string PKs with structured prefixes: `ENT-XXXXXX`, `NENT-XXXXXX`, `STAGE-ENT-{timestamp}`, `ZON-CITY-XXX`, `CAT-XXX-NNN`, `TYP-XXX-NNN-NN`
- Optional fields marked with `?`, never `| undefined` in interfaces
- Timestamps always ISO 8601 strings: `new Date().toISOString()`

### Naming Conventions
- React components: PascalCase files and exports (`DataContext.tsx`, `DashboardNew.tsx`)
- Hooks: `useData()`, `useAuth()` — custom hooks always prefixed `use`
- Context factory: named export `DataProvider`, accessor export `useData`
- Static data arrays: `camelCase` for exports (`masterDomains`, `seedActiveEntities`)
- Constants/enum-like arrays: `UPPER_SNAKE_CASE` (`ENTITY_DOMAINS`, `NON_ENTITY_DOMAINS`)
- API modules: `camelCase` noun + `Api` suffix (`entityApi`, `geoApi`, `taxonomyApi`)
- Domain codes: SHORT_UPPER (`MED`, `EDU`, `TOU`) for legacy; `SEGMENT-SEGMENT` for new (`BUS-FOD`, `RE-COM`)
- Category PKs: `CAT-{DOMAIN}-{NNN}` pattern (e.g., `CAT-MED-101`)
- Type PKs: `TYP-{DOMAIN}-{CAT_NUM}-{NN}` pattern (e.g., `TYP-MED-101-01`)

## Structural Conventions

### Context Pattern (DataContext / AuthContext)
```tsx
// 1. Define full interface for context value
interface DataContextType { ... }

// 2. Create context with undefined default
const DataContext = createContext<DataContextType | undefined>(undefined);

// 3. Provider as named function export
export function DataProvider({ children }: { children: ReactNode }) { ... }

// 4. Hook with guard
export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) throw new Error('useData must be used within a DataProvider');
  return context;
}
```

### Action Pattern (all mutating context methods)
All context actions follow this exact pattern — async, try/catch, state update + toast:
```tsx
const addEntity = async (entity: ActiveEntity) => {
  try {
    const updated = { ...entity, status: 'active' as const };
    await entityApi.create(updated);
    setActiveEntities((prev) => [...prev, updated]);
    showToast('success', `Entity '${entity.entity_name}' successfully added.`);
  } catch (err) {
    console.error(err);
    showToast('warning', `Failed to add entity '${entity.entity_name}'.`);
  }
};
```

Pattern rules:
- Always `async` + `await` the API call
- Optimistic update only AFTER awaiting API (never before)
- State updater uses functional form: `setState((prev) => [...])`
- Success toast: `'success'` type with descriptive message including the record name
- Failure toast: `'warning'` type (not 'error') with "Failed to..." prefix
- Always `console.error(err)` in catch (never silent failures)

### Stop/Recover Pattern (soft delete)
Records are never hard-deleted — they use `status: 'active' | 'stopped'`:
```tsx
const stopEntity = async (entityPk: string) => {
  try {
    const ent = activeEntities.find((e) => e.entity_pk === entityPk);
    if (ent) {
      await entityApi.updateStatus(entityPk, 'stopped');
      setActiveEntities((prev) => prev.map((e) => e.entity_pk === entityPk ? { ...e, status: 'stopped' } : e));
      showToast('warning', `Entity '${ent.entity_name}' set to stopped.`);
    }
  } catch (err) { ... }
};
```
- Stop uses `'warning'` toast (amber), recover uses `'success'` toast (green)
- State update uses `.map()` with spread to preserve immutability

### ID Generation Pattern
```ts
// Sequential padded IDs
const newId = `ZON-CITY-${String(cities.length + 1).padStart(3, '0')}`;
const entityPk = `ENT-${String(registryEntities.length + 1).padStart(6, '0')}`;
// Timestamp-based for staging
const stagingId = `STAGE-ENT-${Date.now()}`;
```

## Semantic Patterns

### Data Layer Separation
- `src/data/mockData.ts` — seed/static data exported as named arrays (`seedActiveEntities`, `masterDomains`)
- `src/data/domains.ts` — static taxonomy for entity/non-entity domain classification, separate from `mockData.ts`
- `src/data/tamilnadu-geography.ts` — geo hierarchy (never mixed with domains or entities)
- API modules in `src/services/api/` call Firestore — never called directly from components

### Domain System (Two Taxonomies)
The project maintains TWO parallel domain systems:
1. **Legacy (mockData.ts)**: Short codes `MED`, `EDU`, `TOU` etc. used in `ActiveEntity`, `NonEntity`, `PendingEntity`
2. **New (domains.ts)**: Compound codes `BUS-FOD`, `RE-COM`, `HLT-SRV` etc. used in `StagingEntity`, `StagingNonEntity`

Non-entities use `NON_ENTITY_DOMAINS` (assets: real estate, infrastructure, natural assets)
Entities use `ENTITY_DOMAINS` (service providers: businesses, professionals, government)

### Domain Data Helper Pattern (domains.ts)
```ts
// Lookup helpers always return undefined-safe
export const getEntityDomainByCode = (code: string): Domain | undefined =>
  ENTITY_DOMAINS.find(d => d.code === code);

export const getEntityCategoryById = (categoryId: string): { domain: Domain; category: Category } | undefined => {
  for (const domain of ENTITY_DOMAINS) {
    const category = domain.categories.find(c => c.id === categoryId);
    if (category) return { domain, category };
  }
  return undefined;
};
```

### Route Architecture (React Router v7)
```tsx
// Single router export, all protected routes nested under ProtectedRoute + MainLayout
export const router = createBrowserRouter([
  { path: '/login', element: <Login />, errorElement: <ErrorFallback /> },
  {
    path: '/',
    element: <ProtectedRoute><MainLayout /></ProtectedRoute>,
    errorElement: <ErrorFallback />,
    children: [ ... ]
  }
]);
```
- Root `'/'` redirects to `'/dashboard'` via `<Navigate to="/dashboard" replace />`
- All new feature routes added as flat children (not nested routes)
- Old routes kept with `-old` suffix for backward compatibility during migration

### Static Data Structure Pattern (mockData.ts)
```ts
// Geo skeleton: const arrays with structured IDs
export const states: GeoState[] = [
  { id: "GEO-TN", name: "Tamil Nadu" },
];
// ID convention: GEO-{STATE}-{DISTRICT}-{TALUK}
```

### Firebase Initialization Pattern
- All Firestore/Auth instances initialized once in `src/lib/firebase.ts`
- `DataContext` calls seed APIs on mount via `useEffect` with `initFirebase()` async function
- Seeding is idempotent — API layer checks for existing data before writing

### Toast System
Built into `DataContext`, NOT a separate library:
```tsx
const showToast = (type: 'success' | 'info' | 'warning', message: string) => setToast({ type, message });
// Auto-dismiss after 6000ms via useEffect
// Rendered inline in DataProvider JSX, fixed top-right position
```
Toast color mapping: `success` → green, `warning` → amber, `info` → blue

### UI Component Pattern (src/components/ui/)
Primitive components (Button, Card, Badge, Input, Select, Modal, LoadingSpinner) are:
- Stateless, prop-driven
- Tailwind utility classes only (no CSS modules)
- All re-exported from `src/components/ui/index.ts`

### Staging → Registry Two-Stage Flow
```
1. createStagingEntity/NonEntity  →  StagingEntity (id: STAGE-ENT-{ts}, status: 'pending')
2. approveStagingEntity           →  StagingEntity (status: 'approved')
3. assignEntityToRegistry         →  RegistryEntity (entity_pk: ENT-XXXXXX) + removes from staging
```
Staging entities have NO geo/zone fields. Registry entities REQUIRE `zone_pk` and all geo IDs.

### GeoZone ID Format
```
Zone PK: ZON-{CITY_NUM}-{AREA_NUM}-{STREET_NUM}
Sub-street: ZON-{CITY_NUM}-{AREA_NUM}-{STREET_NUM}-SUB-{SUB_NUM}
```
Geographic IDs use hierarchical prefixes: `GEO-TN` → `GEO-TN-MAY` → `GEO-TN-MAY-SIR`

## Practices to Follow

1. All new domains/categories must go into `src/data/domains.ts` (not mockData.ts) and follow the `id: 'E-{DOMAIN}'` / `id: 'NE-{DOMAIN}'` prefix convention
2. All new shared types go into `src/types.ts` — never define data-model interfaces locally in components
3. API calls always go through `src/services/api/` — components must not import from `src/lib/firebase.ts` directly
4. Use `useData()` for all data access in components, never prop-drilling context values
5. When adding new entity-like records, always implement the `add/update/stop/recover` quartet in DataContext
6. New routes are always children of the `'/'` protected route, never top-level
7. Seed data arrays (states, districts, taluks) are static and immutable — only cities/areas/streets/substreets are mutable via API
8. `// TODO:` comments mark incomplete auth integration (e.g., `assignedBy: 'admin' // TODO: Get from auth context`)
