# CSV Test Files - Usage Guide

## 📁 TEST FILES CREATED

### 1. **test-entity.csv** (20 Healthcare Entities)
Contains 20 healthcare service providers with name and phone number.

**CSV Format:**
```csv
entity_name,phone
Apollo Hospital Mayiladuthurai,9876543210
Sri Ramakrishna Hospital,9876543211
```

**Column Specification:**
- `entity_name` (REQUIRED) - Name of the entity/service provider
- `phone` (OPTIONAL) - Contact phone number (10 digits)

### 2. **test-non-entity.csv** (20 Infrastructure Assets)
Contains 20 physical buildings and infrastructure.

**CSV Format:**
```csv
non_entity_name
Mayiladuthurai Bus Stand Building
Sirkazhi Railway Station Complex
```

**Column Specification:**
- `non_entity_name` (REQUIRED) - Name of the physical asset/building

---

## 🚀 HOW TO USE THESE TEST FILES

### **STEP 1: Navigate to Staging Area**
1. Open your browser: https://layer-1-masterservice-admin-panel.web.app
2. Click **"Staging"** in the navigation menu
3. Click the **"Upload CSV"** tab

---

### **STEP 2: Upload Entity CSV (test-entity.csv)**

#### A. Select Classification:
1. **Record Type:** Click **"Entity"** button (indigo/blue)
2. **Domain:** Select **"Healthcare Services"** (or any entity domain like "Food Services", "Education", etc.)
3. **Category:** Select **"Hospital Management"** (or relevant category like "Medical Clinic", "Diagnostic Center")
4. **Type (Optional):** Enter "Multi-Specialty" or leave blank

#### B. Upload File:
1. Click **"Download Template"** to see the format (optional - you already have test-entity.csv)
2. Click **"Choose File"** or the file input
3. Select **test-entity.csv** from your computer
4. File name appears: "test-entity.csv (X.XX KB)"
5. Click **"Upload & Create in Staging"** button (green)

#### C. Verify Upload:
1. Alert/notification shows "CSV upload will be implemented..."
2. Switch to **"Pending Review"** tab
3. You should see 20 entities listed under "Entities" section

#### D. Approve Records:
1. Review each entity (name, domain, category visible)
2. Click **"Approve"** button (green) for each entity
   - OR implement bulk approve in the future
3. Records move to **"Approved"** tab

#### E. Assign Geo/Zone:
1. Go to **"Entity Assignment"** page from navigation
2. Left column shows your 20 approved entities
3. Select each entity, fill geo/zone form (State/District/Taluk/Zone PK)
4. Click **"Assign to Registry"**
5. Entity moves to active registry

---

### **STEP 3: Upload Non-Entity CSV (test-non-entity.csv)**

#### A. Select Classification:
1. **Record Type:** Click **"Non-Entity"** button (green/emerald)
2. **Domain:** Select **"Infrastructure"** or **"Government Services"** (or any non-entity domain)
3. **Category:** Select **"Public Buildings"** or **"Infrastructure Assets"** (relevant category)
4. **Type (Optional):** Enter "Government" or "Public" or leave blank

#### B. Upload File:
1. Click **"Download Template"** to see the format (optional)
2. Click **"Choose File"**
3. Select **test-non-entity.csv** from your computer
4. File name appears: "test-non-entity.csv (X.XX KB)"
5. Click **"Upload & Create in Staging"** button (green)

#### C. Verify Upload:
1. Switch to **"Pending Review"** tab
2. You should see 20 non-entities listed under "Non-Entities" section

#### D. Approve Records:
1. Review each non-entity (name, domain, category visible)
2. Click **"Approve"** button (green) for each
3. Records move to **"Approved"** tab

#### E. Assign Geo (Zone Optional):
1. Go to **"Non-Entity Assignment"** page from navigation
2. Left column shows your 20 approved non-entities
3. Select each non-entity, fill geo form (State/District/Taluk)
4. Zone PK is OPTIONAL for non-entities (can leave blank)
5. Click **"Assign to Registry"**
6. Non-entity moves to active registry

