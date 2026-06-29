# Final Architecture - Complete Understanding

## ✅ Core Principles

1. **Staging Area** = CREATE entity or non-entity (basic data, no geo/zone)
2. **Registry** = ASSIGN geo/zone + Manage + Modify branch/tree if needed
3. **Entity and Non-Entity** = COMPLETELY SEPARATE everywhere
4. **Dashboard** = Navigation hub with domain/category/type hierarchy for both

---

## 🎯 Correct Structure

### Firestore Collections

```
collections/

┌─────────────────────────────────────────────────┐
│              STAGING AREA (Flat)                │
│  Purpose: CREATE without geo/zone               │
└─────────────────────────────────────────────────┘

├── staging-entity/                   ← CREATE ENTITY (no geo/zone)
│   └── {temp_id}
│       ├── entity_name
│       ├── phone
│       ├── primary_domain
│       ├── category_pk
│       ├── status: "pending"
│       └── uploadedAt
│
├── staging-non-entity/               ← CREATE NON-ENTITY (no geo/zone)
│   └── {temp_id}
│       ├── non_entity_name
│       ├── primary_domain
│       ├── category_pk
│       ├── status: "pending"
│       └── uploadedAt


┌─────────────────────────────────────────────────┐
│         REGISTRY - ENTITY (Hierarchical)        │
│  Purpose: ASSIGN geo/zone + Manage + Modify tree│
└─────────────────────────────────────────────────┘

└── entity-registry/
    └── domains/{domain_code}/
        └── categories/{category_pk}/
            ├── entity/                     ← Branch without type
            │   └── {entity_pk}
            │       ├── entity_name
            │       ├── phone
            │       ├── zone_pk             ← ADMIN ASSIGNED
            │       ├── stateId             ← ADMIN ASSIGNED
            │       ├── districtId          ← ADMIN ASSIGNED
            │       ├── ... (full geo)
            │       └── assignedAt
            │
            └── types/{type_pk}/
                ├── entity/                 ← Branch with type
                │   └── {entity_pk}
                │
                └── types/{sub_type_pk}/    ← Deeper branch (tree)
                    └── entity/
                        └── {entity_pk}


┌─────────────────────────────────────────────────┐
│      REGISTRY - NON-ENTITY (Hierarchical)       │
│  Purpose: ASSIGN geo + Manage + Modify tree     │
└─────────────────────────────────────────────────┘

└── non-entity-registry/
    └── domains/{domain_code}/
        └── categories/{category_pk}/
            ├── non-entity/                 ← Branch without type
            │   └── {non_entity_pk}
            │       ├── non_entity_name
            │       ├── stateId             ← ADMIN ASSIGNED
            │       ├── districtId          ← ADMIN ASSIGNED
            │       ├── talukId             ← ADMIN ASSIGNED
            │       ├── zone_pk (optional)  ← ADMIN ASSIGNED
            │       └── assignedAt
            │
            └── types/{type_pk}/
                ├── non-entity/             ← Branch with type
                │   └── {non_entity_pk}
                │
                └── types/{sub_type_pk}/    ← Deeper branch (tree)
                    └── non-entity/
                        └── {non_entity_pk}
```

---

## 📊 Dashboard Structure

### Purpose
Central navigation hub showing domain/category/type hierarchy for BOTH entity and non-entity separately

### Dashboard Layout

