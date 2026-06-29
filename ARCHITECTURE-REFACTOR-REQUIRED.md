# Architecture Refactor Required for 1M+ Scale

## Current Problem

The current structure is **NOT suitable** for managing 1,000,000+ entities and non-entities because:

### ❌ Wrong Separation
- **Staging Area** is only for entities
- **Registry** and **Non-Entity Registry** are separate pages
- Creation happens in Registry (wrong place)
- Geo/Zone assignment mixed with creation

---

## ✅ Correct Architecture

### Visual Workflow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                      USER UPLOADS                            │
│  (CSV with name, phone, domain, category - NO geo/zone)    │
└──────────────────────┬──────────────────────────────────────┘
                       ↓
┌─────────────────────────────────────────────────────────────┐
│                  STAGING AREA                                │
│  ┌───────────────────┐     ┌────────────────────┐          │
│  │ staging-entity/   │     │ staging-non-entity/│          │
│  │   - Basic data    │     │   - Basic data     │          │
│  │   - NO geo/zone   │     │   - NO geo/zone    │          │
│  │   - Status: pending│    │   - Status: pending│          │
│  └───────────────────┘     └────────────────────┘          │
└──────────────────────┬──────────────────────────────────────┘
                       ↓
                 ADMIN REVIEWS
                       ↓
              ┌────────┴────────┐
              ↓                 ↓
         APPROVE            REJECT
              ↓                 ↓
              ↓            (Delete)
              ↓
┌─────────────────────────────────────────────────────────────┐
│               ADMIN ASSIGNMENT PAGE                          │
│  Admin assigns:                                              │
│  ✓ Geographic hierarchy (state/district/taluk/city/area/st) │
│  ✓ Zone PK (required for entity, optional for non-entity)   │
│  ✓ Final domain/category/type (choose branch)               │
└──────────────────────┬──────────────────────────────────────┘
                       ↓
┌─────────────────────────────────────────────────────────────┐
│                    REGISTRY (TREE BRANCHES)                  │
│                                                              │
│  domains/{domain}/categories/{category}/                    │
│    ├── entity/           ← Branch without type              │
│    │   └── {pk}                                             │
│    ├── non-entity/       ← Branch without type              │
│    │   └── {pk}                                             │
│    └── types/{type}/                                        │
│        ├── entity/       ← Branch with type                 │
│        │   └── {pk}                                         │
│        └── non-entity/   ← Branch with type                 │
│            └── {pk}                                         │
│                                                              │
│  Admin can:                                                  │
│  ✓ Modify records                                           │
│  ✓ Reassign geo/zone                                        │
│  ✓ Move between branches (re-categorize)                    │
│  ✓ Delete/Recovery                                          │
└─────────────────────────────────────────────────────────────┘
```

### Path Structure in Firestore

```
collections/
├── staging-entity/                    ← UPLOAD WITHOUT geo/zone
│   └── {temp_id}                      ← Basic data only (name, phone, domain, category)
│       ├── entity_name: string
│       ├── phone: string
│       ├── primary_domain: string     ← User provides, but admin may reassign
│       ├── category_pk: string        ← User provides, but admin may reassign
│       ├── record_type: "entity"
│       ├── status: "pending"
│       └── uploadedAt: timestamp
│
├── staging-non-entity/                ← UPLOAD WITHOUT geo/zone
│   └── {temp_id}                      ← Basic data only
│       ├── entity_name: string
│       ├── primary_domain: string
│       ├── category_pk: string
│       ├── record_type: "non-entity"
│       ├── status: "pending"
│       └── uploadedAt: timestamp
│
└── domains/{domain_code}/             ← ADMIN ASSIGNS hierarchy + geo/zone
    ├── categories/{category_pk}/
    │   ├── types/{type_pk}/           ← Can be empty if no type
    │   │   ├── entity/                ← Admin moved here after assigning geo/zone
    │   │   │   └── {entity_pk}
    │   │   │       ├── entity_name: string
    │   │   │       ├── phone: string
    │   │   │       ├── zone_pk: string          ← ADMIN ASSIGNED
    │   │   │       ├── stateId: string          ← ADMIN ASSIGNED
    │   │   │       ├── districtId: string       ← ADMIN ASSIGNED
    │   │   │       ├── talukId: string          ← ADMIN ASSIGNED
    │   │   │       ├── cityVillageId: string    ← ADMIN ASSIGNED
    │   │   │       ├── areaId: string           ← ADMIN ASSIGNED
    │   │   │       ├── streetId: string         ← ADMIN ASSIGNED (for entity)
    │   │   │       ├── approvedAt: timestamp
    │   │   │       └── assignedBy: admin_id
    │   │   │
    │   │   └── non-entity/            ← Admin moved here after assigning geo (zone optional)
    │   │       └── {non_entity_pk}
    │   │           ├── non_entity_name: string
    │   │           ├── stateId: string          ← ADMIN ASSIGNED
    │   │           ├── districtId: string       ← ADMIN ASSIGNED
    │   │           ├── talukId: string          ← ADMIN ASSIGNED
    │   │           ├── zone_pk: string?         ← ADMIN ASSIGNED (optional for non-entity)
    │   │           ├── approvedAt: timestamp
    │   │           └── assignedBy: admin_id
    │   │
    │   └── entity/                    ← Direct under category (no type)
    │       └── {entity_pk}
    │
    └── non-entity/                    ← Direct under category (no type)
        └── {non_entity_pk}

