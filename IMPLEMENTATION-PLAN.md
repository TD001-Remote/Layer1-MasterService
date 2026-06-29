# Implementation Plan - Step by Step

## 📋 Complete Refactoring Checklist

### Phase 1: Create New Components (Days 1-2)

#### 1.1 Dashboard Page (NEW)
**File:** `src/pages/Dashboard.tsx`

**Features:**
- Split layout: Entity tree (left) | Non-Entity tree (right)
- Expandable domain/category/type tree
- Show counts for each branch
- Click to navigate to specific branch

**Components to create:**
```typescript
- Dashboard.tsx
- components/EntityTreeView.tsx
- components/NonEntityTreeView.tsx
- components/TreeNode.tsx (reusable)
```

---

#### 1.2 Refactor Staging Area (MODIFY)
**File:** `src/components/StagingArea.tsx`

**Changes:**
- Remove ALL geo/zone fields
- Simplify to: name, phone, domain, category only
- Add tabs: Create Entity | Create Non-Entity | Upload CSV | Review | Approved
- Update CSV parser to remove geo/zone
- Change "Promote" to "Approve"

**Files to modify:**
```typescript
- src/components/StagingArea.tsx
- src/utils/csvParser.ts (remove geo/zone fields)
```

---

#### 1.3 Entity Registry Page (NEW - SEPARATE)
**File:** `src/pages/EntityRegistry.tsx`

**Features:**
- Tab 1: Pending Assignment (from staging)
- Tab 2: Active Entities (tree view)
- Tab 3: Modify Branch
- Tab 4: Stopped/Deleted

**Components to create:**
```typescript
- pages/EntityRegistry.tsx
- components/entity/EntityPendingAssignment.tsx
- components/entity/EntityTreeView.tsx
- components/entity/EntityBranchModifier.tsx
- components/entity/EntityStoppedList.tsx
```

---

#### 1.4 Non-Entity Registry Page (NEW - SEPARATE)
**File:** `src/pages/NonEntityRegistry.tsx`

**Features:**
- Tab 1: Pending Assignment
- Tab 2: Active Non-Entities (tree view)
- Tab 3: Modify Branch
- Tab 4: Stopped/Deleted

**Components to create:**
```typescript
- pages/NonEntityRegistry.tsx
- components/non-entity/NonEntityPendingAssignment.tsx
- components/non-entity/NonEntityTreeView.tsx
- components/non-entity/NonEntityBranchModifier.tsx
- components/non-entity/NonEntityStoppedList.tsx
```

---

#### 1.5 Assignment Pages (NEW)
**Files:** 
- `src/pages/EntityAssignment.tsx`
- `src/pages/NonEntityAssignment.tsx`

**Features:**
- Form to assign geo/zone to approved staging records
- Choose domain/category/type (branch selection)
- Move from staging to registry

**Components to create:**
```typescript
- pages/EntityAssignment.tsx
- pages/NonEntityAssignment.tsx
- components/GeoZoneAssignmentForm.tsx (reusable)
- components/BranchSelector.tsx (reusable)
```

---

### Phase 2: Update Context and Services (Day 2-3)

#### 2.1 Update DataContext
**File:** `src/contexts/DataContext.tsx`

**Changes:**
```typescript
// Add staging queries (flat collections)
const [stagingEntities, setStagingEntities] = useState<StagingEntity[]>([]);
const [stagingNonEntities, setStagingNonEntities] = useState<StagingNonEntity[]>([]);

// Add registry queries (hierarchical)
const queryEntityRegistry = (domain: string, category: string, type?: string) => {
  const path = type
    ? `entity-registry/domains/${domain}/categories/${category}/types/${type}/entity`
    : `entity-registry/domains/${domain}/categories/${category}/entity`;
  return query(collection(db, path));
};

// Add approval workflow
const approveStagingEntity = async (tempId: string) => {
  await updateDoc(doc(db, 'staging-entity', tempId), { status: 'approved' });
};

// Add assignment workflow
const assignEntityToRegistry = async (
  tempId: string,
  geoData: GeoData,
  hierarchy: { domain: string; category: string; type?: string }
) => {
  // Get staging data
  const stagingDoc = await getDoc(doc(db, 'staging-entity', tempId));
  const stagingData = stagingDoc.data();
  
  // Create in registry
  const entityPk = generateEntityPk(hierarchy);
  const registryPath = hierarchy.type
    ? `entity-registry/domains/${hierarchy.domain}/categories/${hierarchy.category}/types/${hierarchy.type}/entity/${entityPk}`
    : `entity-registry/domains/${hierarchy.domain}/categories/${hierarchy.category}/entity/${entityPk}`;
  
  await setDoc(doc(db, registryPath), {
    ...stagingData,
    ...geoData,
    entity_pk: entityPk,
    assignedAt: new Date().toISOString(),
    status: 'active'
  });
  
  // Delete from staging
  await deleteDoc(doc(db, 'staging-entity', tempId));
};

// Add branch movement
const moveEntityBranch = async (
  entityPk: string,
  from: { domain: string; category: string; type?: string },
  to: { domain: string; category: string; type?: string }
) => {
  // Get current data
  const fromPath = from.type
    ? `entity-registry/domains/${from.domain}/categories/${from.category}/types/${from.type}/entity/${entityPk}`
    : `entity-registry/domains/${from.domain}/categories/${from.category}/entity/${entityPk}`;
  
  const entityDoc = await getDoc(doc(db, fromPath));
  const entityData = entityDoc.data();
  
  // Create in new location
  const toPath = to.type
    ? `entity-registry/domains/${to.domain}/categories/${to.category}/types/${to.type}/entity/${entityPk}`
    : `entity-registry/domains/${to.domain}/categories/${to.category}/entity/${entityPk}`;
  
  await setDoc(doc(db, toPath), {
    ...entityData,
    primary_domain: to.domain,
    category_pk: to.category,
    type_pk: to.type || null,
    movedAt: new Date().toISOString()
  });
  
  // Delete from old location
  await deleteDoc(doc(db, fromPath));
};
```