```
┌────────────────────────────────────────────────────────────────────┐
│                          DASHBOARD                                  │
│                    Registry Overview & Navigation                   │
└────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────┬──────────────────────────────────────┐
│         ENTITIES            │         NON-ENTITIES                 │
│                             │                                      │
│  📦 MED (Medical)           │  📦 MED (Medical)                    │
│    ├─ CAT-MED-101 (1,234)  │    ├─ CAT-MED-101 (45)              │
│    │   ├─ Direct (789)      │    │   ├─ Direct (12)               │
│    │   └─ Types:            │    │   └─ Types:                    │
│    │       ├─ TYP-MED-101-01│    │       ├─ TYP-MED-101-01 (8)   │
│    │       │   (234)         │    │       └─ TYP-MED-101-02 (15)  │
│    │       └─ TYP-MED-101-02│    │                                │
│    │           (211)         │    └─ CAT-MED-102 (23)             │
│    │                         │        └─ Direct (23)               │
│    └─ CAT-MED-102 (445)     │                                      │
│        ├─ Direct (123)       │  📦 RET (Retail)                    │
│        └─ Types:             │    └─ CAT-RET-201 (156)            │
│            └─ TYP-MED-102-01│        ├─ Direct (89)               │
│                (322)         │        └─ Types:                    │
│                              │            └─ TYP-RET-201-01 (67)  │
│  📦 RET (Retail)            │                                      │
│    └─ CAT-RET-201 (5,678)  │  📦 TOU (Tourism)                   │
│        ├─ Direct (2,345)    │    └─ CAT-TOU-722 (89)             │
│        └─ Types:             │        └─ Direct (89)               │
│            ├─ TYP-RET-201-01│                                      │
│            │   (1,890)       │                                      │
│            └─ TYP-RET-201-02│                                      │
│                (1,443)       │                                      │
└─────────────────────────────┴──────────────────────────────────────┘

Click any node → Navigate to that specific branch
```

---

## 🔄 Complete Workflow

### Step 1: CREATE in Staging Area

```
USER ACTION:
1. Navigate to Staging Area
2. Choose: "Create Entity" or "Create Non-Entity"
3. Fill basic form:
   - Name
   - Phone (optional for non-entity)
   - Domain (dropdown)
   - Category (dropdown)
4. Click "Submit"

SYSTEM ACTION:
→ Save to: staging-entity/{temp_id} or staging-non-entity/{temp_id}
→ Status: "pending"
→ NO geo/zone assigned yet

CSV UPLOAD (Alternative):
entity_name,record_type,primary_domain,category_pk,phone
"Hospital Name","entity","MED","CAT-MED-101","1234567890"
"Festival Route","non-entity","TOU","CAT-TOU-722",""
```

### Step 2: APPROVE in Staging Area

```
ADMIN ACTION:
1. Navigate to Staging Area
2. Review pending records
3. Click "Approve" or "Reject"

SYSTEM ACTION:
If APPROVE:
→ Status changes to "approved"
→ Record ready for assignment

If REJECT:
→ Delete from staging
```

### Step 3: ASSIGN in Registry

```
ADMIN ACTION:
1. Navigate to Registry
2. Tab: "Pending Assignment"
3. Click "Assign Geo/Zone" for approved record
4. Assignment form:
   - Select State/District/Taluk/City/Area/Street
   - Select Zone PK (required for entity, optional for non-entity)
   - Choose hierarchy: Domain/Category/Type (or direct under category)
5. Click "Save to Registry"

SYSTEM ACTION:
Move from staging to registry:

For ENTITY:
staging-entity/{temp_id}
→ entity-registry/domains/{domain}/categories/{category}/entity/{pk}
   OR
→ entity-registry/domains/{domain}/categories/{category}/types/{type}/entity/{pk}

For NON-ENTITY:
staging-non-entity/{temp_id}
→ non-entity-registry/domains/{domain}/categories/{category}/non-entity/{pk}
   OR
→ non-entity-registry/domains/{domain}/categories/{category}/types/{type}/non-entity/{pk}

Delete from staging
```

### Step 4: MODIFY Tree/Branch in Registry

```
ADMIN ACTION:
1. Navigate to Dashboard or Registry
2. Find entity/non-entity in current branch
3. Click "Modify Branch"
4. Options:
   a) Move to different category
   b) Move to different type
   c) Add to deeper type (create sub-branch)
   d) Remove from type (move to direct under category)
5. Click "Save Changes"

SYSTEM ACTION:
Move between branches:

Example - Entity:
FROM: entity-registry/domains/MED/categories/CAT-MED-101/entity/{pk}
TO:   entity-registry/domains/MED/categories/CAT-MED-101/types/TYP-MED-101-05/entity/{pk}

Example - Non-Entity:
FROM: non-entity-registry/domains/TOU/categories/CAT-TOU-722/non-entity/{pk}
TO:   non-entity-registry/domains/TOU/categories/CAT-TOU-722/types/TYP-TOU-722-03/non-entity/{pk}

This creates tree/branch flexibility
```

---

## 🗂️ Page Structure

### 1. Dashboard Page (NEW)

**Path:** `/dashboard`

**Purpose:** Central navigation with domain/category/type tree view