IMPORTANT: Entity can be at multiple levels:
- domains/{domain}/categories/{category}/entity/{pk}           ← No type
- domains/{domain}/categories/{category}/types/{type}/entity/{pk}  ← With type
This creates a TREE BRANCH structure for flexible organization
```

---

## Functional Separation

### 1. Staging Area (Both Entity & Non-Entity)

**Purpose:** Upload → Validate → Approve/Reject (WITHOUT geo/zone assignment)

**Operations:**
- ✅ Create new records manually (name, phone, domain, category only)
- ✅ Upload CSV (both entity and non-entity) WITHOUT zone/geo
- ✅ Validate basic data (name, domain, category)
- ✅ Review and approve (move to Registry)
- ✅ Reject bad data
- ✅ Edit basic fields before approval
- ❌ **CANNOT** assign geo or zone (admin does this in Registry)

**CSV Format (Staging):**
```csv
entity_name,record_type,primary_domain,category_pk,phone,visibility_type
"Hospital Name","entity","MED","CAT-MED-101","1234567890","Public"
"Festival Route","non-entity","TOU","CAT-TOU-722","","Public"
```
Note: NO geo/zone fields required in staging!

**Path Query:**
```typescript
// Get staging records (no domain/category hierarchy yet - assigned by admin)
const stagingEntityPath = `staging-entity/{temp_id}`;
const stagingNonEntityPath = `staging-non-entity/{temp_id}`;
```

---

### 2. Registry (Entity Registry + Non-Entity Registry Combined)

**Purpose:** Admin assigns geo/zone, then manages approved records

**Operations:**
- ✅ **ASSIGN** geographic location (state/district/taluk) - Admin task
- ✅ **ASSIGN** zone (city/area/street) - Admin task
- ✅ **ASSIGN** domain/category/type hierarchy - Admin task
- ✅ Modify existing records
- ✅ Delete (soft delete)
- ✅ Recovery (restore deleted)
- ✅ Move records between hierarchy (re-categorize)
- ❌ **CANNOT** create new records (must come from Staging)

**Note:** Admin assigns geo/zone AFTER approval, which determines the final path

**Path Query:**
```typescript
// Get registry records
const entityPath = `domains/${domain}/categories/${category}/types/${type}/entity`;
const nonEntityPath = `domains/${domain}/categories/${category}/types/${type}/non-entity`;
```

---

## Required Changes

### 1. Remove EntityCreate Page

**Current:** `/registry/create` allows direct creation
**Required:** Remove this page entirely

**Reason:** Creation must happen in Staging Area only

---

### 2. Refactor Staging Area

**Current Issues:**
- Only handles entity records
- Requires geo/zone in upload
- Validation is entity-centric

**Required Changes:**
```typescript
// Add record type toggle
const [recordType, setRecordType] = useState<'entity' | 'non-entity'>('entity');