---

## 📊 EXPECTED RESULTS

### After Entity CSV Upload:
- **Staging Area → Pending Review:** 20 entities
- All assigned to same Domain/Category/Type as selected in Step 1
- Each has entity_name and phone from CSV
- Status: "pending"

### After Non-Entity CSV Upload:
- **Staging Area → Pending Review:** 20 non-entities
- All assigned to same Domain/Category/Type as selected in Step 1
- Each has non_entity_name from CSV
- Status: "pending"

### After Approval:
- **Staging Area → Approved:** Records with "Ready for Assignment" badge
- Available in Entity Assignment / Non-Entity Assignment pages

### After Geo/Zone Assignment:
- **Entity Management / Non-Entity Management:** Records appear in Active view
- Searchable and manageable (Edit/Delete/Recovery)

---

## ✅ CSV FORMAT RULES

### Entity CSV Requirements:
```csv
entity_name,phone
Required Column,Optional Column
"Text value","10 digit number"
```

- **Header Row:** Must have `entity_name,phone` (case-sensitive)
- **entity_name:** Required, text, can have spaces and special characters
- **phone:** Optional, typically 10 digits, can be left blank
- **NO geo/zone fields:** Admin assigns after approval
- **Encoding:** UTF-8
- **Line Endings:** Windows (CRLF) or Unix (LF) both work

### Non-Entity CSV Requirements:
```csv
non_entity_name
Required Column
"Text value"
```

- **Header Row:** Must have `non_entity_name` (case-sensitive)
- **non_entity_name:** Required, text, can have spaces and special characters
- **NO geo/zone fields:** Admin assigns after approval (zone optional for non-entities)
- **Encoding:** UTF-8
- **Line Endings:** Windows (CRLF) or Unix (LF) both work

---

## 🎯 CSV EXAMPLES FOR DIFFERENT DOMAINS

### Healthcare Services (Entity):
```csv
entity_name,phone
City Hospital Trust,9876543210
Dr. Kumar's Clinic,9876543211
ABC Diagnostic Center,9876543212
```

### Food Services (Entity):
```csv
entity_name,phone
Annapoorna Restaurant,9876543210
Saravana Bhavan Owner,9876543211
Hotel Paradise Management,9876543212
```

### Education (Entity):
```csv
entity_name,phone
ABC School Trust,9876543210
XYZ College Administration,9876543211
Learning Center Pvt Ltd,9876543212
```

### Infrastructure (Non-Entity):
```csv
non_entity_name
Bus Stand Building
Railway Station Complex
Public Market Hall
```

### Real Estate (Non-Entity):
```csv
non_entity_name
Commercial Shop Space A-101
Residential Plot 25x40
Office Building Floor 3
```

### Government Services (Non-Entity):
```csv
non_entity_name
Collectorate Office Building
Taluk Office Complex
Revenue Department Block
```

---

## 🔧 TROUBLESHOOTING

### Issue: CSV Upload Button Disabled
**Cause:** Domain/Category not selected
**Solution:** Ensure you select Domain AND Category before uploading CSV

### Issue: "CSV upload will be implemented..." Alert
**Cause:** CSV parsing logic is placeholder (shows current implementation status)
**Solution:** This is expected - the CSV file selection works, full parsing to be implemented

### Issue: No Records in Pending Review
**Cause:** CSV not processed yet (implementation pending)
**Solution:** Check console for any errors, verify CSV format matches exactly

### Issue: Wrong Format Error
**Cause:** CSV header doesn't match expected format
**Solution:** 
- Entity CSV must start with: `entity_name,phone`
- Non-Entity CSV must start with: `non_entity_name`
- Check for extra spaces or typos

### Issue: Phone Number Validation
**Cause:** Phone numbers with dashes or spaces
**Solution:** Use plain 10-digit numbers: `9876543210` not `98765-43210`

---

## 📝 CREATING YOUR OWN CSV FILES

### Using Excel/Google Sheets:

