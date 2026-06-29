# Quick Reference — v3.0

## Key Routes

| Route | Purpose |
|-------|---------|
| `/login` | Firebase auth |
| `/dashboard` | KPI cards + tree panels |
| `/staging` | 5-tab staging (create / CSV / review / approved) |
| `/entity-registry` | Entity 3-mode registry |
| `/non-entity-registry` | Non-entity 3-mode registry |
| `/entity-assign` | Entity geo/zone assignment |
| `/non-entity-assign` | Non-entity geo assignment |
| `/entity-manage` | Entity soft-delete + recover |
| `/non-entity-manage` | Non-entity soft-delete + recover |
| `/dct-entity` | Entity-scoped DCT admin |
| `/dct-non-entity` | Non-entity-scoped DCT admin |
| `/geography` | Zone manager |
| `/sites` | Site provisioner |
| `/data-upload` | L1 → L2 JSON push + cron |

## Domain Quick List

| Code | Entity | Non-Entity |
|------|--------|------------|
| MED | Healthcare Services | — |
| EDU | Education Services | — |
| ADM | Administrative Services | — |
| FIN | Finance & Banking | — |
| AGR | Agriculture Services | Natural Assets |
| IND | Industrial Services | Infrastructure |
| RET | Retail & Bazaars | Real Estate |
| FOO | Food & Beverage | — |
| SPO | Sport & Wellness | — |
| TRP | Transport & Logistics | — |
| TOU | Tour & Heritage | Religious / Cultural |
| WAT | — | Water Resources |
| ENE | — | Energy & Power |

## DCT Workflow Shortcuts

| Action | Path | Who |
|--------|------|-----|
| Split domain | DCT Entity/Non-Entity → Domains → Split | Master-admin |
| Convert domain | DCT → Convert tab | Master-admin |
| Merge domains | DCT → Merge tab (multi-select) | Master-admin |
| Stop domain | DCT → Stop with redirect | Master-admin |
| Approve DCT change | DCT → Approval Queue | Master-admin only |
| Recover archived DCT | DCT → Archive tab → Recover | Master-admin |

## Keyboard Shortcuts

- `Ctrl/Cmd + Click` entity = open in new tab
- `Drag & Drop` CSV = upload
- `Tab` = navigate form fields
- `Enter` = submit form
- `Esc` = close modal / mobile menu

## Common Tasks

### Create Entity (no geo)
1. Staging → Create Entity tab
2. Fill name, phone, domain, category, roles
3. Submit → status: pending
4. Admin approves in Pending Review tab
5. Assign geo/zone in Entity Registry → Pending Assignment

### Bulk CSV Upload
1. Staging → Upload CSV tab
2. Download template
3. Select record type + domain + category
4. Upload `.csv`
5. Review success/error count

### Push L1 → L2
1. Data Upload page
2. Domain table: Preview / Download JSON / Push to L2
3. Enter Drive link (or auto-generate mock link)
4. Schedule cron (calendar icon) for 2-day interval
5. View history with copy-link

### DCT Split
1. DCT Entity/Non-Entity → Domains tab
2. Management Mode → Split Domain
3. Select source domain
4. Define 2+ new domains with category redistribution
5. Submit (master-admin direct / non-master-admin → approval queue)

---

## Field Reference

| Field | Required | Notes |
|-------|----------|-------|
| Entity Name | ✅ | Text |
| Non-Entity Name | ✅ | Text |
| Phone | ⚠️ optional | E.164 format recommended |
| Domain | ✅ | From DCT master |
| Category | ✅ | Cascades from domain |
| Type | ⚠️ optional | Cascades from category |
| State / District / Taluk | ✅ for entity | Cascading geo |
| Zone PK | ✅ entity / ⚠️ non-entity | Geography page |

## Status Badges

| Badge | Meaning |
|-------|---------|
| 🟢 Green | Active / Success |
| 🟡 Amber | Pending / Warning |
| 🔴 Rose | Stopped / Error |
| 🔵 Blue | Info / Neutral |

## Troubleshooting

| Issue | Fix |
|-------|-----|
| "isActive is not defined" | Fixed in v3.0 — NavLink children scoped correctly |
| CSV upload rejected | Check `.csv` extension, headers match template |
| Zone not found | Geography → create zone first, copy exact PK |
| Category empty | Select domain first — cascading filter |
| Type missing | Not all categories have types — normal |
| DCT change blocked | Non-master-admin → submit for approval |

---

**Version**: 3.0.0  
**Build**: passing (`npm run build`)  
**Docs last updated**: June 29, 2026
