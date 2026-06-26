# Entity vs Non-Entity Structure

## Overview
The system now distinguishes between **Entities** (businesses, organizations with physical addresses) and **Non-Entities** (events, festivals, infrastructure projects without fixed street addresses).

---

## Key Differences

### ✅ Entities
**Definition:** Physical establishments with specific street addresses

**Requirements:**
- **GEO (Geographic):** State, District, Taluk ✅ Required
- **ZONE (Settlement):** City, Area, Street ✅ Required  
- **Zone PK:** Full zone assignment ✅ **MANDATORY**

**Examples:**
- Hospital on Gandhi High Road
- Retail Store on Market Street
- Restaurant on South Car Street
- Pharmacy on specific street corner

**CSV Format:**
```csv
entity_name,record_type,primary_domain,category_pk,stateId,districtId,talukId,cityVillageId,areaId,streetId,target_zone_pk
"Sirkazhi Hospital","entity","MED","CAT-MED-101","GEO-TN","GEO-TN-MAY","GEO-TN-MAY-SIR","ZON-CITY-001","ZON-AREA-101","ZON-STR-501","ZON-TN-MAY-SIR-CITY1-AREA1-STR1"
```

---

### ⚠️ Non-Entities
**Definition:** Activities, events, or infrastructure spanning areas without fixed street address

**Requirements:**
- **GEO (Geographic):** State, District, Taluk ✅ Required
- **ZONE (Settlement):** Optional (can be at district/taluk level)
- **Zone PK:** Optional

**Examples:**
- Temple Festival Route (spans multiple streets)
- Agricultural Water Basin Project (covers area)
- Heritage Walking Trail (crosses zones)
- Regional Bus Route (no fixed location)

**CSV Format:**
```csv
entity_name,record_type,primary_domain,category_pk,stateId,districtId,talukId,cityVillageId,areaId,streetId,target_zone_pk
"Temple Chariot Festival Route","non-entity","TOU","CAT-TOU-722","GEO-TN","GEO-TN-MAY","GEO-TN-MAY-SIR","","","",""
```

---

## Validation Rules

### For Entities (record_type = "entity")
1. ❌ **Error if missing:**
   - target_zone_pk (zone assignment)
   - stateId, districtId, talukId
   - cityVillageId, areaId, streetId
   
2. ⚠️ **Warning if:**
   - Duplicate entity in same zone
   - Public entity without phone number

### For Non-Entities (record_type = "non-entity")
1. ❌ **Error if missing:**
   - stateId, districtId, talukId (minimum GEO required)
   
2. ⚠️ **Warning if:**
   - Zone PK provided but invalid
   - Missing category or domain

---

## CSV Template Structure

### Required Headers

```csv
entity_name,record_type,primary_domain,category_pk,category_name,type_pk,phone,visibility_type,stateId,districtId,talukId,cityVillageId,areaId,streetId,target_zone_pk,website_zone_entity_id
```

### Header Descriptions

| Header | Required | Description | Entity | Non-Entity |
|--------|----------|-------------|--------|------------|
| `entity_name` | ✅ Yes | Name of record | ✅ | ✅ |
| `record_type` | ✅ Yes | "entity" or "non-entity" | ✅ | ✅ |
| `primary_domain` | ✅ Yes | Domain code (MED, RET, etc.) | ✅ | ✅ |
| `category_pk` | ✅ Yes | Category primary key | ✅ | ✅ |
| `category_name` | ⚠️ Optional | Category display name | ⚠️ | ⚠️ |
| `type_pk` | ⚠️ Optional | Type primary key | ⚠️ | ⚠️ |
| `phone` | ⚠️ Optional | Contact number | ⚠️ | ⚠️ |
| `visibility_type` | ✅ Yes | "Public" or "Private/Home" | ✅ | ✅ |
| `stateId` | ✅ Yes | State ID (e.g., GEO-TN) | ✅ | ✅ |
| `districtId` | ✅ Yes | District ID | ✅ | ✅ |
| `talukId` | ✅ Yes | Taluk ID | ✅ | ✅ |
| `cityVillageId` | ❌/⚠️ | City/Village ID | ✅ Required | ⚠️ Optional |
| `areaId` | ❌/⚠️ | Area ID | ✅ Required | ⚠️ Optional |
| `streetId` | ❌/⚠️ | Street ID | ✅ Required | ⚠️ Optional |
| `target_zone_pk` | ❌/⚠️ | Full zone PK | ✅ Required | ⚠️ Optional |
| `website_zone_entity_id` | ⚠️ Optional | Associated website ID | ⚠️ | ⚠️ |

