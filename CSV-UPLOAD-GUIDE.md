# CSV Upload Guide

## Current Flow (v3.0)

CSV upload is available from **Staging Area → Upload CSV tab**.

Staging does **not** require geo/zone. Records are created with `status: pending`, then approved by admin, then assigned geo/zone in the Registry.

---

## CSV File Format

### Required Headers

```csv
entity_name,record_type,primary_domain,category_pk,category_name,phone,visibility_type
```

### Column Descriptions

| Column | Required | Type | Example | Description |
|--------|----------|------|---------|-------------|
| `entity_name` | ✅ | Text | "Sirkazhi Government Hospital" | Full legal name |
| `record_type` | ✅ | Enum | `entity` or `non-entity` | Record classification |
| `primary_domain` | ✅ | Code | "MED" | Domain code |
| `category_pk` | ✅ | Text | "CAT-MED-101" | Category primary key |
| `category_name` | ⚠️ optional | Text | "Government Taluk Hospital" | Display name |
| `phone` | ⚠️ optional | Text | "+91 4364 270414" | Contact number |
| `visibility_type` | ⚠️ optional | Enum | "Public" / "Private/Home" | Visibility |

**Note:** `target_zone_pk` and `website_zone_entity_id` are **no longer required** in staging CSV. Geo/zone is assigned by admin after approval.

---

## Domain Codes

### Entity Domains

| Code | Name |
|------|------|
| MED | Healthcare Services |
| EDU | Education Services |
| ADM | Administrative Services |
| FIN | Finance & Banking |
| AGR | Agriculture Services |
| IND | Industrial Services |
| RET | Retail & Bazaars |
| FOO | Food & Beverage |
| SPO | Sport & Wellness |
| TRP | Transport & Logistics |
| TOU | Tour & Heritage |

### Non-Entity Domains

| Code | Name |
|------|------|
| AGR | Natural Assets |
| IND | Infrastructure |
| RET | Real Estate |
| REL | Religious / Cultural |
| TOU | Tourism Infrastructure |
| WAT | Water Resources |
| ENE | Energy & Power |

---

## Example CSV Content

### Entity Records
```csv
entity_name,record_type,primary_domain,category_pk,category_name,phone,visibility_type
"Hospital Trust","entity","MED","CAT-MED-101","Doctor","9876543210","Public"
"Clinic Plus","entity","MED","CAT-MED-102","Clinic","9876543211","Private/Home"
```

### Non-Entity Records
```csv
entity_name,record_type,primary_domain,category_pk,category_name,visibility_type
"Shop Space","non-entity","RET","CAT-RET-201","Retail Shop","","Public"
"Community Hall","non-entity","REL","CAT-REL-301","Hall","","Public"
```

---

## Workflow

```
1. Download template from Staging Area → Upload CSV tab
2. Populate CSV with required headers
3. Select record type (entity / non-entity)
4. Select domain + category (all records use same classification)
5. Upload .csv file
6. Review success count + any row errors
7. Approved records appear in "Approved" tab
8. Admin assigns geo/zone in Registry → Pending Assignment
```

---

## Troubleshooting

| Error | Cause | Fix |
|-------|-------|-----|
| `Skip row: entity_name is empty` | Missing name in row | Add entity_name column value |
| Upload rejected | Missing domain/category | Select domain + category before upload |
| File not accepted | Wrong format | Use `.csv` extension, comma-separated |

---

**Updated**: June 29, 2026  
**Version**: 3.0.0
