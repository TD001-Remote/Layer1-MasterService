# CSV Upload Guide

## CSV File Format Reference

### Required Headers

Your CSV file **must** include these headers (exact spelling, case-sensitive):

```csv
entity_name,phone,target_zone_pk,primary_domain,category_pk,category_name,visibility_type,website_zone_entity_id
```

---

## Column Descriptions

| Column | Required | Type | Example | Description |
|--------|----------|------|---------|-------------|
| `entity_name` | ✅ Yes | Text | "Sirkazhi Government Hospital" | Full legal name of the entity |
| `phone` | ⚠️ Optional | Text | "+91 4364 270414" | Contact phone number |
| `target_zone_pk` | ✅ Yes | Text | "ZON-TN-MAY-SIR-CITY1-AREA1-STR1" | Valid zone primary key |
| `primary_domain` | ✅ Yes | Code | "MED" | Domain code (MED, RET, EDU, etc.) |
| `category_pk` | ✅ Yes | Text | "CAT-MED-101" | Category primary key |
| `category_name` | ⚠️ Optional | Text | "Government Taluk Hospital" | Category display name |
| `visibility_type` | ✅ Yes | Enum | "Public" or "Private/Home" | Entity visibility |
| `website_zone_entity_id` | ⚠️ Optional | Text | "" | Associated website ID |

---

## Domain Codes

| Code | Domain Name |
|------|-------------|
| MED | Medicinal & Health |
| EDU | Education & Learning |
| ADM | Administrative Units |
| FIN | Finance & Banking |
| AGR | Agriculture Depots |
| IND | Industrial Plants |
| RET | Retail & Bazaars |
| FOO | Food & Beverage |
| SPO | Sport & Wellness |
| TRP | Transport & Logistics |
| TOU | Tour & Heritage |

---

## Example CSV Content

### Valid CSV Example

```csv
entity_name,phone,target_zone_pk,primary_domain,category_pk,category_name,visibility_type,website_zone_entity_id
"Sirkazhi Government Hospital","+91 4364 270414","ZON-TN-MAY-SIR-CITY1-AREA1-STR1","MED","CAT-MED-101","Government Taluk Hospital","Public",""
"Tamil Traditional Store","+91 94432 12345","ZON-TN-MAY-SIR-CITY1-AREA1-STR2","RET","CAT-RET-202","Traditional Clothing","Public",""
"Private Legal Office","+91 94431 82928","ZON-TN-MAY-SIR-CITY1-AREA2-STR5","ADM","CAT-ADM-315","Legal Consultant","Private/Home",""
```

---

## Validation Rules

### Automatic Validation Checks

When you upload a CSV, the system automatically validates:

1. **Entity Name**
   - ❌ Error if empty
   - Must be unique within the same zone (warning if duplicate)

2. **Phone Number**
   - ⚠️ Warning if empty for Public entities
   - Must be valid format if provided

3. **Zone PK**
   - ❌ Error if zone doesn't exist in database
   - Must match exact format

4. **Domain & Category**
   - Category must belong to selected domain
   - Must be active in the system

5. **Visibility Type**
   - Must be exactly "Public" or "Private/Home"

---

## Common Errors & Solutions

### ❌ "Missing required headers"
**Problem:** CSV headers don't match expected format  
**Solution:** Use the template download button to get correct headers

### ❌ "Invalid zone PK"
**Problem:** Zone doesn't exist in the database  
**Solution:** Check zone registry or create the zone first

### ❌ "Entity name is required"
**Problem:** Empty entity_name field  
**Solution:** Ensure all rows have entity names

### ⚠️ "Duplicate: Entity already exists"
**Problem:** Entity with same name exists in same zone  
**Solution:** Review if it's truly a duplicate or edit the name

### ⚠️ "Public entities should have phone"
**Problem:** Public entity missing phone number  
**Solution:** Add phone number or change to Private/Home

---

## Step-by-Step Upload Process

### Step 1: Download Template
1. Go to Staging Area page (`/staging`)
2. Click "Download CSV Template" button
3. Open in spreadsheet software (Excel, Google Sheets, etc.)

### Step 2: Fill Data
1. Fill in entity information row by row
2. Ensure required fields are populated
3. Use quotes around text with commas
4. Save as CSV format (.csv)

### Step 3: Upload
1. Drag CSV file into the upload zone, OR
2. Click the zone to browse and select file
3. Wait for parsing and validation

### Step 4: Review Results
1. Check the diagnostics panel
   - Red badges = Critical errors (must fix)
   - Yellow badges = Warnings (review recommended)
2. Click on rows to see detailed validation messages

### Step 5: Fix Errors (if any)
1. Select row to edit
2. Click "Edit" to enable editing mode
3. Correct the issues
4. Click "Save Correction"
5. Validation re-runs automatically

### Step 6: Compare with Paper Records (optional)
1. System shows side-by-side comparison with field book
2. Use "Align to Field book" if spelling differs
3. Ensures data matches physical records

### Step 7: Promote Valid Records
1. Click "Promote Selected" or "Promote All Valid"
2. Only records with 0 errors are promoted
3. Records move to active database
4. You're redirected to view the entities

---

## Tips & Best Practices

### ✅ Do's
- Use the template download feature
- Double-check zone PKs before upload
- Include phone numbers for public entities
- Review warnings even if not errors
- Compare with paper field records
- Test with small batches first

### ❌ Don'ts
- Don't use special characters in entity names
- Don't leave required fields empty
- Don't use invalid zone PKs
- Don't ignore validation warnings
- Don't upload files over 5MB
- Don't skip the review step

---

## Troubleshooting

### Upload Not Working?
1. Check file extension is `.csv`
2. Ensure file is not corrupted
3. Try opening in text editor to verify format
4. Re-download template and transfer data

### Validation Failing?
1. Review error messages carefully
2. Check zone registry for valid zone PKs
3. Verify domain codes match exactly
4. Ensure category belongs to selected domain

### Can't Find Zone PK?
1. Go to Geography page
2. Navigate to your street/area
3. Copy the zone PK from the details page
4. Use exact format in CSV

---

## Advanced Features

### Export Validated Records
After validation, you can export the validated records back to CSV:
1. Click "Export Valid Records" button
2. Downloads CSV with validation results
3. Includes warnings in separate column
4. Can be used for documentation

### Bulk Operations
1. Upload multiple rows at once
2. System validates all rows simultaneously
3. Fix individual rows as needed
4. Promote all valid records together

---

## Need Help?

If you encounter issues:
1. Check this guide first
2. Review error messages in staging area
3. Use preset simulation data to test
4. Verify zone PKs in geography section
5. Ensure domains and categories are active

---

**Pro Tip:** Start with the "Perfect Data" preset to see example of correctly formatted data, then use "With Errors" preset to understand validation messages.