1. **Create Columns:**
   - For Entity: Column A = "entity_name", Column B = "phone"
   - For Non-Entity: Column A = "non_entity_name"

2. **Add Data:**
   - Fill rows with your data
   - Entity phone can be blank (optional)

3. **Save as CSV:**
   - File → Save As
   - Format: CSV (Comma delimited) *.csv
   - UTF-8 encoding if available

4. **Verify Format:**
   - Open in text editor (Notepad, VS Code)
   - Check first line has correct headers
   - Check data rows have commas in right places

### Using Text Editor:

1. Create new file with `.csv` extension
2. Add header line:
   - Entity: `entity_name,phone`
   - Non-Entity: `non_entity_name`
3. Add data rows (one per line)
4. Save with UTF-8 encoding

---

## 🎓 BEST PRACTICES

### 1. **One CSV = One Classification**
- Each CSV file should contain records for ONE Domain/Category/Type combination
- Don't mix healthcare and education in same CSV
- Upload separate CSVs for different classifications

### 2. **Clean Data**
- Remove duplicate entries
- Verify phone numbers are valid
- Check for typos in names
- Ensure consistent formatting

### 3. **Batch Sizes**
- Start with small batches (10-20 records) to test
- Increase to 100-500 records for production
- Very large files (1000+) may need splitting

### 4. **Naming Convention**
- Use descriptive CSV filenames
- Examples: `hospitals-mayiladuthurai.csv`, `government-buildings.csv`
- Include date if multiple uploads: `hospitals-2026-06-27.csv`

### 5. **Backup Original**
- Keep a copy of original CSV before upload
- Save approved/rejected lists separately
- Document which CSVs were uploaded when

---

## 📈 TESTING WORKFLOW

### Test Scenario 1: Small Healthcare Entity Upload
1. Use provided `test-entity.csv` (20 records)
2. Domain: Healthcare Services
3. Category: Hospital Management
4. Verify all 20 appear in Pending Review
5. Approve all, assign geo/zone for 5 entities
6. Verify 5 appear in Entity Management

### Test Scenario 2: Infrastructure Non-Entity Upload
1. Use provided `test-non-entity.csv` (20 records)
2. Domain: Infrastructure
3. Category: Public Buildings
4. Verify all 20 appear in Pending Review
5. Approve all, assign geo (no zone) for 5 non-entities
6. Verify 5 appear in Non-Entity Management

### Test Scenario 3: Mixed Domains
1. Upload `test-entity.csv` with Healthcare domain
2. Upload another CSV with Food Services domain
3. Verify both appear separately in Pending Review
4. Approve and assign independently

---

## 🔗 RELATED DOCUMENTATION

- `FINAL-SYSTEM-STRUCTURE.md` - Complete system architecture
- `CSV-UPLOAD-GUIDE.md` - Detailed CSV upload guide
- `IMPLEMENTATION-PLAN.md` - Development roadmap
- `FINAL-ARCHITECTURE.md` - Entity vs Non-Entity structure

---

## ✅ VERIFICATION CHECKLIST

Before uploading CSV:
- [ ] CSV file format is correct (headers match exactly)
- [ ] All required columns present
- [ ] Data is clean (no duplicates, typos)
- [ ] Domain/Category selected in UI
- [ ] Record Type (Entity/Non-Entity) selected
- [ ] File size is reasonable (<5 MB)

After uploading CSV:
- [ ] Records appear in Pending Review
- [ ] Correct count (number of rows - 1 for header)
- [ ] Domain/Category assigned correctly
- [ ] Can approve individual records
- [ ] Approved records appear in Approved tab

After approval:
- [ ] Records available in Assignment page
- [ ] Can assign geo/zone
- [ ] Records move to Management page
- [ ] Searchable and editable

---

**Status:** ✅ TEST FILES READY FOR USE
**Last Updated:** June 27, 2026
**Files Location:** Project root directory

Start testing with these CSV files to verify your entire workflow from upload → approval → assignment → management!