---

#### 2.2 Create New API Services
**Files:**
- `src/services/api/stagingApi.ts` (NEW)
- `src/services/api/entityRegistryApi.ts` (NEW)
- `src/services/api/nonEntityRegistryApi.ts` (NEW)

---

### Phase 3: Update Types (Day 3)

#### 3.1 Update Type Definitions
**File:** `src/types.ts`

**Add:**
```typescript
// Staging types
export interface StagingEntity {
  id: string;
  entity_name: string;
  phone?: string;
  primary_domain: string;
  category_pk: string;
  status: 'pending' | 'approved' | 'rejected';
  uploadedAt: string;
  // NO geo/zone fields!
}

export interface StagingNonEntity {
  id: string;
  non_entity_name: string;
  primary_domain: string;
  category_pk: string;
  status: 'pending' | 'approved' | 'rejected';
  uploadedAt: string;
  // NO geo/zone fields!
}

// Registry types (with geo/zone)
export interface RegistryEntity extends StagingEntity {
  entity_pk: string;
  zone_pk: string;
  stateId: string;
  districtId: string;
  talukId: string;
  cityVillageId: string;
  areaId: string;
  streetId: string;
  assignedAt: string;
  assignedBy: string;
  // Branch location
  domain: string;
  category: string;
  type?: string;
}

export interface RegistryNonEntity extends StagingNonEntity {
  non_entity_pk: string;
  stateId: string;
  districtId: string;
  talukId: string;
  cityVillageId?: string;
  areaId?: string;
  streetId?: string;
  zone_pk?: string; // Optional for non-entity
  assignedAt: string;
  assignedBy: string;
  // Branch location
  domain: string;
  category: string;
  type?: string;
}

// Geo assignment data
export interface GeoData {
  zone_pk?: string;
  stateId: string;
  districtId: string;
  talukId: string;
  cityVillageId?: string;
  areaId?: string;
  streetId?: string;
  substreetId?: string;
}

// Branch hierarchy
export interface BranchHierarchy {
  domain: string;
  category: string;
  type?: string;
}
```

---

### Phase 4: Update Routing (Day 3)

#### 4.1 Update Routes
**File:** `src/routes/index.tsx`

**Changes:**
```typescript
const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    children: [
      {
        path: '',
        element: <Navigate to="/dashboard" replace />
      },
      {
        path: 'dashboard',          // NEW
        element: <Dashboard />
      },
      {
        path: 'staging',            // MODIFIED (remove geo/zone)
        element: <StagingArea />
      },
      {
        path: 'entity-registry',    // NEW (separate from non-entity)
        element: <EntityRegistry />
      },
      {
        path: 'entity-registry/assign/:stagingId',  // NEW
        element: <EntityAssignment />
      },
      {
        path: 'entity-registry/modify/:entityPk',   // NEW
        element: <EntityBranchModifier />
      },
      {
        path: 'entity-registry/:entityPk',          // NEW
        element: <EntityDetails />
      },
      {
        path: 'non-entity-registry',                // NEW (separate)
        element: <NonEntityRegistry />
      },
      {
        path: 'non-entity-registry/assign/:stagingId',  // NEW
        element: <NonEntityAssignment />
      },
      {
        path: 'non-entity-registry/modify/:nonEntityPk', // NEW
        element: <NonEntityBranchModifier />
      },
      {
        path: 'geography',
        element: <GeoZoneManager />
      },
      {
        path: 'sites',
        element: <SiteProvisioner />
      }
    ]
  }
]);

// REMOVE these routes:
// - /registry
// - /registry/create
// - /registry/:entityPk
// - /registry/edit/:entityPk
// - /non-entities
```

