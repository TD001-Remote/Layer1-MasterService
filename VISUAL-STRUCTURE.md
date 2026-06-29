# Visual Structure — v3.0

```
┌────────────────────────────────────────────────────────────────────────┐
│                         MAIN LAYOUT                                     │
│  ┌──────────┐ ┌──────────────────────────────────────┐              │
│  │ SIDEBAR  │ │  HEADER (glass, theme-aware icon)   │              │
│  │ collaps. │ │  User avatar + logout               │              │
│  │ active   │ └──────────────────────────────────────┘              │
│  │ stripe   │                                                       │
│  └──────────┘  ┌──────────────────────────────────────────────┐     │
│              │  PAGE CONTENT (theme stripe per route)          │     │
│              │                                                 │     │
│              │  Dashboard → KPI + Tree Panels                  │     │
│              │  Staging → 5-tab creator/review                 │     │
│              │  Registry → 3-mode tabs                         │     │
│              │  DCT → admin + approval queue                   │     │
│              │  DataUpload → tables + modals                   │     │
│              └──────────────────────────────────────────────┘     │
└────────────────────────────────────────────────────────────────────────┘

── DASHBOARD ─────────────────────────────────────────────────────────────
│                                                                        │
│  ┌─Hero───────────────────────────────────────────────────────────┐  │
│  │  "Tamil Nadu & Pudcherry L1 Identity Registry"                 │  │
│  │  + New Entry / View Registry CTA                                │  │
│  └────────────────────────────────────────────────────────────────┘  │
│                                                                        │
│  ┌─KPI Grid (2×2 on lg)───────────────────────────────────────────┐  │
│  │  [Zones] [Sites] [Active Entities] [Active Non-Entities]       │  │
│  └────────────────────────────────────────────────────────────────┘  │
│                                                                        │
│  ┌─Metrics Row────────────────────────────────────────────────────┐  │
│  │  [Pending Entity Review] [Pending Non-Entity Review] [Total]   │  │
│  └────────────────────────────────────────────────────────────────┘  │
│                                                                        │
│  ┌─Tree Panels (1×2 on lg)───────────────────────────────────────┐  │
│  │  Entity Registry Tree │ Non-Entity Registry Tree              │  │
│  │  domain → category → count (expandable)                       │  │
│  └────────────────────────────────────────────────────────────────┘  │
│                                                                        │
│  ┌─Architecture Overview─────────────────────────────────────────┐   │
│  │  Step 1 Staging → Step 2 Assignment → Step 3 Active Registry │   │
│  └────────────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────────────┘

── STAGING AREA ──────────────────────────────────────────────────────────
│                                                                        │
│  Tabs:                                                                 │
│  [Create Entity] [Create Non-Entity] [Upload CSV]                      │
│  [Pending Review (3)] [Approved (2)]                                   │
│                                                                        │
│  Create Entity:                                                         │
│  ┌─Classification─────────────────────────────────────────────────┐  │
│  │  [Entity] [Non-Entity] toggle                                    │  │
│  │  Domain → Category → Type (optional)                             │  │
│  │  Roles: [✓ Asset Provider] [✓ Service Provider]                  │  │
│  │  Storage path preview                                            │  │
│  └────────────────────────────────────────────────────────────────┘  │
│                                                                        │
│  Pending Review:                                                        │
│  ┌─Entity Card────────────────────────────────────────────────────┐  │
│  │  [Icon] Name  Phone                                             │  │
│  │  Domain badge + Category badge                                  │  │
│  │  Role badges                                                    │  │
│  │  [Approve] [Reject]                                             │  │
│  └────────────────────────────────────────────────────────────────┘  │
│                                                                        │
│  Approved:                                                              │
│  ┌─Entity Card────────────────────────────────────────────────────┐  │
│  │  Name  Domain / Category                                         │  │
│  │  [✓ Ready for Assignment]                                        │  │
│  └────────────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────────────┘

── ENTITY REGISTRY ────────────────────────────────────────────────────────
│                                                                        │
│  View Modes:                                                            │
│  [Assign Geo/Zone (2)] [Manage Records] [Branch Operations]            │
│                                                                        │
│  Pending Assignment:                                                    │
│  ┌─Entity Card────────────────────────────────────────────────────┐  │
│  │  [Avatar] Name  Phone                                          │  │
│  │  Domain badge  Category badge                                   │  │
│  │  Role badges                                                    │  │
│  │  [📍 Assign Geo/Zone]                                          │  │
│  └────────────────────────────────────────────────────────────────┘  │
│                                                                        │
│  Manage Records:                                                        │
│  ┌─Search + Filter────────────────────────────────────────────────┐  │
│  │  [🔍 Search...] [Domain ▾]                                      │  │
│  └────────────────────────────────────────────────────────────────┘  │
│  ┌─Table──────────────────────────────────────────────────────────┐  │
│  │  Name | Phone | Domain | Location | [Edit] [Delete]            │  │
│  └────────────────────────────────────────────────────────────────┘  │
│                                                                        │
│  Branch Operations:                                                     │
│  ┌─Domain Accordion───────────────────────────────────────────────┐  │
│  │  📁 MED (5 entities)                                            │  │
│  │    ├─ entity-item → [Move Branch]                               │  │
│  │    └─ entity-item → [Move Branch]                               │  │
│  └────────────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────────────┘

── DCT ENTITY ADMIN ───────────────────────────────────────────────────────
│                                                                        │
│  Tabs:                                                                 │
│  [Domains] [Categories] [Types] [Approval Queue] [Archive]            │
│                                                                        │
│  Domains tab:                                                           │
│  ┌─Domain Card─────────────────────────────────────────────────────┐  │
│  │  MED  Medical & Health Services                                 │  │
│  │  3 categories  •  12 types  •  45 entities                      │  │
│  │  [Stop] [Split] [Convert] [Merge] [Modify]                      │  │
│  └────────────────────────────────────────────────────────────────┘  │
│                                                                        │
│  Management Mode (appears when action selected):                       │
│  ┌─Split Form─────────────────────────────────────────────────────┐  │
│  │  Split MED into:                                                │  │
│  │  ┌─New Domain────────────────┐  ┌─Categories──────────────┐   │  │
│  │  │ Code: MED-HOSP            │  │  ☑ CAT-MED-101           │   │  │
│  │  │ Name: Hospital Services   │  │  ☑ CAT-MED-102           │   │  │
│  │  └──────────────────────────┘  └──────────────────────────┘   │  │
│  │  [+ Add Another Domain]                                        │  │
│  │  [Cancel]  [Confirm Split]                                      │  │
│  └────────────────────────────────────────────────────────────────┘  │
│                                                                        │
│  Approval Queue (non-master-admin submissions):                        │
│  ┌─Change Card─────────────────────────────────────────────────────┐  │
│  │  Action: split  Type: domain  ID: MED                           │  │
│  │  Old: Medical Services  →  New: MED-HOSP / MED-CLINIC          │  │
│  │  By: admin@example.com  •  2026-06-29                          │  │
│  │  [Approve] [Reject]                                             │  │
│  └────────────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────────────┘

── DATA UPLOAD (L1 → L2) ─────────────────────────────────────────────────
│                                                                        │
│  ┌─Domain Select──────────────────────────────────────────────────┐  │
│  │  Domain: [All Domains ▾]                                        │  │
│  └────────────────────────────────────────────────────────────────┘  │
│                                                                        │
│  ┌─Domain Table────────────────────────────────────────────────────┐  │
│  │  Domain | Entities | Non-Entities | Actions                    │  │
│  │  MED    | 45       | 12           | 👁 ⬇ ⬆ 🗓 👁 ⬇ ⬆ 🗓    │  │
│  │  EDU    | 23       | 5            | ...                        │  │
│  └────────────────────────────────────────────────────────────────┘  │
│                                                                        │
│  Actions per domain row:                                               │
│  👁 Preview JSON  ⬇ Download  ⬆ Push to L2  🗓 Schedule Cron (2d)   │
│                                                                        │
│  ┌─Scheduled Jobs─────────────────────────────────────────────────┐  │
│  │  JOB-001 | MED | Next: Jul 1 | Last: Jun 29 | scheduled [🗑]  │  │
│  └────────────────────────────────────────────────────────────────┘  │
│                                                                        │
│  ┌─Upload History─────────────────────────────────────────────────┐  │
│  │  File | Domain/Type | Records | Date | Status | Link           │  │
│  └────────────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────────────┘

── ERROR BOUNDARY ─────────────────────────────────────────────────────────
│                                                                        │
│  ┌─Card────────────────────────────────────────────────────────────┐  │
│  │              ⚠️ Workflow icon (rose-600)                         │  │
│  │  Something went wrong                                            │  │
│  │  The application encountered an unexpected error.                │  │
│  │                                                                  │  │
│  │  ┌─Error details────────────────────────────────────────────┐   │  │
│  │  │  Error: isActive is not defined                           │   │  │
│  │  └──────────────────────────────────────────────────────────┘   │  │
│  │                                                                  │  │
│  │  [Return Home]  [Reload Page]                                    │  │
│  └────────────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────────────┘
```

---

**Status**: ✅ CURRENT AS OF v3.0  
**Key change**: DCT now has split / convert / merge / modify / stop + approval queue  
**Build**: passing