// CSV WITHOUT geo/zone
interface StagingRecord {
  id: string;
  entity_name: string;
  record_type: 'entity' | 'non-entity';
  primary_domain: string;
  category_pk: string;
  phone?: string;
  visibility_type: 'Public' | 'Private/Home';
  status: 'pending' | 'approved' | 'rejected';
  uploadedAt: string;
  // NO geo/zone fields here!
}

// Minimal validation (no geo/zone checks)
if (!record.entity_name.trim()) {
  errors.push("Name is required");
}
if (!record.primary_domain) {
  errors.push("Domain is required");
}
if (!record.category_pk) {
  errors.push("Category is required");
}

// Store in flat staging collection
const stagingPath = recordType === 'entity' 
  ? `staging-entity/${tempId}`
  : `staging-non-entity/${tempId}`;
```

**Admin Approval Flow:**
```typescript
// When admin clicks "Approve" in Staging
const handleApprove = (stagingRecord: StagingRecord) => {
  // Move to registry with assignment screen
  navigate(`/registry/assign/${stagingRecord.id}`);
};

// New page: /registry/assign/:stagingId
// Admin assigns:
// - Geo hierarchy
// - Zone PK
// - Final domain/category/type path
// Then record moves to: domains/{domain}/categories/{category}/[types/{type}/]entity/
```

---

### 3. Add Assignment Page (New)

**Path:** `/registry/assign/:stagingId`

**Purpose:** Admin assigns geo/zone to approved staging records

```typescript
interface AssignmentForm {
  // From staging record
  entity_name: string;
  phone?: string;
  record_type: 'entity' | 'non-entity';
  
  // Admin assigns these
  primary_domain: string;        // Can override from staging
  category_pk: string;           // Can override from staging
  type_pk?: string;              // Optional type for tree branch
  
  // Geographic assignment (admin selects)
  stateId: string;
  districtId: string;
  talukId: string;
  cityVillageId?: string;
  areaId?: string;
  streetId?: string;             // Required for entity, optional for non-entity
  zone_pk?: string;              // Required for entity, optional for non-entity
  
  // System fields
  approvedAt: string;
  assignedBy: string;
}

// After assignment, move to hierarchical path
const finalPath = type_pk
  ? `domains/${domain}/categories/${category}/types/${type_pk}/${recordType}/${pk}`
  : `domains/${domain}/categories/${category}/${recordType}/${pk}`;
```

---

### 3. Merge Registry Views

**Current:** Separate `RegistryViewer` and `NonEntityRegistry`
**Required:** Single unified Registry page with tabs

```typescript
// Registry shows only records that have been assigned geo/zone
<Tabs>
  <Tab label="Pending Assignment" count={approvedButNotAssignedCount}>
    {/* Records approved in staging, waiting for admin assignment */}
    <PendingAssignmentTable 
      onAssign={(record) => navigate(`/registry/assign/${record.id}`)}
    />
  </Tab>
  
  <Tab label="Active Entities" count={entityCount}>
    {/* Query all entity branches */}
    <EntityRegistryTable 
      entities={queryAllEntityBranches()}
      onModify={updateEntity}
      onReassign={(entity) => navigate(`/registry/reassign/${entity.pk}`)}
    />
  </Tab>
  
  <Tab label="Active Non-Entities" count={nonEntityCount}>
    <NonEntityRegistryTable 
      nonEntities={queryAllNonEntityBranches()}
      onModify={updateNonEntity}
    />
  </Tab>
  
  <Tab label="Stopped/Deleted" count={stoppedCount}>
    <StoppedRecordsTable 
      onRecover={recoverEntity}
    />
  </Tab>
</Tabs>

