# Data Collection - Domain/Category/Type Structure

This folder contains the foundational classification structure for the Layer-1 project.

## Purpose

Define and maintain the hierarchical classification system for both **Entities** (service providers/owners) and **Non-Entities** (physical assets).

## Structure

### Three-Level Hierarchy

- **L1 = Domain**: Top-level classification (defined here)
- **L2 = Category**: Mid-level classification (defined here)
- **L3 = Type**: Specific variations (created on-demand in Layer-1 project)

### Two Separate Tracks

1. **Entity Classification** → `entity-domains-categories.md`
   - People and organizations
   - Service providers and asset owners
   - Examples: Restaurant Owner, Doctor, Shop Owner

2. **Non-Entity Classification** → `non-entity-domains-categories.md`
   - Physical assets and spaces
   - Infrastructure and properties
   - Examples: Shop Building, Hospital Building, Road

## Key Concepts

### Non-Entity (Assets)
- Physical spaces that exist independently
- Can have multiple linked entities (owners, operators)
- Asset remains even if ownership/operation changes

### Entity (Service/Asset Providers)
- People or organizations with roles
- Can be Asset Provider (owner), Service Provider (operator), or both
- Can exist with or without linked assets

### Relationships
```
NON-ENTITY (Asset)
    ↓
    ├── ENTITY: Asset Provider (owns it)
    └── ENTITY: Service Provider (uses/operates it)
```

## Implementation

### In This Folder (datacollection)
- Define L1 Domains
- Define L2 Categories
- Maintain classification structure
- Document standards and guidelines

### In Layer-1 Project
- Create L3 Types on-demand
- Link entities to assets
- Implement actual data structures
- Handle real-world instances

## Files

- `entity-domains-categories.md` - Entity classification structure
- `non-entity-domains-categories.md` - Non-entity classification structure
- `idea.md` - Original brainstorming and concepts
- `README.md` - This file

## Examples

### Example 1: Restaurant
- **Non-Entity**: Shop Space (Commercial Building)
- **Entity 1**: Property Owner (Asset Provider)
- **Entity 2**: Restaurant Business (Service Provider)
- **L3 Type** (created in Layer-1): South Indian Restaurant, Chinese Restaurant, etc.

### Example 2: Public Park
- **Non-Entity**: Park (Public Space)
- **Entity 1**: Government (Asset Provider - owns land)
- **Entity 2**: Parks Department (Service Provider - maintains)
- **L3 Type** (created in Layer-1): Children's Park, Botanical Garden, etc.

### Example 3: Freelance Service
- **Entity**: Plumber (Service Provider without asset)
- No non-entity linked
- **L3 Type** (created in Layer-1): Residential Plumber, Commercial Plumber, etc.

## Guidelines

1. L1/L2 changes require discussion and documentation
2. L3 types are added in Layer-1 as needed
3. Keep entity and non-entity structures separate
4. Maintain clear relationships between assets and entities
5. Document any new patterns or edge cases