**Features:**
- Split view: Entities (left) | Non-Entities (right)
- Expandable tree for each domain
- Click any node → Navigate to that branch
- Show counts for each branch
- Visual tree structure

**Components:**
```tsx
<Dashboard>
  <div className="grid grid-cols-2 gap-6">
    <EntityTree
      domains={domains}
      onNodeClick={(path) => navigate(`/entity-registry?path=${path}`)}
    />
    <NonEntityTree
      domains={domains}
      onNodeClick={(path) => navigate(`/non-entity-registry?path=${path}`)}
    />
  </div>
</Dashboard>
```

---

### 2. Staging Area Page (MODIFIED)

**Path:** `/staging`

**Purpose:** CREATE entity or non-entity (no geo/zone)

**Features:**
- Tab 1: "Create Entity" (manual form)
- Tab 2: "Create Non-Entity" (manual form)
- Tab 3: "Upload CSV" (both entity and non-entity)
- Tab 4: "Pending Review" (admin approval)
- Tab 5: "Approved (Awaiting Assignment)" (ready for registry)

**Components:**
```tsx
<StagingArea>
  <Tabs>
    <Tab name="Create Entity">
      <CreateEntityForm onSubmit={saveToStagingEntity} />
    </Tab>
    <Tab name="Create Non-Entity">
      <CreateNonEntityForm onSubmit={saveToStagingNonEntity} />
    </Tab>
    <Tab name="Upload CSV">
      <CSVUploader />
    </Tab>
    <Tab name="Pending Review">
      <PendingReviewTable onApprove={approveRecord} onReject={rejectRecord} />
    </Tab>
    <Tab name="Approved">
      <ApprovedTable onAssign={(id) => navigate(`/registry/assign/${id}`)} />
    </Tab>
  </Tabs>
</StagingArea>
```

---

### 3. Entity Registry Page (NEW - SEPARATE)

**Path:** `/entity-registry`

**Purpose:** Manage ENTITIES ONLY with geo/zone assignment and branch modification

**Features:**
- Tab 1: "Pending Assignment" (approved from staging)
- Tab 2: "Active Entities" (by domain/category/type)
- Tab 3: "Modify Branch" (move between branches)
- Tab 4: "Stopped/Deleted"

**Components:**
```tsx
<EntityRegistry>
  <Tabs>
    <Tab name="Pending Assignment">
      <PendingAssignmentTable 
        records={approvedStagingEntities}
        onAssign={(id) => navigate(`/entity-registry/assign/${id}`)}
      />
    </Tab>
    <Tab name="Active Entities">
      <EntityTreeView 
        onModifyBranch={(pk) => navigate(`/entity-registry/modify/${pk}`)}
      />
    </Tab>
    <Tab name="Modify Branch">
      <BranchModifier onMove={moveEntityBranch} />
    </Tab>
    <Tab name="Stopped">
      <StoppedEntitiesTable onRecover={recoverEntity} />
    </Tab>
  </Tabs>
</EntityRegistry>
```

---

### 4. Non-Entity Registry Page (NEW - SEPARATE)

**Path:** `/non-entity-registry`

**Purpose:** Manage NON-ENTITIES ONLY with geo assignment and branch modification

**Features:**
- Tab 1: "Pending Assignment"
- Tab 2: "Active Non-Entities"
- Tab 3: "Modify Branch"
- Tab 4: "Stopped/Deleted"

**Components:**
```tsx
<NonEntityRegistry>
  <Tabs>
    <Tab name="Pending Assignment">
      <PendingAssignmentTable 
        records={approvedStagingNonEntities}
        onAssign={(id) => navigate(`/non-entity-registry/assign/${id}`)}
      />
    </Tab>
    <Tab name="Active Non-Entities">
      <NonEntityTreeView 
        onModifyBranch={(pk) => navigate(`/non-entity-registry/modify/${pk}`)}
      />
    </Tab>
    <Tab name="Modify Branch">
      <BranchModifier onMove={moveNonEntityBranch} />
    </Tab>
    <Tab name="Stopped">
      <StoppedNonEntitiesTable onRecover={recoverNonEntity} />
    </Tab>
  </Tabs>
</NonEntityRegistry>
```

---

### 5. Assignment Pages (NEW)

#### Entity Assignment
**Path:** `/entity-registry/assign/:stagingId`