// Query function for tree branches
function queryAllEntityBranches() {
  const queries = [];
  
  // Query each domain/category combination
  for (const domain of domains) {
    for (const category of categories.filter(c => c.domainCode === domain.code)) {
      // Direct under category (no type)
      queries.push(
        query(collection(db, `domains/${domain.code}/categories/${category.pk}/entity`))
      );
      
      // Under types (with type)
      for (const type of types.filter(t => t.categoryPk === category.pk)) {
        queries.push(
          query(collection(db, `domains/${domain.code}/categories/${category.pk}/types/${type.pk}/entity`))
        );
      }
    }
  }
  
  return Promise.all(queries.map(q => getDocs(q)));
}
```

---

### 4. Update Firestore Rules

```javascript
service cloud.firestore {
  match /databases/{database}/documents {
    
    // STAGING AREA - Temporary uploads without geo/zone
    match /staging-entity/{tempId} {
      // Anyone can upload, but needs auth
      allow create: if request.auth != null;
      
      // Only read/update own records or admin
      allow read, update: if request.auth != null;
      
      // Only admin can delete (approve/reject workflow)
      allow delete: if request.auth.token.admin == true;
    }
    
    match /staging-non-entity/{tempId} {
      allow create: if request.auth != null;
      allow read, update: if request.auth != null;
      allow delete: if request.auth.token.admin == true;
    }
    
    // REGISTRY - Approved records with assigned geo/zone
    // Entities can be at category level or type level (tree branch)
    
    // Category-level entities (no type)
    match /domains/{domain}/categories/{category}/entity/{entityPk} {
      allow read: if request.auth != null;
      
      // Only admin can write (requires geo/zone assignment)
      allow write: if request.auth.token.admin == true &&
                      request.resource.data.zone_pk != null &&
                      request.resource.data.stateId != null &&
                      request.resource.data.approvedAt != null;
    }
    
    // Type-level entities (with type)
    match /domains/{domain}/categories/{category}/types/{type}/entity/{entityPk} {
      allow read: if request.auth != null;
      allow write: if request.auth.token.admin == true &&
                      request.resource.data.zone_pk != null &&
                      request.resource.data.stateId != null &&
                      request.resource.data.approvedAt != null;
    }
    
    // Category-level non-entities
    match /domains/{domain}/categories/{category}/non-entity/{nonEntityPk} {
      allow read: if request.auth != null;
      
      // Non-entities only require geo (state/district/taluk), zone optional
      allow write: if request.auth.token.admin == true &&
                      request.resource.data.stateId != null &&
                      request.resource.data.districtId != null &&
                      request.resource.data.talukId != null &&
                      request.resource.data.approvedAt != null;
    }
    
    // Type-level non-entities
    match /domains/{domain}/categories/{category}/types/{type}/non-entity/{nonEntityPk} {
      allow read: if request.auth != null;
      allow write: if request.auth.token.admin == true &&
                      request.resource.data.stateId != null &&
                      request.resource.data.districtId != null &&
                      request.resource.data.talukId != null &&
                      request.resource.data.approvedAt != null;
    }
  }
}
```

---

## Data Flow

### ✅ Correct Flow

```
STEP 1: USER UPLOAD (Staging Area)
   ↓
   CSV Upload: name, phone, domain, category (NO geo/zone)
   ↓
   Records stored in: staging-entity/ or staging-non-entity/
   ↓
   Status: "pending"

STEP 2: ADMIN REVIEW (Staging Area)
   ↓
   Admin reviews data quality
   ↓
   Admin APPROVES or REJECTS
   ↓
   If APPROVED → Move to Step 3
   If REJECTED → Delete from staging

STEP 3: ADMIN ASSIGNMENT (Registry)
   ↓
   Admin opens approved record in Registry
   ↓
   Admin ASSIGNS:
   - Geographic hierarchy (state/district/taluk/city/area/street)
   - Zone PK (for entities, optional for non-entities)
   - Final domain/category/type hierarchy
   ↓
   Record MOVES to: domains/{domain}/categories/{category}/[types/{type}/]entity/
   ↓
   Status: "active"

STEP 4: ONGOING MANAGEMENT (Registry)
   ↓
   Admin can:
   - Modify details
   - Reassign geo/zone
   - Move between categories (tree branch flexibility)
   - Delete (soft delete)
   - Recovery (restore)
```

### 🌳 Tree Branch Structure

**Single Entity Example:**
```
domains/MED/categories/CAT-MED-101/entity/ENT-001
└── No type, directly under category
```

**Multiple Branch Entity Example:**
```
domains/MED/categories/CAT-MED-101/types/TYP-MED-101-01/entity/ENT-002
└── With type, creates deeper branch
```

**Admin can move entities between branches as needed:**
```
Move: domains/MED/categories/CAT-MED-101/entity/ENT-001
  →   domains/MED/categories/CAT-MED-102/types/TYP-MED-102-05/entity/ENT-001
