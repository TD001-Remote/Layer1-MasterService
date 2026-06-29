# L1 Identity Registry — Tamil Nadu & Puducherry

Production-ready administrative console for managing physical settlement zones, smart district registries, domain-category-type hierarchies, and verified credential management for Tamil Nadu, Puducherry (UT), and surrounding Tamil-speaking zones.

## Quick Start

```bash
npm install
cp .env.example .env   # fill Firebase + Gemini keys
npm run dev            # dev server at :3000
npm run build          # production build
```

## Tech Stack

| Layer | Choice |
|-------|--------|
| Framework | React 19 + TypeScript 5.8 |
| Styling | Tailwind CSS 4.1 (Vite plugin) |
| Routing | React Router 7 |
| Backend | Firebase (Auth + Firestore) |
| Icons | Lucide React |
| Animation | Motion (Framer Motion successor) |
| Build | Vite 6 |

## Project Structure

```
src/
├── layouts/MainLayout.tsx          # App shell: collapsible sidebar, header, theme stripe
├── pages/
│   ├── auth/Login.tsx              # Firebase auth login
│   ├── auth/AdminSetup.tsx         # Role assignment (master-admin/admin)
│   ├── DashboardNew.tsx            # KPI cards + Entity/Non-Entity tree panels
│   ├── StagingAreaNew.tsx          # 5-tab staging: create entity, non-entity, CSV upload, review, approved
│   ├── EntityRegistry.tsx          # 3-mode registry: pending-assignment, manage-records, branch-operations
│   ├── NonEntityRegistry.tsx       # Same 3-mode structure for non-entities
│   ├── EntityManage.tsx            # Soft-delete / recover active entities
│   ├── NonEntityManage.tsx         # Soft-delete / recover non-entities
│   ├── DataUpload.tsx              # L1 → L2 JSON push, cron scheduling, history
│   ├── geography/AdvancedGeographyManager.tsx  # Zone geo-management
│   ├── sites/SiteProvisioner.tsx   # Multi-tenant portal provisioning
│   └── dct/
│       ├── entity/DCTEntityPage.tsx     # Domain/Category/Type admin (entity-scoped)
│       └── non-entity/DCTNonEntityPage.tsx  # DCT admin (non-entity-scoped)
├── components/
│   ├── ui/                         # Button, Input, Select, Card, Badge, Modal, LoadingSpinner
│   ├── DomainCategoryTypeSelector.tsx
│   ├── GeoZoneManager.tsx
│   └── ...
├── contexts/
│   ├── AuthContext.tsx             # Firebase auth + RBAC (master-admin / admin + modules)
│   └── DataContext.tsx             # All entity/non-entity/DCT state + CRUD + redirect logic
├── data/
│   └── domains.ts                  # 13 Entity + 9 Non-Entity domains with categories
├── services/api/
│   ├── taxonomyApi.ts              # DCT Firestore CRUD
│   ├── entityApi.ts / nonEntityApi.ts / siteApi.ts / geoApi.ts / pendingApi.ts
├── types.ts                        # All interfaces (RegistryDomain, RegistryCategory, RegistryType, etc.)
└── index.css                       # Design tokens, animations, glass utility, scrollbar
```

## Features

### Core Workflows

| Workflow | Description |
|----------|-------------|
| **Staging → Assignment → Active** | Create without geo → admin approves → assign geo/zone → active registry |
| **DCT Management** | Split / convert / merge / modify / stop domains, categories, types with redirect chains |
| **L1 → L2 Data Push** | Domain-split JSON export, Drive link storage, 2-day cron scheduling |
| **RBAC** | Master-admin bypasses module checks; admin requires per-module permission (localStorage-persisted) |

### Design System

- **Custom Tailwind tokens** — brand (teal), entity (orange), non-entity (blue), dct (emerald), upload (violet), site (rose), geo (teal) scales
- **Typography** — Inter (body), Space Grotesk (display), JetBrains Mono (code)
- **Animations** — `fade-in-up`, `slide-in-left`, `pulse-soft`, `shimmer` via CSS keyframes
- **Glass morphism** — `.glass` utility (backdrop-blur + translucent bg)

### UI Component Library (`src/components/ui/`)

| Component | Variants |
|-----------|----------|
| `Button` | primary, secondary, danger, ghost, outline — 3 sizes |
| `Input` | label, error, helperText, icon support |
| `Select` | label, error, options array or children |
| `Card` / `CardHeader` | padding none/sm/md/lg, optional hover lift |
| `Badge` | default/success/warning/danger/info — dot indicator optional |
| `Modal` | 5 max-widths, Escape-close, body scroll lock |
| `LoadingSpinner` | custom color, full-screen overlay |

## Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Dev server (Vite, HMR) |
| `npm run build` | Production build |
| `npm run lint` | TypeScript type-check (`tsc --noEmit`) |

## Deployment

1. `npm run build`
2. Deploy `dist/` to Firebase Hosting, Netlify, or any static host
3. Configure `.env` with real `VITE_FIREBASE_*` and `VITE_GEMINI_API_KEY`

## Key Architectural Decisions

- **Hierarchical Firestore** — domains/{code}/categories/{pk}/entity/{pk} scales to 1M+ records
- **In-memory first** — DataContext mirrors Firestore; swap layer for persistence when ready
- **Approval queue** — Non-master-admin DCT changes require master-admin approval (localStorage-backed)
- **Entity / Non-Entity separation** — Separate pages, separate DCT filters, separate colors/icons throughout

## Documentation

| File | Purpose |
|------|---------|
| `PROJECT-COMPLETE-SUMMARY.md` | Full feature & phase history |
| `FINAL-ARCHITECTURE.md` | Collection layout + workflow diagrams |
| `DEVELOPMENT-PROGRESS-SUMMARY.md` | Phase-by-phase delivery log |
| `ENTITY-VS-NON-ENTITY-STRUCTURE.md` | Data model comparison |