**Form:**
- Entity Name (from staging)
- Phone (from staging)
- **Geographic Assignment:**
  - State (dropdown)
  - District (dropdown)
  - Taluk (dropdown)
  - City/Village (dropdown)
  - Area (dropdown)
  - Street (dropdown)
  - Zone PK (dropdown) ← REQUIRED for entity
- **Hierarchy Assignment:**
  - Domain (dropdown)
  - Category (dropdown)
  - Type (dropdown) ← Optional (creates branch)
- Submit → Save to entity-registry hierarchy

#### Non-Entity Assignment
**Path:** `/non-entity-registry/assign/:stagingId`

**Form:**
- Non-Entity Name (from staging)
- **Geographic Assignment:**
  - State (dropdown)
  - District (dropdown)
  - Taluk (dropdown)
  - City/Village (optional)
  - Area (optional)
  - Street (optional)
  - Zone PK (optional) ← OPTIONAL for non-entity
- **Hierarchy Assignment:**
  - Domain (dropdown)
  - Category (dropdown)
  - Type (dropdown) ← Optional
- Submit → Save to non-entity-registry hierarchy

---

### 6. Branch Modifier Pages (NEW)

#### Entity Branch Modifier
**Path:** `/entity-registry/modify/:entityPk`

**Features:**
- Show current branch location
- Tree view of available branches
- Select new branch
- Confirm move

#### Non-Entity Branch Modifier
**Path:** `/non-entity-registry/modify/:nonEntityPk`

**Features:**
- Show current branch location
- Tree view of available branches
- Select new branch
- Confirm move

---

## 🗺️ Navigation Structure

```
MainLayout
├── Dashboard                 ← NEW: Split tree view (entity | non-entity)
├── Staging Area              ← MODIFIED: Create both, no geo/zone
│   ├── Create Entity
│   ├── Create Non-Entity
│   ├── Upload CSV
│   ├── Pending Review
│   └── Approved
├── Entity Registry           ← NEW: Separate page for entities
│   ├── Pending Assignment
│   ├── Active Entities
│   ├── Modify Branch
│   └── Stopped
├── Non-Entity Registry       ← NEW: Separate page for non-entities
│   ├── Pending Assignment
│   ├── Active Non-Entities
│   ├── Modify Branch
│   └── Stopped
├── Geography                 ← KEEP: Manage geo hierarchy
├── Sites                     ← KEEP: Manage sites
└── Settings                  ← KEEP: Domains/Categories/Types

REMOVED:
- /registry (merged into entity-registry and non-entity-registry)
- /registry/create (moved to staging)
- /non-entities (became non-entity-registry)
```

---

## 📋 Summary

### Key Points

1. **Staging Area** = CREATE (no geo/zone)
   - Separate creation for entity and non-entity
   - Admin approves/rejects
   - Simple CSV upload

2. **Registry** = ASSIGN + MANAGE + MODIFY TREE
   - **COMPLETELY SEPARATE** pages for entity and non-entity
   - Admin assigns geo/zone AFTER approval
   - Can modify branch/tree structure
   - Hierarchical storage for scale

3. **Dashboard** = Navigation Hub
   - Split view: Entity tree | Non-Entity tree
   - Shows domain/category/type hierarchy
   - Click to navigate to specific branch

4. **Tree/Branch Structure**
   - Entity can be: `category/entity/` OR `category/types/{type}/entity/`
   - Non-Entity can be: `category/non-entity/` OR `category/types/{type}/non-entity/`
   - Admin can move between branches
   - Scales to 1M+ records

### File Structure

```
src/
├── pages/
│   ├── Dashboard.tsx                    ← NEW
│   ├── StagingArea.tsx                  ← MODIFIED
│   ├── EntityRegistry.tsx               ← NEW
│   ├── NonEntityRegistry.tsx            ← NEW
│   ├── EntityAssignment.tsx             ← NEW
│   ├── NonEntityAssignment.tsx          ← NEW
│   ├── EntityBranchModifier.tsx         ← NEW
│   └── NonEntityBranchModifier.tsx      ← NEW
```

---

**Status:** ✅ FINAL ARCHITECTURE
**Priority:** 🔴 CRITICAL
**Estimated Effort:** 4-5 days
**Impact:** Scalable to 1M+, separate entity/non-entity, flexible tree structure
