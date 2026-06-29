# Project Structure

## Directory Layout

```
project-layer-1/
├── src/
│   ├── components/
│   │   ├── ui/              # Atomic components: Button, Input, Select, Card, Badge, Modal, LoadingSpinner
│   │   ├── DashboardNew.tsx            # KPI cards + Entity/Non-Entity tree panels
│   │   ├── StagingAreaNew.tsx          # 5-tab staging: create/CSV/review/approved
│   │   ├── GeoZoneManager.tsx          # Zone assignment UI
│   │   ├── SiteProvisioner.tsx         # Multi-tenant portal provisioning
│   │   ├── DomainCategoryTypeSelector.tsx  # Cascading DCT picker
│   │   ├── ErrorBoundary.tsx / ErrorFallback.tsx
│   │   └── ProtectedRoute.tsx          # Auth gate wrapper
│   ├── contexts/
│   │   ├── AuthContext.tsx   # Firebase Auth + RBAC (master-admin/admin + modules)
│   │   └── DataContext.tsx   # Central store: entities, non-entities, DCT, staging, sites, zones
│   ├── data/
│   │   ├── domains.ts        # 13 Entity + 9 Non-Entity domains with categories
│   │   └── mockData.ts       # masterDomains / masterCategories / masterTypes
│   ├── layouts/
│   │   └── MainLayout.tsx    # App shell: collapsible sidebar, glass header, theme stripe
│   ├── lib/
│   │   └── firebase.ts       # Firebase app init, Firestore + Auth exports
│   ├── pages/
│   │   ├── auth/Login.tsx / AdminSetup.tsx
│   │   ├── DashboardNew.tsx
│   │   ├── StagingAreaNew.tsx
│   │   ├── DataUpload.tsx                    # L1 → L2 push + cron
│   │   ├── EntityRegistry.tsx / NonEntityRegistry.tsx
│   │   ├── EntityManage.tsx / NonEntityManage.tsx
│   │   ├── EntityAssignGeoZone.tsx / NonEntityAssignGeo.tsx
│   │   ├── geography/AdvancedGeographyManager.tsx
│   │   ├── sites/SiteProvisioner.tsx
│   │   └── dct/
│   │       ├── entity/DCTEntityPage.tsx      # DCT admin (entity-scoped)
│   │       └── non-entity/DCTNonEntityPage.tsx # DCT admin (non-entity-scoped)
│   ├── routes/index.tsx      # React Router v7 route tree (25+ routes)
│   ├── services/api/
│   │   ├── taxonomyApi.ts    # Domain/category/type Firestore CRUD
│   │   ├── entityApi.ts      # Entity Firestore operations
│   │   ├── nonEntityApi.ts   # Non-entity + redirect logic
│   │   ├── siteApi.ts / geoApi.ts / pendingApi.ts
│   ├── utils/
│   │   ├── csvParser.ts      # CSV parsing + row validation
│   │   └── validation.ts     # Field-level validation
│   ├── types.ts              # 30+ interfaces
│   ├── main.tsx              # React entry point
│   └── index.css             # Design tokens, animations, glass utility
├── datacollection/           # Research docs for domain/category design
├── assets/                   # Static assets
├── firebase.json / .firebaserc / firestore.rules
├── vite.config.ts
├── tsconfig.json
├── package.json
└── *.md                      # Project documentation
```

## Core Architectural Patterns

### Two-Stage Data Pipeline
```
Staging (no geo/zone) → Admin Approval → Assignment (geo/zone + branch) → Active Registry
```

### DCT Lifecycle
```
Domain/Category/Type
  → Split → multiple new DCTs with category redistribution
  → Convert → rename/recode with optional redirect
  → Merge → consolidate into target
  → Modify → name/code change only
  → Stop → soft archive + redirect + recoverable
```

### Context-Driven State
- `DataContext` — single source of truth via `useData()` hook
- `AuthContext` — Firebase Auth + RBAC via `useAuth()` hook

### Service Layer
- All Firestore operations isolated in `src/services/api/`
- Each domain has its own API module
- Generic helpers in `src/lib/firebase.ts`

### Component Conventions
- Pages compose shared components from `src/components/`
- UI primitives in `src/components/ui/` are stateless and prop-driven
- `ProtectedRoute` wraps all authenticated pages in route tree
