# Data Collection Integration - Layer 1 Project

**Status**: ✅ Domain/Category Structure Integrated  
**Date**: June 26, 2026  
**Phase**: Data Structure Setup

---

## What Was Done

### 1. Created Entity/Non-Entity Classification System

Based on the discussion in `/datacollection` folder, established clear separation:

**Non-Entity = Physical Assets**
- Buildings, land, infrastructure
- Religious places, parks, roads
- The physical thing that exists
- Example: Shop building, hospital building, temple

**Entity = Service/Asset Providers**
- People or organizations
- Can be Asset Provider (owner) OR Service Provider (operator) OR both
- Example: Restaurant owner, hospital management, plumber

### 2. Created Domain/Category Data Structure

**File**: `src/data/domains.ts`

**Entity Domains** (15 domains, 100+ categories):
- Business - Food & Hospitality
- Business - Retail & Trade
- Business - Manufacturing
- Professional Services - Technical
- Professional Services - Business
- Professional Services - Creative
- Healthcare Services
- Education Services
- Government Services
- Transportation Services
- Agricultural Services
- Maintenance & Facilities
- Financial Services
- Technology Services
- Tourism Services

**Non-Entity Domains** (10 domains, 70+ categories):
- Real Estate - Commercial
- Real Estate - Residential
- Infrastructure - Transport
- Infrastructure - Utilities
- Religious & Cultural
- Public Spaces
- Natural Assets
- Agricultural Assets
- Institutional Buildings
- Industrial Assets

### 3. Key Concepts Implemented

**Three-Level Hierarchy**:
- **L1 = Domain** (defined in `domains.ts`)
- **L2 = Category** (defined in `domains.ts`)
- **L3 = Type** (will be created on-demand in UI as needed)

**Relationships**:
```
NON-ENTITY (Asset)
    ↓
    ├── ENTITY: Asset Provider (owns)
    └── ENTITY: Service Provider (operates)
```

**Example**:
- Non-Entity: Shop Space (asset)
- Entity 1: Property Owner (asset provider)
- Entity 2: Restaurant Business (service provider)

---

## Next Steps

### Phase 1: Update Type Definitions

Update `src/types.ts` to include:

```typescript
// Add entity roles
interface Entity {
  // ... existing fields
  roles: {
    isAssetProvider: boolean;
    isServiceProvider: boolean;
  };
  linkedAssets?: string[];  // IDs of non-entities
}

// Add asset links
interface NonEntity {
  // ... existing fields
  linkedEntities: {
    assetProvider?: string;    // Entity ID (owner)
    serviceProvider?: string;  // Entity ID (operator)
  };
}
```

### Phase 2: Update Forms

**Staging Area** (`src/components/StagingArea.tsx`):
- Update domain/category dropdowns to use new structure
- Add entity role selection (asset provider/service provider/both)
- Separate create forms for entity vs non-entity

**Registry Assignment**:
- Add asset linking for entities
- Add entity linking for non-entities
- Show available assets when assigning service provider entities

### Phase 3: Update Dashboard

**Dashboard** (`src/components/Dashboard.tsx`):
- Split view: Entity tree | Non-Entity tree
- Use new domain/category structure
- Show counts per domain/category
- Click to navigate to specific branch

### Phase 4: Registry Viewers

**Entity Registry**:
- Filter by domain/category
- Show entity roles (asset/service provider)
- Show linked assets
- Tree view with types

**Non-Entity Registry**:
- Filter by domain/category
- Show linked entities (owner/operator)
- Tree view with types

### Phase 5: Implement L3 (Types)

**Type Management**:
- Admin can create types under categories on-demand
- Example: Restaurant → South Indian, Chinese, Italian
- Store in Firestore: `/types/{domain}/{category}/{type_id}`
- UI: "Add Type" button in registry views

---

## Data Structure

### Firestore Collections (Updated)

