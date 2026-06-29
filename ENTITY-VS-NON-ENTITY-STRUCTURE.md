# Entity vs Non-Entity Structure

## Overview

The system maintains **complete separation** between:
- **Entities** — Service providers / Asset owners (people or organizations)
- **Non-Entities** — Physical assets (buildings, land, infrastructure)

This separation exists at every layer: pages, DCT filters, colors, icons, Firestore collections, and API routes.

---

## Entity (Service Provider)

| Field | Required | Notes |
|-------|----------|-------|
| Name | ✅ | `entity_name` |
| Phone | ⚠️ optional | Contact number |
| Domain | ✅ | From DCT master (`domains/` collection) |
| Category | ✅ | Cascades from domain |
| Type | ⚠️ optional | Cascades from category |
| State / District / Taluk | ✅ | Assigned by admin post-approval |
| Zone PK | ✅ **required** | Exact zone assignment |
| Roles | ✅ | Asset Provider, Service Provider, or both |

**Examples:** Hospital trust, Restaurant owner, School management, Freelance plumber

**Collection:** `entity-registry/domains/{domain}/categories/{category}/entity/{pk}`

**Theme color:** `entity-600` (orange)

---

## Non-Entity (Physical Asset)

| Field | Required | Notes |
|-------|----------|-------|
| Name | ✅ | `non_entity_name` |
| Domain | ✅ | From DCT master |
| Category | ✅ | Cascades from domain |
| Type | ⚠️ optional | Cascades from category |
| State / District / Taluk | ✅ | Area-level location |
| Zone PK | ⚠️ optional | Exact zone optional for assets |
| Phone | ⚠️ optional | Contact if available |

**Examples:** Shop building, Hospital building, Park, Road, Water tank, Power substation

**Collection:** `non-entity-registry/domains/{domain}/categories/{category}/non-entity/{pk}`

**Theme color:** `nonentity-600` (blue)

---

## Relationship Model

```
NON-ENTITY (Physical Asset — e.g., Shop Building)
    │
    ├── ENTITY: Asset Provider (owns the asset)
    └── ENTITY: Service Provider (operates from the asset)
```

---

## Storage Structure

```
entity-registry/
  domains/{domain_code}/
    categories/{category_pk}/
      entity/{entity_pk}                 ← direct branch
      types/{type_pk}/
        entity/{entity_pk}               ← type branch

non-entity-registry/
  domains/{domain_code}/
    categories/{category_pk}/
      non-entity/{non_entity_pk}         ← direct branch
      types/{type_pk}/
        non-entity/{non_entity_pk}       ← type branch
```

---

## Staging Difference

| | Entity Staging | Non-Entity Staging |
|--|----------------|--------------------|
| Collection | `staging-entity/` | `staging-non-entity/` |
| Name field | `entity_name` | `non_entity_name` |
| Geo required | ❌ No | ❌ No |
| Roles | ✅ Yes (asset/service provider) | ❌ No |
| Zone PK | Assigned later by admin | Optional, assigned later |

---

## DCT Filter

Domain documents have `entityType` field:
- `entityType === 'entity'` → shown in `DCTEntityPage`
- `entityType === 'non-entity'` → shown in `DCTNonEntityPage`
- `entityType` undefined/empty → shown in **both**

---

**Updated**: June 29, 2026  
**Version**: 3.0.0
