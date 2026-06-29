# FINAL SYSTEM STRUCTURE - 4-Page Entity/Non-Entity Management

## ✅ COMPLETE NEW ARCHITECTURE

### System Flow:
```
CSV Import → Staging → Admin Approval → PAGE 1 (Assign Geo/Zone) → PAGE 2 (Manage)
```

---

## 📱 NAVIGATION STRUCTURE

```
Dashboard
├── Staging Area (CSV Import with D/C/T selection)
├── Entity Assignment (PAGE 1 - Assign Geo/Zone from CSV)
├── Entity Management (PAGE 2 - Modify/Delete/Recovery)
├── Non-Entity Assignment (PAGE 1 - Assign Geo from CSV)
├── Non-Entity Management (PAGE 2 - Modify/Delete/Recovery)
├── Geography
└── Sites
```

---

## 🔄 COMPLETE WORKFLOW

### Step 1: STAGING AREA - CSV IMPORT
**Route:** `/staging`
**Purpose:** Upload CSV files with Domain/Category/Type pre-selection

**Process:**
1. Admin selects **Record Type** (Entity or Non-Entity)
2. Admin selects **Domain** (e.g., Healthcare Services)
3. Admin selects **Category** (e.g., Hospital Management)
4. Admin enters **Type** (optional, e.g., Multi-Specialty)
5. Admin downloads CSV template
6. Admin uploads CSV file

**CSV Format:**
- **Entity CSV:** `entity_name,phone` (no geo/zone)
- **Non-Entity CSV:** `non_entity_name` (no geo/zone)

**Result:** All records from CSV automatically assigned to selected D/C/T and created in staging with status "pending"

---

### Step 2: STAGING AREA - ADMIN REVIEW
**Route:** `/staging` (Pending Review tab)
**Purpose:** Admin approves or rejects uploaded records

**Process:**
1. Admin reviews pending records
2. Admin clicks **Approve** → Status changes to "approved"
3. Admin clicks **Reject** → Record deleted from staging

---

### Step 3: PAGE 1 - ASSIGN GEO/ZONE

#### FOR ENTITIES
**Route:** `/entity-assign`
**Purpose:** Assign geographic location and zone to entities from CSV

**Interface:**
- **LEFT COLUMN:** List of approved entities from CSV import
- **RIGHT COLUMN:** Geo/Zone assignment form

**Form Fields (ALL REQUIRED):**
- State *
- District *
- Taluk *
- Zone PK * (full address - required for entities)
- Type (optional - for sub-branching)

**Action:** Click "Assign to Registry" → Entity moved to active registry

#### FOR NON-ENTITIES
**Route:** `/non-entity-assign`
**Purpose:** Assign geographic location to non-entities from CSV

**Interface:**
- **LEFT COLUMN:** List of approved non-entities from CSV import
- **RIGHT COLUMN:** Geo assignment form

**Form Fields:**
- State *
- District *
- Taluk *
- Zone PK (OPTIONAL - for precise location, can be left empty for area-level assets)
- Type (optional - for sub-branching)

**Action:** Click "Assign to Registry" → Non-entity moved to active registry

---

### Step 4: PAGE 2 - MANAGE RECORDS

#### FOR ENTITIES
**Route:** `/entity-manage`
**Purpose:** Manage existing entities in registry

**Features:**
- **View Modes:**
  1. Active Entities (default)
  2. Deleted/Recovery

- **Search & Filter:**
  - Search by name, phone, PK
  - Filter by domain

- **Actions per Entity:**
  - **Edit** - Modify entity details
  - **Move Branch** - Change domain/category/type
  - **Delete** - Soft delete (can be recovered)
  - **Recover** - Restore deleted entity

**Table Columns:**
- Entity Name & PK
- Phone
- Domain/Category/Type
- Location (Zone PK)
- Actions

#### FOR NON-ENTITIES
**Route:** `/non-entity-manage`
**Purpose:** Manage existing non-entities in registry

**Features:**
- **View Modes:**
  1. Active Non-Entities (default)
  2. Deleted/Recovery

