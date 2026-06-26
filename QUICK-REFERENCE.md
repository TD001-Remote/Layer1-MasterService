# Quick Reference Card

## 🚀 New Features at a Glance

---

## 📤 CSV Upload
**Location:** Staging Area (`/staging`)

**Quick Steps:**
1. Drag CSV file into upload zone OR click to browse
2. Download template if needed (green button)
3. Review validation results (red = errors, yellow = warnings)
4. Edit inline if corrections needed
5. Click "Promote Valid Records"

**Template Download:** Green button - "Download CSV Template"

---

## ➕ Create Entity
**Location:** Registry Browser (`/registry`)

**Quick Steps:**
1. Click blue "Create Entity" button in header
2. Fill out form (name, phone, zone, domain, category, type)
3. Submit
4. View newly created entity

**Required Fields:**
- Entity Name ✅
- Zone/Location ✅
- Primary Domain ✅
- Category ✅
- Visibility Type ✅

**Optional Fields:**
- Phone Number
- Type (shown if available for category)

---

## ✏️ Edit Entity
**Location:** Entity Details Page

**Quick Steps:**
1. Click "Edit" button on entity details page
2. Modify fields (now includes Type selection)
3. Save changes

**New Feature:** Type selection dropdown (filtered by category)

---

## 🗂️ Taxonomy Hierarchy

```
Domain (11 options)
  └─> Category (filtered by domain)
        └─> Type (optional, filtered by category)
```

**Domains:**
- MED (Medical & Health)
- EDU (Education)
- ADM (Administrative)
- FIN (Finance & Banking)
- AGR (Agriculture)
- IND (Industrial)
- RET (Retail & Bazaars)
- FOO (Food & Beverage)
- SPO (Sport & Wellness)
- TRP (Transport & Logistics)
- TOU (Tour & Heritage)

---

## 🎨 UI Theme
**New Design:** Clean white panels throughout
- Light slate background (`#f8fafc`)
- White cards with subtle shadows
- Colored accents for different sections
- Better contrast and readability

---

## 🔗 Key Routes

| Route | Purpose |
|-------|---------|
| `/dashboard` | Main dashboard |
| `/geography` | Zone management |
| `/sites` | Site provisioning |
| `/staging` | **CSV upload & validation** |
| `/registry` | Browse entities |
| `/registry/create` | **Create new entity** |
| `/registry/:id` | Entity details |
| `/registry/edit/:id` | Edit entity |

---

## 🎯 Common Tasks

### Upload Survey Data
1. Go to `/staging`
2. Drag CSV file or click upload zone
3. Review validation
4. Promote valid records

### Create Manual Entry
1. Go to `/registry`
2. Click "Create Entity"
3. Fill form
4. Submit

### Edit Existing Entity
1. Go to `/registry`
2. Search/find entity
3. Click to view details
4. Click "Edit"
5. Make changes
6. Save

---

## ⚠️ Validation Rules

**Errors (Must Fix):**
- Empty entity name
- Invalid zone PK
- Missing required fields

**Warnings (Review Recommended):**
- Duplicate entity in same zone
- Public entity without phone
- Potential data quality issues

---

## 💡 Pro Tips

1. **Use Template:** Always download CSV template for correct format
2. **Test First:** Use preset simulation data to learn the system
3. **Small Batches:** Upload small CSV files first to test
4. **Review Warnings:** Don't ignore yellow badges
5. **Paper Check:** Use side-by-side comparison for field verification
6. **Type Optional:** Not all categories have types - that's normal

---

## 🆘 Troubleshooting

**CSV Upload Failed?**
- Check file is .csv format
- Ensure headers match template
- Verify zone PKs exist
- Review error messages

**Can't Find Zone?**
- Go to Geography page
- Create zone first if needed
- Copy exact zone PK format

**Category Not Showing?**
- Select domain first
- Categories filter by domain
- Check category is active

**Type Not Showing?**
- Select category first
- Not all categories have types
- Types are optional

---

## 📞 Field Definitions

| Field | Type | Required | Example |
|-------|------|----------|---------|
| Entity Name | Text | Yes | "Sirkazhi Hospital" |
| Phone | Text | No | "+91 4364 270414" |
| Zone PK | Code | Yes | "ZON-TN-MAY-..." |
| Domain | Code | Yes | "MED" |
| Category | Code | Yes | "CAT-MED-101" |
| Type | Code | No | "TYP-MED-101-01" |
| Visibility | Enum | Yes | "Public" or "Private/Home" |

---

## ✅ Status Indicators

- 🟢 **Green Badge** = Valid record
- 🔴 **Red Badge** = Critical error (must fix)
- 🟡 **Yellow Badge** = Warning (review recommended)
- ⚪ **Gray Badge** = Pending validation

---

## 🔑 Keyboard Shortcuts

- `Ctrl/Cmd + Click` on entity = Open in new tab
- `Drag & Drop` file = Upload CSV
- `Tab` = Navigate form fields
- `Enter` = Submit form

---

## 📊 Quick Stats

View real-time statistics on:
- Total entities by domain
- Validation error count
- Warning count
- Active vs stopped records

Location: Top of Staging Area & Registry pages

---

**Need Help?** Check the full guides:
- `FEATURE-IMPLEMENTATION-COMPLETE.md` - Complete feature docs
- `CSV-UPLOAD-GUIDE.md` - Detailed CSV instructions
- `IMPLEMENTATION-CHECKLIST.md` - Full feature list