```

### ❌ Wrong Flow (Current)

```
1. CREATE directly in Registry  ← WRONG
2. Upload CSV only for entities  ← WRONG
3. Non-entities in separate page ← WRONG
```

---

## File Changes Required

### Files to Modify

1. **`src/components/StagingArea.tsx`**
   - Remove geo/zone assignment logic
   - Simplify CSV template (no geo/zone fields)
   - Update validation (only name, domain, category)
   - Change "Promote" to "Approve" (sends to assignment page)
   - Store in flat `staging-entity/` or `staging-non-entity/` collections

2. **`src/components/RegistryViewer.tsx`**
   - Add "Pending Assignment" tab (approved but not assigned)
   - Query hierarchical paths (tree branches)
   - Show both category-level and type-level entities
   - Add "Reassign" button for moving between branches
   - Merge with NonEntityRegistry functionality

3. **`src/components/NonEntityRegistry.tsx`**
   - ❌ DELETE this file
   - Merge functionality into RegistryViewer tabs

4. **`src/pages/entities/EntityCreate.tsx`**
   - ❌ DELETE this file
   - Remove route from router
   - Creation only happens in Staging

5. **`src/pages/entities/EntityAssign.tsx`** (NEW FILE)
   - Create assignment page for admin
   - Form to assign geo/zone to approved staging records
   - Choose domain/category/type branch
   - Move from staging to registry after assignment

6. **`src/pages/entities/EntityReassign.tsx`** (NEW FILE)
   - Page to reassign geo/zone for existing entities
   - Move between branches (re-categorize)

7. **`src/routes/index.tsx`**
   - Remove `/registry/create` route
   - Add `/registry/assign/:stagingId` route
   - Add `/registry/reassign/:entityPk` route
   - Keep `/staging` and `/registry`

8. **`src/contexts/DataContext.tsx`**
   - Update to query flat staging collections
   - Add methods for hierarchical registry queries
   - Add approval workflow (staging → assignment → registry)
   - Add branch movement methods

9. **`src/utils/csvParser.ts`**
   - Simplify template (remove geo/zone fields)
   - Update parser to not expect geo/zone
   - Update validation logic

10. **`firestore.rules`**
    - Update to new path structure
    - Add staging area rules (flat collections)
    - Add registry rules (hierarchical with branches)
    - Add admin-only write rules for assignment

---

## Query Patterns for Scale

### For 1M+ Records - Use Hierarchical Queries with Tree Branches

```typescript
// ✅ Efficient: Query specific domain/category/type branch
const queryEntityBranch = async (domain: string, category: string, type?: string) => {
  const path = type
    ? `domains/${domain}/categories/${category}/types/${type}/entity`
    : `domains/${domain}/categories/${category}/entity`;
    
  const entityQuery = query(
    collection(db, path),
    where('zone_pk', '==', selectedZone),
    limit(50)
  );
  
  return getDocs(entityQuery);
};

// ✅ Query across multiple branches (pagination)
const queryAllEntitiesInCategory = async (domain: string, category: string) => {
  // Get direct entities (no type)
  const directEntities = await getDocs(
    query(collection(db, `domains/${domain}/categories/${category}/entity`), limit(50))
  );
  
  // Get all types in this category
  const types = await getDocs(
    collection(db, `domains/${domain}/categories/${category}/types`)
  );
  
  // Get entities from each type branch
  const typeEntities = await Promise.all(
    types.docs.map(typeDoc =>
      getDocs(
        query(
          collection(db, `domains/${domain}/categories/${category}/types/${typeDoc.id}/entity`),
          limit(50)
        )
      )
    )
  );
  
  return [directEntities, ...typeEntities];
};

// ✅ Staging queries (flat structure)
const queryStagingEntities = async (status?: 'pending' | 'approved') => {
  const stagingQuery = status
    ? query(
        collection(db, 'staging-entity'),
        where('status', '==', status),
        orderBy('uploadedAt', 'desc'),
        limit(100)
      )
    : query(
        collection(db, 'staging-entity'),
        orderBy('uploadedAt', 'desc'),
        limit(100)
      );
  
  return getDocs(stagingQuery);
};

