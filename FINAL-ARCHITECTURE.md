# FINAL ARCHITECTURE — L1 Identity Registry

## Core Principles

1. **Staging Area** = CREATE (no geo/zone required)
2. **Registry** = ASSIGN geo/zone + MANAGE + MODIFY branch/tree
3. **DCT** = Domain-Category-Type hierarchy with lifecycle (split / convert / merge / stop)
4. **Entity / Non-Entity** = COMPLETELY SEPARATE at every layer
5. **Role-based access** = master-admin bypasses module checks; admin requires per-module permission

---

## Firestore Collections

```
staging-entity/              # CREATE: basic info, status=pending|approved|rejected
staging-non-entity/          # CREATE: basic info, status=pending|approved|rejected

entity-registry/
  domains/{domain_code}/
    categories/{category_pk}/
      entity/{entity_pk}     # ACTIVE: full geo + branch assigned
      types/{type_pk}/
        entity/{entity_pk}

non-entity-registry/
  domains/{domain_code}/
    categories/{category_pk}/
      non-entity/{non_entity_pk}
      types/{type_pk}/
        non-entity/{non_entity_pk}

domains/                     # RegistryDomain docs (DCT master)
categories/                  # RegistryCategory docs
types/                       # RegistryType docs
dct-changes/                 # DCTChangeRecord audit log
dct-pending/                 # PendingDctChange approval queue
dct-archive/                 # DCTArchiveRecord (stopped, with redirectTo)
sites/                       # SetSite documents
zones/                       # ZoneRef documents
```

---

## DCT Workflows

| Workflow | Effect |
|----------|--------|
| **Split** | One domain → N new domains; categories redistributed; entities redirected |
| **Convert** | Rename / recode existing DCT; redirects to existing if code clash |
| **Merge** | N source DCTs → 1 target DCT; all records + archive redirect |
| **Modify** | Name / code change only, same PK preserved |
| **Stop** | Soft archive → `dctArchive`; optional redirect target; recoverable |

Non-master-admin actions go through `dct-pending/` queue. Master-admin approves/rejects via `DCTEntityPage` / `DCTNonEntityPage` → Approval Queue tab.

---

## Dashboard Layout

```
┌──────────────────────────────────────────────────────────────────┐
│  TN & Puducherry L1 Identity Registry                            │
│  ┌──────────── KPI Cards ────────────┐  ┌──── Tree Panels ────┐ │
│  │ Zones │ Sites │ Entities │ NonEnt │  │ Entity Tree │ Non-Ent│ │
│  └──────────────────────────────────┘  └─────────────────────┘ │
└──────────────────────────────────────────────────────────────────┘
```

---

## Navigation

```
MainLayout
├── Dashboard
├── Staging
│   ├── Create Entity
│   ├── Create Non-Entity
│   ├── Upload CSV
│   ├── Pending Review
│   └── Approved
├── Entity Assignment
├── Entity Management
├── Entity Registry
│   ├── Assign Geo/Zone
│   ├── Manage Records
│   └── Branch Operations
├── Non-Entity Assignment
├── Non-Entity Management
├── Non-Entity Registry
│   ├── Assign Geo
│   ├── Manage Records
│   └── Branch Operations
├── DCT Entity Admin
├── DCT Non-Entity Admin
├── Geography
├── Sites
└── Data Upload (L1 → L2)
```

---

## Component Library

Located at `src/components/ui/` — all components use custom Tailwind tokens, `rounded-xl/2xl`, `font-extrabold` headings, `active:scale-[0.97]` press feedback, and consistent focus rings.

| Component | Notes |
|-----------|-------|
| `Button` | 5 variants, 3 sizes, loading spinner, icon support |
| `Input` | Label, error, helper text, icon slot, focus ring |
| `Select` | Options array or children, dropdown icon, error state |
| `Card` / `CardHeader` | 4 padding tiers, optional hover lift |
| `Badge` | 5 color variants, 3 sizes, optional animated dot |
| `Modal` | 5 max-widths, backdrop-blur, Escape-close |
| `LoadingSpinner` | Custom color, full-screen overlay |

---

## Data Flow

```
User Action
  → DataContext method (entityApi / nonEntityApi / taxonomyApi)
  → Firestore write via fetchCollection / saveDoc / deleteDocById
  → UI re-render from DataContext state
```

DataContext is single source of truth for UI. Firestore is persistence layer only.

---

## Key Files

| File | Responsibility |
|------|----------------|
| `src/types.ts` | All TypeScript interfaces |
| `src/data/domains.ts` | Seed domains, categories, lookup helpers |
| `src/data/mockData.ts` | masterDomains / masterCategories / masterTypes |
| `src/contexts/DataContext.tsx` | All app state + business logic |
| `src/contexts/AuthContext.tsx` | Firebase auth + RBAC |
| `src/services/api/taxonomyApi.ts` | DCT CRUD |
| `src/services/api/entityApi.ts` | Entity CRUD |
| `src/services/api/nonEntityApi.ts` | Non-entity CRUD + redirect logic |
| `src/layouts/MainLayout.tsx` | Shell: sidebar, header, theme |
| `src/index.css` | Tokens, animations, glass, scrollbar |