---

#### 4.2 Update Navigation
**File:** `src/layouts/MainLayout.tsx`

**Changes:**
```typescript
const navItems = [
  { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },    // NEW
  { path: '/staging', icon: UploadCloud, label: 'Staging' },
  { path: '/entity-registry', icon: Building2, label: 'Entity Registry' },      // NEW
  { path: '/non-entity-registry', icon: MapPin, label: 'Non-Entity Registry' }, // NEW
  { path: '/geography', icon: MapPin, label: 'Geography' },
  { path: '/sites', icon: Globe, label: 'Sites' },
];

// REMOVE:
// - Registry (merged into entity-registry and non-entity-registry)
```

---

### Phase 5: Update Firestore Rules (Day 4)

#### 5.1 Update Security Rules
**File:** `firestore.rules`

**New rules:**
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Helper functions
    function isAuthenticated() {
      return request.auth != null;
    }
    
    function isAdmin() {
      return isAuthenticated() && 
             request.auth.token.admin == true;
    }
    
    // STAGING AREA (flat collections)
    match /staging-entity/{tempId} {
      allow create: if isAuthenticated();
      allow read: if isAuthenticated();
      allow update: if isAuthenticated();
      allow delete: if isAdmin(); // Only admin can approve/reject
    }
    
    match /staging-non-entity/{tempId} {
      allow create: if isAuthenticated();
      allow read: if isAuthenticated();
      allow update: if isAuthenticated();
      allow delete: if isAdmin();
    }
    
    // ENTITY REGISTRY (hierarchical - category level)
    match /entity-registry/domains/{domain}/categories/{category}/entity/{entityPk} {
      allow read: if isAuthenticated();
      allow write: if isAdmin() &&
                      request.resource.data.zone_pk != null &&
                      request.resource.data.stateId != null &&
                      request.resource.data.assignedAt != null;
    }
    
    // ENTITY REGISTRY (hierarchical - type level)
    match /entity-registry/domains/{domain}/categories/{category}/types/{type}/entity/{entityPk} {
      allow read: if isAuthenticated();
      allow write: if isAdmin() &&
                      request.resource.data.zone_pk != null &&
                      request.resource.data.stateId != null &&
                      request.resource.data.assignedAt != null;
    }
    
    // NON-ENTITY REGISTRY (hierarchical - category level)
    match /non-entity-registry/domains/{domain}/categories/{category}/non-entity/{nonEntityPk} {
      allow read: if isAuthenticated();
      allow write: if isAdmin() &&
                      request.resource.data.stateId != null &&
                      request.resource.data.districtId != null &&
                      request.resource.data.talukId != null &&
                      request.resource.data.assignedAt != null;
    }
    
    // NON-ENTITY REGISTRY (hierarchical - type level)
    match /non-entity-registry/domains/{domain}/categories/{category}/types/{type}/non-entity/{nonEntityPk} {
      allow read: if isAuthenticated();
      allow write: if isAdmin() &&
                      request.resource.data.stateId != null &&
                      request.resource.data.districtId != null &&
                      request.resource.data.talukId != null &&
                      request.resource.data.assignedAt != null;
    }
  }
}
```

---

### Phase 6: Data Migration (Day 4-5)

#### 6.1 Create Migration Script
**File:** `scripts/migrate-to-hierarchical.ts`

**Steps:**
1. Query all existing `activeEntities` (flat collection)
2. For each entity, determine domain/category/type
3. Move to new hierarchical path:
   - `entity-registry/domains/{domain}/categories/{category}/entity/{pk}`
   - OR `entity-registry/domains/{domain}/categories/{category}/types/{type}/entity/{pk}`
4. Update with `assignedAt` timestamp
5. Verify migration
6. Delete old flat collection

**Script:**
```typescript
async function migrateEntitiesToHierarchical() {
  const db = getFirestore();
  
  // Get all active entities
  const entitiesSnapshot = await getDocs(collection(db, 'activeEntities'));
  
  let migrated = 0;
  let errors = 0;
  
  for (const entityDoc of entitiesSnapshot.docs) {
    const entity = entityDoc.data() as ActiveEntity;
    
    try {
      // Determine hierarchy
      const domain = entity.primary_domain;
      const category = entity.category_pk;
      const type = entity.type_pk || null;
      
      // Create new path
      const newPath = type
        ? `entity-registry/domains/${domain}/categories/${category}/types/${type}/entity/${entity.entity_pk}`
        : `entity-registry/domains/${domain}/categories/${category}/entity/${entity.entity_pk}`;
      
      // Copy to new location
      await setDoc(doc(db, newPath), {
        ...entity,
        assignedAt: entity.createdAt || new Date().toISOString(),
        assignedBy: 'migration-script',
        status: 'active'
      });
      
      migrated++;
      console.log(`Migrated: ${entity.entity_pk} → ${newPath}`);
      
    } catch (error) {
      errors++;
      console.error(`Error migrating ${entity.entity_pk}:`, error);
    }
  }
  
  console.log(`\nMigration complete:`);
  console.log(`  Migrated: ${migrated}`);
  console.log(`  Errors: ${errors}`);
  console.log(`\nVerify data before deleting old collection!`);
}

