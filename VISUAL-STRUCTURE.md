# Visual Architecture Structure

## 🎯 Complete System Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                              USER INTERFACE                              │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│                             📊 DASHBOARD                                 │
│          Central Hub - Domain/Category/Type Navigation                  │
│                                                                          │
│  ┌─────────────────────────┬─────────────────────────────────────────┐ │
│  │     ENTITY TREE         │       NON-ENTITY TREE                   │ │
│  │                         │                                         │ │
│  │  📦 MED                 │  📦 MED                                 │ │
│  │    └─ CAT-MED-101       │    └─ CAT-MED-101                       │ │
│  │        ├─ Direct (789)  │        ├─ Direct (12)                   │ │
│  │        └─ Types         │        └─ Types                         │ │
│  │            └─ TYP-... │            └─ TYP-...                   │ │
│  │                         │                                         │ │
│  │  📦 RET                 │  📦 TOU                                 │ │
│  │    └─ CAT-RET-201       │    └─ CAT-TOU-722                       │ │
│  └─────────────────────────┴─────────────────────────────────────────┘ │
│                                                                          │
│  Click any node → Navigate to that branch in registry                   │
└─────────────────────────────────────────────────────────────────────────┘

            ↓ User clicks                   ↓ User clicks
            
┌─────────────────────────────┬─────────────────────────────────────────┐
│    📝 STAGING AREA          │     📝 STAGING AREA                     │
│    (Entity Creation)        │     (Non-Entity Creation)               │
│                             │                                         │
│  Tabs:                      │  Tabs:                                  │
│  • Create Entity            │  • Create Non-Entity                    │
│  • Upload CSV               │  • Upload CSV                           │
│  • Pending Review           │  • Pending Review                       │
│  • Approved                 │  • Approved                             │
│                             │                                         │
│  Form Fields:               │  Form Fields:                           │
│  - Entity Name ✅           │  - Non-Entity Name ✅                   │
│  - Phone ✅                 │  - Phone (optional) ⚠️                  │
│  - Domain ✅                │  - Domain ✅                            │
│  - Category ✅              │  - Category ✅                          │
│  - NO geo/zone ❌           │  - NO geo/zone ❌                       │
│                             │                                         │
│  Save to:                   │  Save to:                               │
│  staging-entity/            │  staging-non-entity/                    │
└──────────┬──────────────────┴────────────┬────────────────────────────┘
           │                               │
           │ Admin Reviews                 │ Admin Reviews
           ↓                               ↓
           
┌─────────────────────────────┬─────────────────────────────────────────┐
│   ✅ APPROVE or ❌ REJECT   │   ✅ APPROVE or ❌ REJECT               │
└──────────┬──────────────────┴────────────┬────────────────────────────┘
           │                               │
           │ If Approved                   │ If Approved
           ↓                               ↓
           
┌─────────────────────────────┬─────────────────────────────────────────┐
│  📍 ENTITY ASSIGNMENT       │  📍 NON-ENTITY ASSIGNMENT               │
│  (Admin Assigns Geo/Zone)   │  (Admin Assigns Geo)                    │
│                             │                                         │
│  Assign:                    │  Assign:                                │
│  ✅ State/District/Taluk    │  ✅ State/District/Taluk                │
│  ✅ City/Area/Street        │  ⚠️ City/Area/Street (optional)         │
│  ✅ Zone PK (REQUIRED)      │  ⚠️ Zone PK (OPTIONAL)                  │
│  ✅ Domain/Category/Type    │  ✅ Domain/Category/Type                │
│                             │                                         │
│  Choose Branch:             │  Choose Branch:                         │
│  • Direct under category    │  • Direct under category                │
│  • Under type (tree)        │  • Under type (tree)                    │
└──────────┬──────────────────┴────────────┬────────────────────────────┘
           │                               │
           │ Save to Registry              │ Save to Registry
           ↓                               ↓
           
