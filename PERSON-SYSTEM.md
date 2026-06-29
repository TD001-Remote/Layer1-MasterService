# Person System — Architecture & Specification

## Overview

A **Person** is a named connection record that links one or more **Entities** to one or more **Non-Entities**. It represents a real-world ownership, operational, or service relationship between providers and assets.

Person records sit between the Entity and Non-Entity layers — they are created only after both sides have completed geo-zone and DCT assignment (active registry stage).

---

## Person Record Structure

```
PER-XXXXXX
  name             → string          (e.g., "Kovai Land Group")
  entities         → [               (min 1 required)
                       { entity_pk: ENT-XXXXXX, order: 1 },
                       { entity_pk: ENT-XXXXXX, order: 2 },
                       ...n (no limit)
                     ]
  non_entities     → [               (optional, flat list)
                       NENT-XXXXXX,
                       NENT-XXXXXX,
                       ...
                     ]
  parent_person_pk → PER-XXXXXX | null   (optional Person↔Person link)
  status           → 'active' | 'stopped'
  statusLog        → [
                       { status, reason, changedAt, changedBy }
                       ...
                     ]
  createdAt        → ISO 8601 string
  assignedBy       → string (admin user)
```

---

## ID Format

```
PER-XXXXXX    e.g., PER-000001, PER-000002
```

Follows the same padded 6-digit format as ENT-XXXXXX and NENT-XXXXXX.

---

## Entity Order Rules

- Entities inside a Person are ordered by the `order` field (1 = primary, 2 = secondary, 3 = tertiary, ...n)
- Order is **dynamic** — can be changed after Person creation
- No fixed labels (no hardcoded "primary/secondary" strings) — order number alone defines hierarchy
- Minimum **1 entity** required at all times

---

## Non-Entity Rules

- Non-entities are a **flat list** — no order or priority
- Completely **optional** — a Person can exist with only entities
- Cross-role linking is **allowed** (e.g., a `physical-asset-provider` entity can link to a `physical-service` non-entity)

---

## Person ↔ Person Linking

- A Person can optionally reference another Person via `parent_person_pk`
- This enables hierarchical Person structures
- Example: `PER-000002 (Property Management Firm)` is the parent of `PER-000001 (Land Owner Group)`

---

## Status Log

Every status change is recorded:

```
statusLog entry:
  status    → 'active' | 'stopped'
  reason    → string (why status changed)
  changedAt → ISO 8601 string
  changedBy → string (admin user)
```

- Initial creation is NOT logged (only changes are logged)
- Stop uses `'warning'` toast, recover uses `'success'` toast (follows project pattern)

---

## Creation Rules

- Person can only be created after **both** the entity and non-entity have:
  - Geo-zone assigned
  - DCT assigned
  - Status = `active` in registry
- At least **1 active entity** must be selected
- Non-entities are optional at creation time (can be linked later)

---

## Example

```
PER-000001
  name: "Sirkazhi Land Owner Group"
  entities: [
    { entity_pk: "ENT-000001", order: 1 }   ← Land Owner (physical-asset-provider)
    { entity_pk: "ENT-000002", order: 2 }   ← Facilities Manager (physical-service-provider)
  ]
  non_entities: [
    "NENT-000001",   ← Building A (physical-asset)
    "NENT-000002",   ← Building B (physical-asset)
    "NENT-000003",   ← Land Plot  (physical-asset)
  ]
  parent_person_pk: null
  status: "active"
  statusLog: []
  createdAt: "2025-01-15T10:30:00.000Z"
  assignedBy: "admin@tn-registry.gov.in"
```

---

## Pages

### /person-assign — Person Assignment
- Create new Person record
- Name the Person
- Search and select entities from active registry (with order assignment)
- Search and select non-entities from active registry (flat list)
- Optionally link a parent Person
- Submit creates `PER-XXXXXX` record

### /person-manage — Person Management
- View all Person records (active + stopped)
- Search by name, entity, non-entity
- Reorder entities within a Person (drag or up/down controls)
- Add / remove entities and non-entities
- Stop / recover Person (with reason input → appended to statusLog)
- View parent Person link, navigate to it

---

## Sidebar Placement

```
── Entity ──
  /entity-assign        Entity Assignment
  /entity-manage        Entity Management
── Person ──
  /person-assign        Person Assignment
  /person-manage        Person Management
── Non-Entity ──
  /non-entity-assign    Non-Entity Assignment
  /non-entity-manage    Non-Entity Management
```

---

## Firestore Collection

```
persons/
  {person_pk}/
    name
    entities        → array of { entity_pk, order }
    non_entities    → array of non_entity_pk strings
    parent_person_pk
    status
    statusLog       → array of { status, reason, changedAt, changedBy }
    createdAt
    assignedBy
```

---

## TypeScript Interface (to be added in src/types.ts)

```ts
export interface PersonEntityLink {
  entity_pk: string;
  order: number;
}

export interface PersonStatusLogEntry {
  status: 'active' | 'stopped';
  reason: string;
  changedAt: string;
  changedBy: string;
}

export interface Person {
  person_pk: string;                    // PER-XXXXXX
  name: string;
  entities: PersonEntityLink[];         // min 1
  non_entities: string[];               // NENT-XXXXXX[], optional
  parent_person_pk?: string | null;
  status: 'active' | 'stopped';
  statusLog: PersonStatusLogEntry[];
  createdAt: string;
  assignedBy: string;
}
```

---

## API Module (src/services/api/personApi.ts)

```
personApi.create(person)
personApi.getAll()
personApi.getById(person_pk)
personApi.updateEntities(person_pk, entities)
personApi.addNonEntity(person_pk, non_entity_pk)
personApi.removeNonEntity(person_pk, non_entity_pk)
personApi.updateStatus(person_pk, status, logEntry)
personApi.updateParent(person_pk, parent_person_pk)
```

---

## DataContext Methods (to be added)

```
createPerson(person)
updatePersonEntities(person_pk, entities)
addNonEntityToPerson(person_pk, non_entity_pk)
removeNonEntityFromPerson(person_pk, non_entity_pk)
stopPerson(person_pk, reason)
recoverPerson(person_pk, reason)
updatePersonParent(person_pk, parent_person_pk)
getPersons()
```

---

## Files to Create / Modify

| File | Action |
|------|--------|
| `src/types.ts` | Add `Person`, `PersonEntityLink`, `PersonStatusLogEntry` interfaces |
| `src/services/api/personApi.ts` | New file — Firestore CRUD |
| `src/contexts/DataContext.tsx` | Add Person state + all CRUD methods |
| `src/pages/person/PersonAssignment.tsx` | New page — create + link |
| `src/pages/person/PersonManagement.tsx` | New page — manage, reorder, stop/recover |
| `src/routes/index.tsx` | Add `/person-assign` + `/person-manage` routes |
| `src/layouts/MainLayout.tsx` | Add Person nav items between Entity and Non-Entity |