// ❌ Inefficient: Query all entities across all branches
const badQuery = query(
  collectionGroup(db, 'entity'), // Don't do this for 1M+ records!
  where('primary_domain', '==', 'MED')
);
```

### Benefits of Tree Branch Structure

1. **Scalability:** Each branch is isolated (< 10K records per branch)
2. **Performance:** Query only relevant branches
3. **Organization:** Flexible hierarchy (with or without type)
4. **Maintenance:** Easy to reorganize (move between branches)
5. **Admin Control:** Can move entities between branches as categorization improves

### Example: Moving Between Branches

```typescript
// Admin realizes entity should be in different category/type
const moveEntityBranch = async (
  entityPk: string,
  from: { domain: string; category: string; type?: string },
  to: { domain: string; category: string; type?: string }
) => {
  // Get entity data
  const fromPath = from.type
    ? `domains/${from.domain}/categories/${from.category}/types/${from.type}/entity/${entityPk}`
    : `domains/${from.domain}/categories/${from.category}/entity/${entityPk}`;
  
  const entityDoc = await getDoc(doc(db, fromPath));
  const entityData = entityDoc.data();
  
  // Create in new location
  const toPath = to.type
    ? `domains/${to.domain}/categories/${to.category}/types/${to.type}/entity/${entityPk}`
    : `domains/${to.domain}/categories/${to.category}/entity/${entityPk}`;
  
  await setDoc(doc(db, toPath), {
    ...entityData,
    primary_domain: to.domain,
    category_pk: to.category,
    type_pk: to.type || null,
    movedAt: new Date().toISOString(),
    movedFrom: fromPath
  });
  
  // Delete from old location
  await deleteDoc(doc(db, fromPath));
};
```

---

## Migration Plan

### Phase 1: Update Structure
1. Create new Firestore paths
2. Migrate existing data
3. Update security rules

### Phase 2: Update Components
1. Refactor StagingArea
2. Merge Registry views
3. Remove creation pages

### Phase 3: Update Routing
1. Remove `/registry/create`
2. Keep `/staging` and `/registry`
3. Update navigation

### Phase 4: Testing
1. Test staging workflow
2. Test approval workflow
3. Test registry operations

---

## Summary

**The Key Change:** Staging is for UPLOAD (no geo/zone), Registry is for ASSIGNMENT + MANAGEMENT

| Feature | Staging Area | Registry |
|---------|--------------|----------|
| Upload CSV | ✅ Yes (no geo/zone) | ❌ No |
| Create Manually | ✅ Yes (basic data) | ❌ No |
| Validate | ✅ Yes (name, domain, category) | ❌ No |
| Approve/Reject | ✅ Yes (admin) | ❌ No |
| Assign Geo/Zone | ❌ No | ✅ Yes (admin) |
| Assign Hierarchy | ❌ No | ✅ Yes (admin chooses branch) |
| Modify | ❌ No | ✅ Yes |
| Delete | ❌ No | ✅ Yes |
| Recovery | ❌ No | ✅ Yes |
| Move Between Branches | ❌ No | ✅ Yes (re-categorize) |
| Entity | ✅ Yes | ✅ Yes |
| Non-Entity | ✅ Yes | ✅ Yes |

### Tree Branch Flexibility

**Entity can exist at multiple levels:**
- `domains/{domain}/categories/{category}/entity/{pk}` ← No type
- `domains/{domain}/categories/{category}/types/{type}/entity/{pk}` ← With type

**Admin decides branch during assignment:**
1. User uploads: "Hospital Name" (staging-entity)
2. Admin approves: Moves to registry
3. Admin assigns geo/zone + chooses branch:
   - Option A: Put in `MED/CAT-MED-101/entity/` (no type)
   - Option B: Put in `MED/CAT-MED-101/types/TYP-MED-101-05/entity/` (with type)
4. Later, admin can MOVE between branches if needed

### CSV Upload Format (Staging Only)

```csv
entity_name,record_type,primary_domain,category_pk,phone,visibility_type
"Hospital Name","entity","MED","CAT-MED-101","1234567890","Public"
"Festival Route","non-entity","TOU","CAT-TOU-722","","Public"
```

**Note:** NO geo/zone fields! Admin assigns after approval.

---

**Status:** ⚠️ CRITICAL REFACTOR REQUIRED
**Priority:** 🔴 HIGH
**Estimated Effort:** 3-4 days
**Impact:** Enables 1M+ scale, proper separation of concerns