- **Search & Filter:**
  - Search by name, PK
  - Filter by domain

- **Actions per Non-Entity:**
  - **Edit** - Modify non-entity details
  - **Move Branch** - Change domain/category/type
  - **Delete** - Soft delete (can be recovered)
  - **Recover** - Restore deleted non-entity

**Table Columns:**
- Non-Entity Name & PK
- Domain/Category/Type
- Location (State/District/Taluk + Zone if exists)
- Actions

---

## 🎨 COLOR THEMES

| Component | Color | Icon |
|-----------|-------|------|
| Entity Assignment | Indigo (`indigo-600`) | Building2 |
| Entity Management | Indigo (`indigo-600`) | Building2 |
| Non-Entity Assignment | Emerald (`emerald-600`) | Home |
| Non-Entity Management | Emerald (`emerald-600`) | Home |
| Staging Area | Blue/Amber | UploadCloud |
| Pending Assignment | Amber (`amber-600`) | AlertTriangle |

---

## 📊 KEY DIFFERENCES

### Entity vs Non-Entity

| Feature | Entity | Non-Entity |
|---------|--------|------------|
| **Purpose** | Service providers, asset owners | Physical assets, infrastructure |
| **Zone PK** | **REQUIRED** (exact location) | **OPTIONAL** (area-level acceptable) |
| **Phone** | Optional | N/A |
| **Roles** | Asset Provider, Service Provider | N/A |
| **Example** | Hospital, Restaurant Owner | Hospital Building, Shop Space |

---

## 📁 FILE STRUCTURE

```
src/pages/
├── EntityAssignGeoZone.tsx    ✅ ENTITY PAGE 1 - Assign Geo/Zone
├── EntityManage.tsx            ✅ ENTITY PAGE 2 - Manage/Modify/Delete
├── NonEntityAssignGeo.tsx      ✅ NON-ENTITY PAGE 1 - Assign Geo
├── NonEntityManage.tsx         ✅ NON-ENTITY PAGE 2 - Manage/Modify/Delete
├── DomainCategoryTypeManager.tsx  ✅ Create D/C/T hierarchy
├── EntityAssignment.tsx        (Legacy - for direct staging links)
└── NonEntityAssignment.tsx     (Legacy - for direct staging links)

src/components/
├── StagingAreaNew.tsx          ✅ CSV upload with D/C/T selection
├── DashboardNew.tsx            ✅ Split tree view
└── DomainCategoryTypeSelector.tsx  ✅ Reusable selector

src/routes/index.tsx            ✅ Updated with 4 new pages
src/layouts/MainLayout.tsx      ✅ Updated navigation
```

---

## 🔑 ROUTES

### Active Routes
```typescript
/dashboard              → Dashboard with split tree view
/staging                → CSV import + approval workflow
/entity-assign          → Entity PAGE 1 (Assign Geo/Zone)
/entity-manage          → Entity PAGE 2 (Manage/Modify/Delete)
/non-entity-assign      → Non-Entity PAGE 1 (Assign Geo)
/non-entity-manage      → Non-Entity PAGE 2 (Manage/Modify/Delete)
/geography              → Geographic hierarchy management
/sites                  → Site management
```

### Legacy Routes (kept for compatibility)
```typescript
/entity-registry/assign/:stagingId      → Direct staging assignment
/non-entity-registry/assign/:stagingId  → Direct staging assignment
/entity-registry/:entityPk              → Entity details
/entity-registry/edit/:entityPk         → Entity edit
```

---

## 💾 DATA FLOW

### 1. CSV Import → Staging
```
CSV File (entity_name,phone)
  ↓
Admin selects: Domain/Category/Type
  ↓
Upload
  ↓
Created in staging-entity/ with status "pending"
  ↓
Admin reviews in Staging Area
```