```
collections/

┌─────────────────────────────────────────────────┐
│              STAGING AREA                       │
└─────────────────────────────────────────────────┘

├── staging-entity/
│   └── {temp_id}
│       ├── entity_name
│       ├── phone
│       ├── domain_code         // NEW: from domains.ts
│       ├── category_id         // NEW: from domains.ts
│       ├── roles               // NEW: asset/service provider
│       ├── status: "pending"
│       └── uploadedAt

├── staging-non-entity/
│   └── {temp_id}
│       ├── non_entity_name
│       ├── domain_code         // NEW: from domains.ts
│       ├── category_id         // NEW: from domains.ts
│       ├── status: "pending"
│       └── uploadedAt


┌─────────────────────────────────────────────────┐
│         REGISTRY - ENTITY                       │
└─────────────────────────────────────────────────┘

└── entity-registry/
    └── domains/{domain_code}/
        └── categories/{category_id}/
            ├── entity/
            │   └── {entity_pk}
            │       ├── entity_name
            │       ├── phone
            │       ├── roles                    // NEW
            │       │   ├── isAssetProvider
            │       │   └── isServiceProvider
            │       ├── linkedAssets: []         // NEW
            │       ├── zone_pk
            │       └── ... (geo fields)
            │
            └── types/{type_id}/
                └── entity/
                    └── {entity_pk}


┌─────────────────────────────────────────────────┐
│      REGISTRY - NON-ENTITY                      │
└─────────────────────────────────────────────────┘

└── non-entity-registry/
    └── domains/{domain_code}/
        └── categories/{category_id}/
            ├── non-entity/
            │   └── {non_entity_pk}
            │       ├── non_entity_name
            │       ├── linkedEntities           // NEW
            │       │   ├── assetProvider
            │       │   └── serviceProvider
            │       ├── stateId
            │       └── ... (geo fields)
            │
            └── types/{type_id}/
                └── non-entity/
                    └── {non_entity_pk}
```

---

## Helper Functions Available

From `src/data/domains.ts`:

```typescript
// Get all domains
getAllEntityDomains(): Domain[]
getAllNonEntityDomains(): Domain[]

// Find by code
getEntityDomainByCode(code: string): Domain | undefined
getNonEntityDomainByCode(code: string): Domain | undefined

// Find category with parent domain
getEntityCategoryById(categoryId: string): { domain: Domain; category: Category } | undefined
getNonEntityCategoryById(categoryId: string): { domain: Domain; category: Category } | undefined
```

---

## Implementation Priority

1. ✅ **DONE**: Create domain/category data structure
2. **NEXT**: Update type definitions in `types.ts`
3. **THEN**: Update StagingArea form to use new domains
4. **THEN**: Update Dashboard to show split view
5. **THEN**: Implement entity/asset linking
6. **LATER**: Add L3 type creation UI

---

## Testing Scenarios

### Scenario 1: Restaurant Business
1. Create Non-Entity: Shop Space (Real Estate - Commercial)
2. Create Entity 1: Property Owner (role: asset provider)
3. Create Entity 2: Restaurant Business (role: service provider)
4. Link Entity 1 as asset provider to Shop Space
5. Link Entity 2 as service provider to Shop Space

### Scenario 2: Hospital
1. Create Non-Entity: Hospital Building (Institutional Buildings)
2. Create Entity: Hospital Trust (roles: both asset + service provider)
3. Link Entity to Hospital Building as both owner and operator

### Scenario 3: Freelance Plumber
1. Create Entity: Plumber (role: service provider only)
2. No asset link needed
3. Can operate from multiple locations

---

## Documentation References

- `/datacollection/README.md` - Overall structure explanation
- `/datacollection/entity-domains-categories.md` - Entity domains
- `/datacollection/non-entity-domains-categories.md` - Non-entity domains
- `/datacollection/idea.md` - Original concept

---

**Ready for Phase 1: Type Definition Updates**
