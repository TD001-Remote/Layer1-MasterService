# NON-ENTITY DOMAINS & CATEGORIES

> Classification structure for physical assets and spaces

---

## 1. Real Estate - Commercial

```
Commercial Buildings
├── Shop Space
├── Office Space
├── Warehouse
├── Shopping Complex
├── Market Hall
├── Industrial Shed
├── Showroom
└── Commercial Plot
```

---

## 2. Real Estate - Residential

```
Residential Properties
├── Independent House
├── Apartment
├── Villa
├── Farmhouse
├── Residential Plot
├── Gated Community Unit
└── Tenement
```

---

## 3. Infrastructure - Transport

```
Transport Infrastructure
├── Road
├── Highway
├── Bridge
├── Flyover
├── Railway Line
├── Bus Station
├── Railway Station
└── Airport Terminal
```

---

## 4. Infrastructure - Utilities

```
Utility Infrastructure
├── Water Pipeline
├── Sewage Line
├── Electricity Line
├── Gas Pipeline
├── Telecom Tower
├── Water Tank
└── Substation
```

---

## 5. Religious & Cultural

```
Religious & Cultural Assets
├── Temple
├── Church
├── Mosque
├── Gurudwara
├── Monastery
├── Heritage Site
└── Monument
```

---

## 6. Public Spaces

```
Public Spaces
├── Park
├── Playground
├── Garden
├── Open Ground
├── Community Hall
└── Public Square
```

---

## 7. Natural Assets

```
Natural Features
├── River
├── Lake
├── Pond
├── Forest
├── Hill
├── Beach
├── Wetland
└── Wildlife Area
```

---

## 8. Agricultural Assets

```
Agricultural Land
├── Crop Land
├── Orchard
├── Plantation
├── Grazing Land
├── Fallow Land
└── Agricultural Plot
```

---

## 9. Institutional Buildings

```
Institutional Infrastructure
├── School Building
├── College Building
├── Hospital Building
├── Government Office Building
├── Court Building
├── Police Station Building
└── Library Building
```

---

## 10. Industrial Assets

```
Industrial Infrastructure
├── Factory Building
├── Processing Plant
├── Power Plant
├── Manufacturing Unit
├── Cold Storage
└── Industrial Plot
```

---

## Structure Format

**L1 = Domain** (e.g., Real Estate - Commercial)  
**L2 = Category** (e.g., Shop Space)  
**L3 = Type** (will be created on-demand in Layer-1 project as needed)

**Key Concept:**
- Non-entities are **physical assets** that exist independently
- They can have **Asset Providers** (owners) and **Service Providers** (operators)
- The asset remains even if ownership or operation changes

**Implementation:**
- L1 (Domain) and L2 (Category) are defined here in datacollection folder
- L3 (Type) will be created dynamically in Layer-1 project based on actual requirements
- Types are added only when needed for specific use cases