┌─────────────────────────────┬─────────────────────────────────────────┐
│  🏛️ ENTITY REGISTRY         │  🏛️ NON-ENTITY REGISTRY                │
│  (Manage Entities)          │  (Manage Non-Entities)                  │
│                             │                                         │
│  Tabs:                      │  Tabs:                                  │
│  • Pending Assignment       │  • Pending Assignment                   │
│  • Active Entities          │  • Active Non-Entities                  │
│  • Modify Branch            │  • Modify Branch                        │
│  • Stopped/Deleted          │  • Stopped/Deleted                      │
│                             │                                         │
│  Storage:                   │  Storage:                               │
│  entity-registry/           │  non-entity-registry/                   │
│    domains/MED/             │    domains/TOU/                         │
│      categories/CAT-MED-101/│      categories/CAT-TOU-722/            │
│        ├─ entity/           │        ├─ non-entity/                   │
│        │   └─ ENT-001       │        │   └─ NENT-001                  │
│        └─ types/TYP-.../    │        └─ types/TYP-.../                │
│            └─ entity/       │            └─ non-entity/               │
│                └─ ENT-002   │                └─ NENT-002              │
│                             │                                         │
│  Actions:                   │  Actions:                               │
│  • View                     │  • View                                 │
│  • Modify                   │  • Modify                               │
│  • Reassign Geo/Zone        │  • Reassign Geo                         │
│  • Move Branch (re-categorize)│ • Move Branch (re-categorize)        │
│  • Delete/Recovery          │  • Delete/Recovery                      │
└─────────────────────────────┴─────────────────────────────────────────┘
```

---

## 🗄️ Firestore Structure

```
FIRESTORE DATABASE

├── 📁 staging-entity/              ← TEMPORARY (Create without geo/zone)
│   ├── TEMP-001
│   │   ├── entity_name: "Hospital Name"
│   │   ├── phone: "1234567890"
│   │   ├── primary_domain: "MED"
│   │   ├── category_pk: "CAT-MED-101"
│   │   ├── status: "pending"
│   │   └── uploadedAt: "2026-06-26T10:00:00Z"
│   └── TEMP-002
│
├── 📁 staging-non-entity/          ← TEMPORARY (Create without geo/zone)
│   ├── TEMP-101
│   │   ├── non_entity_name: "Festival Route"
│   │   ├── primary_domain: "TOU"
│   │   ├── category_pk: "CAT-TOU-722"
│   │   ├── status: "pending"
│   │   └── uploadedAt: "2026-06-26T10:00:00Z"
│   └── TEMP-102
│
├── 📁 entity-registry/             ← PERMANENT (After geo/zone assigned)
│   └── domains/
│       ├── MED/
│       │   └── categories/
│       │       └── CAT-MED-101/
│       │           ├── entity/                 ← Direct branch
│       │           │   └── ENT-MED-101-001
│       │           │       ├── entity_name: "Hospital A"
│       │           │       ├── phone: "1234567890"
│       │           │       ├── zone_pk: "ZON-TN-MAY-..."
│       │           │       ├── stateId: "GEO-TN"
│       │           │       ├── districtId: "GEO-TN-MAY"
│       │           │       └── ... (full geo)
│       │           │
│       │           └── types/
│       │               ├── TYP-MED-101-01/
│       │               │   └── entity/         ← Type branch
│       │               │       └── ENT-MED-101-002
│       │               │
│       │               └── TYP-MED-101-02/
│       │                   └── entity/
│       │                       └── ENT-MED-101-003
│       │                       └── ENT-MED-101-004
│       │
│       └── RET/
│           └── categories/
│               └── CAT-RET-201/
│                   ├── entity/
│                   └── types/...
│
└── 📁 non-entity-registry/         ← PERMANENT (After geo assigned)
    └── domains/
        ├── TOU/
        │   └── categories/
        │       └── CAT-TOU-722/
        │           ├── non-entity/             ← Direct branch
        │           │   └── NENT-TOU-722-001
        │           │       ├── non_entity_name: "Festival"
        │           │       ├── stateId: "GEO-TN"
        │           │       ├── districtId: "GEO-TN-MAY"
        │           │       ├── talukId: "GEO-TN-MAY-SIR"
        │           │       └── zone_pk: null (optional)
        │           │
        │           └── types/
        │               └── TYP-TOU-722-03/
        │                   └── non-entity/     ← Type branch
        │                       └── NENT-TOU-722-002
        │
        └── AGR/
            └── categories/...