// Similar for non-entities
async function migrateNonEntitiesToHierarchical() {
  // Same logic for nonEntities collection
}
```

---

### Phase 7: Remove Old Files (Day 5)

#### 7.1 Delete Obsolete Files

**Files to DELETE:**
```
src/pages/entities/EntityCreate.tsx           ❌ DELETE
src/components/RegistryViewer.tsx              ❌ DELETE (functionality moved)
src/components/NonEntityRegistry.tsx           ❌ DELETE (functionality moved)
```

---

## 📊 Summary Checklist

### New Files to Create (12 files)
- [ ] `src/pages/Dashboard.tsx`
- [ ] `src/pages/EntityRegistry.tsx`
- [ ] `src/pages/NonEntityRegistry.tsx`
- [ ] `src/pages/EntityAssignment.tsx`
- [ ] `src/pages/NonEntityAssignment.tsx`
- [ ] `src/components/EntityTreeView.tsx`
- [ ] `src/components/NonEntityTreeView.tsx`
- [ ] `src/components/entity/EntityBranchModifier.tsx`
- [ ] `src/components/non-entity/NonEntityBranchModifier.tsx`
- [ ] `src/components/GeoZoneAssignmentForm.tsx`
- [ ] `src/components/BranchSelector.tsx`
- [ ] `scripts/migrate-to-hierarchical.ts`

### Files to Modify (6 files)
- [ ] `src/components/StagingArea.tsx` (remove geo/zone)
- [ ] `src/utils/csvParser.ts` (simplify template)
- [ ] `src/contexts/DataContext.tsx` (add hierarchical queries)
- [ ] `src/types.ts` (add new types)
- [ ] `src/routes/index.tsx` (update routing)
- [ ] `src/layouts/MainLayout.tsx` (update navigation)
- [ ] `firestore.rules` (new security rules)

### Files to Delete (3 files)
- [ ] `src/pages/entities/EntityCreate.tsx`
- [ ] `src/components/RegistryViewer.tsx`
- [ ] `src/components/NonEntityRegistry.tsx`

---

## 🚀 Testing Plan

### Test 1: Staging Workflow
1. Navigate to Staging Area
2. Create entity (name, phone, domain, category only)
3. Verify saved to `staging-entity/` (no geo/zone)
4. Admin approves
5. Verify status changed to 'approved'

### Test 2: Assignment Workflow
1. Navigate to Entity Registry → Pending Assignment
2. Click "Assign" on approved entity
3. Fill geo/zone form
4. Choose branch (domain/category/type)
5. Submit
6. Verify moved to `entity-registry/domains/.../entity/`
7. Verify deleted from staging

### Test 3: Branch Movement
1. Navigate to Entity Registry
2. Find entity in tree
3. Click "Modify Branch"
4. Select new branch
5. Confirm
6. Verify entity moved to new path

### Test 4: Dashboard Navigation
1. Navigate to Dashboard
2. Expand domain tree
3. Click on specific branch
4. Verify navigates to that branch in registry

### Test 5: Scale Test
1. Create 10,000 entities across 10 branches
2. Query specific branch
3. Verify query performance < 1 second
4. Verify only that branch's data loaded

---

## ⏱️ Timeline

| Phase | Duration | Tasks |
|-------|----------|-------|
| Phase 1 | 2 days | Create new components |
| Phase 2 | 1 day | Update context and services |
| Phase 3 | 0.5 day | Update types |
| Phase 4 | 0.5 day | Update routing |
| Phase 5 | 0.5 day | Update Firestore rules |
| Phase 6 | 1 day | Data migration |
| Phase 7 | 0.5 day | Cleanup and testing |
| **Total** | **6 days** | Complete refactor |

---

## ✅ Success Criteria

- [ ] Staging area simplified (no geo/zone)
- [ ] Dashboard shows tree view for both entity and non-entity
- [ ] Entity and Non-Entity registries are completely separate
- [ ] Admin assigns geo/zone after approval
- [ ] Hierarchical storage working
- [ ] Branch movement functional
- [ ] All old files deleted
- [ ] Firestore rules updated
- [ ] Data migrated successfully
- [ ] Can scale to 1M+ records
- [ ] Query performance < 1 second per branch

---

**Status:** Ready to implement
**Priority:** 🔴 CRITICAL
**Estimated Effort:** 6 days
**Team Size:** 1-2 developers