---

## Examples

### Example 1: Entity (Hospital)
```csv
"Sirkazhi Government Hospital","entity","MED","CAT-MED-101","Government Hospital","","09436427041 4","Public","GEO-TN","GEO-TN-MAY","GEO-TN-MAY-SIR","ZON-CITY-001","ZON-AREA-101","ZON-STR-503","ZON-TN-MAY-SIR-CITY1-AREA1-STR3",""
```

**✅ Valid because:**
- Has record_type = "entity"
- Has complete GEO (state/district/taluk)
- Has complete ZONE (city/area/street)
- Has target_zone_pk

---

### Example 2: Non-Entity (Festival Route)
```csv
"Brahmotsavam Chariot Festival Route","non-entity","TOU","CAT-TOU-722","Heritage Events","","","Public","GEO-TN","GEO-TN-MAY","GEO-TN-MAY-SIR","","","",""
```

**✅ Valid because:**
- Has record_type = "non-entity"
- Has complete GEO (state/district/taluk)
- ZONE fields can be empty (route spans multiple areas)
- target_zone_pk can be empty

---

### Example 3: Non-Entity with Optional Zone
```csv
"Pattamangala Lake Basin Project","non-entity","AGR","CAT-AGR-501","Agriculture Infrastructure","","","Public","GEO-TN","GEO-TN-MAY","GEO-TN-MAY-SIR","ZON-CITY-001","ZON-AREA-101","","ZON-TN-MAY-SIR-CITY1-AREA1",""
```

**✅ Valid because:**
- Has record_type = "non-entity"
- Has GEO requirements
- Partial ZONE (down to area level, no specific street)
- Partial zone_pk (area-level assignment)

---

## Use Cases

### When to Use Entity
- Physical businesses with street addresses
- Government offices at specific locations
- Hospitals, clinics, pharmacies
- Retail stores, restaurants
- Schools, colleges at fixed locations
- Any establishment with a door number

### When to Use Non-Entity
- Festivals and cultural events
- Infrastructure projects (roads, bridges, water projects)
- Heritage trails and walking routes
- Agricultural zones and irrigation systems
- Regional bus/transport routes
- Any activity without a fixed street address

---

## Staging Area Behavior

### Entity Records
1. Upload CSV with record_type = "entity"
2. System validates:
   - Full zone assignment required
   - Checks zone PK exists
   - Checks for duplicates in same zone
3. Errors if zone missing or invalid
4. Promotes to Active Entities table

### Non-Entity Records
1. Upload CSV with record_type = "non-entity"
2. System validates:
   - Only GEO (state/district/taluk) required
   - Zone optional but validated if provided
3. Warnings if zone provided but invalid
4. Promotes to Non-Entities table

---

## Database Structure

### Active Entities Table
- Requires full zone_pk
- Street-level granularity
- Used for businesses, organizations
- Supports multi-tenant site mapping

### Non-Entities Table
- Optional zone_pk
- Can be district/taluk level
- Used for events, infrastructure
- Regional scope tracking

---

## Migration Notes

### For Existing Data
- All existing records default to "entity" type
- CSV uploads without record_type field will be rejected
- Update your CSV files to include record_type column

### For New Uploads
- Always specify record_type in first column
- Use "entity" for 90% of cases (businesses)
- Use "non-entity" for regional/event-based records

---

## Quick Reference

| Aspect | Entity | Non-Entity |
|--------|--------|------------|
| **Type** | Physical establishment | Activity/Event/Infrastructure |
| **GEO Required** | Yes (State/District/Taluk) | Yes (State/District/Taluk) |
| **ZONE Required** | Yes (City/Area/Street) | No (Optional) |
| **Zone PK** | ✅ Mandatory | ⚠️ Optional |
| **Validation Level** | Street-level accuracy | District/Taluk acceptable |
| **Typical Count** | Thousands | Hundreds |
| **Examples** | Shops, offices, hospitals | Festivals, projects, routes |

---

## Benefits of This Structure

1. **Flexibility:** Can track regional activities without forcing street addresses
2. **Accuracy:** Entities maintain precise location data
3. **Validation:** Appropriate rules for each type
4. **Reporting:** Separate analytics for businesses vs infrastructure
5. **Clarity:** Clear distinction in purpose and requirements

---

**Implementation Date:** June 26, 2026  
**Version:** 2.1.0  
**Status:** ✅ Active