```

---

## 🔄 Data Flow Diagram

```
┌──────────────┐
│    USER      │
└──────┬───────┘
       │
       │ 1. Navigate to Staging Area
       │
       ↓
┌────────────────────────────┐
│   STAGING AREA PAGE        │
│   - Choose: Entity or      │
│     Non-Entity             │
│   - Fill: Name, Phone,     │
│     Domain, Category       │
│   - NO geo/zone!           │
└──────┬─────────────────────┘
       │
       │ 2. Submit
       │
       ↓
┌────────────────────────────┐
│   FIRESTORE STAGING        │
│   staging-entity/          │
│   OR                       │
│   staging-non-entity/      │
│   Status: "pending"        │
└──────┬─────────────────────┘
       │
       │ 3. Admin reviews
       │
       ↓
┌────────────────────────────┐
│    ADMIN DECISION          │
│    [ Approve | Reject ]    │
└──┬─────────────────────┬───┘
   │                     │
   │ Approve             │ Reject
   ↓                     ↓
┌──────────────────┐  ┌──────────┐
│ Status: "approved"│  │  DELETE  │
└──────┬───────────┘  └──────────┘
       │
       │ 4. Admin clicks "Assign"
       │
       ↓
┌────────────────────────────┐
│  ASSIGNMENT PAGE           │
│  Admin fills:              │
│  - State/District/Taluk    │
│  - City/Area/Street        │
│  - Zone PK                 │
│  - Final Domain/Category   │
│  - Type (optional)         │
└──────┬─────────────────────┘
       │
       │ 5. Submit Assignment
       │
       ↓
┌────────────────────────────┐
│  MOVE TO REGISTRY          │
│                            │
│  FROM:                     │
│  staging-entity/TEMP-001   │
│                            │
│  TO:                       │
│  entity-registry/          │
│    domains/MED/            │
│      categories/CAT-.../   │
│        entity/ENT-001      │
│                            │
│  OR with type:             │
│  entity-registry/          │
│    domains/MED/            │
│      categories/CAT-.../   │
│        types/TYP-.../      │
│          entity/ENT-001    │
└──────┬─────────────────────┘
       │
       │ 6. Admin can modify later
       │
       ↓
┌────────────────────────────┐
│  REGISTRY MANAGEMENT       │
│  - View in tree            │
│  - Modify details          │
│  - Move branch             │
│  - Delete/Recovery         │
└────────────────────────────┘
```

---

## 🌳 Tree Branch Movement Example

```
SCENARIO: Admin realizes entity should be in different branch

STEP 1: Current Location
┌────────────────────────────────────────┐
│ entity-registry/                       │
│   domains/MED/                         │
│     categories/CAT-MED-101/            │
│       entity/                          │
│         └── ENT-MED-101-005 ← HERE NOW │
└────────────────────────────────────────┘

STEP 2: Admin clicks "Modify Branch"
┌────────────────────────────────────────┐
│ Branch Modifier Page                   │
│                                        │
│ Current: MED > CAT-MED-101 > Direct    │
│                                        │
│ Move to:                               │
│ ○ MED > CAT-MED-102 > Direct           │
│ ● MED > CAT-MED-101 > TYP-MED-101-05   │
│ ○ RET > CAT-RET-201 > Direct           │
│                                        │
│ [Cancel] [Move Entity]                 │
└────────────────────────────────────────┘

STEP 3: New Location
┌────────────────────────────────────────┐
│ entity-registry/                       │
│   domains/MED/                         │
│     categories/CAT-MED-101/            │
│       types/TYP-MED-101-05/            │
│         entity/                        │
│           └── ENT-MED-101-005 ← HERE NOW│
└────────────────────────────────────────┘