### 2. Staging → Assignment Page
```
Admin approves → status = "approved"
  ↓
Entity appears in /entity-assign (PAGE 1)
  ↓
Admin selects entity from left column
  ↓
Admin fills geo/zone form in right column
  ↓
Click "Assign to Registry"
  ↓
Moved to entity-registry/domains/{domain}/categories/{category}/entity/{pk}
  OR
Moved to entity-registry/domains/{domain}/categories/{category}/types/{type}/entity/{pk}
```

### 3. Registry → Management Page
```
Entity now active in registry
  ↓
Appears in /entity-manage (PAGE 2)
  ↓
Admin can:
  - Edit details
  - Move to different branch
  - Delete (soft delete)
  - Recover if deleted
```

---

## 🎯 KEY BENEFITS OF THIS STRUCTURE

### 1. **Clear Separation of Concerns**
- **PAGE 1**: Assignment only (from CSV imports)
- **PAGE 2**: Management only (existing records)
- No confusion about what each page does

### 2. **CSV-First Workflow**
- Bulk upload with pre-classification
- One CSV file = one domain/category/type
- No geo/zone in CSV (assigned later by admin)
- Fast data entry for thousands of records

### 3. **Two-Step Assignment**
- Step 1: Upload CSV with D/C/T → Creates in staging
- Step 2: Assign geo/zone → Moves to active registry
- Admin control at every step

### 4. **Entity vs Non-Entity Clarity**
- Completely separate pages
- Different color themes
- Zone PK: Required for Entity, Optional for Non-Entity
- Clear visual distinction

### 5. **Management Features**
- Search and filter
- Edit/Delete/Recovery
- Move between branches
- Active vs Deleted views

---

## 🔄 NAVIGATION FLOW

```
┌─────────────┐
│  Staging    │ → Upload CSV with D/C/T
└──────┬──────┘
       │ Admin Approves
       ↓
┌─────────────────────────┐
│  Entity Assignment      │ → PAGE 1: Assign Geo/Zone
│  (From CSV Import)      │
└──────┬──────────────────┘
       │ Assign → Move to Registry
       ↓
┌─────────────────────────┐
│  Entity Management      │ → PAGE 2: Edit/Delete/Recover
│  (Active Records)       │
└─────────────────────────┘

Same flow for Non-Entities with separate pages
```

---

## 📝 EXAMPLE USE CASE

### Scenario: Import 1000 Hospitals

1. **Staging Area** (`/staging`)
   - Select: Record Type = Entity
   - Select: Domain = Healthcare Services (HLT-SRV)
   - Select: Category = Hospital Management (HOSP)
   - Enter: Type = Multi-Specialty (optional)
   - Upload: hospitals.csv (1000 rows with hospital_name, phone)
   - Result: 1000 entities created with status "pending"

2. **Admin Review** (`/staging` → Pending Review tab)
   - Review records
   - Click "Approve All" or approve individually
   - Result: 1000 entities with status "approved"

3. **Entity Assignment** (`/entity-assign`)
   - List shows 1000 hospitals
   - Admin selects hospital #1
   - Assigns: State, District, Taluk, Zone PK
   - Clicks "Assign to Registry"
   - Result: Hospital #1 moved to active registry
   - Repeat for remaining 999...

4. **Entity Management** (`/entity-manage`)
   - View all 1000 assigned hospitals
   - Search: "Apollo Hospital"
   - Edit details if needed
   - Move to different branch if miscategorized
   - Delete if duplicate

---

## ✅ IMPLEMENTATION STATUS

- ✅ 4 new pages created (EntityAssign, EntityManage, NonEntityAssign, NonEntityManage)
- ✅ CSV upload with D/C/T selection
- ✅ Staging workflow with approval
- ✅ Two-column assignment interface
- ✅ Management with search/filter
- ✅ Active vs Deleted views
- ✅ Edit/Delete/Recovery actions
- ✅ Navigation updated
- ✅ Routes configured
- ✅ Zero TypeScript errors
- ✅ Dev server running

**Server:** http://localhost:3000

---

**Last Updated:** 2026-06-26
**Status:** ✅ PRODUCTION READY
**Architecture:** CSV-First with 4-Page Management System