Same entity, different branch - creates tree flexibility!
```

---

## 📊 Dashboard Tree View

```
┌───────────────────────────────────────────────────────────────────────┐
│                           DASHBOARD                                    │
│                                                                        │
│  ┌─────────────────────────────────┬──────────────────────────────┐  │
│  │      ENTITY TREE               │     NON-ENTITY TREE          │  │
│  │                                 │                               │  │
│  │  📦 MED (Medical)              │  📦 MED (Medical)            │  │
│  │  │                              │  │                            │  │
│  │  ├─ 📂 CAT-MED-101             │  ├─ 📂 CAT-MED-101          │  │
│  │  │  ├─ 📄 Direct (789 entities)│  │  ├─ 📄 Direct (12)        │  │
│  │  │  │    └─ [View] [Manage]    │  │  │    └─ [View]           │  │
│  │  │  │                           │  │  │                        │  │
│  │  │  └─ 📁 Types                │  │  └─ 📁 Types              │  │
│  │  │     ├─ TYP-MED-101-01 (234) │  │     └─ TYP-MED-101-01 (8)│  │
│  │  │     │    └─ [View]           │  │          └─ [View]        │  │
│  │  │     └─ TYP-MED-101-02 (211) │  │                           │  │
│  │  │          └─ [View]           │  ├─ 📂 CAT-MED-102          │  │
│  │  │                              │  │  └─ 📄 Direct (23)        │  │
│  │  └─ 📂 CAT-MED-102             │  │       └─ [View]           │  │
│  │     ├─ 📄 Direct (123)         │  │                            │  │
│  │     └─ 📁 Types                │  📦 TOU (Tourism)            │  │
│  │        └─ TYP-MED-102-01 (322) │  └─ 📂 CAT-TOU-722          │  │
│  │                                 │     ├─ 📄 Direct (67)        │  │
│  │  📦 RET (Retail)               │     └─ 📁 Types              │  │
│  │  └─ 📂 CAT-RET-201             │        └─ TYP-TOU-722-03 (22)│  │
│  │     ├─ 📄 Direct (2,345)       │                               │  │
│  │     └─ 📁 Types                │  📦 AGR (Agriculture)        │  │
│  │        ├─ TYP-RET-201-01 (1.8K)│  └─ 📂 CAT-AGR-501          │  │
│  │        └─ TYP-RET-201-02 (1.4K)│     └─ 📄 Direct (156)       │  │
│  │                                 │                               │  │
│  └─────────────────────────────────┴──────────────────────────────┘  │
│                                                                        │
│  💡 Click any node to navigate to that branch in registry             │
│  💡 Numbers show count of records in each branch                      │
└───────────────────────────────────────────────────────────────────────┘
```

---

## 🎯 Summary Diagram

```
CREATE (Staging)     ASSIGN (Registry)     MANAGE (Registry)
     ↓                     ↓                      ↓

┌─────────┐         ┌──────────┐          ┌──────────┐
│ staging-│ Admin   │ Assignment│ Admin    │ Registry │
│ entity/ │─Approve→│   Page    │─Assigns→ │ domains/ │
│         │         │           │   geo/   │ ...      │
│ Basic   │         │ Admin     │   zone   │ Full     │
│ Data    │         │ Chooses   │          │ Data     │
│ Only    │         │ Branch    │          │ + Geo    │
└─────────┘         └──────────┘          └────┬─────┘
                                                │
                                                │ Admin can
                                                ↓ modify branch
                                          ┌──────────┐
                                          │ Move to  │
                                          │ Different│
                                          │ Branch   │
                                          └──────────┘

COMPLETELY SEPARATE FOR ENTITY AND NON-ENTITY!
```

---

**Status:** ✅ COMPLETE VISUAL ARCHITECTURE
**Scale:** 1M+ records supported
**Separation:** Entity and Non-Entity completely separate
**Flexibility:** Tree/branch structure for organization
